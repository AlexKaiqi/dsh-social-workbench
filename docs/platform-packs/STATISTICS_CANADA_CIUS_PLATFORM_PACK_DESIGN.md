# Statistics Canada Canadian Internet Use Survey Platform Pack

## 1. 稳定概念与官方事实

[CIUS survey 4432](https://www.statcan.gc.ca/en/survey/household/4432)说明2022 cycle收集home internet/access type、connected devices、internet use、social connection、government services、e-commerce、security/privacy/trust、digital skills、online work、health与demographics；collection为2022-11-29至2023-04-05，electronic questionnaire加telephone follow-up，voluntary participation。

[2022 questionnaire](https://www23.statcan.gc.ca/imdb/p3Instr.pl?Function=assembleInstr&Item_Id=1487379)提供question identifiers、routing与12-month skill/activity wording。[official release tables](https://www150.statcan.gc.ca/n1/daily-quotidien/230720/dq230720b-cansim-eng.htm)包括22-10-0134-01至相关access/use/activity/security tables；survey是occasional，不得从table页面修改日期推断新cycle。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| survey/questionnaire/concept metadata | `fixture` | survey 4432 + exact cycle |
| selected published tables via WDS/SDMX | `route-fixture` | PID/table coordinate/status固定 |
| PUMF/RDC microdata | `not-adopted` | aggregate-only，且历史PUMF曾有replicate-weight correction |
| survey response/contact | `forbidden` | zero effects |

internet use可能限定personal use/past three months并排除business/school use；question-specific base不能由标题猜测。reported digital skill activity不等于proficiency；general health字段属于敏感内容，不进入本Channel。

## 3. 开源、Skill与验证

[mcp-statcan@`ff34ecd`](https://github.com/Aryan-Jhaveri/mcp-statcan/tree/ff34ecd7462000ac4e23b7b2f1076d93e22b3f33)是community/MIT WDS+SDMX MCP，hosted processor、广table search/download与optional SQLite不进入信任边界。[statcanR@`d21b8bf`](https://github.com/warint/statcanR/tree/d21b8bf905f32e4ccb8a7d604e24a2e92c184fef)是community/MIT generic client，也不拥有CIUS语义。两者均未安装、连接或执行；未发现programme-owned Skill。

Synthetic覆盖15+ / ten-province population、internet-user routing、3/12-month windows、question ID、multiple-select、table PID/vector/status、coefficient-of-variation/suppression、PUMF correction lineage、health-field rejection与occasional lifecycle。

## 4. Snapshot与可观测性

Snapshot保存survey/cycle、questionnaire/question ID、table PID/cube/code set、population/routing/window、quality/correction/rights和OSS decision。Telemetry逐`cycle × question/base × table/PID/coordinate × population/window × estimate/status/CV`记录retained/dropped/suppressed、PID/code/correction drift、microdata/health-field quarantine与zero effects。
