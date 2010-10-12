// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Google',
  domains: [ 'google.com' ],
  sessionCookieNames: [ 'SID', 'NID', 'HSID', 'PREF' ],

  processPacket: function () {
    var hsid = this.firstPacket.cookies['HSID'];
    this.id = hsid;
  },

  identifyUser: function() {
    this.siteUrl = 'http://www.google.com/';
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelectorAll(".gb4")[0].textContent;
  }
});
