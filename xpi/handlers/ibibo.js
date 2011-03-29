// Author:
//   Pradeep Sethi - psethi@gmail.com

register({
  name: 'ibibo',
  url: 'http://www.ibibo.com',
  domains: [ 'ibibo.com' ],
  sessionCookieNames: [ 'e', 'u' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName   = resp.body.querySelector('#myLeftStatsPanel img').alt;
    this.userAvatar = resp.body.querySelector('#myLeftStatsPanel img').src;
  }
});



