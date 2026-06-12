---
title: hugo neoisbackagain setting
date: 2025-11-06T13:51:41+08:00
draft: false
ShowToc: true
TocOpen: true
tags:
  - blog
  - Misc
lastmod: 2026-06-11T07:05:25.803Z
---
> If you finding a way that you write the note or blog in the obsidian , and everything will automatically upload to online , here is the answer

***

# Obsidian sync to hugo

![Pasted image 20251231105929.png](/ob/Pasted%20image%2020251231105929.png)

obsidian will use the obsidian extension of hugo Publich to automatically send the picture and .md file in you hugo file and place into the correct place , and we will have the timer to automatically upload to Github  at the end of the  week

### obsidian Config

The site dir please config to you file path , in here is C:\User\myname\Desktop\my-blog\
The blog dir is where you put the md file place\
The static dir is http://127.0.0.1:1313/ob/image.png to show your file\
`.*\.md` --> if dont have the option , the plugin will delete other file

![Pasted image 20260207052930.png](/ob/Pasted%20image%2020260207052930.png)

### the hugo.toml config

```
baseURL = "https://neoisbackagain.github.io/cyber-blog/"
languageCode = 'en-us'
title = 'neoisbackagain'
theme = "PaperMod"
relativeURLs = false
canonifyURLs = true

# === 👇 新增這一段，這是修復 404 的關鍵！ ===
[outputs]
  home = ["HTML", "RSS", "JSON"]
# ===========================================

[params.assets]
  css = ["css/extended/custom.css"]

[params]
  defaultTheme = "dark"
  disableThemeToggle = true
  
  # --- 搜尋引擎權重設定 (Fuse.js) ---
  [params.fuseOpts]
    isCaseSensitive = false
    shouldSort = true
    location = 0
    distance = 1000
    threshold = 0.4
    minMatchCharLength = 0
    keys = ["title", "tips", "summary", "content"]

  # --- Profile Mode ---
  [params.profileMode]
    enabled = true
    title = "NeoIsBackAgain"
    subtitle = "Certified Ethical Hacker | Offensive Security Engineer"
    imageUrl = "https://www.hackthebox.eu/badge/image/YOUR_HTB_ID_HERE" 
    imageTitle = "My Avatar"
    imageWidth = 150
    imageHeight = 150

    [[params.profileMode.buttons]]
        name = "HTB Writeups"
        url = "/cyber-blog/htb/"

    [[params.profileMode.buttons]]
        name = "About Me"
        url = "/cyber-blog/posts/About_Me/"

    [[params.profileMode.buttons]]
        name = "GitHub"
        url = "https://github.com/NeolsBackAgain"

[[menu.main]]
  name = "Home"
  url = "/cyber-blog"
  weight = 1

[[menu.main]]
  name = "About Me"
  url = "/cyber-blog/posts/About_Me/"
  weight = 10
```

***

### Obsidain note

```
---
title: Add the post to hugo by obsidian
date: 2025-11-06T13:51:41+08:00
draft: false
ShowToc: true
TocOpen: true
tags:
  - blog
---
```

obsidian ctrl + p hugo sync

```
hugo server -D --ignoreCache
```

cmd + p\
![Pasted image 20260207053407.png](/ob/Pasted%20image%2020260207053407.png)

***

# Github Setting Windows

```
winget install --id Git.Git -e --source winget
```

```
setx PATH "$($env:Path);C:\Program Files\Git\cmd"
```

```
ssh-keygen -t ed25519 -C "ngmantsung0624@gmail.com"
```

to-do done

# Github Setting Mac

To-do done

# Tags system

### toc.css

`themes\PaperMod\assets\css\extended\toc.css`

```
/* =========================================

   ACCORDION TOC (Heavy Duty Fix)

   ========================================= */

  

:root {

    --toc-width: 250px;

    --toc-blue: #5c9bf5;      /* 0xdf Blue */

    --toc-border: #444;       /* Guideline Grey */

    --toc-text-main: #e0e0e0; /* Bright Text */

    --toc-text-sub: #999;     /* Dim Text */

}

  

/* 1. CONTAINER (Fixed Left) */

.toc-container.wide {

    position: fixed !important;

    left: 130px !important;

    top: 100px !important;

    width: var(--toc-width) !important;

    height: calc(100vh - 120px);

    overflow-y: auto;

    scrollbar-width: none; /* Hide scrollbar */

    z-index: 100;

}

  

/* Reset default theme styles */

.wide .toc { background: unset; border: unset; margin: 0; padding: 0; }

.toc ul { list-style: none; padding: 0; margin: 0; }

.toc .inner { margin: 0; padding: 0; }

  

/* 2. MAIN HEADERS (Level 1 & 2) - Always Visible */

/* We target the top-level links to ensure they are always there */

.toc .inner > ul > li > a {

    font-weight: 700;

    font-size: 0.95rem;

    color: var(--toc-text-main);

    padding: 10px 0 8px 10px;

    display: block;

    text-decoration: none;

    border-left: 3px solid transparent;

}

  

/* 3. SUB-MENUS (Hidden by Default) */

/* This hides ALL lists that are inside other lists */

.toc ul ul {

    display: none;

}

  

/* 4. FORCE OPEN LOGIC (The Fix) */

/* If an LI is active, show its immediate UL child */

.toc li.active-parent > ul {

    display: block !important;

    animation: fadeIn 0.3s ease;

}

  

/* !!! DOUBLE NESTING FIX !!! */

/* This forces the second invisible UL to open if Hugo generated a double layer */

.toc li.active-parent > ul > ul {

    display: block !important;

    padding-left: 0; /* Reset padding to avoid huge indent */

}

  

@keyframes fadeIn {

    from { opacity: 0; transform: translateY(-5px); }

    to { opacity: 1; transform: translateY(0); }

}

  

/* 5. SUB-ITEM STYLING */

.toc ul ul li a {

    font-size: 0.85rem;

    color: var(--toc-text-sub);

    padding: 5px 0 5px 15px;

    display: block;

    text-decoration: none;

    transition: color 0.2s;

    border-left: 3px solid transparent;

    /* Add the vertical guideline */

    border-left: 1px solid var(--toc-border);

    margin-left: 10px;

}

  

/* 6. ACTIVE STATES */

/* Text Highlight */

.toc a.active {

    color: var(--toc-blue) !important;

    font-weight: 600;

}

  

/* Blue Border Indicator */

.toc a.active {

    border-left: 3px solid var(--toc-blue) !important;

    background: linear-gradient(90deg, rgba(92, 155, 245, 0.1), transparent);

}

  

/* Misc */

.toc details summary::-webkit-details-marker { display: none; }

.toc details summary { cursor: pointer; font-weight: bold; color: #777; margin-bottom: 10px; }

.paginav { margin-bottom: 45px; }

h1 { color: #FF69B4; }

h2 { color: #9370DB; }

h3, h4, h5, h6 { color: #1e90ff; }

body { font-family: 'PT Sans', sans-serif; line-height: 1.6; margin: 0; }

.footer-powered-by { display: none !important; }

```

