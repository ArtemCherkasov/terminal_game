<?php
$manual = <<<EOT
NAME
    id — print user and group information

SYNOPSIS
    id [USER]

DESCRIPTION
    Display user and group IDs.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
