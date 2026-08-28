# UK Ofcom Adults’ Media Literacy Tracker Platform Pack

## 1. 稳定概念与官方事实

[Ofcom Adults’ media use and attitudes](https://www.ofcom.org.uk/media-use-and-attitudes/media-habits-adults/adults-media-use-and-attitudes)把media literacy描述为UK adults 16+的media use、attitudes与understanding，并于2026发布report。[2026 statistical release calendar](https://www.ofcom.org.uk/about-ofcom/our-research/statistical-release-calendar-2026)把底层资产标为Adults’ Media Literacy Tracker 2025：technical report、questionnaire、data tables、respondent-level CSV、codebook和SAV。因此“2026 report”与“2025 tracker fieldwork/data”必须保留relation，不能合并成一个年份。

## 2. 能力与采用边界

| Capability | 当前采用 | 边界 |
| --- | --- | --- |
| programme/report/questionnaire/technical metadata | `fixture` | report year、fieldwork year分开 |
| published aggregate tables | `fixture` | question/base/filter/weighted base/rounding固定 |
| interactive data | `manual-reference` | 不是稳定API contract |
| respondent CSV/SAV | `not-adopted` | natural-person survey data不进入Channel |
| postcode broadband/mobile API | `out-of-domain` | Connected Nations不是Media Literacy Tracker |

media use、confidence、understanding、attitude、concern与reported experience分别建模。face-to-face补样、online panel、weighting与base决定可比性；单个group差异不得用于个人判断或定向Probe。

## 3. 开源、Skill与验证

未发现Ofcom为此调查维护的Agent Skill、MCP或client。[stevegoossens/ofcom@`efcded3`](https://github.com/stevegoossens/ofcom/tree/efcded323a6a2f6ce1067fd75f8f2d093c7300c1)是MIT的postcode broadband/mobile coverage client，明确拒绝作为本Pack transport fallback。

Synthetic覆盖report-year/fieldwork-year、online/face-to-face mode、weighted/unweighted base、user/non-user routing、multiple response、confidence-vs-tested ability、attitude-vs-incident、question change与respondent-file rejection。当前只做manual/fixture，不下载任何表或respondent file。

## 4. Snapshot与可观测性

Snapshot保存programme、tracker/report relation、questionnaire/technical/table revision、question/base/mode/weight、rights和no-client decision。Telemetry逐`tracker vintage × report release × population/routing × question × mode/base/weight × breakdown`记录retained/dropped、unknown base、mode drift、question break、respondent-file quarantine与zero effects。
