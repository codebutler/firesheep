// Authors:
//   Eric Butler <eric@codebutler.com>

register({
  name: 'Posterous',

  matchPacket: function (packet) {
    if (packet.cookies['_sharebymail_session_id'] && packet.cookies['posterous_mp']) {
      var data = JSON.parse(unescape(packet.cookies['posterous_mp']));
      return data.all && data.all.registered == "true";
    }
    return false;
  },

  processPacket: function () {
    this.sessionId = this.firstPacket.cookies['_sharebymail_session_id'];
  },

  identifyUser: function () {
    var resp = this.httpGet('http://posterous.com/manage/settings/contact');
    var firstName = resp.body.querySelector('#user_firstname').value;
    var lastName  = resp.body.querySelector('#user_lastname').value;
  
    this.userName   = firstName + ' ' + lastName;
    this.userAvatar = resp.body.querySelector('img[alt="user photo"]').src;
  }
});
