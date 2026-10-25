<?php
$manual = <<<EOT
ИМЯ
    netstat — сетевые соединения

СИНТАКСИС
    netstat [ОПЦИИ]

ОПИСАНИЕ
    Показывает сетевые соединения, таблицы маршрутизации.
    -tlnp — открытые порты
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);