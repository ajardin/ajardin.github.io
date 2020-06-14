---
layout: post
title: Adding tags to EBS volumes
tags: aws devops
excerpt_separator: "<!--more-->"
---

Tagging all your Amazon resources is a must-have if you want to have an efficient billing follow-up. It’s very simple
in most cases, but not always. Like with EBS volumes within an auto-scaling group.

Even if it's not natively possible, there is always a solution with AWS.

<!--more-->

Currently, an auto-scaling group do not automatically apply its tags to EBS volumes attached to its EC2 instances. There
 is only a pending feature request and no ETA can be provided. Maybe it will be possible in the next months, maybe not.

Until then, we have to implement something by ourselves.

And after a discussion with the AWS support we came to the conclusion that the best solution is to implement a custom
logic at the EC2 instance boot through the launch configuration. The script is built on top of AWS CLI with the usage of
 EC2 instance metadata. Let’s have a look.

<script src="https://gist.github.com/ajardin/d28c36993f56fd6d10b9287afc39b8b2.js?file=aws-ebs-tags.sh"></script>

The only requirement to implement that script is to attach the following policy on your EC2 instances, otherwise it
won't be possible to your EC2 instances to retrieve their tags and add them to EBS volumes.

<script src="https://gist.github.com/ajardin/d28c36993f56fd6d10b9287afc39b8b2.js?file=aws-ebs-tags-policy.json"></script>

Thanks for reading!
