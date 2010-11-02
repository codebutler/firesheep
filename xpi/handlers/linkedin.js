// Author
// Romain Wartel <Romain@Wartel.net>
register({
  name: 'LinkedIn',
  url: 'http://www.linkedin.com/nhome/',
  domains: [ 'linkedin.com'],
  sessionCookieNames: [ '__utma', '__utmb', '__utmc', '__utmz', '__utmv',   '__qca' ],

  identifyUser: function () {
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('.username').textContent;
  }
});
