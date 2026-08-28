# Public Petitions, Support & Official Responses Channel Pack 设计

状态：`researched`；4个concept-fixture成员，2个route-fixture成员，2个selected-record/manual成员，0个callable成员，0个durable-approved成员
核验日期：2026-08-26
Channel Pack ref：`public-petitions-support-responses/v0-design`

## 1. 目标、成员与分母

本Channel发现正式公开请愿中的action requested、平台接受的support aggregate，以及government/committee/chamber的后续程序。它统一`PublicPetition*` projection，但不统一eligibility、jurisdiction、admissibility、moderation、publication、signature counting、threshold、response duty、committee power、language、closure或privacy。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| UK Parliament | [Pack](UK_PARLIAMENT_PETITIONS_PLATFORM_PACK_DESIGN.md) | concept + JSON/CSV route fixture |
| Scottish Parliament | [Pack](SCOTTISH_PARLIAMENT_PETITIONS_PLATFORM_PACK_DESIGN.md) | concept + selected-record/manual |
| Senedd | [Pack](SENEDD_PETITIONS_PLATFORM_PACK_DESIGN.md) | concept + bilingual JSON route fixture |
| European Parliament | [Pack](EUROPEAN_PARLIAMENT_PETITIONS_PLATFORM_PACK_DESIGN.md) | concept + selected-record/manual |

petition、moderation、support、threshold、response、committee、debate、report与closure分别报告coverage。任何member缺失都不能被HTML、community MCP或另一部署的route补齐。

## 2. 共同证据与关系

- `EvidencePublishedPetitionRequest`只来自approved exact petitioner-authored span；moderation/publication不是truth review或endorsement；
- `EvidencePlatformAcceptedPetitionSupport`必须绑定counting/eligibility/verification/invalidation/paper-online policy和`observedAt`；count是mutable snapshot；
- `EvidenceOfficialPetitionResponse`必须标注government、department、committee或chamber authority，并区分responded/considered/referred/scheduled/debated/reported/closed；
- request、support aggregate、threshold、response、committee action、debate与report用exact relation连接；相似topic/title不能自动建立duplicate或supersedes；
- list/show/count、HTML/JSON/CSV和不同语言rendition可为common-origin projection，只计一个canonical petition/action；
- threshold policy是member + process revision知识，不能把UK的10,000/100,000、Senedd的250/10,000或Scotland的all-published rule变成全局常量；
- external signatures、campaign reach、page views和social shares不进入official support denominator。

## 3. 动态物化与知识数仓

- `petitions-by-exact-jurisdiction-topic-action-and-lifecycle`：用于检索，不做popular opinion排名；
- `support-snapshot-history-with-invalidation-coverage`：保留count可下降与coverage gap；
- `threshold-to-actual-response-and-debate-gap`：threshold event与真实follow-up分离；
- `moderation-and-rejection-reason-by-process-revision`：只描述流程，不把rejected解释为无需求；
- `official-response-committee-debate-report-history`：按authority与event time展示；
- `bilingual-and-multilingual-common-origin`：避免translation重复；
- `dissolution-election-withdrawal-and-closure`：不推断issue resolution；
- `member-route-schema-process-threshold-privacy-rights-drift`：逐成员失效，不跨成员升级。

Dolt只保存Pack、definition、jurisdiction/process/eligibility/admissibility/moderation/threshold/counting/response/committee/language/privacy/rights/schema digest、identity/relation/revision、view、decision、lineage与tombstone。分析库只接获准的opaque petition/topic/lifecycle/support aggregate/threshold与official-action status；不接creator/signer identity、contact、address/postcode/IP、exact geography、special-category profile或未审查敏感全文，也不物化constituency、topic或群体的政治倾向排名。

materialization key固定`member × jurisdiction/legislature/process revision × petition/revision × record kind/authority × support snapshot/count policy × threshold policy × representation/language × rights-purpose`。process、threshold、counting、schema、privacy、language、rights、history或parliament term变化使对应partition invalidation/rebuild。

## 4. Capability、Skill与副作用边界

共同read concepts是official process/definition discovery、public register/list representation、selected petition metadata、support aggregate snapshot、moderation reason、government response、committee action、debate/report/closure reference。它们是capability vocabulary，不是当前可调用Connector。

`public-petition-source-contract-research/v1`只产生versioned knowledge proposal；`public-petition-conformance/v1`只消费synthetic fixtures。未来read binding必须逐成员限定route、state/window/topics、fields、budget、purpose、retention和deletion；没有route的Scotland/EU保持selected-record/manual，禁止HTML或browser自动fallback。

本Channel没有Probe。create/sponsor/sign/verify/withdraw/share/contact/evidence-submit/subscribe/update全部拒绝，所有平台写入和政治参与效果恒为零。

## 5. Synthetic fixtures、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| published petition含未证实事实 | petitioner claim；不生成verified fact/endorsement |
| rejected因duplicate/out-of-competence | moderation decision；不生成no-demand结论 |
| verified email + one-signature rule | 记录policy；不声称独立验证unique citizen |
| count跨threshold后因invalid/deletion下降 | 两个mutable snapshots + reversed status；不删除历史 |
| UK达到10,000但response pending | threshold reached与response awaiting分开 |
| UK达到100,000但committee不安排辩论 | considered/not-debated；不生成debated |
| debate发生但无采纳 | debate event；不生成adoption/implementation |
| response不同意或只解释现状 | official response；不生成agreement/action |
| dissolution/election关闭petition | closure cause；不生成issue resolved |
| Scotland低签名published petition | committee consideration eligible；不套数值门槛 |
| Senedd 250/10,000 | review/debate-consideration分别建模，均不保证结果 |
| paper + online signatures | 按member policy reconcile；不得简单相加 |
| Welsh/English或EU多语言summary | official rendition/common-origin，只计一次 |
| list/show/count多representation | common-origin，一个petition/support snapshot |
| creator/signers/postcode/IP/email/special category | drop/quarantine；普通projection为零 |
| constituency aggregate低于minimum cell | drop；不建立政治画像 |
| Scotland/EU没有approved machine route | blocked/manual；不自动抓HTML或换community tool |
| create/sign/verify/contact/subscribe/evidence submit | policy拒绝；zero external effects |

Telemetry按`Channel × member/jurisdiction/process × petition/revision × record kind/authority × lifecycle/moderation/response/deliberation × support/count-policy/threshold × representation/language × schema/privacy/rights revision`记录requested/concept-fixture/route-fixture/selected-manual/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、common-origin/identity/relation conflict、各类coverage、count regression/invalidation lag、threshold-to-action gap、PII/sensitive-content drop、rights block、schema/process drift与zero writes。

至少一个成员经用户批准完成metadata-only canary后才可`modeled-partial`。list rows、selected detail、support geography、full text、committee evidence、historical archives与durable materialization分别另审；一个成员或一个representation成功不提升其他成员。
