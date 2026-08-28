# US FTC Cases & Proceedings Platform Pack 设计

状态：`researched / concept+selected-record-fixture / no-official-api-binding`  
核验日期：2026-08-26  
Pack ref：`us-ftc-cases-proceedings/v0-design`

## 1. 概念与价值

FTC [Legal Library](https://search.ftc.gov/legal-library/search)汇集Cases and Proceedings及complaint、order、decision、settlement、appeal、dismissal等documents/timeline。该surface能揭示competition、privacy/security、advertising、consumer protection和market-design痛点；但case list不是market denominator，FTC allegation、Commission finding与court judgment不能互换。

| Native concept | `PublicRegulatoryEnforcement*` | 约束 |
| --- | --- | --- |
| case/proceeding | matter/proceeding | Part 3与federal court程序分开 |
| timeline event | history record | publication date不总是effective date |
| complaint | alleged assertion | 不等于Commission/court finding |
| consent agreement/order/decision | instrument + obligation | proposed/final/effective独立 |
| appeal/dismissal/closing | relation + lifecycle | closed不证明义务完成 |

## 2. 能力、route与rights

concept capabilities为official search/filter discovery、selected case timeline、document reference和revision observation。当前未确认官方versioned public API，所以不建立HTML/internal endpoint route fixture，不从搜索结果反推total completeness。未来supported route需要单独合同审查。

case page、press release、Federal Register notice和document若同源必须common-origin；parallel DOJ/state/court action保持独立identity。自然人party、consumer、witness、contact/address和个人identifier在ordinary projection中drop。document reuse、external indexing、retention和attribution逐representation审核。

## 3. Fixture与晋级

synthetic fixtures覆盖administrative complaint pending、proposed consent waiting comment、final order later modified、no-admission settlement、Commission finding appealed/vacated、federal action parallel、case closed with continuing reporting、duplicate release/document、natural-person drop、no official API/no scraper fallback和comment/filing zero effects。

selected metadata canary、document content、timeline history和durable storage均需用户批准。Public comment、complaint/report、filing、contact和subscription不属于Probe。

