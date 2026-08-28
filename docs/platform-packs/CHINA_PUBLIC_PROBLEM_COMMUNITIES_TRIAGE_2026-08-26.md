# 中国公开问题与技术社区候选分流

状态：`researched` 候选分流；未注册开放平台、未登录、未申请 Access Secret/Personal Access Token、未调用 API/MCP、未安装或执行 Skill/CLI/第三方项目、未采集或发布  
核验日期：2026-08-26  
目标：补齐中文语境下公开问题、经验、反例、替代方案和技术摩擦信号；比较知乎与 V2EX 的官方机器表面，选择能最大程度检验当前 Connector/Knowledge/Indexer 抽象的平台。

## 1. 第一性原理选择

需要补的不是“又一个中文社区名字”，而是当前系统缺少的事实类型：

```text
用户提出问题或经验
  -> 平台返回问题 / 回答 / 文章的搜索摘要
  -> provider selection / rank / authority context
  -> 必要时回到原始内容核验
  -> 提取可追溯痛点、失败尝试、workaround与观点分歧
```

这一链路必须能回答：搜索摘要是不是原文？搜索结果能否分页？平台评分代表什么？作者信息是否必要？API、Skill、MCP和网页是否是同一 access contract？官方声明“适合 AI”是否同时包含长期仓储、索引、训练和派生权？

本轮先选择知乎、随后完成V2EX独立Pack。知乎当前官方数据开放平台同时给出 typed REST API、官方 downloadable Skill、官方 CLI Skill 与 remote MCP，且明确面向 AI 产品，检验了“官方 AI 数据产品存在，但 adoption 仍须按用途、表示、合同和派生处理逐层决策”。V2EX则检验了Node作为独占且可移动container、榜单placement、legacy/v2 access profile隔离、用途澄清门和零写入社区规则。

## 2. 候选比较

| Candidate | 独特信号 | 当前官方接入 | 关键限制与不确定性 | 决策 |
| --- | --- | --- | --- | --- |
| 知乎数据开放平台 | 中文问题、回答、文章、精选评论、搜索排序和平台权威等级；另有热榜、直答和本人数据 | 官方 REST `zhihu_search`、downloadable Skill `2.0.0`、official CLI Skill `0.4.0`、MCP over SSE；Bearer Access Secret + timestamp | 搜索单次最多10条，API称`HasMore=false`；Skill示例却为true；结果是摘要不是完整原文；MCP为XML text；当前邀测/商务准入，公开页未给出足以固定长期保存、索引、训练、再分发和删除传播的独立开发者数据条款 | 第一 Platform Pack；`researched/contract-gated/no-route` |
| V2EX | Node、Topic、Reply、感谢、论坛式问题/经验、中文开发者语境 | API 2.0 Beta：PAT、node topics、topic、replies；旧公共 API 公平使用规则鼓励学术/移动应用/扩展 | 2.0 仍为 Beta；文档正文称默认600/IP/hour但示例header仍120；无通用搜索；pagination/response schema不完整；旧公平使用规则未明确允许本系统durable/index/AI用途；社区规则限制AI-generated content | 独立Pack完成；`purpose-clarification-required/no-route`，作为Channel第四个missing成员 |

两者不能互为运行时 fallback。知乎 search unavailable 不允许改用 V2EX，因为它们的 population、query、taxonomy、content type 和 selection 不同；V2EX无搜索也不能退到 HTML 或第三方搜索引擎。

## 3. 知乎当前官方证据

### 3.1 Typed REST API

