# Ahpra Practitioner Register Platform Pack 设计

状态：`concept-fixture + public manual + restricted contract/API fixture / architecture-only`  
核验日期：2026-08-26  
Platform Pack ref：`ahpra-practitioner-register/v0-design`

## 1. 稳定概念与官方证据

[Register使用说明](https://www.ahpra.gov.au/registration/registers-of-practitioners/tips-for-using-the-public-register.aspx)把National Register定位为澳大利亚registered health practitioners当前registration status的公开权威入口；[Terms in the Register](https://www.ahpra.gov.au/Registration/Registers-of-Practitioners/Terms-in-the-Register)区分National Board、profession/division、registration type/subtype、endorsement/specialty、condition、undertaking、notation、reprimand、suspension和expiry。

[Possible outcomes](https://www.ahpra.gov.au/Notifications/How-we-manage-concerns/Possible-outcomes.aspx)明确condition可能出于返岗、health、immediate action或disciplinary原因；health condition细节通常不公开，caution通常不在register展示。adverse decision link只证明符合publication policy的公开决定，不证明所有notification/investigation/outcome均可见。

## 2. 数据交换与用途边界

[External data exchange services](https://www.ahpra.gov.au/Registration/Employer-Services/External-data-exchange-services)说明PIE浏览器/API面向approved healthcare organisations，通常要求批准、合同并以雇员registration number查询；register copy/extract、research request和de-identified data request是不同服务。[National Register copy/extract](https://www.ahpra.gov.au/Registration/Employer-Services/External-data-exchange-services/National-Register-Copy-or-Extract)要求按board申请/付费，整份copy需public-interest审查且只可用于获批purpose，不可转供；不提供contact或sensitive information。

因此public HTML/manual、PIE API、monthly extract/copy和research dataset不能相互fallback。当前没有获批合同、purpose或credential，callable与durable均为0。

## 3. 概念映射与只读边界

| Native | `PublicRegulatedLicense*` |
| --- | --- |
| practitioner / National Board / profession | natural-person subject + board roster；高敏身份 |
| registration type/subtype/status/expiry | credential + standing + validity |
| division/endorsement/specialty | scoped endorsement relation；非独立license猜测 |
| condition / undertaking / notation | restriction/scope；可能non-disciplinary或部分不公开 |
| reprimand / suspension / cancellation/prohibition | sanction + standing + finality |
| tribunal/court decision link | finding/adjudication document relation；受publication/suppression规则约束 |
| removal/exclusion from register | publication state；absence不是无历史事件 |

`definition.read`、`register-terms.read`、`selected-public-practitioner.metadata.read`和`selected-public-decision.metadata.read`仅为manual fixture capability；`pie.contract/schema.read`及`register-extract.contract/schema.read`只描述restricted route。禁止自动化姓名搜索、browser scraping、猜测internal endpoint或把employment-verification合同改作需求画像。

申请/续期、notification、employer monitoring、subscription、certificate、restriction review/removal、appeal、contact、payment及任何write恒拒绝。

## 4. Synthetic fixtures与可观测性

Synthetic覆盖one practitioner→multiple registration types/endorsements、active with non-disciplinary condition、health condition detail withheld、undertaking vs imposed condition、caution not published、reprimand/suspension、adverse decision link、removed condition、information excluded for safety、cancelled/prohibited register、PIE purpose mismatch与extract no-redistribution rejection。

Telemetry逐`National Board × register/process revision × profession/type/status × endorsement/specialty × condition/undertaking/reprimand/suspension × publication/suppression state × route contract/purpose/privacy/rights`记录visible/withheld/removed/missing、returned/retained/dropped、purpose denial、contract denial、publication drift、quarantine和zero effects。本轮没有查询任何practitioner。
