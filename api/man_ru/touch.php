<?php
$manual = <<<EOT
ИМЯ
    touch — обновить время файла или создать пустой

СИНТАКСИС
    touch [ОПЦИИ]... ФАЙЛ...

ОПИСАНИЕ
    Создаёт пустой файл или обновляет временные метки.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);