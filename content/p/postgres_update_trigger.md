+++
title = "Автоматическое обновление поля в PostgreSQL"
date = "2015-05-25T23:57:00+03:00"
tags = [
    "техническое",
    "код",
    "полезное",
    "postgres"
]
+++


В Postgres можно сделать, чтобы при создании записи какому-то параметру автоматически присваивалось значение:

```
ALTER TABLE table_name ADD COLUMN "updated" timestamp NULL DEFAULT now();
```

<!--more-->

В данном примере, мы добавляем параметр updated, который при создании записи будет равен времени её создания.

Но что, если нам нужно обновлять этот параметр при каждом изменении записи? Можно делать **SET updated=now()**, но в каком-то из запросов можно забыть сделать это и поле останется не обновлённым.

На помощь приходят триггеры, вот например, создаем функцию, которая будет выставлять значение поля updated равное текущему времени:

```
CREATE OR REPLACE FUNCTION update_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

А вот так создадим сам триггер, который перед обновлением записи будет вызывать функцию:

```
CREATE TRIGGER **table_name**_updated BEFORE UPDATE ON **table_name** FOR EACH ROW EXECUTE PROCEDURE update_column();
```
