const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;
const dns     = require('dns');
const net     = require('net');
const Mailpin = Fn.getNamespace('Develry.Mailpin');
const SOCKET_TIMEOUT = 1000 * 30;

/**
 * The Mailpin Server class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let Connection = Fn.inherits('Informer', 'Develry.Mailpin.Server', function Connection(server, socket) {

	// Random session ID
	this.id = Blast.Classes.Crypto.uid();

	// Store the parent server instance
	this.server = server;

	// Store the actual socket
	this.socket = socket;

	// Store remote address for later usage
	this.remote_address = (socket.remoteAddress || '').replace(/^::ffff:/, '');
	this.remote_port = Number(socket.remotePort) || 0;

	// @TODO: Normalize IPv6 addresses
	if (this.remote_address && net.isIPv6(this.remote_address)) {
		console.log('-- IPV6 DETECTED --');
	}

	// Amount of messages that have been processed
	this.transactions = 0;

	// Create a smtp stream parser
	this.smtp_stream = new Mailpin.Common.SmtpStream();

	// The opening command sent to us
	this.opening_cmd = null;

	// Unauthenticated command counter
	this.unauthenticated_commands = 0;

	// Unrecognized command error
	this.unrecognized_commands = 0;

	// Hostname identifier
	this.hostname_identifier = null;

	// Data passed from XCLIENT command
	this.x_client = new Map();

	// Date passes from XFORWARD command
	this.x_forward = new Map();

	// Session data
	this.session = new Mailpin.Server.Session(this);
});

/**
 * Current transmission type
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setProperty(function transmission_type() {

	var type;

	if (this.server.options.lmtp) {
		type = 'LMTP';
	} else {
		type = 'SMTP';
	}

	if (this.opening_cmd === 'EHLO') {
		type = 'E' + type;
	}

	if (this.secure) {
		type += 'S';
	}

	if (this.session.user) {
		type += 'A';
	}

	return type;
});

/**
 * Is the connection ready?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setProperty(function ready() {
	return this.hasBeenSeen('ready');
});

/**
 * Initialize the connection
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function init() {

	var that = this;

	if (this.server.is_busy) {
		return this.send(421, this.name + ' Server is too busy, try again later');
	}

	// Listen to the close event
	this.socket.on('close', function onClose() {
		that.onClose();
	});

	// Listen to the error event
	this.socket.on('error', function onError(err) {
		that.onError(err);
	});

	// Set the timeout
	this.socket.setTimeout(this.server.options.socket_timeout || SOCKET_TIMEOUT, function onTimeout() {
		that.onTimeout();
	});

	// Pipe the socket into the SMTP Stream parser
	this.socket.pipe(this.smtp_stream);

	// Listen to commands from the SMTP Stream
	this.smtp_stream.on('data', function onData(data) {
		that.processSmtpPayload(data);
	});

	// Detect "early talker" spammers by inserting a small delay
	setTimeout(function waited() {
		// @TODO: optionally skip reverse resolution
		dns.reverse(that.remote_address.toString(), resolvedHostname);
	}, 100);

	// Got the resolved hostnames
	function resolvedHostname(err, hostnames) {

		if (that.closed || that.closing) {
			return;
		}

		// Store the client hostname
		that.client_hostname = hostnames && hostnames.shift() || '[' + that.remote_address + ']';

		// Reset the session
		that.session.reset();

		// Indicate we're ready
		that.markAsReady();

		that.send(220, that.server.name + ' ' + (that.server.options.lmtp ? 'LMTP' : 'ESMTP') + (that.server.options.banner ? ' ' + that.server.options.banner : ''));
	}
});

/**
 * Set the active mail
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function setActiveMail(mail) {
	this.session.mail = mail;
});

/**
 * Mark connection as ready
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function markAsReady() {
	// Emit the ready event
	this.emit('ready');
});

/**
 * Handle socket closing
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function onClose() {

	if (this.smtp_stream) {
		this.smtp_stream.closed = true;
		this.socket.unpipe(this.smtp_stream);
		this.smtp_stream = null;
	}

	this.server.connections.delete(this);

	if (this.closed) {
		return;
	}

	this.closing = true;
	this.closed = true;

	// @TODO: server onclose?

});

/**
 * Handle socket errors
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function onError(err) {
	if ((err.code === 'ECONNRESET' || err.code === 'EPIPE') &&
		(!this.session.envelope || !this.session.envelope.mail_from)) {
		// We got a connection error outside transaction. In most cases it means dirty
		// connection ending by the other party, so we can just ignore it
		this.close(); // mark connection as 'closing'
		return;
	}

	this.emit('error', err);
});

/**
 * Handle socket timeouts
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function onTimeout() {
	this.send(421, 'Timeout - closing connection');
});

/**
 * Receiving SMTP commands
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function processSmtpPayload(data) {

	if (this.active_incoming) {
		this.active_incoming.emit('new_data', data);
		return this.active_incoming.addData(data);
	}

	// Get the command
	let command = Mailpin.Command.Command.fromBuffer(data);

	if (!command) {
		return this.emit('error', new Error('No command was created'), data);
	}

	// Emit the command
	this.emit('command', command);

	// Process as an incomming command
	command.processIncomingConnection(this);
});

/**
 * Send data to the socket
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function send(code, ...data) {

	var payload;

	data = Blast.Bound.Array.flatten(data);

	// Normalize the payload
	if (data.length > 1) {
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
			payload = code + ' ' + data[0];
		} else {
			payload = data[0];
		}
	}

	if (this.socket && this.socket.writable) {
		this.emit('response', payload, code);
		this.socket.write(payload);
		this.socket.write('\r\n');
	}

	if (code === 421) {
		this.close();
	}
});

/**
 * Close the socket
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function close() {

	if (!this.socket.destroyed && this.socket.writable) {
		this.socket.end();
	}

	// Remove from the connections set
	this.server.connections.delete(this);

	// Indicate this connection has closed
	this.closed = true;

	// Emit the closed event
	this.emit('closed');
});

/**
 * Receiving MAIL commands, like:
 * MAIL FROM:<jelle@develry.be>
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function handleMAIL(data, callback) {

	let parsed = this.parseAddressCommand('from', data);

	// sender address can be empty, so we only check if parsing failed or not
	if (!parsed) {
		this.send(501, 'Error: Bad sender address syntax');
		return callback();
	}

	//https://github.com/nodemailer/smtp-server/blob/master/lib/smtp-connection.js

	console.log('Parsed:', parsed)

	this.send(250, '2.1.0 OK');
});

/**
 * Receiving RCPT commands
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function handleRCPT(data, callback) {
	this.send(250, 'OK');
});

/**
 * Receiving DATA commands
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function handleDATA(data, callback) {

	// Enable DATA mode
	this.smtp_stream.data_mode = true;

	console.log('??' + data);
	this.send(354, 'End data with <CR><LF>.YOMAMA<CR><LF>');
});

/**
 * Receiving QUIT commands
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Connection.setMethod(function handleQUIT(data, callback) {
	this.send(221, 'Bye');
	this.close();
});

/**
 * Parses commands like MAIL FROM and RCPT TO. Returns an object with the address and optional arguments.
 *
 * @author   Andris Reinman
 * @author   Jelle De Loecker   <jelle@develry.be>
 *
 * @param    {String}         name     Address type, eg 'mail from' or 'rcpt to'
 * @param    {String}         command  Data payload to parse
 * @returns  {Object|Boolean}          Parsed address in the form of {address:, args: {}} or false if parsing failed
 */
