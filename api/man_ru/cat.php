<?php
$manual = <<<EOT
ИМЯ
    cat — объединить и вывести файлы

СИНТАКСИС
    cat [ФАЙЛ]...

ОПИСАНИЕ
    Читает файлы и выводит их содержимое.
    -n — нумеровать строки
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);