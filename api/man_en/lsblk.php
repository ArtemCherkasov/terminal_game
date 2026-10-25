<?php
$manual = <<<EOT
NAME
    lsblk — list block devices

SYNOPSIS
    lsblk [OPTION]

DESCRIPTION
    List disks and partitions.
    -f — filesystem info
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
