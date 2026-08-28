# Public Early-Adopter Product Discovery Channel Pack（设计）

检查日期：2026-08-26
Pack：`public-early-adopter-product-discovery/v0-design`
状态：`researched / API-roster-policy-gated / Product-Hunt-manual-probe-design-only`

## 1. Channel 目标与成员

该 Channel 用于发现公开早期采用者场域中的问题表述、现有替代、切换原因、产品定位、maker claim、launch反馈和反例。成员为：

1. `reddit-public-discussion/v0-design`：subreddit/post/comment的公开讨论；任何API访问需明确批准，当前无route；
2. `product-hunt-product-launch/v0-design`：Product Page/Launch/Post/maker/comment/rank；商业API需书面批准且schema关系待验证，当前无API route；未来仅保留owned truthful launch的manual-package设计候选。

这不是“两个社交平台共用一个 Connector”。Channel 只统一研究目标、query portfolio、coverage、证据晋级和动态视图，不统一平台身份、授权、排序、互动计数或写能力。

## 2. 异构来源组合

```text
ChannelScope revision
  research question / audience / technology portfolio
  member roster and member-specific policy decision
  Reddit -> PublicDiscussionDefinition/Record/Span
  Product Hunt -> ProductLaunchDefinition/Record/Span
  cross-representation projection and reviewed identity ledger
  member-specific selection/coverage/rights/retention
  dynamic view definitions
```

Reddit 复用 `PublicDiscussion*`，Product Hunt 使用 `ProductLaunch*`。二者不共享 root object：

| Reddit | Product Hunt | 不可合并原因 |
| --- | --- | --- |
| subreddit community | Product Page/topic/collection | community roster 与 product taxonomy 不同 |
| post/comment tree | Product→Launch→comment/review | 产品可多次launch，post不是持久产品 |
| hot/new/top/rising | featured/all + 多window rank | selection/ranking算法和窗口不同 |
| score/upvote ratio/comment count | votes/comments/review aggregate | measure definition与样本偏差不同 |
| author/moderator | hunter/maker/commenter/reviewer/provider | actor roles不等价 |
| crosspost/duplicate | relaunch/product relation | 文本/URL相似不能互建native relation |

## 3. Channel Scope、可用性与覆盖

每个研究任务必须固定：

- audience/problem/technology portfolio 与排除项；
- Reddit approved subreddit roster、rules/flair/query/sort/time；
- Product Hunt topic/featured/order/time/representation/schema；
- member用途批准、商业范围、AI-assisted analysis、rights、retention/deletion valid window；
- source-specific author-role filter、language、coverage与selection bias；
- cross-member product identity只接受exact external identifier或人工review ledger。

coverage分别报告 `requested / eligible / bound / observed / policy-blocked / schema-blocked / manual-only / failed`。当前API roster为`eligible=0`；Reddit是approval-blocked，Product Hunt是commercial-approval+schema-blocked。Channel不能把这解释为空需求，也不能用一个成员的成熟度补另一个成员。

## 4. 动态物化视图

可从append/correction/tombstone事实构建可丢弃、可重建的任务索引：

- `problem-language-by-audience`
- `failed-attempts-and-current-workarounds`
- `alternative-and-switching-candidates`
- `maker-positioning-vs-community-response`
- `launch-claim-vs-experienced-pain`
- `availability-and-adoption-evidence-gap`
- `cross-member-product-corroboration-candidates`

每个视图固定member scope、source representation、author roles、query、time window、selection、dedupe/identity ledger、model/version、build watermark、evidence expiry与rights policy。被policy-blocked的成员只贡献missing-member事实，不能贡献正文或向量。

## 5. 证据与推断边界

该 Channel 不新增泛化的 `EvidenceEarlyAdopter`。来源表示与需求语义分开：

- Reddit reviewed human-authored post/comment可按实际内容派生complaint、workaround、urgency、switching；
- Product Hunt maker name/tagline/description属于subject claim/positioning，不能冒充用户痛点；
- Product Hunt community comment/reply/review只有在exact authored span下才可能成为需求证据；
- votes、score、rank、featured、review rating、comment count、karma和followers都不等于独立人数、购买、留存、收入或市场规模；
- 同一内容的crosspost、relaunch、转载和引用不计独立recurrence；
- 同一用户名、姓名、头像、domain或URL相似不建立跨平台个人/产品身份；
- 产品外链只证明链接存在，不证明产品可用、功能真实或用户采用。

跨成员 corroboration 只产生candidate，必须保留两边EvidenceSpan、selection/coverage与反证；不直接合并计数。

## 6. Probe 边界

Channel 没有通用 write route。

- Reddit：当前所有post/comment/vote等write拒绝；未来也需Reddit、app与目标subreddit三重批准，禁止spam和投票操纵。
- Product Hunt API：所有write拒绝；商业API read批准不授权launch/comment/vote。
- Product Hunt manual Probe：未来只可为用户本人真实、可体验产品准备事实字段/媒体manifest/人工检查表，由真实个人账号人工draft/schedule；不生成AI comment/reply，不索票、不激励、不协调投票、不用bot，不拿vaporware或重复launch测试需求。
- 任一发布都绑定独立Probe hypothesis、真实audience、truthful offer、可履约性、revision、approval、receipt、metrics与reconcile；平台rank不是因果指标。

## 7. 验证阶梯

1. Evidence review：API、Responsible Builder/API Terms、Product Hunt API商业条件/Terms、community rules、schema与删除；
2. Static contract：Reddit无approval与Product Hunt无商业批准/schema artifact时都不能生成PortBinding；
3. Fixture conformance：异构schema、MoreComments、Product↔multi-launch、actor roles、selection/rank、deleted/removed、external artifact；
4. Negative conformance：无cross-platform identity、无计数相加、无profile/voter graph、无MCP/HTML/cookie fallback、无AI comments/platform writes；
5. Sandbox live：当前不允许；未来按member独立授权，Product Hunt manual Probe也只做人工流程验收；
6. Operational canary：成员独立SLO、rate budget、deletion reconciliation和policy expiry，不做cross-member failover。

## 8. 可观测性

- member approval/evidence/schema valid window、policy review backlog、blocked/missing-member age；
- Reddit subreddit/rules/flair/query/sort/cursor/tree/MoreComments/rate/deletion与zero-profile/write；
- Product Hunt schema/query hash、Post↔Product mapping、topic/selection/rank/featured/promotion、cursor/coverage/rate/removed与zero-user/voter/write；
- source representation/actor role/relation/measure definition冲突；
- dynamic view definition/build watermark/stale age/tombstone propagation；
- cross-member identity、count、rights和external-artifact leakage rejection；
- Product Hunt manual Probe approval/receipt、no-AI-comment与no-vote-manipulation conformance age。

## 9. 成员 Pack

- [Reddit Public Discussion Platform Pack](./REDDIT_PUBLIC_DISCUSSION_PLATFORM_PACK_DESIGN.md)
- [Product Hunt Product Launch Platform Pack](./PRODUCT_HUNT_PRODUCT_LAUNCH_PLATFORM_PACK_DESIGN.md)
