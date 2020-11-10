---
layout: post
title: Distributing projects compiled into PHAR
tags: php devops
excerpt_separator: "<!--more-->"
---

We have seen, in a [previous article][1], how it is possible to compile a Symfony project as a PHAR. If this
manipulation is quite simple to set up, the distribution must be straightforward to avoid wasting time for the project
maintainers.

<!--more-->

As a reminder, we need to have two projects in this context: a `source` project (i.e. readable source code) and a
`binary` project (i.e. PHAR archive). It will therefore be necessary to set up automated processes so that the binary
is updated after each commit and after each new release.

> I will use the syntax of GitHub Actions to illustrate the rest of the article, but the logic remains the same if you
> use GitLab, for example.

Initialization
--------------
Before going any further, we must initialize the file which will contain the configuration:
`.github/workflows/continuous-deployment.yml` at the root of our project. In this first example, we need to trigger an
automated process after each commit on the `master` branch.

Then, we will start to complete it with: the name of the automated process, the name of the event that triggers it, and
the system requirements for its execution. 

```yaml
name: Continuous Deployment

on:
  push:
    branches: ['master']

jobs:
  tests:
    name: Deployment
    runs-on: ubuntu-latest

    steps:
      - name: 'Prepare the build context'
        uses: actions/checkout@v1

      - name: 'Install system requirements'
        run: |
          sudo apt update
          sudo apt install -y libicu-dev
          sudo apt-fast install -y --no-install-recommends \
            php7.4 php7.4-ctype php7.4-intl php7.4-mbstring php7.4-pcov php7.4-sqlite php7.4-xml
```

Permissions
----------- 
In addition to the system prerequisites, there are two other things to consider.
1. The configuration of an SSH key with write access to the `binary` project.
1. The Git configuration to keep a clean history and sign automatic commits.

Signing commits is not required. The most important thing is **do not enter your private key** directly in this file.
Instead, use the [GitHub secrets][2].

```yaml
      - name: 'Load the keys used to deploy the PHAR archive'
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.PRIVATE_DEPLOY_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          echo "${{ secrets.PRIVATE_SIGNING_KEY }}" | gpg --import

      - name: 'Configure the committer identity'
        run: |
          git config --global user.email "name@domain.tld"
          git config --global user.name "Firstname Lastname"
          git config --global commit.gpgsign "true"
          git config --global user.signingkey "XXXXXXXXXXXXXXXX"
```

Building process
----------------
Just before compiling, we have to install the project dependencies. I usually take advantage of this step to check that
there is no desynchronization between my `composer.json` file and my `composer.lock` file.

This last prerequisite passed, we can execute the compilation of our project.

```yaml
      - name: 'Install Composer dependencies'
        run: |
          composer validate --strict --ansi
          composer install --optimize-autoloader --classmap-authoritative --ansi

      - name: 'Compile the PHAR archive'
        run: |
          composer dump-env prod
          ./bin/console cache:warmup
          docker run --volume="$(pwd):/app:delegated" ajardin/humbug-box compile --ansi
```

Deployment process
------------------
It's now time to update the `binary` project. Here is a procedure that allows keeping an intelligible history.

1. First, we clone the `binary` project into a temporary directory.
1. We copy the previously generated PHAR inside this one.
1. We index the change, and we include in the commit message a reference to the commit which is at the origin of the
automated process.
1. And finally, we push these changes on the `binary` project. 

By doing this, we will have an almost similar history between the two projects.

```yaml
      - name: 'Prepare the local Git repository which contains the PHAR archive'
        run: |
          git clone git@github.com:origanization/project.git /tmp/project
          mkdir -p /tmp/project/bin/
          cp ./build/project.phar /tmp/project/bin/project

      - name: 'Update the remote Git repository which contains the PHAR archive'
        run: |
          cd /tmp/project
          git add bin/project
          git commit --message="Update to commit https://github.com/origanization/project-source/commit/${{ github.sha }}"
          git push origin HEAD:master
```

Releases management
-------------------
The release of a new release is almost identical to the deployment of a new commit. Only the event that triggers the
process and the final step are different.

```yaml
name: Release Version

on:
  push:
    tags: ['v*.*.*']

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest

    steps:

      # [...]

      - name: 'Update the remote Git repository which contains the PHAR archive'
        run: |
          tag_name=$(git show "${{ github.ref }}" --no-patch --format="" | head -n1 | awk '{print $2}')
          tag_message=$(git show "${{ github.ref }}" --no-patch --format="" | tail -n1)
          cd /tmp/project

          git add bin/project
          git commit --message="Update to version ${tag_name}"
          git push origin HEAD:master

          git tag "${tag_name}" --message="${tag_message}" --force --sign
          git push origin "${tag_name}" --force
```

Composer
--------
Last but not least, you need to add a `composer.json` file to the `binary` project to indicate the location of the PHAR
archive. This way, Composer will be able to process it correctly.

```json
{
    "name": "organization/project",
    "...": "...",
    "bin": "bin/xyz"
}
```

Thanks for reading!

-------------------

> This post is also published on [DEV][3].  
> Feel free to go there if you wish to react or participate in the discussion.

<!-- Resources -->
[1]: https://ajardin.fr/2020/08/21/compiling-symfony-projects-into-phar/
[2]: https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets
[3]: https://dev.to/ajardin/distributing-projects-compiled-into-phar-2e5o
