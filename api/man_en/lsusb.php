<?php
$manual = <<<EOT
NAME
    lsusb — list USB devices

SYNOPSIS
    lsusb [OPTION]

DESCRIPTION
    List USB devices.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
