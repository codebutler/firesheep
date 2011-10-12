// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Amazon.com',
  url: 'http://www.amazon.com/',
  domains: [ 'amazon.com' ],
  sessionCookieNames: [ 'x-main' ],

  identifyUser: function() {
    var resp = this.httpGet(this.siteUrl);

    var newElem = this.userName = resp.body.querySelector("#nav-your-account .nav-button-title em");
    if(newElem != null)
      this.userName = newElem.textContent;
    else
      this.userName = resp.body.querySelector(".navGreeting").textContent.split(', ')[1].slice(0, -1);
  }
});
