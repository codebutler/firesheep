// Authors:
//   Eric Butler <eric@codebutler.com>

register({
  name: 'LinkedIn',
  domains: [ 'www.linkedin.com' ],
  sessionCookieNames: [ 'bcookie' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('.username').textContent;
    this.userAvatar = resp.body.querySelector('img.member-photo').src;
  }
});