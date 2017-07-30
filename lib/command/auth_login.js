const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The Mailpin AUTH LOGIN Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let LOGIN = Fn.inherits('Develry.Mailpin.Command.AUTH', function AUTHLogin() {});

/**
 * Incoming PLAIN
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
LOGIN.setMethod(function incomingAction(done) {

	// Keep done for later
	this.done_callback = done;

	// Send "Username" prompt
	this.respond(334, 'VXNlcm5hbWU6');
	this.login_state = 1;
});

/**
 * Received base64?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
LOGIN.setMethod(function addData(data) {

	switch (this.login_state) {

		case 1:
			let user = Buffer.from(data, 'base64').toString('binary');
			this.username = user;
			this.respond(334, 'UGFzc3dvcmQ6');
			this.login_state = 2;
			break;

		case 2:
			let password = Buffer.from(data, 'base64').toString('binary');
			return this.deny();
			this.verifyCredentials(this.username, password);
			this.login_state = null;
			break;

		default:
			return;
	}
});