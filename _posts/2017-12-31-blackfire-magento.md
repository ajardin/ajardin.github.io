---
layout: post
title: Blackfire & Magento
tags: blackfire magento php
excerpt_separator: "<!--more-->"
---

The first thing I profiled with Blackfire was a Magento project with PHP 5.5. Like most existing projects where the
addition of new features is constant, we started to face performance issues more and more often, while the codebase
keeps growing. The project began four years ago.

<!--more-->

> This article uses several terms related to Blackfire. If you are not familiar with it, I suggest you read the excellent
> <a href="https://blackfire.io/docs/book/index" target="_blank" rel="noopener">PHP Code Performance Explained</a>.

Investigations
--------------
Blackfire provides several statistics: wall time, I/O wait, CPU time, memory consumption, network, HTTP and SQL queries.
Here is my first profile, without page cache and blocks cache. It allows profiling the real output and not the whole
Magento initialization.

Something weird can already be spotted.

![Blackfire results before optimizations][1]
![SQL queries before optimizations][2]

You can already see that more than 700 SQL queries are executed on each page only for something related to the URL
rewrites system. In the meantime, the call graph shows that the **inclusive time** within the `navigation/top.phtml`
template is equal to **3.92s**.

There is an issue somewhere related to the main menu calculation!

After further investigations, I found out that the performance issue was due to the wrong usage of a custom method in
the main menu generation. Where we were retrieving each category URL to populate HTML links, this custom method loads
it from the database systematically.

In our case, the `url_path` attribute is always exactly equal to the canonical URL. And that attribute is already
loaded by default in the categories collection. Thus, the fix is pretty straightforward: access the property via a
Magento getter.

{% gist ajardin/4f47890851d284748f1cf7ac0dbeff96 1-changelog.diff %}

And with only these few modified characters, here are the results.

![Blackfire after results][3]

Now that the issue is gone, how to be sure that it won't come back again?

Afterwords
----------
It's common to add a regression by ignoring good practices acquired through experience when a lot of people are working
on a project. Especially when team members change often, the code review can protect against these errors, of course,
but it's time-consuming to do it manually. In that case, it would be a good idea to automate these checks.

Blackfire also allows performance testing in addition to profiling. You can use these assertions against all data
gathered by Blackfire (time dimensions and even more). During a Blackfire profile, it will look for a `.blackfire.yml`
file in the application root directory. Here is an example with a simple skeleton used for Magento.

{% gist ajardin/4f47890851d284748f1cf7ac0dbeff96 2-configuration.yml %}

You can transpose this example in any projects running on Magento. It's an excellent start as you can keep the structure
and adjust values depending on your project.

In my example, the performance issue was due to the usage of one specific method. Rather than checking if someone
incorrectly uses it on every new pull request, you can add an assertion.

{% gist ajardin/4f47890851d284748f1cf7ac0dbeff96 3-assertion.yml %}

Our test suite now contains a new metric and a new metric. Here is what it looks like from the Blackfire
results page based on the tests described above.

![Blackfire assertions results][4]

Conclusion
----------
It's impressive to see how Blackfire can tell us precisely what is the biggest mistake in a project in less than one
hour. But Blackfire does not limit to the manual profiling, and the testing part is a must-have for long-running
projects.

Thanks for reading!

<!-- Resources -->
[1]: /public/img/screenshots/profile_before_toolbar.png
[2]: /public/img/screenshots/profile_before_sql.png
[3]: /public/img/screenshots/profile_after_toolbar.png
[4]: /public/img/screenshots/profile_assertions.png
