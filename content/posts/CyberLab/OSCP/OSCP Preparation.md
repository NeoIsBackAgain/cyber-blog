---
title: OSCP Preparation
date: 2026-06-06
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
lastmod: 2026-06-11T03:54:38.587Z
---
***

# Hardware

* My Macbook
* Extra screen
* My Company ThinkPad Parrot os

***

# AI

* I will setup the POE to have the claude , and speed all token in one day
* and then use the discode to transfer the fille

***

### Past paper Preparation

* FTP exploit
* winpeas
* linpeas
* mimikatz
* Powerview usage
* `.\mimikatz.exe "privilege::debug" "token::elevate" "sekurlsa::msv" "lsadump::sam" "exit"` 這個指令會自動執行 Mimikatz，並將所有網域及本機的哈希值都儲存下來。另一個建議是，一定要花時間仔細檢查所有的哈希值。我經常看到這種情況：有些人已經取得了網域管理員的哈希值，但因為他們以為那只是本機管理員的哈希值，所以沒有注意到它。
* 你不必去感受我的痛苦，其實很簡單的。只要使用 SweetPotato 就行。我之前曾在這裡分享過預先編譯好的版本，但 Google 將我的整個部落格標記為「含有惡意程式碼」，因此我不能再這樣做了。不過，這也解釋了為何在 Github 上找不到預先編譯好的二進位檔案……或許我會在將來撰寫一篇指南，教大家如何自行編譯它。
* 要提權的話，如果你正在跑 (win|lin)peas，你應該把輸出導向到 netcat 監聽器，這樣你就能在你的 Kali 主機上得到一份本地副本。然後你可以執行 bat winpeas.txt，就能用彩色慢慢滾動結果了。
* checkList

***

### OSCP Leak

* https://www.scribd.com/document/977098481/OSCP-OS-57186425-Exam-Report
* https://www.gm7.org/archives/18123
* https://www.aqniukt.com/my/course/19927/notes?type=notes\&page=1
* https://github.com/goshs-labs/goshs

### Active Directory Tech  https://notes.benheater.com/books/active-directory

1.

First is check the smb shares\
sudo ntpdate voleur.htb\
bloodhound

In the windows (AD)

1. net user yourname  https://neoisbackagain.github.io/cyber-blog/posts/cyberlab/oscp/vulnlab/insane/multimaster/#windows-enumation-net-user
2. tree /f .  the users home
3. check the C:/ , every file which should not be here
4. LaZagne.exe , LIke IT , backup , secuity
5. If not , back to step one to check

* RunasCS 作為其他使用者的生成程序
* mimikatz 此指令需要提升權限（例如先前執行 privilege：:d ebug 或以 `NT-AUTHORITY\SYSTEM` 帳號執行 Mimikatz）。
* Data leak
* Window Credentials Leak 憑證洩漏
* getST
* sudo rlwrap -cAr nc -lnvp 443
* krb5-user

### Windows Tech

```
C:\inetpub\wwwroot\bin
```

* Exception / Hints :  MultimasterAPI.dll appear
* Link --> https://neoisbackagain.github.io/cyber-blog/tags/windows-enumation-inetpub-dataleak/

```
whoami /priv
```

* Exception / Hints :  SeXXXXXX
* Link --> To many

```
C:\Program Files (x86)
```

* Exception / Hints :  The weird programme in there
* Link : https://neoisbackagain.github.io/cyber-blog/posts/cyberlab/oscp/vulnlab/insane/multimaster/#windows-enumation-inetpub
* https://neoisbackagain.github.io/cyber-blog/posts/cyberlab/oscp/vulnlab/hard/jobtwo-ok/#veeam-backup

```autohotkey
Get-Process
```

* Exception / Hints :  The weird programme in there
* * Link : https://neoisbackagain.github.io/cyber-blog/posts/cyberlab/oscp/vulnlab/medium/sendai/#shell-as-admin

```
cd $env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\
```

* Exception / Hints :  check the history
* * Link : https://0xdf.gitlab.io/2018/11/08/powershell-history-file.html

```
wget https://github.com/itm4n/PrivescCheck/releases/latest/download/PrivescCheck.ps1
```

[Window Credentials Leak 憑證洩漏](/Window%20Credentials%20Leak%20%E6%86%91%E8%AD%89%E6%B4%A9%E6%BC%8F)\
[Scheduled Tasks  排程任務](/Scheduled%20Tasks%20%20%E6%8E%92%E7%A8%8B%E4%BB%BB%E5%8B%99)\
[Service Binary Hijacking 服務二進位劫持](/Service%20Binary%20Hijacking%20%E6%9C%8D%E5%8B%99%E4%BA%8C%E9%80%B2%E4%BD%8D%E5%8A%AB%E6%8C%81)\
[Unquoted Service Paths 未引號服務路徑](/Unquoted%20Service%20Paths%20%E6%9C%AA%E5%BC%95%E8%99%9F%E6%9C%8D%E5%8B%99%E8%B7%AF%E5%BE%91)\
[Windows 自動化檢查](/Windows%20%E8%87%AA%E5%8B%95%E5%8C%96%E6%AA%A2%E6%9F%A5)
