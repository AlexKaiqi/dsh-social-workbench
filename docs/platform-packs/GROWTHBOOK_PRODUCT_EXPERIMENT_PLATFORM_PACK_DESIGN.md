# GrowthBook Product Experiment Platform Pack 设计

状态：`researched` design；未发布、未连接、未执行  
核验日期：2026-08-26  
Pack ref：`growthbook-owned-product-experiment/v0-design`

## 1. 定位与权威边界

GrowthBook 是自有产品 feature/experiment control plane，而不是公开需求源。其稳定概念包括 organization、project、environment、feature、feature revision、rule、experiment、phase、variation、assignment query、metric、result snapshot、review/publish gate 与 temporary rollout。用户自己的 warehouse/assignment table 是结果数据权威；GrowthBook 是实验定义、配置 revision、分析状态与聚合结果的权威之一。

SDK 在应用内本地确定性求值；SDK Connection Endpoint 是 environment/project-scoped、公开只读的已发布 flag definition 投影。它能验证 serving config，却不能替代管理 API、审批记录或 exposure fact。

## 2. 官方接入面

| 面 | 设计结论 |
| --- | --- |
| REST API | Cloud `https://api.growthbook.io/api`，self-hosted 使用其 API host；`/v1` stable，feature revision 等采用 `/v2`；Basic/Bearer |
| 权限 | Personal Access Token 继承用户权限；Secret Key 有 `readonly`/`admin`。设计只接受项目/环境受限的独立 read/write credential refs，拒绝共享 admin key |
| 限流/错误 | 60 req/min；429 必须退避；422 可能表示 validation、approval 或 publishing gate |
| 审批 | API 可通过 `ignoreWarnings`、`skipSchemaValidation`、`skipHooks` 或组织配置绕过部分 gate；因此 DSH 一次性审批不能委托给平台审批 |
| 结果 | GET 读取已有结果；POST snapshot 可能触发计算，必须建模成独立 operational-compute effect，不能伪装成纯读 |
| 已发布验证 | SDK endpoint 只读、无需认证，包含 weights、hash attribute/version、seed、namespace、coverage、conditions；只用于 config corroboration |

