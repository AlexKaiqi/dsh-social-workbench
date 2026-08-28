# GitHub Advisory Database Platform Pack 设计

状态：`researched / fixture-eligible / attribution+overlap-gated / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`github-advisory-database/v0-design`

## 1. 定位与禁止边界

本Pack只设计GitHub Global Security Advisories的公开只读研究，用于固定GHSA/CVE、advisory type、package range、severity/CVSS/CWE/EPSS、review和withdrawal事实。它不读取私有repository advisory，不提交improvement、private vulnerability report或CVE request，不创建临时fork，不运行Dependabot/code scanning，也不通过GitHub MCP开放其他repo/account工具。

当前无token、ConnectionProfile、PortBinding或callable route。公开REST可匿名访问不代表当前已批准持续同步。

## 2. 稳定概念与合同

官方来源：[Global advisory REST](https://docs.github.com/en/rest/security-advisories/global-advisories?apiVersion=2026-03-10)、[Advisory Database repository](https://github.com/github/advisory-database)、[OSV schema](https://ossf.github.io/osv-schema/)。

| Concept ref | 原生身份/表示 | 稳定语义与限制 |
| --- | --- | --- |
| `github.ghsa/v1` | GHSA ID + observed API/repo revision | 每条advisory有GHSA；CVE是identifier relation，不保证存在 |
| `github.advisory-type/v1` | reviewed/unreviewed/malware | REST无参数默认reviewed且排除malware；三者是不同population |
| `github.affected-package/v1` | ecosystem/name + vulnerable range/first patched | package artifact范围；不是repository整体、所有fork或installed asset |
| `github.severity-assessment/v1` | qualitative severity、CVSS v3/v4 | scheme/version分开；高/critical不等于known exploited |
| `github.epss-assessment/v1` | percentage + percentile + observed revision | exploit likelihood模型输出，不是已利用事实；随时间变化 |
| `github.curator-review/v1` | reviewed flag/time | GitHub curator state，不是独立漏洞复现或asset impact验证 |
| `github.withdrawal/v1` | withdrawn timestamp | advisory撤回；需传播失效，不抹去历史 |

仓库中GitHub `database_specific`字段由GitHub定义且可无通知变化；只有固定schema revision中明确review过的字段可进入核心projection，其余保留extension payload。

## 3. Capability 与 coverage

| Surface | Capability proposal | 状态/约束 |
| --- | --- | --- |
| `GET /advisories` | `software-vulnerability.advisory.list.github/v1` | fixture-eligible；API version `2026-03-10`，默认reviewed non-malware必须显式记录 |
| `GET /advisories/{ghsa_id}` | `software-vulnerability.advisory.read.github/v1` | fixture-eligible；public resource可匿名读取 |
| filters | same capability parameters | type/CVE/GHSA/ecosystem/severity/CWE/withdrawn/affects/date/EPSS独立固定；max100，cursor从Link header |
| CC-BY repository files | `software-vulnerability.dataset.sync.github/v1` | research-only；大规模clone/history、attribution、layout drift和GC未验证 |
| official GitHub MCP global advisory tools | any MCP route | reference-only；要求`security_events` scope，未来只可allowlist list/get且read-only |
| repository advisory/write surfaces | any fallback | rejected；private/report/update/CVE/fork是不同高影响能力 |

Credits响应可包含login、ID、头像和用户URL；全部默认drop。Description、vulnerable functions和references先过content-safety policy，PoC/exploit链接不展开。

## 4. `SoftwareVulnerability*` 映射

每次collection固定definition：GitHub API/schema/version、reviewed/unreviewed/malware population、ecosystem/package/range规则、severity/CVSS/EPSS、CWE/review/withdrawal、filter/sort/cursor、source lineage、CC-BY attribution、identity/content/reference policy与valid window。

| GitHub fact | 映射 |
| --- | --- |
| GHSA/CVE/identifiers | native + exact alias relation；无CVE保持缺失，不猜测 |
| advisory type | provider record type + selection coverage；malware不映射普通vulnerability而不声明转换合同 |
| vulnerabilities[] | affected subject/range；first patched是remediation assertion，不是部署事实 |
| qualitative/CVSS | scheme-separated assessments；不跨CVSS版本直接覆盖 |
| EPSS percentage/percentile | risk assessments；不能派生known exploitation |
| GitHub reviewed/time | curator assessment；不变成independent authority count |
| CVE/GHSA sources imported into OSV | common-origin lineage；跨member只保留representation relation |
| credits | identity drop；不进入SourceItem/EvidenceSpan/索引 |
| references | descriptor only，fix/advisory/PoC role分开 |

reviewed advisory exact publisher span可候选派生`EvidencePublishedVulnerability`；unreviewed也可保留source state，但默认confidence较低且不能冒充GitHub-reviewed。

## 5. Skills 与开源审计

- [github/advisory-database](https://github.com/github/advisory-database/tree/eb2636fcf133574c09746d6b6b230c4dbd985228)固定revision，CC-BY-4.0；是GitHub数据库mirror，支持社区PR但最终由内部curation处理。
- [GitHub MCP Server](https://github.com/github/github-mcp-server/tree/822c87761f8587395b3e1a04b5386b2611252cd1)固定revision，MIT；有`security_advisories` toolset、individual tools和read-only mode。其scope/host配置仍不能替代本Pack definition、identity drop、overlap和append revision。
- [Microsoft GitHub Advisory MCP](https://github.com/microsoft/github-advisory-mcp/tree/cd68016c7ea18e4e7121dee0ffeee30131a2e988)固定revision，MIT；会自动clone大数据库，完整数据测试未进入CI，故不安装/执行。

Pack Skills：

- `github-advisory-contract-research/v1`：只读官方docs与fixed repo，输出schema/default/license drift proposal；
- `github-advisory-fixture-conformance/v1`：只消费合成REST/OSV fixtures；
- `github-global-advisory-read/v1`（未来）：只调批准的public filters/ID roster；当前返回`capability-unavailable:no-authorized-binding`；
- `github-advisory-submit-or-scan/v1`：返回`unsupported:security-platform-effect`。

## 6. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| list无type参数 | coverage标`reviewed/non-malware-default`，不声明全库 |
| reviewed/unreviewed/malware | 三个population分开；malware不偷映射普通漏洞 |
| same GHSA in repo/API/OSV | representation/common-origin relation，不三次计证据 |
| CVSS v3与v4同时存在 | 两assessment并存，不用最后字段覆盖 |
| EPSS高但无KEV | 只保留probability，不生成known exploitation |
| withdrawn advisory | append revision、失效派生view，旧snapshot可审计 |
| credits/avatars/user URLs | pre-persistence drop，telemetry无身份值 |
| exploit reference/description | quarantine或descriptor only，零fetch/零execution |
| MCP broad toolset/repository write | policy拒绝且zero platform side effect |

Telemetry按`definition × advisory type × filter/sort × representation`记录requested/returned/cursor、default population、advisory/affected/assessment/withdrawal coverage、common-origin、identity drop、content/reference quarantine、API/schema/license drift、rate/429和zero-write；不记录credit identity或敏感description。

晋级需fixture report；sandbox live前需用户批准测试filter/GHSA roster、anonymous REST、API version/header、request budget、CC-BY attribution、identity/content gate、withdrawal reconciliation、canary与kill switch。MCP、repo clone和private repository advisory独立治理。
