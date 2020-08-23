---
layout: post
title: Defending against Apache DoS attacks
tags: security devops
excerpt_separator: "<!--more-->"
---

A **Denial of Service** (DoS) attack is a cyber-attack in which someone tries to make a website or a service
unavailable for its intended users/customers by flooding a server with a massive number of requests. It's comparable
to a Distributed Denial of Service (DDoS) attack, but that last one is run from many different sources. It makes the
attacks much more difficult to counter.

<!--more-->

While I was working on an AWS infrastructure for a client, I remembered that we had some issues in the past because of
multiple crawlers run in parallel by different SEO people who wanted to check the website. Their configuration was
quite aggressive. Even our hosting provider at that time thought it was an attack.

To prevent the story from repeating itself, I did some research about DoS mitigation with Apache. And I eventually
found **Jonathan Zdziarski's** work on [mod_evasive][1]. It was exactly what I needed: an Apache module to add with
only several lines of configuration. But then, I realized that the module was not compatible with Apache 2.4. That's
why I decided to [fork his work][2] to make it compatible and improve a few things.

How it works
------------
A web hit request comes in. The following steps take place.

* The IP address of the requestor is looked upon the temporary blacklist.
* The IP address of the requestor and the URI are both hashed into a "key". A lookup is performed in the listener's
internal hash table to determine if the same host has requested this page more than once within the past 1 second.
* The IP address of the requestor is hashed into a "key". A lookup is performed in the listener's internal hash table
to determine if the same host has requested more than 50 objects within the past second (from the same child).

If any of the above is true, a 429 response is sent. It conserves bandwidth and system resources in the event of a DoS
attack. Additionally, system command and/or email notification can also be triggered to block all the originating
addresses of a DDoS attack.

Once a single 429 incident occurs, mod_evasive now blocks the entire IP address for 10 seconds (configurable). If the
host requests a page within this period, it is forced to wait even longer. Since this is triggered by requesting the
same URL multiple times per second, this again does not affect legitimate users.

How to install
--------------
1. Extract this archive
2. Run `$APACHE_ROOT/bin/apxs -cia mod_evasive.c`
3. The module will be built and installed into `$APACHE_ROOT/modules`, and loaded in `httpd.conf`
4. Restart Apache

How to configure
----------------
mod_evasive has default options configured, but you may also add the following block to your `httpd.conf`.

{% gist ajardin/55cc558118f541a9f6e91c49e38f17b7 1-main.conf %}

Optionally you can also add the following directives.

{% gist ajardin/55cc558118f541a9f6e91c49e38f17b7 2-optional.conf %}

You will find all details related to the configuration in the [README][3].

How to test
-----------
You can verify your setup by running a test with ApacheBench: you should see a lot of non-2XX responses within your
results as in the example below.

{% gist ajardin/55cc558118f541a9f6e91c49e38f17b7 3-tests.log %}

Contributions
-------------
To be honest, I've only added changes on an already impressive module. There are three significant differences between
my fork and the official repository:
* Add support for **Apache 2.4**
* Add the possibility to use XFF HTTP request header
* Replace `HTTP_FORBIDDEN` by `HTTP_TOO_MANY_REQUESTS`

If you are not interested in this, you can continue to use the legacy module without any issue.

Thanks for reading!

-------------------

> This post is also published on [DEV][4].  
> Feel free to go there if you wish to react or participate in the discussion.

<!-- Resources -->
[1]: https://github.com/jzdziarski/mod_evasive
[2]: https://github.com/ajardin/mod_evasive
[3]: https://github.com/ajardin/mod_evasive/blob/master/README.md
[4]: https://dev.to/ajardin/defending-against-apache-dos-attacks-3jj
