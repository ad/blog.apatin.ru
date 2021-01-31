+++
title = "Установка и настройка PostgresQL"
date = "2016-12-12T15:12:00+03:00"
tags = [
    "техническое",
    "postgres",
    "ubuntu",
    "debian"
]
+++

Установка
---------

```
apt-get update
apt-get upgrade
apt-get install postgresql
```

<!--more-->

Смена пароля пользователя
-------------------------

```
su postgres
psql
alter user postgres password '...';
```
