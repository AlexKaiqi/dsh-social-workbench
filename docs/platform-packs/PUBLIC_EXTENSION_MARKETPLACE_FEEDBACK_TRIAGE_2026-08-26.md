# 公开扩展市场反馈候选分流（2026-08-26）

状态：`evidence-reviewed triage`；无网络 route、无采集、无平台写入  
研究目的：发现软件扩展在真实采用后的兼容性故障、未满足能力、迁移原因与版本回归

## 1. 为什么这是独立信号缺口

自有 App Store/Google Play 评论只能覆盖用户控制的产品；论坛讨论更适合早期问题表达。公开扩展市场评论位于二者之间：评论者通常已安装或使用具体软件扩展，记录会关联产品、版本、评分、开发者回复或市场聚合，但读取权限、历史投影与许可不能借用自有商店或论坛的结论。

本轮只回答三个问题：是否有官方、可版本化的公开读取面；其稳定概念是否值得进入 `ProductFeedback*`；在不使用 HTML、Cookie、私有接口或社区 scraper fallback 的条件下能否形成 fixture-eligible Platform Pack。

## 2. 候选比较

| 候选 | 需求价值 | 官方读取事实 | 当前结论 |
| --- | --- | --- | --- |
| Mozilla Add-ons (AMO) | Firefox 扩展、主题、字典等采用后反馈；评分可关联扩展版本，且有开发者回复 | 官方 Add-ons Server v4 提供 public add-on search/detail/version 与 rating list/detail；v4 明确 frozen；AMO Review Guidelines 说明评论来自安装/使用者的意见 | 选择为首个 Pack；`researched / fixture-eligible / no-callable-route` |
| Chrome Web Store | 浏览器扩展规模大，兼容性与迁移价值高 | 当前 Chrome Web Store API v2 面向开发者管理自己的 extension，资源仅覆盖 media 与 publisher items；未发现官方公共 review read surface | `unsupported-official-public-review-read`；不以产品页 HTML 补齐 |
| JetBrains Marketplace | IDE 插件版本兼容、升级回归和开发工作流痛点价值高 | 官方 API reference 提供 upload、update、list/detail/download、license 等能力；reviews 在网站公开且规则明确，但官方 API reference 未列出 review read endpoint | `manual/policy-gated`；在官方 review API 或明确合同出现前不建自动 route |

### 2.1 Mozilla 的晋级理由

