# CDC NORS Foodborne Outbreaks Platform Pack 设计

## 1. 稳定概念

[NORS dataset `5xkq-dg7x`](https://data.cdc.gov/Foodborne-Waterborne-and-Related-Diseases/NORS/5xkq-dg7x)是一行一outbreak的public Socrata/OData representation。primary mode可为foodborne、waterborne、person-to-person、animal contact、environmental或unknown；本Channel只把exact foodborne population投影为food establishment/outbreak研究，其他mode保留coverage/exclusion而不静默混入。

[NORS guidance](https://www.cdc.gov/nors/data/)定义outbreak为两个及以上similar illness并关联common exposure。单case与无共同暴露证据的cluster不是NORS outbreak。reporting由state/local/territorial public health agencies自愿完成；final data通常在reporting year后12–18个月close-out，但报告可在多年后修改。

`etiology`与`etiology status`保留confirmed/suspected/multiple/unknown；`setting`对foodborne表示food prepared setting category，不是exact premises；food vehicle和contaminated ingredient可能多值、命名不一致。estimated primary illnesses、hospitalizations、known hospitalization info、deaths与known survival info分别保存，不能用全部illnesses替代outcome denominator。

## 2. Capability与路由

| capability | route fixture | 当前状态 |
| --- | --- | --- |
| outbreak definition/reporting/close-out method read | official NORS guidance/forms/dictionaries | knowledge |
| dataset metadata/schema read | Socrata asset `5xkq-dg7x` / OData | exact route fixture only |
| selected foodborne outbreak metadata read | fixed dataset, `primary_mode=Food` equivalent exact code, field allowlist | manual/fixture only |
| aggregate by exact denominator | approved synthetic only | fixture only |
| exact establishment/patient/reporting-user read | no public route | unsupported/rejected |
| outbreak report/update/delete/contact/FOIA/write | none | rejected |

当前`callable=0 / durable=0`。未来canary必须固定dataset ID、schema/data documentation、mode code、publication/close-out lag、row revision/tombstone policy、SoQL allowlist与field/suppression rules；BEAM dashboard、generic CDC MCP、another surveillance dataset或arbitrary Socrata search不得fallback。

## 3. Snapshot、rights与隐私

dataset metadata标为U.S. Government Public Domain；[CDC material policy](https://www.cdc.gov/other/agencymaterials.html)要求CDC attribution、non-endorsement、不得改变substantive content，并提示contractor/third-party material例外。Snapshot固定NORS form/guidance/data dictionary、dataset/schema、mode/etiology/setting/vehicle/count definitions、close-out and revision policy、license/material policy digest与valid window。

默认projection只保留opaque outbreak ID、year/month、coarse state/multistate、mode、setting category、etiology/vehicle posture和approved aggregate refs。exact dates、small-area geography、reporting contacts、patient/case-level data、free-text food/venue/notes、attachments默认drop或quarantine；public dataset不授权重新识别人员或场所。

## 4. 动态视图、可观测性与fixture

动态视图：`reporting-jurisdiction-mode-year-coverage`、`reported-finalized-closed-out-revised-history`、`foodborne-vs-other-mode-separation`、`etiology-confirmed-suspected-multiple-unknown`、`setting-vs-exact-premises-gap`、`food-vehicle-ingredient-attribution-posture`、`illness-hospitalization-known-death-survival-denominator`、`voluntary-underreporting-and-detection-limit`与`privacy-small-cell-free-text-drop-audit`。

Telemetry逐`dataset/schema/guidance revision × reporting year/site × primary mode × outbreak posture × setting × etiology posture × vehicle/ingredient attribution × count/denominator × close-out lag × suppression/privacy/rights`记录returned/retained/dropped、revision/delete delta、unknown/multi-value parse、denominator missingness、late report、mode exclusion、fuzzy establishment link rejection、stale watermark与zero effects。

Synthetic至少覆盖：single case rejected；cluster without common exposure rejected；foodborne included/person-to-person excluded；suspected later confirmed etiology；multiple etiologies保持list；food vehicle synonyms不自动merge；hospitalization known denominator小于illnesses；closed-out report多年后revised；deleted report传播tombstone；same city/date/food and restaurant name仍无exact relation。

必须拒绝：outbreak count→all foodborne illnesses、voluntary report→complete population、confirmed etiology→exact establishment cause、setting→venue、food vehicle→product recall identity、illness count→unique exposed people、missing row→no outbreak、public domain→logo/third-party content right，以及generic CDC/Socrata MCP→NORS Connector。

## 5. 官方资料

- [NORS public dataset](https://data.cdc.gov/Foodborne-Waterborne-and-Related-Diseases/NORS/5xkq-dg7x)
- [NORS data, close-out and limitations](https://www.cdc.gov/nors/data/)
- [NORS reporting guidance and dictionaries](https://www.cdc.gov/nors/php/reporting/index.html)
- [BEAM/NORS FAQ](https://www.cdc.gov/ncezid/dfwed/BEAM-FAQ.html)
- [CDC material use policy](https://www.cdc.gov/other/agencymaterials.html)

本轮没有请求任何Socrata/OData outbreak row、BEAM result或NORS report。
