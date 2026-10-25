<?php
$manual = <<<EOT
NAME
    comm — compare two sorted files line by line

SYNOPSIS
    comm [OPTION]... FILE1 FILE2

DESCRIPTION
    Show lines common or unique to two files.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
