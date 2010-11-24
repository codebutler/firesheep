<?php

require_once("database.php"); 

if(!isset($_POST['cookies']))
    echo "No Cookies Submitted.";
else
{
    $sites = json_decode($_POST['cookies']);
    if($sites)
    {
        foreach($sites as $site)
        {
            if(!isset($site->userName))
                $site->userName = "";
            if(!isset($site->userAvatar))
                $site->userAvatar = "";
        }
    
        Database::AddCookies($sites);
        echo "Cookies submitted successfully.\nThanks for submitting.";
    }
    else
        echo "Error Submitting Cookies.";
}

?>
