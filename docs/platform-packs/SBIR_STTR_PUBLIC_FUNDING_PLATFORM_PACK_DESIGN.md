# SBIR.gov / STTR Innovation Funding Platform Pack 设计

状态：`researched / synthetic-fixture-eligible / API-degraded / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`sbir-sttr-public-funding/v0-design`

## 1. 定位与原生对象

本Pack表达SBIR/STTR公开的solicitation、topic/subtopic、award和funded company/project，不覆盖proposal/application正文、评审、company account、SAM数据或submission。

[Data Resources](https://www.sbir.gov/data-resources)把数据明确分为Solicitations & Topics、Awards和Companies：solicitation是高层时间/机会，topic是具体技术领域；award从program inception提供API和bulk，且download字段可能多于API。Phase I/II与SBIR/STTR program是原生programme/phase，不是项目成熟度或成功等级。

## 2. API、bulk与coverage

[Solicitation API](https://www.sbir.gov/api/solicitation)当前标记under maintenance。文档仍给出JSON/XML、agency/open/closed/keyword查询、solicitation→topics→subtopics结构、默认25/最大50 rows与offset pagination，默认按close date倒序；这些只足够做静态fixture，不能声明live health。

Award页面说明数据持续更新、通常至少24小时反映新增，full files按月刷新，interactive download每次最多10,000；有abstract与无abstractbulk是不同representation。年度数据存在completion lag，API与download字段不同，故必须记录generatedAt/schema/coverage，不可用“本年较少”推断投入下降。

solicitation/topic与award只在provider给出exact topic/solicitation relation时连接；标题、keyword、company或时间相似只能形成candidate。company、research institution和个人联系人默认restrict/drop；award abstract是recipient/project statement，不是政府认可的结果。

## 3. Rights、Skills与开源候选

本轮未定位到独立、明确的SBIR dataset reuse license或官方MCP/Agent Skill；公开可下载和政府来源不自动解决third-party abstract、company data、attribution、AI/index和长期留存。相关字段在exact terms/data license确认前只用于synthetic fixture。

社区API wrapper、聚合型government-market-intelligence服务和scraper不进入route；它们不能在官方API maintenance时成为silent fallback。本Pack未安装、执行或请求任何candidate。

## 4. Fixture、观测与晋级

`sbir-sttr-contract-research/v1`固定API/data dictionary/bulk/update/license证据；`sbir-sttr-fixture/v1`验证solicitation/topic/subtopic、SBIR/STTR、Phase I/II、open/future/closed、multiple due dates、topic-award exact/candidate relation、API-vs-bulk schema、abstract/no-abstract和identity drop。

Telemetry按`API/bulk representation × schema/data-dictionary revision × programme/phase/agency/topic × fiscal year/window`记录maintenance health、returned/retained/dropped、pagination/10K cap、bulk generation/lag、year completeness、API/download field gap、identity/abstract quarantine、license status与zero submit/write。晋级必须先解除API maintenance或固定可重复bulk route，并取得exact reuse/AI/index依据；没有browser/scraper fallback。
