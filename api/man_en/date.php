<?php
$manual = <<<EOT
NAME
    date — print or set system date and time

SYNOPSIS
    date [FORMAT]

DESCRIPTION
    Display or set system date.
    '+%Y-%m-%d' — output format
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
