<?php
$manual = <<<EOT
NAME
    exit — exit the shell

SYNOPSIS
    exit [CODE]

DESCRIPTION
    Exit the current shell session.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
