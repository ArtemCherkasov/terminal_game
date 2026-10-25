<?php
$manual = <<<EOT
NAME
    clear — clear the terminal screen

SYNOPSIS
    clear

DESCRIPTION
    Clear the terminal display.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
