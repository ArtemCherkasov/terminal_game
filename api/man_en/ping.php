<?php
$manual = <<<EOT
NAME
    ping — send ICMP ECHO_REQUEST to network hosts

SYNOPSIS
    ping [OPTION] HOST

DESCRIPTION
    Test network connectivity.
    -c N — number of requests
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
