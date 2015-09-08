var fs = require('fs');
var each = require('each-series');
var textract = require('textract');
var thunky = require('thunky');

var normalizeEmails = function(xs, cb) {
  var emails = [];
  each(xs, function(obj, i, done) {
    obj.date = new Date(obj.date);
    var finished = false;
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

var getEmails = thunky(function(cb) {
  fs.readdir('./gmail-backup/', function(err, files) {
    console.log(files.length);
    var emails = [];
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
          var buf = new Buffer(obj.message, 'base64');
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

var findCloseEmails = function(date, cb) {
  var fiveDays = 1000 * 3600 * 24 * 5;

  var onnormalize = function(err, emails) {
    if (err) return cb(err);
    cb(null, emails.filter(function(email) {
      return (Math.abs(email.date.getTime() - date.getTime()) < fiveDays) && email.from.indexOf('joshua@founders.as') === -1;
    }));
  }

  var onemails = function(err, emails) {
    if (err) return cb(err);
    normalizeEmails(emails, onnormalize);
  }

  getEmails(onemails);
};

var match = function(transaction, cb) {
  var switchCommasAndDots = function(str) {
    return str.split('').map(function(chr) {
      if (chr === '.') return ',';
      if (chr === ',') return '.';
      return chr;
    }).join('');
  };

  var containsAmount = function(amount, str) {
    str = str || '';
    if (!amount) return false;
    var amounts = str.match(/[\d.,]+/g) || [];
    return amounts.indexOf(amount) !== -1 || amounts.indexOf(switchCommasAndDots(amount)) !== -1;
  };

  var onemails = function(err, emails) {
    if (err) return cb(err);
    cb(null, emails.filter(function(email) {
      return containsAmount(transaction.amount, email.message) || 
             (transaction.amounts || []).some(function(a) { return containsAmount(a, email.message)});
    }));
  };

  findCloseEmails(transaction.date, onemails);
};

module.exports = match;

//match({amount: '84,14', date: new Date('08.04.2015')}, function(err, matches) {
//  console.log(err, matches, matches.length);
//});

//match({amount: '-3.004,07', date: new Date('08.27.2015')}, function(err, matches) {
//  console.log(err, matches.length);
//});

//var i =  0;
//getEmails(function(err, emails) {
//  emails.forEach(function(email) {
//    //console.log(email.subject);
//    var msg = email.message || '';
//    if (email.subject === 'Launch Party - a celebration of Live') console.log(email);
//  });
//  console.log(i);
//});
