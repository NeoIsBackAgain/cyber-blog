---
title: README
date: 2026-03-23
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
lastmod: 2026-05-14T05:36:50.927Z
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
C:\Users\user\Documents\GitHub\
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

# How to Run

### In windows docker

```shell
PS C:\Users\user\Downloads\> docker run --rm -p 1313:1313 -v "${PWD}:/src" -w /src cibuilds/hugo:0.150.0 hugo server -D --bind 0.0.0.0 --noTimes
```

### In Mac / Linux

```
hugo server -D 
```

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

`mindmap.html`

{{< code >}}

<div class="custom-mindmap-window">

    <div class="mindmap-content">

        <div class="markmap">

            <script type="text/template">

{{ .Inner | safeHTML }}

            </script>

        </div>

    </div>

</div>

{{/\* --- THE MAGIC FIX --- \*/}}

{{/\* This tells Hugo: "If we haven't loaded Markmap on this page yet, load it now and remember that we did." \*/}}

{{ if not (.Page.Store.Get "hasMarkmap") }}

    <script defer src="https://cdn.jsdelivr.net/npm/markmap-autoloader@latest"></script>

    {{ .Page.Store.Set "hasMarkmap" true }}

{{ end }}\
{{< /code >}}

![Pasted image 20260329011245.png](/ob/Pasted%20image%2020260329011245.png)

{{< mindmap >}}

# exmaple1

## example2

* example3
  * example4

{{< /mindmap >}}

#### mermaid example

`layouts\shortcodes\mermaid.html`

{{< code >}}

<style>

    .mermaid-wrapper {

        display: flex;

        justify-content: center;

        align-items: center;

        margin: 3rem 0;

        width: 100%;

    }

    .mermaid-wrapper pre {

        background: transparent !important;

        border: none !important;

        margin: 0;

        padding: 0;

        width: 70%;

        display: flex;

        justify-content: center;

    }

  

    .mermaid-wrapper svg {

        width: 70% !important;

        max-width: 650px !important;

        height: auto !important;

    }

</style>

<div class="mermaid-wrapper">

    <pre class="mermaid">

{{- /\* 🌟 這裡就是魔法發生的位置：攔截 Obsidian 的轉義字元並修復它 \*/ -}}

{{- \$cleanText := .Inner -}}

{{- $cleanText := replace $cleanText "\\\[" "\[" -}}

{{- $cleanText := replace $cleanText "\\]" "]" -}}

{{- $cleanText := replace $cleanText "\\*" "*" -}}

{{- \$cleanText | safeHTML -}}

    </pre>

</div>

{{ if not (.Page.Store.Get "hasMermaid") }}

    <script type="module">

        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

        mermaid.initialize({

            startOnLoad: true,

            theme: 'default',

            themeVariables: {

                lineColor: '#ffffff' /\* 強制將連接線與箭頭設為白色 \*/

            }

        });

    </script>

    {{ .Page.Store.Set "hasMermaid" true }}

{{ end }}\
{{< /code >}}

{{< mermaid >}}

graph TD

    A\[Shell as svc\_inventory\_lnx]

    B\[Decrypt lansweeper credentials]

    C\[Deployment via lansweeper]

    D\[Shell as<br>svc\_inventory\_win]

    E\[Shell as<br>NT Authority\SYSTEM]

    F\[root.txt]

    A -- unintended --> B

    A -- intended --> C

    B -- unintended --> D

    C -- intended --> E

    D -- unintended --> F

    E -- intended --> F

{{< /mermaid >}}

### taskstack shortcode

![Pasted image 20260327152610.png](/ob/Pasted%20image%2020260327152610.png)

{{< tech-stack >}}

OS: Ubuntu Linux\
Web Server: Apache/2.4.52\
Language: PHP 8.1\
Database: MySQL 8.0\
Application: Zabbix

{{< /tech-stack >}}

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

### Tags tree

* Nmap --> Describing nmap result to attack vector with the mindmap
  * Start of nmap, showing -vv will cause the output to contain TTL
* Web-Attack --> Exploiting the Web Exploit Technology
  * Web-SourceCode-DataLeak
  * The webapp reveals that the website is using the Attendance and Payroll System which is easy to be attack as the RCE CVE-2021-44087
