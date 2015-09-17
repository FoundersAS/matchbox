import through from 'through2';

const format = function() {
  return through.obj(function(obj, enc, cb) {
    const dateParts = obj['Dato'].split('.');
    const filterAmounts = function(x) {
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
};

export default format;
