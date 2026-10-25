<?php
$manual = <<<EOT
NAME
    umount — unmount a filesystem

SYNOPSIS
    umount [OPTION] MOUNTPOINT

DESCRIPTION
    Unmount a filesystem.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
