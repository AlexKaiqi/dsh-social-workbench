# UK CMA Cases Platform Pack 设计

状态：`researched / concept+official-feed-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`uk-cma-cases/v0-design`

## 1. 概念与价值

UK Competition and Markets Authority的[CMA Cases](https://www.gov.uk/cma-cases)按case type、state、market sector、outcome等公开case finder与case pages，并提供official feed。它可发现competition、consumer protection、merger、market study/investigation中的结构性摩擦；但market study、merger review、consumer enforcement和cartel investigation的procedure/outcome不可压成统一“violation”。

| Native concept | `PublicRegulatoryEnforcement*` | 约束 |
| --- | --- | --- |
| CMA case | matter/case | case type决定population/procedure |
| phase/state/outcome | native state/lifecycle | closed不等于infringement |
| investigation/statement/decision | assertion/instrument | concern、provisional finding、final decision分开 |
| undertaking/order/direction | remedial obligation | proposed/accepted/effective/varied独立 |
| appeal/review | relation/history | CAT/court identity不并入CMA case |

## 2. Feed与record fixture

concept capabilities为official case finder/filter discovery、feed entry read、selected case metadata/document reference和revision observation。route fixture只覆盖页面公开的official feed URL、GET、entry identity/link/date、conditional request、history limit和GOV.UK/CMA terms revision；不把HTML filter或内部search endpoint包装成API。本轮没有请求feed或case documents。

case finder filters不是完整法定taxonomy；market sector不是需求market size。case page、feed、press release和document同源去重，parallel CAT/court proceeding另建identity/relation。

## 3. Rights、隐私与验证

每次snapshot固定Open Government Licence或页面声明、第三方例外、attribution、personal-data/retention和external indexing policy。natural-person party、witness、consumer/contact/address默认drop；ordinary analytics只保留organization/case opaque refs。

synthetic fixtures覆盖provisional concern→no-action close、undertaking proposed vs accepted、final decision appealed/stayed、decision quashed/remitted、market study不生成violation、parallel CAT case、feed/page/document common-origin、filter taxonomy drift、natural-person drop、route unavailable/no fallback和contact/submission zero effects。feed metadata canary、documents、history和durable materialization需用户另批。

