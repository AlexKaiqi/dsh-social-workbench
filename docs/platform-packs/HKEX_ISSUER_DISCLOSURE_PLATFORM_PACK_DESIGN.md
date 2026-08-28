# HKEX Issuer Disclosure Platform Pack 设计

状态：`researched / licensed-route-fixture-eligible / policy-blocked / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`hkex-issuer-disclosure/v0-design`

## 1. 产品与population

本Pack区分两种完全不同的产品：HKEXnews网站的人类浏览面，以及需申请、认证与数据许可的Issuer Information feed Service（IIS）。[IIS](https://www.hkex.com.hk/Services/Market-Data-Services/Infrastructure/Issuer-Information-feed-Service-(IIS)?sc_lang=en)实时分发上市公司/发行人的trading news与announcements，并发布Transmission Specification v4.7及certification材料；这为synthetic route fixture提供正式协议证据，但不代表本机获订阅或获AI/index用途。

## 2. 概念映射

| Native concept | `PublicCorporateDisclosure*` | 约束 |
| --- | --- | --- |
| issuer/security code | entity/security identity | code、issuer和多地上市关系不按名称自动合并 |
| headline/news subtype | filing envelope/record type | headline taxonomy不是document内容事实 |
| announcement/report/circular | filing document/periodic/material event | issuer-authored与exchange-published authority分开 |
| deletion/correction message | lifecycle/exact relation | 消失不标抓取缺口；派生索引需失效 |
| Chinese/English document | alternate language relation | 不假设逐段等价或同一official status |
| IIS message/content | licensed feed representation | entitlement、redistribution、AI与retention逐合同固定 |
| HKEXnews result/PDF | website representation | 当前禁止程序化获取和文本挖掘，不是fallback |

## 3. 政策与开源候选

[HKEXnews Terms](https://www2.hkexnews.hk/Global/Exchange/Terms-of-Use?sc_lang=en)在无书面许可时仅允许有限个人使用，并明确禁止programmatic/scripted access、systematic retrieval、text/data mining、web scraping及AI开发/训练/验证用途。policy gate必须先于DNS、HTTP、browser、candidate extraction和materialization；公开可见、PDF直链或community代码均不能绕过。

固定community候选`hkexnews-downloader@871d128…` MIT宣称反爬绕过与并发PDF下载；`mcp-hkexnews@e9d832e…` MIT下载、解析并本地全文索引。两者技术面直接落入当前禁止范围，状态为`rejected-policy-circumvention`，不安装、不执行、不连接。未发现HKEX官方领域Skill/MCP。

## 4. Fixture、观测与晋级

fixture只根据IIS v4.7公开协议手写，覆盖issuer/news/document identity、headline subtype、multi-document、language、correction/deletion、sequence gap、reconnect/replay、entitlement、license expiry和zero website access。不得从HKEXnews页面或community实现录制fixture。

Telemetry在未获合同时只记录`policy-blocked-before-network`和evidence expiry；不能产生伪造的availability/latency/coverage。未来只有合同明确覆盖目标issuer population、feed fields、document bytes、AI辅助分析、storage/index/retention/deletion/redistribution且用户另行授权后，才可做certification/sandbox canary；website仍不作为降级route。
