// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Foursquare',
  url: 'http://foursquare.com/',
  domains: [ 'foursquare.com' ],
  sessionCookieNames: [ 'ext_id', 'XSESSIONID' ],

  processPacket: function () {
    var cookie = this.firstPacket.cookies['ext_id'];
    this.sessionId = cookie;
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    var path = resp.request.channel.URI.path;
    var userId = path.split('/')[2];

    // Maybe this is useful for something in the future..?
    this.userId = userId;

    this.userName   = resp.body.querySelector('#personDetail h2 a').textContent;
    this.userAvatar = resp.body.querySelector('#personDetail img').src;
  },
});
