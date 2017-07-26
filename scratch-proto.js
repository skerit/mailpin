var Blast = require('protoblast')(true);

function doSpread(code, ...params) {
	return params;
}

function doIterate(code) {
	var len = arguments.length - 1,
	    arr = new Array(len),
	    i;

	for (i = 0; i < len; i++) {
		arr[i] = arguments[i+1]
	}

	return arr;
}

console.log(doSpread('a', 'b'))

Function.benchmark(function withSpreading() {
	doSpread(200, 'a', 'b');
});

Function.benchmark(function withIterating() {
	doIterate(200, 'a', 'b');
});

return;

var buffer = Buffer.from([0,1,2,3,4,5]);

console.log(buffer.slice(3))
return

var buffer = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);

var str = "EHLO we-guess.mozilla.org\r\nQUIT\r\n";

str = `
	This is a much longer string.
	It should indicate if indexOf or a loop is faster.
	I have no idea which one will win!
	The final chars will be entered soon...
	Are you ready?
	Here we go!
	This is a much longer string.
	It should indicate if indexOf or a loop is faster.
	I have no idea which one will win!
	The final chars will be entered soon...
	Are you ready?
	Here we go!
`;

str += '\r\n';

buffer = Buffer.from(str);
console.log(buffer)

Function.benchmark(function toStringindexOf() {
	var str = buffer.toString();
	return str.indexOf('\r\n');
})

Function.benchmark(function loopBuffer() {

	var len = buffer.length,
	    i;

	for (i = 0; i < len; i++) {
		if (buffer[i] == 13 && buffer[i+1] == 10) {
			return i;
		}
	}
});

Function.benchmark(function indexOfString() {
	return buffer.indexOf('\r\n');
});

var rn = Buffer.from('\r\n');

Function.benchmark(function indexOfBuffer() {
	return buffer.indexOf(rn);
})

return;

Function.benchmark(function toString() {
	return buffer.toString();
})

Function.benchmark(function useString() {
	return String(buffer);
})

return;

var str = 'MAIL FROM ME OK';


function splitRegex() {
	return str.match(/^(\S+)\s(.*)/);
}

function indexOf() {
	var index = str.indexOf(' ');

	return [
		str.substr(0, index),
		str.substr(index+1)
	]
}

function sillySplit() {
	var arr = str.split(' ');

	return [arr[0], arr.splice(1).join(' ')];
}

function allSplit() {
	return str.split(' ');
}

function limitSplit() {

	var index = str.indexOf(' '),
	    last = 0,
	    result = [];

	do {
		result.push(str.substr(last, index-last));

		last = index + 1;
		index = str.indexOf(' ', last);
	} while (index > -1);

	result.push(str.substr(last))

	return result;

}

Function.benchmark(splitRegex);
Function.benchmark(indexOf)
Function.benchmark(sillySplit);
Function.benchmark(allSplit)
Function.benchmark(limitSplit)

Function.benchmark(function limitWithProto() {
	return str.splitLimit(' ', 1)
})


return;

function sendClever(code, data) {
	let payload;

	if (Array.isArray(data)) {
	payload = data.map((line, i, arr) => code + (i < arr.length - 1 ? '-' : ' ') + line).join('\r\n');
	} else {
	payload = [].concat(code || []).concat(data || []).join(' ');
	}

	return payload;
}

function sendNormal(code, data) {
	var payload;

	if (Array.isArray(data)) {
		let max = data.length - 1,
		    i;

		payload = '';

		for (i = 0; i <= max; i++) {
			if (i > 0) {
				payload += '\r\n';
			}

			payload += code;

			if (i < max) {
				payload += '-';
			} else {
				payload += ' ';
			}

			payload += data[i];
		}
	} else {

		if (code || code > 0) {
			payload = code + ' ';
		}

		payload += data;
	}

	return payload
}

Function.benchmark(function cleverArray() {
	sendClever(100, ['a', 'b', 'c', 'd']);
})

Function.benchmark(function normalArray() {
	sendNormal(100, ['a', 'b', 'c', 'd']);
})


Function.benchmark(function cleverString() {
	sendClever(100, 'a');
})

Function.benchmark(function normalString() {
	sendNormal(100, 'a');
})