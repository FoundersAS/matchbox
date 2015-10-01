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
    fs.createReadStream(filename).pipe(csvFormatter())
                                 .pipe(matcher.addMatches())
                                 .pipe(concat(onconcat));
  };

  const ondates = function(daterange) {
    emails(msg, daterange).pipe(emailFormatter(msg.email.auth.token))
                                                  .pipe(matcher.addEmails(onemailsadded));
  };

  const onwrite = function(err) {
    if (err) return cb(err);
    fs.createReadStream(filename).pipe(csvFormatter()).pipe(matcher.getLimitDates(ondates));
  };

  const matcher = matchbox();
  const csvFormatter = transactionFormatters[msg.csv.source];
  const emailFormatter = emailFormatters[msg.email.source];
  const emails = emailSources[msg.email.source];
  if (!emails || !emailFormatter || !csvFormatter) return cb(new Error('Invalid source.'));

  const file = new Buffer(msg.csv.data, 'base64');
  const filename = os.tmpDir() + '/match-csv' +  Date.now() + Math.random() +  '.csv'
  fs.writeFile(filename, file, onwrite);
};

export default match;
