'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _libMatcher = require('../lib/matcher/');

var _libMatcher2 = _interopRequireDefault(_libMatcher);

var _from2 = require('from2');

var _from22 = _interopRequireDefault(_from2);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var transactions = [{
  amount: '12.99',
  date: new Date('2015-09-22'),
  text: 'Food',
  amounts: []
}, {
  amount: '18,00',
  date: new Date('2015-09-25'),
  text: 'Taxi',
  amounts: []
}, {
  amount: '9.00',
  date: new Date('2015-09-27'),
  text: 'Web hosting',
  amounts: []
}];

var emails = [{
  from: 'food@example.com',
  subject: 'invoice for food',
  message: 'This is an invoice for 12,99 dollars',
  date: new Date('2015-09-25')
}];

(0, _tape2['default'])('basic test', function (t) {
  var m = (0, _libMatcher2['default'])();

  var onemailsadded = function onemailsadded() {
    _from22['default'].obj(transactions).pipe(m.addMatches()).pipe((0, _concatStream2['default'])(function (transactions) {
      t.equal(transactions[0].matches.length, 1);
      t.equal(transactions[1].matches.length, 0);
      t.equal(transactions[2].matches.length, 0);
      t.end();
    }));
  };

  var ondates = function ondates(daterange) {
    t.equal(daterange.from.getMonth(), 8);
    t.equal(daterange.from.getDate(), 17);
    t.equal(daterange.to.getMonth(), 9);
    t.equal(daterange.to.getDate(), 2);

    _from22['default'].obj(emails).pipe(m.addEmails(onemailsadded));
  };

  _from22['default'].obj(transactions).pipe(m.getLimitDates(ondates));
});