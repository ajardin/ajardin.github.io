---
layout: post
title: Garbage collector for Docker
tags: docker devops
excerpt_separator: "<!--more-->"
---

If you are heavily using Docker on your local environment, it’s very common to have a lot of dangling images, stopped
containers, orphans volumes, etc. And if you have multiple environments, it can be difficult to clean only useless
things without impacting what you want to keep, like databases for example.

<!--more-->

<div class="message">Before executing something, please be sure to understand what it implies!</div>

Manual cleaning
---------------
Of course, it's possible to manually remove images, containers and volumes:
```
# Remove all dangling images
docker rmi $(docker images --filter="dangling=true" --quiet)

# Remove all stopped containers
docker rm $(docker ps --filter="status=exited" --quiet)

# Remove all dangling volumes
docker volume rm $(docker volume ls --filter="dangling=true" --quiet)
```

You can even use the built-in version of these three commands:
```
# Remove all unused data
docker system prune --volumes
```

But what if you want to remove everything except some specific elements?
The last option becomes impossible, and you must add a whitelist system for each different type of elements. It’s
definitely feasible but also kinda verbose.

Advanced cleaning
-----------------
Spotify teams provide a garbage collector that can be run as a scheduled task with a native whitelist support.
Furthermore, it can be run through a Docker container! You can find all details about the usage
on [GitHub](https://github.com/spotify/docker-gc).

The only thing missing from that tool in my opinion is the volumes cleanup.

That's why I decided to create a small script in order to implement a workaround until that feature is official
supported (maybe once [this pull request](https://github.com/spotify/docker-gc/pull/142) will be merged). The script is
only composed of four main steps.

**1. Check whether exclusion patterns are configured**
**2. Request a confirmation before going further**
These two steps prevent any unwanted loss if the garbage collector is not properly configured (exclusion patterns) or
if the script is accidentally called.

**3. Remove all unused images and containers**
The source code of the Spotify garbage collector is downloaded from GitHub and the corresponding Docker image is built
from it. After that, a container is run with all exclusion patterns passed as environment variables. And all unused
images and containers are removed, except those whitelisted.

**4. Remove all dangling volumes**
All dangling volumes, except those whitelisted, are removed. That last part is only executed if the `-v` argument is
passed to the script otherwise the treatment is skipped.

And finally, here is my custom version of the Docker garbage collector.
<script src="https://gist.github.com/ajardin/d28c36993f56fd6d10b9287afc39b8b2.js?file=docker-garbage-collector.sh"></script>

Thanks for reading!
