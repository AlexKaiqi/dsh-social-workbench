# Public Research Literature & Reported Limitations Channel Pack 设计

状态：`researched`；5个concept-fixture成员，5个metadata-route-fixture成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-research-literature/v0-design`

## 1. 目标、成员和真实分母

本Channel发现公开研究中被作者、编辑或review明确报告的限制、失败条件、假设、不确定性、证据缺口、复制问题和未来工作。它统一`PublicResearchLiterature*` projection，但不统一provider population、work identity、publication stage、peer-review状态、classification、citation coverage、metadata/abstract/full-text rights或科学authority。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| Crossref | [Pack](CROSSREF_SCHOLARLY_METADATA_PLATFORM_PACK_DESIGN.md) | concept+metadata route fixture；DOI deposit/version/update metadata |
| OpenAlex | [Pack](OPENALEX_SCHOLARLY_GRAPH_PLATFORM_PACK_DESIGN.md) | concept+metadata route fixture；core/expansion/content surfaces separated |
| PubMed | [Pack](PUBMED_BIOMEDICAL_LITERATURE_PLATFORM_PACK_DESIGN.md) | concept+metadata route fixture；citation/abstract vs PMC separated |
| Europe PMC | [Pack](EUROPE_PMC_LITERATURE_PLATFORM_PACK_DESIGN.md) | concept+metadata route fixture；OA full text separately rights-gated |
| arXiv | [Pack](ARXIV_PREPRINT_PLATFORM_PACK_DESIGN.md) | concept+metadata route fixture；versioned preprint/API/OAI semantics |

requested=5、concept-fixture=5、metadata-route-fixture=5、callable=0、durable-approved=0。metadata route只能发现候选或取得获准字段；在没有exact abstract/full-text entitlement时，不能产生正文限制span。rights-cleared evidence-yielding content coverage当前为0。

## 2. 共同契约与禁止推断

共同projection固定provider/corpus/query definition、work/version/expression/manifestation/record、representation、native lifecycle、authority、classification、exact relations、search placement、history/update/delete/merge、coverage、rights和revision。

- DOI、PMID、PMCID、arXiv ID/version、Europe PMC source/id和OpenAlex ID属于不同authority；exact external ID/relation可连接，title/author/year只生成candidate；
- Crossref deposit、OpenAlex Work、PubMed citation、Europe PMC result和arXiv entry可能是同一来源的provider projection，不能按5个平台算5份独立证据；
- preprint、accepted manuscript、ahead-of-print、VoR、updated version、correction、expression of concern、retraction、withdrawal和reinstatement不可压成单一status；
- provider merge/topic/keyword/text-mined annotation、MeSH/arXiv category和citation count保留authority与coverage，不冒充author claim、研究质量、完整影响或用户痛点；
- metadata license、abstract license、full-text license、OA状态、content version、TDM purpose和entitlement独立；URL/availability/CC0 provider data不授予content使用权；
- author、editor或reviewer的exact limitation/future-work span只证明“该来源这样报告”，不独立证明其真实、普遍、严重、导致产品失败或构成市场需求；
- 负面/null result、failure case和retraction也不自动否定整个领域；correction/withdrawal必须使受影响projection/span失效但保留历史；
- author identity、affiliation、email和person graph默认drop；work-level authority不转换成lead/customer；
- citation、下载、OA、收录、publication type或peer-review未知都不能作为需求规模、购买意愿或科学有效性的代理。

只有固定work version、exact section/content ref、author/editor/review authority、representation、language、content licence/purpose和source evidence的span，才可形成：

- `EvidenceReportedResearchLimitation`：limitation/failure/assumption/uncertainty/threat-to-validity；
- `EvidenceReportedUnmetResearchNeed`：unresolved question/missing method-data-evidence/replication/future work。

## 3. 动态物化视图与索引

- `reported-limitations-by-domain-method-population-and-work-version`：按exact version和content role展示，不把provider annotation混入；
- `failure-cases-assumptions-and-validity-threats-by-context`：固定dataset/population/context与source authority；
- `unmet-research-needs-future-work-and-replication-gaps`：与funding priority、customer request、procurement分栏；
- `correction-retraction-withdrawal-and-version-lineage`：受影响span失效、历史保留，不生成领域级否定结论；
- `cross-provider-common-origin-and-identity-conflicts`：DOI/PMID/PMCID/arXiv/OpenAlex/Europe PMC relation、merge/redirect和candidate review；
- `metadata-abstract-fulltext-rights-coverage-and-route-drift`：按provider/corpus/representation/licence/purpose记录可发现、可读、可索引边界。

Dolt只保存Pack、definition、schema/DTD/protocol/license digest、identity/relation review、view definition、decision、lineage和tombstone。获准的metadata/abstract/full-text record/span未来按字段、目的和retention进入分析库；未获准正文、作者身份和credential不进入。物化键固定`member × corpus × work × version × expression × representation × licence/purpose × definition revision`。correction/retraction/withdrawal、provider merge/delete、route/schema/taxonomy/license/entitlement变化触发partition invalidation/rebuild。

## 4. Skills、read workflow 与Probe边界

`public-research-literature-source-contract-research/v1`只读官方docs和固定GitHub source，输出Pack/drift proposal；不安装/执行、不调用API/MCP、不下载snapshot/full text。

`public-research-literature-conformance/v1`只用手写synthetic fixtures验证work/version/expression/record、identity/common-origin、native lifecycle、correction/retraction、classification authority、query population、metadata/abstract/full-text rights和zero effects。

未来`approved-public-research-literature-read/v1`只调度用户批准的exact member/corpus/resource/field/window/budget binding；当前返回`no-authorized-public-research-literature-binding`。不得fallback到HTML/browser、community MCP/Skill/client、shadow API、另一个成员、author identity或unlicensed full text。

`reported-limitations-reading-card/v1`可在内容rights已获准后，对固定version的文本生成section候选；它必须输出source spans与不确定性，不能写成connector、科学裁判或自动机会结论。UCL-ERL等社区Skill只提供workflow启发，不获得平台authority或content rights。

本Channel没有外部Probe。投稿、更新版本、撤稿、endorse、metadata correction、provider curation、联系作者、账户操作、citation manipulation或公开评论都会改变科研/出版流程，禁止归类为需求测试；未来若确需执行，必须是独立高影响工作流并逐effect授权。

## 5. Fixture、可观测性和晋级

| 场景 | 必须结果 |
| --- | --- |
| one DOI appears in Crossref/OpenAlex/PubMed/Europe PMC | common-origin provider projections；只计一个source claim |
| arXiv v1 limitation disappears in v2 | 两个version spans；v1 current projection失效但历史保留 |
| OpenAlex topic / Europe PMC annotation says limitation | provider annotation；不形成author-reported limitation evidence |
| Crossref has abstract + no content licence | candidate metadata；span extraction blocked |
| PubMed citation links PMCID | alternate product relation；不自动读取PMC full text |
| Europe PMC `fullTextXML` + exact CC licence | rights candidate；仍需purpose/user approval |
| preprint later gains journal DOI | relation evidence；不把peer review设为true，除非有明确basis |
| retraction notice targets work | notice relation/status revision；不推断整个领域无效 |
| query synonym/core/expansion changes | new definition revision/population；不直接比较counts |
| route unavailable or budget blocked | missing-member/coverage degradation；no browser/community fallback |
| key/submit/curate/contact request | policy拒绝；zero external effect |

Telemetry按`Channel × member/corpus × query definition × work/version/expression × record/representation × schema/license/purpose revision`记录requested/concept-fixture/metadata-route-fixture/content-rights-eligible/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、identity/relation conflict、same-origin、version/status/classification completeness、abstract/full-text availability、rights/entitlement/rate/lag drift和zero writes。

晋级要求：至少一个成员经用户批准完成metadata-only canary，才可`modeled-partial`；能否产出limitation evidence还必须另有exact content/version/licence/purpose canary。metadata、abstract、full text、snapshot、identity、durable materialization逐成员独立授权，某成员成功不提升其他成员。
