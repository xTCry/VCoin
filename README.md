
 VCoin - official VK Coin miner

VK Coin Miner - недомайнер на NodeJS

￼

￼

￼

￼

￼

Глобальная обнова в процессе

$

Список команд в приложении

Для начала

Node.js 8.0.0 или новее

Если есть какие-то ошибки при запуске, то первым делом выполнить команду для установки зависимостей

NPM

npm i



Запуск

Использование аргументов

￼

•  -tforce - использовать токен принудительно (если в .config.js задана ссылка)
•  -u [URL] - задает ссылку
•  -t [TOKEN] - задает токен
•  -to [ID] - задает ID страницы для автоперевода score 
•  -ti [seconds] - задает интервал автоперевода в секундах [по умолчанию 3600 секунд (1 час)] 
•  -tsum [sum] - сколько score переводить (знаки до запятой)
•  -autobuy - автопокупка ускорений
•  -autobuyItem - какое покупать ускорение
•  -smartbuy - умная покупка ускорений
•  -hidespam - отключить вывод обновления коинов в лог консоли
•  -beep - звуковое сопровождение
•  -donate [sum] - поддержать разработчика. sum сколько коинов переводить. (Если указать с символом % , то будет донат процентов от переводимой кому-либо суммы)

Запуск поизводится из каталога приложения

Обычный запуск (если есть файл .config.js )

node index.js



Запуск через токен и донат в виде 1% разработчику

node index.js -t AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA -donate 1%



Запуск через токен и автоперевод каждые 7200 секунды (2 часа) на аккаунт 191039467 

node index.js -t AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA -to 191039467 -ti 7200 



Запуск через токен и автопокупка

node index.js -t AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA -autobuy



Запуск через токен и умная покупка

node index.js -t AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA -smartbuy



Запуск через ссылку

node index.js -u "https://coin.vkforms.ru?vk_access_token_settings=friends&vk_app_id=6915965&vk_..."



Ссылку указывать в кавычках

Конфигурация из файла .config.js 

Если используются только аргументы при запуске, то файл можно не создавать.
￼￼￼￼

Если указать только VK_TOKEN , то DONEURL можно не указывать.

Конфиг с токеном:

module.exports = {
  VK_TOKEN: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
};



Конфиг с ссылкой:

module.exports = {
  DONEURL: "https://coin.vkforms.ru?vk_access_token_settings=..."
};



Получение токена

Разрешить доступ, например, этому приложению и скопировать полученный токен из адрессной строки (85 символов, между #access_token= и &expires_in )

$

Команды
•  help - помощь
•  stop - остановить
•  run - запустить
•  tran - перевести коины
•  price - вывести текущие цены
•  buy - покупка ускорения
•  autobuy - вкл\выкл автопокупку ускорений
•  autoBuyItem - выбрать какое ускорение покупать
•  smartbuy - вкл\выкл умную покупку ускорений
•  debug - посмотреть служебные и заданные параметры
•  color - вкл/выкл режима цветной консоли
•  info - показать место в ТОПе и кол-во коинов

Названия ускорений
•  cursor - курсор
•  cpu - видеокарта
•  cpu_stack - стойка видеокарт
•  computer - суперкомпьютер
•  server_vk - сервер ВКонтакте
•  quantum_pc - квантовый компьютер
•  datacenter - датацентр
•  bonus - только один раз

Что такое SmartBuy

SmartBuy

Умная покупка рассчитывает для каждого ускорителя цену для скорости 1 коин в секунду и покупает самый дешевый ускоритель. Умная покупка не может работать в паре с автопокупкой!

З.Ы.

Если надо зайти в сервис, но выкидывает, то можно использовать команду stop , а для возобновления run 

При lineQuestion вывод лога для удобства приостанавливается

￼

