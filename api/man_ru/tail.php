<?php
$manual = <<<EOT
ИМЯ
    tail — последние строки файла

СИНТАКСИС
    tail [ОПЦИИ]... [ФАЙЛ]...

ОПИСАНИЕ
    Выводит последние 10 строк файла.
    -f — следить за изменениями файла
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);