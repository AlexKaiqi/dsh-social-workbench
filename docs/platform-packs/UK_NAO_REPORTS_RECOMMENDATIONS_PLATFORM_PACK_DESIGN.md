# UK NAO Reports & Recommendations Platform Pack 设计

状态：`researched / concept+selected-record-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`uk-nao-reports-recommendations/v0-design`

## 1. 概念与价值

[NAO Reports](https://www.nao.org.uk/reports/)与[Report archive](https://www.nao.org.uk/report-archive/)覆盖value for money、financial audit及其他报告类型。每个report type、audited body、objective/scope、finding、conclusion和recommendation保持原生语义，不把所有报告都解释为同一assurance或痛点强度。

[Recommendations tracker](https://www.nao.org.uk/recommendations-tracker/)链接外部Shiny应用。官方公开的[FOI 1694说明](https://www.nao.org.uk/wp-content/uploads/2024/06/foi-1694.pdf)显示tracker通常在3月和9月更新；按audited body维护report title/date、recommendation text/number/page、recipient、acceptance、implementation status及expected/actual date。被审计方提供状态，NAO索取evidence并另存“NAO confirmation”。

## 2. 概念映射与边界

| Native concept | 抽象 | 约束 |
| --- | --- | --- |
| report/recommendation | report + recommendation | 必须保留report type和page identity |
| audited body acceptance | response status | agreed不等于implemented |
| audited body implementation | auditee self-report | 不能标auditor-confirmed |
| NAO confirmation | auditor confirmation | 只覆盖已审范围和时点 |
| tracker update | selected follow-up revision | 不是全部NAO建议的实时状态 |

当前仅允许selected official-record/manual fixture。Shiny应用和网站的generic root feed没有版本化、recommendation-specific官方machine contract，不能声明route fixture，也不得以HTML/internal endpoint逆向替代。

## 3. 物化、验证与effects

Dolt保存Pack、report/response/implementation taxonomy、tracker process/update digest、identity/relation review和lineage；分析库只接获准的最小report/recommendation/audited-body opaque ref/status。动态视图必须并列显示auditee reported和NAO confirmed，并注明tracker population/update cadence。

fixtures覆盖accepted但未实施、自报implemented但NAO未确认/部分确认、report page与tracker同源、tracker缺项不作negative、generic feed不升级route、自然人/contact drop，以及request audit、submit evidence、contact、subscribe、status update全部拒绝并保持zero effects。
