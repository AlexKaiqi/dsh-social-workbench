# Scottish Parliament Petitions Platform Pack 设计

状态：`concept-fixture + selected-record/manual / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`scottish-parliament-petitions/v0-design`

## 1. 稳定概念与官方证据

官方[petitions help](https://petitions.parliament.scot/help)与[about petitions](https://www.parliament.scot/get-involved/petitions/about-petitions)说明：任何person或organization都可petition，无age/residency要求，但议题须为devolved且具有national dimension；发布后可持续收集signatures直到committee关闭。每人只能签一次，online signature需email verification。

Public Petitions Committee考虑每一份published petition，不以signature count作为是否审议的门槛。委员会可寻求政府/机构证据、要求petitioner补充、转交其他committee、建议政府行动、请求debate或close。官方规则会拒绝非devolved/national、重复/近期处理、同一petitioner活跃过多、缺少prior action、诽谤冒犯、点名可识别人、明显false、live court、个人或商业事项等申请。

官方[privacy notice](https://petitions.parliament.scot/privacy)说明creator姓名与petition文本进入长期公开记录和Official Report，signer个人信息不公开；系统收集name、email、postcode、country、IP，creator另有address、telephone与可能的special-category text。即便public archive长期保留，本系统普通projection也不复制creator/signer identity或contact。

## 2. 概念映射与成员差异

| Native | `PublicPetition*` |
| --- | --- |
| proposed/published petition | request + moderation/publication decision |
| supporter count | mutable platform-accepted aggregate；非审议门槛 |
| admissibility/rejection reason | process-revision moderation record |
| committee evidence/action | authority-attributed committee action |
| referral/request for debate/closure | distinct follow-up events |
| Official Report/archive | official record relation，不生成新petition |

Scotland的核心差异是“所有published petitions都由委员会考虑”。不得人为套入UK/Senedd数值threshold，也不得以低签名数降级为未获审议或低价值。

## 3. 期望能力与当前路由

`petition.definition.read/v1`、`petition.selected.read/v1`、`petition.support.snapshot.read/v1`和`petition.committee-action.read/v1`是期望只读词汇。当前只允许官方definition研究和人工选择的record package设计；未观察到固定、版本化且经批准的machine route，`/petitions.json`返回HTML也不构成API。

没有PortBinding；不得自动抓HTML、遍历archive、使用browser session或用UK source schema臆造Scottish deployment。未来manual package也必须固定petition ref、approved spans、committee documents、purpose、retention与deletion。

## 4. 数据、可观测性与副作用

- creator/signers的name、email、postcode、country、address、telephone、IP全部drop；文本含个人或special-category data时quarantine；
- support aggregate不解释为unique citizens/representative opinion；email verification只是member policy；
- committee consideration、evidence request、referral、debate request、debate与closure分别观测；
- 监测process/admissibility/privacy/archive drift、selected-package coverage、count revision、committee action gap、PII drop和zero writes；
- synthetic覆盖低count仍考虑、duplicate/out-of-scope rejection、evidence request、referral、debate request但未debated、closure、creator permanent public但local drop。

start、sign、verify、submit evidence、contact、feedback与subscription均为公共程序副作用，恒拒绝；本Pack没有Probe。
