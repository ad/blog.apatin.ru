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

Иногда нужно добавить логирование изменений в некоторых таблицах, для этого приходится городить сложную систему, которая будет отслеживать изменения и записывать в нужное место что поменялось, и есть большой риск забыть добавить логирование в каком-то месте, эту проблему можно изящно решить сделав триггер на изменение таблицы (весь исходный код доступен на (github)[https://gist.github.com/ad/24b606793aa73e8fd5bf1fe4a89c9507] или можно скопировать нажав на кнопку).

<!--more-->

<!-- https://carbon.now.sh/?bg=rgba%28171%2C+184%2C+195%2C+1%29&t=lucario&wt=none&l=sql&ds=false&dsyoff=20px&dsblur=68px&wc=true&wa=false&pv=0px&ph=0px&ln=true&fl=1&fm=Hack&fs=10.5px&lh=133%25&si=false&es=2x&wm=false&code=CREATE%2520OR%2520REPLACE%2520FUNCTION%2520change_trigger%28%29%2520RETURNS%2520trigger%2520AS%2520%2524%2524%250ABEGIN%250A%2520%2520IF%2520TG_OP%2520%253D%2520%27INSERT%27%250A%2520%2520%2520%2520THEN%250A%2520%2520%2520%2520%2520%2520INSERT%2520INTO%2520history%2520%28tabname%252C%2520schemaname%252C%2520operation%252C%2520new_val%252C%2520item_id%29%250A%2520%2520%2520%2520%2520%2520VALUES%2520%28TG_RELNAME%252C%2520TG_TABLE_SCHEMA%252C%2520TG_OP%252C%2520row_to_json%28NEW%29%252C%2520NEW.id%29%253B%250A%2520%2520%2520%2520%2520%2520RETURN%2520NEW%253B%250AELSIF%2520TG_OP%2520%253D%2520%27UPDATE%27%250A%2520%2520THEN%250A%2520%2520%2520%2520INSERT%2520INTO%2520history%2520%28tabname%252C%2520schemaname%252C%2520operation%252C%2520new_val%252C%2520old_val%252C%2520item_id%29%250A%2520%2520%2520%2520VALUES%2520%28TG_RELNAME%252C%2520TG_TABLE_SCHEMA%252C%2520TG_OP%252C%2520row_to_json%28NEW%29%252C%2520row_to_json%28OLD%29%252C%2520NEW.id%29%253B%250A%2520%2520%2520%2520RETURN%2520NEW%253B%250A%2520%2520ELSIF%2520TG_OP%2520%253D%2520%27DELETE%27%250A%2520%2520%2520%2520THEN%250A%2520%2520%2520%2520%2520%2520INSERT%2520INTO%2520history%2520%28tabname%252C%2520schemaname%252C%2520operation%252C%2520old_val%252C%2520item_id%29%250A%2520%2520%2520%2520%2520%2520VALUES%2520%28TG_RELNAME%252C%2520TG_TABLE_SCHEMA%252C%2520TG_OP%252C%2520row_to_json%28OLD%29%252C%2520OLD.id%29%253B%250A%2520%2520%2520%2520%2520%2520RETURN%2520OLD%253B%250A%2520%2520END%2520IF%253B%250AEND%253B%250A%2524%2524%2520LANGUAGE%2520%27plpgsql%27%2520SECURITY%2520DEFINER%253B -->

Создаем таблицу, в которой будут храниться изменения:{{< rawhtml >}}<input type="button" value="&#x2398" title="Копировать код" onclick="copyToClipboard('create_table'); return false;">
<input type="hidden" id="create_table" value="CREATE TABLE history (
    id          serial,
    tstamp      timestamp DEFAULT now(),
    schemaname  text,
    tabname     text,
    operation   text,
    who         text DEFAULT current_user,
    new_val     json,
    old_val     json,
    item_id     int8
);">{{< /rawhtml >}}
{{< post-image src="/images/CREATE_TABLE_history.png" width="375px" alt="Создаем таблицу">}}

Создаем функцию, которая будет записывать изменения:{{< rawhtml >}}<input type="button" value="&#x2398" title="Копировать код" onclick="copyToClipboard('create_or_replace'); return false;">
<input type="hidden" id="create_or_replace" value="CREATE OR REPLACE FUNCTION change_trigger() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT'
    THEN
      INSERT INTO history (tabname, schemaname, operation, new_val, item_id)
      VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, row_to_json(NEW), NEW.id);
      RETURN NEW;
ELSIF TG_OP = 'UPDATE'
  THEN
    INSERT INTO history (tabname, schemaname, operation, new_val, old_val, item_id)
    VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, row_to_json(NEW), row_to_json(OLD), NEW.id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE'
    THEN
      INSERT INTO history (tabname, schemaname, operation, old_val, item_id)
      VALUES (TG_RELNAME, TG_TABLE_SCHEMA, TG_OP, row_to_json(OLD), OLD.id);
      RETURN OLD;
  END IF;
END;
$$ LANGUAGE 'plpgsql' SECURITY DEFINER;">{{< /rawhtml >}}
{{< post-image src="/images/CREATE_OR_REPLACE_FUNCTION.png" width="600px" alt="Создаем функцию">}}


Вешаем триггер на нужные таблицы:{{< rawhtml >}}<input type="button" value="&#x2398" title="Копировать код" onclick="copyToClipboard('create_trigger'); return false;">
<input type="hidden" id="create_trigger" value="CREATE TRIGGER tablename_trigger BEFORE INSERT OR UPDATE OR DELETE ON tablename FOR EACH ROW EXECUTE PROCEDURE change_trigger();">{{< /rawhtml >}}
{{< post-image src="/images/CREATE_TRIGGER.png" width="600px" alt="Вешаем триггер">}}