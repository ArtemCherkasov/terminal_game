<?php
$manual = <<<EOT
NAME
    rsync — fast, versatile file replication

SYNOPSIS
    rsync [OPTION]... SOURCE DESTINATION

DESCRIPTION
    Synchronize files with minimal traffic.
    -a — archive mode
    -v — verbose
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
