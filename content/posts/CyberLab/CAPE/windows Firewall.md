---
title: windows Firewall
date: 2026-07-13
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: true
tags:
  - blog
  - windows-firewall
  - note-windows
lastmod: 2026-07-24T07:31:07.636Z
---
### Enumeration Defender

#### Powershell

We can know the Microsoft Defender is running

```
PS C:\> Get-Command -Module Defender

CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Function        Add-MpPreference                                   1.0        Defender
Function        Get-MpBehavioralNetworkBlockingRules               1.0        Defender
Function        Get-MpComputerStatus                               1.0        Defender
Function        Get-MpPreference                                   1.0        Defender
Function        Get-MpThreat                                       1.0        Defender
Function        Get-MpThreatCatalog                                1.0        Defender
Function        Get-MpThreatDetection                              1.0        Defender
Function        Remove-MpBehavioralNetworkBlockingRules            1.0        Defender
Function        Remove-MpPreference                                1.0        Defender
Function        Remove-MpThreat                                    1.0        Defender
Function        Set-MpPreference                                   1.0        Defender
Function        Start-MpRollback                                   1.0        Defender
Function        Start-MpScan                                       1.0        Defender
Function        Start-MpWDOScan                                    1.0        Defender
Function        Update-MpSignature                                 1.0        Defender
```

The signatures were lasted updated on `08.04.2024` , `Tamper protection` is `disabled` , The computer is a `virtual machine` , `Real-time protection` is `enabled`

```
PS C:\> Get-MpComputerStatus | Select-Object AntivirusSignatureLastUpdated, IsTamperProtected, IsVirtualMachine, RealTimeProtectionEnabled | Format-List


AntivirusSignatureLastUpdated : 7/13/2026 9:23:38 AM
IsTamperProtected             : True
IsVirtualMachine              : True
RealTimeProtectionEnabled     : True

```

[Get-MpThreat](https://learn.microsoft.com/en-us/powershell/module/defender/get-mpthreat) can be used to view the history of threats detected on the computer. For example, below we can view the nc64 is blocked

```
PS C:\> Get-MpThreat


CategoryID       : 34
DidThreatExecute : False
IsActive         : False
Resources        :
RollupStatus     : 1
SchemaVersion    : 1.0.0.0
SeverityID       : 4
ThreatID         : 2147744878
ThreatName       : HackTool:Win32/NetCat!MSR
TypeID           : 0
PSComputerName   :
```

Also special to check with id

```
PS C:\>  Get-MpThreatDetection -ThreatID 2147744878


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

```

### Turn off Defender

Turn off everything and set exclusion to "C:\Windows\Temp"

* realtime monitoring
* scanning for downloaded files or attachments
* behaviour monitoring
* set exclusion to "C:\Windows\Temp"
* cloud detection

```
PS C:\Windows\System32> Set-MpPreference -DisableRealtimeMonitoring $true;Set-MpPreference -DisableIOAVProtection $true;Set-MPPreference -DisableBehaviorMonitoring $true;Set-MPPreference -DisableBlockAtFirstSeen $true;Set-MPPreference -DisableEmailScanning $true;Set-MPPReference -DisableScriptScanning $true;Set-MpPreference -DisableIOAVProtection $true;Add-MpPreference -ExclusionPath "C:\Windows\Temp"
```

open

```
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

detail step by step

```
# Disables realtime monitoring
Set-MpPreference -DisableRealtimeMonitoring $true

# Disables scanning for downloaded files or attachments
Set-MpPreference -DisableIOAVProtection $true

# Disable behaviour monitoring
Set-MPPreference -DisableBehaviourMonitoring $true

# Make exclusion for a certain folder
Add-MpPreference -ExclusionPath "C:\Windows\Temp"

# Disables cloud detection
Set-MPPreference -DisableBlockAtFirstSeen $true

# Disables scanning of .pst and other email formats
Set-MPPreference -DisableEmailScanning $true

# Disables script scanning during malware scans
Set-MPPReference -DisableScriptScanning $true

# Exclude files by extension
Set-MpPreference -ExclusionExtension "ps1"
```
