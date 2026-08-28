# Statistics Canada Monthly Business Openings & Closures Platform Pack

## 1. 选择与边界

Statistics Canada MBOC提供employer businesses的monthly opening、closure、continuing、active、reopening、entrant、temporary closure与exit aggregates。它是employment-transition population，不是企业注册、法人存续、bankruptcy或全部含non-employer business的business population。

本Pack只定义PID/WDS/method contract；不请求data point、CSV/SDMX file或restricted microdata，不实现Connector。

## 2. 稳定概念与能力

- [program metadata](https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvey&Id=1582307)固定target population为reference month至少一名employee并有payroll deduction remittance的Canada businesses，并排除agriculture、fishing/trapping、private household services、religious organizations与public administration等范围。
- opening为current month有employment而previous month无；closure相反；continuing在两个月均有employees；active为opening+continuing。它们是相邻月transition，不是legal birth/death。
- reopening是opening且更早月份曾active；entrant是opening但此前未active。closure不必然exit，opening也不必然entrant。
- exit基于LEAP annual exit；近期使用closures longer than six months的regression预测，最后六个月不发布exit。temporary closure是closure与exit之差，不能把模型差额当identified business state。
- industry/geography为减少分类变化造成的volatility而在一段时间内held constant；这不是企业真实地点/行业从未变化。
- 每个新月会因seasonal adjustment与新的Business Register vintage修订历史；concept/source/classification/method变化还会触发occasional revision。MBOC是administrative census，主要quality concern为non-sampling errors，仍有confidentiality suppression。

## 3. 接入、权利与成熟度

- official table为[33-10-0270-01 / PID `33100270`](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3310027001)，发布seasonally adjusted monthly counts，含Canada/province/territory/CMA及NAICS breakdown；table correction与release date必须形成lineage。
- [WDS guide](https://www.statcan.gc.ca/en/developers/wds/user-guide)提供PID metadata、coordinate/vector、changed-cube/series、full-table CSV/SDMX与delta机制。exact data family仍须绑定PID、coordinate、status/scalar/symbol，不使用标题搜索fallback。
- [Open Licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence)要求exact source/adaptation notice、no endorsement/no misrepresentation，并禁止linking以尝试识别person/business/organization。
- fixed client：[pbouill/statistics-canada@`419e087`](https://github.com/pbouill/statistics-canada/tree/419e0870fb6dc36b16a522d160be9b3aa63cd24e)，GPL-3.0，typed WDS client；它不固定MBOC PID/lifecycle/revision，且README记录部分POST endpoint 503 posture。
- fixed community MCP：[Aryan-Jhaveri/mcp-statcan@`ff34ecd`](https://github.com/Aryan-Jhaveri/mcp-statcan/tree/ff34ecd7462000ac4e23b7b2f1076d93e22b3f33)，MIT，提供WDS/SDMX/CLI/hosted/local/optional SQLite；README明确提醒LLM可能fabricate，hosted processor与DB/download surface不进入信任边界。两者均未安装或执行。
- 未发现Statistics Canada维护、同时固定MBOC transition、exit projection、temporary closure、classification holding与revision的domain Agent Skill。

成员成熟度：`concept-fixture / exact official machine route-fixture / official table-or-bulk route-fixture / selected-manual`；`callable=0 / durable=0`。

## 4. Fixture与拒绝条件

fixture必须固定PID、employer population、adjacent-month activity transition、opening/entrant/reopening、closure/temporary closure/exit、SA、held classification、modelled exit、status/suppression与revision vintage。opening→new legal business、closure→permanent exit、reopening→new entrant、temporary closure→observed firm label、active→all businesses、SA→NSA、classification held→actual unchanged、latest vector→full history、generic WDS/MCP→domain callable一律拒绝。

