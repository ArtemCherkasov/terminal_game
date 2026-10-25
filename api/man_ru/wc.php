<?php
$manual = <<<EOT
ИМЯ
    wc — подсчёт строк, слов и символов

СИНТАКСИС
    wc [ОПЦИИ]... [ФАЙЛ]...

ОПИСАНИЕ
    Подсчитывает количество строк, слов и байт.
    -l — только строки
    -w — только слова
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);