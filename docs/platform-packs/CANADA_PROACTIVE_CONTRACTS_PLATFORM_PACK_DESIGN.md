# Canada Proactive Publication – Contracts Platform Pack 设计

状态：`researched / concept+official-schema-and-CSV-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`canada-proactive-contracts/v0-design`

## 1. 平台概念、population与价值

加拿大[Proactive Publication – Contracts dataset](https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b)汇总federal reporting entities提交的contract reports，维护频率为quarterly，并明确数据未经审计、不保证准确或完整。官方[JSON schema/data element profile](https://open.canada.ca/data/recombinant-published-schema/contracts.json)区分contracts over $10K、positive/negative amendments、$10K-and-under aggregate和nil reports，还允许late report与material-error correction。

| Native concept | `PublicProcurement*` | 关键边界 |
| --- | --- | --- |
| reference number / procurement ID | disclosure/contract identity | line ID与department procurement ID分开；名称不是跨部门主键 |
| instrument type C/A/SOSA | contract/amendment/framework | standing offer/supply arrangement不是procurement contract |
| original/total/amendment value | typed amounts | current may include amendments；potential/task-authority语义保留 |
| reporting period | coverage/history | report quarter不等于award/action date；late rows回填原period |
| nil report | coverage evidence | nil不等于现实世界绝对零采购 |
| <=$10K aggregate | aggregate denominator | 不生成contract rows或vendor count |
| solicitation/limited reason | procedure classification | source-reported process，不生成fairness或fault结论 |

`contract_value`可代表hard commitment/current amended value，不是payment；negative amendment不等于refund。来源明确允许多次amendments同季度合并，因此一行不必然是一项原子变更。

## 2. Capability、route与data handling

concept capabilities为dataset metadata/schema/dictionary discovery、versioned CSV resource import、reporting-period/contract/amendment projection和resource drift observation。route fixture固定official dataset UUID、resource ID/URL、CSV media type/hash/size、schema revision、quarterly update、header/enum/date/money parsing、bilingual fields、late/correction/nil rules与OGL evidence。本轮未下载CSV。

普通projection必须drop `buyer_name`、vendor postal fragment、contacts、comments中的personal data及natural-person vendor；organization只保留opaque ref。description/comments需独立content rights与PII review。Open Government Licence – Canada适用于catalog/dataset声明，但第三方/个人信息和record-specific restrictions仍逐snapshot判定。

## 3. OSS、Skill、fixtures与晋级

`open-data/ckanext-canada@fb4263f`为official portal implementation reference，MIT with Crown/trademark terms；不能替代dataset schema、dictionary或resource contract。`canada-contract-disclosure-source-contract-research/v1`只读official metadata/schema和固定source；conformance只使用synthetic CSV，不读取live resource。

fixtures覆盖contract + later amendment、positive/negative amendment、same-quarter combined amendments、original vs current value、potential task authorization、SOSA value zero、late report/correction、quarterly >$10K vs annual <=$10K aggregate、nil report、department-shared funding、unaudited authority、buyer/postal/contact drop、schema/header/resource replacement、route unavailable/no fallback和zero publication effects。

Telemetry按`reporting entity × reporting period × instrument type × contract/ref × amount role × threshold population × resource/schema/licence revision`记录rows/retained/dropped、late/corrected、identity collisions、double-count risks、aggregate/nil coverage、PII drop与rights block。metadata/schema canary、CSV download、content spans和durable storage均需用户批准。

