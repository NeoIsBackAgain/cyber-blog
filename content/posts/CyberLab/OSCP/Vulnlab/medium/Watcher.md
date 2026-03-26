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
lastmod: 2026-03-24T08:41:32.572Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/watcher" >}}

***

# Recon

### \[\[PORT & IP SCAN]]

The `nmap`  Scan is fast within 3 min , and which is the Linux machine by Ubuntu .

The Apache httpd 2.4.52 will redirect to another page , it may accept other request method

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

The port of 10050 and 10050 , the nmap shows that is tcpwrapped , The service is running, but the connection was dropped , so i will check it at the end

but i will check the port of `43047` first due to that is not too hard to find any exploit in there , after that i will back to http 80

### 43047 Java RMI

https://hacktricks.wiki/en/network-services-pentesting/1099-pentesting-java-rmi.html?highlight=RMI#rmi-**components**

```
$ sudo apt install maven -y
$ git clone https://github.com/qtc-de/remote-method-guesser
$ cd remote-method-guesser
$ mvn package
```

```
java -jar target/rmg-5.1.0-jar-with-dependencies.jar guess 10.129.234.163 43047
```

```
──(parallels㉿kali-linux-2025-2)-[~/Desktop/remote-method-guesser]
└─$ java -jar /home/parallels/Desktop/remote-method-guesser/target/rmg-5.1.0-jar-with-dependencies.jar guess 10.129.234.163 43047
[-] Caught NoSuchObjectException during RMI call.
[-] There seems to be no registry object available on the specified endpoint.
[-] Cannot continue from here.

```

ok , next one

when i go to the http://10.129.234.163 , it will redirect to http://watcher.vl/

Therefore , i will add the watcher.vl into the /etc/hosts

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

after added , the website will be success loaded

![Pasted image 20260323230943.png](/ob/Pasted%20image%2020260323230943.png)

before to do the next , i will like to increase the attack area , like to do the subdomain brute-force to see there are any other subdomain in here

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

add into /etc/hosts

```
10.129.234.163  watcher.vl zabbix.watcher.vl
```

### zabbix.watcher.vl

![Pasted image 20260323231656.png](/ob/Pasted%20image%2020260323231656.png)

I noted that there is the option for `sign in as guest`

### Tech stack

![Pasted image 20260323231740.png](/ob/Pasted%20image%2020260323231740.png)

```
php 
Apache/2.4.52 (Ubuntu) Server at zabbix.watcher.vl Port 80
```

### watcher.vl

### Tech stack

### Web Recon 80

### \[\[WebSite Directory BurteForce]]

```
```

### \[\[Exploit-CVE]]  & \[\[Default 404 Pages]]

```
whatweb http://example.com to find the version
```

```
curl https://example.com/404
```

### \[\[git recon]]

```shell
└─#  nmap -p 80 -sCV uat.curryroomhk.com
                                                                    
```

***
