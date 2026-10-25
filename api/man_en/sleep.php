<?php
$manual = <<<EOT
NAME
    sleep — suspend execution for a time interval

SYNOPSIS
    sleep NUMBER

DESCRIPTION
    Pause execution for a number of seconds.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
