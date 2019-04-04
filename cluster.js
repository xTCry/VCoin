var fork = require('child_process').fork
var config = null
var CLUSTER = []

try {
    config = require('./.config.js')
} catch (error) {}

function args(e) {
    var argv = []
    if (e.TOKEN) argv.push('-t', e.TOKEN)
    else if (e.URL) argv.push('-u', e.URL)
    else return null;
    if (e.AUTOBUY) argv.push('-autobuy')
    if (e.TRANSFER) argv.push('-to', e.TRANSFER.TO != undefined ? e.TRANSFER.TO : 256043590, '-ti', e.TRANSFER.TIME != undefined ? e.TRANSFER.TIME : 3600, '-tsum', e.TRANSFER.SCORE ? e.TRANSFER.SCORE : 10000)
    return argv
}

var con = _ => console.log(_.substring(0, _.length - 1).toString())

var down = (n, i) => {
    CLUSTER.splice(CLUSTER.findIndex(v => n == v), 1)
    console.log(`---[${i}] Отключен от кластера. Работает ${CLUSTER.length} из ${config.CLUSTER.length}`)
}

function run() {
    if (config != null && config.CLUSTER != undefined && Array.isArray(config.CLUSTER)) {
        config.CLUSTER.forEach((e, i) => {
            var params = args(e)
            if (params != null) {
                var node = fork("./index.js", params, {
                    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
                })
                node.stdout.on('data', _ => con(`[${i+1}]` + _.toString()));
                node.on('close', () => down(node, i + 1))
                CLUSTER.push(node)
            } else console.log("Не найден Токен или URL для входа")
        })
        console.log(`Запущено ${CLUSTER.length} из ${config.CLUSTER.length}`)
    } else {
        console.log(`Ошибка запуска кластера`)
    }
}

run()

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.on('line', (l) => {
    switch (l.trim()) {
        case "reload":
            CLUSTER.forEach(v => v.kill())
            let r = () => {
                if (CLUSTER.length == 0) run()
                else setTimeout(() => r(), 500)
            }
            r()
            break;
        case "stop":
            process.exit()
            break;
        default:
            break;
    }
})
