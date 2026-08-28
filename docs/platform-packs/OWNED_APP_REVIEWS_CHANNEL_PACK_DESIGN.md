# Owned App Reviews Channel Pack 设计

状态：`researched` 组合设计；成员 Pack 均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`owned-app-review-demand/v0-design`

## 1. 为什么需要 Channel Pack

Apple 与 Google 都能提供自有 app 的产品后评论，但原生对象、历史窗口、版本、地区、翻译、回复和授权完全不同。Channel Pack 只统一“已使用产品后的痛点分析”研究策略，不制造一个虚构的跨商店 review API。

```text
Apple Customer Reviews ─┐
                         ├─> Owned App Reviews Channel
Google Play Reviews ────┘       ├─ owned app roster
                                 ├─ review-demand projection
                                 ├─ coverage/representation policy
                                 └─ read-only channel skills
```

回复不是本 Channel 的 Probe：它会公开展示、通知真实用户，并可能改变用户后续评论。若未来需要客服回复，应建立独立 `owned-review-support` 工作流，绑定原文 revision、人工批准、public preview、outbox、receipt 和 read-back。

## 2. 成员 Pack

| Member | 原生 surface | 当前状态 | 关键 coverage 边界 |
| --- | --- | --- | --- |
| [Apple App Store Connect Reviews](APPLE_APP_STORE_CONNECT_REVIEWS_PLATFORM_PACK_DESIGN.md) | owned app/version Customer Reviews API | `researched` design | 当前 API 暴露的 written reviews；编辑历史不完整 |
| [Google Play Developer Reviews](GOOGLE_PLAY_DEVELOPER_REVIEWS_PLATFORM_PACK_DESIGN.md) | recent Reply to Reviews API + monthly authorized export | `researched` design | API 仅 production/commented/recent week；CSV 按月且有延迟 |

共同 capability proposal：

- `feedback.read.owned-app-review/v1`
- `feedback.observe.owned-app-review-changes/v1`

provider-specific list/import capability 保持成员原名。Apple summarization、overview rating、Google test-track/rating-only 和两边 reply 不进入共同 allowlist。

## 3. Owned App Roster

每个 research program 固定一个 `ChannelRosterRevision`，不根据名称或 bundle/package 猜测跨商店同一产品：

| 字段 | 作用 |
| --- | --- |
| product subject ref | 可选的用户确认产品主体；不是由名称自动生成 |
| member Platform Pack ref | 固定 Pack revision |
| platform surface | Apple app resource ID/version surface 或 Google package name |
| canonical console/store evidence | 证明该 surface 属于用户有权研究的 app |
| account/connection requirement | 只引用 ConnectionProfile 条件，不保存 credential |
| enabled/valid window | app 转移、下架或账号变更时追加 roster revision |
| expected history method | current API、recent API、monthly export 的计划组合 |

同一产品的 iOS/Android app 可以共享用户确认的 product subject，但原生 review ID 永不合并。没有 ownership/authorization evidence 的竞品 app 不能加入本 roster。

## 4. `owned-app-review-demand` Projection

| 字段 | 来源与规则 |
| --- | --- |
| source platform/pack/representation | 必填；API、CSV、provider projection 分开 |
| product + app roster refs | roster 给出，不从 app 名称推断 |
| native review ref | store + app surface + native review ID；CSV 无可靠 ID 时使用 report-row evidence ref |
| current rating/title/body | 原生值；翻译与原文分字段，title split 保留 mapper version |
| app version | Apple version relationship 或 Google version code/name；缺失为 unknown |
| market/language | Apple territory 与 Google reviewerLanguage 不互相替代 |
| source times | created/submitted、lastModified、developer reply modified 分开 |
| observed/imported time | 每条事实必填，用于 observed snapshot lineage |
| developer response state | present/state/body ref；不把它计作用户痛点 |
| context facets | device/OS 等仅在最小化后用于聚合回归诊断 |
| rights/minimization | owned/authorized basis、retention、nickname/author/device 处理结果 |

### 4.1 关联、去重与版本回归

