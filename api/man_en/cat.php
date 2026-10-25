<?php
$manual = <<<EOT
NAME
    cat — concatenate files and print on the standard output

SYNOPSIS
    cat [OPTION]... [FILE]...

DESCRIPTION
    Display the contents of files.
    -n — number all output lines
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
