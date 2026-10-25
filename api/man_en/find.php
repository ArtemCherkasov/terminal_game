<?php
$manual = <<<EOT
NAME
    find — search for files in a directory hierarchy

SYNOPSIS
    find [PATH...] [EXPRESSION]

DESCRIPTION
    Search for files matching criteria.
    -name — by name
    -type — by type (f/d)
    -size — by size
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