- canonical source key 只在成员 surface 内定义；绝不跨 Apple/Google 合并 review identity；
- API 与 export 只有具备同平台稳定 review ID/官方 link 证据时才 exact-link，否则产生 relation candidate，不模糊覆盖；
- 同一 review ID 内容变化生成 `RevisionObservedSnapshot`，保留旧 observation；不宣称平台完整 revision history；
- app version 可用于“某版本负面主题上升”的派生分析，但必须同时报告版本字段缺失率、样本量和 coverage window；
- rating 变化、文字变化、developer reply 和 provider disappearance 是不同 event candidate，不用一个 `updated` 吞掉。

## 5. Coverage Policy

```text
response/page or report-object completion
                   ↓
provider population boundary
                   ↓
app roster completion
                   ↓
cross-store research window
```

- Apple page complete：固定 app/version/filter 的 pagination 耗尽；population 仍只含书面评论和 provider 当前暴露历史；
- Google API complete：固定 package 的 recent-week、production、commented population 翻页完成；绝不升级为历史完整；
- Google report complete：固定 package/month 的获批 CSV 成功导入；report 延迟、缺月和字段漂移单列；
- roster complete：所有 enabled app entries 在目标窗口至少有成功或明确 delayed/unsupported assessment；成员失败不被另一个 store 的成功遮蔽；
- channel complete 也只代表用户批准的 app portfolio，不代表竞品、行业、全部 ratings、测试用户或所有使用者。

CoverageAssessment 应按 `store × app surface × representation × window/filter` 保存 population、included/excluded、page completeness、history coverage、minimization counts 和 missing-source reasons。

## 6. Channel Skills

### `owned-app-review-roster-curation/v1`

- purpose：`research/curate`；
- 输入：用户产品列表、console/store evidence、成员 Pack 与当前 roster；
- 输出：新增、转移、停用、connection requirement proposal；
- 禁止：枚举竞品、自动把同名 app 视为同一产品、读取 credential 或调用平台。

### `owned-app-review-demand-research/v1`

- purpose：`acquire`；
- 输入：固定 Channel Pack/成员 snapshots、roster revision、时间窗和研究问题；
- allowlist：成员只读 review list/read/change observation，以及用户选择的 Google monthly CSV import；
- 输出：原生 Observations、逐 representation CoverageAssessment、最小化结果、channel projection 和 version-regression candidates；
- 禁止：reply、rating solicitation、竞品 scraping、客服身份拼接、把 summary/translation 当原文。

### `owned-app-review-channel-conformance/v1`

- purpose：`verify/diagnose`；
- 先分别执行成员 fixture，再验证 roster、representation、projection、coverage、dedupe、minimization 和 partial degradation；
- 成员的 evidence-review/fixture/sandbox report 独立引用，Channel report 不替代它们。

没有 Channel Probe Skill。评论回复、评分提示和商店 metadata 实验属于不同的高影响产品工作流。

## 7. 开源生态快照

