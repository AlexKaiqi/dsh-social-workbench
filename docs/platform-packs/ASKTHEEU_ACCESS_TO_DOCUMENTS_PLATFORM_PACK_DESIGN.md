# AskTheEU Access to Documents Platform Pack 设计

状态：`concept-fixture + Alaveteli provider-schema candidate + selected/manual / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`asktheeu-access-to-documents/v0-design`

## 1. 稳定概念与官方证据

Access Info Europe运营的AskTheEU通过EU institutions/bodies的access-to-documents process发送并公开request/correspondence。运营方[平台说明](https://blog.asktheeu.org/2020/06/asktheeu-pro/)确认普通exchange公开，Pro可将request/response保持private 3、6或12个月并延长，embargo结束或用户选择后才公开；因此当前public visibility必须逐request确认，provider JSON能力不能读取private/embargo内容。

官方[access guide](https://blog.asktheeu.org/2013/05/access-to-eu-documents-guide/)将Regulation 1049/2001与confirmatory application连接；[operator survey](https://blog.asktheeu.org/2020/04/asktheeu-org-user-survey/)显示延迟、部分/不满意response、postal address/ID与appeal knowledge是实务问题，但survey本身不是平台request population、代表性意见或每项机关违规证明。requester的评价与EU institution reply、platform classification、confirmatory/ombudsman/court outcome必须分开。

运营方资料将AskTheEU列为Alaveteli deployment。Alaveteli官方[API](https://alaveteli.org/docs/developers/api/)与[model overview](https://alaveteli.org/docs/developers/overview/)只提供provider-level JSON/Atom/request/message/event概念；本轮未证明AskTheEU production version、custom states、exact route、privacy或rights，因此保持provider-schema candidate。

## 2. 概念映射

| Native | `PublicInformationAccess*` |
| --- | --- |
| access-to-documents request / EU body | request + exact body/regime |
| institution correspondence | attributed body message；非独立truth/admission |
| initial response / confirmatory application | response + review-of relation |
| no reply / extension / refusal / partial release | distinct lifecycle/disposition/withholding |
| Ombudsman/Court escalation | separate authority and review outcome |
| Pro privacy period | embargo visibility；未公开内容完全排除 |
| released EU document | attachment metadata/span另审rights/privacy |

## 3. 期望只读能力

`definition.read`、`institution.selected.read`、`request.selected.read`、`thread.selected.read`、`review.selected.read`与`release.metadata.read`当前不可调用。普通public page只允许selected/manual package；Alaveteli schema不升级为exact deployment route。未来必须验证exact version/routes/schema、language、public/private/embargo transition、search/history、rights与deletion。

## 4. 数据、安全与Conformance

普通projection删除requester/institution staff姓名、email、postal address、ID、signature、profile、annotations和attachment内third-party personal data；只保存opaque institution/request/message/review refs、approved exact span、status/deadline/withholding/release metadata。

Synthetic覆盖Pro embargo仍有效、embargo expiry后才可重新资格审查、institution reply不等于complete/accurate、requester dissatisfied不等于legal breach、confirmatory application pending/answered、Ombudsman/Court与platform status authority分层、multilingual rendition common origin及attachment rights block。request、support/widget action、follow-up、confirmatory application、complaint、comment/follow与全部write恒拒绝。

