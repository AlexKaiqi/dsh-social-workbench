# UK Find a Tender（FTS）Platform Pack 设计

状态：`researched` 设计候选；未调用 API、未下载 notice/document、未运行 live probe  
核验日期：2026-08-26  
Pack ref：`uk-find-a-tender-public/v0-design`

## 1. 定位与边界

本 Pack 覆盖英国 Find a Tender Service 已发布采购公告的公开 OCDS release/record package API 和官方 daily XML 输出，不覆盖 authenticated eSender submission API、Central Digital Platform supplier data、商业搜索内部 API、投标或外部 e-procurement portal。

[FTS Data and API documentation](https://www.find-tender.service.gov.uk/Developer/Documentation) 明确公告数据按 OCDS 1.1.5 加 extensions 输出并采用 Open Government Licence；[OCDS release package API](https://www.find-tender.service.gov.uk/apidocumentation/1.0/GET-ocdsReleasePackages) 提供无账号公开 GET、cursor、updated time 和 stage filter。另一个同域 [REST API specification](https://www.find-tender.service.gov.uk/apidocumentation/home) 面向 eSender submission，需要 CDP API key，必须隔离。

```text
platform             uk-find-a-tender
surface              public OCDS API 1.0 + official daily XML
state                researched
knowledge snapshot   proposal only
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份 | 关键语义 |
| --- | --- | --- | --- |
| `fts.contracting-process/v1` | entity | `ocid` (`ocds-h6vhtk-*`) | 一个采购过程；相关 notices 通常共享 OCID |
| `fts.notice/v1` | entity | notice ID / release identity | 一次发布公告；不是 compiled process record |
| `fts.ocds-release/v1.1.5` | event/projection | release `id` within OCID | 官方从 notice 映射的 OCDS release；release ID 只在该 process 内唯一 |
| `fts.ocds-record/v1.1.5` | entity/projection | OCID | 将 releases 汇编的当前 record package；不是不可变原始公告 |
| `fts.notice-type-procurement-act-2023/v1` | enumeration | UK1…UK17（按官方集合） | pipeline、market engagement、planned、tender、transparency、award、contract、performance、change、termination、dynamic market、payments 等 |
| `fts.legacy-notice-type/v1` | enumeration | F/T form codes | 2025-02-24 前旧法规及过渡 notice types；不能强制映射成 UK codes |
| `fts.contract/v1` | entity | OCID + contract ID | 一个 process 可产生多个 contracts，尤其多 lot procurement |
| `fts.lot/v1` | entity | OCID/release + lot ID | tender/award/contract value 和 supplier 关系的 scope |
| `fts.party/v1` | entity/role | release-local party ID + official identifier | buyer/supplier/procuring entity；party ID 仅在 release 内唯一 |
| `fts.classification/v1` | value | CPV + scheme/version | 行业分类；geography/other classifications 分开 |
| `fts.notice-document/v1` | entity/manifest | release/notice + document ID/URL | tender/contract/notice documents；OGL notice data不自动覆盖第三方文档权利 |
| `fts.process-relation/v1` | relationship | OCID/release/relatedProcess | notice sequence、direct award after failed procedure、cross-publisher relation等 |

[Notice types and sequences](https://www.find-tender.service.gov.uk/Home/NoticeTypes) 说明 2025-02-24 起 Procurement Act 2023 notice sequence，并明确 UK4 tender、UK6 award、UK7 contract details、UK10 contract change、UK11 contract termination、UK12 procurement termination等差异。一个采购过程可有多个合同，一个 notice 也可能覆盖多个合同。

### 2.1 OCDS 是官方 projection，不是原生 schema 的替代品

- FTS 将公告映射到 OCDS 1.1.5；Observation 的 representation 必须标 `provider-projection`，固定 base standard、extensions 和 mapping evidence。
- release 是阶段性发布，record 是编译视图；record 更新不能覆盖 releases。
- OCID 是 FTS publisher 的过程 ID。其他 publisher 对同一现实采购可分配不同 OCID；只能通过官方 related process/evidence 建立跨 publisher relation。
- party ID 仅在 release 内唯一；组织归并必须使用 identifier scheme/id 和 provenance，不按名称硬合并。
- FTS 同时存在 Procurement Act 2023 UK notices、旧法规 forms 和可能关联早期 TED notices，parser/ontology 必须按 regime 分流。

## 3. Capability adoption

| Capability | Access | Adoption | 边界 |
| --- | --- | --- | --- |
| `discovery.list.procurement-releases/v1` | public OCDS API | `eligible` | cursor + updatedFrom/To + planning/tender/award stage |
| `content.read.procurement-notice/v1` | public release package | `eligible` | notice/release identity 与 OCDS projection metadata |
| `history.read.procurement-process/v1` | public record package by OCID | `eligible` | record/release history视 publisher completeness，不声称现实过程绝对完整 |
| `document.list.procurement-notice/v1` | OCDS documents / notice page | `eligible` | descriptor only |
| `document.read.procurement-notice/v1` | official/linked URLs | `eligible-with-policy` | host、OGL/third-party rights、安全与大小单独判定 |
| `bulk.read.procurement-notices/v1` | data.gov.uk daily XML zip | `eligible-with-policy` | backfill/checkpoint/schema family 单独验证 |
| `content.write.procurement-notice/v1` | eSender REST API | `rejected` | authenticated CDP API key，真实发布副作用 |
| `response.submit.procurement-bid/v1` | external procurement systems | `rejected` | FTS 是发现/公告平台，不是统一投标 API |
| `supplier.read.central-platform/v1` | Central Digital Platform | `rejected/deferred` | 与公开 notice research 不同数据面和隐私/授权边界 |

## 4. Access Methods

### 4.1 `fts-public-ocds-api-1.0/v1`

- mode：`official-api`；authentication：none；rights：OGL v3；
- release endpoint：`/api/1.0/ocdsReleasePackages`；可按 notice ID、OCID、`updatedFrom/updatedTo`、stage 过滤；
- pagination：`limit` 1–100，cursor 由 provider 返回，opaque 保存；
- record endpoint：`/api/1.0/ocdsRecordPackages/{ocid}`；编译 process record，不替代 release ledger；
- schema：OCDS 1.1.5 + response `extensions`；每次 run 固定实际 package `version`、extension URLs 和 mapping evidence；
- rate/availability：429/503 使用 `Retry-After`，不能并发加速绕过；
- coverage：对 fixed updated window/stages 正常耗尽 cursor 才可 best-effort complete；API completeness 与 statutory/publisher coverage 是不同维度；
- effect：network-read/local-write。

### 4.2 `fts-daily-xml-data-gov-uk/v1`

官方文档说明 data.gov.uk 提供每日 ZIP，每个 published notice 一个 XML。该 route 适合 backfill 和 API reconciliation，但必须固定 XML schema family、release date、file digest、package member manifest 和 OGL metadata；不能与 OCDS record package混成一个 cursor。当前仅 `eligible-with-policy`，未形成 runtime adapter。

### 4.3 排除 eSender / internal search

eSender REST API 的 submit/attachment/submission-info/search/render 需要 CDP API key，是发布主体管理自己的 submitted notices 的 write/control surface。integration 环境里可见的 search/data-sharing Swagger 也不能在没有正式公开文档和授权边界时冒充 production public API。本 Pack 只采用公开 OCDS/data outputs。

## 5. Platform Skills

### `fts-pack-research/v1`

- purpose：`research/curate`；
- 跟踪 FTS developer docs、OCDS mapping/extensions、notice types/regime、API errors、OGL、XML schemas、data.gov.uk dataset 和官方 source repos；
- 只生成 evidence/knowledge proposal；禁止调用 submission API、获取 CDP key 或执行第三方 collector。

### `fts-public-procurement-research/v1`

- purpose：`acquire`；
- 输入：固定 snapshot、updated window/stages/OCID allowlist、field/document budget；
- 输出：release Observations、record relation、representation metadata、documents、query CoverageAssessment；
- 禁止：supplier personal data enrichment、internal search API、notice publication、external portal interaction或投标。

### `fts-ocds-conformance/v1`

- purpose：`verify/diagnose`；
- fixture 默认离线；验证 OCDS package/schema/extensions、cursor、release/record merge、notice regimes、lots/contracts/parties、429/503、documents、OGL metadata 和 unknown extension quarantine。

无 Probe Skill。采购需求可作为其他诚实实验渠道的 evidence，但不能通过发布虚假 UK notice 或提交无履约意图的响应来测试。

## 6. 数据治理

- [Central Digital Platform guidance](https://www.gov.uk/government/publications/procurement-act-2023-short-guides/buyers-and-suppliers-how-to-use-the-central-digital-platform-the-enhanced-find-a-tender-service-html) 明确 published notice data 按 OCDS 结构并在 OGL v3 下复用；每个 package/blob 仍保存 publisher/license/attribution。
- OGL 不自动授予 notice 中所有第三方文件/商标/个人信息权利。contract/tender documents 单独判断；联系人姓名、邮箱、电话默认从需求 projection 移除。
- `planning.budget`、tender value、award value、contract value、lot value、VAT inclusive/exclusive 必须保留 OCDS path 与 amount kind。
- record 是派生 compiled view；事实账本以 releases + raw package blobs 为依据，record 可重建/对账。
- unknown extension/schema/version fail closed；不能把 extension field塞入 core arbitrary map。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote` 固定，未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [cabinetoffice/cdp-fts-service](https://github.com/cabinetoffice/cdp-fts-service/tree/b1acf8f9302a8d93f739918b7ffa34e67db413c5) `b1acf8f9302a8d93f739918b7ffa34e67db413c5` | UK Cabinet Office official；MIT | 当前 FTS service source/security/drift candidate | `official-artifact`；README 极简，不能单独证明 API contract |
| [open-contracting/standard](https://github.com/open-contracting/standard/tree/e6b5503e06944daa287efec972c9ce12a3813c39) `e6b5503e06944daa287efec972c9ce12a3813c39` | Open Contracting Partnership；Apache-2.0 | OCDS schema、release/record/change-history conformance source | `normative-reference`；FTS mapping仍以官方 docs/package extensions为准 |
| [open-contracting/kingfisher-collect](https://github.com/open-contracting/kingfisher-collect/tree/77cc188e32c77e4c8b9c46c9fb4d5513b8c34b16) `77cc188e32c77e4c8b9c46c9fb4d5513b8c34b16` | OCP；BSD-3-Clause | FTS collector 的 cursor/date-window/429经验与 fixture 候选 | `reference-only`；README/code claim 不替代 live verification，不执行 |
| [Crown-Commercial-Service/ocds_tender_suitability_extension](https://github.com/Crown-Commercial-Service/ocds_tender_suitability_extension/tree/e8188b79a2c7583060b877aec6e52a6f8a67c263) `e8188b79a2c7583060b877aec6e52a6f8a67c263` | official owner；未在固定 revision 根目录核验到 LICENSE | SME/VCSE suitability extension schema evidence | `official-evidence-only`；无明确复用许可证前不复制代码/schema |

Kingfisher 的 FTS spider 记录较长 time step 可能漏 releases、低并发和 429 经验；这些是有价值的验证场景，不是当前 API 必然缺陷结论。

## 8. Verification Plan

### evidence-review / static-contract

- public data API 与 authenticated eSender API 分离；
- OCDS output 标为 provider projection，固定 1.1.5/extension list/mapping evidence；
- release、record、notice、OCID、contract、lot 和 party identity 不混用；
- legacy/Procurement Act 2023 notice regimes 分流；
- cursor opaque，Page.Complete 与 statutory/market coverage 分开；
- OGL notice data与外部 document rights分开；
- submission/internal-search/bid route不可物化。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| multi-page release package | cursor/limit/updated window无丢失、重放幂等 |
| record with multiple releases | record是compiled view，releases保持不可变谱系 |
| UK2→UK4→UK6→UK7→UK10/11 | notice stage/relation/contract状态不互相覆盖 |
| legacy F-form + UK notice | regime分流，common projection保留native code |
| multi-lot/multi-contract | value、supplier、deadline带正确scope |
| party ID reused in another release | 不跨release误合并；identifier evidence优先 |
| unknown/missing extension | quarantine/reverify，不静默丢字段 |
| 429/503 with Retry-After | backoff、checkpoint不越过失败窗口 |
| linked document/contract PDF | descriptor/retrieval/blob/rights/PII分层 |
| eSender/internal search payload | policy blocker |

### sandbox-live / operational-canary

用户另行批准后，可对极小 historical updated window 做 anonymous read-only sandbox，验证 cursor、record lookup、429/503、extensions 与 OGL headers/metadata；不下载外部 documents、不调用 submission/internal APIs。通过后设计错峰低频 canary，监测 developer docs、API 1.0 schema/errors、OCDS extensions、notice types/regime、data.gov.uk file availability、source repo 和 coverage drift。

## 9. 晋级缺口

`researched → modeled` 需要 accepted FTS/OCDS mapping snapshot、normative request/response schema、extension allowlist、regime mapping、rights/document policy；`modeled → verified` 需要离线 fixtures 和用户批准的公开 API sandbox。当前不授权 Connector、live request 或下载。
