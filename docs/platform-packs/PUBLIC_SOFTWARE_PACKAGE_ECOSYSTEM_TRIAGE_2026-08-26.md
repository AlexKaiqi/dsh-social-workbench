# Public Software Package Ecosystem & Migration Pressure 候选分流

状态：`researched / design-only`  
核验日期：2026-08-26

## 1. 缺口与选择

漏洞目录只能说明风险被发布，不能说明软件包是否仍可解析、某个版本是否被deprecate/yank、release是否持续，或registry观察到多少下载事件。首批选择npm、PyPI、crates.io，是因为三者都有公开registry事实、明确的版本解析生态和可核验的生命周期语义，同时故意保留三种不同模型：

| 候选 | 核心价值 | 首轮可验证表示 | usage proxy | 主要边界 |
| --- | --- | --- | --- | --- |
| npm | package/version、mutable dist-tag、range deprecation、unpublish | packument、version、search、download-count fixture | 官方download API | dist-tag不是版本；deprecate可撤销，unpublish不可撤销；下载不是用户 |
| PyPI | project/release/file、normalized name、yanked release、删除 | JSON API、Simple JSON、RSS fixture | BigQuery public dataset | project/release/file分层；BigQuery有成本与质量缺陷；distribution名不等于import名 |
| crates.io | crate/version、registry index、yank/unyank、依赖与feature | sparse/git index fixture | API/daily dump待晋级 | yank不删除；existing lockfile仍可能用；dump表结构无稳定保证 |

三个成员均发布Platform Pack；requested=3、fixture-eligible=3、callable=0。usage-proxy单独计：npm documented API与PyPI documented dataset可做合成fixture，crates.io usage representation保持research-only。

## 2. 第一性边界

- package identity必须绑定registry/ecosystem/namespace；三个生态同名不合并，可选purl也只作明确namespace桥。
- native version、normalized version、version range与resolver revision一起保存；禁止跨生态或lexical比较。
- npm dist-tag/channel是可变pointer；PyPI release与file不是同一层；crates.io yank是version index状态。
- deprecated、yanked、unlisted、unpublished、deleted、archived是不同lifecycle assertions，并带exact scope、authority、reason和reversibility。
- README、description、deprecation/yank reason、declared license/repository URL是publisher content；需隔离prompt injection且不作安全、许可或归属结论。
- downloads可包含CI、缓存、bot、镜像与重复机器；dependent-package count也只覆盖registry声明图。它们都不是people、install base、adoption、retention、quality、revenue或market size。
- release cadence不是maintenance quality；lifecycle pressure不是user pain。只有与issue/support/interview/procurement或owned telemetry连接后才能形成需求候选。
- 不下载package artifact，不install/import/build/execute，不解析本地manifest/lockfile，不扫描workspace，不publish/deprecate/yank/unpublish/delete。

## 3. Skills、MCP与开源候选分流

截至核验日，npm、PyPI/PyPA、rust-lang官方仓库未发现面向这三个研究surface的官方Agent Skill或官方MCP server。官方CLI都混有高影响写操作，因此仅作静态协议参考：npm CLI、Twine/Cargo publish/yank不能成为本Channel的read connector。

| 候选 | 固定revision / license | 价值 | 结论 |
| --- | --- | --- | --- |
| [npm API docs](https://github.com/npm/api-documentation/tree/861fa7a1fc048008a081dce6a407c6a9e5bca475) | MIT code / CC-BY-4.0 docs | 官方OpenAPI与schema漂移参考 | static-reference |
| [npm CLI](https://github.com/npm/cli/tree/d6c612258c571c71a00f496c1f8980ed13b8a4d9) | Artistic-2.0 | packument/search/dist-tag/deprecate行为参考 | static-reference; no execution |
| [Warehouse](https://github.com/pypi/warehouse/tree/1ccf4dc86f52b79fd8763a68001de23bc4dc4ccb) | Apache-2.0 | PyPI canonical implementation/schema语义 | static-reference |
| [Twine](https://github.com/pypa/twine/tree/f536ac5d0c77a24a997854328e64644f576b4992) | Apache-2.0 | Upload API边界 | rejected as connector; write-oriented |
| [crates.io](https://github.com/rust-lang/crates.io/tree/2004dfd43516e132c38c044c3fdb43a6684e0894) | MIT OR Apache-2.0 | registry实现、dump/API字段研究 | static-reference |
| [Cargo](https://github.com/rust-lang/cargo/tree/94ba974179df2adb3c911fadf361f03b84aa8f14) | MIT OR Apache-2.0 | index/resolver/yank协议参考 | static-reference; no execution |
| [npm-skills](https://github.com/scagogogo/npm-skills/tree/9c6e698679da3097168bb7ef5452b80cc6e0b377) | MIT，community | Skill/CLI/MCP，含read、download、publish、deprecate等 | quarantined research-only；tool/effect过宽 |
| [pypinfo](https://github.com/ofek/pypinfo/tree/3950b394f5ef4ab3ba36ab9d1cd43f5bc5ae2802) | MIT，community | BigQuery query/cost建模参考 | static-reference；不安装、不运行、不接credentials |
| [crates-io-api](https://github.com/theduke/crates-io-api/tree/21a6b18687bd2b9989992d17803e6815725ed0e2) | MIT OR Apache-2.0，community | crates.io read client与rate limiter参考 | static-reference；非官方schema authority |

## 4. 验证优先级

1. 先用合成fixtures验证identity/version/artifact/lifecycle/pointer/source-lineage。
2. usage measure单独验证window、unit、counting semantics、cache/mirror/bot caveat，不与registry metadata coverage混算。
3. sandbox live需用户批准公开测试package roster、exact endpoint、请求预算、User-Agent、cache/ETag策略与kill switch。
4. package artifact、local dependency inventory、BigQuery credential/cost、bulk dump、任何写操作分别独立授权；不会随metadata read自动开放。

