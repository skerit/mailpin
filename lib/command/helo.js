const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The HELO Mailpin Command class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Develry.Mailpin.Server.Connection}   connection
 */
let HELO = Fn.inherits('Develry.Mailpin.Command.Command', function HELO() {});

/**
 * Incoming HELO: just say hi
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
HELO.setMethod(function incomingAction(done) {

	var hostname;

	// Set as the opening command
	this.connection.opening_command = this;

	// Get the hostname
	if (this.data) {
		this.data = this.data.trim().split(/\s+/)[0];
	}

	if (this.data) {
		hostname = this.data;
	} else {
		this.respond(501, 'Error: Syntax: HELO hostname');
		return done();
	}

	this.connection.hostname_identifier = hostname;


	// Send the features
	this.respond(250, 'Nice to meet you, ' + hostname);

	done();
});