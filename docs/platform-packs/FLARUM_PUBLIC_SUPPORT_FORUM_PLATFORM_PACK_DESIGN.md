# Flarum Public Support Forum Platform Pack 设计

状态：`researched / fixture-eligible / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`flarum-public-support-forum/v0-design`

## 1. 定位与版本边界

本Pack描述一个经批准的Flarum deployment。Flarum刻意保持minimal core，bundled和third-party extensions可以增删fields、relationships、routes与权限；因此software family只能提供能力模板，deployment extension roster和现场schema conformance才是读取合同。

官方来源：[extension architecture](https://docs.flarum.org/extend/)、[backend/API architecture](https://docs.flarum.org/extend/start/)、[Consuming the REST API](https://docs.flarum.org/rest-api/)、[framework `29da25de…`](https://github.com/flarum/framework/tree/29da25dec7418274bf476d93322bc0eb89e1f237)。framework为MIT。核验时v1.8.19是latest stable，v2.0.0-rc.7仍是pre-release；1.x与2.x schema、extensions和文档不能混成一个definition。

本Pack不登录、不使用API key/access token、不读non-public discussions或user data，不调用POST/PATCH/DELETE，不操作extension/admin，不跟随附件或执行HTML/Markdown/代码。

## 2. 稳定概念与JSON:API表示

| Concept / capability | `PublicDiscussion*`映射 | 状态 |
| --- | --- | --- |
| deployment/forum | definition + owner/host/software/version/extension roster | fixture-eligible |
| discussion | root thread；attributes与relationships按schema revision | fixture-eligible |
| post/comment | record + parent/root/reply relation | fixture-eligible |
| tag | tag taxonomy或container由exact deployment semantics决定 | fixture-eligible |
| JSON:API `data` | requested primary representation | fixture-eligible |
| `included` | related representations；不自动等于完整post history | fixture-eligible |
| `links.next` / `page[offset]` | pagination policy与coverage | fixture-eligible |
| extension-added field/route | capability origin/component/version/schema | fixture-eligible only after roster/conformance |

官方文档说明backend公开API供frontend使用并遵循JSON:API风格，但REST endpoint文档仍在完善；extensions可以增加endpoint和attribute。浏览器devtools可以帮助人类发现现场调用，却不能把未版本化请求直接固化为稳定Connector合同。

Guest `GET`只应返回guest可见内容，但真实visibility仍由部署权限决定。`/api/discussions`常见响应中的`included` posts可能是筛选后的关系集合；Pack分别记录primary discussions、included posts、relationship linkage与全历史coverage，禁止由`included`存在推断complete。

## 3. 部署Schema与能力合同

每个binding至少保存：

- deployment host/owner/hosting、Flarum exact major/minor evidence与valid window；
- enabled core/bundled/third-party extension component、版本、scope与configuration evidence；
- guest-only exact GET method/path/query/include/sort/filter allowlist；
- JSON:API resource types、attributes、relationships、pagination/error schema revision；
- Terms、robots、content/identity/attribution、rate、retention/deletion政策；
- content safety、unknown extension field quarantine、attachment/URL deny和kill switch。

若无法取得extension roster，可为公开route建立“observed capability”binding，但origin/version保持unknown，valid window更短且live不得超过已验证字段。schema drift会生成新definition proposal，不允许丢弃unknown fields后假装完全兼容。

## 4. Skills与开源审计

截至核验日，Flarum官方组织未发现面向公开论坛研究的Agent Skill或MCP server。官方framework和docs是核心静态参考。

[flagrow/flarum-api-client](https://github.com/flagrow/flarum-api-client)是MIT历史PHP client，仓库已于2021归档。它的示例包含master key、非公开discussion和admin-context能力，且早于当前1.8/2.x演进，因此只作历史协议证据并拒绝作为Connector：不安装、不执行、不接credential。

Pack Skills：`flarum-deployment-contract-research/v1`、`flarum-jsonapi-fixture-conformance/v1`和未来`flarum-approved-public-read/v1`。当前live skill返回`capability-unavailable:no-authorized-deployment-binding`。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| 1.8 fixture与2.x deployment | version mismatch quarantine；不自动兼容 |
| extension增加solution field | extension capability binding；不当core字段 |
| `included`只有部分posts | reply/history coverage=partial |
| `links.next`存在 | 按budget继续或记录truncated；不标complete |
| unknown relationship/resource type | quarantine + schema drift；不静默丢弃 |
| guest route变401/403 | permission drift；不自动加token |
| docs未列出但frontend调用route | research candidate only；需固定schema和evidence review |
| master key/admin/write/attachment请求 | policy拒绝且zero external side effect |

Telemetry按`deployment × Flarum/extension versions × definition × exact GET route × JSON:API resource/query`记录primary/included/linkage/coverage、pagination、permission/schema/extension drift、unknown fields、identity/content drop、unsafe relationship/URL拒绝和zero auth/write。只有deployment roster、guest GET allowlist、fixture与sandbox conformance、rights/retention和kill switch全部通过后才能晋级。
