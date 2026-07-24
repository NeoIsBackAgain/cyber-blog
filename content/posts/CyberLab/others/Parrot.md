---
title: Parrot Install
date: 2026-05-28
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - Misc
lastmod: 2026-07-16T10:29:56.017Z
---
***

# terminal shortcut

```
┌─[tester@parrot]─[~]
└──╼ $vim ~/.bashrc
```

```
echo "alias c='clear'" >> ~/.bashrc
echo "alias ls='ls -a'" >> ~/.bashrc
source Python/bin/activate >> ~/.bashrc
```

```
source ~/.bashrc
```

# Server --> set the auto run server

* **Serving folder:** `/home/tester/Desktop/windows_parrot_sahres`
* **Entry point:** `index.php` — loads automatically at the root URL
* **Also inside that folder:** `logs/upload_log.csv` (upload history) and any files you drop in

### How to use it

**1. Open it in a browser**

From the same machine:

```
http://127.0.0.1/
```

From another machine on the same network (pick whichever interface applies):

```
http://10.1.110.173/
http://192.168.154.10/
```

**2. Upload a file**

* Click "Choose File" → pick a file → click **Upload**
* It lands directly in `windows_parrot_sahres/`
* The page reloads and shows it in the **Available Files** table

**3. Download a file**

* On that same page, under **Available Files**, click **Download** next to any file
* Or, if you know the exact filename, hit it directly: `http://<ip>/filename.ext`
* Or from command line: `curl -O http://<ip>/filename.ext`

**4. Upload via command line (no browser needed)**

bash

```bash
curl -F "file=@local_file.txt" http://<ip>/
```

**5. Check history**

* Scroll down on the same page — **Upload History** and **Download History** tables show who grabbed/dropped what and when, newest first
