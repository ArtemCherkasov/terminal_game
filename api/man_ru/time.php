<?php
$manual = <<<EOT
ИМЯ
    time — время выполнения команды

СИНТАКСИС
    time КОМАНДА

ОПИСАНИЕ
    Показывает время выполнения команды.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);