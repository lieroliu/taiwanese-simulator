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
