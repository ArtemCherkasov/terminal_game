<?php
$manual = <<<EOT
NAME
    w — show who is logged on and what they are doing

SYNOPSIS
    w [USER]

DESCRIPTION
    Show users and their processes.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
