<?php
$manual = <<<EOT
NAME
    ps — report a snapshot of current processes

SYNOPSIS
    ps [OPTION]...

DESCRIPTION
    Display process information.
    aux — all users, full format
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
