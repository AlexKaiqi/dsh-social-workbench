# Public Procurement Demand Channel Pack 设计

状态：`superseded-researched` 组合设计；已由 [v0.2](PUBLIC_PROCUREMENT_CHANNEL_PACK_V0_2_DESIGN.md) 取代，成员 Platform Pack 均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`public-procurement-demand/v0-design`

## 1. 为什么采购需要 Channel Pack

SAM.gov 与 EU TED 都提供公共采购信号，但 jurisdiction、公告类型、身份、版本、分类、金额、语言、API 和复用政策均不同。共同价值是“公开采购主体以正式公告表达计划、竞争、结果或变更”，而不是一个同构的 RFP 表。

```text
SAM.gov Opportunities Pack ─┐
                             ├─> Public Procurement Channel Pack
EU TED Published Pack ──────┘       ├─ query portfolio
                                    ├─ stage-aware projection
                                    ├─ history/document policy
                                    ├─ coverage + relation policy
                                    └─ channel skills + verification
```

Channel Pack 不复制成员 schema、credential 或条款，不把 SAM solicitation number 与 TED procedure UUID 统一成假 ID，也不让 TED 的匿名读取成熟度覆盖 SAM 的 API-key route。

## 2. 成员 Pack 与共同能力

| Member | Platform | 公开访问面 | 当前状态 |
| --- | --- | --- | --- |
| [SAM.gov Opportunities Pack](SAM_GOV_OPPORTUNITIES_PLATFORM_PACK_DESIGN.md) | `sam-gov` | key-required Get Opportunities API v2 | `researched` design |
| [EU TED Published Notices Pack](EU_TED_PLATFORM_PACK_DESIGN.md) | `eu-ted` | anonymous Search API v3 + official notice formats | `researched` design |

共同 capability proposal：

- `discovery.search.procurement-notices/v1`
- `content.read.procurement-notice/v1`
- `document.list.procurement-notice/v1`
- `change.observe.procurement-notice/v1`

`document.read` 只在成员 rights/security policy 通过后允许；TED 的 native change notice 与 SAM 的 repeated observation diff 不强制映射成同等质量的 change evidence。

## 3. Query Portfolio 而非平台 Roster

采购来源不是按企业 board token 加入，而是按 jurisdiction 和研究问题固定版本化 query portfolio。本 v0 设计曾沿用 `ChannelRosterRevision` 并以 schema-bound extension 保存 query；v0.2 已以一等 `ChannelScopeRevision` 纠正该抽象。以下内容保留为历史设计证据：

| 字段 | 作用 |
| --- | --- |
| jurisdiction/market | US federal、EU/OJS 等法律与地理边界 |
| member Pack ref | 固定 SAM/TED Pack version |
| query profile | date/publication window、notice stages、classifications、buyer/region、language |
| query dialect/schema | SAM params 或 TED expert-query schema/version |
| purpose | 市场扫描、具体主题、buyer watch、award/change follow-up |
| inclusion/exclusion | 明确不覆盖的 notices、系统、阈值、私有采购和外部文档 |
| valid window/evidence | 研究范围变化追加 revision，不改写历史 run |

Query portfolio 不是“所有政府采购”。SAM 的 date window、TED 的 scope/query/format、法定发布阈值、非成员国家/门户、线下/框架内调用和私有招标均需列为 exclusions。

## 4. `procurement-demand` Projection

原生 Observation 与文档保持不变，Channel 只生成有 provenance 的最小公共投影：

| 字段 | 规则 |
| --- | --- |
| source platform/pack/snapshot | 必填，不能被聚合删除 |
| native notice/revision refs | 保留 provider identity、native/observed revision semantics 和 history coverage |
| jurisdiction/publication system | 明确 US federal、EU OJS；不从语言猜 jurisdiction |
| stage/document type | planning/market research/competition/result/change/award/special/unknown；保存原生 code |
| buyer/issuing organisation | 保留原生 hierarchy/identifier/role；跨源名称匹配只生成 relation candidate |
| procedure/solicitation refs | 分列 provider-native refs，不生成共享 canonical ID |
| title/description evidence | 保存语言、raw span、source revision 与 mapper version |
| classification facets | NAICS/PSC、CPV/NUTS 等保留 taxonomy/version；跨 taxonomy mapping 为派生 evidence |
| lot/part scope | amount、deadline、place、result 均带 notice/procedure/lot scope |
| deadlines | deadline kind、time zone/source text；缺失不补默认值 |
| amounts | amount kind、currency、min/max/value、tax/estimated/awarded/framework scope；不可只存一个 `budget` |
| lifecycle relations | native change/result/award relations优先；collector diff 标为 observed only |
| document manifest | URL、role、language、media、credential requirement、retrieval/rights state分开 |

