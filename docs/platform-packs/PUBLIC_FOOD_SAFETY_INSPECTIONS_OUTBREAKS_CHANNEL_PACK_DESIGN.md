# Public Food Establishment Inspections, Foodborne Outbreaks, Closures & Recovery Channel Pack 设计

## 1. 目标与成员边界

成员固定为：

- `nyc-dohmh-restaurant-inspections`
- `uk-fsa-fhrs-fhis`
- `toronto-dinesafe-food-premises`
- `cdc-nors-outbreaks`

本Channel用于发现inspection workflow、rating解释、数据更新、纠正闭环、closure/reopening、监管沟通与outbreak surveillance中的需求和痛点。它统一`PublicFoodSafety*` projection，但不统一jurisdiction、establishment population、inspection scope、violation severity、rating scheme、enforcement authority、closure process、outbreak definition、reporting completeness、denominator、privacy或rights。

核心事实图：

```text
program/authority -> establishment/premises/permit -> inspection cycle
inspection -> zero-or-many violations -> native score/rating/notice
violation -> warning/ticket/summons/order/referral -> adjudication
violation -> correction claim -> reinspection verification
inspection -> closure order -> active closure -> reopening inspection -> authority reopening

reporting jurisdiction -> outbreak report -> mode/setting
outbreak -> etiology posture
outbreak -> implicated food/ingredient posture
outbreak -> illnesses + separately-known outcome denominators

inspection establishment - - candidate only, never fuzzy/exact - - outbreak setting
```

## 2. Capability与成熟度

| capability | 当前状态 | 契约 |
| --- | --- | --- |
| `public-food-safety.definition.read` | knowledge | exact member/process/scheme/outbreak definition revision |
| `public-food-safety.resource-schema.read` | fixture | exact dataset/API/package/resource/schema only |
| `public-food-safety.selected-establishment-inspection.metadata.read` | manual/fixture | approved selected reference、field allowlist、no narrative/location profiling |
| `public-food-safety.selected-rating.metadata.read` | manual/fixture | native scheme、standing、rating date、update date |
| `public-food-safety.selected-closure-lineage.metadata.read` | manual/fixture | exact closure/reclose/reopen actions only |
| `public-food-safety.selected-outbreak.metadata.read` | manual/fixture | exact NORS outbreak/mode/etiology/vehicle/count definitions |
| `public-food-safety.federated-read` | future restricted | exact local-authority/reporting-site roster、purpose、coverage、rights、field allowlist |
| `public-food-safety.probe-or-write` | rejected | inspection request、complaint、rerating、appeal、correction、closure/reopen、outbreak reporting均非需求Probe |

成熟度：`requested=4 / concept=4 / machine-or-bulk route fixture=4 / process-methodology fixture=4 / closure-reopening route fixture=2 / outbreak route fixture=1 / manual=4 / callable=0 / durable=0`。OSS、MCP或Skill不提高member成熟度。

## 3. Snapshot、分析库与动态物化

Dolt/Git类Snapshot只保存Platform/Channel Pack、process/rating/outbreak definition、authority/roster、dataset/resource/schema/code digest、rights/privacy/message-integrity、known-data alerts、view definition、verification decision、lineage和tombstone；不保存真实商户、inspection、citation、address、patient或outbreak row。

未来获得durable授权后，分析数据库只接field-approved opaque identity、coarse jurisdiction/business type、typed lifecycle/posture、exact relation和approved aggregate。动态物化视图至少包括：

- `member-program-authority-population-and-history-coverage`；
- `establishment-premises-permit-identity-and-reuse-lineage`；
- `inspection-cycle-to-citation-one-to-many-dedupe`；
- `inspection-kind-scope-result-and-partiality`；
- `violation-code-severity-citation-adjudication-correction-history`；
- `native-rating-definition-score-grade-standing-and-revision`；
- `fhrs-vs-fhis-vs-nyc-vs-dinesafe-non-comparability-audit`；
- `closure-order-active-reclose-reopening-verification-lineage`；
- `complaint-origin-vs-published-complaint-gap`；
- `outbreak-mode-setting-etiology-and-vehicle-attribution-posture`；
- `outbreak-illness-hospitalization-known-outcome-death-denominator-separation`；
- `inspection-establishment-to-outbreak-no-exact-relation-audit`；
- `active-latest-current-vs-historical-population-gap`；
- `address-phone-owner-permit-complaint-inspector-patient-free-text-drop-audit`；
- `member-resource-schema-code-process-rights-lag-and-correction-drift`。

