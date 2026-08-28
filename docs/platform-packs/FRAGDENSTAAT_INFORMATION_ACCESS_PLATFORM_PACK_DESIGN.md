# FragDenStaat Information Access Platform Pack 设计

状态：`concept-fixture + exact-member route-fixture / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`fragdenstaat-information-access/v0-design`

## 1. 稳定概念与官方证据

FragDenStaat的[Help](https://fragdenstaat.de/hilfe/)覆盖IFG、UIG、VIG及其他information-access regimes，并按account、first request、process、platform、authority与privacy组织知识。[官方API页](https://fragdenstaat.de/api/)给出exact root `https://fragdenstaat.de/api/v1/`、OpenAPI schema、request与publicbody endpoints，也列出`read:user/profile/email/request/document`和`make/write/follow`等OAuth scopes。公开read合同与账号/非公开read、make/write必须拆成不同capability；本轮没有调用这些routes。

[Privacy](https://fragdenstaat.de/datenschutzerklaerung/)说明request、authority response与attachments会为透明/监督目的处理并可能公开，postal address不会作为public request显示且会尽力自动redact。[authority help](https://fragdenstaat.de/hilfe/fuer-behoerden/sind-die-anfragesteller-real-existierende-personen/)说明注册email verification与可用pseudonym，但这不能被本系统升级成独立身份验证或unique-person denominator。

官方[okfde/froide](https://github.com/okfde/froide/tree/ddcee29d47571e65ab9b24b3ad17d03df556d4d3)固定`ddcee29…`、MIT。模型区分request、message、law、public body、status、resolution、visibility、cost与deadline；successful/partial/not-held/refused/withdrawn及waiting/overdue分层。Froide provider source不能替代FragDenStaat exact deployment schema，但官方API页足以形成一份静态exact-member route fixture。

## 2. 概念映射

| Native | `PublicInformationAccess*` |
| --- | --- |
| request / publicbody / law | request + exact body/regime |
| request/message | typed thread records + direction/authority |
| status / resolution | lifecycle + disposition + classifier authority |
| successful/partial/refused/not held | distinct disposition；非法律合规结论 |
| costs / overdue | fee + deadline bindings |
| public/requester-only/invisible | visibility gate；public-only ingestion |
| API/OpenAPI | exact-member route fixture；schema revision固定 |
| OAuth read/make/write/follow scopes | independent capability/effect classes |

## 3. 期望只读能力

`definition.read`、`publicbody.list/read`、`public-request.list/read`、`public-message.read`、`status.read`与`release.metadata.read`为route fixture only，当前没有PortBinding。未来metadata-only canary必须固定schema revision、public filters、pagination/order、history、message/attachment coverage、visibility、rate、rights、purpose、retention与deletion；任何OAuth account/non-public scope另行审批。

## 4. 数据、安全与Conformance

普通projection保留opaque body/law/request/message、approved records-sought span、status/resolution/cost/deadline/release metadata；name/pseudonym、email、postal address、signature、ID/IP、profile、annotations、third-party personal data与unreviewed attachment/text均drop/quarantine。

Synthetic覆盖email verified≠unique verified person、pseudonym≠invalid、awaiting classification与resolved分层、status/resolution authority conflict、overdue按law/calendar计算、withdrawn due costs、partial+withholding、requester-only/invisible exclusion、public API read与OAuth write scope隔离。make/write/follow、message/status/document upload与全部platform effects恒拒绝。

