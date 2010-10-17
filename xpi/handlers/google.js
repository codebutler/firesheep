// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Google',
  url: 'http://www.google.com/',
  domains: [ 'google.com' ],
  sessionCookieNames: [ 'SID', 'NID', 'HSID', 'PREF' ],

  processPacket: function () {
    var hsid = this.firstPacket.cookies['HSID'];
    this.sessionId = hsid;
  },

  identifyUser: function() {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelectorAll(".gb4")[0].textContent;
  }
});
