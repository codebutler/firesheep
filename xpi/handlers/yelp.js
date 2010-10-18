// Authors:
//   Ian Gallagher <crash@neg9.org>

register({
  name: 'Yelp',
  url: 'http://www.yelp.com/',
  domains: [ 'yelp.com' ],
  // Google Analytics cookie __utma is supposed to stay the same forever per user/domain.
  // This does however break if a Yelp user logs out, you'll have to start a new capture.
  sessionCookieNames: [ '__utma' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('#user_identify .header-link').textContent;
    this.userAvatar = resp.body.querySelector('.pB-ss img').src;
  }
});
