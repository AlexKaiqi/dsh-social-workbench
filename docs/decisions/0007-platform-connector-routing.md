# ADR 0007：抖音以细粒度 Platform Connector 组合多个 Provider

- 状态：accepted
- 日期：2026-08-25
- 决策范围：平台能力命名、开源实现组合、路由与副作用边界

## 结论

抖音接入不以 MediaCrawler、F2 或任何单一仓库作为产品接口。工作台暴露稳定的 capability；每个开源项目、官方 API、本地模型或托管服务只是 provider。只读与本地处理可以按策略选择和降级，平台写操作继续由一次性确认、outbox 和 reconciliation 独占执行。

## 依据

- 已实测 MediaCrawler 擅长扫码登录、关键词视频搜索和评论采集，但搜索与评论在当前实现中是耦合批次。
- 本地 faster-whisper 擅长选定视频转写，不应被伪装成抖音 API。
- broadcast-kit 只负责受控私密发布，其失败和超时语义不同于读取，不能进入普通 fallback 链。
- 外部候选各有长处：解析下载、主页作品、直播流、弹幕、托管搜索或评论；把任一候选变成领域接口都会增加替换成本。
- “平台已支持”这个布尔值无法表达一级评论可用、二级评论退化、直播未接、发布必须确认等真实差异。

## 能力面

首版按结果而不是工具命名：

- session：检查、扫码登录；
- discovery：视频、用户、话题、直播搜索；
- content：视频、作者、作者作品读取；
- engagement/analytics：评论、回复和指标；
- media/live：下载、转写、直播流和直播事件；
- account：私密发布、评论、回复、点赞和关注。

未实现能力仍以 `planned` 暴露，不能通过空方法冒充可调用。Provider 必须逐能力声明 `state`、`execution`、`authorization` 以及 cost/latency/coverage/reliability 等级。

## 路由

支持五种显式策略：均衡、最低成本、最低延迟、最广覆盖和最高可靠性。路由结果返回有序候选和耦合能力说明。例如当前 MediaCrawler 的关键词搜索会同时采集评论，因此标记为 `coupled`，调用者不能把额外评论请求误认为独立、零成本的操作。

只读或本地写入 provider 失败时可以尝试下一个候选。平台写入永远标记 `outbox-only`；connector 的 generic execute 必须拒绝直接执行，以免超时后换 provider 造成重复发布、评论、点赞或关注。

## 当前映射

| Provider | 当前能力 |
| --- | --- |
| MediaCrawler | session 检查/扫码、视频关键词搜索、一级/二级评论、选定视频下载 |
| faster-whisper-local | 已下载视频的本地语音转写 |
| broadcast-kit | 私密视频发布，且只能通过既有 outbox 执行 |

F2、Douyin_TikTok_Download_API、直播录制器、官方 OpenAPI 和托管数据 API 后续按相同 capability contract 接入，不让其原始对象穿透到 SourceItem、research run、publication revision 或 receipt。

## 验证

- `runtime/test/platform-connector.test.mjs` 验证能力曝光、多策略选择、只读 fallback 和平台写拒绝。
- `spec/platform-connector.schema.json` 固定用户侧 snapshot 契约。
- CLI 的 `connector douyin capabilities/plan` 只读展示能力与路由，不执行平台动作。
