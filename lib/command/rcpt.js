const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The Mailpin RCPT Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let RCPT = Fn.inherits('Develry.Mailpin.Command.Command', function RCPT() {});

/**
 * Get the active mail
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
RCPT.setProperty(function mail() {
	return this.session.mail;
});

/**
 * Incoming MAIL FROM?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
RCPT.setMethod(function incomingAction(done) {

	let parsed = this.connection.parseAddressCommand('to', this.data);
	this.to = parsed;

	if (!parsed || !parsed.address) {
		this.respond(501, 'Error: Bad recipient address syntax');
	} else if (!this.mail) {
		// There already is an open mail command
		this.respond(503, 'Error: need MAIL command');
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
RCPT.setMethod(function checkAllow(done) {
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
RCPT.setMethod(function allow(done) {

	this.mail.addTo(this.to);

	// Respond with the OK command
	this.respond(250, 'Accepted');

	done();
});