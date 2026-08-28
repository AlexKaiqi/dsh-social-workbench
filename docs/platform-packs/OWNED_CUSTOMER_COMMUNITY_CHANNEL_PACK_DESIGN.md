# Authorized Customer Community Channel Pack 设计

状态：`researched / mixed-policy-members` 组合设计；未连接、未采集、未发布  
核验日期：2026-08-26  
Channel Pack ref：`authorized-customer-community/v0-design`

## 1. 目标与非目标

本Channel回答：在组织明确授权且平台用途允许的客户社区中，用户如何共同描述问题、复现环境、提供变通方案、确认影响并与团队协作。它把多方community stream建模为可追溯来源，不把频道热度、reaction、reply数量、成员身份或模型总结自动变成需求证据。

```text
Slack workspace/channel/thread ─┐
                                ├─> Authorized Customer Community Channel
Discord guild/forum/thread ─────┘     ├─ authority + data-use definition
                                      ├─ channel/thread/message revisions
                                      ├─ edit/delete/reaction lineage
                                      ├─ privacy + coverage
                                      └─ reviewable pain/workaround evidence
```

## 2. 成员 Pack 与当前可用性

| Member | Native model | 当前状态 | 组合结论 |
| --- | --- | --- | --- |
| [Slack](SLACK_CUSTOMER_COMMUNITY_PLATFORM_PACK_DESIGN.md) | workspace → conversation → message/thread/reaction | `researched/internal-only-or-policy-blocked` | 仅internal customer-built或独立审查通过的deployment可继续验证 |
| [Discord](DISCORD_CUSTOMER_COMMUNITY_PLATFORM_PACK_DESIGN.md) | guild → channel/forum/thread → message/reference/reaction | `researched/policy-blocked` | 官方禁止mining/scraping；无用途许可不进入sandbox/live |

Channel状态取成员最严格条件。组合层不能用Slack内部应用的可行性掩盖Discord阻断，也不能把一个成员的coverage、credential health或许可结论传播到另一个成员。

## 3. 为什么必须是独立抽象

| 已有抽象 | 它真实表达什么 | 无法覆盖的社区事实 |
| --- | --- | --- |
| `ConversationDatasetMetadata` | 一次有界meeting/call及audio/transcript/artifacts | 长期channel、异步thread、权限变化、message edits/deletes、reactions |
| `CorrespondenceMessageMetadata` | mailbox copy、MIME、headers、quoted/forwarded email | workspace/guild roster、thread channel、bot/system actors、gateway/event gaps |
| `ProductRequestItemMetadata` | 显式feedback item、support、status与merge | 多主题自然讨论、peer response、问题复现和workaround chain |

因此新增`CommunityDefinitionMetadata`、`CommunityMessageMetadata`和`CommunitySpanMetadata`，而不是向会议或邮件类型塞provider-specific optional fields。原始community来源也不新增笼统的`EvidenceCommunityDiscussion`：discussion只是来源，不是需求语义；span仍须被审查为`complaint`、`workaround`、`urgency`、`switching`等既有证据类型。

## 4. 稳定事实层

### 4.1 Authority / Definition

`CommunityDefinitionMetadata`每个revision固定：

- workspace/guild scope、platform Pack与deployment class；
- exact approved channel roster、parent/thread kind、native visibility、external-share与archive状态；
- bot/app grant、scope、intent与effective permission snapshot refs；
- data-use/purpose、DM、identity、content、pull、event、reaction、retention与deletion policy；
- valid window、evidence和assessment time。

scope、intent、permission、channel visibility/membership、platform review、Terms/purpose或retention改变都创建新revision。技术authority、组织批准和平台用途权利是三个独立fact；缺任一项都不能采集。

### 4.2 Message / Revision

`CommunityMessageMetadata`每个observed revision保留definition revision、space/channel/parent/thread、message identity、kind/state、actor kind/party/basis、content availability、exact relations、attachment descriptors、history/message/reaction coverage、visibility、retention/deletion与timestamps。

- edit是新revision，不覆盖旧revision；
- delete是tombstone，即使provider只给ID；
- `permission-omitted`、`provider-omitted`、`not-collected`、`deleted`和`authored-empty`必须区分；
- reply、thread-root/starter、forward snapshot和crosspost必须有native reference或人工reviewed mapping；
- member、bot、application、webhook、system actor不得折叠。

### 4.3 Span / Demand semantics

`CommunitySpanMetadata`固定message/content revision、role、actor ref与language。authored/reply、system、bot、webhook、forwarded snapshot、embed、attachment extract和provider-derived content分role。随后SignalMiner只能对允许的role提出complaint/workaround等候选，并保留alternative explanation与review状态。

## 5. Channel Projection 与动态物化

