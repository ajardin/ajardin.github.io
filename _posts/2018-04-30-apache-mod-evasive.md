---
layout: post
title: Defending against Apache DoS attacks
tags: security devops
excerpt_separator: "<!--more-->"
---

A **Denial of Service** (DoS) attack is a cyber-attack in which someone tries to make a website or a service unavailable
for its intended users/customers by flooding a server with a huge number of requests. It's comparable to
a **Distributed Denial of Service** (DDoS) attack, but that last one is run from many different sources. This makes
the attacks much more difficult to counter.

<!--more-->

While I was working on an AWS infrastructure for a client, I remembered that we had some issues in the past because of
multiple crawlers ran in parallel by different SEO people who wanted to check the website. The configuration that was
used was quite aggressive. Even our hosting provider at that time thought it was an attack...

To prevent the story from repeating itself, I did some research about DoS mitigation with Apache. And I eventually
found **Jonathan Zdziarski's** work on [mod_evasive](https://github.com/jzdziarski/mod_evasive). It was exactly what I
needed: an Apache module to add with only several lines of configuration. But then, I realized that the module was
not compatible with Apache 2.4. That's why I took the decision to
[fork his work](https://github.com/ajardin/mod_evasive) to make it compatible and improve a few things.

How it works
------------
A web hit request comes in. The following steps take place:

- The IP address of the requestor is looked up on the temporary blacklist.
- The IP address of the requestor and the URI are both hashed into a "key". A lookup is performed in the listener's
internal hash table to determine if the same host has requested this page more than once within the past 1 second.
- The IP address of the requestor is hashed into a "key". A lookup is performed in the listener's internal hash table
to determine if the same host has requested more than 50 objects within the past second (from the same child).

If any of the above are true, a 429 response is sent. This conserves bandwidth and system resources in the event of
a DoS attack. Additionally, a system command and/or an email notification can also be triggered to block all the
originating addresses of a DDoS attack.

Once a single 429 incident occurs, mod_evasive now blocks the entire IP address for a period of 10 seconds
(configurable). If the host requests a page within this period, it is forced to wait even longer. Since this is
triggered from requesting the same URL multiple times per second, this again does not affect legitimate users.

How to install
--------------
1. Extract this archive
2. Run `$APACHE_ROOT/bin/apxs -cia mod_evasive.c`
3. The module will be built and installed into `$APACHE_ROOT/modules`, and loaded into your `httpd.conf`
4. Restart Apache

How to configure
----------------
mod_evasive has default options configured, but you may also add the following block to your `httpd.conf`:
```
<IfModule evasive_module>
    DOSHashTableSize    3097
    DOSPageCount        2
    DOSSiteCount        50
    DOSPageInterval     1
    DOSSiteInterval     1
    DOSBlockingPeriod   10
</IfModule>
```

Optionally you can also add the following directives:

```
DOSEmailNotify      you@yourdomain.com
DOSSystemCommand    "su - someuser -c '/sbin/... %s ...'"
DOSLogDir           "/var/lock/mod_evasive"
```

You will find all details related to the configuration in
the [readme](https://github.com/ajardin/mod_evasive/blob/master/README.md).

How to test
-----------
You can verify your setup by running a test with ApacheBench: you should see a lot of non-2XX responses within your
results as in the example below.

```
$ ab -kl -n 5000 -c 200 -H "Accept-Encoding: gzip, deflate" -bi https://www.XXXXX.XXX/
...

Benchmarking www.XXXXX.XXX (be patient)
Completed 500 requests
Completed 1000 requests
Completed 1500 requests
Completed 2000 requests
Completed 2500 requests
Completed 3000 requests
Completed 3500 requests
Completed 4000 requests
Completed 4500 requests
Completed 5000 requests
Finished 5000 requests

...

Concurrency Level:      200
Time taken for tests:   6.860 seconds
Complete requests:      5000
Failed requests:        0
Non-2xx responses:      4671
Keep-Alive requests:    5000
Total transferred:      14302148 bytes
HTML transferred:       12490903 bytes
Requests per second:    728.89 [#/sec] (mean)
Time per request:       274.391 [ms] (mean)
Time per request:       1.372 [ms] (mean, across all concurrent requests)
Transfer rate:          2036.06 [Kbytes/sec] received

...
```

Contributions
-------------
To be honest, I've only added changes on an already awesome module. There are three major differences between my fork
and the official repository:
- Add support for Apache 2.4
- Add the possibility to use XFF HTTP request header
- Replace HTTP_FORBIDDEN by HTTP_TOO_MANY_REQUESTS

If you are not interested in this, you can continue to use the legacy module without any issue.

Thanks for reading!
