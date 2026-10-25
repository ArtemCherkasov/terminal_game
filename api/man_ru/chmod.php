<?php
$manual = <<<EOT
ИМЯ
    chmod — изменить права доступа

СИНТАКСИС
    chmod [ОПЦИИ]... РЕЖИМ ФАЙЛ...

ОПИСАНИЕ
    Изменяет права доступа. Режим: u+r, g-w, o= или 755.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);