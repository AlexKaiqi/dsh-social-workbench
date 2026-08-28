# 潜在需求平台与开源接入生态调研

状态：研究草案，不代表已接入或获权
核验日期：2026-08-26
范围：需求发现、痛点研究和主动 Probe；社交平台详细能力沿用[平台接入矩阵](PLATFORM_MATRIX.md)。

本文件回答“目前哪些平台值得研究”；平台如何被持续发现、建模、验证并发布为可维护能力，见[新平台发现与 Platform Pack 长期架构](PLATFORM_DISCOVERY_LONG_TERM_ARCHITECTURE.md)。

## 1. 结论

不存在一个对所有业务都正确的平台优先级。平台应按它提供的信号类型和业务垂直组成 channel pack，而不是堆成统一“全网爬虫”。

建议的通用优先顺序是：

1. 自有/授权的一方数据；
2. 官方 feed、搜索、公开 API 和人工导入；
3. 能提供预算、支付、替代方案和真实行动的高价值场域；
4. 才是高讨论量但离交易较远的内容平台；
5. 私有 API、Cookie、浏览器自动化只作为风险研究样本，不进入默认生产 backlog。

对当前项目最有价值的新场域不是“更多社媒”，而是：

- 闲鱼等交易市场：价格、询盘、议价和订单接近付费意愿；
- 招聘与公开 ATS：职位、薪资和职责体现组织愿意投入的人力预算；
- 采购/RFP：预算、截止期和采购主体是最强的 B2B 需求证据之一；
- 知乎、V2EX、GitHub、Stack Exchange：问题、替代方案和失败原因表达清楚；
- 自有搜索、客服、销售、应用评论和问卷：归因清晰，最适合形成验证闭环。

## 2. 评估方法

### 2.1 价值维度

| 维度 | 问题 |
| --- | --- |
| 痛点表达 | 用户是否解释问题、情境、失败原因和期望结果？ |
| 行动接近度 | 信号是浏览、讨论、主动搜索、询价、预算还是支付？ |
| 人群可识别 | 能否区分受众/行业/岗位，而不依赖个人身份画像？ |
| 频率与时间 | 能否做增量观察、趋势和重复出现分析？ |
| Probe 能力 | 能否合法、诚实地发布测试并得到可归因反馈？ |
| 官方接入 | 是否有官方 API/feed/export、scope 和配额证据？ |
| 风险与成本 | 条款、个人信息、反爬、审核、费用和维护成本是否可控？ |

### 2.2 优先级

- `P0`：应进入第一批设计/conformance，价值高且有稳定官方或人工接入路径。
- `P1`：垂直相关时优先；需要账号、商务授权或更强治理。
- `P2`：有价值但接入脆弱、成本高或反馈弱，先保留 manual path。
- `Reject-auto`：可以研究价值，但默认不建设无人值守采集/执行器。

### 2.3 接入方式

统一使用 `official-api`、`official-feed-export`、`authorized-export`、`delegated-api`、`public-feed`、`browser-assisted`、`manual-import/manual-package`、`private-api-cookie` 和 `unsupported`。GitHub 上有代码不改变平台的官方接入事实。

## 3. 平台总览

| 场域 | 代表平台/来源 | 主要价值 | Probe 价值 | 推荐模式 | 优先级 |
| --- | --- | --- | --- | --- | --- |
| 一方数据 | 客服、销售、CRM、邮件、会议、站内搜索、表单 | 已发生的真实问题、输单和流失原因 | 极高 | authorized export / webhook / manual import | P0 |
| 自有搜索意图 | Search Console、Bing Webmaster、Algolia、Typesense | 自有站点曝光/点击或站内query/event，接近已有受众主动行为 | 高；synthetic query/event需独立Probe治理 | owned official API/export；站外曝光与站内行为分Channel | P0 |
| 外部搜索需求与趋势 | Google Trends、Google Ads Keyword Planning、Microsoft Advertising Ad Insight、百度指数 | 发现外部主题兴趣、近似搜索量、趋势、地域和关键词候选；不等于市场规模或痛点 | 广告/加词/刷量不是本Channel Probe | official alpha/API/public dataset/商业合同分别晋级；禁止HTML/Cookie/private endpoint fallback | P0-design |
| 问答 | 知乎、Stack Exchange | 完整问题、替代方案、反例 | 中高 | 知乎官方开放搜索为contract-gated typed candidate；Stack Exchange长期AI辅助采集/索引需事先书面同意 | P0/P1-design |
| 开发者社区/软件协作 | GitHub、GitLab、V2EX、HN | bug、feature request、版本回归、自建脚本和工具切换 | 高 | GitHub official API；GitLab.com bulk与HN系统性索引均policy-gated；社区写入独立治理 | 技术产品 P0-design |
| 内容社媒 | 小红书、抖音、B站、YouTube、微博 | 情绪、语言、场景和传播性 | 高 | 见现有平台矩阵 | 消费 P0 |
| 交易市场 | 闲鱼、eBay、垂直服务市场 | offer语言、供给结构、询价、议价和自有交易结果；挂牌不等于需求 | 很高，但只能发布真实可履约offer | manual/authorized official API；public API、衍生分析和write分别过政策门 | 消费/本地服务 P0-design/P1 |
| 招聘 | BOSS、猎聘、智联、企业 ATS | 组织投入、职责、技能缺口和薪资 | 低 | 官方 ATS API 优先；聚合站人工导入 | B2B P1 |
| 服务采购/自由职业 | Upwork、Freelancer.com、猪八戒、Fiverr | client-authored问题、交付、技能、预算与从响应到付款的结果链 | 很高，但只能发布确实准备hire/pay的真实工作 | Upwork仅保留即时用户任务候选；Freelancer.com缺书面自动访问/storage依据；猪八戒只证明known Task与provider participation且逐应用用途受限；三者durable均blocked；Fiverr Reject-auto | 服务/出海 P0-design |
| 本地服务/反向需求 | Taskrabbit、Thumbtack、Bark、58 | location/scope、estimate、matched lead、quote、booking、appointment与完成/取消；各平台暴露的人口不同 | 极高，但估价、Lead购买、时段保留和预约都可能产生隐私、费用或真人履约效果 | partner/Pro-owned official API优先；公开市场、合作方checkout、商家Lead和自有订单分别过用途门；禁止网页/cookie/MCP补全 | 本地服务 P0-design |
| 公共采购需求与合同执行 | SAM.gov、EU TED、UK FTS、CCGP、USAspending、Canada Proactive Contracts、Prozorro | buyer requirement、预算、截止期、授标、合同、变更、obligation/outlay与来源报告的履约/终止；不等于付款、成功或vendor quality | 不适合作为Probe；虚假公告、投标、合同/绩效发布都会进入受监管流程 | official API/feed/OCDS/CSV/manual import；identity、amount role、reporting threshold、history与privacy分层 | B2B/公共部门 P0/P1-design |
| 公共资助优先级/已资助研发 | Grants.gov、NIH RePORTER、EU Funding & Tenders/CORDIS、SBIR/STTR | 机构公开优先方向、eligibility、topic与被报告的award/project活动；不等于付款、成功或市场需求 | 不适合作为需求Probe；申请/提交是独立高影响流程 | official read API/bulk/open data；按opportunity/award/project representation与rights分别晋级 | 科研/B2B/公共部门 P0/P1-design |
| 公开规则制定/政策咨询 | Regulations.gov、Federal Register、EU Have Your Say、GOV.UK Consultations、中国司法部立法意见征集 | 主管机关可能改变规则的方向、时间窗，以及利益相关方正式陈述的负担、异议和替代方案；不等于生效法律、事实或代表性民意 | 不适合作为需求Probe；评论、反馈或意见提交是独立高影响流程 | official read API/schema/manual import；proposal/submission/outcome/official-edition分层，评论总体与覆盖独立 | B2B/公共部门 P0/P1-design |
| 公开公司披露/投资优先级 | SEC EDGAR、UK Companies House、EU ESEF/ESAP、HKEX IIS、巨潮资讯 | 企业正式声明的战略重点、运营风险、依赖、资本投入、研发与转型计划；不等于监管验证、客户需求、采购或投资建议 | 不适合作为Probe；法定申报、证券交易和高管联系是独立高影响流程 | official API/archive/registry/licensed feed/manual contract；filing/document/fact、authority、taxonomy/context与amendment分层 | B2B/企业研究 P0/P1-design |
| 产品评价 | App Store、Google Play、插件市场、G2、Capterra、TrustRadius | 已付费/已使用后的场景、优缺点、失败与切换原因 | 中 | 自有产品 official API/export；B2B public web blocked，订阅API、vendor export、licensed quote分开授权 | 产品/B2B P0/P1-design |
| 监管投诉/事故报告 | NHTSA、CFPB、CPSC | 已提交监管机构的问题、影响声明、企业回应与处理缺口 | 不适合作为Probe | official API/export；claim/finding、PII、population与publication drift分层 | 交通/金融/消费品 P0-design |
| 公开产品召回/纠正行动 | FDA openFDA、NHTSA Recalls、CPSC Recalls、EU Safety Gate、Canada Recalls and Safety Alerts | 主管机构或责任主体正式报告的受影响产品/批次、hazard/class、召回与remedy；不等于投诉、因果、完整回收或需求规模 | 不适合作为Probe；report/contact/alert发布是独立高影响流程 | official API/bulk/open-data/manual export；event/campaign/product/range/action、authority、mandate和common-origin分层 | 消费品/医疗/交通/B2B P0-design |
| 公开科研文献/报告的研究限制 | Crossref、OpenAlex、PubMed、Europe PMC、arXiv | 作者、编辑或review在固定工作版本中报告的限制、失败条件、假设、证据缺口和未来工作；不等于科学真理、用户痛点或市场需求 | 不适合作为Probe；投稿、更新、撤稿、联系作者和citation操作是独立高影响流程 | official metadata API/snapshot/OAI；work/version/record/representation与metadata/abstract/full-text rights分层 | 科研/技术/B2B P0/P1-design |
| 公开临床研究注册/报告约束 | ClinicalTrials.gov、WHO ICTRP、ISRCTN、EU CTIS、DRKS | 文献发表前的study plan、招募/状态、protocol amendment、提前终止、撤回与results posting缺口；不等于疗效、安全、医疗建议或患者需求 | 不适合作为Probe；注册、更新、招募、referral和结果提交是高影响流程 | official API/XML/CSV/manual export；study/protocol/record/status/outcome/results、authority、common-origin和contact/IPD drop分层 | 科研/医疗/B2B P0/P1-design |
| 公开药品供应短缺/可得性约束 | FDA、Health Product Shortages Canada、EMA、TGA、UK DHSC | 具体药品规格在辖区/时间窗内的anticipated/current/resolved/discontinued、availability、原因声明与缓解行动；不等于local stock、临床替代、患者伤害或需求规模 | 不适合作为Probe；report/update/contact/subscription和替代建议会影响监管/医疗流程 | official API/export/catalogue/statistics；event/product/presentation、native state/availability/impact、authority、mitigation、aggregate denominator与contact/clinical-advice drop分层 | 医疗/供应链/B2B P0/P1-design |
| 公共监管执法/补救义务 | EPA ECHO、CFPB、FTC、SEC、UK CMA | formal action中的allegation、finding/admission、order/judgment、appeal与remedial obligation可揭示高成本合规和运营摩擦；不等于违法真值、发生率或企业风险排名 | 不适合作为Probe；filing/comment/petition/report/contact/subscription均是高影响动作 | official read service/feed/selected record；case lifecycle、assertion posture、finality、obligation status、amount role、common-origin与natural-person drop分层 | B2B/金融/监管 P0/P1-design |
| 公共申诉专员裁决/报告救济 | UK FOS、UK Pensions Ombudsman、Ireland FSPO、UK Housing Ombudsman | formal dispute中的投诉议题、investigator/preliminary/final decision、outcome、binding与remedy可揭示服务和流程痛点；不等于普遍法律、投诉率或履行 | 不适合作为Probe；complaint/evidence submission、accept/reject、appeal/contact/subscription均是高影响动作 | Housing official RSS route fixture；其余selected record；stage/outcome/binding/remedy/appeal/publication denominator/common-origin与complainant drop分层 | 金融/住房/养老金/B2B P0/P1-design |
| 公共审计发现/建议/跟踪 | US GAO、UK NAO、ECA、Australia ANAO、Canada OAG | scoped finding、recommendation、auditee response与auditor follow-up揭示经审计的流程、控制和交付痛点；不等于普遍事实、违法、组织排名或需求规模 | 不适合作为Probe；audit request、举报/证据提交、auditee response/status update、contact/subscription均是高影响动作 | GAO RSS与ECA open-data catalogue route fixture；NAO/ANAO/OAG selected record；scope/method、authority、response/implementation与common-origin分层 | B2B/公共部门/治理 P0/P1-design |
| 公共311/市政服务请求 | NYC、San Francisco、Austin、Toronto | 居民/企业/部门主动报告的具体service need、分派、状态与source-declared disposition；不等于独立person/incident、已验证缺陷或实际解决 | 不适合作为Probe；虚假/重复报修、附图/位置提交、contact/subscription都会占用公共资源 | Socrata/CKAN/Open311静态route fixture；population、origin、duplicate、current-state/history、coarse location与privacy分层 | 城市服务/本地生活/公共部门 P0/P1-design |
| 公共参与式预算 | Barcelona、Madrid、Paris、NYC | resident proposal、程序筛选、priority aggregate、budget-constrained selection与authority execution status；不等于代表性民意、拨款、支出或客观完成 | 不作为Probe；提案、支持、投票、评论和official status mutation均有政治/预算副作用 | Paris winner与NYC historical official data route fixture；Decidim/CONSUL仅provider-schema candidate；逐stage/member coverage | 城市服务/公共部门/政策研究 P0/P1-design |
| 公共信息公开请求/机关回应/披露 | WhatDoTheyKnow、MuckRock、FragDenStaat、AskTheEU | 人们正式索取哪些既有records/data、机关如何通信和分类，以及实际公开了什么；不等于请求指控为真、机关有错、合法合规、代表性意见或完整披露 | 不作为Probe；draft/send/follow-up、缴费、review/appeal、annotation、upload、embargo与status mutation均是正式程序或隐私副作用 | FragDenStaat exact route fixture；WhatDoTheyKnow/AskTheEU仅Alaveteli provider candidate；MuckRock仅official source candidate；public-only visibility与classification authority分层 | 公共部门/公民科技/调查研究 P0/P1-design |
| 公共规划/开发申请、公众意见与决定 | England Planning Data、NSW Planning Portal、NYC ZAP、Ireland NPAD | 申请人请求的土地/建筑变化、正式exhibition/representation、assessment/recommendation、competent decision/conditions与appeal链；不等于事实、代表性民意、法律正确、已建成或有效 | 不作为Probe；application、support/object/comment、捐赠声明、upload、amendment、payment、appeal与admin mutation均是正式程序副作用 | England/NYC/Ireland exact route fixture，NSW catalogue/schema/manual；authority/stage/revision/population、coarse location与privacy分层 | 房地产/城市服务/公共部门/B2B P0/P1-design |
| 公共请愿/支持/官方回应 | UK Parliament、Scottish Parliament、Senedd、European Parliament | petitioner明确请求、平台接受的支持计数及government/committee/chamber后续；不等于事实、代表性民意、采纳或实施 | 不适合作为Probe；创建、签名、验证、campaign、证据提交与订阅都是政治参与或正式程序动作 | UK/Senedd静态JSON route fixture；Scotland/EU selected record；process/threshold/count/response/debate/privacy分层 | 公共政策/公共部门/B2B P0/P1-design |
| 公共食品场所卫生检查、食源性暴发与关闭/恢复 | NYC DOHMH、UK FSA、Toronto DineSafe、CDC NORS | 场所检查、引文/违规、评分、执法、关闭/恢复和被报告暴发可揭示运营与公共卫生约束；不等于持续安全、疾病因果、商户声誉或完整市场 | 不适合作为Probe；投诉、检查/复评、申诉、关闭/恢复与暴发报告均是高影响正式流程 | 四成员official machine/bulk route fixture；成员原生scheme、inspection/outbreak population、authority/history/denominator/privacy/rights分层 | 餐饮/本地生活/公共卫生/B2B P0/P1-design |
| 公共交通服务可靠性、中断与无障碍 | NYC MTA、TfL、MBTA、Transport for NSW | 计划与实际服务差距、预测不准、延误/取消、通告、设施故障、无障碍路径和绩效定义可揭示乘客与运营痛点；不等于每次行程体验或统一可靠性排名 | 不适合作为平台Probe；发布通告/设施状态、事故报告、预约、订阅、联系和运营控制均有真实副作用 | 四成员official schedule/realtime/alert route fixture；facility/accessibility/history/performance逐成员独立成熟度与denominator | 出行/城市服务/公共部门/B2B P0/P1-design |
| 公共道路事故、伤亡与危险位置 | NHTSA FARS、NYC MVC、UK DfT STATS19、Transport for NSW Crash Data | 事故/车辆/道路使用者/伤亡、严重程度修订、空间聚集与暴露率可揭示道路设计、报告流程和弱势群体痛点；不等于法律过错、真实全量事故或统一风险排名 | 不适合作为平台Probe；事故/危险报告、报警、联系警方/受害者、请求执法/道路工程和地图状态修改均有公共安全/法律副作用 | 四成员official dataset/population/schema route fixture；release/revision、severity、casualty、exposure与privacy逐成员独立 | 出行/城市服务/公共安全/公共部门/B2B P0/P1-design |
| 公共消费价格、通胀与可负担性 | U.S. BLS、UK ONS、Eurostat、Statistics Canada | quote/average/index/weight/adjustment/revision可揭示品类价格压力、替换与统计解释痛点；不等于库存、需求量、统一生活成本或个体家庭负担 | 不适合作为平台Probe；API注册、受限microdata、联系/订阅/统计提交与dashboard/MCP写入均有账户或外部副作用 | 四成员official index/weight route fixture；average-price=3、quote=1、inventory=0、affordability denominator=0 | 消费/零售/金融/公共政策/公共部门/B2B P0/P1-design |
| 公共租赁住房成本、空置与负担 | U.S. Census ACS、UK ONS PIPR、Eurostat EU-SILC、Canada CMHC RMS | 租金水平/指数、空置/可得性、周转与住房成本负担可揭示租住压力和市场摩擦；不等于live房源、unique tenant churn、驱逐、统一租金或个体困难 | 不适合作为平台Probe；key申请、受限microdata、联系/订阅、调查提交与MCP/admin写入均有账户、正式流程或外部副作用 | concept-fixture=4；exact machine route=2、official workbook/table route=4；level=3、index=1、vacancy=2、turnover=1、burden=2；callable=0 | 房地产/居住/金融/公共政策/公共部门/B2B P0/P1-design |
| 公共劳动力需求、职位空缺与周转统计 | U.S. BLS JOLTS、UK ONS Vacancy Survey、Eurostat JVS、Statistics Canada JVWS | 官方vacancy stock、filled/occupied denominator、rate、hire/separation flow、offered wage与quality可校准招聘需求强度；不等于公开posting、unique employer/person、filled job或实际工资 | 不适合作为平台Probe；key申请、受限microdata、联系/订阅、调查提交、mirror与MCP/admin写入均有账户、正式流程或外部副作用 | concept-fixture=4；exact machine route=3、official workbook/table route=4；vacancy/denominator/rate=4、hire/separation=1、offered-wage/characteristic=1；callable=0 | 招聘/劳动力/B2B/公共政策/公共部门 P0/P1-design |
| 公共企业形成、人口学与存续统计 | U.S. Census BFS/BDS、UK ONS Business Demography、Eurostat Business Demography、Statistics Canada MBOC | application/formation、enterprise/employer/establishment birth/death/opening/closure/exit、survival、high-growth与job dynamics可揭示创业、雇主与本地商业人口变化；不等于identified company lead、个体企业需求或成功 | 不适合作为平台Probe；key申请、受限microdata、联系/订阅、统计提交、mirror与MCP/database/admin写入均有账户、正式流程或外部副作用 | concept-fixture=4；exact machine route=3、official table/bulk route=4；application=1、active/entry/exit=4、reopening=1、survival=2、high-growth=1、employment=2；callable=0 | B2B/创业/劳动力/公共政策/公共部门 P0/P1-design |
| 公共企业破产、清算与重组统计 | U.S. Courts、UK Insolvency Service、Eurostat、Canada OSB | formal filing、liquidation、reorganisation/proposal、receivership/moratorium、case flow、rate与declared financial aggregates可揭示行业/地区财务困境和专业服务压力；不等于identified lead、企业死亡、失败原因或重组成功 | 不适合作为平台Probe；PACER/case search、account/token/key、fee、alert/subscription/purchase、filing/claim/contact和MCP/admin write均有法律、费用或外部副作用 | concept-fixture=4；exact machine route=1、official table/bulk route=4；filing=4、liquidation=3、rescue=3、receivership=2、case-flow/outcome=1、rate=2、financial=1；callable=0 | B2B/金融/法律/企业服务/公共政策/公共部门 P0/P1-design |
| 公共企业信贷需求与融资条件 | Federal Reserve SLOOS、ECB BLS、Bank of England CCS、Bank of Canada SLOS | lender-reported standards/availability、demand、price/non-price terms、expectations、performance与drivers揭示融资供需压力；不等于application、approval、loan volume、identified lead或因果 | 不适合作为平台Probe；survey submission、loan application、API key/subscription、MCP install、data download和金融动作均有副作用 | concept-fixture=4；exact machine route=3、official table/bulk route=4；availability/standards=4、current demand=3、price/non-price=4、expectation=3、performance=2；callable=0 | B2B/金融/企业服务/宏观/公共政策 P0/P1-design |
| 公共企业经营状况、约束与预期 | U.S. Census BTOS、UK ONS BICS、European Commission BCS business surveys、Statistics Canada CSBC | business-reported activity、demand、cost/price、workforce、supply-chain、obstacles、resilience/liquidity、confidence/uncertainty、expectations与plans揭示当前经营压力和预期；不等于audited fact、administrative outturn、identified lead、forecast或commitment | 不适合作为平台Probe；survey submission、restricted microdata、account/key/subscription/contact、MCP/Skill安装执行、download/mirror与admin write均有副作用 | concept-fixture=4；exact machine route=3、official table/bulk route=4；activity=4、demand=2、price-cost=4、workforce=4、constraint=4、resilience=2、confidence=4、expectation=4、planned-action=2、programme-lifecycle=4；callable=0 | B2B/企业服务/宏观/公共政策/公共部门 P0/P1-design |
| 公共企业数字技术采用、能力与障碍 | Census/NCSES ABS、UK ONS Digital Economy Survey、Eurostat ICT Usage in Enterprises、Statistics Canada SDTIU | internet、presence、e-commerce、cloud、AI、analytics、automation、security、skills、non-use reasons与external support intent揭示数字能力缺口；不等于installed inventory、verified deployment、procurement或identified lead | 不适合作为平台Probe；mandatory survey submission、key申请、download、MCP/Skill执行及全部write均有副作用 | concept=4、current-questionnaire=3、historical-questionnaire=4、exact-machine=3、table/bulk=4、cloud=4、AI=3、barrier=3、quality/lifecycle=4；callable=0 | B2B/企业服务/数字化/安全/公共政策 P0/P1-design |
| 公共企业创新活动、约束与协作 | Census/NCSES ABS Innovation、UKIS、Eurostat CIS、Statistics Canada SIBS | product/process innovation、ongoing/abandoned activity、novelty、investment、cooperation、information、barrier与support揭示企业改变尝试及能力缺口；不等于success、causal value、procurement或lead | 不适合作为平台Probe；survey submission、restricted microdata、key/contact、download、MCP/Skill执行及全部write均有副作用 | concept/questionnaire/latest-result=4、exact-machine=3、table/bulk=4、product/process/status/novelty/expenditure/cooperation/barrier/support/quality/lifecycle=4；callable=0 | B2B/企业服务/创新/科研/公共政策 P0/P1-design |
| 公共数字接入、技能与线上参与 | NTIA/Census、Ofcom Adults Media Literacy、Eurostat `isoc_i`、Statistics Canada CIUS | household/person access-use、device、non-use/affordability/reliability、self-reported skill、commerce/government、privacy/security与assistance揭示用户侧结构性摩擦；不等于个人画像、tested proficiency、causal pain或lead | 不适合作为平台Probe；respondent file/microdata、survey submission/contact、download、MCP/Skill执行、sensitive targeting与全部write均有副作用 | concept/questionnaire/latest-result=4、aggregate-machine=3、official-file=4、barrier/skill/commerce/government/privacy/quality/lifecycle=4；callable=0 | 消费/数字服务/公共政策/公共部门/B2B P0/P1-design |
| 公共家庭支出、消费与预算配置 | BLS CE、ONS LCF/Family Spending、Eurostat HBS、Statistics Canada SHS | aggregate expenditure、share、reporting prevalence、income/tenure/household breakdown揭示预算刚性与品类替代候选；不等于use、need、preference、satisfaction、market size或支付能力 | 不适合作为平台Probe；respondent/diary/microdata、special tabulation、survey submission/contact、download、MCP/Skill执行、sensitive targeting与全部write均有副作用 | concept/instrument/latest-result=4、machine=2、table/workbook=4、consumption/mean/share/quality/lifecycle=4；callable=0 | 消费/零售/金融/公共政策/公共部门/B2B P0/P1-design |
| 公共时间使用、照护、流动与日常活动配置 | BLS ATUS、ONS OTUS、Eurostat HETUS、Statistics Canada TUS | aggregate diary-day duration、participation、population/participant mean、time-of-day与care/travel/work/rest allocation揭示时间挤压候选；不等于个人routine、burden、productivity、preference、outcome或需求 | 不适合作为平台Probe；respondent diary/microdata、survey submission/recruitment/contact、download、MCP/Skill执行、schedule/profile targeting与全部write均有副作用 | concept/diary/latest-result=4、machine=3、file=4、primary=4、secondary=3、mean/quality/lifecycle=4；callable=0 | 消费/照护/交通/工作/教育/健康/公共政策/B2B P0/P1-design |
| 公共医疗服务可及性、未满足需求与患者报告障碍 | NCHS NHIS、England GPPS、Eurostat EU-SILC、ABS Patient Experiences | aggregate self-reported need、delay/nonreceipt、cost/wait/distance/availability barrier与care experience揭示“需要但未获得服务”的摩擦；不等于诊断、临床必要性、provider denial、客观质量或个体脆弱性 | 不适合作为平台Probe；response/microdata、care contact、health profiling、download、MCP/Skill执行、sensitive targeting与全部write均有医疗、隐私或外部副作用 | concept/questionnaire/result=4、machine=2、file=4、need/cost=4、wait=3、quality/lifecycle=4；callable=0 | 医疗服务/公共政策/保险/照护/数字健康 P0/P1-design |
| 公共家庭能源可负担性、能源不安全与服务连续性 | EIA RECS、England DESNZ LILEE、Eurostat EU-SILC、Australia AER | self-reported tradeoff/temperature/warmth/arrears、modelled fuel poverty、retailer-reported debt/hardship/disconnection揭示价格和支出之外的能源摩擦；不等于个体贫困、健康伤害、grid outage或服务商质量 | 不适合作为平台Probe；respondent/customer/account/microdata、bill/meter/interval、assistance/contact、download、MCP/Skill执行、sensitive targeting与全部write均有隐私、公共服务或外部副作用 | concept/indicator/result=4、machine=1、file=4、insecurity-or-poverty=3、debt-hardship=1、quality/lifecycle=4；callable=0 | 能源/住房/金融/公共服务/公共政策/B2B P0/P1-design |
| 产品使用 | PostHog、Amplitude、自有埋点/数仓 | 固定定义下的采用、路径中断与返回行为 | 实验需独立治理 | owned aggregate API/export；raw identity 默认拒绝 | 产品/B2B P0 |
| 产品可靠性/错误遥测 | Sentry、Firebase Crashlytics | 未主动反馈的崩溃、ANR、异常、版本回归与稳定性缺口 | 生产测试错误不是需求Probe | owned issue/report/aggregate read；diagnostic content默认restricted | 产品/开发者工具 P0-design |
| 公开运行状态/事故通告 | Atlassian Statuspage、Better Stack、Instatus | 厂商公开承认的故障、受影响组件、维护、恢复与复盘声明 | 假事故不是需求Probe | 用户批准public page的read-only API/JSON；active/recent/window coverage独立 | 产品/B2B P0-design |
| 公开软件漏洞/已利用风险 | OSV.dev、GitHub Advisory Database、CISA KEV | 受影响版本、修复边界、撤回和权威已利用声明；是风险触发器而非直接需求 | 扫描、PoC和自动修复不是需求Probe | approved package/CVE roster的public advisory read；source overlap与mixed license分层 | 安全/开发者工具 P0-design |
| 公开软件包生态/迁移压力 | npm、PyPI、crates.io | package/version/release/file、deprecate/yank/unpublish、release continuity与registry usage proxy；不是直接用户痛点 | install、publish、deprecate/yank/unpublish和刷下载量都不是需求Probe | approved public package roster；metadata/index/lifecycle与usage dataset分别晋级 | 开发者工具 P0-design |
| 公开技术标准/兼容变化 | IETF、W3C、WHATWG、TC39、OpenJDK JEP | 未来互操作要求、proposal取舍、弃用/移除/迁移与正式实现反馈；不是客户需求或已部署采用 | submission、comment、ballot、issue/PR和test result都不是需求Probe | IETF/W3C native metadata fixture；WHATWG/TC39 fixed official repository provider fixture；OpenJDK concept-only | 开发者工具/B2B P0-design |
| 公开产品支持论坛 | Discourse、NodeBB、Flarum deployments | 产品语境中的问题、复现、绕路、员工回复与可选solution state | 发帖/回复/点赞/标记solution不是本Channel Probe | approved deployment roster；guest GET、software/version/extension roster、Terms/robots逐站点晋级 | 产品/B2B/开发者工具 P0-design |
| 产品实验 | GrowthBook、LaunchDarkly | 用受控 treatment 验证产品假设，保留 assignment/exposure/guardrail | 极高但高影响 | owned control-plane API；逐 lifecycle capability 审批 | 产品 P0-design |
| 问卷/站内反馈 | Formbricks、Typeform | 直接表述、量表、开放问题及上下文反馈 | 高；受抽样/问法偏差约束 | owned API + signed webhook；publish单独审批 | 产品/研究 P0-design |
| 授权客户会话 | Zoom、Gong、Microsoft Teams | 访谈/销售/可用性通话中的语境、原话、替代方案与反对理由 | 高；可招募后人工访谈 | owned transcript API/export；media默认不取；录音/机器人另行授权 | B2B/研究 P0-design |
| 授权客户邮件 | Gmail、Microsoft Graph Mail | 异步问题、反对、替代方案、承诺和后续结果 | 高；真实外联另行治理 | metadata-first official API；逐范围正文；send/write拒绝 | B2B/研究 P0-design |
| 授权客户社区 | Slack、Discord | 多方问题复现、peer confirmation、变通方案和团队回应 | 高；发布会通知真实成员，必须独立Probe | 平台用途权利 + 组织批准 + bot/app技术授权三重门；Slack仅internal候选，Discord policy-blocked | B2B/研究 P0-design |
| 自有站内搜索 | Algolia、Typesense | 已进入自有产品/站点后主动寻找的主题、零结果和弱承接 | 高；synthetic query/event会污染分析，需独立Probe账本 | owned aggregate analytics；固定capture/config/event定义；write拒绝 | 产品/研究 P0-design |
| 自有产品需求板 | Canny、UserVoice | 显式feature/bug/improvement请求、支持关系、处理状态与交付沟通 | 高；创建/投票/评论会影响排行和通知 | owned API read；固定merge/support/status taxonomy；宽凭据write拒绝 | 产品/研究 P0-design |
| 发布/首发社区 | Product Hunt、Show HN、Indie Hackers | 新产品定位、早期采用者反馈 | 高 | Product Hunt API 商业用途需平台书面同意；真实自有产品可设计人工交接，禁止 AI 评论与投票操纵 | 出海 P1-design |
| 私域/群组 | Discord、Telegram、微信群、行业论坛 | 高语境、高质量问题 | 高 | 仅自有 bot 可见范围或明确授权导出 | P1/Reject-auto |

## 4. 一方数据与搜索意图

### 4.1 价值

第一方数据通常比公开平台更接近真实需求：客服工单说明当前阻塞，销售输单说明替代方案，站内搜索说明用户主动寻找什么，退款和流失原因说明价值未兑现。

推荐首批 source profile：

- `support-ticket`：问题、严重度、解决时长、重复联系；
- `sales-note/lost-deal`：目标、预算、反对理由、竞品；
- `interview/transcript`：授权录音/文本与精确 span；
- `site-search/search-console`：query、impression、click、page、时间；
- `survey/form`：问题版本、受众、回答与 consent；
- `owned-product-review`：版本、星级、正文、开发者回复。

### 4.2 Google Search Console

Search Analytics API 可查询用户有权访问的 property，按 query、page、country、device、date/hour、search appearance 和 search type 返回 clicks、impressions、CTR、average position。它是“自有结果被展示/点击”的高意图信号，不是全网关键词搜索量或用户级点击流。

重要 coverage 限制：API 不保证所有 rows，只返回 top rows，并限制每 property、每日、每 search type 最多 50K rows；query 还存在隐私 anonymization/omission。每日 BigQuery bulk export 更完整，但仍排除 anonymized queries，并引入 IAM、region、费用和 export gap。

- 官方：[Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- 官方：[Bulk data export](https://support.google.com/webmasters/answer/12918484)
- Platform Pack：[Google Search Console](platform-packs/GOOGLE_SEARCH_CONSOLE_PLATFORM_PACK_DESIGN.md)
- 建议：owned `official-api` P0 read-only；bulk `authorized-export/manual-only` 起步；property/sitemap/indexing writes 排除。

### 4.3 Bing Webmaster Tools

Bing Webmaster API 对 verified sites 提供 query/page/rank/traffic/crawl 数据，但当前正处于协议迁移：官方声明 legacy SOAP/POX 将于 2026-08-31 退役，现有公开 reference 仍大量引用旧 WCF/JSON/POX schema。本轮没有取得无歧义、版本化的 post-cutover REST analytics contract，因此 API adoption 是 `migration-blocked`，不能因社区 MCP 可运行就声称 callable。

- 官方：[Bing Webmaster API](https://learn.microsoft.com/en-us/bingwebmaster/)
- 官方：[OAuth 2.0 scopes](https://learn.microsoft.com/en-us/bingwebmaster/oauth2)
- Platform Pack：[Bing Webmaster Tools](platform-packs/BING_WEBMASTER_TOOLS_PLATFORM_PACK_DESIGN.md)
- 建议：用户选择 portal export 的 `manual-import` P0 degraded path；post-cutover REST 重新 evidence review 后再决定 API route。

两者的 mixed-maturity 组合见 [Owned Search Intent Channel Pack](platform-packs/OWNED_SEARCH_INTENT_CHANNEL_PACK_DESIGN.md)。它固定 site roster、aggregate grain/rollup、privacy suppression、coverage 与跨 engine 不可比边界。Google 可独立研究；Bing blocked 必须形成 missing-member report，不能借用 Google maturity。

### 4.4 Zendesk Support 与 Intercom Conversations

一方客服是当前最值得补齐的信号缺口：ticket/conversation 证明问题已经发生，并保留重复联系、升级、解决、满意度和处理摩擦；但它只代表进入客服渠道的人群，不能直接外推市场规模。Zendesk 与 Intercom 必须保留各自 ontology 和 checkpoint：Zendesk 区分 ticket snapshot、audit/event 与 comment；Intercom 区分 list/search view、单 conversation 最近 500 parts，以及独立 deleted-conversation reconciliation。

- Zendesk 官方：[Incremental Exports](https://developer.zendesk.com/api-reference/ticketing/ticket-management/incremental_exports/)、[OAuth](https://developer.zendesk.com/api-reference/introduction/security-and-auth/)、[Ticket audit events](https://developer.zendesk.com/documentation/ticketing/reference-guides/ticket-audit-events-reference/)
- Intercom 官方：[Conversations](https://developers.intercom.com/docs/references/rest-api/api.intercom.io/conversations)、[Pagination](https://developers.intercom.com/docs/build-an-integration/learn-more/rest-apis/pagination)、[OAuth scopes](https://developers.intercom.com/docs/build-an-integration/learn-more/authentication/oauth-scopes)、[Changelog](https://developers.intercom.com/docs/references/changelog)
- Platform Packs：[Zendesk Support](platform-packs/ZENDESK_SUPPORT_PLATFORM_PACK_DESIGN.md)、[Intercom Conversations](platform-packs/INTERCOM_CONVERSATIONS_PLATFORM_PACK_DESIGN.md)、[Owned Customer Support Channel](platform-packs/OWNED_CUSTOMER_SUPPORT_CHANNEL_PACK_DESIGN.md)
- 建议：仅连接组织拥有且明确授权的 instance/workspace，P0 read-only；默认排除 user/contact profile、附件、写回复和状态变更。field-level minimization、private note 隔离、redaction/deletion 级联和 coverage 限制是发布门，不是实现细节。

固定版本的开源研究样本（均未安装或执行）：

- [zendesk/zendesk_api_client_rb](https://github.com/zendesk/zendesk_api_client_rb/tree/7a24f1c88753d546d9bebf1f35af974627e94ef9)：Zendesk 官方 Apache-2.0 Ruby client；读写面过宽，只作 contract/fixture 参考。
- [intercom/intercom-node](https://github.com/intercom/intercom-node/tree/d8a05dee0314b74d6d0bbd49caccdd680a635c1a)：Intercom 官方 Apache-2.0 Node client；README 固定的 API 版本落后于本设计的 2.16，不能证明当前 schema conformance。
- [airbytehq/airbyte](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026)：state/pagination/回归 fixture 参考；Zendesk 历史回归说明只依赖 `updated_at` 会遗漏 system updates，Intercom connector 仍需审计 API version、license path 和 deletion coverage。
- [MeltanoLabs/tap-zendesk](https://github.com/MeltanoLabs/tap-zendesk/tree/432213465f5211111d40492263bb78090a62dc96)：Apache-2.0、Singer state 参考；replication key 与官方 `generated_timestamp` 语义需要重新核验。
- [singer-io/tap-intercom](https://github.com/singer-io/tap-intercom/tree/1c5e4cfbcbcfb6b481859047e5a9f38e24419b89)：AGPL-3.0 且文档混合旧 API 版本，拒绝复用，只保留为 stale-contract 负样本。

### 4.5 Salesforce Sales Cloud 与 HubSpot CRM Deals

一方 CRM 补的是“购买决策结果”，不是 lead 数量：Opportunity/Deal 能记录目标、金额、阶段、反对理由、竞品、赢单/输单和 no-decision，但样本只来自进入销售流程的人群，且多数文本由销售人员录入。closed won 不是 payment，pipeline amount 不是已确认预算，seller-entered loss reason 也不是客户逐字引语。

- Salesforce 官方：[Summer ’26 API v67.0](https://developer.salesforce.com/blogs/2026/06/the-salesforce-developers-guide-to-the-summer-26-release)、[Opportunity History](https://help.salesforce.com/s/articleView?id=sales.opp_history.htm&language=en_US&type=5)、[Pub/Sub event durability](https://developer.salesforce.com/docs/platform/pub-sub-api/guide/event-message-durability.html)、[Hosted MCP GA](https://developer.salesforce.com/blogs/2026/04/salesforce-hosted-mcp-servers-are-now-generally-available)
- HubSpot 官方：[2026-03 CRM Deals](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/guide)、[CRM Search limits](https://developers.hubspot.com/docs/api-reference/latest/crm/search-the-crm)、[Pipelines](https://developers.hubspot.com/docs/api-reference/latest/crm/pipelines/guide)、[Remote MCP](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server)
- Platform Packs：[Salesforce Sales Cloud](platform-packs/SALESFORCE_SALES_CLOUD_PLATFORM_PACK_DESIGN.md)、[HubSpot CRM Deals](platform-packs/HUBSPOT_CRM_DEALS_PLATFORM_PACK_DESIGN.md)、[Owned Sales Decisions Channel](platform-packs/OWNED_SALES_DECISIONS_CHANNEL_PACK_DESIGN.md)
- 建议：P0 read-only design/fixture；仅连接组织拥有且明确授权的 org/account/pipeline，默认排除 Contacts/Leads/Owners/activities/sensitive properties 和全部写入/外联。pipeline taxonomy、history coverage、currency、field handling 与 evidence authorship 都是发布门。

固定版本的开源研究样本（均未安装或执行）：

- [forcedotcom/pub-sub-api](https://github.com/forcedotcom/pub-sub-api/tree/20fb138250aa603394a670733bb41930095e0e85)：Salesforce 官方 CC0 proto/sample；README 明确示例非 production，只作 CDC fixture 参考。
- [jsforce/jsforce](https://github.com/jsforce/jsforce/tree/bf620c38dfa88a312379590ad0624a0cd4eee599)：MIT 社区 Salesforce client；API 面含 REST/Bulk/Streaming/Metadata/write，只作 mapping/test seam。
- [HubSpot/hubspot-api-nodejs](https://github.com/HubSpot/hubspot-api-nodejs/tree/978abdda6b14d1734d7e1d37f088d6acd18dc524)：HubSpot 官方 Apache-2.0 Node client；README 仍以 v3 为中心，不能证明 2026-03 schema conformance。
- [airbytehq/airbyte](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026)：双 CRM state/lookback/deletion 参考；其文档记录 Salesforce eventual-consistency、Bulk CSV `NA` 误解析，以及 HubSpot calculated timestamp/Search irregularity 的漏数风险。
- [MeltanoLabs/tap-salesforce](https://github.com/MeltanoLabs/tap-salesforce/tree/9915ca2683860f8810d8067792719b9b76e9995c) 与 [MeltanoLabs/tap-hubspot](https://github.com/MeltanoLabs/tap-hubspot/tree/fca5b961fa059a4c92a58af979040f0c80a6a42f)：分别 AGPL-3.0 与 Elastic-2.0；前者含 password auth/all-object discovery，后者混用 legacy v1 pipeline 且默认包含广泛 PII streams，均拒绝复用。

### 4.6 Stripe Billing 与 Chargebee

账单系统补的是“购买决定之后是否真正兑现价值”：订阅是否开始/续期、invoice 是否结清、实际 payment attempt 是否成功、取消何时请求和何时生效、资金是现金退款还是 credit/adjustment，以及 dispute 是否只是待裁决主张。它不能被压成 conversion/churn 布尔值：CRM won 不等于收款，Stripe invoice paid 不总意味着 processor 扣款成功，Chargebee `non_renewing` 不等于已经终止，一次 payment failure 也不等于用户流失。

- Stripe 官方：[Subscription object](https://docs.stripe.com/api/subscriptions/object)、[Invoice lifecycle](https://docs.stripe.com/invoicing/overview)、[Credit Note](https://docs.stripe.com/api/credit_notes/object)、[webhook delivery](https://docs.stripe.com/webhooks)、[API versioning](https://docs.stripe.com/api/versioning)
- Chargebee 官方：[Subscriptions](https://apidocs.chargebee.com/docs/api/subscriptions)、[Invoices](https://apidocs.chargebee.com/docs/api/invoices)、[Transactions](https://apidocs.chargebee.com/docs/api/transactions)、[Credit Notes](https://apidocs.chargebee.com/docs/api/credit_notes)、[read consistency](https://apidocs.chargebee.com/docs/api/read-consistency)
- Platform Packs：[Stripe Billing](platform-packs/STRIPE_BILLING_PLATFORM_PACK_DESIGN.md)、[Chargebee Billing](platform-packs/CHARGEBEE_BILLING_PLATFORM_PACK_DESIGN.md)、[Owned Subscription Outcomes Channel](platform-packs/OWNED_SUBSCRIPTION_OUTCOMES_CHANNEL_PACK_DESIGN.md)
- 建议：P0 read-only design/fixture；只连接组织拥有且明确授权的 account/site/product roster，按 subscription/invoice/payment/refund-credit/dispute 分别指定权威源。默认排除 Customer、Payment Method/Source、地址、卡/银行信息、invoice PDF、dispute evidence、arbitrary metadata、export 和全部账单写入。

固定版本的开源与 Agent 接入研究样本（均未安装或执行）：

- [stripe/stripe-go](https://github.com/stripe/stripe-go/tree/cde1a43c7e4d321320d5804da47bc4de10396179) `v86.3.0` 与 [stripe/openapi](https://github.com/stripe/openapi/tree/5326c7c7720c0785528e513329b9738ac625ff98)：Stripe 官方 MIT SDK/schema；前者固定 GA API `2026-07-29.dahlia`，只作 schema/fixture 参考，不采用其完整读写 client 面。
- [stripe/ai](https://github.com/stripe/ai/tree/bad904b02f7071592c38bcca83d33667ff015bb1)：Stripe 官方 MIT Agent/MCP 资料；工具面包含创建与退款等副作用，当前只研究 skill/tool taxonomy，不接入确定性采集 route。
- [chargebee/chargebee-go](https://github.com/chargebee/chargebee-go/tree/8241079a28167ba0134125adeafe421c2ff76fcb) `v4.8.0` 与 [chargebee/openapi](https://github.com/chargebee/openapi/tree/4b3edca1d4858e7b93ecf95c1d6c21c4b99c49ba)：Chargebee 官方 MIT SDK/schema；仍需按站点 Product Catalog version 固定 schema，不能用 SDK 版本替代 site configuration evidence。
- [chargebee/ai](https://github.com/chargebee/ai/tree/6cb5b9e60ac4f61bd799a4f7803ecef047df7775)：Chargebee 官方 Agent Skills 候选；核验 revision 未见许可证，且 skill 覆盖完整 CRUD/CLI、认证示例与官方 Basic Auth 语义不一致，因此拒绝复用，仅作为负向权限与文档漂移样本。
- [airbytehq/airbyte](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026)：Stripe/Chargebee source 的 cursor、state、删除和 regression 参考；相关 connector 为 ELv2，不作为本插件代码依赖，且默认 stream/字段范围远宽于需求研究的最小权限面。

### 4.7 PostHog 与 Amplitude 产品使用分析

产品分析补的是“产品是否在固定埋点与分析定义下被观察到使用”：关键事件/Action 是否发生、用户或组织是否经过 funnel、是否按 first/recurring/rolling/calendar 等规则返回、哪些功能出现 adoption gap。它不是更细的客服记录：事件由团队选择和埋点，identity merge、filters、timezone、窗口、分母、action/custom-event revision和当前周期完整度都会改变结论。“没有事件”还可能是 SDK/ingest/quota/identity/TTL/late export 故障，不能直接解释为没有使用或痛点。

- PostHog 官方：[Events](https://posthog.com/docs/data/events)、[Actions](https://posthog.com/docs/data/actions)、[Funnels](https://posthog.com/docs/product-analytics/funnels)、[Retention](https://posthog.com/docs/product-analytics/retention)、[Queries](https://posthog.com/docs/api/queries)、[Batch exports](https://posthog.com/docs/api/batch-exports)
- Amplitude 官方：[Dashboard REST](https://amplitude.com/docs/apis/analytics/dashboard-rest)、[Export API](https://amplitude.com/docs/apis/analytics/export)、[User properties and events](https://amplitude.com/docs/data/user-properties-and-events)、[Retention](https://www.amplitude.com/docs/analytics/charts/retention-analysis/retention-analysis-build)、[MCP](https://amplitude.com/docs/amplitude-ai/amplitude-mcp)
- Platform Packs：[PostHog Product Analytics](platform-packs/POSTHOG_PRODUCT_ANALYTICS_PLATFORM_PACK_DESIGN.md)、[Amplitude Product Analytics](platform-packs/AMPLITUDE_PRODUCT_ANALYTICS_PLATFORM_PACK_DESIGN.md)、[Owned Product Usage Channel](platform-packs/OWNED_PRODUCT_USAGE_CHANNEL_PACK_DESIGN.md)
- 建议：P0 aggregate-first read-only design/fixture；只连接组织拥有且明确授权的 project/surface/event roster，并固定 tracking/analysis/identity definition。默认排除 raw event/person/user/cohort member、session replay、URL/IP/geo/property values、arbitrary SQL、MCP broad tools和所有chart/action/view/taxonomy/flag/experiment/survey写入。

固定版本的开源与 Agent 接入研究样本（均未安装或执行）：

- [PostHog/posthog](https://github.com/PostHog/posthog/tree/1a153a4c331d07c1204b48dc34d2a03bd9ed53fb)：官方monorepo，root与`ee/`为混合许可边界；只作current schema/MCP/regression参考，复用需exact-path license审计。
- [PostHog/ai-plugin](https://github.com/PostHog/ai-plugin/tree/b708fd5c82e37fc12ed4b80045407119dafe8aaa)：usage/activation方法论有价值，但固定revision无LICENSE文件且skills会创建SQL/view/workflow等对象，当前只作license-blocked方法证据。
- [amplitude/mcp-marketplace](https://github.com/amplitude/mcp-marketplace/tree/7dcd19575c504e6e6270edc32dae5222e3b78bac)：官方MIT Skills；journey/taxonomy/opportunity问题框架可参考，但用户级识别、外联、replay和write建议必须剥离。
- [Amplitude-TypeScript](https://github.com/amplitude/Amplitude-TypeScript/tree/f831aba44bf8259d105ee7c632e48ac553bf3a64)：官方MIT ingestion SDK，只用于identity/event fixture和埋点语义，不是read Connector。
- [airbytehq/airbyte](https://github.com/airbytehq/airbyte/tree/1339a9ecca6f8fb547ffb7b19665d6980c069026)：Amplitude source的Export/hour state可作fixture；PostHog source仍走旧host/offset/raw persons等宽数据面。相关ELv2 connector均不直接复用。

### 4.8 GrowthBook 与 LaunchDarkly 自有产品实验

产品实验补的是“在固定 eligibility、assignment、真实 exposure、metric 与 analysis definition 下，treatment 是否改变目标结果”。它必须与普通产品分析分开治理：启动、停止、采用 winner 与 rollback 都可能改变线上 serving；assignment 不等于 exposure；改 allocation、audience、metric 或 flag config 会产生新 phase/iteration，不能覆盖或随意合并历史。

- GrowthBook 官方：[Experiments](https://docs.growthbook.io/experiments)、[Configuration](https://docs.growthbook.io/app/experiment-configuration)、[Results](https://docs.growthbook.io/app/experiment-results)、[API](https://docs.growthbook.io/app/api)
- LaunchDarkly 官方：[Experiments API](https://launchdarkly.com/docs/api/experiments)、[Start/stop](https://launchdarkly.com/docs/home/experimentation/start-stop-exp)、[Events](https://launchdarkly.com/docs/home/experimentation/events)、[Results data](https://launchdarkly.com/docs/home/experimentation/results-data)
- Platform Packs：[GrowthBook Product Experiment](platform-packs/GROWTHBOOK_PRODUCT_EXPERIMENT_PLATFORM_PACK_DESIGN.md)、[LaunchDarkly Experimentation](platform-packs/LAUNCHDARKLY_EXPERIMENTATION_PLATFORM_PACK_DESIGN.md)、[Owned Product Experiment Channel](platform-packs/OWNED_PRODUCT_EXPERIMENT_CHANNEL_PACK_DESIGN.md)
- 建议：P0 architecture/static/fixture，默认 read-only；真实 draft/start/stop/serve/rollback 均 deferred，只有 synthetic environment、least privilege、逐 capability 外部审批、unknown reconcile 和 rollback drill 完成后才可单独晋级。LaunchDarkly deprecated results endpoint 不作为新依赖。

固定版本候选（均未安装或执行）：GrowthBook `v5.0.1` OpenAPI/main repo、官方 Skills、MCP `v2.1.0` 与 Go SDK `v0.2.9`；LaunchDarkly generated Go API client `v24.0.0`、Go server SDK `v7.16.0`、AI tooling、MCP `v0.6.2`；固定 Airbyte commit 仅存在 LaunchDarkly ELv2 source metadata，没有 GrowthBook source。Skills/MCP 的 broad write 与软确认不能替代 Connector policy/approval/outbox/reconcile。

### 4.9 Formbricks 与 Typeform 自有问卷/站内反馈

问卷提供的是“目标样本在固定问题、选项/量表、逻辑和 consent 上下文中的回答”。它能发现未知语言、原因和优先级，但不天然代表全部用户，也不证明实际行为或支付。definition、recruitment/targeting、display/recontact、partial/submitted、non-response、anonymous/identified 模式与删除传播都是证据的一部分；表单标题或题目 ref 相同不足以跨平台合并。

- Formbricks 官方：[REST API](https://formbricks.com/docs/api-reference/rest-api)、[v2 Beta](https://formbricks.com/docs/api-v2-reference/introduction)、[responses](https://formbricks.com/docs/api-v2-reference/management-api--responses/get-responses)、[recontact](https://formbricks.com/docs/app-surveys/recontact)
- Typeform 官方：[Responses](https://developer.typeform.com/developers/responses/reference/retrieve-responses/)、[Webhooks](https://developer.typeform.com/developers/webhooks/)、[OAuth scopes](https://developer.typeform.com/developers/get-started/scopes/)、[MCP](https://developer.typeform.com/developers/get-started/mcp/)
- Platform Packs：[Formbricks Survey Feedback](platform-packs/FORMBRICKS_SURVEY_FEEDBACK_PLATFORM_PACK_DESIGN.md)、[Typeform Survey Response](platform-packs/TYPEFORM_SURVEY_RESPONSE_PLATFORM_PACK_DESIGN.md)、[Owned Survey Feedback Channel](platform-packs/OWNED_SURVEY_FEEDBACK_CHANNEL_PACK_DESIGN.md)
- 建议：P0 read/push architecture/static/fixture；默认 definition-first、question-level field allowlist、signed webhook + pull reconcile。draft/publish/close/delete、webhook配置、invite/reminder与response write均 deferred，live需 synthetic workspace和逐能力授权。

固定开源候选（均未安装或执行）：Formbricks core `5.3.4`（AGPL-3.0，`apps/web/modules/ee`另有Enterprise许可）、官方 JS SDK `5.0.0`（MIT）；Typeform JS API client `v2.10.4`（MIT）、embed `v1.0.0`（LGPL-3.0）；固定 Airbyte commit 同时存在 Formbricks/Typeform ELv2 sources，但前者仍使用v1并读取identified people等宽stream，后者stream/field面也超出最小需求，均只作fixture/reference。Typeform hosted MCP包含forms/contacts/automations写面，不能直接作为Connector；未发现可复用的官方repo-owned survey Skill。

### 4.10 Zoom、Gong 与 Microsoft Teams 授权客户会话

客户会议提供的是“一次被选择、被记录并被转写的会话 representation”，不是自动可信的用户原话。scheduled/actual occurrence、recording、transcript revision、speaker mapping、participant business role、同意、ASR gaps、剪辑/编辑/redaction、private/restricted coverage 与平台派生 summary/topic/tracker/scorecard 都必须同行。只有 exact meeting/call relation 或用户确认的 integration ledger 才能把 Zoom meeting 与其 Gong import 标为同一 occurrence；标题、时间和参会者相似不足以去重。

- Zoom 官方：[Meeting APIs](https://developers.zoom.us/docs/api/meetings/)、[Webhooks](https://developers.zoom.us/docs/api/webhooks/)、[OAuth granular scopes](https://developers.zoom.us/docs/integrations/oauth-scopes-granular/)、[Audio transcription](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064927)、[recording consent](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0068402)
- Gong 官方：[API introduction](https://help.gong.io/apidocs/introduction-2)、[Calls](https://help.gong.io/apidocs/retrieve-call-data-by-date-range-v2calls-2)、[Transcripts](https://help.gong.io/apidocs/retrieve-transcripts-of-calls-by-date-or-callids-v2callstranscript-2)、[Extensive calls](https://help.gong.io/apidocs/retrieve-detailed-call-data-by-various-filters-v2callsextensive-2)、[official MCP boundary](https://help.gong.io/docs/about-gong-mcp-server)
- Teams 官方：[Transcript/recording overview](https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/meeting-transcripts/overview-transcripts)、[Get callTranscript v1](https://learn.microsoft.com/en-us/graph/api/calltranscript-get?view=graph-rest-1.0)、[change notifications](https://learn.microsoft.com/en-us/graph/teams-changenotifications-callrecording-and-calltranscript)、[storage/permissions](https://learn.microsoft.com/en-us/MicrosoftTeams/tmr-meeting-recording-change)
- Platform Packs：[Zoom Cloud Conversation](platform-packs/ZOOM_CLOUD_CONVERSATION_PLATFORM_PACK_DESIGN.md)、[Gong Conversation Intelligence](platform-packs/GONG_CONVERSATION_INTELLIGENCE_PLATFORM_PACK_DESIGN.md)、[Microsoft Teams Conversation](platform-packs/MICROSOFT_TEAMS_CONVERSATION_PLATFORM_PACK_DESIGN.md)、[Owned Customer Conversation Channel v0.1](platform-packs/OWNED_CUSTOMER_CONVERSATION_CHANNEL_PACK_V0_1_DESIGN.md)
- 建议：P0 architecture/static/fixture，默认只读 occurrence/manifest/transcript；media download、private/restricted、bot/recording、schedule/share/config/comment/CRM/delete 与所有平台写均 deferred/rejected。live 只在用户授权的 synthetic account/workspace 进行。

固定开源与 Agent 候选（均未安装或执行）：Zoom 官方 Skills/MCP registry；Gong Airbyte source 与两个 community MCP；Microsoft Graph Go SDK `v1.99.0`、官方 docs source、Microsoft MCP catalog，以及 Airbyte Teams `1.2.28` alpha/community source。Gong hosted MCP 不返回 raw transcript；Microsoft Teams MCP/Agent 365 与 Graph transcript API 也是不同surface。Teams v1 endpoint 与 platform overview 对 channel/ad-hoc maturity存在文档冲突，相关surface保持blocked，不继承 Zoom/Gong maturity。

### 4.11 Gmail 与 Microsoft Graph Mail 授权客户邮件

邮件不是一段可直接全文索引的客户文本。一个业务thread可能包含多份mailbox copy、quoted history、forward、signature、自动通知和附件；Gmail threadId与Outlook conversationId也不是跨平台thread。只有exact message revision、reviewed authored-body span与有证据的participant/business role，才能形成subject-authored候选。地址、domain、Sent/Inbox folder或同主题都不能自动证明客户身份或duplicate。

- Gmail 官方：[API overview](https://developers.google.com/workspace/gmail/api/guides)、[Messages](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages)、[Sync](https://developers.google.com/workspace/gmail/api/guides/sync)、[Push](https://developers.google.com/workspace/gmail/api/guides/push)、[Scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)
- Microsoft 官方：[Message resource](https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0)、[Message delta](https://learn.microsoft.com/en-us/graph/api/message-delta?view=graph-rest-1.0)、[Immutable IDs](https://learn.microsoft.com/en-us/graph/outlook-immutable-id)、[Change notification lifecycle](https://learn.microsoft.com/en-us/graph/change-notifications-lifecycle-events)
- Platform Packs：[Gmail Correspondence](platform-packs/GMAIL_CORRESPONDENCE_PLATFORM_PACK_DESIGN.md)、[Microsoft Graph Mail Correspondence](platform-packs/MICROSOFT_GRAPH_MAIL_CORRESPONDENCE_PLATFORM_PACK_DESIGN.md)、[Owned Customer Correspondence Channel](platform-packs/OWNED_CUSTOMER_CORRESPONDENCE_CHANNEL_PACK_DESIGN.md)
- 建议：P0 architecture/static/fixture，metadata-first；body只按approved mailbox/folder-or-label/message policy读取。attachments、contacts/directory、domain/tenant-wide、watch/subscription配置、MCP和draft/send/reply/forward/modify/move/delete全部deferred/rejected。

固定候选（均未安装或执行）：Google Workspace CLI `0.22.5` commit `a3768d0…`（Apache-2.0，含官方gws-gmail Skill及send/manage宽面）、Google API Go client commit `0e513f7…`（BSD-3-Clause）、Airbyte Gmail `0.1.13` alpha/community（ELv2）；Microsoft Graph Go SDK `v1.99.0`（MIT）与Microsoft MCP catalog commit `2c6a6cd…`（Mail remote tools含create/send/reply/update/delete/search）。固定Airbyte revision未发现Outlook source。所有Skill/MCP只作schema/tool taxonomy/拒绝fixture。

### 4.12 Algolia 与 Typesense 自有站内搜索意图

站内搜索观察的是用户已进入自有surface后主动提交或停留的query，与Search Console/Bing“外部搜索引擎展示自有页面”不同。热门query、零结果、点击与转化具有较高行动接近度，但必须固定surface/index、schema/ranking/synonym/rule/filter/locale revision、typeahead/空query capture、total/tracked denominator、event定义与attribution。零结果既可能是未满足需求，也可能是索引延迟、filter、typo、locale、库存或relevance配置问题。

- Algolia官方：[Top searches](https://www.algolia.com/doc/libraries/sdk/methods/analytics/get-top-searches)、[Click/conversion events](https://www.algolia.com/doc/guides/sending-events)、[Productivity MCP](https://www.algolia.com/doc/guides/model-context-protocol/productivity-mcp)
- Typesense官方：[Analytics v30.2](https://typesense.org/docs/30.2/api/analytics-query-suggestions.html)、[API Keys](https://typesense.org/docs/30.2/api/api-keys.html)、[Server configuration](https://typesense.org/docs/30.2/api/server-configuration.html)
- Platform Packs：[Algolia Site Search Analytics](platform-packs/ALGOLIA_SITE_SEARCH_ANALYTICS_PLATFORM_PACK_DESIGN.md)、[Typesense Site Search Analytics](platform-packs/TYPESENSE_SITE_SEARCH_ANALYTICS_PLATFORM_PACK_DESIGN.md)、[Owned Site Search Intent Channel](platform-packs/OWNED_SITE_SEARCH_INTENT_CHANNEL_PACK_DESIGN.md)
- 建议：P0 architecture/static/fixture，aggregate-first、query原文restricted；默认只读 analytics/destination collections。event send、rule/settings/synonym/index/document/counter、raw user log和broad MCP均拒绝或deferred。

固定候选（均未安装或执行）：Algolia Go client `v4.40.0` commit `c573738…`（MIT）、官方Skills commit `ded7ff3…`（MIT）与managed read-only Productivity MCP；Typesense server `v30.2` commit `d45d46b…`（GPL-3.0）、Go client commit `f55adb3…`（Apache-2.0）和OpenAPI commit `cbdcaf9…`（根目录未发现license，只作schema evidence）。尚未确认Typesense官方analytics MCP/Agent Skill。

### 4.13 Canny 与 UserVoice 自有产品需求板

需求板提供的是“在固定board/forum、visibility、status和support定义下被提交、归并与支持的产品请求”，不是天然的独立重复需求。必须区分原始post/suggestion、团队整理的idea、vote/supporter/request/account等支持口径、merge迁移、公开/内部status及changelog/feature/Jira等交付声明。创建者代客户提交、import/integration、合并后的迁移计数和provider AI insight都会改变证据强度。

- Canny官方：[API Reference](https://developers.canny.io/api-reference)、[API/Webhook overview](https://help.canny.io/en/articles/4195400-the-canny-api)
- UserVoice官方：[Admin API getting started](https://developer.uservoice.com/docs/api/v2/getting-started/)、[Authentication](https://developer.uservoice.com/docs/api/api-key)、[Merge Ideas](https://help.uservoice.com/hc/en-us/articles/8009924667027-Merge-Ideas)、[Status taxonomy](https://help.uservoice.com/hc/en-us/articles/360034982174-Customize-Public-and-Internal-Status)
- Platform Packs：[Canny Product Request](platform-packs/CANNY_PRODUCT_REQUEST_PLATFORM_PACK_DESIGN.md)、[UserVoice Product Request](platform-packs/USERVOICE_PRODUCT_REQUEST_PLATFORM_PACK_DESIGN.md)、[Owned Product Request Channel](platform-packs/OWNED_PRODUCT_REQUEST_CHANNEL_PACK_DESIGN.md)
- 建议：P0 architecture/static/fixture，item/support/status/merge四层分离，aggregate-first且raw identity默认拒绝。Canny secret key与UserVoice trusted client都具有宽write authority；即使只读验证通过也必须保留broad/admin-credential condition。

固定候选（均未安装或执行）：固定Airbyte commit中的Canny `0.0.56`/manifest `4.6.2`和UserVoice `0.0.62`/manifest `5.12.0`均为ELv2、alpha/community；Canny community MCP `a991846…`（Apache-2.0，readonly default但底层key仍宽）、community JS wrapper `344425f…`（MIT）；UserVoice官方iOS SDK `v3.2.6`已archived/deprecated，只作历史参考。未确认两平台发布的当前官方MCP/Agent Skill。

### 4.14 Slack 与 Discord 授权客户社区

客户社区不是“另一种会议”或“另一封长邮件”：它是长期、多方、权限持续变化的space/channel/thread/message流，包含成员、bot、webhook、system、forward/crosspost、reaction、edit与delete。需求研究必须固定deployment/data-use basis、approved channel roster、scope/intents/effective permissions、content available-vs-omitted、thread/relation、actor/content role、event gap、retention和deletion revision。discussion只说明来源；只有reviewed authored span才能成为complaint、workaround、urgency等需求证据。

- Slack官方：[Conversations API](https://docs.slack.dev/apis/web-api/using-the-conversations-api/)、[Events API](https://docs.slack.dev/apis/events-api/)、[API Terms](https://slack.com/terms-of-service/api)、[MCP and Skills](https://docs.slack.dev/ai/slack-skills-plugin/)
- Discord官方：[API v10](https://docs.discord.com/developers/reference)、[Threads](https://docs.discord.com/developers/topics/threads)、[Permissions](https://docs.discord.com/developers/topics/permissions)、[Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy)
- Platform Packs：[Slack Customer Community](platform-packs/SLACK_CUSTOMER_COMMUNITY_PLATFORM_PACK_DESIGN.md)、[Discord Customer Community](platform-packs/DISCORD_CUSTOMER_COMMUNITY_PLATFORM_PACK_DESIGN.md)、[Authorized Customer Community Channel](platform-packs/OWNED_CUSTOMER_COMMUNITY_CHANNEL_PACK_DESIGN.md)
- 建议：P0 architecture/static/fixture。Slack只把internal customer-built app或独立Terms审查通过的deployment列为后续sandbox候选；Discord当前禁止mining/scraping，未获平台书面许可或approved-functionality basis前保持`policy-blocked`。DM/MPIM、private expansion、member profile、attachments、Hosted MCP后台采集和所有write默认拒绝。

固定候选（均未安装或执行）：Slack官方Skills `9f982fb…`（MIT）、Bolt JS `v5.0.0`/`e2b90aa…`（MIT）、Node Web API `8.0.0`/`70e15b8…`（MIT）；Discord官方docs `5dce8bd…`（CC-BY-SA-4.0/MIT samples）、discord.js `14.27.0`/`6232a21…`（Apache-2.0）、discordgo `v0.29.0`/`6e8fa27…`（BSD-3-Clause）。Airbyte Slack `3.2.19`/manifest `6.60.5`默认auto-join会写平台，Discord `0.1.10`/manifest `6.33.6`为alpha且未解决用途政策，只作fixture reference。Discord community MCP `024655e…`与`0c69379…`读写面过宽，只作schema discovery；未定位到Discord官方MCP/Agent Skill。

### 4.15 Sentry 与 Firebase Crashlytics 自有产品可靠性

产品可靠性遥测补的是“系统实际观察到失败”，不是另一种用户投诉。Sentry把error events按grouping/fingerprint形成issue，并提供release/environment、triage lifecycle与release-health aggregate；Crashlytics把相似blamed-thread事件分成issue/variant，并提供fatal、non-fatal、ANR、provider signals、v1alpha reports/events与BigQuery export。两者都受SDK覆盖、sampling/filter、upload、grouping和retention影响。

- Sentry官方：[Web API](https://docs.sentry.io/api/)、[Organization Issues](https://docs.sentry.io/api/events/list-an-organizations-issues/)、[Issue Events](https://docs.sentry.io/api/events/list-an-issues-events/)、[Release Health](https://docs.sentry.io/api/releases/retrieve-release-health-session-statistics/)
- Crashlytics官方：[REST v1alpha](https://firebase.google.com/docs/reference/crashlytics/rest)、[Issue resource](https://firebase.google.com/docs/reference/crashlytics/rest/v1alpha/projects.apps.issues)、[BigQuery schema](https://firebase.google.com/docs/crashlytics/bigquery-dataset-schema)、[privacy/retention](https://firebase.google.com/support/privacy)
- Platform Packs：[候选分流](platform-packs/OWNED_PRODUCT_RELIABILITY_TRIAGE_2026-08-26.md)、[Sentry](platform-packs/SENTRY_PRODUCT_RELIABILITY_PLATFORM_PACK_DESIGN.md)、[Firebase Crashlytics](platform-packs/FIREBASE_CRASHLYTICS_PRODUCT_RELIABILITY_PLATFORM_PACK_DESIGN.md)、[Owned Product Reliability Channel](platform-packs/OWNED_PRODUCT_RELIABILITY_CHANNEL_PACK_DESIGN.md)
- 建议：P0 architecture/static/fixture；issue/group/event、release/environment、state/signal、sampling/filtering和event/user/session denominator分离。默认只保留aggregate/issue metadata；stacktrace、message、breadcrumbs、logs、request、locals、custom keys、identity、attachment/replay/minidump均先过pre-persistence secret/PII gate。

固定候选（均未安装或执行）：Sentry官方`api-schema` `022cd04…`（FSL-1.1-Apache-2.0 Future）、`sentry-for-ai` `c1aab39…`与Codex plugin `1f076eb…`（MIT）；Firebase官方`firebase-tools` `5c167cb…`/`15.28.1`（MIT）。两边官方Skills/MCP都混合read与issue/note/config/code effects，不能整体进入Connector route。

### 4.16 Statuspage、Better Stack 与 Instatus 公开运行状态

公开状态页补的是“服务提供者对外声明发生了什么运行事件”，不是另一份自有错误遥测或用户投诉。共同抽象分开page、component/resource、incident、update、scheduled maintenance、postmortem、current/bounded representation、publisher lifecycle、condition/impact computation与override、manual/automatic/integration/mirror provenance。identified/resolved只保留publisher assertion；uptime/history不是独立SLI/SLA。

- Statuspage官方：[Status API](https://status.atlassian.com/api)、[API边界](https://support.atlassian.com/statuspage/docs/what-are-the-different-apis-under-statuspage/)、[Components](https://support.atlassian.com/statuspage/docs/show-service-status-with-components/)、[Impact](https://support.atlassian.com/statuspage/docs/top-level-status-and-incident-impact-calculations/)、[Uptime history](https://support.atlassian.com/statuspage/docs/display-historical-uptime-of-components/)
- Better Stack官方：[Public JSON](https://betterstack.com/docs/uptime/status-pages/subscribing-to-status-updates/subscribing-to-api/)、[Incidents](https://betterstack.com/docs/uptime/working-with-incidents/)、[Manual resource](https://betterstack.com/docs/uptime/working-with-status-pages/manually-tracked-item/)、[MCP scope](https://betterstack.com/docs/ai-sre/mcp-server-comparison/)
- Instatus官方：[Public data](https://instatus.com/help/api/public-data)、[API](https://instatus.com/help/api)、[Incidents](https://instatus.com/help/api/incidents)
- Platform Packs：[候选分流](platform-packs/PUBLIC_OPERATIONAL_STATUS_TRIAGE_2026-08-26.md)、[Statuspage](platform-packs/ATLASSIAN_STATUSPAGE_PUBLIC_INCIDENTS_PLATFORM_PACK_DESIGN.md)、[Better Stack](platform-packs/BETTER_STACK_PUBLIC_STATUS_PLATFORM_PACK_DESIGN.md)、[Instatus](platform-packs/INSTATUS_PUBLIC_STATUS_SUMMARY_PLATFORM_PACK_DESIGN.md)、[Channel](platform-packs/PUBLIC_OPERATIONAL_STATUS_CHANNEL_PACK_DESIGN.md)
- 建议：P0 architecture/static/fixture。Statuspage recent-50、Better Stack 90-day和Instatus active-only逐成员报告；private/Manage API、token、MCP、订阅和任何status write默认拒绝。

固定候选（均未安装或执行）：Better Stack官方Cursor plugin `478942e…`（MIT）只配置remote MCP且能力含incident写；Terraform provider `f462bd2…`（Apache-2.0）是配置管理参考；Instatus官方OpenAPI `bc179f0…`/spec `2.0.0`未声明许可证，且public summary与global bearer security存在contract drift，只链接审阅。未确认Statuspage/Instatus发布专用官方Agent Skill/MCP，也未发现Statuspage官方OSS client。

### 4.17 OSV、GitHub Advisory Database 与 CISA KEV 公开软件风险

漏洞数据补的是“安全来源声明哪些软件/版本受影响、修复或撤回，以及是否被CISA列为已在野利用”，不是直接用户需求或本地资产事实。共同抽象分开vulnerability、advisory、affected subject/range、severity/risk assessment、known-exploitation entry、remediation statement和dataset snapshot；ID alias、version resolver、authority与common-origin lineage必须版本化。

- OSV官方：[API](https://google.github.io/osv.dev/api/)、[querybatch](https://google.github.io/osv.dev/post-v1-querybatch/)、[data sources/dumps](https://google.github.io/osv.dev/data/)、[schema](https://ossf.github.io/osv-schema/)
- GitHub官方：[Global advisory REST](https://docs.github.com/en/rest/security-advisories/global-advisories?apiVersion=2026-03-10)、[Advisory Database](https://github.com/github/advisory-database)、[GitHub MCP](https://github.com/github/github-mcp-server)
- CISA官方：[KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)、[KEV mirror/schema](https://github.com/cisagov/kev-data)
- Platform Packs：[候选分流](platform-packs/PUBLIC_SOFTWARE_VULNERABILITY_TRIAGE_2026-08-26.md)、[OSV](platform-packs/OSV_PUBLIC_VULNERABILITY_PLATFORM_PACK_DESIGN.md)、[GitHub Advisory](platform-packs/GITHUB_ADVISORY_DATABASE_PLATFORM_PACK_DESIGN.md)、[CISA KEV](platform-packs/CISA_KEV_PLATFORM_PACK_DESIGN.md)、[Channel](platform-packs/PUBLIC_SOFTWARE_VULNERABILITY_CHANNEL_PACK_DESIGN.md)
- 建议：P0 architecture/static/fixture。requested=3/fixture=3/callable=0，但independent authority按record计算；OSV导入GitHub的同源advisory不能双计，KEV只增加known-exploitation assertion，不补affected range。

固定候选（均未安装或执行）：OSV service `da79e81…`、OSV schema `3ead7d9…`和OSV-Scanner `a67bcfe…`为Apache-2.0；GitHub advisory database `eb2636f…`为CC-BY-4.0，GitHub MCP `822c877…`和Microsoft advisory MCP `cd68016…`为MIT；CISA KEV mirror `f450aa8…`为CC0-1.0。OSV聚合数据沿用各上游许可；scanner/MCP、repo clone、SBOM/asset scan、PoC/reference fetch与remediation均不进入Connector route。

### 4.18 npm、PyPI 与 crates.io 公开软件包生态

软件包registry补的是“哪些package/version/artifact存在、publisher或registry声明了什么lifecycle、resolver看见什么，以及provider计了多少下载事件”，不是unique users、adoption、quality、market demand或本地安装事实。共同抽象分开package/project/crate、version/release、artifact、declared dependency、mutable pointer、lifecycle assertion、usage aggregate、search placement和dataset snapshot；identity、normalization、native resolver、lifecycle scope与metric definition必须版本化。

- npm官方：[Registry API](https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md)、[download counts](https://github.com/npm/registry/blob/main/docs/download-counts.md)、[deprecation](https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions/)、[unpublish policy](https://docs.npmjs.com/policies/unpublish/)
- PyPI/PyPA官方：[API policy](https://docs.pypi.org/api/)、[JSON API](https://docs.pypi.org/api/json/)、[Index API](https://docs.pypi.org/api/index-api/)、[yanking](https://docs.pypi.org/project-management/yanking/)、[download analysis](https://packaging.python.org/en/latest/guides/analyzing-pypi-package-downloads/)
- Rust官方：[registry index](https://doc.rust-lang.org/cargo/reference/registry-index.html)、[web API](https://doc.rust-lang.org/cargo/reference/registry-web-api.html)、[cargo yank](https://doc.rust-lang.org/cargo/commands/cargo-yank.html)、[data access policy](https://crates.io/data-access)
- Platform Packs：[候选分流](platform-packs/PUBLIC_SOFTWARE_PACKAGE_ECOSYSTEM_TRIAGE_2026-08-26.md)、[npm](platform-packs/NPM_PUBLIC_PACKAGE_ECOSYSTEM_PLATFORM_PACK_DESIGN.md)、[PyPI](platform-packs/PYPI_PUBLIC_PACKAGE_ECOSYSTEM_PLATFORM_PACK_DESIGN.md)、[crates.io](platform-packs/CRATES_IO_PUBLIC_PACKAGE_ECOSYSTEM_PLATFORM_PACK_DESIGN.md)、[Channel](platform-packs/PUBLIC_SOFTWARE_PACKAGE_ECOSYSTEM_CHANNEL_PACK_DESIGN.md)
- 建议：P0 architecture/static/fixture。requested=3/fixture=3/callable=0；metadata/lifecycle/usage分别计coverage，禁止跨registry同名合并、version比较或download汇总。

固定候选（均未安装或执行）：npm API docs `861fa7a…`（MIT code/CC-BY-4.0 docs）、npm CLI `d6c6122…`（Artistic-2.0）、Warehouse `1ccf4dc…`与Twine `f536ac5…`（Apache-2.0）、crates.io `2004dfd…`与Cargo `94ba974…`（MIT OR Apache-2.0）；community npm-skills `9c6e698…`（MIT）、pypinfo `3950b39…`（MIT）与crates-io-api `21a6b18…`（MIT OR Apache-2.0）只作静态参考。未发现三个官方组织发布的专用Agent Skill/MCP；community npm Skill/MCP含artifact download、token与write面，保持quarantined。

### 4.19 Discourse、NodeBB 与 Flarum 公开产品支持论坛

产品支持论坛补的是产品语境中的question/topic、reply/post、复现、workaround、staff response与可选accepted/solved state。它不同于代码issue、通用Q&A和私域community。三者首先是论坛软件，不是集中式数据平台；真实authority是每一个deployment，必须独立固定owner/host、software/version、hosting、plugin/extension roster、guest permission、Terms、robots、rate与retention。

- Discourse官方：[REST API docs](https://docs.discourse.org/)、[API documentation](https://meta.discourse.org/t/discourse-rest-api-documentation/22706)、[Solved](https://meta.discourse.org/t/discourse-solved/30155)、[rate limits](https://meta.discourse.org/t/available-settings-for-global-rate-limits-and-throttling/78612)
- NodeBB官方：[development/page JSON](https://docs.nodebb.org/development/)、[Read API OpenAPI](https://github.com/NodeBB/NodeBB/blob/master/public/openapi/read.yaml)、[federation](https://docs.nodebb.org/activitypub/fep/7888/)
- Flarum官方：[extension architecture](https://docs.flarum.org/extend/)、[REST API](https://docs.flarum.org/rest-api/)
- Platform Packs：[候选分流](platform-packs/PUBLIC_SUPPORT_FORUM_INFRASTRUCTURE_TRIAGE_2026-08-26.md)、[Discourse](platform-packs/DISCOURSE_PUBLIC_SUPPORT_FORUM_PLATFORM_PACK_DESIGN.md)、[NodeBB](platform-packs/NODEBB_PUBLIC_SUPPORT_FORUM_PLATFORM_PACK_DESIGN.md)、[Flarum](platform-packs/FLARUM_PUBLIC_SUPPORT_FORUM_PLATFORM_PACK_DESIGN.md)、[Channel](platform-packs/PUBLIC_SUPPORT_FORUM_CHANNEL_PACK_DESIGN.md)
- 建议：P0 architecture/static/fixture。requested=3/fixture=3/callable=0；software template与deployment binding分层，accepted/solved不等于fixed，search/included/federated copy不等于complete或independent authority。

固定候选（均未安装或执行）：Discourse core `3c90358…`（GPL-2.0-or-later）、API docs `6737ac2…`（MIT）与官方MCP tag `e7fc321…`（MIT）；NodeBB core `a9e2f69…`（GPL-3.0）；Flarum framework `29da25d…`（MIT）。Discourse repo Skills是工程开发知识而非需求采集Skill；官方MCP虽默认read-only，仍含site selection、private/admin/Data Explorer、remote discovery与opt-in writes，保持quarantined。未发现NodeBB/Flarum官方研究Skill/MCP；归档的flagrow Flarum client含master-key/admin历史面，拒绝采用。

### 4.20 Google Trends、Google Ads、Microsoft Advertising 与百度指数外部搜索需求

这个Channel补的是“自有站点之外，某个主题在固定provider定义下表现出怎样的相对兴趣、近似搜索量、排名或广告规划信号”。它不复用Search Console的自有property曝光，也不复用Algolia/Typesense的站内search event。共同抽象必须先固定population和representation，再解释数值：sampled normalized interest、cross-request consistently scaled interest、approximate historical count、provider weighted index、ranked/truncated list、provider-generated suggestion和configuration-dependent forecast彼此不可换算。

- Google Trends官方alpha提供近五年的一致尺度趋势，但仍是受限申请面且不是绝对搜索量；公开BigQuery dataset是按地区/时间发布的top与rising list，不是任意关键词时序查询：[Trends API](https://developers.google.com/search/apis/trends)、[数据解释](https://support.google.com/trends/answer/4365533)、[BigQuery dataset](https://support.google.com/trends/answer/12764470)。
- Google Ads Keyword Planning把ideas、近似historical metrics和account/campaign/bid/config依赖forecast分开；developer token、OAuth、access level和permissible use必须在binding前验证：[overview](https://developers.google.com/google-ads/api/docs/keyword-planning/overview)、[historical metrics](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics)、[forecast](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-forecast-metrics)、[access levels](https://developers.google.com/google-ads/api/docs/api-policy/access-levels)。官方Google Ads MCP当前是账号GAQL/metadata工具面，不证明KeywordPlanIdeaService route。
- Microsoft Advertising Ad Insight v13提供keyword ideas、monthly search counts和traffic estimates；monthly volume最新月可能延迟，未固定DateRange时不能稳定锚定第一项，estimate也不是保证：[guide](https://learn.microsoft.com/en-us/advertising/guides/keyword-ideas-traffic-estimates?view=bingads-13)、[GetKeywordIdeas](https://learn.microsoft.com/en-us/advertising/ad-insight-service/getkeywordideas?view=bingads-13)、[GetKeywordTrafficEstimates](https://learn.microsoft.com/en-us/advertising/ad-insight-service/getkeywordtrafficestimates?view=bingads-13)。sandbox与production仍是独立authority。
- 百度指数公开帮助把搜索指数描述为基于搜索频次的加权和；当前首页宣传付费API化能力，但公开帮助仍称公开版暂不提供开放API，且未取得公开、版本化的endpoint/schema/用途合同。因此只保留`commercial-contract-only/schema-blocked`候选，不降级Cookie、内部endpoint或解密爬虫：[百度指数](https://index.baidu.com/v2/)、[帮助](https://index.baidu.com/Helper/?tpl=help)、[版权](https://index.baidu.com/Helper/?tpl=copyright)。
- Platform Packs：[候选分流](platform-packs/EXTERNAL_SEARCH_DEMAND_TRENDS_TRIAGE_2026-08-26.md)、[Google Trends](platform-packs/GOOGLE_TRENDS_EXTERNAL_SEARCH_DEMAND_PLATFORM_PACK_DESIGN.md)、[Google Ads](platform-packs/GOOGLE_ADS_KEYWORD_PLANNING_PLATFORM_PACK_DESIGN.md)、[Microsoft Advertising](platform-packs/MICROSOFT_ADVERTISING_KEYWORD_PLANNING_PLATFORM_PACK_DESIGN.md)、[百度指数](platform-packs/BAIDU_INDEX_EXTERNAL_SEARCH_DEMAND_PLATFORM_PACK_DESIGN.md)、[Channel](platform-packs/EXTERNAL_SEARCH_DEMAND_TRENDS_CHANNEL_PACK_DESIGN.md)。
- 建议：P0 architecture/static/fixture。requested=4、fixture-eligible=3、callable=0；Trends alpha在拿到实际schema前不进入fixture，百度negative fixture只证明正确阻断。任何真实API/BigQuery/MCP/SDK、账号、token、费用、广告或加词write另行授权。

固定候选（均未安装、执行或连接）：Google Ads MCP `ba47210…`、Python client `481f222…`和googleapis schema `d10ac92…`均Apache-2.0；GoogleTrends/data `44ce5e8…`与MicrosoftDocs/Advertising `a21125d…`均CC-BY-4.0；Bing Ads Python SDK `cce8cc7…`为MIT。community keyword-planner MCP `e4df7f6…`只作静态tool/auth风险参考；pytrends `a9984ff…`、google-trends-api `7d7f0ea…`与百度Cookie/private endpoint项目均拒绝作为route。

Apple App Store Connect 和 Google Play Developer API 的自有应用评论边界见第 9 节；owned API 都不能据此扩展成任意竞品数据。

官方文档：

- [Google Search Console API](https://developers.google.com/webmaster-tools)
- [Apple Customer Reviews API](https://developer.apple.com/documentation/appstoreconnectapi/customer-reviews)
- [Google Play Reply to Reviews API](https://developers.google.com/android-publisher/reply-to-reviews)

相关开源项目：

- [Formbricks](https://github.com/formbricks/formbricks)：问卷/站内反馈候选；core 为 AGPLv3，企业目录另有商业许可，优先作为外部服务适配。
- [GrowthBook](https://github.com/growthbook/growthbook)：产品内 A/B 与 feature experiment 参考；大部分 MIT，部分目录商业许可。它可执行产品实验，但不拥有本系统的跨渠道 Probe ledger。
- [Umami](https://github.com/umami-software/umami)：自托管网页分析候选；在采用前重新核验许可证和事件导出契约。
- [googleapis/google-api-go-client](https://github.com/googleapis/google-api-go-client/tree/0e513f755761be9adb93856a3fff5daae65c468d) 与 [google-api-python-client](https://github.com/googleapis/google-api-python-client/tree/b0089df6768a806c3d837f71b5ba7eca79934e5a)：Google 官方 generated/discovery clients，分别 BSD-3-Clause/Apache-2.0；client 不替代 aggregate、coverage 与 privacy 契约。
- [jurgisgavenas/search-console-mcp](https://github.com/jurgisgavenas/search-console-mcp/tree/87db9f315d27d63fef126d958dd9caac7505392d)：MIT、窄 read-only MCP 参考；两 commit 低成熟度快照，未执行。
- [saurabhsharma2u/search-console-mcp](https://github.com/saurabhsharma2u/search-console-mcp/tree/4eccd60aacb395abb247c79b6fb07d80a02f6fe1)：MIT、Google/Bing cross-engine 参考；混合读取、site/sitemap/indexing writes，且 Bing cutover 未验证，不能整体采用。
- [facundoolano/app-store-scraper](https://github.com/facundoolano/app-store-scraper) 与 [JoMingyu/google-play-scraper](https://github.com/JoMingyu/google-play-scraper)：竞品公开评论研究样本；属于非官方页面/接口抽取，不能替代自有应用官方 API，需逐项核验条款和稳定性。

## 5. 中文问答与开发者社区

### 5.1 知乎

价值：中文问题描述完整、回答中常包含替代方案、失败原因、行业语境和反例；适合形成高质量 EvidenceSpan。

官方能力：知乎数据开放平台当前提供站内搜索REST、官方downloadable Skill、Zhihu CLI和remote MCP。`zhihu_search`返回问题/回答/文章的provider-selected摘要、精选评论、作者显示字段、authority level和ranking score；单次最多10条，REST文档称`HasMore`当前固定false。它是query-scoped top sample，不是全文、完整thread或全站coverage。

- REST typed schema适合future Connector建模；MCP结果是XML text，不应原样绕过untrusted-content parser和字段最小化进入模型；
- official Search Skill `2.0.0`（SHA-256 `a11c735d…`）与CLI Skill `0.4.0`（`dedd3b30…`）已静态固定，但archive common paths未见LICENSE，未安装/执行；
- REST与Skill示例对`HasMore`存在冲突；ContentType enum、摘要/原文、EditTime语义和selected comments coverage也需fixture/live验证；
- 平台明确面向AI且处于邀测/商务准入，但公开页未提供足以固定本主体长期保存、全文/向量索引、训练、再分发和删除传播权利的独立data-use contract；当前`contract-gated/no route`；
- search read不授权问题/回答/文章/评论/赞同发布，也不授权网页/private API抓取或CLI本人数据/知识库能力。

- 官方：[知乎数据开放平台](https://developer.zhihu.com/)
- 官方：[知乎搜索 API](https://developer.zhihu.com/docs?key=zhihu_search)、[知乎搜索 Skill](https://developer.zhihu.com/docs?key=zhihu_search_skill)、[Zhihu CLI](https://developer.zhihu.com/docs?key=zhihu_cli)
- 官方：[知乎搜索 MCP](https://developer.zhihu.com/docs?key=zhihu_search_mcp)
- Platform Pack：[知乎开放搜索](platform-packs/ZHIHU_OPEN_SEARCH_PLATFORM_PACK_DESIGN.md)；候选分流：[中国公开问题与技术社区](platform-packs/CHINA_PUBLIC_PROBLEM_COMMUNITIES_TRIAGE_2026-08-26.md)
- 建议：typed `official-api` contract candidate，P0-design；当前不申请Access Secret、不建立route、index或发布manual-package。

### 5.2 V2EX

价值：独立开发者、技术从业者和小团队会直接讨论工具缺口、成本、迁移和产品评价；节点可作为天然 facet。

官方能力：V2EX API 2.0 Beta提供PAT鉴权、节点主题、主题和回复读取；当前文档最后更新2026-08-03。PAT最长180天。API页正文称默认每IP每小时600次，但示例header仍为120。旧API公平使用规则鼓励学术/移动应用/扩展，但反对用API结果填充商业/个人网站和content farm；它与2.0及本系统产品研究、durable warehouse、全文/向量索引、AI派生和商业用途的关系仍需书面澄清。

- Node是Topic唯一归属且可能被作者/管理员移动的container，不是tag；hot/latest是时点list placement，不是搜索或Topic固有rank；
- v2页面当前没有完整response schema、page size/termination、revision/deletion contract；无通用搜索，不得退到HTML、private API、第三方scraper/MCP；
- `/go/create`、`/go/sandbox`、`/go/promotions`是人类社区参与语境，不是Agent Probe shortcut；社区规则限制AI-generated topic/reply、推广、无关回复和link spam；
- sticky/boost/token/notification-delete等write与账号surface全部拒绝；不申请PAT、不调用legacy/v2 API。

- 官方：[V2EX API 2.0 Beta](https://www.v2ex.com/help/api)
- 官方：[API公平使用规则](https://www.v2ex.com/p/7v9TEc53)、[个人访问令牌](https://www.v2ex.com/help/personal-access-token)、[Node](https://www.v2ex.com/help/node)、[Anti Flood](https://www.v2ex.com/help/anti-flood)
- 开源候选：Apache-2.0 [tamnd/v2ex-cli](https://github.com/tamnd/v2ex-cli/tree/69822ce8803f9e6c2c317686556eb47d62e3488d)仅reference；MIT [isaced/V2exAPI](https://github.com/isaced/V2exAPI/tree/2e15716b7315a2f274fa17eedaa399095f5d0156)仅schema witness；[mcp-server-v2ex](https://github.com/funnythingfunnylove/mcp-server-v2ex/tree/e912dd572d4701a6dbe7a7458792842928b54ff0)因credential-like literal、method/schema/测试问题rejected，均未安装/执行。
- Platform Pack：[V2EX Node Discussion](platform-packs/V2EX_NODE_DISCUSSION_PLATFORM_PACK_DESIGN.md)；当前`purpose-clarification-required/no-route`，作为Public Technical Discussions Channel第四个missing成员。

### 5.3 GitHub

价值：Issues、Discussions、release 和代码 workaround 能同时证明问题、维护成本和替代方案；对开发者工具、API、AI agent、基础设施和 B2B SaaS 特别强。

- 官方：[REST Issues API](https://docs.github.com/en/rest/issues/issues)
- 官方：[Discussions GraphQL API](https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions)
- 建议：`official-api` ingress P0。Probe 只在自有 repo 或明确相关的社区讨论中进行，禁止批量推广。
- Platform Pack 设计样本：[GitHub Platform Pack](platform-packs/GITHUB_PLATFORM_PACK_DESIGN.md)，当前仅完成 evidence review，未声明 callable。

### 5.4 GitLab

价值：Issue/Work Item、Note/Discussion、resource state/label/milestone event和exact issue link能保留复现、系统历史、维护回应与移动/阻塞关系；但REST Issue、GraphQL WorkItem、system note和structured event不能扁平为同一种评论。

现行GitLab API Terms禁止通过API批量收集、抓取或重复/系统性批量导出GitLab API Data，并点名issue/MR/code。因此GitLab.com不能作为广域公开语料采集源；Self-Managed/Dedicated也必须固定实例版本、客户协议、管理员政策和组织批准，不能仅凭token推断用途获准。

- 官方：[Issues API](https://docs.gitlab.com/api/issues/)、[Notes API](https://docs.gitlab.com/api/notes/)、[Discussions API](https://docs.gitlab.com/api/discussions/)
- 条款：[GitLab API Terms](https://handbook.gitlab.com/handbook/legal/api-terms/)
- 建议：GitLab.com background collection `policy-blocked`；Self-Managed/Dedicated `authorized-only` design P0；所有平台写入拒绝。
- Platform Pack：[GitLab Software Work Items](platform-packs/GITLAB_PLATFORM_PACK_DESIGN.md)
- 组合设计：[Public Software Issues / Maintenance Friction Channel Pack](platform-packs/PUBLIC_SOFTWARE_ISSUES_CHANNEL_PACK_DESIGN.md)

### 5.5 Stack Exchange 与 Hacker News

Stack Exchange API v2.3 技术上提供question search、answer/comment、revision与部分timeline，但现行Acceptable Use Policy明确限制未经事先书面同意的自动收集用于生成式AI/LLM/ML系统的开发、测试、索引或改进；官方MCP又明确禁止长期/程序化存储、索引和缓存。内容CC BY-SA与API/用途许可必须分别判断。因此本系统的长期采集与索引为`policy-blocked`，不发布callable route。

Hacker News官方Firebase API v0提供item graph、Ask/Show/Jobs、排行snapshot和`updates`提示，但YC Terms对未经授权的商业利用、scraping/data mining/robots/data gathering有限制，本次未定位到对系统性需求挖掘/持久AI索引的明确API carve-out或第三方内容再利用许可。当前状态为`policy-blocked-until-written-clarification`；Algolia、HTML抓取、社区MCP/Skill不能作为fallback。

- 官方：[Stack Exchange API](https://api.stackexchange.com/docs)、[Acceptable Use Policy](https://stackoverflow.com/legal/acceptable-use-policy)、[MCP Terms](https://stackoverflow.com/legal/mcp-server-terms-of-use)
- 官方：[Hacker News API](https://github.com/HackerNews/API)、[HN Guidelines](https://news.ycombinator.com/newsguidelines.html)、[YC Terms](https://www.ycombinator.com/legal/)
- Platform Packs：[Stack Exchange Public Q&A](platform-packs/STACK_EXCHANGE_PUBLIC_QA_PLATFORM_PACK_DESIGN.md)、[Hacker News Public Discussion](platform-packs/HACKER_NEWS_PUBLIC_DISCUSSION_PLATFORM_PACK_DESIGN.md)、[知乎开放搜索](platform-packs/ZHIHU_OPEN_SEARCH_PLATFORM_PACK_DESIGN.md)、[V2EX Node Discussion](platform-packs/V2EX_NODE_DISCUSSION_PLATFORM_PACK_DESIGN.md)
- 组合设计：[Public Technical Discussions / Problem Solving Channel Pack](platform-packs/PUBLIC_TECHNICAL_DISCUSSION_CHANNEL_PACK_DESIGN.md)

### 5.6 Reddit 与 Product Hunt

Reddit 的 subreddit、post、comment/thread 对需求语言、失败尝试和替代方案很有价值，但现行 Responsible Builder Policy 要求在访问任何 Reddit 数据前获得明确批准；商业使用还需书面批准，研究访问必须走 Reddit for Researchers。Data API Terms 又要求用途受限、保留最小化和删除传播，不能以公开 `.json`、RSS、HTML、社区 MCP 或 SDK 作为未批准 fallback。当前只发布 `PublicDiscussion*` 知识契约，不发布 callable route，也不采集用户历史、私信或可识别画像。

Product Hunt API v2 是 GraphQL，默认 public scope 只读，但文档明确默认不得商业使用，写权限也按 use case 单独沟通。当前 Product Page 已聚合多次 launch、review、team 和 award，而公开 GraphQL `Post` 参考未证明能精确表达 Product Page 到多次 launch 的关系；因此产品身份不能按名称、域名或 URL 模糊合并。当前只发布独立 `ProductLaunch*` 来源抽象，API route 为 `commercial-partner-only`，并要求在批准后先取得当前 schema artifact 和 fixture conformance。网页抓取、Algolia/cookie endpoint 和第三方 CLI 都不是 fallback。

Product Hunt 的主动 Probe 只保留未来 `manual-package` 设计：必须是可用、真实、自有且可履约的产品，由真实个人账号人工核验发布；系统不得生成或代发评论、索取或操纵投票、批量私信。Reddit 当前拒绝全部平台写入。两者组成的是目的层的异构 Channel：Reddit 使用 `PublicDiscussion*`，Product Hunt 使用 `ProductLaunch*`，不创造虚假的共同 source object。

- 官方：[Reddit Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy)、[Data API Terms](https://redditinc.com/policies/data-api-terms)、[Developer Terms](https://redditinc.com/policies/developer-terms)、[API reference](https://www.reddit.com/dev/api/)
- 官方：[Product Hunt API v2](https://api.producthunt.com/v2/docs)、[Product Pages](https://help.producthunt.com/en/articles/6255061-what-are-product-pages)、[Community Guidelines](https://help.producthunt.com/en/articles/3615694-community-guidelines)、[Commenting Guidelines](https://help.producthunt.com/en/articles/10030102-commenting-guidelines)、[Terms](https://www.producthunt.com/legal)
- Platform Packs：[Reddit Public Discussion](platform-packs/REDDIT_PUBLIC_DISCUSSION_PLATFORM_PACK_DESIGN.md)、[Product Hunt Product Launch](platform-packs/PRODUCT_HUNT_PRODUCT_LAUNCH_PLATFORM_PACK_DESIGN.md)
- 组合设计：[Public Early-Adopter Product Discovery Channel Pack](platform-packs/PUBLIC_EARLY_ADOPTER_DISCOVERY_CHANNEL_PACK_DESIGN.md)

## 6. 招聘与组织投入信号

### 6.1 为什么有价值

招聘信息不能直接证明某个软件会被购买，但能证明组织愿意为一组工作投入人力预算。应提取：

- 要完成的工作和业务结果；
- 重复职责、人工协调和工具链；
- 技能/系统组合及其变化；
- 薪资、地区、职级和招聘持续时间；
- “自建团队”这一替代方案的成本。

禁止采集候选人资料、自动打招呼或把个人履历纳入需求数仓。

### 6.2 BOSS 直聘

BOSS 对中国岗位需求有很高研究价值，但当前不是自动化 ingress。2026-08-26 核验的 current [BOSS直聘用户协议](https://about.zhipin.com/agreement?id=registerprotocol_33)（`20260617v2`）、[隐私政策](https://about.zhipin.com/agreement?id=personalinfopro_89)（`20260511v1`）和[招聘行为管理规范](https://about.zhipin.com/agreement?id=postrules_11)（`20240828v1`）共同要求真实招聘与持续有效的单位授权，并限制未经许可的第三方工具/ATS/插件、自动登录、职位浏览/发布、简历收发、候选人信息收集和非正常方式读取/转存数据。

- 当前未发现面向本用途的官方 developer API、职位/企业 export、ATS connector contract 或 sandbox；公开网页和招聘者产品能力不能写成机器 API。
- 唯一保留的输入候选是用户主动提供的 `manual-evidence-package`：它是本地 intake，不访问 BOSS、不接收 Cookie，只保留最小职位事实与 `selected-only` coverage；当前仍未成为 callable Connector。
- BOSS HI 是官方关联产品，不是已发布的开放接口；平台可把职位分发到合作平台，也不等于第三方拥有 inbound API。
- Probe：虚假/测试职位明确禁止；真实招聘发布是有主体、职位、授权和持续责任的业务操作，不属于通用需求测试。
- 稳定概念已抽象为 `JobPosting*` 和高风险的 `RecruitingEngagement*`，明确 posting/opening/headcount、聊天/申请、邀约/面试、offer/hire 均不等价。

开源快照只作风险或 schema 证据：

- [zhengziha/boss-zhipin](https://github.com/zhengziha/boss-zhipin/tree/c2818328cb53773fbf2e5a2e7004123380a01a7d) `c2818328…`：Playwright/wapi/Cookie，未见 LICENSE；`risk-reference`。
- [mucsbr/mcp-bosszp](https://github.com/mucsbr/mcp-bosszp/tree/df9ba573829ded5cdd05abcfe5f055fb89e0befa) `df9ba573…`：MIT，但使用二维码登录、Cookie/private请求并可搜索/打招呼；`rejected-route-reference`。
- [Snseam/boss-zhipin-mcp](https://github.com/Snseam/boss-zhipin-mcp/tree/06a1a7d804aa80131a066bddc1879ac4bc72f841) `06a1a7d8…`：未见 LICENSE，扩张到招聘者端候选人搜索、简历 OCR/数据库和消息发送；`rejected-sensitive-automation`。
- [longsizhuo/BossZhiPin_Job_Search](https://github.com/longsizhuo/BossZhiPin_Job_Search/tree/d797cdeede941cae502c09555206fa051c17fbbe) `d797cdee…`：MIT，README 本身提示浏览器自动化可能违反条款；`risk-reference`。
- [speedyapply/JobSpy](https://github.com/speedyapply/JobSpy/tree/fda080a373e8226f3fd60635323f5da9af9892b1) `fda080a3…`：MIT；只作跨招聘站 schema/限流/封锁失败模式参考，不是官方授权依据。

完整概念、能力、Skills、验证和可观测性见 [BOSS 直聘招聘需求 Platform Pack](platform-packs/BOSS_ZHIPIN_RECRUITING_PLATFORM_PACK_DESIGN.md)；发现过程见 [BOSS 直聘与闲鱼候选分流](platform-packs/BOSS_XIANYU_TRIAGE_2026-08-26.md)。当前状态为 `researched/manual-only`、`callable routes = 0`。

### 6.3 猎聘官方 Agent 表面

猎聘是本轮优先研究的中国招聘平台，因为它已经公开了真实的用户 Agent access surface。[猎聘 MCP 授权配置页](https://www.liepin.com/mcp/server)直接链接 [liepin-tech-2026/liepin-cil](https://github.com/liepin-tech-2026/liepin-cil)，说明登录用户可生成90天Token，并列出本人职位搜索/查看、简历查询/更新和投递能力，以及共享的60 calls/min限制。该页面同时说明 HR 回复仍通过 App/短信承接，Agent查询进度是后续计划。

这不意味着猎聘已成为公共招聘数据 Connector：

- [猎聘智慧招聘系统](https://ir.liepin.com/system/)对 CIL、MCP、职位动态同步和外部 AI 的描述是官方产品能力证据，但未公开 exact endpoint、schema、scope、tenant、sandbox、数据使用、保留/删除或第三方开发者合同；
- 用户 Agent Token 只证明某候选人可授权其本人工作流，不证明公共市场枚举、持续监控、长期职位全文数仓、向量索引或招聘者侧自动化权利；
- 当前[用户服务协议](https://wow.liepin.com/t1008237/index.html?agreementType=A0001)限制程序/非正常浏览、spider/crawler、模拟用户、规避技术措施、抓取、复制、转移或存储平台数据，并要求按产品声明目的/方法使用；
- 当前[个人信息保护政策](https://wow.liepin.com/t1008237/index.html?agreementType=A0002)把游客有限浏览、候选人简历/手机号和扩展同意分开；简历、申请、聊天和候选人数据不进入需求数仓；
- 求职投递创建真实候选记录并影响真人，不是需求 Probe；招聘职位发布也必须有真实岗位、主体、授权和履约责任。

稳定抽象增加 headhunter/headhunter-enterprise actor、candidate recommendation、interview/placement service、hire guarantee 和独立 engagement state，防止“推荐接受/服务完成/offer”被推断为 hire。当前状态为 `researched/official-agent-surface/deferred`、`callable routes = 0`；猎聘不进入 Public ATS Channel。

固定 artifact 中，官方页面直接链接的 [liepin-tech-2026/liepin-cil](https://github.com/liepin-tech-2026/liepin-cil/tree/858a62bd839d490e8745b7503961e4676a54b9d7) `858a62bd…` 在 common paths 未见 LICENSE，因此仍不能安装、vendoring或执行；community registry wrapper、浏览器自动化和批量投递项目只作manifest/风险证据。完整设计见 [猎聘 Agent 招聘 Platform Pack](platform-packs/LIEPIN_AGENT_RECRUITING_PLATFORM_PACK_DESIGN.md)；选择过程见 [中国招聘平台 Agent 接入候选分流](platform-packs/CHINA_RECRUITING_AGENT_SURFACES_TRIAGE_2026-08-26.md)。

### 6.4 公开 ATS 是更安全的招聘入口

Greenhouse Job Board API 的公开 GET 无需认证，可按一个 board 返回企业 published job posts；Lever Postings API v0 也按一个 region/site 列出企业 published postings，并明确不支持全文职位搜索。它们适合从有证据的目标公司 roster 观察需求，不是“全网招聘搜索 API”。

- 官方：[Greenhouse Job Board API](https://developer.greenhouse.io/job-board.html)
- 官方/官方仓库：[Lever Postings API](https://github.com/lever/postings-api)
- 官方文档源：[grnhse/greenhouse-api-docs](https://github.com/grnhse/greenhouse-api-docs) `bce460167e939315b10a8f0b3f65b2eb34aa9a99`，Apache-2.0；只作官方 contract/source drift evidence。
- Lever 官方仓库：[lever/postings-api](https://github.com/lever/postings-api) `f61aac5831a193bc66e1183c3ad102739dfd9f56`；未见 LICENSE，示例代码不作为依赖复用。
- 目录参考：[noble-ronin/ats-job-apis](https://github.com/noble-ronin/ats-job-apis) `18942b18a452e92d5ecb09e7b527c29fee8b74a3`：整理 Greenhouse、Lever、Ashby 等 endpoint，但未见许可证；只作发现目录，每个 claim 仍以供应商官方文档为准。
- 流程参考：[bonus414/job-scanner](https://github.com/bonus414/job-scanner) `292e530e843b13524c28e4ca5bdeb2d44ba58ca2`：MIT、单 commit；可研究 roster/provider mapping/first-seen/dedupe，不运行、不作为 adapter。
- 建议：`official-api`/公开供应商 API，B2B P1；只读 published jobs，不调用投递接口。

设计样本：

- [Greenhouse Job Board Platform Pack](platform-packs/GREENHOUSE_JOB_BOARD_PLATFORM_PACK_DESIGN.md)
- [Lever Postings Platform Pack](platform-packs/LEVER_POSTINGS_PLATFORM_PACK_DESIGN.md)
- [Public ATS Channel Pack](platform-packs/PUBLIC_ATS_CHANNEL_PACK_DESIGN.md)

三者当前都只是 `researched` 设计候选，没有 Connector、roster、callable route 或 live verification。

## 7. 交易市场与付费意愿

### 7.1 闲鱼

价值：商品/服务标题、描述、价格、收藏、询价、议价、订单和退款形成从注意到支付的梯度。它特别适合本地服务、低客单服务、二手/循环经济和可明确交付的轻产品。

官方能力边界：公开闲鱼开放平台主要面向小程序、服务商和交易链路；公开文档没有证明存在通用全站搜索和任意商品服务器自动发布 API，接入说明仍要求服务商在 App 内发布通用商品。

- 官方：[闲鱼开放平台](https://open.goofish.com/doc/)
- 官方：[服务端接入文档](https://open.goofish.com/doc/development/dev/server.html)
- 推荐观察：`manual-import`/可见 `browser-assisted`，P0/P1。
- 推荐 Probe：生成真实、可履约商品/服务交接包，人工确认发布；记录曝光、收藏、咨询、议价、下单和退款。
- 禁止：虚假商品、虚假库存、诱导性价格、无法履约的测试和自动私信。

GitHub 研究样本：

- [babachen/xianyu-mcp](https://github.com/babachen/xianyu-mcp) `44cbaa9630ceb03c89dc6101c7a1cbb60543abfa`：Apache-2.0，Go + 浏览器/Cookie，提供搜索和发布；属于实验性 `browser-assisted`，不是官方 API。可研究 preview、图片限制、unknown 和幂等表面，不直接作为生产依赖。
- [Tsinglung-Tseng/ali-mcp](https://github.com/Tsinglung-Tseng/ali-mcp) `29d083a80f0b13224ada6831aad125499122990a`：MIT，Go/rod 浏览器自动化；仅作 tool mapping、selector drift 和 UI 流程样本。
- [fancyboi999/goofish-cli](https://github.com/fancyboi999/goofish-cli) `771382c2ea3fd281b78c015bf2bf8ed68cc873ff`：Apache-2.0，声明使用 private mtop、Cookie、IM、MCP 与内置 Skills；可研究命令 taxonomy、限流和熔断，但 `private-api-cookie`、自动发布和消息能力默认拒绝。

完整的概念、能力、Platform Skills、adoption decision 和验证计划见 [闲鱼 Platform Pack](platform-packs/XIANYU_PLATFORM_PACK_DESIGN.md)，当前仅为 `researched` 设计候选，没有 callable route。

### 7.2 eBay

eBay 证明“官方 API 存在”仍不足以形成公共需求仓库。Browse API 支持关键词、类别、GTIN、商品和图片搜索，并返回 active item、价格与购买方式；但生产 Buy API 面向经批准伙伴，需 business model review、EPN/合同、sandbox review 和 Application Growth Check。当前 API License 又限制站点级统计、平均售价/GMV、卖家表现、转化/完成率、跨平台比较和 price modeling 等用途。因而公共 discovery 对本系统的目标用途当前是 `blocked-before-binding`，不能用 HTML、MCP、社区 SDK 或去身份化绕过。

自有卖家面是另一条授权链：Inventory API 将 inventory location、seller SKU inventory item/group、offer 和发布后的 listing 分开；Analytics 只描述自有 listing 的 provider-defined traffic aggregate；Fulfillment order line 证明 checkout，仍不自动证明付款、履约或满意。自有 seller read 可进入 `eligible-with-policy` 设计，但导入跨平台需求仓库和计算价格/转化仍需单独用途审查及必要的书面许可。所有 production app 还必须订阅 Marketplace Account Deletion 或满足官方 exemption，并把删除传播到 canonical、evidence、projection 和 index。

- 官方：[eBay Browse API](https://developer.ebay.com/api-docs/buy/api-browse.html)
- 官方：[Buy API requirements](https://developer.ebay.com/api-docs/buy/buy-requirements.html)
- 官方：[API License Agreement](https://developer.ebay.com/cms/files/api_license_2018-10-26.pdf)
- 官方：[Inventory API overview](https://developer.ebay.com/api-docs/sell/inventory/static/overview.html)
- 官方：[Marketplace Account Deletion](https://developer.ebay.com/develop/guides/sell/marketplace-user-account-deletion)
- 官方：[No item listings policy](https://www.ebay.com/help/policies/safety-security-programs/prohibited-and-restricted-items-policy?id=4242)
- 建议：P0 architecture/static/fixture；public discovery 保持 policy-blocked，自有 seller read 按 account/marketplace/field/purpose 分区。Probe 只能是合法、自有、真实可履约的 offer；publish/update/withdraw、message、marketing、feedback、refund 和 fulfillment 分别审批。

完整设计见 [eBay Marketplace Platform Pack](platform-packs/EBAY_MARKETPLACE_PLATFORM_PACK_DESIGN.md)。它与闲鱼组成 [Marketplace Offer Discovery & Truthful Probe Channel Pack](platform-packs/MARKETPLACE_OFFER_DISCOVERY_CHANNEL_PACK_DESIGN.md)，共同使用 `MarketplaceOffer*`/`MarketplaceOutcome*`，但不共享 route、credential、coverage、原生 identity 或衍生用途许可。

### 7.3 服务采购 / 自由职业市场

服务采购与招聘、seller listing都不同：稳定事实链是“client问题/交付请求 → invitation/proposal/interview → offer/contract → milestone或logged time → payment/refund/dispute/feedback”。`ServiceRequest*`只表达client-authored请求；`ServiceEngagement*`表达服务方响应、协议、履约和经济结果。advertised budget、proposal rate、offer/contract amount、milestone funded/released和payment不可互换；proposal数量也不是独立buyer demand。

当前首个成员选择Upwork。官方hosted MCP和API证明其Agent能力完整，但API & MCP Terms v2.3把访问限制为具体、已记录、用户指向的即时任务，并禁止bulk/systematic enumeration、持续监控、aggregation/derivative dataset、embedding/vector index以及未经单独许可的RAG/training/evaluation。故官方MCP/API只保留`ephemeral-user-directed`候选；长期Observation、数仓、索引和Opportunity Miner在精确书面许可前必须于credential/network/binding前阻断。官方MCP当前还是完整scope授权，不能冒充最小权限research route。

Freelancer.com有官方REST API 0.1、OAuth2、Python/Android SDK与sandbox，但其User Agreement要求任何API自动访问具有明确书面许可，API Terms只允许性能缓存且原则上禁止保存Data及其hash/transform表达。独立Pack因此发布为`researched/no-route`：sandbox是未来协议conformance候选，不会提升production、coverage或durable rights。Fiverr没有找到适合本用途的公开developer API/SDK/MCP证据，且当前条款禁止bot、crawler、scraping及系统性建立collection/database/directory，保持`Reject-auto`。

猪八戒从本地服务候选批次转入本Channel：它的稳定对象是数字服务需求、比稿/计件/招标/众包、稿件/投标、Agreement、托管、验收、支付、退款和评价，而不是location-first home service。官方需求API只有known taskId read；可分页的是OAuth openid服务商已参与交易。开放协议的逐应用最小必要、用途隔离和退订/停用立即删除使durable research保持blocked。

Probe只能是真实、合法、定制、具备预算且确实准备hire/pay的服务请求。ghost job、free work、spam/duplicate、虚假身份、自动proposal/message、Agent自主候选评分、binding agreement和资金动作全部拒绝；publish、invite、proposal、message、offer、contract、milestone、payment分别审批和对账。

- 候选分流：[服务采购 / 自由职业市场候选分流](platform-packs/SERVICE_WORK_MARKETPLACE_TRIAGE_2026-08-26.md)
- 首个样本：[Upwork Service Work Platform Pack](platform-packs/UPWORK_SERVICE_WORK_PLATFORM_PACK_DESIGN.md)
- 第二成员：[Freelancer.com Service Work Platform Pack](platform-packs/FREELANCER_COM_SERVICE_WORK_PLATFORM_PACK_DESIGN.md)
- 第三成员：[猪八戒开放平台服务交易 Platform Pack](platform-packs/ZBJ_OPEN_PLATFORM_SERVICE_WORK_PACK_DESIGN.md)
- 组合设计：[Service Work Demand & Truthful Procurement Probe Channel Pack](platform-packs/SERVICE_WORK_DEMAND_CHANNEL_PACK_DESIGN.md)。当前三个成员durable route均blocked，Channel明确发布`callable members = 0`和missing-member report，而不是伪装可采集。

### 7.4 本地服务 / 反向需求市场

本地服务复用 `ServiceRequest*` / `ServiceEngagement*`，但必须新增 `matched-lead` 与 `partner-booking` format，以及 estimate、availability、quote、booking、appointment、reschedule、completion、cancellation 和 lead access 等阶段。它们不是一条必然发生的漏斗：Taskrabbit Partner API 从合作方已有 checkout 生成服务预约；Thumbtack Marketplace先形成短期Search Context与Business供给匹配，只有真实Request才产生client demand及一个或多个Business-scoped Negotiation；Pro API再暴露获权Business自己的Lead/Message/status，历史完整性仍未知；猪八戒需求API只能按已知taskId读取详情，可分页的seller/计件/众包列表只覆盖openid服务商已参与人口；Bark 在服务商购买 Lead 后才揭示联系人；58开放平台目前也只证明合作方或自有运营能力，未证明全市场需求读取。

Taskrabbit 首个 Pack 固定 official OpenAPI `2025-12` 的 estimate → availability → bid/quote → book → appointment → outcome 链，同时发布 `public market coverage = not-applicable`。官方 `llms.txt` 方便 Agent 阅读开发文档，不改变 AUP 对平台 mining/indexing 和提交平台信息到 AI 的限制；合作协议没有明确覆盖数据对象、AI、保存、派生、索引、保留和删除前，durable research 仍为 `policy-blocked`。Bid 会锁价并暂时保留时段，Book 会创建 live Project、确认付款/政策同意并通知真人，因此均不是普通 read。

- 候选分流：[本地服务 / 反向需求市场候选分流](platform-packs/LOCAL_SERVICE_REVERSE_MARKETPLACE_TRIAGE_2026-08-26.md)
- 首个样本：[Taskrabbit Partner Home Services Platform Pack](platform-packs/TASKRABBIT_PARTNER_HOME_SERVICES_PLATFORM_PACK_DESIGN.md)
- 第二成员：[Thumbtack Partner Platform Pack](platform-packs/THUMBTACK_PARTNER_PLATFORM_PACK_DESIGN.md)，按Marketplace/Pro双表面拆分；两成员组成[Local Service Intent & Truthful Fulfillment Probe Channel Pack](platform-packs/LOCAL_SERVICE_INTENT_FULFILLMENT_CHANNEL_PACK_DESIGN.md)，当前`callable/durable/probe members = 0`。猪八戒因稳定概念属于数字服务采购而转入Service Work Channel；Bark与58等待官方developer/partner/export与精确用途证据。

## 8. 采购、招标与 RFP

采购信息通常包含采购主体、范围、预算/金额、截止期、验收和现有系统，是高价值但低频的 B2B 需求证据。它适合机会发现，不适合作为轻量内容 Probe。

### 8.1 中国采购门户

- [中国政府采购网](https://www.ccgp.gov.cn/) 中央主网自 2024 年 4 月承接地方分网全部项目公告并提供一站式查询；公开的“数据接口规范”面向地方分网申请、签名和推送，不是公众查询 API。
- 在找到公开、稳定并允许目标用途的机器接口前，只采用用户选择公告的 `manual-import/manual-package`；不把页面搜索、内部 endpoint 或社区 crawler 包装成官方 API。
- Platform Pack：[CCGP 公共公告 Platform Pack](platform-packs/CCGP_PUBLIC_PROCUREMENT_PLATFORM_PACK_DESIGN.md)，当前为 `researched/manual-first`。
- 企业招标、RFP 邮箱和用户自有采购订阅可通过 `authorized-export` 接入。

### 8.2 SAM.gov

SAM.gov Get Opportunities Public API 提供已发布机会详情，要求 public API key、分页和最长一年日期窗；公开 API 只暴露最新版本，完整历史属于 Data Services。SAM Terms 明确禁止网页抓取，因此 API 失败不能切换成 crawler。

- 官方：[Get Opportunities Public API](https://open.gsa.gov/api/get-opportunities-public-api/)
- 官方：[SAM.gov Terms of Use](https://sam.gov/about/terms-of-use)
- 官方 GitHub 文档源：[GSA/open-gsa-redesign](https://github.com/GSA/open-gsa-redesign/blob/master/_apidocs/get-opportunities-public-api.md)
- 设计样本：[SAM.gov Opportunities Platform Pack](platform-packs/SAM_GOV_OPPORTUNITIES_PLATFORM_PACK_DESIGN.md)
- 建议：`official-api`，B2B/出海 P1；只读机会公告，明确拒绝 Opportunity Management 写入和投标。

### 8.3 EU TED

TED Search API v3 允许匿名检索已发布采购公告，并提供 page/iteration 与 XML/HTML/PDF 链接，明确面向复用和分析。notice、editorial version、procedure、lot 和 change notice 是不同原生概念；不能压成单一 RFP。

- 官方：[TED Search API](https://docs.ted.europa.eu/api/latest/search.html)
- 官方 GitHub：[OP-TED/eForms-SDK](https://github.com/OP-TED/eForms-SDK)
- 设计样本：[EU TED Published Notices Platform Pack](platform-packs/EU_TED_PLATFORM_PACK_DESIGN.md)
- 建议：`official-api`，B2B/欧洲 P1；Publication API 与投标能力明确排除。

初始两成员组合见 [Public Procurement Channel Pack v0](platform-packs/PUBLIC_PROCUREMENT_CHANNEL_PACK_DESIGN.md)，已由下方 v0.2 取代；它保留为 query portfolio、stage、native/observed history 和文档治理的历史设计证据。

### 8.4 UK Find a Tender

Find a Tender Service 提供公开 OCDS release/record package API，数据映射到 OCDS 1.1.5 + extensions，并按 Open Government Licence v3 复用。它同时存在需要 CDP API key 的 eSender submission API；两者必须隔离。

- 官方：[FTS Data and API documentation](https://www.find-tender.service.gov.uk/Developer/Documentation)
- 官方：[OCDS release package API](https://www.find-tender.service.gov.uk/apidocumentation/1.0/GET-ocdsReleasePackages)
- Platform Pack：[UK Find a Tender Platform Pack](platform-packs/UK_FIND_A_TENDER_PLATFORM_PACK_DESIGN.md)
- 建议：`official-api`，B2B/英国 P1；只读 published notice data，不调用 submission/internal search/投标面。

四成员组合 revision 见 [Public Procurement Channel Pack v0.2](platform-packs/PUBLIC_PROCUREMENT_CHANNEL_PACK_V0_2_DESIGN.md)。它首次将 official API、official provider projection 与 manual-only source 放在同一 ChannelScope 中，但分别计算成熟度和 coverage。

### 8.5 USAspending.gov

[USAspending API](https://api.usaspending.gov/docs/endpoints)公开prime award、transaction、subaward、agency/recipient/reference和download endpoints。award summary、transaction与subaward是不同population；obligation/deobligation/outlay/current/potential amount不能压成一个“已花费”，也不能由outlay推断supplier receipt或delivery。

- Platform Pack：[USAspending Award & Transaction](platform-packs/USASPENDING_AWARD_TRANSACTION_PLATFORM_PACK_DESIGN.md)
- official source固定`fedspendingtransparency/usaspending-api@ee4a5bd`，CC0-1.0；只作静态schema/ETL drift evidence，未运行。
- 当前：concept+route fixture；API POST search仍是read network effect，bulk/download job另审；无callable binding。

### 8.6 Canada Proactive Publication – Contracts

[official dataset](https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b)按quarterly汇总federal entities报告的contracts，并明确数据未经审计；[official schema](https://open.canada.ca/data/recombinant-published-schema/contracts.json)区分contracts/amendments over $10K、$10K-and-under aggregate与nil report。original/current/amendment value、report quarter和contract date分开，late/correction可回填历史。

- Platform Pack：[Canada Proactive Contracts](platform-packs/CANADA_PROACTIVE_CONTRACTS_PLATFORM_PACK_DESIGN.md)
- 当前：concept+official schema/CSV route fixture；未下载CSV；buyer name、postal/contact和natural-person vendor默认drop。

### 8.7 Prozorro / OpenProcurement

[official API docs](https://prozorro-api-docs.readthedocs.io/en/latest/)公开plan/tender/award/contract/agreement/framework及change/implementation模型；feed按`public_modified`和opaque offset同步。docs当前标API 2.5，而固定official source`ProzorroUKR/openprocurement.api@cdfdff5`标package 2.7.40，因此先经过version drift gate。

- Platform Pack：[Prozorro/OpenProcurement](platform-packs/PROZORRO_OPENPROCUREMENT_PLATFORM_PACK_DESIGN.md)
- 当前：concept+route fixture；未调用sandbox/production；API key/owner-token writes、bid/complaint/violation和documents均拒绝。

扩展分诊见 [v0.3 Expansion Triage](platform-packs/PUBLIC_PROCUREMENT_V0_3_EXPANSION_TRIAGE_2026-08-26.md)，七成员组合见 [Public Procurement Demand & Contract Execution Channel Pack v0.3](platform-packs/PUBLIC_PROCUREMENT_CHANNEL_PACK_V0_3_DESIGN.md)。当前requested=7、concept-fixture=7、route-fixture=6、manual-only=1、callable=0、durable=0；AusTender官方help本轮返回403、Brazil PNCP integration manual返回401，均保留为缺口而未使用fallback。

### 8.8 公共资助优先级与已资助研发

公共资助与采购必须分开：opportunity/call/topic表达资助方公开的计划和优先方向，award/project/support year表达来源报告的资源配置活动；它们都不能直接证明采购意图、付款、科研成功、产品采用、用户痛点或市场规模。

- Grants.gov：legacy `search2`/`fetchOpportunity`提供无需认证的机会读取，Simpler.Grants.gov提供API-key只读catalog；应用、提交、创建project不在该API范围。Terms要求归因且不得暗示政府背书。[官方API](https://www.grants.gov/api)；[Simpler developer guide](https://simpler.grants.gov/developers)；[Terms](https://www.grants.gov/api/terms-conditions)。
- NIH RePORTER：Project/Publication API与ExPORTER bulk提供award/project、年度support、组织、分类及provider-linked publication；PI/PO身份默认drop/restrict，sample preview与full extraction分开。[官方API v2](https://api.reporter.nih.gov/?urls.primaryName=V2.0)。
- EU Funding & Tenders/CORDIS：portal同时含grant和tender，必须按record kind分流；CORDIS提供search export、bulk、SPARQL/EURIO与注册DET extraction，live与dataset可能不一致，beneficiary material另行判断权利。[F&T APIs](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/support/apis)；[CORDIS services](https://cordis.europa.eu/about/services)；[legal notice](https://cordis.europa.eu/about/legal)。
- SBIR/STTR：官方数据资源把Solicitations & Topics、Awards和Companies分开，并提供download；当前solicitation API标注维护中，因此只进入fixture，不能以HTML或社区实现回退。[Data Resources](https://www.sbir.gov/data-resources)；[Solicitation API](https://www.sbir.gov/api/solicitation)。

候选分流见 [Public Funding Priorities Triage](platform-packs/PUBLIC_FUNDING_PRIORITIES_TRIAGE_2026-08-26.md)，成员设计见 [Grants.gov](platform-packs/GRANTS_GOV_PUBLIC_FUNDING_PLATFORM_PACK_DESIGN.md)、[NIH RePORTER](platform-packs/NIH_REPORTER_FUNDED_RESEARCH_PLATFORM_PACK_DESIGN.md)、[EU Funding & CORDIS](platform-packs/EU_FUNDING_CORDIS_PLATFORM_PACK_DESIGN.md)、[SBIR/STTR](platform-packs/SBIR_STTR_PUBLIC_FUNDING_PLATFORM_PACK_DESIGN.md)，组合见 [Public Funding Priorities & Funded R&D Channel Pack](platform-packs/PUBLIC_FUNDING_PRIORITIES_CHANNEL_PACK_DESIGN.md)。当前requested=4、fixture-eligible=4、callable=0、durable=0；未连接API/MCP、未执行开源项目、未产生申请或其他平台效果。

### 8.9 公开规则制定与政策咨询

该场域补足的是“规则可能怎样改变、谁正式提出了什么负担或替代方案”，不是法律检索或民意测量。proposal/draft/consultation只表示潜在变化；stakeholder submission只表示正式提交过的主张，不能升级为事实、独立意见、代表性支持或主管机关采纳。评论数还可能包含重复提交、组织动员和发布遗漏，因此必须携带population、coverage、dedup/mass-campaign状态与口径。

- Regulations.gov：官方v4 API提供docket、document、comment和attachment读取，需要`api.data.gov` key，并有查询分页与限流约束；同一API还暴露comment submission面，但本Channel明确拒绝全部POST、文件上传和提交能力。[官方API](https://open.gsa.gov/api/regulationsgov/)；官方只读MCP样本固定用于静态审计，不安装、不运行。
- Federal Register：官方API提供公开文档检索与详情；FederalRegister.gov的HTML/XML是信息性呈现，具有法律效力的官方版本必须追溯至GovInfo PDF，不能由网页rendition推断正式法律状态。[官方API](https://www.federalregister.gov/developers/documentation/api/v1)。
- EU Have Your Say：Better Regulation流程公开call for evidence、public consultation、feedback/position paper与后续synopsis/outcome；机器翻译是非正式文本，公开respondent字段和自由文本/附件还需要单独的隐私处理。本轮未找到官方版本化API、bulk或领域MCP，因此只进入concept fixture。[Better Regulation](https://commission.europa.eu/law/law-making-process/better-regulation_en)；[privacy statement](https://ec.europa.eu/info/law/better-regulation/specific-privacy-statement_en)。
- GOV.UK Consultations：Content API允许按已知content path读取公开JSON，无需认证，但它是beta、不是动态搜索API，且附件字节与迁移占位符需要独立处理；同一咨询页可经历open、closed、outcome等阶段。[Content API](https://content-api.publishing.service.gov.uk/)；[reuse terms](https://www.gov.uk/help/reuse-govuk-content)。
- 中国司法部立法意见征集：官方列表提供征集公告、草案、截止期和提交方式，但本轮未发现稳定公开API/schema/export/RSS，且个人公开意见与结果反馈并非统一可得；因此只保留用户选择材料的manual/concept fixture，不抓取网页或内部endpoint。[官方征集列表](https://www.moj.gov.cn/pub/sfbgwapp/lfyjzjapp/)。

候选分流见 [Public Rulemaking & Consultation Triage](platform-packs/PUBLIC_RULEMAKING_CONSULTATION_TRIAGE_2026-08-26.md)，成员设计见 [Regulations.gov](platform-packs/REGULATIONS_GOV_PUBLIC_RULEMAKING_PLATFORM_PACK_DESIGN.md)、[Federal Register](platform-packs/FEDERAL_REGISTER_RULEMAKING_PUBLICATION_PLATFORM_PACK_DESIGN.md)、[EU Have Your Say](platform-packs/EU_HAVE_YOUR_SAY_CONSULTATION_PLATFORM_PACK_DESIGN.md)、[GOV.UK Consultations](platform-packs/GOV_UK_CONSULTATIONS_PLATFORM_PACK_DESIGN.md)、[中国司法部立法意见征集](platform-packs/CHINA_MOJ_LEGISLATIVE_CONSULTATION_PLATFORM_PACK_DESIGN.md)，组合见 [Public Rulemaking & Consultation Pressure Channel Pack](platform-packs/PUBLIC_RULEMAKING_CONSULTATION_CHANNEL_PACK_DESIGN.md)。当前requested=5、concept-fixture-eligible=5、route-fixture-eligible=3、callable=0、durable=0；未连接API/MCP、未执行开源项目、未提交评论、反馈或立法意见。

### 8.10 公开公司披露与投资优先级

该场域补足的是“企业管理层正式披露了什么战略、风险、依赖、资本投入和转型方向”，不是证券分析或自动lead评分。法定披露、监管接收、审计意见、结构化XBRL标签和内容真值是不同事实；issuer plan不等于批准预算或采购，risk factor不等于事件发生，reported accounting amount不等于现金支付，跨上市地或provider副本也不增加独立证据。

- SEC EDGAR：`data.sec.gov`提供无需key的Submissions与XBRL JSON，官方archive/index/RSS提供filing documents和增量入口；bulk夜间更新，Fair Access当前要求总计不超过10 requests/second并识别自动客户端。[官方API](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)；[Developer Resources](https://www.sec.gov/about/developer-resources)。
- UK Companies House：Public Data API以API key读取company/filing history，Document API提供document metadata和多MIME content，Streaming API提供filing timepoint；public read与OAuth Filing write是不同产品，officer/PSC/person graph不进入本Channel。[API suite](https://developer-specs.company-information.service.gov.uk/)；[API testing](https://developer.company-information.service.gov.uk/api-testing)。
- EU ESEF/ESAP：ESEF report package才可能是OAM中的official AFR，PDF/issuer copy可能是非官方representation；ESAP已于2026-07开始collection，但公众统一入口预计2027-07，因此当前只有concept/format fixture，没有public route。[ESEF Reporting Manual](https://www.esma.europa.eu/sites/default/files/library/esma32-60-254_esef_reporting_manual.pdf)；[ESAP timeline](https://www.esma.europa.eu/mt/node/223341)。
- HKEX：IIS提供正式licensed issuer-news feed和v4.7 transmission spec；HKEXnews网站Terms在无书面许可时明确禁止programmatic access、systematic retrieval、text/data mining和AI用途，所以community crawler/MCP不能作为fallback。[IIS](https://www.hkex.com.hk/Services/Market-Data-Services/Infrastructure/Issuer-Information-feed-Service-(IIS)?sc_lang=en)；[Terms](https://www2.hkexnews.hk/Global/Exchange/Terms-of-Use?sc_lang=en)。
- 巨潮资讯：官方网页确认其为法定信息披露平台，并说明部分文档由软件转换；本轮未发现公开版本化developer API/schema，Data Service、网页内部endpoint与PDF路径不得混同，只保留concept/manual-or-contract候选。[公告查询](https://www.cninfo.com.cn/new/commonUrl/pageOfSearch?checkedCategory=category_zj_szsh&url=disclosure%2Flist%2Fsearch)。

候选分流见 [Public Corporate Disclosures Triage](platform-packs/PUBLIC_CORPORATE_DISCLOSURES_TRIAGE_2026-08-26.md)，成员设计见 [SEC EDGAR](platform-packs/SEC_EDGAR_CORPORATE_DISCLOSURE_PLATFORM_PACK_DESIGN.md)、[UK Companies House](platform-packs/UK_COMPANIES_HOUSE_CORPORATE_FILING_PLATFORM_PACK_DESIGN.md)、[EU ESEF/ESAP](platform-packs/EU_ESEF_ESAP_CORPORATE_DISCLOSURE_PLATFORM_PACK_DESIGN.md)、[HKEX](platform-packs/HKEX_ISSUER_DISCLOSURE_PLATFORM_PACK_DESIGN.md)、[CNINFO](platform-packs/CNINFO_CORPORATE_DISCLOSURE_PLATFORM_PACK_DESIGN.md)，组合见 [Public Corporate Disclosures & Investment Priorities Channel Pack](platform-packs/PUBLIC_CORPORATE_DISCLOSURES_CHANNEL_PACK_DESIGN.md)。当前requested=5、concept-fixture-eligible=5、route-fixture-eligible=3、callable=0、durable=0；未连接API/MCP、未执行开源项目、未下载披露文件、未产生申报、交易或联系效果。

### 8.11 公开技术标准与兼容变化

该场域补足“生态未来必须兼容什么、委员会正在选择什么、哪些行为准备弃用/移除、实现者在哪些约束上遇到正式阻力”。它不是普通GitHub issue、软件包release或法规：draft/proposal不等于批准，published/integrated不等于全生态部署，规范要求也不自动成为法律义务、客户需求或市场规模。

- IETF：Datatracker公开JSON/XML document/group/state metadata，RFC Editor另提供published RFC feed/bulk；availability、WG、IESG与RFC Editor state正交，RFC也不必是Standards Track。[Datatracker API](https://datatracker.ietf.org/api/)；[RFC downloads](https://www.rfc-editor.org/series/rfc-download/)；[BCP 9](https://www.rfc-editor.org/info/rfc2026/)。
- W3C：公开JSON API覆盖specification、version、group与supersession；2025 Process已移除Proposed Recommendation，Working Draft和Editor's Draft又具有不同standing，process revision必须进入知识快照。[W3C API](https://www.w3.org/api/)；[2025 Process](https://www.w3.org/policies/process/)；[TR catalog](https://www.w3.org/TR/)。
- WHATWG：Living Standard持续变化，Review Draft主要用于patent review；feature、issue与implementer interest按workstream/working mode治理，必须固定official repository commit且区分editor、implementer与commenter authority。[Workstream Policy](https://whatwg.org/workstream-policy)；[Working Mode](https://whatwg.org/working-mode)；[Stages](https://whatwg.org/stages)。
- TC39：当前proposal流程包含Stage 0/1/2/2.7/3/4、regression/withdrawal、Test262和spec integration；Stage 3仍可能因web compatibility或production implementation feedback改变，Stage 4也不证明所有runtime已shipping。[TC39 Process](https://tc39.es/process-document/)；[Proposals](https://github.com/tc39/proposals)；[ECMAScript draft](https://tc39.es/ecma262/)。
- OpenJDK JEP：JEP是JDK enhancement/roadmap process，不是Java SE标准；index公开Draft/Submitted/Candidate/Targeted/Integrated/Delivered/Withdrawn等状态，但本轮未发现版本化public API/feed，保持concept fixture。[JEP 1](https://openjdk.org/jeps/1)；[JEP Index](https://openjdk.org/jeps/0)。

候选分流见 [Public Technical Standards Triage](platform-packs/PUBLIC_TECHNICAL_STANDARDS_TRIAGE_2026-08-26.md)，成员设计见 [IETF](platform-packs/IETF_DATATRACKER_RFC_PLATFORM_PACK_DESIGN.md)、[W3C](platform-packs/W3C_TECHNICAL_REPORTS_PLATFORM_PACK_DESIGN.md)、[WHATWG](platform-packs/WHATWG_LIVING_STANDARDS_PLATFORM_PACK_DESIGN.md)、[TC39](platform-packs/TC39_PROPOSALS_PLATFORM_PACK_DESIGN.md)、[OpenJDK JEP](platform-packs/OPENJDK_JEP_PLATFORM_PACK_DESIGN.md)，组合见 [Public Technical Standards & Compatibility Change Channel Pack](platform-packs/PUBLIC_TECHNICAL_STANDARDS_CHANNEL_PACK_DESIGN.md)。当前requested=5、concept-fixture-eligible=5、route-fixture-eligible=4、callable=0、durable=0；未调用API/GitHub、未安装/执行Skill/MCP/开源项目、未读取规范语料，也未提交任何流程动作。

### 8.12 公开产品召回与纠正行动

该场域补足“主管机构或责任主体已经要求、宣布或实施了什么纠正，哪些产品、型号、lot/batch/serial range受影响，hazard与remedy范围是什么”。它不同于监管投诉：complaint是claim输入，recall/campaign/alert是authority/operator纠正过程中的正式记录；两者即使共用产品和事故字段，也不能互相继承authority或真值。

- FDA openFDA：Enforcement Reports来自Recall Enterprise System，公开记录自2004年起、每周更新；openFDA会转换/重命名字段，且官方明确警告此数据不适合公共alert或完整lifecycle tracking。[food enforcement](https://open.fda.gov/apis/food/enforcement/)；[API](https://open.fda.gov/apis/)。
- NHTSA：Recalls覆盖vehicle、tire、child safety seat和equipment，提供make/model/year、campaign查询API和bulk/data dictionary；campaign/product row与Complaints分开。[official datasets/APIs](https://www.nhtsa.gov/nhtsa-datasets-and-apis)。
- CPSC：公开Recall REST返回JSON/XML recall、products、hazards和remedies；它不是SaferProducts incident OData或report write入口。[API page](https://www.cpsc.gov/Recalls/CPSC-Recalls-Application-Program-Interface-API-Information)；[guide](https://www.cpsc.gov/s3fs-public/RecallRetrievalWebServicesProgrammersGuide20180917.pdf)。
- EU Safety Gate：非食品危险产品alert含risk、operator voluntary measure、authority compulsory measure与跨国follow-up；本轮未发现版本化public API contract，只保留concept/manual-export fixture。[official portal](https://ec.europa.eu/safety-gate/)。
- Canada：official JSON/CSV英法open data跨food、consumer/health products、device、cannabis和vehicle；recall、safety alert、active/archive与alternate language分别保存。[open dataset](https://open.canada.ca/data/dataset/d38de914-c94c-429b-8ab1-8776c31643e3)。

候选分流见 [Public Product Recalls Triage](platform-packs/PUBLIC_PRODUCT_RECALLS_TRIAGE_2026-08-26.md)，成员设计见 [FDA](platform-packs/FDA_OPENFDA_ENFORCEMENT_PLATFORM_PACK_DESIGN.md)、[NHTSA](platform-packs/NHTSA_RECALLS_PLATFORM_PACK_DESIGN.md)、[CPSC](platform-packs/CPSC_RECALLS_PLATFORM_PACK_DESIGN.md)、[EU Safety Gate](platform-packs/EU_SAFETY_GATE_PLATFORM_PACK_DESIGN.md)、[Canada](platform-packs/CANADA_RECALLS_SAFETY_ALERTS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Product Recalls & Corrective Actions Channel Pack](platform-packs/PUBLIC_PRODUCT_RECALLS_CHANNEL_PACK_DESIGN.md)。当前requested=5、concept-fixture-eligible=5、route-fixture-eligible=4、callable=0、durable=0；未调用API/feed/portal，未安装/执行Skill/MCP/开源项目，未下载recall corpus，也未产生报告、联系或平台写入。

### 8.13 公开科研文献与报告的研究限制

该场域补足“研究者已经明确报告了哪些适用边界、失败条件、假设、不确定性、复制问题和未来工作”。它不是论文搜索量、citation排名或自动科学裁判；同一work被多个index投影也不能重复计为多份证据。

- Crossref：公开REST提供成员deposit的DOI metadata、abstract（若提供）、funding/license、relation和post-publication update；deposit不等于独立验证，DOI/link不等于全文或同行评审。[REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)；[versioning](https://www.crossref.org/documentation/principles-practices/best-practices/versioning/)。
- OpenAlex：API/graph提供work/external IDs/topic/citation等provider-normalized数据；core、expansion、snapshot和full-text content是不同population/rights/cost surface。[API](https://help.openalex.org/api/)；[snapshot](https://help.openalex.org/access/snapshot/)；[full text](https://help.openalex.org/access/fulltext/)。
- PubMed：E-utilities和baseline/daily XML提供biomedical citation/abstract、MEDLINE status和MeSH；PubMed citation与PMC全文分开，abstract可能受publisher/author版权保护。[E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25499/)；[download](https://pubmed.ncbi.nlm.nih.gov/download/)。
- Europe PMC：聚合PubMed等和preprint，提供references/citations/annotations及OA subset的`fullTextXML`；source ID、synonym expansion和逐篇license必须固定。[REST](https://europepmc.org/RestfulWebService)；[OA subset](https://europepmc.org/downloads/openaccess)。
- arXiv：Atom query API与OAI-PMH提供versioned e-print metadata；preprint不等于同行评审，withdrawal不等于journal retraction，OAI datestamp不等于original submission date。[API](https://info.arxiv.org/help/api/index.html)；[OAI](https://info.arxiv.org/help/oa/index.html)。

候选分流见 [Public Research Literature Triage](platform-packs/PUBLIC_RESEARCH_LITERATURE_TRIAGE_2026-08-26.md)，成员设计见 [Crossref](platform-packs/CROSSREF_SCHOLARLY_METADATA_PLATFORM_PACK_DESIGN.md)、[OpenAlex](platform-packs/OPENALEX_SCHOLARLY_GRAPH_PLATFORM_PACK_DESIGN.md)、[PubMed](platform-packs/PUBMED_BIOMEDICAL_LITERATURE_PLATFORM_PACK_DESIGN.md)、[Europe PMC](platform-packs/EUROPE_PMC_LITERATURE_PLATFORM_PACK_DESIGN.md)、[arXiv](platform-packs/ARXIV_PREPRINT_PLATFORM_PACK_DESIGN.md)，组合见 [Public Research Literature & Reported Limitations Channel Pack](platform-packs/PUBLIC_RESEARCH_LITERATURE_CHANNEL_PACK_DESIGN.md)。当前requested=5、concept-fixture=5、metadata-route-fixture=5、callable=0、durable=0、rights-cleared content=0；未调用API/OAI/snapshot/full text，未安装/执行Skill/MCP/开源项目，也未产生科研平台写入。

### 8.14 公开临床研究注册与报告约束

该场域补足“哪些研究在发表前被计划、更新、暂停、终止或撤回，以及completed后是否有results record”。它不是患者匹配、治疗推荐或疗效判断；registry record是sponsor/responsible-party/regulator/provider声明，不是独立验证。

- ClinicalTrials.gov：API v2提供NCT protocol/results、field definitions和history语义；overall status、why stopped、anticipated/actual enrollment、outcome definition和posted aggregate results分别保存。[API](https://clinicaltrials.gov/data-api/api)；[study structure](https://clinicaltrials.gov/data-api/about-api/study-data-structure)。
- WHO ICTRP：TRDS v1.3.1统一primary registry/ID、secondary IDs、support/sponsor、design、status、outcome等最小字段；Search Portal每周聚合并按identifier bridge related records，CSV/XML download与申请/收费Web Service分开。[TRDS](https://www.who.int/tools/clinical-trials-registry-platform/network/who-data-set)；[download](https://www.who.int/tools/clinical-trials-registry-platform/network/who-data-set/downloading-records-from-the-ictrp-database)。
- ISRCTN：registry支持study update/results/transparency，search results可CSV，XML API文档仍为draft/incomplete；Contribution CC BY、metadata CC0，但逐record attribution保留。[FAQ/API](https://www.isrctn.com/page/faqs)。
- EU CTIS：EU/EEA application、authorization/refusal、trial lifecycle和public reports/documents同处监管系统；本轮未发现versioned public API，只作selected public-record concept fixture。[CTIS overview](https://euclinicaltrials.eu/about-this-website/)。
- DRKS：BfArM公开search和multi-format export；2025前rights可能受copyright，2025起/2025更新的数据按CC BY 4.0，且本轮未发现versioned API。[search/terms/export](https://www.bfarm.de/EN/BfArM/Tasks/German-Clinical-Trials-Register/Search-studies/_node.html)。

候选分流见 [Public Clinical Study Registries Triage](platform-packs/PUBLIC_CLINICAL_STUDY_REGISTRIES_TRIAGE_2026-08-26.md)，成员设计见 [ClinicalTrials.gov](platform-packs/CLINICALTRIALS_GOV_STUDY_REGISTRY_PLATFORM_PACK_DESIGN.md)、[WHO ICTRP](platform-packs/WHO_ICTRP_CLINICAL_STUDY_PLATFORM_PACK_DESIGN.md)、[ISRCTN](platform-packs/ISRCTN_STUDY_REGISTRY_PLATFORM_PACK_DESIGN.md)、[EU CTIS](platform-packs/EU_CTIS_CLINICAL_TRIAL_PLATFORM_PACK_DESIGN.md)、[DRKS](platform-packs/DRKS_CLINICAL_STUDY_REGISTRY_PLATFORM_PACK_DESIGN.md)，组合见 [Public Clinical Study Registries & Reported Constraints Channel Pack](platform-packs/PUBLIC_CLINICAL_STUDY_REGISTRIES_CHANNEL_PACK_DESIGN.md)。当前requested=5、concept-fixture=5、route-fixture=3、callable=0、durable=0；未调用API/XML/CSV/export/search、未下载trial corpus、未运行MCP/Skill/client，也未处理contact/site/participant/IPD或产生registry副作用。

### 8.15 公开药品供应短缺与可得性约束

该场域补足“哪个具体药品规格、在哪个辖区和时间窗内，被监管机构或受监管报告者声明为预计短缺、当前短缺、供应受限、停止供应或已解决，以及采取了什么管理行动”。它不是实时库存、找药、治疗替代或市场需求量。

- FDA/openFDA：`/drug/shortages.json`提供daily公开JSON和bulk snapshot；status、availability、reason和presentation分开，官方明确不得用于医疗决策。[API](https://open.fda.gov/apis/drug/drugshortages/)。
- Health Product Shortages Canada：强制shortage/discontinuation reports的public search/export/API；2026迁移改变API extraction instructions，旧/新route必须重新conformance。[Health Canada公告](https://www.canada.ca/en/health-canada/services/drugs-health-products/compliance-enforcement/establishment-licences/drug-establishment-licensing-bulletin/new-website-health-product-shortages.html)。
- EMA：public catalogue只覆盖EMA评估的EU-level ongoing/resolved shortages；ESMP M2M服务MAH/NCA报送，不是public read route。[public catalogue](https://www.ema.europa.eu/en/human-regulatory-overview/post-authorisation/medicine-shortages-availability-issues/public-information-medicine-shortages)。
- TGA：公开anticipated/current/resolved/discontinued、ARTG presentation、impact/availability/reason和management action，并提供active/archive extract；数据主要基于sponsor reports。[database](https://apps.tga.gov.au/shortages/search/Index?shortagetype=All)。
- UK DHSC：DaSH supplier notifications和root causes的官方aggregate/methodology；notification count不等于unique shortage/product/patient。[statistics](https://www.gov.uk/government/statistics/medicine-supply-disruption-statistics-uk-data-to-june-2026)。

候选分流见 [Public Medicine Supply Shortages Triage](platform-packs/PUBLIC_MEDICINE_SUPPLY_SHORTAGES_TRIAGE_2026-08-26.md)，成员设计见 [FDA](platform-packs/FDA_DRUG_SHORTAGES_PLATFORM_PACK_DESIGN.md)、[Canada](platform-packs/HEALTH_PRODUCT_SHORTAGES_CANADA_PLATFORM_PACK_DESIGN.md)、[EMA](platform-packs/EMA_MEDICINE_SHORTAGES_PLATFORM_PACK_DESIGN.md)、[TGA](platform-packs/TGA_MEDICINE_SHORTAGE_REPORTS_PLATFORM_PACK_DESIGN.md)、[UK DHSC](platform-packs/UK_DHSC_MEDICINE_SUPPLY_STATISTICS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Medicine Supply Shortages & Availability Constraints Channel Pack](platform-packs/PUBLIC_MEDICINE_SUPPLY_SHORTAGES_CHANNEL_PACK_DESIGN.md)。当前requested=5、concept-fixture=5、route-fixture=4、callable=0、durable=0；官方链接解析曾只读预览一次TGA active extract但未保存或纳入fixture，其余真实API/search/export未调用，未运行MCP/Skill，也未产生report/update/contact/medical effects。

### 8.16 公共监管执法与补救义务

该场域补足“公开投诉、规则制定和产品召回之后，authority是否进入formal action，exact record只是allegation、已经形成哪类finding/admission，order或judgment是否final/effective/stayed，以及哪些remedial obligation仍在生效”。它用于发现反复的合规、服务和运营摩擦，不是违法企业榜单。

- EPA ECHO：官方Web Services公开查询ICIS与criminal prosecution来源的enforcement cases，同时明确refresh/completeness caveat；可作GET route fixture。[Web Services](https://echo.epa.gov/tools/web-services)。
- CFPB：官方Enforcement Actions索引court/admin actions、filters、case pages和documents；本轮未确认versioned public API，只作selected-record fixture。[Actions](https://www.consumerfinance.gov/enforcement/actions/)。
- FTC：Legal Library提供Cases and Proceedings timeline与complaint/order/settlement/appeal/dismissal等documents；无已确认官方API，禁止把HTML/internal search当contract。[Legal Library](https://search.ftc.gov/legal-library/search)。
- SEC：Litigation Releases、Administrative Proceedings和official RSS分别保留；feed entry不是完整case或finding。[RSS](https://www.sec.gov/about/rss-feeds)。
- UK CMA：case finder按type/state/sector/outcome公开case与feed；market study、merger和enforcement procedure不压成统一violation。[CMA cases](https://www.gov.uk/cma-cases)。

候选比较见 [Public Regulatory Enforcement Triage](platform-packs/PUBLIC_REGULATORY_ENFORCEMENT_TRIAGE_2026-08-26.md)，成员设计见 [EPA ECHO](platform-packs/EPA_ECHO_ENFORCEMENT_CASES_PLATFORM_PACK_DESIGN.md)、[CFPB](platform-packs/CFPB_ENFORCEMENT_ACTIONS_PLATFORM_PACK_DESIGN.md)、[FTC](platform-packs/FTC_CASES_PROCEEDINGS_PLATFORM_PACK_DESIGN.md)、[SEC](platform-packs/SEC_ENFORCEMENT_PROCEEDINGS_PLATFORM_PACK_DESIGN.md)、[UK CMA](platform-packs/UK_CMA_CASES_PLATFORM_PACK_DESIGN.md)，组合见 [Public Regulatory Enforcement & Remedial Obligations Channel Pack](platform-packs/PUBLIC_REGULATORY_ENFORCEMENT_CHANNEL_PACK_DESIGN.md)。当前requested=5、concept-fixture=5、route-fixture=3、callable=0、durable=0；未调用真实service/feed/search/download，未安装或执行MCP/Skill/开源项目，未产生filing/comment/petition/contact/subscription等平台副作用。

### 8.17 公共申诉专员裁决与报告救济

该场域补足“投诉进入独立纠纷处理后，investigator view是否形成final decision、native outcome是什么、decision何时binding、remedy只是recommended/ordered还是已被报告履行，以及是否有appeal/stay/variation”。它用于发现高摩擦服务过程和具体修复方式，不是respondent黑榜或总体投诉统计。

- UK FOS：公开2013年4月以来final decisions；investigator assessment、provisional、final和complainant acceptance分别建模，published final不自动binding。[Decisions](https://www.financial-ombudsman.org.uk/businesses/resolving-complaint/ombudsman-decisions)、[process](https://www.financial-ombudsman.org.uk/who-we-are/make-decisions)。
- UK Pensions Ombudsman：公开pensions/FAS/PPF determinations；Adjudicator view与preliminary不是final，final determination对各方binding/enforceable但可就法律问题上诉。[Decisions](https://www.pensions-ombudsman.org.uk/decisions)、[appeal](https://www.pensions-ombudsman.org.uk/how-appeal)。
- Ireland FSPO：公开按sector/product/conduct/outcome筛选的legally binding decisions；preliminary后形成final，双方可在35日内向High Court上诉，remedy power按financial/pension domain保持差异。[Decisions](https://www.fspo.ie/complaint-outcomes/investigation-services/legally-binding-decisions/display.asp)、[services](https://www.fspo.ie/our-services/)。
- UK Housing Ombudsman：公开landlord、category、maladministration outcome与orders，存在publication lag/withholding；页面声明official RSS，但本轮未请求feed payload。[Decisions](https://www.housing-ombudsman.org.uk/decisions/)、[guidance](https://www.housing-ombudsman.org.uk/about-us/corporate-information/policies/guidance-on-decisions/)。

候选比较见 [Public Ombudsman Determinations Triage](platform-packs/PUBLIC_OMBUDSMAN_DETERMINATIONS_TRIAGE_2026-08-26.md)，成员设计见 [FOS](platform-packs/UK_FINANCIAL_OMBUDSMAN_DECISIONS_PLATFORM_PACK_DESIGN.md)、[TPO](platform-packs/UK_PENSIONS_OMBUDSMAN_DECISIONS_PLATFORM_PACK_DESIGN.md)、[FSPO](platform-packs/IRELAND_FSPO_DECISIONS_PLATFORM_PACK_DESIGN.md)、[Housing](platform-packs/UK_HOUSING_OMBUDSMAN_DECISIONS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Ombudsman Determinations & Reported Remedies Channel Pack](platform-packs/PUBLIC_OMBUDSMAN_DETERMINATIONS_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、route-fixture=1、selected-record/manual=3、callable=0、durable=0；未请求真实decision search/feed/PDF，未安装或执行MCP/Skill/开源项目，未产生任何程序或平台副作用。

### 8.18 公共审计发现、建议与跟踪

该场域补足“公共审计机构在什么objective/scope/criteria/method下报告了哪些finding/conclusion、提出了什么recommendation、被审计方如何回应或自报落实，以及审计方是否复核”。它比一般评论更接近有方法的运营证据，但不是组织风险/表现榜、法律责任或完整问题分母。

- US GAO：报告目录、报告流程、recommendation status与official reports RSS；agency response、自报update和GAO closed status分别建模。[Reports](https://www.gao.gov/for-congress/reports)、[Recommendations](https://www.gao.gov/about/what-gao-does/recommendations?page=6)、[feeds](https://www.gao.gov/about/stay-connected)。
- UK NAO：reports/archive与Recommendations Tracker；audited body提供acceptance/implementation，NAO confirmation是独立字段和authority。[Reports](https://www.nao.org.uk/reports/)、[tracker](https://www.nao.org.uk/recommendations-tracker/)。
- European Court of Auditors：多类audit reports、recommendation follow-up和selected reports open data；ECA data.europa.eu catalogue只覆盖选定数据集。[Reports](https://eca.europa.eu/en/multiple-reports)、[open data](https://eca.europa.eu/en/reports-open-data)。
- Australia ANAO：performance audit objective/scope/criteria、finding/conclusion、recommendation与entity response；entity self-report不等于后续ANAO audit finding。[Process](https://www.anao.gov.au/work/insights/performance-audit-process)。
- Canada OAG：independent assurance report与selected 2014–2020 recommendation update；后者在2022结束且官方明确不是audit/opinion。[Update scope](https://www.oag-bvg.gc.ca/internet/English/rp_fs_e_43852.html)。

候选比较见 [Public Audit Triage](platform-packs/PUBLIC_AUDIT_FINDINGS_RECOMMENDATIONS_TRIAGE_2026-08-26.md)，成员设计见 [GAO](platform-packs/US_GAO_AUDIT_REPORTS_RECOMMENDATIONS_PLATFORM_PACK_DESIGN.md)、[NAO](platform-packs/UK_NAO_REPORTS_RECOMMENDATIONS_PLATFORM_PACK_DESIGN.md)、[ECA](platform-packs/EU_ECA_AUDIT_REPORTS_OPEN_DATA_PLATFORM_PACK_DESIGN.md)、[ANAO](platform-packs/AUSTRALIA_ANAO_PERFORMANCE_AUDITS_PLATFORM_PACK_DESIGN.md)、[Canada OAG](platform-packs/CANADA_OAG_PERFORMANCE_AUDITS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Audit Findings, Recommendations & Follow-up Channel Pack](platform-packs/PUBLIC_AUDIT_FINDINGS_RECOMMENDATIONS_CHANNEL_PACK_DESIGN.md)。当前requested=5、concept-fixture=5、route-fixture=2、selected-record/manual=3、callable=0、durable=0；未请求真实feed/API/report/tracker/dataset payload，未安装或执行MCP/Skill/开源项目，未产生任何审计或平台副作用。

### 8.19 公共311/市政服务请求与报告处置

该场域补足“公众、客服代表或政府部门记录了什么具体市政服务请求、如何分类/分派、当前状态与source-declared disposition是什么”。它比社交讨论更接近日常运营痛点，但row count不是unique people/incidents，closed也不是客观解决。

- NYC：当前official catalogue把`erm2-nwe9`改为2020–present，并把2010–2019指向`76ig-c548`；只覆盖可转给specific agency的requests，daily更新且expected values可变。[Catalogue](https://catalog.data.gov/dataset/311-service-requests-from-2010-to-present)。
- San Francisco：2008-07-01以来place/thing cases；官方明确同一incident可能多报、一人可多报、agency也可创建internal request，description/contact不进入开放数据。[Explainer](https://sfdigitalservices.gitbook.io/dataset-explainers/311-cases)。
- Austin：`xwdj-i9he`从2014-01-03起、每天多次更新；department批准公开service types，受Texas Public Information Act保护的request排除，name/phone/email不发布。[Open Data Overview](https://www.austintexas.gov/3-1-1/open-data-portal)。
- Toronto：只覆盖参与divisions的customer-initiated requests，按年度ZIP/月度刷新；original type/division、Initiated/In Progress/Canceled/Closed与FSA/intersection location分别建模。[Dataset](https://open.toronto.ca/dataset/311-service-requests-customer-initiated/)。

候选比较见 [Public Civic Service Requests Triage](platform-packs/PUBLIC_CIVIC_SERVICE_REQUESTS_TRIAGE_2026-08-26.md)，成员设计见 [NYC](platform-packs/NYC_311_SERVICE_REQUESTS_PLATFORM_PACK_DESIGN.md)、[SF](platform-packs/SF_311_CASES_PLATFORM_PACK_DESIGN.md)、[Austin](platform-packs/AUSTIN_311_PUBLIC_DATA_PLATFORM_PACK_DESIGN.md)、[Toronto](platform-packs/TORONTO_311_SERVICE_REQUESTS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Civic Service Requests & Reported Dispositions Channel Pack](platform-packs/PUBLIC_CIVIC_SERVICE_REQUESTS_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、route-fixture=4、callable=0、durable=0；本轮只读官方网页/catalogue metadata和固定源码，未请求service-request rows、ZIP/CSV/JSON payload、真实status lookup，未安装或执行MCP/Skill/开源项目，未产生任何报修或平台副作用。

### 8.20 公共请愿、支持计数与官方回应

该场域补足“公众或组织正式要求议会/政府采取什么行动、平台按什么规则接受了多少支持、达到成员门槛后实际发生了什么回应或审议”。它比一般社交讨论更接近明确的action request，但不是民调、选举、法律救济或需求规模分母。

- UK Parliament：petition公开6个月；10,000触发government response，100,000由committee考虑辩论，但considered不等于scheduled/debated。[Help](https://petition.parliament.uk/help)、[privacy](https://petition.parliament.uk/privacy)。
- Scottish Parliament：任何人/组织可就devolved national issue提交；所有published petitions均由Public Petitions Committee考虑，不依赖数值门槛。[Help](https://petitions.parliament.scot/help)、[privacy](https://petitions.parliament.scot/privacy)。
- Senedd：Wales address、2 initial supporters；250 signatures进入committee review，10,000只触发是否请求debate的考虑，Welsh/English为同一petition renditions。[Help](https://petitions.senedd.wales/help)、[privacy](https://petitions.senedd.wales/privacy)。
- European Parliament：EU citizen及Member State resident/registered legal person可就EU activity且directly affecting them的事项petition；PETI先判admissibility，可请求Commission调查、referral、hearing/visit、report/resolution或debate。[Rule 232](https://www.europarl.europa.eu/doceo/document/lastrules/RULE-232_EN.html)、[fact sheet](https://www.europarl.europa.eu/factsheets/en/sheet/148/the-right-of-)。

候选比较见 [Public Petitions Triage](platform-packs/PUBLIC_PETITIONS_SUPPORT_RESPONSES_TRIAGE_2026-08-26.md)，成员设计见 [UK](platform-packs/UK_PARLIAMENT_PETITIONS_PLATFORM_PACK_DESIGN.md)、[Scotland](platform-packs/SCOTTISH_PARLIAMENT_PETITIONS_PLATFORM_PACK_DESIGN.md)、[Senedd](platform-packs/SENEDD_PETITIONS_PLATFORM_PACK_DESIGN.md)、[European Parliament](platform-packs/EUROPEAN_PARLIAMENT_PETITIONS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Petitions, Support & Official Responses Channel Pack](platform-packs/PUBLIC_PETITIONS_SUPPORT_RESPONSES_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、route-fixture=2、selected-record/manual=2、callable=0、durable=0；本轮只做官方流程/隐私/固定源码研究与一次性公开list schema envelope观察，未保留row内容，未安装或执行MCP/Skill/开源项目，未产生政治参与或平台副作用。

### 8.21 公共参与式预算：提案、优先级、分配与执行

该场域补足“居民提议把公共资源用在哪里、项目怎样经规则筛选、aggregate priority如何形成、预算约束怎样影响选择，以及authority随后报告了什么allocation/execution”。它不是普通预算、采购、支出、请愿或民调；support、final vote、majority grade、selection、budget inclusion、appropriation、spend与completion必须分开。

- Barcelona：2024–2027总额€30m，proposal/debate、technical feasibility、prioritization、co-development和budget-constrained final vote；2025结果为1,733 proposals、789 technical validations、239 ballot projects、76 winners。[Process](https://www.barcelona.cat/mobilitat/en/news-and-documents/news/nous-pressupostos-participatius-2024-2027decideix-que-es-millora-al-teu-barri-1439847)、[results](https://ajuntament.barcelona.cat/santmarti/ca/noticies/11-projectes-guanyadors-dels-pressupostos-participatius-1517473)。
- Madrid：2026–2027 process面向2028/29、€50m；support不受budget limit且与final vote不同，positive/negative产生weighted net score，项目按score和remaining envelope选择。[Process](https://decide.madrid.es/mas-informacion/dm/presupuestos)。
- Paris：majority judgment四档grade；official open data只覆盖2014年以来winners的budget、implementer、status与milestone日期，不能补齐proposal/vote population。[Dataset](https://opendata.paris.fr/explore/dataset/bp_projets_gagnants/)。
- NYC：current Council process从idea/development/vote到budget/agency implementation；official machine datasets只覆盖至2017/2018且最后更新于2020，必须标为historical/stale。[Process](https://council.nyc.gov/pb/)、[projects](https://data.cityofnewyork.us/City-Government/Participatory-Budgeting-Projects/wwhr-5ven)、[tracker](https://data.cityofnewyork.us/City-Government/Participatory-Budgeting-Project-Tracker/qm5f-frjb)。

候选比较见 [Public Participatory Budgeting Triage](platform-packs/PUBLIC_PARTICIPATORY_BUDGETING_TRIAGE_2026-08-26.md)，成员设计见 [Barcelona](platform-packs/BARCELONA_PARTICIPATORY_BUDGETS_PLATFORM_PACK_DESIGN.md)、[Madrid](platform-packs/MADRID_PARTICIPATORY_BUDGETS_PLATFORM_PACK_DESIGN.md)、[Paris](platform-packs/PARIS_PARTICIPATORY_BUDGET_PLATFORM_PACK_DESIGN.md)、[NYC](platform-packs/NYC_PARTICIPATORY_BUDGETING_PLATFORM_PACK_DESIGN.md)，组合见 [Public Participatory Budgeting Channel Pack](platform-packs/PUBLIC_PARTICIPATORY_BUDGETING_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、official data route-fixture=2、provider-schema candidate=2、selected/manual=4、callable=0、durable=0；本轮只读官方web/docs/catalog schema与固定源码，没有调用数据route或保留row，没有安装/执行项目，也未产生政治参与或平台副作用。

### 8.22 公共信息公开请求、机关回应与披露结果

该场域补足“哪些records/data因现有公开信息不足而被正式索取、请求和机关怎样往返、谁把案件归为什么状态、最终公开了哪些材料，以及是否进入review/appeal”。它不是请愿、投诉、民调或对机关过错的证明；request allegation、body statement、platform/requester classification、review outcome与released content必须逐层保存。

- WhatDoTheyKnow：mySociety运营的英国公开请求服务，代发请求并自动公开请求与回应；平台也收录部分自愿回应或其认为应受覆盖的机构，因此authority roster不等于法定coverage。[About](https://www.whatdotheyknow.com/help/about)、[requesting](https://www.whatdotheyknow.com/help/requesting)、[Alaveteli](https://www.whatdotheyknow.com/help/alaveteli)。
- MuckRock：美国public-records workflow包含请求、通信、机关、状态和可能的embargo；`done`与`partial`等native status不能被压成“已完整披露”。[How it works](https://www.muckrock.com/about/how-we-work/)、[FOIA](https://www.muckrock.com/foi/)、[Terms](https://www.muckrock.com/tos/)。
- FragDenStaat：德国平台公开`/api/v1/`与OpenAPI，requests/publicbody读取和账户、非公开、make/write scopes必须分开；邮箱验证与可用化名也不等于独立验证的unique person。[API](https://fragdenstaat.de/api/)、[privacy](https://fragdenstaat.de/datenschutzerklaerung/)。
- AskTheEU：面向EU access-to-documents；Pro可将请求保持private 3/6/12个月后公开，故当前visibility/embargo必须在读取前验证，confirmatory application也必须作为review阶段而非普通回复。[AskTheEU Pro](https://blog.asktheeu.org/2020/06/asktheeu-pro/)、[access guide](https://blog.asktheeu.org/2013/05/access-to-eu-documents-guide/)。

候选比较见 [Public Information Access Requests Triage](platform-packs/PUBLIC_INFORMATION_ACCESS_REQUESTS_TRIAGE_2026-08-26.md)，成员设计见 [WhatDoTheyKnow](platform-packs/WHATDOTHEYKNOW_INFORMATION_ACCESS_PLATFORM_PACK_DESIGN.md)、[MuckRock](platform-packs/MUCKROCK_PUBLIC_RECORDS_PLATFORM_PACK_DESIGN.md)、[FragDenStaat](platform-packs/FRAGDENSTAAT_INFORMATION_ACCESS_PLATFORM_PACK_DESIGN.md)、[AskTheEU](platform-packs/ASKTHEEU_ACCESS_TO_DOCUMENTS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Information Access Requests, Public-Body Responses & Releases Channel Pack](platform-packs/PUBLIC_INFORMATION_ACCESS_REQUESTS_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact-member route-fixture=1、provider/source-schema candidate=3、selected/manual=4、callable=0、durable=0；本轮只读官方静态文档与固定源码，没有请求API或request/response/release rows，没有安装或执行Skill/MCP/开源项目，也未产生请求、追问、缴费、review/appeal、annotation、upload或其他平台副作用。

### 8.23 公共规划/开发申请、公众意见、评估与主管机关决定

该场域补足“谁申请改变什么土地/建筑状态、何时进入正式公众参与、公开意见如何被申请人/机构回应、officer/advisory body如何评估，以及competent authority最终决定了什么”。application、representation、recommendation、decision和implementation必须分开；objection/support count不是unique people或民意，approval不是已建成/入住/成功。

- England Planning Data：官方API/OpenAPI与bulk格式可固定route，但planning-application标准仍在发展、provider少且当前数据由MHCLG创建，不能冒充全国authoritative LPA register。[API](https://www.planning.data.gov.uk/docs)、[dataset](https://www.planning.data.gov.uk/dataset/planning-application)、[design](https://design.planning.data.gov.uk/project/planning-applications)。
- NSW Planning Portal：Online DA catalogue/data dictionary、DA exhibitions、submission→submissions report→response/amendment流程价值高；当前公开catalogue不足以固定exact API route，且submission涉及姓名、地址、email、IP和政治捐赠等敏感字段。[catalogue](https://www.planningportal.nsw.gov.au/opendata/dataset/online-da-data-api)、[exhibitions](https://www.planningportal.nsw.gov.au/daexhibitions)、[privacy](https://www.planning.nsw.gov.au/privacy)。
- NYC ZAP/Open Data：Socrata dataset `hgx4-8ukb`提供public project表面；ULURP中Community Board/Borough President建议与CPC/Council/Mayor决定分属不同authority，public status/completed也不能直接映射approval或built。[dataset](https://data.cityofnewyork.us/w/hgx4-8ukb/25te-f2tw)、[ULURP](https://www.nyc.gov/site/brooklyncb9/resources/uniform-land-use-review-procedure-ulurp.page)。
- Ireland NPAD：官方ArcGIS FeatureServer聚合participating local authorities；旧/新catalogue对2010/2012起始、更新时间和coverage存在漂移，必须同时保留catalogue revision和authority roster。[dataset](https://data.gov.ie/dataset/national-planning-applications)、[current catalogue](https://data.gov.ie/dataset/irishplanningapplications1)。

候选比较见 [Public Planning Applications & Decisions Triage](platform-packs/PUBLIC_PLANNING_APPLICATIONS_DECISIONS_TRIAGE_2026-08-26.md)，成员设计见 [England](platform-packs/ENGLAND_PLANNING_DATA_APPLICATIONS_PLATFORM_PACK_DESIGN.md)、[NSW](platform-packs/NSW_PLANNING_PORTAL_DEVELOPMENT_APPLICATIONS_PLATFORM_PACK_DESIGN.md)、[NYC](platform-packs/NYC_ZAP_LAND_USE_APPLICATIONS_PLATFORM_PACK_DESIGN.md)、[Ireland](platform-packs/IRELAND_NATIONAL_PLANNING_APPLICATIONS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Planning Applications, Representations & Decisions Channel Pack](platform-packs/PUBLIC_PLANNING_APPLICATIONS_REPRESENTATIONS_DECISIONS_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact-member route-fixture=3、catalogue/schema fixture=4、selected/manual=4、callable=0、durable=0；本轮没有请求application/feature/submission row、下载document、安装/执行Skill/MCP/开源项目或产生法定程序副作用。

### 8.24 公共建筑许可、检查、证书与执法

该场域补足planning decision之后“工作是否取得有效permit、在哪个专业/阶段被检查、哪些投诉/违法/命令进入裁决与整改、是否取得partial/temporary/final certificate”的证据链。application、permit、inspection、finding/adjudication/compliance与certificate不能互推；permit issued不是开工/完工，inspection passed不是whole-project/continued compliance，violation不是liability/current condition，CO不是current safety或actual occupancy。

- NYC DOB：DOB NOW application/approved permit、legacy BIS permit、legacy/current CO与多套violation dataset提供丰富lineage，但Electrical/Elevator/LAA等分表、新旧violation可重叠，且本轮未找到一般建筑inspection event/result公共dataset。[approved permits](https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Build-Approved-Permits/rbx6-tga4)、[CO](https://data.cityofnewyork.us/Housing-Development/DOB-NOW-Certificate-of-Occupancy/pkdm-hqz6)、[safety violations](https://data.cityofnewyork.us/Housing-Development/DOB-Safety-Violations/855j-jady)。
- Chicago：Building Permits只覆盖currently-valid issued population并受building/zoning fee有效性约束，排除void/revoked；Building Violations把多条violation关联到一次inspection，同时包含liable/not-liable且不保证当前property状态。[permits](https://data.cityofchicago.org/Buildings/Building-Permits/ydr8-5enu)、[violations](https://data.cityofchicago.org/Buildings/Building-Violations/22u3-xenr)。
- Toronto：官方定义Application→Review→Issue→Inspection→Close，active与cleared分属两个CKAN package；metadata已固定package/resource ID，但两者`license_id=notspecified`与portal Open Government Licence之间需先解决rights冲突。[process](https://open.toronto.ca/exploring-cleared-building-permits/)、[licence](https://open.toronto.ca/open-data-licence/)。
- NSW：CC、OC、partial OC与BIC法律作用不同，registered certifier通过Portal/Common APIs报告Critical Stage Inspection与Written Direction Notice；当前只有restricted council/certifier integration API/schema证据，没有public exact record route。[certificates](https://www.planningportal.nsw.gov.au/development-and-assessment/post-consent-certificates)、[reporting](https://www.planningportal.nsw.gov.au/news/clarification-certification-data-reporting)。

候选比较见 [Public Building Regulation Triage](platform-packs/PUBLIC_BUILDING_REGULATION_TRIAGE_2026-08-26.md)，成员设计见 [NYC DOB](platform-packs/NYC_DOB_BUILDING_REGULATION_PLATFORM_PACK_DESIGN.md)、[Chicago](platform-packs/CHICAGO_BUILDING_PERMITS_VIOLATIONS_PLATFORM_PACK_DESIGN.md)、[Toronto](platform-packs/TORONTO_BUILDING_PERMITS_PLATFORM_PACK_DESIGN.md)、[NSW](platform-packs/NSW_POST_CONSENT_CERTIFICATES_PLATFORM_PACK_DESIGN.md)，组合见 [Public Building Permits, Inspections, Certificates & Enforcement Channel Pack](platform-packs/PUBLIC_BUILDING_PERMITS_INSPECTIONS_CERTIFICATES_ENFORCEMENT_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact-member route-fixture=3、restricted integration schema fixture=1、selected/manual=4、callable=0、durable=0；本轮只调用Toronto CKAN package metadata action，未请求任何平台数据记录，未安装/执行Skill/MCP/开源项目，也未产生监管或平台副作用。

### 8.25 公共职业/经营许可、检查与纪律处分

该场域补足“某个主体是否获准从事受监管活动、获准范围和当前standing如何变化、检查与纪律程序停在哪个环节”的证据链。经营主体、经营场所、自然人专业人员、申请、许可/注册、endorsement、检查、投诉、调查、指控、认定、处分、申诉和恢复不能互推；current不是能力/信誉/实际执业，charge不是finding，condition不必然disciplinary，reinstatement不抹除历史。

- NYC DCWP：Issued Licenses、Inspections和Charges三个exact Socrata dataset分别覆盖当前许可、一次检查结果及inspection/investigation产生的指控；共享ID不代表三套population可合并。[licenses](https://data.cityofnewyork.us/Business/Issued-Licenses/w7w3-xahh)、[inspections](https://data.cityofnewyork.us/Business/DCWP-Inspections/jzhd-m6uv)、[charges](https://data.cityofnewyork.us/Business/DCWP-Charges/5fn4-dr26)。
- Chicago BACP：base dataset `r5kz-chrr`覆盖issue/renew/change location/capacity/activity和AAI/AAC/REV/REA，可验证许可lineage与revocation appeal，但没有固定inspection/finding/remediation公共route。[dataset](https://data.cityofchicago.org/Community-Economic-Development/Business-Licenses/r5kz-chrr)。
- California DCA：150+专业许可类型按Agency月更公开文件，统一layout仍有excluded Agencies；discipline需要逐board固定，CBA accusation只是allegation且summary/order/finality可能滞后或被stay/modify。[files/layout](https://www.dca.ca.gov/consumers/public_info/index.shtml)、[search](https://search.dca.ca.gov/)、[CBA semantics](https://www.dca.ca.gov/cba/consumers/about-lookup.shtml)。
- Ahpra：National Register覆盖15个Boards的当前注册、endorsement/specialty与部分restriction/discipline；PIE API、register copy/extract和research data通常需批准、合同、purpose与费用，不能用public HTML补成开放bulk API。[register terms](https://www.ahpra.gov.au/Registration/Registers-of-Practitioners/Terms-in-the-Register)、[data exchange](https://www.ahpra.gov.au/Registration/Employer-Services/External-data-exchange-services)。

候选比较见 [Public Regulated Licenses Triage](platform-packs/PUBLIC_REGULATED_LICENSES_INSPECTIONS_DISCIPLINE_TRIAGE_2026-08-26.md)，成员设计见 [NYC DCWP](platform-packs/NYC_DCWP_REGULATED_BUSINESS_LICENSE_PLATFORM_PACK_DESIGN.md)、[Chicago](platform-packs/CHICAGO_BUSINESS_LICENSE_PLATFORM_PACK_DESIGN.md)、[California DCA](platform-packs/CALIFORNIA_DCA_PROFESSIONAL_LICENSE_PLATFORM_PACK_DESIGN.md)、[Ahpra](platform-packs/AHPRA_PRACTITIONER_REGISTER_PLATFORM_PACK_DESIGN.md)，组合见 [Public Regulated Licenses, Inspections & Discipline Channel Pack](platform-packs/PUBLIC_REGULATED_LICENSES_INSPECTIONS_DISCIPLINE_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact route/file fixture=3、restricted contract/API fixture=1、selected/manual=4、callable=0、durable=0；本轮没有请求平台数据行、身份或处分文档，没有安装/执行第三方项目，也没有产生许可或监管副作用。

### 8.26 公共环境许可、监测、排放与合规

该场域补足“受监管活动取得了哪版许可与限值、是否按要求监测、数据能否比较、超限如何进入不合规认定、执法与整改是否闭环”的证据链。permit、condition/limit、requirement、measurement、comparison、violation、enforcement与remediation不能互推；年度release/transfer inventory另有thresholded reporting population，不能当瞬时排放、暴露、损害或permit compliance。

- US EPA ECHO / ICIS-NPDES：official services与bulk datasets区分permit/limit、permittee-reported DMR、non-receipt、system-generated exceedance violation、manual single-event violation、inspection与enforcement；小设施/州级coverage和known-data problems必须版本化。[web services](https://echo.epa.gov/tools/web-services)、[DMR summary](https://echo.epa.gov/tools/data-downloads/icis-npdes-dmr-summary)、[known problems](https://echo.epa.gov/resources/echo-data/known-data-problems)。
- England EA：Public Registers API覆盖application/permit/monitoring/breach/enforcement；discharge conditions季度extract排除text conditions，annual compliance rating是whole-permit aggregate。若dataset适用Conditional Licence，一年期限、purpose、no-redistribution与删除先于materialization。[API catalogue](https://www.api.gov.uk/ea/public-registers-for-environmental-information/)、[discharge conditions](https://www.data.gov.uk/dataset/55b8eaa8-60df-48a8-929a-060891b7a109/consented-discharges-to-controlled-waters-with-conditions1)。
- EU/EEA Industrial Emissions Portal：EU Registry与E-PRTR/LCP提供年度release/transfer/energy/emissions，reporting threshold、country/year gaps、confidentiality和2028 facility→installation迁移决定population/identity；它不是permit-compliance source。[dataset](https://industry.eea.europa.eu/industrial-emissions/dataset)、[about](https://industry.eea.europa.eu/industrial-emissions/about)。
- NSW EPA：POEO register覆盖licence/application、notice/penalty/conviction/audit/PRP；许可条件监测由licensee公开。2026年多数annual return不合规申报迁移为获知后21日内report，近实时monitoring submission/public platform仍在探索，旧新制度不能直接做连续趋势。[register](https://www.epa.nsw.gov.au/Licensing-and-Regulation/Public-registers/about-prpoeo)、[monitoring publication](https://www.epa.nsw.gov.au/Licensing-and-Regulation/Licensing/Environment-protection-licences/Licensing-under-POEO-Act-1997/publishing-and-providing-pollution-monitoring-data)、[reforms](https://www.epa.nsw.gov.au/Licensing-and-Regulation/Licensing/licensing-reforms/licensing-reforms-information-environment)。

候选比较见 [Public Environmental Regulation Triage](platform-packs/PUBLIC_ENVIRONMENTAL_PERMITS_MONITORING_COMPLIANCE_TRIAGE_2026-08-26.md)，成员设计见 [US EPA ECHO](platform-packs/US_EPA_ECHO_NPDES_PLATFORM_PACK_DESIGN.md)、[England EA](platform-packs/ENGLAND_ENVIRONMENT_AGENCY_PUBLIC_REGISTERS_PLATFORM_PACK_DESIGN.md)、[EU/EEA](platform-packs/EU_INDUSTRIAL_EMISSIONS_PORTAL_PLATFORM_PACK_DESIGN.md)、[NSW EPA](platform-packs/NSW_EPA_POEO_PUBLIC_REGISTER_PLATFORM_PACK_DESIGN.md)，组合见 [Public Environmental Permits, Monitoring & Compliance Channel Pack](platform-packs/PUBLIC_ENVIRONMENTAL_PERMITS_MONITORING_COMPLIANCE_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact machine/bulk route-fixture=3、selected/manual=4、callable=0、durable=0；本轮没有请求平台数据行、点位、许可、测量或文档，没有安装/执行第三方项目，也没有产生环境申报或监管副作用。

### 8.27 公共污染场地、责任与清理修复

- US EPA SEMS/Superfund：官方SEMS覆盖1983年以来CERCLA assessment/remediation；NPL、operable unit、ROD、RD/RA、construction completion、post-construction、controls、five-year review、deletion与reuse形成最完整阶段链。construction complete明确不代表final cleanup levels已达到。[SEMS](https://www.epa.gov/enviro/sems-search-user-guide)、[process](https://www.epa.gov/superfund/superfund-cleanup-process)。
- Canada FCSI/FCSAP：只覆盖联邦custodianship或政府接受财务责任的精确人口，daily XML/ZIP与dictionary可作bulk fixture；十步流程允许许多场地在assessment后关闭而无需cleanup，并区分strategy、implementation、confirmatory sampling与long-term monitoring。[FCSI](https://open.canada.ca/data/en/dataset/1d42f7b9-1549-40aa-8ac6-0e0302ff2902)、[DMF](https://www.canada.ca/en/environment-climate-change/services/federal-contaminated-sites/publications/decision-making-framework-version-4-1.html)。
- England Part 2A：potential/historic contamination不等于法定`contaminated land`；普通public registers分散在local authorities，全国EA XLSX只覆盖designated Special Sites子集及termination。[guidance](https://www.gov.uk/government/publications/contaminated-land-statutory-guidance)、[Special Sites dataset](https://environment.data.gov.uk/dataset/f7971865-e434-4743-ab60-51cc25714971)。
- NSW EPA CLM：monthly notified-site XLSX与record of notices是两个population；notification不自动进入significant regulation，record涵盖orders/notices、未完成voluntary proposals、audit statements与ongoing maintenance，并限制自然人信息。[notified list](https://www.epa.nsw.gov.au/Your-environment/Contaminated-land/notified-and-regulated-contaminated-land/list-of-notified-sites)、[record](https://www.epa.nsw.gov.au/Your-environment/Contaminated-land/notified-and-regulated-contaminated-land/record-of-notices)。

候选比较见 [Public Contaminated Sites Triage](platform-packs/PUBLIC_CONTAMINATED_SITES_REMEDIATION_TRIAGE_2026-08-26.md)，成员设计见 [US EPA](platform-packs/US_EPA_SUPERFUND_SEMS_PLATFORM_PACK_DESIGN.md)、[Canada](platform-packs/CANADA_FCSI_FCSAP_PLATFORM_PACK_DESIGN.md)、[England](platform-packs/ENGLAND_PART_2A_CONTAMINATED_LAND_PLATFORM_PACK_DESIGN.md)、[NSW](platform-packs/NSW_CONTAMINATED_LAND_RECORD_PLATFORM_PACK_DESIGN.md)，组合见 [Public Contaminated Sites, Responsibility & Remediation Channel Pack](platform-packs/PUBLIC_CONTAMINATED_SITES_REMEDIATION_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact machine/bulk route-fixture=4、selected/manual=4、callable=0、durable=0；本轮没有请求场地数据行、坐标、parcel、party、notice、document或sampling value，没有安装/执行第三方项目，也没有产生污染通知、联系或监管副作用。

### 8.28 公共饮用水质量、违规与公众警报

- US EPA SDWIS/ECHO：quarterly ZIP固定PWS、facility、service area、events、violations/enforcement与code dictionary；federal层只是primacy data子集且约有三个月lag，Resolved/Archived不能直接解释为current safe。[SDWA downloads](https://echo.epa.gov/tools/data-downloads/sdwa-download-summary)、[dashboard help](https://echo.epa.gov/help/drinking-water-qlik-dashboard-help)。
- England & Wales DWI：annual reports把public/private supply、works/reservoir/zone/tap stages、parameter standards、tests/failures aggregates、company-notified events、DWI classification与legal instruments分开；company submission schema不是public read API。[annual report](https://www.dwi.gov.uk/what-we-do/annual-report/drinking-water-2025/)、[events](https://www.dwi.gov.uk/what-we-do/annual-report/drinking-water-2025/drinking-water-2025-summary-of-the-chief-inspectors-report-for-drinking-water-in-england/drinking-water-quality-events/)。
- Canada ISC First Nations advisories：short/long、BWA/DNC/DNU、building/part/whole-community scope、EPHO recommendation、chief/council issue/rescind及ISC support是不同authority；south-of-60/BC/financial-support coverage不可混合。[advisory process](https://www.sac-isc.gc.ca/eng/1538160229321/1538160276874)、[lifting steps](https://www.sac-isc.gc.ca/eng/1614386700861/1614386717841)。
- New Zealand Taumata Arowai：official Hinekōrako supply register存在2028 registration gap、lapsed与withheld；supplier-reported regulation XLSX与consumer notice taxonomy互补，但public register UI不是documented API。[registers](https://www.taumataarowai.govt.nz/for-the-public/public-registers)、[reports](https://www.taumataarowai.govt.nz/about-us/reports-and-publications/water-services-insights-and-performance)。

候选比较见 [Public Drinking Water Safety Triage](platform-packs/PUBLIC_DRINKING_WATER_SAFETY_ADVISORIES_TRIAGE_2026-08-26.md)，成员设计见 [US EPA](platform-packs/US_EPA_SDWIS_ECHO_PLATFORM_PACK_DESIGN.md)、[DWI](platform-packs/ENGLAND_DWI_DRINKING_WATER_PLATFORM_PACK_DESIGN.md)、[Canada ISC](platform-packs/CANADA_FIRST_NATIONS_DRINKING_WATER_ADVISORIES_PLATFORM_PACK_DESIGN.md)、[Taumata Arowai](platform-packs/NEW_ZEALAND_TAUMATA_AROWAI_DRINKING_WATER_PLATFORM_PACK_DESIGN.md)，组合见 [Public Drinking Water Safety, Compliance & Advisories Channel Pack](platform-packs/PUBLIC_DRINKING_WATER_SAFETY_ADVISORIES_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact machine/bulk route-fixture=2、official report/schema fixture=4、selected/manual=4、callable=0、durable=0；本轮没有请求system、sample、result、violation、event或advisory数据行，没有安装/执行第三方项目，也没有产生公共卫生或供水副作用。

### 8.29 公共环境空气质量、健康警报与污染事件

- US EPA AirNow/AQS：AirNow提供当前/预报AQI、观测与部分advisory机器面，但数据是preliminary且不用于监管；AQS/AirData提供row-level监管监测历史、method/qualifier与后续revision，但不是实时源。zipcode只映射reporting area，当前area observation可由区域内最高报告站点决定。[AirNow API](https://docs.airnowapi.org/)、[AQS API](https://aqs.epa.gov/aqsweb/documents/data_api.html)、[AQS data](https://aqs.epa.gov/aqsweb/documents/about_aqs_data.html)。
- UK Defra UK-AIR：AURN hourly data从provisional/unverified进入QA/QC与ratification；DAQI是1–10、按污染物特定period计算并取五类中最高等级，短期指数不是安全阈值或长期暴露结论。五日forecast描述background并可能漏掉roadside热点，2026服务迁移与第三方地理权利需单独版本化。[AURN](https://www.gov.uk/guidance/air-pollution-monitoring-automatic-urban-and-rural-network-aurn)、[DAQI](https://uk-air.defra.gov.uk/air-pollution/daqi)、[data](https://get-air-pollution-data.defra.gov.uk/)。
- EEA：E1a annual validated与E2a up-to-date unverified是不同产品；European AQI以最多五种污染物的小时值中最差等级表示，缺测可由CAMS downscaled forecast补充但必须显式标明。station、grid、annual legal assessment population不可混用。[datahub](https://www.eea.europa.eu/en/datahub/datahubitem-view/778ef9f5-6293-4846-badd-56a29c70880d)、[European AQI](https://airindex.eea.europa.eu/AQI/?webgl=0)、[download service](https://air.discomap.eea.europa.eu/arcgis/rest/services/AirQuality/AirQualityDownloadServiceEUMonitoringStations/MapServer)。
- Canada ECCC：AQHI 1–10+是短期multi-pollutant health-risk index，real-time observation仍未验证；forecast/amendment、corrected/monthly product与wildfire PM2.5 special mode必须分开。CGNDB community不是station/area，CAP alert中Special Air Quality Statement与Air Quality Advisory有不同发行条件和authority。[AQHI data](https://eccc-msc.github.io/open-data/msc-data/aqhi/readme_aqhi_en/)、[realtime observations](https://api.weather.gc.ca/collections/aqhi-observations-realtime?f=html)、[alerts](https://eccc-msc.github.io/open-data/msc-data/alerts/readme_alerts-datamart_en/)。

候选比较见 [Public Ambient Air Quality & Advisories Triage](platform-packs/PUBLIC_AMBIENT_AIR_QUALITY_ADVISORIES_TRIAGE_2026-08-26.md)，成员设计见 [US EPA](platform-packs/US_EPA_AIRNOW_AQS_PLATFORM_PACK_DESIGN.md)、[UK Defra](platform-packs/UK_DEFRA_AMBIENT_AIR_PLATFORM_PACK_DESIGN.md)、[EEA](platform-packs/EEA_AMBIENT_AIR_PLATFORM_PACK_DESIGN.md)、[Canada ECCC](platform-packs/CANADA_ECCC_AQHI_ALERTS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Ambient Air Quality, Health Advisories & Pollution Events Channel Pack](platform-packs/PUBLIC_AMBIENT_AIR_QUALITY_ADVISORIES_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact official machine/bulk route-fixture=4、official index/methodology fixture=4、official alert/advisory machine-route-fixture=2、selected/manual=4、callable=0、durable=0；本轮只读官方静态文档与固定源码，没有请求observation/index/forecast/alert数据行，没有安装或执行Skill/MCP/开源项目，也未产生监测、报告、订阅、警报或公共卫生副作用。

### 8.30 公共食品场所卫生检查、食源性暴发与关闭/恢复

- NYC DOHMH Restaurant Inspection Results：公开数据以CAMIS标识许可场所，一次检查的字段会按citation重复在多行；当前population只含active restaurants并保留相对最近检查约三年的窗口，`1/1/1900`表示尚未检查。score可能因adjudication改变，grade、action、closure/reopening必须分别保存，reopening后的`P`也不清除历史。[dataset](https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j/)、[grading](https://www.nyc.gov/site/doh/services/restaurant-grades.page)、[grading FAQ](https://www.nyc.gov/assets/doh/downloads/pdf/rii/restaurant-grading-faq.pdf)。
- UK FSA FHRS/FHIS：API v2要求`x-api-version`并提供JSON/XML，另有nightly XML/full download；England/Wales/Northern Ireland使用FHRS 0–5，Scotland使用FHIS Pass/Improvement Required，不能横向换算。component scores只适用于FHRS且rescore时可能缺失，Awaiting Publication/NewRatingPending、identifier变化与private address withholding都要显式保留。[open data](https://ratings.food.gov.uk/open-data?lang=en-US)、[API help](https://api.ratings.food.gov.uk/help)、[scheme](https://www.food.gov.uk/safety-hygiene/food-hygiene-rating-scheme)。
- Toronto DineSafe：官方流程区分minor/significant/crucial；Pass仍可能包含minor，Conditional Pass通常触发24–48小时复检，未纠正的crucial health hazard可关闭且只能由authority恢复。公开页面只显示较近期状态且可能有24–36小时延迟；CKAN catalogue同时发布CSV/XML/JSON、historical ZIP与datastore resource，但package `license_id`与portal OGL声明需在durable route前核对。[DineSafe](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/)、[infractions](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/dinesafe-infractions/)、[terms](https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/dinesafe/dinesafe-terms-of-use/)、[Open Data Licence](https://open.toronto.ca/open-data-licence/)。
- CDC NORS：一行表示一个被报告outbreak，分别保存transmission mode、etiology status、setting、illnesses、known hospitalization denominator、deaths与known death denominator、food vehicle和ingredient。NORS是州/地方/领地卫生部门自愿报告且会在12–18个月closeout后继续修订；outbreak通常指两例以上与共同暴露相关，setting是食品准备类别而非exact premises。[data](https://data.cdc.gov/Foodborne-Waterborne-and-Related-Diseases/NORS/5xkq-dg7x)、[NORS data](https://www.cdc.gov/nors/data/)、[reporting](https://www.cdc.gov/nors/php/reporting/index.html)。

候选比较见 [Public Food Safety Inspections & Outbreaks Triage](platform-packs/PUBLIC_FOOD_SAFETY_INSPECTIONS_OUTBREAKS_TRIAGE_2026-08-26.md)，成员设计见 [NYC DOHMH](platform-packs/NYC_DOHMH_RESTAURANT_INSPECTIONS_PLATFORM_PACK_DESIGN.md)、[UK FSA](platform-packs/UK_FSA_FHRS_FHIS_PLATFORM_PACK_DESIGN.md)、[Toronto DineSafe](platform-packs/TORONTO_DINESAFE_FOOD_PREMISES_PLATFORM_PACK_DESIGN.md)、[CDC NORS](platform-packs/CDC_NORS_FOODBORNE_OUTBREAKS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Food Safety Inspections, Outbreaks, Closures & Reopening Channel Pack](platform-packs/PUBLIC_FOOD_SAFETY_INSPECTIONS_OUTBREAKS_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact official machine/bulk route-fixture=4、official process/methodology fixture=4、closure/reopening lineage route-fixture=2、outbreak route-fixture=1、selected/manual=4、callable=0、durable=0；本轮唯一动态请求是Toronto CKAN catalogue metadata，没有请求inspection/outbreak数据行，没有安装或执行Skill/MCP/开源项目，也未产生投诉、检查、复评、关闭、恢复或公共卫生副作用。

### 8.31 公共交通服务可靠性、运行中断与无障碍

- NYC MTA：按NYC Subway、NYCT/MTA Bus、LIRR、Metro-North固定独立GTFS/GTFS-RT feed与agency；subway VehiclePosition通常在列车开始移动后才出现，不能用missing position推断cancelled。GTFS-RT 2.0 Alerts是FULL_DATASET并有MTA extension；实时全量历史通常不发布，公开performance metrics是另一个aggregate population。[GTFS docs](https://github.com/nymta/gtfs-documentation)、[subway realtime reference](https://api.mta.info/GTFS.pdf)、[alerts](https://www.mta.info/document/90881)、[Open Data Plan](https://www.mta.info/document/85366)。
- TfL：Unified API提供multimodal current/future status、disruption/planned work、arrival prediction、timetable、stop/facility，但facade隐藏的上游source质量和latency仍不同。当前step-free journey需把static topology与Lift Disruptions组合，且部分Thameslink/manual ramp/toilet等coverage不完整；Transport Data Service licence要求token、attribution、500 calls/min和non-endorsement。[Unified API](https://tfl.gov.uk/info-for/open-data-users/unified-api?intcmp=29422)、[step-free specification](https://content.tfl.gov.uk/step-free-access-and-toilet-data-guide.pdf)、[licence](https://tfl.gov.uk/corporate/terms-and-conditions/transport-data-service)。
- MBTA：V3把alerts、predictions、schedules、vehicles、facilities、live facilities和stop events作为独立resource；GTFS pathways/facilities含本地experimental fields且pathway并非全站完整。LAMP另行发布2009年以来GTFS archive、alerts和按service date的performance，页面声明仍可能频繁变化。[V3 portal](https://api-v3.mbta.com/)、[Swagger](https://api-v3.mbta.com/docs/swagger)、[GTFS docs](https://github.com/mbta/gtfs-documentation/)、[LAMP](https://performancedata.mbta.com/)。
- Transport for NSW：Open Data Hub按mode发布Complete/Realtime GTFS、Vehicle Positions、Trip Updates、Alerts、Trip Planner、Location Facilities与Historical GTFS/RT；不同mode更新频率不同。API需要账号/key、默认60,000 calls/day与5/sec且没有sandbox；历史GTFS Studio约九个月窗口，同时portal存在realtime extract技术可用性告警。[documentation](https://opendata.transport.nsw.gov.au/developers/documentation)、[Alerts v2](https://opendata.transport.nsw.gov.au/data/dataset/public-transport-realtime-alerts-v2)、[implementation spec](https://opendata.transport.nsw.gov.au/sites/default/files/2023-08/TfNSW_GTFS_GTFS-R__Implementation_Specification.pdf)、[Hub Terms](https://opendata.transport.nsw.gov.au/sites/default/files/2024-09/TfNSW-Open-Data-Portal-Terms.pdf)。

候选比较见 [Public Transit Service Reliability & Accessibility Triage](platform-packs/PUBLIC_TRANSIT_SERVICE_RELIABILITY_ACCESSIBILITY_TRIAGE_2026-08-26.md)，成员设计见 [NYC MTA](platform-packs/NYC_MTA_TRANSIT_SERVICE_PLATFORM_PACK_DESIGN.md)、[TfL](platform-packs/TFL_UNIFIED_TRANSIT_STATUS_ACCESSIBILITY_PLATFORM_PACK_DESIGN.md)、[MBTA](platform-packs/MBTA_V3_LAMP_TRANSIT_PERFORMANCE_PLATFORM_PACK_DESIGN.md)、[Transport for NSW](platform-packs/TRANSPORT_FOR_NSW_GTFS_REALTIME_PLATFORM_PACK_DESIGN.md)，组合见 [Public Transit Service Reliability, Disruptions & Accessibility Channel Pack](platform-packs/PUBLIC_TRANSIT_SERVICE_RELIABILITY_ACCESSIBILITY_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact official schedule route-fixture=4、exact official realtime route-fixture=4、exact official alert route-fixture=4、accessibility topology-or-facility fixture=3、live facility-status route-fixture=2、official history-or-performance fixture=3、selected/manual=4、callable=0、durable=0；本轮未请求GTFS/GTFS-RT/API数据行，未注册账号/key，未安装或执行Skill/MCP/OSS，也未产生通告、事故报告、预约、订阅、联系或运营副作用。

### 8.32 公共道路事故、伤亡与危险位置

- NHTSA FARS：全国 fatal motor vehicle traffic crash census，只纳入在通常向公众开放 trafficway 上发生且有人在30日内死亡的事故；1975至今 bulk/query、Crash API和annual/final release必须分产品与版本。[FARS definition](https://www.nhtsa.gov/crash-data-systems/fatality-analysis-reporting-system)、[data access](https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars)、[Crash API](https://crashviewer.nhtsa.dot.gov/crashviewer/CrashAPI)、[manuals](https://static.nhtsa.gov/nhtsa/downloads/FARS/Links%20for%20FARS%20Manuals.pdf)。
- NYC Motor Vehicle Collisions：NYPD/NYC Open Data把Crashes `h9gi-nx95`、Vehicles `bm4k-52h4`、Person `f55k-p6yu`分成三种grain；数据可更新、更正或覆盖且portal不保留旧版，contributing factor不等于cause/fault。[Vision Zero Open Data](https://www.nyc.gov/content/visionzero/pages/open-data)、[SODA contract](https://dev.socrata.com/foundry/data.cityofnewyork.us/h9gi-nx95)、[Open Data policies](https://cityofnewyork.github.io/opendatatsm/publicpolicies.html)。
- UK DfT STATS19：1979起公开英国公共道路、向警方报告并记录的人身伤害collision、vehicle与casualty；provisional/final、2011/2024 specification、police/injury-based/adjusted severity、CF/RSF和historical revision必须分层，敏感字段受限。[open data](https://www.gov.uk/government/statistical-data-sets/road-safety-open-data)、[forms/guidance](https://www.gov.uk/government/publications/stats19-forms-and-guidance)、[privacy](https://www.gov.uk/guidance/personal-information-and-data-protection)。
- Transport for NSW：当前五年`CRASH.xlsx`与`TRAFFIC UNIT.xlsx`按年更新；Hub显示login而Data.NSW mirror暴露direct resource和CC BY，access contract必须先canary。description中的person/injury视图不能替代当前manual证明的table grain；Live Traffic Hazards不是历史crash fallback。[NSW Crash Data](https://opendata.transport.nsw.gov.au/data/dataset/nsw-crash-data)、[Data.NSW mirror](https://www.data.nsw.gov.au/data/dataset/2-nsw-crash-data)、[Crash Statistics](https://www.data.nsw.gov.au/data/dataset/2-crash-statistics)。

候选比较见 [Public Road Safety Triage](platform-packs/PUBLIC_ROAD_SAFETY_CRASH_CASUALTY_HAZARD_TRIAGE_2026-08-26.md)，成员设计见 [NHTSA FARS](platform-packs/NHTSA_FARS_ROAD_SAFETY_PLATFORM_PACK_DESIGN.md)、[NYC MVC](platform-packs/NYC_MOTOR_VEHICLE_COLLISIONS_ROAD_SAFETY_PLATFORM_PACK_DESIGN.md)、[UK DfT STATS19](platform-packs/UK_DFT_STATS19_ROAD_SAFETY_PLATFORM_PACK_DESIGN.md)、[Transport for NSW](platform-packs/TRANSPORT_FOR_NSW_CRASH_DATA_ROAD_SAFETY_PLATFORM_PACK_DESIGN.md)，组合见 [Public Road Safety Crashes, Casualties & Hazardous Locations Channel Pack](platform-packs/PUBLIC_ROAD_SAFETY_CRASH_CASUALTY_HAZARD_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact official dataset route-fixture=4、collision fixture=4、traffic-unit fixture=4、person-or-casualty fixture=3、release-or-revision fixture=3、aggregate-or-exposure fixture=3、selected/manual=4、callable=0、durable=0；本轮未请求任何事故/人员/车辆/伤亡/危险数据行或bulk file，未注册账号/token，未安装或执行Skill/MCP/OSS，也未产生报告、报警、联系、执法、道路工程或地图修改副作用。

### 8.33 公共消费价格、通胀与可负担性

- U.S. BLS CPI：Public Data API按series ID返回observations/footnotes，v1匿名、v2注册并有不同daily/series/year limits；CPI-U/W/C-CPI-U、SA/NSA、index/rate和average price分别绑定。average price估计price level，不能用其变化替代CPI。[API v2](https://www.bls.gov/developers/api_signature_v2.htm)、[limits](https://www.bls.gov/developers/api_faqs.htm)、[average prices](https://www.bls.gov/cpi/factsheets/average-prices.htm)、[weights](https://www.bls.gov/cpi/tables/relative-importance/)。
- UK ONS：API按dataset/edition/version/dimensions/options/observation组织，`cpih01`与MM23/quote files是不同route。2026年3月起因scanner data与provider confidentiality，不再发布CPIH/CPI Division 1/2 individual price quotes；剩余quote/aggregated microdata为research用途、非accredited statistic。[API model](https://developer.ons.gov.uk/dataset/)、[observations](https://developer.ons.gov.uk/observations/)、[quote/segment dataset](https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/consumerpriceindicescpiandretailpricesindexrpiitemindicesandpricequotes)、[methods](https://www.ons.gov.uk/economy/inflationandpriceindices/methodologies/consumerpricesindicestechnicalguidance)。
- Eurostat HICP：Statistics API/SDMX/Catalogue提供HICP/HICP-CT、index/rates/contributions与item/country weights。2026采用ECOICOP v2和2025=100，旧`prc_hicp_midx`由`prc_hicp_minr`替代并生成back series；classification/rebase/revision必须保留lineage。[information](https://ec.europa.eu/eurostat/web/hicp/information-data)、[methodology](https://ec.europa.eu/eurostat/web/hicp/methodology)、[API](https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/api)。
- Statistics Canada：WDS区分PID/cube/coordinate/vector/data point与reference/release time；CPI `1810000401`、weights `1810000701`和average prices `1810024501`是不同product。WDS update window可能409，不能解释为zero或商品缺货；average price受rotation/quality/package影响，不是pure inflation。[WDS](https://www.statcan.gc.ca/en/developers/wds/user-guide)、[CPI](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000401)、[weights](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000701)、[average prices](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810024501)。

候选比较见 [Public Consumer Prices Triage](platform-packs/PUBLIC_CONSUMER_PRICE_INFLATION_AFFORDABILITY_TRIAGE_2026-08-26.md)，成员设计见 [BLS CPI](platform-packs/US_BLS_CPI_PUBLIC_DATA_PLATFORM_PACK_DESIGN.md)、[ONS](platform-packs/UK_ONS_CONSUMER_PRICE_INFLATION_PLATFORM_PACK_DESIGN.md)、[Eurostat HICP](platform-packs/EUROSTAT_HICP_PLATFORM_PACK_DESIGN.md)、[Statistics Canada](platform-packs/STATISTICS_CANADA_CPI_WDS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Consumer Prices, Inflation & Affordability Channel Pack](platform-packs/PUBLIC_CONSUMER_PRICE_INFLATION_AFFORDABILITY_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept=4、exact index route-fixture=4、weight route/method fixture=4、average-price=3、quote-microdata=1、source availability posture=2、inventory=0、affordability denominator=0、selected/manual=4、callable=0、durable=0；本轮未请求任何统计data row或bulk/quote/scanner file，未注册key/account，未安装或执行Skill/MCP/OSS，也未产生订阅、联系、统计提交或平台写入。

### 8.34 公共租赁住房成本、空置与负担

- U.S. Census ACS：gross rent、rent-to-income与rental vacancy等period estimate；保留1-year/5-year、universe、geography、estimate/MOE/annotation和table/variable revision，不把ACS空置率解释为live listing。
- UK ONS PIPR：月度private rent price level/index与年度weights；保留achieved/advertised/mixed basis、hedonic/modelled/extrapolated posture、region/property、edition与method cutover，不把index point解释为货币租金。
- Eurostat EU-SILC：housing-cost overburden等可比aggregate；保留persons-in-households population、net-of-allowances housing cost、disposable-income denominator、40% threshold、income reference period、DSD/codelist与quality，不升级为household count或individual hardship。
- Canada CMHC RMS：vacancy、all/occupied/vacant/turnover/non-turnover rent与same-sample change；保留private 3+ unit universe、October reference、availability definition、repeat-turnover policy、significance、reliability和suppression，不升级为unique tenant churn、eviction或全租赁市场。

候选比较见 [Public Rental Housing Cost, Vacancy & Burden Triage](platform-packs/PUBLIC_RENTAL_HOUSING_COST_VACANCY_BURDEN_TRIAGE_2026-08-26.md)，成员设计见 [U.S. Census ACS](platform-packs/US_CENSUS_ACS_RENTAL_HOUSING_COST_PLATFORM_PACK_DESIGN.md)、[UK ONS PIPR](platform-packs/UK_ONS_PIPR_RENTAL_PRICE_PLATFORM_PACK_DESIGN.md)、[Eurostat EU-SILC](platform-packs/EUROSTAT_EU_SILC_HOUSING_COST_BURDEN_PLATFORM_PACK_DESIGN.md)、[Canada CMHC RMS](platform-packs/CANADA_CMHC_RENTAL_MARKET_SURVEY_PLATFORM_PACK_DESIGN.md)，组合见 [Public Rental Housing Cost, Vacancy & Burden Channel Pack](platform-packs/PUBLIC_RENTAL_HOUSING_COST_VACANCY_BURDEN_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact official machine route-fixture=2、official table-or-workbook route-fixture=4、rent-level fixture=3、rent-index fixture=1、vacancy fixture=2、turnover fixture=1、housing-cost-burden fixture=2、estimate-quality fixture=4、selected-manual=4、callable=0、durable=0；本轮只读官方文档/方法/静态route与固定版本源码，没有请求统计data row、API payload或workbook内容，没有注册key/account，没有安装或执行Skill/MCP/OSS，也未产生订阅、联系、调查提交或平台写入。

### 8.35 公共劳动力需求、职位空缺与周转统计

- U.S. BLS JOLTS：last-business-day job openings stock与whole-month hires/quits/layoffs/discharges/other/total separations flow；保留employment+openings denominator、NAICS/ownership/region/state/size、SA/NSA、alignment/model、preliminary/final与annual benchmark revision。
- UK ONS Vacancy Survey：specified-date external-recruitment vacancy、headline SA three-month moving average与NSA X06 single-month；保留GB-to-UK weighting、sector exclusions、无region coverage、CV、late-response revision及2026 old/new denominator cutover。
- Eurostat JVS：paid vacant/occupied posts与JVR；保留enterprise/local-unit、country recording date/period average、NACE/size/population coverage、SA/NSA/direct aggregate adjustment、flash imputation、status/CV与revision。
- Statistics Canada JVWS：first-day-or-upcoming-month vacancy、payroll employees、rate、offered wage与recruitment characteristics；保留location population、monthly one-third sample/quarter distinct positions、NAICS/NOC/SGC、A–F quality、symbol/status/suppression与classification revision。

候选比较见 [Public Labor Demand, Vacancies & Turnover Statistics Triage](platform-packs/PUBLIC_LABOR_DEMAND_VACANCIES_TURNOVER_TRIAGE_2026-08-26.md)，成员设计见 [BLS JOLTS](platform-packs/US_BLS_JOLTS_LABOR_DEMAND_PLATFORM_PACK_DESIGN.md)、[ONS Vacancy Survey](platform-packs/UK_ONS_VACANCY_SURVEY_PLATFORM_PACK_DESIGN.md)、[Eurostat JVS](platform-packs/EUROSTAT_JOB_VACANCY_STATISTICS_PLATFORM_PACK_DESIGN.md)、[Statistics Canada JVWS](platform-packs/STATISTICS_CANADA_JVWS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Labor Demand, Vacancies & Turnover Statistics Channel Pack](platform-packs/PUBLIC_LABOR_DEMAND_VACANCIES_TURNOVER_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact official machine route-fixture=3、official table-or-workbook route-fixture=4、vacancy-stock fixture=4、occupied-or-employment-denominator fixture=4、vacancy-rate fixture=4、hire-flow fixture=1、separation-flow fixture=1、offered-wage fixture=1、recruitment-characteristic fixture=1、estimate-quality fixture=4、selected-manual=4、callable=0、durable=0；本轮只读官方文档/方法/静态route与固定SHA源码，没有请求统计data row、API response、CSV/XLSX/SDMX observation，没有注册key/account，没有安装或执行Skill/MCP/OSS，也未产生订阅、联系、调查提交或平台写入。

### 8.36 公共企业形成、人口学与存续统计

- U.S. Census BFS/BDS：BFS把EIN application、high-propensity subset、actual/projected/spliced 4Q/8Q employer formation与duration分开；BDS按firm/establishment与age/size报告opening/closing、startup/shutdown、employment和job creation/destruction。application不等于operating business或statistical birth，firm age zero也不能由单一新establishment推断。
- UK ONS Business Demography：以VAT/PAYE registered active businesses为人口，报告enterprise birth/death/survival和employer birth/death；active不是未注册企业总量或某日snapshot，employer birth/death也可能只是既有企业跨越雇员边界。death受reactivation调整，provisional/final与workbook correction lineage必须保留。
- Eurostat Business Demography：以enterprise为统计单位，报告active/employer enterprise birth/death/survival、employment与high-growth/young-high-growth；birth/death排除merger、takeover、break-up和restructuring。成员必须固定dataset code、DSD/codelist、T+18/T+20 preliminary与T+30/T+32 final revision standing。
- Statistics Canada MBOC：以有employee/payroll remittance的business为人口，区分opening、continuing、closure、reopening、entrant、temporary closure与exit；closure不等于exit，exit依赖LEAP和最近期projection，最新六个月没有exit。每月历史会因seasonal adjustment和Business Register vintage被修订。

候选比较见 [Public Business Formation, Demography & Survival Triage](platform-packs/PUBLIC_BUSINESS_FORMATION_DEMOGRAPHY_SURVIVAL_TRIAGE_2026-08-26.md)，成员设计见 [U.S. Census BFS/BDS](platform-packs/US_CENSUS_BFS_BDS_BUSINESS_DEMOGRAPHY_PLATFORM_PACK_DESIGN.md)、[UK ONS Business Demography](platform-packs/UK_ONS_BUSINESS_DEMOGRAPHY_PLATFORM_PACK_DESIGN.md)、[Eurostat Business Demography](platform-packs/EUROSTAT_BUSINESS_DEMOGRAPHY_PLATFORM_PACK_DESIGN.md)、[Statistics Canada MBOC](platform-packs/STATISTICS_CANADA_MBOC_PLATFORM_PACK_DESIGN.md)，组合见 [Public Business Formation, Demography & Survival Channel Pack](platform-packs/PUBLIC_BUSINESS_FORMATION_DEMOGRAPHY_SURVIVAL_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact official machine route-fixture=3、official table-or-bulk route-fixture=4、application fixture=1、active-population fixture=4、birth-formation-opening fixture=4、death-closure-exit fixture=4、reopening-or-temporary-closure fixture=1、survival fixture=2、high-growth fixture=1、employment-dynamics fixture=2、estimate-quality fixture=4、selected-manual=4、callable=0、durable=0；本轮只读官方文档/方法/静态catalogue metadata与固定SHA源码，没有请求任何统计observation或bulk/workbook内容，没有申请API key、安装或执行Skill/MCP/OSS，也未产生订阅、联系、统计提交、数据库初始化或平台写入。

### 8.37 公共企业破产、清算与重组统计

- U.S. Courts：F-2按source-defined business/nonbusiness与Bankruptcy Code chapter报告filed cases，F类表另有filed/terminated/pending和district/county grain；one/three/twelve-month ending windows必须分开。Chapter 7/11是procedure，不证明liquidation complete或reorganisation success；PACER case/docket/document是account/fee-bearing separate surface，不作为aggregate fallback。
- UK Insolvency Service：monthly registered company product区分compulsory liquidation、CVL、administration、CVA、receivership及另表moratorium/restructuring plan；annual demography按IDBR business、industry/region/age/employees/turnover报告count/rate。一个business可含多个companies，effective-register company rate与active-business rate不能比较；matching、Unknown exclusion、seasonal和migration revisions必须保留。
- Eurostat：`sts_rb_q`的bankruptcy是legal unit以court declaration开始程序，常为provisional且不必停止经营；current index以2021年平均值为base，EU aggregate按active enterprises加权。registration/bankruptcy declaration、annual enterprise birth/death、quarterly index与annual summed absolute values不得互换。
- Canada OSB：BIA business包括commercial entity，也包括经营负债占total liabilities至少50%的individual；bankruptcy、proposal、receivership和CCAA分program。business rate为每千businesses，assets/liabilities为declared aggregate；individual business不能并入consumer，CCAA closed file不等于商业恢复。

候选比较见 [Public Business Insolvency & Restructuring Triage](platform-packs/PUBLIC_BUSINESS_INSOLVENCY_RESTRUCTURING_TRIAGE_2026-08-26.md)，成员设计见 [U.S. Courts](platform-packs/US_COURTS_BANKRUPTCY_CASELOAD_PLATFORM_PACK_DESIGN.md)、[UK Insolvency Service](platform-packs/UK_INSOLVENCY_SERVICE_COMPANY_BUSINESS_INSOLVENCY_PLATFORM_PACK_DESIGN.md)、[Eurostat](platform-packs/EUROSTAT_QUARTERLY_BANKRUPTCY_DECLARATIONS_PLATFORM_PACK_DESIGN.md)、[Canada OSB](platform-packs/CANADA_OSB_BUSINESS_INSOLVENCY_CCAA_PLATFORM_PACK_DESIGN.md)，组合见 [Public Business Insolvency, Liquidation & Restructuring Statistics Channel Pack](platform-packs/PUBLIC_BUSINESS_INSOLVENCY_LIQUIDATION_RESTRUCTURING_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact official machine route-fixture=1、official table-or-bulk route-fixture=4、filing-or-commencement fixture=4、liquidation fixture=3、reorganization-or-rescue fixture=3、receivership-or-moratorium fixture=2、case-flow fixture=1、outcome fixture=1、rate fixture=2、financial-aggregate fixture=1、estimate-quality fixture=4、selected-manual=4、callable=0、durable=0；本轮只读official documentation、static route/catalogue contract与fixed-SHA source text，没有请求统计observation、data file、case/docket/document、account/key/token或subscription，没有安装或执行Skill/MCP/OSS，也未产生PACER费用、alert、purchase、filing、claim、contact或平台写入。

### 8.38 公共企业信贷需求与融资条件

- Federal Reserve SLOOS：区分C&I/CRE、domestic/foreign panel、standards/terms/demand、firm size、regular/special question与past/current/expected。standards是approval policy，terms是在approval后的条件；positive net percentage对standards表示tightening，对demand表示stronger demand。DDP提供CSV/XML-SDMX但已公告distribution migration，FRED只能是republisher route。
- ECB BLS：quarterly约160家银行、22个standard questions，区分18 backward与4 forward；net percentage、intensity-weighted diffusion index和mean response不能互换。national sample/loan-stock weighting与national-share-to-euro-area weighting形成two-step aggregation，country与euro-area series不可简单平均。
- Bank of England CCS：past three months与expected next three months同行；response intensity按“a lot”双倍计分，再按market share加权为±100 balance。positive方向依question可表示more availability、stronger demand、cheaper/looser terms或higher defaults；HTML/annex XLSX有official file route，但未证实CCS developer API且exact reuse rights需复核。
- Bank of Canada SLOS：current季度页面与Valet `slos` group继续发布overall/price/non-price business conditions；positive balance of opinion表示net tightening。narrative publication在2020停止，历史demand/factors/capital-market access不能自动当作current machine fields；current data continued也不等于publication continuity。

候选比较见 [Public Business Credit Conditions Triage](platform-packs/PUBLIC_BUSINESS_CREDIT_CONDITIONS_TRIAGE_2026-08-26.md)，成员设计见 [Federal Reserve SLOOS](platform-packs/US_FEDERAL_RESERVE_SLOOS_PLATFORM_PACK_DESIGN.md)、[ECB BLS](platform-packs/ECB_BANK_LENDING_SURVEY_PLATFORM_PACK_DESIGN.md)、[Bank of England CCS](platform-packs/BANK_OF_ENGLAND_CREDIT_CONDITIONS_SURVEY_PLATFORM_PACK_DESIGN.md)、[Bank of Canada SLOS](platform-packs/BANK_OF_CANADA_SENIOR_LOAN_OFFICER_SURVEY_PLATFORM_PACK_DESIGN.md)，组合见 [Public Business Credit Demand & Financing Conditions Channel Pack](platform-packs/PUBLIC_BUSINESS_CREDIT_DEMAND_FINANCING_CONDITIONS_CHANNEL_PACK_DESIGN.md)。当前requested=4、concept-fixture=4、exact official machine route-fixture=3、official table-or-bulk route-fixture=4、availability-or-standard fixture=4、current-demand fixture=3、historical-demand fixture=4、price-term fixture=4、non-price-term fixture=4、regular-or-ad-hoc expectation fixture=3、credit-performance fixture=2、reported-driver fixture=4、response-quality fixture=4、selected-manual=4、callable=0、durable=0；本轮只读official documentation/method/terms、static route contract与fixed-SHA source text，没有请求observation或CSV/XML/SDMX/XLS/XLSX/PDF data file，没有申请key/account、安装或执行Skill/MCP/OSS，也未产生subscription、survey submission、loan application、contact或金融/平台写入。

### 8.39 公共企业经营状况、约束与预期

这个Channel补的是企业直接报告的经营状况，而不是从注册、破产、贷款、职位空缺、价格或公司披露反推。稳定共同层包括program/population/statistical unit、question、response scale、measure-specific direction、weighting、time role、estimate quality、release与programme lifecycle；activity、demand/orders、price/cost、workforce、supply-chain、explicit obstacle、resilience/liquidity、confidence/uncertainty、capacity/investment、expectation和planned action保持独立measure。

- U.S. Census BTOS：continuous、每两周发布，panel内企业约每12周报告；core与supplement、current/future index、API与Excel coverage不同，API缺state×sector、URR和supplemental content。
- UK ONS BICS：twice-monthly wave，题目与routing可逐wave变化；count/turnover/employment weights、national/subnational、Wave 1-6 unweighted、Wave 54/92/102 method break必须版本化。
- European Commission BCS business surveys：industry/services/retail/construction的harmonised monthly survey；raw response、balance与confidence/ESI/EEI/uncertainty composite不能互换，partner institute、country/sector weight、SA/NSA与Redisstat migration独立。
- Statistics Canada CSBC：quarterly employer-business survey，区分obstacle、most challenging、expected impact/duration、liquidity、next-3-month与next-12-month plan；2020 crowdsourced edition不与后续probability sample混用。该programme的final collection已在2026夏季进行，final release计划为2026-08-31；截至本轮日期2026-08-26仍不能声明final result已发布。

候选比较见 [Public Business Conditions Triage](platform-packs/PUBLIC_BUSINESS_CONDITIONS_CONSTRAINTS_EXPECTATIONS_TRIAGE_2026-08-26.md)，成员设计见 [U.S. Census BTOS](platform-packs/US_CENSUS_BTOS_PLATFORM_PACK_DESIGN.md)、[UK ONS BICS](platform-packs/UK_ONS_BICS_PLATFORM_PACK_DESIGN.md)、[European Commission Business Surveys](platform-packs/EU_COMMISSION_BUSINESS_CONSUMER_SURVEYS_PLATFORM_PACK_DESIGN.md)、[Statistics Canada CSBC](platform-packs/STATISTICS_CANADA_CSBC_PLATFORM_PACK_DESIGN.md)，组合见 [Public Business Conditions, Constraints & Expectations Channel Pack](platform-packs/PUBLIC_BUSINESS_CONDITIONS_CONSTRAINTS_EXPECTATIONS_CHANNEL_PACK_DESIGN.md)。当前requested=4 / concept-fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / current-activity fixture=4 / demand-or-order fixture=2 / price-cost fixture=4 / workforce fixture=4 / supply-chain-or-input-constraint fixture=4 / explicit-obstacle fixture=4 / resilience-or-liquidity fixture=2 / confidence-or-uncertainty fixture=4 / capacity-utilisation fixture=1 / investment-intention fixture=1 / expectation fixture=4 / planned-action fixture=2 / response-quality fixture=4 / programme-lifecycle fixture=4 / selected-manual=4 / callable=0 / durable=0。本轮只读official documentation/method/terms、static route contract与fixed-SHA source text，没有请求observation或CSV/JSON/SDMX/XLS/XLSX/PDF data file，没有申请key/account、安装或执行Skill/MCP/OSS，也未产生subscription、contact、survey submission或平台写入。

### 8.40 公共企业数字技术采用、能力与障碍

这个Channel回答企业报告的digital connectivity、presence、e-commerce、technology adoption stage、intensity、skills、security、spending、purpose/source、barrier、impact和future support intent。它补充经营压力Channel，却不把technology use当installed inventory、verified deployment、successful implementation或value realised，不把barrier当cause/pain/lead，也不把external support/financing plan当procurement/application。

- Census/NCSES ABS：历史technology module区分not applicable、applicable-not-tested、tested-not-used、used与don't know；当前questionnaire覆盖critical/emerging technologies、AI workforce impact与expertise source。module轮换且2026起ABS/BERD及collection/reference-year命名过渡；questionnaire不等于released estimate。
- UK ONS Digital Economy Survey：internet、web presence、e-commerce、software、cloud、digital-regulatory difficulty和ICT security control；programme已暂停、results archive陈旧且没有domain API。2022 questionnaire存在不证明2022 result存在，2018 electronic mode break需保留。
- Eurostat ICT Usage in Enterprises：annual harmonised programme，10+ enterprises为主population，micro optional；AI/cloud/analytics/IoT/robotics/security/skills与DII按topic cadence和country quality独立。DII的12 components可随year变化，不是raw adoption。
- Statistics Canada SDTIU：2023 questionnaire细分non-use reasons、external implementation、next-12-month support/financing、cloud spend、AI、security和skills；release headline 5+与table中1–4 micro不能互相覆盖，new generative-AI taxonomy不能静默回填旧series。

候选比较见 [Public Business Digital Technology Adoption Triage](platform-packs/PUBLIC_BUSINESS_DIGITAL_TECHNOLOGY_ADOPTION_TRIAGE_2026-08-26.md)，成员设计见 [Census/NCSES ABS](platform-packs/US_CENSUS_ABS_DIGITAL_TECHNOLOGY_ADOPTION_PLATFORM_PACK_DESIGN.md)、[UK ONS Digital Economy Survey](platform-packs/UK_ONS_DIGITAL_ECONOMY_SURVEY_PLATFORM_PACK_DESIGN.md)、[Eurostat ICT Enterprises](platform-packs/EUROSTAT_ICT_USAGE_ENTERPRISES_PLATFORM_PACK_DESIGN.md)、[Statistics Canada SDTIU](platform-packs/STATISTICS_CANADA_SDTIU_PLATFORM_PACK_DESIGN.md)，组合见 [Public Business Digital Technology Adoption, Capability & Barriers Channel Pack](platform-packs/PUBLIC_BUSINESS_DIGITAL_TECHNOLOGY_ADOPTION_CAPABILITY_BARRIERS_CHANNEL_PACK_DESIGN.md)。当前requested=4 / concept-fixture=4 / current-questionnaire fixture=3 / historical-questionnaire fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / internet-or-connectivity fixture=3 / digital-presence fixture=3 / e-commerce fixture=3 / cloud fixture=4 / AI fixture=3 / data-analytics fixture=2 / IoT-or-automation fixture=3 / cybersecurity-control fixture=4 / reported-security-incident fixture=2 / digital-skills-workforce fixture=3 / adoption-purpose-or-source fixture=3 / explicit-adoption-barrier fixture=3 / technology-spend fixture=3 / workforce-or-business-impact fixture=1 / planned-adoption-or-support fixture=1 / composite-digital-intensity fixture=1 / estimate-quality fixture=4 / programme-lifecycle fixture=4 / selected-manual=4 / callable=0 / durable=0。本轮只读official docs/method/questionnaire/terms、static route contract与fixed-SHA source text；未请求observation或data file，未申请key/account，未安装或执行Skill/MCP/OSS，未产生survey submission、subscription、contact、index/materialization或平台写入。

### 8.41 公共企业创新活动、约束与协作

这个Channel回答企业是否引入product/business-process innovation、活动仍在进行或已放弃、创新有多新、投入了什么、由谁开发、与谁合作、使用哪些信息、为何没有或减少创新，以及使用何种公共支持/保护方式。它不把idea、invention、R&D、technology acquisition或innovation-active分类当成成功创新、增长、价值或采购需求。

- Census/NCSES ABS Innovation：U.S. employer company 1+，历史2020–2022结果与current 2023–2025 questionnaire分开；current form覆盖product/process、activity/cooperation、no-activity reasons、barriers、support、cost、turnover share与environmental benefit。ABS/BERD和collection/reference naming处于transition。
- UKIS 2025：DBT owner/ONS administration，voluntary、10+、31,150 sample和IDBR weighted；2025 report于2026-06-04发布，activity window 2022–2024但investment/turnover amount锚定2024，report/questionnaire/XLSX/ODS route齐全但无domain API。
- Eurostat CIS 2022：harmonised HDC、enterprise 10+ core sectors、mandatory/optional question和country deviations；innovation-active可含introduced、completed-not-implemented、ongoing、abandoned或R&D，且CIS不是panel。多数indicator是2020–2022，amount/employment等为2022。
- Statistics Canada SIBS：record 5171、active biennial；current questionnaire覆盖2023–2025、14 sectors、20+/$250k threshold，结果尚未证实发布；latest 2020–2022 tables提供innovation types、cooperation、obstacles/measures、programmes、environmental benefits与IP filing PIDs。

候选比较见 [Public Business Innovation Triage](platform-packs/PUBLIC_BUSINESS_INNOVATION_ACTIVITIES_CONSTRAINTS_COLLABORATION_TRIAGE_2026-08-26.md)，成员设计见 [Census/NCSES ABS Innovation](platform-packs/US_CENSUS_NCSES_ABS_BUSINESS_INNOVATION_PLATFORM_PACK_DESIGN.md)、[UKIS](platform-packs/UK_INNOVATION_SURVEY_PLATFORM_PACK_DESIGN.md)、[Eurostat CIS](platform-packs/EUROSTAT_COMMUNITY_INNOVATION_SURVEY_PLATFORM_PACK_DESIGN.md)、[Statistics Canada SIBS](platform-packs/STATISTICS_CANADA_SIBS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Business Innovation Activities, Constraints & Collaboration Channel Pack](platform-packs/PUBLIC_BUSINESS_INNOVATION_ACTIVITIES_CONSTRAINTS_COLLABORATION_CHANNEL_PACK_DESIGN.md)。当前requested=4 / concept-fixture=4 / current-questionnaire fixture=4 / current-or-latest-published-result fixture=4 / exact official machine route-fixture=3 / official table-or-bulk route-fixture=4 / product-innovation fixture=4 / business-process-innovation fixture=4 / activity-status fixture=4 / novelty fixture=4 / expenditure fixture=4 / turnover-share fixture=4 / developer-source fixture=4 / cooperation fixture=4 / information-source fixture=3 / objective-or-benefit fixture=4 / explicit-barrier fixture=4 / public-support fixture=4 / protection fixture=4 / environmental-benefit fixture=4 / estimate-quality fixture=4 / programme-lifecycle fixture=4 / selected-manual=4 / callable=0 / durable=0。本轮只读official programme/method/questionnaire/report/terms、static route contracts和fixed-SHA source evidence；未请求observation/data file、未申请key/restricted access、未安装或执行Skill/MCP/OSS，也未产生survey submission、contact、materialization/index或平台写入。

### 8.42 公共数字接入、技能与线上参与

这个Channel回答家庭能否接入、个人是否和如何使用、使用何种设备、为何不使用或受限、报告了哪些技能活动和线上任务，以及存在哪些privacy/security/assistance摩擦。它不建立“数字弱势个人”画像，不把aggregate group差异当个人事实，也不把non-use reason当因果、WTP或可定向lead。

- NTIA/Census：periodic CPS Computer and Internet Use Supplement；latest confirmed results为November 2023。Data Explorer按Internet/Device/Non-Use/Connectivity/Activities展示aggregate，2025 information collection只是proposed instrument，不是results；public-use microdata不采用。
- Ofcom：2026 Adults’ Media Use and Attitudes report主要基于2025 Adults’ Media Literacy Tracker。report year、fieldwork/data year、questionnaire、technical report与tables独立；respondent CSV/SAV不进入本Channel，postcode broadband/mobile client是不同domain。
- Eurostat `isoc_i`：annual household/person survey，access在household层，use主要在individual层，核心年龄16–74；e-government/e-commerce为annual core，skills/privacy等按year module。`% households`、`% individuals`与`% users`、activity-based skill composite和country quality不可互换。
- Statistics Canada CIUS：survey 4432、occasional；latest confirmed cycle 2022，15+ ten-province population，electronic questionnaire加telephone follow-up。question ID、3/12-month window、internet-user routing、table PID/status/CV必须固定；PUMF/RDC和health response不进入。

候选比较见 [Public Digital Access Triage](platform-packs/PUBLIC_DIGITAL_ACCESS_SKILLS_ONLINE_PARTICIPATION_TRIAGE_2026-08-26.md)，成员设计见 [NTIA Internet Use](platform-packs/US_NTIA_INTERNET_USE_SURVEY_PLATFORM_PACK_DESIGN.md)、[Ofcom Adults Media Literacy](platform-packs/UK_OFCOM_ADULTS_MEDIA_LITERACY_PLATFORM_PACK_DESIGN.md)、[Eurostat ICT Households/Individuals](platform-packs/EUROSTAT_ICT_HOUSEHOLDS_INDIVIDUALS_PLATFORM_PACK_DESIGN.md)、[Statistics Canada CIUS](platform-packs/STATISTICS_CANADA_CIUS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Digital Access, Skills & Online Participation Channel Pack](platform-packs/PUBLIC_DIGITAL_ACCESS_SKILLS_ONLINE_PARTICIPATION_CHANNEL_PACK_DESIGN.md)。当前requested=4 / concept-fixture=4 / programme-fixture=4 / questionnaire-fixture=4 / latest-published-result-fixture=4 / official-aggregate-route-fixture=3 / official-file-route-fixture=4 / household-access=3 / individual-use=4 / device=4 / non-use-barrier=4 / affordability=4 / reported-quality=3 / skill=4 / communication=4 / commerce=4 / government=4 / health=2 / work-learning=3 / privacy-security=4 / online-harm=2 / assistance-accessibility=3 / composite=3 / quality=4 / lifecycle=4 / selected-manual=4 / callable=0 / durable=0。本轮只读official pages、static route contracts与fixed-SHA source evidence；未请求observation/file、未下载respondent/microdata、未安装或执行Skill/MCP/OSS，也未产生survey/contact/materialization/index或平台写入。

### 8.43 公共家庭支出、消费与预算配置

这个Channel回答家庭/consumer unit在固定分类和调查口径下报告了多少支出、预算份额如何变化、多少单位在窗口内报告某项，以及名义/实际和household characteristics下的结构差异。它不把支出当成使用、需要、偏好、满意、福利、市场规模或个体支付能力。

- BLS CE：Interview每3个月、最多四季度；Diary为连续两个1-week diaries；integrated tables按item选择source。consumer unit不严格等同household，all-CU mean、reporters mean、aggregate、share、weekly/quarterly percent reporting和annualised value必须分开。latest published year为2024。
- ONS LCF/Family Spending：annual UK private-household survey，latest为FYE 2025；五类workbooks提供weekly COICOP支出、income/region/household breakdown和nominal/real view。small sample、multi-year geography与2026对FYE 2023/2024 percentage-SE correction必须进入lineage。
- Eurostat HBS：各国national survey、约五年wave，latest completed comparable wave为2020；2020及之前基于gentlemen’s agreement，2026首次进入Regulation 2019/1700。output harmonisation不代表question/sample/method相同，HBS不能与national-accounts HFCE互填。
- Statistics Canada SHS：2023 results、questionnaire+diary distinct weights、continuous monthly collection与多种recall window，官方estimates annualised/adjusted；tables 11-10-0222-01至0227-01可走WDS/SDMX。2025 questionnaire已fielded但结果不能假定发布。

候选比较见 [Public Household Expenditure Triage](platform-packs/PUBLIC_HOUSEHOLD_EXPENDITURE_CONSUMPTION_BUDGET_ALLOCATION_TRIAGE_2026-08-26.md)，成员设计见 [BLS CE](platform-packs/US_BLS_CONSUMER_EXPENDITURE_SURVEYS_PLATFORM_PACK_DESIGN.md)、[ONS LCF/Family Spending](platform-packs/UK_ONS_FAMILY_SPENDING_LCF_PLATFORM_PACK_DESIGN.md)、[Eurostat HBS](platform-packs/EUROSTAT_HOUSEHOLD_BUDGET_SURVEY_PLATFORM_PACK_DESIGN.md)、[Statistics Canada SHS](platform-packs/STATISTICS_CANADA_SURVEY_HOUSEHOLD_SPENDING_PLATFORM_PACK_DESIGN.md)，组合见 [Public Household Expenditure, Consumption & Budget Allocation Channel Pack](platform-packs/PUBLIC_HOUSEHOLD_EXPENDITURE_CONSUMPTION_BUDGET_ALLOCATION_CHANNEL_PACK_DESIGN.md)。当前requested=4 / concept-fixture=4 / programme-fixture=4 / current-questionnaire-or-instrument-fixture=4 / latest-published-result-fixture=4 / exact-official-machine-route-fixture=2 / official-table-or-workbook-route-fixture=4 / interview-fixture=3 / diary-fixture=4 / integrated-estimate-fixture=3 / consumption-expenditure=4 / non-consumption-flow=2 / income=4 / housing=4 / durable=3 / gift-in-kind=2 / mean/share=4 / percent-reporting=2 / aggregate=3 / nominal=4 / real-or-PPS=2 / equivalised=2 / estimate-quality=4 / lifecycle=4 / selected-manual=4 / callable=0 / durable=0。本轮只读official programme/method/report/table descriptions、static route contracts与fixed-SHA source evidence；未请求observation/file、未下载table/respondent/microdata、未安装或执行Skill/MCP/OSS，也未产生survey/diary/contact/materialization/index或平台写入。

### 8.44 公共时间使用、照护、流动与日常活动配置

这个Channel回答人在固定population、diary instrument、activity classification和estimate denominator下如何配置一个diary day，以及工作、家务、照护、通勤、学习、休息、社交和媒体活动怎样形成aggregate时间挤压候选。它不把时间投入解释为个人routine、effort、burden、productivity、preference、wellbeing、outcome或可购买需求。

- BLS ATUS：从CPS completed households抽取一名15+ designated person，telephone interview一次回忆4 a.m.至次日4 a.m.；一般只记录primary activity，另有secondary childcare。2025 results于2026-06-25发布，annual/multi-year files与LABSTAT TU series是不同route。
- ONS OTUS：March 2024是最新公开dataset edition，状态为official statistics in development且next release未宣布。2023 release记录weekday+weekend online diaries、10-minute main和5-minute secondary设计，但方法必须按edition重新fixture；邀请/collection page不等于published result。
- Eurostat HETUS：national household/person questionnaire加weekday/weekend 10-minute diaries；HETUS 2020以ACL 2018和22个`tus_20` tables发布time spent、participant time、rate、time-of-day、simultaneous activity等。round横跨国家和年份，2020 microdata预计不早于2027。
- Statistics Canada TUS：record 4503为active/every-5-years，2022 target population是十省15+ non-institutional且不住在First Nations reserves的人；collection为2022-07至2023-07，aggregate 2024-06发布、PUMF 2025-03发布。`45-10-0104-*`通过WDS/SDMX访问aggregate，PUMF不进入。

候选比较见 [Public Time Use Triage](platform-packs/PUBLIC_TIME_USE_CARE_MOBILITY_DAILY_ACTIVITY_ALLOCATION_TRIAGE_2026-08-26.md)，成员设计见 [BLS ATUS](platform-packs/US_BLS_AMERICAN_TIME_USE_SURVEY_PLATFORM_PACK_DESIGN.md)、[ONS OTUS](platform-packs/UK_ONS_ONLINE_TIME_USE_SURVEY_PLATFORM_PACK_DESIGN.md)、[Eurostat HETUS](platform-packs/EUROSTAT_HARMONISED_TIME_USE_SURVEYS_PLATFORM_PACK_DESIGN.md)、[Statistics Canada TUS](platform-packs/STATISTICS_CANADA_TIME_USE_SURVEY_PLATFORM_PACK_DESIGN.md)，组合见 [Public Time Use, Care, Mobility & Daily Activity Allocation Channel Pack](platform-packs/PUBLIC_TIME_USE_CARE_MOBILITY_DAILY_ACTIVITY_ALLOCATION_CHANNEL_PACK_DESIGN.md)。当前requested=4 / concept-fixture=4 / programme-fixture=4 / population-fixture=4 / diary-instrument-fixture=4 / classification-fixture=4 / latest-result-fixture=4 / exact-official-machine-route-fixture=3 / official-file-route-fixture=4 / primary-activity=4 / secondary-or-simultaneous=3 / secondary-childcare=2 / population-mean=4 / participant-mean=3 / participation-rate=4 / time-of-day=3 / estimate-quality=4 / lifecycle=4 / selected-manual=4 / callable=0 / durable=0。本轮只读official programme/method/release/route descriptions与fixed-SHA source evidence；未请求observation/file、未下载table/respondent diary/microdata、未安装或执行Skill/MCP/OSS，也未产生survey/recruitment/contact/materialization/index或平台写入。

### 8.45 公共医疗服务可及性、未满足需求与患者报告障碍

这个Channel回答固定population、service、question、window和denominator下，人们是否自报需要医疗服务、是否获得、延迟或未获得，以及报告了哪些成本、等待、距离/交通、预约/可用性、时间照护、偏好或信息障碍。它只生成aggregate access-friction假设；不推断诊断、临床必要性、provider denial、个体脆弱性、客观质量、治疗结果或医疗建议。

- NCHS NHIS：美国household interview programme；unmet need按过去12个月因cost延迟或未获得所需medical care，以及因cost未获得prescription medicines或dental care等明确题义发布。DQS区分final 2019–2024与preliminary 2019–2025 estimates；2025 sample design切换为基于2020 Census，必须建立method-break lineage。
- England GP Patient Survey：2026 results于2026-07-09发布，提供national、region、ICS、PCN和practice CSV/XLSX。16+ registered-patient population、online-first sequential push-to-web、design/nonresponse/calibration weights、online-only question weight与suppression规则必须绑定；2024是新time-series起点，默认不跨接此前结果。
- Eurostat EU-SILC：`hlth_silc_08`、`08b`、`08c`覆盖16+ population过去12个月自报medical/dental need和main reason。too expensive、waiting list、too far/no transport可形成access-barrier composite；每个dataset/indicator必须固定total-population或people-in-need denominator，且不得与EHIS 15+ need-conditional序列互填。
- ABS Patient Experiences：2024–25覆盖GP、specialist、dental、hospital、ED、telehealth、mental health与prescription barriers；target为15+ usual residents in private dwellings，telephone electronic questionnaire。25,368 fully responding persons、2024–25 very-remote/Indigenous Community Strata exclusion、RSE/MOE和proxy状态都进入quality/coverage lineage；DataLab microdata不进入。

候选比较见 [Public Health-Care Access Triage](platform-packs/PUBLIC_HEALTH_CARE_ACCESS_UNMET_NEED_PATIENT_REPORTED_BARRIERS_TRIAGE_2026-08-26.md)，成员设计见 [NCHS NHIS](platform-packs/US_NCHS_NHIS_HEALTH_CARE_ACCESS_PLATFORM_PACK_DESIGN.md)、[England GPPS](platform-packs/ENGLAND_GP_PATIENT_SURVEY_PLATFORM_PACK_DESIGN.md)、[Eurostat EU-SILC](platform-packs/EUROSTAT_EU_SILC_UNMET_HEALTH_CARE_NEEDS_PLATFORM_PACK_DESIGN.md)、[ABS Patient Experiences](platform-packs/AUSTRALIA_ABS_PATIENT_EXPERIENCES_PLATFORM_PACK_DESIGN.md)，组合见 [Public Health-Care Access, Unmet Need & Patient-Reported Barriers Channel Pack](platform-packs/PUBLIC_HEALTH_CARE_ACCESS_UNMET_NEED_PATIENT_REPORTED_BARRIERS_CHANNEL_PACK_DESIGN.md)。当前requested=4 / concept-fixture=4 / programme-fixture=4 / population-fixture=4 / questionnaire-fixture=4 / latest-result-fixture=4 / exact-official-machine-route-fixture=2 / official-file-route-fixture=4 / self-reported-need=4 / delay-or-nonreceipt=4 / cost-barrier=4 / waiting-barrier=3 / distance-or-transport-barrier=2 / availability-or-appointment-barrier=3 / experience=2 / estimate-quality=4 / lifecycle=4 / selected-manual=4 / callable=0 / durable=0。本轮只读official programme/method/questionnaire/result/route descriptions与fixed-SHA source evidence；未请求observation/file、未下载response/microdata、未安装或执行Skill/MCP/OSS，也未产生survey/care contact/health profiling/materialization/index或平台写入。

### 8.46 公共家庭能源可负担性、能源不安全与服务连续性

这个Channel回答固定programme、authority、population、energy service、indicator和denominator下，家庭是否自报能源不安全/无法保暖/欠费，模型是否把家庭计入特定fuel-poverty metric，以及监管汇总中有多少customer accounts处于debt、hardship、payment plan、disconnection或reconnection状态。它不建立个人贫困/脆弱性画像，不提供信贷、福利、住房、能源或医疗资格判断。

- EIA RECS：2024 preliminary housing-characteristics release覆盖occupied primary housing units。HC11.1区分any energy insecurity、减少/放弃food or medicine、unhealthy temperature、disconnect/delivery-stop notice及heating/cooling unavailable；多项可重叠。2024 survey近17,000 responses，consumption/expenditure计划spring 2027发布；preliminary HC不能当final或future consumption result。
- England DESNZ：LILEE要求FPEER D–G且扣除housing costs与required energy costs后的income低于poverty line；required bill不是actual spending。2026 report于2026-08-07 correction，2024 final与2025/2026 projection分开；national accredited、subregional in-development、LILEE、旧LIHC、10% measure和fuel-poverty gap不可互填。
- Eurostat EU-SILC：`ilc_mdes01`为unable to keep home adequately warm，`ilc_mdes07`为utility-bill arrears，`sdg_07_60`固定annual self-reported percentage-of-population interpretation。household answer、person share、poverty-status breakdown及更宽mortgage/rent/utility arrears composite必须分开。
- Australia AER：Retail Performance Reporting按季度/年度发布customer numbers、debt、payment plans、hardship、concessions、disconnections/reconnections。2025-07-01 current guideline采用flat CSV submission，public release按Schedules 2/3/4/6分XLSX；jurisdiction、fuel、customer class、retailer、residential/hardship account denominator和sensitive schedule不可互填。

候选比较见 [Public Household Energy Triage](platform-packs/PUBLIC_HOUSEHOLD_ENERGY_AFFORDABILITY_INSECURITY_SERVICE_CONTINUITY_TRIAGE_2026-08-26.md)，成员设计见 [EIA RECS](platform-packs/US_EIA_RECS_ENERGY_INSECURITY_PLATFORM_PACK_DESIGN.md)、[England DESNZ](platform-packs/ENGLAND_DESNZ_FUEL_POVERTY_PLATFORM_PACK_DESIGN.md)、[Eurostat EU-SILC](platform-packs/EUROSTAT_EU_SILC_ENERGY_POVERTY_PLATFORM_PACK_DESIGN.md)、[Australia AER](platform-packs/AUSTRALIA_AER_RETAIL_ENERGY_PERFORMANCE_PLATFORM_PACK_DESIGN.md)，组合见 [Public Household Energy Affordability, Insecurity & Service Continuity Channel Pack](platform-packs/PUBLIC_HOUSEHOLD_ENERGY_AFFORDABILITY_INSECURITY_SERVICE_CONTINUITY_CHANNEL_PACK_DESIGN.md)。当前requested=4 / concept-fixture=4 / programme-fixture=4 / authority-fixture=4 / population-fixture=4 / indicator-or-schedule-fixture=4 / latest-result-fixture=4 / exact-official-machine-route-fixture=1 / official-file-route-fixture=4 / self-reported-insecurity=2 / modelled-fuel-poverty=1 / warmth-inability=1 / utility-arrears=1 / customer-debt=1 / hardship=1 / disconnect-reconnect=2 / amount-role=3 / estimate-quality=4 / lifecycle=4 / selected-manual=4 / callable=0 / durable=0。本轮只读official programme/method/questionnaire/model/guideline/result/route/rights descriptions与fixed-SHA source evidence；未请求observation/file、未下载respondent/customer/microdata、未申请key、未安装或执行Skill/MCP/OSS，也未产生assistance/contact/materialization/index或平台写入。

## 9. 应用与产品评论

评论适合发现已采用产品后的故障、缺失功能、价格不满和迁移原因。需要区分：

- 自有产品：官方 API/授权 export，可关联版本和开发者回复；P0。读取与回复必须分 capability，回复不是 Probe。
- 竞品公开评论：研究价值高，但官方 API 通常不为任意竞品提供完整导出；采用人工、授权数据服务或经条款审查的公开页面 adapter；P1。
- 评论者昵称、设备等非需求字段默认删除或去标识化。

### 9.1 Apple App Store Connect

Customer Reviews API 可列举自有 app 或特定 App Store version 的当前书面评论，按 territory/rating 过滤并读取 response relationship。用户编辑会使最新提交替换此前提交，所以重复采集只能保存 observed snapshots，不能声称获得完整平台编辑历史。overview rating 和 Apple 生成的 review summarization 与单条书面评论分开建模。

- 官方：[Customer Reviews](https://developer.apple.com/documentation/appstoreconnectapi/customer-reviews)
- 官方：[Ratings and reviews overview](https://developer.apple.com/help/app-store-connect/monitor-ratings-and-reviews/ratings-and-reviews-overview)
- Platform Pack：[Apple App Store Connect Reviews](platform-packs/APPLE_APP_STORE_CONNECT_REVIEWS_PLATFORM_PACK_DESIGN.md)
- 建议：owned `official-api` P0 read-only；Customer Review Responses 虽是官方能力，但作为独立客服 write deferred，不进入需求采集 Skill。

### 9.2 Google Play Developer

Reply to Reviews API 只返回 production app、含文字且最近一周新建或修改的评论；无文字 rating、alpha/beta 反馈和更旧未修改评论不在 list population。历史评论需通过 Play Console 月度 Reviews CSV/私有 GCS report 补充，且报告有 3–7 天延迟。API 与 export 必须分别记录 representation 和 coverage。

- 官方：[Reply to Reviews](https://developers.google.com/android-publisher/reply-to-reviews)
- 官方：[Download and export monthly reports](https://support.google.com/googleplay/android-developer/answer/6135870)
- Platform Pack：[Google Play Developer Reviews](platform-packs/GOOGLE_PLAY_DEVELOPER_REVIEWS_PLATFORM_PACK_DESIGN.md)
- 建议：recent owned `official-api` P0；历史 `authorized-export/manual-import` P0/P1；reply deferred，且不把自动回复作为需求 Probe。

两个成员的组合设计见 [Owned App Reviews Channel Pack](platform-packs/OWNED_APP_REVIEWS_CHANNEL_PACK_DESIGN.md)。组合只统一 roster、痛点 projection、版本回归分析、去身份化和 coverage；不合并原生 review identity，不把同名 app 自动认作同一产品。

开源 scraper 可用于 fixture 与字段研究，不作为“官方能力”证据：

- [JoMingyu/google-play-scraper](https://github.com/JoMingyu/google-play-scraper/tree/ce1df6d67e6d8c39826daac2f668808fc025f284) `ce1df6d67e6d8c39826daac2f668808fc025f284`
- [facundoolano/app-store-scraper](https://github.com/facundoolano/app-store-scraper/tree/05d59c110240104901fa47622f64a7c6ed841a3b) `05d59c110240104901fa47622f64a7c6ed841a3b`
- [dbott23/appstore-reviews-scraper](https://github.com/dbott23/appstore-reviews-scraper)

前两项 revision 于 2026-08-26 只读固定，均为非官方 public surface；不得进入 Owned App Reviews Channel runtime 或借用官方 API 的授权结论。

### 9.3 公开扩展市场评论

Mozilla AMO、Chrome Web Store 与 JetBrains Marketplace 都可能暴露扩展采用后的兼容性、升级回归、缺失能力与迁移原因，但官方自动读取面并不对等：

- Mozilla [Add-ons Server v4](https://mozilla.github.io/addons-server/topics/api/v4_frozen/index.html)是 frozen API，公开 add-on search/detail/version 与 rating list/detail 可形成 fixture-eligible design；rating 正文可空，默认 add-on list 只给每用户最新一条，reply 与 aggregate 需分对象；
- [Chrome Web Store API v2](https://developer.chrome.com/docs/webstore/api)面向开发者管理自己的 extension，未提供官方 public review read surface；
- [JetBrains Marketplace API](https://plugins.jetbrains.com/docs/marketplace/api-reference.html)未列出 review read endpoint，公开 Reviews Policy 不能替代 Connector 合同。

候选分流见 [Public Extension Marketplace Feedback Triage](platform-packs/PUBLIC_EXTENSION_MARKETPLACE_FEEDBACK_TRIAGE_2026-08-26.md)，首个设计见 [Mozilla AMO Public Feedback Platform Pack](platform-packs/MOZILLA_AMO_PUBLIC_FEEDBACK_PLATFORM_PACK_DESIGN.md)，组合/missing-member设计见 [Public Extension Marketplace Feedback Channel Pack](platform-packs/PUBLIC_EXTENSION_MARKETPLACE_FEEDBACK_CHANNEL_PACK_DESIGN.md)。当前 requested=3、fixture-eligible=1、callable=0；不使用 HTML、Cookie、browser、MCP、Skill 或 scraper fallback，不发布评论、评分、回复或 flag。

该场景促成通用 `ProductFeedback*` representation：owned Apple/Google 与 public AMO 共享 review/rating-only/reply/aggregate/latest/version 语义，但 Channel roster、rights、授权、population 和 coverage 必须完全隔离。

### 9.4 B2B 软件评价与切换证据

G2、Capterra和TrustRadius的review结构化程度较高，可表达use case、pros/cons、problems solved、recommendation、reason for choosing和switched-from，但公开可见性不提供自动采集、存储、索引或AI分析权。公开网页、subscription API、vendor-owned export、licensed quote、buyer intent和competitive intelligence必须分成独立populations。

- [G2 API](https://documentation.g2.com/docs/g2-api)和[official MCP](https://documentation.g2.com/docs/g2-mcp-server)提供订阅/OAuth数据面，但MCP同时包含Research Board writes；2026-07-09 Terms对未经书面同意的automated collection/storage/index和AI用途设置明确限制。
- Capterra / Digital Markets未发现通用public review API；Reviews Insights、own-product Download Tool和licensed competitor comparison各有独立内部/内容用途限制。
- [TrustRadius vendor API](https://apidocs.trustradius.com/docs/public-api/YXBpOjUxMzgzNjA-trust-radius-api)提供product score、licensed TrustQuotes、traffic/intent等不同datasets；TrustQuote只是licensed excerpt，不是full public review feed。

候选分流见 [Public B2B Software Review Triage](platform-packs/PUBLIC_B2B_SOFTWARE_REVIEW_TRIAGE_2026-08-26.md)，成员设计见 [G2](platform-packs/G2_B2B_SOFTWARE_REVIEW_PLATFORM_PACK_DESIGN.md)、[Capterra](platform-packs/CAPTERRA_B2B_SOFTWARE_REVIEW_PLATFORM_PACK_DESIGN.md)、[TrustRadius](platform-packs/TRUSTRADIUS_B2B_SOFTWARE_REVIEW_PLATFORM_PACK_DESIGN.md)，组合见 [Public B2B Software Review Channel Pack](platform-packs/PUBLIC_B2B_SOFTWARE_REVIEW_CHANNEL_PACK_DESIGN.md)。当前requested=3、fixture-eligible=2、callable=0；未连接API/MCP、未登录/export、未读取review，不使用scraper fallback。

### 9.5 公开监管投诉与事故报告

监管投诉补充的是“问题已被提交给公共机构”的过程证据，不是更高真实性等级。NHTSA ODI、CFPB Consumer Complaint Database 与 CPSC SaferProducts 分别覆盖车辆安全、金融服务和消费品事故，但 publication、根记录、企业回应、影响声明、身份字段与人口完全不同。

- [NHTSA complaints data/API](https://www.nhtsa.gov/nhtsa-datasets-and-apis)提供按车型/ODI查询和daily bulk；[field dictionary](https://static.nhtsa.gov/odi/ffdd/cmpl/CMPL.txt)揭示一项ODI可对应多component rows、记录可更新、2021空值语义变化和2026新增直接身份字段；
- [CFPB 2026-08-14 announcement](https://www.consumerfinance.gov/about-us/newsroom/the-cfpb-to-cease-discretionary-publication-of-complaint-narratives-and-visualizations/)停止数据库中的未核验叙述/可视化，与较旧主页/field/API docs冲突，当前为drift-blocked；
- [CPSC Data](https://www.cpsc.gov/Data)和SaferProducts提供public search/export，但本轮未固定当前unsafe-report API、schema和复用合同，保留manual/contract gate。

候选分流见 [Public Regulatory Complaints Triage](platform-packs/PUBLIC_REGULATORY_COMPLAINTS_TRIAGE_2026-08-26.md)，首个设计见 [NHTSA Vehicle Safety Complaints Platform Pack](platform-packs/NHTSA_VEHICLE_SAFETY_COMPLAINTS_PLATFORM_PACK_DESIGN.md)，组合见 [Public Regulatory Complaints Channel Pack](platform-packs/PUBLIC_REGULATORY_COMPLAINTS_CHANNEL_PACK_DESIGN.md)。当前requested=3、fixture-eligible=1、callable=0；不下载live bulk、不调用API/HTML/MCP、不读取VIN或身份字段、不提交投诉。

### 9.6 企业、门店与服务体验反馈

Google Business Profile、Google Places、Yelp与Trustpilot覆盖了自有门店历史、公共地点相关性样本、短评论节选/provider answer和商业评论feed，但它们不是同一个“评论接口”：

- [Google Business Profile Reviews](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list)只覆盖principal获授权管理的已验证地点，且标准政策不足以支持默认长期聚合；
- [Google Places](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places)最多返回5条相关性评论，必须署名并保留来源入口，不能当作full corpus；
- [Yelp Places](https://docs.developer.yelp.com/docs/places-intro)通常只给少量短节选，普通API Terms限制生成式AI/派生NLP用途；官方AI API/MCP是独立contract与provider-answer representation；
- [Trustpilot Data Solutions](https://developers.trustpilot.com/data-solutions-get-started)把Display latest-5和Insights full feed分开，未来存储还需按Deletions API传播删除。

分诊见 [Business Experience Feedback Triage](platform-packs/BUSINESS_EXPERIENCE_FEEDBACK_TRIAGE_2026-08-26.md)，成员设计见 [Google Business Profile](platform-packs/GOOGLE_BUSINESS_PROFILE_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md)、[Google Places](platform-packs/GOOGLE_PLACES_BUSINESS_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md)、[Yelp](platform-packs/YELP_BUSINESS_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md)、[Trustpilot](platform-packs/TRUSTPILOT_BUSINESS_EXPERIENCE_FEEDBACK_PLATFORM_PACK_DESIGN.md)，组合见 [Business Experience Feedback Channel Pack](platform-packs/BUSINESS_EXPERIENCE_FEEDBACK_CHANNEL_PACK_DESIGN.md)。当前requested=4、fixture-eligible=4、callable=0、durable=0；未调用API/MCP、未读取真实评论、未安装开源候选，也不发布回复/评分/flag/预订/询价。

## 10. 社交与内容平台

小红书、抖音、B站、微博、微信公众号、视频号、YouTube、TikTok、Instagram、Reddit 等官方能力和开源候选已在以下文件中维护，本调研不复制第二份易漂移矩阵：

- [平台接入矩阵](PLATFORM_MATRIX.md)
- [Adapter 生态与平台能力交叉调研](ADAPTER_CATALOG_SURVEY.md)
- [开源项目评估](OPEN_SOURCE_LANDSCAPE.md)
- [抖音需求研究运行手册](DOUYIN_RESEARCH_RUNBOOK.md)

通用判断：社交平台擅长语言、场景、情绪和传播性；交易、招聘、采购和一方数据更擅长证明行动、预算和支付。Opportunity 必须混合不同证据类型，不能用社媒声量替代商业需求。

已有重要 GitHub 候选：

- [NanmiCoder/MediaCrawler](https://github.com/NanmiCoder/MediaCrawler)：多平台研究 sidecar；当前仓库已固定用于抖音非商业研究纵切，许可与平台风险保持隔离。
- [xpzouying/xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp)：小红书浏览器自动化/MCP 研究样本；Cookie/浏览器模式不等于官方 API。
- [Postiz](https://github.com/gitroomhq/postiz-app)：国际多平台委托发布候选；AGPL 边界和每个平台能力需要逐项审计。
- [multi-platform-publisher](https://github.com/mguozhen/multi-platform-publisher)：国内外发布方式和 manual/HITL 设计参考；不能整体授予账号权限。

## 11. 主动 Probe 渠道判断

“能发布”不等于“适合验证”。推荐按归因、真实性和行动接近度排序：

| Probe | 适合验证 | 主要指标 | 风险/限制 | 建议 |
| --- | --- | --- | --- | --- |
| 自有 landing page/waitlist | 定位、CTA、留资、定价 | visit、CTA、qualified lead、deposit | 流量来源偏差 | P0 |
| 自有产品受控实验 | onboarding、feature、offer、workflow treatment | real exposure、primary、guardrail、SRM | 用户影响、统计误用、stop会改serving | P0-design；live逐能力授权 |
| 授权邮件/已有用户邀请 | 现有受众问题与方案 | reply、interview、conversion | 需 consent/退订 | P0 |
| 问卷/访谈招募 | 问题理解、替代方案、支付边界 | 完成率、回答、预约 | 陈述偏差 | P0 |
| 闲鱼/eBay真实自有报价 | 标题、交付、价格机制、询盘 | 平台各自定义的曝光/收藏或watch/咨询或offer/订单/退款 | 必须真实可履约；eBay禁止want ad/placeholder且逐write审批 | P0-design/P1 |
| 真实付费服务请求 | 问题、交付、预算和服务方响应 | qualified proposal、interview、offer、contract、milestone/payment | 必须确实准备hire/pay；ghost/free job禁止；Upwork当前无可执行route | P0-design；live逐平台授权 |
| 小红书/抖音/B站内容 CTA | 语言、场景、传播与兴趣 | 完播、收藏、评论、CTA | 代理指标多 | P0 |
| GitHub/V2EX/知乎社区 | 技术需求、demo、早期采用者 | issue、discussion、试用、反馈 | 禁止无关推广 | 垂直 P0/P1 |
| Product Hunt/Show HN | 产品定位和首发反馈 | visit、signup、qualified use | 样本偏早期采用者 | 出海 P1 |
| 小额搜索广告 | 高意图 query、landing/offer | impression、click、lead、CAC | 需要预算与广告合规 | P1 |
| BOSS 虚假职位 | 无合法真实性基础 | 无 | 欺骗、平台与招聘风险 | 禁止 |
| 采购门户发虚假需求 | 无合法采购事实 | 无 | 严重治理风险 | 禁止 |

Probe 基础设施候选：

- [GrowthBook](https://github.com/growthbook/growthbook)：自有产品 A/B、指标和 SRM 等统计能力；作为外部 experiment engine，而非跨渠道事实源。
- [Formbricks](https://github.com/formbricks/formbricks)：问卷和站内反馈执行面；response 回流仍需保存 source/consent/experiment revision。
- [Postiz](https://github.com/gitroomhq/postiz-app)：社交发布委托层；DSH 继续拥有 ProbePlan、批准、receipt 与 reconciliation。

## 12. 通用开源接入组件

| 项目 | 适用位置 | 可借鉴 | 不能替代 | 建议 |
| --- | --- | --- | --- | --- |
| [RSSHub](https://github.com/DIYgod/RSSHub) | public/community feed ingress | 大量 route、统一 feed | 官方授权、稳定 SLA | HTTP 委托；逐 route 健康/许可 |
| [Airbyte](https://github.com/airbytehq/airbyte) | 大规模 replication | catalog、state、增量、schema | 需求领域和 Probe | 外部 ingress 服务候选 |
| [dlt](https://github.com/dlt-hub/dlt) | 官方 REST API wrapper | 分页、增量、schema、目的地 | 平台 scope、发布语义 | 轻量 ingress spike 候选 |
| [Crawl4AI](https://github.com/unclecode/crawl4ai) | 白名单网页 | 结构化提取 | 网站许可与访问授权 | 仅允许白名单公开网页 |
| [JobSpy](https://github.com/speedyapply/JobSpy) | 招聘字段/失败研究 | 统一 JobPost schema | 官方授权、稳定 API | reference，不进默认 runtime |
| [Postiz](https://github.com/gitroomhq/postiz-app) | delegated probe/publish | OAuth、媒体、调度、平台 schema | DSH 批准与事实账本 | 国际发布 spike |
| [GrowthBook](https://github.com/growthbook/growthbook) | 自有产品实验 | 分流、统计、指标 | 跨平台 Probe ledger | external experiment adapter |
| [Formbricks](https://github.com/formbricks/formbricks) | survey/probe | 问卷、站内/邮件触达 | 机会分析和证据仓库 | external survey adapter |

任何项目进入复用前必须固定 commit/tag，并审计 LICENSE、账号/secret、网络目标、遥测、SSRF/上传、删除、撤权、限流、误报成功和上游维护状态。

## 13. 推荐 channel packs

### 13.1 通用基础包

1. manual import：URL、CSV、Markdown、附件；
2. RSS/Atom/JSON Feed；
3. 自有客服、销售、访谈、表单；
4. Owned Search Intent Channel（外部搜索引擎曝光）；
5. Owned Site Search Intent Channel（自有产品/站点内搜索）；
6. External Search Demand & Trends Channel（Google Trends/Ads/Microsoft fixture-eligible；百度contract/schema-blocked；当前无callable成员）；
7. Owned Product Request Channel（自有feature/bug/improvement需求板）；
8. Owned Customer Conversation Channel；
9. Owned Customer Correspondence Channel；
10. Authorized Customer Community Channel；
11. Public Software Issues / Maintenance Friction Channel；
12. Public Technical Discussions / Problem Solving Channel（Stack Exchange/HN policy-gated；知乎contract-gated；V2EX purpose-gated；当前无callable成员）；
13. Public Early-Adopter Product Discovery Channel（Reddit approval-gated；Product Hunt commercial-partner-only）；
14. Public Extension Marketplace Feedback Channel（AMO fixture-only；Chrome unsupported；JetBrains manual/policy-gated）；
15. Public Regulatory Complaints Channel（NHTSA fixture-only；CFPB drift-blocked；CPSC manual/contract-gated）；
16. Owned Product Reliability Channel（Sentry/Crashlytics fixture-only；diagnostic privacy/grouping gate）；
17. Public Procurement Demand & Contract Execution Channel v0.3（七成员concept fixture；六成员route-fixture；CCGP manual-only；当前无callable/durable成员）；
18. Public Funding Priorities & Funded R&D Channel（Grants.gov/NIH/EU/SBIR fixture-eligible；当前无callable/durable成员）；
19. Public Rulemaking & Consultation Pressure Channel（五成员concept fixture；Regulations.gov/Federal Register/GOV.UK route-fixture-eligible；当前无callable/durable成员）；
20. Public Corporate Disclosures & Investment Priorities Channel（五成员concept fixture；SEC/Companies House/HKEX IIS route-fixture-eligible；当前无callable/durable成员）；
21. Public Technical Standards & Compatibility Change Channel（五成员concept fixture；IETF/W3C native与WHATWG/TC39 provider route-fixture-eligible；当前无callable/durable成员）；
22. Public Product Recalls & Corrective Actions Channel（五成员concept fixture；FDA/NHTSA/CPSC/Canada route-fixture-eligible；Safety Gate manual-export fixture；当前无callable/durable成员）；
23. Public Research Literature & Reported Limitations Channel（五成员concept+metadata route fixture；rights-cleared content=0；当前无callable/durable成员）；
24. Public Clinical Study Registries & Reported Constraints Channel（五成员concept fixture；ClinicalTrials.gov/WHO/ISRCTN route-fixture-eligible；CTIS/DRKS manual fixture；当前无callable/durable成员）；
25. Public Medicine Supply Shortages & Availability Constraints Channel（五成员concept fixture；FDA/Canada/TGA/UK route-fixture-eligible；EMA selected-record fixture；当前无callable/durable成员）；
26. Public Regulatory Enforcement & Remedial Obligations Channel（五成员concept fixture；EPA/SEC/CMA route-fixture-eligible；CFPB/FTC selected-record fixture；当前无callable/durable成员）；
27. Public Ombudsman Determinations & Reported Remedies Channel（四成员concept fixture；Housing route-fixture-eligible；FOS/TPO/FSPO selected-record fixture；当前无callable/durable成员）；
28. Public Audit Findings, Recommendations & Follow-up Channel（五成员concept fixture；GAO/ECA route-fixture-eligible；NAO/ANAO/Canada OAG selected-record fixture；当前无callable/durable成员）；
29. Public Civic Service Requests & Reported Dispositions Channel（四成员concept+route fixture；当前无callable/durable成员）；
30. Public Petitions, Support & Official Responses Channel（四成员concept fixture；UK/Senedd route fixture；Scotland/EU selected-record fixture；当前无callable/durable成员）；
31. Public Participatory Budgeting Proposals, Priority & Execution Channel（四成员concept fixture；Paris winner与NYC historical route fixture；Barcelona/Madrid provider-schema candidate；当前无callable/durable成员）；
32. Public Information Access Requests, Public-Body Responses & Releases Channel（四成员concept fixture；FragDenStaat exact-member route fixture；WhatDoTheyKnow/AskTheEU provider candidate；MuckRock source candidate；当前无callable/durable成员）；
33. Public Planning Applications, Representations & Decisions Channel（四成员concept fixture；England/NYC/Ireland exact route fixture；NSW catalogue/schema/manual；当前无callable/durable成员）；
34. Public Business Credit Demand & Financing Conditions Channel（四成员concept fixture；Fed/ECB/BoC exact machine route fixture；BoE table/file fixture；当前无callable/durable成员）；
35. Public Business Conditions, Constraints & Expectations Channel（四成员concept/table-or-bulk fixture；BTOS/EC BCS/CSBC exact machine route fixture；当前无callable/durable成员）；
36. Public Business Digital Technology Adoption, Capability & Barriers Channel（四成员concept/questionnaire/table fixture；ABS/Eurostat/SDTIU exact machine route fixture；ONS paused/archive；当前无callable/durable成员）；
37. Public Business Innovation Activities, Constraints & Collaboration Channel（四成员concept/questionnaire/latest-result fixture；ABS/Eurostat/SIBS exact machine route fixture；UKIS official report/workbook；当前无callable/durable成员）；
38. Public Digital Access, Skills & Online Participation Channel（四成员concept/questionnaire/latest-result fixture；NTIA/Eurostat/StatsCan aggregate route fixture；Ofcom official report/table；当前无callable/durable成员）；
39. Public Household Expenditure, Consumption & Budget Allocation Channel（四成员concept/instrument/latest-result fixture；Eurostat/StatsCan aggregate route fixture；BLS/ONS official table/workbook；当前无callable/durable成员）；
40. Public Time Use, Care, Mobility & Daily Activity Allocation Channel（四成员concept/diary/classification/latest-result fixture；BLS/Eurostat/StatsCan aggregate route fixture；ONS official page/XLSX；当前无callable/durable成员）；
41. Public Health-Care Access, Unmet Need & Patient-Reported Barriers Channel（四成员concept/questionnaire/latest-result fixture；NHIS/Eurostat aggregate route fixture；GPPS/ABS official CSV/XLSX；当前无callable/durable成员）；
42. Public Household Energy Affordability, Insecurity & Service Continuity Channel（四成员concept/indicator/latest-result fixture；Eurostat aggregate route fixture；RECS/DESNZ/AER official PDF/XLSX/ODS/CSV；当前无callable/durable成员）；
43. evidence warehouse + hybrid retrieval；
44. landing/manual-package Probe。

### 13.2 消费与本地服务包

- 小红书、抖音、B站；
- 知乎；
- 闲鱼 manual observation + truthful Probe；
- Taskrabbit、Thumbtack与猪八戒本地fixtures；验证Local Service与三成员Service Work Channel的zero-member/missing-report契约；
- 电商/应用评论；
- 自有 landing、表单和客服。

### 13.3 开发者工具包

- GitHub Issues/Discussions；
- GitLab Software Work Items（GitLab.com bulk blocked；Self-Managed按协议与授权）；
- V2EX；
- Stack Exchange；
- Hacker News；
- Reddit（取得与用途匹配的明确批准后；当前无 route）；
- Product Hunt（商业/API 批准与 schema conformance 后只读；真实自有产品仅人工首发包）；
- IETF/W3C/WHATWG/TC39/OpenJDK标准与平台演进synthetic fixtures（只读process/metadata/source语义，当前零callable成员）；
- FDA/NHTSA/CPSC/EU Safety Gate/Canada产品召回与纠正行动synthetic fixtures（不读VIN、不把hazard/class/status升级为因果或完成）；
- Crossref/OpenAlex/PubMed/Europe PMC/arXiv科研文献synthetic fixtures（只验证metadata/identity/version/rights，不读取论文）；
- ClinicalTrials.gov/WHO/ISRCTN/CTIS/DRKS临床研究注册synthetic fixtures（不读contact/site/IPD、不做patient matching或医疗判断）；
- FDA/Canada/EMA/TGA/UK DHSC药品供应短缺synthetic fixtures（不读联系人/患者/处方/库存、不做替代或医疗建议）；
- EPA ECHO/CFPB/FTC/SEC/UK CMA监管执法synthetic fixtures（分离allegation/finding/admission、finality与obligation，不读自然人/受害者/证人、不写平台）；
- Show HN（当前不生成或人工交接 AI 文本）。

### 13.4 B2B 与企业软件包

- 自有销售、CRM、输单、支持；
- Zoom/Gong 授权客户会话与人工访谈；
- Gmail/Graph Mail授权客户邮件（metadata-first）；
- Slack/Discord授权客户社区（Slack internal-first；Discord policy-blocked）；
- Stripe/Chargebee 等自有订阅结果；
- PostHog/Amplitude 等自有产品使用聚合；
- Greenhouse/Lever 等目标公司公开 ATS；
- BOSS 用户主动提供的最小职位 evidence package 候选（零平台 route）；
- SAM.gov/TED/FTS/CCGP/USAspending/Canada/Prozorro公共采购synthetic fixtures（分离requirement/award/contract/execution与amount roles，当前零callable成员）；
- Public Technical Standards & Compatibility Change synthetic fixtures；
- Public Product Recalls & Corrective Actions synthetic fixtures；
- Public Research Literature & Reported Limitations synthetic fixtures；
- Public Clinical Study Registries & Reported Constraints synthetic fixtures；
- Public Medicine Supply Shortages & Availability Constraints synthetic fixtures；
- Public Regulatory Enforcement & Remedial Obligations synthetic fixtures；
- Public Audit Findings, Recommendations & Follow-up synthetic fixtures；
- Public Civic Service Requests & Reported Dispositions synthetic fixtures；
- Public Petitions, Support & Official Responses synthetic fixtures；
- Public Participatory Budgeting Proposals, Priority & Execution synthetic fixtures；
- Public Information Access Requests, Public-Body Responses & Releases synthetic fixtures；
- Public Business Credit Demand & Financing Conditions synthetic fixtures；
- Public Business Conditions, Constraints & Expectations synthetic fixtures；
- Public Business Digital Technology Adoption, Capability & Barriers synthetic fixtures；
- Public Business Innovation Activities, Constraints & Collaboration synthetic fixtures；
- Public Digital Access, Skills & Online Participation synthetic fixtures；
- Public Household Expenditure, Consumption & Budget Allocation synthetic fixtures；
- Public Time Use, Care, Mobility & Daily Activity Allocation synthetic fixtures；
- Public Health-Care Access, Unmet Need & Patient-Reported Barriers synthetic fixtures；
- Public Household Energy Affordability, Insecurity & Service Continuity synthetic fixtures；
- LinkedIn 授权组织资产和垂直行业社区。

## 14. 推荐 backlog

### P0：先证明抽象

1. `manual-import`：所有场域的安全底线和 schema 验证器。
2. `ingress-rss`：cursor/update/tombstone。
3. `ingress-zhihu-search` contract fixtures：search-summary/selected-excerpt、query placement、HasMore schema conflict、author最小化、XML untrusted-content与zero-route；真实API/Skill/MCP需合同和用户另行授权。
4. `ingress-github` 或 `ingress-v2ex`：技术场域的 issue/topic/reply。
5. `probe-manual-package`：landing、内容、闲鱼真实 listing 的统一交接回执。
6. 复用现有抖音/小红书 evidence 与发布反馈纵切验证通用对象。
7. `owned-app-review-demand`：先用 Apple/Google fixtures 验证 mutable revision、representation、history/coverage 与身份最小化；live read 另行授权。
8. `owned-customer-support-demand`：用 Zendesk/Intercom 合成 fixtures 验证 snapshot/event/parts 分层、field-level handling、private note 隔离、500-parts truncation 和 deletion/redaction 级联；live read 另行授权。
9. `owned-sales-decisions-demand`：用 Salesforce/HubSpot 合成 fixtures 验证 pipeline taxonomy binding、history completeness、10K/window/lookback、archive/delete、currency 和 subject/counterparty/provider evidence attribution；live read 另行授权。
10. `owned-subscription-outcomes-demand`：用 Stripe/Chargebee 合成 fixtures 验证 invoice/payment、requested/effective cancellation、payment failure/retention、cash refund/credit/dispute 分层，以及 amount role/currency/unit/sign、双系统 authority/exact overlap、事件乱序和 deletion/reconciliation；live read 另行授权。
11. `owned-product-usage-demand`：用 PostHog/Amplitude 合成 fixtures 验证 event/action/custom definition、person/group identity、funnel/retention窗口与分母、event/upload time、partial period、instrumentation health、aggregate rollup、跨平台authority/exact overlap和PII最小化；live read另行授权。
12. `owned-product-experiment-demand`：用 GrowthBook/LaunchDarkly 合成 fixtures 验证 phase、allocation/assignment/exposure、metric/analysis revision、A/A、SRM/crossover、approval bypass、unknown start/stop、stop ships treatment、rollback和PII最小化；任何live serving effect另行授权。
13. `owned-survey-feedback-demand`：用 Formbricks/Typeform 合成 fixtures 验证问卷definition revision、抽样/招募、display/start/partial/submit、consent/anonymous、signed webhook+pull reconcile、non-response coverage、跨平台题目bridge、PII最小化和删除传播；任何publish/invite/live respondent另行授权。
14. `owned-customer-conversation-demand`：用 Zoom/Gong/Teams 合成 fixtures 验证 occurrence/artifact/transcript revision、speaker/participant role、ASR overlap/gap、原文与derived分离、exact cross-representation relation、Teams v1/beta/RSC/tenant-speaker/subscription/delta/storage边界、consent/private/redaction/retention/deletion和最小span索引；任何真实transcript/media/bot/recording/MCP或live read另行授权。
15. `owned-customer-correspondence-demand`：用 Gmail/Graph Mail合成fixtures验证mailbox-copy/message/thread identity、authored/quoted/forward/signature/automated分段、Gmail history 404/watch、Graph ImmutableId/folder delta/subscription repair、metadata/body权限分区、附件/PII最小化和删除/hold传播；任何真实mailbox/body/attachment/MCP或write另行授权。
16. `owned-site-search-intent-demand`：用 Algolia/Typesense 合成fixtures验证surface/config definition revision、total/tracked/captured denominator、zero/null/late、typeahead停顿与prefix expansion、empty browse query、click/conversion attribution、internal/bot/synthetic排除、query PII最小化和动态物化视图失效重建；任何真实index/collection/MCP、event send、rule/config/index/document write另行授权。
17. `owned-product-request-demand`：用 Canny/UserVoice 合成fixtures验证post/suggestion与curated idea分层、author/admin-on-behalf/import、vote/supporter/request/account/priority/revenue口径、merge迁移谱系、自定义public/internal status与权限、cursor/offset/page、private/internal/PII隔离、动态物化视图和宽credential负向write；任何真实workspace/subdomain/MCP、supporter identity或平台write另行授权。
18. `authorized-customer-community-demand`：用 Slack/Discord 合成fixtures验证workspace/guild、channel/forum/thread/message identity、deployment/data-use/organization/technical三重authority、public/private/shared/DM roster、content empty-vs-omitted、user/bot/webhook/system与forward/crosspost roles、reply/thread exact relations、reaction口径、edit/delete/tombstone、Slack Events retry/disable与Discord Gateway 0-N delivery/reconcile、retention和零write；Slack live只在internal synthetic workspace另行授权，Discord在平台用途许可解除前不得sandbox/read。
19. `public-software-issues-demand`：用 GitHub/GitLab 合成fixtures验证host/project/item/record identity、Issue/Discussion/WorkItem representation、authored comment/thread reply/system note/resource event分层、native state+reviewed lifecycle、lock/answer正交、exact duplicate/move/block/release relation、search/list/pagination coverage、404 authority、webhook signature/retry/reconcile、动态物化视图和MCP/glab/Skill负向write；GitLab.com bulk plan必须在网络前policy-blocked，任何真实repo/project、MCP/Skill或平台write另行授权。
20. `public-technical-discussions-demand`：用Stack Exchange/HN/知乎/V2EX合成fixtures验证Q&A/news-thread/search-summary/node-forum的共同`PublicDiscussion*`抽象、question/article/story/Topic/answer/comment/reply/revision/ranking分层、canonical/search-summary/selected-excerpt representation、accepted answer exact relation、HN parent/kids/dead/deleted、知乎query placement/HasMore冲突/author最小化/XML不可信内容、V2EX Node container移动/list placement/pagination/rate冲突/legacy-v2隔离、外链artifact隔离、member-specific coverage、动态物化和MCP/Algolia/HTML/private API/Skill/no-write负向契约；Stack Exchange/HN的systematic warehouse/index在网络前policy-blocked，知乎在exact contract前contract-gated，V2EX在用途书面澄清前purpose-gated，任何真实API/MCP/Skill、原文获取或平台write另行授权。
21. `public-early-adopter-product-discovery-demand`：用 Reddit/Product Hunt 合成fixtures验证异构 Channel composition、Reddit subreddit/post/comment/thread 与 `PublicDiscussion*` 映射、Product Page/launch/Post/maker/topic/comment/review/rank 与独立 `ProductLaunch*` 映射、动态物化、member-specific coverage、删除传播、身份最小化、approval/schema/no-fallback/zero-write 负向契约，以及真实自有产品 manual-package 的 preview/人工回执边界；任何真实 API、MCP/Skill、网页获取、账号读取或平台write另行授权。
22. `marketplace-offer-discovery-demand`：用闲鱼/eBay合成fixtures验证product/inventory/offer/listing identity链、listing format与price role、active/visible/available/purchasable正交状态、exposure到feedback结果阶段、exact order-line relation、member-specific coverage/rights/deletion、eBay policy-before-binding与restricted-materialization，以及private Cookie/broad MCP/price-model/zero-write负向契约；任何真实账号、API、网页、sandbox、MCP/SDK执行或平台write另行授权。
23. `service-work-demand`：用Upwork/Freelancer.com合成fixtures验证request/brief/requirement/placement与invitation/proposal-or-bid/interview/offer-or-award/accept/contract/milestone-request/milestone/time/contest-entry/award/handover/invoice/payment/refund/dispute/feedback分层，advertised/proposed/binding/funded/released/paid金额角色、member-specific permission/coverage、ephemeral任务后删除、policy-before-binding、zero durable materialization、Principal direction、Agent零自主ranking和binding/financial负向契约；任何真实账号、MCP/API、SDK、网页、sandbox、平台读取或write另行授权。
24. `local-service-fulfillment-demand`：用Taskrabbit合成fixtures验证matched-lead/partner-booking、service item/location、estimate/availability/quote-reservation/booking/appointment/reschedule/completion/cancellation、estimated/quoted/client-charged/cancellation-fee金额角色、signed webhook乱序/重复/重放、auth文档冲突、partner-owned population、public coverage not-applicable、zero AI/warehouse/index和browser/community-MCP负向契约；任何合作申请、账号、凭据、sandbox/production API、webhook endpoint、估价或预约另行授权。
25. `public-extension-marketplace-feedback-demand`：用Mozilla AMO合成fixtures验证`ProductFeedback*`的review/rating-only/reply/aggregate、canonical/latest projection、product/version/reply exact relation、history/coverage、body-null、分页截断、CC attribution与reviewer identity全量drop；Channel同时验证Chrome official public review read=`unsupported`、JetBrains=`manual/policy-gated`、requested/eligible/callable分母、no HTML/browser/MCP/Skill/scraper fallback和zero-write。任何真实API/网页、账号、reviewer identity、add-on binary、rating/reply/flag或平台write另行授权。
26. `public-regulatory-complaints-demand`：用NHTSA合成fixtures验证`RegulatoryComplaint*`的root/subject-row/narrative/impact assertion、ODINO/CMPLID与pre-2002 ambiguity、2021 blank→N/0 cutover、2026 PII字段drift、claim-vs-finding、API/bulk population和zero-write；Channel同时验证CFPB narrative retirement/stale contract drift、CPSC manual/contract gate、requested/callable分母、no HTML/MCP/FOIA fallback。任何真实API/bulk/网页、VIN/身份、监管投诉提交或平台write另行授权。
27. `owned-product-reliability-demand`：用Sentry/Crashlytics合成fixtures验证`ProductReliability*`的issue/group/variant/occurrence/report、current/sample/export representation、release/environment、triage lifecycle、provider-derived signal、grouping/fingerprint、sampling/filtering、event/user-installation/session denominator、REST/aggregate/BigQuery coverage、secret/PII pre-gate、MCP/Skill/no-write和production test-crash拒绝。任何真实organization/project/app、API/export/MCP/Skill、诊断正文、identity、SDK/config/state/note/delete或测试崩溃另行授权。
28. `public-operational-status-demand`：用Statuspage/Better Stack/Instatus合成fixtures验证`OperationalStatus*`的page/component/incident/update/maintenance/postmortem、current/active/unresolved/recent-50/90-day representation、publisher lifecycle、condition/impact computation与override、manual/automatic/mirror provenance、history cap、HTML quarantine、member-specific coverage、MCP/private API/no-fallback/no-write和fake incident拒绝。任何真实status page/API、private token、MCP/Skill、订阅通知、incident/component/maintenance写入或批量页面发现另行授权。
29. `public-software-vulnerability-demand`：用OSV/GitHub Advisory/CISA KEV合成fixtures验证`SoftwareVulnerability*`的vulnerability/advisory/affected/range/assessment/exploitation/remediation/snapshot、native/alias/upstream/related ID、ecosystem resolver、CVSS/EPSS/review/KEV正交、OSV↔GitHub common-origin、mixed license/attribution、withdrawal/correction、unsafe reference、member/authority coverage和zero scan/write。任何真实package/CVE roster、API/dump/repo、SBOM/asset、scanner/MCP、PoC/reference获取、自动升级或平台提交另行授权。
30. `public-software-package-ecosystem-demand`：用npm/PyPI/crates.io合成fixtures验证`SoftwarePackageEcosystem*`的registry identity/name normalization、native version/resolver、package/version/release/file/artifact/dependency/pointer/lifecycle/usage/search/dataset分层、exact scope/reversal、API/index/feed/dump/mirror common-origin、download metric/window/caveat、schema/rate/cost drift、unsafe content/artifact与zero install/write。任何真实package roster、API/index/feed/BigQuery/dump、CLI/MCP/Skill、artifact/local manifest、credential/cost或publish/deprecate/yank/unpublish/delete另行授权。
31. `public-product-support-forum-demand`：用Discourse/NodeBB/Flarum合成fixtures验证deployment-scoped `PublicDiscussion*`、software/version/hosting、core/bundled/third-party/site capability origin与scope、topic/post/relation/state、accepted/solved capability binding、canonical/search/included/federated representation与origin、pagination/history coverage、guest GET method/path allowlist、schema/plugin/permission/Terms/robots drift、unsafe content和zero auth/write。任何真实deployment roster/API/HTML/browser/MCP/Skill、credential/private/admin/data explorer、attachment、federation expansion或发帖/回复/点赞/solution/moderation另行授权。
32. `public-b2b-software-review-demand`：用G2/TrustRadius固定官方schema合成fixtures和Capterra contract/export negative fixture验证`ProductFeedback*`的review/rating/aspect/reply/summary/excerpt、use-case/pros/cons/problems-solved/switching/recommendation content roles、provider verified/vetted、incentive unknown、solicitation/moderation/authorship context、exact-vs-candidate compared/selected/switched relation、vendor response与resolution claim、identity/firmographic drop、public/API/export/licensed/intent population、contract/entitlement/scope/tool/schema/license/retention/deletion drift和zero web/write。任何真实API/MCP/OAuth/API key、vendor portal/export、subscription、review corpus/identity、长期AI/index/materialization、solicitation/incentive/reply/rating/flag/Research Board write另行授权。
33. `external-search-demand-trends`：用Google Trends public BigQuery、Google Ads与Microsoft Ad Insight固定官方schema合成fixtures，并以Trends alpha未授权和百度contract/schema-blocked negative fixture验证`ExternalSearchDemand*`的population/subject/seed/target、interest/region/ranked-list/idea/history/forecast record、sampled-normalized/consistently-scaled/approximate-count/weighted-index/ranked-truncated/suggestion/config-dependent representation、geo/language/network/window/timezone、methodology/scale/rank/lag/watermark/coverage、member独立rights与动态物化失效；任何跨representation算术、market-size/pain升级、HTML/Cookie/private endpoint/MCP fallback与广告/加词write必须拒绝。任何真实API/BigQuery、账号、developer token/OAuth/API key、MCP/SDK、费用或平台write另行授权。
34. `business-experience-feedback-demand`：用Google Business Profile/Places、Yelp和Trustpilot官方schema手写合成fixtures，验证`BusinessExperienceFeedback*`的organization/business-unit/location/service-provider identity、review/rating-only/reply/aggregate/excerpt/provider-answer/deletion、owned-history/selected-sample/excerpt/licensed-feed/aggregate representation、verification/origin/experience context、sample-total gap、attribution/source、identity/private-field drop、cache/retention/deletion传播、member/product独立rights和zero effects；任何sample/excerpt/answer→full corpus、verified→truth、reply→resolved、API/MCP/code license→AI/index/storage right或HTML/scraper fallback必须拒绝。任何真实API/MCP/OAuth/key、账号/地点、review corpus/identity、长期materialization/embedding、reply/rating/flag/booking/quote另行授权。
35. `public-funding-priorities-demand`：用Grants.gov、NIH RePORTER、EU Funding & Tenders/CORDIS和SBIR/STTR固定官方schema手写合成fixtures，验证`PublicFunding*`的programme/call/opportunity/topic/subtopic/award/project/project-period/participant/result/output、current/search/annual-support/bulk/linked-data/provider-classified representation、lifecycle/eligibility/classification/authority、金额role、exact opportunity→award/project→result lineage、API/bulk/sample/full coverage、refresh/lag、attribution/license、PI/contact drop和zero application effects；任何grant→procurement、opportunity→market demand、award amount→payment、active project→success、linked output→validated result、POC MCP/community server→production route或HTML fallback必须拒绝。任何真实API/API key/MCP/Skill、账号、award/project corpus、身份、长期materialization/embedding、apply/submit/create/contact/write另行授权。
36. `public-rulemaking-consultation-demand`：用Regulations.gov、Federal Register、EU Have Your Say、GOV.UK Consultations和中国司法部固定官方schema/页面语义手写合成fixtures，验证`PublicRulemaking*`的initiative/docket/notice/proposal-draft/consultation/call-for-evidence/stakeholder-submission/authority-response/outcome/correction、current/register-rendition/official-edition/published-submission/outcome-summary/aggregate representation、authority/content/relation/lifecycle、开放与截止时间、submission population与mass-campaign/dedup/coverage、网页rendition→官方法律版本谱系、PII最小化和zero submission effects；任何proposal→effective law、submission→truth/representative/independent/accepted、comment count→unique persons/support/demand、provider summary→authority statement、HTML/community project→official route或评论提交必须拒绝。任何真实API/API key/MCP/Skill、账号、评论/附件语料、身份、长期materialization/embedding、comment/feedback/upload/submit/write另行授权。
37. `public-corporate-disclosures-demand`：用SEC EDGAR、UK Companies House、EU ESEF/ESAP、HKEX IIS和CNINFO固定官方schema/format/协议语义手写合成fixtures，验证`PublicCorporateDisclosure*`的entity/filing/document/periodic-report/material-event/accounts/section/fact/taxonomy-extension/exhibit/amendment/restatement、submission/archive/iXBRL/extracted-fact/registry/licensed-feed/statutory-portal/PDF representation、issuer/regulator/registry/exchange/auditor/provider authority、form/taxonomy/context/unit/dimensions/period、historical/forecast/forward-looking/audited、amount role、cross-listing/common-origin、PII最小化与zero filer/trade effects；任何accepted filing→verified truth、strategy→approved budget/procurement、risk→occurred pain、reported amount→payment、same label→comparable fact、audit flag→all content assurance、community parser/MCP→official route或website/internal endpoint fallback必须拒绝。任何真实API/API key/MCP/Skill、账号、filing/document/fact语料、身份、长期materialization/embedding、submit/update/contact/trade/write另行授权。
38. `public-technical-standards-demand`：用IETF、W3C、WHATWG、TC39和OpenJDK JEP固定官方process/API/repository语义手写合成fixtures，验证`PublicTechnicalStandard*`的organization/group/work-item/draft/proposal/spec/standard/decision/issue/implementation/test/erratum/revision、metadata/catalog/immutable/editor/living/repository/proposal-index/rendered/provider representation、process revision/native lifecycle、normativity、body/group/editor/implementer/commenter/provider authority、edition/commit、transition/regression/withdrawal、updates/replaces/obsoletes/supersedes、compatibility/deprecation/removal/migration、implementation/test evidence、provider/source common-origin和zero standards-process effects；任何draft→standard、published/integrated→all deployed、issue→consensus、test/interest→shipping、stage/status跨组织排序、GitHub可读→native API/content rights或HTML/community fallback必须拒绝。任何真实API/GitHub、MCP/Skill、规范/issue/test语料、长期materialization/embedding、submit/comment/ballot/issue/PR/test-result/write另行授权。
39. `public-product-recalls-demand`：用FDA openFDA、NHTSA、CPSC、EU Safety Gate和Canada固定官方API/bulk/open-data/export语义手写合成fixtures，验证`PublicProductRecall*`的event/report/campaign/product/lot-batch-serial-range/hazard/noncompliance/risk/measure/remedy/advisory/follow-up/status/correction、API/bulk/JSON/CSV/PDF/manual-export/language/provider representation、native lifecycle、regulator/operator/follow-up authority、voluntary/requested/ordered mandate、incident assertion、exact relation、common-origin、PII/VIN drop和zero recall/report effects；任何recall→complaint truth、hazard/class→causality/rate、campaign→single product、terminated/completed→all units recovered、JSON/CSV/language→独立证据、undocumented Safety Gate endpoint/community Skill→official route或HTML/browser fallback必须拒绝。任何真实API/feed/export/网页、MCP/Skill、recall corpus、VIN/身份、长期materialization/embedding、report/contact/subscribe/submit/write另行授权。
40. `public-research-literature-demand`：用Crossref、OpenAlex、PubMed、Europe PMC和arXiv固定官方metadata/API/snapshot/OAI语义手写合成fixtures，验证`PublicResearchLiterature*`的work/version/expression/manifestation/record、DOI/PMID/PMCID/arXiv/OpenAlex/Europe PMC identity、preprint/VoR/correction/retraction/withdrawal、provider authority/classification/annotation、query/core/expansion、common-origin与metadata/abstract/full-text rights；任何deposit/index/OA/citation→peer review/scientific truth/impact/demand、provider annotation→author limitation、URL/CC0 metadata→content licence、同源多平台→独立证据或HTML/community MCP/Skill fallback必须拒绝。任何真实API/OAI/snapshot/full text、credential、MCP/Skill、论文/作者identity corpus、长期materialization/embedding、submit/version/withdraw/curate/contact/citation/write另行授权。
41. `public-clinical-study-registries-demand`：用ClinicalTrials.gov、WHO ICTRP、ISRCTN、EU CTIS和DRKS固定官方API/TRDS/XML/CSV/public-record/export语义手写合成fixtures，验证`PublicClinicalStudy*`的study/protocol/registry record/revision/arm/intervention/condition/population/outcome/result/status/amendment、NCT/UTN/EU/ISRCTN/DRKS identity、native lifecycle、anticipated/actual enrollment、sponsor/registry/regulator/provider authority、common-origin、results/documents rights和contact/site/participant/IPD drop；任何registered/authorized/completed/results-posted→实际执行/scientific validity/efficacy/safety/demand、terminated→product failure/causality/patient harm、UTN→registration ID、aggregate result→medical advice、community patient-matching MCP→approved route或HTML/internal endpoint fallback必须拒绝。任何真实API/XML/CSV/export/search、trial corpus、MCP/Skill/client、身份/IPD、长期materialization/embedding、register/update/results-upload/withdraw/contact/recruit/referral/write另行授权。
42. `public-medicine-supply-shortages-demand`：用FDA、Health Product Shortages Canada、EMA、TGA和UK DHSC固定官方API/export/catalogue/statistics语义手写合成fixtures，验证`PublicMedicineSupply*`的event/notification/product/presentation/substance/status/availability/impact/cause/mitigation/import/substitution/aggregate、NDC/ARTG/authorization identity、native lifecycle、authority、revision/common-origin、rights和contact/clinical-advice drop；任何shortage→recall/defect/harm/demand、resolved→all local stock restored、expected end→commitment、manufacturer cause→verified root cause、alternative→clinical interchangeability、aggregate notification→unique product/patient或community MCP/Skill→approved route必须拒绝。任何真实API/search/export、shortage corpus、MCP/Skill、contact/patient/prescription/inventory、长期materialization/embedding、report/update/contact/subscribe/write另行授权。
43. `public-regulatory-enforcement-demand`：用EPA ECHO、CFPB、FTC、SEC和UK CMA固定官方service/feed/selected-record语义手写合成fixtures，验证`PublicRegulatoryEnforcement*`的matter/case/proceeding/docket/release/document/assertion/decision/order/judgment/settlement/obligation/appeal、authority/legal basis、lifecycle/posture/finality/effectiveness/stay/review、amount role/currency、history/common-origin/parallel action、rights与natural-person/victim/witness/contact drop；任何complaint→finding、settlement→admission、proposed order→final/effective、closed→violation proven或obligation complete、penalty/redress→paid/received/comparable、commercial/community MCP→official route或HTML/member fallback必须拒绝。任何真实service/feed/search/download、document corpus、MCP/Skill、自然人身份、长期materialization/embedding、filing/comment/petition/e-filing/report/contact/subscribe/write另行授权。
44. `public-procurement-demand-v0.3`：用SAM.gov、EU TED、UK FTS、CCGP、USAspending、Canada Proactive Contracts和Prozorro固定官方API/feed/OCDS/schema/CSV/manual语义手写合成fixtures，验证`PublicProcurement*`的plan/requirement/notice/procedure/lot/award/prime/subaward/contract/framework/transaction/amendment/milestone/performance/completion/termination、buyer/awarding/funding/recipient authority、estimated/award/current-potential/original-current/amendment/obligation-deobligation/outlay/aggregate amount roles、population/regime/threshold/reporting duty、history/late/correction/nil/common-origin、rights与natural-person/contact/bid narrative drop；任何award→signed contract、contract value→payment、outlay→supplier receipt、completed→success、termination→fault、OCDS/CSV/source-code licence→全内容rights、POST-read→write authority或HTML/community/member fallback必须拒绝。任何真实API/feed/CSV/download/bulk、MCP/collector、账号/身份、长期materialization/embedding、notice/bid/contract/change/performance/contact/write另行授权。
45. `public-ombudsman-determinations-demand`：用FOS、TPO、FSPO和Housing固定官方process/database/feed/selected-record语义手写合成fixtures，验证`PublicDisputeDecision*`的case/investigator-view/preliminary/final/finding/outcome/remedy/acceptance/appeal/compliance/publication、native outcome、binding、appeal/stay/variation/set-aside、publication lag/withholding、history/common-origin、rights与complainant name/initial/address/contact/personal-ref drop；任何investigator/preliminary→final、published→accepted/binding、upheld/maladministration→representative/prevalent/universal law、order/recommendation/amount→implemented/completed/paid、database absence→negative outcome、generic scraper/MCP→official route或HTML/member fallback必须拒绝。任何真实search/feed/PDF/decision corpus、MCP/Skill、自然人身份、长期materialization/embedding、complaint/evidence submission/accept/reject/appeal/contact/subscribe/write另行授权。
46. `public-audit-findings-recommendations-demand`：用GAO、NAO、ECA、ANAO和Canada OAG固定官方report/process/feed/open-data/tracker/selected-record语义手写合成fixtures，验证`PublicAuditFinding*`的engagement/report/scope/criteria/method/finding/conclusion/recommendation/response/action/implementation/follow-up/dataset/benefit、posture/assurance/authority、status history/common-origin、rights与natural-person/contact drop；任何draft/auditee assertion→final auditor finding、recommendation/agreed→implemented、self-report→auditor confirmation、closed-no-longer-valid→implemented、potential benefit→realized/received、selected tracker/open-data→完整分母、generic scraper/MCP→official route或HTML/member fallback必须拒绝。任何真实feed/API/report/tracker/dataset、MCP/Skill、自然人身份、长期materialization/embedding、audit request、举报/证据提交、auditee response/status update、contact/subscribe/write另行授权。
47. `public-civic-service-requests-demand`：用NYC/SF/Austin/Toronto固定官方Socrata/CKAN/Open311/dataset/process/privacy语义手写合成fixtures，验证`PublicCivicServiceRequest*`的service catalogue/request/classification/assignment/status/service notice/duplicate/disposition/partition、origin/channel、native lifecycle、source-declared resolution、temporal split、current-state/history、common-origin、coarse location与privacy；任何request count→unique person/incident/verified defect、closed/resolved→physical resolution/SLA/satisfaction、same category/location→exact duplicate、agency-internal→resident demand、missing protected/nonparticipating type→negative、public exact address/coordinate/free text→ordinary index、Open311 GET→POST authority、community MCP→official bulk route或HTML/member fallback必须拒绝。任何真实dataset row/API/ZIP/CSV/JSON、API key/MCP/Skill、精确位置/自然人身份、长期materialization/embedding、report/create/contact/subscribe/status write另行授权。
48. `public-petitions-support-responses-demand`：用UK/Scotland/Senedd/European Parliament固定官方process/privacy/source语义手写合成fixtures，验证`PublicPetition*`的petition/request/moderation/support snapshot/threshold/response/committee/debate/report/closure、lifecycle/posture/authority、counting/verification/invalidation/paper-online、language/common-origin和privacy；任何published→truth/endorsement、signature→unique person/representative opinion、threshold→guaranteed response/debate、considered→debated、debated/responded→adopted/implemented、rejected→no demand、dissolution closure→resolved、同族source→同部署route或HTML/community fallback必须拒绝。任何真实list/detail/API/JSON/CSV/portal、MCP/Skill/client、creator/signer/精细地域身份、长期materialization/embedding、create/sponsor/sign/verify/share/evidence/contact/subscribe/write另行授权。
49. `public-participatory-budgeting-demand`：用Barcelona/Madrid/Paris/NYC固定官方process/results/provider-schema/open-data/historical-coverage语义手写合成fixtures，验证`PublicParticipatoryBudget*`的process/round/envelope/proposal/evaluation/priority/ballot/vote-grade-rank/selection/allocation/milestone、stage/population/authority、measure/weighting/ballot/envelope rule、amount roles、common-origin和privacy；任何proposal→truth/representativeness、support→vote/people、grade/net score→普通票数、winner→budgeted/appropriated/spent/delivered、tracker completed→independent acceptance、winner-only/stale dataset→full/current、provider schema→exact deployment或HTML/community fallback必须拒绝。任何真实API/GraphQL/Socrata/open-data row、MCP/Skill/provider执行、identity/exact location、长期materialization/embedding、proposal/support/vote/comment/follow/status/admin write另行授权。
50. `public-information-access-requests-demand`：用WhatDoTheyKnow/MuckRock/FragDenStaat/AskTheEU固定官方process/API/source/privacy语义手写合成fixtures，验证`PublicInformationAccess*`的request/requester-message/body-message/platform-event/classification/fee/withholding/release/review/authority/dataset、deployment/jurisdiction/law/body-roster/population、delivery/auth、classification authority、deadline/calendar/extension、visibility/embargo、relation/common-origin、rights与identity/contact/address/signature/ID/IP drop；任何request allegation→truth/fault、platform roster→legal coverage、request/status/count→unique people/representative opinion、successful/done→full release、not-held/refused→independent fact或legal validity、review outcome→rewrite original、provider source/schema→exact deployment、public page→reuse right、HTML/community MCP/Skill fallback必须拒绝。任何真实API/Atom/JSON/email/attachment/request-response-release row、账号/credential、MCP/Skill/source执行、自然人/敏感内容、长期materialization/embedding、draft/send/follow-up/reminder/clarification/fee/review/appeal/complaint/litigation/annotation/follow/upload/redact/embargo/status/admin write另行授权。
51. `public-planning-applications-decisions-demand`：用England/NSW/NYC/Ireland固定官方process/dataset/schema/privacy/rights语义手写合成fixtures，验证`PublicPlanningApplication*`的application/site/parcel/action/document/event/exhibition/representation/referral/response/amendment/assessment/recommendation/hearing/decision/condition/agreement/review/implementation、authority/stage/posture/finality、window/population/common-origin、location precision与identity/contact/donation/text/file drop；任何application→truth/need/feasible、objection/support count→people/opinion、recommendation→competent decision、completed/determined→approved、approval→built/occupied/success、address similarity→exact relation、public→safe/reusable、provider/MCP/source→exact member route或HTML/browser fallback必须拒绝。任何真实API/Socrata/ArcGIS/bulk/feature/application/document/submission row、账号/credential、MCP/Skill/source执行、exact location/person/sensitive text、长期materialization/embedding、application/comment/testimony/donation/upload/amendment/payment/appeal/contact/subscribe/status/admin write另行授权。
52. `public-building-regulation-demand`：用NYC/Chicago/Toronto/NSW固定官方dataset/package/process/API/privacy/rights语义手写合成fixtures，验证`PublicBuildingRegulation*`的application/permit/work item/plan review/fee/inspection/complaint/violation/order/adjudication/correction/certificate/property、lifecycle/authorization/result/finding/compliance/certificate posture、authority、population/origin/common-origin、exact relation/history、location/person/professional-ID/comment/document drop与zero effects；任何application→truth/need、permit→commencement/completion、inspection pass→whole-project/continued compliance、complaint→violation、violation→liability/current condition、complied→current safety、certificate→actual occupancy/success、BIC↔CC/OC、provider/MCP/Skill→exact public route或HTML/browser/login/sibling fallback必须拒绝。任何真实Socrata/CKAN/Portal/Accela/API row、账号/credential、MCP/Skill/source执行、exact location/person/sensitive text/file、长期materialization/embedding、application/renewal/inspection/complaint/correction/certificate/payment/contact/status/admin write另行授权。
53. `public-regulated-license-demand`：用NYC DCWP、Chicago BACP、California DCA、Ahpra固定官方dataset/file/register/process/contract/privacy/rights语义手写合成fixtures，验证`PublicRegulatedLicense*`的subject/application/license/endorsement/inspection/complaint/investigation/charge/finding/sanction/appeal/remediation、lifecycle/standing/application outcome/result/finding/finality/sanction/remediation posture、authority/board/population、exact relation/history、publication/suppression与person/license/address/contact/complaint/health/document drop；任何application→approval/demand、current→competence/reputation/actual practice、pass→continued compliance、complaint/charge→finding、condition→discipline、finding→current standing、reinstatement→历史清除、public→bulk profiling right、provider/MCP/Skill→exact member route或HTML/browser/anti-detection fallback必须拒绝。任何真实Socrata/file/register/API/extract row、账号/credential/contract、MCP/Skill/source执行、自然人/敏感内容、长期materialization/embedding、application/renewal/exam/inspection/complaint/document/payment/appeal/restriction removal/reinstatement/contact/subscribe/status/admin write另行授权。
54. `public-environmental-regulation-demand`：用US EPA ECHO、England EA、EU/EEA Industrial Emissions Portal、NSW EPA固定official service/API/bulk/register/process/schema/known-alert/privacy/rights语义手写合成fixtures，验证`PublicEnvironmentalRegulation*`的site/facility/installation/activity/source/outfall/point、application/permit/condition/limit/requirement/measurement/report/release/inspection/incident/comparison/violation/enforcement/remediation、measurement kind/method/unit/statistic/period/value derivation/reporting basis/qualifier/comparison/compliance/finality/authority、exact relation/history、reporting population与sensitive-location/person/content drop；任何application→permit/need、permit→operation/compliance、measurement→comparable、exceedance→legal violation、self-report→authority finding、inspection/rating→whole-site continued compliance、annual inventory→instant emission/exposure/harm/noncompliance、return-reported→verified recovery、public/CC-BY metadata→all-field durable profiling right、provider/MCP/Skill→exact member route或HTML/browser/licensee-crawl fallback必须拒绝。任何真实service/API/bulk/register/monitoring row、账号/credential/conditional contract、MCP/Skill/source执行、exact point/facility/person/sensitive content、长期materialization/embedding、permit/monitoring/DMR/annual-return/noncompliance/incident/complaint/contact/subscribe/payment/status/admin write另行授权。
55. `public-contamination-remediation-demand`：用US EPA SEMS、Canada FCSI/FCSAP、England Part 2A/EA Special Sites与NSW CLM固定official search/file/register/process/population/schema/privacy/rights语义手写合成fixtures，验证`PublicContaminationRemediation*`的site/parcel/operable-unit/source-area/medium边界、notification/observation/assessment/designation、hazard/pathway/receptor/use-specific risk、listing/responsibility/liability、remedy/action/completion/control/closure/reuse、amount role/authority/history/coverage与location/party/document/raw-value drop；任何notification→confirmed/significant contamination、detection/classification→exposure/harm、owner/custodian/voluntary work→liability/admission、selected remedy→implementation、phase/construction complete→goals/whole-site complete、deletion/reuse→no residual control、funding/obligation/settlement→expenditure/payment/receipt、register absence→no contamination、provider/MCP/Skill→exact route或HTML/commercial-screener fallback必须拒绝。任何真实search/XML/XLSX/register/site/notice/sample row、账号/credential、MCP/Skill/source执行、exact location/parcel/person/sensitive content、长期materialization/embedding、notification/report/sample/contact/subscribe/complaint/appeal/payment/status/admin write另行授权。
56. `public-drinking-water-safety-demand`：用US EPA SDWIS/ECHO、England & Wales DWI、Canada ISC First Nations Advisories与New Zealand Taumata Arowai固定official bulk/report/register/process/population/schema/lag/security/privacy/rights语义手写合成fixtures，验证`PublicDrinkingWaterSafety*`的supplier/system/source/treatment/storage/network/zone/point/service-area、registration/supply population、result stage/method/unit/statistic/period/qualifier、standard kind/applicability/comparison、violation category/origin/finality/resolution、event/advisory kind/scope/issuer/lift、action/completion、aggregate denominator/history/coverage与critical-infrastructure/person/document/raw-value drop；任何registration→potability/compliance、single result→whole-system、detection→comparable、failure→violation、monitoring violation/health flag→unsafe water/illness、event/advisory→exposure/harm、project complete/infrastructure ready→acceptable water、lift recommendation→actual rescission、resolved/archived→no residual risk、provider/MCP/Skill→exact route或dashboard/HTML/company-portal fallback必须拒绝。任何真实ZIP/XLSX/register/PWS/supply/sample/result/violation/event/advisory row、账号/credential、MCP/Skill/source执行、exact service-area/infrastructure/person/sensitive content、长期materialization/embedding、sample/report/incident/advisory/lift/contact/subscribe/complaint/status/admin write另行授权。
57. `public-ambient-air-quality-demand`：用US EPA AirNow/AQS、UK Defra UK-AIR、EEA与Canada ECCC固定official API/feed/bulk/index/methodology/forecast/alert/schema/quality/privacy/rights语义手写合成fixtures，验证`PublicAmbientAirQuality*`的network/station/monitor/reporting-area/grid/community、pollutant/method/unit/statistic/averaging period、production kind、preliminary/verified/validated/corrected lifecycle、index formula/breakpoint/completeness/special mode、forecast issue/amendment/validity、event/attribution、advisory kind/standing/issuer/message、health audience/horizon、standard/comparison/compliance、history/coverage/rights与location/person/private-sensor/document drop；任何station→postcode/area/person、same unit→comparable、preliminary→validated、model/downscale/interpolation/gap-fill→measurement、subindex→complete index、cross-index换算、NowCast/current→daily history、forecast→observation/advisory、trigger→issued alert、high index→legal exceedance/nonattainment、episode→confirmed cause、guidance→diagnosis/exposure/harm、alert end/expiry→zero residual pollution、provider/MCP/Skill→official route或跨product/member fallback必须拒绝。任何真实API/feed/file/Parquet/CSV/GeoJSON/XML/CAP/grid/observation/index/forecast/alert row、账号/key/credential、MCP/Skill/source执行、exact location/private sensor/person/sensitive content、长期materialization/embedding、registration/submission/incident report/advisory/alert/subscribe/contact/API signup/status/admin write另行授权。
58. `public-food-safety-inspections-outbreaks-demand`：用NYC DOHMH、UK FSA、Toronto DineSafe与CDC NORS固定official dataset/API/bulk/catalogue/process/methodology/privacy/rights语义手写合成fixtures，验证`PublicFoodSafety*`的establishment/premises/permit、inspection occurrence/type/scope、citation/violation、scheme-specific severity/rating、enforcement/closure/reinspection/reopening、correction authority、complaint origin、outbreak/mode/setting、etiology/vehicle/ingredient attribution、illness/hospitalization-known/death-known aggregate denominator、identity/authority/history/coverage/rights与merchant/person/complaint/inspector/patient/free-text drop；任何inspection pass→持续安全、citation/critical/crucial→疾病、跨scheme score/rank、closure→永久失败/破产/outbreak、reopening→历史清除/未来安全、operator correction→verified correction、complaint-origin→投诉成立、active/current/latest→完整历史、outbreak→sporadic illness、setting/vehicle/confirmed etiology→exact premises/cause、missing→无问题、provider/MCP/Skill→official route或跨成员fallback必须拒绝。任何真实SODA/API v2/OData/CKAN/XML/JSON/CSV/ZIP row、账号/token/credential、MCP/Skill/source执行、exact address/phone/owner/operator/permit/complaint/inspector/patient/free text、长期materialization/embedding/index、inspection/complaint/rerating/appeal/right-to-reply/correction/ticket/payment/closure/reopen/outbreak report/contact/admin write另行授权。
59. `public-transit-service-reliability-accessibility-demand`：用NYC MTA、TfL、MBTA与Transport for NSW固定official GTFS/GTFS-RT/Unified/JSON:API/schema/extension/facility/history/performance/licence语义手写合成fixtures，验证`PublicTransitService*`的agency/operator/network/mode/feed、route/direction/pattern、stop/station/platform/entrance/pathway、service date/timezone/trip/vehicle/stop event、schedule relationship、prediction/actual time posture、alert cause/effect/standing/informed entity、facility owner/status/accessibility condition、performance population/numerator/denominator/threshold/history/coverage/rights与vehicle/employee/rider/journey/security/free-text drop；任何schedule→operated、prediction/interpolation→actual、missing/stale realtime或vehicle→cancelled、alert→measured impact/confirmed cause/all trips、alert expiry/missing→restored、static wheelchair/pathway→current accessible journey、one lift outage/restoration→whole station inaccessible/accessible、same GTFS/metric name/percentage→cross-member comparable、directory/MCP/Skill→official route或跨mode/member fallback必须拒绝。任何真实GTFS ZIP/protobuf/API/JSON/XML/SIRI/WebSocket/CSV/Parquet/SQLite row、账号/key/token/credential、MCP/Skill/source执行、exact live coordinate/vehicle/employee/rider/journey/security/free text、长期materialization/trajectory/embedding/index、alert/incident/facility-status publish、issue report、paratransit booking、subscription/contact、API registration/upgrade、schedule/dispatch/control/admin write另行授权。
60. `public-road-safety-crash-casualty-hazard-demand`：用NHTSA FARS、NYC MVC、UK DfT STATS19与Transport for NSW Crash Data固定official population/schema/codebook/dataset/resource/release/revision/severity/geocode/exposure/privacy/rights语义手写合成fixtures，验证`RoadSafety*`的jurisdiction/publisher、fatal-census/police-registry/sample/linked-outcome population、collision/unit/road-user/casualty/outcome grain、release/vintage/standing、severity/basis、factor reporter/posture、location/CRS/precision、aggregate/exposure/risk posture、history/coverage/rights与name/address/plate/VIN/licence/free-text/medical/toxicology/contact/rare-point/small-cell drop；任何fatal census→all crashes、police report→complete occurrence population、collision severity→person outcome、factor→confirmed cause/fault/liability、preliminary/provisional→final、record missing→event did not occur、same time/coordinate/street/count→identity、count/cluster→risk/causal hotspot、incompatible denominator→cross-member ranking、active hazard/work zone→historical collision、generic SODA/CKAN/MCP/Skill→official route或跨成员fallback必须拒绝。任何真实API/SODA/CKAN/CSV/XLSX/SAS/DBF/GeoJSON row或bulk file、账号/key/token/credential、MCP/Skill/source执行、exact sensitive location/person/vehicle/medical content、长期materialization/embedding/index、crash/hazard report、emergency/contact/enforcement/road-work/map/status edit、subscription/API registration或admin write另行授权。
61. `public-consumer-price-inflation-affordability-demand`：用U.S. BLS、UK ONS、Eurostat与Statistics Canada固定official program/population/classification/API/dataset/series/PID/cube/method/weight/base/reference/release/revision/rights语义手写合成fixtures，验证`PublicConsumerPrice*`的quote/average-price/weight/index/change/contribution/adjustment/missing/availability/denominator/affordability grain、currency/unit/package/tax/discount/geography、SA/NSA、first/current/revised/rebased/backcast与coverage；任何quote→representative average/index、average-price change→pure inflation、index point→currency/percent、weight→quantity/demand、base/price/weight/publication period互换、rebase→price shock、missing/imputed/suppressed/409/null→zero/stockout、harmonised→identical basket、CPI无兼容denominator→affordability、national aggregate→individual hardship、community MCP/Skill/client→official route或跨成员fallback必须拒绝。任何真实API/JSON-stat/SDMX/WDS/CSV/XLSX/ZIP observation或bulk/quote/scanner file、账号/key/credential、MCP/Skill/source执行、outlet/provider/transaction/restricted content、长期materialization/embedding/index、API registration/restricted microdata request/subscription/contact/statistical submission/dashboard share/admin write另行授权。
62. `public-rental-housing-cost-vacancy-burden-demand`：用U.S. Census ACS、UK ONS PIPR、Eurostat EU-SILC与Canada CMHC RMS固定official program/population/tenure/API/dataset/table/group/variable/DSD/codelist/workbook/method/rent-basis/period/quality/release/revision/rights语义手写合成fixtures，验证`PublicRentalHousing*`的rent level/index、vacancy/availability、turnover、housing-cost burden、universe、estimate/MOE/CV/significance/suppression/model/status、geography/property与coverage；任何advertised/asking↔achieved/paid/contract/gross/modelled rent、dwelling/unit↔household/person、rent level↔index/change、vacancy aggregate→live listing、turnover→unique tenant/churn/eviction、persons in burdened households→households/individual hardship、missing/suppressed/not-significant→zero、generic/community MCP/Skill/client→official exact member route或跨成员fallback必须拒绝。任何真实API/JSON-stat/CSV/XLSX observation、table/group/variable/data row、账号/key/credential、MCP/Skill/source执行、restricted microdata、长期materialization/embedding/index、API key request/subscription/contact/survey response/dashboard share/admin write另行授权。
63. `public-labor-demand-vacancies-turnover-demand`：用U.S. BLS JOLTS、UK ONS Vacancy Survey、Eurostat JVS与Statistics Canada JVWS固定official program/population/statistical-unit/API/dataset/table/group/variable/series/PID/DSD/workbook/vacancy-definition/timing/denominator/adjustment/classification/quality/release/revision/rights语义手写合成fixtures，验证`PublicLaborDemand*`的vacancy/occupied/employment stock、rate definition/observation、hire/separation flow、offered wage、recruitment characteristic、SE/CV/confidence/response/significance/suppression/status与coverage；任何posting→vacancy、establishment/enterprise/location/post/employee/person互换、stock↔flow、hire→opening filled、quit/layoff→cause/churn、rate丢失numerator/denominator/scale、single-month↔three-month moving average↔quarter distinct positions、SA↔NSA、offered/lower-bound/converted wage→actual pay、same label跨classification revision、flash/preliminary/imputed→final、missing/suppressed/not-significant→zero、generic/community MCP/Skill/client→official exact member route或跨成员fallback必须拒绝。任何真实API/JSON-stat/SDMX/CSV/XLSX observation、series/PID/table/data row、账号/key/credential、MCP/Skill/source执行、restricted microdata、长期mirror/materialization/embedding/index、API key request/subscription/contact/survey response/dashboard share/admin write另行授权。
64. `public-business-formation-demography-survival-demand`：用U.S. Census BFS/BDS、UK ONS Business Demography、Eurostat Business Demography与Statistics Canada MBOC固定official program/population/statistical-unit/API/dataset/table/PID/DSD/codelist/workbook/application/birth/formation/opening/closure/death/exit/reopening/survival/high-growth/employment/adjustment/quality/release/revision/rights语义手写合成fixtures，验证`PublicBusinessDemography*`的identity/program/population/classification、lifecycle definition、cohort、observation/rate、survival、growth、employment dynamics、estimate quality、adjustment、release、authority/access/coverage与relation；任何business/tax-ID application→legal registration/operating business/statistical birth、legal unit↔enterprise/firm/establishment/local unit/employer business/person、opening↔entrant/reopening/birth/startup、closure↔temporary closure/death/permanent exit/shutdown、employer birth/death↔enterprise birth/death、active population跨成员直接比较、actual↔projected/spliced、4Q↔8Q、weekly NSA↔monthly/annual SA、cohort survival→current success、high-growth→young firm/causality、job creation/destruction↔hire/separation、preliminary/projected/noised/suppressed→final/zero、generic/community MCP/Skill/client→official exact member route或跨成员fallback必须拒绝。任何真实API/JSON-stat/SDMX/CSV/XLSX observation、dataset/table/PID/data row或bulk/workbook内容、账号/key/credential、MCP/Skill/source执行、restricted microdata、长期mirror/materialization/embedding/index、API key request/subscription/contact/statistical submission/database initialization/dashboard share/admin write另行授权。
65. `public-business-insolvency-liquidation-restructuring-demand`：用U.S. Courts、UK Insolvency Service、Eurostat与Canada OSB固定official program/legislation/population/statistical-unit/publication/dataset/table/resource/series/DSD/workbook/proceeding/event/authority/measure/denominator/base/weight/adjustment/classification/quality/release/revision/rights语义手写合成fixtures，验证`PublicBusinessInsolvency*`的identity/program/population/classification、proceeding definition、observation/rate、case flow、formal outcome、financial aggregate、adjustment、estimate quality、release、authority/access/coverage与relation；任何distress/inability-to-pay→formal insolvency、petition/filing/assignment/order/declaration/commencement互换、case/proceeding/filing/debtor/company/business/enterprise/legal-unit/person互换、business/nonbusiness/consumer/individual-business自行推断、Chapter 7→liquidation complete、Chapter 11/administration/CVA/proposal/CCAA→rescue success、receivership↔bankruptcy、moratorium↔plan/outcome、filed/terminated flow↔pending stock、terminated/closed→discharge/payment/death、count/rate/index/share/percent-change/amount互换、effective-register↔active-business↔legal-unit denominator、SA↔NSA、declared assets/liabilities→verified valuation/recovery/payment、unmatched/suppressed/missing→zero、formal procedure→business-demography death或identified lead、generic/community/commercial MCP/Skill/client/parser→official exact member route或跨成员fallback必须拒绝。任何真实API/JSON-stat/SDMX/PDF/XLS/XLSX/CSV/ODS observation/data file、PACER/CourtListener/case/docket/document、账号/key/token/credential、MCP/Skill/source执行、长期mirror/materialization/embedding/index、API signup/fee/search/alert/subscription/purchase/filing/claim/contact/database initialization/admin write另行授权。

66. `public-business-credit-demand-financing-conditions`：用Federal Reserve SLOOS、ECB BLS、Bank of England CCS与Bank of Canada SLOS固定official survey/program/panel/respondent-population/publication/dataset/resource/table/series/question/response-scale/loan-category/borrower-segment/measure/term/direction/balance/weighting/time-role/horizon/quality/release/revision/rights语义手写合成fixtures，验证`PublicBusinessCredit*`的identity/program/population、question/term/direction/balance/weighting definition、observation/driver/expectation/historical level、response quality、release、authority/access/coverage与relation；任何lender-reported supply↔borrower demand↔actual volume、standard↔availability↔term↔approval、respondent/response/weighted-response/loan-category/segment/series互换、C&I/CRE/enterprise/corporate/small-business/capital-market access互换、large/middle/medium/small/SME/PNFC自行统一、positive value全局解释、net percentage/diffusion index/balance/mean互换、unweighted/market-share/loan-stock/national-share weighting互换、past/current/expected/historical-range互换、expectation→outturn/forecast/commitment、spread→rate level、approval likelihood→actual decision、default/LGD direction→count/amount/insolvency、reported factor→causality/company action、missing/NA/nonresponse/not-asked→zero/unchanged、generic/community MCP/Skill/client/parser/republisher→official exact member route或跨成员fallback必须拒绝。任何真实DDP/FRED/ECB SDMX/BoE XLSX/BoC Valet observation/data file、账号/key/token/credential、MCP/Skill/source执行、长期mirror/materialization/embedding/index、API key registration/subscription/survey submission/loan application/credit enquiry/quote/contact/data download/admin write另行授权。

67. `public-business-conditions-constraints-expectations`：用U.S. Census BTOS、UK ONS BICS、European Commission BCS business surveys与Statistics Canada CSBC固定official program/population/statistical-unit/publication/dataset/resource/table/series/question/response-scale/direction/weighting/time-role/measure/estimate/quality/release/programme-lifecycle/revision/rights语义手写合成fixtures，验证`PublicBusinessConditions*`的identity/program/population、question/scale/direction/estimate method、activity/demand/price-cost/workforce/supply-chain/constraint/resilience/confidence/capacity/investment/expectation/planned-action、estimate quality、release、authority/access/coverage与relation；任何respondent view↔published estimate↔publisher composite↔administrative outturn↔audited fact、employer business/enterprise/establishment/reporting unit/local unit、invitation/respondent/response/weighted response/estimate/index/release、selected obstacle↔most challenging、recent/current/near-term/6-month/12-month/plan、response share/unweighted share/balance/diffusion/quantitative/composite、measure-specific direction、design/nonresponse/calibrated/count/turnover/employment/country/sector weight、SA/NSA/imputed/backcast/corrected/development/experimental/suppressed、null/NA/don't-know/not-applicable/not-asked/suppressed/unreliable↔zero/unchanged、expectation→outturn/forecast/commitment、plan→approved/funded/started/completed、active/final-collection/final-release/discontinued/archive、generic/community MCP/Skill/client/parser→official exact member route或跨成员fallback必须拒绝。任何真实BTOS/BICS/ECFIN Redisstat/CSBC WDS observation或CSV/JSON/SDMX/XLS/XLSX/PDF data file、账号/key/token/credential、restricted microdata、MCP/Skill/source执行、长期mirror/materialization/embedding/index、API registration/subscription/contact/survey submission/dashboard share/admin write另行授权。

68. `public-business-digital-technology-adoption-capability-barriers`：用Census/NCSES ABS、UK ONS Digital Economy Survey、Eurostat ICT Usage in Enterprises与Statistics Canada SDTIU固定official programme/population/statistical-unit/questionnaire/question/taxonomy/adoption-stage/time-role/measure/representation/weighting/estimator/quality/release/lifecycle/route/rights语义手写合成fixtures，验证`PublicBusinessDigitalAdoption*`的identity/program/population、technology/question/stage、observation/barrier/plan/composite、method/quality/release/access/coverage与relation；任何reported use→installed/entitled/configured/successful/value-realised、internet/presence/e-commerce/software/cloud/AI/analytics/IoT/automation/security/skills互填、AI→generative AI、online order→payment/fulfilment/end demand、external implementation/support/financing intent→contract/procurement/lead/application/approval、non-use/barrier→cause/severity/loss/WTP、security control→effectiveness/compliance、incident→verified breach/vulnerability/root cause、business/employee/turnover/money/count/intensity/composite互换、DII跨component-set/year join、survey/collection/reference/planned time互换、questionnaire/result/route/programme standing互推、generic MCP/Skill/SDK/client/parser→domain readiness必须拒绝。任何真实Census API/ONS workbook/Eurostat API-SDMX/StatCan WDS observation或data file、账号/key/token/credential、respondent/business identity、restricted microdata、MCP/Skill/source执行、长期mirror/materialization/embedding/index、API registration/subscription/contact/survey submission/dashboard share/admin write另行授权。

69. `public-business-innovation-activities-constraints-collaboration`：用Census/NCSES ABS Innovation、UKIS、Eurostat CIS与Statistics Canada SIBS固定official programme/Oslo-definition/population/statistical-unit/questionnaire/question/activity-status/novelty/time-role/measure/representation/weighting/estimator/quality/release/lifecycle/route/rights语义手写合成fixtures，验证`PublicBusinessInnovation*`的identity/program/population、definition/question/status、observation/expenditure/cooperation/barrier/support/protection、method/quality/release/access/coverage与relation；任何idea/invention/R&D/technology acquisition/activity→introduced innovation、product/process/goods/service互填、new-to-business/market/world互换、introduced/completed-not-implemented/ongoing/abandoned/no-activity合并、innovation-active→success/growth/value、three-year activity↔single-year amount、developer source→IP owner/vendor、cooperation↔information/outsourcing/ordinary cooperation、barrier/no-activity reason跨denominator或→cause/lead、support use→application/award/payment/effectiveness、protection filing→grant/right/enforceability、turnover share/benefit/environmental contribution→causal ROI/impact、questionnaire/result/route/programme standing互推、generic MCP/Skill/SDK/parser→domain readiness必须拒绝。任何真实Census API/NCSES table/UKIS workbook/Eurostat API-SDMX/StatCan WDS observation或data file、账号/key/credential、respondent/business/partner identity、restricted microdata、MCP/Skill/source执行、长期mirror/materialization/embedding/index、survey submission/restricted-access application/subscription/contact/dashboard share/admin write另行授权。

70. `public-digital-access-skills-online-participation`：用NTIA/Census Internet Use、Ofcom Adults Media Literacy、Eurostat `isoc_i`与Statistics Canada CIUS固定official programme/population/statistical-unit/questionnaire/question/routing/scale/access/measure/time-role/representation/weighting/estimator/quality/release/lifecycle/route/rights语义手写合成fixtures，验证`PublicDigitalAccessParticipation*`的identity/program/population、definition/question、observation/barrier/skill/activity/concern-incident/composite、method/quality/release/access/coverage与relation；任何household access→individual use/network availability、availability/access/subscription/reliability/affordability互填、device access/ownership/use/smartphone-only互换、non-use reason→cause/severity/WTP/vulnerability/lead、self-reported activity/confidence→tested proficiency、online activity→completion/benefit/satisfaction、purchase/government/health/work activity→outcome、concern/protective action/incident/harm/breach互推、self/proxy与3/12-month window丢失、household/person/user share互换、composite跨component/questionnaire revision续series、proposed questionnaire→published result、generic MCP/Skill/SDK/parser→domain readiness必须拒绝。任何真实Explorer/API/SDMX/WDS observation或table/respondent/microdata file、账号/key/credential、respondent/household identity、sensitive/rare cell、MCP/Skill/source执行、长期mirror/materialization/embedding/index、survey submission/recruitment/contact/targeting/dashboard share/admin write另行授权。

71. `public-household-expenditure-consumption-budget-allocation`：用BLS Consumer Expenditure Surveys、ONS LCF/Family Spending、Eurostat HBS与Statistics Canada SHS固定official programme/population/statistical-unit/instrument/questionnaire/diary/question/recall-window/expenditure-definition/classification/category/time-role/measure/representation/value-basis/weighting/estimator/quality/release/lifecycle/route/rights语义手写合成fixtures，验证`PublicHouseholdExpenditure*`的identity/program/population、definition/classification/instrument/question、observation/flow/price-adjustment/equivalisation、method/quality/release/access/coverage与relation；任何consumer unit↔household↔reference person↔reporting unit、Interview↔Diary↔integrated、purchase/acquisition/payment/liability/use/consumption互填、expenditure→need/preference/satisfaction/demand、consumption↔tax/transfer/saving/debt/asset/business flow、weekly/quarterly/12-month↔annualised/year/wave、all-unit mean↔reporter mean↔median↔aggregate↔share↔percent reporting、zero/no-purchase/missing/not-collected/suppressed/unreliable合并、nominal/real/PPS→quantity、aggregate→market size/revenue、share→market share/priority、income→wealth/affordability/credit capacity、equivalised→welfare、CE-UCC/COICOP/ECOICOP/SHS label join、current questionnaire→published result、generic MCP/Skill/SDK/parser→domain readiness必须拒绝。任何真实BLS/ONS workbook/Eurostat API-SDMX/StatsCan WDS observation或table/respondent/diary/microdata file、账号/key/credential、household/person identity、sensitive/rare cell、special tabulation、MCP/Skill/source执行、长期mirror/materialization/embedding/index、survey/diary submission/recruitment/contact/targeting/dashboard share/admin write另行授权。

72. `public-time-use-care-mobility-daily-activity-allocation`：用BLS ATUS、ONS OTUS、Eurostat HETUS与Statistics Canada TUS固定official programme/population/statistical-unit/diary-instrument/questionnaire/question/diary-boundary/assigned-day/episode-slot/activity-role/classification/category/context/time-role/measure/representation/weighting/estimator/quality/release/lifecycle/route/rights语义手写合成fixtures，验证`PublicTimeUse*`的identity/program/population、classification/instrument/question/episode、observation/method/quality/release/access/coverage与relation；任何person↔respondent↔diary-day↔episode↔slot、diary day→usual routine、primary↔secondary↔secondary-childcare↔supervisory-care或重复相加、duration→effort/burden/productivity/preference/satisfaction/outcome/demand、population mean↔participant mean↔participation rate↔episode count↔share↔time-of-day、zero→never/no use/no need、paid work→employment/contract hours/output、unpaid work/care→service willingness、travel time→trip/distance/delay/reliability、sleep time→quality/health、media time→app telemetry/attention、free-time category→available capacity、location/with-whom→identity/relationship、weekday/weekend/season/wave丢失、ATUS/OTUS/HETUS/Canada label join、collection/questionnaire→published result、generic MCP/Skill/SDK/parser→domain readiness必须拒绝。任何真实BLS API/file、ONS workbook、Eurostat API-SDMX、StatsCan WDS observation或table/respondent diary/microdata file、账号/key/credential、person/household identity、precise schedule、sensitive/rare cell、MCP/Skill/source执行、长期mirror/materialization/embedding/index、survey/diary submission/recruitment/contact/targeting/dashboard share/admin write另行授权。

73. `public-health-care-access-unmet-need-patient-reported-barriers`：用NCHS NHIS、England GPPS、Eurostat EU-SILC与ABS Patient Experiences固定official programme/population/registration/service/instrument/question/need/outcome/barrier/reason-role/window/denominator/measure/representation/weighting/estimator/quality/release/lifecycle/route/rights语义手写合成fixtures，验证`PublicHealthCareAccess*`的identity/program/population、service/instrument/question、observation/method/quality/release/access/coverage与relation；任何self-reported need→clinical necessity/diagnosis、received care→timely/appropriate/effective care或outcome、delay↔nonreceipt↔nonseeking↔failed contact/appointment/attendance、cost/wait/distance/transport/availability/appointment/time/caregiving/fear/preference/information barrier互填、main reason↔any reason、population↔needed-person↔service-user↔registered-patient denominator、medical/dental/prescription/GP/specialist/hospital/ED/mental-health/telehealth service互填、past-12-month↔last-appointment/current-state、experience→objective quality/safety/outcome、preliminary/early-release→final、跨questionnaire/sample/mode/coverage break续series、aggregate breakdown→individual health/vulnerability target、generic MCP/Skill/SDK/parser→official exact member route或domain readiness必须拒绝。任何真实API/CSV/XLSX observation或data file、respondent/response/microdata、账号/key/credential、person/household/practice identity、sensitive/rare cell、MCP/Skill/source执行、长期mirror/materialization/embedding/index、survey submission/recruitment/care contact/medical advice/eligibility targeting/dashboard share/admin write另行授权。

74. `public-household-energy-affordability-insecurity-service-continuity`：用EIA RECS、England DESNZ LILEE、Eurostat EU-SILC与Australia AER固定official programme/authority/population/statistical-unit/energy-service/instrument/indicator/model/guideline/schedule/condition/event/amount-role/time/denominator/measure/representation/weighting/quality/release/lifecycle/route/rights语义手写合成fixtures，验证`PublicHouseholdEnergy*`的identity/program/population、service/instrument/indicator、observation/method/quality/release/access/coverage与relation；任何energy price↔billed expenditure↔required bill↔debt↔arrears↔fuel-poverty gap、low expenditure→low need/affordability、self-reported insecurity/warmth/temperature→verified poverty/measured temperature/health harm、LILEE→universal energy-poverty definition、housing-unit↔household↔person↔customer account↔hardship account、electricity↔gas↔bulk fuel↔heating↔cooling、food/medicine tradeoff↔unsafe temperature↔equipment unavailable↔warmth inability、arrears↔debt↔default、notice↔disconnection↔delivery stop↔reconnection↔network outage↔equipment failure、hardship/payment plan/concession/assistance offered/accepted/completed互填、reconnection→debt cleared/problem resolved、preliminary/provisional/projected/regulatory-reported/corrected→final、跨questionnaire/model/guideline/template/jurisdiction break续series、aggregate breakdown→individual poverty/vulnerability/eligibility target、generic EIA/Eurostat MCP、CDR product client或parser→official exact member route/domain readiness必须拒绝。任何真实API/PDF/XLSX/ODS/CSV observation或data file、respondent/customer/account/microdata、bill/meter/interval/medical/family-violence/life-support record、账号/key/credential、sensitive/rare cell、MCP/Skill/source执行、长期mirror/materialization/embedding/index、assistance application/payment/switch/contact/complaint/disconnection/reconnection/retailer submission/dashboard share/admin write另行授权。

### P1：按业务垂直选择

- B2B/公共部门：Greenhouse/Lever、Public Procurement v0.3、Public Funding Priorities、Public Rulemaking & Consultation、Public Corporate Disclosures、Public Technical Standards、Public Research Literature、Public Clinical Study Registries、Public Medicine Supply Shortages、Public Regulatory Enforcement、Public Ombudsman Determinations、Public Audit Findings、Public Civic Service Requests、Public Petitions、Public Participatory Budgeting、Public Information Access Requests、Public Planning Applications、Public Building Regulation、Public Regulated Licenses、Public Environmental Regulation、Public Contaminated Sites/Remediation、Public Drinking Water Safety、Public Ambient Air Quality & Health Advisories、Public Food Safety Inspections & Outbreaks、Public Transit Service Reliability & Accessibility、Public Road Safety Crashes & Casualties、Public Consumer Prices/Inflation、Public Rental Housing Cost/Vacancy/Burden、Public Labor Demand/Vacancies/Turnover、Public Business Formation/Demography/Survival、Public Business Insolvency/Liquidation/Restructuring、Public Business Credit Demand/Financing Conditions、Public Business Conditions/Constraints/Expectations、Public Business Digital Technology Adoption/Capability/Barriers、Public Business Innovation Activities/Constraints/Collaboration、Public Digital Access/Skills/Online Participation、Public Household Expenditure/Consumption/Budget Allocation、Public Time Use/Care/Mobility/Daily Activity Allocation、Public Health-Care Access/Unmet Need/Patient-Reported Barriers与Public Household Energy Affordability/Insecurity/Service Continuity synthetic fixtures；Zoom/Gong/Teams与Gmail/Graph Mail在合成conformance后按成员成熟度和授权进入；
- 消费/服务：闲鱼 manual observation/package、Marketplace Offer Channel fixtures、Upwork/Freelancer.com Service Work Channel fixtures、Taskrabbit Partner Home Services fixtures、Owned App Reviews Channel、Public Extension Marketplace Feedback fixtures、Business Experience Feedback synthetic fixtures；
- 出海：Reddit 先申请匹配用途的明确批准；Product Hunt 先取得商业/API批准并验证当前schema；eBay公共研究先取得匹配用途与衍生分析的书面许可，自有seller面另行授权；
- 产品内验证：Formbricks/Typeform survey 与 GrowthBook/LaunchDarkly experiment 外部 adapter。
- 外部需求量级：先做Google Trends public dataset、Google Ads和Microsoft Ads的合成conformance；alpha、账号、BigQuery与商业百度接口均需另行授权，不能用community scraper补齐。

### P2：有数据再扩展

- 付费数据服务和跨国商业 API；
- 更多招聘聚合站、评论站和垂直市场；
- 大规模 Airbyte replication；
- browser-assisted adapter 仅在条款允许、用户明确选择和有可见人工确认时单独立项。

## 15. 平台证据卡模板

每个平台 × capability 单独维护：

```text
platform / capability / account type
research value / probe value / target vertical
mode / official docs / terms / checkedAt / confidence
auth / scopes / rate / price / retention / deletion
adapter project / version / license / maintenance
preview / idempotency / receipt / reconcile / manual fallback
PII fields / rights basis / policy findings
contract test / sandbox probe / last live probe
decision: backlog | reference | manual-only | suspended | rejected
```

只有官方能力证据和 connector instance live probe 同时存在，才能从 `registered` 进入 `callable`。开源项目 README、浏览器可操作和一次 HTTP 成功都不能替代这两项。
