const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;

/**
 * The Mailpin DATA Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let DATA = Fn.inherits('Develry.Mailpin.Command.Command', function DATA() {});

/**
 * Incoming DATA
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
DATA.setMethod(function incomingAction(done) {

	if (!this.session.mail) {
		this.send(503, 'Error: need MAIL command');
	} else if (!this.session.mail.to.length) {
		this.send(503, 'Error: need RCPT command');
	} else {
		let that = this;

		// Set the stream into data mode
		this.data_stream = this.connection.smtp_stream.startDataMode(this.server.options.max_size);

		// Listen for the end
		this.data_stream.on('finish', function onEnd() {
			console.log('--data stream ended--');

			//that.send(250, typeof message === 'string' ? message : 'OK: message queued');

			done();
		});

		// Allow the stream
		this.send(354, 'End data with <CR><LF>.<CR><LF>');

		// Don't call done yet, we need the rest!
		this.done_callback = done;

		return;
	}

	done();
});