# Stack Exchange Public Q&A Platform Pack（设计）

检查日期：2026-08-26
Pack：`stackexchange-public-qa/v0-design`
状态：`researched / acquire-policy-blocked / no-callable-route`

## 1. 采用结论

Stack Exchange 的 API v2.3 足以表达站点、问题、回答、评论、修订和部分 timeline；但“API 可读”“内容采用 CC BY-SA”“可为本系统长期采集并建立 AI 辅助索引”是三个不同判断。

现行 Acceptable Use Policy 明确限制自动收集 Network 内容用于生成式 AI、聊天机器人、LLM 或其他机器学习系统的开发、训练、测试、索引、基准或改进，除非取得事先书面同意。因此，本系统面向需求挖掘的系统性采集、长期仓储和索引在取得书面许可前为 `policy-blocked`，Pack 不发布 callable acquire route。官方 MCP 也明确限制为实时使用并禁止长期或程序化存储、索引、缓存，不能作为数仓入口。

## 2. 稳定概念

| 概念 | 必须保留的语义 |
| --- | --- |
| Network / Site | 一次 API 查询绑定一个 `site`；跨站点结果不能混成一个原生 namespace |
| Question | 根问题；closed、locked、migrated、answered、accepted answer 为正交事实 |
| Answer | 回答记录；accepted 仅由 exact `accepted_answer_id` 关系成立 |
| Comment | 附着于 question 或 answer 的短记录，不是 answer |
| Revision | question/answer 的修订；内容许可需按 revision 日期判断 |
| Question timeline | 官方仅提供事件子集，投票数据被 scrub，不能称完整审计日志 |
| Tag | 站点内 taxonomy，不是跨站点统一类别 |
| Linked / Related / Migration | 仅接受官方 exact relation，不用文本相似度替代 |
| Score / count | 平台派生上下文；不等于独立复现、需求规模或解决质量 |

`unanswered`、`no answers`、`is_answered` 和 `accepted answer` 不是同义词。当前 `unanswered` 的规则涉及是否存在正分回答，且官方声明规则可变；Pack 必须固定定义 evidence 和 valid window。

## 3. 能力目录与采用状态

| Capability | 官方 surface | 采用状态 | 说明 |
| --- | --- | --- | --- |
| `taxonomy.list.public-qa-sites` | `/sites` | `rejected-current-purpose` | 技术可读，仍受用途 policy gate |
| `taxonomy.list.public-qa-tags` | tags routes | `rejected-current-purpose` | tag 为 site-local |
| `discussion.search.public-questions` | `/search/advanced` | `rejected-current-purpose` | 只搜 question；`q` 算法未公开，relevance 不稳定 |
| `discussion.list.public-questions` | question routes | `rejected-current-purpose` | `site`、filter、sort、page 均进入 definition |
| `discussion.read.public-thread` | questions/answers/comments | `rejected-current-purpose` | 不由 API 可用性推导数据用途许可 |
| `discussion.read.public-revisions` | revision routes | `rejected-current-purpose` | 必须保留 revision-level license |
| `discussion.read.public-timeline` | question timeline | `rejected-current-purpose` | partial coverage，不是完整历史 |
| question/answer/comment create/edit/delete | write routes | `rejected` | 不进入只读研究 Pack |
| vote/accept/favorite/flag/suggested-edit | write routes | `rejected` | 会改变排序、状态、通知或治理 |

若未来取得书面许可，仍需新 Pack revision 逐 route 复核，不得把本设计状态原地改成 callable。

## 4. 接入与运行契约

- API version 固定为 `2.3`；wrapper、error、quota、backoff、has_more 都是协议事实。
- 同一语义请求不可快于每分钟一次；单 IP 超过每秒 30 请求被视为滥用。
- 默认每日 quota 为 10,000；响应中的动态 `backoff` 必须强制执行。
- `page` 从 1 开始，`pagesize` 最大 100；匿名请求最大 page 25。
- `total` 成本高且默认不返回；coverage 不能由最后一页数量猜测。
- filter 不可变且不失效；Pack 必须固定 filter ID/hash。safe filter 不保证 body 没有 HTML。
- exact site、query portfolio、sort、time window、page frontier、has_more、quota 与 backoff 构成 checkpoint。
- 删除、迁移、关闭、锁定和修订必须通过后续观察传播；一次 snapshot 不能宣称完整历史。

## 5. 权利、归因与数据处理

