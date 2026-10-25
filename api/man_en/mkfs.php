<?php
$manual = <<<EOT
NAME
    mkfs — create a Linux filesystem

SYNOPSIS
    mkfs -t TYPE DEVICE

DESCRIPTION
    Create a filesystem on a device.
    -t ext4 — filesystem type
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
