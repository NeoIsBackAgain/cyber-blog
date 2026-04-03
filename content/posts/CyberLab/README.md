---
title: README
date: 2026-03-23
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
<<<<<<< HEAD
lastmod: 2026-04-01T16:01:21.862Z
=======
lastmod: 2026-03-28T17:25:24.255Z
>>>>>>> aa99df64024e5be15896ed1a3a830f514484c8da
---
# What is that ?

Is a blog to record what I have done with my stupid brain

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

{{< mindmap >}}

# obsidian ->

## hugo ->

* github ->
  * github page ->

{{< /mindmap >}}

### obsidian setting

The obsidian has the plugin `Hugo Publish`  which can convert the `.md` file and related images in obsidian to the hugo site dir , following is my setting

![Pasted image 20260329002059.png](/ob/Pasted%20image%2020260329002059.png)

In my obsidian will have the attribute to decide the post will be on hugo or only in the obsidian local .

![Pasted image 20260329001553.png](/ob/Pasted%20image%2020260329001553.png)

`site dir`  is where you place your hugo blog location

Windows\
{{< code >}}\
<<<<<<< HEAD
C:\Users\user\Documents\GitHub\
=======
C:\Users\user\Documents\GitHub/\
>>>>>>> aa99df64024e5be15896ed1a3a830f514484c8da
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
/Users/user/Documents/GitHub/cyber-blog/\
{{< /code >}}

### hugo setting

Nothing need to set due to  the plugin `Hugo Publish` will help you to file it

### Github setting

Download the `Github Desktop` to sync your file that will be done

### Github page setting

you need to make the repositories to public , and make the Github page

![Pasted image 20260329003139.png](/ob/Pasted%20image%2020260329003139.png)

Choose The Github Action

![Pasted image 20260329003258.png](/ob/Pasted%20image%2020260329003258.png)

`.github\workflows\deploy.yml`

{{< code >}}\
name: Deploy Hugo site

on:

  push:

    branches:

      - main

permissions:

  contents: read

  pages: write

  id-token: write

jobs:

  build-deploy:

    runs-on: ubuntu-latest

    steps:

      - uses: actions/checkout@v4

      - uses: peaceiris/actions-hugo@v3

        with:

          hugo-version: '0.146.0'

          extended: true

      - name: Build Hugo

        run: hugo --minify

      # 2. FIXED: Upload the 'public' folder as an artifact first

      - name: Upload artifact

        uses: actions/upload-pages-artifact@v3

        with:

          path: ./public

      # 3. FIXED: Deploy the artifact (No 'folder' input needed here)

      - name: Deploy to GitHub Pages

{{< /code >}}

`.github\workflows\hugo.yaml`

{{< code >}}\
name: Build and deploy

on:

  push:

    branches:

      - main

  workflow\_dispatch:

permissions:

  contents: read

  pages: write

  id-token: write

concurrency:

  group: pages

  cancel-in-progress: false

defaults:

  run:

    shell: bash

