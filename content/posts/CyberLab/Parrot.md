---
title: Parrot Install
date: 2026-05-28
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - Misc
lastmod: 2026-06-11T06:48:21.306Z
---
***

### terminal shortcut

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

Install the UV

uv venv Python\
source Python/bin/activate

wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/sublimehq-archive.gpg > /dev/null

echo "deb https://download.sublimetext.com/ apt/stable/" | sudo tee /etc/apt/sources.list.d/sublime-text.list

sudo apt update

sudo apt install sublime-text

# my parrot why cant using the keyboard when reboot ?

```
sudo update-initramfs -u -k all
sudo reboot
```
