# crates.io Public Package Ecosystem Platform Pack 设计

状态：`researched / index-fixture-eligible / API+dump-research-only / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`crates-io-public-package-ecosystem/v0-design`

## 1. 定位与禁止边界

本Pack首轮只设计crate/version registry index与yank状态。crates.io public API、download counters和daily database dump保留研究表示；不clone full index、不下载dump或`.crate`、不运行Cargo、不读取workspace/Cargo.lock、不publish/yank/unyank/owner mutation、不接token。

官方来源：[Cargo registries](https://doc.rust-lang.org/cargo/reference/registries.html)、[registry index](https://doc.rust-lang.org/cargo/reference/registry-index.html)、[registry web API](https://doc.rust-lang.org/cargo/reference/registry-web-api.html)、[cargo yank](https://doc.rust-lang.org/cargo/commands/cargo-yank.html)、[crates.io data access](https://crates.io/data-access)与[accepted policy RFC](https://github.com/rust-lang/rfcs/blob/master/text/3463-crates-io-policy-update.md)。

## 2. 稳定概念与能力

| Concept / surface | 映射 | 状态 |
| --- | --- | --- |
| crate + version | registry-scoped identifier + native semver/resolver | fixture-eligible |
| git/sparse index entry | resolver-index representation；dependency/features/checksum/yanked分层 | fixture-eligible |
| ETag/Last-Modified | representation cache revision | fixture-eligible |
| yank/unyank | exact version lifecycle assertion，reversible | fixture-eligible |
| `.crate` download link/checksum | external artifact descriptor，`RetrievalAllowed=false` | metadata only |
| crates.io `/api/v1/...` | provider representation | research-only；不能把implementation fields当stable core |
| live index repository | bulk resolver source | research-only；full clone不属于首轮 |
| daily DB dump | dataset snapshot/rows | research-only；官方不保证exact table layout stability |
| downloads/reverse dependencies | provider usage proxy | research-only，metric definition未通过fixture gate |

Cargo支持git与sparse registry protocol；这两种representation来自同一registry authority。Sparse cache用ETag/Last-Modified。一个registry index可能同时提供download URL与write API位置，read metadata授权不包含download或publish。

## 3. Yank与证据边界

`cargo yank`只把version从index的默认新解析中移除，不删除数据，仍可direct download；已有lockfile不受影响。unyank可撤销。这与npm deprecation、PyPI release yank、package deletion均不同。

只有exact version yank/unyank assertion可候选派生`EvidencePackageLifecyclePressure`。downloads或reverse-dependent counts只有在source endpoint/dump revision、window、unit、bot/cache/mirror与backfill policy都固定后才可候选派生`EvidencePackageUsageProxy`；当前不晋级。crate description、repository、license和feature names均作publisher metadata，不证明质量、安全或license conclusion。

数据访问policy要求优先index、其次daily dump、最后API；API最多1 request/second且必须使用可识别、最好含contact的User-Agent。未来connector必须把这两个要求写入capability policy与telemetry，不能只依赖client默认rate limiter。

## 4. Skills 与开源审计

- [crates.io](https://github.com/rust-lang/crates.io/tree/2004dfd43516e132c38c044c3fdb43a6684e0894) MIT OR Apache-2.0，作为API/dump/schema漂移静态参考。
- [Cargo](https://github.com/rust-lang/cargo/tree/94ba974179df2adb3c911fadf361f03b84aa8f14) MIT OR Apache-2.0，作为resolver/index/yank语义参考；Cargo包含publish/yank与本地workspace执行面，不运行。
- [crates-io-api](https://github.com/theduke/crates-io-api/tree/21a6b18687bd2b9989992d17803e6815725ed0e2) MIT OR Apache-2.0社区read client，含默认rate limiter；非官方schema authority，仅research-only。
- 未发现rust-lang官方Agent Skill或面向crates.io research的官方MCP。

Pack Skills：`crates-io-contract-research/v1`、`crates-io-index-fixture-conformance/v1`与未来`crates-io-approved-roster-read/v1`。Cargo execution、artifact download、full index clone、dump download与registry write均unsupported。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| same version git + sparse index | common-origin authority=1，不双计 |
| version yanked | exact version pressure；package仍active，artifact仍descriptor |
| existing lockfile references yanked | 不标记lockfile broken；本Pack也不读取lockfile |
| unyank after yank | append reversal，不删除旧snapshot |
| API differs from index | representation conflict/coverage，不任意覆盖resolver fact |
| dump table changes | schema drift quarantine，不把列位置写死为核心字段 |
| 404/410/451 | provider response state，等待authority evidence后再判lifecycle |
| `.crate` URL/repository/readme | descriptor/quarantine，zero fetch/build/execute |

Telemetry按`definition × crate roster × representation × version`记录ETag/Last-Modified、index/yank/dependency/feature/checksum coverage、API 1rps budget、User-Agent policy、schema/dump drift、identity/content drop与zero clone/download/Cargo/write。sandbox live只允许批准crate roster的sparse index GET；API与dump各自另行晋级。

