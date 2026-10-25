<?php
$manual = <<<EOT
NAME
    cal — display a calendar

SYNOPSIS
    cal [MONTH] [YEAR]

DESCRIPTION
    Display a monthly calendar.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
