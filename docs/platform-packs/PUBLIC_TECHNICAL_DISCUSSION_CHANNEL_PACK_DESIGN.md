# Public Technical Discussions / Problem Solving Channel Pack（设计）

检查日期：2026-08-26
Pack：`public-technical-discussions/v0.2-design`（supersedes `v0.1-design`）
状态：`researched / all-members-adoption-gated / no-callable-roster`

## 1. Channel 目标

该 Channel 用来研究公开技术问题中的问题陈述、失败尝试、workaround、替代方案、反例和采用阻力。它组合四个独立成员：

1. `stackexchange-public-qa/v0-design`：结构化 Q&A、回答、评论、修订、接受与迁移；
2. `hacker-news-public-discussion/v0-design`：Ask/Show/story/job/poll、评论树、排行 snapshot 与外链 descriptor；
3. `zhihu-open-search/v0-design`：知乎问题/回答/文章的provider-selected搜索摘要、精选评论片段、query placement与source URL；
4. `v2ex-node-discussion/v0-design`：V2EX Node/Topic/Reply、hot/latest榜单placement和可变的独占容器membership。

四个成员当前都没有可调用 route：Stack Exchange 对本系统长期 AI 辅助采集/索引用途需事先书面同意；Hacker News 的 API 可用性与 YC Terms/内容再利用边界尚无足够明确的书面 carve-out；知乎虽已提供面向AI的官方REST/Skill/MCP/CLI，但目标主体/用途的长期保存、索引、训练、再分发和删除合同仍不完整；V2EX的旧API公平使用规则与v2 Beta页面也没有明确覆盖本系统的产品研究、数仓、索引和AI派生用途。Channel Pack 不会以第三方 search、MCP、Skill、CLI、HTML或另一成员替换被合同/政策阻止的成员。

## 2. 共同抽象与不可合并语义

共同来源表示为 `PublicDiscussionDefinitionMetadata -> PublicDiscussionRecordMetadata -> PublicDiscussionSpanMetadata`：

- Definition 固定 host/network/community/surface、native taxonomy、container、ordering/ranking、answer/acceptance、moderation、selection、attribution、data-use、retention/deletion 和 valid window；
- Record 区分 root/question/article/story、answer、comment/reply、poll option、revision/timeline/moderation/engagement；Representation再区分canonical record、search summary、selected excerpt与ranking snapshot；
- State 同时保存 native state、participation open、visible、answered、accepted response，拒绝单一线性状态；
- Relation 只接受 exact parent/root/answer/accepted/link/related/duplicate/migration/poll-option/external-artifact；
- Container membership区分community/node/board/category与free-form tag，并保存有效期；子record不自动继承root container；
- Placement固定exact query/list、delivery context、search request/hash、selection、position和provider score refs；rank/authority只在本成员、本query/list、本时间有意义；
- Span 固定 thread/record/content revision 与 title/root body/answer/comment/reply 等 role。

以下不可合并：

| Stack Exchange | Hacker News | 知乎开放搜索 | V2EX | Channel处理 |
| --- | --- | --- | --- | --- |
| question/answer/accepted answer | story/comment tree，无accepted answer | question/answer/article搜索摘要，无acceptance | Topic/Reply；官方页未固定reply tree/acceptance | 只在exact provider relation下保留acceptance；article独立thread kind |
| site + tag taxonomy | Ask/Show/ranking list taxonomy | query portfolio + ContentType + authority/rank context | 独占且可移动的Node container | 保留成员taxonomy/selection；Node不是tag，不建全局authority等级 |
| page/filter/has_more | finite ranking snapshot + graph traversal | max10、当前HasMore固定false的provider selection | hot/latest snapshot；v2 page无公开page size/终止契约 | 分别计算coverage；无分页或空页不等于完整 |
| canonical body/revision/timeline与revision license | item snapshot；无等价完整revision链 | ContentText摘要与selected comment excerpt | Topic/Reply current representation；无公开revision history contract | representation/history/license不互相补齐，摘要不冒充原文 |
| linked/related/migration | external URL、parent/kids | source URL；answer parent可能未返回 | Node move无通知；Reply parent schema不臆造 | relation/container/rights各自固定，不用标题/URL猜关系 |
| quota/backoff | 文档称API无rate limit | Access Secret/邀测额度，REST/Skill HasMore冲突 | legacy 120与v2正文600/header示例120冲突；PAT lifecycle | route budget、schema conflict和credential scope不跨成员平均 |

HN 外链 story 的文章正文不是 HN authored content；Stack Exchange accepted answer也不是“已验证解决方案”；知乎authority level/ranking score不是作者专业性、事实正确性或需求规模。

## 3. Channel Scope 与成员成熟度

```text
ChannelScope revision
  query/problem portfolio revision
  member roster:
    - Stack Exchange site + tag/search definition + policy decision
    - Hacker News list/thread definition + policy decision
    - Zhihu query portfolio + search representation + contract decision
    - V2EX node/list portfolio + legacy/v2 access profile + purpose decision
  common PublicDiscussion projection revision
  member-specific selection and coverage
  identity/rights/retention/deletion policy
  dedupe and corroboration policy
```

