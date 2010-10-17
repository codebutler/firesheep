// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Flickr',
  url: 'http://www.flickr.com/me',
  domains: [ 'flickr.com' ],
  sessionCookieNames: [ 'cookie_session' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    var path = resp.request.channel.URI.path;
    this.userName = path.split('/')[2];
    this.userAvatar = resp.body.querySelector('.Buddy img').src;
  }
});
