---
title: How To Break Synology RAID 1
published: 2026-01-03T21:45:43+01:00
modified: 2026-01-04T13:47:24+01:00
draft: false
description: How to break Synology RAID 1 so you can use all your drives.
cover: "[[featured.jpg]]"
tags:
  - synology
  - raid
  - nas
---

## Breaking RAID 1 on Synology Can't Be That Hard, Right?

My storage space disappeared almost instantly as soon as I started self-hosting. I have brand-new 2x4 TB drives in a Synology NAS DS218j in a RAID 1 pool that are already full. I thought this would be enough for at least two years. How naive of me. So, what now?

I thought it should be pretty straightforward. Break the pool and create an expandable one. Just go into the web interface, look for the volumes, and remove one from the pool. Easy. Since it is mirrored, the data should be on both disks. Logically, that made sense. But after looking through the options for an hour, there was nothing like that.

*Sigh.* Another night spent looking for answers.

So, I started digging through forums and help threads on how to do this. A few hours later, it turns out there is no supported way of breaking a RAID 1 in-place without installing new disks and moving all the data there. And I can't afford new HDDs with more storage space (not in this economy).

Later, I found a [forum post](https://community.spiceworks.com/t/synology-nas-how-to-break-a-raid-1-without-losing-data/737132/10) with a pretty easy step-by-step guide. The guide was 90% true. However, due to updates or a different machine, I was missing the option to use a deactivated/unhealthy disk in the creation of a new pool. I had to work around it.

**This worked for me and my data. I do not take responsibility for your data loss.**

---

## Guide

{{< alert iconColor="#eed202" >}}
**Warning**

Unlike RAID 1, JBOD offers no fault tolerance. A failure on either disk will result in total data loss across the entire pool. Continue only if you accept this risk.
{{< /alert >}}

### 1. Deactivate One of the Disks

In the **Storage Manager**, go to the **HDD/SSD** tab. Right-click a disk and choose **"Deactivate drive."** Type your password. The disk is now being removed from the pool, and the pool will be "Degraded" (broken).

Now, the NAS will start beeping. To stop the beeping, go to **Control Panel** -> **Hardware & Power** -> **Beep Control** -> **Mute**.

### 2. Remove the Deactivated Disk from the Synology

Open the case, momentarily remove the deactivated disk, and then re-insert it. This "tricks" the system into seeing it as a fresh drive.

### 3. Create a Pool with a Volume

Go to **Storage Manager** -> **Create** -> **Create Storage Pool**. Now, for the pool to be expandable, you must use **JBOD**. If you use the "Basic" type, it cannot be expanded with more disks later. Use the previously deactivated disk as the base for the new pool. The pool will take some time to be created.

### 4. Move Your Data

Now for the most important part. Go to **Control Panel** -> **Shared Folder** and, one by one, edit the folders by changing their "Location" to the new pool. This will take substantial time depending on how much data you have and the speed of your disks. Generally, expect 1 day or more for a full transfer.

### 5. Remove the Old Pool and Volume

After all the data is moved to the new location, remove the old pool and the volume. There might be a problem of apps being installed on the disk. You have to remove them. To continue.
You can now add that unused disk to the new JBOD pool. The pool size will reflect the combined capacity of both disks.

**Enjoy a few moments of more storage until you have to buy bigger disks anyway.**
