<?php
$manual = <<<EOT
NAME
    uname — print system information

SYNOPSIS
    uname [OPTION]

DESCRIPTION
    Display kernel and architecture info.
    -a — all information
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
