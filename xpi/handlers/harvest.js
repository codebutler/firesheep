// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Harvest',
  domains: [ 'harvestapp.com' ],
  sessionCookieNames: [ '_enc_sess' ],

  processPacket: function () {
    this.siteUrl = 'http://' + this.firstPacket.host;

    var cookie = this.firstPacket.cookies['_enc_sess'];
    var railsSession = RailsHelper.parseSessionCookie(cookie);
  
    if (!railsSession.user_id) {
      this.session = null;
      return;
    }
  
    this.id = railsSession.session_id;
    this.firstPacket._enc_sess = railsSession;
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    var user    = resp.body.querySelector("#login-info").firstChild.textContent.trim();
    var company = resp.body.querySelector('#company-name').textContent.trim();
    this.userName = user;
    this.siteName = 'Harvest (' + company + ')';
  }
});