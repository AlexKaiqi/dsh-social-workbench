# Discord Customer Community Platform Pack 设计

状态：`researched / policy-blocked` 设计候选；未创建bot、未连接guild、未调用API、未安装MCP  
核验日期：2026-08-26  
Pack ref：`discord-authorized-customer-community/v0-design`

## 1. 定位与政策结论

Discord guild、forum和thread能提供高价值的多方问题复现、社区变通方案和peer confirmation，但“guild管理员安装bot”不等于需求挖掘用途获准。当前Discord Developer Policy要求API Data只用于应用已声明/获批功能，禁止mining或scraping Discord数据，并禁止在未获Discord明确许可时用API消息内容训练AI/LLM。[Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy)

本系统的目标包含持续采集、索引与需求挖掘，不能在没有平台书面许可或可审计的approved-functionality basis时自行解释为允许用途。因此本Pack将Discord保持为`policy-blocked`：技术模型、fixture和候选审计可以推进，真实读取、持久化和模型分析不进入sandbox/live。

```text
platform             discord
surface              authorized customer guild channels/forums
state                researched / policy-blocked
verified level       evidence-review + static-contract only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 原生语义 |
| --- | --- | --- | --- |
| `discord-application/v1` | authority | application + bot installation/review | intents、bot token、review和declared purpose边界 |
| `discord-guild/v1` | community space | guild snowflake | channel/role/member permission根，但channel overwrite可改变bot实际authority |
| `discord-channel/v10` | container | guild + channel snowflake | text/announcement/forum/media/voice等type必须保留；category不是消息流 |
| `discord-thread/v10` | channel/thread | guild + parent + thread snowflake | public/private/announcement thread；active/archived、membership和permission不同 |
| `discord-forum-post/v10` | thread representation | forum parent + thread ID | forum中只能创建thread；首消息与thread共享ID |
| `discord-message/v10` | mutable content | channel + message snowflake | author可为user/bot/webhook/system；content可因intent为空 |
| `discord-message-reference/v10` | relation | source/target message/channel/guild refs | reply、thread starter、forward/crosspost语义须按type分开 |
| `discord-message-snapshot/v10` | immutable forward representation | forwarding message + snapshot | 不含完整原message字段，且不随原文更新 |
| `discord-reaction/v10` | relation/aggregate | message + emoji + normal/burst kind | normal与super reaction分开；不能自动推导独立需求 |
| `discord-gateway-session/v10` | delivery session | session + shard + sequence | sequence支持resume，不是永久、完整的change log |
| `discord-message-delete/v10` | tombstone event | guild? + channel + message ID | event只给ID定位，不携带原message全文 |

Discord建议在route显式指定API版本；省略会跟随当前默认版本。[API reference](https://docs.discord.com/developers/reference) 本Pack固定v10 knowledge snapshot，但每次drift review重新核验可用版本。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access/effect | Adoption |
| --- | --- | --- | --- |
| `community.list.discord-guild-channel-roster/v1` | approved guild → channel descriptors | bot REST / none | `policy-blocked` |
| `community.read.discord-channel-history/v1` | approved channel + snowflake window → messages | bot REST / none | `policy-blocked` |
| `community.read.discord-thread-roster/v1` | guild/parent → active + archived threads | bot REST / none | `policy-blocked` |
| `community.receive.discord-message-gateway/v1` | gateway dispatch → wake-up/revision/tombstone | Gateway / local write | `policy-blocked`；还需resume/reconcile |
| `community.read.discord-reactions/v1` | selected message → reaction aggregates/actors | bot REST / none | `policy-blocked`；actor identity默认拒绝 |
| `community.read.discord-members-dms/v1` | guild/DM → sensitive identity/content | privileged access / none | `rejected-by-default` |
| `community.search.discord-guild-messages/v1` | guild query → provider search results | bot REST / none | `rejected`；用途与mining风险，不作为采集替代 |
| `community.manage.discord-*` | any Discord object → platform mutation | platform write | `rejected` |

## 4. 技术 Access Contract（不覆盖政策阻断）

### 4.1 `discord-bot-rest-read-v10`

- bot token只进credential store；禁止self-bot/user token；base URL固定`/api/v10`，generic URL/redirect拒绝；
- guild base permission与channel role/member overwrites共同决定effective authority。读消息需要`VIEW_CHANNEL`与`READ_MESSAGE_HISTORY`；private archived thread还需要`MANAGE_THREADS`，不能为覆盖率自动扩大权限。[Permissions](https://docs.discord.com/developers/topics/permissions) [Message resource](https://docs.discord.com/developers/resources/message)
- Get Channel Messages按newest→oldest返回，`before/after/around`互斥，limit 1–100。snowflake cursor、channel roster和query固定直到耗尽；分页complete不等于已授权guild全部内容complete；
- active thread与archived public/private thread使用不同enumeration route。Gateway只同步bot可见的active threads；失去channel权限不会收到每个thread delete，必须把permission change当作coverage/visibility revision。[Threads](https://docs.discord.com/developers/topics/threads)
- archived thread上的send/reaction会自动unarchive并可能自动join；任何read workflow都不得通过send“唤醒”thread；
- HTTP rate limits会按route/bucket/global动态变化，必须读取response headers与`X-RateLimit-Bucket`，不得硬编码常数。[Rate limits](https://docs.discord.com/developers/topics/rate-limits)

### 4.2 `discord-message-content-access-v10`

缺少或未获批`MESSAGE_CONTENT` privileged intent时，`content`、`embeds`、`attachments`、`components`返回空值，`poll`省略；bot自己发送、DM、mention等存在例外。[Message object](https://docs.discord.com/developers/resources/message) 这些空值必须标为`permission-omitted`，不能写成`authored-empty`。

自2026-06-10起，能触达10,000或更多用户的应用需要针对message content、members和presence访问接受审查，并每年复审；阈值已从“100+ guild”改为“10,000 users”。[Discord 2026 access update](https://discord.com/blog/updated-requirements-to-how-apps-access-data-in-servers) 旧阈值不能留在长期知识中。

### 4.3 `discord-gateway-wakeup-v10`

Gateway dispatch带sequence，客户端保存最后non-null sequence用于heartbeat和resume；Reconnect/Invalid Session仍可能导致不可恢复gap。[Gateway](https://docs.discord.com/developers/events/gateway) Discord官方一致性说明明确指出事件可能不发送、发送一次或发送N次，客户端应幂等。[Consistency](https://docs.discord.com/developers/reference)

因此Gateway只做wakeup：message create/update追加observed revision，delete/bulk delete追加ID tombstone，reaction event更新relation candidate；sequence/session/shard gap触发REST reconcile。Discord HTTP webhook events不是一般guild message stream，且官方说明其非实时、不保证顺序，不能替代Gateway message contract。[Webhook Events](https://docs.discord.com/developers/events/webhook-events)

## 5. Platform Skills

### `discord-pack-research/v1`

- 固定official docs/policy、v10 concepts、permission/intents/review threshold与OSS revision；
- 输出knowledge proposal，不创建application/bot、不读取guild、不安装MCP。

### `discord-community-acquire/v1`

- 当前状态只定义输入输出，不可执行；输入必须包含accepted Pack、platform written permission或approved-functionality evidence、guild/channel roster、intent/permission/data-use/retention policy；
- 理论输出为native Observations、`CommunityDefinitionMetadata`、`CommunityMessageMetadata`、thread/reference/edit/delete lineage和coverage；
- 禁止DM、member profile、presence、self-bot、search-as-scrape、attachments下载和所有write。

### `discord-community-conformance/v1`

- fixture验证guild/channel overwrite、forum/thread、active/archived/private、message-content omitted、reply/thread starter/forward snapshot、normal/burst reaction、edit/delete、snowflake pagination和Gateway duplicates/gaps；
- 在policy blocker解除前不进入sandbox，即使用户提供bot token也不例外；
- 无Probe Skill。send/reply/reaction/create thread等既是平台写入，也可能触发notification、auto-join或unarchive。

## 6. 数据治理与推断边界

- bot能`VIEW_CHANNEL`只是技术事实；`CommunityDefinitionMetadata.DataUseBasisRef`必须另证用途授权、Discord policy basis与valid window。
- user、member、bot、webhook、system actor分开；nickname、username、roles、member list、mentions与reaction actors默认restricted，宽索引只使用scope-local opaque refs。
- forum tag、reaction count、reply count、thread活跃度和peer agreement不等于独立需求、严重度或市场规模；只有reviewed authored spans才能成为complaint/workaround等证据。
- forwarded snapshot是固定representation，不能在原消息编辑/删除后悄悄跟随或覆盖；thread starter message也可能只有reference而无正文。
- Developer Terms要求API Data按请求及时更新/删除，并在不再需要、停止运营、Discord或用户要求等条件下删除；还要求at-rest encryption与可访问的修改/删除入口。[Developer Terms](https://support-dev.discord.com/hc/en-us/articles/8562894815383-Discord-Developer-Terms-of-Service)
- Discord明确禁止API data mining/scraping；本设计不把“去身份化”“自有guild”或“管理员同意”当作绕过条款的依据。

## 7. 开源与 Agent Artifact 快照

以下revision于2026-08-26只读固定，未clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [discord/discord-api-docs](https://github.com/discord/discord-api-docs/tree/5dce8bd7001356c1bbdb65257112dc1a3cfdd5c7) `5dce8bd…` | Discord官方；docs CC-BY-SA-4.0，code samples MIT | v10 schema、events、permissions的固定官方snapshot | `normative-reference`；线上docs/policy优先 |
| [discord.js 14.27.0](https://github.com/discordjs/discord.js/tree/6232a2114d5c8ae19e582c68f9dc87ca1b431e30) `6232a21…` | community；Apache-2.0 | Gateway/REST/intents typed library reference | `preferred-sdk-reference`；policy仍阻断runtime |
| [discordgo v0.29.0](https://github.com/bwmarrin/discordgo/tree/6e8fa27c7917ea54d8b9ec26f126becae59058d2) `6e8fa27…` | community；BSD-3-Clause | Go session/event/schema reference | `alternate-sdk-reference`；policy仍阻断runtime |
| [Airbyte source-discord](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-discord) `1339a9e…`; image `0.1.10`; manifest `6.33.6` | Airbyte community；ELv2；alpha | guild/channel/message/member/thread/archive fixture | `reference-only`；要求较宽权限/intents，未解决政策用途 |
| [PaSympa/discord-mcp v2.1.1](https://github.com/PaSympa/discord-mcp/tree/024655e7d82caca9a88b49cdb1e0ba584845f01d) `024655e…` | community；MIT | modular toolsets、guild allowlist、dry-run参考 | `schema-discovery-only`；toolset含bulk delete/kick/ban等破坏性工具 |
| [jonasgantner/discord-mcp](https://github.com/jonasgantner/discord-mcp/tree/0c693796efc325001acaceacd7551198b1dd4adc) `0c69379…` | community；MIT；无release tag | 66-tool message/thread/reaction/attachment surface参考 | `schema-discovery-only`；读写过宽、维护稳定性待验 |

截至本次官方资料与官方GitHub组织检查，未定位到Discord发布的官方MCP Server或Agent Skill；这是本次snapshot的检索结论，不声明永久不存在。任何使用Discord user token的self-bot候选即使自称read-only也`hard-rejected`，不进入固定候选集。

## 8. Verification Plan

| 场景 | 必须证明 |
| --- | --- |
| policy gate | 无platform written permission/approved purpose时所有live resolution均blocked |
| permission overwrite | guild base与channel effective authority分开；失去权限产生coverage revision |
| content intent | permission-omitted与authored-empty严格区分；10k/annual review drift可观测 |
| text/forum/thread | parent/thread/post identity和archived enumeration正确，不靠send unarchive |
| reply/starter/forward | exact relation与snapshot revision保留，不用文本相似映射 |
| bot/webhook/system/user | actor与span role正确，member identity不进宽索引 |
| normal/burst reaction | measure分开，不直接变独立需求或严重度 |
| edit/delete/bulk delete | append revision/tombstone；delete event无原文时不伪造内容 |
| Gateway duplication/gap | sequence/session/shard、resume failure、0/1/N delivery与REST reconcile |
| candidate writes/self-bot | send/edit/delete/reaction/thread/channel/member/moderation/generic route全部拒绝 |

operational canary监测Developer Policy/Terms、message-content review threshold、API v10/change log、permission/intents、channel/thread types、Gateway close/resume/sequence、REST bucket、delete propagation和OSS许可维护漂移；在policy-blocked期间canary只读官方/仓库知识，不接触guild。

## 9. 晋级缺口

进入`modeled`需要接受v10 concepts、definition/message/span schemas、policy blocker和fixture plan。任何`verified`或live晋级都先需要Discord对该需求研究/索引用途的明确书面许可或可审计的approved-functionality basis，再需要用户批准的synthetic guild sandbox、privacy/deletion机制与fixture report。单凭guild owner、bot permission或MESSAGE_CONTENT approval不能解除用途阻断。
