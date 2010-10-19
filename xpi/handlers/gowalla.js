// Authors:
//   Ian Gallagher <crash@neg9.org>

register({
  name: 'Gowalla',
  url: 'https://gowalla.com/home',
  domains: [ 'gowalla.com' ],
  sessionCookieNames: [ '__utma' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelectorAll('.contentnode a')[1].textContent;
  }
});
