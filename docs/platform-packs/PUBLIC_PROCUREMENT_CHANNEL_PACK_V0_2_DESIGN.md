# Public Procurement Demand Channel Pack v0.2 设计

状态：`researched` 组合 revision；成员均未发布、未调用  
核验日期：2026-08-26  
Channel Pack ref：`public-procurement-demand/v0.2-design`  
Supersedes：[v0 design](PUBLIC_PROCUREMENT_CHANNEL_PACK_DESIGN.md)

## 1. 本 revision 的目标

v0 只用 SAM.gov 与 EU TED 证明跨 jurisdiction 的采购 projection。v0.2 新增 CCGP 与 UK Find a Tender，验证两个更困难的不变量：

1. 同一 Channel 可以组合 `official-api` 与 `manual-only` 成员，但不能伪装成统一自动化 coverage；
2. provider-native、provider-projection（OCDS）、presentation 和 manual-extract 必须保留 representation 语义；
3. query-driven channel 需要一等 `ChannelScopeRevision`，不再把 query portfolio 塞进 roster extension。

```text
SAM.gov public API ─────────┐
EU TED Search API ──────────┤
UK Find a Tender OCDS ──────┼─> public-procurement-demand/v0.2
CCGP manual-first ──────────┘      ├─ ChannelScopeRevision
                                   ├─ stage/value/lot projection
                                   ├─ representation + history policy
                                   └─ per-entry coverage/maturity
```

## 2. 成员与成熟度

| Member | Surface | Representation | Adoption |
| --- | --- | --- | --- |
| [SAM.gov](SAM_GOV_OPPORTUNITIES_PLATFORM_PACK_DESIGN.md) | public-key API v2 | provider-native JSON / latest-only | eligible after verification |
| [EU TED](EU_TED_PLATFORM_PACK_DESIGN.md) | anonymous Search v3 + notice formats | provider-native eForms/TEDXML + search projection | eligible after verification |
| [UK Find a Tender](UK_FIND_A_TENDER_PLATFORM_PACK_DESIGN.md) | anonymous OCDS API 1.0 + XML | provider-projection OCDS 1.1.5 | eligible after verification |
| [CCGP](CCGP_PUBLIC_PROCUREMENT_PLATFORM_PACK_DESIGN.md) | selected public notice/file | presentation/manual-extract | manual-only |

Channel 成熟度按 entry/capability 计算。CCGP manual-only 不阻止其他三成员各自 verified，但任何包含 CCGP 的“自动 portfolio complete”声明都必须失败；它只能形成 manual-selected coverage。

## 3. ChannelScopeRevision

`ChannelScopeRevision` 是本 revision 的查询分母：

| 字段 | 契约 |
| --- | --- |
| Channel Pack ref | 固定 v0.2，不随成员更新漂移 |
| member Pack ref | 固定具体 Platform Pack version |
| platform surface | SAM endpoint、TED Search、FTS OCDS、CCGP selected portal surface |
| query profile | dialect + schema-bound template + window policy；manual entry 可无 query |
| included/excluded | jurisdiction、regime、stage、taxonomy、date、document、threshold 明示 |
| valid window | query或政策变化追加新 revision |
| evidence | 官方 coverage/access/rights证据 |

每个 run 的 `CollectionPlan.Query/Window` 是 scope template 的具体实例；scope revision不是运行 checkpoint。ATS 的 `ChannelRosterRevision` 仍用于枚举 board/site，采购不再复用它。`ChannelVerificationPlan` 可引用 Scope；静态契约要求 Roster 或 Scope 至少一个，且不能同时含冲突分母。

## 4. 公共 Projection v0.2

在 v0 stage/jurisdiction/amount/lot/document 字段上新增 representation 和 access maturity：

| 字段 | 规则 |
| --- | --- |
| representation kind | provider-native/provider-projection/presentation/manual-extract |
| source schema | API/notice/OCDS/HTML fixture schema ref |
| standard/version/extensions | FTS 固定 OCDS 1.1.5 + package extensions；其他成员不冒充 OCDS |
| mapping ref/known losses | provider/reviewed mapper 与重要信息损失 |
| access maturity | automated-eligible/manual-only/deferred，逐 observation 保留 |
| native history coverage | complete/latest-only/partial/unknown |
| collection coverage | per query/page/scope entry，不从 representation 推断 |
| legal regime | US federal / EU eForms-or-legacy / UK PA2023-or-legacy / PRC government procurement |

OCDS 是有价值的 channel vocabulary 参考，但只有 FTS 官方输出能标 `provider-projection: OCDS`。将 SAM/TED/CCGP 自行映射到 OCDS 时，只能生成下游 derived projection，固定 mapper/version/known losses；不能把 source Observation 的 representation 改成 OCDS，更不能改写原生事实。

