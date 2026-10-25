<?php
$manual = <<<EOT
NAME
    rm — remove files or directories

SYNOPSIS
    rm [OPTION]... FILE...

DESCRIPTION
    Remove each specified FILE.
    -r, -R — recursive removal
    -f — ignore nonexistent files
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
