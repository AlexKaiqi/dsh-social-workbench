# 公共审计发现、建议与跟踪平台分流（2026-08-26）

状态：`researched / architecture-only / no-live-read`  
核验日期：2026-08-26

## 1. 为什么是下一领域

公共审计把机构职责和资金活动转化为有范围、有标准、有方法的已报告问题，以及面向责任主体的建议和后续落实信息。它比一般新闻或意见更接近可验证的运营痛点；同时比诉讼全域更窄，能在不推断法律责任的前提下形成稳定信号。

它不能并入监管执法、公共采购或申诉专员裁决：公共审计是assurance/oversight；监管执法围绕allegation、finding和legal obligation；采购围绕notice、award、contract与transaction；申诉裁决围绕parties、outcome、remedy和binding。共同组织名、金额或文档不构成同一事实。

最小稳定链是：

```text
engagement/report
  ├─ objective + scope + criteria + method
  ├─ finding/observation → conclusion/opinion
  └─ recommendation → auditee response → action/update
                                      └─ auditor confirmation/follow-up audit
```

## 2. 候选比较与选择

| 候选 | 痛点价值 | 契约稳定性 | 主要风险 | 决定 |
| --- | --- | --- | --- | --- |
| 公共审计报告与建议跟踪 | 高：已审计的流程、控制、交付和资源问题 | 中高：报告、建议、回应、跟踪较稳定 | scope误读、自报与复核混淆 | 本轮 |
| 专利与商标 | 中：技术/品牌方向 | 高 | 与真实用户痛点距离较远 | 后续 |
| 广义法院诉讼 | 高 | 低至中 | jurisdiction、程序与身份风险过宽 | 拆分后再审 |
| 公共预算执行 | 中高 | 中 | 会计口径和跨层级关系复杂 | 后续 |

首批成员为US GAO、UK NAO、European Court of Auditors、Australian National Audit Office、Office of the Auditor General of Canada。选择覆盖报告feed、recommendation tracker、开放数据目录和selected-record路径，但不把五个机构的audit mandate、assurance、status taxonomy或publication population统一。

## 3. 成熟度与不可混淆事实

requested=5、concept-fixture=5、route-fixture=2、selected-record/manual=3、callable=0、durable-approved=0。route fixture仅为GAO官方报告RSS与ECA官方开放数据目录的静态契约；没有请求payload。

- finding只在exact objective/scope/criteria/method/report revision内成立；published report也不是audit files中所有发现；
- recommendation不是legal obligation，不等于auditee同意、预算、采购或落实；
- agreed/accepted不是implemented；
- auditee self-report不是auditor confirmation；follow-up audit又是更强但仍有范围的独立authority；
- closed/no-longer-valid不是implemented；
- auditor-confirmed implemented不等于持续有效、因果成功或全组织完成；
- estimated/potential benefit、reported realized benefit和cash receipt保持不同role；
- follow-up tracker的selected population不是全部建议分母；
- page、PDF、RSS、tracker和dataset可为同源projection，不能重复计数。

## 4. 来源、开源与Skill审计

静态研究发现三项可复用参考，但都不是本Channel Connector：

- [US GPO govinfo API](https://github.com/usgpo/api/tree/f5ae803d8e262cff7761f8661cce38d8e926af46)固定`f5ae803…`，美国政府作品/CC0；只作官方API/MCP schema参考。GAO Reports在GovInfo的合作归档于2008-09-19冻结，不能作当前GAO fallback。
- [unitedstates/inspectors-general](https://github.com/unitedstates/inspectors-general/tree/90cac5c1e1fca0f2941aa70737295afbd99c95ad)固定`90cac5c…`，CC0；旧式多站scraper且项目自身承认站点变化会破坏采集，只作drift/coverage negative fixture。
- [dataeuropa/hub/repo](https://gitlab.com/dataeuropa/hub/repo/-/tree/9cd40dc87bf9fe53cf6f51d77e963e2cbda39758)固定`9cd40dc…`，该revision许可证为Apache-2.0；只作DCAT/search-index/API漂移参考，不是ECA专用Connector。

未发现可验证且平台专属的官方Agent Skill/MCP；此结论标记`discovery-incomplete`，不是不存在的证明。规划中的`public-audit-source-contract-research/v1`只读官方文档与固定静态源码，`public-audit-conformance/v1`只运行synthetic fixtures。未来`approved-public-audit-read/v1`必须绑定exact member/route/report roster/window/fields/purpose/retention；当前无binding。

## 5. Probe结论

本Channel没有Probe。请求审计、提交举报/证据/评论、代表被审计方回应、修改建议状态、联系或订阅都可能影响法定监督流程或外部人员，必须policy拒绝并记录zero external effects。
