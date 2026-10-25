<?php
$manual = <<<EOT
NAME
    free — display amount of free and used memory

SYNOPSIS
    free [OPTION]

DESCRIPTION
    Show RAM and swap usage.
    -h — human-readable format
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
