// Authors:
//   Amr N. Tamimi <amr@rushthinking.com>
register({
  name: "ShutterStock",
  domains: [ 'www.shutterstock.com' ],
  sessionCookieNames: [ 'ssssidd' ],
  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('.index-heading div b').textContent;
  }
});