# LaunchDarkly Experimentation Platform Pack 设计

状态：`researched` design；未发布、未连接、未执行  
核验日期：2026-08-26  
Pack ref：`launchdarkly-owned-product-experiment/v0-design`

## 1. 定位与概念

LaunchDarkly 是自有产品 feature delivery 与 experimentation control plane。Pack 固定 project、environment、flag、variation、rule、flag config version、metric/event key、experiment、iteration、treatment、exposure、layer、holdout、approval 与 change-history 概念。Project/environment/flag rule/config version 共同确定 serving surface；experiment iteration 确定本轮 assignment、treatments、metrics 与 analysis config。

## 2. 官方接入与限制

| 面 | 设计结论 |
| --- | --- |
| REST | API access token；SDK/mobile/client IDs 不可调用；commercial、EU、Federal host 分离 |
| API version | 每个请求显式 `LD-API-Version: 20240415`；旧版本按官方计划于 2026-12-31 退役 |
| 权限 | 独立 service token，按 project/environment/resource/action custom role/inline policy 最小化；read/write token 分离 |
| rate limit | route、token、IP 各自限流；完整记录并遵守返回的 limit/reset headers |
| experiment | create 不等于 start；start iteration 是独立 semantic patch；修改 audience/variation/metric/hypothesis 会结束或产生新 iteration |
| stop | 正常 stop 要选择 winning treatment，并修改 flag targeting 使匹配 context 全部收到该 variation；还可能发 email/in-app/Slack 通知，绝非中性 cancel |
| exposure | flag evaluation event 才形成 experiment audience/exposure；单独 track metric 事件不形成 audience，identity/context 必须相关联 |
| results | REST `Get experiment results` 已 deprecated，未找到明确的新统计结果替代 API；新 Pack 不依赖该 endpoint |

