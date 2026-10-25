<?php
$manual = <<<EOT
NAME
    systemctl — control the systemd system and service manager

SYNOPSIS
    systemctl [OPTION] COMMAND [SERVICE]

DESCRIPTION
    Manage systemd services.
    start/stop/restart/status/enable
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
