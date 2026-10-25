<?php
$manual = <<<EOT
NAME
    crontab — maintain crontab files for individual users

SYNOPSIS
    crontab [OPTION]

DESCRIPTION
    Manage cron jobs.
    -e — edit
    -l — list
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);
