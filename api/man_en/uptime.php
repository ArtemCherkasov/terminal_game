<?php
$manual = <<<EOT
NAME
    uptime — tell how long the system has been running

SYNOPSIS
    uptime

DESCRIPTION
    Show system uptime.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
