const colors = require('colors/safe');

// ******************

function formateSCORE(e) {
	return (arguments.length > 1 && void 0 !== arguments[1] && arguments[1])?
	function(e, t, n, a) {
		var r, o, c, s, i;
		
		r = parseInt(e = (+e || 0).toFixed(t), 10) + "";
		(o = r.length) > 3 ? o %= 3 : o = 0;
		
		i = o? (r.substr(0, o) + a): "";
		c = r.substr(o).replace(/(\d{3})(?=\d)/g, "$1" + a);
		s = t? n + Math.abs(e - r).toFixed(t).replace(/-/, 0).slice(2): "";

		return i + c + s;
	}(e / 1e3, 3, ",", " "):
	(e / 1e3).toFixed(3).toString().replace(".", ",")
}
// ******************

colors.setTheme({
	dateBG: 'bgMagenta',
	dataC: 'yellow',
	warnBG: 'bgBlack',
	warn: 'yellow',
	errorBG: 'bgBlack',
	error: 'red'
});
function con(message, color, colorBG) {
	if(message === undefined) {
		console.log("\n")
		return;
	}

	if(color === true) {
		color = "red";
		colorBG = "Blue";
	}

	colorBG = "bg"+ ((typeof colorBG == "string")?colorBG:"Black");
	color = (typeof color == "string")?color:"green";

	console.log(colors.dateBG( '[' +dateF()+ ']' )+": "+ colors[colorBG](colors[color](message)) );
}
function dateF(date) {
	if(!isNaN(date) && date < 9900000000)
		date *= 1000; // UNIXto
	date = date!==undefined ? new Date(date) : new Date();
	
	var dYear = date.getFullYear()
		, dMonthF = (date.getMonth()+1)
		, dMonth = dMonthF > 9 ? dMonthF : "0"+dMonthF
		, dDay = date.getDate() > 9 ? date.getDate() : "0"+date.getDate()
		, dHour = date.getHours() > 9 ? date.getHours() : "0"+date.getHours()
		, dMinutes = date.getMinutes() > 9 ? date.getMinutes() : "0"+date.getMinutes()
		, dSeconds = date.getSeconds() > 9 ? date.getSeconds() : "0"+date.getSeconds()
		, date_format = dDay +'.' +dMonth +'.' +dYear +' '+ dHour + ':' + dMinutes + ':' + dSeconds;
	
	return date_format;
}



function hashPassCoin(e, t) {
	return (e % 2 === 0)?
			(e + t - 15):
			(e + t - 109);
}


module.exports = {
	con,
	formateSCORE,
	hashPassCoin,
}

