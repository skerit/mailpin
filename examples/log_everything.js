var Mailpin = require('../index'),
    libpath = require('path'),
    fs      = require('fs');

let server = new Mailpin.Server.Server();
let port = 25;
let i;

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
	    date,
	    name,
	    file;

	date = new Date();
	datestr = __Protoblast.Bound.Date.format(date, 'Y-m-d_H_i_s_u');
	name = datestr + '-' + connection.id;

	filepath = libpath.resolve(__dirname, 'output', name);
	file = fs.createWriteStream(filepath);

	// Write the date to the file
	file.write(__Protoblast.Bound.Date.format(date, 'Y-m-d H:i:s') + '\n\n');

	// Get incoming commands
	connection.on('command', function onCommand(command) {
		// Write the incoming command
		file.write('\n« ' + command.name + ' ' + (command.data || '') + '\n');

		// Listen for data streams
		command.on('data_stream', function onStream(stream) {
			file.write('\n');
			stream.on('data', function onData(chunk) {
				file.write(chunk);
			});

			stream.on('end', function onEnd() {
				file.write('\n');
			});
		});
	});

	// Get our response
	connection.on('response', function onResponse(response) {
		file.write('» ' + response + '\n');
	});

	connection.on('closed', function onClose() {
		var text;

		text  = '\n===============================';
		text += '\nProcessing took ' + (Date.now() - date) + ' ms';
		text += '\n===============================';
		file.write(text);
		file.close();
	});
});