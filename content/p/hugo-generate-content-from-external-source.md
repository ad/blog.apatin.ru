+++
title = "Создание контента в Hugo из внешнего источника (json)"
date = "2022-02-24T21:34:00+03:00"
tags = [
    "техническое",
    "hugo",
    "json",
    "xml"
]
ghcommentid = 4
+++
Случилось то, что многие ждали, в [Hugo 0.90](https://github.com/gohugoio/hugo/releases/tag/v0.90.0) появилось **resources.Get**. А затем и **getJSON**/**getCSV**.

Это позволяет использовать в качестве источника данных для формирования контента внешние ресурсы, например rss-json фид.

Давайте попробуем это использовать и построим блог из внешних данных, например из rss блога Github.

<!--more-->

Так как Hugo пока не очень дружит с xml, то воспользуемся конвертацией rss2json.com (в случае, если источник уже в виде json, то это не требуется).

Ссылка на json-фид будет выглядеть так https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fgithub.blog%2Ffeed%2F

Я создал [репо с примером](https://github.com/ad/hugo-from-external-source), финальный код будет лежать там.

Сборка будет состоять из двух частей, в первой мы указываем hugo на внешний источник данных и просим построить из него файлы с контентом (разбиваем контент на отдельные посты) и складываем их в целевую папку, в нашем случае это будет content/posts/ из которой уже во второй части Hugo построит сайт.

Для запуска будем использовать Docker, чтобы не нужно было тащить ничего лишнего на локальную машину :)

```
docker run --rm -p 80:1313 $(docker build --progress=plain --no-cache -q .)
```



**Приступим.**

Создаем папку [prebuild](https://github.com/ad/hugo-from-external-source/tree/main/prebuild), в ней будет производиться сборка первого этапа, нам потребуется всего два файла: [prebuild/config.yaml](https://github.com/ad/hugo-from-external-source/blob/main/prebuild/config.yaml) — в котором отключим всё лишнее и укажем, что на выходе нам нужен только html (требуется для создания файлов); и [prebuild/layouts/index.html](https://github.com/ad/hugo-from-external-source/blob/main/prebuild/layouts/index.html) — который и создаст нам раздельные файлы с контентом.

```jinja2
{{ with getJSON "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fgithub.blog%2Ffeed%2F" }}
  {{ range .items }}
    {{ $string := print (jsonify .) .content }}
    {{ $filename := printf "posts/%s.md" (urlize .title) }}
    {{ $resource := resources.FromString $filename $string }}
    {{ $file := $resource.RelPermalink }}
  {{ end }}
{{ end }}
```

with getJSON — Получаем данные из источника

range .items — Идём по списку items

$string := print (jsonify .) .content — Hugo может [получать данные](https://gohugo.io/content-management/front-matter/) для формирования результата в виде `Metadata Content` и на данной строке мы склеиваем всё содержимое конкретного item и его поля content

$filename := printf "posts/%s.md" (urlize .title) — формируем имя файла из поля title конкретного item

На выходе получаем данные в том виде, в котором Hugo может использовать.

**Второй этап**: формирование готового сайта, он у каждого свой, в примере у меня самый простой вариант.



Запускаем сборку, заходим на localhost:80 и получаем результат :)