官方依据：[REST API](https://launchdarkly.com/docs/api)、[API access](https://launchdarkly.com/docs/home/account/api)、[Experiments API](https://launchdarkly.com/docs/api/experiments)、[Start and stop](https://launchdarkly.com/docs/home/experimentation/start-stop-exp)、[Experiment events](https://launchdarkly.com/docs/home/experimentation/events)、[Results data](https://launchdarkly.com/docs/home/experimentation/results-data)、[Exposure validation](https://launchdarkly.com/docs/home/experimentation/exposure-validation)、[Metrics API](https://launchdarkly.com/docs/api/metrics)、[Approvals](https://launchdarkly.com/docs/home/releases/approvals/)、[Change history](https://launchdarkly.com/docs/home/releases/change-history)。

## 3. Capability proposal

| Capability | effect | 当前资格 |
| --- | --- | --- |
| `experiment.read.owned-definition/v1` | none/local fact | eligible：project/environment/flag rule/config version/current+previous iteration |
| `experiment.read.owned-lifecycle/v1` | none/local fact | eligible：not_started/running/stopped、mutable fields、approval/change refs |
| `experiment.read.owned-results/v1` | none/local fact | deferred：deprecated endpoint 不作为新依赖；等待官方 replacement 或授权 Data Export/warehouse/manual result receipt |
| `experiment.create.owned-draft/v1` | platform write | modeled；不启动、不改变 serving |
| `experiment.start.owned-iteration/v1` | serving/allocation + analysis + notifications | modeled；精确 flag/rule/config version 与 approval |
| `experiment.save-and-start.owned-iteration/v1` | new phase + reshuffle risk | modeled；definition change、新 iteration 与 re-randomization 显式 preview |
| `experiment.stop-and-serve.owned-treatment/v1` | stop analysis + flag targeting change + notifications | modeled；winner/baseline 明示，不能 generic stop/cancel |
| `experiment.rollback.owned-treatment/v1` | flag config rollback | modeled；独立审批、receipt、reconcile |

默认只允许前两项。metric event ingestion 使用 `events.launchdarkly.com` 且产生数据写入，不属于管理 Connector；Data Export 也必须是用户授权的独立 acquisition route。

## 4. 稳定语义与推断边界

- `ExperimentPhase` 对应 exact iteration，固定 flagConfigVersion、ruleId、randomization unit、treatments/allocation、baseline、metrics/versions、layer/holdout、data source 与 analysisConfig。
- restart 或 `saveAndStartNewIteration` 可能 reshuffle traffic；不把相同 experiment key 当相同 population，也不默认跨 iteration pooling。
- 运行中的 experiment snapshot metric version；stop/restart 可能采用最新 metric versions，必须形成新 definition relation。
- exposure 与 metric context 必须匹配；variation 与 track 相隔超过 90 天不会登记为相关 conversion。Hosted raw exposure tab 仅保留 30 天，不能声称完整长期审计。
- results freshness 随实验年龄变化，且 measurement window 会排除部分事件；watermark/completeness 必须进入 observation。
- causal 结论要求 exact iteration、真实 exposure、SRM/health、metric completeness 与未变更定义；否则降级。

## 5. Skills、MCP、SDK 与开源候选

| Artifact | 固定版本 | 许可/用途 | 结论 |
| --- | --- | --- | --- |
| [`launchdarkly/api-client-go`](https://github.com/launchdarkly/api-client-go/tree/c8ceead131eddbd89b976250f53cd5083530da6c) | `v24.0.0`, commit `c8ceead…` | Apache-2.0；generated REST client/schema | reference only；不实现、不执行 |
| [`launchdarkly/go-server-sdk`](https://github.com/launchdarkly/go-server-sdk/tree/74cda2898a0a9e761bdbb326057d0cc0e5f81303) | `v7.16.0`, commit `74cda28…` | Apache-2.0；应用内 flag evaluation/exposure | assignment/exposure fixture reference，不是管理 Connector |
| [`launchdarkly/ai-tooling`](https://github.com/launchdarkly/ai-tooling/tree/82ce1ba81a570d2cdfe992747200b5937751b7a9) | commit `82ce1ba…` | Apache-2.0；experiment setup/metric choose skills | 仅方法学；setup 能创建/start/stop，属 broad write workflow，不安装 |
| [`launchdarkly/mcp-server`](https://github.com/launchdarkly/mcp-server/tree/5617287c35f0f5726a30bb7b125fd6fb2db90745) | `v0.6.2`, commit `5617287…` | MIT；local MCP 主要 flag CRUD | reject 作为 executor；hosted/local surface 漂移且写面过宽 |
| [`airbytehq/airbyte`](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-launchdarkly) | commit `1339a9e…` | connector ELv2；metadata 存在、非声明式 manifest | read acquisition候选；不替代官方 management API，不继承写能力 |

`launchdarkly-experiment-setup` 会创建 metrics/experiment、start/stop iteration，并在 inconclusive 时选 baseline；这只是一个有用的风险样本，不能作为 DSH 的审批或 winner 决策。`metric-choose` 的 one primary、guardrail/countermetric、context-kind match、CUPED/percentile caveat 可进入 advisory Skill。

## 6. 合规、安全与验证

- token 永远停在 Host credential store；不进入模型、日志、Pack 或 Git。Experiment、flag targeting、context 属性与 raw events 默认 restricted。
- 平台 approvals 受 plan/role 影响，change history 某些套餐可能仅 30 天；DSH 必须保留最小不可变 preview/approval/intent/receipt/evidence，而不复制用户级数据。
- hosted MCP 的可用面和 commercial/EU/Federal 条件不等价；不作 fallback。
- 上线前复核 [Subscription Terms](https://launchdarkly.com/policies/subscription-terms/)、[AUP](https://launchdarkly.com/policies/aup/)、[DPA](https://launchdarkly.com/policies/data-processing-addendum/) 与当前 subprocessor 变更。

fixture 必须覆盖 API version/host、least privilege、flagConfigVersion conflict、layer exclusion、exposure absent、identity mismatch、90-day relation、metric revision、SRM、result lag、iteration reshuffle、approval required、unknown start、stop ships winner、notification effect、rollback 与 deprecated-results route rejection。sandbox-live 仅在用户另行授权的 synthetic project/environment 中逐 capability 验证；未知写不 retry，先 reconcile。
