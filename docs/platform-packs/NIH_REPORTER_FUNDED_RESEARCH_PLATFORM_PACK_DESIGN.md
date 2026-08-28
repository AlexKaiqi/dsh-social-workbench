# NIH RePORTER Funded Research Platform Pack 设计

状态：`researched / synthetic-fixture-eligible / public-production-canary-candidate / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`nih-reporter-funded-research/v0-design`

## 1. 定位与身份层级

本Pack表达RePORTER公开的NIH及部分非NIH联邦scientific award/project数据，不表达开放资助机会全集、application proposal、peer-review内容、临床有效性或市场需求。

[API v2](https://api.reporter.nih.gov/?urls.primaryName=V2.0)明确面向reporting、data analysis和integration，并暴露project/publication search。必须保留：

- full project number、core project number、application ID、subproject ID、support year/application type；
- administering IC与funding IC、activity/funding mechanism、fiscal year和opportunity number；
- award notice、budget/project window、award/direct/indirect/total funding的不同amount role；
- project title、abstract、public-health relevance、RCDC/spending categories；
- project→publication只是provider-linked output reference，不证明publication结论或项目成果。

同一core project的多个application/support year不能计作独立需求或独立project。`is_active`由最新budget end date计算；`is_new`只表示最近两次data refresh，不是项目创建事实。

## 2. Coverage、身份与推断边界

API project page默认50、最多500，offset最大14,999，并建议不超过每秒1个请求；大任务应走ExPORTER/bulk或受控partition，而不是递增offset伪装完整。Publication offset上限9,999。search relevance、provider RCDC分类和MCP aggregate均固定method/revision。

PI、program officer、个人姓名与联系信息默认pre-persistence drop；组织名称、UEI/IPF等只在批准的institution-level研究中保留。recipient abstract/public relevance是recipient/record assertion，study section与NIH classification是provider/authority context，不能混成科学事实。

## 3. 官方MCP/Skills与固定证据

[GSA MCP catalog](https://github.com/GSA-TTS/mcp-server-hub-catalog/blob/0bc00dfb74c86ca597bcc60d4d9d9633467e309c/docs/servers/nih_reporter.md)发布NIH RePORTER POC：search IDs、category lookup、project info、sampled preview、full summary、top/crosstab、dashboard/table；明确非production。固定[source `bf8d8cb…`](https://github.com/GSA-TTS/mcp-server-nih-reporter/tree/bf8d8cb49a047b244859f01a8d5c708a19198fee)包含spending-category/award-type resource skills和eval，但root license未发现。

preview最多sample 500与full summary是不同representation；排名PI/组织等工具扩大了身份和聚合面，不直接进入最小Connector。MCP source/schema可用于static fixtures，当前不安装、不执行、不调用remote，不提供任何model key。

## 4. Skills、fixture、观测与晋级

`nih-reporter-contract-research/v1`固定API/data-element/ExPORTER/MCP证据；`nih-reporter-fixture/v1`验证core/application/support-year identity、amount roles、organization/identity drop、classification authority、offset/partition和sample/full分离；未来read只允许field allowlist。

Telemetry按`API/bulk/MCP representation × schema/classification revision × fiscal year/IC/activity/category × window`记录total/offset/partition、returned/retained/dropped、core/application/support-year dedupe、amount completeness、PI/PO drop、relevance/category method、refresh lag、sample/full divergence、rate与zero writes。RePORTER无独立sandbox；只有用户批准后才能用最小public-production query做canary，且成功不自动授权PI数据、全量bulk或长期索引。
