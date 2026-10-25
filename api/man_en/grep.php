<?php
$manual = <<<EOT
NAME
    grep — print lines matching a pattern

SYNOPSIS
    grep [OPTION]... PATTERN [FILE]...

DESCRIPTION
    Search for lines matching a pattern.
    -i — ignore case
    -r — recursive
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
