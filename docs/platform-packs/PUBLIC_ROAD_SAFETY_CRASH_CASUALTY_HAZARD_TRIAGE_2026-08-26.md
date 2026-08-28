# 公共道路事故、伤亡与危险位置候选分流（2026-08-26）

## 1. 结论

本轮选择四个具有不同统计总体、发布节奏和表粒度的官方成员。它们共同支持发现高事故路段、弱势道路使用者伤害、报告/修订摩擦和数据解释痛点，但不能被压成一个“事故 API”或统一风险分数。

| 成员 | 核心价值 | 当前成熟度 | 主要缺口 |
| --- | --- | --- | --- |
| NHTSA FARS | 美国致死机动车交通事故全国 census、1975 起历史、事故/车辆/人员等年度编码与 Crash API | concept + exact population/manual/API/bulk route fixture + release fixture | 只覆盖符合 30 日死亡门槛的事故；Annual Report File 与 Final File 会变化；API 与 bulk 年份/产品覆盖不应互相猜测 |
| NYC Open Data Motor Vehicle Collisions | 城市级警方事故、车辆、人员三表及 SODA 查询面，更新较频繁 | concept + exact crash/vehicle/person dataset-ID fixture + preliminary/revision fixture | 报告门槛和警方覆盖不等于所有碰撞；记录可更正/覆盖，portal 不保留旧版本；factor 不等于法律责任 |
| UK DfT STATS19 | 1979 起英国公共道路警方上报人身伤害 collision、vehicle、casualty，含 provisional/final、codebook 和 revision log | concept + exact bulk/schema/release/revision/severity fixture | 不含未报案或无人身伤害事故；2024 specification、injury-based severity、CF→RSF 带来时间序列断点；敏感字段受限 |
| Transport for NSW Crash Data | NSW crash 与 traffic-unit 五年滚动 XLSX、环境/地点/车辆/伤亡视图和年度更新 | concept + exact dataset/resource/manual route fixture + selected aggregate | portal 显示登录下载而 Data.NSW 暴露 direct resource，访问合同待 canary；person/casualty grain 与修订传播需从当前 manual 重验 |

成熟度固定为：`requested=4 / concept-fixture=4 / exact official dataset route-fixture=4 / collision fixture=4 / traffic-unit fixture=4 / person-or-casualty fixture=3 / release-or-revision fixture=3 / aggregate-or-exposure fixture=3 / selected-manual=4 / callable=0 / durable=0`。

本轮只读取官方网页、schema/manual 说明、公开 repository 页面、`git ls-remote` revision 和少量静态 manifest/license 文本。没有请求 crash/casualty/vehicle/person/hazard 数据行或下载 bulk 文件，没有注册账号/token，没有 clone、install、build 或执行 OSS/MCP/Skill，也没有报告事故/危险、联系警方或受害者、请求执法/道路变更或产生平台副作用。

## 2. 第一性原理边界

1. collision、traffic unit、road user、casualty、injury/death outcome、road location、factor、release、aggregate 和 active hazard 是不同实体与粒度。
2. FARS 是符合交通道路和 30 日死亡门槛的 fatal-crash census，不代表美国所有事故；CRSS 的 probability sample 也不能与 census row 合并。
3. NYC、STATS19 和 NSW 都以各自警方/行政报告规则为总体；“all police-reported”不等于所有实际发生事故，也不证明报案完整性。
4. collision overall severity、person/casualty severity、police-reported severity、injury-based severity、hospital-linked outcome 和 death-window qualification分别保存。
5. coded contributing factor、road safety factor 或 analyst classification 是来源断言；不自动成为 confirmed root cause、过错、疏忽或法律责任。
6. occurrence time、report time、outcome time、publication time、revision time 与 active-hazard validity window 不能互换。
7. preliminary/provisional/annual/final/corrected/superseded release 均为独立 revision；新值不能覆盖旧 evidence。
8. 同一事故的 crash、vehicle/unit、person/casualty表只能用官方 key 和 exact release/schema 建关系；时间、坐标、街道或人数相似只能形成 review candidate。
9. 同一地理点多次事故是 hotspot candidate，不等于道路本身导致事故；还需要 exposure、道路设计、交通量、时间、选择偏差及反事实分析。
10. crash count 不是 risk。比较需要兼容的 population、severity、geography、period 和 exposure denominator，例如人口、vehicle-distance、trip 或 road-length。
11. active road hazard、work zone 或 live incident 是运营通告，不是已验证历史 collision、casualty outcome 或未来事故预测。
12. published coordinate 不意味着适合无限期精确索引。姓名、地址、车牌、VIN、驾照、自由文本、医疗/毒理、受害者/家属联系信息、敏感 factor 和稀有事件精确点默认 drop、quarantine 或降精度。

