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
    this.userName = resp.body.querySelectorAll(".gb4")[0].textContent;

    // Grab avatar from Google Profiles page, if they have one
    try {
	    var profile = this.httpGet('http://www.google.com/profiles/me');
	    this.userAvatar = profile.body.querySelector('.ll_profilephoto.photo').src;
	    if (this.userAvatar.substr(0, 4) != 'http') {
	      this.userAvatar = 'http://www.google.com' + this.userAvatar;
	    }
    }
    catch(err) {
	    // Something went wrong - most likley user does not have a Google Profile,
	    // simply don't set the userAvatar in this case.
    }
  }
});
