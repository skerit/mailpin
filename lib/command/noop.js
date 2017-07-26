const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The NOOP Mailpin Command class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let NOOP = Fn.inherits('Develry.Mailpin.Command.Command', function NOOP() {});

/**
 * Incoming NOOP: Just let the other side know we're still here
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
NOOP.setMethod(function incomingAction(done) {

	// Say bye
	this.respond(250, 'OK');

	done();
});