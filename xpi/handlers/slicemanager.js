// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Slicehost SliceManager',
  url: 'https://manage.slicehost.com/slices',
  domains: [ 'manage.slicehost.com' ],
  sessionCookieNames: [ '_coach_session_id' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector("#welcome a").textContent;
  }
});
