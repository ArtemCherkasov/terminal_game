<?php
$manual = <<<EOT
ИМЯ
    last — история входов в систему

СИНТАКСИС
    last [ОПЦИИ]... [ПОЛЬЗОВАТЕЛЬ]

ОПИСАНИЕ
    Показывает историю входов и выходов.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);