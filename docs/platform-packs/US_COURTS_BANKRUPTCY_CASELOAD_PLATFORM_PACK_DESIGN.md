# U.S. Courts Bankruptcy Caseload Platform Pack

## 1. 稳定概念

本成员描述Administrative Office of the U.S. Courts发布的bankruptcy caseload aggregates，不描述identified debtor lead，也不镜像PACER case/docket/document。

- `case filed`、`case terminated`与`case pending`分别是flow、flow和stock；terminated不等于discharged、plan confirmed、creditors paid或business recovered。
- F-2按publisher-defined `business/nonbusiness`与Bankruptcy Code chapter拆分filed cases；business case、registered company、enterprise、establishment和owner不是同一unit。
- Chapter 7、11、12、13、15是法律程序路径。Chapter 7通常是liquidation，Chapter 11通常是reorganisation，但chapter本身不证明最终处置或持续经营。
- one-month、three-month与twelve-month ending-period tables是不同window，不能相加、覆盖或按相同date去重。
- F、F-2、F-5A与Judicial Facts and Figures分别具有不同grain、geography、history和format；相同table number也必须绑定publication/reporting period。

官方概念入口：[Bankruptcy tables](https://www.uscourts.gov/data-table-topics/bankruptcy)、[F-2 catalogue](https://www.uscourts.gov/data-table-numbers/f-2)、[Bankruptcy Basics](https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics)、[Chapter 11](https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-11-bankruptcy-basics)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| filed business/nonbusiness cases by chapter | F-2 PDF/XLSX catalogue | official table route-fixture eligible |
| filed/terminated/pending case flow | F table | concept/table fixture；business split逐table验证 |
| district/county breakdown | F-5A | selected/manual only；细粒度与隐私风险独立 |
| historic annual series | Judicial Facts and Figures / archived tables | history fixture；table lineage不可由当前页推断 |
| case/docket/document lookup | PACER | 不属于aggregate member route；account、fees、PII和document rights另审 |

当前没有发现面向caseload tables的版本化developer API。官方HTML catalogue与下载资源证明`official table-or-file`，不能声明`official-api`。PACER搜索会产生费用，即使无结果也可能计费；其账户、case identity、docket和document access不进入本Channel。[PACER pricing](https://pacer.uscourts.gov/pacer-pricing-how-fees-work)、[policy](https://pacer.uscourts.gov/policy-procedures)。

## 3. Agent、MCP 与固定开源候选

- [freelawproject/courtlistener-api-client@`e0644db`](https://github.com/freelawproject/courtlistener-api-client/tree/e0644db8ecfb11a169e01578ad0fa1bcac56f70c)由CourtListener/Free Law Project维护，BSD-2-Clause，包含REST client与hosted/self-hosted MCP。它需要account/OAuth或token，覆盖RECAP docket/case law，并含alert/subscription writes和generic endpoint escape hatch；它不是U.S. Courts官方F/F-2/F-5A统计来源，RECAP coverage也不是完整PACER population。
- [jmtroller/bankruptcy-observer-mcp-api-public-documentation@`c968354`](https://github.com/jmtroller/bankruptcy-observer-mcp-api-public-documentation/tree/c968354ceac9c704b8beb04cd2e7ea2b516c4bdb)只有商业API/MCP的公开文档与registry metadata，没有server source或适用data licence；其受限查询需要高价subscription，MCP还暴露purchase-plan side effect。保持commercial/reference-only。
- 未发现U.S. Courts或AO维护、能固定F-table population/window/chapter/business classification/revision的Agent Skill。CourtListener官方MCP是source-adjacent Agent surface，不是本成员domain Skill。

本轮只读固定SHA文本与`git ls-remote`，未clone、install、build、execute、connect MCP、注册account/token、调用PACER或创建alert/subscription。

## 4. 权利、隐私与安全边界

- 默认只保留official aggregate table metadata；party/debtor name、case number、SSN/TIN、address、attorney、trustee、docket text和document全部pre-gate drop。
- public court record不自动等于可长期profiling、embedding、republishing或commercial lead generation；case document还可能含third-party rights与敏感信息。
- chapter、filed/terminated/pending、business/nonbusiness、district/county、window、publication、table revision和source authority必须同行。
- 本成员没有Probe；petition、filing、claim、case alert、PACER search、document purchase或contact均是法律/账户/费用副作用。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / official table-or-file route-fixture / selected-manual`；`exact official machine route-fixture=0 / case-level route=0 / callable=0 / durable=0`。

下一门槛是用手写F/F-2/F-5A envelopes验证table/reporting-window/grain/chapter/business-classification，随后在另行授权下只对一个approved aggregate XLSX做bounded sandbox；不得退到PACER、CourtListener、Bankruptcy Observer、HTML scraping或case lookup补齐。

