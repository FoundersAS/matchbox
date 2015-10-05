import matchbox from './lib/matcher';
import transactionFormatters from './lib/formatters/transactions';
import emailFormatters from './lib/formatters/emails';
import fs from 'fs';
import concat from 'concat-stream';
import os from 'os';
import emailSources from './lib/email-sources';
import pump from 'pump';

const match = function(msg, cb) {
  const onconcat = function(transactions) {
    cb(null, transactions);
  };

  const onemailsadded = function() {
    pump(
      fs.createReadStream(filename),
      csvFormatter(),
      matcher.addMatches(),
      concat(onconcat),
      function(err) {
        if (err) cb(err);
      }
    );
  };

  const ondates = function(daterange) {
    pump(
      emails(msg, daterange),
      emailFormatter(msg.email.auth.token),
      matcher.addEmails(onemailsadded),
      function(err) {
        if (err) cb(err);
      }
    )
  };

  const onwrite = function(err) {
    if (err) return cb(err);
    pump(
      fs.createReadStream(filename),
      csvFormatter(),
      matcher.getLimitDates(ondates),
      function(err) {
        if (err) cb(err);
      }
    );
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
