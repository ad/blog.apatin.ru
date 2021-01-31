+++
title = "Настройка Monit для поддержания жизни nginx/postgresql"
date = "2015-12-29T11:39:00+03:00"
tags = [
    "техническое",
    "postgres",
    "nginx",
    "monit"
]
+++

Установка
---------

```
apt-get install monit
```

<!--more-->

Мониторинг PostgreSQL
---------------------

```
check process postgres with pidfile /var/postgres/postmaster.pid
    group database
    start program = "/etc/init.d/postgresql start"
    stop program = "/etc/init.d/postgresql stop"
    if failed host 127.0.0.1 port 5432 protocol pgsql then restart
```

Мониторинг nginx
----------------

```
check process nginx with pidfile /var/run/nginx.pid
    start program = "/etc/init.d/nginx start"
    stop program  = "/etc/init.d/nginx stop"
    group www-data (for ubuntu, debian)
```
