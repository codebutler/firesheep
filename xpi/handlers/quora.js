// Authors:
//   Ian Gallagher
register({
  name: 'Quora',
  domains: [ 'www.quora.com' ],
  siteUrl: 'http://www.quora.com',
  sessionCookieNames: [ 'm-s', 'm-b' ],

  identifyUser: function () {
    // Grab the user name from the header menu
    var resp = this.httpGet(this.siteUrl);
    var profile_link = resp.body.querySelector(".profile .nav_item");
    this.userName = profile_link.innerHTML;

    // Grab about page to get the profile photo if it exists
    var profile_url = profile_link.href;
    var avatar_element;
    try {
	    var profile = this.httpGet(profile_url);
	    avatar_element = profile.body.querySelector(".profile_photo .profile_photo_img").src;
    }
    catch(err) {
	    // They likley don't have a profile setup, no avatar for us :(
	    avatar_element = null;
    }
    if (avatar_element) {
	    this.userAvatar = avatar_element;
    }
  }
});
