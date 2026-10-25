<?php
$manual = <<<EOT
NAME
    wc — print newline, word, and byte counts

SYNOPSIS
    wc [OPTION]... [FILE]...

DESCRIPTION
    Count lines, words, and bytes.
    -l — lines only
    -w — words only
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
