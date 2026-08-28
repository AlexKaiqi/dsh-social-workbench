# npm Public Package Ecosystem Platform Pack 设计

状态：`researched / fixture-eligible / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`npm-public-package-ecosystem/v0-design`

## 1. 定位与禁止边界

本Pack只设计对用户批准的公开package roster读取metadata、version、search placement与download aggregate。它不下载tarball，不install/audit本地依赖，不读取`.npmrc`或token，不访问private registry，不publish、dist-tag mutation、deprecate、unpublish、owner/access/token/hook操作。

官方来源：[Registry API](https://github.com/npm/registry/blob/ae49abf1bac0ec1a3f3f1fceea1cca6fe2dc00e1/docs/REGISTRY-API.md)、[package metadata](https://github.com/npm/registry/blob/ae49abf1bac0ec1a3f3f1fceea1cca6fe2dc00e1/docs/responses/package-metadata.md)、[download counts](https://github.com/npm/registry/blob/ae49abf1bac0ec1a3f3f1fceea1cca6fe2dc00e1/docs/download-counts.md)、[deprecation](https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions/)、[unpublish policy](https://docs.npmjs.com/policies/unpublish/)、[dist-tags](https://docs.npmjs.com/adding-dist-tags-to-packages/)。`npm/registry`自述为archived endpoint documentation，未来route以当前官方OpenAPI和sandbox证据重新核对，不能把旧文档当永恒合同。

## 2. 稳定概念与能力

| Concept / surface | `SoftwarePackageEcosystem*`映射 | 状态 |
| --- | --- | --- |
| scoped/unscoped package | registry + namespace + display/normalized name | fixture-eligible |
| full/abbreviated packument | metadata representation；version/dependency/artifact/pointer coverage分别记录 | fixture-eligible |
| exact version | native semver + fixed resolver；`latest`若出现在path仍解析为pointer target | fixture-eligible |
| `dist-tags` | mutable `SoftwarePackagePointerBinding` | fixture-eligible |
| version/range deprecation | publisher lifecycle assertion，scope保留，message为untrusted content | fixture-eligible |
| unpublish | registry/publisher assertion；单version与whole-package不同；不可由404单独推断 | fixture-eligible |
| `/-/v1/search` | exact query/filter/weights/position/provider score | fixture-eligible；不当质量事实 |
| download point/range/version | independent usage representation + metric definition/window | fixture-eligible；不当用户数 |
| tarball URL/hash | external artifact descriptor，`RetrievalAllowed=false` | metadata only |

官方download API按UTC日志日聚合；bulk最多128个package且最多365天，其他查询最多18个月，per-version只覆盖previous 7 days。这些限制是definition的一部分；scoped bulk当前不支持。不得跨window、endpoint或package scope无标记拼接。

## 3. 生命周期与证据

npm允许用空message撤销deprecation；whole-package deprecation会从website search移除，但package仍可下载。unpublish受policy限制，已使用的`package@version`不可复用，且unpublish不可undo。因此：

- deprecation、search absence与unpublish必须是三条独立assertions；
- 只有exact registry/publisher assertion可候选派生`EvidencePackageLifecyclePressure`；
- 只有带metric definition、window与counting caveat的download aggregate可候选派生`EvidencePackageUsageProxy`；
- `quality/popularity/maintenance` search scores保留provider-derived，不作维护质量或需求判断；
- author/publisher/maintainer email默认丢弃，README、description、scripts、repository、license与deprecation message只留governed payload/ref。

## 4. Skills 与开源审计

- [npm API documentation](https://github.com/npm/api-documentation/tree/861fa7a1fc048008a081dce6a407c6a9e5bca475)为官方OpenAPI参考，code MIT、docs CC-BY-4.0。
- [npm CLI](https://github.com/npm/cli/tree/d6c612258c571c71a00f496c1f8980ed13b8a4d9)为Artistic-2.0官方行为参考；它同时提供install/publish/deprecate/unpublish等高影响能力，不安装、不执行。
- [npm-skills](https://github.com/scagogogo/npm-skills/tree/9c6e698679da3097168bb7ef5452b80cc6e0b377)为MIT社区Skill/CLI/MCP候选，暴露download、mirror、token、publish、deprecate与其他写工具，当前隔离为research-only；不能以tool name allowlist替代代码审计和effect deny。
- 未发现npm官方Agent Skill或官方npm research MCP。

Pack Skills：`npm-registry-contract-research/v1`、`npm-package-fixture-conformance/v1`与未来`npm-approved-roster-read/v1`。后者当前返回`capability-unavailable:no-authorized-binding`；artifact download、local audit和write skill均返回unsupported。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| `latest` changes between snapshots | append pointer revisions，不修改version identity |
| one version-range deprecated | exact range + resolver；不扩成whole package |
| empty deprecation message | append undeprecation/reversal，不删除历史 |
| package missing from search but metadata exists | search coverage变化，不生成unpublish |
| 404 after prior observation | state unknown/tombstone candidate，等待authority evidence |
| same download period queried twice | same metric/window lineage，不双计独立证据 |
| bulk contains scoped name | policy拒绝或split到supported single query，不静默遗漏 |
| README/scripts/tarball | quarantine/descriptor only，zero execution/retrieval |

Telemetry按`definition × package roster × representation × query/window`记录requested/returned/coverage、ETag/cache、pagination、dist-tag/lifecycle drift、metric limits、identity/content drop、unsafe artifact拒绝与zero write/install。live晋级前需批准roster、endpoint、request budget、cache/ETag、rights/retention、canary和kill switch。

