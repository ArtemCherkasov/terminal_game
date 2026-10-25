<?php
$manual = <<<EOT
NAME
    source — execute commands from a file in the current shell

SYNOPSIS
    source FILE

DESCRIPTION
    Execute commands from a file in the current shell.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
