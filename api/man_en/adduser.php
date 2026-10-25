<?php
$manual = <<<EOT
NAME
    adduser — create a new user

SYNOPSIS
    adduser NAME

DESCRIPTION
    Create a new user account.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
