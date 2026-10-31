# neoisbackagain — Cyber Blog

紅隊／滲透測試筆記博客：HackTheBox / VulnLab writeups、OSCP / CPTS 備考、Windows & AD 筆記。

🌐 網站：<https://neoisbackagain.github.io/cyber-blog/>
🛠️ 技術：[Hugo](https://gohugo.io/) + [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 主題（已大幅自訂），由 GitHub Actions 自動部署到 GitHub Pages。

---

## 目錄

1. [快速開始（本機預覽）](#1-快速開始本機預覽)
2. [寫文章的流程：Obsidian → Hugo](#2-寫文章的流程obsidian--hugo)
3. [文章屬性（front matter）](#3-文章屬性front-matter)
4. [Shortcodes：Tag、Toggle、HTB 卡片、Canvas](#4-shortcodestagtogglehtb-卡片canvas)
5. [置頂文章](#5-置頂文章)
6. [加密文章（密碼保護）⚠️ 必讀](#6-加密文章密碼保護️-必讀)
7. [圖片](#7-圖片)
8. [發佈上線](#8-發佈上線)
9. [專案結構：要改哪裡？](#9-專案結構要改哪裡)
10. [常見問題](#10-常見問題)

---

## 1. 快速開始（本機預覽）

需要：[Hugo](https://gohugo.io/installation/)（0.146 或以上）、Git、[Node.js](https://nodejs.org/)（加密文章才需要）。

```powershell
git clone https://github.com/NeoIsBackAgain/cyber-blog.git
cd cyber-blog
hugo server -D --disableFastRender
```

打開 <http://localhost:1313/cyber-blog/>，修改檔案後頁面會自動刷新。

- `-D` 會連草稿（`draft: true`）也顯示。
- 本機的普通版 Hugo 不能把圖片轉成 WebP，圖片會用原檔，這是正常的。GitHub Actions 用的是 **extended** 版，網上的版本會自動轉成 WebP。

---

## 2. 寫文章的流程：Obsidian → Hugo

文章**不是**直接在這個 repo 裡寫，而是在 Obsidian vault 裡寫，再用 Obsidian 社群插件 **Hugo Publish**（作者 kirito）同步過來。

```
Obsidian 筆記（有 blog tag）
        │  Ctrl + P → "Hugo Publish: sync"
        ▼
content/posts/…   ← 文章 .md
static/ob/…       ← 圖片、.canvas
        │  git commit + push
        ▼
GitHub Actions 自動 build → 網站更新
```

Hugo Publish 插件設定：

| 設定 | 值 | 說明 |
|---|---|---|
| `blog_tag` | `blog` | 只有帶 `blog` tag 的筆記會被同步 |
| `site_dir` | 這個 repo 的路徑 | 例如 `C:\Users\<你>\Documents\GitHub\` |
| `blog_dir` | `content\posts\` | 文章放的位置 |
| `static_dir` | `ob` | 圖片放在 `static/ob/` |
| `keep_list` | `.*\.md` | 沒有這個的話，插件會刪掉其他檔案 |

> ⚠️ **重要：Obsidian 才是「正本」。**
> 每次同步，插件都會用 vault 的版本**覆蓋** `content/posts/` 裡的文章。
> 所以要改文章內容（包括修正 tag 錯字），請**在 Obsidian 改**，不要直接改 `content/`，否則下次同步就會被改回去。

不用 Obsidian 的話，也可以直接新增 Markdown 檔：

```powershell
hugo new content/posts/my-new-post.md
```

---

## 3. 文章屬性（front matter）

每篇文章最上面的 `---` 區塊。在 Obsidian 裡就是「屬性 / Properties」。

```yaml
---
title: Signed
date: 2026-06-04
draft: false
ShowToc: true
TocOpen: true
pinned: false
isPrivate: false
tags:
  - blog
  - HTB
  - Windows
  - medium
  - Port1433-Mssql-Login
---
```

| 屬性 | 作用 |
|---|---|
| `title` | 標題 |
| `date` | 發佈日期，列表按這個排序（新的在前） |
| `draft` | `true` = 草稿，網上看不到 |
| `ShowToc` / `TocOpen` | 顯示左邊的目錄 / 預設展開 |
| `tags` | 標籤，決定文章出現在哪個列表頁，也用來畫知識地圖（見下表） |
| `pinned` | `true` = 置頂（見[第 5 節](#5-置頂文章)） |
| `isPrivate` | `true` = 隱藏文章底部的上一篇／下一篇和留言（**不會**隱藏內容） |
| `password` | 有值 = 加密文章（見[第 6 節](#6-加密文章密碼保護️-必讀)） |

### 標籤決定文章去哪裡

| 標籤 | 出現在 |
|---|---|
| `blog` | 必須有，Hugo Publish 才會同步 |
| `HTB` / `HackTheBox` | HTB Collection |
| `OffSec` / `PG` / `OSCP` | OffSec |
| `BugBounty` / `CVE` / `HackerOne` … | Bug Research |
| `note-windows` / `note-ad` | Windows & AD |
| `Misc` | Miscellaneous |
| 只有 `blog` 一個標籤 | Pending Review（待整理） |
| `easy` / `medium` / `hard` / `insane` | 難度標籤和知識地圖的顏色 |
| `linux` / `windows` | 作業系統標籤 |

其他標籤（例如 `Port1433-Mssql-Login`）是**技術標籤**：

- 會成為首頁 3D 知識地圖的節點，按領域分島（Web、AD、Windows、Linux…）。
- 會成為文章右邊 **Attack Path** 的步驟。

分類規則在 `static/js/kb-phases.js`，靠標籤名稱判斷，所以**命名要一致**，例如：`Port<號碼>-<服務>-<動作>`、`Linux-Privilege-Escalation-…`、`Windows-Privilege-Escalation-…`、`Bloodhound-Vector-…`。

---

## 4. Shortcodes：Tag、Toggle、HTB 卡片、Canvas

### Tag + Toggle（技術步驟）

```markdown
{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-Login" >}} 用 mssqlclient.py 登入目標

{{< /toggle >}}
```

- `tag` 產生一個可點擊的標籤，同時是錨點：Attack Path 點這一步就會跳到這裡。
- Attack Path 的**步驟順序 = 這些 `{{< tag >}}` 在文章裡出現的順序**。
- 這裡的文字也會成為搜尋結果的描述。

### HTB 機器卡片

```markdown
{{< htb-info "https://www.hackthebox.com/machines/signed" >}}
```

名稱從網址取得，難度和 OS 從文章的 tags 取得，build 時不會連網。可以手動補充：

```markdown
{{< htb-info url="https://www.hackthebox.com/machines/signed" difficulty="medium" os="windows" rating="4.5" released="2025" synopsis="…" >}}
```

### Obsidian Canvas

```markdown
{{< canvas "dLFFuRu6.canvas" >}}
```

檔案放在 `static/ob/Canvas/`，Hugo Publish 會自動處理。

其他 shortcodes：`mermaid`、`mindmap`、`tree`、`code`、`tech-stack`，在 `layouts/shortcodes/`。

---

## 5. 置頂文章

在屬性加：

```yaml
pinned: true
```

文章會在**首頁 Recent Activity**、各分類列表頁、`/posts/` 和標籤頁**排第一**，並在標題前顯示 📌。多篇置頂時按日期排序。取消：刪掉屬性或改成 `false`。

---

## 6. 加密文章（密碼保護）⚠️ 必讀

### 為甚麼需要特別處理？

這個 repo 是**公開的**。任何放在 `content/` 或 `static/` 的檔案，任何人都能在 GitHub 下載原檔。
所以「網頁上要求輸入密碼」本身**保護不了任何東西**。內容必須先**加密**，只有加密後的版本可以上傳。

### 運作方式

```
Obsidian 文章（有 password 屬性）
   │  Hugo Publish 同步 → content/ 裡的明文（只在你電腦上）
   ▼
git commit 時自動執行 tools/encrypt-private.mjs（pre-commit hook）
   │  1. 把明文文章和只有它用到的圖片搬到 private/（不會上傳）
   │  2. 用 Hugo 生成完整頁面，把圖片嵌入，用 AES-256-GCM 加密
   │     （金鑰 = PBKDF2-SHA256(密碼)，60 萬輪）
   │  3. 寫入 static/enc/<id>.json（加密檔）
   │     和 content/…/<文章>.md（只有標題、日期、tags 的空殼）
   ▼
上傳到 GitHub 的只有：空殼 + 加密檔。沒有內容、沒有密碼、沒有截圖。
讀者在網頁輸入密碼 → 瀏覽器解密 → 顯示完整文章
```

### 第一次設定（每台電腦做一次）

```powershell
cd <repo 路徑>
node tools/encrypt-private.mjs --install-hook
```

看到 `Installed .git/hooks/pre-commit` 就完成了。之後每次 commit（指令或 GitHub Desktop 都一樣）都會自動加密。

### 平時怎樣用

1. 在 Obsidian 文章屬性加上 `password: 你的密碼`
2. Hugo Publish 同步
3. 照常 `git commit` + `git push`，hook 會自動處理

想不 commit 只預覽加密結果：

```powershell
node tools/encrypt-private.mjs
```

### 安全保護（多重保險）

| 情況 | 結果 |
|---|---|
| commit 時仍有明文密碼文章被 stage | hook **拒絕 commit**：`encrypt-private: commit aborted` |
| 明文密碼文章去到 GitHub Actions | build **失敗**，不會發佈 |
| 本機 `hugo server` 看到明文密碼文章 | 只顯示警告，方便你本機預覽 |

### ❌ 絕對不要

- 不要 commit `private/`（已在 `.gitignore`，不要強行 `git add -f`）
- 不要在 GitHub 網頁上直接上傳有 `password` 的文章
- 不要把密碼寫在文章內文或其他公開檔案裡

### 修改密碼

在 Obsidian 改 `password:` → 同步 → commit。工具會偵測到改動並重新加密。

> 注意：2026-11 之前，加密文章的明文仍然留在 **git 歷史**裡。要徹底清除需要改寫歷史（`git filter-repo` + force push），這個操作無法還原，要另外處理。

---

## 7. 圖片

**用 Obsidian 的話**：直接貼圖（`Ctrl + V`），Hugo Publish 會把圖片放到 `static/ob/` 並改好連結。

**手動的話**：

1. 把圖片放進 `static/ob/`
2. 在 Markdown 引用（路徑以 `/` 開頭，**不用**寫 `/cyber-blog`）：

```markdown
![說明文字](/ob/my-image.png)
```

圖片會自動：

- **延遲載入**（lazy loading）
- 加上寬高，避免載入時頁面跳動
- 在 GitHub Actions 上轉成 **WebP**，最大寬度 1600px，檔案小很多

> ⚠️ GitHub Pages 的**檔名分大小寫**：`Misc.png` 和 `misc.png` 是兩個不同的檔案。Windows 本機看起來正常，上線後卻可能壞圖。

---

## 8. 發佈上線

```powershell
git add .
git commit -m "Add Signed writeup"
git push origin main
```

push 到 `main` 後，GitHub Actions 會自動 build 並部署，約 1–3 分鐘後上線。進度在 GitHub repo 的 **Actions** 分頁。

> 注意：`.github/workflows/` 目前有**兩個**部署 workflow（`deploy.yml` 用 Hugo 0.146、`hugo.yaml` 用 0.152），每次 push 會跑兩次，互相覆蓋。建議只保留一個（`hugo.yaml` 有圖片快取，build 較快）。

---

## 9. 專案結構：要改哪裡？

```
├── content/posts/            文章（由 Obsidian 同步，不要直接改）
├── static/
│   ├── ob/                   文章圖片、canvas（由 Obsidian 同步）
│   ├── enc/                  加密文章（由 encrypt-private.mjs 產生）
│   ├── css/redesign.css      ⭐ 全站外觀（顏色、深淺色模式、手機版）
│   ├── js/kb-phases.js       ⭐ 技術標籤的分類規則（知識地圖、Attack Path）
│   ├── js/local-graph.js     文章右邊的 Attack Path
│   ├── js/site-search.js     搜尋引擎（多關鍵字、容錯）
│   └── images/               分類頁的圖示
├── layouts/                  覆蓋主題的模板
│   ├── partials/
│   │   ├── index_profile.html    首頁（卡片、搜尋、3D 知識地圖、Recent Activity）
│   │   ├── header.html / footer.html
│   │   ├── extend_head.html      載入 CSS/JS、Attack Path 資料
│   │   └── password-protect.html 加密文章的解鎖框
│   ├── _default/                 HTB / OffSec 列表頁、圖片處理
│   ├── bugbounty/ windows/ miscellaneous/ Pending_review/   各分類列表頁
│   └── shortcodes/               tag、toggle、htb-info、canvas…
├── tools/encrypt-private.mjs  加密工具（見第 6 節）
├── private/                   🔒 加密文章的明文（不會上傳）
├── themes/PaperMod/           主題（已修改，直接放在 repo 裡）
└── hugo.toml                  網站設定
```

### 常見修改

| 想改… | 去這裡 |
|---|---|
| 顏色、間距、深淺色模式 | `static/css/redesign.css`（淺色模式在 `LIGHT MODE` 區塊） |
| 預設深色或淺色 | `hugo.toml` → `defaultTheme = "light"` 或 `"dark"` |
| 技術標籤分到哪個領域／階段 | `static/js/kb-phases.js` |
| 頂部選單 | `hugo.toml` → `[[menu.main]]` |
| 首頁卡片 | `layouts/partials/index_profile.html` |

---

## 10. 常見問題

**頁面沒有樣式（只有藍色連結和黑字）**
可能開了兩個 `hugo server`，頁面連到另一個 port。關掉全部 Hugo，再開一次 `hugo server -D`。

**改了 CSS 但看不到變化**
按 `Ctrl + F5` 強制刷新。（CSS 連結已加上版本號，正常刷新通常也可以。）

**我修正的錯字 / 內容又變回原樣**
Hugo Publish 用 Obsidian 的版本覆蓋了。請在 Obsidian 修改（見[第 2 節](#2-寫文章的流程obsidian--hugo)）。

**Build 失敗：`has a password but is not encrypted yet`**
有一篇有 `password` 的文章還沒加密。執行 `node tools/encrypt-private.mjs`，再 commit。

**commit 失敗：`encrypt-private: commit aborted`**
看上面的錯誤訊息。通常是 Node.js 未安裝，或文章的 `password` 是空的。

**加密文章輸入正確密碼也打不開**
密碼改了但沒重新加密：同步後再 commit 一次（或執行 `node tools/encrypt-private.mjs`）。

**Hugo server 崩潰（`panic: index out of range`）**
Hugo Publish 一次改動大量檔案時，Hugo 的檔案監察偶爾會崩潰。重新執行 `hugo server` 就可以。

---

## 參考資料

- [Hugo 文件](https://gohugo.io/documentation/)
- [PaperMod 主題 Wiki](https://github.com/adityatelange/hugo-PaperMod/wiki)
- [obsidian-to-hugo](https://github.com/devidw/obsidian-to-hugo)（另一個 Obsidian → Hugo 轉換工具，`pip install obsidian-to-hugo`）
- [htb-api](https://github.com/0xdf223/htb-api)（HackTheBox API 參考）