* Persistence -->
* Lateral Movement
* Credential Access & Dumping
* Windows Privilege Escalation
* Linux Privilege Escalation

# to-do list

### comment

# How to name

```
Nmap-analyzing
Nmap-analyzing-UDP


Windows-Privilege-Escalation  . . .
	Windows-Privilege-Escalation-WinSSHTerm
	Windows-Privilege-Enumation-Service
	Windows-Privilege-UAC-Bypass
	Windows-Privilege-enable-all-privilege
	Windows-Privilege-SeImpersonatePrivilege
	Windows-Privilege-SeEnableDelegationPrivilege   
Linux-Privilege-Escalation . . .
	Linux-Privilege-docker-identify
	Linux-Privilege-check-my-ip
	Linux-Privilege-linux-x86-nmap-install
	Linux-Privilege-docker-local-kali-file-transfer
	Linux-Privilege-General-Enumeration
	Linux-Privilege-dataleak

	

Port53-DNS
	Port80-Apache-local-web-server-Configure
	Port-unknown-ADCS-ESC8
	Port-unknown-ADCS-ESC4-change-ESC1
	Port21-FTP-anonymous
	Port21-FTP-binary-file-transfer
	Port22-SSH-tunnel
	Port53-DNS-Discovery-Host
	Port443-UDP-QUIC
	Port53-DNS-redirct-web-link
	Port53-DNS-host-discovery-sourcecode
	Port873-rsync-data-leak
	Port21-FTP-Anonymous-Login
	Port21-FTP-inject-sshkey
	Port139-135-SMB-anonymous-login
	Port139-135-SMB-enumerating
	Port873-rsync-dataleak
	Port139-135-SMB-enumerating-spider
	Port139-135-SMB-rid-brute
	Port139-135-SMB-BurteForce
	Port139-135-SMB-rce-mindmap
	Port43037-Java-Remote-Invocation-RMI-Pentest
	Port2049-nfs-dataleak
	Port88-LDAP-Kerbrute
	Port88-LDAP-Kerbrute-set-up
	Port5985-winrm-evil-winrm-py
	Port3306-mysql-enumerating
	Port5432-PostgreSQL-local-shell
		has the bash 
		how to set up 
		normal use

BruteForce-Web . . .
	BruteForce-Web-Directory-Feroxbuster 
	BruteForce-Web-Directory-gobuster
	BruteForce-subdomain-Feroxbuster
	BruteForce-subdomain-wfuzz
	BruteForce-account-wfuzz
	

Bloodhound . . .
	Bloodhound-Collect-nxc
	Bloodhound-Collect-bloodhound-ce-python
	Bloodhound-Collect-rusthound-ce
	
	Bloodhound-vectory-ForceChangePassword
	Bloodhound-vectory-AddAllowedToAct  
	Bloodhound-vectory-HasSession
	Bloodhound-vectory-GenericAll
	Bloodhound-vectory-GenericAll-Group
	Bloodhound-vectory-GenericWrite
	Bloodhound-vectory-ReadGMSAPassword
	Bloodhound-vectory-loginscript
	Bloodhound-vectory-WriteOwner-WriteDacl
	Bloodhound-vectory-Impersonate-Token
	Bloodhound-vectory-WriteOwner
	Bloodhound-vectory-WriteDacl
	Bloodhound-vectory-view-all-user
	
	Bloodhound-Setup-kali-anyPlatform
	Bloodhound-Setup-Docker-x86
	Bloodhound-Setup-ArmLinux
	
	
	Bloodhound-analyzing-Allusers
	

CMS-. . .

Linux-Enumation . . .
	Linux-Enumation-Apache
	Linux-Enumation-Enumation-Nginx
	Linux-Enumation-Enumation-mysql
	
	
Decode-. . .
	Decode-Grafana-hashcat
	Decode-/etc/password-/etc/shadow-john
	Decode-company-name-simple-mutation-hashcat-rule
	Decode-veracrypt
	Decode-Grafana-hashcat
	Decode-NTLMv2-hashcat
	Decode-jenkins-users-hashcat
	Decode-jenkins-credentials-decryptor
Source-Code-Review-
	Source-Code-Review- . . .
		Source-Code-Review-java-XML-File-Upload
		Source-Code-Review-VBScript-logon-script
		Source-Code-Review-xampp-index-file-compare-RCE
		Source-Code-Review-lnk
		Source-Code-php-printer-add
		



Lateral-Movement-account-verify-nxc (x)
Lateral-Movement-Chisel-proxy-kali-arm-to-linux-x86


reverse-engine-arm-linux-Ghidra-install
reverse-engine-HTB-remote-x64dbg
reverse-engine-windows-x64dbg-install
reverse-engine-windows-mona-install
reverse-engine-buffer-overflow

revshell-python-upgrade


forensics-vbs.lnk


CMS-Teamcity-Access-via-Database-Manipulation
CMS-Authenticated-Gitea-RCE
CMS-PowerDNS-Admin-Owned-DNS

OWASP-FTP-Misconfig
OWASP-fileupload-windows-media-player-wax
OWASP-Local-File-Inclusion-LFI
OWASP-SQL-Inject
OWASP-SQL-Inject-search-func-mssql
OWASP-Romte-File-Inclusion-RFI
OWASP-dataleak-email-login
OWASP-X-Powered-By-Esigate
OWASP-XSLT-inject

```

