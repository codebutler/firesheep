// Authors:
//   Joe Basirico <joe@whoisjoe.net>
register({
  name: 'tumblr.com',
  url: 'http://www.tumblr.com/',
  icon: 'http://assets.tumblr.com/images/favicon.gif?2',
  domains: [ 'tumblr.com' ],
  sessionCookieNames: [ 'pfp' ],

  identifyUser: function() {
    var prefs = this.httpGet(this.siteUrl + 'preferences');
    this.userName = prefs.body.querySelector('input#user_email.text_field').value;
	
	//todo add code to grab usericon
	}
});