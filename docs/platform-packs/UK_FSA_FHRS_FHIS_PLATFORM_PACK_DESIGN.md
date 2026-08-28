# UK FSA FHRS/FHIS Platform Pack 设计

## 1. 稳定概念

[FSA open-data说明](https://ratings.food.gov.uk/open-data?lang=en-US)把记录定义为local authority在last inspection/visit观察到的food hygiene standards。FHRS用于England、Wales、Northern Ireland，rating 0–5并可包含hygiene、structure、confidence-in-management component score；FHIS用于Scotland，结果是Pass/Improvement Required且不适用FHRS component scores。二者不是一个ordinal scale。

`Awaiting Publication`表示appeal正在处理；`NewRatingPending=true`表示local authority已上传新数据但仍在notification/appeal期。rescore上传时component scores可能不发布。current published rating、pending new rating、appeal和rating date不能互相覆盖。

`FHRSID`在FSA data中unique，但依赖LocalAuthorityCode与LocalAuthorityBusinessID；地方机关换库、合并或重用ID会产生identity change/reuse。business name/address相似只能形成candidate；private-address establishment可以没有address/geocode。

## 2. Capability与路由

| capability | official route fixture | 当前状态 |
| --- | --- | --- |
| scheme/rating/score definition read | FSA scheme guidance、Ratings/SchemeTypes/ScoreDescriptors | knowledge/fixture |
| authority/business taxonomy read | API v2 Authorities/BusinessTypes/Countries | exact route fixture only |
| selected establishment/latest rating read | API v2 `Establishments/{id}` | manual/fixture only |
| search selected population | API v2 Establishments search with fixed filters/page | fixture only |
| full/local-authority nightly bulk | official XML/full download | exact bulk fixture only |
| historic inspection/violation/enforcement/closure/outbreak | no exact member route | missing/rejected |
| appeal/right-to-reply/rerating/report/contact/write | none | rejected |

[API v2](https://api.ratings.food.gov.uk/help)无需注册，但请求必须固定`x-api-version`；language header、pagination、rate-limit 403/429和API/system status均进入route health。regular full refresh优先official nightly files，不能用HTML search或community GraphQL补齐。

当前`callable=0 / durable=0`。一个local authority bulk成功不证明四国、所有authorities或live API population完整；API与bulk必须用extract/update watermark对账。

## 3. Snapshot、rights与字段边界

[terms](https://ratings.food.gov.uk/terms-and-conditions)把ratings information置于OGL，要求使用current rating或标注更新时间；imagery、FSA logo与FHRS mark另受商标/brand rules并禁止暗示endorsement。Snapshot固定API version、authority roster、scheme/rating/score descriptor、ID migration/status alert、bulk extract、terms/OGL/imagery digest与valid window。

默认projection保留opaque FHRSID、local-authority、business type、scheme、native rating key、rating date、standing、component-score presence和coarse area。business name、full address/postcode、geocode、owner/operator、private-address hint及right-to-reply free text默认drop；不复制rating imagery。

## 4. 动态视图、可观测性与fixture

动态视图：`authority-scheme-business-population`、`fhrs-vs-fhis-non-comparability`、`current-rating-vs-new-pending-vs-appeal`、`rating-date-and-extract-freshness`、`component-score-applicability-and-missingness`、`local-business-id-change-reuse-candidate`、`api-vs-bulk-coverage`与`private-address-location-drop-audit`。

Telemetry逐`API version × authority/region/country × scheme/business type × FHRSID/local ID revision × rating key/standing/date × component presence × page/extract watermark × language × privacy/rights/imagery`记录returned/retained/dropped、ID drift、pending/appeal conflict、API/bulk disagreement、403/429、stale authority、schema/status alert、fallback rejection和zero effects。

Synthetic至少覆盖：FHRS 0/5与FHIS Improvement Required不比较；Awaiting Publication+old current rating；NewRatingPending without new value；rescore component scores absent；authority merge changes ID；reused local ID enters review；private address withheld；Welsh/English payload same identity but distinct language representation。

必须拒绝：FHRS=3→Toronto Pass/NYC B、FHIS Pass→perfect/zero violations、current rating→current safety/complete history、pending→published、ID/name/address similarity→exact merge、missing address→geocoding fallback、OGL→imagery/logo right，以及community client/GraphQL/agent API→official Connector。

## 5. 官方资料

- [UK food hygiene rating data API and downloads](https://ratings.food.gov.uk/open-data?lang=en-US)
- [FHRS API v2 help](https://api.ratings.food.gov.uk/help)
- [API endpoint index](https://api.ratings.food.gov.uk/Help/Index)
- [Food hygiene rating scheme](https://www.food.gov.uk/safety-hygiene/food-hygiene-rating-scheme)
- [Terms, OGL and imagery rules](https://ratings.food.gov.uk/terms-and-conditions)

本轮没有调用API v2、下载XML/JSON或读取任何establishment/rating row。
