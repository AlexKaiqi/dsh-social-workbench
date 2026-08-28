# Formbricks Survey Feedback Platform Pack 设计

状态：`researched` design；未发布、未连接、未执行  
核验日期：2026-08-26  
Pack ref：`formbricks-owned-survey-feedback/v0-design`

## 1. 定位与事实权威

Formbricks 是自有 link、website 与 in-app survey 的设计、展示、response 和反馈管理平台。稳定概念包括 organization、project/workspace、survey、question、choice/scale、logic、segment/targeting、action/trigger、display、response、contact、single-use link、webhook 与 recontact policy。它是 survey definition、展示规则和原生 response lifecycle 的权威；研究目的、抽样合理性、consent 是否满足组织政策，以及回答能否支持需求结论仍由本系统与人审查。

Formbricks v2 文档已经用 workspace 取代 environment，但仍明确标为 Beta；v1 与 v2、Cloud 与 self-hosted host 必须作为不同 access-method revision，不能把最新源码 schema 套到旧部署。

## 2. 官方接入面与关键副作用

| 面 | 设计结论 |
| --- | --- |
| Management API | `x-api-key`；Cloud 常见 base 为 `https://app.formbricks.com/api/v1|v2/management`，self-hosted 固定其 own host/version |
| Client API | 无管理凭据，用于 display、create/update response 和 identify；它属于产品运行时，不是需求采集 Connector |
| API key | 可按 project/workspace/environment 分配 read、write、manage；read credential 只允许 GET，write 与 manage/delete 分离 |
| response read | v2 `GET /management/responses` 默认 50、最大 250，offset/skip，按 createdAt/updatedAt 与 survey/contact 过滤 |
| webhook | responseCreated/responseUpdated/responseFinished；创建/修改 webhook 是平台写，接收则是 push acquisition；签名、delivery/retry 契约需按 exact deployment 验证 |
| response write | Management `POST response` 会触发 webhooks、integrations、follow-up emails 等流水线，绝不是测试用 local fixture 或无害写入 |
| survey write | create/update/publish/close/delete 分离；publish 会改变真实用户 exposure，delete 可能级联数据，不进入默认 Connector |
| rate | self-hosted 文档列 management/webhook 100 req/min/API-key 等默认限制；Cloud、版本和部署配置必须由 live evidence 确认 |

