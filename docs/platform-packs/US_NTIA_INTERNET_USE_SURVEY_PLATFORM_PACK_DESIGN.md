# U.S. NTIA Internet Use Survey Platform Pack

## 1. 稳定概念与官方事实

[NTIA Data Central](https://www.ntia.gov/topics/data-central)说明该调查由NTIA定期委托Census Bureau，作为Current Population Survey supplement收集computer、internet、device与online activity信息。[2023 Census dataset page](https://www.census.gov/data/datasets/2023/demo/cps/cps-computer.html)发布公开文件、supplement nonresponse/primary-respondent replicate weights与技术文档；[NTIA Data Explorer](https://www.ntia.gov/data/explorer)按state/demographic展示Internet Use、Device Use、Non-Use at Home、Household Connectivity和Online Activities。

当前可确认最新发布结果是November 2023；[2025 information collection](https://www.ntia.gov/federal-register-notice/2025/2025-internet-use-survey-information-collection)是拟收集instrument/PRA流程，不是2025 results。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| programme/method/questionnaire metadata | `fixture` | NTIA sponsor与Census collector分开 |
| Data Explorer/analyze-table aggregate | `fixture` | metric、population、breakdown、MOE与vintage固定 |
| CPS public-use file/replicate weights | `not-adopted` | respondent-level；本Channel aggregate-only |
| 2025 proposed instrument | `definition-fixture` | `proposed-not-results` |
| survey response/contact | `forbidden` | zero effects |

household record、person record、primary respondent、proxy response和replicate-weight population不得合并。home non-use reason不是因果或lead；smartphone-only不是没有internet，也不自动等于poor service。

## 3. 开源、Skill与验证

[NTIADC/ntia-internet-use-survey@`1410bad`](https://github.com/NTIADC/ntia-internet-use-survey/tree/1410bad7099be1b82ccc5570b69d3fe4323da5e1)包含official import、table-generation、sample code与tech docs，但未见license文件；只作静态method/schema witness，不安装、不执行、不复制代码。未发现programme-owned Agent Skill/MCP。

Synthetic覆盖household/person、self/proxy、nonresponse/primary replicate weights、internet/device/non-use/activity、2021→2023 question drift、MOE/suppression、2025 proposed-vs-published negative case。未来canary只能读用户批准的small aggregate table；不得下载microdata。

## 4. Snapshot与可观测性

Snapshot保存survey vintage、instrument/tech-doc/analyze-table revision、metric/question/population/weight/MOE定义、rights review与OSS decision。Telemetry逐`vintage × household/person × question/metric × time-window × breakdown × weight/denominator`记录retained/dropped/suppressed、question drift、replicate-weight mismatch、proposed-as-result rejection和zero effects。
