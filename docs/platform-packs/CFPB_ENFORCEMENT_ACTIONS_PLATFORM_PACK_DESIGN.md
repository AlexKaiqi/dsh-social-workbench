# US CFPB Enforcement Actions Platform Pack 设计

状态：`researched / concept+selected-record-fixture / no-official-api-binding`  
核验日期：2026-08-26  
Pack ref：`us-cfpb-enforcement-actions/v0-design`

## 1. 概念与需求价值

CFPB [Enforcement Actions](https://www.consumerfinance.gov/enforcement/actions/)公开Bureau在federal court或administrative proceeding采取的actions，并提供检索、过滤、case page和相关documents。它可揭示consumer financial product、sales/servicing、disclosure、debt collection、fair lending等高成本摩擦；但action是程序记录，不是抽样调查，也不代表market prevalence。

| Native concept | `PublicRegulatoryEnforcement*` | 约束 |
| --- | --- | --- |
| enforcement action/case | matter + proceeding | court/admin identity分开 |
| complaint/charges | assertion=alleged | 不形成finding |
| consent order/settlement/judgment | instrument + obligation | admission/finality/effectiveness逐document核验 |
| civil money penalty/redress | amount-role obligation | 不推断payment或consumer receipt |
| status/date/topic/product | native state/taxonomy | site filter不是完整population definition |

## 2. 能力与route边界

concept capabilities为official action index discovery、selected case metadata、document reference与revision observation。当前未确认一个versioned、documented、stable public API，因此只有selected synthetic/manual record fixture，没有HTML scraper、internal JSON或pagination contract。页面源码`cfpb/cfgov-refresh@d20bb5d`（CC0）只是官方实现参考，不升级为public API contract。

任何未来read必须先固定official supported route、filter semantics、population/completeness、terms和field allowlist；否则只能人工选择exact public record并保存provenance，不宣称批量coverage。

## 3. 法律、隐私与验证

complaint、stipulation、consent order、final judgment和press release分别建模；`neither admit nor deny`或no-admission条款必须显式保存。organization为opaque ref；natural-person defendant、consumer、witness、contact/address和个人财务细节默认drop。不得生成respondent guilt/risk ranking。

synthetic fixtures覆盖complaint later dismissed、proposed consent not entered、settlement no admission、court vs administrative docket、penalty vs redress、case closed but obligation active、release/document common-origin、natural-person drop、unsupported batch request、route unavailable/no fallback和filing/contact zero writes。任何metadata canary、documents或durable materialization均需用户另批。

