<?php
$manual = <<<EOT
NAME
    fsck — check and repair a Linux filesystem

SYNOPSIS
    fsck [OPTION] DEVICE

DESCRIPTION
    Check filesystem integrity.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
