# 公共食品场所卫生检查、食源性暴发与关闭/恢复候选分诊（2026-08-26）

## 1. 结论

本轮选择四个互补而不互相补全的成员：

| 成员 | 原生价值 | 静态成熟度 | 明确缺口 |
| --- | --- | --- | --- |
| NYC DOHMH Restaurant Inspection Results | active restaurant permit population、inspection→citation rows、score/grade、closure/reopen/reclose action | concept + exact official Socrata/OData route fixture + selected/manual | 只保留active population；历史窗口与逐citation重复；不是outbreak或持续安全证明 |
| UK FSA FHRS/FHIS | 四国地方机关最新食品卫生rating、scheme/authority/business taxonomy、API v2和nightly XML | concept + exact official API/bulk fixture + selected/manual | FHRS与FHIS不可比较；主要是latest rating，不是完整inspection/enforcement/closure history |
| Toronto Public Health DineSafe | inspection、minor/significant/crucial infraction、Pass/Conditional Pass/Closed、reinspection/reopen | concept + exact official CKAN catalogue/bulk fixture + selected/manual | current/historical资源需分别固定；dataset licence metadata与portal-wide OGL需绑定时复核 |
| CDC NORS | 一行一outbreak、mode、etiology status、setting、food vehicle/ingredient、illness/outcome denominators | concept + exact official Socrata/OData route fixture + selected/manual | voluntary、underreported、12–18月close-out、可多年后修订；无exact establishment identity |

当前成熟度固定为：`requested=4 / concept-fixture=4 / exact official machine-or-bulk route-fixture=4 / official process-or-methodology fixture=4 / closure-reopening lineage route-fixture=2 / outbreak route-fixture=1 / selected-manual=4 / callable=0 / durable=0`。

本轮只读取官方网页、API/dataset metadata、一个Toronto CKAN catalogue metadata响应、固定Git revision及静态源码文本；没有请求任何establishment、inspection、violation、rating、closure、outbreak、etiology、food vehicle或illness数据行，没有安装或执行开源项目、Skill或MCP，也没有提交投诉、申请复查、申诉、整改、报告暴发或产生其他平台副作用。

## 2. 第一性原理边界

这个Channel要发现的是监管流程、数据质量、现场运营、纠正闭环、风险沟通和暴发监测中的需求，而不是给商户制造一个跨法域“安全/信誉分”。必须保留：

1. establishment、premises、permit、inspection、citation、rating、enforcement、closure、reinspection、reopening和outbreak分别拥有identity；
2. 一次inspection只覆盖当时、当次、exact scope；Pass不等于持续安全，Fail/Conditional Pass不等于疾病；
3. violation severity是本scheme分类；critical/crucial不自动证明foodborne illness，citation也不自动成为final legal finding；
4. score、letter grade、FHRS 0–5、FHIS Pass/Improvement Required和DineSafe notice不能换算、排序或构造统一分数；
5. closed是authority action/standing，不是永久停业、破产、声誉结论或outbreak；
6. operator声称纠正、reinspection verified、closure lifted和establishment reopened是不同事实；reopening不抹除历史，也不保证未来条件；
7. complaint-origin inspection不公开或验证complaint本身；complaint count不是unique people或confirmed harm；
8. NORS outbreak是两个及以上相似疾病、共同暴露的surveillance report；cluster、single case和sporadic illness不是同一population；
9. outbreak、illness、hospitalization、known hospitalization、death与known survival有不同分母；不能用已知结局子集当全部cases；
10. reported setting、food vehicle、ingredient和etiology均保留suspected/implicated/confirmed/unknown posture；名称、地址、菜系、时间或地理相似不能把outbreak连接到inspection establishment；
11. active/current dataset population、latest rating与完整历史不同；记录缺失不能证明未检查、无违规、无暴发或已永久关闭；
12. exact address、phone、owner/operator、permit number、complaint narrative、inspector comments、patient data、free-text notes默认drop；场所级公共记录也不得转成自然人画像或自动声誉标签。

## 3. 官方平台证据

### 3.1 NYC DOHMH

[官方dataset `43nn-pn8j`](https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j/)说明：每行是restaurant citation；同一次inspection有多条violation时inspection字段重复；CAMIS是restaurant permit identity；population只包括record date仍active的restaurants/college cafeterias，并保留至最近inspection向前三年的sustained或not-yet-adjudicated citation。`1/1/1900`代表尚未检查的new establishment，no-violation inspection仍有单行。dataset还警告administrative systems可能产生missing或illogical values。

`ACTION`明确区分violations cited、no violations、closed、reclosed和reopened；`SCORE`可因adjudication更新；`GRADE=P`表示closure后reopening相关的grade pending。一次inspection必须以source-declared inspection identity/cycle聚合，不能按citation rows计inspection。

