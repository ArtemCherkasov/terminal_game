<?php
$manual = <<<EOT
NAME
    alias — set an alias for specified command

SYNOPSIS
    alias [NAME=VALUE]

DESCRIPTION
    Create a shortcut for a command.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
