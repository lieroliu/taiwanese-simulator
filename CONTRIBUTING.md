# 開發說明：檔案分工、建置、平行開發

上線的遊戲還是一個 `index.html`（GitHub Pages 只發布這個檔），但它是**建置出來的**。程式寫在 `src/` 底下的許多小檔案，用 `tools/build.py` 依序接成 `index.html`。

**不要直接改 `index.html`。** 改 `src/`、`content/` 或 `data/`，然後重建。

## 建置

```sh
python3 tools/build.py           # 把 content/、data/stats/ 轉成 src/data/*.js，再把 src/ 接成 index.html
python3 tools/build.py --check   # index.html 跟 src/ 建出來的不一樣就失敗（部署前會跑）
```

`src/page.html` 是網頁骨架，裡面一行 `//@include 路徑` 或 `/*@include 路徑*/` 就會被換成那個檔案的內容。**include 的順序就是程式執行的順序。**改 `src/` 和重建後的 `index.html` 要放在同一個 commit。

## 檔案分工

| 檔案 | 負責什麼 |
|---|---|
| `src/page.html` | 網頁骨架（HTML 版面）和所有檔案的載入順序 |
| `src/css/style.css` | 全部樣式 |
| **engine/ 人生計算** | |
| `engine/util.js` | 亂數、`pick`、`chance`、`fx` 等小工具 |
| `engine/world.js` | 各縣市、族群、職業的粗略統計 |
| `engine/character.js` | `newLife`：出生年 → 出生地 → 族群 → 性別 → 家境 |
| `engine/reactions.js` | 依年紀、個性寫反應句的工具 |
| `engine/milestones.js` | 人生關卡（上學、升學、當兵、工作、結婚、買房等，含選擇） |
| `engine/mortality.js` | 死亡與死因 |
| `engine/mood.js` | 心境：家境 × 個性 × 社會氣氛（之後的心情值、憂鬱症放這裡） |
| `engine/reasons.js` | 選項的兩個標籤：身邊的人怎麼說、個性會不會 |
| `engine/people.js` | 身邊的人（名字、各自的人生）、`autoChoose`、`doChoice` |
| `engine/scars.js`、`engine/habits.js` | 舊事件留下的影響、一輩子掛在嘴邊的話 |
| `engine/cohort.js` | 你這一屆：出生時跟同年孩子比、日記裡「那一年」的官方數字、結局的「你這一屆」表（資料在 `src/data/off.js`） |
| `engine/money.js` | 存款、家產、房價、房貸 |
| `engine/jobs.js` | 具體職業（職稱）、職業薪資、年資曲線、基本工資下限（資料在 `src/data/occ.js`，來自 `data/stats/occupations.json`） |
| `engine/consistency.js` | 前後矛盾的守門員 |
| `engine/age-limits.js` | 未成年騎車、抽菸、喝酒的年代規則 |
| `engine/regrets.js`、`engine/satisfactions.js` | 結局的後悔的事、滿意的事 |
| `engine/era-wall.js` | 結局的「時代沒讓你做到的事」：時代帳本 `eraLog(s,k,txt,why)`（任何檔案都可以加一筆）、因為時代失敗的選擇改記這裡、不再重複出現在後悔的事 |
| `events/era-wish.js` | 「你想不想…？」問句：國中畢業想繼續讀、婚後想不想上班、想不想有自己的房子（一次）、每年過年想不想結婚、想不想出國玩、外省想不想回老家；選「想」之後被時代擋下就記進時代帳本 |
| `events/dream-jobs.js` | 夢想職業（歌手、演員、樂團、電競、職棒、漫畫家、布袋戲、YouTuber）：12–24 歲問一次「你想不想…」，被時代擋下記進時代帳本；有機會的人在工作關卡多一個選項，`s.job='特殊'`、`s.sp` 記職業和名氣；家人、親戚、對象、同學的互動句子，以及辦公室用語的過濾 |
| `engine/era-effort.js` | 同樣的選擇在不同年代結果不同 |
| `engine/step.js` | 每個月的主迴圈 `step` 和每年一次的 `yearly` |
| `engine/biz-swing.js` | 做小生意的好年壞年：生意狀況 `s.bizLv` 影響收入，可能做起來也可能倒 |
| `engine/rent.js` | 租屋等級（雅房、套房、整層）的選擇、房租照當地房價、對心情的長期影響 |
| `engine/debt.js` | 每月結算後缺錢的籌錢順序：跟家裡拿、跟親戚借、銀行、地下錢莊、欠房租賒帳；欠款 s.debt／s.kinDebt 每月還；協商、清算、流落街頭。存款永遠不低於 0 |
| `engine/fam-like.js` | 家人好感度（隱藏 0–100）：跟家裡要錢會扣、寄錢回家和照顧爸媽會加；影響家人說話的口氣，低於 25 家裡不再給錢 |
| `engine/money-trouble.js` | 缺錢太久的後果：連續欠款年數 s.f.troubleY、為錢離婚（疊在原本的離婚機率上）、跑路、心情變差、流落街頭時死亡率變高 |
| `engine/shop.js` | 開店要本錢（存款、爸媽、親戚），不夠就擺攤或去上班；攤子收入較低；頭幾年倒店機率高，景氣差加倍，倒店留下貨款欠款 |
| `engine/settle.js` | 包在所有 step 外層的每月結算（呼叫 debt.js 的 cashMonth、cover），一定要放在最後一個 engine 檔 |
| `engine/job-region.js` | 地區對工作的影響：縣市產業比例決定選項和職稱、科學園區看地點和年代、地區薪資照縣市家戶可支配所得（資料在 `src/data/jr.js`，來自 `region_economy.json` 和 `income_prices.json`） |
| `engine/mood-value.js` | 心情值 0–100（合併孤獨感）、選項的心情取捨、憂鬱症、結局的「你的心情」 |
| `engine/classmates.js` | 國小同班的五個同學：入學那年照同年同縣市抽背景，每年擲幾次骰子走簡化人生（升學、工作、結婚、買房、生死） |
| `engine/away-scold.js` | 已經搬出去住時，家人的責罵改成電話裡罵或瞞著家裡，會扣心情 |
| `engine/diary-filters.js` | 最外層的日記過濾：補日期、去重複、公教用語、朋友介紹（必須是最後一個包 `step` 的檔案） |
| **events/ 各類事件** | |
| `events/history.js` | 歷史事件時間軸 |
| `events/random.js`、`events/variety.js` | 一般隨機事件、依背景變化的版本 |
| `events/work.js`、`events/region.js` | 各職業、各地區的日常 |
| `events/early-childhood.js`、`events/romance.js` | 0–6 歲、交往過程 |
| `events/lens.js`、`events/takeaways.js` | 共同事件的在地版本、個性收穫 |
| `events/history-variants.js` | 歷史事件的個性版本（content/history_variants.json 等） |
| `events/partners.js`、`events/affair.js` | 對象、婆家、外遇 |
| `events/sexuality.js`、`events/same-sex-text.js` | 同志路線、同性伴侶的文字過濾 |
| `events/fun-danger.js` | 好笑小事、差點死掉、死因場景、年代危險選擇 |
| `events/kin.js`、`events/ethnic.js` | 親戚建議、族群事件 |
| `events/generations.js`、`events/tech.js`、`events/popculture.js` | 同一刻其他世代、科技、流行物 |
| `events/classmates.js` | 國小同學在日記裡偶爾出現：入學、畢業、喜帖、同學會、被裁員、買房、過世 |
| `events/abroad.js` | 住在國外 |
| `events/paths.js` | 選擇走出的路線各自的日記（北上、留鄉、工廠、小生意、租屋、單身等，內容在 content/paths.json） |
| **ui/ 畫面** | |
| `ui/play.js` | 遊戲畫面：日記、選擇視窗、左側現況、快轉 |
| `ui/summary.js`、`ui/cohort-table.js` | 結局頁、後悔的事 |
| `engine/choice-log.js`、`ui/choices-summary.js` | 記下每個選擇（`s.ch`）和當時身邊的人怎麼選；結局頁「你做的決定」 |
| `events/callbacks.js` | 多年後日記提起當年的選擇（讀 `s.ch`，一生最多三次） |
| `ui/classmates.js` | 結局的「你國小同班的人」段落 |
| `ui/share.js` | 分享用直式圖 |
| `ui/glossary.js` | 年代用語小解釋 |
| `ui/map.js` | 足跡地圖 |
| `ui/scene.js` | 日記上方的像素小圖 |
| `ui/avatar.js` | 現況卡左邊的馬賽克頭像（四個年齡、五種表情，跟著心情值） |
| `ui/wiring.js` | 按鈕與鍵盤綁定、啟動 |
| **data/ 產生的資料（不要手改）** | |
| `src/data/*.js` | 由 `tools/build.py` 從 `content/*.json`、`data/stats/` 產生（`off.js` 是結局「你這一屆」用的官方統計）；`map.js` 由 `tools/build_map.py` 產生；`hv.js` 是空的佔位 |

