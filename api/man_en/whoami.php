<?php
$manual = <<<EOT
NAME
    whoami — print effective userid

SYNOPSIS
    whoami

DESCRIPTION
    Display the current username.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
