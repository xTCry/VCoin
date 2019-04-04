# VCoin
> Фиксим фиксы

VK Coin Miner - недомайнер на NodeJS


![](https://pp.userapi.com/c855028/v855028357/1734f/9kFW8iHOxHc.jpg)


[![Донат](https://img.shields.io/badge/Донат-Qiwi-orange.svg)](https://qiwi.me/xtcry)
[![node version](https://img.shields.io/badge/node->%3D8.0-blue.svg?style=flat-square)](https://nodejs.org/)
[![vcoin version](https://img.shields.io/badge/VCoin-1.2.8-purple.svg?style=flat-square)](https://github.com/xTCry/VCoin/)

***

[Список команд в приложении](#команды)

## Для начала
> **[Node.js](https://nodejs.org/) 8.0.0 или новее**

Установить зависимости
### NPM
```shell
npm i
```

## Запуск

### Использование аргументов

![](https://pp.userapi.com/c847020/v847020485/1d72be/ktfWqwnMjEY.jpg)

* `-tforce`         - использовать токен принудительно (если в `.config.js` задана ссылка)
* `-u [URL]`        - задает ссылку
* `-t [TOKEN]`      - задает токен
* `-to [ID]`        - задает ID страницы для автоперевода `score`
* `-ti [seconds]`   - задает интервал автоперевода в секундах `[по умолчанию 3600 секунд (1 час)]`
* `-tsum [sum]`     - сколько `score` переводить (знаки до запятой)
* `-autobuy`        - автопокупка
* `-autobuyItem`    - какое покупать [ускорение](#названия-ускорений)


Запуск поизводится из каталога приложения

Обычный запуск (если есть файл `.config.js`)
```shell
node index.js
```

Запуск через [токен](#получение-токена)
```shell
node index.js -t AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

Запуск через [токен](#получение-токена) и автоперевод каждые `7200` секунды (2 часа) на аккаунт `191039467`
```shell
node index.js -t AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA -to 191039467 -ti 7200 
```

Запуск через [токен](#получение-токена) и автопокупка
```shell
node index.js -t AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA -autobuy
```

Запуск через ссылку
```shell
node index.js -u https://coin.vkforms.ru?vk_access_token_settings=friends\&vk_app_id=6915965\&vk_...
```
> Linux: Надо обратить внимание, что перед каждым символом `&` должен быть обратный слеш (`\&`)

> Windows: ссылку указать в кавычках 


## Конфигурация из файла `.config.js`

> Если используются только аргументы при запуске, то файл можно не создавать.


| Параметр | Описание                             |
|----------|--------------------------------------|
| VK_TOKEN | [Поулчить токен](#получение-токена)  |
| DONEURL  | Ссылка на приложение                 |

Если указать только ```VK_TOKEN```, то `DONEURL` можно не указывать.

Конфиг с токеном:
```js
module.exports = {
  VK_TOKEN: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
};
```

Конфиг с ссылкой:
```js
module.exports = {
  DONEURL: "https://coin.vkforms.ru?vk_access_token_settings=..."
};
```

### Получение токена

[Разрешить доступ, например, этому приложению](https://vk.cc/9eSo1E) и скопировать полученный токен (85 символов) 

***


## Команды

- `help` - помощь 
- `stop` - остановить 
- `run` - запустить 
- `tran` - перевод 
- `price` - выведет текущие цены 
- `buy` - покупка ускорения

## Названия ускорений
- `cursor`
- `cpu`
- `cpu_stack`
- `computer`
- `server_vk`
- `quantum_pc`
- `datacenter`
- `bonus` - только один раз


## З.Ы.
> Если надо зайти в сервис, но выкидывает, то можно использовать команду `stop`, а для возобновления `run`

> При переводе берется незначительная комиссия в виде `10%`

> При lineQuestion вывод лога для удобства приостанавливается


[![Донат](https://img.shields.io/badge/Донат-Qiwi-orange.svg)](https://qiwi.me/xtcry)

