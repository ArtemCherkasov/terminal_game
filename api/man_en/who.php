<?php
$manual = <<<EOT
NAME
    who — show who is logged on

SYNOPSIS
    who [OPTION]...

DESCRIPTION
    Show logged-in users.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