Connection.setMethod(function parseAddressCommand(name, command) {

	command = (command || '').toString();
	name = (name || '').toString().trim().toUpperCase();

	let parts = command.split(':');
	command = parts.shift().trim().toUpperCase();
	parts = parts.join(':').trim().split(/\s+/);

	let address = parts.shift();
	let args = false;
	let invalid = false;

	if (name !== command) {
		return false;
	}

	if (!/^<[^<>]*>$/.test(address)) {
		invalid = true;
	} else {
		address = address.substr(1, address.length - 2);
	}

	parts.forEach(part => {
		part = part.split('=');
		let key = part.shift().toUpperCase();
		let value = part.join('=') || true;

		if (typeof value === 'string') {
			// decode 'xtext'
			value = value.replace(/\+([0-9A-F]{2})/g, (match, hex) => unescape('%' + hex));
		}

		if (!args) {
			args = {};
		}

		args[key] = value;
	});

	if (address) {
		// enforce unycode
		address = address.split('@');
		if (address.length !== 2 || !address[0] || !address[1]) { // really bad e-mail address validation. was not able to use joi because of the missing unicode support
			invalid = true;
		} else {
			address = [address[0] || '', '@', address[1] || ''].join('');
		}
	}

	return invalid ? false : {
		address,
		args
	};
});