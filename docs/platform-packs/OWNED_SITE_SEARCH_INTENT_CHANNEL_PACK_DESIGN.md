# Owned Site Search Intent Channel Pack 设计

状态：`researched` 组合设计；未发布、未连接平台  
核验日期：2026-08-26  
Channel Pack ref：`owned-site-search-intent/v0-design`

## 1. 目标与非目标

本 Channel 回答：用户在自有站点、帮助中心或产品内主动搜索什么，哪些 query 高频、无结果、点击弱或未转化，从而形成可验证的需求/痛点假设。

它与 [Owned Search Intent](OWNED_SEARCH_INTENT_CHANNEL_PACK_DESIGN.md)（Google/Bing 外部搜索引擎曝光）是两个独立 channel：前者观察用户已经进入自有 surface 后的搜索，后者观察自有页面在外部搜索引擎中的展示和点击。二者可在明确的 dual-instrumentation evidence 下关联，但不得按 query 文本直接拼接或相加。

```text
Algolia analytics ─────┐
                       ├─> Owned Site Search Intent
Typesense analytics ───┘      ├─ surface/index/rule roster
                              ├─ capture + query representation
                              ├─ outcomes + interaction definitions
                              ├─ privacy + coverage
                              └─ demand hypotheses, not conclusions
```

## 2. 成员 Pack 与共同能力

| Member | Native model | 当前状态 | 共同 read path |
| --- | --- | --- | --- |
| [Algolia](ALGOLIA_SITE_SEARCH_ANALYTICS_PLATFORM_PACK_DESIGN.md) | application/index Analytics API、queryID event attribution | `researched` | analytics top/no-results/interaction aggregates |
| [Typesense](TYPESENSE_SITE_SEARCH_ANALYTICS_PLATFORM_PACK_DESIGN.md) | v30.2 rule + destination collection + optional event log | `researched` | rule/schema + popular/nohits destination aggregates |

共同 capability proposal 是 `analytics.read.owned-site-search-intent/v1`。共同抽象只规范 definition、dataset、privacy 与 coverage；provider payload、rule、metric 和 identity 不被压平成伪统一字段。

## 3. Surface 与 Definition Roster

每个 `ChannelRosterRevision` 固定：

| 字段 | 作用 |
| --- | --- |
| product/site subject ref | 用户确认的产品、站点、帮助中心或功能面；不从 index 名自动推断 |
| platform/Pack/connection ref | 固定成员版本和 credential 条件；不保存 secret |
| surface + index/collection refs | exact app/index 或 cluster/source/destination/rule；环境与 locale 分开 |
| schema/query pipeline refs | searchable fields、normalization、synonym、rule、ranking、filter schema 的已知 revision |
| capture policy | analytics include/exclude、typeahead pause/debounce、empty browse query、auto/API event、traffic/identity policy |
| interaction definitions | click/conversion/purchase/visit 的业务定义、计数单位、query link 与 attribution window |
| privacy/retention refs | raw query、filter、tokens、object IDs 的最小化、阈值、quarantine、删除规则 |
| valid window | deploy/config/instrumentation 变化追加 revision，不回写历史定义 |

同一产品的 Web、mobile、help center、不同 locale 或 production/staging 可能共享主题，但不是同一统计 population。roster complete 只代表批准的 surfaces，不代表所有用户入口。

## 4. SearchIntent Contract

### 4.1 Definition

`SearchIntentDefinitionMetadata` 固定 `SurfaceRef`、`IndexRef`、`SchemaRef`、query pipeline、normalization、synonym、rule、ranking、filter schema、locale、capture policy、interaction definitions 与有效窗口。任何会改变“什么请求被计数、什么算 hit、什么算 conversion”的变化都创建新 revision。

### 4.2 Dataset

`SearchIntentDatasetMetadata` 固定：

- definition ref/revision、window/timezone；
- query representation：`submitted/normalized/expanded/categorized/provider-defined`；
- outcome：`with-results/no-results/error/unknown`；
- attribution：`query-id/session/provider-correlated/unattributed/unknown`；
- total/tracked search、hit count 与 zero-result rule refs；
- latency/completeness/privacy refs 和 evidence。

实际 query/count/rate/filter 继续存在 schema-bound payload；metadata 不持久化 query 文本、user token 或 object ID。

## 5. 统一 Projection 与需求解释

| Projection field | 规则 |
| --- | --- |
| subject/surface/provider/Pack | 必填；同 query 不自动合并 surface |
| query representation/ref | 原文 restricted；submitted 与 expanded 分开 |
| outcome | provider native hit/nohit + fixed filter/rule revision |
| search count | 保留 total/tracked/captured population，不制造跨 provider 同分母 |
| interaction counts/rates | 绑定事件定义、query link、窗口；ratio 从兼容分子分母重算 |
| configuration context | schema/ranking/synonym/rule/filter/locale revision |
| completeness | roster、capture、flush/retention、event instrumentation、threshold、late data |
| demand hypothesis | query theme + alternative explanations + corroborating evidence，不是自动结论 |

### 5.1 反误判规则

