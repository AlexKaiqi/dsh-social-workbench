# EU TED Published Notices Platform Pack 设计

状态：`researched` 设计候选；未调用 API、未下载公告、未运行 live probe  
核验日期：2026-08-26  
Pack ref：`eu-ted-published-procurement/v0-design`

## 1. 定位与边界

本 Pack 只覆盖 Tenders Electronic Daily 对已发布采购公告的公开 Search API v3 和官方公告格式链接，不覆盖 Publication、Validation、Conversion、Visualisation、eNotices2 私有提交记录、投标、供应商账号或外部 procurement documents。

[TED Search API](https://docs.ted.europa.eu/api/latest/search.html) 明确面向 published notices 的分析和复用，`POST /v3/notices/search` 无需认证；[TED API 概览](https://docs.ted.europa.eu/api/latest/) 则说明未发布公告相关服务需要 API key，并采用统一 v3 gateway。公开读取和公告提交必须是两个隔离的 access method。

```text
platform             eu-ted
surface              published notices search API v3 + official formats
state                researched
knowledge snapshot   proposal only
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `ted.procurement-notice/v3` | entity | eForms notice UUID | 发布公告；不是采购 procedure 本身 |
| `ted.notice-editorial-version/v3` | entity/value | notice UUID + two-digit version | 同一 notice 的编辑版本；公开时一个 notice ID 只有一个版本可发布 |
| `ted.ojs-publication/v3` | entity/value | OJS publication ID | 官方公报发布身份，可引用 legacy/eForms notice |
| `ted.procurement-procedure/v3` | entity | procedure UUID | 多个 notice 可属于同一采购 procedure；planning notice 可能没有该 ID |
| `ted.notice-form-type/v3` | enumeration | planning/competition/result/change/contract modification 等 | 阶段与法律文类，不统一成 generic RFP |
| `ted.change-notice/v3` | entity/event | 自身 notice UUID/version | 新公告，引用被改变公告，并包含 consolidated text 和 change reason |
| `ted.procurement-lot/v3` | entity | procedure/notice + `LOT-xxxx` | 标段；value、deadline、result 可在 lot 层，不能只保留 notice total |
| `ted.procurement-part/v3` | entity | procedure/notice + `PAR-xxxx` | planning/competition 范围中的 part；不等同于 lot |
| `ted.lots-group/v3` | entity | procedure/notice + `GLO-xxxx` | 多 lot 分组，保留成员关系 |
| `ted.organisation/v3` | entity | notice-local `ORG-xxxx` + business IDs | buyer、winner、service provider 等角色；notice-local technical ID 不跨公告自动合并 |
| `ted.tender-result/v3` | entity | notice/lot result technical ID | tender/result 事实，不代表完整合同执行 |
| `ted.contract/v3` | entity | result/modification context + `CON-xxxx` | 授标合同或修改引用；技术 ID 需带 notice/procedure scope |
| `ted.procurement-classification/v3` | value | CPV/NUTS/codelist value | 行业、地点和枚举均版本化，不能用自由文本覆盖 |
| `ted.notice-format-resource/v3` | entity/manifest | notice + format + language URL | XML/HTML/PDF 等官方公告表现；不是外部招标附件本身 |

[eForms schema](https://docs.ted.europa.eu/eforms/latest/schema/all-in-one.html) 区分 Notice Identifier/Version 与 Procedure Identifier；[Change Notice](https://docs.ted.europa.eu/eforms/latest/schema/change-notice.html) 说明 change notice 有自己的 notice ID，并引用被改变 notice/version。核心必须保留两种关系：同一 record 的 editorial version，以及不同 notice 之间的 lifecycle relation。

### 2.1 原生差异必须保留

- notice、notice version、OJS publication 和 procedure 是四种身份；不可选一个 ID 覆盖所有层。
- lot/part/group 的 value、deadline、result 和 document rules 可能不同，notice-level projection 不能吞掉子对象。
- change notice 是独立公告，不是把旧 Observation 原地覆写；其 consolidated text 与 change section 都需要保留。
- `ORG-xxxx`、`LOT-xxxx`、`CON-xxxx` 是上下文内技术 ID，跨 notice/procedure 关联必须使用官方 reference 或派生 evidence candidate。
- legacy TEDXML 与 eForms 并存；解析器必须保存 schema family/SDK version，而不能假定全部为当前 eForms。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `discovery.search.procurement-notices/v1` | expert query/scope → notice refs | anonymous API | `eligible` | v3 search，page 或 iteration mode |
| `content.read.procurement-notice/v1` | notice ref → selected fields/native payload | anonymous API/format URL | `eligible` | 保留 schema family、notice/procedure/version identity |
| `document.list.procurement-notice/v1` | notice → format/language descriptors | anonymous API | `eligible` | response 提供多格式/语言 URL |
| `document.read.procurement-notice/v1` | approved official format → bytes | anonymous official URL | `eligible-with-policy` | XML 优先作 normative evidence；PDF/HTML 为表现层 |
| `change.read.procurement-notice/v1` | change notice → referenced notice/sections/reason | anonymous API/XML | `eligible` | 不用 payload diff 替代官方 relation |
| `bulk.read.procurement-notices/v1` | release/day/month → notice packages | official download | `deferred` | 适合 backfill，但需单独 package/checkpoint/成本验证 |
| `graph.query.procurement/v1` | SPARQL query → RDF facts | TED Open Data Service | `deferred` | RDF coverage 与历史范围另有边界，不并入 Search API claim |
| `content.write.procurement-notice/v1` | eSender notice → publication status | authenticated Publication API | `rejected` | 与需求研究隔离，产生真实官方公告 |
| `response.submit.procurement-bid/v1` | supplier tender → receipt | external procurement system | `rejected` | TED published notice search 不提供该能力 |

## 4. Access Methods

### 4.1 `ted-search-v3-anonymous/v1`

- mode：`official-api`；official：`true`；authentication：none for published notices；
- endpoint：`POST https://api.ted.europa.eu/v3/notices/search`；
- input：expert query、fields、scope、pagination mode；
- page mode：最多检索 15,000 notices；每页最多 250、每页 fields 总数最多 10,000；
- iteration mode：以 provider token 继续，可检索全部 query results，但每页/fields 限制仍适用；token 是短期 cursor，不作为业务身份；
- output：total、selected fields 和各格式/语言 URL；
- coverage：只对固定 expert query、scope、fields 和 run window 声明；PAGE_NUMBER 达 15k 必须为 truncated，ITERATION 正常耗尽才可 best-effort complete；
- effect：network-read/local-write。

限制来自 [TED notice reuse/Search API](https://docs.ted.europa.eu/ODS/latest/reuse/search-api.html)。Search API 在 Preview 环境不可用，因此不能以 preview 作为 read sandbox；只读 sandbox 必须是生产公开查询的小流量调用。

### 4.2 `ted-official-notice-format/v1`

[TED reuse docs](https://docs.ted.europa.eu/ODS/latest/reuse/index.html) 说明公告可通过 XML、HTML、signed/unsigned PDF 和 daily/monthly package 获取。Search 结果中的 URL 先成为 `SourceArtifactDescriptor`；只有获批读取后，下载结果才成为 content-addressed evidence blob。外部 procurement documents、buyer site 链接与 TED 自身公告格式分开治理。

### 4.3 明确排除的发布面

[Publication API](https://docs.ted.europa.eu/api/latest/publish.html) 可以提交、查询和停止用户自己的公告，要求 API key/eSender 条件并改变真实采购发布状态。本 Pack 不注册这些 route，也不把 Preview 的 notice submission 当成产品需求 Probe。

## 5. Platform Skills

### `ted-pack-research/v1`

- purpose：`research/curate`；
- 核验 TED API/versioning、Swagger、Search fields、eForms SDK/active versions、notice types、reuse policy 和 OP-TED repositories；
- 输出 evidence-bound proposal；禁止获取 API key、提交公告或执行第三方 client/MCP。

### `ted-published-procurement-research/v1`

- purpose：`acquire`；
- 输入：固定 snapshot、expert query、scope、field allowlist、语言/格式策略和预算；
- allowlist：anonymous search/read/change relation/official format descriptor；
- 输出：native observations、procedure/lot/change relations、format manifests、query CoverageAssessment；
- 禁止：publication/validation/render submit、外部 tender document crawler、供应商联系或投标。

### `ted-conformance/v1`

- purpose：`verify/diagnose`；
- fixture 默认无网络；production anonymous sandbox 需用户另行批准；
- 必须覆盖 page/iteration、expired token、15k truncation、多语言/格式、eForms/legacy、notice/version/procedure、lot scope、change relation、unknown fields/codelists 和 XML safety。

本 Pack 不定义 Probe Skill。发布虚假采购公告或提交无意履约的投标会污染法律采购记录，不能成为产品测试手段。

## 6. 数据治理与复用

- [TED Open Data](https://docs.ted.europa.eu/ODS/latest/index.html) 明确公告数据用于公开查询和复用；复用政策仍需绑定 [Commission Decision 2011/833/EU](https://op.europa.eu/en/publication-detail/-/publication/cb76d4a0-c886-40bd-99d7-8db018a723d0/language-en) 证据，并保存 attribution/source/version。
- 公告中的个人联系人、签名和地址并非需求分析必要字段，默认最小化/去标识，不因公开性建立个人画像。
- buyer、winner 和 tenderer 的组织 identity 需保留原生 identifiers 和 role；名称相同不自动合并。
- estimated value、framework maximum、lot value、awarded value 和 contract modification amount 是不同金额语义；公共 projection 必须携 amount kind、currency 和 scope。
- XML 解析禁用外部实体/网络解析；PDF/HTML 不作为结构化事实的唯一真相；未知 schema/SDK/codelist 必须 quarantine 并触发 reverify。
- TED 官方公告格式与 buyer 外链采购文档分开保存 rights、availability 和 hash。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote` 固定；未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [OP-TED/eForms-SDK](https://github.com/OP-TED/eForms-SDK/tree/bfca29a575bdd3f5a3ca5b907214ce218cb15b1f) `bfca29a575bdd3f5a3ca5b907214ce218cb15b1f` | EU Publications Office official；CC-BY-4.0 | schemas、notice types、fields、codelists、validation/version drift | `official-evidence`；不是 Search adapter |
| [OP-TED/ted-rdf-docs](https://github.com/OP-TED/ted-rdf-docs/tree/63e5508318689a78e052ac4b5bb56faea9da5875) `63e5508318689a78e052ac4b5bb56faea9da5875` | official；CC-BY-4.0 | Open Data coverage、SPARQL/reuse documentation | `official-evidence`；RDF capability 仍 deferred |
| [OP-TED/ted-rdf-mapping-eforms](https://github.com/OP-TED/ted-rdf-mapping-eforms/tree/97670fdcabcd705eae8bc6df36bafd28c2acc2aa) `97670fdcabcd705eae8bc6df36bafd28c2acc2aa` | official；EUPL-1.2 | eForms XML→RDF mapping 与 ontology relation 参考 | `reference-only`；不进入 core schema/runtime |
| [kasey6801/TED-Search-API](https://github.com/kasey6801/TED-Search-API/tree/08c956d24da5418a032e3d02c9671ff0af86c5c9) `08c956d24da5418a032e3d02c9671ff0af86c5c9` | community；MIT | async client、CLI、MCP、query/pagination 表面样本 | `reference-only`；较新项目，未安全/行为审计，claims 回到 official docs |

## 8. Verification Plan

### evidence-review / static-contract

- Search v3/anonymous 与 Publication/authenticated 明确隔离；
- API v3 和 eForms SDK version 分别固定，不能混作一个 version 字段；
- notice editorial version 与 change/lifecycle notice relation 分开；
- procedure、lot、part、group、contract 保留 context-scoped identity；
- Page.Complete 与 query coverage 分开，15k page limit 强制 truncated；
- format descriptor 不等于 downloaded artifact；XML/HTML/PDF projection 保留 provenance；
- write/bid adoption rejected，不能物化 route。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| PAGE_NUMBER under/at 15k | under-limit 可完成；触顶标 truncated，不假称全量 |
| ITERATION token sequence | 顺序续读、token 过期/无效分类、checkpoint 不跳页 |
| same notice UUID versions | editorial revision relation 正确，不生成多个 procedure |
| original + change notice | 两个 native records；changed notice/version/section/reason 可追溯 |
| multiple lots/parts/groups | value/deadline/result 保留各自 scope |
| eForms + legacy TEDXML | schema family 分流，unsupported 进入 quarantine |
| multiple languages/formats | descriptors 去重且保留 language/media/signature role |
| unknown codelist/field | extension + reverify，不静默映射 |
| malformed/hostile XML | fail closed，无 external entity/network access |
| publication/bid request | policy/static gate 拒绝 |

### sandbox-live / operational-canary

用户另行批准后，只能在 production Search API 运行极小 anonymous read query，验证 Swagger 契约、page/iteration、format URL、query syntax error 和 redaction；不调用 publication/validation/preview。通过后再设计低频 canary，监测 v2/v3 active policy、Swagger/schema、eForms active SDK range、field/codelist、iteration failures、format availability 和 query coverage drift。

## 9. 晋级缺口

从 `researched` 到 `modeled` 需要 accepted native ontology、Search request/response schema、expert query profile、rights/attribution、format and XML policy；从 `modeled` 到 `verified` 需要 fixture report 与获批的小流量 production read sandbox。当前不授权 Connector、下载或 live request。
