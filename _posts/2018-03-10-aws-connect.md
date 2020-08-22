---
layout: post
title: Connecting to EC2 instances without a headache
tags: aws devops
excerpt_separator: "<!--more-->"
---

AWS provides one powerful feature called **auto-scaling**. If you configure it on your infrastructure, you will be able
to automatically adjust capacity to maintain optimal performances at the lowest possible cost. But it will be more
difficult to open an SSH connection on your EC2 instances as the associated IP addresses will change regularly.

<!--more-->

Before going further into details, here is a reminder about the auto-scaling concept.

> Amazon EC2 Auto Scaling helps you maintain application availability and allows you to dynamically scale your Amazon
> EC2 capacity up or down automatically according to conditions you define.

There are two main advantages to using auto-scaling (from the [official presentation][1]).

> You can use Amazon EC2 Auto Scaling for fleet management of EC2 instances to help maintain the health and
> availability of your fleet and ensure that you are running your desired number of Amazon EC2 instances.

> You can also use Amazon EC2 Auto Scaling for dynamic scaling of EC2 instances to automatically increase the number of
> Amazon EC2 instances during demand spikes to maintain performance and decrease capacity during lulls to reduce costs.

In addition to that, it's a security best practice to protect your application servers by using a
**bastion architecture**. In other terms, only one EC2 instance will be exposed in a public subnet when all other EC2
instances will be configured in a private subnet. And to access those servers, you'll need to open an SSH connection
through the bastion host.

![AWS bastion architecture][2]

Even if it's the preferable approach with cloud infrastructure, it's less user friendly when you need to reach one of
your applications servers by SSH. Hopefully, it's not something you do very often on "production ready" platforms since
AWS provides enough services (CloudWatch especially) to let you monitor all your instances.

But when you are working on the building of a new infrastructure, it's useful to be able to quickly SSH into a specific
EC2 instance. By default, you need to retrieve IP addresses from the AWS console first and then, paste them in your
terminal. That's a massive waste of time when EC2 instances are renewed several times a day.

At some time, I decided to create a small script to improve that. The principle is pretty simple: instead of using IP
addresses, I will use instead instances tags that we previously defined to facilitate the billing monitoring. If you
want to use my script, you will need three things:
* a tag `Environment` on your EC2 instances, basically the name of the associated platform.
* a tag `Name` on your EC2 instances, prefixed by the `Environment` value.
* a command-line JSON processor called `jq` on the computer where the script is executed.

Long story short, everything is described below! The only thing you will probably need to change is the SSH account
since I let `ec2-user` in my snippet.

{% gist ajardin/5a1bd9ce8bb29127fed4ba031fa216eb aws-connect.sh %}

Thanks for reading!

<!-- Resources -->
[1]: https://aws.amazon.com/ec2/autoscaling/
[2]: /public/img/bastion_architecture.png