Channel coverage 必须报告 `requested / eligible / bound / observed / contract-gated / purpose-gated / policy-blocked / failed` 成员数。本revision的`eligible=0`、`contract-gated=1`、`purpose-gated=1`、`policy-blocked=2`；这不是空结果，而是明确的missing-member report。知乎或V2EX的technical API maturity不能提高Channel的callable maturity。

## 4. 动态物化视图

Versioned Observation 与 EvidenceSpan 保持 append/correction/tombstone；可按任务建立可丢弃、可重建的动态物化视图：

- `problem-statements-by-technology`
- `failed-attempts-and-workarounds`
- `accepted-response-context`（仅 Stack Exchange exact acceptance）
- `unresolved-evidence-gaps`
- `technology-switching-candidates`
- `provider-selected-chinese-problem-summaries`（仅在知乎exact contract允许时）
- `node-scoped-chinese-developer-frictions`（仅在V2EX exact purpose与route允许时）
- `cross-channel-corroboration-candidates`

视图定义固定 query、member scope、taxonomy mapping、author-role filter、time window、dedupe revision、model/version、build watermark 和 evidence expiry。视图不能把 Platform Pack 的 policy-blocked 状态变成可读数据源，也不能永久复制未经许可的正文。

## 5. 证据与推断边界

不新增 `EvidencePublicDiscussion`。`PublicDiscussion*` 只描述来源 representation；只有人工或受控模型 review 后的 authored span 才进入既有 complaint、failed-attempt、workaround、urgency、switching 等 evidence type。

- score、rank、authority、view、vote/answer/comment/descendant count不等于独立需求人数；
- accepted answer 不等于正确、采用、长期满意或市场可行；
- search summary、selected comment excerpt不等于完整原文或完整讨论；
- closed/dead/deleted 不等于问题已解决；
- 同文、同 URL、同技术 tag 不建立跨平台身份或重复关系；
- 同一人跨站点不做身份拼接；
- 跨成员数量不能直接相加，除非有 exact overlap ledger 与兼容 sampling definition。

## 6. Probe 边界

Channel 本身没有 write route。读取公开讨论不授权 question/story/comment/reply/vote/accept/flag/edit/delete。

- Stack Exchange 的任何写入都需独立平台能力、用途政策、真实相关性、人工 owner、通知/频率和 reconciliation；当前 Pack 全部拒绝。
- HN Guidelines 禁止 generated 或 AI-edited text，并反对主要推广和索票；本系统不能生成 HN Probe 文案后用 manual handoff 绕过。
- 知乎open search read不授权问题/回答/文章/评论/赞同；official media uploader、CLI知识库upload或community browser MCP不能补齐write。
- V2EX read不授权topic/reply；没有公开create API，community rules又约束AI-generated content、推广与链接spam；sandbox/create/promotions Node都不能变成Agent Probe捷径。
- synthetic account、MCP、Skill 或第三方 CLI 不能作为 conformance Probe。

## 7. 验证阶梯

1. Evidence review：官方 API、Terms/AUP/Guidelines、内容许可、删除与归因边界；
2. Static contract：四个成员都不得产生PortBinding；分别保留Stack Exchange/HN的`policy-blocked`、知乎的`contract-gated`和V2EX的`purpose-gated` decision；
3. Fixture conformance：Q&A acceptance、HN ranking/tree、知乎search-summary/selected-excerpt/query placement/HasMore conflict、V2EX Node membership/list placement/pagination/rate conflict、revision/history、dead/deleted、external artifact、member coverage；
4. Negative conformance：无跨平台身份、无count/rank/authority aggregation、无Node/tag混淆、无MCP/Algolia/HTML/private API/cross-member fallback、无平台write；
5. Sandbox live：当前不允许；只有成员 policy decision 由新证据提升后，才按成员单独授权；
6. Operational canary：未来也按成员独立执行、限流和对账，不做 cross-member failover。

## 8. 可观测性

即使当前无网络 route，也观测知识与政策漂移：

- member evidence expiry、Terms/AUP/Guidelines/license drift、policy review backlog；
- member maturity、blocked reason、missing-member age、无意生成 binding 的 violation；
- taxonomy/selection/ranking/acceptance/moderation definition drift；
- fixture 的record-role/relation/state/representation/placement/coverage conflict；
- 知乎REST/Skill/MCP/CLI schema、artifact hash、contract和credential scope drift；
- V2EX Beta/API/rate/PAT、Node/community rules、purpose decision与OSS security finding drift；
- dynamic view 的 definition revision、build watermark、stale age 与 tombstone propagation；
- cross-member identity/count/rights leakage rejection；
- zero-write 与 no-fallback conformance age。

## 9. 成员 Pack

- [Stack Exchange Public Q&A Platform Pack](./STACK_EXCHANGE_PUBLIC_QA_PLATFORM_PACK_DESIGN.md)
- [Hacker News Public Discussion Platform Pack](./HACKER_NEWS_PUBLIC_DISCUSSION_PLATFORM_PACK_DESIGN.md)
- [知乎开放搜索 Platform Pack](./ZHIHU_OPEN_SEARCH_PLATFORM_PACK_DESIGN.md)
- [V2EX Node Discussion Platform Pack](./V2EX_NODE_DISCUSSION_PLATFORM_PACK_DESIGN.md)
