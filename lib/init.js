var libpath = require('path'),
    fs = require('fs'),
    old_blast,
    files,
    i;

// Store old protoblast version
if (typeof __Protoblast != 'undefined') {
	old_blast = __Protoblast;
}

global.__Protoblast = require('protoblast')(false);

// Require protoblast (without native mods) if it isn't loaded yet

// Get the Mailpin namespace
const Mailpin = __Protoblast.Bound.Function.getNamespace('Develry.Mailpin');

// Require the main files
require('./server/server');
require('./server/session');
require('./server/connection');
require('./common/smtp_stream');
require('./command/command');

files = fs.readdirSync(libpath.resolve(__dirname, 'command'));

for (i = 0; i < files.length; i++) {
	file = files[i];

	// Skip the basic command.js, that has already loaded
	if (file == 'command.js') {
		continue;
	}

	// Require the file
	require(libpath.resolve(__dirname, 'command', file));
}

// If there was another protoblast version, restore it
if (old_blast) {
	global.__Protoblast = old_blast;
}

module.exports = Mailpin;