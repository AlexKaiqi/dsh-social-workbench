# Owned Customer Support Channel Pack 设计

状态：`researched` 组合设计；成员 Pack 均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`owned-customer-support-demand/v0-design`

## 1. 为什么这是新的信号类型

公开讨论、搜索和评论能说明用户在表达或寻找什么；客服 ticket/conversation 则证明问题已经发生、用户愿意寻求解决，并留下处理时长、重复联系、升级、解决和满意度等后续证据。它比“声量”更接近产品失败，但仍会受客户规模、渠道、客服流程、bot/agent 策略和工单拆并影响，不能直接当市场规模。

Zendesk 与 Intercom 不是同一客服 schema：前者以 ticket snapshot + audit/event 流为核心，后者以 conversation + parts/current view 为核心。Channel Pack 只统一一方痛点研究策略，不制造虚构的 `support-api`。

```text
Zendesk Support ─────┐
                     ├─> Owned Customer Support Channel
Intercom Conversations┘      ├─ workspace roster
                              ├─ support-demand projection
                              ├─ privacy/deletion policy
                              ├─ coverage/process bias
                              └─ read-only skills
```

客服回复不是 Probe。它会通知真实用户、改变队列/SLA/状态和未来 evidence。创建测试工单也会污染运营指标。任何回复或处置都应建立独立 customer-support operations workflow，而不是复用需求采集 Skill。

## 2. 成员 Pack

| Member | 原生 surface | 当前状态 | 关键 coverage 边界 |
| --- | --- | --- | --- |
| [Zendesk Support](ZENDESK_SUPPORT_PLATFORM_PACK_DESIGN.md) | owned instance；ticket cursor snapshots + time-based events | `researched` design | admin-visible Support tickets；最近一分钟延迟；snapshot/event checkpoints 独立 |
| [Intercom Conversations](INTERCOM_CONVERSATIONS_PLATFORM_PACK_DESIGN.md) | owned workspace；v2.16 search/retrieve/deleted | `researched` design | stateless search pagination；single conversation 最近 500 parts；version/region fixed |

共同 capability proposal：

- `feedback.read.owned-support-thread/v1`
- `feedback.observe.owned-support-thread-changes/v1`
- `feedback.observe.owned-support-thread-deletions/v1`
- `taxonomy.list.owned-support-fields/v1`

成员原生 snapshot/event/search/read capability 保持独立。Contacts/Users profile、attachments、replies、assignment/state writes、redaction/delete writes 不进入共同 allowlist。

## 3. Workspace Roster

每个 research program 固定一个 `ChannelRosterRevision`：

| 字段 | 作用 |
| --- | --- |
| product/support subject ref | 用户确认该客服 workspace 服务哪个产品/业务；不从品牌名猜 |
| member Platform Pack ref | 固定成员 Pack revision 与 API version |
| platform surface | Zendesk exact instance/subdomain 或 Intercom workspace + region |
| ownership/authorization evidence | 证明组织有权研究该 tenant，而不是公开可登录或拿到 token |
| connection requirement | 只引用 connection/scopes/role 条件，不保存 credential |
| included brands/inboxes/forms | 明确纳入的 support population；默认不是整个企业全部客服数据 |
| exclusions | security/legal/HR/VIP queues、敏感 field、attachments、private notes 等 |
| valid window | tenant migration、region/version、产品映射变化时追加 revision |

同一企业可以有多个 Zendesk brand、Intercom workspace 或迁移前后 surfaces。只有用户证实的 subject relation 可跨 surface 关联；native ticket/conversation/contact identity 永不自动合并。Intercom 2.16 的 `external_references` 可作为平台原生 relation evidence，但 capped/缺失时不能反向推断无关联。

## 4. `owned-support-demand` Projection

| 字段 | 来源与规则 |
| --- | --- |
| member/pack/surface/representation | 必填；保留 provider、tenant、API version 和 snapshot/event/manual representation |
| native thread/event refs | platform-local；thread、message/comment、lifecycle event 分开 |
| product/support subject | roster 给出，不从 email domain、brand 或 company name 猜 |
| created/source-updated/observed times | 三者分开；provider generated/order watermark 单列 |
| state/status/type/priority/channel | 原生值 + reviewed mapper；unknown enum 保留，不默认归类 |
| user problem evidence | 只取获批 public/customer-authored spans；agent reply/note 不冒充用户话语 |
| desired outcome/current workaround | evidence span 派生；模型结果不回写原始 thread |
| process evidence | first response、wait、reopen/repeat/escalation、resolution 等 provider metrics/events |
| satisfaction evidence | CSAT/rating 与 product pain 分开；未评分不是满意 |
| approved facets | allowlisted product/version/plan/category/tags/custom fields；缺失率同时报告 |
| deletion/redaction state | active/redacted/deleted + correction receipt；deleted content 不可检索 |
| data-handling result | raw restriction、field treatments、pseudonym scope、retention/deletion propagation |

### 4.1 去重与 repeated-contact

