<?php
$manual = <<<EOT
ИМЯ
    comm — сравнить отсортированные файлы

СИНТАКСИС
    comm [ОПЦИИ]... ФАЙЛ1 ФАЙЛ2

ОПИСАНИЕ
    Показывает общие и уникальные строки двух файлов.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);