<?php
$manual = <<<EOT
NAME
    kill — terminate a process

SYNOPSIS
    kill [SIGNAL] PID

DESCRIPTION
    Send a signal to a process.
    -9 (SIGKILL) — force kill
    -15 (SIGTERM) — graceful termination
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
