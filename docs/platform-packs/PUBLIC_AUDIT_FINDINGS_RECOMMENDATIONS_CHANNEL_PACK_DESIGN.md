# Public Audit Findings, Recommendations & Follow-up Channel Pack 设计

状态：`researched`；5个concept-fixture成员，2个route-fixture成员，3个selected-record/manual成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-audit-findings-recommendations/v0-design`

## 1. 目标、成员与分母

本Channel发现公共审计报告中的scoped finding/conclusion、recommendation、auditee response、action/implementation update和auditor follow-up。它统一`PublicAuditFinding*` projection，但不统一mandate、jurisdiction、report population、audit standard、assurance、finding/recommendation/status taxonomy或follow-up selection。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| US GAO | [Pack](US_GAO_AUDIT_REPORTS_RECOMMENDATIONS_PLATFORM_PACK_DESIGN.md) | concept + official reports RSS route fixture |
| UK NAO | [Pack](UK_NAO_REPORTS_RECOMMENDATIONS_PLATFORM_PACK_DESIGN.md) | concept + selected official-record fixture |
| European Court of Auditors | [Pack](EU_ECA_AUDIT_REPORTS_OPEN_DATA_PLATFORM_PACK_DESIGN.md) | concept + official ECA open-data catalogue route fixture |
| Australia ANAO | [Pack](AUSTRALIA_ANAO_PERFORMANCE_AUDITS_PLATFORM_PACK_DESIGN.md) | concept + selected official-record fixture |
| Canada OAG | [Pack](CANADA_OAG_PERFORMANCE_AUDITS_PLATFORM_PACK_DESIGN.md) | concept + selected official-record fixture |

report、finding、recommendation、response、implementation、follow-up、dataset和benefit各有独立coverage denominator；一个route成功不能提升其他成员或其他record family。

## 2. 共同契约与证据语义

- `official-audit-finding`必须引用exact auditor-authored span及objective/scope/criteria/method/report revision/posture；draft、auditee assertion和provider summary不能升级；
- `official-audit-recommendation`只证明建议被提出，不证明法律义务、接受、预算、采购、落实或需求；
- `reported-audit-follow-up`必须声明implementation authority：auditee self-report、auditor confirmation或follow-up audit；三者不可互换；
- agreed≠implemented，closed/no-longer-valid≠implemented，confirmed implemented≠持续有效/因果成功；
- potential/estimated saving、reported realized benefit和receipt保持exact amount role/method/currency，不跨方法求和；
- report page/PDF/RSS/tracker/DCAT dataset按common-origin去重；dataset只support report，不是独立finding；
- published report不代表audit files全部findings；tracker/open-data/follow-up selected population不代表总分母；
- ordinary projection只保留opaque organization refs；自然人、联系人、举报者、证人和敏感底稿不进入。

## 3. 动态物化与知识数仓

- `findings-by-exact-scope-criteria-authority-and-topic`：禁止组织风险/表现排名；
- `finding-to-recommendation-response-and-implementation-history`：显示revision与authority；
- `auditee-reported-vs-auditor-confirmed-status-gaps`：不把gap解释为欺诈或失败；
- `recommendations-by-exact-native-status-and-age`：携带selection/coverage caveat；
- `follow-up-selection-and-confirmation-gaps`：未被选中不是negative；
- `potential-vs-reported-realized-benefit-by-method`：不同method/role不聚合；
- `report-page-document-feed-tracker-dataset-common-origin`：抑制重复证据；
- `member-route-schema-process-rights-methodology-status-drift`：逐成员失效。

Dolt只保存Pack、definition、process/report/finding/recommendation/status taxonomy digest、licence/methodology digest、identity/relation review、view、decision、lineage和tombstone。分析库只接获准的最小organization/report/finding/recommendation/status metadata；不接contacts/natural persons、raw sensitive documents或audit working papers，也不物化organization performance/risk ranking。materialization key固定`member × jurisdiction/publisher × report/revision × scope/criteria/method × finding/recommendation × response/implementation-authority × representation × rights-purpose`。

## 4. Capability、Skill与Probe边界

共同read capabilities是official report-surface discovery、selected report metadata/reference、recommendation/follow-up taxonomy discovery、official report feed discovery和selected open-data catalogue discovery。GAO RSS不代表recommendation payload coverage；ECA open data只覆盖selected reports；NAO/ANAO/OAG不得HTML/internal endpoint fallback。

`public-audit-source-contract-research/v1`只读官方docs和固定静态source并输出Pack/drift proposal；`public-audit-conformance/v1`只用synthetic fixtures。未来`approved-public-audit-read/v1`必须绑定exact member/route/query-or-report-roster/window/fields/budget/purpose/retention；当前返回`no-authorized-public-audit-binding`。

本Channel没有Probe。audit request、fraud/whistleblower report、evidence/comment submission、auditee response、recommendation status update、contact或subscribe均拒绝并保持zero external effects。

## 5. Synthetic fixtures、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| draft finding从final移除 | 两revision/posture；draft不生成official final finding |
| sample内finding被外推全组织 | scope/selection gate拒绝 |
| recommendation issued，auditee disagrees | recommendation+response两个authority |
| auditee agrees但无implementation | response不能升级status |
| self-report implemented，auditor仅确认partial | 两status并存，auditor authority不覆盖历史自报 |
| closed/no-longer-valid | 不映射implemented |
| recommendation corrected/superseded | relation+history；旧revision不当前化 |
| follow-up selected subset | coverage incomplete，不作全分母 |
| potential savings vs realized benefit | exact role/method，不相加、不推断receipt |
| page+PDF+RSS+tracker+dataset | common-origin；一个报告/建议identity |
| ECA open-data subset | 缺dataset不代表缺report/finding |
| GovInfo 2008 frozen archive | 不作当前GAO fallback |
| natural-person/contact | ordinary projection drop |
| route missing | member degradation；no HTML/provider/member fallback |
| audit request/report/contact/subscribe/status write | policy拒绝；zero external effects |

Telemetry按`Channel × member/publisher/jurisdiction × report/revision × scope/method × finding/recommendation × response/implementation-authority × representation × schema/methodology/rights revision`记录requested/concept-fixture/route-fixture/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、identity/common-origin conflict、scope/finding/recommendation/response/follow-up/benefit coverage、privacy drop、rights block、lag/drift和zero writes。

至少一个成员经用户批准完成metadata-only canary才可`modeled-partial`。feed/API payload、documents/datasets、full tracker/history、benefit amounts、自然人例外和durable materialization均需逐成员另审；一个成员成功不能提升其他成员。
