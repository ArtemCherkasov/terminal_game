<?php
$manual = <<<EOT
NAME
    export — set an exported shell variable or function

SYNOPSIS
    export NAME=VALUE

DESCRIPTION
    Set an environment variable.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
