<?php
$manual = <<<EOT
NAME
    ifconfig — configure a network interface

SYNOPSIS
    ifconfig [INTERFACE]

DESCRIPTION
    Configure and view network interfaces.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
