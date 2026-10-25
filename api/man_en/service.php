<?php
$manual = <<<EOT
NAME
    service — run a SysV init script

SYNOPSIS
    service NAME COMMAND

DESCRIPTION
    Manage services (start/stop/restart/status).
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
