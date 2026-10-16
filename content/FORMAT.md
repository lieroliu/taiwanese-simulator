# Content file format (for life.html)

The game engine for all three files already exists in life.html, with a first batch of text. New files **add more variants**; they do not replace the engine. Write in 我 (first person). The game converts narration to 你 at display time, and text inside 「」 stays as the speaker's own words. Follow the writing rules in team memory: everyday first-person scenes, no history lectures, no explaining the lesson, and no 所以/因此.

Placeholders you may use inside text:
- `{n}`: the partner's name
- `{p}`: 他/她 for the partner
- `{spot}`, `{nm}`, `{food}`, `{temple}`: the local landmark, night market, local food (with its measure word, e.g. 一碗肉圓) and temple of the current county
- `{elders}`: 阿公阿嬤 / 爺爺奶奶 / 阿公阿婆, by ethnicity

## history_variants.json
The owner thread already supports the format this file uses now: `{_format, events:{id:{title,y,variants:[{when,text}]}}}`, with `when` keys age/trait/eng/eth/region/bg/sex/kids/married/stance. Keep using it. The older spec below is optional.
Personality takeaways appended after a historical event's text.

```json
{ "sars": [ {"axis":"risk","dir":1,"text":"大家都躲在家，我照樣去巷口吃了一碗麵。"} ] }
```

- Key: the event id from the timeline. Existing ids include sars, lehman, nhi, wang, lv3, covid, ai, p_ai, phone, 319, turnover, elect, missile, pelosi, quake, morakot, martial, cck, sun, cape7, fb, asia, weekend, p_pension and meteor. Ask the owner thread for the others.
- `axis` is one of risk (安穩↔冒險), rebel (順從↔反抗), self (顧家↔顧自己), open (傳統↔開放) or eng (政治冷感↔關心).
- `dir` is 1 for the high end of the axis and -1 for the low end.
- Optional fields:
  - `minAge`/`maxAge`
  - `need`: any of "working", "student", "kids", "married", "parentsAlive", "rural", "urban"
- Each text is one or two sentences, and must make sense for any region. Never decide whether the character joins a protest or which party they vote for. The engine computes that.
- Aim for 4–8 variants per event, covering both ends of at least two axes.

## early_childhood.json (ages 0–6)
State objective facts at that age. Do not write them as memories or as 媽媽說.

```json
[ {"id":"bcg","minAge":0,"maxAge":1,"by":[1961,1990],"y":null,"months":null,"region":null,"county":null,"eth":null,"pjob":null,"urban":null,"weight":1,"cat":"健康","tone":"neutral","text":"我打了卡介苗。"} ]
```

- `by`: [min, max] birth-year range.
- `y`: a list of calendar years, or null.
- `months`: a list of 1–12, or null.
- `region`: one of 北/中/南/東/離島.
- `county`: a list of county names (台北市, 台北縣, …, as in the game).
- `eth`: one of 閩南/客家/外省/原住民/新住民子女.
- `pjob`: one of 農/工/小生意/公教/白領.
- `urban`: true or false.
- `weight`: relative frequency, where 1 means common.
- `cat`: 家庭/健康/生活/人生.
- `tone`: good/bad/neutral.
- Each life gets about 4 of these, so cover many eras and regions rather than piling onto one.

## romance.json (dating to marriage)
Stage pools. The engine picks by stage, era and conditions.

```json
{ "date":   [ {"y":[1975,1990],"text":"每天晚上，我在巷口的公共電話跟{n}講到零錢用完。"} ],
  "habit":  [ {"text":"{n}約會總是遲到。","delta":-1, "axis":"risk"} ],
  "fight":  [ {"text":"我們大吵了一架……"} ],
  "makeup": [ {"text":"後來是我先打電話過去的。"} ],
  "family": [ {"cond":"mixed_wai|poor|lang|ok","delta":-12,"text":"第一次去{n}家……"} ],
  "ready":  [ {"text":"我們開始會聊以後要住在哪裡。"} ],
  "breakup":[ {"why":"fam|wait|far|plain","text":"……"} ],
  "blind":  [ {"y":[1961,1988],"text":"媒人帶我去相親……"} ] }
```