- 零结果可能是未提供能力，也可能是 typo、filter、索引延迟、语言、库存、权限、synonym/rule 或 relevance 问题。
- 高搜索量可能表示强需求，也可能表示导航失败、内容难找、默认入口设计差或 bot/test traffic。
- 低 CTR/CR 可能来自结果质量，也可能是 event 丢失、queryID/identity 不连续、定义变化或页面可直接满足而无需点击。
- 有结果不代表问题已解决；点击/购买也不证明满意或因果关系。
- 只有与 support、survey、usage、billing、experiment 等独立证据交叉验证，才能提升 Opportunity confidence。

## 6. Coverage 与 Privacy

```text
provider page/destination complete
             ↓
capture + pause/debounce + flush/retention
             ↓
event instrumentation + attribution coverage
             ↓
surface/index/rule roster coverage
             ↓
owned-product user population
```

- Algolia total/tracked 和 Typesense captured/paused query 分母不能互换；
- flush/watermark 前 missing 为 unknown/late，不是 zero；
- 空 query browse population 默认不进入文字需求排行；若进入，必须单独 representation；
- query/filter 可能含 PII、credential-like secrets、医疗/财务文本或 tenant 标识，默认 aggregate-first；
- broad materialized view 只包含达到阈值、通过敏感检测的 cluster/count；raw query 进入 restricted/quarantine 并有 retention；
- 禁止长期保存或拼接 Algolia userToken/queryID、Typesense user ID/IP、object ID 与 CRM identity。

## 7. Channel Skills

### `owned-site-search-roster-curation/v1`

- 输入：产品 surfaces、成员 Packs、已知 index/rule/config/instrumentation evidence；
- 输出：roster/definition proposal 和 evidence gaps；
- 禁止：自动枚举并启用账号全部 index/collection、读取 credential、修改搜索配置。

### `owned-site-search-intent-research/v1`

- 输入：accepted Channel/Platform snapshots、roster、window、privacy/coverage budget；
- 运行成员只读 route，输出 native Observations、SearchIntent metadata、coverage 和 hypotheses；
- 禁止：event send、rule/settings/synonym/index/document write、raw user log、把 no-hit 自动转 Opportunity。

### `owned-site-search-channel-conformance/v1`

- 先运行成员 fixtures，再验证跨成员 denominator、representation、outcome、privacy、late data 与 missing member；
- Channel report 引用成员 report，不能让一个成员的 verified 状态覆盖另一个；
- 无 Probe Skill。主动发查询、点击或转化事件会污染 analytics，只能在独立 sandbox/Probe ledger 中显式批准、标记 synthetic traffic 并验证清理/排除。

## 8. 动态索引与物化视图

raw/native observations append 到分析存储；Pack、definition 和 schema snapshot 进入版本化知识存储。Indexer 按查询需求构建可重建投影，而不是把 cluster 当永久事实：

| Projection | Key / refresh trigger | 约束 |
| --- | --- | --- |
| `site-search-query-theme` | subject + surface + definition revision + window | mapper/version 可追溯；query 原文 restricted |
| `site-search-no-result-watch` | rule/filter/config revision + query cluster | config drift、late flush 或补数据触发重算 |
| `site-search-interaction-funnel` | event definition + attribution method/window | total/tracked 与 unmatched 单列 |
| `site-search-evidence-gap` | hypothesis + alternative explanation checks | 不满足交叉证据时保留 gap，不发布结论 |

物化视图保存 snapshot/ref、source watermark、schema/mapper version 和 coverage hash，可失效、重建和并列保留旧 revision；不覆盖原生 observations。

## 9. Verification Matrix

| Scenario | 必须证明 |
| --- | --- |
| total vs tracked/captured | 分母不互换，率按兼容 population 计算 |
| zero vs null/missing | 0、null、late、suppressed、not-instrumented 均可区分 |
| typeahead/prefix expansion | pause/debounce 与 submitted/expanded representation 保留 |
| empty browse query | 与文字 query 分 population，不制造空主题 |
| filter/rule/config drift | hit/nohit 解释绑定 exact definition revision |
| click/conversion attribution | queryID/session/provider inference、window、unmatched 分开 |
| internal/bot/synthetic | exclusion policy 生效；unknown traffic 降低 coverage |
| sensitive/low-frequency query | broad view 阈值/脱敏，raw restricted/quarantine |
| member missing/blocked | channel 报告 partial，不以另一成员填补 |
| MCP/Skill broad authority | 只读 discovery 不等于 deterministic Connector；write tools 被拒绝 |
| attempted write/event send | rule/settings/index/document/counter/event route 全部 policy reject |

用户另行授权后，sandbox 只对单一低敏 surface 做最小只读查询，并先用 fixtures 验证不会污染 analytics。operational canary 分成员监测 docs/API/schema/version/license、index/rule roster、capture/instrumentation、flush lag、quota、privacy 与 result drift。

## 10. 晋级缺口

进入 `modeled` 需要接受两个成员 Pack、Channel roster、SearchIntent schemas、privacy/coverage 与 materialization policy；进入 `verified` 需要成员 fixture、Channel fixture 和分别授权的 read-only sandbox。Probe、event send、配置/索引变更始终是独立 write capability，不随 acquisition 自动获得授权。
