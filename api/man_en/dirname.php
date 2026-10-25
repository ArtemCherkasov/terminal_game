<?php
$manual = <<<EOT
NAME
    dirname — strip last component from file name

SYNOPSIS
    dirname PATH

DESCRIPTION
    Extract the directory path from a full path.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
