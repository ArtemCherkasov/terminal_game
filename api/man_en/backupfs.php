<?php
$manual = <<<EOT
NAME
    backupfs — restore filesystem to backup state

SYNOPSIS
    backupfs

DESCRIPTION
    Restores the virtual filesystem to the original clean state as it
    was when the system booted. All user-created files and directories
    will be removed.

NOTE
    This action is irreversible. All changes made since boot will be lost.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
