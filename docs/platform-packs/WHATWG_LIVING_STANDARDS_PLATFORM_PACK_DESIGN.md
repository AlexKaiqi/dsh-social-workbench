# WHATWG Living Standards Platform Pack 设计

状态：`researched / provider-route-fixture-eligible / no-local-binding`  
核验日期：2026-08-26  
Pack ref：`whatwg-living-standards/v0-design`

## 1. 产品与population

本Pack覆盖WHATWG公开workstream、Living Standard、Review Draft、official repository source commit及获准issue/implementation/test references。当前未发现独立版本化public metadata API；route fixture只通过GitHub Connector读取固定WHATWG官方repository/path/commit，不以HTML抓取补位。

[Workstream Policy](https://whatwg.org/workstream-policy)定义Living Standard持续由editor修改，Review Draft主要用于patent review；[Working Mode](https://whatwg.org/working-mode)要求规范与实现收敛、测试覆盖和足够implementer interest。它们不意味着每个issue、PR或source commit都已获editor接受或被浏览器部署。

## 2. 概念映射与推断边界

| Native concept | `PublicTechnicalStandard*` | 约束 |
| --- | --- | --- |
| workstream/editor/standard | group/authority/spec identity | editor authority与commenter/implementer分开 |
| Living Standard source commit | living snapshot/repository source | 每次观察固定commit；canonical latest会继续变化 |
| Review Draft | immutable review edition | 主要是patent-review reference，不是“更最新版” |
| stage/implementer interest | native state/implementation evidence | interest不是shipping、usage或market demand |
| issue/PR | issue/comment record | issue opening不是feature acceptance；PR merge需追到source revision |
| WPT/implementation bug | test/implementation relation | test存在或bug filed不证明conformance |

[WHATWG Stages](https://whatwg.org/stages)中的贡献从Stage 0开始，阶段必须按具体workstream/process revision保存；不能与TC39 stage number比较。

## 3. 接入、权利与开源证据

固定官方候选：[whatwg/html@208004f](https://github.com/whatwg/html/tree/208004fb0c299e2d2a24e973ec7bd35bc888add9)，规范文本CC-BY-4.0，纳入source code的部分BSD-3-Clause。该license允许的用途、attribution与modified-material标记仍需进入binding；GitHub metadata/issue作者内容另按provider与贡献规则治理。

未来读取必须同时固定WHATWG source authority和GitHub provider route、repository/path/commit、field/content role与rights purpose。GitHub route失败不得fallback到spec HTML、raw mirrors或community parser。

## 4. Fixture、观测与晋级

synthetic fixture覆盖Living latest变化、Review Draft、editor/commenter/implementer authority、Stage 0 issue、insufficient implementer interest、merged normative change、editorial-only change、feature removal、WPT relation、repository fork/common-origin与zero issue/PR。

Telemetry按`workstream × standard × repository/path/commit × review edition × role`记录commit pin、latest drift、issue→decision→source lineage、normativity、implementer/test evidence、provider/source authority、coverage、rights/license和write attempts。真实repository GET仍需用户授权；成功读取一个commit不证明完整history或浏览器采用。
