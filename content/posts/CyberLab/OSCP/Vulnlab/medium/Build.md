---
title: Build
date: 2026-04-03
ShowToc: true
draft: true
TocOpen: true
tags:
  - blog
  - HTB
  - Linux
  - medium
lastmod: 2026-04-03T17:48:04.618Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Build" >}}

***

# Recon

### \[\[PORT & IP SCAN]]

The `nmap` reveal that the machine is ((change it) a standard Windows AD Server , with the kerberos auth , also the ldap query , and the 3389 port show that the domain `AWSJPDC0522.shibuya.vl` ,but the ldap anonymous inquiry failed .)

```
```

### \[\[FTP 21]]

Try the `anonymous` : `anonymous` , and we

```
anonymous : anonymous
```

```
```

### \[\[SMTP & POP 25 ,110]]

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

backup

### \[\[MSSQL 1433]] -- Scans

```
```

### \[\[MYSQL 3306]] -- Scans

```
```

### \[\[SSH 22]]

```
```

***