### 4.1 阶段解释

```text
planning / market research
        ↓ may lead to
competition / solicitation
        ↓ may lead to
result / award
        ↓ may receive
change / correction / contract modification
```

箭头只是可能的生命周期关系，不是所有 notice 都完整出现。Sources Sought 可用于市场研究但不一定产生 solicitation；Award 是结果信号而非开放机会；Special Notice 可能没有可投标需求。需求排序必须同时使用 stage 与 deadline，而不是标题关键词。

### 4.2 去重与关联

- canonical key 始终是 `platform + native notice ID (+ native version where applicable)`；
- SAM noticeId、solicitation number、TED notice UUID、OJS publication ID 和 procedure UUID 不互换；
- 同一采购可能在多个门户出现，跨源只生成带 evidence、score、relation type 和 mapper version 的 candidate；
- title/buyer/amount 相同不足以合并；translated notices、lots、change notices 和 awards尤其容易误合并；
- 原生 relation 优先于模型推断；推断不得改写 native identity/history。

## 5. History 与 Document Policy

采购证据常因修订和附件变化而改变，因此 Channel Pack 强制两张独立账：

```text
native lineage                     collector lineage
provider-declared version/change   observed payload/hash over time
```

- SAM public API：默认 `latest-exposed-only`；collector diff 不能补称完整原生历史；
- TED：notice editorial version 与独立 change notice relation 分开；legacy/eForms schema family 同时保留；
- document descriptor、retrieval attempt、content blob、parsed projection 和 rights decision 分离；
- 同一 URL 内容变化产生新 hash/blob，不覆盖旧 evidence；
- failed/forbidden/missing document 是可观测状态，不由 Agent 猜内容。

## 6. Coverage Policy

采购覆盖至少有四层：

```text
page/cursor coverage
    ↓
query-window coverage
    ↓
member-surface coverage
    ↓
portfolio/channel coverage
```

- SAM：强制 date window，全部 page 成功且 total/unique count 一致，才可对该 query/window best-effort complete；history 仍 latest-only；
- TED PAGE_NUMBER：最多 15k，触顶必须 truncated；ITERATION 正常耗尽才可对 query result best-effort complete；
- member surface：一个 query 成功不覆盖未执行的 type/classification/buyer/language profile；
- portfolio：全部 enabled query entries 在窗口内完成才可 portfolio-complete；
- portfolio-complete 仍不代表整个采购市场，因为法定阈值、非公开采购、其他国家/州/城市门户、框架内订单和私有 RFP 在 exclusions 中。

`CoverageAssessment.Boundary` 必须包含 jurisdiction、member surface、query revision、time window、stage/classification inclusions 和所有上述 exclusions。

## 7. Channel Skills

### `public-procurement-query-curation/v1`

- purpose：`research/curate`；
- 输入：研究主题、jurisdiction、成员 Packs、当前 portfolio revision、taxonomy mappings；
- 输出：query add/change/disable proposal 与 expected coverage；
- 禁止：自动扩大到 sensitive/private APIs、猜 API key、抓页面、把关键词翻译当 taxonomy equivalence。

### `public-procurement-demand-research/v1`

- purpose：`acquire`；
- 输入：固定 Channel Pack、成员 snapshots、query portfolio、time/cost/document budgets；
- allowlist：成员公开 search/read/manifest 与获批 document read；
- 输出：native Observations、stage-aware projection、native/collector history、per-query/member/channel coverage 和 missing-document report；
- 禁止：联系人画像、营销外联、公告写入、供应商注册、投标或虚假响应。

### `public-procurement-channel-conformance/v1`

- purpose：`verify/diagnose`；
- fixture 默认无网络；先运行成员 conformance，再验证 cross-provider projection/history/documents/coverage；
- 成员失败局部 degrade，不能用另一个司法辖区的成功补齐。

没有 Channel Probe Skill。采购信号适合发现与验证预算事实，但平台内任何发布/响应都不是无害测试。对采购痛点的主动 Probe 应转移到自有 landing page、访谈、问卷或合规广告渠道，并在 Probe ledger 中引用采购 evidence，而不是操作采购平台。

