const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The Mailpin HELP Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let HELP = Fn.inherits('Develry.Mailpin.Command.Command', function HELP() {});

/**
 * Reset the session
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
HELP.setMethod(function incomingAction(done) {

	this.respond(214, 'See https://tools.ietf.org/html/rfc5321 for details');

	done();
});
