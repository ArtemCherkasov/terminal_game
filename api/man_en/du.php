<?php
$manual = <<<EOT
NAME
    du — estimate file space usage

SYNOPSIS
    du [OPTION]... [FILE]...

DESCRIPTION
    Estimate file and directory sizes.
    -sh — summary for directory
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