- [v4 External API](https://mozilla.github.io/addons-server/topics/api/v4_frozen/index.html) 明确标为 frozen，并给出 production、staging、development 三个独立环境；
- [v4 Add-ons API](https://mozilla.github.io/addons-server/topics/api/v4_frozen/addons.html) 可搜索 public add-ons、读取详情和 public versions；
- [v4 Ratings API](https://mozilla.github.io/addons-server/topics/api/v4_frozen/ratings.html) 区分评分、可空正文、版本、latest 状态、prior count 与 developer reply；默认 add-on 列表只给每个用户的最新 rating，因此它是 provider projection，不是完整历史；
- [Review Guidelines](https://addons.mozilla.org/en-US/review_guide) 把评论定位为已安装/使用后的意见，并允许作者对评论做一次响应；这提高了使用后反馈价值，但不保证真实性、代表性或问题仍然有效；
- Review Guidelines 页面带 CC BY-SA 3.0-or-later 站点声明，但许可必须按具体响应/页面绑定，不能外推到 add-on binary、外部链接或所有 API 字段；
- [Mozilla Acceptable Use Policy](https://www.mozilla.org/en-US/about/legal/acceptable-use/) 禁止未经许可收集/harvest PII，并明确包括 account names。Pack 因此不保留 reviewer id/name/username/profile URL，不按 user 查询，不做跨平台身份关联。

v5 是当前 stable default，但其[官方 overview](https://mozilla.github.io/addons-server/topics/api/overview.html)同时声明 API 尚未 frozen、可无预告变化。首个候选 route 因而固定 v4；v5 只作为 schema/drift research surface，不做静默 fallback。

### 2.2 Chrome 与 JetBrains 为什么不进入 fallback

- [Chrome Web Store API](https://developer.chrome.com/docs/webstore/api) 的官方用途是发布和管理开发者自己的 extension，不提供任意产品的公共评论读取合同。网页“可看见”不能推导出可系统采集、版本化保存或 AI 索引；
- [JetBrains Marketplace API Reference](https://plugins.jetbrains.com/docs/marketplace/api-reference.html) 没有 review read API；[Reviews Policy](https://plugins.jetbrains.com/docs/marketplace/reviews-policy.html)和[rating 说明](https://plugins.jetbrains.com/docs/marketplace/plugins-rating.html)只能证明公开产品行为，不是 Connector 合同；
- Chrome 的公开评论与 JetBrains 的公开网页都保留为 future candidate evidence。Channel 必须返回 missing-member coverage，不能调用 HTML、Cookie、browser automation、MCP、Skill 或 community scraper 来伪装成员可用。

## 3. 概念与抽象决策

本轮推翻“评论只需通用 revision/representation，不需核心类型”的过早结论。三个稳定问题跨 owned/public surface 重复出现：

1. `rating-only` 与 written review 不同，评分总量不是评论正文总量；
2. canonical record、latest-per-subject projection、aggregate snapshot 与 provider summary 不是同一种 representation；
3. review、developer/community reply、moderation 与产品版本是有方向的记录和关系，visible/latest/resolved/affects-aggregate 是正交状态。

因此新增 `ProductFeedbackDefinitionMetadata`、`ProductFeedbackRecordMetadata` 与 `ProductFeedbackSpanMetadata`。它们只统一来源 representation，不统一权限、许可、人口边界、rating scale 或 Channel roster。

## 4. 开源与 Agent Skill 静态快照

只做固定 revision 的源码、许可和用途审阅；未 clone、安装或执行。

| Artifact | Fixed revision | 价值 | 决策 |
| --- | --- | --- | --- |
| [mozilla/addons-server](https://github.com/mozilla/addons-server/tree/878c70836491cfbfce0f78cb137bdedd262d9949) | `878c70836491cfbfce0f78cb137bdedd262d9949` | 官方 API/schema/test 与 server 语义；BSD-3-Clause | `official-reference`；不嵌入 server |
| [mozilla/addons-frontend](https://github.com/mozilla/addons-frontend/tree/0fdc7b6aa940c8023142c5d8152f8425664d4a74) | `0fdc7b6aa940c8023142c5d8152f8425664d4a74` | 官方 review 展示、分页、翻译与前端选择行为；MPL-2.0 | `reference-only`；依赖面过宽，不执行 |
| [mozilla/web-ext](https://github.com/mozilla/web-ext/tree/c6737719dc6c55a24746faf1910205b3d04653e8) | `c6737719dc6c55a24746faf1910205b3d04653e8` | 官方 build/sign/submit CLI；MPL-2.0 | 本研究为只读反馈，写入与 credential surface 均 out-of-purpose |

本次官方资料与固定仓库搜索未识别到 Mozilla 官方的 AMO demand-research Agent Skill 或 MCP。这个结论只表示本次审阅未发现，不证明生态中永久不存在；社区 Skill/MCP 即使出现，也不能替代官方 route、rights 与 fixture conformance。

## 5. 分流决策

```text
Mozilla AMO ──> 发布 Platform Pack 设计 ──> fixture eligible ──> no callable route
Chrome CWS ───> missing: official public review read
JetBrains ────> missing: documented review read API + exact reuse contract
```

下一轮发现触发：Chrome 或 JetBrains 官方 API/schema/terms 出现 public review read；AMO v4 生命周期变化；AMO v5 frozen/stability 承诺变化；站点许可/AUP 变化；或需求分析暴露新的扩展生态缺口。任何触发先追加 evidence snapshot，不直接改变 route。
