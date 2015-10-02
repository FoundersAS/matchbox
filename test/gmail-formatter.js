import test from 'tape';
import concat from  'concat-stream';
import from from 'from2';
import emailFormatters from '../lib/formatters/emails';

const gmailFormatter = emailFormatters.gmail;
const emails = [{
  "id": "1502875d8fec9a86",
  "threadId": "1502875d8fec9a86",
  "labelIds": [
    "INBOX",
    "IMPORTANT",
    "CATEGORY_PERSONAL",
    "UNREAD"
  ],
  "snippet": "test.",
  "historyId": "6502",
  "internalDate": "1443787822000",
  "payload": {
    "partId": "",
    "mimeType": "text/plain",
    "filename": "",
    "headers": [
      {
        "name": "Delivered-To",
        "value": "ed@founders.as"
      },
      {
        "name": "Return-Path",
        "value": "<eduardo@sorribas.org>"
      },
      {
        "name": "Date",
        "value": "Fri, 2 Oct 2015 14:10:22 +0200"
      },
      {
        "name": "Message-ID",
        "value": "<CAJeVJ1H22x-Ew0HXZ4Tqm5Bpu2SXOdtZ8ru1QZVP=mn6xSNROg@mail.gmail.com>"
      },
      {
        "name": "Subject",
        "value": "tst"
      },
      {
        "name": "From",
        "value": "Eduardo Sorribas <eduardo@sorribas.org>"
      },
      {
        "name": "To",
        "value": "Eduardo Sorribas <ed@founders.as>"
      },
      {
        "name": "Content-Type",
        "value": "text/plain; charset=UTF-8"
      }
    ],
    "body": {
      "size": 7,
      "data": "dGVzdC4NCg=="
    }
  },
  "sizeEstimate": 2399
}];


test('gmail formatter', function(t) {
  const onemails = function(emails) {
    t.equal(emails[0].from, 'Eduardo Sorribas <eduardo@sorribas.org>');
    t.equal(emails[0].subject, 'tst');
    t.equal(emails[0].message.indexOf('test.'), 0);
    t.end();
  };

  from.obj(emails).pipe(gmailFormatter('')).pipe(concat(onemails));
});
