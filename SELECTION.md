# Selection

## Rule

Frozen 2026-09-23, before any candidate was viewed. Changes after this point are new commits
stating their reason; this section is never edited in place.

### Sources, in order

1. `anthropics/skills` — every skill directory, in the order returned by
   `gh api repos/anthropics/skills/contents/skills --jq '.[].name'`, frozen to
   `selection/anthropics-skills.json`.
2. GitHub repository search, frozen to `selection/github-search.json`:

   ```
   gh search repos 'SKILL.md eval OR benchmark OR "with and without" pushed:<2026-09-23' \
     --sort stars --order desc --limit 100 \
     --json fullName,url,stargazersCount,pushedAt,license
   ```

Candidates are screened in that order: all of source 1, then source 2.

### Eligibility — all required

| | Criterion |
|---|---|
| E1 | An Agent Skill (`SKILL.md` with frontmatter) runnable under the `claude` CLI with no external service, API key or paid tool |
| E2 | Publishes a with-versus-without number. A pass rate with no baseline does not count. |
| E3 | Publishes a portable method: task prompts plus a per-task pass criterion expressible as a nullbench verifier (`any` / `none` / `ordered`, or a rubric for `judge`). A criterion that needs executing generated code is not portable. |
| E4 | License permits redistribution (OSI-approved or CC-BY / CC0) |
| E5 | Not written by Bharat Goel; no two selected skills share an author or organisation |

A repository with several skills counts as one candidate per skill that has its own
published claim; screening stops at the first failed criterion, which is the one logged.

### Stopping

Stop at three eligible skills or 100 candidates screened, whichever comes first. Fewer
than three eligible: the audit proceeds with fewer and reports the shortfall as a
finding.

## Log

