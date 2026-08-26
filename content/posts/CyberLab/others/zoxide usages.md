---
title: Z usages
date: 2026-06-11
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - Misc
lastmod: 2026-07-24T06:10:21.230Z
---
# Info

> zoxide is a **smarter cd command**, inspired by z and autojump.

> It remembers which directories you use most frequently, so you can "jump" to them in just a few keystrokes.   zoxide works on all major shells.

***

```
┌─[tester@parrot]─[/opt]
└──╼ $curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh
Detected architecture: x86_64-unknown-linux-musl
Downloaded package: zoxide.tar.gz
Installed zoxide to /home/tester/.local/bin
Installed manpages to /home/tester/.local/share/man

zoxide is installed!
```

```
alias ls='ls -a'
eval "$(zoxide init bash)"
alias cd='z'

```
