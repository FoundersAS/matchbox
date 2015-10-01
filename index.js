import matchbox from './lib/matcher';
import transactionFormatters from './lib/formatters/transactions';
import emailFormatters from './lib/formatters/emails';
import fs from 'fs';
import concat from 'concat-stream';
import os from 'os';
import emailSources from './lib/email-sources';

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
