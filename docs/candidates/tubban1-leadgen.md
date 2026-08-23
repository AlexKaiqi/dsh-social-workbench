# 候选审计：`tubban1/leadgen`

- 核验日期：2026-08-23
- 仓库：[github.com/tubban1/leadgen](https://github.com/tubban1/leadgen)
- 默认分支：`main`
- 固定审计版本：`775c9c5aea31c8ed0252be50a288fe8cbd76f4a2`
- 项目定位：瑞士本地商家发现、站点生成、域名部署和邮件触达闭环
- 当前决定：`reference`，不作为 library、delegate 或可执行 adapter 引入
- 许可证状态：`unresolved`；README 声称 MIT，但该版本没有 `LICENSE` 文件，GitHub API 也未识别许可证

## 结论先行

这个项目不是通用的“跨社交平台采集/分析/发布框架”，也没有社交平台 adapter catalog。它是一个高度垂直、强耦合的销售自动化产品样例：

```text
Google Maps 浏览器抓取
  -> Serper 搜索补全/排除已有网站商家
  -> OpenAI 或硬编码预设生成商家网站配置
  -> Neon PostgreSQL
  -> Vercel 挂载子域名
  -> GoDaddy 写 DNS
  -> Resend 邮件草稿/可选发送
```

它对 Social Workbench 最有价值的部分是“阶段化闭环”和“配置驱动多租户渲染”的产品原型。当前代码不能直接复用：许可证不成立、仓库极新、没有测试/CI、关键模块无法导入、数据库契约冲突，并且在身份认证、事实生成、外部副作用和结果对账上存在严重缺口。

采用边界：

- 可以参考 pipeline 阶段、领域表拆分意图、站点配置对象和草稿优先的交互。
- 不复制源码，不导入 Python module，不执行其 scheduler，不复用凭据模型。
- 不把 Playwright Google Maps 抓取登记为生产 Ingress。
- 不把 Vercel、GoDaddy、GitHub 或 Resend 类包装成可发布 Tool。
- 如果未来要验证某个思路，应从官方 API 和本项目 Port 契约重新实现一个最小 conformance spike。

## 1. 仓库与成熟度快照

GitHub 元数据在核验时显示：仓库创建于 2026-08-21，最近推送于 2026-08-22，约 330 KB、4 stars、0 forks、0 open issues，未归档。它在核验日仅存在约两天，不能用“生产级”“enterprise”或“100% autonomous”等 README 表述替代维护历史和验证证据。

| 维度 | 观察 | 判断 |
| --- | --- | --- |
| License | README 尾部写 MIT；根目录无 LICENSE；API `license=null` | 在补齐明确许可证前没有复制、修改或分发许可 |
| Release/tag | 未发现 tag 或 release | 无稳定版本边界 |
| Python dependencies | `requirements.txt` 只有包名，没有版本或 lockfile | 构建不可复现 |
| Frontend dependencies | Next.js 14 / React 18 / Neon client，有 `package-lock.json` | 前端依赖相对可复现，但没有测试脚本 |
| Tests | 仅有一个命名为 test 的 Vercel live diagnostic；无单元/契约/E2E suite | 不能证明主要行为 |
| CI | 未发现 GitHub Actions | 无持续验证 |
| Scope | 瑞士城市、本地域名、GoDaddy、Vercel、Neon 强绑定 | 不是可替换 adapter framework |

本轮只做静态和只读检查，没有安装依赖、运行采集器、访问业务 API、读取真实凭据或执行部署。

## 2. 实际模块与数据流

| 阶段 | 主要实现 | 外部系统 | 实际行为 |
| --- | --- | --- | --- |
| Discovery | `agents/lead_discovery.py` | Google Maps Web | Playwright 打开搜索结果、点击卡片、解析 DOM，提取名称、评分、评论数、地址、电话和评论片段 |
| Enrichment | `agents/lead_enrichment.py` | Serper.dev | 搜索商家名称，以域名包含名称 token 判断是否已有官网；从摘要和 URL 中用正则找邮箱 |
| Transformation | `agents/website_builder.py` | OpenAI Chat Completions（可选） | 生成多租户 `site_config`；失败或没有 key 时使用大型硬编码行业预设 |
| Knowledge/CRM | `crm.py` | Neon PostgreSQL 或 SQLite | 试图拆成 leads、enrichments、site configs、deployments 和 email log，并创建聚合 view |
| Deployment | `agents/deploy_agent.py`、`vercel_agent.py`、`godaddy_agent.py` | Vercel、GoDaddy | 挂域名、保存验证记录、写 CNAME/TXT、触发验证、到期时解绑 |
| Outreach | `agents/email_agent.py` | Resend（可选） | 默认存草稿；显式 `auto_send=True` 时可真实发送 |
| Automation | `scheduler/scheduler.py` | APScheduler | 每日自动发现、补全、建站、部署、跟进和到期下线 |
| Renderer/Admin | `multi_tenant_site/` | Next.js、Neon | 按子域名读取配置，提供商家编辑和全局 leads API |

README `.env.example` 中还出现 Outscraper，但当前发现实现实际使用 Playwright；GitHub agent 也存在于源码，却不属于 README 主流程。这说明文档、配置和执行面已经发生漂移。

## 3. 映射到 Social Workbench 四层

| Social Workbench 层 | `leadgen` 提供了什么 | 复用结论 |
| --- | --- | --- |
| Ingress | Google Maps DOM 抓取、Serper 搜索补全 | 只作为失败模式和字段样本；不是官方/授权 connector，DOM selector、条款和来源权利均脆弱 |
| Knowledge Repo | 多表拆分和聚合 view 的意图 | 概念可参考；当前 migration/schema 不一致，不能复用实现 |
| Knowledge Access | “是否已有网站”和邮箱发现启发式 | 不构成 evidence-aware retrieval；没有 EvidenceSpan、ACL、版本、置信度校准或反例 |
| Transformation | 商家站点 JSON config、多租户 renderer | `site_config -> renderer` 模式值得参考；事实必须改为 evidence ledger + unresolved field，不能编造 |
| Tools / Publish | Vercel、GoDaddy、GitHub、Resend 封装和 scheduler | 仅作为外部 effect 清单；缺少 preview、approval、idempotency receipt、reconcile、撤权和 unknown 状态 |
| Social publishing | 无 | 不能帮助解决各社交平台 OAuth、媒体上传、草稿、审核、发布和指标回流 |

因此，它更像“一个特定销售漏斗的纵向 demo”，不是本项目要寻找的整体框架或 adapter 基座。

## 4. 可复用设计元素

### 4.1 阶段化 pipeline

Discovery、Enrichment、Transformation、Deployment、Outreach 被明确分成模块。这支持一个正确的不变量：采集、推断、生成和外部动作不应混成一次不可恢复的 Agent 调用。

Social Workbench 可吸收其阶段命名，但必须把每一步改成：

```text
immutable input refs
  -> typed result + evidence/provenance
  -> checkpoint/status
  -> policy gate
  -> optional approved effect
  -> receipt + reconciliation
```

### 4.2 领域记录分离意图

把商家身份、富化信息、站点配置、部署和邮件日志分开，比把所有字段塞进一个 lead JSON 更接近长期系统。可进一步抽象为：

- `SourceItem`：外部观察到的商家记录；
- `DerivedFact`：搜索/模型产生的、带证据与置信度的结论；
- `ArtifactRevision`：站点或内容配置版本；
- `PublicationPlan`：尚未执行的外部动作；
- `PublicationReceipt`：平台实际结果。

这里只借鉴领域边界，不复用 SQL，因为当前代码与文档有多套互相冲突的 schema。

### 4.3 配置驱动的多租户 renderer

`docs/Site_Config.md` 和 Next.js renderer 展示了“一个 renderer + 每个租户一份配置”的思路。对未来工作台，可以迁移为：

- 一份证据化 ContentBrief；
- 多个平台 `PlatformVariant`；
- 渲染器只消费经过验证的字段；
- 未知信息保持 `null/unresolved`，不由模板补成事实；
- 每个变体绑定来源、生成 revision 和批准记录。

这比为每个平台或客户生成独立代码仓库更容易维护。

### 4.4 草稿默认值

`EmailAgent.send(..., auto_send=False)` 默认只保存草稿，这个局部决策符合人机协作方向。应把它提升为整个 Tool Port 的强制契约，而不是只在邮件方法参数中约定。

## 5. 阻止直接复用的问题

### 5.1 当前 checkout 不能形成可运行的主流程

`python3 -m compileall` 通过只能说明语法成立。静态导入核验发现多个模块从 `config.py` 导入不存在的名字：

- Discovery 缺少城市、行业和过滤阈值；
- Enrichment 缺少 Serper key；
- Email 缺少 Resend、发件人和价格配置；
- GitHub 缺少 token/org；
- utilities 缺少 canton language；
- 一个 GoDaddy 调试工具缺少 token。

因此主要 Agent 在当前版本会在 import 阶段失败，README 的端到端命令没有对应的可运行证据。

### 5.2 数据库事实源不一致

静态检查发现：

- PostgreSQL `leads` 建表不含 `slug`、`subdomain`，`insert_lead` 和 `update_lead` 却直接写这些列；
- `deployments.lead_id` 没有唯一约束，代码却使用 `ON CONFLICT (lead_id)`；
- `email_log.id` 同时作为主键并引用 `leads(id)`，会阻碍同一 lead 的多条正常日志；
- SQLite 没有创建 `email_log`，但 Email Agent 会调用日志写入；
- 文档中的 schema、`crm.py` schema 和 Next.js 查询字段不一致；
- 多个 `tools/` 脚本以临时迁移方式继续修改 schema，缺少唯一 migration 事实源。

这会导致环境相关失败、错误 join、重复 deployment 或无法记录邮件，不能作为 Knowledge Repo 基础。

### 5.3 把生成内容伪装成商家事实

fallback builder 会生成或默认填入商家法律名称、成立年份、注册号、VAT、服务项目、价格、营业表述和其他细节；LLM prompt 还要求生成“3 authentic reviews”，但输入没有提供三条可验证评论。代码也可能把 aggregate 标为 `verified: true`。

这是架构级问题：生成器不知道事实和创意文案的边界。对于真实商家，错误内容可能造成冒用、误导、品牌和法律风险。

可接受的替代契约是：

| 字段状态 | 允许行为 |
| --- | --- |
| `observed` | 保存精确来源、时间和 span，可在权限允许时展示 |
| `derived` | 保存规则/模型、证据、置信度和可反驳性，不冒充观察事实 |
| `proposed_copy` | 明确标为营销草稿，批准前不可公开 |
| `unknown` | 保持空值并请求确认，禁止模板捏造 |

### 5.4 管理认证和秘密处理不合格

- 商家后台密码明文保存在数据库，并以字符串相等方式校验；没有 hash、session、rate limit 或锁定证据。
- 全局 `/api/admin/leads` GET 没有看到认证检查，却会返回所有 leads 和 `admin_pass`。
- 密码会进入邮件 HTML、终端输出和多个诊断工具。
- Vercel verification 值也会打印和持久化；整个设计没有 secret classification/redaction policy。
- `.env` 被代码作为凭据事实源，不能替代 DSH Credentials 和 credential ref。

即使仓库只用于本地实验，这些模式也不应进入插件或生产服务。

### 5.5 高影响动作没有安全状态机

`scheduler` 的建站任务会自动调用 Vercel 和 GoDaddy；到期任务会解绑域名。GitHub agent 还能创建/删除仓库。当前没有统一的：

- 不可变 preview；
- 与 preview hash 绑定的用户批准；
- scoped credential ref；
- idempotency key；
- action outbox；
- per-step receipt；
- `unknown` / partial success；
- reconcile 与补偿策略；
- destructive action 再确认。

更严重的是，`DeployAgent.run` 没有根据 CNAME/TXT 写入或 Vercel 验证结果决定最终状态：它仍调用 `set_deployed` 并返回 `status="deployed"`。这会把部分失败伪装为成功。Vercel agent 还硬编码了一个项目特定 CNAME fallback；GoDaddy agent会依次尝试生产和 OTE endpoint，并吞掉异常，环境隔离和错误归因都不清晰。

### 5.6 Ingress 的来源与合规边界不足

Discovery 使用带固定 selector 的 Playwright 直接操作 Google Maps Web，而非稳定、授权和有配额契约的官方接口；页面变化、同意页、地区差异和风控都可能破坏它。Enrichment 以“任一名称 token 出现在域名中”作为已有官网判断，并从搜索摘要中抽取首个邮箱，容易产生同名、目录缓存、过期邮箱和归属错误。

数据对象没有记录：

- 原始响应/页面 hash；
- 每个字段的来源和 exact span；
- 抓取时间、许可/rights、retention；
- 删除/纠正；
- 规则版本和置信度；
- 同一商家的 identity resolution 证据。

所以这些实现不能满足工作台 Ingress Port 的 provenance 和合规门。

## 6. README 声明与实现差异

| 声明 | 实现证据 | 结论 |
| --- | --- | --- |
| “MIT License” | 无 LICENSE，API 未识别 | 许可证未成立 |
| “100% 自动化/生产级” | 无测试/CI；关键 import 缺失；schema 冲突 | 宣传语，不是运行证据 |
| “No hardcoded templates” | builder 内含大型行业预设和固定服务/价格/文案 | 与实现相反 |
| “真实评价/真实商家数据” | LLM 被要求生成 authentic reviews；fallback 生成法律/价格事实 | provenance 不成立 |
| “部署成功” | DNS/验证失败后仍写 deployed | 状态语义不可信 |
| `.env` 的 Outscraper | 实际 discovery 是 Playwright | 配置漂移 |

## 7. 如果只抽取可复用思想，如何改造

不 fork 整仓库。按以下顺序重建最小组件：

1. **抽象 pipeline graph**：把五阶段改写为 Port 间的数据契约，不依赖瑞士、GoDaddy 或特定域名。
2. **建立 Fact Ledger**：任何商家字段都带 source/evidence/status；生成内容只能进入 proposed revision。
3. **替换 Ingress**：优先官方 Places/Business API、开放目录、RSS 或用户授权数据；浏览器方式只在明确允许时作为隔离 adapter。
4. **保留 config renderer 思路**：重新定义受 JSON Schema 校验的 `ContentArtifact` / `PlatformVariant`，renderer 不读取密码或凭据。
5. **把外部动作放入 Outbox**：Vercel/域名/邮件/社交发布都先 preview + approve，再执行并保存 receipt/reconcile。
6. **复用现有组件**：DSH Credentials、WorkSurface、PostgreSQL/pgvector/pg-boss、Postiz/官方 API，而不是复制本仓库的 `.env`、scheduler 和 provider clients。

## 8. 采用评分

评分范围 0–5，代表当前固定版本对 Social Workbench 的适配程度，不是对作者或产品创意的评价。

| 维度 | 分数 | 说明 |
| --- | ---: | --- |
| 问题贴合度 | 2 | 有采集→分析→生成→动作闭环，但不是跨社交平台工作台 |
| Adapter 可替换性 | 1 | provider、地域、域名和数据结构强耦合 |
| Provenance / evidence | 0 | 缺少字段级来源，且生成内容混入事实 |
| Action safety | 0 | 无统一批准/outbox/receipt，失败可被写成成功 |
| Security | 0 | 明文密码、未保护的 leads API、秘密输出风险 |
| 可运行性/测试 | 0 | 关键 import 和 schema 阻塞，无测试/CI |
| License/reuse clarity | 0 | README 与仓库许可证事实不一致 |
| 设计参考价值 | 3 | 阶段化漏斗、多租户 config renderer 和草稿思路可借鉴 |

最终分类：`reference`。在许可证、可运行性、事实边界和安全状态机全部发生实质变化前，不升级为 `library` 或 `delegate`。

## 9. 后续监测条件

只有出现以下证据才值得复审：

- 添加有效 LICENSE，并明确历史代码的授权；
- 发布 tag/release 和可复现依赖；
- 主流程测试、数据库 migration 测试和 CI；
- 移除明文密码与未授权 admin API；
- 事实/生成内容分离，所有商家事实有 provenance；
- 部署动作具备批准、幂等、partial/unknown、receipt 和 reconcile；
- Ingress 说明官方/非官方方式、数据权利、删除和保留策略；
- adapter interface 与瑞士/GoDaddy/tubban.com 解耦。

在此之前，将该仓库保留在研究索引中，不进入依赖、插件装配或本机 profile。
