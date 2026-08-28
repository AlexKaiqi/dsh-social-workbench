# UK Companies House Corporate Filing Platform Pack 设计

状态：`researched / synthetic-route-fixture-eligible / API-key-read-candidate / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`uk-companies-house-corporate-filing/v0-design`

## 1. 产品与population

本Pack只覆盖用户批准company-number roster的company profile、filing history/item、document metadata/content和可选filing stream，不覆盖officers、PSC、disqualifications、个人地址、全站lead generation、transactions或API Filing。

[Public Data API](https://developer-specs.company-information.service.gov.uk/companies-house-public-data-api/reference)用API key提供read-only company与filing history；`GET /company/{company_number}/filing-history`返回transaction、category/type、processed date、annotations/associated filings及document metadata link。[Document API](https://developer-specs.company-information.service.gov.uk/)另提供metadata和PDF/JSON/XML/XHTML/ZIP/CSV等可用content type；[filing stream](https://developer-specs.company-information.service.gov.uk/streaming-api/reference/filing-history/stream)从timepoint持续返回变更，但旧timepoint可能失效。

## 2. 概念映射与边界

| Native concept | `PublicCorporateDisclosure*` | 约束 |
| --- | --- | --- |
| company number/profile | reporting entity | 名称/地址搜索不是exact group或subsidiary关系 |
| transaction_id/category/type | filing envelope/history event | processed date不是report period或document creation time |
| document metadata/id/etag | registry document revision | document content是独立受权能力；format可能缺失 |
| accounts/iXBRL/PDF | accounts/structured fact/document | small/micro/abridged accounts可能缺P&L；PDF不保证可解析 |
| annotation/associated filing | correction/relation evidence | 只按native ID/links建立，不按文本猜修订 |
| stream timepoint | incremental checkpoint | 不是永久历史游标；需pull reconcile与gap telemetry |

Companies House接收的accounts和filing仍是reporting entity提交记录，不自动证明group结构、资金支付、当前购买意图或内容经Companies House审计。

## 3. 权限、内容与开源证据

API key通过Basic auth发送，仅存credential ref；公共数据GET与OAuth filing产品必须在route resolution前分离。官方[testing说明](https://developer.company-information.service.gov.uk/api-testing)指出Document/Streaming部分不在sandbox，而public search有时仍读live；所以“sandbox成功”不能证明document route，也不能调用transaction/POST/PUT/PATCH。

documents可能含签名、director/person、registered address与第三方材料；默认metadata-first，officer/PSC endpoint和person graph完全排除，document bytes另审content rights、retention和PII。公开register access也不自动授予所有document内容的AI/index用途。

固定候选：官方developer docs `1e56e2d…` MIT；官方`api-enumerations@5872d2c…`无root license，只作schema witness；community `companies-house-mcp@cca5b02…` MIT与`companies-house-diligence@f1f60bc…`无root license，因扩张到officer/PSC/ownership、网站抓取、PDF下载和lead judgement而quarantined，均未安装或执行。

## 4. Fixture、观测与晋级

fixture覆盖：company-number exact identity、filing pagination/total、transaction/document split、paper filing、missing document link、多MIME representation、etag revision、annotation/correction、associated filing、stream duplicate/gap/416 reconcile、accounts missing fields、person/PSC pre-gate、API key redaction和zero OAuth/write。

Telemetry按`company number × filing category/type × transaction/document × representation`记录requested/returned/retained/dropped、pagination/stream/pull coverage、timepoint age/416、etag/associated-filing conflicts、document availability/content type/size、PII drop、rights gate与write attempts。未来canary只对一个批准company number做profile+filing-history metadata GET；Document bytes、stream、search扩张分别授权。
