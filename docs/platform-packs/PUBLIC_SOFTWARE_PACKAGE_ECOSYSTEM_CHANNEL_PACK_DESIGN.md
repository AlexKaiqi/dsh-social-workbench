# Public Software Package Ecosystem & Migration Pressure Channel Pack 设计

状态：`researched`；3 个 fixture-eligible member，0 个 callable member  
核验日期：2026-08-26  
Channel Pack ref：`public-software-package-ecosystem/v0-design`

## 1. 目的与成员

本Channel组合公开registry package/version/artifact/lifecycle与usage-proxy事实，用于发现迁移压力、供给连续性风险和需要进一步验证的产品机会触发器。它统一`SoftwarePackageEcosystem*` projection，不统一identity、resolver、lifecycle scope、API/index/dump coverage、download口径、rights或authority。

| Member | Pack | 当前coverage |
| --- | --- | --- |
| npm | [npm Pack](NPM_PUBLIC_PACKAGE_ECOSYSTEM_PLATFORM_PACK_DESIGN.md) | packument/version/dist-tag/deprecation/unpublish/search/download fixture |
| PyPI | [PyPI Pack](PYPI_PUBLIC_PACKAGE_ECOSYSTEM_PLATFORM_PACK_DESIGN.md) | project/release/file、Simple/JSON/RSS/yank/delete fixture；BigQuery separate |
| crates.io | [crates.io Pack](CRATES_IO_PUBLIC_PACKAGE_ECOSYSTEM_PLATFORM_PACK_DESIGN.md) | registry index/yank fixture；API/dump/usage research-only |

requested=3、fixture-eligible=3、callable=0。member coverage不等于usage coverage；三个registry的download值不得相加、排名或直接比较。

## 2. 共同合同与不可比较边界

共同projection固定definition、registry/ecosystem identity、display/normalized name、native version/resolver、artifact descriptor、declared dependency、mutable pointer、lifecycle assertion/scope、usage metric/window/counting semantics、search placement、source lineage、representation coverage、content safety、rights/retention/deletion与evidence。

必须保留：

- npm package、PyPI distribution project、crates.io crate是不同ecosystem identities；同名或repository URL相同不自动合并；
- npm dist-tag是mutable pointer，PyPI release/file分层，crates yank是version index state；
- deprecated、yanked、unlisted、unpublished、deleted、archived与search absence不互换；
- API、resolver index、RSS、BigQuery、database dump与mirror可能是同一common origin的不同representations；
- download event、dependent-package count与search provider score是不同metrics；没有metric definition和denominator不生成rate；
- release cadence不等于active maintenance，declared license不等于legal verification，published package不等于safe package；
- lifecycle pressure不是用户痛点。没有support/issue/interview/procurement/owned usage evidence时，只保留migration hypothesis；
- vulnerability/malware判断属于Software Vulnerability Channel；本Channel不下载或执行artifact来验证。

## 3. 动态物化视图

- `package-lifecycle-pressure-by-exact-scope`：按registry/package/range/release/version/artifact与resolver输出deprecate/yank/unpublish/delete事件；
- `mutable-channel-and-recommended-version-drift`：跟踪dist-tag/channel target变化，不改写version历史；
- `release-and-artifact-continuity-candidates`：发布时间、file/version coverage与lifecycle冲突；不输出维护质量评分；
- `registry-usage-proxy-by-fixed-definition`：同一member、metric、window、counting policy内的趋势；禁止cross-registry totals；
- `migration-opportunity-candidates`：lifecycle pressure + exact independent issue/support/interview/owned dependency evidence；缺任一join都只保留hypothesis；
- `representation-schema-and-policy-drift`：API/index/feed/dump schema、rate policy、license、retention与source lineage变化。

所有view固定Channel/member/definition、registry identity、resolver、representation、metric/window、rights与watermark。动态物化视图可重建，Dolt snapshot保存Platform Pack/definition/schema/policy/evidence revision；高频records与metrics进入分析存储，不把原始package payload复制进长期知识正文。

## 4. Channel Skills 与 Probe

### `software-package-ecosystem-source-research/v1`

只读官方docs/spec/fixed repository，研究新registry、API/schema/policy、Agent Skills/MCP与开源候选，输出Pack/drift proposal；不安装或执行候选。

### `approved-software-package-research/v1`（未来）

只调度verified member read与用户批准public package roster，返回metadata/lifecycle/usage三套coverage。当前所有成员返回`no-authorized-binding`；不得fallback到CLI、community MCP、mirror、artifact download或workspace scan。

### `software-package-ecosystem-conformance/v1`

验证identity/normalization/version/resolver、pointer、lifecycle scope/reversal、representation lineage、usage metric caveat、partial degradation、unsafe content/artifact、rights与zero install/write。

Channel没有registry write或package-execution Probe。不能通过publish test package、deprecate/yank/unpublish、install malicious/old version、触发下载、刷download count或修改真实项目依赖来“验证需求”。主动probe仍应使用获准的survey/interview/landing/manual package等既有Channel。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| same free-text name in three registries | three identities；无显式bridge不合并 |
| npm deprecate vs PyPI/crates yank | exact native scope/state；不归一成delete |
| one registry has API/index/feed copies | member coverage增加，independent authority不增加 |
| download counts differ | 保留各自metric definition，不生成cross-member total/rank |
| release quiet for one year | cadence fact only，不生成abandoned |
| lifecycle reason claims security issue | publisher assertion；不生成vulnerability evidence |
| one member drift/quarantine | Channel partial；成功成员不掩盖blocked reason |
| artifact/CLI/MCP/local manifest/write request | effect拒绝且zero external side effect |

Telemetry按`Channel × member × definition × identity/resolver × representation × metric/window`记录expected/fixture/callable/succeeded/blocked/quarantined、package/version/artifact/lifecycle/usage/search coverage、lineage/conflict/schema/policy drift、identity/content drop、unsafe artifact拒绝、cost/rate budget与zero install/write。不得记录private package names、local paths、tokens、maintainer email或artifact content。

至少一个member通过fixture conformance后Channel才成为`modeled-partial`。每个member的metadata/index、search/feed、usage dataset、bulk dump与live read分别晋级；任何artifact retrieval、local dependency inventory、credentialed registry、BigQuery cost或write side effect都需单独授权。

