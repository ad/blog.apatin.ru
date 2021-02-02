+++
title = "nginx for frontenders"
date = "2016-04-26T11:37:00+03:00"
tags = [
    "техническое",
    "код",
    "nginx",
    "frontend"
]
+++


Очень часто бывает, что фронтенд-разработчику необходимо добавить или изменить функционал сайта, но&nbsp;нет возможности получить его dev-версию, на&nbsp;которую можно повлиять. Обычно это пытаются обойти запуском браузера с&nbsp;отключенной безопасностью, но&nbsp;не&nbsp;всегда это помогает.

Я&nbsp;расскажу как при работе с&nbsp;&laquo;чёрным ящиком&raquo; иметь возможность воздействать на&nbsp;его ответы, а&nbsp;также как решать проблемы связанные с&nbsp;безопасностью.

<!--more-->

Собираем nginx c&nbsp;необходимыми модулями
------------------

Для этого нам понадобится nginx и&nbsp;несколько вспомогательных модулей для него:

[Module ngx_headers_more](https://github.com/openresty/headers-more-nginx-module), модуль для замены заголовков. Почему не&nbsp;использовать add_header, спросите вы, потому что он&nbsp;добавляет заголовок, даже если он&nbsp;уже был.

[Module ngx_http_sub_module](http://nginx.org/en/docs/http/ngx_http_sub_module.html), позволит нам подменить строки в&nbsp;ответе источника.


Сборка
------------------

Для ubuntu собрать nginx ну&nbsp;очень просто, поэтому опишу как это сделать под OS&nbsp;X.

```
sudo mkdir -p /usr/local/src

cd /usr/local/src
```

pcre можно поставить из&nbsp;brew или собрать самостоятельно

```
sudo wget http://ftp.cs.stanford.edu/pub/exim/pcre/pcre-8.38.tar.gz

sudo tar xzvf pcre-8.38.tar.gz

cd pcre-8.38

sudo ./configure --prefix=/usr/local

sudo make && sudo make install && sudo make clean

cd .

sudo wget http://nginx.org/download/nginx-1.10.0.tar.gz

sudo wget https://github.com/openresty/headers-more-nginx-module/archive/v0.30rc1.tar.gz

sudo tar xzvf nginx-1.10.0.tar.gz

sudo tar xzvf v0.30rc1.tar.gz

cd&nbsp;nginx-1.10.0

sudo./configure --prefix=/usr/local --with-http_sub_module --add-module=/usr/local/src/headers-more-nginx-module-0.30rc1

sudo make && sudo make install && sudo make clean

nano ~/.bash_profile

export PATH="/usr/local/sbin: $PATH"

. ~/.bash_profile
```

Здесь показана сборка без поддержки SSL, поэтому не&nbsp;получится работать с&nbsp;сайтами, которые работают только по&nbsp;HTTPS.


Проверяем работоспособность nginx
---------------------------------

```
sudo nginx -t
```

Конфиг nginx будет лежать по&nbsp;этому пути /usr/local/conf/nginx.conf

Релоад конфига выполняется

```
sudo nginx -s reload
```

Nginx готов, можно приступать!
------------------------------

Предположим, мы&nbsp;хотим повлиять на&nbsp;vk.com

Пропишем наш тестовый домен:

```
sudo nano /etc/hosts

127.0.0.1 test.vk.com
```

Начнём писать наш конфиг. Чтобы было сложнее запутаться, сделаем конфиг в&nbsp;виде инклюдов. В&nbsp;итоге, наш конфиг будет выглядеть как:

site.conf&nbsp;&mdash; в&nbsp;котором будет общее описание сайта и&nbsp;инклюды следующих частей

proxy_site.conf&nbsp;&mdash; здесь мы&nbsp;опишем какая часть запросов пойдёт на&nbsp;сам сайт, а&nbsp;какая будет завернуть к&nbsp;нам

proxy_api.conf&nbsp;&mdash; тут будут настройки проксирования для api, если нужно

headers.conf&nbsp;&mdash; заголовки для подмены, отключим все лишнее, что возвращает backend

sub_filter.conf&nbsp;&mdash; список замен для данных, которые будет возвращать backend

затем, редактируем /usr/local/conf/nginx.conf

добавляем в&nbsp;конец секции http путь до&nbsp;нашего основного инклюда

include /Users/{USERNAME}/nginx_test/site.conf;

Затем, меняем /Users/{USERNAME}/nginx_test/site.conf;

который в&nbsp;свою очередь описывает какой домен мы&nbsp;будем обрабатывать

```
server {
    listen 80;
    server_name &nbsp;test.vk.com;
    include /Users/{USERNAME}/nginx_test/proxy_site.conf;
    include /Users/{USERNAME}/nginx_test/sub_filter.conf;
    include /Users/{USERNAME}/nginx_test/headers.conf;
}
```

Сделаем проксипасс до&nbsp;нужного сервера в&nbsp;/Users/{USERNAME}/nginx_test/proxy_site.conf;

```
location / {
    proxy_set_header Accept-Encoding ""; # это важный параметр, если его не указать, то для gzip сайтов не будет работать замена
    proxy_pass http://vk.com;
}
```

Для примера покажу, как сделать так, чтобы про браузер не&nbsp;знал про vk.com и&nbsp;думал, что он&nbsp;теперь test.vk.com

затем редактируем /Users/{USERNAME}/nginx_test/sub_filter.conf;

sub_filter 'vk.com' 'test.vk.com'; # указыват, какую строку и на что мы заменяем (с версии nginx 1.9.4 можно делать замену разных строк дублируя вызов этой команды)

```
sub_filter_once off; # говорит, что нужно сделать несколько замен, а не только одну

sub_filter_types *; # для каких типов документов выполнять замену, по умолчанию только для html

sub_filter_last_modified on; # менять заголовок, если была произведена замена
```

Подмена домена, на&nbsp;который ставится кука
---------------------------------------------

proxy_cookie_domain 'vk.com' 'test.vk.com';


Заголовки ответа сервера
------------------------

Осталось подменить заголовки, влияющие на&nbsp;безопасность, редактируем /Users/{USERNAME}/nginx_test/headers.conf;

```
more_clear_headers 'Access-Control-*'; # можем удалить заголовки из ответа
more_set_headers 'Access-Control-Allow-Origin: http://test.vk.com'; # или поменять их
```
