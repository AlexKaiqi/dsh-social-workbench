# Owned Customer Conversation Channel Pack v0.1 设计

状态：researched 组合设计；成员均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：owned-customer-conversation-demand/v0.1-design  
Supersedes：[v0 design](OWNED_CUSTOMER_CONVERSATION_CHANNEL_PACK_DESIGN.md)

## 1. Revision 目的

v0.1 在 Zoom/Gong 两成员基础上加入 [Microsoft Teams Conversation](MICROSOFT_TEAMS_CONVERSATION_PLATFORM_PACK_DESIGN.md)，但不提升任何成员成熟度。Teams 的 calendar-backed v1 read 是 eligible-design；channel/private-channel/ad-hoc 因 v1/beta 文档冲突保持 blocked。组合层允许缺失成员报告，禁止用 Zoom/Gong route 替代 Teams 授权或 coverage。

本 revision 完整继承 v0 的 occurrence/artifact/transcript revision、speaker/role/consent、original-vs-derived、最小 span、privacy/deletion 与 verification 规则；以下只定义增量。

## 2. 三成员 representation

| Semantic | Zoom | Gong | Teams |
| --- | --- | --- | --- |
| occurrence | meeting instance UUID | call ID | tenant + organizer/user + onlineMeeting ID；ad-hoc call ID分开 |
| transcript | VTT recording file | speaker segments/sentences | attributed VTT 或 unattributed timestamped text |
| exact media relation | recording file set | provider/import refs | contentCorrelationId 连接 transcript/recording |
| derived | Smart Recording | topic/tracker/summary/scorecard | 不在 transcript Pack 内；MCP insight独立 |
| policy | disclaimer/consent/sharing | consent/private/redaction | Graph access + speaker attribution + meeting/storage policy |
| lifecycle | processing/edit/regen/trash | processing/redaction/delete | notification/delta、meeting expiry、OneDrive/SharePoint/Purview |

Teams organizer/user ID、meeting ID 与 content URLs 不进入跨成员 canonical identity。只有 native integration/external reference或用户确认 ledger 才能建立 Zoom↔Gong↔Teams relation；calendar title、join URL、时间和 participant similarity均不足。

## 3. Capability resolution 增量

- scheduled calendar-backed Teams onlineMeeting 可尝试 conversation.list/read.owned-transcript/v1 的设计 route；
- speaker attribution被tenant禁用时，route可显式降级为 unattributed transcript，coverage与authorship必须降级，不得改走MCP猜speaker；
- channel/private-channel/ad-hoc请求 fail closed，并生成 documentation-conflict missing-member report；
- notification只作ready hint；organizer delta/getAll 是backfill candidate。late subscription造成的缺口不得声明 complete；
- recording manifest与bytes分开；callRecord diagnostics不进入transcript route；
- Teams RSC、org-wide application、delegated、application access policy、MCP scopes永不互相继承。

## 4. 新增 conformance fixtures

| Fixture | 必须证明 |
| --- | --- |
| Teams attributed vs unattributed formats | speaker-disabled可取无speaker文本，但authorship unknown |
| v1 page vs overview/beta conflict | surface逐项blocked，不以“Graph可用”泛化 |
| calendar-backed vs standalone onlineMeeting | 后者不进入transcript coverage denominator |
| exact contentCorrelationId | 只关联Teams transcript/recording，不跨平台去重 |
| subscription created after transcription starts | push缺失，backfill/coverage gap显式 |
| subscription expiration/lifecycle failure | health degraded；不推断没有新transcript |
| delta nextLink/deltaLink | opaque token原样持久化，完整round后才推进checkpoint |
| Teams speaker + Zoom/Gong disagreement | 三representation并存，review不选全局真值 |
| Teams MCP succeeds but raw transcript route blocked | 不绕过Graph permission/tenant/speaker/field政策 |
| Teams retention/hold vs member deletion | 各成员独立tombstone；relation不授权保留副本 |

## 5. 晋级门

v0.1 仍是 researched。组合晋级需要三份成员 VerificationReport；允许 Teams 以明确 missing/blocked 成员存在，但 channel report 必须降低 coverage，不能把 roster 三成员写成“三平台已支持”。Teams 文档冲突消除、synthetic tenant static/fixture/live read、subscription backfill与storage deletion drill完成后，才发布下一 revision。任何真实 transcript、recording bytes、MCP、bot/recording或平台写仍需用户另行明确授权。