`themes\PaperMod\assets\js\toc.js`

### toc.js

```
window.addEventListener('DOMContentLoaded', function () {

  const toc = document.querySelector(".toc");

  if (!toc) return;

  

  const tocLinks = toc.querySelectorAll("a");

  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

  

  // --- 1. Helper: Find Link by ID (Safe for Special Chars) ---

  function getLinkByHeading(heading) {

    const id = heading.id;

    if (!id) return null;

    // Compare href attributes directly to avoid querySelector errors with ".", ":", etc.

    for (const link of tocLinks) {

      const href = link.getAttribute("href");

      if (href === `#${id}` || href === `#${encodeURIComponent(id)}`) {

        return link;

      }

    }

    return null;

  }

  

  // --- 2. Action: Set Active Path & Accordion ---

  function setActive(link) {

    if (!link) return;

  

    // A. Clear previous active states

    // This is what causes the "Collapse" effect for non-active items

    toc.querySelectorAll(".active").forEach(el => el.classList.remove("active"));

    toc.querySelectorAll(".active-parent").forEach(el => el.classList.remove("active-parent"));

  

    // B. Activate the current link

    link.classList.add("active");

  

    // C. Walk UP the tree and open parents

    // We add 'active-parent' to the LI, which your CSS uses to show the nested UL

    let parent = link.closest("li");

    while (parent) {

      parent.classList.add("active-parent");

      // Move to the next parent LI

      // We have to skip the UL to find the grandparent LI

      const parentUl = parent.closest("ul");

      if (parentUl && parentUl.parentElement) {

        parent = parentUl.parentElement.closest("li");

        // Stop if we went too far (outside TOC)

        if (parent && !toc.contains(parent)) parent = null;

      } else {

        parent = null;

      }

    }

  }

  

  // --- 3. Initial State: Expand All First ---

  // Per your request: "Assume it all expand first"

  // We manually add the class to ALL parents so everything is visible on load/refresh.

  function expandAll() {

    toc.querySelectorAll("li").forEach(li => {

      if (li.querySelector("ul")) {

        li.classList.add("active-parent");

      }

    });

    // Ensure the main <details> is open if it exists

    const rootDetails = toc.querySelector("details");

    if (rootDetails) rootDetails.open = true;

  }

  

  // Run immediately

  expandAll();

  
  

  // --- 4. IntersectionObserver (Live Updates) ---

  const observer = new IntersectionObserver(

    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          const heading = entry.target;

          const link = getLinkByHeading(heading);

          if (link) {

            // Once we scroll and hit a heading, we switch to Accordion mode

            // (The setActive function automatically closes unrelated paths)

            setActive(link);

          }

        }

      });

    },

    {

      // Trigger when heading is near top of screen

      rootMargin: "0px 0px -70% 0px",

      threshold: 0

    }

  );

  

  headings.forEach((h) => observer.observe(h));

  
  

  // --- 5. Manual Sync (Fix for Refresh / Hash Links) ---

  // If the URL has #recon, we want to jump straight to that state

  setTimeout(() => {

    if (window.location.hash) {

      const id = window.location.hash.substring(1); // Remove #

      // Find heading by ID (handling encoding)

      let targetHeading = document.getElementById(id) || document.getElementById(decodeURIComponent(id));

      if (targetHeading) {

        const link = getLinkByHeading(targetHeading);

        if (link) setActive(link);

      }

    }

  }, 100);

  

  // --- 6. Width/Resize Logic (Preserved) ---

  const main_width = parseInt(getComputedStyle(document.body).getPropertyValue('--main-width') || 800, 10);

  const toc_width = parseInt(getComputedStyle(document.body).getPropertyValue('--toc-width') || 250, 10);

  const gap = parseInt(getComputedStyle(document.body).getPropertyValue('--gap') || 20, 10);

  const post = document.querySelector('article.post-single .post-content');

  

  function checkTocPosition() {

    const tocContainer = document.querySelector(".toc-container");

    if (!post || !tocContainer) return;

  

    const width = document.body.scrollWidth;

    // Just setting the class; CSS handles the fixed position

    if (width - main_width - (toc_width * 2) - (gap * 4) > 0) {

      tocContainer.classList.add("wide");

    } else {

      tocContainer.classList.remove("wide");

    }

  }

  

  checkTocPosition();

  window.addEventListener('resize', checkTocPosition);

});
```

### tags.html

`layouts\shortcodes\tags.html`

```
<div class="post-tags-inline">

    <strong>Tags:</strong>

    {{ range .Page.Params.tags }}

    <a href="{{ "/tags/" | relLangURL }}{{ . | urlize }}">{{ . }}</a>

    {{ end }}

</div>
```

### tag.html

`layouts\shortcodes\tag.html`

```
<a id="{{ .Get 0 | urlize }}" class="tag-button" href="{{ "/tags/" | relLangURL }}{{ .Get 0 | urlize }}">

    #{{ .Get 0 }}

</a>
```

# search system

### hugo.toml

`hugo.toml`

```
baseURL = "https://neoisbackagain.github.io/cyber-blog/"
languageCode = 'en-us'
title = 'neoisbackagain'
theme = "PaperMod"
relativeURLs = false
canonifyURLs = true

# === 👇 新增這一段，這是修復 404 的關鍵！ ===
[outputs]
  home = ["HTML", "RSS", "JSON"]
# ===========================================

[params.assets]
  css = ["css/extended/custom.css"]

[params]
  defaultTheme = "dark"
  disableThemeToggle = true
  
  # --- 搜尋引擎權重設定 (Fuse.js) ---
  [params.fuseOpts]
    isCaseSensitive = false
    shouldSort = true
    location = 0
    distance = 1000
    threshold = 0.4
    minMatchCharLength = 0
    keys = ["title", "tips", "summary", "content"]

  # --- Profile Mode ---
  [params.profileMode]
    enabled = true
    title = "NeoIsBackAgain"
    subtitle = "Certified Ethical Hacker | Offensive Security Engineer"
    imageUrl = "https://www.hackthebox.eu/badge/image/YOUR_HTB_ID_HERE" 
    imageTitle = "My Avatar"
    imageWidth = 150
    imageHeight = 150

    [[params.profileMode.buttons]]
        name = "HTB Writeups"
        url = "/cyber-blog/htb/"

    [[params.profileMode.buttons]]
        name = "About Me"
        url = "/cyber-blog/posts/About_Me/"

    [[params.profileMode.buttons]]
        name = "GitHub"
        url = "https://github.com/NeolsBackAgain"

