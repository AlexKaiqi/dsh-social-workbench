# Public Ombudsman Determinations & Reported Remedies 候选分诊

状态：`researched / selected-for-concept-fixtures`  
核验日期：2026-08-26  
决策ref：`public-ombudsman-determinations-triage/2026-08-26`

## 1. 第一性目标

本Channel要发现的是：正式纠纷处理中，由独立公共申诉专员公开确认的投诉议题、服务失误、裁决结果和救济要求。它不是“机构黑榜”，也不是把单案裁决当普遍法律、总体投诉分母或独立重复需求。

监管执法与申诉专员裁决必须分开。前者围绕authority对被监管主体的allegation/finding/order；后者围绕complainant与respondent的dispute、investigator view、preliminary/final decision、acceptance/binding、remedy和appeal。最小稳定模型因此采用`PublicDisputeDecision*`，强制分离：程序stage、native outcome、binding status、remedy status、appeal/stay和reported compliance。

## 2. 候选比较

| 候选Channel | 需求价值 | 官方可验证性 | 主要风险 | 决策 |
| --- | --- | --- | --- | --- |
| Public Ombudsman Determinations & Reported Remedies | 单案裁决直接描述服务摩擦、处理失败和具体救济 | 多个官方公开decision database，Housing另有official RSS链接 | 隐私、发布选择、程序差异、把救济误当履行 | **当前选择** |
| Patents & Technical Claims | 揭示技术solution space | 多国官方API成熟 | 离用户痛点和资源承诺更远 | 后续候选 |
| Broad Public Litigation | complaint、judgment、damages可能揭示高成本痛点 | 部分法院有官方检索/API | party allegation、许可、自然人、跨法院程序过宽 | 后续窄域审查 |

选择本Channel是因为它补上`complaint → investigation → determination/outcome → remedy → binding/compliance`缺口，又能比宽泛诉讼更清楚地限定authority、published population和隐私边界。

## 3. 入选成员与成熟度

| Member | 价值 | 只读公开surface | 当前fixture |
| --- | --- | --- | --- |
| UK Financial Ombudsman Service | 金融产品、business、upheld/not upheld与final-decision acceptance语义 | 官方decision database、process pages、selected decision | concept + selected record |
| UK Pensions Ombudsman | pensions complaint/dispute、topic、outcome、final binding determination | 官方decision database、investigation/appeal pages、selected determination | concept + selected record |
| Ireland FSPO | sector/product/conduct/outcome、legally binding decision和remedy | 官方decision database、process/redress/appeal pages、selected decision | concept + selected record |
| UK Housing Ombudsman | landlord、category、maladministration outcome、orders与publication lag | 官方decision database、guidance和页面声明的RSS | concept + route |

成熟度严格为requested=4、concept-fixture=4、route-fixture=1、selected-record/manual=3、callable=0、durable-approved=0。Housing RSS仅是官方页面静态声明的route fixture；本轮未请求feed payload，schema/pagination/history仍待后续门。

## 4. 官方语义与缺口

- [FOS decisions](https://www.financial-ombudsman.org.uk/businesses/resolving-complaint/ombudsman-decisions)说明数据库公开final decisions，并按产品、business、日期和upheld过滤；[decision process](https://www.financial-ombudsman.org.uk/who-we-are/make-decisions)说明investigator assessment不等于final decision，且final decision通常仅在complainant及时接受后约束business。
- [TPO decisions](https://www.pensions-ombudsman.org.uk/decisions)公开不同类型和outcome的determinations；[investigation process](https://www.pensions-ombudsman.org.uk/investigation-process)把Adjudicator view、preliminary decision与final Determination分开；[appeal guidance](https://www.pensions-ombudsman.org.uk/how-appeal)说明final determination对各方有约束力并可就法律问题上诉，direction在法院stay/sist前仍可执行。
- [FSPO decisions](https://www.fspo.ie/complaint-outcomes/investigation-services/legally-binding-decisions/display.asp)按sector/product/conduct/outcome/year/ref公开；[services](https://www.fspo.ie/our-services/)说明preliminary decision后才签发legally binding decision，双方可在35日内向High Court上诉；[redress](https://www.fspo.ie/complaint-outcomes/Compensation/)说明direction与compensation能力有complaint-domain差异。
- [Housing decisions](https://www.housing-ombudsman.org.uk/decisions/)公开去resident姓名的决定、landlord、outcome和orders；[decision guidance](https://www.housing-ombudsman.org.uk/about-us/corporate-information/policies/guidance-on-decisions/)定义maladministration、reasonable redress等结果和发布节奏。页面静态HTML声明`https://www.housing-ombudsman.org.uk/decisions/feed/`，本轮未请求该feed。

AFCA官方页面本轮返回HTTP 403；LGSCO页面出现TLS certificate错误；EU Ombudsman页面未获得稳定机器合同。它们只记录为`discovery-incomplete`，不使用镜像、内部endpoint或community fallback。

## 5. OSS、Skill与晋级门

本轮GitHub平台专属项目检索遇到HTTP 429；常规搜索未定位到可接受的platform-specific connector。这个结果只表示`discovery-incomplete`，不证明项目不存在。generic scraper/MCP不能升级成官方route，也不会被clone、安装或执行。

建议`public-ombudsman-source-contract-research/v1`只读官方docs与固定静态source，输出Pack/drift proposal；`public-ombudsman-conformance/v1`只执行synthetic fixtures。未来`approved-public-ombudsman-read/v1`必须绑定用户批准的exact member/resource/filter/window/field allowlist/budget/purpose/retention；当前无binding。

complaint filing、evidence submission、decision acceptance/rejection、appeal、contact、subscription和任何对外测试都是高影响副作用，本Channel没有Probe。普通projection必须drop complainant/resident natural-person name、initial、address、contact和personal case identifier；respondent organization仅保留opaque ref且不得排名。
