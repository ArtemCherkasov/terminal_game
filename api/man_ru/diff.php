<?php
$manual = <<<EOT
ИМЯ
    diff — сравнить файлы

СИНТАКСИС
    diff [ОПЦИИ]... ФАЙЛ1 ФАЙЛ2

ОПИСАНИЕ
    Показывает различия между файлами построчно.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);