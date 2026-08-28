# Owned Survey Feedback Channel Pack 设计

状态：`researched` 组合设计；成员 Pack 均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`owned-survey-feedback-demand/v0-design`

## 1. 目标与边界

问卷不是“把问题发出去并汇总答案”，而是一种主动测量：系统先固定要证伪的需求假设、问卷 instrument、sample/recruitment、consent 与 exposure policy，再收集 display/start/partial/submitted response，最后把回答作为有抽样边界的 subject-authored evidence。它不能自动代表全体用户、真实行为、支付事实或因果效果。

```text
research question / hypothesis
  -> immutable survey definition + sample/consent policy
  -> bias/privacy/ethics preflight
  -> external approval
  -> draft -> explicit publish/handoff
  -> display -> start -> partial/submitted
  -> webhook push + API backfill/reconcile
  -> field handling + deletion/withdrawal propagation
  -> evidence review + non-response coverage
```

成员：[Formbricks](FORMBRICKS_SURVEY_FEEDBACK_PLATFORM_PACK_DESIGN.md) 与 [Typeform](TYPEFORM_SURVEY_RESPONSE_PLATFORM_PACK_DESIGN.md)。Qualtrics 保留为 enterprise candidate；本轮未取得足以固定其 account/edition-specific API、权限、结果与实时 delivery surface 的公开证据，不借品牌成熟度进入成员 roster。

## 2. Channel Roster 与定义权威

同一研究可以在一个或多个平台分发，但每个 platform form/survey 都是独立 instrument member，不能按题目标题或相似答案拼接。

| 字段 | 必须固定 |
| --- | --- |
| owner/surface | exact organization/project/workspace/form/survey、Cloud/self-host/EU host与产品面 |
| purpose/hypothesis | 要理解或证伪什么；禁止收集“可能以后有用”的数据 |
| member Pack/access | exact Pack/API revision、read/push/write capability与credential partition |
| definition | wording/options/scale/required/validation/logic/locale/partial point/ending/definition hash与valid window |
| sampling | target population、frame、selection、recruitment source、incentive、quota、sample target与known biases |
| exposure | invitation/link/embed/trigger/targeting/display percentage、recontact/fatigue、open/close window |
| respondent mode | anonymous、pseudonymous、identified、recontactable；定义允许字段而非营销标签 |
| consent | purpose/notice/question/legal basis、requiredness、withdrawal/contact、retention与第三方/enrichment |
| response | displayed/started/partial/submitted/disqualified/test、time basis、language、definition revision |
| handling | question-level sensitivity/selectors、drop/restrict/quarantine、free text、files/media、deletion propagation |
| coverage | invitations未知/已知、displays、starts、partials、submits、non-response、branch/item missing、spam/test、API/webhook lag |

题目 wording、choice/scale、logic、required、targeting、consent 或 respondent mode 变化即新 `SurveyDefinitionMetadata.Revision`。只有用户确认 exact equivalence，并通过 wording/translation/choice/scale/logic/sample bridge fixture，跨平台题目才可投影到共同 concept；即使可比也保留 member-native response，不合并原生 identity。

## 3. Response、Evidence 与推断

| Source fact | 可形成的 evidence | 禁止自动推断 |
| --- | --- | --- |
| submitted open-text answer | subject-authored statement under exact question/context | 客观事实、普遍需求、实际行为、愿付价格 |
| rating/scale/choice | declared preference/assessment under exact scale/options | pain severity真值、满意度之外的价值或churn |
| partial answer | partial subject statement if consent/retention permits | completion、其余题目拒绝、abandon原因 |
| display/start/submit counts | instrument exposure/response funnel | population interest、无偏 response rate（若invite/frame未知） |
| legal/checkbox true | platform-recorded answer | consent 法律有效性、永久有效或覆盖其他purpose |
| no response | non-response under known recruitment/exposure | 没需求、反对或不满意 |
| identified/recontactable answer | authorized feedback + separate contact relation | 允许自动外联、跨平台identity join |

free text 进入 EvidenceSpan 时 authorship 可为 subject-authored，但问题文本、answer locator、definition revision、sampling/consent/coverage、translation和counter-evidence必须同行。Platform-generated AI summary/theme 只能是 derived proposal，不能替代原文或伪装为受访者 quote。

## 4. 共同 capability 与 Skills

共同 read/push proposal：

- `survey.list.owned-definitions/v1`
- `survey.list.owned-responses/v1`
- `survey.receive.owned-response-event/v1`
- `survey.observe.owned-delivery-health/v1`

共同写能力仅作未来模型：`survey.create.owned-draft/v1`、`survey.publish.owned-instrument/v1`、`survey.close.owned-instrument/v1`、`survey.delete.owned-response/v1`。配置 webhook、发 invitation/reminder、创建 synthetic response、contact/enrichment 与 follow-up email 都是独立 effect，不包含在 publish/read 中。

### `owned-survey-feedback-research/v1`

研究官方概念/API/auth/scope/rate/webhook/version/terms/privacy、固定 OSS/SDK/MCP/Skill；仅生成 Pack/roster/definition proposal，不安装、不连接、不发布。

