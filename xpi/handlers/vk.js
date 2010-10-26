// Authors:
//   ech0 <nua@x25.cc>
register({
  name: 'vkontakte',
  domains: [ 'vkontakte.ru', 'vk.com' ],
  sessionCookieNames: [ 'remixchk', 'remixsid' ],

  identifyUser: function () {
    var requestFuckingUrl = this.siteUrl + "/profileEdit.php?page=photo";
    var resp = this.httpGet(requestFuckingUrl);
    this.userName = resp.body.querySelector('#home a').innerHTML;
 //getAttribute('href');
      this.userAvatar = resp.body.querySelector("input[name='a_photo']").value;
  }
});