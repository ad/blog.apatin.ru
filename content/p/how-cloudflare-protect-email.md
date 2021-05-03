+++
title = "Как Cloudflare защищает email"
date = "2020-04-26T11:30:00+03:00"
tags = [
    "техническое",
    "go",
    "cloudflare",
    "javascript",
    "email",
    "Vernam",
    "шифр"
]
+++



Как опубликовать адрес электронной почты на сайте, не боясь, что в него тут же начнут валиться горы спама?

В большинстве случаев эту задачу решают так: вставка адреса картинкой; написание особым способом, который читатели сайта смогут расшифровать (не всегда); форма для ввода текста письма. Разберём плюсы и минусы каждого.

Вставка адреса картинкой
------------------------

[+] большинство ботов не&nbsp;читают тексты с&nbsp;картинки

[-] оформление картинки нужно как-то вписать в контекст

[-] картинку нужно хранить и беречь

[-] не получится создать письмо по нажатию на картинку


Написание особым способом
-------------------------

[+] скорее всего боты не смогут понять что это адрес электронной почты

[-] как и некоторые посетители сайта: help 911 (собака) mail com (замените пробелы на точки)

[-] боты всё же умеют разбирать большинство таких "шифровок"


Форма для ввода текста письма
-----------------------------

[+] ваша почта явно не указана

[-] форма ввода текста &mdash; источник для спама (популярные капчи тоже разгадываются)

[-] разработка и поддержка формы ввода письма

[-] люди могут не хотеть писать в некую форму, не зная получит ли нужный человек письмо



Есть ли способ замаскировать почту так, чтобы и посетителям было удобно и боты на неё не обращали внимания?


*Cloudflare Email Address Obfuscation* позволяет подменять адреса на html-страничках таким образом, чтобы они перестали быть понятными ботам.

{{< rawhtml >}}
<a href="#"><span class="__email__" data-class="472f222b37697e7676072a262e2b6924282a">[email&nbsp;protected]</span></a>
{{< /rawhtml >}} -&gt; 472f222b37697e7676072a262e2b6924282a

**Откройте исходный код страницы и убедитесь, что там нет адреса электронной почты!**

Если интересно как работает этот способ и как сделать аналогичное решение у себя, читайте дальше.

<!--more-->

В основе лежит шифр Вернама &mdash; система симметричного шифрования, изобретённая в 1917 году сотрудником AT&amp;T Гилбертом Вернамом. В нём используется булева функция &laquo;Исключающее ИЛИ&raquo; (bitwise xor). Шифр Вернама является примером системы с абсолютной криптографической стойкостью. При этом он считается одной из простейших криптосистем.


Для&nbsp; создания зашифрованной строки: генерируется случайное символ-число(секрет), берется последовательность символов, которые нужно зашифровать и к каждому из них применяется "исключающее ИЛИ" с секретом.

Рассмотрим на примере выше, как из email получилась такая строка:

1. сгенерировали случайное число из диапазона печатных символов ASCII c 65 по 90 символ (A-Z): получилось 71 (это символ G) имеет значение 47 в шестнадцатеричной системе счисления
2. записали 47 в результат
3. затем применили к первой букве шифруемой строки исключающее ИЛИ, символ "h" имеет код 104, применив к нему XOR и 71 получаем 47, это в шестнадцатеричной системе будет 2f
4. записываем 2f в результат

... применяем шаги 3 и 4 к оставшимся символам

Х. получаем `472f222b37697e7676072a262e2b6924282a`

```
func encode(a string) (s string) {
    b := int64(65 + rand.Intn(35))
    s += strconv.FormatInt(b, 16)
    for _, d := range []rune(a) {
    r := strconv.FormatInt(b^int64(d), 16)
        if len(r)%2!=0 {
            r = "0"+r
        }
        s += r
    }
    return
}
```

Для процесса расшифровки действуем в обратном порядке:

1. считываем первые два символа, это будет 47, из которого после преобразования из шестнадцатеричной системы в десятичную получаем 71 &mdash; это будет наш ключ
2. считываем следующие два символа, это будет 2f, преобразуем к десятичной системе и получаем 47
3. применяем к 47 XOR 71, таким образом получаем 104, а это код буквы h
4. считываем следующие два символа, это будет 22, преобразуем к десятичной системе и получаем 34
5. применяем к 34 XOR 71, таким образом получаем 101, а это код буквы e

... и так далее.

```
func decode(a string) (s string) {
    r, _ := strconv.ParseInt(a[0:2], 16, 0)
    for n := 4; n < len(a)+2; n += 2 {
        i, _ := strconv.ParseInt(a[n-2:n], 16, 0)
        s += string(i ^ r)
    }
    return
}
```

Остаётся добавить код на страницу и email будет в относительной безопасности:

```
<a href="#"><span class="__email__" data-class="472f222b37697e7676072a262e2b6924282a">[email&nbsp;protected]</span></a>

<script type="text/javascript">
      Array.from(document.getElementsByClassName("__email__")).forEach(
        function(l, index, array) {
            var a = l.getAttribute("data-class");
            if (a) {
              var s = '';
              var r = parseInt(a.substr(0, 2), 16);

              for (var j = 2; a.length - j; j += 2) {
                var c = parseInt(a.substr(j, 2), 16) ^ r;
                s += String.fromCharCode(c);
              }
              l.parentNode.href = "mailto:"+s;
              l.parentNode.innerText = s;
            }
        }
    );
</script>
```