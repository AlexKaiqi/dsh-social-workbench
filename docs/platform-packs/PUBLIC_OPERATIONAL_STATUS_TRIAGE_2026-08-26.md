# 公开运行状态与事故通告候选分流（2026-08-26）

状态：`researched / design-only / no-callable-route`

## 1. 为什么是独立信号

评论、客服和监管投诉依赖人主动表达；Sentry/Crashlytics是组织内部遥测；公开状态页则是服务提供者对外发布的事故、受影响组件、维护、恢复与复盘声明。它能发现“厂商公开承认了什么运行问题”，但不是原始监控、用户原话或独立审计。

因此本轮不把status page当监控系统，也不把incident当一次真实故障、一个根因、一个SLA违约或一批受影响用户。稳定抽象必须分开page、component/resource、incident、update、scheduled maintenance、postmortem、current state、bounded history、publisher computation/override和mirrored third-party provenance。

## 2. 候选比较

| 候选 | 价值 | 官方公开读取面 | 主要限制 | 决策 |
| --- | --- | --- | --- | --- |
| Atlassian Statuspage | 成熟的component、incident/update、maintenance、postmortem与impact模型 | page-level `/api/v2`：summary、status、components、unresolved/recent incidents、maintenance；公开active paid page无需鉴权 | recent incidents最多50条；component可脱离incident改状态；impact可计算/覆盖；uptime历史可编辑；private/trial API key没有read-only scope | 首个Pack；`fixture-eligible / recent-50 / no route` |
| Better Stack public status JSON | 一个JSON:API文档覆盖page、section、resource、status report/update和90天资源状态历史 | 任意公开status page追加`/index.json` | “complete status page data”只指当前文档，不代表无限历史；resource可手工跟踪；manual/automatic/maintenance来源不同 | 第二Pack；`fixture-eligible / current+90-day / no route` |
| Instatus public summary | 很小的page + active incident + active maintenance合同，适合active-only成员 | status page `/summary.json` | 只有活动项，无历史；私有API含写操作和workspace用户资料，不得fallback；官方OpenAPI与公开文档在全局auth表达上有漂移疑点 | 第三Pack；`fixture-eligible-limited / active-only / no route` |

首版Channel requested=3、fixture-eligible=3、callable=0；coverage必须逐成员、逐representation报告。Instatus active-only通过不能提高history coverage。

## 3. 第一性边界

- 状态页是publisher-authored communication，不是independent monitoring truth；遗漏、延迟、回填、编辑和删除都可能存在；
- component/resource taxonomy由publisher定义，不同页面的“API”“database”“region”不能按名称直接合并；
- component状态可在没有incident时变化；incident也可能不改变component状态；两者必须独立建模；
- scheduled maintenance和unplanned incident严格分开；维护本身不生成`operational-disruption`证据；
- investigating/identified/monitoring/resolved/postmortem是沟通生命周期；identified是publisher root-cause claim，resolved是publisher recovery claim；
- page condition和incident impact可能由provider计算，也可能手工覆盖；必须保存computed/overridden provenance；
- uptime/history可能基于声明的component状态且可编辑，不是独立SLI/SLA measurement；
- third-party component mirror仍是上游publisher声明；本地override后不能冒充上游状态；
- incident/update HTML按不可信内容处理；未经过sanitization和content-rights review不能产生EvidenceSpan；
- 订阅、webhook注册、incident/maintenance/component状态写入和“测试事故”都是平台副作用，不是需求probe。

## 4. Agent Skills、MCP 与开源候选

### Atlassian Statuspage

未发现Statuspage public Status API专用的官方Agent Skill、MCP server或官方开源client。Atlassian通用Agent/Teamwork能力不能据此推导Statuspage coverage；首轮以官方Status API与Support文档为合同事实源，不引入非官方SDK作为默认路线。

### Better Stack

- [BetterStackHQ/cursor-plugin](https://github.com/BetterStackHQ/cursor-plugin/tree/478942e7bede2c255d4675c41fc68e146abeee98) 固定 `478942e7bede2c255d4675c41fc68e146abeee98`，MIT。它只配置官方remote MCP `https://mcp.betterstack.com`；官方说明MCP覆盖telemetry、uptime、incident、on-call和status page，示例同时包含acknowledge/comment等写操作。可作Skill/MCP能力证据，不能直接成为本Channel route。
- [BetterStackHQ/terraform-provider-better-uptime](https://github.com/BetterStackHQ/terraform-provider-better-uptime/tree/f462bd230fd1d3e42d663840f5a801fa8c6a89b7) 固定 `f462bd230fd1d3e42d663840f5a801fa8c6a89b7`，Apache-2.0。它面向自有monitor/status page配置，适合研究provider概念和drift，不是公开`/index.json`采集器且包含大量写资源。

### Instatus

- [instatusHQ/openapi](https://github.com/instatusHQ/openapi/tree/bc179f00aee86fbef198af03694d3753fbfe4d2e) 固定 `bc179f00aee86fbef198af03694d3753fbfe4d2e`，OpenAPI 3.0.3、spec version 2.0.0。仓库未声明许可证，故只链接/审阅，不复制分发或生成client。
- 该revision包含`/summary.json`与`PublicStatusSummary`，但文档顶层声明bearer auth而operation未显式清除；Instatus公开数据文档又称从status page URL直接读取。把它记录为contract drift，不能擅自用私有token API验证。
- 未发现Instatus官方Agent Skill或MCP server。

本轮只浏览官方资料和固定Git revision；未clone、安装、生成client、执行MCP/CLI或调用任何真实status page/API。

## 5. 下一步

1. 用合成fixtures验证page/component/incident/update/maintenance/postmortem、active/recent/window coverage、computation/override、mirror provenance、HTML quarantine与zero-write；
2. Statuspage、Better Stack、Instatus各自发布Platform Pack，任何成员不得fallback到管理API；
3. 至少一个成员fixture conformance通过后，Channel才进入`modeled-partial`；
4. sandbox live需用户另行授权，并只允许用户指定的公开测试page、固定endpoint roster与请求预算；
5. 订阅、通知、事故/组件写入、MCP、private page/API key和真实客户status page收集均不随fixture晋级自动开放。
