# Mozilla AMO Public Feedback Platform Pack 设计

状态：`researched / fixture-eligible / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`mozilla-amo-public-feedback/v0-design`

## 1. 边界与决策

本 Pack 仅设计 Mozilla Add-ons (AMO) 中 public add-on、public version、公开 rating/review 与 developer reply 的只读知识契约，用于发现 Firefox 扩展的采用后故障、兼容性回归、缺失能力和迁移原因。它不访问账号、用户 profile、unlisted/non-public add-on、add-on binary、外部 support page，也不发布/编辑/删除 rating，不回复或 flag。

首选未来候选 route 为官方 frozen v4；v5 只用于 schema drift research。即使 public GET 在技术上可达，本轮也不发请求、不注册 callable Connector；真实 sandbox 仍需用户对 exact purpose、目标 add-on roster、频率、retention 与 attribution 的另行授权。

## 2. 稳定概念

| Concept ref | 类型 | 原生身份/关系 | 不能推导 |
| --- | --- | --- | --- |
| `amo.addon/v1` | product entity | AMO id；同时保留 guid/slug 作为 native aliases | name 相同不是同一产品；排名/下载量不是需求 |
| `amo.addon-version/v1` | version entity | version id + version string；belongs-to add-on | current version 不代表评论所用版本 |
| `amo.rating/v1` | mutable feedback entity | rating id；score 必有，body 可为 null | rating 不是 written review；缺失不是删除 |
| `amo.written-review/v1` | rating representation | rating id + non-empty body | 文本不能证明真实性、规模或问题仍有效 |
| `amo.developer-reply/v1` | authored child record | reply object，`reply-to` rating | 回复不证明问题已解决 |
| `amo.rating-aggregate/v1` | aggregate snapshot | add-on + query/observedAt | count、average、Bayesian average 不可跨市场直接比较 |
| `amo.latest-rating-projection/v1` | provider projection | add-on list 默认每用户最新一条 | 不是完整 rating history；prior count 不是已获取历史 |
| `amo.search-placement/v1` | list observation | query/filter/sort/position/observedAt | relevance、recommended、users/downloads 仅是选择上下文 |

Add-on public/deleted/disabled 等状态与 rating active/deleted 分属不同 taxonomy。用户对同一 add-on 的旧 rating、当前 rating、特定 version rating 也不能互相覆盖。

## 3. 官方能力与访问 Profiles

官方证据：[v4 index](https://mozilla.github.io/addons-server/topics/api/v4_frozen/index.html)、[v4 add-ons](https://mozilla.github.io/addons-server/topics/api/v4_frozen/addons.html)、[v4 ratings](https://mozilla.github.io/addons-server/topics/api/v4_frozen/ratings.html)、[v5 overview](https://mozilla.github.io/addons-server/topics/api/overview.html)。

| Access profile | 候选 capability | 输入/输出 | 状态与限制 |
| --- | --- | --- | --- |
| `amo-v4-public-addon-search/v1` | `product.search.public-addon/v1` | bounded query/filter/sort → add-on placements | fixture-eligible；固定 `/api/v4/`；禁止 author/user 搜索；autocomplete 不作完整 roster |
| `amo-v4-public-addon-read/v1` | `product.read.public-addon/v1` | id/slug/guid → public add-on detail | fixture-eligible；non-public/unlisted 权限面拒绝 |
| `amo-v4-public-version-read/v1` | `product.list-read.public-addon-version/v1` | add-on → public versions | fixture-eligible；默认只要 public versions；不取 binary/file URL 内容 |
| `amo-v4-public-rating-read/v1` | `feedback.list-read.public-product-feedback/v1` | add-on/version/score filters → rating records | fixture-eligible；不传 user；默认 latest-per-user projection 和 rating-only inclusion必须记录 |
| `amo-v5-schema-observation/v1` | `knowledge.observe.provider-schema/v1` | official docs/source snapshot → drift assessment | research-only；v5 未 frozen，不作 v4 运行 fallback |
| authenticated rating/reply/flag | write/identity capabilities | account or developer action | rejected；不进入 route resolution、Skills 或 Probe |
| AMO HTML pages | manual evidence | human-reviewed page | manual-only；不是 API fallback |

Production、staging 与 development 是独立环境，staging/dev 使用 scratch database，production account 不联通。未来 sandbox 必须显式选 environment；不能因存在 staging 就声称它包含 production public population，也不能把 dev response 当 production conformance。

## 4. ProductFeedback 映射

每个 snapshot 先固定 `ProductFeedbackDefinitionMetadata`：platform/marketplace、surface、API version、产品与版本身份、record/state/rating/history/aggregate/moderation/selection/attribution/identity/data-use/rights/retention/deletion policy 与 valid window。

| AMO fact | `ProductFeedback*` 映射 |
| --- | --- |
| rating with body | `ReviewRecord`；canonical 或 latest projection；score 仅存 schema-bound payload reference |
| score only, body null | `RatingOnlyRecord`；不得生成 EvidenceSpan 正文 |
| reply | 独立 `DeveloperReplyRecord` + exact `ReplyToRelation` |
| version.id/version | `ProductVersionRef/Revision` + `AppliesToVersionRelation` |
| is_latest/previous_count | `State.Latest` + restricted payload；不制造未获取的 supersession relation |
| grouped rating/add-on summary | `AggregateRatingRecord` + aggregate representation |
| default list semantics | `LatestProjectionRepresentation` + `SourceHistoryCoverage` 非 complete |
| search/list result | `ProductFeedbackPlacementMetadata`；query/list/filter/sort/position/observedAt 固定 |
| user object | 不映射、不持久化；Attribution ActorRef 保持空，Disposition=`dropped-by-amo-policy` |

只有 review body 或 reply 的 exact content revision 能建立 `ProductFeedbackSpanMetadata`。score、rank、download/users、aggregate、promoted、is_latest 和 previous_count 默认都不是 complaint、urgency、switching 或 adoption evidence。

## 5. Rights、最小化与删除

- [AMO Review Guidelines](https://addons.mozilla.org/en-US/review_guide) 页面声明除特别注明外，站点内容使用 CC BY-SA 3.0 或后续版本。每次 snapshot 必须记录 exact page/license evidence、attribution requirement 与 share-alike decision；不能把此声明外推到 add-on binary、external URL、custom license 或未覆盖字段；
- [Mozilla Websites Terms](https://www.mozilla.org/en-US/about/legal/terms/mozilla/)和具体站点 notice 共同进入 rights review。许可有歧义时 route 保持 blocked，不由技术可访问性放行；
- [Mozilla AUP](https://www.mozilla.org/en-US/about/legal/acceptable-use/)禁止未经许可 harvest account names 等 PII。本 Pack 不调用 `user` query，不保存 rating response 中 user id/name/username/url，不构建 reviewer token，也不按昵称去重；
- raw body 仍可能自行包含个人信息，进入 restricted blob、短 retention 和字段安全扫描；索引只保留必要的 licensed/minimized span；
- public list 不返回 deleted rating，且 `with_deleted` 需要权限。未再出现、404 或分页边界变化都不自动产生 tombstone；只记录 `not-observed-under-current-route`。确证删除后按 deletion policy 使派生索引失效并保留最小审计事实；
- external links、support pages、media、files 与 binary 只保存受治理引用，不自动跟随或下载。

## 6. Skills 设计

### `amo-pack-research/v1`

- purpose：`research/curate`；
- 输入：官方 docs/source snapshots、当前 Pack revision、drift triggers；
- 输出：concept/capability/rights/schema/OSS candidate proposal；
- 禁止：API/HTML 调用、安装/执行仓库、route mutation。

### `amo-addon-roster-curation/v1`

- purpose：`research/curate`；
- 输入：研究问题、人工选择的 add-on evidence、query definitions；
- 输出：bounded roster/query revision 与 exclusion reasons；
- 禁止：按 author/user 枚举、自动扩大全站、名称模糊合并。

### `amo-public-feedback-read/v1`（未来候选）

- purpose：`acquire`；
- allowlist：固定 v4 public add-on search/read/version 与 add-on-scoped rating list/detail；
- 强制：query budget、rate budget、no-user-query、field drop、license binding、coverage boundary；
- 当前无 route；调用必须返回 `capability-unavailable:no-authorized-binding`。

### `amo-feedback-fixture-conformance/v1`

- purpose：`verify/diagnose`；
- 只消费 synthetic/hand-authored fixtures 和 frozen contracts；
- 输出 mapping、coverage、rights/minimization、no-write 与 drift report。

### `amo-rights-attribution-review/v1`

- purpose：`govern/review`；
- 对 exact content class 绑定 notice、license、attribution/share-alike、retention/deletion decision；
- 不接受“AMO 都公开”作为 rights evidence。

### `amo-probe-review/v1`

始终返回 `unsupported:no-platform-write`。系统不得生成/发布 rating、review、developer reply 或 flag；这些行为会影响真实用户、评分和 moderation，不是需求测试 Probe。

## 7. Fixture Conformance

| Scenario | 必须证明 |
| --- | --- |
| body=null + score | 形成 rating-only record，无 review EvidenceSpan |
| body + exact version + reply | review/reply 分对象，version/reply exact relation 可追溯 |
| same reviewer historical ratings | 默认 list 只标 latest projection，不臆造旧记录或 history complete |
| v4/v5 translation difference | schema/version 显式，禁止跨版本静默 mapper fallback |
| count/page_count/max result window | page exhausted 不升级为 provider population complete |
| deleted record unavailable publicly | absence 不生成 tombstone；privileged `with_deleted` 不进入 route |
| add-on disabled vs rating deleted | 两个 state taxonomy 不混用 |
| sort by users/downloads/rating | placement context 不生成需求规模或采用证据 |
| response includes user profile | id/name/username/url 全部 dropped，日志与索引无身份 |
| CC attribution fixture | license evidence、attribution/share-alike 与 span lineage 完整 |
| external link/file URL | 不取内容；只保留 governed artifact ref |
| any POST/PATCH/DELETE/reply/flag | route/Skill/effect policy 拒绝且平台副作用为零 |

## 8. 验证与可观测性

晋级顺序固定为 `evidence-review → static-contract → fixture-conformance → sandbox-live → operational-canary`。本轮只允许前三层中的设计与本地静态/fixture 契约，不执行 live。

未来每个 member/run 的 telemetry 最少包含：Pack/definition/API version、route/env、query/filter/sort hash、requested/returned/page/next/count、population/history/rights coverage、dropped identity fields、body-null count、reply/version mapping count、429/451/503/contract error、schema hash、license evidence ref、retention/deletion policy ref、zero-write assertion。指标按 capability/route/environment 分开；单一 success rate 不得隐藏 rights blocked、分页截断或 identity drop 失败。

Canary 只用用户批准的最小 public add-on roster，监测 v4 availability/schema、v5 drift、pagination、status codes、license/AUP/terms、删除语义与最小化。任何 drift 先 quarantine 新 snapshot，不覆写既有知识或自动改 route。

## 9. OSS 候选

采用[候选分流文档](PUBLIC_EXTENSION_MARKETPLACE_FEEDBACK_TRIAGE_2026-08-26.md)中的固定 revisions。`addons-server` 是 schema/contract reference；`addons-frontend` 是 display/selection reference；`web-ext` 的 build/sign/submit 与 credential surface 对本只读 Pack out-of-purpose。三者均未安装、未运行，也不因“官方仓库”自动成为 Connector implementation。

## 10. 晋级缺口

进入 `modeled` 前需接受 Pack schema、fixture corpus、v4 endpoint/field allowlist、exact rights/attribution decision 与 field-drop policy；进入 `verified` 前需 fixture report，并由用户另行授权最小 read-only sandbox。进入 `available` 还需 Connection/Route binding、budget、rate/backoff、deletion propagation、canary 与 kill switch。任何级别都不开放平台写入。