## 5. Identity、stage 与 relation

- canonical key 始终含 platform + native notice/release identity；跨 publisher OCID、项目编号或标题不能合并。
- FTS record/release、TED procedure/notice、SAM notice/solicitation、CCGP project/notice/package 分别保留。
- common stage 只做导航：planning/market-engagement/tender/direct-award/award/contract/change/performance/termination/unknown。
- 原生 code/notice type 必填；common stage 不决定“可投标”，还需 deadline、open status、资格/外部 portal evidence。
- native relation 优先；collector hash diff 只能 observed relation；manual inferred link 标 confidence/evidence。
- 一个 process 可含多 lot/contract；一个 notice 也可覆盖多 contract，projection 不强制 1:1。

## 6. Coverage v0.2

```text
transport completion
  -> query/window completion
    -> ChannelScopeEntry completion
      -> automated portfolio coverage
      + manual-selected coverage (separate)
```

- SAM/TED/FTS 按各自 API 和 history限制计算 automated coverage；
- CCGP 只能报告 selected notices/files，不能进入 automated denominator；
- v0.2 report 同时输出 `automatedEntries`、`manualEntries`、`deferredEntries` 和 missing-source report；
- 所有 enabled automated entries 成功不等于整个四国/地区采购市场完整；法定阈值、地方/其他门户、框架内调用、非公开采购和外部文件仍是 exclusions；
- FTS OCDS record完整度、FTS API cursor完整度和英国法定发布覆盖是三种不同 assertion；
- CCGP中央主网“一站式查询”政策目标不能被一次手工选择解释为数据集全量性。

## 7. Channel Skills v0.2

### `public-procurement-scope-curation/v0.2`

- 建议 scope entries/query profiles/manual source sets；
- 检查每个 entry 的 access maturity、representation、rights 和 coverage denominator；
- 禁止自动把 CCGP internal HTML endpoint、FTS integration Swagger 或 community crawler加入 route。

### `public-procurement-demand-research/v0.2`

- 编排 verified automated members 与用户显式提交的 manual observations；
- 输出两套 coverage，不因 manual source缺失阻塞 automated members，也不把 automated结果冒充manual member覆盖；
- common projection始终保留member Pack、snapshot、representation、native history和mapping provenance。

### `public-procurement-channel-conformance/v0.2`

- 先引用每个 member VerificationReport；CCGP 可引用 fixture/manual report，不能伪装 sandbox-live；
- 验证 mixed maturity、OCDS mapping loss、regime/stage、identity/relation、document rights 和 partial degradation。

无 Probe Skill；采购平台 evidence 只能输入到其他获准渠道的 ProbePlan。

## 8. Verification Plan

### static-contract

- `ChannelScopeRevision` 固定 query denominator；Roster/Scope 语义不混用；
- 每个 member observation 有 representation metadata；
- provider projection 不升级为 native，manual extract 不升级为 complete；
- mixed maturity coverage分账；
- common stage/value/organization mapper保留native code/path；
- Channel report引用成员报告且不高于其 maturity；
- write/bid/contact-enrichment capabilities禁止。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| FTS OCDS release + underlying notice metadata | provider projection、extension、mapping loss保留 |
| CCGP selected HTML + extracted fields | presentation/manual extract与raw span关联，coverage=selected |
| same real procurement suspected across portals | 只生成relation candidate，不合并ID |
| UK/PRC legacy + current notice types | regime/native code保留，common stage可查询 |
| member complete + CCGP absent | automated subset可complete，whole portfolio仍mixed/partial |
| FTS record update + SAM latest snapshot + TED change notice | 三种历史语义不混用 |
| cross-taxonomy mapping | CPV/NAICS/PRC item code保留，derived mapping有版本/loss |
| documents with different rights | descriptor/retrieval/indexing分别决策 |
| member report expired | 仅受影响entry degrade，不借其他member通过 |

### sandbox/canary

只对已获用户批准且成员自身具备 sandbox plan 的 SAM/TED/FTS 运行公开 read；CCGP 保持 manual replay，直到其自动 route 独立晋级。Channel canary分别监测三类 automated member，另监控 CCGP official schema/policy drift；不得为了获得统一 canary覆盖而降低 CCGP门槛。

## 9. 晋级门

v0.2 `modeled` 需要四个 accepted member refs、ChannelScope schema、projection/mapping/coverage policy；`fixture-verified` 需要四成员 fixture/manual reports和组合报告；`sandbox-verified` 只能声明通过 live sandbox 的 automated subset，不能覆盖 CCGP。当前 revision 停在 `researched`，不授权 Connector、live request、下载或平台副作用。
