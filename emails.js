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
      normalizeEmails(emails, cb);
    });
  });
});

const findCloseEmails = function(date, cb) {
  const fiveDays = 1000 * 3600 * 24 * 5;

  const onnormalize = function(err, emails) {
    if (err) return cb(err);
    cb(null, emails.filter(function(email) {
      //return (Math.abs(email.date.getTime() - date.getTime()) < fiveDays) && email.from.indexOf('joshua@founders.as') === -1;
      return (Math.abs(email.date.getTime() - date.getTime()) < fiveDays);
    }));
  }

  const onemails = function(err, emails) {
    if (err) return cb(err);
    normalizeEmails(emails, onnormalize);
  }

  getEmails(onemails);
};

export default getEmails;
