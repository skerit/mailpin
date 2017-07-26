const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The Mailpin MAIL Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let MAIL = Fn.inherits('Develry.Mailpin.Command.Command', function MAIL() {});

/**
 * Incoming MAIL FROM?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
MAIL.setMethod(function incomingAction(done) {

	let parsed = this.connection.parseAddressCommand('from', this.data);

	// Store the from address
	this.from = parsed;

	// Recipients will go here
	this.to = [];

	if (!parsed) {
		// Although sender address can be empty, parsing should not fail
		this.respond(501, 'Error: Bad sender address syntax');
	} else if (this.session.mail) {
		// There already is an open mail command
		this.respond(503, 'Error: nested MAIL command');
	} else if (!this.server.allowsSize(parsed.args.SIZE)) {
		this.respond(552, 'Error: message exceeds fixed maximum message size ' + this.server.options.max_size);
	} else {
		return this.checkAllow(done);
	}

	done();
});

/**
 * Do an allowance check (needs to be overridden)
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
MAIL.setMethod(function checkAllow(done) {
	this.allow(done);
});

/**
 * Respond with an allowed code
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
MAIL.setMethod(function allow(done) {

	// Store this mail in the session
	this.connection.setActiveMail(this);

	// Respond with the OK command
	this.respond(250, '2.1.0 OK');

	done();
});

/**
 * Add To
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   parsed
 */
MAIL.setMethod(function addTo(parsed) {

	var entry,
	    i;

	parsed.lower_address = parsed.address.toLowerCase();

	for (i = 0; i < this.to.length; i++) {
		entry = this.to[i];

		// Don't add the same recipient twice
		if (entry.lower_address == parsed.lower_address) {
			return;
		}
	}

	this.to.push(parsed);
});