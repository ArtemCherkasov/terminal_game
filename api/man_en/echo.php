<?php
$manual = <<<EOT
NAME
    echo — display a line of text

SYNOPSIS
    echo [OPTION]... [STRING]...

DESCRIPTION
    Display the STRING(s) on standard output.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
