<?php
$manual = <<<EOT
NAME
    usermod — modify a user account

SYNOPSIS
    usermod [OPTION] NAME

DESCRIPTION
    Modify user account properties.
    -aG — add to group
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
