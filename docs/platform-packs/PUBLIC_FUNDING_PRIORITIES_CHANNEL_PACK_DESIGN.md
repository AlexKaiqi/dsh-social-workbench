# Public Funding Priorities & Funded R&D Channel Pack 设计

状态：`researched`；4个fixture-eligible member，0个callable member，0个durable-approved member  
核验日期：2026-08-26  
Channel Pack ref：`public-funding-priorities/v0-design`

## 1. 目标、成员和分母

本Channel用于发现公共机构明确资助的问题、预期结果、技术topic和已获得资源配置的研发活动。它统一`PublicFunding*` projection，但不统一programme、jurisdiction、eligibility、classification、money、project identity、result authority或rights。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| Grants.gov | [Pack](GRANTS_GOV_PUBLIC_FUNDING_PLATFORM_PACK_DESIGN.md) | opportunity fixture；legacy staging candidate；no binding |
| NIH RePORTER | [Pack](NIH_REPORTER_FUNDED_RESEARCH_PLATFORM_PACK_DESIGN.md) | funded-project fixture；public production canary candidate；no binding |
| EU F&T / CORDIS | [Pack](EU_FUNDING_CORDIS_PLATFORM_PACK_DESIGN.md) | grant-topic/project/open-data fixture；no binding |
| SBIR/STTR | [Pack](SBIR_STTR_PUBLIC_FUNDING_PLATFORM_PACK_DESIGN.md) | solicitation/topic/award fixture；API maintenance/degraded |

requested=4、fixture-eligible=4、callable=0、durable-approved=0。staging/public/open-data可用性只是未来验证条件，不计本机callable或已批准数仓coverage。

## 2. 共同契约与不可比较边界

共同projection固定publisher/jurisdiction/surface/API/schema、programme/call/opportunity/topic/award/project/application/support-year identity、lifecycle/schedule、eligibility/instrument、classification method、amount role、authority、representation/history/coverage、attribution/rights/retention和evidence。

必须保留：

- grant/assistance与procurement contract不同；EU F&T共享portal也不能混Channel；
- opportunity/call说明issuer priority，不证明市场需求、未来award或预算已支出；
- award/project说明reported allocation，不证明付款、成功、科学有效、采用或产品机会；
- issuer expected outcome、recipient abstract/result summary、provider classification和external publication各有authority；
- programme envelope、ceiling/floor、expected contribution、annual support、award/direct/indirect/project total/participant share不能相加；
- NIH core project/application/support year、EU call/topic/project、SBIR solicitation/topic/award按exact native relation去重；
- public API、bulk、LOD、MCP summary/dashboard可以同源，不能增加independent authority；
- PI/program officer/contact/company profile、application和external outputs默认drop/restrict；
- CommonGrants只作mapping，不覆盖native objects或填补成员缺失字段。

## 3. 动态物化视图

- `open-funding-priorities-by-programme-topic-and-eligibility`：展示issuer-authored机会及deadline，不混采购；
- `funded-rd-activity-by-topic-programme-and-region`：按获准amount role与project identity聚合，不宣称market size；
- `opportunity-to-award-project-lineage`：只连接exact provider IDs；文本/时间相似保留candidate；
- `emerging-public-challenge-and-expected-outcome`：比较新/变更topic与issuer wording，固定classification revision；
- `funded-project-result-claims`：recipient/result authority与external output隔离，不升级为verified outcome；
- `funding-schema-rights-coverage-and-source-drift`：跟踪API/bulk/MCP/source/license、classification、refresh和missing members。

Dolt保存Pack、官方schema/terms/license digest、native mapping、view definition和decision/tombstone；获批高体量opportunity/project rows未来才进入分析库。所有物化视图固定member/representation/definition revision、programme/topic/window、money role、rights purpose与watermark；schema、classification、license、project relation或source correction触发partition rebuild。

## 4. Channel Skills 与 Probe

`public-funding-source-contract-research/v1`只读官方docs/terms/open-data/fixed repos，输出Pack/schema/rights/drift proposal；不安装、执行、API call、MCP连接、申请key或下载bulk。

`public-funding-conformance/v1`用synthetic fixtures验证native identity/lifecycle/authority、money roles、classification、coverage、personal-data drop、source overlap和zero writes。

未来`approved-public-funding-read/v1`只调度用户批准的exact member/product/field/query/budget binding；当前返回`no-authorized-public-funding-binding`。不得fallback到portal HTML、community MCP、scraper、commercial aggregator、search cache或其他成员。

本Channel没有申请型Probe。提交虚假或低诚意grant application会消耗评审资源并产生法律/声誉效果；真实申请只能进入独立、用户主导且具备合法主体、真实项目、资格确认、完整人工审阅、签署和submission receipt的高影响工作流，绝不作为需求测试。

## 5. Fixture、可观测性和晋级

| 场景 | 必须结果 |
| --- | --- |
| opportunity有ceiling但无award | priority/possible amount only；不生成funded activity |
| 同一NIH core project有多个support years | exact lineage；不计独立project或重复需求 |
| EU search同时返回grant/tender | tender拒绝并转Public Procurement candidate |
| recipient abstract声称突破 | recipient claim；不标verified result |
| MCP preview sample 500 | sampled representation；不标full total |
| SBIR API maintenance | member degraded；不fallback HTML/community source |
| PI/contact/application fields出现 | pre-persistence drop/restrict |
| submit/apply/write请求 | policy拒绝；zero external effect |

Telemetry按`Channel × member/product binding × representation × schema/terms/classification revision × programme/topic/window`记录expected/fixture/callable/succeeded/blocked/degraded/quarantined、requested/returned/retained/dropped、native identity conflicts、opportunity/award/project/result coverage、money-role completeness、classification/authority、personal-data drop、API/bulk/MCP overlap、refresh/rate/license drift和zero writes。至少一个member完成fixture及用户批准的staging/production canary后Channel才可`modeled-partial`；durable materialization逐member/field/content authority另审。
