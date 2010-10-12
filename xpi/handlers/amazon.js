// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Amazon.com',
  domains: [ 'amazon.com' ],
  sessionCookieNames: [ 'x-main' ],

  identifyUser: function() {
    this.siteUrl = 'http://www.amazon.com/';
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector(".navGreeting").textContent.split(', ')[1].slice(0, -1);
  }
});
