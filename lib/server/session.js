const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;
const Mailpin = Fn.getNamespace('Develry.Mailpin');

/**
 * The Mailpin Session class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let Session = Fn.inherits('Informer', 'Develry.Mailpin.Server', function Session(connection) {

	// The parent connection
	this.connection = connection;

	// The custom properties
	this._custom = null;

	// The current open mail command
	this.mail = null;
});

/**
 * Remote address info
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Session.setStatic(function setConnectionProperty(name) {
	this.setProperty(name, function get_property() {
		if (this._custom[name] != null) {
			return this._custom[name];
		}

		return this.connection[name];
	}, function set_property(value) {
		this._custom[name] = value;
	});
});

/**
 * Reset the session
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Session.setMethod(function reset() {

	// Reset the custom properties
	this._custom = {};

	// Reset the current open mail command
	this.mail = null;

	// Transaction number
	this.transaction = this.connection.transactions;
});

Session.setConnectionProperty('id');
Session.setConnectionProperty('remote_address');
Session.setConnectionProperty('remote_port');
Session.setConnectionProperty('client_hostname');
Session.setConnectionProperty('opening_command');
Session.setConnectionProperty('hostname_identifier');
Session.setConnectionProperty('x_client');
Session.setConnectionProperty('x_forward');
Session.setConnectionProperty('transmission_type');
Session.setConnectionProperty('tls_options');