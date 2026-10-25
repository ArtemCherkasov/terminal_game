<?php
$manual = <<<EOT
NAME
    ln — make links between files

SYNOPSIS
    ln [OPTION]... SOURCE DESTINATION

DESCRIPTION
    Create hard or symbolic links.
    -s — symbolic link
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
