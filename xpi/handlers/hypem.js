// Authors:
// ech0 <nua@x25.cc>
register({
  name: "hypem",
  domains: [ 'hypem.com' ],
  sessionCookieNames: [ 'AUTH','ebNewBandWidth_.hypem.com' ],
  identifyUser: function () {
    var requestFuckingUrl = this.siteUrl;
    var resp = this.httpGet(requestFuckingUrl);
      this.userName = resp.body.querySelector("#menu-item-username").getAttribute('title');
      this.userAvatar = resp.body.querySelector("#menu-item-username img").src;
  }
});