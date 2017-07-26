const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The Mailpin QUIT Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let QUIT = Fn.inherits('Develry.Mailpin.Command.Command', function QUIT() {});

/**
 * Incoming QUIT: Say bye and dlose the connection
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
QUIT.setMethod(function incomingAction(done) {

	// Say bye
	this.respond(221, 'Bye');

	// Close the connection
	this.connection.close();

	done();
});