[知乎搜索 API](https://developer.zhihu.com/docs?key=zhihu_search)当前公开：

- `GET https://developer.zhihu.com/api/v1/content/zhihu_search`；
- `Authorization: Bearer <access_secret>`、`X-Request-Timestamp`秒级时间戳；
- `Query`必填，`Count`默认/最大10；
- 返回 question、answer或article的title、content ID/type、summary、source URL、comment/vote counts、作者显示字段、edit time、精选评论、authority level与ranking score；
- `SearchHashId`标识本次搜索；当前`HasMore`固定为false；
- 错误类别包括参数、鉴权、频率限制和内部错误。

`HasMore=false`意味着“这次没有可继续请求的官方分页”，不意味着查询完整、话题完整或知乎全站完整。最多10条结果是 provider-selected top result sample。

### 3.2 Skill 与 CLI

- [知乎搜索 Skill](https://developer.zhihu.com/docs?key=zhihu_search_skill)下载URL为`https://developer.zhihu.com/download/zhihu_search_skills.zip`；2026-08-26只读静态审计得到 Skill version `2.0.0`、archive SHA-256 `a11c735d43ca3aaf9afd4eb533bd1017b90421f246f27fcd86f413630b843f5d`，包含`SKILL.md`和一个Python stdlib GET wrapper；common archive paths未见LICENSE。
- [Zhihu CLI](https://developer.zhihu.com/docs?key=zhihu_cli)通过官方 stable Skill ZIP分发；本次固定 Skill `0.4.0`、archive SHA-256 `dedd3b30d04424c06acad489d9f1614536f86ed32493d9aa40187d462a2335c9`、CLI manifest generated `2026-08-24T05:02:05Z`。
- CLI Skill声明搜索知乎/全网、热榜、直答、本人创作/关注/收藏和知识库；Access Secret保存在系统凭证库，第三方Web应用应使用独立OAuth，而不是向用户分发Access Secret。
- CLI Skill把“安装并初始化”解释为可安装CLI、验证凭证并最小读取一条本人内容。该组合授权语义不能被本系统继承；安装、凭证验证和业务读取必须继续拆成独立、可见、可撤销的effect。
- 两个ZIP没有被安装或执行，CLI binary也未下载。stable URL是mutable alias，必须使用版本化URL、hash、manifest generatedAt和license evidence固定审计对象。

### 3.3 Official MCP

[知乎搜索 MCP](https://developer.zhihu.com/docs?key=zhihu_search_mcp)当前公开：

- MCP over SSE，protocol example `2024-11-05`；
- tool=`zhihu_search`，query长度2–100、count 1–10；
- 只提供tools，不提供resources/prompts；
- tools/call结果通过SSE异步返回，外层MCP text、正文为XML；
- 文档建议把整段XML原样交给模型。

本系统不能照搬最后一条建议：搜索摘要和精选评论是外部不可信内容，必须按schema解析、限制大小、标记representation、隔离prompt指令并做字段最小化。对需求研究而言，typed REST候选优于XML text MCP；MCP存在不能替代data-use/retention/index rights。

### 3.4 准入和权利缺口

- 开放平台主页当前显示注册试用额度；official CLI Skill的`open-platform.md`列出邀测额度池，但同时说明访问申请与计费需邮件/商务处理；
- 公开文档支持AI应用甚至宣传授权数据训练场景，但没有公开一份可绑定本目标主体/用途的独立 developer/data-use contract，明确缓存、长期保存、全文索引、embedding/RAG、训练、再分发、作者归因、删除传播与衍生数据集权利；
- [个人信息保护指引](https://www.zhihu.com/term/privacy?external=true)第5.2版适用于知乎网站、SDK/API及相关服务，但它不是目标应用与开放平台之间的数据许可合同；
- 所以当前只有technical contract evidence，没有完整adoption contract。不得注册、申请试用或创建CredentialBinding。

## 4. V2EX 当前官方证据

- [API 2.0 Beta](https://www.v2ex.com/help/api)最后更新时间为2026-08-03，公开PAT认证和node/topic/reply读取；还包含notifications delete、token create、topic sticky/boost等write。
- PAT最多180天；[个人访问令牌](https://www.v2ex.com/help/personal-access-token)说明secret只在创建后10分钟完整显示，之后可查看使用次数/最后使用时间并删除。
- API页面称默认每IP每小时600次，但示例`X-Rate-Limit-Limit`仍显示120，必须以live response和新文档revision验证，不能任选一个数字。
- [旧公共API公平使用规则](https://www.v2ex.com/p/7v9TEc53)鼓励学术研究、手机应用和浏览器扩展，反对把API输出用于填充商业或个人网站，目标是避免垃圾站/content farm。该规则与2.0的关系、长期索引/AI用途和商业研究仍需官方澄清。
- 没有通用全文搜索contract；node topics是node-scoped browse，不等于query search或完整历史。

V2EX Pack已固定`Node -> Topic -> Reply`、可变container membership、hot/latest placement、pagination unknown、content representation、member最小化和PAT lifecycle；所有sticky/boost/token/delete notification write独立拒绝。当前不调用匿名旧API，也不申请PAT。

## 5. 固定开源/Artifact候选

以下证据于2026-08-26只读固定；没有clone、install、build、import或execute：

| Artifact / revision | 来源 / License | 可学习内容 | Adoption |
| --- | --- | --- | --- |
| official `zhihu-search` Skill `2.0.0` / `a11c735d…` | 知乎官方域名；archive未见LICENSE | typed GET wrapper、环境变量、5s timeout、raw JSON输出和secret替换 | `official-artifact-reference`；缺许可，不安装/复用 |
| official `zhihu-cli-skill` `0.4.0` / `dedd3b30…` | 知乎官方CDN；archive未见LICENSE | capability selection、系统credential store、update manifest、本人数据最小化和安装/验证副作用 | `official-agent-reference`；不执行，stable alias需drift monitor |
| [klarkxy/zhihu-search](https://github.com/klarkxy/zhihu-search/tree/e1e2fedf20336933365da761fa07d30e704a749f) `e1e2fedf…` | community；SATA，不是OSI许可 | official API wrapper、CLI/MCP allowlist、secret分离和工具面控制 | `schema-and-control-reference`；不作为开源依赖 |
| [iteng007/zhihu-mcp-server](https://github.com/iteng007/zhihu-mcp-server/tree/0475902fd52472a9484a56cadd6183d01048118a) `0475902f…` | community；common paths未见LICENSE | Cookie、zse96和private `/api/v4`依赖的高维护/越权风险 | `rejected-private-api` |
| [Douyh123/zhihu-mcp](https://github.com/Douyh123/zhihu-mcp/tree/d3b8d3c4a016ea0f5976eda283be5c032d31f369) `d3b8d3c4…` | community；common paths未见LICENSE | Playwright扫码、Cookie保存、反检测、搜索/发布/评论和本地全文副作用 | `rejected-browser-write-automation` |
| [WloBy-Labs/ZhihuMCP](https://github.com/WloBy-Labs/ZhihuMCP/tree/e3502aec0d972f102877e57220ae84b772539841) `e3502aec…` | community；common paths未见LICENSE | read-mostly browser/API/DOM fallback与draft/write guard失败面 | `risk-reference-only` |
| [zhihu/zhihu-mediacloud-uploader](https://github.com/zhihu/zhihu-mediacloud-uploader/tree/c136afd14f64a824e479168b467727fca424dc5d) `c136afd1…` | official GitHub org；common paths未见LICENSE | media upload/publishing credential和write surface存在 | `out-of-purpose-write-reference`；不从官方org推断搜索权 |
| [tamnd/v2ex-cli](https://github.com/tamnd/v2ex-cli/tree/69822ce8803f9e6c2c317686556eb47d62e3488d) `69822ce…` | community；Apache-2.0 | legacy read client、typed model、pace/retry/body limit | `reference-only`；部分endpoint未在当前官方旧API页列出，不执行 |
| [isaced/V2exAPI](https://github.com/isaced/V2exAPI/tree/2e15716b7315a2f274fa17eedaa399095f5d0156) `2e15716…` | community；MIT | legacy/v2 response model | `schema-witness-only`；较旧且token path与现行文档冲突，不执行 |
| [funnythingfunnylove/mcp-server-v2ex](https://github.com/funnythingfunnylove/mcp-server-v2ex/tree/e912dd572d4701a6dbe7a7458792842928b54ff0) `e912dd5…` | community；MIT | MCP tools/prompts的风险样本 | `rejected`；无测试、raw JSON直入模型、delete method错误、提交token-like literal，不安装/执行 |

代码/Skill许可和平台数据权利始终分开。官方GitHub org也不代表其中任一write tool适合需求研究。

## 6. Probe 与 Channel决定

- 知乎/V2EX公开讨论的read不授权发问题、回答、文章、评论、点赞、感谢、置顶、boost或通知删除。
- 内容Probe只有在用户真实拥有相关问题/产品、遵守社区规则并由真人负责时才可能另行设计；本轮不产生文案或manual write package。
- 知乎先作为第三个`contract-gated`成员进入 [Public Technical Discussions Channel](PUBLIC_TECHNICAL_DISCUSSION_CHANNEL_PACK_DESIGN.md)，用query portfolio限制为技术问题/问题解决场景；不把全网搜索、热榜、直答、本人数据或知识库一并加入。
- V2EX独立Pack完成后以`purpose-clarification-required`第四成员加入Channel；membership只发布missing-member coverage，不创建route，也不因它能映射`PublicDiscussion*`而跳过用途门。

完整设计见 [知乎开放搜索 Platform Pack](ZHIHU_OPEN_SEARCH_PLATFORM_PACK_DESIGN.md) 与 [V2EX Node Discussion Platform Pack](V2EX_NODE_DISCUSSION_PLATFORM_PACK_DESIGN.md)。

## 7. 重新发现触发器

- 知乎发布versioned developer/data-use terms、商业合同样本、retention/index/training/redistribution/deletion规则；
- `zhihu_search` schema、HasMore、count、content types、ranking/authority字段或错误码变化；
- Skill/CLI/MCP version、hash、transport、protocol、tool schema或artifact license变化；
- V2EX API 2.0退出Beta、发布search、明确fair-use与AI/index/commercial用途或修正rate冲突；
- 任一平台发布官方webhook/export、删除流、revision API或内容license metadata。

Drift只生成KnowledgeProposal；不会自动下载、安装、升级、申请凭证、创建route或调用平台。