- `y`: [from, to] calendar years. `delta` changes relationship strength, from -20 to +10.
- Under `habit`, `axis` means the habit clash comes from a personality gap on that axis.
- Under `family`:
  - `mixed_wai`: 外省 marrying 本省 before 1992
  - `poor`: your family is poor
  - `lang`: the partner's family speaks a different language
  - `ok`: the default
- Under `meet`, `myJob` lists the character's current job codes the scene fits (工廠隔壁線 needs 工廠; 公司新來的同事 needs an office-type job). `ptJob` sets the partner's job before the engine writes 「{p}是…」: `same` copies the character's job, `student` means the partner is still in school (no job). Without this the game wrote 「玉婷是公司新來的同事……她是自己做生意」.
- Under `ready`, entries with `commit:true` (求婚, 提親, 先去登記, 懷孕 then 「那我們結婚吧」) mean the couple has already decided to marry. Never draw them in relstep. Use one only as the opening line of a `marry` choice that ends in marriage.

## Shared filters (funny, near_death, death_causes, danger)
Omitted fields mean "any". `y` is a [from, to] calendar-year range. `minAge`/`maxAge` are the character's age. `months`, `region`, `county`, `eth`, `sex` (M/F), `need`, `urban` work as above. `job` is a list of current job codes (農/工廠/營造/服務/…, as in JOB_T). `eduMax` means "only if the character's education is at most this" (國小 < 國中 < 高職/高中 < 五專 < 大學). `moneyBelow` means s.money is under that value. `node tests/fun_content.js` checks all four files.

## funny.json — absurd-but-real everyday moments
`{events:[{id, …filters, weight, cat, tone, text, habit?}]}`. Each is one diary line with the character's own reaction built in.
- Engine hook: add these to the personal-event pool (like PE) with the same 36-month cooldown, and tune the pool weight so about **1 in 5 non-choice diary entries** is from this file. Pick each entry at most once per life.
- `tone` uses the existing set (good/bad/neutral). Mood can still be added as usual.
- `habit` is optional and uses the same shape as near_death.

## near_death.json — close calls the character survives
`{events:[{id, …filters, weight, health, text, scar?, habit?}]}`.
- Engine hook: one more RE entry, `p ≈ .0007` a month (about one or two close calls per long life), picking by `weight` among entries that match. Apply `fx(s,{health})`.
- `scar` → `scar(s, phrase, yrs, w)`. `habit` → `habit(s, k, say, does, why)`, where `why` starts with ， and follows the year, as in the existing habit() calls. Add the new `k` keys to HW with weight 2–3.
- None of this touches annualQ(). The health drop already raises later risk a little through the existing health term.

## death_causes.json — everyday scenes for the last diary line
- `flavor[cause]` lists scenes for causes causeOf() already returns. In deathEntry(), when the cause is not 自殺 and not a named disaster, pick a matching scene with about 70% chance and write `${when}，` + text (converted to 你) + `享年 N 歲。`. Infants under 5 keep the existing line.
- `addWeights` proposes an 意外 slot in causeOf() for ages 5+ (real stats list 事故傷害 among the top causes at every age). This only reshuffles which cause is drawn; the death rate itself is unchanged.
- New cause names used by danger.json: 船難, 礦坑災變, 塵肺症. deathEntry() should treat 船難 and 礦坑災變 like the accident group ("在一場…中離開人世").

