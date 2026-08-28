# TGA Medicine Shortage Reports Database Platform Pack 设计

状态：`researched / concept+official-extract-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`tga-medicine-shortage-reports/v0-design`

## 1. 产品、概念与价值

本Pack描述澳大利亚TGA Medicine Shortage Reports Database。官方[database](https://apps.tga.gov.au/shortages/search/Index?shortagetype=All)支持current、anticipated、resolved、discontinued记录、active/archive extracts和RSS；[sponsor guidance](https://www.tga.gov.au/resources/guidance/reporting-shortage-or-discontinuation-medicine-you-supply)说明reportable medicines的shortages/discontinuations经TGA review后公开，并列出ARTG、产品/成分/强度/剂型、nature、availability、reason、dates和management action。

数据库信息主要基于sponsor报告，TGA采取的management action需单独authority attribution。ARTG product/presentation是identity锚点；同成分不同强度、剂型、包装或品牌不合并。

## 2. 能力、route与数据边界

concept capabilities为public search/read、active/archive extract discovery、critical filter、alert/RSS discovery和management-action read。route fixture固定export type、active/archive population、columns/date format、status/availability/impact/reason taxonomies、ARTG identity、record update、disclaimer、terms、response media type和schema digest。官方链接解析曾只读预览一次active extract响应；未保存或纳入fixture，此后不再请求export内容。

`anticipated/current/resolved/discontinued`与`available/limited/unavailable/reduction until exhausted`分开。impact rating是TGA native classification，不与FDA/Canada/EMA等级等价。estimated end date是reported estimate；resolved不证明local stock。

management action可能提及alternative brand/strength、Section 19A overseas supply或Serious Scarcity Substitution Instrument；本系统只保存instrument/action relation和authority，不给出替代、剂量或处方建议。公开sponsor phone/contact默认drop。

## 3. Fixture与晋级

synthetic fixture覆盖ARTG presentation split、anticipated→current→resolved、discontinuation、availability/status冲突、critical native rating、sponsor cause、TGA action、Section 19A/SSSI relation、active→archive movement、CSV/date/schema drift、contact drop和zero writes。Telemetry按`extract population × ARTG/presentation × status/availability/impact × update × schema/terms revision`记录history gap、taxonomy drift、authority split和clinical-advice exclusion。

metadata-only canary需用户批准；active/archive durable snapshots、RSS、notice content和management-action text分别做rights review。禁止sponsor portal、report/update、subscription/contact、患者/处方数据或治疗建议。
