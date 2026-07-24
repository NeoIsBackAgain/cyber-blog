---
title: Settup Active Directory
date: 2026-07-17
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: true
tags:
  - blog
  - HTB
lastmod: 2026-07-18T08:28:10.592Z
---
### Install VM

https://blog.csdn.net/qq\_46302361/article/details/\*\*139114864

![Pasted image 20260717104259.png](/ob/Pasted%20image%2020260717104259.png)

To plan, implement, and manage Active Directory effectively, it’s important to understand its logical structure, which is organized in **three levels**: **Forest → Domain → Organizational Unit (OU)**.

### Map what already exists

```
PS C:\Users\Administrator> Install-WindowsFeature -Name RSAT-AD-PowerShell -IncludeAllSubFeature

Success Restart Needed Exit Code      Feature Result
------- -------------- ---------      --------------
True    No             Success        {Remote Server Administration Tools, Activ...

```

### Set the Network

```
PS C:\Users\Administrator> Set-DnsClientServerAddress -InterfaceAlias "Ethernet0" -ServerAddresses 127.0.0.1
PS C:\Users\Administrator> Set-NetIPInterface -InterfaceAlias "Ethernet0" -Dhcp Disabled
```

```
PS C:\Users\Administrator> Get-NetIPAddress -InterfaceAlias "Ethernet0" -AddressFamily IPv4


IPAddress         : 192.168.100.10
InterfaceIndex    : 6
InterfaceAlias    : Ethernet0
AddressFamily     : IPv4
Type              : Unicast
PrefixLength      : 24
PrefixOrigin      : Manual
SuffixOrigin      : Manual
AddressState      : Tentative
ValidLifetime     : Infinite ([TimeSpan]::MaxValue)
PreferredLifetime : Infinite ([TimeSpan]::MaxValue)
SkipAsSource      : False
PolicyStore       : ActiveStore

IPAddress         : 169.254.144.122
InterfaceIndex    : 6
InterfaceAlias    : Ethernet0
AddressFamily     : IPv4
Type              : Unicast
PrefixLength      : 16
PrefixOrigin      : WellKnown
SuffixOrigin      : Link
AddressState      : Tentative
ValidLifetime     : Infinite ([TimeSpan]::MaxValue)
PreferredLifetime : Infinite ([TimeSpan]::MaxValue)
SkipAsSource      : False
PolicyStore       : ActiveStore


```

### ADDS (Active Directory Domain Services)

```
PS C:\Users\Administrator> Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

Success Restart Needed Exit Code      Feature Result
------- -------------- ---------      --------------
True    No             Success        {Active Directory Domain Services, Group P...

```

```
Install-ADDSForest ` -DomainName "test.local" ` -DomainNetbiosName "test" ` -InstallDNS:$true ` -SafeModeAdministratorPassword (ConvertTo-SecureString "P@ssw0rd!1234" -AsPlainText -Force)
```

It will automatically reboot when finished

#### Get-ADDomain

```
PS C:\Users\Administrator> Import-Module ActiveDirectory                                                           
PS C:\Users\Administrator> Get-ADDomain

AllowedDNSSuffixes                 : {}
ChildDomains                       : {}
ComputersContainer                 : CN=Computers,DC=test,DC=local
DeletedObjectsContainer            : CN=Deleted Objects,DC=test,DC=local
DistinguishedName                  : DC=test,DC=local
DNSRoot                            : test.local
DomainControllersContainer         : OU=Domain Controllers,DC=test,DC=local
DomainMode                         : Windows2016Domain
DomainSID                          : S-1-5-21-84984185-259362343-599180476
ForeignSecurityPrincipalsContainer : CN=ForeignSecurityPrincipals,DC=test,DC=local
Forest                             : test.local
InfrastructureMaster               : WIN-6G6KPL3P3MA.test.local
LastLogonReplicationInterval       :
LinkedGroupPolicyObjects           : {CN={31B2F340-016D-11D2-945F-00C04FB984F9},CN=Policies,CN=System,DC=test,DC=local}
LostAndFoundContainer              : CN=LostAndFound,DC=test,DC=local
ManagedBy                          :
Name                               : test
NetBIOSName                        : TEST
ObjectClass                        : domainDNS
ObjectGUID                         : 5c43a280-3bcf-47e8-962c-621e6d080434
ParentDomain                       :
PDCEmulator                        : WIN-6G6KPL3P3MA.test.local
PublicKeyRequiredPasswordRolling   : True
QuotasContainer                    : CN=NTDS Quotas,DC=test,DC=local
ReadOnlyReplicaDirectoryServers    : {}
ReplicaDirectoryServers            : {WIN-6G6KPL3P3MA.test.local}
RIDMaster                          : WIN-6G6KPL3P3MA.test.local
SubordinateReferences              : {DC=ForestDnsZones,DC=test,DC=local, DC=DomainDnsZones,DC=test,DC=local,
                                     CN=Configuration,DC=test,DC=local}
SystemsContainer                   : CN=System,DC=test,DC=local
UsersContainer                     : CN=Users,DC=test,DC=local


```

#### Get-ADForest

```
PS C:\Users\Administrator> Get-ADForest


ApplicationPartitions : {DC=ForestDnsZones,DC=test,DC=local, DC=DomainDnsZones,DC=test,DC=local}
CrossForestReferences : {}
DomainNamingMaster    : WIN-6G6KPL3P3MA.test.local
Domains               : {test.local}
ForestMode            : Windows2016Forest
GlobalCatalogs        : {WIN-6G6KPL3P3MA.test.local}
Name                  : test.local
PartitionsContainer   : CN=Partitions,CN=Configuration,DC=test,DC=local
RootDomain            : test.local
SchemaMaster          : WIN-6G6KPL3P3MA.test.local
Sites                 : {Default-First-Site-Name}
SPNSuffixes           : {}
UPNSuffixes           : {}



PS C:\Users\Administrator> Get-Service ADWS, NTDS, DNS

Status   Name               DisplayName
------   ----               -----------
Running  ADWS               Active Directory Web Services
Running  DNS                DNS Server
Running  NTDS               Active Directory Domain Services

```

