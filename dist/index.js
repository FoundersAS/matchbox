'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libMatcher = require('./lib/matcher');

var _libMatcher2 = _interopRequireDefault(_libMatcher);

var _libFormattersTransactions = require('./lib/formatters/transactions');

var _libFormattersTransactions2 = _interopRequireDefault(_libFormattersTransactions);

var _libFormattersEmails = require('./lib/formatters/emails');

var _libFormattersEmails2 = _interopRequireDefault(_libFormattersEmails);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _libEmailSources = require('./lib/email-sources');

var _libEmailSources2 = _interopRequireDefault(_libEmailSources);

var _pump = require('pump');

var _pump2 = _interopRequireDefault(_pump);

var match = function match(msg, cb) {
  var onconcat = function onconcat(transactions) {
    cb(null, transactions);
  };

  var onemailsadded = function onemailsadded() {
    (0, _pump2['default'])(_fs2['default'].createReadStream(filename), csvFormatter(), matcher.addMatches(), (0, _concatStream2['default'])(onconcat), function (err) {
      if (err) cb(err);
    });
  };

  var ondates = function ondates(daterange) {
    (0, _pump2['default'])(emails(msg, daterange), emailFormatter(msg.email.auth.token), matcher.addEmails(onemailsadded), function (err) {
      if (err) cb(err);
    });
  };

  var onwrite = function onwrite(err) {
    if (err) return cb(err);
    (0, _pump2['default'])(_fs2['default'].createReadStream(filename), csvFormatter(), matcher.getLimitDates(ondates), function (err) {
      if (err) cb(err);
    });
  };

  var matcher = (0, _libMatcher2['default'])();
  var csvFormatter = _libFormattersTransactions2['default'][msg.csv.source];
  var emailFormatter = _libFormattersEmails2['default'][msg.email.source];
  var emails = _libEmailSources2['default'][msg.email.source];
  if (!emails || !emailFormatter || !csvFormatter) return cb(new Error('Invalid source.'));

  var file = new Buffer(msg.csv.data, 'base64');
  var filename = _os2['default'].tmpDir() + '/match-csv' + Date.now() + Math.random() + '.csv';
  _fs2['default'].writeFile(filename, file, onwrite);
};

exports['default'] = match;
module.exports = exports['default'];