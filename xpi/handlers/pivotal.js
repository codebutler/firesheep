// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Pivotal Tracker',
  url: 'http://www.pivotaltracker.com/dashboard',
  sessionCookieNames: [ 'tracker_session' ],
  domains: [ 'pivotaltracker.com' ],

  processPacket: function () {
    var cookie = this.firstPacket.cookies['tracker_session'];
    var railsSession = RailsHelper.parseSessionCookie(cookie);
    if (!railsSession.signin_person_id) {
      this.sessionId = null;
      return;
    }
    this.sessionId = railsSession.session_id;
    this.firstPacket.tracker_session = railsSession;
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('.welcome_message').textContent.replace('Welcome,', '').trim();
  }
});
