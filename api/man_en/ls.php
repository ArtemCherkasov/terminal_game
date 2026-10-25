<?php
$manual = <<<EOT
NAME
    ls — list directory contents

SYNOPSIS
    ls [OPTION]... [FILE]...

DESCRIPTION
    List information about files.
    -l — use a long listing format
    -a — do not ignore entries starting with .
    -h — with -l, human-readable sizes
    -R — recursive
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
