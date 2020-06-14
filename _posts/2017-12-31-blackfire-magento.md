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

<p class="message">
This article uses many terms related to Blackfire. If you are not familiar with it, I suggest you read the excellent
<a href="https://blackfire.io/docs/book/index" target="_blank" rel="noopener">PHP Code Performance Explained</a> tutorial written by Blackfire.
</p>

Investigations
--------------
Blackfire provides several statistics: wall time, I/O wait, CPU time, memory consumption, network, HTTP and SQL queries.
Here is my first profile, without page cache and blocks cache. It allows profiling the real output and not the whole
Magento initialization.

Something weird can already be spotted.

<img src="{{ '/public/img/screenshots/profile_before_toolbar.png' | absolute_url }}" alt="Blackfire toolbar"/>
<img src="{{ '/public/img/screenshots/profile_before_sql.png' | absolute_url }}" alt="Blackfire SQL queries"/>

You can already see that more than 700 SQL queries are executed on each page only for something related to the URL
rewrites system. In the meantime, the call graph shows that the **inclusive time** within the `navigation/top.phtml`
template is equal to **3.92s**.

<p class="message">There is an issue somewhere related to the main menu calculation!</p>

After further investigations, I found out that the performance issue was due to the wrong usage of a custom method in
the main menu generation. Where we were retrieving each category URL to populate HTML links, this custom method loads
it from the database systematically.

In our case, the `url_path` attribute is always exactly equal to the canonical URL. And that attribute is already
loaded by default in the categories collection. Thus, the fix is pretty straightforward: access the property via a
Magento getter.
<script src="https://gist.github.com/ajardin/4f47890851d284748f1cf7ac0dbeff96.js?file=1-changelog.diff"></script>

And with only these few modified characters, here are the results.
<img src="{{ '/public/img/screenshots/profile_after_toolbar.png' | absolute_url }}" alt="Blackfire toolbar"/>

<p class="message">Now that the issue is gone, how to be sure that it won't come back again?</p>

Afterwords
----------
It's common to add a regression by ignoring good practices acquired through experience when a lot of people are working
on a project. Especially when team members change often, the code review can protect against these errors, of course,
but it's time-consuming to do it manually. In that case, it would be a good idea to automate these checks.

Blackfire also allows performance testing in addition to profiling. You can use these assertions against all data
gathered by Blackfire (time dimensions and even more). During a Blackfire profile, it will look for a `.blackfire.yml`
file in the application root directory. Here is an example with a simple skeleton used for Magento.
<script src="https://gist.github.com/ajardin/4f47890851d284748f1cf7ac0dbeff96.js?file=2-configuration.yml"></script>

You can transpose this example in any projects running on Magento. It's an excellent start as you can keep the structure
and adjust values depending on your project.

In my example, the performance issue was due to the usage of one specific method. Rather than checking if someone
incorrectly uses it on every new pull request, you can add an assertion.
<script src="https://gist.github.com/ajardin/4f47890851d284748f1cf7ac0dbeff96.js?file=3-assertion.yml"></script>

And that's all! Our test suite now contains a new metric and a new metric. Here is what it looks like from the Blackfire
results page based on the tests described above.
<img src="{{ '/public/img/screenshots/profile_assertions.png' | absolute_url }}" alt="Blackfire assertions"/>

Conclusion
----------
It's impressive to see how Blackfire can tell us precisely what is the biggest mistake in a project in less than one
hour. But Blackfire does not limit to the manual profiling, and the testing part is a must-have for long-running
projects.

Thanks for reading!
