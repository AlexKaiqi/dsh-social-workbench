# Public Procurement Demand & Contract Execution Channel Pack v0.3 设计

状态：`researched`；7个concept-fixture成员，6个route-fixture成员，1个manual-only成员，0个callable成员，0个durable-approved成员  
核验日期：2026-08-26  
Channel Pack ref：`public-procurement-demand/v0.3-design`  
Supersedes：[v0.2](PUBLIC_PROCUREMENT_CHANNEL_PACK_V0_2_DESIGN.md)

## 1. revision目标与成员

v0.3保留v0.2的query scope、representation和mixed-maturity原则，并把公共projection扩为`plan/requirement → procedure/notice/lot → award → contract/call-up → amendment/financial action → performance/completion/termination`。新增成员补足award、contract disclosure和native execution feed；它们不会改写既有成员Pack。

| Member | 增量事实 | 当前coverage |
| --- | --- | --- |
| [SAM.gov](SAM_GOV_OPPORTUNITIES_PLATFORM_PACK_DESIGN.md) | US opportunity/latest notice/award summary | concept + route fixture |
| [EU TED](EU_TED_PLATFORM_PACK_DESIGN.md) | EU procedure/notice/change/award | concept + route fixture |
| [UK Find a Tender](UK_FIND_A_TENDER_PLATFORM_PACK_DESIGN.md) | UK OCDS release/record及PA2023 contract/performance/termination notices | concept + route fixture |
| [CCGP](CCGP_PUBLIC_PROCUREMENT_PLATFORM_PACK_DESIGN.md) | PRC selected notice/result/contract | concept + manual-only |
| [USAspending](USASPENDING_AWARD_TRANSACTION_PLATFORM_PACK_DESIGN.md) | US prime award/transaction/subaward/obligation/outlay | concept + route fixture |
| [Canada Proactive Contracts](CANADA_PROACTIVE_CONTRACTS_PLATFORM_PACK_DESIGN.md) | quarterly contract/amendment + annual aggregate/nil | concept + route fixture |
| [Prozorro](PROZORRO_OPENPROCUREMENT_PLATFORM_PACK_DESIGN.md) | plan/tender/award/contract/change/implementation feed | concept + route fixture, version gated |

requested=7、concept-fixture=7、route-fixture=6、manual-only=1、callable=0、durable-approved=0。成员技术成功不提升其他成员；Prozorro docs/source gate未解时仅其route保持quarantined，CCGP不进入automated denominator。

## 2. 公共`PublicProcurement*`契约

- process、plan、opportunity、notice、procedure、lot、award、prime award、subaward、contract、framework、transaction、disclosure分别有identity；标题、组织名称、金额和日期相似只形成review candidate；
- common lifecycle只导航；native status、procedure regime、response window、award/contract/execution state另存；awarded不等于signed/active，completed不等于accepted/successful；
- estimated budget、award amount、current/potential award、original/current contract、amendment、obligation/deobligation、outlay、subaward和aggregate disclosed value保留amount role/currency/tax/period；禁止跨role求和；
- obligation/hard commitment不等于outlay，outlay不自动证明supplier receipt，contract value不等于payment，negative amendment不等于refund；
- provider-native JSON、provider OCDS projection、official feed、bulk/CSV、notice和manual extract分别保存representation/common-origin；标准化projection不改写source；
- coverage固定member/population/threshold/reporting duty/exclusion/history/late/correction/nil policy；公开portal不等于法定市场全集；
- natural-person recipient/vendor/buyer、contacts、address、bid/complaint narrative和confidential document默认drop；organization只用opaque refs，不做vendor performance/risk ranking。

exact buyer-authored planning/tender span最多形成`EvidenceOfficialProcurementRequirement`；exact award/contract/amendment record最多形成`EvidenceReportedProcurementCommitment`；exact transaction/outlay/performance/completion/termination record最多形成`EvidenceReportedProcurementExecutionEvent`。三者都保留authority/record revision/amount role/status，不能互相升级。

## 3. 动态物化与知识数仓

