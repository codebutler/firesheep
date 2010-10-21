register({
  name: 'Cisco',
  url: 'http://tools.cisco.com/RPF/profile/profile_management.do',
  domains: [ 'cisco.com' ],
  sessionCookieNames: [ 'SMIDENTITY' ],
  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    var userId = resp.body.querySelectorAll('.contentbold')[0].textContent
    var realName = resp.body.querySelectorAll('.contentbold')[1].textContent
    var email = resp.body.querySelectorAll('.contentbold')[2].textContent
    this.userName = userId + " (" + realName + ")";
  }
});