// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Vimeo',
  domains: [ 'vimeo.com' ],
  sessionCookieNames: [ 'vimeo' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName   = resp.body.querySelector('h1 strong').textContent;
    this.userAvatar = resp.body.querySelector('#menudo_portrait').src;
  },
});
