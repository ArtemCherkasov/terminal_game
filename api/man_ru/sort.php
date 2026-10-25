<?php
$manual = <<<EOT
ИМЯ
    sort — сортировка строк

СИНТАКСИС
    sort [ОПЦИИ]... [ФАЙЛ]...

ОПИСАНИЕ
    Сортирует строки в алфавитном порядке.
    -r — обратный порядок
    -n — числовая сортировка
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);