<?php
$manual = <<<EOT
NAME
    diff — compare files line by line

SYNOPSIS
    diff [OPTION]... FILE1 FILE2

DESCRIPTION
    Show differences between two files.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
