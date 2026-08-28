# Trustpilot Business Experience Feedback Platform Pack 设计

状态：`researched / synthetic-fixture-eligible / contract-gated / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`trustpilot-business-experience-feedback/v0-design`

## 1. 总体与产品层

Trustpilot的business unit、Display API、Insights API和private OAuth数据是不同population：

- [Business Units API](https://developers.trustpilot.com/business-units-api)有公开business unit与review读取表面；公开`all-reviews`不含email/order ID，private route可能包含，后者默认禁止。
- [Data Solutions](https://developers.trustpilot.com/data-solutions-get-started)中Display API仅提供最新最多5条及企业信息；Insights API才是full service-review/category feed，需合同。
- [Data Solutions how-to](https://developers.trustpilot.com/data-solutions-how-to)记录stars/title/text/language/isVerified/created/updated/experiencedAt/source与可选reviewed location。

“public endpoint”不证明可把评论用于AI痛点挖掘、长期存储或跨平台索引；exact Data Solutions合同仍是rights gate。

## 2. 删除、缓存与身份边界

[Deletions API](https://developers.trustpilot.com/deletions-api/)要求保存相关consumer/review数据的集成定期同步删除，最长间隔28天；[缓存建议](https://developers.trustpilot.com/ds-caching-best-practices/)要求展示缓存通常24小时刷新。未来若合同允许持久分析，必须先证明删除游标、重放、派生索引失效和审计回执，才可materialize。

email、order ID及其他private OAuth字段不属于需求发现最小数据；默认拒绝或drop。`isVerified`与source=`organic/invite`是provider assertions，不证明评论内容真实，也不应生成统一可信度分。

## 3. Skills、开源与fixture

`trustpilot-contract-research/v1`只读官方docs/terms和用户提供合同；`trustpilot-fixture/v1`用合成数据验证Display-vs-Insights、pagination、business-unit/location identity、verified/source、experience date、update和deletion；未来read skill只允许exact approved dataset/product。

固定官方[node-trustpilot `0bb5109…`](https://github.com/trustpilot/node-trustpilot/tree/0bb51093b3aa25e964260f28717451b2fd42b017)为MIT；[documentation-bruno-collection `84c3db1…`](https://github.com/trustpilot/documentation-bruno-collection/tree/84c3db1fe3f01d60d1b55b747d78f2b1f7269b99)root license未确认。它们只作schema/drift静态证据；未发现官方MCP或Agent Skill。

## 4. 可观测性与晋级

Telemetry按`product × business-unit/location × API/schema/contract revision × window`记录requested/returned/retained/dropped、Display Top-N/full-feed coverage、verified/source unknown、private-field rejection、cache age、deletion cursor/lag/completeness、terms/contract/schema drift和zero writes。晋级顺序是official evidence → synthetic fixture → exact contract review → sandbox/live read → operational canary；Display、Insights和private route各自晋级，绝不跨产品补全。