### How to set the search result to post 's tags

which is ok for my company screen , but need to improve it in the future

```
:target {

    scroll-margin-top: 100px !important;

}

  

/* Old-school fallback hack just in case the browser ignores scroll-margin */

:target::before {

    content: "";

    display: block;

    height: 100px;

    margin-top: -100px;

    visibility: hidden;

    pointer-events: none;

}
```

### where can I improve the search function ?

`index.json`

`fastsearch.js`

`index_profile.html`

```
<div class="home-dashboard">

  

    <div class="dash-search">

        <div class="search-input-wrapper">

            <span class="search-icon">

                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>

            </span>

            <input id="home-search-input" class="notranslate" translate="no" type="text" placeholder="Search boxes, tags, or cves..." autocomplete="off" spellcheck="false" />

        </div>

    </div>

  

    <ul id="home-search-results" class="search-results-list" style="display: none;"></ul>

  

    <div id="default-dashboard-view">

        <div class="dash-grid">

            <a href="{{ "htb/" | absURL }}" class="dash-card htb">

                <div class="card-icon"><img src="{{ "images/htb.gif" | absURL }}" alt="HTB" class="dash-icon-img"></div>

                <h3>HTB Collection</h3><span>HackTheBox Writeups</span>

            </a>

            <a href="{{ "offsec/" | absURL }}" class="dash-card offsec">

                <div class="card-icon"><img src="{{ "images/offsec.png" | absURL }}" alt="Offsec" class="dash-icon-img"></div>

                <h3>OffSec</h3><span>Exam & Labs</span>

            </a>

            <a href="{{ "bugbounty_list/" | absURL }}" class="dash-card bug">

                <div class="card-icon"><img src="{{ "images/BugBounty.png" | absURL }}" alt="Bug" class="dash-icon-img"></div>

                <h3>Bug Research</h3><span>CVEs & Findings</span>

            </a>

            <a href="{{ "tags/" | absURL }}" class="dash-card tags">

                <div class="card-icon"><img src="{{ "images/tags.svg" | absURL }}" alt="Tags" class="dash-icon-img"></div>

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

  

</div>

  

<style>

    .dash-search { width: 100%; max-width: 850px; margin: 0 auto 30px auto; position: relative; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

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

    .search-input-wrapper:focus-within { border-color: #1e90ff; box-shadow: 0 0 0 1px rgba(30, 144, 255, 0.5), 0 0 30px rgba(30, 144, 255, 0.1); }

    .search-icon { color: #555; margin-right: 15px; display: flex; flex-shrink: 0; }

    #home-search-input { width: 100%; background: transparent; border: none; color: #fff; font-size: 1.1rem; outline: none; }

    #home-search-input::placeholder { color: #444; }

    .search-results-list { width: 100%; max-width: 850px; margin: 0 auto 40px auto; padding: 0; list-style: none; }

    .search-result-item {

        background-color: #0f0f0f;

        border: 1px solid #333;

        border-radius: 12px;

        margin-bottom: 12px;

        overflow: hidden;

        height: auto;

        min-height: 80px;

    }

    .search-result-link {

        display: flex;

        flex-direction: column;

        padding: 16px 22px;

        text-decoration: none;

        transition: background 0.1s ease;

        border-left: 3px solid transparent;

    }

    .search-result-link:hover { background: #141414; border-left-color: #1e90ff; }

    .result-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 10px; }

    .result-title-group { display: flex; align-items: flex-start; gap: 12px; flex-grow: 1; }

    .result-icon { margin-top: 2px; flex-shrink: 0; }

    .result-icon svg { stroke: #444; transition: stroke 0.2s; }

    .search-result-link:hover .result-icon svg { stroke: #1e90ff; }

    .result-title { color: #eee; font-weight: 700; font-size: 1.05rem; letter-spacing: 0.3px; word-break: break-word; }

    .search-result-link:hover .result-title { color: #fff; }

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

        flex-shrink: 0;

    }

    .result-desc { color: #888; font-size: 0.9rem; line-height: 1.6; margin-left: 32px; }

    .view-hidden { display: none !important; }

</style>

<script src="https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.js"></script>

<script>

document.addEventListener('DOMContentLoaded', function () {

  

    // ── State ─────────────────────────────────────────────────────────────

    var fuse;

    var loadFailed  = false;

    var lastQuery   = '';

    var debounceTimer;

    var searchInput = document.getElementById('home-search-input');

    var resultsList = document.getElementById('home-search-results');

    var defaultView = document.getElementById('default-dashboard-view');

  

    // ── Helpers ───────────────────────────────────────────────────────────

  

    function slugify(text) {

        return text.toString().toLowerCase().trim()

            .replace(/&/g, '-and-')

            .replace(/[\s\W-]+/g, '-')

            .replace(/^-+|-+$/g, '');

    }

  

    function stripHtml(html) {

        var tmp = document.createElement('DIV');

        tmp.innerHTML = html;

        return tmp.textContent || tmp.innerText || '';

    }

  

    function expandTags(tags) {

        if (!tags || !tags.length) return [];

        var parts = new Set();

        tags.forEach(function (tag) {

            if (!tag || !tag.trim()) return;

            parts.add(tag.toLowerCase());

            tag.split('-').forEach(function (seg) {

                if (seg.length > 1) parts.add(seg.toLowerCase());

            });

        });

        return Array.from(parts);

    }

  

    function findBestMatch(item, term) {

        var sourceText     = item.tips || '';

        var rawDescription = item.description || '';

        var rawSummary     = stripHtml(item.summary || '');

  

        if (sourceText && term && sourceText.includes(':::')) {

            var parts = sourceText.split('|||');

            for (var i = 0; i < parts.length; i++) {

                var sep = parts[i].indexOf(':::');

                if (sep !== -1) {

                    var tagName = parts[i].substring(0, sep).trim();

                    var desc    = parts[i].substring(sep + 3).trim();

                    if (desc.toLowerCase().includes(term.toLowerCase())) {

                        return { text: '💡 ' + desc, anchor: slugify(tagName) };

                    }

                }

            }

        }

        if (rawDescription && term && rawDescription.toLowerCase().includes(term.toLowerCase())) {

            return { text: '📝 ' + rawDescription, anchor: '' };

        }

        var finalDesc = rawDescription || rawSummary || '';

        var clean = stripHtml(finalDesc)

            .replace(/^Box Info\s*/i, '')

            .replace(/^Pasted image\s.*/i, '');

        return { text: clean.substring(0, 180), anchor: '' };

    }

  

    function getTagTip(sourceText, targetTag) {

        if (targetTag && sourceText && sourceText.includes(':::')) {

            var parts = sourceText.split('|||');

            for (var i = 0; i < parts.length; i++) {

                var sep = parts[i].indexOf(':::');

                if (sep !== -1) {

                    var tagName = parts[i].substring(0, sep).trim();

                    var desc    = parts[i].substring(sep + 3).trim();

                    if (tagName.toLowerCase() === targetTag.toLowerCase()) return '💡 ' + desc;

                }

            }

        }

        return '';

    }

  

    // ── List Item Builder ─────────────────────────────────────────────────

  

    function createListItem(url, title, tag, desc) {

        var badgeHTML = tag

            ? '<div class="tag-badge notranslate" translate="no">' + tag + '</div>'

            : '';

        return '<li class="search-result-item">'

            + '<a href="' + url + '" class="search-result-link">'

            + '<div class="result-header">'

            + '<div class="result-title-group">'

            + '<div class="result-icon">'

            + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'

            + '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>'

            + '<polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>'

            + '<line x1="12" y1="22.08" x2="12" y2="12"></line>'

            + '</svg>'

            + '</div>'

            + '<div class="result-title">' + title + '</div>'

            + '</div>'

            + badgeHTML

            + '</div>'

            + '<div class="result-desc">' + desc + '</div>'

            + '</a>'

            + '</li>';

    }

  

    // ── Index Load ────────────────────────────────────────────────────────

  

    fetch('{{ "index.json" | absURL }}?v=' + new Date().getTime())

        .then(function (res) {

            return res.ok ? res.text() : Promise.reject('HTTP ' + res.status);

        })

        .then(function (text) {

            var start = text.indexOf('[');

            var end   = text.lastIndexOf(']') + 1;

            if (start === -1 || end <= start) throw new Error('Index JSON is empty or malformed');

            return JSON.parse(text.substring(start, end));

        })

        .then(function (data) {

            var enriched = data.map(function (item) {

                return Object.assign({}, item, {

                    tagsExpanded: expandTags(item.tags)

                });

            });

  

            fuse = new Fuse(enriched, {

                isCaseSensitive:    false,

                shouldSort:         true,

                minMatchCharLength: 1,

                threshold:          0.3,

                ignoreLocation:     true,

                keys: [

                    { name: 'tagsExpanded', weight: 10 },

                    { name: 'tags',          weight: 6  },

                    { name: 'tips',          weight: 4  },

                    { name: 'title',         weight: 3  }

                ]

            });

  

            var pending = searchInput.value.trim();

            if (pending) runSearch(pending);

        })

        .catch(function (err) {

            loadFailed = true;

            console.error('Search index failed to load:', err);

        });

  

    // ── Input ─────────────────────────────────────────────────────────────

  

    searchInput.addEventListener('input', function () {

        var val = this.value.trim();

        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(function () { runSearch(val); }, 120);

    });

  

    // ── Search ────────────────────────────────────────────────────────────

  

    function runSearch(term) {

        if (term && term === lastQuery) return;

        lastQuery = term;

        var seenPermalinks = new Set();

  

        if (!term) {

            resultsList.style.display = 'none';

            resultsList.innerHTML = '';

            defaultView.classList.remove('view-hidden');

            return;

        }

  

        defaultView.classList.add('view-hidden');

        resultsList.style.display = 'block';

  

        if (!fuse) {

            resultsList.innerHTML = '<li style="text-align:center;padding:30px;color:#666;list-style:none;font-family:\'JetBrains Mono\',monospace;">'

                + (loadFailed

                    ? '❌ Search index failed to load — check the browser console.'

                    : '⏳ Still loading, try again in a moment…')

                + '</li>';

            return;

        }

  

        var results     = fuse.search(term);

        var resultsHTML = '';

        var count       = 0;

        var termLower   = term.toLowerCase();

  

        results.forEach(function (value) {

            var item = value.item;

  

            if (seenPermalinks.has(item.permalink)) return;

  

            var validTags = (item.tags || []).filter(function (t) {

                return t && t.trim() && t.toLowerCase() !== 'blog';

            });

  

            var matchingTags = validTags.filter(function (t) {

                var tLower = t.toLowerCase();

                return tLower.includes(termLower)

                    || tLower.split('-').some(function (seg) {

                        return seg.includes(termLower);

                    });

            });

  

            if (matchingTags.length > 0) {

                // tag matched → show with badge

                seenPermalinks.add(item.permalink);

                matchingTags.forEach(function (tag) {

                    var tip = getTagTip(item.tips, tag) || findBestMatch(item, '').text;

                    var url = item.permalink + '#' + slugify(tag);

                    resultsHTML += createListItem(url, item.title, tag, tip);

                    count++;

                });

  

            } else if (item.title && item.title.toLowerCase().includes(termLower)) {

                // title matched → show without badge

                seenPermalinks.add(item.permalink);

                resultsHTML += createListItem(item.permalink, item.title, '', '');

                count++;

            }

            // anything else (only tips/content matched) → not shown

        });

  

        // ── Render ────────────────────────────────────────────────────────

  

        if (count > 0) {

  

            var dotColor, labelColor, message;

  

            if (count <= 20) {

                dotColor   = '#4caf50';

                labelColor = '#4caf50';

                message    = 'Found ' + count + ' result' + (count !== 1 ? 's' : '') + '.';

            } else if (count <= 60) {

                dotColor   = '#ffa726';

                labelColor = '#ffa726';

                message    = 'Found ' + count + ' results — consider narrowing down.';

            } else {

                dotColor   = '#ef5350';

                labelColor = '#ef5350';

                message    = 'Found ' + count + ' results — try being more specific.';

            }

  

            if (!document.getElementById('search-pulse-style')) {

                var style = document.createElement('style');

                style.id  = 'search-pulse-style';

                style.textContent = '@keyframes pulse {'

                    + '0%,100%{opacity:1;transform:scale(1)}'

                    + '50%{opacity:0.4;transform:scale(1.4)}'

                    + '}';

                document.head.appendChild(style);

            }

  

            var counterHTML = '<li style="'

                + 'display:flex;align-items:center;gap:8px;'

                + 'padding:8px 22px;'

                + 'font-size:0.78rem;'

                + 'font-family:\'JetBrains Mono\',monospace;'

                + 'border-bottom:1px solid #1a1a1a;'

                + 'margin-bottom:4px;'

                + 'list-style:none;'

                + 'pointer-events:none;">'

                + '<span style="width:8px;height:8px;border-radius:50%;flex-shrink:0;'

                +   'background:' + dotColor + ';'

                +   'box-shadow:0 0 6px ' + dotColor + ';'

                +   'animation:pulse 1.8s ease-in-out infinite;"></span>'

                + '<span style="color:' + labelColor + ';">' + message + '</span>'

                + '</li>';

  

            resultsList.innerHTML = counterHTML + resultsHTML;

  

        } else {

  

            resultsList.innerHTML = '<li style="'

                + 'list-style:none;'

                + 'padding:48px 20px;'

                + 'text-align:center;">'

  

                // icon

                + '<div style="'

                +   'width:48px;height:48px;'

                +   'border-radius:12px;'

                +   'background:rgba(239,83,80,0.08);'

                +   'border:1px solid rgba(239,83,80,0.2);'

                +   'display:inline-flex;align-items:center;justify-content:center;'

                +   'margin-bottom:16px;">'

                +   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef5350" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'

                +     '<circle cx="11" cy="11" r="8"></circle>'

                +     '<line x1="21" y1="21" x2="16.65" y2="16.65"></line>'

                +     '<line x1="8" y1="11" x2="14" y2="11"></line>'

                +   '</svg>'

                + '</div>'

  

                // title

                + '<p style="'

                +   'margin:0 0 6px;'

                +   'font-size:1rem;'

                +   'font-weight:700;'

                +   'color:#eee;'

                +   'font-family:\'JetBrains Mono\',monospace;">'

                +   'No results for &nbsp;<span style="color:#ef5350;">&quot;' + term + '&quot;</span>'

                + '</p>'

  

                // subtitle

                + '<p style="'

                +   'margin:0 0 20px;'

                +   'font-size:0.8rem;'

                +   'color:#555;'

                +   'font-family:\'JetBrains Mono\',monospace;">'

                +   'No boxes, tags, or titles matched your search'

                + '</p>'

  

                // suggestions

                + '<div style="'

                +   'display:inline-flex;gap:8px;flex-wrap:wrap;justify-content:center;">'

                +   '<span style="'

                +     'background:#141414;border:1px solid #222;'

                +     'color:#666;font-size:0.75rem;'

                +     'font-family:\'JetBrains Mono\',monospace;'

                +     'padding:4px 12px;border-radius:6px;">try a shorter word</span>'

                +   '<span style="'

                +     'background:#141414;border:1px solid #222;'

                +     'color:#666;font-size:0.75rem;'

                +     'font-family:\'JetBrains Mono\',monospace;'

                +     'padding:4px 12px;border-radius:6px;">use a tag segment</span>'

                +   '<span style="'

                +     'background:#141414;border:1px solid #222;'

                +     'color:#666;font-size:0.75rem;'

                +     'font-family:\'JetBrains Mono\',monospace;'

                +     'padding:4px 12px;border-radius:6px;">check spelling</span>'

                + '</div>'

  

                + '</li>';

        }

    }

  

});

</script>
```
