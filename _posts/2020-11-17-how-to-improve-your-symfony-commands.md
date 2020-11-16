---
layout: post
title: How to improve your Symfony commands
tags: php symfony
excerpt_separator: "<!--more-->"
---

When we develop a Symfony project, we inherit a lot of default commands. For example, if we create a new project
starting from `symfony/website-skeleton`, we already have more than 80 commands. We can prefix all our custom commands
with `app:` so that they don't get mixed up, but the display remains somewhat overloaded.

<!--more-->

I'm going to present some of the tricks I configure on most of my Symfony projects.

The main one consists of creating a new default command that will allow us to filter what is displayed via the
`bin/console` instruction so that there are only our custom commands. Don't worry! The `bin/console list` behaviour
will not change to let us see all available commands.

Initialization
--------------
To illustrate this post, we will generate a new Symfony project using `website-skeleton`. 

```shell
composer create-project symfony/website-skeleton sandbox
cd sandbox
composer install --optimize-autoloader
```

Default command
---------------
Let's start by creating our new default command: `src/Command/DefaultCommand.php`. In addition to the usual elements, we
explicitly state that this is a hidden command that will not appear in the lists.

```php
<?php

declare(strict_types=1);

namespace App\Command;

use Symfony\Component\Console\Application;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class DefaultCommand extends Command
{
    /**
     * {@inheritdoc}
     */
    protected static $defaultName = 'app:default';

    /**
     * {@inheritdoc}
     */
    protected function configure(): void
    {
        $this->setDescription('Wrapper of the default "list" command');
        $this->setHidden(true);
    }

    # ...
}
```

The `execute` method will probably be a bit different from the one you are used to writing since we will use an already
existing command: `list`. Therefore, we are also going to add an extra parameter to it, the one that allows us to
display only our custom commands.

```php
    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        /** @var Application $application */
        $application = $this->getApplication();

        $command = $application->find('list');
        $arguments = ['namespace' => 'app'];

        $listInput = new ArrayInput($arguments);

        return $command->run($listInput, $output);
    }
```  

Custom application
------------------
To invoke this new command when you write `bin/console`, you will need to configure the application default command.
There are two ways to achieve this.

You can edit the `bin/console` file to add the default command statement.

```php
$kernel = new Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$application = new Application($kernel);
+ $application->setDefaultCommand(\App\Command\DefaultCommand::getDefaultName());
$application->run($input);
```

You can also create your own `Application` class and instantiate it instead of the Symfony class, still within the
`bin/console` file.
 
```php
- use Symfony\Bundle\FrameworkBundle\Console\Application;
+ use App\Application;
```

```php
<?php

declare(strict_types=1);

namespace App;

class Application extends \Symfony\Component\Console\Application
{
    /**
     * {@inheritdoc}
     *
     * @param Kernel $kernel
     */
    public function __construct(KernelInterface $kernel)
    {
        parent::__construct($kernel);

        if ($defaultName = DefaultCommand::getDefaultName()) {
            $this->setDefaultCommand($defaultName);
        }
    }
}

```

I prefer this second option. It may be more verbose, but it allows for more customizations in addition to the default
command.
* Adding a **custom header** before the commands. 
* The configuration of a **custom name** to replace `Symfony`.
* The configuration of a **custom version** to replace the Symfony version.

Here is a complete example with all these customizations.

```php
<?php

declare(strict_types=1);

namespace App;

use App\Command\DefaultCommand;
use Symfony\Bundle\FrameworkBundle\Console\Application as SymfonyApplication;
use Symfony\Component\HttpKernel\KernelInterface;

class Application extends SymfonyApplication
{
    public const CONSOLE_LOGO = <<<'ASCII'
  ___                _   _    _           
 / __| ___ _ __  ___| |_| |_ (_)_ _  __ _ 
 \__ \/ _ \ '  \/ -_)  _| ' \| | ' \/ _` |
 |___/\___/_|_|_\___|\__|_||_|_|_||_\__, |
                                    |___/ 


ASCII;

    public const CONSOLE_NAME = 'Something';

    /**
     * {@inheritdoc}
     *
     * @param Kernel $kernel
     */
    public function __construct(KernelInterface $kernel)
    {
        parent::__construct($kernel);

        if ($defaultName = DefaultCommand::getDefaultName()) {
            $this->setDefaultCommand($defaultName);
        }
    }

    /**
     * {@inheritdoc}
     */
    public function getHelp(): string
    {
        return self::CONSOLE_LOGO.parent::getHelp();
    }

    /**
     * {@inheritdoc}
     */
    public function getName(): string
    {
        return self::CONSOLE_NAME;
    }

    /**
     * {@inheritdoc}
     */
    public function getVersion(): string
    {
        return 'X.Y.Z';
    }
}
```

Conclusion
----------
It is not for nothing that Symfony Console is the most downloaded Symfony component. It is both powerful and
straightforward to configure. I hope that this article will have taught you at least a little bit about it.

Thanks for reading!

-------------------

> This post is also published on [DEV][1].  
> Feel free to go there if you wish to react or participate in the discussion.

<!-- Resources -->
[1]: https://dev.to/ajardin/how-to-improve-your-symfony-commands-jkd
