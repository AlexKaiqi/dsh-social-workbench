# Typeform Survey Response Platform Pack 设计

状态：`researched` design；未发布、未连接、未执行  
核验日期：2026-08-26  
Pack ref：`typeform-owned-survey-response/v0-design`

## 1. 定位与稳定概念

Typeform 是自有 workspace、form、field/question、choice、logic、hidden/URL parameter、response、landing/submission、webhook、embed 与 result surface。Form definition 与 responses 是平台事实；问卷研究目的、sample frame、consent adequacy、匿名性和结论有效性不是平台自动保证。

Commercial 与 EU data center 的 API/MCP host、数据位置及功能条件不等价，必须固定 account host。Question `id` 与可配置 `ref` 都可能变化；definition revision 要以完整 reviewed form hash 为准，而不是只信 display title 或 form ID。

## 2. 官方 API 与生命周期

| 面 | 设计结论 |
| --- | --- |
| Auth | personal access token 或 OAuth2；read 默认仅 `forms:read responses:read webhooks:read workspaces:read`，write scopes 分 credential |
| Responses API | `GET /forms/{form_id}/responses`；默认 completed；支持 partial/completed、since/until、after/before、field filters；>1000 应分 window/cursor |
| freshness | 官方明确最近约 30 分钟 response 可能尚未出现在 pull API；实时依赖 webhook，pull 负责 backfill/reconcile |
| response state | completed、partial、started 的 time basis 不同；deprecated `completed` query 不再用于新 Pack，固定 `response_type` |
| webhook | 新 submission push；30 秒 timeout；特定状态重试 10 小时，其余 backoff；404/410 立即 disable，过量失败可自动 disable |
| security | HTTPS，valid certificate；可用 shared secret 对 raw body 做 HMAC-SHA256/base64，验证 `Typeform-Signature`；无固定 webhook IP range |
| delivery history | webhook delivery API 仅保留最近 30 天；不能当长期完整 ledger |
| deletion | response delete 是不可恢复 destructive write；跨 forms 的 RTBF 需要逐 form 查找/删除，不存在全局 response endpoint |
| form write | Create/PUT/PATCH/delete 与 publish semantics 分离；MCP 的 validate patch token 只是平台校验，不是 DSH approval |

