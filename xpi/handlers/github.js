// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'GitHub',
  domains: [ 'github.com' ],
  sessionCookieNames: [ '_github_ses' ],

  processPacket: function () {
    var cookie = this.firstPacket.cookies['_github_ses'];
    var railsSession = RailsHelper.parseSessionCookie(cookie);
    if (!railsSession.user) {
      this.session = null;
      return;
    }
    this.id = railsSession.fingerprint;
    this.firstPacket._github_ses = railsSession;
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('.name').textContent;
    this.userAvatar = resp.body.querySelector('.avatarname img').src;
  }
});