// Authors:
//   Ian Gallagher <crash@neg9.org>
//   Eric Butler <eric@codebutler.com>
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

    if (resp.body.querySelector("#gbi4t") != null) {
      // Google+ Account
      this.userName   = resp.body.querySelector("#gbi4t").textContent;
      this.userAvatar = "https:" + resp.body.querySelector("#gbi4i").src;
    } else {
      this.userName = resp.body.querySelector("#gbi4m1").textContent;
    }
  }
});
