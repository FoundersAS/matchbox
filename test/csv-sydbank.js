import fs from 'fs';
import test from 'tape';
import transactionFormatters from '../lib/formatters/transactions';
import concat from  'concat-stream';

const sydbank = transactionFormatters.sydbank;

test('sydbank parser', function(t) {
  const onconcat = function(transactions) {
    t.equal(transactions[0].text, '11.08.15 AWESOMECORP 122,84 USD');
    t.equal(transactions[0].amount, '122,84');
    t.equal(transactions[0].date.getTime(), new Date('2015-08-13').getTime());

    t.equal(transactions[1].text, '04.08.15 EXAMPLE.COM 25,00 USD');
    t.equal(transactions[1].amount, '25,00');
    t.equal(transactions[1].date.getTime(), new Date('2015-08-06').getTime());

    t.equal(transactions[2].text, '02.08.15 SOMEFOUNDATION.ORG');
    t.equal(transactions[2].amount, '663,24');
    t.equal(transactions[2].date.getTime(), new Date('2015-08-04').getTime());
    t.end();
  };
  fs.createReadStream('./sydbank.csv').pipe(sydbank()).pipe(concat(onconcat));
});