| # | Candidate | Source | E1 | E2 | E3 | E4 | E5 | Result | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| 1 | anthropics/skills — academy-guide | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/academy-guide/SKILL.md |
| 2 | anthropics/skills — algorithmic-art | 1 | ✓ | ✗ | – | – | – | excluded: E2, only a stylistic ratio ("90% generation, 10% params"), no effect claim | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/algorithmic-art/SKILL.md |
| 3 | anthropics/skills — brand-guidelines | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/brand-guidelines/SKILL.md |
| 4 | anthropics/skills — canvas-design | 1 | ✓ | ✗ | – | – | – | excluded: E2, only a stylistic ratio ("90% visual, 10% text"), no effect claim | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/canvas-design/SKILL.md |
| 5 | anthropics/skills — claude-api | 1 | ✓ | ✗ | – | – | – | excluded: E2, describes a cost-optimization workflow, no published pass-rate or effect number | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/claude-api/SKILL.md |
| 6 | anthropics/skills — discernment-nudge | 1 | ✓ | ✗ | – | – | – | excluded: E2, "benchmarks" refers to user's own CPL vertical benchmarks, not a skill effect number | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/discernment-nudge/SKILL.md |
| 7 | anthropics/skills — doc-coauthoring | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/doc-coauthoring/SKILL.md |
| 8 | anthropics/skills — docx | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/docx/SKILL.md |
| 9 | anthropics/skills — frontend-design | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/frontend-design/SKILL.md |
| 10 | anthropics/skills — internal-comms | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/internal-comms/SKILL.md |
| 11 | anthropics/skills — mcp-builder | 1 | ✓ | ✗ | – | – | – | excluded: E2, "Evaluations" section is a how-to for building MCP-server evals, not a published effect number for the skill itself | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/mcp-builder/SKILL.md |
| 12 | anthropics/skills — pdf | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/pdf/SKILL.md |
| 13 | anthropics/skills — pptx | 1 | ✓ | ✗ | – | – | – | excluded: E2, "baseline" refers to `validate.py --original` schema diffing, not an effect number | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/pptx/SKILL.md |
| 14 | anthropics/skills — skill-creator | 1 | ✓ | ✗ | – | – | – | excluded: E2, describes how to build evals/benchmarks for other skills; no with-vs-without number for skill-creator itself | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/skill-creator/SKILL.md |
| 15 | anthropics/skills — slack-gif-creator | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/slack-gif-creator/SKILL.md |
| 16 | anthropics/skills — theme-factory | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/theme-factory/SKILL.md |
| 17 | anthropics/skills — web-artifacts-builder | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/web-artifacts-builder/SKILL.md |
| 18 | anthropics/skills — webapp-testing | 1 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/webapp-testing/SKILL.md |
| 19 | anthropics/skills — xlsx | 1 | ✓ | ✗ | – | – | – | excluded: E2, "evaluate" refers to spreadsheet formula recalculation, not a skill effect number | https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/xlsx/SKILL.md |
| 20 | microsoft/SkillOpt | 2 | ✓ | ✗ | – | – | – | excluded: E2, repo is a skill-training framework with a research paper; README publishes no with-vs-without number for a specific runnable skill | https://github.com/microsoft/SkillOpt/blob/79124b37e9a6371e13b753f8bcd7adb1e493ade1/README.md |
| 21 | wasp-lang/open-saas | 2 | ✓ | ✗ | – | – | – | excluded: E2, SaaS boilerplate bundling onboarding skills; no with-vs-without number published | https://github.com/wasp-lang/open-saas/blob/cbd30162b05d798b3a3f955ab5781940b67bec89/README.md |
| 22 | qiye45/wechatDownload — wechat-article-downloader | 2 | ✓ | ✗ | – | – | – | excluded: E2, download tool; no with-vs-without number published | https://github.com/qiye45/wechatDownload/blob/4e3ee7cbbdc88816ee8d682253d38df81ae607ae/skills/wechat-article-downloader/SKILL.md |
| 23 | SnailSploit/Claude-Red | 2 | ✓ | ✗ | – | – | – | excluded: E2, numbers in README are skill/category counts, not an effect claim | https://github.com/SnailSploit/claude-red/blob/739512a8588b28ff3b554e669391c22508602878/README.md |
| 24 | bergside/awesome-design-skills | 2 | ✓ | ✗ | – | – | – | excluded: E2, `%` occurrences are HTML table-width attributes; curated list of design skills with no effect claim | https://github.com/bergside/awesome-design-skills/blob/f631a09b4fcc0166f2e2c1a8c81906ef680c57e8/README.md |
| 25 | bergside/design-md-chrome | 2 | ✗ | – | – | – | – | excluded: E1, Chrome extension that generates SKILL.md/DESIGN.md files; not itself an Agent Skill (no SKILL.md in repo) | https://github.com/bergside/design-md-chrome/blob/8e07614fb18752ab1ee14dd65a8ff93e63c9b13b/README.md |
| 26 | ciembor/agent-rules-books — a-philosophy-of-software-design | 2 | ✓ | ✓ | ✗ | – | – | excluded: E3, single n=1 whole-codebase refactor experiment (80-task Codex run) judged holistically by ChatGPT ("74/100 vs 46/100"); not task prompts with per-task pass criteria, and grading requires executing/inspecting a generated codebase | https://github.com/ciembor/agent-rules-books/blob/893a88a6fce3a80c565bf39ac65021b43a8b2990/README.md#L197 |
| 27 | elementalsouls/Claude-OSINT | 2 | ✓ | ✗ | – | – | – | excluded: E2, "56/56 PASS... 100%" is a pass rate with no baseline comparison | https://github.com/elementalsouls/Claude-OSINT/blob/13d920413448c026b52ac74efee0f1eb39dd81ff/README.md#L49 |
| 28 | wilwaldon/Claude-Code-Frontend-Design-Toolkit | 2 | ✗ | – | – | – | – | excluded: E1, curated links/commentary document; no SKILL.md in repo | https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit/blob/2a6d0958e6966e0003896f94ce5003466e89e91d/README.md |
| 29 | gamedev-skills/awesome-gamedev-agent-skills | 2 | ✓ | ✗ | – | – | – | excluded: E2, "baseline" refers to engine-version authoring baselines, not an effect number | https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/b105e1cf617adf0b68ed98790a716bbb60993179/docs/VERSION-SUPPORT.md |
| 30 | rohitg00/awesome-claude-design | 2 | ✗ | – | – | – | – | excluded: E1, curated gallery/list of designs and links; no SKILL.md in repo | https://github.com/rohitg00/awesome-claude-design/blob/7f60ee56b9340f8c2671a08c2d8aab4037546a64/README.md |
| 31 | michaelshimeles/skills — greploop | 2 | ✓ | ✗ | – | – | – | excluded: E2, "5/5 confidence" is a per-run completion threshold, not a with-vs-without effect number | https://github.com/michaelshimeles/skills/blob/4b72f46b045e6fef52e6a98d4c162dd309826aed/README.md#L45 |
| 32 | feicaiclub/video-spec-builder | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/feicaiclub/video-spec-builder/blob/9e73275b35e827b8f7af4bca900790909d86e63e/README.md |
| 33 | Kulaxyz/self-learning-skills | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/Kulaxyz/self-learning-skills/blob/1304fce375b5d4c4508cab9eea05bbb8b95c38f6/README.md |
| 34 | alchaincyf/huashu-md-html | 2 | ✓ | ✗ | – | – | – | excluded: E2, `%` occurrences are image widths in demo galleries, no effect claim | https://github.com/alchaincyf/huashu-md-html/blob/17192f55d470e2b00ed5dd14cee110599b9eeeaf/README.md |
| 35 | vibeforge1111/vibeship-spawner-skills | 2 | ✗ | – | – | – | – | excluded: E1, no SKILL.md in repo | https://github.com/vibeforge1111/vibeship-spawner-skills/blob/70b2e1062fc6a38fce854226c27097a87732cb5f/README.md |
| 36 | feichanggege/ecommerce-visual-copywriting-skill | 2 | ✓ | ✗ | – | – | – | excluded: E2, README explicitly rejects a numeric score ("anchor-less 80/100 pseudo-precision") in favor of pass/fail gates; no with-vs-without number | https://github.com/feichanggege/ecommerce-visual-copywriting-skill/blob/4a5a6396cd54709a203a82065801f64d5cb7286e/README.md#L102 |
| 37 | iannuttall/dotagents | 2 | ✗ | – | – | – | – | excluded: E1, no SKILL.md in repo | https://github.com/iannuttall/dotagents/blob/7193a940e9b1ab01ab256f3465a0c96830e12b25/README.md |
| 38 | realrossmanngroup/no_ai_slop_writing_rules — no-ai-slop | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/realrossmanngroup/no_ai_slop_writing_rules/blob/35e32ae45878148a6bd898572a9d15c96711affe/skills/no-ai-slop/SKILL.md |
| 39 | EverMind-AI/SkillCorpus | 2 | ✓ | ✗ | – | – | – | excluded: E2, `%`/`/` occurrences are badge widths and follower counts, no effect claim | https://github.com/EverMind-AI/SkillCorpus/blob/7b3a0eaec5594b7f6cb301189c3d626f15409ed0/README.md |
| 40 | Railly/tinte — tinte-design | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/Railly/tinte/blob/7905be3e62819faa4db312d2cbcd0e2991326d0a/README.md |
| 41 | sno-ai/mda | 2 | ✓ | ✗ | – | – | – | excluded: E2, a markdown-authoring spec with compiler; numeric hits are spec section numbers, no effect claim | https://github.com/sno-ai/mda/blob/03a0f4126bf1ca0f9428618865c9b9dd65fada40/README.md |
| 42 | TheDecipherist/claude-code-mastery — security-audit | 2 | ✓ | ✗ | – | – | – | excluded: E2, the "39% degradation" and "40% failure rate" figures are cited from external third-party research (arXiv, a blog post), not a published number for this repo's own skills | https://github.com/TheDecipherist/claude-code-mastery/blob/0f05fa1a384c6886b9c4cfda8a9a75be9b0448ee/README.md#L220 |
| 43 | mxyhi/ok-skills — ax | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/mxyhi/ok-skills/blob/7933c15c525686ddda63a899065bebf492fa60eb/README.md |
| 44 | hkcanan/katmer-code | 2 | ✗ | – | – | – | – | excluded: E1, no SKILL.md in repo | https://github.com/hkcanan/katmer-code/blob/8752e4356d400ee7f200fc6de79333c336e56e46/README.md |
| 45 | Gostyan/docx-skill-4-cn-paper — docx-editor-cn | 2 | ✓ | ✗ | – | – | – | excluded: E2, `%` hits are HTML table-width attributes, no effect claim | https://github.com/Gostyan/docx-skill-4-cn-paper/blob/e3b2f7edd2aa7c6d96c16e594035ebc906c2faf4/README.md |
| 46 | agent-sh/agnix | 2 | ✓ | ✗ | – | – | – | excluded: E2, "invoke at 0%" and "66% of developers" figures are cited from third-party sources (Vercel blog, Stack Overflow survey), not a published number for agnix itself | https://github.com/agent-sh/agnix/blob/d1af4d9a6b20d987e23605bfed367045d4427d98/README.md#L34 |
| 47 | inkboard/system-atlas | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/inkboard/system-atlas/blob/f7005f275861f5aa2faa8e7416b3d73d52d07338/README.md |
| 48 | tizzy916/humanities-writing-companion | 2 | ✓ | ✗ | – | – | – | excluded: E2, numeric hits are academic citation years/volume numbers, no effect claim | https://github.com/tizzy916/humanities-writing-companion/blob/e097ff629f6575af1b2ec129afa7b23f30d2a39c/README.md |
| 49 | arpitg1304/robotics-agent-skills | 2 | ✓ | ✓ | ✗ | – | – | excluded: E3 — publishes a with-vs-without comparison table (`evals/EVAL_REPORT.md`), so E2 passes; but the comparison is qualitative design-decision attributes on a single self-assessed run ("not as a benchmark"), not task prompts with a per-task pass criterion — not portable to a nullbench verifier | https://github.com/arpitg1304/robotics-agent-skills/blob/f9bc5467ff9ee3d23f1a1b0b29a649843bb6ad11/README.md#L23 |
| 50 | haiou-666/haiou-codex | 2 | ✗ | – | – | – | – | excluded: E1, skill distributed only inside an opaque `.tar.lzma` archive; no SKILL.md visible in the repo tree | https://github.com/haiou-666/haiou-codex/blob/32959cd37cd168027aab59f977e8368c28251d00/README.md |
| 51 | kunchenguid/vision — vision | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/kunchenguid/vision/blob/7a20c38181151ec67efdf8fa2cb03a60123a7b83/README.md |
| 52 | Narwhal-Lab/MagicSkills — c_2_ast | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/Narwhal-Lab/MagicSkills/blob/00f3e8640445b0d91682a670b8ba7cc4465151cb/README.md |
| 53 | LukeRenton/explore-claude-code — build-skill | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/LukeRenton/explore-claude-code/blob/53feb180a27e42fca5406dd5d91c60ea5b4b76ac/README.md |
| 54 | win4r/openclaw-workspace | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/win4r/openclaw-workspace/blob/4e81a914b5f4ed52d88e0b31476354f92fcd4be7/README.md |
| 55 | WenyuChiou/ai-research-skills | 2 | ✗ | – | – | – | – | excluded: E1, a skill-catalog/schema/lifecycle-tooling repo; no SKILL.md file anywhere in the tree despite README discussion of SKILL.md compliance | https://github.com/WenyuChiou/ai-research-skills/blob/fb07daa1e699db1862340f0199d4908c0edf353f/README.md#L134 |
| 56 | K-Dense-AI/mimeo | 2 | ✓ | ✗ | – | – | – | excluded: E2, "99% coverage" is test-suite coverage, not a with-vs-without effect number | https://github.com/K-Dense-AI/mimeo/blob/a4cea1842a24515cda354a3aa9eb9763677a3cdd/README.md#L207 |
| 57 | futantan/agent-skills.md | 2 | ✗ | – | – | – | – | excluded: E1, a Next.js web app / skills directory site; no SKILL.md in repo | https://github.com/futantan/agent-skills.md/blob/98cd624fb1542ad7880e1112576061bb2874de8e/README.md |
| 58 | jzOcb/writing-style-skill | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/jzOcb/writing-style-skill/blob/d94826e1cd48f5403b82a5a909efdfab96221259/README.md |
| 59 | bowenliang123/markdown-exporter | 2 | ✓ | ✗ | – | – | – | excluded: E2, "95%" is a packaged-plugin file-size reduction, not an effect claim | https://github.com/bowenliang123/markdown-exporter/blob/398597a3d45d603e3dca36b843d4e894790e19f5/README.md#L634 |
| 60 | Sfedfcv/redesigned-pancake | 2 | ✗ | – | – | – | – | excluded: E1, empty git repository (409 on HEAD commit) | https://github.com/Sfedfcv/redesigned-pancake |
| 61 | tigerless-labs/design-harness | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/tigerless-labs/design-harness/blob/9aca84e8c4721d4e7623df5f4d67153477ec40a5/README.md |
| 62 | initializ/forge — code-agent | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/initializ/forge/blob/4b85a47cf54e9b85e3e80a58bd84327ea3ca18bb/README.md |
| 63 | johnpapa/ai-ready — ai-ready | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/johnpapa/ai-ready/blob/3d0ee5eb4f0944834a60c4666a3e9f2ec107628b/README.md |
| 64 | michaelpersonal/goal-forge | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/michaelpersonal/goal-forge/blob/8315c845acda9ced9ce2744fcafc90b6347950e7/README.md |
| 65 | tigerless-labs/paper-radar | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/tigerless-labs/paper-radar/blob/22e13f53d9b364e8f621c329436aa19309f7ba58/README.md |
| 66 | shaom/brand-to-design-md-skill | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/shaom/brand-to-design-md-skill/blob/f7fe99e7a2985d4457d44bfab8399bb1cf1896c0/README.md |
| 67 | uxKero/anydesign | 2 | ✓ | ✗ | – | – | – | excluded: E2, "baseline instead of zero" is workflow prose, not an effect number | https://github.com/uxKero/anydesign/blob/d81bd8957a21c2d7fba8d2a8f4f60050d09368b5/README.md#L267 |
| 68 | seb1n/awesome-ai-agent-skills — agent-evaluation | 2 | ✓ | ✗ | – | – | – | excluded: E2, a how-to skill for building evaluations for other agents; no published effect number for this skill itself | https://github.com/seb1n/awesome-ai-agent-skills/blob/75865a5d037a4cdaa7f409a4ec14ab9b0292920b/agent-engineering/agent-evaluation/SKILL.md |
| 69 | gapmiss/obsidian-plugin-skill — obsidian | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/gapmiss/obsidian-plugin-skill/blob/9afc9a49dd5301794dad5e85637604068ab139b3/README.md |
| 70 | william-garden/sync-skill | 2 | ✗ | – | – | – | – | excluded: E1, a CLI for syncing skill files across tool platforms; no SKILL.md in repo | https://github.com/william-garden/sync-skill/blob/ca6a2be8e7fc0b53080eebb68e6085d411d94f73/README.md |
| 71 | dbwls99706/ros2-engineering-skills | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/dbwls99706/ros2-engineering-skills/blob/c6c072e885607e05ae3aba66503a6dc615ac9fc6/README.md |
| 72 | O0000-code/paper-search-pro | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/O0000-code/paper-search-pro/blob/d60dc10110e9efda934d3bb50796a01eab6f2fed/README.md |
| 73 | anildash/better-documents | 2 | ✓ | ✗ | – | – | – | excluded: E2, "better baseline" is prose describing the skill's goal, not a measured effect number | https://github.com/anildash/better-documents/blob/dd8d01d4ebf9045f00a074c5f916a68d0d4f57e4/README.md#L7 |
| 74 | DQXCJ-a11y/thesis-skill-hub | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/DQXCJ-a11y/thesis-skill-hub/blob/0947beb624fa3aa70b4524343e660e5d8abbdd03/README.md |
| 75 | huangserva/servasyy_skills — comic-generator | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/huangserva/servasyy_skills/blob/54e36a6932cc6ff73d1c6cb65dbc1e882e72f630/README.md |
| 76 | dhicoc/dsh-reverse-skill — competition-ad-certificate-abuse | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/dhicoc/dsh-reverse-skill/blob/453f35d82bde07334637c4f7367b07c259a32732/README.md |
| 77 | hashgraph-online/skill-publish | 2 | ✓ | ✗ | – | – | – | excluded: E2, "skill" files found are only test fixtures for a publishing CLI; no with-vs-without number published | https://github.com/hashgraph-online/skill-publish/blob/af745ef996469efe9ea404985e5552621f2ca562/README.md |
| 78 | Tencent/SkillHone — skillhone | 2 | ✓ | ✓ | ✗ | – | – | excluded: E3, paper reports "+15.8 points on GAIA, +3.2 points on WebWalkerQA-EN" (E2 pass), but both are external agentic web-browsing/tool-use benchmarks whose grading requires executing tool calls and browsing live pages, not gradable from reply text alone — not portable to a nullbench verifier | https://github.com/Tencent/SkillHone/blob/c613aa99193079383c7a3ad81df1df005685e6af/README.md#L121 |
| 79 | Yusuke710/manim-skill | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/Yusuke710/manim-skill/blob/efb82d224201ce7f6f8d72f7ad972c8cd1b0a6ae/README.md |
| 80 | aakashg/pm-claude-code-setup — metrics-definer | 2 | ✓ | ✗ | – | – | – | excluded: E2, "metrics with baselines" is a generic output-quality standard, not a measured with-vs-without number | https://github.com/aakashg/pm-claude-code-setup/blob/9be80c62b3a49b3284bf07cd309f6c0add37d7c9/README.md#L59 |
| 81 | TerminalSkills/skills — skill-planner | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/TerminalSkills/skills/blob/511ec2060fe9e1b95a42ae042964f56d777b6c9b/README.md |
| 82 | FredAntB/Spec-Driven-Development | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/FredAntB/Spec-Driven-Development/blob/7296108716dea8447938a81fa82bbf7369a0fce2/README.md |
| 83 | ckpxgfnksd-max/uap-release-analyzer | 2 | ✓ | ✓ | ✗ | – | – | excluded: E3, publishes a with-vs-without eval scoreboard (`+23pp` mean, `evals/evals.json`), so E2 passes; but every pass criterion is file-system inspection ("inventory.csv was created at ~/...", "analytics/ directory was created containing...") over a multi-GB downloaded corpus, not gradable from reply text — not portable to nullbench | https://github.com/ckpxgfnksd-max/uap-release-analyzer/blob/c171d88deb15c747c14ca11aa1486167a6208b95/README.md#L97 |
| 84 | alpacahq/alpaca-skills — account-onboarding | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/alpacahq/alpaca-skills/blob/39111abee6b60af7c11d40b5fc892dfc4fd791a4/README.md |
| 85 | bergside/design-md-figma — figma-plugin | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/bergside/design-md-figma/blob/746501e4813df0dcf6f6a3bb8dac7b1a7dd4a590/README.md |
| 86 | veniceai/skills — venice-api-overview | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/veniceai/skills/blob/be69bebc470353da07d7284ec1d283d5a2f0a168/README.md |
| 87 | dashhuang/openclaw-chat-history-import | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/dashhuang/openclaw-chat-history-import/blob/31de67f2fb57bc55ec7b5d1006470f12a43417c9/README.md |
| 88 | GODGOD126/self-improving-for-codex | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/GODGOD126/self-improving-for-codex/blob/ae5004343368c7fb9d04691cec7e2df466354328/README.md |
| 89 | AIwithhassan/lets-scroll — lets-scroll | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/AIwithhassan/lets-scroll/blob/a0605366e8e774b1596a993ecaf564b6de5916cc/README.md |
| 90 | ithiria894/awesome-claude-code-workflows | 2 | ✗ | – | – | – | – | excluded: E1, curated workflow list; no SKILL.md in repo | https://github.com/ithiria894/awesome-claude-code-workflows/blob/553ac1546ba9b40882de0c4e0bc43694e66ad7ad/README.md |
| 91 | erfnzdeh/arvancloud-agent-skill — arvancloud-api | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/erfnzdeh/arvancloud-agent-skill/blob/ee61fbf20808c551edcf38c5299df764c88dab83/README.md |
| 92 | heyixuan2/bambu-studio-ai | 2 | ✓ | ✗ | – | – | – | excluded: E2, `%` hits are 3D-print infill/setting percentages, no effect claim | https://github.com/heyixuan2/bambu-studio-ai/blob/cdc26987d5bf1052a055d9403e3cb9630959dd08/README.md |
| 93 | OpenDemon/anyone-to-skill | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/OpenDemon/anyone-to-skill/blob/bd976dc76239613a1b785b0b20fe2fef45bb099f/README.md |
| 94 | pillar-labs/sail-skill — sail | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/pillar-labs/sail-skill/blob/67e1691ac64586b0abea96c74f511ea5628f62ed/README.md |
| 95 | coleam00/helpline — api-add-route | 2 | ✓ | ✗ | – | – | – | excluded: E2, "13/13" is a validator pass count for the repo's own tooling, not a with-vs-without effect number | https://github.com/coleam00/helpline/blob/456234aef7064f87c27ac79a3d6347cf9d93539d/README.md#L41 |
| 96 | solanabr/solana-ai-kit | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/solanabr/solana-ai-kit/blob/353e9a1d6be8bde89e1e5e0c00f7777b3dbbebfa/README.md |
| 97 | swati1024/torrents | 2 | ✗ | – | – | – | – | excluded: E1, empty git repository (409 on HEAD commit) | https://github.com/swati1024/torrents |
| 98 | kina-cmd/agent-skill-sync | 2 | ✗ | – | – | – | – | excluded: E1, no SKILL.md in repo | https://github.com/kina-cmd/agent-skill-sync/blob/975b219eb387298d83ef1b94c8be687658b6b8d9/README.md |
| 99 | aspenkit/aspens — base | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/aspenkit/aspens/blob/8dde82696cdc82bc951c9f07d964ad3468f24ef0/README.md |
| 100 | frmoretto/stream-coding | 2 | ✓ | ✗ | – | – | – | excluded: E2, "55% faster" is cited from third-party tools (Copilot/Cursor); the repo's own "7 modules in 4.5 hours" case study has no without-skill baseline | https://github.com/frmoretto/stream-coding/blob/42a7cb5ceec5611040d6f2764ee7943e4984345d/README.md#L16 |
| 101 | indiesoftby/defold-agent-config — defold-api-fetch | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/indiesoftby/defold-agent-config/blob/da5bd18f7f7114af0e0f09fa3bb3a26f091845fd/README.md |
| 102 | Worldbuilder013/HEXIS — table_clean | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/Worldbuilder013/HEXIS/blob/cdb484bb98e51fccb8d2286d324e881226cafcb6/README.md |
| 103 | Workflowsio/company-os-starter-kit | 2 | ✗ | – | – | – | – | excluded: E1, no SKILL.md in repo | https://github.com/Workflowsio/company-os-starter-kit/blob/3392777f8b27a48ca21954d175a82a5b457165fc/README.md |
| 104 | blacktop/ipsw-skill — ipsw | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/blacktop/ipsw-skill/blob/30f98b82fdfd9d1ccbee47c2c2d494b42f56ed8c/README.md |
| 105 | SylphAI-Inc/atskills — code-review | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/SylphAI-Inc/atskills/blob/9010d9a946cfeee7e777b2f8fd175855d744c391/README.md |
| 106 | ooocooc/open-skill-sunset — skill-sunset | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/ooocooc/open-skill-sunset/blob/b703cf00712b21f12bfa41f1d3d0a6a9455fd954/README.md |
| 107 | mitkox/SkillOpt — pi-skillopt | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published in this repo's own README | https://github.com/mitkox/SkillOpt/blob/7227af4965e9ed8e2a97cd84f2375d82a6a8bbcf/README.md |
| 108 | ZhongliangGuo/oop-architect | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/ZhongliangGuo/oop-architect/blob/4733ff320f9be4d6087d3c288a7d65cbadb44dac/README.md |
| 109 | netresearch/agent-rules-skill — agent-rules | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/netresearch/agent-rules-skill/blob/7e1a602f6c735d076afa0bf09c4b8e09bf1b8e3b/README.md |
| 110 | serac-labs/serac — acl-security | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/serac-labs/serac/blob/af3ad2b3c01305526a44b2647415ba794237462c/README.md |
| 111 | Hao0321/claude-skill-code-cleanup — run-benchmark-driven-rd | 2 | ✓ | ✗ | – | – | – | excluded: E2, a methodology skill for running benchmark-driven R&D on other projects; no published with-vs-without number for this skill itself | https://github.com/Hao0321/claude-skill-code-cleanup/blob/7f147ce60e40e10e2c82232861bec9f1ee6bcd93/README.md |
| 112 | ThomasMoreAI/legal-skills-open — arckit-uae-pdpl | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/ThomasMoreAI/legal-skills-open/blob/57855d3f62ec6b2778b70e26e2fa18c42e7a01d4/README.md |
| 113 | atsushi-green/ds-ai-coding-skills — analysis-reporting | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/atsushi-green/ds-ai-coding-skills/blob/edb4684e0917337d93eaf8039a5bcb36e632eab8/README.md |
| 114 | linmy666/madcop | 2 | ✗ | – | – | – | – | excluded: E1, no SKILL.md in repo | https://github.com/linmy666/madcop/blob/f5440a67da979f0f63f6c672fe86bd15be0b6bef/README.md |
| 115 | Timefiles404/lean-mode-skill — lean-mode | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/Timefiles404/lean-mode-skill/blob/b7f627e92591798e30fe3671911a89451f539f98/README.md |
| 116 | Caph-dev/agents-progressive-disclosure | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/Caph-dev/agents-progressive-disclosure/blob/3f966c22eefc032cac7d9cdda318a64af3123554/README.md |
| 117 | LOGIN-TB/claude-skills — ai-seo | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/LOGIN-TB/claude-skills/blob/e80bcfdb34dee7cc94265fc8ce54f156f440e4c8/README.md |
| 118 | pc-style/skill-view | 2 | ✗ | – | – | – | – | excluded: E1, no SKILL.md in repo | https://github.com/pc-style/skill-view/blob/7dde350d6ed3af071c16ce7c833ea5adbaefdfd9/README.md |
| 119 | fivetaku/claude-office-skills — 3-statement-model | 2 | ✓ | ✗ | – | – | – | excluded: E2, no with-vs-without number published | https://github.com/fivetaku/claude-office-skills/blob/039902691e7d0a735ef4e67ee007d7832da9fcab/README.md |

