---
layout: post
title: Garbage collector for Docker
tags: docker devops
excerpt_separator: "<!--more-->"
---

If you are heavily using Docker on your local environment, it's common to have a lot of dangling images, stopped
containers, orphans volumes, etc. And if you have multiple environments, it can be challenging to clean only useless
things without impacting what you want to keep, like databases, for example.

<!--more-->

> Before executing something, please be sure to understand what it implies!

Manual cleaning
---------------
Of course, it's possible to remove images manually, containers and volumes.

{% gist ajardin/93f12f587f2bcce43aa294c97e44a201 1-manual-cleaning.sh %}

You can even use the built-in version of these three commands.

{% gist ajardin/93f12f587f2bcce43aa294c97e44a201 2-manual-cleaning.sh %}

But what if you want to remove everything except some specific elements?

Advanced cleaning
-----------------
Spotify teams provide a garbage collector that can run as a scheduled task with native whitelist support. Furthermore,
it can run through a Docker container! You can find all details about the usage on [GitHub][1]. The only thing missing
from that tool, in my opinion, is the volumes cleanup.

That's why I decided to create a small script to implement a workaround until that feature is officially supported
(maybe once [this pull request][2] will be merged). The script is only composed of four main steps.

**1. Check if there are exclusion patterns**  
**2. Request confirmation before going further**  
These two steps would prevent any unwanted loss if we forgot to configure exclusion patterns or if we accidentally call
the script.

**3. Remove all unused images and containers**  
The source code of the Spotify garbage collector is downloaded from GitHub and the corresponding Docker image is built
from it. After that, a container is run with all exclusion patterns passed as environment variables. And all unused
images and containers are removed, except those whitelisted.

**4. Remove all dangling volumes**  
All dangling volumes, except those whitelisted, are removed. That last part is only executed if the `-v` argument is
passed to the script; otherwise, the treatment is skipped.

And finally, here is my custom version of the Docker garbage collector.

{% gist ajardin/93f12f587f2bcce43aa294c97e44a201 3-advanced-cleaning.sh %}

Thanks for reading!

<!-- Resources -->
[1]: https://github.com/spotify/docker-gc
[2]: https://github.com/spotify/docker-gc/pull/142
