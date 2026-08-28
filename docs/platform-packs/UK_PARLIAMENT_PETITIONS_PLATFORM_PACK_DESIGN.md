# UK Government and Parliament Petitions Platform Pack 设计

状态：`concept-fixture + route-fixture / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`uk-parliament-petitions/v0-design`

## 1. 稳定概念与官方证据

官方[帮助页](https://petition.parliament.uk/help)说明：petition要求UK Government或Parliament采取行动；公开6个月；10,000 signatures触发government response，100,000 signatures由Petitions Committee考虑辩论，通常会辩论但可因议题已安排等原因不安排。创建者必须是British citizen或UK resident，先取得5名supporters进入moderation，发布前最多21名；rejected petition仍可公开查看但不可签名。只有此官方平台上的petition承担这些回应/考虑义务。

官方[privacy notice](https://petition.parliament.uk/privacy)（2025-11更新）说明平台处理姓名、邮箱、邮编、country、citizenship、IP等；普通signer身份不公开，postcode用于constituency aggregate，请愿可能包含political/special-category data。creator name仅在open期间由当前service JSON公开；本Pack普通projection仍一律drop creator/signer identity。

[官方源码](https://github.com/alphagov/e-petitions/tree/5db95bc747c2f7216c5316d1ee65c0cae05568bc)固定`5db95bc…`、MIT。它显示HTML/JSON/CSV reads与create/signature/sponsor writes是不同routes；petition包含pending/validated/sponsored/flagged/dormant/open/closed/rejected/hidden/stopped/removed等native states，debate也有awaiting/scheduled/debated/not-debated等独立状态。signature可被invalidated/deleted并改变count，因此`signature_count`不是append-only事实。源码中的可选vector search默认关闭，也不授予embedding/content reuse权利。

## 2. 概念映射

| Native | `PublicPetition*` |
| --- | --- |
| petition ID/action/background/additional details | petition + petitioner-authored request/background spans |
| state/moderation/rejection | lifecycle + moderation posture；reason独立 |
| signature_count / country/constituency/region totals | mutable support aggregate；地域projection同源 |
| response threshold reached / government response | threshold event + separate official response |
| debate threshold reached / committee note / debate | consideration threshold + committee action + debate event |
| department/topic | opaque governed refs，不作为endorsement |
| closing/opened/closed/responded/debated timestamps | schedule events，非完整event history保证 |

10,000只说明response threshold reached；必须看到actual response record才是responded。100,000只说明committee consideration condition；scheduled、debated和not-debated分别保留。政府回应不表示同意，辩论不表示投票、政策采纳或实施。

## 3. 期望只读能力

| Capability ref | 输入 → 输出 | 当前状态 |
| --- | --- | --- |
| `petition.definition.read/v1` | official process/privacy/source revision → definition proposal | concept-fixture |
| `petition.list.public/v1` | exact state/filter/page → petition refs + coverage | route-fixture only |
| `petition.read.public/v1` | exact petition ref → approved metadata/revision | route-fixture only |
| `petition.support.snapshot.read/v1` | petition ref → total support snapshot | route-fixture only |
| `petition.response.read/v1` | petition ref → response/committee/debate refs | route-fixture only |

route fixture来自官方页面、固定官方source及一次公开list JSON envelope观察；未保留row内容，也未验证production deployment revision、长期pagination、history、rate、rights或删除传播。当前没有PortBinding，所有调用返回`no-authorized-public-petition-binding`。

## 4. 数据与安全边界

- 普通projection仅保留opaque petition/topic/department/process、approved action span、lifecycle、aggregate count、threshold与official follow-up；
- creator/signer name、email、postcode、address、country/citizenship、IP和constituency-level political profile均drop；
- exact geographic aggregates默认不入分析库；若未来获准也需minimum-cell与purpose review；
- action/background可能涉及第三方、健康、政治或其他敏感信息，必须exact-span approval，禁止整页embedding；
- list/show/count与HTML/JSON/CSV建立common-origin，不能重复计数；
- rejected/removed/hidden内容仍需publication与privacy判断，不能因URL公开自动索引。

## 5. Conformance与副作用

Synthetic必须覆盖5 supporters、21上限、moderation reject、open 6 months、10k response pending/responded、100k considered/scheduled/not-debated/debated、count下降、dissolution closure和creator name drop。source/schema/process/privacy任一漂移使route fixture失效。

create、sponsor、sign、email verify、withdraw/delete signature、share campaign、contact、feedback和subscription routes恒拒绝；本Pack不提供Probe。
