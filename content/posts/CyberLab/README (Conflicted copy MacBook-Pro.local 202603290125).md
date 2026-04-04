---
title: README
date: 2030-03-27
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
lastmod: 2026-03-28T16:22:58.696Z
---
# Box Info

***

# What is that ?

# How can I build it ?

This cyber blog is structured by hugo , in the following will show the structure tree

{{< tree >}}\
.

├── archetypes

│   └── default.md

├── content

│   ├── bugbounty

├── . . . snip . . .

├── hugo.toml

├── layouts

│   ├── \_default

│   │   ├── bugbounty\_list.html

│   │   ├── htb\_list.html

│   │   ├── index.json

│   │   ├── offsec\_list.html

│   │   └── term.html

│   ├── partials

│   │   ├── ctf\_card.html

│   │   ├── extend\_footer.html

│   │   ├── index\_profile.bak

│   │   └── index\_profile.html

│   └── shortcodes

│       ├── code.html

│       ├── htb-info.html

│       ├── mindmap.html

│       ├── tag.html

│       ├── tags.html

│       ├── tech-stack.html

│       ├── toggle.html

│       └── tree.html

├── public

├── . . . snip . . .

├── README.md

├── resources

│   └── \_gen

│       ├── assets

│       └── images

├── static

│   ├── images

│   │   ├── BugBounty.png

│   │   ├── htb.gif

│   │   ├── linux.svg

│   │   ├── misc.png

│   │   ├── offsec.png

│   │   └── tags.svg

│   ├── js

│   │   └── code-collapse.js

│   └── ob

│       ├── Pasted image 20251215143255.png

│       │   . . . snip . . .

└── themes

    └── PaperMod

        ├── assets

        │   ├── css

        │   │   ├── common

        │   │   │   ├── 404.css

        │   │   │   ├── archive.css

        │   │   │   ├── footer.css

        │   │   │   ├── header.css

        │   │   │   ├── main.css

        │   │   │   ├── post-entry.css

        │   │   │   ├── post-single.css

        │   │   │   ├── profile-mode.css

        │   │   │   ├── search.css

        │   │   │   └── terms.css

        │   │   ├── core

        │   │   │   ├── license.css

        │   │   │   ├── reset.css

        │   │   │   ├── theme-vars.css

        │   │   │   └── zmedia.css

        │   │   ├── extended

        │   │   │   ├── blank.css

        │   │   │   ├── code.css

        │   │   │   ├── custom.css

        │   │   │   ├── toc.css

        │   │   │   └── toc.css.bak

        │   │   └── includes

        │   │       ├── chroma-mod.css

        │   │       ├── chroma-styles.css

        │   │       └── scroll-bar.css

        │   └── js

        │       ├── copy-code.js

        │       ├── fastsearch.js

        │       ├── fuse.basic.min.js

        │       ├── license.js

        │       ├── toc - Copy.js.bak

        │       └── toc.js

        ├── go.mod

        ├── i18n

        │   ├── ar.yaml

        │   . . . snip . . .\
        ├── images

        │   ├── screenshot.png

        │   └── tn.png

        ├── layouts

        │   ├── \_default

        │   │   ├── \_markup

        │   │   │   ├── render-codeblock-mermaid.html

        │   │   │   ├── render-codeblock.html

        │   │   │   ├── render-image.html

        │   │   │   └── render-link.html

        │   │   ├── archives.html

        │   │   ├── baseof.html

        │   │   ├── index.json

        │   │   ├── list.html

        │   │   ├── rss.xml

        │   │   ├── search.html

        │   │   ├── single.html

        │   │   └── terms.html

        │   ├── 404.html

        │   ├── partials

        │   │   ├── anchored\_headings.html

        │   │   ├── author.html

        │   │   ├── breadcrumbs.html

        │   │   ├── comments.html

        │   │   ├── cover.html

        │   │   ├── edit\_post.html

        │   │   ├── extend\_footer.html

        │   │   ├── extend\_head.html

        │   │   ├── footer.html

        │   │   ├── head.html

        │   │   ├── header.html

        │   │   ├── home\_info.html

        │   │   ├── index\_profile.html

        │   │   ├── post\_canonical.html

        │   │   ├── post\_meta.html

        │   │   ├── post\_nav\_links.html

        │   │   ├── share\_icons.html

        │   │   ├── social\_icons.html

        │   │   ├── svg.html

        │   │   ├── templates

        │   │   │   ├── \_funcs

        │   │   │   │   └── get-page-images.html

        │   │   │   ├── opengraph.html

        │   │   │   ├── schema\_json.html

        │   │   │   └── twitter\_cards.html

        │   │   ├── toc.html

        │   │   └── translation\_list.html

        │   ├── robots.txt

        │   └── shortcodes

        │       ├── collapse.html

        │       ├── figure.html

        │       ├── inTextImg.html

        │       ├── ltr.html

        │       ├── rawhtml.html

        │       └── rtl.html

        ├── LICENSE

        └── theme.toml\
{{< /tree >}}

