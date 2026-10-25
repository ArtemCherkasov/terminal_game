<?php
$manual = <<<EOT
NAME
    less — opposite of more

SYNOPSIS
    less [FILE]...

DESCRIPTION
    Page through a text file.
    q — quit, Space — next page, b — previous page
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
