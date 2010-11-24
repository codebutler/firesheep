<?

require_once("user.php");
require_once("mysql.php");

//Wraps the mysql class to provide a buisness logic layer 
class Database
{ 
    public static function AddCookies($sites)
    {
        foreach($sites as $site) #for each site
        {
            $siteId = self::AddSite($site->siteName, $site->siteUrl);
            if(self::AreCookiesAlreadyPresent($siteId, $site))
            {                
                echo "These cookies are already present in the database.  Thanks anyways.\n";
                continue;
            }

            $userId = self::AddUser($siteId, $site->userName, $site->userAvatar);#Add the user to the database
            foreach($site->cookies as $cookie) #for each cookie 
                self::AddCookie($userId, $cookie->cookieName, $cookie->cookieValue);
        }
    }

    public static function GetAllUsers()
    {
        global $db;

        $users = array();
        $query = "SELECT Users.userId as userId, Users.name as username, Users.avatarUrl as avatarUrl, 
                        Sites.name as site, Sites.url as url, Users.lastTimeChecked as lastTimeChecked,
                        Cookies.name as cookieName, Cookies.value as cookieValue FROM `Cookies`  
                 JOIN Users on Users.userId = Cookies.userId
                 JOIN Sites on Sites.siteId = Users.siteId
                 WHERE Users.expired = 0";

        $queryLink = $db->query($query);
        
        while($results = $db->fetch_assoc($queryLink))
        {
            $userId = $results['userId'];
            if(isset($users[$userId]))
                $users[$userId]->AddCookie($results['cookieName'],$results['cookieValue']);
            else
                $users[$userId] = new User($userId, $results['username'],$results['avatarUrl'],$results['site'],$results['url'],
                                           $results['lastTimeChecked'],$results['cookieName'],$results['cookieValue']);
        }

        return $users;
    }

    public static function FixUsername($userId, $username)
    {
        global $db;
        $query = "UPDATE Users SET Users.name = '" . mysql_real_escape_string($username) . "' " .
                 "WHERE Users.userId = " . mysql_real_escape_string($userId);
        $db->query($query);
    }

    public static function UpdateUser($userId, $timeChecked, $expired)
    {
        global $db;
        $query = "UPDATE Users " .
                    "SET Users.lastTimeChecked = '" . mysql_real_escape_string($timeChecked) . "', " .
                    "    Users.expired = " . mysql_real_escape_string($expired) . " " .
                 "WHERE Users.userId = " . mysql_real_escape_string($userId);
        $db->query($query);
    }

    private static function AddSite($siteName, $siteUrl)
    {
        global $db;
        $query = "SELECT siteId FROM Sites WHERE url = '" . mysql_real_escape_string($siteUrl) . "'";
        $queryLink = $db->query($query);#Look for the url to see if the site is already  there
        if($db->num_rows($queryLink) != 0)
        {
            echo "$siteName is already in the database\n";
            $results = $db->fetch_row($queryLink);
            $siteId = $results[0];
        }
        else
        {
            echo "Adding $siteName to the database\n";
            $query = "INSERT INTO Sites (name, url) VALUES ('" . mysql_real_escape_string($siteName) . "','" .
                        mysql_real_escape_string($siteUrl) . "')";
            $queryLink = $db->query($query);
            $siteId = $db->insert_id();
        }

        return $siteId;
    }

    private static function AreCookiesAlreadyPresent($siteId, $site)
    {
        global $db;

        $query = "
SELECT CookieId FROM `Cookies` 
    JOIN Users on Users.userId = Cookies.userId
    JOIN Sites on Sites.siteId = Users.siteId
WHERE Sites.siteId = $siteId AND ("; //Look for the cookies on the site, so we can make sure they're new

        for($i = 0; $i < count($site->cookies); $i++) #for each cookie
        {
            $query .= "(Cookies.name = '" . mysql_real_escape_string($site->cookies[$i]->cookieName) . 
                             "' AND Cookies.value = '" . mysql_real_escape_string($site->cookies[$i]->cookieValue) . "') OR ";
        }
        $query = substr($query, 0, strlen($query) - 3) . ") AND Users.expired = 0"; //Remove the 'OR ' from the end

        $queryLink = $db->query($query);
        if($db->num_rows($queryLink) >= count($site->cookies))
            return true;
        else
            return false;
    }

    private static function AddCookie($userId, $cookieName, $cookieValue)
    {
        global $db;
        $query = "INSERT INTO Cookies (userId, name, value) VALUES ($userId, '" . 
                mysql_real_escape_string($cookieName) . "', '" . 
                mysql_real_escape_string($cookieValue) . "');";
        $db->query($query);
    }

    private static function AddUser($siteId, $userName, $userAvatar)
    {
        global $db;
        $query = "INSERT INTO Users (siteId, name, avatarUrl) VALUES ($siteId, '" . 
                mysql_real_escape_string($userName) . "', '" . 
                mysql_real_escape_string($userAvatar) . "');";
        $db->query($query);
        $userId = $db->insert_id();
        if($userName == "")
            echo "Unknown Users has user index #$userId\n";
        else
            echo "User '$userName' has user index #$userId\n";
        return $userId;
    }
}

?>  
