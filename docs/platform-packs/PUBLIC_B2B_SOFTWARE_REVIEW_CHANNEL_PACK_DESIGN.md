# Public B2B Software Review & Switching Evidence Channel Pack 设计

状态：`researched`；2 个 fixture-eligible member，0 个 callable member  
核验日期：2026-08-26  
Channel Pack ref：`public-b2b-software-review/v0-design`

## 1. 目的、成员与分母

本Channel面向B2B软件采用后证据，用于发现use case、pros/cons、problems solved、采用阻力、选择理由与switching trigger。它统一`ProductFeedback*` projection，但不统一权利、review verification、incentive/solicitation、rating scale、category population、provider summary、buyer-intent或身份。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| G2 contract binding | [G2 Pack](G2_B2B_SOFTWARE_REVIEW_PLATFORM_PACK_DESIGN.md) | official API/MCP synthetic fixture candidate；contract/OAuth absent |
| Capterra contract/export binding | [Capterra Pack](CAPTERRA_B2B_SOFTWARE_REVIEW_PLATFORM_PACK_DESIGN.md) | researched/manual-contract only；public blocked |
| TrustRadius vendor package | [TrustRadius Pack](TRUSTRADIUS_B2B_SOFTWARE_REVIEW_PLATFORM_PACK_DESIGN.md) | fixed official vendor API synthetic fixture candidate；contract/key absent |

requested=3，fixture-eligible=2，callable=0。fixture-eligible只表示可以用合成数据验证官方schema/representation，不表示有权调用、保留或AI分析。Capterra在获得exact official export schema前不计fixture-eligible。

## 2. 共同合同与不可比较边界

共同projection固定platform/surface/API/schema/product/version、record/representation/state、rating scale/aspect、content role/exact relation、verification/incentive/collection/moderation/authorship context、rights/retention/deletion、coverage、evidence与watermark。

必须保留：

- provider-verified/vetted是平台assertion，不证明review陈述或身份属性真实；
- incentivized不等于positive/non-authentic，缺失label也不证明non-incentivized；
- exact `switched from`、`selected over`只能来自provider field或reviewed ledger；文本提及只是candidate；
- pros/cons/problems solved是authored assertions，不得转换为已验证产品事实；
- vendor response是separate authored/provider record，不证明fixed/resolved；
- AI/provider summary、Grid/rank/score、market presence、intent与raw review分属不同authority/representation；
- reviewer identity、work email、LinkedIn、job title、company、location与firmographics默认drop/restrict；
- public web、vendor-owned export、licensed quote、subscription API、buyer intent与competitive intelligence不能跨population补全；
- rating scale、category selection、review solicitation、moderation、time window与coverage不一致时，禁止生成跨平台综合分或market share。

## 3. 动态物化视图

- `post-adoption-frictions-by-product-and-use-case`：聚合获准authored spans，按product/use-case/content role展示；不跨rights population比raw counts。
- `switching-reason-candidates`：分开exact structured relations与text-derived candidates，固定from/to product identity和review revision。
- `verification-incentive-and-solicitation-context`：显示provider assertions与unknown rates，不生成可信度分数。
- `vendor-response-and-resolution-claim`：连接review和vendor response的exact reply relation，但将resolution保留为claim/candidate。
- `cross-surface-friction-corroboration`：与support forum、owned app review、interview、issue、自有telemetry连接；provider summary或syndicated quote重复不增加independent authority。
- `b2b-review-rights-schema-and-entitlement-drift`：跟踪Terms、contract、scope/tool、export/API schema、license/retention/deletion和callable roster。

所有view固定Channel/member/binding/definition revision、population、rights purpose、product/category/window、watermark和missingness。Dolt snapshot保存Platform Pack、schema/contract evidence digest、projection definition和decision revision；大量授权review records/metrics未来才进分析存储。物化视图与索引可重建，权利撤销时必须能定位并删除派生内容。

## 4. Channel Skills 与 Probe

### `b2b-review-source-contract-research/v1`

只读官方docs/spec/Terms、固定版本开源候选和用户提供合同artifacts，产生Platform Pack/schema/rights/drift proposal；不安装、执行、OAuth、调用API/MCP或读取真实review。

### `approved-b2b-review-read/v1`（未来）

只调度已批准member binding的exact dataset/tool/route/product roster。当前所有成员返回`no-authorized-contract-binding`；禁止fallback到HTML、browser、search cache、community scraper/MCP/Skill、更宽OAuth scope或其他账号。

### `b2b-review-conformance/v1`

验证population、schema/representation、verification/incentive unknown、content roles、exact/candidate switching、vendor reply、summary/source authority、identity drop、rights/retention/deletion、scope/tool/effect drift和zero writes。

本Channel没有review write Probe。不通过review solicitation、incentive、vendor response、rating/vote、flag、Research Board变更、假账号或任何操纵来测试需求。主动probe继续使用获批survey/interview/landing/manual package等独立Channel，明示研究目的并保留批准与effect ledger。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| 同一review以full、quote、summary出现 | lineage dedupe；三种representation不增加authority |
| provider verified但incentive unknown | 两个正交facts；unknown不被补全 |
| 文本提及竞品，exact field缺失 | switching candidate only |
| rating scale/selection population不同 | 不产生跨member总分/rank |
| 一个contract/entitlement过期 | member quarantine，Channel partial；不fallback |
| 开源scraper声称可用 | license/route gate拒绝；zero execution/network |
| reviewer profile/firmographics出现 | drop/restrict并记录data-minimization event |
| write tool、solicitation或vendor reply请求 | policy拒绝；zero external effect |

Telemetry按`Channel × member binding × population/capability × schema/tool digest × product/window`记录expected/fixture/callable/succeeded/blocked/quarantined、requested/returned/retained/dropped、content-role/coverage、verification/incentive missingness、exact/candidate switching、summary/quote lineage、identity drop、rights/Terms/contract/scope/schema drift、rate/backoff和zero web/write。至少一个真实contract binding通过fixture和sandbox canary后Channel才可成为`modeled-partial`；operational canary和任何新population需单独授权。
