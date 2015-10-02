'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nodeGmailApi = require('node-gmail-api');

var _nodeGmailApi2 = _interopRequireDefault(_nodeGmailApi);

var emailSources = {
  gmail: function gmail(msg, daterange) {
    var gmailDateRange = function gmailDateRange(daterange) {
      var from = daterange.from.getFullYear() + '/' + (daterange.from.getMonth() + 1) + '/' + daterange.from.getDate();
      var to = daterange.to.getFullYear() + '/' + (daterange.to.getMonth() + 1) + '/' + daterange.to.getDate();
      return 'after:' + from + ' before:' + to;
    };
    var gmail = new _nodeGmailApi2['default'](msg.email.auth.token);
    return gmail.messages(gmailDateRange(daterange));
  }
};

exports['default'] = emailSources;
module.exports = exports['default'];