<?php
$manual = <<<EOT
NAME
    more — file perusal filter

SYNOPSIS
    more [FILE]...

DESCRIPTION
    Display text one screenful at a time. Space — next page.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
