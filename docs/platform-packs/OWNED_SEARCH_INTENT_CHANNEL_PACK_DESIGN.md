# Owned Search Intent Channel Pack 设计

状态：`researched / mixed-maturity` 组合设计；未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`owned-search-intent/v0-design`

## 1. 目标与非目标

本 Channel Pack 回答：用户通过搜索引擎看到或点击自有站点时，使用了哪些 query，哪些需求主题正在出现、增长或未被页面承接。它组合 provider-native owned property statistics，不创造“跨搜索引擎全市场搜索量”。

```text
Google Search Console ──────────┐
                                ├─> Owned Search Intent Channel
Bing Webmaster (manual/migrating)┘       ├─ site roster
                                         ├─ aggregate semantics
                                         ├─ privacy/coverage policy
                                         └─ demand-intent projection
```

成员成熟度不对称是事实：Google 有可核验 read-only API 和 bulk export；Bing 在 2026-08-31 cutover 前处于 migration-blocked。Channel 不能让 Bing 借用 Google 的 schema、coverage 或 verification。

## 2. 成员 Pack

| Member | Role | 当前状态 | 可进入共同 research run 的路径 |
| --- | --- | --- | --- |
| [Google Search Console](GOOGLE_SEARCH_CONSOLE_PLATFORM_PACK_DESIGN.md) | primary owned search performance | `researched` | API eligible design；bulk manual-only |
| [Bing Webmaster Tools](BING_WEBMASTER_TOOLS_PLATFORM_PACK_DESIGN.md) | optional second engine | `researched/migration-blocked` | manual import only；REST API blocked |

共同 capability proposal 是 `analytics.query.owned-search-performance/v1`，但 Bing 在固定 REST contract 前不满足成员 maturity。Channel run 允许 Google-only + Bing-missing report，或 Google + 用户选择 Bing manual export；不得自动调用 legacy Bing。

## 3. Site Roster

每个研究 program 固定 `ChannelRosterRevision`：

| 字段 | 作用 |
| --- | --- |
| website/product subject ref | 用户确认的站点/产品主体；不从 domain 自动生成组织身份 |
| platform pack ref | 固定成员 Pack revision |
| platform surface | exact GSC `siteUrl` 或 Bing verified site URL |
| ownership/access evidence | property/site permission 或用户确认 export 来源 |
| connection requirement | 只引用 ConnectionProfile 条件，不含 token/key |
| query profile refs | search type、dimensions、filters、aggregation、data state 与窗口策略 |
| enabled/valid window | property migration、协议/host/path 变化追加 revision |

同一 domain 可在两个 engine 下关联到同一 subject，但 domain property、URL-prefix property 与 Bing site 原生 identity 不合并。GSC sites list 或 Bing user-wide key 中“可见”不等于自动纳入研究。

## 4. `owned-search-intent` Projection

| 字段 | 来源与规则 |
| --- | --- |
| engine/platform/pack/representation | 必填；API、bulk、manual 分开 |
| website + native surface refs | 来自 roster，不从 row URL 推断 |
| query text/ref | provider query；raw restricted，允许 privacy-safe cluster projection |
| page ref | provider page dimension；缺失不补首页 |
| event window/timezone | provider window与 timezone；对齐后另建 derived window |
| engine search type | Google type 或 Bing evidenced equivalent；unknown 保留 |
| dimensions/grain | 原始有序 grain；不同 grain 不直接 join/sum |
| clicks/impressions | engine-local counts；兼容互斥 cells 才可加 |
| CTR | 由 clicks/impressions 重算；不平均 provider CTR |
| average position | provider-local non-additive；默认不做跨 engine 数值比较 |
| data state/watermark | final/provisional/incomplete/unknown 与 first incomplete |
| privacy treatment | anonymized/omitted/thresholded、totals inclusion 与 evidence |
| coverage | property/type/window/filter/row cap/top-row/export/missing member |

### 4.1 需求解释边界

