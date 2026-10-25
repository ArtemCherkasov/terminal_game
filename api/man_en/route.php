<?php
$manual = <<<EOT
NAME
    route — show / manipulate the IP routing table

SYNOPSIS
    route [OPTION]

DESCRIPTION
    Show and manage routing table.
    -n — numeric format
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
