# Owned Product Request Channel Pack 设计

状态：`researched / broad-authority-members` 组合设计；未发布、未连接  
核验日期：2026-08-26  
Channel Pack ref：`owned-product-request/v0-design`

## 1. 目标与非目标

本 Channel 回答：在用户自有产品反馈面中，哪些显式请求、问题和期望被提出或支持，它们如何被归类、合并、回应并与交付声明关联。它产出可追溯的`product-request`证据和需求假设，不把平台排行榜、vote/supporter总数或状态自动变成市场规模、独立重复需求、支付意愿或交付事实。

```text
Canny idea/post/vote/status ─────┐
                                  ├─> Owned Product Request Channel
UserVoice suggestion/support/status┘     ├─ definition/taxonomy roster
                                         ├─ authored item + support semantics
                                         ├─ merge/status/delivery lineage
                                         ├─ privacy + coverage
                                         └─ reviewable request hypotheses
```

## 2. 成员 Pack

| Member | Native model | 当前状态 | 共同路径 |
| --- | --- | --- | --- |
| [Canny](CANNY_PRODUCT_REQUEST_PLATFORM_PACK_DESIGN.md) | v2 idea/group + v1 post/board/vote/status/merge | `researched/broad-credential` | item/container/status；support conditional |
| [UserVoice](USERVOICE_PRODUCT_REQUEST_PLATFORM_PACK_DESIGN.md) | Admin v2 forum/suggestion/supporter/status/merge | `researched/admin-credential` | suggestion/taxonomy/aggregate support；comments conditional |

两个成员官方凭据都不是可证明的只读最小scope；共同capability `feedback.read.owned-product-request/v1` 只能表示policy-enforced read，不能把成员包装成least privilege。成员sandbox、health与degraded原因分别报告。

## 3. 稳定概念：四类事实不得合并

| 层 | 核心问题 | 例子 | 不能推断 |
| --- | --- | --- | --- |
| authored representation | 谁在什么surface说了什么 | Canny post、UserVoice suggestion/comment | 作者真实身份、独立性、市场频率 |
| curated request entity | 平台/团队如何归并与组织 | Canny idea、UserVoice winning suggestion | 原始陈述完全等价、merge正确 |
| support relation/aggregate | 谁以何种机制表达支持 | vote、supporter、request、priority/account | 痛点严重度、支付、独立用户数 |
| admin/delivery assertion | 团队如何分类和回应 | status、ETA、changelog、feature/Jira link | 已部署、使用、满意或因果价值 |

`ProductRequestKind`表达representation；`ProductRequestRelation`表达parent/merge/represented-by/delivery/release；`EvidenceAttribution`与`ProductRequestSpanMetadata`表达原文、portal comment、internal note/status/provider insight。任何projection都保留四层来源。

## 4. Definition、Item 与 Support Contract

### 4.1 `ProductRequestDefinitionMetadata`

每个surface revision固定：

- product/subject、platform Pack、connection与exact board/forum/group/container roster；
- category/tag/group/custom-field schema与status taxonomy；
- public/private/internal visibility和vote/comment权限；
- vote/supporter/request/account/priority等measure的counting unit、identity、import/on-behalf、merge、weighting和priority scale；
- merge、notification、retention/deletion policy与valid window。

任一taxonomy、可见性、merge、identity或计数定义改变都创建新revision，即使provider container ID不变。

### 4.2 `ProductRequestItemMetadata`

每个observed item revision保留kind/origin、container/group/category/tag、provider status + lifecycle binding、scope-local author/creator-on-behalf、relations、history/support/comment coverage、visibility/retention/deletion和时间。实际title/body/count/custom fields仍在schema-bound payload。

### 4.3 支持口径

- raw support event与current aggregate分representation；
- admin-on-behalf、import、integration和self-service分origin；
- merge迁移不生成新的independent support；
- supporter用户、supporting account和request occurrence可同时存在但不能相加；
- priority/score是weight或classification，不是额外人数；
- revenue/MRR使用Monetary contract，currency/authority缺失时禁止比较；
-只有identity/merge/source coverage满足固定definition，才允许派生`repeated-request`；否则只保留`product-request`。

## 5. Channel Projection 与动态物化

| Projection | Key/refresh trigger | 约束 |
| --- | --- | --- |
| `product-request-theme` | subject + definition revision + authored spans | merge/cluster mapper/version可追溯；原item不覆盖 |
| `product-request-support` | native item + measure definition + snapshot | 各measure分列，unattributed/imported/on-behalf coverage可见 |
| `product-request-status-history` | item + taxonomy revision + event order | current status不替代history；internal/public分开 |
| `product-request-merge-lineage` | source/winner relation + observed revisions | 可逆/unknown关系保留；不复制authorship |
| `product-request-delivery-gap` | request + delivery assertion + usage/release evidence | status/changelog/link单独不足，缺验证时输出gap |
| `product-request-evidence-gap` | hypothesis + alternative explanations | visibility/selection/identity/coverage不足不发布结论 |

