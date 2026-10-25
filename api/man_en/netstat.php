<?php
$manual = <<<EOT
NAME
    netstat — print network connections

SYNOPSIS
    netstat [OPTION]

DESCRIPTION
    Show network connections, routing tables.
    -tlnp — open ports
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
