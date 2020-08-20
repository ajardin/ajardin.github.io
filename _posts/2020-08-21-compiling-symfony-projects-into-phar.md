---
layout: post
title: Compiling Symfony projects into PHAR
tags: php symfony
excerpt_separator: "<!--more-->"
---

Most of the time, we use Composer to install tools developed in PHP, like any other library or framework. While this is
the simplest method, it has a significant drawback in that you will automatically inherit the dependencies of these
tools.

<!--more-->

This drawback can quickly become a blocking problem if you require a multitude of tools since the risk of conflicts
between dependencies will be higher. The problem is the same if you install these tools in your projects or your `HOME`
directory (at the global level).

Architecture
------------
To continue using Composer without this constraint, you could distribute the tool not as a library, but as a binary:
a PHAR. But merely adding the binary to your current project next to the other files will not allow you to distribute
it without your dependencies.

You will need two separate projects: a "source" project to work on the tool and a "binary" project to distribute it to
your users without the need for additional dependencies.

Here is an illustration of the workflow under this kind of architecture.
<a href="{{ '/public/img/phar-workflow.jpeg' | absolute_url }}" title="" target="_blank" rel="noopener">
    <img src="{{ '/public/img/phar-workflow.jpeg' | absolute_url }}" alt="PHAR Architecture"/>
</a>

I use [humbug/box][1] to compile my Symfony CLI projects. You can add this tool in the dependencies of your project,
but I advise you to use it as a [standalone][2] to avoid the conflicts we mentioned earlier.

To make things a bit more straightforward, I've created a [Docker image][3] to use it without installing anything else
than Docker.
<script src="https://gist.github.com/ajardin/4be6914eeb42693da5464ece609e4fe7.js?file=1-phar-compilation.sh"></script>

Preparing
---------
Let's create a new Symfony project.
<script src="https://gist.github.com/ajardin/4be6914eeb42693da5464ece609e4fe7.js?file=2-initialize-project.sh"></script>

Not everything is necessary when developing a CLI application. Even though Symfony skeleton is already extremely
lightweight, we will simplify the configuration of our new project.
<script src="https://gist.github.com/ajardin/4be6914eeb42693da5464ece609e4fe7.js?file=3-remove-useless-files.diff"></script>

Your project is now (almost) ready to be compiled.

Compiling
---------
Before going any further, it is crucial to know that the execution context within a PHAR is different from the one we
are used to handling. A PHAR is a read-only archive where it is not possible to write any file. Therefore, it is
mandatory to follow the steps described in the [humbug/box documentation][4] for Symfony:
* remove the assets installation in the `composer.json` file
* put the application in prod mode with the `composer dump-env prod` command
* refresh and warm the application cache before compiling

Here is what you need to do if you want to allow the PHAR compilation of your Symfony project.

To configure the compilation, you have to write a JSON file which is far from being verbose. The
[humbug/box documentation][5] entirely explains the available configuration parameters. I will let you take a look at
it rather than paraphrasing it.

<script src="https://gist.github.com/ajardin/4be6914eeb42693da5464ece609e4fe7.js?file=4-compilation-configuration.diff"></script>

That's all! You can now compile your project. 🚀

Bonus
-----
As it is necessary to chain several commands, I usually fill them in a `Makefile` that will be used from my local
environment and in my CI/CD processes.
<script src="https://gist.github.com/ajardin/4be6914eeb42693da5464ece609e4fe7.js?file=5-makefile.diff"></script>

Next time we will see how to automate the generation and distribution of the PHAR fully.

Thanks for reading!

<!-- Resources -->
[1]: https://github.com/humbug/box
[2]: https://github.com/humbug/box/blob/master/doc/installation.md#phar
[3]: https://github.com/ajardin/docker-images/tree/master/common/humbug-box
[4]: https://github.com/humbug/box/blob/master/doc/symfony.md#symfony-support
[5]: https://github.com/humbug/box/blob/master/doc/configuration.md#configuration
