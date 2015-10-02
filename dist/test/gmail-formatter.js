'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var _from2 = require('from2');

var _from22 = _interopRequireDefault(_from2);

var _libFormattersEmails = require('../lib/formatters/emails');

var _libFormattersEmails2 = _interopRequireDefault(_libFormattersEmails);

var gmailFormatter = _libFormattersEmails2['default'].gmail;
var emails = [{
  "id": "1502875d8fec9a86",
  "threadId": "1502875d8fec9a86",
  "labelIds": ["INBOX", "IMPORTANT", "CATEGORY_PERSONAL", "UNREAD"],
  "snippet": "test.",
  "historyId": "6502",
  "internalDate": "1443787822000",
  "payload": {
    "partId": "",
    "mimeType": "text/plain",
    "filename": "",
    "headers": [{
      "name": "Delivered-To",
      "value": "ed@founders.as"
    }, {
      "name": "Return-Path",
      "value": "<eduardo@sorribas.org>"
    }, {
      "name": "Date",
      "value": "Fri, 2 Oct 2015 14:10:22 +0200"
    }, {
      "name": "Message-ID",
      "value": "<CAJeVJ1H22x-Ew0HXZ4Tqm5Bpu2SXOdtZ8ru1QZVP=mn6xSNROg@mail.gmail.com>"
    }, {
      "name": "Subject",
      "value": "tst"
    }, {
      "name": "From",
      "value": "Eduardo Sorribas <eduardo@sorribas.org>"
    }, {
      "name": "To",
      "value": "Eduardo Sorribas <ed@founders.as>"
    }, {
      "name": "Content-Type",
      "value": "text/plain; charset=UTF-8"
    }],
    "body": {
      "size": 7,
      "data": "dGVzdC4NCg=="
    }
  },
  "sizeEstimate": 2399
}];

(0, _tape2['default'])('gmail formatter', function (t) {
  var onemails = function onemails(emails) {
    t.equal(emails[0].from, 'Eduardo Sorribas <eduardo@sorribas.org>');
    t.equal(emails[0].subject, 'tst');
    t.equal(emails[0].message.indexOf('test.'), 0);
    t.end();
  };

  _from22['default'].obj(emails).pipe(gmailFormatter('')).pipe((0, _concatStream2['default'])(onemails));
});