// Authors:
//   Eric Butler <eric@codebutler.com>
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Facebook',
  url: 'https://www.facebook.com/home.php',
  domains: [ 'facebook.com' ],
  sessionCookieNames: [ 'datr', 'c_user', 'lu', 'xs' ],

  processPacket: function () {
    var cookies = this.firstPacket.cookies;
    this.sessionId = cookies.c_user + cookies.xs;
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName   = resp.body.querySelector('.headerTinymanName').innerHTML;
    this.userAvatar = resp.body.querySelector('.headerTinymanPhoto').src;
  }
});
