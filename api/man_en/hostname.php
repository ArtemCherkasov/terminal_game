<?php
$manual = <<<EOT
NAME
    hostname — show or set the system hostname

SYNOPSIS
    hostname [NAME]

DESCRIPTION
    Display or set the hostname.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
