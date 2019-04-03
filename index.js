const url = require('url'),
    {
        VK
    } = require('vk-io');

const VCoinWS = require('./VCoinWS');
const {
    con,
    ccon,
    formateSCORE,
    hashPassCoin,
    rl,
    existsAsync,
    writeFileAsync,
    appendFileAsync,
    infLog,
    rand,
    onUpdates,
} = require('./helpers');
let {
    USER_ID,
    DONEURL,
    VK_TOKEN
} = require('./config.js');


let vk = new VK();
let URLWS = false;
let boosterTTL = null,
    tryStartTTL = null,
    updatesEv = false,
    xRestart = true,
    flog = false,
    tforce = false;

onUpdates(msg => {
    if (!updatesEv) updatesEv = msg;
    con(msg, "white", "Red");
});

let vConinWS = new VCoinWS(USER_ID);


let missCount = 0,
    missTTL = null;
vConinWS.onMissClickEvent(function() {
    if (0 === missCount) {
        clearTimeout(missTTL);
        missTTL = setTimeout(function() {
            missCount = 0;
            return;
        }, 6e4)
    }

    if (++missCount > 20)
        forceRestart(4e3);

    if (++missCount > 10)
        con("Нажатия не засчитываются сервером, возможно, у Вас проблемы с соединением.", true);
});

vConinWS.onReceiveDataEvent(async function(place, score) {
    var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];

    if (place > 0 && !rl.isQst) {

        if (updatesEv && !rand(0, 1))
            con(updatesEv + "\n\t\t\t Введите \'hideupd(ate)\' для скрытия уведомления.", "white", "Red");

        con("Позиция в топе: " + place + "\tКоличество коинов: " + formateSCORE(score, true), "yellow");
    }
});

vConinWS.onTransfer(async function(id, score) {
    let template = "Пользватель с id" + USER_ID + " получил [" + formateSCORE(score, true) + "] коинов от id" + id;
    con(template, "black", "Green");
    try {
        await infLog(template);
    } catch (e) {
        console.error(e);
    }
});

vConinWS.onUserLoaded(function(place, score, items, top, firstTime) {
    con("Пользователь успешно загружен. \n\t\t\tПозиция в топе - " + place + " | \tКоличество коинов - " + formateSCORE(score, true));

    boosterTTL && clearInterval(boosterTTL);
    boosterTTL = setInterval(_ => {
        rand(0, 5) > 3 && vConinWS.click();
    }, 5e2);
});

vConinWS.onBrokenEvent(function() {
    con("onBrokenEvent", true);
});

vConinWS.onAlreadyConnected(function() {
    con("Обнаружено открытие приложения с другого устройства.", true);
    vConinWS.reconnect(URLWS);
});

vConinWS.onOffline(function() {
    con("onOffline", true);
    forceRestart(2e4);
});

async function startBooster(tw) {
    tryStartTTL && clearTimeout(tryStartTTL);
    tryStartTTL = setTimeout(() => {
        con("Производится запуск VCoinX.");

        vConinWS.userId = USER_ID;
        vConinWS.run(URLWS, _ => {
            con("VCoinX был успешно запущен.");
        });
    }, (tw || 1e3));
}

function forceRestart(t) {
    vConinWS.close();
    boosterTTL && clearInterval(boosterTTL);
    if (xRestart)
        startBooster(t);
}


