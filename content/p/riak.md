+++
title = "Riak — как универсальное решение"
date = "2013-07-30T10:40:00+03:00"
tags = [
    "техническое",
    "riak",
    "код"
]
+++

Riak &mdash; это документно-ориентированная база данных с поддержкой HTTP, JSON, REST.

На основе Riak можно реализовать полноценный проект с CMS, поддержкой пользователей и загрузкой файлов.

Возможности
-----------

- Хранение объектов
- Ссылки(связи) между объектами
- Использование в качестве кэша
- Map/reduce, distributed grep
- Отказоустойчивость
- Поиск

<!--more-->

Особенности
-----------

Хранение данных распределенно на серверах (но при большом(50 и более) количестве узлов ребалансировка занимает много времени)


Пример использования
--------------------

Предположим, вам нужно создать форму для опроса с возможностью прикрепления файлов.

На Riak это сделать быстро и просто &mdash; немного времени, HTML и Javascript.

Благодаря тому, что Riak поддерживает REST &mdash; добавление записи и загрузку файла сделать очень легко.

Например, сохраняем заполненную форму:
```
(<form id=”form”...) $.ajax({ url: '/riak/testbucket', type: 'POST', contentType: 'application/json; charset=utf-8', data: JSON.stringify($('#form').serializeArray()), dataType: 'json', success: function(data, textStatus, request){ path = request.getResponseHeader('Location').split('/').pop(-1); } }); 
```


Если не указывать ключ, по которому сохранять данные, то Riak создаст запись со случайным ключем и вернет его значение в поле Location заголовка ответа.

Сохраняем файл: 
```
(<input type=”file” id=”fileinput”...) var files = $('#fileinput').prop('files'); if (files.length > 0) { var file = files[0]; var url = '/riak/testbucket-files/'+path; var xhr = new XMLHttpRequest(); xhr.open('POST', url, true); xhr.setRequestHeader('Content-Type', file.type); xhr.send(file); } 
```


Получаем список сохраненных записей (ключей): 
```
$.ajax({ url: "/riak/testbucket?props=false&keys=true" }).done(function ( data ) { // result here data = {keys: []} }); 
```


В Riak можно хранить и раздавать не только картинки, но и другие файлы, например можно положить индексный HTML-файл, который будет делать запросы к данным и выводить их для пользователей, достаточно при загрузке указать 
```
Content-Type: text/html
```

Таким образом, для создания полноценного портала достаточно только Riak и Nginx(для управления правами на доступ).

Тонкости
--------

Отсутствие данных о времени создания ключа, может вызывать неудобство, но есть информация о времени последнего изменения ключа.

Так как Riak &mdash; документно-ориентированная база данных, то в ней нет схемы, это с одной стороны позволяет добиться гибкости, но в то же время, нужно следить за структурой данных.

{{< css.inline >}}
<style>
.canon { background: white; width: 100%; height: auto; }
</style>
{{< /css.inline >}}