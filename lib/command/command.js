const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;
const Mailpin = Fn.getNamespace('Develry.Mailpin');

/**
 * The Base Mailpin Command class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Develry.Mailpin.Server.Connection}   connection
 */
let Command = Fn.inherits('Informer', 'Develry.Mailpin.Command', function Command() {});

/**
 * Constitutor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Command.constitute(function initializeClass() {

	if (this.name == 'Command') {
		return;
	}

	this.setProperty('name', this.name);
});

/**
 * Create command from incoming buffer
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Buffer}     chunk
 * @param    {Connection} connection
 *
 * @return   {Command}
 */
Command.setStatic(function fromBuffer(chunk, connection) {

	var command,
	    params,
	    name;

	chunk = chunk.toString();

	// Split at the first space (so give 2 array items)
	params = Blast.Bound.String.splitOnce(chunk, ' ');

	// Get the command
	name = params.shift();

	if (name === '') {
		name = params.shift();
	}

	// Uppercase the command name
	name = name.toUpperCase();

	// The rest is data
	data = params[0];

	// Get the command class
	if (Mailpin.Command[name]) {
		command = Mailpin.Command[name].create(data);
	} else {
		command = Command.create(data);

		// Set the command name (because base command class has none set)
		command.name = name;
	}

	return command;
}, false);

/**
 * Create instance of current command with specified data
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}     data
 *
 * @return   {Command}
 */
Command.setStatic(function create(data) {

	var result = new this();

	result.data = data;

	return result;
});

/**
 * Server getter
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Command.setProperty(function server() {
	return this.connection.server;
});

/**
 * Session getter
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Command.setProperty(function session() {
	return this.connection.session;
});

/**
 * Process as incoming command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Command.setMethod(function processIncomingConnection(connection, callback) {

	var that = this;

	// Store the connection
	this.connection = connection;

	// Mark as incoming
	this.incoming = true;

	// Set as active command
	connection.active_incoming = this;

	// Make sure we have a callback
	if (typeof callback != 'function') {
		callback = Fn.thrower;
	}

	// Make sure the server supports this command
	if (!this.connection.server.supports(this.name)) {
		this.unsupportedAction(isDone);
	} else {
		this.incomingAction(isDone);
	}

	// Done handler
	function isDone(err) {
		connection.active_incoming = null;

		// This callback is sometimes stored as a property,
		// make sure it is removed just in case
		if (that.done_callback) {
			that.done_callback = null;
		}

		callback(err);
	}
});

/**
 * Respond to an incoming command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}        code
 * @param    {String|Array}  data
 */
Command.setMethod(function respond(code, ...data) {
	this.response_code = code;
	this.send(code, data);
});

/**
 * Send to the other side
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}        code
 * @param    {String|Array}  data
 */
Command.setMethod(function send(code, ...data) {
	this.connection.send(code, data);
});

/**
 * Do the incoming action
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Command.setMethod(function incomingAction(callback) {
	this.errorAction('undefined', callback);
});

/**
 * Do the outgoing action
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Command.setMethod(function outgoingAction(callback) {
	this.errorAction('undefined', callback);
});

/**
 * Do the incoming action
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
Command.setMethod(function unsupportedAction(callback) {
	this.errorAction('unsupported', callback);
});

/**
 * Respond with error
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}     type
 * @param    {Function}   callback
 */
Command.setMethod(function errorAction(type, callback) {

	var that = this,
	    err;

	// First of all: tell the other side this command is not recognized
	this.send(500, 'Error: command not recognized');

	// Set the error type
	this.error_type = type;
	this.error_code = 500;

	callback();

	return;

	if (this.incoming) {
		err = 'Incoming ';
	} else {
		err = 'Outgoing ';
	}

	err += 'action is ' + type + ' for command ' + this.name;

	Blast.setImmediate(function callbackWithError() {
		callback(new Error(err));
	});
});