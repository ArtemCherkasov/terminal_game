<?php
$manual = <<<EOT
NAME
    curl — transfer data from or to a server

SYNOPSIS
    curl [OPTION]... URL

DESCRIPTION
    HTTP/HTTPS client.
    -X — method (GET, POST)
    -d — data
    -O — save to file
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
