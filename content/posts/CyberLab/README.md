---
title: README
date: 2026-03-27
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
lastmod: 2026-03-27T07:41:13.775Z
---
# Box Info

***

### SOP

```
{{ <tree> }}
```

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

### How Create the Custom area in post ?

#### 1. Create the html

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
