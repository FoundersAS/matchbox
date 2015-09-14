const match = function(transaction, emails, cb) {
  const switchCommasAndDots = function(str) {
    return str.split('').map(function(chr) {
      if (chr === '.') return ',';
      if (chr === ',') return '.';
      return chr;
    }).join('');
  };

  const containsAmount = function(amount, str) {
    str = str || '';
    if (!amount) return false;
    const amounts = str.match(/[\d.,]+/g) || [];
    return amounts.indexOf(amount) !== -1 || amounts.indexOf(switchCommasAndDots(amount)) !== -1;
  };

  const fiveDays = 1000 * 3600 * 24 * 5;
  const closeEmails = emails.filter(email => Math.abs(email.date.getTime() - transaction.date.getTime()) < fiveDays);
  cb(null, closeEmails.filter(function(email)  {
    return containsAmount(transaction.amount, email.message);
  }));
};

export default match;

//match({amount: '84,14', date: new Date('08.04.2015')}, function(err, matches) {
//  console.log(err, matches, matches.length);
//});

//match({amount: '-3.004,07', date: new Date('08.27.2015')}, function(err, matches) {
//  console.log(err, matches.length);
//});

//getEmails(function(err, emails) {
//  emails.forEach(function(email) {
//    delete email.attachments
//    console.log(JSON.stringify(email))
//  });
//});
