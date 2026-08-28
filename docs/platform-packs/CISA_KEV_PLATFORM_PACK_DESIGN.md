# CISA Known Exploited Vulnerabilities Platform Pack 设计

状态：`researched / fixture-eligible / exploitation-assertion-only / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`cisa-kev/v0-design`

## 1. 定位与禁止边界

本Pack只设计CISA KEV公开catalog snapshot的只读研究。它保留CISA对“known exploited”的权威目录声明、CVE、vendor/product文本、加入日期、required action、限定范围due date、ransomware确认状态和CWE。它不扫描资产、不验证利用、不访问notes中的PoC/第三方页面、不自动patch/discontinue产品，也不把美国联邦directive期限改写成所有组织义务。

当前无callable route。GitHub mirror公开且CC0不等于允许无限频率下载或自动执行外链行动。

## 2. 稳定概念与合同

官方来源：[CISA KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)、[官方GitHub mirror](https://github.com/cisagov/kev-data)、[JSON schema](https://github.com/cisagov/kev-data/blob/develop/known_exploited_vulnerabilities_schema.json)。

| Concept ref | 原生身份/表示 | 稳定语义与限制 |
| --- | --- | --- |
| `cisa.kev-catalog-snapshot/v1` | catalogVersion/dateReleased/count + content hash | 完整snapshot；不是append event feed，Git commit可提供mirror变更证据 |
| `cisa.kev-entry/v1` | CVE ID + observed catalog revision | CISA列入known exploited目录；不是本地asset compromise证明 |
| `cisa.kev-product/v1` | vendorProject/product text | 非CPE、purl或版本range；只能作为source-native文本binding |
| `cisa.kev-required-action/v1` | requiredAction + dueDate + directive scope | CISA行动声明；dueDate applicability必须引用obligation scope |
| `cisa.kev-ransomware/v1` | Known/Unknown | Known是CISA确认；Unknown表示缺乏确认，不是No |
| `cisa.kev-weakness/v1` | CWE IDs | weakness classification；不证明所有affected variants或attack path |

GitHub repo说明它在canonical cisa.gov更新后通常数分钟内同步；因此canonical feed和mirror是同一CISA authority的两个representations，不增加independent authority。Git history能证明mirror文件变化，不保证提供CISA内部决定历史。

## 3. Capability 与 mapping

| Surface | Capability proposal | 状态/约束 |
| --- | --- | --- |
| canonical JSON/CSV/schema | `software-vulnerability.exploitation-catalog.read.cisa/v1` | fixture-eligible；未来只选一个canonical representation并hash验证 |
| official GitHub JSON/schema/history | `software-vulnerability.exploitation-catalog.mirror.read.cisa/v1` | fixture-eligible reference；与canonical共同authority，不能双计 |
| notes/external links | artifact descriptors | metadata-only；第三方许可/安全未审查，默认不retrieve |
| issue/PR/email suggestions | any write | rejected；catalog增删由CISA管理，需求研究不提交 |

每个snapshot固定definition：CISA dataset/schema/catalog version、CVE/product/weakness/ransomware taxonomy、required-action/obligation semantics、snapshot/diff/selection、canonical-mirror lineage、CC0/third-party link rights、unsafe content/reference、retention/deletion与valid window。

| KEV fact | 映射 |
| --- | --- |
| catalogVersion/dateReleased/count | dataset snapshot record；count与array length fixture校验 |
| CVE entry | exploitation record + exact CVE identifier；可派生`EvidenceKnownExploitation` |
| vendor/product/name | source-native product subject + reviewed text span；不做package version match |
| dateAdded | exploitation assertion observation；不是首次利用日期 |
| requiredAction/dueDate | remediation assertion + explicit federal/applicable scope |
| ransomware Known | ransomware assessment `Known`；仍不证明具体campaign/asset attribution |
| ransomware Unknown | assertion `Unknown`；不得映射`NotKnown`或No |
| notes URLs | role-classified descriptor；不继承CC0，不展开PoC |
| snapshot correction/removal | append new snapshot/diff；last-seen不自动解释为漏洞不存在 |

KEV entry可以派生`EvidenceKnownExploitation`，但不能自动派生用户投诉、已入侵、受影响版本、业务严重度或修复完成。

## 4. Skills 与开源审计

[cisagov/kev-data](https://github.com/cisagov/kev-data/tree/f450aa8a4712cbb2171cab38c1992b4c7442498d)固定revision `f450aa8a4712cbb2171cab38c1992b4c7442498d`，CC0-1.0，包含JSON/CSV/schema与Git history。本轮没有执行clone或历史diff。

未发现CISA官方KEV Agent Skill/MCP。社区MCP、ETL和dashboard只能作为未来静态候选，不能改变CISA source authority、schema、rights或zero-reference-fetch边界。

Pack Skills：

- `cisa-kev-contract-research/v1`：只读official catalog/mirror/schema/license，输出drift proposal；
- `cisa-kev-fixture-conformance/v1`：只消费合成snapshot/diff fixtures；
- `cisa-kev-snapshot-read/v1`（未来）：只调用户批准representation/request budget；当前返回`capability-unavailable:no-authorized-binding`；
- `cisa-kev-asset-scan-or-remediate/v1`：返回`unsupported:security-effect`。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| catalog count与array不一致 | contract/data-quality failure，不静默取任一值 |
| canonical与mirror内容相同 | one authority/two representations；不重复计known exploitation |
| dateAdded早于observed | 保留source date与observed time，不称首次利用时间 |
| ransomware Unknown | 保持unknown，不映射false/no |
| dueDate fixture | 必须有obligation scope；不生成通用用户deadline |
| vendor/product同名或变化 | source-native revision，不按文本跨CVE/package合并 |
| entry消失/更正 | append snapshot/diff与history gap，不直接删除旧evidence |
| notes含PoC/第三方链接 | descriptor only，零retrieve/零index/零execution |
| scan/patch/submit request | policy拒绝且zero external side effect |

Telemetry按`definition × catalogVersion × representation`记录snapshot hash/count/array count、new/changed/missing entries、CVE/CWE/action/ransomware field coverage、canonical-mirror lag/common origin、schema/license/reference drift、unsafe reference拒绝和zero scan/write；不记录外部资产、PoC内容或用户inventory。

晋级需fixture report；sandbox live前需用户批准canonical或mirror、固定schema/revision策略、request budget/cache、CC0 attribution/brand边界、snapshot diff/removal policy、reference denylist、canary与kill switch。任何asset matching/remediation需要独立owned-security能力与授权。
