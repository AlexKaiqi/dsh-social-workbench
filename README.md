# DSH Social Workbench

一个面向 DSH 的“社会信息与内容工作台”研究项目：从多个公开或已授权来源获取信息，保留证据，挖掘需求信号，形成内容 brief 和平台变体，经人工批准后发布，再把表现数据回流到下一轮判断。

> 状态：0.3.0 Douyin research ingress + executable release/feedback loop。仓库已有用户侧抖音扫码登录复用、小批量视频文案/评论采集和可选本地转写，以及 DSH 模型侧只读研究账本、素材—brief—内容包装配、发布计划/outbox、对账、反馈与复盘；真实采集和发布仍在用户边界。

## 结论先行

目标不应实现成一个包含大量脆弱脚本的“万能社媒机器人”。更稳定的结构是：

```text
公开/授权来源
  -> 连接器能力登记
  -> 原始证据与标准化 SourceItem
  -> 需求信号与主题聚类
  -> ContentBrief 与可追溯主张
  -> 各平台独立内容变体
  -> 人工批准 + 发布 Outbox
  -> 官方 API / 委托发布层 / 人工交接
  -> 指标回流与假设复盘
```

连接器是可替换的边缘，证据、分析对象、内容版本、批准记录和结果回流才是工作台的长期资产。

## 第一阶段范围

- 采集：RSS/Atom、官方搜索或数据 API、用户授权账号、可审计的外部聚合器。
- 分析：去重、主题聚类、需求信号、证据引用、置信度和反例。
- 生产：内容 brief、事实主张、素材引用、平台格式约束和版本化变体。
- 发布：预览、批准、幂等队列、状态追踪、失败隔离、人工交接。
- 反馈：官方可得的曝光、互动和内容状态；不把代理指标伪装成真实需求。

暂不进入范围：私密资料采集、相亲或社交 App 中个人档案批量筛选、跨平台身份归并、自动私信、账号养号、验证码绕过、风控规避，以及无人工批准的自主发布。

## 调研导航

