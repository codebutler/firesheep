// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Amazon.com',
  url: 'http://www.amazon.com/',
  domains: [ 'amazon.com' ],
  sessionCookieNames: [ 'x-main' ],

  identifyUser: function() {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector(".navGreeting").textContent.split(', ')[1].slice(0, -1);
  }
});
