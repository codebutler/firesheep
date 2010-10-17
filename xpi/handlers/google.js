// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Google',
  url: 'http://www.google.com/',
  domains: [ 'google.com' ],
  sessionCookieNames: [ 'SID', 'NID', 'HSID', 'PREF' ],

  processPacket: function () {
    var hsid = this.firstPacket.cookies['HSID'];
    this.sessionId = hsid;
  },

  identifyUser: function() {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector(".gb4").textContent;

    // Grab avatar from Google Profiles page, if they have one
    var profile = this.httpGet('http://www.google.com/profiles/me');
    var avatar_element = profile.body.querySelector('.ll_profilephoto.photo');

    if (avatar_element) {
	    this.userAvatar = avatar_element.src;
	    if (this.userAvatar.substr(0, 4) != 'http') {
	      this.userAvatar = 'http://www.google.com' + this.userAvatar;
	    }
    }
  }
});
