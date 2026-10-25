<?php
$manual = <<<EOT
NAME
    reboot — restart the system

SYNOPSIS
    reboot [OPTION]

DESCRIPTION
    Restart the computer.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
