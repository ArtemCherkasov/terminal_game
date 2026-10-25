<?php
$manual = <<<EOT
NAME
    which — locate a command

SYNOPSIS
    which COMMAND...

DESCRIPTION
    Show the full path of commands.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
