# Public Medicine Supply Shortages 候选调研（2026-08-26）

状态：`researched / selected-for-concept-and-route-fixtures / no-live-access`

## 1. 第一性原理选择

本轮选择`Public Medicine Supply Shortages & Availability Constraints`。现有召回Channel回答安全纠正行动，状态Channel回答服务运行中断，采购Channel回答明确购买流程；它们都不能表达“某个具体药品规格在某辖区和时间窗内预计或正在无法满足供给、供应受限、停止供应或已由来源声明恢复”。这是独立、需求相邻但不是需求本身的事实。

| 候选 | 新事实 | 与需求距离 | 本轮结论 |
| --- | --- | --- | --- |
| 药品供应短缺 | product/presentation × jurisdiction × time的公开供给约束、原因声明与缓解行动 | 较近；仍不能直接推出需求规模 | 选中 |
| 专利与技术主张 | 申请人提出的权利要求、引用与法律事件 | 更接近solution space/prior art | 暂缓，后续独立Channel |
| 监管执法/consent order | 违法指控、命令、和解与纠正义务 | 有价值但与投诉/召回/规则重叠，法律状态复杂 | 暂缓，后续独立Channel |

Channel限定为药品，不泛化成所有商品供应链。不同强度、剂型、包装、品牌和市场不能因为共享成分而视作可替代。

## 2. 五个成员及真实成熟度

