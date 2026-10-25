<?php
$manual = <<<EOT
ИМЯ
    tee — читать stdin и записывать в stdout и файлы

СИНТАКСИС
    tee [ОПЦИИ]... [ФАЙЛ]...

ОПИСАНИЕ
    Дублирует ввод и вывод.
    -a — добавить к файлу
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);