- [可扩展需求情报总体架构](docs/DEMAND_INTELLIGENCE_ARCHITECTURE.md)
- [Connector 期望架构与能力路由](docs/CONNECTOR_EXPECTED_ARCHITECTURE.md)
- [新平台持续发现长期架构](docs/PLATFORM_DISCOVERY_LONG_TERM_ARCHITECTURE.md)
- [版本化平台知识与动态物化](docs/PLATFORM_KNOWLEDGE_ARCHITECTURE.md)
- [需求平台与 Channel 调研总表](docs/DEMAND_PLATFORM_SURVEY.md)
- [公共采购需求与合同执行 Channel v0.3](docs/platform-packs/PUBLIC_PROCUREMENT_CHANNEL_PACK_V0_3_DESIGN.md)
- [公开科研文献与报告限制 Channel](docs/platform-packs/PUBLIC_RESEARCH_LITERATURE_CHANNEL_PACK_DESIGN.md)
- [公开临床研究注册与报告约束 Channel](docs/platform-packs/PUBLIC_CLINICAL_STUDY_REGISTRIES_CHANNEL_PACK_DESIGN.md)
- [公开药品供应短缺与可得性约束 Channel](docs/platform-packs/PUBLIC_MEDICINE_SUPPLY_SHORTAGES_CHANNEL_PACK_DESIGN.md)
- [公共监管执法与补救义务 Channel](docs/platform-packs/PUBLIC_REGULATORY_ENFORCEMENT_CHANNEL_PACK_DESIGN.md)
- [公共申诉专员裁决与报告救济 Channel](docs/platform-packs/PUBLIC_OMBUDSMAN_DETERMINATIONS_CHANNEL_PACK_DESIGN.md)
- [公共审计发现、建议与跟踪 Channel](docs/platform-packs/PUBLIC_AUDIT_FINDINGS_RECOMMENDATIONS_CHANNEL_PACK_DESIGN.md)
- [公共311/市政服务请求与报告处置 Channel](docs/platform-packs/PUBLIC_CIVIC_SERVICE_REQUESTS_CHANNEL_PACK_DESIGN.md)
- [公共请愿、支持计数与官方回应 Channel](docs/platform-packs/PUBLIC_PETITIONS_SUPPORT_RESPONSES_CHANNEL_PACK_DESIGN.md)
- [公共参与式预算：提案、优先级、分配与执行 Channel](docs/platform-packs/PUBLIC_PARTICIPATORY_BUDGETING_CHANNEL_PACK_DESIGN.md)
- [公共信息公开请求、机关回应与披露结果 Channel](docs/platform-packs/PUBLIC_INFORMATION_ACCESS_REQUESTS_CHANNEL_PACK_DESIGN.md)
- [公共规划申请、公众意见与主管机关决定 Channel](docs/platform-packs/PUBLIC_PLANNING_APPLICATIONS_REPRESENTATIONS_DECISIONS_CHANNEL_PACK_DESIGN.md)
- [公共建筑许可、检查、证书与执法 Channel](docs/platform-packs/PUBLIC_BUILDING_PERMITS_INSPECTIONS_CERTIFICATES_ENFORCEMENT_CHANNEL_PACK_DESIGN.md)
- [公共职业/经营许可、检查与纪律处分 Channel](docs/platform-packs/PUBLIC_REGULATED_LICENSES_INSPECTIONS_DISCIPLINE_CHANNEL_PACK_DESIGN.md)
- [公共环境许可、监测、排放与合规 Channel](docs/platform-packs/PUBLIC_ENVIRONMENTAL_PERMITS_MONITORING_COMPLIANCE_CHANNEL_PACK_DESIGN.md)
- [公共污染场地、责任与清理修复 Channel](docs/platform-packs/PUBLIC_CONTAMINATED_SITES_REMEDIATION_CHANNEL_PACK_DESIGN.md)
- [公共饮用水质量、违规与公众警报 Channel](docs/platform-packs/PUBLIC_DRINKING_WATER_SAFETY_ADVISORIES_CHANNEL_PACK_DESIGN.md)
- [公共环境空气质量、健康警报与污染事件 Channel](docs/platform-packs/PUBLIC_AMBIENT_AIR_QUALITY_ADVISORIES_CHANNEL_PACK_DESIGN.md)
- [公共食品场所卫生检查、食源性暴发与关闭/恢复 Channel](docs/platform-packs/PUBLIC_FOOD_SAFETY_INSPECTIONS_OUTBREAKS_CHANNEL_PACK_DESIGN.md)
- [公共交通服务可靠性、运行中断与无障碍 Channel](docs/platform-packs/PUBLIC_TRANSIT_SERVICE_RELIABILITY_ACCESSIBILITY_CHANNEL_PACK_DESIGN.md)
- [公共道路事故、伤亡与危险位置 Channel](docs/platform-packs/PUBLIC_ROAD_SAFETY_CRASH_CASUALTY_HAZARD_CHANNEL_PACK_DESIGN.md)
- [公共消费价格、通胀与可负担性 Channel](docs/platform-packs/PUBLIC_CONSUMER_PRICE_INFLATION_AFFORDABILITY_CHANNEL_PACK_DESIGN.md)
- [公共租赁住房成本、空置与负担 Channel](docs/platform-packs/PUBLIC_RENTAL_HOUSING_COST_VACANCY_BURDEN_CHANNEL_PACK_DESIGN.md)
- [公共劳动力需求、职位空缺与周转统计 Channel](docs/platform-packs/PUBLIC_LABOR_DEMAND_VACANCIES_TURNOVER_CHANNEL_PACK_DESIGN.md)
- [公共企业形成、人口学与存续统计 Channel](docs/platform-packs/PUBLIC_BUSINESS_FORMATION_DEMOGRAPHY_SURVIVAL_CHANNEL_PACK_DESIGN.md)
- [公共企业破产、清算与重组统计 Channel](docs/platform-packs/PUBLIC_BUSINESS_INSOLVENCY_LIQUIDATION_RESTRUCTURING_CHANNEL_PACK_DESIGN.md)
- [公共企业信贷需求与融资条件 Channel](docs/platform-packs/PUBLIC_BUSINESS_CREDIT_DEMAND_FINANCING_CONDITIONS_CHANNEL_PACK_DESIGN.md)
- [公共企业经营状况、约束与预期 Channel](docs/platform-packs/PUBLIC_BUSINESS_CONDITIONS_CONSTRAINTS_EXPECTATIONS_CHANNEL_PACK_DESIGN.md)
- [公共企业数字技术采用、能力与障碍 Channel](docs/platform-packs/PUBLIC_BUSINESS_DIGITAL_TECHNOLOGY_ADOPTION_CAPABILITY_BARRIERS_CHANNEL_PACK_DESIGN.md)
- [公共企业创新活动、约束与协作 Channel](docs/platform-packs/PUBLIC_BUSINESS_INNOVATION_ACTIVITIES_CONSTRAINTS_COLLABORATION_CHANNEL_PACK_DESIGN.md)
- [公共数字接入、技能与线上参与 Channel](docs/platform-packs/PUBLIC_DIGITAL_ACCESS_SKILLS_ONLINE_PARTICIPATION_CHANNEL_PACK_DESIGN.md)
- [公共家庭支出、消费与预算配置 Channel](docs/platform-packs/PUBLIC_HOUSEHOLD_EXPENDITURE_CONSUMPTION_BUDGET_ALLOCATION_CHANNEL_PACK_DESIGN.md)
- [公共时间使用、照护、流动与日常活动配置 Channel](docs/platform-packs/PUBLIC_TIME_USE_CARE_MOBILITY_DAILY_ACTIVITY_ALLOCATION_CHANNEL_PACK_DESIGN.md)
- [公共医疗服务可及性、未满足需求与患者报告障碍 Channel](docs/platform-packs/PUBLIC_HEALTH_CARE_ACCESS_UNMET_NEED_PATIENT_REPORTED_BARRIERS_CHANNEL_PACK_DESIGN.md)
- [公共家庭能源可负担性、能源不安全与服务连续性 Channel](docs/platform-packs/PUBLIC_HOUSEHOLD_ENERGY_AFFORDABILITY_INSECURITY_SERVICE_CONTINUITY_CHANNEL_PACK_DESIGN.md)
- [最终架构与组件调研报告](docs/FINAL_ARCHITECTURE_REPORT.md)
- [双平台开源执行器固定版本审计](docs/OPEN_SOURCE_DUAL_PLATFORM_AUDIT.md)
- [双平台运行手册](docs/DUAL_PLATFORM_RUNBOOK.md)
- [抖音需求研究运行手册](docs/DOUYIN_RESEARCH_RUNBOOK.md)
- [能力工作台真实装配与浏览器验收](docs/WORKBENCH_ACCEPTANCE.md)
- [发布管理与反馈闭环](docs/RELEASE_FEEDBACK_LOOP.md)
- [工作台操作面与共享浏览器决策](docs/decisions/0006-operating-surface-and-browser.md)
- [八条独立研究问题](docs/research/README.md)
- [架构推导](docs/ARCHITECTURE.md)
- [四阶段开源框架与适配器生态](docs/FRAMEWORK_MATRIX.md)
- [Adapter 架构与 conformance](docs/ADAPTER_ARCHITECTURE.md)
- [Adapter 生态与平台能力交叉调研](docs/ADAPTER_CATALOG_SURVEY.md)
- [组件复用策略与候选清单](docs/COMPONENT_REUSE_PLAN.md)
- [小型、团队和平台化参考组合](docs/REFERENCE_STACKS.md)
- [平台接入矩阵](docs/PLATFORM_MATRIX.md)
- [开源项目评估](docs/OPEN_SOURCE_LANDSCAPE.md)
- [调研问题与证据标准](docs/RESEARCH_PLAN.md)
- [分阶段路线](docs/ROADMAP.md)
- [关键架构决策](docs/decisions/0001-research-baseline.md)
- [四类 Port 与控制面决策](docs/decisions/0002-four-ports-and-control-plane.md)
- [组件优先复用决策](docs/decisions/0003-reuse-before-build.md)
- [双平台执行组合决策](docs/decisions/0004-dual-platform-execution-composition.md)
- [能力目录与健康工作台决策](docs/decisions/0005-capability-workbench.md)
- [平台 Connector 与多 Provider 路由决策](docs/decisions/0007-platform-connector-routing.md)
- [候选领域契约](spec/README.md)