| Member | 独特价值 | 官方surface | 当前成熟度 |
| --- | --- | --- | --- |
| FDA Drug Shortages / openFDA | 美国current/resolved/discontinued记录、daily JSON、bulk snapshot、NDC harmonization | [overview](https://open.fda.gov/apis/drug/drugshortages/)、[route](https://open.fda.gov/apis/drug/drugshortages/how-to-use-the-endpoint/)、[fields](https://open.fda.gov/apis/drug/drugshortages/searchable-fields/) | concept+native API route fixture |
| Health Product Shortages Canada | 强制shortage/discontinuation reports、public search/export/API、Tier 3标记 | [Health Canada迁移公告](https://www.canada.ca/en/health-canada/services/drugs-health-products/compliance-enforcement/establishment-licences/drug-establishment-licensing-bulletin/new-website-health-product-shortages.html)、[public search/API入口](https://healthproductshortages.ca/search) | concept+public API/export route fixture；2026迁移需drift gate |
| EMA shortages catalogue / ESMP | 欧盟层面ongoing/resolved critical shortages；公开目录与MAH/NCA报送能力分离 | [public catalogue](https://www.ema.europa.eu/en/human-regulatory-overview/post-authorisation/medicine-shortages-availability-issues/public-information-medicine-shortages)、[ESMP](https://www.ema.europa.eu/en/human-regulatory-overview/post-authorisation/medicine-shortages-availability-issues/european-shortages-monitoring-platform-esmp) | concept+selected public-record fixture；受限报送API不是public read route |
| TGA Medicine Shortage Reports Database | 澳洲anticipated/current/resolved/discontinued、影响等级、可得性、原因和management action | [database](https://apps.tga.gov.au/shortages/search/Index?shortagetype=All)、[reporting guidance](https://www.tga.gov.au/resources/guidance/reporting-shortage-or-discontinuation-medicine-you-supply) | concept+official active/archive extract route fixture |
| UK DHSC supply disruption statistics | DaSH通知、root-cause与时间序列的官方aggregate/方法学 | [2026 statistics](https://www.gov.uk/government/statistics/medicine-supply-disruption-statistics-uk-data-to-june-2026)、[data pack](https://www.gov.uk/government/publications/managing-a-robust-and-resilient-supply-of-medicines-data-pack) | concept+official aggregate-download route fixture；不是record registry |

requested=5、concept-fixture=5、route-fixture=4、callable=0、durable-approved=0。EMA公开目录当前只给selected-record fixture；ESMP machine-to-machine specification服务MAH/NCA报送，不授权公共读取或任何写入。英国成员只能贡献aggregate，不与逐产品事件混成一个分母。

## 3. 稳定概念与禁止推断

- Shortage event、notification、medicine product、presentation、active substance、availability、impact、discontinuation、status revision、reported cause、mitigation/import/substitution measure、notice和aggregate分别建模。
- `anticipated/current/resolved/discontinued`、`available/limited/unavailable`和native impact/criticality是正交来源声明；不得压成一条严重度或成功度。
- event/notification ID、NDC、ARTG、marketing authorisation、package、brand、ingredient、strength、dosage form和jurisdiction保持authority与粒度。共享成分不表示临床或供应可替代。
- manufacturer/MAH/sponsor的原因是来源声明，不是独立根因核验；预计结束日期不是承诺；`resolved`不证明每个药房、医院或患者已恢复供应。
- shortage不是recall、缺陷、伤害或违法；召回也不自动证明短缺。患者影响、临床风险和供应量只能在来源明确、分母固定时保留，不能外推。
- “alternative brand/strength/form”、进口许可或substitution instrument只保留为监管缓解事实，不生成治疗建议、处方替换、个体适用性或法律意见。
- 公开联系人、电话、邮箱、患者、处方、库存位置和药房级可得性在普通projection中drop；不做找药、患者匹配、诊断或用药建议。
- 同一来源的API、CSV、catalogue、notice和统计投影建立representation/common-origin relation，不按表面数重复计为独立短缺。

只有exact product/presentation、jurisdiction、record revision和source span可形成：

- `EvidenceRegulatorReportedMedicineSupplyConstraint`：来源声明的anticipated/current/limited/unavailable/discontinued supply state；
- `EvidenceReportedMedicineSupplyMitigation`：来源声明的allocation/import/expedite/alternative/substitution等管理行动。

二者都不是stock truth、根因、伤害、临床可替代性、需求规模、商业机会或措施有效性证据。

## 4. Rights、历史与访问边界

- openFDA公开JSON与bulk是同一origin的不同representation；官方说明记录可在每次更新时被修订，不能只把“新文件”当增量。Terms通常为CC0，但嵌入的第三方字段仍需按例外处理；官方明确禁止用于医疗决策。
- 加拿大2026年从旧Drug Shortages Canada迁移到Health Product Shortages Canada。Health Canada明确说明public API extraction instructions已变化；route、schema、host和terms必须作为一次breaking migration验证。
- EMA public catalogue只覆盖EMA评估的欧盟层面shortages，member-state registry是另一population。ESMP登录和M2M接口服务MAH/NCA report/update，不属于本Channel公共读取能力。
- TGA数据基于sponsor报告，TGA另行行动需明确authority；active/archive extract、search page、RSS和notice是不同representation。公开business contact仍在本系统默认drop。
- UK统计是经方法学定义的aggregate，不能还原公司、产品或患者，也不能把notification count当unique shortage、unique medicine、患者数或需求量。

## 5. Skills、MCP与开源候选静态审计

| Artifact | 固定revision / licence | 可借鉴 | 结论 |
| --- | --- | --- | --- |
| [FDA/openfda](https://github.com/FDA/openfda/tree/fdbe54327901a0c1e30130d1d6a2bbe67b79b77c) | `fdbe543` / CC0-1.0 | 官方endpoint/export pipeline、schema和common API结构 | authority-bearing source reference；不安装或运行整套pipeline |
| [openpharma-org/ema-mcp](https://github.com/openpharma-org/ema-mcp/tree/3d340f73f83ff3d07aea075c1d22a95e9fee9b6e) | `3d340f7` / MIT | `get_supply_shortages`工具形状、status/name filters、错误表面 | community MCP；“real-time/public JSON API”主张需逐route对照EMA，不可提升为官方contract |
| [Augmented-Nature/OpenFDA-MCP-Server](https://github.com/Augmented-Nature/OpenFDA-MCP-Server/tree/bab2751a89cf385bcaf0a3cf6cb091004408d682) | `bab2751` / personal non-commercial only | MCP error/rate-limit envelope的负面fixture | quarantine：固定源码使用`/drug/drugshortages.json`及与当前官方fields不符的schema；许可也不适合复用 |
| [LUNARTECH-X/superpowers FDA reference](https://github.com/LUNARTECH-X/superpowers/blob/44fde2d82698f701cb7320cc76916913fd31acc5/skills/academy-skills/fda/references/drugs.md) | `44fde2d` / MIT | Agent Skill文档结构 | quarantine：shortage endpoint/fields与当前官方contract不一致，不作为route或医学事实来源 |
| [cmd-christopher/openfda-drug Skill](https://github.com/cmd-christopher/openfda-drug/blob/8722fa97093b0a9a2a7083d90447bf945ecf458c/SKILL.md) | `8722fa9` / root license未发现 | 最小化openFDA Skill触发与caveat样本 | quarantine：使用`drugshortages`而非当前`shortages` route、声明max 1000而官方单次limit为100，且许可不明 |

本轮未安装、导入或执行任何第三方代码。开源许可证不授予平台数据、医疗用途、凭据、公共报送或长期AI/index权利。

## 6. 当前门槛

下一步固定为：synthetic identity/status/cause/mitigation/rights conformance → 用户批准的单成员metadata-only canary → exact record revision/history与删除语义核验 → content/aggregate rights review → durable materialization review。

调研中解析TGA官网`Export active shortage reports`链接时发生过一次只读文本预览；未保存文件、未纳入fixture/数仓、未继续抓取，也没有平台写入。该访问只证明链接当前可返回extract，不算conformance或callable evidence。此后门禁保持synthetic-only：禁止真实API/search/export/dataset下载、MCP/Skill执行、credential、报送或更新shortage、订阅/联系、患者/处方/库存数据、医疗建议、替代推荐，以及任何平台副作用。
