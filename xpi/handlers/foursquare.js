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

    // Get image object for user avatar (contains their name, too!)
    var user_img = resp.body.querySelector('.withImage img');
    this.userName = user_img.alt;
    this.userAvatar = user_img.src;
    if (this.userAvatar.substr(0, 4) != 'http') {
      this.userAvatar = 'http://foursquare.com/' + this.userAvatar;
    }
  },
});
