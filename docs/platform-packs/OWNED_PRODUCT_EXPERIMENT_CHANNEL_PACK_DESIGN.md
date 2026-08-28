# Owned Product Experiment Channel Pack 设计

状态：`researched` 组合设计；成员 Pack 均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`owned-product-experiment-demand/v0-design`

## 1. 目标与系统边界

该 Channel 把自有产品中的受控实验作为主动 Probe：以可交付、真实且合规的 treatment 测试产品假设，保存 assignment、真实 exposure、metric 与完整性证据，再由人做学习结论。它不是自动增长机器人、feature-flag 管理器、用户级监控系统或自主因果引擎。

```text
Demand hypothesis
  -> immutable experiment design + phase
  -> preflight / ethics / power / data health
  -> external one-time approval
  -> exact lifecycle capability
  -> assignment != exposure -> metrics + integrity
  -> human decision
  -> explicit stop / serve treatment / rollback
  -> receipt + reconciliation + learning review
```

成员：[GrowthBook](GROWTHBOOK_PRODUCT_EXPERIMENT_PLATFORM_PACK_DESIGN.md) 与 [LaunchDarkly](LAUNCHDARKLY_EXPERIMENTATION_PLATFORM_PACK_DESIGN.md)。Statsig 保留为后续候选：其质量检查与 Console API 值得继续研究，但本轮未确认一个适合新 Pack 的、非 deprecated 且可确定性读取统计结果的完整公开面。

## 2. Roster 与稳定定义

每个 experiment/phase 是独立执行单元；不在平台间 failover、重试、复制 assignment 或混合 population。`ChannelRosterRevision` 至少固定：

| 维度 | 必须固定 |
| --- | --- |
| product surface | exact product/environment/feature/flag/rule 与 owner；不从名称猜 |
| member authority | 唯一 serving+assignment authority；analytics source 可以供 metric，但不因此成为同一实验 |
| hypothesis/treatment | falsifiable statement、primary variable、control/baseline、truthful/fulfillable treatment refs |
| eligibility | targeting/exclusion、consent、sensitive segment、公平与伤害边界、valid window |
| allocation/assignment | weights、unit、method、hash/seed version、sticky/reassignment、namespace/layer/holdout |
| exposure | 用户真正体验 treatment 的 trigger、dedupe、attribution unit/window 与 lag |
| metrics | one primary、guardrails/countermetrics、定义 revision、direction、window、denominator与completeness |
| analysis | Bayesian/frequentist/provider-defined、MDE、power/sample、minimum duration、threshold、sequential/correction/CUPED/stop rule |
| lifecycle | draft/publish/start/stop assignment/stop analysis/serve treatment/rollback 的确切 serving、analysis、notification effect |
| evidence | API/schema/Pack/version、definition hash、approval、intent、receipt、published state、results watermark与integrity |

allocation、eligibility、assignment、exposure、treatment、metric 或 analysis semantics 任一改变，必须追加 `ExperimentPhase`/provider iteration。跨 phase 默认不 pooling；只有预先声明且可验证的 carryover model 才能关联。

## 3. Exact lifecycle，不使用 generic cancel

“start”“stop”“restart”是平台 UI 动词，不是稳定能力。共同抽象使用 `ExperimentLifecycleIntent`，分别声明 `ServingEffect`、`AnalysisEffect`、treatment、notification 与 definition transition：

| 用户意图 | 允许的精确 effect |
| --- | --- |
| 保存设计 | create draft；serving/analysis unchanged |
| 发布 treatment config | publish config；不默认开始 assignment |
| 开始 phase | begin allocation + start analysis；可能通知 |
| 停止分配 | end allocation；必须说明之后谁获得什么 |
| 停止分析 | analysis stop；若平台同时改变 serving，不能伪装成此能力 |
| 采用 treatment | serve exact variant to exact eligible population |
| 回滚 | restore exact reviewed config/revision |

GrowthBook stop 可带 100% temporary rollout；LaunchDarkly stop 会选 winner 并改变 flag targeting。两者都不能映射为 `ProbeCanceller`。若 provider 没有中性的 stop-analysis/stop-assignment 原语，Connector 必须拒绝该 capability，而不是组合隐藏写操作。

## 4. Channel Skills

### `owned-product-experiment-research/v1`

只研究并版本化官方 concepts/API/auth/permissions/rate/approval/lifecycle/results/privacy/terms，固定 SDK/OpenAPI/Skills/MCP/OSS 候选，形成 Pack proposal。不得安装/执行工具、创建项目/flag/metric/experiment、发事件或读取客户数据。

### `owned-product-experiment-design/v1`

输入 hypothesis 与 roster，输出 proposal-only：treatments、eligibility、phase、primary/guardrails、MDE/sample/duration、A/A、assignment/exposure、integrity、ethics、stop/rollback。不能发布或授权自己。

### `owned-product-experiment-acquire/v1`

只读 exact definition/lifecycle/aggregated result/integrity/receipt；默认无 raw identities/events/attributes。若结果 API 缺失或 deprecated，输出 deferred/manual/authorized-export requirement，禁止 MCP/UI scraping fallback。

