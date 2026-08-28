# Statistics Canada SIBS Platform Pack

## 1. 定位

Survey of Innovation and Business Strategy（SIBS，record 5171）是Statistics Canada的active biennial cross-economy enterprise survey，覆盖innovation、business strategy、advanced technology、global value chain、sales、expenditure与personnel。current cycle reference period为2023–2025，2026-01至03采集；current questionnaire存在不等于结果已发布。

最新已证实published innovation results来自2020–2022 cycle，包含innovation types、cooperation/critical partner、obstacles/measures、public programmes、developer source、environmental benefits和IP protection等official tables。

## 2. 官方证据与路由

- [Current SIBS programme](https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvey&Id=1581074&wbdisable=true)：active、biennial、record 5171、2023–2025 period、population/sample/method。
- [Current variable list](https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvVariableList&Id=1581074)：innovation、technology、benefit、sales、personnel与strategy variables。
- [Cycle changes](https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getMainChange&Id=1499788)：2023–2025增加AI questions；definition/question drift必须版本化。
- [2020–2022 result tables](https://www150.statcan.gc.ca/n1/daily-quotidien/240220/dq240220b-cansim-eng.htm)：PIDs包括`27-10-0178-01` cooperation、`0193` critical partner、`0238` programmes、`0361` innovation types、`0364` obstacles、`0402/0403` environmental benefit、`33-10-0721-01` IP filing。
- [WDS guide](https://www.statcan.gc.ca/en/developers/wds/user-guide)：PID/product/cube metadata/data route；本轮未调用observation。
- [Open Licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence)。

## 3. Population与语义

current target包含14个NAICS sector、enterprise unit、至少CAD 250,000 revenue，并以20–99/100–249/250+ size stratification；sample 12,988、population 76,150、expected response 50%。不能外推到所有Canadian business、microbusiness或excluded sector。

| SIBS concept | Canonical binding | 拒绝推断 |
| --- | --- | --- |
| innovation introduced/type | innovation kind/incidence | success/growth/value |
| obstacle and measure taken | barrier + response category | cause/remediation effectiveness |
| cooperation/critical partner | partner type/location | named contract/procurement |
| programme used/critical | public support | eligibility/award/payment |
| innovation developer | developer source | IP owner/vendor lead |
| environmental benefit | reported benefit | verified impact/compliance |
| IP application filed | protection/filing | grant/valid right/FTO |
| business strategy/benefit/cost saving | source-defined measure | causal outcome/ROI |

Current cycle mandatory question list不代表其他questions optional in statistical meaning；instrument routing、question requirement和published-variable availability分别保存。

## 4. Connector、OSS与Skill

未来capability：programme/questionnaire/variable/release discovery、PID/cube metadata fixture、approved WDS small-cell read、quality/revision reconciliation。无survey submission、respondent contact、microdata、identity、download-all或Probe。

[statistics-canada](https://github.com/pbouill/statistics-canada/tree/bbfb5946ec07f5ebf61ea5e4327a8efdee6e7423)固定于`bbfb5946ec07f5ebf61ea5e4327a8efdee6e7423`，community/GPL-3.0，是generic WDS async client；不含SIBS population/question/status/PID-release semantics。未install/execute。

未发现Statistics Canada维护的SIBS Agent Skill；WDS connected不等于domain-ready。

## 5. Snapshot、观测与验证

Snapshot保存record/cycle、population/sector/threshold/unit、question/status/novelty/measure、PID/cube/variable、estimator/quality/release/rights与fixed OSS；不保存respondent、microdata、file/cell或credential。

监控cycle/result standing、question/AI revision、population/NAICS/size/revenue threshold、PID/product/cube/schema、unit/denominator/quality/suppression、licence/no-endorsement/anti-identification与zero effects。

Fixture证明current questionnaire不生成result、20+/$250k不外推全体、critical partner不生成named lead、measure taken不生成effective remediation、filing不生成grant、WDS client success不提升domain maturity。

当前`selected-manual`，`callable=0 / durable=0`。
