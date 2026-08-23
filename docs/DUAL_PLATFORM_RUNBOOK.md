# 小红书 / 抖音 walking skeleton 运行手册

更新时间：2026-08-23

## 1. 当前状态

已完成且可重复：

- 固定 commit 克隆、许可证清单和补丁哈希校验；
- 小红书 Go sidecar 与登录工具构建；
- 抖音隔离 Python 环境、Playwright Chromium 和本地 ffmpeg 安装；
- 两个 sidecar 的无账号 doctor；
- revision、媒体与执行 manifest 文件哈希、一次性批准、attempt、receipt 与 `unknown` 状态；
- 小红书本人主页/详情 verifier；
- 抖音 submit + cover + private visibility + creator queue 四项 verifier；
- patch 在全新 checkout 上复现，31 tests + 4 subtests 通过；工作台 runtime 19/19 tests、DSH 插件与 schema 层 9/9 tests 通过。
- 小红书本人账号登录态、推荐流读取和本人主页发布基线已在真实页面只读验证；当前固定版本必须使用可见浏览器模式。
- 本地合成素材重复 `prepare` 得到相同 revision hash；一次性确认可签发，缺少 token 的执行会在调用平台前拒绝。

尚未执行：

- 抖音用户账号扫码/短信登录；
- 用户确认使用本地合成媒体后的页面 dry-run；
- 两个平台真实“仅自己可见”发布；
- 每个平台两次重复发布及 receipt 留存。

任何 `health=true`、CLI exit 0 或点击过发布按钮，都不能替代最后四项。

## 2. 安全默认

第一轮真实验证只允许：

- 用户本人控制的个人创作者账号；
- 用户拥有权利的测试媒体；
- `testMode=true` 与 `visibility=private`；
- 每个平台、每个 revision 单独签发一次性确认；
- Cookie、短信、二维码和 sidecar token 只留在本机状态目录；
- `submitted` 后验证不确定时落 `unknown`，禁止自动重试。

默认状态根为 `~/.dsh/social-workbench/`。可用 `--workbench-root` 覆盖；不要把它放进 Git 仓库。

## 3. 安装与验证

使用 Node 24：

```sh
source ~/.nvm/nvm.sh
nvm use 24.17.0
cd /Users/kaiqidong/Desktop/dsh-plugins/dsh-social-workbench
npm run check
npm run bootstrap:sidecars
```

安装器不会登录或发布。它输出实际 `stateRoot`、二进制和 Python 路径。重复运行应得到相同 commit，并拒绝任何不符合审计补丁哈希的本地变更。

无账号 doctor：

```sh
npm run social -- doctor douyin
npm run social -- doctor xiaohongshu
```

小红书 doctor 需要 sidecar 已启动；见下一节。抖音无账号 doctor 应显示运行能力 ready、auth false；加 `--live-login-check` 后整体 ready 必须是 false。

## 4. 登录：只由用户完成

### 4.1 小红书

准备状态目录并运行可见登录工具：

```sh
mkdir -p ~/.dsh/social-workbench/sidecars/state/xiaohongshu/default
cd ~/.dsh/social-workbench/sidecars/state/xiaohongshu/default
../../../bin/xiaohongshu-login
```

用户在打开的浏览器中扫码。登录工具把 Cookie 写入当前目录的 `cookies.json`。不要复制该文件到聊天、Git 或普通 Settings。

随后用一个本机 sidecar token 启动服务：

```sh
export DSH_SOCIAL_XHS_TOKEN='<local-sidecar-token>'
cd ~/.dsh/social-workbench/sidecars/state/xiaohongshu/default
../../../bin/xiaohongshu-mcp -headless=false -port=:18060 -token="$DSH_SOCIAL_XHS_TOKEN"
```

当前固定的 `xiaohongshu-mcp` commit 在本机无头模式下可以读取推荐流和判断登录态，但“本人主页”会等待旧版 `window.__INITIAL_STATE__` 直至 60 秒超时；相同 Cookie 与指纹在可见模式下可正常返回。因此，首版闭环把可见浏览器列为小红书 verifier 的运行前提。不要为了无人值守而跳过本人主页基线或发布后反查。

另开终端验证：

```sh
npm run social -- doctor xiaohongshu --live-login-check
```

### 4.2 抖音

登录会打开可见 Chromium；用户完成扫码/短信并在回到发布页后按 Enter：

```sh
export BROADCAST_KIT_STATE_DIR="$HOME/.dsh/social-workbench/sidecars/state"
export PATH="$HOME/.dsh/social-workbench/sidecars/bin:$PATH"
"$HOME/.dsh/social-workbench/sidecars/broadcast-kit-venv/bin/python" \
  -m broadcast_kit.publishers.douyin.cli login --fresh --account default
```

验证：

```sh
npm run social -- doctor douyin --live-login-check
```

`ready=true` 必须同时表示 ffmpeg/Chromium 能力通过且 live login 有效；进程 exit 0 本身不算 ready。

## 5. 从来源生成 brief、内容包和不可变 revisions

正常路径不是直接手写平台 revision，而是依次执行：

```sh
npm run social -- ingest --input /absolute/path/source-input.json
npm run social -- brief --input /absolute/path/brief-input.json
npm run social -- package --input /absolute/path/package-input.json
```

