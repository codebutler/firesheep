#!/usr/bin/php
<?php

require_once("database.php"); 

$users = Database::GetAllUsers();
$i = 0;
foreach($users as $user)
{
    $expired = $user->Expired();
    echo $user->name . "=$expired\n";
    Database::UpdateUser($user->id, date_format(date_create(), 'Y-m-d H:i:s'), $expired);
}

?>
