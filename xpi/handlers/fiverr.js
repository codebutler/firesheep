// Authors:
//   Amr N. Tamimi <amr@rushthinking.com>
register({
  name: "Fiverr",
  domains: [ 'www.fiverr.com' ],
  sessionCookieNames: [ '_fiverr_session' ],
  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('.welcome a').textContent
  }
});