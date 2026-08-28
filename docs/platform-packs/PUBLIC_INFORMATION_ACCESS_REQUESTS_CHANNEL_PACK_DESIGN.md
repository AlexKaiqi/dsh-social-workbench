# Public Information Access Requests, Body Responses & Releases Channel Pack 设计

状态：`researched`；4个concept-fixture成员，1个exact-member route-fixture成员，3个provider/source-schema candidate成员，4个selected/manual成员，0个callable成员，0个durable-approved成员
核验日期：2026-08-26
Channel Pack ref：`public-information-access-requests/v0-design`

## 1. 目标、成员与分母

本Channel发现尚未被现有公开信息满足的formal records/data need，以及平台记录的delivery、public-body correspondence、disposition、release与review过程。它统一`PublicInformationAccess*` projection，但不统一jurisdiction、legal regime、covered public-body roster、eligible requester、visibility/embargo、delivery/authentication、classification authority、deadline/calendar、extension、fee、exemption、transfer、review/appeal、attachment/redaction、moderation/deletion、search/history、privacy或rights。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| WhatDoTheyKnow | [Pack](WHATDOTHEYKNOW_INFORMATION_ACCESS_PLATFORM_PACK_DESIGN.md) | concept + Alaveteli provider-schema candidate + selected/manual |
| MuckRock | [Pack](MUCKROCK_PUBLIC_RECORDS_PLATFORM_PACK_DESIGN.md) | concept + fixed-source schema candidate + selected/manual |
| FragDenStaat | [Pack](FRAGDENSTAAT_INFORMATION_ACCESS_PLATFORM_PACK_DESIGN.md) | concept + exact-member official API/OpenAPI route fixture |
| AskTheEU | [Pack](ASKTHEEU_ACCESS_TO_DOCUMENTS_PLATFORM_PACK_DESIGN.md) | concept + Alaveteli provider-schema candidate + selected/manual |

request、message、status、disposition、fee、withholding、release、review和search分别报告coverage。FragDenStaat route成功不能让其他成员变绿；Alaveteli/Froide/MuckRock source不能补成production deployment；selected public thread不能补成全平台或全jurisdiction population。

## 2. 共同证据与关系

- `EvidencePublishedInformationAccessRequest`只来自approved exact records/documents/data-sought span；背景claim、allegation、campaign text和requester motive分开；
- `EvidenceAttributedPublicBodyCorrespondence`绑定message、sender/recipient authority、delivery proof与authentication definition；off-platform upload/转录的authority降级；
- `EvidenceReportedInformationAccessDisposition`绑定classifier authority和revision；requester/platform/public-body/review/ombudsman/court分类不互相覆盖；
- `EvidencePublishedInformationAccessRelease`只证明rights/privacy reviewed artifact被公开；不证明full response、authenticity超出delivery path、无redaction/withholding、current validity或content reuse；
- request→message→response→release→review用exact relation连接；相同title/body/topic不能模糊duplicate/consolidate；
- prewritten/bulk/campaign request可共享common-origin，但不因此删除各自formal act；也不能把action count当独立people/needs；
- HTML/JSON/Atom/OpenAPI/email/attachment/language/list placement都是representation，必须建立common origin；
- public body directory、platform status、deadline badge和search placement都是平台事实，不自动成为法律coverage、compliance、truth或popularity。

## 3. 动态物化与知识数仓

- `records-sought-by-exact-jurisdiction-law-body-and-lifecycle`：信息缺口检索，不做requester/body排名；
- `request-message-disposition-release-review-lineage`：展示完整程序与coverage gap；
- `target-body-transfer-consolidation-and-duplicate-history`：只接source-declared relations；
- `classification-authority-and-native-status-conflicts`：保留requester/platform/body/review分歧；
- `full-partial-refused-not-held-no-response-fee-by-fixed-published-population`：只描述选择后的published population，不做compliance score；
- `deadline-extension-clarification-and-overdue-by-exact-calendar`：禁止跨法律直接比较；
- `withholding-basis-to-review-outcome`：拒绝/豁免与复审结果分开；
- `release-metadata-redaction-privacy-and-rights-coverage`：默认不索引附件全文；
- `public-embargo-hidden-deleted-history`：visibility change触发局部失效；
- `member-provider-deployment-schema-law-privacy-rights-drift`：逐member失效，不跨部署升级。

