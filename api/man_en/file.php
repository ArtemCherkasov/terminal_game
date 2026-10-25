<?php
$manual = <<<EOT
NAME
    file — determine file type

SYNOPSIS
    file [OPTION] FILE

DESCRIPTION
    Determine file type (text, binary, image).
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