[[menu.main]]
  name = "Home"
  url = "/cyber-blog"
  weight = 1

[[menu.main]]
  name = "About Me"
  url = "/cyber-blog/posts/About_Me/"
  weight = 10
```

`layouts\_default\index.json`

```
{{- $index := slice -}}
{{- range site.RegularPages -}}
    {{- $tips := "" -}}
    
    {{- /* 1. Extract Smart Tips */ -}}
    {{- /* Match the full block */ -}}
    {{- $matches := findRE "(?s)\\{\\{< tag \".*?\" >\\}\\}.*?\\{\\{< /toggle >\\}\\}" .RawContent -}}
    
    {{- range $matches -}}
        {{- /* Replace the scary shortcode syntax with a unique separator (like " ::: ") 
           or just spaces so "tagname" sits right next to "content"
        */ -}}
        {{- $clean := . | replaceRE "(?s)\\{\\{< tag \"(.*?)\" >\\}\\}" "$1 ::: " | replaceRE "\\{\\{< /toggle >\\}\\}" " ||| " -}}
        {{- $tips = printf "%s%s" $tips $clean -}}
    {{- end -}}

    {{- $item := dict 
        "title" .Title 
        "summary" .Summary 
        "permalink" .Permalink 
        "tips" $tips  
        "tags" (default slice .Params.tags) 
    -}}
    
    {{- $index = $index | append $item -}}
{{- end -}}
{{- $index | jsonify -}}
```

### index\_profile.html

`layouts\partials\index_profile.html`

```
<div class="home-dashboard">

  

    <!-- <div class="dash-profile">

        {{- if site.Params.profileMode.imageUrl }}

        <img src="{{ site.Params.profileMode.imageUrl }}" alt="avatar" class="dash-avatar">

        {{- end }}

        <h1 class="profile-title">{{ site.Title }}</h1>

        <p>{{ site.Params.profileMode.subtitle }}</p>

    </div> -->

  

    <div class="dash-search">

        <div class="search-input-wrapper">

            <span class="search-icon">

                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>

            </span>

            <input id="home-search-input" type="text" placeholder="Search boxes, tags, or cves..." autocomplete="off" />        </div>

        <ul id="home-search-results" class="search-results-dropdown"></ul>

  

