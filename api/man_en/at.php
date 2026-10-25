<?php
$manual = <<<EOT
NAME
    at — execute commands at a specified time

SYNOPSIS
    at TIME

DESCRIPTION
    Execute a command at a specific time.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
