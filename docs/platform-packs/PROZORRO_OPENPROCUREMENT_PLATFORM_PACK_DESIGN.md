# Prozorro / OpenProcurement Lifecycle Platform Pack 设计

状态：`researched / concept+official-route-fixture / docs-source-version-gated / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`prozorro-openprocurement-lifecycle/v0-design`

## 1. 概念与价值

[OpenProcurement API docs](https://prozorro-api-docs.readthedocs.io/en/latest/)描述REST/JSON的plan、tender、award、contract、agreement/framework及change/implementation对象；[feed contract](https://prozorro-api-docs.readthedocs.io/en/latest/basic-actions/feed.html)按`public_modified`排序并返回opaque offset、`next_page`和minimal fields。它可观察从计划到合同变更/完成的platform-native lifecycle，但不能证明现实采购市场完整、合同成功、供应商收款或争议事实。

| Native concept | `PublicProcurement*` | 关键边界 |
| --- | --- | --- |
| plan/tender/lot | plan/procedure/lot | plan与open tender不是同一需求事件 |
| award | award | awarded state不等于signed/active contract |
| contract/eContract | contract | pending/active/change/completion/cancellation分revision |
| change/implementation/transaction/milestone | amendment/execution | platform field authority与measure definition保留 |
| agreement/framework | framework | call-off/contract relation需native evidence |
| feed minimal row | feed representation | ID/dateModified不是完整record；detail另取 |

data model“modeled along OCDS with extensions”不等于每个native JSON是official OCDS release；source representation标native API，只有明确OCDS export才可标OCDS。

## 2. Route fixture、版本门与写隔离

route fixture固定documented API family、resource kind、`public_modified`排序、opaque offset、next/prev、limit、mode、`opt_fields`、detail relation、JSON/error和rate policy。`mode=test`是test-object filter，不等于系统已授权sandbox调用。本轮未调用production或sandbox。

当前latest docs页面仍标`openprocurement.api 2.5`，而official source `ProzorroUKR/openprocurement.api@cdfdff5`的`pyproject.toml`标2.7.40；因此Pack有docs-source-version gate。未解释差异前，2.5 route fixture不能自动声称2.7.40 production conformance。

GET/read与POST/PUT mutation、API key、owner token严格分PortBinding；创建/修改plan/tender/award/contract/change、上传document、complaint/violation report及任何broker action全部拒绝。detail缺失时不使用HTML、mirror、community MCP/client或其他成员fallback。

## 3. Rights、OSS、Skill与验证

official source revision为Apache-2.0，只静态用于data-model、schema和docs drift；`open-contracting/standard@e6b5503`与`kingfisher-collect@77cc188`只作normative/negative-fixture reference，不安装或执行。数据、documents、bid/complaint content、identity和retention仍以exact platform policy/record rights为准。

普通projection排除natural-person party、contact/address、bidder detail、complaint/violation narrative和confidential documents。`prozorro-source-contract-research/v1`只读official docs/fixed source；`prozorro-procurement-conformance/v1`只用synthetic plan/tender/award/contract/feed fixtures。

fixtures覆盖plan→tender→award→contract、multi-lot/multi-award、pending→active contract、change before/after apply、completion vs cancellation、framework call-off、feed same-timestamp opaque cursor、minimal row→detail common-origin、mode=test not sandbox authority、docs 2.5/source 2.7.40 mismatch、unknown extension、personal/confidential drop、write payload rejection和zero external effects。

Telemetry按`resource kind × procedure/lot/award/contract × native status × public_modified watermark × schema/docs/source revision`记录feed gaps/replays、identity/history/relation conflicts、detail coverage、unknown extensions、privacy/rights blocks、rate/lag drift和zero writes。任何 sandbox、document、bid/complaint content或durable materialization均需用户另批。

