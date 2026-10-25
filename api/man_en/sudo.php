<?php
$manual = <<<EOT
NAME
    sudo — execute a command as another user

SYNOPSIS
    sudo [OPTION]... COMMAND

DESCRIPTION
    Execute a command as root or another user.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