官方依据：[OAuth scopes](https://developer.typeform.com/developers/get-started/scopes/)、[Retrieve responses](https://developer.typeform.com/developers/responses/reference/retrieve-responses/)、[Webhooks](https://developer.typeform.com/developers/webhooks/)、[Webhook security](https://developer.typeform.com/developers/webhooks/secure-your-webhooks/)、[MCP](https://developer.typeform.com/developers/get-started/mcp/)、[RTBF](https://developer.typeform.com/developers/responses/rtbf-custom-script/)、[URL parameters](https://developer.typeform.com/developers/create/url-parameters/)。

## 3. Capability proposal

| Capability | effect | 当前资格 |
| --- | --- | --- |
| `survey.list.owned-definitions/v1` | none/local fact | eligible-design：workspace/form exact definition与question refs |
| `survey.list.owned-responses/v1` | none/local fact | eligible-design：cursor/window backfill，response_type显式，30m freshness gap |
| `survey.receive.owned-response-event/v1` | local durable write | modeled：HMAC raw-body verify、response/token dedupe、durable-before-2xx、pull reconcile |
| `survey.read.owned-webhook-health/v1` | none/local fact | modeled：config + 30-day deliveries仅作短期health，不声称全历史 |
| `survey.create.owned-draft/v1` | platform write | deferred：draft definition/payload hash，禁止隐式 publish |
| `survey.publish.owned-instrument/v1` | user-visible platform write | deferred：exact form/workspace/audience/link/embed/close policy |
| `survey.configure.owned-webhook/v1` | platform/infrastructure write | deferred：HTTPS endpoint/secret/event type，独立授权 |
| `survey.delete.owned-response/v1` | destructive privacy write | deferred：exact form/response IDs，RTBF evidence与传播 |

默认只允许前两项设计。file/audio/video answers、contact/email/phone/address、hidden fields、network ID、referer/user agent、enrichment、contacts/automations、payment、scheduling、arbitrary search 与 MCP broad tools 均不进入默认 allowlist。

## 4. Definition、sample 与 response 语义

- fixed revision 包含 field id/ref/type、wording、required、choice/scale、validation、logic jumps、partial-submit points、variables/calculation、welcome/end/legal/checkbox、locale、hidden parameter declarations与publish state。
- Typeform UI 编辑删除 question/option 可能使关联结果丢失或改变 Insights；采集前必须 snapshot definition，历史 answer 只按当时 revision 解释。
- landed、started/staged、partial submit 与 completed submit 分开；partial submit point 是回答被服务器保存的界线，不能把浏览器本地 autosave 当平台 response。
- URL parameters/hidden、network ID、referer、user agent 和 response enrichment 会破坏“匿名”假设；network ID 是 IP 派生且可能多人共享/一人多值，不能作为 respondent identity 或 dedupe 真值。
- form owner 负责 respondent notice/consent；Legal/Checkbox question 是 instrument 组件，不证明 consent 自愿、specific、当前或可撤回。

## 5. OSS、MCP 与 Skills

| Artifact | 固定版本 | 许可/用途 | 结论 |
| --- | --- | --- | --- |
| [`Typeform/js-api-client`](https://github.com/Typeform/js-api-client/tree/bf265d214a15419a4e2a5dedcfdccd3d72fc06c6) | `v2.10.4`, commit `bf265d2…` | MIT；generated/typed API client | schema/fixture reference，不采用全读写 client面 |
| [`Typeform/embed`](https://github.com/Typeform/embed/tree/c212c1b607d686acb363b383a390c68711081eeb) | `v1.0.0`, commit `c212c1b…` | LGPL-3.0；embed runtime | display/callback fixture，不是 management Connector |
| [`airbytehq/airbyte/source-typeform`](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-typeform) | commit `1339a9e…`, connector 1.4.8 | ELv2 manifest-only；forms/responses/webhooks/workspaces等 | pagination/state regression reference；stream/field范围过宽，不直接复用 |

官方 hosted MCP 同时包含 forms write、contacts、automations等宽能力；虽有 validate-patch token 和“显式 publish”提示，仍是软 workflow，不是 capability-scoped Connector、approval gate 或 outbox。未发现需要安装的独立官方 survey-research Skill；MCP 方法只作权限负向样本。所有候选均未安装或执行。

## 6. 数据、合规与验证

默认只将 reviewed answer selectors 与 response lifecycle 放入 restricted payload/projection；email/phone/address/file/audio/video、hidden/URL params、network ID、referer/user agent、contact/enrichment和自由 metadata drop/quarantine。删除必须移除 canonical/evidence/index；Typeform 提示删除 response/form 不可恢复，且 delete form 级联 responses/files。

Typeform 明确 form owner 负责说明采集内容、用途和联系方式并取得 consent；EU hosting 只在特定套餐可用。上线前复核 [data responsibility](https://help.typeform.com/hc/en-us/articles/360029581691-What-happens-to-my-data)、[deleted data](https://help.typeform.com/hc/en-us/articles/360040196472-What-happens-to-deleted-responses-forms-and-accounts)、[abuse rules](https://help.typeform.com/hc/en-us/articles/360034113252-Report-Abuse) 与当前 terms/DPA/subprocessors。

fixture 覆盖：definition edit、field ref/id drift、choice deletion、logic branch、partial/completed不同time basis、30m pull lag、>1000 pagination、webhook-before-pull、duplicate/out-of-order delivery、HMAC invalid、30s timeout/retry/disable、30-day delivery gap、EU host、scope拒绝、hidden/network/enrichment PII、consent decline/withdraw、RTBF跨form与delete cascade。sandbox-live只用用户授权 synthetic workspace/form；写 capability保持 deferred。Canary监测 host/scope/schema、definition drift、pull lag/cursor gap、webhook retry/disable、partial mix、sample/consent coverage、PII quarantine、deletion propagation与零未授权write。
