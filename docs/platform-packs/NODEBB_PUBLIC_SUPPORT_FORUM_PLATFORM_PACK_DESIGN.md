# NodeBB Public Support Forum Platform Pack 设计

状态：`researched / fixture-eligible / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`nodebb-public-support-forum/v0-design`

## 1. 定位与部署合同

本Pack描述一个经批准的NodeBB deployment。NodeBB core、plugin、theme、search parser、permission和v4 ActivityPub配置共同决定公开表示，不能只凭`/api`路径或软件指纹进入采集。

官方来源：[development/page JSON](https://docs.nodebb.org/development/)、[Read API OpenAPI](https://github.com/NodeBB/NodeBB/blob/a9e2f69a107642c3c91549d9c67a1c4c84e39a87/public/openapi/read.yaml)、[plugin parsing](https://docs.nodebb.org/development/plugins/parsing/)、[federation docs](https://docs.nodebb.org/activitypub/fep/7888/)、[core `a9e2f69a…`](https://github.com/NodeBB/NodeBB/tree/a9e2f69a107642c3c91549d9c67a1c4c84e39a87)。core为GPL-3.0；核验时latest release为v4.15.1，但每个真实deployment必须单独固定版本证据。

本Pack不登录、不携带cookie/bearer token，不读取user-private、chat、notification、flag、queue、admin或email route，不调用socket，不follow federation graph，不执行POST/PUT/PATCH/DELETE，不安装plugin或运行NodeBB。

## 2. 稳定概念与能力

| Concept / capability | `PublicDiscussion*`映射 | 状态 |
| --- | --- | --- |
| category/topic/post | category container、root thread、post records与relations | fixture-eligible |
| `/api` page data | canonical/list/search representation由exact route决定 | fixture-eligible |
| search/tag/popular/top | query/list placement；provider rank不作质量事实 | fixture-eligible |
| plugins/parser | deployment capability binding + component/version/scope | fixture-eligible metadata；unknown不推断core |
| guest privileges | visibility/participation policy；route-level conformance | fixture-eligible；live单独验证 |
| local/federated post | federated representation + origin binding | fixture-eligible |
| ActivityPub context/replies | federation policy、canonical origin与pagination coverage | fixture-eligible；不自动递归 |

NodeBB文档说明每个页面的JSON通常可通过在路径前加`/api`取得。这是page data约定，不是“任意页面均可安全批量读”的授权。category privilege、guest visibility、plugin hooks和版本可改变字段与可见内容。

v4 federation使remote post可以出现在本地topic/world表示中。Pack必须保存local rendering deployment与asserted origin，federated copy不继承origin的许可、完整history或independent authority；同一Activity经relay/copy出现多次也不增加独立证据数。

## 3. Read API的关键反直觉边界

[官方OpenAPI](https://github.com/NodeBB/NodeBB/blob/a9e2f69a107642c3c91549d9c67a1c4c84e39a87/public/openapi/read.yaml)明确说明Read API是历史演进结果，并非严格REST，而且包含少量非GET route。相同spec还列出authentication、user、chat、email、flags、queue和admin surface。因此：

- “属于Read API”不是effect安全证据；必须使用exact method/path allowlist，首轮只允许审核过的guest GET。
- OpenAPI的route存在不证明guest有权访问。fixture分别覆盖200 public、401/403 private、404 hidden与redacted responses。
- bearer token从v1.15进入core，较旧版本依赖write-api plugin；这一历史边界证明version和plugin roster必须入definition。当前Pack不接token。
- search、category、topic与post response由plugin/parser修改时，新字段需schema conformance；不得把HTML、socket或admin API作为自动fallback。
- federation outbound/inbox、follow、relay和remote discovery属于网络扩张/写入surface，本Pack仅表达已返回记录的origin，不主动调用。

未来初始route候选仅包括批准deployment上的categories、category、topic、post、search、tags、popular/top等exact public GET子集。`/api/self`、`/api/me`、`/api/user`、chat、notifications、flags、queues、admin、auth、email/unsubscribe及任何非GET均显式deny。

## 4. Skills与开源审计

截至核验日，NodeBB官方组织未发现面向公开论坛研究的Agent Skill或MCP server。NodeBB core/OpenAPI和官方docs作为固定静态参考，不安装、不执行。

NodeBB core本身同时包含read/write APIs、CLI、plugin installation、database与admin能力，不能作为Connector直接运行。未来若出现community MCP/client，需固定revision/license，并通过method/path静态审计、dependency/egress/effect审计、fixture conformance和sandbox；“NodeBB API client”标签不自动晋级。

Pack Skills：`nodebb-deployment-contract-research/v1`、`nodebb-forum-fixture-conformance/v1`和未来`nodebb-approved-public-read/v1`。当前live skill返回`capability-unavailable:no-authorized-deployment-binding`。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| OpenAPI route在Read spec但method非GET | contract拒绝；zero request |
| route为GET但需要user/admin | guest-only policy拒绝或记录401/403，不加credential |
| plugin增加字段/route | capability/schema revision；不推广为NodeBB core事实 |
| remote federated post显示在local topic | federated representation + exact origin；不重复计authority |
| origin不可解析或循环relay | origin unknown/coverage partial；停止递归 |
| parser输出HTML/链接 | untrusted content quarantine；不执行或跟随 |
| deployment版本与fixed schema不符 | quarantine并要求新conformance |
| socket/chat/admin/write请求 | policy拒绝且zero external side effect |

Telemetry按`deployment × version/plugin roster × definition × exact method/path × category/topic/query`记录guest permission、requested/returned/coverage、pagination、local/federated比例、origin dedupe、schema/plugin drift、identity/content drop、unsafe URL拒绝和zero auth/write/socket。只有批准的deployment、固定route budget和sandbox canary通过后才可从fixture-eligible晋级。
