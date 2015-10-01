import match from './index';
import fs from 'fs';

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