Dolt只保存Pack、definition、member/deployment/jurisdiction/law、authority roster、visibility/delivery/classification/deadline/fee/exemption/review/redaction/privacy/rights/schema digest、opaque identity/relation/revision、view、decision、lineage与tombstone。分析库只接获准的opaque public-body/topic/lifecycle/disposition/withholding/review/release-metadata与timing；不接requester/respondent natural-person identity、account/contact/address/signature/ID/IP、annotation、embargo/private record、unreviewed全文或附件，也不物化机关合规、公开度、政治倾向或requester画像排名。

materialization key固定`member × deployment/jurisdiction/law revision × public-body roster × request/thread/message/revision × record kind/message role/authority × lifecycle/disposition/classifier × deadline/calendar/fee/withholding × visibility/representation/language × history/privacy/rights/purpose`。deployment/schema、law/roster、visibility/embargo、status authority、deadline、redaction、privacy/rights/history变化触发partition invalidation/rebuild。

## 4. Capability、Skill与副作用边界

共同read vocabulary包括definition、public-body directory、selected public request/thread/message、status/disposition、deadline/fee/withholding、release metadata与review。它们只是knowledge/fixture capability，不是当前Connector。

`public-information-access-source-contract-research/v1`只产生versioned knowledge proposal；`public-information-access-conformance/v1`只消费synthetic fixtures。未来read binding逐member固定exact deployment/jurisdiction/law/public-only visibility/routes/fields/window/purpose/retention/deletion；没有route的成员保持selected/manual，禁止HTML/browser、community MCP/Skill、provider sibling或另一个成员fallback。

本Channel没有Probe。draft/send/bulk request、follow-up/reminder/clarification、fee payment、review/appeal/complaint/litigation、annotation、status classification、follow/subscribe、upload/redact/embargo/admin mutations全部拒绝，法律、行政、财务、通知和公开记录effects恒为零。

## 5. Synthetic fixtures、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| request含未证实allegation | records-sought span + requester context claim；不生成verified fact |
| directory包含非法律覆盖organisation | platform roster；legal coverage unknown/false按definition |
| 相同prewritten request发给多个body | common-origin；不是一个request也不是独立people count |
| platform/user标successful，未见release | attributed disposition；不生成full disclosure/compliance |
| body说not held/no docs | body assertion；不证明records全球不存在 |
| partial response + exemption + attachment | partial、withholding与release分别保存 |
| MuckRock done | native terminal state；不得自动映射full |
| clarification/extension | exact clock reset/extension；不套统一deadline |
| transfer/consolidation | exact relation与authority change；不模糊dedupe |
| postal/off-platform response | history/attribution degraded；不得补全thread |
| requester/platform/body/review status冲突 | 多个attributed records；不last-write-wins |
| review overturns refusal | review outcome；不改写原refusal snapshot |
| embargo/private/requester-only | public read blocked；普通projection为零 |
| public attachment含name/address/signature/ID | quarantine/drop；不得先持久化再清理 |
| public attachment无明确reuse right | metadata only；content index blocked |
| HTML/JSON/Atom/email同一message | common-origin；只计一次formal act |
| fyi-cli把FragDenStaat当Alaveteli | provider mismatch rejection；不得生成route |
| 任何request/follow-up/appeal/payment/comment/status/admin mutation | policy拒绝；zero external effects |

Telemetry按`Channel × member/deployment/jurisdiction/law × public-body roster × request/thread/message revision × record/message role/authority × lifecycle/disposition/classifier × deadline/calendar/fee/withholding × visibility/representation/language × schema/privacy/rights/history revision`记录requested/concept-fixture/provider-source-candidate/route-fixture/selected-manual/callable/succeeded/blocked/degraded/quarantined、returned/retained/dropped、common-origin/identity/relation/classifier conflict、各stage coverage、deadline/extension drift、release-rights/privacy quarantine、embargo/delete propagation、provider mismatch、fallback rejection与zero writes。

至少一个exact member/public metadata capability经用户批准完成canary后才可`modeled-partial`。authority、request、thread、status、release metadata、attachment content、review history与durable materialization分别另审；一个member/provider/representation成功不提升其他成员。