官方依据：[REST API overview](https://docs.growthbook.io/app/api)、[OpenAPI reference](https://docs.growthbook.io/api/)、[Experiments](https://docs.growthbook.io/experiments)、[Experiment configuration](https://docs.growthbook.io/app/experiment-configuration)、[Experiment results](https://docs.growthbook.io/app/experiment-results)、[Features](https://docs.growthbook.io/app/features)、[Publishing and approvals](https://docs.growthbook.io/features/publishing-and-approval-flows)、[Permissions](https://docs.growthbook.io/account/user-permissions)。

## 3. Capability proposal

| Capability | effect | 当前资格与边界 |
| --- | --- | --- |
| `experiment.read.owned-definition/v1` | none/local fact | eligible：project/environment/experiment/phase/variation/metric refs |
| `experiment.read.owned-integrity/v1` | none/local fact | eligible：SRM、multiple exposure、pre-exposure bias、variation mismatch、guardrail state及证据 |
| `experiment.read.owned-results/v1` | none/local fact | eligible：已有 snapshot；固定 phase、metric revision、window、denominator与health |
| `experiment.compute.owned-snapshot/v1` | provider compute/cost | deferred：POST snapshot 单独审批、预算、poll receipt；不得并入 read |
| `experiment.create.owned-draft/v1` | platform write | modeled：只建 draft experiment，不发布 flag rule |
| `feature.create.owned-draft-revision/v1` | platform write | modeled：精确 feature/environment/revision；禁止默认 publish |
| `experiment.request.owned-review/v1` | workflow/notification | modeled：平台审批与 DSH execution approval 分离 |
| `experiment.publish-and-start.owned-phase/v1` | serving + analysis | modeled：发布 experiment-ref rule 并开始 phase；高影响、一次性审批 |
| `experiment.stop-and-serve.owned-treatment/v1` | stop analysis + serving change | modeled：必须显式指定 treatment/temporary rollout 与 fallback，不接受“停止”简称 |
| `experiment.rollback.owned-treatment/v1` | serving rollback | modeled：独立 plan、preview、approval、receipt、reconcile |

默认 Pack 只允许前三项。写能力在 sandbox-live 通过前均为 `deferred`，且不存在 generic API passthrough 或 generic cancel。

## 4. 实验语义与生命周期

不可变 `ExperimentPhase` 必须固定 eligibility、assignment unit/method、hash attribute/version、seed ref、sticky bucketing、namespace/holdout、variation weights、activation/exposure trigger、metric definitions、conversion windows、analysis method、MDE、minimum sample/duration 与 stopping rule。改变 allocation、targeting、metric 或 assignment semantics 会追加 phase，不覆盖旧事实；默认不跨 phase pooling。

```text
draft design
  -> draft/revision + experiment-ref rule
  -> QA / external review
  -> publish-and-start (begin serving + analysis)
  -> assignments / real exposures / metrics / integrity
  -> human decision
  -> explicit stop-and-serve OR rollback
  -> receipt + published-config/result reconciliation
```

GrowthBook 的 stop 可选把 winner temporary rollout 到 100%；不 rollout 时 experiment-ref/fallback 的实际 serving 后果仍需按固定 API/version fixture 证明。因此 `ProbeCanceller` 不适用。assignment 也不等于 exposure：activation filter 若受 treatment 影响会产生选择偏差；A/A、SRM、multiple exposure 和 pre-exposure bias 均是 causal eligibility 的必要 integrity evidence。

## 5. Skills、MCP、SDK 与开源候选

| Artifact | 固定版本 | 许可/用途 | 结论 |
| --- | --- | --- | --- |
| [`growthbook/growthbook`](https://github.com/growthbook/growthbook/tree/57d07471b137eb43d9bfb1613d0a1203d21fef88) | release `v5.0.1`, commit `57d0747…`；OpenAPI info 5.0.1 | root mixed：非 enterprise 路径 MIT，enterprise 路径另有许可 | OpenAPI/schema/reference；每个路径单独审计，不执行服务端代码 |
| [`growthbook/skills`](https://github.com/growthbook/skills/tree/a2b9c1d2e519ad9abacf7d69277f76afcd0b3959) | commit `a2b9c1d…` | MIT；design/launch/analyze/stop 方法 | 仅复用实验设计与质量检查知识；launch/stop 属软确认写 workflow，不安装/执行 |
| [`growthbook/growthbook-mcp`](https://github.com/growthbook/growthbook-mcp/tree/d0522432e92f9260bd2cddde106a8cd4b65d5629) | `v2.1.0`, commit `d052243…` | MIT；通用 API passthrough | reject 作为 executor：GET/POST/PUT/PATCH/DELETE 范围过宽，确认是软约束 |
| [`growthbook/growthbook-golang`](https://github.com/growthbook/growthbook-golang/tree/1f72ec2c57f602dbaa6dc874901c9a914c312148) | `v0.2.9`, commit `1f72ec2…` | MIT；应用内 evaluation | assignment fixture/reference，不是管理 Connector |

官方 Skills 的好用原则包括 falsifiable hypothesis、尽量一个 primary、1–3 guardrails、MDE/sample/duration、A/A 与 activation-bias 检查；这些进入 advisory Skill，不构成授权。未知第三方代码均未安装或执行。

## 6. 数据、合规与推断

- 默认只取定义、聚合结果、integrity 与最小 receipt；不取 assignment table/user rows、attributes 或 warehouse credentials。
- scope、tenant、project、environment、phase 与 metric revision 必须隔离；SDK endpoint 即使公开也按 restricted experiment configuration 处理。
- 只有固定 assignment/exposure/metric/phase、完整 window 与 health pass，才允许 `InferenceCausal`；否则降为 directional/inconclusive。
- Customer Agreement 要求客户具备必要 consent/notice，并限制敏感数据；上线前复核 [Customer Agreement](https://www.growthbook.io/legal/customer-agreement)、[Privacy Notice](https://www.growthbook.io/legal/privacy-notice) 与 [AUP](https://www.growthbook.io/legal/acceptable-use-policy)。

## 7. 验证与晋级门

static/fixture 必须覆盖：weights 总和、hash determinism、namespace exclusion、sticky identity、activation bias、A/A、SRM、multiple exposure、pre-exposure bias、metric revision、phase change、snapshot compute effect、422 approval gate、API bypass attempt、unknown start/stop、stop with/without rollout、winner rollout 与 rollback reconciliation。

sandbox-live 只允许用户另行授权的 synthetic project/environment；分别使用 read/write credentials，逐条验证 draft 不发布、start 精确 serving effect、stop 精确 fallback/rollout、未知写不重试而 reconcile。通过后也只逐 capability 晋级，不让 MCP、Skills 或 SDK 继承成熟度。
