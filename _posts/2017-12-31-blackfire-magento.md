---
layout: post
title: Blackfire & Magento
tags: blackfire magento php
excerpt_separator: "<!--more-->"
---

<p class="message">
Multiple terms related to Blackfire are used in that article.
If you are not familiar with that tool, I suggest you to read the excellent
<a href="https://blackfire.io/docs/24-days/index" target="_blank" rel="noopener">24 days of Blackfire</a> tutorial.
</p>

The first thing I profiled with Blackfire was a Magento project with PHP 5.5.

Like most existing projects where the addition of new features is constant, we started to face performance issues more
and more often while the codebase keep growing. At that moment, the project already started 4 years ago.

<!--more-->

Investigations
--------------
Blackfire provides several statistics: wall time, I/O wait, CPU time, memory consumption, network, HTTP and SQL queries.
Here is my first profile, without page cache and without blocks cache. This allows to profile the real output and not
the whole Magento initialization.

Something weird can already be spotted.

<img src="{{ '/public/img/screenshots/profile_before_toolbar.png' | absolute_url }}" alt="Blackfire toolbar"/>
<img src="{{ '/public/img/screenshots/profile_before_sql.png' | absolute_url }}" alt="Blackfire SQL queries"/>

You can already see that more than 700 SQL queries are executed on each page only for something related to the URL
rewrites system. In the meantime, the call graph shows that the **inclusive time** within the
<code class="highlighter-rouge">navigation/top.phtml</code> template is **3.92s**.

<p class="message">There is obviously an issue somewhere related to the main menu calculation!</p>

After further investigations, I found out that the main performance issue was due to the wrong usage of a custom method.
A method used for each of the menu entries in order to put the category URL into an HTML link.
But instead of using what has been already loaded through the categories collection, that method retrieves it from the
database...

In our case, the _url_path_ attribute is always exactly equal to the canonical URL.
And that attribute is already loaded by default in the categories collection.
Thus, the fix is pretty straightforward: access the property via a Magento getter.

<script src="https://gist.github.com/ajardin/d28c36993f56fd6d10b9287afc39b8b2.js?file=blackfire-magento-changelog.diff"></script>

And with only these few modified characters, here are the results.

<img src="{{ '/public/img/screenshots/profile_after_toolbar.png' | absolute_url }}" alt="Blackfire toolbar"/>

<p class="message">Now that the issue is resolved, how to be sure that it won't come back again?</p>

Afterwards
----------
It’s common to add a regression by ignoring good practices acquired through experience when a lot of people are working
on a project. Especially when team members change often. The code review can protect against these errors, of course,
but it's time consuming to do it manually. In that case, it would be a good idea to automate these checks.

Blackfire also allows performance testing in addition to profiling.
These assertions can be executed against all data gathered by Blackfire (time dimensions and even more).

During a Blackfire profile, it will look for a `.blackfire.yml` file in the application root directory.
Here is an example with a simple skeleton used for Magento.

<script src="https://gist.github.com/ajardin/d28c36993f56fd6d10b9287afc39b8b2.js?file=blackfire-magento-configuration.yml"></script>

These assertions can be transposed in any projects running on Magento.
It's a really good start, you can keep the structure and adjust values depending of your project.

In my previous example, the performance issue was due to the usage of one specific method.
Rather than checking if that method is added on every new pull request, you can add an assertion related to that use.

<script src="https://gist.github.com/ajardin/d28c36993f56fd6d10b9287afc39b8b2.js?file=blackfire-magento-assertion.yml"></script>

And that’s all... A new metric and a new assertion have been added to our test suite. Here is what it looks like from
the Blackfire results page based on the tests described above.

<img src="{{ '/public/img/screenshots/profile_assertions.png' | absolute_url }}" alt="Blackfire assertions"/>

Conclusion
----------
It’s amazing to see how Blackfire can tell us exactly what is the biggest mistake in a project in less than one hour.
But Blackfire does not limit to the manual profiling, the testing part is definitely a must-have for long running
projects.

Thanks for reading!
