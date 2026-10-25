<?php
$manual = <<<EOT
ИМЯ
    env — переменные окружения

СИНТАКСИС
    env [ОПЦИИ]

ОПИСАНИЕ
    Показывает все переменные окружения.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);