<style>

            /* --- 樣式表 (CSS) --- */

  

            /* 標題樣式 */

            .profile-title {

                font-size: 2.8rem;

                font-weight: 800;

                margin-bottom: 15px;

                letter-spacing: 1px;

                background: linear-gradient(135deg, #fff 30%, #1e90ff 100%);

                -webkit-background-clip: text;

                -webkit-text-fill-color: transparent;

                color: #fff;

                text-shadow: 0 0 30px rgba(30, 144, 255, 0.3);

            }

  

            /* 容器樣式 */

            .dash-search {

                width: 100%;

                max-width: 850px;

                /* [修改點] 這裡增加了 40px 的下方邊距，您可以根據喜好調整這個數字 */

                margin: 0 auto 40px auto;

                position: relative;

                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

            }

  

            /* 輸入框樣式 */

            .search-input-wrapper {

                background: #0f0f0f;

                border: 1px solid #333;

                border-radius: 12px;

                display: flex;

                align-items: center;

                padding: 12px 20px;

                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);

                transition: all 0.2s ease;

            }

  

            .search-input-wrapper:focus-within {

                border-color: #1e90ff;

                box-shadow: 0 0 0 1px rgba(30, 144, 255, 0.5), 0 0 30px rgba(30, 144, 255, 0.1);

            }

  

            .search-icon {

                color: #555;

                margin-right: 15px;

                display: flex;

            }

  

            #home-search-input {

                width: 100%;

                background: transparent;

                border: none;

                color: #fff;

                font-size: 1.1rem;

                outline: none;

            }

            #home-search-input::placeholder {

                color: #444;

            }

  

            .cmd-hint {

                background: #1a1a1a;

                color: #666;

                padding: 4px 8px;

                border-radius: 6px;

                font-size: 0.75rem;

                font-weight: 600;

                border: 1px solid #333;

            }

  

            /* 下拉選單結果 */

            .search-results-dropdown {

                display: none;

                position: absolute;

                top: 70px;

                left: 0;

                right: 0;

                background-color: #0f0f0f;

                border: 1px solid #333;

                border-radius: 12px;

                padding: 0;

                list-style: none;

                z-index: 99999 !important;

                box-shadow: 0 30px 80px rgba(0,0,0,0.9);

                max-height: 500px;

                overflow-y: auto;  

                scrollbar-width: thin;

                scrollbar-color: #444 #0f0f0f;

            }

  

            /* 單個結果項目 */

            .search-result-item {

                border-bottom: 1px solid #1a1a1a;

            }

            .search-result-item:last-child {

                border-bottom: none;

            }

  

            .search-result-link {

                display: flex;

                flex-direction: column;

                padding: 16px 22px;

                text-decoration: none;

                transition: background 0.1s ease;

                border-left: 3px solid transparent;

            }

  

            .search-result-link:hover {

                background: #141414;

                border-left-color: #1e90ff;

            }

  

            /* 結果標頭 (圖標 + 標題 + 標籤) */

            .result-header {

                display: flex;

                justify-content: space-between;

                align-items: flex-start; /* 讓標題保持在頂部 */

                margin-bottom: 8px;

            }

  

            .result-title-group {

                display: flex;

                align-items: center;

                gap: 12px;

                flex-shrink: 0;

            }

  

            .result-icon svg {

                stroke: #444;

                transition: stroke 0.2s;

            }

            .search-result-link:hover .result-icon svg {

                stroke: #1e90ff;

            }

  

            .result-title {

                color: #eee;

                font-weight: 700;

                font-size: 1.05rem;

                letter-spacing: 0.3px;

            }

            .search-result-link:hover .result-title {

                color: #fff;

            }

  

            /* 標籤徽章容器 */

            .result-badges {

                display: flex;

                justify-content: flex-end;

            }

  

            /* 標籤徽章樣式 */

            .tag-badge {

                background: rgba(255, 105, 180, 0.1);

                color: #FF69B4;

                font-family: 'Consolas', monospace;

                font-size: 0.75rem;

                font-weight: 700;

                text-transform: uppercase;

                letter-spacing: 0.5px;

                padding: 4px 10px;

                border-radius: 50px;

                border: 1px solid rgba(255, 105, 180, 0.25);

                white-space: nowrap;

                box-shadow: 0 0 10px rgba(255, 105, 180, 0.1);

            }

  

            /* 描述文字樣式 */

            .result-desc {

                color: #888;

                font-size: 0.9rem;

                line-height: 1.6;

                margin-left: 32px;

                display: -webkit-box;

                -webkit-line-clamp: 2;

                -webkit-box-orient: vertical;

                overflow: hidden;

            }

            .search-result-link:hover .result-desc {

                color: #aaa;

            }

  

        </style>

  

        <script src="https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js"></script>

  

        <script>

            document.addEventListener('DOMContentLoaded', function() {

                var fuse;

                var searchInput = document.getElementById('home-search-input');

                var resultsList = document.getElementById('home-search-results');

  

                function slugify(text) {

                    return text.toString().toLowerCase().trim().replace(/&/g, '-and-').replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');

                }

  

                function stripHtml(html) {

                    let tmp = document.createElement("DIV");

                    tmp.innerHTML = html;

                    return tmp.textContent || tmp.innerText || "";

                }

  

                // 核心函式：根據標籤提取智能描述 (Get Smart Description)

                function getSmartDescription(sourceText, targetTag, rawSummary) {

                    let description = "";

                    if (targetTag && sourceText) {

                        // 策略 A: 分割符 ::: (Smart Tips)

                        if (sourceText.includes(":::")) {

                            let parts = sourceText.split("|||");

                            for (let part of parts) {

                                let separatorIndex = part.indexOf(":::");

                                if (separatorIndex !== -1) {

                                    let currentTagName = part.substring(0, separatorIndex).trim();

                                    let currentDesc = part.substring(separatorIndex + 3).trim();

                                    // 精準匹配當前的目標標籤

                                    if (currentTagName.toLowerCase() === targetTag.toLowerCase()) {

                                        description = "👉 " + currentDesc.substring(0, 180);

                                        if (currentDesc.length > 180) description += "...";

                                        return description;

                                    }

                                }

                            }

                        }

                        // 策略 B: 簡單匹配 (Fallback Regex)

                        if (!description && sourceText.toLowerCase().includes(targetTag.toLowerCase())) {

                             let fallbackIndex = sourceText.toLowerCase().indexOf(targetTag.toLowerCase());

                             if (fallbackIndex !== -1) {

                                 let start = fallbackIndex + targetTag.length;

                                 let rawSlice = sourceText.substring(start).trim().replace(/^[:\-\.]+\s*/, '');

                                 if (rawSlice.length > 5) {

                                     let stopIndex = rawSlice.indexOf("|||");

                                     if (stopIndex !== -1) rawSlice = rawSlice.substring(0, stopIndex);

                                     description = "👉 " + rawSlice.substring(0, 180);

                                     return description;

                                 }

                             }

                        }

                    }

                    // 策略 C: 使用預設摘要 (如果找不到特定標籤描述)

                    if (!description || description.trim() === "") {

                        let cleanSummary = rawSummary.replace(/^Box Info\s*/i, '').replace(/^Pasted image\s.*/i, '');

                        if (cleanSummary.length > 5) description = cleanSummary.substring(0, 180);

                    }

                    return description;

                }

  

                fetch('{{ "index.json" | absURL }}?v=' + new Date().getTime())

                    .then(res => res.ok ? res.text() : Promise.reject(res.status))

                    .then(text => {

                        const start = text.indexOf('[');

                        const end = text.lastIndexOf(']') + 1;

                        if (start === -1 || end === -1) return [];

                        return JSON.parse(text.substring(start, end));

                    })

                    .then(data => {

                        var options = {

                            isCaseSensitive: false, shouldSort: true, minMatchCharLength: 2, threshold: 0.25, ignoreLocation: true,

                            keys: [ { name: "tags", weight: 3.0 }, { name: "title", weight: 2.0 }, { name: "tips", weight: 1.0 }, { name: "content", weight: 0.5 }, { name: "summary", weight: 0.4 } ]

                        };

                        fuse = new Fuse(data, options);

                        console.log("✅ Search Ready. Items:", data.length);

                    })

                    .catch(err => console.error("❌ Search Error:", err));

  

                searchInput.addEventListener('input', function(e) { runSearch(this.value.trim()); });

  

                function runSearch(term) {

                    if (!fuse || term.length < 2) {

                        resultsList.style.display = 'none';

                        return;

                    }

  

                    var results = fuse.search(term);

                    var resultsHTML = '';

                    if (results.length > 0) {

                        results.forEach(function (value) {

                            let item = value.item;

                            let sourceText = item.tips || item.content || "";

                            let rawSummary = stripHtml(item.summary || "");

  

                            // 1. 找出所有匹配的標籤 (MATCHING TAGS)

                            let matchingTags = [];

                            if (item.tags) {

                                matchingTags = item.tags.filter(t => t.toLowerCase().includes(term.toLowerCase()));

                            }

  

                            // 2. 渲染邏輯：結果拆分 (EXPLODE RESULTS)

                            // 情況 A: 如果有匹配到標籤，每一個標籤生成獨立的一行 (Result Exploding)

                            if (matchingTags.length > 0) {

                                matchingTags.forEach(tag => {

                                    // 針對這個特定的標籤 (tag) 獲取描述

                                    let description = getSmartDescription(sourceText, tag, rawSummary);

                                    // 生成特定的錨點連結 (例如 /posts/shibuya/#smb-description)

                                    let destinationUrl = item.permalink + "#" + slugify(tag);

  

                                    resultsHTML += `

                                    <li class="search-result-item">

                                        <a href="${destinationUrl}" class="search-result-link">

                                            <div class="result-header">

                                                <div class="result-title-group">

                                                    <div class="result-icon">

                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>

                                                    </div>

                                                    <div class="result-title">${item.title}</div>

                                                </div>

                                                <div class="result-badges">

                                                    <div class="tag-badge">${tag}</div>

                                                </div>

                                            </div>

                                            <div class="result-desc">${description}</div>

                                        </a>

                                    </li>`;

                                });

                            }

                            // 情況 B: 沒有匹配到標籤 (可能是匹配到標題或內文)，只顯示一行，不帶標籤

                            else {

                                // 使用通用摘要

                                let description = getSmartDescription(sourceText, "", rawSummary);

                                resultsHTML += `

                                <li class="search-result-item">

                                    <a href="${item.permalink}" class="search-result-link">

                                        <div class="result-header">

                                            <div class="result-title-group">

                                                <div class="result-icon">

                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>

                                                </div>

                                                <div class="result-title">${item.title}</div>

                                            </div>

                                            </div>

                                        <div class="result-desc">${description}</div>

                                    </a>

                                </li>`;

                            }

                        });

                        resultsList.innerHTML = resultsHTML;

                        resultsList.style.display = 'block';

                    } else {

                        resultsList.style.display = 'none';

                    }

                }

  

                document.addEventListener('click', function(e) {

                    if (!document.querySelector('.dash-search').contains(e.target)) { resultsList.style.display = 'none'; }

                });

            });

        </script>

    </div>

    <div class="dash-grid">

        <a href="{{ "htb/" | absURL }}" class="dash-card htb">

            <div class="card-icon"><img src="{{ "ob/htb.gif" | absURL }}" alt="HTB" class="dash-icon-img"></div>

            <h3>HTB Collection</h3><span>HackTheBox Writeups</span>

        </a>

        <a href="{{ "offsec/" | absURL }}" class="dash-card offsec">

            <div class="card-icon"><img src="{{ "ob/offsec.png" | absURL }}" alt="Offsec" class="dash-icon-img"></div>

            <h3>OffSec</h3><span>Exam & Labs</span>

        </a>

        <a href="{{ "bug-research/" | absURL }}" class="dash-card bug">

            <div class="card-icon"><img src="{{ "ob/BugBounty.png" | absURL }}" alt="Bug" class="dash-icon-img"></div>

            <h3>Bug Research</h3><span>CVEs & Findings</span>

        </a>

        <a href="{{ "misc/" | absURL }}" class="dash-card misc">

            <div class="card-icon"><img src="{{ "ob/misc.png" | absURL }}" alt="Misc" class="dash-icon-img"></div>

            <h3>Misc / 雜項</h3><span>Tools & Random</span>

        </a>

        <a href="{{ "tags/" | absURL }}" class="dash-card tags">

            <div class="card-icon"><img src="{{ "ob/tags.png" | absURL }}" alt="Tags" class="dash-icon-img"></div>

            <h3>All Tags</h3><span>Browse by Category</span>

        </a>

    </div>

  

    <div class="dash-recent">

        <h2>🔥 Recent Activity</h2>

        <div class="recent-list">

            {{ $pages := where .Site.RegularPages "Type" "in" site.Params.mainSections }}

            {{ range first 5 $pages }}

            <div class="recent-item">

                <span class="date">{{ .Date.Format "Jan 02" }}</span>

                <a href="{{ .Permalink }}" class="title">{{ .Title }}</a>

                <span class="read-time">{{ .ReadingTime }} min read</span>

            </div>

            {{ end }}

        </div>

        <div class="more-btn-container">

            <a href="{{ "posts/" | absURL }}" class="btn-more">View Archive →</a>

        </div>

    </div>

