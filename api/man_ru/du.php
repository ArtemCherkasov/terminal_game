<?php
$manual = <<<EOT
ИМЯ
    du — размер каталога

СИНТАКСИС
    du [ОПЦИИ]... [ФАЙЛ]...

ОПИСАНИЕ
    Оценивает размер файлов и каталогов.
    -sh — суммарный размер каталога
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);