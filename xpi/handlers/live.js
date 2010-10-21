// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'Windows Live',
  url: 'http://live.com',
  domains: [ 'live.com' ],
  sessionCookieNames: [
	  'MSPProf',
	  'MSPAuth',
	  'RPSTAuth',
	  'NAP',
	  /*
	  'BP',
	  'MH',
	  'LD',
	  'mkt0',
	  'wlidperf',
	  'ANON',
	  'MUID',
	  'wlp',
	  //'UIC',
	  'wla42',
	  'HIC'
	  */
	  ],

  identifyUser: function () {
    //var resp = this.httpGet(this.siteUrl);
    //this.userName = resp.body.querySelector("#idWinLiveIdValue").textContent.trim();
    this.userName = "Alice, or perhaps Bob";
  }
});
