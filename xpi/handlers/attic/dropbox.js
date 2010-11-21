// Authors:
//   Ian Gallagher <crash@neg9.org>
// Dropbox seems to have recently started issuing cookies with the Secure flag set,
// so this handler will not be too useful. But for people who have login sessions
// more than a few weeks old at the time of it's writing, or just something odd that
// happens, it will work.

register({
  name: 'Dropbox',
  url: 'https://www.dropbox.com/home#:::',
  domains: [ 'dropbox.com' ],
  sessionCookieNames: [ 'lid' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector("#topnav strong").textContent;
  }
});
