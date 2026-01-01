---
title: Add the post to hugo by obsidian
date: 2025-11-06T13:51:41+08:00
draft: false
ShowToc: true
TocOpen: true
tags:
  - blog
lastmod: 2025-12-31T05:27:08.500Z
---
> If you finding a way that you write the note or blog in the obsidian , and everything will automatically upload to online , here is the answer

***

# Main Flow

![Pasted image 20251231105929.png](/ob/Pasted%20image%2020251231105929.png)

obsidian will use the obsidian extension of hugo Publich to automatically send the picture and .md file in you hugo file and place into the correct place , and we will have the timer to automatically upload to Github  at the end of the  week

***

# Init Config

![Pasted image 20251231110907.png](/ob/Pasted%20image%2020251231110907.png)

The site dir please config to you file path , in here is C:\User\myname\Desktop\my-blog\
The blog dir is where you put the md file place\
The static dir is http://127.0.0.1:1313/ob/image.png to show your file\
`.*\.md` --> if dont have the option , the plugin will delete other file

## the hugo.toml config

![Pasted image 20251231132634.png](/ob/Pasted%20image%2020251231132634.png)

***

# Obsidain setting (you may need to debug!)

![Pasted image 20251231111332.png](/ob/Pasted%20image%2020251231111332.png)

```
---
title: "test"
date : 2025-11-06T13:51:41+08:00
draft: false
ShowToc: true
TocOpen: true
tags: [blog]
---
```

✅ **Step 1:** Add the above front matter at the top of your Obsidian note.

```
hugo server --baseURL http://127.0.01:1313/ --ignoreCache
```

![Pasted image 20251231111633.png](/ob/Pasted%20image%2020251231111633.png)\
✅ **Step 4:** Confirm the site is running and check the preview (as shown in your pasted image).

![Pasted image 20251230235538.png](/ob/Pasted%20image%2020251230235538.png)

✅ **Step 5:** Once everything looks good, mark the task as **Finished**

***

# Github Setting

```
winget install --id Git.Git -e --source winget
```

```
setx PATH "$($env:Path);C:\Program Files\Git\cmd"
```

## windows to set the github ssh

```
ssh-keygen -t ed25519 -C "your_email@example.com"
```
