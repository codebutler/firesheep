<?php

//Wraps the properties of a user
class User
{
    var $id;
    var $name;
    var $avatarUrl;
    var $site;
    var $siteUrl;
    var $timeLastChecked;
    var $cookieNames = array();
    var $cookieValues = array();

    function User($id, $name, $avatarUrl, $site, $siteUrl, $timeLastChecked, $cookieName, $cookieValue)
    {
        $this->id = $id;
        $this->name = $name;
        $this->avatarUrl = $avatarUrl;
        $this->site = $site;
        $this->siteUrl = $siteUrl;
        $this->timeLastChecked = $timeLastChecked;
        array_push($this->cookieNames, $cookieName);
        array_push($this->cookieValues, $cookieValue);
    }

    function AddCookie($cookieName, $cookieValue)
    {
        if(!in_array($cookieName, $this->cookieNames))
        {
            array_push($this->cookieNames, $cookieName);
            array_push($this->cookieValues, $cookieValue);
        }
    }

    function Expired()
    {
        $cookieString = "";// "Cookie: ";
        for($i = 0; $i < count($this->cookieNames); $i++)
        {
            if($i != 0)
                $cookieString .= "; ";
            $cookieString .= $this->cookieNames[$i] . "=" . $this->cookieValues[$i];
        }
//        $cookieString .= "\r\n";

/*
        // Create a stream
        $opts = array(
          'http'=>array(
            'method'=>"GET",
            'header'=>"Accept-language: en\r\n" .
              $cookieString . 
              "User-Agent: Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.2.12) Gecko/20101027 Ubuntu/10.04 (lucid) Firefox/3.6.12\r\n"
              )
            );


        $context = stream_context_create($opts);
        $file = file_get_contents($this->siteUrl, false, $context);
        return strpos($http_response_header[0], "200 OK"
*/

        $handle = curl_init($this->siteUrl);
        curl_setopt($handle,  CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($handle, CURLOPT_COOKIE, $cookieString);
        curl_setopt($handle, CURLOPT_USERAGENT, 
                "Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.2.12) Gecko/20101027 Ubuntu/10.04 (lucid) Firefox/3.6.12");

        $response = curl_exec($handle);
        $httpCode = curl_getinfo($handle, CURLINFO_HTTP_CODE);//Get the HTTP Status Code
        curl_close($handle);

        if($httpCode == 200)
            return 0;
        else
            return 1;
    }
}






?>
