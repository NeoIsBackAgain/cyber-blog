---
title: toolkits Applocker
date: 2026-07-14
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: true
tags:
  - blog
  - HTB
lastmod: 2026-07-19T03:56:24.493Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/yourmachine" >}}

***

> An application whitelist is a list of approved software applications or executables that are allowed to be present and run on a system

> [AppLocker](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/windows-defender-application-control/applocker/applocker-overview) is a `Windows` (defense-in-depth) security feature which allows administrators to `restrict which apps and files a user can run`. Rules may be applied to the following file types:

### Setup

To add it to a standard Windows 10/11 Pro or Enterprise workstation, you need to install it via PowerShell as an Administrator:

Press `Win + R`, type **`services.msc`**, and hit Enter.

![Pasted image 20260713171002.png](/ob/Pasted%20image%2020260713171002.png)

Scroll down and locate **Application Identity**.

![Pasted image 20260713171030.png](/ob/Pasted%20image%2020260713171030.png)

Right-click it and choose **Properties**.

Change the *Startup type* to **Automatic**, then click **Start** under the service status.

![Pasted image 20260713171129.png](/ob/Pasted%20image%2020260713171129.png)

Click **OK**.

If you are testing this locally on a single machine, use the Local Security Policy console:

Press `Win + R`, type **`secpol.msc`**, and hit Enter.

![Pasted image 20260713171310.png](/ob/Pasted%20image%2020260713171310.png)

### Create the rule

In the left-hand navigation pane, expand **Application Control Policies** and click on **AppLocker**.

![Pasted image 20260713171520.png](/ob/Pasted%20image%2020260713171520.png)

Expand the **AppLocker** folder in the left pane to reveal the rule collections:

Before enforcing any rules, you must generate the Microsoft default rules. AppLocker operates on an implicit deny-all basis; if you enforce it without default rules, you will immediately lock users (and yourself) out of essential system binaries and cause Windows features to crash.

* *Executable Rules* (`.exe`, `.com`)

* *Windows Installer Rules* (`.msi`, `.msp`)

* *Script Rules* (`.ps1`, `.bat`, `.vbs`, etc.)

* *Packaged app Rules* (Universal Windows Platform/Microsoft Store apps)\*\*\*\*

Right-click Executable Rules and select Automatically Generate Rules... (or choose Create Default Rules if you want to skip the wizard and inject the standard paths immediately).

![Pasted image 20260713173827.png](/ob/Pasted%20image%2020260713173827.png)

Blocked the mshta for test

![Pasted image 20260713174149.png](/ob/Pasted%20image%2020260713174149.png)

mshta --> It is typically triggered by a legitimate administrative script or an application displaying a pop-up window. so you basically  cannot run any application now

![Pasted image 20260713174316.png](/ob/Pasted%20image%2020260713174316.png)

> An application whitelist is a list of approved software applications or executables that are allowed to be present and run on a system

Organizations also often focus on blocking the `PowerShell.exe` executable, but forget about the other [PowerShell executable locations](https://www.powershelladmin.com/wiki/PowerShell_Executables_File_System_Locations) such as `%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe` or `PowerShell_ISE.exe`.

we can see the applock 's rule

```
PS C:\Program Files (x86)\Windows Kits\10\Debuggers\x86> Get-AppLockerPolicy -Effective | select -ExpandProperty RuleCollections


PublisherConditions : {*\*\*,0.0.0.0-*}
PublisherExceptions : {}
PathExceptions      : {}
HashExceptions      : {}
Id                  : b7af7102-efde-4369-8a89-7a6a392d1473
Name                : (Default Rule) All digitally signed Windows Installer files
Description         : Allows members of the Everyone group to run digitally signed Windows Installer files.
UserOrGroupSid      : S-1-1-0
Action              : Allow

PathConditions      : {%WINDIR%\Installer\*}
PathExceptions      : {}
PublisherExceptions : {}
HashExceptions      : {}
Id                  : 5b290184-345a-4453-b184-45305f6d9a54
Name                : (Default Rule) All Windows Installer files in %systemdrive%\Windows\Installer
Description         : Allows members of the Everyone group to run all Windows Installer files located in
                      %systemdrive%\Windows\Installer.
UserOrGroupSid      : S-1-1-0
Action              : Allow

PathConditions      : {*.*}
PathExceptions      : {}
PublisherExceptions : {}
HashExceptions      : {}
Id                  : 64ad46ff-0d71-4fa0-a30b-3f3d30c5433d
Name                : (Default Rule) All Windows Installer files
Description         : Allows members of the local Administrators group to run all Windows Installer files.
UserOrGroupSid      : S-1-5-32-544
Action              : Allow

HashConditions : {SHA256 0xAFF6F39C8B3D68811C33636CDC2627E6AA7DC9C85E381F183F9A959A87EE9077}
Id             : a1f0e7af-889e-49b9-a5f9-706e40034e3f
Name           : Microsoft Visual Studio: Microsoft.VisualStudio.Setup.TestMsi.msi
Description    :
UserOrGroupSid : S-1-1-0
Action         : Allow
```

### AppLocker bypass
