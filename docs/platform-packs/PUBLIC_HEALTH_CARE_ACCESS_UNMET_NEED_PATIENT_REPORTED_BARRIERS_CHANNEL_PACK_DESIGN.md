# Public Health-Care Access, Unmet Need & Patient-Reported Barriers Channel Pack

## 1. 契约

比较键固定：`member × programme/release × population/denominator × service × instrument/question/revision × need/outcome × barrier/main-or-any × window × representation/measure × weight/method × breakdown/quality × rights-purpose`。本Channel是aggregate hypothesis source，不是病例、provider ranking、医疗建议或Probe surface。

Dolt/Git snapshot保存programme/lifecycle、population/denominator、service、instrument/question、outcome/barrier、method/quality、release/rights、fixed OSS/Skill decision与lineage；不保存response、health record、microdata、identity、rare cell或download。未来分析库只接approved aggregate cells。

动态物化至少隔离：`self-reported-need-vs-clinical-necessity`、`delay-nonreceipt-nonseeking-contact-appointment-attendance-treatment`、`main-vs-any-reason`、`cost-wait-distance-availability-appointment-time-fear-information`、`population-vs-needed-vs-user-vs-registered-patient denominator`、`service-type`、`12-month-last-contact-last-appointment-urgent`、`experience-vs-quality-outcome`、`preliminary-final`、`zero-missing-suppressed-unreliable`、`questionnaire-result-route-lifecycle`与`sensitive-aggregate-only`。

## 2. Conformance 与可观测性

Synthetic必须拒绝上述所有跨概念转换；还要拒绝NHIS sample-design跨断点、GPPS pre-2024续series、EU-SILC total-population/needed-population互填、ABS 2024–25 geography coverage回填、generic parser/Skill成功提升domain maturity，以及route失败回退microdata/HTML/unknown code/write。

Telemetry逐完整比较键发布requested/returned/retained/dropped/quarantined/suppressed cells、unknown service/outcome/barrier/denominator/question/window/method/quality/release、question/method/geography drift、preliminary/final conflict、sensitive-breakdown rejection和zero effects。成员health与成熟度独立。

## 3. Probe 与隐私

本Channel没有平台Probe。survey submission、respondent recruitment/contact、appointment/service contact、custom tabulation、public-use/restricted microdata、DataLab、MCP/Skill install、mirror/index和全部write需另行授权。aggregate模式只能转成去群体化假设，再走自有获批实验。
