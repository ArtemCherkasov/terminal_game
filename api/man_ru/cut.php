<?php
$manual = <<<EOT
ИМЯ
    cut — вырезать поля из строк

СИНТАКСИС
    cut ОПЦИИ... [ФАЙЛ]...

ОПИСАНИЕ
    Вырезает указанные поля из каждой строки.
    -d — разделитель
    -f — номера полей
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);