// Tag classification shared by the homepage 3D Knowledge Map (layouts/partials/index_profile.html)
// and the post-page Attack Path (static/js/local-graph.js). Loaded on every page from layouts/partials/extend_head.html.
// A tag key (lowercase, hyphenated) gets the FIRST entry whose regex matches, so specific ones come first.

// ── Attack stages (post-page Attack Path): where in the attack a technique is used ──
window.KB_PHASES = [
    { name: 'General',     color: '#6b7280', re: /^(htb|linux|windows|misc|offsec|vulnlab|ctf|bugbounty|checklist|tmux|null|burpsuite|netexec|nmap)$|^note-/ },
    { name: 'PrivEsc',     color: '#ff5f56', re: /privilege|privesc|zerologon|uac-bypass|root-escape/ },
    { name: 'AD',          color: '#c792ea', re: /^(bloodhound|kerberos|kerberoast|asrep|adcs|ad-|gpo|ldap|nmap-ad)|adcs|kerbrute|silver-ticket|krb5/ },
    { name: 'Credentials', color: '#f472b6', re: /^decode-|-decode$|decode-|credential|password|secretsdump|lazagne|dpapi|hashcat|john$/ },
    { name: 'Post-Ex',     color: '#ffa726', re: /^(lateral|revshell|reverse-shell|reverser|shell|pivot|tunnel|chisel|ligolo|file-transfer)|enumeration|-proxy-|runascs|mimikatz|bypass|firewall|defender/ },
    { name: 'Foothold',    color: '#9fce63', re: /^(web|owasp|cms|source-code|sqli|xss|lfi|ssti|cve|upload|phishing|grafana|ssh-key)|(^|-)rce(-|$)|-to-|inject/ },
    { name: 'Recon',       color: '#5c9bf5', re: /^(port|nmap|dns|recon|subdomain|vhost|osint|smb|ftp|nfs|tcp-|apache-enum|logs|netexec-)|brute|feroxbuster|ffuf|wfuzz|discovery/ },
    { name: 'Other',       color: '#a1a1aa', re: /.*/ }
];
window.KB_PHASE_ORDER = ['Recon', 'Foothold', 'Credentials', 'AD', 'Post-Ex', 'PrivEsc', 'General', 'Other'];
window.KB_PHASE_OF = function (key) {
    key = (key || '').toLowerCase().trim();
    for (var i = 0; i < window.KB_PHASES.length; i++) if (window.KB_PHASES[i].re.test(key)) return window.KB_PHASES[i];
};

// ── Technical domains (homepage Knowledge Map): what area of security a technique belongs to ──
// Each domain becomes its own island on the map. `hidden` domains are left off the map entirely
// (generic tags like HTB / Linux / Windows link to nearly everything and would glue the islands together).
window.KB_DOMAINS = [
    { name: 'General',     color: '#6b7280', hidden: true,
      re: /^(blog|htb|linux|windows|misc|offsec|vulnlab|ctf|bugbounty|checklist|tmux|null|burpsuite|netexec|nmap|easy|medium|hard|insane)$|^note-windows$/ },
    { name: 'Reversing',   color: '#2dd4bf', re: /^reverse-engine|buffer-overflow|ghidra|x64dbg|mona|dll-strings/ },
    { name: 'Pivoting',    color: '#ffa726', re: /^lateral-movement-(chisel|ligolo|naabu|account-verify-rustscan)|-proxy-|tunnel|port-forward|^file-transfer|sshpass-file-transfer|binary-file-transfer/ },
    { name: 'AD',          color: '#c792ea', re: /^(bloodhound|kerberos|kerberoast|asrep|adcs|gpo|nmap-ad|note-ad|smb-username-collect)|^port88-|^port369-|ldap|adcs|kerbrute|silver-ticket|krb5|lateral-movement-kerberos|zerologon|delegation|rid-brute/ },
    { name: 'Credentials', color: '#f472b6', re: /^decode-|-decode$|hashcat|john$|password|credential|secretsdump|lazagne|dpapi|veracrypt/ },
    { name: 'Web',         color: '#9fce63', re: /^(web-|owasp-|cms-|source-code|lfi|xss|sqli|ssti|cve-|burpsuite-|grafana|apache-|logs-|phishing|tcp-3128|port80-|port443-)|subdomain|directory-brute|web-directory|feroxbuster|ffuf|wfuzz|header|jwt|cookie/ },
    { name: 'Windows',     color: '#38bdf8', re: /^windows-|^window-|^port5985-|^port3389-|^port1433-|^port135-|^port139-|mimikatz|runascs|amsi|defender|lateral-movement/ },
    { name: 'Linux',       color: '#facc15', re: /^linux-|^inux-|^port22-|^ssh-|^port2049-|^nfs-|^port873-|^port5432-|^port3306-|revshell|reverse-shell|reverser-shell|docker/ },
    { name: 'Network',     color: '#5c9bf5', re: /^(nmap|port|ftp-|netexec-|dns|snmp)|bruteforce/ },
    { name: 'Other',       color: '#a1a1aa', re: /.*/ }
];
window.KB_DOMAIN_ORDER = ['Web', 'AD', 'Windows', 'Linux', 'Network', 'Pivoting', 'Credentials', 'Reversing', 'Other', 'General'];
window.KB_DOMAIN_OF = function (key) {
    key = (key || '').toLowerCase().trim();
    for (var i = 0; i < window.KB_DOMAINS.length; i++) if (window.KB_DOMAINS[i].re.test(key)) return window.KB_DOMAINS[i];
};
