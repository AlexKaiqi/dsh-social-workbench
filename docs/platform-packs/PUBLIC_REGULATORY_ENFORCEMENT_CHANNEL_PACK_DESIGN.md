# Public Regulatory Enforcement & Remedial Obligations Channel Pack 设计

状态：`researched`；5个concept-fixture成员，3个route-fixture成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-regulatory-enforcement/v0-design`

## 1. 目标、成员与分母

本Channel发现public authority或court公开记录中的regulatory matter、complaint/charge、finding、decision、order/judgment、settlement、appeal和remedial obligation。它统一`PublicRegulatoryEnforcement*` projection，但不统一jurisdiction、procedure、legal basis、case population、proof standard、finality、outcome或rights。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| US EPA ECHO Enforcement Cases | [Pack](EPA_ECHO_ENFORCEMENT_CASES_PLATFORM_PACK_DESIGN.md) | concept + official read-service route fixture |
| US CFPB Enforcement Actions | [Pack](CFPB_ENFORCEMENT_ACTIONS_PLATFORM_PACK_DESIGN.md) | concept + selected official-record fixture |
| US FTC Cases & Proceedings | [Pack](FTC_CASES_PROCEEDINGS_PLATFORM_PACK_DESIGN.md) | concept + selected official-record fixture |
| US SEC enforcement proceedings | [Pack](SEC_ENFORCEMENT_PROCEEDINGS_PLATFORM_PACK_DESIGN.md) | concept + official RSS route fixture |
| UK CMA Cases | [Pack](UK_CMA_CASES_PLATFORM_PACK_DESIGN.md) | concept + official feed route fixture |

requested=5、concept-fixture=5、route-fixture=3、callable=0、durable-approved=0。case、proceeding、release、document、assertion、obligation和appeal各有自己的coverage denominator。

## 2. 共同契约与法律语义

- `lifecycle`只导航程序；`assertion posture`区分alleged/agency finding/tribunal finding/court finding/admission/no-admission/settlement/no determination/vacated；`final/effective`和`appeal pending`另存；
- complaint/charge不是finding；agency finding不自动等于court finding；settlement不自动等于admission；proposed consent/order不是entered/final/effective；
- closed不表示violation proven、appeal exhausted或obligation completed；order可被stayed、vacated、reversed或remanded；
- penalty、disgorgement、redress、refund和forfeiture必须保留amount role/currency/instrument；金额不证明已支付、已追回、消费者已收到或跨regime可比较；
- release、case page、feed entry、docket和document若来自同一matter/instrument，建立`common-origin`而非重复计数；parallel regulator/court action保持独立identity并显式关联；
- ordinary projection排除natural-person name、victim、witness、contact、address和personal identifier；不得生成respondent guilt/profile/risk ranking；
- exact official record revision/source span才可形成`official-regulatory-compliance-assertion`或`official-regulatory-remedial-obligation` evidence，且始终携带authority/posture/finality/status。

## 3. 动态物化与知识数仓

- `allegations-vs-findings-vs-admissions-by-exact-legal-basis`：不压成单一noncompliance flag；
- `proposed-vs-entered-final-effective-obligations`：保留stay/vacatur/expiry/completion source；
- `complaint-to-order-or-judgment-to-appeal-vacatur-remand-history`：允许revision correction；
- `remedy-penalty-redress-by-exact-amount-role-and-currency`：禁止跨regime求和或排名；
- `repeated-conduct-patterns-by-exact-authority-and-posture`：用于发现问题空间，不做guilt/profile scoring；
- `document-release-feed-case-common-origin-conflicts`：防representation重复；
- `member-route-schema-terms-rights-privacy-drift`：逐成员独立失效。

Dolt保存Pack、definition、taxonomy/licence digest、identity/relation review、view、decision、lineage和tombstone。分析库只接用户批准的最小organization/case metadata和聚合；不接自然人、victim/witness、contact或原始敏感document。materialization key固定`member × authority × jurisdiction × matter/case/proceeding × instrument/revision × posture/finality/obligation-status × representation × rights-purpose`；history、schema、terms、rights、identity或relation变化触发partition invalidation/rebuild。

## 4. 能力、Skill与Probe边界

共同read capabilities是public case/feed/service discovery、selected metadata/document reference读取和revision observation；这些能力不代表每个成员都有官方API，也不授权HTML/internal endpoint fallback。

`public-regulatory-enforcement-source-contract-research/v1`只读官方docs和固定GitHub source，输出Pack/drift proposal。`public-regulatory-enforcement-conformance/v1`只用synthetic fixtures验证identity、posture、finality、obligation、history/common-origin、privacy drop、rights和zero effects。未来`approved-public-regulatory-enforcement-read/v1`必须绑定用户批准的exact member/resource/filter/field/window/budget/purpose；当前返回`no-authorized-public-regulatory-enforcement-binding`。

本Channel没有Probe。提交complaint、comment、petition、filing、e-filing、whistleblower report、contact、subscription或任何对外发布均是高影响平台副作用，不能用来测试需求。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| complaint filed then dismissed | 保留alleged与dismissal；不生成finding |
| proposed consent not entered | obligation=proposed；final/effective=false或unknown |
| settlement expressly no admission | posture=no-admission；不得推断admission/finding |
| agency finding later vacated | history+vacates relation；当前posture不得仍标final finding |
| final order stayed pending appeal | final与stayed/appeal-pending独立存在 |
| case closed while obligations remain active | lifecycle=closed；obligation仍effective |
| release + document + feed duplicate | common-origin；一个source instrument |
| parallel regulator and court actions | distinct cases；parallel relation，不合并docket |
| natural-person party | ordinary projection drop；仅治理层opaque exclusion evidence |
| route unavailable | missing-member degradation；no HTML/community/member fallback |
| filing/contact/subscription request | policy拒绝；zero external effects |

Telemetry按`Channel × member/authority/jurisdiction × case/proceeding/instrument × posture/finality/obligation-status × representation × schema/terms/rights revision`记录requested/concept-fixture/route-fixture/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、identity/common-origin conflict、history/posture/finality/obligation completeness、privacy drop、rights block、lag/drift和zero writes。

至少一个成员经用户批准完成metadata-only canary才可`modeled-partial`。documents、full history、monetary details、natural-person exception、durable materialization均需逐成员另审；一个成员成功不能提升其他成员。

