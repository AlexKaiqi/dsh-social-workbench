# TrustRadius B2B Software Review Platform Pack 设计

状态：`researched / owned-or-licensed-api-fixture-eligible / public-blocked / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`trustradius-b2b-software-review/v0-design`

## 1. 定位与 dataset populations

TrustRadius vendor API并不等于全站公开review feed。本Pack仅为未来经授权的vendor-owned/licensed datasets建模，并将product score、licensed TrustQuotes、traffic、downstream intent、legacy visitor insights和public website分成独立populations。public website在network层blocked；任何API binding必须固定vendor package、API key credential ref、exact operations、product roster、content license、purpose、retention与deletion。

官方来源：[TrustRadius API portal](https://apidocs.trustradius.com/docs/public-api/YXBpOjUxMzgzNjA-trust-radius-api)、[Content Licensing / TrustQuotes](https://solutions.trustradius.com/products/content-licensing/)和[Terms of Use](https://www.trustradius.com/static/terms-of-use)。本Pack不请求API key，不读取真实real review/intent/visitor data，不访问网站，不创建review或调用写操作。

## 2. 概念与能力映射

| TrustRadius dataset / concept | 映射 | 边界 |
| --- | --- | --- |
| product ID / score | product identity + aggregate snapshot | 不是authored review |
| TrustQuotes excerpt | review-derived licensed excerpt representation | 不补全full review/body/history |
| use case / pros / cons | exact content roles | 仅license/schema明确的excerpt/review field |
| likelihood to recommend | rating/recommendation context | scale/population固定到definition |
| vetted / LinkedIn verification | provider-vetted collection assertion | identity details默认drop |
| incentivized | collection incentive context | missing保持unknown |
| Community Insight | provider summary representation | 不表达为一个用户的review |
| HG Insights installation summary | third-party/provider summary | 不当作独立用户证据 |
| traffic / downstream intent | separate behavioral dataset | 排除于ProductFeedback Pack |
| visitor insights | separate identity-sensitive dataset | 默认排除，需单独privacy design |

TrustQuotes是获许可的excerpt syndication，不得依靠excerpt字段猜测未返回的full review、reviewer identity、history或其他content roles。相同excerpt在widget、API和网页中重复出现仍只有一个source authority。

## 3. API、许可与版本合同

- 官方API portal定义vendor API；实际能力依package/entitlement而异。一个OpenAPI operation存在只能证明schema candidate，不证明用户有权调用或保留响应。
- 当前Terms页面仍标注2020-12-04，禁止AI、robot、spider、scraper等自动访问网站。由于证据年龄高，Terms evidence使用短expiry并持续检查；在变更前public route仍blocked。
- TrustQuotes/content license必须指定允许的quote/excerpt、channel/audience、display/analysis purpose、attribution、retention、revocation和删除传播。有API key不等于有所有这些权利。
- score、quotes、traffic、intent、visitor insights各有独立capability ID和rights binding。Connector不得使用一个宽泛`trustradius.read`授权将它们合并。
- API/schema digest、package、product roster或content license变化时，只quarantine受影响population；Channel可partial degraded，不回退网页爬取。

## 4. Skills、MCP与开源审计

- `trustradius-contract-and-schema-research/v1`：只读官方portal、license、Terms与用户提供合同artifact，产生dataset/capability/rights proposal。
- `trustradius-licensed-feedback-fixture/v1`：用合成fixture验证score/quote/review/summary分离、excerpt coverage、vetted/incentive unknown、identity drop和revocation。
- `trustradius-approved-licensed-read/v1`（未来）：只调度获批dataset operations；当前返回`capability-unavailable:no-authorized-vendor-package-binding`。
- [API Evangelist TrustRadius profile `3493f42…`](https://github.com/api-evangelist/trustradius/tree/3493f42b3d08089d0f24b3a127536e3219ed620e)保留了一份官方OpenAPI静态副本，但repo未发现license，其MCP/Skills为第三方生成脚手架且无deployed MCP。它只作schema-drift reference，每个operation必须回链官方portal。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| TrustQuote只有excerpt | excerpt coverage；不生成full review/body |
| score与quote同时返回 | aggregate与authored-derived representation分离 |
| vetted/LinkedIn verified | 只保留provider-vetted assertion；identity drop |
| incentive字段缺失 | unknown；不推断non-incentivized |
| Community Insight概括多条review | provider summary；不创建author/review count |
| API operation在spec中但package未授权 | preflight blocked；zero request |
| quote license revoked | derived index/tile撤销；snapshot仅保留受限制lineage/tombstone |
| website URL输入 | public route blocked；不fallback |

Telemetry按`vendor package × capability/dataset × operation/schema digest × product/window`记录requested/returned/retained/dropped、excerpt/full coverage、score/quote/summary separation、identity/firmographic drop、entitlement/content-license/Terms drift、revocation/deletion propagation、rate/backoff和zero web/write。只有官方schema fixture通过不构成live授权；contract evidence、credential ref、sandbox canary与operational kill switch仍须逐级批准。
