<?php
$manual = <<<EOT
ИМЯ
    groups — группы пользователя

СИНТАКСИС
    groups [ПОЛЬЗОВАТЕЛЬ]

ОПИСАНИЕ
    Показывает группы указанного пользователя.
EOT;
echo json_encode(["content" => $manual], JSON_UNESCAPED_UNICODE);