+++
title = "Let’s Encrypt SSL Certificates и Nginx"
date = "2015-11-17T14:44:00+03:00"
tags = [
    "техническое",
    "letsencrypt",
    "nginx"
]
+++

Первым делом скачиваем актуальную версию
----------------------------------------

```
sudo apt-get update

sudo apt-get install git

git clone https://github.com/letsencrypt/letsencrypt
```

<!--more-->


```
cd letsencrypt

mkdir -p /etc/letsencrypt/webrootauth
```


Настраиваем nginx на то, чтобы он мог ответить на проверку принадлежности сервера владельцу сертификата


```
nano /etc/nginx/sites-enabled/default
```

```
        server {
                listen 0.0.0.0:80;
                location /.well-known/acme-challenge {
                        alias /etc/letsencrypt/webrootauth/.well-known/acme-challenge;
                        location ~ /.well-known/acme-challenge/(.*) {
                                add_header Content-Type application/jose+json;
                        }
                }
        }
```


Перезапускаем nginx
-------------------

```
/etc/init.d/nginx reload

./letsencrypt-auto --renew-by-default -a webroot --webroot-path /etc/letsencrypt/webrootauth --text --agree-tos -d ваш.домен --email Почта@владельца.сертификата auth
```


Настраиваем nginx на работу с сертификатами
-------------------------------------------

```
cd /etc/nginx

openssl dhparam -out dhparam.pem 2048

nano /etc/nginx/sites-enabled/default</p>
```

```
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    ssl_certificate /etc/letsencrypt/live/ваш_домен/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш_домен/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/ваш_домен/chain.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_dhparam /etc/nginx/dhparam.pem;
    ssl_protocols TLSv1.1 TLSv1.2;
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK';
    ssl_prefer_server_ciphers on;
    add_header Strict-Transport-Security max-age=15768000;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=86400;
    resolver_timeout 10;
...
}
```


Проверяем конфигурацию и перезапускаем nginx
--------------------------------------------

```
nginx -t

/etc/init.d/nginx reload</p>
```


Настраиваем автоматическое обновление сертификатов
--------------------------------------------------

```
/root/letsencrypt/letsencrypt renew >> /dev/null 2>&1; /etc/init.d/nginx reload
```
            