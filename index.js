import fs from 'fs';
import csv from 'csv-parser';
import through from 'through2';
import match from './match';

const format = through.obj(function(obj, enc, cb) {
  const dateParts = obj['Dato'].split('.');
  const filterAmounts = function(x) {
    return x.match(/\d/) && (x.indexOf('.') !== -1 || x.indexOf(',') !== -1)
  }
  cb(null, {
    amount: (obj['Beløb'] || '').replace(/[^\d.,]/g, ''),
    date: new Date(dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0]),
    text: obj['Tekst'],
    amounts: (obj['Tekst'].substr(8).match(/[\d,.]+/g) || []).filter(filterAmounts)
  })
});

const addMatches = through.obj(function(transaction, enc, cb) {
  match(transaction, function(err, matches) {
    if (err) return cb(err);
    transaction.matches = matches;
    cb(null, transaction);
  });
});

let i = 0;
const result = through.obj(function(transaction, enc, cb) {
  if (transaction.matches.length) {
    console.log(transaction.text, '|',  transaction.matches.length);
    console.log(transaction.matches.map(x => x.subject + ' from: ' + x.from));
    ++i;
  }
  //if (transaction.text === '01.07.15 STOCKSY.COM 50,00 USD kurs: 683,620000') console.log(transaction.matches);
  cb();
}, function(cb) {
  console.log(i);
});

fs.createReadStream('./transactions-utf8.csv').pipe(csv({separator: ';'}))
                                              .pipe(format)
                                              .pipe(addMatches)
                                              .pipe(result);
