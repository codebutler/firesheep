// Authors:
//   Ian Gallagher <crash@neg9.org>
register({
  name: 'ToorCon: San Diego',
  domains: [ 'sandiego.toorcon.org' ],
  sessionCookieNames: [ '8cbdc47e247b091e401585ac21099eb6' ],
  spoofUserAgent: true,

  identifyUser: function () {
    var resp = this.httpGet('http://sandiego.toorcon.org/index.php?option=com_comprofiler');
    this.userName = resp.body.querySelector("#cbProfileTitle").textContent.replace(/ Profile Page$/g, "");
    this.userAvatar = resp.body.querySelector('.cbPosMiddle img').src;
  }
});
