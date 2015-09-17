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

const getEmails = function(daterange, cb) {
  fs.readdir('./gmail-backup/', function(err, files) {
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
};

export default getEmails;
