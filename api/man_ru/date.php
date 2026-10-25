<?php
$manual = <<<EOT
ИМЯ
    date — показать/установить дату

СИНТАКСИС
    date [ФОРМАТ]

ОПИСАНИЕ
    Выводит или устанавливает системную дату.
    '+%Y-%m-%d' — формат вывода
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);