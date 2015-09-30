import test from 'tape';
import matcher from './';
import from from 'from2';
import concat from  'concat-stream';

const transactions = [
  {
    amount: '12.99',
    date: new Date('2015-09-22'),
    text: 'Food',
    amounts: []
  },
  {
    amount: '18,00',
    date: new Date('2015-09-25'),
    text: 'Taxi',
    amounts: []
  },
  {
    amount: '9.00',
    date: new Date('2015-09-27'),
    text: 'Web hosting',
    amounts: []
  }
];

const emails = [
  {
    from: 'food@example.com',
    subject: 'invoice for food',
    message: 'This is an invoice for 12,99 dollars',
    date: new Date('2015-09-25')
  }
]

test('basic test', function(t) {
  const m = matcher();

  const onemailsadded = function() {
    from.obj(transactions).pipe(m.addMatches()).pipe(concat(function(transactions) {
      t.equal(transactions[0].matches.length, 1);
      t.equal(transactions[1].matches.length, 0);
      t.equal(transactions[2].matches.length, 0);
      t.end();
    }));
  };

  const ondates = function(daterange) {
    t.equal(daterange.from.getMonth(), 8);
    t.equal(daterange.from.getDate(), 17);
    t.equal(daterange.to.getMonth(), 9);
    t.equal(daterange.to.getDate(), 2);

    from.obj(emails).pipe(m.addEmails(onemailsadded));
  };

  from.obj(transactions).pipe(m.getLimitDates(ondates));
});
