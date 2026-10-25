<?php
$manual = <<<EOT
NAME
    passwd — change user password

SYNOPSIS
    passwd [USER]

DESCRIPTION
    Change user password.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
