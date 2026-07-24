---
title: Burpsuite
date: 2026-04-09
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - BugBounty
lastmod: 2026-06-11T06:48:09.935Z
---
# Setting

### Jython

https://repo1.maven.org/maven2/org/python/jython-standalone/2.7.3/jython-standalone-2.7.3.jar

### Useful Tools

#### JS Miner

Background : While assessing a web application, it is expected to enumerate information residing inside static files such as JavaScript or JSON resources.

usage:\
Right-click that request in the Proxy history, and select **Extensions > JS Miner > Run JS Auto-Mine (check everything)**. This will force JS Miner to actively scan everything.\
![Pasted image 20260409135829.png](/ob/Pasted%20image%2020260409135829.png)

The Issue and Advisory may look something like this:\
![Pasted image 20260409135732.png](/ob/Pasted%20image%2020260409135732.png)

#### JWT Editor

#### JWT Web Tokens

#### Postman Importer

#### Active scan++

#### The Backslash Powered Scanner

#### Turbo Intruder (Test Race Condition)

#### Authentication Token Obtain and Replace

### Bambdas

{{< code >}}\
Bambdas are scripts that you can run directly from Burp Suite's interface. They enable you to quickly personalize various tasks, such as creating custom match-and-replace rules, table columns, and filters.\
{{< /code >}}

#### Special domain

Only showing the special domain to avoid out of scope

![Pasted image 20260414114402.png](/ob/Pasted%20image%2020260414114402.png)

```
var service = requestResponse.request().httpService();
if (service == null) {
    return false;
}

String host = service.host();
return host != null && host.equalsIgnoreCase("www.googletagmanager.com");
```

### XSS

https://github.com/hahwul/dalfox
