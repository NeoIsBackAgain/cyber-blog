---
title: Networking VMs for HTB
date: 2026-05-28
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
lastmod: 2026-05-28T07:20:10.919Z
---
# Box Info

Networking VMs for HTB

When doing HTB or other CTFs, I typically run from a Linux VM (formerly Kali, lately Parrot), but I also need to use a Windows VM from time to time as well. Some of those times, I’ll need to interact with the HTB machines over the VPN from the Windows host, and it’s always a bit of a pain to turn off the VPN in the Linux VM, and then turn it on from Windows. This post shows how I configured my VMs so that Windows traffic can route through the Linux VM to HTB.

![Pasted image 20260528150447.png](/ob/Pasted%20image%2020260528150447.png)

***

> Before touching anything, know the goal: Windows VM has no VPN. Parrot VM has the HTB VPN. We want Windows traffic to travel through Parrot's VPN tunnel as if Parrot sent it.

# Parrot / Linux

> You need a private link between the two VMs that bypasses the real network. This is the 'pipe' they use to talk to each other.

Open VMware → Edit → Virtual Network Editor

Your 'Parrot-shares' VMnet (192.168.154.0/24) is already created ✓

![Pasted image 20260528151044.png](/ob/Pasted%20image%2020260528151044.png)

Create the `Parrot-shares` , and dont click the DHCP

![Pasted image 20260528151123.png](/ob/Pasted%20image%2020260528151123.png)

Parrot VM → Settings → Network Adapter 1 = NAT (internet), Adapter 2 = Parrot-shares

![Pasted image 20260528151457.png](/ob/Pasted%20image%2020260528151457.png)

### assign static IP to ens36

The internal NIC needs a fixed IP so Windows always knows where to send packets. Dynamic IPs would break the route every reboot.

```
sudo nmcli con add type ethernet ifname ens36 con-name htb-bridge ipv4.addresses 192.168.154.10/24 ipv4.method manual connection.autoconnect yes
```

```
sudo nmcli con up htb-bridge
```

```
ip a show ens36
```

### enable IP forwarding

By default Linux drops packets not addressed to itself. This setting tells the kernel to act as a router and pass packets along to their destination.

```
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
```

```
sudo sysctl -p
```

```
cat /proc/sys/net/ipv4/ip_forward
```

### add iptables NAT rule

Without this, HTB machines see packets coming from 192.168.154.20 (Windows private IP) and don't know how to reply — that IP is unreachable from HTB. MASQUERADE rewrites the source to Parrot's tun0 IP so HTB can reply through the VPN.

```
sudo iptables -t nat -A POSTROUTING -s 192.168.154.0/24 -o tun0 -j MASQUERADE
```

```
sudo apt install iptables-persistent -y
```

```
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

```
sudo iptables -t nat -L POSTROUTING -v
```

# Windows

create the new network

![Pasted image 20260528151937.png](/ob/Pasted%20image%2020260528151937.png)

Parrot VM → Settings → Network Adapter 1 = NAT (internet), Adapter 2 = Parrot-shares

![Pasted image 20260528152008.png](/ob/Pasted%20image%2020260528152008.png)

```
netsh interface ip set address "Ethernet1" static 192.168.154.20 255.255.255.0 192.168.154.10

route -p add 10.10.10.0 MASK 255.255.254.0 192.168.154.10

route -p add 10.10.16.0 MASK 255.255.254.0 192.168.154.10

route -p add 10.129.0.0 MASK 255.255.0.0 192.168.154.10

ping 192.168.154.10

ping 10.10.16.100

ping 10.129.5.17
```
