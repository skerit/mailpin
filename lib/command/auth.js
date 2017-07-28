const Blast   = __Protoblast;
const Fn      = Blast.Bound.Function;
const types   = {};

/**
 * The Mailpin AUTH Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
let AUTH = Fn.inherits('Develry.Mailpin.Command.Command', function AUTH() {});

/**
 * Add child types
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AUTH.constitute(function addType() {

	var name;

	if (this.name == 'AUTH') {
		return;
	}

	name = Blast.Bound.String.after(this.name, 'AUTH');

	if (!name) {
		return;
	}

	name = name.toUpperCase();

	this.setStatic('title', name);

	types[name] = this;
});

/**
 * Override the static create method
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}     data
 *
 * @return   {Command}
 */
AUTH.setStatic(function create(data) {

	var subclass,
	    subtype,
	    result,
	    pieces;

	// If there are no children, just return AUTH
	if (!this.children) {
		result = new this();
		result.data = data;
		return result;
	}

	// Split the data by space
	pieces = Blast.Bound.String.splitOnce(data, ' ');

	// Get the subtype name
	subtype = pieces[0];

	// Get the subtype class
	subclass = types[subtype];

	if (!subclass) {
		return;
	}

	result = new subclass();
	result.data = pieces[1];

	console.log('Created', result);

	return result;
});

/**
 * Let the auth command advertise
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {String}
 */
AUTH.setStatic(function getAdvertisement() {

	var result = 'AUTH',
	    title,
	    key;

	for (key in types) {
		title = types[key].title;

		if (title) {
			result += ' ' + title;
		}
	}

	return result;
}, false);

/**
 * Incoming AUTH
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   done
 */
AUTH.setMethod(function incomingAction(done) {
	// When the regular AUTH class handles an incoming action,
	// it means the mechanism was not found
	this.respond(504, 'Unrecognized authentication type');
	done();
});

/**
 * Actually verify login & password.
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}     username
 * @param    {String}     password
 */
AUTH.setMethod(function verifyCredentials(username, password) {
	console.warn('NEED TO OVERRIDE, loging in user', username);
	this.allow();
});

/**
 * Allow the login
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AUTH.setMethod(function allow() {
	this.respond(235, '2.7.0 Authentication successful');

	if (this.done_callback) {
		this.done_callback();
	}
});

/**
 * Deny the login
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
AUTH.setMethod(function deny() {
	this.respond(535, '5.7.8  Authentication credentials invalid');
});