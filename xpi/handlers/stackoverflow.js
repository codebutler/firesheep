// Authors:
//   Nick Presta <nick@nickpresta.ca>
//   Eric Butler <eric@codebutler.com>

Components.utils.import('resource://firesheep/util/Utils.js');

register({
  name: "Stack Overflow",
  domains: [ 'stackoverflow.com' ],
  sessionCookieNames: [ 'usr' ],
  identifyUser: function () {
    this.sessionId = Utils.parseQuery(this.firstPacket.cookies['usr'])['s'];
  
    var resp = this.httpGet(this.siteUrl);
    this.userName = resp.body.querySelector('span#hlinks-user a.profile-link').textContent;
  }
});