- API Terms 要求显著归因。
- public contribution 的 CC BY-SA 版本随 contribution/revision 日期变化；每个 question/answer revision 应记录 `ContentLicenseRef`。
- 内容许可不覆盖平台 API 使用条款，也不自动覆盖作者资料、外链内容或本系统目的。
- 默认不采集 user profile、私有信息、跨站点账户映射或可识别身份；作者只保留 scope-local opaque ref。
- 外链只形成 `SourceArtifactDescriptor`；Stack Exchange 内容许可不授权下载、保存或索引外部页面。
- 当前 purpose decision 为 `blocked-without-prior-written-consent`，在 network call、fixture 以外的 validation 和 Connector binding 之前执行。

## 6. 官方 MCP、Agent Skill 与开源候选

| 候选 | 固定证据 | 结论 |
| --- | --- | --- |
| [Stack Overflow MCP Server](https://api.stackexchange.com/docs/mcp-server) | 官方 Beta；`so_search`、`get_content`；100 calls/user/day | 仅实时研究候选；MCP Terms 禁止长期/程序化存储、索引和缓存，不能接仓库/索引器 |
| [Stack Overflow MCP Terms](https://stackoverflow.com/legal/mcp-server-terms-of-use) | 当前官方条款 | `rejected-as-acquire-route` |
| [Stack Overflow JavaScript SDK](https://api.stackexchange.com/docs/js-lib) | 官方 hosted OAuth helper | 不是服务端采集 SDK；mutable hosted script |
| [StackExchange/StacMan](https://github.com/StackExchange/StacMan/tree/94e30128202dfc58fd7c21f709206bed4a23ea52) | commit `94e3012…`；MIT | 官方 namespace 的参考 client；README 仅称支持 API 2.1，不能作为 2.3 conformance 证据 |
| [Stack Overflow for Agents](https://agents.stackoverflow.com/all?tag=agent-skills) | 官方 Beta 页面；skill URL 在本次审查返回 403 | 独立的 agent community/write surface；未获取 skill 内容与 hash，不安装、不推断工具列表 |

未识别到面向 public API acquire 的固定官方 Agent Skill；“官方 MCP 存在”也不代表其许可范围能满足本系统。

## 7. Projection 与推断边界

映射到 `PublicDiscussionDefinitionMetadata`、`PublicDiscussionRecordMetadata` 和 `PublicDiscussionSpanMetadata`。只有 reviewed question/answer/comment authored span 才可能派生 complaint、failed-attempt、workaround、switching、urgency 等既有证据类型。

以下均不能自动晋级：question score、answer count、view count、accepted answer、closed、linked/related、unanswered 排名。accepted 仅证明提问者或平台记录的 exact acceptance，不证明普适正确、已部署或长期满意。

## 8. 验证与可观测性设计

当前仅允许 documentation evidence review、静态契约和离线 fixture conformance：

- positive fixtures：question + accepted answer、question + comments、migration relation、revision license；
- negative fixtures：`unanswered` 被误当零回答、score 被当复现数、timeline 被当完整历史、body HTML 被当纯文本；
- policy fixture：任何长期 index/warehouse plan 必须在 route resolution 前返回 policy-blocked；
- MCP fixture：任何持久化、缓存或索引 binding 必须拒绝；
- zero-write fixture：create/edit/delete/vote/accept/flag 等 capability 不得出现在 acquire Connector。

若未来政策门通过，新增观测：site/filter/query drift、page/has_more gap、quota/backoff、semantic-request cadence、revision/license/attribution coverage、closed/locked/migrated/deleted transition、timeline partial coverage、正文 HTML 处理与零写入 conformance age。

## 9. 主要官方证据

- [Stack Exchange API v2.3](https://api.stackexchange.com/docs)
- [Throttles](https://api.stackexchange.com/docs/throttle)、[Paging](https://api.stackexchange.com/docs/paging)、[Filters](https://api.stackexchange.com/docs/filters)
- [Advanced Search](https://api.stackexchange.com/docs/advanced-search)、[Question type](https://api.stackexchange.com/docs/types/question)
- [Unanswered Questions](https://api.stackexchange.com/docs/unanswered-questions)、[No Answer Questions](https://api.stackexchange.com/docs/no-answer-questions)
- [Question Timeline](https://api.stackexchange.com/docs/questions-timeline)
- [API Terms](https://stackoverflow.com/legal/api-terms-of-use)、[Acceptable Use Policy](https://stackoverflow.com/legal/acceptable-use-policy)
- [Public Network Terms](https://stackoverflow.com/legal/terms-of-service/public)、[Content Licensing](https://stackoverflow.com/help/licensing)
