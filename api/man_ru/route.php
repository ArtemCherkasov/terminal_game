<?php
$manual = <<<EOT
ИМЯ
    route — таблица маршрутизации

СИНТАКСИС
    route [ОПЦИИ]

ОПИСАНИЕ
    Показывает и управляет таблицей маршрутизации.
    -n — числовой формат
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);