- `open-requirements-by-buyer-lot-classification-and-deadline`：只接公开response窗口与exact requirements；
- `requirement-to-award-to-contract-lineage`：没有native relation只显示candidate gap；
- `original-current-potential-amendment-obligation-outlay-by-exact-role`：禁止跨role/currency/regime相加；
- `contract-change-option-and-deobligation-history`：correction/late report不覆盖旧snapshot；
- `reported-milestone-completion-performance-and-termination-by-authority`：source statement，不做vendor score/root cause；
- `prime-award-subaward-and-framework-call-up-relations`：分母与authority独立；
- `notice-api-feed-csv-ocds-manual-common-origin-conflicts`：防representation重复；
- `member-route-schema-terms-rights-threshold-and-privacy-drift`：成员局部失效。

Dolt保存Platform/Channel Pack、definition、procedure/amount/classification taxonomy、schema/terms/licence digest、identity/relation review、view、decision、lineage和tombstone。分析库只接用户批准的最小organization/process/contract metadata与兼容aggregate；不接natural person、contacts、bid/complaint narrative、confidential documents。materialization key固定`member × population/regime/threshold × process/procedure/lot/award/contract/transaction × record revision × amount role/status × representation × rights-purpose`；late/correction/history、schema/terms/licence、identity/relation或privacy变化触发partition invalidation/rebuild。

## 4. Skills、Connector与Probe边界

`public-procurement-source-contract-research/v0.3`只读official docs与固定source revision，输出member Pack/drift proposal；不得调用business API/feed、下载CSV、安装MCP或运行collector。

`public-procurement-channel-conformance/v0.3`只编排synthetic fixtures，验证mixed maturity、identity/relation、stage、amount role、coverage、representation、privacy、rights与zero effects。未来`approved-public-procurement-read/v0.3`必须逐member绑定exact supported route/query/window/fields/budget/purpose；当前返回`no-authorized-public-procurement-binding`。

本Channel没有Probe。虚假notice、bid、application、question、complaint、contract/change/performance publication、contact或subscription都会进入受监管采购流程。read-semantics POST必须作为network read审计，但不得因此取得任何mutation authority；bulk/download job另行effect gate。

## 5. Synthetic fixture matrix

| 场景 | 必须结果 |
| --- | --- |
| plan → tender → award → contract | distinct records + exact relations；不覆盖 |
| one procedure, multiple lots/contracts | values/organizations保持lot/contract scope |
| award without contract | commitment stage=award；不推断签约或执行 |
| original contract + amendment/current value | 三个amount roles；不重复求和 |
| obligation + deobligation + outlay | typed actions；outlay不证明supplier receipt |
| USAspending prime + transaction + subaward | 三个population；不把subaward当prime transaction |
| Canada >$10K row + <=$10K aggregate + nil | denominator分离；不生成小额contract rows |
| Canada late/corrected/combined amendments | append history；标double-count risk |
| Prozorro feed minimal row + detail | common-origin；opaque cursor/replay幂等 |
| FTS OCDS + native notice | provider projection保留mapping/loss |
| CCGP selected manual absent | automated subset可complete；whole channel mixed |
| completion/termination notice | source state；不生成success/fault/vendor rank |
| natural-person/contact/bid narrative | ordinary projection drop |
| route unavailable/version mismatch | only affected member degrade；no fallback |
| POST search/bulk/write payload | read POST需授权；bulk单独block；mutation恒拒绝 |

## 6. 可观测性与晋级

Telemetry按`Channel × member/population/regime/threshold × procedure/lot/award/contract/transaction × lifecycle/native status × amount role × representation × schema/terms/licence revision`记录requested/concept-fixture/route-fixture/manual/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、identity/common-origin conflicts、history/late/correction gaps、amount-role violations、coverage/nil/exclusion、privacy drop、rights block、rate/lag drift和zero writes。

至少一个成员经用户批准完成metadata-only canary才可声明`modeled-partial`；但Channel整体仍逐成员报告。USAspending bulk、Canada CSV corpus、Prozorro feed/detail、documents/content spans、durable history和任何natural-person exception分别审批。v0.3当前只发布设计，不授权Connector、network request、download或平台副作用。

