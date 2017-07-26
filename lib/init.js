// Require protoblast (without native mods) if it isn't loaded yet
if (typeof __Protoblast == 'undefined') {
	require('protoblast')(false);
}

// Get the Mailpin namespace
const Mailpin = __Protoblast.Bound.Function.getNamespace('Develry.Mailpin');

// Require the main files
require('./server/server');
require('./server/session');
require('./server/connection');
require('./common/smtp_stream');
require('./command/command');
require('./command/ehlo');
require('./command/mail');
require('./command/noop');
require('./command/quit');
require('./command/rcpt');
require('./command/data');
require('./command/rset');
require('./command/help');
require('./command/vrfy');

module.exports = Mailpin;