<?php
$manual = <<<EOT
NAME
    chmod — change file mode bits

SYNOPSIS
    chmod [OPTION]... MODE FILE...

DESCRIPTION
    Change file access permissions.
    u+r, g-w, o= or 755
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
