<?php
$manual = <<<EOT
NAME
    touch — change file timestamps or create empty files

SYNOPSIS
    touch [OPTION]... FILE...

DESCRIPTION
    Create empty files or update timestamps.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
