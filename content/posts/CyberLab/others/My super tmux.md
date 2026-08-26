---
title: My tmux
date: 2026-06-03
ShowToc: true
draft: false
TocOpen: true
tags:
  - Tmux
  - Misc
  - blog
lastmod: 2026-08-10T08:18:08.458Z
---
{{< toggle "Tag 🏷️" >}}

{{< tag "Tmux" >}} Setting and back up my tmux for my CTF play

{{< /toggle >}}

# Related

# Idea ?

Your mouse is slowing you down. The time you spend context switching between your editor and your consoles eats away at your productivity. Take control of your environment with tmux, a terminal multiplexer that you can tailor to your workflow. With this updated second edition for tmux 2.3, you’ll customize, script, and leverage tmux’s unique abilities to craft a productive terminal environment that lets you keep your fingers on your keyboard’s home row.

### Why Use tmux?

![Pasted image 20260103120728.png](/ob/Pasted%20image%2020260103120728.png)

***

1. Install the Tpm

```
┌─[tester@parrot]─[~/Desktop]
└──╼ $git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
Cloning into '/home/tester/.tmux/plugins/tpm'...
remote: Enumerating objects: 1016, done.
remote: Counting objects: 100% (388/388), done.
remote: Compressing objects: 100% (88/88), done.
remote: Total 1016 (delta 316), reused 301 (delta 300), pack-reused 628 (from 1)
Receiving objects: 100% (1016/1016), 207.76 KiB | 1.92 MiB/s, done.
Resolving deltas: 100% (668/668), done.
```

```
┌─[tester@parrot]─[~/Desktop/HTB/Voleur]
└──╼ $cat  ~/.tmux.conf
# Fix keyboard delay
set -sg escape-time 0
set -g repeat-time 0
set -g default-terminal "tmux-256color"
set -as terminal-features ",xterm-256color:RGB"

# Prefix
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Plugins
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-copycat'
set -g @plugin 'tmux-plugins/tmux-yank'
set -g @plugin 'jaclu/tmux-menus'
set -g @plugin 'tmux-plugins/tmux-logging'
set -g @plugin 'kiyoon/treemux'
set -g @plugin 'noscript/tmux-mighty-scroll'

# Treemux
set -g @treemux-tree-client 'nvim-tree'
set -g @treemux-tree-nvim-init-file '~/.tmux/plugins/treemux/configs/treemux_init.lua'

# Status bar
set-option -g status-interval 120
set-option -g automatic-rename on
set-option -g automatic-rename-format "#{?#{==:#{pane_current_command},bash},#{b:pane_current_path},#{pane_current_command}}"
set -g status-right-length 100
set -g status-right "Public: #(curl -s --max-time 3 icanhazip.com | tr -d '\n') | VPN: #(ip -4 a show dev tun0 2>/dev/null | awk '/inet / {print $2}' | cut -d/ -f1 | head -1 || echo 'Down')"

# History & rename
set -g history-limit 100000
set -g allow-rename off

# Pane joining
bind-key j command-prompt -p "Join pane from:" "join-pane -s :'%%'"
bind-key s command-prompt -p "Send pane to:" "join-pane -t :'%%'"

# Windows & splits keep current path
bind c new-window -c "#{pane_current_path}"
bind '"' split-window -c "#{pane_current_path}"
bind % split-window -h -c "#{pane_current_path}"

# Wayland clipboard fix
set -g update-environment "WAYLAND_DISPLAY DISPLAY XAUTHORITY"
set -g @yank_selection_mouse 'clipboard'
set -g @override_copy_command 'wl-copy'

# Vi copy mode
set-window-option -g mode-keys vi
bind-key -T copy-mode-vi v send-keys -X begin-selection
bind-key -T copy-mode-vi y send-keys -X copy-pipe-and-cancel "WAYLAND_DISPLAY=wayland-0 XDG_RUNTIME_DIR=/run/user/1000 wl-copy"
bind-key -T copy-mode-vi Enter send-keys -X copy-pipe-and-cancel "WAYLAND_DISPLAY=wayland-0 XDG_RUNTIME_DIR=/run/user/1000 wl-copy"


# Initialize TMUX plugin manager (keep at bottom)
run '~/.tmux/plugins/tpm/tpm'

```

```
┌─[tester@parrot]─[~/Desktop]
└──╼ $tmux source ~/.tmux.conf
```

## Prefix Key  前綴鍵

> Default `Ctrl+b` replaced with `Ctrl+a`\
> 預設`的 Ctrl+b` 被 `Ctrl+a` 取代

***

## Windows & Panes  窗戶與窗格

| Key  說明              | Action  行動                                      |
| -------------------- | ----------------------------------------------- |
| `Ctrl+a c`           | New window (current path)  <br>新視窗（目前路徑）        |
| `Ctrl+a "`  Ctrl+a ” | Split horizontal (current path)  <br>分開水平（目前路徑） |
| `Ctrl+a %`           | Split vertical (current path)  <br>分裂垂直（電流路徑）   |
| `Ctrl+a j`           | Join pane from another window  <br>從另一個窗戶接入玻璃   |
| `Ctrl+a s`           | Send pane to another window  <br>將窗格傳送到另一個視窗    |

***

## Vi Copy Mode  Vi 複製模式

| Key  說明                           | Action  行動                         |
| --------------------------------- | ---------------------------------- |
| `Ctrl+a [`                        | Enter copy mode  進入複製模式            |
| `v`                               | Start selection  先發選擇              |
| `y` or `Enter`  <br>`y` 或 `Enter` | Copy to system clipboard  複製到系統剪貼簿 |
| `Ctrl+a ]`                        | Paste  黏貼                          |
