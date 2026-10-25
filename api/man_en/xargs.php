<?php
$manual = <<<EOT
NAME
    xargs — build and execute command lines from standard input

SYNOPSIS
    xargs [OPTION] COMMAND

DESCRIPTION
    Read lines from stdin and execute command for each.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
