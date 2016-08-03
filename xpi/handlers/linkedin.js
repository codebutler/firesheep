// Authors:
//   Eric Butler <eric@codebutler.com>

register({
  name: 'LinkedIn',
  domains: [ 'www.linkedin.com' ],
  sessionCookieNames: [ 'bcookie' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    var photoElem = resp.body.querySelector('.member-photo');
    this.userName = photoElem.alt;
    this.userAvatar = photoElem.src;
  }
});