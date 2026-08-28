# Public Product Support Forum Infrastructure Channel Pack 设计

状态：`researched`；3 个 fixture-eligible member，0 个 callable member  
核验日期：2026-08-26  
Channel Pack ref：`public-product-support-forum/v0-design`

## 1. 目的与成员

本Channel组合用户批准的公开产品支持论坛deployment，用于发现产品采用阻力、复现与绕路、支持响应缺口、未解决问题和迁移触发器。它统一`PublicDiscussion*` projection，不统一站点authority、软件版本、插件/扩展能力、solution语义、搜索排名、分页、身份、Terms、robots或保留权利。

| Member template | Pack | 当前coverage |
| --- | --- | --- |
| Discourse deployment | [Discourse Pack](DISCOURSE_PUBLIC_SUPPORT_FORUM_PLATFORM_PACK_DESIGN.md) | topic/post/search/optional Solved synthetic fixture |
| NodeBB deployment | [NodeBB Pack](NODEBB_PUBLIC_SUPPORT_FORUM_PLATFORM_PACK_DESIGN.md) | category/topic/post/search/federated synthetic fixture |
| Flarum deployment | [Flarum Pack](FLARUM_PUBLIC_SUPPORT_FORUM_PLATFORM_PACK_DESIGN.md) | JSON:API discussion/post/extension synthetic fixture |

requested=3、fixture-eligible=3、callable=0。将来一个Discourse站点和另一个Discourse站点也是两个独立member bindings；software template通过不代表deployment通过。

## 2. 共同合同与不可比较边界

共同projection固定deployment definition、owner/host/software/version、capability origin与scope、thread/record/relation、representation、origin、state、query/list placement、history/reply coverage、schema/pagination/rate、identity/content safety、Terms/robots/rights/retention/deletion与evidence。

必须保留：

- issue、Q&A、support forum和private community是不同population与moderation context；文本相似不合并authority；
- answer、accepted answer、solved、staff reply、locked、archived和closed不是同一个状态；
- Discourse Solved、NodeBB plugin/parser/federation、Flarum extension field必须绑定component/version/scope；
- search summary、ranked list、topic page、selected post、included relationship和federated copy不是canonical full history；
- category、board/tag与free-form tag的placement不同；移动/合并/crosspost关系需exact native evidence；
- reply/view/vote/like counts只作provider engagement context，不是用户数、市场规模、痛点强度或满意度；
- solved不是修复证据，未回复不是高需求证据，员工身份label不是官方承诺；
- 同一内容在本地、federated copy、搜索摘要或多个镜像出现不会增加independent authority；
- 技术公开不等于允许批量保存、索引或训练。每个deployment独立做Terms/robots/data-use decision。

## 3. 动态物化视图

- `support-friction-by-product-and-capability`：按deployment/product taxonomy聚合exact authored spans与support state；不跨definition比较raw counts。
- `unresolved-and-stale-thread-candidates`：使用provider state、last activity与coverage生成验证候选；不把无回复直接称为痛点。
- `workaround-and-reproduction-candidates`：抽取可追溯span、record revision与relation；仍需review/eval证明语义。
- `solution-capability-and-resolution-drift`：跟踪Solved/plugin/extension启用范围、accepted relation与schema变化。
- `cross-surface-problem-corroboration`：forum span与exact independent issue/Q&A/interview/owned telemetry连接；common-origin copies不增加支持度。
- `deployment-schema-policy-and-roster-drift`：software/extension versions、route/schema、guest permission、Terms、robots、rate与retention变化。

所有view固定Channel/member deployment/definition/capability roster/query/window/rights与watermark。Dolt snapshot保存Platform Pack、deployment definition、schema/policy/evidence revision；高频threads/posts/metrics进入分析存储。正文可append到governed evidence store，但动态索引与物化视图可重建，不把整站论坛复制为长期知识正文。

## 4. Channel Skills 与 Probe

### `public-support-forum-source-research/v1`

只读官方docs/spec/fixed repositories，研究新forum software、deployment capability、Agent Skills/MCP和开源候选，输出Pack/drift proposal；不安装、执行或调用候选。

### `approved-public-support-forum-read/v1`（未来）

只调度verified member bindings与用户批准deployment/category/topic/query roster。当前全部返回`no-authorized-deployment-binding`；不得fallback到浏览器爬虫、HTML、search engine cache、federation expansion、community MCP、credential或admin API。

### `public-support-forum-conformance/v1`

验证deployment identity/version/extension roster、method/path allowlist、thread/post/relation、solution capability origin、representation/coverage、federated origin、permission/schema/policy drift、unsafe content和zero writes。

本Channel没有论坛写入Probe。不能通过发帖、回复、点赞、投票、标记solution、私信、上传、flag、moderation、注册账号或触发federation来“验证需求”。主动probe继续使用获准的survey/interview/landing/manual package等独立Channel，并保留实验批准与效果ledger。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| 同软件两个站点 | two deployment authorities；不共享version/extension/rights事实 |
| solved/accepted来自extension | exact capability component/scope；不统一成“fixed” |
| list显示50 replies但只取20 | coverage partial；不把count当records |
| federated/local/search三份同一post | source lineage dedupe；independent authority不增加 |
| one member permission/schema drift | member quarantine，Channel partial；不自动fallback |
| private/admin route出现在官方spec | effect/permission deny；不进入allowlist |
| support thread claims security incident | authored assertion；不生成vulnerability事实 |
| MCP/client/write/attachment request | policy拒绝且zero external side effect |

Telemetry按`Channel × deployment member × definition/capability roster × method/path × query/thread`记录expected/fixture/callable/succeeded/blocked/quarantined、requested/returned/coverage、solution/federation/source-lineage、schema/version/plugin/permission/Terms/robots drift、identity/content drop、unsafe URL/attachment拒绝、rate budget与zero auth/write。

至少一个具体deployment binding通过fixture conformance后Channel才成为`modeled-partial`；software template本身不计live member。sandbox live、operational canary、credentialed read与任何write Probe分别晋级，均需新的用户授权和可回滚kill switch。
