register({
    name: "StackOverflow",
    domains: [ 'stackoverflow.com' ],
    sessionCookieNames: [ 'usr', 'gauthed' ],
    identifyUser: function () {
        var main_page = this.httpGet(this.siteUrl);
        this.userName = main_page.body.querySelectorAll('span#hlinks-user a')[1].textContent;

        /*
        var profile = this.httpGet(main_page.body.querySelectorAll('span#hlinks-user a')[1].href); // Can't get this to work.  Doesn't appear to have an href attribute
        // Grab the profile link from the search
        // page for later
        this.userAvatar = profile.body.querySelector('user-avatar img').src;
         */
    }
});
