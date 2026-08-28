# Public Corporate Disclosures & Investment Priorities 候选分诊（2026-08-26）

状态：`researched`；requested=5，concept-fixture-eligible=5，route-fixture-eligible=3，callable=0，durable-approved=0  
目标 Channel：`public-corporate-disclosures/v0-design`

## 1. Coverage 缺口与第一性原理结论

现有Channel能观察个人表达、组织招聘/采购/资助、交易结果、产品行为、监管投诉与规则变化，却缺少组织管理层通过法定或监管披露正式声明的战略重点、风险、依赖、资本投入和转型计划。这个信号适合发现B2B问题域与“为什么现在”，但不是客户需求、真实采购、未来预算或投资建议。

共同最小事实是：jurisdiction/publisher、reporting entity/security、filing/document/section/fact、form/taxonomy、period/unit/dimensions、issuer/regulator/auditor/provider authority、official record、amendment/restatement、forward-looking/historical、rights、revision与exact lineage。监管机构接收或交易所发布一份文件，只证明该representation进入对应披露系统；不证明内容真实、审计覆盖全部文本、计划获批、风险已经发生或资金已经支付。

## 2. 候选与当前判定

| 候选 | 信号增量 | 官方表面 | 当前判定 |
| --- | --- | --- | --- |
| SEC EDGAR | 10-K/10-Q/8-K/20-F/6-K等申报、风险因素、MD&A、XBRL事实与修订 | [data.sec.gov APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)、[Developer Resources](https://www.sec.gov/about/developer-resources) | concept+route fixture；无key read canary候选；filing APIs/write全部拒绝 |
| UK Companies House | company profile、filing history、accounts/document metadata与filing stream | [Public Data API](https://developer-specs.company-information.service.gov.uk/companies-house-public-data-api/reference)、[Document API](https://developer-specs.company-information.service.gov.uk/) | concept+route fixture；API-key read canary候选；officer/PSC与filing write排除 |
| EU ESEF / ESAP | official ESEF annual report、iXBRL/taxonomy、未来EU统一披露入口 | [ESEF reporting](https://www.esma.europa.eu/issuer-disclosure/electronic-reporting)、[ESAP](https://www.esma.europa.eu/mt/node/223341) | concept/format fixture；ESAP public access预计2027-07，当前route blocked |
| HKEXnews / IIS | 上市发行人公告、定期报告、重大交易与实时issuer news | [IIS](https://www.hkex.com.hk/Services/Market-Data-Services/Infrastructure/Issuer-Information-feed-Service-(IIS)?sc_lang=en)、[Terms](https://www2.hkexnews.hk/Global/Exchange/Terms-of-Use?sc_lang=en) | concept+licensed-route fixture；网站自动化/文本挖掘policy-blocked；需书面许可/数据合同 |
| 巨潮资讯 CNINFO | A股法定公告、定期报告、问询函与监管文件 | [公告查询](https://www.cninfo.com.cn/new/commonUrl/pageOfSearch?checkedCategory=category_zj_szsh&url=disclosure%2Flist%2Fsearch) | concept fixture；未发现公开版本化API/schema，manual/contract-only；内部endpoint拒绝 |

`route-fixture`只计算当前有正式机器接入合同的SEC、Companies House与HKEX IIS；ESMA的ESEF格式与未来ESAP API规范不能冒充当前公开route，CNINFO网页与community逆向接口也不能计入。

## 3. Skills、MCP 与固定开源候选

以下只做源码与许可证静态审计，均未安装、执行或连接：

| Artifact | 固定revision / license | 结论 |
| --- | --- | --- |
| [sec-edgar/sec-edgar](https://github.com/sec-edgar/sec-edgar/tree/97db601615ebedd49637fb4ed847b3f714114720) | `97db601…` / Apache-2.0 | community downloader/client；identity、fair-access与filing taxonomy参考，不作为官方schema |
| [dgunning/edgartools](https://github.com/dgunning/edgartools/tree/9ded979b6234f2d7257fe1679dcf49447132e444) | `9ded979…` / MIT | typed filings、XBRL与内置MCP面很宽；只作parser/schema drift证据 |
| [SEC-API-io/sec-edgar-mcp](https://github.com/SEC-API-io/sec-edgar-mcp/tree/30763cb1b48ad7e57a3dd8e5caacf163653d0f16) | `30763cb…` / MIT | 商业hosted MCP、49 tools且需第三方API key；provider corpus/rights与SEC官方表面不同，拒绝替代 |
| [quantskills/skill-us-sec-edgar-harvester](https://github.com/quantskills/skill-us-sec-edgar-harvester/tree/24f1765b3b8fac4c000ae229122db68ee5a0edca) | `24f1765…` / GPL-3.0-only | community Skill；可借鉴dedup/timeline，不能执行或成为已验证Skill |
| [companieshouse/docs.developer.ch.gov.uk](https://github.com/companieshouse/docs.developer.ch.gov.uk/tree/1e56e2df87dad5843ca6c4f15586024fbd84f9d1) | `1e56e2d…` / MIT | 官方developer docs源；用于schema/changelog evidence，不执行服务 |
| [companieshouse/api-enumerations](https://github.com/companieshouse/api-enumerations/tree/5872d2cec71fc3ee72ddb08fb2da9fa9ca45b06f) | `5872d2c…` / root license未发现 | 官方枚举源候选；无license不vendoring，只固定schema witness |
| [aicayzer/companies-house-mcp](https://github.com/aicayzer/companies-house-mcp/tree/cca5b02d13d043415df29fa72a5ee72ca170067b) | `cca5b02…` / MIT | community CLI/MCP覆盖officers、ownership与document download，超出最小字段；quarantined |
| [lm2283/skills](https://github.com/lm2283/skills/tree/f1f60bcc9fecbc9b7e55b9a4ba48020314f3b50d/companies-house-diligence) | `f1f60bc…` / root license未发现 | community diligence Skill会抓公司网站、解析人员/ownership并生成lead judgement；用途和身份范围过宽，拒绝执行 |
| [Arelle/Arelle](https://github.com/Arelle/Arelle/tree/adaa80ff5f316ea4a97438ea05236e9fdec8fb6b) | `adaa80f…` / Apache-2.0 | XBRL/iXBRL与ESEF/EDGAR验证器候选；仅作format/conformance参考，不运行 |
| [Woodensun2004/hkexnews-downloader](https://github.com/Woodensun2004/hkexnews-downloader/tree/871d128c3d7dc12cb7359e07ad9f7c7db5dd38b0) | `871d128…` / MIT | 宣称反爬绕过、并发PDF下载和未公开接口；`rejected-policy-circumvention` |
| [agentladle/mcp-hkexnews](https://github.com/agentladle/mcp-hkexnews/tree/e9d832e5bc42f7401aa8022ab4017409eddd4bfb) | `e9d832e…` / MIT | community MCP下载、解析并本地索引HKEX文件；违反当前无许可网站挖掘边界，拒绝route |
| [rollysys/use_cninfo](https://github.com/rollysys/use_cninfo/tree/7b85afc5a84171d436724331c4a236343be90c82) | `7b85afc…` / MIT | community CNINFO CLI使用网页内部查询、PDF下载和本地cache；只作negative schema witness |
| [Ming-H/cninfo-disclosure](https://github.com/Ming-H/cninfo-disclosure/tree/23da8b8acb40197326c0866832fc29631f513ff3) | `23da8b8…` / MIT | community Skill混合CNINFO查询/PDF与HKEX Playwright；拒绝执行和跨平台fallback |

未发现SEC、Companies House、ESMA、HKEX或CNINFO官方组织发布的领域研究Agent Skill。官方docs、数据feed或开源许可证都不能替代底层内容权利、purpose binding与Connector conformance。

## 4. 选择与下一门槛

五个成员进入共同概念Channel，但逐产品独立晋级。下一步用synthetic fixtures验证entity/filing/document/section/fact identity、issuer/regulator/auditor authority、period/unit/dimensions、planned-vs-reported amount、forward-looking、amendment/restatement、cross-listing common-origin、PII drop与zero filing effects。只有用户另行授权后，SEC metadata/XBRL GET和Companies House已知company filing-history GET才可设计最小canary；HKEX必须先有精确IIS合同，ESMA等待public ESAP，CNINFO等待官方developer/data-service合同，全部禁止网页、内部endpoint或community tool补位。
