import fs from 'fs';
import each from 'each-series';
import textract from 'textract';
import from from 'from2';

const files = fs.readdirSync('./gmail-backup/');
const getEmails = function(daterange) {
  const normalize = function(obj, cb) {
    obj.date = new Date(obj.date);
    let finished = false;
    (obj.attachments || []).some(function(attachment) {
      if (attachment.filename.indexOf('.pdf') !== -1) {
        textract.fromBufferWithMime('application/pdf', new Buffer(attachment.attachment, 'base64'), function(err, txt) {
          obj.message = txt;
          delete obj.attachments;
          cb(null, obj);
        });
        return (finished = true);
      }
    });
    if (finished) return;

    delete obj.attachments;
    cb(null, obj);
  };

  return from.obj(function(size, next) {
    const fl = files.shift();
    if (!fl) return next(null, null);

    fs.readFile('./gmail-backup/' + fl, function(err, content) {
      if (err) return next(err);

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
      normalize(obj, next);
    });
  });
};

export default getEmails;
