// Authors:
//   Joe Basirico <joe@whoisjoe.net>
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Yahoo',
  siteUrl: 'http://yahoo.com',
  domains: [ 'yahoo.com' ],
  sessionCookieNames: [ 'T', 'Y', 'F' ],

  identifyUser: function () {
    var resp = this.httpGet("http://www.yahoo.com/");
    this.userName   = resp.body.querySelector('.connected-lbl').textContent;
    this.userAvatar = resp.body.querySelector('img.tab-icon').src;
  }
});