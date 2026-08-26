---
title: user profile , javascript , css
date: 2026-08-18
ShowToc: true
draft: false
TocOpen: true
password:
isPrivate: true
tags:
  - blog
lastmod: 2026-08-20T06:57:39.867Z
---
### Web Cache Poisoning

Commonly used web caches include [Apache](https://httpd.apache.org/), [Nginx](https://nginx.org/), and [Squid](http://www.squid-cache.org/) , cloudfare

### Detect

* `X-Cache: hit` - 响应来自缓存

* `X-Cache: miss` - 首次请求，未缓存

* `X-Cache: dynamic` - 动态生成内容，通常不缓存

* `X-Cache: refresh` - 缓存内容已过时

* `Cache-Control: public`且`max-age>0` - 可能被缓存

* 攻击者发现用户资料页面`/user/profile`返回敏感信息

* 构造URL`/user/profile/attack.css`

* 诱导已认证用户访问该URL

* 缓存服务器将响应存储为CSS文件

* 攻击者访问同一URL获取缓存中的用户资料

### 实际漏洞示例

* 攻击者发现用户资料页面`/user/profile`返回敏感信息
* 构造URL`/user/profile/attack.css`
* 诱导已认证用户访问该URL
* 缓存服务器将响应存储为CSS文件
* 攻击者访问同一URL获取缓存中的用户资料

某电商平台漏洞：

参考信息

* 订单页面`/orders/123`动态生成
* 添加`.js`扩展后仍返回订单数据
* 缓存服务器因.js规则缓存响应
* 导致订单信息泄露
