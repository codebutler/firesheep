// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Foursquare',
  domains: [ 'foursquare.com' ],
  sessionCookieNames: [ 'ext_id', 'XSESSIONID' ],

  processPacket: function () {
    var cookie = this.firstPacket.cookies['ext_id'];
    this.sessionId = cookie;
  },

  identifyUser: function () {
    var resp = this.httpGet('http://foursquare.com/user');
    var path = resp.request.channel.URI.path;
    var userId = path.split('/')[2];

    this.userId = userId;
    this.userName   = resp.body.querySelectorAll('.withImage a')[1].innerHTML
    this.userAvatar = resp.body.querySelector('.withImage img').src;
    if (this.userAvatar.substr(0, 4) != 'http') {
      this.userAvatar = 'http://foursquare.com/' + this.userAvatar;
    }
  },
});