The cyber-blog is coded around 2 years for , most of them are created by `chatGPT` , `Gemini` and `My Brain` , also reference to other other blog , many thanks !

### Obsidian to Github online

The cyber-blog 's post can be easily wrote by makedown format in obsidian , following is the mindmap of the chain

{{< mindmap >}}

# obsidian ->

## hugo ->

* github ->
  * github page ->

{{< /mindmap >}}

### obsidian setting

The obsidian has the plugin `Hugo Publish` which can convert the `.md` file and related images in obsidian to the hugo site dir , following is my setting

![Pasted image 20260329002059.png](/ob/Pasted%20image%2020260329002059.png)

In my obsidian will have the attribute to decide the post will be on hugo or only in the obsidian local .

![Pasted image 20260329001553.png](/ob/Pasted%20image%2020260329001553.png)

`site dir` is where you place your hugo blog location

Windows\
{{< code >}}\
C:\Users\user\Documents\GitHub/\
{{< /code >}}

Linux or macos\
{{< code >}}\
/Users/user/Documents/GitHub/cyber-blog/\
{{< /code >}}

`blog dir` is the content of the post you will put the `.md` file

Windows\
{{< code >}}\
content\posts\
{{< /code >}}

Linux or macos\
{{< code >}}\
content/posts/\
{{< /code >}}

# How to use ?

# in the next is backup

### SOP

![Pasted image 20260327153904.png](/ob/Pasted%20image%2020260327153904.png)

{{< tree >}}\
➜  watcher tree\
.\
├── CVE-2024-22120-RCE\
│   ├── CVE-2024-22120-LoginAsAdmin.py\
│   ├── CVE-2024-22120-RCE.py\
│   ├── CVE-2024-22120-Webshell.py\
│   └── README.md\
├── machines\_sg-dedivip-1(3).ovpn\
└── zabbix\_server\_time\_based\_blind\_sqli.py\
{{< /tree >}}

{{< code >}}

sudo apt install nginx

/\* The subtle title bar \*/

.tech-titlebar {

    background-color: #1f2335;

    border-bottom: 1px solid #292e42;

    padding: 8px 15px;

    display: flex;

    align-items: center;

}

{{< /code >}}

### How Create the Custom area in post ?

### 1. Create the html

In the `shortcode` , create the html  , named to example.html

```html
<div class="custom-tech-window">

    <div class="tech-titlebar">

        <span class="tech-label">&#x1F5C4; Tech Stack</span>

    </div>

    <div class="tech-content">

        {{ .Inner | markdownify }}

    </div>

</div>
```

### 2. Adjust the css

In the custom.css , Adjust the css

```css

/* --- 3. TARGET TECH STACK WINDOW --- */

.custom-tech-window {

    background-color: #1a1b26; /* Deep dashboard blue/black */

    border: 1px solid #292e42;

    border-left: 4px solid #1e90ff; /* Electric blue accent border */

    border-radius: 6px;

    margin: 1.5em 0;

    overflow: hidden;

    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

}

  

/* The subtle title bar */

.tech-titlebar {

    background-color: #1f2335;

    border-bottom: 1px solid #292e42;

    padding: 8px 15px;

    display: flex;

    align-items: center;

}

  

/* The text for the badge */

.tech-label {

    color: #7aa2f7;

    font-family: 'Segoe UI', Tahoma, sans-serif;

    font-size: 11px;

    font-weight: 700;

    letter-spacing: 1px;

    text-transform: uppercase;

}

  

/* The code container */

.tech-content {

    padding: 15px;

    overflow-x: auto;

}

  

/* Reset Hugo's default syntax highlighting margins */

.custom-tech-window .highlight { margin: 0 !important; }

.custom-tech-window .highlight pre {

    background: transparent !important;

    margin: 0 !important;

    padding: 0 !important;

}
```

### 3. Use in the blog

In you `.md` file to paste like that

![Pasted image 20260327152610.png](/ob/Pasted%20image%2020260327152610.png)

{{< tech-stack >}}

OS: Ubuntu Linux\
Web Server: Apache/2.4.52\
Language: PHP 8.1\
Database: MySQL 8.0\
Application: Zabbix

{{< /tech-stack >}}

# hotkeys

https://usethekeyboard.com/ is a pretty good website to learn

https://zhouer.org/KeyboardTest/ is a website for keyboard test

option

### search

[#netexec](http://localhost:1313/cyber-blog/tags/netexec) The netexec will auto generate the file for you to add into the /etc/hosts

idea --> for each one tag search to do attack flow

### tags

in the tags  to build the toc with mindmap

![Pasted image 20260328163130.png](/ob/Pasted%20image%2020260328163130.png)

{{< mindmap >}}

# obsidian

## hugo

* github
  * github page

{{< /mindmap >}}
