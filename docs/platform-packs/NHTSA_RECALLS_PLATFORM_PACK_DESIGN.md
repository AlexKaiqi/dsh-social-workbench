# NHTSA Recalls Platform Pack 设计

状态：`researched / concept+native-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`nhtsa-recalls/v0-design`

## 1. 产品与population

NHTSA [Datasets and APIs](https://www.nhtsa.gov/nhtsa-datasets-and-apis)将Recalls、Complaints、Investigations和Manufacturer Communications列为不同产品。Recalls覆盖vehicles、tires、child safety seats和equipment；manufacturer对safety defect或federal standard noncompliance提交Part 573报告，并提交quarterly status。官方提供按make/model/year、campaign number查询的API，也提供bulk files和data dictionary。

本Pack不读取VIN，也不判断某一VIN是否被召回或已完成维修。make/model/year查询得到的是产品类型匹配；campaign response也可能有多个受影响product row。投诉仍由既有`RegulatoryComplaint*`建模，不能因同属NHTSA而合并为recall evidence。

## 2. 概念映射与边界

`NHTSACampaignNumber`与manufacturer campaign number固定为不同identity；component、summary、consequence、remedy、report-received date、manufacturer、product kind/make/model/year和potentially affected population分别映射。campaign→affected product、defect/noncompliance→product、remedy→campaign/product为exact relation。

- defect/noncompliance report证明manufacturer/authority process中的报告，不自动证明所有主张、因果或法律责任；
- consequence和crash/injury statements保持source assertion；不得生成事故率；
- API与bulk属于不同representation，watermark、schema、history和coverage独立；
- quarterly status或source-declared completion不等于每个owner收到通知或完成remedy；
- VIN、partial VIN、owner/contact identity和manufacturer contact details一律drop/restrict。

## 3. 开源、Fixture 与晋级

[writelinez/NHTSA-VehicleData@7d063eb](https://github.com/writelinez/NHTSA-VehicleData/tree/7d063eb1fe30d7cabe472a535ec825df017d26c3)是MIT社区wrapper，但陈旧且非官方，只作请求形状参考。[nhtsa-recall-monitor-docs@a94e5d3](https://github.com/the-ai-entrepreneur-ai-hub/nhtsa-recall-monitor-docs/tree/a94e5d3f89f96e203d12c0c184e38d51b42dc7e2)是MIT的第三方Apify产品，混合VIN/complaint/recall并需要第三方token，明确不进入native route。

synthetic fixture覆盖campaign→multiple products、vehicle/tire/seat/equipment、defect vs noncompliance、API-vs-bulk差异、campaign correction、missing population、complaint collision、VIN rejection和zero report/write。Telemetry按`representation × campaign × product kind × manufacturer × native status`记录route/coverage/schema/lag/relation冲突、PII drop和zero effects。真实API/bulk、VIN或durable materialization均需另行授权。
