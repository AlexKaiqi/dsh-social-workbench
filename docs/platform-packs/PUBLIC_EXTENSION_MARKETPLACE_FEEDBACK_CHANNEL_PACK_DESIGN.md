# Public Extension Marketplace Feedback Channel Pack 设计

状态：`researched`；1 个 fixture-eligible member，0 个 callable member  
核验日期：2026-08-26  
Channel Pack ref：`public-extension-marketplace-feedback/v0-design`

## 1. 研究目标与成员状态

本 Channel 用于发现浏览器/IDE/软件扩展在实际采用后的版本兼容问题、缺失功能、升级回归和迁移原因。它版本化的是研究目的、候选 roster 与 missing-member coverage，不制造通用 marketplace API。

| Candidate | Pack/contract | 状态 | 当前 coverage |
| --- | --- | --- | --- |
| Mozilla AMO | [Mozilla AMO Public Feedback Pack](MOZILLA_AMO_PUBLIC_FEEDBACK_PLATFORM_PACK_DESIGN.md) | `fixture-eligible / no route` | official frozen v4 public add-on/rating design；live 未授权 |
| Chrome Web Store | official CWS API v2 | `unsupported` | developer-owned item management only；public review read missing |
| JetBrains Marketplace | official API + public web reviews | `manual/policy-gated` | documented review API missing；不启用 HTML fallback |

requested member count 为 3；fixture-eligible 为 1；callable 为 0；unsupported 为 1；manual/policy-gated 为 1。Channel 健康必须同时显示这些分母，不能把 AMO 成功投影成三市场 coverage。

## 2. Channel 与 Owned App Reviews 的边界

两类 Channel 都映射 `ProductFeedback*`，但 roster 与 access 不合并：

- Owned App Reviews：用户能证明 ownership/authorization 的 Apple/Google app；成员 API/exports 与账号权限；
- Public Extension Marketplace Feedback：用户不控制的公开产品也可成为研究对象，但每个市场必须有独立 public-read contract 与 reuse decision；
- 同名 app/extension/plugin 不自动成为同一 ProductRef；跨市场只允许人工 evidence 支持的 relation candidate；
- review ID、rating scale、版本格式、moderation、latest/resolved/aggregate semantics 与 population 都按成员保存；
- owned developer reply 与公开评论 reply 都不是需求 Probe，也不进入 Channel write surface。

## 3. Projection 与动态物化视图

Channel projection 只要求：member/Pack/definition/representation、product/version/record refs、record kind、rating ref、review/reply span refs、source/observed times、state/history/coverage、rights/minimization 与 evidence lineage。

索引器可按固定 definition revision 动态物化：

- `post-adoption-frictions-by-product-version`：按 exact product version 聚合 reviewed complaint/workaround spans；
- `compatibility-regression-candidates`：新版本窗口相对旧版本的主题变化，带缺失版本率与 coverage；
- `unresolved-review-claims`：仅表示未观察到 exact resolution relation，不把缺 reply 当未解决事实；
- `switching-and-migration-candidates`：来自明确 authored span，不由低评分、排名或下载量推断；
- `missing-marketplace-members`：展示 unsupported/manual/policy/rights/route/schema gap。

这些视图可重建、带 definition/index revision 和 watermark，不写回 snapshot 知识。不同 rating scale、selection/population 或 license 的成员默认不生成跨市场总分、平均星级、总评论数或市场份额。

## 4. Channel Skills

### `extension-marketplace-roster-research/v1`

研究平台/API/政策/许可/开源/Agent Skill，输出候选/member gap proposal；不能网络采集平台数据、安装候选或注册 route。

### `extension-marketplace-feedback-research/v1`

未来只调度各成员已经 verified 且被用户批准的 read capability。当前必须返回 AMO `no-authorized-binding`、Chrome `unsupported`、JetBrains `manual/policy-gated` 的逐成员 report；不能用一个成员、HTML、browser、MCP、Skill 或 scraper 替代另一个成员。

### `extension-marketplace-feedback-conformance/v1`

验证成员独立 product/version/review/reply/aggregate/latest mapping、rating-only、history/coverage、license/attribution、identity drop、partial degradation、no-fallback 与 zero-write。

Channel 没有 Probe Skill。评论、评分、开发者回复、vote、flag、report 与 rating solicitation 都是拒绝的外部副作用。

## 5. Fixture 与可观测性

除 AMO Pack fixtures 外，Channel fixture 必须覆盖：

| Scenario | 结果 |
| --- | --- |
| AMO fixture succeeds, other members missing | Channel partial；requested=3、fixture=1、callable=0 保持可见 |
| same extension name across markets | 不 merge；仅生成待人工证据 relation candidate |
| rating scales/provider aggregates differ | 不算跨市场平均或总量 |
| one member rights becomes blocked | 该成员 quarantine；其他成员结果不删除、不代替 |
| HTML/MCP/Skill/browser fallback request | policy rejection + missing-member report |
| reviewer identities look similar | 不关联、不保存 AMO profile fields |
| write/probe request | effect policy 拒绝，zero-write telemetry 成立 |

观测按 `channel revision × member × Pack definition × representation × capability × route` 分层。必须记录 expected/eligible/callable/succeeded/failed/blocked/unsupported/manual counts、population/history/rights coverage、schema/license drift、identity-drop failures、quarantine reason 与 last verified time。健康报告不能只显示“Channel success”。

## 6. 晋级规则

本 Channel 只有在至少一个成员完成 fixture conformance 后才能成为 `modeled-partial`；只有成员各自经用户授权完成 read-only sandbox 才增加 callable coverage。Chrome/JetBrains 的 missing 状态只有新的官方 review read contract 与 rights evidence 才能改变，不能由网页可见性或社区实现改变。任何成员 write 永不随 read 晋级自动开放。
