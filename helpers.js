const fs = require('fs'),
  colors = require('colors/safe'),
  ReadLine = require('readline')

const pJson = require('./package.json')

// TODO: Переписать данный файл, например в части работы с async функциями (existsAsync, writeFileAsync, ...)

let offColors = false

let rl = ReadLine.createInterface(process.stdin, process.stdout)
rl.setPrompt('VCoinX > ')
rl.prompt()
rl.isQst = false
rl.questionAsync = (question) => {
  return new Promise((resolve) => {
    rl.isQst = true
    rl.question(question, _ => {
      rl.isQst = false
      resolve(_)
    })
  })
}

function formatScore (e) {
  return (arguments.length > 1 && void 0 !== arguments[1] && arguments[1])
    ? (function (e, t, n, a) {
      var r, o, c, s, i

      r = parseInt(e = (+e || 0).toFixed(t), 10) + '';
      (o = r.length) > 3 ? o %= 3 : o = 0

      i = o ? (r.substr(0, o) + a) : ''
      c = r.substr(o).replace(/(\d{3})(?=\d)/g, '$1' + a)
      s = t ? n + Math.abs(e - r).toFixed(t).replace(/-/, 0).slice(2) : ''

      return i + c + s
    }(e / 1e3, 3, ',', ' '))
    : (e / 1e3).toFixed(3).toString().replace('.', ',')
}

colors.setTheme({
  dateBG: 'white',
  dataC: 'yellow',
  warnBG: 'bgBlack',
  warn: 'yellow',
  errorBG: 'bgBlack',
  error: 'red',
})

function con (message, color, colorBG) {
  if (message === undefined) return console.log('\n')
  let temp = (!offColors ? colors.dateBG('[' + dateF() + ']') : dateF()) + ': ' + ccon(message, color, colorBG, 1)
  console.log(temp)
}

function ccon (message, color, colorBG, ret) {
  let temp = ''
  if (message === undefined) {
    console.log('\n')
    return
  }
  if (color === true) {
    color = 'white'
    colorBG = 'Red'
    temp = !offColors ? colors.yellow.bgRed('[ОШИБКА]: ') : '[ОШИБКА]: '
  }
  colorBG = 'bg' + ((typeof colorBG === 'string') ? colorBG : 'Black')
  color = (typeof color === 'string') ? color : 'green'
  temp += !offColors ? colors[colorBG](colors[color](message)) : message
  !ret && console.log(temp)
  return temp
}

function setColorsM (e) {
  offColors = !!e
}

function dateF (date) {
  if (!isNaN(date) && date < 9900000000) date *= 1000
  date = date !== undefined ? new Date(date) : new Date()

  var dYear = date.getFullYear(),
    dMonth = (date.getMonth() + 1).toString().padStart(2, 0),
    dDay = date.getDate().toString().padStart(2, 0),
    dHour = date.getHours().toString().padStart(2, 0),
    dMinutes = date.getMinutes().toString().padStart(2, 0),
    dSeconds = date.getSeconds().toString().padStart(2, 0),
    date_format = dDay + '.' + dMonth + '.' + dYear + ' ' + dHour + ':' + dMinutes + ':' + dSeconds

  return date_format
}

function rand (min, max) {
  if (max === undefined) max = min
  min = 0
  return Math.floor(min + Math.random() * (max + 1 - min))
}

let cFile = './main.log'
async function infLog (data) {
  data = '\n[' + dateF() + '] \t' + data

  let exists = await existsAsync(cFile)
  if (!exists) {
    let errWrite = await writeFileAsync(cFile, 'Log.' + data)
    if (errWrite) throw errWrite
  }
  else await appendFileAsync(cFile, data)
}

function existsFile (f) {
  return fs.existsSync(f)
}

function existsAsync (path) {
  return new Promise(resolve => fs.existsSync(path, exists => resolve(exists)))
}

function writeFileAsync (path, data) {
  return new Promise(resolve => fs.writeFile(path, data, err => resolve(err)))
}

function appendFileAsync (path, data) {
  return new Promise(resolve => fs.appendFile(path, data, err => resolve(err)))
}

function getVersion () {
  return pJson.version
}

function setTerminalTitle (title) {
  process.stdout.write(
    String.fromCharCode(27) + ']0;' + title + String.fromCharCode(7)
  )
}

function beep () {
  process.stdout.write('\x07')
}

function removeLetters (e) {
  return parseInt(e.replace(/\D+/g, ''))
}

function mathPrice (price, count) {
  return count <= 1 ? price : Math.ceil(1.3 * mathPrice(price, count - 1))
}

module.exports = {
  rl,
  con,
  ccon,
  setColorsM,
  offColors,
  formatScore,
  existsFile,
  existsAsync,
  writeFileAsync,
  appendFileAsync,
  getVersion,
  setTerminalTitle,
  infLog,
  rand,
  beep,
  mathPrice,
}
