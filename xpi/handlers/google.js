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
    var avatar_element;
    try {
	    var profile = this.httpGet('https://www.google.com/profiles/me');
	    avatar_element = profile.body.querySelector('.ll_profilephoto.photo');
    }
    catch(err) {
	    // They likley don't have a profile setup, no avatar for us :(
	    avatar_element = null;
    }

    if (avatar_element) {
	    this.userAvatar = avatar_element.src;
	    if (this.userAvatar.substr(0, 4) != 'http') {
	      this.userAvatar = 'http://www.google.com' + this.userAvatar;
	    }
    }
  }
});
