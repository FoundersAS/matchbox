matchbox
========

![matchbox](https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Matchbox_ussr_03.jpeg/1024px-Matchbox_ussr_03.jpeg)

This module matches a list of transactions with possible invoices from a list of emails.
It uses node.js streams so that you don't have to buffer a lot of emails or transactions into memory.

This is an example on how to use it

```js
let m = matcher();
transactions().pipe(m.getLimitDates(ondates));

function ondates(dates) {
  emails(dates).pipe(m.addEmails(onemailsadded));
}

function onemailsadded() {
  transactions().pipe(m.addMatches()).on('data', console.log);
}

```

Where `transactions` is a function that returns a stream of transactions and `emails` returns a stream of emails
between the sepcified dates.