文字內容（事件句子、選項）放在 `content/*.json`，格式見 [content/FORMAT.md](content/FORMAT.md)。

## 平行開發規則

1. **一個串負責一組檔案。**開工前在串裡說要改哪些檔案；別的串正在改的檔案，先跟那個串（或透過協調）講好再動。
2. **新功能盡量開新檔案**，在 `src/page.html` 適當的位置加一行 include。很多功能是用「包住舊函式」的方式加上去的（`{const s0=step;step=function(s){...}}`），所以位置很重要：
   - 改人生計算的放在 `engine/step.js` 之後、`engine/diary-filters.js` 之前
   - `engine/diary-filters.js` 永遠是最後一個包 `step` 的
   - 畫面相關的放在 `ui/` 底下
3. **`index.html` 合併衝突不要手動解。**直接選任一邊，然後跑 `python3 tools/build.py` 重建再 commit。
4. **只搬程式、不改行為的修改**（重構、拆檔）必須通過逐行比對：
   ```sh
   git show origin/main:index.html > /tmp/before.html
   PW=... node tests/same_output.js /tmp/before.html index.html 60
   ```
   它用固定亂數種子跑同樣的 60 生，每一行日記和結局頁都要一樣。
5. **改行為的修改**不用在雲端串裡跑整套測試（很耗 token），交給 GitHub 跑（見下方「自動測試」）。自己只跑跟改動直接相關的快速檢查，例如：
   - 改了 `content/*.json`：跑對應的 `*_content.js`（只讀 JSON，幾秒鐘）
   - 改了某個功能：`node tests/run_all.js 那個功能的測試`，例如 `node tests/run_all.js partners`
   - 都要先跑 `python3 tools/build.py`，確定建得起來
   一個 PR 只做一件事。

