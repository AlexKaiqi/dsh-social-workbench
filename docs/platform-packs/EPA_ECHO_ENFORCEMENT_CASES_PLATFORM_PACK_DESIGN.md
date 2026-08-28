# US EPA ECHO Enforcement Cases Platform Pack 设计

状态：`researched / concept+official-route-fixture / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`us-epa-echo-enforcement-cases/v0-design`

## 1. 概念与需求价值

EPA [ECHO Web Services](https://echo.epa.gov/tools/web-services)公开只读query services，Enforcement Case Search覆盖来自ICIS及criminal prosecution data的执法case。ECHO [About the Data](https://echo.epa.gov/resources/echo-data/about-the-data)同时说明来源、更新和已知质量/完整性边界。因此它可发现facility/sector反复出现的compliance与remediation摩擦，但不能代表全美国全部environmental conduct、全部state/local action或事实已最终裁定。

| Native concept | `PublicRegulatoryEnforcement*` | 约束 |
| --- | --- | --- |
| enforcement case/action | matter/case/proceeding | civil/admin/criminal及formal/informal不混合 |
| case number/facility/program | identity/relation | facility relation不是natural-person profile |
| violation/alleged violation fields | assertion + posture | exact source字段和authority决定posture |
| penalty/compliance action | remedial obligation | assessed/agreed/paid/completed分别建模 |
| query result/detail | representation/common origin | search/detail不得重复计数 |

## 2. 能力与route fixture

concept capabilities为service/metadata discovery、GET query、case/detail read、filter/pagination和data-caveat observation。route fixture固定官方HTTPS service family、GET、supported output（XML/JSON/JSONP中只准JSON）、query/filter、pagination、result count、error envelope、更新时间、schema/data caveat revision。它不是local binding，本轮没有请求service。

ECHO aggregate/facility/compliance services不因同域自动进入本Pack。未知参数、HTML search、bulk download、non-EPA fallback和cross-service join一律拒绝；route unavailable时标记member degraded。

## 3. Rights、OSS与验证

每次snapshot固定EPA terms/disclaimer、attribution、data-source caveat和purpose。ordinary projection drop natural-person、address/contact、victim/witness内容，只保留organization/facility opaque refs。

静态参考：`cyanheads/epa-mcp-server@2cb5766`（Apache-2.0）仅借鉴工具边界/partial failure；其非ECHO或第三方fallback不可继承。`mps9506/echor@f1a13eb`（MIT）仅作pagination/download drift witness。`api-evangelist/epa@abbc90f`因root licence未确认quarantine。均未安装或执行。

synthetic fixtures覆盖allegation vs finding、civil/admin/criminal identity、case/detail common-origin、penalty amount role、status correction、facility relation、missing total、pagination/rate/schema drift、natural-person drop、route failure/no fallback和zero writes。metadata-only canary须用户批准；documents、facility joins、monetary history和durable storage另审。

