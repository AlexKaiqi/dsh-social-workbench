# UserVoice Product Request Platform Pack 设计

状态：`researched / admin-credential` 设计候选；未连接账号、未调用 API  
核验日期：2026-08-26  
Pack ref：`uservoice-owned-product-request/v0-design`

## 1. 定位与边界

本 Pack 只读取用户自有 UserVoice subdomain 中批准的 forum、suggestion、status/status update、support aggregate、comment 与 merge relation，用于发现产品请求及其处理状态。它不创建、编辑、合并、删除 suggestion，不添加 supporter/comment/note/status，不上传附件、不发 supporter message，也不读取全部用户、CRM account、NPS 或 revenue profile。

UserVoice Admin API suggestion 同时暴露 `votes_count`、`supporters_count`、`requests_count`、`supporting_accounts_count`、`supporter_revenue` 等不同口径，并通过 links 连接 forum/category/status/parent/creator。[Admin API getting started](https://developer.uservoice.com/docs/api/v2/getting-started/) 这些指标不能统一为一个 popularity，也不能把 revenue 当 recurrence 或已收款事实。

```text
platform             uservoice
surface              owned subdomain Admin API v2
state                researched / admin-credential
verified level       evidence-review + static-contract only
callable routes      none
external effects     none
```

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 原生语义 |
| --- | --- | --- | --- |
| `uservoice-subdomain/v2` | account boundary | exact subdomain | host、tenant、trusted-client authority与数据边界 |
| `uservoice-forum/v2` | container | subdomain + forum ID | suggestion surface；有public/private与open/current counts |
| `uservoice-suggestion/v2` | request entity | subdomain + suggestion ID | mutable title/body/state/status/category/parent/creator与aggregate metrics |
| `uservoice-category/v2` | taxonomy | forum + category ID | forum-scoped分类；不能只按名称跨forum合并 |
| `uservoice-status/v2` | public lifecycle taxonomy | status ID + revision | 可自定义；决定vote/comment权限与open/closed语义 |
| `uservoice-internal-status/v2` | internal workflow taxonomy | internal status ID + revision | 仅管理员语境，不能作为客户陈述 |
| `uservoice-status-update/v2` | communication/event | update ID | public message、notification choice与reaction；状态名不等于消息 |
| `uservoice-supporter/v2` | support relation | supporter relation ID | 可能订阅更新；与vote/request/account计数非同义 |
| `uservoice-feedback-record/v2` | attributed request occurrence | record ID | 从不同source捕获的反馈，可指向suggestion；是否独立需identity/source审查 |
| `uservoice-comment/v2` | authored portal content | comment ID | public/end-user语境，与note/internal status update分开 |
| `uservoice-note/v2` | internal content | note ID | 内部管理员内容，默认不进入subject evidence |
| `uservoice-merge/v2` | lifecycle relation | losing suggestion → winning suggestion | losing item保留Merged状态，支持者/评论/反馈/标签迁移 |
| `uservoice-feature/v2` | delivery planning entity | feature ID | 与suggestion可关联，但不是部署或价值兑现事实 |

### 2.1 必须保留的语义

- `state`（approved/published/merged等）、public status、internal status 与status-update message是不同轴。
- public/internal status可自定义，且public status可允许vote+comment、vote-only、comment-only或none；生命周期映射必须绑定taxonomy revision。[Customize status](https://help.uservoice.com/hc/en-us/articles/360034982174-Customize-Public-and-Internal-Status)
- merge将losing idea从portal隐藏，并把supporters、comments、feedback和labels转移，description可成为winner comment；原item与其authorship不能被删除。[Merge Ideas](https://help.uservoice.com/hc/en-us/articles/8009924667027-Merge-Ideas)
- `votes_count`、`supporters_count`、`requests_count`与supporting accounts各自有定义；import、管理员代录、subscription和merge迁移影响独立性。
- `supporter_revenue`是CRM/账户派生金额，必须使用`MonetaryDatasetMetadata`和currency/authority证据，不能直接排序后声称支付意愿。
- includes/side-loading会把user name/email、NPS、external account等带入response；route字段allowlist必须在请求与持久化两端生效。
- cursor仅对部分sort/collection可用；page pagination在并发增删时可能跳过或重复。Link header决定next route，query/sort/per_page必须冻结。

## 3. Capability 与 adoption decision

| Capability | Subject → Result | Access/effect | Adoption |
| --- | --- | --- | --- |
| `taxonomy.list.owned-product-request-containers/v1` | subdomain → forums/categories/status taxonomies | admin API / none | `eligible-with-admin-credential` |
| `feedback.list.owned-product-request-items/v1` | approved forums → suggestions | admin API / none | `eligible-with-admin-credential` |
| `feedback.read.owned-product-request-item/v1` | suggestion → item/links/current aggregates | admin API / none | `eligible-with-admin-credential` |
| `feedback.list.owned-product-request-status-history/v1` | suggestions → status/activity entries | admin API / none | `conditional`; history completeness需验证 |
| `feedback.read.owned-product-request-support-aggregate/v1` | suggestion → count definitions/current values | admin API / none | `eligible-aggregate-first` |
| `feedback.list.owned-product-request-supporters/v1` | suggestion → people/accounts | sensitive admin API / none | `rejected-default` |
| `feedback.read.owned-product-request-comments/v1` | selected suggestions → public comments | admin API / none | `conditional` |
| `feedback.receive.uservoice-hook/v1` | service hook → event | push / local write | `deferred`; 本轮无固定signed delivery contract |
| `feedback.manage.*` | forum/suggestion/support/status/message → mutation | platform write | `rejected` |

## 4. Access Methods

### 4.1 `uservoice-admin-v2-policy-read/v1`

- trusted API client 通过client credentials或UI token获得Bearer token；官方明确trusted client具有管理员同等完整权限，包括删除内容。[Authentication](https://developer.uservoice.com/docs/api/api-key)
- 官方建议按用途创建独立client以便撤销，但没有证据表明可把Admin API client scope收窄为只读；本Pack始终标记`admin-credential`；
- exact subdomain host allowlist，禁止用户输入host、redirect、generic path；credential bytes/token不进入配置、日志或普通Settings；
- GET list使用fields/includes最小投影，默认不side-load users/external accounts/NPS；suggestions、forums、categories、statuses/status_updates分别有route与schema；
- 优先使用cursor/Link header；无cursor才用page overlap+dedupe。cursor绑定sort，不能改变per_page/query后继续；
- updated_after/before只证明provider过滤边界，采用lookback和observed revision处理同timestamp/late update；delete/merge需独立reconciliation；
- API按分钟限流，计算超过1秒会额外消耗单位；保存limit/remaining/reset/retry-after但不作高基数日志。[Rate limiting](https://developer.uservoice.com/docs/api/v2/getting-started/)
- UI生成token可能直到显式撤销才失效；credential rotation/last-verified/owner departure进入health与canary。

### 4.2 `uservoice-idea-collection-beta/v1`

Idea Collection API 使用OAuth Authorization Code + PKCE，官方reference标记Beta。它面向end-user idea collection/interaction，不是后台完整分析导出；会涉及用户侧write与delegated identity。当前仅`discovery-only/deferred`，不用于绕过Admin API高权限事实。

本轮未取得可版本化、signed、可重放防护的UserVoice service-hook delivery contract；push route保持blocked/deferred，不能根据Airbyte `service_hook_logs` stream推断webhook安全。

## 5. Platform Skills

### `uservoice-pack-research/v1`

- 核验Admin v2、Idea Collection Beta、merge/status/support/pagination/rate与固定OSS；
- 只生成proposal，不申请trusted client、不读取subdomain。

### `uservoice-product-request-acquire/v1`

- 输入：accepted Pack、forum/status taxonomy roster、field/visibility/support policy与window；
- 输出：native Observations、ProductRequest definition/item/span metadata、merge/status lineage、coverage；
- 默认只读suggestions+aggregate counts+public status；comments按选中item；users/supporters/accounts/notes/attachments/revenue默认拒绝；
- 所有POST/PUT/PATCH/DELETE、supporter message和permission endpoints均禁止。

### `uservoice-product-request-conformance/v1`

- fixture验证state/status/internal status、support metrics、merge迁移、cursor/page、side-loading、late update和admin credential负向writes；
- sandbox必须是用户另行授权的synthetic subdomain、专用可撤销client，且transport只编译GET allowlist；
- 无 Probe Skill。创建idea/support/comment/status/notification都可能联系用户或改变排行，需独立治理。

## 6. 数据治理与推断边界

- suggestion title/body/public comment可为subject-authored；admin feedback record、note、internal/public status update与provider aggregate分别标counterparty/provider provenance。
- supporter/vote/request/account/revenue不能互换；同一人多source、import、admin代录和merge迁移都可能重复。
- status `Completed`只证明产品团队声明；feature link/status update也不证明部署、adoption或满意。
- people/email、external account、NPS、segment、satisfaction和revenue默认不采；如果业务问题确需，必须独立purpose、field schema、monetary/identity policy和删除传播。
- merge、delete、spam、closed和status change追加revision/tombstone；不得只保留current winner导致原始请求与反证消失。

## 7. 开源与 Agent Artifact 快照

以下 revision 于 2026-08-26 只读固定，未 clone、安装或执行：

| Artifact / revision | Ownership / License | 价值 | 决策 |
| --- | --- | --- | --- |
| [Airbyte source-uservoice](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026/airbyte-integrations/connectors/source-uservoice) `1339a9e…`; image metadata `0.0.62`; manifest `5.12.0` | Airbyte community；ELv2；alpha | Admin v2 cursor/date/schema、30+stream taxonomy reference | `reference-only`；默认面含users/accounts/notes/permissions/messages等敏感streams，远超最小需求 |
| [uservoice/uservoice-ios-sdk v3.2.6](https://github.com/uservoice/uservoice-ios-sdk/tree/6e6e50b538224d35a1e73554de1373b5881ebab4) `6e6e50b…` | UserVoice official；Apache-2.0；2019 archived/deprecated | 历史portal identity/private-site模型参考 | `historical-only`；不是Admin v2 Connector或当前SDK |

未确认 UserVoice 发布的当前开源 Admin v2 SDK、MCP 或 Agent Skill；社区wrapper或通用REST工具不因能调用API而获得trusted-client权限。固定Airbyte connector只作为schema/fixture来源，不执行。

## 8. Verification Plan

| 场景 | 必须证明 |
| --- | --- |
| state/public/internal status | 三轴与taxonomy revision保留，权限语义不靠名称 |
| supporter/vote/request/account | 各字段定义与分母分开，不自动产出independent recurrence |
| revenue metric | currency/authority缺失则禁止货币排序和支付推断 |
| merge losing→winner | losing item与authorship保留；迁移counts/comments不制造新支持 |
| cursor pagination | cursor+sort/query冻结，直到无cursor；page=1不误判 |
| page mutation | overlap/dedupe，created/deleted期间coverage降级 |
| includes/fields | user/email/NPS/account/note/attachment不进入默认payload |
| status message/reaction | team communication与subject response分开 |
| broad admin token | create/update/merge/delete/support/message/permission/upload全拒绝 |
| no signed hook evidence | push保持blocked，不以mock或service_hook_logs冒充verified |

operational canary 监测Admin/Idea Collection docs、schema/fields/includes、forum/status roster、cursor/date/late update、rate cost、token age/revocation、merge/tombstone、PII/monetary quarantine、Airbyte stream/license与官方SDK状态漂移。

## 9. 晋级缺口

进入`modeled`需要accepted concepts/capabilities/admin access、definition/item/span schemas、forum/status roster与field policy；进入`verified`需要fixtures与用户授权synthetic subdomain sandbox。因为trusted client是管理员级，live read最多晋级为`verified-with-admin-credential`，不得宣称least privilege；push在官方signed contract固定前保持deferred。
