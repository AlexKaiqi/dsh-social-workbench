# Eurostat Household Budget Survey Platform Pack

## 1. 稳定概念与官方事实

[Eurostat HBS overview](https://ec.europa.eu/eurostat/web/household-budget-surveys)定义national household surveys，重点是goods/services expenditure，并用于CPI weights和national accounts。[HBS microdata description](https://ec.europa.eu/eurostat/web/microdata/household-budget-survey)说明Eurostat约每五年收集，最近完成waves为2015和2020；2020前后各国frequency、timing、content和structure仍有差异。

[HBS legislation](https://ec.europa.eu/eurostat/web/household-budget-surveys/legislation)明确2020及之前waves基于gentlemen’s agreement，2026是首次应用Regulation (EU) 2019/1700的wave。[2026 manual](https://ec.europa.eu/eurostat/web/products-manuals-and-guidelines/w/ks-01-26-021-en-n)是method/instrument knowledge，不是2026 results。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| programme/2020 transmission/2026 manual | `fixture` | 2020 result与2026 transition分开 |
| Eurobase `hbs_exp_*` selected aggregate | `route-fixture` | dataset/DSD/country/wave/category/unit固定 |
| scientific-use microdata | `forbidden-by-default` | restricted research application |
| national HBS pages | `member-evidence-only` | 不补Eurostat aggregate缺口 |

HBS是output-harmonised而非相同question/sample；country deviations必须进入comparability gate。2020 transmission使用ECOICOP 2013，而2026 transition包含新的consumption-domain规则；不得按标签静默映射。HBS household survey与national-accounts HFCE `nama_10_co3_p3`不是同一population或estimate。

## 3. 开源、Skill与验证

[restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0)是authority-org/EUPL SDMX/TSV transport reference，不拥有HBS national methods。[statistics-coded@`ca58d8c`](https://github.com/eurostat/statistics-coded/tree/ca58d8cad5a33ed5a6e5c97dd0cb1cfb29fbede3)提供authority-org reproduction scripts，但license未在本轮确认且部分计算可能依赖microdata；只作static method witness。均未安装/执行。

Synthetic覆盖private-household population、country instrument differences、2020 wave/2026 transition、ECOICOP/category correspondence、national currency/euro/PPS、mean/per-adult-equivalent、collection-year mismatch、quality/country gaps、HBS-vs-HFCE与microdata rejection。

## 4. Snapshot与可观测性

Snapshot保存wave、country metadata、transmission/manual、dataset/DSD/category/unit、currency/PPS、equivalence、quality/rights与OSS decision。Telemetry逐`wave × country × population × instrument × dataset/category × unit/value-basis × breakdown × quality`记录retained/dropped/suppressed、country-method/classification/wave drift、HBS-HFCE rejection与zero effects。
