// Authors:
//   Ian Gallagher <crash@neg9.org>

register({
  name: 'CNET',
  url: 'http://www.cnet.com/',
  domains: [ 'cnet.com' ],
  sessionCookieNames: [ 'urs_sessionId' ],

  identifyUser: function () {
    var resp = this.httpGet('http://www.cnet.com/profile/');
    this.userName = resp.body.querySelector("#overviewHead h1").textContent.slice(9, -1);
  }
});
