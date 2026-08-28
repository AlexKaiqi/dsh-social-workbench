# 百度指数 External Search Demand Platform Pack 设计

状态：`researched / commercial-contract-only / public-schema-blocked / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`baidu-index-external-search-demand/v0-design`

## 1. 定位与证据冲突

百度指数值得研究，因为它提供中文市场的搜索热度、PC/mobile、地域和前后相关需求词；但当前公开证据不足以形成自动Connector：

- [当前首页](https://index.baidu.com/v2/)宣传“实时调用数据接口化获取”和付费API加词，说明商业数据接口可能存在；
- [官方帮助](https://index.baidu.com/Helper/?tpl=help)仍写大众版不支持下载、百度指数暂不提供开放API；
- 本轮没有发现公开、版本化、无需签约的endpoint、auth、schema、quota、retention或data-use文档；
- [版权声明](https://index.baidu.com/Helper/?tpl=copyright)限制未经授权的复制、发布、改写、再发行与商业使用。

因此本Pack只登记稳定概念和未来商业合同门，不通过HTML、Cookie、浏览器network、internal endpoint或社区解密代码补齐。当前未购买接口/新词、未登录、未获取token、未读取指数。

## 2. 稳定概念与抽象映射

| 百度指数概念 | `ExternalSearchDemand*`映射 | 解释边界 |
| --- | --- | --- |
| 搜索指数 | provider-weighted-index | 以搜索量为基础的关键词搜索频次加权和，不是absolute search count |
| PC / 移动搜索指数 | network/device-specific weighted index | 不相加，除非官方合同明确overall计算 |
| 趋势研究 | interest-series record | keyword/region/window/device定义固定 |
| 同比/环比 | provider-derived comparison | 超过一年时产品可能不展示；不从缺失推断零变化 |
| 比较检索 | term-set seed/comparison | 当前帮助最多5组；comparison definition固定 |
| 累加检索 | provider composite subject | 当前帮助最多3个词；组合词不等于独立词count之和 |
| 需求分布 | related-term ranked/weighted representation | 前序/后序相关性与相关词自身指数是不同measure |
| 资讯指数 | separate provider-index population | 基于分发/阅读/互动加权，与搜索指数不同 |
| 媒体指数 | separate media population | 新闻标题包含关键词的收录数量，与搜索指数无直接关系 |
| 人群/地域属性 | provider-derived demographic aggregate | 默认排除；需要单独privacy/用途设计 |
| 新词创建 | paid irreversible platform write | 第二天起计算、不回溯、不删除/退款；本Pack拒绝 |

百度指数的“关键词”不自动等同Google Trends term、Google topic或Ads close-variant group。跨provider bridge只允许reviewed exact-language term或明确provider identity，不能按中文翻译/同义词自动合并。

## 3. 未来商业接口合同

在取得用户明确授权和官方合同artifact前，全部machine capabilities返回`capability-unavailable:no-public-versioned-baidu-index-contract`。未来binding至少需要：

- contracting entity、account/principal、product tier、environment、credential ref和effective/expiry；
- official endpoint/API version/schema、task lifecycle、token refresh、quota/rate/cost和error taxonomy；
- search/info/media/demand-map/demographic datasets的exact capability roster；
- keyword/composite/region/device/window/timezone、index scale/weighting/revision、zero/missing/suppression与history语义；
- query/keyword roster、data-use、AI analysis、storage/index、audience、attribution、retention/deletion和termination export/delete；
- read与paid new-word creation的effect隔离，所有purchase/create/write默认deny。

官网出现“API”按钮或商业SDK能调用，只证明候选机器面，不证明任何上述条款。Schema只接受官方contract/document或获准sandbox response，不从社区代码反推成官方事实。

## 4. Skills与开源审计

### `baidu-index-contract-research/v1`

只读官方首页/help/copyright和用户提供的正式报价/合同/docs，产出capability/schema/rights proposal；不登录、购买、获取token或联系销售。

### `baidu-index-negative-conformance/v1`

验证无合同、公开schema冲突、HTML/Cookie/internal endpoint、token越界、新词purchase/create和demographic请求全部在network前拒绝。

当前没有acquire Skill；未来只有合同/schema接受后才可定义`baidu-index-approved-read/v1`。

| Artifact | Fixed revision / license | 价值与决定 |
| --- | --- | --- |
| [lampofaladdin/baidu-index](https://github.com/lampofaladdin/baidu-index/tree/f1b10ab2992056cc73c14664cbe72299547f7b05) | `f1b10ab2…`；package manifest声明MIT但无root LICENSE | 商业token/task/refresh候选shape；`contract-schema-reference-only`，非官方且不证明数据许可 |
| [longxiaofei/spider-BaiduIndex](https://github.com/longxiaofei/spider-BaiduIndex/tree/fe251d22a9938ee9f0bd667ad153cd9f1da20fef) | `fe251d22…` / MIT | Cookie/internal endpoint/decryption/rate failure evidence；`rejected-private-route` |

未发现官方百度指数Agent Skill/MCP。社区代码许可只约束代码，不授予百度指数内容、接口、账号、AI分析或长期保留权。

## 5. Fixture、可观测性与晋级

| 场景 | 必须结果 |
| --- | --- |
| 首页称有API、公开help称无开放API | contract ambiguity；machine binding blocked |
| community SDK展示task endpoint | schema candidate only；不发布official capability |
| search index=1000 | weighted index；不标1000 searches/users |
| PC/mobile/overall同时出现 | 三个provider measures；不自行相加 |
| 组合关键词值 | composite subject；不分摊给成员词 |
| related source/destination词 | 两个relation/selection contexts；不当因果路径 |
| demographic字段请求 | separate privacy review；默认deny |
| 新词创建/购买 | high-impact paid write拒绝；zero charge |
| Cookie/internal endpoint输入 | preflight拒绝；zero network |

Telemetry在当前阶段只记录knowledge evidence age、official-doc conflict、contract/schema gap、candidate rejection和zero network/account/cost/write。未来获批binding才按`contract × capability × schema × keyword roster × region/device/window`增加token/task/quota/cost、index/missing/suppression、methodology drift、retention/deletion和kill switch。进入fixture-eligible至少需要官方版本化schema与用途合同；sandbox和operational仍需分别授权。

本Pack没有搜索或新词Probe。购买新词、制造搜索、重复查询、刷指数、投放或自动点击都不能作为本Channel验证手段。
