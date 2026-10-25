<?php
$manual = <<<EOT
NAME
    dmesg — show kernel messages

SYNOPSIS
    dmesg [OPTION]

DESCRIPTION
    Display kernel ring buffer messages.
    -H — human-readable format
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
