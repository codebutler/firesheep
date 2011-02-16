// Authors:
//   Eric Butler <eric@codebutler.com>

register({
  name: 'Sifter',
  sessionCookieNames: [ '_sifter_session', 'auth_token' ],

  matchPacket: function (packet) {
    return (packet.host.match(/\.sifterapp.com$/));
  },

  processPacket: function () {
    this.sessionId = this.firstPacket.cookies['_sifter_session'];
  },

  identifyUser: function () {
    var resp = this.httpGet('https://' + this.firstPacket.host + '/profile');
    var firstName = resp.body.querySelector('#user_first_name').value;
    var lastName  = resp.body.querySelector('#user_last_name').value;
    this.userName = firstName + ' ' + lastName;
    this.siteName = 'Sifter (' + this.firstPacket.host + ')';
  }
});