rl.on('line', async (line) => {
    if (!URLWS) return;

    switch (line.trim()) {
        case '':
            break;

        case 'info':
            let XXX = await vConinWS.getUserScores([vConinWS.userId]);
            console.log("Количество коинов: ", XXX);
            break;

        case "hideupd":
        case "hideupdate":
            con("Уведомление об обновлении скрыто.");
            updatesEv = false;
            break;

        case "stop":
        case "pause":
            xRestart = false;
            vConinWS.close();
            break;

        case "start":
        case "run":
            if (vConinWS.connected)
                return con("VCoinX уже запущен и работает!");
            xRestart = true;
            startBooster();
            break;

        case 'b':
        case 'buy':
            let item = await rl.questionAsync("Введите название предмета [cursor, cpu, cpu_stack, computer, server_vk, quantum_pc]: ");
            if (!item) return;
            let result;
            try {
                result = await vConinWS.buyItemById(item);
                if (result && result.items)
                    delete result.items;
                console.log("Результат покупки: ", result);
            } catch (e) {
                if (e.message == "NOT_ENOUGH_COINS") con("Недостаточно средств.", true);
                else con(e.message, true);
            }
            break;

        case 'tran':
        case 'transfer':
            let count = await rl.questionAsync("Количество: ");
            let id = await rl.questionAsync("ID получателя: ");
            let conf = await rl.questionAsync("Вы уверены? [yes]: ");
            if (conf != "yes" || !id || !count) return con("Отправка неудачная, вероятно, один из параметров не был указан.", true);

            try {
                await vConinWS.transferToUser(id, count);
                con("Перевод был выполнен успешно.", "black", "Green");
                let template = "Произведена отпрвка [" + formateSCORE(count * 1e3, true) + "] коинов от vk.com/id" + USER_ID + " для vk.com/id" + id;
                try {
                    await infLog(template);
                } catch (e) {}
            } catch (e) {
                if (e.message == "BAD_ARGS") con("Вероятно, вы где-то указали неверный аргумент.", true);
                else con(e.message, true);
            }
            break;

        case "?":
        case "help":
            ccon("-- VCoinX --", "red");
            ccon("info	- обновление текущенго уровня.");
            ccon("stop(pause)	- остановка майнера.");
            ccon("start(run)	- запуск майнера.");
            ccon("(b)uy	- покупка улучшений.");
            ccon("tran(sfer)	- перевод игроку.");
            ccon("hideupd(ate) - скрыть уведомление об обновлении.");
            break;
    }
});

for (var argn = 2; argn < process.argv.length; argn++) {

    if (["-h", "-help", "-f", "-t", "-flog", "-autobuy", "-u", "-tforce"].includes(process.argv[argn])) {
        if (process.argv[argn] == '-t') {
            let dTest = process.argv[argn + 1];
            if (typeof dTest == "string" && dTest.length > 80 && dTest.length < 90) {
                con("Токен установлен.")
                VK_TOKEN = dTest;
                argn++;
                continue;
            }
        }

        if (process.argv[argn] == '-u') {
            let dTest = process.argv[argn + 1];
            if (typeof dTest == "string" && dTest.length > 200 && dTest.length < 255) {
                con("Пользовательский URL включен.");
                DONEURL = dTest;
                argn++;
                continue;
            }
        }

        if (process.argv[argn] == '-tforce') {
            con("Принудительное использование токена включено.")
            tforce = true;
            continue;
        }

        if (process.argv[argn] == '-autobuy') {
            // TODO
            continue;
        }

        if (process.argv[argn] == '-flog') {
            flog = true;
            continue;
        }

        if (process.argv[argn] == "-h" || process.argv[argn] == "-help") {
            ccon("-- VCoinX arguments --", "red");
            ccon("-help		- помощь.");
            ccon("-flog		- подробные логи.");
            ccon("-tforce		- принудительно использовать токен.");
            ccon("-u [URL]	- задать ссылку.");
            ccon("-t [TOKEN]	- задать токен.");
            process.exit();
            continue;
        }
    }
}

if (!DONEURL || tforce) {
    if (!VK_TOKEN) {
        con("Отсутствует токен, о том, как его получить рассказано на -> github.com/cursedseal/VCoinX", true);
        return process.exit();
    }

    (async function inVKProc(token) {
        vk.token = token;
        try {
            let {
                mobile_iframe_url
            } = (await vk.api.apps.get({
                app_id: 6915965
            })).items[0];

            if (!mobile_iframe_url)
                throw ("Не удалось получить ссылку на приложение.");

            if (!USER_ID) {
                let {
                    id
                } = (await vk.api.users.get())[0];
                if (!id)
                    throw ("Не удалось получить ID пользователя.");

                USER_ID = id;
            }

            formatWSS(mobile_iframe_url);
            startBooster();

        } catch (error) {
            console.error('API Error:', error);
            process.exit();
        }
    })(VK_TOKEN);
} else {
    if (!USER_ID) {
        let GSEARCH = url.parse(DONEURL, true);
        if (!GSEARCH.query || !GSEARCH.query.vk_user_id) {
            con("При анализе ссылки не был найден vk_user_id.", true);
            return process.exit();
        }
        USER_ID = parseInt(GSEARCH.query.vk_user_id);
    }

    formatWSS(DONEURL);
    startBooster();
}


function formatWSS(LINK) {
    let GSEARCH = url.parse(LINK),
        NADDRWS = GSEARCH.protocol.replace("https:", "wss:").replace("http:", "ws:") + "//" + GSEARCH.host + "/channel/";
    URLWS = NADDRWS + (USER_ID % 8) + GSEARCH.search + "&pass=".concat(hashPassCoin(USER_ID, 0));
    flog && console.log("formatWSS: ", URLWS);
    return URLWS;
}