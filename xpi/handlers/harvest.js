// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Harvest',
  sessionCookieNames: [ '_harvest_sess' ],

  matchPacket: function (packet) {
    return (packet.host.match(/\.harvestapp.com$/));
  },
  
  processPacket: function () {
    this.siteUrl = 'http://' + this.firstPacket.host;

    var cookie = this.firstPacket.cookies['_harvest_sess'];
    var railsSession = RailsHelper.parseSessionCookie(cookie);
    if (!railsSession.user_id) {
      this.sessionId = null;
      return;
    }
    this.sessionId = railsSession.session_id;
    this.firstPacket._harvest_sess = railsSession;
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl + '/overview');

    this.userName = resp.body.querySelector('.user-area').textContent.split('|')[0].trim();
    var company = resp.body.querySelector('#company_bar strong').textContent;
    this.siteName = 'Harvest (' + company + ')';
  }
});