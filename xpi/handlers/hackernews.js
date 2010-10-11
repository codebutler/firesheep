// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Hacker News',
  domains: [ 'news.ycombinator.com' ],
  sessionCookieNames: [ 'user' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelectorAll(".pagetop a")[7].innerHTML;
  }
});