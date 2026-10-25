<?php
$manual = <<<EOT
ИМЯ
    dig — детальный DNS-запрос

СИНТАКСИС
    dig [ХОСТ] [ТИП_ЗАПИСИ]

ОПИСАНИЕ
    Выполняет детальный DNS-запрос.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);