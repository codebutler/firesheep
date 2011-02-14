// Authors:
//   Amr N. Tamimi <amr@rushthinking.com>
register({
  name: "reddit",
  domains: [ 'www.reddit.com' ],
  sessionCookieNames: [ 'reddit_session' ],
  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('.user a').textContent;
  }
});