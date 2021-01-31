+++
title = "Логирование изменений в Postgresql"
date = "2015-05-26T12:59:00+03:00"
tags = [
    "техническое",
    "код",
    "полезное",
    "postgres",
    "logging",
    "trigger"
]
+++

Иногда нужно добавить логирование изменений в некоторых таблицах, для этого приходится городить сложную систему, которая будет отслеживать изменения и записывать в нужное место что поменялось, и есть большой риск забыть добавить логирование в каком-то месте, эту проблему можно изящно решить сделав триггер на изменение таблицы.

<!--more-->


Создаем таблицу, в которой будут храниться изменения:

```
CREATE TABLE history (
    id                  serial,
    tstamp              timestamp       DEFAULT now(),
    schemaname      text,
    tabname         text,
    operation           text,
    who                 text            DEFAULT current_user,
    new_val             json,
    old_val             json,
        item_id             int8
);
```


Создаем функцию, которая будет записывать изменения:

```
CREATE OR REPLACE FUNCTION change_trigger() RETURNS trigger AS $$
        BEGIN
        IF      TG_OP = 'INSERT'
                THEN
                        INSERT INTO history (tabname, schemaname, operation, new_val, item_id)
                                        VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, row_to_json(NEW), NEW.id);
                                        RETURN NEW;
                        ELSIF   TG_OP = 'UPDATE'
                THEN
                        INSERT INTO history (tabname, schemaname, operation, new_val, old_val, item_id)
                                        VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP,
                                                        row_to_json(NEW), row_to_json(OLD), NEW.id);
                                                RETURN NEW;
                        ELSIF   TG_OP = 'DELETE'
                THEN
                        INSERT INTO history (tabname, schemaname, operation, old_val, item_id)
                                        VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, row_to_json(OLD), OLD.id);
                                        RETURN OLD;
                        END IF;
        END;
        $$ LANGUAGE 'plpgsql' SECURITY DEFINER;
```

Вешаем триггер на нужные таблицы:

```
CREATE TRIGGER tablename_trigger BEFORE INSERT OR UPDATE OR DELETE ON tablename FOR EACH ROW EXECUTE PROCEDURE change_trigger();
```