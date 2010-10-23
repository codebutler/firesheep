// Authors:
//   Joe Basirico <joe@whoisjoe.net>
register({
  name: 'Yahoo',
  url: 'http://www.yahoo.com',
  domains: [ 'yahoo.com' ],
  sessionCookieNames: [ 'T', 'Y' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName   = resp.body.querySelector('.y-ln-1').alt;
    this.userAvatar = resp.body.querySelector('.y-ln-1').src;
  }
});