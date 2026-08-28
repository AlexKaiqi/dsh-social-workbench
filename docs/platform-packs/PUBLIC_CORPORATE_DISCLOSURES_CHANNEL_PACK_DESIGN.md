# Public Corporate Disclosures & Investment Priorities Channel Pack 设计

状态：`researched`；5个concept-fixture成员，3个route-fixture成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-corporate-disclosures/v0-design`

## 1. 目标、成员和分母

本Channel发现公司正式披露的战略重点、运营风险、依赖、资本投入、研发与转型计划。它统一`PublicCorporateDisclosure*` projection，但不统一法域、reporting population、form、accounting/taxonomy、official status、审计范围、语言、rights或事实可信度。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| SEC EDGAR | [Pack](SEC_EDGAR_CORPORATE_DISCLOSURE_PLATFORM_PACK_DESIGN.md) | concept+route fixture；approved metadata/XBRL GET candidate |
| UK Companies House | [Pack](UK_COMPANIES_HOUSE_CORPORATE_FILING_PLATFORM_PACK_DESIGN.md) | concept+route fixture；approved company-roster GET candidate |
| EU ESEF / ESAP | [Pack](EU_ESEF_ESAP_CORPORATE_DISCLOSURE_PLATFORM_PACK_DESIGN.md) | concept+format fixture；public ESAP future-blocked |
| HKEXnews / IIS | [Pack](HKEX_ISSUER_DISCLOSURE_PLATFORM_PACK_DESIGN.md) | concept+licensed-route fixture；website policy-blocked |
| 巨潮资讯 CNINFO | [Pack](CNINFO_CORPORATE_DISCLOSURE_PLATFORM_PACK_DESIGN.md) | concept fixture；manual/contract-only |

requested=5、concept-fixture-eligible=5、route-fixture-eligible=3、callable=0、durable-approved=0。ESEF format和future ESAP不计当前route；HKEX route eligibility只指IIS协议fixture，不代表entitlement；任何成员不能继承SEC/Companies House成熟度。

## 2. 共同契约与禁止推断

共同projection固定publisher/jurisdiction/surface、entity/security、filing/document/section/fact、record/representation/lifecycle、authority、schedule/report period、taxonomy/context/unit/dimensions、amount role、forward-looking/historical/audited、amendment/restatement、history/coverage、rights/retention与evidence。

- accepted/published filing只证明进入披露系统，不证明regulator/exchange验证、内容真实或计划执行；
- issuer risk factor最多产生`corporate-operational-risk`，不证明风险发生、概率、严重度、客户痛点或产品机会；
- issuer strategy/forecast最多产生`corporate-strategic-priority`，不证明预算批准、采购、未来支出或成功；
- 只有historical、exact period/unit/role的fact或reviewed span可产生`reported-corporate-investment`；planned/forecast/commitment不能升级；
- audited flag不自动覆盖全部narrative、non-GAAP、forward-looking、exhibit或sustainability claim；
- 同label XBRL facts在taxonomy/context/unit/dimensions/period不同就不可比较；issuer extension不能按名称硬映射；
- amendment/restatement/correction不与原filing双计，必须保留lineage并失效旧projection；
- cross-listed entity、issuer website copy、regulator archive、exchange feed和provider normalization可能common-origin，不是独立证据；
- filing/SDK/MCP/code公开不生成document、exhibit或第三方内容的AI/storage/index/reuse rights；
- 人名、签名、地址、电话、email、officer/PSC/shareholder identity与合同附件默认drop/restrict；
- 本Channel不输出投资建议、估值、交易信号、法律或会计意见。

## 3. 动态物化视图

- `issuer-stated-strategic-priorities-by-industry-period`：只索引reviewed issuer spans，保留forward-looking与filing revision；
- `reported-corporate-investment-by-role-and-accounting-context`：只聚合historical facts，固定amount role、currency/unit、period、taxonomy/context；
- `risk-and-operational-constraint-change-by-filing-lineage`：比较exact sections/revisions，boilerplate重复不自动增加frequency；
- `filing-amendment-restatement-and-correction-lineage`：展示原件、修订、restatement、withdrawal与失效范围；
- `cross-registry-and-exchange-common-origin-graph`：entity候选关系与document common-origin分开，禁止名称自动merge；
- `corporate-disclosure-rights-schema-taxonomy-and-coverage-drift`：按成员追踪API/format/terms/license、form/taxonomy、document/fact coverage、lag与missing route。

Dolt保存Pack、definition、official docs/schema/taxonomy/terms/license digest、mapping、view definition、review decision、lineage和tombstone；获准filing text/facts未来才进入分析库。视图固定member/product/representation/definition revision、entity/form/period、authority、rights purpose与watermark；restatement/correction、taxonomy mapping、license/terms或PII policy变化触发partition invalidation/rebuild。

## 4. Channel Skills、Probe 与降级

`public-corporate-disclosure-source-contract-research/v1`只读官方docs/schema/taxonomy和固定GitHub source，输出Pack/drift proposal；不安装/执行、不申请key、不调用API/MCP、不打开披露网页、不下载filing/document。

`public-corporate-disclosure-conformance/v1`只用手写synthetic fixtures验证identity、authority、official representation、fact context、amount role、forward-looking、amendment/restatement、cross-source overlap、PII与zero writes。

未来`approved-public-corporate-disclosure-read/v1`只调度用户批准的exact member/product/entity/form/path/field/budget binding；当前返回`no-authorized-public-corporate-disclosure-binding`。不得fallback到HTML/browser/internal endpoint/community MCP/Skill/scraper或另一个成员。

本Channel没有披露Probe。提交、修改或撤回公司/证券披露是法定高影响行为，不是需求测试；联系公司高管、交易证券、生成投资建议也不属于Connector能力。

## 5. Fixture、可观测性和晋级

| 场景 | 必须结果 |
| --- | --- |
| 10-K写“计划增加AI投资” | strategic priority only；不标budget/payment/procurement |
| historical XBRL R&D fact | 固定period/unit/context/role后才可reported investment |
| 10-K/A或restatement到达 | exact lineage；旧span/view失效，不双计 |
| 同label但taxonomy/dimension不同 | 不比较/不聚合；mapping review required |
| risk factor多年重复 | revisions/context；不自动算独立痛点频次 |
| Companies House filing含人员/地址 | pre-persistence drop/restrict；不构建person graph |
| ESEF PDF与official package冲突 | official OAM ESEF优先；PDF保留非官方representation |
| HKEX website/community MCP请求 | policy gate在network前拒绝 |
| CNINFO内部endpoint/Skill请求 | official-machine-contract-missing；no fallback |
| filing/submit/update/trade/contact请求 | policy拒绝；zero external effect |

Telemetry按`Channel × member/product × jurisdiction × entity/form × representation × taxonomy/schema/terms revision × report period`记录requested/concept-fixture/route-fixture/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、identity conflicts、filing/document/section/fact coverage、official/authority completeness、context/unit/dimension conflicts、amendment/restatement invalidation、PII drop、rights/license/rate/lag drift和zero writes。至少一个成员在用户批准后完成metadata-only canary才可`modeled-partial`；正文、facts、attachments和durable materialization逐成员/字段/内容权利另审。
