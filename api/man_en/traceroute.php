<?php
$manual = <<<EOT
NAME
    traceroute — print the route packets trace to network host

SYNOPSIS
    traceroute HOST

DESCRIPTION
    Trace the path packets take to a host.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
