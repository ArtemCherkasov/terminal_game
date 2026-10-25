<?php
$manual = <<<EOT
ИМЯ
    dmesg — сообщения ядра

СИНТАКСИС
    dmesg [ОПЦИИ]

ОПИСАНИЕ
    Выводит сообщения буфера ядра.
    -H — человеко-читаемый формат
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);