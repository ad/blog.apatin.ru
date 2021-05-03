+++
title = "Эмуляция Apple Airtag при помощи nRF51822 iBeacon"
date = "2021-05-03T16:51:00+03:00"
tags = [
    "техническое",
    "apple",
    "airtag"
]
+++

Apple выпустила в продажу новый продукт — AirTag, но в России он пока не продается, да и цена в 2990 руб. для радиометки достаточно высокая.

К счастью, в этот раз Apple выпустила [продукт](https://en.wikipedia.org/wiki/AirTag_(tracker)), аналоги которого могут создавать и [другие производители](https://developer.apple.com/find-my/).

У меня завалялся свободный nRF51822 iBeacon, на который оказалось возможным залить совместимую с Apple Airtag [прошивку](https://github.com/seemoo-lab/openhaystack).

<!--more-->

Сама прошивка достаточно проста, но нужно проделать несколько действий, чтобы всё получилось.

Вам понадобится адаптер [STLink v2](https://aliexpress.ru/item/1005001775371078.html) или аналог, а также сами метки nRF51822 iBeacon.

Для начала, нужно припаять 4 провода к метке и подключить их к STLink v2:

{{< post-image src="/images/116386198-e3f6ec00-a85c-11eb-964c-110a8db94f4f.jpg" width="600px" alt="распиновка nRF51822 iBeacon">}}

Далее, скачайте последнюю версию [OpenHaystack](https://github.com/seemoo-lab/openhaystack/releases/latest), создайте новый аксессуар (New accessory), нажмите Deploy и экспортируйте "Export Microbit firmware", сохраните прошивку в Загрузки (Downloads).

&nbsp; 
&nbsp; 
&nbsp; 

Теперь необходимо установить ПО для прошивки

```bash
brew install open-ocd
```

```bash
brew install terminal
```

&nbsp; 
&nbsp; 
&nbsp; 

Подключите STLink к компьютеру.

Откройте два окна терминала, в первом введите:

```bash
openocd -f /usr/local/share/openocd/scripts/interface/stlink-v2.cfg -f /usr/local/share/openocd/scripts/target/nrf51.cfg
```

&nbsp; 
&nbsp; 
&nbsp; 

При этом если STLink и метка рабочие, а также вы правильно припаяли и подключили, то ошибок быть не должно.

&nbsp; 
&nbsp; 
&nbsp; 

Во втором терминале можно подключиться к метке:

```bash
telnet localhost 4444
```

&nbsp; 
&nbsp; 
&nbsp; 

Далее в этом же терминале отправьте, чтобы выключить метку:

```bash
halt
```

&nbsp; 
&nbsp; 
&nbsp; 

Опционально, можно сделать бэкап текущей прошивки:

```bash
dump_image ~/Downloads/nRF51822-backup.bin 0 0x40000
```

&nbsp; 
&nbsp; 
&nbsp; 

Сотрите текущую прошивку (можно будет вернуть старую, если сделали бэкап на предыдущем шаге):

```bash
nrf51 mass_erase
```

&nbsp; 
&nbsp; 
&nbsp; 

Проверьте (не обязательно) новую прошивку (указав путь до файла, который сохраняли на первых шагах):

```bash
program ~/Downloads/openhaystack_firmware.bin verify
```

&nbsp; 
&nbsp; 
&nbsp; 

Загрузите прошивку в метку:

```bash
program /Your/Firmware/File/Path/openhaystack_firmware.bin
```

&nbsp; 
&nbsp; 
&nbsp; 

Готово, после следующей команды метка загрузится и начнет сообщать о своем положении через все совместимые устройства Apple:

```bash
resume
```

&nbsp; 
&nbsp; 
&nbsp; 

Сейчас прошивка сделана так, что сигнал отправляется [каждые две секунды](https://github.com/seemoo-lab/openhaystack/blob/main/Firmware/Microbit_v1/offline-finding/main.c#L18) и метка не выключается. Разработчики планируют увеличить время между анонсами и давать устройству засыпать, что сильно увеличит время работы.
