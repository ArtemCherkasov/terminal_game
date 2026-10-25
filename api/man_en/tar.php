<?php
$manual = <<<EOT
NAME
    tar — tape archive

SYNOPSIS
    tar [OPTION]... [FILE]...

DESCRIPTION
    Create and extract archives.
    -c — create
    -x — extract
    -f — specify archive file
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
