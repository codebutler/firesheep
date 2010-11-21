// Authors:
//   Eric Butler <eric@codebutler.com>
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Facebook',
  url: 'https://www.facebook.com/home.php',
  domains: [ 'facebook.com' ],
  sessionCookieNames: [ 'xs', 'c_user', 'sid' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName   = resp.body.querySelector('#navAccountName').innerHTML;
    this.userAvatar = resp.body.querySelector('#navAccountPic img').src;
  }
});
