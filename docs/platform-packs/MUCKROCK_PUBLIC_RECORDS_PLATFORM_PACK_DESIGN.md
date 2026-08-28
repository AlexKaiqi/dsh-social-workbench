# MuckRock Public Records Platform Pack 设计

状态：`concept-fixture + fixed-source schema candidate + selected/manual / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`muckrock-public-records/v0-design`

## 1. 稳定概念与官方证据

MuckRock的[How it works](https://www.muckrock.com/about/how-we-work/)说明其帮助选择agency并以software + hands-on workflow提交、追踪和公开public-records requests；[request archive](https://www.muckrock.com/foi/)声明追踪通过系统提交的requests、correspondence与responsive records。它横跨US federal、state和local laws，所以jurisdiction/law/agency、deadline、fee、appeal与eligibility不能设全局常量。

[Terms](https://www.muckrock.com/tos/)明确公开服务不用于Privacy Act或personal/sensitive requests，并可embargo/withdraw/delete defamatory、harassing或privacy-risk内容；[FAQ](https://www.muckrock.com/faq/)提示requests是public acts；[Privacy Policy](https://www.muckrock.com/privacy-policy/)列出account、profile、request、agency、follow、subscription、address/phone等数据。所有identity/account/payment/contact字段都不进入普通projection，embargo/private request不读取。

官方[MuckRock source](https://github.com/MuckRock/muckrock/tree/b9d836ffbae6aefd9f146e6eec2223dec6f02edc)固定`b9d836f…`、AGPL-3.0；Request模型区分submitted/ack/processed/appealing/fix/payment/lawsuit/rejected/no_docs/done/partial/abandoned/consolidated及public/embargo/permanent embargo，Communication与agency/jurisdiction分离。source HEAD不是production deployment证明；官方API页面本轮也未能形成可核验exact contract，因此仅为schema candidate。

## 2. 概念映射

| Native | `PublicInformationAccess*` |
| --- | --- |
| request / agency / jurisdiction | request + exact body/law scope |
| communication / email-fax-postal-portal | message + channel/delivery/authentication |
| ack / processed / fix / payment | lifecycle，不是disposition |
| rejected / no_docs / done / partial | distinct terminal native status；done不自动等于full |
| appeal / lawsuit | review relation + separate authority/outcome |
| fee estimate/payment | fee role；不推断records released |
| embargo/permanent embargo | excluded visibility；不因source access而读取 |
| responsive document | release artifact；privacy/rights另审 |

## 3. 期望只读能力

`definition.read`、`agency.selected.read`、`request.selected.read`、`communication.selected.read`、`status.read`和`release.metadata.read`当前均不可调用。官方源码与API release notes只形成source-schema candidate；未来exact route须验证production API/version、public-vs-owned authorization、filters/pages/history、embargo exclusion、rate、terms、retention与deletion。

## 4. MCP、数据与Conformance

[morisy/muckrock-mcp](https://github.com/morisy/muckrock-mcp/tree/56e6b078c4ec19fc2c6f3ca67d77e3ad4bfea49b)明示experimental、直接处理username/password并含`file_foia_request_simple`。即使作者与MuckRock有关联，也没有运营方正式只读contract或安全审计证据；本Pack拒绝安装、执行和接入。

普通projection丢弃user/profile/account、organization、email/address/phone、payment identifiers、followers/collaborators、staff/requester identity、annotations与unreviewed documents。Synthetic覆盖done≠full、no_docs≠records globally nonexistent、payment≠release、appeal/lawsuit独立、email/fax/postal/portal coverage、embargo exclusion、consolidated relation及release privacy/rights block。file request、follow-up、appeal、fee payment、collaboration、status、embargo与全部write恒拒绝。