[官方评分说明](https://www.nyc.gov/assets/doh/downloads/pdf/rii/restaurant-grading-faq.pdf)固定0–13=A、14–27=B、28+=C，但initial 14+、monitoring、reopening和部分complaint inspections可以scored但ungraded。[operator guide](https://www.nyc.gov/assets/doh/downloads/pdf/rii/blue-book.pdf)说明closure可因未能即时纠正public health hazard、无valid permit或连续高分触发；reopening必须在closed-to-public状态下接受reopening inspection并由supervisor授权。grade、closure与reopening因此是三套事实。

[NYC Open Data terms](https://opendata.cityofnewyork.us/overview/)把agency设为authoritative source，并明确数据可随时update/correct/refresh、仅供information、无accuracy/completeness/fitness warranty。Pack必须固定dataset ID、schema/data-dictionary revision、record date、active population、history window、inspection/citation aggregation、adjudication update与field allowlist。

### 3.2 UK FSA FHRS/FHIS

[官方open-data页](https://ratings.food.gov.uk/open-data?lang=en-US)和[API v2 help](https://api.ratings.food.gov.uk/help)提供无需注册的XML/JSON API及nightly local-authority XML/full download。每次请求需固定`x-api-version`；Authorities、Establishments、SchemeTypes、Ratings、ScoreDescriptors等endpoint分别验证，API search与bulk population不得无证据混合。

FHRS适用于England/Wales/Northern Ireland并使用0–5；Scotland FHIS使用Pass/Improvement Required。FHRS的hygiene/structure/confidence-in-management component scores不适用于FHIS，local authority上传rescore时component scores也可能不发布。`Awaiting Publication`表示appeal尚在处理，`NewRatingPending=true`表示新数据处于notification/appeal window；二者都不是当前rating的同义词。

`FHRSID`由local authority code与local business ID形成，但local authority迁移数据库、合并或重用ID会改变/保留identity，不能靠business name/address做silent merge；private-address establishment可以不公开address/geocode。该surface主要描述last inspection/visit的rating，不提供完整violation、enforcement、closure或outbreak history。

[terms](https://ratings.food.gov.uk/terms-and-conditions)把rating data置于OGL，但要求使用current rating或标明更新时间，且rating imagery/标识另受商标规则、不得暗示FSA endorsement。Pack默认只保留native rating key与更新时间，不复制badge imagery。

### 3.3 Toronto DineSafe

[DineSafe process](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/about-dinesafe/)区分minor、significant、crucial infractions：Pass可含minor；Conditional Pass表示至少一个significant并通常24–48小时reinspection；Closed要求未能即时纠正的crucial infraction和health hazard，只有authority确认相关infractions纠正后才可reopen。Pass、Conditional Pass、Closed、correction、reinspection与reopening必须形成事件链而不是覆盖latest status。

官方CKAN catalogue metadata固定package `b6b4f3fb-2e2c-47e7-931d-b87d22806948`，当前CSV/XML/JSON与historical ZIP为不同resource；metadata读取日期为2026-08-26，未读取resource rows。resource ID、format、last-modified与current/historical population逐项固定，禁止“first resource”或同名resource fallback。

[DineSafe terms](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/dinesafe-terms-of-use/)说明网站描述的是most recent inspection当时条件，通常24–36小时发布，不保证准确、完整或当前，也不构成endorsement。[Toronto OGL](https://open.toronto.ca/open-data-licence/)允许 lawful reuse但要求attribution、non-endorsement并排除personal/third-party/official marks。当前package metadata的`license_id=not specified`与portal-wide OGL并存；durable binding前必须把exact resource的licence evidence解决为一致，不能只靠portal默认值。

### 3.4 CDC NORS

[官方dataset `5xkq-dg7x`](https://data.cdc.gov/Foodborne-Waterborne-and-Related-Diseases/NORS/5xkq-dg7x)是一行一outbreak的Socrata/OData population，包含year/month/state、primary mode、etiology及confirmed/suspected status、setting、estimated primary illnesses、hospitalizations与known-hospitalization denominator、deaths与known-survival denominator、food vehicle及contaminated ingredient。

[NORS data guidance](https://www.cdc.gov/nors/data/)说明reporting由state/local/territorial health departments自愿完成；final data通常在reporting year后12–18个月close-out，但dynamic report仍可在数月或数年后修改。outbreak定义为两个及以上相似疾病和共同暴露；单case、未finalized或未close-out report可能不公开。voluntary reporting、detection capacity和training造成underreporting，outbreak distribution也不能代表sporadic illness。

`setting`对foodborne outbreak表示food prepared location的category，而不是exact business；food/ingredient有多种名称与分号多值。NORS与NYC/Toronto/FSA没有source-declared establishment relation，Channel只能保留`candidate-not-exact`，默认甚至不物化candidate。

dataset metadata标为U.S. Government Public Domain；[CDC material policy](https://www.cdc.gov/other/agencymaterials.html)仍要求source attribution、non-endorsement、不得改变substantive meaning，并提醒部分第三方材料例外。Pack只使用dataset fields和official definitions，不复制logo、第三方图片或叙事附件。

## 4. 固定开源、MCP与Skills审计

没有安装、构建或执行任何候选；只读取固定SHA下的README、manifest、license与少量source text。

| 候选与固定revision | 许可证证据 | 可借鉴 | 不采用为Connector的原因 |
| --- | --- | --- | --- |
| [xmunoz/sodapy@`52e1422`](https://github.com/xmunoz/sodapy/tree/52e14224361dd083a37a0267676d8d9e0c581228) | MIT | SODA token、query、pagination、typed client patterns | 同一client暴露upsert/replace/delete；无dataset/member/field/rights/zero-write约束 |
| [mjmgooch/food-hygiene-ratings@`4d39c58`](https://github.com/mjmgooch/food-hygiene-ratings/tree/4d39c58cf25b034cbd47060f635ff1704cb810fd) | package.json声明MIT，repo未发现LICENSE文件 | API v2 endpoint分组、headers与pagination参考 | axios版本陈旧；未建FHRS/FHIS、appeal/pending、ID drift、rights或history语义；license evidence不完整 |
| [open-data-toronto/ckan-customization@`104109c`](https://github.com/open-data-toronto/ckan-customization-open-data-toronto/tree/104109c624f897b4f739d1b46b1dc61ef1fa92dc) | MIT；官方Toronto Open Data组织 | package schema、resource conversion/cache、quality metadata的provider事实 | 是portal server extension，不是consumer Connector；包含authorized cache/reindex等write面 |
| [benwebber/open-data-toronto-dinesafe@`2d46ffd`](https://github.com/benwebber/open-data-toronto-dinesafe/tree/2d46ffdac4f8f22f3d7423eef227daaedadb8ba8) | README只说明data受Toronto OGL；repo code license未发现 | git-scraping、SQLite/Datasette和revision-history研究 | 二次镜像不是authority；code license不明；默认下载/物化真实数据，不满足本轮边界 |
| [Toronto-inc/toronto-mcp@`755eeae`](https://github.com/Toronto-inc/toronto-mcp/tree/755eeae868ec035415db4f6d9576681254ced369) | repo/package未发现license声明 | catalogue search、freshness、schema分析思路 | community remote MCP；`first active resource`、optional preview与宽natural-language query会绕过exact resource/field/rights gate |
| [openpharma-org/cdc-mcp@`e312481`](https://github.com/openpharma-org/cdc-mcp/tree/e312481d65026ffcd58eb15d6a32cc577a8e2e47) | MIT | Socrata pagination/rate-limit和typed dataset registry思路 | 固定dataset list未包含NORS；generic custom SoQL不能冒充NORS semantics/coverage |
| [cyanheads/socrata-mcp-server@`a21e685`](https://github.com/cyanheads/socrata-mcp-server/tree/a21e6856bcb61f81490c591c651e14d3a3a27174) | Apache-2.0 | schema-before-query、assembled query echo、SELECT-only analytical SQL | 跨portal发现、任意SoQL和DataCanvas spillover过宽；无成员population、敏感字段、retention、correction或evidence authority gate |

本轮未发现由NYC DOHMH、FSA、Toronto Public Health或CDC发布的domain-specific Agent Skill。检索到的restaurant recommendation/POI Skills服务消费推荐，不包含inspection/outbreak authority与rights契约，明确排除。通用Socrata/CKAN MCP只能作为静态实现研究，不能作为平台Skill或official route证据。

## 5. 验证阶梯与授权边界

后续只能按以下顺序晋级：

1. `evidence review`：固定official process、dataset/API/resource、schema、law/rating definition、population、history、privacy和rights digest；
2. `static contract`：验证四成员identity/authority/coverage不可互补，全部write/effect为零；
3. `fixture conformance`：只用手写synthetic fixtures验证一inspection多citation、rating pending/appeal、closure/reopen lineage、outbreak revision与denominator；
4. `sandbox live`：只有用户另行批准后，逐成员只读、字段白名单、低速、无持久化canary；
5. `operational canary`：rights、retention、correction/deletion传播、drift alert和人工停机门均验证后，才可讨论durable route。

任何真实API/SODA/OData/CKAN/API v2/XML/CSV/JSON/ZIP row、app token、MCP/Skill执行、exact address/phone/owner/operator/permit、complaint/inspector/patient/free text、长期warehouse/index、inspection/complaint/rerating/appeal/correction/closure/reopen/outbreak report/contact/subscribe/admin write均需另行授权。
