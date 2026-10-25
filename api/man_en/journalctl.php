<?php
$manual = <<<EOT
NAME
    journalctl — query and display messages from the systemd journal

SYNOPSIS
    journalctl [OPTION]

DESCRIPTION
    View systemd logs.
    -xe — recent messages with context
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
