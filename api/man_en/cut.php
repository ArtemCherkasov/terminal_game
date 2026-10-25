<?php
$manual = <<<EOT
NAME
    cut — remove sections from each line of files

SYNOPSIS
    cut OPTIONS... [FILE]...

DESCRIPTION
    Remove sections from each line.
    -d — delimiter
    -f — fields
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
