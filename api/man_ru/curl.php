<?php
$manual = <<<EOT
ИМЯ
    curl — передача данных по URL

СИНТАКСИС
    curl [ОПЦИИ]... URL

ОПИСАНИЕ
    Отправляет HTTP/HTTPS запросы.
    -X — метод (GET, POST)
    -d — данные запроса
    -O — сохранить в файл
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);