</div>
```

# blog system

### toc

`themes\PaperMod\assets\js\toc.js`

```
window.addEventListener('DOMContentLoaded', function () {

  const toc = document.querySelector(".toc");

  if (!toc) return;

  

  const tocLinks = toc.querySelectorAll("a");

  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

  

  // --- 1. Helper: Find Link by ID (Safe for Special Chars) ---

  function getLinkByHeading(heading) {

    const id = heading.id;

    if (!id) return null;

    // Compare href attributes directly to avoid querySelector errors with ".", ":", etc.

    for (const link of tocLinks) {

      const href = link.getAttribute("href");

      if (href === `#${id}` || href === `#${encodeURIComponent(id)}`) {

        return link;

      }

    }

    return null;

  }

  

  // --- 2. Action: Set Active Path & Accordion ---

  function setActive(link) {

    if (!link) return;

  

    // A. Clear previous active states

    // This is what causes the "Collapse" effect for non-active items

    toc.querySelectorAll(".active").forEach(el => el.classList.remove("active"));

    toc.querySelectorAll(".active-parent").forEach(el => el.classList.remove("active-parent"));

  

    // B. Activate the current link

    link.classList.add("active");

  

    // C. Walk UP the tree and open parents

    // We add 'active-parent' to the LI, which your CSS uses to show the nested UL

    let parent = link.closest("li");

    while (parent) {

      parent.classList.add("active-parent");

      // Move to the next parent LI

      // We have to skip the UL to find the grandparent LI

      const parentUl = parent.closest("ul");

      if (parentUl && parentUl.parentElement) {

        parent = parentUl.parentElement.closest("li");

        // Stop if we went too far (outside TOC)

        if (parent && !toc.contains(parent)) parent = null;

      } else {

        parent = null;

      }

    }

  }

  

  // --- 3. Initial State: Expand All First ---

  // Per your request: "Assume it all expand first"

  // We manually add the class to ALL parents so everything is visible on load/refresh.

  function expandAll() {

    toc.querySelectorAll("li").forEach(li => {

      if (li.querySelector("ul")) {

        li.classList.add("active-parent");

      }

    });

    // Ensure the main <details> is open if it exists

    const rootDetails = toc.querySelector("details");

    if (rootDetails) rootDetails.open = true;

  }

  

  // Run immediately

  expandAll();

  
  

  // --- 4. IntersectionObserver (Live Updates) ---

  const observer = new IntersectionObserver(

    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          const heading = entry.target;

          const link = getLinkByHeading(heading);

          if (link) {

            // Once we scroll and hit a heading, we switch to Accordion mode

            // (The setActive function automatically closes unrelated paths)

            setActive(link);

          }

        }

      });

    },

    {

      // Trigger when heading is near top of screen

      rootMargin: "0px 0px -70% 0px",

      threshold: 0

    }

  );

  

  headings.forEach((h) => observer.observe(h));

  
  

  // --- 5. Manual Sync (Fix for Refresh / Hash Links) ---

  // If the URL has #recon, we want to jump straight to that state

  setTimeout(() => {

    if (window.location.hash) {

      const id = window.location.hash.substring(1); // Remove #

      // Find heading by ID (handling encoding)

      let targetHeading = document.getElementById(id) || document.getElementById(decodeURIComponent(id));

      if (targetHeading) {

        const link = getLinkByHeading(targetHeading);

        if (link) setActive(link);

      }

    }

  }, 100);

  

  // --- 6. Width/Resize Logic (Preserved) ---

  const main_width = parseInt(getComputedStyle(document.body).getPropertyValue('--main-width') || 800, 10);

  const toc_width = parseInt(getComputedStyle(document.body).getPropertyValue('--toc-width') || 250, 10);

  const gap = parseInt(getComputedStyle(document.body).getPropertyValue('--gap') || 20, 10);

  const post = document.querySelector('article.post-single .post-content');

  

  function checkTocPosition() {

    const tocContainer = document.querySelector(".toc-container");

    if (!post || !tocContainer) return;

  

    const width = document.body.scrollWidth;

    // Just setting the class; CSS handles the fixed position

    if (width - main_width - (toc_width * 2) - (gap * 4) > 0) {

      tocContainer.classList.add("wide");

    } else {

      tocContainer.classList.remove("wide");

    }

  }

  

  checkTocPosition();

  window.addEventListener('resize', checkTocPosition);

});
```

`themes\PaperMod\assets\css\extended\toc.css`

```
/* =========================================

   ACCORDION TOC (Heavy Duty Fix)

   ========================================= */

  

