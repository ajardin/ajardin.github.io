---
layout: post
title: Connecting to EC2 instances without a headache
tags: aws devops
excerpt_separator: "<!--more-->"
---

AWS provides one powerful feature called **auto-scaling**. If you configure it on your infrastructure, you will be
able to automatically adjust capacity to maintain optimal performances at the lowest possible cost.

But the downside is that it will be more difficult to open an SSH connection on your EC2 instances because the IP
addresses associated will change regularly.

<!--more-->

Before going further into details, here is a reminder for those who are not familiar with the concept.

<div class="message">Amazon EC2 Auto Scaling helps you maintain application availability and allows you to dynamically
scale your Amazon EC2 capacity up or down automatically according to conditions you define.</div>

There are two main advantages of using the auto-scaling. Here is another extract from the
[official presentation](https://aws.amazon.com/ec2/autoscaling/).

<div class="message">
You can use Amazon EC2 Auto Scaling for fleet management of EC2 instances to help maintain the health and availability
of your fleet and ensure that you are running your desired number of Amazon EC2 instances.
</div>

<div class="message">
You can also use Amazon EC2 Auto Scaling for dynamic scaling of EC2 instances in order to automatically increase the
number of Amazon EC2 instances during demand spikes to maintain performance and decrease capacity during lulls to
reduce costs.
</div>

In addition to that, it's a security best practice to protect your application servers by using a
**bastion architecture**. In other terms, only one EC2 instance will be exposed in a public subnet when all others EC2
instances will be configured in a private subnet. And to access those servers, you'll need to open an SSH connection
through the bastion host.

<img src="{{ '/public/img/bastion_architecture.png' | absolute_url }}" alt="Bastion architecture"/>

Even if it's the preferable approach with cloud infrastructure, it's less user friendly when you need to reach one of
your applications servers by SSH. Hopefully, it's not something you do very often on "production ready" platforms since
AWS provides enough services (CloudWatch especially) to let you monitor all your instances.

But when you are working on the building of a new infrastructure, it's definitely useful to be able to quickly
SSH into a specific EC2 instance. By default, you need to retrieve IP addresses from the AWS console first and then,
paste them in your terminal. That's a huge waste of time when EC2 instances are renewed several times a day.

At some time, I decided to create a small script to improve that. The principle is pretty simple: instead of using IP
addresses, I will use instead instances tags that we previously defined to facilitate the billing monitoring. If you
want to use my script, you will need three things:
* a tag `Environment` on your EC2 instances, basically the name of the associated platform.
* a tag `Name` on your EC2 instances, prefixed by the `Environment` value.
* a command-line JSON processor called `jq` on the computer where the script is executed.

Long story short, everything is described below!
The only thing you will probably need to change is the SSH account since I let `ec2-user` in my snippet.

<script src="https://gist.github.com/ajardin/d28c36993f56fd6d10b9287afc39b8b2.js?file=aws-connect.sh"></script>

Thanks for reading!
