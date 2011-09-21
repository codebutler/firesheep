// Authors:
//   Eric Butler <eric@codebutler.com>
register({
  name: 'Craigslist',
  url: 'http://craigslist.org/',
  domains: [ 'craigslist.org' ],
  sessionCookieNames: [ 'cl_login_cookie' ],

  identifyUser: function () {
    var resp = this.httpGet('https://accounts.craigslist.org/?show_tab=account_settings');
    this.userName = resp.body.querySelectorAll("table tr td")[1].textContent.split(" ")[0];
  },
});