不得物化跨scheme safety score、restaurant rank、blacklist、predicted illness、individual health risk、unreported outbreak estimate、fuzzy establishment-outbreak attribution、permanent closure、current safety或endorsement。

## 4. 可观测性

每次fixture/conformance按：

`member × exact product/resource × process/rating/outbreak definition revision × authority/local-authority/reporting-site × establishment population/business type × inspection kind/scope/result × violation code/severity/posture × rating scheme/standing × enforcement/closure/correction posture × outbreak mode/posture × etiology/vehicle attribution × count/denominator × history/lag × privacy/rights/message integrity`

记录：

- requested/returned/retained/dropped/quarantined；
- row→inspection dedupe ratio、missing inspection identity、ID reuse/collision candidate；
- latest/history truncation、resource/schema/code drift、publication lag、stale watermark；
- pending/appealed/adjudicated/superseded/corrected deltas；
- closure without reopen、reopen without exact closure、correction without verification；
- outbreak revision/delete、unknown/suspected etiology、multi-value vehicle parse、denominator missingness；
- cross-scheme comparison attempt、fuzzy outbreak linkage attempt、privacy field leak；
- route retirement、unexpected first-resource fallback、community MCP/Skill fallback；
- rights/attribution/non-endorsement/message-integrity expiry；
- network calls、rows read、bytes retained、durable writes和platform effects，当前均必须为0。

## 5. Synthetic conformance

至少覆盖：

1. NYC one inspection→three citation rows只计一次inspection；
2. NYC `1/1/1900`为not-yet-inspected，不生成Pass；
3. NYC score因adjudication变化且old grade保留supersession；
4. NYC closed→reopened→reclosed是三事件，reopened不删closure；
5. FSA FHRS=2不能与FHIS Improvement Required排序；
6. FSA Awaiting Publication、NewRatingPending、appeal和current rating并存；
7. local authority business ID重用只形成identity review candidate；
8. private-address establishment无地址不触发geocoding fallback；
9. Toronto Pass可含minor，不能映射“zero violations”；
10. Conditional Pass→first reinspection→second reinspection→summons保持exact lineage；
11. Closed只有exact authority reopening后结束，latest Pass不反向抹除；
12. CKAN duplicate-named/current/historical resources必须按固定resource ID选择；
13. NORS foodborne和person-to-person mode不混入同一population；
14. confirmed/suspected/multiple/unknown etiology保持独立；
15. `hospitalizations / info_on_hospitalizations`与`deaths / info_on_deaths`分别计算，不用illnesses替代denominator；
16. outbreak被多年后修订或删除时传播revision/tombstone；
17. same city/date/food/business name不建立outbreak↔establishment exact relation；
18. exact address、phone、owner/operator、permit、complaint narrative、inspector/patient/free text全部drop。

必须拒绝：Pass→continuing safety、citation/critical flag→illness、score/grade/rating→cross-scheme rank、closed→permanent failure/outbreak、reopened→history erased/future safety、complaint-origin inspection→complaint verified、active/current dataset→complete history、outbreak→sporadic illness population、setting/food vehicle→exact premises、confirmed etiology→exact business cause、missing row→no problem，以及provider/MCP/Skill→official member route或跨成员fallback。

## 6. 权利、安全与Probe边界

- 默认drop exact address/coordinate、phone、owner/operator、permit/license number、complainant/inspector/patient identity、narrative/comments/free text；
- 商户公共记录不是自然人profiling授权；business name也只在明确purpose/rights/retention下进入受限projection；
- FSA rating imagery、Toronto/CDC/NYC marks不复制；attribution与non-endorsement绑定每个materialized result；
- correction、supersession、withdrawal/deletion和rights变化必须传播canonical、evidence、index与cache；
- no HTML robot、browser login、community mirror、generic SODA/CKAN MCP、commercial restaurant-risk provider或cross-member fallback。

本Channel没有平台Probe。inspection request/schedule/result、complaint、rating appeal/right-to-reply/rerating、correction submission、ticket/summons/payment、closure/reopening、outbreak report、contact/subscribe和admin write可能产生监管、法律、公共卫生、通知或声誉副作用，全部保持zero effect。主动需求测试只能走系统自有landing page、问卷或产品实验Channel。

## 7. 验证阶梯

1. 当前：official evidence + static contracts + hand-written synthetic fixtures；
2. 用户批准后：逐成员sandbox live metadata/schema canary，仍不读row；
3. 再批准：单成员、单resource、极小row、field allowlist、ephemeral read；
4. rights/retention/correction/deletion/observability通过后才讨论durable materialization；
5. operational canary必须能够因schema、population、rating rule、resource、rights或message drift自动fail closed。