## 3. 官方成员证据

### 3.1 NHTSA FARS

[FARS system definition](https://www.nhtsa.gov/crash-data-systems/fatality-analysis-reporting-system)将总体限定为 50 州、DC 与 Puerto Rico 中，机动车在通常向公众开放的 trafficway 上行驶且有人在事故后 30 日内死亡的 fatal crash census。数据由州级 analyst 从 police report、registration、driver record、road classification、death certificate、toxicology 和 EMS 等既有文件编码；公开文件不含姓名、地址或 SSN，但字段定义可逐年变化。

[FARS data access](https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars)提供 1975 至今的下载与查询入口；[Crash API](https://crashviewer.nhtsa.dot.gov/crashviewer/CrashAPI)提供 dataset/year/state/output-format 路由，但其页面标注的年份范围与 bulk 当前年份必须分别验证，不能自动 fallback。[2024 manuals index](https://static.nhtsa.gov/nhtsa/downloads/FARS/Links%20for%20FARS%20Manuals.pdf)固定 analytical 与 coding/validation manual。Annual Report File 后续可能被 Final File 增补或修正，因此 release standing 是记录身份的一部分。

### 3.2 NYC Open Data Motor Vehicle Collisions

[NYC Vision Zero Open Data](https://www.nyc.gov/content/visionzero/pages/open-data)把 `Motor Vehicle Collisions – Crashes`、`Vehicles` 与 `Person`列为三个独立官方数据集；固定 Socrata dataset ID 分别为 `h9gi-nx95`、`bm4k-52h4`、`f55k-p6yu`。crash row、vehicle row 与 person row 不得因同一 portal 而混成一种 grain。

[Socrata dataset contract](https://dev.socrata.com/foundry/data.cityofnewyork.us/h9gi-nx95)只作为 exact dataset/API-field route fixture；未来 canary 必须固定 `$select/$where/$order/$limit`、pagination、app token posture、schema digest 和 primary key。[NYC Open Data public policies](https://cityofnewyork.github.io/opendatatsm/publicpolicies.html)说明 submitting agency 是 authority，数据可能随时更新、更正、覆盖或刷新，旧版本不保留；这要求 Connector 自己保存合法的 revision evidence，而不能把当前 row 当永久真相。

### 3.3 UK DfT STATS19

[Road safety open data](https://www.gov.uk/government/statistical-data-sets/road-safety-open-data)明确记录只覆盖英国公共道路、向警方报告并由 STATS19 记录的人身伤害 collision，分别发布 collision、vehicle 与 casualty CSV。1979 起 complete dataset、最近五年与单年文件是不同资源；final annual 与 unvalidated provisional mid-year release 必须分开。

官方页面同时提供 coded-variable guide、severity adjustment、历史 schema change 与 record-level revision log，并指出部分 police force 转向 injury-based severity 导致口径变化。[STATS19 forms and STATS20 guidance](https://www.gov.uk/government/publications/stats19-forms-and-guidance)分别固定 2011/2024 specification。公开数据只含可公开的非敏感字段；敏感 contributory factors 等走批准申请。[内容许可](https://www.gov.uk/government/statistical-data-sets/road-safety-open-data)为 OGL v3，仍需 attribution 与例外检查。

### 3.4 Transport for NSW Crash Data

[NSW Crash Data](https://opendata.transport.nsw.gov.au/data/dataset/nsw-crash-data)说明数据面向道路安全分析，覆盖 crash location、environment、vehicle type、driver 与伤亡视图，初始发布五年并年度更新，隐私处理受 NSW Privacy and Personal Information Protection Act 约束。当前资源包括 `CRASH.xlsx` 与 `TRAFFIC UNIT.xlsx`及 supporting manual。

[Data.NSW mirror](https://www.data.nsw.gov.au/data/dataset/2-nsw-crash-data)标记 CC BY，并暴露当前五年资源元数据；Open Data Hub 页面同时显示“Login to download”。未来 sandbox live 前必须确认 direct resource、portal login、CKAN metadata/API 是否属于同一官方 access contract，不能把可见 URL 推断成稳定匿名 route。[Crash Statistics](https://www.data.nsw.gov.au/data/dataset/2-crash-statistics)只是 interactive aggregate/report入口，不替代 record-level dataset 或 denominator definition。

## 4. 固定版本 OSS、MCP 与 Skill 审计

以下候选均未 clone、install、build 或 execute：

| 候选 | 固定 revision / license | 可借鉴 | 不可晋级原因 |
| --- | --- | --- | --- |
| [ropensci/stats19@`87aff14`](https://github.com/ropensci/stats19/tree/87aff1494e09d34d9d2fcb55ca33b5a979dd17e5) | GPL-3；DESCRIPTION `4.1.0` | DfT 文件发现、collision/vehicle/casualty read/format、code lookup、CRS 转换 | 社区包且会下载数据；格式化成功不证明 population、severity break、revision、privacy、rights 或跨年可比 |
| [elipousson/crashapi@`8572ffc`](https://github.com/elipousson/crashapi/tree/8572ffcb649c464cc47426be9b06d44db8dbb41b) | MIT；DESCRIPTION `0.1.2` | FARS API dataset/year/state 请求与 code labels | 社区客户端的年份说明会滞后；不拥有 FARS authority、release lineage、coverage、rights 或 privacy policy |
| [socrata/soda-js@`d6d528c`](https://github.com/socrata/soda-js/tree/d6d528c919b6586abe211fdc8924af439677c830) | MIT | SODA2 query builder 与 consumer/producer wire 模式 | 通用且较旧；同时暴露 add/update/delete/upsert/truncate，不能进入只读 Connector capability；无 MVC 语义 |
| [ckan/ckanapi@`94b8c24`](https://github.com/ckan/ckanapi/tree/94b8c24a21a185c270a01bcbcfa72ff4e1b78b1c) | MIT / Government of Canada Crown Copyright | CKAN Action API、metadata、bulk export 与 pagination | 通用 CLI 同时含 upload/update/delete；不证明 NSW resource access、表语义、许可或 revision continuity |
| [usdot-jpo-ode/wzdx@`be5a800`](https://github.com/usdot-jpo-ode/wzdx/tree/be5a8001b03c057bd84cb326fd0a452a7047aec2) | CC0-1.0 | 官方 work-zone GeoJSON schema、versioning 与 active event表达 | work zone 是 hazard/works surface，不是 FARS/NYC/STATS19/NSW crash record、casualty或risk标准 |
| [verswu/samsara-mcp-server@`8118c92`](https://github.com/verswu/samsara-mcp-server/tree/8118c9267a79cf764be88bf342601b725846f993) | README仍为`[Add your license here]` | MCP tool schema、pagination/rate-limit mock 思路 | 私有车队 token；暴露 exact vehicle/driver/trip、安全事件和 create driver/tag 写操作；无公共道路统计总体或许可，直接拒绝 |

当前可用技能目录和本轮公开检索没有出现由 NHTSA、DfT、NYC、TfNSW 或道路安全标准组织维护的 domain Agent Skill。这个结论只表示“本次审计未发现”，不证明不存在；通用 data-analysis、Socrata、CKAN、地图或交通 MCP/Skill 不得冒充成员 Connector。

## 5. 晋级建议

1. 四成员均先停在 `selected-manual`；固定 population、table grain、schema/vintage、release/revision、severity、location/privacy 与 rights。
2. 先用手写 synthetic fixture 证明 fatal census、police registry、sample、linked outcome 与 active hazard 的拒绝合并行为。
3. 另行授权后，先做 metadata-only canary，再做受限时间/地理范围的小样本 read；不得默认 full-history 下载。
4. NYC 需要验证增量水位与覆盖改写；STATS19 需要验证 provisional→final、2024 schema 与 revision log；NHTSA 需要验证 API/bulk/ARF/final；NSW 需要验证 login/direct-resource access contract。
5. 只有 exposure denominator、severity definition、suppression、rights 和 correction propagation 全部通过，才允许构建 rate/hotspot materialized view。
6. 当前不实现任何真实 Connector，也不执行上述项目。
