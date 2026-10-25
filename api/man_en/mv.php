<?php
$manual = <<<EOT
NAME
    mv — move (rename) files

SYNOPSIS
    mv [OPTION]... SOURCE DESTINATION

DESCRIPTION
    Move or rename files.
    -i — prompt before overwrite
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
