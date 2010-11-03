// Authors:
//   Eric Butler <eric@codebutler.com>
Components.utils.import('resource://firesheep/util/RailsHelper.js');

register({
  name: 'Twitter',
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
  },
  getAuthConnections: function() {
    var resp = this.httpGet('http://twitter.com/settings/connections');
    var connectionElements = resp.body.querySelectorAll("ul>li.oauth-application");
    var connections = new Array();
    for (var i = 0; i < connectionElements.length; i++) {
		var connection = new Array();
		connection['url'] = connectionElements[i].children[0].attributes.getNamedItem("href").value;
		connection['image'] = connectionElements[i].children[0].children[0].attributes.getNamedItem("src").value;
		connections.push(connection);
		connectionElements[i].attributes;
	  }
	this.connections = connections;
  }
  
});