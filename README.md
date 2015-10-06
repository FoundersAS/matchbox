matchbox
========

![matchbox.jpg](matchbox.jpg)
![https://travis-ci.org/FoundersAS/matchbox.svg?branch=master](https://travis-ci.org/FoundersAS/matchbox.svg?branch=master)

This module matches a list of transactions with possible invoices from a list of emails.
it fetches emails from different supported email sources. Right now only gmail is supported.

It parses csv from different banks. Right now only sydbank is supported.

This is an example on how to use it

```js
match({
  csv: {
    source: 'sydbank',
    data: fs.readFileSync('./csv.csv').toString('base64')
  },
  email: {
    source: 'gmail',
    auth: {
      token: 'GMAIL-TOKEN-HERE'
    }
  }
}, function(err, transactions) {
  console.log(JSON.stringify(transactions, null, '  '));
});
```
This module requires `pdftotext` to be installed in order to match against PDF invoices.
