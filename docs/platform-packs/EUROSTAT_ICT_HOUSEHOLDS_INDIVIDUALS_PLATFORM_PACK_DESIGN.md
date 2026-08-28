# Eurostat ICT Usage in Households and by Individuals Platform Pack

## 1. 稳定概念与官方事实

[Eurostat `isoc_i` metadata](https://ec.europa.eu/eurostat/cache/metadata/en/isoc_i_esms.htm)定义年度ICT household/individual survey：household层收集access，individual层收集internet use、e-government、e-commerce、e-skills与privacy。private household须至少一名16–74岁成员；individual核心population为16–74岁。通常数据参考survey year第一季度，但具体question window必须看年度model questionnaire。

2025内容包括access、internet use、e-government、e-commerce、eID、e-skills与privacy；questionnaire会随年份变化并可能打断series。[comprehensive database](https://ec.europa.eu/eurostat/web/digital-economy-and-society/database/comprehensive-database)与Eurobase/Statistics API是不同distribution，restricted scientific-use microdata不是本Pack route。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| ESMS/model-questionnaire/variables/country quality | `fixture` | year/country revision固定 |
| Eurobase/Statistics API/SDMX selected aggregate | `route-fixture` | dataset/DSD/dimension/status固定 |
| comprehensive Access database | `file-fixture` | large file；不下载 |
| scientific-use microdata | `forbidden-by-default` | restricted research route |

`% households`、`% individuals`和`% internet users`不可互换。digital-skills composite是activity-based publisher calculation，不是直接能力测试；optional/biennial modules、translation/routing差异和country quality notes必须进入comparability gate。

## 3. 开源、Skill与验证

[eurostat/restatapi@`a0bce06`](https://github.com/eurostat/restatapi/tree/a0bce063c60aef1033ea696d91d26e1158c2c4b0)是authority-org/EUPL的R SDMX/TSV client，只作transport reference；它不拥有`isoc_i` question、population、composite或country-deviation语义。未发现programme-owned Agent Skill/MCP。

Synthetic覆盖household/person/user denominators、16–74 population、3/12-month windows、annual/rotating modules、skill component/composite、country optional/missing/suppression、code break与microdata rejection。未来canary只允许selected aggregate coordinates。

## 4. Snapshot与可观测性

Snapshot保存dataset/DSD/codelist、model questionnaire、variable list、country note、population/question/composite/release/rights revision。Telemetry逐`dataset × country × year × household/person/user × indicator/question × unit × breakdown × status`记录retained/dropped/suppressed、DSD/code/question/method/country drift和zero effects。
