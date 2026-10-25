<?php
$manual = <<<EOT
ИМЯ
    file — определить тип файла

СИНТАКСИС
    file [ОПЦИИ] ФАЙЛ

ОПИСАНИЕ
    Определяет тип файла (текст, бинарный, изображение).
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);