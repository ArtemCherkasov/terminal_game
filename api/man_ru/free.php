<?php
$manual = <<<EOT
ИМЯ
    free — использование памяти

СИНТАКСИС
    free [ОПЦИИ]

ОПИСАНИЕ
    Показывает RAM и swap.
    -h — человеко-читаемый формат
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);