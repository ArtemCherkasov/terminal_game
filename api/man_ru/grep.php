<?php
$manual = <<<EOT
ИМЯ
    grep — поиск по шаблону в файлах

СИНТАКСИС
    grep [ОПЦИИ]... ШАБЛОН [ФАЙЛ]...

ОПИСАНИЕ
    Ищет строки, соответствующие шаблону.
    -i — игнорировать регистр
    -r — рекурсивный поиск
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);