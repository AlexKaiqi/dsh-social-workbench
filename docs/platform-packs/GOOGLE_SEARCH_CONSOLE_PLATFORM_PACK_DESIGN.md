# Google Search Console Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未访问 BigQuery  
核验日期：2026-08-26  
Pack ref：`google-owned-search-intent/v0-design`

## 1. 定位与边界

本 Pack 只覆盖用户有权访问的 Google Search Console property 的搜索表现数据。Search Analytics API 返回将自有 property 展示给搜索用户时产生的 clicks、impressions、CTR 和 average position，可按 query、page、country、device、date/hour 和 search appearance 等维度聚合：[Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)。

它不是全网关键词搜索量、Google Trends、Google Ads、站内搜索、Google Analytics、用户级点击流或竞品流量 API。一个 query impression 只说明该 property 的结果获得展示，不证明搜索者有购买意愿、遭遇痛点或代表整个市场。

```text
platform             google-search-console
surface              owned property search performance
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `gsc.property/v1` | entity | exact `siteUrl` | URL-prefix property 或 `sc-domain:` property；协议、host、path 边界不可自行扩展 |
| `gsc.property-permission/v1` | relationship/enumeration | property + principal grant | Sites API 返回用户可访问 property 与 permission level |
| `gsc.search-performance-dataset/v1` | aggregate dataset | property + request hash + window | 一次固定 dimensions/filters/type/aggregation/dataState 的结果集 |
| `gsc.search-query/v1` | sensitive aggregate dimension | query string within dataset | 搜索词；rare/sensitive query 可能被 anonymize/omit，不是用户身份 |
| `gsc.search-page/v1` | aggregate dimension/entity ref | property + canonical/page URI | page grouping 与 property grouping 的计算语义不同 |
| `gsc.search-type/v1` | enumeration | provider enum | `web/image/video/news/discover/googleNews` 是不同 population |
| `gsc.search-appearance/v1` | dynamic enumeration | provider value | 需先按 appearance 分组发现可用值，再按单一值查询 |
| `gsc.clicks/v1` | metric | dataset cell | provider 定义的点击计数；只在兼容、互斥 grain 上可加 |
| `gsc.impressions/v1` | metric | dataset cell | provider 定义的展示计数；aggregation type 会改变计算 |
| `gsc.ctr/v1` | ratio metric | dataset cell | clicks/impressions；跨 cell 必须由分子分母重算，禁止平均 CTR |
| `gsc.average-position/v1` | non-additive metric | dataset cell | provider 定义平均最高位置；禁止直接求和或平均 |
| `gsc.data-state/v1` | enumeration | request/response metadata | final、fresh/incomplete hour/date；final 不等于 coverage complete |
| `gsc.anonymized-query/v1` | privacy treatment | provider suppression rule | query 被省略/空字符串；是否计入 totals 依 query filter 等条件变化 |
| `gsc.bulk-export/v1` | official projection/export | property + BigQuery dataset/table/date | 每日 BigQuery export；比 API row surface 完整，但仍排除 anonymized queries |

### 2.1 原生语义必须保留

- `siteUrl` 必须与 Search Console property 精确一致；URL-prefix 与 domain property 不是可互换别名。
- dimensions 的顺序定义 response `keys[]` 顺序，也定义 aggregate grain；不能只保存列名集合。
- `aggregationType=byPage/byProperty/auto` 影响 clicks、impressions 和 position 计算；page/query 维度可能丢失更多数据。
- API 默认按 clicks 降序，仅保证 top rows；tie 可任意排序。offset 翻完不改变 provider 的 50K/day/type/property 与内部 top-row 限制。
- `dataState=final` 只表示处理状态；`first_incomplete_date/hour` 是 freshness watermark，不是全量证明。
- anonymized queries 在无 query filter 的 totals 中通常仍计入，但使用 query filter 时不计；bulk export 用空 query 表示。禁止通过差值或其他维度试图重建受抑制查询。
- Search Console 日界线采用 `America/Los_Angeles`；与站点或业务时区对比前必须显式转换。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `taxonomy.list.owned-search-properties/v1` | account grant → property refs + permission | owned official API | `eligible` | 只建立候选 roster，不自动启用全部 properties |
| `analytics.query.owned-search-performance/v1` | property + aggregate query → performance dataset | owned official API | `eligible` | read-only POST；固定 dimension/filter/type/aggregation/dataState |
| `analytics.import.owned-search-bulk-export/v1` | approved BigQuery tables → daily performance datasets | authorized export | `manual-only` initially | 解决 API top-row/50K 限制；有 Cloud cost、region 和 IAM 边界 |
| `analytics.observe.search-performance-revisions/v1` | repeated final/provisional datasets → revisions | derived | `eligible` | fresh rows会变化；按 request hash/window 保存 observed snapshot |
| `diagnostics.inspect.owned-url-index/v1` | property + URL → index inspection | owned official API | `deferred` | 有价值但属于技术诊断，不是 query demand；配额独立 |
| `taxonomy.read.sitemaps/v1` | property → sitemap status | owned official API | `deferred` | SEO health context，非搜索意图核心 |
| `account.manage.search-property/v1` | account → add/delete property | platform write | `rejected` in this Pack | 不让需求采集改变 property 配置 |
| `account.manage.sitemap/v1` | property → submit/delete sitemap | platform write | `rejected` in this Pack | 独立 SEO operations workflow |
| `analytics.read.competitor-search-queries/v1` | arbitrary domain → queries | unsupported by owned API | `rejected` | property access不能扩张为竞品数据 |

## 4. Access Methods

### 4.1 `gsc-search-analytics-readonly/v1`

- mode：`official-api`；access class：`owned`；effect：`none/local-write`；
- auth：OAuth `webmasters.readonly`；service account 也必须由 property 管理者明确加入。credential bytes/token 不进入 config、Pack、日志或 fixture；
- discovery：`GET /webmasters/v3/sites` 返回可访问 property 与 permission level：[Sites list](https://developers.google.com/webmaster-tools/v1/sites/list)；
- analytics：`POST /webmasters/v3/sites/{siteUrl}/searchAnalytics/query` 虽用 POST，但只执行查询，不据 HTTP method 推断 platform-write；
- page：`rowLimit` 1–25,000，`startRow` offset；相同 request 除 offset 外必须冻结，直到空页；
- provider limit：最多暴露每 property、每日、每 search type 50K rows，按 clicks 排序，且官方不保证所有 rows：[Getting your performance data](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data)；
- freshness：通常 2–3 天；fresh/hourly 请求保存 incomplete metadata；
- quota：Search Analytics 有 10-minute/day load quota、per-site/per-user 1,200 QPM、per-project 40,000 QPM/30M QPD；page/query filters 和长日期窗增加 load：[Usage limits](https://developers.google.com/webmaster-tools/limits)；
- completion：只能对“冻结 query 在 provider 暴露 top-row population 中 offset 已耗尽”标 page complete；CoverageAssessment 仍为 `partial/truncated/unknown`，除非更窄 aggregate totals 有独立证据。

### 4.2 `gsc-bigquery-bulk-export/v1`

- mode：`authorized-export`；本轮只设计 `manual-only` preview/import；
- owner 必须在 Search Console 配置每日 export，并为 Google principal 配置 Cloud project/IAM；启停是外部配置写入，本 Pack 不执行；
- provider 声称导出 property 可用的全部 performance data，仍排除 anonymized queries：[Bulk export overview](https://support.google.com/webmasters/answer/12918484)；
- tables 不是天然按 date/query 唯一，查询必须按官方建议 `SUM` 等聚合；空 query 表示 anonymized query；
- BigQuery scan 产生费用，必须固定 partition/date、maximum bytes/cost 和 query hash；
- export failure 可能重试约一周，之后丢失该日；不能把缺 partition 当零流量：[Manage bulk exports](https://support.google.com/webmasters/answer/12919198)；
- API 与 bulk export 是两个 representation。bulk 更完整不代表可与 API cell 按行相加。

## 5. Platform Skills

### `gsc-pack-research/v1`

- purpose：`research/curate`；
- 核验 REST discovery、Search Analytics schema、performance definitions、quota、anomaly log、bulk tables/IAM 与 privacy rules；
- 只生成 evidence-bound KnowledgeProposal；禁止 OAuth、API、BigQuery 或外部 SDK 执行。

### `gsc-owned-search-intent/v1`

- purpose：`acquire`；
- 输入：固定 snapshot、用户确认 property roster、聚合 query profile、time window 和 cost budget；
- allowlist：sites list、read-only Search Analytics；bulk 只允许用户选择的 export fixture/import；
- 输出：原生 aggregate Observation、AggregateDatasetMetadata、request-scoped CoverageAssessment 与 restricted query projection；
- 禁止：写 property/sitemap、URL indexing、竞品 domain、重建 anonymized query、把 impressions 当全网 search volume。

### `gsc-conformance/v1`

- purpose：`verify/diagnose`；fixture 默认无网络；
- 验证 property identity、dimension order、offset、50K/top-row boundary、aggregation、fresh metadata、privacy suppression、timezone、quota 和 BigQuery duplicate grains；
- sandbox 需用户另行授权的最小 `webmasters.readonly` connection；不启用 bulk export、不写平台。

没有 Probe Skill。修改页面、投放搜索广告或提交 sitemap 可能影响未来指标，但属于独立内容/广告/SEO operations 和实验设计，不能由分析 Connector 反向执行。

## 6. Aggregate 与数据治理

每个 performance Observation 必须附 `AggregateDatasetMetadata`：

- grain 按 request dimensions 的原始顺序引用 concept/field；
- clicks、impressions 为 `sum-if-disjoint`，但只允许在相同 property/type/aggregation 与互斥 cells 中求和；
- CTR 为 `ratio`，指定 clicks/impressions 分子分母；
- average position 为 `provider-defined/non-additive`；
- dataState、watermark、firstIncompleteAt 和 `America/Los_Angeles` 显式保存；
- query suppression 记录 method 与 totals inclusion 条件；CoverageAssessment 另写 top-row、50K、filter 和 anonymized exclusions。

query 可能包含姓名、邮箱、账号、健康或其他敏感文本，即使 Google 已做隐私处理也不保证剩余 query 全部无 PII。raw query evidence 采用 restricted retention；默认报告做低频阈值、敏感检测和聚类，不向宽 audience 展示低频原文。query cluster 是派生 projection，必须保留 mapper/version 与 source counts。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 固定；未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [googleapis/google-api-go-client](https://github.com/googleapis/google-api-go-client/tree/0e513f755761be9adb93856a3fff5daae65c468d) `0e513f755761be9adb93856a3fff5daae65c468d` | Google 官方；BSD-3-Clause | generated Search Console v1 client、auth/error/schema reference | `official-reference`；生成 client 不等于 domain adapter |
| [googleapis/google-api-python-client](https://github.com/googleapis/google-api-python-client/tree/b0089df6768a806c3d837f71b5ba7eca79934e5a) `b0089df6768a806c3d837f71b5ba7eca79934e5a` | Google 官方；Apache-2.0 | discovery API、pagination/request samples | `official-reference` |
| [jurgisgavenas/search-console-mcp](https://github.com/jurgisgavenas/search-console-mcp/tree/87db9f315d27d63fef126d958dd9caac7505392d) `87db9f315d27d63fef126d958dd9caac7505392d` | community；MIT；两 commit 快照 | 独立 read-only scope/tool/network 三层约束样本 | `reference-only`；成熟度低，README claim 需 code/fixture 审计 |
| [airbytehq/airbyte Google Search Console agent docs](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/docs/ai-agents/connectors/google-search-console) `1339a9ecca6f8fb547ffb7b19665d6980c069026` | Airbyte；repo/connector 许可需路径级复核 | typed entity/action/skill surface 与 hosted/OSS split 参考 | `discovery-only`；不运行、不据文档授予数据或 credential |
| [saurabhsharma2u/search-console-mcp](https://github.com/saurabhsharma2u/search-console-mcp/tree/4eccd60aacb395abb247c79b6fb07d80a02f6fe1) `4eccd60aacb395abb247c79b6fb07d80a02f6fe1` | community；MIT | Google/Bing/GA4 cross-engine mapping、MCP schema 和 analytics heuristics | `reference-only/high-risk-surface`；同时暴露 site/sitemap/indexing writes，不能整体采用 |

## 8. Verification Plan

### evidence-review / static-contract

- URL-prefix/domain property identity、permission、search type、aggregation 和 timezone 不被 mapper 抹平；
- Search Analytics POST 被建模为 read effect；write capability 不进入 route；
- `AggregateDatasetMetadata` 对 CTR/position 声明正确 rollup 限制；
- Page.Complete、final dataState、50K limit、anonymized totals 与 market coverage 不混用；
- query raw text restricted，credential 只有 ref。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| URL-prefix + domain properties | exact siteUrl 保留，不跨 boundary 合并 |
| dimensions reordered | keys 按请求顺序映射，grain hash 改变 |
| 25K + 25K + empty | offset 耗尽但 coverage 仍标 top-row/50K limited |
| tied click rows | 不依赖 tie 稳定排序做 cursor/dedupe |
| no dimensions total | aggregate total 与 query rows 分 representation/grain |
| CTR/position rollup | CTR 由 clicks/impressions 重算；position 拒绝无权重再平均 |
| fresh metadata | final/provisional/incomplete 与 first incomplete watermark 正确 |
| anonymized query + query filter | totals inclusion 条件化，禁止差值重建 |
| expensive query quota | rate/load error 分类，缩小窗口需新 plan，不静默改语义 |
| BigQuery duplicate rows/missing day | 先 aggregate；缺日为 unknown，不是 zero |

### sandbox-live / operational-canary

需用户另行授权后，才可对一个低敏 property 运行只读 sandbox：先 sites list，再查询一个已 finalized 单日、低维 aggregate，验证 permission、schema、timezone、empty 与 quota。bulk export 需要独立 Cloud/IAM/费用授权。canary 监测 discovery/schema、anomaly log、data lag、firstIncomplete、load quota、row truncation 和 privacy behavior；不进行写操作。

## 9. 晋级缺口

进入 `modeled` 需要 accepted concept/capability/access snapshots、aggregate/query/coverage/privacy schemas 与 property roster；进入 `verified` 需要 fixture report，并经用户授权完成 read-only API sandbox。BigQuery 仍为 manual-only，直到另行完成 IAM、cost、partition 与 deletion verification。
