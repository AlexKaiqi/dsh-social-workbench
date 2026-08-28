# Apple App Store Connect Reviews Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未创建或修改回复  
核验日期：2026-08-26  
Pack ref：`apple-owned-app-reviews/v0-design`

## 1. 定位与边界

本 Pack 只覆盖开发者在 App Store Connect 中有权访问的自有 app 书面评论。Apple 的 Customer Reviews API 可按 app 或 App Store version 列举评论、按 territory/rating 过滤、按日期或评分排序并读取单条评论；Customer Review Responses API 可读取、创建、替换和删除开发者公开回复：[Customer Reviews](https://developer.apple.com/documentation/appstoreconnectapi/customer-reviews)、[Customer Review Responses](https://developer.apple.com/documentation/appstoreconnectapi/customer-review-responses)。

它不覆盖任意竞品评论、所有评分、安装用户、客服工单或 App Analytics。公开产品页可见评论不等于 App Store Connect API 授权可扩展到其他开发者的 app。

```text
platform             apple-app-store-connect
surface              owned app customer reviews
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `apple.app/v1` | entity | App Store Connect app resource ID | 开发者账号可访问的 app；不是 bundle ID 或公开 store ID 的同义词 |
| `apple.app-store-version/v1` | entity | App Store version resource ID | 评论可按特定版本关系读取；不把营销版本字符串当资源 ID |
| `apple.customer-review/v1` | mutable entity | customer review resource ID | 当前评分与书面评论；用户修改后当前提交替换旧提交 |
| `apple.review-territory/v1` | value | territory code | 与首次购买所在地关联，不推断当前居住地或国籍 |
| `apple.customer-review-response/v1` | mutable public entity | response resource ID | 每条评论最多一个公开回复；可替换或删除，并带 state/lastModifiedDate |
| `apple.overview-rating/v1` | aggregate | app + country/region + rating window | 产品页聚合评分，可随新版本 reset；不是 customer review 列表的合计 |
| `apple.review-summarization/v1` | derived provider projection | app + territory | Apple 生成的评论摘要；不是原始用户证据或完整 coverage |

主要关系：

```text
app ── has-version ──> app-store-version
app / app-store-version ── exposes-current ──> customer-review
customer-review ── associated-with ──> review-territory
customer-review ── has-at-most-one ──> customer-review-response
```

### 2.1 原生差异必须保留

- 用户可修改评分或评论；Apple 说明新提交替换此前提交，因此 API 当前值不是完整编辑历史：[Ratings and reviews overview](https://developer.apple.com/help/app-store-connect/monitor-ratings-and-reviews/ratings-and-reviews-overview)。重复观察只能形成 `observed-snapshot` lineage，history 标为 `latest-exposed-only` 或 `unknown`。
- `createdDate`、response `lastModifiedDate` 与 collector `observedAt` 分开保存；不能用第一次采集时间伪造首次评论时间。
- overview rating、written review 与 AI summarization 是三个对象；“列完评论”不能声称覆盖所有评分或所有用户体验。
- `reviewerNickname` 不是需求分析必需身份。原始 evidence 可受限保存，默认 projection 删除，禁止跨平台拼接用户画像。
- territory 是首次购买关联地区，只作平台 facet，不推断真实位置。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `taxonomy.list.owned-apps/v1` | account grant → accessible app refs | owned official API | `eligible` | 只用于建立候选 roster；team key 跨全部 apps 的权限风险需显式呈现 |
| `feedback.list.owned-app-reviews/v1` | owned app/version → current review refs | owned official API | `eligible` | 可分页、过滤和排序；不等于所有 ratings |
| `feedback.read.owned-app-review/v1` | review ref → current review revision | owned official API | `eligible` | 保存原生 ID、rating/title/body/date/territory 与 response relationship |
| `feedback.observe.owned-app-review-changes/v1` | repeated snapshots → observed changes | derived pull | `eligible` | 只能证明系统观察到的修改，不能补出采集前历史 |
| `feedback.read.provider-review-summary/v1` | owned app + territory → Apple summary | owned official API | `deferred` | 作为 provider projection 单独评估，不可替代原始评论或本地分析 |
| `feedback.read.overview-rating/v1` | owned app + territory → aggregate rating | App Store Connect product surface | `deferred` | 本轮未建立独立官方 API contract；不得由 review list 反推 |
| `engagement.reply.owned-app-review/v1` | review + reply → public response | authorized platform write | `deferred` | 是客服动作，不是需求 Probe；需独立 support workflow、批准和对账 |
| `engagement.delete.owned-app-review-response/v1` | response → deleted public response | authorized platform write | `deferred` | 删除也是外部副作用，不能由采集 Skill 暴露 |
| `feedback.read.competitor-app-reviews/v1` | arbitrary app → reviews | public product pages | `rejected` in this Pack | 官方 owned API 不授予竞品读取能力；另建 manual/rights-reviewed Pack |

## 4. Access Method

### `app-store-connect-customer-reviews/v1`

- mode：`official-api`；access class：`owned`；effect：本 Pack 只允许 `none/local-write`；
- auth：App Store Connect API key 签发 JWT。team key 的角色作用于账号全部 apps，individual key 继承用户 app access；私钥只放 credential store，不进入 Pack、日志或 fixture：[Creating API Keys](https://developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api)；
- endpoint：`GET /v1/apps/{id}/customerReviews`、按 app store version 列举及单条 review read；列表 limit 最大 200，可按 rating/territory 过滤并按 rating/createdDate 排序：[List all customer reviews for an app](https://developer.apple.com/documentation/appstoreconnectapi/get-v1-apps-_id_-customerreviews)；
- pagination：只跟随响应 links/cursor 至终点；单页成功不代表完成；
- rate：读取每个响应的 `X-Rate-Limit`；limit 按同一 API key 的 rolling hour 计算且实际值可变，429 必须等待而非并发换 key：[Identifying Rate Limits](https://developer.apple.com/documentation/appstoreconnectapi/identifying-rate-limits)；
- completion：仅对“固定 roster 中一个 app、所选 filter、当前 API 暴露的 written reviews”声明完成；不扩大为所有 ratings、历史 edits 或用户总体。

API 总览明确提醒写调用改变生产数据，因此同一 JWT 技术上能写不代表读取 route 获准写：[App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi/)。

## 5. Platform Skills

### `apple-owned-reviews-pack-research/v1`

- purpose：`research/curate`；
- 核验官方 docs、OpenAPI、roles、rate header、review/response schema 和 release notes；
- 只生成 EvidenceLink/KnowledgeProposal；禁止创建 key、调用 API 或执行外部 SDK。

### `apple-owned-app-review-demand/v1`

- purpose：`acquire`；
- 输入：固定 knowledge snapshot、用户确认的 app roster、过滤器和时间窗；
- allowlist：owned app list、review list/read 与 repeated-snapshot change observation；
- 输出：原生 Observation、app-scoped CoverageAssessment 与去身份化 projection；
- 禁止：读取竞品、保留 nickname 到分析索引、生成/修改/删除回复、把 summary 当原始事实。

### `apple-owned-reviews-conformance/v1`

- purpose：`verify/diagnose`；fixture 默认无网络；
- 验证 JSON:API pagination/relationships、app/version identity、review edit snapshot、response state、429 和权限拒绝；
- sandbox 只在用户另行授权且使用专用最小权限 individual key 后运行 read-only 场景。

本 Pack 不定义 Probe Skill。回复真实用户不是市场需求实验，且会公开展示并通知用户。

## 6. 数据治理

- 来源 representation 统一映射 `ProductFeedback*`：Customer Review 为 `ReviewRecord`，无正文的 overview rating 只能作为独立 `AggregateRatingRecord`，Customer Review Response 为 `DeveloperReplyRecord` + exact `ReplyToRelation`，Apple summarization 为 `ProviderSummaryRecord`。app/version/review/response 原生 ID 与 observed revision 分别保留；该映射不扩大 App Store Connect 的 owned authorization。
- 最小公共 projection：store、roster app ref、native review ID、rating、title/body、territory、app version ref、source created/modified、observedAt、developer-response-present/state；nickname 默认删除。
- review 文本可含个人信息、账号问题或敏感健康/财务描述；raw blob 受限、短 retention，索引前运行最小化/安全分类，引用只保留必要 EvidenceSpan。
- developer response 虽公开，也不能用于推断 reviewer 已解决、留存或付费；用户修改评论只是一条行为信号。
- 删除、隐藏或 provider 不再返回时，至少两次成功完整 snapshot 或 provider 明确信号后才生成 disappearance proposal；授权失败不产生 tombstone。
- team key 无 app isolation；默认设计偏好有 app access 边界的 individual key，并在 ConnectionProfile 显示实际账号、角色与 app roster。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 固定；未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [AvdLee/appstoreconnect-swift-sdk](https://github.com/AvdLee/appstoreconnect-swift-sdk/tree/55fceaba611dcf7f4e7f897addcd8fb90867fa01) `55fceaba611dcf7f4e7f897addcd8fb90867fa01` | community；MIT | Apple OpenAPI 生成、JWT、review/response model 与 tests 的实现参考 | `reference-only`；未来 adapter 仍需独立审计和 sandbox |
| [fastlane/fastlane](https://github.com/fastlane/fastlane/tree/75b41e14dca1064b9dd1f626f6ab99f1dfa918a7) `75b41e14dca1064b9dd1f626f6ab99f1dfa918a7` | community；MIT；非 Apple 官方 | 成熟的双商店账号、评分/评论自动化与失败样本 | `reference-only`；体量和 credential surface 过大，不作为默认内嵌依赖 |
| [facundoolano/app-store-scraper](https://github.com/facundoolano/app-store-scraper/tree/05d59c110240104901fa47622f64a7c6ed841a3b) `05d59c110240104901fa47622f64a7c6ed841a3b` | community；MIT；非官方 public surface | 竞品字段/fixture 发现 | `discovery-only`；不属于本 Pack route，不证明平台允许目标用途 |

Apple 提供可下载 OpenAPI specification，它是 schema evidence；生成 client 仍不等于领域 Connector、权限、coverage 和删除语义已经验证。

## 8. Verification Plan

### evidence-review / static-contract

- owned app 与 arbitrary public app 不能混用；app resource ID、store ID、bundle ID、version ID 分离；
- review、overview rating、summarization 和 developer response 分 concept/schema；
- acquire skill 的 allowed effects 不含 `platform-write`；response capability 不物化 route；
- review edit 只能产生 observed snapshot，history 不得标 complete；
- CoverageAssessment 必须固定 app roster、filter、written-review population 和 exclusions；
- credential schema 只保存 ref，不接收 `.p8` bytes。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| multi-page list + next link | 完整耗尽后才 page-complete，最大 limit 作为 hint 而非总量 |
| app list + app-version list | 相同 review ref 可追溯到正确 surface，不能把版本字符串作 ID |
| territory/rating filters | query boundary 写入 coverage，不能合并为全 app 全量 |
| edited review snapshots | payload hash/revision 变化，旧 observation 保留但 history 为 latest-only |
| included response | response ID/body/state/lastModified 与 review 分对象 |
| nickname/PII payload | raw 受限，projection 删除 nickname 并标最小化结果 |
| 401/403/429 | authorization、scope 与 rate-limit 分类正确，不产生 empty snapshot |
| response create/update/delete fixture | static policy 拒绝 acquire route，零外部执行 |

### sandbox-live / operational-canary

需用户另行授权后，才可对一个自有、低敏 app 做 read-only sandbox，验证角色、分页、filters、rate header 和 response relationship。没有写 sandbox。通过后 canary 只监测 docs/OpenAPI hash、schema、permission、lag、429 与 roster coverage；任何 response write 另行立项。

## 9. 晋级缺口

从 `researched` 到 `modeled` 需要 accepted snapshot、normative schemas、rights/retention、app roster 和 response-write exclusion；从 `modeled` 到 `verified` 需要离线 fixture report，并经用户明确授权完成 read-only sandbox。当前没有 callable route 或 VerificationReport。