## danger.json — choices that were genuinely dangerous in their era
`{events:[{id, title, …filters, p, alsoIf?, repeat?, text, choices:[…]}]}`.
- **Offering**: a choice event (like MS entries with `choice:1`). Each month, if the filters match and the event hasn't been offered in this life (unless `repeat:true`), offer it with chance `p`. `alsoIf:{moneyBelow,p}` offers it outside the listed counties at a lower `p` to poor families (people came from everywhere to mines and fishing boats). `countyWeight` multiplies `p` for those counties. `sexWeight` multiplies `p` by sex.
- **Choice fields**: `label`, `go` (result text), `lean` (personality axes → add to LEAN), `pull:{moneyBelow,mult}` (multiply autoChoose weight when the family is poor, since that is why people took these jobs), `norm:true` (this is what most people around the character did that year → the existing 身邊的人多半這樣選 tag), `fx` (applied at once), `job:{code,label,income?,fallback?}` (set the job; `code` may be new — 漁工/礦工/海員 — add it to JOB_T/JOBLABEL with `income`, or use `fallback`), `setFlag` (sets `s.f[flag]=1`, e.g. shark so the old 地下錢莊 RE doesn't fire again).
- **Danger tag**: `danger` is one of 很危險/有點危險/傷身體/可能賠很多 and is shown as a choice tag next to the existing difficulty tag. No percentages. An option with risk but no `danger` (the electronics factory) is deliberate: nobody knew at the time, and the harm only shows up later.
- **Exposure** (`risk`): on choosing, push `{id, until, …risk}` onto `s.risks`.
  - Window: `once:true` → resolve this month only. Otherwise `years` → until `s.t + years*12`, cut short by `untilY`/`untilM` (the law or era ended). `months` limits the monthly rolls to those months.
  - `death`: extra **annual** death probability while exposed. Either a number or a period table `[[fromY,toY,q],…]`. Each exposed month roll `chance(death/12)` (with `months`, spread it as `death/months.length`); with `once`, roll `chance(death)` once. On a hit, call deathEntry with `cause`, and use a random `deaths[]` text, or the scene named by `deathFlavor` (`"cause/id"` in death_causes.json). This roll is **in addition to** annualQ(); base mortality stays as it is.
  - `injury`: annual chance of a close call while exposed, same timing. Pick from `near[]`: inline `{text,health,scar?,habit?,note?}` or `{ref:"near_death/<id>"}`.
  - `during[]`: 1–2 diary lines at random exposed months (any tone; they keep the stretch from going silent).
  - `moneyPerYear`: applied yearly while exposed (大家樂).
  - `safe`: for `once` events, the text when nothing happens (plus the choice's `fx`).
  - `end:{text,fx}`: when the window closes and the character is alive. Big payouts (遠洋, 跑船, 沙烏地) sit here, so only survivors get the money. Then restore the job to the previous one, or `fallback`.
  - `habit`: added when the window ends (survivors only).
  - `late:{cause, fromAge | fromYearsAfter, mult, text?, reveal?}`: a lasting effect for people who took the option. From that age, multiply annualQ() by `mult` for this character only and raise `cause`'s weight in causeOf() by the same factor. `text` is a one-time diary line when it starts. `reveal:{y,text}` is a one-time line in that calendar year (or the first month after, if the character joined later), only if they took the option.
- **Auto-run**: autoChoose already uses LEAN plus PULL; add `pull` here. High-risk personalities and poor families end up on the boats and in the mines more often, which matches who actually went.
- Rough size of the risk (estimates, for gameplay; real records for mines and boats were worse than official numbers): three years on a 遠洋 boat ≈ 7% death, six years in a mine ≈ 9%, three years of high scaffolding before 2000 ≈ 4%, riding without a helmet for ten years ≈ 3%.

## affair.json — an affair that happens to the marriage
Not a player choice to start: it happens to the spouse, or (only from June 2020, after 通姦除罪) to the character, so the character still never commits a crime. Text covers mood and consequences only. `node tests/affair_content.js` checks the file.

- **Placeholders**: `{n}`/`{p}` are the spouse (as in romance). `{o}` is the third person: 那個女人 or 那個男人, the opposite sex of whoever is having the affair. Add it to fillPH.
- **Filters** (all optional): `y`, `months`, `minAge`/`maxAge`, `sex` (character), `spSex` (spouse), `need` (kids/parentsAlive/working/married/student), `money:"low"` (s.money < 30), `away:true` (spouse is in China: `sp.away==='中國'`), `job`, `axisMin`/`axisMax` on s.ax, `famNot` (s.fam not in the list), `flag` (s.f[flag] is set), `kidAge` [min,max] of the oldest kid.
- **Onset** (`onset`): monthly check while married and the spouse is alive and `!s.f.separated`. Annual chance = `annual × era × spSexMult × yearsMarried × exp(Σ axis[k]·(ax[k]−50)) × (away ? away.mult) × (fight in the last 24 months ? fightMult)`, divided by 12. Use `sp.ax` for the spouse and `s.ax` for the character. At most `maxPerMarriage` spouse affairs per marriage and `maxPerLife` for the character. Roughly 10–15% of 30-year marriages see a spouse affair.
- **Spouse in China**: the spouse needs the same 台商 path friends already have. In peopleYearly, for a spouse with job 工廠/公司 between 1992 and 2012, `chance(.015)` sets `p.away='中國'` with a diary line, and `chance(.06)` a year brings them back.
- **While it runs** (`discover`): each month roll `endMonthly` first. If it ends unseen, call `storyAdd(s,sp,neverKnown.story)` (or `storyAway` when away) and write nothing in the diary: only the end-screen people list shows it. Otherwise roll `monthly × era` (× `awayMult` when away). For a spouse affair still hidden, add one `signs` line every 4–8 months.
- **Spouse affair found**: a choice event. Text = a matching `found` entry with `who:"spouse"` + `respond.ask`. Options are `respond.choices`; drop 提告 after its `until` (2020-05). For each option use the first `go` variant whose filters match. `normText` gives the existing peer-norm tag and its reason. `lean` goes into LEAN. If the option has `hard` and its filters match, it fails into `hard.fail` with `failText` (like the existing divorce failure). `then`:
  - `talk`: stay married; a later discovery doubles the autoChoose weight of 離婚.
  - `endure`: stay married; set `s.f.affairEndured`.
  - `separate`: `s.f.separated=1`.
  - `divorce`: the existing divorce ending (`s.married=false`, `s.f.divorced=1`, `sp.role='ex'`, storyAdd).
  - `sue`: set `s.f.affairSued=1`, then 6–12 months later go to `divorce` if `s.ax.self ≥ 50`, otherwise `endure`.
  Then 1–2 `after[then]` lines over the next 3–12 months, and with kids a 50% chance of one `kids.lines` entry by the oldest kid's age.
- **Character's own affair** (`self`): one `start` line when it begins, one `during` line every 3–6 months, one `end` line if it ends unseen. When found: a `found` entry with `who:"self"`, then the spouse reacts by personality (no player choice), with weights in `spouseReacts._how` and the outcome's `fx` and text.
- **Ambient** (`ambient`): era lines about other people's affairs (台幹 KTV nights, a friend's divorce, the 2020 ruling). Each at most once per life, in the personal-event pool with the 36-month cooldown, weight 1. `am_parents` passes its `p` once per life before it can enter the pool.
- **Habits and regrets**: `habits[].when` and `regrets[].when` name the trigger (`endure`, `talk`, `spouse` = any spouse affair found, `selfFound`). Habits go through `habit(s,k,say,does,why)`; add the new `k` keys to HW with weight 2. Regrets go through `regret(s,k,txt,why,w)` after filling `{n}`.
- **Glossary**: add 通姦罪 (刑法第 239 條，2020 年 5 月大法官宣告違憲失效；告訴可以只撤回配偶，第三者照樣被追訴) and 包二奶 (台商在對岸另外有一個家) to the tap-to-explain list.


## partners.json — who the partner is, how you met, and whether you fit
Partners used to be a name plus a random job, so every romance read the same and the place you met could contradict the job. This file gives each partner a full background, makes the way you meet depend on the era and on city vs countryside, sometimes offers two people to choose between, and lets personality fit drive fights, breakups and divorce. Each block has its own `_how` with the exact rule; this is the overview. `node tests/partners_content.js` checks the file and prints the meeting-channel shares by decade. Channel shares and coresidence rates are estimates (依調查估算).

- **Placeholders**: `{n}`/`{p}` as in romance. In pair texts `{a}`/`{b}` are the two candidates' names, `{ap}`/`{bp}` their 他/她, `{aj}`/`{bj}` their JOBLABEL. `{sibs}` is the partner's number of younger siblings in Chinese (兩、三…). Add these to fillPH.
- **Background** (`profile`, rolled in meetPartner after mkPerson): all five axes for the partner (not just self/risk), pulled toward the character's by `sim` plus the channel's `simAdd` and `shift`; `pt.pjob` (the partner's parents' work, same codes as s.pjob), `pt.fam` (拮据/小康/寬裕/富裕, stepped from the character's famLabel), `pt.eldest`, `pt.only`, `pt.sibs`, `pt.ch`. Keep them on the person.
- **Ways to meet** (`channels.list`): replaces the fixed lists in meetTxt/relMeet. Filter (y, age, sex, need, `myJob`, `moved`), weight by the `w` period table × `urban`/`rural`, pick one. `blind:true` channels are 相親 (`m.blind`). `ptJob` sets the partner's job before 「{p}是…」 (same/student/list). `ethSame`, `famSame`, `sameCounty` steer the background. The meet line comes from the channel's `texts`, then from romance.json meet/blind entries with the same `ch` (now tagged), then the old generic line. Then 「{p}是{job}。」 and one `describe.bg` or `describe.eldest` line. The first relstep after meeting shows one `describe.impress` line (the partner's most extreme axis) instead of a DATE line.
- **Two people** (`pairs`): when meet fires, with chance `offer[year]` and a matching template, offer a choice between candidate a and b (家裡安排的 vs 自己喜歡的; 省籍 before 1992; 家鄉的 vs 外地的 for people who moved; 穩定的 vs 聊得來的 from 2005). Options have `lean` (add to LEAN as `pair_<id>:<label>`), `pull` for autoChoose, `normText` for the peer-norm tag, and `go` variants. The chosen one becomes the partner with score `base + (compat-60)/2`; `parents:"against"` sets r.famNo and −8, `"like"` gives the family stage +8. The other becomes a friend and may come back years later in one `otherLine`. `moveHome:true` moves the character back to s.birthCounty.
- **Fit** (`compat`): replaces relCompat with a weighted gap over all five axes (eng only from 1987) minus a class-gap penalty. Relstep keeps using it as now. After marriage it multiplies the divorce chance (`divorceMult`) and drives a new monthly married-fight roll (`fightMonthly`) that sets `s.f.lastFightT` — this is the fight signal affair.json's `fightMult` needs.
- **Fights** (`fights.pool`): the cause comes from the biggest real difference between the two (an axis gap, class gap, eldest-child duty, shift work, politics, living with in-laws); `hi` says who is on the high end. Dating fights use it before romance.fight; married fights use only `married` or untagged lines.
- **Meeting the families** (`family.pool`): conds from the partner's background (ptRich, ptPoor, ptEldestSon, meEldestSon, ptFarm, ptGJ, ptShop, ptOnly), tried before romance.family.
- **Living with in-laws** (`inlaws`): at the wedding set `s.f.liveWith` ('his'/'hers') by era, eldest son, rural and family business; a start line, occasional during lines by the character's sex, fights get the inlaw cause, and a yearly chance to move out (buying a house also ends it). Do not set s.house.
- **Wedding money** (`wedding`): in-laws help with the down payment (rich partner family, 1990+), or the couple supports the partner's poor family every year, or a modest 嫁妝 before 2000.
- **End screen**: the partner/spouse line in the people list can now say how you met and one background fact, e.g. 「美玲（相親認識，公務員，家裡是長女）」.

## kin_advice.json — what relatives call 有出路, by cohort
Relatives push a field that changes with the cohort (五年級 醫科・師範公費・電機・女生讀商; 六年級 醫牙・電機・法律會計・銀行; 七年級 醫牙電資・台積電聯發科; 八年級 醫牙・電資・公職; 九年級 醫牙・半導體・AI). When that clashes with what the character likes or with their grades, the 選科系 step becomes a choice about listening to them. Run `node tests/kin_content.js`.

Shared filter keys work as in the other files (`by`, `y`, `minAge`/`maxAge`, `sex`, `eth`, `pjob` list, `urban`, `inc`, `need`), plus `studyAtLeast`, `moneyBelow`/`moneyAtLeast`, `edu` (list), `major` (list, or a string in `echo`), `job` (list of job codes).

New placeholders: `{adv}` = the advised field (`advice.sub`), `{like}` = the character's own interest (`likes.sub`), `{got}` = the field actually entered after a failed try. Convert 我→你 as usual.

**1. Interest (`likes`).** At age 12 (with class13), roll `s.like` from entries matching `by`/`moneyAtLeast`, weight `w * exp(Σ coef*(s.ax[k]-50)/25)` over `ax`. Once between ages 9 and 14, write one matching `hobby` line as a diary entry, so the interest is visible before it clashes.

**2. Advice (`cohorts`).** Cohort = the entry whose `by` contains s.by. At the first 春節 (month 1 or 2) when age is 13–17, pick `s.kinAdv` by `w` among that cohort's matching `advice`, and write its `text` as a diary entry (cat 家庭). Every character gets one (the test checks coverage). If the character reaches 選科系 without one, pick it then, silently.

**3. New-year lines (`newyear`).** Months 1–2 only, ages per entry, at most 3 per life, each once, spaced at least 3 years apart. Neutral tone unless the mood says otherwise.

**4. The clash (`clash`), replacing the `major` event when it applies.** When `s.pend==='major'`:
- `interest` clash: `likes[s.like].major !== s.kinAdv.major`.
- `grades` clash: `clash.gradeNeed[s.kinAdv.sub]` exists and `s.study` is below it.
- If neither, run the existing `major` event unchanged (its ctx line can quote `{adv}`).
- Otherwise run a choice event titled `clash.title`. Text = the first `clash.text` entry matching `type` (grades wins if both) and `by`. Show only choices whose `if` matches (`y` range on the current year; `type`; `advSub` list against `s.kinAdv.sub`).
- `target:"adv"|"like"` names the major to try. Success uses the existing `ASP.major[major].p(s)`. On success set the major the same way the `major` event's `go()` does (edu, studying, studyEnd, uniloc, key) and write the first matching `ok` text. On failure, reuse `majFail`'s pick for `{got}` and write the first matching `fail` text instead of majFail's own line.
- `block` (on 讀自己想讀的): if it matches, with chance `p` the family overrides. Write its text, then try `adv` instead (its own success roll and fail text).
- `then:"transfer"`: after entering `adv`, schedule a transfer roll `transfer.afterMonths` later. `p = clamp(base + perStudy*s.study + Σ addIf, min, max)`. Success sets `s.major = likes[s.like].major` and writes an `ok` line; failure writes a `fail` line.
- `retake:true`: like the existing 重考 (`s.studying='重考'`, 11 months, apply `fx`). At the end, roll `ASP.major['醫護']` with the new study. Success → 醫護 + a `retake.ok` line. Failure → enter `likes[s.like].major` with a `retake.fail` line.
- Set `s.f.kin` to `listen` (聽親戚的, or overridden by `block`), `own` (讀自己想讀的), `mid` (先讀再轉系), or `retake`. Apply each choice's `fx`.
- Reason line (the existing 身邊的人 ctx): use the cohort's `clashCtx.text`, and `clashCtx.norm` as `norm`.
- Auto-run: add each choice's `lean` to LEAN under `kinMajor:<label>`.
- Regret candidate for the end screen: `regret.listen` when `s.f.kin==='listen'`, `regret.retakeFail` after a failed retake.

**5. Reason lines for other choices (`ctx.m15`, `ctx.job`).** In ctxFor(), try these entries just before each case's final default return (the built-in special cases keep priority). First match wins. Each `norm` is an existing choice label.

**6. Echoes (`echo`).** Later-life diary lines that show how the advice played out in that era. Each month, with chance about .02, pick one matching entry. Matching: `kin` against `s.f.kin` (`any` matches any value, but needs `s.kinAdv`), plus `major` against s.major, `like` against s.like, `job` against s.job, and the shared filters. At most 2 per life, each once. Apply `fx` and use `tone`.
