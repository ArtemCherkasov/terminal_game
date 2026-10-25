<?php
$manual = <<<EOT
NAME
    dig — DNS lookup utility

SYNOPSIS
    dig [HOST] [RECORD_TYPE]

DESCRIPTION
    Detailed DNS query.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
