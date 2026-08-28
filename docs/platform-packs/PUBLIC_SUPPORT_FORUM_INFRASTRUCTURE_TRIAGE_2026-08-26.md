# Public Product Support Forum Infrastructure 候选分流

状态：`researched / design-only`  
核验日期：2026-08-26

## 1. 缺口与选择

GitHub issue偏向可复现的软件工作项，Stack Exchange类Q&A偏向跨产品知识，Slack/Discord等私域社区又缺少稳定的公开历史。产品支持论坛处在三者之间：它保留产品语境、问题叙述、复现、绕路、员工回复与可选解决状态，是发现采用阻力、支持缺口和迁移触发器的重要独立证据面。

首批选择Discourse、NodeBB、Flarum，不是把三个软件品牌当成集中式平台，而是建立三类可复用的部署模板：

| 候选 | 核心价值 | 首轮可验证表示 | 主要边界 |
| --- | --- | --- | --- |
| Discourse | topic/post/category/tag/search；可选Solved能力；官方OpenAPI与官方MCP候选 | 固定OpenAPI + 合成topic/post/search/solved fixtures | 每个站点独立配置；Solved需启用且可按category/tag作用；topic首响应不等于全量posts |
| NodeBB | category/topic/post/search/tag；v4 federation；公开page JSON | 固定core/OpenAPI + 合成topic/search/federated fixtures | “Read API”含少量非GET及大量用户/admin surface；插件、权限与部署版本决定字段/路线 |
| Flarum | discussion/post/tag；JSON:API关系与include；高度extension-driven | 固定framework + 合成JSON:API discussion fixtures | 官方endpoint文档仍不完整；扩展可增route/attribute；1.8 stable与2.x RC不可混用 |

三个成员均发布Platform Pack；requested=3、fixture-eligible=3、callable=0。这里的“fixture-eligible”只证明抽象可表达固定版本合成响应，不代表任何真实论坛站点已获准读取。

## 2. 第一性边界

- **软件不是authority。** 每个论坛deployment拥有独立owner、host、软件版本、托管方式、插件/扩展roster、API配置、公开/私有权限、Terms、robots、限流、保留与删除规则。
- **能力必须追溯来源。** `solved`、search、parser、federation或额外字段可能来自core、bundled extension、third-party extension或site customization；未知不等于disabled。
- **accepted/solved是provider state。** 它说明某个native relation被标为接受/解决，不证明workaround有效、产品缺陷已修复、提问者满意或需求普遍。
- **回答数不等于完整历史。** 搜索摘要、topic第一页、selected post、federated copy和canonical record分别记录representation与coverage；不得以列表计数推断已取得全部正文或revision。
- **公开GET不由产品命名保证。** exact deployment、method、path、query、guest permission与response schema共同定义允许面；HTML中可见不自动授予批量留存、索引或模型训练权。
- **作者身份弱化。** 用户名、头像、email、IP、group membership、private message和profile字段默认不采；只保留scope-local opaque actor ref与必要的staff/moderator label。
- **论坛正文是不可信内容。** HTML、Markdown、链接、附件、embed、代码块和提示词均隔离；不下载附件、不跟随任意URL、不执行代码。
- **禁止开放世界爬取。** 未来live只能针对用户批准的deployment roster和query/category/topic范围，不能从software showcase、搜索引擎或federation graph自动扩张站点集合。

## 3. 官方版本、许可与协议结论

| 软件 | 固定源码 / license | 核验时release事实 | 协议结论 |
| --- | --- | --- | --- |
| [Discourse core](https://github.com/discourse/discourse/tree/3c9035881b112539d2d22aefc374a806acd1df34) | `3c903588…` / GPL-2.0-or-later | rolling部署；真实站点版本必须单独探测并留证 | Rails JSON API；OpenAPI由request specs生成，但未覆盖全部endpoint |
| [Discourse API docs](https://github.com/discourse/discourse_api_docs/tree/6737ac2ab31321c6e0dedb76dd2d02fb145b54cb) | `6737ac2a…` / MIT | 文档仓库由core自动更新 | 可作schema authority候选；浏览器抓包只能用于发现，不可成为稳定合同 |
| [NodeBB](https://github.com/NodeBB/NodeBB/tree/a9e2f69a107642c3c91549d9c67a1c4c84e39a87) | `a9e2f69a…` / GPL-3.0 | 2026-08-19发布v4.15.1；deployment仍需精确版本 | `/api` page JSON与OpenAPI；Read API非严格REST且含非GET、auth与admin surface |
| [Flarum framework](https://github.com/flarum/framework/tree/29da25dec7418274bf476d93322bc0eb89e1f237) | `29da25de…` / MIT | stable为v1.8.19；v2.0.0-rc.7仍是pre-release | JSON:API风格；extension可增route/attribute，完整schema必须deployment conformance |

Discourse默认限流、NodeBB guest visibility和Flarum endpoint/permission都会随部署配置改变。任何文档中的默认值只进入definition evidence，不能硬编码成跨站点常量。

## 4. Agent Skills、MCP与开源候选

| 候选 | 固定revision / license | 价值 | 结论 |
| --- | --- | --- | --- |
| [Discourse repo skills](https://github.com/discourse/discourse/tree/3c9035881b112539d2d22aefc374a806acd1df34/.skills) | 随core revision / GPL-2.0-or-later | 官方工程开发知识，如migration、ACL、admin UI、tests | static-reference；不是论坛需求采集Skill |
| [Discourse MCP](https://github.com/discourse/discourse-mcp/tree/e7fc32163e72c5e60f03ef2c4cad593b95afe107) | tag `v0.3.1` / MIT | 官方MCP；默认read-only，写能力双开关，支持单站点绑定与toolsets | quarantined research-only；不安装/执行；未来需单站点、禁remote discovery、公开read tool裁剪与独立审计 |
| [NodeBB core OpenAPI](https://github.com/NodeBB/NodeBB/blob/a9e2f69a107642c3c91549d9c67a1c4c84e39a87/public/openapi/read.yaml) | 随core revision / GPL-3.0 | route/schema/plugin/version边界的唯一固定参考 | static-reference；不可整体导入为read allowlist |
| [Flarum framework](https://github.com/flarum/framework/tree/29da25dec7418274bf476d93322bc0eb89e1f237) | MIT | core与bundled extension字段/关系参考 | static-reference；不可代替deployment extension roster |
| [flagrow/flarum-api-client](https://github.com/flagrow/flarum-api-client) | archived 2021 / MIT | 历史PHP client、auth和discussion route参考 | rejected as connector；过时且示例含master key/admin surface |

截至核验日，未在NodeBB或Flarum官方组织中发现面向公开论坛研究的官方Agent Skill或MCP server。缺少候选不是要求临时拼装浏览器爬虫；成员可只保留fixture-eligible状态。

## 5. 验证优先级

1. 先用合成fixtures验证deployment identity、software/version、capability origin、topic/post relation、solution state、pagination与partial coverage。
2. 每个deployment profile必须固定host、owner、software/version evidence、extension roster、公开GET method/path allowlist、guest permissions、Terms/robots、rate/retention和kill switch。
3. sandbox live需用户批准具体测试站点与topic/query roster；只做预算内GET，并验证429/backoff、schema drift、private/admin route拒绝和zero writes。
4. operational canary只监控已批准deployment；software版本、extension roster、schema、Terms、robots或权限漂移会使该member quarantine，不自动切换HTML抓取、MCP或认证路线。
5. 发帖、回复、点赞、投票、标记solution、私信、登录、上传、moderation、admin、Data Explorer与federation inbox均属于独立Probe/高影响能力；本Channel不开放。
