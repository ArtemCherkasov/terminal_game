<?php
$manual = <<<EOT
NAME
    shutdown — shut down the system

SYNOPSIS
    shutdown [OPTION] [TIME]

DESCRIPTION
    Shut down or reboot the system.
    -h now — halt now
    -r now — reboot
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
