// Authors:
//   Eric Butler <eric@codebutler.com>
//   Ian Gallagher <crash@neg9.org>
Components.utils.import('resource://firesheep/util/RailsHelper.js');

register({
  name: 'Twitter',
  url: 'https://twitter.com/',
  domains: [ 'twitter.com' ],
  sessionCookieNames: [ '_twitter_sess', 'auth_token' ],

  processPacket: function () {
    var cookie = this.firstPacket.cookies['_twitter_sess'];

    var railsSession = RailsHelper.parseSessionCookie(cookie);

    // A Twitter session cookie contains information other than just user id,
    // and is constantly changing. Override ID to include only user info, 
    // avoiding duplicate results for the same person.
    this.sessionId = railsSession.user + railsSession.password_token;
    
    // Store around for debugging purposes.
    this.firstPacket._twitter_sess = railsSession;
  },

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    if (resp.body.querySelector('#me_name')) {    
      // Old Twitter
      this.userName   = resp.body.querySelector('#me_name').innerHTML;
      this.userAvatar = resp.body.querySelector('.user_icon img').src;
    } else {
      // New Twitter
      this.userName   = resp.body.querySelector('#screen-name').innerHTML.replace(/^\s+|\s+$/g, "");
      this.userAvatar = resp.body.querySelector('#profile-image img').src;
    }
  }
});
