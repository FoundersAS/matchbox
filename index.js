import matchbox from './lib/matcher';
import transactionFormatters from './lib/formatters/transactions';
import emailFormatters from './lib/formatters/emails';
import fs from 'fs';
import Gmail from 'node-gmail-api';
import concat from 'concat-stream';
import os from 'os';

const emailSources = {
  gmail: function(msg, daterange) {
    const gmailDateRange = function(daterange) {
      const from = daterange.from.getFullYear()  + '/' + 
                   (daterange.from.getMonth() + 1) + '/' + 
                   daterange.from.getDate();
      const to = daterange.to.getFullYear()  + '/' + 
                 (daterange.to.getMonth() + 1) + '/' + 
                 daterange.to.getDate();
      return `after:${from} before:${to}`;
    };
    const gmail = new Gmail(msg.email.auth.token);
    return gmail.messages(gmailDateRange(daterange))
  }
}

const match = function(msg, cb) {
  const onconcat = function(transactions) {
    cb(null, transactions);
  };

  const onemailsadded = function() {
    fs.createReadStream(filename).pipe(transactionFormatters[msg.csv.source]())
                                 .pipe(matcher.addMatches())
                                 .pipe(concat(onconcat));
  };

  const ondates = function(daterange) {
    emailSources[msg.email.source](msg, daterange).pipe(emailFormatters[msg.email.source](msg.email.auth.token))
                                                  .pipe(matcher.addEmails(onemailsadded));
  };

  const onwrite = function(err) {
    if (err) return cb(err);
    fs.createReadStream(filename).pipe(transactionFormatters[msg.csv.source]()).pipe(matcher.getLimitDates(ondates));
  };

  const matcher = matchbox();
  const file = new Buffer(msg.csv.data, 'base64');
  const filename = os.tmpDir() + '/match-csv' +  Date.now() + Math.random() +  '.csv'
  fs.writeFile(filename, file, onwrite);
};

export default match;