### 候选项目专项审计

- [`tubban1/leadgen`](docs/candidates/tubban1-leadgen.md)：已完成固定版本审计；仅作阶段化闭环与多租户配置渲染参考，不进入运行时。

## 当前可运行切片

- `dsh/`：Cordis Host staging service、模型提示和有界工具；工具只有 `ingest/create_brief/build_package/read/status/help`，不暴露登录、确认或发布。
- `client/`：DSH Session 中的只读 Social Workbench view；分为当前闭环、发布、反馈和系统，Client 不持有登录、批准、确认、执行或反馈写入权限。
- `spec/capability-snapshot.schema.json`：Host 与 Client 的版本化能力快照；实现成熟度与当前健康状态分开表达。
- `spec/platform-connector.schema.json`：细粒度平台能力目录；同一能力可绑定多个 provider，并按成本、速度、覆盖或可靠性选择。
- `runtime/`：不可变 revision、发布计划、幂等 outbox、媒体/执行 manifest SHA-256、一次性确认、原子持久化、崩溃恢复、attempt/receipt、evidence-only reconciliation、追加式 metric/feedback 和 review→brief lineage。
- 抖音研究 ingress：可选固定 MediaCrawler Docker sidecar，容器内 Chromium + noVNC 扫码、独立持久登录目录、小批量公开搜索/评论归一化，以及按选中视频执行的本地 faster-whisper 转写；非官方、非商业研究限定，默认不安装。
- `third_party/sidecars.json`：小红书与抖音执行器的固定 commit 和许可证清单。
- `scripts/bootstrap-sidecars.mjs`：幂等安装、固定 commit、补丁哈希、Go/Python/Chromium/ffmpeg 构建；不会登录或发布。
- 小红书 adapter：强制测试私密可见、发布前本人主页基线、发布后新增 feed 与详情反查。
- 小红书反馈采集：用户侧命令从已确认发布对象读取原始互动计数与评论，短期访问参数不进入 receipt 或反馈账本。
- 抖音 adapter：只调用严格平台 CLI，要求 submit、封面、私密可见性和创作者队列全部通过。
- 抖音 composite connector：已登记查询、读取、评论、媒体、直播、发布和账号操作能力；当前把 MediaCrawler、本地 faster-whisper 与 broadcast-kit 映射为三个 provider。只读/本地能力允许按策略 fallback，平台写操作固定走 outbox，禁止 generic connector 自动重试。