- canonical source key 只在 tenant 内定义；Zendesk ticket ID 与 Intercom conversation ID 永不共用；
- 同一 thread 变化产生 `RevisionObservedSnapshot` 或 native event relation，不原地覆盖原始 Observation；
- repeated-contact 只能由同 tenant、获批 purpose 的 pseudonymous subject key 或平台原生 relation证明；相似文本不是同一用户；
- 一张 ticket 拆分/合并、problem/incident、linked tracker/external reference 都优先使用原生 relation；模型近似只产生 relation candidate；
- 跨平台迁移只有 exact external reference 或用户确认 mapping 才关联，不能用 email、姓名、公司名模糊合并。

## 5. 数据最小化与删除传播

### 5.1 默认处理

- raw provider payload：`restricted`、tenant/region partition、短 retention、purpose-bound access；
- names/emails/phones/IP/location/recipient/signature/contact/user/admin IDs：默认 `drop` 或 tenant-scoped `pseudonymize`；
- private notes、side conversations、employee QA、security/legal/HR queues：默认 `drop/quarantine`，不进入需求模型；
- attachments/email history/transcripts：默认只保留 descriptor，不获取 bytes；
- custom fields：先读取 definition，再按 ID/schema/version allowlist；unknown 字段 quarantine；
- derived cluster/report：低频阈值、最小 cohort、无个人可回查键；EvidenceSpan access 仍经 policy。

`DataHandlingMetadata` 记录 schema-bound selector 的 sensitivity、required/applied/provider-applied treatment、默认 disposition、profile/version 和 deletion propagation。它不保存字段值，也不把 `pseudonymize` 误称 anonymize。Visibility/Rights 继续回答“谁可访问、保留多久”；DataHandling 回答“哪些字段为何被限制或变换”。

### 5.2 correction 与删除

```text
provider redaction/deletion
        ↓
native correction / Tombstone durable
        ↓
canonical revision or removal
        ↓
EvidenceSpan revoke + projection/index remove/rebuild
        ↓
minimal audit receipt retained
```

- provider 已涂黑的正文不得因旧 snapshot 留在搜索、embedding、signal 或导出中；
- full-thread deletion 与 part redaction 分开：前者 tombstone thread/content，后者生成最小 correction 并重建受影响 revision；
- source API 只保留有限删除历史时，canary 监测 reconciliation lag；超过窗口的未知删除形成 retention risk，而非假 complete；
- 删除传播失败使对应 Channel health `degraded/suspended`，不能只记录 backlog warning。

## 6. Coverage 与偏差

```text
page/cursor completion
        ↓
provider authorized population
        ↓
field/content/history coverage
        ↓
workspace roster coverage
        ↓
support-process bias statement
```

- Zendesk snapshot complete：cursor `end_of_stream` 仅表示追到 provider 当前（至少滞后一分）watermark；event stream、private content、plan-gated metrics 和删除 scrub 另算；
- Zendesk event complete：time pagination 走到 end_of_stream，边界 duplicates 已去重；archive/delete 重放的旧 events 仍按 event time归档；
- Intercom search complete：固定 `[start,end)`/sort/filter 的 pages 在一次 run 中耗尽；因 cursor stateless，只能标 `partial/unknown-consistency`，下一 overlap run 后再提高 confidence；
- Intercom conversation complete：只有 `total parts <= 500` 且返回数匹配时可称当前 exposed parts complete；长线程明确 truncated；
- deletion reconciliation、field minimization 和 roster entries 分别报告；一个 member 成功不能遮蔽另一个 member 或敏感 queue exclusion；
- ticket/conversation count 受活跃客户数、入口曝光、bot deflection、客服政策、工单拆并和团队习惯影响。跨产品比较必须有 denominator/context，不能把 raw volume 排成“痛点市场规模”。

## 7. Channel Skills

### `owned-support-roster-curation/v1`

- purpose：`research/curate`；
- 输入：用户确认产品/支持 surfaces、成员 Pack、ownership evidence、include/exclude queues 和当前 roster；
- 输出：新增/迁移/停用/region/version/field-policy proposal；
- 禁止：发现 credential、枚举陌生 tenant、按 email domain 建组织画像或调用平台。

### `owned-support-demand-research/v1`

- purpose：`acquire`；
- 输入：固定 Channel/成员 snapshots、roster revision、窗口、研究问题、field/data-handling profile、cost/retention；
- allowlist：成员只读 ticket/conversation/event/field/deletion capabilities，以及用户选择的 manual import；
- 输出：native Observations、member CoverageAssessment、data-handling attestations、corrections/tombstones、共同 projection 与 complaint/repeated-request/urgency candidates；
- 禁止：reply/state change/assignment/create/delete/redact、Contacts/Users profile、附件下载、跨 tenant identity、将 agent/AI text 归为用户 pain。

### `owned-support-channel-conformance/v1`

- purpose：`verify/diagnose`；
- 先引用成员 fixture reports，再验证 roster、projection、field handling、pseudonym isolation、coverage、correction/deletion cascade 和 partial degradation；
- Channel report 不替代成员 API/version/scope verification。

没有 Channel Probe Skill。若未来需要客服 follow-up、访谈邀请或解决方案测试，应单独设计 consent、reply preview、one-time approval、outbox、receipt、read-back、unsubscribe 和服务责任边界。

