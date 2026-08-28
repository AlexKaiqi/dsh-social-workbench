# Bank of Canada Senior Loan Officer Survey Platform Pack

## 1. 稳定概念

本成员描述Bank of Canada Senior Loan Officer Survey（SLOS）公开聚合。

- survey quarterly进行，面向Canadian financial institutions，收集price/non-price lending conditions及topical issues。
- `balance of opinion`是按相关market share加权的tightened responses minus eased responses；business条件正值表示net tightening，范围为-100至+100。
- business price与non-price conditions先按corporate、commercial、small-business borrower dimensions汇总，再形成overall balance；它不是单一loan rate或approval standard。
- price condition主要是spread over base rate，不是policy rate或contract rate；non-price包括collateral、covenants、standards和capital allocation limits。
- balance只表达净变化方向，不提供变化幅度、loan volume或identified borrower result。
- narrative publication已于2020-01-01停止，但quarterly data继续发布；pre-2020 demand/capital-market narratives与current machine group是不同history products，不能假设字段连续。

官方入口：[SLOS page](https://www.bankofcanada.ca/publications/slos/)、[backgrounder](https://www.bankofcanada.ca/wp-content/uploads/2011/07/senior_loan_officer_survey_backgrounder.pdf)、[Valet how-to](https://www.bankofcanada.ca/valet-api-how-to/)、[historical 2019 Q1 release](https://www.bankofcanada.ca/2019/04/senior-loan-officer-survey-first-quarter-of-2019/)。

## 2. 能力与接入

| Capability | 官方表面 | 本轮结论 |
| --- | --- | --- |
| current overall/price/non-price business conditions | SLOS page + Valet group `slos` | exact official machine route-fixture |
| CSV/JSON/XML group observations | Valet `/observations/group/slos/{format}` | route/schema fixture |
| demand/factors/capital-market access | historical narrative releases | historical selected-record only |
| current questionnaire/panel detail | background/current page | method fixture；coverage需逐revision |
| institution-level responses | not public | unsupported |

Valet无需registration或API key且无费用，但[terms](https://www.bankofcanada.ca/terms/)禁止绕过request frequency limits。current page只证明已发布series集合；generic Valet group不能自动补回停止发布的narrative dimensions。

## 3. Agent、MCP 与固定开源候选

- [tylercroberts/pyvalet@`453b294`](https://github.com/tylercroberts/pyvalet/tree/453b29403354cb6970219c4b25f0ecdbd11e7a1a)是community MIT Python wrapper，覆盖Valet lists/groups/series与CSV/JSON转换。它不是Bank of Canada官方SDK，依赖中仍固定旧版Python/testing/urllib3组合，也不理解SLOS sign、weighting、publication break或series semantics。
- 未发现Bank of Canada维护的Valet MCP或SLOS Agent Skill。
- generic macro MCP即使能访问Valet/FRED镜像，也不能替代official group identity与Bank background methodology。

本轮未请求Valet observations、未安装pyvalet、未执行测试或创建cache。

## 4. 权利、隐私与安全

- [Bank of Canada terms](https://www.bankofcanada.ca/terms/)允许在attribution、accuracy与change disclosure条件下使用网站内容，并保留third-party exceptions和request limits。
- respondent institution、market share、individual answer、borrower、application、facility和contact全部drop。
- current aggregate不能用于识别或排名financial institutions，也不代表Bank政策观点。
- 本成员没有Probe；不提交survey、不申请loan、不联系institution、不绕过Valet limits。

## 5. 成熟度与下一门槛

成员成熟度：`concept-fixture / exact official Valet route-fixture / historical selected-manual`；`sandbox-live=0 / callable=0 / durable=0`。

下一门槛是以手写Valet group/series envelopes验证current condition series、正负号、market-share weighting、publication discontinuity与missing dimensions；真实API observation读取另行授权。
