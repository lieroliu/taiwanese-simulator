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

## popculture.json — what each cohort grew up with
`{items:[{id, cat, name, y, minAge, maxAge, eth?, skew?, weight, src, lines:[{text, tone, minAge?, maxAge?, y?, sex?, eth?, need?}]}]}`. Cartoons, TV, music, films, games, snacks, toys, tech and fads, each dated to the years it was everywhere in Taiwan (`y` = [from,to], not just the launch). `src` records how the year was checked; entries marked 依日本推出時間推估 had no Taiwan-dated source. Run `node tests/pop_content.js` (format, plus every birth year 1961–2010 meets at least 6 general items between ages 5 and 25).
- `cat`: 卡通/電視/音樂/電影/遊戲/零食/童玩/科技/流行. The diary entry itself uses cat 生活.
- `skew` multiplies `weight`: `urban` (character lives in an urban county), `rural`, or an ethnicity name (e.g. 原住民 for KTV and 張惠妹, 閩南 for 台語八點檔). `eth` on the item or a line is a hard filter (客家電視台, 原民台, 國劇 for 外省 kids).
- **Engine hook**: each non-choice month, with chance about **.025**, pick one item whose `y` contains the current year and whose `minAge`–`maxAge` contains the character's age, weighted by `weight × skew`. Then pick a line whose own filters match (`need` works as in the other files); if no line matches, skip. Each item at most once per life, at most **12 per life**, at least 4 months apart. Write the line as a diary entry (cat 生活, its `tone`, mood as usual). This sits beside funny.json in the personal-event pool but does not count toward funny's 1-in-5 share.
- **End screen**: keep the `name` of every item the character met in `s.pop` (in order). Show up to 6 of them, those met at ages 5–18 first, as one line under the 這一屆 block, e.g. 「你那一屆的童年：小叮噹漫畫、紅白機、乖乖、灌籃高手……」. It is the line people will recognize their own cohort by, so it should also go on the share image if there is room.
- Lines are written in 我 like everything else; 「」 quotes keep the speaker's 你.
