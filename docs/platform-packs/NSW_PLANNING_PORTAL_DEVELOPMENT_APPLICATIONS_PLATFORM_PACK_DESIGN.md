# NSW Planning Portal Development Applications Platform Pack 设计

状态：`concept-fixture + catalogue/schema fixture / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`nsw-planning-portal-development-applications/v0-design`

## 1. 稳定概念与官方证据

[Online DA Data API catalogue](https://www.planningportal.nsw.gov.au/opendata/dataset/online-da-data-api)描述2019年以来online DA feed、2021年起council强制使用与daily refresh；[data dictionary](https://www.planningportal.nsw.gov.au/opendata/dataset/online-da-data-api/resource/95279ab6-b115-4300-bb21-30461dae3985)提供字段语义。但当前公开catalogue未给出足以审计的exact public API route，只列资源与Data Broker联系，因此成熟度保持catalogue/schema fixture，禁止猜测endpoint。

[DA exhibitions](https://www.planningportal.nsw.gov.au/daexhibitions)展示由参与council选择公开的申请；[State Significant Development exhibition](https://www.planningportal.nsw.gov.au/major-projects/assessment/state-significant-development/ssd-process/exhibit-da)与[responding to submissions](https://www.planningportal.nsw.gov.au/major-projects/assessment/state-significant-development/ssd-process/respond-submissions)描述exhibition、submission、submissions report、applicant response和可能amendment。不同DA/SSD/council process不能混成一个统一窗口或authority chain。

[NSW Planning privacy policy](https://www.planning.nsw.gov.au/privacy)说明submission可收集姓名、地址、email、IP、政治捐赠等信息，并可能公开姓名/郊区/捐赠声明或转交IPC、authorities和applicant。用户可请求withhold name，但submission body仍可能重识别；公开可见不等于允许长期全文画像。

## 2. 概念映射

| Native | `PublicPlanningApplication*` |
| --- | --- |
| DA / SSD / council process | process + jurisdiction + legal/process revision |
| application / exhibition | application revision + consultation window |
| support / object / comment | representation posture；非vote或representative opinion |
| personal / organisation / agency role | representor role；natural-person identity默认drop |
| name withheld | publication rule；不表示body/attachment已匿名 |
| political donation declaration | restricted governance fact；不进普通需求画像 |
| submissions report / response / amendment | assessment/response/version relations |
| determination | competent decision；与officer recommendation分开 |

## 3. 期望只读能力

`definition.read`、`data-dictionary.read`、`selected-public-application.metadata.read`、`exhibition-window.read`、`public-representation.metadata.read`、`submissions-report.metadata.read`与`decision.metadata.read`仅为knowledge/manual fixture。没有exact route前禁止browser HTML或community scraper fallback，也不使用catalogue contact去索取数据。

未来read binding必须锁定exact council/process、participation coverage、application/exhibition population、route/schema、window calendar、renotification、publication/withholding、field allowlist、coarse location、rights、purpose、retention和deletion。representation body/attachment是独立高敏感capability，不能随application metadata自动晋级。

## 4. Synthetic fixtures与zero effects

Synthetic覆盖pre-2021 coverage gap、council opted exhibition≠all DA、open/closed window、late amendment/renotification、support/object/comment count≠people、name withheld但body含身份线索、political donation restriction、agency advice≠decision、applicant response≠authority finding、determined≠approved、catalogue drift与missing route。

本轮仅查看公开list的呈现，未读取detail/document/submission body或保留row。application、submission、attachment、donation declaration、amendment、payment、appeal、contact、subscribe和status/admin mutation全部拒绝，external effects恒为零。
