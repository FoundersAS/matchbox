var fs = require('fs');
var csv = require('csv-parser');
var through = require('through2');
var match = require('./match');

var format = through.obj(function(obj, enc, cb) {
  var dateParts = obj['Dato'].split('.');
  var filterAmounts = function(x) {
    return x.match(/\d/) && (x.indexOf('.') !== -1 || x.indexOf(',') !== -1)
  }
  cb(null, {
    amount: (obj['Beløb'] || '').replace(/[^\d.,]/g, ''),
    date: new Date(dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0]),
    text: obj['Tekst'],
    amounts: (obj['Tekst'].substr(8).match(/[\d,.]+/g) || []).filter(filterAmounts)
  })
});

var addMatches = through.obj(function(transaction, enc, cb) {
  match(transaction, function(err, matches) {
    if (err) return cb(err);
    transaction.matches = matches;
    cb(null, transaction);
  });
});

var i = 0;
var result = through.obj(function(transaction, enc, cb) {
  if (transaction.matches.length) {
    console.log(transaction.text, '|',  transaction.matches.length);
    console.log(transaction.matches.map(function(x) {return x.subject + ' from: ' + x.from}));
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
