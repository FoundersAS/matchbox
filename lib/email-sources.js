import Gmail from 'node-gmail-api';

const emailSources = {
  gmail: function(msg, daterange) {
    const gmailDateRange = function(daterange) {
      const from = daterange.from.getFullYear()  + '/' + 
                   (daterange.from.getMonth() + 1) + '/' + 
                   daterange.from.getDate();
      const to = daterange.to.getFullYear()  + '/' + 
                 (daterange.to.getMonth() + 1) + '/' + 
                 daterange.to.getDate();
      return `after:${from} before:${to}`;
    };
    const gmail = new Gmail(msg.email.auth.token);
    return gmail.messages(gmailDateRange(daterange))
  }
}

export default emailSources;