## Outcome

Screened 119 candidates; 0 eligible. Exclusions by first failed criterion:
E1 17, E2 98, E3 4, E4 0, E5 0.

Zero of 119 screened candidates publish a portable with-vs-without claim. The pattern:
of the 4 candidates that cleared E1 and E2 (published some with-vs-without number),
all 4 failed E3 for the same underlying reason — their pass criteria require executing
generated code, inspecting a file system, or grading an external agentic benchmark
(GAIA / WebWalkerQA), none of which nullbench can grade from reply text alone:
`ciembor/agent-rules-books` (#26), `arpitg1304/robotics-agent-skills` (#49),
`Tencent/SkillHone` (#78), and `ckpxgfnksd-max/uap-release-analyzer` (#83).
No candidate reached E4 or E5.

Per the selection rule's stopping condition ("100 candidates screened"), screening ran
past 100 to 119 because the rule reads source 1 and source 2 as sequential and screened
in full ("all of source 1, then source 2"): source 1 (19 candidates) was screened
completely first, then source 2 (100 candidates) was screened completely, for a
combined total of 119. See Concerns in the task report for the literal-vs-intended
reading of the 100-candidate cap. k = 0: per the rule and per Task brief Step 5, the
audit's finding is the E-rate table above, and Task 8's write-up is the remaining work.
No skills were selected.
