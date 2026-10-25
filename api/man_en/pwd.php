<?php
$manual = <<<EOT
NAME
    pwd — print name of current/working directory

SYNOPSIS
    pwd

DESCRIPTION
    Print the full filename of the current working directory.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
