<?php
$manual = <<<EOT
NAME
    nohup — run a command immune to hangups

SYNOPSIS
    nohup COMMAND [ARGUMENTS]

DESCRIPTION
    Run a process immune to terminal close.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
