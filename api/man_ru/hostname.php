<?php
$manual = <<<EOT
ИМЯ
    hostname — имя хоста

СИНТАКСИС
    hostname [ИМЯ]

ОПИСАНИЕ
    Показывает или устанавливает имя хоста.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);