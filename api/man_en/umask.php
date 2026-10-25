<?php
$manual = <<<EOT
NAME
    umask — set file creation mask

SYNOPSIS
    umask [MODE]

DESCRIPTION
    Set default permissions for new files.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
