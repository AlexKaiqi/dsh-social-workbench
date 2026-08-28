# Barcelona Participatory Budgets Platform Pack 设计

状态：`concept-fixture + provider-schema candidate + selected-record/manual / architecture-only`
核验日期：2026-08-26
Platform Pack ref：`barcelona-participatory-budgets/v0-design`

## 1. 稳定概念与官方证据

Barcelona官方[2024–2027流程说明](https://www.barcelona.cat/mobilitat/en/news-and-documents/news/nous-pressupostos-participatius-2024-2027decideix-que-es-millora-al-teu-barri-1439847)描述€30m总额与district envelopes，并将过程分为proposal/debate、technical feasibility、prioritization、co-development和final vote；项目需具公共利益、市政权限、任期内可执行并满足成本范围。官方[最终投票说明](https://ajuntament.barcelona.cat/horta-guinardo/ca/noticies/votacio-final-dels-projectes-dels-pressupostos-participatius-a-horta-guinardo-1511969)说明14岁以上registered resident可在居住district及第二district参与，至少选2个项目且受budget maximum约束，并有online与assisted physical渠道。[2025结果](https://ajuntament.barcelona.cat/santmarti/ca/noticies/11-projectes-guanyadors-dels-pressupostos-participatius-1517473)报告1,733 proposals、789 technical validation、239 final ballot与76 selected，并预告follow-up commissions。

官方[Decidim Barcelona说明](https://ajuntament.barcelona.cat/digital/en/digital-empowerment/democracy-and-digital-rights/decidim-barcelona)与[公开实例](https://www.decidim.barcelona/?locale=cat)确认其使用Decidim。Decidim的[Budgets文档](https://docs.decidim.org/en/develop/admin/components/budgets.html)、[Projects文档](https://docs.decidim.org/en/develop/admin/components/budgets/projects.html)、[Accountability文档](https://docs.decidim.org/en/develop/admin/components/accountability.html)和[API文档](https://docs.decidim.org/en/develop/develop/api/)仅证明provider可表达project、budget amount、投票约束、selected-for-implementation、milestone/progress和GraphQL；安装可自定义schema、limits与配置，因此不能据此声明Barcelona exact route。

## 2. 概念映射

| Native | `PublicParticipatoryBudget*` |
| --- | --- |
| process / district envelope | process/round/scope + envelope amount |
| citizen proposal | proposer-authored need；无identity |
| technical validation / co-development | evaluation + developed-from relation |
| prioritization | priority aggregate；不与final vote相加 |
| final ballot / at least two / budget maximum | ballot project + exact ballot/envelope rule |
| winner | selected-under-envelope；非appropriation或delivery |
| follow-up commission / accountability | authority milestone/status；source-declared |

## 3. 期望只读能力

`definition.read`、`process.read`、`proposal.selected.read`、`evaluation.read`、`priority.aggregate.read`、`ballot.read`、`result.read`和`implementation.read`目前全部不可调用。官方页面可做selected/manual package；Decidim schema只是provider-schema candidate，必须先确认Barcelona部署version/customization、`/api/docs`、route、分页、rate、rights、history与privacy，再由用户批准metadata-only canary。

## 4. 数据、安全与Conformance

只保留opaque process/round/district/proposal/project/category、approved exact span、aggregate、amount role、state、authority与relations。姓名、账户、contact、exact address/coordinates、comments、attachments、demographics、political profile和未审查文本drop。

Synthetic覆盖1,733→789→239→76的不同population、至少2项目、budget maximum、第二district、online/physical common origin、proposal合并、technical validation不等于truth、winner不等于appropriation，以及Decidim默认schema不能升级Barcelona deployment。所有mutation、proposal、support、vote、comment、follow和admin/actionability routes恒拒绝。

