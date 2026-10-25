<?php
$manual = <<<EOT
NAME
    ss — another utility for investigating sockets

SYNOPSIS
    ss [OPTION]

DESCRIPTION
    Modern replacement for netstat.
    -tlnp — open TCP ports
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
