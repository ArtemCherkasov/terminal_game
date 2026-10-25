<?php
$manual = <<<EOT
NAME
    sort — sort lines of text files

SYNOPSIS
    sort [OPTION]... [FILE]...

DESCRIPTION
    Sort lines alphabetically.
    -r — reverse
    -n — numeric sort
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