Look at what you actually built:

* Forest: `test.local`
* Domain: `test.local` (NetBIOS: `TEST`)
* Domain functional level: `Windows2016Domain`
* All three critical services (`ADWS`, `DNS`, `NTDS`) are `Running`
* This server (`WIN-6G6KPL3P3MA`) is holding **all five FSMO roles** (PDCEmulator, RIDMaster, InfrastructureMaster, DomainNamingMaster, SchemaMaster) — normal and expected for the first/only DC in a new forest
* It's also your Global Catalog server

### Build the OU

```
PS C:\Users\Administrator> New-ADOrganizationalUnit -Name "IT" -Path "DC=test,DC=local"
```

verify the OU of IT

```
PS C:\Users\Administrator> Get-ADOrganizationalUnit -Filter * | Select Name, DistinguishedName

Name               DistinguishedName
----               -----------------
Domain Controllers OU=Domain Controllers,DC=test,DC=local
IT                 OU=IT,DC=test,DC=local
```

### Create a test user

```
PS C:\Users\Administrator> New-ADUser -Name "John Test" -SamAccountName jtest -Enabled $true -AccountPassword (ConvertTo-SecureString "P@ssw0rd!1234" -AsPlainText -Force)
```

### Move the user to OU

Found the DistinguishedName

```
PS C:\Users\Administrator> Get-ADUser -Identity jtest


DistinguishedName : CN=John Test,CN=Users,DC=test,DC=local
Enabled           : True
GivenName         :
Name              : John Test
ObjectClass       : user
ObjectGUID        : 37bbba99-1043-42fe-b63a-96bb03927099
SamAccountName    : jtest
SID               : S-1-5-21-84984185-259362343-599180476-1103
Surname           :
UserPrincipalName :

```

Move to IT

```
PS C:\Users\Administrator> Move-ADObject -Identity "CN=John Test,CN=Users,DC=test,DC=local" -TargetPath "OU=IT,DC=test,DC=local"
```

### View the OU 's user

```
PS C:\Users\Administrator> Get-ADUser -Filter * -SearchBase "OU=IT,DC=test,DC=local" | Select Name, SamAccountName, DistinguishedName

Name      SamAccountName DistinguishedName
----      -------------- -----------------
John Test jtest          CN=John Test,OU=IT,DC=test,DC=local

```

Or like that

```
PS C:\Users\Administrator> Get-ADUser -Filter * -SearchBase "OU=IT,DC=test,DC=local"


DistinguishedName : CN=John Test,OU=IT,DC=test,DC=local
Enabled           : True
GivenName         :
Name              : John Test
ObjectClass       : user
ObjectGUID        : 37bbba99-1043-42fe-b63a-96bb03927099
SamAccountName    : jtest
SID               : S-1-5-21-84984185-259362343-599180476-1103
Surname           :
UserPrincipalName :
```

### Build the Group

|                         | **OU (Organizational Unit)**                          | **Group**                                        |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| **Purpose**             | Organize objects + apply Group Policy                 | Grant permissions/access                         |
| **What it does**        | Nothing by itself — just a "folder" for organizing    | Controls what you can access (files, apps, etc.) |
| **A user can be in...** | **Only ONE OU** (their location)                      | **Many groups at once**                          |
| **GPOs link to it?**    | Yes — this is literally what GPOs target              | No — GPOs don't link to groups directly\*        |
| **Analogy**             | Which department's office the user physically sits in | Which key-cards the user is holding              |

```
PS C:\Users\Administrator> New-ADGroup -Name "IT-Staff" -GroupScope Global -GroupCategory Security -Path "OU=IT,DC=test,DC=local"
```

`-GroupScope Global` → standard choice for a group containing users you'll grant permissions to within your domain

`-GroupCategory Security` → this is what makes it a *security* group (controls access) rather than a *distribution* group (just an email list)

`-Path` → I put it inside your `IT` OU too, so everything IT-related stays organized together

### Add user into group

```
PS C:\Users\Administrator> Add-ADGroupMember -Identity "IT-Staff" -Members jtest
PS C:\Users\Administrator> Get-ADGroupMember -Identity "IT-Staff"


distinguishedName : CN=John Test,OU=IT,DC=test,DC=local
name              : John Test
objectClass       : user
objectGUID        : 37bbba99-1043-42fe-b63a-96bb03927099
SamAccountName    : jtest
SID               : S-1-5-21-84984185-259362343-599180476-1103
```

check it from the user's side:

```
PS C:\Users\Administrator> Get-ADPrincipalGroupMembership -Identity jtest | Select Name

Name
----
Domain Users
IT-Staff

```

### Set the Share folder

```
PS C:\Users\Administrator> New-Item -Path "C:\Shares\ITData" -ItemType Directory


    Directory: C:\Shares


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         7/17/2026   3:42 PM                ITData
```

Share it over the network

```
PS C:\Users\Administrator> New-SmbShare -Name "ITData" -Path "C:\Shares\ITData" -FullAccess "TEST\IT-Staff"

Name   ScopeName Path             Description
----   --------- ----             -----------
ITData *         C:\Shares\**ITData**
```