## 8. 开源生态快照

| Artifact | Fixed revision | 价值 | 边界 |
| --- | --- | --- | --- |
| [zendesk/zendesk_api_client_rb](https://github.com/zendesk/zendesk_api_client_rb/tree/7a24f1c88753d546d9bebf1f35af974627e94ef9) | `7a24f1c88753d546d9bebf1f35af974627e94ef9` | 官方 resource/auth/retry 参考 | Apache-2.0；read/write surface 很宽，未执行 |
| [intercom/intercom-node](https://github.com/intercom/intercom-node/tree/d8a05dee0314b74d6d0bbd49caccdd680a635c1a) | `d8a05dee0314b74d6d0bbd49caccdd680a635c1a` | 官方 generated TS client 参考 | Apache-2.0；仍 pin 2.11，不证明 2.16 |
| [airbytehq/airbyte](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026) | `1339a9ecca6f8fb547ffb7b19665d6980c069026` | 双平台 connector、state/lookback/deletion 和真实 regression history | repo/path/license 与 hosted/OSS 边界待审；仅 discovery，不执行 |
| [MeltanoLabs/tap-zendesk](https://github.com/MeltanoLabs/tap-zendesk/tree/432213465f5211111d40492263bb78090a62dc96) | `432213465f5211111d40492263bb78090a62dc96` | Singer catalog/state 与 Zendesk streams | community Apache-2.0；timestamp semantics 需审计 |
| [singer-io/tap-intercom](https://github.com/singer-io/tap-intercom/tree/1c5e4cfbcbcfb6b481859047e5a9f38e24419b89) | `1c5e4cfbcbcfb6b481859047e5a9f38e24419b89` | 旧 substream/state 失败模式 | AGPL-3.0、API 版本陈旧；不复用 |

## 9. Verification Plan

### static-contract

- member refs、workspace roster、version/region、common capabilities 和 projection mappings 自洽；
- provider native thread/event/contact identities不合并；
- `DataHandlingMetadata` 对 raw、normalized、derived outputs都有明确 required/applied state；
- reply/create/update/delete/redact capability 不在 Skills、ports 或 allowed effects 中；
- deletion propagation 是 release gate，CoverageAssessment 同时含 provider/history/field/roster/process boundary。

### fixture-conformance

| Scenario | 必须证明 |
| --- | --- |
| same product across two providers | product subject 可关联，native thread/contact identity 保持隔离 |
| customer + agent + internal note | 只把 customer-authored approved span作为 pain evidence |
| repeated contact in one tenant | tenant-scoped pseudonym 可聚合；跨 tenant 无法 join |
| custom field with PII | unknown quarantine；approved categorical field 可投影且留 schema version |
| Zendesk system update + Intercom page mutation | 各自 checkpoint/overlap 策略保持，不压成一个 cursor |
| long Intercom thread | 500-part truncation使 thread coverage partial |
| provider part redaction | source/canonical/evidence/index cascade removal |
| full thread deletion | tombstone 幂等、derived signals 被 supersede/review，不泄漏旧正文 |
| one member authorization failure | channel partial/degraded，另一 member 结果不掩盖缺口 |
| unequal support volumes | report显示 denominator/process bias，禁止直接 market ranking |
| attempted reply/create/delete | Channel policy 拒绝，零 platform-write |

### sandbox-live / operational-canary

必须先有成员各自的 read-only sandbox report，才能组合验证；不要求真实 PII fixture、删除或长会话，可用 provider development workspace seeded synthetic records。canary 分 member 监测 docs/API version/scope/schema/rate/pagination/deletion lag，并额外监测 field-policy coverage、restricted-blob access、correction/index backlog 和 roster health。综合 success rate 不能隐藏某 tenant 或删除链路失效。

## 10. 对现有抽象的结论

现有抽象已能复用：

- `NativeRevisionMetadata` 区分 provider event、observed snapshot 和 history coverage；
- `Cursor`、`Page.Complete` 与 `CoverageAssessment` 可分别表达 checkpoint 和 population；
- `Tombstone`、canonical revision、`Indexer.Remove` 支撑删除传播；
- `ChannelRosterRevision` 可版本化 tenant/region/version surface；
- capability-scoped Connection/route 可保持 read/write 和 credential 边界。

但 `Rights.Visibility/RetentionUntil` 只能描述整个对象的访问与保留，无法证明一张含正文、email、internal note 和 custom fields 的 payload 经过何种 field-level minimization。因此本轮补 `DataHandlingMetadata`，只描述 schema selector、敏感度、处理 disposition/state、profile 与删除传播，不加入 Zendesk/Intercom 字段，也不保存任何敏感值。

## 11. 晋级缺口

当前三个文件仅是 evidence-reviewed design。进入 `modeled` 需要 accepted member snapshots、共同 projection/coverage/data-handling/deletion schemas 与 workspace roster；进入 `verified` 需成员 fixture reports、Channel conformance report，并经用户授权完成 read-only development sandbox。客服写入继续拒绝，不随只读 Pack 晋级自动开放。
