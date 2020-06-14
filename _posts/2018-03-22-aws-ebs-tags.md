---
layout: post
title: Adding tags to EBS volumes
tags: aws devops
excerpt_separator: "<!--more-->"
---

Tagging all your Amazon resources is a must-have if you want to have an efficient billing follow-up. It's effortless in
most cases, but not always like with EBS volumes within an auto-scaling group. Even if it's not natively possible,
there is still a solution with AWS.

<!--more-->

Currently, an auto-scaling group do not automatically apply its tags to EBS volumes attached to its EC2 instances.
There is only a pending feature request, and no ETA is provided. Maybe it will be possible in the next months, perhaps not.

Until then, we have to implement something by ourselves.

After a discussion with the AWS support, we concluded that the best solution is to implement a custom logic at the
EC2 instance boot through the launch configuration. The script is built on top of AWS CLI with the usage of EC2
instance metadata. Let's have a look.
<script src="https://gist.github.com/ajardin/b085c7066a81212930355d5ce6f0d6b2.js?file=1-esb-tags.sh"></script>

The only requirement to implement that script is to attach the following policy on your EC2 instances. Otherwise, it
won't be possible for your EC2 instances to retrieve their tags and add them to EBS volumes.

<script src="https://gist.github.com/ajardin/b085c7066a81212930355d5ce6f0d6b2.js?file=2-esb-policy.json"></script>
Thanks for reading!
