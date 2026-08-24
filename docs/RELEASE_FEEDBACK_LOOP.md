# 发布管理与反馈闭环

核验日期：2026-08-23。当前实现以 Social Workbench 的文件原生 canonical store 为事实源；外部平台、sidecar、委托发布服务和未来队列都只是可替换执行边缘。

## 已完成的闭环

```text
Source → EvidenceBrief → ContentPackage → frozen Revisions
  → PublicationPlan (planHash)
  → user plan approval
  → idempotent Outbox
  → per-revision one-time confirmation
  → Attempt / Receipt
  → evidence-only Reconciliation when unknown
  → append-only MetricSnapshot + authorized FeedbackItem
  → HypothesisReview
  → next EvidenceBrief with feedbackReviewIds lineage
```

计划批准与真实发布确认是两道不同的门：前者只允许把已冻结 revision 放入本地 outbox；后者仍由用户为每个平台、每个 revision 单独签发一次性 token。提交后结果不确定时只能对账，不自动重发。

## 开源项目调研与采用边界

| 项目 | 已验证能力 | 决策 |
| --- | --- | --- |
| [Postiz Public API](https://docs.postiz.com/public-api/introduction) | 连接账号、创建草稿/定时/即时帖子、列出帖子、平台 analytics | 国际平台的首选 `delegate` 候选。Social Workbench 保存 plan、idempotency key、receipt 与 metric snapshot；Postiz ID 只作为 external ref。 |
| [Mixpost](https://github.com/inovector/mixpost) | 自托管排期、队列/日历、平台 analytics、工作区协作 | 适合作为产品/UI 参考或用户已有实例的适配候选；不嵌入其 Laravel 应用，也不复制第二份内容日历真相。 |
| [pg-boss](https://github.com/timgit/pg-boss) | PostgreSQL 队列、事务入队、重试/退避、cron、DLQ 与并发控制 | 进入多进程或 PostgreSQL 部署后首选 worker spike。其 job delivery 保证不能替代外部平台 effect 的幂等与 reconcile。 |
| [Graphile Worker](https://worker.graphile.org/) | PostgreSQL 队列、重试、cron、未来任务和低延迟通知 | pg-boss 的备选；不同时引入两套队列。 |
| [xiaohongshu-mcp](https://github.com/xpzouying/xiaohongshu-mcp) | 小红书发布、搜索、详情互动指标和评论读取 | 保持固定 commit 的本机 sidecar。详情与评论能力可映射为 metric/feedback collector，但登录和采集仍是用户侧授权动作。 |
| [broadcast-kit](https://github.com/ChronoAIProject/broadcast-kit) | 浏览器驱动的抖音/小红书/X 发布工具包 | 当前只复用固定并补丁化的抖音执行路径；反馈采集未被当作已具备能力。 |

当前没有引入 Postiz、Mixpost 或 PostgreSQL queue 依赖。单机文件 store 已具备原子写、锁、崩溃恢复和确定性 outbox，继续增加基础设施暂时不会提高国内双平台闭环的真实性。外部服务适配只有在账号/平台覆盖或多 worker 吞吐需求出现时才进入 runtime。

## 用户侧 CLI

```sh
# 1. 从现有 content package 创建计划
npm run social -- plan --input plan.json

# 2. 明确批准计划并幂等入队（仍不会发布）
npm run social -- approve-plan --plan <plan_id>
npm run social -- enqueue-plan --plan <plan_id>

# 3. 对某个 revision 单独签发 token，再执行对应 outbox item
npm run social -- confirm --revision <sha256:...>
DSH_SOCIAL_CONFIRMATION_TOKEN='<shown-once-token>' \
  npm run social -- execute-item --outbox <outbox_id> --confirmation-id <confirmation_id>

# 4. unknown 只做平台侧对账，不重新提交
npm run social -- reconcile --input reconciliation.json

# 5. 追加反馈并复盘
npm run social -- collect xiaohongshu --outbox <outbox_id> --limit 50
npm run social -- metric --input metric.json
npm run social -- feedback --input feedback.json
npm run social -- review --input review.json
npm run social -- next-brief --review <review_id>

# 只读汇总
npm run social -- dashboard
```

所有 `--input` 文件都应放在用户控制的本地目录。凭据和一次性 token 不得写入输入 JSON、聊天、普通 Settings 或 Git。

## 反馈真实性规则

- `MetricSnapshot` 永远追加，不覆盖先前观察；保存平台原始名称、数值、定义、窗口、观察时间和来源证据。
- 相似指标不自动跨平台合并；mappingVersion 只标识派生映射版本。
- `FeedbackItem` 只保存公开内容、本人账号或明确授权范围内的反馈，并固定声明不做跨平台身份拼接。
- 小红书采集器从本人主页重新取得短期访问参数，只在内存中用于详情读取；receipt、metric、feedback、日志和工作台均不保存该参数或评论者身份。
- `HypothesisReview` 至少引用一个 metric snapshot 或 feedback item，且所有引用必须属于同一 plan。
- 下一轮 brief 保存 `feedbackReviewIds`，因此可以回到 source、原 brief、package、plan、receipt、反馈和复盘。
- 工作台展示相关性与观察，不自动声称内容导致了转化。

## 后续升级门

只有出现以下事实之一才引入持久 worker：需要多进程并发、跨天无人值守定时、可靠 wake-up、DLQ 运维或同一数据库事务内 canonical change + enqueue。即使采用 pg-boss/Graphile Worker，job 仍只引用 outbox ID，不能携带明文凭据，也不能绕过 revision confirmation。
