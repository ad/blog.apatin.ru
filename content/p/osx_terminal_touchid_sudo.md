+++
title = "sudo через TouchID/Apple Watch в OS X"
date = "2018-02-22T11:28:00+03:00"
tags = [
    "OS X",
    "terminal",
    "TouchID",
    "sudo"
]
+++

Чтобы вместо ввода пароля для sudo прикладывать палец к TouchID нужно отредактировать файл

```
sudo nano /etc/pam.d/sudo
```

добавив второй строкой:

```
auth sufficient pam_tid.so
```

<!--more-->

{{< figure src="/static/99e9e0511e68ebc75d0e52152805922ad39ba9c0a442f128377d0a8736d73fb7_1e73a2d080594ab5f179ce4c58e9a0abdfd14c670959d7343a0b0d5b4d01931e.png" title="" width="340">}}

{{<post-image image="/static/daf8c4941dac5d300100f72927a27a6189d0b5b73a00b169f0917af877764f39_f919f92be5448e2f294010a87196f7e6030f92375bcdaea81640021cbfd5dee4.jpg" width="159" />}}        
