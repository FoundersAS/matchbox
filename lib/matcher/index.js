import through from 'through2';
import levelup from 'levelup';
import leveldown from 'leveldown';
import crypto from 'crypto';
import concat from 'concat-stream';
import os from 'os';

const matcher = function(opts) {
  opts = opts || {};
  const that = {};
  const db = levelup(os.tmpDir() + '/invoice-matcher' +  Date.now() + Math.random(), {valueEncoding: 'json', db: opts.db || leveldown});

  that.getLimitDates = function(callback) {
    let earliest = Infinity;
    let latest = -Infinity;
    const fiveDays = 1000 * 3600 * 24 * 5;
    return through.obj(function(transaction, enc, cb) {
      const date = transaction.date; 
      if (date.getTime() < earliest) earliest = date.getTime();
      if (date.getTime() > latest) latest = date.getTime();
      cb();
    }, function() {
      callback({from: new Date(earliest - fiveDays), to: new Date(latest + fiveDays)});
    });
  };

  that.addEmails = function(callback) {
    const key = function(email) {
      const hash = function(string) {
        return crypto.createHash('sha256').update(string).digest('hex');
      };
      return dateFormat(email.date) + '|' + hash(JSON.stringify(email));
    };

    return through.obj(function(email, enc, cb) {
      if (!email || !email.date) return;
      db.put(key(email), email, cb);
    }, callback);
  };

  that.addMatches = function() {
    return  through.obj(function(transaction, enc, cb) {
      const onemails = function(emails) {
        match(transaction, emails, function(err, matches) {
          if (err) return cb(err);
          transaction.matches = matches;
          cb(null, transaction);
        });
      }

      const fiveDays = 1000 * 3600 * 24 * 5;
      const gt = dateFormat(new Date(transaction.date.getTime() - fiveDays));
      const lt = dateFormat(new Date(transaction.date.getTime() + fiveDays));
      db.createValueStream({gt, lt}).pipe(concat(onemails));
    });
  }

  const dateFormat = function(date) {
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();

    if (month.length === 1) month = '0' + month;
    if (day.length === 1) day = '0' + day;

    return year + month + day;
  };

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
    const closeEmails = emails.map(email => {email.date = new Date(email.date); return email})
                              .filter(email => Math.abs(email.date.getTime() - transaction.date.getTime()) < fiveDays);
    cb(null, closeEmails.filter(function(email)  {
      return containsAmount(transaction.amount, email.message);
    }));
  };

  return that;
};

export default matcher;
