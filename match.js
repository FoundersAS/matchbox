import fs from 'fs';
import each from 'each-series';
import textract from 'textract';
import thunky from 'thunky';

const normalizeEmails = function(xs, cb) {
  const emails = [];
  each(xs, function(obj, i, done) {
    obj.date = new Date(obj.date);
    let finished = false;
    (obj.attachments || []).some(function(attachment) {
      if (attachment.filename.indexOf('.pdf') !== -1) {
        textract.fromBufferWithMime('application/pdf', new Buffer(attachment.attachment, 'base64'), function(err, txt) {
          obj.message = txt;
          delete obj.attachments;
          emails.push(obj);
          done();
        });
        return (finished = true);
      }
    });
    if (finished) return;

    delete obj.attachments;
    emails.push(obj);
    done();
  }, function(err) {
    if (err) return cb(err);
    cb(null, emails);
  });
};

const getEmails = thunky(function(cb) {
  fs.readdir('./gmail-backup/', function(err, files) {
    console.log(files.length);
    const emails = [];
    each(files, function(fl, i , done) {
      fs.readFile('./gmail-backup/' + fl, function(err, content) {
        if (err) return done(err);

        try {
          var obj = JSON.parse(content.toString());
        } catch (e) {
          var obj = {};
        }

        // if is base64
        if (obj.message && /^[A-Za-z0-9\/+=\r\n]+$/.test(obj.message)) {
          const buf = new Buffer(obj.message, 'base64');
          obj.message = buf.toString();
        }
        emails.push(obj);
        done();
      });
    }, function(err) {
      if (err) return cb(err);
      cb(null, emails);
    });
  });
});

const findCloseEmails = function(date, cb) {
  const fiveDays = 1000 * 3600 * 24 * 5;

  const onnormalize = function(err, emails) {
    if (err) return cb(err);
    cb(null, emails.filter(function(email) {
      return (Math.abs(email.date.getTime() - date.getTime()) < fiveDays) && email.from.indexOf('joshua@founders.as') === -1;
    }));
  }

  const onemails = function(err, emails) {
    if (err) return cb(err);
    normalizeEmails(emails, onnormalize);
  }

  getEmails(onemails);
};

const match = function(transaction, cb) {
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

  const onemails = function(err, emails) {
    if (err) return cb(err);
    cb(null, emails.filter(function(email)  {
      return containsAmount(transaction.amount, email.message) || 
             (transaction.amounts || []).some(a => containsAmount(a, email.message));
    }));
  };

  findCloseEmails(transaction.date, onemails);
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
