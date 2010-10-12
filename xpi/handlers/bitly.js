// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'bit.ly',
  domains: [ 'bit.ly' ],
  sessionCookieNames: [ 'user' ],

  identifyUser: function() {
    this.siteUrl = 'http://bit.ly/';
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelectorAll("#loginContainer a")[0].textContent;
  }
});
