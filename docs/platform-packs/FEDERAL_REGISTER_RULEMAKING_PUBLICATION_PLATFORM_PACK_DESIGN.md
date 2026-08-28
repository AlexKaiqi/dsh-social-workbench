# FederalRegister.gov Rulemaking Publication Platform Pack 设计

状态：`researched / synthetic-route-fixture-eligible / public-read-candidate / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`federal-register-rulemaking-publication/v0-design`

## 1. 平台产品与authority

[FederalRegister.gov API v1](https://www.federalregister.gov/developers/documentation/api/v1)提供无需API key的public endpoints。本Pack只覆盖published/public-inspection metadata、Rule、Proposed Rule、Notice及其agency、document number、RIN、docket、CFR/date/link关系；Presidential Document和非rulemaking notice可保留native type但默认不进入监管压力projection。

FederalRegister.gov页面明确：网站HTML/XML是published document的informational rendition，不是official legal edition；依赖法律状态时必须指向govinfo.gov官方PDF。本Pack因此把`register-html-or-xml-rendition`、`official-edition`和`public-inspection-preview`分开。Public Inspection不能提前写成published、effective或final。

## 2. 概念与跨源关系

| Native concept | `PublicRulemaking*` | 约束 |
| --- | --- | --- |
| document number / citation | publication/document identity | 精确ID，不按标题合并 |
| Rule / Proposed Rule / Notice | final/proposal/notice kind | Notice不自动等于consultation；Rule不自动等于effective now |
| agency / RIN / docket ID / CFR refs | authority/action/relation refs | RIN可能跨多份publication；CFR ref不是affected-company identity |
| publication/effective/comment dates | schedule | publication、comment deadline、effective、implementation不可互换 |
| correction / related document | exact relation | 只有官方relation或人工review；相似文本不自动supersede |
| public inspection | prepublication representation | 可能与published版本变化；不提供法律通知 |

与Regulations.gov的document/comments可能共享FR document number、docket ID、RIN或source links。相同记录只建立common-origin lineage，不能按两个平台计为两项authority或两次监管压力；Regulations comments也不能补成Federal Register publication字段。

## 3. 固定实现、license 与 Skills/MCP

- [usnationalarchives/federalregister-api-core `e9c6423…`](https://github.com/usnationalarchives/federalregister-api-core/tree/e9c64236b385c04c7383eef167e6c29d03cfe467)为官方API/importer实现，AGPL-3.0-or-later；只作runtime/schema drift证据。
- [usnationalarchives/federal_register `67a7398…`](https://github.com/usnationalarchives/federal_register/tree/67a73989ca03f51c91f67263eb2f4f29cf1b5665)为官方Ruby client，CC0；只作endpoint/field mapping参考。
- 未发现官方Federal Register MCP或领域Agent Skill。community MCP将Federal Register、Regulations.gov与eCFR混合，不作为正式route。

API/源码许可不授权第三方attachments或引用材料，也不允许使用NARA/OFR seals与logos暗示官方性。当前不安装、执行、下载全文或发起API请求。

## 4. Fixture、观测与晋级

`federal-register-fixture/v1`覆盖Proposal→Final exact lineage、Notice false positive、public inspection→published revision、correction、multiple RIN/dockets/CFR refs、official PDF link、missing effective date、Federal Register↔Regulations common-origin与zero write。

Telemetry按`document type × agency × RIN/docket × publication window × API/schema revision`记录search/result coverage、official-status completeness、public-inspection lag、proposal/final/correction lineage、date conflict、common-origin dedupe、text/artifact quarantine与zero effects。未来public read canary只取最小metadata；任何法律适用判断必须指向官方edition并保持human/legal review边界。
