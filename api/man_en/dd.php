<?php
$manual = <<<EOT
NAME
    dd — convert and copy a file

SYNOPSIS
    dd if=SOURCE of=DESTINATION

DESCRIPTION
    Low-level copy.
    bs= — block size
    count= — number of blocks
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
