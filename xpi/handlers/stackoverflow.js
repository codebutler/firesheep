// Authors:
//   Nick Presta <nick@nickpresta.ca>

register({
  name: "StackOverflow",
  domains: [ 'stackoverflow.com' ],
  sessionCookieNames: [ 'usr', 'gauthed' ],
  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelectorAll('span#hlinks-user a')[1].textContent;
  }
});