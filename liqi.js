// load file
const fs = require('fs');
const load_every = 10000;

var data = fs.readFileSync('corpus.txt', { encoding: 'utf8'}).trim().split("\n");
var names = fs.readFileSync('names.txt', { encoding: 'utf8'}).trim().split("\n");

function load_from_file() {
	data = fs.readFileSync('corpus.txt', { encoding: 'utf8'}).trim().split("\n");
	names = fs.readFileSync('names.txt', { encoding: 'utf8'}).trim().split("\n");
	console.log('reload file done');
	setTimeout(load_from_file, load_every);
}

setTimeout(load_from_file, load_every);

// parameters
const reply_prob = 1;
const wait_expectation = 500;
const wait_stddev = 100;

function gaussian(mean, stdev) {
	var y2;
	var use_last = false;
	return function() {
		var y1;
		if (use_last) {
			y1 = y2;
			use_last = false;
		} else {
			var x1, x2, w;
			do {
				x1 = 2.0 * Math.random() - 1.0;
				x2 = 2.0 * Math.random() - 1.0;
				w = x1 * x1 + x2 * x2;
			} while (w >= 1.0);
			w = Math.sqrt((-2.0 * Math.log(w)) / w);
			y1 = x1 * w;
			y2 = x2 * w;
			use_last = true;
		}

		var retval = mean + stdev * y1;
		if (retval > 0)
			return retval;
		return -retval;
	}
}

const liqi_distribution = function() {
	const dist = gaussian(wait_expectation, wait_stddev);
	var result = dist();
	while(result <= 100)
		result = dist();
	return result;
}

// start bot
const {
	Wechaty
} = require('wechaty');

function reply(message) {
	const contact = message.from();
	const name = contact.name();
	if (names.indexOf(name) >= 0 && Math.random() < reply_prob) {
		var selected_index = Math.round(Math.random() * (data.length - 1));
		var selected_text = data[selected_index];
		var wait_time = liqi_distribution() * selected_text.length;
		console.log(name, wait_time, selected_text);
		setTimeout(function(){ message.say(selected_text); }, wait_time);
	} else {
		console.log("recieve msg from: " + name + ", does not reply");
	}
}

Wechaty.instance()
	.on('scan', (url, code) => console.log(`Scan QR Code to login: ${code}\n${url}`))
	.on('message', reply)
	.init();
