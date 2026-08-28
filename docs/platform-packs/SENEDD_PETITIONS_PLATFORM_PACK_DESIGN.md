# Senedd Petitions Platform Pack 设计

状态：`concept-fixture + route-fixture / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`senedd-petitions/v0-design`

## 1. 稳定概念与官方证据

官方[petitions help](https://petitions.senedd.wales/help)与[Senedd petitions介绍](https://senedd.wales/senedd-business/petitions/)说明：具有Wales address的人或organization可创建；先取得2名supporters进入moderation；通过后以Welsh/English发布。每人只能签一次，online签名需email verification，不能同时online与paper重复签。

超过250 signatures由Petitions Committee review；超过10,000时committee考虑是否请求Senedd debate，并结合议题、紧迫性和来自Wales的比例，不保证debate。委员会可请求information/evidence、敦促Welsh Government、转交其他committee、组织debate或inquiry/report。duplicate/open-or-recent、unclear/out-of-competence、offensive/defamatory、live court/confidential/commercially sensitive、点名个人/指控犯罪、广告spam或不合适渠道等可被拒绝。

官方[privacy notice](https://petitions.senedd.wales/privacy)（2026-06更新）说明处理signer name、email、postcode、country、IP，creator另含address、telephone与文本中的个人信息；signer身份不公开，postcode用于Wales与Senedd constituency aggregate，普通personal data保留至committee不再考虑后12个月。普通projection不保存这些身份与位置字段。

## 2. 概念映射

| Native | `PublicPetition*` |
| --- | --- |
| Welsh/English petition pages | language renditions + common-origin relation |
| 2 initial supporters | initial-support threshold；不是public support总量 |
| 250 signatures | committee-review threshold |
| 10,000 signatures | debate-consideration threshold，不是debate guarantee |
| Wales/constituency count | geographic aggregate projection，受privacy/min-cell约束 |
| committee/Welsh Government action | separate authority-attributed events |

## 3. 期望只读能力

`petition.definition.read/v1`、`petition.list.public/v1`、`petition.read.public/v1`、`petition.support.snapshot.read/v1`和`petition.response.read/v1`是期望词汇。一次公开open-list JSON仅用于确认representation envelope，未保留或使用rows。相同GDS code family只能提供schema候选，不能证明Senedd production revision、configuration、threshold或privacy与UK相同。

当前route fixture只支持synthetic conformance；没有PortBinding、未验证history/pagination/rate/rights/deletion，也不得从English route推定Welsh rendition完整。任何真实read仍返回`no-authorized-public-petition-binding`。

## 4. 数据、验证与副作用

- creator/signer name、email、postcode、country、address、telephone、IP和political/special-category profile全部drop；
- Wales/constituency aggregate需purpose和minimum-cell policy，不用于政治倾向排名；
- paper/online按official reconciliation policy，不能直接相加；
- synthetic覆盖2/250/10,000三个不同threshold、250 review pending、10k considered但not debated、Welsh/English duplicate、paper-online duplicate、count下降与privacy deletion；
- telemetry观测language coverage、threshold/process drift、count regression、committee response gap、privacy/min-cell drop、route/schema drift和zero writes。

start、support、sign、verify、paper submission、subscribe、contact与committee evidence submission恒拒绝；本Pack没有Probe。
