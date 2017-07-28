const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The Mailpin AUTH PLAIN Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let PLAIN = Fn.inherits('Develry.Mailpin.Command.AUTH', function AUTHPlain() {});

/**
 * Incoming PLAIN
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
PLAIN.setMethod(function incomingAction(done) {

	// Keep done for later
	this.done_callback = done;

	if (!this.data) {

		// We didn't get the BASE64 string yet,
		// let the client know it can send it
		this.respond(334);
	} else {
		this.handleBase64(this.data);
	}
});

/**
 * Received base64?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
PLAIN.setMethod(function addData(data) {
	this.handleBase64(data);
});

/**
 * Handle base64
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
PLAIN.setMethod(function handleBase64(data) {

	var text;

	try {
		text = Buffer.from(data, 'base64').toString('binary');
	} catch (err) {
		return this.deny();
	}

	let pieces = text.split(String.fromCharCode(0));
	let user = pieces[1];
	let password = pieces[2];

	this.verifyCredentials(user, password);
});