## 8. 开源生态快照

成员 Pack 已分别固定官方 docs/schema 与 community client/MCP 候选。Channel 层额外关注跨采购标准，但不把标准实现自动变成 adapter：

| Artifact | Revision | 价值 | 边界 |
| --- | --- | --- | --- |
| [GSA/open-gsa-redesign](https://github.com/GSA/open-gsa-redesign/tree/92a23c445872c6c225a54a16120eb3c73b878f91) | `92a23c445872c6c225a54a16120eb3c73b878f91` | SAM official API contract drift | CC0 official evidence |
| [OP-TED/eForms-SDK](https://github.com/OP-TED/eForms-SDK/tree/bfca29a575bdd3f5a3ca5b907214ce218cb15b1f) | `bfca29a575bdd3f5a3ca5b907214ce218cb15b1f` | TED native schema/notice/codelist truth | CC-BY-4.0 official evidence |
| [OP-TED/ted-rdf-mapping-eforms](https://github.com/OP-TED/ted-rdf-mapping-eforms/tree/97670fdcabcd705eae8bc6df36bafd28c2acc2aa) | `97670fdcabcd705eae8bc6df36bafd28c2acc2aa` | XML/RDF/procurement ontology mapping reference | EUPL-1.2；不写入 core schema |
| [MindPetal/sam-search](https://github.com/MindPetal/sam-search/tree/349e09bdc994528c4b37f517f2e5abdf42026ed6) / [kasey6801/TED-Search-API](https://github.com/kasey6801/TED-Search-API/tree/08c956d24da5418a032e3d02c9671ff0af86c5c9) | pinned above | 两种 pagination/query/tool surface 的 fixture 发现样本 | community/MIT；不安装执行，不能替代官方契约 |

跨平台标准只能作为 projection vocabulary 候选；如果未来采用 OCDS/eProcurement Ontology，应单独固定版本、mapping report 和 information-loss tests，不能把平台原生对象直接转换后丢弃。

## 9. Verification Plan

### evidence-review / static-contract

- 两个成员的 access/auth/version/terms 独立；
- common projection 保留 stage、native ID/revision、jurisdiction、amount kind 和 lot scope；
- native vs observed history 不混用，history coverage 可查询；
- document descriptor/retrieval/blob/projection/rights 五层不合并；
- Channel plan 固定成员 reports 与 query portfolio revision；
- no probe/write/bid capability 出现在 allowlist。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| SAM solicitation + TED competition | 映射 common stage，但保留原生 type/identity |
| SAM Sources Sought + TED planning | 标 market-research/planning，不排名为 open bid |
| SAM Award + TED result/contract | amount kind/scope 分开，不变成当前 RFP |
| TED notice/change + SAM payload diff | native lifecycle 与 observed change 质量不同 |
| TED multi-lot + SAM notice-level amount | lot scope 不被 notice aggregate 覆盖 |
| same buyer/title/amount across members | relation candidate，不自动 merge |
| SAM latest-only history | channel 明示缺口，不借 TED history 补全 |
| page/iteration truncation | query/member/channel coverage 正确降级 |
| document URL changes/content changes | descriptor、attempt、hash revision 可追溯 |
| one member auth failure | channel partial/degraded；TED 结果仍可用但不补 US coverage |
| PII/contact fields | common projection 移除，受限 evidence 保留最小必要项 |
| write/bid payload | policy blocker |

### sandbox-live / operational-canary

需用户分别批准 SAM credentialed read 和 TED anonymous production read，成员 sandbox 均通过后才验证 Channel projection/coverage；不下载未批准文档、不抓页面、不写公告或投标。Channel canary 监测成员 report expiry、query portfolio freshness、classification mapping、stage/amount mapper drift、history gap、document availability 和 partial rate；它不能替代成员 API canary。

## 10. 生命周期与晋级门

```text
member Packs verified independently
              ↓
query portfolio + projection schemas
              ↓
Channel modeled -> fixture-verified -> sandbox-verified -> operational
```

Channel 成熟度不能高于当前使用 capability 的最低成员 maturity。新增中国政府采购、UK Find a Tender、州/城市门户或企业 RFP 邮箱时，必须先形成各自 Platform Pack/access policy，再发布新的 Channel Pack revision。当前停在 `researched`，不授权 Connector、API call、document download 或平台副作用。
