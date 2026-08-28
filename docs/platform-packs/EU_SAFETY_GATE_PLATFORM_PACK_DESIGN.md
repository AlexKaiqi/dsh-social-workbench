# EU Safety Gate Platform Pack 设计

状态：`researched / concept+manual-export-fixture / official-api-contract-missing / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`eu-safety-gate/v0-design`

## 1. 产品与population

[EU Safety Gate](https://ec.europa.eu/safety-gate/)是危险非食品产品快速预警系统：national authorities提交alert，包含product、risk和economic operator自愿采取或authority命令的措施；其他国家可添加follow-up action。它不是食品、药物不良事件或企业内部投诉库。

官方门户和[2024 annual report](https://op.europa.eu/en/publication-detail/-/publication/225ab30f-0a4c-11f0-b1a3-01aa75ed71a1)说明公众可search并导出alert/search results。当前未发现稳定、版本化、公开的API/schema合同；即使页面存在形似`/api/download/...`的路径，也只算门户内部实现观察，不计native route。

## 2. 概念与authority

notification/alert、product/category/brand/model/barcode/batch、risk type/level、notifying country、compulsory/voluntary measure、economic operator、national authority follow-up、modified/withdrawn和language/rendition分别建模。authority-authored alert、operator action与other-country follow-up不能互相继承；machine-translated rendition必须链接original，不取得原文authority。

- alert证明authority发布的notification，不证明每件上市产品不合规、所有国家受影响或实际伤害；
- compulsory/voluntary属于每项measure，不应仅挂在整个alert；
- modified/withdrawn使current projection失效但保留历史；
- alert PDF、search export、detail page是不同representation，不能按title独立计数；
-公开/非公开字段边界保持原样，个人/contact data和economic operator人员身份不进入索引。

## 3. Fixture、观测与晋级

本轮未找到主管机构官方Skill/MCP或可固定的官方开源client；community scraper不会补足合同。synthetic/manual-export fixture覆盖一个alert多个products/risks/measures、compulsory vs voluntary、notifying vs follow-up authority、original vs machine translation、amend/withdraw、PDF/export common-origin、unknown schema和zero portal effects。

Telemetry按`export/rendition × notification × product × country × measure × language`记录coverage、translation、revision/withdrawal、authority/mandate completeness、schema drift与rights。出现正式API/schema或用户提供并批准的固定export definition后才重评route；真实portal、export下载、网页、搜索、订阅或长期materialization另行授权。
