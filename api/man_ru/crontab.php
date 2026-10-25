<?php
$manual = <<<EOT
ИМЯ
    crontab — планировщик задач cron

СИНТАКСИС
    crontab [ОПЦИИ]

ОПИСАНИЕ
    Управляет задачами cron.
    -e — редактировать
    -l — список задач
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);