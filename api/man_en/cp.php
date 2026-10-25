<?php
$manual = <<<EOT
NAME
    cp — copy files and directories

SYNOPSIS
    cp [OPTION]... SOURCE DESTINATION

DESCRIPTION
    Copy files and directories.
    -r — recursive
    -i — prompt before overwrite
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
