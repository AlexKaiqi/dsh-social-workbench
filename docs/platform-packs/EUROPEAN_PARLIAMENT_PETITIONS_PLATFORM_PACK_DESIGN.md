# European Parliament Petitions Platform Pack 设计

状态：`concept-fixture + selected-record/manual / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`european-parliament-petitions/v0-design`

## 1. 稳定概念与官方证据

欧洲议会[Rules of Procedure Rule 232](https://www.europarl.europa.eu/doceo/document/lastrules/RULE-232_EN.html)规定：EU citizen，以及resident或registered office位于Member State的natural/legal person，可单独或共同petition；事项须属于EU fields of activity并directly affect petitioner。petition需name/permanent address并使用EU official language或附translation；可post或portal提交。PETI committee先判断admissibility；inadmissible会告知理由，similar petitions可joint handling，所有签署者撤签则petition失效。

官方[The right to petition fact sheet](https://www.europarl.europa.eu/factsheets/en/sheet/148/the-right-of-)说明：admissible petition的summary以所有EU official languages发布；委员会可请Commission初步调查、转交其他committee、联系机构、安排meeting、hearing/workshop、fact-finding visit、mission/full report、motion for resolution或plenary debate，也可在不同阶段close。每一项都是可能的程序动作，不是固定支持数触发的保证。

Rule 232同时说明registered petition是public document，petitioner/co-petitioner/supporter姓名和内容可能公开，但相关人可请求withhold name，Parliament也可为third-party rights anonymise。普通projection一律排除person identity/address与敏感原文。

## 2. 概念映射与特殊边界

| Native | `PublicPetition*` |
| --- | --- |
| registered petition / public summary | petition + approved action/background rendition |
| admissible/inadmissible | moderation/admissibility decision |
| supporters / joint petitioners | platform support or petitioner relation；不推断民意 |
| similar petitions dealt jointly | exact source-declared relation，不自动merge identity |
| Commission information / authority contact | official response/action event |
| committee meeting/hearing/visit/referral | distinct committee action |
| report/resolution/plenary debate | distinct report/debate events |
| withdrawal/no response/no further action | closure cause，不等于issue resolved |

欧洲议会petition不是European Citizens' Initiative，也没有本Pack可跨平台复用的UK/Senedd数值threshold。EU多语言summaries全部是common-origin renditions。

## 3. 期望能力与当前路由

期望词汇为`petition.definition.read/v1`、`petition.selected.read/v1`、`petition.admissibility.read/v1`、`petition.support.snapshot.read/v1`与`petition.committee-action.read/v1`。当前官方portal未给本研究一个固定、版本化且经批准的machine contract，因此只允许official rules/fact-sheet research和selected-record/manual package设计。

没有PortBinding；不得自动绕过portal交互、抓HTML、枚举petition、使用登录session或community scraper。未来selected package必须固定petition/public-summary/ref、language、admissibility、approved documents、purpose、retention与deletion。

## 4. 数据、验证与副作用

- petitioner/co-petitioner/supporter name、nationality、address、contact与任何political/special-category profile全部drop；
- exact approved public summary比整份submission优先；third-party anonymisation/withheld-name变化触发correction/tombstone；
- multilingual summary、committee document和report建立exact relation，不重复计petition/support；
- synthetic覆盖inadmissible、joint handling、all signatories withdraw、withheld name、Commission response、referral、hearing、visit、report/resolution、plenary debate与closure；
- telemetry观测rules/admissibility/language/privacy drift、selected coverage、relation conflict、PII/sensitive span drop、portal route absent和zero writes。

submit、support、withdraw、contact、meeting/evidence request、subscribe或任何portal authenticated action恒拒绝；本Pack没有Probe。
