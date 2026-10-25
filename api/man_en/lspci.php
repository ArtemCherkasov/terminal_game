<?php
$manual = <<<EOT
NAME
    lspci — list all PCI devices

SYNOPSIS
    lspci [OPTION]

DESCRIPTION
    List PCI devices.
    -v — verbose
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
