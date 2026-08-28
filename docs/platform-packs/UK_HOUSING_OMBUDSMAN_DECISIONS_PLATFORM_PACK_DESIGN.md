# UK Housing Ombudsman Decisions Platform Pack 设计

状态：`researched / concept+official-feed-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`uk-housing-ombudsman-decisions/v0-design`

## 1. 概念与价值

[Housing Ombudsman decisions](https://www.housing-ombudsman.org.uk/decisions/)公开2020年12月以来的决定，可按landlord、complaint type/category、outcome、tenure和orders筛选。它能揭示repairs、communication、complaint handling、policy和服务恢复中的具体失误及整改要求。

| Native concept | `PublicDisputeDecision*` | 约束 |
| --- | --- | --- |
| complaint/case | case identity | published decisions存在约三个月lag和withholding policy |
| multiple findings | finding records | partial maladministration保留各issue outcome |
| maladministration/severe/no maladministration | native outcome + family | 不跨ombudsman scheme排名 |
| reasonable redress | native outcome | 不等于no maladministration，也不证明resident满意 |
| order: apology/compensation/repair/policy/training | remedy | order不证明completed或paid |
| landlord | respondent organization opaque ref | resident identity必须drop，禁止landlord ranking |

## 2. Feed与record fixture

[decision guidance](https://www.housing-ombudsman.org.uk/about-us/corporate-information/policies/guidance-on-decisions/)定义outcomes、anonymisation与发布节奏；decisions页面静态HTML明确链接official RSS `https://www.housing-ombudsman.org.uk/decisions/feed/`。route fixture只固定official link、GET/conditional-request候选、entry identity/link/date、common-origin和terms revision gate。本轮未请求feed payload，所以schema、pagination、retention和history仍是unknown，不能callable。

concept capabilities为official filter discovery、selected decision metadata/document reference、outcome/order taxonomy和publication policy observation。禁止把HTML/internal search endpoint或generic scraper作为fallback。

## 3. 隐私、物化与验证

官方decision不含resident姓名，但ordinary projection仍drop resident/household、地址、contact、tenancy/account ref和可重识别case detail。landlord仅用opaque organization ref，分析视图不得形成landlord performance ranking。

synthetic fixtures覆盖多issue partial maladministration、reasonable redress vs no maladministration、severe maladministration、outside jurisdiction、order未完成、published lag、withheld decision不是negative outcome、page/PDF/RSS common-origin、resident drop、feed unavailable无HTML fallback和complaint/contact/subscription zero effects。feed metadata canary、document、history和durable materialization均需另批。
