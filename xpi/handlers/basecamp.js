// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Basecamp',
  domains: [ 'basecamphq.com' ],
  sessionCookieNames: [ "_basecamp_session", "session_token" ],

  processPacket: function () {
    this.siteUrl = 'http://' + this.firstPacket.host;
    this.siteName = 'Basecamp (' + this.firstPacket.host.split('.')[0] + ')';

    var cookie = this.firstPacket.cookies['_basecamp_session'];
    var railsSession = RailsHelper.parseSessionCookie(cookie);
    if (!railsSession.user_id) {
      this.sessionId = null;
      return;
    }
    this.sessionId = railsSession.session_id;
    this.firstPacket._basecamp_session = railsSession;
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl + '/identity/edit');
    this.userName = resp.body.querySelector('#settings_signout_and_help .name').textContent;
  }
});