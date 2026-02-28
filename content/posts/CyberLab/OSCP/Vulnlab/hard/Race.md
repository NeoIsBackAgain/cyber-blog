---
title: Race
date: 2026-02-26
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Linux
  - hard
lastmod: 2026-02-28T07:47:46.105Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Race" >}}

***

# Recon 10.129.234.X

### \[\[PORT & IP SCAN]]

The `nmap` reveal that the machine is ((change it) a standard Windows AD Server , with the kerberos auth , also the ldap query , and the 3389 port show that the domain `AWSJPDC0522.shibuya.vl` ,but the ldap anonymous inquiry failed .)

```
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.209 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-27 23:36 -0500
Nmap scan report for 10.129.234.209
Host is up (0.21s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 62:b0:1e:c5:e8:81:5c:94:39:ed:37:7e:21:cf:b1:a8 (ECDSA)
|_  256 37:a3:d3:cd:35:dc:cc:d8:db:3c:c3:4d:ad:22:29:a9 (ED25519)
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.52 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.34 seconds

```

***

### Web Recon 80

### Tech stack

The website is teched by the Grav and Apache\
![Pasted image 20260228124400.png](/ob/Pasted%20image%2020260228124400.png)

```
HTTP/1.1 200 OK
Date: Sat, 28 Feb 2026 04:43:17 GMT
Server: Apache/2.4.52 (Ubuntu)
Set-Cookie: grav-site-09f1269=6uc709lko5c2qhinueon58ahep; expires=Sat, 28-Feb-2026 05:13:17 GMT; Max-Age=1800; path=/racers/; domain=10.129.234.209; HttpOnly; SameSite=Lax
Expires: Sat, 07 Mar 2026 04:43:17 GMT
Cache-Control: max-age=604800
Pragma: no-cache
ETag: "63615382783200e59481e1e26cd19ae7"
Content-Length: 11411
Connection: close
Content-Type: text/html;charset=UTF-8
```

### \[\[WebSite Directory BurteForce]]

```
└─# feroxbuster -u http://10.129.234.209/ -x php -n 
                                                                                                                    
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.129.234.209/
 🚩  In-Scope Url          │ 10.129.234.209
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.13.1
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 💲  Extensions            │ [php]
 🏁  HTTP methods          │ [GET]
 🚫  Do Not Recurse        │ true
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
403      GET        9l       28w      279c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
404      GET        9l       31w      276c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET        8l       16w      163c http://10.129.234.209/
401      GET       14l       54w      461c http://10.129.234.209/phpsysinfo
[####################] - 3m     60002/60002   0s      found:2       errors:0      
[####################] - 3m     60000/60000   358/s   http://10.129.234.209/     
```

found the `phpinfo`

![Pasted image 20260228125601.png](/ob/Pasted%20image%2020260228125601.png)

![Pasted image 20260228125625.png](/ob/Pasted%20image%2020260228125625.png)

![Pasted image 20260228125745.png](/ob/Pasted%20image%2020260228125745.png)

Found the command `backup` : `Wedobackupswithsecur3password5`

```
/usr/bin/curl --insecure --connect-timeout 60 -u backup:Wedobackupswithsecur3password5.Noonecanhackus! -T /var/www/html/racers/backup/ sftp://offsite-backup.race.vl/backups/
```

But dont work

![Pasted image 20260228130230.png](/ob/Pasted%20image%2020260228130230.png)

but `backup` : `Wedobackupswithsecur3password5`  is work in http://10.129.234.209/racers/admin

![Pasted image 20260228130359.png](/ob/Pasted%20image%2020260228130359.png)

![Pasted image 20260228130531.png](/ob/Pasted%20image%2020260228130531.png)
