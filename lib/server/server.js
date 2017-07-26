const Blast   = __Protoblast;
const net     = require('net');
const tls     = require('tls');
const os      = require('os');
const Fn      = Blast.Bound.Function;
const Mailpin = Fn.getNamespace('Develry.Mailpin');

/**
 * The Mailpin Server class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let Server = Fn.inherits('Informer', 'Develry.Mailpin.Server', function Server(options) {

	var that = this,
	    net_options,
	    protocol;

	options = options || {};
	net_options = options.server || {};

	// Store the options
	this.options = options;

	// All open connections
	this.connections = new Set();

	// The name of this server
	this.name = options.name || os.hostname();

	// Max number of clients
	this.max_clients = options.max_clients || null;

	if (options.secure) {
		protocol = tls;
	} else {
		protocol = net;
	}

	// Create the server
	this.server = protocol.createServer(net_options, function onConnection(socket) {
		that.connect(socket);
	});
});

/**
 * Is the server too busy?
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @property {Boolean}
 */
Server.setProperty(function is_busy() {

	if (this.max_clients == null) {
		return false;
	}

	if (this.connections.size > this.max_clients) {
		return true;
	}

	return false;
});

/**
 * Handle incoming connection
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Server.setMethod(function connect(socket) {

	// Create a new Mailpin Connection instance
	var connection = new Mailpin.Server.Connection(this, socket);

	// Add this to the open connections list
	this.connections.add(connection);

	// Initialize the connection
	connection.init();
});

/**
 * Listen on the wanted port
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Server.setMethod(function listen(...args) {
	this.server.listen(...args);
});

/**
 * Get all the supported features
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {Array}
 */
Server.setMethod(function getFeatures() {

	let arr = [
		'PIPELINING'
	];

	return arr;
});

/**
 * See if this size of email is allowed
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   size
 *
 * @return   {Boolean}
 */
Server.setMethod(function allowsSize(size) {

	if (!size) {
		return true;
	}

	if (this.options.hide_size) {
		return true;
	}

	if (this.options.max_size && size > this.options.max_size) {
		return false;
	}

	return true;
});

/**
 * See if a command is available
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   command
 *
 * @return   {Boolean}
 */
Server.setMethod(function supports(command) {

	command = command.toUpperCase();

	// If it is explicitly disabled, return false
	if (this.disabled_commands && this.disabled_commands.includes(command)) {
		return false;
	}

	console.log('Looking for', command, 'in', Mailpin.Command)

	// Return true if the command class exists
	if (Mailpin.Command[command]) {
		return true;
	}

	// Return false by default
	return false;
});

module.exports = Mailpin;