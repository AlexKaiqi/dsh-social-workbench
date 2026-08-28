# Business Experience Feedback Channel Pack 设计

状态：`researched`；4 个 fixture-eligible member，0 个 callable member，0 个 durable member  
核验日期：2026-08-26  
Channel Pack ref：`business-experience-feedback/v0-design`

## 1. 目的、成员与分母

本Channel用于发现企业、门店、地点和服务体验中的痛点、期望与resolution claim。它统一`BusinessExperienceFeedback*` projection，但不统一访问总体、选择算法、评分、verified含义、内容权利或删除义务。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| Google Business Profile | [GBP Pack](GOOGLE_BUSINESS_PROFILE_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md) | owned verified locations；fixture only；durable policy blocked |
| Google Places API (New) | [Places Pack](GOOGLE_PLACES_BUSINESS_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md) | max-5 relevance sample；fixture only；display-oriented |
| Yelp Places / AI | [Yelp Pack](YELP_BUSINESS_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md) | excerpts/provider answers；fixture only；AI rights blocked/contract gated |
| Trustpilot Data Solutions | [Trustpilot Pack](TRUSTPILOT_BUSINESS_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md) | Display/full-feed split；fixture only；contract/deletion gated |

requested=4，fixture-eligible=4，callable=0，durable=0。缺失member必须显式显示，禁止把fixture或技术可调用路线计入真实coverage。

## 2. 共同合同与不可比较边界

每条记录固定subject kind/stable ID、surface/API/schema、representation、record/revision、rating scale、experience/location context、selection/sort、verification/origin、authorship/reply relation、coverage、rights/retention/deletion和evidence。

必须保持以下边界：

- organization、business unit、location、service provider不能按名称或地址模糊合并；
- owned history、full licensed feed、latest/relevance sample、excerpt、aggregate和provider answer不能互补为“全部评论”；
- aggregate count不授权访问底层评论，sample频次不估计总体topic prevalence；
- verified/transaction-linked只是provider assertion；organic/invite/incentive与truth独立；
- business reply和claims-resolved是陈述，不是实际解决证明；
- reviewer identity、profile、头像、email、order ID和精确位置默认drop/restrict；
- API/MCP/SDK可访问性及开源代码license不替代内容使用、AI、索引、留存和派生权；
- rating scale、category/geography、selection、moderation和window不一致时不做跨平台总分、rank或market share。

## 3. 动态物化视图

- `experience-frictions-by-subject-location-and-service`：只聚合获准author spans，固定population与sample/full-feed coverage。
- `business-response-and-resolution-claims`：连接exact review/reply；resolution保持claim，需其他信号验证。
- `representation-and-sample-gap`：显示aggregate total、returned sample/excerpt/feed coverage和missingness。
- `verification-origin-and-incentive-context`：展示provider assertions与unknown，不计算可信度分。
- `cross-channel-experience-corroboration`：与survey、support、service request、regulatory complaint和自有telemetry关联；syndicated/summary重复不增加authority。
- `business-experience-rights-schema-and-deletion-drift`：跟踪Terms、contract、scope、field/tool、retention、deletion和callable roster。

每个view固定Channel/member/binding/definition revision、population、rights purpose、subject/geography/window、watermark与missingness。Dolt保存Pack/contract/schema evidence digest和view definition；只有明确获批的高体量记录未来才进入分析库。派生索引必须可按record、contract和deletion notice失效重建。

## 4. Channel Skills 与 Probe

`business-experience-source-contract-research/v1`只读官方资料、固定开源证据和用户提供合同，输出Pack/schema/rights/drift proposal；不安装、执行、登录、OAuth、调API/MCP或读取真实评论。

`business-experience-conformance/v1`用synthetic fixtures验证身份、representation、sample/full coverage、selection、reply/claim、identity minimization、retention/deletion与zero effects。

未来`approved-business-experience-read/v1`只调度获批member的exact product/binding/purpose；当前统一返回`no-authorized-business-experience-binding`。禁止fallback到HTML、browser cache、未批准普通API、community scraper/MCP或更宽scope。

本Channel不发布评论、商家回复、评分、flag、预订、询价或自动搜索来probe。需求测试继续走独立且经批准的survey、访谈、landing/content experiment Channel，并保留受众、同意、预算和effect ledger。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| aggregate=1000但返回5条 | sample coverage=5/1000；不推断topic prevalence |
| 同一内容以review/excerpt/summary出现 | lineage dedupe；authority不增加 |
| review带verified标记 | provider assertion；不升级为truth |
| reply声称fixed | resolution claim only |
| endpoint可调但AI/retention权缺失 | preflight拒绝；zero network/materialization |
| deletion notice到达 | source及所有派生view/index可定位失效 |
| write/booking/quote tool出现 | capability quarantine；zero external effect |

Telemetry按`Channel × member binding × surface/population × representation × schema/tool/rights revision × subject/window`记录expected/fixture/callable/succeeded/blocked/quarantined、requested/returned/retained/dropped、sample/full/aggregate coverage、identity minimization、attribution/source、cache/deletion lag、policy/contract/scope/schema drift和zero writes。至少一个member取得明确的分析用途合同并完成fixture、sandbox/live read与operational canary后，Channel才可晋级`modeled-partial`；durable eligibility单独审批。
