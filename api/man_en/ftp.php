<?php
$manual = <<<EOT
NAME
    ftp — file transfer program

SYNOPSIS
    ftp HOST

DESCRIPTION
    Connect to FTP server.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
