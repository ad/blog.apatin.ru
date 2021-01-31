+++
title = "OS X: поворот и ресайз фотографий"
date = "2014-06-26T14:01:00+03:00"
tags = [
    "photos",
    "resize",
    "OS X"
]
+++

Хотелось бы рассказать про две программки, которые сильно упрощают жизнь, когда имеется много фотографий, которые нужно повернуть и изменить размер: jhead и sips

sips &mdash; стандартная утилита OS X, scriptable image processing system. Кроме прочего, умеет изменять размер картинки по максимальной стороне.

[jhead](http://www.sentex.net/~mwandel/jhead/) &mdash; Exif Jpeg header manipulation tool. Удобна для поворота картинки по данным EXIF. Для её работы нужен libjpeg (brew install libjpeg).

```
$ mkdir 1024 # создаем папку для готовых картинок
```

```
$ jhead -autorot source_images/* # поворачиваем картинки
```

```
$ sips -Z 1024 source_images/* --out 1024/ # изменяем размер
```