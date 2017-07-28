const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The Mailpin VRFY Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let VRFY = Fn.inherits('Develry.Mailpin.Command.Command', function VRFY() {});

/**
 * This implementation is practically disabled by default (for spam reasons)
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
VRFY.setMethod(function incomingAction(done) {

	this.respond(252, '2.1.5 Send some mail, I\'ll do my best');

	done();
});
