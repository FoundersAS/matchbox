'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var _pumpify = require('pumpify');

var _pumpify2 = _interopRequireDefault(_pumpify);

var _csvParser = require('csv-parser');

var _csvParser2 = _interopRequireDefault(_csvParser);

var format = function format() {
  var strm = _through22['default'].obj(function (obj, enc, cb) {
    var dateParts = obj['Dato'].split('.');
    var filterAmounts = function filterAmounts(x) {
      return x.match(/\d/) && (x.indexOf('.') !== -1 || x.indexOf(',') !== -1);
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

  return _pumpify2['default'].obj((0, _csvParser2['default'])({ separator: ';' }), strm);
};

exports['default'] = format;
module.exports = exports['default'];