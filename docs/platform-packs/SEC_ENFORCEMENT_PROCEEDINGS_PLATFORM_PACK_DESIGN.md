# US SEC Enforcement Proceedings Platform Pack 设计

状态：`researched / concept+official-feed-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`us-sec-enforcement-proceedings/v0-design`

## 1. 概念与价值

SEC分别公开[Litigation Releases](https://www.sec.gov/enforcement-litigation/litigation-releases)和[Administrative Proceedings](https://www.sec.gov/enforcement-litigation/administrative-proceedings)，并在[RSS Feeds](https://www.sec.gov/about/rss-feeds)提供官方更新入口。它可揭示issuer/intermediary/disclosure/trading/control流程的监管摩擦，但release只是一类官方representation，不能替代complaint、order、judgment或完整docket。

| Native concept | `PublicRegulatoryEnforcement*` | 约束 |
| --- | --- | --- |
| litigation release | official release/document | release number不是court docket |
| administrative proceeding/release | proceeding/instrument | institution、initial decision、Commission order分开 |
| complaint/charge | alleged assertion | 不能从headline生成finding |
| judgment/order/settlement | decision/obligation | admission/no-admission、entered/effective逐instrument |
| appeal/review/remand | history/relation | finality与pending review并存 |

## 2. Feed route fixture

concept capabilities为official feed discovery、entry read、release/proceeding identity和selected document reference。route fixture只覆盖官方RSS GET、feed identity、entry GUID/link/title/date、conditional request、pagination/history limit、content type和terms/robots/attribution revision；它不宣称feed给出全量case history，也不自动follow/download documents。本轮没有请求feed。

官方EDGAR filing与enforcement proceeding不是同一population。`SEC-API-io/sec-edgar-mcp@30763cb`虽为MIT code，但依赖商业transformed service/API key及其terms，不是SEC official route，禁止执行或fallback。

## 3. 法律、隐私与验证

release、complaint、order、judgment和feed entry以common-origin relation连接；court与SEC administrative matter保持各自identity。penalty/disgorgement/prejudgment interest/redress必须保留amount role，不能推断已收款或可比较。natural-person respondent/witness/contact/address默认drop；不得做guilt、investment或counterparty ranking。

synthetic fixtures覆盖feed entry→release→complaint common-origin、administrative vs court identity、settlement no admission、final judgment stayed/appealed、order vacated/remanded、amount roles、corrected release、feed history gap、natural-person drop、commercial provider fallback rejection和filing/contact zero effects。metadata feed canary和document reads均需用户批准。

