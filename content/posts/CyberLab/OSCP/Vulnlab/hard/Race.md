---
title: Race
date: 2026-02-26
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
lastmod: 2026-02-26T15:29:07.577Z
---
# Box Info

Race is a hard-difficulty Linux machine with a web application running Grav CMS and `phpsysinfo`. The `phpsysinfo` endpoint is protected with basic authentication, but its password is weak. The endpoint leaks credentials for the Grav CMS admin panel, which is accessible to a low-privilege user with permission to create web server backups. The attacker exploits the backup functionality to retrieve the rest token for a user with privileges to add a proxy and install themes. The attacker adds a proxy to intercept the response, uploads a custom theme, and gets a reverse shell. After gaining a reverse shell, the attacker is able to read sensitive files using a hardcoded password for the `max` user account. The `max` user account is a `racers` group member, which has write permission over a file vulnerable to a time-of-check / time-of-use vulnerability in a cron script. As an attacker, we will create named pipes to suspend execution and replace the file, thereby gaining command execution as root.

***
