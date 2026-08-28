# WHO ICTRP Clinical Study Platform Pack 设计

状态：`researched / concept+official-export-and-contract-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`who-ictrp-clinical-study/v0-design`

## 1. 产品、population 与身份

本Pack描述WHO International Clinical Trials Registry Platform的Search Portal、WHO Trial Registration Data Set和只读download/web-service能力。官方[TRDS v1.3.1](https://www.who.int/tools/clinical-trials-registry-platform/network/who-data-set)规定primary registry/ID、registration date、secondary IDs、support/sponsor、public/scientific contacts、titles、countries、condition、interventions、design、first enrollment、anticipated/actual sample size、recruitment status、outcomes、ethics、completion和IPD sharing statement等最小字段。

本系统不保留public/scientific contact、PI、email/phone/address、site或participant data。UTN是早期永久trial identity辅助，不是registration number；有UTN的计划可能从未形成完整protocol或招募参与者。

[related-record规则](https://www.who.int/tools/clinical-trials-registry-platform/the-ictrp-search-portal/linking-related-records-on-the-ictrp-search-portal)说明跨registry重复通常由main identifier匹配secondary identifier形成bridge，并优先显示最早registration。这个grouping是provider relation；identifier不完整时可能漏链，不能title fuzzy merge，也不能把多条registry records当多项独立研究。

## 2. route、rights 与authority

[download/terms页面](https://www.who.int/tools/clinical-trials-registry-platform/network/who-data-set/downloading-records-from-the-ictrp-database)说明Search Portal可下载CSV、search/selected/all records可XML下载，data每周更新，来自符合WHO标准的registries，WHO不endorse且不保证accuracy/completeness；数据公开、免费，publication/distribution需尽可能保留WHO与data-provider attribution，获取和保留期间适用terms。

[XML Web Service](https://www.who.int/tools/clinical-trials-registry-platform/the-ictrp-search-portal/ictrp-search-portal-web-service)是research-purpose、申请/约定partner、可能收费的独立产品。public download、costed web service和portal search不能互相继承authorization。当前route fixture只保存TRDS version、CSV/XML schema、weekly watermark、provider/registry identity、query/selection、related-record bridge、attribution和error；不下载或调用。

WHO作为aggregator/provider authority不接管primary registry、sponsor或results submitter authority。Pending/Recruiting/Suspended/Complete/Other保留WHO/native含义，不映射成科学成功或法律状态。

## 3. Fixture 与晋级

synthetic fixture覆盖one trial/multiple registries、UTN-not-registration、missing secondary IDs、earliest-registration display、anticipated/actual enrollment、weekly update、provider correction、CSV/XML common-origin、web-service contract/cost block、contact/IPD drop和zero writes。Telemetry按`TRDS revision × provider registry × primary ID/UTN × representation × weekly watermark × terms`记录member coverage、related-record conflicts、field completeness、lag、attribution和zero effects。

用户批准public metadata export canary不开放Web Service、全量durable corpus或临床使用。UTN申请、trial registration、registry/contact workflow和所有write/effect拒绝。
