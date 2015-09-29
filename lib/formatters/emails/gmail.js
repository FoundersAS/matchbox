var ndjson = require('ndjson');
var request = require('request');
var through = require('through2');
var afterAll = require('after-all');
var textract = require('textract');

var i = 0;
var base64decode = function(b64) {
  return new Buffer(b64, 'base64').toString();
};

var gmailFormatter = function(token) {
  return through.obj(function(email, enc, cb) {
    var headers = email.payload.headers.reduce(function(obj, h) {
      obj[h.name] = h.value;
      return obj;
    }, {});

    var result = {
      from: headers['From'],
      subject: headers['Subject'],
      date: new Date(parseInt(email.internalDate))
    };

    if (email.payload.body.data) result.message = base64decode(email.payload.body.data)
    if (!email.payload.parts) return cb(null, result);
    if (email.payload.parts[0].body.data) result.message = base64decode(email.payload.parts[0].body.data);
    if (email.payload.parts[0].parts && email.payload.parts[0].parts.length
        && email.payload.parts[0].parts[0].body && email.payload.parts[0].parts[0].body.data) {
          result.message = base64decode(email.payload.parts[0].parts[0].body.data);
    }

    var next = afterAll(function(err) {
      if (err) return cb(err);
      cb(null, result);
    });
    email.payload.parts.slice(1).forEach(function(part) {
      if (!part.body.attachmentId) return;
      if (part.filename.toLowerCase().indexOf('.pdf') !== (part.filename.length - 4)) return;

      var url = 'https://www.googleapis.com/gmail/v1/users/me/messages/'+email.id+'/attachments/' + part.body.attachmentId;
      var done = next();
      request({
        url: url,
        json: true,
        headers: {
          'Authorization': 'Bearer ' + token 
        }
      },function(err, response) {
        if (err) return done(err);
        textract.fromBufferWithMime('application/pdf', new Buffer(response.body.data, 'base64'), function(err, txt) {
          if (err) return done();
          result.message = txt;
          done();
        });
      });
    });
  });
};

module.exports = gmailFormatter;
