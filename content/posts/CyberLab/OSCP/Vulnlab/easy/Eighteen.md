---
title: Eighteen
date: 2026-05-28
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
lastmod: 2026-05-29T08:32:26.666Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Eighteen" >}}

***

> As is common in real life Windows penetration tests, you will start the Eighteen box with credentials for the following account: kevin / iNa2we6haRj2gaw!

# Recon

### \[\[PORT & IP SCAN]]

The comprehensive Nmap scan of the target host (`10.129.5.186`) across all 65,535 ports revealed exactly two open TCP ports: port **80** (HTTP), suggesting a web server is running, and port **1433** (ms-sql-s), which is the standard port for a Microsoft SQL Server database. All other 65,533 scanned ports were returned as filtered, meaning they did not respond to the scan's SYN probes.

```
tester@parrot]─[~/Desktop/HTB/Eighteen]
└──╼ $sudo nmap  -p-  -vv -reason -T 5  -o openPort.txt 10.129.5.186 --min-rate 1000
Warning: The -o option is deprecated. Please use -oN
Starting Nmap 7.95 ( https://nmap.org ) at 2026-05-29 16:27 HKT
Initiating Ping Scan at 16:27
Scanning 10.129.5.186 [4 ports]
Completed Ping Scan at 16:27, 0.25s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 16:27
Completed Parallel DNS resolution of 1 host. at 16:27, 0.00s elapsed
Initiating SYN Stealth Scan at 16:27
Scanning 10.129.5.186 [65535 ports]
Discovered open port 80/tcp on 10.129.5.186
Increasing send delay for 10.129.5.186 from 0 to 5 due to 11 out of 18 dropped probes since last increase.
SYN Stealth Scan Timing: About 23.29% done; ETC: 16:30 (0:01:42 remaining)
SYN Stealth Scan Timing: About 46.16% done; ETC: 16:30 (0:01:11 remaining)
Discovered open port 1433/tcp on 10.129.5.186
SYN Stealth Scan Timing: About 69.03% done; ETC: 16:30 (0:00:41 remaining)
Completed SYN Stealth Scan at 16:30, 131.71s elapsed (65535 total ports)
Nmap scan report for 10.129.5.186
Host is up, received echo-reply ttl 127 (0.24s latency).
Scanned at 2026-05-29 16:27:54 HKT for 132s
Not shown: 65533 filtered tcp ports (no-response)
PORT     STATE SERVICE  REASON
80/tcp   open  http     syn-ack ttl 127
1433/tcp open  ms-sql-s syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 132.07 seconds
           Raw packets sent: 131167 (5.771MB) | Rcvd: 47 (2.052KB)

```

### mssql 1433
