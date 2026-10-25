<?php
$manual = <<<EOT
ИМЯ
    find — поиск файлов

СИНТАКСИС
    find [ПУТЬ...] [ВЫРАЖЕНИЕ]

ОПИСАНИЕ
    Ищет файлы по различным критериям.
    -name — по имени
    -type — по типу (f/d)
    -size — по размеру
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);