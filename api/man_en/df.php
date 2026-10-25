<?php
$manual = <<<EOT
NAME
    df — report file system disk space usage

SYNOPSIS
    df [OPTION]... [FILE]

DESCRIPTION
    Display free and used disk space.
    -h — human-readable format
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
