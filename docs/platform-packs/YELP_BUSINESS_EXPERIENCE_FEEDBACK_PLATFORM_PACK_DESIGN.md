# Yelp Business Experience Feedback Platform Pack 设计

状态：`researched / synthetic-fixture-eligible / ordinary-api-ai-use-blocked / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`yelp-business-experience-feedback/v0-design`

## 1. 产品表面不可混合

| 表面 | Representation | 当前用途判定 |
| --- | --- | --- |
| Places Search/Details | business identity + aggregate | consumer display oriented |
| Reviews endpoint | provider-selected short excerpts | 不是full review feed |
| Yelp AI API / official MCP | provider-generated conversational answer | 需独立商业许可；不是raw review warehouse |
| quote/reservation | external effect | 本研究Channel排除 |

[Places概览](https://docs.developer.yelp.com/docs/places-intro)与[FAQ](https://docs.developer.yelp.com/docs/places-faq)表明review能力通常只返回最多3条、约160字符的节选。endpoint文档中的limit/offset字段不能被解释为完整可分页总体，必须以实际product contract和response semantics为准。

## 2. 权利与AI边界

[API Terms](https://terms.yelp.com/developers/api_terms/20250909_en_us/)和[展示要求](https://terms.yelp.com/developers/display_requirements/)对consumer-facing用途、署名、链接、短期缓存及分析有限制，并明确限制未经许可把Yelp Content用于生成式AI或派生NLP/AI系统。因此普通Places key不能成为本系统采集、embedding、索引或痛点挖掘路线。

官方[Yelp AI API](https://business.yelp.com/data/products/ai-api/)及[Yelp MCP](https://github.com/Yelp/yelp-mcp/tree/bd1b41c254986864ba65e70f4a192f36a30363b7)可作为未来“provider answer”合同候选，但必须获得exact commercial agreement并验证回答留存、引用、日志和下游用途。MCP中的预订等effect能力不进入read binding。

## 3. 抽象、fixture与开源审计

Places review映射为surface=`public-business-review-marketplace`、representation=`provider-excerpt`；AI/MCP输出映射为surface=`provider-conversational-answer`、representation=`provider-generated-answer`。二者不能用于重建full review，也不能按节选频次推断总体问题占比。

固定官方[yelp-mcp `bd1b41c…`](https://github.com/Yelp/yelp-mcp/tree/bd1b41c254986864ba65e70f4a192f36a30363b7)为Apache-2.0，[yelp-fusion `b665455…`](https://github.com/Yelp/yelp-fusion/tree/b66545583b9d1f337e20582e98aded32160f52cb)为MIT；代码license不授予Yelp Content权利。Yelp Open Dataset仅教育用途，不是生产替代路线。

fixture验证3条/160字符边界、provider selection、aggregate与excerpt分离、attribution/read-more、24小时缓存边界、AI-purpose拒绝、MCP answer lineage、reservation/quote工具拒绝和zero network/effect。

## 4. 可观测性与晋级

Telemetry按`product surface × business × schema/tool digest × locale/window`记录returned excerpts、truncation、sample-total gap、attribution/source、cache age/eviction、purpose/AI rights rejection、answer citations、tool-set/effect drift和zero writes。普通API和AI API分别晋级；任何AI route均不得fallback到ordinary Places、HTML、community scraper或Open Dataset。
