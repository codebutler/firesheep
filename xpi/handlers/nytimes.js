// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'New York Times',
  domains: [ 'nytimes.com' ],
  sessionCookieNames: [ 'NYT-S', 'nyt-d' ],

  processPacket: function () {
    var nyt_d = this.firstPacket.cookies['nyt-d'];
    this.id = nyt_d;
  },

  identifyUser: function() {
    this.siteUrl = 'http://www.nytimes.com/';
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelectorAll("#memberTools a")[1].innerHTML;
  }
});