:root {

    --toc-width: 250px;

    --toc-blue: #5c9bf5;      /* 0xdf Blue */

    --toc-border: #444;       /* Guideline Grey */

    --toc-text-main: #e0e0e0; /* Bright Text */

    --toc-text-sub: #999;     /* Dim Text */

}

  

/* 1. CONTAINER (Fixed Left) */

.toc-container.wide {

    position: fixed !important;

    left: 130px !important;

    top: 100px !important;

    width: var(--toc-width) !important;

    height: calc(100vh - 120px);

    overflow-y: auto;

    scrollbar-width: none; /* Hide scrollbar */

    z-index: 100;

}

  

/* Reset default theme styles */

.wide .toc { background: unset; border: unset; margin: 0; padding: 0; }

.toc ul { list-style: none; padding: 0; margin: 0; }

.toc .inner { margin: 0; padding: 0; }

  

/* 2. MAIN HEADERS (Level 1 & 2) - Always Visible */

/* We target the top-level links to ensure they are always there */

.toc .inner > ul > li > a {

    font-weight: 700;

    font-size: 0.95rem;

    color: var(--toc-text-main);

    padding: 10px 0 8px 10px;

    display: block;

    text-decoration: none;

    border-left: 3px solid transparent;

}

  

/* 3. SUB-MENUS (Hidden by Default) */

/* This hides ALL lists that are inside other lists */

.toc ul ul {

    display: none;

}

  

/* 4. FORCE OPEN LOGIC (The Fix) */

/* If an LI is active, show its immediate UL child */

.toc li.active-parent > ul {

    display: block !important;

    animation: fadeIn 0.3s ease;

}

  

/* !!! DOUBLE NESTING FIX !!! */

/* This forces the second invisible UL to open if Hugo generated a double layer */

.toc li.active-parent > ul > ul {

    display: block !important;

    padding-left: 0; /* Reset padding to avoid huge indent */

}

  

@keyframes fadeIn {

    from { opacity: 0; transform: translateY(-5px); }

    to { opacity: 1; transform: translateY(0); }

}

  

/* 5. SUB-ITEM STYLING */

.toc ul ul li a {

    font-size: 0.85rem;

    color: var(--toc-text-sub);

    padding: 5px 0 5px 15px;

    display: block;

    text-decoration: none;

    transition: color 0.2s;

    border-left: 3px solid transparent;

    /* Add the vertical guideline */

    border-left: 1px solid var(--toc-border);

    margin-left: 10px;

}

  

/* 6. ACTIVE STATES */

/* Text Highlight */

.toc a.active {

    color: var(--toc-blue) !important;

    font-weight: 600;

}

  

/* Blue Border Indicator */

.toc a.active {

    border-left: 3px solid var(--toc-blue) !important;

    background: linear-gradient(90deg, rgba(92, 155, 245, 0.1), transparent);

}

  

/* Misc */

.toc details summary::-webkit-details-marker { display: none; }

