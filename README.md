# VCoin
> Фиксим фиксы

VK Coin Miner - недомайнер на NodeJS


![](https://pp.userapi.com/c852132/v852132090/f0416/lmQeM-pCAz0.jpg)


[![Донат](https://img.shields.io/badge/Донат-Qiwi-orange.svg)](https://qiwi.me/xtcry)
[![node version](https://img.shields.io/badge/node->%3D8.0-blue.svg?style=flat-square)](https://nodejs.org/)
[![vcoin version](https://img.shields.io/badge/VCoin-1.2.3-purple.svg?style=flat-square)](https://github.com/xTCry/VCoin/)

***

[Список команд в приложении](#команды)

## Для начала
> **[Node.js](https://nodejs.org/) 8.0.0 или новее**

Установить зависимости
### NPM
```shell
npm i
```

### Использование аргументов

![](https://pp.userapi.com/c847020/v847020485/1d72be/ktfWqwnMjEY.jpg)
![](https://pp.userapi.com/c847020/v847020485/1d72a7/Fxp2lGDPpLI.jpg)

* `-tforce` - использовать токен принудительно (если в `.config.js` задана ссылка)
* `-u [URL]`        - задает ссылку
* `-t [TOKEN]`      - задает токен
* `-to [ID]`      - задает ID страницы для автоперевода `score`

Запуск через [токен](#поулчение-токена)
```shell
node index.js -t AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

Запуск через ссылку
```shell
node index.js -u https://coin.vkforms.ru?vk_access_token_settings=friends\&vk_app_id=6915965\&vk_are_notifications_enabled=0...
```
> Linux: Надо обратить внимание, что перед каждым символом `&` должен быть обратный слеш (`\&`)

> Windows: ссылку указать в кавычках 


## Конфигурация из файла `.config.js`

> Если используются только аргументы при запуске, то файл можно не создавать.


Если использовать конфиг из файла, то:
```js
module.exports = {
  VK_TOKEN: "0ab806158c788...",
  USER_ID: 191039467,
  DONEURL: "https://coin.vkforms.ru?vk_access_token_settings=..."
};
```

| Параметр | Описание                                                |
|----------|---------------------------------------------------------|
| VK_TOKEN | [Поулчить токен](#поулчение-токена) (Это гораздо проще) |
| USER_ID  | ID Страницы пользователя                                |
| DONEURL  | Ссылка на приложение                                    |

Если указать только ```VK_TOKEN```, то остальное можно не указывать.

Например
```js
module.exports = {
  VK_TOKEN: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
};
```

### Поулчение токена

[Разрешить доступ, например, этому приложению](https://vk.cc/9eSo1E) и скопировать полученный токен (85 символов) 

***

## Запуск

Из каталога приложения
```shell
node index.js
```


## Команды

- `help` - помощь 
- `stop` - остановить 
- `run` - запустить 
- `tran` - перевод 
- `price` - выведет текущие цены 
- `buy` - покупка (только при запущенном процессе) 
  - `cursor`
  - `cpu`
  - `cpu_stack`
  - `computer`
  - `server_vk`
  - `quantum_pc`
  - `bonus` - только один раз


## З.Ы.
> Если надо зайти в сервис, но выкидывает, то можно использовать команду `stop`, а для возобновления `run`

> При переводе берется незначительная комиссия в виде `10%`

> При lineQuestion вывод лога для удобства приостанавливается


[![Донат](https://img.shields.io/badge/Донат-Qiwi-orange.svg)](https://qiwi.me/xtcry)

