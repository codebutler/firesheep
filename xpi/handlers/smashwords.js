// Authors:
// Dustin Brewer <mannkind@gmail.com>
register({
  name: 'Smashwords',
  url: 'http://www.smashwords.com/profile',
  domains: [ 'smashwords.com' ],
  sessionCookieNames: [ 'sw', 'smashinflogin' ],

  identifyUser: function () { 
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('div#pageContent h1').textContent.trim();
    this.userAvatar = resp.body.querySelector('div.leftSideBox div img').src;
  }
});
