# Google Business Profile Experience Feedback Platform Pack 设计

状态：`researched / synthetic-fixture-eligible / policy-blocked-for-durable-analysis / no-callable-route`  
核验日期：2026-08-26  
Pack ref：`google-business-profile-experience-feedback/v0-design`

## 1. 定位与总体

本Pack只表达principal自有或被授权管理、且已验证地点的Business Profile评论。它不表达Google Maps公共地点全体、竞品评论市场、Search需求或已验证交易结果。

[reviews.list](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list)按location读取，page size最多50，可按rating或updateTime排序并返回averageRating、totalReviewCount；[Review resource](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews)包含reviewer、starRating、comment、create/update、media及商家回复。reply是独立商家陈述，不证明问题已解决。

## 2. 能力、权利与效果边界

- `list/get/batchGet reviews`是读能力；每个binding固定account/location、sort、page、字段与watermark。
- `updateReply/deleteReply`是高影响写能力，本研究Channel永久不暴露；未来若单独产品化，需用户逐次授权、outbox/effect ledger和回执对账。
- [前置条件](https://developers.google.com/my-business/content/prereqs)要求获批project、组织账号与符合条件的Business Profile；[基础设置](https://developers.google.com/my-business/content/basic-setup)说明没有sandbox，并使用广泛的`business.manage` OAuth scope。
- [政策](https://developers.google.com/my-business/content/policies)把访问限制在有关系的地点，并对内容存储设限；当前标准政策不足以支持本系统长期聚合、索引或AI数仓。因此network和materialization gate均关闭。

## 3. 抽象与 fixture

映射为surface=`owned-business-profile`、representation=`owned-location-history`。business unit/location使用provider stable ID；review、aggregate和business reply分别成record，通过exact reply relation连接。verification只记录provider assertion；reviewer profile/media默认drop或restrict。

合成fixture必须验证分页、排序变化、comment缺失的rating-only、review update、reply create/update/delete、aggregate与record coverage、地点越权、30日边界和zero write。删除或权利撤销必须能使派生索引失效。

## 4. Skills、观测与晋级

`google-business-profile-contract-research/v1`只读官方文档与用户提供批准资料；`google-business-profile-fixture/v1`只跑本地合成数据；未来`approved-read/v1`在没有exact authorized binding时返回`no-authorized-owned-location-binding`。

Telemetry按`principal × account × location × API/schema revision × sort/window`记录expected/returned/retained/dropped、分页/coverage、rating-only、reply、identity drop、scope/policy/schema drift和zero writes。因无sandbox，只有在书面用途/retention/AI/index权利获批后，才可设计最小只读operational canary。