| Artifact | Fixed revision | 价值 | 边界 |
| --- | --- | --- | --- |
| [AvdLee/appstoreconnect-swift-sdk](https://github.com/AvdLee/appstoreconnect-swift-sdk/tree/55fceaba611dcf7f4e7f897addcd8fb90867fa01) | `55fceaba611dcf7f4e7f897addcd8fb90867fa01` | Apple OpenAPI/review model 参考 | community MIT；未执行 |
| [googleapis/google-api-java-client-services](https://github.com/googleapis/google-api-java-client-services/tree/e099d7f4e80db4dcde43de5fdeb38120cc4f6f2c) | `e099d7f4e80db4dcde43de5fdeb38120cc4f6f2c` | Google 官方 generated Android Publisher surface | Apache-2.0；client 不等于 Connector |
| [googleapis/google-api-go-client](https://github.com/googleapis/google-api-go-client/tree/0e513f755761be9adb93856a3fff5daae65c468d) | `0e513f755761be9adb93856a3fff5daae65c468d` | Go client/auth/error 参考 | BSD-3-Clause；未执行 |
| [fastlane/fastlane](https://github.com/fastlane/fastlane/tree/75b41e14dca1064b9dd1f626f6ab99f1dfa918a7) | `75b41e14dca1064b9dd1f626f6ab99f1dfa918a7` | 双商店运维、credential/review 自动化经验 | community MIT；大依赖面，reference-only |

竞品 scraper 保留在成员 Pack 的 `discovery-only` 列表，不进入本 Channel runtime 或共同 verification。

## 8. Verification Plan

### static-contract

- Channel member refs、roster surfaces、projection mapping 与 capability allowlist 自洽；
- Apple app ID 与 Google package 永不共用 native key；跨店 product relation 必须有用户 evidence；
- reply capability 不在 Channel Skills、ports 或 allowed effects 中；
- CoverageAssessment 强制带 representation/window/population/history boundary；
- nickname/authorName/device minimization 是可验证输出，不只是文档建议。

### fixture-conformance

| Scenario | 必须证明 |
| --- | --- |
| same product on two stores | product subject 可关联，native review identity 保持独立 |
| Apple current + Google recent API | 共同 projection 可查，coverage 标签不可比较成同一全量 |
| Google API + monthly CSV overlap | exact evidence 才关联；不能 text/author 模糊覆盖 |
| review edited after reply | user revision、reply revision、observedAt 分开 |
| missing version/device/territory | unknown 保留，mapper 不补默认值 |
| one member authorization failure | channel partial/degraded，另一成员结果仍可用但不掩盖缺口 |
| PII-rich review | raw restricted、projection minimized、日志/fixture 无真实身份 |
| attempted reply request | Channel policy 拒绝，零 platform-write |

### sandbox-live / operational-canary

必须先有两个成员各自 read-only sandbox report，才能运行组合 sandbox；不要求同时存在新评论，也不发送回复。canary 分成员监测官方 docs/schema、权限、pagination、quota、report delay 和 minimization drift，再计算 roster/channel health。单一综合 success rate 不得隐藏某 store 失效。

## 9. 对现有抽象的修订结论

最初只审视两个 owned member 时，通用 revision/representation/coverage 足以防止把 current API、recent API 与 CSV 冒充完整历史；但公开扩展市场研究暴露了跨 owned/public surface 重复且稳定的结构：rating-only 与 written review 不同，latest projection 与 canonical history 不同，review/reply/aggregate/moderation 是不同 record，产品版本与 reply 是 exact relation，visible/latest/resolved/affects-aggregate 是正交状态。因此现已新增 `ProductFeedbackDefinitionMetadata`、`ProductFeedbackRecordMetadata` 与 `ProductFeedbackSpanMetadata`。

修订后的边界是：

- `ProductFeedback*` 统一来源 representation，不统一 access、rights、roster、rating scale、population 或许可；
- 本 Channel 仍用 `ChannelRosterRevision` 限定用户有权研究的自有 app；公开 AMO、Chrome、JetBrains 不得加入 owned roster；
- `NativeRevisionMetadata`、`SourceRepresentationMetadata` 和 `CoverageAssessment` 继续表达采集版本、provider projection 与分母；`ProductFeedback*` 不替代它们；
- Apple/Google review、rating-only、developer response、summary/aggregate 映射成不同 record kind；缺失字段不补默认值；
- 现有 Probe/Outbox 抽象仍不能用于客服回复。只有未来批准独立 `owned-review-support` 产品后，才评估 customer-interaction plan。

这次提取不是把每个商店字段塞进核心，而是让相同的产品反馈语义可被多个 Platform Pack 验证，同时保持成员授权面彻底隔离。

## 10. 晋级缺口

当前三个文件都只是 evidence-reviewed design。要进入 `modeled`，需接受两个成员 snapshots、共同 projection/coverage/minimization schemas 与 roster revision；进入 `verified` 需成员 fixture reports、Channel conformance report，并经用户授权完成 read-only sandbox。回复能力保持 deferred，不随只读 Pack 晋级自动开放。
