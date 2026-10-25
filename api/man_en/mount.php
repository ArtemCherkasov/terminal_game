<?php
$manual = <<<EOT
NAME
    mount — mount a filesystem

SYNOPSIS
    mount [OPTION] DEVICE MOUNTPOINT

DESCRIPTION
    Mount a device at a mount point.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
