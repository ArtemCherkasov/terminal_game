<?php
$manual = <<<EOT
ИМЯ
    at — запуск задачи в указанное время

СИНТАКСИС
    at ВРЕМЯ

ОПИСАНИЕ
    Выполняет команду в указанное время.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);