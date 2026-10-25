<?php
$manual = <<<EOT
ИМЯ
    df — свободное место на дисках

СИНТАКСИС
    df [ОПЦИИ]... [ФАЙЛ]

ОПИСАНИЕ
    Показывает использование дискового пространства.
    -h — человеко-читаемый формат
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);