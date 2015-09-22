var ndjson = require('ndjson');
var Gmail = require('node-gmail-api');
var request = require('request');
var through = require('through2');
var afterAll = require('after-all');

var gmail = new Gmail(token);
var s = gmail.messages('label:inbox', {max: 10});

var gmailFormatter = function(token) {
  return through.obj(function(email, enc, cb) {
    var headers = email.payload.headers.reduce(function(obj, h) {
      obj[h.name] = h.value;
      return obj;
    }, {});

    var result = {
      from: headers['From'],
      subject: headers['Subject'],
      attachments: []
    };

    var next = afterAll(function(err) {
      if (err) return cb(err);
      cb(null, result);
    });
    email.payload.parts.slice(1).forEach(function(part) {
      if (!part.body.attachmentId) return;
      var url = 'https://www.googleapis.com/gmail/v1/users/me/messages/'+email.id+'/attachments/' + part.body.attachmentId;
      request({
        url: url,
        json: true,
        headers: {
          'Authorization': 'Bearer ' + token 
        }
      }, next(function(err, response) {
        result.attachments.push(response.body);
      }));
    });
  });
};
