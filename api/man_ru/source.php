<?php
$manual = <<<EOT
ИМЯ
    source — выполнить скрипт в текущей оболочке

СИНТАКСИС
    source ФАЙЛ

ОПИСАНИЕ
    Выполняет команды из файла в текущем shell.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);