jobs:

  build:

    runs-on: ubuntu-latest

    env:

      DART\_SASS\_VERSION: 1.93.2

      GO\_VERSION: 1.25.3

      HUGO\_VERSION: 0.152.2

      NODE\_VERSION: 22.20.0

      TZ: Europe/Oslo

    steps:

      - name: Checkout

        uses: actions/checkout@v5

        with:

          submodules: recursive

          fetch-depth: 0

      - name: Setup Go

        uses: actions/setup-go@v5

        with:

          go-version: \${{ env.GO\_VERSION }}

          cache: false

      - name: Setup Node.js

        uses: actions/setup-node@v4

        with:

          node-version: \${{ env.NODE\_VERSION }}

      - name: Setup Pages

        id: pages

        uses: actions/configure-pages@v5

      - name: Create directory for user-specific executable files

        run: |

          mkdir -p "\${HOME}/.local"

      - name: Install Dart Sass

        run: |

          curl -sLJO "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART\_SASS\_VERSION}-linux-x64.tar.gz"

          tar -C "${HOME}/.local" -xf "dart-sass-${DART\_SASS\_VERSION}-linux-x64.tar.gz"

          rm "dart-sass-\${DART\_SASS\_VERSION}-linux-x64.tar.gz"

          echo "${HOME}/.local/dart-sass" >> "${GITHUB\_PATH}"

      - name: Install Hugo

        run: |

          curl -sLJO "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO\_VERSION}\_linux-amd64.tar.gz"

          mkdir "\${HOME}/.local/hugo"

          tar -C "${HOME}/.local/hugo" -xf "hugo_extended_${HUGO\_VERSION}\_linux-amd64.tar.gz"

          rm "hugo\_extended\_\${HUGO\_VERSION}\_linux-amd64.tar.gz"

          echo "${HOME}/.local/hugo" >> "${GITHUB\_PATH}"

      - name: Verify installations

        run: |

          echo "Dart Sass: \$(sass --version)"

          echo "Go: \$(go version)"

          echo "Hugo: \$(hugo version)"

          echo "Node.js: \$(node --version)"

      - name: Install Node.js dependencies

        run: |

          [ -f package-lock.json || -f npm-shrinkwrap.json ](%20-f%20package-lock.json%20%7C%7C%20-f%20npm-shrinkwrap.json%20) && npm ci || true

      - name: Configure Git

        run: |

          git config core.quotepath false

      - name: Cache restore

        id: cache-restore

        uses: actions/cache/restore@v4

        with:

          path: \${{ runner.temp }}/hugo\_cache

          key: hugo-\${{ github.run\_id }}

          restore-keys:

            hugo-

      - name: Build the site

        run: |

          hugo \\

            --gc \\

            --minify \\

            --baseURL "\${{ steps.pages.outputs.base\_url }}/" \\

            --cacheDir "\${{ runner.temp }}/hugo\_cache"

      - name: Cache save

        id: cache-save

        uses: actions/cache/save@v4

        with:

          path: \${{ runner.temp }}/hugo\_cache

          key: \${{ steps.cache-restore.outputs.cache-primary-key }}

      - name: Upload artifact

        uses: actions/upload-pages-artifact@v3

        with:

          path: ./public

  deploy:

    environment:

      name: github-pages

      url: \${{ steps.deployment.outputs.page\_url }}

    runs-on: ubuntu-latest

    needs: build

    steps:

      - name: Deploy to GitHub Pages

        id: deployment

        uses: actions/deploy-pages@v4\
       \
{{< /code >}}

<<<<<<< HEAD
# How to Run

### In windows docker

```shell
PS C:\Users\user\Downloads\> docker run --rm -p 1313:1313 -v "${PWD}:/src" -w /src cibuilds/hugo:0.150.0 hugo server -D --bind 0.0.0.0 --noTimes
```

### In Mac / Linux

```
hugo server -D 
```

=======
>>>>>>> aa99df64024e5be15896ed1a3a830f514484c8da
# How to use ?

### Create the shortcode

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

### tree shortcode

![Pasted image 20260329011107.png](/ob/Pasted%20image%2020260329011107.png)

{{< tree >}}\
➜  example tree\
.\
├── CVE-2024-22120-RCE\
│   ├── CVE-2024-22120-LoginAsAdmin.py\
│   ├── CVE-2024-22120-RCE.py\
│   ├── CVE-2024-22120-Webshell.py\
│   └── README.md\
├── machines\_sg-dedivip-1(3).ovpn\
└── zabbix\_server\_time\_based\_blind\_sqli.py\
{{< /tree >}}

### code shortcode

![Pasted image 20260329011138.png](/ob/Pasted%20image%2020260329011138.png)

{{< code >}}\
content\posts\
{{< /code >}}

### mindmap shortcode

![Pasted image 20260329011245.png](/ob/Pasted%20image%2020260329011245.png)

{{< mindmap >}}

# exmaple1

## example2

* example3
  * example4

{{< /mindmap >}}

### taskstack shortcode

![Pasted image 20260327152610.png](/ob/Pasted%20image%2020260327152610.png)

{{< tech-stack >}}

OS: Ubuntu Linux\
Web Server: Apache/2.4.52\
Language: PHP 8.1\
Database: MySQL 8.0\
Application: Zabbix

{{< /tech-stack >}}

<<<<<<< HEAD
# Tags and search system

The search function is created by Fuse.js which will loops all pages , extracts the title, summary, permalink, tags + any custom “tips” from your   shortcodes, hides the description on blog posts, and outputs everything as a ready-to-use search JSON file.

And the tags 's name will be needed to improve it

