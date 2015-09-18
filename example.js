import matcher from './index';
import through from 'through2';
import csv from 'csv-parser';
import fs from 'fs';
import from from 'from2';

import getEmails from './emails';
import format from './format';

let m = matcher();
fs.createReadStream('./transactions-utf8-3.csv').pipe(csv({separator: ';'}))
                                                .pipe(format())
                                                .pipe(m.getLimitDates(ondates));

function ondates(dates) {
  getEmails(dates).pipe(m.addEmails(onemailsadded));
}

function onemailsadded() {
  fs.createReadStream('./transactions-utf8-3.csv').pipe(csv({separator: ';'}))
                                                  .pipe(format())
                                                  .pipe(m.addMatches())
                                                  .pipe(result)
}

let i = 0;
const result = through.obj(function(transaction, enc, cb) {
  if (transaction.matches.length) {
    console.log(transaction.text, '|',  transaction.matches.length);
    console.log(transaction.matches.map(x => x.subject + ' from: ' + x.from));
    ++i;
  }
  cb();
}, function(cb) {
  console.log(i);
});
