// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'GroupMe',
  url: 'http://groupme.com',
  sessionCookieNames: [ '_groupme_session' ],
  domains: [ 'groupme.com' ],

  processPacket: function () {
    var cookie = this.firstPacket.cookies['_groupme_session'];
    var railsSession = RailsHelper.parseSessionCookie(cookie);
    if (!railsSession.user_credentials) {
      this.sessionId = null;
      return;
    }
    this.sessionId = railsSession.session_id;
    this.firstPacket._groupme_session = railsSession;
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl + '/user/edit');
    this.userName = resp.body.querySelector('#user_name').value;
  }
});
