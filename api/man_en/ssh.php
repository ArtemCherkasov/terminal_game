<?php
$manual = <<<EOT
NAME
    ssh — open shell on remote machine

SYNOPSIS
    ssh [OPTION] USER@HOST

DESCRIPTION
    Secure remote login.
    -p PORT — specify port
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
