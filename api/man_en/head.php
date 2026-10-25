<?php
$manual = <<<EOT
NAME
    head — output the first lines of a file

SYNOPSIS
    head [OPTION]... [FILE]...

DESCRIPTION
    Display the first 10 lines of a file.
    -n N — show N lines
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
