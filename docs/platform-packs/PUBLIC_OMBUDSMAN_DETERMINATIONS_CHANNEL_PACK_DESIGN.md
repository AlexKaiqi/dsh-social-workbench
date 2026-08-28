# Public Ombudsman Determinations & Reported Remedies Channel Pack 设计

状态：`researched`；4个concept-fixture成员，1个route-fixture成员，3个selected-record/manual成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-ombudsman-determinations/v0-design`

## 1. 目标、成员与分母

本Channel发现公共申诉专员公开决定中的投诉议题、investigator/preliminary/final stage、outcome、remedy、binding、appeal和reported compliance。它统一`PublicDisputeDecision*` projection，但不统一jurisdiction、complaint population、proof/decision standard、outcome/remedy taxonomy、binding rule或publication policy。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| UK Financial Ombudsman Service | [Pack](UK_FINANCIAL_OMBUDSMAN_DECISIONS_PLATFORM_PACK_DESIGN.md) | concept + selected official-record fixture |
| UK Pensions Ombudsman | [Pack](UK_PENSIONS_OMBUDSMAN_DECISIONS_PLATFORM_PACK_DESIGN.md) | concept + selected official-record fixture |
| Ireland FSPO | [Pack](IRELAND_FSPO_DECISIONS_PLATFORM_PACK_DESIGN.md) | concept + selected official-record fixture |
| UK Housing Ombudsman | [Pack](UK_HOUSING_OMBUDSMAN_DECISIONS_PLATFORM_PACK_DESIGN.md) | concept + official RSS route fixture |

requested=4、concept-fixture=4、route-fixture=1、selected-record/manual=3、callable=0、durable-approved=0。complaint、decision、outcome、remedy、acceptance/binding、appeal、compliance和publication各有独立coverage denominator。

## 2. 共同契约与证据语义

- investigator/adjudicator view和preliminary/provisional decision不是final determination；final revision可改变早期观点；
- published final不自动binding：FOS依赖complainant timely acceptance，而TPO/FSPO有各自source-declared binding与appeal制度；
- upheld、maladministration、reasonable redress和outside jurisdiction保留native taxonomy；共同outcome family只导航，不跨scheme比较或排名；
- award、direction、order、recommendation、compensation、apology、repair、policy/process change和training保留exact remedy type/status/amount role；不推断implementation、payment或effectiveness；
- appeal、judicial review、stay、variation和set-aside是独立record/relation/history；appeal pending不自动代表decision invalid；
- settled、withdrawn、outside jurisdiction、withheld、publication lag或database absence不是negative decision；published population不等于complaint/issued-decision denominator；
- case page、decision PDF和feed entry同源去重；exact official span才可形成`official-dispute-determination`或`official-dispute-remedy` evidence；
- ordinary projection排除complainant/resident natural-person name、initial、address、contact、personal identifier和confidential case detail；respondent organization只保留opaque ref且不得排名。

## 3. 动态物化与知识数仓

- `issues-by-domain-and-exact-native-outcome`：固定published population，禁止解释为总体投诉率；
- `investigator-or-preliminary-to-final-decision-history`：显示观点改变和supersedes relation；
- `final-to-acceptance-binding-appeal-history`：不从publication推断binding；
- `remedies-by-exact-type-amount-role-binding-and-compliance-status`：不从order推断payment/completion；
- `repeated-reported-failure-patterns-with-publication-lag-and-withholding-caveat`：发现问题空间，不做respondent ranking；
- `page-document-feed-common-origin-conflicts`：防止representation重复计数；
- `member-route-schema-terms-rights-anonymisation-publication-drift`：逐成员独立失效。

Dolt只保存Pack、definition、procedure/outcome/remedy/binding taxonomy digest、licence/terms digest、identity/relation review、view、decision、lineage和tombstone。分析库只接用户批准的最小case/domain/respondent-organization/outcome metadata；不接complainant identity、initial、address、contact、personal ref或原始敏感decision content。materialization key固定`member × authority/jurisdiction/domain × case/decision/revision × stage/native-outcome/binding/remedy/appeal × representation × rights-purpose`；definition、publication policy、schema、terms、rights、identity、relation或history变化触发partition invalidation/rebuild。

## 4. Capability、Skill与Probe边界

共同read capabilities是official decision-surface discovery、selected record metadata/document reference、官方feed route discovery、taxonomy/policy revision和publication observation。某成员有RSS不代表其他成员有API/feed，也不授权HTML/internal endpoint fallback。

`public-ombudsman-source-contract-research/v1`只读官方docs和固定静态source，输出Pack/drift proposal；`public-ombudsman-conformance/v1`只用synthetic fixtures验证stage/outcome/binding/remedy/appeal/publication/common-origin/privacy/rights与zero effects。未来`approved-public-ombudsman-read/v1`必须绑定用户批准的exact member/resource/filter/window/fields/budget/purpose/retention；当前返回`no-authorized-public-ombudsman-binding`。

本Channel没有Probe。提交complaint或evidence、接受/拒绝decision、appeal/judicial review、contact、subscribe或对外发布会影响真实当事人和程序，必须拒绝并保持zero external effects。

## 5. Synthetic fixtures、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| investigator view与final相反 | 两revision/stage + supersedes；只final可作final determination |
| FOS final accepted vs rejected/no response | binding status不同；published不推断accepted |
| TPO determination appealed but not stayed | binding/final、appeal pending、remedy enforceability分别保存 |
| court stay/variation/set-aside | history+relation；不得继续标原remedy当前effective |
| FSPO preliminary→binding final | preliminary不生成final evidence；35-day appeal另存 |
| Housing multiple findings | 每issue native outcome；partial不覆盖细项 |
| reasonable redress vs no maladministration | 保持不同native outcome，不压成not upheld |
| remedy ordered/recommended | 不生成paid/completed evidence |
| outside jurisdiction/withdrawn/withheld | 不作为negative outcome或投诉分母 |
| page + PDF + RSS | common-origin；一个decision identity |
| complainant name/initial/address | ordinary projection drop |
| route unavailable | missing-member degradation；no HTML/community/member fallback |
| complaint/accept/appeal/contact/subscribe | policy拒绝；zero external effects |

Telemetry按`Channel × member/authority/jurisdiction/domain × case/decision/revision × stage/native-outcome/binding/remedy/appeal × representation × schema/terms/rights/publication-policy revision`记录requested/concept-fixture/route-fixture/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、identity/common-origin conflict、history/stage/binding/remedy/appeal/publication completeness、privacy drop、rights block、lag/drift和zero writes。

至少一个成员经用户批准完成metadata-only canary才可`modeled-partial`。feed payload、documents、full history、amounts、natural-person exception和durable materialization均需逐成员另审；一个成员成功不能提升其他成员。
