# Google Play Developer Reviews Platform Pack 设计

状态：`researched` 设计候选；未发布、未调用 API、未回复评论、未下载报告  
核验日期：2026-08-26  
Pack ref：`google-play-owned-app-reviews/v0-design`

## 1. 定位与边界

本 Pack 覆盖用户有 Play Console 权限的生产 app 评论。Reply to Reviews API 支持 list/get/reply，但列表只返回生产版本、含文字且在最近一周新建或修改的评论；无文字星级、alpha/beta 反馈不在 API 中：[Reply to Reviews](https://developers.google.com/android-publisher/reply-to-reviews)。历史评论可从 Play Console 的月度 Reviews CSV 或账号私有 Cloud Storage report bucket 获取：[Download and export monthly reports](https://support.google.com/googleplay/android-developer/answer/6135870)。

它不覆盖任意竞品、全部星级、测试轨反馈、崩溃/ANR 或客服工单。

```text
platform             google-play-developer
surface              owned production app reviews
state                researched
verified level       evidence-review design only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `google-play.application/v1` | entity | package name | Play Console 中的 app；本 API 没有因此获得任意 package 的访问权 |
| `google-play.review/v1` | mutable entity | package name + `reviewId` | 一个用户对一个 app 的当前 review thread；API 暴露 authorName 和 comments |
| `google-play.user-comment/v1` | mutable value/entity | review + user comment position/type | text、lastModified、starRating 及可选 language/device/version/feedback counts |
| `google-play.developer-comment/v1` | mutable public entity | review + developer comment | 当前公开回复；reply 会创建或更新它 |
| `google-play.review-report/v1` | monthly authorized export | package + YYYYMM report object | 月度 CSV，包含 submit/update、title/text、reply 和 review link |
| `google-play.rating-only/v1` | aggregate/event | provider-defined | 无文字评分不从 Reply to Reviews API 返回；不可用 review list 代替 |

### 2.1 原生差异必须保留

- `Review.comments` 是 user/developer conversation union，不是普通评论数组；title/body 在 API text 中可能以 tab 拼接，CSV 则分列。
- API list 第一条是最近创建或修改的 user comment，且只覆盖最近一周变更。分页完成只表示这一周 API population 完成。
- `translationLanguage` 会让 `text` 变成翻译、`originalText` 保存原文。默认不请求翻译；如请求，必须把表示标为 provider projection，并保留 originalText。
- device、OS、app version 和 thumbs counts 是可选情境字段，不是稳定用户身份；`authorName` 默认不进分析 projection。
- API current review 与月度 CSV 是两个 representation/access method；可关联但不能假设字段、延迟或历史覆盖相同。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access | Adoption | 说明 |
| --- | --- | --- | --- | --- |
| `feedback.list.recent-owned-app-reviews/v1` | owned package → recent modified written reviews | owned official API | `eligible` | 最近一周、production、commented reviews；最多 100/page |
| `feedback.read.owned-app-review/v1` | package + reviewId → current review | owned official API | `eligible` | reviewId 必须由已授权 surface/roster 获得 |
| `feedback.import.owned-app-review-history/v1` | private monthly reports → review observations | authorized export/GCS | `manual-only` initially | 解决 recent-only 缺口；先以用户选择 CSV fixture 建模 |
| `feedback.observe.owned-app-review-changes/v1` | repeated API/report revisions → observed changes | derived | `eligible` | 保存 source lastModified 与 representation lineage |
| `engagement.reply.owned-app-review/v1` | review + reply → public developer comment | authorized platform write | `deferred` | 客服动作，不是 Probe；Google 不鼓励先自动回复再人工修改 |
| `feedback.read.test-track-reviews/v1` | alpha/beta app → feedback | Play Console surface | `manual-only` | 官方说明 API 不返回，不能伪造 API route |
| `feedback.read.rating-only/v1` | owned app → rating-only feedback | separate reports/Console | `deferred` | 无文字评分不在本 API；另建 aggregate capability |
| `feedback.read.competitor-app-reviews/v1` | arbitrary package → reviews | public store surface | `rejected` in this Pack | 官方 Developer API 是 owned access，不扩展为竞品采集 |

## 4. Access Methods

### 4.1 `google-play-reply-to-reviews-read/v1`

- mode：`official-api`；access class：`owned`；本 Pack effect：`none/local-write`；
- auth：OAuth client 或安全服务器中的 service account，Play Console 必须赋予目标 app 的 `Reply to reviews` permission；调用使用 `androidpublisher` scope：[Getting Started](https://developers.google.com/android-publisher/getting_started)、[reviews.list](https://developers.google.com/android-publisher/api-ref/rest/v3/reviews/list)；
- list：`GET /androidpublisher/v3/applications/{packageName}/reviews`，默认 10、最大 100/page，使用 `nextPageToken`；
- get：已知 `reviewId` 的单条 current review；
- coverage：仅 production + written comment + last-week created/modified；无文字 rating、alpha/beta 和更旧未修改 review 明确排除；
- quotas：每 app GET 200/hour，POST 2000/day；本 Pack不使用 POST，429 不切换账号或无限重试；
- translation：默认关闭；启用时同时保存 `originalText` 并记录 `translationLanguage`/known loss。

### 4.2 `google-play-monthly-review-report/v1`

- mode：`authorized-export`；本轮 adoption 为 `manual-only`；
- source：用户选择 Play Console Reviews CSV，未来才评估私有 GCS bucket programmatic read；
- cadence：数据每日捕获，月度 CSV 通常延迟 3–7 天；不能用于实时告警；
- format：UTF-16 CSV，含 package、version、language、device、submit/update timestamps、rating、title/text、developer reply 与 review link；字段数不可作为固定 contract，按 header/schema version 解析；
- completion：固定 package + month + export object；缺月、延迟文件或权限错误必须显式 unknown。

## 5. Platform Skills

### `google-play-owned-reviews-pack-research/v1`

- purpose：`research/curate`；核验官方 guide、REST discovery/schema、permissions、quota、report schema 和 deprecations；
- 只输出 evidence-bound proposal；禁止创建 service account、调用 API、访问 bucket 或运行 client library。

### `google-play-owned-review-demand/v1`

- purpose：`acquire`；输入固定 pack、package roster 和时间窗；
- allowlist：recent list/get，以及经用户选择的 monthly CSV preview/import；
- 输出：原生 Observations、API/report representation、package/window CoverageAssessment 和去身份化 projection；
- 禁止：reply、自动 translation、竞品 package、authorName 索引、把一周窗口声称为历史全量。

### `google-play-owned-reviews-conformance/v1`

- purpose：`verify/diagnose`；fixture 默认无网络；
- 验证 token pagination、recent-only boundary、comment union、translation dual text、CSV header drift、representation join、权限与 quota；
- sandbox 只在用户另行授权后对一个自有 production app 做 read-only API；不写 reply、不下载未批准 bucket。

本 Pack 不定义 Probe Skill。官方明确说回复会通知用户、公开展示，不鼓励先自动回复再人工修改；它属于独立客服治理域。

## 6. 数据治理

- API 与 CSV 都映射 `ProductFeedback*`，但保持不同 `SourceRepresentationMetadata` 与 coverage：含文字的 userComment 为 `ReviewRecord`，无文字 rating 不因 CSV 汇总而伪造 review，developerComment 为独立 `DeveloperReplyRecord` + exact `ReplyToRelation`；package/versionCode/versionName 只在官方字段证据下建立 product-version relation。该映射不扩大 Developer API 的 owned package authorization，也不让 recent API 冒充历史 population。
- 最小 projection：store、roster app、review ID、rating、original title/body、reviewer language、app version、source lastModified、observedAt、developer reply present/modified；authorName、device codename 和完整 device metadata 默认删除。
- device/OS 可用于版本回归聚合，但需最小样本阈值，禁止组合成单用户 fingerprint。
- 公开 developer reply 不得包含敏感用户信息；采集系统不生成回复文本。
- API 与 report 都保留 source representation。只有 `package + reviewId` 有充分证据时才关联；CSV 缺稳定 ID 时不得靠 author/text 模糊合并。
- API 一周窗口中未出现旧 review 不表示删除；授权失败、窗口滑动和 report 延迟都不能产生 tombstone。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 固定；未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [googleapis/google-api-java-client-services](https://github.com/googleapis/google-api-java-client-services/tree/e099d7f4e80db4dcde43de5fdeb38120cc4f6f2c) `e099d7f4e80db4dcde43de5fdeb38120cc4f6f2c` | Google 官方 generated services；Apache-2.0 | Android Publisher v3 resource/model 与 discovery drift evidence | `official-reference`；生成 client 不是 domain adapter |
| [googleapis/google-api-go-client](https://github.com/googleapis/google-api-go-client/tree/0e513f755761be9adb93856a3fff5daae65c468d) `0e513f755761be9adb93856a3fff5daae65c468d` | Google 官方；BSD-3-Clause | Go discovery-generated Android Publisher client、auth/error 参考 | `official-reference`；未来采用仍需 package-size/security review |
| [fastlane/fastlane](https://github.com/fastlane/fastlane/tree/75b41e14dca1064b9dd1f626f6ab99f1dfa918a7) `75b41e14dca1064b9dd1f626f6ab99f1dfa918a7` | community；MIT | 双商店 review/reply 和 credential 生命周期经验 | `reference-only`；不默认执行或内嵌 |
| [JoMingyu/google-play-scraper](https://github.com/JoMingyu/google-play-scraper/tree/ce1df6d67e6d8c39826daac2f668808fc025f284) `ce1df6d67e6d8c39826daac2f668808fc025f284` | community；MIT；非官方 public surface | 竞品 fixture/字段发现 | `discovery-only`；不属于 owned API Pack，不证明合规或稳定性 |

## 8. Verification Plan

### evidence-review / static-contract

- package roster 必须用户/权限证据绑定，不能枚举任意 package；
- API access method 固定 production/commented/recent-week boundary；
- API 与 CSV 的 schemas、latency、representation 和 coverage 分开；
- acquire Skill 不允许 reply port/effect；POST capability 不物化 route；
- authorName/device 不进入默认 projection；credential JSON bytes 不进入 config、日志或 fixture。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| 3-page token list | token 耗尽后只标 recent API population complete |
| user + developer comments | union 顺序/类型保留，reply 不混成第二条用户痛点 |
| title-tab-body | 可逆保存 raw text；derived split 标 mapper version/ambiguity |
| translated review | text/originalText/translationLanguage 同存，projection 默认原文 |
| optional device/version fields | 缺失保持 unknown，存在时经过最小化 |
| updated same reviewId | 生成 observed snapshot，不覆盖旧 observation |
| monthly UTF-16 CSV + extra column | header 驱动解析，未知列进入 schema-bound extension |
| missing month/3–7 day lag | coverage 为 unknown/delayed，不记 empty |
| 401/403/429 | 正确分类，不换 credential 绕过配额 |
| reply fixture | policy/static gate 拒绝，无 POST |

### sandbox-live / operational-canary

需用户另行授权后，才可用最小权限 service account/OAuth 对一个自有 production package 做 read-only list/get sandbox；如果无近期文字评论，结果只能证明授权和 empty-window，不能证明 parser 完整。历史 CSV 由用户显式选择后另做离线验证。canary 监测 discovery/schema、权限、quota、recent-window lag 和 report header drift，不发送回复。

## 9. 晋级缺口

从 `researched` 到 `modeled` 需要 accepted snapshot、API/CSV normative schemas、package roster、retention 和 join policy；从 `modeled` 到 `verified` 需要 fixture report，并经用户授权完成有限 read-only sandbox。当前没有任何平台调用或 callable route。
