// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Enom',
  domains: [ 'enom.com' ],
  sessionCookieNames: [ 'OatmealCookie', 'EmailAddress' ],

  identifyUser: function () {
    this.userName = this.firstPacket.cookies['OatmealCookie'].split(';')[0];
  }
});