<?php

require_once("database.php"); 

if(isset($_POST['userId']) && isset($_POST['username']))
{
    Database::FixUsername($_POST['userId'], $_POST['username']);
    header( 'Location: browse.php' );
}
else
    echo "Bad userId or username";


?>
