# ClinicalTrials.gov Study Registry Platform Pack 设计

状态：`researched / concept+native-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`clinicaltrials-gov-study-registry/v0-design`

## 1. 产品、概念与价值

本Pack描述ClinicalTrials.gov公开study records、API v2和record history。官方[API文档](https://clinicaltrials.gov/data-api/api)与[study data structure](https://clinicaltrials.gov/data-api/about-api/study-data-structure)提供结构化protocol、identification、status、sponsor/collaborator、oversight、description、conditions、design、arms/interventions、outcomes、eligibility、locations和references；posted results还可含participant flow、baseline、outcome measures和adverse-event aggregates。

其独特价值是观察NCT record在发表前后的registry-declared plan、recruitment/status、protocol update和results posting。NLM/registry review、FDAAA reporting scope和record presence不等于regulatory approval、scientific peer review、实际执行、研究成功、疗效或安全性。

| Native concept | `PublicClinicalStudy*` | 约束 |
| --- | --- | --- |
| NCT ID / study record | study/registry record identity | NCT是registry ID；secondary ID/DOI只建evidence relation |
| protocol modules | protocol/version/design | current JSON不覆盖历史revision；字段缺失不推断negative |
| overall status / why stopped | native lifecycle/constraint span | terminated/suspended/withdrawn逐native definition；reason是submitter claim |
| enrollment type/count | anticipated/actual enrollment | 不等于实际可招募人口、患者需求或market size |
| primary/secondary outcome | outcome definition | measure/time frame与posted result分开 |
| results modules | aggregate result representation | 不生成疗效、安全性、因果或治疗推荐 |
| last update/history | record revision/history | update date不是study event date；旧span保留并可失效 |

PI、central contact、facility name/address、individual site、个人email/phone和patient-level eligibility输入在normalization前drop。country-level coverage可保留；不支持`find eligible`、patient matching、recruitment referral或contact workflow。

## 2. 能力、route 与历史

concept capability为study search/read/count、field-definition/value discovery、exact NCT history/revision read、protocol/results metadata read和CSV/FHIR availability discovery。route fixture固定API version、query areas、filter/sort、page token/page size、field projection、JSON schema、enum/date migration、response size/omission、rate/error和version endpoint；本轮不发送API请求。

[About the API](https://clinicaltrials.gov/data-api/about-api)、[protocol definitions](https://clinicaltrials.gov/policy/protocol-definitions)和[results definitions](https://clinicaltrials.gov/policy/results-definitions)共同构成schema语义；API success不能替代这些definition revisions。record history、current API JSON、CSV和FHIR为不同representation，同一NCT不重复计数。

[Terms](https://clinicaltrials.gov/about-site/terms-conditions)、disclaimer和reporting-requirement变化进入knowledge snapshot。结果存在不代表完整、及时或符合所有义务；未posted也不能直接推断违规或研究失败。

## 3. OSS/MCP、Fixture 与晋级

[cyanheads/clinicaltrialsgov-mcp-server@7e3f912](https://github.com/cyanheads/clinicaltrialsgov-mcp-server/tree/7e3f9127d020eacd813df6fbd46bbf3629eb5942)是Apache-2.0社区MCP，能见证API v2 search/read/results/field能力，但其hosted server、patient matching、demographics、contacts和locations全部拒绝。[mcnamamj/ctg-python-client@1ea1736](https://github.com/mcnamamj/ctg-python-client/tree/1ea1736d658be7f9f86344b8825aeb6654897fe3)是MIT社区client，只作静态route/schema研究。

synthetic fixture覆盖NCT current/history、anticipated→actual enrollment、recruiting→suspended→terminated、why-stopped claim、completed-without-results、results-posted-without-efficacy inference、secondary registration、field/date/enum migration、contact/site/IPD drop和zero writes。Telemetry按`query × NCT × record revision × module × status/results representation × terms/schema revision`记录coverage、history gap、field omission、identity conflict、rights/PII block和zero effects。

metadata-only canary需用户批准；results/document spans、history bulk和durable corpus分别另审。PRS submit/update/results upload、account/contact、patient matching和所有write/effect拒绝。
