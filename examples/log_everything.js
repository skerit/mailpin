var Mailpin = require('../index'),
    libpath = require('path'),
    fs      = require('fs');

let server = new Mailpin.Server.Server();
let port = 25;
let i;

process.on('uncaughtException', function(error) {

	var filepath,
	    datestr,
	    date,
	    name,
	    file;

	date = new Date();
	datestr = __Protoblast.Bound.Date.format(date, 'Y-m-d_H_i_s_u');
	name = 'ERROR_' + datestr;

	filepath = libpath.resolve(__dirname, 'output', name);
	file = fs.createWriteStream(filepath);

	file.write('DATE: ' + __Protoblast.Bound.Date.format(date, 'Y-m-d H:i:s') + '\n');
	file.write('\n');

	file.write('' + error);
	file.write('\n\n');
	file.write('STACK:\n');
	file.write(''+error.stack, function done() {
		file.close();
	});
});

for (i = 1; i < process.argv.length; i++) {
	if (process.argv[i].indexOf('--port=') === 0) {
		port = parseInt(__Protoblast.Bound.String.after(process.argv[i], '--port='));
	}
}

console.log('Creating logging server on port', port);

// Start listening on the required port
server.listen(port);

// Get notified of new connections
server.on('connection', function gotConnection(connection) {

	var filepath,
	    datestr,
	    data = [],
	    date,
	    name,
	    file;

	date = new Date();
	datestr = __Protoblast.Bound.Date.format(date, 'Y-m-d_H_i_s_u');
	name = datestr + '-' + connection.id;

	filepath = libpath.resolve(__dirname, 'output', name);
	file = fs.createWriteStream(filepath);

	data.push({
		date : date,
		from : connection.remote_address,
		port : connection.remote_port,
		logv : 1.5
	});

	connection.on('error', function onError(err, edata) {
		data.push({
			time    : Date.now(),
			error   : err,
			data    : ''+edata
		});
	});

	// Get incoming commands
	connection.on('command', function onCommand(command) {

		data.push({
			time    : Date.now(),
			command : command.name,
			args    : command.data
		});

		command.on('new_data', function onNewData(new_data) {
			data.push({
				time     : Date.now(),
				for      : command.name,
				new_data : ''+new_data
			});
		});

		// Listen for data streams
		command.on('data_stream', function onStream(stream) {

			var data_stream = {
				time   : Date.now(),
				stream : true,
				end    : null,
				body   : ''
			};

			data.push(data_stream);

			stream.on('data', function onData(chunk) {
				data_stream.body += chunk;
			});

			stream.on('finish', function onEnd() {
				data_stream.end = Date.now();
				data_stream.duration = data_stream.end - data_stream.time;
			});

			stream.on('end', function onEnd() {
				data_stream.end = Date.now();
				data_stream.duration = data_stream.end - data_stream.time;
			});
		});
	});

	// Get our response
	connection.on('response', function onResponse(response, code) {
		data.push({
			time        : Date.now(),
			response    : ''+response,
			code        : code
		});
	});

	connection.on('closed', function onClose() {
		var text;

		data.push({
			end      : Date.now(),
			duration : Date.now() - date
		});

		text = __Protoblast.Bound.JSON.dry(data, null, '\t');

		file.write(text, function done() {
			file.close();
		});
	});
});
