<?php
$manual = <<<EOT
NAME
    wget — non-interactive web file retriever

SYNOPSIS
    wget [OPTION]... URL

DESCRIPTION
    Download files over HTTP, HTTPS, FTP.
    -O — output file
    -c — continue download
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
