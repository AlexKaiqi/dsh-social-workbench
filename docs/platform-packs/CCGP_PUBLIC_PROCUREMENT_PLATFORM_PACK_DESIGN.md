# 中国政府采购网（CCGP）公共公告 Platform Pack 设计

状态：`researched` / `manual-first` 设计候选；未抓取页面、未调用接口、未下载附件  
核验日期：2026-08-26  
Pack ref：`ccgp-public-procurement/v0-design`

## 1. 结论与接入边界

中国政府采购网是高价值的全国政府采购需求入口，但当前公开证据不能支持“公众查询官方 API”这一能力声明。

[财办库〔2024〕30号](https://www.ccgp.gov.cn/news/202402/t20240227_21569854.htm) 要求地方分网自 2024 年 4 月 1 日起将本地区全部政府采购项目公告推送到中央主网，中央主网提供一站式查询；[数据接口规范通知](https://www.ccgp.gov.cn/zcfg/mof/202403/t20240306_21605100.htm) 则要求省级财政部门以公函申请、由中央主网邮件发送调试地址、账号和验证方法。该接口是地方分网与中央主网的受控发布/共享面，不是公众数据读取 API。

因此本 Pack 的可信基线是：

```text
official public portal/schema evidence   eligible
user-selected notice/manual import       manual-only
public search automation                 deferred
provincial-to-central ingest API         partner-only / not a research read route
notice publication / bid submission      rejected
```

公开页面可见不自动授权批量爬取。找到社区 crawler 或网页内部 endpoint，也不能将其升级成官方 API；在明确网站复用/自动访问政策和稳定公众机器接口前，不发布 unattended Connector。

## 2. Platform Concepts

| Concept ID | Kind | 身份候选 | 关键语义 |
| --- | --- | --- | --- |
| `ccgp.procurement-project/v1` | entity | 官方项目编号 + 发布主体 scope | 采购业务过程；项目编号可能由地方系统产生，不能假定全国唯一 |
| `ccgp.publication-notice/v1` | entity | 官方 canonical URL/page ID；待 fixture 核验 | 一次公告/公示发布，不等于整个项目 |
| `ccgp.notice-kind/v1` | enumeration | 官方格式/接口字典 code | 采购意向、资格预审、采购公告、单一来源公示、结果、更正、合同、合同变更等 |
| `ccgp.procurement-intention/v1` | entity/event | notice identity | 未来采购计划和需求概况；预算/时间仍可能变化 |
| `ccgp.procurement-package/v1` | entity | project + 包号 | 分包/标包；预算、供应商和结果必须保留 package scope |
| `ccgp.purchasing-entity/v1` | entity | official organization ID if present; otherwise notice-local | 采购单位；不能仅按名称跨地方归并 |
| `ccgp.procurement-agency/v1` | entity | official agency ID if present | 代理机构，与采购单位角色不同 |
| `ccgp.procurement-item-classification/v1` | value | 政府采购品目 code/version | 货物、工程、服务及细分类；字典版本必须固定 |
| `ccgp.procurement-method/v1` | enumeration | 官方采购方式 code | 公开招标、竞争性谈判/磋商、询价、单一来源、框架协议、合作创新等 |
| `ccgp.result-notice/v1` | entity/event | notice + project/package | 中标/成交结果；不能覆盖原采购公告 |
| `ccgp.correction-notice/v1` | entity/event | notice + referenced publication when available | 更正公告；更正正文、对象和原因应形成关系，不原地改写旧证据 |
| `ccgp.contract-notice/v1` | entity/event | notice + contract/project ref | 合同公开；与结果公告、合同原件、履约事实分开 |
| `ccgp.contract-change-notice/v1` | entity/event | notice + contract ref | v1.2 新增接收类型；表示合同变更公开，不等于完整修订历史 |
| `ccgp.notice-attachment/v1` | entity/manifest | notice + official attachment ref | 采购文件、声明函、合同附件等；逐件 rights/security 治理 |

[政府采购信息发布管理办法](https://www.ccgp.gov.cn/zcfg/mofgz/201912/t20191211_13537333.htm) 区分公开招标、资格预审、单一来源、中标成交结果、合同和监管信息，并规定中央与省级分网的发布责任；[2020 格式规范](https://www.ccgp.gov.cn/zcfg/mof/202003/t20200325_14062417.htm) 是概念/字段的官方知识源，但不证明公共读取协议。

### 2.1 原生身份与关系

- 公告、项目、包、合同、采购意向是不同身份；标题和采购单位名称不能充当主键。
- 接口规范 v1.0 的 `ccgpuuid` 用于附件推送，`UNIQUE_LINK_ID` 可串联公告，但它们属于受控 ingest contract；必须通过实际公开 representation fixture 证明可见后才能用作公共 Observation identity。
- 更正/撤销/合同变更是新的发布事实，不能覆盖旧公告或只保留“最新正文”。
- 中央主网与地方分网可能同时出现同一公告；只有官方 linkage/canonical evidence 才能确认为同一发布，URL/标题相似只生成 relation candidate。

## 3. Capability adoption

| Capability | Access | Adoption | 边界 |
| --- | --- | --- | --- |
| `content.import.procurement-notice/v1` | user-selected URL/file | `manual-only` | 用户明确选择的公开公告，preview 后导入；coverage=selected |
| `document.import.procurement-notice/v1` | user-selected attachment | `manual-only` | 单文件 rights/MIME/hash/size/security 检查 |
| `discovery.search.procurement-notices/v1` | public website search | `deferred` | 当前无获证公众机器 contract，不注册自动 route |
| `content.read.procurement-notice/v1` | public HTML | `deferred` | presentation 不是稳定 schema；待 terms/robots/fixture/sandbox 审查 |
| `change.observe.procurement-notice/v1` | repeated approved manual observations | `manual-only` | 只能描述 observed change，不能声称完整公告历史 |
| `content.write.procurement-notice/v1` | provincial/authorized publication systems | `partner-only` 且本 Pack `rejected` | 官方接口需申请、签名、HTTPS，面向地方分网/发布主体 |
| `response.submit.procurement-bid/v1` | local transaction platform | `rejected` | CCGP 公告门户不等于投标系统；不做虚假响应 |
| `supplier.profile/risk/v1` |监管/失信接口 | `rejected` | 与需求发现目的不同，可能涉及敏感画像和独立授权 |

## 4. Access Methods

### 4.1 `ccgp-selected-public-notice/v1`

- mode：`manual-import` / `manual-package`；
- input：用户选择的 official URL、保存的 HTML/PDF/附件或结构化摘录；
- representation：公开 HTML/PDF 标为 `presentation`，用户摘录标为 `manual-extract`；
- coverage：`selected`，population 明确为本次选择项，不能扩大成全国/地区/关键词完整结果；
- identity：保留 canonical URL、页面可见项目/公告编号和 observed hash，未验证字段不升格为 native ID；
- effect：local-write only；不自动遍历列表、详情或附件。

### 4.2 `ccgp-data-interface-v1.2/v1`

这是 `partner-only` 官方知识/发布 surface，不是本 Pack 的 runtime route。[v1.0 说明](https://www.ccgp.gov.cn/sjbzjgf/202403/t20240304_21594369.htm) 要求 HTTPS、数字签名并新增撤销采购意向、附件等接口；[v1.2 说明](https://www.ccgp.gov.cn/sjbzjgf/202603/t20260316_26275504.htm) 新增合同变更公告和严重违法失信记录能力。只有获批地方财政系统才能另建发布型 Pack，且其 credential、签名、write approval 与需求研究完全隔离。

## 5. Platform Skills

### `ccgp-pack-research/v1`

- purpose：`research/curate`；
- 跟踪数据接口规范、公告格式、基础字典、中央/地方覆盖政策、网站声明/robots 和公告页面 representation；
- 输出 evidence、adoption decision 和 knowledge proposal；禁止调用内部 endpoint、执行 crawler 或把社区 README 当官方依据。

### `ccgp-selected-notice-curation/v1`

- purpose：`acquire/manual`；
- 输入：固定 snapshot、用户选择的 URL/file、研究问题和 retention；
- 输出：preview、manual Observation、document descriptors、selected CoverageAssessment；
- 禁止：翻页枚举、自动详情/附件扩展、联系人画像、代理机构/供应商营销名单和平台写入。

### `ccgp-conformance/v1`

- purpose：`verify/diagnose`；
- fixture 默认离线，来源于获准保存并去标识化的公告样本；
- 验证 notice/project/package/contract 分离、金额单位、日期/时区、公告类型、correction relation、presentation metadata、attachment manifest 和 selected coverage。

没有 Probe Skill。真实采购公告、询问、报名和投标都会进入受监管流程，不能作为产品试验。

## 6. 数据治理

- 采购人/代理机构组织信息只做业务角色，不默认建立联系人或供应商个人画像。
- 预算、最高限价、中标金额、合同金额和变更金额必须保存 amount kind、币种/单位和 package scope，不能压成一个 `budget`。
- 采购文件可能含第三方知识产权、保密限制或仅限投标用途；公开可下载不等于可训练、镜像或再发布。CCGP 对采购文件知识产权的讨论也强调应逐文件判断：[采购文件知识产权](https://www.ccgp.gov.cn/llsw/202411/t20241126_23708335.htm)。
- HTML 解析结果是 derived projection；原文 blob、解析器版本、字段 span 与 manual corrections 分开。
- 用户提供的文件若包含供应商响应、投标文件或个人信息，应由 policy blocker 拒绝或进入更严格的 authorized/private Pack，而不是混入公共公告数仓。

## 7. 开源 Artifact 候选

以下 revision 于 2026-08-26 通过只读 `git ls-remote` 固定，未 clone、安装或执行：

| Artifact / revision | License / maturity | 研究价值 | 决策 |
| --- | --- | --- | --- |
| [facadefish/ccgp-monitor](https://github.com/facadefish/ccgp-monitor/tree/0c50a61e8054c2251d99ebc667974b0bfdd75ce5) `0c50a61e8054c2251d99ebc667974b0bfdd75ce5` | MIT；单 commit、2026 新项目 | list/detail、字段、限流、skill/profile 和去重候选 | `discovery-only`；HTML crawler 非官方，评分 claim 不进入 core |
| [ir-st/TenderCrawler](https://github.com/ir-st/TenderCrawler/tree/912f50d9905162eaa8b9f705e85bc72feef29b61) `912f50d9905162eaa8b9f705e85bc72feef29b61` | MIT；社区项目 | CCGP presentation parsing、snapshot diff、deadline extraction、OpenClaw skill 样本 | `reference-only`；不运行，内部 endpoint/selector 需独立审计 |
| [xinxinxiangyin09/ZhaoBiaoSpider](https://github.com/xinxinxiangyin09/ZhaoBiaoSpider/tree/9fd5baa793fb2fcc81c260423d1115e5fbc6d16f) `9fd5baa793fb2fcc81c260423d1115e5fbc6d16f` | 未见 LICENSE；多站点旧目录 | 省级分网异构和 endpoint drift 的历史证据 | `discovery-only`；无复用权、明显陈旧，不作为 runtime 候选 |

社区项目共同证明“可写 parser”而非“获准、稳定、完整”。任何未来 browser/HTTP adapter 都必须重新做网站政策、访问频率、字段、负向测试和 live approval，不继承这些项目的假设。

## 8. Verification Plan

### evidence-review / static-contract

- 官方 ingest/publication interface 与公众 read capability 分开；
- public HTML/PDF 为 presentation，不能声明 schema-native；
- manual import 的 coverage 固定 selected population；
- notice/project/package/contract/correction identity 不混用；
- `ccgpuuid`/`UNIQUE_LINK_ID` 未在 public fixture 证实前不作公共主键；
- attachment descriptor 不等于可下载/可复用 blob；
- website crawler、publication、bid、supplier-risk route 均不可物化。

### fixture-conformance

| Fixture | 必须证明 |
| --- | --- |
| procurement intention + later notice | 两个发布事实，可形成候选 relation，不覆盖 |
| project with multiple packages | 预算/截止/结果保留 package scope |
| correction/result/contract change | native claim 与 observed diff 分开，历史不丢失 |
| central/local duplicate-looking pages | 无 linkage evidence 不自动合并 |
| amount in 万元/元 and missing currency | 单位规范化可追溯，缺失为 unknown |
| embedded/linked attachment | descriptor、manual retrieval、blob、rights 分层 |
| malformed HTML/schema drift | quarantine + parser reverify，不静默填字段 |
| contact/supplier personal data | common projection 最小化 |
| search/list URL input | manual Pack 拒绝自动扩展为 crawl |
| publication/bid payload | policy blocker |

### sandbox-live / canary

当前不设计 automatic sandbox。只有后续找到并审阅明确公众机器接口或网站自动访问政策，且用户另行批准后，才可对极小白名单做 read-only sandbox；否则 verification 最高停在 fixture/manual replay。没有 verified automated route，就不创建 operational canary，只监控官方规范/公告格式/网站政策和开源候选漂移。

## 9. 晋级缺口

`researched → modeled` 需要 accepted concept/schema、官方公告字典、manual import contract、rights/retention 和离线 fixtures。自动读取能力仍为 deferred；它不能因 fixture parser 通过而升级。当前不授权任何网络采集、附件下载或平台副作用。
