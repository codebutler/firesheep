// Authors:
//   Ian Gallagher
register({
  name: 'Quora',
  domains: [ 'www.quora.com' ],
  siteUrl: 'http://www.quora.com',
  sessionCookieNames: [ 'm-s', 'm-b' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl + '/settings');
    var nameElem = resp.body.querySelector("li.profile a.nav_item");
    if (nameElem) {      
      this.userName = nameElem.innerHTML;
    }
  }
});
