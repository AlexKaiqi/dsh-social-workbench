# WhatDoTheyKnow Information Access Platform Pack 设计

状态：`concept-fixture + Alaveteli provider-schema candidate + selected/manual / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`whatdotheyknow-information-access/v0-design`

## 1. 稳定概念与官方证据

WhatDoTheyKnow的[官方About](https://www.whatdotheyknow.com/help/about)说明mySociety运营该站且自身不是public body；用户选择authority、描述所需信息，平台发送request并自动公开request与response。它覆盖UK FOI主体，也列入EIR、voluntary compliance及平台认为应受公开监督但未必受法约束的组织。因此`platform authority roster`不能自动成为`legally covered public bodies`。

[Making requests](https://www.whatdotheyknow.com/help/requesting)要求聚焦existing documents/data，不用于辩论或索取个人资料；clarification会影响clock，响应、internal review与appeal分层。它说明public request/response通常自动公开、Pro可延迟公开，站外request不能上传到archive，因为平台无法验证response来源。[Privacy](https://www.whatdotheyknow.com/help/privacy)和removal流程意味着公开archive仍可能redact/remove personal information；普通projection不保留requester或civil-servant identity。

平台明确[powered by Alaveteli](https://www.whatdotheyknow.com/help/alaveteli)。Alaveteli官方[API文档](https://alaveteli.org/docs/developers/api/)描述JSON/Atom read及experimental write API，[模型说明](https://alaveteli.org/docs/developers/overview/)区分InfoRequest、OutgoingMessage、IncomingMessage、RawEmail、Event与Comment。但WhatDoTheyKnow未在本轮证明production version/customization，因此这些只是provider-schema candidate。

## 2. 概念映射

| Native | `PublicInformationAccess*` |
| --- | --- |
| request / action text | records-sought exact span；背景claim分开 |
| public authority directory | platform roster + separate legal-regime coverage |
| outgoing/incoming/event/comment | typed message/platform-event/annotation records |
| successful/partial/refused/not held | disposition + exact classifier authority |
| waiting/clarification/internal review/overdue | lifecycle + deadline/review bindings |
| JSON/Atom/HTML | common-origin representations；不重复request/message |
| Pro embargo / hidden / removed | visibility/history；未公开内容不读取 |
| response attachment | quarantined release artifact；另审privacy/rights |

## 3. 期望只读能力

`definition.read`、`authority.selected.read`、`request.selected.read`、`thread.selected.read`、`status.read`与`release.metadata.read`当前均不可调用。HTML仅用于selected/manual research；Alaveteli JSON/Atom只是provider candidate。未来route必须验证production version、exact endpoint/schema、pagination/search/feed history、rate、visibility、deleted/hidden propagation、rights与purpose，且先做metadata-only canary。

## 4. 数据、安全与Conformance

普通projection只保留opaque jurisdiction/law/body/request/thread/message/status、approved records-sought span、deadline、disposition、withholding/review/release metadata与relations。姓名、账户、email、phone、address/postcode、signature、ID、IP、annotations、exact personal cases和未审查attachments/text全部drop或quarantine。

Synthetic覆盖authority未受FOI但在campaign roster、request含 allegation、clarification重置clock、user/platform classification冲突、successful无release、partial+exemption、not held只属authority assertion、postal/off-platform history unknown、JSON/Atom/HTML common origin、Pro embargo excluded及attachment rights block。create/send/follow-up/reminder/review/appeal/comment/follow/status mutation恒拒绝。

