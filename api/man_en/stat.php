<?php
$manual = <<<EOT
NAME
    stat — display file or file system status

SYNOPSIS
    stat [OPTION] FILE

DESCRIPTION
    Detailed file info: size, permissions, timestamps.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
