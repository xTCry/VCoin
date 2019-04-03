# VCoinX
VCoinX - обычный VCoin, но с вырезанной рекламой и донатом, а так-же прочими плюшками.
В VCoinX присутствуют не только все обновления из оригинального VCoin, а так-же исправление фиксов и текста.
Вы можете отправить свои предложения по улучшению в Issues. 

![](https://pp.userapi.com/c852132/v852132090/f0416/lmQeM-pCAz0.jpg)

<!-- <span class="badge-npmversion">
  <a href="https://npmjs.org/package/vcoin" title="View this project on NPM"><img src="https://img.shields.io/npm/v/projectz.svg" alt="NPM version" /></a>
</span> -->

[![Донат разработчику оригинальной версии](https://img.shields.io/badge/Донат-Qiwi-orange.svg)](https://qiwi.me/xtcry)
[![Донат разработчику VCoinX](https://img.shields.io/badge/Донат-Qiwi-orange.svg)](https://qiwi.me/vcoinx)
[![node version](https://img.shields.io/badge/node->%3D8.0-blue.svg?style=flat-square)](https://nodejs.org/)
[![vcoin version](https://img.shields.io/badge/VCoinX-1.0.0-yellow.svg?style=flat-square)](https://github.com/cursedseal/VCoinX/)

***

## Для начала Вам потребуется
> **[Node.js](https://nodejs.org/) версии 8.0.0 или новее**

Установить зависимости
### NPM
```shell
npm i
```

### Использование аргументов

![](https://pp.userapi.com/c847020/v847020485/1d72be/ktfWqwnMjEY.jpg)
![](https://pp.userapi.com/c847020/v847020485/1d72a7/Fxp2lGDPpLI.jpg)

* -tforce - использовать токен принудительно (если в `config.js` задана ссылка)
* -u [URL]        - задает ссылку
* -t [TOKEN]      - задает токен

Запуск через [токен](#получение-токена)
```shell
node index.js -t j00Rt0k3Ny0urT0k3ny0urt0k3nY0urt0k3nY0uRT0k3nY0URT0K3nY0uRt0K3Ny0uRT0K3Ny0URT0k3Ny0Ur
```

Запуск через ссылку
```shell
node index.js -u https://coin.vkforms.ru?vk_access_token_settings=friends\&vk_app_id=6915965\&vk_are_notifications_enabled=0...
```
> Linux: Надо обратить внимание, что перед каждым символом `&` должен быть обратный слеш (`\&`)

> Windows: ссылку указать в кавычках 

## Создать файл `config.js`

Если нужно использовать аргументы, то в файл можно просто записать это:
```js
module.exports = { };
```

Если использовать конфиг из файла, то:
```js
module.exports = {
  VK_TOKEN: "j00Rt0k3Ny0urT0k3ny0urt0k3nY0urt0k3nY0uRT0k3nY0URT0K3nY0uRt0K3Ny0uRT0K3Ny0URT0k3Ny0Ur",
  USER_ID: 513159780,
  DONEURL: "https://coin.vkforms.ru?vk_access_token_settings=..."
};
```

| Параметр | Описание                                                |
|----------|---------------------------------------------------------|
| VK_TOKEN | [Получить токен](#получение-токена) (Это гораздо проще) |
| USER_ID  | ID Страницы пользователя                                |
| DONEURL  | Ссылка на приложение                                    |

Если указать только ```VK_TOKEN```, то остальное можно не указывать.

Например
```js
module.exports = {
  VK_TOKEN: "j00Rt0k3Ny0urT0k3ny0urt0k3nY0urt0k3nY0uRT0k3nY0URT0K3nY0uRt0K3Ny0uRT0K3Ny0URT0k3Ny0Ur"
};
```

### Получение токена

[Перейдите по ссылке](https://vk.cc/9f4IXA), нажмите "Разрешить" и скопируйте часть адресной строки от access_token= до &expires_in (85 символов) 

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
- `buy` - покупка (только при запущенном процессе) 
  - `cursor`
  - `cpu`
  - `cpu_stack`
  - `computer`
  - `server_vk`
  - `quantum_pc`
  - `bonus` - выдает случайное количество монет, можно использовать только один раз.


## P.S. — Интересные факты и подсказки.
> Если Вам необходимо зайти в сервис, но Вы не можете, из-за того, что бот автоматически переподключается, то используйте команду `stop`, а для возобновления `run`.

> При lineQuestion вывод лога для удобства приостанавливается

