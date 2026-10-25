<?php
$manual = <<<EOT
NAME
    users — show who is currently logged in

SYNOPSIS
    users

DESCRIPTION
    Display logged-in usernames.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
