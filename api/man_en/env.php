<?php
$manual = <<<EOT
NAME
    env — run a command in a modified environment

SYNOPSIS
    env [OPTION]

DESCRIPTION
    Display all environment variables.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
