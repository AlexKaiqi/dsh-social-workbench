# Google Places Business Experience Feedback Platform Pack 设计

状态：`researched / synthetic-fixture-eligible / display-oriented / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`google-places-business-experience-feedback/v0-design`

## 1. 定位与 representation

本Pack表达Place Details返回的地点身份、aggregate rating和provider-selected review sample，不表达地点全部评论，也不表达自有Business Profile历史。

[Place resource](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places)说明`reviews[]`按相关性排序且最多5条，可能包含rating、localized/original text、author attribution、publishTime、source/report links与可选visitDate；`reviewSummary`是“Summarized with Gemini”的provider-generated内容，必须独立成representation。[Place Details](https://developers.google.com/maps/documentation/places/web-service/place-details)要求field mask，reviews属于计费SKU。

## 2. 使用权边界

[Places政策](https://developers.google.com/maps/documentation/places/web-service/policies)要求作者署名和直接来源入口，并要求披露review排序/筛选；Google也不把评论陈述视作已验证事实。[Maps Service Terms](https://cloud.google.com/maps-platform/terms/maps-service-terms)对Maps Content的存储、导出和派生使用有严格限制。

所以当前只允许synthetic schema fixture；不得把API key/技术可访问性解释为持久存储、向量索引、LLM训练/分析或跨平台聚合权。Place ID缓存特例也不扩张到review内容。

## 3. 抽象、Skills 与 fixture

映射为surface=`public-place-details`，reviews为`provider-selected-sample`，reviewSummary为`provider-generated-answer`，rating/userRatingCount为`aggregate-snapshot`。definition固定field mask、language/region、place ID、selection/sort、SKU与policy revision。

官方[Maps Agent Skills](https://github.com/googlemaps/agent-skills/tree/84f0e9a2527403a408a61b8705bea0c3900b76a8)和[Maps Grounding Lite MCP](https://developers.google.com/maps/architecture/grounding-with-maps-mcp)只作为能力表面证据：coding skill不取数；Grounding output是provider-grounded answer，不是raw review feed。

`google-places-contract-research/v1`与`google-places-fixture/v1`均不联网。fixture验证最多5条、相关性选择、field-mask缺失、localized/original text、author/source attribution、visitDate精度、summary/review authority隔离和zero cache/materialization。

## 4. 可观测性与晋级

Telemetry按`place × field-mask/schema × language/region × selection/policy revision`记录returned sample size、aggregate count、sample-vs-total gap、missing author/source、summary lineage、attribution/display refusal、rights block和zero durable writes。未来即使能做live detail call，也必须把“短时用户展示”与“分析仓库”分成不同binding、purpose和promotion gate。
