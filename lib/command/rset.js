const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The Mailpin RSET Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let RSET = Fn.inherits('Develry.Mailpin.Command.Command', function RSET() {});

/**
 * Reset the session
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
RSET.setMethod(function incomingAction(done) {

	this.session.reset();
	this.respond(250, 'Flushed');

	done();
});
