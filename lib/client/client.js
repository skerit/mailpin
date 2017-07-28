const Blast   = __Protoblast;
const net     = require('net');
const tls     = require('tls');
const os      = require('os');
const Fn      = Blast.Bound.Function;
const Mailpin = Fn.getNamespace('Develry.Mailpin');

/**
 * The Mailpin Client class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let Client = Fn.inherits('Informer', 'Develry.Mailpin.Client', function Client(options) {

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
