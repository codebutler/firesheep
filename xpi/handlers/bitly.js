// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'bit.ly',
  url: 'http://bit.ly/',
  domains: [ 'bit.ly' ],
  sessionCookieNames: [ 'user' ],

  identifyUser: function() {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelectorAll("#loginContainer a")[0].textContent;
  }
});
