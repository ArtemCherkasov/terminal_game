<?php
$manual = <<<EOT
NAME
    tee — read from standard input and write to standard output and files

SYNOPSIS
    tee [OPTION]... [FILE]...

DESCRIPTION
    Duplicate input.
    -a — append to files
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
