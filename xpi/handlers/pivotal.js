// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Pivotal Tracker',
  url: 'http://www.pivotaltracker.com/dashboard',
  sessionCookieNames: [ '_myapp_session' ],
  domains: [ 'pivotaltracker.com' ],

  processPacket: function () {
    var cookie = this.firstPacket.cookies['_myapp_session'];
    var railsSession = RailsHelper.parseSessionCookie(cookie);
  
    if (!railsSession.signin_person_id) {
      this.session = null;
      return;
    }

    this.id = railsSession.session_id;
    this.firstPacket._myapp_session = railsSession;
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('.welcome_message').textContent.replace('Welcome,', '').trim();
  }
});