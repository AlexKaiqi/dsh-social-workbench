# Discourse Public Support Forum Platform Pack 设计

状态：`researched / fixture-eligible / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`discourse-public-support-forum/v0-design`

## 1. 定位与部署合同

本Pack描述“一个经批准的Discourse deployment”，而不是所有Discourse论坛的全局Connector。每个binding必须固定host、deployment owner、core版本证据、hosting类型、enabled plugin/site-setting能力、公开GET allowlist、guest可见范围、Terms/robots、rate policy、retention和valid window。

官方来源：[REST API docs](https://docs.discourse.org/)、[API documentation说明](https://meta.discourse.org/t/discourse-rest-api-documentation/22706)、[OpenAPI生成流程](https://meta.discourse.org/t/contributing-to-the-discourse-api-documentation/56693)、[rate limits](https://meta.discourse.org/t/available-settings-for-global-rate-limits-and-throttling/78612)、[topic完整posts说明](https://meta.discourse.org/t/fetch-all-posts-from-a-topic-using-the-api/260886)、[Discourse Solved](https://meta.discourse.org/t/discourse-solved/30155)。固定源码为[core `3c903588…`](https://github.com/discourse/discourse/tree/3c9035881b112539d2d22aefc374a806acd1df34)与[API docs `6737ac2a…`](https://github.com/discourse/discourse_api_docs/tree/6737ac2ab31321c6e0dedb76dd2d02fb145b54cb)。

本Pack不登录，不读取private message、user directory/email、admin、moderation queue或Data Explorer，不下载upload，不创建topic/post，不like、flag、invite、mark solved或修改任何站点状态。

## 2. 稳定概念与能力来源

| Concept / capability | `PublicDiscussion*`映射 | 状态 |
| --- | --- | --- |
| deployment/site | `DefinitionMetadata.DeploymentRef` + host/software/version/policies | fixture-eligible；live需approved roster |
| category/tag | container/tag taxonomy；category membership与tag分开 | fixture-eligible |
| topic | root thread；archetype/provider type保留 | fixture-eligible |
| post stream | root/answer/comment/reply record + parent/root relation | fixture-eligible；coverage显式 |
| search/list | search-summary或ranking representation + placement/query | fixture-eligible；不当canonical正文 |
| solved/accepted answer | `AcceptedResponseRef` + exact accepted relation + `AcceptanceCapabilityRef` | fixture-eligible only when Solved binding enabled/in-scope |
| locked/archived/visible | orthogonal provider state | fixture-eligible；不压成单一状态 |
| edits/moderation | history coverage或provider event | schema research；默认不取moderator/private detail |

Discourse Solved虽为官方bundled plugin，仍需在站点、category或tag范围启用。Pack把它登记为`bundled-extension` capability；若插件/setting/version/scope未知，则`accepted=false`也不能推断“没有解决方案能力”。solution标记只保留native state，不生成“问题已修复”结论。

## 3. API、分页与限流合同

- API key认证使用`Api-Key`和`Api-Username`；本Pack当前不接credential，guest GET和future authenticated read必须分开晋级。
- 官方OpenAPI由core request specs生成并同步到独立文档仓库，但官方明确不是所有endpoint都已文档化。浏览器network reverse engineering只能提出候选，不能直接进入allowlist。
- topic响应默认只含首批posts；完整post IDs由`post_stream.stream`给出，后续需按受支持route分批读取。`returned records`、`stream IDs`和`complete history`是三种不同coverage。
- rate limits是deployment-configurable。文档当前示例默认包括public IP 200/min与50/10sec、admin API 60/min、user API 20/min与2880/day；它们只作evidence，live预算必须更保守并以429/Retry-After为准。
- 任何undocumented JSON field、plugin field或HTML fallback都先触发schema drift；不能依赖Discourse数据库表，尤其Solved已出现存储迁移。

初始future GET allowlist仅允许由固定OpenAPI和deployment conformance共同证明的site/about、approved category/topic/post/search表示。method不是GET、path含admin/user/private-message/upload、或response出现越界identity字段时必须fail closed。

## 4. Skills、MCP与开源审计

- Discourse core在固定revision内发布`.skills`目录，内容面向Discourse工程开发，如migration、ACL、admin UI、site settings和tests；它们是稳定软件知识参考，不是公开论坛需求采集能力。
- [Discourse MCP v0.3.1](https://github.com/discourse/discourse-mcp/tree/e7fc32163e72c5e60f03ef2c4cad593b95afe107)由Discourse官方组织维护，MIT。它默认`read_only=true`、`allow_writes=false`，支持`--site`和toolsets，但也支持site selection、authenticated/private/admin/data explorer、远程tool discovery与显式写操作。
- 当前仅登记固定tag revision与静态审计结果，不安装、不执行、不调用真实论坛。未来若作为候选adapter，最低profile为：固定artifact digest、单站点`tethered`、`tools_mode=discourse_api_only`、仅search/topics等审核过的public read tools、无auth、无write、无private/admin/Data Explorer、独立network egress allowlist和output schema adapter。
- MCP自己的“read-only”标志不能替代本系统effect class、route allowlist、credential deny、output minimization与audit ledger。

Pack Skills：`discourse-deployment-contract-research/v1`、`discourse-forum-fixture-conformance/v1`和未来`discourse-approved-public-read/v1`。后者当前返回`capability-unavailable:no-authorized-deployment-binding`。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| topic返回20 posts但stream含85 IDs | body coverage=partial；不标complete，不静默漏失 |
| Solved plugin未证明 | accepted/solution capability=unknown；不把空字段当false |
| Solved仅在一个category启用 | capability scope保持category，不扩站点 |
| search result含excerpt | search-summary；不充当canonical post或完整history |
| topic locked但visible | 两个orthogonal states；不归为deleted |
| 429或rate setting drift | budgeted backoff/quarantine；不换HTML或更高权限 |
| plugin字段/schema变化 | 新definition revision；旧snapshot可追溯 |
| PM/admin/write/upload请求 | policy拒绝且zero external side effect |

Telemetry按`deployment × definition revision × capability roster × method/path × query/topic`记录requested/returned/stream-ID/coverage、pagination、429/backoff、schema/plugin/version/policy drift、identity/content drop、unsafe link/attachment拒绝和zero writes。live晋级需要evidence review、fixture conformance、用户批准deployment roster、sandbox canary、rights/retention和kill switch全部通过。