查看当前抖音能力和 provider 选择：

```sh
npm run social -- connector douyin capabilities
npm run social -- connector douyin plan --capability discovery.search.videos --strategy lowest-cost
```

运行 `npm run check`；真实执行见[双平台运行手册](docs/DUAL_PLATFORM_RUNBOOK.md)，发布与反馈账本见[发布管理与反馈闭环](docs/RELEASE_FEEDBACK_LOOP.md)。

## 当前建议

1. 用 RSSHub/RSS 作为公开信息采集的第一条通路，但把路由失效、版权和平台条款视为连接器风险。
2. 国际平台发布优先评估 Postiz 作为委托发布层，避免重复维护十几个 OAuth 和媒体上传协议。
3. 国内平台仅对已经验证的官方能力做直连；小红书、视频号等没有通用服务器发布证据的平台先采用“生成素材 + 人工交接”。
4. MVP 先证明一条完整、可追溯的闭环，而不是追求平台数量。

## 当前 DSH 装配边界

`plugin-spec.json` 声明已经完成的 Host staging 与只读 Client 工作台事实：模型提示、一个 staging/ledger-read 工具、本地 canonical 对象写入、健康与账本 RPC 和版本化 JSON 契约。Social Workbench 通过 `conversation.view` 成为 Session 工作面；可见浏览器由 profile 组合的 Browser Use 插件持有，同一 Session 的用户与 Agent 共享页面，不把 Cookie 交给本插件。计划批准、outbox 入队、真实发布、对账和反馈写入都没有注册成模型工具；Client 也不持有这些权限。
