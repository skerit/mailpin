const Blast       = __Protoblast;
const stream      = require('stream');
const Transform   = stream.Transform;
const PassThrough = stream.PassThrough;
const Fn          = Blast.Bound.Function;
const crlf        = Buffer.from('\r\n');
const enddata     = Buffer.from('\r\n.\r\n');
const escapedot   = Buffer.from([0x0A, 0x2E, 0x2E]);

/**
 * The Mailpin Server class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let Stream = Fn.inherits(Transform, 'Develry.Mailpin.Common', function SmtpStream() {

	// The previous buffer chunk
	this.prevbuf = null;

	// Buffer data that should wait for next push
	this.waitbuf = null;

	// Data mode?
	this.data_mode = false;

	// Call parent constructor
	Transform.call(this, {objectMode: true});
});

/**
 * Start the data mode
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number}   max_size
 *
 * @return   {Stream}
 */
Stream.setMethod(function startDataMode(max_bytes) {

	// Indicate data mode is activated
	this.data_mode = true;

	// Get the max size of the data
	this.max_bytes = max_bytes && Number(max_bytes) || Infinity;

	// Size counter goes here
	this.data_bytes = 0;

	// The actual data stream
	this.data_stream = new PassThrough();

	return this.data_stream;
});

/**
 * Stop the data mode
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {Stream}
 */
Stream.setMethod(function stopDataMode() {
	this.data_mode = false;
	this.data_stream.end();
	this.data_stream = null;
});

/**
 * Forward data, and check for dots
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Stream.setMethod(function forwardData(chunk, do_check) {

	// Strip starting dots
	if (do_check == null || do_check) {
		// Now look for escape dots
		let index = chunk.indexOf(escapedot);

		// If escape dots were found
		if (index > -1) {
			// Add 1 for the 0x0A newline
			index += 1;

			// Forward the piece without the dot,
			// without checking it again
			this.forwardData(chunk.slice(0, index), false);

			// And forward the piece with the dot, but do check
			this.forwardData(chunk.slice(index + 1));

			return;
		}
	}

	// Increment the size counter
	this.data_bytes += chunk.length;

	this.data_stream.push(chunk);
});

/**
 * The required _transform method
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Buffer|String}   chunk
 * @param    {String}          encoding
 * @param    {Function}        done
 */
Stream.setMethod(function _transform(chunk, encoding, done) {

	var len;

	console.log('Got chunk:')
	console.log(chunk.toString('binary'));

	// If there is a buffer waiting, prepend it to this chunk
	if (this.waitbuf) {
		chunk = Buffer.concat([this.waitbuf, chunk]);
		this.waitbuf = null;
	}

	len = chunk.length;

	if (this.data_mode) {

		let index = chunk.indexOf(enddata),
		    temp;

		if (index > -1) {
			if (index == 0) {
				this.stopDataMode();
			} else {
				// Slice off the piece until the end data
				temp = chunk.slice(0, index);

				// Push it forward on the data stream
				this.forwardData(temp);

				// Stop the data mode
				this.stopDataMode();

				// See if there is something after the enddata segment
				chunk = chunk.slice(index + 5);

				if (chunk.length) {
					return this._transform(chunk, encoding, done);
				}
			}
		} else {
			// Don't forward chunks shorter than 5 bytes,
			// they could be the end sequence or contain escaped dots
			if (len < 5) {
				this.waitbuf = chunk;
			} else {

				// Keep the last 4 bytes for the next transform,
				// it could be part of the end sequence
				let temp = chunk.slice(-4);
				chunk = chunk.slice(0, -4);

				// Store the last 4 bytes for the next transform
				this.waitbuf = temp;

				this.forwardData(chunk);
			}
		}
	} else {
		let index = chunk.indexOf(crlf),
		    temp;

		if (index > -1) {

			// Slice off the piece until the crlf
			temp = chunk.slice(0, index);

			// Push that forward
			this.push(temp);

			// Get the part after the crlf
			chunk = chunk.slice(index + 2);

			if (chunk.length) {
				return this._transform(chunk, encoding, done);
			}
		} else {
			this.waitbuf = chunk;
		}
	}

	done();
});