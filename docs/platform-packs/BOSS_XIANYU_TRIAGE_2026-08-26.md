# BOSS 直聘与闲鱼候选分流记录

状态：`triaged` 研究记录；不代表接入、获权或可调用  
核验日期：2026-08-26  
Campaign：`cn-demand-surfaces/2026-08-second-wave`

## 1. 要解决的问题

字面任务是继续增加平台；真实目标是增加能被追溯和验证的需求信号，同时不把高风险自动化误包装成 Connector。第二轮需要回答：BOSS 直聘与闲鱼中，谁更适合用来验证“官方 API 不完整时，系统如何保留价值、限制能力并安全 Probe”。

成功标准不是选出一个“能爬”的网站，而是形成以下可检查结果：

- 平台需求信号、原生概念和真实访问面被区分；
- 官方产品能力不被误写成官方机器 API；
- manual path、partner-only path 和 rejected automation 分开；
- Probe 的真实性、可履约性、账号与人工确认边界能落入 Platform Pack；
- 开源项目只提供字段、失败模式和 Skill 研究证据，不自动晋升为可采用 route。

## 2. 事实、约束与暂定判断

### 观察事实

- BOSS current [用户协议](https://about.zhipin.com/agreement?id=registerprotocol_33)（`20260617v2`）与[招聘行为管理规范](https://about.zhipin.com/agreement?id=postrules_11)（`20240828v1`）明确限制未经许可的第三方工具/ATS/插件、职位浏览/发布、简历收发、自动沟通，以及 spider、crawler 等非正常方式读取或转存数据；2019 URL只保留为历史证据。
- 闲鱼官方用户协议把搜索、浏览、收藏、信息发布、交易、评价和信息交流定义为产品服务，但这不能推导出通用服务器 API：[闲鱼社区用户服务协议](https://terms.alicdn.com/legal-agreement/terms/suit_bu1_other/suit_bu1_other201708081618_51146.html)。
- 闲鱼小程序当前是定向邀请的服务商能力；公开接入文档要求企业/签约主体、权限审批和聚石塔，公开列出的服务端能力主要围绕授权用户与订单链路：[小程序快速接入](https://open.goofish.com/doc/quick-start.html)、[服务端接入](https://open.goofish.com/doc/development/dev/server.html)。
- 闲鱼发布信息必须真实、准确、可合法销售并履行交易承诺；经营性卖家还承担如实描述等义务：[闲鱼社区卖家服务协议](https://terms.alicdn.com/legal-agreement/terms/platform_service/20220929192826912/20220929192826912.html)、[买家保障服务协议](https://terms.alicdn.com/legal-agreement/terms/platform_service/20220929192101114/20220929192101114.html)。

### 真实约束

- 当前任务只允许架构、知识和抽象契约，不授权登录、采集、发布、发送消息或执行第三方代码。
- “开源实现存在”不是平台授权，也不是 route 可用性证据。
- 招聘 Probe 不能以虚假岗位测试需求；交易 Probe 必须是用户确实拥有、能够交付并愿意承担订单责任的商品或服务。
- Cookie、会话、聊天消息、手机号、简历和候选人资料都是高风险边界，不能进入普通知识 snapshot、日志或 Agent Skill。

### 暂定判断

- BOSS 的岗位信号对 B2B 研究有价值，但当前只保留用户主动提供内容的本地 `manual-evidence-package` 候选；它不访问平台、不构成 Connector。可自动化的替代面优先使用 Greenhouse/Lever 等有官方公开 API contract 的 ATS。
- 闲鱼没有被证实的通用搜索/发布官方 API，但“人工观察 + 真实 listing 交接包 + 人工回执”可以形成不依赖 Cookie 的长期基线。
- 闲鱼 partner miniapp 是另一种受邀请、受审批的 account profile，不能替代普通账号研究路线。

## 3. 证据化比较

评级是相对判断，不是跨行业通用分数；每一项都必须回到上面的证据。

| 维度 | BOSS 直聘 | 闲鱼 |
| --- | --- | --- |
| 痛点表达 | 高：职责和技能缺口具体，但多是雇主表述 | 中：标题/描述较短，聊天与交易能补充语境 |
| 行动接近度 | 高：组织愿意投入人力预算 | 很高：价格、咨询、订单和退款接近支付 |
| 人群清晰度 | 高：行业、岗位、地区、资历 | 中：类目、地区和价格带；禁止个人画像 |
| 纵向信号 | 中：职位持续时间与重复招聘 | 高：listing 状态、咨询、订单、退款，但普通账号缺少官方导出 |
| Probe 适配 | 低/拒绝：不能发布虚假职位 | 条件高：仅真实、可履约、用户自有 listing，人工发布 |
| 官方机器接入 | 低：未找到面向本用途的公开 API | 分裂：普通搜索/发布未证实；受邀服务商有订单 API/message |
| 安全人工路径 | 有：用户选择职位后导入 | 有：用户选择 listing、人工发布与回执 |
| 自动化风险 | 很高：协议明确限制第三方工具与爬虫 | 高：社区项目依赖 Cookie、DOM 或 private mtop，官方 partner 面又高度受限 |
| 本轮结论 | `researched/manual-only`；本地 evidence intake 候选，平台 route 为零 | `researching`；编制受限型 Platform Pack |

## 4. 候选分流

### BOSS 直聘

- 候选状态：`researched/manual-only`，不是整个平台 `rejected`；
- 保留能力候选：`content.import.user-selected-job/v1`，模式 `manual-evidence-package`；它是本地 intake，不是 BOSS Connector；
- 明确不合格：自动登录、自动搜索、自动沟通、简历抓取和自动投递；
- Probe：不建立通用岗位发布能力；真实招聘属于独立业务流程，需要招聘主体、真实职位和专项审查；
- 下一研究触发器：出现官方开发者/企业数据出口、用户自有招聘后台 export，或明确授权的 ATS 集成证据。
- 完整设计：[BOSS 直聘招聘需求 Platform Pack](BOSS_ZHIPIN_RECRUITING_PLATFORM_PACK_DESIGN.md)。

### 闲鱼

- 候选状态：`researching`；
- 基线观察：用户可见、用户选择、最小字段的 `manual-import`；
- 基线 Probe：`manual-package` 只准备真实 listing，平台发布必须由用户在自有账号内完成并回填证据；
- partner route：仅在用户本身是受邀服务商并持有相应审批后，单独验证订单/消息能力；
- 明确不合格：private mtop/Cookie 直接调用、无人值守发布、自动私信、陌生人批量触达。

## 5. 开源候选快照

以下 HEAD 于 2026-08-26 通过只读 `git ls-remote <repo> HEAD` 核验；没有 clone、安装或执行：

| 平台 | Artifact | 固定 revision | 用途 | 决策 |
| --- | --- | --- | --- | --- |
| 闲鱼 | [babachen/xianyu-mcp](https://github.com/babachen/xianyu-mcp) | `44cbaa9630ceb03c89dc6101c7a1cbb60543abfa` | Rod/DOM、人工扫码、搜索、发布、幂等和超时失败模式 | `reference-only`；Apache-2.0 不改变平台授权 |
| 闲鱼 | [Tsinglung-Tseng/ali-mcp](https://github.com/Tsinglung-Tseng/ali-mcp) | `29d083a80f0b13224ada6831aad125499122990a` | 浏览器 tool mapping 和 selector drift | `reference-only`；MIT |
| 闲鱼 | [fancyboi999/goofish-cli](https://github.com/fancyboi999/goofish-cli) | `771382c2ea3fd281b78c015bf2bf8ed68cc873ff` | CLI/MCP/Skill registry、receipt/guardrail 研究 | `reference-only`；Apache-2.0，private mtop/Cookie/IM 不进入 route |
| BOSS | [zhengziha/boss-zhipin](https://github.com/zhengziha/boss-zhipin/tree/c2818328cb53773fbf2e5a2e7004123380a01a7d) | `c2818328cb53773fbf2e5a2e7004123380a01a7d` | Playwright/wapi/Cookie字段与反自动化风险 | `risk-reference`；common paths 未见 LICENSE |
| BOSS | [mucsbr/mcp-bosszp](https://github.com/mucsbr/mcp-bosszp/tree/df9ba573829ded5cdd05abcfe5f055fb89e0befa) | `df9ba573829ded5cdd05abcfe5f055fb89e0befa` | 二维码、Cookie、MCP search/greeting失败与副作用面 | `rejected-route-reference`；MIT不提供平台授权 |
| BOSS | [Snseam/boss-zhipin-mcp](https://github.com/Snseam/boss-zhipin-mcp/tree/06a1a7d804aa80131a066bddc1879ac4bc72f841) | `06a1a7d804aa80131a066bddc1879ac4bc72f841` | 候选人搜索、简历OCR/数据库、消息风险 | `rejected-sensitive-automation`；未见 LICENSE |
| BOSS | [longsizhuo/BossZhiPin_Job_Search](https://github.com/longsizhuo/BossZhiPin_Job_Search/tree/d797cdeede941cae502c09555206fa051c17fbbe) | `d797cdeede941cae502c09555206fa051c17fbbe` | 求职者自动化与人工确认UX风险 | `risk-reference`；MIT，README提示可能违反条款 |
| 招聘替代面 | [speedyapply/JobSpy](https://github.com/speedyapply/JobSpy/tree/fda080a373e8226f3fd60635323f5da9af9892b1) | `fda080a373e8226f3fd60635323f5da9af9892b1` | 多招聘站 schema 与封锁失败模式 | `schema-reference`；MIT，不作为官方授权依据 |

## 6. 下一步

本轮先完成闲鱼 Platform Pack，随后也完成 BOSS Platform Pack。两者共同证明：高价值平台可以只有人工 evidence intake 或 manual handoff；官方 partner/product能力只支持有证据的狭窄 capability；社区自动化即使技术可行，也可以被证据化地标记为 `rejected`，且不能被 Agent 自动升级。BOSS 与闲鱼因稳定概念不同，分别映射 `JobPosting*`/`RecruitingEngagement*` 和 `MarketplaceOffer*`/`MarketplaceOutcome*`，不合并为同一 Channel。
