<?php
$manual = <<<EOT
NAME
    basename — strip directory and suffix from filenames

SYNOPSIS
    basename PATH

DESCRIPTION
    Extract the filename from a full path.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
