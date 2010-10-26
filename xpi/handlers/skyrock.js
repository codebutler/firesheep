// Authors:
//   Frank Denis <fdenis at skyrock.com>

register({
  name: "Skyrock",
  domains: [ "skyrock.com" ],
  sessionCookieNames: [ "PHPSESSID", "locale", "connected" ],
  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName   = resp.body.querySelector('.logout a strong').innerHTML;
    this.userAvatar = resp.body.querySelector('#barrenoire_account_link img.avatar').src;
  }
});