This gives `IT-Staff` **Modify** rights (read/write/delete, but not full ownership control) directly on the folder itself, regardless of how it's accessed.

```
$acl = Get-Acl "C:\Shares\ITData" $permission = "TEST\IT-Staff","Modify","ContainerInherit,ObjectInherit","None","Allow" $rule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission $acl.SetAccessRule($rule) $acl | Set-Acl "C:\Shares\ITData"
```

### Set the user 's Desktop login and user priv

open the gpmc.msc

![Pasted image 20260717155504.png](/ob/Pasted%20image%2020260717155504.png)

* Click **Computer Configuration → Policies** (the one right above "Preferences" — not the one you're currently in)
* Then expand: **Windows Settings**
* Then expand: **Security Settings**
* Then click: **Local Policies**
* Then click: **User Rights Assignment**

![Pasted image 20260717155720.png](/ob/Pasted%20image%2020260717155720.png)

![Pasted image 20260717155850.png](/ob/Pasted%20image%2020260717155850.png)

after added  and add the priv you need

![Pasted image 20260717155931.png](/ob/Pasted%20image%2020260717155931.png)

Update policy

```
PS C:\Users\Administrator> gpupdate /force
Updating policy...

Computer Policy update has completed successfully.
User Policy update has completed successfully.

```

![Pasted image 20260717160235.png](/ob/Pasted%20image%2020260717160235.png)

### Install and use the RSAT

The `Remote Server Administration Tools` (`RSAT`) have been part of Windows since the days of Windows 2000. RSAT allows systems administrators to remotely manage Windows Server roles and features from a workstation running Windows 10, Windows 8.1, Windows 7, or Windows Vista. `RSAT` can only be installed on Professional or Enterprise editions of Windows. In an enterprise environment, RSAT can remotely manage Active Directory, DNS, and DHCP. RSAT also allows us to manage installed server roles and features, File Services, and Hyper-V. The full listing of tools included with `RSAT` is:

We will use it script to install  , i will directly copy and paste to windows

```
PS C:\Users\Administrator\Desktop> Get-WindowsCapability -Name RSAT* -Online | Add-WindowsCapability –Online
>>
PS C:\Users\Administrator\Desktop>  Add-WindowsCapability -Name Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0  –Online
>>


Path          :
Online        : True
RestartNeeded : False
```

```
PS C:\Users\Administrator\Desktop> notepad
PS C:\Users\Administrator\Desktop>
```

![Pasted image 20260718124631.png](/ob/Pasted%20image%2020260718124631.png)

![Pasted image 20260718124655.png](/ob/Pasted%20image%2020260718124655.png)

#### Administrative Tools

Once installed, all of the tools will be available under `Administrative Tools` in the `Control Panel`.

![Pasted image 20260718130002.png](/ob/Pasted%20image%2020260718130002.png)

While these graphical tools are useful and easy to use, they are very inefficient when trying to enumerate a large domain. In the next few sections, we will introduce `LDAP` and various types of search filters that we can use to enumerate AD using PowerShell. The topics that we cover in these sections will help us gain a better understanding of how AD works and how to search for information efficiently, which will ultimately better inform us on the usage of the more "automated" tools and scripts that we will cover in the next two `AD Enumeration` modules.

### LDAP Search

[`Lightweight Directory Access Protocol` (`LDAP`)](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol) is an integral part of Active Directory (AD). The latest LDAP specification is Version 3, which is published as [RFC 4511](https://tools.ietf.org/html/rfc4511). A firm understanding of how LDAP works in an AD environment is crucial for both attackers and defenders.

`LDAP` is an open-source and cross-platform protocol used for authentication against various directory services (such as AD). As discussed in the previous section, AD stores user account information and security information such as passwords and facilitates sharing this information with other devices on the network. `LDAP` is the language that applications use to communicate with other servers that also provide directory services. In other words, `LDAP` is a way that systems in the network environment can "speak" to AD.

#### disabled accounts

```
PS C:\Users\Administrator\Desktop> Disable-ADAccount -Identity "jtest"
```

verify

```
PS C:\Users\Administrator\Desktop> Get-ADUser -Filter * -SearchBase "OU=IT,DC=test,DC=local"


DistinguishedName : CN=John Test,OU=IT,DC=test,DC=local
Enabled           : False
GivenName         :
Name              : John Test
ObjectClass       : user
ObjectGUID        : 37bbba99-1043-42fe-b63a-96bb03927099
SamAccountName    : jtest
SID               : S-1-5-21-84984185-259362343-599180476-1103
Surname           :
UserPrincipalName :



PS C:\Users\Administrator\Desktop> Get-ADUser -Identity "CN=John Test,OU=IT,DC=test,DC=local" -Properties Enabled


DistinguishedName : CN=John Test,OU=IT,DC=test,DC=local
Enabled           : False
GivenName         :
Name              : John Test
ObjectClass       : user
ObjectGUID        : 37bbba99-1043-42fe-b63a-96bb03927099
SamAccountName    : jtest
SID               : S-1-5-21-84984185-259362343-599180476-1103
Surname           :
UserPrincipalName :

```

Find the disable user

```
PS C:\Users\Administrator\Desktop> Get-ADObject -LDAPFilter '(&(objectCategory=person)(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=2))' -Properties * | select samaccountname,useraccountcontrol

samaccountname useraccountcontrol
-------------- ------------------
Guest                       66082
krbtgt                        514
jtest                         514
```

#### LDAP Search Filters

When writing an LDAP search filter, we need to specify a rule requirement for the LDAP attribute in question (i.e. "`(displayName=william)`"). The following rules can be used to specify our search criteria:

| **Criteria**      | **Rule**           | **Example**                              |
| ----------------- | ------------------ | ---------------------------------------- |
| Equal to          | (attribute=123)    | (&(objectclass=user)(displayName=Smith)) |
| Not equal to      | (!(attribute=123)) | (!objectClass=group)                     |
| Present           | (attribute=\*)     | (department=\*)                          |
| Not present       | (!(attribute=\*))  | (!homeDirectory=\*)                      |
| Greater than      | (attribute>123)    | (maxStorage>100000)                      |
| Less than         | (attribute<123)    | (maxStorage<100000)                      |
| Approximate match | (attribute~=123)   | (sAMAccountName~=Jason)                  |
| Wildcards         | (attribute=\*A)    | (givenName=\*Sam)                        |

#### Object Identifiers (OIDs)

We can also use matching rule [Object Identifiers (OIDs)](https://ldapwiki.com/wiki/Wiki.jsp?page=OID) with LDAP filters as listed in this [Search Filter Syntax](https://docs.microsoft.com/en-us/windows/win32/adsi/search-filter-syntax) document from Microsoft:

| **Matching rule OID**                                                                      | **String identifier**           | **Description**                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [1.2.840.113556.1.4.803](https://ldapwiki.com/wiki/Wiki.jsp?page=1.2.840.113556.1.4.803)   | LDAP\_MATCHING\_RULE\_BIT\_AND  | A match is found only if all bits from the attribute match the value. This rule is equivalent to a bitwise **AND** operator.                                                                  |
| [1.2.840.113556.1.4.804](https://ldapwiki.com/wiki/Wiki.jsp?page=1.2.840.113556.1.4.804)   | LDAP\_MATCHING\_RULE\_BIT\_OR   | A match is found if any bits from the attribute match the value. This rule is equivalent to a bitwise **OR** operator.                                                                        |
| [1.2.840.113556.1.4.1941](https://ldapwiki.com/wiki/Wiki.jsp?page=1.2.840.113556.1.4.1941) | LDAP\_MATCHING\_RULE\_IN\_CHAIN | This rule is limited to filters that apply to the DN. This is a special "extended" match operator that walks the chain of ancestry in objects all the way to the root until it finds a match. |

```
Get-ADUser -LDAPFilter '(userAccountControl:1.2.840.113556.1.4.803:=2)' | select name
```

1.2.840.113556.1.4.803 = and

* **`1`** = `SCRIPT` (Logon script executed)
* **`2`** = `ACCOUNTDISABLE` (Account is disabled)
* **`8`** = `HOMEDIR_REQUIRED` (Home directory required)
* **`16`** = `LOCKOUT` (Account is locked out)
* **`32`** = `PASSWD_NOTREQD` (No password required)

#### LDAP query CheatSheet

https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/useraccountcontrol-manipulate-account-properties

```
Get-XXXX -Properties * -LDAPFilter 'LDAP Attribute Name=Property flag'
```

> Cmdlet

| **Cmdlet**         | **Primary Target Object**                                                                     | **Default Properties (Returned without -Properties)**                                                                                     | **Recommended Audit Properties (Add via -Properties <Name>)**                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`Get-ADGroup`**  | **Security & Distribution Groups**                                                            | `DistinguishedName`, `GroupCategory`, `GroupScope`, `Name`, `ObjectClass`, `ObjectGUID`, `SamAccountName`, `SID`                          | `description`, `managedBy`, `memberOf`, `whenCreated`, `whenChanged`                                                                              |
| **`Get-ADUser`**   | **User Accounts & Service Accounts**                                                          | `DistinguishedName`, `Enabled`, `GivenName`, `Name`, `ObjectClass`, `ObjectGUID`, `SamAccountName`, `SID`, `Surname`, `UserPrincipalName` | `userAccountControl`, `memberOf`, `servicePrincipalName`, `pwdLastSet`, `description`, `lastLogonTimestamp`, `badPwdCount`, `allowedToDelegateTo` |
| **`Get-ADObject`** | **Generic / Any Active Directory Object** *(Computers, Groups, OUs, Containers, Users, GPOs)* | `DistinguishedName`, `Name`, `ObjectClass`, `ObjectGUID`                                                                                  | `objectCategory`, `objectSid`, `whenCreated`, `whenChanged`, `description`                                                                        |

> LDAP Attribute Name

| **LDAP Attribute Name**    | **Data Type**             | **What it stores / Filter purpose**                                  |
| -------------------------- | ------------------------- | -------------------------------------------------------------------- |
| **`userAccountControl`**   | Integer (Bitmask)         | Account status flags (disabled, password never expires, etc.).       |
| **`memberOf`**             | Distinguished Name        | The security groups the object belongs to.                           |
| **`objectCategory`**       | Object Class String       | The high-level category of object (e.g., `person`, `computer`).      |
| **`objectClass`**          | Object Class String       | The specific structural class of object (e.g., `user`, `group`).     |
| **`sAMAccountName`**       | String                    | The classic Windows logon name (e.g., `jsmith`).                     |
| **`userPrincipalName`**    | String                    | The modern UPN/email-style logon name (e.g., `jsmith@domain.local`). |
| **`servicePrincipalName`** | String (Multi-valued)     | The SPNs mapped to the account (used for identifying services).      |
| **`pwdLastSet`**           | Large Integer (Timestamp) | The exact date and time the password was last modified.              |
| **`badPwdCount`**          | Integer                   | Number of failed login attempts since the last success.              |
| **`allowedToDelegateTo`**  | String (Multi-valued)     | Targets permitted for constrained delegation.                        |
| **`objectSid`**            | Binary String             | The unique Security Identifier of the object.                        |
| **`primaryGroupID`**       | Integer                   | The RID of the primary group (usually `513` for users).              |
| **`description`**          | String                    | Plain-text description field notes left by admins.                   |
| **`whenCreated`**          | Generalized Time          | The exact date the object was created in the directory.              |
| **`lastLogonTimestamp`**   | Large Integer (Timestamp) | The loosely replicated last successful login time.                   |
|                            |                           |                                                                      |

> Property flag

| Property flag                                                                                                                                                                                                                                                                                                                                                                                        | Value in hexadecimal | Value in decimal |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------- |
| SCRIPT                                                                                                                                                                                                                                                                                                                                                                                               | 0x0001               | 1                |
| ACCOUNTDISABLE                                                                                                                                                                                                                                                                                                                                                                                       | 0x0002               | 2                |
| HOMEDIR\_REQUIRED                                                                                                                                                                                                                                                                                                                                                                                    | 0x0008               | 8                |
| LOCKOUT                                                                                                                                                                                                                                                                                                                                                                                              | 0x0010               | 16               |
| PASSWD\_NOTREQD                                                                                                                                                                                                                                                                                                                                                                                      | 0x0020               | 32               |
| PASSWD\_CANT\_CHANGE  <br>  <br>You can't assign this permission by directly modifying the UserAccountControl attribute. For information about how to set the permission programmatically, see the [Property flag descriptions](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/useraccountcontrol-manipulate-account-properties#property-flag-descriptions) section. | 0x0040               | 64               |
| ENCRYPTED\_TEXT\_PWD\_ALLOWED                                                                                                                                                                                                                                                                                                                                                                        | 0x0080               | 128              |
| TEMP\_DUPLICATE\_ACCOUNT                                                                                                                                                                                                                                                                                                                                                                             | 0x0100               | 256              |
| NORMAL\_ACCOUNT                                                                                                                                                                                                                                                                                                                                                                                      | 0x0200               | 512              |
| INTERDOMAIN\_TRUST\_ACCOUNT                                                                                                                                                                                                                                                                                                                                                                          | 0x0800               | 2048             |
| WORKSTATION\_TRUST\_ACCOUNT                                                                                                                                                                                                                                                                                                                                                                          | 0x1000               | 4096             |
| SERVER\_TRUST\_ACCOUNT                                                                                                                                                                                                                                                                                                                                                                               | 0x2000               | 8192             |
| DONT\_EXPIRE\_PASSWORD                                                                                                                                                                                                                                                                                                                                                                               | 0x10000              | 65536            |
| MNS\_LOGON\_ACCOUNT                                                                                                                                                                                                                                                                                                                                                                                  | 0x20000              | 131072           |
| SMARTCARD\_REQUIRED                                                                                                                                                                                                                                                                                                                                                                                  | 0x40000              | 262144           |
| TRUSTED\_FOR\_DELEGATION                                                                                                                                                                                                                                                                                                                                                                             | 0x80000              | 524288           |
| NOT\_DELEGATED                                                                                                                                                                                                                                                                                                                                                                                       | 0x100000             | 1048576          |
| USE\_DES\_KEY\_ONLY                                                                                                                                                                                                                                                                                                                                                                                  | 0x200000             | 2097152          |
| DONT\_REQ\_PREAUTH                                                                                                                                                                                                                                                                                                                                                                                   | 0x400000             | 4194304          |
| PASSWORD\_EXPIRED                                                                                                                                                                                                                                                                                                                                                                                    | 0x800000             | 8388608          |
| TRUSTED\_TO\_AUTH\_FOR\_DELEGATION                                                                                                                                                                                                                                                                                                                                                                   | 0x1000000            | 16777216         |
| PARTIAL\_SECRETS\_ACCOUNT                                                                                                                                                                                                                                                                                                                                                                            | 0x04000000           | 67108864         |

#### Setting -  the Account Description

```
PS C:\Users\Administrator\Desktop> Set-ADUser -Identity "jtest" -Description "My password is P@ssw0rd!1234"
```

#### Example - Query - Description Field

> Find All account Descript

```
PS C:\Users\Administrator\Desktop> Get-ADUser -Properties * -LDAPFilter '(objectCategory=user)' | select  Description, CanonicalName ,SamAccountName

Description                                              CanonicalName                  SamAccountName
-----------                                              -------------                  --------------
Built-in account for administering the computer/domain   test.local/Users/Administrator Administrator
Built-in account for guest access to the computer/domain test.local/Users/Guest         Guest
Key Distribution Center Service Account                  test.local/Users/krbtgt        krbtgt
My password is P@ssw0rd!1234                             test.local/IT/John Test        jtest

```

#### Setting - Unconstrained Delegation User

```
PS C:\Users\Administrator\Desktop> Set-ADUser -Identity "jtest" -TrustedForDelegation $true
```

verify it

```
PS C:\Users\Administrator\Desktop> Get-ADUser -Identity "jtest" -Properties userAccountControl | Select-Object Name, userAccountControl

Name      userAccountControl
----      ------------------
John Test             524802
```

what now the jtest mean ?

mean jtest can make the service like web , and then catch the admin 's TGT ticket

#### Example - Query -  Find Trusted Users

```
PS C:\Users\Administrator\Desktop> Get-ADUser -Properties * -LDAPFilter '(userAccountControl:1.2.840.113556.1.4.803:=524288)' | select Name,memberof, servicePrincipalName,TrustedForDelegation  | fl


Name                 : John Test
memberof             : {CN=IT-Staff,OU=IT,DC=test,DC=local}
servicePrincipalName : {}
TrustedForDelegation : True

```

#### Setting - Trusted Computers

You must in the Trusted Computer and with that admin>  priv to do the lsass attack

> Active Unconstrained Delegation Flag on Computer Object + Local Administrator / SYSTEM Privileges on that Machine = Successful LSASS TGT Harvesting

> Set up the trust computer

Build the new Computer

```
PS C:\Users\Administrator\Desktop> New-ADComputer -Name "LAB-DEV01" -SamAccountName "LAB-DEV01"
```

```
PS C:\Users\Administrator\Desktop> Get-ADComputer -Filter * | Select-Object Name, DNSHostName, DistinguishedName

Name            DNSHostName                DistinguishedName
----            -----------                -----------------
WIN-6G6KPL3P3MA WIN-6G6KPL3P3MA.test.local CN=WIN-6G6KPL3P3MA,OU=Domain Controllers,DC=test,DC=local
LAB-DEV01                                  CN=LAB-DEV01,CN=Computers,DC=test,DC=local


```

set the Computer is trusted

```
PS C:\Users\Administrator\Desktop> Set-ADComputer -Identity "LAB-DEV01" -TrustedForDelegation $true
```

#### Example - Query -  Find Trusted Computers

> Find the trust Computer

```
PS C:\Users\Administrator\Desktop> Get-ADComputer -Properties * -LDAPFilter '(userAccountControl:1.2.840.113556.1.4.803:=524288)' | select DistinguishedName,servicePrincipalName,TrustedForDelegation | fl


DistinguishedName    : CN=WIN-6G6KPL3P3MA,OU=Domain Controllers,DC=test,DC=local
servicePrincipalName : {Dfsr-12F9A27C-BF97-4787-9364-D31B6C55EB04/WIN-6G6KPL3P3MA.test.local, ldap/WIN-6G6KPL3P3MA.test.local/ForestDnsZones.test.local, ldap/WIN-6G6KPL3P3MA.test.local/DomainDnsZones.test.local,
                       DNS/WIN-6G6KPL3P3MA.test.local...}
TrustedForDelegation : True

DistinguishedName    : CN=LAB-DEV01,CN=Computers,DC=test,DC=local
servicePrincipalName : {}
TrustedForDelegation : True

```

#### Setting -  empty password user

> Build the empty password user

Edit the GPO to allow no password

* Open `gpmc.msc`.

* Right-click **Default Domain Policy** under `test.local` and select **Edit**.

  ![Pasted image 20260718152147.png](/ob/Pasted%20image%2020260718152147.png)\
  ![Pasted image 20260718152343.png](/ob/Pasted%20image%2020260718152343.png)

* Confirm that `Minimum password length` is **0** and `Password must meet complexity requirements` is **Disabled** under *Computer Configuration -> Policies -> Windows Settings -> Security Settings -> Account Policies -> Password Policy*.

![Pasted image 20260718152743.png](/ob/Pasted%20image%2020260718152743.png)

```
PS C:\Users\Administrator\Desktop> gpupdate /force
Updating policy...

Computer Policy update has completed successfully.
User Policy update has completed successfully.
```

```
New-ADUser -Name "EmptyUser" -SamAccountName EmptyUser -Enabled $true -AccountPassword (ConvertTo-SecureString "" -AsPlainText -Force)
```

```
$EmptyPassword = New-Object System.Security.SecureString
Set-ADAccountPassword -Identity "EmptyUser" -Reset -NewPassword $EmptyPassword
```

```
Enable-ADAccount -Identity "EmptyUser"
```

```
DistinguishedName : CN=EmptyUser,CN=Users,DC=test,DC=local
Enabled           : False
GivenName         :
Name              : EmptyUser
ObjectClass       : user
ObjectGUID        : bbf13c24-284c-4e6f-9a06-89ca712a7535
SamAccountName    : EmptyUser
SID               : S-1-5-21-84984185-259362343-599180476-1602
Surname           :
UserPrincipalName :
```

```
PS C:\Users\Administrator\Desktop> Set-ADUser -Identity "EmptyUser" -PasswordNotRequired $true
```

#### Example - Query - Empty password user

> Find the empty password user

```
PS C:\Users\Administrator\Desktop> Set-ADUser -Identity "EmptyUser" -PasswordNotRequired $true
PS C:\Users\Administrator\Desktop> Get-AdUser -LDAPFilter '(&(objectCategory=person)(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=32))' -Properties * | select name,memberof | fl


name     : Guest
memberof : {CN=Guests,CN=Builtin,DC=test,DC=local}

name     : EmptyUser
memberof : {}


```

#### Example - Query - Find the special user's OU

```
PS C:\Users\Administrator\Desktop> Get-ADUser -Identity jtest -Properties * | select memberOf | fl


memberOf : {CN=IT-Staff,OU=IT,DC=test,DC=local}

```

#### Example - Query - Find the All group

```
PS C:\Users\Administrator\Desktop> Get-ADGroup -Filter 'member -RecursiveMatch "CN=John Test,OU=IT,DC=test,DC=local"' | select name

name
----
IT-Staff
```

#### Example - Query - How many users

```
PS C:\Users\Administrator\Desktop> (Get-ADUser -SearchBase "DC=test,DC=LOCAL" -Filter *).count
5
```

#### Example - Query - who are here

> using the SearchBase filter to know

```
PS C:\Users\Administrator\Desktop> Get-ADUser -SearchBase "DC=test,DC=LOCAL"  -SearchScope 2 -Filter *


DistinguishedName : CN=Administrator,CN=Users,DC=test,DC=local
Enabled           : True
GivenName         :
Name              : Administrator
ObjectClass       : user
ObjectGUID        : e5fe1046-f09b-4921-a0a4-9754f89208f6
SamAccountName    : Administrator
SID               : S-1-5-21-84984185-259362343-599180476-500
Surname           :
UserPrincipalName :

DistinguishedName : CN=Guest,CN=Users,DC=test,DC=local
Enabled           : False
GivenName         :
Name              : Guest
ObjectClass       : user
ObjectGUID        : 3669a59d-c643-48ea-a695-8d15f3be320b
SamAccountName    : Guest
SID               : S-1-5-21-84984185-259362343-599180476-501
Surname           :
UserPrincipalName :

DistinguishedName : CN=krbtgt,CN=Users,DC=test,DC=local
Enabled           : False
GivenName         :
Name              : krbtgt
ObjectClass       : user
ObjectGUID        : a1b925bd-4253-4c68-8732-8aead243f07b
SamAccountName    : krbtgt
SID               : S-1-5-21-84984185-259362343-599180476-502
Surname           :
UserPrincipalName :

DistinguishedName : CN=John Test,OU=IT,DC=test,DC=local
Enabled           : True
GivenName         :
Name              : John Test
ObjectClass       : user
ObjectGUID        : 37bbba99-1043-42fe-b63a-96bb03927099
SamAccountName    : jtest
SID               : S-1-5-21-84984185-259362343-599180476-1103
Surname           :
UserPrincipalName :

DistinguishedName : CN=EmptyUser,CN=Users,DC=test,DC=local
Enabled           : True
GivenName         :
Name              : EmptyUser
ObjectClass       : user
ObjectGUID        : bbf13c24-284c-4e6f-9a06-89ca712a7535
SamAccountName    : EmptyUser
SID               : S-1-5-21-84984185-259362343-599180476-1602
Surname           :
UserPrincipalName :
```

### Enumerating Active Directory with Built-in Tools

#### Example - Query - All  user's UAC

UAC = useraccountcontrol

what useraccountcontrol can do ?

UAC attribute is a bitmask that dictates a user account's behavior, security permissions, and state. Instead of having separate fields for "is this account disabled?", "does the password expire?", or "is it trusted for delegation?", Active Directory packs all of these flags into a single integer.

> Set the UAC

| **Property Flag**                      | **Decimal** | **Hexadecimal** | **Can You Manual Set It?** | **Security / Functional Description**                                                                                                               |
| -------------------------------------- | ----------- | --------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SCRIPT**                             | `1`         | `0x0001`        | **Yes**                    | Runs the designated logon script when the account logs in.                                                                                          |
| **ACCOUNTDISABLE**                     | `2`         | `0x0002`        | **Yes**                    | Disables the account completely, blocking all authentication.                                                                                       |
| **HOMEDIR\_REQUIRED**                  | `8`         | `0x0008`        | **Yes**                    | Requires a home folder to be specified for successful logon.                                                                                        |
| **LOCKOUT**                            | `16`        | `0x0010`        | **System Only**            | Set automatically by AD when an account triggers the bad password lockout threshold. *Clear it by unlocking the user rather than editing the mask.* |
| **PASSWD\_NOTREQD**                    | `32`        | `0x0020`        | **Yes**                    | Allows the account to exist with no password. **(High security risk)**                                                                              |
| **PASSWD\_CANT\_CHANGE**               | `64`        | `0x0040`        | **No**                     | Indicates the user cannot alter their password. *Must be explicitly modified via ACL permissions, not raw bit manipulation.*                        |
| **ENCRYPTED\_TEXT\_PWD\_ALLOWED**      | `128`       | `0x0080`        | **Yes**                    | Allows the user to send an encrypted password instead of a hashed one. (Legacy feature).                                                            |
| **TEMP\_DUPLICATE\_ACCOUNT**           | `256`       | `0x0100`        | **Yes**                    | A local user account style for users whose primary profile is in an untrusted domain.                                                               |
| **NORMAL\_ACCOUNT**                    | `512`       | `0x0200`        | **Yes**                    | The default, foundational flag representing a typical active user.                                                                                  |
| **INTERDOMAIN\_TRUST\_ACCOUNT**        | `2048`      | `0x0800`        | **System Only**            | Automatically assigned to a trust account for an external domain.                                                                                   |
| **WORKSTATION\_TRUST\_ACCOUNT**        | `4096`      | `0x1000`        | **System Only**            | Assigned automatically to computer accounts representing workstations or member servers.                                                            |
| **SERVER\_TRUST\_ACCOUNT**             | `8192`      | `0x2000`        | **System Only**            | Assigned automatically to computer accounts representing Domain Controllers.                                                                        |
| **DONT\_EXPIRE\_PASSWORD**             | `65536`     | `0x10000`       | **Yes**                    | Bypasses the domain's global password expiration policy requirements.                                                                               |
| **MNS\_LOGON\_ACCOUNT**                | `131072`    | `0x20000`       | **Yes**                    | Multi-Master Network Logon account (largely deprecated legacy feature).                                                                             |
| **SMARTCARD\_REQUIRED**                | `262144`    | `0x40000`       | **Yes**                    | Forces authentication exclusively through a physical Smart Card.                                                                                    |
| **TRUSTED\_FOR\_DELEGATION**           | `524288`    | `0x80000`       | **Yes**                    | Enables **Unconstrained Kerberos Delegation**. Highly sensitive permission.                                                                         |
| **NOT\_DELEGATED**                     | `1048576`   | `0x100000`      | **Yes**                    | Prevents this user's Kerberos TGT from being forwarded to any delegation services. *(Set this on high-value accounts like Domain Admins)*.          |
| **USE\_DES\_KEY\_ONLY**                | `2097152`   | `0x200000`      | **Yes**                    | Restricts Kerberos to using weak legacy DES encryption types.                                                                                       |
| **DONT\_REQ\_PREAUTH**                 | `4194304`   | `0x400000`      | **Yes**                    | Bypasses Kerberos pre-authentication. **(Enables AS-REP Roasting)**                                                                                 |
| **PASSWORD\_EXPIRED**                  | `8388608`   | `0x800000`      | **Yes/System**             | Flags that the user's password has expired or that they must change it at the next login.                                                           |
| **TRUSTED\_TO\_AUTH\_FOR\_DELEGATION** | `16777216`  | `0x1000000`     | **Yes**                    | Enables **Protocol Transition / Constrained Delegation**.                                                                                           |
| **PARTIAL\_SECRETS\_ACCOUNT**          | `67108864`  | `0x04000000`    | **System Only**            | Assigned strictly to Read-Only Domain Controllers (RODC) to manage partial secret replication.                                                      |

you have to set the account is normal to be queried

512 (NORMAL\_ACCOUNT)+524288 (TRUSTED\_FOR\_DELEGATION)=524800

```
Set-ADUser -Identity "jtest" -Replace @{userAccountControl=524800}
```

> Find the UAC and and have the admin function adminCount -gt 0

```
PS C:\Users\Administrator\Desktop> Get-ADUser -Filter {adminCount -gt 0} -Properties admincount,useraccountcontrol | select Name,useraccountcontrol

Name          useraccountcontrol
----          ------------------
Administrator              66048
krbtgt                       514

```

```
################################################################################################
# Convert-UserAccountControlValues.ps1
# 
# AUTHOR: Fabian Müller, Microsoft Deutschland GmbH
# VERSION: 0.1.1
# DATE: 23.11.2012
#
# THIS CODE-SAMPLE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED 
# OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR 
# FITNESS FOR A PARTICULAR PURPOSE.
#
# This sample is not supported under any Microsoft standard support program or service. 
# The script is provided AS IS without warranty of any kind. Microsoft further disclaims all
# implied warranties including, without limitation, any implied warranties of merchantability
# or of fitness for a particular purpose. The entire risk arising out of the use or performance
# of the sample and documentation remains with you. In no event shall Microsoft, its authors,
# or anyone else involved in the creation, production, or delivery of the script be liable for 
# any damages whatsoever (including, without limitation, damages for loss of business profits, 
# business interruption, loss of business information, or other pecuniary loss) arising out of 
# the use of or inability to use the sample or documentation, even if Microsoft has been advised 
# of the possibility of such damages.
################################################################################################

Function Set-UserAccountControlValueTable
{
	# see http://support.microsoft.com/kb/305144/en-us
	
    $userAccountControlHashTable = New-Object HashTable
    $userAccountControlHashTable.Add("SCRIPT",1)
    $userAccountControlHashTable.Add("ACCOUNTDISABLE",2)
    $userAccountControlHashTable.Add("HOMEDIR_REQUIRED",8) 
    $userAccountControlHashTable.Add("LOCKOUT",16)
    $userAccountControlHashTable.Add("PASSWD_NOTREQD",32)
    $userAccountControlHashTable.Add("ENCRYPTED_TEXT_PWD_ALLOWED",128)
    $userAccountControlHashTable.Add("TEMP_DUPLICATE_ACCOUNT",256)
    $userAccountControlHashTable.Add("NORMAL_ACCOUNT",512)
    $userAccountControlHashTable.Add("INTERDOMAIN_TRUST_ACCOUNT",2048)
    $userAccountControlHashTable.Add("WORKSTATION_TRUST_ACCOUNT",4096)
    $userAccountControlHashTable.Add("SERVER_TRUST_ACCOUNT",8192)
    $userAccountControlHashTable.Add("DONT_EXPIRE_PASSWORD",65536) 
    $userAccountControlHashTable.Add("MNS_LOGON_ACCOUNT",131072)
    $userAccountControlHashTable.Add("SMARTCARD_REQUIRED",262144)
    $userAccountControlHashTable.Add("TRUSTED_FOR_DELEGATION",524288) 
    $userAccountControlHashTable.Add("NOT_DELEGATED",1048576)
    $userAccountControlHashTable.Add("USE_DES_KEY_ONLY",2097152) 
    $userAccountControlHashTable.Add("DONT_REQ_PREAUTH",4194304) 
    $userAccountControlHashTable.Add("PASSWORD_EXPIRED",8388608) 
    $userAccountControlHashTable.Add("TRUSTED_TO_AUTH_FOR_DELEGATION",16777216) 
    $userAccountControlHashTable.Add("PARTIAL_SECRETS_ACCOUNT",67108864)

    $userAccountControlHashTable = $userAccountControlHashTable.GetEnumerator() | Sort-Object -Property Value 
    return $userAccountControlHashTable
}

Function Get-UserAccountControlFlags($userInput)
{    
        Set-UserAccountControlValueTable | foreach {
	    $binaryAnd = $_.value -band $userInput
	    if ($binaryAnd -ne "0") { write $_ }
    }
}

$userInputUserAccountControl = Read-Host "Please provide the userAccountControl value: "
Get-UserAccountControlFlags($userInputUserAccountControl)

```

Copy and paste it to windows

```
PS C:\Users\Administrator\Desktop> .\UAC.ps1
Please provide the userAccountControl value: : 66048

Name                           Value
----                           -----
NORMAL_ACCOUNT                 512
DONT_EXPIRE_PASSWORD           65536

```
