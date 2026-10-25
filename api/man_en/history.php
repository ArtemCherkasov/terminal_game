<?php
$manual = <<<EOT
NAME
    history — display or manage the history of commands

SYNOPSIS
    history

DESCRIPTION
    Show the history of entered commands.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
