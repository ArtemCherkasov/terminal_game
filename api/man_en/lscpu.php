<?php
$manual = <<<EOT
NAME
    lscpu — display CPU architecture info

SYNOPSIS
    lscpu

DESCRIPTION
    Show CPU cores, threads, architecture.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
