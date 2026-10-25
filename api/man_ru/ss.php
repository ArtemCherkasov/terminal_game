<?php
$manual = <<<EOT
ИМЯ
    ss — статистика сокетов

СИНТАКСИС
    ss [ОПЦИИ]

ОПИСАНИЕ
    Современная замена netstat.
    -tlnp — открытые TCP порты
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);