```
account-bruteforce 1
blog 16
bloodhound 2
bloodhound-ForceChangePassword 1
bloodhound-HasSession 1
CMS-Grav-Data-Leak 1
CMS-Grav-RCE 1
CMS-phpSysInfo-Data-Leak 1
code-review 1
CVE-2020-13151 1
CVE-2021-44087 1
CVE-2022-42889 1
decode-kdbx 1
Directory-Brute-Force-Feroxbuster-n 1
easy 1
ftp-anonymous-login 2
FTP-to-SSH 1
Grafana-sqlite-password-decode 1
Grafana-v8 1
hard 7
HTB 10
Impersonate-Token 2
java-xml-marshallers 1
kerberbrute 2
kerberos-auth-website-firefox 1
KRB5KRB_AP_ERR_SKEW 1
Lateral-Movement-5985 1
Lateral-Movement-kerberosing 1
Lateral-Movement-mimikatz 1
lfi 1
LFI-ntlm 1
LFI-webConfig 1
Linux 5
Etcd-Pipeline 1
Linux-Privilege-Escalation-backupfile 1
Linux-Privilege-Escalation-Cron-tar-Wild 1
Linux-Privilege-Escalation-directory-ownership-error 1
Linux-Privilege-Escalation-docker 1
Linux-Privilege-Escalation-fdisk 1
Linux-Privilege-Escalation-java-Xdebug 1
Linux-Privilege-Escalation-KiteService 1
Linux-Privilege-Escalation-link-Injection 1
Linux-Privilege-Escalation-Path-Variable-Escalation 1
medium 2
mssql-login 1
netexec 1
netexec-kerberos-auth 1
netexec-spider 1
netexec-users-hashs 1
offsec 3
password-cracking 1
password-deformation 1
PDF-Check 1
phishing-by-Word 1
rce 1
s4u2self 1
SAM-SYSTEM-SECUITY 1
SAM-SYSTEM-SECUITY-hashcrack 1
send-email 1
smb-description 1
smb-login-with-hash 1
smb-to-ssh 1
smb-username-collect 1
SSH-login-error 1
velociraptor 1
vesta-rce-exploit 1
web-exploit-ftp-usercreate-misconfig 1
web-github-abuse 1
Web-login-bruteForce 1
Web-SourceCode-DataLeak 1
wim 1
window 1
windows 5
windows-Firewall-Enumeration 1
Windows-Privilege-Escalation-GPGservice 1
Windows-Privilege-Escalation-hMailServer 1
Windows-Privilege-Escalation-Putty 1
```

### rebuilt idea

hacktrick 's method is

Generic Methodologies & Resources\
Generic Hacking\
Linux Hardening\
MacOS Hardening\
Windows Hardening\
Mobile Pentesting\
Network Services Pentesting\
Pentesting Web\
Cloud Security\
Hardware/Physical Access\
Binary Exploitation\
AI\
Reversing

0xdf  's method is

nmap\
python\
php\
windows-firewall\
windows-sessions

IPPSEC\
Logged in as our newly created admin, exploiting the LFI Vulnerability with the Synactiv Filter Chain Vulnerability\
Discovering LFI in the page parameter but we cannot immediately exploit it\
Uploading a zip file to the ticket, then using the phar wrapper with our LFI to include it\
Discovering a likely LFI in product.php but cannot use filters, likely because there is a file\_exists() check\
Dropping a file from MySQL and then including it with the LFI to get a shell\
Showing SQLFiddle, which is a great way to play and test SQL Queries

主語 + 謂語 + 技術名稱（作為賓語或補語），咁樣可以令句子重點清晰，方便讀者迅速對應到實際漏洞。

可以使用Discovering ,uploading 呢啲句子開頭\
ired.team\
Read Team Infrastructure\
Lnitial Access\
code Execution\
Code & Process Injection\
Defense Evasion\
Enumeration and Discovery\
Privilege Escalation\
Credential Access & Dumping\
Lateral Movement\
Persistence

https://pwning.net/\
https://balsn.tw/\
https://blog.dragonsector.pl/\
https://blog.perfect.blue/\
https://r3kapig.com/\
https://github.com/TokyoWesterns

# to-do list

### comment
=======
### Tags and search system

There is the standard and SOP for correctly build the Tags for better search experience
>>>>>>> aa99df64024e5be15896ed1a3a830f514484c8da
