'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _libFormattersTransactions = require('../lib/formatters/transactions');

var _libFormattersTransactions2 = _interopRequireDefault(_libFormattersTransactions);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var sydbank = _libFormattersTransactions2['default'].sydbank;

(0, _tape2['default'])('sydbank parser', function (t) {
  var onconcat = function onconcat(transactions) {
    t.equal(transactions[0].text, '11.08.15 AWESOMECORP 122,84 USD');
    t.equal(transactions[0].amount, '122,84');
    t.equal(transactions[0].date.getTime(), new Date('2015-08-13').getTime());

    t.equal(transactions[1].text, '04.08.15 EXAMPLE.COM 25,00 USD');
    t.equal(transactions[1].amount, '25,00');
    t.equal(transactions[1].date.getTime(), new Date('2015-08-06').getTime());

    t.equal(transactions[2].text, '02.08.15 SOMEFOUNDATION.ORG');
    t.equal(transactions[2].amount, '663,24');
    t.equal(transactions[2].date.getTime(), new Date('2015-08-04').getTime());
    t.end();
  };
  _fs2['default'].createReadStream(__dirname + '/sydbank.csv').pipe(sydbank()).pipe((0, _concatStream2['default'])(onconcat));
});