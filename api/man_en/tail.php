<?php
$manual = <<<EOT
NAME
    tail — output the last lines of a file

SYNOPSIS
    tail [OPTION]... [FILE]...

DESCRIPTION
    Display the last 10 lines of a file.
    -f — follow appended data
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