| Projection | Key / refresh trigger | 约束 |
| --- | --- | --- |
| `community-problem-episode` | subject + channel/thread + authored spans + time window | clustering是derived；不合并原消息或作者 |
| `community-reproduction-chain` | problem span → exact replies/artifacts | bot/system提示与成员实测分开；缺环境字段保持unknown |
| `community-workaround-chain` | authored workaround → replies/outcomes | workaround流行不等于问题严重或方案有效 |
| `community-peer-confirmation` | reviewed reply/reaction relations + identity coverage | reaction/reply不是默认独立需求，只表达弱关系 |
| `community-response-gap` | problem episode + first internal response/resolution assertion | 沉默可能是coverage/permission/retention gap，不直接归因 |
| `community-unresolved-thread` | latest revisions + status mapper + reconcile watermark | archive/lock/无回复不自动等于未解决 |
| `community-evidence-gap` | hypothesis + authority/visibility/content/history coverage | policy blocked、private excluded、event gap必须显式显示 |

物化视图保存knowledge snapshot、member Pack/version、definition revision、source watermark、schema/mapper/model version与coverage hash。edit/delete、permission/roster、Terms/purpose、retention或Gateway/Events gap触发失效重建。视图是可重建索引，不是版本知识或原始事实；policy不允许持久化时只允许transient/manual result，不能偷偷落盘。

## 6. Coverage、Privacy 与推断边界

```text
platform terms + approved purpose + organization authorization
                           ↓
app/bot grants + effective channel visibility + approved roster
                           ↓
history/thread pages + event/reconcile windows + content availability
                           ↓
reviewed authored spans + identity/reaction definitions
                           ↓
community-entry population（不是全部客户、用户或市场）
```

- public/private/shared/DM是不同population。默认只批准明确roster中的community channel；DM/MPIM、private thread和外部共享内容不自动扩张；
- usernames、emails、profiles、member lists、roles、mentions、reaction actors、attachments和raw URLs默认restrict/drop；只持久化scope-local opaque refs；
- “多个账号回复”不等于多个独立客户，同一人多账号、员工、bot、webhook、quoted/forwarded内容都会污染frequency；
- reaction、reply count、thread length和活跃度可用于navigation，不直接成为severity、urgency、payment或market size；
- 团队回复“fixed”、archive/lock、bot answer或accepted workaround只是平台陈述；需要usage/support/release等独立证据验证resolution；
- Slack/Discord内容不得跨scope用于共享模型训练、跨客户benchmark或第三方获益；平台明确阻断时去身份化也不是绕过方式；
- deletion/retention传播必须能使宽索引、derived projection和cache失效；受限审计历史是否保留由独立legal basis决定。

## 7. Channel Skills

### `authorized-community-roster-curation/v1`

- 输入：成员Packs、deployment、purpose/data-use evidence、用户批准的spaces/channels、privacy/retention budget；
- 输出：definition/roster proposal与policy/coverage gaps；
- 禁止读取credential、自动枚举全部private/DM或把admin安装当用途批准。

### `authorized-community-research/v1`

- 只有成员route状态为eligible且definition accepted时才可被未来Connector解析；
- 输出native observations、definition/message/span metadata、thread/edit/delete lineage、coverage和reviewable signals；
- 禁止post/reply/reaction/join/invite/unarchive、成员画像、跨scope identity join、共享模型训练与policy-blocked source调用。

### `authorized-community-conformance/v1`

- 先运行成员fixture，再验证cross-member channel/thread/message/actor/content availability/relation/reaction/edit/delete/coverage映射；
- policy gate是首个negative test，先于credential与network；
- 无Probe Skill。社区probe会直接面向真实成员并产生message、notification和moderation风险，必须独立定义受众、truthful content、approval、budget、receipt、delete/reconcile。

## 8. Verification Matrix

| Scenario | 必须证明 |
| --- | --- |
| authority three-way gate | platform use、organization approval、technical grant分别有evidence，缺一即blocked |
| channel roster drift | privacy/shared/archive/permission变化生成definition revision并失效投影 |
| conversation vs community | meeting artifact不被映射成长期channel，email thread不冒充community thread |
| thread/reply/forward | 仅native exact relation；相似文本/参与者/时间不自动关联 |
| empty vs omitted | permission/provider/not-collected/deleted/authored-empty无歧义 |
| actor/content role | user/customer、internal、bot、app/webhook、system、forward/embed分开 |
| reactions/replies | normal/burst与provider semantics保留，不直接生成repeated-request |
| edit/delete/retention | append revision/tombstone；所有materialization按policy失效 |
| event/pull gaps | Slack retries/disabled与Discord sequence/resume/0-N delivery分别观测和回补 |
| scope isolation | 不跨workspace/guild/customer identity join、索引、训练或合并统计 |
| zero write | join/send/reply/reaction/thread/channel/member/moderation/generic request全部拒绝 |

用户另行授权后的sandbox也只能从状态允许的成员开始：Slack internal synthetic workspace可在policy和fixture通过后评估；Discord在平台用途许可解除前仍不得进入sandbox。operational canary按成员监测docs/Terms/policy、scope/intents/review、roster/permissions、event gaps、rate、edit/delete/retention、data-use basis和OSS drift。

## 9. 晋级缺口

进入`modeled`需要接受两个成员Pack、三方authority gate、Community definition/message/span contracts、roster/privacy/retention与fixture计划。进入`verified`需要每个eligible成员自己的fixture与synthetic sandbox report；成员policy blocker不会由Channel抽象消除。真实Probe/write永不随read能力自动晋级。