- impression 是自有结果被展示的机会，不是 query 的全网搜索量；
- click 表示进入 owned site，不是注册、购买、满意或问题解决；
- 高 impressions/低 CTR 是页面承接假设，不自动证明产品痛点；
- 无 impressions 可能是无需求，也可能是站点未排名、property 配错、数据延迟或隐私/row truncation；
- query cluster 可作为 `EvidenceSearchIntent`，仍需与客服、评论、转化、采购等证据交叉验证；
- SEO/内容改动会影响观察机制本身，趋势解释要保存 site/content revision 与 known anomalies。

## 5. Aggregate、Coverage 与 Privacy Policy

### 5.1 Aggregate contract

Channel 依赖新的 `AggregateDatasetMetadata`：

- grain 是有序 `AggregateDimension`；
- measures 明确 `sum-if-disjoint`、`ratio`、`weighted-mean/non-additive/provider-defined`；
- data state 与 coverage 完全分离；final 不等于 complete；
- privacy treatment 可表达某 dimension 被 omit/anonymize，以及是否有条件包含在 totals；
- provider-specific actual values 仍在 schema-bound payload，不向核心 Go 增加 Google/Bing 字段。

### 5.2 Coverage layers

```text
page/offset or export-object completion
                 ↓
provider row/privacy population
                 ↓
property + query-profile coverage
                 ↓
site roster/member coverage
                 ↓
cross-engine research window
```

- GSC API offset complete 仍受 top-row/50K/day/type/internal limits；
- GSC bulk export 更完整但排除 anonymized queries，并可能有 missing partition/export failure；
- Bing manual export 的 population 在 contract 未证实时保持 unknown；
- roster complete 只代表 enabled owned sites/engines，不代表搜索市场；
- member blocked/deferred 必须出现在 ChannelVerificationReport，不能用 Google data 填补 Bing。

### 5.3 Privacy

- query 原文按 restricted first-party data 处理；owned access 不等于可向全员分发；
- provider suppression 是必须保留的保护边界，禁止差分攻击或跨 dimensions 重建；
- broad reports 默认输出达到阈值的 clusters/aggregates，低频原文只对获批 research purpose 开放；
- 不持久化搜索用户 identity，因为两个成员本就不提供用户级 identity；不得与 cookies、CRM 联系人或评论昵称拼接。

## 6. Channel Skills

### `owned-search-site-roster-curation/v1`

- purpose：`research/curate`；
- 输入：用户站点、property/site evidence、成员 Packs、当前 roster；
- 输出：新增、迁移、停用、query profile 与 connection proposal；
- 禁止：自动纳入账号全部 sites、把同 domain 当同 property、读取 credential。

### `owned-search-intent-research/v1`

- purpose：`acquire`；
- 输入：固定 Channel/Platform snapshots、roster/query profiles、time window、privacy 与 cost budget；
- allowlist：GSC read-only API、用户选择的 GSC bulk/Bing export manual import；
- 输出：native aggregate Observations、逐 surface CoverageAssessment、privacy report、channel projection 与 trend/cluster candidates；
- 禁止：Bing legacy/future API、site/sitemap/index submission、竞品 domain、隐私重建、跨 engine metric 求和。

### `owned-search-intent-channel-conformance/v1`

- 先运行成员 fixture，再运行 grain/rollup/timezone/privacy/coverage/missing-member 场景；
- Bing API blocked 是可接受的显式 degraded result，不是用 mock success 隐藏；
- Channel report 引用成员 reports，不能替代。

本 Channel 没有 Probe Skill。Search Ads、landing A/B、页面/metadata 修改可成为独立 Probe；其 assignment、曝光与转化必须由相应系统记账，不能用自然搜索相关性声称因果。

## 7. 开源生态快照

