<?php
$manual = <<<EOT
ИМЯ
    stat — статус файла

СИНТАКСИС
    stat [ОПЦИИ] ФАЙЛ

ОПИСАНИЕ
    Подробная информация о файле: размер, права, время.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);