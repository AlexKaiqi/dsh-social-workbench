# UK ONS Business Demography Platform Pack

## 1. 选择与边界

ONS Business Demography补充UK VAT/PAYE registered business population的annual active enterprises、births、deaths与survival。它不是Companies House legal register snapshot、DBT包含unregistered population的Business Population Estimates，也不是ONS March point-in-time UK Business population；相同企业标签不能跨产品补齐。

本Pack只定义versioned workbook/definition候选，不下载workbook、不读取business row、不联系ONS或提交survey，不实现Connector。

## 2. 稳定概念与能力

- [QMI](https://www.ons.gov.uk/businessindustryandtrade/business/activitysizeandlocation/methodologies/businessdemographyqmi)固定population为VAT和/或PAYE registered businesses；active表示reference year任一时点有turnover或employment。它不同于March snapshot，也不代表全部未注册business。
- [annual dataset](https://www.ons.gov.uk/businessindustryandtrade/business/activitysizeandlocation/datasets/businessdemographyreferencetable)发布birth、death、up-to-five-year survival及geography/SIC breakdown的versioned XLSX；2026-01-15对tab 7.1d作过amendment，证明edition/correction lineage不能last-write-wins。
- birth来自administrative-unit registration但统计语义仍受active-business和continuity方法控制；death表示ceased to trade，不等于Companies House dissolution、insolvency、failure cause或identified entity status。
- employer birth同时包括新business有至少一名employee，以及既有non-employer首次成为employer；employer death也包括business继续存在但不再雇员。因此enterprise birth/death与employer birth/death必须分开。
- survival要求birth year t后在t+1有employment和/或turnover activity；它不是owner survival、品牌连续、盈利或未来成功。
- death为排除reactivation通常需等待两年；当前publication估算reactivation并调整，最近两年provisional、第三年才final。annual与quarterly in-development creations/closures也不能按period直接merge。

## 3. 接入、权利与成熟度

- exact official route是上述versioned annual dataset page及current/previous XLSX editions；当前没有证据证明该workbook由ONS Beta Dataset API承载，generic API route不得代替。
- [ONS terms](https://www.ons.gov.uk/help/terms-conditions)以OGL为主，要求检查third-party exceptions并禁止endorsement/misrepresentation；当前site是authority，cached copy需保留access date与edition。
- fixed official client：[ONSdigital/dp-api-clients-go@`12a8416`](https://github.com/ONSdigital/dp-api-clients-go/tree/12a841643d707974cc18d4dad9011d91d1db3bf5)，MIT。它包含dataset/filter/codelist/search以及更宽的upload/import clients，但不证明annual Business Demography workbook存在exact Dataset API mapping；因此不能作为fallback，也未安装或执行。
- 未发现ONS维护、同时固定active population、birth/death continuity、employer transition、reactivation adjustment、survival cohort与revision的domain Agent Skill。

成员成熟度：`concept-fixture / official table-or-bulk route-fixture / selected-manual`；`exact official machine route-fixture=0 / callable=0 / durable=0`。

## 4. Fixture与拒绝条件

fixture必须固定annual active population、VAT/PAYE coverage、enterprise/employer unit、birth/death/survival definition、SIC/geography、reactivation adjustment、provisional/final/corrected edition与rights。Companies House incorporation→birth、dissolution→death、March snapshot→annual active、employer birth→new enterprise、employer death→ceased trading、death→insolvency、survival→profit、quarterly creation→annual birth、generic ONS client→workbook route一律拒绝。

