<?php
$manual = <<<EOT
NAME
    host — DNS lookup utility

SYNOPSIS
    host HOST

DESCRIPTION
    Simple DNS query, returns IP address.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
