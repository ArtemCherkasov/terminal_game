<?php
$manual = <<<EOT
NAME
    uniq — report or omit repeated lines

SYNOPSIS
    uniq [OPTION]... [INPUT [OUTPUT]]

DESCRIPTION
    Remove duplicate lines.
    -d — show only duplicates
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
