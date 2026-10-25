<?php
$manual = <<<EOT
NAME
    ip — show / manipulate routing, devices, policy routing

SYNOPSIS
    ip [OBJECT] [COMMAND]

DESCRIPTION
    Configure network interfaces.
    ip addr show — show IP
    ip link set — configure
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
