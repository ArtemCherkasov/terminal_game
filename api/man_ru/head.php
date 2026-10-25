<?php
$manual = <<<EOT
ИМЯ
    head — первые строки файла

СИНТАКСИС
    head [ОПЦИИ]... [ФАЙЛ]...

ОПИСАНИЕ
    Выводит первые 10 строк файла.
    -n ЧИСЛО — указать количество строк
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);