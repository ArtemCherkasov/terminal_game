<?php
$manual = <<<EOT
NAME
    chown — change file owner and group

SYNOPSIS
    chown [OPTION]... OWNER[:GROUP] FILE...

DESCRIPTION
    Change file ownership.
    -R — recursive
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
