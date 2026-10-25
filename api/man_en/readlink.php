<?php
$manual = <<<EOT
NAME
    readlink — print value of a symbolic link

SYNOPSIS
    readlink [OPTION] LINK

DESCRIPTION
    Show the target of a symbolic link.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
