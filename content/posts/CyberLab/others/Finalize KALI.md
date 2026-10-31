---
title: Finalize KALI
date: 2026-10-19
ShowToc: true
draft: false
TocOpen: true
password:
tags:
  - blog
lastmod: 2026-10-19T06:02:00.167Z
---
# Post Info

This post covers how I finalize a fresh **Kali Linux VM** for CyberLab: the setup that runs right after a default install, how I made it faster, and how I customize it.

### Remove the unnecessary tools

Run these in zsh as they are. The `${=...}` in the first line makes zsh split the list correctly:

```bash
TO_REMOVE=$(for p in ${=PKGS}; do dpkg -s "$p" >/dev/null 2>&1 && echo "$p"; done)
KISMET=$(dpkg -l 'kismet*' | awk '/^ii/{print $2}')
echo ${=TO_REMOVE} ${=KISMET}
```

The `echo` should now print a long list of package names, with `autopsy`, `binwalk`, `seclists` and the `kismet-*` packages. If it prints nothing, stop and tell me. If the list looks right, run:

```bash
apt remove --purge ${=TO_REMOVE} ${=KISMET}
apt autoremove --purge
```

### Install helpful tools

* **[bat](https://github.com/sharkdp/bat)** — read a file with colour and line numbers (a nicer `cat`)
* **[fd](https://github.com/sharkdp/fd)** — find files by name, quickly (a nicer `find`)
* **[ripgrep](https://github.com/BurntSushi/ripgrep)** — search inside files, very fast (a nicer `grep`)
* **[fzf](https://github.com/junegunn/fzf)** — type a few letters to pick from any list
* **[htop](https://htop.dev)** — see what is using CPU and memory (a nicer `top`)
* **[ncdu](https://dev.yorhel.nl/ncdu)** — find what is filling up the disk
* **[tldr](https://tldr.sh)** — short worked examples instead of long manual pages
* **[zoxide](https://github.com/ajeetdsouza/zoxide)** — `cd` that learns your habits
* **[dust](https://github.com/bootandy/dust)** — `du` as a bar chart
* **[micro](https://github.com/micro-editor/micro)** — a friendly `nano` replacement

```
apt update
for p in bat fd-find ripgrep fzf htop ncdu tldr zoxide micro du-dust; do apt install -y $p || echo "FAILED: $p"; done
```

```
#!/usr/bin/env zsh
# =====================================================
# tools-help.zsh — Kali 工具選單 + 速查表 + 現代化指令（合併版）
# =====================================================
#
# 【如何使用 How-To】
#
# 一、第一次設定（只需做一次）
#   1. 把本檔存到：~/Desktop/Tools/tools-help.zsh
#   2. 在 ~/.zshrc 的最後面加入這一行（只加一次）：
#        source ~/Desktop/Tools/tools-help.zsh
#   3. 重新載入：
#        source ~/.zshrc
#   4. 安裝現代化指令（一次安裝全部）：
#        tools-install
#      會安裝：bat、fd-find、ripgrep、fzf、htop、ncdu、tldr、zoxide、du-dust、micro
#   5. 再重新載入一次，別名才會生效：
#        source ~/.zshrc
#
# 二、日常使用
#   - 輸入 help        → 開啟工具與速查表選單，Enter 後把指令放到輸入列（不會自動執行）
#   - 按 Ctrl-G        → 同上，但直接在目前輸入列插入
#   - help 指令名稱    → 例如 help nmap，顯示 tldr 範例（沒有就顯示 man）
#   - 每次開新終端機，會顯示一行提示
#
# 三、新增自己的內容
#   - 速查表：在下方 CHEATSHEET 區塊新增一行
#        CHEATSHEET[名稱]='指令'
#     指令含有 $ 或反引號時，請用單引號。
#   - 工具腳本：把檔案放進 ~/Desktop/Tools/，並在檔案前 5 行內加上：
#        # help: 這個工具的說明
#     選單就會顯示該說明。
#   - 工具用法（選到後輸入列只會放指令本身，說明只顯示在選單裡）：
#        TOOLUSAGE+=( 'htop -t' '說明文字' )
#
# 四、指令替換對照（互動式終端機才會生效，腳本不受影響）
#   cat  → bat        find → fd         grep → rg
#   top  → htop       du   → dust       nano → micro
#   cd   → z（zoxide，會記住常去的資料夾，例如 cd etc 會跳到 /etc）
#   想用原本的指令：在前面加反斜線，例如 \grep、\find、\cat
#   各工具的詳細用法見下方「六、常用工具用法」
#
# 五、需要的套件
#   fzf（tools-install 會安裝）；上傳伺服器需要：
#        pip install uploadserver --break-system-packages
#
# 六、常用工具用法
#
#   ── du → dust（看哪個資料夾佔空間，用長條圖顯示）──
#     du                  目前資料夾的大小樹狀圖
#     du /var/log         指定資料夾
#     du -d 1             只看第 1 層（-d 後面是深度）
#     du -d 2 /var        看 /var 底下 2 層
#     du -n 10            只顯示最大的 10 項
#     \du -sh *           想用原本的 du：前面加反斜線（dust 的選項和 du 不同）
#     ncdu /              互動式瀏覽磁碟用量（方向鍵進入、d 刪除、q 離開）
#
#   ── top → htop（看誰在用 CPU 和記憶體）──
#     top（或 htop）      開啟畫面
#     F3 或 /             搜尋程序名稱
#     F4                  篩選（只顯示符合的程序）
#     F5 或 t             樹狀顯示（看父子程序）
#     F6                  選擇排序欄位；或直接按 P（CPU）、M（記憶體）、T（時間）
#     u                   只看某個使用者的程序
#     F9                  對選中的程序送出 kill 訊號
#     F10 或 q            離開
#
#   ── fzf（輸入幾個字就能從任何清單裡挑選）──
#     Ctrl-R              搜尋指令歷史，選到的指令會放到輸入列
#     Ctrl-T              找檔案或資料夾，把路徑插入目前輸入列
#     Alt-C               找資料夾並直接跳過去
#     vim **<Tab>         輸入 ** 再按 Tab，用 fzf 挑檔案（cd、ssh、kill 也適用）
#     ls | fzf            把任何輸出接給 fzf 挑選
#     ps aux | fzf -m     -m 可用 Tab 多選
#     在 fzf 裡面：↑↓ 移動、Enter 選取、Esc 離開、直接打字模糊搜尋
#     進階搜尋：'abc 完全符合、^abc 開頭是、abc$ 結尾是、!abc 排除
#
#   ── help（本檔提供的工具選單 + 速查表）──
#     help                開啟選單；清單 = ~/Desktop/Tools 內的檔案 + 速查表
#     Ctrl-G              同上，選到的指令直接插入目前輸入列
#     在選單裡：打字搜尋、↑↓ 移動、右側預覽會顯示檔案內容或完整指令
#     Enter               選取後，指令只會放到輸入列，不會自動執行；
#                         可以先修改，再按 Enter 才執行
#     Esc                 離開，不做任何事
#     help nmap           help 後面加指令名稱：先顯示 tldr 範例，沒有就顯示 man
#     新增速查表          編輯本檔的 CHEATSHEET[名稱]='指令'，再執行 exec zsh
#     新增工具說明        在 ~/Desktop/Tools 的檔案前 5 行加上：# help: 說明
#     選單沒有更新        執行 exec zsh（重新載入會先清空舊的速查表項目）
#     找不到 fzf          執行 tools-install
# =====================================================


TOOLS_DIR="${TOOLS_DIR:-$HOME/Desktop/Tools}"
_TOOLS_HELP_SELF="tools-help.zsh"


# -----------------------------------------------------
# tools-install：一次安裝所有現代化指令
# -----------------------------------------------------
tools-install() {
    local SUDO="" p
    (( EUID != 0 )) && SUDO="sudo"

    $SUDO apt update
    for p in bat fd-find ripgrep fzf htop ncdu tldr zoxide du-dust micro; do
        $SUDO apt install -y "$p" || echo "✗ 安裝失敗：$p"
    done

    echo
    echo "完成。請執行：source ~/.zshrc"
}


# -----------------------------------------------------
# 速查表：常用單行指令
# 名稱 = 選單中顯示的標籤；值 = 實際會插入的指令
# -----------------------------------------------------
unset CHEATSHEET 2>/dev/null   # 重新 source 時先清空，避免舊項目殘留
typeset -A CHEATSHEET

CHEATSHEET[Install-uploadserver]='pip install uploadserver --break-system-packages'
CHEATSHEET[Start-Upload-Download-server]="PORT=1234; python3 -m uploadserver \$PORT & sleep 0.5; echo \"→ http://\$(hostname -I | awk '{print \$1}'):\$PORT\""
CHEATSHEET[Stop-upload-server]='pkill -f "python3 -m uploadserver" && echo "→ Upload server stopped."'
CHEATSHEET[Start-MobSF]='docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest'
CHEATSHEET[Start-Sideloader]="chmod +x \"$TOOLS_DIR/Impactor-linux-x86_64.appimage\" && \"$TOOLS_DIR/Impactor-linux-x86_64.appimage\""
CHEATSHEET[Start-Nessus]='systemctl start nessusd && echo "→ https://localhost:8834"'
# 註：fetch --register 需要啟用碼，沒有啟用碼會失敗，所以這裡只更新外掛。
CHEATSHEET[Update-Nessus-Plugin]='/opt/nessus/sbin/nessuscli update --plugins-only'

# -----------------------------------------------------
# 工具用法：key = 指令本身，value = 說明
# 選單裡會顯示「指令 | [用法] 說明」；
# 按 Enter 後，輸入列只會放入「指令」本身（例如 htop -t），不會放說明文字。
# 格式：TOOLUSAGE+=( '指令' '說明' ... )，一組指令接一組說明。
# -----------------------------------------------------
unset TOOLUSAGE 2>/dev/null
typeset -A TOOLUSAGE
TOOLUSAGE+=(
    'dust -d 1'      'dust（取代 du）：只看目前資料夾的第 1 層。想看 2 層用 dust -d 2；指定資料夾用 dust /var/log'
    'dust -n 10'     'dust（取代 du）：只顯示最大的 10 項。想用原本的 du：command du -sh *'
    'ncdu /'         'ncdu：互動式瀏覽磁碟用量。方向鍵進入資料夾、d 刪除、q 離開'
    'htop -t'        'htop（取代 top）：樹狀顯示。F3 搜尋、F4 篩選、P 依 CPU 排序、M 依記憶體排序、u 選使用者、F9 kill、q 離開'
    'fzf -m'         'fzf：多選模式。Tab 選取多個、Enter 確認、Esc 離開；可接任何清單，例如 ps aux | fzf -m'
    "fzf --preview 'head -n 30 {}'"  'fzf：挑檔案並在右側預覽前 30 行。快捷鍵：Ctrl-R 歷史、Ctrl-T 找檔案、Alt-C 跳資料夾'
)


# -----------------------------------------------------
# 內部：產生選單清單（TOOLS_DIR 內的檔案 + 速查表）
# 每行格式："名稱 | 說明"
# 注意：用 command 呼叫，避免被 grep/cat 等別名影響
# -----------------------------------------------------
_tools_help_list() {
    local f base desc key

    for f in "$TOOLS_DIR"/*(N); do
        base="${f:t}"
        [[ "$base" == "$_TOOLS_HELP_SELF" ]] && continue
        [[ "$base" == .* ]] && continue

        if [[ -d "$f" ]]; then
            printf '%-20s | [資料夾]\n' "$base"
            continue
        fi

        desc=$(command head -n 5 "$f" 2>/dev/null | command grep -m1 '^#[[:space:]]*help:' | command sed -E 's/^#[[:space:]]*help:[[:space:]]*//')
        [[ -z "$desc" ]] && desc="腳本"
        [[ -x "$f" ]] || desc="$desc（無執行權限）"

        printf '%-20s | %s\n' "$base" "$desc"
    done

    for key in "${(@k)CHEATSHEET}"; do
        printf '%-20s | %s\n' "$key" "${CHEATSHEET[$key]}"
    done

    for key in "${(@k)TOOLUSAGE}"; do
        printf '%-20s | [用法] %s\n' "$key" "${TOOLUSAGE[$key]}"
    done
}


_tools_help_fzf() {
    local entries preview_cmd dir
    entries=$(_tools_help_list)
    [[ -z "$entries" ]] && return 1

    dir="${(q)TOOLS_DIR}"

    # 預覽：若名稱對應 TOOLS_DIR 內的檔案/資料夾，顯示內容；
    # 否則是速查表或工具用法，顯示完整內容（{2..} 會包含內容裡的 " | "）。
    preview_cmd='name=$(echo {1} | sed "s/[[:space:]]*$//"); p='"$dir"'/"$name"; if [ -e "$p" ]; then echo "== $p =="; file "$p" 2>/dev/null; echo; if [ -d "$p" ]; then ls -la "$p"; else head -n 15 "$p" 2>/dev/null; fi; else echo "內容："; printf "  %s\n" {2..}; fi'

    printf '%s\n' "$entries" | sort | fzf \
        --height=60% \
        --layout=reverse \
        --border \
        --delimiter=' \| ' \
        --prompt="tools> " \
        --header="Enter：選取 | Esc：離開（工具 + 速查表）" \
        --preview="$preview_cmd" \
        --preview-window=right:50%:wrap
}


# 把選到的那一行轉成真正可執行的指令
_tools_help_resolve() {
    local selected="$1" name
    name=$(echo "$selected" | awk -F'|' '{print $1}' | sed 's/[[:space:]]*$//')

    if (( ${+CHEATSHEET[$name]} )); then
        print -r -- "${CHEATSHEET[$name]}"
    elif (( ${+TOOLUSAGE[$name]} )); then
        print -r -- "$name"          # 工具用法：只插入指令本身
    else
        print -r -- "${(q)TOOLS_DIR}/${(q)name}"
    fi
}


# -----------------------------------------------------
# help：直接輸入的指令
#   help           → 開啟選單
#   help <指令>    → tldr 範例，沒有就顯示 man
# -----------------------------------------------------
help() {
    if [[ -n "$1" ]]; then
        tldr "$1" 2>/dev/null || man "$1"
        return
    fi

    if ! command -v fzf &> /dev/null; then
        echo "找不到 fzf，請先執行：tools-install"
        echo "$TOOLS_DIR 內的檔案："
        ls -1 "$TOOLS_DIR" 2>/dev/null
        return
    fi

    local selected cmd
    selected=$(_tools_help_fzf)
    [[ -z "$selected" ]] && return
    cmd=$(_tools_help_resolve "$selected")

    if [[ -o interactive ]]; then
        print -z "$cmd "
    else
        echo "$cmd"
    fi
}


# -----------------------------------------------------
# Ctrl-G：直接把選到的指令插入目前輸入列
# -----------------------------------------------------
_tools_help_widget() {
    local selected cmd

    if ! command -v fzf &> /dev/null; then
        zle -M "找不到 fzf，請先執行：tools-install"
        return
    fi

    selected=$(_tools_help_fzf)
    if [[ -z "$selected" ]]; then
        zle reset-prompt
        return
    fi

    cmd=$(_tools_help_resolve "$selected")
    BUFFER="$cmd "
    CURSOR=${#BUFFER}
    zle reset-prompt
}

zle -N _tools_help_widget
bindkey '^G' _tools_help_widget


# -----------------------------------------------------
# 現代化指令別名
# 放在檔案最後面：zsh 會在「定義函式時」展開別名，
# 放最後可以確保上面的函式不會被 cat/grep/find 別名影響。
# 只有在該工具已安裝時才設定別名。
# -----------------------------------------------------
if [[ -o interactive ]]; then
    (( $+commands[batcat] )) && alias cat='batcat --paging=never'
    (( $+commands[bat]    )) && alias cat='bat --paging=never'
    (( $+commands[fdfind] )) && alias find='fdfind'
    (( $+commands[fd]     )) && alias find='fd'
    (( $+commands[rg]     )) && alias grep='rg'
    (( $+commands[htop]   )) && alias top='htop'
    (( $+commands[dust]   )) && alias du='dust'
    (( $+commands[micro]  )) && alias nano='micro'

    # zoxide：初始化後 cd 就是 z
    if (( $+commands[zoxide] )); then
        eval "$(zoxide init zsh)"
        alias cd='z'
    fi

    # fzf 快捷鍵（Ctrl-R / Ctrl-T / Alt-C）
    [[ -f /usr/share/doc/fzf/examples/key-bindings.zsh ]] && source /usr/share/doc/fzf/examples/key-bindings.zsh
    [[ -f /usr/share/doc/fzf/examples/completion.zsh   ]] && source /usr/share/doc/fzf/examples/completion.zsh

    # 每次開新終端機顯示提示
    print -P "%F{cyan}💡 提示：%f輸入 %F{yellow}help%f（或按 %F{yellow}Ctrl-G%f）開啟工具與速查表選單。"
fi
```

### Install subl

```
mkdir -p /etc/apt/keyrings
wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | gpg --dearmor > /etc/apt/keyrings/sublimehq-archive.gpg
cat > /etc/apt/sources.list.d/sublime-text.sources <<'EOF'
Types: deb
URIs: https://download.sublimetext.com/
Suites: apt/stable/
Signed-By: /etc/apt/keyrings/sublimehq-archive.gpg
EOF
apt update
apt install -y sublime-text
```
