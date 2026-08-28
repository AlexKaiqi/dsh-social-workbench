# EU ESEF / ESAP Corporate Disclosure Platform Pack 设计

状态：`researched / concept-and-format-fixture / future-route-blocked / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`eu-esef-esap-corporate-disclosure/v0-design`

## 1. 产品与当前可用性

ESEF是EU regulated-market issuer年度财务报告的法定电子报告格式，不是当前统一披露数据库。根据[2025 ESEF Reporting Manual](https://www.esma.europa.eu/sites/default/files/library/esma32-60-254_esef_reporting_manual.pdf)，ESEF AFR是履行Transparency Directive义务的official version并提交各国OAM；PDF或issuer网站副本可能是非官方或voluntary representation。

ESAP未来把OAM/NCA等collection body汇聚的数据提供统一搜索/API。[ESMA时间表](https://www.esma.europa.eu/mt/node/223341)显示2026-07开始collection、公众访问预计2027-07；截至本次核验，不能把未来API ITS、taxonomy URL或某个national OAM/community mirror写成ESAP callable route。

## 2. 概念与format binding

| Native concept | `PublicCorporateDisclosure*` | 约束 |
| --- | --- | --- |
| issuer / LEI / home member state | entity/jurisdiction | LEI与national/security identity均保留 |
| ESEF report package/XHTML | official archive/iXBRL representation | official status取决于OAM/jurisdiction，不由文件扩展名推断 |
| core/issuer extension taxonomy | taxonomy/fact binding | extension concept不按label强行映射到core concept |
| inline fact/context/unit/dimensions | structured fact | period、language、dimensions和taxonomy version不可丢 |
| multiple language packages | alternate-language relation | voluntary translation与official language分别标记 |
| PDF/issuer copy | non-official representation candidate | 不得覆盖official ESEF package |
| future ESAP metadata/API | future access contract | public go-live和final live schema前route=blocked |

ESEF conformance或XBRL validation只证明格式/规则检测结果，不证明数字真实、审计意见正面、企业计划执行或跨issuer accounting comparability。

## 3. 开源、Skills 与权利

[ESMA taxonomy](https://www.esma.europa.eu/electronic-reporting/esef-taxonomy)与Reporting Manual作为format authority固定进Snapshot。`Arelle/Arelle@adaa80f…` Apache-2.0支持XBRL/iXBRL、ESEF/EDGAR validation，只作parser/conformance设计证据；本轮不下载filing、不运行validator。未发现ESMA官方领域Skill/MCP。

各OAM的访问、reuse、language、retention与document rights不能由ESEF统一格式推导；future ESAP也需逐API版本与content type evidence review。签名、person identity、contact与embedded third-party works默认drop/restrict。

## 4. Fixture、观测与晋级

fixture覆盖：official ESEF vs PDF、issuer extension、same-label/different-QName、context/unit/dimension、multi-language official/voluntary、taxonomy version drift、invalid package、OAM/ESAP common-origin、future API unavailable和zero submission。

Telemetry在format fixture阶段只记录`taxonomy/manual revision × conformance case × language × representation`的parse/validation/mapping结果。未来route telemetry还需OAM/ESAP member、collection body、LEI、information type、schema/API version、coverage/lag、rights与deletion。public ESAP endpoint、final schema、terms和live error语义完成evidence review前，不进入sandbox canary。
