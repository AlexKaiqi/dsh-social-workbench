# Eurostat Community Innovation Survey Platform Pack

## 1. 定位

Community Innovation Survey（CIS）是Eurostat与national statistical institutes共同实施的harmonised biennial enterprise innovation survey。CIS 2022基于Oslo Manual 2018和European Business Statistics法规，提供product/process、introduced/ongoing/abandoned activities、expenditure、turnover、cooperation、financing/support、information、barriers与optional topics。

Harmonised只说明共同HDC与method recommendations，不证明country sample、collection mode、optional sector/question、quality或microdata相同。

## 2. 官方知识与路由

- [CIS 2022 ESMS](https://ec.europa.eu/eurostat/cache/metadata/en/inn_cis13_esms.htm)：definition、population、unit、period、quality、dissemination与country metadata。
- [CIS microdata page](https://ec.europa.eu/eurostat/web/microdata/community-innovation-survey)：scope、variables、restricted research access与non-public microdata边界。
- [CIS key indicator source](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20241129-1)：official `inn_cis13_bas` dataset code fixture。
- [Statistics API guide](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api)：JSON-stat route；SDMX用于dataflow/DSD/codelist。
- [Eurostat reuse](https://ec.europa.eu/eurostat/help/copyright-notice)。

CIS 2022大多数indicator覆盖2020–2022；turnover、expenditure、employment等使用2022单年。自2004起even-year dissemination；无统一release calendar。Programme active，latest evidenced round/results为2022。

## 3. Population、definition与quality

core population为NACE B/C/D/E/H/J/K和46/71/72/73、10+ employed persons的enterprise；国家可增加sector或size。CIS 2022首次纳入EBS框架，country将legal unit映射为enterprise的方式可造成break。

`innovation-active`可能包括introduced product/process、completed-not-implemented、ongoing、abandoned、in-house/contracted R&D；因此不能解释为successful innovator。CIS不是panel，cross-round aggregate不能形成identified longitudinal company trajectory。

| CIS concept | Canonical binding | 拒绝推断 |
| --- | --- | --- |
| HDC mandatory/optional | question role | all-country completeness |
| innovation-active | source classification | introduced/successful/value |
| product/process | innovation kind | invention或R&D |
| ongoing/abandoned | activity status | future completion/failure cause |
| expenditure/turnover | money/turnover representation + single year | activity-window total/ROI |
| cooperation/partner | shared responsibility | contract/information source |
| barriers/reasons | exact population/denominator | cause/lead |
| country quality/deviation | comparability gate | automatic country ranking |

## 4. Connector、OSS与Skill

未来capability：HDC/ESMS/dataflow/dataset discovery、SDMX DSD/codelist fixture、approved Statistics API small-cell read、country-quality/release reconciliation和drift watch。restricted microdata application、SAFE Centre、survey submission、identity或Probe不在capability中。

[Eurostat restatapi](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0)固定于`a0bce063c60aef1033ea696d91d26e1158c2c4b0`，authority-org/EUPL，是R SDMX/TSV transport client，支持DSD/codelist/cache但不含CIS HDC、status、optional/country/period semantics。未install/download/execute。

未发现Eurostat维护的CIS domain Agent Skill。generic SDMX parser/API只证明transport候选。

## 5. Snapshot、观测与验证

Snapshot保存HDC/Oslo/legal basis、population/unit mapping、question/status/novelty、dataset/DSD/codelist、mandatory/optional、time/representation/weight、country quality、release/rights与OSS SHA；不保存microdata、cell/file、identity或credential。

监控`inn_cis13*` dataflow/DSD/key、HDC question/definition、core/optional scope、enterprise/legal-unit mapping、three-year/single-year roles、country completeness/suppression、release/revision/licence与zero effects。

Fixture证明innovation-active不当introduced/success、optional不补mandatory、country deviation不丢失、CIS非panel、enterprise/legal-unit break触发quarantine、API 200不提升domain readiness。

当前`selected-manual`，`callable=0 / durable=0`。
