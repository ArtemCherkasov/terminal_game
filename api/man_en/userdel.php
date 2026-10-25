<?php
$manual = <<<EOT
NAME
    userdel — delete a user account

SYNOPSIS
    userdel [OPTION] NAME

DESCRIPTION
    Remove a user account.
    -r — remove home directory
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
