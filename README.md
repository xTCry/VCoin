# VCoin - official VK Coin Bot

<s>VK Coin Miner - недомайнер на NodeJS</s>

VK Coin Bot - бот для работы с с VK Coin


[![VCoin 1.5.02 download](https://img.shields.io/badge/VCoin%201.5.02-download-blue.svg?logo=github&style=for-the-badge)](https://github.com/xTCry/VCoin/archive/master.zip)

> Хоть майнинг VK Coins остановлен,
>> но это еще не всё

![](https://pp.userapi.com/c845122/v845122441/1e9fb5/7-vBaawGgh0.jpg)

[![vcoin version](https://img.shields.io/badge/VCoin-1.5.02-purple.svg?style=flat-square)](https://github.com/xTCry/VCoin/)

[![Донат](https://img.shields.io/badge/Донат-Qiwi-orange.svg)](https://qiwi.me/xtcry)
[![node version](https://img.shields.io/badge/node->%3D8.0-blue.svg?style=flat-square)](https://nodejs.org/)

[![Официальная группа](https://img.shields.io/badge/Официальная-группа-green.svg)](https://vk.cc/9ghtmS)
[![Беседа #1](https://img.shields.io/badge/Беседа-%231-yellow.svg?style=flat-square)](https://vk.cc/9fmVAc)
[![Беседа #2](https://img.shields.io/badge/Беседа-%232-yellow.svg?style=flat-square)](https://vk.cc/9ghKxb)


***

[Список команд в приложении](#команды)

## Для начала
> **[Node.js](https://nodejs.org/) 8.0.0 или новее**

Если есть какие-то ошибки при запуске, то первым делом выполнить команду для установки зависимостей
### NPM
```shell
npm i
```

## Запуск

### Использование аргументов

![](https://pp.userapi.com/c847020/v847020485/1d72be/ktfWqwnMjEY.jpg)

* `-t [TOKEN]`      - задает токен
* `-u [URL]`        - задает ссылку
* `-slist`          - выведет список созданных пользовательских конфигураций
* `-tforce`         - использовать токен принудительно
* `-beep`           - звуковое сопровождение
* `-proxy`          - включить прокси (если настроен TOR)
* `.......`         - для полного списка в приложении вызови команду `help` или `?`

<!--
Устарело
* `-tsum [sum]`     - сколько `score` переводить (знаки до запятой)
* `-autobuy`        - автопокупка ускорений
* `-autobuyItem`    - какое покупать [ускорение](#названия-ускорений)
* `-smartbuy`       - умная покупка ускорений
* `-hidespam`       - отключить вывод обновления коинов в лог консоли
* `-to [ID]`        - задает ID страницы для автоперевода `score`
* `-ti [seconds]`   - задает интервал автоперевода в секундах `[по умолчанию 3600 секунд (1 час)]`
-->

Запуск поизводится из каталога приложения

<!-- Запуск через [токен](#получение-токена) и донат в виде 1% от переводимых коинов разработчику
```shell
node index.js -t AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA -donate 1%
``` -->

Запуск с конфигурацией уже когда-то созданного пользователя
```shell
node index.js -uid 191039467
```

Предложит выбрать или создать конфигурацию пользователя
```shell
node index.js -slist
```

### Получение токена

[Получить токен на xTCoin](https://xtcoin.mdewo.com). `код длиной 85 символов`

## Команды
Для полного списка доступных команд используй `help`
- `help`     - помощь 
- `stop`     - остановить 
- `run`      - запустить 
- `tran`     - перевести коины
- `coins`    - веведет информацию о балансе
- `info`     - веведет информацию об аккаунте
- `mkey`     - получить merchant ключ
- `tx`       - история переводов коинов
- `debug`    - посмотреть служебные и заданные параметры
- `color`    - вкл/выкл режима цветной консоли
- `beep`     - вкл/откл звука
- `datecolorbg`   - задать цвет фона даты и времени
- `token`   - установить токен
- `.....`   - и другое...

<!--
Устарело
- `price`    - вывести текущие цены 
- `buy`      - покупка ускорения
- `autobuy`  - вкл\выкл автопокупку ускорений
- `autoBuyItem` - выбрать какое ускорение покупать
- `smartbuy` - вкл\выкл умную покупку ускорений
- `tspam`    - вкл/откл вывод обновления коинов к консоль
-->

## Устарело...
***

## Названия ускорений
- `cursor` - курсор
- `cpu` - видеокарта
- `cpu_stack` - стойка видеокарт
- `computer` - суперкомпьютер
- `server_vk` - сервер ВКонтакте
- `quantum_pc` - квантовый компьютер
- `datacenter` - датацентр
- `bonus` - только один раз

## Что такое SmartBuy

### SmartBuy
Умная покупка рассчитывает для каждого ускорителя цену для скорости 1 коин в секунду и покупает самый дешевый ускоритель.
Умная покупка не может работать в паре с автопокупкой!


## З.Ы.
> Если надо зайти в сервис, но выкидывает, то можно использовать команду `stop`, а для возобновления `run`

[![Донат](https://img.shields.io/badge/Донат-Qiwi-orange.svg)](https://qiwi.me/xtcry)
