<?php
$manual = <<<EOT
NAME
    top — display Linux processes

SYNOPSIS
    top [OPTION]

DESCRIPTION
    Dynamic real-time process viewer. q — quit.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
