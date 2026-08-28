# Bing Webmaster Tools Platform Pack 设计

状态：`researched / migration-blocked` 设计候选；未发布、未调用、未生成 API key/OAuth token  
核验日期：2026-08-26  
Pack ref：`bing-owned-search-intent/v0-design`

## 1. 定位与当前迁移风险

Bing Webmaster API 面向已注册/验证站点，官方目录列出 Rank & Traffic、Keyword、Link 和 Crawl statistics，也提供站点、sitemap、URL/content submission 等写操作：[Bing Webmaster API](https://learn.microsoft.com/en-us/bingwebmaster/)。本 Pack 只研究 owned site 的 query/search-performance read。

当前不能把它发布为 callable：官方在 2026-08-07 更新的入口明确声明 legacy SOAP 与 POX 将于 **2026-08-31** 退役并要求迁移 REST，但公开索引仍主要链接 2022 年的 WCF/JSON/POX reference；本次 evidence review 未得到一个版本化、无歧义的 post-cutover REST analytics contract。旧 reference 的 JSON/HTTP 是否就是被保留的 REST surface、哪些 methods/schema/quota 继续有效，不能靠猜测。

```text
platform             bing-webmaster-tools
surface              owned verified-site search performance
state                researched / migration-blocked
verified level       evidence review with open contract blocker
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `bing-webmaster.site/v1` | entity | exact verified site URL | API key 是 user-wide，不表示所有 sites 自动进入研究 roster |
| `bing-webmaster.site-role/v1` | relationship/enumeration | site + account role | verified ownership/access boundary |
| `bing-webmaster.query-stats/v1-legacy` | aggregate dataset | site + query/date/method revision | legacy top query statistics；官方 method remarks 数据每周更新 |
| `bing-webmaster.query/v1-legacy` | sensitive aggregate dimension | Query field | 与 impressions/clicks/average positions 同 cell；不代表全 Bing search volume |
| `bing-webmaster.page-stats/v1-legacy` | aggregate dataset | site + page/date | top pages/某 page query statistics，不能与 site totals 无条件相加 |
| `bing-webmaster.rank-traffic/v1-legacy` | aggregate dataset | site + date | site-level impressions/clicks/rank traffic summary |
| `bing-webmaster.search-performance-report/v1` | product surface | site + report window | 新 portal report；官方 help 称一般在收集处理 48h 后生成 |
| `bing-webmaster.protocol/v1` | enumeration/policy | protocol/version | SOAP、POX、JSON/HTTP、future REST 的生命周期必须单独记录 |

旧 `QueryStats` fields 为 Query、Date、Impressions、Clicks、AvgClickPosition、AvgImpressionPosition：[GetQueryStats](https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces.iwebmasterapi.getquerystats?view=bing-webmaster-dotnet)。这些是 legacy contract evidence，不自动成为 post-cutover REST schema。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `taxonomy.list.owned-search-sites/v1` via legacy methods | account → verified sites | owned API | `suspended-new-use` | `GetUserSites` 存在，但不可为即将切换的 contract 新建 route |
| `analytics.query.owned-search-performance/v1` via legacy JSON/HTTP | verified site → query/page/traffic stats | owned API | `suspended-new-use` | schema/cadence 有证据，cutover 后连续性未证实 |
| `analytics.query.owned-search-performance/v2` via REST | verified site + query profile → dataset | owned official REST | `deferred/migration-blocked` | 需获得版本化 endpoint/auth/schema/quota/coverage 官方证据 |
| `analytics.import.owned-search-performance/v1` | user-selected portal export → dataset | manual import | `manual-only` | 当前安全基线；每个 export 保存页面/字段/窗口证据和 coverage |
| `diagnostics.read.owned-site-health/v1` | verified site → crawl/index issues | owned API | `deferred` | 有价值但不是 search-intent core |
| `account.submit.urls/v1` | verified site → URL submission | platform write | `rejected` in this Pack | 不因同一 API 提供写操作就暴露给需求采集 |
| `account.manage.sitemaps-sites/v1` | account/site → configuration change | platform write | `rejected` in this Pack | 独立 SEO operations workflow |
| `discovery.keyword-research/v1` | seed keyword → market keyword stats | portal product surface | `manual-only/deferred` | 与“哪些 query 带来 owned site 曝光”是不同 population |

## 4. Access Methods

### 4.1 `bing-webmaster-legacy-json-http/v1`

- official：历史官方 reference；mode：`official-api`；adoption：`suspended-new-use`；
- auth：OAuth 2.0 或 user-wide API key；官方推荐 OAuth，并提供 `webmaster.read` 与 `webmaster.manage` scopes：[OAuth 2.0](https://learn.microsoft.com/en-us/bingwebmaster/oauth2)；
- API key 绑定用户而非单一 site，可访问该用户全部 verified sites，因此不符合默认最小 blast radius：[Getting access](https://learn.microsoft.com/en-us/bingwebmaster/getting-access)；
- legacy JSON examples 使用 `/webmaster/api.svc/json/<Method>`；SOAP/POX retirement 不足以证明这些 JSON methods 的 post-cutover support；
- read quota、pagination/top-N、历史窗口和 privacy suppression 未在本次权威材料中形成完整 contract，全部标 unknown；
- 不建立 Connector route，也不以社区项目 live claim 替代官方迁移证据。

### 4.2 `bing-webmaster-rest/vnext` research placeholder

这不是可发布 AccessMethodDefinition，只是 dossier open question。晋级前必须固定：

1. REST base URL、API version 与 method inventory；
2. `webmaster.read` 是否可覆盖 site list/query/page/traffic stats；
3. response schema、time zone、freshness、pagination/top-row/retention/privacy；
4. quota/error/revoke 行为；
5. JSON/HTTP legacy method 到 REST 的明确迁移映射与 cutover date。

### 4.3 `bing-webmaster-user-export/v1`

- mode：`manual-import`；仅用户从自有 portal 选择并提供；
- import preview 固定 site、report、filters、window、exportedAt、column schema 和 product version；
- portal help 表示 reports 通常需约 48h 处理，但 legacy `GetQueryStats` 文档称 weekly update；二者不能互相填补 cadence；
- manual package 不声称完整 query population，缺行/阈值/导出上限保持 unknown。

## 5. Platform Skills

### `bing-webmaster-pack-research/v1`

- purpose：`research/curate`；
- 每日监控至 cutover 后：landing/deprecation、REST docs、reference/version、OAuth scopes、schema、terms 和 official samples；
- 对 legacy method、current REST 和 product UI 分 representation；只生成 proposal，不调用或迁移账号。

### `bing-owned-search-intent-manual/v1`

- purpose：`acquire`；
- 输入：固定 dossier、用户确认 site roster、用户选择 export；
- required port：`manual-import`；allowed effects：`local-write`；
- 输出：representation-aware aggregate Observation、CoverageAssessment、schema drift report；
- 禁止：API key/OAuth、自动 endpoint discovery、URL/sitemap submission、竞品 site。

### `bing-webmaster-conformance/v1`

- purpose：`verify/diagnose`；
- 当前只允许 legacy/current candidate fixtures 与 manual export schema；
- 必须验证 protocol/version fail-closed、user-wide key blast radius、query metric rollup、unknown coverage 和 write rejection；
- sandbox scenario 保持 blocked，直到 post-cutover REST contract evidence review 通过且用户另行授权。

本 Pack 不定义 Probe Skill。IndexNow、URL submission、sitemap 或页面内容变更不是本 read-only analytics Pack 的附带能力。

## 6. Aggregate 与数据治理

- legacy clicks/impressions 只能在 provider 证明 cells 互斥时 `sum-if-disjoint`；average click/impression position 均为 `provider-defined/non-additive`。
- 未证实 REST grain、time zone、data state、suppression 和 totals inclusion 时，AggregateDatasetMetadata 对这些字段标 unknown，不从 Google 语义复制。
- query 原文是受限的一方聚合数据；低频/敏感文本默认不进入宽权限索引，禁止跨 Google/Bing 拼用户身份。
- portal empty/export missing、permission failure、retirement error 与 zero traffic 必须区分。
- 同一 domain 在 Google 与 Bing 中的 property/site relation来自用户 roster evidence；搜索引擎之间的 clicks/impressions 不相加成“总市场”。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 只读固定；未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [saurabhsharma2u/search-console-mcp](https://github.com/saurabhsharma2u/search-console-mcp/tree/4eccd60aacb395abb247c79b6fb07d80a02f6fe1) `4eccd60aacb395abb247c79b6fb07d80a02f6fe1` | community；MIT | Bing site/analytics/query 与 cross-engine mapper、credential/security claims | `migration-fixture-candidate only`；同时暴露 indexing/site/sitemap writes，且是否依赖 legacy endpoint必须审计 |
| [airbytehq/airbyte Google Search Console agent docs](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/docs/ai-agents/connectors/google-search-console) `1339a9ecca6f8fb547ffb7b19665d6980c069026` | Airbyte；许可需路径复核 | 对照成熟 typed agent connector 如何限制 read surface | `design-reference`；不提供 Bing officiality |

目前没有找到 Microsoft 官方、固定版本且明确覆盖 post-cutover Bing Webmaster search analytics REST 的开源 SDK/repository。这个“未找到”是 dossier 结果，不用非官方 MCP 填成官方 artifact。

## 8. Verification Plan

### evidence-review / static-contract

- deprecation date、protocol、endpoint、schema 和 access method revision 不混用；
- `REST vnext` 没有证据时不能发布 AccessMethodDefinition/route；
- API key user-wide blast radius 与 OAuth read scope明确；
- manual export 是正式 degraded path，不冒充 API；
- read Skills 不包含 submit/manage ports；Google metric/privacy semantics 不继承给 Bing。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| legacy JSON QueryStats | 只绑定 v1-legacy schema，日期/positions 保留 |
| unknown future REST payload | fail closed，生成 schema drift proposal，不启发式吞字段 |
| API retirement/auth error | route suspended/unknown，不切到 API key或 private endpoint |
| user-wide sites fixture | roster allowlist 限制 surface，不自动读取全部 verified sites |
| weekly legacy vs 48h portal | cadence 保持 representation-local |
| average positions | 拒绝直接平均；未知权重不推断 |
| manual CSV changed columns | schema version/diff 可追溯，unknown fields 进入 extension |
| attempted submit URL/sitemap | policy 拒绝，零 platform-write |

### sandbox-live / operational-canary

本轮不设计 legacy live sandbox。2026-08-31 后先重新 evidence review；只有 REST endpoint/auth/schema/quota/terms 固定，并由用户批准 read-only OAuth connection 后，才运行一个 verified test site 的 sites list + 单一低维 query stats sandbox。canary 必须单独监测 deprecation banner、reference diff、method availability、schema、auth、lag 和 coverage；不能复用 Google 成功率。

## 9. 晋级缺口

当前 Pack 的正确状态是 `migration-blocked`，不是“即将支持”。post-cutover REST contract、官方 migration mapping、read quota/coverage/privacy、fixture 与 sandbox 均缺失。manual import 可独立进入 modeled，但不会使 API capability 晋级。
