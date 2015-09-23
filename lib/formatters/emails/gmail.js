var ndjson = require('ndjson');
var Gmail = require('node-gmail-api');
var request = require('request');
var through = require('through2');
var afterAll = require('after-all');
var textract = require('textract');

var gmail = new Gmail(token);
var s = gmail.messages('', {max: 10});

const base64decode = function(b64) {
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
    if (email.payload.parts[0].body.data) result.message = base64decode(email.payload.parts[0].body.data);
    if (email.payload.parts[0].parts) result.message = base64decode(email.payload.parts[0].parts[0].body.data);

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
          if (err) return done(err);
          result.message = txt;
          done();
        });
      });
    });
  });
};
