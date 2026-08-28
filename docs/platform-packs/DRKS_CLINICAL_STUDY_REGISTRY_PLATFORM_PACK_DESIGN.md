# DRKS Clinical Study Registry Platform Pack 设计

状态：`researched / concept+official-manual-export-fixture / missing-versioned-api-contract`  
核验日期：2026-08-26  
Pack ref：`drks-clinical-study-registry/v0-design`

## 1. 产品、概念与价值

本Pack描述BfArM运营的German Clinical Trials Register公开search和official export。官方[DRKS search](https://drks.de/search/en)支持title/summary/DRKS ID以及General、Recruitment、Study Design等filters；[BfArM search/terms/export页面](https://www.bfarm.de/EN/BfArM/Tasks/German-Clinical-Trials-Register/Search-studies/_node.html)说明public registry免费访问，individual/multiple studies可按Terms以多种格式导出。

DRKS ID、secondary IDs、sponsor/support、interventional/non-interventional type、condition、purpose、design、recruitment status/countries、eligibility、outcomes和record update分别映射`PublicClinicalStudy*`。德国研究也可能登记在其他registries；没有exact secondary ID时只形成relation candidate。

## 2. rights、质量与route边界

BfArM说明study responsible persons录入/更新内容、registry审核发布，但内容不一定代表BfArM意见，BfArM不保证accuracy/completeness/timeliness，也禁止把记录直接用于clinical care。registry审核不是scientific peer review或结果验证。

rights存在时间边界：2024及以前registered或last updated before 2025的study content可能受copyright；registered from 2025或last updated in 2025的数据适用CC BY 4.0。任何获准使用保留DRKS attribution和data acquisition date，旧记录逐项rights gate；2022系统迁移前数据库错误作为独立quality evidence。

本轮未发现versioned public developer API/schema。官方UI multi-format export仅建立manual-export fixture；JSF form、HTML、internal request或community scraper不能晋级route。PI/contact/address/site和person identity默认drop。

## 3. Fixture 与晋级

synthetic fixture覆盖DRKS/secondary registry link、interventional/observational、anticipated/actual enrollment、recruitment state change、record update、pre-2025 copyrighted vs 2025 CC BY split、acquisition date/attribution、2022 migration quality note、manual export和zero writes。Telemetry按`DRKS ID × record revision × status/design × export representation × rights cohort × acquisition date`记录coverage、identity/rights conflict和zero effects。

真实export需用户批准exact query/records/format/purpose。API只有在BfArM发布明确contract后晋级；register/update/account/contact/recruitment和所有write/effect拒绝。