.toc details summary { cursor: pointer; font-weight: bold; color: #777; margin-bottom: 10px; }

.paginav { margin-bottom: 45px; }

h1 { color: #FF69B4; }

h2 { color: #9370DB; }

h3, h4, h5, h6 { color: #1e90ff; }

body { font-family: 'PT Sans', sans-serif; line-height: 1.6; margin: 0; }

.footer-powered-by { display: none !important; }
```

`themes\PaperMod\layouts\partials\toc.html`

```
{{- $headers := findRE "<h[1-6].*?>(.|\n])+?</h[1-6]>" .Content -}}

{{- $has_headers := ge (len $headers) 1 -}}

{{- if $has_headers -}}

  

<aside id="toc-container" class="toc-container wide">

    <div class="toc">

        <details {{if (.Param "TocOpen") }} open{{ end }}>

            <summary accesskey="c" title="(Alt + C)">

                <span class="details">{{- i18n "toc" | default "Table of Contents" }}</span>

            </summary>

            <div class="inner">

                {{- $largest := 6 -}}

                {{- range $headers -}}

                {{- $headerLevel := index (findRE "[1-6]" . 1) 0 -}}

                {{- $headerLevel := len (seq $headerLevel) -}}

                {{- if lt $headerLevel $largest -}}

                {{- $largest = $headerLevel -}}

                {{- end -}}

                {{- end -}}

                {{- $firstHeaderLevel := len (seq (index (findRE "[1-6]" (index $headers 0) 1) 0)) -}}

                {{- $.Scratch.Set "bareul" slice -}}

                <ul>

                    {{- range seq (sub $firstHeaderLevel $largest) -}}

                    <ul>

                        {{- $.Scratch.Add "bareul" (sub (add $largest .) 1) -}}

                        {{- end -}}

                        {{- range $i, $header := $headers -}}

                        {{- $headerLevel := index (findRE "[1-6]" . 1) 0 -}}

                        {{- $headerLevel := len (seq $headerLevel) -}}

                        {{- $id := index (findRE "(id=\"(.*?)\")" $header 9) 0 }}

                        {{- $cleanedID := replace (replace $id "id=\"" "") "\"" "" }}

                        {{- $header := replaceRE "<h[1-6].*?>((.|\n])+?)</h[1-6]>" "$1" $header -}}

                        {{- if ne $i 0 -}}

                        {{- $prevHeaderLevel := index (findRE "[1-6]" (index $headers (sub $i 1)) 1) 0 -}}

                        {{- $prevHeaderLevel := len (seq $prevHeaderLevel) -}}

                        {{- if gt $headerLevel $prevHeaderLevel -}}

                        {{- range seq $prevHeaderLevel (sub $headerLevel 1) -}}

                        <ul>

                            {{- if ne $prevHeaderLevel . -}}

                            {{- $.Scratch.Add "bareul" . -}}

                            {{- end -}}

                            {{- end -}}

                            {{- else -}}

                            </li>

                            {{- if lt $headerLevel $prevHeaderLevel -}}

                            {{- range seq (sub $prevHeaderLevel 1) -1 $headerLevel -}}

                            {{- if in ($.Scratch.Get "bareul") . -}}

                        </ul>

                        {{- $tmp := $.Scratch.Get "bareul" -}}

                        {{- $.Scratch.Delete "bareul" -}}

                        {{- $.Scratch.Set "bareul" slice}}

                        {{- range seq (sub (len $tmp) 1) -}}

                        {{- $.Scratch.Add "bareul" (index $tmp (sub . 1)) -}}

                        {{- end -}}

                        {{- else -}}

                    </ul>

                    </li>

                    {{- end -}}

                    {{- end -}}

                    {{- end -}}

                    {{- end }}

                    <li>

                        <a href="#{{- $cleanedID -}}" aria-label="{{- $header | plainify -}}">{{- $header | safeHTML -}}</a>

                        {{- else }}

                    <li>

                        <a href="#{{- $cleanedID -}}" aria-label="{{- $header | plainify -}}">{{- $header | safeHTML -}}</a>

                        {{- end -}}

                        {{- end -}}

                        {{- $firstHeaderLevel := $largest }}

                        {{- $lastHeaderLevel := len (seq (index (findRE "[1-6]" (index $headers (sub (len $headers) 1)) 1) 0)) }}

                    </li>

                    {{- range seq (sub $lastHeaderLevel $firstHeaderLevel) -}}

                    {{- if in ($.Scratch.Get "bareul") (add . $firstHeaderLevel) }}

                </ul>

                {{- else }}

                </ul>

                </li>

                {{- end -}}

                {{- end }}

                </ul>

            </div>

        </details>

    </div>

</aside>

  

<script>

    (function() {

        let elements;

        function getOffsetTop(element) {

            if (!element.getClientRects().length) return 0;

            let rect = element.getBoundingClientRect();

            let win = element.ownerDocument.defaultView;

            return rect.top + win.pageYOffset;  

        }

  

        function checkTocPosition() {

            const width = document.body.scrollWidth;

            if (width - 850 - (300 * 2) - 80 > 0) {

                document.getElementById("toc-container").classList.add("wide");

            } else {

                document.getElementById("toc-container").classList.remove("wide");

            }

        }

  

        function updateAccordion() {

            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

            let activeElement = null;

  

            // 1. Find the header currently in view

            // We scan all headers to find which one is closest to the top

            for (let i = 0; i < elements.length; i++) {

                const element = elements[i];

                // "window.innerHeight / 3" means we trigger the highlight

                // when the header is in the top 30% of the screen

                if ((getOffsetTop(element) - scrollPosition) > 0 &&

                    (getOffsetTop(element) - scrollPosition) < window.innerHeight / 2.5) {

                    activeElement = element;

                    break;

                }

            }

  

            // 2. Apply Classes

            if (activeElement) {

                // Decode ID to match href (handles %20 spaces etc)

                const id = encodeURI(activeElement.getAttribute('id')).toLowerCase();

                const activeLink = document.querySelector(`.inner ul li a[href="#${id}"]`);

  

                if (activeLink) {

                    // RESET: Close everything first

                    document.querySelectorAll('.toc li').forEach(li => li.classList.remove('active-parent'));

                    document.querySelectorAll('.toc a').forEach(a => a.classList.remove('active'));

  

                    // ACTIVATE: The specific link

                    activeLink.classList.add('active');

  

                    // EXPAND: Walk UP the tree to open all parents

                    let currentLi = activeLink.closest('li');

                    while (currentLi) {

                        currentLi.classList.add('active-parent');

                        // Try to find the next parent LI

                        const parentUl = currentLi.parentElement;

                        if (parentUl) {

                            // This finds the LI that contains the UL we are in

                            const grandParentLi = parentUl.closest('li');

                            if (grandParentLi) {

                                currentLi = grandParentLi;

                            } else {

                                // We reached the root

                                currentLi = null;

                            }

                        } else {

                            currentLi = null;

                        }

                    }

                }

            }

        }

  

        window.addEventListener('resize', checkTocPosition);

        window.addEventListener('DOMContentLoaded', () => {

            checkTocPosition();

            elements = document.querySelectorAll('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]');

            if(elements.length > 0) updateAccordion();

        });

  

        window.addEventListener('scroll', updateAccordion);

    })();

</script>

{{- end -}}
```

### code

`themes\PaperMod\assets\css\extended\code.css`

```
:root {

    --pe-primary-hover-color: #777777;

    /* 代码块标题色 */

    --pe-code-block-header-color: var(--primary);

    /* 代码块标题背景色 */

    --pe-code-block-header-bg-color: #ededed;

    /* 代码块文本颜色 */

    --pe-code-block-color: #979797;

    /* 代码块背景色 */

    --pe-code-block-bg-color: #f5f5f5;

    /* 代码块复制按钮字体颜色 */

    --pe-copy-code-color: #fff;

    /* 代码块复制按钮背景色 */

    --pe-copy-code-bg-color: #979797;

    --pe-scrollbar-bg-color: rgb(163, 163, 165);

    --pe-scrollbar-hover-bg-color: rgb(113, 113, 117);

    --copy-btn-hover-color: #1e90ff;

    --code-color: #FF69B4;

}

  

.dark {

    /* 代码块标题色 */

    --pe-code-block-header-color: var(--primary);

    /* 代码块标题背景色 */

    --pe-code-block-header-bg-color: #20252B;

    /* 代码块文本颜色 */

    --pe-code-block-color: rgba(255, 255, 255, 0.7);

    /* 代码块背景色 */

    --pe-code-block-bg-color: #272C34;

  

    --pe-copy-code-color: rgba(255, 255, 255, 0.7);

    --pe-copy-code-bg-color: #414244;

  

    --pe-scrollbar-bg-color: rgb(113, 113, 117);

    --pe-scrollbar-hover-bg-color: rgb(163, 163, 165);

    --copy-btn-hover-color: #b3d0ff;

}

  

.post-content a:hover {

    color: var(--copy-btn-hover-color);

}

  

/* 代码样式 */

.post-content code {

    margin: unset;

    padding: .3rem .4rem;

    line-height: 1.5;

    background: var(--code-bg);

    border-radius: .5rem;

    font-size: 0.875em;

    font-family: Consolas, sans-serif;

    color: var(--code-color);

}

  

/* 代码块样式 */

.pe-code-block-wrap {

    border-radius: var(--radius);

    margin: var(--content-gap) auto;

    background-color: var(--pe-code-block-header-bg-color);

    font-family: Consolas, sans-serif;

    overflow: hidden;

}

  

.pe-code-block-header {

    display: flex;

    width: 100%;

    align-items: center;

    color: var(--pe-code-block-header-color);

    justify-content: space-between;

    padding: .4rem 1rem;

    font-size: 0.575rem;

}

  

.pe-code-block-header-left {

    text-align: left;

    display: flex;

    align-items: baseline;

    gap: .2rem;

}

  

.pe-code-block-header-center {

    text-align: center;

}

  

.pe-code-block-header-right {

    line-height: 1rem;

    text-align: right;

    width: 2rem;

    display: flex;

    justify-content: flex-end;

}

  

.post-content .highlight:not(table) {

    margin: unset;

    background: var(--pe-code-block-bg-color) !important;

    border-radius: unset;

}

  

.post-content pre code {

    background-color: var(--pe-code-block-bg-color) !important;

    font-size: 0.88rem;

    color: var(--pe-code-block-color);

    border-radius: unset;

}

  

.pe-icon {

    width: 1.6rem;

    height: 1.6rem;

}

  

.copy-code:hover {

    background: var(--pe-primary-hover-color);

}

  

.chroma .lnt {

    padding: 0 0 0 1.2rem !important;

}

  

/* 滚动条 */

.post-content :not(table) ::-webkit-scrollbar-thumb {

    border: .2rem solid var(--pe-code-block-bg-color);

    background: var(--pe-scrollbar-bg-color);

}

  

.post-content :not(table) ::-webkit-scrollbar-thumb:hover {

    background: var(--pe-scrollbar-hover-bg-color);

}

  

.pe-code-details-content::-webkit-scrollbar {

    width: .8rem;

}

  

.pe-code-details-content::-webkit-scrollbar-track {

    background: var(--pe-code-block-bg-color); /* Background of the scrollbar track */

}

  

.pe-code-details-content::-webkit-scrollbar-thumb {

    border: .2rem solid var(--pe-code-block-bg-color);

    background: var(--pe-scrollbar-bg-color);

}

  

.pe-code-details-content::-webkit-scrollbar-thumb:hover {

    background: var(--pe-scrollbar-hover-bg-color);

}

  

.pe-code-details-content::-webkit-scrollbar-corner {

    background: var(--pe-code-block-bg-color);

}

  

table.lntable {

    overflow-x: unset;

}

  

.pe-code-block-container pre {

    margin: unset;

}

  

.pe-code-details .pe-code-details-summary:hover {

    cursor: pointer;

}

  

.pe-code-details i.pe-code-details-icon {

    color: var(--content);

    -webkit-transition: transform 0.2s ease;

    -moz-transition: transform 0.2s ease;

    -o-transition: transform 0.2s ease;

    transition: transform 0.2s ease;

}

  

.dark .pe-code-details i.pe-code-details-icon {

    color: var(--content);

}

  

.pe-code-details .pe-code-details-content {

    max-height: 0;

    overflow-y: hidden;

    -webkit-transition: max-height 0.8s cubic-bezier(0, 1, 0, 1) -0.1s;

    -moz-transition: max-height 0.8s cubic-bezier(0, 1, 0, 1) -0.1s;

    -o-transition: max-height 0.8s cubic-bezier(0, 1, 0, 1) -0.1s;

    transition: max-height 0.8s cubic-bezier(0, 1, 0, 1) -0.1s;

}

  

.pe-code-details.open i.pe-code-details-icon {

    -webkit-transform: rotate(90deg);

    -moz-transform: rotate(90deg);

    -ms-transform: rotate(90deg);

    -o-transform: rotate(90deg);

    transform: rotate(90deg);

}

  

.pe-code-details.open .pe-code-details-content {

    max-height: 80vh;

    -webkit-transition: max-height 0.8s cubic-bezier(0.5, 0, 1, 0) 0s;

    -moz-transition: max-height 0.8s cubic-bezier(0.5, 0, 1, 0) 0s;

    -o-transition: max-height 0.8s cubic-bezier(0.5, 0, 1, 0) 0s;

    transition: max-height 0.8s cubic-bezier(0.5, 0, 1, 0) 0s;

}

  

.pe-code-details.scrollable .pe-code-details-content{

    overflow: auto;

}

  

.scrollable {

    overflow: auto;

}

  

.pe-code-details .fa-chevron-right:before {

    content: "\f105";

}

  

.pe-code-details .fa-ellipsis-h:before {

    content: "\f141";

}

  

.pe-code-details.open .fa-ellipsis-h:before {

    content: "";

}

  

.pe-code-details .pe-code-copy-button {

    display: none;

}

  

.pe-code-details.open .pe-code-copy-button {

    display: inherit;

    align-items: center;

    justify-content: center;

    border-radius: 4px;

    cursor: pointer;

}

  

.pe-code-copy-button:hover {

    color: var(--copy-btn-hover-color);

    background-color: rgba(255,255,255,0.1); /* 可加輕微背景增加可點感 */

}

  
  

/* 左上角三個虛擬按鈕裝飾 */

.pe-code-window-decor {

    display: flex;

    gap: 0.3em;

    position: absolute; /* 置於左上角 */

    top: 0.4rem;

    left: 0.6rem;

}

  

.pe-code-window-decor .btn {

    width: 10px;             /* 原來 12px → 縮小 */

    height: 10px;            /* 原來 12px → 縮小 */

    border-radius: 50%;

    display: inline-block;

    box-shadow: 0 1px 2px rgba(0,0,0,0.2);

}

  

.pe-code-window-decor .close {

    background-color: #9370DB;

}

  

.pe-code-window-decor .minimize {

    background-color: #414244;

}

  

.pe-code-window-decor .maximize {

    background-color: #414244;

}

  

/* 調整 header 位置，避免被圓點遮住 */

.pe-code-block-header {

    position: relative; /* 為了放置絕對定位的裝飾圓點 */

    display: flex;

    width: 100%;

    align-items: center;

    color: var(--pe-code-block-header-color);

    justify-content: space-between;

    font-size: 1.rem;

}
```

`themes\PaperMod\assets\js\copy-code.js`

```
document.addEventListener('DOMContentLoaded', () => {

  // 为所有代码块添加复制按钮

  document.querySelectorAll('.chroma').forEach(block => {

    const button = document.createElement('button');

    button.className = 'copy-btn';

    button.textContent = 'copy';

    // 点击复制逻辑

    button.addEventListener('click', () => {

      const code = block.querySelector('code').textContent;

      navigator.clipboard.writeText(code).then(() => {

        button.textContent = 'copyied';

        button.classList.add('copied');

        setTimeout(() => {

          button.textContent = 'copy';

          button.classList.remove('copied');

        }, 2000);

      });

    });

    block.appendChild(button);

  });

});
```

### private mode

draft: true
