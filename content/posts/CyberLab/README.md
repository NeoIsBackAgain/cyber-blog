---
title: README
date: 2026-03-23
ShowToc: true
draft: false
TocOpen: true
password: SecuityFirst
isPrivate: true
tags:
  - blog
  - Misc
lastmod: 2026-06-15T06:17:12.264Z
---
# 🔐 NeoIsBackAgain's Cyber Security Blog

> A modern, self-hosted cyber security blog built with Hugo, Obsidian, and GitHub Pages\
> 一个现代化的自托管网络安全博客，使用 Hugo、Obsidian 和 GitHub Pages 构建

**[Live Demo](https://neoisbackagain.github.io/cyber-blog/)** | **[GitHub Repo](https://github.com/NeolsBackAgain/cyber-blog)**

***

## 📑 Table of Contents / 目錄

* [What is This?](#what-is-this) / [那是什麼？](#what-is-this)
* [Quick Start](#quick-start) / [快速開始](#quick-start)
* [Features](#features) / [特性](#features)
* [Directory Structure](#directory-structure) / [目錄結構](#directory-structure)
* [Installation](#installation) / [安裝](#installation)
* [How to Run](#how-to-run) / [如何運行](#how-to-run)
* [How to Use](#how-to-use) / [如何使用](#how-to-use)
* [Shortcodes Guide](#shortcodes-guide) / [短代碼指南](#shortcodes-guide)
* [Password Protection](#password-protection) / [密碼保護](#password-protection)
* [Tags System](#tags-system) / [標籤系統](#tags-system)
* [Search Function](#search-function) / [搜索功能](#search-function)
* [Deployment](#deployment) / [部署](#deployment)
* [Troubleshooting](#troubleshooting) / [故障排除](#troubleshooting)
* [Contributing](#contributing) / [貢獻](#contributing)
* [To-Do List](#to-do-list) / [待辦清單](#to-do-list)

***

## What is This?

This is a **personal cyber security blog** where I document my journey through:

* 🎯 **HackTheBox (HTB)** writeups and walkthroughs
* 🔓 **OffSec** certification labs and OSCP preparation
* 🐛 **Bug Bounty** findings and CVE research
* 🛠️ **Miscellaneous** security tools and techniques

The blog is powered by:

* **Hugo** - Static site generator for blazing-fast performance
* **PaperMod Theme** - Minimal, elegant design
* **Obsidian** - Seamless markdown note-taking and publishing
* **GitHub Pages** - Free hosting with automatic CI/CD
* **Fuse.js** - Client-side full-text search

### 那是什麼？

這是一個**個人網絡安全博客**，記錄我的安全研究之旅，包括：

* 🎯 **HackTheBox (HTB)** 寫作和演練
* 🔓 **OffSec** 認證實驗室和 OSCP 準備
* 🐛 **Bug Bounty** 發現和 CVE 研究
* 🛠️ **雜項** 安全工具和技術

***

## Quick Start

### For Readers 📖

1. Visit [the live blog](https://neoisbackagain.github.io/cyber-blog/)
2. Browse by category: HTB, OffSec, Bug Bounty, or Tags
3. Use the search bar to find specific topics
4. Enter password if content is protected

### For Developers 👨‍💻

```bash
# Clone the repository
git clone --recursive https://github.com/NeolsBackAgain/cyber-blog.git
cd cyber-blog

# Install Hugo (if not installed)
brew install hugo  # macOS
choco install hugo # Windows
apt install hugo   # Linux

# Run locally
hugo server -D

# Visit http://localhost:1313/cyber-blog/
```

***

## Features

### 🎨 **Design & UX**

* ✅ Dark mode optimized (default)
* ✅ Light mode support
* ✅ Responsive mobile design
* ✅ Fast page loads (<1s)
* ✅ Syntax highlighting with Chroma
* ✅ Custom shortcodes
* ✅ TOC (Table of Contents)

### 🔒 **Content Management**

* ✅ Password-protected posts
* ✅ Draft/publish control
* ✅ Front matter metadata
* ✅ Multi-language support (English/Chinese)
* ✅ Post scheduling

### 🔍 **Search & Discovery**

* ✅ Full-text search with Fuse.js
* ✅ Tag-based filtering
* ✅ Category organization
* ✅ Archive by date
* ✅ Related posts

### 🚀 **Developer Features**

* ✅ GitHub Actions CI/CD
* ✅ Automatic deployment
* ✅ Version control integration
* ✅ Hugo minification
* ✅ Asset optimization

### 🔐 **Security**

* ✅ Password protection for sensitive content
* ✅ Session-based unlock (no persistent storage)
* ✅ Static site (no server vulnerabilities)

***

## Directory Structure

```
📂 cyber-blog/
│
├── 📁 archetypes/
│   └── 📝 default.md                    # Post template
│
├── 📁 content/
│   ├── 📁 posts/                        # Individual posts
│   ├── 📁 htb/                          # HackTheBox category
│   ├── 📁 offsec/                       # OffSec category
│   └── 📁 bugbounty/                    # Bug Bounty category
│
├── 📁 layouts/                          # Custom Hugo layouts
│   ├── 📁 _default/
│   │   ├── 🌐 single.html               # Single post layout
│   │   ├── 🌐 list.html                 # List page layout
│   │   ├── 🌐 bugbounty_list.html       # Category list
│   │   ├── 🌐 htb_list.html             # HTB category
│   │   ├── 🌐 offsec_list.html          # OffSec category
│   │   └── 📦 index.json                # Search index
│   │
│   ├── 📁 partials/                     # Reusable components
│   │   ├── 🌐 password-protect.html     # Password wall
│   │   ├── 🌐 index_profile.html        # Home profile
│   │   ├── 🌐 ctf_card.html             # CTF card component
│   │   └── 🌐 extend_footer.html        # Footer extensions
│   │
│   └── 📁 shortcodes/                   # Custom shortcodes
│       ├── 🌐 tech-stack.html           # Tech stack display
│       ├── 🌐 tree.html                 # Directory tree
│       ├── 🌐 code.html                 # Code highlighting
│       ├── 🌐 mindmap.html              # Mind map
│       ├── 🌐 mermaid.html              # Mermaid diagrams
│       └── 🌐 tag.html                  # Tag display
│
├── 📁 static/                           # Static assets
│   ├── 📁 images/
│   │   ├── 🖼️ htb.gif
│   │   ├── 🖼️ offsec.png
│   │   ├── 🖼️ BugBounty.png
│   │   └── 🖼️ misc.png
│   │
│   ├── 📁 js/
│   │   └── 🟨 code-collapse.js
│   │
│   └── 📁 ob/                           # Obsidian assets
│
├── 📁 themes/
│   └── 📁 PaperMod/                     # PaperMod theme
│       ├── 📁 assets/
│       │   ├── 📁 css/
│       │   │   ├── 📁 common/           # Common styles
│       │   │   ├── 📁 core/             # Core styles
│       │   │   └── 📁 extended/
│       │   │       └── 🎨 custom.css    # Custom overrides
│       │   │
│       │   └── 📁 js/
│       │       ├── 🟨 fastsearch.js
│       │       ├── 🟨 fuse.basic.min.js
│       │       └── 🟨 toc.js
│       │
│       └── 📁 layouts/                  # Theme layouts
│
├── 📁 resources/                        # Hugo generated resources
│   └── 📁 _gen/
│       ├── 📁 assets/
│       └── 📁 images/
│
├── 📁 public/                           # Generated website (git ignored)
│
├── 📁 .github/
│   └── 📁 workflows/
│       ├── 📄 deploy.yml                # GitHub Actions deployment
│       └── 📄 hugo.yaml                 # Hugo build workflow
│
├── 📄 hugo.toml                         # Hugo configuration
├── 📄 README.md                         # This file
└── 📄 .gitignore                        # Git ignore rules
```

***

## Installation

### Prerequisites

* **Hugo Extended** v0.120+ ([Download](https://gohugo.io/installation/))
* **Git** ([Download](https://git-scm.com/))
* **Node.js** (optional, for asset building)
* **GitHub Account** (for GitHub Pages hosting)

### Clone Repository

```bash
# Clone with submodules (theme)
git clone --recursive https://github.com/NeolsBackAgain/cyber-blog.git
cd cyber-blog

# Or if you forgot --recursive
git submodule update --init --recursive
```

### Local Setup

```bash
# Install dependencies (if using npm)
npm install

# Or just run Hugo directly
hugo server -D

# Access at http://localhost:1313/cyber-blog/
```

### GitHub Pages Setup

1. **Fork or Clone** the repository
2. **Enable GitHub Pages:**
   * Go to Settings → Pages
   * Set source to "GitHub Actions"
3. **Configure Repository:**
   * Make repository PUBLIC
   * Keep `.github/workflows/` files
4. **Push changes** - GitHub Actions will auto-deploy

***

## How to Run

### Local Development

#### Windows (Docker Recommended)

```powershell
# Navigate to blog directory
cd C:\Users\user\Documents\GitHub\cyber-blog

# Run Hugo in Docker
docker run --rm -p 1313:1313 -v "${PWD}:/src" -w /src cibuilds/hugo:0.150.0 hugo server -D --bind 0.0.0.0
```

#### macOS / Linux

```bash
# Direct Hugo command
hugo server -D

# Or with watch and live reload
hugo server -D --watch

# For production build
hugo --minify
```

### Build for Production

```bash
# Clean and rebuild
hugo clean
hugo --minify

# Output goes to /public directory
```

### Deploy to GitHub Pages

```bash
# Push to main branch
git add .
git commit -m "Update content"
git push origin main

# GitHub Actions will automatically build and deploy
# Check Actions tab for deployment status
```

***

## How to Use

### Creating a New Post

#### Option 1: Using Obsidian + Hugo Publish Plugin

1. **Install Plugin:**

   * Open Obsidian Settings → Community Plugins
   * Search for "Hugo Publish"
   * Install and enable
2. **Configure Plugin:**

   * Settings → Hugo Publish
   * Site Directory: `/Users/user/Documents/GitHub/cyber-blog/` (macOS/Linux)
   * Blog Directory: `content/posts`
3. **Create & Publish:**

   * Write your post in Obsidian
   * Add to frontmatter: `publish: true`
   * Plugin auto-converts and moves to Hugo

#### Option 2: Manual Creation

```bash
# Create new post file
hugo new content/posts/my-post.md

# Edit the file
nano content/posts/my-post.md
```

#### Post Template

```yaml
---
title: "My Awesome Writeup"
date: 2026-03-23
draft: false
tags:
  - blog
  - HTB
  - easy
description: "Brief description of the post"
cover:
  image: "images/cover.png"
  alt: "Cover image"
isPrivate: false
password: ""
---

# Your content here...
```

***

## Shortcodes Guide

### 1️⃣ Tech Stack Shortcode

Display technology information in a styled box.

**File:** `layouts/shortcodes/tech-stack.html`

**Usage:**

```markdown
{{< tech-stack >}}
OS: Ubuntu Linux
Web Server: Apache/2.4.52
Language: PHP 8.1
Database: MySQL 8.0
Application: Zabbix
{{< /tech-stack >}}
```

**Output:** Displays in a styled tech window with icon and colors

***

### 2️⃣ Directory Tree Shortcode

Display directory structure with icons.

**File:** `layouts/shortcodes/tree.html`

**Usage:**

```markdown
{{< tree >}}
📂 project/
├── 📁 src/
│   ├── 🐍 main.py
│   └── 🐍 utils.py
├── 📁 tests/
│   └── 🧪 test_main.py
└── 📄 README.md
{{< /tree >}}
```

***

### 3️⃣ Code Shortcode

Enhanced code highlighting with collapse functionality.

**File:** `layouts/shortcodes/code.html`

**Usage:**

```markdown
{{< code language="python" title="Example Script" >}}
def hello_world():
    print("Hello, World!")
{{< /code >}}
```

***

### 4️⃣ Mindmap Shortcode

Create interactive mind maps using Markmap.

**File:** `layouts/shortcodes/mindmap.html`

**Usage:**

```markdown
{{< mindmap >}}
- Root Node
  - Branch 1
    - Leaf 1.1
    - Leaf 1.2
  - Branch 2
    - Leaf 2.1
{{< /mindmap >}}
```

***

### 5️⃣ Mermaid Shortcode

Create diagrams, flowcharts, and more.

**File:** `layouts/shortcodes/mermaid.html`

**Usage:**

```markdown
{{< mermaid >}}
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
{{< /mermaid >}}
```

**Supported Diagrams:**

* Flowcharts
* Sequence diagrams
* State diagrams
* Class diagrams
* ER diagrams
* Gantt charts

***

### 6️⃣ Tag Shortcode

Display tags with styling.

**File:** `layouts/shortcodes/tag.html`

**Usage:**

```markdown
{{< tag "HTB" "easy" "Linux" >}}
```

***

### Custom CSS for Shortcodes

Edit in: `themes/PaperMod/assets/css/extended/custom.css`

```css
/* Tech Stack Window */
.custom-tech-window {
  background-color: #1a1b26;
  border: 1px solid #292e42;
  border-left: 4px solid #1e90ff;
  border-radius: 6px;
  margin: 1.5em 0;
  padding: 15px;
}

.tech-titlebar {
  background-color: #1f2335;
  border-bottom: 1px solid #292e42;
  padding: 8px 15px;
}

.tech-label {
  color: #7aa2f7;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

***

## Password Protection

### 🔐 Protect Sensitive Posts

**Features:**

* ✅ Session-based storage (not persistent)
* ✅ Password entered per session
* ✅ Eye icon toggle to show/hide password
* ✅ Smooth blur backdrop
* ✅ Mobile responsive

### Setup

1. Add to post frontmatter:

```yaml
isPrivate: true
password: "your-secure-password"
```

2. Password wall appears automatically
3. Users enter password to unlock content
4. Session remembered for current browser session

### Example Post

```markdown
---
title: "OSCP Exam Brain Dump"
date: 2026-03-23
draft: false
isPrivate: true
password: "MySecurePass123"
tags:
  - blog
  - offsec
  - oscp
---

# Exam Notes (Password Protected)

This content is hidden until the correct password is entered...
```

### Security Notes

⚠️ **Important:**

* Passwords visible in Git history (don't use real passwords)
* For truly sensitive content, use server-level auth
* Frontend protection only - not cryptographic
* Use for access control, not data encryption

***

## Tags System

### Reserved Classification Tags

These tags have special meanings and appear as categories:

#### 📦 Blog Classifiers

```yaml
# Main blog post
tags:
  - blog
```

#### 🎯 CTF Categories

```yaml
# HackTheBox
tags:
  - blog
  - HTB

# OffSec
tags:
  - blog
  - offsec

# Bug Bounty
tags:
  - BugBounty
  - HackerOne
  - High
  - blog

# Miscellaneous
tags:
  - Blog
  - Misc
```

### Topic Tags

Organized by attack vector and technique:

#### 🌐 Web Exploitation

```
- Web-SourceCode-DataLeak
- OWASP-SQL-Inject
- OWASP-Local-File-Inclusion-LFI
- OWASP-Remote-File-Inclusion-RFI
- OWASP-XSLT-inject
- web-github-abuse
- Web-login-bruteForce
```

#### 🔓 Credential Access

```
- account-bruteforce
- password-cracking
- password-deformation
- kerberbrute
- BruteForce-Web-Directory-Feroxbuster
- BruteForce-Web-Directory-gobuster
- BruteForce-subdomain-Feroxbuster
```

#### 📡 Network Services

```
- Port21-FTP-anonymous
- Port22-SSH-tunnel
- Port53-DNS-Discovery-Host
- Port88-LDAP-Kerbrute
- Port139-135-SMB-anonymous-login
- Port3389-rdp-xfreerdp
- Port5985-winrm-evil-winrm-py
```

#### 💻 Privilege Escalation

```
- Windows-Privilege-Escalation-*
- Linux-Privilege-Escalation-*
- Lateral-Movement-*
```

#### 🧛 Post-Exploitation

```
- bloodhound
- Impersonate-Token
- mimikatz
- velociraptor
```

#### 🔧 Tools & Techniques

```
- nmap
- netexec
- sqlmap
- mssql-login
- smb-login-with-hash
```

### Create Custom Tags

Follow the naming convention:

```
{Category}-{Technique}-{Detail}
```

Examples:

* `Port88-LDAP-Kerbrute` → Port 88, LDAP, using Kerbrute
* `Windows-Privilege-Escalation-SeImpersonatePrivilege` → Windows privesc via token
* `Linux-Privilege-Escalation-docker-compose` → Linux privesc via Docker

***

## Search Function

### How It Works

The search uses **Fuse.js**, a lightweight client-side full-text search library.

**Index file:** `layouts/_default/index.json`

**Search index includes:**

* Post titles
* Post content
* Post summaries
* Tags
* Custom "tips" from shortcodes

### Search Configuration

In `hugo.toml`:

```toml
[params.fuseOpts]
  isCaseSensitive = false
  shouldSort = true
  location = 0
  distance = 1000
  threshold = 0.4
  minMatchCharLength = 0
  keys = ["title", "tips", "summary", "content"]
```

**Configuration meanings:**

* `threshold: 0.4` → Fuzzy matching tolerance (0-1)
* `distance: 1000` → Max character distance for matching
* `keys` → Fields to search

### Exclude Posts from Search

Posts with `isPrivate: true` are automatically excluded from search index.

### Improve Search Accuracy

1. **Add summary:** Include `summary` in frontmatter
2. **Use keywords in title:** More specific titles rank higher
3. **Tag properly:** Relevant tags improve discovery
4. **Add descriptions:** `description` field helps search

### Search Tips for Users

* ⚡ **Fuzzy search:** "HTB easy linux" matches "HackTheBox easy Linux"
* 🔤 **Case insensitive:** "OSCP" = "oscp"
* 🎯 **Tag search:** Searching "HTB" filters HTB posts
* 📊 **Score ranking:** Results ranked by relevance

***

## Deployment

### GitHub Pages Deployment

**Automatic (Recommended):**

The `.github/workflows/` handles everything automatically.

```yaml
# Deploy on push to main branch
On: push to main
├─ Build Hugo
├─ Upload artifacts
└─ Deploy to GitHub Pages
```

**Manual Push:**

```bash
git add .
git commit -m "Add new post"
git push origin main
```

### Custom Domain

1. Add `CNAME` file to `static/` directory with your domain
2. Configure DNS to point to GitHub Pages
3. Enable HTTPS in Settings

### Cloudflare (Optional)

1. Add domain to Cloudflare
2. Set nameservers
3. Create CNAME record to `username.github.io`
4. Enable "Flexible SSL"

### Performance Optimization

Hugo automatically:

* ✅ Minifies CSS/JS
* ✅ Optimizes images
* ✅ Compresses output
* ✅ Caches resources

**Additional optimization:**

* Use Cloudflare for CDN
* Enable image lazy loading
* Minimize custom JavaScript

***

## Troubleshooting

### Posts not appearing

**Solution:**

```bash
# Check if draft: false
# Check if date is not in future
hugo server -D --logLevel debug

# Rebuild cache
rm -rf resources/
hugo server -D
```

### Search not working

**Check:**

* \[ ] `index.json` exists in `layouts/_default/`
* \[ ] Hugo build completes without errors
* \[ ] Browser console has no JavaScript errors
* \[ ] Clear browser cache (Ctrl+Shift+Del)

```bash
# Verify index generation
cat public/index.json | head -20
```

### CSS/styling broken

**Solution:**

```bash
# Clear Hugo cache
hugo clean
rm -rf resources/

# Rebuild
hugo server -D

# Hard refresh browser (Ctrl+Shift+R)
```

### GitHub Actions failing

**Check logs:**

1. Go to GitHub repo → Actions tab
2. Click on failed workflow
3. Expand logs to see error
4. Common issues:
   * Hugo version mismatch
   * Missing submodule
   * Permission errors

**Fix:**

```bash
# Ensure theme submodule is present
git submodule update --init --recursive

# Push changes
git add .
git commit -m "Fix submodule"
git push
```

### Password protection not working

**Check:**

```yaml
# Must have both:
isPrivate: true
password: "your-password"

# In single.html must include:
{{ partial "password-protect.html" . }}

# CSS must be in custom.css
```

**Verify:**

1. Check browser console (F12)
2. Confirm sessionStorage enabled
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R)

### Obsidian Hugo Publish not working

**Setup:**

1. Install "Hugo Publish" plugin
2. Settings → Hugo Publish:
   * Site Directory: `/path/to/cyber-blog`
   * Blog Directory: `content/posts`
3. Add `publish: true` to post frontmatter

**Troubleshoot:**

```bash
# Check plugin path
ls -la ~/Obsidian\ Vault/.obsidian/plugins/

# Verify file was created
ls -la content/posts/
```

***

## Contributing

### Fork & Submit PRs

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Report Issues

Found a bug? [Open an issue](https://github.com/NeolsBackAgain/cyber-blog/issues)

Include:

* Bug description
* Steps to reproduce
* Expected vs actual behavior
* Screenshots if applicable

***

## To-Do List

### 📌 Current Features

* \[x] Hugo blog structure
* \[x] PaperMod theme integration
* \[x] Obsidian Hugo Publish plugin
* \[x] GitHub Pages deployment
* \[x] Full-text search (Fuse.js)
* \[x] Tag system
* \[x] Password protection
* \[x] Shortcodes (tech-stack, tree, mindmap, mermaid)
* \[x] Dark mode support
* \[x] Mobile responsive design
* \[x] Syntax highlighting

### 🚀 Planned Features

* \[ ] Comments system (Disqus/Giscus)
* \[ ] Reading time estimation
* \[ ] Related posts suggestions
* \[ ] Email newsletter integration
* \[ ] Social media sharing
* \[ ] Advanced analytics (privacy-focused)
* \[ ] Multi-language support (i18n)
* \[ ] Post recommendations
* \[ ] Author bio/contact page
* \[ ] Search filter by date range
* \[ ] PDF export functionality
* \[ ] Dark/Light mode toggle
* \[ ] RSS feed optimization

### 🐛 Bug Fixes

* \[ ] Search performance on large databases
* \[ ] Mobile menu optimization
* \[ ] Image lazy loading
* \[ ] Cache busting strategy
* \[ ] SEO meta tags optimization

### 📚 Documentation

* \[x] Complete README
* \[ ] Video tutorials
* \[ ] Setup guide for beginners
* \[ ] Custom theme guide
* \[ ] API documentation
* \[ ] Contributing guidelines

### 🎨 Design Improvements

* \[ ] Custom color schemes
* \[ ] Theme switcher UI
* \[ ] Animation refinements
* \[ ] Typography updates
* \[ ] Icon library expansion

***

## Acknowledgments

This blog wouldn't be possible without:

* **Hugo** - Static site generator
* **PaperMod Theme** - Beautiful minimal theme
* **Obsidian** - Amazing markdown editor
* **GitHub** - Free hosting and CI/CD
* **Fuse.js** - Fast client-side search
* **Markmap** - Mind map visualization
* **Mermaid** - Diagram as code
* **ChatGPT & Gemini** - AI assistance for content

Special thanks to the security community for knowledge sharing!

***

## Resources & References

### Official Documentation

* [Hugo Docs](https://gohugo.io/documentation/)
* [PaperMod Docs](https://github.com/adityatelange/hugo-PaperMod)
* [GitHub Pages](https://pages.github.com/)
* [Obsidian Help](https://help.obsidian.md/)

### Learning Resources

* [HackTheBox](https://www.hackthebox.com/)
* [TryHackMe](https://tryhackme.com/)
* [OffSec Training](https://www.offsec.com/)
* [HackerOne](https://www.hackerone.com/)

### Referenced Blogs

* [0xdf](https://0xdf.gitlab.io/) - HTB writeups
* [IppSec](https://www.youtube.com/c/IppSec) - HTB video solutions
* [HackerInside](https://hackerinside.tw/) - Taiwan security blog

### Tools & Technologies

* [Nmap](https://nmap.org/) - Port scanning
* **NetExec** (ex-CrackMapExec) - Post-exploitation
* [Hashcat](https://hashcat.net/) - Password cracking
* [Burp Suite](https://portswigger.net/burp) - Web testing
* [Metasploit](https://www.metasploit.com/) - Exploitation framework

***

## License

This blog content is licensed under **CC BY-SA 4.0** (Creative Commons Attribution-ShareAlike 4.0 International).

You are free to:

* ✅ Share and adapt the content
* ✅ Use for any purpose
* ✅ Modify and improve

You must:

* ✅ Give attribution
* ✅ Share under same license

The Hugo theme (PaperMod) is licensed under MIT License.

***

## Contact & Social

* 🐙 **GitHub:** [@NeolsBackAgain](https://github.com/NeolsBackAgain)
* 🔗 **HackTheBox:** [Profile](https://www.hackthebox.eu/badge/YOUR_ID)
* 📧 **Email:** <your-email@example.com>
* 🌐 **Website:** [neoisbackagain.github.io/cyber-blog](https://neoisbackagain.github.io/cyber-blog/)

***

## Changelog

### v2.0.0 (2026-03-23)

* ✨ Added modern password protection UI
* 🎨 Redesigned password dialog with glass-morphism
* 🔍 Improved search functionality
* 📱 Better mobile responsiveness
* 🐛 Fixed various CSS issues
* 📚 Complete README documentation

### v1.5.0

* Added Mermaid diagram support
* Improved shortcode functionality
* Enhanced dark mode

### v1.0.0

* Initial blog setup
* Hugo + PaperMod integration
* GitHub Pages deployment

***

## FAQ

**Q: Can I copy your posts?** A: Yes! Content is CC BY-SA 4.0. Just attribute and share under same license.

**Q: How often do you update?** A: Depends on lab schedule and blog motivation! Follow RSS for updates.

**Q: Can I use this template?** A: Absolutely! Fork the repo and customize for your needs.

**Q: How do you protect password posts?** A: Session-based storage on client-side. View source for implementation.

**Q: What's your setup for writing?** A: Obsidian → Hugo Publish plugin → GitHub → GitHub Pages

**Q: Can I contribute?** A: Yes! Submit PRs or suggest improvements via Issues.

***

## Footer

Made with ❤️ for the security community

```
  ___  _               _           _____
 / _ \| |_ _____ _ __ | |__ __ _ _|  ___|__   __ ___
|  O ||   |___ \_\| '_ \| | __/ _` |___|__ \ / _/ _ \
| _^_||_ |_ / / / | |_) | | (_(_||    _| |_|| (_| (_) |
|_| |_| \___\____/| .__/|_|\__\__,|_|____|_|_|\__\___/
                  |_|

```

***

**Last Updated:** March 23, 2026\
**Blog Status:** 🟢 Active & Maintained\
**Next Update:** TBD

Happy hacking! 🔐🎯