### `owned-survey-design/v1`

proposal-only：研究问题、sample frame、one-primary learning goal、neutral wording、choices/scales、open/closed mix、logic、consent、sensitive-data review、pilot、non-response/analysis plan、close/withdraw/delete plan。不得创建平台对象或把模板当验证过的 instrument。

### `owned-survey-feedback-acquire/v1`

按 member 分别 resolve read/push；固定 definition first，再读取 response；webhook durable-before-ack，pull backfill/reconcile。只输出 native observations + definition/consent/handling/coverage metadata + reviewed common projection；禁止 contacts、hidden/network/user-agent、files/media、MCP search fallback与平台写。

### `owned-survey-feedback-execute/v1`

未来契约：draft、publish、close、delete 各自 preview -> external one-time approval -> immutable intent/outbox -> receipt/reconcile。Agent 不可审批、自动选 sample、发送 invite/reminder、publish 或 recontact；unknown publish/close 必须先核对 live instrument state，禁止重发或跨平台 failover。

### `owned-survey-feedback-conformance/v1`

fixture 默认无网络；验证 definition binding、response lifecycle、webhook/pull reconciliation、field handling、consent/withdrawal、sampling/coverage、deletion 与零越权。sandbox-live 只在用户另行授权的 synthetic workspace。

## 5. DataHandling、伦理与执行安全

- 只问回答研究问题所需的最少内容；密码、支付/银行、政府身份、健康/生物、精确位置、未成年人等敏感信息默认 blocker，除非另有专门合法合规设计。
- contact/recontact consent 与 research participation consent 分开；拒绝、退出、关闭窗口后不继续展示/提醒。
- incentive、quota、购买 panel 和 enrichment 会改变 sample 与第三方数据流，必须独立列入 policy/evidence，不能藏在 platform setting。
- anonymous/pseudonymous/identified 不可在采集后自动升级；只有用户明确授权且存在 exact relation 才能连接 CRM/product usage，默认只做 aggregate/thresholded comparison。
- publish 是真实用户 exposure，close 是 serving change，delete 是不可恢复 privacy write；每项需要精确 effect、回执和对账。
- response write 可能触发 integration/follow-up，不作为 conformance 测试方法；fixture 在本地生成，live 由人工 synthetic respondent 完成。

## 6. Verification Plan

### static-contract / fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| wording/choice/scale/logic变化 | 新 revision；旧 response 解释不变 |
| same title/question across members | 不自动等价；无 bridge 不汇总 |
| translated wording/scale reversed | translation/scale relation显式，不按ref合并 |
| display→start→partial→submit乱序/重复 | 同一response lifecycle合并，可追溯且幂等 |
| webhook before pull / pull lag | push先入账，pull corroborate，不重复response |
| invalid signature / retry / disable | 拒绝或degraded，durable-before-ack |
| partial/branched item missing | 区分not-shown、skipped、unanswered、unknown |
| consent declined/withdrawn | 不形成普通evidence；级联restrict/delete/supersede |
| anonymous payload有contact/hidden/network/meta | drop/quarantine，匿名claim降级 |
| test/demo/spam/duplicate | exclusion有证据，不污染sample denominator |
| unknown invitations or display coverage | response rate denominator unknown，不声称representative |
| incentive/panel/enrichment | sampling/third-party bias与rights显式 |
| API key attempts write / broad MCP | policy拒绝，零external effect |
| unknown publish/close | 不重试；reconcile live definition/serving state |
| response/form deletion | tombstone和canonical/evidence/index传播；不保留原文 |

### sandbox-live / operational-canary

经用户授权后，在两个 synthetic member 中用非真实身份运行一份短 pilot，验证 definition snapshot、人工提交、webhook/pull reconcile、partial、consent decline、close 和 deletion propagation；真实用户 publish 仍需另行授权。Canary 监测 Pack/API/host/key scope、definition/translation drift、webhook signature/retry/disable、pull lag/cursor/offset gap、partial/non-response、PII quarantine、consent/withdrawal、sample bias、delete backlog、unknown writes 与零自动 invite/recontact。

## 7. Go 抽象影响

本轮只增加平台无关静态知识：`SurveySurface`、`SurveyRespondentMode`、`SurveyResponseState`、`SurveyConsentState`、`SurveyQuestionDefinition`、`SurveySamplingPolicy`、`SurveyConsentPolicy`、`SurveyDefinitionMetadata` 与 `SurveyResponseMetadata`；`Observation`/`SourceItemCandidate` 可附 response metadata。答案和身份字段继续留在 schema-bound restricted payload；未引入 Formbricks/Typeform SDK类型、client、credential或真实 Connector。

## 8. 晋级缺口

两成员均停在 `researched design`。晋级至少需要：固定 API/schema fixtures、question-level handling profiles、read-only least privilege、webhook signature/delivery conformance、synthetic workspaces、manual respondent pilot、deletion/withdrawal drill、sample/non-response report、operational owner。Formbricks v2 Beta 必须持续监控；Typeform 最近-response lag 与 webhook delivery 30-day retention 需要组合 reconcile 证明。