| Artifact | Fixed revision | 价值 | 边界 |
| --- | --- | --- | --- |
| [googleapis/google-api-go-client](https://github.com/googleapis/google-api-go-client/tree/0e513f755761be9adb93856a3fff5daae65c468d) | `0e513f755761be9adb93856a3fff5daae65c468d` | Google official generated API surface | BSD-3-Clause；不是 domain adapter |
| [googleapis/google-api-python-client](https://github.com/googleapis/google-api-python-client/tree/b0089df6768a806c3d837f71b5ba7eca79934e5a) | `b0089df6768a806c3d837f71b5ba7eca79934e5a` | Google discovery/auth/schema reference | Apache-2.0 |
| [jurgisgavenas/search-console-mcp](https://github.com/jurgisgavenas/search-console-mcp/tree/87db9f315d27d63fef126d958dd9caac7505392d) | `87db9f315d27d63fef126d958dd9caac7505392d` | narrow read-only MCP boundary | community MIT；低成熟度 reference-only |
| [saurabhsharma2u/search-console-mcp](https://github.com/saurabhsharma2u/search-console-mcp/tree/4eccd60aacb395abb247c79b6fb07d80a02f6fe1) | `4eccd60aacb395abb247c79b6fb07d80a02f6fe1` | cross-engine concept/mapping/test candidate | community MIT；混合 read/write、大 tool surface、Bing migration 未验证 |
| [Airbyte GSC agent docs](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/docs/ai-agents/connectors/google-search-console) | `1339a9ecca6f8fb547ffb7b19665d6980c069026` | typed agent entity/action/skill design | license/hosted boundary 待路径级审计；discovery-only |

## 8. Verification Plan

### static-contract

- member/surface/query-profile refs、AggregateDatasetMetadata 和 coverage/privacy policy 自洽；
- CTR/position rollup 负向规则强制；
- GSC API 与 bulk、Bing manual/API candidate 分 representation；
- read Skills 没有 platform-write ports；
- Bing blocked 不继承 Google maturity。

### fixture-conformance

| Scenario | 必须证明 |
| --- | --- |
| same domain, different native surfaces | subject 可关联，property/site identity 不合并 |
| GSC property total + query rows | grain 不同，不重复相加；anonymized totals 条件可见 |
| GSC API + bulk overlap | 不按行相加，representation/coverage 分开 |
| Google PT vs Bing unknown timezone | 不静默按日期 join；unknown member 保留 |
| CTR/position cross-engine | CTR 从 counts 重算；position 默认不可比 |
| low-frequency sensitive query | broad projection 阈值/最小化，raw access 受限 |
| Bing REST unavailable | channel partial/missing-member，而非 Google-only complete |
| attempted write/index operation | policy 拒绝，零 platform-write |

### sandbox-live / operational-canary

第一阶段只允许经用户授权的 GSC read-only sandbox；Bing 仅 manual fixture。Bing post-cutover Pack 自身通过 evidence、fixture 和 sandbox 后，Channel 才发布新 revision 纳入 API member。canary 分 provider 监测 docs/schema/deprecation/anomaly、data lag、quota、privacy、row/export gaps 与 roster health。

## 9. 对架构的影响

本轮新增的是通用 aggregate provenance，而不是搜索平台专属对象：

- `AggregateDatasetMetadata` 记录 window/timezone、有序 grain、measure rollup、data state/watermark 与 privacy treatment；
- `Observation.PayloadBlob` 继续保存 schema-bound provider rows；
- `CoverageAssessment` 继续负责 top-row、50K、export、member 与 market boundary；
- `EvidenceSearchIntent` 让机会分析区分主动搜索证据与 complaint/repeated request；
- Probe `MetricObservation` 仍只服务有 assignment/receipt 的实验，不被滥用为通用 provider analytics。

这让广告、网站分析、support aggregates 等未来平台也可复用同一契约，同时避免平均 CTR、平均平均值和 final=complete 等系统性错误。

## 10. 晋级缺口

当前为 mixed-maturity design。进入 `modeled` 需要接受 GSC snapshot、Bing migration-blocked snapshot、aggregate/query/privacy/coverage schemas 与 roster；进入 `verified` 需要 GSC member fixture/sandbox 和 Channel fixtures。Bing API 只有 post-cutover REST 证据与独立验证通过后，才能在新的 Channel revision 中从 manual/blocked 晋级。
