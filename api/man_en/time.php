<?php
$manual = <<<EOT
NAME
    time — time a simple command or give report on resource usage

SYNOPSIS
    time COMMAND

DESCRIPTION
    Display the execution time of a command.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