官方依据：[REST API](https://formbricks.com/docs/api-reference/rest-api)、[API v2 Beta](https://formbricks.com/docs/api-v2-reference/introduction)、[Get responses](https://formbricks.com/docs/api-v2-reference/management-api--responses/get-responses)、[Create response](https://formbricks.com/docs/api-v2-reference/management-api--responses/create-a-response)、[Create webhook](https://formbricks.com/docs/api-v2-reference/management-api--webhooks/create-a-webhook)、[API key permissions](https://formbricks.com/docs/api-reference/generate-key)、[rate limiting](https://formbricks.com/docs/self-hosting/advanced/rate-limiting)、[recontact](https://formbricks.com/docs/app-surveys/recontact)。

## 3. Capability proposal

| Capability | effect | 当前资格 |
| --- | --- | --- |
| `survey.list.owned-definitions/v1` | none/local fact | eligible-design：exact host/API/project/workspace，保存 definition revision |
| `survey.list.owned-responses/v1` | none/local fact | eligible-design：默认 submitted/finished；partial 单独请求并标 state/consent/coverage |
| `survey.receive.owned-response-event/v1` | local durable write | modeled：response event 验签、delivery dedupe、durable-before-ack；配置 webhook 不包含在内 |
| `survey.read.owned-displays/v1` | none/local fact | modeled：仅 aggregate/opaque display facts；不展开 contact/person identity |
| `survey.create.owned-draft/v1` | platform write | deferred：draft only，exact survey definition hash |
| `survey.publish.owned-instrument/v1` | user-visible platform write | deferred：targeting/trigger/display/recontact/close policy 全部 preview/approve |
| `survey.close.owned-instrument/v1` | serving change | deferred：停止新展示，不等于删除 response |
| `survey.delete.owned-response/v1` | destructive privacy write | deferred：仅 data-subject/retention workflow，独立授权和 propagation receipt |
| `survey.create.owned-response/v1` | response/integration/follow-up write | rejected for testing and research Connector；synthetic fixture 也不得调用 production pipeline |

默认 Pack 只允许前两项 read proposal；push receiver 需先证明签名、重放、乱序、更新与删除/撤回传播。generic Management API、contacts/people、attribute classes、files、follow-up、integration 与 arbitrary Hub/MCP tools 全部拒绝。

## 4. Survey definition、response 与采样

`SurveyDefinitionMetadata` 必须固定 surface、问题 wording hash、question ref/type/required、choice/scale/validation、logic/branching、locale、target audience、selection/recruitment、incentive、recontact/fatigue、consent purpose/notice/withdrawal/retention，以及 anonymous/pseudonymous/identified/recontactable mode。

修改 wording、choice、scale、required、logic、targeting、trigger 或 consent 会生成新 definition revision；provider 原地更新 survey ID 不能改写旧 response。`responseCreated`、`responseUpdated`、`responseFinished` 是同一 response 的生命周期事件，不是三个独立 respondent；finished false 不自动等于 abandon，display 不等于 start，start 不等于 consent，finished 也不保证所有 required/branched question 对当前路径完整。

Formbricks in-app targeting 可基于 attributes/events/segments，并支持 show-once、until-submit、while-conditions-match 与全局 waiting time。它使样本更相关，也带来强选择偏差和 survey fatigue；任何“用户最需要 X”结论必须保留 eligibility、trigger、display percentage、recontact 与 non-response coverage。

## 5. 数据处理与推断边界

- 默认 allowlist：survey/question refs、回答值的 reviewed question selectors、response state/timestamps/language、必要的 recruitment ref；默认 drop/restrict contactId/userId、contact attributes、hidden fields、URL/source、country、user agent、display/single-use IDs 和自由 metadata。
- open text 是 subject-authored 证据，但只证明受访者在该问题/上下文中的回答；rating/NPS/CSAT 不自动等于 pain、需求、价值或 churn。
- anonymous 是调查设计主张，不等于 payload 中无可识别字段；pseudonymous/recontactable 仍属 personal data。
- partial、declined consent、test/demo/spam response 不得混入 submitted denominator；删除/withdrawal 需传播 canonical、evidence、projection 与 index。
- GDPR 指南明确 survey creator/controller 负责告知用途、保留期、取得 consent 并提供访问/删除路径；上线前复核 [GDPR FAQ](https://formbricks.com/gdpr)、[Privacy Policy](https://formbricks.com/privacy-policy) 与当前 terms/DPA。

## 6. OSS、SDK、MCP 与 Skills 审计

| Artifact | 固定版本 | 许可/用途 | 结论 |
| --- | --- | --- | --- |
| [`formbricks/formbricks`](https://github.com/formbricks/formbricks/tree/b39985ab2f8983803915be9b6e040a0518463ddb) | `5.3.4`, commit `b39985a…` | core AGPL-3.0；`apps/web/modules/ee` 独立 Enterprise license | API/schema/fixture/reference only；exact path 审计，不嵌入/执行 |
| [`formbricks/js`](https://github.com/formbricks/js/tree/3e97ca9bb14a99d33702c96b6c65ff084f955267) | `5.0.0`, commit `3e97ca9…` | MIT；browser survey runtime | display/identity fixture reference，不是 management Connector |
| [`airbytehq/airbyte/source-formbricks`](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-formbricks) | commit `1339a9e…` | ELv2 declarative source；v1 surveys/action/attribute/people/responses/webhooks | reject direct reuse：old v1、broad identified people、offset-only response surface；可作 regression/negative fixture |

固定 Formbricks repo 未发现官方 repo-owned Agent Skill package；讨论提案不能算官方能力。产品/Hub 出现的 AI/MCP/search surface 与 core survey API、许可和权限边界不同，当前一律 deferred；不允许以 natural-language search 绕过 question schema、consent、field handling 或 deletion。以上项目均未安装或执行。

## 7. Verification Plan 与晋级门

static/fixture 覆盖：v1/v2/workspace alias、definition update、新旧 response binding、offset race、createdAt/updatedAt window、created→updated→finished 乱序/重复、partial/submitted、branch-skipped question、consent decline/withdraw、anonymous payload 含 hidden/contact/meta、test/spam、recontact/display bias、read key 写拒绝、response POST pipeline 拒绝、webhook invalid signature、durable-before-ack、delete propagation 与 429。

sandbox-live 仅在用户授权的 synthetic self-host/Cloud workspace 中使用无真实联系人的假数据；先 read，再单独验证 webhook receiver。draft/publish/close/delete 保持 deferred，除非用户逐 capability 授权且具备 preview、one-time approval、unknown reconcile、rollback/close runbook。Operational canary 监测 API/version/host、key scope、definition drift、response lag/duplication/updates、webhook signature/retry、partial/consent mix、PII quarantine、deletion lag、sample/non-response coverage 与零未授权 platform effect。
