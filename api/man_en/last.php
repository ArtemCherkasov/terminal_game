<?php
$manual = <<<EOT
NAME
    last — show last logged in users

SYNOPSIS
    last [OPTION]... [USER]

DESCRIPTION
    Show login/logout history.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