## 新劇情的寫法：先查前提，結果寫回狀態

前後矛盾（已婚又告白、沒買房卻在繳房貸）幾乎都是因為劇情自己假設了角色的狀況。所以：

- **每段劇情先檢查前提**：出櫃要先有發現或好奇、離婚要先已婚、繳房貸要先買房。前提只看角色狀態（`s` 上的欄位），不要從日記文字或「應該已經發生了」來猜。
- **劇情的結果寫回角色狀態**：結婚、搬家、跟誰住、買房，發生了就改 `s` 上對應的欄位，後面的劇情才讀得到。
- **發現一個新矛盾，就在 `tests/invariants.js`（人生不能出現的事）加一條規則**，讓 GitHub 每次都檢查，同樣的錯就不會再出現。
  - 規則優先看角色狀態（`RULES`，例如已婚就一定有在世的配偶）；只能從文字判斷的放 `TEXT_RULES`。
  - 看角色狀態的規則（`RULES`）一次都不准犯。看文字的規則（`TEXT_RULES`）難免誤判，只有次數明顯變多才紅燈：上限是 `KNOWN` 裡的比例換算成這次的期望次數 E，再加 4×√E＋4，不相關的修改把人生洗牌也不會超過。
  - 遊戲現在還會犯的，把實測比例（每百生幾次）寫進 `KNOWN`；修好之後把數字調低，最後拿掉。
  - 本機跑：`node tests/invariants.js index.html 300`（約 30 秒），會列出每條規則犯了幾次和例子。

## 自動測試（GitHub Actions）

`.github/workflows/ci.yml` 在每個 PR、每次 push 到 `main` 都會跑：

1. **Build check**：`python3 tools/build.py --check`，`index.html` 沒有重建就失敗
2. **Tests (1/3)、(2/3)、(3/3)**：`node tests/run_all.js`，把 `tests/` 裡的測試分三台機器跑
3. **All tests passed**：上面全部通過才會綠燈；`main` 的分支保護就是看這一項
4. **deploy**：只有 push 到 `main` 而且測試全過，才部署到 GitHub Pages

流程：

- 改完、commit、push，開 PR。
- **等 PR 上的檢查變綠燈再合併**。紅燈就點進去看 log：最後會列出失敗的測試和它的輸出。修好再 push，CI 會自動重跑。
- 合併到 `main` 後會再跑一次測試，通過才部署（約 5–10 分鐘後上線）。

`tests/run_all.js` 的規則：

- `tests/` 底下新增的 `*.js` 會自動被跑到，不用改 workflow。測試失敗要 `process.exit(1)`（或丟出錯誤）才會擋下來；只印數字不算失敗。
- 每個測試都用固定的亂數種子跑（`tests/seed.js`），同一個版本跑幾次結果都一樣，不會這次過下次不過；換一組種子：`SEED=123 node tests/run_all.js`。改了遊戲內容後，同一組種子跑出的人生也會跟著變。
- `same_output.js` 需要兩個版本比對，不會自動跑，重構時自己跑。
- `REPORT_ONLY` 裡的測試照跑、照印，但失敗不擋合併。用在同一版本跑幾次結果會時過時不過的統計測試；門檻調穩之後就從清單拿掉。
- 本機也可以跑全部：`node tests/run_all.js`（4 核大約 6 分鐘），或只跑幾個：`node tests/run_all.js smoke house`。
