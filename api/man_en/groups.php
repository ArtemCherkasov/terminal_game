<?php
$manual = <<<EOT
NAME
    groups — print group memberships

SYNOPSIS
    groups [USER]

DESCRIPTION
    Show groups for a user.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
