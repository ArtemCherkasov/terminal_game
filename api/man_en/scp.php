<?php
$manual = <<<EOT
NAME
    scp — secure copy

SYNOPSIS
    scp [OPTION] SOURCE DESTINATION

DESCRIPTION
    Copy files over SSH.
    -r — recursive
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