第一步保存来源、授权说明和附件指纹；第二步要求每条 claim 引用当前 brief 的 source；第三步生成精确的小红书/抖音变体、唯一 marker、抖音 manifest 和两个冻结 revision。相同输入重复执行返回同一个稳定对象。

DSH Agent 中的 `social_workbench` 工具提供同一条 staging 链路，但不提供 `confirm`、`execute` 或登录动作。下列 `prepare` 仅作为调试单个平台 revision 的低层入口。

### 5.1 低层 revision 调试入口

示例输入（媒体路径可相对该 JSON 文件）：

```json
{
  "platform": "xiaohongshu",
  "accountRef": "credential:xhs-default",
  "visibility": "private",
  "testMode": true,
  "content": {
    "title": "闭环私密测试 001",
    "body": "用户自有测试内容 SWB-20260823-001",
    "verifyMarker": "SWB-20260823-001",
    "topics": ["测试"],
    "media": [
      {"kind": "image", "path": "./owned-test-image.png"}
    ]
  }
}
```

抖音 revision 的 `content.media` 使用视频，同时在 `execution.manifestPath` 指向 `broadcast-kit` 的 Douyin manifest；立即发布可不填 schedule，定时发布使用带时区的 `execution.schedulePublishAt`。

准备：

```sh
npm run social -- prepare --input /absolute/path/revision-input.json
```

输出会把媒体 canonical path、字节数和 SHA-256 纳入 `revisionHash`。确认后若媒体内容变化，执行会在消耗批准前拒绝。

## 6. 抖音 dry-run

dry-run 会打开真实创作者页面、上传媒体、填写文案、设置封面和私密可见性，但不点击最终发布：

```sh
npm run social -- dry-run douyin --revision 'sha256:...'
```

它仍需要有效登录，也可能上传临时素材，因此不是纯 no-op。必须看到 `COVER_VERIFY=True`、`VISIBILITY_VERIFY=True` 和 `JUDGEMENT=not_submitted`。任何选择器不确定都应失败关闭。

## 7. 一次性确认与执行

先由用户逐项核对：平台、账号、可见性、标题、正文、媒体哈希与预览。然后签发短时 token：

```sh
npm run social -- confirm --revision 'sha256:...'
```

token 只显示一次。不要把它作为 CLI 参数（会进入 shell history）；放入当前终端环境：

```sh
export DSH_SOCIAL_CONFIRMATION_TOKEN='<one-time-token>'
npm run social -- execute xiaohongshu \
  --revision 'sha256:...' \
  --confirmation-id 'confirmation_...'
unset DSH_SOCIAL_CONFIRMATION_TOKEN
```

抖音把平台名换成 `douyin`。一次性 token 在开始 attempt 时消耗；若提交前失败，receipt 为 `failed`；若提交已发生但反查失败，receipt 为 `unknown`。

## 8. 两个平台的 confirmed 条件

小红书：

1. 发布前保存本人主页 feed ID 基线；
2. 发布调用显式传 `仅自己可见`；
3. 本人主页出现基线后新增、标题精确匹配的 feed；
4. feed detail 的 marker、媒体数量和类型匹配；
5. receipt 保存真实 feed ID/URL。

抖音：

1. `JUDGEMENT=success`；
2. `COVER_VERIFY=True`；
3. `VISIBILITY_VERIFY=True`；
4. `QUEUE_VERIFY=True`；
5. receipt 保存 creator queue 文本/截图证据。没有平台对象 ID 时，绝不伪造 ID，以 `creator_queue_match` 作为确认依据。

## 9. 恢复与禁止动作

- `unknown`：先查创作者中心，不自动重发；确认不存在后重新 prepare/confirm。
- 登录失效：重新登录，不删除 receipt/revision。
- sidecar 页面选择器失效：保留截图、暂停该 adapter、降级为官方分享/人工交接。
- 不把 Cookie 或 auth.json 拷到项目目录。
- 不运行无人值守公开发布，不自动评论/私信/点赞。
- 不采集或归并相亲/社交账号的敏感个人档案。

## 10. 本次实测证据

在 macOS arm64、Node 24.17.0、Python 3.12.13 上：

- `npm run check`：runtime 19/19、DSH plugin/schema 9/9 tests passed；
- `broadcast-kit` 原始固定 commit：28 tests + 4 subtests passed；
- 应用 Social Workbench patch：31 tests + 4 subtests passed；
- patch 在新的 checkout 上 `git apply --check` 和完整测试通过；
- bootstrap 在空目录完成，并第二次幂等运行成功；
- 小红书真实登录检查通过，推荐流只读返回 34 条，本人主页基线在可见模式下成功返回（测试账号当前基线为 0 条）；
- 小红书本人主页在无头模式下 60 秒超时，已确认是运行模式兼容性限制，不是 Cookie、sidecar 健康或整个平台读取失败；
- 本地小红书测试 revision 重复冻结 hash 一致，一次性确认成功签发；移除 `DSH_SOCIAL_CONFIRMATION_TOKEN` 后执行在平台调用前按预期拒绝；
- 抖音 capability ready，ffmpeg blocker 清零，live login false。

无账号链路还完成了一份本地合成来源 → brief → 内容包 → 两个冻结 revision 的重复运行与 JSON Schema 校验。当前剩余真实闭环门是抖音登录、两平台逐次批准和真实私密发布；首轮媒体已经准备为本地合成测试素材，仍需用户确认可将它们用于本人账号的私密发布。
