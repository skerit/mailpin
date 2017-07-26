const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;
const Mailpin = Fn.getNamespace('Develry.Mailpin');

/**
 * The EHLO Mailpin Command class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Develry.Mailpin.Server.Connection}   connection
 */
let EHLO = Fn.inherits('Develry.Mailpin.Command.Command', function EHLO() {});

/**
 * Incoming EHLO: Let the client know our featureset
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
EHLO.setMethod(function incomingAction(done) {

	// Set as the opening command
	this.connection.opening_command = this;

	// Send the features
	this.respond(250, 'Nice to meet you', this.server.getFeatures());

	done();
});