### `owned-product-experiment-execute/v1`

仅作为未来契约：exact capability resolution -> preview -> external one-time approval -> immutable intent/outbox -> one attempt -> receipt -> reconcile。Agent 可准备 plan，不可审批、选 winner 或自动执行；unknown write 不 retry。每项 lifecycle effect 单独批准，write credential 与 read credential 分离。

### `owned-product-experiment-conformance/v1`

验证 phase determinism、serving effects、assignment/exposure/metric relation、integrity、approval、unknown/reconcile、data handling 与零越权。fixture 默认无网络；sandbox-live/operational-canary 必须用户另行授权。

## 5. Evidence 与因果资格

assignment 事实不等于 exposure，exposure 不等于 conversion，conversion difference 不自动等于 causal effect。`InferenceCausal` 仅在以下条件同时成立时可用：exact immutable phase；确定性且健康的 assignment；可解释的真实 exposure；identity/context 一致；metric revision/window/delay 完整；sample/required duration 满足；SRM/crossover/pre-exposure bias/definition drift 等检查通过；没有未审查的 allocation/targeting change。

否则必须输出 directional/inconclusive/invalidated，并保存 counter-evidence。平台显示“winner”只是 provider analysis observation；最终 `LearningReview` 仍由人确认，并同时看 primary、guardrails、harm/fairness、practical significance 与外部业务事实。

## 6. DataHandling、伦理与安全

- aggregate-first；unit refs 只用 scope-local opaque identifiers，不建立跨平台身份图，不向 Agent 暴露 raw assignment/event rows。
- 不在高风险、敏感或无法知情/退出的场景偷偷操纵用户；不得测试欺骗、不可履约承诺、dark pattern、歧视性定价或安全关键降级。
- exposure、metric 与 context data purpose-bound、最小字段、短 retention；删除/correction/consent change 必须传播到 projection。
- platform approval 不能替代 DSH approval，DSH approval 也不能绕过组织 change management；任一门拒绝即停止。
- budget 同时包含流量、样本、时长、用户 harm、通知、provider compute 与工程 rollback budget，而非只有 API cost。

## 7. Verification Plan

### static-contract / fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| weights 不为 1,000,000 ppm / variant 缺失 | preflight blocker，零外部 effect |
| same seed/phase | assignment deterministic；phase change 不冒充同一 population |
| namespace/layer overlap | mutual exclusion生效或拒绝 |
| assigned but no real exposure | 不计 audience/conversion denominator，不做 causal claim |
| activation affected by treatment | bias finding，不能用 activation filter 修剪样本 |
| A/A、SRM、crossover、pre-exposure bias | integrity state/evidence正确；fail 时 invalidated |
| identity/context switch | relation unknown；不跨 identity 拼 exposure/metric |
| late metric / partial window | provisional/incomplete；不提前 stop |
| allocation ramp / metric edit / restart | 新 phase/iteration；旧结果不被重写或默认 pooling |
| approval bypass parameter | DSH policy拒绝，即使 provider API允许 |
| unknown start/stop | 不 retry；进入 reconcile，核对 serving+analysis+notification |
| provider stop ships treatment | preview/approval 明示 exact variant/population；generic cancel拒绝 |
| rollback conflict | CAS/config revision conflict，停止并人工处理 |
| broad MCP/Skill attempts write | policy拒绝，零 external effect |
| raw ID/property appears | drop/quarantine；不可进入模型、日志或索引 fixture |

### sandbox-live / operational-canary

仅在 synthetic environment 验证 draft 不发布、start 的 exact allocation/exposure、result lag、stop 的真实 serving 后果、rollback 和 unknown reconciliation。Canary 监测 API/version/host、permission、schema、phase/config drift、assignment distribution、exposure lag、SRM/crossover、metric watermark、approval/notification、unknown writes、rollback readiness 与零未审批 effect。

## 8. Go 抽象影响

本轮仅增加静态契约：`ExperimentAllocation`、`ExperimentAssignmentPolicy`、`ExperimentExposurePolicy`、`ExperimentAnalysisPolicy`、不可变 `ExperimentPhase`、`ExperimentLifecycleIntent` 及 serving/analysis effect enums；assignment、exposure 与 metric observations 新增 `PhaseRef`；`MetricQuality` 可附 `ExperimentIntegrityCheck`。`ProbeCanceller` 注释明确不适用于会隐含改变 serving/analysis 的 experiment stop。未增加 provider SDK 类型、client、凭据或真实执行实现。

## 9. 晋级缺口

两名成员均停在 `researched design`。晋级至少需要：固定 schema fixture、least-privilege policy、synthetic environments、用户逐 capability 授权、真实 start/stop/rollback effect 验证、unknown reconciliation drill、PII negative fixtures、operational owner 与 kill/rollback runbook。LaunchDarkly 统计结果还需非 deprecated 官方 acquisition surface；GrowthBook snapshot compute 需独立 cost/effect contract。
