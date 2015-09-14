import fs from 'fs';
import csv from 'csv-parser';
import through from 'through2';
import match from './match';
import getEmails from './emails'

const format = through.obj(function(obj, enc, cb) {
  const dateParts = obj['Dato'].split('.');
  const filterAmounts = function(x) {
    return x.match(/\d/) && (x.indexOf('.') !== -1 || x.indexOf(',') !== -1)
  };
  var obj = {
    amount: (obj['Beløb'] || '').replace(/[^\d.,]/g, ''),
    date: new Date(dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0]),
    text: obj['Tekst'],
    amounts: (obj['Tekst'].substr(8).match(/[\d,.]+/g) || []).filter(filterAmounts)
  };

  if (obj.amounts.length) obj.amount = obj.amounts[0];
  cb(null, obj);
});

const addMatches = function(emails) {
  return  through.obj(function(transaction, enc, cb) {
    match(transaction, emails, function(err, matches) {
      if (err) return cb(err);
      transaction.matches = matches;
      cb(null, transaction);
    });
  });
};

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

getEmails(function(err, emails) {
  if (err) return console.log(err);
  fs.createReadStream('./transactions-utf8-3.csv').pipe(csv({separator: ';'}))
                                                  .pipe(format)
                                                  .pipe(addMatches(emails))
                                                  .pipe(result);
});
