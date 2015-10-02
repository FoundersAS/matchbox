'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var _levelup = require('levelup');

var _levelup2 = _interopRequireDefault(_levelup);

var _leveldown = require('leveldown');

var _leveldown2 = _interopRequireDefault(_leveldown);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var matcher = function matcher(opts) {
  opts = opts || {};
  var that = {};
  var db = (0, _levelup2['default'])(_os2['default'].tmpDir() + '/invoice-matcher' + Date.now() + Math.random(), { valueEncoding: 'json', db: opts.db || _leveldown2['default'] });

  that.getLimitDates = function (callback) {
    var earliest = Infinity;
    var latest = -Infinity;
    var fiveDays = 1000 * 3600 * 24 * 5;
    return _through22['default'].obj(function (transaction, enc, cb) {
      var date = transaction.date;
      if (date.getTime() < earliest) earliest = date.getTime();
      if (date.getTime() > latest) latest = date.getTime();
      cb();
    }, function () {
      callback({ from: new Date(earliest - fiveDays), to: new Date(latest + fiveDays) });
    });
  };

  that.addEmails = function (callback) {
    var key = function key(email) {
      var hash = function hash(string) {
        return _crypto2['default'].createHash('sha256').update(string).digest('hex');
      };
      return dateFormat(email.date) + '|' + hash(JSON.stringify(email));
    };

    return _through22['default'].obj(function (email, enc, cb) {
      if (!email || !email.date) return;
      db.put(key(email), email, cb);
    }, callback);
  };

  that.addMatches = function () {
    return _through22['default'].obj(function (transaction, enc, cb) {
      var onemails = function onemails(emails) {
        match(transaction, emails, function (err, matches) {
          if (err) return cb(err);
          transaction.matches = matches;
          cb(null, transaction);
        });
      };

      var fiveDays = 1000 * 3600 * 24 * 5;
      var gt = dateFormat(new Date(transaction.date.getTime() - fiveDays));
      var lt = dateFormat(new Date(transaction.date.getTime() + fiveDays));
      db.createValueStream({ gt: gt, lt: lt }).pipe((0, _concatStream2['default'])(onemails));
    });
  };

  var dateFormat = function dateFormat(date) {
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();

    if (month.length === 1) month = '0' + month;
    if (day.length === 1) day = '0' + day;

    return year + month + day;
  };

  var match = function match(transaction, emails, cb) {
    var switchCommasAndDots = function switchCommasAndDots(str) {
      return str.split('').map(function (chr) {
        if (chr === '.') return ',';
        if (chr === ',') return '.';
        return chr;
      }).join('');
    };

    var containsAmount = function containsAmount(amount, str) {
      str = str || '';
      if (!amount) return false;
      var amounts = str.match(/[\d.,]+/g) || [];
      return amounts.indexOf(amount) !== -1 || amounts.indexOf(switchCommasAndDots(amount)) !== -1;
    };

    var fiveDays = 1000 * 3600 * 24 * 5;
    var closeEmails = emails.map(function (email) {
      email.date = new Date(email.date);return email;
    }).filter(function (email) {
      return Math.abs(email.date.getTime() - transaction.date.getTime()) < fiveDays;
    });
    cb(null, closeEmails.filter(function (email) {
      return containsAmount(transaction.amount, email.message);
    }));
  };

  return that;
};

exports['default'] = matcher;
module.exports = exports['default'];