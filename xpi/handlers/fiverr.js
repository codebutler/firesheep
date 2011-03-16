// Authors:
//   Amr N. Tamimi <amr@rushthinking.com>
//   Eric Butler <eric@codebutler.com>

Components.utils.import('resource://firesheep/util/RailsHelper.js');

register({
  name: "Fiverr",
  domains: [ 'www.fiverr.com' ],
  sessionCookieNames: [ '_fiverr_session' ],
  processPacket: function () {
    var cookie = this.firstPacket.cookies['_fiverr_session'];
    this._fiverr_session = RailsHelper.parseSessionCookie(cookie);
    this.sessionId = this._fiverr_session.session_id;
  },
  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('.welcome a').textContent
  }
});