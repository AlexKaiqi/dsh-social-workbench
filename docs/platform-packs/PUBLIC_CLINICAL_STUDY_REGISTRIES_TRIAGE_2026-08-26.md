# Public Clinical Study Registries 候选调研（2026-08-26）

状态：`researched / selected-for-concept-and-route-fixtures / no-live-access`

## 1. 第一性原理选择

本轮选择`Public Clinical Study Registries & Reported Constraints`。现有科研文献Channel只能看已公开工作及其报告限制，不能完整回答“哪些研究在发表前被注册、修改、暂停、提前终止、撤回，或完成后仍未报告结果”。试验注册表补充的是registry/sponsor声明的研究计划、执行状态和约束，不是治疗推荐、疗效裁判或患者招募工具。

两类候选暂缓：

- `Public Patents & Technology Claims`主要证明申请人提出了什么技术主张，离用户痛点和失败约束更远；后续可作为solution-space/prior-art Channel独立评估。
- `Public Regulatory Enforcement & Consent Orders`仍与规则制定、投诉和召回重叠较高，案件法律状态、settlement≠admission和party privacy需要独立契约。

## 2. 五个成员及其价值

| Member | 独特价值 | 官方surface | 当前成熟度 |
| --- | --- | --- | --- |
| ClinicalTrials.gov | NCT study、结构化protocol/results、record history、完整API v2字段树 | [API](https://clinicaltrials.gov/data-api/api)、[about API](https://clinicaltrials.gov/data-api/about-api)、[study structure](https://clinicaltrials.gov/data-api/about-api/study-data-structure) | concept+native-route fixture |
| WHO ICTRP | 全球primary registries聚合、WHO TRDS、跨registry related-record bridging | [TRDS](https://www.who.int/tools/clinical-trials-registry-platform/network/who-data-set)、[CSV/XML download](https://www.who.int/tools/clinical-trials-registry-platform/network/who-data-set/downloading-records-from-the-ictrp-database)、[web service](https://www.who.int/tools/clinical-trials-registry-platform/the-ictrp-search-portal/ictrp-search-portal-web-service) | concept+official-export/web-service route fixture；web service contract/cost gated |
| ISRCTN | UK/international study publication、lay summary、results/transparency tracker | [FAQ/API/download](https://www.isrctn.com/page/faqs)、[licence to post](https://www.isrctn.com/page/licence_to_post) | concept+official XML API/CSV route fixture；API doc draft/incomplete |
| EU CTIS | EU/EEA regulatory application、authorization/refusal、public trial/report documents | [CTIS overview](https://euclinicaltrials.eu/about-this-website/)、[EMA CTIS](https://www.ema.europa.eu/en/human-regulatory-overview/research-development/clinical-trials-human-medicines/clinical-trials-information-system) | concept+selected public-record/manual fixture；no versioned public API contract found |
| DRKS | BfArM German registry、study/recruitment/design search、official multi-format export | [study search](https://drks.de/search/en)、[BfArM search/terms/export](https://www.bfarm.de/EN/BfArM/Tasks/German-Clinical-Trials-Register/Search-studies/_node.html) | concept+manual-export fixture；no versioned public API contract found |

requested=5、concept-fixture=5、route-fixture=3、callable=0、durable-approved=0。WHO或ClinicalTrials.gov机器route不能让CTIS/DRKS变绿；页面内部endpoint、JSF form或community wrapper不是官方API contract。

## 3. 概念、身份和禁止推断

- Study、protocol、registry record、record revision、arm/intervention、condition、eligibility population、outcome definition、reported aggregate result、status history和document分别建模。
- NCT、WHO UTN、EU clinical trial number、ISRCTN、DRKS、sponsor protocol和secondary IDs属于不同authority。UTN不是registration number；WHO related-record bridge是provider relation，只有exact identifier evidence才可形成common-origin。
- not-yet-recruiting/recruiting/active/suspended/terminated/completed/withdrawn、authorized/refused和results-posted不可压成一条“成功度”。注册或authorized不证明已招募；completed不证明结果已发布、研究成功或治疗有效。
- anticipated与actual enrollment分开；registry count、country coverage和eligibility不等于患者需求、可招募人口或市场规模。
- outcome measure定义、aggregate result、participant flow和adverse-event aggregate只能保留来源声明与分母；不能自动产生疗效、安全性、因果或医疗建议。
- sponsor、responsible party、registry、regulator、results submitter和provider authority分开。PI/contact、个人邮箱电话、site地址、participant/IPD全部默认drop；不做患者eligibility matching或trial recommendation。
- 同一trial在ClinicalTrials.gov、WHO、ISRCTN、CTIS或DRKS出现属于common-origin，不按平台数重复计为独立研究活动。

只有exact record revision和source span可形成：

- `EvidenceRegistryDeclaredClinicalStudyActivity`：来源登记的研究计划、状态、里程碑或结果发布事件；
- `EvidenceReportedClinicalStudyConstraint`：来源明确报告的暂停、终止、撤回、招募困难、amendment、结果缺失或停止原因。

二者都不是独立核验、治疗建议、患者伤害、产品失败、用户痛点或市场需求。

## 4. Rights、历史和数据质量

- ClinicalTrials.gov的API、CSV、FHIR、record history和protocol/results definitions是不同能力；[Terms](https://clinicaltrials.gov/about-site/terms-conditions)及disclaimer随definition固定。registry quality review不等于scientific peer review。
- WHO ICTRP说明数据每周更新、由符合WHO标准的registries提供、WHO不endorse，也不保证accuracy/completeness；CSV/XML download公开且免费，Web Service仅research purpose、需申请并可能收费。保留data-provider attribution和获取日期。
- ISRCTN FAQ说明search results可CSV下载、XML API文档仍为draft/incomplete；Contribution为CC BY、metadata有CC0 waiver，仍需按record attribution。
- CTIS自2022起公开新系统记录，2025后完成旧试验transition；legacy EU Clinical Trials Register与CTIS不是一个完整population。未发现versioned public API/schema，内部network调用不得采用。
- DRKS Terms说明内容由study responsible persons录入/更新并经registry审核，但BfArM不保证准确、完整或及时；2024前注册或2025前最后更新的数据可能受版权限制，2025起注册或在2025更新的数据按CC BY 4.0。任何export保留来源与获取日期，历史数据库错误另作quality revision。

## 5. Skills、MCP 与开源候选

| Artifact | 固定revision / licence | 可借鉴 | 明确拒绝 |
| --- | --- | --- | --- |
| [cyanheads/clinicaltrialsgov-mcp-server](https://github.com/cyanheads/clinicaltrialsgov-mcp-server/tree/7e3f9127d020eacd813df6fbd46bbf3629eb5942) | `7e3f912` / Apache-2.0 | API v2 search/read/results/field vocabulary、cursor与omission reporting | 不安装/运行/访问hosted server；patient matching、demographics、contacts和locations能力全部拒绝 |
| [mcnamamj/ctg-python-client](https://github.com/mcnamamj/ctg-python-client/tree/1ea1736d658be7f9f86344b8825aeb6654897fe3) | `1ea1736` / MIT | 新ClinicalTrials.gov API client的route/schema研究 | community code不获得NLM authority或data rights |
| [jvfe/pytrials](https://github.com/jvfe/pytrials/tree/fb928aadbd0b4aeee665ae8c09477910db7b9d55) | `fb928aa` / BSD | 历史API wrapper与migration drift样本 | 旧API行为不能成为当前route contract |

未发现这五个平台共同认可的官方Agent Skill或MCP。任何“trial matching”Skill/MCP都属于高风险患者/医疗用途，不进入本Channel；开放源码许可证也不授予registry content、医疗使用或长期AI/index权利。

## 6. 当前门槛

下一步顺序固定为：synthetic identity/status/history/rights conformance → 用户批准的单成员metadata-only canary → 单独核验results/document fields、licence和clinical-use disclaimer → exact constraint span canary → durable materialization review。

当前禁止真实API/XML/CSV/export/search、下载trial corpus、credential、MCP/Skill/第三方代码执行、contact/site/participant/IPD、patient matching、医疗建议、trial enrollment/referral，以及submit/register/update/results upload/withdraw/contact等平台副作用。
