# 抖音需求研究运行手册

## 当前可用范围

`0.3.0` 增加了一条用户侧、只读、可审计的抖音研究链路：

1. 用户扫码登录，登录态保存在 Social Workbench 专用 Playwright profile；
2. 按 1–5 个关键词小批量搜索公开视频，并抓取每条视频的一二级评论；
3. 把平台文案、评论正文和公开计数归一化为 `source-items`，删除作者标识、昵称、临时下载 URL 和 Cookie；
4. 用户可显式下载选中的视频，再用本机 `faster-whisper` 生成可按 ID 读取的 transcript。

这不是抖音官方 API。搜索和评论来自登录浏览器上下文中的非官方接口，可能受页面变化、风控、样本排序和账号状态影响。任何研究结论都必须把它标成“小批量观察”，不能声称全量、代表性或官方数据。

## 开源组件选择

- 公开搜索与评论：固定 [NanmiCoder/MediaCrawler](https://github.com/NanmiCoder/MediaCrawler) commit `d6f7c5bb906b6dac40ddf343ef9e26438a3de092`。
- 本地语音转写：可选 `faster-whisper==1.2.1`；一次只处理一个已登记的本地视频文件。
- `Kuhakucai/douyin-mcp` 适合本人创作者中心指标与自有作品转写，不覆盖当前需要的公开关键词搜索，因此没有作为这条 ingress 的执行器。

MediaCrawler 使用 `NON-COMMERCIAL LEARNING LICENSE 1.1`。它不是本插件的默认依赖，安装和每次登录/搜索都要求显式接受许可证；商业用途不得使用这条 sidecar。

## Docker 安装（当前默认）

研究 sidecar 在容器内运行 Chromium、MediaCrawler 和 faster-whisper；浏览器 profile、研究媒体和模型缓存使用宿主机持久目录。noVNC 只绑定 `127.0.0.1:7900`。

```sh
npm run bootstrap:douyin-research:docker -- --accept-mediacrawler-license
```

安装完成后打开：

```text
http://127.0.0.1:7900/vnc.html?autoconnect=1&resize=scale
```

CLI 默认通过 `docker exec` 使用名为 `dsh-social-douyin-research` 的容器。

## 本机 Python 安装（备用）

仅安装抖音研究 sidecar：

```sh
npm run bootstrap:douyin-research -- --accept-mediacrawler-license
```

同时安装本地 ASR：

```sh
npm run bootstrap:douyin-research -- --accept-mediacrawler-license --with-local-asr
```

安装器只拉取固定 commit、建立隔离 Python 环境并安装 Chromium；不会登录、搜索或下载平台内容。
本机模式的 CLI 命令需额外带 `--runtime local`；未指定时默认使用 Docker。

## 登录与登录态

```sh
npm run social -- research douyin doctor
npm run social -- research douyin login --accept-mediacrawler-license --account default
```

登录命令使用 MediaCrawler 的空 creator 流程：浏览器先验证现有会话，失效时显示二维码，成功后不继续采集作品。登录目录为：

```text
$DSH_HOME/social-workbench/sidecars/state/douyin-research/
  browser-profiles/<account>/dy_user_data_dir/
```

安全边界：

- wrapper 强制 `ENABLE_CDP_MODE=false` 和 `CDP_CONNECT_EXISTING=false`；不会连接日常 Chrome。
- 只允许二维码登录；插件 CLI 不接受 Cookie 字符串。
- Host 健康检查只判断目录是否存在，不读取 Cookie，也不谎称登录仍有效。
- 下次搜索复用同一目录；如果会话过期，浏览器重新显示二维码。

## 搜索视频文案与评论

拼豆场景的首轮小样本：

```sh
npm run social -- research douyin search \
  --keywords '拼豆,拼豆收纳,拼豆教程' \
  --max-videos 10 \
  --max-comments 20 \
  --accept-mediacrawler-license
```

限制：每次最多 5 个关键词、50 条视频、每条 50 条一级评论，固定单并发；二级评论默认关闭。需要时显式增加 `--include-sub-comments`。上游搜索每页固定 10 条，所以 `--max-videos` 下限是 10。

命令完成后会写入：

- `research-runs/<id>`：查询词、上限、采集器 commit、样本 ID；
- `source-items/<id>`：视频平台文案或评论正文、公开计数、观察时间和非官方 provenance；
- 原始 JSONL 默认在归一化后删除。

模型只能按稳定 ID 读取这些去身份化对象，不能启动搜索、登录或下载。

## 提取视频语音文本

默认搜索不下载视频。从搜索返回的 `sourceItemIds` 中选一条 video，再单独下载：

```sh
npm run social -- research douyin fetch-media \
  --source-item sourceitem_<sha256> \
  --accept-mediacrawler-license
```

然后本地转写同一个 source item：

```sh
npm run social -- research douyin transcribe \
  --source-item sourceitem_<sha256> \
  --model small \
  --language zh
```

输出写入 `video-transcripts/<id>`，包含合并文本、时间段、模型、语言和媒体 SHA-256。首次运行某个 Whisper 模型可能下载模型文件；转写仅在本机执行。媒体路径保存在模型不可读的 `research-media` collection，且 adapter 会验证路径没有逃出 research artifacts root。

## 明确未完成

- 尚未自动聚类或生成 `DemandSignal`；当前完成的是可供后续分析的证据 ingress。
- 尚未证明抖音搜索结果的完整性、排名稳定性或跨账号一致性。
- 没有验证码绕过、代理池、批量账号、风控规避或后台定时抓取。
- 没有把公开评论当作已授权营销名单，也不保存或拼接评论者身份。
