# G2 B2B Software Review Platform Pack 设计

状态：`researched / contract-gated / fixture-eligible / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`g2-b2b-software-review/v0-design`

## 1. 定位与 access populations

本Pack只描述G2明确授权的API或remote MCP read population，不把公开网页当作机器数据面。G2的public website、subscription API、official MCP、Buyer Intent、Market Intelligence与Research Boards是不同的product/effect populations；每个binding必须固定account/subscription、entitlement、OAuth scopes、exact read tools/routes、purpose、content/data-use license、retention、deletion与valid window。

官方来源：[G2 API](https://documentation.g2.com/docs/g2-api)、[G2 MCP Server](https://documentation.g2.com/docs/g2-mcp-server)和[Terms of Use](https://legal.g2.com/terms-of-use)。本Pack不连接OAuth，不读取真实review/buyer intent，不创建、更新或删除Research Board，不执行任何G2 tool。

## 2. 概念与能力映射

| G2 concept / capability | `ProductFeedback*`映射 | 当前状态 |
| --- | --- | --- |
| product/category | definition product/taxonomy authority | synthetic fixture |
| authored review | canonical review record | synthetic fixture；live需`products.reviews.read` entitlement |
| likes/dislikes/problems solved | exact content roles + revision-bound spans | synthetic fixture |
| verified/validated review | collection verification assertion | synthetic fixture；不得表达为陈述真实 |
| incentivized/source | collection incentive/source context | synthetic fixture；absence保持unknown |
| vendor response | separate provider/vendor response record + reply relation | schema candidate |
| switching/comparison | exact compared/selected/switched relation + switching-reason content | 仅exact provider field |
| rating/aspect rating | rating-only/aspect-rating records | synthetic fixture；不生成跨平台总分 |
| G2 score/Grid/rank | provider aggregate/placement authority | 单独population，不从review补全 |
| Buyer Intent | non-review behavioral product | 本Pack排除；未来单独授权 |
| Research Boards | stateful product workspace | write-effect population，本Pack拒绝 |

`verified`、`validated`、`incentivized`和来源label只是G2的collection assertions。reviewer/company/title/LinkedIn/location等identity/firmographic字段默认drop或restricted；即使API返回也不自动进入EvidenceSpan。

## 3. API/MCP、权利与 effect 合同

- 官方remote MCP使用OAuth 2.0，不是开源本地adapter，因此不存在可固定的客户端revision。真实binding必须保存provider tool catalog/schema digest和观测时间，不依赖tool name永久稳定。
- 最小未来profile只容许审核过的product/category/review read tools与`products.reviews.read`等exact scopes；Buyer Intent、Research Board read/write、create/update/delete和未知tool全部deny。
- 官方文档当前声明global 100 requests/sec和超限60秒block；它只是provider ceiling，不是采集预算。live仍需更小budget、Retry-After/backoff、kill switch和合同变更监控。
- 2026-07-09 Terms明确限制未经事先书面同意的automated collect/scrape/cache/index/store/archive和ML/generative-AI用途。API/MCP可访问不自动授权长期物化、训练、竞品分析或对外展示。
- Connector必须在network前验证subscription/entitlement和purpose，在materialization前验证content/data-use/retention。任何一层未知都fail closed。

## 4. Skills、MCP与开源审计

- `g2-contract-and-tool-surface-research/v1`：只读官方docs/Terms与用户提供的contract artifacts，产生scope/tool/rights proposal；不发起OAuth。
- `g2-review-fixture-conformance/v1`：用合成fixture验证content roles、verification/incentive unknown、switching exact relation、vendor reply、identity drop和write denial。
- `g2-approved-review-read/v1`（未来）：只允许已批准binding的exact read tools/scopes；当前返回`capability-unavailable:no-authorized-contract-binding`。
- 官方MCP是唯一官方Agent tool候选，但工具面同时包含读和Research Board写。“官方”不替代effect allowlist、OAuth scope minimization与output governance。
- [Scavio MCP `1659b5d…`](https://github.com/scavio-ai/scavio-mcp/tree/1659b5de7a14beb40875805a67a523daa9866503)与[FactDen scraper `df57f05…`](https://github.com/factden/g2-reviews-scraper/tree/df57f052aa1a9c0826f482d0aa36bcee62953d25)均为rejected route reference；开源代码许可不提供G2数据权利。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| verified review含强陈述 | 保留provider-verified assertion；不升格为真值 |
| incentive字段缺失 | `unknown`；不推断non-incentivized |
| 自由文本提到竞品 | 只产生relation candidate；不生成exact switched-from |
| exact switched-from字段 | exact relation + source field evidence |
| provider AI summary | provider-summary representation；不伪装authored review |
| MCP catalog新增write tool | binding quarantine；default deny |
| OAuth含额外scope | preflight拒绝；zero request |
| Terms/entitlement/retention失效 | 停止network/materialization，撤销派生索引 |

Telemetry按`contract binding × tool/schema digest × exact scope × product/category/window`记录requested/returned/retained/dropped、pagination/coverage、verification/incentive unknown、exact/candidate switching relation、identity/firmographic drop、provider-summary separation、scope/tool/effect/Terms/entitlement drift、rate/backoff和zero writes。晋级顺序为evidence review → synthetic fixture → contract/scope approval → sandbox live → operational canary；每阶段独立授权。