物化视图保存knowledge snapshot、source watermark、definition/schema/mapper version与coverage hash；merge/status/tombstone或taxonomy drift触发失效重建。它们是可重建索引，不是versioned knowledge或原始事实。

## 6. 需求推断边界

- feature board样本只代表看见并愿意使用该反馈入口的人；private/custom access、语言、登录、产品层级与moderation造成selection bias。
- 高vote/support可能是需求，也可能是campaign、管理员代录、import、merge、existing customer concentration或status曝光效应。
- comment/title通常描述solution request，不一定揭示problem、context、workaround和desired outcome；抽取时必须允许unknown。
- declined/closed不是“无需求”；planned/completed也不是“已解决”。需要product usage、support、survey、billing或experiment等独立证据。
- provider AI insight/dedupe、suggested merge与模型cluster都是derived evidence，不能改写subject-authored原文或获得相同证据强度。
- 同一产品在Canny和UserVoice迁移/双写时，只有导入映射或用户确认ledger才建立exact relation；标题相似只是duplicate candidate。

## 7. Privacy、Coverage 与 Authority

```text
route page/cursor complete
          ↓
item/detail/history/support/comment completeness
          ↓
container/status/visibility roster coverage
          ↓
identity/import/on-behalf/merge count coverage
          ↓
feedback-entry population（不是全部用户或市场）
```

- user email/name/external IDs、company、CRM opportunity、NPS、revenue、attachment和internal note默认不进入Channel；
- scope-local opaque author/support refs不能与CRM identity自动拼接；
- title/body/comment可能含PII或security issue，采用field allowlist、sensitive detector、quarantine和restricted raw；
- list complete不等于merge/status history或deleted content complete；
- Canny/UserVoice凭据都有write authority，Connector只读是本系统policy/transport事实，不是provider scope事实；credential age与negative-write conformance必须持续可见。

## 8. Channel Skills

### `owned-product-request-roster-curation/v1`

- 输入：用户确认的产品、containers、status/support definitions、成员Packs；
- 输出：definition/roster proposal与evidence gaps；
- 禁止自动纳入账号全部private boards/forums、users/accounts或读取credential。

### `owned-product-request-research/v1`

- 输入：accepted snapshots、roster、window、field/privacy/coverage budget；
- 输出：native observations、definition/item/span metadata、merge/status/support projections与hypotheses；
- 禁止创建/修改/merge/delete/vote/support/comment/status/notify、读取raw supporter identity或把排行榜直接变Opportunity。

### `owned-product-request-channel-conformance/v1`

- 先运行成员fixture，再验证cross-member kind/status/support/merge/authorship/privacy/coverage；
- broad credential是显式condition；任一write route可达即失败；
- 无Probe Skill。truthful feature-request test也会影响真实用户/排行/通知，需独立Probe plan、synthetic或明确受众、批准、receipt与reconcile。

## 9. Verification Matrix

| Scenario | 必须证明 |
| --- | --- |
| post/suggestion vs curated idea | representation分开，仅exact relation关联 |
| self vs on-behalf/import | attribution/origin保留，不等价于独立用户 |
| support metrics | vote/supporter/request/account/priority/revenue不相加或替代 |
| merge chain | source revisions/authorship保留，winner current count不重复计数 |
| custom statuses | provider taxonomy/permissions固定，不靠名字推断lifecycle/交付 |
| portal/internal/provider content | span role、visibility与authorship正确，broad索引排除internal |
| pagination mutation | cursor与offset/page各自验证；complete boundary准确 |
| cross-platform migration | 无mapping只标duplicate candidate，不自动dedupe |
| PII/monetary | user/account/revenue/attachment/internal字段drop/restrict/quarantine |
| broad credentials | 两成员所有mutation和generic request均被policy+transport拒绝 |
| missing push evidence | UserVoice push blocked；Canny webhook也只wakeup+pull reconcile |

用户另行授权后，sandbox仅在synthetic workspace/subdomain读取少量container/item/status，先运行write-negative transport测试。operational canary分成员监测docs/API/schema、idea/post/suggestion对象漂移、taxonomy/visibility、cursor/offset、merge/tombstone、credential、rate、privacy和OSS许可维护状态。

## 10. 晋级缺口

进入`modeled`需要接受两个成员Pack、Channel roster、ProductRequest definition/item/span schemas、support/merge/status/privacy/coverage policy；进入`verified`需要成员与Channel fixtures及分别授权的synthetic read sandbox。由于成员credential authority过宽，Channel即使verified也必须保留`broad-authority-members`condition；真实Probe/write永不随read自动晋级。
