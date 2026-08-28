# Public Regulatory Enforcement & Remedial Obligations 候选分诊

状态：`researched / selected-for-concept-fixtures`  
核验日期：2026-08-26  
决策ref：`public-regulatory-enforcement-triage/2026-08-26`

## 1. 第一性目标

系统要发现的不是“哪个公司违法”，而是公开监管记录中暴露的反复行为、合规摩擦、消费者损失、纠正成本与尚未满足的流程需求。可复核输出必须回答：哪个authority在何时、以何种程序和法律姿态，对哪个组织的什么conduct作出何种主张或决定；补救义务是否只是proposed、已经entered/effective、被stayed/vacated，还是仅由来源声明completed。

因此最小稳定模型必须分离case lifecycle、assertion posture、legal finality和obligation status。complaint不是finding，settlement不必然admission，proposed order不是final/effective，closed也不证明violation成立或义务完成。

## 2. 候选比较

| 候选Channel | 需求价值 | 官方可验证性 | 主要风险 | 决策 |
| --- | --- | --- | --- | --- |
| Public Regulatory Enforcement & Remedial Obligations | formal complaint/order/remedy直接暴露监管和运营摩擦，可连接既有complaint/rulemaking/recall知识 | 多个authority有公开case registry、release、feed或read service | 法律姿态、自然人隐私、重复representation | **当前选择** |
| Patents & Technical Claims | 揭示solution space、技术主题和claims | 多国官方API成熟 | 离用户痛点较远，专利claim不等于需求或可实施性 | 后续候选 |
| Public Litigation | complaint、judgment和remedy可能揭示高成本痛点 | UK Find Case Law等有官方检索/API | 诉讼一方陈述不等于事实；许可、个人信息、跨法院程序复杂 | 后续窄域审查 |

选择监管执法是因为它补上`public complaint/rulemaking/recall → formal action → order/judgment → remedial obligation`的缺口，并比专利更接近痛点、比宽泛诉讼更容易保持authority和程序边界。

## 3. 入选成员与成熟度

| Member | 价值 | 只读公开surface | 当前fixture |
| --- | --- | --- | --- |
| US EPA ECHO Enforcement Cases | 环境执法case、facility/sector和formal/informal action关系 | 官方ECHO web services、case search与data caveat | concept + route |
| US CFPB Enforcement Actions | 消费金融practice、complaint、order、redress | 官方action index、filter、case page和documents | concept + selected record |
| US FTC Cases & Proceedings | competition/consumer protection timeline、complaint、consent/order | 官方Legal Library case timeline与documents | concept + selected record |
| US SEC Litigation Releases & Administrative Proceedings | securities litigation/admin matter、order、release和appeal | 官方release/proceeding pages与RSS | concept + feed route |
| UK CMA Cases | competition/consumer/market case state、outcome和documents | 官方case finder、case page与feed | concept + feed route |

成熟度严格为requested=5、concept-fixture=5、route-fixture=3、callable=0、durable-approved=0。某个成员成功不提升其他成员。

## 4. OSS与Skill静态证据

本轮只读官方docs、GitHub metadata/raw source和`git ls-remote`，未clone、安装、构建或执行第三方代码。

| Reference | 固定revision | licence/状态 | 可借鉴与拒绝 |
| --- | --- | --- | --- |
| `cyanheads/epa-mcp-server` | `2cb57664319e77994604453e690834ddee3a1063` | Apache-2.0 | 只静态借鉴tool schema/partial failure；拒绝扩大到非ECHO surface或fallback |
| `mps9506/echor` | `f1a13ebad9b6fe897c764a122c5acaeca23c3858` | MIT | 仅作pagination/download drift见证 |
| `api-evangelist/epa` | `abbc90f8e1b4b1d38e18a7c53b908dbf034a5b82` | root licence未确认 | quarantine，不可复用 |
| `SEC-API-io/sec-edgar-mcp` | `30763cb1b48ad7e57a3dd8e5caacf163653d0f16` | MIT code；商业service/API key另受约束 | 仅证明transformed provider存在；不是SEC official route，禁止执行/替代 |
| `red-cars-io/regulatory-intelligence-mcp` | `07a0aadb98b5affddda2dd562658cc46a7e8bf8a` | root licence未确认 | quarantine |
| `cfpb/cfgov-refresh` | `d20bb5dd96dcd52740228aa2e9b181a9796684cd` | CC0 | 官方站点实现参考；页面源码不升级成public API contract |

建议的`public-regulatory-enforcement-source-contract-research/v1`只允许读取官方文档和固定source revision，输出Pack/drift proposal；`public-regulatory-enforcement-conformance/v1`只运行synthetic fixtures。二者都不能请求业务route、安装MCP、抓网页、写平台或持久化真实记录。

## 5. 晋级门

进入route fixture前固定exact method/resource/schema/pagination/terms/rights；进入metadata-only canary前需用户批准exact member、query/filter、window、field allowlist、budget、purpose和retention。自然人party、victim、witness、contact、address和personal identifier默认drop；组织只保留opaque ref。任何filing、comment、petition、e-filing、whistleblower report、contact或subscription均属于高影响write，本Channel无Probe。

