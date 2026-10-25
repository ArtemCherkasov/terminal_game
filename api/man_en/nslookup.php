<?php
$manual = <<<EOT
NAME
    nslookup — query Internet name servers

SYNOPSIS
    nslookup HOST

DESCRIPTION
    Query DNS records for a host.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
