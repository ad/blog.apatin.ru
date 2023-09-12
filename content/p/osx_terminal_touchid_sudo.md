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

{{< post-image src="/images/sudo_pam.png" width="340" alt="содержимое файла /etc/pam.d/sudo">}}

{{< post-image src="/images/sudo_applewatch.jpg" width="159" alt="запрос разблокировки на часах">}}
