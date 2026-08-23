# 04：内容生产

## 研究问题

如何从需求信号和证据形成可协作的内容 brief、事实主张、主稿、媒体及平台变体，同时防止模型编造事实、覆盖原稿或把同一文本机械复制到所有平台？

本轨道止于经过验证的 `PublicationPlan` 候选，不拥有真实发布副作用。

## 内容对象

```text
ContentBrief
├── audience / objective / channel intent
├── demandSignalRefs
├── ClaimLedger[]
│   ├── claim text
│   ├── evidenceRefs
│   ├── status: supported | proposed | disputed | unknown
│   └── usage constraints
├── MasterArtifact revision
├── PlatformVariant revisions
└── Attachment/Derivative refs
```

事实主张和创意文案必须分开。没有证据的法律名称、价格、用户评价、性能数字和第三方背书不能由模板或 LLM 补全；未知字段保持 `unknown`。

## 候选组件结论

| 组件 | 可复用部分 | 结论 |
| --- | --- | --- |
| WorkSurface | immutable revision、Block、Projection、协作 DAG、文件原生编辑 | 直接复用为 Brief/Master/Variant 工作区；不存高体量 observation/outbox |
| DSH model catalog/runtime | 摘要、抽取、变体、embedding、媒体模型 route | 唯一模型入口；不另存模型 key 或维护第二份 catalog |
| [remark/unified](https://github.com/remarkjs/remark) | Markdown AST、GFM/frontmatter、lint、Markdown↔HTML plugin pipeline | 文本确定性转换首选；平台规则实现为小型 AST plugin，不用正则改 Markdown |
| [Sharp](https://sharp.pixelplumbing.com/) | resize/crop/format/metadata | 图片规格转换首选；只生成 derivative，不覆盖原附件 |
| [FFmpeg/ffprobe](https://ffmpeg.org/documentation.html) | 媒体探测、转码、裁剪、封装和 filter | 受控 subprocess；参数白名单并记录 binary/build/codec 许可 |
| JSON Schema 2020-12 + AJV | Brief、Claim、Variant、PlatformProfile 校验 | 领域契约唯一事实源；平台字段由 effective capability 驱动 |
| `tubban1/leadgen` | 配置驱动多租户 renderer 的思路 | 只作 reference；不复用其模板、事实生成、数据库和部署实现 |

remark 将 Markdown 解析成带位置的 AST，适合做字符统计、链接/mention 规则、标题抽取、HTML 转换和引用保留。Sharp/FFmpeg 处理确定性媒体规格，模型只处理语义选择，不应让模型承担可验证的尺寸、编码和格式转换。

## 平台变体不是“改语气”

`PlatformProfile` 至少包含：

- 文本长度、标题/摘要/正文结构；
- hashtag、mention、链接和 canonical URL；
- 图片数量、比例、尺寸、格式和 alt text；
- 视频时长、分辨率、编码、封面、字幕和音轨；
- 草稿/定时/立即发布能力；
- 账号类型、可见性、商业内容和 AI 内容标记；
- 当前 schema 来源、验证时间和 account-specific settings。

## 工作台自己实现

- ContentBrief、ClaimLedger、MasterArtifact、PlatformVariant 和 PublicationPlan schema。
- evidence ref 校验、unsupported claim gate 和引用许可检查。
- 平台 profile 到 remark/Sharp/FFmpeg/模型任务的 planner。
- 变体差异视图、人工编辑、批准前 immutable snapshot。
- attachment lineage：源附件、转换参数、输出 hash、工具版本。

## 验收

1. 每条 factual claim 都有 evidence 或被阻止进入可批准状态。
2. 修改主稿不会静默覆盖已批准变体；生成新 revision 并使旧批准失效。
3. 同一 brief 能生成至少两个结构明显不同、均通过平台 schema 的变体。
4. 所有媒体 derivative 可从原附件和参数重建。
5. 模型离线或失败时，确定性格式验证和人工编辑仍可工作。
